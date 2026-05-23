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

function ticket(id: string): { status: 'ok'; id: string } {
  return { status: 'ok', id }
}

describe('sendPush', () => {
  it('no-ops on an empty messages array', async () => {
    const result = await sendPush([])
    expect(result).toEqual({ accepted: 0, rejected: 0, tickets: [] })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts a single batch when ≤ 100 messages and returns ticket ids', async () => {
    fetchMock.mockResolvedValueOnce(okResponse([ticket('r1'), ticket('r2')]))
    const result = await sendPush([
      { to: 'ExponentPushToken[A]', title: 'a' },
      { to: 'ExponentPushToken[B]', title: 'b' },
    ])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(result.accepted).toBe(2)
    expect(result.rejected).toBe(0)
    expect(result.tickets).toEqual([
      { to: 'ExponentPushToken[A]', ticketId: 'r1' },
      { to: 'ExponentPushToken[B]', ticketId: 'r2' },
    ])
  })

  it('splits into 100-message batches', async () => {
    fetchMock.mockResolvedValue(
      okResponse(
        Array.from({ length: 100 }, (_, i) => ticket(`r${i}`)),
      ),
    )
    const messages = Array.from({ length: 250 }, (_, i) => ({
      to: `ExponentPushToken[T${i}]`,
    }))
    await sendPush(messages)
    // 250 / 100 = 3 batches (100 + 100 + 50)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('counts tickets with status=error as rejected and omits them from tickets[]', async () => {
    fetchMock.mockResolvedValueOnce(
      okResponse([
        ticket('r1'),
        { status: 'error' },
        ticket('r3'),
      ]),
    )
    const result = await sendPush([
      { to: 'ExponentPushToken[A]' },
      { to: 'ExponentPushToken[B]' },
      { to: 'ExponentPushToken[C]' },
    ])
    expect(result.accepted).toBe(2)
    expect(result.rejected).toBe(1)
    expect(result.tickets).toHaveLength(2)
    // The error-row was the middle message — verify the mapping
    // didn't shift (A → r1, C → r3, NOT B → r3).
    expect(result.tickets).toEqual([
      { to: 'ExponentPushToken[A]', ticketId: 'r1' },
      { to: 'ExponentPushToken[C]', ticketId: 'r3' },
    ])
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
    expect(result).toEqual({ accepted: 0, rejected: 2, tickets: [] })
  })

  it('treats fetch rejection (network) as full batch rejection', async () => {
    fetchMock.mockRejectedValueOnce(new Error('ENETUNREACH'))
    const result = await sendPush([
      { to: 'ExponentPushToken[A]' },
      { to: 'ExponentPushToken[B]' },
    ])
    expect(result).toEqual({ accepted: 0, rejected: 2, tickets: [] })
  })

  it('does not attach Authorization header when EXPO_ACCESS_TOKEN is unset', async () => {
    fetchMock.mockResolvedValueOnce(okResponse([ticket('r1')]))
    await sendPush([{ to: 'ExponentPushToken[A]' }])
    const [, init] = fetchMock.mock.calls[0]!
    const headers = (init as RequestInit).headers as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
    expect(headers['Content-Type']).toBe('application/json')
  })
})
