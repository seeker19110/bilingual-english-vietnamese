// packages/core-contracts/lesson.ts — Contract cho "Lesson" (Phase 17 Curriculum OS,
// docs/phases/17-curriculum-os.md). 1 bài học trong lộ trình — khái quát hoá đơn vị nội dung hiện
// có ở `src/data/cefr.ts` (bài ngữ vựng/ngữ pháp/hội thoại theo cấp CEFR, xem CLAUDE.md mục 13
// "Lộ trình CHUẨN CEFR": mỗi unit có ① Từ vựng → ② Ngữ pháp → ③ Hội thoại).

import { z } from 'zod'
import { versionedObject } from './version.js'
import { CefrLevelSchema, UuidSchema } from './shared.js'

export const LESSON_SCHEMA_VERSION = 1

export const LessonKindSchema = z.enum(['vocabulary', 'grammar', 'dialogue'])

export const LessonSchema = versionedObject(
  {
    id: UuidSchema,
    // Mã ổn định để liên kết SRS/tiến độ (khớp cách `lessonId` dùng trong
    // `apps/english/src/lib/srs.ts#getDueGrammarLessonIds` — LUÔN chữ thường, xem bài học
    // 2026-08-12 trong PROGRESS.md về lỗi khoá lệch hoa/thường).
    code: z
      .string()
      .min(1)
      .max(100)
      .refine((v) => v === v.toLowerCase(), 'code phải viết thường (khớp quy ước SRS hiện có)'),
    title: z.string().min(1).max(200),
    cefrLevel: CefrLevelSchema,
    kind: LessonKindSchema,
    order: z.number().int().nonnegative(),
  },
  LESSON_SCHEMA_VERSION,
)

export type Lesson = z.infer<typeof LessonSchema>
