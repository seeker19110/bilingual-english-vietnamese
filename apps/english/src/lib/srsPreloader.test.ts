import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock progressSync
vi.mock('./progressSync', () => ({ pushProgress: vi.fn() }))

// Mock tts prefetchSpeech & getVoicePref
vi.mock('./tts', () => ({
  getVoicePref: () => 'Kore',
  prefetchSpeech: vi.fn().mockResolvedValue(undefined),
}))

// Mock audioCache
vi.mock('./audioCache', () => ({
  audioCacheKey: (text: string, lang: string, voice: string) => `${lang}:${voice}:${text}`,
  getAudioBuffer: vi.fn().mockImplementation((key: string) => {
    if (key.includes('apple')) return Promise.resolve(new ArrayBuffer(10))
    return Promise.resolve(null)
  }),
}))

import { addToSRS } from './srs'
import { getSrsOfflineAudioStatus, preloadSrsAudio } from './srsPreloader'
import type { DictEntry } from '../types'

const W = (word: string): DictEntry => ({ word }) as DictEntry

describe('srsPreloader — Pre-downloading audio for SRS offline review', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('getSrsOfflineAudioStatus đếm chính xác số thẻ due đã có audio offline', async () => {
    vi.useFakeTimers()
    const now = Date.now()
    vi.setSystemTime(now)

    // Tạo thẻ đến hạn ôn
    addToSRS('user1', 'apple')
    addToSRS('user1', 'banana')

    // Tua time 5 giờ để cả 2 đến hạn (+4h)
    vi.advanceTimersByTime(5 * 3600 * 1000)

    const status = await getSrsOfflineAudioStatus('user1', [W('apple'), W('banana')])
    expect(status.totalDue).toBe(2)
    expect(status.cachedCount).toBe(1) // apple được mock có buffer, banana null
    expect(status.isFullyPrepared).toBe(false)

    vi.useRealTimers()
  })

  it('preloadSrsAudio duyệt qua danh sách và gọi callback tiến độ', async () => {
    vi.useFakeTimers()
    const now = Date.now()
    vi.setSystemTime(now)

    addToSRS('user1', 'apple')
    vi.advanceTimersByTime(5 * 3600 * 1000)

    const progressLogs: number[] = []
    const resPromise = preloadSrsAudio('user1', [W('apple')], (done) => {
      progressLogs.push(done)
    })

    // Advance timers cho sleep(60)
    await vi.runAllTimersAsync()
    const res = await resPromise

    expect(res.done).toBe(1)
    expect(res.total).toBe(1)
    expect(progressLogs).toContain(1)

    vi.useRealTimers()
  })
})
