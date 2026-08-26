# fix: Groq gỡ model llama-3.3-70b-versatile — đổi mặc định sang openai/gpt-oss-120b (2026-08-22)

Sau khi vá lỗi xoay vòng key Groq (mục dưới), chat vẫn lỗi trên production. Điều tra bằng
`curl` trực tiếp `chat/completions` với key thật trên VPS xác nhận: key hợp lệ (`models` list
OK) nhưng model mặc định `llama-3.3-70b-versatile` bị Groq trả `model_not_found` — **nhà cung
cấp đã gỡ model này khỏi tài khoản**, không phải lỗi code/key. Người dùng cung cấp danh sách
model còn dùng được trên tài khoản Groq thật:
`canopylabs/orpheus-v1-english` (TTS) · `llama-3.3-70b-versatile` (đã gỡ, API vẫn báo lỗi dù
liệt kê) · `openai/gpt-oss-120b` · `qwen/qwen3.6-27b` · `whisper-large-v3` ·
`whisper-large-v3-turbo` (STT).

Đổi `GROQ_CHAT_MODEL` mặc định (`packages/core-ai/aiConfig.ts`) sang `openai/gpt-oss-120b`
(người dùng chọn qua AskUserQuestion — ưu tiên hiểu ngữ cảnh/đa ngôn ngữ hơn `qwen/qwen3.6-27b`
nhỏ hơn). Đồng bộ ở `scripts/tag-cefr-levels.ts` (fallback riêng) và `.env.example`. Ghi chú
`packages/core-ai/capabilityCostTracker.ts` — CHƯA thêm giá thật cho `openai/gpt-oss-120b` vào
`MODEL_PRICING_REGISTRY` (không xác minh được giá công bố hiện hành lúc vá khẩn cấp), tạm dùng
`DEFAULT_FALLBACK_PRICING` (ước tính, không chính xác tuyệt đối) — cần điền giá thật từ
https://groq.com/pricing sau.

**Ngoại lệ quy trình (đã hỏi & được xác nhận)**: PR này sửa `aiConfig.ts` nên theo CLAUDE.md §8
phải chạy `npm run eval:tutor` so baseline trước khi merge — **KHÔNG chạy được** vì môi trường
sửa lỗi không có key AI thật. Đây là vá khẩn cấp do nhà cung cấp gỡ model (chat đang lỗi thật
trên production), không phải đổi ý thích chủ quan về chất lượng — người dùng đồng ý bỏ qua eval
lần này. **Việc còn lại**: chạy `npm run eval:tutor` trên máy có key thật để xác nhận chất
lượng `openai/gpt-oss-120b` so với baseline cũ (`docs/research/eval-tutor-baseline.md`), cập
nhật baseline nếu cần.

**Việc tay khác còn lại trên VPS**: key Groq THỨ HAI trong `.env` (`gsk_eV5k...`) là key hỏng
thật (`Invalid API Key`, xác nhận qua curl trực tiếp) — không liên quan gì đến việc xoay vòng
key ở PR trước. Nên thay bằng key thật khác hoặc xoá khỏi `GROQ_API_KEY` để tránh phí 1 lượt
thử vô ích mỗi khi key đầu lỗi.
