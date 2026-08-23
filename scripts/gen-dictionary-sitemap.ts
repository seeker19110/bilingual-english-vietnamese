// scripts/gen-dictionary-sitemap.ts
// Sinh public/sitemap-words.xml — 1 URL /tu-vung/<từ> cho MỖI từ GỐC trong từ điển (bỏ qua
// entry biến thể, vd "went" có base="go" — chỉ "go" mới có trang riêng, tránh hàng nghìn URL
// gần trùng nội dung mà công cụ tìm kiếm coi là "thin/duplicate content").
//
// Tách RIÊNG khỏi public/sitemap.xml (file tay, liệt kê các trang chính của app) — không ghi đè
// file đó, chỉ thêm 1 dòng Sitemap: trỏ tới file này trong robots.txt.
//
// Chạy: npx tsx scripts/gen-dictionary-sitemap.ts   (an toàn để chạy lại — ghi đè)

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DictEntry } from '../apps/english/src/types.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DICT_DIR = path.join(ROOT, 'apps/english/public/data/dictionary')
const OUT_FILE = path.join(ROOT, 'apps/english/public/sitemap-words.xml')
// SITE_URL/VITE_SITE_URL: cùng quy ước với api/_lib/passwordReset.ts, App.tsx, ShareResultCard.tsx
// — cho phép đổi domain (vd donghanhcungban.org) mà không cần sửa code, chỉ cần đặt biến môi
// trường lúc chạy script.
const SITE_URL = (
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  'https://www.donghanhcungban.org'
).replace(/\/$/, '')

let dict: DictEntry[] = []
for (let i = 0; i < 10; i++) {
  const f = path.join(DICT_DIR, `chunk-${String(i).padStart(3, '0')}.json`)
  if (fs.existsSync(f)) dict = dict.concat(JSON.parse(fs.readFileSync(f, 'utf8')))
}
if (dict.length === 0) {
  throw new Error(`Không đọc được từ điển ở ${DICT_DIR} — kiểm tra lại đường dẫn.`)
}

// Chỉ từ GỐC (không có `base`) — mỗi từ chỉ 1 trang, tránh trùng URL nếu 2 entry cùng "word".
const seen = new Set<string>()
const words = dict.filter((e) => {
  if (e.base) return false
  const key = e.word.toLowerCase()
  if (seen.has(key)) return false
  seen.add(key)
  return true
})

const today = new Date().toISOString().slice(0, 10)

// encode ký tự đặc biệt trong URL (& < > vốn không hợp lệ trong XML, dù từ điển tiếng Anh hiếm
// khi có nhưng vẫn escape cho chắc — 1 từ lỗi làm hỏng cả sitemap XML).
function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const urlEntries = words
  .map(
    (e) => `  <url>
    <loc>${SITE_URL}/tu-vung/${encodeURIComponent(escapeXml(e.word))}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`

fs.writeFileSync(OUT_FILE, xml)
console.log(`✅ Đã sinh ${OUT_FILE} — ${words.length} URL từ vựng.`)
