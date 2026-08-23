// scripts/extract-words-cefr-subset.ts
// Script BẢO TRÌ (không cần chạy thường xuyên) — tạo lại data/words-cefr-dataset/subset.csv
// từ dữ liệu gốc "Words-CEFR-Dataset" (MIT, Maximax67) khi public/data/dictionary/ có thêm
// từ mới chưa được trích lọc. Xem data/words-cefr-dataset/SOURCE.md để biết nguồn/giấy phép
// đầy đủ + lý do chỉ commit bản TRÍCH LỌC (dữ liệu gốc ~13MB, phần lớn không liên quan tới
// từ vựng của app này).
//
// Chuẩn bị: tải 3 file CSV gốc (xem lệnh curl trong SOURCE.md), rồi chạy:
//   WORDS_CEFR_RAW_DIR=/đường/dẫn/chứa/3-file-csv npm run extract:words-cefr

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DICT_DIR = process.env.DICT_DIR
  ? path.resolve(PROJECT_ROOT, process.env.DICT_DIR)
  : path.join(PROJECT_ROOT, 'apps/dhcb/public/data/dictionary')
const OUT_PATH = path.join(PROJECT_ROOT, 'data/words-cefr-dataset/subset.csv')

interface DictEntry {
  word: string
}

// Tách dòng CSV đơn giản: mọi cột CẦN DÙNG (word_id, word, pos_tag_id, tag, level) không bao
// giờ chứa dấu phẩy — chỉ cột "description" (không dùng tới) của pos_tags.csv mới có, nên
// split(',') thô rồi bỏ ngoặc kép là đủ, không cần parser CSV đầy đủ.
function splitCsvLine(line: string): string[] {
  return line.split(',').map((cell) => cell.replace(/^"|"$/g, ''))
}

function readCsvRows(filePath: string): string[][] {
  const lines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/)
  return lines
    .slice(1)
    .filter((l) => l.trim().length > 0)
    .map(splitCsvLine)
}

function main(): void {
  const rawDirArg = process.env.WORDS_CEFR_RAW_DIR
  if (!rawDirArg) {
    console.error(
      '❌ Thiếu WORDS_CEFR_RAW_DIR — truyền thư mục chứa words.csv/word_pos.csv/pos_tags.csv gốc.',
    )
    console.error('   Xem lệnh tải ở data/words-cefr-dataset/SOURCE.md.')
    process.exit(1)
  }
  const rawDir = path.resolve(PROJECT_ROOT, rawDirArg)

  const dictWords = new Set<string>()
  const dictFiles = fs.readdirSync(DICT_DIR).filter((f) => /^chunk-\d+\.json$/.test(f))
  for (const file of dictFiles) {
    const entries = JSON.parse(fs.readFileSync(path.join(DICT_DIR, file), 'utf-8')) as DictEntry[]
    for (const e of entries) {
      const w = e.word.trim().toLowerCase()
      if (!w.includes(' ')) dictWords.add(w) // dataset chỉ có từ đơn (Google 1-grams)
    }
  }
  console.log(`📋 ${dictWords.size} từ đơn trong từ điển dự án`)

  const posTags = new Map<string, string>() // tag_id -> tag (vd "NN")
  for (const [tagId, tag] of readCsvRows(path.join(rawDir, 'pos_tags.csv'))) {
    if (tagId && tag) posTags.set(tagId, tag)
  }

  const relevantWordIds = new Map<string, string>() // word_id -> word (chỉ giữ từ khớp)
  for (const [wordId, wordRaw] of readCsvRows(path.join(rawDir, 'words.csv'))) {
    if (!wordId || !wordRaw) continue
    const word = wordRaw.toLowerCase()
    if (dictWords.has(word)) relevantWordIds.set(wordId, word)
  }
  console.log(`📋 ${relevantWordIds.size}/${dictWords.size} từ khớp trong Words-CEFR-Dataset`)

  const rows: Array<[string, string, string]> = []
  for (const cols of readCsvRows(path.join(rawDir, 'word_pos.csv'))) {
    const [, wordId, tagId, , , level] = cols
    if (!wordId || !tagId || !level) continue
    const word = relevantWordIds.get(wordId)
    const tag = posTags.get(tagId)
    if (!word || !tag) continue
    rows.push([word, tag, level])
  }
  rows.sort(([a], [b]) => a.localeCompare(b))

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true })
  const lines = ['word,pos_tag,level', ...rows.map((r) => r.join(','))]
  fs.writeFileSync(OUT_PATH, lines.join('\n') + '\n')

  console.log(`✅ Ghi ${rows.length} dòng vào ${path.relative(PROJECT_ROOT, OUT_PATH)}`)
}

main()
