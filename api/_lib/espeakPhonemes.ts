// api/_lib/espeakPhonemes.ts — Ước lượng viseme (hình miệng) CHÍNH XÁC HƠN bằng phoneme thật
// từ eSpeak-ng (chạy OFFLINE trên server, KHÔNG gọi API ngoài, không tốn tiền) thay vì đếm thô
// số nguyên âm trong chữ viết. Xem docs/research/dac-ta-avatar-ai-noi-chuyen-2026-07-28.md
// (hướng B) — Google TTS Chirp3-HD (giọng đang dùng, googleTts.ts) không hỗ trợ SSML nên không
// có timepoints thật; MBROLA (cho timing phoneme thật) cần cài thêm giọng riêng, nặng và không
// đáng cho VPS 1 vCPU của dự án — ở đây chỉ dùng eSpeak-ng để lấy DANH SÁCH phoneme (--ipa),
// vẫn phải chia đều theo thời lượng audio thật (như PoC cũ), nhưng HÌNH MIỆNG chọn đúng theo
// ngữ âm thay vì lặp vòng cố định.
//
// CHỈ chạy ở server (spawn tiến trình con) — không bao giờ import từ code phía browser (src/).

import { execFile } from 'node:child_process'

export type Viseme = 'PP' | 'FF' | 'AA' | 'OO' | 'REST'

const ESPEAK_TIMEOUT_MS = 5_000
const ESPEAK_BIN = process.env.ESPEAK_NG_BIN?.trim() || 'espeak-ng'

// eSpeak-ng chỉ có giọng theo mã ngôn ngữ riêng, không trùng hệt mã BCP-47 dùng ở Google TTS.
const ESPEAK_VOICE: Record<'en-US' | 'vi-VN', string> = {
  'en-US': 'en-us',
  'vi-VN': 'vi',
}

// Ký tự IPA mang tính "khép môi" (p/b/m) → hình miệng PP.
const BILABIAL = new Set(['p', 'b', 'm'])
// Ký tự IPA "răng chạm môi dưới" (f/v) → hình miệng FF.
const LABIODENTAL = new Set(['f', 'v'])
// Nguyên âm tròn môi (u/o và các biến thể) → hình miệng OO. Nguyên âm còn lại → AA (miệng mở).
const ROUNDED_VOWEL = /^[uoʊɔʉ]$/

function classifyChar(ch: string): 'bilabial' | 'labiodental' | 'rounded-vowel' | 'vowel' | null {
  if (BILABIAL.has(ch)) return 'bilabial'
  if (LABIODENTAL.has(ch)) return 'labiodental'
  const VOWELS = 'aeiouyɑɐɒæɛɜɪɔʊʌəɘɤɵʉ'
  if (!VOWELS.includes(ch)) return null
  return ROUNDED_VOWEL.test(ch) ? 'rounded-vowel' : 'vowel'
}

// Bỏ dấu nhấn (ˈ ˌ), dấu kéo dài (ː), dấu nối tie bar (từ --ipa=3), số thanh điệu tiếng Việt.
function stripMarks(token: string): string {
  return token.replace(/[ˈˌː‍‍0-9]/g, '')
}

// Parse 1 "từ" (1 token phoneme của eSpeak, có thể gồm nhiều âm tiết) thành dãy viseme:
// consonant môi đầu từ (nếu có) rồi tới từng nguyên âm theo thứ tự xuất hiện. Không tách được
// âm tiết chính xác 100% (không dùng MBROLA) — đây là ƯỚC LƯỢNG, đủ tốt hơn nhiều so với đếm
// nguyên âm trong CHỮ VIẾT (không phản ánh cách đọc thật, đặc biệt tiếng Anh).
export function tokenToVisemes(rawToken: string): Viseme[] {
  const token = stripMarks(rawToken)
  const visemes: Viseme[] = []
  let sawVowel = false

  for (const ch of token) {
    const kind = classifyChar(ch)
    if (kind === 'vowel' || kind === 'rounded-vowel') {
      visemes.push(kind === 'rounded-vowel' ? 'OO' : 'AA')
      sawVowel = true
    } else if (!sawVowel && kind === 'bilabial') {
      visemes.push('PP')
    } else if (!sawVowel && kind === 'labiodental') {
      visemes.push('FF')
    }
    // Phụ âm khác / phụ âm đứng SAU nguyên âm đầu tiên: bỏ qua, không tạo khung hình riêng
    // (giữ bộ viseme tối giản 5 hình theo phạm vi PoC).
  }

  return visemes.length > 0 ? visemes : ['AA']
}

// Trả về danh sách viseme cho TỪNG TỪ trong câu (theo đúng thứ tự `words` truyền vào) — mảng
// rỗng (không throw) nếu eSpeak-ng không cài hoặc lỗi, để nơi gọi tự fallback về cách ước lượng
// cũ (đếm nguyên âm chữ viết, xem src/lib/viseme.ts).
export async function wordVisemesFromEspeak(
  words: string[],
  lang: 'en-US' | 'vi-VN',
): Promise<Viseme[][] | null> {
  if (words.length === 0) return []

  const text = words.join(' ')
  const voice = ESPEAK_VOICE[lang]

  let stdout: string
  try {
    stdout = await new Promise<string>((resolve, reject) => {
      const child = execFile(
        ESPEAK_BIN,
        ['-v', voice, '-q', '--ipa'],
        { timeout: ESPEAK_TIMEOUT_MS },
        (err, out) => {
          if (err) reject(err)
          else resolve(out)
        },
      )
      child.stdin?.end(text)
    })
  } catch (err) {
    // Binary chưa cài (ENOENT) hoặc lỗi khác — không phải lỗi nghiêm trọng, chỉ log để biết,
    // nơi gọi tự fallback.
    console.warn('[espeakPhonemes] eSpeak-ng không dùng được, sẽ fallback:', err)
    return null
  }

  // eSpeak-ng xuống dòng ở dấu câu (,.?!) — gộp toàn bộ output rồi tách theo khoảng trắng để
  // lấy đúng số token = số từ đầu vào (mỗi từ trong `words` tương ứng đúng 1 token phoneme).
  const tokens = stdout.split(/\s+/).filter(Boolean)
  if (tokens.length !== words.length) {
    // Không khớp số lượng (hiếm — vd ký tự đặc biệt eSpeak gộp/tách khác) → không đủ tin cậy
    // để map 1-1 với từng từ, fallback cho an toàn thay vì gán sai từ.
    console.warn(
      `[espeakPhonemes] Số token phoneme (${tokens.length}) khác số từ (${words.length}) — fallback`,
    )
    return null
  }

  return tokens.map(tokenToVisemes)
}
