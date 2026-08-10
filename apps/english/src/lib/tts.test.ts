import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@core/authHeader', () => ({
  getAccessToken: vi.fn().mockResolvedValue('fake-token'),
}))

// getAudioEntry là vi.fn() (không phải arrow async cố định) để từng test tự đổi hành vi
// (vd trả null để buộc ensureAudioWithTimeline đi qua đường gọi /api/tts thật).
vi.mock('./audioCache', () => ({
  audioCacheKey: (text: string, lang: string, voice: string) => `${lang}:${voice}:${text}`,
  // getAudioEntry trả cả timeline khẩu hình (null = không có timing thật, xem
  // api/_lib/visemeTimeline.ts) — đường dùng chính của ensureAudioWithTimeline.
  getAudioEntry: vi.fn().mockResolvedValue({ buffer: new ArrayBuffer(8), timeline: null }),
  getAudioBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
  setAudioBuffer: vi.fn().mockResolvedValue(undefined),
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

beforeEach(async () => {
  vi.stubGlobal('Audio', FakeAudio)
  vi.stubGlobal('URL', { createObjectURL: () => 'blob:fake', revokeObjectURL: () => {} })
  // `restoreAllMocks()` (dùng ở describe "ensureAudioBuffer" bên dưới) xoá luôn
  // implementation của getAccessToken (vi.fn() từ vi.mock factory) — không chỉ các
  // spy tạo bằng vi.spyOn. Đặt lại giá trị mặc định mỗi test để các describe SAU đó
  // không bị "ăn theo" trạng thái đã bị restore của describe trước.
  const { getAccessToken } = await import('@core/authHeader')
  vi.mocked(getAccessToken).mockResolvedValue('fake-token')
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

describe('unlockAudio / pause / resume', () => {
  beforeEach(() => {
    vi.stubGlobal('speechSynthesis', { pause: vi.fn(), resume: vi.fn(), cancel: vi.fn() })
  })

  it('unlockAudio không throw khi gọi nhiều lần (chỉ chạy thật ở lần đầu)', async () => {
    const { unlockAudio } = await import('./tts')
    expect(() => {
      unlockAudio()
      unlockAudio()
    }).not.toThrow()
  })

  it('pauseCurrentAudio/resumeCurrentAudio gọi được khi chưa có audio nào (không throw)', async () => {
    const { pauseCurrentAudio, resumeCurrentAudio } = await import('./tts')
    expect(() => pauseCurrentAudio()).not.toThrow()
    expect(() => resumeCurrentAudio()).not.toThrow()
  })
})

describe('tốc độ phát (getRatePref/setRatePref)', () => {
  beforeEach(() => localStorage.clear())

  it('chưa đặt → mặc định 1', async () => {
    const { getRatePref } = await import('./tts')
    expect(getRatePref()).toBe(1)
  })

  it('setRatePref rồi đọc lại đúng giá trị hợp lệ (0.75/1.25)', async () => {
    const { getRatePref, setRatePref } = await import('./tts')
    setRatePref(0.75)
    expect(getRatePref()).toBe(0.75)
    setRatePref(1.25)
    expect(getRatePref()).toBe(1.25)
  })

  it('giá trị localStorage lạ (không phải 0.75/1.25) → về mặc định 1', async () => {
    localStorage.setItem('tts_rate', '2')
    const { getRatePref } = await import('./tts')
    expect(getRatePref()).toBe(1)
  })
})

describe('isTTSSupported', () => {
  it('luôn true (Google TTS không phụ thuộc trình duyệt)', async () => {
    const { isTTSSupported } = await import('./tts')
    expect(isTTSSupported()).toBe(true)
  })
})

describe('giọng đọc: setVoicePref/getVoicePref, clamp theo quyền gói, giá trị cũ', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('chưa từng chọn giọng, chưa cache quyền gói → mặc định Kore', async () => {
    const { getVoicePref } = await import('./tts')
    expect(getVoicePref()).toBe('Kore')
  })

  it('setVoicePref rồi getVoicePref đọc lại đúng (chế độ ngẫu nhiên tắt)', async () => {
    const { getVoicePref, setVoicePref } = await import('./tts')
    setVoicePref('Aoede')
    expect(getVoicePref()).toBe('Aoede')
  })

  it('giá trị cũ (legacy "female"/"male") → map sang giọng mới', async () => {
    localStorage.setItem('tts_voice', 'male2')
    const { getVoicePref } = await import('./tts')
    expect(getVoicePref()).toBe('Charon')
  })

  // 2026-08-10: clamp GIỮ NGUYÊN GIỚI TÍNH (nam → Puck, không còn nhảy sang giọng nữ Kore).
  it('giọng đã lưu NGOÀI quyền gói hiện tại (cache free) → clamp giữ giới tính', async () => {
    localStorage.setItem('tts_voice', 'Umbriel') // giọng NAM, chỉ VIP
    localStorage.setItem('voice_allowed_cache', JSON.stringify(['Kore', 'Aoede', 'Puck', 'Charon']))
    const { getVoicePref } = await import('./tts')
    expect(getVoicePref()).toBe('Puck')
  })

  it('giọng NỮ ngoài quyền gói → clamp về Kore (mặc định nữ)', async () => {
    localStorage.setItem('tts_voice', 'Vindemiatrix')
    localStorage.setItem('voice_allowed_cache', JSON.stringify(['Kore', 'Aoede', 'Puck', 'Charon']))
    const { getVoicePref } = await import('./tts')
    expect(getVoicePref()).toBe('Kore')
  })

  it('có Studio trong quyền gói (VIP) NHƯNG chưa chọn tay → mặc định là Studio-O', async () => {
    localStorage.setItem('voice_allowed_cache', JSON.stringify(['Kore', 'Studio-O', 'Studio-Q']))
    const { getVoicePref } = await import('./tts')
    expect(getVoicePref()).toBe('Studio-O')
  })
})

describe('chế độ giọng ngẫu nhiên (random pref)', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('mặc định TẮT', async () => {
    const { getVoiceRandomPref } = await import('./tts')
    expect(getVoiceRandomPref()).toBe(false)
  })

  it('bật rồi getVoicePref random trong đúng giới tính của giọng đã chọn', async () => {
    const { getVoicePref, setVoicePref, setVoiceRandomPref } = await import('./tts')
    setVoicePref('Kore') // nữ
    setVoiceRandomPref(true)
    const picked = getVoicePref()
    expect([
      'Kore',
      'Aoede',
      'Leda',
      'Zephyr',
      'Autonoe',
      'Callirrhoe',
      'Vindemiatrix',
      'Rachel',
    ]).toContain(picked)
  })

  it('gọi lại trong CÙNG phiên → giữ nguyên giọng đã bốc (session cache)', async () => {
    const { getVoicePref, setVoicePref, setVoiceRandomPref } = await import('./tts')
    setVoicePref('Puck') // nam
    setVoiceRandomPref(true)
    const first = getVoicePref()
    const second = getVoicePref()
    expect(second).toBe(first)
  })

  it('reshuffleRandomVoice xoá lựa chọn phiên → lần gọi sau CÓ THỂ bốc lại (không lỗi)', async () => {
    const { getVoicePref, setVoicePref, setVoiceRandomPref, reshuffleRandomVoice } =
      await import('./tts')
    setVoicePref('Puck')
    setVoiceRandomPref(true)
    getVoicePref()
    expect(() => reshuffleRandomVoice()).not.toThrow()
    const after = getVoicePref()
    expect(typeof after).toBe('string')
  })
})

describe('stopSpeaking / playAudioUrl', () => {
  beforeEach(() => {
    vi.stubGlobal('speechSynthesis', { pause: vi.fn(), resume: vi.fn(), cancel: vi.fn() })
  })

  it('stopSpeaking gọi được khi chưa phát gì (không throw)', async () => {
    const { stopSpeaking } = await import('./tts')
    expect(() => stopSpeaking()).not.toThrow()
  })

  it('playAudioUrl phát audio từ URL ngoài (vd phát âm từ), rồi stopSpeaking không lỗi', async () => {
    const { playAudioUrl, stopSpeaking } = await import('./tts')
    expect(() => playAudioUrl('https://example.com/audio.mp3')).not.toThrow()
    expect(() => stopSpeaking()).not.toThrow()
  })
})

describe('ensureAudioBuffer / ensureAudioWithTimeline — đường gọi /api/tts thật khi chưa cache', () => {
  beforeEach(async () => {
    localStorage.clear()
    vi.stubGlobal('speechSynthesis', { pause: vi.fn(), resume: vi.fn(), cancel: vi.fn() })
    const { getAudioEntry } = await import('./audioCache')
    vi.mocked(getAudioEntry).mockResolvedValue(null) // buộc đi qua đường gọi server
    vi.spyOn(crypto.subtle, 'importKey').mockResolvedValue({} as CryptoKey)
    vi.spyOn(crypto.subtle, 'decrypt').mockResolvedValue(new ArrayBuffer(4))
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('gọi /api/tts, giải mã audio, lưu vào cache → trả buffer', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url === '/api/tts') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ audio_url: '/fake.mp3', key_b64: 'a2V5', iv_b64: 'aXY=' }),
          })
        }
        // fetch audio_url (mã hóa)
        return Promise.resolve({
          ok: true,
          status: 200,
          arrayBuffer: async () => new ArrayBuffer(16),
        })
      }),
    )
    const { ensureAudioWithTimeline } = await import('./tts')
    const { buffer, timeline } = await ensureAudioWithTimeline('Hello', 'en-US', 'Kore')
    expect(buffer.byteLength).toBe(4)
    expect(timeline).toBeNull()
  })

  it('server trả 429 → tự thử lại 1 lần rồi thành công', async () => {
    let ttsCalls = 0
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url === '/api/tts') {
          ttsCalls++
          if (ttsCalls === 1) return Promise.resolve({ ok: false, status: 429 })
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ audio_url: '/fake.mp3', key_b64: 'a2V5', iv_b64: 'aXY=' }),
          })
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          arrayBuffer: async () => new ArrayBuffer(16),
        })
      }),
    )
    const { ensureAudioBuffer } = await import('./tts')
    const buffer = await ensureAudioBuffer('Retry me', 'en-US', 'Kore')
    expect(buffer.byteLength).toBe(4)
    expect(ttsCalls).toBe(2)
  }, 10_000)

  it('server trả lỗi (không phải 429) → ném lỗi rõ ràng', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    const { ensureAudioBuffer } = await import('./tts')
    await expect(ensureAudioBuffer('Fail me', 'en-US', 'Kore')).rejects.toThrow('TTS API lỗi: 500')
  })

  it('chưa đăng nhập (getAccessToken trả null) → ném lỗi rõ ràng', async () => {
    const { getAccessToken } = await import('@core/authHeader')
    vi.mocked(getAccessToken).mockResolvedValueOnce(null as unknown as string)
    const { ensureAudioBuffer } = await import('./tts')
    await expect(ensureAudioBuffer('Not logged in', 'en-US', 'Kore')).rejects.toThrow(
      'Chưa đăng nhập',
    )
  })

  it('2 lời gọi CÙNG lúc CÙNG câu → gộp thành 1 request (inflight dedupe)', async () => {
    let ttsCalls = 0
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url === '/api/tts') {
          ttsCalls++
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ audio_url: '/fake.mp3', key_b64: 'a2V5', iv_b64: 'aXY=' }),
          })
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          arrayBuffer: async () => new ArrayBuffer(16),
        })
      }),
    )
    const { ensureAudioBuffer } = await import('./tts')
    const [b1, b2] = await Promise.all([
      ensureAudioBuffer('Same sentence', 'en-US', 'Kore'),
      ensureAudioBuffer('Same sentence', 'en-US', 'Kore'),
    ])
    expect(b1.byteLength).toBe(4)
    expect(b2.byteLength).toBe(4)
    expect(ttsCalls).toBe(1) // chỉ 1 request thật dù gọi 2 lần
  })

  it('giọng Studio + câu tiếng Việt → tự đổi về Chirp3-HD cùng giới tính (Studio-O → Kore)', async () => {
    let usedVoice = ''
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string, opts?: { body?: string }) => {
        if (url === '/api/tts') {
          const body = JSON.parse(opts!.body!) as { voice: string }
          usedVoice = body.voice
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ audio_url: '/fake.mp3', key_b64: 'a2V5', iv_b64: 'aXY=' }),
          })
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          arrayBuffer: async () => new ArrayBuffer(16),
        })
      }),
    )
    const { ensureAudioBuffer } = await import('./tts')
    await ensureAudioBuffer('Xin chào', 'vi-VN', 'Studio-O')
    expect(usedVoice).toBe('Kore')
  })
})

describe('prefetchSpeech', () => {
  beforeEach(async () => {
    const { getAudioEntry } = await import('./audioCache')
    vi.mocked(getAudioEntry).mockResolvedValue({ buffer: new ArrayBuffer(4), timeline: null })
  })

  it('text rỗng → không làm gì, không lỗi', async () => {
    const { prefetchSpeech } = await import('./tts')
    await expect(prefetchSpeech('   ', 'en-US')).resolves.toBeUndefined()
  })

  it('text có nội dung, đã có cache → chạy xong không lỗi', async () => {
    const { prefetchSpeech } = await import('./tts')
    await expect(prefetchSpeech('Hello there', 'en-US', 'Kore')).resolves.toBeUndefined()
  })

  it('lỗi khi tải (vd mất mạng) → bắt lỗi êm, không throw', async () => {
    const { getAudioEntry } = await import('./audioCache')
    vi.mocked(getAudioEntry).mockRejectedValueOnce(new Error('idb error'))
    const { prefetchSpeech } = await import('./tts')
    await expect(prefetchSpeech('Oops', 'en-US', 'Kore')).resolves.toBeUndefined()
  })
})

describe('speak() — fallback Web Speech khi Google TTS lỗi', () => {
  beforeEach(async () => {
    const { getAudioEntry } = await import('./audioCache')
    vi.mocked(getAudioEntry).mockResolvedValue(null)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
  })

  it('Google TTS lỗi → rơi về Web Speech, resolve êm (không throw ra ngoài)', async () => {
    const speakFn = vi.fn()
    const cancelFn = vi.fn()
    class FakeUtterance {
      lang = ''
      rate = 1
      onboundary: unknown = null
      onend: (() => void) | null = null
      onerror: (() => void) | null = null
      voice: unknown = null
      constructor(public text: string) {}
    }
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
    vi.stubGlobal('speechSynthesis', {
      cancel: cancelFn,
      getVoices: () => [],
      speak: (u: FakeUtterance) => {
        speakFn(u)
        u.onend?.()
      },
    })
    const { speak } = await import('./tts')
    // speak() trả về "số vé" của lượt phát (number) để speakBilingual so lại — xem playToken.
    await expect(speak('Xin chào', 'vi-VN', 'Kore')).resolves.toEqual(expect.any(Number))
    expect(speakFn).toHaveBeenCalled()
  })

  it('không có speechSynthesis trên trình duyệt → resolve êm, không throw', async () => {
    // Code gốc kiểm bằng `'speechSynthesis' in window` — stub bằng giá trị `undefined`
    // (qua vi.stubGlobal) vẫn để lại property nên `in` vẫn trả true. Phải XOÁ hẳn
    // property mới mô phỏng đúng trình duyệt không hỗ trợ.
    delete (window as unknown as { speechSynthesis?: unknown }).speechSynthesis
    const { speak } = await import('./tts')
    await expect(speak('Hello', 'en-US', 'Kore')).resolves.toEqual(expect.any(Number))
  })

  it('text rỗng ở fallback Web Speech → resolve ngay, không gọi speak()', async () => {
    const speakFn = vi.fn()
    vi.stubGlobal('speechSynthesis', { cancel: vi.fn(), getVoices: () => [], speak: speakFn })
    const { speak } = await import('./tts')
    await expect(speak('   ', 'en-US', 'Kore')).resolves.toEqual(expect.any(Number))
    expect(speakFn).not.toHaveBeenCalled()
  })
})

describe('speakBilingual — đọc tuần tự câu thoại rồi phần sửa lỗi', () => {
  beforeEach(async () => {
    const { getAudioEntry } = await import('./audioCache')
    vi.mocked(getAudioEntry).mockResolvedValue({ buffer: new ArrayBuffer(4), timeline: null })
    // Khác các describe khác: ở đây ta AWAIT speakBilingual tới khi resolve thật, nên
    // FakeAudio (không tự bắn onended) sẽ treo mãi mãi. Dùng bản tự bắn onended ngay sau
    // play() để mô phỏng audio phát xong tức thì.
    class AutoEndingAudio {
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
        queueMicrotask(() => this.onended?.())
        return Promise.resolve()
      }
      pause() {}
    }
    vi.stubGlobal('Audio', AutoEndingAudio)
    // QUAN TRỌNG: tts.ts giữ `sharedAudio` là biến singleton cấp module — nếu module đã
    // được import ở test/describe trước đó, `sharedAudio` đã được tạo từ FakeAudio CŨ (không
    // tự bắn onended) và việc stub lại `Audio` ở trên không ảnh hưởng thẻ audio đã tồn tại.
    // Reset module để `sharedAudio` được tạo lại từ AutoEndingAudio ở trên.
    vi.resetModules()
  })

  it('đọc cả speech lẫn feedback khi không bị ngắt giữa chừng', async () => {
    const { speakBilingual } = await import('./tts')
    const spokenWords: number[] = []
    await speakBilingual(
      'Hello',
      'Xin chào',
      'en-US',
      'vi-VN',
      'Kore',
      1,
      (i) => spokenWords.push(i),
      (i) => spokenWords.push(i),
    )
    // Chỉ cần chạy xong không lỗi — FakeAudio không tự bắn onended nên onWord có thể
    // không được gọi, quan trọng là hàm không throw và trả về đúng kiểu Promise<void>.
    expect(Array.isArray(spokenWords)).toBe(true)
  })

  it('speech rỗng → bỏ qua, chỉ đọc feedback', async () => {
    const { speakBilingual } = await import('./tts')
    await expect(speakBilingual('', 'Xin chào', 'en-US', 'vi-VN', 'Kore')).resolves.toBeUndefined()
  })

  it('feedback rỗng → chỉ đọc speech, không lỗi', async () => {
    const { speakBilingual } = await import('./tts')
    await expect(speakBilingual('Hello', '', 'en-US', 'vi-VN', 'Kore')).resolves.toBeUndefined()
  })

  // Điểm khác biệt cốt lõi của app: phần giải thích đọc bằng GIỌNG khác giọng hội thoại
  // (2026-08-10). Khoá cache mock có dạng "<lang>:<voice>:<text>" nên đọc từ getAudioEntry
  // là biết chính xác mỗi đoạn được phát bằng giọng nào.
  it('phần sửa lỗi dùng giọng KHÁC giọng hội thoại (mặc định khác giới tính)', async () => {
    const { speakBilingual } = await import('./tts')
    const { getAudioEntry } = await import('./audioCache')
    vi.mocked(getAudioEntry).mockClear()
    await speakBilingual('Hello', 'Xin chào', 'en-US', 'vi-VN', 'Kore')
    const keys = vi.mocked(getAudioEntry).mock.calls.map((c) => c[0])
    expect(keys).toContain('en-US:Kore:Hello')
    expect(keys).toContain('vi-VN:Puck:Xin chào')
  })

  it('truyền tay feedbackVoice → dùng đúng giọng đó cho phần sửa lỗi', async () => {
    const { speakBilingual } = await import('./tts')
    const { getAudioEntry } = await import('./audioCache')
    vi.mocked(getAudioEntry).mockClear()
    await speakBilingual(
      'Hello',
      'Xin chào',
      'en-US',
      'vi-VN',
      'Kore',
      1,
      undefined,
      undefined,
      'Charon',
    )
    expect(vi.mocked(getAudioEntry).mock.calls.map((c) => c[0])).toContain('vi-VN:Charon:Xin chào')
  })

  it('tắt chế độ giọng giải thích riêng → cả hai đoạn dùng chung 1 giọng (hành vi cũ)', async () => {
    const { speakBilingual, setNativeVoiceSeparate } = await import('./tts')
    const { getAudioEntry } = await import('./audioCache')
    setNativeVoiceSeparate(false)
    vi.mocked(getAudioEntry).mockClear()
    await speakBilingual('Hello', 'Xin chào', 'en-US', 'vi-VN', 'Kore')
    expect(vi.mocked(getAudioEntry).mock.calls.map((c) => c[0])).toContain('vi-VN:Kore:Xin chào')
    setNativeVoiceSeparate(true)
  })
})

// ── Giọng server THẬT SỰ dùng (2026-08-10) ─────────────────────────────────
// /api/tts có thể hạ giọng theo gói (clampVoiceToPlan). Client PHẢI bám theo giọng server
// trả về, vì nó quyết định định dạng audio: Gemini = WAV, còn lại = mp3. Đoán sai là gắn
// sai mimeType cho Blob → iOS/Safari không phát được (lỗi gói Free mở trang đọc truyện).
describe('ensureAudioWithTimeline — bám theo giọng server trả về', () => {
  beforeEach(async () => {
    localStorage.clear()
    vi.stubGlobal('speechSynthesis', { pause: vi.fn(), resume: vi.fn(), cancel: vi.fn() })
    const { getAudioEntry } = await import('./audioCache')
    vi.mocked(getAudioEntry).mockResolvedValue(null)
    vi.spyOn(crypto.subtle, 'importKey').mockResolvedValue({} as CryptoKey)
    vi.spyOn(crypto.subtle, 'decrypt').mockResolvedValue(new ArrayBuffer(4))
  })
  afterEach(() => vi.restoreAllMocks())

  function mockTts(body: Record<string, unknown>) {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) =>
        url === '/api/tts'
          ? Promise.resolve({ ok: true, status: 200, json: async () => body })
          : Promise.resolve({
              ok: true,
              status: 200,
              arrayBuffer: async () => new ArrayBuffer(16),
            }),
      ),
    )
  }

  it('server hạ giọng Gemini → Kore: trả về giọng THẬT và lưu cache kèm giọng đó', async () => {
    mockTts({ audio_url: '/fake.mp3', key_b64: 'a2V5', iv_b64: 'aXY=', voice: 'Kore' })
    const { ensureAudioWithTimeline } = await import('./tts')
    const { setAudioBuffer } = await import('./audioCache')
    const res = await ensureAudioWithTimeline('Ngày xửa ngày xưa', 'vi-VN', 'Gemini-Leda')
    expect(res.voice).toBe('Kore')
    expect(vi.mocked(setAudioBuffer).mock.calls.at(-1)?.[3]).toBe('Kore')
  })

  it('server không trả `voice` (bản cũ) → giữ giọng client yêu cầu, không vỡ', async () => {
    mockTts({ audio_url: '/fake.mp3', key_b64: 'a2V5', iv_b64: 'aXY=' })
    const { ensureAudioWithTimeline } = await import('./tts')
    const res = await ensureAudioWithTimeline('Hello', 'en-US', 'Kore')
    expect(res.voice).toBe('Kore')
  })

  it('server trả `voice` lạ (không hợp lệ) → bỏ qua, dùng giọng client yêu cầu', async () => {
    mockTts({ audio_url: '/fake.mp3', key_b64: 'a2V5', iv_b64: 'aXY=', voice: 'KhongTonTai' })
    const { ensureAudioWithTimeline } = await import('./tts')
    const res = await ensureAudioWithTimeline('Hello', 'en-US', 'Aoede')
    expect(res.voice).toBe('Aoede')
  })

  it('cache IndexedDB có sẵn giọng thật → dùng lại, không gọi server', async () => {
    const { getAudioEntry } = await import('./audioCache')
    vi.mocked(getAudioEntry).mockResolvedValue({
      buffer: new ArrayBuffer(4),
      timeline: null,
      voice: 'Kore',
    })
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const { ensureAudioWithTimeline } = await import('./tts')
    const res = await ensureAudioWithTimeline('Ngày xửa', 'vi-VN', 'Gemini-Leda')
    expect(res.voice).toBe('Kore')
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

// ── Giọng GIẢI THÍCH riêng (tiếng mẹ đẻ) — 2026-08-10 ──────────────────────
describe('getNativeVoicePref — giọng đọc phần sửa lỗi', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  it('mặc định BẬT và chọn giọng KHÁC GIỚI TÍNH với giọng hội thoại', async () => {
    const { getNativeVoicePref, isNativeVoiceSeparate } = await import('./tts')
    expect(isNativeVoiceSeparate()).toBe(true)
    expect(getNativeVoicePref('Kore')).toBe('Puck') // nữ → nam
    expect(getNativeVoicePref('Charon')).toBe('Kore') // nam → nữ
  })

  it('tắt công tắc → dùng chung đúng giọng hội thoại (hành vi cũ)', async () => {
    const { getNativeVoicePref, setNativeVoiceSeparate } = await import('./tts')
    setNativeVoiceSeparate(false)
    expect(getNativeVoicePref('Kore')).toBe('Kore')
  })

  it('người dùng chọn tay giọng trong quyền gói → dùng đúng giọng đó', async () => {
    const { getNativeVoicePref, setNativeVoicePref } = await import('./tts')
    const { cacheAllowedVoices } = await import('./voiceTiers')
    cacheAllowedVoices('vip', new Date('2020-01-01'))
    setNativeVoicePref('Fenrir')
    expect(getNativeVoicePref('Kore')).toBe('Fenrir')
  })

  it('giọng chọn tay NGOÀI quyền gói → về mặc định khác giới tính', async () => {
    const { getNativeVoicePref, setNativeVoicePref } = await import('./tts')
    const { cacheAllowedVoices } = await import('./voiceTiers')
    cacheAllowedVoices('free', new Date('2020-01-01'))
    setNativeVoicePref('Fenrir') // chỉ Pro/VIP
    expect(getNativeVoicePref('Kore')).toBe('Puck')
  })

  it('không bao giờ trả giọng Studio/ElevenLabs (Studio không có tiếng Việt, ElevenLabs đắt)', async () => {
    const { getNativeVoicePref, setNativeVoicePref } = await import('./tts')
    const { cacheAllowedVoices } = await import('./voiceTiers')
    cacheAllowedVoices('vip', new Date('2020-01-01'))
    setNativeVoicePref('Studio-O')
    expect(getNativeVoicePref('Puck')).toBe('Kore')
    setNativeVoicePref('Rachel')
    expect(getNativeVoicePref('Puck')).toBe('Kore')
  })
})
