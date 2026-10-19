/**
 * Makes the Tailwind 4 styles work on older phones too (old Android System WebView, iOS 15 and
 * earlier). Tailwind 4 puts every style inside CSS cascade layers and writes colours as oklch();
 * browsers that don't understand those ignore the styles completely, so the app shows up white
 * and unstyled. Modern browsers render exactly the same as before.
 *
 * Used by the website build (vite.config.ts) and the phone app build (postcss.config.mjs).
 */
import postcssPresetEnv from 'postcss-preset-env';

/** Oldest browsers the app should look right on. */
export const LEGACY_BROWSERS = ['chrome >= 70', 'android >= 70', 'safari >= 12', 'ios_saf >= 12', 'samsung >= 10', 'firefox >= 78'];

/**
 * Tailwind sets the default values of its internal variables (shadows, borders, transforms) with
 * @property, and repeats them in a block that it only gives to some old browsers. Give that block
 * to every browser, so older Chrome-based WebViews get the defaults too (harmless for new ones).
 */
const tailwindDefaultsForAll = () => ({
  postcssPlugin: 'haraka-tailwind-defaults-for-all',
  AtRule: {
    supports(rule) {
      if (rule.params.includes('margin-trim:inline') || rule.params.includes('margin-trim: inline')) {
        rule.replaceWith(rule.nodes);
      }
    },
  },
});
tailwindDefaultsForAll.postcss = true;

/**
 * Tailwind builds `filter`/`backdrop-filter` from a chain of variables that older engines can't
 * resolve, so blurred glows show as solid shapes. Give those engines (the ones without oklch
 * colour support) a plain value in their own @supports block, which the CSS minifier keeps.
 */
const simpleFilterFallback = () => ({
  postcssPlugin: 'haraka-simple-filter-fallback',
  Rule(rule, { AtRule, Rule }) {
    if (rule.parent?.type === 'atrule' && rule.parent.params.includes('haraka-legacy')) return;
    for (const [varName, prop] of [['--tw-blur', 'filter'], ['--tw-backdrop-blur', 'backdrop-filter']]) {
      let value = null;
      rule.walkDecls(varName, (d) => {
        value = d.value;
      });
      if (!value || value === 'initial' || rule.raws.harakaFilterFallback) continue;
      rule.raws.harakaFilterFallback = true;
      const fallback = new AtRule({ name: 'supports', params: 'not (color:oklch(0 0 0)) /* haraka-legacy */' });
      fallback.append(new Rule({ selector: rule.selector }).append({ prop, value }));
      rule.after(fallback);
    }
  },
});
simpleFilterFallback.postcss = true;

/**
 * Flexbox `gap` only exists since Chrome 84 / Safari 14.1, so on older engines icons touch their
 * labels. For engines without `aspect-ratio` (a close proxy for missing flex gap), space the
 * children of `flex … gap-*` containers with margins instead.
 */
const flexGapFallback = () => {
  const rules = [];
  return {
    postcssPlugin: 'haraka-flex-gap-fallback',
    Rule(rule) {
      const parent = rule.parent;
      if (!(parent?.type === 'root' || (parent?.type === 'atrule' && parent.name === 'layer'))) return;
      const m = /^\.(gap(?:-[xy])?-[^\s:,]+)(?::not\(#\\#\))*$/.exec(rule.selector);
      if (!m) return;
      let value = null;
      let axis = null;
      rule.walkDecls(/^(gap|column-gap|row-gap)$/, (d) => {
        value = d.value;
        axis = d.prop === 'gap' ? 'both' : d.prop === 'column-gap' ? 'x' : 'y';
      });
      if (value) rules.push({ cls: `.${m[1]}`, value, axis });
    },
    OnceExit(root, { AtRule }) {
      if (!rules.length) return;
      const block = new AtRule({ name: 'supports', params: 'not (aspect-ratio:1/1)' });
      for (const { cls, value, axis } of rules) {
        if (axis !== 'y') block.append({ selector: `.flex${cls}:not(.flex-col)>*+*:not(.ml-auto):not(.mx-auto),.inline-flex${cls}:not(.flex-col)>*+*:not(.ml-auto):not(.mx-auto)`, nodes: [] }).last.append({ prop: 'margin-left', value });
        if (axis !== 'x') block.append({ selector: `.flex-col${cls}>*+*:not(.mt-auto):not(.my-auto)`, nodes: [] }).last.append({ prop: 'margin-top', value });
      }
      root.append(block);
    },
  };
};
flexGapFallback.postcss = true;

/**
 * Tailwind gradients interpolate "in oklab", which older engines reject, so the whole gradient
 * disappears (e.g. white text on a white banner). Give those engines a plain direction instead.
 */
const gradientFallback = () => ({
  postcssPlugin: 'haraka-gradient-fallback',
  Declaration: {
    '--tw-gradient-position'(decl, { AtRule, Rule }) {
      const rule = decl.parent;
      if (!rule || rule.type !== 'rule' || !/ in (oklab|oklch|srgb)/.test(decl.value) || rule.raws.harakaGradientFallback) return;
      if (rule.parent?.type === 'atrule' && rule.parent.params.includes('haraka-legacy')) return;
      rule.raws.harakaGradientFallback = true;
      const value = decl.value.replace(/\s*in (oklab|oklch|srgb)/, '').trim() || 'to bottom';
      const fallback = new AtRule({ name: 'supports', params: 'not (color:oklch(0 0 0)) /* haraka-legacy */' });
      fallback.append(new Rule({ selector: rule.selector }).append({ prop: '--tw-gradient-position', value }));
      rule.after(fallback);
    },
  },
});
gradientFallback.postcss = true;

export function legacyCssPlugins() {
  return [
    tailwindDefaultsForAll(),
    simpleFilterFallback(),
    gradientFallback(),
    flexGapFallback(),
    postcssPresetEnv({
      browsers: LEGACY_BROWSERS,
      stage: 2,
      // Keep the modern value too, so new browsers still use it
      preserve: true,
      features: {
        'cascade-layers': true,
        'oklab-function': { preserve: true },
        'color-mix': { preserve: true },
        'nesting-rules': true,
        'logical-properties-and-values': { dir: 'ltr' },
      },
      autoprefixer: { flexbox: 'no-2009' },
    }),
  ];
}
