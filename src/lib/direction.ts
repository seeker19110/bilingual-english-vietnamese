// Chiều học hai chiều (Việt ⇄ Anh) — lưu toàn cục ở localStorage.
//   - 'vi_en' (chiều A): người Việt học tiếng Anh → đích=Anh, giải thích=Việt.
//   - 'en_vi' (chiều B): người nước ngoài học tiếng Việt → đích=Việt, giải thích=Anh.
// Các trang đọc dirConfig() lúc render để biết: nói/đọc giọng nào, AI giải thích bằng gì.

export type Direction = 'vi_en' | 'en_vi'
export type Lang = 'en' | 'vi'

const KEY = 'et_direction'

export function getDirection(): Direction {
  try {
    return localStorage.getItem(KEY) === 'en_vi' ? 'en_vi' : 'vi_en'
  } catch {
    return 'vi_en'
  }
}

export function setDirection(d: Direction) {
  try {
    localStorage.setItem(KEY, d)
  } catch {
    /* bỏ qua nếu không ghi được */
  }
}

export function toggleDirection(): Direction {
  const next: Direction = getDirection() === 'vi_en' ? 'en_vi' : 'vi_en'
  setDirection(next)
  return next
}

// Cấu hình suy ra từ chiều học, dùng chung cho mọi trang/prompt.
export interface DirConfig {
  direction: Direction
  targetLang: Lang // ngôn ngữ ĐÍCH (phần hội thoại) — học viên đang học
  explainLang: Lang // ngôn ngữ GIẢI THÍCH (mẹ đẻ học viên) — sửa lỗi/giải thích
  targetLabelVi: string // tên ngôn ngữ đích bằng tiếng Việt, vd "tiếng Anh"
  explainLabelVi: string // tên ngôn ngữ giải thích bằng tiếng Việt
  targetName: string // tên tiếng Anh cho prompt AI, vd "English"
  explainName: string // tên tiếng Anh cho prompt AI, vd "Vietnamese"
  inputPlaceholder: string // placeholder ô nhập (song ngữ)
  micHint: string // dòng gợi ý khi luyện nói
  shortLabel: string // nhãn ngắn cho nút chuyển chiều, vd "Việt → Anh"
}

export function dirConfig(d: Direction = getDirection()): DirConfig {
  if (d === 'en_vi') {
    return {
      direction: 'en_vi',
      targetLang: 'vi',
      explainLang: 'en',
      targetLabelVi: 'tiếng Việt',
      explainLabelVi: 'tiếng Anh',
      targetName: 'Vietnamese',
      explainName: 'English',
      inputPlaceholder: 'Nhập tiếng Việt... · Type in Vietnamese...',
      micHint: 'Nhấn mic để nói tiếng Việt · Speak Vietnamese',
      shortLabel: 'Anh → Việt',
    }
  }
  return {
    direction: 'vi_en',
    targetLang: 'en',
    explainLang: 'vi',
    targetLabelVi: 'tiếng Anh',
    explainLabelVi: 'tiếng Việt',
    targetName: 'English',
    explainName: 'Vietnamese',
    inputPlaceholder: 'Nhập tiếng Anh...',
    micHint: 'Nhấn mic để nói tiếng Anh',
    shortLabel: 'Việt → Anh',
  }
}
