// packages/core-contracts/careerInterview.ts — Contract cho Phòng Luyện Phỏng Vấn (trụ CAREER).
//
// Bối cảnh (Đợt 2 "Một mũi nhọn thật", docs/research/nang-tam-du-an-2026-08-24.md §4):
// `CareerInterview.tsx` trước đây là mô phỏng GIẢ HOÀN TOÀN — 3 câu hỏi cứng, `setTimeout(700)`
// giả vờ đang phân tích, rồi trả **điểm 8.5 cứng** với nhận xét y hệt cho mọi câu trả lời của
// mọi người. Contract này là nền cho bản chạy AI thật.
//
// Thang bậc dùng chung toàn nền tảng: B1–B5 (Dreyfus, chốt ở
// docs/research/dac-ta-nang-luc-ca-nhan-theo-do-tuoi-2026-08-23.md mục 6.2). Cố ý KHÔNG dùng
// "số năm kinh nghiệm" làm thước đo — mười năm lặp lại một việc không bằng mười năm tích luỹ.

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const CAREER_INTERVIEW_SCHEMA_VERSION = 1

export const InterviewKindSchema = z.enum(['behavioral', 'technical', 'situational'])
export type InterviewKind = z.infer<typeof InterviewKindSchema>

// Thang 5 bậc Dreyfus — nguồn sự thật ở đặc tả năng lực mục 6.2.
export const ProficiencyBandSchema = z.enum(['B1', 'B2', 'B3', 'B4', 'B5'])
export type ProficiencyBand = z.infer<typeof ProficiencyBandSchema>

export const PROFICIENCY_BAND_LABELS: Record<ProficiencyBand, string> = {
  B1: 'Tập sự',
  B2: 'Mới thạo việc',
  B3: 'Thạo việc',
  B4: 'Thành thục',
  B5: 'Chuyên gia',
}

export const InterviewQuestionSchema = z
  .object({
    id: z.string().min(1).max(100),
    question: z.string().min(1).max(1000),
    // Câu hỏi này soi năng lực gì — để người học biết mình đang được đánh giá điều gì.
    focus: z.string().max(200).optional(),
  })
  .strict()

// Nhận xét cho MỘT câu trả lời. Giữ đúng luật hành xử số 3 ("mỗi lúc chỉ 3 việc") và số 6
// ("nói thật kể cả điều khó nghe, nhưng luôn kèm đường đi tiếp") ở
// docs/research/dong-hanh-va-phat-trien-nang-khieu-2026-08-23.md mục 2.
export const InterviewFeedbackSchema = z
  .object({
    // Thang 0–10, một chữ số thập phân. KHÔNG phải điểm cố định như bản giả cũ.
    score: z.number().min(0).max(10),
    strengths: z.array(z.string().min(1).max(500)).max(3),
    // Tối đa 3 — nhiều hơn thì người học không hành động được (luật 3).
    improvements: z.array(z.string().min(1).max(500)).max(3),
    sampleAnswer: z.string().max(2000),
    // Bậc ƯỚC LƯỢNG mà câu trả lời này thể hiện. null khi câu trả lời quá ngắn để kết luận —
    // thà nói "chưa đủ căn cứ" còn hơn gán bậc bừa (đặc tả năng lực mục 10: xác định bằng
    // bằng chứng, không bằng tự khai).
    bandSignal: ProficiencyBandSchema.nullable(),
    // true = AI KHÔNG chạy được, đây là nội dung dự phòng. Giao diện PHẢI nói thật với người
    // dùng thay vì đưa ra như thể AI vừa chấm (bài học "Live Voice giả lập", PR #650).
    isFallback: z.boolean().default(false),
  })
  .strict()

export const InterviewTurnSchema = z
  .object({
    question: InterviewQuestionSchema,
    answer: z.string().max(5000).optional(),
    feedback: InterviewFeedbackSchema.optional(),
    answeredAt: IsoDateTimeSchema.optional(),
  })
  .strict()

export const InterviewSessionSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    kind: InterviewKindSchema,
    // Vị trí đang luyện — lấy từ hồ sơ nghề nghiệp thật của người dùng.
    targetRole: z.string().min(1).max(200),
    turns: z.array(InterviewTurnSchema),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  },
  CAREER_INTERVIEW_SCHEMA_VERSION,
)

export type InterviewQuestion = z.infer<typeof InterviewQuestionSchema>
export type InterviewFeedback = z.infer<typeof InterviewFeedbackSchema>
export type InterviewTurn = z.infer<typeof InterviewTurnSchema>
export type InterviewSession = z.infer<typeof InterviewSessionSchema>
