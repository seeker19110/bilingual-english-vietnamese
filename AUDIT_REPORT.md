# Báo cáo Audit — Bảo mật, Mobile-first & Đa thiết bị

> Ngày audit: 2026-06-20  
> Phạm vi: toàn bộ `src/`, `api/`, `index.html`, `vite.config.ts`
>
> **Cập nhật 2026-07-02:** Đã đối chiếu lại toàn bộ báo cáo với code hiện tại.
> Hầu hết các mục 🔴 đã được sửa (xem trạng thái đầu mỗi mục và bảng tóm tắt cuối file).
> Giữ nguyên nội dung gốc bên dưới để tham khảo lịch sử; **trạng thái mới nhất luôn ở dòng "Cập nhật"**.

---

## 🔴 CRITICAL — Sửa trước khi public

### 1. API key Anthropic thật đang nằm trong `.env`
> ✅ **Đã kiểm tra 2026-07-02:** `git log --all --oneline -- .env` không có kết quả — `.env` chưa từng bị commit. Không cần rotate key.

**File:** `.env` dòng 1  
```
ANTHROPIC_API_KEY=sk-ant-api03-2aXZema...
```
`.env` đã có trong `.gitignore` nên chưa bị commit — **nhưng cần kiểm tra lại git history** (`git log --all -- .env`) để chắc chắn key chưa từng bị commit. Nếu từng commit thì phải **rotate key ngay** trên console.anthropic.com.

---

### 2. Hệ thống xác thực hoàn toàn không an toàn (localStorage + btoa)
> ✅ **Đã sửa:** `src/lib/auth.ts` giờ dùng thẳng `supabase.auth.signUp()` / `signInWithPassword()` / `signInWithOAuth()`. Không còn `btoa` hay lưu mật khẩu ở client.

**File:** `src/lib/storage.ts` dòng 25–48  
```ts
function hashPassword(pw: string): string {
  return btoa(encodeURIComponent(pw))  // ← base64, KHÔNG phải hash!
}
```
Vấn đề:
- `btoa` là **mã hóa thuận nghịch**, không phải hash. Ai đọc được localStorage là có mật khẩu thật.
- Toàn bộ dữ liệu user, lịch sử học, gói dùng (`plan: 'free'/'pro'`) đều lưu trên localStorage — **bất kỳ ai mở DevTools đều sửa được**.
- User có thể tự nâng lên gói Pro bằng cách sửa `et_current_user` trong localStorage.

**Hướng sửa (khi chuyển sang Supabase Auth thật):**
- Dùng `supabase.auth.signUp()` / `signIn()` — Supabase tự hash + lưu server-side.
- Giới hạn lượt dùng phải kiểm tra ở server (API function), không phải ở browser.

---

### 3. `/api/claude` không có rate limiting / auth — ai cũng gọi được
> ✅ **Đã sửa:** `api/_lib/security.ts` cung cấp `checkRateLimit` + `validateAuth` (JWT Supabase), đã áp dụng ở `api/claude.ts`, `api/tts.ts`, `api/stt.ts`, `api/pronunciation.ts`.

**File:** `api/claude.ts`  
Serverless function này chỉ kiểm tra `method === 'POST'`, không kiểm tra:
- Auth token (ai gọi?)
- Rate limit (bao nhiêu lần/phút?)
- Model và max_tokens (user có thể gửi `"model": "claude-opus-4-5", "max_tokens": 8192`)
- Kích thước request body

**Tác hại:** Nếu ai biết URL Vercel deployment, họ có thể spam API của bạn, tốn tiền không giới hạn.

**Hướng sửa ngắn hạn (chưa có Supabase Auth):**
```ts
// Thêm vào đầu handler, trước khi gọi Anthropic
const body = await req.json()

// Ép model và max_tokens ở server — không tin client
const safeBody = {
  model: 'claude-haiku-4-5-20251001',   // cứng, không cho đổi
  max_tokens: Math.min(body.max_tokens ?? 1024, 2048),  // giới hạn tối đa
  system: String(body.system ?? '').slice(0, 5000),     // giới hạn độ dài
  messages: body.messages,
}
```
Dài hạn: thêm `Authorization: Bearer <supabase-jwt>` header từ client, verify ở server.

---

## 🟡 MEDIUM — Sửa trong sprint tiếp theo

### 4. Không có CORS restrictions trên API
> ✅ **Đã sửa:** `getCorsHeaders()` trong `api/_lib/security.ts`, đọc whitelist từ `ALLOWED_ORIGINS`, áp dụng ở mọi endpoint.

`api/claude.ts` và `api/pronunciation.ts` không set CORS headers.  
Mặc định Vercel Edge sẽ trả về không có `Access-Control-Allow-Origin` cụ thể, nhưng nên explicit:
```ts
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://your-domain.vercel.app',  // domain thật
  'Access-Control-Allow-Methods': 'POST',
}
```

### 5. Không có input validation trên essay/chat
> ✅ **Đã sửa:** `src/pages/Writing.tsx` đã giới hạn 10.000 ký tự.

**File:** `src/pages/Writing.tsx` — essay dài bao nhiêu cũng gửi được.  
Nên thêm giới hạn phía client và server:
```ts
if (essay.length > 10000) { setError('Bài viết quá dài (tối đa 10.000 ký tự)'); return }
```

### 6. `localStorage` mất dữ liệu nếu user xóa cache / đổi thiết bị
> ✅ **Đã sửa:** Đồng bộ 2 chiều với Supabase qua `src/lib/useCloudSync.ts` + `src/lib/cloud.ts` (xem `SUPABASE_SYNC_SETUP.md`). `plan` đọc từ bảng `profiles`, không mất khi đổi máy.

Dữ liệu học (chat history, writing history) chỉ tồn tại trên 1 thiết bị, 1 browser.  
Người dùng Pro trả tiền sẽ mất `plan: 'pro'` khi đổi máy — nghiêm trọng về UX.  
Cần migrate sang Supabase DB trước khi bán gói Pro.

---

## 📱 MOBILE-FIRST — Lỗi giao diện di động

### 7. 🔴 Thiếu `safe-area-inset` — thanh input bị che bởi home indicator iPhone
> ✅ **Đã sửa:** `viewport-fit=cover` trong `index.html`, `.pb-safe`/`env(safe-area-inset-*)` trong `src/index.css`.

**File:** `index.html`

Viewport hiện tại:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

Các trang Chat và Speaking có thanh input/control `sticky bottom-0`. Trên iPhone (Safari iOS), thanh home indicator (28px) sẽ **che phủ phần input**, user không bấm được nút Send/Mic.

**Sửa:**
```html
<!-- index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

```css
/* src/index.css — thêm vào cuối */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

```tsx
{/* Chat.tsx và Speaking.tsx — sticky bottom bar */}
<div className="sticky bottom-0 bg-zinc-950/95 ... pb-safe">
```

---

### 8. 🔴 Enter key trên mobile gửi tin nhắn thay vì xuống dòng
> ✅ **Đã sửa:** `Chat.tsx` dùng `window.matchMedia('(pointer: coarse)')` để chỉ bật Enter-to-send trên desktop.

**File:** `src/pages/Chat.tsx` dòng 234
```tsx
onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
```
Trên mobile, keyboard Enter thường dùng để xuống dòng. User sẽ hay gửi nhầm.

**Sửa:** Tắt tính năng này trên mobile — thêm nút Send riêng (đã có rồi). Hoặc detect thiết bị:
```tsx
// Chỉ bật Enter-to-send trên desktop
const isMobile = /Mobi|Android/i.test(navigator.userAgent)
onKeyDown={e => !isMobile && e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
```

---

### 9. 🟡 Touch target quá nhỏ
> ✅ **Đã sửa:** Nút logout trong `Layout.tsx` đã đổi sang `p-3`.

**File:** `src/components/Layout.tsx`  
Nút logout: `p-1` → kích thước ~26px. Apple/Google khuyến nghị **tối thiểu 44px**.

```tsx
// Hiện tại
<button onClick={handleLogout} className="text-zinc-500 hover:text-red-400 transition p-1 rounded">

// Sửa thành
<button onClick={handleLogout} className="text-zinc-500 hover:text-red-400 transition p-3 rounded-lg -m-2">
```

Nút volume/mute và plus trong Speaking.tsx: `p-2.5` → ~34px, cũng hơi nhỏ. Nâng lên `p-3`.

---

### 10. 🟡 Thông tin lượt dùng ẩn hoàn toàn trên mobile
> ✅ **Đã sửa:** `Layout.tsx` có badge riêng cho mobile (`sm:hidden`) bên cạnh bản desktop (`hidden sm:flex`).

**File:** `src/components/Layout.tsx` dòng 51
```tsx
<div className="hidden sm:flex ...">
  <span>Chat: {usage.chatCount}/{limit.chat}</span>
```
Trên mobile (`sm` = 640px), user không biết còn bao nhiêu lượt. Chỉ biết khi bị chặn.

**Sửa:** Hiện badge nhỏ thay vì ẩn hoàn toàn:
```tsx
{/* Mobile: chỉ hiện progress bar nhỏ */}
<div className="sm:hidden">
  <div className="w-8 h-1 bg-zinc-700 rounded-full overflow-hidden">
    <div className="h-full bg-emerald-500 rounded-full"
      style={{ width: `${Math.min(100, usage.chatCount / limit.chat * 100)}%` }} />
  </div>
</div>
{/* Desktop: text đầy đủ */}
<div className="hidden sm:flex ...">...</div>
```

---

### 11. 🟡 Writing textarea `rows={14}` không dùng được khi keyboard mở
> ✅ **Đã sửa:** `Writing.tsx` dùng `min-h-[200px] max-h-[50vh]`.

**File:** `src/pages/Writing.tsx`  
Textarea 14 dòng + keyboard ảo = hầu như không thấy gì. Trên mobile nên dùng chiều cao linh hoạt:
```tsx
// Thay rows={14} thành
className="... min-h-[200px] max-h-[50vh]"
// và thêm style={{ height: 'auto', overflowY: 'auto' }}
```

---

## 🖥️ ĐA THIẾT BỊ

### 12. 🔴 STT (giọng nói) chỉ chạy được trên Chrome/Edge
> ✅ **Đã sửa:** `Speaking.tsx` có ô nhập text fallback (`placeholder="Gõ tiếng Anh thay vì nói..."`) khi `!isRecordingSupported() && !isSTTSupported()`. Ngoài ra STT thật (Whisper qua Groq/OpenAI) đã thay Web Speech API làm phương án chính.

`Web Speech API` không có trên Firefox, Safari iOS 15 trở xuống.  
Trang Speaking hiện có cảnh báo nhưng không có fallback — user Safari/Firefox bị kẹt hoàn toàn.

**Hướng sửa:** Thêm ô text input fallback khi STT không hỗ trợ:
```tsx
{!isSTTSupported() && (
  <div className="flex gap-2">
    <input placeholder="Gõ tiếng Anh thay vì nói..." ... />
    <button onClick={() => sendUserSpeech(typedText)}>Gửi</button>
  </div>
)}
```

### 13. 🟡 TTS trên iOS Safari có vấn đề
> 🟡 **Một phần:** Có nút Play thủ công (`onPlay` trong `SpeakBubble`), nhưng `speakBilingual` vẫn được gọi tự động sau `callClaude` ở một vài chỗ (`Speaking.tsx` dòng ~213, ~318) — chưa chắc chắn 100% trên iOS Safari nếu không qua click. Nên test tay trên iPhone thật.

`speechSynthesis` trên Safari iOS yêu cầu **user gesture** mới phát âm được. Nếu AI tự động đọc sau khi API trả về (không phải từ click trực tiếp của user), Safari sẽ im lặng không báo lỗi.

Hiện tại `speakBilingual` được gọi trong async callback sau `callClaude` — không phải user gesture — nên **có thể không phát âm trên iOS Safari**.

**Hướng sửa:** Luôn yêu cầu user nhấn nút Play để nghe, thay vì tự động phát.

### 14. 🟢 Điều tốt đã có
- API key không bị bundle vào JS frontend ✅
- Proxy pattern đúng chuẩn ✅  
- `supabaseAdmin` chỉ dùng ở server ✅
- `.env` trong `.gitignore` ✅
- Viewport meta tag có mặt ✅
- `theme-color` cho PWA ✅
- Responsive design với Tailwind breakpoints ✅
- Mic button 64px — đủ lớn ✅
- `max-w-sm` form center trên mọi màn hình ✅
- Sticky header + sticky input bar ✅

---

## Tóm tắt ưu tiên

| # | Vấn đề | Mức | Trạng thái (2026-07-02) |
|---|--------|-----|-----------|
| 1 | Kiểm tra git history, rotate API key nếu cần | 🔴 | ✅ Đã kiểm tra, chưa từng commit |
| 2 | Auth localStorage + btoa không an toàn | 🔴 | ✅ Đã sửa (Supabase Auth thật) |
| 3 | `/api/claude` không rate limit / auth | 🔴 | ✅ Đã sửa |
| 4 | Không có CORS restrictions | 🟡 | ✅ Đã sửa |
| 5 | Không validate độ dài essay | 🟡 | ✅ Đã sửa |
| 6 | Mất dữ liệu khi đổi thiết bị | 🟡 | ✅ Đã sửa (Supabase sync) |
| 7 | iOS home indicator che input bar | 🔴 | ✅ Đã sửa |
| 8 | Enter key gửi tin trên mobile | 🔴 | ✅ Đã sửa |
| 9 | Touch target nút logout quá nhỏ | 🟡 | ✅ Đã sửa |
| 10 | Lượt dùng ẩn trên mobile | 🟡 | ✅ Đã sửa |
| 11 | Textarea quá cao khi keyboard mở | 🟡 | ✅ Đã sửa |
| 12 | STT không có fallback cho Safari/Firefox | 🔴 | ✅ Đã sửa |
| 13 | TTS iOS Safari cần user gesture | 🟡 | 🟡 Một phần — nên test tay trên iPhone thật |

**Còn lại duy nhất mục #13** cần kiểm tra thủ công trên thiết bị thật (không thể xác nhận chỉ bằng đọc code).
