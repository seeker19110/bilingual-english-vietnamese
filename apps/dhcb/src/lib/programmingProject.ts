// programmingProject — workspace dự án trục phía client (PR-L3b; nhiều file từ PR-L6b).
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

/** Đọc TOÀN BỘ workspace (path → nội dung): ưu tiên server, lỗi mạng thì dùng cache (PR-L6b).
 *  File chính luôn có mặt (rơi về code khởi đầu) để trang dự án không bao giờ trắng ô soạn. */
export async function loadProjectFiles(uid: string): Promise<Record<string, string>> {
  try {
    const res = await fetch('/api/programming/project', { headers: getAuthHeader() })
    if (res.ok) {
      const body = (await res.json()) as { files: { path: string; content: string }[] }
      const files: Record<string, string> = {}
      for (const f of body.files) files[f.path] = f.content
      writeCache(uid, { files })
      return withMainFile(files)
    }
  } catch {
    // rơi xuống cache
  }
  return withMainFile(readCache(uid).files)
}

function withMainFile(files: Record<string, string>): Record<string, string> {
  return files[PROJECT_MAIN_FILE] === undefined
    ? { ...files, [PROJECT_MAIN_FILE]: PROJECT_STARTER_CODE }
    : files
}

/** Lưu MỘT file bất kỳ của workspace (cache lạc quan trước, rồi đẩy server). */
export async function saveProjectFileAt(
  uid: string,
  path: string,
  content: string,
): Promise<boolean> {
  const cache = readCache(uid)
  cache.files[path] = content
  writeCache(uid, cache)
  try {
    const res = await fetch('/api/programming/project', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ action: 'save', path, content }),
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
