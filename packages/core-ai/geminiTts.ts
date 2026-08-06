// packages/core-ai/geminiTts.ts
// Gọi Gemini API (native audio) để tạo giọng đọc TRUYỆN CỔ TÍCH/NGỤ NGÔN — khác hẳn Google
// Cloud Text-to-Speech (googleTts.ts, giọng Chirp3-HD) dù cùng thuộc Google: đây là model
// generateContent với responseModalities: ["AUDIO"], có thể điều khiển PHONG CÁCH ĐỌC bằng
// câu lệnh tự nhiên ngay trong prompt (vd "Say cheerfully: ..." → model đọc đúng phần sau
// dấu ":" với tông vui vẻ, KHÔNG đọc luôn câu lệnh — hành vi đã được Google tài liệu hoá).
// CHỈ chạy ở server — không bao giờ import file này từ code phía browser (apps/english/src).
//
// Dùng lại GEMINI_API_KEY đã có sẵn cho chat (api/_lib/geminiApi.ts) — không cần khoá riêng.
//
// Chỉ dùng cho trang đọc truyện (StoryReader.tsx): mỗi THỂ LOẠI truyện có đúng 1 giọng cố
// định kèm 1 câu chỉ dẫn phong cách cố định (xem GEMINI_STORY_VOICES) — không phải giọng
// chọn tự do như Chirp3-HD/ElevenLabs.

import { fetchWithTimeout } from '../../api/_lib/fetchTimeout.js'

const TTS_TIMEOUT_MS = 30_000

// Model TTS của Gemini — trả audio thô (PCM 16-bit, thường 24kHz mono), KHÔNG phải mp3.
// LƯU Ý: đây PHẢI là 1 trong 2 model TTS chuyên dụng của Google
// ('gemini-2.5-flash-preview-tts' hoặc 'gemini-2.5-pro-preview-tts') — các model chat thường
// (vd 'gemini-2.0-flash', dùng cho chat ở aiConfig.ts GEMINI_MODEL) KHÔNG hỗ trợ
// responseModalities: ["AUDIO"], gọi sẽ lỗi. Vì vậy dùng biến môi trường RIÊNG
// (GEMINI_TTS_MODEL), không dùng chung GEMINI_MODEL của chat.
const GEMINI_TTS_MODEL = process.env.GEMINI_TTS_MODEL?.trim() || 'gemini-2.5-flash-preview-tts'

// 6 giọng Gemini native audio, mỗi giọng gắn với đúng 1 thể loại truyện (giữ nguyên cách
// gán theo thể loại như Chirp3-HD ở STORY_KIND_VOICE, xem apps/english/src/lib/stories.ts).
// Tiền tố "Gemini-" để KHÔNG trùng với tên giọng Chirp3-HD (vd "Leda" đã là 1 VoiceId khác
// hẳn ở googleTts.ts — cùng tên nhân vật thần thoại Hy Lạp nhưng 2 engine hoàn toàn khác
// nhau, chất lượng/giọng đọc khác nhau).
export type GeminiVoiceId =
  | 'Gemini-Leda' // cổ tích (fairy-tale)
  | 'Gemini-Charon' // ngụ ngôn (fable)
  | 'Gemini-Aoede' // truyện dân gian Việt Nam (vn-folk)
  | 'Gemini-Orus' // thần thoại (myth)
  | 'Gemini-Puck' // hài hước (humor)
  | 'Gemini-Kore' // thiếu nhi (children)

export const GEMINI_VOICE_IDS: GeminiVoiceId[] = [
  'Gemini-Leda',
  'Gemini-Charon',
  'Gemini-Aoede',
  'Gemini-Orus',
  'Gemini-Puck',
  'Gemini-Kore',
]

export function isValidGeminiVoice(value: string): value is GeminiVoiceId {
  return (GEMINI_VOICE_IDS as string[]).includes(value)
}

// Tên giọng THẬT gửi cho Gemini (bỏ tiền tố "Gemini-") + câu chỉ dẫn phong cách đọc — ghép
// vào TRƯỚC văn bản mỗi câu khi gọi API. Ngoài phong cách chung theo thể loại, luôn dặn thêm
// model tự biến hoá cảm xúc/nhịp đọc THEO ĐÚNG NỘI DUNG của câu đó (đoạn thoại đọc như nhân
// vật đang nói, câu cao trào lên giọng...) — vì mỗi câu truyện đã tự mang sẵn ngữ cảnh
// (dấu ngoặc kép, dấu chấm than...), không cần truyền thêm cốt truyện từ ngoài vào.
const STYLE_SUFFIX =
  '; hãy để cảm xúc và nhịp đọc biến hoá theo đúng diễn biến của CÂU NÀY — hồi hộp ở đoạn ' +
  'gay cấn, ấm áp ở đoạn cảm động, dí dỏm ở đoạn hài hước; đoạn nào có lời nhân vật (trong ' +
  'dấu ngoặc kép) thì đọc như chính nhân vật đó đang nói, không đọc đều đều'

const GEMINI_STORY_VOICES: Record<GeminiVoiceId, { apiVoice: string; style: string }> = {
  'Gemini-Leda': {
    apiVoice: 'Leda',
    style:
      'Đọc đoạn sau bằng giọng kể chuyện cổ tích ấm áp, dịu dàng, chậm rãi, như đang kể cho trẻ nhỏ nghe trước giờ đi ngủ' +
      STYLE_SUFFIX,
  },
  'Gemini-Charon': {
    apiVoice: 'Charon',
    style:
      'Đọc đoạn sau bằng giọng kể ngụ ngôn chững chạc, từ tốn, hơi trầm ngâm, toát lên bài học đạo lý' +
      STYLE_SUFFIX,
  },
  'Gemini-Aoede': {
    apiVoice: 'Aoede',
    style:
      'Đọc đoạn sau bằng giọng kể chuyện dân gian Việt Nam mộc mạc, thân thương, có nhịp điệu như bà kể cháu nghe' +
      STYLE_SUFFIX,
  },
  'Gemini-Orus': {
    apiVoice: 'Orus',
    style:
      'Đọc đoạn sau bằng giọng kể thần thoại hùng tráng, uy nghiêm, có sức nặng, như đang thuật lại chiến công của các vị thần' +
      STYLE_SUFFIX,
  },
  'Gemini-Puck': {
    apiVoice: 'Puck',
    style:
      'Đọc đoạn sau bằng giọng kể chuyện hài hước, tinh nghịch, vui tươi, nhấn nhá gây cười' +
      STYLE_SUFFIX,
  },
  'Gemini-Kore': {
    apiVoice: 'Kore',
    style:
      'Đọc đoạn sau bằng giọng tươi vui, thân thiện, rõ ràng, dành cho thiếu nhi, tràn đầy khích lệ' +
      STYLE_SUFFIX,
  },
}

export function hasGeminiTtsKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim())
}

interface GeminiTtsResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: { mimeType?: string; data?: string }
      }>
    }
  }>
  error?: { message?: string }
}

// Gemini trả PCM thô (thường "audio/L16;codec=pcm;rate=24000") — trình duyệt không phát
// được PCM trần, phải tự đóng gói thành WAV (header 44 byte) trước khi mã hoá + lưu, giống
// mọi giọng khác trong app (đều là file phát được thẳng qua thẻ <audio>).
// Export riêng cho test (parseSampleRateForTest ở geminiTts.test.ts) — hàm nội bộ, nhánh
// mimeType undefined trong thực tế không tới được (part đã lọc qua startsWith('audio/') trước
// khi gọi hàm này), nhưng vẫn giữ an toàn kiểu vì field mimeType là optional trong response API.
export function parseSampleRate(mimeType: string | undefined): number {
  const match = /rate=(\d+)/.exec(mimeType ?? '')
  return match ? Number(match[1]) : 24000
}

function pcmToWav(
  pcm: Uint8Array,
  sampleRate: number,
  channels = 1,
  bitsPerSample = 16,
): ArrayBuffer {
  const blockAlign = (channels * bitsPerSample) / 8
  const byteRate = sampleRate * blockAlign
  const buffer = new ArrayBuffer(44 + pcm.byteLength)
  const view = new DataView(buffer)

  function writeString(offset: number, text: string): void {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i))
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + pcm.byteLength, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true) // kích thước sub-chunk fmt
  view.setUint16(20, 1, true) // PCM = 1
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)
  writeString(36, 'data')
  view.setUint32(40, pcm.byteLength, true)
  new Uint8Array(buffer, 44).set(pcm)

  return buffer
}

/** Tạo audio đọc truyện bằng Gemini TTS. Trả về file WAV (đã đóng gói header) dạng ArrayBuffer. */
export async function generateAudioFromGemini(
  text: string,
  voice: GeminiVoiceId,
): Promise<ArrayBuffer> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('Server chưa cấu hình GEMINI_API_KEY')
  }

  const { apiVoice, style } = GEMINI_STORY_VOICES[voice]
  const prompt = `${style}: "${text}"`

  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: apiVoice } },
          },
        },
      }),
    },
    TTS_TIMEOUT_MS,
  )

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Gemini TTS lỗi (${response.status}): ${detail.slice(0, 200)}`)
  }

  const payload = (await response.json()) as GeminiTtsResponse
  if (payload.error?.message) {
    throw new Error(`Gemini TTS lỗi: ${payload.error.message}`)
  }

  const part = payload.candidates?.[0]?.content?.parts?.find((p) =>
    p.inlineData?.mimeType?.startsWith('audio/'),
  )
  const base64 = part?.inlineData?.data
  if (!base64) {
    throw new Error('Gemini TTS lỗi: response thiếu dữ liệu âm thanh')
  }

  const pcm = Uint8Array.from(Buffer.from(base64, 'base64'))
  const sampleRate = parseSampleRate(part?.inlineData?.mimeType)
  return pcmToWav(pcm, sampleRate)
}
