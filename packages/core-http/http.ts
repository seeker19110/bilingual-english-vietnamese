// api/_lib/http.ts — Tiện ích HTTP dùng chung cho các API handler (Edge/Node Response).

// Trả JSON response chuẩn — gộp lại vì trước đây mỗi handler tự định nghĩa riêng.
export function jsonResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })
}

// Trả 500 AN TOÀN: log chi tiết lỗi ở server (console.error → PM2/Sentry bắt được),
// nhưng response cho client KHÔNG kèm err.message — message của pg/fetch có thể lộ
// tên bảng, host DB, cấu hình hạ tầng (phát hiện audit 2026-08-24).
export function internalErrorResponse(
  err: unknown,
  headers: Record<string, string> = {},
  context = '',
): Response {
  const message = err instanceof Error ? err.message : String(err)
  console.error(`[500]${context ? ` ${context}` : ''} ${message}`)
  return jsonResponse({ error: 'Internal server error' }, 500, headers)
}

// Lấy IP client từ header X-Forwarded-For (đặt bởi Nginx/Cloudflare) — dùng cho rate limit
// + log bảo mật. Xem ghi chú real_ip ở api/_lib/security.ts.
export function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}
