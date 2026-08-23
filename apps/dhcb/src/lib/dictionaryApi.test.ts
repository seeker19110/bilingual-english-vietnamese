import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { DictEntry } from '../types'

const FIXTURE: DictEntry[] = [
  {
    word: 'book',
    pos: 'n',
    vi: 'sách',
    ex_en: 'I read a book.',
    ex_vi: 'Tôi đọc một cuốn sách.',
    forms: { plural: 'books' },
  },
  {
    word: 'play',
    pos: 'v',
    vi: 'chơi',
    ex_en: 'Children play outside.',
    ex_vi: 'Trẻ em chơi ngoài trời.',
    forms: { v3s: 'plays', ving: 'playing', past: 'played' },
  },
  {
    word: 'go',
    pos: 'v',
    vi: 'đi',
    ex_en: 'I go to school.',
    ex_vi: 'Tôi đi học.',
    forms: { v3s: 'goes', ving: 'going', past: 'went', pastPart: 'gone', irregular: true },
  },
  {
    word: 'went',
    pos: 'v',
    vi: 'đã đi (quá khứ của go)',
    ex_en: 'We went home.',
    ex_vi: 'Chúng tôi đã về nhà.',
    base: 'go',
  },
  // Cố tình để "leaf" có dạng số nhiều trùng với 1 headword ĐỘC LẬP khác ("leaves" giả định
  // đã tồn tại như 1 từ riêng, vd nghĩa khác) — kiểm tra guard KHÔNG gợi ý nhầm khi query đã
  // là 1 từ thật trong từ điển.
  {
    word: 'leaf',
    pos: 'n',
    vi: 'lá cây',
    ex_en: 'The leaf fell.',
    ex_vi: 'Chiếc lá rơi.',
    forms: { plural: 'leaves' },
  },
  {
    word: 'leaves',
    pos: 'v',
    vi: 'rời đi (thì hiện tại số ít của leave)',
    ex_en: 'She leaves at noon.',
    ex_vi: 'Cô ấy rời đi lúc trưa.',
  },
]

vi.mock('../data/dictionary/loader.js', () => ({
  loadDictionary: async () => FIXTURE,
}))

describe('searchDictionary — Bước 4: hiểu dạng biến thể (bo-sung-dang-bien-the-tu-dien.md)', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('query là dạng SỐ NHIỀU quy tắc không có entry riêng ("books") → trả về entry gốc + matchedForm', async () => {
    const { searchDictionary } = await import('./dictionaryApi')
    const r = await searchDictionary('books')
    expect(r.matchedForm).toEqual({ form: 'books', base: 'book' })
    expect(r.results.some((e) => e.word === 'book')).toBe(true)
  })

  it('query là dạng QUÁ KHỨ quy tắc không có entry riêng ("played") → trả về entry gốc + matchedForm', async () => {
    const { searchDictionary } = await import('./dictionaryApi')
    const r = await searchDictionary('played')
    expect(r.matchedForm).toEqual({ form: 'played', base: 'play' })
    expect(r.results.some((e) => e.word === 'play')).toBe(true)
  })

  it('query khớp headword CÓ THẬT ("went", đã có entry riêng) → không set matchedForm (không cần gợi ý)', async () => {
    const { searchDictionary } = await import('./dictionaryApi')
    const r = await searchDictionary('went')
    expect(r.matchedForm).toBeUndefined()
    expect(r.results.some((e) => e.word === 'went')).toBe(true)
  })

  it('query trùng 1 dạng biến thể NHƯNG bản thân nó cũng là headword thật ("leaves") → không gợi ý nhầm', async () => {
    const { searchDictionary } = await import('./dictionaryApi')
    const r = await searchDictionary('leaves')
    expect(r.matchedForm).toBeUndefined()
  })

  it('query không khớp gì (không phải headword, không phải dạng biến thể nào) → không có matchedForm', async () => {
    const { searchDictionary } = await import('./dictionaryApi')
    const r = await searchDictionary('xyzzy')
    expect(r.matchedForm).toBeUndefined()
    expect(r.results).toEqual([])
  })

  it('tra tiếng Việt vẫn hoạt động bình thường, không đụng logic matchedForm', async () => {
    const { searchDictionary } = await import('./dictionaryApi')
    const r = await searchDictionary('sách')
    expect(r.matchedForm).toBeUndefined()
    expect(r.results.some((e) => e.word === 'book')).toBe(true)
  })

  it('entry gốc được thêm vào ĐẦU danh sách, không lặp nếu đã có trong kết quả substring', async () => {
    const { searchDictionary } = await import('./dictionaryApi')
    // "play" query đã tự nhiên match "play" qua substring — "played" chỉ nên thêm matchedForm,
    // không tạo bản sao "play" thứ 2.
    const r = await searchDictionary('play')
    const playCount = r.results.filter((e) => e.word === 'play').length
    expect(playCount).toBe(1)
  })

  it('query rỗng → trả total nhưng matched=0, không tìm kiếm', async () => {
    const { searchDictionary } = await import('./dictionaryApi')
    const r = await searchDictionary('   ')
    expect(r.total).toBe(FIXTURE.length)
    expect(r.matched).toBe(0)
    expect(r.results).toEqual([])
    expect(r.posGroups).toEqual([])
  })

  it('lọc theo pos → chỉ trả entry đúng loại từ, posGroups vẫn đếm trên toàn bộ matches', async () => {
    const { searchDictionary } = await import('./dictionaryApi')
    const r = await searchDictionary('go', undefined, 'v')
    expect(r.results.every((e) => e.pos === 'v')).toBe(true)
    // posGroups đếm trên "go" + "went" (đều v) — có ít nhất 1 nhóm 'v'
    expect(r.posGroups.some(([pos]) => pos === 'v')).toBe(true)
  })
})

describe('fetchWordOfDay — từ vựng cố định theo ngày', () => {
  beforeEach(() => vi.resetModules())

  it('trả về đúng total + 1 entry hợp lệ trong từ điển', async () => {
    const { fetchWordOfDay } = await import('./dictionaryApi')
    const r = await fetchWordOfDay()
    expect(r.total).toBe(FIXTURE.length)
    expect(r.entry).not.toBeNull()
    expect(FIXTURE.some((e) => e.word === r.entry!.word)).toBe(true)
  })

  it('cùng ngày → luôn ra cùng 1 từ (idempotent)', async () => {
    const { fetchWordOfDay } = await import('./dictionaryApi')
    const r1 = await fetchWordOfDay()
    const r2 = await fetchWordOfDay()
    expect(r1.entry?.word).toBe(r2.entry?.word)
  })

  it('từ điển rỗng → total=0, entry=null (không throw)', async () => {
    const loaderMod = await import('../data/dictionary/loader')
    const spy = vi.spyOn(loaderMod, 'loadDictionary').mockResolvedValueOnce([])
    const { fetchWordOfDay } = await import('./dictionaryApi')
    const r = await fetchWordOfDay()
    expect(r).toEqual({ total: 0, entry: null })
    spy.mockRestore()
  })
})

describe('fetchRandomEntries — bốc n từ ngẫu nhiên cho Flashcard', () => {
  beforeEach(() => vi.resetModules())

  it('trả đúng n từ, không trùng lặp', async () => {
    const { fetchRandomEntries } = await import('./dictionaryApi')
    const r = await fetchRandomEntries(4)
    expect(r).toHaveLength(4)
    const words = new Set(r.map((e) => e.word))
    expect(words.size).toBe(4)
  })

  it('n lớn hơn kích thước từ điển → trả hết, không lỗi', async () => {
    const { fetchRandomEntries } = await import('./dictionaryApi')
    const r = await fetchRandomEntries(100)
    expect(r).toHaveLength(FIXTURE.length)
  })

  it('mặc định n=30 khi không truyền tham số', async () => {
    const { fetchRandomEntries } = await import('./dictionaryApi')
    const r = await fetchRandomEntries()
    expect(r).toHaveLength(FIXTURE.length) // fixture < 30 nên trả hết
  })
})
