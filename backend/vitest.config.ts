import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      reportsDirectory: './coverage'
    }
  },
  resolve: {
    alias: {
      '@xiuxian/shared': resolve(__dirname, '../shared/src')
    }
  }
});
