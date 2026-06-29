// Dữ liệu dùng chung cho "loại từ" (parts of speech): nhãn, màu badge,
// định nghĩa và ví dụ. Một nơi duy nhất để cả trang Từ điển (badge) và
// trang Từ loại (giải thích) cùng dùng — tránh viết lặp 2 chỗ.

export interface PosInfo {
  code: string // mã viết tắt dùng trong dictionary.json (n, v, adj...)
  label: string // nhãn tiếng Việt, ví dụ 'Danh từ'
  labelEn: string // tên tiếng Anh, ví dụ 'Noun'
  color: string // class Tailwind cho badge
  definition: string // giải thích ngắn bằng tiếng Việt
  examples: { en: string; vi: string }[] // vài ví dụ điển hình
}

// Thứ tự hiển thị trên trang giải thích: loại từ chính trước, loại phụ sau.
export const POS_LIST: PosInfo[] = [
  {
    code: 'n',
    label: 'Danh từ',
    labelEn: 'Noun',
    color: 'bg-emerald-500/15 text-emerald-300 theme-light:text-emerald-800',
    definition: 'Từ gọi tên người, vật, nơi chốn, sự việc hoặc khái niệm.',
    examples: [
      { en: 'dog', vi: 'con chó' },
      { en: 'Hanoi', vi: 'Hà Nội' },
      { en: 'happiness', vi: 'hạnh phúc' },
    ],
  },
  {
    code: 'v',
    label: 'Động từ',
    labelEn: 'Verb',
    color: 'bg-sky-500/15 text-sky-300 theme-light:text-sky-800',
    definition: 'Từ diễn tả hành động hoặc trạng thái của người/vật.',
    examples: [
      { en: 'run', vi: 'chạy' },
      { en: 'think', vi: 'nghĩ' },
      { en: 'be', vi: 'là / ở (thì, trạng thái)' },
    ],
  },
  {
    code: 'adj',
    label: 'Tính từ',
    labelEn: 'Adjective',
    color: 'bg-violet-500/15 text-violet-300 theme-light:text-violet-800',
    definition: 'Từ miêu tả đặc điểm, tính chất của danh từ (đứng trước danh từ hoặc sau "to be").',
    examples: [
      { en: 'beautiful', vi: 'đẹp' },
      { en: 'tall', vi: 'cao' },
      { en: 'happy', vi: 'vui' },
    ],
  },
  {
    code: 'adv',
    label: 'Trạng từ',
    labelEn: 'Adverb',
    color: 'bg-amber-500/15 text-amber-300 theme-light:text-amber-800',
    definition:
      'Từ bổ nghĩa cho động từ, tính từ hoặc cả câu — trả lời "như thế nào, khi nào, ở đâu, mức độ nào".',
    examples: [
      { en: 'quickly', vi: 'nhanh chóng' },
      { en: 'very', vi: 'rất' },
      { en: 'yesterday', vi: 'hôm qua' },
    ],
  },
  {
    code: 'prep',
    label: 'Giới từ',
    labelEn: 'Preposition',
    color: 'bg-rose-500/15 text-rose-300 theme-light:text-rose-800',
    definition:
      'Từ đứng trước danh từ/đại từ để chỉ vị trí, thời gian hoặc quan hệ với phần còn lại của câu.',
    examples: [
      { en: 'in the box', vi: 'trong cái hộp' },
      { en: 'on the table', vi: 'trên cái bàn' },
      { en: 'at 7 PM', vi: 'lúc 7 giờ tối' },
    ],
  },
  {
    code: 'conj',
    label: 'Liên từ',
    labelEn: 'Conjunction',
    color: 'bg-teal-500/15 text-teal-300 theme-light:text-teal-800',
    definition: 'Từ dùng để nối hai từ, cụm từ hoặc hai câu lại với nhau.',
    examples: [
      { en: 'bread and butter', vi: 'bánh mì và bơ' },
      { en: 'small but strong', vi: 'nhỏ nhưng khỏe' },
      { en: 'I stayed because it rained.', vi: 'Tôi ở lại vì trời mưa.' },
    ],
  },
  {
    code: 'pron',
    label: 'Đại từ',
    labelEn: 'Pronoun',
    color: 'bg-orange-500/15 text-orange-300 theme-light:text-orange-800',
    definition: 'Từ dùng thay thế cho danh từ đã nhắc tới trước đó, để tránh lặp lại.',
    examples: [
      { en: 'They are students.', vi: 'Họ là học sinh.' },
      { en: 'This is mine.', vi: 'Cái này là của tôi.' },
      { en: 'She likes him.', vi: 'Cô ấy thích anh ấy.' },
    ],
  },
  {
    code: 'art',
    label: 'Mạo từ',
    labelEn: 'Article',
    color: 'bg-lime-500/15 text-lime-300 theme-light:text-lime-800',
    definition:
      'Từ đứng trước danh từ để cho biết danh từ đó đã xác định (the) hay chưa xác định (a/an).',
    examples: [
      { en: 'a dog', vi: 'một con chó (chưa rõ con nào)' },
      { en: 'the dog', vi: 'con chó đó (đã xác định)' },
      { en: 'an apple', vi: 'một quả táo (dùng "an" vì âm nguyên âm)' },
    ],
  },
  {
    code: 'num',
    label: 'Số từ',
    labelEn: 'Numeral',
    color: 'bg-cyan-500/15 text-cyan-300 theme-light:text-cyan-800',
    definition: 'Từ chỉ số lượng (một, hai, ba...) hoặc thứ tự (thứ nhất, thứ hai...).',
    examples: [
      { en: 'one apple', vi: 'một quả táo' },
      { en: 'the first day', vi: 'ngày đầu tiên' },
    ],
  },
  {
    code: 'interj',
    label: 'Thán từ',
    labelEn: 'Interjection',
    color: 'bg-pink-500/15 text-pink-300 theme-light:text-pink-800',
    definition: 'Từ hoặc cụm từ ngắn diễn tả cảm xúc bất ngờ, vui mừng, đau đớn...',
    examples: [
      { en: 'Wow!', vi: 'Ồ! / Tuyệt!' },
      { en: 'Ouch!', vi: 'Ui da!' },
      { en: 'Oh no!', vi: 'Ồ không!' },
    ],
  },
  {
    code: 'idiom',
    label: 'Thành ngữ',
    labelEn: 'Idiom',
    color: 'bg-fuchsia-500/15 text-fuchsia-300 theme-light:text-fuchsia-800',
    definition:
      'Cụm từ cố định mang nghĩa bóng — không thể hiểu bằng cách ghép nghĩa đen của từng từ.',
    examples: [
      { en: 'piece of cake', vi: 'dễ như ăn bánh (việc rất dễ)' },
      { en: 'break the ice', vi: 'phá vỡ sự ngượng ngùng ban đầu' },
    ],
  },
]

// Nhãn tiếng Việt theo mã loại từ — Dictionary.tsx dùng để hiển thị badge.
export const POS_LABEL: Record<string, string> = Object.fromEntries(
  POS_LIST.map((p) => [p.code, p.label]),
)

// Màu badge theo mã loại từ — dùng chung cho Dictionary.tsx và trang giải thích.
export const POS_COLOR: Record<string, string> = Object.fromEntries(
  POS_LIST.map((p) => [p.code, p.color]),
)
