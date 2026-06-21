// api/push.ts — Quản lý Web Push subscriptions + gửi notification nhắc học
// Endpoint: POST /api/push
// Body action="subscribe"    → lưu subscription của user
//        action="unsubscribe" → xóa subscription
//        action="send-daily"  → gửi push cho tất cả users (gọi từ cron, cần CRON_SECRET)

import webpush from 'web-push'
import { getSupabaseAdmin } from './_lib/supabaseAdmin'
import { getCorsHeaders, SECURITY_HEADERS, validateAuth } from './_lib/security'

const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY  ?? ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? ''
const VAPID_EMAIL   = process.env.VAPID_EMAIL       ?? 'mailto:admin@example.com'

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE)
}

export default async function handler(req: Request): Promise<Response> {
  const cors = getCorsHeaders(req)
  const headers = { ...cors, ...SECURITY_HEADERS, 'Content-Type': 'application/json' }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return new Response(JSON.stringify({ error: 'Push chưa được cấu hình (thiếu VAPID keys)' }), { status: 503, headers })
  }

  const body = await req.json().catch(() => ({})) as Record<string, unknown>
  const { action } = body

  // ── Trả VAPID public key cho frontend ────────────────────────────────────
  if (action === 'vapid-key') {
    return new Response(JSON.stringify({ publicKey: VAPID_PUBLIC }), { headers })
  }

  // ── Đăng ký / hủy đăng ký (cần auth) ────────────────────────────────────
  if (action === 'subscribe' || action === 'unsubscribe') {
    const auth = await validateAuth(req)
    if (!auth) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers })

    const sub = body.subscription as { endpoint: string; keys: { p256dh: string; auth: string } }
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      return new Response(JSON.stringify({ error: 'Thiếu dữ liệu subscription' }), { status: 400, headers })
    }

    const supabase = getSupabaseAdmin()
    if (action === 'subscribe') {
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id:  auth.userId,
        endpoint: sub.endpoint,
        p256dh:   sub.keys.p256dh,
        auth_key: sub.keys.auth,
      }, { onConflict: 'user_id,endpoint' })
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
      return new Response(JSON.stringify({ ok: true }), { headers })
    } else {
      await supabase.from('push_subscriptions')
        .delete().eq('user_id', auth.userId).eq('endpoint', sub.endpoint)
      return new Response(JSON.stringify({ ok: true }), { headers })
    }
  }

  // ── Gửi push nhắc học cho tất cả users (gọi từ cron, cần CRON_SECRET) ────
  if (action === 'send-daily') {
    const secret = process.env.CRON_SECRET
    if (secret && body.secret !== secret) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers })
    }

    const supabase = getSupabaseAdmin()
    const { data: subs } = await supabase.from('push_subscriptions').select('*')
    if (!subs?.length) return new Response(JSON.stringify({ sent: 0 }), { headers })

    const payload = JSON.stringify({
      title: '🇻🇳→🇬🇧 Luyện tập hôm nay chưa?',
      body:  'Chỉ cần 10 phút mỗi ngày. Hôm nay bạn chưa học — hãy giữ streak! 🔥',
      url:   '/',
    })

    let sent = 0
    const expired: string[] = []
    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subs.map(async (row: any) => {
        try {
          await webpush.sendNotification(
            { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth_key } },
            payload,
          )
          sent++
        } catch (err: unknown) {
          // Subscription hết hạn (410/404) → xóa khỏi DB
          if (err && typeof err === 'object' && 'statusCode' in err &&
              (err.statusCode === 410 || err.statusCode === 404)) {
            expired.push(row.endpoint)
          }
        }
      })
    )

    if (expired.length) {
      await supabase.from('push_subscriptions').delete().in('endpoint', expired)
    }

    return new Response(JSON.stringify({ sent, expired: expired.length }), { headers })
  }

  return new Response(JSON.stringify({ error: 'Action không hợp lệ' }), { status: 400, headers })
}
