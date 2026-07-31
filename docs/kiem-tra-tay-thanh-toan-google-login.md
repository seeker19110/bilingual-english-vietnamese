# Danh sách kiểm tra tay — Thanh toán SePay & Đăng nhập Google

> Tạo 2026-07-31, theo yêu cầu chuẩn bị trước GĐ1 (`docs/adr/0001-nen-tang-da-linh-vuc.md`).
> **Vì sao kiểm tra TAY chứ không tự động hoá:** thanh toán cần một giao dịch chuyển khoản ngân
> hàng thật (không thể giả lập an toàn trong CI), và đăng nhập Google cần popup OAuth thật của
> Google (tự động hoá vi phạm điều khoản dịch vụ Google và rất dễ vỡ). Phần **logic server** của
> cả hai luồng đã có unit test (`api/checkout.test.ts`, `api/payment-webhook.test.ts`,
> `api/_lib/sepay.test.ts`, `api/auth.test.ts` — mới thêm 2026-07-31). Checklist này chỉ kiểm tra
> phần còn lại: đường đi thật từ UI tới tiền/tài khoản thật.
>
> **Chạy lại checklist này:** trước mỗi lần deploy PR thuộc GĐ1 có đụng `packages/core-auth` hoặc
> `packages/core-billing` (PR-4, PR-5). Ký tên + ngày vào cột cuối mỗi lần chạy.

## A. Đăng nhập Google

| #   | Bước                                                                                         | Kết quả mong đợi                                                                                                    |
| --- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| A1  | Vào trang `/login`, bấm "Đăng nhập bằng Google"                                              | Popup Google mở, không lỗi console                                                                                  |
| A2  | Chọn tài khoản Google **chưa từng đăng nhập app này**                                        | Vào thẳng app (không qua `/onboarding` bắt buộc — hoặc có, tuỳ luồng hiện tại), profile có tên/email đúng từ Google |
| A3  | Kiểm tra đã được cấp quà dùng thử Pro 14 ngày ngay (tài khoản mới)                           | Trang `/profile` hiện gói Pro, hạn dùng ~14 ngày                                                                    |
| A4  | Đăng xuất, đăng nhập lại **cùng tài khoản Google đó**                                        | Vào lại đúng tài khoản cũ, **không** cấp thêm quà dùng thử lần 2                                                    |
| A5  | Trên Safari/iOS (nếu có máy test) — luồng dùng `google-token` (popup OAuth2) thay vì One Tap | Đăng nhập thành công tương tự A2                                                                                    |
| A6  | Thử đăng nhập bằng tài khoản Google đã tồn tại nhưng đăng ký qua email/password trùng email  | Xác nhận hành vi hiện tại (gộp tài khoản hay báo lỗi) — ghi lại kết quả thực tế, không đoán                         |

## B. Thanh toán SePay (dùng số tiền NHỎ NHẤT có thể — ví dụ gói 10 ngày)

⚠️ Đây là tiền thật. Dùng tài khoản ngân hàng cá nhân của bạn để tự chuyển cho chính SePay
merchant đã cấu hình, số tiền nhỏ nhất (gói 10 ngày, hiện ~20.000–30.000đ).

| #   | Bước                                                                                                     | Kết quả mong đợi                                                                                           |
| --- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| B1  | Vào `/profile` → chọn gói Pro 10 ngày → bấm mua                                                          | Hiện mã QR + nội dung chuyển khoản đúng định dạng tiền tố hiện hành (`ENVI…` trước PR-5, `DHCB…` sau PR-5) |
| B2  | Mở app ngân hàng, quét QR hoặc nhập tay đúng nội dung                                                    | Số tiền/nội dung khớp với B1, không bị app ngân hàng cắt bớt ký tự                                         |
| B3  | Chuyển khoản thật                                                                                        | Trong vòng ≤ 1 phút, trang thanh toán tự chuyển sang trạng thái "Thành công" (không cần bấm refresh)       |
| B4  | Kiểm tra `/profile`                                                                                      | Gói đã lên Pro, hạn dùng +10 ngày tính từ lúc thanh toán                                                   |
| B5  | Kiểm tra bảng `payments` trên DB                                                                         | Có dòng mới, `status = 'completed'`, số tiền khớp B3                                                       |
| B6  | **(Chỉ chạy SAU PR-5)** Copy lại nội dung chuyển khoản CŨ dạng `ENVI…` từ B2 lần trước, chuyển khoản lại | Webhook vẫn nhận diện đúng — không rơi giao dịch vì đổi tiền tố mặc định sang `DHCB`                       |
| B7  | Trên trang quản trị SePay                                                                                | Xác nhận có **cả hai** bộ lọc tiền tố `ENVI` và `DHCB` đang bật, không cái nào bị tắt/xoá                  |

## Nhật ký chạy checklist

| Ngày                      | Người chạy | A (Google) | B (SePay) | Ghi chú |
| ------------------------- | ---------- | ---------- | --------- | ------- |
| _(điền khi chạy lần đầu)_ |            |            |           |         |
