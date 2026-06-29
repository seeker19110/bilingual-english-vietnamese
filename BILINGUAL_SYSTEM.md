# 🌐 Hệ Thống Song Ngữ (Bilingual Learning System)

> **Tài liệu duy trì:** Hướng dẫn kiến trúc, flow, và cách extend hệ thống học hai chiều (Việt ⇄ Anh).

---

## 1. Tổng Quan

App hỗ trợ **2 chiều học độc lập**:

| Chiều | Tên   | Học Viên         | Giao Diện  | Hội Thoại (Speech) | Giải Thích (Feedback) |
| ----- | ----- | ---------------- | ---------- | ------------------ | --------------------- |
| **A** | Vi→En | Người Việt       | Tiếng Việt | Tiếng Anh (en-US)  | Tiếng Việt (vi-VN)    |
| **B** | En→Vi | Người nước ngoài | Tiếng Anh  | Tiếng Việt (vi-VN) | Tiếng Anh (en-US)     |

**Cách chuyển đổi:**

- Home page → nút gạt ngôn ngữ (góc trên phải) → toggle A ↔ B
- Giao diện tự đổi theo chiều
- Lưu tùy chọn vào `localStorage` (`et_direction`)

---

## 2. Kiến Trúc & File Quan Trọng

### 2.1 Type Definition

**File:** `src/types.ts`

```typescript
export type Direction = 'A' | 'B'
```

- `'A'`: Chiều A
- `'B'`: Chiều B

---

### 2.2 Lưu Trữ Direction

**File:** `src/lib/storage.ts`

```typescript
const DIRECTION_KEY = 'et_direction'

export function getDirection(): Direction {
  return (localStorage.getItem(DIRECTION_KEY) as Direction) ?? 'A'
}

export function setDirection(dir: Direction) {
  localStorage.setItem(DIRECTION_KEY, dir)
}
```

**Sử dụng:**

```typescript
const dir = getDirection() // đọc direction hiện tại
setDirection('B') // lưu direction mới
```

---

### 2.3 Prompt AI Song Ngữ

**File:** `src/prompts/index.ts`

Tất cả prompt function nhận tham số `dir: Direction` để tự động thay đổi ngôn ngữ:

#### Chat Prompt

```typescript
export function chatSystemPrompt(situation: string, level: Level, dir: Direction = 'A'): string {
  if (dir === 'A') {
    return `Bạn là gia sư tiếng Anh...` // Prompt tiếng Việt
  }
  return `You are a friendly Vietnamese tutor...` // Prompt tiếng Anh
}
```

#### Speaking Prompt

```typescript
export function speakingSystemPrompt(
  situation: string,
  level: Level,
  dir: Direction = 'A',
): string {
  if (dir === 'A') {
    return `Bạn là gia sư tiếng Anh...
    QUAN TRỌNG — Trả về JSON:
    {
      "speech": "<câu thoại tiếng Anh>",
      "feedback": "<sửa lỗi bằng tiếng Việt>",
      "corrected": "<câu đúng tiếng Anh>"
    }`
  }
  return `You are a friendly Vietnamese tutor...
  IMPORTANT — Return JSON:
  {
    "speech": "<Vietnamese dialogue>",
    "feedback": "<error correction in English>",
    "corrected": "<corrected Vietnamese>"
  }`
}
```

#### Writing Prompt

```typescript
export function writingSystemPrompt(dir: Direction = 'A'): string {
  if (dir === 'A') {
    return `Bạn là giám khảo IELTS... // feedback Việt
    {
      "errors": [{ "explanation": "<giải thích tiếng Việt>" }],
      ...
    }`
  }
  return `You are an experienced writing tutor...
  {
    "errors": [{ "explanation": "<explanation in English>" }],
    ...
  }`
}
```

**Quy tắc:**

- Chiều A: prompt + feedback **tiếng Việt**
- Chiều B: prompt + feedback **tiếng Anh**
- **Hội thoại luôn dùng ngôn ngữ đích** (A: Anh, B: Việt)

---

### 2.4 Giao Diện (UI Language)

**File:** `src/context/LangProvider.tsx` + `src/lib/uiLang.ts`

Quản lý `uiLang` độc lập (Việt/Anh) để dịch text giao diện.

**Luồng:**

1. Home.tsx gọi `toggleDir()` → thay đổi direction A/B
2. Đồng thời cập nhật `uiLang` trong LangProvider:
   ```typescript
   function toggleDir() {
     const next: Direction = dir === 'A' ? 'B' : 'A'
     setDirection(next)
     setLang(next === 'A' ? 'vi' : 'en') // đổi giao diện
   }
   ```
3. Tất cả component dùng `useLang()` để lấy `T` (text objects)
4. Component kiểm tra `isA = dir === 'A'` để render text khác:
   ```typescript
   <h1>{isA ? 'Chat với gia sư' : 'Chat with tutor'}</h1>
   ```

**Hardcoded Labels:**

- `SITUATIONS`, `LEVELS` (src/types.ts) — có `labelA` + `labelB`
- `situationLabel(value, dir)` (src/prompts/index.ts) — trả label đúng chiều

---

## 3. TTS/STT (Âm Thanh)

### 3.1 Speaking Page Flow

**File:** `src/pages/Speaking.tsx`

```typescript
const dir: Direction = getDirection()
const isA = dir === 'A'

// STT: chiều A nhận Anh, chiều B nhận Việt
const sttLang = isA ? ('en' as const) : ('vi' as const)

// TTS: speech + feedback song ngữ
await speakBilingual(
  ai.speech, // hội thoại
  ai.feedback, // sửa lỗi
  isA ? 'en-US' : 'vi-VN', // speech lang
  isA ? 'vi-VN' : 'en-US', // feedback lang
)
```

### 3.2 TTS (Text-to-Speech)

**File:** `src/lib/tts.ts`

```typescript
export async function speakBilingual(
  speech: string,
  feedback: string,
  speechLang: Lang = 'en-US',
  feedbackLang: Lang = 'vi-VN',
  voice: Voice = getVoicePref(),
  rate = 1,
) {
  if (speech) await speak(speech, speechLang, voice, rate)
  if (feedback) await speak(feedback, feedbackLang, voice, rate)
}
```

**API Endpoint:** `/api/tts`

```bash
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "text": "Hello, how are you?",
    "lang": "en-US",  # "en-US" | "vi-VN"
    "voice": "female" # "female" | "male" | "female2" | "male2"
  }'
```

**Response:**

```json
{
  "audio_url": "https://...",
  "key_b64": "...",   # khoá giải mã (AES-256-GCM)
  "iv_b64": "...",    # IV
  "cached": true      # từ cache hay mới tạo
}
```

**Bảo mật:** Audio mã hóa AES-256-GCM, chỉ có khoá nếu đăng nhập.

### 3.3 STT (Speech-to-Text)

**File:** `src/lib/stt.ts` + `src/lib/sttServer.ts`

**Flow:**

1. Browser ghi âm → `MediaRecorder` (WebM/Opus)
2. Gửi base64 lên `/api/stt` với `lang`
3. Server dùng Whisper (Groq hoặc OpenAI)
4. Trả lại text

**API Endpoint:** `/api/stt`

```bash
curl -X POST http://localhost:3000/api/stt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "audio_b64": "<base64 audio>",
    "lang": "en"  # "en" | "vi"
  }'
```

**Response:**

```json
{
  "text": "Hello, how are you?"
}
```

**Lựa chọn STT:**

- Ưu tiên: `GROQ_API_KEY` → Whisper `whisper-large-v3-turbo` (miễn phí, nhanh)
- Fallback: `OPENAI_API_KEY` → Whisper `gpt-4o-mini-transcribe`
- Web Speech API (fallback cuối khi api lỗi)

---

## 4. Page Implementation

### 4.1 Chat Page (`src/pages/Chat.tsx`)

```typescript
const dir: Direction = getDirection()
const isA = dir === 'A'

// Setup screen — dropdown SITUATIONS/LEVELS dùng labelA/labelB
<select>
  {SITUATIONS.map(s => (
    <option>{isA ? s.labelA : s.labelB}</option>
  ))}
</select>

// Prompt
const sys = chatSystemPrompt(situationLabel(situation, dir), level, dir)

// Message — hiển thị
<p>{isA ? 'Chat với gia sư' : 'Chat with tutor'}</p>
```

**Khác biệt với Speaking:**

- Không có TTS/STT
- Text-only dialog
- Prompt dùng `chatSystemPrompt` (format khác)

---

### 4.2 Speaking Page (`src/pages/Speaking.tsx`)

```typescript
const dir: Direction = getDirection()
const isA = dir === 'A'

// STT language
const sttLang = isA ? 'en' : 'vi'

// Setup: SITUATIONS, LEVELS
<select>{SITUATIONS.map(s => (
  <option>{isA ? s.labelA : s.labelB}</option>
))}</select>

// Ghi âm
const r = await startRecording(sttLang)

// Prompt
const sys = speakingSystemPrompt(situationLabel(situation, dir), level, dir)

// AI trả JSON: { speech, feedback, corrected }
const ai = parseJson<AIResponse>(raw)

// TTS 2 chiều
await speakBilingual(
  ai.speech, ai.feedback,
  isA ? 'en-US' : 'vi-VN',
  isA ? 'vi-VN' : 'en-US',
)
```

**Luồng hội thoại:**

1. **Người dùng nói** → STT → text
2. **Gửi prompt + lịch sử** → AI trả JSON
3. **Phát audio**: speech (ngôn ngữ đích) → feedback (tiếng mẹ đẻ)
4. **Lưu session** Supabase

---

### 4.3 Writing Page (`src/pages/Writing.tsx`)

```typescript
const dir: Direction = getDirection()
const isA = dir === 'A'

// Sample prompts
const prompts = isA ? SAMPLE_PROMPTS_A : SAMPLE_PROMPTS_B

// Prompt
const sys = writingSystemPrompt(dir)

// AI trả JSON: { scores, errors, suggestions, sample, encouragement }
const feedback = parseJson<FeedbackData>(raw)

// Hiển thị: feedback.encouragement (Việt hoặc Anh tùy chiều)
<p>{feedback.encouragement}</p>
```

**Khác:** Writing không dùng TTS/STT, chỉ text input/output.

---

### 4.4 Home Page (`src/pages/Home.tsx`)

```typescript
const dir = getDirection()
const isA = dir === 'A'

// Nút gạt chiều
function toggleDir() {
  const next: Direction = dir === 'A' ? 'B' : 'A'
  setDirection(next)
  setLang(next === 'A' ? 'vi' : 'en') // đổi giao diện
}

// Cards — hiển thị mô tả tùy chiều
const modes = getModes(dir, T)
// Trong getModes():
// title: isA ? T.chatTitleA : T.chatTitleB
// desc: isA ? T.chatDescA : T.chatDescB
```

---

## 5. Extend Hệ Thống

### 5.1 Thêm Tình Huống Mới

**File:** `src/types.ts`

```typescript
export const SITUATIONS: { value: string; labelA: string; labelB: string }[] = [
  // ...existing...
  {
    value: 'hospital',
    labelA: 'Bệnh viện / Y tế',
    labelB: 'Hospital / Medical',
  },
]
```

**File:** `src/prompts/index.ts` → `situationLabel()`

```typescript
const mapA: Record<string, string> = {
  // ...
  hospital: 'Bệnh viện / Y tế',
}
const mapB: Record<string, string> = {
  // ...
  hospital: 'Hospital / Medical',
}
```

---

### 5.2 Thêm Feature Mới Dùng Direction

**Quy tắc:**

1. Import: `import { getDirection } from '../lib/storage'`
2. Dùng: `const dir = getDirection()`
3. Kiểm tra: `const isA = dir === 'A'`
4. Render:
   ```typescript
   isA ? '<tiếng Việt>' : '<Tiếng Anh>'
   ```

**Ví dụ:** Thêm page mới

```typescript
// src/pages/MyFeature.tsx
import { getDirection, type Direction } from '../lib/storage'
import { useLang } from '../context/useLang'

export default function MyFeature() {
  const dir: Direction = getDirection()
  const { T } = useLang()
  const isA = dir === 'A'

  return (
    <div>
      <h1>{isA ? 'Tính năng mới' : 'New Feature'}</h1>
      <p>{T.myFeatureDesc}</p>
    </div>
  )
}
```

**Cập nhật i18n** (`src/i18n.ts`):

```typescript
export const i18n = {
  vi: {
    // ...
    myFeatureDesc: 'Mô tả tiếng Việt',
  },
  en: {
    // ...
    myFeatureDesc: 'English description',
  },
}
```

---

### 5.3 Thêm Prompt Mới

**Template:**

```typescript
export function myPrompt(level: Level, dir: Direction = 'A'): string {
  if (dir === 'A') {
    return `Bạn là ... (prompt tiếng Việt)
    
    Trả về: ...`
  }
  return `You are ... (prompt tiếng Anh)
  
  Return: ...`
}
```

**Sử dụng:**

```typescript
const sys = myPrompt(level, dir)
const response = await callClaude(history, sys)
```

---

## 6. Testing Checklist

### 6.1 Manual Test (Developer)

```bash
# 1. Chạy dev server
npm run dev

# 2. Test Chiều A
# - Home: giao diện Tiếng Việt
# - Speaking: nói Anh → AI phát Anh + feedback Việt
# - Chat: gõ Anh → AI trả Anh, sửa Việt
# - Writing: gõ Anh → chấm IELTS, feedback Việt

# 3. Test Chiều B (bấm nút gạt)
# - Home: giao diện Tiếng Anh
# - Speaking: nói Việt → AI phát Việt + feedback Anh
# - Chat: gõ Việt → AI trả Việt, sửa Anh
# - Writing: gõ Việt → chấm điểm, feedback Anh
```

### 6.2 Kiểm Tra API

**TTS:**

```bash
curl -X POST http://localhost:3000/api/tts \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"text": "Hello", "lang": "en-US"}'
```

**STT:**

```bash
# Ghi âm browser → base64 → gửi
curl -X POST http://localhost:3000/api/stt \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"audio_b64": "...", "lang": "en"}'
```

---

## 7. Biến Môi Trường (Environment)

**File:** `.env`

```bash
# Server-only (không VITE_ prefix)
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
GOOGLE_TTS_API_KEY=...
TTS_ENCRYPTION_MASTER_KEY=...
GROQ_API_KEY=...  # dùng cho Groq Whisper + Llama
OPENAI_API_KEY=...  # fallback cho OpenAI Whisper
ANTHROPIC_API_KEY=...  # fallback cho Claude

# Public (có VITE_ prefix)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## 8. Troubleshooting

| Vấn đề                   | Nguyên nhân              | Giải pháp                                                  |
| ------------------------ | ------------------------ | ---------------------------------------------------------- |
| STT không nhận giọng Anh | `sttLang` sai            | Kiểm tra `const sttLang = isA ? 'en' : 'vi'`               |
| TTS phát sai giọng       | lang param sai           | Verify `speakBilingual(..., isA ? 'en-US' : 'vi-VN', ...)` |
| Chat phát prompt sai     | direction không pass     | Cập nhật `chatSystemPrompt(..., dir)`                      |
| UI không đổi sau toggle  | LangProvider not updated | Kiểm tra `setLang()` call trong `toggleDir()`              |
| 401 Unauthorized         | Chưa đăng nhập           | Refresh → Login lại                                        |

---

## 9. Danh Sách File Liên Quan

| File                           | Mục đích                                     |
| ------------------------------ | -------------------------------------------- |
| `src/types.ts`                 | Type `Direction`, `SITUATIONS`, `LEVELS`     |
| `src/lib/storage.ts`           | Get/set direction localStorage               |
| `src/lib/tts.ts`               | Function `speak()`, `speakBilingual()`       |
| `src/lib/stt.ts`               | Function `startListening()` (Web Speech API) |
| `src/lib/sttServer.ts`         | Function `startRecording()` (server STT)     |
| `src/prompts/index.ts`         | Prompt functions (chat, speaking, writing)   |
| `src/context/LangProvider.tsx` | UI language context                          |
| `src/pages/Chat.tsx`           | Chat page (text-only)                        |
| `src/pages/Speaking.tsx`       | Speaking page (audio + 2 voices)             |
| `src/pages/Writing.tsx`        | Writing page (essay grading)                 |
| `src/pages/Home.tsx`           | Home + toggle direction                      |
| `api/tts.ts`                   | TTS endpoint (Google Cloud TTS)              |
| `api/stt.ts`                   | STT endpoint (Groq/OpenAI Whisper)           |
| `api/claude.ts`                | LLM proxy (Groq/Anthropic)                   |

---

## 10. Git History

```bash
# Cleanup
commit ca6c530  Remove unused direction.ts — app uses Direction from types.ts
```

Commit này xóa `src/lib/direction.ts` (file không dùng, thay thế bằng `Direction` type từ `src/types.ts`).

---

**Last Updated:** 2026-06-24  
**Maintained by:** Claude Code
