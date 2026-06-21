# Hướng dẫn setup: Đăng nhập thật (Supabase Auth)

Hệ thống đăng nhập cũ (`src/lib/storage.ts`) chỉ lưu ở localStorage — server không kiểm tra được, không an toàn. Giờ đã đổi sang **Supabase Auth thật**. Code đã viết xong; bạn cần làm 2 việc trên Supabase Dashboard + kiểm tra biến `.env`.

---

## 1. Bật đăng nhập bằng Email/Password

Vào Supabase Dashboard → **Authentication → Providers** → đảm bảo **Email** đang bật (mặc định đã bật).

### Tắt "Confirm email" để test nhanh ở máy (khuyên dùng lúc dev)

Mặc định Supabase yêu cầu xác nhận email trước khi đăng nhập được — nếu chưa cấu hình gửi email riêng, tài khoản mới tạo sẽ "kẹt" chờ xác nhận.

Vào **Authentication → Providers → Email** → tắt **"Confirm email"** → Save.

> Nhớ bật lại khi đưa app cho người khác dùng thật, để tránh ai cũng đăng ký được bằng email không phải của họ.

## 2. Lấy anon key (đã điền sẵn trong `.env`)

`.env` đã có `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` — mình lấy lại đúng project Supabase bạn đang dùng. Không cần làm gì thêm ở bước này.

⚠️ **Phát hiện khi soát code:** biến `SUPABASE_SERVICE_ROLE_KEY` trong `.env` hiện đang là **anon key** (giải mã JWT thấy `"role":"anon"`), không phải service_role key thật. Nghĩa là `api/tts.ts`, `api/pronunciation.ts` đang chạy với quyền giới hạn (anon, bị Row Level Security chặn) thay vì toàn quyền admin như tên biến gợi ý — đây là lỗi nhập nhầm từ trước, không liên quan đến việc đổi đăng nhập hôm nay. Để sửa: vào **Project Settings → API**, copy đúng dòng **`service_role`** (khác với dòng `anon`/`public`), dán thay vào `SUPABASE_SERVICE_ROLE_KEY`. Nếu hiện tại app vẫn upload/lưu cache TTS bình thường thì có thể RLS đang cho phép anon ghi — nên kiểm tra lại policy của bảng `tts_cache`/`pronunciations` và bucket Storage `pronunciations` để chắc chắn không bị public ghi tùy ý.

## 3. Chạy thử

```bash
npm run dev
```

- Mở app → bị chuyển sang `/login` (không còn tài khoản "Khách" tự động vào).
- Bấm **Đăng ký** → tạo tài khoản mới → vào thẳng trang chính (nếu đã tắt "Confirm email" ở bước 1) hoặc thấy thông báo "kiểm tra email".
- Đăng xuất (icon ở góc) → đăng nhập lại bằng email/mật khẩu vừa tạo → vào lại được.

## 4. Lưu ý dữ liệu cũ

Tài khoản "Khách" cũ (lưu local) và lịch sử chat/viết/nói gắn theo id cũ sẽ **không** tự chuyển sang tài khoản Supabase mới — vì id user đã đổi (giờ là uuid thật của Supabase). Nếu cần giữ lại lịch sử cũ, phải tự export/import thủ công; mặc định coi như bắt đầu lại từ đầu, phù hợp vì app vẫn đang ở giai đoạn phát triển.

## 5. Khi deploy lên Vercel

Vào **Project Settings → Environment Variables**, thêm `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `TTS_ENCRYPTION_MASTER_KEY` (xem `TTS_CACHE_SETUP.md` để biết thêm về biến mã hóa).

---

## Đã đổi gì trong code

- `src/lib/supabaseClient.ts` — **file mới**, Supabase client phía browser (dùng anon key).
- `src/context/AuthContext.tsx` — **file mới**, `AuthProvider` + hook `useAuth()` (user/accessToken/loading + signIn/signUp/signOut thật qua Supabase).
- `src/App.tsx` — bọc app bằng `AuthProvider`; `RequireAuth` dùng `useAuth()`; bỏ `ensureDefaultUser()` (không còn tài khoản Khách).
- `src/pages/Login.tsx` — gọi `signIn`/`signUp` từ `useAuth()` (bất đồng bộ), xử lý trường hợp cần xác nhận email.
- `src/components/Layout.tsx`, `src/pages/Home.tsx`, `Chat.tsx`, `Writing.tsx`, `Speaking.tsx` — đổi `getCurrentUser()` (storage.ts) sang `useAuth().user`.
- `src/lib/storage.ts` — bỏ các hàm đăng nhập cũ (`register`, `login`, `logout`, `getCurrentUser`, `ensureDefaultUser`); vẫn giữ các hàm lưu chat/viết/nói/lượt dùng (chỉ đổi nguồn `userId`).
- `src/vite-env.d.ts` — khai báo type cho `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`.
