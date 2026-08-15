import { describe, it, expect, vi } from 'vitest'
import type { Pool, PoolClient } from 'pg'
import { withTransaction } from './transaction.js'

// Client/pool giả tối giản — chỉ cần đúng 3 phương thức withTransaction() thực sự gọi tới
// (connect/query/release), không kéo theo kết nối Postgres thật.
function makeFakeClient() {
  return {
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    release: vi.fn(),
  }
}

function makeFakePool(client: ReturnType<typeof makeFakeClient>) {
  return { connect: vi.fn().mockResolvedValue(client) } as unknown as Pool
}

describe('withTransaction', () => {
  it('chạy đúng trình tự begin → fn → commit khi fn thành công', async () => {
    const client = makeFakeClient()
    const pool = makeFakePool(client)
    const calls: string[] = []

    const result = await withTransaction(pool, async (c) => {
      calls.push('fn')
      await c.query('insert into t values (1)')
      return 'ok'
    })

    expect(result).toBe('ok')
    expect(client.query.mock.calls.map((c) => c[0])).toEqual([
      'begin',
      'insert into t values (1)',
      'commit',
    ])
    expect(calls).toEqual(['fn'])
  })

  it('fn ném lỗi → rollback rồi ném LẠI lỗi gốc (giữ nguyên message)', async () => {
    const client = makeFakeClient()
    const pool = makeFakePool(client)
    const boom = new Error('lỗi nghiệp vụ: key đã tồn tại')

    await expect(
      withTransaction(pool, async () => {
        throw boom
      }),
    ).rejects.toBe(boom)

    expect(client.query.mock.calls.map((c) => c[0])).toEqual(['begin', 'rollback'])
  })

  it('LUÔN release() connection, kể cả khi fn lỗi', async () => {
    const client = makeFakeClient()
    const pool = makeFakePool(client)

    await withTransaction(pool, async (c) => {
      await c.query('select 1')
    })
    expect(client.release).toHaveBeenCalledTimes(1)

    const client2 = makeFakeClient()
    const pool2 = makeFakePool(client2)
    await expect(
      withTransaction(pool2, async () => {
        throw new Error('x')
      }),
    ).rejects.toThrow('x')
    expect(client2.release).toHaveBeenCalledTimes(1)
  })

  it('rollback tự nó lỗi (mất kết nối giữa chừng) → vẫn ném lỗi NGHIỆP VỤ gốc, không phải lỗi rollback', async () => {
    const client = makeFakeClient()
    client.query.mockImplementation((sql: string) => {
      if (sql === 'begin') return Promise.resolve({ rows: [], rowCount: 0 })
      if (sql === 'rollback') return Promise.reject(new Error('connection lost'))
      return Promise.resolve({ rows: [], rowCount: 0 })
    })
    const pool = makeFakePool(client)
    const businessError = new Error('lỗi nghiệp vụ gốc')

    await expect(
      withTransaction(pool, async () => {
        throw businessError
      }),
    ).rejects.toBe(businessError)
    expect(client.release).toHaveBeenCalledTimes(1)
  })

  it('trả đúng kiểu giá trị fn trả ra (không bọc thêm)', async () => {
    const client = makeFakeClient()
    const pool = makeFakePool(client)
    const result = await withTransaction(pool, async () => ({ id: 42, ok: true }))
    expect(result).toEqual({ id: 42, ok: true })
  })

  it('fn dùng đúng client được cấp — không tự ý gọi pool.query() song song', async () => {
    const client = makeFakeClient()
    const pool = makeFakePool(client)
    let seenClient: PoolClient | undefined
    await withTransaction(pool, async (c) => {
      seenClient = c
    })
    expect(seenClient).toBe(client)
  })
})
