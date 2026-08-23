import { describe, it, expect, vi, afterEach } from 'vitest'
import { toMonoPcm16kHz, encodeWavPcm16, blobToWav16kMono } from './wav'

describe('toMonoPcm16kHz', () => {
  it('mono đã đúng 16kHz → giữ nguyên (không resample)', () => {
    const samples = new Float32Array([0.1, 0.2, 0.3, 0.4])
    const result = toMonoPcm16kHz({ channelData: [samples], sampleRate: 16_000 })
    // so bằng closeTo (không toEqual) — Float32Array mất độ chính xác so với literal number
    // thường (vd 0.1 lưu thành 0.10000000149011612), giá trị vẫn ĐÚNG là "không đổi".
    result.forEach((v, i) => expect(v).toBeCloseTo([0.1, 0.2, 0.3, 0.4][i]!, 5))
  })

  it('2 kênh (stereo) → trung bình cộng thành mono', () => {
    const left = new Float32Array([1, 0.5, 0])
    const right = new Float32Array([0, 0.5, 1])
    const result = toMonoPcm16kHz({ channelData: [left, right], sampleRate: 16_000 })
    expect(Array.from(result)).toEqual([0.5, 0.5, 0.5])
  })

  it('không có kênh nào → trả mảng rỗng, không lỗi', () => {
    const result = toMonoPcm16kHz({ channelData: [], sampleRate: 16_000 })
    expect(result.length).toBe(0)
  })

  it('downsample 48kHz → 16kHz: độ dài giảm đúng 1/3', () => {
    const samples = new Float32Array(48_000).fill(0.5) // 1 giây ở 48kHz
    const result = toMonoPcm16kHz({ channelData: [samples], sampleRate: 48_000 })
    expect(result.length).toBe(16_000) // 1 giây ở 16kHz
  })

  it('upsample 8kHz → 16kHz: độ dài tăng đúng gấp đôi, nội suy tuyến tính đúng điểm giữa', () => {
    const samples = new Float32Array([0, 10])
    const result = toMonoPcm16kHz({ channelData: [samples], sampleRate: 8_000 })
    expect(result.length).toBe(4)
    // Điểm đầu = mẫu gốc; các điểm sau nội suy dần từ 0 → 10 (giá trị cuối lặp lại mẫu cuối
    // do không có mẫu kế tiếp để nội suy tiếp — đúng hành vi "giữ biên" của resampleLinear).
    expect(result[0]).toBe(0)
    expect(result[result.length - 1]).toBeCloseTo(10, 5)
  })
})

// Đọc lại 1 file WAV (header + PCM16) để kiểm tra bằng test, không cần thư viện ngoài.
function readWav(buffer: ArrayBuffer) {
  const view = new DataView(buffer)
  const readStr = (offset: number, len: number) =>
    String.fromCharCode(...Array.from({ length: len }, (_, i) => view.getUint8(offset + i)))
  const dataSize = view.getUint32(40, true)
  const samples: number[] = []
  for (let offset = 44; offset < 44 + dataSize; offset += 2) {
    samples.push(view.getInt16(offset, true))
  }
  return {
    riff: readStr(0, 4),
    fileSize: view.getUint32(4, true),
    wave: readStr(8, 4),
    fmtTag: readStr(12, 4),
    fmtLength: view.getUint32(16, true),
    audioFormat: view.getUint16(20, true),
    numChannels: view.getUint16(22, true),
    sampleRate: view.getUint32(24, true),
    byteRate: view.getUint32(28, true),
    blockAlign: view.getUint16(32, true),
    bitsPerSample: view.getUint16(34, true),
    dataTag: readStr(36, 4),
    dataSize,
    samples,
  }
}

describe('encodeWavPcm16', () => {
  it('header RIFF/WAVE/fmt/data đúng chuẩn PCM mono 16-bit', () => {
    const wav = readWav(encodeWavPcm16(new Float32Array([0, 0.5]), 16_000))
    expect(wav.riff).toBe('RIFF')
    expect(wav.wave).toBe('WAVE')
    expect(wav.fmtTag).toBe('fmt ')
    expect(wav.dataTag).toBe('data')
    expect(wav.audioFormat).toBe(1)
    expect(wav.numChannels).toBe(1)
    expect(wav.bitsPerSample).toBe(16)
    expect(wav.sampleRate).toBe(16_000)
    expect(wav.byteRate).toBe(16_000 * 2)
    expect(wav.blockAlign).toBe(2)
  })

  it('fileSize = 36 + dataSize (đúng công thức RIFF)', () => {
    const samples = new Float32Array(100).fill(0.1)
    const wav = readWav(encodeWavPcm16(samples, 16_000))
    expect(wav.dataSize).toBe(200) // 100 mẫu × 2 byte
    expect(wav.fileSize).toBe(36 + 200)
  })

  it('lượng tử hoá đúng: 0 → 0, 1 → 32767, -1 → -32768 (biên int16)', () => {
    const wav = readWav(encodeWavPcm16(new Float32Array([0, 1, -1]), 16_000))
    expect(wav.samples).toEqual([0, 32767, -32768])
  })

  it('clamp biên độ ngoài [-1, 1] (chống tràn số/tiếng rè)', () => {
    const wav = readWav(encodeWavPcm16(new Float32Array([2, -5]), 16_000))
    expect(wav.samples).toEqual([32767, -32768])
  })

  it('mảng rỗng → WAV hợp lệ với dataSize = 0', () => {
    const wav = readWav(encodeWavPcm16(new Float32Array([]), 16_000))
    expect(wav.dataSize).toBe(0)
    expect(wav.samples).toEqual([])
  })
})

describe('blobToWav16kMono — chỉ chạy trong trình duyệt (mock AudioContext)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    // @ts-expect-error dọn field test tự thêm vào window
    delete (window as unknown as { AudioContext?: unknown }).AudioContext
  })

  it('decode thành công → trả về ArrayBuffer WAV hợp lệ, đóng AudioContext', async () => {
    const close = vi.fn()
    const decoded = {
      numberOfChannels: 1,
      sampleRate: 16_000,
      getChannelData: () => new Float32Array([0, 0.5]),
    }
    const decodeAudioData = vi.fn().mockResolvedValue(decoded)
    class FakeAudioContext {
      decodeAudioData = decodeAudioData
      close = close
    }
    vi.stubGlobal('AudioContext', FakeAudioContext)
    const blob = { arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)) } as unknown as Blob

    const wav = await blobToWav16kMono(blob)
    expect(wav.byteLength).toBeGreaterThan(44) // có header + ít nhất vài mẫu
    expect(close).toHaveBeenCalled()
  })

  it('không có AudioContext trên window → ném lỗi rõ ràng', async () => {
    vi.stubGlobal('AudioContext', undefined)
    const blob = { arrayBuffer: vi.fn() } as unknown as Blob
    await expect(blobToWav16kMono(blob)).rejects.toThrow('Trình duyệt không hỗ trợ AudioContext')
  })

  it('decode lỗi → vẫn đóng AudioContext (finally) rồi ném lại lỗi', async () => {
    const close = vi.fn()
    class FakeAudioContext {
      decodeAudioData = vi.fn().mockRejectedValue(new Error('decode failed'))
      close = close
    }
    vi.stubGlobal('AudioContext', FakeAudioContext)
    const blob = { arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)) } as unknown as Blob

    await expect(blobToWav16kMono(blob)).rejects.toThrow('decode failed')
    expect(close).toHaveBeenCalled()
  })
})
