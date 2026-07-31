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
//   - BỎ QUA cả entry là dạng biến thể QUY TẮC của từ khác trong từ điển (played, buying,
//     causes, gentlemen…) — dò bằng 2 lượt: lượt 1 tính forms của mọi từ gốc để lập chỉ mục
//     "dạng chia → từ gốc"; lượt 2 entry động từ/danh từ nào trùng chỉ mục thì coi là biến
//     thể → không sinh forms (tránh "playedded") và gắn `base` trỏ về từ gốc nếu chưa có.
//   - KIỂM ĐỊNH CHÉO: đối chiếu dạng bất quy tắc script sinh ra với các entry biến thể có
//     sẵn (đã soạn tay) — lệch thì in cảnh báo (không tự ghi đè, để người rà).
//   - Chỉ ghi form là chuỗi chữ cái hợp lệ, không trùng chính từ gốc (trừ danh từ bất biến).
//
// Chạy: npm run gen:word-forms   (hoặc: tsx scripts/gen-word-forms.ts)

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { computeForms, formValues } from '../apps/english/src/lib/wordForms.ts'
import {
  IRREGULAR_VERBS,
  IRREGULAR_PLURALS,
  IRREGULAR_COMPARATIVES,
} from '../apps/english/src/data/irregularForms.ts'
import type { DictEntry } from '../apps/english/src/types.ts'

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

// Các khoá của forms là DẠNG CHIA thật sự (không tính so sánh hơn/nhất của tính từ —
// "flatter" vừa là so sánh của "flat" vừa là động từ gốc "nịnh hót" hợp lệ).
const INFLECTION_KEYS = ['plural', 'v3s', 'ving', 'past', 'pastPart'] as const

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
  let regularVariant = 0
  let baseAdded = 0
  const warnings: string[] = []

  // ── LƯỢT 1: lập chỉ mục "dạng chia quy tắc → từ gốc" từ forms của MỌI từ gốc ──
  // inflectionOwners: mọi dạng chia (kể cả số nhiều) — dùng bắt động từ đã chia
  // (played, causes…). pluralOwners: RIÊNG dạng số nhiều — dùng bắt danh từ đã ở dạng
  // số nhiều mà các guard cũ bỏ sót (gentlemen ← gentleman, đuôi -men không có "s").
  // hypotheticalOwners: từ điển chỉ lưu 1 nghĩa/từ nên từ gốc có thể mang pos khác
  // ("display" là [n] nhưng "displayed" vẫn là động từ đã chia) → tính THÊM dạng chia
  // ĐỘNG TỪ GIẢ ĐỊNH cho mọi danh từ/tính từ gốc, để riêng và chỉ tra khi chỉ mục
  // thật không khớp (ưu tiên từ gốc là động từ thật: does ← do[v], không phải doe[n]).
  const inflectionOwners = new Map<string, string[]>()
  const pluralOwners = new Map<string, string>()
  const hypotheticalOwners = new Map<string, string[]>()
  for (const e of all) {
    if (isVariantEntry(e, knownSurfaces)) continue
    if (e.pos === 'n' && looksAlreadyPlural(e.word, allWords)) continue
    const owner = e.word.toLowerCase()
    const forms = computeForms(e.word, e.pos)
    if (forms) {
      for (const key of INFLECTION_KEYS) {
        const surface = forms[key]
        if (typeof surface !== 'string' || surface === owner) continue
        const owners = inflectionOwners.get(surface)
        if (owners) owners.push(owner)
        else inflectionOwners.set(surface, [owner])
        if (key === 'plural' && !pluralOwners.has(surface)) pluralOwners.set(surface, owner)
      }
    }
    if (e.pos === 'n' || e.pos === 'adj') {
      const vforms = computeForms(e.word, 'v')
      if (!vforms) continue
      for (const key of ['v3s', 'ving', 'past', 'pastPart'] as const) {
        const surface = vforms[key]
        if (typeof surface !== 'string' || surface === owner) continue
        const owners = hypotheticalOwners.get(surface)
        if (owners) owners.push(owner)
        else hypotheticalOwners.set(surface, [owner])
      }
    }
  }

  // Chọn 1 từ gốc từ danh sách owner (cảnh báo nếu nhiều ứng viên khác nhau).
  function pickOwner(w: string, owners: string[] | undefined): string | undefined {
    const list = owners?.filter((o) => o !== w)
    if (!list?.length) return undefined
    if (new Set(list).size > 1) {
      warnings.push(
        `⚠️  "${w}" là dạng chia của NHIỀU từ gốc (${list.join(', ')}) — lấy từ đầu tiên`,
      )
    }
    return list[0]
  }

  // Entry này có phải dạng biến thể QUY TẮC của một từ khác? Trả về từ gốc nếu phải.
  // Chỉ áp cho pos 'v' (mọi dạng chia) và pos 'n' (chỉ dạng số nhiều) — danh từ gerund
  // (building, meeting…) trùng V-ing của động từ nhưng là danh từ hợp lệ, KHÔNG bắt oan.
  function findRegularVariantBase(e: DictEntry): string | undefined {
    const w = e.word.toLowerCase()
    if (e.pos === 'v') {
      // Động từ bất quy tắc GỐC (feed, sing…) không bao giờ là dạng chia quy tắc của từ
      // khác — guard tránh bắt oan kiểu feed ← fee[n]+"d".
      if (IRREGULAR_VERBS[w]) return undefined
      return pickOwner(w, inflectionOwners.get(w)) ?? pickOwner(w, hypotheticalOwners.get(w))
    }
    if (e.pos === 'n') {
      const owner = pluralOwners.get(w)
      if (owner && owner !== w) return owner
    }
    return undefined
  }

  // ── LƯỢT 2: tính forms cho từng entry, bỏ qua mọi loại biến thể ──
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
      // Dạng biến thể QUY TẮC (played, buying, causes, gentlemen…) → không sinh forms,
      // gắn `base` trỏ về từ gốc (giữ nguyên base soạn tay nếu đã có).
      const variantBase = findRegularVariantBase(e)
      if (variantBase) {
        regularVariant++
        if (!e.base) {
          e.base = variantBase
          baseAdded++
        }
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
  console.log(
    `Bỏ qua (biến thể QUY TẮC của từ khác): ${regularVariant} (gắn base mới: ${baseAdded})`,
  )
  console.log(`Kiểm chéo bất quy tắc: ${crossChecked} (lệch nhẹ: ${crossMismatch})`)
  if (warnings.length) {
    console.log(`\n── Cảnh báo (${warnings.length}) ──`)
    for (const w of warnings.slice(0, 40)) console.log(w)
    if (warnings.length > 40) console.log(`… và ${warnings.length - 40} cảnh báo nữa`)
  }
  console.log('\n✅ Đã ghi lại các chunk.')
}

main()
