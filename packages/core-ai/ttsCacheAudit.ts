// packages/core-ai/ttsCacheAudit.ts — Quét đối chiếu bảng cache trong Postgres với file thật
// trên Cloudflare R2, phục vụ tab admin "Cache TTS & R2".
//
// Trả lời 3 câu hỏi:
//   1. Bao nhiêu dòng cache trỏ ĐÚNG về R2, bao nhiêu dòng trỏ sai chỗ (audio chết)?
//   2. Dòng trỏ về R2 nhưng file KHÔNG còn trên bucket (thiếu) — sẽ phải gọi API sinh lại.
//   3. File nằm trên R2 nhưng KHÔNG dòng nào trỏ tới (orphan) — chiếm dung lượng vô ích.
//
// CHẠY NỀN, không phục vụ trực tiếp request: bucket hàng chục nghìn file, liệt kê hết mất
// hàng chục giây tới vài phút.

import type { Pool } from 'pg'
import { listR2Objects, getR2PublicBaseUrl } from './fileStorage.js'

/** Prefix trên R2 ↔ bảng trong Postgres. Khớp tham số `bucket` của saveAudio(). */
const TTS_PREFIX = 'tts-cache/'
const PRON_PREFIX = 'pronunciations/'

/** Số ví dụ tối đa lưu kèm mỗi loại — đủ để admin lần ra nguyên nhân, không phình jsonb. */
const MAX_SAMPLES = 20

export interface TableAudit {
  /** Tổng số dòng trong bảng. */
  total: number
  /** Dòng có audio_url trỏ đúng về R2_PUBLIC_BASE_URL. */
  onR2: number
  /** Dòng trỏ đi chỗ khác (/uploads/... cũ) → audio chết, sẽ tự sinh lại khi có người dùng tới. */
  offR2: number
  /** Dòng trỏ về R2 nhưng file không còn trên bucket. */
  missingOnR2: number
  /** File trên R2 không dòng nào trỏ tới. */
  orphanOnR2: number
  /** Số file thật đếm được trên R2 dưới prefix này. */
  r2Files: number
  /** Tổng dung lượng các file đó (byte). */
  r2Bytes: number
  samples: {
    offR2: string[]
    missingOnR2: string[]
    orphanOnR2: string[]
  }
}

export interface TtsCacheAuditResult {
  ttsCache: TableAudit
  pronunciations: TableAudit
  /** Cấu hình lúc quét — để đọc lại kết quả cũ không bị hiểu nhầm. */
  r2PublicBaseUrl: string | null
}

/**
 * Đổi audio_url thành key trên R2, hoặc null nếu URL không thuộc R2 đang cấu hình.
 * Ví dụ: https://pub-abc.r2.dev/tts-cache/en-US/f/a.mp3 → tts-cache/en-US/f/a.mp3
 */
export function urlToR2Key(url: string, baseUrl: string): string | null {
  const prefix = baseUrl.replace(/\/$/, '') + '/'
  if (!url.startsWith(prefix)) return null
  return url.slice(prefix.length)
}

async function auditOne(
  pool: Pool,
  sql: string,
  prefix: string,
  baseUrl: string,
): Promise<TableAudit> {
  // 1. File thật trên R2 dưới prefix này.
  const objects = await listR2Objects(prefix)
  const r2Keys = new Set(objects.map((o) => o.key))
  const r2Bytes = objects.reduce((sum, o) => sum + o.size, 0)

  // 2. Mọi dòng cache trong DB. Chỉ lấy audio_url — không kéo về dữ liệu người dùng nào.
  const { rows } = await pool.query<{ audio_url: string }>(sql)

  const audit: TableAudit = {
    total: rows.length,
    onR2: 0,
    offR2: 0,
    missingOnR2: 0,
    orphanOnR2: 0,
    r2Files: objects.length,
    r2Bytes,
    samples: { offR2: [], missingOnR2: [], orphanOnR2: [] },
  }

  const referenced = new Set<string>()
  for (const row of rows) {
    const key = urlToR2Key(row.audio_url, baseUrl)
    if (key === null) {
      audit.offR2++
      if (audit.samples.offR2.length < MAX_SAMPLES) audit.samples.offR2.push(row.audio_url)
      continue
    }
    audit.onR2++
    referenced.add(key)
    if (!r2Keys.has(key)) {
      audit.missingOnR2++
      if (audit.samples.missingOnR2.length < MAX_SAMPLES) audit.samples.missingOnR2.push(key)
    }
  }

  for (const key of r2Keys) {
    if (!referenced.has(key)) {
      audit.orphanOnR2++
      if (audit.samples.orphanOnR2.length < MAX_SAMPLES) audit.samples.orphanOnR2.push(key)
    }
  }

  return audit
}

/**
 * Chạy một lượt quét đầy đủ. Ném lỗi nếu chưa cấu hình R2 — caller (api/admin-tts-cache.ts)
 * chịu trách nhiệm ghi trạng thái 'error' vào bảng tts_cache_audit.
 */
export async function runTtsCacheAudit(pool: Pool): Promise<TtsCacheAuditResult> {
  const baseUrl = getR2PublicBaseUrl()
  if (!baseUrl) {
    throw new Error('Chưa cấu hình R2_PUBLIC_BASE_URL — không đối chiếu được DB với R2')
  }

  const ttsCache = await auditOne(
    pool,
    'select audio_url from public.tts_cache',
    TTS_PREFIX,
    baseUrl,
  )
  const pronunciations = await auditOne(
    pool,
    'select audio_url from english.pronunciations',
    PRON_PREFIX,
    baseUrl,
  )

  return { ttsCache, pronunciations, r2PublicBaseUrl: baseUrl }
}
