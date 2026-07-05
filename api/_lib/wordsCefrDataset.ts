// api/_lib/wordsCefrDataset.ts — tầng tra cứu CEFR THỨ 2 (sau CEFR-J/Octanove), bổ sung
// từ biến thể (số nhiều, quá khứ, gerund...) + từ ít phổ biến hơn mà CEFR-J không có.
// Nguồn + giấy phép — xem data/words-cefr-dataset/SOURCE.md:
//   Words-CEFR-Dataset by Maxim Belikov (Maximax67), MIT License.
//   https://github.com/Maximax67/Words-CEFR-Dataset
// Tách logic thuần (không I/O) để test — scripts/tag-cefr-levels.ts lo đọc file CSV.

import type { CefrWordLevel } from './cefrTagging'

export interface WordsCefrRow {
  word: string
  posTag: string // nhãn Penn Treebank gốc, vd "NN", "VB", "JJR"
  level: number // 1-6 (1=A1...6=C2); SỐ NGUYÊN = khớp CEFR-J gốc, SỐ THẬP PHÂN = nội suy
}

// Cột: word,pos_tag,level (header dòng đầu).
export function parseWordsCefrCsv(raw: string): WordsCefrRow[] {
  const rows: WordsCefrRow[] = []
  const lines = raw.split(/\r?\n/)

  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const [word, posTag, levelRaw] = line.split(',')
    if (!word || !posTag || !levelRaw) continue
    const level = Number(levelRaw)
    if (!Number.isFinite(level) || level < 1 || level > 6) continue
    rows.push({ word: word.trim().toLowerCase(), posTag: posTag.trim(), level })
  }

  return rows
}

// pos viết tắt trong public/data/dictionary/chunk-*.json → nhãn Penn Treebank tương ứng.
// "idiom" không map được (dataset chỉ có từ đơn, không có cụm từ) → luôn fallback AI.
const POS_MAP: Readonly<Record<string, readonly string[]>> = {
  n: ['NN', 'NNS', 'NNP', 'NNPS'],
  v: ['VB', 'VBD', 'VBG', 'VBN', 'VBP', 'VBZ', 'MD'],
  adj: ['JJ', 'JJR', 'JJS'],
  adv: ['RB', 'RBR', 'RBS', 'WRB'],
  prep: ['IN'],
  interj: ['UH'],
  conj: ['CC'],
  art: ['DT', 'PDT', 'WDT'],
  num: ['CD'],
  pron: ['PRP', 'PRP$', 'WP', 'WP$'],
  idiom: [],
}

const CEFR_LABELS: readonly CefrWordLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

function levelToCefr(level: number): CefrWordLevel {
  const rounded = Math.min(6, Math.max(1, Math.round(level)))
  return CEFR_LABELS[rounded - 1]!
}

export interface WordsCefrIndex {
  byWordPos: Map<string, number> // key: `${word}::${posTag}` → level gốc (có thể lẻ)
  byWord: Map<string, number[]> // word → toàn bộ level gốc (mọi pos) để tra fallback
}

export function buildWordsCefrIndex(rows: WordsCefrRow[]): WordsCefrIndex {
  const byWordPos = new Map<string, number>()
  const byWord = new Map<string, number[]>()

  for (const row of rows) {
    const key = `${row.word}::${row.posTag}`
    if (!byWordPos.has(key)) byWordPos.set(key, row.level)

    const levels = byWord.get(row.word) ?? []
    levels.push(row.level)
    byWord.set(row.word, levels)
  }

  return { byWordPos, byWord }
}

export interface WordsCefrLookupResult {
  level: CefrWordLevel
  // 'confirmed': giá trị gốc là số NGUYÊN (đã spot-check khớp 100% với CEFR-J thật cho các từ
  // có trong cả 2 nguồn) — 'estimated': có ít nhất 1 giá trị liên quan là số THẬP PHÂN, tức
  // dataset gốc đã NỘI SUY theo tần suất (không tra được CEFR-J), độ tin cậy thấp hơn.
  confidence: 'confirmed' | 'estimated'
}

// Tra cấp CEFR: khớp đúng pos trước, nếu wordlist không có đúng pos đó thì dùng cấp DUY NHẤT
// của từ (an toàn vì không mâu thuẫn) — giống logic cefrjLookup.lookupCefrLevel, nhưng làm
// việc trên số 1-6 thay vì nhãn A1-C2 sẵn vì dữ liệu gốc có thể là số thập phân (nội suy).
export function lookupWordsCefrLevel(
  index: WordsCefrIndex,
  word: string,
  pos: string,
): WordsCefrLookupResult | undefined {
  const w = word.trim().toLowerCase()
  if (!w) return undefined

  for (const posTag of POS_MAP[pos] ?? []) {
    const level = index.byWordPos.get(`${w}::${posTag}`)
    if (level !== undefined) {
      return {
        level: levelToCefr(level),
        confidence: Number.isInteger(level) ? 'confirmed' : 'estimated',
      }
    }
  }

  const levels = index.byWord.get(w)
  if (!levels || levels.length === 0) return undefined
  const labels = new Set(levels.map((lvl) => levelToCefr(lvl)))
  if (labels.size !== 1) return undefined // mâu thuẫn giữa các pos → không suy đoán, để AI xử lý

  return {
    level: [...labels][0]!,
    confidence: levels.every((lvl) => Number.isInteger(lvl)) ? 'confirmed' : 'estimated',
  }
}
