// scripts/split-dictionary.mjs
// Tách src/data/dictionary.json (~2,6MB, 10.000 từ) thành nhiều chunk JSON nhỏ:
//   src/data/dictionary/chunk-NNN.json  — 1.000 từ / file
// Trước đây Vite gói cả file thành 1 chunk JS 2,1MB (parse JS chậm). Tách nhỏ +
// loader dùng import.meta.glob để TẢI SONG SONG nhiều file → nhanh hơn 1 file lớn.
//
// Chạy 1 lần: node scripts/split-dictionary.mjs   (an toàn để chạy lại — ghi đè)

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'apps/dhcb/src/data/dictionary.json')
const OUT_DIR = path.join(ROOT, 'apps/dhcb/src/data/dictionary')

const PER_CHUNK = 1000

const entries = JSON.parse(fs.readFileSync(SRC, 'utf8'))
fs.mkdirSync(OUT_DIR, { recursive: true })

let chunkCount = 0
for (let i = 0; i < entries.length; i += PER_CHUNK) {
  const chunkN = Math.floor(i / PER_CHUNK)
  const batch = entries.slice(i, i + PER_CHUNK)
  fs.writeFileSync(
    path.join(OUT_DIR, `chunk-${String(chunkN).padStart(3, '0')}.json`),
    JSON.stringify(batch),
  )
  chunkCount++
}

console.log(`✅ Tách ${entries.length} từ → ${chunkCount} chunk (${PER_CHUNK} từ/chunk)`)
