# Đặc tả GĐ 1 — nền tảng đa tiến trình cho mục tiêu 30k concurrent

> Đặc tả thi hành cho `docs/research/ke-hoach-scale-30k-concurrent.md` §3 GĐ1. Chia 2 việc độc lập:
> **Việc A** (build TS→JS + PM2 cluster mode) do phiên chính (Opus) tự làm — quyết định kiến trúc,
> đụng cấu hình deploy, từng gây crash production 2026-07-20 (xem `ecosystem.config.cjs`), rủi ro cao.
> **Việc B** (rate limit Map → Redis) đặc tả kín, giao `spec-executor`.

## Việc A — Build TS→JS + bật lại PM2 cluster mode (Opus tự làm, không giao)

### Bối cảnh

`ecosystem.config.cjs` chạy `tsx server.ts` trực tiếp (`script: './node_modules/.bin/tsx'`).
Comment trong file ghi rõ: đã thử cluster mode 1 lần (PR #283/#284), worker **crash im lặng** vì
`--import tsx` (ESM loader) không tương thích Node `cluster` module → rollback về fork mode (PR #285).

### Mục tiêu

Chạy app bằng **JS đã biên dịch sẵn** (không qua `tsx` loader lúc runtime) để cluster mode hoạt động,
tận dụng nhiều CPU core trên 1 máy.

### Việc cần làm

1. Thêm `tsconfig.server.json` riêng (KHÔNG đụng `tsconfig.json`/`tsconfig.api.json` hiện có —
   chúng cố tình `noEmit: true` để chỉ typecheck): `include: ["api", "server.ts"]`, `noEmit: false`,
   `outDir: "dist-server"`, giữ `module`/`moduleResolution` tương thích Node ESM. Lưu ý import trong
   `server.ts`/`api/*.ts` đã ghi đuôi `.js` sẵn (vd `./api/tts.js`) — thuận cho Node ESM resolution,
   kiểm tra `tsc` emit ra đúng cấu trúc thư mục giữ nguyên đường dẫn tương đối.
2. Thêm script `build:server` (chạy `tsc -p tsconfig.server.json`) — gọi trong `npm run build` hiện có
   (không phá `build` cũ, chỉ nối thêm bước).
3. Sửa `ecosystem.config.cjs`: `script: './dist-server/server.js'` (bỏ `interpreter: tsx`),
   `instances: 'max'`, `exec_mode: 'cluster'`. Cập nhật comment giải thích đã gỡ nguyên nhân crash cũ.
4. Cập nhật `docs/deploy-vps-ubuntu.md`: thêm bước `npm run build:server` (hoặc gộp vào `npm run build`
   đã có) TRƯỚC khi `pm2 reload`/`pm2 start` trên VPS.
5. **Kiểm chứng bắt buộc trước khi coi là xong**: chạy local `npm run build:server && pm2 start
ecosystem.config.cjs` (hoặc mô phỏng gần nhất có thể trong sandbox), xác nhận nhiều instance start
   OK, `pm2 logs` không crash, `/api/health` trả 200 từ mọi instance. Nếu sandbox không chạy được PM2
   thật, ít nhất chạy `node dist-server/server.js` trực tiếp (single) để xác nhận build chạy đúng, và
   ghi rõ trong PROGRESS.md rằng **cluster mode thật cần xác nhận lại trên VPS** trước khi coi nợ kỹ
   thuật này đã hết (không tự ý phán "đã xong" nếu chưa test được trên máy có PM2 thật).

### Tiêu chí chấp nhận

- `npm run build` (gộp `build:server`) chạy sạch, không lỗi type.
- `node dist-server/server.js` khởi động, `/api/health` trả 200, ít nhất 1 luồng request end-to-end
  (vd `/api/dictionary`) hoạt động đúng như chạy bằng `tsx`.
- `ecosystem.config.cjs` cập nhật cluster mode + comment giải thích, không xoá lịch sử ghi chú cũ (giữ
  làm bài học, chỉ thêm dòng mới nói đã gỡ nguyên nhân).
- KHÔNG đổi logic nghiệp vụ trong `api/*.ts` — chỉ đổi cách build/chạy.

## Việc B — Rate limit: in-memory Map → Redis (giao `spec-executor`)

### Bối cảnh

`api/_lib/security.ts:68` dùng `Map` in-memory cho `checkRateLimit()`. Khi chạy nhiều PM2 instance
(kết quả Việc A) hoặc nhiều máy, mỗi instance có Map riêng → rate limit **không còn đúng** (1 IP có
thể vượt giới hạn N lần = N instance). Đây là điều kiện bắt buộc trước khi chạy cluster mode ở tải thật.

### Phạm vi thay đổi

1. Thêm dependency `ioredis` vào `package.json` (bản ổn định mới nhất — kiểm tra npm trước khi ghim
   version, không đoán).
2. Thêm biến môi trường `REDIS_URL` (`.env.example` + comment tiếng Việt giải thích). **Không bắt
   buộc** — nếu không set, giữ nguyên hành vi Map in-memory hiện tại (fail-open về đúng cơ chế cũ,
   giống triết lý FAIL-OPEN đã dùng ở `usage.ts`/`refundUsage`) để không phá dev local/môi trường
   chưa có Redis.
3. Sửa `api/_lib/security.ts`:
   - `checkRateLimit()` chuyển thành **async**, `Promise<boolean>`.
   - Nếu có `REDIS_URL`: dùng lệnh Redis atomic (`INCR` + `EXPIRE` khi key mới, hoặc dùng Lua script
     / `multi()` để tránh race) theo đúng cửa sổ 60s hiện có (namespace key `bucket:ip`, giữ đúng ý
     nghĩa `maxPerMin`).
   - Nếu KHÔNG có `REDIS_URL` hoặc Redis lỗi kết nối (bắt lỗi, KHÔNG để crash request): fallback về
     `Map` in-memory hiện tại — log cảnh báo 1 lần (không spam log mỗi request), giữ code Map cũ làm
     phương án dự phòng, không xoá.
   - Giữ nguyên chữ ký gọi ở phía dùng: `checkRateLimit(ip, maxPerMin, bucket)` nhưng giờ phải
     `await`.
4. Cập nhật **toàn bộ 17 call site** đang gọi `checkRateLimit(...)` đồng bộ (liệt kê để không sót):
   `api/progress.ts`, `api/admin-grant-plan.ts`, `api/admin-settings.ts`, `api/leaderboard.ts`,
   `api/pronounce-assess.ts`, `api/profile.ts`, `api/auth.ts`, `api/tts.ts` (2 chỗ), `api/app-settings.ts`,
   `api/pronunciation.ts` (2 chỗ), `api/dictionary.ts`, `api/tutor-feedback.ts`, `api/stt.ts`,
   `api/history.ts`, `api/challenge.ts`, `api/ai.ts` — đổi `if (!checkRateLimit(...))` thành
   `if (!(await checkRateLimit(...)))`, đảm bảo handler bao quanh đã là `async function` (đa số đã là
   — kiểm tra từng file, KHÔNG giả định).
5. Cập nhật test:
   - `api/_lib/security.test.ts`: sửa test hiện có thành `await checkRateLimit(...)`; thêm ít nhất 1
     test case xác nhận fallback Map hoạt động khi không có `REDIS_URL` (giữ hành vi cũ, không cần
     mock Redis thật — có thể test qua việc không set `REDIS_URL` trong test env).
   - Các file mock `checkRateLimit: () => true` (`api/history.test.ts`, `api/pronounce-assess.test.ts`,
     `api/challenge.test.ts`, `api/ai.test.ts`) đổi thành `checkRateLimit: async () => true` (hoặc
     `vi.fn().mockResolvedValue(true)`), khớp chữ ký mới.
6. Không cần Redis client thật để chạy CI/test — mock hoặc kiểm tra fallback nhánh Map khi
   `REDIS_URL` rỗng.

### Tiêu chí chấp nhận

- `npm run typecheck` sạch, `npm run lint` (0 cảnh báo), `npm test` xanh.
- Không đổi hành vi khi `REDIS_URL` không set (dev/local vẫn chạy y như trước — Map in-memory).
- Khi có `REDIS_URL` hợp lệ: rate limit đúng across nhiều tiến trình (test thủ công tối thiểu: 2
  process Node cùng gọi `checkRateLimit` chung 1 Redis, tổng số lần cho qua = đúng `maxPerMin`, không
  gấp đôi).
- Comment tiếng Việt giải thích rõ cơ chế fallback (đúng quy ước dự án — người đọc mới lập trình).
- Cập nhật đoạn comment "Với traffic thật nên dùng Redis (Upstash)..." trong `security.ts` cho khớp
  thực tế mới (đã dùng Redis khi cấu hình).

### Việc KHÔNG làm (ngoài phạm vi)

- Không đổi logic đếm lượt `usage.ts` (khác cơ chế, dùng Postgres — không đụng vào).
- Không thêm Redis cho cache TTS/dictionary (thuộc GĐ3, việc khác).
- Không đổi CORS/auth/logic khác trong `security.ts`.

## Thứ tự thực hiện

Việc B **không phụ thuộc** Việc A về mặt code (độc lập file), nhưng nên xong trước khi Việc A được
xác nhận chạy cluster mode thật trên VPS (nếu không, cluster mode sẽ làm rate limit sai ngay). Có thể
làm song song, nhưng merge Việc B trước khi bật cluster mode production.
