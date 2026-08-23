// Test api/_lib/dictionaryData.ts — nạp từ điển từ các file chunk-*.json bằng fs, cache RAM.
import { describe, it, expect, beforeEach, vi } from 'vitest'

const readdirSync = vi.fn()
const readFileSync = vi.fn()
vi.mock('node:fs', () => ({
  default: {
    readdirSync: (...args: unknown[]) => readdirSync(...args),
    readFileSync: (...args: unknown[]) => readFileSync(...args),
  },
  readdirSync: (...args: unknown[]) => readdirSync(...args),
  readFileSync: (...args: unknown[]) => readFileSync(...args),
}))

async function importModule() {
  vi.resetModules()
  return import('./dictionaryData')
}

beforeEach(() => {
  readdirSync.mockReset()
  readFileSync.mockReset()
})

describe('getAllEntries', () => {
  it('nạp và gộp các chunk-*.json theo đúng thứ tự tên file, lọc bỏ file không khớp mẫu', async () => {
    readdirSync.mockReturnValue(['chunk-2.json', 'chunk-1.json', 'readme.txt', 'chunk-10.json'])
    readFileSync.mockImplementation((path: string) => {
      if (path.includes('chunk-1.json'))
        return JSON.stringify([{ word: 'apple', pos: 'n', vi: 'táo', ex_en: '', ex_vi: '' }])
      if (path.includes('chunk-2.json'))
        return JSON.stringify([{ word: 'book', pos: 'n', vi: 'sách', ex_en: '', ex_vi: '' }])
      if (path.includes('chunk-10.json'))
        return JSON.stringify([{ word: 'cat', pos: 'n', vi: 'mèo', ex_en: '', ex_vi: '' }])
      throw new Error('unexpected file: ' + path)
    })
    const { getAllEntries } = await importModule()
    const entries = getAllEntries()
    // sort() theo chuỗi: chunk-1, chunk-10, chunk-2 (thứ tự string, không phải số)
    expect(entries.map((e) => e.word)).toEqual(['apple', 'cat', 'book'])
    expect(readFileSync).toHaveBeenCalledTimes(3) // không đọc readme.txt
  })

  it('cache sau lần gọi đầu — gọi lần 2 không đọc lại fs', async () => {
    readdirSync.mockReturnValue(['chunk-1.json'])
    readFileSync.mockReturnValue(
      JSON.stringify([{ word: 'dog', pos: 'n', vi: 'chó', ex_en: '', ex_vi: '' }]),
    )
    const { getAllEntries } = await importModule()
    const first = getAllEntries()
    const second = getAllEntries()
    expect(first).toBe(second) // cùng tham chiếu — lấy từ cache
    expect(readdirSync).toHaveBeenCalledTimes(1)
    expect(readFileSync).toHaveBeenCalledTimes(1)
  })

  it('thư mục không có chunk nào → trả mảng rỗng', async () => {
    readdirSync.mockReturnValue([])
    const { getAllEntries } = await importModule()
    expect(getAllEntries()).toEqual([])
  })
})
