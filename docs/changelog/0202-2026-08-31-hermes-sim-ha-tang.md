# 0202 — Hạ tầng `hermesSim` + khoá `hermes` chương C1 (PR 2/3 khoá Hermes)

PR 2 của khoá "Hermes Agent — trợ lý AI cho người đi làm"
(`docs/specs/2026-08-31-khoa-dieu-phoi-ai-van-phong.md`, chốt ở PR #751). Kế hoạch gốc chia
4 PR (hạ tầng · khoá+C1 · C2–C4); PR này GỘP hai bước giữa — hạ tầng và lát cắt dọc đầu tiên —
vì nội dung C1 soạn xong ngay trong cùng phiên và cổng `lessonsHermes.test.ts` chỉ chạy được
khi bài đã nối vào `lessons.ts` (đẩy file mồ côi là CI đỏ). Kế hoạch còn 3 PR: spec (#751) ·
PR này · C2–C4.

## Đã làm

- **`packages/subject-programming/hermesSim.ts`** — bộ mô phỏng Hermes Agent tất định tuyệt
  đối, khuôn `gitSim`/`bashSim`: máy ảo dựng mới mỗi lượt, không `Date.now()`/random trong
  logic chấm, in dòng tự khai `[GIA LAP]` đầu mọi lượt. Bộ lệnh đóng theo đặc tả §③:
  `hermes` · `hermes gateway setup|start` · `hermes model [curator] <tên>` ·
  `hermes profile [create <tên>]` · `/new` `/resume` `/model` `/skills` `/learn` `/goal`
  (`/goal thay`) `/steer` `/permission` `/stop` · luồng việc `giao "…"` · `trangthai` ·
  `duyet <id>` · `tuchoi <id> "<lý do>"`. Lệnh lạ → lỗi tiếng Việt kể các lệnh có.
- **3 luật sư phạm nạp thẳng vào máy**: ① việc `cho-duyet` chỉ NGƯỜI `duyet` được; ② secret
  trong nội dung việc → agent từ chối; ③ việc khó hoàn tác → dừng đòi `CHAC CHAN` (dò mẫu
  không phụ thuộc dấu tiếng Việt).
- **`hermesSim.test.ts`** — 25 ca: tất định (2 lượt byte-identical), từng nhóm lệnh, đủ ca
  lỗi bảng ③, cả 3 luật sư phạm, `lenhChuanBi`.
- **Ngôn ngữ bài học `'hermes'`** nối trọn đường: `LESSON_LANGUAGES` + nới regex `id`/`unitId`
  (`lessonTypes.ts`) · nới regex `lessonId` ở `progress.ts` + `feedback.ts` (chỉ NỚI) ·
  `hermesRunner.ts` (khuôn `gitRunner`, không worker) · `codeRunner.ts` (`laBaiDongLenh` nhận
  `hermes`) · `LangBadge` (nhãn "Hermes Agent · mô phỏng").
- **Khoá `hermes` + chương C1 "Cơ bản" — 7 bài mới** (`lessons/hermesu1.ts`, unit ảo
  `hermes-u1`), bám đúng 7 mục phần I đề cương tham chiếu, góc nhìn văn phòng/điều phối dev:
  Docker & tác tử là gì · model chính + curator · Dashboard/CLI (`/permission`, `/stop`) ·
  kết nối Telegram (giữ token như mật khẩu) · profile theo ranh giới dữ liệu · session
  mỗi-việc-một-phiên · skill (`/skills`, `/learn`). Mỗi bài đủ 8 bước + 3 thẻ SRS; phần LÀM
  THẬT (cài Docker, tạo bot @BotFather) ở homework kèm checklist, không chấm.
- `courses/hermes.ts` + nới `ShortCourseId` + registry (khoá tự hiện ở `ProgrammingHome` —
  trang khoá data-driven, không cần route mới); `lessons.test.ts` công nhận unit ảo
  `hermes-u*` qua SHORT_COURSES như `git-u*`.
- **`lessonsHermes.test.ts`** — cổng chấm nội dung khuôn `lessonsGit.test.ts`: sampleSolution
  đạt 100% test-case, starter không tự đạt bài, cấm lệnh ngoài bộ mô phỏng trong code chạy,
  tất định 2 lượt. **E2E** thêm 3 ca vào `e2e/programming-course.spec.ts`: vào thẳng
  `/lap-trinh/khoa/hermes` học được ngay, bấm bài dẫn đúng `hermes-u1-l1`, lối vào từ trang môn.

## KHÔNG làm ở PR này

- Chương C2–C4 (15 bài: goal/steer, learn, LiteLLM, llama.cpp, Open WebUI, Memos, Linear,
  Bookmark, Understand-anything, Design & Frontend, Kanban, Herdr, Firecrawl, Honcho,
  Paperclip) — PR 3/3. Không đụng khoá `git`, `curriculum.ts`.

## Bằng chứng kiểm chứng

- `npm run typecheck` ✅ · `npm run lint` ✅ (0 cảnh báo) · `npm test` ✅ **8007/8007 (507
  file)** — gồm 25 ca `hermesSim.test.ts`, cổng `lessonsHermes.test.ts` cho cả 7 bài,
  `LangBadge`/`srsCards`/`courses` tự phủ dữ liệu mới · `npm run build` (client + server +
  hub) ✅.
- `npm run codemap -- impact` cho 2 điểm nóng: `lessonTypes.ts` (140 file — thay đổi thuần
  cộng thêm, test cũ xanh hết) · `codeRunner.ts` (6 file, xanh).

## Việc tiếp theo (PR 3/3)

Chương C2–C4 (15 bài `hermes-u2..u4`), có thể tách 3a/3b nếu phình; quyết câu hỏi mở về bài
Herdr/Paperclip (đặc tả cuối trang) trước khi soạn C4.
