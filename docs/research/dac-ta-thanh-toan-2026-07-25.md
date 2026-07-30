# Đặc tả triển khai — Thanh toán Pro/VIP (M2)

> **Cập nhật 2026-07-27 (lần 2 — CHỐT CUỐI, đã code xong):** đổi cấu trúc giá sang 3 chu kỳ
> (10 ngày / tháng / năm), số tiền khác hẳn bản nháp lần 1 cùng ngày. **Code M2 đã hoàn tất** —
> xem `PROGRESS.md` mục "M2 Thanh toán Pro/VIP qua SePay: CODE ĐÃ XONG" để biết chi tiết file/
> API/test. Mục này giữ nguyên làm tài liệu tham chiếu kiến trúc, phần "Bảng giá" bên dưới đã
> cập nhật theo số cuối cùng.
>
> Cập nhật 2026-07-27 (lần 1): chốt giá gói năm (Pro 500k / VIP 750k) và **đổi cổng thanh toán
> từ PayOS sang SePay** — PayOS đòi tư cách hộ kinh doanh, SePay chỉ cần tài khoản ngân hàng cá
> nhân. Mô hình SePay khác PayOS về bản chất (theo dõi sao kê thay vì cổng trung gian) nên các
> mục Kiến trúc / Schema / API / Bảo mật đã được viết lại theo tài liệu thật.
>
> Ngày soạn: 2026-07-25 · **Đảo ngược quyết định 2026-07-11** trong `CLAUDE.md` mục 13.3
> ("miễn phí, không làm thanh toán cho tới khi người dùng chủ động yêu cầu lại") — bạn đã chủ
> động yêu cầu hôm nay, quyết định mới **thay thế** quyết định cũ.

## Bảng giá đã chốt (CUỐI CÙNG, 2026-07-27)

> Thay bảng giá "Tháng/Năm" nháp trước đó cùng ngày — cấu trúc đổi sang **3 chu kỳ**, thêm gói
> 10 ngày (giá vào rẻ, dễ dùng thử thật thay vì chỉ dùng thử miễn phí 5 ngày).

| Gói  | 10 ngày | Tháng   | Năm                          |
| ---- | ------- | ------- | ---------------------------- |
| Free | —       | —       | 0đ (10 lượt/ngày mỗi chế độ) |
| Pro  | 20.000đ | 40.000đ | 360.000đ                     |
| VIP  | 30.000đ | 75.000đ | 500.000đ                     |

Lưu ở bảng `public.plan_prices` (migration `0014`) — đổi giá qua UPDATE trực tiếp hoặc endpoint
admin sau này, KHÔNG cần deploy. `CYCLE_DAYS` (`api/_lib/prices.ts`): `10day`=10,
`month`=30, `year`=365.

Bảng giá này là giá NIÊM YẾT. Dịp lễ/Tết sẽ giảm thêm — xem mục "Khuyến mãi dịp lễ" bên dưới.

**Dùng thử Pro 5 ngày (đã làm xong, PR #347):** xác thực email → tặng 5 ngày Pro, mỗi tài khoản
đúng 1 lần vĩnh viễn (`api/_lib/trial.ts`, cột `profiles.trial_granted_at`). Đây là bậc thang
trước khi mua — khi làm UI giá nhớ nối tiếp: người vừa hết hạn dùng thử là nhóm dễ chuyển đổi
nhất, nên chào giá đúng lúc đó.

## Khuyến mãi dịp lễ (quyết định 2026-07-27)

Giá lễ/Tết sẽ giảm sâu hơn giá niêm yết, thời điểm và mức giảm quyết định sau từng đợt. Yêu cầu
kỹ thuật rút ra từ đó — phải tính TRƯỚC khi code, không chắp vá sau:

1. **Giá nằm trong `app_settings`, KHÔNG hard-code** (đã ghi ở mục Schema) — đổi giá dịp lễ chỉ
   là gọi `/api/admin-settings`, **không cần deploy**. Đây là lý do chính không được nhét bảng
   giá vào code.
2. **Cần cả giá niêm yết lẫn giá khuyến mãi**, không chỉ một con số: UI muốn hiện "gạch giá cũ →
   giá mới" thì phải biết cả hai. Đề xuất mỗi gói/chu kỳ lưu `price_vnd` (niêm yết) +
   `sale_price_vnd` (nullable = không giảm) + `sale_until` (nullable).
3. **Đơn đã tạo giữ nguyên giá lúc tạo** — `payments.amount_vnd` đã chốt điều này (đọc lại bảng
   giá sau khi hết khuyến mãi sẽ ra số khác, tuyệt đối không làm vậy).
4. **Server tự đọc giá, không nhận giá từ client** — kể cả trong lúc khuyến mãi. Client gửi
   `plan` + `cycle`, server tự quyết trả bao nhiêu tiền (nguyên tắc bảo mật #2 bên dưới).
5. `app_settings` đã có sẵn `promoUntil` nhưng đó là **khuyến mãi HẠN MỨC LƯỢT DÙNG** (nới lượt
   miễn phí), khác hoàn toàn với giảm GIÁ BÁN. Đừng dùng lại cùng một trường cho hai việc — đặt
   trường riêng, nếu không sẽ có ngày nới lượt mà vô tình giảm giá theo (hoặc ngược lại).

Hạn mức Pro/VIP: giữ cấu hình hiện có trong `app_settings` (Pro 100 lượt/ngày/chế độ, VIP gần
không giới hạn) — chỉnh qua `/api/admin-settings`, không phải việc của đợt này.

**Free 5→10 lượt/ngày:** đổi qua `/api/admin-settings` (field `free_*_limit` trong bảng
`app_settings`) — **không cần deploy, làm được ngay**, độc lập với toàn bộ việc code thanh toán
bên dưới. Đề xuất làm việc này trước tiên, hôm nay.

## Cổng thanh toán: SePay (chốt 2026-07-27 — THAY PayOS)

> Mục này viết lại sau khi ĐỌC TÀI LIỆU THẬT của SePay (không suy đoán): `docs.sepay.vn`
> — [tích hợp webhook](https://docs.sepay.vn/tich-hop-webhooks.html) ·
> [lập trình webhook](https://docs.sepay.vn/lap-trinh-webhooks.html) ·
> [lập trình cổng thanh toán](https://sepay.vn/lap-trinh-cong-thanh-toan.html).

**Vì sao đổi:** PayOS yêu cầu tư cách hộ kinh doanh/doanh nghiệp (giấy tờ, MST) — điểm chặn thật
với dự án cá nhân. SePay chỉ cần **tài khoản ngân hàng cá nhân**.

**SePay hoạt động KHÁC HẲN PayOS — đây là chỗ dễ hiểu nhầm nhất, đọc kỹ:**

SePay **không phải cổng thanh toán trung gian**. Nó không giữ tiền, không có trang thanh toán,
**không có `checkoutUrl`, không có redirect trở về**. Nó chỉ **theo dõi tài khoản ngân hàng của
bạn** và bắn webhook mỗi khi có tiền vào. Tiền chảy thẳng từ người mua vào tài khoản của bạn.

Hệ quả kéo theo, phải thiết kế đúng ngay từ đầu:

1. **Khớp đơn bằng NỘI DUNG CHUYỂN KHOẢN**, không có mã đơn do cổng cấp. Ta tự sinh một mã
   thanh toán duy nhất (vd `ENVI7K2M9Q`), in vào nội dung chuyển khoản, rồi dò lại mã đó trong
   trường `content`/`code` của webhook.
2. **Không có redirect** → giao diện phải **tự hỏi lại server** (poll) xem đơn đã trả tiền chưa,
   thay vì chờ người dùng quay về từ trang cổng.
3. **Không cần gọi API tạo đơn phía SePay.** Mã QR chỉ là một URL ảnh dựng sẵn
   (`https://qr.sepay.vn/img?acc=...&bank=...&amount=...&des=...`) — server ta tự dựng, không
   phụ thuộc API ngoài lúc tạo đơn. Ít điểm hỏng hơn PayOS đáng kể.
4. **Người dùng có thể gõ sai/thiếu nội dung chuyển khoản.** Tiền vẫn về tài khoản nhưng webhook
   không khớp được đơn nào → phải có đường xử lý tay (xem "Ca lệch" bên dưới). Đây là nhược điểm
   thật của mô hình này, KHÔNG được lờ đi.

**Casso** cùng mô hình (theo dõi sao kê + webhook). Chọn **SePay** vì tài liệu lập trình rõ hơn,
có sẵn dịch vụ ảnh VietQR, và nêu rõ cơ chế retry/chống trùng. Nếu sau này SePay có vấn đề, đổi
sang Casso chỉ phải sửa lớp `api/_lib/sepay.ts` — phần còn lại (bảng `payments`, `planGrant`)
dùng chung.

## Kiến trúc tổng quan

```
User bấm "Nâng cấp Pro/VIP" (Profile.tsx)
  → POST /api/checkout { plan: 'pro'|'vip', cycle: 'month'|'year' }
  → server đọc giá từ app_settings, sinh payment_code duy nhất,
    tạo bản ghi `payments` (status='pending')
  → trả về { paymentCode, amountVnd, qrUrl, bankAccount, bankName, expiresAt }
  → UI hiện mã QR + hướng dẫn chuyển khoản (KHÔNG rời khỏi app, không redirect)
  → người dùng quét QR, chuyển khoản
  → tiền về tài khoản ngân hàng → SePay bắn POST /api/payment-webhook
  → server xác thực header `Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>`
  → lọc transferType === 'in', dò payment_code trong content/code
  → chống trùng theo SePay `id` (cột provider_txn_id, UNIQUE)
  → kiểm tra số tiền ĐỦ, cập nhật status='paid' + cấp gói qua grantPlanDays()
    (api/_lib/planGrant.ts — TÁI DÙNG, đã dùng cho referral + trial + admin cấp tay)
  → trả về {"success":true} (đúng dạng SePay chờ đợi)
  → UI đang poll GET /api/payment-status?code=... thấy 'paid' → báo thành công,
    fetch lại hồ sơ để hiện gói mới
```

## Schema

`postgres/migrations/00XX_payments.sql`:

```sql
create table if not exists public.payments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  plan          text not null check (plan in ('pro', 'vip')),
  cycle         text not null check (cycle in ('month', 'year')),
  amount_vnd    integer not null,          -- số tiền THẬT tại thời điểm tạo đơn (không đọc lại
                                            -- bảng giá sau này — giá có thể đổi, đơn cũ giữ giá cũ)
  provider      text not null default 'sepay',
  payment_code  text not null,             -- mã TA tự sinh, in vào nội dung chuyển khoản để
                                            -- webhook dò lại. Đây là khoá khớp đơn duy nhất.
  provider_txn_id text,                    -- trường `id` của SePay — khoá CHỐNG TRÙNG webhook
  status        text not null default 'pending' check (status in ('pending','paid','failed','expired')),
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null,      -- đơn quá hạn coi như bỏ (mã QR không dùng nữa)
  paid_at       timestamptz
);
create index if not exists payments_user_idx on public.payments(user_id, created_at desc);
-- Mã thanh toán PHẢI duy nhất tuyệt đối: hai đơn trùng mã = không biết tiền trả cho đơn nào.
create unique index if not exists payments_code_idx on public.payments(payment_code);
-- Chống trùng webhook ở TẦNG DB, không chỉ tầng code: SePay retry tới 7 lần trong 5 giờ.
create unique index if not exists payments_provider_txn_idx on public.payments(provider_txn_id)
  where provider_txn_id is not null;
```

**Sinh `payment_code`:** tiền tố cố định + phần ngẫu nhiên an toàn (`randomInt`/`randomBytes` của
`node:crypto`, KHÔNG `Math.random` — cùng nguyên tắc đã áp ở `emailVerification.ts`). Tiền tố cố
định để cấu hình lọc "tiền tố mã thanh toán" trên dashboard SePay, tránh webhook bắn cho mọi
giao dịch không liên quan trong tài khoản cá nhân. Tránh ký tự dễ đọc nhầm (0/O, 1/I/L) vì có
người sẽ **gõ tay** nội dung chuyển khoản thay vì quét QR.

Giá bán KHÔNG hard-code trong code — thêm vào `app_settings` (giống `limits`) để đổi giá không
cần deploy, đúng khuôn mẫu hiện có (`api/_lib/settings.ts`). Mỗi gói/chu kỳ cần 3 trường: giá
niêm yết, giá khuyến mãi (nullable), hạn khuyến mãi (nullable) — xem mục "Khuyến mãi dịp lễ".

## API cần thêm

1. `POST /api/checkout` (cần đăng nhập): validate `plan`∈{pro,vip}, `cycle`∈{month,year} bằng
   Zod; đọc giá từ `app_settings`; sinh `payment_code`; tạo `payments` row `pending` kèm
   `expires_at`; trả `{ paymentCode, amountVnd, qrUrl, bankAccount, bankName, expiresAt }`.
   **Không gọi API ngoài** — `qrUrl` chỉ là URL ảnh dựng chuỗi. Rate limit theo user (không phải
   chỉ IP — 1 user không cần bấm nâng cấp liên tục, và mỗi lần bấm là 1 dòng `payments` rác).
2. `POST /api/payment-webhook` (SePay gọi, KHÔNG có Bearer token của app):
   - Xác thực header `Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>`, so sánh bằng
     **`timingSafeEqual`** (`node:crypto`), không phải `===`.
   - Bỏ qua `transferType !== 'in'` (tiền ra khỏi tài khoản không liên quan).
   - Dò `payment_code` trong `code` rồi tới `content` (regex theo tiền tố cố định, không phân
     biệt hoa thường — ngân hàng có thể viết hoa toàn bộ nội dung chuyển khoản).
   - **Chống trùng bằng DB**: ghi `provider_txn_id` = `id` của SePay với ràng buộc UNIQUE; lỗi
     `23505` (unique_violation) = webhook lặp → trả `{"success":true}` và DỪNG, không cấp lại.
     SePay retry tới **7 lần trong 5 giờ**, đây là ca chắc chắn xảy ra chứ không phải hiếm.
   - **Kiểm tra số tiền**: `transferAmount >= payments.amount_vnd`. Trả thiếu → **không cấp gói**,
     giữ `pending` + ghi log để xử lý tay (đừng tự cấp gói khi chưa đủ tiền, cũng đừng nuốt tiền
     im lặng).
   - Đủ điều kiện → `status='paid'`, `paid_at=now()`, gọi `grantPlanDays()` đúng số ngày theo
     `cycle` (30 hoặc 365), ghi `logSecurityEvent`.
   - **Luôn trả `{"success":true}`** khi đã xử lý xong (kể cả ca lặp) — đúng dạng SePay chờ đợi;
     trả khác sẽ khiến SePay retry vô ích.
3. `GET /api/payment-status?code=...` (cần đăng nhập): UI poll endpoint này vì **SePay không
   redirect người dùng về**. Chỉ trả đơn THUỘC VỀ user đang đăng nhập (kiểm `user_id` khớp token
   — nếu không, ai cũng dò được trạng thái đơn người khác). Poll thưa (vd 3–5 giây/lần) và tự
   dừng khi hết `expires_at`.
4. `GET /api/payment-history` (cần đăng nhập): trả lịch sử đơn của chính user đó (Profile hiển
   thị) — tự kiểm `user_id` khớp token, đúng nguyên tắc kỹ thuật #2.

## UI

- `Profile.tsx`: khối "Nâng cấp" hiển thị 2 gói × 2 chu kỳ + giá (gạch giá niêm yết nếu đang
  khuyến mãi) → gọi `/api/checkout`.
- **Màn hình chuyển khoản** (thay cho việc redirect sang cổng): ảnh QR + số tài khoản + số tiền +
  **nội dung chuyển khoản có nút sao chép** (bắt buộc — gõ tay là nguồn lỗi khớp đơn lớn nhất),
  đếm ngược tới `expires_at`, và trạng thái đang chờ. Poll `/api/payment-status` cho tới khi
  `paid` → báo thành công + fetch lại hồ sơ để hiện gói mới.
- Nhắc rõ ràng: "chuyển khoản đúng nội dung, nếu sai hãy liên hệ" — vì ca gõ sai nội dung là có
  thật và người dùng cần biết đường xử lý.
- Hiển thị lịch sử thanh toán + gói/hạn hiện tại (đã có sẵn phần hiển thị plan).

## Ca lệch (BẮT BUỘC có đường xử lý — mô hình sao kê không hoàn hảo)

1. **Chuyển đúng tiền, sai/thiếu nội dung** → webhook không khớp đơn nào. Tiền ĐÃ vào tài khoản.
   Xử lý: ghi log giao dịch không khớp, admin đối chiếu tay rồi cấp gói bằng
   `/api/admin-grant-plan` (đã có sẵn). Không tự đoán "chắc là của user này".
2. **Chuyển thiếu tiền** → giữ `pending`, admin xử lý tay (hoàn hoặc yêu cầu chuyển bù).
3. **Chuyển thừa tiền** → vẫn cấp gói (đủ điều kiện `>=`), phần thừa xử lý tay.
4. **Đơn quá hạn rồi tiền mới về** → vẫn nên cấp gói nếu khớp mã (người dùng đã trả tiền thật);
   `expires_at` chỉ để dọn UI, KHÔNG phải lý do từ chối tiền đã nhận.

## Bảo mật (mục bắt buộc đọc kỹ trước khi code — CLAUDE.md mục 12: đụng thanh toán phải cẩn trọng)

1. **Webhook phải xác thực** — không tin bất kỳ request nào tự xưng "SePay gọi tới". Bắt buộc:
   API Key đúng (so sánh `timingSafeEqual`). Nên thêm: whitelist IP SePay ở tầng Nginx. Ghi chú:
   danh sách IP do SePay công bố có thể đổi — whitelist là lớp bổ sung, **không thay thế** API
   Key, để tránh ngày SePay đổi IP thì mất sạch webhook.
2. **Không tin số tiền/plan từ client** — số tiền lấy từ `payments.amount_vnd` đã lưu lúc tạo đơn
   (server tự đọc giá từ `app_settings`). Webhook chỉ dùng để KIỂM TRA số tiền đủ hay không, không
   phải để quyết định giá.
3. **Idempotency ở tầng DB** (unique `provider_txn_id`), không chỉ kiểm `status` ở tầng code —
   hai webhook retry song song có thể cùng đọc thấy `status='pending'`.
4. **Log đầy đủ** mọi giao dịch — chỉ log mã đơn/trạng thái/số tiền, KHÔNG log
   `description`/`content` thô (chứa tên người chuyển = dữ liệu cá nhân).
5. **Số tài khoản ngân hàng đặt trong biến môi trường**, không hard-code — đổi tài khoản không
   phải sửa code, và tránh lộ trong repo công khai.
6. **Không có cổng thanh toán nào chạy trong CI/test thật** — viết test bằng cách giả lập webhook
   payload nội bộ (mock), không gọi PayOS thật trong `npm test`.
7. **Biến môi trường**: `SEPAY_WEBHOOK_API_KEY` (khoá tự đặt, khai trên dashboard SePay),
   `SEPAY_BANK_ACCOUNT` (số tài khoản nhận tiền), `SEPAY_BANK_CODE` (mã ngân hàng dùng cho URL
   ảnh QR) — thêm vào `.env.example` với giá trị GIẢ, KHÔNG commit giá trị thật (nguyên tắc #6).

## Việc CẦN BẠN LÀM TAY (ngoài khả năng AI, giống Sentry/branch protection đã ghi trong CLAUDE.md)

- Đăng ký tài khoản SePay + liên kết tài khoản ngân hàng nhận tiền (**chỉ cần tài khoản cá
  nhân**, không cần hộ kinh doanh/MST như PayOS).
- Trên dashboard SePay: tạo webhook trỏ về `https://en-vi.donghanhcungban.com/api/payment-webhook`,
  chọn chứng thực **API Key**, đặt khoá trùng `SEPAY_WEBHOOK_API_KEY` trong `.env` VPS, và **lọc
  theo tiền tố mã thanh toán** để webhook chỉ bắn cho giao dịch của app (tài khoản cá nhân còn
  nhiều giao dịch riêng — không lọc là mỗi lần ai chuyển tiền cho bạn đều gọi vào server).
- Cân nhắc nghĩa vụ thuế/hoá đơn khi bắt đầu có doanh thu thật — ngoài phạm vi kỹ thuật, nên hỏi
  người có chuyên môn (không phải việc AI tư vấn).
- **Lưu ý riêng của mô hình này:** tiền vào thẳng tài khoản cá nhân của bạn, không qua trung gian
  giữ hộ. Nên dùng một tài khoản ngân hàng RIÊNG cho app để đối chiếu sổ sách dễ, không lẫn với
  chi tiêu cá nhân.

### Bẫy thực tế đã gặp khi cấu hình (2026-07-30, chuyển khoản test bị "mất tích")

Chuyển khoản test vào đúng tài khoản, tiền báo có, nhưng đơn hàng không tự chuyển `paid`. Server
hoàn toàn không lỗi (curl thẳng vào `/api/payment-webhook` trả `success:true` bình thường) —
nguyên nhân nằm ở 2 chỗ cấu hình trên dashboard SePay, không phải code:

1. **Cấu hình chung → Cấu trúc mã thanh toán**: SePay có bước tự tách "mã thanh toán" ra khỏi nội
   dung chuyển khoản thô, dùng để lọc trước khi gọi webhook. Mẫu mặc định để trường **"Là"** ở
   **"Số nguyên"** — nhưng mã app sinh ra (`generatePaymentCode` trong `api/_lib/sepay.ts`) có cả
   chữ lẫn số (bảng ký tự `23456789ABCDEFGHJKMNPQRSTUVWXYZ`, cố tình bỏ 0/O/1/I/L). Kết quả: SePay
   không nhận diện được mã (trường "MÃ THANH TOÁN" trong chi tiết giao dịch để trống `-`) dù nội
   dung có chứa `ENVIxxxxxxxx` rõ ràng → webhook bị bộ lọc "chỉ gửi khi có mã thanh toán" chặn
   ngay từ đầu, không hề gọi ra server (lịch sử webhook trống trơn, dễ nhầm là chưa cấu hình
   webhook). **Phải đổi "Là" sang "Số và chữ".**
2. **Webhook → tab Bảo mật → API Key**: dán key dài (chứa `+ / =`) vào ô input của SePay dễ bị
   dính khoảng trắng thừa ở giữa chuỗi (do UI tự ngắt dòng khi dán) → key không khớp
   `SEPAY_WEBHOOK_API_KEY` trên server → webhook gọi tới nơi nhưng bị `401 Unauthorized`. Xoá
   trắng ô rồi dán lại, kiểm tra kỹ không có khoảng trắng ẩn giữa chuỗi.

Cách chẩn đoán nhanh khi gặp lại: `pm2 logs english-tutor --lines 300 --nostream | grep -i sepay`
— nếu KHÔNG có dòng nào (kể cả `SEPAY_WEBHOOK_UNAUTHORIZED`), nghĩa là request chưa từng chạm
tới server → lỗi nằm ở cấu hình mã thanh toán (bẫy #1). Nếu thấy `SEPAY_WEBHOOK_UNAUTHORIZED`,
đó là bẫy #2. Vào SePay → mục Giao dịch → mở chi tiết giao dịch cần tra → xem trường "MÃ THANH
TOÁN" có bị trống không, và dùng nút "Gọi lại" (resend) để test lại không cần chuyển khoản mới.

## Tiêu chí chấp nhận

- Test unit cho `planGrant`: cộng dồn đúng ngày, không âm (đã có sẵn từ đợt referral/trial).
- Test webhook — **chống trùng**: 2 lần gọi cùng `id` của SePay → chỉ cấp gói 1 lần.
- Test webhook — **sai khoá**: thiếu/sai `Authorization` → 401, KHÔNG cấp gói.
- Test webhook — **thiếu tiền**: `transferAmount` < `amount_vnd` → không cấp gói, đơn giữ `pending`.
- Test webhook — **không khớp mã**: nội dung chuyển khoản không chứa mã nào → không cấp gói, không lỗi 500.
- Test webhook — **tiền ra**: `transferType='out'` → bỏ qua.
- Test Zod input `/api/checkout`: từ chối `plan`/`cycle` ngoài enum.
- Test `/api/payment-status`: user A KHÔNG xem được đơn của user B.
- Rà bảo mật riêng trước merge (không chỉ chạy CI): tự gửi webhook giả không có khoá hợp lệ →
  phải bị từ chối, không cấp gói.
- Cập nhật `CLAUDE.md` mục 13.3 (bỏ dòng "KHÔNG làm thanh toán") + `PROGRESS.md` mục nợ kỹ thuật
  #1 khi bắt đầu code thật.

## Người làm

**Opus tự làm (route:complex)** toàn bộ M2 — đụng tiền thật, bảo mật webhook, nhiều file liên
quan (schema + 4 API + UI + secrets), rủi ro cao nếu làm sai. Không giao subagent cho phần lõi
thanh toán/webhook. Có thể giao `standard-worker` riêng phần UI hiển thị giá/lịch sử ở
`Profile.tsx` SAU KHI API đã có đặc tả kín (route:spec).

## Thứ tự khuyến nghị

1. ~~Đổi Free 5→10 lượt/ngày qua `/api/admin-settings`~~ — độc lập, làm bất cứ lúc nào qua admin.
2. ~~Đọc tài liệu cổng thanh toán thật~~ **ĐÃ XONG 2026-07-27** (SePay, xem mục "Cổng thanh toán").
3. ~~Thêm bảng giá + migration `payments`~~ **ĐÃ XONG** — `plan_prices` (migration `0014`),
   `payments` (migration `0015`).
4. ~~`api/_lib/sepay.ts`~~ **ĐÃ XONG** — sinh mã, dựng URL QR, dò mã, xác thực API Key; 13 test.
5. ~~API `checkout`/`payment-webhook`/`payment-status`/`payment-history`/`plan-prices`~~
   **ĐÃ XONG** — 27 test handler-level phủ mọi ca ở mục "Tiêu chí chấp nhận" bên dưới.
6. ~~UI `Profile.tsx` + màn hình QR chuyển khoản~~ **ĐÃ XONG** — `UpgradeSection.tsx`.
7. ~~Cập nhật `CLAUDE.md`/`PROGRESS.md`~~ **ĐÃ XONG**.
8. **CÒN LẠI — việc tay của bạn:** đăng ký SePay + cấu hình `.env` VPS + webhook + lọc tiền tố
   → **chạy thử thanh toán thật số tiền nhỏ (vd 2.000đ) trước khi công bố rộng rãi.** Không có
   cách nào kiểm chứng đường tiền thật ngoài việc chuyển thật một lần. Nhớ `npm run migrate:pg`
   trước khi deploy (2 migration mới `0014`/`0015`).

## Quyết định 2026-07-27: theo đúng đề xuất, không hỏi lại

Người dùng chọn "làm theo đề xuất của bạn" cho 2 câu hỏi mở trước đó:

1. **Nhắc gia hạn:** trong app, KHÔNG gửi email (dự án chưa có hạ tầng email thật cho việc này).
   Hiện tại `/profile` đã hiện gói + `planExpiresAt` sẵn có qua `resolvePlan()` — chưa có banner
   nhắc riêng khi SẮP hết hạn; để ở đợt sau nếu thấy cần (không phải việc bắt buộc của M2).
2. **Downgrade/hoàn tiền:** KHÔNG hỗ trợ tự động. Ca hiếm xử lý tay qua `/api/admin-grant-plan`
   sẵn có — không cần viết thêm code cho M2.
