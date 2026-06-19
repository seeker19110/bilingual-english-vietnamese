// Vercel Serverless Function — proxy gọi Anthropic API
// Giữ API key ở phía server (biến môi trường ANTHROPIC_API_KEY, KHÔNG có tiền tố VITE_
// nên sẽ không bị đóng gói vào file JS gửi cho browser).
//
// Frontend (src/lib/ai.ts) chỉ gọi POST /api/claude với { system, messages, max_tokens }
// — không hề biết và không cần gửi API key.
//
// BẢO MẬT: Server tự quyết định model và giới hạn max_tokens,
// không tin giá trị client gửi lên (tránh bị gọi model đắt / token lớn).

// Model và giới hạn do SERVER quyết định, không tin client
const ALLOWED_MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS_LIMIT = 2048      // tối đa cho phép (writing cần 2048, chat 1024)
const MAX_BODY_BYTES = 64 * 1024   // 64KB — đủ cho 1 cuộc hội thoại dài

// CORS: chỉ cho phép cùng origin (sẽ cập nhật domain thật khi deploy)
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',   // TODO: đổi thành domain Vercel thật sau khi deploy
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async function handler(req: Request): Promise<Response> {
  // Xử lý preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: { message: 'Method not allowed' } }), {
      status: 405,
      headers: { 'content-type': 'application/json', ...CORS_HEADERS },
    })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: { message: 'Server chưa cấu hình ANTHROPIC_API_KEY' } }),
      { status: 500, headers: { 'content-type': 'application/json', ...CORS_HEADERS } },
    )
  }

  // Giới hạn kích thước request — tránh gửi nội dung khổng lồ
  const rawText = await req.text()
  if (rawText.length > MAX_BODY_BYTES) {
    return new Response(
      JSON.stringify({ error: { message: 'Request quá lớn' } }),
      { status: 413, headers: { 'content-type': 'application/json', ...CORS_HEADERS } },
    )
  }

  // Parse và kiểm tra body
  let parsed: { system?: string; messages?: unknown[]; max_tokens?: number }
  try {
    parsed = JSON.parse(rawText)
  } catch {
    return new Response(
      JSON.stringify({ error: { message: 'Body không hợp lệ (cần JSON)' } }),
      { status: 400, headers: { 'content-type': 'application/json', ...CORS_HEADERS } },
    )
  }

  // Server quyết định model + max_tokens — không dùng giá trị client gửi lên
  const safeBody = {
    model: ALLOWED_MODEL,
    max_tokens: Math.min(
      typeof parsed.max_tokens === 'number' ? parsed.max_tokens : 1024,
      MAX_TOKENS_LIMIT,
    ),
    system: typeof parsed.system === 'string' ? parsed.system.slice(0, 8000) : '',
    messages: Array.isArray(parsed.messages) ? parsed.messages.slice(-30) : [], // tối đa 30 tin nhắn gần nhất
  }

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(safeBody),
  })

  const data = await resp.text()
  return new Response(data, {
    status: resp.status,
    headers: { 'content-type': 'application/json', ...CORS_HEADERS },
  })
}

// Dùng Edge Runtime — nhẹ, khởi động nhanh, đủ cho việc proxy 1 request
export const config = {
  runtime: 'edge',
}
