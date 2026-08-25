import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        autocomplete: resolve(__dirname, 'index.html'),
        instantsearch: resolve(__dirname, 'instantsearch.html'),
        product: resolve(__dirname, 'product.html'),
      },
    },
  },
});
