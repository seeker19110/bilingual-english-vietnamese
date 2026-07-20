# PROJECT.md — Gia sư ngôn ngữ AI song ngữ Việt ⇄ Anh

> Đặc tả dự án — nguồn sự thật về _cái gì đã xây_. Viết từ code thật, mọi khẳng định truy được
> về file cụ thể trong repo. Cập nhật khi tính năng đổi. Tiến độ/lịch sử: `PROGRESS.md`.

## 1. Vấn đề & Người dùng

- **Vấn đề:** học ngoại ngữ một mình thiếu người luyện hội thoại thật; công cụ AI hiện có chỉ
  sửa lỗi bằng CHỮ, không đọc lại bằng giọng đúng ngôn ngữ mẹ đẻ của người học.
- **Người dùng:** Chiều A — người Việt học tiếng Anh. Chiều B — người nước ngoài học tiếng Việt
  qua tiếng Anh.
- **Khác biệt giữ:** sửa lỗi & giải thích bằng **GIỌNG tiếng mẹ đẻ** (TTS 2 giọng riêng), hội
  thoại bằng giọng chuẩn ngôn ngữ đích, miễn phí, nội dung sát đời sống Việt Nam.

## 2. Tính năng đã có (production)

- Đăng nhập/đăng ký tự viết — Bearer token + email/password + Google Identity Services
  (`src/lib/auth.ts`, `api/auth.ts`).
- **Chat** — trò chuyện theo tình huống, sửa lỗi + giải thích bằng tiếng mẹ đẻ (`/api/claude`).
- **Luyện viết** — chấm kiểu IELTS, chỉ lỗi, ước lượng band.
- **Luyện nói song ngữ** — ghi âm → STT (Whisper qua Groq/OpenAI) → trả lời giọng ngôn ngữ đích
  - sửa lỗi giọng tiếng mẹ đẻ (Google Cloud TTS, cache mã hoá).
- Nút "Kết thúc & chấm điểm" cuối phiên Chat/Speaking (chấm kiểu IELTS Speaking, không lưu DB).
- Giới hạn lượt/ngày theo tính năng (chat/writing/speaking/stt), đồng bộ Postgres tự host
  (`daily_usage`), atomic qua hàm SQL `consume_usage`/`refund_usage`.
- **Lộ trình học** (`/learn`): vòng từ vựng nền tảng theo chủ đề + tốc độ 5/10/20 từ/ngày.
- **Lộ trình CEFR A1 → C2 đầy đủ 6 cấp** (`/learning-path/a1..c2`): mỗi cấp 1 trang, thứ tự
  Từ vựng → Ngữ pháp → Hội thoại, tab Hôm nay/Ôn SRS/Từ khó/Kiểm tra, **bài thi cuối cấp** chặn
  lên cấp (≥70%, `src/lib/cefrExam.ts`).
- Từ điển **12.073 mục**, 100% đã gắn nhãn CEFR (A1–C2), nghĩa + ví dụ song ngữ có audio.
- **Thử thách "Challenge 1 phút/ngày"** (`/challenge`) — chu kỳ tuần Thứ 2→CN, đã mở cho người
  dùng thật.
- **Bảng tiến độ** (`/progress`) — streak, biểu đồ 7 ngày, % hoàn thành theo cấp CEFR.
- **Trang cá nhân** (`/profile`) — huy hiệu gói, streak, số từ đã học, đăng xuất.
- Mở chiều B (dạy tiếng Việt cho người nước ngoài) — nút gạt chiều học.
- 4 theme đạt AA (🌙 Xanh đêm mặc định · ☀️ Blue sky · 🌸 Pink · 🎉 Rực rỡ), song ngữ toàn giao
  diện (kể cả `/login`).
- Deploy thật (VPS + PM2 + Nginx + SSL, sau Cloudflare), CI gate (lint/typecheck/test/build/E2E+a11y/size-limit).

## 3. Việc cố tình KHÔNG làm lúc này

- **Thanh toán Pro** — quyết định 2026-07-11: dự án **miễn phí cho cộng đồng**, không làm cổng
  thanh toán tới khi người dùng chủ động yêu cầu lại (xem `CLAUDE.md` mục 13).
- App di động riêng (native), ngôn ngữ ngoài Việt/Anh, học nhóm/lớp trực tiếp.

## 4. Yêu cầu phi chức năng

- **Tốc độ:** ngân sách bundle qua `size-limit` (Initial JS ≤ 116 kB, CSS ≤ 9 kB, brotli) —
  thay Lighthouse CI (không đo được trong sandbox CI hiện có).
- **Bảo mật:** không tin client; xác thực/đếm lượt/gọi AI đều ở server (`api/`, `server.ts`,
  `api/_lib/security.ts`, `api/_lib/usage.ts`); mọi handler API tự kiểm `user_id` khớp token qua
  `validateAuth()` trước khi query Postgres (thay Row Level Security cũ của Supabase) — chặn
  theo CỘT cho `profiles.plan`/`daily_usage.*_count` (chỉ server ghi được); secret qua env.
- **Accessibility:** WCAG AA — gate E2E quét bằng axe (`e2e/a11y.spec.ts`), phủ mọi route chính +
  4 theme + trạng thái sau tương tác, 0 critical/0 serious.
- **Mobile-first:** vùng chạm ≥ 44px, chữ ≥ 11px, input 16px; zoom mobile khoá chủ động.
- **Theme:** design tokens qua biến CSS `--a-*`, không hard-code màu, giữ màu ngữ nghĩa.

## 5. Tech stack

> **GIỮ NGUYÊN — không nâng React/TS/Tailwind/ESLint.** Tailwind 3 (không phải v4), ESLint 8
> `.eslintrc.cjs` (không phải flat config) là chủ đích.

- **Frontend:** React 18 + Vite 7 + TypeScript 5.2 (`strict` + `noUncheckedIndexedAccess`) +
  Tailwind CSS 3 (mã gốc do Lovable sinh ra).
- **Backend & dữ liệu:** Express (`server.ts`) + **PostgreSQL tự host trên VPS** (`pg`,
  `api/_lib/pgPool.ts`) — đã rời hẳn Supabase. Auth tự viết (Bearer token, `api/auth.ts` +
  `api/_lib/authService.ts`). Handler API kiểu serverless trong `api/`, gắn vào Express để chạy
  trên VPS.
- **AI:** chat/chấm viết qua `/api/claude` (`api/ai.ts`, ép model/token ở server) · STT Whisper
  qua Groq (`whisper-large-v3-turbo`) hoặc OpenAI (`gpt-4o-mini-transcribe`), tự chọn theo key ·
  TTS Google Cloud (`/api/tts`), cache **mã hoá AES-256-GCM** lưu local VPS hoặc Cloudflare R2
  tùy `STORAGE_DRIVER` (`api/_lib/fileStorage.ts`), Web Speech API chỉ là fallback.
- **Deploy:** VPS Ubuntu (PM2 + Nginx + Let's Encrypt) sau Cloudflare proxy —
  https://en-vi.donghanhcungban.com. Xem `docs/deploy-vps-ubuntu.md`.
- **Kiểm thử/CI:** Vitest (unit + coverage ratchet), Playwright (E2E + axe a11y), ESLint 8 +
  Prettier + husky/lint-staged/commitlint, `size-limit` — chạy trong CI trên mọi PR.

## 6. Thiết kế dữ liệu

> Nguồn: `postgres/schema.sql` (+ `postgres/migrations/`). Quyền ghi kiểm ở TẦNG SERVER qua
> `validateAuth()` (thay Row Level Security cũ của Supabase — xem `api/_lib/security.ts`).

| Bảng                  | Cột chính                                                                                                | Ghi chú                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `profiles`            | `id`, `name`, `plan` (`free`\|`pro`), `onboarded`, `user_level`, `goal`, `daily_minutes`                 | Server tự tạo lúc đăng ký (`api/_lib/authService.ts`). Client KHÔNG ghi được `plan`.            |
| `chat_sessions`       | `id`, `user_id`, `situation`, `level`, `messages` (jsonb), `created_at`                                  | Lịch sử Chat.                                                                                   |
| `writing_submissions` | `id`, `user_id`, `essay_prompt`, `essay`, `feedback`, `submitted_at`                                     | Lịch sử chấm bài.                                                                               |
| `speaking_sessions`   | `id`, `user_id`, `situation`, `level`, `messages` (jsonb), `created_at`                                  | Lịch sử luyện nói.                                                                              |
| `daily_usage`         | `user_id`, `day`, `chat_count`, `writing_count`, `speaking_count`, `stt_count`, `learn_count`            | PK `(user_id, day)`. 4 cột đếm lượt chỉ server (qua `consume_usage`/`refund_usage`) ghi được.   |
| `tts_cache`           | `hash` (SHA-256 text+lang+voice), `lang`, `voice`, `audio_url`                                           | Public read, chỉ server ghi (`validateAuth()` chặn client).                                     |
| `pronunciations`      | tương tự `tts_cache`, cache audio phát âm từ                                                             | Public read, chỉ server ghi.                                                                    |
| `learning_progress`   | `user_id` (PK), `learned`/`hard`, `srs`, `cefr_grammar`, `cefr_dialogues`, `cefr_unlocked`, `cefr_exams` | Đồng bộ tiến độ học đổi máy không mất; `cefr_exams` = kết quả thi cuối cấp.                     |
| `push_subscriptions`  | `id`, `user_id`, `endpoint`, `p256dh`, `auth_key`, `remind_hour`                                         | Web Push nhắc học.                                                                              |
| `challenge_entries`   | `id`, `user_id`, `day`/`round`, video/nhận xét AI                                                        | Thử thách — nay chạy chu kỳ tuần (xem PROGRESS.md), bảng đã có sẵn trong `postgres/schema.sql`. |

**Hàm DB:** `consume_usage`/`refund_usage` — kiểm tra + tăng/hoàn lượt atomic (SELECT FOR
UPDATE), fail-open khi RPC lỗi (ưu tiên không chặn nhầm người dùng hợp lệ).

## 7. Kiến trúc & API

- **Luồng:** client (React SPA) → `server.ts` (Express, gắn handler `api/*.ts`) → provider AI
  (Claude/Groq/OpenAI/Google TTS) + PostgreSQL tự host (`pgPool`). Mọi logic nhạy cảm chạy ở
  server.
- **Endpoint chính:** `POST /api/claude` (`api/ai.ts`, chat/chấm bài) · `POST /api/stt`
  (`api/stt.ts`, rate limit + đếm lượt riêng + refund khi provider lỗi) · `POST /api/tts`
  (`api/tts.ts`, cache theo hash + mã hoá, chỉ trả khoá cho người đã đăng nhập) ·
  `GET/POST /api/dictionary`, `POST /api/pronunciation`, `POST /api/push`.
- **`api/_lib/`:** `security.ts` (`validateAuth`, rate limit, CORS) · `usage.ts`
  (`checkAndConsumeUsage`/`refundUsage`) · `validation.ts` (Zod `readJsonBody`/`validateBody`,
  dùng ở `stt`/`tts`/`push`) · `ttsCrypto.ts` (AES-256-GCM).
- **Route client** (`src/App.tsx`): `/login`, `/onboarding`, `/`, `/chat`, `/writing`,
  `/speaking`, `/learning-path[/a1..c2]`, `/dictionary`, `/lessons`, `/phrases`, `/history`,
  `/progress`, `/profile`, `/challenge`.

## 8. Definition of Done (DoD)

Cổng ở `CLAUDE.md` mục 8 (trước commit) và mục 9 (trước merge): build/typecheck/lint (0 cảnh
báo)/format/test xanh; tự review diff; không secret/console.log rác; input đã validate; lỗi có
nhánh xử lý; đổi schema Postgres phải có migration idempotent (`postgres/migrations/`) chạy lại
an toàn + cách rollback.

## 9. Việc tiếp theo

Hiện không có việc code nào đang mở. Còn lại chỉ là thao tác THỦ CÔNG trên VPS (không cần PR) —
xem "Việc còn dang dở" trong `CLAUDE.md` mục 13 và "Cần làm tay" trong `PROGRESS.md`.

## 10. Rủi ro & Giả định

- **Chi phí API AI/STT/TTS** — giảm thiểu bằng đếm/giới hạn lượt server-side atomic, cache TTS
  dùng chung, model rẻ. Cơ chế đếm lượt **fail-open** (không chặn nhầm khi RPC lỗi) — đánh đổi
  có chủ đích, cần theo dõi log lỗi RPC nếu chi phí bất thường xuất hiện.
- **Chưa có cổng thanh toán** — nâng gói Pro hiện chỉ đổi tay cột `plan`.
- **Chia sẻ VPS** với app khác ("xboss", port 3000) trên cùng máy — chưa ghi nhận ảnh hưởng.
- **Phụ thuộc key bên thứ ba** (Groq/OpenAI, Google Cloud, provider chat) — thiếu key có fallback
  (Web Speech API) nhưng trải nghiệm giảm.
