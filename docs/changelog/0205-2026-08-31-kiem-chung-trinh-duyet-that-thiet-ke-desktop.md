# 0205 — Kiểm chứng trên trình duyệt thật: loạt "thiết kế lại web cho desktop"

Không phải một PR code — đây là đợt **kiểm chứng thủ công bằng trình duyệt thật** sau khi cả 4
phần của loạt "thiết kế lại web cho desktop" đã merge (`#743`, `#750`, `#756`), theo yêu cầu
"thử trên trình duyệt thật xem có ổn không". Ghi lại vì CLAUDE.md mục 5 (chống ảo giác) coi đây
là bằng chứng khác loại với E2E: E2E mock API và chạy trong Playwright test runner, đợt này chạy
`npm run dev` thật + Chromium thật + `AskUserQuestion`-free tương tác trực tiếp, chụp ảnh màn
hình để xem bằng mắt.

## Cách làm

- Khởi động `npm run dev` (Vite, cổng 5173), dùng script Playwright viết tay (không phải file
  test trong `e2e/`) để mô phỏng đăng nhập (giống `mockLogin()` của `e2e/helpers/auth.ts`) rồi
  điều hướng qua các trang, chụp ảnh ở viewport desktop (1440×900) và mobile (390×844).
- Script chỉ dùng tạm trong phiên, KHÔNG commit vào repo (đặt ở `scripts/manual-check-tmp*.mjs`,
  xoá ngay sau khi xong — `git status` sạch trước khi kết thúc).

## Đã kiểm, kết quả

| Trang/tính năng                                                                       | Kết quả                                                                     |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Sidebar desktop (mở rộng)                                                             | ✅ Đúng thiết kế                                                            |
| Sidebar thu gọn (icon-only, bấm nút)                                                  | ✅ Đổi `--sidebar-w`, nội dung tự co giãn                                   |
| Chat hai cột — "Sửa lỗi & giải thích" + vote 👍👎                                     | ✅ Hiện đúng cột phải, vote hoạt động                                       |
| CEFR master–detail (bấm vào 1 bài)                                                    | ✅ Cột trái danh sách unit + cột phải flashcard, không rời trang            |
| Dashboard cột ngữ cảnh (Streak/Mục tiêu tuần/QuickActions)                            | ✅ Đúng cột phải cố định                                                    |
| Phím tắt `⌘K`                                                                         | ✅ Mở đúng Studio switcher dropdown                                         |
| Mobile 390px (Home, Dashboard)                                                        | ✅ Giữ nguyên 1 cột đúng thứ tự cũ, BottomNav đủ 5 tab                      |
| Console lỗi                                                                           | 0 lỗi thật — chỉ 401 ở trang CEFR do chưa mock API từ điển/âm thanh khi thử |
| thủ công (script test tự viết, không đủ mock như `e2e/`), không liên quan code đã đổi |

Không phát hiện vấn đề nào ngoài kết quả 4 PR đã merge. Toàn bộ loạt "thiết kế lại web cho
desktop" (PR 1→4) coi như **đã xong và đã xác minh 2 lớp**: E2E tự động (634/648/651 test tuỳ
PR, chạy 2 lần mỗi PR) + kiểm mắt trên trình duyệt thật.

## Cập nhật liên quan

- `PROGRESS.md`: thêm mục tổng kết "[2026-08-31] ✅ THIẾT KẾ LẠI WEB CHO DESKTOP — 4 PR" ở đầu
  "## Tiếp theo" (link đủ 3 spec + 3 nhật ký changelog của từng PR); cập nhật lại số đo ngân
  sách bundle trong "## Nợ kỹ thuật còn mở" (JS 126,60/140kB dư ~9,6%, CSS 16,53/18kB dư ~8,2%
  — hẹp hơn lượt đo 2026-08-28 vì thêm sidebar + cột ngữ cảnh + `useIsDesktopViewport`).
