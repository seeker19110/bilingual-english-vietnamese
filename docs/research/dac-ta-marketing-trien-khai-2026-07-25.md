# Đặc tả triển khai — hạng mục kỹ thuật marketing (M1)

> Ngày soạn: 2026-07-25 · Dựa trên `docs/research/chien-luoc-marketing-2026-07-25.md` §7
> Phạm vi: biến 8 hạng mục kỹ thuật thành đặc tả đủ để giao việc + code thật.
> **Chưa code gì** — đây là cổng đặc tả trước khi bắt tay (CLAUDE.md mục 3).

## Cách đọc file này

Mỗi hạng mục có: **Vì sao** → **Đặc tả** (schema/API/UI cụ thể) → **Tiêu chí chấp nhận** →
**Người làm** (theo CLAUDE.md mục 3, quyết định 2026-07-15: phức tạp→Opus, vừa→Sonnet
`standard-worker`, cơ học→Haiku `mechanical-worker`) → **Phụ thuộc**.

Thứ tự triển khai (đã sắp theo phụ thuộc + giá trị/công sức):

```
M1.1 (sửa thông điệp) ─┐
M1.5 (PDF quà tặng)    ├─ độc lập, làm song song được, không đụng schema
M1.7 (analytics)       ─┘
M1.2 (landing page)    ── phụ thuộc M1.7 (đo hiệu quả ngay khi ra mắt)
M1.3 (chia sẻ ảnh)     ── độc lập
M1.8 (hạ dần hạn mức)  ── độc lập, chỉ cấu hình + banner
M1.4 (referral)        ── phụ thuộc M1.7, đụng schema — làm SAU CÙNG, Opus tự làm
```

---

## M1.1 — Sửa thông điệp "hết lượt"

**Vì sao:** câu hiện tại mời "nâng cấp gói Pro" — nhưng dự án không bán Pro. Sai định hướng,
sửa nhanh, giá trị cao (§5.2 tài liệu chiến lược).

**Đặc tả:**

- File: `api/_lib/usage.ts`, hàm `limitMessage(plan)` (dòng ~35).
- Đổi nội dung, KHÔNG đổi chữ ký hàm hay logic quanh nó:
  - `free`: `'Hết lượt miễn phí hôm nay. Quay lại vào ngày mai nhé — hoặc mời một người bạn cùng học để nhận thêm lượt!'` (câu chính xác do người viết nội dung/bạn chốt — không hứa cơ chế mời bạn nếu M1.4 chưa xong; nếu M1.4 CHƯA triển khai, dùng: `'Hết lượt miễn phí hôm nay. Thử lại vào ngày mai nhé!'` — bỏ hẳn từ "Pro/nâng cấp").
  - `pro`/`vip`: giữ nguyên tinh thần cũ (đã ổn, không nhắc bán hàng).
- Tìm & xoá các chỗ khác trong `src/` có hiển thị "nâng cấp Pro" hướng tới thanh toán (grep
  `nâng cấp`, `upgrade`, `Pro` trong `src/components`, `src/pages`) — liệt kê ra để rà, không tự
  ý xoá nếu ngữ cảnh khác (vd trang Profile hiển thị gói hiện tại là hợp lệ, giữ nguyên).

**Tiêu chí chấp nhận:**

- Không còn câu nào trong luồng người dùng gợi ý "mua/nâng cấp" mà thực tế không mua được gì.
- `npm test` xanh (có thể có test snapshot cho `limitMessage` — kiểm tra `api/*.test.ts` liên quan `usage`).

**Người làm:** `mechanical-worker` (Haiku) — đổi chuỗi, không quyết định kiến trúc. Brief cần kèm
đúng câu chữ đã chốt (bạn duyệt trước).

**Phụ thuộc:** không.

---

## M1.5 — PDF quà tặng "500 từ A1–A2"

**Vì sao:** mồi dẫn (lead magnet) chi phí 0đ, dữ liệu đã có sẵn 100% (`src/data/cefr.ts` +
từ điển 12.073 mục đã gắn nhãn CEFR + phiên âm).

**Đặc tả:**

- Script mới: `scripts/gen-vocab-pdf.ts` (theo mẫu các script `scripts/gen-*` đã có, vd
  `scripts/gen-cefr-c1c2-vocab.ts` — đọc để bắt chước style/cách chạy bằng `tsx`).
- Input: lọc từ điển ở mức A1+A2 (dùng field `level` có sẵn), ưu tiên theo `freq` (tần suất
  thật đã gắn — xem CLAUDE.md mục 13 "Từ điển & dữ liệu"), lấy 500 từ đầu.
- Output: 1 file PDF tĩnh, đặt ở `public/downloads/500-tu-vung-a1-a2.pdf` (thư mục `public/`
  đã được Vite serve tĩnh — xác nhận bằng cách xem `vite.config.ts`/cấu trúc `public/` hiện có
  trước khi tạo thư mục mới).
- Layout PDF tối thiểu: từ tiếng Anh — phiên âm — nghĩa tiếng Việt — 1 câu ví dụ (lấy từ field
  ví dụ có sẵn trong dictionary nếu có), chia theo cấp A1/A2, có trang bìa với tên app + link.
- Thư viện PDF: kiểm tra `package.json` xem đã có lib PDF nào chưa (vd dùng trong `docs`/`pdf`
  skill ở máy dev, nhưng **trong runtime Node của app thì cần thêm dependency** — ưu tiên
  `pdf-lib` (nhẹ, không cần Chromium) hơn puppeteer/playwright để tránh phình node_modules server.
- Đây là file **build-time / chạy tay 1 lần**, không phải API — không tính vào chi phí AI/server.

**Tiêu chí chấp nhận:**

- Chạy `tsx scripts/gen-vocab-pdf.ts` ra đúng 1 file PDF, mở được, đúng 500 từ, không lỗi encoding
  tiếng Việt (dấu).
- File PDF được commit vào `public/downloads/` (hoặc build script chạy trong CI — bạn chọn,
  nhưng vì dữ liệu ít đổi, commit thẳng file đơn giản hơn).
- `npm run typecheck`/`lint`/`build` vẫn xanh.

**Người làm:** `standard-worker` (Sonnet) — đặc tả đã đủ rõ, ít phụ thuộc ngữ cảnh phiên hiện tại.
Brief cần kèm: đường dẫn field `level`/`freq`/ví dụ thật trong kiểu `DictEntry` (đọc `src/types.ts`
dòng ~37 trước khi giao), và yêu cầu đọc 1 script `gen-*` có sẵn làm mẫu phong cách code.

**Phụ thuộc:** không.

---

## M1.7 — Analytics tối thiểu, tôn trọng riêng tư

**Vì sao:** không đo thì không biết kênh nào hiệu quả — làm mọi hạng mục sau mà thiếu cái này
là làm mù.

**Đặc tả (đề xuất tự đếm, KHÔNG dùng script bên thứ 3 để tránh cookie/GDPR/CSP rắc rối, khớp
triết lý "không tin client" của dự án):**

- Bảng mới `postgres/migrations/00XX_analytics_events.sql` (số thứ tự = số tiếp theo sau file
  mới nhất trong `postgres/migrations/` — kiểm tra trước khi đặt tên):
  ```sql
  create table if not exists public.analytics_events (
    id         bigserial primary key,
    event      text not null,        -- 'landing_view' | 'signup' | 'first_session_done' | ...
    user_id    uuid references public.users(id) on delete set null,
    ref_code   text,                 -- mã giới thiệu nếu có (?ref=...), null nếu không
    utm_source text,
    path       text,
    created_at timestamptz not null default now()
  );
  create index if not exists analytics_events_event_idx on public.analytics_events(event, created_at);
  ```
- API mới `api/analytics.ts` (theo khuôn các handler edge hiện có — xem `api/challenge.ts` làm
  mẫu cấu trúc): `POST /api/analytics` nhận `{ event, refCode?, utmSource?, path? }`, validate
  bằng Zod (whitelist `event` là enum cố định, KHÔNG nhận chuỗi tự do — tránh spam bảng), rate
  limit theo IP giống các handler khác (`checkRateLimit`), auth **KHÔNG bắt buộc** (phải đo được
  người chưa đăng nhập) nhưng lấy `user_id` nếu có Bearer token hợp lệ.
- Client: hàm nhỏ `src/lib/analytics.ts` — `track(event, extra?)`, gọi `fetch('/api/analytics', ...)`
  kiểu "gửi rồi quên" (không block UI, nuốt lỗi).
- Sự kiện tối thiểu cần bắn: xem landing page, bấm "bắt đầu", đăng ký thành công, hoàn thành
  phiên học đầu tiên (chat/writing/speaking bất kỳ), quay lại ngày thứ 2.
- Trang xem số liệu: tận dụng `AdminSettings.tsx` (đã có, chỉ admin truy cập qua `isAdminEmail`)
  — thêm 1 tab/khối query đếm theo event + theo ngày, KHÔNG cần dashboard đẹp, bảng số là đủ.

**Tiêu chí chấp nhận:**

- Ghi được sự kiện cả khi chưa đăng nhập.
- Không lộ dữ liệu cá nhân ai khác qua endpoint (không có GET công khai trả danh sách user).
- Migration có thể chạy lại an toàn (`create table if not exists`), có trong
  `postgres/migrations/README.md`.
- Zod validate input đúng nguyên tắc kỹ thuật bất biến #1 (CLAUDE.md mục 4).

**Người làm:** `standard-worker` (Sonnet) cho phần API + client hook (đặc tả đủ kín). Migration
SQL nên để `complex-implementer`/Opus tự viết hoặc review kỹ vì đụng schema production — theo
CLAUDE.md mục 12 ("đụng bảo mật... breaking change" cần cẩn trọng, dù đây không phải destructive).
Đề xuất: Sonnet làm toàn bộ theo `route:standard`, Opus review diff trước khi merge (không tự
chạy migration lên production — đó là bước "cần làm tay" theo quy ước dự án).

**Phụ thuộc:** không (nhưng nên làm TRƯỚC M1.2/M1.3/M1.4 để có số liệu ngay).

---

## M1.2 — Landing page cho người chưa đăng nhập

**Vì sao:** mọi kênh (TikTok, Facebook, SEO) đều đổ traffic về một chỗ — hiện chưa có trang
"bán ý tưởng", chỉ có `/login`.

**Đặc tả:**

- Xác nhận trước: đọc `src/App.tsx` xem route `/` hiện trỏ đi đâu khi CHƯA đăng nhập (có thể đã
  redirect thẳng `/login`). Nếu vậy, cần tách: `/` = landing công khai (không cần đăng nhập),
  `/login` = form đăng nhập riêng, nút CTA trên landing trỏ sang `/login?mode=register`.
- Trang mới `src/pages/Landing.tsx`, nội dung theo câu định vị đã chốt trong tài liệu chiến lược
  §2.1: hook chính "sửa lỗi bằng giọng tiếng Việt", demo ngắn (ảnh chụp màn hình hoặc audio mẫu
  có sẵn — KHÔNG bịa số liệu người dùng/đánh giá giả), 3 nút CTA theo 3 chế độ, khối "miễn phí,
  có giới hạn lượt/ngày" (thành thật ngay từ đầu, theo §8.5 tài liệu chiến lược).
- Bắn sự kiện `landing_view` (M1.7) khi vào trang, `cta_click` khi bấm CTA.
- Đọc `utm_source`/`ref` từ query string (`useSearchParams`), lưu tạm (localStorage hoặc chuyển
  tiếp qua query sang `/login`) để gắn vào sự kiện `signup` — chuẩn bị sẵn chỗ cắm cho M1.4
  (referral) dù referral chưa code, tránh phải sửa lại 2 lần.
- SEO: `<title>`/`<meta description>` + canonical (đã có cơ chế `VITE_SITE_URL`, xem `src/App.tsx`
  cách trang khác đang set — làm nhất quán).
- Mobile-first, dùng design tokens `--a-*` có sẵn, KHÔNG hard-code màu (nguyên tắc #8).

**Tiêu chí chấp nhận:**

- Vào `/` khi chưa đăng nhập thấy landing, không bị ép đăng nhập ngay.
- Lighthouse/axe không tệ hơn baseline (bundle-size budget vẫn đạt — nguyên tắc #7).
- 4 theme đều đọc được (AA contrast).
- E2E Playwright: thêm 1 test mới cho luồng landing → bấm CTA → tới `/login`.

**Người làm:** `standard-worker` (Sonnet) — component UI rõ ràng, có đặc tả cụ thể.

**Phụ thuộc:** M1.7 (để bắn sự kiện ngay từ ngày ra mắt, không mất dữ liệu tuần đầu).

---

## M1.3 — Nút "Chia sẻ kết quả"

**Vì sao:** lan truyền không cần lời mời — người dùng tự khoe streak/band điểm.

**Đặc tả:**

- Vị trí gắn: màn "Kết thúc & chấm điểm" (Chat/Speaking — đã có, xem CLAUDE.md mục 13 dòng
  "Giọng điệu Chat/Speaking...") và màn tổng kết tuần Challenge (`src/pages/Challenge.tsx`).
- Cơ chế: vẽ 1 ảnh bằng `<canvas>` phía client (KHÔNG cần server) — gồm: điểm/band hoặc số ngày
  streak, logo/tên app, URL. Xuất ảnh bằng `canvas.toBlob()` → `navigator.share()` nếu trình
  duyệt hỗ trợ (mobile), fallback tải file PNG nếu không.
- Component mới `src/components/ShareResultCard.tsx` nhận props kết quả cần vẽ, tái dùng cho cả
  2 nơi gắn (không viết 2 lần — nguyên tắc DRY #4).
- Bắn sự kiện `share_click` (M1.7).
- **Không** tự động đăng hộ lên mạng xã hội nào — chỉ tạo ảnh/gọi Web Share API chuẩn của
  trình duyệt (người dùng tự chọn nơi đăng).

**Tiêu chí chấp nhận:**

- Hoạt động trên mobile Safari/Chrome (Web Share API) và fallback tải ảnh trên desktop.
- Ảnh xuất ra đọc được (không vỡ font tiếng Việt có dấu trên canvas — cần test kỹ, canvas dễ lỗi
  font khi chạy trong CI headless).
- Test unit cho logic vẽ (tách phần tính toán layout khỏi phần vẽ DOM để test được, theo nguyên
  tắc #9 chống lỗi logic — ca biên: streak = 0, band điểm null).

**Người làm:** `standard-worker` (Sonnet).

**Phụ thuộc:** không, nhưng nên làm sau M1.7 để đo được `share_click`.

---

## M1.8 — Kịch bản hạ dần hạn mức trước 2027-01-01

**Vì sao:** tránh cắt phựt từ không-giới-hạn xuống 5 lượt/ngày trong một đêm (rủi ro giữ chân
lớn nhất nêu ở §8 tài liệu chiến lược).

**Đặc tả — đây là việc admin/thao tác, không phải feature code lớn:**

1. **Cấu hình (không cần code mới):** `promoUntil` trong `app_settings` đổi qua `/api/admin-settings`
   theo 2 mốc — ví dụ đổi từ `2027-01-01` xuống mốc gần hơn khi muốn hạ dần, HOẶC (cách sạch
   hơn) giữ `promoUntil` cố định nhưng đổi `limits.vip` từ "gần vô hạn" xuống bằng `limits.pro`
   trước, rồi mới tắt hẳn promo. Bạn chọn 1 trong 2 cách — khuyến nghị cách 2 (đổi limits.vip)
   vì không cần đụng field `promoUntil` semantics.
2. **Banner báo trước (việc code duy nhất của mục này):** component nhỏ hiển thị khi
   `promoUntil` còn dưới N ngày (đọc qua `src/lib/appSettings.ts`/`src/lib/promo.ts` đã có) —
   "Từ [ngày] app sẽ áp hạn mức lượt dùng/ngày để duy trì lâu dài cho mọi người, cảm ơn bạn đã
   đồng hành". Đặt ở layout chung (`Home.tsx` hoặc component header dùng chung), tự ẩn sau khi
   đóng (localStorage), tự ẩn hẳn nếu còn > N ngày.
3. Cập nhật `docs/research/eval-tutor-baseline.md`? — KHÔNG liên quan, bỏ qua (chỉ áp dụng khi
   đổi prompt/model AI theo CLAUDE.md mục 8).

**Tiêu chí chấp nhận:**

- Banner đúng 4 theme, đóng được, không hiện lại trong ngày sau khi đóng.
- Không đụng logic `usage.ts`/`promo.ts` hiện có (chỉ đọc, không sửa).

**Người làm:** banner → `standard-worker`. Quyết định NGÀY cụ thể hạ hạn mức và cách chỉnh
`app_settings` → **bạn quyết + Opus thao tác tay qua `/api/admin-settings`**, không giao subagent
(đây là thao tác vận hành ảnh hưởng production, không phải code).

**Phụ thuộc:** không, làm bất kỳ lúc nào trước tháng 11/2026.

---

## M1.4 — Hệ thống giới thiệu bạn (referral)

**Vì sao:** vòng lặp tăng trưởng mạnh nhất, nhưng đụng `plan`/`plan_expires_at` (tiền API thật)
→ hạng mục rủi ro cao nhất, làm sau cùng, sau khi có M1.7 để đo hiệu quả và có M1.1 xong.

### Schema

`postgres/migrations/00XX_referral.sql` (số kế tiếp thật, kiểm tra lúc code):

```sql
-- Mỗi user có 1 mã mời cố định, sinh khi cần (không sinh sẵn cho toàn bộ user cũ trong migration
-- để tránh phải chọn thuật toán unique cho hàng loạt — sinh lười, xem hàm bên dưới).
alter table public.profiles add column if not exists referral_code text unique;

create table if not exists public.referrals (
  id            bigserial primary key,
  referrer_id   uuid not null references public.users(id) on delete cascade,
  referee_id    uuid not null references public.users(id) on delete cascade unique, -- 1 người chỉ được mời bởi 1 người, chỉ 1 lần
  rewarded_at   timestamptz,   -- null = chưa đủ điều kiện thưởng (chưa hoàn thành phiên đầu)
  created_at    timestamptz not null default now(),
  check (referrer_id <> referee_id)  -- chặn tự mời chính mình ở tầng DB, không chỉ ở code
);
create index if not exists referrals_referrer_idx on public.referrals(referrer_id);
```

### API

- `GET /api/referral` (cần đăng nhập): trả `referralCode` của user hiện tại (sinh lười nếu chưa
  có — random 6 ký tự chữ+số viết hoa, retry khi đụng unique constraint), số lượt mời đã thưởng,
  còn được thưởng bao nhiêu lượt (trần 10/tài khoản — đọc từ `app_settings` hoặc hằng số, ưu
  tiên đọc từ `app_settings` để admin chỉnh live giống các hạn mức khác).
- `POST /api/referral/claim` body `{ referralCode }`: gọi lúc đăng ký xong (hoặc lúc đăng nhập
  lần đầu) nếu có `ref=` trong URL lúc vào landing (M1.2 đã chuẩn bị chỗ đọc). Validate: mã tồn
  tại, không phải tự mời mình, `referee_id` chưa từng được ghi (constraint unique đã chặn ở DB,
  nhưng trả lỗi rõ ràng ở tầng API trước). Ghi `referrals` với `rewarded_at = null` (CHƯA thưởng
  ngay — chờ điều kiện).
- Điều kiện thưởng thật sự (chống gian lận — bắt buộc theo tài liệu chiến lược §3 Vòng 2): kích
  hoạt ở **đúng chỗ trong code hiện tại ghi nhận "hoàn thành 1 phiên học"** — cần tìm chỗ đó
  trước khi code (đọc `api/challenge.ts` hoặc nơi ghi `chat_sessions`/`speaking_sessions` — xác
  nhận sự kiện "hoàn thành phiên" nằm ở đâu, tránh đoán). Khi điều kiện đạt: set `rewarded_at`,
  cấp cho **cả referrer và referee** N ngày Pro bằng cách cập nhật `profiles.plan`/
  `plan_expires_at` — tái dùng đúng logic `resolvePlan`/cách `admin-grant-plan.ts` đang cấp
  (cộng dồn nếu user đã có Pro/VIP còn hạn, không ghi đè xuống thấp hơn — cần hàm helper riêng,
  đừng copy-paste logic từ `admin-grant-plan.ts`, factor ra `api/_lib/planGrant.ts` dùng chung
  cho cả 2 nơi).
- Trần chống lạm dụng: đếm `rewarded_at is not null` theo `referrer_id`, chặn ở ngưỡng 10 (đọc
  cấu hình), rate limit endpoint `claim` theo IP giống các handler khác.

### UI

- Trang/khối "Mời bạn" trong `Profile.tsx`: hiện mã + link `?ref=MÃ`, nút copy, đếm "đã mời
  X/10 lượt được thưởng".
- Landing page (M1.2) và trang đăng ký đọc `ref=` từ query, gọi `POST /api/referral/claim` NGAY
  SAU khi tạo tài khoản thành công (không phải trước).
- Thông điệp hết lượt (M1.1) trỏ sang trang mời bạn.

### Tiêu chí chấp nhận

- Test unit cho `planGrant` helper: cộng dồn đúng khi đã có Pro/VIP còn hạn; ca biên hết hạn
  đúng lúc; không cho âm ngày.
- Test cho `claim`: tự mời mình → lỗi; mời trùng người đã được người khác mời → lỗi; vượt trần
  10 → không ghi thêm nhưng không lỗi cứng (referee vẫn đăng ký được, chỉ referrer không được
  thưởng thêm).
- Không lộ được `referrer_id`/danh sách người bị mời của người khác qua bất kỳ endpoint công khai.
- Chi phí kiểm chứng: viết rõ trong PR — 1 lượt referral thành công tốn tối đa bao nhiêu (N ngày
  Pro × hạn mức Pro/ngày × giá vốn trung bình 1 lượt — cần số từ M1.7/đo thật, không bịa).

**Người làm:** **Opus tự làm** (route:complex theo CLAUDE.md mục 3) — đụng nhiều file liên quan
nhau (schema + 2 API + 2 nơi UI + logic chống gian lận + tiền thật), cần hiểu sâu ngữ cảnh
(đúng chỗ "hoàn thành phiên" nằm ở đâu trong code hiện tại). Có thể giao `spec-executor` CHỈ SAU
KHI Opus đã tự xác định chính xác điểm chạm "hoàn thành phiên" và viết đặc tả kín 100% (schema
DDL, API, điểm chạm code, tiêu chí chấp nhận đầy đủ — đúng định nghĩa route:spec).

**Phụ thuộc:** M1.1 (thông điệp trỏ đúng chỗ), M1.7 (đo hiệu quả), khuyến nghị làm sau khi
M1.2/M1.3 đã ổn định.

---

## Bảng chia việc tổng hợp

| #    | Hạng mục                | Người làm                           | Route      | Phụ thuộc          | Đụng schema?        |
| ---- | ----------------------- | ----------------------------------- | ---------- | ------------------ | ------------------- |
| M1.1 | Sửa thông điệp hết lượt | Haiku                               | mechanical | không              | không               |
| M1.5 | PDF quà tặng            | Sonnet                              | standard   | không              | không               |
| M1.7 | Analytics tối thiểu     | Sonnet (+Opus review)               | standard   | không              | có (bảng mới)       |
| M1.2 | Landing page            | Sonnet                              | standard   | M1.7               | không               |
| M1.3 | Chia sẻ kết quả         | Sonnet                              | standard   | M1.7 (khuyến nghị) | không               |
| M1.8 | Banner hạ dần hạn mức   | Sonnet (code) + bạn+Opus (vận hành) | standard   | không              | không               |
| M1.4 | Referral                | **Opus**                            | complex    | M1.1, M1.7         | có (cột + bảng mới) |

## Việc CẦN BẠN QUYẾT trước khi giao việc (không tự đoán)

1. Câu chữ chính xác cho thông điệp hết lượt (M1.1) — dùng câu có nhắc "mời bạn" (chờ M1.4)
   hay câu trung tính trước?
2. Route `/` landing (M1.2): tách riêng khỏi `/login` hay giữ chung nhưng đổi nội dung khi chưa
   đăng nhập? Ảnh hưởng cách định tuyến trong `App.tsx`.
3. Số ngày Pro thưởng khi referral thành công (đề xuất 7 ngày) + trần 10 lượt/tài khoản — chốt
   số trước khi Opus code.
4. Ngày cụ thể bắt đầu hạ hạn mức (M1.8) — đề xuất tháng 11/2026, cần bạn chốt.
5. Có triển khai `M1.4` (referral) đợt này không, hay dừng ở M1.1/M1.2/M1.3/M1.5/M1.7/M1.8 trước
   và đánh giá lại sau 4–6 tuần có số liệu?

Sau khi bạn trả lời, tôi sẽ tạo các nhánh/PR riêng cho từng hạng mục độc lập (M1.1, M1.5, M1.7
trước) và cập nhật `PROGRESS.md`.
