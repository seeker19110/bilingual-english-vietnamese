import { describe, it, expect } from 'vitest'
import { detectWordFreqFormat, parseWordRanks } from './wordFreq'

describe('detectWordFreqFormat', () => {
  it('nhận .csv (không phân biệt hoa/thường)', () => {
    expect(detectWordFreqFormat('data/ngsl.CSV')).toBe('csv')
  })

  it('mọi đuôi khác coi là .txt', () => {
    expect(detectWordFreqFormat('data/ngsl.txt')).toBe('txt')
    expect(detectWordFreqFormat('data/ngsl')).toBe('txt')
  })
})

describe('parseWordRanks — định dạng txt (mỗi dòng 1 từ, thứ tự = hạng)', () => {
  it('dòng đầu = hạng 1, tăng dần theo thứ tự dòng', () => {
    const ranks = parseWordRanks('the\nbe\nto\n', 'txt')
    expect(ranks.get('the')).toBe(1)
    expect(ranks.get('be')).toBe(2)
    expect(ranks.get('to')).toBe(3)
  })

  it('chuẩn hoá chữ thường + bỏ khoảng trắng + dòng rỗng', () => {
    const ranks = parseWordRanks('  The \n\n BE\n', 'txt')
    expect(ranks.get('the')).toBe(1)
    expect(ranks.get('be')).toBe(2)
    expect(ranks.size).toBe(2)
  })

  it('từ trùng lặp: giữ hạng xuất hiện ĐẦU TIÊN', () => {
    const ranks = parseWordRanks('the\nbe\nthe\n', 'txt')
    expect(ranks.get('the')).toBe(1)
    expect(ranks.size).toBe(2)
  })

  it('chuỗi rỗng → map rỗng, không throw', () => {
    expect(parseWordRanks('', 'txt').size).toBe(0)
  })
})

describe('parseWordRanks — định dạng csv (cột word,rank)', () => {
  it('đọc đúng cột theo header, bỏ qua dòng header', () => {
    const ranks = parseWordRanks('word,rank\nthe,1\nbe,2\n', 'csv')
    expect(ranks.get('the')).toBe(1)
    expect(ranks.get('be')).toBe(2)
    expect(ranks.size).toBe(2)
  })

  it('cột đảo thứ tự (rank,word) vẫn đọc đúng nhờ tra theo tên header', () => {
    const ranks = parseWordRanks('rank,word\n1,the\n2,be\n', 'csv')
    expect(ranks.get('the')).toBe(1)
    expect(ranks.get('be')).toBe(2)
  })

  it('không có header hợp lệ → coi cột 0 là word, cột 1 là rank', () => {
    const ranks = parseWordRanks('the,1\nbe,2\n', 'csv')
    expect(ranks.get('the')).toBe(1)
    expect(ranks.get('be')).toBe(2)
  })

  it('bỏ qua dòng có rank không phải số', () => {
    const ranks = parseWordRanks('word,rank\nthe,1\nbroken,abc\n', 'csv')
    expect(ranks.get('the')).toBe(1)
    expect(ranks.has('broken')).toBe(false)
    expect(ranks.size).toBe(1)
  })
})
