import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock execFile của node:child_process để test wordVisemesFromEspeak không cần cài eSpeak-ng thật.
const execFileMock = vi.fn()
vi.mock('node:child_process', () => {
  const execFile = (...args: unknown[]) => execFileMock(...args)
  return { execFile, default: { execFile } }
})

const { tokenToVisemes, wordVisemesFromEspeak } = await import('./espeakPhonemes.js')

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

// Helper: giả lập execFile — thành công trả stdout, hoặc gọi callback với lỗi.
function mockExecSuccess(stdout: string) {
  execFileMock.mockImplementation(
    (_bin: string, _args: string[], _opts: unknown, cb: (err: unknown, out: string) => void) => {
      cb(null, stdout)
      return { stdin: { end: vi.fn() } }
    },
  )
}
function mockExecFail(err: unknown) {
  execFileMock.mockImplementation(
    (_bin: string, _args: string[], _opts: unknown, cb: (err: unknown, out: string) => void) => {
      cb(err, '')
      return { stdin: { end: vi.fn() } }
    },
  )
}

describe('wordVisemesFromEspeak', () => {
  beforeEach(() => {
    execFileMock.mockReset()
  })

  it('mảng từ rỗng → trả về mảng rỗng, không gọi eSpeak-ng', async () => {
    const result = await wordVisemesFromEspeak([], 'en-US')
    expect(result).toEqual([])
    expect(execFileMock).not.toHaveBeenCalled()
  })

  it('eSpeak-ng chạy thành công, số token khớp số từ → trả về viseme từng từ', async () => {
    mockExecSuccess('pˈʌk fˈɛnɹɪɹ')
    const result = await wordVisemesFromEspeak(['puck', 'fenrir'], 'en-US')
    expect(result).toEqual([
      ['PP', 'AA'],
      ['FF', 'AA', 'AA'],
    ])
  })

  it('binary chưa cài (lỗi execFile) → trả về null để nơi gọi fallback', async () => {
    mockExecFail(Object.assign(new Error('spawn ENOENT'), { code: 'ENOENT' }))
    const result = await wordVisemesFromEspeak(['hello'], 'en-US')
    expect(result).toBeNull()
  })

  it('số token phoneme khác số từ đầu vào → trả về null (không đủ tin cậy để map 1-1)', async () => {
    mockExecSuccess('pˈʌk') // chỉ 1 token nhưng truyền 2 từ
    const result = await wordVisemesFromEspeak(['puck', 'extra'], 'en-US')
    expect(result).toBeNull()
  })

  it('dùng đúng mã giọng tiếng Việt khi lang = vi-VN', async () => {
    mockExecSuccess('bˈaː6n')
    await wordVisemesFromEspeak(['bạn'], 'vi-VN')
    expect(execFileMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['-v', 'vi']),
      expect.anything(),
      expect.any(Function),
    )
  })
})
