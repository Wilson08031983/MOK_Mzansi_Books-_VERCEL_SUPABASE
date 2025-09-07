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
    port: 8082,
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
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});
