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

function stripDoubledFinalConsonant(stem: string): string | null {
  if (stem.length < 3) return null
  const last = stem[stem.length - 1]!
  if (last === stem[stem.length - 2] && !'aeiouwxy'.includes(last)) return stem.slice(0, -1)
  return null
}

// Sinh các dạng GỐC có thể của 1 từ biến thể (số nhiều/quá khứ/gerund/so sánh...), pos-aware
// để tránh sinh sai (vd không áp quy tắc động từ cho danh từ). Đây là quy tắc tiếng Anh CHUẨN
// (regular inflection), không đoán ngữ nghĩa — an toàn dùng để tra lại wordlist CEFR-J, vì
// wordlist vẫn là nguồn xác định cấp độ cuối cùng (hàm này chỉ chuẩn hoá TỪ, không chuẩn hoá
// CẤP ĐỘ). Không phủ được các dạng bất quy tắc (child→children, go→went...).
export function deriveLemmaCandidates(word: string, pos: string): string[] {
  const w = word.trim().toLowerCase()
  const candidates = new Set<string>()
  const add = (s: string): void => {
    if (s.length >= 2) candidates.add(s)
  }

  if (pos === 'n' || pos === 'pron') {
    if (w.endsWith('ies') && w.length > 4) add(w.slice(0, -3) + 'y')
    if (w.endsWith('ves') && w.length > 4) {
      add(w.slice(0, -3) + 'fe')
      add(w.slice(0, -3) + 'f')
    }
    if (/(?:[sxz]|ch|sh)es$/.test(w) && w.length > 4) add(w.slice(0, -2))
    if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) add(w.slice(0, -1))
  }

  if (pos === 'v') {
    if (w.endsWith('ied') && w.length > 4) add(w.slice(0, -3) + 'y')
    if (w.endsWith('ed') && w.length > 3) {
      const stem = w.slice(0, -2)
      add(stem)
      add(stem + 'e')
      const undoubled = stripDoubledFinalConsonant(stem)
      if (undoubled) add(undoubled)
    }
    if (w.endsWith('ing') && w.length > 4) {
      const stem = w.slice(0, -3)
      add(stem)
      add(stem + 'e')
      const undoubled = stripDoubledFinalConsonant(stem)
      if (undoubled) add(undoubled)
    }
    if (w.endsWith('ies') && w.length > 4) add(w.slice(0, -3) + 'y') // "tries" (ngôi 3 số ít)
    if (/(?:[sxz]|ch|sh)es$/.test(w) && w.length > 4) add(w.slice(0, -2))
    if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) add(w.slice(0, -1))
  }

  if (pos === 'adj' || pos === 'adv') {
    if (w.endsWith('iest') && w.length > 5) add(w.slice(0, -4) + 'y')
    if (w.endsWith('ier') && w.length > 4) add(w.slice(0, -3) + 'y')
    if (w.endsWith('est') && w.length > 4) {
      add(w.slice(0, -3))
      add(w.slice(0, -2))
    }
    if (w.endsWith('er') && w.length > 3) {
      add(w.slice(0, -2))
      add(w.slice(0, -1))
    }
  }

  candidates.delete(w)
  return [...candidates]
}

// Tra CEFR-J: thử dạng gốc trước, không có thì thử các dạng GỐC suy ra từ biến thể (đều tra
// lại wordlist CEFR-J thật — không hạ thấp độ tin cậy so với lookupCefrLevel thường).
export function lookupCefrLevelWithLemma(
  index: CefrjIndex,
  word: string,
  pos: string,
): CefrWordLevel | undefined {
  const direct = lookupCefrLevel(index, word, pos)
  if (direct) return direct

  for (const candidate of deriveLemmaCandidates(word, pos)) {
    const level = lookupCefrLevel(index, candidate, pos)
    if (level) return level
  }

  return undefined
}
