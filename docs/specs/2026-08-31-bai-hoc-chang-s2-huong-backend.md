# Đặc tả: Bài học 8 bước thật cho chặng `backend-s2` (hướng chuyên sâu Backend)

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

Người dùng yêu cầu trực tiếp trong phiên: "soạn tiếp bài học 8 bước cho chặng backend-s2" —
tiếp mạch soạn bài cho `stageUnits.ts` (sau `ai-s1`, `data-s1`), lần này là chặng S2 ĐẦU TIÊN
có bài (các chặng trước đều là S1). Giải pháp: soạn 6 bài học 8 bước thật cho `backend-s2`
(`specializations/backend.ts`, 4 module) ở 3 unit mới, đăng ký cầu nối vào
`specializations/stageUnits.ts`.

## 2. Vấn đề, người dùng và bằng chứng

- Persona: người học hướng Backend đã xong S1 (đã có bài từ 2026-08-27), vào chặng S2 nhưng
  chưa có bài học thật.
- Hiện trạng: `stageUnits.ts` trước đợt này có 6 chặng đã đăng ký, toàn bộ đều là S1
  (`web-s1`, `architecture-s1`, `web-s4` là S4, `backend-s1`, `ai-s1`, `data-s1`). Chưa chặng
  S2 nào có bài.
- Nguồn bằng chứng: hội thoại phiên này ("soạn tiếp bài học 8 bước cho chặng backend-s2").

## 3. Nghiên cứu hiện trạng

- `packages/subject-programming/specializations/backend.ts` — 4 module `backend-s2`: CSDL
  quan hệ chuyên sâu, Cache, Hàng đợi và việc nền, Đồng thời trong ngôn ngữ.
- `packages/subject-programming/lessons/p6u61.ts`/`p6u62.ts`/`p6u63.ts` — bài `backend-s1` đã
  có, dùng làn `typescript`, mô phỏng bằng hàm thuần tất định (không server/CSDL thật). Giữ
  đúng làn này cho `backend-s2` để nhất quán trong cùng hướng.
- Mã unit tự do tại thời điểm soạn: `p6-u102` trở đi — dải `p6-u94…u101` (kế hoạch cũ dành cho
  S2/S3 của các hướng, xem `docs/specs/2026-08-27-dai-ma-unit-s1-cac-huong-con-lai.md`) đã bị
  lộ trình "Kỹ Sư Trưởng AI" (`principal-s1…s4`) chiếm trước cùng ngày.

## 4. Phương án và quyết định

3 unit, đúng khuôn "gộp module khi hợp lý" đã dùng ở `web-s1`/`data-s1`:

- `p6-u102` (module m1 "CSDL quan hệ chuyên sâu"): khoá lạc quan (version) chống lost update;
  quy tắc tiền tố (leftmost prefix) của composite index.
- `p6-u103` (module m2 "Cache"): cache-aside + TTL; cache stampede + khoá tái tạo.
- `p6-u104` (gộp module m3 "Hàng đợi và việc nền" + m4 "Đồng thời trong ngôn ngữ"): hàng đợi
  at-least-once buộc idempotent + dead letter queue; race condition tái hiện tất định.

**Phương án khác đã cân nhắc và loại:** dùng lại dải `p6-u94` như đặc tả cũ dự kiến — loại vì
dải đó đã bị lộ trình "Kỹ Sư Trưởng AI" chiếm, dùng lại sẽ đụng độ mã unit đã phát hành.

## 5. Phạm vi

### Trong phạm vi

- 3 unit mới trong `curriculum.ts` (`p6-u102…u104`) + 6 bài học 8 bước
  (`lessons/p6u102..104.ts`), làn `typescript`.
- Đăng ký `stageUnits.ts`: `'backend-s2': ['p6-u102', 'p6-u103', 'p6-u104']`.
- Cập nhật `PROGRESS.md` mục "Tiếp theo".

### KHÔNG trong phạm vi

- KHÔNG đổi UI/route mới, không migration, không đổi API.
- KHÔNG soạn bài cho `backend-s3`/`backend-s4` hay chặng S2 của hướng khác — ngoài phạm vi.

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
