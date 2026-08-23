// vitest.setup.ts — Cho phép test chạy OFFLINE (không cần server dev).
// Các loader (loadDictionary, loadCurriculum...) gọi fetch('/data/...') để tải JSON
// tĩnh từ thư mục public/. Trong môi trường test không có server, ta chặn fetch và
// đọc thẳng file tương ứng trong public/ bằng fs.

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { vi } from 'vitest'

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
