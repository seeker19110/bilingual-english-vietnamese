# 0203 — Đặc tả khoá "OpenClaw — dựng trợ lý AI của riêng bạn" (PR 1/3)

PR 1 của khoá ngắn thứ ba môn Lập trình, theo yêu cầu người dùng 2026-08-31: "thiết kế viết
đặc tả chi tiết khoá học dạy cách cài đặt và sử dụng OpenClaw như bài về Hermes Agent".

## Đã làm

- **`docs/specs/2026-08-31-khoa-openclaw.md`** — đặc tả đầy đủ theo khuôn
  `docs/templates/dac-ta-tinh-nang.md`, làm đúng tiền lệ khoá Hermes
  (`docs/specs/2026-08-31-khoa-dieu-phoi-ai-van-phong.md`):
  - Nghiên cứu OpenClaw THẬT (tra cứu 2026-08-31): trợ lý AI cá nhân mã nguồn mở tự host,
    Gateway làm control plane, CLI `openclaw onboard/gateway/dashboard/chat/doctor/models/
channel/skills/cron/agents`, kênh WhatsApp/Telegram/Discord/Slack/Signal/iMessage,
    hàng rào `allowFrom`/`dmPolicy`, sandbox + approvals, config `~/.openclaw/openclaw.json`.
  - Khoá `openclaw` **20 bài / 4 chương** (`/lap-trinh/khoa/openclaw`, id `openclaw-uN-lM`):
    C1 Cài đặt & làm quen (6) · C2 Nối kênh & khoá cửa (5) · C3 Skills & tự động hoá (5) ·
    C4 Nhiều agent & vận hành (4). Trọng tâm sư phạm riêng: **AN TOÀN từ bài nối kênh đầu
    tiên** (mặc định chặn người lạ, NGƯỜI duyệt lệnh máy thật) — khác khoá Hermes (điều phối).
  - Hợp đồng bộ mô phỏng tất định `openclawSim` (khuôn `gitSim`/`hermesSim`): bộ lệnh đóng,
    chấm bằng `state`, 3 luật sư phạm nạp vào máy, dòng tự khai `[GIA LAP]`, cron chỉ là dữ
    liệu (kích tay `cron run` để giữ tất định).
  - Điểm chạm, tiêu chí chấp nhận, bất biến + test canh, chia 3 PR (spec · hạ tầng+C1 ·
    C2–C4 — gộp hạ tầng với C1 theo bài học PR Hermes 2/3), 2 câu hỏi mở không chặn PR 2.

## KHÔNG làm ở PR này

Chưa có dòng code nào — `openclawSim`, ngôn ngữ `'openclaw'`, khoá + bài học là PR 2–3.

## Bằng chứng kiểm chứng

Đặc tả thuần tài liệu; `npm run lint` + prettier xanh (xem CI của PR).
