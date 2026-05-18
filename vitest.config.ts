import { defineConfig } from 'vitest/config'
import path from 'node:path'

/**
 * Vitest config — pure unit tests for `lib/` and feature `services/` +
 * `schemas/`. No DOM environment yet (no component tests), no DB. When we
 * start covering services that touch Prisma we'll either spin up a
 * test container or stub the client per-test. Keep this config small
 * until those needs land.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Keep tests isolated — services rely on module-level singletons
    // (rate limit, Prisma client) so cross-test state would leak.
    isolate: true,
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/features/**/services/**', 'src/features/**/schemas/**'],
      reporter: ['text', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
