# Baseline — English Tutor OS, Phase 00 (2026-08-15)

> Đặc tả: `docs/phases/00-research-baseline.md`. Kết quả này thay cho việc lặp lại toàn bộ kiểm kê —
> phần lớn kiến trúc/tính năng hiện tại đã có sẵn ở `CLAUDE.md` (mục 6–7) và lịch sử chi tiết ở
> `PROGRESS.md`; file này chỉ ghi phần **Phase 00 yêu cầu riêng**: baseline đo được + rủi ro.

## 1. Lệnh baseline (tái lập được)

Môi trường container mới **bắt buộc `npm ci` trước** (lockfile ghi TypeScript `^5.2.2`, container có
sẵn TS 6.0.2 gây `tsc` báo lỗi `baseUrl deprecated` — đúng dấu hiệu lệch lockfile đã ghi ở `CLAUDE.md`
mục 8). Sau `npm ci`, chạy 2026-08-15, Node v22.22.2:

| Cổng                | Kết quả                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| `npm run build`     | ✅ (client Vite 7 + `build:server` tsc + `apps/hub` Vite)                                         |
| `npm run typecheck` | ✅ 0 lỗi (`tsconfig.json` + `tsconfig.api.json` + `tsconfig.e2e.json` + `apps/hub/tsconfig.json`) |
| `npm run lint`      | ✅ 0 cảnh báo (`--max-warnings 0`)                                                                |
| `npm test`          | ✅ **3132/3132** test, 169 file test, 49.3s                                                       |
| `npm audit`         | 0 lỗ hổng (đã xác nhận ở audit tự động 2026-08-09, xem banner khởi động phiên)                    |

E2E (`npm run test:e2e`, Playwright + a11y AA/AAA) **không chạy lại ở bước này** — cần server thật +
DB Postgres + key AI/TTS/STT thật để chạy hết luồng, tốn phí API nếu chạy lại ngoài CI. CI đã gate
2 check `quality`/`e2e` trên mọi PR (xác nhận trong `PROGRESS.md`) nên coi baseline E2E = trạng thái
CI hiện tại (xanh). Nếu Phase 00 cần số đo E2E cục bộ thật, phải chạy tay trên máy có đủ `.env`.

## 2. Dependency graph (`npm run codemap`)

- **0 chu trình import** (`-- cycles`) — không có circular dependency giữa các module.
- **Hotspot rủi ro cao nhất khi sửa** (`-- hotspots`, số file import trực tiếp):

  | File                                  | Số nơi import |
  | ------------------------------------- | ------------- |
  | `packages/core-db/pgPool.ts`          | 97            |
  | `apps/english/src/types.ts`           | 69            |
  | `packages/core-auth/security.ts`      | 58            |
  | `packages/core-ui/authHeader.ts`      | 45            |
  | `api/_lib/http.ts`                    | 43            |
  | `apps/english/src/lib/storage.ts`     | 35            |
  | `api/_lib/validation.ts`              | 31            |
  | `packages/core-auth/authService.ts`   | 30            |
  | `apps/english/src/context/useAuth.ts` | 28            |
  | `apps/english/src/lib/tts.ts`         | 25            |

  → Đây là các file phải soát bằng `codemap -- impact <file>` trước khi sửa trong bất kỳ phase OS
  nào chạm tới (đặc biệt Phase 01 Foundation OS đụng thẳng `pgPool.ts`, Phase 40 Security đụng
  `security.ts`/`authService.ts`).

- `-- orphans` chỉ trả về file test (`*.test.ts`) và script CLI độc lập (`scripts/*.ts`) — đúng kỳ
  vọng (entry point/test không cần ai import), không có module chết thật sự.

## 3. Đối chiếu hạ tầng đã có vs. Phase 01 "Foundation OS" giả định

(chi tiết đã ghi ở `PROGRESS.md` mục "Lộ trình mới: English Tutor OS" — tóm tắt lại đây để Phase 00
có một chỗ tổng hợp):

| Hạng mục Phase 01                          | Trạng thái thật  | Ghi chú                                                                              |
| ------------------------------------------ | ---------------- | ------------------------------------------------------------------------------------ |
| Storage abstraction (audio/file)           | ✅ Đã có         | `packages/core-ai/fileStorage.ts`, driver local/R2                                   |
| Structured logging                         | 🟡 Một phần      | `packages/core-db/logger.ts` có cấp độ + tiền tố; **chưa** có correlation/request ID |
| `AIProvider.generate()` gateway thống nhất | ❌ Chưa có       | `ai.ts`/`tts.ts`/`stt.ts` gọi thẳng từng provider, không qua 1 interface chung       |
| Config/env validate tập trung (Zod)        | ❌ Chưa có       | `process.env.X` đọc rải rác 20+ file                                                 |
| DB transaction helper dùng chung           | ❓ Chưa xác minh | `pgPool.ts` có pool; cần đọc kỹ handler có tự `BEGIN/COMMIT` lặp lại không           |
| Secrets không lọt log/bundle               | ✅ Theo quy ước  | Đã là luật bất biến mục 4.6 `CLAUDE.md`, chưa quét tự động riêng cho phase này       |

## 4. Rủi ro đã biết khi migrate lên kiến trúc OS (risk register rút gọn)

1. **Quy mô đặc tả (45 phase) vs. năng lực vận hành thật** — VPS 1 vCPU, 1 người vận hành, sản phẩm
   đã có người dùng thật trả phí (SePay). Rủi ro lớn nhất không phải kỹ thuật mà là **phạm vi phình
   to** nếu triển khai không có cổng xác nhận từng phase (đã nêu ở lượt trả lời trước, người dùng
   chưa phản hồi cụ thể — vẫn cần xác nhận trước khi vào Phase 01 code thật).
2. **`AIProvider` gateway mới có thể phá vỡ retry/cost-control hiện có** — `packages/core-ai/ai.ts`
   đã có logic chọn provider theo key môi trường (Anthropic/Gemini/Groq) + đếm lượt dùng gắn chặt
   với từng handler API. Bọc lại thành interface chung phải giữ nguyên hành vi đếm lượt (nợ kỹ thuật
   nếu đếm sai = mất tiền hoặc lộ free tier).
3. **Zod hoá env** đụng tới `dotenvx` hiện dùng (`scripts/backup-env-to-r2.test.ts` cho thấy có
   inject/encrypt env) — cần đọc kỹ cách nạp env hiện tại trước khi thêm lớp validate, tránh phá
   luồng nạp `.env` mã hoá đang chạy thật trên VPS.
4. **Không có baseline latency/cost AI thật** trong lượt đo này (cần key thật + gọi API tốn phí) —
   để ngỏ, nên đo trên VPS qua log thật (`packages/core-ai/aiCost.ts` đã có sẵn cơ chế tính cost)
   thay vì gọi thêm API chỉ để đo trong môi trường sandbox.

## 5. Kết luận Phase 00

Baseline build/typecheck/lint/test + dependency graph đã đo được và tái lập được (mục 1–2). Chưa đo
được latency/cost AI thật (mục 4.4) — để ngỏ, không chặn quyết định có tiếp tục Phase 01 hay không.
Không phát hiện chu trình import hay module chết bất thường. Rủi ro chính là **quy mô kế hoạch**, đã
ghi lại để người dùng quyết định trước khi mở Phase 01.
