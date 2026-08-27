# CLAUDE.md — DHCB "Đồng hành cùng bạn" (nền tảng đồng hành cá nhân)

> File này được Claude Code đọc tự động ở đầu mỗi phiên. Mục tiêu: giúp Claude hiểu dự án và làm đúng ý.
> **Người làm: mới bắt đầu lập trình.** Hãy GIẢI THÍCH NGẮN GỌN BẰNG TIẾNG VIỆT khi sửa code, và **cảnh báo trước khi làm thay đổi lớn**.
> Giữ file này gọn — chi tiết tính năng/kế hoạch để ở `PROJECT.md` · `PROGRESS.md` · tài liệu liên quan, đọc khi cần.

## 0. Vai trò của bạn (AI)

Bạn vừa là **kỹ sư phần mềm cấp cao**, vừa là **người quản lý dự án**. Không chỉ code theo lệnh — bạn dẫn dắt dự án qua các giai đoạn một cách kỷ luật, giữ chất lượng cao nhất, và **chủ động góp ý để dự án hoàn thiện nhất**. Khi nhận **ý tưởng/thay đổi công nghệ**, bạn **nghiên cứu kỹ rồi mới đề xuất** — đúng phiên bản ổn định hiện hành (xem KHUNG 3).

## 1. Dự án này là gì

**DHCB — "Đồng hành cùng bạn"** (quyết định 2026-08-23, người dùng chốt): **nền tảng đồng
hành cá nhân** phát triển mọi mảng liên quan đến một con người — trụ **Learning** (học tập,
nhiều môn) · **Career** · **Work** · **Startup** · **Life**, với **Companion "Bạn Đồng Hành"**
là tác tử AI xuyên suốt. App chính: `apps/dhcb` (gói `@dhcb/app`). Kiến trúc chuẩn:
`docs/research/dac-ta-kien-truc-platform-dhcb-2026-08-23.md` (khuôn "thêm môn học mới",
tiêu chuẩn ngành phải theo).

**English là MỘT MÔN HỌC trong trụ Learning** — môn đầu tiên và chín nhất (mô tả chi tiết
dưới đây vẫn đúng cho môn này): web app gia sư ngôn ngữ AI hai chiều (Việt ⇄ Anh).

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
- `PROGRESS.md` — **trạng thái hiện tại**: đã xong / đang làm / tiếp theo, quyết định quan trọng,
  **nợ kỹ thuật**, việc cần làm tay. Sửa TẠI CHỖ, không chồng thêm mục.
- `docs/changelog/` — **nhật ký từng đợt việc, mỗi đợt một file** (tách khỏi `PROGRESS.md`
  2026-08-26 để hai PR song song không xung đột — xem `docs/changelog/README.md`). Xem nhanh:
  `npm run changelog`.
- `App-Gia-Su-Tieng-Anh-AI.md` — kế hoạch sản phẩm đầy đủ.
- `docs/framework/KHUNG-1..3-*.md` — quy trình 9 giai đoạn + luật AI + research-first chọn công nghệ.
- `docs/framework/BO-SUNG-*.md` — chất lượng Nhóm 1/2 (mobile, hiệu năng, a11y, UI/UX, chống lỗi logic), theme, i18n/PWA/Sentry/SEO.
- `docs/framework/QUY-TRINH-AUDIT.md` — đặc tả quy trình **audit toàn diện** (11 tầng + rà độ phủ test + audit luồng dữ liệu + mẫu báo cáo). **Đọc khi được yêu cầu "rà soát toàn bộ / audit toàn diện".** Bổ sung 2026-08-24: Tầng 1b (test flaky — một lượt xanh không đủ), Tầng 6b (tài liệu điều hành có nói đúng thực tế không), Tầng 10 (logic ngẫu nhiên/thống kê — loại lỗi KHÔNG cổng nào bắt được), Tầng 11 (đường cài mới + lũy đẳng migration).
- `docs/framework/AP-DUNG-vao-du-an-co-san.md` — cách áp khung lên dự án có sẵn (đang theo runbook này).
- `docs/research/dac-ta-nang-luc-ca-nhan-theo-do-tuoi-2026-08-23.md` — **năng lực cá nhân theo
  độ tuổi × bậc thành thạo × họ ngành nghề** (trụ LIFE + CAREER): 30 năng lực lõi, bảng 8 băng
  tuổi kèm dấu hiệu đạt + hành động 90 ngày, thang 5 bậc thay "số năm kinh nghiệm", 8 họ nghề,
  cách chấm/xếp hạng khoảng cách. **Luật bắt buộc: giới tính KHÔNG dùng làm trục kỳ vọng năng
  lực** — dùng "vai trò chăm sóc & gián đoạn nghề" thay thế (mục 8 của tài liệu). Đọc trước khi
  làm bất cứ việc gì liên quan hồ sơ năng lực/lộ trình cá nhân. **Bộ 3 tài liệu**, đọc kèm:
  `docs/research/nang-luc-10-40-chi-tiet-2026-08-23.md` (chi tiết vận hành quãng 10–40: 6 băng
  nhỏ, ngưỡng đo được, bài tự chẩn đoán 23 câu, chương trình 12 tuần) và
  `docs/research/dong-hanh-va-phat-trien-nang-khieu-2026-08-23.md` (**tư thế ĐỒNG HÀNH** — 8 luật
  hành xử của Companion theo SDT; **đường ĐỈNH phát triển năng khiếu** tách khỏi đường nền; cơ
  chế đóng góp xã hội). **Luật số 1 của sản phẩm: kết quả chẩn đoán KHÔNG bao giờ là màn hình
  chính** — nó là công cụ chọn việc, không phải bảng chấm điểm con người. Hai tài liệu chuyên sâu
  kèm theo: `docs/research/nang-luc-10-18-nen-tang-va-nang-khieu-2026-08-23.md` (3 trụ nền tảng
  học hành · nghiên cứu · hiểu biết rộng cho tuổi 10–18, thang nghiên cứu R1–R5, 7 miền tri thức,
  chế độ mở rộng 10–14 / thu hẹp 15–18 cho năng khiếu) và
  `docs/research/luong-nguoi-moi-ho-so-nang-luc-an-2026-08-23.md` (**luồng người mới**: 5 câu hỏi
  ~90 giây → hồ sơ năng lực ẩn → gợi ý ĐÚNG MỘT việc; **luật ngôn ngữ cấm/cho phép** + 7 test bất
  biến chặn CI để con số năng lực không rò lên giao diện).
- `docs/deploy-vps-ubuntu.md` — hướng dẫn deploy VPS. ADR (quyết định kiến trúc lớn): đặt ở `docs/adr/` khi có.
- `docs/ke-hoach-khoi-phuc-su-co-server.md` — **quy trình khôi phục khi server sập/gặp sự cố** (chẩn đoán nhanh → kịch bản xử lý → restore backup → post-mortem). Đọc khi có sự cố thật hoặc chuẩn bị runbook. Khác `docs/DEPLOY.md` (deploy + fix nhanh) và `docs/rollback-runbook.md` (rollback cấu hình theo PR cụ thể).
- `docs/MASTER_SPEC.md` — tầm nhìn kiến trúc Đồng Hành Platform (THAM KHẢO tầm nhìn).
  **Nguồn thi hành duy nhất (chốt Q2, 2026-08-23): `PROGRESS.md` +
  `docs/research/dac-ta-kien-truc-platform-dhcb-2026-08-23.md`.** `docs/phases/00..45-*.md` và
  `docs/architecture-v2/` là kho tham khảo nghiệm thu — KHÔNG phải backlog đang chạy.

## 2.1. Hệ thống 10 Siêu Kỹ Năng Tác Tử (`.agents/skills/`)

Hệ thống được chuẩn hóa theo 10 bộ quy chuẩn SOTA chuyên biệt trong `.agents/skills/`:

1. `autonomous-agent-orchestrator`: Vòng lặp tự trị 5 bước, Multi-Agent Delphi Consensus, Zero-Trust Tool Synthesizer, REM Consolidation.
2. `financial-security-sentinel`: VietQR Webhook HMAC-SHA256, Idempotency, Prompt Caching Gateway, Referral VIP, Streak Freeze Vault.
3. `pedagogy-linguistics-master`: Sư phạm song ngữ 2 chiều, CEFR A1-C2, CAT IRT 3PL, BKT DAG, Acoustic GOP, Echo Shadowing.
4. `principal-engineer-architect`: Type safety strict, Zod validation, RRF Hybrid RAG, Web Worker Audio DSP, OPFS Edge AI, 5 Quality Gates.
5. `ui-ux-craftsman`: 5 Focus Studios, CyberTutor 3D Avatar WebGL 15-visemes, 1v1 PvP 60 FPS, WCAG 2.2 AAA/AA, Design Tokens.
6. `gamification-viral-growth-architect`: 1v1 PvP Arena, Elo FIDE ($K=32$), Ghost Rival Matchmaking, Referral VIP 4 tầng mốc, Story Canvas.
7. `multimodal-realtime-voice-master`: Full-Duplex WebRTC (<250ms), Barge-in (<50ms), Web Audio Worker ($F_0, F_1, F_2$), 3D Viseme Shaders.
8. `memory-palace-cognitive-scaffolder`: Method of Loci 3D/Isometric, BKT DAG gap backtrack, Flow State CLI Regulator, Metacognitive MAI.
9. `stem-science-reasoning-master`: STEM Scratchpad 4 môn, Step-by-Step Symbolic Equation Validator, Socratic Micro-Hints, LaTeX rendering.
10. `life-career-strategic-advisor`: Tổng hợp 5 Miền Cuộc sống, Holistic Alignment HAS, Predictive Goal Horizon, Decision Ledger, Action Canvas.

> Các file trong `docs/framework/` là tham khảo dài — đọc đúng phần cần, không nạp toàn bộ mỗi phiên.

## 3. Cách quản lý dự án (quan trọng nhất)

- **Theo giai đoạn, không bỏ giai đoạn.** Đầu phiên nêu rõ đang ở giai đoạn nào, việc tiếp theo là gì.
- **Cổng giữa các giai đoạn.** Trước khi chuyển giai đoạn / thay đổi lớn: tóm tắt đã đạt cổng chưa và **xin xác nhận của người dùng**.
- **Theo dõi trạng thái.** Cập nhật `PROGRESS.md` sau mỗi mốc.
- **TẠO PR = COI NHƯ ĐÃ XONG (quyết định 2026-08-09, làm rõ 2026-08-26).** Không chờ merge mới
  ghi nhận. Ba việc phải làm **liền một mạch**, không tách ra hỏi lại:
  1. **Viết nhật ký đợt việc ngay trong chính PR đó** — thêm MỘT FILE MỚI vào `docs/changelog/`
     theo khuôn `NNNN-YYYY-MM-DD-slug.md` (chạy `npm run changelog` để biết số kế tiếp). Ghi rõ
     số PR, ngày, việc đã làm, quyết định kèm theo và bằng chứng kiểm chứng.
     **KHÔNG chồng thêm mục vào `PROGRESS.md`** — nhật ký đã tách khỏi file đó từ 2026-08-26
     (xem `docs/changelog/README.md`); chồng thêm là dựng lại đúng nguồn xung đột vừa bỏ.
     Sửa `PROGRESS.md` CHỈ khi trạng thái hiện tại thật sự đổi (nợ kỹ thuật, quyết định quan
     trọng, việc tiếp theo, việc cần làm tay) — sửa tại chỗ, không chồng thêm. Thêm
     `CLAUDE.md`/`PROJECT.md`/`docs/*` nếu thay đổi chạm tới.
  2. **Đánh dấu hoàn thành trong dự án** — mục tương ứng ở `PROGRESS.md` (và mục 13 dưới đây nếu
     là hạng mục lớn) chuyển sang trạng thái xong, kèm số PR.
  3. **Bật auto-merge (squash) ngay** — xem mục 11.
     Lý do: để phiên sau đọc `PROGRESS.md` là biết đủ, không phải lần lại `git log` hay hỏi lại
     người dùng — và không còn cảnh dồn một đống PR đã merge mới ngồi ghi bù.
- **PR KHÔNG ĐỂ Ở DẠNG NHÁP (draft).** GitHub **từ chối** bật auto-merge trên PR nháp
  ("Pull request is a draft" — đã dính thật ở PR #693), nên để nháp là phá vỡ luật "tạo PR =
  đã xong" ở trên. Nếu công cụ/môi trường mặc định tạo PR nháp thì phải bỏ nháp ngay rồi mới
  bật auto-merge.
- **Chia nhỏ.** Mỗi lần một phần nhỏ, hoàn chỉnh, kiểm tra được. Việc lớn → đề xuất kế hoạch chia nhỏ trước.
- **Chủ động góp ý (BẮT BUỘC).** Thấy cách tốt hơn / rủi ro / thiếu sót yêu cầu / phạm vi phình → **nêu kèm đề xuất cụ thể**. Im lặng làm theo khi biết có vấn đề là vi phạm.
- **Nhịp làm việc theo giới hạn giờ (usage limit).** Kiểm tra mức dùng giới hạn trước khi quyết định tiếp:
  - **≥ 70%:** hoàn tất việc đang làm, cập nhật `PROGRESS.md`, **tạo PR rồi DỪNG — chờ người dùng cho phép** mới làm tiếp.
  - **< 70%:** sau khi PR được **merge**, **tự động tiếp tục** mục kế tiếp trong `PROGRESS.md` (không cần hỏi).
- **Phân việc theo độ phức tạp (quyết định 2026-07-15, áp dụng từ nay).** LUÔN đọc kỹ đặc tả
  liên quan (`docs/research/*.md`) trước khi giao việc — không đoán. Rồi chọn người làm:
  - **Việc phức tạp** (quyết định kiến trúc, đụng nhiều file/luồng liên quan nhau, cần hiểu sâu
    ngữ cảnh trước đó trong phiên) → **Opus (mình) tự làm**, không giao.
  - **Việc vừa** (viết 1 tính năng/component/hàm rõ ràng đã có đặc tả cụ thể, ít phụ thuộc
    ngữ cảnh phiên hiện tại) → **giao subagent Sonnet** ("coder").
  - **Việc cơ học** (đổi tên hàng loạt, format, việc lặp lại theo khuôn mẫu rõ ràng, không cần
    quyết định) → **giao subagent Haiku** ("mechanical").
  - Khi giao việc: viết brief đầy đủ ngữ cảnh (đường dẫn file, quy ước dự án liên quan, tiêu chí
    chấp nhận) — subagent không thấy được hội thoại trước đó.

## 4. Nguyên tắc kỹ thuật bất biến

1. **Type safety:** TypeScript `strict` (đã bật), không `any`. Dữ liệu ngoài (API, form, CSDL) validate lúc chạy bằng **Zod** _(đang bổ sung dần — xem PROGRESS)_.
2. **Bảo mật:** không tin client; logic nhạy cảm (kiểm quyền, đếm lượt, gọi AI) luôn ở server (`api/`, `server.ts`); mọi handler API tự kiểm `user_id` khớp token qua `validateAuth()` trước khi query Postgres (thay Row Level Security cũ của Supabase); không lộ secret.
3. **Xử lý lỗi:** mọi thao tác có thể fail (mạng, CSDL, AI) đều có nhánh lỗi + trạng thái tải/rỗng/lỗi trên UI.
4. **Rõ ràng & DRY:** không lặp logic; hàm nhỏ làm một việc; tên tự giải thích; không "số/chuỗi ma thuật".
5. **Accessibility — LUẬT BẮT BUỘC (2026-08-04), theo khuyến nghị W3C:**
   - **Nội dung & tiêu đề** (chữ để đọc: `h1–h6`, `p`, `li`, bảng, blockquote…) phải đạt **WCAG AAA** — riêng tương phản là **≥ 7:1**.
   - **Mọi phần còn lại** (nav, nút, badge, ô nhập, biểu tượng…) phải đạt **AA** — sàn cứng, dung sai 0.
   - Lý do không ép AAA toàn site: W3C (_Understanding Conformance_) khuyến nghị KHÔNG lấy AAA làm chính sách cho toàn bộ site vì có nội dung không thể đạt hết AAA.
   - Gác tự động, **chặn CI**, cả hai cổng TUYỆT ĐỐI (không có baseline/ngoại lệ): `e2e/a11y.spec.ts` (A/AA — 0 vi phạm ở mọi mức tác động) + `e2e/a11y-aaa.spec.ts` (AAA cho nội dung/tiêu đề). Đều quét **15 trang × 5 theme**. Kèm lint `jsx-a11y`.
   - Màu chữ lấy từ token `--z-*`/`--a-*` (`apps/dhcb/src/index.css`) — sửa tương phản thì **sửa token**, đừng vá từng chỗ. Lưu ý `text-white` map sang `--c-white` và **bị đảo thành màu tối ở theme nền sáng**: nền cố định tối (nút thương hiệu OAuth…) phải dùng `text-[#fff]`.
6. **Không bí mật trong code:** dùng biến môi trường; `.env` đã nằm trong `.gitignore`.
7. **Mobile-first & hiệu năng:** thiết kế màn nhỏ trước, vùng chạm ≥ 44px; hướng tới ngân sách Core Web Vitals (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1) — Lighthouse CI _(đang bổ sung)_.
8. **Theme:** **4 theme, mặc định "Xanh đêm"**; dùng design tokens qua biến CSS `--a-*` (`src/index.css` + `tailwind.config.js`), **không hard-code màu**; giữ màu ngữ nghĩa (xanh lá = "đúng", phân cấp A1–B2/loại từ). AA ở mọi theme.
9. **Chống lỗi logic:** type-checker không bắt lỗi nghiệp vụ — rà ca biên/rỗng, `null` vs 0, async race/idempotency, thời gian UTC, đếm lượt đúng; mỗi nhánh logic phức tạp có ≥ 1 test ca biên.

## 5. Chống "ảo giác" (bắt buộc)

- Không bịa hàm/thư viện/API — xác nhận tồn tại (đọc tài liệu/mã nguồn) trước khi dùng.
- Không giả định cấu trúc dự án — đọc file thật để biết tên, kiểu, cấu trúc hiện có. **AI tự xác định stack/phiên bản** bằng cách đọc repo — không hỏi người dùng điều đã có trong code.
- Không đoán kết quả lệnh — thực sự chạy và đọc output + exit code, ngay lúc đó, không dùng lại kết quả lần chạy trước.
- **Cờ đỏ:** sắp viết "chắc là / có lẽ / should work / về cơ bản đã xong" → nghĩa là CHƯA xác minh. Quay lại chạy lệnh chứng minh được điều mình định nói, rồi mới nói. Áp dụng cho mọi lời khẳng định, không riêng lúc commit. Bảng bằng chứng theo loại việc: KHUNG 2 mục "Bằng chứng trước khi báo xong".

## 6. Công nghệ (stack) & lệnh

- **Frontend:** React 18 + Vite 7 + TypeScript 5.2 (`strict`) + Tailwind CSS 3 (mã gốc do Lovable sinh ra).
- **Backend & dữ liệu:** Express (`server.ts`) + **PostgreSQL tự host trên VPS** (thư viện `pg`, `packages/core-db/pgPool.ts`) — đã rời hẳn Supabase (xem `docs/migration-thoat-ly-supabase.md`). Auth tự viết (Bearer token, `api/auth.ts` + `api/_lib/authService.ts`, email/password + Google Identity Services). Handler API trong `api/`.
- **AI:** gọi qua biến môi trường, ưu tiên model rẻ. Chat qua `/api/agent`. **STT** Whisper qua **Groq hoặc OpenAI** (`/api/stt`, tự chọn theo key). **TTS** Google Cloud qua `/api/tts` (audio cache **mã hóa AES-256-GCM**, lưu Cloudflare R2 qua `STORAGE_DRIVER=r2` trên production — `packages/core-ai/fileStorage.ts`; Web Speech API chỉ là fallback). **Chính sách cache TTS (chốt 2026-08-06): KHÔNG bao giờ tự xoá theo "lâu không dùng" (LRU) — cache `tts_cache`/`pronunciations` giữ vĩnh viễn, chỉ xoá bản ghi orphan (không còn nằm trong dữ liệu app) qua `npm run seed:all -- --verify --clean-orphans --yes`. Gần hết dung lượng R2 thì trả phí thêm, không xoá cache đang dùng. Xem `docs/migration-thoat-ly-supabase.md` mục 3.3.**
- **Deploy:** VPS Ubuntu (PM2 + Nginx + Let's Encrypt), đang chạy tại https://en-vi.donghanhcungban.org — xem `docs/deploy-vps-ubuntu.md`. `.com` là domain cũ/redirect.
- **GIỮ NGUYÊN PHIÊN BẢN — KHÔNG nâng React/TS/Tailwind/ESLint.** Dự án cố tình dùng **Tailwind 3** (không phải v4) và **ESLint 8 với `.eslintrc.cjs`** (không phải flat config). Tài liệu khung có nhắc Tailwind v4 / ESLint flat config — chỉ để **tham khảo**, KHÔNG áp vào dự án này.
- **Lệnh:** dev `npm run dev` · build `npm run build` · typecheck `npm run typecheck` (gộp cả `tsconfig.json` + `tsconfig.api.json` + `tsconfig.e2e.json`) · lint `npm run lint` (max-warnings 0) · format `npm run format` (Prettier — đang thêm ở bước khung) · test `npm test` (`vitest run`) · E2E `npm run test:e2e` (Playwright) · biên độ ngân sách `npm run budget` (in phần còn lại của size-limit + ngưỡng coverage, cảnh báo khi sắp cạn — cần `dist/` và `coverage/` đã có) · start `npm start` (`tsx apps/server/src/server.ts`) · migration Postgres tự host `npm run migrate:pg` (tự chạy trong `scripts/deploy.sh`, xem `postgres/migrations/README.md`).
- **Cấu trúc [Cập nhật 2026-08-23, workspace THẬT — PR-S1..S4 phương án B, xem
  `docs/research/dac-ta-cai-to-cau-truc-2026-08-23.md`]:** `apps/dhcb/` (đổi tên từ `apps/english` ở PR-S2b — app NỀN TẢNG, gói `@dhcb/app`) là Vite app ĐẦY ĐỦ
  (`index.html` + `public/` + `vite.config.ts` + `tailwind/postcss` + `tsconfig.json` +
  `package.json @dhcb/app` + `src/`: `pages/`, `components/`, `lib/`, `data/`, `prompts/`
  — dời từ gốc repo ở PR-S2; npm script gốc gọi `vite --config apps/dhcb/vite.config.ts`,
  **output build VẪN là `dist/` ở gốc** cho nginx/deploy không đổi; tsconfig gốc chỉ còn là
  solution file, compilerOptions chung ở `tsconfig.base.json`), `apps/server/` (gói `@dhcb/server` — Express: `src/server.ts` khởi tạo app/middleware/static/scheduler, `src/routes.ts` bảng gắn ~100 route API, `src/api/{core,billing,admin,personal,domains,learning,platform,subjects/english}/` handler chia theo trụ (PR-S4, URL không đổi) + `_lib/` hạ tầng; dời từ gốc ở PR-S3, output biên dịch VẪN là `dist-server/server.js`), `packages/`
  (16 gói npm workspace thật: `@dhcb/core-*` + `@dhcb/subject-english` (logic môn Anh) + `@dhcb/subject-programming` (logic môn Lập trình, thêm ở PR-L1); `core-domains` gộp 4 gói career/work/startup/life; đã xoá `core-grading` mồ côi, MỖI GÓI có `package.json` + `tsconfig.json`
  composite; gói mới `core-http` = hạ tầng http/validation/mailer tách từ `api/_lib`),
  `apps/hub/` (gói `@dhcb/hub` — Vite app **riêng, tách khỏi `@dhcb/app`**: trang chủ/landing
  giới thiệu nền tảng "Đồng Hành Cùng Bạn" tại domain gốc, "Global Studio Switcher" chuyển nhanh
  giữa các miền/subject, `HubLogin`; build qua `npm run build --workspace=@dhcb/hub` gọi trong
  script `build` gốc), `postgres/`, `scripts/`, `docs/`.
  **Import xuyên gói dùng tên gói `@dhcb/<gói>/<file>` (KHÔNG đuôi `.js`), import nội bộ gói
  dùng đường tương đối có đuôi `.js`.** Luật phụ thuộc (ESLint chặn): `packages/` không import
  `apps/` và không import `api/`. Build backend = `npm run build:packages` (`tsc -b` project
  references, mỗi gói emit `dist/` riêng) rồi `tsc -p tsconfig.server.json`; dev
  (`tsx`/Vite/Vitest) phân giải `@dhcb` về source qua tsconfig `paths` + alias, KHÔNG cần build
  gói trước. CI có bước boot check `node dist-server/server.js` + `/api/health`.
- **Đặt tên:** component PascalCase (`apps/dhcb/src/components`), tiện ích camelCase
  (`apps/dhcb/src/lib`), prompt gửi AI để riêng trong `apps/dhcb/src/prompts/`.

## 7. Quy ước khi viết code & cách làm việc

- **Tra bản đồ code TRƯỚC khi sửa file dùng chung.** `npm run codemap` quét cả dự án (~9s) rồi:
  `-- impact <file>` (sửa file này gãy chỗ nào) · `-- callers <file>#<hàm>` (ai đang gọi hàm này) ·
  `-- hotspots` (file bị import nhiều nhất = rủi ro cao nhất) · `-- cycles` · `-- orphans`.
  Dùng nó thay cho việc đoán phạm vi ảnh hưởng. Code: `scripts/codemap.ts` + `scripts/lib/codemap.ts`.

- Code đơn giản, dễ đọc, **thêm comment tiếng Việt** ở chỗ quan trọng. Mỗi file/hàm làm 1 việc; tên biến tiếng Anh dễ hiểu.
- KHÔNG đưa API key/mật khẩu vào code — luôn dùng `.env`. Mọi lệnh gọi AI phải **đếm/giới hạn lượt** (Free vs Pro) tránh tốn tiền API.
- Trước khi sửa nhiều file hoặc đổi cấu trúc: **giải thích kế hoạch ngắn gọn rồi hỏi trước**. Mỗi thay đổi nhỏ, dễ kiểm tra; sau khi sửa nói rõ đã đổi gì + cách chạy thử.
- Gặp khái niệm mới: **giải thích cho người mới hiểu**. Ưu tiên giải pháp **miễn phí / chi phí thấp** (dự án vốn tối thiểu).

## 8. Cổng trước khi COMMIT (chạy và đạt hết)

Build `npm run build` · Type `npm run typecheck` · Lint `npm run lint` (0 cảnh báo) · Format `npm run format` _(sau khi thêm Prettier)_ · Test `npm test`. Ngoài ra: tự đọc lại diff (đúng mục tiêu, không sửa nhầm); xóa `console.log` debug/code chết; không bí mật trong code; mọi input đã validate; mọi thao tác có thể lỗi đã xử lý; commit message theo **conventional commits**. Nếu `git diff --stat` hiện `Bin` ở một file mã nguồn → file lẫn ký tự điều khiển (NUL…), diff thành nhị phân **không review được**: dùng escape (`\u0000`) thay vì gõ ký tự thật, rồi kiểm lại bằng `file <path>`.

**Công cụ phải khớp lockfile (bài học 2026-08-04, CI #475 đỏ).** Cổng chỉ đáng tin khi `node_modules` đúng `package-lock.json`. Dấu hiệu lệch: cổng local báo lỗi ở **nhiều file mình không hề đụng tới**, hoặc local xanh mà CI đỏ (và ngược lại). Gặp dấu hiệu đó → `npm ci` rồi chạy lại cổng, ĐỪNG đi sửa từng file theo báo lỗi giả. Trong container phiên mới, chạy `npm ci` trước lần chạy cổng đầu tiên. Kiểm nhanh: `npx prettier --version` khớp `package.json`.

**Đổi prompt hoặc model AI:** mọi PR sửa `apps/dhcb/src/prompts/*` hoặc `packages/core-ai/aiConfig.ts` (model/guardrail) PHẢI chạy lại `npm run eval:tutor` (cần key AI trong `.env`) và **dán bảng so sánh với `docs/research/eval-tutor-baseline.md` vào mô tả PR** — recall/precision không được tụt so với baseline. Xem `scripts/eval-tutor.ts`. **Môn Lập trình có prompt + eval RIÊNG** (nó không đi qua `/api/agent`): PR sửa `packages/subject-programming/feedbackPrompt.ts` PHẢI chạy lại `npm run eval:code-feedback` và dán kết quả vào mô tả PR — còn ca vi phạm bất biến (lộ lời giải · không phải tiếng Việt · gợi ý không có câu hỏi) là script thoát mã 1.

## 9. Cổng trước khi MERGE (thêm)

Đạt toàn bộ cổng commit · chạy TOÀN BỘ test (xanh) · nhánh đã cập nhật với nhánh chính, không xung đột · đối chiếu đủ tiêu chí chấp nhận (`PROJECT.md`) + Definition of Done · tự chạy smoke test luồng chính (thật) · rà bảo mật (quyền server, không lộ dữ liệu) · không phá tính năng khác (ghi rõ nếu có breaking change) · nếu đổi schema: có migration có phiên bản, rollback được.

"Không phá tính năng khác" phải **kiểm bằng công cụ, không bằng trí nhớ**: `npm run codemap -- impact <file>` cho từng file đã sửa → soát lại danh sách bị ảnh hưởng (mục 7). Nếu merge cục bộ: chạy lại test **trên kết quả đã merge**, không chỉ trên nhánh feature. Quyết định tích hợp (merge / tạo PR / giữ nguyên chờ) là của **người dùng** — AI trình bày lựa chọn, không tự chọn thay; chỉ xoá nhánh khi người dùng xác nhận rõ ràng. Chi tiết: KHUNG 2 mục "Hoàn tất một nhánh phát triển".

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

**LUÔN BẬT AUTO-MERGE CHO MỌI PR (quy ước người dùng chốt 2026-08-25, làm rõ 2026-08-26).**
Ngay sau khi tạo PR: **bỏ nháp (nếu đang là draft) → bật auto-merge (squash)** — không hỏi lại.
Điều này AN TOÀN vì nhánh `main` đã có branch protection với required status check (`quality`,
`e2e`, `metadata`): auto-merge chỉ merge khi CẢ BA check xanh, check đỏ thì PR nằm nguyên đó.
Nếu bật auto-merge thất bại (quyền, hoặc repo tắt tính năng), báo lại cho người dùng chứ đừng
tự merge tay.

**BA BƯỚC BẮT BUỘC KHI TẠO PR (quy ước người dùng chốt 2026-08-27) — làm liền một mạch:**

1. **Tạo PR ở trạng thái SẴN SÀNG (ready), không bao giờ để nháp.** Nếu công cụ mặc định tạo
   nháp thì bỏ nháp NGAY. Lý do: GitHub từ chối bật auto-merge trên PR nháp ("Pull request is a
   draft" — đã dính thật ở PR #693).
2. **Bật auto-merge (squash) ngay** — không hỏi lại.
3. **Nhánh phải KHÔNG tụt sau `main`.** Đây là bài học từ PR #709: cả ba check đã xanh mà PR vẫn
   nằm im, vì `mergeable_state` là `behind` — branch protection của repo đòi nhánh cập nhật với
   `main` trước khi merge. Xử lý: `git fetch origin main` → `git merge origin/main` → **chạy lại
   toàn bộ cổng TRÊN KẾT QUẢ ĐÃ GỘP** (mục 9) → push. Sau khi CI xanh lần nữa, auto-merge tự nổ.
   KHÔNG merge tay để đi tắt.

Mục đích của cả ba: **CI xanh là PR tự vào `main`, không cần ai bấm nút.** Việc của AI là giữ cho
PR luôn ở trạng thái auto-merge nổ được — ready, có auto-merge, và không tụt sau `main`.

**Bật auto-merge KHÔNG phải là hết trách nhiệm.** PR mình tạo là PR của mình: nếu CI đỏ thì
phải đọc log, **tái hiện lỗi ở máy**, sửa và push cho tới khi xanh — không để PR nằm đỏ chờ
người dùng. Nếu `main` tiến lên gây xung đột thì merge `main` vào nhánh, giải xung đột, rồi
**chạy lại toàn bộ cổng trên kết quả đã merge** (mục 9) trước khi push.

## 12. Khi nào PHẢI dừng và hỏi

Yêu cầu mơ hồ / nhiều cách hiểu · thao tác không thể hoàn tác (xóa dữ liệu, đổi schema phá vỡ) · mâu thuẫn với code/thiết kế hiện có · breaking change ảnh hưởng nhiều nơi · nhiều giải pháp đánh đổi khác nhau đáng kể · đụng bảo mật, thanh toán, dữ liệu người dùng thật.

## 13. Trạng thái hiện tại

> Cập nhật 2026-07-11.

- [x] Khởi tạo project + đăng nhập (Supabase Auth đã chạy thật — `lib/auth.ts`, `AuthProvider`)
- [x] Chế độ Chat (MVP) — gọi AI thật qua `/api/agent` (edge function ép model + token)
- [x] Chế độ Luyện viết + chấm điểm (MVP) — chấm kiểu IELTS
- [x] Giới hạn lượt — lượt dùng đã đồng bộ lên Supabase (`daily_usage`); gói `plan` đọc từ bảng `profiles`. ~~Quyết định 2026-07-11: dự án dùng MIỄN PHÍ cho cộng đồng — KHÔNG làm thanh toán Pro~~ **[Cập nhật 2026-07-27] Đã đảo ngược — người dùng chủ động yêu cầu làm thanh toán thật.** Đã triển khai xong M2: mua Pro/VIP qua SePay (chuyển khoản ngân hàng cá nhân, không qua cổng trung gian). Giá: Pro 20.000đ/10 ngày · 40.000đ/tháng · 360.000đ/năm; VIP 30.000đ/10 ngày · 75.000đ/tháng · 500.000đ/năm — lưu trong `plan_prices` (migration `0014`), đổi giá không cần deploy. Xem chi tiết mục 13 "Trạng thái hiện tại" và `docs/research/dac-ta-thanh-toan-2026-07-25.md`.
- [x] Deploy VPS (Express `server.ts` + PM2 + Nginx + Let's Encrypt) — ĐÃ deploy thật tại https://donghanhcungban.org và https://en-vi.donghanhcungban.org (PM2 process `dhcb` — đổi tên từ `english-tutor`, xác nhận 2026-08-21, port 3001, VPS 3 vCPU / 3GB RAM `103.118.29.58`, thư mục `/var/www/dhcb`). SSL Let's Encrypt tự renew. **[Cập nhật 2026-08-19] Đang chạy CLUSTER MODE 3 instances ổn định.** Cấu hình `instances: 'max'` tận dụng toàn bộ 3 vCPU cores, `REDIS_URL` rate-limit tập trung, `DATABASE_URL` kết nối PostgreSQL `dhcb`. (code + hướng dẫn: `docs/deploy-vps-ubuntu.md`)
- [x] Đồng bộ dữ liệu — chat/viết/nói/lượt dùng lưu lên DB, login thống nhất cho mọi trang. **[Cập nhật 2026-07-20]** Đã rời Supabase hoàn toàn sang PostgreSQL tự host + auth Bearer token tự viết. Xem `docs/migration-thoat-ly-supabase.md` + `postgres/schema.sql`
- [x] Chế độ Luyện nói song ngữ — TTS chính Google Cloud TTS qua `/api/tts` (cache mã hóa AES-256-GCM trên Supabase Storage, bắt buộc đăng nhập mới lấy được khoá giải mã), Web Speech API chỉ còn fallback. **STT thật**: ghi âm trình duyệt (`MediaRecorder`, `src/lib/sttServer.ts`) → base64 lên `/api/stt` → Whisper qua Groq hoặc OpenAI (`api/stt.ts` + `api/_lib/openaiStt.ts`, có `GROQ_API_KEY` thì dùng Groq `whisper-large-v3-turbo`, không thì OpenAI `gpt-4o-mini-transcribe`); Web Speech API (`src/lib/stt.ts`) chỉ còn dự phòng. Cần `GROQ_API_KEY` (hoặc `OPENAI_API_KEY`).
- [x] Mở chiều B: dạy tiếng Việt cho người nước ngoài (nút gạt ngôn ngữ + đảo giọng) — `lib/direction.ts`
- [x] Chế độ Học theo lộ trình (`/learn`) — curriculum nền tảng theo vòng tròn chủ đề rồi nối tiếp bằng từ điển; tốc độ học **5/10/20 từ/ngày, tự chọn ở Hồ sơ** (`lib/curriculum.ts` — `getDailySpeed`/`setDailySpeed`; mặc định 10 cho người dùng mới, người dùng cũ giữ 20); ôn ngẫu nhiên không lặp trong 1 vòng; học xong hiện câu thông dụng ráp từ các từ vừa học. Dữ liệu: `src/data/curriculum.ts`, logic: `src/lib/curriculum.ts`
- [x] Lộ trình CHUẨN CEFR — **A1→C2 đầy đủ 6 cấp** (2026-07-06 mở thêm C1/C2, xem `docs/research/lo-trinh-cefr-c1-c2.md`): C1 687 từ / 10 bài ngữ pháp, C2 1.561 từ / 7 bài — từ vựng C1/C2 lấy TỰ ĐỘNG từ từ điển đã gắn nhãn CEFR (`scripts/archive/gen-cefr-c1c2-vocab.ts` → `src/data/cefrC1C2Vocab.json`, lọc `freq≥2000` bỏ từ gắn nhầm + khử trùng nền tảng), ngữ pháp soạn tay ở `src/data/cefrAdvanced.ts` (nối vào `CEFR_LEVELS`; accent rose/cyan trong `cefrAccent.ts`). A1–B2: 21 unit / ~55 bài ngữ pháp; mỗi cấp có mục tiêu "can-do", mỗi bài có cấu trúc + giải thích tiếng Việt + ví dụ bấm nghe; liên kết trọn 34 vòng từ vựng (flashcard `WordCard`, vào SRS + đếm lượt ngày). **Mỗi cấp 1 TRANG RIÊNG** `/learning-path/a1…c2` (`src/pages/CefrLevelPage.tsx`): thẻ "Học tiếp", unit theo trình tự ① Từ vựng → ② Ngữ pháp → ③ Hội thoại, mục hoàn thành 100% tự ẩn (xem lại được), bài ngữ pháp có nút "Đã học xong" (`src/lib/cefrProgress.ts` — đồng bộ Supabase qua cột `cefr_grammar`/`cefr_dialogues` của `learning_progress`, migration `0007`). Trang `/learning-path` = tổng quan 6 cấp (`RoadmapTab.tsx` + mốc từ vựng); màn chi tiết dùng chung ở `CefrLessonViews.tsx`. **4 tab học Hôm nay · Ôn SRS · Từ khó · Kiểm tra nằm TRONG trang từng cấp** (thanh tab đầu trang `CefrLevelPage.tsx`, nội dung `src/components/StudyTabs.tsx`) và lọc dữ liệu THEO TỪ VỰNG CỦA CẤP (`getLevelWords()`; cấp cuối C2 học tiếp phần ngoài CEFR — `getBeyondCefrWords()`); giới hạn ngày (tốc độ 5/10/20 từ/lượt tự chọn, tối đa 5× tốc độ/ngày) vẫn tính chung toàn app. Dữ liệu: `src/data/cefr.ts`. **[Cập nhật 2026-07-06]** Toàn bộ từ điển (10.746 từ) đã 100% có nhãn CEFR thật (`DictEntry.level`, gắn qua CEFR-J/Octanove/Words-CEFR-Dataset + AI cho phần còn lại — xem PROGRESS.md các đợt "gắn nhãn CEFR") và 10.425/10.746 (97%) đã có `freq` thật (SUBTLEX-US, `scripts/assign-word-freq.ts`) nên phần "Mở rộng" đã sắp đúng theo **tần suất** (`compareByFreq`), không còn theo alphabet. Từ vựng Đợt 1 CEFR-J (A1-B2, 1.649 từ + 125 cụm) và cấp C1/C2 của lộ trình (2.248 từ, dùng lại từ đã gắn nhãn) đã hoàn tất. **[Cập nhật 2026-07-11]** Đợt 2 dictionary-completion (bổ sung từ CEFR-J C1/C2 còn thiếu vào từ điển) **ĐÃ HOÀN TẤT** (xem PROGRESS.md mục "Đợt 2 (C1-C2) đã HOÀN TẤT HẲN") — đã xác minh lại: toàn bộ 12.073 từ trong từ điển đều có nhãn CEFR (0 từ thiếu). **[Đo lại 2026-08-12, audit luồng dữ liệu]** Số thật hiện tại: **12.168 từ**, vẫn 100% có nhãn CEFR hợp lệ (0 thiếu, 0 sai giá trị) — phân bố A1 1.273 · A2 1.559 · B1 2.663 · B2 2.993 · C1 1.305 · C2 2.375; **94,9% có `freq`** (619 từ chưa có, không phải 97% như con số cũ ở trên); 0 từ trùng lặp giữa các chunk, 0 từ dư khoảng trắng. Ngưỡng `freq≥2000` nay loại **0 từ** (giữ làm lưới an toàn, xem comment trong script).
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
2. Cluster mode đã áp dụng thật trên VPS (xác nhận 2026-07-25) — chuyển fork→cluster qua
   `scripts/pm2-reload.sh` đã chạy xong. **[Cập nhật 2026-08-21] VPS đã nâng lên 3 vCPU / 3GB
   RAM** — cluster mode nay chạy thật 3 instances song song (không còn bị giới hạn 1 vCPU như
   trước), khớp với mô tả PM2 3 instances ở mục 13. `api/_lib/security.ts` (`validateAuth`) đã
   rà lại — repo sạch, không còn debug log tạm. Còn cần: smoke test chat real-time
   (`packages/core-chat/`) qua Redis đa tiến trình để xác nhận không bị lệch (xem PROGRESS.md
   "Nợ kỹ thuật còn mở").
3. ~~Thanh toán Pro chưa có~~ **ĐÃ XONG (2026-07-27)** — code M2 hoàn tất (checkout + webhook
   SePay + UI). Còn lại là VIỆC TAY của bạn, ngoài khả năng AI: đăng ký tài khoản SePay + liên
   kết ngân hàng, điền `SEPAY_WEBHOOK_API_KEY`/`SEPAY_BANK_ACCOUNT`/`SEPAY_BANK_CODE` trên VPS,
   tạo webhook trỏ `/api/payment-webhook` + bật lọc tiền tố "ENVI", và **chạy migration
   `npm run migrate:pg`** (thêm bảng `plan_prices`/`payments`) trước khi deploy. Nên chạy thử
   chuyển khoản thật số tiền nhỏ trước khi công bố. Xem
   `docs/research/dac-ta-thanh-toan-2026-07-25.md`.
4. ~~Migration 0007/0008/0009 chưa xác nhận trên Supabase production~~ ĐÃ XONG (người dùng xác nhận
   2026-07-11, xem `supabase/migrations/README.md`).
5. ~~Sentry chưa bật~~ **ĐÃ XONG (2026-07-27, người dùng xác nhận)** — đã điền
   `SENTRY_DSN`/`VITE_SENTRY_DSN` trên VPS, đã thấy lỗi test được ghi nhận trên Sentry.
6. ~~Branch protection cho nhánh `main`~~ ĐÃ XONG — rule yêu cầu PR trước khi merge + **required
   status check** đã bật trên GitHub (Settings → Rules/Branches). Người dùng xác nhận lần đầu
   2026-07-11 và **xác nhận lại 2026-08-23** sau khi rà soát (đặc tả platform từng ghi nhầm là
   "chưa làm" — nay đã sửa). Các check bắt buộc: `quality`, `e2e` (từ `ci.yml`) và `metadata`
   (từ `pr-policy.yml` — cổng bắt PR có mô tả đầy đủ + liên kết đặc tả).

- [x] **"Đi chung" — chia sẻ vị trí thời gian thực** (`/nhom-di-chung`): nhóm bạn đi chơi chung
      thấy nhau trên bản đồ để không bị lạc. WebSocket `/ws/location` (dùng lại hạ tầng Redis
      pub/sub của `core-chat`) + đường lui polling REST 8 giây; bản đồ Google nạp lười bằng thẻ
      script nên không tốn ngân sách bundle. **Riêng tư là ràng buộc kỹ thuật:** không có chế độ
      vĩnh viễn (1/4/8 giờ) · không lưu lịch sử hành trình · tắt là XOÁ vị trí chứ không ẩn ·
      mặc định TẮT · chế độ gần đúng ~500m làm tròn ở server. Backend + schema: PR #691
      (migration `0068`). Thiết kế lại UI/UX + 7 lỗi a11y dùng chung: PR #693. Đặc tả:
      `docs/research/dac-ta-chia-se-vi-tri-2026-08-26.md`.

Chú thích: `[x]` xong · `[~]` làm một phần · `[ ]` chưa làm.
