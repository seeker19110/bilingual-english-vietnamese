// Gọi Google Gemini API
// Tương tự Groq/Anthropic, nhưng dùng endpoint Google Generative AI

import { fetchWithTimeout } from './fetchTimeout.js'

// Thời gian chờ tối đa cho 1 lần gọi AI (ms) — tránh treo vô hạn khi nhà cung cấp chậm.
const AI_TIMEOUT_MS = 30_000

export interface GeminiMessage {
  role: 'user' | 'model'
  parts: Array<{ text: string }>
}

export interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
    finishReason?: string
  }>
  error?: {
    message?: string
  }
}

export async function callGemini(
  apiKey: string,
  model: string,
  system: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  maxTokens: number,
): Promise<string> {
  // Chuyển đổi từ Anthropic format sang Gemini format
  const geminiMessages: GeminiMessage[] = []

  // Thêm system prompt (Gemini không có role "system", dùng user message đầu tiên)
  if (system) {
    geminiMessages.push({
      role: 'user',
      parts: [{ text: system }],
    })
    // Theo convention, sau system message từ user, AI phải trả lời (role: model)
    geminiMessages.push({
      role: 'model',
      parts: [{ text: 'Hiểu rồi. Tôi sẽ giúp bạn với vai trò này.' }],
    })
  }

  // Thêm messages từ client (convert role: 'user' → 'user', 'assistant' → 'model')
  for (const msg of messages) {
    geminiMessages.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })
  }

  const payload = {
    contents: geminiMessages,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7, // Cân bằng giữa creativity & consistency
    },
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const resp = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    AI_TIMEOUT_MS,
  )

  if (!resp.ok) {
    const errorText = await resp.text()
    throw new Error(`Gemini API error (${resp.status}): ${errorText.slice(0, 200)}`)
  }

  const data = (await resp.json()) as GeminiResponse

  // Parse response
  if (data.error) {
    throw new Error(`Gemini API error: ${data.error.message}`)
  }

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('Gemini API returned empty candidates')
  }

  const candidate = data.candidates[0]
  if (!candidate) {
    throw new Error('Gemini API returned empty candidates')
  }
  if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
    throw new Error('Gemini API returned empty content')
  }

  const text = candidate.content.parts[0]?.text
  if (!text) {
    throw new Error('Gemini API returned empty text')
  }

  return text
}
