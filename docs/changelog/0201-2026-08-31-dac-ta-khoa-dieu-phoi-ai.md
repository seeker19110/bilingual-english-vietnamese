# 0201 — Đặc tả khoá "Điều phối AI thực hành" (PR 1/4 khoá AI)

Người dùng yêu cầu (2026-08-31, kèm ảnh tham chiếu "Hermes Agent Course"): nghiên cứu kỹ và tạo
khoá học về dùng/điều phối tác tử AI, trước tiên tập trung vào **nhân viên văn phòng** và
**người điều phối dev**. Đây là PR 1 trong kế hoạch 4 PR — chốt thiết kế trước khi viết code,
đúng playbook đã chạy thật của khoá Git (#740–#744).

## Đã làm

- Viết đặc tả đầy đủ `docs/specs/2026-08-31-khoa-dieu-phoi-ai-van-phong.md` theo khuôn
  `docs/templates/dac-ta-tinh-nang.md`:
  - **Nghiên cứu đầu vào**: phân loại 4 phần của khoá tham chiếu Hermes thành "kỹ năng bền —
    GIỮ" (session, skill, goal/steer, kanban, multi-agent, giao việc/nghiệm thu) và "thao tác
    theo sản phẩm — BỎ" (Docker, Telegram, LiteLLM, llama.cpp, Open WebUI…), kèm lý do từng nhóm.
  - **Khoá `ai`** — khoá ngắn thứ hai (`/lap-trinh/khoa/ai`), 5 chương / 16 bài mới,
    `prerequisites: []`, nhắm người KHÔNG biết code: C1 làm quen tác tử · C2 giao việc cho rõ
    (khuôn 3 phần) · C3 việc văn phòng hằng ngày · C4 mục tiêu dài & nhiều việc song song ·
    C5 điều phối dev (đặc tả 6 ô rút gọn + nghiệm thu bằng bằng chứng).
  - **`agentSim`** — bộ mô phỏng tác tử hư cấu `tro`, tất định tuyệt đối, chấm bằng TRẠNG THÁI
    (bảng việc/phiên/kỹ năng); 3 luật sư phạm nạp thẳng vào sim (thiếu khuôn → hỏi lại; chỉ
    NGƯỜI duyệt được việc; chặn secrets/hành động khó hoàn tác). KHÔNG gọi AI thật khi chấm.
  - Điểm chạm, tiêu chí chấp nhận, bất biến + test canh, kế hoạch 4 PR, 2 câu hỏi mở cho
    người dùng (tên tác tử `tro`; có làm khoá "Tự host AI" sau không).

## KHÔNG làm ở PR này

- Không code — `agentSim`, ngôn ngữ `'agent'`, khoá `ai`, 16 bài là PR 2–4 theo bảng chia trong
  đặc tả. Không đụng khoá `git`, `curriculum.ts`, regex id.

## Bằng chứng kiểm chứng

- Chỉ thêm 2 file docs (đặc tả + changelog này) — không chạm code/route/dữ liệu; các cổng
  build/test không bị ảnh hưởng, Prettier đã chạy trên 2 file mới.
- Hiện trạng nêu trong đặc tả đối chiếu trực tiếp mã nguồn ngày 2026-08-31: tầng `courses/`
  và trang khoá data-driven đã có (`ProgrammingHome.tsx` lặp `SHORT_COURSES`), regex `lessonId`
  ở đúng 3 chỗ (`lessonTypes.ts`, `progress.ts`, `feedback.ts`), chưa có ngôn ngữ `'agent'`.

## Việc tiếp theo (PR 2/4)

`agentSim.ts` + `agentSim.test.ts` + ngôn ngữ `'agent'` + `agentRunner` + nới regex id — hạ
tầng chấm bài, làm sau khi người dùng duyệt đặc tả (2 câu hỏi mở không chặn PR 2).
