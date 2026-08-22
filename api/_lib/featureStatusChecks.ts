// api/_lib/featureStatusChecks.ts — Các hàm kiểm tra "còn sống" cho từng tính năng cốt lõi
// của dự án, dùng cho /api/admin-feature-status (báo trạng thái cho Admin, tự động 2 lần/ngày
// hoặc bấm kiểm tra thủ công).
//
// Nguyên tắc chọn cách kiểm tra: KHÔNG gọi API tốn tiền/sinh nội dung thật (vd không gọi chat
// AI thật, không tạo audio TTS thật) — chỉ gọi endpoint "liệt kê"/"metadata" miễn phí của mỗi
// nhà cung cấp để xác nhận key còn hợp lệ + dịch vụ còn phản hồi. Tính năng nào không có key
// cấu hình thì báo 'unconfigured' (không tính là lỗi, vì dự án cho phép chỉ cần 1 trong nhiều
// provider).

import { getPgPool } from '../../packages/core-db/pgPool.js'

export type FeatureCheckStatus = 'up' | 'down' | 'unconfigured'

export interface FeatureCheckResult {
  key: string
  label: string
  usesApi: boolean
  status: FeatureCheckStatus
  latencyMs?: number
  message?: string
}

async function timed<T>(fn: () => Promise<T>): Promise<{ ms: number; value: T }> {
  const start = Date.now()
  const value = await fn()
  return { ms: Date.now() - start, value }
}

// Gọi fetch với timeout ngắn — một dịch vụ ngoài chậm bất thường cũng nên báo 'down' thay vì
// treo cả lượt kiểm tra (chạy 2 lần/ngày, không cần chờ lâu).
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 8000,
): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(id)
  }
}

async function checkDatabase(): Promise<FeatureCheckResult> {
  const base = { key: 'database', label: 'PostgreSQL (CSDL)', usesApi: false }
  try {
    const { ms } = await timed(async () => {
      const pool = getPgPool()
      await pool.query('select 1')
    })
    return { ...base, status: 'up', latencyMs: ms }
  } catch (err) {
    return { ...base, status: 'down', message: err instanceof Error ? err.message : String(err) }
  }
}

async function checkAnthropic(): Promise<FeatureCheckResult> {
  const base = { key: 'anthropic', label: 'AI hội thoại — Anthropic (Claude)', usesApi: true }
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { ...base, status: 'unconfigured' }
  try {
    const { ms, value: res } = await timed(() =>
      fetchWithTimeout('https://api.anthropic.com/v1/models?limit=1', {
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      }),
    )
    if (!res.ok) return { ...base, status: 'down', latencyMs: ms, message: `HTTP ${res.status}` }
    return { ...base, status: 'up', latencyMs: ms }
  } catch (err) {
    return { ...base, status: 'down', message: err instanceof Error ? err.message : String(err) }
  }
}

async function checkGemini(): Promise<FeatureCheckResult> {
  const base = { key: 'gemini', label: 'AI hội thoại — Google Gemini', usesApi: true }
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return { ...base, status: 'unconfigured' }
  try {
    const { ms, value: res } = await timed(() =>
      fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=1`,
        {},
      ),
    )
    if (!res.ok) return { ...base, status: 'down', latencyMs: ms, message: `HTTP ${res.status}` }
    return { ...base, status: 'up', latencyMs: ms }
  } catch (err) {
    return { ...base, status: 'down', message: err instanceof Error ? err.message : String(err) }
  }
}

async function checkGroq(): Promise<FeatureCheckResult> {
  const base = { key: 'groq', label: 'AI hội thoại + STT — Groq', usesApi: true }
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return { ...base, status: 'unconfigured' }
  try {
    const { ms, value: res } = await timed(() =>
      fetchWithTimeout('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      }),
    )
    if (!res.ok) return { ...base, status: 'down', latencyMs: ms, message: `HTTP ${res.status}` }
    return { ...base, status: 'up', latencyMs: ms }
  } catch (err) {
    return { ...base, status: 'down', message: err instanceof Error ? err.message : String(err) }
  }
}

async function checkOpenAiStt(): Promise<FeatureCheckResult> {
  const base = { key: 'openai-stt', label: 'STT dự phòng — OpenAI Whisper', usesApi: true }
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return { ...base, status: 'unconfigured' }
  try {
    const { ms, value: res } = await timed(() =>
      fetchWithTimeout('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      }),
    )
    if (!res.ok) return { ...base, status: 'down', latencyMs: ms, message: `HTTP ${res.status}` }
    return { ...base, status: 'up', latencyMs: ms }
  } catch (err) {
    return { ...base, status: 'down', message: err instanceof Error ? err.message : String(err) }
  }
}

async function checkGoogleTts(): Promise<FeatureCheckResult> {
  const base = { key: 'google-tts', label: 'TTS — Google Cloud Text-to-Speech', usesApi: true }
  const apiKey = process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_TTS_API_KEYS?.split(',')[0]
  if (!apiKey) return { ...base, status: 'unconfigured' }
  try {
    const { ms, value: res } = await timed(() =>
      fetchWithTimeout(`https://texttospeech.googleapis.com/v1/voices?key=${apiKey}`, {}),
    )
    if (!res.ok) return { ...base, status: 'down', latencyMs: ms, message: `HTTP ${res.status}` }
    return { ...base, status: 'up', latencyMs: ms }
  } catch (err) {
    return { ...base, status: 'down', message: err instanceof Error ? err.message : String(err) }
  }
}

async function checkR2Storage(): Promise<FeatureCheckResult> {
  const base = { key: 'r2-storage', label: 'Lưu trữ audio — Cloudflare R2', usesApi: true }
  if (process.env.STORAGE_DRIVER !== 'r2') {
    return {
      ...base,
      status: 'unconfigured',
      message: 'STORAGE_DRIVER không phải r2 (đang dùng local)',
    }
  }
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucket = process.env.R2_BUCKET
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return { ...base, status: 'unconfigured', message: 'Thiếu biến môi trường R2_*' }
  }
  try {
    const { S3Client, ListObjectsV2Command } = await import('@aws-sdk/client-s3')
    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    })
    const { ms } = await timed(() =>
      client.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 1 })),
    )
    return { ...base, status: 'up', latencyMs: ms }
  } catch (err) {
    return { ...base, status: 'down', message: err instanceof Error ? err.message : String(err) }
  }
}

// SePay là webhook ĐẨY VÀO (SePay gọi /api/payment-webhook), không có endpoint để chủ động
// hỏi "còn sống không" — chỉ kiểm tra đã cấu hình đủ biến môi trường chưa, kèm thời điểm giao
// dịch gần nhất ghi nhận được (thông tin tham khảo, KHÔNG coi "chưa có giao dịch gần đây" là lỗi
// vì có thể đơn giản là chưa ai mua trong ngày).
async function checkSepay(): Promise<FeatureCheckResult> {
  const base = { key: 'sepay', label: 'Thanh toán — SePay webhook', usesApi: true }
  const configured =
    process.env.SEPAY_WEBHOOK_API_KEY &&
    process.env.SEPAY_BANK_ACCOUNT &&
    process.env.SEPAY_BANK_CODE
  if (!configured) return { ...base, status: 'unconfigured' }
  try {
    const pool = getPgPool()
    const { rows } = await pool.query<{ last_payment_at: string | null }>(
      `select max(created_at) as last_payment_at from public.payments`,
    )
    const lastAt = rows[0]?.last_payment_at
    return {
      ...base,
      status: 'up',
      message: lastAt
        ? `Giao dịch gần nhất: ${new Date(lastAt).toLocaleString('vi-VN')}`
        : 'Đã cấu hình, chưa ghi nhận giao dịch nào',
    }
  } catch (err) {
    return { ...base, status: 'down', message: err instanceof Error ? err.message : String(err) }
  }
}

export async function runAllFeatureChecks(): Promise<FeatureCheckResult[]> {
  return Promise.all([
    checkDatabase(),
    checkAnthropic(),
    checkGemini(),
    checkGroq(),
    checkOpenAiStt(),
    checkGoogleTts(),
    checkR2Storage(),
    checkSepay(),
  ])
}

// Tổng hợp overall_status: coi 'unconfigured' như trung lập (không kéo trạng thái xuống) —
// chỉ tính trên các tính năng ĐÃ cấu hình. Không tính năng nào cấu hình mà lỗi → 'up'.
// Có lỗi nhưng còn ít nhất 1 tính năng cấu hình chạy được → 'degraded'. Toàn bộ tính năng đã
// cấu hình đều lỗi (và có ít nhất 1 tính năng được cấu hình) → 'down'.
export function summarizeOverallStatus(results: FeatureCheckResult[]): 'up' | 'degraded' | 'down' {
  const configured = results.filter((r) => r.status !== 'unconfigured')
  if (configured.length === 0) return 'up'
  const downCount = configured.filter((r) => r.status === 'down').length
  if (downCount === 0) return 'up'
  if (downCount === configured.length) return 'down'
  return 'degraded'
}
