import { describe, it, expect } from 'vitest'
import { listeningRateForLevel, buildDictationItems, LISTENING_RATE_BY_LEVEL } from './listening'
import type { Dialogue } from '../data/dialogues'
import type { DictEntry } from '../types'

const mkDialogue = (lines: { who: 'A' | 'B'; en: string; vi: string }[]): Dialogue => ({
  titleVi: 'Hội thoại',
  titleEn: 'Dialogue',
  lines,
})

const mkWord = (word: string, ex_en: string, ex_vi: string): DictEntry => ({
  word,
  pos: 'n',
  vi: 'nghĩa',
  ex_en,
  ex_vi,
})

describe('listeningRateForLevel — tốc độ mặc định theo cấp (③ N3)', () => {
  it('A1/A2 chậm hơn (0.9×), B1/B2 bình thường (1×), C1/C2 nhanh hơn (1.1×)', () => {
    expect(listeningRateForLevel('A1')).toBe(0.9)
    expect(listeningRateForLevel('A2')).toBe(0.9)
    expect(listeningRateForLevel('B1')).toBe(1)
    expect(listeningRateForLevel('B2')).toBe(1)
    expect(listeningRateForLevel('C1')).toBe(1.1)
    expect(listeningRateForLevel('C2')).toBe(1.1)
  })

  it('mọi cấp trong LISTENING_RATE_BY_LEVEL đều có giá trị hợp lệ (0 < rate ≤ 2)', () => {
    for (const rate of Object.values(LISTENING_RATE_BY_LEVEL)) {
      expect(rate).toBeGreaterThan(0)
      expect(rate).toBeLessThanOrEqual(2)
    }
  })
})

describe('buildDictationItems — dựng câu luyện gõ chính tả', () => {
  it('lọc câu quá NGẮN (<3 từ) và quá DÀI (>12 từ) — chỉ giữ câu vừa sức', () => {
    const dialogues = [
      mkDialogue([
        { who: 'A', en: 'Hi', vi: 'Chào' }, // 1 từ — quá ngắn, loại
        { who: 'B', en: 'How are you today', vi: 'Hôm nay bạn khỏe không' }, // 4 từ — hợp lệ
        {
          who: 'A',
          en: 'This is an extremely long sentence that goes on and on and on forever',
          vi: 'x',
        }, // >12 từ — quá dài, loại
      ]),
    ]
    const items = buildDictationItems(true, dialogues, [], 10)
    expect(items).toHaveLength(1)
    expect(items[0]?.text).toBe('How are you today')
  })

  it('chiều A lấy câu tiếng Anh (en-US); chiều B lấy câu tiếng Việt (vi-VN)', () => {
    const dialogues = [
      mkDialogue([{ who: 'A', en: 'I like coffee very much', vi: 'Tôi rất thích cà phê' }]),
    ]
    const itemsA = buildDictationItems(true, dialogues, [], 5)
    const itemsB = buildDictationItems(false, dialogues, [], 5)
    expect(itemsA[0]).toMatchObject({ text: 'I like coffee very much', lang: 'en-US' })
    expect(itemsB[0]).toMatchObject({ text: 'Tôi rất thích cà phê', lang: 'vi-VN' })
  })

  it('hội thoại mỏng → bù thêm câu ví dụ từ điển', () => {
    const words = [mkWord('apple', 'I eat an apple every morning', 'x')]
    const items = buildDictationItems(true, [], words, 5)
    expect(items).toHaveLength(1)
    expect(items[0]?.text).toBe('I eat an apple every morning')
  })

  it('khử trùng: câu giống hệt nhau ở cả 2 nguồn chỉ giữ 1', () => {
    const dialogues = [mkDialogue([{ who: 'A', en: 'I eat an apple every morning', vi: 'x' }])]
    const words = [mkWord('apple', 'I eat an apple every morning', 'x')]
    const items = buildDictationItems(true, dialogues, words, 10)
    expect(items).toHaveLength(1)
  })

  it('giới hạn đúng theo count, dù kho có nhiều hơn', () => {
    const dialogues = [
      mkDialogue(
        Array.from({ length: 10 }, (_, i) => ({
          who: 'A' as const,
          en: `This is sentence number ${i} today`,
          vi: 'x',
        })),
      ),
    ]
    const items = buildDictationItems(true, dialogues, [], 3)
    expect(items).toHaveLength(3)
  })

  it('không có nguồn nào đủ điều kiện → mảng rỗng, không throw', () => {
    expect(buildDictationItems(true, [], [], 5)).toEqual([])
    expect(buildDictationItems(true, [mkDialogue([])], [], 5)).toEqual([])
  })

  it('câu ví dụ từ điển rỗng (ex_en/ex_vi = "") không lọt vào (không có gì để gõ)', () => {
    const words = [mkWord('x', '', '')]
    expect(buildDictationItems(true, [], words, 5)).toEqual([])
  })
})
