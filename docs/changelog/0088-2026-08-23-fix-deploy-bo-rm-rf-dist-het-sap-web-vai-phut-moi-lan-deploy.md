# fix(deploy): bỏ `rm -rf dist` — hết sập web vài phút mỗi lần deploy (2026-08-23)

**Sự cố THẬT do người dùng báo:** không đăng nhập được, Console hiện `login:1 … status of 503`.

**Chẩn đoán (từ log production, không đoán):**

```
Error: ENOENT: no such file or directory, stat '/var/www/dhcb/dist/index.html'
   14:56:38 · 14:57:40 · 14:58:10   ← đúng lúc người dùng thử đăng nhập
```

`pm2 status` cho thấy cả 3 instance **online** — app KHÔNG chết. Grep toàn server: **không
handler nào trả 503** cho luồng đăng nhập. Nên 503 là do nginx/tầng trước không lấy được
`dist/index.html`.

**Gốc bệnh — `scripts/deploy.sh` bước [3] chạy `rm -rf dist`, mãi bước [6] mới build lại.**
Suốt khoảng giữa (cài dependencies + migration + build) app vẫn phục vụ nhưng giao diện đã bị
xoá → mọi request vào trang đều hỏng. Đây KHÔNG phải lỗi đăng nhập Google; nút Google chỉ là
nạn nhân.

**Đã sửa:** bỏ hẳn dòng đó. Nó vốn **thừa** — `apps/dhcb/vite.config.ts` đã đặt
`emptyOutDir: true` nên Vite tự dọn sạch ngay trước khi ghi.

**Bằng chứng (đo thật, không suy luận):**

1. **Chứng minh không sinh rác:** đặt 2 file rác vào `dist/` (`FILE-RAC-CU.txt` và một asset
   cũ trong `dist/assets/`) rồi build mà KHÔNG xoá tay → **cả hai biến mất**. Tức `emptyOutDir`
   dọn sạch thật, bỏ `rm -rf dist` không làm build bẩn hơn.
2. **Đo cửa sổ chết:** thăm dò sự tồn tại của `dist/index.html` mỗi 0,05s trong lúc build →
   **7,50 giây** (135 lần thăm dò thấy vắng). Trước khi sửa, cửa sổ này kéo dài từ bước [3] tới
   hết bước [6] — trên VPS là **vài phút** (log ENOENT rải suốt 14:56→14:58).
3. `bash -n scripts/deploy.sh` hợp lệ.

**Chưa làm (tuỳ người dùng quyết):** muốn về ~0 giây thì phải build ra thư mục tạm rồi đổi tên
(atomic swap). Đổi lại là thêm bước phức tạp trong script deploy; 7,5s đã giải quyết 95% vấn đề
nên chưa làm trong lúc đang có sự cố.

**Ba vấn đề khác log vừa phơi ra (CHƯA sửa, ghi để không quên):**

- 🔴 **`GEMINI_API_KEY` trên VPS đang hỏng — `HTTP 401`** (feature-status cron báo `gemini: down`).
  Chặn luôn việc kiểm `smoke:gemini-live`, và nhánh dự phòng Gemini trong chat đang chết.
- 🟡 **Redis chết** (`Stream isn't writeable…`) → rate-limit rơi về Map in-memory **mỗi
  instance**; cluster 3 instance nghĩa là hạn mức thực tế lỏng **gấp 3**.
- 🟡 Anthropic + OpenAI STT `unconfigured` → chỉ còn Groq gánh AI, hỏng là hết đường lui.
  SMTP cũng chưa cấu hình nên email nhắc học bị bỏ qua im lặng.
