# 0213 — Bài học 8 bước thật cho chặng backend-s3 (1 PR)

- **Ngày:** 2026-08-31
- **PR:** (điền khi tạo)

## Việc đã làm

Tiếp mạch "soạn bài học 8 bước cho stageUnits.ts" (sau `ai-s1`, `data-s1`, `backend-s2`), khép
chặng `backend-s3` "Hệ phân tán" (`specializations/backend.ts`, 4 module) bằng 6 bài học 8
bước thật ở 3 unit mới.

- `p6-u105` (module "Nền tảng lý thuyết"): l1 sharding bằng modulo — thêm một máy xáo trộn
  gần hết dữ liệu (5/6 khoá đổi máy khi thêm 1 máy trong ví dụ), dẫn ý sang consistent hashing
  ở mức lý thuyết; l2 gọi mạng khác gọi hàm — timeout là trạng thái KHÔNG BIẾT chứ không phải
  lỗi, nối lại khái niệm IDEMPOTENT đã dạy ở `p6-u104-l1` (hàng đợi) sang lệnh gọi mạng (retry
  giữ nguyên ID → an toàn; retry sinh ID mới → trừ tiền gấp đôi).
- `p6-u106` (module "Giao tiếp giữa dịch vụ"): l1 outbox pattern chống mất sự kiện (vấn đề
  dual write — ghi CSDL thành công nhưng gửi message thất bại); l2 saga — chuỗi bước xuyên
  dịch vụ, hành động bù trừ chạy NGƯỢC khi một bước ở giữa thất bại.
- `p6-u107` (gộp 2 module cuối "Chịu lỗi" + "Quan sát hệ thống"): l1 circuit breaker 3 trạng
  thái (CLOSED/OPEN/HALF_OPEN) chặn dồn tải lên dịch vụ đang hỏng; l2 SLI/SLO/error budget —
  tính ngân sách lỗi còn lại từ mục tiêu SLO.
- Đăng ký `stageUnits.ts`: `'backend-s3': ['p6-u105', 'p6-u106', 'p6-u107']`.
- Cả 6 bài dùng làn `typescript` (nhất quán với `backend-s1`/`backend-s2`), chấm bằng tsc
  thật + `node:vm`.

## Quyết định kèm theo

- Chia việc: unit `p6-u105` (nền tảng — cần liên kết chặt với idempotent đã dạy ở
  `backend-s2`) tự làm; hai unit `p6-u106`/`p6-u107` (độc lập không phụ thuộc nhau) giao song
  song 2 subagent Sonnet, có brief nhắc RÕ lỗi substring trong `predict.choices` đã dính 3 lần
  ở các đợt trước để tránh lặp lại.

## Bằng chứng kiểm chứng

- `npm run typecheck` sạch (cả `tsc -b packages/subject-programming` riêng).
- `npm run lint` (`--max-warnings 0`) sạch.
- `npm run build` thành công; `npm run budget` vẫn trong hạn mức (JS 127,32/140 kB, CSS
  16,79/18 kB).
- `npx vitest run packages/subject-programming` — **49/49 file test, 2854/2854 test xanh**,
  bao gồm `lessonsTs.test.ts` (chạy tsc thật cho cả 6 bài mới) và
  `specializations/stageUnits.test.ts`.
- **Lần đầu tiên trong mạch soạn bài này không dính lỗi substring nào ở `predict.choices`** —
  nhờ brief cho subagent nêu rõ quy tắc kiểm tra kèm ví dụ cụ thể từ các đợt trước
  (`"400000".includes("0")`, `"idx_khach_ngay".includes("idx_khach")`). Tôi tự phát hiện và
  sửa 1 ca trong lúc soạn `p6-u105-l2` trước khi giao việc cho subagent, đổi lựa chọn sai từ
  `"0"` (là substring của `"400000"`) sang `"350000"`/`"450000"`/`"500000"`.

## Việc tiếp theo (không nằm trong đợt này)

- Hướng Backend đã có bài 8 bước cho cả S1/S2/S3 — còn `backend-s4` (quy mô lớn & trách nhiệm
  vận hành) chưa có. 44/52 chặng S1 + toàn bộ S2/S3/S4 khác của 13 hướng vẫn chưa có bài. Mã
  unit tiếp theo còn trống: `p6-u108` trở đi.
