// pathArtifactService — Kho ARTIFACT CÁ NHÂN của lộ trình mục tiêu (bảng migration 0074).
//
// Cùng khuôn với pathProgressService.ts: đối chiếu pathId/phaseId với `learningPaths/registry`
// trước khi ghi. KHÔNG chấm artifact bằng AI (quyết định đặc tả đợt 3) — chỉ lưu link + ghi
// chú người học tự khai. CRUD giới hạn CHỈ create/list/delete của CHÍNH người dùng.
import type { Pool } from 'pg'
import { getLearningPath } from './learningPaths/registry.js'

export interface PathArtifact {
  id: string
  pathId: string
  phaseId: string
  url: string
  note: string
  createdAt: number
}

export interface ArtifactResult {
  ok: true
}
export interface ArtifactError {
  ok: false
  error: string
}
export type ArtifactWriteResult = ArtifactResult | ArtifactError

interface Row {
  id: string
  path_id: string
  phase_id: string
  url: string
  note: string
  created_at: Date
}

function normalizeId(id: string): string {
  return id.trim().toLowerCase()
}

function toArtifact(r: Row): PathArtifact {
  return {
    id: r.id,
    pathId: r.path_id,
    phaseId: r.phase_id,
    url: r.url,
    note: r.note,
    createdAt: r.created_at.getTime(),
  }
}

/** Danh sách artifact của một người dùng cho một lộ trình, mới nhất trước. */
export async function listPathArtifacts(
  pool: Pool,
  userId: string,
  rawPathId: string,
): Promise<PathArtifact[]> {
  const pathId = normalizeId(rawPathId)
  const res = await pool.query<Row>(
    `select id, path_id, phase_id, url, note, created_at from programming.path_artifacts
     where user_id = $1 and path_id = $2 order by created_at desc`,
    [userId, pathId],
  )
  return res.rows.map(toArtifact)
}

/** Từ chối nếu pathId/phaseId lạ (chặn ghi rác qua id đúng khuôn regex nhưng không có thật). */
function validatePhase(rawPathId: string, rawPhaseId: string): ArtifactError | null {
  const pathId = normalizeId(rawPathId)
  const phaseId = normalizeId(rawPhaseId)
  const path = getLearningPath(pathId)
  if (!path) return { ok: false, error: `Lộ trình "${rawPathId}" không tồn tại` }
  const belongs = path.phases.some((p) => p.id === phaseId)
  if (!belongs)
    return { ok: false, error: `Giai đoạn "${rawPhaseId}" không thuộc lộ trình "${rawPathId}"` }
  return null
}

/** Nộp một artifact mới. Nộp lại nhiều lần cho cùng giai đoạn là hợp lệ (nhật ký, không ghi đè). */
export async function createPathArtifact(
  pool: Pool,
  userId: string,
  rawPathId: string,
  rawPhaseId: string,
  url: string,
  note: string,
): Promise<ArtifactWriteResult> {
  const invalid = validatePhase(rawPathId, rawPhaseId)
  if (invalid) return invalid

  await pool.query(
    `insert into programming.path_artifacts (user_id, path_id, phase_id, url, note)
     values ($1, $2, $3, $4, $5)`,
    [userId, normalizeId(rawPathId), normalizeId(rawPhaseId), url, note],
  )
  return { ok: true }
}

/** Xoá MỘT artifact — chỉ xoá được của chính mình (điều kiện user_id trong WHERE). */
export async function deletePathArtifact(
  pool: Pool,
  userId: string,
  artifactId: string,
): Promise<ArtifactWriteResult> {
  const res = await pool.query(
    `delete from programming.path_artifacts where id = $1 and user_id = $2`,
    [artifactId, userId],
  )
  if (res.rowCount === 0) {
    return { ok: false, error: 'Không tìm thấy artifact này (đã xoá hoặc không phải của bạn)' }
  }
  return { ok: true }
}
