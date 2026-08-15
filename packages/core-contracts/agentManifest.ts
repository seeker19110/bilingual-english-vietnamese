// packages/core-contracts/agentManifest.ts — Contract cho "AgentManifest" (Phase 26 Agent
// Permissions, docs/phases/26-agent-permissions.md). Khai báo 1 agent AI được PHÉP làm gì —
// nguyên tắc "Multi-agent authority" của MASTER_SPEC.md: "Agents propose; domain engines and
// policy validate/commit... Agents never directly mutate mastery, permissions, billing or
// authoritative learner state." `permissions` là danh sách hành động agent này được ĐỀ XUẤT
// (không phải TỰ THỰC THI) — vd "propose_mastery_update", "propose_next_lesson".

import { z } from 'zod'
import { versionedObject } from './version.js'

export const AGENT_MANIFEST_SCHEMA_VERSION = 1

export const AgentManifestSchema = versionedObject(
  {
    // Tên định danh ổn định của agent, vd "tutor-agent", "curriculum-agent" (khớp tên các phase
    // 14/18/22 — mỗi Phase *-agent trong docs/phases/ tương ứng đúng 1 AgentManifest).
    name: z
      .string()
      .regex(/^[a-z][a-z0-9-]*$/, 'name phải dạng kebab-case, bắt đầu bằng chữ thường'),
    version: z.number().int().positive(),
    // Danh sách hành động ĐỀ XUẤT được — mỗi tên bắt đầu "propose_" để nhắc rõ ràng agent không
    // bao giờ tự commit thẳng vào learner state (nguyên tắc Multi-agent authority ở trên).
    permissions: z.array(z.string().regex(/^propose_[a-z_]+$/)).min(1),
  },
  AGENT_MANIFEST_SCHEMA_VERSION,
)

export type AgentManifest = z.infer<typeof AgentManifestSchema>
