# fix(security): BỊT TRỌN lỗ hổng rate limit — kiểm chứng bằng bài thử A/B (2026-08-26)

Nối tiếp PR #701 (vá tầng app). Người dùng đã áp nốt tầng nginx trên VPS, và bài thử xác nhận
lỗ hổng đã đóng hoàn toàn.

## Trước và sau, bằng số

|           | Bài A — IP giả **ngẫu nhiên** mỗi lần | Bài B — IP giả **cố định** |
| --------- | ------------------------------------- | -------------------------- |
| **Trước** | 40 × `200`, không một `429`           | (chưa chạy)                |
| **Sau**   | **30 × `200`, rồi 10 × `429`**        | **40 × `429`** ngay từ đầu |

Route thử: `/api/app-settings`, giới hạn `checkRateLimit(clientIp, 30, 'app-settings')`.

## Đọc kết quả

**Bài A khớp chính xác con số 30** — nghĩa là rate limit nay đếm theo **IP thật**, header giả
không còn tác dụng gì.

**Bài B trả `429` ngay từ request đầu**, thoạt nhìn có vẻ lạ nhưng đó mới là bằng chứng mạnh
nhất: B chạy từ cùng một máy với A nên mang cùng IP thật, và quota 30/phút đã bị A dùng hết.
Nếu rate limit còn tin header giả thì B đã có bộ đếm riêng và trả `200`.

Hai bài ghép lại chứng minh trọn vẹn: giới hạn áp theo nguồn thật, không theo thứ client tự khai.

## Hai tầng đã áp

1. **Tầng app** (PR #701): `getClientIp()` đọc `CF-Connecting-IP` → `X-Real-IP` → `X-Forwarded-For`
   phần tử **CUỐI**. Cloudflare ghi đè `CF-Connecting-IP` ở biên nên client không tự khai được.
   7 test chặn hồi quy trong `packages/core-http/http.test.ts`.
2. **Tầng nginx** (việc tay trên VPS): `cloudflare-realip.conf` chỉ nhận header đó từ đúng dải IP
   Cloudflare — bịt đường gọi thẳng vào IP VPS để giả `CF-Connecting-IP`.

Thiếu một trong hai thì vẫn thủng: tầng app một mình không chặn được người bỏ qua Cloudflare;
tầng nginx một mình không sửa được việc app đọc nhầm phần tử của XFF.

## Gỡ kèm nợ #6

`nginx/en-vi.conf` vốn đã sửa trong repo từ 2026-08-25 mà chưa áp lên VPS — nay áp cùng lúc.

## Bài học

Lỗ hổng này sống sót qua nhiều lần rà soát vì cách kiểm chứng cũ hỏi **sai câu**:
_"IP hiển thị có đúng không?"_ — nhìn `pm2 logs` là trả lời được. Câu đúng là _"IP có **ghi đè**
được không?"_, và nó chỉ trả lời được bằng cách **tự tấn công mình**. `docs/cloudflare-setup.md`
đã đổi sang câu thứ hai, kèm đúng hai bài thử ở trên và cách đọc kết quả.
