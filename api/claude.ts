// Vercel Serverless Function — proxy gọi Anthropic API
// Giữ API key ở phía server (biến môi trường ANTHROPIC_API_KEY, KHÔNG có tiền tố VITE_
// nên sẽ không bị đóng gói vào file JS gửi cho browser).
//
// Frontend (src/lib/ai.ts) chỉ gọi POST /api/claude với { model, max_tokens, system, messages }
// — không hề biết và không cần gửi API key.

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: { message: 'Method not allowed' } }), { status: 405 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: { message: 'Server chưa cấu hình ANTHROPIC_API_KEY' } }),
      { status: 500 },
    )
  }

  const body = await req.text()

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body,
  })

  const data = await resp.text()
  return new Response(data, {
    status: resp.status,
    headers: { 'content-type': 'application/json' },
  })
}

// Dùng Edge Runtime — nhẹ, khởi động nhanh, đủ cho việc proxy 1 request
export const config = {
  runtime: 'edge',
}
