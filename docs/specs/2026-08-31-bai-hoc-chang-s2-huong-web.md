# Đặc tả: Bài học 8 bước thật cho chặng `web-s2` (hướng chuyên sâu Web)

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

Người dùng yêu cầu trực tiếp trong phiên: "soạn tiếp bài học 8 bước cho chặng web-s2" — tiếp
mạch soạn bài cho `stageUnits.ts` sau các chặng hướng Backend (S1–S4). Giải pháp: soạn 6 bài
học 8 bước thật cho `web-s2` "Full-stack — có backend của mình" (`specializations/web.ts`, 5
module) ở 3 unit mới, đăng ký cầu nối vào `specializations/stageUnits.ts`.

## 2. Vấn đề, người dùng và bằng chứng

- Persona: người học hướng Web đã xong S1 (đã có bài `web-s1`), vào chặng S2 "Full-stack — có
  backend của mình" nhưng chưa có bài học thật.
- Hiện trạng: `stageUnits.ts` trước đợt này có 10 chặng đã đăng ký, `web-s2` chưa có (dù `web-s1`
  và `web-s4` của cùng hướng đã có).
- Nguồn bằng chứng: hội thoại phiên này ("soạn tiếp bài học 8 bước cho chặng web-s2").

## 3. Nghiên cứu hiện trạng

- `packages/subject-programming/specializations/web.ts` — 5 module `web-s2` (nhiều hơn 4 module
  như các chặng trước): API HTTP tử tế (REST, mã trạng thái, idempotency), Cơ sở dữ liệu quan hệ
  (schema, index, transaction), Xác thực & phiên (hash mật khẩu, session vs JWT, OAuth), Tải dữ
  liệu ở client (cache, race condition), Deploy và môi trường (biến môi trường, migration).
- `packages/subject-programming/lessons/p6u102.ts` (hướng Backend S2) đã dạy khoá lạc quan chống
  lost update + quy tắc tiền tố composite index — `web-s2-m2` (CSDL quan hệ) PHẢI đi theo góc
  KHÁC (toàn vẹn tham chiếu qua khoá ngoại) để không dạy trùng.
- Mã unit tự do tại thời điểm soạn: `p6-u111` trở đi (`p6-u108…u110` đã dùng cho `backend-s4`).

## 4. Phương án và quyết định

3 unit cho 5 module — gộp linh hoạt hơn khuôn "gộp 2 module cuối" thường dùng, vì `web-s2` có 5
module thay vì 4:

- `p6-u111` (module m1 "API HTTP tử tế"): chọn đúng mã trạng thái theo hành động + kết quả;
  phân trang; Idempotency-Key chống tạo trùng khi client gửi lại yêu cầu.
- `p6-u112` (gộp module m2 "Cơ sở dữ liệu quan hệ" + m3 "Xác thực & phiên" — cả hai đều là "phía
  server: lưu trữ dữ liệu & định danh người dùng"): toàn vẹn tham chiếu qua khoá ngoại (góc khác
  `backend-s2`); so mật khẩu đã băm (mô phỏng) + chọn cơ chế phiên (session-cookie vs JWT).
- `p6-u113` (gộp module m4 "Tải dữ liệu ở client" + m5 "Deploy và môi trường" — cả hai đều là
  "vận hành ứng dụng chạy thật"): huỷ phản hồi cũ khi gõ tìm kiếm (race condition); kiểm biến môi
  trường bắt buộc + thứ tự migration không lỗ hổng.

**Phương án khác đã cân nhắc và loại:** 5 unit riêng (1:1 với 5 module) — loại vì một số module
(client loading, deploy) đủ mỏng để gộp mà không mất chiều sâu, giữ đúng tinh thần "gộp module
khi hợp lý" đã dùng xuyên suốt các chặng trước, dù tỉ lệ gộp khác (5→3 thay vì 4→3).

## 5. Phạm vi

### Trong phạm vi

- 3 unit mới trong `curriculum.ts` (`p6-u111…u113`) + 6 bài học 8 bước
  (`lessons/p6u111..113.ts`), làn `typescript`.
- Đăng ký `stageUnits.ts`: `'web-s2': ['p6-u111', 'p6-u112', 'p6-u113']`.
- Sửa `specializations/stageUnits.test.ts`: ca kiểm "chặng chưa soạn bài trả về mảng rỗng" đổi
  ví dụ từ `web-s2` (nay ĐÃ có bài) sang `web-s3` (vẫn chưa có bài) — test không đổi Ý NGHĨA,
  chỉ đổi ví dụ minh hoạ cho khớp thực tế mới.
- Cập nhật `PROGRESS.md` mục "Tiếp theo".

### KHÔNG trong phạm vi

- KHÔNG đổi UI/route mới, không migration, không đổi API.
- KHÔNG soạn bài cho `web-s3` hay chặng khác của hướng khác — ngoài phạm vi.

## 6. Tiêu chí chấp nhận (đo được)

- `npm run typecheck` sạch.
- `npx vitest run packages/subject-programming` xanh 100%, bao gồm `lessonsTs.test.ts` (6 bài
  chạy tsc thật + `node:vm`), `specializations/stageUnits.test.ts`.
- `npm run lint` (`--max-warnings 0`) sạch.
- `npm run build` thành công, `npm run budget` vẫn trong hạn mức.

## 7. Rủi ro, rollout, rollback

- Rủi ro thấp: chỉ thêm dữ liệu hằng biên dịch + sửa 1 ví dụ trong 1 test có sẵn, không đổi
  schema DB, không đổi API.
- Rollout: đi theo PR thường, không cần feature flag.
- Rollback: revert PR nếu cần — không có migration, không có dữ liệu người dùng bị ảnh hưởng.
