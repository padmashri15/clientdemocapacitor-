import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    fs: {
      strict: false,
      allow: ['..']
    },
    middlewareMode: false
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  // Explicitly configure static file serving
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.gif', '**/*.svg'],
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});