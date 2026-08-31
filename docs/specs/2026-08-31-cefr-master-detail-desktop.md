# Đặc tả — CefrLevelPage master–detail cho desktop (PR 3)

> Trạng thái: **Approved for implementation** — PR 3 trong loạt "thiết kế lại web cho desktop"
> mà người dùng đã chốt phạm vi ("PR 1 + 2 (shell + Chat/Speaking hai cột)" rồi làm tiếp PR 3+4
> — đã nêu rõ trong `docs/specs/2026-08-30-thiet-ke-lai-web-desktop.md` mục "KHÔNG LÀM"), người
> dùng yêu cầu trực tiếp "làm tiếp PR 3: CefrLevelPage master–detail" ngày 2026-08-31.

## 0. Một câu

Ở desktop (`≥1024px`), mở 1 bài học/từ vựng/hội thoại trong trang cấp CEFR hiện thêm cột danh
sách unit bên trái để chọn mục tiếp theo ngay, không phải quay lại danh sách trước.

## ① Phạm vi

**LÀM:**

- Trang `/lo-trinh-hoc/<cấp>` (`CefrLevelPage.tsx`): khi mở màn con (flashcard từ vựng / bài
  ngữ pháp / hội thoại) ở `≥1024px`, hiện cột trái = danh sách unit rút gọn, cột phải = màn con.
- Bấm mục khác ở cột trái đổi cột phải ngay, giữ nguyên trang.

**KHÔNG LÀM:**

- Không đổi trang danh sách cấp `/lo-trinh-hoc` (6 cấp).
- Không đổi màn thi cuối cấp (`examing`) — giữ toàn màn hình mọi kích thước màn hình, kể cả
  desktop (bài thi cần tập trung, không có "mục khác" để chọn giữa chừng).
- Không đổi hành vi mobile/tablet (`<1024px`) — y hệt trước PR này.
- Không đổi `UnitSection`, không thêm state "đang chọn" (highlight) trong cột trái.
- Không đổi route, API, schema.

## ② Điểm chạm

| Việc | Đường dẫn file                                           | Ghi chú                                                          |
| ---- | -------------------------------------------------------- | ---------------------------------------------------------------- |
| Sửa  | `apps/dhcb/src/pages/subjects/english/CefrLevelPage.tsx` | `masterList` + `shell()` nhận `master`, hoist `unitLessonStarts` |

**Ảnh hưởng lan ra:** không lan ra ngoài file này — `UnitSection` (component con cùng file) chỉ
được gọi thêm 1 lần nữa với cùng props, không đổi chữ ký hay hành vi của nó.

## ③ Hợp đồng dữ liệu

Thuần UI — không có API/schema mới.

**Vào:** `shell(children, headerBack?, master?)` — `master` là `React.ReactNode` tuỳ chọn.

**Ra:** không đổi gì phía ngoài component.

**Ca lỗi:**

| Tình huống                | Hành vi mong đợi                                               |
| ------------------------- | -------------------------------------------------------------- |
| Cấp đang khóa (`locked`)  | `masterList` là `null` — không hiện cột trái dù đang ở desktop |
| `<1024px` (mobile/tablet) | `shell()` bỏ qua `master`, render y hệt trước PR này           |

## ④ Tiêu chí chấp nhận

- [x] `≥1024px` + đang mở màn con: hiện 2 cột, cột trái là danh sách unit — `npm run build`.
- [x] `<1024px`: không đổi gì so với trước — không có nhánh code mới chạy khi `isDesktop=false`.
- [x] Bấm mục khác trong cột trái đổi cột phải, không rời trang — dùng lại đúng
      `setLesson`/`setCircle`/`openDialogue` đã có, không thêm logic điều hướng mới.
- [x] Không phá cổng a11y hiện có ở `/lo-trinh-hoc/a1` (`e2e/a11y.spec.ts`).
- [x] Ngân sách bundle không vỡ — `npm run budget`.

**Lệnh chứng minh:**

```bash
npm run typecheck && npm run lint && npm test && npm run build && npm run budget
npm run test:e2e
```

## ⑤ Bất biến không được phá

| Bất biến                                                | Test nào canh nó        |
| ------------------------------------------------------- | ----------------------- |
| 0 vi phạm A/AA ở `/lo-trinh-hoc/a1`, `/lo-trinh-hoc/c1` | `e2e/a11y.spec.ts`      |
| Tab "Nghe" ở trang cấp vẫn hoạt động                    | `e2e/listening.spec.ts` |
| Nội dung/tiêu đề đạt AAA                                | `e2e/a11y-aaa.spec.ts`  |

## ⑥ Quy ước dự án liên quan

- Ẩn/hiện theo breakpoint phải gate bằng JS (`useIsDesktopViewport`), không phải class Tailwind
  — bài học từ PR 1+2 (changelog `0199`): ẩn bằng CSS vẫn để nội dung trùng trong DOM. Ở đây
  không có rủi ro trùng nội dung (2 nhánh JSX loại trừ nhau — mobile không render `master`, và
  bản thân `masterList` chỉ được nhúng vào cây render khi thực sự cần), nhưng vẫn theo đúng
  quy ước gate-bằng-JS cho nhất quán.
- Màu lấy từ token có sẵn — không thêm token mới.

---

## Nghiệm thu

- Lệnh đã chạy + kết quả thật: `npm run typecheck` ✅ · `npm run lint` ✅ (0 cảnh báo) ·
  `npm test` ✅ (7897/7897) · `npm run build` ✅ · `npm run budget` ✅ (JS 90.3%/140kB, CSS
  91.6%/18kB) · `npm run test:e2e` ✅ (648/648, toàn bộ 24 spec — không có test flaky nào ở
  lượt này, kể cả 3 test `programming-lesson.spec.ts` từng flaky ở PR trước).
- Tiêu chí ④ đạt hết.
- Không phá bất biến ⑤ nào.
- Không mở rộng ngoài phạm vi ①.
- Còn để ngỏ: PR 4 (cột ngữ cảnh Dashboard/Kanban, phím tắt `⌘K`/`/`).
