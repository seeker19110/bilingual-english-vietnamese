// api/_lib/googleTts.ts
// Gọi Google Cloud Text-to-Speech để tạo audio.
// CHỈ chạy ở server — không bao giờ import file này từ code phía browser (src/).
// Tiền tố "_" trong tên thư mục "_lib" để Vercel KHÔNG coi file này là 1 API route riêng.

export type VoiceId = 'female' | 'female2' | 'male' | 'male2'
export type Lang = 'en-US' | 'vi-VN'

export const VOICE_IDS: VoiceId[] = ['female', 'female2', 'male', 'male2']
export const DEFAULT_VOICE: VoiceId = 'female'

// "Phiên bản giọng" — tăng số này MỖI KHI đổi giọng trong VOICE_MAP bên dưới.
// Khóa cache trong DB (api/tts.ts) có chứa giá trị này, nên đổi version sẽ làm
// các câu đã cache cũ KHÔNG còn khớp → tự động tạo lại (ghi đè) bằng giọng mới.
export const VOICE_VERSION = 'chirp3hd-v2'

export function isValidVoice(value: string): value is VoiceId {
  return VOICE_IDS.includes(value as VoiceId)
}

// Bảng giọng đọc: mỗi ngôn ngữ có 2 giọng nữ + 2 giọng nam riêng biệt.
// Dùng "Chirp 3: HD" — dòng giọng mới nhất & tự nhiên nhất của Google.
// female=Kore, female2=Aoede, male=Puck, male2=Charon — đều có sẵn cho cả en-US và vi-VN.
const VOICE_MAP: Record<Lang, Record<VoiceId, { name: string; ssmlGender: 'FEMALE' | 'MALE' }>> = {
  'en-US': {
    female: { name: 'en-US-Chirp3-HD-Kore', ssmlGender: 'FEMALE' },
    female2: { name: 'en-US-Chirp3-HD-Aoede', ssmlGender: 'FEMALE' },
    male: { name: 'en-US-Chirp3-HD-Puck', ssmlGender: 'MALE' },
    male2: { name: 'en-US-Chirp3-HD-Charon', ssmlGender: 'MALE' },
  },
  'vi-VN': {
    female: { name: 'vi-VN-Chirp3-HD-Kore', ssmlGender: 'FEMALE' },
    female2: { name: 'vi-VN-Chirp3-HD-Aoede', ssmlGender: 'FEMALE' },
    male: { name: 'vi-VN-Chirp3-HD-Puck', ssmlGender: 'MALE' },
    male2: { name: 'vi-VN-Chirp3-HD-Charon', ssmlGender: 'MALE' },
  },
}

export async function generateAudioFromGoogle(
  text: string,
  voice: VoiceId = DEFAULT_VOICE,
  lang: Lang = 'en-US',
): Promise<ArrayBuffer> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY
  if (!apiKey) {
    throw new Error('Server chưa cấu hình GOOGLE_TTS_API_KEY')
  }

  const voiceConfig = VOICE_MAP[lang][voice]
  // Tiếng Anh đọc chậm hơn 1 chút để học viên nghe rõ; tiếng Việt tốc độ bình thường
  const speakingRate = lang === 'en-US' ? 0.9 : 1.0

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: lang,
          name: voiceConfig.name,
          ssmlGender: voiceConfig.ssmlGender,
        },
        // Lưu ý: giọng Chirp 3 HD KHÔNG hỗ trợ tham số "pitch" (gửi vào sẽ lỗi),
        // nên ở đây chỉ đặt speakingRate. Chirp 3 HD cũng chỉ nhận text thường (không SSML).
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate,
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
  // Dùng atob() (Web API) thay vì Buffer (Node API) vì hàm này chạy trên Vercel Edge Runtime.
  const binary = atob(data.audioContent)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}
