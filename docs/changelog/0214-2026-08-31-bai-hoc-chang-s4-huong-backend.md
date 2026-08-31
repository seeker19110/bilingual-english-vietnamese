# 0214 — Bài học 8 bước thật cho chặng backend-s4 (1 PR)

- **Ngày:** 2026-08-31
- **PR:** #
- **Đặc tả:** `docs/specs/2026-08-31-bai-hoc-chang-s4-huong-backend.md`

## Việc đã làm

Soạn 6 bài học 8 bước thật cho chặng `backend-s4` "Chuyên gia — quy mô lớn và trách nhiệm vận
hành" của hướng chuyên sâu Backend (`specializations/backend.ts`, 4 module), ở 3 unit mới,
làn `typescript`:

- `p6-u108` (module m1 "Thiết kế hệ thống quy mô"): ước lượng dung lượng (QPS trung bình/đỉnh,
  dung lượng lưu) bằng số thay vì cảm tính; độ trễ đa vùng địa lý qua công thức RTT tốc độ ánh
  sáng trong sợi quang, chọn trung tâm dữ liệu gần nhất.
- `p6-u109` (module m2 "Lưu trữ chuyên biệt"): chọn loại kho theo đặc điểm truy vấn (đồ thị,
  chuỗi thời gian, tìm kiếm full-text, quan hệ); đánh đổi LSM tree vs B-tree bằng công thức chi
  phí.
- `p6-u110` (gộp module m3 "Bảo mật hệ thống" + m4 "Kỷ luật vận hành"): phân quyền chi tiết theo
  nguyên tắc đặc quyền tối thiểu (deny-by-default); phân loại mức độ sự cố (SEV1/2/3) + ngưỡng
  leo thang.

Đăng ký cầu nối `specializations/stageUnits.ts`: `'backend-s4': ['p6-u108', 'p6-u109', 'p6-u110']`.

## Quyết định kèm theo

- Giữ đúng khuôn "gộp module khi hợp lý" đã dùng ở các chặng trước (m3+m4 cùng xoay quanh vận
  hành hệ thống khi có sự cố/rủi ro).
- `p6-u108` tự soạn trực tiếp; `p6-u109`/`p6-u110` giao 2 subagent song song với brief chi tiết
  (kèm cảnh báo lặp lại về bẫy substring-collision đã dính nhiều lần trong dự án).
- Phát hiện và sửa 2 lỗi khi tự chạy lại bộ kiểm thật (không phải chỉ tin báo cáo subagent):
  - `p6-u108-l1`: một testCase ẩn kỳ vọng "QPS dinh: 600" nhưng sampleSolution chỉ có MỘT bộ số
    hardcode cho ra "QPS dinh: 1000" — sửa bằng cách đổi testCase ẩn thành kiểm cả 3 dòng output
    đúng thứ tự của chính bộ số đó, thay vì một giá trị không thể xảy ra.
  - `p6-u109-l2`: 2 testCase kỳ vọng output chỉ có `["LSM"]`/`["B-tree"]` riêng lẻ nhưng
    sampleSolution luôn in JSON của CẢ mảng workload cùng lúc — sửa bằng cách thêm 2 cặp tỉ lệ
    cực đoan (0.95/0.05 và 0.05/0.95) vào chính mảng `WORKLOAD` (starterCode lẫn sampleSolution),
    rồi kiểm bằng substring khớp với output thật của mảng đầy đủ.
  - `p6-u110-l2`: `parsons.lines` có 13 dòng, vượt giới hạn Zod (≤12) — gộp dòng khai báo tham số
    hàm `phanLoaiMucDo` (4 dòng) thành 1 dòng.

## Bằng chứng kiểm chứng

- `npx tsc -b packages/subject-programming` sạch.
- `npx vitest run packages/subject-programming`: 49/49 file, 2896/2896 test xanh (bao gồm
  `lessonsTs.test.ts`, `lessons.test.ts`, `srsCards.test.ts`, `specializations/stageUnits.test.ts`).
- `npm run typecheck` sạch (cả 4 tsconfig).
- `npm run lint` (`--max-warnings 0`) sạch.
- `npm run build` thành công (app + server + hub).
- `npm run budget`: Initial JS 127,35/140 kB (còn 12,65 kB), CSS 16,79/18 kB (còn 1,21 kB) — vẫn
  trong hạn mức.
