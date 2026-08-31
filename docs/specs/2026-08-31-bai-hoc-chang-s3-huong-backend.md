# Đặc tả: Bài học 8 bước thật cho chặng `backend-s3` (hướng chuyên sâu Backend)

| Thuộc tính   | Giá trị                                    |
| ------------ | ------------------------------------------ |
| Issue        | #                                          |
| Spec owner   | Claude (phiên làm việc 2026-08-31)         |
| Trạng thái   | **Approved for implementation**            |
| Người duyệt  | Chủ dự án (donghanhcungban.org@gmail.com)  |
| Ngày duyệt   | 2026-08-31 (yêu cầu trực tiếp trong phiên) |
| Lần cập nhật | 2026-08-31                                 |

> Không bắt đầu code khi trạng thái chưa là **Approved for implementation**.

## 1. Tóm tắt quyết định

Người dùng yêu cầu trực tiếp trong phiên: "soạn tiếp bài học 8 bước cho chặng backend-s3" —
tiếp mạch soạn bài cho `stageUnits.ts` sau `backend-s2`. Giải pháp: soạn 6 bài học 8 bước thật
cho `backend-s3` "Hệ phân tán" (`specializations/backend.ts`, 4 module) ở 3 unit mới, đăng ký
cầu nối vào `specializations/stageUnits.ts`.

## 2. Vấn đề, người dùng và bằng chứng

- Persona: người học hướng Backend đã xong S1/S2 (đã có bài), vào chặng S3 "Hệ phân tán"
  nhưng chưa có bài học thật.
- Hiện trạng: `stageUnits.ts` trước đợt này có 7 chặng đã đăng ký, `backend-s3` chưa có.
- Nguồn bằng chứng: hội thoại phiên này ("soạn tiếp bài học 8 bước cho chặng backend-s3").

## 3. Nghiên cứu hiện trạng

- `packages/subject-programming/specializations/backend.ts` — 4 module `backend-s3`: Nền
  tảng lý thuyết (CAP, đồng hồ, sharding), Giao tiếp giữa dịch vụ (gRPC, sự kiện, outbox,
  saga), Chịu lỗi (timeout/retry/circuit breaker/bulkhead), Quan sát hệ thống (metric/log/
  trace, SLI/SLO/error budget).
- `packages/subject-programming/lessons/p6u102..104.ts` — bài `backend-s2` đã có, dùng làn
  `typescript`, mô phỏng bằng hàm thuần tất định. `p6-u104-l1` đã dạy IDEMPOTENT cho hàng đợi
  — chặng S3 nối lại khái niệm này cho lệnh gọi mạng (không dạy trùng, chỉ mở rộng ngữ cảnh).
- Mã unit tự do tại thời điểm soạn: `p6-u105` trở đi (`p6-u102…u104` đã dùng cho `backend-s2`).

## 4. Phương án và quyết định

3 unit, đúng khuôn "gộp module khi hợp lý" đã dùng ở các chặng trước:

- `p6-u105` (module m1 "Nền tảng lý thuyết"): sharding bằng modulo và vì sao thêm một máy xáo
  trộn gần hết dữ liệu (dẫn ý sang consistent hashing ở mức lý thuyết); gọi mạng khác gọi hàm
  — timeout là trạng thái KHÔNG BIẾT (không phải lỗi), nối lại idempotent từ `backend-s2`.
- `p6-u106` (module m2 "Giao tiếp giữa dịch vụ"): outbox pattern chống mất sự kiện (vấn đề
  dual write); saga với hành động bù trừ chạy ngược khi một bước giữa chuỗi thất bại.
- `p6-u107` (gộp module m3 "Chịu lỗi" + m4 "Quan sát hệ thống"): circuit breaker 3 trạng thái
  (CLOSED/OPEN/HALF_OPEN) chặn dồn tải lên dịch vụ đang hỏng; SLI/SLO/error budget tính ngân
  sách lỗi còn lại.

**Phương án khác đã cân nhắc và loại:** 4 unit riêng (1:1 với 4 module) — loại vì m3/m4 đều
xoay quanh "phát hiện & phản ứng khi có sự cố", gộp vào 1 unit khớp tiền lệ đã dùng ở các
chặng trước và tránh một unit chỉ có 1-2 bài mỏng.

## 5. Phạm vi

### Trong phạm vi

- 3 unit mới trong `curriculum.ts` (`p6-u105…u107`) + 6 bài học 8 bước
  (`lessons/p6u105..107.ts`), làn `typescript`.
- Đăng ký `stageUnits.ts`: `'backend-s3': ['p6-u105', 'p6-u106', 'p6-u107']`.
- Cập nhật `PROGRESS.md` mục "Tiếp theo".

### KHÔNG trong phạm vi

- KHÔNG đổi UI/route mới, không migration, không đổi API.
- KHÔNG soạn bài cho `backend-s4` hay chặng khác của hướng khác — ngoài phạm vi.

## 6. Tiêu chí chấp nhận (đo được)

- `npm run typecheck` sạch.
- `npx vitest run packages/subject-programming` xanh 100%, bao gồm `lessonsTs.test.ts` (6 bài
  chạy tsc thật + `node:vm`), `specializations/stageUnits.test.ts`.
- `npm run lint` (`--max-warnings 0`) sạch.
- `npm run build` thành công, `npm run budget` vẫn trong hạn mức.

## 7. Rủi ro, rollout, rollback

- Rủi ro thấp: chỉ thêm dữ liệu hằng biên dịch, không đổi schema DB, không đổi API.
- Rollout: đi theo PR thường, không cần feature flag.
- Rollback: revert PR nếu cần — không có migration, không có dữ liệu người dùng bị ảnh hưởng.
