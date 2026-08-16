// packages/core-contracts/lifeGraph.ts — Contract cho "LifeGraphNode"/"LifeGraphEdge" (V2-02).
// Node types và relation types lấy ĐÚNG danh sách tối thiểu đã liệt kê ở
// `docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md` mục 5 "Life Graph" — không tự thêm bớt.
//
// Theo đúng nguyên tắc "Không bắt đầu bằng generic Node(type, data JSONB) làm API domain duy
// nhất" (cùng mục 5): `data` ở đây CHỈ chứa field CHUNG cho mọi loại node (label, mô tả ngắn) —
// payload chuyên sâu theo từng `type` (vd Goal cần `targetDate`, Skill cần `cefrLevel`) thuộc về
// domain/read model riêng, KHÔNG nhồi vào contract lõi này (tránh lặp lại đúng anti-pattern mà
// tài liệu kiến trúc đã cảnh báo).

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const LIFE_GRAPH_NODE_SCHEMA_VERSION = 1
export const LIFE_GRAPH_EDGE_SCHEMA_VERSION = 1

export const LifeGraphNodeTypeSchema = z.enum([
  'Person',
  'Goal',
  'Project',
  'Skill',
  'Organization',
  'Event',
  'Commitment',
  'Constraint',
  'Decision',
])
export type LifeGraphNodeType = z.infer<typeof LifeGraphNodeTypeSchema>

export const LifeGraphNodeSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    type: LifeGraphNodeTypeSchema,
    label: z.string().min(1).max(200),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
    // Xoá/supersede có audit (mục 5, "delete/supersede có audit") — node không bị xoá cứng,
    // chỉ đánh dấu archived, giữ lịch sử để trace được.
    archivedAt: IsoDateTimeSchema.optional(),
  },
  LIFE_GRAPH_NODE_SCHEMA_VERSION,
)

export type LifeGraphNode = z.infer<typeof LifeGraphNodeSchema>

export const LifeRelationSchema = z.enum([
  'requires',
  'contributes_to',
  'supports',
  'blocks',
  'conflicts_with',
  'belongs_to',
  'involves',
])
export type LifeRelation = z.infer<typeof LifeRelationSchema>

export const LifeGraphEdgeSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    fromNodeId: UuidSchema,
    toNodeId: UuidSchema,
    relation: LifeRelationSchema,
    // Provenance bắt buộc (mục 5, "có provenance") — nguồn nào tạo ra edge này (user tự khai,
    // suy luận từ hội thoại, import...). Dùng string tự do thay vì union cứng vì nguồn có thể
    // đa dạng hơn `FactOrigin` ở `personalFact.ts` (vd "companion_planner", "manual_review").
    provenance: z.string().min(1).max(100),
    createdAt: IsoDateTimeSchema,
    archivedAt: IsoDateTimeSchema.optional(),
  },
  LIFE_GRAPH_EDGE_SCHEMA_VERSION,
).refine((edge) => edge.fromNodeId !== edge.toNodeId, {
  message: 'fromNodeId và toNodeId không được trùng nhau (self-loop không hợp lệ)',
})

export type LifeGraphEdge = z.infer<typeof LifeGraphEdgeSchema>
