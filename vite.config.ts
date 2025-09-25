import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 8080,
    host: '::',
    strictPort: true,
    proxy: process.env.VITE_API_PROXY_TARGET
      ? {
          '/api': {
            target: process.env.VITE_API_PROXY_TARGET,
            changeOrigin: true,
          },
        }
      : undefined,
    // Enable better debugging connection
    hmr: {
      port: 8080,
    },
    // Enable source maps for debugging
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  // Enable better debugging
  build: {
    sourcemap: true,
  },
  // Enable CSS source maps
  css: {
    devSourcemap: true,
  }
});
