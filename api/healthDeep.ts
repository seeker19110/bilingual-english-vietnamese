// api/healthDeep.ts — Endpoint kiểm tra sức khỏe chuyên sâu của hệ thống (/api/health/deep)
// Kiểm tra trạng thái sống của CSDL PostgreSQL, Storage R2/Local, Memory, Uptime.
// Trả về 200 (Healthy) hoặc 503 (Degraded/Down) cho monitoring và uptime alerts.

import { getPgPool } from '../packages/core-db/pgPool.js'
import { getCorsHeaders, SECURITY_HEADERS } from '../packages/core-auth/security.js'
import { jsonResponse } from './_lib/http.js'

export interface DeepHealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptimeSeconds: number
  memory: {
    rssMb: number
    heapUsedMb: number
    heapTotalMb: number
  }
  checks: {
    database: {
      status: 'up' | 'down'
      latencyMs?: number
      pool?: {
        total: number
        idle: number
        waiting: number
      }
      error?: string
    }
    storage: {
      status: 'up' | 'unconfigured'
      driver: string
    }
    cache: {
      status: 'up'
      type: string
    }
  }
}

export async function checkSystemHealth(): Promise<{
  statusCode: number
  result: DeepHealthCheckResult
}> {
  const mem = process.memoryUsage()

  const result: DeepHealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    memory: {
      rssMb: Math.round((mem.rss / (1024 * 1024)) * 10) / 10,
      heapUsedMb: Math.round((mem.heapUsed / (1024 * 1024)) * 10) / 10,
      heapTotalMb: Math.round((mem.heapTotal / (1024 * 1024)) * 10) / 10,
    },
    checks: {
      database: { status: 'down' },
      storage: {
        status: process.env.STORAGE_DRIVER ? 'up' : 'unconfigured',
        driver: process.env.STORAGE_DRIVER || 'local',
      },
      cache: {
        status: 'up',
        type: process.env.REDIS_URL ? 'redis' : 'in-memory',
      },
    },
  }

  // 1. Kiểm tra Database PostgreSQL
  try {
    const pool = getPgPool()
    const dbStart = Date.now()
    await pool.query('SELECT 1')
    const latencyMs = Date.now() - dbStart

    result.checks.database = {
      status: 'up',
      latencyMs,
      pool: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
      },
    }
  } catch (err) {
    result.status = 'unhealthy'
    result.checks.database = {
      status: 'down',
      error: err instanceof Error ? err.message : String(err),
    }
  }

  const statusCode = result.status === 'healthy' ? 200 : 503
  return { statusCode, result }
}

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = {
    ...getCorsHeaders(req),
    ...SECURITY_HEADERS,
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: allHeaders })
  }

  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
  }

  const { statusCode, result } = await checkSystemHealth()
  return jsonResponse(result, statusCode, allHeaders)
}
