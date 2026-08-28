# 0192 — Nạp lại "cờ đã đăng nhập" khi mở subdomain khác

- **Ngày:** 2026-08-28
- **Đặc tả:** `docs/specs/2026-08-28-subdomain-theo-tru.md` §⑤ (bất biến chặn đợt 2)
- **Vì sao làm trước:** đây là điều kiện chặn của việc chuyển `/mon-hoc` sang
  `hoc-tap.donghanhcungban.org` — trang đó nằm sau `RequireAuth`. Người dùng chốt tách thành PR
  riêng, làm trước, để thay đổi chạm mọi người dùng không trộn với thay đổi định tuyến.

## ĐÍNH CHÍNH một chẩn đoán sai (quan trọng hơn chính bản vá)

Changelog 0191 và `PROGRESS.md` từng ghi: _"`validateAuth` chấp nhận cookie khi thiếu Bearer"_.
**Sai.** Đó là mô tả cơ chế dual-accept của **Bước 3**, nhưng **Bước 6**
(`docs/adr/0002-quan-ly-nguoi-dung.md`) đã bỏ hẳn Bearer từ lâu: `validateAuth` **chỉ** đọc
cookie `session_token`, header `Authorization` bị bỏ qua hoàn toàn.

Đo trực tiếp trên server đã build với Postgres thật (đăng ký user, đăng nhập, giữ cookie):

| Gọi `/api/auth?action=me` với | Kết quả |
| ----------------------------- | ------- |
| CHỈ cookie, không Bearer      | **200** |
| CHỈ Bearer, không cookie      | **401** |

Hệ quả với chẩn đoán ban đầu: **API trên subdomain mới vốn ĐÃ xác thực được** — cookie
`Domain=.donghanhcungban.org` đi theo mọi subdomain, và request từ SPA tới `/api/*` là
same-origin nên trình duyệt gửi cookie mặc định. Không có gì hỏng ở tầng xác thực.

Chỗ thật sự hỏng hẹp hơn nhiều và nằm ở **client**: app dùng _"có token trong `localStorage`
không"_ làm cờ đã-đăng-nhập, mà `localStorage` **cô lập theo origin**. Trên `hoc-tap.` kho cục
bộ rỗng ⇒ `getCurrentUser()` thoát sớm và trả `null` (giao diện hiện người dùng thành khách),
còn `cloud.ts` · `challengeCloud.ts` · `tutorFeedback.ts` lặng lẽ bỏ qua đồng bộ — trong khi
mọi lệnh gọi API vẫn đang chạy với đúng danh tính đó.

> Bài học lặp lại đúng bài của audit: **comment mô tả cơ chế cũ vẫn nằm nguyên trong file sau
> khi cơ chế đã đổi.** `sessionCookie.ts` đầu file vẫn tả dual-accept của Bước 3; đọc nó rồi tin
> là đủ thì chẩn đoán sai. Chỉ phép đo trên server thật mới lộ ra.

## Đã làm

**Server — `packages/core-auth/auth.ts`:** thêm action `session-from-cookie` (POST).
Đọc cookie → `validateSessionToken` → trả `authResponse(cookieToken, user, profile)`.

- **KHÔNG tạo phiên mới:** cookie CHÍNH LÀ session token, nên chỉ trả lại đúng token đó sau khi
  xác minh. Không thêm bản ghi `sessions`, không kéo dài hạn. Có test canh bất biến này.
- **POST chứ không GET:** `SameSite=Lax` không gửi cookie kèm POST từ site khác, nên site lạ
  không gọi được. GET thì cookie vẫn đi theo điều hướng cấp cao nhất (CORS chặn đọc phản hồi,
  nhưng POST đóng cửa sớm hơn một lớp).
- Mọi đường lỗi đều trả **401 `Unauthorized`** giống hệt nhau, không phân biệt "thiếu cookie" /
  "cookie hết hạn" / "user đã xoá" — không cho dò trạng thái.

**Client — `packages/core-ui/clientAuth.ts`:** `getCurrentUser()` không còn thoát sớm khi
`localStorage` rỗng; nó hỏi cookie đúng một lần rồi lưu cờ lại. Nhờ vậy **không phải sửa rải
rác** những chỗ tự kiểm `getStoredToken()`. Lỗi mạng ở bước này trả `null` chứ không ném ra
ngoài, để `AuthProvider` vẫn dựng được giao diện nhánh chưa-đăng-nhập.

## Một test cũ phải sửa — và vì sao đó là đúng chứ không phải "sửa cho xanh"

`apps/dhcb/src/lib/auth.test.ts` có ca **"chưa đăng nhập (không có token) → trả null, KHÔNG gọi
fetch"**. Ca này canh đúng cái giả định sai mà bản vá này gỡ bỏ: _kho cục bộ rỗng ⇒ chưa đăng
nhập_. Đã viết lại thành **"không token và cookie cũng không hợp lệ → null, đúng MỘT lượt hỏi
cookie"** — vẫn chặn hồi quy "gọi mạng thừa", nhưng theo sự thật mới.

## Bằng chứng

**Test canh gác — cả hai phía đã chứng minh ĐỎ trước khi vá, XANH sau:**

- Client (4 ca mới): hoàn nguyên `getCurrentUser()` về hành vi cũ → **3 ca đỏ**; khôi phục → 22/22 xanh.
- Server (6 ca mới): bỏ khối handler → **5 ca đỏ**; khôi phục → 34/34 xanh.

**Đo trên server đã build (Postgres tạm, user thật):**

| Phép thử                                                | Kết quả                        |
| ------------------------------------------------------- | ------------------------------ |
| Không cookie → `session-from-cookie`                    | 401                            |
| Cookie rác → `session-from-cookie`                      | 401 `{"error":"Unauthorized"}` |
| GET thay vì POST                                        | 405                            |
| Cookie hợp lệ → token trả về so với token phiên đang có | **khớp** (không tạo phiên mới) |
| Sau `logout`, dùng lại cookie cũ                        | 401                            |

**Cổng:**

```
Build ✅ | Type ✅ | Lint ✅ (0 cảnh báo) | Format ✅ | Test ✅ (7606/7606, 500 file)
```

## Còn lại

Việc chuyển `/mon-hoc` → `hoc-tap.donghanhcungban.org` (bỏ tiền tố, 301 từ URL cũ) nay đã hết
điều kiện chặn — làm ở PR kế tiếp.
