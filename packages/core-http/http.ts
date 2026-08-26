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

// Lấy IP client — dùng cho rate limit + log bảo mật.
//
// [2026-08-26] SỬA LỖ HỔNG THẬT, đã xác minh trên production: bản cũ đọc PHẦN TỬ ĐẦU của
// `X-Forwarded-For`. Nginx dùng `$proxy_add_x_forwarded_for`, tức NỐI ip thật vào CUỐI chuỗi
// client gửi lên:
//
//     Client gửi:  X-Forwarded-For: 1.2.3.4
//     Nginx thành: X-Forwarded-For: 1.2.3.4, <ip thật>
//     Bản cũ đọc:  1.2.3.4          ← giá trị CLIENT TỰ KHAI
//
// Hệ quả: đổi header mỗi request là né sạch rate limit. Bằng chứng đo được: 40 request liên
// tiếp vào `/api/app-settings` (giới hạn 30/phút) với `X-Forwarded-For` ngẫu nhiên → 40 lần
// 200, KHÔNG một 429 nào.
//
// Thứ tự đọc mới, từ đáng tin nhất xuống:
//   1. `CF-Connecting-IP` — Cloudflare GHI ĐÈ header này ở biên (không nối như nginx), nên
//      client không tự khai được khi đi qua CF. Dự án đang chạy sau Cloudflare (xác nhận
//      2026-08-26: response có `server: cloudflare` + `cf-ray`).
//   2. `X-Real-IP` — nginx đặt `= $remote_addr`, cũng là GHI ĐÈ.
//   3. `X-Forwarded-For` phần tử **CUỐI** — phần do proxy gần nhất nối vào, không phải phần
//      client khai. Chỉ dùng khi hai header trên vắng mặt.
//
// ⚠️ GIỚI HẠN CÒN LẠI — cần lớp thứ hai ở nginx: ai gọi THẲNG vào IP VPS (bỏ qua Cloudflare)
// vẫn tự đặt được `CF-Connecting-IP`. Bịt bằng `nginx/cloudflare-realip.conf`
// (`scripts/update-cloudflare-ips.sh`) để chỉ nhận header đó từ đúng dải IP Cloudflare, hoặc
// chặn firewall mọi kết nối không đến từ CF. Xem docs/cloudflare-setup.md.
export function getClientIp(req: Request): string {
  const cfIp = req.headers.get('cf-connecting-ip')?.trim()
  if (cfIp) return cfIp

  const realIp = req.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp

  // Phần tử CUỐI, không phải đầu — xem giải thích ở trên.
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const parts = forwarded
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
    const last = parts[parts.length - 1]
    if (last) return last
  }

  return 'unknown'
}
