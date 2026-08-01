// Loader cho hội thoại mẫu — tải từ /public/data/dialogues.json bằng fetch().

export type { DialogueLine, Dialogue, SpeakerName } from './dialogues'
import type { Dialogue } from './dialogues'

let _promise: Promise<Record<string, Dialogue[]>> | null = null

function loadDialogues(): Promise<Record<string, Dialogue[]>> {
  if (!_promise) _promise = fetch('/data/dialogues.json').then((r) => r.json())
  return _promise
}

// Tương thích với code cũ dùng getDialogues(id).
export async function getDialogues(id: string): Promise<Dialogue[]> {
  const data = await loadDialogues()
  return data[id] ?? []
}

// Toàn bộ hội thoại kèm id (tiền tố a1-/a2-/b1-/b2-/…) — dùng cho trang Nghe (tab "Hội thoại")
// để nhóm theo cấp CEFR. Trả về map gốc, KHÔNG copy — không sửa trực tiếp giá trị trả về.
export async function getAllDialogues(): Promise<Record<string, Dialogue[]>> {
  return loadDialogues()
}
