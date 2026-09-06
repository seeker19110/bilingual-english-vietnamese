# 0280 — 2026-09-06 — Tách `Lessons.tsx` (1.693 dòng) thành thư mục `lessons/`

**PR:** (điền khi tạo) · **Loại:** `refactor(english)` · **Nhánh:** `claude/danh-gia-sau-du-an-tpvud1`

## Việc đã làm

File thứ ba trong mục "4 file > 1.700 dòng" (sau `0278` StudyTabs, `0279` Practice). Tách
**thuần dời mã**:

| File mới (`apps/dhcb/src/pages/subjects/english/lessons/`) | Dòng  | Nội dung                                                            |
| ---------------------------------------------------------- | ----- | ------------------------------------------------------------------- |
| `shared.ts`                                                | 84    | `PAGE_SIZE`, `Speed`, `AudioMode`, `COLORS`, `getColor`, `WordSync` |
| `WordText.tsx`                                             | 44    | chữ karaoke đồng bộ từng từ (memo)                                  |
| `SearchBar.tsx`                                            | 50    | ô tìm kiếm                                                          |
| `LessonList.tsx`                                           | 131   | danh sách bài (lazy load IntersectionObserver)                      |
| `LessonView.tsx`                                           | 1.018 | chi tiết bài: audio player + karaoke + chế độ Đóng vai              |
| `InlinePronounce.tsx`                                      | 163   | chấm phát âm inline 1 câu                                           |

`pages/subjects/english/Lessons.tsx` còn **241 dòng** = trang chính (master–detail desktop /
2 màn mobile). `InlinePronounce` được **re-export** từ `Lessons.tsx` nên
`components/CefrLessonViews.tsx` giữ nguyên đường import.

**Còn dở có chủ ý:** `LessonView.tsx` vẫn 1.018 dòng vì chế độ "Đóng vai" (từ dòng ~260) lồng
trong cùng component, dùng chung state với player — tách nó không còn là dời mã, cần đọc kỹ
state và có đặc tả ngắn. Ghi ở `PROGRESS.md`.

## Bằng chứng

- **Thân mã giống hệt:** so chuỗi (bỏ import/comment/khoảng trắng/`;`) bản cũ từ dòng 55 và 7
  file mới nối lại → `THÂN MÃ GIỐNG HỆT`.
- **Tầng 8b — `/bai-hoc` danh sách + mở bài thứ 3, 1440px (master–detail) + 390px, trước/sau:
  cả 4 ảnh GIỐNG HỆT TỪNG BYTE** (trang này không có phần ngẫu nhiên nên so byte là đủ).
- `npm run codemap -- impact`: `Lessons.tsx` có `App.tsx` (lazy route) + `CefrLessonViews.tsx`
  (dùng `InlinePronounce`) — cả hai không đổi.
- Cổng: typecheck ✅ · lint ✅ · format ✅ · `npm test` ✅ · build ✅ (số trong mô tả PR).

## Ghi nhận thêm về auto-merge (cập nhật `CLAUDE.md` mục 11)

PR #867 là lần đầu `enable_pr_auto_merge` **bật được** — gọi trong vài giây ngay sau khi tạo
PR, trước khi check nào kịp báo. #865 (gọi sau khi `metadata` xanh) bị "clean status", #866
(gọi khi check đang chạy) bị "unstable". Kết luận: gọi NGAY trong cùng nhịp tạo PR thì có cửa sổ
vài giây; trượt cửa sổ thì vẫn theo luật cũ (CI xanh → merge tay).
