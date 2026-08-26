# PR 1/3 — Backend Real-time Chat: WebSocket + Content Moderation (2026-08-17)

Tiếp nối PR 0 (hệ thống bạn bè, đã tạo PR #602). PR này làm backend chat 1-1 real-time:

- Migration `postgres/migrations/0054_chat.sql` (đổi số từ 0053 dự kiến ban đầu vì phát hiện
  nhánh `feat/chat-feature` khác cũng dùng 0053 cho mục đích khác — xem quyết định dưới) — schema
  `chat.*`: `rooms`/`room_members`/`messages` (content + content_clean sau lọc + moderation_flags
  - is*blocked)/`moderation_events`, kèm view `public.chat*\*`theo đúng quy ước`english.chat_sessions` cũ.
- `packages/core-chat/moderator.ts` + `wordlist-vi.ts`/`wordlist-en.ts`: chuẩn hoá token (bỏ dấu,
  gộp ký tự lặp, leetspeak cơ bản), so khớp theo token + cặp token liền kề (bắt cụm 2 từ như "óc
  chó", dùng so khớp CHÍNH XÁC cho cặp để tránh báo nhầm khi 2 từ vô hại ghép lại trùng ngẫu nhiên
  với 1 từ xấu ngắn hơn — vd "mày"+"ngu"). severity low/medium → mask `***`; high → chặn hẳn.
- `packages/core-chat/chatService.ts`: `createOrGetDmRoom` **gọi `areFriends()` trước khi tạo
  phòng** (đúng quyết định "chỉ chat được với bạn bè"), `sendMessage` (chạy qua moderation trước
  khi lưu), `getMessages`/`getRooms`/`markRead`/`deleteMessage`, mọi thao tác tự kiểm thành viên
  phòng.
- `packages/core-chat/redisChat.ts`: pub/sub theo kênh `chat:user:<userId>` — có Redis thật thì
  dùng `ioredis`, chưa có `REDIS_URL` thì tự fallback sang EventEmitter nội bộ (chỉ hoạt động
  trong 1 tiến trình PM2). **[Cập nhật 2026-08-21] VPS đã nâng 3 vCPU, PM2 cluster mode nay chạy
  thật 3 instances** (CLAUDE.md mục 13) và `REDIS_URL` đã được điền cho rate-limit — vì dùng
  chung biến môi trường, `redisChat.ts` cũng tự lên Redis thật theo, không cần sửa code. **Cần
  xác nhận lại bằng smoke test thật** (gửi tin nhắn, kiểm tin đến đúng ở tiến trình PM2 khác) vì
  trước đây tính năng fallback EventEmitter chưa từng bị stress test đa tiến trình — nếu vì lý do
  nào đó Redis không kết nối được, chat giữa 2 người sẽ chỉ nhận tin khi trúng cùng 1 trong 3
  tiến trình (im lặng, khó phát hiện).
- `packages/core-chat/wsHandler.ts`: gắn WebSocket vào CHÍNH `http.Server` của `server.ts` (không
  mở cổng riêng), path `/ws/chat`; auth qua cookie HttpOnly (đọc header `cookie` của upgrade
  request, tái dùng `validateAuth()` sẵn có bằng cách dựng 1 Web Request tối giản); presence
  online/offline phát cho các "bạn cùng phòng chat" khi kết nối/ngắt kết nối.
  Sự kiện: `message`/`typing`/`read`/`ping` (client→server), `message`/`typing`/`read`/`presence`/
  `error`/`pong` (server→client).
- `packages/core-contracts/chat.ts`: Zod schema cho WS events (discriminated union) + REST
  (`CreateRoomBodySchema`, `GetMessagesQuerySchema`).
- `api/chat.ts`: REST 1 endpoint nhiều method theo đúng khuôn `api/friends.ts` (server.ts không có
  wildcard route) — `GET /api/chat` (danh sách phòng), `GET /api/chat?roomId=` (lịch sử tin nhắn),
  `POST /api/chat {targetUserId}` (tạo/lấy phòng DM, chỉ với bạn bè), `DELETE /api/chat?messageId=`.
  Mount vào `server.ts` cùng `attachChatWebSocketServer(server)`.
- Thêm dependency trực tiếp `ws` + `@types/ws` vào `package.json` (trước đó chỉ là transitive).
- **Quyết định trong phiên:** phát hiện nhánh `feat/chat-feature` (không có PR mở) đã tự làm toàn
  bộ chat trong 1 commit nhưng **KHÔNG giới hạn theo bạn bè** (cho phép DM bất kỳ ai) — trái với
  quyết định đã chốt cùng người dùng. Người dùng xác nhận **bỏ qua nhánh đó** (không xoá, không
  lấy code), tiếp tục làm đúng kế hoạch 3 PR trên nhánh `claude/chat-feature-az268d`.
- **Quality Gates**: `npm run build` ✅ (Client/Server/Hub, gồm `tsc -p tsconfig.server.json` xác
  nhận `ioredis` import đúng kiểu `{ Redis }` chứ không phải default import) · `npm run typecheck`
  ✅ (0 lỗi, 4 tsconfig) · `npm run lint` ✅ (0 cảnh báo) · `npm run format:check` ✅ · `npm test`
  ✅ **4.202/4.202 test** (273→278 file test, +5 file mới: `moderator.test.ts`,
  `chatService.test.ts`, `redisChat.test.ts`, `wsHandler.test.ts`, `api/chat.test.ts`).

**Còn lại theo kế hoạch (chưa làm ở PR này):**

- **PR 2 — Frontend Chat UI**: `ChatPage.tsx` + components (`ChatList`/`ChatWindow`/
  `MessageBubble`/`MessageInput`/`PresenceDot`), `useChat.ts` hook nối WebSocket, route `/chat`
  (chỉ hiện bạn bè đã kết bạn qua `/ban-be` làm danh sách người có thể nhắn), E2E test.
- ⚠️ Việc tay sau này: cài Redis + `REDIS_URL` trên VPS để fan-out multi-instance hoạt động thật
  (trước đó vẫn chạy được nhờ fallback single-process, chỉ chưa scale nhiều tiến trình). Chạy
  `npm run migrate:pg` để áp migration `0054_chat.sql`.
