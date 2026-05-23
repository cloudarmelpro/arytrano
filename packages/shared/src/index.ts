/**
 * `@arytrano/shared` — single source of truth for the API contract
 * between `apps/web` and `apps/mobile`.
 *
 * Re-exports everything as named bindings. No default exports so the
 * tree-shaking story stays clean for the mobile bundle (every byte
 * matters on a 3G connection).
 *
 * Side-effect free : no `import 'server-only'`, no Prisma, no Next.js
 * helpers. Pure TS + Zod.
 */

export * from './types/api'
export * from './schemas/auth'
export * from './schemas/listing'
export * from './schemas/contact'
export * from './schemas/city'
export * from './schemas/saved-search'
