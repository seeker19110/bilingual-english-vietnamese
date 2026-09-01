// vitest.setup.ts — Cho phép test chạy OFFLINE (không cần server dev).
// Các loader (loadDictionary, loadCurriculum...) gọi fetch('/data/...') để tải JSON
// tĩnh từ thư mục public/. Trong môi trường test không có server, ta chặn fetch và
// đọc thẳng file tương ứng trong public/ bằng fs.

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { vi } from 'vitest'

// Khắc phục cảnh báo và lỗi crash của localStorage trên Node 22+ / 26+.
// QUAN TRỌNG: Gán trực tiếp lên globalThis (KHÔNG dùng vi.stubGlobal) để stub này
// sống sót qua vi.unstubAllGlobals() — nhiều file test gọi unstubAllGlobals() trong
// afterEach để dọn stub fetch, nhưng điều đó vô tình hủy luôn stub localStorage,
// khiến localStorage.clear() trong beforeEach tiếp theo crash với "Cannot read
// properties of undefined". Gán thẳng lên globalThis thoát khỏi vòng kiểm soát
// của Vitest stub registry nên không bị unstub.
try {
  globalThis.localStorage?.clear()
} catch {
  // localStorage của Node 26+ tồn tại nhưng ném lỗi khi dùng không có --localstorage-file
  delete (globalThis as Record<string, unknown>).localStorage
}

if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>()
  // Gán thẳng (không qua vi.stubGlobal) để vi.unstubAllGlobals() không hủy được.
  ;(globalThis as Record<string, unknown>).localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    },
  }
}

const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), 'apps', 'dhcb', 'public')

vi.stubGlobal('fetch', async (input: RequestInfo | URL): Promise<Response> => {
  const url = typeof input === 'string' ? input : input.toString()
  // Lấy pathname (bỏ origin nếu happy-dom đã ghép http://localhost:3000)
  let pathname: string
  try {
    pathname = new URL(url, 'http://localhost').pathname
  } catch {
    pathname = url
  }

  const filePath = join(PUBLIC_DIR, pathname)
  const data = await readFile(filePath, 'utf8')
  return new Response(data, { status: 200, headers: { 'content-type': 'application/json' } })
})
