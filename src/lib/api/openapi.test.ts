import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const { generateOpenApiSpec } = await import('./openapi')

describe('generateOpenApiSpec', () => {
  // Single generation, reused — spec is deterministic, no need to
  // re-run the generator inside each test.
  const spec = generateOpenApiSpec()

  it('produces a valid OpenAPI 3.1 document', () => {
    expect(spec.openapi).toBe('3.1.0')
    expect(spec.info.title).toBe('AryTrano API')
    expect(spec.info.version).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('documents the Tier-1 mobile endpoints', () => {
    const paths = Object.keys(spec.paths ?? {})
    expect(paths).toContain('/api/v1/cities')
    expect(paths).toContain('/api/v1/cities/{slug}/neighborhoods')
    expect(paths).toContain('/api/v1/contact/{listingId}')
    expect(paths).toContain('/api/v1/users/me/saved-searches')
    expect(paths).toContain('/api/v1/listings')
    expect(paths).toContain('/api/v1/listings/{id}')
    expect(paths).toContain('/api/v1/favorites')
    expect(paths).toContain('/api/v1/users/me')
  })

  it('documents the auth flow', () => {
    const paths = Object.keys(spec.paths ?? {})
    expect(paths).toContain('/api/v1/auth/register')
    expect(paths).toContain('/api/v1/auth/login')
    expect(paths).toContain('/api/v1/auth/refresh')
    expect(paths).toContain('/api/v1/auth/forgot-password')
    expect(paths).toContain('/api/v1/auth/reset-password')
  })

  it('declares the bearer auth scheme', () => {
    const schemes = spec.components?.securitySchemes
    expect(schemes).toBeDefined()
    expect(schemes?.bearerAuth).toMatchObject({ type: 'http', scheme: 'bearer' })
  })

  it('registers reusable schemas', () => {
    const schemas = spec.components?.schemas
    expect(schemas).toBeDefined()
    expect(schemas?.ApiError).toBeDefined()
    expect(schemas?.City).toBeDefined()
    expect(schemas?.PublicListingCard).toBeDefined()
    expect(schemas?.Me).toBeDefined()
    expect(schemas?.SavedSearch).toBeDefined()
  })
})
