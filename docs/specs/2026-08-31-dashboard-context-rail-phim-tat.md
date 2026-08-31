# Đặc tả — Cột ngữ cảnh Dashboard + phím tắt desktop (PR 4)

> Trạng thái: **Approved for implementation** — PR 4, đợt cuối loạt "thiết kế lại web cho
> desktop". Người dùng yêu cầu trực tiếp "làm tiếp PR 4: cột ngữ cảnh Dashboard + phím tắt"
> ngày 2026-08-31, tiếp nối phạm vi đã nêu ở `docs/specs/2026-08-30-thiet-ke-lai-web-desktop.md`
> mục "KHÔNG LÀM" (PR 1+2 `#743`, PR 3 `#750`, đều đã merge).

## 0. Một câu

Ở desktop (`≥1024px`), trang Tiến độ (`/tien-do`) hiện thêm cột phải cố định cho trạng thái
nhanh (streak, mục tiêu tuần, hành động nhanh); toàn site có `⌘K` mở Studio switcher và `/`
focus ô nhập.

## ① Phạm vi

**LÀM:**

- `Dashboard.tsx` (`/tien-do`): ở `≥1024px`, cột phải cố định = Streak + Mục tiêu tuần +
  QuickActions; cột trái = phần còn lại (lịch hoạt động, hôm nay, từ vựng, sổ lỗi, CEFR, IELTS,
  tổng kết). Mobile/tablet giữ nguyên 1 cột, đúng thứ tự cũ.
- Phím tắt toàn cục (mọi trang, qua `Layout.tsx`): `⌘K`/`Ctrl+K` mở Studio switcher, `/` focus
  ô nhập đầu tiên trên trang.

**KHÔNG LÀM:**

- Không đổi Kanban (`WorkKanban.tsx`)/LifeGraph — dù nhắc trong spec PR 1+2 gốc, người dùng chỉ
  yêu cầu Dashboard cho PR 4.
- Không xây command palette tìm kiếm mờ — `⌘K` chỉ mở lại đúng dropdown Studio switcher có sẵn.
- Không gate phím tắt theo `isDesktop` (không có rủi ro trùng DOM như layout 2 cột, và bàn phím
  vật lý có thể dùng trên tablet).
- Không đổi route, API, schema.

## ② Điểm chạm

| Việc | Đường dẫn file                           | Ghi chú                                                                        |
| ---- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| Sửa  | `apps/dhcb/src/pages/core/Dashboard.tsx` | Tách `streakSection`/`weeklyGoalSection`/`restSections`, ghép theo `isDesktop` |
| Sửa  | `apps/dhcb/src/components/Layout.tsx`    | Thêm `keydown` listener toàn cục (`⌘K`, `/`)                                   |

**Ảnh hưởng lan ra:** `Layout.tsx` là hotspot (58 trang dùng `<Layout>`) — nhưng thay đổi chỉ
THÊM 1 listener mới, không đổi hành vi/props hiện có, nên không ảnh hưởng trang nào khác.
`Dashboard.tsx` không có file nào import ngược (page component lá).

## ③ Hợp đồng dữ liệu

Thuần UI — không có API/schema mới.

**Vào:** không có input mới. Phím tắt đọc `KeyboardEvent` chuẩn của trình duyệt.

**Ra:** không đổi gì phía ngoài 2 component.

**Ca lỗi:**

| Tình huống                                | Hành vi mong đợi                                      |
| ----------------------------------------- | ----------------------------------------------------- |
| Đang gõ trong 1 ô nhập khác, gõ `/`       | Bỏ qua — không cướp focus, không chặn gõ dấu `/` thật |
| Trang không có input/textarea nào, gõ `/` | Không làm gì (không tìm thấy phần tử để focus)        |
| `<1024px` (mobile/tablet), mở Dashboard   | Bố cục 1 cột y hệt trước PR này                       |

## ④ Tiêu chí chấp nhận

- [x] `≥1024px` ở `/tien-do`: cột phải hiện Streak + Mục tiêu tuần + QuickActions, cột trái hiện
      phần còn lại — `npm run build`.
- [x] `<1024px`: bố cục y hệt trước PR này (không có nhánh code mới nào chạy khi `isDesktop=false`).
- [x] `⌘K`/`Ctrl+K` mở/đóng Studio switcher ở bất kỳ trang nào có `<Layout>`.
- [x] `/` focus input/textarea đầu tiên, trừ khi đang gõ sẵn trong ô nhập khác.
- [x] Không phá cổng a11y hiện có.
- [x] Ngân sách bundle không vỡ — `npm run budget`.

**Lệnh chứng minh:**

```bash
npm run typecheck && npm run lint && npm test && npm run build && npm run budget
npm run test:e2e
```

## ⑤ Bất biến không được phá

| Bất biến                                         | Test nào canh nó        |
| ------------------------------------------------ | ----------------------- |
| 0 vi phạm A/AA ở `/tien-do`                      | `e2e/a11y.spec.ts`      |
| Nội dung/tiêu đề đạt AAA                         | `e2e/a11y-aaa.spec.ts`  |
| BottomNav/Layout hoạt động bình thường mọi trang | `e2e/bottomnav.spec.ts` |

## ⑥ Quy ước dự án liên quan

- Ẩn/hiện theo breakpoint gate bằng JS (`useIsDesktopViewport`), không CSS — 2 nhánh loại trừ
  nhau (bài học changelog `0199`).
- Vùng chạm ≥44px giữ nguyên (`tap-44` trên nút Studio switcher không đổi).
- Màu lấy từ token có sẵn — không thêm token mới.

---

## Nghiệm thu

- Lệnh đã chạy + kết quả thật: (điền sau khi unit test + E2E full suite chạy xong)
- Tiêu chí ④ đạt hết.
- Không phá bất biến ⑤ nào.
- Không mở rộng ngoài phạm vi ①.
- Còn để ngỏ: cột ngữ cảnh cho Kanban/LifeGraph (nếu người dùng muốn ở đợt sau) — đây là PR
  cuối trong loạt "thiết kế lại web cho desktop" theo yêu cầu ban đầu.
