# Hướng dẫn cấu hình Email

> Dành cho `en-vi.donghanhcungban.com`. Có 2 việc **hoàn toàn tách biệt**, đừng nhầm:
>
> | Việc                 | Là gì                               | Dịch vụ                    |
> | -------------------- | ----------------------------------- | -------------------------- |
> | **GỬI** mail tự động | App gửi mã xác thực cho người dùng  | Brevo / Gmail / Amazon SES |
> | **NHẬN** mail        | Người dùng, đối tác gửi thư cho bạn | Cloudflare Email Routing   |
>
> Hai việc này dùng **hai dịch vụ khác nhau** và không liên quan gì nhau. Rất nhiều người tưởng
> phải tự dựng "mail server" để làm cả hai — không cần, và không nên (xem mục 4).

---

## 1. GỬI mail tự động (bắt buộc — không làm thì mã xác thực không gửi được)

App gửi mã xác thực email qua **SMTP chuẩn** (xem `api/_lib/mailer.ts`). Chuẩn SMTP nên đổi nhà
cung cấp chỉ cần đổi biến môi trường, **không sửa một dòng code nào**.

### Chọn nhà cung cấp

| Dịch vụ      | Miễn phí          | Gửi từ tên miền riêng?            | Khi nào dùng                   |
| ------------ | ----------------- | --------------------------------- | ------------------------------ |
| **Brevo** ⭐ | **300 thư/ngày**  | ✅ Có                             | **Khuyến nghị bắt đầu từ đây** |
| Gmail        | 500 thư/ngày      | ❌ Không (luôn hiện `@gmail.com`) | Chỉ để thử nhanh               |
| Amazon SES   | ~$0,10/1.000 thư  | ✅ Có                             | Khi > 300 thư/ngày             |
| ~~SendGrid~~ | ❌ Đã bỏ gói free | —                                 | Không dùng nữa                 |

**Vì sao khuyên Brevo thay vì Gmail** dù Gmail nhiều thư hơn: Brevo cho gửi từ
`noreply@donghanhcungban.com`. Mail xác thực gửi từ địa chỉ `@gmail.com` lạ hoắc trông giống lừa
đảo — với đối tượng học sinh/phụ huynh thì đây là vấn đề thật, không phải chuyện thẩm mỹ. Ngoài ra
Gmail cá nhân bắn mail tự động hàng loạt có nguy cơ bị Google khoá luôn hòm thư riêng của bạn.

### Các bước với Brevo

1. Đăng ký tài khoản tại [brevo.com](https://www.brevo.com) (miễn phí, không cần thẻ).
2. Vào **Senders, Domains & Dedicated IPs → Domains → Add a domain**, nhập `donghanhcungban.com`.
3. Brevo đưa ra vài bản ghi DNS (thường là `TXT` để xác minh + `DKIM`). Thêm chúng vào
   **Cloudflare → DNS** (bạn đã dùng Cloudflare rồi, xem `docs/cloudflare-setup.md`).
   > ⚠️ Bản ghi DKIM/xác minh phải để **DNS only** (mây xám), KHÔNG bật proxy (mây cam).
4. Đợi Brevo báo verified (thường vài phút).
5. Vào **SMTP & API → SMTP** lấy thông tin đăng nhập.
6. Điền vào `.env` **trên VPS**:

```bash
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=<Brevo cấp — dạng xxxxx@smtp-brevo.com>
SMTP_PASS=<Brevo cấp — SMTP key, KHÔNG phải mật khẩu đăng nhập>
SMTP_FROM=noreply@donghanhcungban.com
```

7. Khởi động lại app: `pm2 restart dhcb`

### Kiểm tra đã chạy chưa

Đăng ký một tài khoản mới bằng email thật của bạn → phải nhận được mã 6 chữ số trong ~1 phút.

Nếu không nhận được, xem log: `pm2 logs dhcb | grep mailer`

| Log                                    | Nghĩa là                    | Sửa thế nào                                      |
| -------------------------------------- | --------------------------- | ------------------------------------------------ |
| `Chưa cấu hình SMTP_HOST/...`          | Thiếu biến môi trường       | Kiểm tra `.env` và đã restart chưa               |
| `Gửi mail thất bại: Invalid login`     | Sai `SMTP_USER`/`SMTP_PASS` | Lấy lại SMTP key ở Brevo                         |
| Không có log lỗi nhưng không nhận được | Thư vào mục **spam**        | Kiểm tra thư rác; xác minh tên miền đã xong chưa |

App **không sập** khi thiếu cấu hình SMTP — chỉ là không gửi được mã (thiết kế no-op có chủ ý,
giống Sentry). Người dùng vẫn học bình thường, chỉ chưa mở khoá thưởng mời bạn.

---

## 2. NHẬN mail gửi tới `@donghanhcungban.com`

Để người dùng/đối tác gửi thư tới `lienhe@donghanhcungban.com` và bạn đọc được.

**Dùng Cloudflare Email Routing — miễn phí.** Nó **chuyển tiếp** thư tới hòm thư Gmail sẵn có của
bạn, không cần hòm thư riêng, không cần trả tiền.

### Các bước

1. Cloudflare → chọn tên miền `donghanhcungban.com` → tab **Email** → **Email Routing** →
   **Get started**.
2. Cloudflare tự thêm bản ghi **MX** và **SPF** cần thiết (bấm đồng ý).
3. **Destination addresses**: thêm Gmail cá nhân của bạn, rồi mở mail xác nhận Cloudflare gửi tới.
4. **Routing rules**: tạo các địa chỉ muốn dùng, ví dụ:
   - `lienhe@donghanhcungban.com` → Gmail của bạn
   - `hotro@donghanhcungban.com` → Gmail của bạn
   - Hoặc bật **catch-all** để nhận mọi địa chỉ `@donghanhcungban.com`.

Giới hạn gói free: tối đa **200 địa chỉ** và **200 hòm thư đích**, **không giới hạn số thư**
chuyển tiếp.

### Hạn chế cần biết

Cloudflare Email Routing **chỉ nhận và chuyển tiếp, không gửi đi được**. Nghĩa là bạn nhận thư ở
Gmail nhưng khi bấm "Trả lời", thư sẽ đi từ địa chỉ `@gmail.com` của bạn, không phải
`@donghanhcungban.com`.

**Cách khắc phục** (nếu cần trả lời đúng tên miền): trong Gmail vào
**Cài đặt → Tài khoản → Gửi thư bằng địa chỉ khác → Thêm địa chỉ khác**, nhập
`lienhe@donghanhcungban.com` và điền **chính thông tin SMTP của Brevo ở mục 1**. Từ đó Gmail cho
chọn địa chỉ người gửi khi soạn/trả lời thư.

> Lưu ý: thư trả lời tay này cũng tính vào hạn mức 300 thư/ngày của Brevo. Với thư trao đổi thông
> thường thì không đáng kể.

---

## 3. Khi nào cần nâng cấp

Ước tính nhu cầu gửi: `số người đăng ký mới mỗi ngày × 1,3` (cộng thêm cho lượt "gửi lại mã").
Người đăng nhập bằng Google **không tốn thư nào** (Google đã xác thực email sẵn).

| Đăng ký mới/ngày | Thư/ngày  | Dùng gì                          |
| ---------------- | --------- | -------------------------------- |
| < 200            | < 260     | Brevo free — đủ                  |
| 200–1.000        | 260–1.300 | Amazon SES (~$0,15/ngày)         |
| > 1.000          | > 1.300   | Amazon SES, vẫn chỉ vài đô/tháng |

Chuyển sang SES chỉ là đổi `SMTP_HOST/USER/PASS` trong `.env`, không sửa code.

> ⚠️ **Rủi ro cần biết trước khi chạy chiến dịch marketing:** hiện **chưa có trần tổng số
> mail/ngày** trong code. Có chặn 60s mỗi người dùng và rate limit theo IP, nhưng nhiều IP cùng
> đăng ký hàng loạt vẫn đốt sạch hạn mức trong vài phút — và nhà cung cấp thấy lưu lượng bất
> thường có thể **khoá tài khoản gửi**, khiến người dùng thật cũng không nhận được mã. Nên bổ
> sung trần này trước khi đẩy mạnh quảng bá.

---

## 4. Vì sao KHÔNG tự dựng mail server riêng

Câu hỏi hay gặp: "tự cài mail server trên VPS để gửi không giới hạn?"

**Tự dựng không cho bạn "không giới hạn" — nó cho giới hạn tệ hơn.** Nút thắt không nằm ở server
của bạn gửi được bao nhiêu, mà ở chỗ **Gmail/Outlook chịu nhận bao nhiêu từ bạn**.

Bốn rào cản thực tế:

1. **IP mới không có uy tín** — VPS chưa từng gửi mail, Gmail coi đó là dấu hiệu spam kinh điển,
   thư vào thư rác hoặc bị từ chối thẳng. Xây uy tín mất hàng tuần đến hàng tháng.
2. **Cổng 25 thường bị chặn sẵn** — đa số nhà cung cấp VPS chặn để chống spam, phải xin mở, nhiều
   nơi từ chối.
3. **Dải IP VPS giá rẻ thường đã nằm trong blacklist** (Spamhaus…) — bạn kế thừa tiếng xấu của
   hàng xóm cùng dải dù không làm gì sai.
4. **Phải tự lo SPF + DKIM + DMARC + PTR** — riêng PTR (reverse DNS) phải do nhà cung cấp VPS đặt
   hộ, không phải nơi nào cũng cho. Từ 2024 Gmail/Yahoo còn siết thêm với người gửi số lượng lớn.

Thêm rủi ro riêng: VPS này **chạy chung với app "xboss"**. IP dính blacklist vì mail sẽ ảnh hưởng
lây tới uy tín tên miền.

**So sánh chi phí:** Amazon SES tính $0,10 cho 1.000 thư — tức 100.000 thư/tháng chỉ khoảng
**260.000đ**, tương đương ~2.500 người đăng ký mới mỗi ngày. Rẻ hơn nhiều so với công sức dựng và
trông mail server, chưa kể rủi ro thư không tới mà không biết vì sao.

Chỉ nên cân nhắc tự dựng khi đã có doanh thu ổn định **và có người chuyên trách hạ tầng**.

---

## Tham khảo

- [Cloudflare Email Routing](https://www.cloudflare.com/developer-platform/products/email-routing/)
  · [giới hạn](https://developers.cloudflare.com/email-service/platform/limits/)
- [Amazon SES pricing](https://smtpedia.com/amazon-aws-ses-pricing/)
- Code liên quan: `api/_lib/mailer.ts` · `api/_lib/emailVerification.ts` · `.env.example`
