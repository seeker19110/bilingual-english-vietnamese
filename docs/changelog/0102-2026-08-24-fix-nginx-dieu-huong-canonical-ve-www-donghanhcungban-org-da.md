# fix(nginx): điều hướng canonical về www.donghanhcungban.org — đã đo thật (2026-08-24)

**Tài liệu `docs/doi-ten-mien-chinh-org.md` khẳng định sai gần 1 tháng.** Ghi từ 2026-07-31 là
apex `donghanhcungban.org` + cả 2 domain `.com` đều 301 redirect về `www.donghanhcungban.org`.
Người dùng đo thật trên VPS (`curl -sI`) cho kết quả ngược lại: **cả 6 domain đều trả `HTTP/2
200`** — không domain nào redirect. Hệ quả: apex và `www` cùng phục vụ một nội dung ở hai URL,
đúng thứ tài liệu nói đã xử lý xong để tránh trùng nội dung/SEO.

**Nguyên nhân xác định qua `nginx -T` + đối chiếu `sites-enabled/`:** file đang chạy thật là
`/etc/nginx/sites-available/dhcb` (symlink duy nhất trong `sites-enabled/`) — chỉ có **MỘT**
block `listen 443` nhận cả 6 `server_name`, không có redirect nào. Ba file khác trong
`sites-available/` (`donghanhcungban`, `en-vi`, `default`) **không được bật** — suýt sửa nhầm
vào đó ở vòng chẩn đoán đầu (lệnh `grep -rl ... | head -1` chỉ lấy file khớp đầu tiên, không
phải file đang chạy).

**Trước khi sửa, xác nhận an toàn:** server KHÔNG chọn app theo Host header —
`express.static` + `app.get('*')` trong `apps/server/src/server.ts` phục vụ cùng một `dist/`
cho mọi domain; `EN_VI_HOSTNAME` chỉ còn trong comment, không code nào đọc. Nên redirect domain
là thuần gom URL, không đổi định tuyến app.

**Đã sửa trên VPS** (người dùng thao tác tay theo hướng dẫn, xác nhận `nginx -t` OK trước khi
reload): tách `dhcb` config thành 1 block phục vụ (`www.org` + `en-vi.org`) + 2 block redirect
(apex/`.com` → `www.org`; `en-vi.com` → `en-vi.org`, KHÔNG gộp về hub vì người học giữa chừng
sẽ mất route). Dùng chung cert `.org` — xác nhận phủ đủ 6 SAN qua đo thật (không domain nào
lỗi TLS). Bằng chứng sau reload:

```
donghanhcungban.org         301 → https://www.donghanhcungban.org/
donghanhcungban.com         301 → https://www.donghanhcungban.org/
www.donghanhcungban.com     301 → https://www.donghanhcungban.org/
en-vi.donghanhcungban.com   301 → https://en-vi.donghanhcungban.org/
www.donghanhcungban.org     200
en-vi.donghanhcungban.org   200
```

**Đã làm trong repo:**

- `nginx/dhcb.conf` (mới) — bản đầy đủ cấu hình production thật, lần đầu được lưu vào repo
  (trước nay chỉ tồn tại trên VPS, không có nguồn đối chiếu).
- `nginx/en-vi.conf` (file mẫu cũ) — sửa lỗi nguy hiểm riêng: nó xếp
  `en-vi.donghanhcungban.org` vào nhóm bị redirect đi (commit `7bbb1a7`), tức là copy đúng
  hướng dẫn ở đầu file lên VPS sẽ làm app tiếng Anh chết. Đã tách bạch lại 2 nhóm domain +
  bỏ giả định sai về cert `.com` riêng (chỉ cần 1 cert `.org` phủ đủ SAN).
- `docs/doi-ten-mien-chinh-org.md` — thay khẳng định sai bằng ghi chép có lệnh đo + kết quả
  đo thật, giữ bản gốc 2026-07-31 làm lịch sử (đánh dấu rõ phần redirect trong đó KHÔNG đúng
  thực tế).

**Bài học ghi vào Tầng 6b (`docs/framework/QUY-TRINH-AUDIT.md`):** một khẳng định hạ tầng
trong tài liệu điều hành sống gần một tháng mà không ai đo lại. Trạng thái hạ tầng phải kèm
lệnh đo được và kết quả đo, không chỉ một câu "đã xong".
