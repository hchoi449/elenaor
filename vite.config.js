import { defineConfig } from 'vite';

// Henry Choi: this Vite setup is used to run the site locally during development.
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
