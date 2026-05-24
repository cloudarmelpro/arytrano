import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const { escapeLike } = await import('./like-escape')

describe('escapeLike', () => {
  it('passes plain text through unchanged', () => {
    expect(escapeLike('hello world')).toBe('hello world')
    expect(escapeLike('studio meublé')).toBe('studio meublé')
  })

  it('escapes the % wildcard', () => {
    expect(escapeLike('50%')).toBe('50\\%')
    expect(escapeLike('%%%')).toBe('\\%\\%\\%')
  })

  it('escapes the _ wildcard', () => {
    expect(escapeLike('a_b')).toBe('a\\_b')
  })

  it('escapes backslash FIRST so added escapes are not double-escaped', () => {
    expect(escapeLike('\\')).toBe('\\\\')
    expect(escapeLike('a\\%b')).toBe('a\\\\\\%b')
  })

  it('combines all three correctly', () => {
    expect(escapeLike('100%_test\\done')).toBe('100\\%\\_test\\\\done')
  })
})
