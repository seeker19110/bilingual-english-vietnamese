# 0207 — 2026-08-31 — Lộ trình mục tiêu "Kỹ Sư Trưởng AI" (đợt 1/4: hạ tầng manifest)

Đặc tả: `docs/specs/2026-08-31-khoa-hoc-ky-su-truong-ai.md` (4 đợt, đã người dùng duyệt thi
hành theo phương án đề xuất). Đợt này là đợt 1 — hạ tầng thuần dữ liệu, không AI, không
migration.

## Vì sao

Bối cảnh nghiên cứu repo `ai-engineering-from-scratch` (523 bài/20 phase, cá nhân hoá bằng
"learning path manifest" trỏ vào nội dung có sẵn). Môn Lập trình DHCB đã có 3 tầng (xương sống
P1–P6 · 14 hướng chuyên sâu · khoá ngắn) nhưng chưa có tầng LẮP GHÉP chặng của nhiều hướng
thành một con đường tới một đích nghề. Lộ trình đầu tiên: "Kỹ Sư Trưởng AI" — người nắm nhiều
trục AI cùng lúc (toán → dữ liệu → AI → vận hành) và biết vận hành AI hiệu quả ở tầm quyết
định, không chỉ giỏi một mảng.

## Đã làm

1. **Tầng `learningPaths/` mới** trong `packages/subject-programming/` (khuôn giống hệt
   `specializations/registry.ts`): `types.ts` (kiểu `LearningPath`/`PathPhase`/`PathStageRef`),
   `registry.ts` (tra cứu, không đoán bừa id lạ), `principal-ai.ts` (manifest 5 giai đoạn,
   22 chặng lắp từ 8 hướng đã có: `mathforcode` → `data`+`backend` → `ai` S1→S4 trọn vẹn →
   `devops`+`security`+`architecture` → P5 "Tầm trưởng" đang soạn, đợt 4).
2. **Luật vàng giữ nguyên**: manifest CHỈ THAM CHIẾU `stageId` có thật qua `getSpecStage()`,
   không nhúng nội dung. Test canh (`learningPaths.test.ts`, 12 ca): mọi stageId tra ra được,
   không trùng, `requires` không vòng lặp (chỉ trỏ chặng đứng trước trong cùng lộ trình), mọi
   ô văn bản không rỗng, P1–P4 có chặng thật còn P5 rỗng đúng như đặc tả chốt.
3. **Trang mới** `/lap-trinh/lo-trinh/:pathId` (`ProgrammingPathPage.tsx`, nạp lười): hiện đủ
   5 giai đoạn, mỗi chặng có lý do (`why`), trạng thái xong đọc từ tiến độ hướng sẵn có
   (`specProgressService`/`fetchSpecProgress` — đợt này CHỈ ĐỌC, tiến độ riêng của lộ trình
   là việc đợt 2). Nút "Vào học" CHỈ hiện ở chặng đã có bài thật (`unitsOfStage`), giai đoạn
   `stages: []` hiện rõ "đang soạn" — không hứa suông, cùng luật `stageUnits.ts`.
4. **Lối vào** từ `ProgrammingHome.tsx`: khối "Lộ trình mục tiêu" mới, tách khỏi khối hướng
   chuyên sâu và khoá ngắn.
5. Route mới trong `App.tsx`, đặt trước `:levelId` (cùng lý do `/huong` và `/khoa-hoc`).

## Cố ý KHÔNG làm (đúng phạm vi đợt 1 trong đặc tả)

Chẩn đoán chọn điểm vào, tiến độ riêng của lộ trình, quiz, kho artifact, Companion, nội dung
P5 — bốn việc đó là đợt 2/3/4, tách PR riêng theo đặc tả.

## Bằng chứng

- `npm run typecheck` ✅ (4 project) · `npm run lint` ✅ (0 cảnh báo) ·
  `npx vitest run` ✅ 512 file / 8304 test (bao gồm 12 ca `learningPaths.test.ts` +
  4 ca `ProgrammingPathPage.test.tsx` mới) · `npm run build` ✅ (dhcb + server + hub) ·
  `npm run budget` ✅ JS 127,07/140kB (90,8%) · CSS 16,64/18kB (92,5%) · coverage branches
  90,15/90 (dư 0,15 điểm — MỎNG, đã đo lại đúng lúc, cần chú ý ở đợt sau).
- `npm run codemap -- impact` cho `App.tsx` và `ProgrammingHome.tsx`: chỉ lan tới `main.tsx` —
  không phá tính năng khác.
