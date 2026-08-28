# 0190 — Gộp hai TRANG "Sự nghiệp" + "Khởi nghiệp" thành một trụ (2026-08-28)

Nối tiếp 0189 (gộp hai _thẻ_ ở trang chủ): người dùng yêu cầu gộp luôn hai **trang**.

## Việc đã làm

- Trang gộp mới `apps/dhcb/src/pages/domains/careerstartup/CareerStartup.tsx`, route
  **`/su-nghiep-khoi-nghiep`**, hai tab `?muc=su-nghiep` (mặc định) / `?muc=khoi-nghiep`.
- `Career.tsx` và `Startup.tsx` nhận prop `embedded` — **theo đúng khuôn `Work`/`Life` đã dùng
  cho trụ gộp "Công việc & Đời sống"** (PR trước, migration 0066): chế độ nhúng không dựng
  `Layout` riêng và hạ đầu trang từ `PageHeader` (h1) xuống `h2`, để trang gộp giữ đúng MỘT h1.
  Nội dung, API và trạng thái của hai trụ **không viết lại dòng nào**.
- Mọi lối vào cũ giữ nguyên, chuyển hướng sang đúng tab: `/su-nghiep`, `/khoi-nghiep`,
  `/career`, `/startup`, `/su-nghiep-cua-toi`, `/hoc-su-nghiep`, `/toi-khoi-nghiep`,
  `/hoc-khoi-nghiep`.
- Cập nhật các nơi trỏ tới hai trụ: `Home.tsx` (thẻ gộp ở 0189 nay còn MỘT nút CTA),
  `Layout.tsx`, `Profile.tsx` (2 thẻ trụ → 1), `About.tsx`, `BottomNav.tsx`,
  `CareerInterview.tsx` + `StartupCanvas.tsx` (nút quay lại về đúng tab).

## Quyết định

- **Gộp trang, KHÔNG gộp dữ liệu.** Schema, API và test của Career/Startup giữ nguyên; đây
  thuần là gộp lớp trình bày. Rẻ và revert được, khác với trụ Work+Life vốn có migration riêng.
- **Đường dẫn cũ không xoá.** Redirect thay vì bỏ, nên bookmark/link đã chia sẻ không gãy.

## Bằng chứng kiểm chứng

- `npm run build` ✅ · `npm run typecheck` ✅ · `npm run lint` ✅ 0 cảnh báo ·
  `npm test` ✅ 7580/7580 (499 file).
- E2E chạy tay tại máy: `route-alias` + `v2-hubs` ✅ 17/17 · `a11y-modals` ✅ 20/20 ·
  `a11y` + `a11y-aaa` ✅ **382/382** (0 vi phạm A/AA và AAA trên trang gộp × 5 theme).
- Test cập nhật theo hành vi mới: `v2-hubs` (trang Cá nhân còn 2 thẻ trụ, chốt chặn 4 thẻ cũ
  không quay lại), `route-alias`, `a11y`, `a11y-modals`.
