import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const withSrc = (sub: string) => resolve(__dirname, './src', sub);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@api': withSrc('api'),
      '@components': withSrc('components'),
      '@pages': withSrc('pages'),
      '@state': withSrc('state'),
      '@styles': withSrc('styles'),
      '@hooks': withSrc('hooks')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  }
});
