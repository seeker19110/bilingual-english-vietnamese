// api/_lib/googleTts.ts
// Gọi Google Cloud Text-to-Speech để tạo audio.
// CHỈ chạy ở server — không bao giờ import file này từ code phía browser (src/).
// Tiền tố "_" trong tên thư mục "_lib" để Vercel KHÔNG coi file này là 1 API route riêng.

import { fetchWithTimeout } from './fetchTimeout'
import { base64ToBytes } from './base64'

// Thời gian chờ tối đa 1 lần gọi Google TTS (ms) — tránh treo request khi Google chậm/sự cố.
const TTS_TIMEOUT_MS = 30_000

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

// ── Xoay vòng nhiều API key ──────────────────────────────────────────────────
// Mỗi API key Google Cloud TTS có hạn mức (quota) riêng theo project. Khi có nhiều
// project/key, ta gộp thành 1 "bể" key rồi:
//   1. Chia đều lượt gọi giữa các key (round-robin) — đỡ dồn hết vào 1 key.
//   2. Key nào báo hết quota (429) → TỰ ĐỘNG thử key kế tiếp trong cùng 1 lần gọi,
//      chỉ khi mọi key đều hết quota mới trả lỗi (client lúc đó mới fallback Web Speech).
// GOOGLE_TTS_API_KEYS: nhiều key cách nhau dấu phẩy hoặc xuống dòng.
// GOOGLE_TTS_API_KEY: 1 key (giữ tương thích ngược), tự gộp vào bể nếu chưa có.
function allConfiguredKeys(): string[] {
  const fromList = (process.env.GOOGLE_TTS_API_KEYS || '')
    .split(/[,\n]/)
    .map((k) => k.trim())
    .filter(Boolean)
  const single = process.env.GOOGLE_TTS_API_KEY?.trim()
  const pool = [...fromList]
  if (single && !pool.includes(single)) pool.push(single)
  return pool
}

// Bể key ĐANG DÙNG cho lần chạy hiện tại — mặc định = toàn bộ key cấu hình trong biến
// môi trường. Script seed hàng loạt có thể THU HẸP bể này qua setActiveKeyPool() sau khi
// probeApiKeys() xác định key nào còn dùng được, để không phí request vào key đã cạn quota.
// api/tts.ts (chạy thật trên server) KHÔNG gọi setActiveKeyPool() nên luôn dùng toàn bộ key.
let activePoolOverride: string[] | null = null

function getApiKeyPool(): string[] {
  return activePoolOverride ?? allConfiguredKeys()
}

// Giới hạn bể key đang xoay vòng (dùng ở script seed, sau khi probe). Truyền null để
// quay lại đọc toàn bộ từ biến môi trường như mặc định.
export function setActiveKeyPool(keys: string[] | null): void {
  activePoolOverride = keys
  nextKeyIndex = 0
  healthyPoolCache = null // đổi bể key gốc → cache "khỏe mạnh" cũ không còn đúng nữa
}

// Có cấu hình ít nhất 1 key hay chưa — dùng ở scripts/vite.config.ts để kiểm tra
// biến môi trường mà không cần biết chi tiết tên biến GOOGLE_TTS_API_KEY(S).
export function hasGoogleTtsKey(): boolean {
  return allConfiguredKeys().length > 0
}

// Con trỏ round-robin — sống trong bộ nhớ tiến trình Node (server.ts chạy liên tục
// trên VPS, không phải serverless "nguội" mỗi request) nên xoay vòng đúng qua nhiều lần gọi.
let nextKeyIndex = 0

// Lỗi coi là "do CHÍNH key này", nên thử key khác trong bể thay vì báo lỗi ngay:
//   429 / RESOURCE_EXHAUSTED / quota → hết hạn mức key này
//   403 kèm "billing"                → project của key này chưa bật thanh toán
// Lỗi khác (sai tham số, mạng lỗi, timeout...) không liên quan tới KEY cụ thể nào
// → thử key khác cũng lỗi y hệt, ném lỗi ngay cho nhanh (giữ nguyên hành vi cũ).
function isSkippableKeyError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  // [\s\S]* thay vì .* — JSON lỗi Google trả về có thể pretty-print (chứa xuống dòng thật)
  // giữa "(403)" và "billing", .* mặc định KHÔNG khớp qua dấu xuống dòng.
  return /\(429\)|RESOURCE_EXHAUSTED|quota/i.test(msg) || /\(403\)[\s\S]*billing/i.test(msg)
}

async function callGoogleTts(
  apiKey: string,
  text: string,
  voiceConfig: { name: string; ssmlGender: 'FEMALE' | 'MALE' },
  lang: Lang,
): Promise<ArrayBuffer> {
  // Tiếng Anh đọc chậm hơn 1 chút để học viên nghe rõ; tiếng Việt tốc độ bình thường
  const speakingRate = lang === 'en-US' ? 0.9 : 1.0

  const response = await fetchWithTimeout(
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
    TTS_TIMEOUT_MS,
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
  return base64ToBytes(data.audioContent).buffer as ArrayBuffer
}

// Thử 1 key bằng request TTS nhỏ nhất có thể (1 ký tự) — chỉ để biết key CÒN DÙNG ĐƯỢC
// hay không (còn quota + hợp lệ), không cần audio trả về.
async function probeKey(apiKey: string): Promise<boolean> {
  try {
    await callGoogleTts(apiKey, 'a', VOICE_MAP['en-US'][DEFAULT_VOICE], 'en-US')
    return true
  } catch {
    return false
  }
}

// Thử TOÀN BỘ key đã cấu hình (song song), trả về key nào còn dùng được lúc này.
// Dùng ở đầu các script seed hàng loạt: quota Google TTS có thể đã cạn từ lần chạy
// trước trong ngày, probe trước giúp KHÔNG phí hàng loạt request 429 vào key đã cạn.
export async function probeApiKeys(): Promise<{ working: string[]; total: string[] }> {
  const total = allConfiguredKeys()
  const results = await Promise.all(total.map((key) => probeKey(key)))
  return { working: total.filter((_, i) => results[i]), total }
}

// ── Bể key "khỏe mạnh" dùng khi chạy thật (api/tts.ts) ───────────────────────
// Khác probeApiKeys() (chỉ dùng tay ở script seed): hàm này TỰ ĐỘNG probe lại theo chu kỳ,
// cache kết quả trong bộ nhớ để KHÔNG probe lại ở mọi request (tốn thêm 1 lượt gọi Google mỗi
// key). Key hết quota/billing chưa bật sẽ bị LOẠI TẠM khỏi vòng xoay chính cho tới lần probe
// kế tiếp — tránh phí request đầu tiên của mỗi lượt gọi vào key đã biết là hỏng. Quota Google
// thường reset theo ngày và billing có thể được bật bất kỳ lúc nào → probe lại định kỳ để
// TỰ ĐỘNG đưa key trở lại khi đã dùng được, không cần restart server.
const HEALTHY_POOL_TTL_MS = 15 * 60_000 // 15 phút
let healthyPoolCache: { keys: string[]; checkedAt: number } | null = null

async function getHealthyKeyPool(): Promise<string[]> {
  const fullPool = getApiKeyPool()
  // 0-1 key: không có gì để loại trừ, probe chỉ tốn thêm 1 request vô ích.
  if (fullPool.length <= 1) return fullPool

  if (healthyPoolCache && Date.now() - healthyPoolCache.checkedAt < HEALTHY_POOL_TTL_MS) {
    return healthyPoolCache.keys
  }

  const results = await Promise.all(fullPool.map((key) => probeKey(key)))
  const healthy = fullPool.filter((_, i) => results[i])
  healthyPoolCache = { keys: healthy, checkedAt: Date.now() }
  console.log(`[googleTts] Kiểm tra bể key: ${healthy.length}/${fullPool.length} còn dùng được`)

  // TOÀN BỘ key đều fail (probe có thể sai — vd Google tạm lag) → vẫn thử cả bể gốc thay vì
  // chặn hẳn, để generateAudioFromGoogle tự báo lỗi thật qua đường gọi thật (không phải probe).
  return healthy.length > 0 ? healthy : fullPool
}

export async function generateAudioFromGoogle(
  text: string,
  voice: VoiceId = DEFAULT_VOICE,
  lang: Lang = 'en-US',
): Promise<ArrayBuffer> {
  const pool = await getHealthyKeyPool()
  if (pool.length === 0) {
    throw new Error('Server chưa cấu hình GOOGLE_TTS_API_KEY (hoặc GOOGLE_TTS_API_KEYS)')
  }

  const voiceConfig = VOICE_MAP[lang][voice]

  // Điểm bắt đầu xoay vòng — mỗi lần gọi hàm này tăng con trỏ lên 1, chia đều tải
  // giữa các key qua nhiều request khác nhau (không phải lúc nào cũng bắt đầu từ key #0).
  const startIndex = nextKeyIndex % pool.length
  nextKeyIndex = (nextKeyIndex + 1) % pool.length

  let lastError: unknown
  for (let attempt = 0; attempt < pool.length; attempt++) {
    const apiKey = pool[(startIndex + attempt) % pool.length]!
    try {
      return await callGoogleTts(apiKey, text, voiceConfig, lang)
    } catch (err) {
      lastError = err
      // Chỉ thử key khác khi lỗi DO CHÍNH KEY này (hết quota 429 / billing chưa bật 403) —
      // lỗi khác (sai tham số, mạng lỗi...) không liên quan tới key nên thử key khác cũng
      // lỗi y hệt, ném lỗi ngay cho nhanh.
      if (!isSkippableKeyError(err)) throw err
      if (pool.length > 1 && attempt < pool.length - 1) {
        console.warn('[googleTts] Key lỗi (quota/billing) — chuyển sang key kế tiếp trong bể')
      }
    }
  }

  throw lastError
}
