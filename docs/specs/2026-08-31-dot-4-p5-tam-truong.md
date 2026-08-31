# Đặc tả con — Đợt 4 lộ trình "Kỹ Sư Trưởng AI": giai đoạn P5 "Tầm trưởng"

> Ngày: 2026-08-31 · Đặc tả cha: `docs/specs/2026-08-31-khoa-hoc-ky-su-truong-ai.md` (mục ĐỢT 4).
> Khuôn: `docs/templates/dac-ta-tinh-nang.md`. Đây là đặc tả con "chi tiết từng chặng trước khi
> soạn" mà đặc tả cha yêu cầu.

## 0. Một câu

Soạn 4 chặng P5 `principal-s1…s4` (chặng THUỘC LỘ TRÌNH, không phải hướng thứ 15) với 8 unit ×
2 bài học 8 bước = 16 bài thật + 4 quiz, kèm hạ tầng "chặng của lộ trình" (tra cứu + trang học)
để P5 hết trạng thái "đang soạn".

## ① Phạm vi

**LÀM:**

1. **Chặng lộ trình riêng** — file mới `learningPaths/pathStages.ts` khai 4 chặng đúng khuôn
   `SpecStage` sẵn có (id `principal-s1…s4`, tier s1…s4, đủ modules + project), kèm
   `getPathStage()` và `resolveStage()` = `getSpecStage() ?? getPathStage()`. Lý do dùng lại
   khuôn `SpecStage`: UI chặng (tên, can-do, modules, project) dùng chung được, không bịa khuôn
   mới; nhưng KHÔNG đăng ký vào `PROGRAMMING_SPECIALIZATIONS` — chúng chỉ có nghĩa trong lộ
   trình (đúng đặc tả cha "không phải hướng thứ 15").
2. **Cấp mã unit `p6-u94…p6-u101`** (2 unit/chặng × 4 chặng). Dải "để dành S2/S3" của
   `docs/specs/2026-08-27-dai-ma-unit-s1-cac-huong-con-lai.md` dời từ `u94+` xuống `u102+`
   (sửa ghi chú trong đặc tả đó — không mã đã phát hành nào bị đổi, đúng tiền lệ chính nó).
3. **16 bài học 8 bước** trong `lessons/p6u94.ts…p6u101.ts` (bảng nội dung ở ③), đăng ký vào
   `lessons.ts`, khai 8 unit vào curriculum P6 (`curriculum.ts`).
4. **Nối chặng → unit:** thêm 4 dòng `principal-s1…s4` vào `SPEC_STAGE_UNITS`
   (`stageUnits.ts` — bảng nhận khoá string bất kỳ; test của nó đổi sang `resolveStage`).
5. **Điền P5 của manifest** `principal-ai.ts`: 4 `PathStageRef` (why + requires tuyến tính).
6. **Quiz 4 chặng mới** trong `stageQuizzes.ts` (5 câu/chặng, đúng khuôn hiện có).
7. **Trang chặng lộ trình** `ProgrammingPathStagePage.tsx` — route mới
   `/lap-trinh/lo-trinh/:pathId/chang/:stageId` (nạp lười): tên/can-do/modules/dự án của chặng
   - danh sách bài học theo unit (link sang trang bài sẵn có) + quiz (component `PathStageQuiz`
     sẵn có của đợt 3). `ProgrammingPathPage.tsx`: chặng path-local (tra qua `getPathStage`) thì
     nút "Vào học" trỏ route này thay vì `/lap-trinh/huong/…`.

**KHÔNG LÀM:**

- KHÔNG `agentSim` mới — bài agent/MCP dạy bằng cách TỰ CÀI vòng lặp agent bằng
  JavaScript/Python thuần (chấm test-case tất định được). Sim tác tử tương tác lùi PR riêng
  nếu sau này cần (đúng khuyến nghị đặc tả cha, tiền lệ swiftsim).
- KHÔNG migration, KHÔNG endpoint mới, KHÔNG gọi AI, KHÔNG sửa prompt nào (không đụng
  `feedbackPrompt.ts` / `pathCheckPrompt.ts`).
- KHÔNG sửa 14 hướng, không đổi mã unit/bài đã phát hành.
- KHÔNG import nội dung từ repo tham khảo; soạn thuần tiếng Việt, ví dụ sát Việt Nam.

## ② Điểm chạm

| Việc | File                                                                             | Ghi chú                                        |
| ---- | -------------------------------------------------------------------------------- | ---------------------------------------------- |
| Thêm | `packages/subject-programming/learningPaths/pathStages.ts` (+ test)              | 4 SpecStage + getPathStage/resolveStage        |
| Thêm | `packages/subject-programming/lessons/p6u94.ts … p6u101.ts`                      | 16 bài                                         |
| Sửa  | `packages/subject-programming/lessons.ts`                                        | đăng ký 8 mảng                                 |
| Sửa  | `packages/subject-programming/curriculum.ts`                                     | 8 unit P6 mới                                  |
| Sửa  | `packages/subject-programming/specializations/stageUnits.ts` (+ test)            | 4 dòng principal-\*; test dùng resolveStage    |
| Sửa  | `packages/subject-programming/learningPaths/principal-ai.ts` (+ test)            | điền P5; test "P5 đang soạn" đổi thành "đủ 4"  |
| Sửa  | `packages/subject-programming/learningPaths/stageQuizzes.ts` (+ test)            | 20 câu mới                                     |
| Thêm | `apps/dhcb/src/pages/subjects/programming/ProgrammingPathStagePage.tsx` (+ test) | trang chặng                                    |
| Sửa  | `apps/dhcb/src/App.tsx` · `ProgrammingPathPage.tsx`                              | route + rẽ nhánh nút "Vào học" (codemap trước) |
| Sửa  | `docs/specs/2026-08-27-dai-ma-unit-s1-cac-huong-con-lai.md`                      | dời dải để dành xuống u102+                    |

Import hợp lệ: `learningPaths/pathStages.ts` import kiểu từ `specializations/types.js` (cùng
gói, đúng chiều); `specializations/*` KHÔNG import `learningPaths/*` (chỉ test được phép).

## ③ Nội dung 4 chặng (chốt, thi hành đúng bảng)

Ngôn ngữ bài: chỉ `python` và `javascript` (bộ chấm mạnh nhất hiện có). Mỗi unit 2 bài; mỗi
bài đủ 8 bước theo `LessonSchema`, Make có ≥ 3 test-case (≥ 1 ca ẩn), sampleSolution phải qua
HẾT test-case (cổng `lessonsPython/JsSim` chấm thật trong CI).

### `principal-s1` — Vận hành AI hiệu quả (unit `p6-u94`, `p6-u95`) — python

Can-do: giao việc cho AI bằng đặc tả + đo được chất lượng đầu ra bằng eval + quản được chi phí token.

| Unit     | Bài | Nội dung                                                                                                                                |
| -------- | --- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `p6-u94` | l1  | Đặc tả giao việc cho AI: 6 ô bắt buộc (dạy chính khuôn `docs/templates/dac-ta-tinh-nang.md`); Make: hàm chấm một đặc tả có đủ 6 ô không |
| `p6-u94` | l2  | Tiêu chí chấp nhận ĐO ĐƯỢC vs mơ hồ; Make: phân loại danh sách tiêu chí đạt/không đạt theo luật "có số, có cách đo"                     |
| `p6-u95` | l1  | Eval căn bản: recall/precision trên bộ ca vàng; Make: tự cài tính recall + precision từ 2 danh sách                                     |
| `p6-u95` | l2  | Ngân sách token & chi phí: ước lượng chi phí theo bảng giá, cache prompt; Make: tính chi phí tháng có/không cache, in điểm hoà vốn      |

Dự án chặng: bộ đặc tả + eval hoàn chỉnh cho MỘT tính năng AI tự chọn (nộp làm artifact P5).

### `principal-s2` — Hệ tác tử & MCP (unit `p6-u96`, `p6-u97`) — javascript

Can-do: tự cài vòng lặp agent (nghĩ → gọi tool → đọc kết quả → lặp) và giải thích được MCP là hợp đồng gì.

| Unit     | Bài | Nội dung                                                                                                                              |
| -------- | --- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `p6-u96` | l1  | Vòng lặp agent tối giản: bảng tool + dispatch theo tên; Make: cài `goiTool(ten, thamSo)` tra bảng, tool lạ trả lỗi rõ                 |
| `p6-u96` | l2  | Vòng lặp nhiều bước có điều kiện dừng (max bước, tool "xong"); Make: chạy kịch bản các bước cho trước, log từng bước, dừng đúng lúc   |
| `p6-u97` | l1  | Tool-use an toàn: validate tham số trước khi chạy, allowlist; Make: hàm kiểm tham số theo schema tối giản (kiểu + bắt buộc)           |
| `p6-u97` | l2  | MCP là gì: hợp đồng "liệt kê tool + gọi tool" chuẩn hoá; Make: cài `lietKeTools()`/`goiTheoTen()` cho một "server" mini từ mô tả JSON |

Dự án chặng: agent giải MỘT việc thật (tra cứu + tính toán) có log từng bước đọc lại được.

### `principal-s3` — Quyết định kiến trúc AI bằng ADR (unit `p6-u98`, `p6-u99`) — python

Can-do: ra quyết định build-vs-buy / RAG-vs-fine-tune bằng con số, ghi lại bằng ADR đúng khuôn `docs/templates/adr.md`.

| Unit     | Bài | Nội dung                                                                                                                               |
| -------- | --- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `p6-u98` | l1  | ADR: vì sao quyết định phải ghi lại, khuôn 5 phần (bối cảnh → lựa chọn → quyết định → đánh đổi → hệ quả); Make: kiểm một ADR đủ 5 phần |
| `p6-u98` | l2  | Build vs buy bằng số: chi phí tự vận hành vs thuê API theo lượng dùng; Make: tính điểm hoà vốn theo lượt gọi/tháng                     |
| `p6-u99` | l1  | RAG vs fine-tune: chọn theo tần suất đổi dữ liệu + chi phí cập nhật; Make: hàm khuyến nghị theo luật cho trước, có lý do kèm theo      |
| `p6-u99` | l2  | Chọn model theo chi phí × chất lượng: loại phương án bị áp đảo (dominated); Make: lọc danh sách model, giữ đường biên hiệu quả         |

Dự án chặng: 2 ADR thật có đánh đổi định lượng cho hệ AI của chính bạn (từ P3–P4).

### `principal-s4` — Dẫn dắt & trách nhiệm (unit `p6-u100`, `p6-u101`) — python

Can-do: review công việc AI của người khác có cấu trúc, viết post-mortem không đổ lỗi, nói được rủi ro trước khi thành sự cố.

| Unit      | Bài | Nội dung                                                                                                                                              |
| --------- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `p6-u100` | l1  | Review code AI sinh: checklist 5 điểm (đúng yêu cầu? ca biên? bịa API? bảo mật? test?); Make: chấm báo cáo review đủ mục                              |
| `p6-u100` | l2  | Đọc diff có kỷ luật: ưu tiên theo rủi ro (bảo mật > đúng đắn > hiệu năng > phong cách); Make: sắp danh sách phát hiện theo thứ tự rủi ro              |
| `p6-u101` | l1  | Post-mortem không đổ lỗi: dòng thời gian → nguyên nhân gốc (5 whys) → hành động có chủ; Make: kiểm post-mortem đủ phần + không chứa từ đổ lỗi cá nhân |
| `p6-u101` | l2  | Trách nhiệm khi vận hành AI: sự cố AI khác sự cố thường (âm thầm, xác suất); Make: từ log tỉ lệ lỗi theo ngày, phát hiện ngày vượt ngưỡng cảnh báo    |

Dự án chặng: 1 bản review + 1 post-mortem theo khuôn, làm trên sự cố/PR thật của chính bạn.

### Manifest P5 (điền vào `principal-ai.ts`)

`principal-s1` (không requires) → `principal-s2` (requires s1) → `principal-s3` (requires s2)
→ `principal-s4` (requires s3). `why` mỗi chặng 1 câu theo giọng các phase trước.

## ④ Tiêu chí chấp nhận

- [ ] 16 bài qua Zod `LessonSchema` + sampleSolution đạt HẾT test-case + đáp án Predict là
      output thật và không lựa chọn sai nào khớp (cổng `lessons*.test.ts` hiện có tự chấm).
- [ ] 4 chặng P5 tra được qua `resolveStage`; `unitsOfStage('principal-s1')` trả 2 unit; mọi
      unit có ≥ 1 bài (test `stageUnits.test.ts` cập nhật).
- [ ] Manifest P5 hết drafting: `isPhaseDrafting(phases[4]) === false`, requires tuyến tính
      không vòng (test learningPaths cập nhật — bỏ mệnh đề "P5 đang soạn").
- [ ] 20 câu quiz mới đúng khuôn (4 lựa chọn, answerIndex hợp lệ, stageId tra được qua
      resolveStage — test stageQuizzes cập nhật cách tra).
- [ ] Trang `/lap-trinh/lo-trinh/principal-ai/chang/principal-s1` render tên chặng + bài học +
      quiz; từ trang lộ trình bấm "Vào học" chặng P5 tới được trang này — test component.
- [ ] Không con số năng lực nào rò lên UI; toàn bộ chữ nội dung đạt AAA (dùng token sẵn có).

**Lệnh chứng minh:** `npm run typecheck && npm run lint && npm test && npm run build` (+ E2E
a11y chạy trong CI).

## ⑤ Bất biến không được phá

| Bất biến                                                         | Test canh                        |
| ---------------------------------------------------------------- | -------------------------------- |
| Giữ nguyên toàn bộ bất biến đợt 1–3                              | các test sẵn có                  |
| `SPEC_STAGE_UNITS` chỉ nhận unit đã có bài thật                  | `stageUnits.test.ts`             |
| `PROGRAMMING_SPECIALIZATIONS` vẫn đúng 14 hướng — không hướng 15 | `specializations.test.ts` sẵn có |
| Mã unit/bài đã phát hành không đổi (khoá tiến độ Postgres)       | diff không chạm dữ liệu cũ       |
| Bundle budget: trang mới nạp lười, bài học không vào initial JS  | `npm run budget`                 |

## ⑥ Quy ước dự án

Import xuyên gói `@dhcb/subject-programming/...` không đuôi `.js`, nội bộ gói có đuôi `.js` ·
dữ liệu là hằng biên dịch, không I/O · tiếng Việt trên UI + comment · tiêu đề PR
`feat(programming): ...` · changelog mới trong `docs/changelog/`, không chồng `PROGRESS.md`.

## Nghiệm thu

- **Lệnh đã chạy + kết quả thật:** `npx vitest run packages/subject-programming` → 49 file,
  2700 test, xanh hết (bao gồm `lessonsPython.test.ts` chạy python3 thật cho cả 16 bài mới,
  `lessonsJs.test.ts` chạy node:vm cho unit `p6-u96`/`p6-u97`). `npm run typecheck` sạch.
  `npm run lint` sạch (0 cảnh báo). `npm test` (toàn repo) → 526 file, 9182 test, xanh hết.
  `npm run build` thành công (app chính + hub). `npm run budget` → Initial JS 127,34/140kB
  (còn 12,66kB), CSS 16,79/18kB (còn 1,21kB) — trong ngân sách, trang chặng mới nạp lười.
- **Tiêu chí ④ đạt hết chưa:** đạt hết cả 6 mục.
- **Có phá bất biến ⑤ nào không:** không — đã kiểm bằng test canh cập nhật
  (`stageUnits.test.ts`, `learningPaths.test.ts`, `stageQuizzes.test.ts` chuyển từ
  `getSpecStage` sang `resolveStage` để chấp nhận cả chặng riêng của lộ trình; test mới
  `pathStages.test.ts` canh riêng 4 chặng P5).
- **Có mở rộng ngoài phạm vi ① không:** một khác biệt so với đặc tả gốc — do phát hiện lúc thi
  hành, không phải mở rộng chủ ý: nhiều bài Make ban đầu dùng `match: 'exact'` với nhiều lượt
  `input()` liên tiếp trong một test case, nhưng cơ chế echo `prompt+value` của cổng chấm
  (`lessonsPython.test.ts`/`lessonsJs.test.ts`, mô phỏng đúng hành vi sandbox trình duyệt) chèn
  dòng echo XEN GIỮA các dòng kết quả in ra, phá vỡ khối liên tiếp mà `exact`/`contains` nhiều
  dòng cần — sửa bằng cách đổi `match` sang `'contains'` (mặc định của dự án, đúng khuôn
  `mlu1.ts`) và với `p6-u94-l2` đổi từ "đọc n rồi n dòng" sang "đọc 1 dòng danh sách cách nhau
  dấu chấm phẩy" để chỉ có một lượt `input()`. Cũng sửa 2 cặp lựa chọn Predict bị trùng
  substring với đáp án đúng (`p6-u95-l2`, `p6-u98-l2`, `p6-u96-l2`) — cổng
  `lessonsPython.test.ts`/`lessonsJs.test.ts` chặn đúng như thiết kế.
- **Còn để ngỏ:** không có mục nào của đợt 4 còn để ngỏ. Nợ kỹ thuật đã biết trước (ngân sách
  bundle hẹp, xem `CLAUDE.md` mục 13) không đổi bản chất, chỉ tiêu thụ thêm phần dư nhỏ.
