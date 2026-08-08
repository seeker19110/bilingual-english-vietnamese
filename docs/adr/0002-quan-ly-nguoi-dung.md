# ADR-0002: Quản lý người dùng cho nền tảng đa lĩnh vực

- **Trạng thái:** Bước 1–4 xong; Bước 5 bỏ qua (không có tính năng thật để gắn); Bước 6 chặn
  chờ xác nhận (đụng phiên đăng nhập thật, chỉ nên làm sau khi mở môn thứ 2)
- **Ngày:** 2026-08-08
- **Liên quan:** `docs/adr/0001-nen-tang-da-linh-vuc.md` (đã chốt bố cục domain/repo/schema),
  `packages/core-auth/`, `postgres/schema.sql`

## Bối cảnh

ADR-0001 đã chốt hub + subdomain mỗi môn, monorepo, và tách schema DB theo môn. ADR đó
**chưa** nói cụ thể user/session/gói cước sẽ tổ chức lại thế nào để phục vụ nhiều môn — đây
là phần bù cho khoảng đó.

Hiện trạng (đọc từ code, không suy đoán):

- **Đăng nhập:** `public.users` có 4 cột `google_id`/`facebook_id`/`apple_id`/`microsoft_id`
  (thêm dần qua migration `0020`, `0022`) — mỗi provider mới phải ALTER bảng lõi.
- **Phiên:** Bearer token lưu ở client (`localStorage`, xem comment `authService.ts:2-5`),
  không phải cookie — bị cô lập theo origin, không SSO được giữa các subdomain.
- **Gói cước:** `profiles.plan` là 1 chuỗi (`'free'|'pro'|'vip'`) — chỉ diễn tả được một gói
  cho toàn bộ tài khoản, không diễn tả được "Pro môn Anh nhưng Free môn Toán".
- **Hồ sơ:** `profiles` gộp tên hiển thị + gói cước, chưa có chỗ cho dữ liệu riêng từng môn.

Khi mở môn thứ 2 (Toán), 4 vấn đề trên sẽ chặn cứng: không SSO nghĩa là mỗi môn một lần đăng
nhập (trải nghiệm tệ, đúng thứ nền tảng multi-subject cần tránh); `plan` dạng cột đơn không
bán được gói theo môn.

## Quyết định

Tổ chức lại user thành **4 lớp**, thi hành **6 bước nhỏ, mỗi bước 1 PR độc lập chạy được**,
không gộp tính năng mới vào PR hạ tầng (giữ đúng tinh thần "refactor thuần, không hồi quy"
của ADR-0001).

**Lớp 1 — Danh tính:** bảng `public.identities(provider, provider_user_id, user_id, email,
linked_at)`, khoá chính `(provider, provider_user_id)`. Thay 4 cột cứng trên `users`. Cho phép
liên kết nhiều kênh đăng nhập vào 1 tài khoản (đã có sẵn qua logic nối bằng email trùng ở
`findOrCreateOAuthUser`, chỉ đổi NƠI LƯU).

**Lớp 2 — Phiên & SSO:** đổi `sessions` từ Bearer/`localStorage` sang cookie
`HttpOnly; Secure; SameSite=Lax; Domain=.donghanhcungban.org`. Vì mọi subdomain đi qua 1 tiến
trình Express (ADR-0001 "mức 2"), SSO gần như miễn phí. Thêm `device`/`ip_hash`/`last_seen_at`
cho màn "thiết bị đang đăng nhập".

**Lớp 3 — Hồ sơ:** `core.profiles` (tên, avatar, theme, ngôn ngữ, trạng thái tài khoản) tách
khỏi hồ sơ riêng từng môn (`english.user_profile`, `math.user_profile`, …).

**Lớp 4 — Quyền lợi:** thay `profiles.plan` bằng
`core.entitlements(user_id, product, tier, source, granted_at, expires_at)` — `product` =
`'platform'` hoặc tên môn, `tier` = `'free'|'pro'|'vip'`. Kiểm quyền = tier cao nhất giữa
`product` cụ thể và `'platform'`. Giữ `profiles.plan` như cột/view tương thích để không phá
app tiếng Anh đang chạy thật.

## Kế hoạch 6 bước

| #   | Nội dung                                                                                             | Trạng thái              |
| --- | ---------------------------------------------------------------------------------------------------- | ----------------------- |
| 1   | `identities` + backfill từ 4 cột cũ; `findOrCreateOAuthUser` dual-write (ghi cả cột cũ lẫn bảng mới) | Xong                    |
| 2   | `entitlements` + backfill từ `profiles.plan`                                                         | Xong                    |
| 3   | Cookie SSO song song Bearer (chấp nhận cả 2 trong giai đoạn chuyển tiếp)                             | Xong                    |
| 4   | Tách `core.profiles` vs hồ sơ riêng từng môn                                                         | Xong                    |
| 5   | `roles` (quyền quản trị theo môn) + `audit_log` + registry xoá tài khoản                             | **Bỏ qua (2026-08-08)** |
| 6   | Bỏ Bearer, bỏ 4 cột provider cũ trên `users`                                                         | **Chặn — xem dưới**     |

Bước 1–2 làm ngay vì dữ liệu còn ít, dễ backfill/rollback. Bước 3 là điều kiện bắt buộc
trước khi mở môn thứ hai (SSO là giá trị lớn nhất của "một tài khoản, nhiều môn").

**Bước 5 — quyết định bỏ qua (2026-08-08):** khác Bước 1–4 (đều có dữ liệu THẬT để backfill),
Bước 5 không có tính năng nào đang chạy để nối vào — quyền admin hiện là danh sách email cố
định trong `.env` (`isAdminEmail()`, `packages/core-auth/adminAuth.ts`), không phải bảng DB;
và **chưa hề có tính năng xoá tài khoản** trong toàn bộ codebase. Dựng sẵn bảng `roles`/
`audit_log` rỗng lúc này là hạ tầng cho tính năng chưa tồn tại — vi phạm nguyên tắc "không
triển khai dở dang" (CLAUDE.md mục 4). Làm THẬT khi có yêu cầu cụ thể (vd cần admin theo môn,
hoặc làm tính năng xoá tài khoản).

**Bước 6 — CHẶN, cần xác nhận riêng trước khi làm:** app tiếng Anh — client DUY NHẤT đang chạy
thật — vẫn gửi `Authorization: Bearer` cho MỌI request, chưa có gì đổi sang thuần cookie. Bỏ
Bearer lúc này nghĩa là khoá đăng nhập của mọi người dùng thật đang trả tiền ngay lập tức, vì
server sẽ không nhận Bearer nữa mà client chưa có đường thay thế. Giá trị thật của cookie SSO
(Bước 3) chỉ phát huy khi có subdomain môn thứ 2 tồn tại và xác thực bằng cookie — hiện chưa
có app nào như vậy. Bỏ Bearer bây giờ là dọn dẹp cho tình huống chưa xảy ra, đồng thời là thay
đổi khó hoàn tác trên hệ thống có người dùng thật (CLAUDE.md mục 12) → PHẢI dừng hỏi lại, KHÔNG
tự làm, và chỉ nên làm SAU KHI mở môn thứ 2 + xác nhận cookie SSO hoạt động đúng trong thực tế.

## Bước 1 — chi tiết đã thi hành

- Migration `postgres/migrations/0034_identities.sql`: tạo bảng `identities`, backfill từ
  `google_id`/`facebook_id`/`apple_id`/`microsoft_id`, idempotent.
- `packages/core-auth/authService.ts` (`findOrCreateOAuthUser`, hàm mới `upsertIdentity`):
  mọi lần tìm-thấy/liên-kết/tạo-mới user qua OAuth đều ghi thêm 1 dòng `identities` — dữ liệu
  cũ tự "đầy" dần qua lượt đăng nhập thật, không cần chạy lại migration.
- **Không đổi hành vi đọc** — `users.google_id`... vẫn là nguồn sự thật cho lần đăng nhập kế
  tiếp (tránh 2 nguồn sự thật lệch nhau trong lúc chuyển tiếp). Bước 6 mới đổi chiều đọc sang
  `identities` rồi xoá cột cũ.
- 4 cột cũ **giữ nguyên**, không xoá — an toàn rollback deploy này mà không mất dữ liệu.

## Bước 2 — chi tiết đã thi hành

- Migration `postgres/migrations/0035_entitlements.sql`: tạo bảng `entitlements`, backfill 1
  dòng `product='platform'` cho mỗi user từ `profiles.plan`/`plan_expires_at`.
- **Không đổi bất kỳ code đọc/ghi gói cước nào** — khác Bước 1 (đã dual-write ngay),
  bước này CHỈ thêm dữ liệu vì `profiles.plan` đụng trực tiếp tới billing/usage/admin
  (`packages/core-billing`, `api/payment-webhook.ts`, `api/admin-grant-plan.ts`…) — đổi nơi
  đọc là thay đổi rủi ro cao liên quan tiền thật, để dành một bước riêng có audit kỹ hơn,
  không gộp vào PR thuần hạ tầng này.
- Hệ quả: bảng `entitlements` sau bước này CHƯA được ai đọc — chỉ là dữ liệu backfill một lần,
  sẽ LỆCH dần với `profiles.plan` nếu gói cước đổi (mua thêm, admin cấp tay, hết hạn…) vì
  không có dual-write. Chấp nhận vì mục tiêu Bước 2 là bảng có tồn tại + đúng schema,
  chưa phải nguồn sự thật. Trước khi bất kỳ code nào bắt đầu ĐỌC bảng này, phải thêm dual-write
  (giống cách Bước 1 làm cho `identities`) hoặc backfill lại — ghi rõ ở bước rewiring kế tiếp.

## Bước 3 — chi tiết đã thi hành

Quyết định chốt trước khi code (2026-08-08): **domain cookie `Domain=.donghanhcungban.org`
ngay từ đầu** (không để hẹp `en-vi.donghanhcungban.org` rồi sửa lại sau — hiện tại chỉ có
`en-vi.` dùng domain cha nên không subdomain nào khác bị ảnh hưởng bởi việc share sớm), và
**dual-accept**: Bearer vẫn là cơ chế chính, cookie chỉ thêm song song.

- `packages/core-auth/sessionCookie.ts` (mới): `buildSessionCookie()`/`buildClearSessionCookie()`
  dựng header `Set-Cookie` (`HttpOnly; SameSite=Lax`, kèm `Secure`+`Domain` CHỈ khi
  `NODE_ENV`/`VERCEL_ENV`=`production` — dev local qua `http://localhost` sẽ bị trình duyệt từ
  chối cookie `Secure`); `readSessionCookie()` tự parse header `Cookie` (Web API `Request`
  không có sẵn, khác Express `req.cookies`).
- `packages/core-auth/authService.ts`: xuất `SESSION_TTL_MS` để cookie dùng đúng thời hạn với
  session thật trong bảng `sessions` — không phải cơ chế phiên thứ hai, chỉ 2 cách gửi cùng 1
  token.
- `packages/core-auth/security.ts` (`validateAuth`): đọc `Authorization: Bearer` trước
  (KHÔNG đổi thứ tự ưu tiên); thiếu mới thử cookie. `getCorsHeaders()` giữ nguyên logic
  `Access-Control-Allow-Credentials` đã có (chỉ bật khi origin nằm trong whitelist), cập nhật
  lại comment vì giờ có cookie thật sự dùng credentials.
- `packages/core-auth/auth.ts`: mọi phản hồi tạo phiên thành công (register/login/4 kênh OAuth)
  gắn thêm `Set-Cookie` bên cạnh `token` có sẵn trong body — client hiện tại (Bearer) không cần
  đổi gì, cookie chỉ để trình duyệt tự lưu. `logout` thu hồi ĐÚNG session dù đến từ Bearer hay
  cookie, luôn xoá cookie phía trình duyệt.
- **Không đổi client** (`apps/english/src/lib/auth.ts`) — vẫn gửi/đọc Bearer y hệt trước. Cookie
  hiện tại là hạ tầng "ngủ", chưa app con nào dùng tới — chỉ có tác dụng khi mở subdomain thứ 2
  và app đó gọi API bằng `fetch(..., { credentials: 'include' })`.
- Test mới `sessionCookie.test.ts` (8 case) + bổ sung `security.test.ts` (3 case dual-accept:
  chỉ cookie, có cả 2 ưu tiên Bearer, cookie sai tên). Bắt được 1 lỗi thật lúc viết test: kiểm
  tra môi trường production ban đầu viết `if (isProduction)` (tham chiếu hàm, luôn truthy) thay
  vì `if (isProduction())` — sẽ khiến cookie LUÔN gắn `Secure`, kể cả ở dev, làm hỏng đăng nhập
  qua `http://localhost`. Sửa trước khi merge.

## Bước 4 — chi tiết đã thi hành

- Migration `postgres/migrations/0036_english_user_profile.sql`: tạo bảng
  `english.user_profile(user_id, user_level, goal, daily_minutes, age_group)`, backfill từ
  4 cột cùng tên trên `public.profiles`.
- **Không đổi code đọc/ghi** — cùng nguyên tắc thận trọng đã áp cho Bước 2: `api/profile.ts`
  (onboarding, đổi nhóm tuổi) vẫn đọc/ghi 4 cột cũ trên `profiles`, KHÔNG chuyển sang bảng mới
  ở PR này. 4 cột này là dữ liệu ONBOARDING RIÊNG của việc học tiếng Anh (`user_level` là
  trình độ tự chọn thô lúc mới vào, không phải cấp CEFR chính thức; `goal`/`daily_minutes` là
  tốc độ học) — môn tiếp theo sẽ có onboarding khác hẳn, không tái dùng được các cột này.
- **Không đụng đến các cột lõi khác trên `profiles`** (`name`, `plan`, `plan_expires_at`,
  `onboarded`, `nickname`, `referral_code`…) — việc phân loại cột nào thuộc lõi/thuộc môn cho
  TOÀN BỘ `profiles` là quyết định lớn hơn phạm vi 1 bảng, để dành khi rewiring thật.
- Cùng hệ quả LỆCH DẦN như Bước 2: bảng `english.user_profile` sẽ cũ dần nếu người dùng đổi
  onboarding (goal/daily_minutes) sau lần backfill, vì chưa có dual-write. Chấp nhận vì mục
  tiêu bước này là bảng tồn tại đúng schema, chưa phải nguồn sự thật.

## Hệ quả

**Tích cực:** thêm provider đăng nhập mới (Zalo, X…) sau này = 1 dòng code, 0 migration ALTER
bảng lõi. Đường tới SSO (Bước 3) đã có chỗ đặt session mở rộng.

**Đánh đổi:** 6 bước là refactor trải dài, không có tính năng mới cho người dùng ở giữa
chừng — chấp nhận, giống đánh đổi đã ghi ở ADR-0001 cho GĐ1 tách lõi. Giai đoạn dual-write
(cột cũ + bảng mới) làm tăng nhẹ số query mỗi lần đăng nhập OAuth — chấp nhận vì tần suất thấp
(chỉ lúc đăng nhập, không phải mỗi request).
