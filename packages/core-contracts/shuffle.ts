// shuffle.ts — Trộn mảng ĐÚNG (Fisher–Yates). Dùng chung cho cả client và server.
//
// VÌ SAO PHẢI CÓ FILE NÀY (audit 2026-08-24, phát hiện F1):
//
// Trước đây nhiều chỗ trộn mảng bằng `arr.sort(() => Math.random() - 0.5)`. Đó KHÔNG phải thuật
// toán trộn: `Array.prototype.sort` giả định hàm so sánh NHẤT QUÁN (a<b thì luôn a<b), còn hàm
// trên trả kết quả ngẫu nhiên mỗi lần gọi. Kết quả phụ thuộc vào thuật toán sort của engine và
// lệch rất nặng — đo thật 400.000 lượt với 4 phần tử, phần tử đứng đầu ở lại vị trí 1 tới 36%
// (kỳ vọng 25%) và vị trí 2 chỉ 17%.
//
// Hậu quả trong dự án này: đáp án đúng luôn được ghép vào đầu mảng (`[đúng, ...sai]`) trước khi
// trộn, nên người học bấm luôn ô đầu ăn 36% thay vì 25% — điểm bài Kiểm tra và test-out mất ý
// nghĩa. Xem `docs/framework/QUY-TRINH-AUDIT.md` Tầng 10.
//
// Fisher–Yates cho phân bố ĐỀU thật: mỗi hoán vị có xác suất bằng nhau.

/**
 * Trả về BẢN SAO đã trộn đều của `arr` (không đụng mảng gốc).
 *
 * `rng` cho phép tiêm nguồn ngẫu nhiên xác định trong test — nhờ vậy test phân bố chạy được mà
 * KHÔNG trở thành test flaky (xem Tầng 1b của quy trình audit). Mặc định dùng `Math.random`.
 */
export function shuffle<T>(arr: readonly T[], rng: () => number = Math.random): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j] as T, a[i] as T]
  }
  return a
}
