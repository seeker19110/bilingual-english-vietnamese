# ADR-0002: Quản lý người dùng cho nền tảng đa lĩnh vực

- **Trạng thái:** Đang thi hành (Bước 1/6)
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

| #   | Nội dung                                                                                             | Trạng thái            |
| --- | ---------------------------------------------------------------------------------------------------- | --------------------- |
| 1   | `identities` + backfill từ 4 cột cũ; `findOrCreateOAuthUser` dual-write (ghi cả cột cũ lẫn bảng mới) | **Đang làm — PR này** |
| 2   | `entitlements` + backfill từ `profiles.plan`; giữ view tương thích                                   | Chưa làm              |
| 3   | Cookie SSO song song Bearer (chấp nhận cả 2 trong giai đoạn chuyển tiếp)                             | Chưa làm              |
| 4   | Tách `core.profiles` vs hồ sơ riêng từng môn                                                         | Chưa làm              |
| 5   | `roles` (quyền quản trị theo môn) + `audit_log` + registry xoá tài khoản                             | Chưa làm              |
| 6   | Bỏ Bearer, bỏ 4 cột provider cũ trên `users`                                                         | Chưa làm              |

Bước 1–2 làm ngay vì dữ liệu còn ít, dễ backfill/rollback. Bước 3 là điều kiện bắt buộc
trước khi mở môn thứ hai (SSO là giá trị lớn nhất của "một tài khoản, nhiều môn").

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

## Hệ quả

**Tích cực:** thêm provider đăng nhập mới (Zalo, X…) sau này = 1 dòng code, 0 migration ALTER
bảng lõi. Đường tới SSO (Bước 3) đã có chỗ đặt session mở rộng.

**Đánh đổi:** 6 bước là refactor trải dài, không có tính năng mới cho người dùng ở giữa
chừng — chấp nhận, giống đánh đổi đã ghi ở ADR-0001 cho GĐ1 tách lõi. Giai đoạn dual-write
(cột cũ + bảng mới) làm tăng nhẹ số query mỗi lần đăng nhập OAuth — chấp nhận vì tần suất thấp
(chỉ lúc đăng nhập, không phải mỗi request).
