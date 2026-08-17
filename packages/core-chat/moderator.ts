// packages/core-chat/moderator.ts — Content moderation engine cho user chat.
//
// Quy trình:
//   1. So khớp pattern TRỰC TIẾP trên text gốc (với dấu tiếng Việt) → phát hiện từ rõ ràng
//   2. Normalize text (bỏ dấu, leetspeak, ký tự lặp) rồi so khớp lại → phát hiện biến thể
//   3. Trả ModerationResult với severity tổng hợp và text đã filter
//
// Quyết định theo severity:
//   none   → Gửi bình thường
//   low    → Filter *** và gửi
//   medium → Filter *** và gửi + log
//   high   → Block hoàn toàn (is_blocked = true)

import type { ModerationSeverity } from '../core-contracts/chat.js'
import { VI_WORDS, VI_ABBREVIATIONS } from './wordlist-vi.js'
import { EN_WORDS, LEET_MAP } from './wordlist-en.js'

export interface ModerationResult {
  /** Text đã được filter (bad words → ***). Bằng input nếu severity = 'none'. */
  clean: string
  /** Mức độ vi phạm tổng hợp. */
  severity: ModerationSeverity
  /** Các từ vi phạm đã tìm thấy (dạng gốc trong wordlist). */
  matches: string[]
  /** true nếu message cần bị chặn hoàn toàn (severity = 'high'). */
  blocked: boolean
}

// ── Normalize helpers ────────────────────────────────────────────────────────

/** Bảng chuyển đổi dấu tiếng Việt → không dấu (để so khớp normalized). */
const VI_DIACRITICS: Record<string, string> = {
  à: 'a',
  á: 'a',
  ả: 'a',
  ã: 'a',
  ạ: 'a',
  ă: 'a',
  ắ: 'a',
  ặ: 'a',
  ằ: 'a',
  ẳ: 'a',
  ẵ: 'a',
  â: 'a',
  ấ: 'a',
  ầ: 'a',
  ẩ: 'a',
  ẫ: 'a',
  ậ: 'a',
  è: 'e',
  é: 'e',
  ẻ: 'e',
  ẽ: 'e',
  ẹ: 'e',
  ê: 'e',
  ế: 'e',
  ề: 'e',
  ể: 'e',
  ễ: 'e',
  ệ: 'e',
  ì: 'i',
  í: 'i',
  ỉ: 'i',
  ĩ: 'i',
  ị: 'i',
  ò: 'o',
  ó: 'o',
  ỏ: 'o',
  õ: 'o',
  ọ: 'o',
  ô: 'o',
  ố: 'o',
  ồ: 'o',
  ổ: 'o',
  ỗ: 'o',
  ộ: 'o',
  ơ: 'o',
  ớ: 'o',
  ờ: 'o',
  ở: 'o',
  ỡ: 'o',
  ợ: 'o',
  ù: 'u',
  ú: 'u',
  ủ: 'u',
  ũ: 'u',
  ụ: 'u',
  ư: 'u',
  ứ: 'u',
  ừ: 'u',
  ử: 'u',
  ữ: 'u',
  ự: 'u',
  ỳ: 'y',
  ý: 'y',
  ỷ: 'y',
  ỹ: 'y',
  ỵ: 'y',
  đ: 'd',
  // Uppercase (normalize to lowercase first anyway)
  À: 'a',
  Á: 'a',
  Ả: 'a',
  Ã: 'a',
  Ạ: 'a',
  Ă: 'a',
  Ắ: 'a',
  Ặ: 'a',
  Ằ: 'a',
  Ẳ: 'a',
  Ẵ: 'a',
  Â: 'a',
  Ấ: 'a',
  Ầ: 'a',
  Ẩ: 'a',
  Ẫ: 'a',
  Ậ: 'a',
  È: 'e',
  É: 'e',
  Ẻ: 'e',
  Ẽ: 'e',
  Ẹ: 'e',
  Ê: 'e',
  Ế: 'e',
  Ề: 'e',
  Ể: 'e',
  Ễ: 'e',
  Ệ: 'e',
  Ì: 'i',
  Í: 'i',
  Ỉ: 'i',
  Ĩ: 'i',
  Ị: 'i',
  Ò: 'o',
  Ó: 'o',
  Ỏ: 'o',
  Õ: 'o',
  Ọ: 'o',
  Ô: 'o',
  Ố: 'o',
  Ồ: 'o',
  Ổ: 'o',
  Ỗ: 'o',
  Ộ: 'o',
  Ơ: 'o',
  Ớ: 'o',
  Ờ: 'o',
  Ở: 'o',
  Ỡ: 'o',
  Ợ: 'o',
  Ù: 'u',
  Ú: 'u',
  Ủ: 'u',
  Ũ: 'u',
  Ụ: 'u',
  Ư: 'u',
  Ứ: 'u',
  Ừ: 'u',
  Ử: 'u',
  Ữ: 'u',
  Ự: 'u',
  Ỳ: 'y',
  Ý: 'y',
  Ỷ: 'y',
  Ỹ: 'y',
  Ỵ: 'y',
  Đ: 'd',
}

/**
 * Normalize text để so khớp bad words:
 *  - lowercase
 *  - bỏ dấu tiếng Việt
 *  - xử lý leetspeak (@ → a, 3 → e, v.v.)
 *  - bỏ ký tự chẻn giữa 2 chữ cái (f*ck → fck, f.u.c.k → fuck)
 *  - bỏ ký tự lặp liên tiếp → giữ 1 (fuuuck → fuk)
 */
export function normalizeText(text: string): string {
  let result = text.toLowerCase()

  // Bỏ dấu tiếng Việt
  // eslint-disable-next-line no-control-regex
  result = result.replace(/[^\u0000-\u007F]/g, (ch) => VI_DIACRITICS[ch] ?? ch)

  // Xử lý leetspeak
  result = result.replace(/[@310$7+!|]/g, (ch) => LEET_MAP[ch] ?? ch)

  // Bỏ dấu phân cách giữa các chữ cái (f*ck, f.u.c.k, f-u-c-k)
  // Chỉ bỏ khi ký tự đặc biệt nằm ở giữa 2 ký tự chữ
  result = result.replace(/([a-z])[.\-_*]{1,3}(?=[a-z])/g, '$1')

  // Bỏ ký tự lặp liên tiếp → giữ lại 1 ký tự (fuuuck → fuk, shiiit → shit)
  result = result.replace(/(.)\1+/g, '$1')

  return result
}

// ── Tạo regex so khớp từ ─────────────────────────────────────────────────────

/**
 * Tạo regex cho một bad word (dạng đã normalize, để so sánh với normalized text).
 * Dùng word-boundary (\b) cho từ tiếng Anh thuần, substring cho tiếng Việt/hỗn hợp.
 */
function makeNormalizedWordRegex(normalizedWord: string): RegExp {
  const escaped = normalizedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  if (/^[a-z ]+$/.test(normalizedWord)) {
    return new RegExp(`\\b${escaped}\\b`, 'gi')
  }
  return new RegExp(escaped, 'gi')
}

/**
 * Tạo regex cho word gốc (bao gồm dấu tiếng Việt) để mask trong text gốc.
 */
function makeOriginalWordRegex(word: string): RegExp {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  if (/^[a-z ]+$/.test(word.toLowerCase())) {
    return new RegExp(`\\b${escaped}\\b`, 'gi')
  }
  return new RegExp(escaped, 'gi')
}

// ── Pre-compile tất cả patterns ──────────────────────────────────────────────

type SeverityLevel = 'high' | 'medium' | 'low'

interface CompiledPattern {
  word: string // Word gốc (từ wordlist)
  normalizedWord: string // Word đã normalize
  regexOnNormalized: RegExp // Regex để detect trên normalized text
  regexOnOriginal: RegExp // Regex để mask trên original text
  severity: SeverityLevel
}

function compilePatterns(): CompiledPattern[] {
  const patterns: CompiledPattern[] = []
  const allWordlists: [Record<SeverityLevel, string[]>, SeverityLevel[]][] = [
    [VI_WORDS, ['high', 'medium', 'low']],
    [EN_WORDS, ['high', 'medium', 'low']],
  ]

  for (const [wordlist, levels] of allWordlists) {
    for (const level of levels) {
      for (const word of wordlist[level]) {
        const normalizedWord = normalizeText(word)
        patterns.push({
          word,
          normalizedWord,
          regexOnNormalized: makeNormalizedWordRegex(normalizedWord),
          regexOnOriginal: makeOriginalWordRegex(word),
          severity: level,
        })
      }
    }
  }

  // Thêm viết tắt tiếng Việt (kiểm tra trên cả normalized lẫn gốc)
  for (const [abbr, severity] of Object.entries(VI_ABBREVIATIONS)) {
    const abbr_lower = abbr.toLowerCase()
    patterns.push({
      word: abbr,
      normalizedWord: abbr_lower,
      regexOnNormalized: new RegExp(
        `(?:^|(?<=[\\s,!?.])|(?<=^))${abbr_lower}(?=$|[\\s,!?.])`,
        'gi',
      ),
      regexOnOriginal: new RegExp(
        `(?:^|(?<=[\\s,!?.])|(?<=^))${abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[\\s,!?.])`,
        'gi',
      ),
      severity,
    })
  }

  return patterns
}

const COMPILED_PATTERNS = compilePatterns()

// ── Mask function ────────────────────────────────────────────────────────────

/** Thay bad word bằng *** (giữ ký tự đầu nếu từ dài > 2). */
function maskWord(original: string): string {
  if (original.length <= 2) return '***'
  return original[0] + '*'.repeat(original.length - 1)
}

// ── Main export ──────────────────────────────────────────────────────────────

function severityOrder(s: SeverityLevel): number {
  return { low: 1, medium: 2, high: 3 }[s]
}

/**
 * Kiểm tra và lọc nội dung không văn minh.
 * @param text - Text gốc từ người dùng
 * @returns ModerationResult
 */
export function moderateContent(text: string): ModerationResult {
  if (!text) return { clean: text, severity: 'none', matches: [], blocked: false }

  const normalized = normalizeText(text)
  const matchedWords: string[] = []
  let maxSeverity: SeverityLevel | null = null

  // Pass 1: detect trên normalized text (bắt biến thể leetspeak, ký tự lặp, bỏ dấu)
  for (const pattern of COMPILED_PATTERNS) {
    // Reset lastIndex trước khi test (RegExp với flag g giữ state)
    pattern.regexOnNormalized.lastIndex = 0
    if (pattern.regexOnNormalized.test(normalized)) {
      matchedWords.push(pattern.word)
      if (maxSeverity === null || severityOrder(pattern.severity) > severityOrder(maxSeverity)) {
        maxSeverity = pattern.severity
      }
    }
    // Short-circuit
    if (maxSeverity === 'high') break
  }

  if (maxSeverity === null) {
    return { clean: text, severity: 'none', matches: [], blocked: false }
  }

  const blocked = maxSeverity === 'high'

  // Pass 2: mask trong text gốc
  let clean = text
  for (const pattern of COMPILED_PATTERNS) {
    if (matchedWords.includes(pattern.word)) {
      // Thử mask trên original text trước
      pattern.regexOnOriginal.lastIndex = 0
      const maskedOriginal = clean.replace(pattern.regexOnOriginal, (match) => maskWord(match))
      if (maskedOriginal !== clean) {
        clean = maskedOriginal
      } else {
        // Fallback: mask trên normalized nếu original không match
        // (trường hợp obfuscation như f*ck)
        // Trong trường hợp này, normalize text output (đã xử lý obfuscation)
        clean = normalized.replace(pattern.regexOnNormalized, (match) => maskWord(match))
      }
    }
  }

  return {
    clean: blocked ? '' : clean,
    severity: maxSeverity,
    matches: [...new Set(matchedWords)], // deduplicate
    blocked,
  }
}

/**
 * Kiểm tra xem result có severity = 'high'.
 */
export function isHighSeverity(result: ModerationResult): boolean {
  return result.severity === 'high'
}

export function needsFilter(result: ModerationResult): boolean {
  return result.severity !== 'none' && !result.blocked
}
