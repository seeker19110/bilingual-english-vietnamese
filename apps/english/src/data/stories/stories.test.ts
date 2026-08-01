// Test ràng buộc dữ liệu Truyện cổ tích / Ngụ ngôn (mục 5.3 đặc tả trang /listening).
// Kiểm TOÀN BỘ file raw/*.json bằng vòng lặp — không hard-code từng truyện, để tự động
// nhận truyện mới khi phiên chính bổ sung thêm.

import { readdirSync, readFileSync } from 'node:fs'
import { join, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, it, expect } from 'vitest'

import { toStoryMeta } from '../../../../../scripts/gen-stories-json.mjs'
import type { Story } from './index'

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAW_DIR = join(__dirname, 'raw')

const VALID_KINDS = ['fairy-tale', 'fable']
const VALID_LEVELS = ['A2', 'B1', 'B2']

function loadRawStories(): { filename: string; story: Story }[] {
  const files = readdirSync(RAW_DIR).filter((f) => f.endsWith('.json'))
  return files.map((filename) => ({
    filename,
    story: JSON.parse(readFileSync(join(RAW_DIR, filename), 'utf-8')) as Story,
  }))
}

describe('stories/raw/*.json — ràng buộc dữ liệu', () => {
  const entries = loadRawStories()

  it('có ít nhất 1 file truyện để kiểm', () => {
    expect(entries.length).toBeGreaterThan(0)
  })

  it.each(entries)('$filename: lines không rỗng, en/vi non-empty', ({ story }) => {
    expect(Array.isArray(story.lines)).toBe(true)
    expect(story.lines.length).toBeGreaterThan(0)
    for (const line of story.lines) {
      expect(line.en.trim()).not.toBe('')
      expect(line.vi.trim()).not.toBe('')
    }
  })

  it.each(entries)('$filename: p bắt đầu từ 0, tăng dần, không nhảy cóc', ({ story }) => {
    let expectedP = 0
    for (const line of story.lines) {
      expect(line.p === expectedP || line.p === expectedP + 1).toBe(true)
      if (line.p === expectedP + 1) expectedP = line.p
    }
  })

  it.each(entries)('$filename: id khớp tên file', ({ filename, story }) => {
    expect(story.id).toBe(basename(filename, '.json'))
  })

  it.each(entries)('$filename: kind hợp lệ', ({ story }) => {
    expect(VALID_KINDS).toContain(story.kind)
  })

  it.each(entries)('$filename: level hợp lệ', ({ story }) => {
    expect(VALID_LEVELS).toContain(story.level)
  })

  it.each(entries)('$filename: kind fable phải có moralEn + moralVi', ({ story }) => {
    if (story.kind === 'fable') {
      expect(story.moralEn?.trim()).toBeTruthy()
      expect(story.moralVi?.trim()).toBeTruthy()
    }
  })
})

describe('toStoryMeta (scripts/gen-stories-json.mjs)', () => {
  const entries = loadRawStories()

  it.each(entries)('$filename: sinh meta đúng, lineCount = lines.length', ({ story }) => {
    const meta = toStoryMeta(story)
    expect(meta.id).toBe(story.id)
    expect(meta.kind).toBe(story.kind)
    expect(meta.lineCount).toBe(story.lines.length)
    // Meta KHÔNG được kèm nội dung (lines/source/moral*).
    expect(meta).not.toHaveProperty('lines')
    expect(meta).not.toHaveProperty('source')
    expect(meta).not.toHaveProperty('moralEn')
    expect(meta).not.toHaveProperty('moralVi')
  })
})
