import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./audioCache', () => ({
  audioCacheKey: (text: string, lang: string, voice: string) => `${lang}:${voice}:${text}`,
  // getAudioEntry trả cả timeline khẩu hình (null = không có timing thật, xem
  // api/_lib/visemeTimeline.ts) — đường dùng chính của ensureAudioWithTimeline.
  getAudioEntry: async () => ({ buffer: new ArrayBuffer(8), timeline: null }),
  getAudioBuffer: async () => new ArrayBuffer(8),
  setAudioBuffer: async () => {},
}))

// Audio giả tối thiểu — KHÔNG tự bắn onended (mô phỏng audio "đang phát dở"), cho phép
// bài test chiếm quyền thẻ audio dùng chung giữa chừng như người dùng bấm 2 nút loa liên tiếp.
class FakeAudio {
  src = ''
  playbackRate = 1
  preservesPitch = true
  currentTime = 0
  duration = 1
  onended: (() => void) | null = null
  onerror: (() => void) | null = null
  ontimeupdate: (() => void) | null = null
  onloadedmetadata: (() => void) | null = null
  preload = ''
  play() {
    return Promise.resolve()
  }
  pause() {}
}

beforeEach(() => {
  vi.stubGlobal('Audio', FakeAudio)
  vi.stubGlobal('URL', { createObjectURL: () => 'blob:fake', revokeObjectURL: () => {} })
})

describe('speak() — 2 lời gọi chồng nhau qua nút loa khác nhau (không qua playAudioUrl)', () => {
  it('lời gọi ĐẦU TIÊN vẫn tự settle (không treo mãi) khi lời gọi THỨ HAI chiếm thẻ audio dùng chung giữa chừng', async () => {
    const { speak } = await import('./tts')

    let settled1 = false
    const p1 = speak('hello', 'en-US', 'Kore').then(
      () => {
        settled1 = true
      },
      () => {
        settled1 = true
      },
    )

    // Đợi vài vòng event-loop để p1 chạy tới đoạn await new Promise(...) trong speakViaGoogle
    // (ensureAudioBuffer là async nên cần vài tick mới tới đó).
    await new Promise((r) => setTimeout(r, 20))
    expect(settled1).toBe(false) // đang "phát dở" — chưa settle, đúng như mong đợi

    // Người dùng bấm nút loa THỨ HAI trong lúc câu 1 còn đang phát (đúng luồng thật của
    // KaraokeText.tsx: bấm khi `playing` của CHÍNH nó là false thì gọi speak() thẳng, dù
    // audio khác đang phát ở component khác) — KHÔNG qua stopSpeaking().
    const p2 = speak('world', 'en-US', 'Kore')

    // p1 phải TỰ SETTLE ngay khi p2 chiếm quyền thẻ audio — không được treo vĩnh viễn.
    await expect(p1).resolves.toBeUndefined()
    expect(settled1).toBe(true)

    // p2 vẫn "đang phát dở" (FakeAudio không tự bắn onended) — không await, chỉ cần biết
    // nó không bị reject để tránh unhandled rejection.
    p2.catch(() => {})
  })
})
