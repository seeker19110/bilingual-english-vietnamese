// packages/core-contracts/assessment.ts — Contract cho "Assessment" (Phase 10 Assessment Engine,
// docs/phases/10-assessment-engine.md). Kết quả chấm điểm AI trả về — hình thức hoá đúng hình
// dạng đã dùng THẬT trong app hôm nay (khác các entity khác trong Phase 02 vốn CHƯA có engine),
// gộp từ các interface hiện có, tất cả đều đang được `parseJson<T>()` (apps/english/src/lib/ai.ts)
// parse KHÔNG kiểm tra runtime (chỉ `as T`):
//   - `FeedbackData`/`WritingFeedback` (Writing.tsx/stats.ts) — chấm bài viết kiểu IELTS.
//   - `EvaluationResult` (types.ts, dùng ở Chat/Speaking/Lessons "Kết thúc & chấm điểm").
//   - `ChallengeFeedback` (prompts/challenge.ts) — chấm challenge nói 1 phút/ngày.
// Đây chính là ranh giới "critical AI output" mà Phase 02 mục 3–4 nói tới: điểm số/nhận xét hiện
// hiện thị thẳng cho người học và (Writing) được LƯU vào lịch sử mà không qua validate nào.
//
// `scores` giữ dạng record thay vì field cứng `task_response`/`coherence`/... vì các mode khác
// nhau chấm các tiêu chí khác nhau (Writing chấm 4 tiêu chí IELTS Writing, Speaking có thêm phát
// âm) — ép cứng field sẽ buộc mode nào cũng phải khai đủ tiêu chí không áp dụng cho nó.

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const ASSESSMENT_SCHEMA_VERSION = 1

export const AssessmentModeSchema = z.enum(['writing', 'speaking', 'chat', 'challenge'])

export const AssessmentCorrectionSchema = z
  .object({
    original: z.string().min(1),
    corrected: z.string().min(1),
    explanation: z.string().min(1),
  })
  .strict()

export const AssessmentSchema = versionedObject(
  {
    id: UuidSchema,
    learnerId: UuidSchema,
    mode: AssessmentModeSchema,
    // Điểm theo từng tiêu chí, vd { task_response: 6, coherence: 7, lexical: 6, grammar: 7,
    // overall: 6.5 } — thang 0–9 kiểu IELTS (khớp `ScoreBar` ở Writing.tsx đang vẽ theo /9).
    scores: z.record(z.string(), z.number().min(0).max(9)),
    corrections: z.array(AssessmentCorrectionSchema),
    suggestions: z.array(z.string()).optional(),
    sample: z.string().optional(),
    encouragement: z.string().optional(),
    createdAt: IsoDateTimeSchema,
  },
  ASSESSMENT_SCHEMA_VERSION,
)

export type Assessment = z.infer<typeof AssessmentSchema>
