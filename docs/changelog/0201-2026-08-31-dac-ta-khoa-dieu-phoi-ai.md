# 0201 — Đặc tả khoá "Hermes Agent — trợ lý AI cho người đi làm" (PR 1/4 khoá Hermes)

Người dùng yêu cầu (2026-08-31, kèm 2 ảnh đề cương "Hermes Agent Course"): tạo khoá học theo
ĐÚNG đề cương đó — dạy dùng/điều phối tác tử Hermes Agent, tập trung vào **nhân viên văn
phòng** và **người điều phối dev**. Đây là PR 1 trong kế hoạch 4 PR — chốt thiết kế trước khi
viết code, đúng playbook đã chạy thật của khoá Git (#740–#744).

Bản nháp đầu của đặc tả lược bỏ các bài công cụ cụ thể (Docker, Telegram, LiteLLM…) — người
dùng làm rõ ngay trong phiên: **giữ đúng danh sách bài của đề cương tham chiếu**, chỉ xoay góc
nhìn sang hai đối tượng trên. Đặc tả đã viết lại theo làm rõ này trước khi merge.

## Đã làm

- Viết đặc tả `docs/specs/2026-08-31-khoa-dieu-phoi-ai-van-phong.md` theo khuôn
  `docs/templates/dac-ta-tinh-nang.md`:
  - **Nghiên cứu Hermes Agent thật** (tra cứu 2026-08-31): tác tử mã nguồn mở của Nous
    Research; cài script/Docker; `hermes gateway` nối Telegram; lệnh `/new` `/resume` `/model`
    `/skills` `/goal` `/steer` `/learn` `/permission`; model chính + curator model trong
    `~/.hermes/config.yaml`; nối LiteLLM/llama.cpp/Open WebUI; profile tách biệt; hệ sinh thái
    Memos · Linear · Firecrawl · Honcho · Herdr · Paperclip.
  - **Khoá `hermes`** (`/lap-trinh/khoa/hermes`) — 4 chương / 22 bài bám đúng đề cương 2 ảnh:
    C1 Cơ bản (7 bài, từ Docker tới session/skill) · C2 Công cụ nâng cao (5 bài: goal/steer,
    learn, LiteLLM, llama.cpp, Open WebUI) · C3 Tech stack ứng dụng (5 bài: Memos, Linear,
    Bookmark, Understand-anything, Design & Frontend) · C4 Multi-agent (5 bài: Kanban, Herdr,
    Firecrawl, Honcho, Paperclip). Mỗi bài đặt trong bối cảnh văn phòng/điều phối dev,
    `prerequisites: []`.
  - **`hermesSim`** — mô phỏng CLI Hermes thật, tất định tuyệt đối (đúng cách `gitSim` mô
    phỏng git thật), chấm bằng TRẠNG THÁI; luật soạn bài công cụ thật: mô phỏng chấm được ở
    bước ①–⑥, LÀM THẬT để ở homework kèm checklist, không chấm; KHÔNG gọi AI/mạng/Docker thật.
  - Điểm chạm, tiêu chí chấp nhận, bất biến + test canh, kế hoạch 4 PR, 2 câu hỏi mở (phiên
    bản Hermes đổi nhanh; phương án dự phòng cho bài Herdr/Paperclip nếu thiếu nguồn).

## KHÔNG làm ở PR này

- Không code — `hermesSim`, ngôn ngữ `'hermes'`, khoá + 22 bài là PR 2–4 theo bảng chia trong
  đặc tả. Không đụng khoá `git`, `curriculum.ts`, regex id.
- Không nhúng/chép nội dung khoá tham chiếu — chỉ dùng đề cương chủ đề; lời giảng, ví dụ, bài
  tập sẽ tự soạn trong bối cảnh Việt Nam.

## Bằng chứng kiểm chứng

- Chỉ thêm 2 file docs (đặc tả + changelog này) — không chạm code/route/dữ liệu; Prettier đã
  chạy và check sạch trên cả 2 file.
- Hiện trạng nêu trong đặc tả đối chiếu trực tiếp mã nguồn ngày 2026-08-31: tầng `courses/`
  và trang khoá data-driven đã có (`ProgrammingHome.tsx` lặp `SHORT_COURSES`), regex `lessonId`
  ở đúng 3 chỗ (`lessonTypes.ts`, `progress.ts`, `feedback.ts`), chưa có ngôn ngữ `'hermes'`.
- Thông tin Hermes Agent đối chiếu tài liệu chính thức/cộng đồng (hermes-ai.net, GitHub
  NousResearch/hermes-agent, mudrii/hermes-agent-docs) — ghi trong mục 1.1 của đặc tả.

## Việc tiếp theo (PR 2/4)

`hermesSim.ts` + `hermesSim.test.ts` + ngôn ngữ `'hermes'` + `hermesRunner` + nới regex id —
hạ tầng chấm bài, làm sau khi người dùng duyệt đặc tả (2 câu hỏi mở không chặn PR 2).
