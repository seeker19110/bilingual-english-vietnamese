// programmingProject — workspace dự án trục phía client (PR-L3b).
// Server (/api/programming/project) là nguồn sự thật; localStorage là bộ đệm để mở tức thì
// và làm việc ngoại tuyến (cùng mô hình programmingProgress.ts).
import { getAuthHeader } from '@core/authHeader'
import { PROJECT_MAIN_FILE, PROJECT_STARTER_CODE } from '@dhcb/subject-programming/projectSteps'

const cacheKey = (uid: string) => `dhcb_prog_project_${uid}`

interface ProjectCache {
  files: Record<string, string>
}

function readCache(uid: string): ProjectCache {
  try {
    const raw = localStorage.getItem(cacheKey(uid))
    return raw ? (JSON.parse(raw) as ProjectCache) : { files: {} }
  } catch {
    return { files: {} }
  }
}

function writeCache(uid: string, cache: ProjectCache): void {
  try {
    localStorage.setItem(cacheKey(uid), JSON.stringify(cache))
  } catch {
    // localStorage đầy/bị chặn — bỏ qua, server vẫn giữ bản thật.
  }
}

/** Đọc nội dung file chính của dự án: ưu tiên server, lỗi mạng thì dùng cache/starter. */
export async function loadProjectFile(uid: string): Promise<string> {
  try {
    const res = await fetch('/api/programming/project', { headers: getAuthHeader() })
    if (res.ok) {
      const body = (await res.json()) as { files: { path: string; content: string }[] }
      const files: Record<string, string> = {}
      for (const f of body.files) files[f.path] = f.content
      writeCache(uid, { files })
      const main = files[PROJECT_MAIN_FILE]
      if (main !== undefined) return main
    }
  } catch {
    // rơi xuống cache
  }
  return readCache(uid).files[PROJECT_MAIN_FILE] ?? PROJECT_STARTER_CODE
}

/** Lưu file chính: cache trước (lạc quan), rồi đẩy server. Trả false nếu server từ chối. */
export async function saveProjectFile(uid: string, content: string): Promise<boolean> {
  const cache = readCache(uid)
  cache.files[PROJECT_MAIN_FILE] = content
  writeCache(uid, cache)
  try {
    const res = await fetch('/api/programming/project', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ action: 'save', path: PROJECT_MAIN_FILE, content }),
    })
    return res.ok
  } catch {
    return false // ngoại tuyến — cache đã giữ, lần lưu sau sẽ đẩy lại
  }
}

/** Chốt snapshot milestone chặng (vd 'p1') — gọi khi đạt bước cuối chặng. */
export async function snapshotMilestone(milestone: string): Promise<boolean> {
  try {
    const res = await fetch('/api/programming/project', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ action: 'snapshot', milestone }),
    })
    return res.ok
  } catch {
    return false
  }
}
