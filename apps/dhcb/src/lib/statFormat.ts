// src/lib/statFormat.ts — Định dạng số liệu thống kê cho các panel admin.

/**
 * Tỷ lệ phần trăm để hiển thị. `null`/`undefined` = **CHƯA CÓ DỮ LIỆU**, khác hẳn 0%.
 *
 * Vì sao không gộp thành 0%: người đọc bảng số thấy 0% sẽ kết luận "trượt hoàn toàn", trong khi
 * sự thật có thể chỉ là chưa ai đi qua luồng đang xét. Hai chuyện đó dẫn tới hai hành động khác
 * nhau — gộp lại là tự lừa mình.
 */
export function formatRate(v: number | null | undefined): string {
  return v == null ? '—' : `${v}%`
}
