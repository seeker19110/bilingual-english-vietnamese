# fix(security): rate limit bị né hoàn toàn bằng header X-Forwarded-For giả (2026-08-26)

**Lỗ hổng thật, đã xác minh trên production bằng bài thử, không phải suy đoán.** 40 request
liên tiếp vào `/api/app-settings` — route giới hạn **30 req/phút** — với `X-Forwarded-For` ngẫu
nhiên mỗi lần: **40 lần `200`, không một `429` nào**.

## Cơ chế

Nginx dùng `$proxy_add_x_forwarded_for`, tức **nối** ip thật vào CUỐI chuỗi client gửi lên:

```
Client gửi:  X-Forwarded-For: 1.2.3.4
Nginx thành: X-Forwarded-For: 1.2.3.4, <ip thật>
Bản cũ đọc:  1.2.3.4          ← giá trị CLIENT TỰ KHAI
```

Mỗi request đổi header là mỗi request một khoá rate limit khác nhau.

**Vì sao nghiêm trọng hơn mọi nợ khác đang mở:** rate limit là tuyến phòng thủ duy nhất cho hạn
mức gọi AI **trả phí**. Đây cũng là lý do dừng việc test tải 5.000 DAU lại — ở quy mô đó, thứ
làm mất tiền không phải CPU hay RAM mà là chỗ này.

## Đã vá — tầng app

`getClientIp()` (`packages/core-http/http.ts`) đọc theo thứ tự, từ đáng tin nhất xuống:

1. `CF-Connecting-IP` — Cloudflare **ghi đè** header này ở biên (khác nginx là nối), nên client
   không tự khai được khi đi qua CF. Xác nhận cùng ngày: site chạy sau Cloudflare
   (`server: cloudflare` + `cf-ray`).
2. `X-Real-IP` — nginx đặt `= $remote_addr`, cũng là ghi đè.
3. `X-Forwarded-For` phần tử **cuối** — phần do proxy gần nhất nối vào.

7 test chặn hồi quy trong `packages/core-http/http.test.ts`, gồm ca cốt lõi: hai request khai
hai IP giả khác nhau nhưng cùng đi qua một proxy phải cho **cùng một** khoá rate limit.

## Chưa xong — cần lớp thứ hai ở nginx

Ai gọi **thẳng** vào IP VPS (bỏ qua Cloudflare) vẫn tự đặt được `CF-Connecting-IP`. Bịt bằng
`nginx/cloudflare-realip.conf` + `scripts/update-cloudflare-ips.sh` (repo đã có sẵn cả hai, chỉ
chưa áp lên VPS — trùng luôn với nợ #6). Chi tiết và bài thử kiểm chứng: mục "Nợ kỹ thuật còn
mở" trong `PROGRESS.md`.

## Sửa kèm: cách kiểm chứng trong tài liệu vốn không đủ mạnh

`docs/cloudflare-setup.md` trước đây hướng dẫn kiểm bằng cách đọc `pm2 logs` xem IP có đúng
không. Cách đó chỉ cho biết IP **hiển thị** đẹp, không cho biết kẻ tấn công có **ghi đè** được
nó không — và đó chính là lý do lỗ hổng sống sót. Thay bằng bài thử hai ca (IP giả ngẫu nhiên
vs IP giả cố định) kèm cách đọc kết quả.

**Kiểm chứng:** 465 file / 6083 test xanh · typecheck · lint · format sạch.
