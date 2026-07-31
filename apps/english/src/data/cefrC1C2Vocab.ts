// Wrapper typed cho dữ liệu SINH TỰ ĐỘNG cefrC1C2Vocab.json
// (scripts/gen-cefr-c1c2-vocab.ts). Tách ra để các nơi dùng named import gọn gàng,
// đồng thời gắn kiểu (JSON thô không có kiểu Circle).
//
// KHÔNG sửa file .json bằng tay — chạy lại script sinh để cập nhật.

import type { Circle } from './curriculum'
import data from './cefrC1C2Vocab.json'

// Các vòng từ vựng C1 + C2 (đã lọc + gom theo chủ đề/loại từ + sắp theo tần suất).
export const CEFR_C1C2_CIRCLES = data.circles as unknown as Circle[]

// 1 "Phần" (unit) TỪ VỰNG theo chủ đề: gom vài vòng cùng chủ đề (hoặc cùng loại từ).
export interface VocabUnitDef {
  id: string
  titleVi: string
  titleEn: string
  emoji: string
  circleIds: string[]
}
export const C1_VOCAB_UNITS = data.c1Units as VocabUnitDef[]
export const C2_VOCAB_UNITS = data.c2Units as VocabUnitDef[]

// Số từ mỗi cấp (để hiển thị/thống kê nếu cần).
export const C1_WORD_COUNT = data.c1WordCount as number
export const C2_WORD_COUNT = data.c2WordCount as number
