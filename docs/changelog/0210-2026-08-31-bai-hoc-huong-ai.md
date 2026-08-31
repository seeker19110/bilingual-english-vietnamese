# 0210 — Bài học 8 bước thật cho stageUnits.ts của hướng chuyên sâu AI (1 PR)

- **Ngày:** 2026-08-31
- **PR:** (điền khi tạo)

## Việc đã làm

Khép nốt chặng `ai-s1` (module "Đánh giá tự động" + "An toàn và chi phí" của
`specializations/ai.ts`) bằng bài học 8 bước thật, rồi đăng ký cầu nối `ai-s1` vào
`specializations/stageUnits.ts` — chặng chuyên sâu AI S1 giờ đã có nút "Vào học" thật thay vì
hứa suông.

- `p6-u1` (đã có từ trước, chưa từng đăng ký) phủ 2/4 module: gọi mô hình đúng cách + RAG (3
  bài: truy hồi cosine, cắt tài liệu, gọi API có thử lại phân loại lỗi).
- Thêm 2 unit mới trong `curriculum.ts` + 2 file bài học mới, khép nốt 2/4 module còn lại:
  - `p6-u64` (`lessons/p6u64.ts`, module "Đánh giá tự động"): l1 bộ dữ liệu vàng & recall@k
    của khâu truy hồi; l2 cổng chặn hồi quy chất lượng trong CI (so điểm mới với baseline có
    dung sai, đúng ruột `npm run eval:tutor` + `docs/research/eval-tutor-baseline.md` của
    chính dự án này).
  - `p6-u65` (`lessons/p6u65.ts`, module "An toàn và chi phí"): l1 định tuyến model theo độ
    khó + đếm lượt theo gói (đúng luật CLAUDE.md mục 7 "mọi lệnh gọi AI phải đếm/giới hạn
    lượt"); l2 nhận diện tiêm lệnh (prompt injection) bằng dò cụm từ cảnh báo.
- Đăng ký `stageUnits.ts`: `'ai-s1': ['p6-u1', 'p6-u64', 'p6-u65']`.
- Cả 4 bài dùng làn `python` thuần, tất định tuyệt đối, không gọi mô hình thật (đúng luật P4
  §5 — môn không proxy khoá bên thứ ba).

## Quyết định kèm theo

- Không tạo module riêng 1:1 cho từng module của `ai-s1` — theo đúng tiền lệ `web-s1`/
  `backend-s1` (3 unit cho 4–5 module, gộp nội dung liên quan vào cùng unit khi hợp lý).
  `p6-u1` (2 module) + `p6-u64` + `p6-u65` (mỗi unit 1 module) khớp mẫu 3-unit đã có.
- Không đụng tới `p6-u1` (giữ nguyên nội dung cũ) — chỉ đăng ký nó vào `stageUnits.ts` lần
  đầu, đúng luật "chỉ thêm dòng khi unit đã có bài thật".

## Bằng chứng kiểm chứng

- `npm run typecheck` sạch (cả `tsc -b packages/subject-programming` riêng).
- `npm run lint` (`--max-warnings 0`) sạch.
- `npm run build` (client + server + hub) thành công; `npm run budget` vẫn trong hạn mức
  (JS 127,22/140 kB, CSS 16,79/18 kB — cả hai còn dư, không chặn CI).
- `npx vitest run packages/subject-programming` — **44/44 file test, 2572/2572 test xanh**,
  bao gồm `lessonsPython.test.ts` (chạy python3 thật cho cả 4 bài mới) và
  `specializations/stageUnits.test.ts` (xác nhận `ai-s1` tra ra chặng thật, 3 unit đều có bài
  thật trong curriculum).
- Một lỗi phát hiện lúc chấm và đã sửa: bộ chấm ECHO lại từng dòng `input()` ra stdout, nên ca
  kiểm nhiều dòng nối liền bằng `\n` cho vòng lặp đọc-rồi-in bị chen dòng echo ở giữa — tách
  thành 3 ca kiểm riêng từng dòng thay vì một chuỗi nối liền.

## Việc tiếp theo (không nằm trong đợt này)

- Chặng `ai-s2`/`ai-s3`/`ai-s4` (học máy cổ điển, học sâu, MLOps) vẫn chưa có bài học 8 bước
  thật — chưa đăng ký vào `stageUnits.ts`, giống đa số chặng khác của 14 hướng (đúng tiền lệ,
  soạn dần theo đợt).
