// api/healthDeep.test.ts — Unit test cho /api/health/deep endpoint

import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler, { checkSystemHealth } from './healthDeep.js'
import * as pgPoolModule from '../packages/core-db/pgPool.js'

describe('Deep Health Check API (/api/health/deep)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('trả về 200 và healthy khi database query SELECT 1 thành công', async () => {
    vi.spyOn(pgPoolModule, 'getPgPool').mockReturnValue({
      query: vi.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
      totalCount: 5,
      idleCount: 4,
      waitingCount: 0,
    } as unknown as ReturnType<typeof pgPoolModule.getPgPool>)

    const { statusCode, result } = await checkSystemHealth()

    expect(statusCode).toBe(200)
    expect(result.status).toBe('healthy')
    expect(result.checks.database.status).toBe('up')
    expect(result.checks.database.pool?.total).toBe(5)
    expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0)
    expect(result.memory.rssMb).toBeGreaterThan(0)
  })

  it('trả về 503 và unhealthy khi database query bị lỗi', async () => {
    vi.spyOn(pgPoolModule, 'getPgPool').mockReturnValue({
      query: vi.fn().mockRejectedValue(new Error('Connection terminated unexpectedly')),
      totalCount: 0,
      idleCount: 0,
      waitingCount: 0,
    } as unknown as ReturnType<typeof pgPoolModule.getPgPool>)

    const { statusCode, result } = await checkSystemHealth()

    expect(statusCode).toBe(503)
    expect(result.status).toBe('unhealthy')
    expect(result.checks.database.status).toBe('down')
    expect(result.checks.database.error).toContain('Connection terminated')
  })

  it('handler phản hồi request GET đúng định dạng JSON', async () => {
    vi.spyOn(pgPoolModule, 'getPgPool').mockReturnValue({
      query: vi.fn().mockResolvedValue({ rows: [] }),
      totalCount: 2,
      idleCount: 2,
      waitingCount: 0,
    } as unknown as ReturnType<typeof pgPoolModule.getPgPool>)

    const req = new Request('http://localhost/api/health/deep', { method: 'GET' })
    const res = await handler(req)

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('application/json')
    expect(res.headers.get('Cache-Control')).toContain('no-store')

    const body = (await res.json()) as { status: string }
    expect(body.status).toBe('healthy')
  })

  it('handler từ chối method không phải GET bằng 405 Method Not Allowed', async () => {
    const req = new Request('http://localhost/api/health/deep', { method: 'POST' })
    const res = await handler(req)

    expect(res.status).toBe(405)
  })
})
