# Đặc tả — Thanh điều hướng có nhóm ĐÓNG/MỞ được

- **Ngày:** 2026-09-02
- **Trạng thái:** Approved for implementation (chủ dự án yêu cầu trực tiếp và duyệt ngày 2026-09-02)
- **Yêu cầu gốc:** "thiết kế lại nav: ví dụ thẻ _Phòng Học_ sẽ đóng mở được, có các môn học
  phía dưới — áp dụng toàn cục."

## 1. Vấn đề

Sidebar desktop (`apps/dhcb/src/components/DesktopSidebar.tsx`) là danh sách PHẲNG. Muốn vào
môn Toán phải đi hai chặng: bấm "Phòng Học" → chờ trang danh sách môn tải → bấm thẻ môn. Các
môn học là nơi người dùng ở lâu nhất mà lại nằm sâu nhất trong cây điều hướng.

## 2. Phạm vi

**Làm:**

- Mục điều hướng có thể có MỤC CON, đóng/mở ngay trong thanh điều hướng.
- Áp dụng cho mọi mục có nội dung con, không riêng "Phòng Học":
  - **Phòng Học** → 6 môn của `packages/core-learner/subjectRegistry.ts` (Tiếng Anh · Toán học ·
    Vật lý · Hóa học · Sinh học · Lập trình).
  - **Luyện tập** → Trò chuyện · Luyện nói · Luyện viết · Luyện nghe · Từ điển · Thử thách.
  - **Học Tiếng Anh** → Lộ trình CEFR · Bài học · Câu thông dụng · Sổ tay lỗi sai · Ôn thi.
- Trạng thái mở/đóng ghi nhớ giữa các phiên.
- Nhóm chứa trang đang xem TỰ MỞ (vào thẳng bằng URL vẫn định vị được).

**KHÔNG làm (cố ý):**

- BottomNav mobile giữ nguyên 5 tab: thanh dưới không đủ chỗ cho cây đóng/mở, và mở nhóm ở đó
  sẽ che nội dung trang. Nếu cần, đợt sau làm bảng trượt (sheet).
- Không đổi URL, không đổi route, không đổi trang đích của bất kỳ mục nào đang có.

## 3. Điểm chạm file

| File                                          | Việc                                                   |
| --------------------------------------------- | ------------------------------------------------------ |
| `apps/dhcb/src/lib/navTree.ts` (mới)          | Dữ liệu cây + hàm thuần đóng/mở + đọc/ghi localStorage |
| `apps/dhcb/src/lib/navTree.test.ts` (mới)     | Test canh dữ liệu và logic đóng/mở                     |
| `apps/dhcb/src/components/DesktopSidebar.tsx` | Render nhóm đóng/mở được                               |

## 4. Hợp đồng vào-ra

- `toggleGroup(open, id) -> string[]` — hàm THUẦN, bật/tắt một nhóm, không đụng nhóm khác.
- `groupContainsPath(children, pathname) -> boolean` — khớp theo TIỀN TỐ (trang con vẫn tính).
- `readOpenGroups() / writeOpenGroups(ids)` — khoá `ui_sidebar_groups`; localStorage bị chặn
  hoặc JSON hỏng → trả `[]`, KHÔNG ném lỗi.
- Mỗi `NavChild` có ĐÚNG MỘT cách trỏ đích: `to` (đường dẫn trong app) **hoặc** `subjectId`
  (render bằng `SubjectsLink` vì trụ Học tập có thể ở origin riêng — `lib/subjectsHost.ts`).

## 5. Tiêu chí chấp nhận

1. Bấm mũi tên ở "Phòng Học" → hiện 6 môn ngay dưới, không rời trang.
2. Bấm chữ "Phòng Học" → vẫn đi tới trang tổng quan như trước (hành vi cũ không đổi).
3. Tải lại trang → nhóm đang mở vẫn mở.
4. Vào thẳng `/mon-hoc/physics` → nhóm "Phòng Học" tự mở, mục "Vật lý" sáng.
5. Sidebar ở chế độ thu gọn (icon-only) → không hiện mục con, không hiện nút mũi tên.
6. Nút mũi tên có `aria-expanded`, `aria-controls` và nhãn nói rõ nhóm nào (a11y AA).

## 6. Bất biến + test canh

- Danh sách môn trong nav phải khớp `subjectRegistry` — test so khớp đúng 6 id theo thứ tự.
- Mỗi mục con chỉ có `to` XOR `subjectId` — test bắt buộc.
- localStorage hỏng không được làm vỡ trang — test 3 dạng dữ liệu hỏng.

## 7. Quy ước dự án áp dụng

Comment tiếng Việt ở chỗ quan trọng (CLAUDE.md mục 7) · không hard-code màu, dùng token
`accent-*` kèm biến thể `theme-light:` (mục 4.8, 4.5) · dữ liệu tách khỏi component để test
được mà không dựng React.
