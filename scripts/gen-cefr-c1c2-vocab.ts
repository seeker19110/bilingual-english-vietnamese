// scripts/gen-cefr-c1c2-vocab.ts
// Sinh src/data/cefrC1C2Vocab.json — các VÒNG TỪ VỰNG cho 2 cấp CEFR C1 & C2,
// LẤY TỪ TỪ ĐIỂN ĐÃ GẮN NHÃN (public/data/dictionary/chunk-*.json, field `level`).
//
// Vì sao lấy từ từ điển: 2.357 từ C1/C2 trong từ điển đều ĐÃ CÓ nghĩa tiếng Việt +
// câu ví dụ song ngữ (ex_en/ex_vi) + phiên âm + tần suất — do đã gắn nhãn qua các
// wordlist CEFR chuẩn (Octanove/CEFR-J/Words-CEFR-Dataset, xem data/cefrj + PROGRESS).
// Nhờ đó cấp C1/C2 dùng ĐÚNG từ vựng chuẩn CEFR mà không phải gõ tay lại.
//
// GOM THEO CHỦ ĐỀ: mỗi từ được phân vào 1 CHỦ ĐỀ dựa trên NGHĨA TIẾNG VIỆT (khớp
// từ khóa). Từ không khớp chủ đề nào → gom theo LOẠI TỪ (danh/động/tính-trạng từ).
// Trong mỗi nhóm, sắp theo TẦN SUẤT (thông dụng học trước) rồi cắt thành vòng
// WORDS_PER_CIRCLE từ. Mỗi nhóm (chủ đề/loại từ) thành 1 "Phần" (unit) của cấp.
//
// Idempotent: khi đọc key từ vựng nền tảng, BỎ QUA chính các vòng do script này
// sinh (id bắt đầu "cefr-c1-"/"cefr-c2-") → chạy lại nhiều lần cho kết quả như nhau.
//
// Chạy: npx tsx scripts/gen-cefr-c1c2-vocab.ts   (an toàn để chạy lại — ghi đè)

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DictEntry } from '../src/types.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DICT_DIR = path.join(ROOT, 'public/data/dictionary')
const CURRICULUM_JSON = path.join(ROOT, 'public/data/curriculum.json')
const OUT = path.join(ROOT, 'src/data/cefrC1C2Vocab.json')

const WORDS_PER_CIRCLE = 16
// Trần số vòng mỗi "Phần" (unit): nhóm lớn (vd danh từ nâng cao) cắt thành nhiều
// Phần nhỏ để trang cấp không có unit khổng lồ, dễ học/dễ theo dõi tiến độ.
const MAX_CIRCLES_PER_UNIT = 5
// Lọc nhiễu: vài từ RẤT thông dụng bị nguồn nội suy gắn nhầm nhãn C1/C2 (vd dạng
// biến thể "trying", "standing" hay modal "cannot"). Từ có hạng tần suất < ngưỡng
// này (tức nằm trong nhóm thông dụng nhất) KHÔNG thể là C1/C2 → loại. Từ THIẾU freq
// (hiếm tới mức không có hạng) vẫn giữ. Chỉ bỏ ~9 từ, phần còn lại đúng nâng cao.
const MIN_FREQ_RANK = 2000

const wordKey = (s: string) => s.trim().toLowerCase()

// ── Danh mục CHỦ ĐỀ (khớp NGHĨA TIẾNG VIỆT) ───────────────────────────────
// Ưu tiên theo thứ tự: chủ đề đầu tiên có từ khóa xuất hiện trong nghĩa sẽ thắng.
// Từ khóa chọn ĐỦ ĐẶC TRƯNG để hạn chế khớp nhầm (vd "tiền tệ" thay vì bare "tiền").
interface Topic {
  key: string
  emoji: string
  titleVi: string
  titleEn: string
  kw: string[] // khớp trong NGHĨA tiếng Việt
  enkw?: string[] // khớp trong CHÍNH TỪ tiếng Anh (gốc từ Latinh/Hy Lạp đặc trưng)
}
const TOPICS: Topic[] = [
  {
    key: 'business',
    emoji: '💼',
    titleVi: 'Kinh doanh & kinh tế',
    titleEn: 'Business & economy',
    kw: [
      'kinh tế',
      'kinh doanh',
      'tài chính',
      'thương mại',
      'đầu tư',
      'doanh nghiệp',
      'doanh thu',
      'lợi nhuận',
      'thị trường',
      'ngân hàng',
      'cổ phần',
      'cổ phiếu',
      'tiền tệ',
      'tiền bạc',
      'buôn bán',
      'kế toán',
      'tiếp thị',
      'quảng cáo',
      'khách hàng',
      'hợp đồng',
      'giao dịch',
      'thuế',
      'ngân sách',
      'tiền lương',
      'phá sản',
      'công ty',
      'xuất khẩu',
      'nhập khẩu',
    ],
    enkw: ['fiscal', 'monet', 'economic', 'financ', 'commerc', 'corporat', 'entrepreneur'],
  },
  {
    key: 'law_politics',
    emoji: '⚖️',
    titleVi: 'Luật pháp & chính trị',
    titleEn: 'Law & politics',
    kw: [
      'luật pháp',
      'pháp lý',
      'pháp luật',
      'chính trị',
      'chính phủ',
      'nhà nước',
      'tòa án',
      'quyền lực',
      'tội phạm',
      'hiến pháp',
      'bầu cử',
      'quốc hội',
      'ngoại giao',
      'hiệp ước',
      'điều luật',
      'phán quyết',
      'kiện tụng',
      'công lý',
      'lập pháp',
      'chủ quyền',
      'luật sư',
      'bị cáo',
      'xét xử',
      'phạm tội',
      'tù',
    ],
    enkw: [
      'juris',
      'legal',
      'constitu',
      'parliament',
      'court',
      'crimin',
      'verdict',
      'statut',
      'legislat',
    ],
  },
  {
    key: 'science_tech',
    emoji: '🔬',
    titleVi: 'Khoa học & công nghệ',
    titleEn: 'Science & technology',
    kw: [
      'khoa học',
      'công nghệ',
      'kỹ thuật',
      'máy móc',
      'điện tử',
      'hóa học',
      'vật lý',
      'sinh học',
      'dữ liệu',
      'thí nghiệm',
      'phân tử',
      'nguyên tử',
      'phần mềm',
      'máy tính',
      'cơ khí',
      'động cơ',
      'thiết bị',
      'phản ứng',
      'tế bào',
      'bức xạ',
      'điện năng',
      'công trình',
      'kim loại',
    ],
    enkw: [
      'ology',
      'onomy',
      'physi',
      'chemi',
      'techno',
      'cyber',
      'digital',
      'molecul',
      'atom',
      'electro',
      'quantum',
      'algorithm',
      'genetic',
      'nano',
    ],
  },
  {
    key: 'health_med',
    emoji: '🏥',
    titleVi: 'Sức khỏe & y học',
    titleEn: 'Health & medicine',
    kw: [
      'bệnh',
      'y học',
      'y tế',
      'thuốc',
      'sức khỏe',
      'bác sĩ',
      'phẫu thuật',
      'triệu chứng',
      'chẩn đoán',
      'vi khuẩn',
      'vi rút',
      'virus',
      'điều trị',
      'nhiễm',
      'ung thư',
      'tâm thần',
      'dịch bệnh',
      'y khoa',
      'giải phẫu',
      'miễn dịch',
      'chấn thương',
      'khỏe mạnh',
    ],
    enkw: [
      'itis',
      'osis',
      'pathy',
      'surgery',
      'disease',
      'medic',
      'clinic',
      'viral',
      'bacteri',
      'diagnos',
      'therap',
      'tumor',
      'cancer',
      'vaccin',
    ],
  },
  {
    key: 'nature_env',
    emoji: '🌍',
    titleVi: 'Môi trường & thiên nhiên',
    titleEn: 'Environment & nature',
    kw: [
      'môi trường',
      'thiên nhiên',
      'khí hậu',
      'ô nhiễm',
      'sinh thái',
      'động vật',
      'thực vật',
      'rừng',
      'đại dương',
      'khoáng',
      'địa chất',
      'thời tiết',
      'loài',
      'năng lượng',
      'khí thải',
      'đất đai',
      'cây cối',
      'sông ngòi',
    ],
  },
  {
    key: 'arts_culture',
    emoji: '🎨',
    titleVi: 'Nghệ thuật & văn hóa',
    titleEn: 'Arts & culture',
    kw: [
      'nghệ thuật',
      'văn hóa',
      'âm nhạc',
      'hội họa',
      'văn học',
      'thơ ca',
      'bài thơ',
      'vở kịch',
      'sân khấu',
      'điện ảnh',
      'bộ phim',
      'bảo tàng',
      'kiến trúc',
      'truyền thống',
      'điêu khắc',
      'giai điệu',
      'tiểu thuyết',
      'họa sĩ',
      'nghệ sĩ',
      'vũ điệu',
      'ca hát',
    ],
  },
  {
    key: 'society',
    emoji: '🏛️',
    titleVi: 'Xã hội & con người',
    titleEn: 'Society & people',
    kw: [
      'xã hội',
      'cộng đồng',
      'dân cư',
      'dân số',
      'văn minh',
      'giai cấp',
      'tôn giáo',
      'phong tục',
      'đạo đức',
      'nhân quyền',
      'tầng lớp',
      'di cư',
      'sắc tộc',
      'tín ngưỡng',
      'nghi lễ',
      'phúc lợi',
      'bình đẳng',
      'nghèo đói',
      'gia đình',
      'hôn nhân',
    ],
  },
  {
    key: 'emotion',
    emoji: '❤️',
    titleVi: 'Cảm xúc & tính cách',
    titleEn: 'Emotions & personality',
    kw: [
      'cảm xúc',
      'tính cách',
      'buồn bã',
      'vui vẻ',
      'giận dữ',
      'sợ hãi',
      'lo lắng',
      'tự hào',
      'xấu hổ',
      'kiêu ngạo',
      'hiền lành',
      'tàn nhẫn',
      'chân thành',
      'nhút nhát',
      'hồi hộp',
      'ghen',
      'tuyệt vọng',
      'phấn khích',
      'tâm trạng',
      'thái độ',
      '(tính cách)',
      'dịu dàng',
      'nóng nảy',
      'bực bội',
    ],
  },
  {
    key: 'thinking',
    emoji: '📚',
    titleVi: 'Tư duy & học thuật',
    titleEn: 'Thinking & academic',
    kw: [
      'lý thuyết',
      'khái niệm',
      'lập luận',
      'phân tích',
      'nghiên cứu',
      'triết học',
      'giả thuyết',
      'bằng chứng',
      'quan điểm',
      'suy luận',
      'nhận thức',
      'trừu tượng',
      'học thuật',
      'lý luận',
      'phương pháp',
      'giả định',
      'kết luận',
      'logic',
    ],
  },
  {
    key: 'communication',
    emoji: '🗣️',
    titleVi: 'Giao tiếp & ngôn ngữ',
    titleEn: 'Communication & language',
    kw: [
      'giao tiếp',
      'ngôn ngữ',
      'diễn đạt',
      'tranh luận',
      'thuyết phục',
      'phát biểu',
      'đàm phán',
      'thảo luận',
      'tuyên bố',
      'ám chỉ',
      'ngụ ý',
      'hùng biện',
      'ngữ pháp',
      'từ ngữ',
      'trò chuyện',
    ],
  },
]

// Nhóm dự phòng theo LOẠI TỪ (khi không khớp chủ đề nào).
const POS_FALLBACK: Record<string, { emoji: string; titleVi: string; titleEn: string }> = {
  noun: { emoji: '📦', titleVi: 'Danh từ nâng cao', titleEn: 'Advanced nouns' },
  verb: { emoji: '🏃', titleVi: 'Động từ nâng cao', titleEn: 'Advanced verbs' },
  modifier: { emoji: '🎭', titleVi: 'Tính từ & trạng từ', titleEn: 'Adjectives & adverbs' },
  other: { emoji: '🧩', titleVi: 'Từ loại khác', titleEn: 'Other words' },
}

// Phân 1 từ vào 1 nhóm (chủ đề, hoặc loại từ khi không khớp).
function bucketOf(e: DictEntry): string {
  const gloss = (e.vi ?? '').toLowerCase()
  const en = wordKey(e.word)
  for (const t of TOPICS) {
    if (t.kw.some((k) => gloss.includes(k))) return t.key
    if (t.enkw?.some((k) => en.includes(k))) return t.key
  }
  const pos = (e.pos ?? '').toLowerCase()
  if (pos.startsWith('n')) return 'noun'
  if (pos.startsWith('v')) return 'verb'
  if (pos.startsWith('adj') || pos.startsWith('adv') || pos === 'a') return 'modifier'
  return 'other'
}

// Thứ tự nhóm hiển thị: chủ đề trước (theo TOPICS), rồi loại từ.
const BUCKET_ORDER = [...TOPICS.map((t) => t.key), 'noun', 'verb', 'modifier', 'other']
function bucketMeta(key: string): { emoji: string; titleVi: string; titleEn: string } {
  const t = TOPICS.find((x) => x.key === key)
  if (t) return { emoji: t.emoji, titleVi: t.titleVi, titleEn: t.titleEn }
  return POS_FALLBACK[key] ?? POS_FALLBACK.other!
}

// ── 1. Nạp toàn bộ từ điển ────────────────────────────────────────────────
let dict: DictEntry[] = []
for (let i = 0; i < 10; i++) {
  const f = path.join(DICT_DIR, `chunk-${String(i).padStart(3, '0')}.json`)
  if (fs.existsSync(f)) dict = dict.concat(JSON.parse(fs.readFileSync(f, 'utf8')))
}

// ── 2. Tập từ đã có trong phần nền tảng thủ công (A1–B2) để KHỬ TRÙNG ──────
// Đọc từ curriculum.json hiện có nhưng BỎ QUA các vòng do chính script này sinh
// (id "cefr-c1-*"/"cefr-c2-*") → tái chạy không tự loại bỏ từ của mình.
const foundationKeys = new Set<string>()
if (fs.existsSync(CURRICULUM_JSON)) {
  const circles = JSON.parse(fs.readFileSync(CURRICULUM_JSON, 'utf8')) as {
    id: string
    words: { word: string }[]
  }[]
  for (const c of circles) {
    if (c.id.startsWith('cefr-c1-') || c.id.startsWith('cefr-c2-')) continue
    for (const w of c.words) foundationKeys.add(wordKey(w.word))
  }
}

// ── 3. Lọc từ C1/C2, khử trùng, sắp theo tần suất ─────────────────────────
function pick(level: 'C1' | 'C2'): DictEntry[] {
  const seen = new Set<string>()
  return dict
    .filter((e) => e.level === level && !foundationKeys.has(wordKey(e.word)))
    .filter((e) => e.freq == null || e.freq >= MIN_FREQ_RANK) // bỏ từ quá thông dụng (gắn nhầm)
    .filter((e) => {
      const k = wordKey(e.word)
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .sort((a, b) => {
      // freq nhỏ = thông dụng hơn, học trước; thiếu freq xếp sau cùng.
      if (a.freq == null && b.freq == null) return 0
      if (a.freq == null) return 1
      if (b.freq == null) return -1
      return a.freq - b.freq
    })
}

interface OutCircle {
  id: string
  titleVi: string
  titleEn: string
  emoji: string
  words: DictEntry[]
  sentences: never[]
}
interface OutUnit {
  id: string
  titleVi: string
  titleEn: string
  emoji: string
  circleIds: string[]
}

// Gom từ của 1 cấp theo chủ đề → sinh vòng + "Phần" (unit) cho cấp đó.
function buildLevel(level: 'C1' | 'C2', words: DictEntry[]) {
  const lc = level.toLowerCase()
  // Phân từ vào các nhóm (giữ nguyên thứ tự tần suất trong mỗi nhóm).
  const byBucket = new Map<string, DictEntry[]>()
  for (const e of words) {
    const b = bucketOf(e)
    ;(byBucket.get(b) ?? byBucket.set(b, []).get(b)!).push(e)
  }
  const circles: OutCircle[] = []
  const units: OutUnit[] = []
  let topicWordCount = 0
  for (const key of BUCKET_ORDER) {
    const ws = byBucket.get(key)
    if (!ws || ws.length === 0) continue
    if (TOPICS.some((t) => t.key === key)) topicWordCount += ws.length
    const meta = bucketMeta(key)
    const nCircles = Math.ceil(ws.length / WORDS_PER_CIRCLE)
    // Xây toàn bộ vòng của nhóm trước.
    const groupCircleIds: string[] = []
    for (let i = 0; i < ws.length; i += WORDS_PER_CIRCLE) {
      const n = groupCircleIds.length + 1
      const id = `cefr-${lc}-${key}-${n}`
      groupCircleIds.push(id)
      circles.push({
        id,
        // Đánh số chỉ khi nhóm có >1 vòng (nhóm 1 vòng để tên gọn).
        titleVi: nCircles > 1 ? `${meta.titleVi} ${n}` : meta.titleVi,
        titleEn: nCircles > 1 ? `${meta.titleEn} ${n}` : meta.titleEn,
        emoji: meta.emoji,
        words: ws.slice(i, i + WORDS_PER_CIRCLE),
        sentences: [], // phần nâng cao dùng câu ví dụ sẵn trong từng từ (giống "Mở rộng")
      })
    }
    // Cắt nhóm thành các "Phần" (unit) ≤ MAX_CIRCLES_PER_UNIT vòng. Nhiều Phần thì
    // đánh số "(N)" để phân biệt trên trang cấp.
    const nUnits = Math.ceil(groupCircleIds.length / MAX_CIRCLES_PER_UNIT)
    for (let u = 0; u < nUnits; u++) {
      const part = groupCircleIds.slice(u * MAX_CIRCLES_PER_UNIT, (u + 1) * MAX_CIRCLES_PER_UNIT)
      const suffix = nUnits > 1 ? ` (${u + 1})` : ''
      units.push({
        id: nUnits > 1 ? `${lc}-topic-${key}-${u + 1}` : `${lc}-topic-${key}`,
        titleVi: `${meta.titleVi}${suffix}`,
        titleEn: `${meta.titleEn}${suffix}`,
        emoji: meta.emoji,
        circleIds: part,
      })
    }
  }
  return { circles, units, topicWordCount }
}

const c1Words = pick('C1')
const c2Words = pick('C2')
const c1 = buildLevel('C1', c1Words)
const c2 = buildLevel('C2', c2Words)

const out = {
  _note:
    'SINH TỰ ĐỘNG bởi scripts/gen-cefr-c1c2-vocab.ts từ từ điển đã gắn nhãn CEFR. ' +
    'KHÔNG sửa tay — chạy lại script để cập nhật.',
  c1WordCount: c1Words.length,
  c2WordCount: c2Words.length,
  circles: [...c1.circles, ...c2.circles],
  c1Units: c1.units,
  c2Units: c2.units,
}

fs.writeFileSync(OUT, JSON.stringify(out))
const pctC1 = Math.round((c1.topicWordCount / c1Words.length) * 100)
const pctC2 = Math.round((c2.topicWordCount / c2Words.length) * 100)
console.log(
  `✅ cefrC1C2Vocab.json: C1 ${c1Words.length} từ / ${c1.circles.length} vòng / ${c1.units.length} chủ đề (${pctC1}% vào chủ đề) · ` +
    `C2 ${c2Words.length} từ / ${c2.circles.length} vòng / ${c2.units.length} chủ đề (${pctC2}% vào chủ đề)`,
)
