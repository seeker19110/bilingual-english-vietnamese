// packages/core-contracts/pipeline.ts — Đường ống chuẩn để nhận output từ AI: PARSE → SCHEMA →
// DOMAIN RULES → POLICY, rồi trả dữ liệu đã kiểm cho nơi gọi tự COMMIT (Phase 02 "Contract OS"
// mục 3, docs/phases/02-contract-os.md: "Validate LLM output: parse → schema → domain rules →
// policy → commit"). Đây là hàm DÙNG CHUNG cho MỌI contract trong `packages/core-contracts/` —
// domain engine của Phase 03+ gọi hàm này thay vì mỗi nơi tự viết lại 4 bước.
//
// "commit" KHÔNG nằm trong hàm này — pipeline chỉ trả dữ liệu đã qua đủ 4 bước kiểm, nơi gọi tự
// quyết ghi vào đâu (Postgres, event bus...) vì mỗi entity commit khác nhau. Tách bước cuối ra
// ngoài để hàm này không phụ thuộc DB/IO, giữ THUẦN (dễ test, không cần mock).
//
// Ranh giới với `AppError` (Phase 01, packages/core-errors/appError.ts): lỗi ở BẤT KỲ bước nào
// trong 4 bước đều trả về `ValidationError` (status 400) — đúng bản chất, đây luôn là lỗi INPUT
// (AI trả sai định dạng / vi phạm luật nghiệp vụ / bị chính sách chặn), không phải lỗi hạ tầng.

import { z } from 'zod'
import { ValidationError } from '../core-errors/appError.js'

export type PipelineStage = 'parse' | 'schema' | 'domain' | 'policy'

export type PipelineResult<T> =
  { ok: true; data: T } | { ok: false; stage: PipelineStage; error: ValidationError }

export interface ValidateAiOutputOptions<T> {
  /** Luật nghiệp vụ KHÔNG diễn đạt được bằng Zod thuần (so sánh field chéo, tra cứu bảng khác...).
   * Trả về chuỗi lỗi nếu vi phạm, `null` nếu hợp lệ. */
  domainRules?: (data: T) => string | null
  /** Luật CHÍNH SÁCH — khác domain rules ở chỗ đây là quyết định TUỲ NGỮ CẢNH (vd learner gói
   * Free không được nhận Assessment có > 3 corrections vì tốn thêm lượt AI để tạo). Tách riêng
   * domain/policy để domain rules dùng lại được ở nơi không áp policy (vd script nội bộ). */
  policy?: (data: T) => string | null
}

/**
 * Chạy pipeline PARSE → SCHEMA → DOMAIN RULES → POLICY trên 1 chuỗi JSON thô (thường là text AI
 * trả về). KHÔNG throw — luôn trả `PipelineResult`, để nơi gọi xử lý lỗi nhất quán (log, hoàn
 * lượt, trả message cho người dùng...) mà không cần try/catch lồng nhau.
 */
export function validateAiOutput<Schema extends z.ZodTypeAny>(
  raw: string,
  schema: Schema,
  options: ValidateAiOutputOptions<z.infer<Schema>> = {},
): PipelineResult<z.infer<Schema>> {
  // ── 1. PARSE ──────────────────────────────────────────────────────────────────────────────
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {
      ok: false,
      stage: 'parse',
      error: new ValidationError('AI trả về không phải JSON hợp lệ'),
    }
  }

  // ── 2. SCHEMA ─────────────────────────────────────────────────────────────────────────────
  const schemaResult = schema.safeParse(parsed)
  if (!schemaResult.success) {
    return {
      ok: false,
      stage: 'schema',
      error: new ValidationError(`Dữ liệu không khớp schema: ${schemaResult.error.message}`),
    }
  }
  const data = schemaResult.data as z.infer<Schema>

  // ── 3. DOMAIN RULES ───────────────────────────────────────────────────────────────────────
  const domainError = options.domainRules?.(data)
  if (domainError) {
    return { ok: false, stage: 'domain', error: new ValidationError(domainError) }
  }

  // ── 4. POLICY ─────────────────────────────────────────────────────────────────────────────
  const policyError = options.policy?.(data)
  if (policyError) {
    return { ok: false, stage: 'policy', error: new ValidationError(policyError) }
  }

  // Bước 5 "commit" — trách nhiệm của nơi gọi, xem chú thích đầu file.
  return { ok: true, data }
}
