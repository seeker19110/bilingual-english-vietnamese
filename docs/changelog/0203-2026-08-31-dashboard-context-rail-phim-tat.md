# 0203 — Cột ngữ cảnh Dashboard + phím tắt desktop (PR 4)

PR 4, đợt cuối trong loạt "thiết kế lại web cho desktop" (PR 1+2 `#743`, PR 3 `#750`, đều đã
merge). Hai việc độc lập, gộp chung 1 PR vì đều nhỏ và cùng phạm vi "desktop":

## Đã làm

1. **Cột ngữ cảnh phải ở Dashboard (`/tien-do`)** — `apps/dhcb/src/pages/core/Dashboard.tsx`:
   ở `≥1024px`, "Streak + biểu đồ 7 ngày", "Mục tiêu tuần" và `QuickActions` dời sang cột phải
   cố định (`sticky top-20`), cột trái còn lại là các phần chi tiết (Lịch hoạt động, Hôm nay,
   Từ vựng, Sổ lỗi, Lộ trình CEFR, Điểm IELTS, Tổng kết). Mobile/tablet giữ nguyên thứ tự 1 cột
   như cũ. Cài bằng cách tách 3 khối JSX (`streakSection`, `weeklyGoalSection`, `restSections`)
   thành biến, ghép khác nhau theo `isDesktop` — 2 nhánh loại trừ nhau nên không có rủi ro trùng
   nội dung DOM (bài học từ PR 1+2, xem changelog `0199`).
2. **Phím tắt toàn cục** — `apps/dhcb/src/components/Layout.tsx` (render ở mọi trang, gắn 1 lần
   duy nhất):
   - `⌘K` / `Ctrl+K` — mở/đóng Studio switcher (dropdown 6 studio có sẵn ở header).
   - `/` — focus ô nhập (input/textarea) đầu tiên còn hiện trên trang; bỏ qua khi đang gõ sẵn
     trong ô nhập khác (không chặn gõ dấu `/` thật trong nội dung).
   - Thêm `aria-keyshortcuts` + cập nhật `aria-label`/`title` nút Studio switcher (`(⌘K)`).
   - KHÔNG gate theo `isDesktop` — phím tắt không có rủi ro trùng DOM, và bàn phím vật lý vẫn
     có thể gắn với tablet/di động.

## KHÔNG LÀM

- Không đổi cột ngữ cảnh cho Kanban/LifeGraph (spec ban đầu có nhắc nhưng người dùng chỉ yêu
  cầu "Dashboard + phím tắt" cho PR 4 — để dành nếu cần sau).
- Không thêm command palette đầy đủ (tìm kiếm mờ, điều hướng bằng bàn phím trong danh sách) —
  `⌘K` chỉ mở lại đúng Studio switcher đã có, không phải tính năng mới.

## Bằng chứng kiểm chứng

```
Build ✅ | Type ✅ | Lint ✅ (0 cảnh báo) | Test ✅ (8007/8007)
Budget: JS 126.60/140kB (90.4%) | CSS 16.53/18kB (91.8%)
E2E full suite (24 spec, 651 test) ✅
```
