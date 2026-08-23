// src/lib/wav.ts — Chuyển audio ghi được (webm/opus từ MediaRecorder) sang WAV PCM 16kHz
// mono — định dạng BẮT BUỘC của Azure Pronunciation Assessment (① Giai đoạn 2, xem
// api/_lib/azurePronounce.ts). Tách phần TÍNH TOÁN THUẦN (downmix/resample/encode WAV) khỏi
// phần gọi Web Audio API (decode) để test được bằng dữ liệu giả, không cần trình duyệt thật.

const TARGET_SAMPLE_RATE = 16_000

// Dữ liệu audio ĐÃ GIẢI MÃ — cấu trúc tối thiểu khớp `AudioBuffer` (Web Audio API) nhưng
// khai riêng để test truyền được mảng thường, không cần dựng AudioBuffer thật trong Node.
export interface DecodedAudio {
  channelData: Float32Array[] // 1 mảng mẫu/kênh, cùng độ dài
  sampleRate: number
}

// Gộp nhiều kênh thành 1 (trung bình cộng) — mic thường chỉ có 1 kênh nhưng vài máy trả stereo.
function downmixToMono(channelData: Float32Array[]): Float32Array {
  if (channelData.length === 0) return new Float32Array(0)
  if (channelData.length === 1) return channelData[0]!
  const length = channelData[0]!.length
  const mono = new Float32Array(length)
  for (let i = 0; i < length; i++) {
    let sum = 0
    for (const ch of channelData) sum += ch[i] ?? 0
    mono[i] = sum / channelData.length
  }
  return mono
}

// Resample bằng nội suy tuyến tính (đủ tốt cho giọng nói, không cần bộ lọc chống alias phức
// tạp — Azure chỉ cần audio "đúng định dạng", không yêu cầu chất lượng audiophile).
function resampleLinear(samples: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return samples
  const ratio = fromRate / toRate
  const outLength = Math.round(samples.length / ratio)
  const out = new Float32Array(outLength)
  for (let i = 0; i < outLength; i++) {
    const srcPos = i * ratio
    const idx0 = Math.floor(srcPos)
    const idx1 = Math.min(idx0 + 1, samples.length - 1)
    const frac = srcPos - idx0
    const s0 = samples[idx0] ?? 0
    const s1 = samples[idx1] ?? 0
    out[i] = s0 + (s1 - s0) * frac
  }
  return out
}

// Downmix + resample về 16kHz mono — hàm THUẦN, test bằng mảng giả.
export function toMonoPcm16kHz(audio: DecodedAudio): Float32Array {
  const mono = downmixToMono(audio.channelData)
  return resampleLinear(mono, audio.sampleRate, TARGET_SAMPLE_RATE)
}

// Ép biên độ về [-1, 1] rồi lượng tử hoá 16-bit signed PCM (chống clip tràn số khi encode).
function floatTo16BitPcm(samples: Float32Array): Int16Array {
  const out = new Int16Array(samples.length)
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i] ?? 0))
    out[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff
  }
  return out
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
}

// Đóng gói PCM 16-bit mono thành file WAV hoàn chỉnh (header 44 byte chuẩn RIFF/PCM).
// Hàm THUẦN — test được bằng cách đọc lại header/mẫu từ ArrayBuffer trả về.
export function encodeWavPcm16(
  samples: Float32Array,
  sampleRate = TARGET_SAMPLE_RATE,
): ArrayBuffer {
  const pcm = floatTo16BitPcm(samples)
  const bytesPerSample = 2
  const blockAlign = bytesPerSample // mono
  const byteRate = sampleRate * blockAlign
  const dataSize = pcm.length * bytesPerSample
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // độ dài khối fmt
  view.setUint16(20, 1, true) // audio format = 1 (PCM)
  view.setUint16(22, 1, true) // số kênh = 1 (mono)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 16, true) // bits per sample
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  let offset = 44
  for (let i = 0; i < pcm.length; i++, offset += 2) view.setInt16(offset, pcm[i]!, true)

  return buffer
}

// Chuyển 1 Blob ghi âm (webm/opus, mp4, ...) → WAV PCM 16kHz mono, sẵn sàng gửi
// /api/pronounce-assess. CHỈ chạy được trong trình duyệt (cần AudioContext) — không test
// bằng vitest (jsdom không hỗ trợ decodeAudioData thật); phần tính toán đã tách ra
// toMonoPcm16kHz/encodeWavPcm16 ở trên để test riêng.
export async function blobToWav16kMono(blob: Blob): Promise<ArrayBuffer> {
  const AudioContextCtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextCtor) throw new Error('Trình duyệt không hỗ trợ AudioContext')

  const ctx = new AudioContextCtor()
  try {
    const arrayBuffer = await blob.arrayBuffer()
    const decoded = await ctx.decodeAudioData(arrayBuffer)
    const channelData: Float32Array[] = []
    for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
      channelData.push(decoded.getChannelData(ch))
    }
    const mono16k = toMonoPcm16kHz({ channelData, sampleRate: decoded.sampleRate })
    return encodeWavPcm16(mono16k, TARGET_SAMPLE_RATE)
  } finally {
    void ctx.close()
  }
}
