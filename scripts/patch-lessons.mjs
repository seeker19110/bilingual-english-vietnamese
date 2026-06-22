// scripts/patch-lessons.mjs
// Merge một mảng bài học mới vào lessons.json (ghi đè theo id)
// Dùng: node scripts/patch-lessons.mjs scripts/batches/batch-NNN.json

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const LESSONS_FILE = path.join(ROOT, 'src/data/lessons.json')

const patchFile = process.argv[2]
if (!patchFile) { console.error('Usage: node patch-lessons.mjs <batch-file.json>'); process.exit(1) }

const patch = JSON.parse(fs.readFileSync(patchFile, 'utf8'))
const lessons = JSON.parse(fs.readFileSync(LESSONS_FILE, 'utf8'))
const map = new Map(lessons.map(l => [l.id, l]))
for (const l of patch) map.set(l.id, l)
const sorted = Array.from(map.values()).sort((a,b) => a.id - b.id)
fs.writeFileSync(LESSONS_FILE, JSON.stringify(sorted, null, 2))
console.log(`✅ Đã merge ${patch.length} bài vào lessons.json (tổng: ${sorted.length})`)
