// packages/core-ui/rovingGrid.ts — Điều hướng một LƯỚI bằng phím mũi tên (roving tabindex).
//
// VẤN ĐỀ NÓ GIẢI: lịch hoạt động ở Dashboard cho MỌI ô ngày `tabIndex={0}`. Đo thật trên
// desktop: 182 trong tổng số 213 điểm dừng Tab của cả trang là ô lịch — tức người dùng bàn
// phím phải bấm Tab 182 lần để đi qua một thẻ trang trí. (Con số này vốn là 35 và đã tệ; đợt
// mở lịch lên nửa năm làm nó tệ gấp năm.)
//
// Mẫu chuẩn của WAI-ARIA cho tình huống này là **roving tabindex**: cả lưới là MỘT điểm dừng
// Tab, bên trong dùng phím mũi tên. Người dùng bàn phím lướt qua trang bằng 1 lần Tab, nhưng
// vẫn đọc được từng ngày khi họ muốn.
//
// File này chỉ chứa phần TÍNH TOÁN — "đang ở ô i, bấm phím X thì sang ô nào" — tách khỏi
// React để kiểm chứng bằng test mà không phải dựng DOM (cùng triết lý với `core-examplan`).

/** Lưới xếp theo hàng (mỗi hàng là một tuần) hay theo cột (mỗi cột là một tuần). */
export type GridFlow = 'row' | 'column'

export interface RovingGridOptions {
  /** Ô đang được chọn (0-based). */
  index: number
  /** Tổng số ô. */
  total: number
  /**
   * Số ô trên MỘT bước nhảy vuông góc với chiều đổ dữ liệu:
   * - flow 'row' (đổ theo hàng): số cột = 7 (thứ 2 → CN).
   * - flow 'column' (đổ theo cột): số hàng = 7.
   */
  span: number
  flow: GridFlow
}

/**
 * Trả về chỉ số ô mới sau khi bấm phím, hoặc `null` khi phím không phải phím điều hướng
 * (để nơi gọi biết là KHÔNG nên `preventDefault` — nuốt phím không dùng đến sẽ chặn mất
 * phím tắt của trình duyệt).
 *
 * Luôn kẹp trong [0, total-1] thay vì cuộn vòng: lịch có mốc đầu và mốc cuối thật (ngày xa
 * nhất và hôm nay), nên nhảy từ hôm nay về ngày xa nhất là mất phương hướng.
 */
export function resolveRovingGridKey(key: string, o: RovingGridOptions): number | null {
  const { index, total, span, flow } = o
  if (total <= 0 || span <= 0) return null

  const clamp = (n: number) => Math.max(0, Math.min(total - 1, n))

  // Bước nhảy của mỗi phím phụ thuộc chiều đổ dữ liệu:
  //  - đổ theo HÀNG: sang phải = ô kế tiếp (+1); xuống = cùng thứ tuần sau (+span).
  //  - đổ theo CỘT: xuống = ô kế tiếp (+1); sang phải = cùng thứ tuần sau (+span).
  const horizontal = flow === 'row' ? 1 : span
  const vertical = flow === 'row' ? span : 1

  switch (key) {
    case 'ArrowRight':
      return clamp(index + horizontal)
    case 'ArrowLeft':
      return clamp(index - horizontal)
    case 'ArrowDown':
      return clamp(index + vertical)
    case 'ArrowUp':
      return clamp(index - vertical)
    case 'Home':
      return 0
    case 'End':
      return total - 1
    case 'PageUp':
      // Lùi/tiến trọn một "tuần" — bước nhảy lớn cho lịch dài nửa năm.
      return clamp(index - span)
    case 'PageDown':
      return clamp(index + span)
    default:
      return null
  }
}
