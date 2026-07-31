// scripts/gen-vocab-pdf.ts
// Sinh file PDF "500 từ vựng A1-A2" — quà tặng mồi marketing (lead magnet), chi phí
// 0đ vì lấy từ dữ liệu từ điển ĐÃ CÓ SẴN (public/data/dictionary/chunk-*.json).
//
// Logic lọc: level A1 hoặc A2, sắp theo freq tăng dần (từ thông dụng nhất trước,
// thiếu freq xếp cuối), lấy 500 từ đầu — giống cách gen-cefr-c1c2-vocab.ts đọc/gộp
// toàn bộ chunk JSON từ điển.
//
// Font: PDF mặc định (Helvetica) KHÔNG có dấu tiếng Việt → nhúng DejaVu Sans
// (scripts/assets/fonts/), phông Unicode phủ đủ bảng chữ cái tiếng Việt, license
// tự do (Bitstream Vera license), có sẵn trong thư mục assets của repo.
//
// Chạy: npx tsx scripts/gen-vocab-pdf.ts   (an toàn để chạy lại — ghi đè)

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type { DictEntry } from '../apps/english/src/types.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DICT_DIR = path.join(ROOT, 'public/data/dictionary')
const FONT_REGULAR = path.join(ROOT, 'scripts/assets/fonts/DejaVuSans.ttf')
const FONT_BOLD = path.join(ROOT, 'scripts/assets/fonts/DejaVuSans-Bold.ttf')
const OUT_DIR = path.join(ROOT, 'public/downloads')
const OUT_FILE = path.join(OUT_DIR, '500-tu-vung-a1-a2.pdf')

const WORD_COUNT = 500

// ── 1. Nạp toàn bộ từ điển ────────────────────────────────────────────────
let dict: DictEntry[] = []
for (let i = 0; i < 10; i++) {
  const f = path.join(DICT_DIR, `chunk-${String(i).padStart(3, '0')}.json`)
  if (fs.existsSync(f)) dict = dict.concat(JSON.parse(fs.readFileSync(f, 'utf8')))
}
if (dict.length === 0) {
  throw new Error(`Không đọc được từ điển ở ${DICT_DIR} — kiểm tra lại đường dẫn.`)
}

// ── 2. Lọc A1/A2, sắp theo freq (thông dụng trước), thiếu freq xếp cuối ────
function sortByFreq(a: DictEntry, b: DictEntry): number {
  if (a.freq == null && b.freq == null) return 0
  if (a.freq == null) return 1
  if (b.freq == null) return -1
  return a.freq - b.freq
}

const a1a2Words = dict
  .filter((e) => e.level === 'A1' || e.level === 'A2')
  .filter((e) => !e.base) // bỏ entry biến thể (went, geese…), chỉ giữ từ gốc
  .sort(sortByFreq)
  .slice(0, WORD_COUNT)

if (a1a2Words.length < WORD_COUNT) {
  console.warn(
    `⚠️  Chỉ tìm được ${a1a2Words.length} từ A1/A2 (cần ${WORD_COUNT}) — vẫn tạo PDF với số từ hiện có.`,
  )
}

const a1Words = a1a2Words.filter((e) => e.level === 'A1')
const a2Words = a1a2Words.filter((e) => e.level === 'A2')

// ── 3. Sinh PDF ────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  const font = await pdfDoc.embedFont(fs.readFileSync(FONT_REGULAR))
  const fontBold = await pdfDoc.embedFont(fs.readFileSync(FONT_BOLD))

  const PAGE_W = 595.28 // A4 pt
  const PAGE_H = 841.89
  const MARGIN = 50
  const ACCENT = rgb(0.11, 0.38, 0.75) // xanh dương thương hiệu (gần --a-primary Xanh đêm)
  const TEXT = rgb(0.12, 0.12, 0.14)
  const MUTED = rgb(0.45, 0.45, 0.48)

  let page: PDFPage = pdfDoc.addPage([PAGE_W, PAGE_H])
  let y = PAGE_H - MARGIN

  function newPage() {
    page = pdfDoc.addPage([PAGE_W, PAGE_H])
    y = PAGE_H - MARGIN
  }

  function ensureSpace(needed: number) {
    if (y - needed < MARGIN) newPage()
  }

  function drawText(
    text: string,
    opts: { x?: number; size?: number; f?: PDFFont; color?: ReturnType<typeof rgb> },
  ) {
    page.drawText(text, {
      x: opts.x ?? MARGIN,
      y,
      size: opts.size ?? 11,
      font: opts.f ?? font,
      color: opts.color ?? TEXT,
    })
  }

  // ── Trang bìa ──
  y = PAGE_H / 2 + 80
  const title = 'GIA SƯ TIẾNG ANH AI'
  const titleSize = 26
  const titleWidth = fontBold.widthOfTextAtSize(title, titleSize)
  drawText(title, {
    x: (PAGE_W - titleWidth) / 2,
    size: titleSize,
    f: fontBold,
    color: ACCENT,
  })
  y -= 46

  const subtitle = '500 Từ Vựng Tiếng Anh Thông Dụng Nhất (A1 - A2)'
  const subSize = 17
  const subWidth = fontBold.widthOfTextAtSize(subtitle, subSize)
  drawText(subtitle, { x: (PAGE_W - subWidth) / 2, size: subSize, f: fontBold, color: TEXT })
  y -= 34

  const desc = [
    'Bộ từ vựng nền tảng, chọn lọc theo tần suất sử dụng thực tế,',
    'kèm phiên âm và ví dụ song ngữ Anh - Việt.',
    '',
    'Học cùng gia sư AI hai chiều Việt <-> Anh:',
    'hội thoại, sửa lỗi, chấm điểm, luyện nói phát âm chuẩn.',
  ]
  const descSize = 12
  for (const line of desc) {
    const w = font.widthOfTextAtSize(line, descSize)
    drawText(line, { x: (PAGE_W - w) / 2, size: descSize, f: font, color: MUTED })
    y -= 20
  }

  newPage()

  // ── Danh sách từ vựng, chia A1 / A2 ──
  const sections: { title: string; words: DictEntry[] }[] = [
    { title: `A1 — Cơ bản (${a1Words.length} từ)`, words: a1Words },
    { title: `A2 — Sơ cấp (${a2Words.length} từ)`, words: a2Words },
  ]

  for (const section of sections) {
    ensureSpace(40)
    y -= 6
    drawText(section.title, { size: 15, f: fontBold, color: ACCENT })
    y -= 22

    let idx = 0
    for (const entry of section.words) {
      idx += 1
      const ipa = entry.ipa_en ? ` /${entry.ipa_en}/` : ''
      const line1 = `${idx}. ${entry.word}${ipa} — ${entry.vi}`
      const line2 = `    ${entry.ex_en}`
      const line3 = `    ${entry.ex_vi}`

      ensureSpace(52)
      drawText(line1, { size: 11, f: fontBold })
      y -= 15
      drawText(line2, { size: 9.5, f: font, color: MUTED })
      y -= 13
      drawText(line3, { size: 9.5, f: font, color: MUTED })
      y -= 18
    }
    y -= 10
  }

  const pdfBytes = await pdfDoc.save()
  fs.writeFileSync(OUT_FILE, pdfBytes)

  console.log(
    `✅ Đã sinh ${OUT_FILE} — ${a1a2Words.length} từ (A1: ${a1Words.length}, A2: ${a2Words.length}), ${pdfDoc.getPageCount()} trang.`,
  )
}

main().catch((err) => {
  console.error('❌ Lỗi sinh PDF:', err)
  process.exit(1)
})
