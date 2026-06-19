// api/_lib/googleTts.ts
// Gọi Google Cloud Text-to-Speech để tạo audio phát âm cho 1 từ tiếng Anh.
// CHỈ chạy ở server (được import bởi api/pronunciation.ts) — không bao giờ import
// file này từ code phía browser (thư mục src/), vì GOOGLE_TTS_API_KEY phải được giữ kín.
//
// Tiền tố "_" trong tên thư mục "_lib" để Vercel KHÔNG coi file này là 1 API route riêng
// (Vercel mặc định biến mọi file trong api/ thành 1 endpoint, trừ file/thư mục bắt đầu bằng "_").

// Hỗ trợ 2 giọng (theo giới tính). Dùng id thân thiện "female"/"male" thay vì để lộ tên
// giọng thật của Google (en-US-Journey-F/D) ra ngoài (DB, URL, query param) — nếu sau này
// Google đổi/ngừng hỗ trợ tên giọng cũ, chỉ cần sửa 1 chỗ trong bảng VOICE_MAP này.
export type VoiceId = 'female' | 'male'

export const VOICE_IDS: VoiceId[] = ['female', 'male']
export const DEFAULT_VOICE: VoiceId = 'female'

export function isValidVoice(value: string): value is VoiceId {
  return VOICE_IDS.includes(value as VoiceId)
}

const VOICE_MAP: Record<VoiceId, { name: string; ssmlGender: 'FEMALE' | 'MALE' }> = {
  female: { name: 'en-US-Journey-F', ssmlGender: 'FEMALE' },
  male: { name: 'en-US-Journey-D', ssmlGender: 'MALE' },
}

export async function generateAudioFromGoogle(
  word: string,
  voice: VoiceId = DEFAULT_VOICE,
): Promise<ArrayBuffer> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY
  if (!apiKey) {
    throw new Error('Server chưa cấu hình GOOGLE_TTS_API_KEY')
  }

  const voiceConfig = VOICE_MAP[voice]

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: word },
        voice: {
          languageCode: 'en-US',
          name: voiceConfig.name, // Giọng tự nhiên nhất của Google
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
  // Dùng atob() (Web API) thay vì Buffer (Node API) vì hàm này chạy trên Vercel Edge Runtime,
  // môi trường giống browser hơn là Node truyền thống — không có sẵn Buffer.
  const binary = atob(data.audioContent)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}
