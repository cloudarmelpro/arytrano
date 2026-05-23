import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env', () => ({
  env: { EXPO_ACCESS_TOKEN: undefined },
}))

const { sendPush } = await import('./send-push')

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  ;(globalThis as { fetch: typeof fetch }).fetch =
    fetchMock as unknown as typeof fetch
})

function okResponse(tickets: Array<{ status: 'ok' | 'error'; id?: string }>) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ data: tickets }),
  } as Response
}

describe('sendPush', () => {
  it('no-ops on an empty messages array', async () => {
    const result = await sendPush([])
    expect(result).toEqual({ accepted: 0, rejected: 0 })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts a single batch when ≤ 100 messages', async () => {
    fetchMock.mockResolvedValueOnce(
      okResponse([
        { status: 'ok', id: 'r1' },
        { status: 'ok', id: 'r2' },
      ]),
    )
    const result = await sendPush([
      { to: 'ExponentPushToken[A]', title: 'a' },
      { to: 'ExponentPushToken[B]', title: 'b' },
    ])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ accepted: 2, rejected: 0 })
  })

  it('splits into 100-message batches', async () => {
    fetchMock.mockResolvedValue(
      okResponse(Array.from({ length: 100 }, () => ({ status: 'ok' as const }))),
    )
    const messages = Array.from({ length: 250 }, (_, i) => ({
      to: `ExponentPushToken[T${i}]`,
    }))
    await sendPush(messages)
    // 250 / 100 = 3 batches (100 + 100 + 50)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('counts tickets with status=error as rejected', async () => {
    fetchMock.mockResolvedValueOnce(
      okResponse([
        { status: 'ok' },
        { status: 'error' },
        { status: 'ok' },
      ]),
    )
    const result = await sendPush([
      { to: 'ExponentPushToken[A]' },
      { to: 'ExponentPushToken[B]' },
      { to: 'ExponentPushToken[C]' },
    ])
    expect(result).toEqual({ accepted: 2, rejected: 1 })
  })

  it('treats non-2xx HTTP as full batch rejection', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => null,
    } as Response)
    const result = await sendPush([
      { to: 'ExponentPushToken[A]' },
      { to: 'ExponentPushToken[B]' },
    ])
    expect(result).toEqual({ accepted: 0, rejected: 2 })
  })

  it('treats fetch rejection (network) as full batch rejection', async () => {
    fetchMock.mockRejectedValueOnce(new Error('ENETUNREACH'))
    const result = await sendPush([
      { to: 'ExponentPushToken[A]' },
      { to: 'ExponentPushToken[B]' },
    ])
    expect(result).toEqual({ accepted: 0, rejected: 2 })
  })

  it('does not attach Authorization header when EXPO_ACCESS_TOKEN is unset', async () => {
    fetchMock.mockResolvedValueOnce(okResponse([{ status: 'ok' }]))
    await sendPush([{ to: 'ExponentPushToken[A]' }])
    const [, init] = fetchMock.mock.calls[0]!
    const headers = (init as RequestInit).headers as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
    expect(headers['Content-Type']).toBe('application/json')
  })
})
