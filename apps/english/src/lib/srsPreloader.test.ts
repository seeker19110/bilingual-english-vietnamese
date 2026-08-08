import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock progressSync
vi.mock('./progressSync', () => ({ pushProgress: vi.fn() }))

// Mock tts: speechCacheKey mô phỏng đúng khoá thật (version:lang:voice:text)
const mockPrefetchSpeech = vi.fn().mockResolvedValue(undefined)
vi.mock('./tts', () => ({
  getVoicePref: () => 'Kore',
  speechCacheKey: (text: string, lang: string, voice: string) => `${lang}:${voice}:${text}`,
  prefetchSpeech: (...args: unknown[]) => mockPrefetchSpeech(...args),
}))

// Mock danh sách giọng gói cho phép — mặc định 2 giọng để kiểm tra nhân bản theo giọng
const mockVoices = vi.fn(() => ['Kore', 'Puck'])
vi.mock('./voiceTiers', () => ({
  getPreloadVoices: () => mockVoices(),
}))

// Mock audioCache: chỉ giọng Kore của từ "apple" là đã có sẵn
vi.mock('./audioCache', () => ({
  audioCacheKey: (text: string, lang: string, voice: string) => `${lang}:${voice}:${text}`,
  getAudioBuffer: vi.fn().mockImplementation((key: string) => {
    if (key === 'en-US:Kore:apple') return Promise.resolve(new ArrayBuffer(10))
    return Promise.resolve(null)
  }),
}))

import { addToSRS } from './srs'
import { getSrsOfflineAudioStatus, preloadSrsAudio } from './srsPreloader'
import type { DictEntry } from '../types'

const W = (word: string, ex_en?: string): DictEntry => ({ word, ex_en }) as DictEntry

describe('srsPreloader — Pre-downloading audio for SRS offline review', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    mockVoices.mockReturnValue(['Kore', 'Puck'])
  })

  it('đếm mục audio theo TỪNG GIỌNG gói cho phép, không chỉ 1 giọng', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(Date.now())

    addToSRS('user1', 'apple')
    addToSRS('user1', 'banana')
    vi.advanceTimersByTime(5 * 3600 * 1000) // cả 2 thẻ đến hạn (+4h)

    const status = await getSrsOfflineAudioStatus('user1', [W('apple'), W('banana')])
    expect(status.wordCount).toBe(2)
    expect(status.voiceCount).toBe(2)
    expect(status.totalDue).toBe(4) // 2 từ × 2 giọng
    expect(status.cachedCount).toBe(1) // chỉ en-US:Kore:apple có sẵn
    expect(status.isFullyPrepared).toBe(false)
    expect(status.isLookahead).toBe(false)

    vi.useRealTimers()
  })

  it('đếm cả câu ví dụ, không bỏ sót như trước', async () => {
    mockVoices.mockReturnValue(['Kore'])
    const status = await getSrsOfflineAudioStatus('user_empty', [W('apple', 'An apple a day')])
    // 1 từ × 1 giọng × 2 câu (từ + ví dụ)
    expect(status.totalDue).toBe(2)
    expect(status.cachedCount).toBe(1) // chỉ "apple", câu ví dụ chưa có
  })

  it('chưa có thẻ due vẫn báo danh sách chuẩn bị trước (không còn 0/0 giả)', async () => {
    mockVoices.mockReturnValue(['Kore'])
    const status = await getSrsOfflineAudioStatus('user_empty', [W('banana')])
    expect(status.isLookahead).toBe(true)
    expect(status.totalDue).toBe(1)
    expect(status.isFullyPrepared).toBe(false)
  })

  it('preloadSrsAudio nạp mọi giọng, bỏ qua mục đã có sẵn trong IndexedDB', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(Date.now())
    addToSRS('user1', 'apple')
    vi.advanceTimersByTime(5 * 3600 * 1000)

    const progressLogs: number[] = []
    const resPromise = preloadSrsAudio('user1', [W('apple')], {
      onProgress: (done) => progressLogs.push(done),
    })
    await vi.runAllTimersAsync()
    const res = await resPromise

    expect(res.total).toBe(2) // 1 từ × 2 giọng
    expect(res.done).toBe(2)
    expect(progressLogs).toEqual([1, 2])
    // Kore đã có cache → chỉ gọi API cho Puck
    expect(mockPrefetchSpeech).toHaveBeenCalledTimes(1)
    expect(mockPrefetchSpeech).toHaveBeenCalledWith('apple', 'en-US', 'Puck')

    vi.useRealTimers()
  })

  it('lỗi mạng 1 mục không làm hỏng cả lượt tải', async () => {
    vi.useFakeTimers()
    mockVoices.mockReturnValue(['Puck'])
    mockPrefetchSpeech.mockRejectedValueOnce(new Error('Network error'))

    const resPromise = preloadSrsAudio('user_no_due', [W('orange')])
    await vi.runAllTimersAsync()
    const res = await resPromise

    expect(res.total).toBe(1)
    expect(res.done).toBe(1)
    expect(res.stopped).toBe(false)

    vi.useRealTimers()
  })

  it('shouldStop dừng giữa chừng và báo stopped', async () => {
    vi.useFakeTimers()
    mockVoices.mockReturnValue(['Kore', 'Puck'])

    let stop = false
    const resPromise = preloadSrsAudio('user_no_due', [W('orange')], {
      onProgress: () => {
        stop = true // dừng ngay sau mục đầu tiên
      },
      shouldStop: () => stop,
    })
    await vi.runAllTimersAsync()
    const res = await resPromise

    expect(res.stopped).toBe(true)
    expect(res.done).toBe(1)
    expect(res.total).toBe(2)

    vi.useRealTimers()
  })

  it('trả về 0/0 khi pool rỗng và không có thẻ due', async () => {
    const res = await preloadSrsAudio('user_no_due', [])
    expect(res.done).toBe(0)
    expect(res.total).toBe(0)
  })
})
