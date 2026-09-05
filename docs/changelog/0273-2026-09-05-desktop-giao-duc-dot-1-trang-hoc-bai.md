# 0273 — 2026-09-05 — Desktop giáo dục đợt 1: trang học bài thành master–detail

PR: (điền khi tạo) · Nhánh: `claude/redesign-education-desktop-ui-j0ljlc`
Đặc tả: `docs/specs/2026-09-05-thiet-ke-lai-desktop-giao-duc.md`

## Bối cảnh

Người dùng yêu cầu thiết kế lại UI/UX desktop cho các trang giáo dục, chốt phạm vi **cả ba nhóm
trang, chia thành 3 PR nối tiếp**, mức thay đổi **"bố cục + gộp/tách lại luồng màn hình"**.

Đọc hiện trạng trước khi sửa: **vỏ** desktop đã được làm lại ở các đợt 2026-09-02/09-03
(`DesktopSidebar`, breadcrumb, ⌘K, chế độ tập trung, `PageShell`/`TwoPane`/`TocRail`). Cái chưa
được làm là **thân các trang học** — vẫn là màn hình mobile phóng to. Đây là đợt 1/3.

## Việc đã làm

### 1. `Lessons.tsx` (bài hội thoại) — master–detail ở desktop

Trước: danh sách bài **bị thay thế** bởi màn chi tiết, kể cả ở 1280px. Muốn đổi bài phải bấm
"← Danh sách" rồi cuộn tìm lại từ đầu; màn chi tiết là một cột `max-w-3xl` giữa màn hình.

Nay từ 1024px dựng **một** màn hình `TwoPane railSide="left"`: cột trái là ô tìm kiếm + gợi ý
"Tiếp tục" + danh sách một cột (bài đang mở được tô đậm **và** mang `aria-current="true"`), cột
phải là nội dung bài. Chưa chọn bài thì cột phải hiện màn hình rỗng mời chọn — cố ý **không** tự
mở sẵn một bài, vì như vậy lần sau quay lại người học không phân biệt được đâu là bài đang học dở.

Ba thay đổi phụ trợ:

- `LessonView` nhận prop `variant`. `desktop` bỏ cuộn nội bộ (`flex-1 overflow-y-auto`) vì trang
  đã cuộn theo `PageShell` — để nguyên là hai thanh cuộn lồng nhau; thanh điều khiển audio chuyển
  sang `sticky top-16`; nút "← Danh sách" bỏ đi vì danh sách hiện sẵn bên trái.
- `LessonList` nhận `compact` (một cột, thẻ gọn cho rail 288–320px, bỏ dòng "N lượt thoại" vốn bị
  cắt chữ ở bề rộng đó) và `selectedId`.
- Gợi ý "Tiếp tục" tách thành biến `continueCta` dùng chung — trước khi tách nó sẽ phải chép
  nguyên 20 dòng JSX sang nhánh desktop.

### 2. `StoryReader.tsx` (đọc truyện) — cột phụ ở desktop

Trước: thanh điều khiển audio nằm **trong luồng cuộn**. Truyện dài 3–5 màn hình nên đọc tới đoạn
giữa là Tạm dừng/Dừng/Hiện bản dịch đã trôi khỏi tầm mắt — đúng lúc cần chúng nhất.

Nay từ 1024px chúng chuyển sang cột phụ `sticky` của `TwoPane`, kèm **mục lục đoạn** (nhãn lấy mấy
chữ đầu mỗi đoạn) đánh dấu đoạn đang được đọc to. Mỗi đoạn nhận `id="doan-N"` + `scroll-mt-20` để
nhảy tới không bị khuất sau header sticky. `PageShell` đổi `reading` → `standard` **chỉ ở desktop**:
sau khi trừ cột phụ, cột chữ vẫn rơi đúng khoảng đọc 65–75 ký tự mà `reading` nhắm tới, nên không
hy sinh gì để lấy chỗ cho cột phụ.

## Quyết định kèm theo

- **Dưới 1024px không đổi một pixel nào.** Mọi nhánh mới đi qua `useIsDesktopViewport()` (JS, không
  phải `lg:hidden`) — đúng luật của `TwoPane`: ẩn bằng CSS vẫn để lại bản thứ hai trong DOM, khiến
  trình đọc màn hình đọc hai lần và Playwright báo strict-mode violation.
- **Commit loại `refactor`, không phải `feat`.** Đợt này không thêm năng lực nghiệp vụ nào, chỉ đổi
  cách trình bày và luồng màn hình.

## Bằng chứng kiểm chứng

| Cổng                                        | Kết quả                                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `npm run build`                             | ✅ 1823 modules, 3.24s                                                                                       |
| `npm run typecheck`                         | ✅ (cả 4 tsconfig)                                                                                           |
| `npm run lint`                              | ✅ 0 cảnh báo                                                                                                |
| `npm run format`                            | ✅                                                                                                           |
| `npm test`                                  | ✅ **12160/12160** (574 file)                                                                                |
| `e2e/a11y.spec.ts` + `e2e/a11y-aaa.spec.ts` | ✅ **402/402** (15 trang × 5 theme, AA 0 vi phạm + AAA nội dung)                                             |
| `e2e/continue-viewing.spec.ts`              | ✅ 2/2 (đã cập nhật cho luồng master–detail)                                                                 |
| Ảnh chụp thật 1440px + 390px                | ✅ desktop hai cột đúng thiết kế; mobile giữ nguyên "← Danh sách", thanh điều khiển trong luồng, cuộn nội bộ |

`e2e/continue-viewing.spec.ts` đổi cách kiểm: Playwright chạy ở 1280px tức nhánh master–detail, nên
không còn nút "← Danh sách" để quay lại; test nay khẳng định gợi ý "Tiếp tục" tự nhảy từ "Bài 1"
sang "Bài 2" **ngay** sau khi mở bài 1, và kiểm bài đang mở bằng `aria-current` thay vì chữ tiêu đề
(tiêu đề nay xuất hiện ở cả mục danh sách lẫn header → `getByText` sẽ vi phạm strict-mode).

## Còn lại của chuỗi

- Đợt 2 — trang TỔNG QUAN môn: `EnglishHome`, `Subjects`, `SubjectDetail`, `RoadmapTab`.
- Đợt 3 — trang LUYỆN TẬP tương tác: `Speaking`, `Writing`, `Chat`, `Listening`.
