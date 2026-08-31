// programmingPathArtifacts — client CRUD kho artifact cá nhân của lộ trình mục tiêu.
// Nguồn sự thật là server; không cache localStorage (nhật ký nộp bài, không cần xem ngoại tuyến).
import { getAuthHeader } from '@core/authHeader'

export interface PathArtifact {
  id: string
  pathId: string
  phaseId: string
  url: string
  note: string
  createdAt: number
}

const API = '/api/programming/path-artifact'

export async function fetchPathArtifacts(pathId: string): Promise<PathArtifact[]> {
  try {
    const res = await fetch(`${API}?pathId=${encodeURIComponent(pathId)}`, {
      headers: getAuthHeader(),
    })
    if (!res.ok) return []
    const body = (await res.json()) as { artifacts?: PathArtifact[] }
    return body.artifacts ?? []
  } catch {
    return []
  }
}

export async function createPathArtifact(
  pathId: string,
  phaseId: string,
  url: string,
  note: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ pathId, phaseId, url, note }),
    })
    if (res.ok) return { ok: true }
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    return { ok: false, error: body.error ?? 'Nộp artifact thất bại' }
  } catch {
    return { ok: false, error: 'Không kết nối được máy chủ' }
  }
}

export async function deletePathArtifact(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API}?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    })
    return res.ok
  } catch {
    return false
  }
}
