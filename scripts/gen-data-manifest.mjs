// scripts/gen-data-manifest.mjs — Sinh public/data/manifest.json lúc build.
//
// Manifest liệt kê MỌI file JSON tĩnh trong public/data/ kèm hash nội dung + dung lượng.
// Client (src/lib/dataPrecache.ts) so hash để biết file nào server đã đổi → chỉ tải lại
// đúng file đó, và biết khi nào đã tải đủ toàn bộ (offline-ready).
//
// Chạy TRƯỚC `vite build` (xem script "build" trong package.json) để manifest được copy
// vào dist cùng các file data.

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA_DIR = join(ROOT, 'apps', 'english', 'public', 'data')
const MANIFEST_PATH = join(DATA_DIR, 'manifest.json')

// Duyệt đệ quy mọi file .json trong public/data (BỎ chính manifest.json).
function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      out.push(...walk(full))
    } else if (name.endsWith('.json') && full !== MANIFEST_PATH) {
      out.push(full)
    }
  }
  return out
}

function shortHash(buf) {
  return createHash('sha256').update(buf).digest('hex').slice(0, 16)
}

const files = walk(DATA_DIR)
  .map((full) => {
    const buf = readFileSync(full)
    // path tương đối tính từ public/ → vd "data/dictionary/chunk-000.json"
    const path = relative(join(ROOT, 'apps', 'english', 'public'), full)
      .split('\\')
      .join('/')
    return { path, hash: shortHash(buf), size: buf.length }
  })
  .sort((a, b) => a.path.localeCompare(b.path))

const totalBytes = files.reduce((s, f) => s + f.size, 0)
// version = hash tổng của tất cả hash → đổi khi BẤT KỲ file nào đổi.
const version = shortHash(files.map((f) => f.path + ':' + f.hash).join('|'))

const manifest = { version, generatedAt: new Date().toISOString(), totalBytes, files }
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest))

console.log(
  `[gen-data-manifest] ${files.length} file, ${(totalBytes / 1024 / 1024).toFixed(1)}MB, version ${version}`,
)
