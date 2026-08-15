// packages/core-contracts/aiRequest.ts — Contract cho "AIRequest"/"AIResponse" (Phase 01
// Foundation OS, docs/phases/01-foundation-os.md, mục "Contracts": "AI request: task, model
// policy, messages/input, schema, timeout, metadata. AI response: content, parsed output,
// provider/model, usage, latency, request ID."). Hình thức hoá ĐÚNG những gì Phase 01 đã xây thật
// (`packages/core-ai/chatProviders.ts`, `packages/core-db/requestId.ts`, `packages/core-db/
// metrics.ts`) thành hợp đồng có kiểm — Phase 01 code chưa cần đổi để dùng contract này (module
// MỚI, chưa migrate ai.ts, giống các contract khác ở Phase 02).

import { z } from 'zod'
import { versionedObject } from './version.js'

export const AI_REQUEST_SCHEMA_VERSION = 1
export const AI_RESPONSE_SCHEMA_VERSION = 1

export const AiTaskSchema = z.enum(['chat', 'writing', 'speaking', 'assessment'])

export const AiMessageSchema = z
  .object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string(),
  })
  .strict()

export const AiRequestSchema = versionedObject(
  {
    task: AiTaskSchema,
    // Tên model DO SERVER quyết định — request này mô tả CÁI SERVER ĐÃ CHỌN, không phải giá trị
    // client gửi lên (nguyên tắc bảo mật đã có ở packages/core-ai/ai.ts: không tin model client
    // yêu cầu, tránh bị gọi model đắt).
    modelPolicy: z.string().min(1),
    messages: z.array(AiMessageSchema),
    timeoutMs: z.number().int().positive(),
    requestId: z.string().min(1),
  },
  AI_REQUEST_SCHEMA_VERSION,
)

export type AiRequest = z.infer<typeof AiRequestSchema>

export const AiResponseSchema = versionedObject(
  {
    content: z.string(),
    provider: z.enum(['groq', 'anthropic', 'gemini']),
    model: z.string().min(1),
    latencyMs: z.number().nonnegative(),
    requestId: z.string().min(1),
  },
  AI_RESPONSE_SCHEMA_VERSION,
)

export type AiResponse = z.infer<typeof AiResponseSchema>
