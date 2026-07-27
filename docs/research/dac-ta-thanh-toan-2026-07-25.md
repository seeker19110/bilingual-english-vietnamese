# Đặc tả triển khai — Thanh toán Pro/VIP (M2)

> Ngày soạn: 2026-07-25 · **Đảo ngược quyết định 2026-07-11** trong `CLAUDE.md` mục 13.3
> ("miễn phí, không làm thanh toán cho tới khi người dùng chủ động yêu cầu lại") — bạn đã chủ
> động yêu cầu hôm nay, quyết định mới **thay thế** quyết định cũ. Cần cập nhật `CLAUDE.md` +
> `PROGRESS.md` khi bắt đầu triển khai thật (không làm trong bước đặc tả này).

## Bảng giá đã chốt

> **Cập nhật 2026-07-27** — người dùng chốt lại giá gói NĂM (VIP 1tr → 750k). Giá gói THÁNG
> giữ nguyên như bảng cũ vì lần chốt này chỉ nói tới giá năm.

| Gói  | Tháng    | Năm      | Ghi chú                                      |
| ---- | -------- | -------- | -------------------------------------------- |
| Free | 0đ       | 0đ       | 10 lượt/ngày mỗi chế độ (đã chốt, tăng từ 5) |
| Pro  | 75.000đ  | 500.000đ | Năm ~ giảm 44% so với 12×tháng (900k)        |
| VIP  | 125.000đ | 750.000đ | Năm ~ giảm 50% so với 12×tháng (1.5tr)       |

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

## Vì sao PayOS

- Hỗ trợ VietQR (người dùng quét mã chuyển khoản ngân hàng trực tiếp — quen thuộc, không cần thẻ
  quốc tế, phù hợp đối tượng học sinh/sinh viên VN).
- Có webhook xác nhận thanh toán tự động (không cần admin xác nhận tay như `admin-grant-plan.ts`
  hiện tại).
- Hỗ trợ thanh toán định kỳ (subscription) hoặc từng lần — cần xác nhận API PayOS hiện hỗ trợ
  recurring thật hay chỉ tạo link thanh toán từng lần (đọc tài liệu PayOS thật trước khi code,
  KHÔNG giả định — nguyên tắc chống ảo giác mục 5). **Giả định làm việc ban đầu: PayOS chỉ tạo
  link thanh toán 1 lần** → mô hình "mua N ngày", tự hết hạn theo `plan_expires_at` (cơ chế đã
  có sẵn), người dùng tự mua lại hoặc bật nhắc gia hạn — không phải subscription tự động trừ
  tiền. Đơn giản hơn, khớp hạ tầng hiện có, tránh rủi ro trừ tiền ngoài ý muốn.

## Kiến trúc tổng quan

```
User bấm "Nâng cấp Pro/VIP" (Profile.tsx)
  → POST /api/checkout { plan: 'pro'|'vip', cycle: 'month'|'year' }
  → server tạo bản ghi `payments` (status='pending') + gọi PayOS tạo link thanh toán
  → trả về checkoutUrl, redirect người dùng sang PayOS
  → PayOS gọi webhook POST /api/payment-webhook khi thanh toán xong
  → server xác thực chữ ký webhook (PayOS ký HMAC — bắt buộc kiểm tra, không tin payload thô)
  → cập nhật payments.status='paid' + cấp plan qua planGrant helper (M1.4 đã đề xuất factor ra
    api/_lib/planGrant.ts — TÁI DÙNG ở đây, không viết lại lần 2)
  → redirect người dùng về /profile?payment=success (trang tự fetch lại plan mới)
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
  provider      text not null default 'payos',
  provider_order_id text,                  -- mã đơn phía PayOS, dùng để đối chiếu webhook
  status        text not null default 'pending' check (status in ('pending','paid','failed','expired')),
  created_at    timestamptz not null default now(),
  paid_at       timestamptz
);
create index if not exists payments_user_idx on public.payments(user_id, created_at desc);
create unique index if not exists payments_provider_order_idx on public.payments(provider_order_id)
  where provider_order_id is not null;
```

Giá bán KHÔNG hard-code trong code — thêm vào `app_settings` (giống `limits`) để đổi giá không
cần deploy, đúng khuôn mẫu hiện có (`api/_lib/settings.ts`). Mỗi gói/chu kỳ cần 3 trường: giá
niêm yết, giá khuyến mãi (nullable), hạn khuyến mãi (nullable) — xem mục "Khuyến mãi dịp lễ".

## API cần thêm

1. `POST /api/checkout` (cần đăng nhập): validate `plan`∈{pro,vip}, `cycle`∈{month,year} bằng
   Zod; đọc giá từ `app_settings`; tạo `payments` row `pending`; gọi PayOS SDK/API tạo link; trả
   `{ checkoutUrl }`. Rate limit theo user (không phải chỉ IP — 1 user không cần bấm nâng cấp
   liên tục).
2. `POST /api/payment-webhook` (PayOS gọi, KHÔNG cần Bearer token của app — xác thực bằng chữ ký
   PayOS theo tài liệu chính thức của họ, đọc kỹ mục "Verify webhook signature"): tra `payments`
   theo `provider_order_id`, cập nhật `status`, nếu `paid` → gọi `planGrant` cấp đúng số ngày
   theo `cycle` (30 hoặc 365), ghi `logSecurityEvent`. **Idempotent bắt buộc** — PayOS có thể gọi
   webhook nhiều lần cho cùng 1 đơn, code phải kiểm tra `status` hiện tại trước khi cấp lại (tránh
   cấp Pro 2 lần cho 1 lần trả tiền).
3. `GET /api/payment-history` (cần đăng nhập): trả lịch sử đơn của chính user đó (Profile hiển
   thị) — tự kiểm `user_id` khớp token, đúng nguyên tắc kỹ thuật #2.

## UI

- `Profile.tsx`: khối "Nâng cấp" hiển thị 2 gói × 2 chu kỳ, giá, nút → gọi `/api/checkout` →
  redirect. Hiển thị lịch sử thanh toán + gói/hạn hiện tại (đã có sẵn phần hiển thị plan).
- Trang kết quả sau khi PayOS redirect về (`/profile?payment=success|cancel`) — thông báo rõ,
  và **tự động fetch lại plan** (đừng tin query string là thanh toán đã thành công — webhook mới
  là nguồn sự thật; query string chỉ để hiện thông báo tạm, phải fetch profile thật để xác nhận).

## Bảo mật (mục bắt buộc đọc kỹ trước khi code — CLAUDE.md mục 12: đụng thanh toán phải cẩn trọng)

1. **Webhook phải xác thực chữ ký** — không tin bất kỳ request nào tự xưng "PayOS gọi tới" nếu
   không verify được HMAC/secret theo đúng tài liệu PayOS.
2. **Không tin số tiền/plan từ client ở bước xác nhận** — số tiền lấy từ `payments.amount_vnd`
   đã lưu lúc tạo đơn (server tự đọc giá từ `app_settings`), không lấy lại từ webhook payload.
3. **Idempotency** — webhook gọi lại nhiều lần không được cấp trùng.
4. **Log đầy đủ** mọi giao dịch (không log số thẻ/thông tin nhạy cảm nếu PayOS trả về — chỉ log
   mã đơn, trạng thái).
5. **Không có cổng thanh toán nào chạy trong CI/test thật** — viết test bằng cách giả lập webhook
   payload nội bộ (mock), không gọi PayOS thật trong `npm test`.
6. **Biến môi trường**: `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` (tên chính xác
   theo tài liệu PayOS thật — xác nhận khi đọc SDK, không đoán) — thêm vào `.env.example`, KHÔNG
   commit giá trị thật (nguyên tắc #6).

## Việc CẦN BẠN LÀM TAY (ngoài khả năng AI, giống Sentry/branch protection đã ghi trong CLAUDE.md)

- Đăng ký tài khoản PayOS (doanh nghiệp/cá nhân kinh doanh — PayOS thường yêu cầu giấy tờ), lấy
  `clientId`/`apiKey`/`checksumKey`.
- Cấu hình webhook URL trên dashboard PayOS trỏ về `https://en-vi.donghanhcungban.com/api/payment-webhook`.
- Cân nhắc nghĩa vụ thuế/hoá đơn khi bắt đầu có doanh thu thật — ngoài phạm vi kỹ thuật, nên hỏi
  người có chuyên môn (không phải việc AI tư vấn).

## Tiêu chí chấp nhận

- Test unit cho `planGrant` (dùng chung với M1.4 nếu làm referral): cộng dồn đúng ngày, không âm.
- Test cho webhook: mock 2 lần gọi cùng `provider_order_id` → chỉ cấp plan 1 lần.
- Test Zod input `/api/checkout`: từ chối `plan`/`cycle` ngoài enum.
- Rà bảo mật riêng trước merge (không chỉ chạy CI): thử gửi webhook giả không có chữ ký hợp lệ →
  phải bị từ chối 401/403, không cấp plan.
- Cập nhật `CLAUDE.md` mục 13.3 (bỏ dòng "KHÔNG làm thanh toán") + `PROGRESS.md` mục nợ kỹ thuật
  #1 khi bắt đầu code thật.

## Người làm

**Opus tự làm (route:complex)** toàn bộ M2 — đụng tiền thật, bảo mật webhook, nhiều file liên
quan (schema + 3 API + UI + secrets), rủi ro cao nếu làm sai. Không giao subagent cho phần lõi
thanh toán/webhook. Có thể giao `standard-worker` riêng phần UI hiển thị giá/lịch sử ở
`Profile.tsx` SAU KHI API đã có đặc tả kín (route:spec).

## Thứ tự khuyến nghị

1. Đổi Free 5→10 lượt/ngày qua `/api/admin-settings` — **làm ngay hôm nay, không cần code.**
2. Đọc tài liệu PayOS thật (SDK Node, cách verify webhook) — xác nhận trước khi viết bất kỳ dòng
   code nào (chống ảo giác).
3. Migration `payments` + `planGrant` helper dùng chung.
4. API `checkout` + `payment-webhook` + test idempotency.
5. UI `Profile.tsx`.
6. Cập nhật `CLAUDE.md`/`PROGRESS.md`.
7. Bạn đăng ký PayOS + cấu hình `.env` VPS + webhook URL → chạy thử thanh toán thật số tiền nhỏ
   trước khi công bố rộng rãi.

## Cần bạn quyết thêm

1. PayOS yêu cầu giấy tờ doanh nghiệp/hộ kinh doanh — bạn đã có tư cách pháp nhân để đăng ký
   chưa? Nếu chưa, đây là điểm chặn phải giải quyết trước bước 7, không phải việc code.
2. Gói năm có tự động nhắc gia hạn (email/thông báo trong app khi gần hết hạn) không, hay để
   `plan_expires_at` tự rơi về free và người dùng tự mua lại? (Đề xuất: nhắc trong app, không
   cần email nếu chưa có hạ tầng email — kiểm tra trước, có vẻ dự án chưa có gửi email thật.)
3. Có cho phép **downgrade/hoàn tiền** không (vd mua VIP rồi muốn về Pro)? Đề xuất giai đoạn đầu:
   không hỗ trợ hoàn tiền tự động, xử lý tay từng ca hiếm qua admin — tránh code phức tạp không
   cần thiết ngay từ đầu (nguyên tắc tránh phình phạm vi).
