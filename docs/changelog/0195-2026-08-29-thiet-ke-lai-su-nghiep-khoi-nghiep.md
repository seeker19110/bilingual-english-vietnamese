# 0195 — Thiết kế lại UI/UX trang "Sự nghiệp & Khởi nghiệp" (2026-08-29)

Người dùng báo `https://www.donghanhcungban.org/su-nghiep-khoi-nghiep` bị lỗi (trang trắng,
không load được) và yêu cầu thiết kế lại UI/UX hiện đại hơn.

## Điều tra lỗi

- Đọc lại `apps/dhcb/src/pages/domains/careerstartup/CareerStartup.tsx` (route
  `/su-nghiep-khoi-nghiep`, gộp ở PR 0190): cấu trúc GIỐNG HỆT khuôn `WorkLife.tsx` đang chạy
  tốt (trụ Công việc & Đời sống) — cùng cách nhúng `embedded`, cùng ErrorBoundary bọc ngoài,
  cùng `lazyWithRetry` tự hồi phục khi chunk cũ hết hạn sau deploy.
- `npm run typecheck` sạch · `npm run build` (client + server + hub) chạy xong không lỗi ·
  `npx vitest run` 7675/7675 xanh. Không tái hiện được lỗi ở mức code — môi trường phiên này bị
  chặn egress nên không kiểm tra trực tiếp được domain thật.
- **Nghi vấn hàng đầu: VPS production đang chạy `dist/` CŨ**, chưa có route gộp này (PR 0190
  merge sau lần deploy gần nhất) — cần deploy lại (`scripts/deploy.sh` hoặc quy trình ở
  `docs/deploy-vps-ubuntu.md`) rồi kiểm tra lại. **Việc TAY, ngoài khả năng AI trong phiên này.**

## Thiết kế lại (đã làm)

- `CareerStartup.tsx`: gộp banner tiêu đề + bộ chọn tab thành MỘT khối gradient hiện đại
  (gradient đổi màu theo tab đang mở — xanh dương cho Sự nghiệp, cam-đỏ cho Khởi nghiệp), nút
  tab lớn hơn, có icon trong khung bo góc, mô tả ngắn, mũi tên gợi ý khi hover — thay cho hàng
  nút phẳng cũ. Giữ nguyên `role="tablist"`/`role="tab"`/`aria-selected`/`aria-controls`, giữ
  đúng MỘT `<h1>` (gộp `PageHeader` cũ vào tiêu đề banner). KHÔNG đổi `Career`/`Startup` bên
  trong — chỉ đổi lớp vỏ trang gộp.
- Kiểm tương phản gradient overlay (15% opacity trên `bg-zinc-950`) bằng công thức WCAG: chữ
  trắng trên nền phủ gradient đạt ~17.4:1, vượt xa ngưỡng AAA 7:1 bắt buộc cho tiêu đề.

## Bằng chứng kiểm chứng

- `npm run typecheck` ✅ · `npm run lint` (file đã sửa) ✅ 0 cảnh báo · `npm run build` ✅ ·
  `npx vitest run` ✅ 7675/7675 (502 file).
- Chưa chạy lại E2E a11y đầy đủ (cần Postgres thật, không có trong môi trường phiên này) — trang
  này nằm trong danh sách `AUTHED_ROUTES` bị cổng CI `a11y`/`a11y-aaa` quét, nên PR sẽ tự kiểm
  lại khi CI chạy.

## Việc còn lại (người dùng)

- Xác nhận đã deploy bản mới nhất lên VPS, rồi mở lại
  `https://www.donghanhcungban.org/su-nghiep-khoi-nghiep` để xác nhận hết trắng trang.
