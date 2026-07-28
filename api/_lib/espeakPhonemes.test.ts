import { describe, it, expect } from 'vitest'
import { tokenToVisemes } from './espeakPhonemes.js'

describe('tokenToVisemes', () => {
  it('nhận diện phụ âm môi đầu từ (bilabial → PP)', () => {
    // "Puck" → pˈʌk (đầu từ 'p' là bilabial)
    expect(tokenToVisemes('pˈʌk')).toEqual(['PP', 'AA'])
  })

  it('nhận diện phụ âm răng-môi đầu từ (labiodental → FF)', () => {
    // "Fenrir" → fˈɛnɹɪɹ
    expect(tokenToVisemes('fˈɛnɹɪɹ')).toEqual(['FF', 'AA', 'AA'])
  })

  it('nguyên âm tròn môi → OO, nguyên âm khác → AA', () => {
    // "today" → tədˈeɪ — mỗi ký tự nguyên âm (ə, e, ɪ) tạo 1 khung riêng, không tròn môi → AA
    expect(tokenToVisemes('tədˈeɪ')).toEqual(['AA', 'AA', 'AA'])
    // "who" → huː (u tròn môi → OO)
    expect(tokenToVisemes('huː')).toEqual(['OO'])
  })

  it('bỏ qua dấu nhấn/dấu kéo dài/số thanh điệu, không tạo viseme riêng', () => {
    // Tiếng Việt: "bạn" → bˈaː6n (số 6 = thanh điệu, không phải phoneme)
    expect(tokenToVisemes('bˈaː6n')).toEqual(['PP', 'AA'])
  })

  it('token không có nguyên âm nào vẫn trả về ít nhất 1 viseme (ca biên, không rỗng)', () => {
    expect(tokenToVisemes('')).toEqual(['AA'])
    expect(tokenToVisemes('ˈˌː')).toEqual(['AA'])
  })

  it('phụ âm môi ĐỨNG SAU nguyên âm đầu tiên không tạo thêm viseme riêng', () => {
    // "ham" → hˈæm — 'm' đứng sau nguyên âm, không tạo thêm PP
    expect(tokenToVisemes('hˈæm')).toEqual(['AA'])
  })
})
