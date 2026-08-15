// packages/core-contracts/skill.ts — Contract cho "Skill" (Phase 04 Skill OS,
// docs/phases/04-skill-os.md). 1 nút trong skill graph — vd "grammar.present_perfect",
// "vocab.a2.travel". `cefrLevel` khớp `CefrWordLevel` hiện có để mọi skill neo được vào đúng cấp
// độ CEFR mà curriculum hiện tại (`src/data/cefr.ts`) đã dùng.

import { z } from 'zod'
import { versionedObject } from './version.js'
import { CefrLevelSchema, UuidSchema } from './shared.js'

export const SKILL_SCHEMA_VERSION = 1

export const SkillCategorySchema = z.enum([
  'vocabulary',
  'grammar',
  'pronunciation',
  'listening',
  'speaking',
  'writing',
])

export const SkillSchema = versionedObject(
  {
    id: UuidSchema,
    // Mã ổn định, DÙNG để tham chiếu (Evidence/Mastery trỏ tới bằng code, không phải id nội bộ
    // hay đổi) — dạng "category.slug", vd "grammar.present_perfect".
    code: z.string().regex(/^[a-z]+\.[a-z0-9_]+$/, 'code phải dạng "category.slug"'),
    label: z.string().min(1).max(200),
    category: SkillCategorySchema,
    cefrLevel: CefrLevelSchema,
  },
  SKILL_SCHEMA_VERSION,
)

export type Skill = z.infer<typeof SkillSchema>
