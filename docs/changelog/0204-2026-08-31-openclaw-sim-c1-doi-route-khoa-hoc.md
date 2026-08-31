# 0204 — Hạ tầng `openclawSim` + khoá `openclaw` chương C1 + đổi route `/khoa-hoc/` (PR 2/3 khoá OpenClaw)

PR 2 của khoá "OpenClaw — dựng trợ lý AI của riêng bạn"
(`docs/specs/2026-08-31-khoa-openclaw.md`, chốt ở PR #753). Đúng kế hoạch đặc tả: gộp hạ tầng

- lát cắt dọc C1 vào một PR (bài học từ PR Hermes 2/3: cổng nội dung chỉ chạy được khi bài đã
  nối `lessons.ts`). Kèm theo yêu cầu người dùng giữa phiên: **đổi route dùng chung của trang
  khoá ngắn từ `/lap-trinh/khoa/` sang `/lap-trinh/khoa-hoc/`**.

## Đã làm

- **`packages/subject-programming/openclawSim.ts`** — bộ mô phỏng OpenClaw tất định tuyệt đối,
  khuôn `gitSim`/`hermesSim`: máy dựng mới mỗi lượt, không `Date.now()`/random, dòng tự khai
  `[GIA LAP]` đầu mọi lượt. Bộ lệnh đóng theo đặc tả §③ (chốt cứng ở PR này):
  `openclaw onboard` · `gateway start|stop|status` · `dashboard` · `chat "…"` · `doctor` ·
  `models [use]` · `channel add|remove|list|status|reconnect|allow|test` ·
  `skills [info]` · `cron add|list|enable|disable|run` · `agents list|add|delete|bind|unbind` ·
  `/config` `/plugins` · `duyet` `tuchoi`. Cron chỉ là DỮ LIỆU — không bao giờ tự "đến giờ
  chạy", kích tay bằng `cron run` (giữ tất định, đúng §⑤). Chấm bằng output `contains` qua
  `grading.ts` — đúng tiền lệ hermesSim (spec ghi "chấm bằng trạng thái", hiện thực theo khuôn
  chung của cả 4 sim: trạng thái phản chiếu qua output tất định).
- **3 luật sư phạm nạp thẳng vào máy**: ① kênh mới LUÔN `chan-nguoi-la` + `allowFrom` rỗng,
  tin người lạ bị chặn kèm giải thích (`channel test` — lệnh riêng của mô phỏng để nhìn thấy
  hàng rào, bài học tự khai); ② secret trong chat → từ chối lưu, việc đụng máy thật → hàng
  `choDuyet`, chỉ NGƯỜI `duyet`; ③ gateway chưa chạy mà gọi chat/dashboard/kênh → lỗi chỉ
  đúng lệnh bật (control plane trước).
- **`openclawSim.test.ts`** — 25 ca: tất định 2 lượt byte-identical, từng nhóm lệnh, đủ ca
  lỗi bảng ③, cả 3 luật sư phạm, `lenhChuanBi`.
- **Ngôn ngữ bài học `'openclaw'`** nối trọn đường: `LESSON_LANGUAGES` + nới regex
  `id`/`unitId` (`lessonTypes.ts`) · nới regex `lessonId` ở `progress.ts` + `feedback.ts`
  (chỉ NỚI) · `openclawRunner.ts` (không worker) · `codeRunner.ts` (`laBaiDongLenh`) ·
  `LangBadge` (nhãn "OpenClaw · mô phỏng").
- **Khoá `openclaw` + chương C1 "Cài đặt & làm quen" — 6 bài mới** (`lessons/openclawu1.ts`,
  unit ảo `openclaw-u1`): tự host vs đám mây · cài script/Docker & onboard · kiến trúc
  Gateway · dashboard + chat terminal · cấu hình model (tên model TRUNG TÍNH
  gon-nhe/can-bang/suy-luan-sau để nội dung không mục theo phiên bản) · `doctor` quy trình
  3 bước. Mỗi bài đủ 8 bước + 3 thẻ SRS; LÀM THẬT ở homework kèm checklist, không chấm.
- **`lessonsOpenclaw.test.ts`** — cổng nội dung khuôn `lessonsHermes.test.ts`: sampleSolution
  100% test-case, starter không tự đạt, cấm lệnh ngoài bộ mô phỏng, tất định 2 lượt.
- **Đổi route trang khoá ngắn `/lap-trinh/khoa/:courseId` → `/lap-trinh/khoa-hoc/:courseId`**
  (yêu cầu người dùng 2026-08-31): route mới trong `App.tsx` + **redirect giữ mã khoá** từ URL
  cũ (khuôn `SubjectRedirect`) nên link đã chia sẻ không chết; sửa `ProgrammingHome`,
  comment `ProgrammingCoursePage`/`courses/types.ts`, danh sách trang a11y (`e2e/a11y*.ts`)
  và toàn bộ `e2e/programming-course.spec.ts`.
- **E2E** thêm 3 ca: vào thẳng `/lap-trinh/khoa-hoc/openclaw` học được ngay · bấm bài dẫn
  đúng `openclaw-u1-l1` · URL cũ `/lap-trinh/khoa/openclaw` chuyển hướng đúng.

## KHÔNG làm ở PR này

Chương C2–C4 (14 bài) — PR 3/3. Không đụng khoá `git`/`hermes`, `curriculum.ts`.

## Bằng chứng kiểm chứng

- `npm run typecheck` ✅ · `npm run lint` ✅ (0 cảnh báo) · `npm run format` ✅ · `npm test` ✅
  **8105/8105 (509 file)** — gồm 25 ca `openclawSim.test.ts` + cổng `lessonsOpenclaw.test.ts`
  cho cả 6 bài · `npm run build` ✅.
- `npm run budget`: Initial JS 126,59/140 kB (90,4%) · CSS 16,49/18 kB — vẫn trong ngân sách.
- `npm run codemap -- impact` cho 2 điểm nóng `lessonTypes.ts` + `codeRunner.ts`: thay đổi
  thuần cộng thêm, test cũ xanh hết.

## Việc tiếp theo (PR 3/3)

Chương C2–C4 (14 bài `openclaw-u2..u4`); quyết 2 câu hỏi mở cuối đặc tả trước khi soạn.
