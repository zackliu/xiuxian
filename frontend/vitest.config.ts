import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const withSrc = (sub: string) => resolve(__dirname, './src', sub);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      reportsDirectory: './coverage'
    }
  },
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
  }
});
