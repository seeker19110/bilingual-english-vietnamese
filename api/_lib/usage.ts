// api/_lib/usage.ts — Đếm & giới hạn lượt dùng ở SERVER (nguồn sự thật).
//
// Trước đây giới hạn lượt CHỈ kiểm ở client (localStorage) → người dùng có thể sửa
// localStorage hoặc gọi thẳng API để vượt giới hạn gói Free, làm tốn tiền API.
// Module này đưa việc đếm + chặn xuống server: đọc gói từ `profiles`, đếm theo
// `daily_usage`, chặn khi hết lượt, và TĂNG lượt một cách authoritative.
//
// FAIL-OPEN: nếu đọc/ghi DB lỗi (sự cố hạ tầng), CHO QUA để không chặn nhầm người
// dùng hợp lệ — vì chặn nhầm tệ hơn là lỡ 1 lượt khi DB trục trặc.

import { getSupabaseAdmin } from './supabaseAdmin'

export type UsageMode = 'chat' | 'writing' | 'speaking' | 'stt'

// Giới hạn theo gói — PHẢI khớp với src/types.ts (LIMITS) để client/server đồng nhất.
const LIMITS: Record<'free' | 'pro', Record<UsageMode, number>> = {
  free: { chat: 15, writing: 3, speaking: 5, stt: 10 },
  pro: { chat: 999, writing: 30, speaking: 60, stt: 100 },
}

// Tên cột tương ứng trong bảng daily_usage
const COLUMN: Record<UsageMode, string> = {
  chat: 'chat_count',
  writing: 'writing_count',
  speaking: 'speaking_count',
  stt: 'stt_count',
}

export function isUsageMode(v: unknown): v is UsageMode {
  return v === 'chat' || v === 'writing' || v === 'speaking' || v === 'stt'
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

// Kiểm tra còn lượt không + tăng 1 (authoritative). FAIL-OPEN khi lỗi hạ tầng.
export async function checkAndConsumeUsage(
  userId: string,
  mode: UsageMode,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const supabase = getSupabaseAdmin()
    const day = today()
    const col = COLUMN[mode]

    // Gói của user (mặc định 'free' nếu chưa có hồ sơ)
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .maybeSingle()
    const plan = (profile as { plan?: string } | null)?.plan === 'pro' ? 'pro' : 'free'
    const limit = LIMITS[plan][mode]

    // Số lượt đã dùng hôm nay
    const { data: row } = await supabase
      .from('daily_usage')
      .select(col)
      .eq('user_id', userId)
      .eq('day', day)
      .maybeSingle()
    const current = Number((row as unknown as Record<string, unknown> | null)?.[col] ?? 0)

    if (current >= limit) {
      return {
        ok: false,
        message:
          plan === 'pro'
            ? 'Bạn đã dùng hết lượt hôm nay. Thử lại vào ngày mai nhé.'
            : 'Hết lượt miễn phí hôm nay. Thử lại ngày mai hoặc nâng cấp gói Pro.',
      }
    }

    // Tăng 1 — upsert chỉ cột này; các cột khác giữ nguyên (hoặc lấy mặc định 0 nếu dòng mới)
    await supabase
      .from('daily_usage')
      .upsert({ user_id: userId, day, [col]: current + 1 }, { onConflict: 'user_id,day' })

    return { ok: true }
  } catch (err) {
    console.warn('[usage] kiểm tra lượt lỗi → fail-open (cho qua):', err)
    return { ok: true }
  }
}
