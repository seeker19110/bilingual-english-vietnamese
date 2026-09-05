# Đặc tả — Thiết kế lại UI/UX desktop cho các trang giáo dục

Ngày: 2026-09-05 · Trạng thái: **Approved for implementation** (người dùng chốt trực tiếp trong phiên)

## 1. Vấn đề

Vỏ desktop (sidebar trái, breadcrumb, ⌘K, chế độ tập trung, `PageShell`/`TwoPane`/`TocRail`) đã
được làm lại ở các đợt 2026-09-02 và 2026-09-03. Nhưng **thân các trang học** thì chưa: chúng vẫn
là màn hình mobile phóng to.

Đo thật ở 1280px trước khi sửa:

- `Lessons.tsx` (bài hội thoại) dùng luồng **danh sách → thay thế toàn màn hình** bằng chi tiết.
  Đây là khuôn mẫu của điện thoại, nơi không đủ chỗ cho hai thứ cùng lúc. Trên desktop nó có hai
  cái giá: (a) muốn đổi bài phải quay lại danh sách rồi cuộn tìm lại từ đầu; (b) màn chi tiết là
  một cột `max-w-3xl` giữa màn hình, hai bên bỏ trống.
- `StoryReader.tsx` (đọc truyện) đặt thanh điều khiển audio **trong luồng cuộn**. Truyện dài vài
  màn hình, nên đọc tới đoạn 3 là nút Tạm dừng/Dừng/Hiện bản dịch đã trôi khỏi tầm mắt — đúng lúc
  người đọc cần chúng nhất.

## 2. Phạm vi

Chuỗi **3 đợt PR nối tiếp**, mỗi đợt một PR có cổng riêng:

| Đợt | Nhóm trang                | Nội dung                                                                             |
| --- | ------------------------- | ------------------------------------------------------------------------------------ |
| 1   | Trang HỌC bài             | `Lessons.tsx` → master–detail; `StoryReader.tsx` → cột phụ điều khiển + mục lục đoạn |
| 2   | Trang TỔNG QUAN môn       | `EnglishHome`, `Subjects`, `SubjectDetail`, `RoadmapTab`                             |
| 3   | Trang LUYỆN TẬP tương tác | `Speaking`, `Writing`, `Chat`, `Listening`                                           |

**KHÔNG làm** trong cả ba đợt:

- Không đổi bất cứ thứ gì **dưới 1024px**. Mọi nhánh mới đi qua `useIsDesktopViewport()`.
- Không đổi route, không đổi schema, không đụng logic gọi AI/đếm lượt.
- Không đổi token màu — bố cục dùng lại token `--a-*`/`--z-*` sẵn có.

## 3. Đợt 1 — hợp đồng

### 3.1 `Lessons.tsx` — master–detail ở desktop

- ≥1024px dựng **một** màn hình: `TwoPane railSide="left"`, cột trái là danh sách bài (ô tìm
  kiếm + gợi ý "Tiếp tục" + danh sách một cột có tô đậm bài đang mở), cột phải là nội dung bài.
- Chưa chọn bài → cột phải hiện màn hình rỗng mời chọn bài, KHÔNG tự chọn thay người dùng.
- `LessonView` nhận prop `variant`: `mobile` giữ nguyên khuôn cũ (cột dọc chiếm hết chiều cao,
  cuộn nội bộ); `desktop` bỏ cuộn nội bộ, thanh điều khiển audio thành `sticky` bám dưới header,
  và bỏ nút "← Danh sách" (danh sách đã hiện sẵn bên trái).
- `LessonList` nhận `compact` (một cột, thẻ gọn cho bề rộng rail) và `selectedId` (tô đậm).
- Dưới 1024px: **không đổi một pixel nào** — vẫn hai màn hình như cũ.

### 3.2 `StoryReader.tsx` — cột phụ ở desktop

- ≥1024px: `TwoPane` cột phải chứa thanh điều khiển audio (phát Việt/Anh, tạm dừng, dừng, hiện
  bản dịch) + mục lục đoạn cho biết đang đọc/đang phát tới đoạn nào.
- Cột phải là `sticky` (đã có sẵn trong `TwoPane`), nên điều khiển luôn trong tầm mắt.
- Dưới 1024px: giữ nguyên thanh điều khiển trong luồng cuộn như cũ.

## 4. Tiêu chí chấp nhận (đo được)

1. Ở 1280px, `/bai-hoc`: danh sách và nội dung bài hiện **đồng thời**; bấm một bài khác ở cột
   trái thì cột phải đổi mà không rời trang.
2. Ở 390px, `/bai-hoc` và `/truyen/:id`: DOM và class giống hệt trước khi sửa (kiểm bằng ảnh chụp
   trước/sau và bằng việc mọi nhánh mới nằm sau `isDesktop`).
3. Không có nội dung nào bị dựng hai lần trong DOM (luật của `TwoPane`): nhánh desktop/mobile
   quyết ở JS, không dùng `lg:hidden`.
4. Hai cổng a11y `e2e/a11y.spec.ts` (AA, 0 vi phạm) và `e2e/a11y-aaa.spec.ts` (AAA cho nội dung)
   xanh trên cả 15 trang × 5 theme.
5. Toàn bộ cổng commit của mục 8 CLAUDE.md xanh.

## 5. Bất biến + test canh

- `e2e/continue-viewing.spec.ts` cập nhật cho luồng master–detail (chạy ở 1280px): gợi ý "Tiếp
  tục" phải tự đổi từ "Bài 1" sang "Bài 2" ngay sau khi mở bài 1, **không cần** quay lại danh sách.
- `TwoPane` nhận `isDesktop` từ ngoài — cấm tự đo bên trong (luật phụ thuộc `packages/` ⊅ `apps/`).

## 6. Quy ước dự án áp dụng

Mục 4 (a11y AA/AAA, mobile-first, token màu), mục 7 (comment tiếng Việt ở chỗ quan trọng),
mục 8 (cổng trước commit), mục 11 (conventional commits — đợt này là `refactor`, không phải `feat`,
vì không thêm năng lực nghiệp vụ mới).
