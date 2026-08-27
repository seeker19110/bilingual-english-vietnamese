# Đặc tả: chi tiết chặng S1 cho toàn bộ 13 hướng chuyên sâu

> Ngày 2026-08-27 · Khuôn: `docs/templates/dac-ta-tinh-nang.md`

## 1. Phạm vi

**LÀM.** Soạn `SpecStageDetail` cho chặng **S1** của cả 13 hướng (53 module), đăng ký vào
`stageDetails.ts`, và siết cổng test để không hướng nào còn thiếu chi tiết ở bất kỳ chặng nào.

**KHÔNG làm.**

- KHÔNG soạn bài học 8 bước cho các chặng S1 chưa có — đó là tầng khác (`stageUnits.ts`), và
  9/13 hướng không có bộ chạy trong trình duyệt nên ép khuôn sẽ đẻ nội dung giả.
- KHÔNG sửa bản đồ chặng (`<hướng>.ts`) — module id là khoá tiến độ Postgres, đổi là mất dữ liệu.
- KHÔNG đổi thứ tự phần tử đã có trong `SPEC_STAGE_DETAILS`.

## 2. Điểm chạm file

| File                                                                 | Việc                    |
| -------------------------------------------------------------------- | ----------------------- |
| `packages/subject-programming/specializations/details/<hướng>-s1.ts` | 13 file MỚI             |
| `packages/subject-programming/specializations/stageDetails.ts`       | +13 import, +13 phần tử |
| `packages/subject-programming/specStageDetails.test.ts`              | +2 ca cổng              |
| `apps/server/src/api/subjects/programming/progress.test.ts`          | sửa dữ liệu ca kiểm     |

## 3. Hợp đồng vào-ra

Không đổi. `getSpecStageDetail(stageId)` vẫn trả `SpecStageDetail | undefined`; trang chặng
`/lap-trinh/huong/:specId/:stageId` tự hiển thị phần chi tiết khi có. Tiến độ mức mục
(`<stage>-m<n>`, `<stage>-r<n>`) đi qua `/api/programming/progress` như cũ — **13 chặng S1 nay
mở thêm 53 khoá module + 58 khoá tiêu chí được server chấp nhận.**

## 4. Tiêu chí chấp nhận

1. `getSpecStageDetail('<hướng>-s1')` trả về giá trị cho cả 13 hướng.
2. Module trong chi tiết khớp ĐÚNG và ĐỦ module ở bản đồ, không thừa không thiếu.
3. Mọi cổng khuôn dạng sẵn có (độ dài mục tiêu, số bài luyện, rubric có cách chứng minh, đủ 6 ô
   đặc tả, chống copy-paste) đều xanh cho phần mới.
4. Cổng mới: KHÔNG chặng nào trong bản đồ còn thiếu chi tiết (4 chặng × 13 hướng).

## 5. Bất biến + test canh

| Bất biến                                              | Test canh                                               |
| ----------------------------------------------------- | ------------------------------------------------------- |
| Mỗi hướng có đúng một chi tiết S1                     | `specStageDetails.test.ts` — ca "chặng S1"              |
| Không chặng nào của bản đồ thiếu chi tiết             | `specStageDetails.test.ts` — ca "phủ trọn 4 chặng × 13" |
| Mục tiêu module không trùng nguyên văn giữa các hướng | ca "chống copy-paste"                                   |
| Tiêu chí rubric không trùng nguyên văn giữa các hướng | ca "chống copy-paste"                                   |
| Khoá tiến độ lạ vẫn bị server từ chối                 | `progress.test.ts` — ca "khoá không tồn tại → 400"      |

## 6. Quy ước dự án

Nội dung tiếng Việt; import nội bộ gói có đuôi `.js`; dữ liệu là hằng biên dịch (không I/O,
không phụ thuộc thời gian); `objective` phải nói LÀM ĐƯỢC gì chứ không phải "hiểu về".

## 7. Nghiệm thu

`npm test` (490 file) · `npm run typecheck` · `npm run lint` · `npm run build` · `npm run budget`
— toàn bộ xanh. Xem `docs/changelog/0183-2026-08-27-chi-tiet-chang-s1-13-huong.md`.
