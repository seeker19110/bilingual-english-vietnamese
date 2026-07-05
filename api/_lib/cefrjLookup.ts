// api/_lib/cefrjLookup.ts — tra cấp CEFR bằng wordlist THẬT (không phải AI ước lượng).
// Nguồn + giấy phép (BẮT BUỘC ghi nguồn khi dùng) — xem data/cefrj/SOURCE.md:
//   - CEFR-J Vocabulary Profile v1.5 (A1-B2) — Yukio Tono, Tokyo University of Foreign
//     Studies. Dùng được cho nghiên cứu LẪN thương mại, miễn phí, chỉ cần ghi nguồn.
//   - Octanove Vocabulary Profile C1/C2 v1.0 — Octanove Labs, giấy phép CC BY-SA 4.0.
// Tải từ: https://github.com/openlanguageprofiles/olp-en-cefrj
// Tách logic thuần (không I/O) để test — scripts/tag-cefr-levels.ts lo đọc file CSV.

import type { CefrWordLevel } from './cefrTagging'

const CEFR_LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])

function isCefrWordLevel(v: string): v is CefrWordLevel {
  return CEFR_LEVELS.has(v)
}

export interface CefrjRow {
  headwords: string[] // 1 dòng có thể có nhiều biến thể viết, vd "adviser/advisor" → 2 từ
  pos: string // pos gốc theo CEFR-J (viết thường), vd "noun", "verb", "be-verb"...
  level: CefrWordLevel
}

// Cột: headword,pos,CEFR,... — 3 cột đầu KHÔNG BAO GIỜ chứa dấu phẩy/ngoặc kép trong dữ
// liệu thật (chỉ các cột mô tả chủ đề phía sau mới có, vd "News, lifestyles..."), nên chỉ
// cần lấy 3 cột đầu bằng split(',') thay vì viết parser CSV đầy đủ.
export function parseCefrjCsv(raw: string): CefrjRow[] {
  const rows: CefrjRow[] = []
  const lines = raw.split(/\r?\n/)

  for (const line of lines) {
    if (!line.trim()) continue
    const [headwordRaw, posRaw, levelRawCell] = line.split(',')
    if (!headwordRaw || !posRaw || !levelRawCell) continue
    const level = levelRawCell.trim().toUpperCase()
    if (!isCefrWordLevel(level)) continue // bỏ qua dòng header ("CEFR") + dòng hỏng

    const headwords = headwordRaw
      .split('/')
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length > 0)
    if (headwords.length === 0) continue

    rows.push({ headwords, pos: posRaw.trim().toLowerCase(), level })
  }

  return rows
}

// pos viết tắt trong public/data/dictionary/chunk-*.json (src/types.ts) → pos đầy đủ
// tương ứng bên CEFR-J. 1 pos viết tắt có thể khớp NHIỀU pos CEFR-J (vd "v" khớp cả
// verb/be-verb/do-verb/have-verb/modal auxiliary). "idiom" không có wordlist đơn từ nào
// khớp → luôn fallback AI.
const POS_MAP: Readonly<Record<string, readonly string[]>> = {
  n: ['noun'],
  v: ['verb', 'be-verb', 'do-verb', 'have-verb', 'modal auxiliary', 'infinitive-to'],
  adj: ['adjective'],
  adv: ['adverb'],
  prep: ['preposition'],
  interj: ['interjection'],
  conj: ['conjunction'],
  art: ['determiner'],
  num: ['number'],
  pron: ['pronoun'],
  idiom: [],
}

export interface CefrjIndex {
  byWordPos: Map<string, CefrWordLevel> // key: `${word}::${cefrjPos}`
  byWordUnambiguous: Map<string, CefrWordLevel> // từ chỉ có ĐÚNG 1 cấp độ dù pos nào
}

export function buildCefrjIndex(rows: CefrjRow[]): CefrjIndex {
  const byWordPos = new Map<string, CefrWordLevel>()
  const levelsByWord = new Map<string, Set<CefrWordLevel>>()

  for (const row of rows) {
    for (const word of row.headwords) {
      const key = `${word}::${row.pos}`
      if (!byWordPos.has(key)) byWordPos.set(key, row.level)

      const levels = levelsByWord.get(word) ?? new Set<CefrWordLevel>()
      levels.add(row.level)
      levelsByWord.set(word, levels)
    }
  }

  const byWordUnambiguous = new Map<string, CefrWordLevel>()
  for (const [word, levels] of levelsByWord) {
    if (levels.size === 1) byWordUnambiguous.set(word, [...levels][0]!)
  }

  return { byWordPos, byWordUnambiguous }
}

// Tra cấp CEFR cho 1 từ: khớp đúng pos trước (chính xác nhất vì cùng 1 từ có thể khác
// cấp độ theo từ loại, vd danh từ/động từ), nếu wordlist không có đúng pos đó thì dùng
// cấp DUY NHẤT của từ (an toàn vì không có pos nào khác mâu thuẫn). Trả về undefined nếu
// wordlist không có từ này ở bất kỳ dạng nào — lúc đó để AI ước lượng (fallback).
export function lookupCefrLevel(
  index: CefrjIndex,
  word: string,
  pos: string,
): CefrWordLevel | undefined {
  const w = word.trim().toLowerCase()
  if (!w) return undefined

  for (const cefrjPos of POS_MAP[pos] ?? []) {
    const level = index.byWordPos.get(`${w}::${cefrjPos}`)
    if (level) return level
  }

  return index.byWordUnambiguous.get(w)
}
