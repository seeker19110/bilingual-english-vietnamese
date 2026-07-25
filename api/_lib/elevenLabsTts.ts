// api/_lib/elevenLabsTts.ts
// Gọi ElevenLabs Text-to-Speech để tạo giọng "VIP" đặc biệt (khác 14 giọng Chirp3-HD
// của Google ở googleTts.ts). CHỈ chạy ở server — không import từ code phía browser (src/).
//
// Cần biến môi trường ELEVENLABS_API_KEY (đăng ký tại elevenlabs.io). Chưa có key thì
// mọi request chọn giọng ElevenLabs sẽ lỗi rõ ràng — client (src/lib/tts.ts) tự fallback
// Web Speech API giống các lỗi TTS khác, không crash app.

import { fetchWithTimeout } from './fetchTimeout.js'

const TTS_TIMEOUT_MS = 30_000

// voice_id thật của ElevenLabs — giọng premade "Rachel" (nữ, tiếng Anh), gọi qua model
// eleven_multilingual_v2 nên đọc được cả tiếng Việt (chất lượng tiếng Việt chưa kiểm định
// kỹ, coi là thử nghiệm). Đổi id tại đây nếu muốn dùng giọng khác trong thư viện ElevenLabs.
const ELEVENLABS_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'
const ELEVENLABS_MODEL = 'eleven_multilingual_v2'

// Chỉ 1 giọng VIP thử nghiệm — mở rộng thêm sau khi đánh giá chất lượng/chi phí thật.
export type ElevenVoiceId = 'Rachel'
export const ELEVEN_VOICE_IDS: ElevenVoiceId[] = ['Rachel']

export function isValidElevenVoice(value: string): value is ElevenVoiceId {
  return (ELEVEN_VOICE_IDS as string[]).includes(value)
}

export function hasElevenLabsKey(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY?.trim())
}

export async function generateAudioFromElevenLabs(text: string): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('Server chưa cấu hình ELEVENLABS_API_KEY')
  }

  const response = await fetchWithTimeout(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL,
      }),
    },
    TTS_TIMEOUT_MS,
  )

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`ElevenLabs TTS lỗi (${response.status}): ${detail.slice(0, 200)}`)
  }

  return response.arrayBuffer()
}
