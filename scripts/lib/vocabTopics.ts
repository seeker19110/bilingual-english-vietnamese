// scripts/lib/vocabTopics.ts
// Logic GOM TỪ VỰNG THEO CHỦ ĐỀ dùng chung cho các script sinh vòng từ vựng CEFR
// tự động từ từ điển đã gắn nhãn (gen-cefr-c1c2-vocab.ts, gen-a1b2-extra-vocab.ts).
//
// Tách ra đây để 2 script không lặp lại ~400 dòng danh mục chủ đề + logic gom nhóm.

import type { DictEntry } from '../../apps/dhcb/src/types.ts'

export const wordKey = (s: string) => s.trim().toLowerCase()

// ── Danh mục CHỦ ĐỀ (khớp NGHĨA TIẾNG VIỆT) ───────────────────────────────
// Ưu tiên theo thứ tự: chủ đề đầu tiên có từ khóa xuất hiện trong nghĩa sẽ thắng.
// Từ khóa chọn ĐỦ ĐẶC TRƯNG để hạn chế khớp nhầm (vd "tiền tệ" thay vì bare "tiền").
export interface Topic {
  key: string
  emoji: string
  titleVi: string
  titleEn: string
  kw: string[] // khớp trong NGHĨA tiếng Việt
  enkw?: string[] // khớp trong CHÍNH TỪ tiếng Anh (gốc từ Latinh/Hy Lạp đặc trưng)
}
export const TOPICS: Topic[] = [
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
// 2 biến thể: cấp NÂNG CAO (C1/C2) ghi rõ "nâng cao" để phân biệt với từ cơ bản
// cùng loại từ đã học ở A1–B2; cấp CƠ BẢN (A1–B2 phần mở rộng) dùng tên trơn.
export type PosFallbackMap = Record<string, { emoji: string; titleVi: string; titleEn: string }>
export const POS_FALLBACK_BASIC: PosFallbackMap = {
  noun: { emoji: '📦', titleVi: 'Danh từ', titleEn: 'Nouns' },
  verb: { emoji: '🏃', titleVi: 'Động từ', titleEn: 'Verbs' },
  modifier: { emoji: '🎭', titleVi: 'Tính từ & trạng từ', titleEn: 'Adjectives & adverbs' },
  other: { emoji: '🧩', titleVi: 'Từ loại khác', titleEn: 'Other words' },
}
export const POS_FALLBACK_ADVANCED: PosFallbackMap = {
  noun: { emoji: '📦', titleVi: 'Danh từ nâng cao', titleEn: 'Advanced nouns' },
  verb: { emoji: '🏃', titleVi: 'Động từ nâng cao', titleEn: 'Advanced verbs' },
  modifier: { emoji: '🎭', titleVi: 'Tính từ & trạng từ', titleEn: 'Adjectives & adverbs' },
  other: { emoji: '🧩', titleVi: 'Từ loại khác', titleEn: 'Other words' },
}

// Phân 1 từ vào 1 nhóm (chủ đề, hoặc loại từ khi không khớp).
export function bucketOf(e: DictEntry): string {
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
export const BUCKET_ORDER = [...TOPICS.map((t) => t.key), 'noun', 'verb', 'modifier', 'other']
export function bucketMeta(
  key: string,
  posFallback: PosFallbackMap = POS_FALLBACK_BASIC,
): { emoji: string; titleVi: string; titleEn: string } {
  const t = TOPICS.find((x) => x.key === key)
  if (t) return { emoji: t.emoji, titleVi: t.titleVi, titleEn: t.titleEn }
  return posFallback[key] ?? posFallback.other!
}

export interface OutCircle {
  id: string
  titleVi: string
  titleEn: string
  emoji: string
  words: DictEntry[]
  sentences: never[]
}
export interface OutUnit {
  id: string
  titleVi: string
  titleEn: string
  emoji: string
  circleIds: string[]
}

// Gom 1 danh sách từ (đã lọc + sắp theo tần suất) theo chủ đề → sinh vòng + "Phần"
// (unit). `idPrefix` vd "cefr-c1" hay "cefr-a1" → id vòng "cefr-c1-business-1"...
export function buildLevelGroups(
  idPrefix: string,
  words: DictEntry[],
  wordsPerCircle = 16,
  maxCirclesPerUnit = 5,
  posFallback: PosFallbackMap = POS_FALLBACK_BASIC,
): { circles: OutCircle[]; units: OutUnit[]; topicWordCount: number } {
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
    const meta = bucketMeta(key, posFallback)
    const nCircles = Math.ceil(ws.length / wordsPerCircle)
    const groupCircleIds: string[] = []
    for (let i = 0; i < ws.length; i += wordsPerCircle) {
      const n = groupCircleIds.length + 1
      const id = `${idPrefix}-${key}-${n}`
      groupCircleIds.push(id)
      circles.push({
        id,
        titleVi: nCircles > 1 ? `${meta.titleVi} ${n}` : meta.titleVi,
        titleEn: nCircles > 1 ? `${meta.titleEn} ${n}` : meta.titleEn,
        emoji: meta.emoji,
        words: ws.slice(i, i + wordsPerCircle),
        sentences: [],
      })
    }
    const nUnits = Math.ceil(groupCircleIds.length / maxCirclesPerUnit)
    for (let u = 0; u < nUnits; u++) {
      const part = groupCircleIds.slice(u * maxCirclesPerUnit, (u + 1) * maxCirclesPerUnit)
      const suffix = nUnits > 1 ? ` (${u + 1})` : ''
      units.push({
        id: nUnits > 1 ? `${idPrefix}-topic-${key}-${u + 1}` : `${idPrefix}-topic-${key}`,
        titleVi: `${meta.titleVi}${suffix}`,
        titleEn: `${meta.titleEn}${suffix}`,
        emoji: meta.emoji,
        circleIds: part,
      })
    }
  }
  return { circles, units, topicWordCount }
}
