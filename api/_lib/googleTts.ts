// api/_lib/googleTts.ts
// Gọi Google Cloud Text-to-Speech để tạo audio (từ đơn HOẶC câu/đoạn) bằng giọng tự nhiên.
// CHỉ chạy ở server (được import bởi api/pronunciation.ts và api/tts.ts) — không bao giờ import
// file này từ code phía browser (thư mục src/), vì GOOGLE_TTS_API_KEY phải được giữ kín.
//
// Tiền tố "_" trong tên thư mục "_lib" để Vercel KHÔNG coi file này là 1 API route riêng
// (Vercel mặc định biến mọi file trong api/ thành 1 endpoint, trừ file/thư mục bắt đầu bằng "_").

// Hỗ trợ 2 giọng (theo giới tính). Dùng id thân thiện "female"/"male" thay vì để lộ tên
// giọng thật của Google ra ngoài (DB, URL, query param) — nếu sau này Google đổi/ngừng hỗ trợ
// tên giọng cũ, chỉ cần sửa 1 chỗ trong bảng VOICE_MAP này.
export type VoiceId = 'female' | 'male'

// Ngôn ngữ đọc: tiếng Anh (Mỹ) hoặc tiếng Việt. Endpoint cũ (pronunciation) mặc định en-US.
export type TtsLang = 'en-US' | 'vi-VN'

export const VOICE_IDS: VoiceId[] = ['female', 'male']
export const DEFAULT_VOICE: VoiceId = 'female'

export const TTS_LANGS: TtsLang[] = ['en-US', 'vi-VN']
export const DEFAULT_LANG: TtsLang = 'en-US'

export function isValidVoice(value: string): value is VoiceId {
  return VOICE_IDS.includes(value as VoiceId)
}

export function isValidLang(value: string): value is TtsLang {
  return TTS_LANGS.includes(value as TtsLang)
}

// Bảng giọng theo (ngôn ngữ → giới tính).
// - Tiếng Anh: giọng "Journey" là giọng hội thoại tự nhiên nhất của Google.
// - Tiếng Việt: giọng "Neural2" chất lượng cao, nghe tự nhiên hơn hẳn giọng trình duyệt.
const VOICE_MAP: Record<TtsLang, Record<VoiceId, { name: string; ssmlGender: 'FEMALE' | 'MALE' }>> = {
  'en-US': {
    female: { name: 'en-US-Journey-F', ssmlGender: 'FEMALE' },
    male: { name: 'en-US-Journey-D', ssmlGender: 'MALE' },
  },
  'vi-VN': {
    female: { name: 'vi-VN-Neural2-A', ssmlGender: 'FEMALE' },
    male: { name: 'vi-VN-Neural2-D', ssmlGender: 'MALE' },
  },
}

export async function generateAudioFromGoogle(
  text: string,
  voice: VoiceId = DEFAULT_VOICE,
  lang: TtsLang = DEFAULT_LANG,
): Promise<ArrayBuffer> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY
  if (!apiKey) {
    throw new Error('Server chưa cấu hình GOOGLE_TTS_API_KEY')
  }

  const voiceConfig = VOICE_MAP[lang][voice]

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: lang,
          name: voiceConfig.name, // Giọng tự nhiên nhất của Google cho ngôn ngữ này
          ssmlGender: voiceConfig.ssmlGender,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.9, // Đọc chậm hơn bình thường 1 chút để học viên nghe rõ
          pitch: 0,
        },
      }),
    },
  )

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Google TTS lỗi (${response.status}): ${detail.slice(0, 200)}`)
  }

  const data = (await response.json()) as { audioContent?: string }
  if (!data.audioContent) {
    throw new Error('Google TTS không trả về audio')
  }

  // Google trả base64 → decode thành dữ liệu nhị phân để upload lên Supabase Storage.
  const binary = atob(data.audioContent)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}
