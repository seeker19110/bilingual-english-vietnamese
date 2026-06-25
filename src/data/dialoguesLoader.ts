// Loader cho hội thoại mẫu — tải từ /public/data/dialogues.json bằng fetch().

export type { DialogueLine, Dialogue } from './dialogues'
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
