# Platform Enhancement — Deep Health Telemetry & Offline Chat Web Push (2026-08-18)

Hoàn thiện hệ thống giám sát sức khỏe chuyên sâu và thông báo đẩy khi có tin nhắn mới cho người dùng offline:

- `api/healthDeep.ts`: Endpoint `GET /api/health/deep` kiểm tra sức khỏe chuyên sâu của CSDL PostgreSQL (`SELECT 1` ping + pool metrics), Storage (R2/Local), Cache (Redis/In-memory), Memory (RSS, Heap), Uptime, trả về HTTP 200 (healthy) hoặc 503 (unhealthy/degraded).
- `api/healthDeep.test.ts`: 4 unit tests kiểm thử các kịch bản database up/down và phương thức HTTP.
- `packages/core-chat/chatPush.ts`: Module `notifyOfflinePeers` tự động phát hiện người nhận đang offline (`isOnline(peerId) === false`), truy vấn `push_subscriptions`, gửi Web Push Notification dẫn trực tiếp tới `/tin-nhan?roomId=<roomId>`, và tự động dọn dẹp subscription hết hạn (410/404).
- `packages/core-chat/chatPush.test.ts`: 4 unit tests kiểm thử việc gửi push, bỏ qua khi online và dọn subscription hết hạn.
- `packages/core-chat/wsHandler.ts`: Tích hợp `notifyOfflinePeers` vào luồng tin nhắn real-time WebSocket.
- `public/sw.js`: Nâng cấp Service Worker xử lý linh hoạt `tag` và `renotify` cho thông báo chat và nhắc học.
- `server.ts` & `api/routes-registered.test.ts`: Đăng ký route và kiểm tra toàn vẹn API routing.
- **Quality Gates**:
  - `npm test`: **4.256 / 4.256 tests passed 100%** trên 285 test files.
  - `npm run typecheck`: passed 100% (0 errors trên 4 tsconfigs).
  - `npm run lint`: passed 100% (0 warnings, 0 errors).
  - `npm run format:check`: passed 100% (All matched files use Prettier style).
  - `npm run build`: passed 100% (Client Vite SPA, Server `dist-server/`, Hub workspace).
