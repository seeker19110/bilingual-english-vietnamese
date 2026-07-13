# 🇬🇧🇻🇳 Gia sư ngôn ngữ AI song ngữ Việt ⇄ Anh

Web app gia sư AI **hai chiều**: người Việt học tiếng Anh, hoặc người nước ngoài học tiếng Việt qua tiếng Anh. Điểm khác biệt: AI **sửa lỗi & giải thích bằng GIỌNG tiếng mẹ đẻ** của học viên (TTS hai giọng riêng), không chỉ bằng chữ.

Đang chạy thật tại **https://en-vi.donghanhcungban.com**.

## ✨ Tính năng

- **Chat gia sư AI** — trò chuyện theo tình huống, sửa lỗi, giải thích bằng tiếng mẹ đẻ; có "Kết thúc & chấm điểm" cuối phiên.
- **Luyện viết + chấm điểm kiểu IELTS** — chỉ lỗi, ước lượng band.
- **Luyện nói song ngữ** (tính năng chính) — nói → STT (Whisper) → AI trả lời bằng **giọng ngôn ngữ đích** + sửa lỗi bằng **giọng tiếng mẹ đẻ** (TTS 2 giọng riêng).
- **Lộ trình học** — từ vựng theo chủ đề (tốc độ 5/10/20 từ/ngày), ôn tập SRS, chấm phát âm.
- **Lộ trình chuẩn CEFR A1 → C2** — ngữ pháp + hội thoại + bài thi cuối cấp.
- **Từ điển 12.000+ từ** đã gắn nhãn CEFR, đầy đủ nghĩa + ví dụ song ngữ có audio.
- **Bảng tiến độ** — streak, biểu đồ, % hoàn thành theo cấp.
- Hai chiều học (nút gạt A ↔ B), song ngữ toàn giao diện, **4 theme** (mặc định Xanh đêm).

## 🚀 Công nghệ

- **Frontend:** React 18 + Vite 7 + TypeScript 5.2 (strict) + Tailwind CSS 3 (mã gốc do Lovable sinh ra).
- **Backend & dữ liệu:** Express (`server.ts`) + Supabase (Auth, Postgres có RLS, Storage).
- **AI:** chat/chấm bài qua `/api/claude` · STT Whisper qua Groq/OpenAI (`/api/stt`) · TTS Google Cloud (`/api/tts`, cache mã hoá AES-256-GCM).
- **Deploy:** VPS Ubuntu (PM2 + Nginx + Let's Encrypt) sau Cloudflare.

Chi tiết đầy đủ (schema DB, API, MoSCoW): xem `PROJECT.md`. Trạng thái/tiến độ: xem `PROGRESS.md`. Quy ước làm việc với AI: xem `CLAUDE.md`.

## 🛠️ Chạy dự án cục bộ

```bash
git clone https://github.com/seeker19110/bilingual-english-vietnamese.git
cd bilingual-english-vietnamese
npm install
cp .env.example .env   # điền key Supabase/AI/TTS
npm run dev
```

Lệnh khác: `npm run build` (build) · `npm run typecheck` · `npm run lint` · `npm test` · `npm run test:e2e` (Playwright) · `npm start` (chạy `server.ts` bằng `tsx`).
