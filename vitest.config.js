import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,                
    environment: 'node',          
    include: ['src/tests/**/*.test.ts'],
    exclude: ['dist', 'node_modules', 'generated'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    setupFiles: ['./src/tests/integration/setup.ts']
  },
})