# PROJECT.md — Gia sư ngôn ngữ AI song ngữ Việt ⇄ Anh

> Đặc tả dự án — nguồn sự thật về _cái gì cần xây_. Viết **ngược từ code thật** (dự án brownfield,
> theo `docs/framework/AP-DUNG-vao-du-an-co-san.md` Bước 0) — mọi khẳng định dưới đây truy được về
> file/dòng cụ thể trong repo. Cập nhật khi tính năng đổi; nguồn ngắn gọn hơn xem `CLAUDE.md` mục 13.

## 1. Vấn đề & Người dùng

- **Vấn đề:** học ngoại ngữ một mình thiếu người luyện hội thoại thật, và công cụ AI hiện có chỉ
  sửa lỗi bằng CHỮ chứ không đọc lại bằng giọng đúng ngôn ngữ mẹ đẻ của người học — khó hiểu lời giải
  thích khi trình độ còn thấp.
- **Người dùng mục tiêu:**
  - Chiều A: người Việt học tiếng Anh (giao tiếp hằng ngày, band viết kiểu IELTS).
  - Chiều B: người nước ngoài học tiếng Việt qua tiếng Anh (khách/người sống ở Việt Nam).
- **Điểm khác biệt giữ:** sửa lỗi & giải thích bằng **GIỌNG tiếng mẹ đẻ** của học viên (TTS 2 giọng
  riêng), hội thoại bằng giọng chuẩn ngôn ngữ đích, giá rẻ (dùng model AI rẻ + cache TTS), nội dung
  sát đời sống Việt Nam.

## 2. Phạm vi MVP (MoSCoW)

- **Must have (đã xong):**
  - Đăng nhập/đăng ký thật qua Supabase Auth (`src/lib/auth.ts`).
  - Chế độ **Chat** — gia sư AI trò chuyện, sửa lỗi, giải thích tiếng Việt (`/api/claude`).
  - Chế độ **Luyện viết** — chấm bài kiểu IELTS, chỉ lỗi, ước lượng band.
  - Chế độ **Luyện nói song ngữ** — ghi âm → STT (Whisper qua Groq/OpenAI) → trả lời giọng ngôn ngữ
    đích + sửa lỗi giọng tiếng mẹ đẻ (Google Cloud TTS, cache mã hoá).
  - Giới hạn lượt dùng theo ngày, tách riêng theo tính năng (chat/writing/speaking/stt), đồng bộ
    Supabase (`daily_usage`), chống race condition (RPC `consume_usage`).
  - Lộ trình học (`/learn`): vòng từ vựng nền tảng + lộ trình chuẩn CEFR A1→B2.
  - Bảng tiến độ (`/progress`): streak, biểu đồ 7 ngày, % hoàn thành theo cấp CEFR.
  - Mở chiều B (dạy tiếng Việt cho người nước ngoài) — nút gạt chiều học.
  - Deploy thật (VPS + PM2 + Nginx + SSL), 4 theme đạt AA, E2E (gồm typecheck) + a11y gate trong CI.
  - i18n trang Login (song ngữ vi/en + nút gạt VI/EN) — PR #147.
- **Should have (chưa xong):**
  - **Thanh toán Pro** — hiện `plan` chỉ đổi tay trong bảng `profiles`, chưa có cổng thanh toán/webhook.
    Cần chốt sản phẩm (nhà cung cấp, giá, webhook) trước khi code.
- **Could have:**
  - Gắn nhãn CEFR (A1–C2) cho từng từ vựng mở rộng — **hạ tầng đã có** (`scripts/tag-cefr-levels.ts`,
    field `DictEntry.level`, PR #150) nhưng CHƯA chạy phân loại thật (cần key AI, xem PROGRESS.md).
  - Zod validate runtime cho input/env (đánh giá là giá trị thấp hiện tại — input đã validate tay
    kỹ ở `api/ai.ts`, `api/stt.ts`; xem PROGRESS.md "Quyết định quan trọng").
  - Đếm lượt riêng cho STT khi cần tách khỏi mô hình hiện tại (đã tách sẵn — xem §5).
- **Won't have (lúc này):** app di động riêng (native), đa ngôn ngữ ngoài Việt/Anh, học nhóm/lớp
  học trực tiếp.

## 3. Yêu cầu phi chức năng

- **Tốc độ:** ngân sách bundle qua `size-limit` (Initial JS ≤ 116 kB, CSS ≤ 9 kB, brotli) thay
  Lighthouse CI (Lighthouse không đo được trong sandbox hiện có — xem PROGRESS.md).
- **Bảo mật:** không tin client; kiểm quyền + đếm lượt + gọi AI đều ở server (`api/`, `server.ts`,
  `api/_lib/security.ts`, `api/_lib/usage.ts`); RLS Supabase bật trên mọi bảng người dùng, đã test;
  secret qua biến môi trường, không lộ trong code.
- **Accessibility:** WCAG AA — gate E2E quét bằng axe (`e2e/a11y.spec.ts`), phủ mọi route chính +
  cả 4 theme + trạng thái sau tương tác (kể cả màn kết quả AI qua API giả lập), 0 critical/0 serious.
- **Mobile-first:** vùng chạm ≥ 44px, thiết kế màn nhỏ trước; zoom mobile khoá chủ động (đánh đổi
  a11y, bù bằng sàn chữ ≥ 11px, input 16px).
- **Theme:** **4 theme, mặc định "Xanh đêm"** (🌙 Xanh đêm · ☀️ Blue sky · 🌸 Pink · 🎉 Rực rỡ), design
  tokens qua biến CSS `--a-*`, không hard-code màu, giữ màu ngữ nghĩa (xanh lá = đúng, phân cấp
  A1–B2/loại từ).

## 4. Tech stack

> Phiên bản đọc trực tiếp từ `package.json` (đã xác minh 2026-07-01). **GIỮ NGUYÊN — không nâng
> React/TS/Tailwind/ESLint** (dự án cố tình dùng Tailwind 3 + ESLint 8 legacy config).

- **Frontend:** React 18.3 + Vite 7.3 + TypeScript 5.2 (`strict` + `noUncheckedIndexedAccess`) +
  Tailwind CSS 3.4 (mã gốc do Lovable sinh ra).
- **Backend & dữ liệu:** Express 4.21 (`server.ts`) + Supabase (Auth, Postgres có RLS, Storage).
  Handler API kiểu serverless trong `api/`, gắn vào Express để chạy trên VPS.
- **AI:**
  - Chat/chấm viết: gọi qua biến môi trường, ưu tiên model rẻ, qua `/api/claude` (server ép
    model + giới hạn token, không tin tham số client).
  - STT: Whisper qua Groq (`whisper-large-v3-turbo`) hoặc OpenAI (`gpt-4o-mini-transcribe`) —
    tự chọn theo key có sẵn (`api/stt.ts`, `api/_lib/openaiStt.ts`).
  - TTS: Google Cloud TTS qua `/api/tts`, cache audio **mã hoá AES-256-GCM** trên Supabase Storage
    (`api/_lib/ttsCrypto.ts`), Web Speech API chỉ là fallback.
- **Deploy:** VPS Ubuntu (PM2 + Nginx + Let's Encrypt), chạy thật tại
  https://en-vi.donghanhcungban.com — xem `docs/deploy-vps-ubuntu.md`.
- **Kiểm thử/CI:** Vitest (unit + coverage ratchet), Playwright (E2E + quét a11y bằng axe),
  ESLint 8 + Prettier + husky/lint-staged/commitlint, `size-limit` (ngân sách bundle) — tất cả
  chạy trong CI trên mọi PR.

## 5. Thiết kế dữ liệu

> Nguồn: `supabase/schema.sql`. Mọi bảng người dùng bật RLS, policy `auth.uid() = user_id` (hoặc
> `= id` với `profiles`) — "own X": chỉ chủ sở hữu đọc/ghi được dòng của mình.

| Bảng                  | Cột chính                                                                                                    | Ghi chú                                                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profiles`            | `id` (=`auth.users.id`), `name`, `plan` (`free`\|`pro`), `onboarded`, `user_level`, `goal`, `daily_minutes`  | Tự tạo khi đăng ký mới qua trigger `handle_new_user`. Nâng Pro = đổi tay `plan`.                                                                                |
| `chat_sessions`       | `id`, `user_id`, `situation`, `level`, `messages` (jsonb), `created_at` (epoch ms)                           | Lịch sử chế độ Chat.                                                                                                                                            |
| `writing_submissions` | `id`, `user_id`, `essay_prompt`, `essay`, `feedback` (JSON string), `submitted_at`                           | Lịch sử chấm bài viết.                                                                                                                                          |
| `speaking_sessions`   | `id`, `user_id`, `situation`, `level`, `messages` (jsonb), `created_at`                                      | Lịch sử luyện nói.                                                                                                                                              |
| `daily_usage`         | `user_id`, `day` ('YYYY-MM-DD'), `chat_count`, `writing_count`, `speaking_count`, `stt_count`, `learn_count` | Khoá chính `(user_id, day)`. `stt_count` **tách riêng** khỏi `speaking_count` (không dùng chung giới hạn). `learn_count` không bị giới hạn, chỉ để tính streak. |
| `tts_cache`           | `hash` (SHA-256[0:32] của text+lang+voice), `lang`, `voice`, `audio_url`                                     | Public read (audio dùng chung mọi user); chỉ service role ghi được.                                                                                             |
| `learning_progress`   | `user_id` (PK), `learned`/`hard` (jsonb mảng từ), `srs` (jsonb map SRS: interval/ease/due/reps)              | Đồng bộ tiến độ học đổi máy không mất.                                                                                                                          |
| `push_subscriptions`  | `id`, `user_id`, `endpoint`, `p256dh`, `auth_key`, `remind_hour`                                             | Web Push nhắc học; unique `(user_id, endpoint)`.                                                                                                                |

**Hàm DB quan trọng:**

- `consume_usage(user_id, day, col, limit)` — kiểm tra + tăng lượt **atomic** (SELECT FOR UPDATE),
  chống race condition khi 2 request cùng lúc vượt giới hạn Free. Chỉ nhận 4 cột hợp lệ (`chat_count`,
  `writing_count`, `speaking_count`, `stt_count`).
- `refund_usage(user_id, day, col)` — hoàn 1 lượt khi provider AI lỗi (trừ trước khi gọi, hoàn nếu
  gọi thất bại), không xuống dưới 0.

## 6. Kiến trúc & API

- **Luồng:** client (React SPA) → `server.ts` (Express, gắn handler `api/*.ts`) → provider AI
  (Claude/Groq/OpenAI/Google TTS) + Supabase (Auth/DB/Storage). Mọi logic nhạy cảm (xác thực, đếm
  lượt, gọi AI, giải mã audio cache) chạy ở server — client không tự gọi thẳng provider AI.
- **Endpoint (`api/`):**
  - `POST /api/claude` (`api/ai.ts`) — chat/chấm bài; server tự parse + validate body tay (giới
    hạn kích thước, số message, độ dài nội dung), ép `model`/`max_tokens`/`system`, không tin
    tham số nhạy cảm từ client.
  - `POST /api/stt` (`api/stt.ts`) — nhận audio base64, validate `audio_b64`/`mime`/`lang`, rate
    limit 15 req/phút/IP + `checkAndConsumeUsage(userId, 'stt')`, gọi Whisper (Groq ưu tiên, fallback
    OpenAI), `refundUsage` nếu provider lỗi.
  - `POST /api/tts` (`api/tts.ts`) — Google Cloud TTS, cache theo hash trên `tts_cache`/Storage, audio
    mã hoá AES-256-GCM, chỉ trả khoá giải mã cho người đã đăng nhập.
  - `GET/POST /api/dictionary` (`api/dictionary.ts`), `POST /api/pronunciation` (`api/pronunciation.ts`),
    `POST /api/push` (`api/push.ts`) — tra từ điển, cache phát âm, đăng ký/gửi Web Push.
  - `api/_lib/security.ts` — `validateAuth` xác thực token Supabase (có `SKIP_AUTH` cảnh báo cho dev),
    `logSecurityEvent` ghi log sự kiện bảo mật.
  - `api/_lib/usage.ts` — `checkAndConsumeUsage`/`refundUsage`, đọc `plan` từ `profiles`, đối chiếu
    `LIMITS` (free/pro) theo từng `UsageMode` (`chat`|`writing`|`speaking`|`stt`), gọi RPC
    `consume_usage`/`refund_usage`, có fallback không-atomic khi RPC lỗi (thiết kế **fail-open**).
- **Route client (`src/App.tsx`):** `/login`, `/onboarding`, `/` (Home), `/chat`, `/writing`,
  `/speaking`, `/learning-path`, `/dictionary`, `/lessons`, `/phrases`, `/history`, `/progress`.

## 7. Luồng người dùng chính

1. Vào `/login` → đăng nhập/đăng ký qua Supabase Auth → (lần đầu) `/onboarding` chọn trình độ/mục tiêu.
2. Chọn **chiều học** (A: học Anh · B: học Việt qua Anh) qua nút gạt (`lib/direction.ts`).
3. Chọn 1 trong 3 chế độ: Chat / Luyện viết / Luyện nói — mỗi lượt gọi AI bị đếm & giới hạn theo
   `plan` (Free/Pro); hết lượt → chặn ở client + server.
4. (Song song) Vào `/learn` học từ vựng theo vòng tròn chủ đề hoặc lộ trình CEFR; vào `/progress`
   xem streak, % hoàn thành, từ cần ôn (SRS).

## 8. Definition of Done (DoD)

Áp dụng cổng ở `CLAUDE.md` mục 8 (trước commit) và mục 9 (trước merge): build/typecheck/lint (0
cảnh báo)/format/test xanh; tự review diff; không secret/console.log rác; input đã validate; lỗi
có nhánh xử lý; nếu đổi schema Supabase phải có migration chạy lại an toàn (idempotent, theo mẫu
`schema.sql` hiện tại) + cách rollback.

## 9. Lộ trình & Mốc thời gian

- **Đã xong (GĐ 1–5):** MVP 3 chế độ, deploy thật, đồng bộ Supabase, chiều B, lộ trình học +
  CEFR, bảng tiến độ, hệ theme 4 màu, i18n Login, và đợt "áp khung" brownfield (Prettier/ESLint/
  TS strict, husky, CI gate, E2E + typecheck E2E + a11y AA toàn site, coverage ratchet,
  bundle-size budget, hạ tầng gắn nhãn CEFR) — chi tiết từng PR xem `PROGRESS.md`.
- **Đang làm:** không có việc code nào đang mở. Còn 1 bước THỦ CÔNG (không cần PR): chạy
  `npm run tag:cefr` (cần key AI trong `.env`) để thực sự gắn nhãn ~9.500 từ vựng mở rộng.
- **Tiếp theo (mỗi việc 1 PR, xin duyệt ở mỗi cổng — xem `PROGRESS.md`):**
  1. Thanh toán Pro — **cần chốt trước:** nhà cung cấp thanh toán, mức giá, cách xác nhận
     (webhook) trước khi code (theo `CLAUDE.md` mục 12: đụng thanh toán phải dừng hỏi).
  2. (Tuỳ chọn, giá trị thấp) Zod validate env/input.

## 10. Rủi ro & Giả định

- **Chi phí API AI/STT/TTS** — rủi ro chính là vượt ngân sách. Giảm thiểu bằng đếm/giới hạn lượt
  theo ngày (server-side, atomic), cache TTS dùng chung, chọn model rẻ. Giả định nguy hiểm nhất:
  cơ chế đếm lượt là **fail-open** (`api/_lib/usage.ts` fallback không-atomic khi RPC lỗi) — nếu
  Supabase RPC lỗi kéo dài, có thể vượt giới hạn Free trong lúc đó. Đánh đổi có chủ đích (ưu tiên
  không chặn nhầm người dùng hợp lệ khi hạ tầng lỗi) — cần kiểm chứng bằng theo dõi log lỗi RPC
  thực tế nếu chi phí bất thường xuất hiện.
- **Chưa có cổng thanh toán** → chưa thể thu tiền Pro thật; nâng gói hiện chỉ đổi tay cột `plan`.
- **Chia sẻ VPS** với app khác ("xboss", port 3000) trên cùng máy 160.30.172.203 — rủi ro tài
  nguyên (CPU/RAM) dùng chung; hiện chưa ghi nhận ảnh hưởng qua lại.
- **Phụ thuộc key bên thứ ba** (Groq/OpenAI cho STT, Google Cloud cho TTS, provider Claude cho
  chat) — nếu thiếu key, STT/TTS/Chat có fallback (Web Speech API, hoặc lỗi có xử lý) nhưng trải
  nghiệm giảm.
