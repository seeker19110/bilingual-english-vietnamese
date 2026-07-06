// scripts/gen-word-forms.ts — Sinh trường `forms` (dạng biến thể) cho từ điển.
//
// Đọc public/data/dictionary/chunk-*.json, với MỖI entry là TỪ GỐC thì tính các dạng
// biến thể (số nhiều / V-s / V-ing / quá khứ / so sánh…) bằng src/lib/wordForms.ts rồi
// ghi vào entry.forms. An toàn chạy lại (idempotent — tính lại từ đầu, ghi đè forms).
//
// AN TOÀN CHẤT LƯỢNG (xem docs/research/bo-sung-dang-bien-the-tu-dien.md):
//   - BỎ QUA entry vốn đã là DẠNG BIẾN THỂ (went, children…) — không gắn forms cho chúng,
//     nếu không sẽ sinh bậy ("childrens"). Nhận diện qua: nghĩa có "… của <từ gốc>", hoặc
//     word trùng một dạng bất quy tắc đã biết.
//   - KIỂM ĐỊNH CHÉO: đối chiếu dạng bất quy tắc script sinh ra với các entry biến thể có
//     sẵn (đã soạn tay) — lệch thì in cảnh báo (không tự ghi đè, để người rà).
//   - Chỉ ghi form là chuỗi chữ cái hợp lệ, không trùng chính từ gốc (trừ danh từ bất biến).
//
// Chạy: npm run gen:word-forms   (hoặc: tsx scripts/gen-word-forms.ts)

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { computeForms, formValues } from '../src/lib/wordForms.ts'
import {
  IRREGULAR_VERBS,
  IRREGULAR_PLURALS,
  IRREGULAR_COMPARATIVES,
} from '../src/data/irregularForms.ts'
import type { DictEntry } from '../src/types.ts'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DICT_DIR = process.env.DICT_DIR
  ? path.resolve(PROJECT_ROOT, process.env.DICT_DIR)
  : path.join(PROJECT_ROOT, 'public/data/dictionary')

// Mọi "bề mặt" dạng biến thể bất quy tắc đã biết (children, men, went, gone, better…).
// Entry có word trùng một trong số này thì KHÔNG phải từ gốc → bỏ qua tính forms.
function buildKnownVariantSurfaces(): Set<string> {
  const s = new Set<string>()
  // CHỈ thêm dạng biến thể KHÁC từ gốc. Nếu trùng (run→ran→run, sheep→sheep,
  // cut/hit/put/cost…), đó vẫn là chính từ gốc → không được coi là "bề mặt biến thể"
  // (nếu không sẽ bỏ qua tính forms cho các động từ/danh từ bất biến rất thông dụng).
  for (const [base, [past, pp]] of Object.entries(IRREGULAR_VERBS)) {
    if (past !== base) s.add(past)
    if (pp !== base) s.add(pp)
  }
  for (const [base, pl] of Object.entries(IRREGULAR_PLURALS)) {
    if (pl !== base) s.add(pl)
  }
  for (const [base, [c, sup]] of Object.entries(IRREGULAR_COMPARATIVES)) {
    if (c !== base) s.add(c)
    if (sup !== base) s.add(sup)
  }
  return s
}

// Entry này có phải là DẠNG BIẾN THỂ (không phải từ gốc)?
// LƯU Ý: KHÔNG dùng `\b` — ranh giới từ ASCII của JS không khớp chữ có dấu tiếng Việt
// ("quá khứ" kết thúc bằng "ứ") nên sẽ bỏ sót gần hết. Dùng khoảng trắng thường.
const VARIANT_VI_RE = /(quá khứ|phân từ|số nhiều|ngôi (thứ )?3|so sánh|dạng) .*của /i
function isVariantEntry(e: DictEntry, knownSurfaces: Set<string>): boolean {
  if (VARIANT_VI_RE.test(e.vi)) return true
  if (knownSurfaces.has(e.word.toLowerCase())) return true
  return false
}

// Danh từ này TỰ NÓ đã là số nhiều (ads, acts, amenities) hay danh từ số-nhiều-hình-thức
// (aerobics, mathematics)? → KHÔNG sinh dạng số nhiều (tránh "actses", "aerobicses").
// Cách nhận biết: (1) đuôi -ics (môn học/hoạt động, thường bất biến); (2) đuôi -s mà
// DẠNG SỐ ÍT của nó CÓ mặt trong từ điển như một danh từ (ad→ads, amenity→amenities).
function looksAlreadyPlural(word: string, allWords: Set<string>): boolean {
  const w = word.toLowerCase()
  if (!w.endsWith('s')) return false
  if (w.endsWith('ics') && w.length > 4) return true // aerobics, mathematics, physics…
  // Bỏ qua đuôi mà số ít vốn KẾT THÚC bằng s (bonus, atlas, virus, boss, access, crisis):
  // drop-s của chúng không phải từ có nghĩa nên không bị nhận nhầm là số nhiều. Guard này
  // tránh xử lý oan các danh từ số ít hợp lệ.
  if (/(ss|us|is|as|ous)$/.test(w)) return false
  // Sinh các ứng viên "số ít" rồi kiểm có trong từ điển (bất kể loại từ) không.
  const singulars: string[] = []
  if (w.endsWith('ies')) singulars.push(w.slice(0, -3) + 'y') // amenities→amenity
  if (w.endsWith('es')) singulars.push(w.slice(0, -2)) // boxes→box (đã lọc ss/us/is ở trên)
  singulars.push(w.slice(0, -1)) // ads→ad, acts→act, babes→babe
  return singulars.some((s) => s.length >= 2 && allWords.has(s))
}

function loadChunks(): { file: string; entries: DictEntry[] }[] {
  const files = fs
    .readdirSync(DICT_DIR)
    .filter((f) => /^chunk-\d+\.json$/.test(f))
    .sort()
  return files.map((file) => ({
    file,
    entries: JSON.parse(fs.readFileSync(path.join(DICT_DIR, file), 'utf8')) as DictEntry[],
  }))
}

function main(): void {
  const chunks = loadChunks()
  const all = chunks.flatMap((c) => c.entries)
  const knownSurfaces = buildKnownVariantSurfaces()

  // Index từ điển (word thường → entry) để kiểm định chéo.
  const byWord = new Map<string, DictEntry>()
  for (const e of all) byWord.set(e.word.toLowerCase(), e)
  // Tập TẤT CẢ từ (mọi loại) — để nhận diện danh từ đã ở dạng số nhiều (số ít của chúng
  // có thể được gắn loại từ khác, vd "act" là động từ nhưng "acts" là số nhiều danh từ).
  const allWords = new Set<string>(byWord.keys())

  let withForms = 0
  let irregularCount = 0
  let skippedVariant = 0
  const warnings: string[] = []

  for (const c of chunks) {
    for (const e of c.entries) {
      // Luôn tính lại từ đầu → xoá forms cũ trước (idempotent).
      delete e.forms

      if (isVariantEntry(e, knownSurfaces)) {
        skippedVariant++
        continue
      }
      // Danh từ vốn đã là số nhiều → không gắn dạng số nhiều (tránh chia đôi).
      if (e.pos === 'n' && looksAlreadyPlural(e.word, allWords)) {
        skippedVariant++
        continue
      }

      const forms = computeForms(e.word, e.pos)
      if (!forms) continue

      // Kiểm tra tính hợp lệ của mọi chuỗi form.
      const bad = formValues(forms).filter((v) => !/^[a-z][a-z'-]*$/.test(v))
      if (bad.length) {
        warnings.push(`⚠️  ${e.word} (${e.pos}): form không hợp lệ → ${bad.join(', ')}`)
        continue
      }

      e.forms = forms
      withForms++
      if (forms.irregular) irregularCount++
    }
  }

  // ── KIỂM ĐỊNH CHÉO: bảng bất quy tắc của script có khớp entry biến thể ĐÃ SOẠN TAY? ──
  // Mỗi entry biến thể ghi nghĩa dạng "… của <base>" (base là từ tiếng Anh). Trích base,
  // rồi xác nhận bảng bất quy tắc của script SINH ĐÚNG dạng biến thể đó. Lệch = bảng của
  // script thiếu/khác so với dữ liệu đã kiểm tay → in cảnh báo để rà.
  const BASE_RE = /\bcủa\s+"?([a-zA-Z][a-zA-Z'-]*)"?/
  let crossChecked = 0
  let crossMismatch = 0
  for (const e of all) {
    if (!VARIANT_VI_RE.test(e.vi)) continue
    const m = e.vi.match(BASE_RE)
    if (!m) continue
    const base = m[1]!.toLowerCase()
    const variant = e.word.toLowerCase()
    // Không tin e.pos (phân từ hay bị gắn 'adj'). Thử CẢ 'n', 'v', 'adj' cho từ gốc —
    // chỉ báo lệch khi KHÔNG loại từ nào sinh ra được dạng biến thể này.
    crossChecked++
    const matched = ['n', 'v', 'adj'].some((pos) => {
      const bf = computeForms(base, pos)
      return bf ? new Set(formValues(bf)).has(variant) : false
    })
    if (!matched) {
      crossMismatch++
      const bf = computeForms(base, 'v')
      warnings.push(
        `⚠️  Kiểm chéo: entry "${variant}" tự nhận là dạng của "${base}", nhưng bảng script sinh cho "${base}" không có "${variant}" → [${bf ? formValues(bf).join(', ') : 'rỗng'}]`,
      )
    }
  }

  // Ghi lại từng chunk.
  for (const c of chunks) {
    fs.writeFileSync(path.join(DICT_DIR, c.file), JSON.stringify(c.entries))
  }

  console.log('── Kết quả sinh word forms ──')
  console.log(`Tổng từ:              ${all.length}`)
  console.log(`Gắn forms:            ${withForms}`)
  console.log(`  trong đó bất quy tắc: ${irregularCount}`)
  console.log(`Bỏ qua (là biến thể): ${skippedVariant}`)
  console.log(`Kiểm chéo bất quy tắc: ${crossChecked} (lệch nhẹ: ${crossMismatch})`)
  if (warnings.length) {
    console.log(`\n── Cảnh báo (${warnings.length}) ──`)
    for (const w of warnings.slice(0, 40)) console.log(w)
    if (warnings.length > 40) console.log(`… và ${warnings.length - 40} cảnh báo nữa`)
  }
  console.log('\n✅ Đã ghi lại các chunk.')
}

main()
