# PROGRESS.md — Trạng thái dự án

> AI đọc file này để biết đang ở đâu. Chi tiết tính năng: `PROJECT.md`. Lịch sử đầy đủ từng PR:
> `git log`/PR đã merge trên GitHub — file này chỉ giữ **tóm tắt** + việc còn mở + quyết định lớn.
>
> **Nhịp làm việc theo giới hạn giờ (CLAUDE.md mục 3):** ≥ 70% usage → hoàn tất việc đang làm, tạo
> PR rồi DỪNG chờ duyệt. < 70% → sau khi PR merge, tự động tiếp tục mục kế tiếp.

## Giai đoạn hiện tại

GĐ 4–5 (Phát triển + nâng chất lượng). Sản phẩm đã deploy thật
(https://en-vi.donghanhcungban.com). Đã áp xong Lớp 1 (hàng rào: Prettier/ESLint/TS
strict/husky/CI) và Lớp 2 (E2E Playwright + a11y AA toàn site + coverage ratchet + bundle-size
budget) của `docs/framework/AP-DUNG-vao-du-an-co-san.md`. Không có việc code nào đang mở; còn
vài thao tác THỦ CÔNG trên VPS/Supabase (xem "Cần làm tay").

## Đã xong — tóm tắt theo mảng

**Lõi sản phẩm (MVP → v2):** đăng nhập Supabase Auth · 3 chế độ Chat/Viết/Nói song ngữ (STT
Groq-OpenAI + TTS Google Cloud 2 giọng, cache mã hoá AES-256-GCM) · đếm lượt/ngày atomic
(RPC `consume_usage`/`refund_usage`) tách riêng theo mode (chat/writing/speaking/stt) · mở
chiều B (dạy Việt qua Anh) · deploy VPS (PM2 + Nginx + Let's Encrypt) sau Cloudflare · nút
"Kết thúc & chấm điểm" cuối phiên Chat/Speaking · trang cá nhân `/profile`.

**Lộ trình học:** vòng từ vựng nền tảng theo chủ đề, tốc độ 5/10/20 từ/ngày tự chọn · lộ trình
chuẩn CEFR **A1→C2 đầy đủ 6 cấp** (mỗi cấp 1 trang riêng, thứ tự Từ vựng→Ngữ pháp→Hội thoại,
4 tab Hôm nay/Ôn SRS/Từ khó/Kiểm tra lọc theo cấp) · bài thi cuối cấp chặn lên cấp (≥70%) ·
SRS toàn cục (cap phiên, leech, vé nghỉ streak) · xen kẽ từ vựng↔ngữ pháp · quiz ngữ pháp ·
Sổ lỗi cá nhân (Mistake Bank, `/mistakes`) · gamification (flashcard lật 3D, màn ăn mừng
streak/confetti, vòng cung phiên học nối lộ trình↔Chat/Speaking qua `targetWords`).

**Từ điển & dữ liệu:** 12.073 mục, **100% đã gắn nhãn CEFR** (A1-C2, qua CEFR-J/Octanove/
Words-CEFR-Dataset + AI cho phần còn thiếu) · dạng biến thể từ (`WordForms`, 8.740 từ, 200 bất
quy tắc) kèm ví dụ song ngữ cho ~391 ô bất quy tắc · tần suất từ thật (SUBTLEX-US, 9.540/10.006
từ) dùng để sắp "Mở rộng" theo độ thông dụng thay vì alphabet.

**Hạ tầng/chất lượng:** CI gate (lint/typecheck/test/build/format/E2E) trên mọi PR · coverage
ratchet + bundle-size budget (`size-limit`, thay Lighthouse CI) · a11y AA toàn site qua axe
(kể cả màn kết quả AI, 4 theme) — **đã đóng nợ a11y** · Zod validate input toàn bộ `api/*.ts` ·
Sentry error tracking (code xong, no-op tới khi có DSN) · auto-run migration Supabase khi
deploy (`deploy.sh` → `npm run migrate`, cần `SUPABASE_DB_URL`) · audit bảo mật/logic nhiều đợt
(RLS theo cột chặn tự nâng Pro/bypass lượt, timeout fetch, refund lượt khi provider lỗi, ranh
giới ngày theo giờ VN — chi tiết `AUDIT.md`).

**Tính năng mới (chưa mở cho người dùng thật):** Thử thách "Challenge 1 phút/ngày" 30 ngày
(`/challenge`) — code xong, migration `0010_challenge_entries.sql` **chưa chạy trên production**.

**i18n/UX:** song ngữ toàn site kể cả `/login` · bottom-nav mobile (Trang chủ/Lộ trình/Luyện
tập/Tiến độ) · thẻ "Học tiếp" ở Home · karaoke (sáng chữ theo giọng đọc) áp dụng mọi TTS >1 từ ·
chuẩn hoá vị trí nút loa/micro + vùng chạm ≥44px.

## Tiếp theo

> Mỗi mục 1 PR, dừng xin duyệt ở mỗi cổng (CLAUDE.md mục 3).

- **Nâng cấp 5 hạng mục sư phạm còn thua app lớn** — ĐẶC TẢ ĐÃ VIẾT + người dùng ĐÃ CHỐT cả 4
  quyết định (2026-07-15: theo thứ tự ưu tiên · LÀM Azure · LÀM giải đấu tuần M5 · THAY Challenge
  bằng giải đấu tuần M5b) → theo bảng ưu tiên 17 PR mà làm:
  `docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md` (① chấm phát âm 2 giai đoạn · ② động
  lực duy trì (kể cả giải đấu tuần) · ③ nghe đa dạng · ④ placement test · ⑤ eval độ tin cậy AI).
  Tài liệu này KẾ THỪA các đề xuất D/H và V-4/V-5 bên dưới — khi làm theo nó thì đánh dấu mục
  trùng ở dưới. **Đã xong:** PR #1 (`lib/placement.ts` thuật toán bậc thang), PR #2 (trang
  `/placement` + nối onboarding) — PR #239, đã merge 2026-07-15. PR #3 (tốc độ phát TTS, ③ N1)
  — `RateToggle` toàn cục + `getRatePref`/`setRatePref` (`lib/tts.ts`) + `preservesPitch` +
  nối vào CefrLessonViews/Lessons/KaraokeText/Speaking/CommonPhrases/Dictionary — PR #240, đã
  merge 2026-07-15. PR #4 (xoay giọng nghe, ③ N2) — random giọng câu Nghe bài thi/placement
  (`ExamQuestion.audioVoice`) + `WordVoiceCycleButton` ở flashcard (xoay 4 giọng); hội thoại
  CEFR đã tự khác giọng theo vai A/B từ trước, không cần sửa — PR #241, đã merge 2026-07-15.
  PR #5 (golden set + eval baseline, ⑤ T1) — `scripts/eval-tutor-fixtures.json` (~60 câu),
  `scripts/eval-tutor.ts` (`npm run eval:tutor`, gọi đúng prompt+model+guardrail production qua
  `api/_lib/aiConfig.ts` mới tách), logic chấm thuần `scripts/lib/evalScoring.ts` + test (vào CI),
  luật eval khi đổi prompt/model ghi ở CLAUDE.md §8 — code xong, chờ merge. ⚠️ Số baseline
  (`docs/research/eval-tutor-baseline.md`) CẦN NGƯỜI CÓ KEY chạy `npm run eval:tutor -- --write-baseline`
  (sandbox Claude không có key AI). **Tiếp theo:** PR #6 (trap phát âm Việt + coach tip, ① G1).
- **Quy tắc phân việc theo độ phức tạp** (CLAUDE.md mục 3, quyết định 2026-07-15): đọc đặc tả
  trước khi giao việc; việc phức tạp Opus tự làm, việc vừa giao subagent Sonnet, việc cơ học
  giao subagent Haiku — áp dụng cho mọi PR tiếp theo của mục trên.
- **Cải tiến sư phạm** (`docs/research/danh-gia-tien-trien-hoc-2026-07-07.md`, đề xuất A→H):
  A (Sổ lỗi cá nhân) đã xong. Còn B (nối lộ trình↔3 chế độ AI — nút "Luyện từ hôm nay bằng hội
  thoại", đã có `targetWords?` nhưng chưa có nút CTA riêng) → C/D/E/F/G/H (sản xuất chủ động,
  nghe hiểu, ôn ngữ pháp, giữ chân — xem tài liệu).
- **Bổ sung dạng biến thể từ điển** (`docs/research/bo-sung-dang-bien-the-tu-dien.md`): Bước 2
  (vá ~40-60 dạng bất quy tắc còn thiếu + gắn `base` để hiện "Xem từ gốc") và Bước 4 (search
  hiểu biến thể: "books"/"went" → trả về từ gốc) chưa làm.
- Gamification: V-4 (mốc + huy hiệu), V-5 (Home "Hôm nay"), V-6 (âm UI) chưa làm — xem lịch sử
  PR gamification gần nhất.
- Thanh toán Pro — **đóng, không làm** (xem "Quyết định quan trọng").

## ⚠️ Cần làm tay (không cần PR)

- Migration `0010_challenge_entries.sql` — chạy khi có `SUPABASE_DB_URL` trong `.env` VPS rồi
  `bash deploy.sh` (tự áp mọi migration còn thiếu).
- `SENTRY_DSN`/`VITE_SENTRY_DSN` — lấy miễn phí ở sentry.io, điền vào `.env` VPS, build lại +
  `pm2 restart` (code Sentry đã xong, hiện no-op).
- `GROQ_API_KEY` (hoặc `OPENAI_API_KEY`) trên VPS nếu chưa có — cần cho STT.

## Quyết định quan trọng

- **Challenge 30 ngày → nhập vào Giải đấu tuần (2026-07-15, quyết định người dùng).** Khi làm
  M5/M5b của `docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md`: route `/challenge` thành
  trang Giải đấu tuần (redirect giữ link cũ), quay challenge = hoạt động ghi điểm (+15/ngày),
  bỏ khung 30 ngày chuyển chu kỳ tuần; dữ liệu `challenge_entries` + huy hiệu cũ giữ nguyên.

- **Thanh toán Pro: KHÔNG làm (2026-07-11).** Dự án dùng miễn phí cho cộng đồng. Không tự đề
  xuất lại — chỉ mở khi người dùng chủ động báo.
- **Giữ nguyên phiên bản:** Tailwind 3, ESLint 8 (`.eslintrc.cjs`) — không nâng v4/flat config.
- **Bundle-size budget (`size-limit`) thay Lighthouse CI** — Lighthouse không đo được trong môi
  trường sandbox/CI hiện có (`NO_FCP` ở mọi cấu hình). Cân nhắc lại nếu có runner thật sau này.
- **Zod validate input** đã rollout xong toàn bộ `api/*.ts` (đợt cuối `ai.ts`, dùng Zod v4).
- **Nhiều phiên làm việc có thể chạy song song** trên cùng repo — kiểm tra PR đang mở trên
  GitHub trước khi bắt đầu 1 kế hoạch lớn đã có sẵn trong `docs/research/`, tránh trùng công sức.

## Nợ kỹ thuật còn mở

- Không còn hạng mục a11y/kiểm thử lớn nào mở. Xem "Tiếp theo" ở trên cho việc sản phẩm còn dở.
- `docs/research/thu-thach-vlog-30-ngay.md` dùng tên cũ "Vlog" (tính năng đã đổi tên thành
  "Challenge" — route `/challenge`, bảng `challenge_entries`) — tài liệu đó là ghi chép lịch sử
  tại thời điểm merge, cố ý giữ nguyên tên cũ, không phải lỗi.
