# 0208 — Đợt 3 thi hành audit UI/UX: bố cục 2 cột desktop + trang bảng giá

Đợt 3 (cuối) thi hành `docs/research/audit-ui-ux-desktop-mobile-2026-08-31.md` mục B8/B9,
sau đợt 1 (#760) và đợt 2 (#763). Đây là các việc "thiết kế lớn hơn" cố tình để lại làm sau
vì rủi ro layout cao hơn (đọc mục E của báo cáo), tách 2 commit vì có thể review độc lập:

1. `feat(ui)` **Trang bảng giá riêng + Writing 2 cột**:
   - Tách `UpgradeSection` khỏi `Profile.tsx` sang trang mới `pages/core/Pricing.tsx`, route
     `/nang-cap` — 4 gói Free/Plus/Pro/VIP so sánh cạnh nhau trên desktop
     (`lg:grid-cols`), Profile giữ bản rút gọn + nút "Xem bảng giá đầy đủ".
   - Thêm mục "Nâng cấp" vào `DesktopSidebar` với active-state đúng qua `lib/navPaths.ts`
     (hạ tầng đã tạo ở đợt 1).
   - `Writing.tsx`: bố cục 2 cột desktop (soạn bài trái | kết quả chấm phải, `sticky` +
     `max-h` + `overflow-y-auto` theo mẫu `Dashboard.tsx`/`CefrLevelPage.tsx`); mobile giữ
     nguyên thứ tự dọc cũ.
2. `feat(ui)` **Home + Speaking 2 cột desktop**:
   - `Home.tsx`: cột trái là luồng thao tác chính (FirstTaskCard, AI briefing, AI bar,
     "Các Không Gian & Bộ Môn", hero Companion), cột phải sticky là ngữ cảnh (Reward tip,
     Tiến độ/Lịch sử, khuyến mãi) — dùng `useIsDesktopViewport()`, KHÔNG nhân đôi DOM bằng
     `lg:hidden` (tránh selector trùng cho Playwright/screen reader, đúng lý do đã ghi trong
     comment `Chat.tsx`).
   - `Speaking.tsx`: thêm `SpeakFeedbackPanel` cột phải gom lời sửa lỗi/giải thích trong
     phiên (mẫu `FeedbackPanel` của `Chat.tsx`), cột trái là khung hội thoại + nút mic. Giữ
     nguyên xử lý `visualViewport`/bàn phím ảo và `tap-44` đã làm ở đợt 2.

## Kiểm chứng trên trình duyệt thật (2 lượt, Chromium)

- **Lượt 1** (Writing + Pricing): 0 tràn ngang cả 2 viewport, bảng giá so sánh được 4 gói
  trên desktop, link Profile → `/nang-cap` hoạt động, active-state sidebar đúng. 1 điểm 🟡:
  cột phải Writing ngắn hơn cột trái, để trống khoảng lớn phía dưới (thẩm mỹ, không vỡ layout).
- **Lượt 2** (Home + Speaking): 0 tràn ngang ở Home cả 2 viewport; Speaking desktop cột phải
  đúng vị trí, không đè mic bar; bàn phím ảo mobile (giả lập viewport co lại) không che khung
  chat — cơ chế đợt 2 hoạt động đúng. **Phát hiện 1 bug có sẵn NGOÀI PHẠM VI**: header mobile
  (`Layout.tsx`) tràn ngang 54px khi trang vừa có `subtitle` vừa có streak > 0 (lộ ra ở màn
  hội thoại Speaking) — xác nhận qua `git log` không thuộc các PR audit gần đây, đã tạo task
  riêng theo dõi, KHÔNG sửa lẫn vào đợt này.

## Bằng chứng

- `npm run typecheck` ✅ 4 project · `npm run lint` ✅ 0 cảnh báo ·
  `npx vitest run` ✅ 512 file / 8718 test · `npm run build` ✅ (dhcb + server + hub) ·
  `npm run budget` ✅ JS 127,11/140kB (90,8%), CSS 16,76/18kB (93,1%) — CSS ngày càng sát trần,
  cần cân nhắc dọn ở đợt sau nếu còn thêm UI mới.

## Trạng thái audit UI/UX desktop + mobile 2026-08-31

Cả 3 đợt (10 phát hiện 🔴 + toàn bộ mục B8/B9 của 🟡) đã xong: #760, #763, và PR đợt 3 này.
Còn lại việc nhỏ lẻ chưa làm (không chặn, xem báo cáo gốc mục B/C): dọn `transition-all` còn
sót ở vài file phụ, phân trang thêm cho vài danh sách nhỏ, và bug `Layout.tsx` mới phát hiện
(đã có task riêng). Coi audit là **khép kín cơ bản** — các việc còn lại là cải tiến liên tục,
không phải nợ do đợt audit này để lại.
