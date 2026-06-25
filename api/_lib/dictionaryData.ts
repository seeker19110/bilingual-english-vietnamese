// api/_lib/dictionaryData.ts — Nạp toàn bộ từ điển Ở PHÍA SERVER (1 lần, cache RAM).
//
// Vì sao đọc bằng fs thay vì import: handler này chạy ở 2 môi trường —
//   (1) Vite dev (qua middleware ssrLoadModule) và (2) Express trên VPS (qua tsx).
// import.meta.glob là tính năng RIÊNG của Vite, không có khi chạy tsx production.
// Dùng fs.readdirSync/readFileSync thì cả hai môi trường (đều là Node) đều chạy được.
//
// Dữ liệu nằm tại public/data/dictionary/chunk-*.json — có sẵn trên đĩa ở cả dev lẫn
// trên VPS (repo được clone nguyên vẹn). Nạp ~2.6MB vào RAM server 1 lần là không đáng kể.
// LƯU Ý: các chunk đã được chuyển từ src/ sang public/ (commit "chuyển chunk sang public/")
// để giảm số module Vite. Endpoint server đọc trực tiếp bằng fs nên phải trỏ ĐÚNG public/.

import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

export interface DictEntry {
  word: string
  pos: string
  vi: string
  ex_en: string
  ex_vi: string
  ipa_en?: string
  ipa_vi?: string
}

// api/_lib/ → ../../public/data/dictionary
const DICT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'data', 'dictionary')

let _all: DictEntry[] | null = null

// Toàn bộ từ điển (ghép mọi chunk theo thứ tự tên file). Cache sau lần đầu.
export function getAllEntries(): DictEntry[] {
  if (_all) return _all
  const files = readdirSync(DICT_DIR)
    .filter((f) => /^chunk-\d+\.json$/.test(f))
    .sort()
  _all = files.flatMap((f) => JSON.parse(readFileSync(join(DICT_DIR, f), 'utf8')) as DictEntry[])
  return _all
}
