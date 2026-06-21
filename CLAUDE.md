# CLAUDE.md — Gia sư tiếng Anh AI

> File này được Claude Code đọc tự động ở đầu mỗi phiên. Mục tiêu: giúp Claude hiểu dự án và làm đúng ý.
> Người làm: mới bắt đầu lập trình. Hãy GIẢI THÍCH NGẮN GỌN BẰNG TIẾNG VIỆT khi sửa code, và cảnh báo trước khi làm thay đổi lớn.

## 1. Dự án này là gì
Web app **gia sư ngôn ngữ AI hai chiều (Việt ⇄ Anh)**.

**Hai chiều học** (chọn bằng biến `direction`):
- **A — Người Việt học tiếng Anh:** hội thoại giọng Anh, sửa lỗi/giải thích giọng tiếng Việt.
- **B — Người nước ngoài học tiếng Việt (qua tiếng Anh):** hội thoại giọng Việt, sửa lỗi/giải thích giọng tiếng Anh. (Làm sau khi chiều A ổn — tận dụng lại gần hết hệ thống, chỉ đổi prompt + đảo giọng.)

Ba chế độ:
1. **Chat tổng hợp** — gia sư AI trò chuyện, sửa lỗi, giải thích bằng tiếng Việt.
2. **Luyện viết + chấm điểm** — chấm bài kiểu IELTS, chỉ lỗi, ước lượng band.
3. **Luyện nói song ngữ** (tính năng chính, làm ngay sau MVP) — nói → AI nghe (STT) → trả lời bằng **giọng ngôn ngữ đích** + sửa lỗi/giải thích bằng **giọng tiếng mẹ đẻ của học viên** (TTS hai giọng riêng). Chiều A: đích=Anh, giải thích=Việt. Chiều B: đích=Việt, giải thích=Anh.

Điểm khác biệt phải giữ: **sửa lỗi & giải thích bằng GIỌNG tiếng mẹ đẻ** (không chỉ chữ), hội thoại bằng giọng chuẩn của ngôn ngữ đích, giá rẻ, nội dung sát đời sống Việt Nam.

## 2. Công nghệ (stack)
- Frontend: React + Vite + TypeScript + Tailwind CSS (mã do Lovable sinh ra).
- Backend & dữ liệu: **Supabase** (đăng nhập, lưu user, lịch sử học, số lượt còn lại).
- AI: gọi API qua biến môi trường — bắt đầu bằng model rẻ (Gemini Flash / Claude Haiku).
- Deploy: VPS Ubuntu (Express `server.ts` + PM2 + Nginx + Let's Encrypt) — xem `docs/deploy-vps-ubuntu.md`.
- Giọng nói song ngữ: speech-to-text (gpt-4o-mini-transcribe / Deepgram) + text-to-speech **hai giọng** — giọng Anh cho hội thoại + giọng Việt (Azure Neural) cho phần giải thích. AI trả về JSON tách riêng `speech_en` và `feedback_vi` để đọc đúng tiếng.

## 3. Quy ước khi viết code
- Code đơn giản, dễ đọc, **thêm comment tiếng Việt** ở chỗ quan trọng.
- Mỗi file/hàm làm 1 việc rõ ràng. Đặt tên biến tiếng Anh dễ hiểu.
- KHÔNG đưa API key, mật khẩu vào code. Luôn dùng biến môi trường (`.env`), và đảm bảo `.env` nằm trong `.gitignore`.
- Mọi lệnh gọi AI phải **đếm/giới hạn lượt dùng** (Free vs Pro) để tránh tốn tiền API.
- Giữ các prompt gửi cho AI trong một thư mục/biến riêng (ví dụ `src/prompts/`) để dễ chỉnh.

## 4. Lệnh hay dùng
> Cập nhật lại nếu dự án dùng lệnh khác.
- Cài thư viện: `npm install`
- Chạy thử ở máy: `npm run dev`
- Build: `npm run build`
- Kiểm tra lỗi: `npm run lint`

## 5. Cách làm việc mong muốn với Claude Code
- Trước khi sửa nhiều file hoặc đổi cấu trúc, **giải thích kế hoạch ngắn gọn rồi hỏi mình trước**.
- Mỗi lần thay đổi nên nhỏ, dễ kiểm tra. Sau khi sửa, nói rõ đã đổi gì và cách chạy thử.
- Khi gặp khái niệm mới, giải thích cho người mới hiểu (mình đang học).
- Ưu tiên giải pháp miễn phí / chi phí thấp vì dự án vốn tối thiểu.

## 6. Trạng thái hiện tại
> Cập nhật 2026-06-21.
- [x] Khởi tạo project + đăng nhập (Supabase Auth đã chạy thật — `lib/auth.ts`, `AuthProvider`)
- [x] Chế độ Chat (MVP) — gọi AI thật qua `/api/claude` (edge function ép model + token)
- [x] Chế độ Luyện viết + chấm điểm (MVP) — chấm kiểu IELTS
- [~] Giới hạn lượt + gói trả phí — lượt dùng đã đồng bộ lên Supabase (`daily_usage`); gói `plan` đọc từ bảng `profiles`; thanh toán Pro chưa có
- [x] Deploy VPS (Express `server.ts` + PM2 + Nginx + Let's Encrypt) — ĐÃ deploy thật, đang chạy tại https://en-vi.donghanhcungban.com (PM2 process `english-tutor`, port 3001, dùng chung VPS 160.30.172.203 với app "xboss" có sẵn ở port 3000 — không ảnh hưởng nhau). SSL Let's Encrypt tự renew. Lưu ý: `ecosystem.config.cjs` trên VPS dùng `interpreter: /usr/bin/node` (Node hệ thống v22, **bắt buộc** — xem mục lỗi WebSocket bên dưới) — khác với giá trị mặc định trong repo, nhớ đồng bộ nếu sửa lại file này. (code + hướng dẫn: `docs/deploy-vps-ubuntu.md`)
- [x] Đồng bộ Supabase — chat/viết/nói/lượt dùng lưu lên DB (RLS), login Supabase thống nhất cho mọi trang. Xem `SUPABASE_SYNC_SETUP.md` + `supabase/schema.sql`
- [~] Chế độ Luyện nói song ngữ — TTS chính đã đổi sang Google Cloud TTS qua `/api/tts` (audio cache **mã hóa AES-256-GCM** trên Supabase Storage, bắt buộc đăng nhập mới lấy được khoá giải mã), Web Speech API chỉ còn là fallback khi lỗi mạng/server. STT thật (nghe người dùng nói) vẫn chưa làm.
- [x] Mở chiều B: dạy tiếng Việt cho người nước ngoài (nút gạt ngôn ngữ + đảo giọng) — `lib/direction.ts`
- [~] (v2) Theo dõi tiến bộ, streak, chấm phát âm — đã có streak, WordOfTheDay, Flashcard, cache phát âm (`api/pronunciation.ts`); chấm phát âm chưa làm

### Việc còn dang dở / cần quyết định
1. STT (nghe người dùng nói) vẫn chưa làm thật — phần TTS đã xong (Google Cloud TTS, mã hóa AES-256-GCM, cache dùng chung qua bảng `tts_cache`/bucket `tts-cache`).
2. Repo GitHub chưa đồng bộ với VPS: (a) `ecosystem.config.cjs` trên VPS dùng `interpreter: /usr/bin/node` — repo hiện đã khớp giá trị này, không cần sửa thêm; (b) `api/_lib/security.ts` trên VPS đang có thêm vài dòng debug log tạm thời trong `validateAuth` (để dò lỗi 401 do thiếu native WebSocket ở Node 20) — repo CHƯA có các dòng log này, cần quyết định: xóa log trên VPS (đã hết cần thiết) hay đồng bộ log về repo (an toàn, không lộ secret).
3. Thanh toán Pro chưa có (giới hạn lượt đã đồng bộ Supabase, nhưng chưa có cổng thanh toán nâng cấp gói).

Chú thích: `[x]` xong · `[~]` làm một phần · `[ ]` chưa làm.

> Tham khảo kế hoạch đầy đủ: file `App-Gia-Su-Tieng-Anh-AI.md` trong cùng thư mục.
