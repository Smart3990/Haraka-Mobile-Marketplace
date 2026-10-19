import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { legacyCssPlugins } from './legacy-css.mjs';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    // Also run on older phones (Android WebView/Chrome 70+, iOS Safari 12+); newer syntax is rewritten
    build: { target: ['chrome70', 'safari12', 'firefox78', 'edge79'] },
    // Tailwind runs through @tailwindcss/vite here; postcss.config.mjs is only for the Expo bundler.
    // The legacy plugins make the generated styles work on older phones (see legacy-css.mjs).
    css: { postcss: { plugins: legacyCssPlugins() } },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
