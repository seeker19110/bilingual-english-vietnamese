import { describe, it, expect } from 'vitest'
import { findTrap, coachTips } from './pronounceCoach'

// Module thuần (không gọi mạng/localStorage) → test trực tiếp. Bảo vệ logic
// nhận diện lỗi phát âm điển hình của người Việt (pronunciationTraps.ts).

describe('findTrap', () => {
  // Mỗi nhóm lỗi (TrapGroup) trong WORD_TRAPS phải có ít nhất 1 cặp nhận diện đúng.
  it('th-voiceless: "three" đọc thành "tree"', () => {
    const t = findTrap('three', 'tree')
    expect(t?.group).toBe('th-voiceless')
    expect(t?.tipVi.length).toBeGreaterThan(0)
  })

  it('th-voiced: "they" đọc thành "day"', () => {
    const t = findTrap('they', 'day')
    expect(t?.group).toBe('th-voiced')
    expect(t?.tipVi.length).toBeGreaterThan(0)
  })

  it('sh-s: "she" đọc thành "see"', () => {
    const t = findTrap('she', 'see')
    expect(t?.group).toBe('sh-s')
    expect(t?.tipVi.length).toBeGreaterThan(0)
  })

  it('ch-tr: "train" đọc thành "chain"', () => {
    const t = findTrap('train', 'chain')
    expect(t?.group).toBe('ch-tr')
    expect(t?.tipVi.length).toBeGreaterThan(0)
  })

  it('j-d: "jump" đọc thành "dump"', () => {
    const t = findTrap('jump', 'dump')
    expect(t?.group).toBe('j-d')
    expect(t?.tipVi.length).toBeGreaterThan(0)
  })

  it('z-s: "rise" đọc thành "rice"', () => {
    const t = findTrap('rise', 'rice')
    expect(t?.group).toBe('z-s')
    expect(t?.tipVi.length).toBeGreaterThan(0)
  })

  it('r-l: "right" đọc thành "light"', () => {
    const t = findTrap('right', 'light')
    expect(t?.group).toBe('r-l')
    expect(t?.tipVi.length).toBeGreaterThan(0)
  })

  it('v-w: "vest" đọc thành "west"', () => {
    const t = findTrap('vest', 'west')
    expect(t?.group).toBe('v-w')
    expect(t?.tipVi.length).toBeGreaterThan(0)
  })

  it('vowel-length: "live" đọc thành "leave"', () => {
    const t = findTrap('live', 'leave')
    expect(t?.group).toBe('vowel-length')
    expect(t?.tipVi.length).toBeGreaterThan(0)
  })

  it('consonant-cluster: "start" đọc thành "tart"', () => {
    const t = findTrap('start', 'tart')
    expect(t?.group).toBe('consonant-cluster')
    expect(t?.tipVi.length).toBeGreaterThan(0)
  })

  it('final-consonant (quy tắc chung, không theo từ cụ thể): "cats" đọc thành "cat"', () => {
    const t = findTrap('cats', 'cat')
    expect(t?.group).toBe('final-consonant')
    expect(t?.tipVi.length).toBeGreaterThan(0)
  })

  it('target trùng spoken → null (không phải lỗi)', () => {
    expect(findTrap('hello', 'hello')).toBeNull()
    expect(findTrap('Hello', 'hello')).toBeNull() // chuẩn hoá hoa/thường trước khi so
  })

  it('không có quan hệ nào đã biết → null', () => {
    expect(findTrap('hello', 'banana')).toBeNull()
  })

  it('chuẩn hoá hoa/thường + khoảng trắng thừa vẫn khớp', () => {
    const t = findTrap('Three', ' Tree ')
    expect(t?.group).toBe('th-voiceless')
    expect(t?.word).toBe('three')
    expect(t?.spokenWord).toBe('tree')
  })
})

describe('coachTips', () => {
  const threeTree = { target: 'three', spoken: 'tree' }
  const theyDay = { target: 'they', spoken: 'day' }
  const sheSee = { target: 'she', spoken: 'see' }
  const noMatch = { target: 'hello', spoken: 'banana' }

  it('mặc định chỉ trả tối đa 2 gợi ý dù có 3 cặp đều khớp, giữ đúng thứ tự', () => {
    const tips = coachTips([threeTree, theyDay, sheSee])
    expect(tips).toHaveLength(2)
    expect(tips[0].group).toBe('th-voiceless')
    expect(tips[1].group).toBe('th-voiced')
  })

  it('max: 1 → chỉ trả 1 gợi ý', () => {
    const tips = coachTips([threeTree, theyDay, sheSee], 1)
    expect(tips).toHaveLength(1)
    expect(tips[0].group).toBe('th-voiceless')
  })

  it('lọc bỏ các cặp không nhận diện được lỗi (null)', () => {
    const tips = coachTips([noMatch, threeTree, noMatch, theyDay])
    expect(tips).toHaveLength(2)
    expect(tips.map((t) => t.group)).toEqual(['th-voiceless', 'th-voiced'])
  })

  it('không có cặp nào khớp → mảng rỗng', () => {
    expect(coachTips([noMatch])).toEqual([])
  })
})
