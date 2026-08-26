# PR 2/3 — Frontend Chat UI: Real-time User-to-User Chat (2026-08-18)

Hoàn thiện giao diện nhắn tin thời gian thực 1-1 giữa người dùng đã kết bạn, đồng bộ với WebSocket `/ws/chat`, REST API `/api/chat`, và hệ thống bạn bè `/api/friends`:

- `apps/english/src/lib/chatApi.ts`: REST client (`fetchRooms`, `fetchMessages`, `createOrGetDmRoom`, `deleteChatMessage`).
- `apps/english/src/lib/useChat.ts`: Hook kết nối WebSocket `/ws/chat` với auto-reconnect backoff, heartbeat ping, đồng bộ tin nhắn, trạng thái trực tuyến (`presence`), người đang gõ (`typing`), gửi read receipts, tạo phòng DM và xoá tin nhắn.
- `apps/english/src/lib/chatFormatters.ts`: Tiện ích định dạng thời gian và màu sắc avatar cho hội thoại.
- Components Chat UI:
  - `PresenceDot.tsx`: Chấm hiển thị online/offline (hiệu ứng ping xanh emerald).
  - `MessageBubble.tsx`: Bong bóng tin nhắn người gửi / nhận, hiển thị badge "Đã lọc" cho nội dung mask `***`, nút xoá tin nhắn.
  - `MessageInput.tsx`: Khung soạn thảo tin nhắn tự co giãn dòng, Enter gửi, Shift+Enter xuống dòng, auto dispatch typing.
  - `ChatList.tsx`: Danh sách hội thoại kèm avatar, preview tin nhắn cuối, thời gian, số tin chưa đọc, thanh tìm kiếm và Friends Picker để bắt đầu chat mới.
  - `ChatWindow.tsx`: Khung chat chính, gom nhóm ngày, tự động cuộn xuống cuối khi có tin mới, typing indicator động.
- `apps/english/src/pages/ChatPage.tsx`: Trang tin nhắn tại route `/tin-nhan` với bố cục responsive cao cấp (2 cột trên desktop, 1 cột mượt mà trên mobile), hỗ trợ query params `?roomId=` và `?peerId=`.
- `e2e/chat.spec.ts`: 5 kịch bản E2E Playwright kiểm thử toàn diện luồng bạn bè, kết bạn qua mã QR, mở chat, gửi/nhận tin nhắn và lọc nội dung.
- Tích hợp điều hướng: Nút "Nhắn tin" trong danh sách bạn bè (`/ban-be`) và thẻ "Tin nhắn" trong Special Hubs trên trang cá nhân (`/profile`).
- **Quality Gates**:
  - `npm test`: **4.229 / 4.229 tests passed 100%** trên 282 test files.
  - `npm run typecheck`: passed 100% (0 errors trên 4 tsconfigs).
  - `npm run lint`: passed 100% (0 warnings, 0 errors).
  - `npm run format:check`: passed 100% (All matched files use Prettier style).
  - `npm run build`: passed 100% (Client, Server, Hub).
