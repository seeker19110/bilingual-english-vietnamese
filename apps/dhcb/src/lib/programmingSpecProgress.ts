// programmingSpecProgress — tiến độ HƯỚNG CHUYÊN SÂU môn Lập trình phía client.
//
// Cùng khuôn với programmingProgress.ts (tiến độ bài học): nguồn sự thật là server
// (/api/programming/specialization), localStorage chỉ là bộ đệm để mở trang thấy ngay và để
// ngoại tuyến vẫn xem được.
import { getAuthHeader } from '@core/authHeader'

export type SpecStageStatus = 'in_progress' | 'completed'

export interface SpecStageProgress {
  specId: string
  stageId: string
  status: SpecStageStatus
  completedAt: number | null
}

export interface SpecProgressSnapshot {
  primarySpecId: string | null
  crossSpecIds: string[]
  stages: SpecStageProgress[]
}

export const EMPTY_SPEC_PROGRESS: SpecProgressSnapshot = {
  primarySpecId: null,
  crossSpecIds: [],
  stages: [],
}

const cacheKey = (uid: string) => `dhcb_prog_spec_${uid}`

function readCache(uid: string): SpecProgressSnapshot {
  try {
    const raw = localStorage.getItem(cacheKey(uid))
    if (!raw) return EMPTY_SPEC_PROGRESS
    const parsed = JSON.parse(raw) as Partial<SpecProgressSnapshot>
    return {
      primarySpecId: parsed.primarySpecId ?? null,
      crossSpecIds: parsed.crossSpecIds ?? [],
      stages: parsed.stages ?? [],
    }
  } catch {
    return EMPTY_SPEC_PROGRESS
  }
}

function writeCache(uid: string, snap: SpecProgressSnapshot): void {
  try {
    localStorage.setItem(cacheKey(uid), JSON.stringify(snap))
  } catch {
    // localStorage đầy/bị chặn — bỏ qua, server vẫn là nguồn sự thật.
  }
}

const API = '/api/programming/specialization'

/** Đọc tiến độ hướng; server lỗi/ngoại tuyến thì trả bộ đệm để trang vẫn hiển thị được. */
export async function fetchSpecProgress(uid: string): Promise<SpecProgressSnapshot> {
  try {
    const res = await fetch(API, { headers: getAuthHeader() })
    if (!res.ok) return readCache(uid)
    const body = (await res.json()) as SpecProgressSnapshot
    const snap: SpecProgressSnapshot = {
      primarySpecId: body.primarySpecId ?? null,
      crossSpecIds: body.crossSpecIds ?? [],
      stages: body.stages ?? [],
    }
    writeCache(uid, snap)
    return snap
  } catch {
    return readCache(uid)
  }
}

async function post(body: unknown): Promise<boolean> {
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(body),
    })
    return res.ok
  } catch {
    return false
  }
}

/** Theo một hướng. Server tự quyết vai trò (chính / nền) theo dữ liệu giáo trình. */
export async function enrollSpec(uid: string, specId: string): Promise<SpecProgressSnapshot> {
  await post({ action: 'enroll', specId })
  return fetchSpecProgress(uid)
}

/** Bỏ theo một hướng — tiến độ chặng giữ nguyên. */
export async function unenrollSpec(uid: string, specId: string): Promise<SpecProgressSnapshot> {
  await post({ action: 'unenroll', specId })
  return fetchSpecProgress(uid)
}

/** Đánh dấu một chặng đã xong / đang học. */
export async function setStageStatus(
  uid: string,
  stageId: string,
  status: SpecStageStatus,
): Promise<SpecProgressSnapshot> {
  await post({ action: 'stage', stageId, status })
  return fetchSpecProgress(uid)
}

export function isStageCompleted(snap: SpecProgressSnapshot, stageId: string): boolean {
  return snap.stages.some((s) => s.stageId === stageId && s.status === 'completed')
}

/** Số chặng đã xong của một hướng — dùng cho nhãn "2/4 chặng" ở trang danh sách. */
export function countCompletedStages(snap: SpecProgressSnapshot, specId: string): number {
  return snap.stages.filter((s) => s.specId === specId && s.status === 'completed').length
}

/** Đang theo hướng này không (chính hay nền đều tính). */
export function isEnrolled(snap: SpecProgressSnapshot, specId: string): boolean {
  return snap.primarySpecId === specId || snap.crossSpecIds.includes(specId)
}
