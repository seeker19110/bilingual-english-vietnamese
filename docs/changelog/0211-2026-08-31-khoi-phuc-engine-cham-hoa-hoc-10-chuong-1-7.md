# 0211 — 2026-08-31 — Khôi phục engine chấm + Hoá học 10 Chương 1-7 (17 bài, GĐ3 đợt 1)

Đặc tả: `docs/goals/2026-08-31-mon-hoc-toan-ly-hoa-sinh.md` (Goal mới, milestone dài hạn cho
Toán/Lý/Hoá/Sinh). Đối chiếu mục lục SGK "Kết nối tri thức" Hoá 10 thật (ảnh scan tải từ
`taphuan.nxbgd.vn`, OCR tại chỗ, không commit — xem `tai-lieu-sgk/.gitignore`).

## Đã làm

1. **Khôi phục `packages/core-grading`** (engine chấm Toán · Lý · Hoá dùng chung — thuần, tất
   định, KHÔNG gọi AI trong luồng chấm) — bị xoá ở đợt tái cấu trúc `011a567` (2026-08-23) vì
   "0 nơi dùng" lúc đó. Khôi phục từ commit cha `4a44a62` (bản có `package.json`/`tsconfig.json`
   composite thật, trước khi bị xoá). 86 test pass, `tsc -b` sạch. Gắn lại vào
   `tsconfig.packages.json`.
2. **`packages/subject-chemistry`** — package mới, khuôn theo `subject-programming`:
   - `data/periodicTable.ts`: bảng tuần hoàn 36 nguyên tố đầu (Z=1..36) — dữ liệu khoa học công
     khai, đủ cho toàn bộ chương trình THCS+THPT.
   - `data/solubilityTable.ts`: bảng tính tan rút gọn (15 cation × 8 anion phổ biến) + dãy hoạt
     động hoá học kim loại.
   - `lessonTypes.ts`: `ChemLessonSchema` (Zod) — khuôn bài học Hoá (hook → theory → worked
     example → checkQuestions chấm bằng `AnswerSpec` của `core-grading` → SRS cards). Trường
     `reviewStatus` BẮT BUỘC (`'draft' | 'reviewed'`) — mọi bài soạn đợt này là `'draft'` vì nội
     dung lấy từ `docs/research/kho-kien-thuc-hoa-gdpt2018.md`, file đó tự ghi "CHƯA DUYỆT
     CHUYÊN MÔN".
   - `lessons/hoa10c{1..7}.ts`: **17 bài Hoá 10 đủ 7 chương** — Cấu tạo nguyên tử (4 bài), Bảng
     tuần hoàn (4 bài), Liên kết hoá học (4 bài), Phản ứng oxi hoá-khử (1 bài), Năng lượng hoá
     học (1 bài), Tốc độ phản ứng (1 bài), Nhóm halogen (2 bài) — khớp đúng thứ tự SGK thật (đối
     chiếu `tai-lieu-sgk/SGK-Hoa/10/page_0004.png` + `page_0005.png`, OCR 2026-08-31). Mỗi bài
     có 1 worked example tự soạn (không chép đề SGK — ranh giới bản quyền §0.2
     `kho-kien-thuc-toan-gdpt2018.md`) + 2 checkQuestions.
3. **Test canh gác chất lượng** (`lessons.test.ts`): mọi bài qua `ChemLessonSchema`, id duy
   nhất, mọi bài có `reviewStatus`, và — quan trọng nhất — **mọi checkQuestion tự chấm ĐÚNG
   THẬT bằng chính `gradeAnswer()` của `core-grading`** khi trả lời đúng đáp án đã khai. Đây là
   cổng chặn lỗi "soạn câu hỏi nhưng đáp án không tự chấm được" trước khi nội dung lên production.

## Luật số 1 & bất biến giữ nguyên (có test canh)

- KHÔNG có AI trong luồng chấm — mọi `checkQuestions` dùng `AnswerSpec`/`gradeAnswer()` thuần,
  tất định (đúng nguyên tắc bất di bất dịch của `core-grading`, xem `index.ts` dòng đầu file).
- Nội dung lý thuyết + worked example **tự soạn 100%**, không chép văn/đề từ SGK — chỉ dùng công
  thức/định luật (sự thật khoa học, không bản quyền).
- Mọi bài đánh dấu `reviewStatus: 'draft'` — KHÔNG coi là nội dung cuối cùng, chờ giáo viên Hoá
  duyệt theo đúng cổng đã ghi ở `kho-kien-thuc-hoa-gdpt2018.md` §5.

## Cố ý KHÔNG làm (đúng phạm vi đợt 1, còn lại là đợt sau)

- Chưa nối `subject-chemistry` vào UI (`SubjectDetail.tsx`, API `/api/subjects`) — đợt này chỉ
  dựng xong dữ liệu + engine, nối UI là slice riêng sau khi có đủ Hoá 10-12.
- Chưa viết Hoá 11, Hoá 12 (tổng 55 bài còn lại) — xem `docs/goals/2026-08-31-mon-hoc-toan-ly-hoa-sinh.md`
  M2/S1, M2/S2.
- Chưa làm Vật lí, Sinh học, Toán — thứ tự đã chốt trong `kho-kien-thuc-hoa-gdpt2018.md`: Hoá →
  Lý → Sinh; Toán làm đợt riêng.
- Chưa có migration DB nào (bài học vẫn là hằng biên dịch trong package, giống cách
  `subject-programming` đang làm).

## Bằng chứng

- `npx vitest run packages/subject-chemistry packages/core-grading` ✅ 92/92 test (3 file:
  `edge.test.ts` 34 · `grading.test.ts` 52 · `lessons.test.ts` 6, trong đó có kiểm chấm thật cho
  34 checkQuestions của 17 bài).
- `npx tsc -b packages/subject-chemistry packages/core-grading` ✅ sạch (0 lỗi).
- `npx eslint packages/subject-chemistry packages/core-grading --max-warnings 0` ✅ 0 cảnh báo.
- `npx prettier --check` ✅ (đã `--write` format lại toàn bộ file mới).
- **Xác nhận không phá gì cũ**: `git stash` rồi chạy `tsc -b tsconfig.packages.json` trên baseline
  → 415 lỗi TS pre-existing ở các package khác (`core-personal`, `subject-programming` —
  vấn đề build order/thiếu deps đã có từ trước, không liên quan PR này). Lọc riêng
  `subject-chemistry`/`core-grading` trong output đầy đủ → 0 lỗi.
