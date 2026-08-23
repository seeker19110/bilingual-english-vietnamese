// packages/core-ai/ttsStats.ts — Đếm cache TTS hit/miss để trang admin biết cache có thật sự
// đang tiết kiệm tiền API hay không.
//
// Vì sao gộp sẵn theo ngày thay vì ghi log từng sự kiện: /api/tts bị gọi rất nhiều (mỗi câu
// hội thoại, mỗi từ bấm nghe), một bảng log thô sẽ phình vô hạn trong khi trang admin chỉ cần
// mức tổng hợp. Một dòng upsert theo (ngày, lang, voice) là đủ và rẻ.
//
// NGUYÊN TẮC: ghi số liệu KHÔNG BAO GIỜ được làm hỏng hay làm chậm việc phát audio. Mọi lời
// gọi ở đây là "bắn rồi quên" — lỗi chỉ ghi console.warn, không ném lên trên.

import type { Pool } from 'pg'
import { vnDateStr } from '@dhcb/core-db/date'

export interface TtsCacheEvent {
  lang: string
  voice: string
  /** true = phục vụ từ cache (không tốn tiền) · false = phải gọi API TTS sinh mới (tốn tiền) */
  hit: boolean
}

/**
 * Cộng 1 vào ô đếm hit hoặc miss của hôm nay. Bắn rồi quên — KHÔNG await ở đường phục vụ
 * request, và không bao giờ ném lỗi ra ngoài.
 *
 * `day` dùng ngày giờ VIỆT NAM (vnDateStr) để khớp với cách `daily_usage` tính ngày; nếu dùng
 * UTC thì biểu đồ ở 2 chỗ sẽ lệch nhau đúng 1 ngày trong khoảng nửa đêm giờ VN.
 */
export function recordTtsCacheEvent(pool: Pool, event: TtsCacheEvent): void {
  const column = event.hit ? 'hits' : 'misses'
  void pool
    .query(
      `insert into public.tts_cache_stats (day, lang, voice, ${column})
         values ($1, $2, $3, 1)
       on conflict (day, lang, voice) do update
         set ${column} = public.tts_cache_stats.${column} + 1`,
      [vnDateStr(), event.lang, event.voice],
    )
    .catch((err: unknown) => {
      // Không dùng console.error: đây là số liệu phụ, hỏng cũng không ảnh hưởng người dùng —
      // báo động đỏ ở đây chỉ làm nhiễu log/Sentry.
      console.warn('[tts-stats] ghi số liệu cache lỗi (bỏ qua):', err)
    })
}
