// programmingRoutesSpec — dựng URL hướng chuyên sâu khi CHỈ BIẾT id chặng.
//
// Tách khỏi `programmingRoutes.ts` vì hai hàm này phải tra registry 14 hướng (dữ liệu ~48 kB
// gzip). Để chúng ở file dùng chung là mọi trang chỉ cần dựng một URL cũng tải cả registry.
// Chỉ trang lộ trình (đã dùng registry sẵn) mới import file này.
import { getSpecialization } from '@dhcb/subject-programming/specializations/registry'
import { duongDanChangHuong, duongDanHuong } from './programmingRoutes'

/**
 * URL của một chặng khi chỉ biết id chặng (ví dụ 'ai-s1' trong bảng lắp ghép của lộ trình).
 * Trả về undefined nếu id không thuộc hướng nào — nơi gọi tự quyết định đường thay thế.
 */
export function duongDanChangTheoId(stageId: string): string | undefined {
  const [specId] = stageId.split('-')
  const spec = getSpecialization(specId ?? '')
  const stage = spec?.stages.find((s) => s.id === stageId)
  return spec && stage ? duongDanChangHuong(spec, stage) : undefined
}

/** Trang hướng khi chỉ biết id chặng — dùng cho nút "xem bản đồ hướng". */
export function duongDanHuongTheoChangId(stageId: string): string | undefined {
  const [specId] = stageId.split('-')
  const spec = getSpecialization(specId ?? '')
  return spec ? duongDanHuong(spec) : undefined
}
