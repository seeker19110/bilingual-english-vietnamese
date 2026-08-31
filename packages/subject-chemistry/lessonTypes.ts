// lessonTypes.ts — Kiểu + Zod schema cho BÀI HỌC môn Hoá học (GĐ3, đợt 1).
// Khuôn khác Lập trình (không có Make/Parsons vì Hoá không viết code) nhưng giữ tinh thần
// "học rồi luyện, có phản hồi tức thì, không AI chấm đúng/sai" — mọi checkQuestion dùng
// AnswerSpec của packages/core-grading (gradeAnswer thuần, tất định).
//
// ⚠️ NỘI DUNG: soạn từ docs/research/kho-kien-thuc-hoa-gdpt2018.md — file đó tự ghi rõ
// "CHƯA DUYỆT CHUYÊN MÔN". Trường `reviewStatus` bắt buộc mọi bài phải khai báo trạng thái,
// để không âm thầm coi bản thảo là nội dung cuối cùng (xem docs/goals/2026-08-31-mon-hoc-toan-ly-hoa-sinh.md).
import { z } from 'zod'

/** Cấp lớp áp dụng — Hoá là môn riêng chỉ từ THPT (xem kho-kien-thuc-hoa-gdpt2018.md §0). */
export const CHEM_GRADES = ['10', '11', '12'] as const
export type ChemGrade = (typeof CHEM_GRADES)[number]

/** Đáp án của một câu hỏi kiểm tra — ánh xạ THẲNG sang AnswerSpec của core-grading,
 *  để tránh định nghĩa hai bộ kiểu song song rồi lệch nhau theo thời gian. */
export const ChemAnswerSpecSchema = z.union([
  z
    .object({
      kind: z.literal('numeric'),
      value: z.number(),
      unit: z.string().optional(),
      unitRequired: z.boolean().optional(),
      tolerance: z
        .union([
          z.object({ mode: z.literal('exact') }).strict(),
          z.object({ mode: z.literal('absolute'), eps: z.number() }).strict(),
          z.object({ mode: z.literal('relative'), pct: z.number() }).strict(),
          z.object({ mode: z.literal('sigfig'), digits: z.number() }).strict(),
        ])
        .optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal('choice'),
      correctIds: z.array(z.string().min(1)).min(1),
    })
    .strict(),
  z
    .object({
      kind: z.literal('chemFormula'),
      formula: z.string().min(1),
    })
    .strict(),
  z
    .object({
      kind: z.literal('chemEquation'),
      reactants: z.array(z.string().min(1)).min(1),
      products: z.array(z.string().min(1)).min(1),
      requireSimplified: z.boolean().optional(),
    })
    .strict(),
])
export type ChemAnswerSpec = z.infer<typeof ChemAnswerSpecSchema>

export const ChemCheckQuestionSchema = z
  .object({
    prompt: z.string().min(1).max(800),
    /** Với câu trắc nghiệm (choice): các lựa chọn hiện cho học sinh, key khớp correctIds. */
    choices: z.array(z.object({ id: z.string().min(1), label: z.string().min(1) })).optional(),
    answer: ChemAnswerSpecSchema,
    /** Giải thích hiện SAU khi học sinh trả lời — không phải AI phán, chỉ là lời giải cố định. */
    explain: z.string().min(1).max(1000),
  })
  .strict()
  .refine((q) => (q.answer.kind === 'choice') === (q.choices !== undefined), {
    message: "câu 'choice' phải có choices; đáp án khác thì không được có choices",
  })

export const ChemLessonSchema = z
  .object({
    /** id ổn định `hoa<lớp>-c<chương>-b<bài>`, vd 'hoa10-c1-b1'. */
    id: z.string().regex(/^hoa(10|11|12)-c\d+-b\d+$/),
    grade: z.enum(CHEM_GRADES),
    /** Số chương trong SGK — dùng để nhóm bài + dựng menu chương. */
    chapterNumber: z.number().int().positive(),
    chapterTitle: z.string().min(1).max(200),
    /** Số thứ tự bài trong SGK (Bài 1, Bài 2...) — khớp đúng thứ tự SGK "Kết nối tri thức",
     *  đối chiếu tại docs/research/muc-luc-sgk/ (khi có mục lục Hoá 10-12). */
    lessonNumber: z.number().int().positive(),
    title: z.string().min(1).max(200),
    /** ① Móc thực tế. */
    hook: z.string().min(1).max(600),
    /** ② Lý thuyết cốt lõi — công thức/định luật là sự thật khoa học, không chép văn SGK. */
    theory: z.string().min(1).max(6000),
    /** ③ Ví dụ mẫu có lời giải từng bước — TỰ SOẠN, không lấy đề từ SGK (ranh giới bản quyền
     *  §0.2 kho-kien-thuc-toan-gdpt2018.md, áp dụng chung mọi môn). */
    workedExample: z
      .object({
        problem: z.string().min(1).max(1000),
        steps: z.array(z.string().min(1).max(1000)).min(1).max(10),
        answer: z.string().min(1).max(300),
      })
      .strict(),
    /** ④ Câu hỏi kiểm tra — chấm bằng core-grading, không AI. */
    checkQuestions: z.array(ChemCheckQuestionSchema).min(2).max(10),
    /** ⑤ Thẻ SRS — 2-4 thẻ chốt khái niệm cốt lõi. */
    srsCards: z
      .array(
        z
          .object({
            hoi: z.string().min(1).max(200),
            dap: z.string().min(1).max(400),
          })
          .strict(),
      )
      .min(2)
      .max(4),
    /**
     * Trạng thái duyệt chuyên môn — BẮT BUỘC. 'draft' = soạn từ kho kiến thức chưa qua giáo
     * viên; 'reviewed' = đã có giáo viên Hoá xác nhận đúng chương trình + không sai kiến thức.
     * Không có giá trị mặc định ngầm — người soạn phải ghi rõ.
     */
    reviewStatus: z.enum(['draft', 'reviewed']),
  })
  .strict()
  .refine((l) => l.id === `hoa${l.grade}-c${l.chapterNumber}-b${l.lessonNumber}`, {
    message: 'id phải khớp đúng hoa<lớp>-c<chương>-b<bài>',
  })

export type ChemCheckQuestion = z.infer<typeof ChemCheckQuestionSchema>
export type ChemLesson = z.infer<typeof ChemLessonSchema>
