# 🇬🇧 Bilingual English - Vietnamese AI Tutor

**Gia sư tiếng Anh AI song ngữ Anh - Việt** — Luyện nói, viết và trò chuyện với AI, nhận phản hồi bằng **tiếng Việt**.

Ứng dụng giúp người Việt học tiếng Anh hiệu quả hơn nhờ:

- AI hội thoại bằng giọng Anh chuẩn
- Sửa lỗi & giải thích bằng **giọng tiếng Việt tự nhiên**
- Hỗ trợ cả chiều ngược: người nước ngoài học tiếng Việt

## ✨ Tính năng chính

- **Chat gia sư AI** — trò chuyện, sửa lỗi và giải thích bằng tiếng Việt
- **Luyện viết + chấm điểm IELTS** — chỉ lỗi, ước lượng band
- **Luyện nói song ngữ** — nói → AI nghe (STT Whisper) → trả lời bằng **giọng ngôn ngữ đích** + sửa lỗi bằng **giọng tiếng mẹ đẻ** (TTS hai giọng)
- **Học theo lộ trình** — từ vựng theo chủ đề, tốc độ 5-20 từ/ngày (tự chọn), ôn tập SRS, chấm phát âm
- **Lộ trình CEFR A1 → B2** — giáo trình ngữ pháp đầy đủ, ví dụ bấm nghe
- **Từ điển 7.400+ từ** + **Bài học hội thoại** + **Bảng tiến độ** (streak, biểu đồ)
- Giao diện song ngữ, hỗ trợ hai chiều (Vi ↔ En)
- **4 giao diện màu**: 🌙 Xanh đêm (mặc định) · ☀️ Blue sky · 🌸 Pink · 🎉 Rực rỡ

## 🚀 Công nghệ sử dụng

- React + TypeScript + Vite
- Tailwind CSS (hệ thống theme bằng biến CSS) + Lucide Icons
- React Router · PWA (offline)
- Backend: Express (`server.ts`) + Supabase (Auth, Postgres + RLS)
- AI: Claude / Gemini (chat & chấm bài) · Whisper Groq/OpenAI (STT) · Google Cloud TTS

## 📁 Cấu trúc dự án

- `src/` — Source code chính
- `App-Gia-Su-Tieng-Anh-AI.md` — Kế hoạch sản phẩm chi tiết
- `.env.example` — Biến môi trường

## 🛠️ Chạy dự án cục bộ

```bash
git clone https://github.com/seeker19110/bilingual-english-vietnamese.git
cd bilingual-english-vietnamese
npm install
npm run dev
```
