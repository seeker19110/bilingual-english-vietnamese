// src/lib/wordForms.ts — Sinh các DẠNG BIẾN THỂ của một từ (word forms) theo quy tắc
// chính tả tiếng Anh + tra bảng bất quy tắc. Dùng bởi scripts/gen-word-forms.ts để
// điền trường `forms` cho từ điển, và có thể dùng lại ở nơi khác nếu cần.
//
// Nguyên tắc SƯ PHẠM (xem docs/research/bo-sung-dang-bien-the-tu-dien.md):
//   - Tra bảng bất quy tắc TRƯỚC (go→went, child→children, good→better).
//   - Áp quá quy tắc chính tả cho phần còn lại (play→plays/playing/played).
//   - Thà THIẾU còn hơn SAI: ca không chắc (gấp đôi phụ âm đa âm tiết) chỉ làm khi
//     có trong bảng ngoại lệ; danh từ không đếm được KHÔNG bịa số nhiều.
//   - Chuẩn chính tả Anh-Mỹ (khớp phần còn lại của dự án: dùng "gotten", "traveling").

import type { WordForms } from '../types'
import {
  IRREGULAR_VERBS,
  IRREGULAR_PLURALS,
  IRREGULAR_COMPARATIVES,
  UNCOUNTABLE_NOUNS,
  NO_INFLECTION,
  PLURAL_ONLY_NOUNS,
  NO_PLURAL_NOUNS,
  F_TO_VES_SUFFIXES,
  MAN_SUFFIX_EXCEPTIONS,
} from '../data/irregularForms'

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u'])

function isVowel(ch: string): boolean {
  return VOWELS.has(ch)
}

// Đuôi cần thêm -es thay vì -s (số nhiều danh từ + ngôi 3 số ít động từ):
// s, ss, sh, ch, x, z. VD: bus→buses, watch→watches, box→boxes.
function needsEs(word: string): boolean {
  return /(s|ss|sh|ch|x|z)$/.test(word)
}

// Đếm số cụm nguyên âm ≈ số âm tiết (heuristic đủ dùng để nhận "1 âm tiết").
// VD: "run"→1, "happy"→2, "beautiful"→3. Không cần chính xác tuyệt đối, chỉ cần
// phân biệt 1 âm tiết với nhiều âm tiết cho quy tắc gấp đôi phụ âm / so sánh.
export function countSyllables(word: string): number {
  const w = word.toLowerCase()
  const groups = w.match(/[aeiouy]+/g)
  let n = groups ? groups.length : 0
  // Trừ 1 cho "e" câm cuối (nice, make → 1 âm tiết) nhưng KHÔNG trừ đuôi -ee (agree = 2).
  if (n > 1 && w.endsWith('e') && !w.endsWith('ee')) n -= 1
  return n
}

// Từ có kết thúc kiểu Phụ-âm–Nguyên-âm–Phụ-âm (CVC) và phụ âm cuối KHÔNG phải w/x/y?
// Đây là điều kiện gấp đôi phụ âm cuối (run→running, big→bigger). fix→fixing (x: không
// gấp), play→playing (y: không gấp) bị loại đúng.
function isCVC(word: string): boolean {
  if (word.length < 3) return false
  const a = word[word.length - 3]!
  const b = word[word.length - 2]!
  const c = word[word.length - 1]!
  return !isVowel(a) && isVowel(b) && !isVowel(c) && !['w', 'x', 'y'].includes(c)
}

// Động từ ĐA ÂM TIẾT có trọng âm ở âm tiết cuối → vẫn gấp đôi phụ âm (begin→beginning,
// prefer→preferred). Quy tắc trọng âm không suy được bằng chính tả nên liệt kê tay các
// từ thông dụng. Từ đa âm tiết KHÔNG trong danh sách này thì KHÔNG gấp đôi (Anh-Mỹ:
// open→opening, visit→visiting, travel→traveling).
const MULTISYLLABLE_DOUBLING = new Set<string>([
  'begin',
  'forget',
  'prefer',
  'refer',
  'occur',
  'permit',
  'admit',
  'commit',
  'submit',
  'transmit',
  'omit',
  'emit',
  'control',
  'patrol',
  'propel',
  'compel',
  'expel',
  'rebel',
  'regret',
  'equip',
  'kidnap',
  'format',
  'upset',
  'reset',
  'forbid',
  'occur',
  'incur',
  'deter',
  'infer',
  'prefer',
])

// Có gấp đôi phụ âm cuối khi thêm -ing/-ed không?
function shouldDoubleFinal(word: string): boolean {
  if (!isCVC(word)) return false
  const syl = countSyllables(word)
  if (syl <= 1) return true
  return MULTISYLLABLE_DOUBLING.has(word)
}

// ── Số nhiều danh từ (quy tắc) ────────────────────────────────────────────────
export function pluralize(word: string): string {
  const w = word.toLowerCase()
  if (IRREGULAR_PLURALS[w]) return IRREGULAR_PLURALS[w]!
  // Từ ghép đuôi -man/-woman → -men/-women (fireman→firemen), trừ ngoại lệ (human→humans).
  if (!MAN_SUFFIX_EXCEPTIONS.has(w)) {
    if (w.length > 5 && w.endsWith('woman')) return w.slice(0, -5) + 'women'
    if (w.length > 3 && w.endsWith('man')) return w.slice(0, -3) + 'men'
  }
  // Từ ghép đuôi -f/-fe an toàn → -ves (housewife→housewives, bookshelf→bookshelves).
  for (const suf of F_TO_VES_SUFFIXES) {
    if (w.length > suf.length && w.endsWith(suf)) {
      return w.slice(0, -suf.length) + suf.replace(/(fe|f)$/, 'ves')
    }
  }
  // phụ âm + y → ies (city→cities), nhưng nguyên âm + y → +s (boy→boys)
  if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ies'
  if (needsEs(w)) return w + 'es'
  return w + 's'
}

// ── Ngôi 3 số ít động từ (V-s) — cùng quy tắc với số nhiều ─────────────────────
export function thirdPerson(word: string): string {
  const w = word.toLowerCase()
  if (w === 'be') return 'is'
  if (w === 'have') return 'has'
  if (w === 'do') return 'does'
  if (w === 'go') return 'goes'
  if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ies'
  if (needsEs(w)) return w + 'es'
  return w + 's'
}

// ── Dạng V-ing ────────────────────────────────────────────────────────────────
export function gerund(word: string): string {
  const w = word.toLowerCase()
  if (w === 'be') return 'being'
  // -ie → -ying (die→dying, lie→lying, tie→tying)
  if (w.endsWith('ie')) return w.slice(0, -2) + 'ying'
  // giữ -ee/-oe/-ye (see→seeing, agree→agreeing, canoe→canoeing, dye→dyeing)
  if (/(ee|oe|ye)$/.test(w)) return w + 'ing'
  // bỏ e câm cuối (make→making, write→writing) — trừ trường hợp trên
  if (w.endsWith('e')) return w.slice(0, -1) + 'ing'
  if (shouldDoubleFinal(w)) return w + w[w.length - 1] + 'ing'
  return w + 'ing'
}

// ── Quá khứ có quy tắc (V-ed) — chỉ dùng khi KHÔNG có trong bảng bất quy tắc ────
export function pastRegular(word: string): string {
  const w = word.toLowerCase()
  if (w.endsWith('e')) return w + 'd' // like→liked
  if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ied' // try→tried (nguyên âm+y: play→played)
  if (shouldDoubleFinal(w)) return w + w[w.length - 1] + 'ed' // stop→stopped
  return w + 'ed'
}

// ── So sánh hơn / nhất cho tính từ (chỉ khi CÓ dạng -er/-est thật) ─────────────
// Trả null nếu tính từ dùng "more/most + adj" (đa âm tiết) — UI hiểu là không có dạng đuôi.
export function comparativeForms(
  word: string,
): { comparative: string; superlative: string } | null {
  const w = word.toLowerCase()
  const irr = IRREGULAR_COMPARATIVES[w]
  if (irr) return { comparative: irr[0], superlative: irr[1] }

  // Tính từ phân từ đuôi -ied (fried, dried) KHÔNG có dạng -er/-est ("frieder" sai) —
  // heuristic âm tiết đếm chúng là 1 âm tiết nên phải chặn riêng trước.
  if (w.endsWith('ied')) return null

  const syl = countSyllables(w)
  // 2 âm tiết kết thúc -y: happy→happier/happiest, easy→easier/easiest
  if (syl === 2 && /[^aeiou]y$/.test(w)) {
    const stem = w.slice(0, -1) + 'i'
    return { comparative: stem + 'er', superlative: stem + 'est' }
  }
  // Chỉ áp cho tính từ 1 âm tiết
  if (syl !== 1) return null

  if (w.endsWith('e')) return { comparative: w + 'r', superlative: w + 'st' } // nice→nicer
  if (/[^aeiou]y$/.test(w)) {
    const stem = w.slice(0, -1) + 'i' // dry→drier
    return { comparative: stem + 'er', superlative: stem + 'est' }
  }
  if (isCVC(w)) {
    const d = w + w[w.length - 1] // big→bigger
    return { comparative: d + 'er', superlative: d + 'est' }
  }
  return { comparative: w + 'er', superlative: w + 'est' }
}

// ── Tổng hợp: tính TẤT CẢ dạng biến thể cho 1 từ theo loại từ ──────────────────
// Trả undefined nếu từ này không có dạng nào đáng lưu (giới từ, liên từ, cụm nhiều
// từ, modal…). `word` phải là 1 từ đơn (không dấu cách).
export function computeForms(word: string, pos: string): WordForms | undefined {
  const w = word.toLowerCase().trim()
  // Bỏ qua cụm nhiều từ / có ký tự lạ (chỉ chấp nhận chữ cái, -, ')
  if (!/^[a-z][a-z'-]*$/.test(w)) return undefined

  if (pos === 'n') {
    if (UNCOUNTABLE_NOUNS.has(w)) return { uncountable: true }
    // Danh từ chỉ có số nhiều (jeans, scissors…) → không sinh dạng số nhiều nữa.
    if (PLURAL_ONLY_NOUNS.has(w)) return undefined
    // Danh từ riêng / ký hiệu (Jesus, GPS, Les…) → không chia, không hiện gì.
    if (NO_PLURAL_NOUNS.has(w)) return undefined
    const plural = pluralize(w)
    // Danh từ bất biến (sheep) hoặc bất quy tắc (children) → đánh dấu để UI hiện rõ.
    const irregular = !!IRREGULAR_PLURALS[w]
    return { plural, ...(irregular ? { irregular: true } : {}) }
  }

  if (pos === 'v') {
    if (NO_INFLECTION.has(w)) return undefined
    const v3s = thirdPerson(w)
    const ving = gerund(w)
    const irr = IRREGULAR_VERBS[w]
    let past: string
    let pastPart: string
    let irregular = false
    if (irr) {
      past = irr[0]
      pastPart = irr[1]
      irregular = true
    } else {
      past = pastRegular(w)
      pastPart = past
    }
    return {
      v3s,
      ving,
      past,
      // Chỉ lưu pastPart khi khác past (gone ≠ went); quy tắc thì trùng nên bỏ.
      ...(pastPart !== past ? { pastPart } : {}),
      ...(irregular ? { irregular: true } : {}),
    }
  }

  if (pos === 'adj') {
    const cmp = comparativeForms(w)
    if (!cmp) return undefined
    const irregular = !!IRREGULAR_COMPARATIVES[w]
    return {
      comparative: cmp.comparative,
      superlative: cmp.superlative,
      ...(irregular ? { irregular: true } : {}),
    }
  }

  if (pos === 'adv') {
    // Trạng từ: PHẦN LỚN dùng "more/most + adv" (strictly, quickly…). Chỉ sinh dạng
    // đuôi -er/-est cho các trạng từ BẤT QUY TẮC đã liệt kê tay (well→better, badly→worse).
    // Trạng từ "phẳng" (fast, hard) trùng tính từ nên đã có dạng ở entry tính từ.
    const irr = IRREGULAR_COMPARATIVES[w]
    if (!irr) return undefined
    return { comparative: irr[0], superlative: irr[1], irregular: true }
  }

  // prep, conj, pron, art, num, interj → không chia
  return undefined
}

// Thu thập mọi chuỗi dạng biến thể của 1 forms (để build index dạng→từ gốc ở search).
export function formValues(forms: WordForms): string[] {
  const out: string[] = []
  if (forms.plural) out.push(forms.plural)
  if (forms.v3s) out.push(forms.v3s)
  if (forms.ving) out.push(forms.ving)
  if (forms.past) out.push(forms.past)
  if (forms.pastPart) out.push(forms.pastPart)
  if (forms.comparative) out.push(forms.comparative)
  if (forms.superlative) out.push(forms.superlative)
  return out
}
