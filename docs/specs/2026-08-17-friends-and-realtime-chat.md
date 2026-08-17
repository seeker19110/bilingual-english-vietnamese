# Spec: Hệ thống kết bạn + Real-time User-to-User Chat (PR 0 + PR 1/3)

**Trạng thái:** Approved for implementation
**Ngày:** 2026-08-17
**Tác giả:** Claude (phiên làm việc trực tiếp với chủ dự án — không phải audit trước)
**Người duyệt:** Chủ dự án (seeker19110), xác nhận qua các câu hỏi Q1–Q5 trong hội thoại
**Mục tiêu:** Cho phép 2 user đã kết bạn nhắn tin trực tiếp thời gian thực, có lọc nội dung
không văn minh (tiếng Việt + tiếng Anh).

## 1. Tóm tắt quyết định

Chủ dự án đưa ra kế hoạch gốc "Real-time User-to-User Chat với Content Moderation" (WebSocket,
Redis pub/sub, moderation VI+EN). Qua `AskUserQuestion`, các quyết định phạm vi đã chốt trực tiếp:

- **Q1 — Scope:** Chỉ DM 1-1 ở giai đoạn 1 (schema chừa chỗ group qua cột `is_group`, không dùng).
- **Q2 — Ai chat được với ai:** Chỉ user **đã kết bạn** (platform trước đó chưa có khái niệm bạn
  bè → phát sinh **PR 0** làm nền tảng kết bạn trước).
- **Kết bạn qua URL/mã QR** (chốt thêm sau đó): không qua luồng gửi/chấp nhận lời mời — chia sẻ
  link/QR là hành động chủ động, người quét xác nhận 1 lần là thành bạn ngay, đối xứng 2 chiều.
- **Q3 — Moderation:** Filter theo severity — low/medium mask `***` rồi vẫn gửi; high chặn hẳn +
  ghi nhận vi phạm (`chat.moderation_events`).
- **Q5 — Redis:** VPS **chưa có** `REDIS_URL` → bắt buộc có fallback broadcast trong 1 tiến trình,
  không được chặn cứng vào Redis.

## 2. Nghiên cứu hiện trạng

- Không có WebSocket/SSE nào trong codebase trước PR này (Companion dùng SSE riêng, không phải
  WS). `ws` + `@types/ws` đã là dependency transitive qua `ioredis`/tooling — nâng lên dependency
  trực tiếp.
- `ioredis` đã dùng cho rate-limit (`packages/core-auth/rateLimitStore.ts`) — chat dùng client
  Redis **riêng** (`packages/core-chat/redisChat.ts`) vì kết nối ở chế độ subscribe không dùng lại
  được cho lệnh thường.
- Auth toàn app là cookie HttpOnly (`packages/core-auth/security.ts#validateAuth`, đọc header
  `cookie`) — WS upgrade request tự gửi cookie, tái dùng được `validateAuth()` bằng cách dựng 1
  Web `Request` tối giản từ header của upgrade request.
- Phát hiện giữa chừng: nhánh `feat/chat-feature` (không có PR mở) đã tự làm toàn bộ chat trong 1
  commit nhưng **không giới hạn theo bạn bè** — trái quyết định Q2. Chủ dự án xác nhận bỏ qua
  nhánh đó, tiếp tục đúng kế hoạch 3 PR trên nhánh này.

## 3. Phương án và quyết định

| Phương án                         | Kết luận                                                                                                  |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| WebSocket (`ws`)                  | **Chọn** — bidirectional (typing/read receipt/presence), latency thấp hơn SSE polling, nhẹ hơn Socket.io. |
| SSE + polling                     | Không chọn — không hợp cho typing indicator/presence 2 chiều thời gian thực.                              |
| Chat mở cho mọi user              | Không chọn — Q2 chốt chỉ bạn bè.                                                                          |
| Kết bạn qua gửi/chấp nhận lời mời | Không chọn — chốt dùng link/QR, đơn giản hơn, đúng UX "chia sẻ = đồng ý".                                 |

## 4. Scope

### In scope (PR 0 + PR 1)

- Hệ thống kết bạn qua mã/URL/QR (`profiles.friend_code`, bảng `friendships`).
- Backend chat: schema `chat.*`, moderation VI+EN theo severity, WebSocket real-time, REST lịch
  sử/room list, Redis pub/sub có fallback single-process.

### Không làm (để lại PR 2 hoặc giai đoạn sau)

- Frontend Chat UI (`ChatPage.tsx`, `useChat.ts`, route `/chat`) — **PR 2**, làm sau khi PR này
  merge.
- Group chat, gửi file/ảnh trong chat.
- Cài Redis thật + `REDIS_URL` trên VPS (việc tay, ghi trong PROGRESS.md).

## 5. Kiến trúc, API và data contract

- Migration `0053_friends.sql` (bạn bè) + `0054_chat.sql` (chat).
- `api/friends.ts`, `api/chat.ts`: REST 1-endpoint-nhiều-method theo đúng khuôn hiện có của repo
  (server.ts không có wildcard route).
- `packages/core-chat/wsHandler.ts`: WS gắn vào `http.Server` có sẵn của `server.ts`, path
  `/ws/chat`, sự kiện `message`/`typing`/`read`/`ping` (client→server),
  `message`/`typing`/`read`/`presence`/`error`/`pong` (server→client) — Zod contract ở
  `packages/core-contracts/chat.ts`.
- `packages/core-chat/chatService.ts`: mọi thao tác đọc/ghi phòng tự kiểm thành viên; tạo phòng
  DM gọi `areFriends()` (từ `api/_lib/friends.ts`).

## 6. Security, privacy

- WS auth qua cookie HttpOnly, không tin client gửi userId.
- Rate limit theo IP cho `/api/friends` (30/phút) và `/api/chat` (60/phút), dùng
  `checkRateLimit()` sẵn có.
- Nội dung vi phạm nặng (`severity: high`) không lưu nội dung gốc ra broadcast, chỉ lưu để audit
  (`chat.moderation_events`).

## 7. Test plan

| Lớp  | Trường hợp                                                                                                | Bằng chứng                                                                                                      |
| ---- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Unit | Kết bạn idempotent, không tự kết bạn, moderation mask/block, chỉ tạo DM room giữa bạn bè, WS auth/routing | `api/_lib/friends.test.ts`, `api/friends.test.ts`, `packages/core-chat/*.test.ts`, `api/chat.test.ts` (82 test) |
| E2E  | (PR 2 sẽ bổ sung khi có UI)                                                                               | —                                                                                                               |

## 8. Rollout và rollback

- Mức rủi ro thấp — hoàn toàn additive (bảng/cột/route mới), không sửa API/bảng hiện có.
- Rollback: revert PR, migration idempotent (`if not exists`), không có FK từ bảng khác vào bảng
  mới nên xoá không ảnh hưởng dữ liệu cũ.
- Việc tay sau merge: `npm run migrate:pg` trên VPS để áp `0053`/`0054`; cài Redis + set
  `REDIS_URL` để fan-out multi-instance (không bắt buộc ngay, có fallback).

## 9. Phê duyệt

- [x] Product outcome và scope — chốt qua `AskUserQuestion` (Q1–Q5) trong hội thoại 2026-08-17.
- [x] Architecture/API/data — WS + Redis pub/sub có fallback, đúng convention repo.
- [x] Security/privacy — cookie auth, rate limit, moderation trước khi lưu.
- [x] Test — 82 unit test mới, đều xanh.
- [ ] E2E/UI — chưa có (PR 2 sẽ làm UI + E2E tương ứng).

**Kết luận:** Approved for implementation

**Người duyệt:** Chủ dự án (seeker19110)
**Ngày:** 2026-08-17
**Ghi chú:** Duyệt qua hội thoại trực tiếp (không qua PR review riêng cho spec) — xem
`PROGRESS.md` mục "PR 0/3" và "PR 1/3" để đối chiếu quyết định với implementation thực tế.
