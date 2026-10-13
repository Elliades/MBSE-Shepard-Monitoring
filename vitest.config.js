import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/poc/**/*.test.js', 'src/discover/**/*.test.js'],
  },
})
