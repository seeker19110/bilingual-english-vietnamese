# 0212 — Bài học 8 bước thật cho chặng backend-s2 (1 PR)

- **Ngày:** 2026-08-31
- **PR:** (điền khi tạo)

## Việc đã làm

Tiếp mạch "soạn bài học 8 bước cho stageUnits.ts" (sau `ai-s1`, `data-s1`), khép chặng
`backend-s2` (`specializations/backend.ts`, 4 module) bằng 6 bài học 8 bước thật ở 3 unit mới
— chặng S2 ĐẦU TIÊN có bài (mọi chặng trước đó đều là S1).

- `p6-u102` (module "CSDL quan hệ chuyên sâu"): l1 khoá lạc quan (version) chống LOST UPDATE —
  mô phỏng hai giao dịch cùng sửa một dòng, giao dịch sau bị từ chối khi version không khớp;
  l2 quy tắc TIỀN TỐ (leftmost prefix) của composite index — hàm chọn index tốt nhất cho một
  truy vấn, minh hoạ index "đủ cột" vẫn vô dụng nếu thiếu cột đầu.
- `p6-u103` (module "Cache"): l1 cache-aside + TTL (đọc kiểm cache trước, ghi qua bước làm mất
  hiệu lực chứ không ghi thẳng vào cache); l2 cache stampede + khoá tái tạo (chỉ một request
  được đi tái tạo cache, phần còn lại chờ hoặc dùng dữ liệu cũ).
- `p6-u104` (gộp 2 module cuối "Hàng đợi và việc nền" + "Đồng thời trong ngôn ngữ"): l1
  at-least-once buộc xử lý phải IDEMPOTENT + dead letter queue; l2 race condition tái hiện tất
  định (đọc-cộng-ghi tách rời mất một lần cộng) so với thao tác nguyên tử.
- Đăng ký `stageUnits.ts`: `'backend-s2': ['p6-u102', 'p6-u103', 'p6-u104']`.
- Cả 6 bài dùng làn `typescript` (nhất quán với `backend-s1`), chấm bằng tsc thật +
  `node:vm` (`lessonsTs.test.ts`) — không kết nối CSDL/Redis/hàng đợi thật, mọi hành vi mô
  phỏng bằng hàm thuần tất định.

## Quyết định kèm theo

- Mã unit dùng dải `p6-u102…u104` thay vì `p6-u94` như kế hoạch cũ đã ghi — dải đó đã bị lộ
  trình "Kỹ Sư Trưởng AI" (`principal-s1…s4`) chiếm trước cùng ngày (không mã đã phát hành nào
  bị đổi).
- Chia việc: unit `p6-u102` (CSDL — cần kiểm bằng tsc thật kỹ vì có luật tiền tố dễ sai) tự
  làm; hai unit `p6-u103`/`p6-u104` (Cache, Hàng đợi+Đồng thời — độc lập không phụ thuộc nhau)
  giao song song 2 subagent Sonnet theo đúng khuôn `p6u102.ts`/`p6u61.ts`.

## Bằng chứng kiểm chứng

- `npm run typecheck` sạch (cả `tsc -b packages/subject-programming` riêng).
- `npm run lint` (`--max-warnings 0`) sạch.
- `npm run build` thành công; `npm run budget` vẫn trong hạn mức (JS 127,33/140 kB, CSS
  16,79/18 kB).
- `npx vitest run packages/subject-programming` — **49/49 file test, 2812/2812 test xanh**,
  bao gồm `lessonsTs.test.ts` (chạy tsc thật cho cả 6 bài mới, cả sample solution lẫn ví dụ
  mẫu và Predict) và `specializations/stageUnits.test.ts`.
- Hai lỗi phát hiện lúc tự kiểm và đã sửa trước khi gộp:
  1. Trong lúc soạn `p6-u102-l2`, một ca kiểm "ẩn" ban đầu viết dựa trên giả định sai (kỳ vọng
     `idx_khach` thắng khi thực ra `idx_khach_ngay` thắng do đứng trước trong mảng khi hoà
     điểm) VÀ dính xung đột substring (`idx_khach` là tiền tố của `idx_khach_ngay`) — đã bỏ ca
     đó, giữ lại 4 ca đã tự kiểm đúng bằng `tsc` + `node` thật.
  2. `p6-u103-l1` có lựa chọn Predict sai `"0"` trùng substring với đáp án đúng `"100"` — đổi
     thành `"50"`.

## Việc tiếp theo (không nằm trong đợt này)

- Đây là chặng S2 ĐẦU TIÊN có bài — 45/52 chặng S1 + toàn bộ chặng S2/S3/S4 khác của 13 hướng
  vẫn chưa có bài học 8 bước thật. Mã unit tiếp theo còn trống: `p6-u105` trở đi.
