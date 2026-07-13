# Setup: Đăng nhập (Supabase Auth)

Đăng nhập dùng **Supabase Auth thật** (không còn tài khoản "Khách" lưu localStorage).
Code đã xong — phần dưới là việc cần làm trên Supabase Dashboard + kiểm tra `.env`.

## 1. Bật đăng nhập Email/Password

**Authentication → Providers → Email** — mặc định đã bật.

**Tắt "Confirm email" khi dev** (để tài khoản mới không bị kẹt chờ xác nhận):
**Authentication → Providers → Email** → tắt **Confirm email** → Save.

> Bật lại trước khi cho người khác dùng thật, tránh ai cũng đăng ký được bằng email không phải của họ.

## 2. (Tuỳ chọn) Đăng nhập Google

App hỗ trợ `loginWithGoogle()` (OAuth). Muốn dùng: **Authentication → Providers → Google** → bật + điền Client ID/Secret.

## 3. Biến môi trường

`.env` cần có `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (Project Settings → API).
Lấy đúng project Supabase đang dùng. Trên VPS production, xem `docs/deploy-vps-ubuntu.md`.

## 4. Chạy thử

```bash
npm run dev
```

- Mở app → chuyển sang `/login`.
- **Đăng ký** → tài khoản mới → vào thẳng trang chính (đã tắt Confirm email) hoặc thấy thông báo "kiểm tra email".
- Đăng xuất → đăng nhập lại bằng email/mật khẩu vừa tạo.

## 5. Lưu ý dữ liệu cũ

Tài khoản "Khách" cũ (localStorage) không tự chuyển sang tài khoản Supabase mới (id đổi
sang uuid thật). Coi như bắt đầu lại — hợp lý vì app còn đang phát triển.

---

## Code liên quan

| File | Vai trò |
| --- | --- |
| `src/lib/supabase.ts` | Supabase client phía browser (anon key) |
| `src/lib/auth.ts` | `register`/`login`/`logout`/`getCurrentUser`/`loginWithGoogle` — gọi Supabase Auth thật |
| `src/context/AuthProvider.tsx` + `authContext.ts` + `useAuth.ts` | Context/hook `useAuth()` cho toàn app |
| `src/App.tsx` | Bọc app bằng `AuthProvider`; `RequireAuth` chặn route chưa đăng nhập |
| `src/lib/storage.ts` | Chỉ còn `register`/`login`/`logout`/`getCurrentUser` cho **guest localStorage** (không dùng cho auth thật); các hàm lưu chat/viết/nói/lượt dùng vẫn ở đây |

⚠️ `SUPABASE_SERVICE_ROLE_KEY` trong `.env` phải là **service_role key** thật (Project
Settings → API, dòng `service_role`) — KHÔNG phải `anon` key. Nhầm 2 key này khiến
`api/tts.ts`/`api/pronunciation.ts` chạy với quyền bị RLS chặn thay vì quyền admin.
