// api/_lib/validation.ts — Validate request body bằng Zod, dùng chung cho các API endpoint.
// Trước đây mỗi handler tự parse JSON + kiểm tra type bằng tay (dễ sót ca — vd body gửi
// field sai kiểu dữ liệu có thể làm handler crash thay vì trả lỗi 400 gọn gàng).

import type { ZodType } from 'zod'

export interface ApiError {
  status: number
  message: string
}

export type ParseResult<T> = { ok: true; data: T } | { ok: false; error: ApiError }

// Đọc raw text rồi parse JSON. Trả lỗi 400 nếu không phải JSON hợp lệ.
export async function readJsonBody(
  req: Request,
): Promise<{ ok: true; raw: unknown } | { ok: false; error: ApiError }> {
  const rawText = await req.text()
  try {
    return { ok: true, raw: JSON.parse(rawText) }
  } catch {
    return { ok: false, error: { status: 400, message: 'Body không hợp lệ (cần JSON)' } }
  }
}

// Validate `raw` theo Zod schema. Lỗi ĐẦU TIÊN được dùng làm message trả về client.
// Field nào cần status khác 400 (vd 413 "quá lớn") thì khai báo qua
// `.refine(check, { error: '...', params: { status: 413 } })` — status đó được đọc lại ở đây,
// mặc định 400 nếu schema không set.
export function validateBody<T>(schema: ZodType<T>, raw: unknown): ParseResult<T> {
  const result = schema.safeParse(raw)
  if (result.success) return { ok: true, data: result.data }
  const issue = result.error.issues[0] as
    | { message: string; params?: { status?: number } }
    | undefined
  const status = issue?.params?.status ?? 400
  return { ok: false, error: { status, message: issue?.message ?? 'Body không hợp lệ' } }
}
