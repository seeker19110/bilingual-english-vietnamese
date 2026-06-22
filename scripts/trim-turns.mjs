// Script: trim all lessons so each has at most MAX_TURNS turns
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LESSONS_FILE = path.join(__dirname, '../src/data/lessons.json')
const MAX_TURNS = 20

const lessons = JSON.parse(fs.readFileSync(LESSONS_FILE, 'utf8'))
let trimmed = 0

for (const lesson of lessons) {
  if (Array.isArray(lesson.turns) && lesson.turns.length > MAX_TURNS) {
    lesson.turns = lesson.turns.slice(0, MAX_TURNS)
    trimmed++
  }
}

fs.writeFileSync(LESSONS_FILE, JSON.stringify(lessons, null, 2))
console.log(`Done. Trimmed ${trimmed} lessons to ${MAX_TURNS} turns.`)
