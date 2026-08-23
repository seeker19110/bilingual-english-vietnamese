// scripts/gen-learn-json.ts
// Sinh public/data/cefr.json và public/data/dialogues.json TỪ NGUỒN
//   - src/data/cefr.ts      (CEFR_LEVELS)
//   - src/data/dialogues.ts (DIALOGUES)
//
// Vì app đọc dữ liệu học qua fetch('/data/*.json') lúc chạy (xem cefrLoader.ts,
// dialoguesLoader.ts) chứ KHÔNG bundle thẳng file .ts → mỗi lần sửa nội dung
// trong .ts phải chạy lại script này để JSON tĩnh khớp với nguồn.
//
// Chạy: npx tsx scripts/gen-learn-json.ts   (an toàn để chạy lại — ghi đè)
//
// Lưu ý: curriculum.json có script riêng (gen-curriculum-json.ts) vì còn làm giàu
// phiên âm từ từ điển. Ở đây chỉ sao chép NGUYÊN VẸN CEFR + hội thoại.

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CEFR_LEVELS } from '../apps/english/src/data/cefr.ts'
import { DIALOGUES } from '../apps/english/src/data/dialogues.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CEFR_OUT = path.join(ROOT, 'apps/english/public/data/cefr.json')
const DLG_OUT = path.join(ROOT, 'apps/english/public/data/dialogues.json')

// Ghi không khoảng trắng (giống các file data hiện có → manifest hash gọn).
fs.writeFileSync(CEFR_OUT, JSON.stringify(CEFR_LEVELS))
fs.writeFileSync(DLG_OUT, JSON.stringify(DIALOGUES))

const grammar = CEFR_LEVELS.reduce(
  (s, lvl) => s + lvl.units.reduce((u, unit) => u + unit.grammar.length, 0),
  0,
)
const dlgCount = Object.values(DIALOGUES).reduce((s, arr) => s + arr.length, 0)

console.log(
  `✅ cefr.json: ${CEFR_LEVELS.length} cấp, ${grammar} bài ngữ pháp · ` +
    `dialogues.json: ${Object.keys(DIALOGUES).length} chủ đề, ${dlgCount} hội thoại`,
)
