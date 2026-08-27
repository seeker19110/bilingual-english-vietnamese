# feat(companion-link): "Người thân theo dõi" — báo cáo tuần cho phụ huynh/thầy cô (2026-08-26)

Thi hành trọn bộ C1–C4 của `docs/research/dac-ta-nguoi-dong-hanh-2026-08-26.md` trong một đợt.
Đây là ý tưởng #2 của đợt đề xuất tích hợp cùng ngày; người dùng chọn làm trước vì nhỏ, không tốn
token AI, và nối được người **trả tiền** (phụ huynh) vào sản phẩm.

## Đã làm

- **C1 — schema + service.** `postgres/migrations/0069_companion_links.sql`
  (`companion_links` + `companion_invites`), `packages/core-contracts/companionLink.ts`,
  `packages/core-personal/companionLinkService.ts` (18 test).
- **C2 — nội dung thư.** `apps/server/src/api/_lib/weeklyReport.ts` — hàm thuần, 4 tình huống
  tuần (tốt / đều / thưa / vắng), luôn kết bằng một câu gợi ý để hỏi chuyện (18 test).
- **C3 — truy vấn + gửi + chống trùng.** `weeklyReportService.ts` (14 test),
  `apps/server/src/api/personal/companion-link.ts` (18 test), route trong `routes.ts`, bộ hẹn giờ
  chủ nhật 19h VN trong `server.ts`.
- **C4 — giao diện.** `apps/dhcb/src/components/CompanionLinkSection.tsx` +
  `apps/dhcb/src/lib/companionLink.ts` (9 test) + cổng a11y riêng
  `e2e/a11y-companion-link.spec.ts` (5 theme × A/AA + một lượt AAA).

## Quyết định đáng ghi lại

1. **Mã mời dùng MỘT LẦN, hạn 24 giờ** — khác `profiles.friend_code` (cố định, dùng mãi). Quyền
   xem tiến độ học nặng hơn quyền kết bạn: mã kết bạn lộ thì lộ một lời mời, mã này lộ thì lộ
   việc học của một đứa trẻ. Giành mã bằng chính câu `UPDATE ... where used_at is null`, nên hai
   người cùng nhập một mã thì đúng một người thắng.
2. **Danh sách trường người theo dõi được thấy là ĐÓNG, chốt trong contract** — và có **test canh
   gác** bắt đỏ khi ai đó thêm trường (`companionLinkService.test.ts`), cộng một test đọc thẳng
   mã nguồn handler để chặn việc thêm route đọc dữ liệu học thời gian thực. Cùng tinh thần 7 test
   bất biến chống rò con số năng lực.
3. **Giành việc TRƯỚC khi gửi thư, không phải sau.** Nếu SMTP chết đúng lúc đó thì tuần ấy mất
   một thư; chiều ngược lại thì một lần crash làm cả danh sách nhận thư HAI lần. Thư trùng phá
   niềm tin nặng hơn thư thiếu — chọn mất thư. (Thư không gửi được thì `releaseLink()` trả liên
   kết về trạng thái chưa gửi để tuần sau thử lại.)
4. **Gộp "từ mới" và "thẻ đã ôn" thành MỘT con số.** Đặc tả ban đầu ghi hai trường riêng. Khi nối
   dữ liệu thật mới thấy nguồn duy nhất có là `daily_usage.learn_count`, vốn **gộp chung** hai
   việc đó (xem `api/_lib/leaderboard.ts`), còn `learning_progress.learned` không có mốc thời
   gian. Tách đôi là bịa ra con số dữ liệu không đỡ được → sửa contract thành `wordsPracticed`.
5. **Đợt 1 chỉ hiện ở chiều A** (người Việt học tiếng Anh): nội dung thư và giao diện mới có bản
   tiếng Việt. Hiện ở chiều B sẽ là màn hình nửa Việt nửa Anh — thà chưa có còn hơn có mà lộn xộn.

## Hai cổng của chính dự án đã bắt lỗi thật trong đợt này

- **Đánh số migration nhảy cóc.** Đặc tả đặt trước `0069` cho chế độ ôn thi (chưa làm) và `0070`
  cho tính năng này, nhưng tính năng này ship trước ⇒ `scripts/migrations-readme-coverage.test.ts`
  báo "thiếu số 0069". Đã đổi lại theo thứ tự ship thật (0069 = companion links, 0070 dành cho
  exam plan) và sửa cả hai đặc tả.
- **a11y ở theme nền sáng.** `e2e/a11y-companion-link.spec.ts` bắt `color-contrast` (serious,
  4 phần tử) ở 3/5 theme sáng: `text-emerald-300` / `text-rose-300` / `text-accent-400` là màu
  **cố định**, không đảo theo theme. Đã thêm biến thể `theme-light:` theo đúng khuôn có sẵn ở
  `BottomNav.tsx` / `CefrLessonViews.tsx`. Sau khi sửa: 6/6 xanh.

## Bằng chứng

```
Build ✅ (dist + dist-server/server.js) | Type ✅ | Lint ✅ 0 cảnh báo | Format ✅
Test ✅ 6162/6162 (470 file) — trong đó 77 test mới của đợt này
Coverage ✅ statements 93,43% · branches 90,2% (sàn 90) · functions 96,17%
Bundle ✅ Initial JS 124,02/140 kB · CSS 15,87/18 kB
E2E a11y ✅ 6/6 (5 theme × A/AA + 1 lượt AAA) — chạy thật bằng Chromium
```

## ⚠️ Việc tay trước khi dùng thật

Chạy `npm run migrate:pg` trên VPS để tạo 2 bảng mới — hoặc để `scripts/deploy.sh` tự chạy khi PR
merge vào `main` (README migrations mục "Tự động áp khi deploy").
