// scripts/split-lessons.mjs
// Tách src/data/lessons.json (1 file lớn ~100 bài) thành cấu trúc CHUẨN giống patterns:
//   src/data/lessons/index.json      — meta nhẹ của mọi bài (id, title, situation, số lượt, chunk, idx)
//   src/data/lessons/chunk-NNN.json  — nội dung đầy đủ (turns) của 10 bài / file
// Nhờ vậy trang /lessons chỉ nạp index nhẹ khi mở danh sách, và lazy-load nội dung
// từng bài khi người dùng bấm vào — không kéo cả 100 bài về như trước.
//
// Chạy 1 lần: node scripts/split-lessons.mjs   (an toàn để chạy lại — ghi đè)

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'apps/english/src/data/lessons.json')
const OUT_DIR = path.join(ROOT, 'apps/english/src/data/lessons')

const LESSONS_PER_CHUNK = 10

const lessons = JSON.parse(fs.readFileSync(SRC, 'utf8'))

fs.mkdirSync(OUT_DIR, { recursive: true })

const index = []
let chunkCount = 0

for (let i = 0; i < lessons.length; i += LESSONS_PER_CHUNK) {
  const chunkN = Math.floor(i / LESSONS_PER_CHUNK)
  const batch = lessons.slice(i, i + LESSONS_PER_CHUNK)
  const fileName = `chunk-${String(chunkN).padStart(3, '0')}.json`
  fs.writeFileSync(path.join(OUT_DIR, fileName), JSON.stringify(batch))
  chunkCount++

  batch.forEach((l, idx) => {
    index.push({
      id: l.id,
      title: l.title,
      situation: l.situation,
      turnCount: l.turns.length,
      speakerAGender: l.speakerAGender ?? null,
      speakerBGender: l.speakerBGender ?? null,
      chunk: chunkN,
      idx,
    })
  })
}

fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(index, null, 1))

console.log(
  `✅ Tách ${lessons.length} bài → ${chunkCount} chunk (${LESSONS_PER_CHUNK} bài/chunk) + index.json`,
)
