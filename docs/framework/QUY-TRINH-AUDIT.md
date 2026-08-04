# QUY TRÌNH AUDIT TOÀN DIỆN

> Đặc tả quy trình rà soát toàn diện dự án **Gia sư tiếng Anh AI** (bilingual-english-vietnamese).
> Mục tiêu: khi ai đó (người dùng, Claude, hoặc subagent) yêu cầu "audit toàn diện / rà soát toàn bộ",
> có **một chuẩn lặp lại được** — không thiếu bước, không đoán, kết quả so sánh được giữa các lần.
>
> Quan hệ với các tài liệu khác:
>
> - Mục **8–10** trong `CLAUDE.md` = cổng **commit/merge** cho MỘT thay đổi. File này = quy trình
>   **audit ĐỊNH KỲ** cho TOÀN dự án (rộng hơn: bảo mật, độ phủ test, đối chiếu tài liệu, phân loại việc).
> - `docs/framework/HUONG-DAN-cau-hinh-precommit-CI.md` = cấu hình công cụ (Prettier/ESLint/CI). File này
>   = **cách dùng** các công cụ đó thành một lượt audit hoàn chỉnh.

---

## 0. Khi nào chạy audit này

- Người dùng yêu cầu trực tiếp ("rà soát toàn bộ", "audit toàn diện").
- **Cổng giữa các giai đoạn** (KHUNG-1): trước khi chuyển giai đoạn hoặc trước thay đổi lớn.
- Định kỳ (khuyến nghị: trước mỗi đợt deploy production, hoặc mỗi cuối tuần làm việc).
- Sau khi merge một loạt PR liên quan nhau, để chắc không có tương tác ngoài ý muốn.

> Audit ≠ cổng commit. Cổng commit chạy cho từng diff nhỏ; audit chạy cho **trạng thái toàn repo**
> ở một thời điểm, kể cả khi working tree sạch (không có diff nào).

---

## 1. Nguyên tắc

1. **Chạy thật, đọc output thật** — không đoán kết quả lệnh (mục 5 CLAUDE.md).
2. **Không sửa trong lúc audit** — audit là ĐỌC + BÁO CÁO. Nếu phát hiện lỗi: ghi vào báo cáo, phân loại
   (tự sửa được / cần người dùng), rồi mới tách việc sửa thành thay đổi riêng có PR. Không trộn "phát hiện"
   với "sửa" trong cùng một lượt — trừ khi người dùng yêu cầu sửa luôn.
3. **Phân loại việc rõ ràng** — mỗi phát hiện phải nói **AI tự làm được** hay **cần người dùng thao tác tay**
   (VD: điền secret trên VPS, chạy migration Supabase production, bật branch protection — AI không có quyền).
4. **Đối chiếu, không tin trí nhớ** — trạng thái thật đọc từ repo/lệnh, KHÔNG lấy từ hook đầu phiên hay
   ghi chú cũ (chúng có thể lỗi thời — đã từng xảy ra với trạng thái migration).

---

## 2. Bảy tầng audit

Chạy tuần tự. Mỗi tầng ghi rõ: **lệnh**, **tiêu chí đạt**, **nếu fail thì làm gì**, **ai xử lý**.

### Tầng 1 — Cổng tự động (bắt buộc, luôn chạy)

| Mục         | Lệnh                   | Tiêu chí đạt                                                                                                           |
| ----------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Build       | `npm run build`        | Thoát 0, không lỗi vite/tsc                                                                                            |
| Typecheck   | `npm run typecheck`    | 0 lỗi (gộp `tsconfig` + `tsconfig.api.json` + `tsconfig.e2e.json`)                                                     |
| Lint        | `npm run lint`         | 0 cảnh báo (`--max-warnings 0`)                                                                                        |
| Format      | `npm run format:check` | "All matched files use Prettier code style"                                                                            |
| Unit test   | `npm test`             | 100% pass; ghi số `X/Y`                                                                                                |
| Bundle size | `npm run size`         | JS ≤ 123 kB · CSS ≤ 11 kB (brotli) — ngưỡng thật đọc ở `.size-limit.json`/cấu hình size-limit, không hardcode số ở đây |

- **Nếu fail:** dừng, ghi lỗi cụ thể vào báo cáo. Đây là fail chặn (blocking).
- **Ai xử lý:** AI tự sửa được (lỗi code/format).
- **Lưu ý stderr "giả":** `apps/english/src/lib/ai.test.ts`/`packages/core-ai/ai.test.ts` in log lỗi có
  chủ đích (test nhánh xử lý lỗi). Đó KHÔNG phải
  test fail — chỉ đọc dòng `Test Files … passed` / `Tests … passed` để kết luận.

### Tầng 2 — Bảo mật

| Mục                     | Cách kiểm                                                                                                                                                                                                                                                       | Tiêu chí đạt                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Secret hardcode         | Quét `sk-…`, `AIza…`, `api_key=…` trong `apps/*/src`/`api`/`packages`/`server.ts` (trừ `*.test.*`)                                                                                                                                                              | 0 khớp                                                          |
| `.env` bị track         | `git ls-files \| grep -E "^\.env($\|\.)"`                                                                                                                                                                                                                       | chỉ `.env.example`                                              |
| Lỗ hổng dependency      | `npm audit --omit=dev`                                                                                                                                                                                                                                          | 0 mức high/critical (low/moderate: ghi nhận, cân nhắc)          |
| Logic nhạy cảm ở server | Rà `api/` + `server.ts`: kiểm quyền (`validateAuth`), đếm lượt, gọi AI đều ở server                                                                                                                                                                             | không có logic nhạy cảm chạy ở client                           |
| Kiểm quyền mỗi handler  | Đối chiếu `api/*.ts` — mọi endpoint đọc/sửa dữ liệu người dùng đều gọi `validateAuth()` (dự án đã rời Supabase, không còn RLS — xem `docs/migration-thoat-ly-supabase.md`); endpoint công khai có chủ đích (vd `app-settings.ts`) phải có comment giải thích rõ | mọi handler chạm dữ liệu riêng tư đều kiểm `user_id` khớp token |

- **Nếu fail:** secret lộ = fail chặn, xử lý NGAY (xoay key nếu đã đẩy lên remote). `npm audit` high/critical =
  ghi vào báo cáo + đề xuất nâng phiên bản.
- **Ai xử lý:** AI rà + đề xuất; xoay key thật / cập nhật secret trên VPS = **người dùng**.

### Tầng 2b — Checklist OWASP mở rộng (2026-08-04)

> Chắt lọc từ 5 nguồn tham khảo bảo mật ứng dụng web phổ biến, áp vào đúng stack dự án (Express +
> `pg` tự host + React SPA), **không** cài công cụ scan mới — chỉ thêm hạng mục kiểm tra thủ công/grep
> vào audit đã có:
>
> - [OWASP WSTG](https://github.com/OWASP/wstg) — khung 12 nhóm test chuẩn (Configuration, Authentication,
>   Authorization, Session Management, Input Validation, Error Handling, Cryptography, Business Logic,
>   Client-side, API Testing…) — dùng làm **khung phân loại** cho bảng dưới, không chạy full WSTG (dự án
>   nhỏ, không có pentest team).
> - [OWASP-Web-Checklist](https://github.com/0xRadi/OWASP-Web-Checklist) +
>   [Awesome-Application-Security-Checklist](https://github.com/MahdiMashrur/Awesome-Application-Security-Checklist)
>   — nguồn các dòng checklist cụ thể bên dưới.
> - [w3af](https://github.com/andresriancho/w3af) / [Arachni](https://github.com/Arachni/arachni) — hai
>   scanner tự động; dự án **không cài** (nặng, cần server riêng để scan, rủi ro scan nhầm production của
>   người khác trên cùng VPS). Thay vào đó mượn **danh mục lỗ hổng** chúng qua active/passive check (SQLi,
>   XSS, CSRF, path traversal, header thiếu, cookie không an toàn…) làm checklist thủ công dưới đây —
>   tinh thần "biết scanner sẽ tìm gì" mà không cần chạy scanner.

**Cách chạy:** đọc code thật (`Grep`/`Read`), KHÔNG đoán. Với mỗi dòng ❌ → ghi vào báo cáo, phân loại
AI tự sửa được hay cần người dùng. Không chạy `npm audit`/`eval:tutor` lại ở đây (đã có Tầng 2/4).

| #   | Nhóm (theo WSTG)                     | Kiểm tra cụ thể                                                                                                                                                                 | Cách kiểm trong repo này                                                                                                                                                                                                    | Đã biết đạt (xác nhận 2026-08-04, lượt audit thật đầu tiên sau khi thêm Tầng 2b)                                                                                                                                                                                                                                                                                                                                                                                          |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Injection — SQLi                     | Mọi câu Postgres dùng tham số hoá (`$1, $2…`), không nối chuỗi trực tiếp                                                                                                        | `grep -rn "pool.query\|client.query" api/ packages/core-db --include=*.ts \| grep -v "\.test\."` rồi soát các query có nối chuỗi (`+`, template literal chèn biến chưa qua `$n`)                                            | ✅ 0 query nối chuỗi — soát lại mỗi lần thêm handler mới                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2   | Injection — Command/Path             | Không có `child_process.exec`/`fs` ghép trực tiếp input người dùng vào đường dẫn                                                                                                | `grep -rn "exec(\|execSync\|readFile.*req\.\|path.join.*req\." api/ server.ts`                                                                                                                                              | ✅ 0 kết quả — STT/TTS ghi file cache theo hash, không theo tên người dùng gửi lên                                                                                                                                                                                                                                                                                                                                                                                        |
| 3   | XSS                                  | Không dùng `dangerouslySetInnerHTML` với dữ liệu chưa qua sanitize; React tự escape phần còn lại                                                                                | `grep -rn "dangerouslySetInnerHTML" apps/english/src`                                                                                                                                                                       | ✅ 0 kết quả — React escape mặc định đủ dùng, giữ nguyên, không thêm `dangerouslySetInnerHTML` khi chưa có lý do + sanitize (DOMPurify)                                                                                                                                                                                                                                                                                                                                   |
| 4   | CSRF                                 | Endpoint đổi trạng thái (POST/PUT/DELETE) yêu cầu Bearer token riêng (không chỉ dựa cookie tự động gửi) → giảm rủi ro CSRF theo thiết kế token-based hiện tại                   | Xác nhận `validateAuth()` đọc header `Authorization`, không phải cookie session                                                                                                                                             | ✅ Bearer token qua header, không cookie — CSRF cổ điển không áp dụng. Webhook thanh toán (`packages/core-billing/payment-webhook.ts`) xác minh chữ ký riêng qua `verifySepayApiKey`, không dựa "đăng nhập"                                                                                                                                                                                                                                                               |
| 5   | Auth — brute force / enumeration     | Endpoint login/đăng ký không lộ "email tồn tại hay không" qua message khác nhau; có giới hạn số lần thử                                                                         | Đọc `packages/core-auth/auth.ts` + `packages/core-auth/authService.ts`, đối chiếu message lỗi + rate limit áp dụng cho `/api/auth*`                                                                                         | ✅ Message lỗi gộp chung "Email hoặc mật khẩu không đúng" (không lộ email tồn tại), có rate limit 429 "Quá nhiều yêu cầu"                                                                                                                                                                                                                                                                                                                                                 |
| 6   | Session/Token                        | Token có hạn dùng (expiry), không log token ra console/Sentry, đăng xuất thu hồi được                                                                                           | `grep -rn "console.log.*token\|Bearer " api/ packages/ server.ts --include=*.ts \| grep -v test`                                                                                                                            | ✅ 0 chỗ log token. Sentry client (`apps/english/src/lib/errorTracking.ts`) và server (`api/_lib/sentry.ts`) đều KHÔNG bật request-handler/tracing tự động — chỉ `captureException`/`captureServerException` thủ công với `extra` tối giản (path, method, context) → không có đường nào Authorization header lọt vào Sentry                                                                                                                                               |
| 7   | Authorization / IDOR                 | Mọi handler đọc/sửa dữ liệu theo `id` từ URL/body đều đối chiếu `user_id` lấy từ token, không tin `user_id` client gửi lên                                                      | Đã có ở Tầng 2 gốc ("Kiểm quyền mỗi handler") — bổ sung: rà riêng các handler có tham số `:id`/`userId` trong query string (VD `history.ts`, `progress.ts`, `profile.ts`) xem có so khớp `req.user.id` hay dùng thẳng param | ✅ `history.ts`/`progress.ts`/`profile.ts` đều lấy `user_id` từ `validateAuth()` rồi mới query (`where user_id = $1`) — không có handler nào tin `id`/`userId` từ query string client                                                                                                                                                                                                                                                                                     |
| 8   | File upload (STT audio)              | Giới hạn kích thước + loại file audio nhận vào `/api/stt`; không cho ghi ra ngoài thư mục cache dự kiến                                                                         | Đọc `packages/core-ai/stt.ts`: có giới hạn `bodyParser`/base64 size không, có validate mime/độ dài trước khi gửi Whisper                                                                                                    | ✅ `server.ts:102` giới hạn `express.json({ limit: '10mb' })` riêng cho `/api/stt`; `stt.ts` có `checkRateLimit(clientIp, 15)` riêng                                                                                                                                                                                                                                                                                                                                      |
| 9   | Security headers                     | CSP, `X-Content-Type-Options`, `Referrer-Policy` đã có (`server.ts`); còn thiếu `X-Frame-Options`/`frame-ancestors`, `Strict-Transport-Security`, `Permissions-Policy`          | `grep -n "X-Frame\|Strict-Transport\|Permissions-Policy\|frame-ancestors" server.ts`                                                                                                                                        | ⚠️ **CSP (kèm `frame-ancestors 'self'`) + nosniff + Referrer-Policy: có** ở Express (`server.ts` ~144-174). HSTS/`Permissions-Policy`: KHÔNG thấy ở Express lẫn ở `nginx/en-vi.conf` trong repo. `nginx/en-vi.conf` trong repo còn tệ hơn: CSP-Report-Only ở đó vẫn nhắc domain Supabase (đã rời) + domain `.com` cũ (đã đổi `.org` 2026-07-31) — nghi là bản nháp lỗi thời, **cần người dùng xác nhận file này có khớp cấu hình VPS thật đang chạy không** trước khi sửa |
| 10  | CORS                                 | Nếu có bật CORS cho origin khác domain chính, danh sách origin phải whitelist rõ, không `*` khi có credentials                                                                  | `grep -rn "Access-Control-Allow" server.ts api/`                                                                                                                                                                            | ✅ Same-origin SPA — 0 middleware CORS mở rộng trong `server.ts`/`api/`                                                                                                                                                                                                                                                                                                                                                                                                   |
| 11  | Rate limiting / anti-automation      | Endpoint tốn tài nguyên (AI, STT, TTS, auth) có giới hạn lượt/IP hoặc /user, tách biệt đếm lượt nghiệp vụ (Free/Pro) và rate-limit chống spam kỹ thuật                          | Đọc `packages/core-ai/{ai,stt,tts}.ts` — xác nhận có áp cho `/api/auth`, `/api/agent`, `/api/stt`, `/api/tts`, không chỉ đếm lượt nghiệp vụ                                                                                 | ✅ `checkRateLimit` áp riêng theo IP cho cả 4: `ai.ts` (5), `stt.ts` (15), `tts.ts` (60, 2 điểm chặn), `auth.ts` (429 riêng) — tách biệt hoàn toàn với đếm lượt nghiệp vụ Free/Pro                                                                                                                                                                                                                                                                                        |
| 12  | Business logic (đếm lượt/thanh toán) | Không thể gọi API AI vượt giới hạn bằng cách gọi song song (race condition đếm lượt), webhook thanh toán xác minh chữ ký + idempotent (không cộng tiền 2 lần nếu SePay gửi lại) | Đã có phần trong Tầng 5b ("Async race / idempotency… `0004_refund_usage`") — bổ sung riêng cho `payment-webhook`: xác nhận có kiểm tra "đã xử lý giao dịch này chưa" trước khi cộng plan                                    | ✅ `packages/core-billing/payment-webhook.ts:79` — `if (payment.status === 'paid') return ok(...)` chặn xử lý lại trước khi cộng plan → idempotent                                                                                                                                                                                                                                                                                                                        |
| 13  | Error handling / thông tin lộ        | Response lỗi cho client không kèm stack trace / chi tiết nội bộ (tên bảng, path server) ở production                                                                            | `grep -rn "err.stack\|error.stack" api/ server.ts \| grep -v test` rồi xác nhận không trả thẳng ra response                                                                                                                 | ✅ 0 kết quả — không có response nào trả thẳng `.stack` ra client                                                                                                                                                                                                                                                                                                                                                                                                         |
| 14  | Sensitive data ở client              | Không có API key/secret nào lộ trong bundle client (`apps/english/src`) — chỉ biến `VITE_*` public (site URL, Google client ID publishable)                                     | `grep -rn "process.env\." apps/english/src \| grep -v VITE_` (phải rỗng — code client không được đọc biến server)                                                                                                           | ✅ 0 kết quả — chạy grep này mỗi audit                                                                                                                                                                                                                                                                                                                                                                                                                                    |

**Ghi chú phạm vi:** danh mục trên ưu tiên các lớp lỗ hổng OWASP Top 10 còn _chưa_ có dòng kiểm tra rõ
trong Tầng 1–2 gốc (CSRF, headers, rate limiting, error leak, file upload, IDOR theo param, secret lộ ở
client). Các lớp đã có sẵn (secret hardcode, `.env`, `npm audit`, `validateAuth`) **không lặp lại** ở
đây — xem Tầng 2 gốc.

- **Nếu fail:** ghi từng dòng ❌ cụ thể vào báo cáo kèm số dòng #. Không tự sửa trong lúc audit trừ
  khi người dùng yêu cầu (nguyên tắc mục 1.2).
- **Ai xử lý:** AI rà + đề xuất vá (thêm header, thêm rate limit, sửa error handler) đều tự làm được
  qua PR riêng; xoay secret / cấu hình Nginx-VPS thật = **người dùng**.

### Tầng 3 — Vệ sinh code

| Mục                     | Cách kiểm                                                 | Tiêu chí đạt                                                   |
| ----------------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| `console.log` rác       | Quét `apps/*/src`/`api`/`packages` (trừ `*.test.*`)       | 0 (log khởi động chủ đích trong `server.ts` KHÔNG tính là rác) |
| TODO/FIXME/XXX sót      | Quét `apps/*/src`/`api`/`packages`/`server.ts` (trừ test) | 0, hoặc mỗi cái có issue/ghi chú trong PROGRESS                |
| `any` lọt lưới          | Quét `: any` / `as any` ngoài test                        | 0 mới (mục 4.1 CLAUDE.md)                                      |
| Code chết / import thừa | Lint đã bắt phần lớn (`no-unused-vars`)                   | không còn cảnh báo                                             |

- **Ai xử lý:** AI tự sửa được.

### Tầng 4 — Chất lượng AI (chỉ khi liên quan)

- **Kích hoạt khi:** audit chạy sau khi có thay đổi `apps/english/src/prompts/*` hoặc
  `packages/core-ai/aiConfig.ts` kể từ lần eval gần nhất.
- **Lệnh:** `npm run eval:tutor` (cần key AI trong `.env`).
- **Tiêu chí đạt:** recall/precision **không tụt** so với `docs/research/eval-tutor-baseline.md`.
- **Nếu fail:** không được merge thay đổi prompt/model; dán bảng so sánh vào báo cáo (mục 8 CLAUDE.md).
- **Ai xử lý:** AI chạy được nếu có key; nếu không có key trong môi trường audit → ghi "cần chạy tay có key".

### Tầng 5 — Độ phủ test (coverage) + rà vùng thiếu test

Đây là phần đi xa hơn cổng commit: không chỉ "test có xanh không" mà "test có ĐỦ không".

**5a. Coverage gate (định lượng):**

- **Lệnh:** `npm run test:coverage`.
- **Tiêu chí đạt:** vượt ngưỡng SÀN trong `vitest.config.ts` (cơ chế "ratchet" — không tệ hơn hiện tại).
  Ngưỡng cấu hình (đọc lại `vitest.config.ts`, xác nhận 2026-08-04): statements 93 · branches 89 ·
  functions 96 · lines 93. Đo thực tế cùng ngày: statements 93.79% · branches 89.51% · functions
  96.32% · lines 93.79% — đúng sát sàn (đã nâng nhiều đợt từ 2026-08-01, còn ít dư địa nâng tiếp).
  Chỉ đo LOGIC THUẦN (`apps/*/src/lib/**`, `api/**`, `packages/**`), không đo UI.
- **Khi thêm test mới:** NÂNG DẦN các ngưỡng này (đừng để trôi xuống). Ghi mốc mới vào PROGRESS.

**5b. Rà vùng thiếu test (định tính — theo mục 9 CLAUDE.md "chống lỗi logic"):**

Mở báo cáo coverage HTML (`coverage/index.html`) và soi các file `apps/*/src/lib/**`/`packages/**` + `api/**` có nhánh chưa phủ.
Với mỗi hàm logic phức tạp, đối chiếu checklist:

- [ ] **Ca biên / rỗng:** mảng rỗng, chuỗi rỗng, `undefined`, giá trị 0.
- [ ] **`null` vs 0:** phân biệt "chưa có" và "bằng không" (đếm lượt, điểm, streak).
- [ ] **Async race / idempotency:** gọi 2 lần, gọi song song, retry — đặc biệt đếm lượt (`api/_lib/usage.ts`)
      và hoàn lượt (`0004_refund_usage`).
- [ ] **Thời gian UTC:** ranh giới ngày, đổi múi giờ, reset lượt theo ngày.
- [ ] **Nhánh lỗi:** mọi thao tác mạng/DB/AI có test cho nhánh thất bại.

**Tiêu chí đạt:** mỗi nhánh logic phức tạp có ≥ 1 test ca biên. Vùng thiếu → **ghi danh sách đề xuất bổ sung
test** vào báo cáo (KHÔNG tự viết test trong lượt audit — đó là việc tách riêng, trừ khi người dùng yêu cầu).

**5c. E2E + a11y:**

- **Lệnh:** `npm run test:e2e` (Playwright + axe).
- **Tiêu chí đạt:** mọi flow chính xanh; axe không có vi phạm WCAG AA mới.
- **Ai xử lý:** AI chạy được nếu môi trường có Chromium (`/opt/pw-browsers`).

### Tầng 6 — Đối chiếu tài liệu & hạ tầng

| Mục                        | Cách kiểm                                                                                                                                                                                                                                                                   | Tiêu chí đạt                                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Git vs nhánh chính         | `git fetch origin main && git rev-list --left-right --count origin/main...HEAD`                                                                                                                                                                                             | biết rõ ahead/behind; nếu behind → cân nhắc rebase                                                        |
| Working tree               | `git status -sb`                                                                                                                                                                                                                                                            | sạch, hoặc mọi thay đổi có chủ đích                                                                       |
| PROGRESS.md khớp thực tế   | Đọc PROGRESS + đối chiếu code/migration thật                                                                                                                                                                                                                                | không có mục "đã xong" mà code chưa có (và ngược lại)                                                     |
| Migration Postgres tự host | Đọc `postgres/migrations/README.md` (danh sách file) — **tự động áp khi deploy** (`scripts/deploy.sh` gọi `npm run migrate:pg` mỗi lượt, deploy tự chạy khi push lên `main`) nên KHÔNG cần thao tác tay như Supabase cũ; vẫn nên xác nhận qua log deploy nếu vừa đổi schema | biết mọi migration đã merge có nằm trong lần deploy gần nhất; **đọc file thật, không tin hook đầu phiên** |
| Nợ kỹ thuật                | Đối chiếu danh sách nợ trong CLAUDE.md/PROGRESS với thực tế                                                                                                                                                                                                                 | mỗi nợ còn đúng, phân loại ai xử lý                                                                       |

- **Ai xử lý:** AI đối chiếu + báo cáo; chạy migration production / rebase = cần người dùng xác nhận.

### Tầng 7 — Báo cáo & phân loại

Xuất báo cáo theo **mẫu mục 10 CLAUDE.md**, rồi thêm phần phân loại việc (xem §3).

### Tầng 8 — Hiệu năng thực đo (Core Web Vitals)

- **Kích hoạt khi:** audit định kỳ trước deploy lớn, hoặc khi thay đổi UI/trang tải nhiều dữ liệu.
- **Cách kiểm:** chạy Lighthouse (CLI hoặc DevTools) trên domain production
  (https://en-vi.donghanhcungban.org) cho trang chủ + 1-2 trang tải nặng (Dictionary, CEFR level).
- **Tiêu chí đạt:** LCP ≤ 2.5s · INP ≤ 200ms · CLS ≤ 0.1 (ngân sách mục 4.7 CLAUDE.md).
- **Nếu fail:** ghi vào báo cáo kèm trang cụ thể + chỉ số vượt ngưỡng; không tự sửa trong lượt audit.
- **Ai xử lý:** AI đo + đề xuất; sửa performance thật (code-splitting, ảnh, font) = việc riêng.

### Tầng 9 — Kiểm tra vận hành (production)

- **Kích hoạt khi:** audit định kỳ trước deploy lớn, hoặc nghi ngờ có sự cố gần đây.
- **Cách kiểm:** đọc Sentry (alert/lỗi mới chưa xử lý), log PM2 trên VPS (`pm2 logs` / restart count
  bất thường), dung lượng ổ đĩa còn lại.
- **Tiêu chí đạt:** không có lỗi Sentry mới chưa xem xét; PM2 không có restart loop; ổ đĩa còn đủ chỗ.
- **Nếu fail:** ghi vào báo cáo, phân loại xử lý theo `docs/ke-hoach-khoi-phuc-su-co-server.md` nếu là sự cố thật.
- **Ai xử lý:** AI đọc log qua SSH nếu có quyền; xử lý sự cố thật ưu tiên theo runbook khôi phục.

### Bước bổ sung — Quét scripts/ và tính năng chính (kèm mọi lượt audit toàn diện)

Không tự động hóa được bằng lệnh đơn — làm thủ công, nhanh:

- **Scripts:** liệt kê `scripts/*.ts` (trừ test), đối chiếu với `package.json` "scripts". Script không
  có trong `package.json` → tra `grep -rl <tên-script> docs/ PROGRESS.md apps/*/src/data` để xác nhận là
  script sinh dữ liệu one-off đã có tài liệu tham chiếu (bình thường) hay code chết thật sự (đề xuất xoá).
- **Tính năng chính:** đối chiếu 3 chế độ học (Chat/Viết/Nói) + Lộ trình CEFR + Thanh toán còn hoạt động
  đúng mô tả ở CLAUDE.md mục 1 — tối thiểu chạy thử 1 lượt tay trên trang thật hoặc dev nếu có nghi ngờ,
  không chỉ dựa vào test tự động.
- **Tiêu chí đạt:** không có script/tính năng "mồ côi" (không dùng, không tài liệu, không rõ mục đích).
- **Ai xử lý:** AI quét + đối chiếu; xoá script/tính năng chết = xác nhận với người dùng trước.

---

## 3. Mẫu báo cáo audit

```
=== BÁO CÁO AUDIT TOÀN DIỆN — <ngày giờ UTC> · nhánh <tên> ===

TẦNG 1 — Cổng tự động
Build ✅/❌ | Type ✅/❌ (lỗi:..) | Lint ✅/❌ (cảnh báo:..) | Format ✅/❌ | Test ✅/❌ (X/Y) | Size ✅/❌ (JS ../123kB · CSS ../9.7kB)

TẦNG 2 — Bảo mật
Secret hardcode ✅/❌ | .env sạch ✅/❌ | npm audit (high/critical: ..) | RLS ✅/❌

TẦNG 2b — Checklist OWASP mở rộng
Dòng ❌ (14 mục, xem bảng Tầng 2b): [.. liệt kê # + mô tả ngắn, hoặc "0 — tất cả đạt/đã có bằng chứng"]

TẦNG 3 — Vệ sinh code
console.log rác ✅/❌ | TODO/FIXME ✅/❌ | any lọt lưới ✅/❌

TẦNG 4 — Chất lượng AI
(Chạy nếu đụng prompt/model) eval:tutor ✅/❌ vs baseline | hoặc "N/A — không đổi prompt/model"

TẦNG 5 — Độ phủ test
Coverage gate ✅/❌ (stmts/branches/funcs/lines) | E2E+a11y ✅/❌ | Vùng thiếu test đề xuất: [..]

TẦNG 6 — Đối chiếu tài liệu
Git: ahead X / behind Y | Working tree ✅/❌ | PROGRESS khớp ✅/❌ | Migration chưa áp: [..] | Nợ kỹ thuật: [..]

TẦNG 8 — Hiệu năng thực đo (nếu chạy)
LCP .. | INP .. | CLS .. | hoặc "N/A — không đo lượt này"

TẦNG 9 — Vận hành production (nếu chạy)
Sentry ✅/❌ (lỗi mới: ..) | PM2 ✅/❌ (restart bất thường: ..) | Ổ đĩa ✅/❌ | hoặc "N/A — không có quyền truy cập VPS lượt này"

Quét scripts/tính năng: script mồ côi: [..] | tính năng chính còn hoạt động đúng ✅/❌

--- PHÂN LOẠI VIỆC ---
AI tự làm được: [..]
Cần người dùng thao tác tay: [.. VD: điền SENTRY_DSN/SUPABASE_DB_URL trên VPS, chạy migration production ..]

Rủi ro/ảnh hưởng: ..
Góp ý cải tiến: ..
KẾT LUẬN: Sẵn sàng / Cần xử lý: [..]
```

Bất kỳ mục ❌ ở Tầng 1–2 (chặn) → nêu rõ trong kết luận là "Cần xử lý", không kết luận "Sẵn sàng".

---

## 4. Ghi chú vận hành

- **Cài dependency trước:** môi trường sạch cần `npm ci` trước khi chạy các tầng (kiểm `node_modules` tồn tại).
- **Song song hóa:** các lệnh độc lập (typecheck / lint / format:check) có thể chạy song song để nhanh hơn;
  build + size phải chạy tuần tự (size đọc `dist/`).
- **Không cần key:** Tầng 1, 2, 2b, 3, 5a, 6 chạy được offline không cần secret. Tầng 4 (eval) và một số E2E cần key/mạng.
- **Lịch định kỳ:** có thể dùng `send_later` / trigger để tự hẹn chạy lại audit (đã dùng trong thực tế).
- **Không tự thêm CI/script trong đặc tả này** (quyết định phạm vi 2026-07-17: chỉ tài liệu). Nếu sau này muốn
  gộp Tầng 1–3 thành `npm run audit` hoặc job CI hàng tuần → mở thay đổi riêng, cập nhật file này.
