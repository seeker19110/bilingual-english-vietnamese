import { describe, it, expect } from 'vitest'
import { wordSpansFromAlignment, framesFromWordSpans, type Viseme } from './visemeTimeline.js'
import type { ElevenAlignment } from './elevenLabsTts.js'

// Tiện ích dựng alignment giả: mỗi ký tự chiếm đúng `step` giây liên tiếp nhau.
function makeAlignment(text: string, step = 0.1): ElevenAlignment {
  const characters = [...text]
  return {
    characters,
    character_start_times_seconds: characters.map((_, i) => i * step),
    character_end_times_seconds: characters.map((_, i) => (i + 1) * step),
  }
}

describe('wordSpansFromAlignment', () => {
  it('tách từ theo khoảng trắng và lấy mốc thời gian thật của từ', () => {
    const spans = wordSpansFromAlignment(makeAlignment('ab cd'))
    expect(spans).toEqual([
      { word: 'ab', startMs: 0, endMs: 200 },
      { word: 'cd', startMs: 300, endMs: 500 },
    ])
  })

  it('giữ dấu câu dính liền từ (eSpeak nhận cả cụm như một token)', () => {
    const spans = wordSpansFromAlignment(makeAlignment('hi, yo'))
    expect(spans.map((s) => s.word)).toEqual(['hi,', 'yo'])
  })

  it('trả mảng rỗng khi alignment rỗng hoặc chỉ có khoảng trắng', () => {
    expect(wordSpansFromAlignment(makeAlignment(''))).toEqual([])
    expect(wordSpansFromAlignment(makeAlignment('   '))).toEqual([])
  })

  it('không để endMs nhỏ hơn startMs khi dữ liệu provider bị bẩn', () => {
    const alignment: ElevenAlignment = {
      characters: ['a'],
      character_start_times_seconds: [1],
      character_end_times_seconds: [0.5], // kết thúc TRƯỚC lúc bắt đầu
    }
    expect(wordSpansFromAlignment(alignment)).toEqual([{ word: 'a', startMs: 1000, endMs: 1000 }])
  })
})

describe('framesFromWordSpans', () => {
  const spans = [
    { word: 'ab', startMs: 0, endMs: 200 },
    { word: 'cd', startMs: 300, endMs: 500 },
  ]

  it('chia đều viseme TRONG một từ, bám đúng mốc thật của từ đó', () => {
    const frames = framesFromWordSpans(spans, [['PP', 'AA'], ['OO']])
    expect(frames).toEqual([
      { viseme: 'PP', startMs: 0, endMs: 100 },
      { viseme: 'AA', startMs: 100, endMs: 200 },
      // Khoảng lặng giữa hai từ được lấp bằng REST
      { viseme: 'REST', startMs: 200, endMs: 300 },
      { viseme: 'OO', startMs: 300, endMs: 500 },
    ])
  })

  it('chèn REST cho khoảng im lặng đầu câu', () => {
    const frames = framesFromWordSpans([{ word: 'a', startMs: 500, endMs: 700 }], [['AA']])
    expect(frames[0]).toEqual({ viseme: 'REST', startMs: 0, endMs: 500 })
  })

  it('trả rỗng khi số từ không khớp số dãy viseme (không gán sai từ)', () => {
    expect(framesFromWordSpans(spans, [['AA']])).toEqual([])
    expect(framesFromWordSpans([], [])).toEqual([])
  })

  it('bỏ qua từ có thời lượng bằng 0 thay vì tạo khung hình vô nghĩa', () => {
    const frames = framesFromWordSpans([{ word: 'a', startMs: 100, endMs: 100 }], [['AA']])
    expect(frames.filter((f) => f.viseme !== 'REST')).toEqual([])
  })

  it('khung hình liền mạch, không chồng lấn và không lùi thời gian', () => {
    const visemes: Viseme[][] = [
      ['PP', 'AA', 'OO'],
      ['FF', 'AA'],
    ]
    const frames = framesFromWordSpans(spans, visemes)
    for (let i = 1; i < frames.length; i++) {
      expect(frames[i]!.startMs).toBe(frames[i - 1]!.endMs)
      expect(frames[i]!.endMs).toBeGreaterThan(frames[i]!.startMs)
    }
  })
})
