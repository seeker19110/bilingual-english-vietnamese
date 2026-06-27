// scripts/build-lessons-public.mjs
// Sinh dữ liệu "Bài học hội thoại" mà APP THỰC SỰ ĐỌC: public/data/lessons/
//   public/data/lessons/index.json      — meta nhẹ mọi bài (id, title, situation, turnCount, giọng, chunk, idx)
//   public/data/lessons/chunk-NNN.json  — nội dung đầy đủ (turns) của 10 bài / file
// (Trước đây split-lessons.mjs ghi vào src/data/lessons; nhưng từ commit chuyển data sang
//  public/ thì app đọc ở /public/data/lessons — script này regen đúng nơi đó.)
//
// Dùng: node scripts/build-lessons-public.mjs [outDir]
//   - không tham số → ghi public/data/lessons (mặc định)
//   - có outDir     → ghi vào outDir (để chạy thử & so sánh trước khi đụng file thật)
//
// Sau khi chạy, nhớ chạy: node scripts/gen-data-manifest.mjs  (cập nhật hash/size manifest)

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'src/data/lessons.json')
const OUT_DIR = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(ROOT, 'public/data/lessons')

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

console.log(`✅ Tách ${lessons.length} bài → ${chunkCount} chunk + index.json tại ${OUT_DIR}`)
