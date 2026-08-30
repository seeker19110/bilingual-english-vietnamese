# Feature spec: Toán học cho Lập trình (hướng chuyên sâu thứ 14, xuyên môn Toán + Lập trình)

| Thuộc tính   | Giá trị                                   |
| ------------ | ----------------------------------------- |
| Issue        | #                                         |
| Spec owner   | Claude (phiên làm việc 2026-08-30)        |
| Trạng thái   | **Approved for implementation**           |
| Người duyệt  | Chủ dự án (donghanhcungban.org@gmail.com) |
| Ngày duyệt   | 2026-08-30                                |
| Lần cập nhật | 2026-08-30                                |

> Không bắt đầu code khi trạng thái chưa là **Approved for implementation**.

## 1. Tóm tắt quyết định

Người dùng yêu cầu trực tiếp trong phiên: "nghiên cứu ứng dụng môn toán trong lập trình, tạo
thành 1 khoá học trong cả môn học toán và môn học lập trình", sau đó xác nhận làm **cả 4 chặng
luôn, chi tiết đầy đủ** khi được hỏi lại phạm vi. Giải pháp: thêm một **hướng chuyên sâu thứ 14**
của môn Lập trình — `mathforcode` ("Toán học cho Lập trình") — theo đúng khuôn dữ liệu đã có ở
`packages/subject-programming/specializations/` (giống hai hướng nền cắt ngang `algo`/
`architecture`: học song song một hướng sản phẩm, không thay thế), đủ 4 chặng S1→S4 từ cơ bản
đến nâng cao. Đồng thời thêm một mục chương trình tương ứng vào dữ liệu môn Toán
(`STEM_CURRICULUM.mathematics` trong `apps/dhcb/src/data/stemCurriculum.ts`) để khoá học hiện
diện ở CẢ HAI môn như yêu cầu.

## 2. Vấn đề, người dùng và bằng chứng

- Persona/job-to-be-done: người học đã qua P3 môn Lập trình (biết hàm, list, một chút OOP)
  muốn hiểu THẬT SỰ toán đứng sau thuật toán/AI mình dùng, thay vì thuộc công thức mà không cài
  lại được bằng code.
- Hiện trạng và pain point: môn Toán (`STEM_CURRICULUM`) và môn Lập trình (`specializations/`)
  vốn tách biệt hoàn toàn — không có nội dung nào nối trực tiếp "công thức toán" với "code chạy
  được". 13 hướng chuyên sâu hiện có của Lập trình không có hướng nào về toán ứng dụng.
- Baseline định lượng/định tính: yêu cầu trực tiếp của chủ dự án trong phiên làm việc, không có
  baseline người dùng khác (tính năng nội dung học liệu, không phải thay đổi hành vi hệ thống).
- Nguồn bằng chứng: hội thoại phiên này (không có link ngoài).
- Vì sao cần làm bây giờ: chủ dự án yêu cầu trực tiếp, phạm vi đã chốt rõ (4 chặng, chi tiết đầy
  đủ), không có phụ thuộc chặn.

## 3. Nghiên cứu hiện trạng

### Code và luồng hiện tại

- `packages/subject-programming/specializations/types.ts` — hợp đồng kiểu `SpecializationId`
  (union 13 giá trị cố định), `ProgrammingSpecialization`, `SpecArchitecture`, `SpecStage`.
- `packages/subject-programming/specializations/stageDetailTypes.ts` — hợp đồng chi tiết chặng
  (`SpecStageDetail`, `SpecModuleDetail`, `SpecRubricItem`, `SpecBrief` 6 ô).
- `packages/subject-programming/specializations/algo.ts` +
  `specializations/details/algo-s1..s4.ts` — ví dụ tham chiếu đầy đủ của một hướng NỀN cắt
  ngang (đúng mẫu áp dụng cho `mathforcode`).
- `packages/subject-programming/specializations/registry.ts` +
  `specializations/stageDetails.ts` — hai sổ đăng ký phải thêm hướng mới vào.
- `packages/subject-programming/specializations.test.ts` +
  `specStageDetails.test.ts` — test bất biến khuôn dạng, có hardcode số lượng hướng (13) cần
  cập nhật đúng số mới (14) khi thêm hướng — KHÔNG nới lỏng assertion nào khác.
- `apps/dhcb/src/data/stemCurriculum.ts` + `stemCurriculum.test.ts` — dữ liệu môn Toán theo
  khối lớp/chương/công thức/bài mẫu; đã có tiền lệ nhiều mục `grade: 'university'` cho cùng môn.
- `packages/subject-programming/specializations/stageUnits.ts` — tầng "đã có bài học 8 bước
  thật" là tầng RIÊNG, tách khỏi bản đồ hướng; đa số hướng (kể cả `mathforcode`) chưa cần có
  mục ở đây khi mới thêm bản đồ — đúng tiền lệ 9/13 hướng hiện tại.

### Nghiên cứu người dùng/sản phẩm

Đây là nội dung học liệu tĩnh (hằng biên dịch), không có luồng người dùng mới, không đổi
API/DB/UI logic ngoài text hiển thị số lượng hướng ("13 hướng" → "14 hướng") ở
`ProgrammingSpecializationPage.tsx`. Không phát sinh rủi ro accessibility/bảo mật mới.

### Nghiên cứu kỹ thuật/nguồn ngoài

Nội dung toán học tham chiếu kiến thức phổ thông/đại học chuẩn (hệ đếm/bù 2, đại số Boolean,
số học modulo, độ phức tạp Big-O, tổ hợp/xác suất rời rạc, đại số tuyến tính ứng dụng, giải
tích/gradient descent) — không trích dẫn nguồn có thể lỗi thời, chỉ liệt kê tên sách kinh điển
trong trường `resources` (không dùng link, theo quy ước dự án).

## 4. Phương án và quyết định

**Đã chọn:** hướng chuyên sâu thứ 14 `mathforcode`, cờ `crossCutting: true`, `prerequisite: 'p3'`,
ngôn ngữ chính Python. 4 chặng:

- **S1 — Nền tảng rời rạc:** hệ đếm & bù 2 (vì sao dấu phẩy động làm tròn sai), đại số Boolean
  & De Morgan, số học modulo (hashing, kiểm tra ISBN/thẻ), Big-O bằng ngôn ngữ toán chặt chẽ.
- **S2 — Tổ hợp & xác suất:** đếm/hoán vị/tổ hợp (sinh test case), xác suất rời rạc & kỳ vọng
  (rate limiting, A/B testing, va chạm hash), PRNG & seed, thống kê mô tả cho đo hiệu năng.
- **S3 — Đại số tuyến tính ứng dụng:** vector/ma trận (biến đổi ảnh/đồ hoạ 2D), hệ phương trình
  tuyến tính, không gian trạng thái & giá trị riêng ở mức trực giác (nền PageRank/ML).
- **S4 — Giải tích & tối ưu cho AI/ML:** đạo hàm & gradient descent tự cài bằng Python thuần,
  hàm mất mát, đạo hàm riêng phần/backprop trực giác, ứng dụng tối ưu vào bài toán thực tế.

**Phương án khác đã cân nhắc và loại:** gộp nội dung này vào hướng `algo` sẵn có — loại vì
`algo` đã có phạm vi riêng (giải thuật/độ phức tạp cho phỏng vấn) và gộp thêm toán tuyến
tính/giải tích sẽ làm hướng đó phình quá rộng, khó đo "xong chặng" rõ ràng.

## 5. Phạm vi

### Trong phạm vi

- Bản đồ hướng `mathforcode` (`specializations/mathforcode.ts`) đủ 4 chặng, kiến trúc 5 ô.
- Chi tiết 4 chặng (`specializations/details/mathforcode-s1..s4.ts`) đủ module/rubric/specBrief.
- Đăng ký vào `registry.ts` + `stageDetails.ts`.
- Cập nhật số đếm hardcode ở test + text hiển thị liên quan trực tiếp ("13 hướng" → "14 hướng").
- Thêm 1 mục `grade: 'university'` mới vào `STEM_CURRICULUM.mathematics` với 4 chương tương ứng
  S1–S4, mỗi chương ≥1 công thức + ≥1 bài mẫu có lời giải từng bước.

### KHÔNG trong phạm vi

- KHÔNG soạn bài học 8 bước thật (Predict/Parsons/Make) cho hướng này ở đợt này — giống 9/13
  hướng hiện có, tầng `stageUnits.ts` để trống cho tới khi có đợt soạn bài riêng.
- KHÔNG đổi UI/route mới — dùng lại trang hướng chuyên sâu hiện có (`ProgrammingSpecializations`,
  `ProgrammingSpecStagePage`, `ProgrammingSpecializationPage`) vốn đã tổng quát hoá theo registry.
- KHÔNG đổi logic chấm điểm/tiến độ (out of scope, tầng dữ liệu tĩnh không đụng DB/API).

## 6. Tiêu chí chấp nhận (đo được)

- `npm run typecheck` sạch.
- `npx vitest run packages/subject-programming apps/dhcb/src/data/stemCurriculum.test.ts` xanh
  100%, bao gồm `specializations.test.ts` (14 hướng, cross-cutting
  `['algo','architecture','mathforcode']`, `specializationsOpenAt('p5')` = 14) và
  `specStageDetails.test.ts` (phủ đủ 4×14 = 56 chặng có chi tiết).
- `npm run lint` (`--max-warnings 0`) sạch.
- Text "13 hướng" còn sót ở nơi liên quan trực tiếp (không phải changelog lịch sử) đã cập nhật.

## 7. Rủi ro, rollout, rollback

- Rủi ro thấp: chỉ thêm dữ liệu hằng biên dịch + cập nhật số đếm trong test hiện có, không đổi
  schema DB, không đổi API, không đổi luồng auth/thanh toán.
- Rollout: đi theo PR thường, không cần feature flag (nội dung học liệu tĩnh).
- Rollback: revert PR nếu cần — không có migration, không có dữ liệu người dùng bị ảnh hưởng.
