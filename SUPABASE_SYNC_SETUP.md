# Hướng dẫn bật đồng bộ Supabase (chat / viết / nói / lượt dùng)

> Mục tiêu: đăng nhập một lần, mọi máy/trình duyệt đều thấy cùng lịch sử học và
> số lượt còn lại. Trước đây dữ liệu chỉ nằm trong trình duyệt (localStorage) nên
> đổi máy là mất.

Làm theo 3 bước. Tổng thời gian ~5 phút.

---

## Bước 1 — Tạo bảng trong Supabase (1 lần duy nhất)

1. Vào **Supabase Dashboard** → chọn project của bạn.
2. Menu trái → **SQL Editor** → **New query**.
3. Mở file [`supabase/schema.sql`](supabase/schema.sql) trong repo, **copy toàn bộ**
   dán vào ô query.
4. Bấm **Run** (góc dưới phải). Thấy "Success" là xong.

> File này tạo 5 bảng (`profiles`, `chat_sessions`, `writing_submissions`,
> `speaking_sessions`, `daily_usage`) và bật **Row Level Security**: mỗi người
> chỉ đọc/ghi được dữ liệu của chính mình. Chạy lại nhiều lần cũng không sao.

---

## Bước 2 — Đặt biến môi trường trên Vercel

Vào **Vercel → Project → Settings → Environment Variables**, thêm các biến sau
(lấy giá trị ở **Supabase → Project Settings → API**):

| Biến | Dùng ở đâu | Lấy ở đâu |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend (login + đồng bộ) | API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | API → `anon` `public` key |
| `ANTHROPIC_API_KEY` | Server (gọi AI) | console.anthropic.com |

> ⚠️ Hai biến `VITE_*` **bắt buộc có tiền tố `VITE_`** thì frontend mới đọc được.
> Nếu thiếu, đăng nhập sẽ **luôn báo sai** dù mật khẩu đúng (đây là lỗi "không đăng
> nhập được" hay gặp). Sau khi thêm biến, nhớ **Redeploy** lại để có hiệu lực.

(Tùy chọn — chỉ cần nếu dùng cache phát âm từ điển: `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_TTS_API_KEY` — xem `PRONUNCIATION_CACHE_SETUP.md`.)

---

## Bước 3 — Kiểm tra

1. Mở app trên Vercel, **đăng ký** một tài khoản mới.
2. Vào **Supabase → Table Editor → `profiles`**: phải thấy 1 dòng mới.
3. Chat vài câu → mở **Table Editor → `chat_sessions`**: thấy phiên chat vừa tạo.
4. Đăng nhập **cùng tài khoản đó trên trình duyệt/máy khác**: lịch sử và số lượt
   dùng phải hiện lại y hệt → **đồng bộ thành công**.

---

## Cách hoạt động (cho người mới)

- `localStorage` vẫn dùng làm **bộ nhớ đệm** để app chạy nhanh và offline được.
- Mỗi lần lưu (chat/viết/nói/lượt), app **đẩy** bản ghi lên Supabase ngầm
  (không làm giật giao diện) — code ở `src/lib/cloud.ts`.
- Khi mở trang, app **kéo** dữ liệu mới nhất từ Supabase về (hook
  `src/lib/useCloudSync.ts`) rồi vẽ lại.
- Mọi dữ liệu gắn với `user_id` = id tài khoản Supabase, được RLS bảo vệ.

## Nâng cấp Pro

Muốn cho một tài khoản dùng gói Pro: vào **Table Editor → `profiles`**, sửa cột
`plan` của dòng tương ứng từ `free` thành `pro`. App sẽ tự nới giới hạn lượt khi
người đó đăng nhập lại. (Thanh toán tự động sẽ làm sau.)
