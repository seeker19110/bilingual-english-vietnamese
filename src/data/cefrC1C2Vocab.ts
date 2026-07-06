// Wrapper typed cho dữ liệu SINH TỰ ĐỘNG cefrC1C2Vocab.json
// (scripts/gen-cefr-c1c2-vocab.ts). Tách ra để các nơi dùng named import gọn gàng,
// đồng thời gắn kiểu (JSON thô không có kiểu Circle).
//
// KHÔNG sửa file .json bằng tay — chạy lại script sinh để cập nhật.

import type { Circle } from './curriculum'
import data from './cefrC1C2Vocab.json'

// Các vòng từ vựng C1 + C2 (đã lọc + sắp theo tần suất).
export const CEFR_C1C2_CIRCLES = data.circles as unknown as Circle[]

// id các vòng gom theo từng "Phần" (unit) của cấp — dùng ở src/data/cefrAdvanced.ts.
export const C1_UNIT_CIRCLE_IDS = data.c1UnitCircleIds as string[][]
export const C2_UNIT_CIRCLE_IDS = data.c2UnitCircleIds as string[][]

// Số từ mỗi cấp (để hiển thị/thống kê nếu cần).
export const C1_WORD_COUNT = data.c1WordCount as number
export const C2_WORD_COUNT = data.c2WordCount as number
