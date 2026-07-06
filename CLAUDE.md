# CLAUDE.md — Gia sư tiếng Anh AI

> File này được Claude Code đọc tự động ở đầu mỗi phiên. Mục tiêu: giúp Claude hiểu dự án và làm đúng ý.
> **Người làm: mới bắt đầu lập trình.** Hãy GIẢI THÍCH NGẮN GỌN BẰNG TIẾNG VIỆT khi sửa code, và **cảnh báo trước khi làm thay đổi lớn**.
> Giữ file này gọn — chi tiết tính năng/kế hoạch để ở `PROJECT.md` · `PROGRESS.md` · tài liệu liên quan, đọc khi cần.

## 0. Vai trò của bạn (AI)

Bạn vừa là **kỹ sư phần mềm cấp cao**, vừa là **người quản lý dự án**. Không chỉ code theo lệnh — bạn dẫn dắt dự án qua các giai đoạn một cách kỷ luật, giữ chất lượng cao nhất, và **chủ động góp ý để dự án hoàn thiện nhất**. Khi nhận **ý tưởng/thay đổi công nghệ**, bạn **nghiên cứu kỹ rồi mới đề xuất** — đúng phiên bản ổn định hiện hành (xem KHUNG 3).

## 1. Dự án này là gì

Web app **gia sư ngôn ngữ AI hai chiều (Việt ⇄ Anh)**.

**Hai chiều học** (chọn bằng biến `direction` — `lib/direction.ts`):

- **A — Người Việt học tiếng Anh:** hội thoại giọng Anh, sửa lỗi/giải thích giọng tiếng Việt.
- **B — Người nước ngoài học tiếng Việt (qua tiếng Anh):** hội thoại giọng Việt, sửa lỗi/giải thích giọng tiếng Anh.

Ba chế độ:

1. **Chat tổng hợp** — gia sư AI trò chuyện thân mật/nhẹ nhàng, sửa lỗi kèm động viên, giải thích
   bằng tiếng Việt; có nút "Kết thúc & chấm điểm" cuối phiên (chấm kiểu IELTS Speaking).
2. **Luyện viết + chấm điểm** — chấm bài kiểu IELTS, chỉ lỗi, ước lượng band.
3. **Luyện nói song ngữ** (tính năng chính) — nói → AI nghe (STT) → trả lời bằng **giọng ngôn ngữ đích** + sửa lỗi/giải thích bằng **giọng tiếng mẹ đẻ của học viên** (TTS hai giọng riêng). Chiều A: đích=Anh, giải thích=Việt. Chiều B: đích=Việt, giải thích=Anh.

Điểm khác biệt phải giữ: **sửa lỗi & giải thích bằng GIỌNG tiếng mẹ đẻ** (không chỉ chữ), hội thoại bằng giọng chuẩn của ngôn ngữ đích, giá rẻ, nội dung sát đời sống Việt Nam.

## 2. Tài liệu của dự án (đọc khi liên quan)

- `@PROJECT.md` — _cái gì_ cần xây (vấn đề, MVP, schema, kiến trúc, DoD). **Đọc trước việc liên quan tính năng/thiết kế.**
- `PROGRESS.md` — giai đoạn hiện tại, đã xong / đang làm / tiếp theo, quyết định quan trọng, **nợ kỹ thuật**.
- `App-Gia-Su-Tieng-Anh-AI.md` — kế hoạch sản phẩm đầy đủ.
- `docs/framework/KHUNG-1..3-*.md` — quy trình 9 giai đoạn + luật AI + research-first chọn công nghệ.
- `docs/framework/BO-SUNG-*.md` — chất lượng Nhóm 1/2 (mobile, hiệu năng, a11y, UI/UX, chống lỗi logic), theme, i18n/PWA/Sentry/SEO.
- `docs/framework/AP-DUNG-vao-du-an-co-san.md` — cách áp khung lên dự án có sẵn (đang theo runbook này).
- `docs/deploy-vps-ubuntu.md` — hướng dẫn deploy VPS. ADR (quyết định kiến trúc lớn): đặt ở `docs/adr/` khi có.

> Các file trong `docs/framework/` là tham khảo dài — đọc đúng phần cần, không nạp toàn bộ mỗi phiên.

## 3. Cách quản lý dự án (quan trọng nhất)

- **Theo giai đoạn, không bỏ giai đoạn.** Đầu phiên nêu rõ đang ở giai đoạn nào, việc tiếp theo là gì.
- **Cổng giữa các giai đoạn.** Trước khi chuyển giai đoạn / thay đổi lớn: tóm tắt đã đạt cổng chưa và **xin xác nhận của người dùng**.
- **Theo dõi trạng thái.** Cập nhật `PROGRESS.md` sau mỗi mốc.
- **Chia nhỏ.** Mỗi lần một phần nhỏ, hoàn chỉnh, kiểm tra được. Việc lớn → đề xuất kế hoạch chia nhỏ trước.
- **Chủ động góp ý (BẮT BUỘC).** Thấy cách tốt hơn / rủi ro / thiếu sót yêu cầu / phạm vi phình → **nêu kèm đề xuất cụ thể**. Im lặng làm theo khi biết có vấn đề là vi phạm.
- **Nhịp làm việc theo giới hạn giờ (usage limit).** Kiểm tra mức dùng giới hạn trước khi quyết định tiếp:
  - **≥ 70%:** hoàn tất việc đang làm, cập nhật `PROGRESS.md`, **tạo PR rồi DỪNG — chờ người dùng cho phép** mới làm tiếp.
  - **< 70%:** sau khi PR được **merge**, **tự động tiếp tục** mục kế tiếp trong `PROGRESS.md` (không cần hỏi).

## 4. Nguyên tắc kỹ thuật bất biến

1. **Type safety:** TypeScript `strict` (đã bật), không `any`. Dữ liệu ngoài (API, form, CSDL) validate lúc chạy bằng **Zod** _(đang bổ sung dần — xem PROGRESS)_.
2. **Bảo mật:** không tin client; logic nhạy cảm (kiểm quyền, đếm lượt, gọi AI) luôn ở server (`api/`, `server.ts`); RLS Supabase bật và đã test; không lộ secret.
3. **Xử lý lỗi:** mọi thao tác có thể fail (mạng, CSDL, AI) đều có nhánh lỗi + trạng thái tải/rỗng/lỗi trên UI.
4. **Rõ ràng & DRY:** không lặp logic; hàm nhỏ làm một việc; tên tự giải thích; không "số/chuỗi ma thuật".
5. **Accessibility:** WCAG AA (tương phản, bàn phím, nhãn input, alt ảnh); lint `jsx-a11y` + axe trong E2E _(đang bổ sung)_.
6. **Không bí mật trong code:** dùng biến môi trường; `.env` đã nằm trong `.gitignore`.
7. **Mobile-first & hiệu năng:** thiết kế màn nhỏ trước, vùng chạm ≥ 44px; hướng tới ngân sách Core Web Vitals (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1) — Lighthouse CI _(đang bổ sung)_.
8. **Theme:** **4 theme, mặc định "Xanh đêm"**; dùng design tokens qua biến CSS `--a-*` (`src/index.css` + `tailwind.config.js`), **không hard-code màu**; giữ màu ngữ nghĩa (xanh lá = "đúng", phân cấp A1–B2/loại từ). AA ở mọi theme.
9. **Chống lỗi logic:** type-checker không bắt lỗi nghiệp vụ — rà ca biên/rỗng, `null` vs 0, async race/idempotency, thời gian UTC, đếm lượt đúng; mỗi nhánh logic phức tạp có ≥ 1 test ca biên.

## 5. Chống "ảo giác" (bắt buộc)

- Không bịa hàm/thư viện/API — xác nhận tồn tại (đọc tài liệu/mã nguồn) trước khi dùng.
- Không giả định cấu trúc dự án — đọc file thật để biết tên, kiểu, cấu trúc hiện có. **AI tự xác định stack/phiên bản** bằng cách đọc repo — không hỏi người dùng điều đã có trong code.
- Không đoán kết quả lệnh — thực sự chạy và đọc output.

## 6. Công nghệ (stack) & lệnh

- **Frontend:** React 18 + Vite 7 + TypeScript 5.2 (`strict`) + Tailwind CSS 3 (mã gốc do Lovable sinh ra).
- **Backend & dữ liệu:** Express (`server.ts`) + **Supabase** (Auth, DB có RLS, Storage). Handler API trong `api/`.
- **AI:** gọi qua biến môi trường, ưu tiên model rẻ. Chat qua `/api/claude`. **STT** Whisper qua **Groq hoặc OpenAI** (`/api/stt`, tự chọn theo key). **TTS** Google Cloud qua `/api/tts` (audio cache **mã hóa AES-256-GCM** trên Supabase Storage; Web Speech API chỉ là fallback).
- **Deploy:** VPS Ubuntu (PM2 + Nginx + Let's Encrypt), đang chạy tại https://en-vi.donghanhcungban.com — xem `docs/deploy-vps-ubuntu.md`.
- **GIỮ NGUYÊN PHIÊN BẢN — KHÔNG nâng React/TS/Tailwind/ESLint.** Dự án cố tình dùng **Tailwind 3** (không phải v4) và **ESLint 8 với `.eslintrc.cjs`** (không phải flat config). Tài liệu khung có nhắc Tailwind v4 / ESLint flat config — chỉ để **tham khảo**, KHÔNG áp vào dự án này.
- **Lệnh:** dev `npm run dev` · build `npm run build` · typecheck `npm run typecheck` (gộp cả `tsconfig.json` + `tsconfig.api.json` + `tsconfig.e2e.json`) · lint `npm run lint` (max-warnings 0) · format `npm run format` (Prettier — đang thêm ở bước khung) · test `npm test` (`vitest run`) · E2E `npm run test:e2e` (Playwright) · start `npm start` (`tsx server.ts`).
- **Cấu trúc:** `src/` (React: `pages/`, `components/`, `lib/`, `data/`, `prompts/`), `api/` (handler kiểu serverless), `server.ts` (Express gắn handler), `supabase/` (`schema.sql`), `scripts/` (seed/sync), `docs/`.
- **Đặt tên:** component PascalCase (`src/components`), tiện ích camelCase (`src/lib`), prompt gửi AI để riêng trong `src/prompts/`.

## 7. Quy ước khi viết code & cách làm việc

- Code đơn giản, dễ đọc, **thêm comment tiếng Việt** ở chỗ quan trọng. Mỗi file/hàm làm 1 việc; tên biến tiếng Anh dễ hiểu.
- KHÔNG đưa API key/mật khẩu vào code — luôn dùng `.env`. Mọi lệnh gọi AI phải **đếm/giới hạn lượt** (Free vs Pro) tránh tốn tiền API.
- Trước khi sửa nhiều file hoặc đổi cấu trúc: **giải thích kế hoạch ngắn gọn rồi hỏi trước**. Mỗi thay đổi nhỏ, dễ kiểm tra; sau khi sửa nói rõ đã đổi gì + cách chạy thử.
- Gặp khái niệm mới: **giải thích cho người mới hiểu**. Ưu tiên giải pháp **miễn phí / chi phí thấp** (dự án vốn tối thiểu).

## 8. Cổng trước khi COMMIT (chạy và đạt hết)

Build `npm run build` · Type `npm run typecheck` · Lint `npm run lint` (0 cảnh báo) · Format `npm run format` _(sau khi thêm Prettier)_ · Test `npm test`. Ngoài ra: tự đọc lại diff (đúng mục tiêu, không sửa nhầm); xóa `console.log` debug/code chết; không bí mật trong code; mọi input đã validate; mọi thao tác có thể lỗi đã xử lý; commit message theo **conventional commits**.

## 9. Cổng trước khi MERGE (thêm)

Đạt toàn bộ cổng commit · chạy TOÀN BỘ test (xanh) · nhánh đã cập nhật với nhánh chính, không xung đột · đối chiếu đủ tiêu chí chấp nhận (`PROJECT.md`) + Definition of Done · tự chạy smoke test luồng chính (thật) · rà bảo mật (quyền server, không lộ dữ liệu) · không phá tính năng khác (ghi rõ nếu có breaking change) · nếu đổi schema: có migration có phiên bản, rollback được.

## 10. Báo cáo xác thực (xuất trước mỗi commit/merge)

```
Build ✅/❌ | Type ✅/❌ (lỗi:..) | Lint ✅/❌ (cảnh báo:..) | Format ✅/❌ | Test ✅/❌ (X/Y)
Tự review diff ✅ | Không bí mật/rác ✅ | Tiêu chí chấp nhận ✅ | DoD ✅
Rủi ro/ảnh hưởng: .. | Góp ý cải tiến: ..
KẾT LUẬN: Sẵn sàng  /  Cần xử lý: [..]
```

Bất kỳ mục ❌ → sửa trước, chạy lại toàn bộ, KHÔNG commit/merge.

## 11. Quy ước Git

Mỗi tính năng/sửa lỗi một nhánh riêng · commit nhỏ, mỗi commit một thay đổi logic · **conventional commits** (`feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`) · mọi merge vào nhánh chính qua pull request (kể cả làm một mình) · **không push thẳng nhánh chính**.

## 12. Khi nào PHẢI dừng và hỏi

Yêu cầu mơ hồ / nhiều cách hiểu · thao tác không thể hoàn tác (xóa dữ liệu, đổi schema phá vỡ) · mâu thuẫn với code/thiết kế hiện có · breaking change ảnh hưởng nhiều nơi · nhiều giải pháp đánh đổi khác nhau đáng kể · đụng bảo mật, thanh toán, dữ liệu người dùng thật.

## 13. Trạng thái hiện tại

> Cập nhật 2026-07-02.

- [x] Khởi tạo project + đăng nhập (Supabase Auth đã chạy thật — `lib/auth.ts`, `AuthProvider`)
- [x] Chế độ Chat (MVP) — gọi AI thật qua `/api/claude` (edge function ép model + token)
- [x] Chế độ Luyện viết + chấm điểm (MVP) — chấm kiểu IELTS
- [~] Giới hạn lượt + gói trả phí — lượt dùng đã đồng bộ lên Supabase (`daily_usage`); gói `plan` đọc từ bảng `profiles`; thanh toán Pro chưa có
- [x] Deploy VPS (Express `server.ts` + PM2 + Nginx + Let's Encrypt) — ĐÃ deploy thật tại https://en-vi.donghanhcungban.com (PM2 process `english-tutor`, port 3001, dùng chung VPS 160.30.172.203 với app "xboss" ở port 3000 — không ảnh hưởng nhau). SSL Let's Encrypt tự renew. Lưu ý: `ecosystem.config.cjs` trên VPS dùng `interpreter: /usr/bin/node` (Node hệ thống v22, **bắt buộc**) — nhớ đồng bộ nếu sửa file này. (code + hướng dẫn: `docs/deploy-vps-ubuntu.md`)
- [x] Đồng bộ Supabase — chat/viết/nói/lượt dùng lưu lên DB (RLS), login Supabase thống nhất cho mọi trang. Xem `SUPABASE_SYNC_SETUP.md` + `supabase/schema.sql`
- [x] Chế độ Luyện nói song ngữ — TTS chính Google Cloud TTS qua `/api/tts` (cache mã hóa AES-256-GCM trên Supabase Storage, bắt buộc đăng nhập mới lấy được khoá giải mã), Web Speech API chỉ còn fallback. **STT thật**: ghi âm trình duyệt (`MediaRecorder`, `src/lib/sttServer.ts`) → base64 lên `/api/stt` → Whisper qua Groq hoặc OpenAI (`api/stt.ts` + `api/_lib/openaiStt.ts`, có `GROQ_API_KEY` thì dùng Groq `whisper-large-v3-turbo`, không thì OpenAI `gpt-4o-mini-transcribe`); Web Speech API (`src/lib/stt.ts`) chỉ còn dự phòng. Cần `GROQ_API_KEY` (hoặc `OPENAI_API_KEY`).
- [x] Mở chiều B: dạy tiếng Việt cho người nước ngoài (nút gạt ngôn ngữ + đảo giọng) — `lib/direction.ts`
- [x] Chế độ Học theo lộ trình (`/learn`) — curriculum nền tảng theo vòng tròn chủ đề rồi nối tiếp bằng từ điển; tốc độ học **5/10/20 từ/ngày, tự chọn ở Hồ sơ** (`lib/curriculum.ts` — `getDailySpeed`/`setDailySpeed`; mặc định 10 cho người dùng mới, người dùng cũ giữ 20); ôn ngẫu nhiên không lặp trong 1 vòng; học xong hiện câu thông dụng ráp từ các từ vừa học. Dữ liệu: `src/data/curriculum.ts`, logic: `src/lib/curriculum.ts`
- [x] Lộ trình CHUẨN CEFR — **A1→C2 đầy đủ 6 cấp** (2026-07-06 mở thêm C1/C2, xem `docs/research/lo-trinh-cefr-c1-c2.md`): C1 687 từ / 10 bài ngữ pháp, C2 1.561 từ / 7 bài — từ vựng C1/C2 lấy TỰ ĐỘNG từ từ điển đã gắn nhãn CEFR (`scripts/gen-cefr-c1c2-vocab.ts` → `src/data/cefrC1C2Vocab.json`, lọc `freq≥2000` bỏ từ gắn nhầm + khử trùng nền tảng), ngữ pháp soạn tay ở `src/data/cefrAdvanced.ts` (nối vào `CEFR_LEVELS`; accent rose/cyan trong `cefrAccent.ts`). A1–B2: 21 unit / ~55 bài ngữ pháp; mỗi cấp có mục tiêu "can-do", mỗi bài có cấu trúc + giải thích tiếng Việt + ví dụ bấm nghe; liên kết trọn 34 vòng từ vựng (flashcard `WordCard`, vào SRS + đếm lượt ngày). **Mỗi cấp 1 TRANG RIÊNG** `/learning-path/a1…c2` (`src/pages/CefrLevelPage.tsx`): thẻ "Học tiếp", unit theo trình tự ① Từ vựng → ② Ngữ pháp → ③ Hội thoại, mục hoàn thành 100% tự ẩn (xem lại được), bài ngữ pháp có nút "Đã học xong" (`src/lib/cefrProgress.ts` — đồng bộ Supabase qua cột `cefr_grammar`/`cefr_dialogues` của `learning_progress`, migration `0007`). Trang `/learning-path` = tổng quan 6 cấp (`RoadmapTab.tsx` + mốc từ vựng); màn chi tiết dùng chung ở `CefrLessonViews.tsx`. **4 tab học Hôm nay · Ôn SRS · Từ khó · Kiểm tra nằm TRONG trang từng cấp** (thanh tab đầu trang `CefrLevelPage.tsx`, nội dung `src/components/StudyTabs.tsx`) và lọc dữ liệu THEO TỪ VỰNG CỦA CẤP (`getLevelWords()`; cấp cuối C2 học tiếp phần ngoài CEFR — `getBeyondCefrWords()`); giới hạn ngày (tốc độ 5/10/20 từ/lượt tự chọn, tối đa 5× tốc độ/ngày) vẫn tính chung toàn app. Dữ liệu: `src/data/cefr.ts`. **[Cập nhật 2026-07-06]** Toàn bộ từ điển (10.746 từ) đã 100% có nhãn CEFR thật (`DictEntry.level`, gắn qua CEFR-J/Octanove/Words-CEFR-Dataset + AI cho phần còn lại — xem PROGRESS.md các đợt "gắn nhãn CEFR") và 10.425/10.746 (97%) đã có `freq` thật (SUBTLEX-US, `scripts/assign-word-freq.ts`) nên phần "Mở rộng" đã sắp đúng theo **tần suất** (`compareByFreq`), không còn theo alphabet. Từ vựng Đợt 1 CEFR-J (A1-B2, 1.649 từ + 125 cụm) và cấp C1/C2 của lộ trình (2.248 từ, dùng lại từ đã gắn nhãn) đã hoàn tất. Còn lại: **Đợt 2 dictionary-completion — bổ sung ~1.407 từ CEFR-J C1/C2 CÒN THIẾU vào từ điển** (khác với việc dùng lại từ có sẵn để xây lộ trình C1/C2 — xem PROGRESS.md mục "Còn lại: Đợt 2").
- [x] (v2) Theo dõi tiến bộ, streak, chấm phát âm — streak, WordOfTheDay, Flashcard, cache phát âm (`api/pronunciation.ts`); chấm phát âm chạy trình duyệt bằng Web Speech + Levenshtein (`src/lib/pronounceScore.ts` + `src/components/PronunciationCheck.tsx`).
- [x] Bảng tiến độ (`/progress`) — streak + biểu đồ 7 ngày, mục tiêu từ mới hôm nay + lượt còn lại, số từ đã thuộc + cần ôn SRS + % lộ trình, % hoàn thành từng cấp CEFR A1→B2, tổng kết phiên. Logic: `src/lib/stats.ts`; UI: `src/pages/Dashboard.tsx`.
- [x] Tên miền canonical (SEO) đọc từ `VITE_SITE_URL` trong `src/App.tsx`, mặc định domain production. Xem `.env.example`.
- [x] **Hệ thống theme + audit UI** — màu nhấn thương hiệu thành biến CSS `--a-*` (class `accent-*`, map trong `tailwind.config.js`). **4 theme, mặc định Xanh đêm**: 🌙 Xanh đêm · ☀️ Blue sky · 🌸 Pink · 🎉 Rực rỡ. Chọn theme qua menu swatch (`src/components/ThemeToggle.tsx`); định nghĩa ở `src/index.css` + `src/lib/theme.ts`. Giữ màu ngữ nghĩa. Font: sàn chữ ≥ 11px, input 16px. Zoom mobile khóa chủ động (đánh đổi 1 mục a11y, bù bằng sàn chữ).
- [x] Giọng điệu Chat/Speaking thân mật, nhẹ nhàng hơn + nút "Kết thúc & chấm điểm" cuối phiên
      (chấm kiểu IELTS Speaking: fluency/từ vựng/ngữ pháp, riêng Speaking có thêm phát âm) — kết quả
      chỉ hiện tạm trong phiên, không lưu Supabase. Xem `PROGRESS.md` (PR #170).

### Việc còn dang dở / cần quyết định

1. STT đã xong (Whisper Groq/OpenAI qua `/api/stt`) **và đã đếm lượt riêng** (mode `stt` tách khỏi
   `speaking`: cột `stt_count`, giới hạn free 10/pro 100 — `api/_lib/usage.ts`, `src/types.ts`). Còn: thêm
   `GROQ_API_KEY` (hoặc `OPENAI_API_KEY`) vào `.env` trên VPS.
2. Repo GitHub đồng bộ VPS: `ecosystem.config.cjs` đã khớp `interpreter: /usr/bin/node`; đã rà lại
   `api/_lib/security.ts` (`validateAuth`) — repo hiện sạch, không còn debug log tạm (ghi chú cũ đã lỗi thời).
3. Thanh toán Pro chưa có (giới hạn lượt đã đồng bộ Supabase, chưa có cổng thanh toán nâng cấp gói).

Chú thích: `[x]` xong · `[~]` làm một phần · `[ ]` chưa làm.
