# Đặc tả: Bài học 8 bước thật cho chặng `backend-s4` (hướng chuyên sâu Backend)

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

Người dùng yêu cầu trực tiếp trong phiên: "soạn tiếp bài học 8 bước cho chặng backend-s4" —
tiếp mạch soạn bài cho `stageUnits.ts` sau `backend-s3`. Giải pháp: soạn 6 bài học 8 bước thật
cho `backend-s4` "Chuyên gia — quy mô lớn và trách nhiệm vận hành" (`specializations/backend.ts`,
4 module) ở 3 unit mới, đăng ký cầu nối vào `specializations/stageUnits.ts`.

## 2. Vấn đề, người dùng và bằng chứng

- Persona: người học hướng Backend đã xong S1/S2/S3 (đã có bài), vào chặng S4 cuối cùng
  "Chuyên gia — quy mô lớn và trách nhiệm vận hành" nhưng chưa có bài học thật.
- Hiện trạng: `stageUnits.ts` trước đợt này có 8 chặng đã đăng ký, `backend-s4` chưa có.
- Nguồn bằng chứng: hội thoại phiên này ("soạn tiếp bài học 8 bước cho chặng backend-s4").

## 3. Nghiên cứu hiện trạng

- `packages/subject-programming/specializations/backend.ts` — 4 module `backend-s4`: Thiết kế
  hệ thống quy mô (ước lượng dung lượng QPS/dung lượng lưu/băng thông, phân mảnh dữ liệu, đa
  vùng địa lý), Lưu trữ chuyên biệt (khi nào rời CSDL quan hệ, LSM tree vs B-tree, sao lưu-khôi
  phục), Bảo mật hệ thống (xác thực giữa dịch vụ, phân quyền chi tiết, kiểm toán), Kỷ luật vận
  hành (trực sự cố, post-mortem, di trú dữ liệu lớn).
- `packages/subject-programming/lessons/p6u105..107.ts` — bài `backend-s3` đã có, dùng làn
  `typescript`, mô phỏng bằng hàm thuần tất định. `p6-u105-l1` đã dạy nhất quán cuối cùng —
  chặng S4 nối lại khái niệm này khi bàn đa vùng địa lý (không dạy trùng, chỉ mở rộng ngữ cảnh).
- Mã unit tự do tại thời điểm soạn: `p6-u108` trở đi (`p6-u105…u107` đã dùng cho `backend-s3`).

## 4. Phương án và quyết định

3 unit, đúng khuôn "gộp module khi hợp lý" đã dùng ở các chặng trước:

- `p6-u108` (module m1 "Thiết kế hệ thống quy mô"): ước lượng dung lượng bằng số (QPS trung
  bình/đỉnh, dung lượng lưu) thay vì cảm tính; độ trễ đa vùng địa lý bằng công thức RTT tốc độ
  ánh sáng trong sợi quang, chọn trung tâm dữ liệu gần nhất.
- `p6-u109` (module m2 "Lưu trữ chuyên biệt"): chọn loại kho theo đặc điểm truy vấn (đồ thị,
  chuỗi thời gian, tìm kiếm full-text, quan hệ); đánh đổi LSM tree (ghi rẻ) vs B-tree (đọc rẻ)
  bằng công thức chi phí tường minh.
- `p6-u110` (gộp module m3 "Bảo mật hệ thống" + m4 "Kỷ luật vận hành"): phân quyền chi tiết theo
  nguyên tắc đặc quyền tối thiểu (deny-by-default); phân loại mức độ sự cố (SEV1/2/3) + ngưỡng
  leo thang.

**Phương án khác đã cân nhắc và loại:** 4 unit riêng (1:1 với 4 module) — loại vì m3/m4 đều xoay
quanh "vận hành hệ thống khi có sự cố/rủi ro", gộp vào 1 unit khớp tiền lệ đã dùng ở các chặng
trước và tránh một unit chỉ có 1-2 bài mỏng.

## 5. Phạm vi

### Trong phạm vi

- 3 unit mới trong `curriculum.ts` (`p6-u108…u110`) + 6 bài học 8 bước
  (`lessons/p6u108..110.ts`), làn `typescript`.
- Đăng ký `stageUnits.ts`: `'backend-s4': ['p6-u108', 'p6-u109', 'p6-u110']`.
- Cập nhật `PROGRESS.md` mục "Tiếp theo".

### KHÔNG trong phạm vi

- KHÔNG đổi UI/route mới, không migration, không đổi API.
- KHÔNG soạn bài cho chặng của hướng khác — ngoài phạm vi.

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
