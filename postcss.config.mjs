// Used by the Expo (Metro) bundler; the Vite web build uses @tailwindcss/vite instead.
// The legacy plugins run after Tailwind so the styles also work on older phones (see legacy-css.mjs).
import tailwindcss from '@tailwindcss/postcss';
import { legacyCssPlugins } from './legacy-css.mjs';

export default {
  plugins: [tailwindcss(), ...legacyCssPlugins()],
};
