# PR 0/3 — Hệ thống kết bạn qua mã/URL/QR (2026-08-17, nền tảng cho Real-time Chat)

Bước đầu của kế hoạch **"Real-time User-to-User Chat với Content Moderation"** (3 PR — chốt cùng
người dùng 2026-08-17): **PR 0 (hệ thống bạn bè) — PR 1 (backend chat WS+Redis) — PR 2 (frontend
chat UI)**. Quyết định phạm vi đã chốt: chỉ **DM 1-1** (schema chừa chỗ group sau), **chỉ chat được
giữa 2 user đã kết bạn** (nên phải xây bạn bè TRƯỚC), moderation **filter theo severity** (low/medium
che **\*, high chặn hẳn + ghi nhận vi phạm), **kết bạn qua URL/mã QR** (không qua luồng gửi/chấp nhận
lời mời — chia sẻ link đã là hành động chủ động, người quét xác nhận 1 lần là thành bạn ngay, đối
xứng 2 chiều). VPS **chưa có Redis\*\* → PR 1 sẽ cần fallback broadcast trong 1 process.

**PR 0 này đã xong:**

- Migration `postgres/migrations/0053_friends.sql`: cột `profiles.friend_code` (mã 8 ký tự, sinh
  lười giống `referral_code` ở migration 0007 nhưng KHÁC mục đích — không thưởng gì) + bảng
  `public.friendships` (cặp `user_id_a`/`user_id_b` **sắp thứ tự ở tầng ứng dụng**, không dùng
  CHECK ràng buộc thứ tự ở DB để tránh lệch collation giữa Postgres và so sánh chuỗi JS).
- `api/_lib/friends.ts`: `ensureFriendCode`, `findUserByFriendCode`, `addFriendByCode` (idempotent —
  gọi lại không lỗi, không tạo dòng trùng), `listFriends`, `removeFriend`, `areFriends` (hàm PR 1 sẽ
  dùng để chặn tạo phòng chat DM giữa người lạ).
- `api/friends.ts`: `GET /api/friends` (mã của mình + danh sách bạn), `GET /api/friends?lookup=CODE`
  (xem trước ai sở hữu mã), `POST /api/friends {code}` (kết bạn), `DELETE /api/friends?userId=`
  (huỷ kết bạn — đối xứng, ai gỡ cũng được không cần bên kia đồng ý). Mount vào `server.ts`.
  Unit test `api/_lib/friends.test.ts` + `api/friends.test.ts` (28 test).
- Frontend: `apps/english/src/lib/friends.ts` (client), trang `/ban-be` (`Friends.tsx` — hiện mã +
  QR (tái dùng thư viện `qrcode` đã có, xem `ShareProgress.tsx`) + copy link + danh sách bạn bè),
  trang `/ket-ban/:code` (`AddFriend.tsx` — mở khi bấm link/quét QR của người khác, xác nhận 1 lần
  là kết bạn xong). Thêm thẻ "Bạn bè" vào `Profile.tsx` (Personal Command Center).
- **Quality Gates**: `npm run build` ✅ (Client/Server/Hub) · `npm run typecheck` ✅ (0 lỗi, 4
  tsconfig) · `npm run lint` ✅ (0 cảnh báo) · `npm run format:check` ✅ · `npm test` ✅
  **4.146/4.146 test** (271→273 file test, +2 file mới).

**Còn lại theo kế hoạch:** PR 1 (backend chat) đã xong — xem mục PR 1/3 phía trên. Còn PR 2
(frontend chat UI).
