# 🌐 Hệ thống song ngữ hai chiều (Bilingual System)

> Tài liệu kiến trúc: cách hệ 2 chiều học (Việt⇄Anh) hoạt động và cách mở rộng thêm tính năng.

## 1. Tổng quan

| Chiều | Học viên         | Giao diện  | Hội thoại (đích) | Giải thích (mẹ đẻ) |
| ----- | ---------------- | ---------- | ---------------- | ------------------ |
| **A** | Người Việt       | Tiếng Việt | Anh (en-US)      | Việt (vi-VN)       |
| **B** | Người nước ngoài | Tiếng Anh  | Việt (vi-VN)     | Anh (en-US)        |

Chuyển đổi: Home → nút gạt ngôn ngữ (góc trên phải) → toggle A ↔ B, lưu `localStorage`
(`et_direction`).

## 2. Cốt lõi

- **Type:** `Direction = 'A' | 'B'` — `src/types.ts`.
- **Lưu/đọc:** `getDirection()`/`setDirection()` — `src/lib/storage.ts`.
- **Prompt:** mọi hàm prompt trong `src/prompts/index.ts` nhận `dir: Direction`, trả prompt
  tiếng Việt (chiều A) hoặc tiếng Anh (chiều B). Chat/Speaking yêu cầu AI trả JSON:
  ```json
  {
    "speech": "<câu hội thoại — đọc bằng giọng ngôn ngữ đích>",
    "feedback": "<sửa lỗi/giải thích — đọc bằng giọng tiếng mẹ đẻ, rỗng nếu không có lỗi>",
    "corrected": "<câu đúng>"
  }
  ```
- **Giao diện (i18n):** `src/context/LangProvider.tsx` + `src/lib/uiLang.ts` quản lý `uiLang`
  độc lập với `direction`. Toggle ở Home đổi cả hai cùng lúc:
  ```ts
  function toggleDir() {
    const next: Direction = dir === 'A' ? 'B' : 'A'
    setDirection(next)
    setLang(next === 'A' ? 'vi' : 'en')
  }
  ```
  Component dùng `useLang()` lấy `T` (chuỗi i18n) + tự kiểm `isA = dir === 'A'` khi cần render
  khác nhau ngoài bảng `T`.

## 3. Âm thanh (TTS/STT)

**TTS** — `src/lib/tts.ts`:

```ts
speakBilingual(
  speech, feedback,
  speechLang = 'en-US', feedbackLang = 'vi-VN',
  voice, rate,
  onSpeechWord?, onFeedbackWord?,   // callback karaoke (sáng chữ theo từ đang đọc)
)
```

Gọi `/api/tts` (`api/tts.ts`, Google Cloud TTS). Audio cache theo hash trên bảng `tts_cache`
(Postgres tự host) + file lưu local VPS hoặc Cloudflare R2, **mã hoá AES-256-GCM** — chỉ
người đã đăng nhập nhận được khoá giải mã.

**STT** — `src/lib/stt.ts` (Web Speech API, fallback) + `src/lib/sttServer.ts` (ghi âm
`MediaRecorder` → base64 → `/api/stt`). Server (`api/stt.ts`) ưu tiên Whisper qua **Groq**
(`whisper-large-v3-turbo`, key `GROQ_API_KEY`), fallback **OpenAI**
(`gpt-4o-mini-transcribe`, key `OPENAI_API_KEY`).

## 4. Trang dùng hệ thống này

| Trang                    | Dùng gì                                                          |
| ------------------------ | ---------------------------------------------------------------- |
| `src/pages/Chat.tsx`     | prompt `chatSystemPrompt(situation, level, dir)`, chỉ text       |
| `src/pages/Speaking.tsx` | + STT (`sttLang = isA ? 'en' : 'vi'`) + `speakBilingual` 2 giọng |
| `src/pages/Writing.tsx`  | `writingSystemPrompt(dir)`, chỉ text, feedback theo `dir`        |
| `src/pages/Home.tsx`     | nút gạt chiều + render mô tả tính năng theo `dir`                |

## 5. Thêm tính năng mới dùng Direction

```ts
import { getDirection, type Direction } from '../lib/storage' // hoặc từ '../types'
const dir: Direction = getDirection()
const isA = dir === 'A'
```

- Thêm tình huống mới: `SITUATIONS` trong `src/types.ts` (mỗi mục có `labelA`/`labelB`).
- Thêm chuỗi giao diện mới: thêm khoá vào `src/i18n/index.ts` (cả `vi` và `en`).
- Thêm prompt mới: viết hàm nhận `dir`, `if (dir === 'A') return <prompt Việt> else return <prompt Anh>`.

## 6. Biến môi trường liên quan

```bash
# Server-only
DATABASE_URL=...      # PostgreSQL tự host
GOOGLE_TTS_API_KEY=... TTS_ENCRYPTION_MASTER_KEY=...
GROQ_API_KEY=...      # Whisper STT (ưu tiên) + Llama
OPENAI_API_KEY=...    # fallback STT
ANTHROPIC_API_KEY=... # fallback chat

# Public
VITE_GOOGLE_CLIENT_ID=... # Google OAuth (auth tự viết)
```

## 7. File liên quan

| File                              | Vai trò                                         |
| --------------------------------- | ----------------------------------------------- |
| `src/types.ts`                    | `Direction`, `SITUATIONS`, `LEVELS`             |
| `src/lib/storage.ts`              | get/set direction (localStorage)                |
| `src/lib/tts.ts`                  | `speak()`, `speakBilingual()`                   |
| `src/lib/stt.ts` / `sttServer.ts` | STT trình duyệt / STT server                    |
| `src/prompts/index.ts`            | prompt chat/speaking/writing theo `dir`         |
| `src/context/LangProvider.tsx`    | ngữ cảnh `uiLang`                               |
| `api/ai.ts`                       | endpoint `/api/agent` (chat/chấm bài)           |
| `api/tts.ts` / `api/stt.ts`       | endpoint TTS (Google Cloud) / STT (Groq/OpenAI) |
