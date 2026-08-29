# Đặc tả — URL bài học có chuỗi mô tả (slug SEO)

## 0. Một câu

Thêm chuỗi mô tả (slug) lấy từ tiêu đề vào URL của Truyện song ngữ và Bài học lập trình, để
Google hiểu nội dung trang tốt hơn và tăng lượng truy cập tìm kiếm.

## ① Phạm vi

**LÀM:**

- Viết hàm `slugify()` (bỏ dấu tiếng Việt, hạ chữ thường) + `buildSlugSegment(id, title)` /
  `idFromSlugSegment(segment)` để ghép/tách `id--slug-mo-ta`.
- Áp dụng cho `/truyen-song-ngu/:id` (Truyện song ngữ) và `/lap-trinh/bai-hoc/:lessonId`
  (Bài học lập trình) — 2 route có tiêu đề bài học rõ ràng, lợi ích SEO cao nhất.
- Cập nhật mọi nơi tạo link tới 2 route trên để tự sinh URL kèm slug.
- Giữ tương thích ngược: URL cũ (chỉ có id, không có `--slug`) vẫn vào đúng bài.
- Tự chuyển hướng (redirect, không reload trang) về URL chuẩn khi mở URL cũ hoặc slug không
  khớp tiêu đề hiện tại — tránh trùng lặp nội dung trong mắt Google.

**KHÔNG LÀM (quyết định 2026-08-29):**

- Không đổi `/lo-trinh-hoc/:levelId` (CEFR A1–C2) — id đã đủ ngắn gọn (`A1`…`C2`), thêm slug
  không có lợi rõ rệt.
- Không đổi định nghĩa route (vẫn 1 segment động mỗi route) — tách id/slug nằm ở phía đọc,
  không phải router.
- Không cập nhật sitemap tĩnh (`apps/dhcb/public/sitemap*.xml`) — hiện chỉ phủ từ điển, chưa
  phủ truyện/bài lập trình; để đợt sau nếu cần.

## ② Điểm chạm

| Việc | Đường dẫn file                                                       | Ghi chú                                            |
| ---- | -------------------------------------------------------------------- | -------------------------------------------------- |
| Thêm | `packages/core-ui/slug.ts`                                           | `slugify`, `buildSlugSegment`, `idFromSlugSegment` |
| Thêm | `packages/core-ui/slug.test.ts`                                      | test slugify + ca biên id trùng tiền tố            |
| Sửa  | `apps/dhcb/src/pages/subjects/programming/ProgrammingLessonPage.tsx` | tách id khỏi param, canonical redirect             |
| Sửa  | `apps/dhcb/src/pages/subjects/programming/ProgrammingHome.tsx`       | build link có slug                                 |
| Sửa  | `apps/dhcb/src/pages/subjects/programming/ProgrammingLevelPage.tsx`  | build link có slug                                 |
| Sửa  | `apps/dhcb/src/pages/subjects/programming/ProgrammingReview.tsx`     | build link có slug (tra `getLesson`)               |
| Sửa  | `apps/dhcb/src/pages/subjects/english/Stories.tsx`                   | build link có slug                                 |
| Sửa  | `apps/dhcb/src/pages/subjects/english/StoryReader.tsx`               | tách id khỏi param, canonical redirect             |

**Ảnh hưởng lan ra (theo codemap):** chỉ các file trên — route path trong `App.tsx` không đổi
nên không lan ra chỗ khác; canonical `<link>` trong `App.tsx` tự đọc `pathname` hiện tại, không
cần sửa.

## ③ Hợp đồng dữ liệu

**Vào:** `id: string` (id gốc có sẵn của lesson/story), `title: string` (tiêu đề hiển thị).

**Ra:** `buildSlugSegment(id, title)` → `string` dạng `${id}` (nếu title rỗng/không slug hoá
được) hoặc `${id}--${slug}`. `idFromSlugSegment(segment)` → `string` là phần trước `--` đầu
tiên, hoặc nguyên `segment` nếu không có `--`.

**Ca lỗi:**

| Tình huống                        | Mã lỗi | Hành vi mong đợi                                                |
| --------------------------------- | ------ | --------------------------------------------------------------- |
| Tiêu đề toàn ký tự đặc biệt/emoji | —      | slug rỗng → giữ nguyên id, không thêm `--`                      |
| URL segment không khớp lesson nào | —      | trang hiện có sẵn (`Navigate` về trang cha, không phải lỗi mới) |

## ④ Tiêu chí chấp nhận

- [x] URL cũ chỉ có id vẫn mở đúng bài — `idFromSlugSegment` trả nguyên id khi không có `--`.
- [x] id có tiền tố trùng nhau (`p1-u1-l1` / `p1-u1-l10`) tách đúng, không lẫn — test canh ở
      `slug.test.ts`.
- [x] Mở URL cũ/slug sai → tự chuyển về URL chuẩn có slug đúng tiêu đề hiện tại.
- [x] `npm run typecheck && npm run lint && npx vitest run && npm run build` đều xanh.

**Lệnh chứng minh:**

```bash
npm run typecheck && npm run lint && npx vitest run && npm run build && npm run budget
```

## ⑤ Bất biến không được phá

| Bất biến                                            | Test nào canh nó                |
| --------------------------------------------------- | ------------------------------- |
| URL bài học cũ (chỉ id) vẫn vào đúng bài, không 404 | `packages/core-ui/slug.test.ts` |
| id có gạch ngang nội bộ không bị tách nhầm slug     | `packages/core-ui/slug.test.ts` |

## ⑥ Quy ước dự án liên quan

- Import xuyên gói dùng `@dhcb/<gói>/<file>` không đuôi `.js`; `@core/*` trỏ tới
  `packages/core-ui/*` qua alias Vite/tsconfig (dùng cho `apps/dhcb`, không dùng trong gói
  build backend như `subject-programming`).
- Không hard-code màu/route lạ — route giữ nguyên định nghĩa cũ trong `App.tsx`.

---

## Nghiệm thu

- Lệnh đã chạy: `npm run typecheck` ✅ · `npm run lint` ✅ (0 cảnh báo) · `npx vitest run` ✅
  (503 file, 7683 test) · `npm run build` ✅ · `npm run budget` ✅ (JS 125,27/140 kB, CSS
  16,33/18 kB).
- Tiêu chí ④ đạt hết.
- Không phá bất biến ⑤.
- Không mở rộng ngoài phạm vi ①.
- Còn để ngỏ: sitemap tĩnh chưa phủ truyện/bài lập trình (nêu ở mục KHÔNG LÀM).

**Trạng thái duyệt: Approved for implementation** (người dùng chốt phạm vi "cả hai" nơi qua
AskUserQuestion trong phiên làm việc 2026-08-29).
