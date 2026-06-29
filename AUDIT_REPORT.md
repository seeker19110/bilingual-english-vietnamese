# Báo cáo Audit — Bảo mật, Mobile-first & Đa thiết bị

> Ngày audit: 2026-06-20  
> Phạm vi: toàn bộ `src/`, `api/`, `index.html`, `vite.config.ts`

---

## 🔴 CRITICAL — Sửa trước khi public

### 1. API key Anthropic thật đang nằm trong `.env`

**File:** `.env` dòng 1

```
ANTHROPIC_API_KEY=sk-ant-api03-2aXZema...
```

`.env` đã có trong `.gitignore` nên chưa bị commit — **nhưng cần kiểm tra lại git history** (`git log --all -- .env`) để chắc chắn key chưa từng bị commit. Nếu từng commit thì phải **rotate key ngay** trên console.anthropic.com.

---

### 2. Hệ thống xác thực hoàn toàn không an toàn (localStorage + btoa)

**File:** `src/lib/storage.ts` dòng 25–48

```ts
function hashPassword(pw: string): string {
  return btoa(encodeURIComponent(pw)) // ← base64, KHÔNG phải hash!
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
  model: 'claude-haiku-4-5-20251001', // cứng, không cho đổi
  max_tokens: Math.min(body.max_tokens ?? 1024, 2048), // giới hạn tối đa
  system: String(body.system ?? '').slice(0, 5000), // giới hạn độ dài
  messages: body.messages,
}
```

Dài hạn: thêm `Authorization: Bearer <supabase-jwt>` header từ client, verify ở server.

---

## 🟡 MEDIUM — Sửa trong sprint tiếp theo

### 4. Không có CORS restrictions trên API

`api/claude.ts` và `api/pronunciation.ts` không set CORS headers.  
Mặc định Vercel Edge sẽ trả về không có `Access-Control-Allow-Origin` cụ thể, nhưng nên explicit:

```ts
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://your-domain.vercel.app', // domain thật
  'Access-Control-Allow-Methods': 'POST',
}
```

### 5. Không có input validation trên essay/chat

**File:** `src/pages/Writing.tsx` — essay dài bao nhiêu cũng gửi được.  
Nên thêm giới hạn phía client và server:

```ts
if (essay.length > 10000) {
  setError('Bài viết quá dài (tối đa 10.000 ký tự)')
  return
}
```

### 6. `localStorage` mất dữ liệu nếu user xóa cache / đổi thiết bị

Dữ liệu học (chat history, writing history) chỉ tồn tại trên 1 thiết bị, 1 browser.  
Người dùng Pro trả tiền sẽ mất `plan: 'pro'` khi đổi máy — nghiêm trọng về UX.  
Cần migrate sang Supabase DB trước khi bán gói Pro.

---

## 📱 MOBILE-FIRST — Lỗi giao diện di động

### 7. 🔴 Thiếu `safe-area-inset` — thanh input bị che bởi home indicator iPhone

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

**File:** `src/components/Layout.tsx` dòng 51

```tsx
<div className="hidden sm:flex ...">
  <span>Chat: {usage.chatCount}/{limit.chat}</span>
```

Trên mobile (`sm` = 640px), user không biết còn bao nhiêu lượt. Chỉ biết khi bị chặn.

**Sửa:** Hiện badge nhỏ thay vì ẩn hoàn toàn:

```tsx
{
  /* Mobile: chỉ hiện progress bar nhỏ */
}
;<div className="sm:hidden">
  <div className="w-8 h-1 bg-zinc-700 rounded-full overflow-hidden">
    <div
      className="h-full bg-emerald-500 rounded-full"
      style={{ width: `${Math.min(100, (usage.chatCount / limit.chat) * 100)}%` }}
    />
  </div>
</div>
{
  /* Desktop: text đầy đủ */
}
;<div className="hidden sm:flex ...">...</div>
```

---

### 11. 🟡 Writing textarea `rows={14}` không dùng được khi keyboard mở

**File:** `src/pages/Writing.tsx`  
Textarea 14 dòng + keyboard ảo = hầu như không thấy gì. Trên mobile nên dùng chiều cao linh hoạt:

```tsx
// Thay rows={14} thành
className = '... min-h-[200px] max-h-[50vh]'
// và thêm style={{ height: 'auto', overflowY: 'auto' }}
```

---

## 🖥️ ĐA THIẾT BỊ

### 12. 🔴 STT (giọng nói) chỉ chạy được trên Chrome/Edge

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

| #   | Vấn đề                                       | Mức | Sửa ngay?           |
| --- | -------------------------------------------- | --- | ------------------- |
| 1   | Kiểm tra git history, rotate API key nếu cần | 🔴  | Ngay                |
| 2   | Auth localStorage + btoa không an toàn       | 🔴  | Trước khi public    |
| 3   | `/api/claude` không rate limit / auth        | 🔴  | Trước khi public    |
| 7   | iOS home indicator che input bar             | 🔴  | Ngay (2 dòng fix)   |
| 8   | Enter key gửi tin trên mobile                | 🔴  | Dễ fix              |
| 9   | Touch target nút logout quá nhỏ              | 🟡  | Sprint tới          |
| 10  | Lượt dùng ẩn trên mobile                     | 🟡  | Sprint tới          |
| 11  | Textarea quá cao khi keyboard mở             | 🟡  | Sprint tới          |
| 12  | STT không có fallback cho Safari/Firefox     | 🔴  | Nên có trước launch |
| 13  | TTS iOS Safari cần user gesture              | 🟡  | Kiểm tra thực tế    |
