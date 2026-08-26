# feat: 2FA TOTP — giao diện trong trang Hồ sơ (2026-08-23)

`TwoFactorSection.tsx` + `lib/twoFactorApi.ts`, gắn vào `pages/core/Profile.tsx` (khối thu gọn,
cùng khuôn `EmailVerifySection`/`ReferralSection`). Luồng: bật (QR + gõ tay secret → nhập mã xác
nhận) · hiện mã khôi phục ĐÚNG MỘT LẦN kèm nút sao chép · tạo bộ mã mới · tắt (đòi cả mã 2FA lẫn
mật khẩu). Song ngữ theo `isA`. Cảnh báo khi còn ≤2 mã khôi phục.

**Phát hiện: trang Hồ sơ KHÔNG nằm trong 9 route mà `e2e/a11y.spec.ts` quét** — nên component mới
sẽ không được cổng a11y gác. Đã bù bằng `e2e/a11y-2fa.spec.ts`: quét 4 trạng thái (thu gọn · quét
QR · bảng mã khôi phục · khối tắt) × 5 theme = **20 test**, giới hạn phạm vi vào `#two-factor-section`
để không vô tình biến nó thành cổng cho cả trang Hồ sơ vốn chưa từng được gác.

**Cổng đó bắt được lỗi thật ngay lần chạy đầu:** nút "Tắt" dùng `bg-rose-500` + chữ trắng chỉ đạt
**3,67:1**, dưới sàn AA 4,5:1, và hỏng ở **cả 5 theme** (cả hai màu đều cố định nên không theme nào
cứu được). Sửa sang `bg-rose-700`. Đây đúng là loại lỗi sẽ lọt ra production nếu chỉ nhìn bằng mắt
trên theme tối.

**Nợ còn mở (ghi để không quên):** 9 route được gác a11y chưa gồm `/profile`, `/tien-do`, `/lich-su`
và các trang cá nhân khác — chúng đang không có cổng a11y nào. Mở rộng danh sách quét là việc riêng,
cần làm nhưng sẽ lộ ra vi phạm có sẵn nên phải tách PR.
