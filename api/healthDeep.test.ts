// api/healthDeep.test.ts — Unit test cho /api/health/deep endpoint

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import handler, { checkSystemHealth } from './healthDeep.js'
import * as pgPoolModule from '../packages/core-db/pgPool.js'

describe('Deep Health Check API (/api/health/deep)', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.restoreAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('trả về 200 và healthy khi database query SELECT 1 thành công', async () => {
    process.env.STORAGE_DRIVER = 'r2'
    process.env.REDIS_URL = 'redis://localhost:6379'

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
    expect(result.checks.storage.status).toBe('up')
    expect(result.checks.storage.driver).toBe('r2')
    expect(result.checks.cache.type).toBe('redis')
    expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0)
    expect(result.memory.rssMb).toBeGreaterThan(0)
  })

  it('xử lý cấu hình mặc định storage local và cache in-memory khi không có env', async () => {
    delete process.env.STORAGE_DRIVER
    delete process.env.REDIS_URL

    vi.spyOn(pgPoolModule, 'getPgPool').mockReturnValue({
      query: vi.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
      totalCount: 1,
      idleCount: 1,
      waitingCount: 0,
    } as unknown as ReturnType<typeof pgPoolModule.getPgPool>)

    const { statusCode, result } = await checkSystemHealth()

    expect(statusCode).toBe(200)
    expect(result.checks.storage.status).toBe('unconfigured')
    expect(result.checks.storage.driver).toBe('local')
    expect(result.checks.cache.type).toBe('in-memory')
  })

  it('trả về 503 và unhealthy khi database query bị lỗi Error instance', async () => {
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

  it('trả về 503 và unhealthy khi database throw chuỗi không phải Error', async () => {
    vi.spyOn(pgPoolModule, 'getPgPool').mockReturnValue({
      query: vi.fn().mockRejectedValue('Fatal string error'),
      totalCount: 0,
      idleCount: 0,
      waitingCount: 0,
    } as unknown as ReturnType<typeof pgPoolModule.getPgPool>)

    const { statusCode, result } = await checkSystemHealth()

    expect(statusCode).toBe(503)
    expect(result.status).toBe('unhealthy')
    expect(result.checks.database.error).toBe('Fatal string error')
  })

  it('handler phản hồi request OPTIONS bằng 204 No Content', async () => {
    const req = new Request('http://localhost/api/health/deep', { method: 'OPTIONS' })
    const res = await handler(req)

    expect(res.status).toBe(204)
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
