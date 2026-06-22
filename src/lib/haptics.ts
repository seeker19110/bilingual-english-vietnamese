// Rung phản hồi nhẹ trên điện thoại (Android Chrome hỗ trợ; iOS Safari bỏ qua êm).
// Dùng cho các hành động quan trọng: bắt đầu/dừng ghi âm, gửi tin nhắn...
// Gọi an toàn ở mọi nơi — tự kiểm tra hỗ trợ, không bao giờ ném lỗi.
export function vibrate(pattern: number | number[] = 10) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  } catch {
    // Trình duyệt chặn hoặc không hỗ trợ — bỏ qua.
  }
}

// Một vài kiểu rung đặt tên sẵn cho dễ dùng.
export const haptics = {
  tap: () => vibrate(10),            // chạm nút thường
  success: () => vibrate([15, 40, 15]), // hoàn thành (gửi xong, đúng đáp án)
  start: () => vibrate(20),          // bắt đầu ghi âm
  stop: () => vibrate([10, 30]),     // dừng ghi âm
}
