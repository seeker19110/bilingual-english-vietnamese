# chore(vps): script tạo swap + đo lại 2 mục nợ kỹ thuật bằng số thật (2026-08-26)

Người dùng hỏi "3 vCPU / 3GB đủ vận hành server không?" rồi gửi số đo thật từ VPS. Đợt này trả
lời bằng dữ liệu và vá chỗ mỏng nhất.

- **`scripts/setup-swap.sh` (mới)** — tạo swap có kiểm soát: kiểm swap đã có, **chặn khi đĩa
  không đủ** (đòi dư ≥ 2 GB sau khi trừ swap), hỏi xác nhận trước khi ghi (bỏ qua bằng `--yes`),
  ghi `/etc/fstab` để sống qua reboot, đặt `vm.swappiness=10`. Kèm Bước 3a trong
  `docs/deploy-vps-ubuntu.md`.
  Đã thử cả hai nhánh chặn: gõ sai xác nhận → huỷ, không đụng gì; xin 500G trên đĩa 30G → thoát
  mã 1, không tạo file. (Trong lúc thử suýt tạo swap 6G ngay trong container vì ở đó cũng là
  root — chính vì vậy mới thêm bước xác nhận.)
- **Nợ ngân sách: đo lại, phần bundle ĐÓNG.** JS 124,03/140 kB (dư ~11,4%) · CSS 15,87/18 kB
  (dư ~11,8%). Con số "99,7%" ghi 2026-08-25 đã lạc hậu vì ngưỡng được nới ở PR sau đó mà mục
  nợ không cập nhật — đúng loại lệch Tầng 6b sinh ra để bắt. Phần **coverage vẫn mỏng thật**:
  branches 90,17% trên sàn 90, dư 0,17 điểm.
- **Nợ Gemini: hạ 🔴 → 🟡.** Ảnh trang Trạng thái tính năng (lượt tự động 07:00 26/8/2026) cho
  thấy Gemini hoạt động 512ms, cả 6 dịch vụ còn lại bình thường ⇒ tên model và key đều đúng.
  **Không đóng cả mục:** health-check chứng minh _gọi được API_, không chứng minh _chất lượng sư
  phạm không tụt_ — baseline `eval:tutor` vẫn là bản cũ hơn ngày đổi prompt/model.
- **Nợ mới 🔴:** VPS chưa chạy swap (script mới chỉ nằm trong repo). Kèm hai đề xuất chưa vá,
  chờ chốt: `max_memory_restart` cho PM2 và `PG_POOL_MAX=5`. Và một quan sát **chưa kết luận**:
  `pm2 list` hiện ↺ 64 ở cả ba instance — có thể chỉ là cộng dồn qua các lần deploy, cần đọc
  `pm2 logs --err` mới biết, nên không gọi là bình thường.

**Trả lời câu hỏi gốc:** đủ cho hiện tại — phần nặng nhất (Pyodide, SQLite WASM, linkedom của
môn Lập trình) chạy trong TRÌNH DUYỆT học viên chứ không phải server, và AI đều gọi API ngoài;
server chỉ định tuyến, kiểm quyền, đọc/ghi Postgres. Ngưỡng phải nâng: vượt ~1.000 người đồng
thời thì tách Postgres/Redis sang máy riêng (runbook GĐ2 đã có sẵn).
