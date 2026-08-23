// packages/core-contracts/knowledge.ts — Contract cho "Knowledge" (Phase 05 Knowledge OS,
// docs/phases/05-knowledge-os.md). 1 đơn vị kiến thức cụ thể THUỘC VỀ 1 Skill — vd từ vựng đơn lẻ,
// 1 quy tắc ngữ pháp, 1 mẫu câu. Khác Skill (khái niệm rộng, "present perfect") — Knowledge là
// từng đơn vị nhỏ có thể ôn riêng qua SRS (khớp cách `apps/dhcb/src/lib/srs.ts` hiện ôn từng
// TỪ/BÀI riêng lẻ, không ôn nguyên cả skill).

import { z } from 'zod'
import { versionedObject } from './version.js'
import { CefrLevelSchema, UuidSchema } from './shared.js'

export const KNOWLEDGE_SCHEMA_VERSION = 1

export const KnowledgeKindSchema = z.enum(['word', 'grammar_rule', 'phrase', 'sentence_pattern'])

export const KnowledgeSchema = versionedObject(
  {
    id: UuidSchema,
    skillId: UuidSchema,
    kind: KnowledgeKindSchema,
    content: z.string().min(1).max(500),
    cefrLevel: CefrLevelSchema,
  },
  KNOWLEDGE_SCHEMA_VERSION,
)

export type Knowledge = z.infer<typeof KnowledgeSchema>
