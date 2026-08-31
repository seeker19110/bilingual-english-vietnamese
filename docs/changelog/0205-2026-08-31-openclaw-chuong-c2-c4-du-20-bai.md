# 0205 — Chương C2–C4 khoá OpenClaw, đủ 4 chương/20 bài (PR 3/3 khoá OpenClaw)

PR cuối của khoá "OpenClaw — dựng trợ lý AI của riêng bạn"
(`docs/specs/2026-08-31-khoa-openclaw.md`, chốt ở PR #753; hạ tầng `openclawSim` + chương C1
đã merge ở PR #759). Đúng kế hoạch đặc tả: PR 3/3.

## Đã làm

- **Chương C2 "Nối kênh & khoá cửa" — 5 bài** (`lessons/openclawu2.ts`, unit ảo `openclaw-u2`):
  nối Telegram (BotFather, token giữ như mật khẩu) · nối WhatsApp/Discord — một Gateway nhiều
  kênh · `allowFrom` & `dmPolicy` (chặn người lạ mặc định) · hàng rào toàn diện qua
  `openclaw doctor` + `channel list` (thay "groupPolicy" — sim không có lệnh riêng cho nhóm
  chat) · sandbox & approvals (`duyet`/`tuchoi`).
- **Chương C3 "Skills & tự động hoá" — 5 bài** (`lessons/openclawu3.ts`, unit ảo `openclaw-u3`):
  kho skills · `/config` `/plugins` · `openclaw cron` (kích tay bằng `cron run`, sim không tự
  chạy theo giờ) · khái niệm trigger/sự kiện qua `cron run` + `channel test` (thay "webhook" —
  sim không gọi mạng thật) · nối model tự host (lý thuyết + `openclaw models use` có thật).
- **Chương C4 "Nhiều agent & vận hành" — 4 bài** (`lessons/openclawu4.ts`, unit ảo
  `openclaw-u4`): `openclaw agents` (mỗi vai một agent) · routing bindings (`bind`/`unbind`) ·
  vận hành dài hạn (`openclaw doctor` làm "khám sức khoẻ trước khi backup", vì sim không có
  lệnh backup/update/log riêng) · tổng kết checklist an toàn cuối khoá.
- `courses/openclaw.ts` nối đủ 4 chương (20 bài); `lessons.ts` +3 import; `lessonsOpenclaw.test.ts`
  đổi kỳ vọng 6 → 20 bài.
- **Điều chỉnh có chủ đích so với đề cương tham chiếu** (giữ đúng chủ đề, đổi lệnh thể hiện vì
  `openclawSim` không có lệnh tương ứng — không bịa lệnh, đúng luật §② của đặc tả): bỏ bài
  riêng iMessage/Signal (chỉ nhắc tên trong lý thuyết, đúng câu hỏi mở ② đã chốt) · "groupPolicy"
  → hàng rào toàn diện · "webhook" → trigger qua cron/channel test · "backup/update/log" →
  doctor làm khám sức khoẻ định kỳ.
- Soạn bởi subagent Sonnet (việc vừa, đặc tả cụ thể — CLAUDE.md mục 3), phiên chính nghiệm thu:
  phát hiện + sửa 1 thẻ SRS quá ngắn (`openclaw-u4-l2`, dưới ngưỡng `srsCards.test.ts`) trước
  khi merge — cổng riêng của subagent (4 lệnh nó tự chạy) không phủ tới `srsCards.test.ts`.

## KHÔNG làm ở PR này

Không đụng `openclawSim.ts` (bộ lệnh giữ nguyên từ PR #759), khoá `git`/`hermes`,
`curriculum.ts`, không thêm E2E mới (cổng E2E hiện có đã đủ).

## Bằng chứng kiểm chứng

- `npm run typecheck` ✅ · `npm run lint` ✅ (0 cảnh báo) · `npx prettier --check .` ✅
- `npm test` ✅ **8453/8453 (509 file)** — gồm cổng `lessonsOpenclaw.test.ts` cho đủ 20 bài
  (sampleSolution 100% test-case, starter không tự đạt, không lệnh ngoài đời, tất định) và
  `srsCards.test.ts` (mọi thẻ đạt ngưỡng độ dài sau khi sửa).
- `npm run build` ✅ (client + server + hub).
