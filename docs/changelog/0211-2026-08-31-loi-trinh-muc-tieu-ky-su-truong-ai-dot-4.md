# 0211 — 2026-08-31 — Lộ trình mục tiêu "Kỹ Sư Trưởng AI" (đợt 4/4: nội dung P5 "Tầm trưởng" — HOÀN TẤT LỘ TRÌNH)

Đặc tả cha: `docs/specs/2026-08-31-khoa-hoc-ky-su-truong-ai.md` (đợt 4, nối tiếp đợt 3 —
`docs/changelog/0210-*.md`, PR #771). Đặc tả con (chi tiết từng chặng trước khi soạn, theo
đúng yêu cầu của đặc tả cha): `docs/specs/2026-08-31-dot-4-p5-tam-truong.md`.

## Đã làm

1. **4 chặng RIÊNG của lộ trình** `principal-s1…s4` (KHÔNG phải hướng chuyên sâu thứ 15) —
   file mới `learningPaths/pathStages.ts` theo đúng khuôn `SpecStage` để dùng lại UI chặng
   sẵn có, cùng `getPathStage()`/`resolveStage()` (thử tầng hướng chuyên sâu trước, rồi tới
   chặng riêng của lộ trình). Nội dung: `principal-s1` Vận hành AI hiệu quả (đặc tả 6 ô + eval
   - ngân sách chi phí) · `principal-s2` Hệ tác tử & MCP (tự cài vòng lặp agent, tool-use an
     toàn, MCP) · `principal-s3` Quyết định kiến trúc AI bằng ADR (build vs buy, RAG vs
     fine-tune, chọn model) · `principal-s4` Dẫn dắt & trách nhiệm (review code AI, post-mortem
     không đổ lỗi).
2. **16 bài học 8 bước thật** trong 8 unit mới `p6-u94…p6-u101` (2 bài/unit), soạn song song
   bằng 4 agent (mỗi agent 1 chặng, chỉ đụng đúng 2 file lesson của mình để không xung đột) rồi
   tích hợp và kiểm chứng lại toàn bộ ở phiên chính. Ngôn ngữ: `python` (6 unit) và
   `javascript` (2 unit, `principal-s2`).
3. **Điền P5 vào manifest** `principal-ai.ts`: 4 `PathStageRef` với `requires` tuyến tính
   (s1→s2→s3→s4), P5 hết trạng thái "đang soạn" (`isPhaseDrafting === false`).
4. **Quiz cho cả 4 chặng P5** (20 câu mới trong `stageQuizzes.ts`).
5. **Trang chặng lộ trình mới** `ProgrammingPathStagePage.tsx`
   (`/lap-trinh/lo-trinh/:pathId/chang/:stageId`, nạp lười): tên/can-do/module/dự án của chặng
   - danh sách bài học theo unit + quiz cổng lộ trình. `ProgrammingPathPage.tsx` rẽ nhánh nút
     "Vào học": chặng thuộc hướng chuyên sâu → `/lap-trinh/huong/...` như cũ, chặng riêng của lộ
     trình → trang mới.
6. **Cấp mã unit `p6-u94…p6-u101`**, dải "để dành cho S2/S3 của 11 hướng còn lại" dời tiếp
   xuống `p6-u102+` — cập nhật `docs/specs/2026-08-27-dai-ma-unit-s1-cac-huong-con-lai.md`.

## Quyết định phát sinh khi thi hành (khác đề xuất ban đầu của đặc tả cha)

- **Không cần `agentSim`.** Đặc tả cha đề xuất cân nhắc mô phỏng agent tương tác riêng (tiền
  lệ `swiftsim`) cho `principal-s2`. Thực tế soạn bài cho thấy KHÔNG cần: vòng lặp agent, tool
  dispatch, validate tham số, MCP đều dạy và CHẤM được bằng code Python/JavaScript thuần qua
  cổng test-case sẵn có — không phải mô phỏng một hệ thống ngoài.
- **`match: 'contains'` thay vì `'exact'` cho nhiều bài Make đọc >1 dòng qua `input()` liên
  tiếp.** Cổng chấm (`lessonsPython.test.ts`/`lessonsJs.test.ts`) mô phỏng ĐÚNG hành vi sandbox
  trình duyệt: mỗi lần gọi `input()` ECHO `prompt+value` ra stdout. Với nhiều lượt `input()`
  trong một bài, dòng echo chèn XEN GIỮA các dòng kết quả in ra, phá vỡ khối liên tiếp mà
  `exact` (hoặc `contains` với `expected` nhiều dòng liền) cần khớp. Sửa bằng cách chuyển
  `match: 'contains'` (mặc định của dự án, đúng khuôn `mlu1.ts`) và với `p6-u94-l2` đổi từ
  "đọc n rồi n dòng" sang "đọc 1 dòng, các câu cách nhau dấu chấm phẩy" để chỉ còn một lượt
  `input()`. Bài học rút ra, đã ghi lại trong đặc tả con: bài Make dùng nhiều lượt `input()`
  liên tiếp phải TỰ CHẠY QUA cổng chấm thật trước khi chốt nội dung, không suy luận bằng tay.
- **2 cặp lựa chọn Predict trùng substring với đáp án đúng** (`p6-u95-l2`: "500"/"5" là substring
  của "5000"; `p6-u98-l2`: "100" là substring của "10000"; `p6-u96-l2`: "0" là substring của
  "20") bị cổng chặn đúng như thiết kế (`lessonsPython.test.ts`/`lessonsJs.test.ts` kiểm
  "không lựa chọn sai nào khớp output") — đã đổi sang lựa chọn không trùng.

## Bất biến giữ nguyên (có test canh)

- Lộ trình chỉ THAM CHIẾU chặng có thật, không nhúng nội dung — `learningPaths.test.ts` đổi
  sang `resolveStage()` để chấp nhận cả chặng của hướng chuyên sâu lẫn chặng riêng của lộ trình.
- `SPEC_STAGE_UNITS` chỉ nhận unit đã có bài thật — `stageUnits.test.ts` (đổi sang
  `resolveStage()`).
- `PROGRAMMING_SPECIALIZATIONS` vẫn đúng 14 hướng — `principal-s1…s4` KHÔNG lọt vào sổ này,
  test mới `pathStages.test.ts` canh riêng (kiểm `getSpecStage('principal-s1')` phải
  `undefined`).
- Mọi bài Make `sampleSolution` đạt HẾT test-case chạy THẬT bằng python3/`node:vm`, đáp án
  Predict khớp đúng và không lựa chọn sai nào trùng — `lessonsPython.test.ts` /
  `lessonsJs.test.ts` (277 + 22 test, gồm cả nội dung cũ).
- `suggestEntry()` (chẩn đoán đợt 2) vẫn tất định; hành vi mới khi P5 có nội dung nhưng chưa
  có câu hỏi chẩn đoán phủ P5: coi P5 là "chưa vững" (bảo thủ — chưa hỏi thì chưa miễn), entry
  lùi vào P5 thay vì dừng ở cuối P4 — cập nhật `diagnostic.test.ts` theo đúng hành vi mới, có
  chủ đích (không phải regressive).

## Cách làm: 4 agent soạn nội dung song song, phiên chính tích hợp + kiểm chứng lại

Nội dung 16 bài là phần đắt nhất — giao cho 4 `standard-worker` chạy song song, mỗi agent CHỈ
tạo đúng 2 file lesson (`lessons/p6u9X.ts`, `lessons/p6u9Y.ts`) của một chặng, không đụng file
khác nên không xung đột khi gộp lại. Mỗi agent tự claim đã chạy python3/node thật kiểm sampleSolution
— nhưng khi phiên chính chạy LẠI đúng cổng CI thật (`lessonsPython.test.ts`/`lessonsJs.test.ts`,
mô phỏng CHÍNH XÁC cơ chế echo của sandbox trình duyệt) thì phát hiện 13 ca lỗi mà cách agent tự
kiểm (chạy `python3`/`node` trực tiếp, không mô phỏng echo) không bắt được — xem mục "Quyết định
phát sinh" ở trên. Bài học quy trình: **giao song song rút ngắn thời gian soạn, nhưng cổng CI
thật của phiên chính mới là bằng chứng cuối cùng — không tin báo cáo "đã tự kiểm" của agent nếu
chưa tự chạy lại đúng cổng đó.**

## Bằng chứng

- `npx vitest run packages/subject-programming` ✅ 49 file / 2700 test (bao gồm 16 bài mới qua
  đủ Zod + python3/`node:vm` thật).
- `npm run typecheck` ✅ (4 project) · `npm run lint` ✅ (0 cảnh báo) · `npm test` (toàn repo)
  ✅ 526 file / 9182 test · `npm run build` ✅ (dhcb + server + hub) · `npm run budget` ✅ JS
  127,34/140kB (91,0%) · CSS 16,79/18kB (93,3%) — trang chặng mới nạp lười, không vào initial JS.
