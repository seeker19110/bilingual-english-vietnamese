// api/push.ts — Quản lý Web Push subscriptions + gửi notification nhắc học
// Endpoint: POST /api/push
// Body action="subscribe"    → lưu subscription của user
//        action="unsubscribe" → xóa subscription
//        action="send-daily"  → gửi push cho tất cả users (gọi từ cron, cần CRON_SECRET)

import webpush from 'web-push'
import { z } from 'zod'
import { getSupabaseAdmin } from './_lib/supabaseAdmin'
import { getCorsHeaders, SECURITY_HEADERS, validateAuth } from './_lib/security'
import { validateBody } from './_lib/validation'
import { vnDateStr, addDays } from './_lib/date'
import {
  pickReminderMessage,
  computeStreakAtRisk,
  computeWeeklyDaysDone,
  type ReminderMessage,
} from './_lib/reminderContent'

// Chỉ validate phần `subscription` (bắt buộc + đúng kiểu dữ liệu) — action/remindHour/hour/secret
// giữ nguyên cách kiểm tra tay hiện có (vốn đã an toàn: có typeof guard trước khi dùng).
// Lỗi field nào cũng trả về CÙNG 1 message (giữ đúng hành vi cũ) — xem nơi gọi bên dưới.
const SubscriptionSchema = z.object({
  endpoint: z.string().min(1),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
})

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY ?? ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? ''
const VAPID_EMAIL = process.env.VAPID_EMAIL ?? 'mailto:admin@example.com'

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE)
}

// Giờ UTC mặc định để nhắc khi người dùng chưa chọn giờ (13 UTC = 20:00 giờ VN).
const DEFAULT_REMIND_UTC_HOUR = 13

// Kiểu tối thiểu cho các hàng đọc từ Supabase trong file này — tránh `any`.
interface PushSubscriptionRow {
  user_id: string
  endpoint: string
  p256dh: string
  auth_key: string
}
interface DailyUsageRow {
  user_id: string
  chat_count: number | null
  writing_count: number | null
  speaking_count: number | null
  stt_count: number | null
  learn_count: number | null
}
// Bản có thêm `day` — dùng cho truy vấn nhiều ngày (nội dung nhắc theo ngữ cảnh,
// ② M3) khác truy vấn "đã học hôm nay" ở trên (chỉ lọc đúng 1 ngày, không cần day).
interface DailyUsageDayRow extends DailyUsageRow {
  day: string
}
interface ChallengeEntryUserRow {
  user_id: string
}
// Cột `srs`/`weekly_goal` của learning_progress — chỉ khai kiểu tối thiểu cần dùng.
interface LearningProgressRow {
  user_id: string
  srs?: Record<string, { due?: number }> | null
  weekly_goal?: { goal?: number } | null
}

// Cửa sổ ngày để tính streak/tuần cho nội dung nhắc theo ngữ cảnh (② M3) — khớp
// mốc "14 ngày gần nhất" đặc tả nhắc tới cho phần giờ thông minh (không làm ở
// PR này) để nhất quán, đồng thời giữ chi phí truy vấn Supabase hợp lý.
const REMINDER_LOOKBACK_DAYS = 14
// PHẢI khớp DEFAULT_WEEKLY_GOAL của src/lib/weeklyGoal.ts (api/_lib không import
// từ src/lib — xem quy ước ở api/_lib/date.ts).
const DEFAULT_WEEKLY_GOAL = 5

// Cửa sổ "còn đang trong thử thách challenge gần đây" — ước lượng NỚI TAY, chỉ để chọn
// NỘI DUNG thông báo cho thân thiện hơn (không phải luật vé nghỉ chính xác của
// src/lib/challenge.ts — logic đó dùng localStorage nên không gọi được từ server).
// Ai có ít nhất 1 dòng challenge_entries trong N ngày gần nhất được nhắc bằng nội dung
// challenge; còn lại vẫn nhận thông điệp nhắc học chung như trước.
const CHALLENGE_RECENT_WINDOW_DAYS = 8

function todayStr(): string {
  return vnDateStr()
}

// Gửi thông báo "nhắc học" cho các subscription muốn được nhắc vào GIỜ này (UTC),
// nhưng BỎ QUA người đã có hoạt động học hôm nay (đã giữ streak rồi, không cần nhắc).
// Trả về { sent, skipped, expired }. Dùng chung cho cron (/api/push send-daily) và
// bộ hẹn giờ trong server.ts. Tự xoá subscription hết hạn (410/404).
export async function sendReminders(
  hour: number,
): Promise<{ sent: number; skipped: number; expired: number }> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return { sent: 0, skipped: 0, expired: 0 }
  const supabase = getSupabaseAdmin()

  // Lấy các subscription tới giờ nhắc: đúng remind_hour, HOẶC chưa đặt giờ (null) thì
  // dùng giờ mặc định.
  let query = supabase.from('push_subscriptions').select('*')
  query =
    hour === DEFAULT_REMIND_UTC_HOUR
      ? query.or(`remind_hour.eq.${hour},remind_hour.is.null`)
      : query.eq('remind_hour', hour)
  const { data: subs } = await query
  if (!subs?.length) return { sent: 0, skipped: 0, expired: 0 }

  // Tập user đã học hôm nay → bỏ qua, khỏi nhắc.
  const userIds = [...new Set((subs as PushSubscriptionRow[]).map((s) => s.user_id))]
  const { data: usageRows } = await supabase
    .from('daily_usage')
    .select('user_id, chat_count, writing_count, speaking_count, stt_count, learn_count')
    .eq('day', todayStr())
    .in('user_id', userIds)
  const studied = new Set<string>()
  for (const r of (usageRows ?? []) as DailyUsageRow[]) {
    const total =
      (r.chat_count ?? 0) +
      (r.writing_count ?? 0) +
      (r.speaking_count ?? 0) +
      (r.stt_count ?? 0) +
      (r.learn_count ?? 0)
    if (total > 0) studied.add(r.user_id)
  }

  // Ai CHƯA học hôm nay mà gần đây có tham gia thử thách challenge → nhắc bằng nội dung
  // challenge cụ thể hơn (thân mật, gắn liền tính năng vừa quay). Best-effort: bảng
  // challenge_entries có thể chưa tồn tại (migration 0010 chưa chạy) — lỗi thì bỏ qua,
  // mọi người vẫn nhận thông điệp chung như trước (không vỡ tính năng nhắc học).
  const notStudiedIds = userIds.filter((id) => !studied.has(id))
  const challengeActive = new Set<string>()
  if (notStudiedIds.length > 0) {
    const since = vnDateStr(new Date(Date.now() - CHALLENGE_RECENT_WINDOW_DAYS * 86_400_000))
    const { data: challengeRows, error: challengeErr } = await supabase
      .from('challenge_entries')
      .select('user_id')
      .in('user_id', notStudiedIds)
      .gte('day', since)
    if (challengeErr) {
      console.warn(
        '[push] không đọc được challenge_entries (bảng chưa tạo?):',
        challengeErr.message,
      )
    } else {
      for (const r of (challengeRows ?? []) as ChallengeEntryUserRow[])
        challengeActive.add(r.user_id)
    }
  }

  // Nội dung NHẮC THEO NGỮ CẢNH (② M3) — chỉ cần tính cho người CHƯA học hôm
  // nay (người đã học không nhận nhắc, xem vòng lặp gửi bên dưới). Dùng dữ liệu
  // ĐÃ CÓ SẴN, không thêm tracking mới (xem api/_lib/reminderContent.ts).
  // Best-effort: lỗi truy vấn learning_progress/daily_usage mở rộng KHÔNG được
  // làm vỡ việc gửi — rơi về nội dung chung/challenge như cũ.
  const reminderMessages = new Map<string, ReminderMessage>()
  if (notStudiedIds.length > 0) {
    const lookbackStart = addDays(todayStr(), -(REMINDER_LOOKBACK_DAYS - 1))
    const [{ data: recentUsageRows, error: recentUsageErr }, { data: progressRows }] =
      await Promise.all([
        supabase
          .from('daily_usage')
          .select('user_id, day, chat_count, writing_count, speaking_count, stt_count, learn_count')
          .in('user_id', notStudiedIds)
          .gte('day', lookbackStart)
          .lt('day', todayStr()),
        supabase
          .from('learning_progress')
          .select('user_id, srs, weekly_goal')
          .in('user_id', notStudiedIds),
      ])
    if (recentUsageErr) {
      console.warn('[push] không đọc được daily_usage mở rộng:', recentUsageErr.message)
    }

    const activeDaysByUser = new Map<string, Set<string>>()
    for (const r of (recentUsageRows ?? []) as DailyUsageDayRow[]) {
      const total =
        (r.chat_count ?? 0) +
        (r.writing_count ?? 0) +
        (r.speaking_count ?? 0) +
        (r.stt_count ?? 0) +
        (r.learn_count ?? 0)
      if (total <= 0) continue
      const set = activeDaysByUser.get(r.user_id) ?? new Set<string>()
      set.add(r.day)
      activeDaysByUser.set(r.user_id, set)
    }
    const progressByUser = new Map<string, LearningProgressRow>()
    for (const r of (progressRows ?? []) as LearningProgressRow[]) progressByUser.set(r.user_id, r)

    const nowMs = Date.now()
    for (const uid of notStudiedIds) {
      const activeDays = activeDaysByUser.get(uid) ?? new Set<string>()
      const progress = progressByUser.get(uid)
      const srsDue = Object.values(progress?.srs ?? {}).filter(
        (c) => typeof c?.due === 'number' && c.due <= nowMs,
      ).length
      const weeklyGoal =
        typeof progress?.weekly_goal?.goal === 'number'
          ? progress.weekly_goal.goal
          : DEFAULT_WEEKLY_GOAL
      reminderMessages.set(
        uid,
        pickReminderMessage({
          streakDaysAtRisk: computeStreakAtRisk(activeDays, todayStr()),
          srsDue,
          weeklyGoal,
          weeklyDaysDone: computeWeeklyDaysDone(activeDays, todayStr()),
          challengeActive: challengeActive.has(uid),
        }),
      )
    }
  }
  // Fallback nếu vì lý do gì đó thiếu message tính sẵn (không nên xảy ra —
  // pickReminderMessage() luôn trả về ít nhất nội dung chung chung).
  const fallbackPayload = JSON.stringify({
    title: '🇻🇳→🇬🇧 Tới giờ học rồi!',
    body: 'Chỉ cần vài phút mỗi ngày. Hôm nay bạn chưa học — vào học để giữ streak nhé! 🔥',
    url: '/',
  })

  let sent = 0,
    skipped = 0
  const expired: string[] = []
  await Promise.all(
    (subs as PushSubscriptionRow[]).map(async (row) => {
      if (studied.has(row.user_id)) {
        skipped++
        return
      }
      try {
        const msg = reminderMessages.get(row.user_id)
        await webpush.sendNotification(
          { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth_key } },
          msg ? JSON.stringify(msg) : fallbackPayload,
        )
        sent++
      } catch (err: unknown) {
        if (
          err &&
          typeof err === 'object' &&
          'statusCode' in err &&
          (err.statusCode === 410 || err.statusCode === 404)
        ) {
          expired.push(row.endpoint)
        }
      }
    }),
  )

  if (expired.length) {
    await supabase.from('push_subscriptions').delete().in('endpoint', expired)
  }

  return { sent, skipped, expired: expired.length }
}

export default async function handler(req: Request): Promise<Response> {
  const cors = getCorsHeaders(req)
  const headers = { ...cors, ...SECURITY_HEADERS, 'Content-Type': 'application/json' }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return new Response(JSON.stringify({ error: 'Push chưa được cấu hình (thiếu VAPID keys)' }), {
      status: 503,
      headers,
    })
  }

  let body: Record<string, unknown>
  try {
    const parsed = await req.json()
    body = typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {}
  } catch (err) {
    console.error('[push] Invalid JSON in request body:', err)
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers })
  }
  const { action } = body

  // ── Trả VAPID public key cho frontend ────────────────────────────────────
  if (action === 'vapid-key') {
    return new Response(JSON.stringify({ publicKey: VAPID_PUBLIC }), { headers })
  }

  // ── Đăng ký / hủy đăng ký (cần auth) ────────────────────────────────────
  if (action === 'subscribe' || action === 'unsubscribe') {
    const auth = await validateAuth(req)
    if (!auth)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers })

    const subResult = validateBody(SubscriptionSchema, body.subscription)
    if (!subResult.ok) {
      return new Response(JSON.stringify({ error: 'Thiếu dữ liệu subscription' }), {
        status: 400,
        headers,
      })
    }
    const sub = subResult.data

    const supabase = getSupabaseAdmin()
    if (action === 'subscribe') {
      // Lưu subscription (các cột chắc chắn có) — bước này KHÔNG được lỗi.
      const { error } = await supabase.from('push_subscriptions').upsert(
        {
          user_id: auth.userId,
          endpoint: sub.endpoint,
          p256dh: sub.keys.p256dh,
          auth_key: sub.keys.auth,
        },
        { onConflict: 'user_id,endpoint' },
      )
      if (error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })

      // Lưu giờ nhắc (UTC 0–23) RIÊNG, best-effort: nếu DB chưa chạy migration 0003
      // (chưa có cột remind_hour) thì bỏ qua, vẫn nhắc theo giờ mặc định — không vỡ tính năng.
      const rh = body.remindHour
      const remindHour = typeof rh === 'number' && rh >= 0 && rh <= 23 ? Math.round(rh) : null
      if (remindHour != null) {
        const { error: rhErr } = await supabase
          .from('push_subscriptions')
          .update({ remind_hour: remindHour })
          .eq('user_id', auth.userId)
          .eq('endpoint', sub.endpoint)
        if (rhErr)
          console.warn(
            '[push] chưa lưu được remind_hour (chạy migration 0003_remind_hour.sql?):',
            rhErr.message,
          )
      }
      return new Response(JSON.stringify({ ok: true }), { headers })
    } else {
      const { error: delErr } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', auth.userId)
        .eq('endpoint', sub.endpoint)
      if (delErr)
        return new Response(JSON.stringify({ error: delErr.message }), { status: 500, headers })
      return new Response(JSON.stringify({ ok: true }), { headers })
    }
  }

  // ── Gửi push nhắc học cho người tới giờ nhắc (gọi từ cron MỖI GIỜ, cần CRON_SECRET) ──
  // body.hour (UTC 0–23): giờ cần gửi; nếu không truyền → dùng giờ UTC hiện tại.
  // Chỉ nhắc người CHƯA học hôm nay (xem sendReminders).
  if (action === 'send-daily') {
    const secret = process.env.CRON_SECRET
    // Bắt buộc phải có CRON_SECRET — nếu chưa cấu hình thì từ chối luôn
    if (!secret || body.secret !== secret) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers })
    }

    const hour =
      typeof body.hour === 'number' && body.hour >= 0 && body.hour <= 23
        ? Math.round(body.hour)
        : new Date().getUTCHours()
    const result = await sendReminders(hour)
    return new Response(JSON.stringify({ hour, ...result }), { headers })
  }

  // ── Xóa toàn bộ push subscriptions (admin, cần CRON_SECRET) ─────────────
  if (action === 'clear-all') {
    const secret = process.env.CRON_SECRET
    if (!secret || body.secret !== secret) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers })
    }
    const supabase = getSupabaseAdmin()
    const { error: delErr, count } = await supabase
      .from('push_subscriptions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    if (delErr)
      return new Response(JSON.stringify({ error: delErr.message }), { status: 500, headers })
    return new Response(JSON.stringify({ ok: true, deleted: count }), { headers })
  }

  return new Response(JSON.stringify({ error: 'Action không hợp lệ' }), { status: 400, headers })
}
