import angular from '@analogjs/vite-plugin-angular';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// `__dirname` is not defined in ESM and Vite 8's native config loader
// emits a deprecation warning when it sees it. Use `import.meta.dirname`
// (available in Node 20.11+) with a Node 18 fallback via `fileURLToPath`.
const projectRoot = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [angular(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(projectRoot),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering
      // during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU
      // during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
