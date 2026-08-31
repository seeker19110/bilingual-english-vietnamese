# 0202 — Hạ tầng `hermesSim` + ngôn ngữ `hermes` (PR 2/4 khoá Hermes)

PR 2 trong 4 của khoá "Hermes Agent — trợ lý AI cho người đi làm"
(`docs/specs/2026-08-31-khoa-dieu-phoi-ai-van-phong.md`, chốt ở PR #751). Đúng khuôn PR hạ
tầng của khoá Git: engine + test đi trước, nội dung bài (PR 3–4) đi sau.

## Đã làm

- **`packages/subject-programming/hermesSim.ts`** — bộ mô phỏng Hermes Agent tất định tuyệt
  đối, khuôn `gitSim`/`bashSim`: máy ảo dựng mới mỗi lượt, không `Date.now()`/random trong
  logic, in dòng tự khai `[GIA LAP]` đầu mọi lượt chạy. Bộ lệnh đóng theo đặc tả §③:
  `hermes` · `hermes gateway setup|start` · `hermes model [curator] <tên>` ·
  `hermes profile [create <tên>]` · `/new` `/resume` `/model` `/skills` `/learn` `/goal`
  (`/goal thay` để thay mục tiêu) `/steer` `/permission` `/stop` · nhóm luồng việc
  `giao "…"` · `trangthai` · `duyet <id>` · `tuchoi <id> "<lý do>"`. Lệnh ngoài danh sách →
  lỗi tiếng Việt kể ra các lệnh có, không stack trace.
- **3 luật sư phạm nạp thẳng vào máy** (điểm ăn tiền của khoá): ① việc `cho-duyet` chỉ NGƯỜI
  `duyet` được — không bao giờ tự thành `xong`; ② nội dung việc chứa chuỗi dạng secret
  (api key/mật khẩu/token, `sk-…`) → agent từ chối, không tạo việc; ③ việc khó hoàn tác
  ("xoá toàn bộ…", dò không phụ thuộc dấu tiếng Việt) → dừng đòi học viên gõ thêm `CHAC CHAN`
  (trừ khi `/permission tu-do` — và bài học sẽ dạy vì sao nên giữ `hoi`).
- **`hermesSim.test.ts`** — 25 ca: tất định (2 lượt byte-identical), từng nhóm lệnh, đủ ca lỗi
  bảng ③ của đặc tả, cả 3 luật sư phạm, `lenhChuanBi` dựng bối cảnh không in ra.
- **Ngôn ngữ bài học `'hermes'`**: thêm vào `LESSON_LANGUAGES` (`lessonTypes.ts`) + nới regex
  `id`/`unitId` sang nhánh `hermes-uN(-lM)`; nới regex `lessonId` ở 2 handler API
  (`progress.ts`, `feedback.ts` — chỉ NỚI, khoá tiến độ cũ không đổi nghĩa).
- **`apps/dhcb/src/lib/hermesRunner.ts`** (khuôn `gitRunner`, không worker — CI và trình duyệt
  gọi chung `chayLenhHermes()`), nối vào `codeRunner.ts` (`laBaiDongLenh` nhận thêm `hermes`)
  và `LangBadge` (nhãn "Hermes Agent · mô phỏng" — luật không giả vờ).

## KHÔNG làm ở PR này (đúng phạm vi PR 2 theo đặc tả)

- Không có khoá/bài học nào — `courses/hermes.ts` + 22 bài là PR 3–4. Không đụng khoá `git`,
  `curriculum.ts`. Chưa có `lessonsHermes.test.ts` (cần bài mới có thứ để chấm — PR 3).

## Bằng chứng kiểm chứng

- `npx vitest run packages/subject-programming/hermesSim.test.ts` ✅ 25/25.
- `npm run typecheck` ✅ · `npm run lint` ✅ (0 cảnh báo) · `npm test` ✅ **7922/7922 (506
  file)** — gồm `LangBadge.test.tsx` tự phủ ngôn ngữ mới qua `LESSON_LANGUAGES` (nhãn + tự
  khai "mô phỏng") · `npm run build` (client + server + hub) ✅.
- `npm run codemap -- impact` cho 2 điểm nóng: `lessonTypes.ts` (140 file — thay đổi thuần
  cộng thêm enum/regex, toàn bộ test cũ xanh) · `codeRunner.ts` (6 file, xanh).

## Việc tiếp theo (PR 3/4)

`courses/hermes.ts` (khoá + `ShortCourseId`) + chương C1 (7 bài `hermes-u1-l1…l7`) +
`lessonsHermes.test.ts` + E2E vào thẳng `/lap-trinh/khoa/hermes`.
