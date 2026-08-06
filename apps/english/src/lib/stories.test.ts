import { describe, it, expect } from 'vitest'
import {
  groupLinesByParagraph,
  estimateListenMinutes,
  getStoryVoice,
  STORY_KIND_VOICE,
} from './stories'
import { STORY_KINDS } from '../data/stories/index'
import type { StoryLine } from '../data/stories/index'
import { GEMINI_VOICE_IDS } from './voiceTiers'

function line(p: number, en: string): StoryLine {
  return { p, en, vi: en }
}

describe('groupLinesByParagraph', () => {
  it('gom các câu liên tiếp cùng p vào 1 đoạn', () => {
    const lines = [line(0, 'a'), line(0, 'b'), line(1, 'c'), line(1, 'd'), line(1, 'e')]
    const result = groupLinesByParagraph(lines)
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveLength(2)
    expect(result[1]).toHaveLength(3)
  })

  it('mỗi p riêng biệt tạo 1 đoạn, kể cả khi p không liên tục', () => {
    const lines = [line(0, 'a'), line(1, 'b'), line(3, 'c')]
    const result = groupLinesByParagraph(lines)
    expect(result).toHaveLength(3)
  })

  it('mảng rỗng trả về mảng đoạn rỗng', () => {
    expect(groupLinesByParagraph([])).toEqual([])
  })

  it('giữ nguyên nội dung + thứ tự câu trong từng đoạn', () => {
    const lines = [line(0, 'first'), line(0, 'second')]
    const result = groupLinesByParagraph(lines)
    expect(result[0]?.map((l) => l.en)).toEqual(['first', 'second'])
  })
})

describe('estimateListenMinutes', () => {
  it('0 câu → 0 phút', () => {
    expect(estimateListenMinutes(0)).toBe(0)
  })

  it('câu rất ngắn vẫn làm tròn tối thiểu 1 phút', () => {
    expect(estimateListenMinutes(1)).toBe(1)
    expect(estimateListenMinutes(5)).toBe(1) // 5*4=20s → làm tròn 0 phút → tối thiểu 1
  })

  it('tính đúng theo công thức lineCount × 4 giây', () => {
    expect(estimateListenMinutes(15)).toBe(1) // 60s = 1 phút
    expect(estimateListenMinutes(30)).toBe(2) // 120s = 2 phút
    expect(estimateListenMinutes(45)).toBe(3) // 180s = 3 phút
  })

  it('làm tròn đúng chuẩn (không luôn làm tròn xuống)', () => {
    // 23 câu × 4s = 92s = 1.533 phút → làm tròn thành 2
    expect(estimateListenMinutes(23)).toBe(2)
  })
})

describe('getStoryVoice / STORY_KIND_VOICE', () => {
  it('mỗi thể loại (STORY_KINDS) đều có đúng 1 giọng Gemini hợp lệ trong bảng', () => {
    for (const kind of STORY_KINDS) {
      const voice = getStoryVoice(kind)
      expect(voice).toBe(STORY_KIND_VOICE[kind])
      expect(GEMINI_VOICE_IDS).toContain(voice)
    }
  })
})
