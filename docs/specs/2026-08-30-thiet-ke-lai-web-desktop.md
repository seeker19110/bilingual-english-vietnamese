# Đặc tả — Thiết kế lại web cho desktop (sidebar + Chat hai cột)

> Trạng thái: **Approved for implementation** — người dùng chốt phạm vi và kiểu điều hướng
> qua 2 câu hỏi trực tiếp trong phiên làm việc 2026-08-30 (chọn "PR 1 + 2 (shell + Chat/Speaking
> hai cột)" và "Sidebar thu gọn được (icon-only)"), rồi xác nhận tạo PR khi E2E xanh.

## 0. Một câu

Đổi web từ "app mobile phóng to" (BottomNav ở đáy, dropdown Studio, `max-w-3xl` mọi kích
thước) sang bố cục có sidebar cố định + nội dung rộng hơn ở màn `≥1024px`, cho người dùng
desktop — không đổi gì ở mobile/tablet.

## ① Phạm vi

**LÀM:**

- Sidebar trái cố định ở `≥1024px` (`lg:`), liệt kê thẳng 6 Studio + Trang chủ/Tiến độ/Hồ sơ,
  thu gọn được (icon-only), nhớ trạng thái qua `localStorage`.
- Ẩn BottomNav ở `lg:` (giữ nguyên dưới ngưỡng đó).
- Nới độ rộng nội dung header/trang ở `lg:` (`max-w-3xl` → `max-w-3xl lg:max-w-5xl`).
- Trang Chat (gia sư AI): thêm cột "Sửa lỗi & giải thích" ghim bên phải ở `lg:`, gom lời
  sửa/giải thích của cả phiên kèm câu gốc.

**KHÔNG LÀM (để dành đợt sau, đúng như đã trình bày và người dùng đồng ý):**

- CefrLevelPage master–detail (danh sách unit trái/nội dung phải).
- Cột ngữ cảnh phải ở Dashboard/Kanban/LifeGraph, lưới nhiều cột hơn ở các trang đó.
- Phím tắt (`⌘K` mở Studio switcher, `/` focus ô nhập).
- KHÔNG đụng route, logic nghiệp vụ, API, hay bất kỳ trang nào ngoài `Chat.tsx` + vỏ ứng dụng
  (`Layout.tsx`, `BottomNav.tsx`, `App.tsx`, `index.css`).
- KHÔNG đổi màu/token — vẫn dùng nguyên `--a-*`/`--z-*` sẵn có.

## ② Điểm chạm

| Việc | Đường dẫn file                                  | Ghi chú                                          |
| ---- | ----------------------------------------------- | ------------------------------------------------ |
| Thêm | `apps/dhcb/src/lib/studios.ts`                  | Danh sách 6 Studio dùng chung                    |
| Thêm | `apps/dhcb/src/components/DesktopSidebar.tsx`   | Sidebar desktop, thu gọn được                    |
| Thêm | `apps/dhcb/src/lib/useIsDesktopViewport.ts`     | `matchMedia` — gate JS, không dùng CSS ẩn        |
| Sửa  | `apps/dhcb/src/components/Layout.tsx`           | Dùng lại `STUDIOS` chung, nới `max-w`            |
| Sửa  | `apps/dhcb/src/components/BottomNav.tsx`        | Thêm `lg:hidden`                                 |
| Sửa  | `apps/dhcb/src/App.tsx`                         | Gắn `DesktopSidebar`, `lg:pl-[var(--sidebar-w)]` |
| Sửa  | `apps/dhcb/src/index.css`                       | Biến `--sidebar-w`, zero `--bnav-h` ở `lg:`      |
| Sửa  | `apps/dhcb/src/pages/subjects/english/Chat.tsx` | `FeedbackPanel`/`FeedbackBlock` desktop          |

**Ảnh hưởng lan ra (theo review thủ công — `Layout.tsx`/`Chat.tsx` là hotspot, 58 trang dùng
`<Layout>`):** mọi trang có `<Layout>` (58 file) được nới `max-w` header; `BottomNav` được 63
trang dùng biến `--bnav-h` để chừa padding-bottom — biến này về `0px` ở `lg:` nên các trang đó
tự nhả khoảng trống thừa ở desktop, không cần sửa từng trang.

## ③ Hợp đồng dữ liệu

Đây là thay đổi thuần UI/bố cục — không có API/schema mới. "Hợp đồng" ở đây là bất biến CSS:

**Vào:** không có input dữ liệu mới. `DesktopSidebar` đọc `user` (context), `location.pathname`
(router); state nội bộ `collapsed: boolean` (nguồn: `localStorage['ui_sidebar_collapsed']`).

**Ra:** thuộc tính `data-sidebar` trên `<html>` (`'off' | 'collapsed' | 'expanded'`) — nguồn sự
thật DUY NHẤT cho biến CSS `--sidebar-w` mà mọi trang khác đọc qua `lg:pl-[var(--sidebar-w)]`.

**Ca lỗi:**

| Tình huống                        | Hành vi mong đợi                                                        |
| --------------------------------- | ----------------------------------------------------------------------- |
| `localStorage` bị chặn (riêng tư) | Coi như đang mở rộng (`collapsed=false`), không vỡ trang                |
| Chưa đăng nhập / đang ở `/login`  | Sidebar không render (giống `BottomNav`, dùng chung `NAV_HIDDEN_PATHS`) |

## ④ Tiêu chí chấp nhận

- [x] `≥1024px`: sidebar hiện, BottomNav ẩn; `<1024px`: ngược lại — kiểm bằng `npm run test:e2e`
      (Playwright mặc định Desktop Chrome viewport, `e2e/bottomnav.spec.ts` chạy ở khổ 390×844).
- [x] Sidebar thu gọn/mở rộng đổi `--sidebar-w`, không làm vỡ layout trang nào — `npm run build`.
- [x] Chat desktop: lời sửa/giải thích xuất hiện ĐÚNG MỘT LẦN trong DOM (không lặp giữa Bubble
      và FeedbackPanel) — canh bởi `e2e/a11y.spec.ts` "Chat (kết quả AI)" ×5 theme (strict-mode
      `getByText` của Playwright bắt lỗi trùng DOM ngay cả khi ẩn bằng CSS).
- [x] 0 vi phạm A/AA ở 15 trang × 5 theme — `npm run test:e2e -- e2e/a11y.spec.ts`.
- [x] Ngân sách bundle không vỡ — `npm run budget`.

**Lệnh chứng minh:**

```bash
npm run typecheck && npm run lint && npm test && npm run build && npm run budget
npm run test:e2e
```

## ⑤ Bất biến không được phá

| Bất biến                                                       | Test nào canh nó                                               |
| -------------------------------------------------------------- | -------------------------------------------------------------- |
| BottomNav hiện đủ 5 mục ở mobile, ẩn ở `/login`/`/onboarding`  | `e2e/bottomnav.spec.ts`                                        |
| 0 vi phạm A/AA ở 15 trang × 5 theme                            | `e2e/a11y.spec.ts`                                             |
| Nội dung/tiêu đề đạt AAA                                       | `e2e/a11y-aaa.spec.ts`                                         |
| Vote 👍👎 nhận xét AI hoạt động (mục ⑤ T3, `tutorFeedback.ts`) | Đã kiểm thủ công qua `FeedbackBlock` dùng chung mobile/desktop |

## ⑥ Quy ước dự án liên quan

- Màu lấy từ token `--a-*`/`--z-*`, không hard-code — sidebar mới dùng lại đúng bảng màu
  `zinc-*`/`accent-*` đã có, không thêm token mới.
- Vùng chạm ≥44px (`tap-44`) — nút thu gọn/mở rộng sidebar giữ class này.
- Ẩn bằng CSS (`hidden`/`lg:hidden`) KHÔNG xoá phần tử khỏi DOM — nội dung TRÙNG NHAU ở hai
  breakpoint phải gate bằng JS (`useIsDesktopViewport`), không phải class Tailwind, nếu không
  trình đọc màn hình sẽ đọc lặp (bài học rút ra ngay trong đợt này, xem changelog `0199`).

---

## Nghiệm thu

- Lệnh đã chạy + kết quả thật: `npm run typecheck` ✅ · `npm run lint` ✅ (0 cảnh báo) ·
  `npm test` ✅ (7729/7729) · `npm run build` ✅ · `npm run budget` ✅ (JS 90.4%, CSS 91.3%) ·
  `npm run test:e2e` ✅ (634/634, toàn bộ 24 spec — chi tiết ở changelog `0199`).
- Tiêu chí ④ đạt hết.
- Không phá bất biến ⑤ nào — bản đầu có phá (trùng nội dung Chat ở desktop), đã sửa và xác
  nhận lại bằng chính test canh nó trước khi merge.
- Không mở rộng ngoài phạm vi ①.
- Còn để ngỏ: CefrLevelPage master–detail, cột ngữ cảnh Dashboard, phím tắt — nêu rõ ở mục
  "KHÔNG LÀM", để đợt sau.
