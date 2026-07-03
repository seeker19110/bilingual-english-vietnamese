# Audit — Gia sư tiếng Anh AI (tổng hợp)

> File này **gộp 3 báo cáo audit** trước đây (`AUDIT.md`, `AUDIT_REPORT.md`,
> `TRANSLATION_AUDIT.md`) thành một, cho gọn repo. Không nội dung nào bị xóa —
> chỉ gộp lại theo thứ tự thời gian, mới nhất lên trước.

## Mục lục tổng

- **[PHẦN A0 — Đợt rà bổ sung (2026-07-02, mới nhất)](#phần-a0--đợt-rà-bổ-sung-2026-07-02)** — 6 phát hiện mới theo checklist §1.5, đã vá toàn bộ trong cùng PR.
- **[PHẦN A — Audit source code v2 (2026-06-28)](#phần-a--audit-source-code-v2-2026-06-28)** — báo cáo audit đầy đủ nhất: bảo mật, ISO/IEC 25010, sổ phát hiện, yêu cầu kiểm thử, nợ kỹ thuật, lộ trình. **Đọc phần này trước.**
- **[PHẦN B — Audit source code v1 (2026-06-20, lịch sử)](#phần-b--audit-source-code-v1-2026-06-20-lịch-sử)** — bản audit đầu tiên (bảo mật, mobile-first, đa thiết bị). Mọi phát hiện ở đây **đã RESOLVED**, đối chiếu tại PHẦN A §4.1. Giữ lại để tra cứu bằng chứng/snippet gốc.
- **[PHẦN C — Audit bản dịch & đồng bộ từ vựng (2026-06-27)](#phần-c--audit-bản-dịch--đồng-bộ-từ-vựng-2026-06-27)** — chất lượng dịch Anh⇄Việt của từ điển + câu song ngữ, khác chủ đề (nội dung, không phải code) nhưng gộp chung cho gọn. Có 1 mục còn cần quyết định (§5 phần này).

---

## PHẦN A0 — Đợt rà bổ sung (2026-07-02)

> Rà lại toàn bộ theo quy trình đa lớp (§1.5 PHẦN A) sau các PR #156–#161. Cổng chất lượng
> trước khi rà: Build/Type/Lint/Test đều ✅ (63 test), `npm audit --omit=dev` = 0 lỗ hổng.
> 6 phát hiện mới, **vá toàn bộ trong cùng PR** (kèm 6 test mới cho F1 → 69 test).

| ID     | Mức       | Phát hiện (bằng chứng)                                                                                                                                                                                                                                                                        | Xử lý                                                                                                                                                                 | Trạng thái                                                 |
| ------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **F1** | 🟠 High   | `api/ai.ts` nhánh Groq: 5 nhánh "body hỏng" (HTTP 200 nhưng thiếu `choices`/`message`/content sai kiểu) trả 500 mà **không `refundUsage`**; `groqResp.json()` ném lỗi khi body không phải JSON → rơi vào catch `wrapEdge` cũng mất lượt. Người dùng bị trừ lượt mà không có câu trả lời.      | Gom parse vào `parseGroqText()` (giữ nguyên từng message lỗi), bọc try/catch hoàn lượt mọi nhánh; 6 test mới `api/ai.test.ts` (mock security/usage/fetchTimeout)      | ✅ RESOLVED                                                |
| **F2** | 🟠 High   | `api/pronunciation.ts` + bảng `pronunciations` production tạo tay theo PRONUNCIATION_CACHE_SETUP.md — bảng **không nằm trong `schema.sql`** và hướng dẫn cũ **không bật RLS** → client (anon key) ghi thẳng được vào cache phát âm dùng chung, có thể đầu độc `audio_url` cho mọi người dùng. | Thêm bảng (idempotent, kèm `voice_version`) + RLS chỉ-đọc vào `schema.sql`; migration `0006_pronunciations_rls.sql` cho DB đang chạy (cần chạy tay — xem PROGRESS.md) | ✅ RESOLVED (code) / ⚠️ chờ chạy migration trên production |
| **F3** | 🟡 Medium | `api/_lib/googleTts.ts` gọi Google TTS bằng `fetch` trần, **không timeout** — vi phạm checklist Lớp A (mọi fetch ra ngoài có AbortController); request TTS/pronunciation treo vô hạn khi Google sự cố.                                                                                        | Đổi sang `fetchWithTimeout` 30s (helper có sẵn)                                                                                                                       | ✅ RESOLVED                                                |
| **F4** | 🟡 Medium | `api/tts.ts` `TtsBodySchema.text` không có trần độ dài — body 64KB đẩy được chuỗi rất dài tới Google TTS (tính tiền theo ký tự).                                                                                                                                                              | Chặn `MAX_TTS_TEXT = 4000` ký tự → 413 (nội dung hợp lệ dài nhất của app thấp hơn nhiều; Google cũng chỉ nhận ~5000 byte)                                             | ✅ RESOLVED                                                |
| **F5** | 🟢 Low    | `public/sw.js` icon notification mặc định `/favicon.ico` — file **không tồn tại** (repo chỉ có `favicon.svg`) → icon push 404; Android cũng không render SVG trong notification.                                                                                                              | Đổi mặc định sang `/icon-192.png` (có sẵn)                                                                                                                            | ✅ RESOLVED                                                |
| **F6** | 🟢 Low    | `server.ts` CSP lặp nguyên văn 3 chỗ + còn whitelist `cdn.jsdelivr.net`, `fonts.googleapis.com`, `fonts.gstatic.com` dù không còn tài nguyên nào tải từ đó (font đã tự host PR #161). Kèm: comment/message "chỉ female/male" lỗi thời ở `api/tts.ts`/`api/pronunciation.ts` (đã 4 giọng).     | Gom 1 hằng `CSP_HEADER`, bỏ 3 domain thừa; sửa comment/message dùng `VOICE_IDS`                                                                                       | ✅ RESOLVED                                                |

**Không phát hiện vấn đề mới** ở: `usage.ts` (atomic RPC + fail-open đúng), `security.ts`
(CORS/auth/rate-limit), `ttsCrypto.ts`, `cloud.ts` (không còn đường ghi cột đếm lượt từ client),
`schema.sql` các bảng còn lại (RLS đủ), LIMITS client (`src/types.ts`) ⇄ server (`api/_lib/usage.ts`)
khớp nhau, service worker (chiến lược cache đúng), CI gates.

---

## PHẦN A — Audit source code v2 (2026-06-28)

# Báo cáo Audit Source Code — Gia sư tiếng Anh AI (song ngữ Việt ⇄ Anh)

> **Phiên bản:** 2.0 · **Ngày audit:** 2026-06-28 · **Người duyệt:** Audit kỹ thuật tự động + soát tay
> **Phạm vi:** Toàn bộ mã nguồn — frontend (`src/`), backend/API (`api/`, `server.ts`), lớp dữ liệu (`supabase/`), build/hạ tầng (`vite.config.ts`, `ecosystem.config.cjs`, `.github/`), và **bộ kiểm thử phần mềm** (`*.test.ts`, `vitest.config.ts`).
> **Hệ thống đang chạy thật:** https://en-vi.donghanhcungban.com (VPS Ubuntu + PM2 `english-tutor` + Nginx + Let's Encrypt).
> **Mục tiêu:** (1) Đánh giá chất lượng theo quy trình audit chuẩn; (2) Liệt kê phát hiện kèm bằng chứng `file:line` + hướng xử lý + trạng thái; (3) **Đặc tả đầy đủ yêu cầu kiểm thử phần mềm** (chiến lược, kế hoạch, ca kiểm thử, độ phủ, cổng chất lượng, ma trận truy vết) để dự án nâng dần độ chín mà không làm hỏng app live.

---

## Mục lục

1. [Quy trình & phương pháp audit](#1-quy-trình--phương-pháp-audit)
2. [Kết quả cổng chất lượng (ground truth)](#2-kết-quả-cổng-chất-lượng-ground-truth)
3. [Bảng điểm sức khoẻ (ISO/IEC 25010)](#3-bảng-điểm-sức-khoẻ-isoiec-25010)
4. [Sổ đăng ký phát hiện (Findings Register)](#4-sổ-đăng-ký-phát-hiện-findings-register)
5. [Chi tiết phát hiện & hướng xử lý](#5-chi-tiết-phát-hiện--hướng-xử-lý)
6. [YÊU CẦU KIỂM THỬ PHẦN MỀM](#6-yêu-cầu-kiểm-thử-phần-mềm)
7. [Sổ nợ kỹ thuật (Technical Debt Register)](#7-sổ-nợ-kỹ-thuật-technical-debt-register)
8. [Điểm đã làm tốt](#8-điểm-đã-làm-tốt)
9. [Đề xuất cải thiện sau audit](#9-đề-xuất-cải-thiện-sau-audit)
10. [Lộ trình đề xuất](#10-lộ-trình-đề-xuất)
11. [Phụ lục: lệnh & bằng chứng](#11-phụ-lục-lệnh--bằng-chứng)

---

## 1. Quy trình & phương pháp audit

Audit này tuân theo một quy trình nhiều lớp, kết hợp **phân tích tĩnh**, **soát mã thủ công** và **kiểm chứng động** (chạy thật các cổng chất lượng).

### 1.1 Các bước thực hiện

1. **Khảo sát cấu trúc** — lập bản đồ toàn bộ `src/`, `api/`, `supabase/`, `scripts/` (≈ 22.000 dòng `.ts/.tsx` trong `src`, ≈ 1.900 dòng trong `api`).
2. **Phân tích tĩnh** — chạy `tsc` (strict typecheck cho cả frontend lẫn API), `eslint` (`--max-warnings 0`).
3. **Soát mã theo chủ đề** — bảo mật, đếm lượt/chi phí, toàn vẹn dữ liệu, UX/mobile, khả năng truy cập (a11y), hiệu năng.
4. **Kiểm chứng động** — chạy `vitest run`, `npm run build` để xác nhận sản phẩm dựng được và test xanh (xem §2).
5. **Đối chiếu trạng thái** — so phát hiện cũ (audit v1, 2026-06-27) với mã hiện tại để cập nhật **trạng thái RESOLVED / OPEN**.
6. **Đặc tả kiểm thử** — xây dựng yêu cầu kiểm thử phần mềm đầy đủ (§6).

### 1.2 Tiêu chuẩn tham chiếu

| Lĩnh vực            | Tiêu chuẩn áp dụng                                       |
| ------------------- | -------------------------------------------------------- |
| Bảo mật ứng dụng    | OWASP Top 10 (2021), OWASP ASVS L1–L2, CWE               |
| Chất lượng phần mềm | ISO/IEC 25010 (8 đặc tính chất lượng)                    |
| Khả năng truy cập   | WCAG 2.1 mức AA                                          |
| Kiểm thử            | ISTQB (mức kiểm thử, kỹ thuật thiết kế ca), test pyramid |
| Hiệu năng web       | Core Web Vitals, Lighthouse budgets                      |

### 1.3 Thang phân loại mức nghiêm trọng

| Mức             | Ý nghĩa                                                                   | SLA xử lý              |
| --------------- | ------------------------------------------------------------------------- | ---------------------- |
| 🔴 **Critical** | Rò rỉ dữ liệu/secret, vượt giới hạn gây tốn tiền không kiểm soát, app sập | Sửa ngay, chặn release |
| 🟠 **High**     | Lỗi ảnh hưởng nhiều người dùng, mất dữ liệu thầm lặng, chi phí leo thang  | Trong sprint hiện tại  |
| 🟡 **Medium**   | Suy giảm UX/độ tin cậy, nợ kỹ thuật có rủi ro                             | 1–2 sprint tới         |
| 🟢 **Low**      | Polish, dài hạn, rủi ro thấp                                              | Backlog                |

### 1.4 Định nghĩa trạng thái

`✅ RESOLVED` đã sửa & xác minh trong mã hiện tại · `⚠️ PARTIAL` làm một phần · `🔲 OPEN` chưa làm · `📋 ACCEPTED` chấp nhận rủi ro có lý do.

### 1.5 Quy trình audit TOÀN DIỆN đa lớp (frontend → backend → UI/UX)

> Đây là "công thức" để rà soát từ lỗi nhỏ nhất, áp dụng cho **mọi lớp** của dự án. Mỗi lớp có một checklist riêng + công cụ riêng. Nguyên tắc: **chạy được công cụ tự động trước (bắt lỗi máy thấy), rồi soát tay theo checklist (bắt lỗi máy không thấy)**.

**Bước 0 — Hạ tầng audit (chạy 1 lần):** `npm install` → `npm run typecheck && npm run lint && npm test && npm run build`. Đây là lưới đầu tiên; mọi lỗi type/lint/test phải sạch trước khi soát tay.

**Lớp A — Backend / API (`api/`, `server.ts`)** — _lỗi ở đây tốn tiền & rò dữ liệu, ưu tiên cao nhất:_

- [ ] Mọi endpoint: thứ tự `CORS → content-type → rate limit → auth → validate body → đếm lượt → gọi provider`. Soát **thiếu bước nào**.
- [ ] **Đếm lượt đặt đúng chỗ**: consume _sau_ khi provider trả OK, hoặc hoàn lại khi lỗi (xem BUG-2).
- [ ] Mọi `fetch` ra ngoài có **timeout** (AbortController).
- [ ] Validate **kích thước** body/message/audio; ép `model`/`max_tokens` ở server (không tin client).
- [ ] Xử lý lỗi: mọi nhánh trả mã HTTP đúng (4xx vs 5xx vs 504), không nuốt lỗi thầm.
- [ ] Secret chỉ ở `.env` (server), không có tiền tố `VITE_`; `supabaseAdmin` chỉ ở server.
- [ ] FAIL-OPEN nhất quán (chặn nhầm người dùng tệ hơn lỡ 1 lượt khi DB lỗi).

**Lớp B — Lớp dữ liệu (`supabase/`, `src/lib/cloud.ts`, `storage.ts`)** — _lỗi ở đây gây sai số liệu/mất dữ liệu:_

- [ ] RLS bật trên **mọi** bảng per-user; test bằng 2 JWT khác nhau.
- [ ] Map snake_case ⇄ camelCase đúng kiểu (vd `created_at` là `bigint` → `Number()` an toàn; nếu là `timestamptz` thì `Number()` ra `NaN`).
- [ ] **Cùng một khái niệm phải tính giống nhau ở mọi nơi** (vd "ngày có hoạt động" trong streak vs biểu đồ — xem BUG-5).
- [ ] Migration idempotent (`if not exists`, `on conflict`), có thư mục `migrations/`.
- [ ] Cache có TTL/invalidation khi dữ liệu đổi (vd profile sau nâng Pro).

**Lớp C — Frontend logic (`src/lib`, `src/pages`)** — _lỗi state/đua/parse:_

- [ ] React Hook: `useEffect` đủ deps; **cleanup** hủy request (AbortController) khi unmount/đổi deps; tránh set-state sau khi unmount.
- [ ] Race condition: request cũ về trễ không ghi đè kết quả mới; `.finally` không bật/tắt loading sai khi abort (xem BUG-4).
- [ ] Parse dữ liệu AI (`parseJson`, tách `💬/✅`) bao phủ **cả 2 chiều A/B** và **chuỗi có dấu tiếng Việt** (xem BUG-1).
- [ ] Edge case: chuỗi rỗng, mảng rỗng, `null`/`undefined`, số 0, chia cho 0, `Math.max(...[])`.
- [ ] Tính toán lặp mỗi render (đọc localStorage/parse trong thân component) → cân nhắc `useMemo`.

**Lớp D — UI / UX / Accessibility (component, CSS, `index.html`)**:

- [ ] Loading/empty/error: mỗi luồng async có đủ **3 trạng thái**, phân biệt "lỗi mạng" vs "không có kết quả".
- [ ] Mobile: bàn phím ảo không che input; safe-area; touch target ≥ 44px; chữ ≥ 11px, input ≥ 16px (chống auto-zoom iOS).
- [ ] A11y (WCAG AA): `aria-label`/`<title>` cho icon/SVG, focus ring rõ, contrast đủ, `aria-expanded` cho toggle.
- [ ] i18n: **mọi** chuỗi có cả VI/EN theo `dir` A/B; không sót chuỗi cứng.
- [ ] Cross-browser: Web Speech (STT/TTS) có fallback cho Safari/Firefox; TTS iOS cần user-gesture.

**Lớp E — Build / hạ tầng (`vite.config.ts`, `.github/`, `ecosystem.config.cjs`)**:

- [ ] CI chạy **cổng chất lượng** trước deploy (hiện thiếu — T2).
- [ ] Bundle budget (kích thước chunk), nén Gzip/Brotli, code-split.
- [ ] Repo ↔ VPS đồng bộ (interpreter Node, biến môi trường).

**Bước cuối — Kỹ thuật tăng độ phủ phát hiện:**

1. **Đối chiếu chéo** (cross-reference): tìm cùng một logic ở ≥2 file rồi so chúng có khớp không (cách tìm BUG-5).
2. **Truy ngược từ output**: nhìn UI bất thường → lần ngược về hàm parse/format (cách tìm BUG-1).
3. **Đọc theo "đường đi của tiền"**: bám mọi luồng gọi provider trả phí, soi từng nhánh lỗi (cách tìm BUG-2).
4. **Đọc theo "đường đi của dữ liệu"**: localStorage ⇄ Supabase ⇄ UI, tìm chỗ lệch.
5. **`grep` các anti-pattern**: `catch {}` (nuốt lỗi), `as any`, `// eslint-disable`, `setTimeout` không clear, `fetch(` không timeout, regex thiếu cờ `i`/dấu.

---

## 2. Kết quả cổng chất lượng (ground truth)

Tất cả cổng chất lượng được **chạy thật** trong lần audit này (Node v22, sau `npm install` sạch):

| Cổng                  | Lệnh                                                    | Kết quả                           | Ghi chú                                                                        |
| --------------------- | ------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------ |
| Kiểu (frontend + API) | `npm run typecheck` (`tsc && tsc -p tsconfig.api.json`) | ✅ **PASS** (exit 0)              | Không lỗi type                                                                 |
| Lint                  | `npm run lint` (`eslint . --max-warnings 0`)            | ✅ **PASS** (exit 0)              | 0 cảnh báo. _Sửa "M4 ESLint không chạy" của v1: nay chạy tốt sau khi cài deps_ |
| Unit test             | `npx vitest run`                                        | ✅ **PASS** — 8 file, **49 test** | Lượt 5 thêm `vocab` (BUG-6); lượt 3 thêm lớp API                               |
| Build production      | `npm run build`                                         | ✅ **PASS** (exit 0)              | Sinh manifest + `tsc` + `vite build`, có nén Gzip/Brotli                       |
| **CI gate**           | `.github/workflows/ci.yml`                              | ✅ **MỚI**                        | Chạy cả 4 cổng trên mọi PR & push `main` (T2)                                  |

> **Tiến triển độ phủ:** lượt 1 **10/1** → lượt 2 **27/4** → lượt 3 **46/7** (thêm `api/_lib`) → lượt 5 **49 test / 8 file** (thêm `vocab`). Đã có **CI gate** chạy 4 cổng tự động. Còn lại có thể bổ sung integration test cho handler `api/ai.ts`/`api/stt.ts` (mock provider).

---

## 3. Bảng điểm sức khoẻ (ISO/IEC 25010)

| Đặc tính chất lượng        | Điểm   | Nhận xét                                                                                                                                                                    |
| -------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Functional suitability** | 8.5/10 | 7 mode/trang chính chạy thật, curriculum A1→B2 đầy đủ, song ngữ 2 chiều.                                                                                                    |
| **Performance efficiency** | 8.5/10 | Lazy-load, code-split, prefetch idle, PWA, nén Brotli/Gzip, chunk từ điển động.                                                                                             |
| **Security**               | 8/10   | Auth JWT server-side, RLS đầy đủ, AES-256-GCM cho audio cache, **đếm lượt atomic (RPC)**, **CORS đã siết**, timeout fetch. Còn rate-limit in-memory, prompt do client dựng. |
| **Reliability**            | 7.5/10 | FAIL-OPEN hợp lý, timeout chống treo, fallback nhiều nhà cung cấp AI. Streak nay đồng bộ tối đa 365 ngày (cửa sổ pull `cloud.ts`).                                          |
| **Usability / UX**         | 8/10   | i18n đầy đủ, mobile-first, ErrorBoundary, theme, đã sửa bàn phím ảo + báo lỗi mạng. Còn vài điểm a11y.                                                                      |
| **Maintainability**        | 6.5/10 | TS strict, lint xanh, tách lib rõ. **Trừ điểm nặng:** độ phủ test thấp, 2–3 component 700+ dòng.                                                                            |
| **Compatibility**          | 7/10   | Web Speech có fallback, nhưng cần kiểm thử cross-browser (Safari/Firefox) hệ thống hoá.                                                                                     |
| **Portability**            | 8/10   | Edge-runtime cho API, deploy được cả Vercel lẫn VPS Express.                                                                                                                |

**Kết luận:** Dự án ở trạng thái **MVP vững, đã deploy thật, không có lỗ hổng bảo mật chí mạng**. Toàn bộ phát hiện Critical/High của audit v1 **đã được xử lý** (xem §4). Nợ kỹ thuật nổi bật còn lại là **thiếu kiểm thử tự động** và **một vài component quá lớn** — đây là rào cản chính để dự án nâng từ "MVP" lên "production-grade bền vững".

---

## 4. Sổ đăng ký phát hiện (Findings Register)

### 4.1 Phát hiện Critical/High của audit v1 — TRẠNG THÁI HIỆN TẠI

> Đối chiếu trực tiếp với mã nguồn ngày 2026-06-28. **Tất cả đã RESOLVED.**

| #   | Vấn đề (v1)                         | Trạng thái  | Bằng chứng trong mã hiện tại                                                                                                                  |
| --- | ----------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| H1  | Đếm lượt không atomic               | ✅ RESOLVED | RPC `consume_usage` (`api/_lib/usage.ts:63-77`) + `supabase/migrations/0001_consume_usage.sql`; có fallback non-atomic an toàn nếu RPC thiếu. |
| H2  | `fetch` AI/STT không timeout        | ✅ RESOLVED | `api/_lib/fetchTimeout.ts` (AbortController + setTimeout); dùng trong `api/ai.ts:24,195,268`, `geminiApi.ts`, `openaiStt.ts`.                 |
| H3  | STT timeout vô tận                  | ✅ RESOLVED | `src/lib/stt.ts:41-45` (`noSpeechTimer` ~8s + `maxTimer` ~20s tự `stop()`).                                                                   |
| H4  | Bàn phím ảo che input Chat          | ✅ RESOLVED | `src/pages/Chat.tsx:208,362` (`scrollIntoView` khi focus/gửi).                                                                                |
| H5  | Dictionary không phân biệt lỗi mạng | ✅ RESOLVED | `src/pages/Dictionary.tsx:64-65` (`searchError`, `retryKey`) + nút "Thử lại" (`:372`).                                                        |
| H6  | Lưu phiên Chat lỗi thầm lặng        | ✅ RESOLVED | `src/pages/Chat.tsx:219-266` (`try/catch` quanh `saveChatSession`).                                                                           |
| H7  | Writing không validate độ dài       | ✅ RESOLVED | `src/pages/Writing.tsx:173,182` (chặn `wordCount < 20`).                                                                                      |
| H8  | Profile cache cũ sau khi nâng Pro   | ✅ RESOLVED | `src/lib/auth.ts:10-21` (TTL 5 phút cho cache profile).                                                                                       |
| H9  | Streak phụ thuộc localStorage       | ✅ RESOLVED | `pullUserData()` (`cloud.ts:120-183`) kéo **365 ngày** `daily_usage` về khi mở app; `STREAK_MAX_DAYS=365` (`storage.ts:186`).                 |
| H10 | CORS `*` + credentials              | ✅ RESOLVED | `api/_lib/security.ts:10-41` (chỉ phản chiếu origin trong whitelist + KHÔNG gắn `Allow-Credentials` với `*`).                                 |

### 4.2 Phát hiện đang mở (cần xử lý)

| #      | Mức       | Vấn đề                                                                                                                                                                                                                                                                  | Nhóm            | File chính                                 |
| ------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------ |
| **T1** | 🟠 High   | ⚠️ PARTIAL — **Độ phủ kiểm thử đang nâng dần**: 46 ca / 7 file gồm `curriculum`, `pronounceScore`, `srs`, `stats` + **lớp API** `usage`/`security`/`fetchTimeout`. Còn thiếu: **integration test cho handler** `api/ai.ts`/`api/stt.ts` (mock provider) và `ttsCrypto`. | Kiểm thử        | handler `api/*.ts`, phần còn lại `src/lib` |
| ~~T2~~ | 🟡 Medium | ✅ **RESOLVED** — Thêm `.github/workflows/ci.yml` chạy `typecheck + lint + test + build` trên mọi PR & push `main` (Node 22) → chặn mã hỏng trước khi merge/deploy.                                                                                                     | CI/CD           | `.github/workflows/ci.yml`                 |
| M1     | 🟡 Medium | `direction` (chiều A/B) không sync đa thiết bị (chỉ localStorage).                                                                                                                                                                                                      | Dữ liệu         | `src/lib/storage.ts`, `profiles`           |
| ~~M2~~ | 🟡 Medium | ✅ **RESOLVED** — Server **prepend** guardrail cố định (`SYSTEM_GUARDRAIL`) vào đầu system prompt ở `api/ai.ts` → AI luôn đóng vai gia sư ngôn ngữ dù client gửi prompt tuỳ ý. Khung ngắn, không ép format (giữ JSON cho writing/speaking).                             | Bảo mật/chi phí | `api/ai.ts`                                |
| M6     | 🟡 Medium | Rate limit **in-memory** (`api/_lib/security.ts:58`) — mất khi restart, không chia sẻ giữa instance.                                                                                                                                                                    | Bảo mật         | `api/_lib/security.ts:58-82`               |
| M7     | 🟡 Medium | Quiz ôn tập (QuizTab) không lưu lịch sử/điểm.                                                                                                                                                                                                                           | Tính năng       | `src/pages/Learn.tsx`                      |
| L1     | 🟢 Low    | Component quá lớn: `Learn.tsx` (839), `RoadmapTab.tsx` (749), `Lessons.tsx` (706).                                                                                                                                                                                      | Refactor        | —                                          |
| L2     | 🟢 Low    | Trùng `SetupScreen` giữa Chat & Speaking.                                                                                                                                                                                                                               | Refactor        | `Chat.tsx`, `Speaking.tsx`                 |
| L3     | 🟢 Low    | Master key TTS không cơ chế rotate/versioning.                                                                                                                                                                                                                          | Bảo mật         | `api/_lib/ttsCrypto.ts`                    |
| L5     | 🟢 Low    | Multi-tab sync thiếu (`storage` event) → đổi chiều A/B ở tab này, tab kia không cập nhật.                                                                                                                                                                               | Dữ liệu         | `src/lib/*`                                |
| L7     | 🟢 Low    | Không có metrics/alerting/log tập trung.                                                                                                                                                                                                                                | Hạ tầng         | —                                          |

### 4.3 Sổ lỗi cụ thể phát hiện trong rà soát SÂU (deep pass)

> Các lỗi **mới**, phát hiện khi đọc tay từng dòng theo quy trình §1.5. **Lượt 1:** BUG-1..5. **Lượt 2** (đọc `Speaking.tsx`, `tts.ts`, lib backend Gemini/STT/pronunciation, `vocab.ts`): BUG-6..8. **Lượt 3** (đọc `RoadmapTab.tsx`, `supabaseAdmin.ts` + viết test lớp API): không lỗi mới. **Lượt 4** (đọc nốt `Learn.tsx`, `Lessons.tsx`): BUG-9, BUG-10. Đến đây đã đọc tay **toàn bộ trang/UI lớn + lib + lớp API**. Cột **Trạng thái** phản ánh mã hiện tại.

| ID         | Mức       | Lớp           | Lỗi                                                                                                                                                                                                                                                  | Bằng chứng                                                 | Trạng thái                                                                                                                                                   |
| ---------- | --------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **BUG-1**  | 🟡 Medium | UI/Frontend   | **Nhãn "Nhận xét:" không bị cắt** ở bong bóng feedback chiều A. Regex chỉ khớp `Nhan xet` (không dấu) trong khi prompt phát ra `✅ Nhận xét:` (có dấu) → người Việt (chiều A — đối tượng CHÍNH) thấy chữ "Nhận xét:" dư.                             | `src/pages/Chat.tsx:128`; prompt `src/prompts/index.ts:42` | ✅ **FIXED** — regex thêm `Nhận xét` (có dấu).                                                                                                               |
| **BUG-2**  | 🟡 Medium | Backend       | **Mất lượt khi provider lỗi.** `checkAndConsumeUsage` chạy **trước** khi gọi AI/STT → provider lỗi/timeout vẫn **bị trừ 1 lượt** dù không nhận được kết quả. Mâu thuẫn FAIL-OPEN.                                                                    | `api/ai.ts`, `api/stt.ts`                                  | ✅ **FIXED** — thêm `refundUsage()` + RPC `refund_usage` (migration `0004`); hoàn lượt ở mọi nhánh provider lỗi/timeout.                                     |
| **BUG-3**  | 🟢 Low    | Tài liệu      | Audit v1 ghi cửa sổ pull streak là "40 ngày" — mã đã là 365.                                                                                                                                                                                         | `cloud.ts:122`, `storage.ts:186`                           | ✅ **FIXED** — sửa số liệu (§3, §4.1 H9).                                                                                                                    |
| **BUG-4**  | 🟢 Low    | Frontend/UX   | **Nhấp nháy spinner khi gõ nhanh ở Dictionary** — `.finally` tắt spinner cả khi request đã `abort()`.                                                                                                                                                | `src/pages/Dictionary.tsx:90-107`                          | ✅ **FIXED** — chỉ tắt nếu `!ctrl.signal.aborted`.                                                                                                           |
| **BUG-5**  | 🟡 Medium | Logic/Dữ liệu | **Streak ⇄ biểu đồ Dashboard không khớp** — `usageTotal` (stats) thiếu `learnCount` trong khi `getStreak` (storage) có → ngày chỉ học từ vựng hiện trống trên biểu đồ.                                                                               | `stats.ts:27-30` vs `storage.ts:188-193`                   | ✅ **FIXED** — cộng `learnCount` vào `usageTotal` + test `stats.test.ts`.                                                                                    |
| **BUG-6**  | 🟢 Low    | Logic/Dữ liệu | **Từ "đã thuộc" không chuẩn hoá chữ thường** trong khi "từ khó" thì có → các nơi tiêu thụ phải kiểm tra cả 2 dạng. Dễ vỡ.                                                                                                                            | `vocab.ts` (learned vs hard)                               | ✅ **FIXED** — `getLearnedWords`/`markLearned`/`isLearned` chuẩn hoá `toLowerCase` (đọc lowercase = tự migrate dữ liệu cũ, không mất); test `vocab.test.ts`. |
| **BUG-7**  | 🟢 Low    | UX/Audio      | **Mute giữa chừng vẫn đọc nốt phần feedback.** `stopSpeaking()` resolve clip hiện tại → `speakBilingual` chạy tiếp `speak(feedback)`.                                                                                                                | `tts.ts`; `Speaking.tsx`                                   | ✅ **FIXED** — thêm `playToken`: `stopSpeaking()` tăng token, `speakBilingual` bỏ phần còn lại nếu token đổi.                                                |
| **BUG-8**  | 🟢 Low    | Dữ liệu       | **STT qua Web Speech (fallback) chỉ đếm ở client**, server không đếm → `pullUserData` ghi đè làm "biến mất" lượt.                                                                                                                                    | `Speaking.tsx`                                             | ✅ **FIXED** — bỏ `incrementUsage('sttCount')` ở nhánh Web Speech (miễn phí, không qua `/api/stt` → không tính lượt).                                        |
| **BUG-9**  | 🟡 Medium | Logic/SRS     | **"Quên/Again" không ôn lại trong phiên.** Gợi ý UI ghi "Quên → ôn sớm" và `SRSReview.rate()` chủ ý tải lại thẻ "again", nhưng `reviewWord` đặt `due = now + max(0,1)·ngày` = **mai** → từ vừa quên KHÔNG hiện lại hôm nay (mã trái với lời hứa UI). | `srs.ts` (`due` calc) vs `Learn.tsx:600,665`               | ✅ **FIXED** — `again` → `due = now` (ôn lại ngay trong phiên); cập nhật `srs.test.ts`.                                                                      |
| **BUG-10** | 🟢 Low    | UX/Tài nguyên | **Micro mở dai dẳng sau khi rời trang.** `InlinePronounce` (kiểm tra phát âm từng câu) không dừng Web Speech khi unmount → mic mở tới ~20s sau khi back + cảnh báo setState-after-unmount.                                                           | `Lessons.tsx` `InlinePronounce` (thiếu cleanup)            | ✅ **FIXED** — thêm `useEffect` cleanup gọi `stopRef.current?.()`.                                                                                           |

**Quan sát thêm (không phải lỗi):**

- `created_at`/`submitted_at` là `bigint` epoch-ms (`schema.sql:30,41,52`) → `Number(...)` trong `cloud.ts` an toàn. ✅
- `api/ai.ts` nhánh Gemini trước đây trả 500 cho mọi lỗi (kể cả timeout) trong khi Groq/Anthropic trả 504 → đã **đồng bộ**: timeout→504, lỗi provider→502.
- `prevSessions = getChatSessions(...).slice(0,3)` (`Chat.tsx`) đọc localStorage mỗi render — có thể `useMemo` (Low).

---

## 5. Chi tiết phát hiện & hướng xử lý

### 5.1 T1 — Độ phủ kiểm thử thấp (🟠 High)

**Hiện trạng:** Chỉ `src/lib/curriculum.test.ts` (10 ca). Các module logic thuần — SRS (`srs.ts`), chấm phát âm (`pronounceScore.ts`), thống kê (`stats.ts`), POS (`pos.ts`), vocab (`vocab.ts`) — và **toàn bộ lớp API** (đếm lượt atomic, CORS, rate limit, validate auth, timeout, mã hoá TTS) **không có test hồi quy nào**.
**Rủi ro:** Các sửa lỗi H1–H10 (đếm lượt atomic, timeout, CORS…) hiện **không được test bảo vệ** → dễ hồi quy âm thầm khi refactor. Đây chính là lý do audit yêu cầu một bộ kiểm thử đầy đủ.
**Hướng xử lý:** Triển khai kế hoạch kiểm thử §6 — ưu tiên unit test cho `srs.ts`, `pronounceScore.ts`, `stats.ts` (logic thuần, dễ test) và unit test cho `api/_lib/usage.ts`, `security.ts`, `fetchTimeout.ts` (bảo vệ các fix bảo mật).

### 5.2 T2 — Thiếu cổng chất lượng trong CI (🟡 Medium)

**Hiện trạng:** `.github/workflows/deploy.yml` được kích hoạt khi push `main`, SSH vào VPS rồi `git reset --hard` + `npm install` + `npm run build` + `pm2 restart`. **Không có** bước chạy `typecheck`/`lint`/`test` như một cổng chặn (gate) **trước** khi triển khai.
**Rủi ro:** Một commit làm hỏng test/lint vẫn được deploy thẳng lên app live (chỉ `vite build` lỗi mới chặn; lỗi logic/test sẽ lọt).
**Hướng xử lý:** Thêm workflow CI (`on: pull_request` và `on: push`) chạy `npm ci && npm run typecheck && npm run lint && npm test && npm run build`; chỉ cho merge/deploy khi xanh. (Xem §6.7 — Definition of Done & cổng chất lượng.)

### 5.3 M2 — System prompt dựng ở client (⚠️ PARTIAL)

**Tiến triển:** Prompt nền **đã** được gom về `src/prompts/index.ts` (chat/writing/speaking, 2 chiều A/B) — đúng quy ước CLAUDE.md. **Còn lại:** server (`api/ai.ts:147`) vẫn nhận `system` từ client và chỉ cắt độ dài 8000 ký tự; người dùng đã đăng nhập về lý thuyết có thể gửi prompt tuỳ ý để lái AI thành chatbot chung (tốn quota của chính họ, lệch mục đích).
**Hướng xử lý (giai đoạn sau, cần test kỹ vì đụng 3 mode):** server **prepend** một "guardrail" cố định ("Bạn là gia sư ngôn ngữ, chỉ hỗ trợ học…") trước prompt client. Bắt buộc kèm test hồi quy (xem TC-AI-05 §6.4).

### 5.4 M6 — Rate limit in-memory

Đủ cho 1 instance hiện tại (VPS đơn). Khi scale ngang cần Redis/Upstash để rate limit toàn cụm. **Ghi nhận, chưa cần làm ngay** — nhưng cần ca kiểm thử xác nhận hành vi reset cửa sổ (TC-SEC-03 §6.4).

### 5.5 Các mục Low (L1–L7)

Thuần refactor/hạ tầng, rủi ro hồi quy cao trên app live → để **PR riêng**, mỗi PR kèm test trước khi tách (test là "lưới an toàn" cho refactor).

---

## 6. YÊU CẦU KIỂM THỬ PHẦN MỀM

> Đây là phần trọng tâm của bản cập nhật. Mục tiêu: đưa dự án từ "build/lint/typecheck xanh + 10 unit test" lên một **bộ kiểm thử có chiến lược**, đủ bảo vệ các luồng sinh tiền (gọi AI/STT/TTS) và các fix bảo mật, đồng thời làm lưới an toàn cho refactor.

### 6.1 Mục tiêu & nguyên tắc kiểm thử

1. **Bảo vệ luồng tốn tiền trước tiên** — mọi đường gọi AI/STT/TTS phải có test cho: đếm lượt (atomic + giới hạn), auth bắt buộc, timeout, rate limit.
2. **Chống hồi quy các fix đã làm** — H1–H10 phải được "khoá" bằng test để không tái phát.
3. **Kim tự tháp kiểm thử** — nhiều unit (rẻ, nhanh) → ít integration → rất ít E2E/thủ công cho luồng then chốt.
4. **Test phải chạy offline & xác định (deterministic)** — đã có `vitest.setup.ts` mock `fetch('/data/...')`; mở rộng nguyên tắc này: mock thời gian (`vi.useFakeTimers`), mock Supabase client, mock provider AI.
5. **Chi phí $0 khi test** — KHÔNG gọi API thật trong test; luôn mock nhà cung cấp.

### 6.2 Các mức & loại kiểm thử (Test Levels & Types)

| Mức                     | Phạm vi                                              | Công cụ                          | Trạng thái hiện tại                                                                            |
| ----------------------- | ---------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Unit**                | Hàm/logic thuần trong `src/lib`, `api/_lib`          | Vitest (+ happy-dom)             | ✅ `curriculum`, `pronounceScore`, `srs`, `stats`, `usage`, `security`, `fetchTimeout` (46 ca) |
| **Integration (API)**   | Handler `api/*.ts` với mock Supabase/provider        | Vitest + mock                    | 🔲 Chưa có (đã có unit cho `api/_lib`; handler còn lại)                                        |
| **Component**           | Render React + tương tác (Chat, Writing, Dictionary) | Vitest + @testing-library/react  | 🔲 Chưa có (cần thêm dev-dep)                                                                  |
| **E2E / luồng**         | Đăng nhập → chat → đếm lượt, qua trình duyệt thật    | Playwright (đã có Chromium sẵn)  | 🔲 Chưa có                                                                                     |
| **Thủ công / khám phá** | Mobile keyboard, iOS Safari TTS, STT thực            | Checklist tay                    | 📋 Một phần (đã kiểm khi sửa)                                                                  |
| **Phi chức năng (NFR)** | Bảo mật, hiệu năng, a11y, tương thích                | Lighthouse, axe, OWASP checklist | ⚠️ Lighthouse có (`LIGHTHOUSE_OPTIMIZATION.md`)                                                |

### 6.3 Môi trường & dữ liệu kiểm thử

- **Runtime:** Node ≥ 22 (khớp `engines`), `environment: happy-dom` cho test đụng `localStorage`/`window`.
- **Mock có sẵn:** `fetch('/data/...')` → đọc `public/` (`vitest.setup.ts`). **Cần bổ sung:** factory mock cho `getSupabaseAdmin()` (trả về object có `.from().select()/.rpc()/.auth.getUser()`), và mock `fetchWithTimeout`.
- **Fake timers:** dùng `vi.useFakeTimers()` cho SRS (tính `due`), TTL profile (5 phút), timeout STT (8s/20s), rate-limit (cửa sổ 60s).
- **Dữ liệu mẫu:** dùng vài `DictEntry` cố định + bộ `daily_usage` giả để test giới hạn gói.

### 6.4 Kế hoạch ca kiểm thử ưu tiên (Test Plan)

> Ký hiệu: **P0** = bắt buộc (luồng tiền/bảo mật) · **P1** = nên có sớm · **P2** = tốt nếu có.
> Mỗi ca ghi theo dạng: tiền điều kiện → thao tác → kỳ vọng.

#### A. Unit — `src/lib/srs.ts` (SM-2) · ưu tiên **P1**

| ID        | Ca kiểm thử                       | Kỳ vọng                                                     |
| --------- | --------------------------------- | ----------------------------------------------------------- |
| TC-SRS-01 | `addToSRS` từ mới                 | Tạo thẻ `interval:1, ease:2.5, reps:0`, `due ≈ now`         |
| TC-SRS-02 | `addToSRS` từ đã có               | Không ghi đè (idempotent)                                   |
| TC-SRS-03 | `reviewWord('again')`             | `interval=0`, `ease` giảm 0.2 (sàn 1.3), `due ≈ now+1 ngày` |
| TC-SRS-04 | `reviewWord('good')` lần 1→2→3    | interval 1 → 4 → `round(prev*ease)`                         |
| TC-SRS-05 | `reviewWord('easy')`              | `ease` tăng 0.15 (trần 2.5), interval nhân 1.3              |
| TC-SRS-06 | `getDueWords` lọc theo `due<=now` | Chỉ trả từ đến hạn (dùng fake timer)                        |
| TC-SRS-07 | `getSRSStats`                     | `total`/`due` đúng                                          |

_Lưu ý:_ các hàm này gọi `pushProgress()` (đồng bộ DB) → cần **mock `./progressSync`** để test offline, xác định.

#### B. Unit — `src/lib/pronounceScore.ts` · ưu tiên **P1**

| ID         | Ca kiểm thử                     | Kỳ vọng                                                     |
| ---------- | ------------------------------- | ----------------------------------------------------------- |
| TC-PRON-01 | `scorePronunciation` khớp hệt   | 100                                                         |
| TC-PRON-02 | chuỗi rỗng                      | 0                                                           |
| TC-PRON-03 | chuẩn hoá (hoa/thường, dấu câu) | "Hello!" ≈ "hello" → 100                                    |
| TC-PRON-04 | `pronounceFeedback` các ngưỡng  | ≥85 "Tuyệt vời" · 65–84 "Khá tốt" · 40–64 · <40             |
| TC-PRON-05 | `scoreWords` highlight          | mảng `{word, ok}` đúng số phần tử, cho phép 1 lỗi ký tự nhỏ |

#### C. Unit — `src/lib/stats.ts` (gom số liệu Dashboard) · ưu tiên **P2**

| ID         | Ca kiểm thử                | Kỳ vọng             |
| ---------- | -------------------------- | ------------------- |
| TC-STAT-01 | Streak liên tục 3 ngày     | streak = 3          |
| TC-STAT-02 | Đứt ngày giữa              | streak reset đúng   |
| TC-STAT-03 | % hoàn thành CEFR theo cấp | khớp ngưỡng mở khoá |

#### D. Unit/Integration — `api/_lib/usage.ts` (đếm lượt atomic) · ưu tiên **P0**

| ID          | Ca kiểm thử                | Kỳ vọng                              |
| ----------- | -------------------------- | ------------------------------------ |
| TC-USAGE-01 | RPC trả `true` (còn lượt)  | `{ ok: true }`                       |
| TC-USAGE-02 | RPC trả `false` (hết lượt) | `{ ok: false, message }` theo gói    |
| TC-USAGE-03 | RPC lỗi (schema cũ)        | rơi xuống `legacyCheckAndConsume`    |
| TC-USAGE-04 | DB ném exception           | **FAIL-OPEN** → `{ ok: true }`       |
| TC-USAGE-05 | Gói pro vs free            | đọc đúng `LIMITS`                    |
| TC-USAGE-06 | `isUsageMode`              | chỉ nhận `chat/writing/speaking/stt` |

_Cách test:_ tiêm mock `getSupabaseAdmin` để điều khiển `.rpc()`, `.from().select()`.

#### E. Unit — `api/_lib/security.ts` (CORS, rate limit, auth) · ưu tiên **P0**

| ID         | Ca kiểm thử                                  | Kỳ vọng                                                      |
| ---------- | -------------------------------------------- | ------------------------------------------------------------ |
| TC-SEC-01  | `getCorsHeaders` không set `ALLOWED_ORIGINS` | `*`, **không** `Allow-Credentials`                           |
| TC-SEC-02  | Origin trong whitelist                       | phản chiếu origin + `Allow-Credentials: true`                |
| TC-SEC-02b | Origin ngoài whitelist                       | trả origin đầu danh sách, **không** credentials              |
| TC-SEC-03  | `checkRateLimit` vượt ngưỡng                 | request thứ N+1 → `false`; sau 60s (fake timer) → `true` lại |
| TC-SEC-04  | `checkRateLimit` theo `bucket`               | bộ đếm tách biệt giữa bucket                                 |
| TC-SEC-05  | `validateAuth` thiếu/sai Bearer              | `null`                                                       |
| TC-SEC-06  | `validateAuth` token hợp lệ (mock)           | `{ userId }`                                                 |
| TC-SEC-07  | `SKIP_AUTH=true` + `NODE_ENV=production`     | **KHÔNG** bypass (vẫn yêu cầu token)                         |

#### F. Unit — `api/_lib/fetchTimeout.ts` · ưu tiên **P0**

| ID       | Ca kiểm thử                       | Kỳ vọng                      |
| -------- | --------------------------------- | ---------------------------- |
| TC-FT-01 | fetch trả nhanh                   | trả Response bình thường     |
| TC-FT-02 | fetch quá `timeoutMs` (mock chậm) | ném lỗi "Hết thời gian chờ…" |
| TC-FT-03 | clearTimeout chạy ở `finally`     | không rò timer               |

#### G. Integration — `api/ai.ts` (handler chat/writing) · ưu tiên **P0**

| ID       | Ca kiểm thử                        | Kỳ vọng                           |
| -------- | ---------------------------------- | --------------------------------- |
| TC-AI-01 | `OPTIONS`                          | 204 + CORS headers                |
| TC-AI-02 | method ≠ POST                      | 405                               |
| TC-AI-03 | thiếu auth                         | 401                               |
| TC-AI-04 | vượt rate limit (5/phút)           | 429                               |
| TC-AI-05 | body > 64KB / message > giới hạn   | 413                               |
| TC-AI-06 | hết lượt (mock usage)              | 429 + message giới hạn            |
| TC-AI-07 | provider trả OK (mock Gemini/Groq) | 200 + `content[0].text` chuẩn hoá |
| TC-AI-08 | provider timeout                   | 504                               |

#### H. Component (React) · ưu tiên **P1** _(cần thêm `@testing-library/react`)_

| ID       | Ca kiểm thử                  | Kỳ vọng                                       |
| -------- | ---------------------------- | --------------------------------------------- |
| TC-UI-01 | `Writing` submit bài < 20 từ | nút disable / báo lỗi, **không** gọi API (H7) |
| TC-UI-02 | `Dictionary` khi fetch lỗi   | hiện "Lỗi mạng" + nút "Thử lại" (H5)          |
| TC-UI-03 | `Chat` lưu phiên thất bại    | toast lỗi, **không** mất nội dung input (H6)  |
| TC-UI-04 | `ErrorBoundary` bắt lỗi con  | hiện fallback, không trắng trang              |

#### I. E2E (Playwright) · ưu tiên **P2**

| ID        | Ca kiểm thử                   | Kỳ vọng                                 |
| --------- | ----------------------------- | --------------------------------------- |
| TC-E2E-01 | Đăng nhập → mở Chat → gửi tin | nhận phản hồi, badge lượt giảm          |
| TC-E2E-02 | Dùng hết lượt Free            | bị chặn đúng thông điệp                 |
| TC-E2E-03 | Đổi theme (4 theme)           | nền + accent + `<meta theme-color>` đổi |

### 6.5 Kiểm thử phi chức năng (NFR)

**Bảo mật (OWASP):**

- Quét `git log --all -- .env` xác nhận secret chưa từng commit (đã nêu ở PHẦN B).
- Kiểm RLS thủ công: user A không đọc được dữ liệu user B (test bằng 2 JWT).
- `npm audit` định kỳ trong CI; theo dõi CVE phụ thuộc.

**Hiệu năng (đã có nền tảng — `LIGHTHOUSE_OPTIMIZATION.md`, `VITE_BUILD_OPTIMIZATION.md`):**

- Ngân sách: LCP < 2.5s (3G nhanh), TBT < 200ms, bundle vendor-core gzip < 50KB.
- Theo dõi kích thước chunk sau build (`stats.html` đã sinh sẵn).

**Khả năng truy cập (WCAG 2.1 AA):**

- Chạy axe/Lighthouse a11y; mục tiêu ≥ 90.
- Đã biết & **chấp nhận** (📋): khoá zoom mobile (`maximum-scale=1`) — bù bằng sàn chữ ≥11px, input 16px.
- Cần: `aria-label`/`<title>` cho SVG minh hoạ, focus ring rõ, contrast badge theme sáng (M5 cũ).

**Tương thích đa trình duyệt/thiết bị (cần hệ thống hoá):**

| Thiết bị/Trình duyệt   | Hạng mục cần kiểm                                   |
| ---------------------- | --------------------------------------------------- |
| iOS Safari             | TTS cần user-gesture, safe-area input, STT fallback |
| Android Chrome         | bàn phím ảo không che input                         |
| Firefox/Safari desktop | Web Speech fallback (text input) hoạt động          |

**Độ tin cậy:**

- Kiểm FAIL-OPEN: khi Supabase lỗi, đếm lượt **cho qua** (không chặn nhầm) — TC-USAGE-04.
- Kiểm timeout: provider treo → 504 rõ ràng, không treo vô hạn — TC-FT-02, TC-AI-08.

### 6.6 Ma trận truy vết (Traceability: Phát hiện → Ca kiểm thử)

| Phát hiện                | Ca kiểm thử bảo vệ                                        |
| ------------------------ | --------------------------------------------------------- |
| H1 (đếm lượt atomic)     | TC-USAGE-01..06, TC-AI-06                                 |
| H2 (timeout AI/STT)      | TC-FT-01..03, TC-AI-08                                    |
| H3 (STT timeout)         | (thủ công TC-MAN-STT) + unit `stt.ts` nếu tách được timer |
| H5 (Dictionary lỗi mạng) | TC-UI-02                                                  |
| H6 (lưu Chat an toàn)    | TC-UI-03                                                  |
| H7 (Writing validate)    | TC-UI-01                                                  |
| H8 (profile TTL)         | TC-AUTH-TTL (unit `auth.ts` với fake timer)               |
| H10 (CORS)               | TC-SEC-01, 02, 02b                                        |
| M2 (guardrail prompt)    | TC-AI-05 (khi triển khai)                                 |
| M6 (rate limit)          | TC-SEC-03, 04                                             |

### 6.7 Cổng chất lượng & Definition of Done (DoD)

**Cổng bắt buộc trước mỗi merge/PR và trước deploy (đề xuất đưa vào CI — xử lý T2):**

```bash
npm ci
npm run typecheck   # tsc (frontend) + tsc -p tsconfig.api.json
npm run lint        # eslint --max-warnings 0
npm test            # vitest run — phải xanh
npm run build       # phải dựng được
```

**Definition of Done cho một thay đổi code:**

- [ ] Có unit/integration test cho logic mới hoặc lỗi vừa sửa (chống hồi quy).
- [ ] 4 cổng trên xanh cục bộ.
- [ ] Không thêm secret vào mã (dùng `.env`).
- [ ] Mọi luồng gọi AI/STT/TTS mới đều qua đếm lượt + auth + timeout.
- [ ] Cập nhật `CLAUDE.md` mục "Trạng thái hiện tại" nếu đổi kiến trúc.

**Mục tiêu độ phủ (coverage) tăng dần:**

- Giai đoạn 1: bật `--coverage` (Vitest/v8), thiết lập **baseline**.
- Giai đoạn 2: ngưỡng tối thiểu cho `src/lib/**` và `api/_lib/**` ở **70%** lines/branches.
- Giai đoạn 3: nâng dần, không hạ ngưỡng (ratchet).

### 6.8 Checklist kiểm thử hồi quy thủ công (smoke test trước release)

- [ ] Đăng nhập/đăng xuất (Supabase Auth).
- [ ] Chat: gửi tin trên **mobile** (bàn phím không che input), nhận phản hồi, badge lượt giảm.
- [ ] STT: không nói trong ~20s → tự dừng + báo "không nghe thấy".
- [ ] Dictionary: tắt mạng → báo "lỗi mạng" + nút "Thử lại" (khác "không tìm thấy").
- [ ] Writing: submit bài < 20 từ → bị chặn.
- [ ] Nâng Pro (đổi `plan` DB) → trong ≤5 phút hết bị giới hạn Free.
- [ ] Đếm lượt: 2 request song song lúc gần hết lượt → chỉ 1 vượt được tính (atomic).
- [ ] 4 theme đổi đúng nền + accent + `theme-color`.
- [ ] PWA/iPhone: hội thoại đọc liền mạch nhiều câu.

### 6.9 Việc cần bổ sung để chạy được kế hoạch

- Thêm dev-dependency: `@testing-library/react`, `@testing-library/user-event` (cho mục H), `@vitest/coverage-v8` (cho 6.7), tùy chọn `@playwright/test` (đã có Chromium ở `/opt/pw-browsers`).
- Tạo helper `src/test/` & `api/_lib/__mocks__/` cho mock Supabase/provider.
- Thêm script: `"test:coverage": "vitest run --coverage"`.

---

## 7. Sổ nợ kỹ thuật (Technical Debt Register)

| ID   | Nợ kỹ thuật                                                           | Tác động                        | Đề xuất                               |
| ---- | --------------------------------------------------------------------- | ------------------------------- | ------------------------------------- |
| TD-1 | Thiếu test (T1)                                                       | Refactor rủi ro, fix dễ hồi quy | Triển khai §6 theo P0→P1→P2           |
| TD-2 | CI không có cổng chất lượng (T2)                                      | Mã hỏng lọt lên prod            | Thêm workflow CI (§6.7)               |
| TD-3 | Component 700–839 dòng (`Learn.tsx`, `RoadmapTab.tsx`, `Lessons.tsx`) | Khó đọc/bảo trì                 | Tách sub-view **sau khi có test**     |
| TD-4 | Prompt dựng client (M2)                                               | Lệch mục đích, tốn quota        | Guardrail server-side + TC-AI-05      |
| TD-5 | Rate limit in-memory (M6)                                             | Không scale ngang               | Redis/Upstash khi cần                 |
| TD-6 | Master key TTS không versioning (L3)                                  | Khó rotate key                  | Thêm `key_version` vào metadata cache |
| TD-7 | Không metrics/alert (L7)                                              | Khó phát hiện sự cố prod        | Sentry/log tập trung                  |

---

## 8. Điểm đã làm tốt (giữ nguyên)

- **TypeScript strict** cho cả frontend lẫn API; **lint xanh** với `--max-warnings 0`.
- Lazy-load + code-split theo trang, prefetch idle, PWA, nén Brotli/Gzip, chunk từ điển động.
- i18n đầy đủ (VI/EN) + 2 chiều học (A/B) qua `labelA/labelB`.
- Auth JWT Supabase **server-side**, RLS đầy đủ trên mọi bảng per-user.
- Đếm lượt **authoritative ở server + atomic (RPC)**, tách STT khỏi giới hạn chat.
- Mã hoá audio cache **AES-256-GCM**, key chỉ phát cho request có JWT hợp lệ.
- **Timeout** mọi lệnh gọi nhà cung cấp (chống treo), **fallback nhiều provider** (Gemini→Groq→Anthropic).
- SRS SM-2 + merge sync; từ điển 10k từ sạch; input validation server (giới hạn body/độ dài/sanitize).
- **FAIL-OPEN** hợp lý (không chặn nhầm người dùng khi DB lỗi).
- Đã có `vitest.setup.ts` cho phép test chạy **offline, xác định** — nền tảng tốt để mở rộng.

---

## 9. Đề xuất cải thiện sau audit

> Tổng hợp các cải thiện **nên làm** sau đợt audit này, gom theo lĩnh vực, kèm **Tác động** (giá trị mang lại) và **Công sức** (ước lượng) để dễ chọn việc. Ưu tiên: làm việc **Tác động cao / Công sức thấp** trước.

### 9.1 Chất lượng & độ tin cậy (ưu tiên #1)

| Đề xuất                                                                                               | Trạng thái                             |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **CI gate** (`typecheck + lint + test + build`) cho PR & push (T2).                                   | ✅ Đã làm (`.github/workflows/ci.yml`) |
| **Mở rộng bộ test** (P0 `api/_lib`, P1 `lib` thuần) — khoá H1/H2/H10 + BUG đã sửa.                    | ✅ Đã làm (49 test/8 file)             |
| **Bật coverage** (`@vitest/coverage-v8`) + ngưỡng 70% cho `lib/**` & `api/_lib/**`, ratchet tăng dần. | 🔲 Đề xuất (Trung bình)                |
| **Giám sát lỗi production** (Sentry hoặc log tập trung) thay cho `console.warn` rải rác (L7).         | 🔲 Đề xuất (Cao)                       |
| **Pre-commit hook** (husky + lint-staged) chạy lint/typecheck cục bộ.                                 | 🔲 Đề xuất (Thấp)                      |

### 9.2 Sửa các lỗi vừa phát hiện (deep pass §4.3)

| Đề xuất                                                                       | Trạng thái |
| ----------------------------------------------------------------------------- | ---------- |
| **BUG-1** — sửa regex nhãn "Nhận xét" (chiều A).                              | ✅ Đã sửa  |
| **BUG-2** — hoàn lượt (`refundUsage` + RPC) khi provider lỗi/timeout.         | ✅ Đã sửa  |
| **BUG-4** — không tắt spinner khi request đã abort (Dictionary).              | ✅ Đã sửa  |
| **BUG-5** — cộng `learnCount` vào `usageTotal` để streak ⇄ biểu đồ nhất quán. | ✅ Đã sửa  |
| **BUG-9** — "Quên/Again" ôn lại ngay trong phiên (đúng lời hứa UI).           | ✅ Đã sửa  |
| **BUG-10** — dừng micro khi rời trang (InlinePronounce cleanup).              | ✅ Đã sửa  |
| **BUG-6** — chuẩn hoá chữ thường cho "từ đã thuộc" (tự migrate khi đọc).      | ✅ Đã sửa  |
| **BUG-7** — huỷ chuỗi đọc bilingual khi mute giữa chừng (`playToken`).        | ✅ Đã sửa  |
| **BUG-8** — không tính lượt STT cho nhánh Web Speech (miễn phí).              | ✅ Đã sửa  |

### 9.3 Bảo mật & chi phí

| Đề xuất                                                                                       | Tác động                                         | Công sức   |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------- |
| **Guardrail system prompt phía server** (M2) — server prepend khung "chỉ là gia sư ngôn ngữ". | ✅ Đã làm (`SYSTEM_GUARDRAIL` trong `api/ai.ts`) |
| **Rate limit dùng Redis/Upstash** (M6) khi scale ngang.                                       | Trung bình (chỉ khi >1 instance)                 | Trung bình |
| **Rotate/versioning master key TTS** (L3) — thêm `key_version` vào metadata cache.            | Thấp — sẵn sàng xoay khoá                        | Trung bình |
| **Quét secret định kỳ** (`git log --all -- .env`, `npm audit` trong CI).                      | Trung bình                                       | Thấp       |

### 9.4 Kiến trúc & khả năng bảo trì

| Đề xuất                                                                                                                                           | Tác động                | Công sức |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------- |
| **Tách component lớn** `Learn.tsx` (839), `RoadmapTab.tsx` (749), `Lessons.tsx` (706) thành sub-view — **sau khi có test làm lưới an toàn** (L1). | Trung bình — dễ đọc/sửa | Cao      |
| **Gom `SetupScreen` dùng chung** giữa Chat & Speaking (L2).                                                                                       | Thấp                    | Thấp     |
| **Gom bảng màu** về `src/lib/colorScheme.ts` (M3 — cân nhắc vì cấu trúc khác nhau).                                                               | Thấp                    | Thấp     |
| **`useMemo`** cho các phép đọc localStorage/parse lặp mỗi render (vd `Chat.tsx:273`).                                                             | Thấp                    | Thấp     |

### 9.5 Dữ liệu & đồng bộ

| Đề xuất                                                                                        | Tác động   | Công sức                   |
| ---------------------------------------------------------------------------------------------- | ---------- | -------------------------- |
| **Sync `direction` (A/B) lên `profiles`** (M1) — đổi máy không bị reset về 'A'.                | Trung bình | Trung bình (cần migration) |
| **Multi-tab sync** qua `storage` event (L5) — đổi theme/chiều/đăng xuất đồng bộ giữa tab.      | Thấp       | Thấp                       |
| **Giữ nguyên quy ước migration idempotent** + ghi rõ thứ tự chạy trong `migrations/README.md`. | Trung bình | Thấp                       |

### 9.6 UX / UI / Accessibility

| Đề xuất                                                                                                          | Tác động   | Công sức   |
| ---------------------------------------------------------------------------------------------------------------- | ---------- | ---------- |
| **Chuẩn hoá 3 trạng thái async** (loading / empty / error) cho mọi luồng gọi mạng.                               | Trung bình | Trung bình |
| **A11y (WCAG AA)**: `aria-label`/`<title>` cho SVG minh hoạ, focus ring rõ, tăng contrast badge theme sáng (M5). | Trung bình | Thấp       |
| **Hiển thị lượt còn lại trên mobile** (badge nhỏ) thay vì ẩn hẳn.                                                | Thấp       | Thấp       |
| **Kiểm thử cross-browser có hệ thống** (Safari/Firefox/iOS): STT fallback + TTS user-gesture (xem §6.5).         | Trung bình | Trung bình |

### 9.7 Sản phẩm & tăng trưởng

| Đề xuất                                                                              | Tác động        | Công sức   |
| ------------------------------------------------------------------------------------ | --------------- | ---------- |
| **Cổng thanh toán Pro** — giới hạn lượt đã sẵn server-side, chỉ thiếu nâng cấp gói.  | Cao — doanh thu | Cao        |
| **Lưu lịch sử/điểm Quiz** (M7) — theo dõi tiến bộ ôn tập.                            | Trung bình      | Thấp       |
| **Analytics học tập** (retention, từ khó, band theo thời gian) để cải tiến nội dung. | Trung bình      | Trung bình |

### 9.8 Trải nghiệm lập trình viên (DevEx)

| Đề xuất                                                                                    | Tác động   | Công sức |
| ------------------------------------------------------------------------------------------ | ---------- | -------- |
| **Script tiện ích**: `test:coverage`, `test:watch` (đã có), `format` (Prettier).           | Thấp       | Thấp     |
| **PR template** trong `.github/` (mục: mô tả, ảnh hưởng, cách test).                       | Thấp       | Thấp     |
| **Đồng bộ repo ↔ VPS** (interpreter Node, biến môi trường, log debug trong `security.ts`). | Trung bình | Thấp     |

---

## 10. Lộ trình đề xuất

**Sprint hiện tại (bảo vệ những gì đã sửa):**

1. **T2** — thêm CI gate (`typecheck + lint + test + build`) cho PR & push (nhanh, chặn hồi quy ngay).
2. **T1/P0** — unit test cho `api/_lib/usage.ts`, `security.ts`, `fetchTimeout.ts` (khoá H1, H2, H10).
3. **T1/P1** — unit test cho `srs.ts`, `pronounceScore.ts` (logic thuần, ROI cao).

**Sprint kế tiếp:** 4. Integration test `api/ai.ts` (TC-AI-\*) + component test Writing/Dictionary/Chat (khoá H5, H6, H7). 5. Bật `--coverage`, đặt baseline rồi ngưỡng 70% cho `lib/**` & `api/_lib/**`. 6. **M2** — guardrail system prompt phía server (kèm TC-AI-05).

**Backlog (PR riêng, đã có test làm lưới an toàn):** 7. **L1** — tách `Learn.tsx`/`RoadmapTab.tsx`/`Lessons.tsx`. 8. **M1** — sync `direction` lên `profiles` (cần migration). 9. **M6/L3/L7** — Redis rate limit, rotate key TTS, metrics/alerting.

---

## 11. Phụ lục: lệnh & bằng chứng

**Các cổng đã chạy trong audit này (Node v22):**

```bash
npm install                 # cài deps sạch
npm run typecheck           # ✅ PASS (exit 0)
npm run lint                # ✅ PASS (0 warning)
npx vitest run              # ✅ PASS — 1 file, 10 test
npm run build               # ✅ PASS (manifest + tsc + vite build, nén Gzip/Brotli)
```

**Một số mốc bằng chứng (file:line) cho trạng thái RESOLVED:**

- Đếm lượt atomic: `api/_lib/usage.ts:63-77` + `supabase/migrations/0001_consume_usage.sql`
- Timeout fetch: `api/_lib/fetchTimeout.ts:10-30`, dùng tại `api/ai.ts:24,195,268`
- CORS siết: `api/_lib/security.ts:10-41`
- STT timeout: `src/lib/stt.ts:41-45`
- Dictionary lỗi mạng: `src/pages/Dictionary.tsx:64-65,372`
- Chat lưu an toàn + scroll: `src/pages/Chat.tsx:208,219-266,362`
- Writing validate: `src/pages/Writing.tsx:173,182`
- Profile TTL: `src/lib/auth.ts:10-21`

**Cấu trúc kiểm thử hiện có (sau lượt 3 — 46 ca / 7 file):**

- `vitest.config.ts` (happy-dom, include `src/**/*.test.{ts,tsx}` **+ `api/**/\*.test.ts`\*\*)
- `vitest.setup.ts` (mock `fetch('/data/...')` → đọc `public/`)
- `src/lib/curriculum.test.ts` (10 ca)
- `src/lib/pronounceScore.test.ts` (8 ca) — chấm phát âm
- `src/lib/srs.test.ts` (6 ca) — SM-2 (mock `progressSync`)
- `src/lib/stats.test.ts` (3 ca) — hoạt động/streak (mock `supabase`); khoá BUG-5
- `api/_lib/usage.test.ts` (10 ca) — đếm/hoàn lượt (mock `supabaseAdmin`); khoá H1 + BUG-2
- `api/_lib/security.test.ts` (6 ca) — CORS (khoá H10) + rate limit
- `api/_lib/fetchTimeout.test.ts` (3 ca) — timeout (khoá H2)
- `src/lib/vocab.test.ts` (3 ca) — chuẩn hoá chữ thường từ đã thuộc; khoá BUG-6
- `.github/workflows/ci.yml` — cổng chất lượng tự động (T2)

**Sửa lỗi đã áp dụng:** BUG-1..10 (toàn bộ) + T2 (CI gate) + M2 (guardrail). Chi tiết: BUG-1 (`Chat.tsx`), BUG-2 (`usage.ts`+`ai.ts`+`stt.ts`+migration `0004`+`schema.sql`), BUG-4 (`Dictionary.tsx`), BUG-5 (`stats.ts`), BUG-6 (`vocab.ts`+test), BUG-7 (`tts.ts` playToken), BUG-8 (`Speaking.tsx`), BUG-9 (`srs.ts`+test), BUG-10 (`Lessons.tsx`), T2 (`.github/workflows/ci.yml`), M2 (`api/ai.ts` `SYSTEM_GUARDRAIL`).

> _Báo cáo audit v1 (bảo mật, mobile-first, đa thiết bị) nay ở **PHẦN B** ngay dưới đây, để tra cứu lịch sử các phát hiện ban đầu (auth localStorage, rate limit, mobile…) — tất cả đã được xử lý qua Supabase Auth + server-side limits._

---

## PHẦN B — Audit source code v1 (2026-06-20, lịch sử)

> Mọi phát hiện dưới đây đã RESOLVED — xem đối chiếu chi tiết ở PHẦN A §4.1.

> Ngày audit: 2026-06-20  
> Phạm vi: toàn bộ `src/`, `api/`, `index.html`, `vite.config.ts`

---

## 🔴 CRITICAL — Sửa trước khi public

### 1. API key Anthropic thật đang nằm trong `.env`

**File:** `.env` dòng 1

```
ANTHROPIC_API_KEY=sk-ant-api03-2aXZema...
```

`.env` đã có trong `.gitignore` nên chưa bị commit — **nhưng cần kiểm tra lại git history** (`git log --all -- .env`) để chắc chắn key chưa từng bị commit. Nếu từng commit thì phải **rotate key ngay** trên console.anthropic.com.

---

### 2. Hệ thống xác thực hoàn toàn không an toàn (localStorage + btoa)

**File:** `src/lib/storage.ts` dòng 25–48

```ts
function hashPassword(pw: string): string {
  return btoa(encodeURIComponent(pw)) // ← base64, KHÔNG phải hash!
}
```

Vấn đề:

- `btoa` là **mã hóa thuận nghịch**, không phải hash. Ai đọc được localStorage là có mật khẩu thật.
- Toàn bộ dữ liệu user, lịch sử học, gói dùng (`plan: 'free'/'pro'`) đều lưu trên localStorage — **bất kỳ ai mở DevTools đều sửa được**.
- User có thể tự nâng lên gói Pro bằng cách sửa `et_current_user` trong localStorage.

**Hướng sửa (khi chuyển sang Supabase Auth thật):**

- Dùng `supabase.auth.signUp()` / `signIn()` — Supabase tự hash + lưu server-side.
- Giới hạn lượt dùng phải kiểm tra ở server (API function), không phải ở browser.

---

### 3. `/api/claude` không có rate limiting / auth — ai cũng gọi được

**File:** `api/claude.ts`  
Serverless function này chỉ kiểm tra `method === 'POST'`, không kiểm tra:

- Auth token (ai gọi?)
- Rate limit (bao nhiêu lần/phút?)
- Model và max_tokens (user có thể gửi `"model": "claude-opus-4-5", "max_tokens": 8192`)
- Kích thước request body

**Tác hại:** Nếu ai biết URL Vercel deployment, họ có thể spam API của bạn, tốn tiền không giới hạn.

**Hướng sửa ngắn hạn (chưa có Supabase Auth):**

```ts
// Thêm vào đầu handler, trước khi gọi Anthropic
const body = await req.json()

// Ép model và max_tokens ở server — không tin client
const safeBody = {
  model: 'claude-haiku-4-5-20251001', // cứng, không cho đổi
  max_tokens: Math.min(body.max_tokens ?? 1024, 2048), // giới hạn tối đa
  system: String(body.system ?? '').slice(0, 5000), // giới hạn độ dài
  messages: body.messages,
}
```

Dài hạn: thêm `Authorization: Bearer <supabase-jwt>` header từ client, verify ở server.

---

## 🟡 MEDIUM — Sửa trong sprint tiếp theo

### 4. Không có CORS restrictions trên API

`api/claude.ts` và `api/pronunciation.ts` không set CORS headers.  
Mặc định Vercel Edge sẽ trả về không có `Access-Control-Allow-Origin` cụ thể, nhưng nên explicit:

```ts
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://your-domain.vercel.app', // domain thật
  'Access-Control-Allow-Methods': 'POST',
}
```

### 5. Không có input validation trên essay/chat

**File:** `src/pages/Writing.tsx` — essay dài bao nhiêu cũng gửi được.  
Nên thêm giới hạn phía client và server:

```ts
if (essay.length > 10000) {
  setError('Bài viết quá dài (tối đa 10.000 ký tự)')
  return
}
```

### 6. `localStorage` mất dữ liệu nếu user xóa cache / đổi thiết bị

Dữ liệu học (chat history, writing history) chỉ tồn tại trên 1 thiết bị, 1 browser.  
Người dùng Pro trả tiền sẽ mất `plan: 'pro'` khi đổi máy — nghiêm trọng về UX.  
Cần migrate sang Supabase DB trước khi bán gói Pro.

---

## 📱 MOBILE-FIRST — Lỗi giao diện di động

### 7. 🔴 Thiếu `safe-area-inset` — thanh input bị che bởi home indicator iPhone

**File:** `index.html`

Viewport hiện tại:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

Các trang Chat và Speaking có thanh input/control `sticky bottom-0`. Trên iPhone (Safari iOS), thanh home indicator (28px) sẽ **che phủ phần input**, user không bấm được nút Send/Mic.

**Sửa:**

```html
<!-- index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

```css
/* src/index.css — thêm vào cuối */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

```tsx
{/* Chat.tsx và Speaking.tsx — sticky bottom bar */}
<div className="sticky bottom-0 bg-zinc-950/95 ... pb-safe">
```

---

### 8. 🔴 Enter key trên mobile gửi tin nhắn thay vì xuống dòng

**File:** `src/pages/Chat.tsx` dòng 234

```tsx
onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
```

Trên mobile, keyboard Enter thường dùng để xuống dòng. User sẽ hay gửi nhầm.

**Sửa:** Tắt tính năng này trên mobile — thêm nút Send riêng (đã có rồi). Hoặc detect thiết bị:

```tsx
// Chỉ bật Enter-to-send trên desktop
const isMobile = /Mobi|Android/i.test(navigator.userAgent)
onKeyDown={e => !isMobile && e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
```

---

### 9. 🟡 Touch target quá nhỏ

**File:** `src/components/Layout.tsx`  
Nút logout: `p-1` → kích thước ~26px. Apple/Google khuyến nghị **tối thiểu 44px**.

```tsx
// Hiện tại
<button onClick={handleLogout} className="text-zinc-500 hover:text-red-400 transition p-1 rounded">

// Sửa thành
<button onClick={handleLogout} className="text-zinc-500 hover:text-red-400 transition p-3 rounded-lg -m-2">
```

Nút volume/mute và plus trong Speaking.tsx: `p-2.5` → ~34px, cũng hơi nhỏ. Nâng lên `p-3`.

---

### 10. 🟡 Thông tin lượt dùng ẩn hoàn toàn trên mobile

**File:** `src/components/Layout.tsx` dòng 51

```tsx
<div className="hidden sm:flex ...">
  <span>Chat: {usage.chatCount}/{limit.chat}</span>
```

Trên mobile (`sm` = 640px), user không biết còn bao nhiêu lượt. Chỉ biết khi bị chặn.

**Sửa:** Hiện badge nhỏ thay vì ẩn hoàn toàn:

```tsx
{
  /* Mobile: chỉ hiện progress bar nhỏ */
}
;<div className="sm:hidden">
  <div className="w-8 h-1 bg-zinc-700 rounded-full overflow-hidden">
    <div
      className="h-full bg-emerald-500 rounded-full"
      style={{ width: `${Math.min(100, (usage.chatCount / limit.chat) * 100)}%` }}
    />
  </div>
</div>
{
  /* Desktop: text đầy đủ */
}
;<div className="hidden sm:flex ...">...</div>
```

---

### 11. 🟡 Writing textarea `rows={14}` không dùng được khi keyboard mở

**File:** `src/pages/Writing.tsx`  
Textarea 14 dòng + keyboard ảo = hầu như không thấy gì. Trên mobile nên dùng chiều cao linh hoạt:

```tsx
// Thay rows={14} thành
className = '... min-h-[200px] max-h-[50vh]'
// và thêm style={{ height: 'auto', overflowY: 'auto' }}
```

---

## 🖥️ ĐA THIẾT BỊ

### 12. 🔴 STT (giọng nói) chỉ chạy được trên Chrome/Edge

`Web Speech API` không có trên Firefox, Safari iOS 15 trở xuống.  
Trang Speaking hiện có cảnh báo nhưng không có fallback — user Safari/Firefox bị kẹt hoàn toàn.

**Hướng sửa:** Thêm ô text input fallback khi STT không hỗ trợ:

```tsx
{!isSTTSupported() && (
  <div className="flex gap-2">
    <input placeholder="Gõ tiếng Anh thay vì nói..." ... />
    <button onClick={() => sendUserSpeech(typedText)}>Gửi</button>
  </div>
)}
```

### 13. 🟡 TTS trên iOS Safari có vấn đề

`speechSynthesis` trên Safari iOS yêu cầu **user gesture** mới phát âm được. Nếu AI tự động đọc sau khi API trả về (không phải từ click trực tiếp của user), Safari sẽ im lặng không báo lỗi.

Hiện tại `speakBilingual` được gọi trong async callback sau `callClaude` — không phải user gesture — nên **có thể không phát âm trên iOS Safari**.

**Hướng sửa:** Luôn yêu cầu user nhấn nút Play để nghe, thay vì tự động phát.

### 14. 🟢 Điều tốt đã có

- API key không bị bundle vào JS frontend ✅
- Proxy pattern đúng chuẩn ✅
- `supabaseAdmin` chỉ dùng ở server ✅
- `.env` trong `.gitignore` ✅
- Viewport meta tag có mặt ✅
- `theme-color` cho PWA ✅
- Responsive design với Tailwind breakpoints ✅
- Mic button 64px — đủ lớn ✅
- `max-w-sm` form center trên mọi màn hình ✅
- Sticky header + sticky input bar ✅

---

## Tóm tắt ưu tiên

| #   | Vấn đề                                       | Mức | Sửa ngay?           |
| --- | -------------------------------------------- | --- | ------------------- |
| 1   | Kiểm tra git history, rotate API key nếu cần | 🔴  | Ngay                |
| 2   | Auth localStorage + btoa không an toàn       | 🔴  | Trước khi public    |
| 3   | `/api/claude` không rate limit / auth        | 🔴  | Trước khi public    |
| 7   | iOS home indicator che input bar             | 🔴  | Ngay (2 dòng fix)   |
| 8   | Enter key gửi tin trên mobile                | 🔴  | Dễ fix              |
| 9   | Touch target nút logout quá nhỏ              | 🟡  | Sprint tới          |
| 10  | Lượt dùng ẩn trên mobile                     | 🟡  | Sprint tới          |
| 11  | Textarea quá cao khi keyboard mở             | 🟡  | Sprint tới          |
| 12  | STT không có fallback cho Safari/Firefox     | 🔴  | Nên có trước launch |
| 13  | TTS iOS Safari cần user gesture              | 🟡  | Kiểm tra thực tế    |

---

## PHẦN C — Audit bản dịch & đồng bộ từ vựng (2026-06-27)

> Ngày: 2026-06-27
> Phạm vi: toàn bộ dữ liệu song ngữ Anh–Việt của ứng dụng
> (từ điển 10.000 mục + từ vựng/câu ở mọi trang khác)

---

## 1. Mục tiêu

1. **Audit toàn bộ bản dịch**, chỉnh sửa cho đúng.
2. **Từ vựng ở các trang khác lấy trong từ điển**; từ nào từ điển chưa có thì
   bổ sung vào theo đúng logic & cấu trúc của từ điển (giữ nghĩa theo ngữ cảnh).

---

## 2. Phương pháp audit

Vì lượng dữ liệu rất lớn (10.000 mục từ điển + **125.878** cặp câu song ngữ ở các
file khác), audit kết hợp 3 lớp:

1. **Kiểm tra tự động toàn bộ** (script `scripts`/scratchpad): quét MỌI mục/cặp để
   bắt các loại lỗi máy phát hiện được:
   - nghĩa tiếng Việt trống / trùng tiếng Anh / không có ký tự tiếng Việt
   - ví dụ tiếng Anh không chứa từ chính
   - nghĩa/ví dụ trùng lặp bất thường, dài/ngắn lệch nhau
   - nghĩa còn lẫn tiếng Anh, phiên âm sai định dạng
2. **Rà tay các mục bị gắn cờ** — đọc từng mục nghi ngờ để xác nhận đúng/sai.
3. **Đọc mẫu trải đều** ~185 mục từ điển dải khắp A→Z để soi lỗi NGỮ NGHĨA mà
   máy không bắt được (nghĩa sai nhưng trông hợp lệ).

---

## 3. Kết quả audit bản dịch

### 3.1. Từ điển (nay 10.007 mục) — **chất lượng tốt**

- Không có mục trống, không trùng từ.
- Các cờ tự động gần như đều là **báo nhầm**:
  - nghĩa tiếng Việt không dấu (vd `mua`, `tin`, `con ong`, `cao`) → **đúng**;
  - ví dụ "thiếu từ" do động từ chia thì (`cling → clung`) hoặc từ ghép gạch nối → **đúng**;
  - nhiều từ cùng nghĩa (`begin/start/starting` → "bắt đầu") → **đúng** (đồng nghĩa).
- **Sửa thật: 1 mục** — `efficiently`: "một cách hiệu suất, hiệu quả" →
  **"một cách hiệu quả"** (bỏ cụm gượng "một cách hiệu suất").

### 3.2. Câu song ngữ ở các trang khác (125.878 cặp) — **sạch**

Gồm: hội thoại (`dialogues`), bài học (`lessons`), mẫu câu (`patterns`),
ví dụ mở rộng (`extra-examples`), giáo trình CEFR (`cefr`), câu thông dụng (`curriculum`).

- Không phát hiện cặp dịch sai.
- Các cờ đều là báo nhầm hợp lệ: ghi chú ngữ pháp tiếng Việt có lẫn thuật ngữ tiếng Anh
  (`am/is/are`, `who/that`…), **tên riêng** giữ nguyên (Lan, Tom, David…), bài **đánh vần**
  (`S-C-H-O-O-L`, `A, E, I, O, U`).

---

## 4. Đồng bộ từ vựng với từ điển (giữ ngữ cảnh)

Đối chiếu **645 từ** trong 34 vòng từ vựng nền tảng (`src/data/curriculum.ts`)
với từ điển: **613/645 đã có** trong từ điển (nay 620/645 sau khi bổ sung).

### 4.1. Bổ sung 7 từ còn thiếu vào từ điển

Thêm theo đúng cấu trúc `DictEntry` (vi, pos, ex_en, ex_vi, ipa_en, ipa_vi),
chèn theo thứ tự ABC: **avocado, endangered, glasses, quarterly, recycle,
watermelon, windy**.

> _24 "mục" còn lại chỉ là chữ cái B–Z trong vòng "Bảng chữ cái" — không phải từ
> vựng nên không đưa vào từ điển._

### 4.2. `café` → `cafe`

Từ điển đã có `cafe`; đổi vòng nền tảng dùng `cafe` cho khớp (tránh trùng lặp).

### 4.3. Làm giàu phiên âm từ từ điển

**621 từ** vựng nền tảng nay được gắn `ipa_en` **lấy trực tiếp từ từ điển**, nên
trang Học theo lộ trình / Lộ trình CEFR hiển thị phiên âm THỐNG NHẤT với trang Từ điển.

- **Giữ ngữ cảnh:** nghĩa tiếng Việt theo từng vòng được giữ nguyên (vd `orange` =
  "màu cam" trong vòng Màu sắc, không lấy "quả cam" của từ điển; `patient` = "bệnh nhân"
  trong vòng Y tế; `May` = "tháng Năm" trong vòng Tháng).
- Không sao chép `ipa_vi` (vì nghĩa tiếng Việt theo ngữ cảnh có thể khác từ điển →
  phiên âm tiếng Việt sẽ không khớp).

### 4.4. Công cụ duy trì đồng bộ

Thêm `scripts/gen-curriculum-json.ts`: sinh `public/data/curriculum.json` từ nguồn
`src/data/curriculum.ts` và tự làm giàu `ipa_en` từ từ điển.
Chạy lại khi sửa từ vựng: `npx tsx scripts/gen-curriculum-json.ts`.

---

## 5. Vấn đề hệ thống cần QUYẾT ĐỊNH: `ipa_vi` chỉ có 1 âm tiết

`ipa_vi` (phiên âm tiếng Việt của _nghĩa_) hiện **chỉ chứa âm tiết ĐẦU** của nghĩa
nhiều chữ — vd "ability" nghĩa "khả năng" nhưng `ipa_vi` = `/xaː˧˩˧/` (chỉ "khả").
Có **9.468/10.007** mục như vậy, và trường này **được hiển thị** ở trang Từ điển
(`Dictionary.tsx`) nên gây hiểu nhầm.

> Đây là vấn đề **phiên âm**, không phải bản dịch, nên chưa tự ý sửa hàng loạt.

**Gợi ý xử lý (chọn 1):**

- **(a) Ẩn `ipa_vi`** ở trang Từ điển — đơn giản, hết gây nhầm (phiên âm tiếng Việt
  ít giá trị với người Việt học tiếng Anh — chiều A).
- (b) Tạo lại `ipa_vi` đầy đủ cho cả nghĩa nhiều âm tiết — cần bộ chuyển chữ→IPA
  tiếng Việt đáng tin cậy, rủi ro sai cao nếu làm ẩu.
- (c) Giữ nguyên.

---

## 6. Cách chạy lại / xác minh

```bash
npm install                              # cài phụ thuộc
npx tsx scripts/gen-curriculum-json.ts   # đồng bộ từ vựng nền tảng ← từ điển
node scripts/gen-data-manifest.mjs       # cập nhật manifest dữ liệu
npm run lint && npx tsc --noEmit && npm test
npm run build                            # build production (đã chạy OK)
```
