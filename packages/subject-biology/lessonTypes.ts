// lessonTypes.ts — Kiểu + Zod schema cho BÀI HỌC môn Sinh học (GĐ3, đợt 4).
import { z } from 'zod'

export const BIOLOGY_GRADES = ['10', '11', '12'] as const
export type BiologyGrade = (typeof BIOLOGY_GRADES)[number]

export const BiologyAnswerSpecSchema = z.union([
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
])
export type BiologyAnswerSpec = z.infer<typeof BiologyAnswerSpecSchema>

export const BiologyCheckQuestionSchema = z
  .object({
    prompt: z.string().min(1).max(800),
    choices: z.array(z.object({ id: z.string().min(1), label: z.string().min(1) })).optional(),
    answer: BiologyAnswerSpecSchema,
    explain: z.string().min(1).max(1000),
  })
  .strict()
  .refine((q) => (q.answer.kind === 'choice') === (q.choices !== undefined), {
    message: "câu 'choice' phải có choices; đáp án khác thì không được có choices",
  })

export const BiologyLessonSchema = z
  .object({
    id: z.string().regex(/^sinh(10|11|12)-c\d+-b\d+$/),
    grade: z.enum(BIOLOGY_GRADES),
    chapterNumber: z.number().int().positive(),
    chapterTitle: z.string().min(1).max(200),
    lessonNumber: z.number().int().positive(),
    title: z.string().min(1).max(200),
    hook: z.string().min(1).max(600),
    theory: z.string().min(1).max(6000),
    workedExample: z
      .object({
        problem: z.string().min(1).max(1000),
        steps: z.array(z.string().min(1).max(1000)).min(1).max(10),
        answer: z.string().min(1).max(300),
      })
      .strict(),
    checkQuestions: z.array(BiologyCheckQuestionSchema).min(2).max(10),
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
    reviewStatus: z.enum(['draft', 'reviewed']),
  })
  .strict()
  .refine((l) => l.id === `sinh${l.grade}-c${l.chapterNumber}-b${l.lessonNumber}`, {
    message: 'id phải khớp đúng sinh<lớp>-c<chương>-b<bài>',
  })

export type BiologyCheckQuestion = z.infer<typeof BiologyCheckQuestionSchema>
export type BiologyLesson = z.infer<typeof BiologyLessonSchema>
