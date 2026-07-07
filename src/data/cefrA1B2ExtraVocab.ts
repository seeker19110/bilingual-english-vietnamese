// Wrapper typed cho dữ liệu SINH TỰ ĐỘNG cefrA1B2ExtraVocab.json
// (scripts/gen-a1b2-extra-vocab.ts). Tách ra để các nơi dùng named import gọn gàng,
// đồng thời gắn kiểu (JSON thô không có kiểu Circle).
//
// KHÔNG sửa file .json bằng tay — chạy lại script sinh để cập nhật.

import type { Circle } from './curriculum'
import type { VocabUnitDef } from './cefrC1C2Vocab'
import data from './cefrA1B2ExtraVocab.json'

// Các vòng từ vựng "Mở rộng" của A1/A2/B1/B2 (từ điển đã gắn nhãn nhưng chưa nằm
// trong vòng nền tảng thủ công) — gom theo chủ đề/loại từ, sắp theo tần suất.
export const CEFR_A1B2_EXTRA_CIRCLES = data.circles as unknown as Circle[]

export const A1_EXTRA_VOCAB_UNITS = data.a1Units as VocabUnitDef[]
export const A2_EXTRA_VOCAB_UNITS = data.a2Units as VocabUnitDef[]
export const B1_EXTRA_VOCAB_UNITS = data.b1Units as VocabUnitDef[]
export const B2_EXTRA_VOCAB_UNITS = data.b2Units as VocabUnitDef[]

// Số từ mỗi cấp (để hiển thị/thống kê nếu cần).
export const A1_EXTRA_WORD_COUNT = data.a1WordCount as number
export const A2_EXTRA_WORD_COUNT = data.a2WordCount as number
export const B1_EXTRA_WORD_COUNT = data.b1WordCount as number
export const B2_EXTRA_WORD_COUNT = data.b2WordCount as number
