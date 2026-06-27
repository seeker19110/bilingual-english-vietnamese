# Báo cáo Audit toàn diện — Gia sư tiếng Anh AI

> Ngày: 2026-06-27 · Phạm vi: toàn bộ source (frontend React, backend Express/API, lớp dữ liệu Supabase, UI/UX, bảo mật).
> Mục tiêu: chỉ ra vấn đề + **hướng xử lý cụ thể**, sắp theo mức ưu tiên để sửa dần mà không làm hỏng app đang chạy thật (`en-vi.donghanhcungban.com`).

## 0. Tổng quan sức khoẻ dự án

| Mảng | Điểm | Nhận xét ngắn |
|------|------|----------------|
| Kiến trúc & hiệu năng | 8/10 | Lazy-load, code-split, prefetch idle, PWA, nén Brotli/Gzip — rất tốt cho mobile. |
| Bảo mật | 7/10 | Auth JWT server-side, RLS đầy đủ, mã hoá audio AES-256-GCM, key không hardcode. Còn race condition đếm lượt + vài chỗ siết chưa chặt. |
| UX/UI | 7.5/10 | i18n đầy đủ, mobile-first, ErrorBoundary, theme. Còn lỗ hổng xử lý lỗi/loading, bàn phím ảo, timeout STT. |
| Lớp dữ liệu | 8/10 | RLS chuẩn, SRS SM-2, merge sync hợp lý, từ điển 10k từ sạch. Còn staleness cache, streak phụ thuộc localStorage. |
| Nợ kỹ thuật | 6/10 | 2 component 700+ dòng, trùng lặp màu/setup, ESLint chưa chạy được. |

**Kết luận:** Dự án ở trạng thái MVP vững, đã deploy thật. Không có lỗ hổng bảo mật chí mạng. Các việc cần làm là *siết chặt* (đếm lượt atomic, xử lý lỗi rõ ràng, toàn vẹn dữ liệu đa thiết bị) và *giảm nợ kỹ thuật*.

---

## 1. Bảng ưu tiên (đọc nhanh)

### 🔴 Critical / High — sửa trong PR này
| # | Vấn đề | Nhóm | File chính |
|---|--------|------|-----------|
| H1 | Đếm lượt **không atomic** → 2 request song song vượt giới hạn gói | Bảo mật/chi phí | `api/_lib/usage.ts:57-78`, `supabase/schema.sql` |
| H2 | `fetch` gọi AI/STT **không có timeout** → treo vô hạn nếu nhà cung cấp chậm | Bảo mật/UX | `api/ai.ts`, `api/stt.ts`, `api/_lib/geminiApi.ts`, `api/_lib/openaiStt.ts` |
| H3 | **STT timeout vô tận** ở trình duyệt (mic mở mãi nếu không nói) | UX | `src/pages/Speaking.tsx`, `src/lib/stt.ts` |
| H4 | **Bàn phím ảo che input** Chat trên mobile | UX/Mobile | `src/pages/Chat.tsx` |
| H5 | Dictionary **không phân biệt** lỗi mạng vs không có kết quả | UX | `src/pages/Dictionary.tsx` |
| H6 | Lưu phiên Chat lỗi nhưng **không báo** (mất dữ liệu thầm lặng) | UX/Dữ liệu | `src/pages/Chat.tsx` |
| H7 | Writing **không validate** độ dài bài → gọi API tốn tiền với bài trống | UX/chi phí | `src/pages/Writing.tsx` |
| H8 | **Profile cache cũ** sau khi nâng cấp Pro → vẫn bị giới hạn Free | Dữ liệu | `src/lib/auth.ts` |
| H9 | **Streak phụ thuộc localStorage**, xoá cache là mất dù DB còn | Dữ liệu | `src/lib/storage.ts`, `src/lib/cloud.ts` |
| H10 | CORS fallback `*` + `Allow-Credentials: true` (cấu hình mâu thuẫn) | Bảo mật | `api/_lib/security.ts:10-27` |

### 🟡 Medium — nên làm sớm
| # | Vấn đề | Nhóm | File |
|---|--------|------|------|
| M1 | `direction` (chiều A/B) không sync đa thiết bị | Dữ liệu | `src/lib/direction.ts`, `profiles` |
| M2 | System prompt do client tự tạo, server chỉ cắt độ dài (lái AI thành chatbot chung, tốn quota) | Bảo mật/chi phí | `api/ai.ts:143`, `src/lib/ai.ts` |
| M3 | "Trùng" bảng màu ở 3 nơi (thực ra khác cấu trúc — hoãn) | Nợ kỹ thuật | `Lessons.tsx`, `CommonPhrases.tsx`, `RoadmapTab.tsx` |
| ~~M4~~ | ~~ESLint không chạy~~ → **không phải lỗi**: chỉ do chưa `npm install`; sau khi cài, `npm run lint` PASS | Nợ kỹ thuật | — |
| M5 | Accessibility: SVG thiếu `aria-label`, focus ring mờ, contrast badge | UX/A11y | `WordIllustration.tsx`, `Login.tsx`, `Home.tsx` |
| M6 | Rate limit in-memory (mất khi restart, không chia sẻ giữa instance) | Bảo mật | `api/_lib/security.ts:44-68` |
| M7 | Quiz ôn tập (QuizTab) không lưu lịch sử/điểm | Tính năng | `src/pages/Learn.tsx:651` |

### 🟢 Low — polish / dài hạn
| # | Vấn đề | File |
|---|--------|------|
| L1 | 2 component quá lớn: `RoadmapTab.tsx` (733), `Learn.tsx` (766) | refactor |
| L2 | Trùng `SetupScreen` giữa Chat & Speaking | extract component |
| L3 | Master key TTS không cơ chế rotate/versioning | `api/_lib/ttsCrypto.ts` |
| L4 | Không có migration history (`supabase/migrations/`) | schema |
| L5 | Multi-tab sync thiếu (storage event) | `src/lib/*` |
| L6 | Trùng từ `salary` trong Foundation | `src/data/curriculum.ts` |
| L7 | Không có metrics/alerting/centralized log | hạ tầng |

---

## 2. Chi tiết & hướng xử lý

### 2.1 Bảo mật & đếm lượt / chi phí

**H1 — Đếm lượt không atomic (quan trọng nhất).**
`checkAndConsumeUsage()` đọc `current` rồi `upsert({ [col]: current + 1 })` (2 query). Hai request đồng thời cùng đọc `current = N`, cùng ghi `N+1` → người dùng Free dùng vượt giới hạn, tốn tiền API.
*Hướng xử lý:* tạo Postgres function `consume_usage(user_id, day, col, limit)` làm **kiểm tra + tăng atomic** (`insert ... on conflict do update ... where < limit returning`), gọi qua `supabase.rpc()`. Giữ nguyên chính sách FAIL-OPEN. Thêm SQL vào `supabase/schema.sql` (idempotent) + file `supabase/migrations/`.

**H2 — fetch AI/STT không timeout.** `fetch` Node mặc định không timeout → nếu Gemini/Groq/OpenAI treo, request giữ kết nối vô hạn, chiếm tài nguyên server.
*Hướng xử lý:* bọc `AbortController` + `setTimeout` (chat ~30s, STT ~45s) cho mọi lệnh gọi nhà cung cấp; trả lỗi 504 rõ ràng. Tùy chọn retry 1 lần với backoff cho lỗi mạng tạm thời.

**H10 — CORS.** Khi `ALLOWED_ORIGINS` chưa set → `Access-Control-Allow-Origin: *` kèm `Access-Control-Allow-Credentials: true` (tổ hợp browser tự chặn, đồng thời quá rộng).
*Hướng xử lý:* khi origin không khớp whitelist → KHÔNG trả `*` cùng credentials; bỏ `Allow-Credentials` khi dùng `*`, hoặc reflect đúng origin đã whitelist. Log cảnh báo khi mismatch.

**M2 — System prompt từ client.** Toàn bộ prompt dựng ở `src/lib/ai.ts` (client), server chỉ `slice(0, 8000)`. Người dùng đã đăng nhập có thể gửi prompt bất kỳ → dùng API như chatbot chung (tốn quota của họ, lệch mục đích).
*Hướng xử lý (giai đoạn sau, cần test kỹ vì đụng 3 mode):* chuyển prompt nền vào `src/prompts/` + server prepend một "guardrail" cố định ("Bạn là gia sư ngôn ngữ, chỉ hỗ trợ học...") trước prompt client. Trong PR này chỉ **ghi nhận** + tài liệu hoá, chưa đổi để tránh hồi quy.

**M6 — Rate limit in-memory.** Đủ cho 1 instance hiện tại; khi scale ngang cần Redis/Upstash. Ghi nhận, chưa cần làm ngay.

### 2.2 UX & Mobile

**H3 — STT timeout vô tận.** Web Speech API mở mic chờ mãi nếu người dùng không nói.
*Hướng xử lý:* thêm `setTimeout` tự `stop()` sau ~15-20s im lặng + toast "Không nghe thấy giọng nói".

**H4 — Bàn phím ảo che input.** Input chat sticky bottom bị bàn phím mobile che ~50%.
*Hướng xử lý:* dùng `scrollIntoView` khi focus input, đệm `pb-[env(safe-area-inset-bottom)]`, đảm bảo danh sách tin nhắn cuộn lên khi bàn phím mở.

**H5 — Dictionary lỗi mạng = "không có kết quả".** `catch → setResults([])` khiến người dùng tưởng không có từ.
*Hướng xử lý:* thêm state lỗi riêng; hiển thị "Lỗi mạng, thử lại" khác với "Không tìm thấy từ".

**H6 — Lưu phiên Chat lỗi thầm lặng.** `saveChatSession()` có thể fail nhưng vẫn xoá input.
*Hướng xử lý:* `try/catch` quanh lưu, toast lỗi, không xoá nội dung nếu lưu thất bại.

**H7 — Writing không validate.** Submit bài trống vẫn gọi API.
*Hướng xử lý:* yêu cầu tối thiểu (~20 từ), disable nút + toast nếu chưa đủ.

**M5 — Accessibility.** Thêm `aria-label`/`<title>` cho SVG minh hoạ, `focus:ring-2` cho input, tăng contrast badge ở theme sáng. Bổ sung scroll-to-latest cho danh sách tin nhắn Chat.

### 2.3 Toàn vẹn dữ liệu

**H8 — Profile cache cũ.** Cache `gsa_profile_v1` không TTL → nâng cấp Pro nhưng vẫn bị giới hạn Free đến khi reload thủ công.
*Hướng xử lý:* thêm timestamp + TTL (vd 5 phút) cho cache; luôn refresh ngầm từ DB và cập nhật cache khi `plan` đổi. (Server vốn authoritative nên không phải lỗ hổng, chỉ là UX gây khó chịu.)

**H9 — Streak phụ thuộc localStorage.** `getStreak()` đọc `et_usage_{uid}_{date}` từ localStorage; xoá cache/đổi máy → streak = 0 dù `daily_usage` trên DB còn.
*Trạng thái:* **đã được code hiện tại lo** — `pullUserData()` (cloud.ts:111-169) kéo 40 ngày `daily_usage` về localStorage khi mở trang, nên streak khôi phục sau đồng bộ. Còn lại (Low): streak >40 ngày bị giới hạn bởi cửa sổ pull 40 ngày — có thể nới rộng nếu cần.

**M1 — direction không sync.** `et_direction` chỉ ở localStorage → đổi máy reset về 'A'.
*Hướng xử lý:* thêm cột `direction` vào `profiles`, đọc/ghi khi đăng nhập (giai đoạn sau, cần migration).

### 2.4 Nợ kỹ thuật & refactor

**M3 — Trùng bảng màu** ở `Lessons.tsx`, `CommonPhrases.tsx`, `RoadmapTab.tsx` (3 format khác nhau).
*Hướng xử lý:* gom về `src/lib/colorScheme.ts`, tái dùng.

**M4 — ESLint không chạy.** `npm run lint` fail → không bắt được unused import/`any`.
*Hướng xử lý:* sửa cấu hình ESLint cho khớp phiên bản đang cài.

**L1/L2 — Component khổng lồ.** `RoadmapTab.tsx` (733) & `Learn.tsx` (766) gộp nhiều view.
*Hướng xử lý (giai đoạn sau, rủi ro hồi quy cao trên app live):* tách thành các sub-view (`TodayTab`, `SrsTab`, `QuizTab`, `RoadmapView`, `VocabFlashView`, `GrammarDetailView`). Để PR riêng cho dễ review.

---

## 3. Điểm đã làm tốt (giữ nguyên)

- Lazy-load + code-split theo trang, prefetch idle, PWA, nén Brotli/Gzip.
- i18n đầy đủ (VI/EN) + hỗ trợ 2 chiều học (A/B) qua `labelA/labelB`.
- Auth JWT Supabase server-side, RLS đầy đủ trên mọi bảng per-user.
- Đếm lượt **authoritative ở server** (client không tự vượt), tách STT khỏi giới hạn chat.
- Mã hoá audio cache AES-256-GCM, key chỉ phát cho request có JWT hợp lệ.
- SRS SM-2 chuẩn + merge sync (union learned/hard, giữ thẻ tiến bộ hơn).
- Từ điển 10k từ sạch (đủ nghĩa, ví dụ song ngữ, IPA), tải chunk động.
- Input validation server (giới hạn body, độ dài message, sanitize word), security headers, FAIL-OPEN hợp lý.

---

## 4. Lộ trình đề xuất

**Đã làm trong PR này (Critical/High):**
- H1 — đếm lượt atomic qua RPC `consume_usage` (`supabase/schema.sql` + `supabase/migrations/0001_consume_usage.sql` + `api/_lib/usage.ts`, có fallback an toàn).
- H2 — timeout cho mọi lệnh gọi AI/STT (`api/_lib/fetchTimeout.ts` + dùng trong `ai.ts`, `geminiApi.ts`, `openaiStt.ts`).
- H3 — chống mic mở vô tận: Web Speech tự dừng 8s/20s (`stt.ts`) + ghi âm server tự dừng 60s (`Speaking.tsx`).
- H4 — cuộn input khi focus để bàn phím ảo không che (`Chat.tsx`).
- H5 — Dictionary phân biệt lỗi mạng vs không có kết quả + nút Thử lại (`Dictionary.tsx`).
- H6 — ghi localStorage an toàn, không crash luồng lưu (`storage.ts`).
- H7 — Writing chặn bài <20 từ (`Writing.tsx`).
- H8 — TTL 5 phút cho cache profile, hết hạn lấy lại gói từ DB (`auth.ts`).
- H9 — đã sẵn có (pull 40 ngày usage). H10 — siết CORS (`security.ts`).
- L4 — lập thư mục `supabase/migrations/`. L6 — gỡ trùng `salary`.
- M4 — xác nhận lint/build/test đều PASS.

**Hoãn (Medium/Low — cần migration hoặc rủi ro hồi quy cao, để PR riêng):**
- M1 (sync `direction` lên `profiles`), M2 (guardrail system prompt + gom `src/prompts/`).
- M3 (gom bảng màu — thực chất khác cấu trúc, lợi ích thấp/rủi ro lệch màu).
- L1/L2 (tách `RoadmapTab.tsx`/`Learn.tsx` 700+ dòng) — thuần refactor, review riêng để tránh hồi quy trên app live.

## 5. Cách kiểm thử

- `npm run build` (gồm `tsc`) phải pass — bắt lỗi type.
- `npm test` (vitest) cho các lib thuần (srs, curriculum, usage nếu có test).
- Chạy `npm run dev`, kiểm tay: gửi chat trên mobile (bàn phím), STT không nói (timeout), Dictionary khi offline (báo lỗi mạng), submit Writing bài trống (chặn), nâng Pro rồi gọi API (không còn kẹt Free).
- Backend: gọi `/api/claude` 2 request song song lúc gần hết lượt → chỉ 1 được tính vượt (kiểm RPC atomic).
