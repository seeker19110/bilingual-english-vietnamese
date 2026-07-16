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

**Tính năng mới (chưa mở cho người dùng thật):** Thử thách "Challenge 1 phút/ngày"
(`/challenge`) — từ 2026-07-15 chạy **CHU KỲ TUẦN** Thứ 2→CN (bảng 7 ô, tổng kết tuần vào CN,
ăn mừng 7/7; bỏ vòng 30 ngày/vé nghỉ/mốc — huy hiệu sẽ quay lại ở M2). Code xong, migration
`0010_challenge_entries.sql` **chưa chạy trên production**.

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
  luật eval khi đổi prompt/model ghi ở CLAUDE.md §8 — ĐÃ MERGE (PR #242, 2026-07-15). ⚠️ Số baseline
  (`docs/research/eval-tutor-baseline.md`) CẦN NGƯỜI CÓ KEY chạy `npm run eval:tutor -- --write-baseline`
  (sandbox Claude không có key AI). PR #6 (trap phát âm Việt + coach tip, ① G1) — đã merge
  (PR #244, 2026-07-15). PR #7 (mục tiêu tuần, ② M1) — `lib/weeklyGoal.ts` (3/5/7 ngày/tuần,
  tuần từ Thứ 2 giờ VN, cùng luật "ngày có học" với streak) + chọn ở `/profile` + vòng tiến độ
  `GoalRing` ở Dashboard + màn ăn mừng 1 lần/tuần (`WeeklyGoalCelebration`, nối sau màn streak
  trong StudyTabs) + đồng bộ cột `weekly_goal` (migration `0012`, hợp nhất updatedAt mới hơn
  thắng) — ĐÃ MERGE (PR #246, 2026-07-15), CÙNG PR đó: Challenge chuyển CHU KỲ TUẦN (xem quyết
  định mới bên dưới). PR #8 (huy hiệu, ② M2) — `src/data/achievements.ts` (~19 huy hiệu tĩnh,
  5 nhóm: streak 7/30/100/365 · từ vựng 100/500/1000 · qua cấp CEFR A1-C2 (6) · kỹ năng 10 phiên
  nói/10 bài viết đã chấm · challenge 10/30/100 bài + tuần trọn vẹn 7/7) + `src/lib/achievements.ts`
  (`checkNewAchievements` — CHỈ so dữ liệu ĐÃ CÓ SẴN, không thêm tracking mới; "chỉ cộng thêm",
  không thu hồi) — gọi ở 5 điểm chạm (học từ mới StudyTabs, nộp challenge, chấm bài viết, luyện
  nói, thi cuối cấp) + toast khi vừa đạt + lưới huy hiệu ở `/profile` (backfill huy hiệu cũ khi
  mở trang). ⚠️ KHÔNG làm "điểm phát âm ≥90 lần đầu" như đặc tả gốc — `pronounceScore.ts` chưa
  lưu lịch sử điểm, thêm tracking mới sẽ vượt phạm vi 1 PR nhỏ; thay bằng nhóm kỹ năng/challenge
  hiện có. Đồng bộ cột `achievements` (migration `0013`, hợp union) — ĐÃ MERGE (PR #247,
  2026-07-16). PR #9 (bài luyện nghe dictation, ③ N3) — tab thứ 6 "Nghe" ở trang cấp CEFR
  (`components/StudyTabs.tsx` `ListeningTab`, `pages/CefrLevelPage.tsx`), 2 chế độ: "Chọn nghĩa"
  (tái dùng `buildListeningQuestions` của `cefrExam.ts` — xuất khẩu thêm, cùng engine phần Nghe
  đề thi cuối cấp, tái dùng `ExamQuestionCard`) + "Gõ lại" (dictation — `lib/listening.ts` dựng
  câu từ hội thoại/ví dụ từ điển của cấp, chấm bằng `scorePronunciation`/`scoreWords` đã có).
  Tốc độ mặc định theo cấp (A1-A2 0.9× · B1-B2 1× · C1-C2 1.1×, `LISTENING_RATE_BY_LEVEL`) —
  nới kiểu `rate` của `speak()`/`speakBilingual()` từ `Rate` (0.75/1/1.25) sang `number` để nhận
  giá trị này (RateToggle không đổi) — ĐÃ MERGE (PR #248, 2026-07-16). PR #10 (vá prompt theo
  eval, ⑤ T2) BỊ CHẶN — cần baseline T1 trước (`npm run eval:tutor -- --write-baseline`, cần
  người có key AI, sandbox không có) → **bỏ qua tạm, làm PR #11 (comeback + Home "Hôm nay", ② M4)
  trước**. PR #11 — `lib/comeback.ts` (bỏ ≥3 ngày → banner "Mừng bạn quay lại" + phiên rút gọn
  5 thẻ SRS/3 từ mới qua `?tab=srs&cap=5`/`?tab=today&cap=3` mới thêm ở `TodayLesson`/`SRSReview`
  — CHỈ giới hạn batch/due list phiên đó, KHÔNG đổi tốc độ đã lưu) + `storage.daysSinceLastActivity`
  (mới) + `vocab.getRecentlyLearnedWords` (mới, cho gợi ý "Luyện nói với từ vừa học" ở Home —
  nối đề xuất B đã có CTA sẵn ở StudyTabs, đây là lối vào từ Home cho người không đang giữa
  phiên học) — ĐÃ MERGE (PR #249, 2026-07-16). PR #12 (nhắc thông minh, ② M3) — **PHẠM VI ĐÃ
  CHỐT VỚI NGƯỜI DÙNG (2026-07-16): chỉ làm phần NỘI DUNG xoay theo ngữ cảnh, KHÔNG làm "giờ
  nhắc thông minh"** (server tự chọn giờ gửi cần thêm tracking GIỜ hoạt động — `daily_usage`
  hiện chỉ có NGÀY — là đổi schema/thêm theo dõi, người dùng chọn không làm). Đã làm:
  `api/_lib/reminderContent.ts` (mới, hàm thuần) — `pickReminderMessage()` chọn 1 trong 5 mức
  ưu tiên: streak sắp mất (loss-aversion mạnh nhất) → SRS đến hạn → gần đạt mục tiêu tuần (còn
  đúng 1 ngày) → đang tham gia challenge (giữ nguyên) → chung chung (fallback cũ); `computeStreakAtRisk`/
  `computeWeeklyDaysDone` tính từ `daily_usage` 14 ngày gần nhất (không vé nghỉ streak — ước
  lượng nới tay chỉ để chọn nội dung, không phải số hiển thị chính thức). `api/push.ts`
  `sendReminders()` gọi các hàm này (Supabase query mới: `daily_usage` mở rộng 14 ngày +
  `learning_progress.srs`/`weekly_goal`), fail-open nếu lỗi. `api/_lib/date.ts` thêm
  `addDays`/`weekStartOf` (mirror `src/lib/date.ts`, đúng quy ước "api/_lib không import từ
  src/lib" đã có từ trước). Giờ nhắc vẫn do người dùng tự chọn như cũ (`remind_hour`) — ĐÃ
  MERGE (PR #250, 2026-07-16). PR #13 (nút 👍/👎 + bảng `tutor_feedback`, ⑤ T3) — migration
  `0014` + `lib/tutorFeedback.ts` + nút vote cạnh mỗi khối "✅ Nhận xét" ở Chat.tsx/Speaking.tsx
  (👎 lưu `{userInput, aiFeedback}`, 👍 chỉ đổi UI không ghi DB, vote 1 lần/tin nhắn) — code
  xong, chờ merge. **Tiếp theo sau #13:** PR #14-16 (giải đấu tuần thay Challenge, ② M5/M5b)
  hoặc quay lại PR #10 nếu có người chạy được baseline T1
  (`npm run eval:tutor -- --write-baseline`, cần key AI thật, sandbox không có).
- **Quy tắc phân việc theo độ phức tạp** (CLAUDE.md mục 3, quyết định 2026-07-15): đọc đặc tả
  trước khi giao việc; việc phức tạp Opus tự làm, việc vừa giao subagent Sonnet, việc cơ học
  giao subagent Haiku — áp dụng cho mọi PR tiếp theo của mục trên.
- **Cải tiến sư phạm** (`docs/research/danh-gia-tien-trien-hoc-2026-07-07.md`, đề xuất A→H):
  A (Sổ lỗi cá nhân) đã xong. **B đã xong (rà lại 2026-07-16, ghi chú cũ "chưa có nút CTA riêng"
  đã LỖI THỜI):** nút "Luyện ngay N từ này bằng hội thoại"/"luyện nói với giọng thật" đã có sẵn
  ở màn batch-done (`StudyTabs.tsx`, `?words=`) TỪ TRƯỚC; PR #11 (M4) bổ sung thêm lối vào từ
  Home cho người không đang giữa phiên học. Còn C/D/E/F/G/H (sản xuất chủ động, nghe hiểu, ôn
  ngữ pháp, giữ chân — xem tài liệu; D/H đã kế thừa vào đặc tả M2-M5 ở trên).
- **Bổ sung dạng biến thể từ điển** (`docs/research/bo-sung-dang-bien-the-tu-dien.md`): Bước 2
  (vá ~40-60 dạng bất quy tắc còn thiếu + gắn `base` để hiện "Xem từ gốc") và Bước 4 (search
  hiểu biến thể: "books"/"went" → trả về từ gốc) chưa làm.
- Gamification: V-4 (mốc + huy hiệu), V-5 (Home "Hôm nay"), V-6 (âm UI) chưa làm — xem lịch sử
  PR gamification gần nhất.
- Thanh toán Pro — **đóng, không làm** (xem "Quyết định quan trọng").

## 🔴 KHẨN CẤP — Auto deploy đang lỗi liên tục (phát hiện 2026-07-15)

**Production ĐANG CHẠY CODE CŨ từ 2026-07-13** — mọi PR merge sau `028dfdc` (audit UI/UX
2026-07-13) đến nay (kể cả PR #246/#247 hôm nay) **CHƯA lên production**. Nguyên nhân: bước
`npm run migrate` trong `.github/workflows/deploy.yml` báo lỗi
`Thiếu SUPABASE_DB_URL trong .env` → script thoát bằng `exit 1` → toàn bộ deploy dừng ngay
(`set -e`), không build/không reload PM2. Đã lỗi **8 lần liên tiếp** (2026-07-14 00:05 →
2026-07-15 23:36), y hệt nhau mỗi lần.

**AI KHÔNG tự sửa được** — cần SSH/quyền VPS mà AI không có. **Việc người dùng cần làm:**

1. Lấy connection string ở Supabase Dashboard → Project Settings → Database → Connection
   string → **"Direct connection"** (không dùng "Transaction pooler").
2. SSH vào VPS, thêm `SUPABASE_DB_URL=...` vào `/var/www/english-tutor/.env`.
3. Trigger lại workflow "Deploy to VPS" trên GitHub Actions (hoặc đợi lần push tiếp theo).

Xem `docs/deploy-vps-ubuntu.md`. Sau khi sửa, xác nhận lại bảng "Trạng thái migration trên
Supabase production" ở `supabase/migrations/README.md` (0010–0013 sẽ tự áp).

## ⚠️ Cần làm tay (không cần PR)

- Migration `0010_challenge_entries.sql` — chạy khi có `SUPABASE_DB_URL` trong `.env` VPS rồi
  `bash deploy.sh` (tự áp mọi migration còn thiếu). **Xem mục khẩn cấp ở trên — đây chính là
  nguyên nhân chặn auto deploy.**
- `SENTRY_DSN`/`VITE_SENTRY_DSN` — lấy miễn phí ở sentry.io, điền vào `.env` VPS, build lại +
  `pm2 restart` (code Sentry đã xong, hiện no-op).
- `GROQ_API_KEY` (hoặc `OPENAI_API_KEY`) trên VPS nếu chưa có — cần cho STT.

## Quyết định quan trọng

- **Challenge 30 ngày → nhập vào Giải đấu tuần (2026-07-15, quyết định người dùng).** Khi làm
  M5/M5b của `docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md`: route `/challenge` thành
  trang Giải đấu tuần (redirect giữ link cũ), quay challenge = hoạt động ghi điểm (+15/ngày),
  bỏ khung 30 ngày chuyển chu kỳ tuần; dữ liệu `challenge_entries` + huy hiệu cũ giữ nguyên.
  **[Bổ sung 2026-07-15, làm cùng PR #7]** Người dùng yêu cầu "Challenge tính theo tuần luôn
  cho đồng bộ" (với mục tiêu tuần vừa làm) → phần "gọn challenge → chu kỳ tuần" (mục 16 bảng
  ưu tiên) ĐÃ LÀM NGAY, không đợi tới giải đấu (mục 14–15): bảng 7 ô Thứ 2→CN thay bảng 30 ô
  (dùng chung luật tuần `weekStartOf` của `lib/date.ts` với mục tiêu tuần), bỏ vé nghỉ/resume/
  restart/mốc 30 ngày, chủ đề xoay vòng theo tổng số bài đã nộp, tổng kết TUẦN vào Chủ nhật
  (so video đầu↔cuối tuần), ăn mừng "tuần trọn vẹn 7/7". Schema `challenge_entries` GIỮ NGUYÊN
  (cột `challenge_day`/`round` để nguyên — dữ liệu cũ không mất; prompt AI KHÔNG sửa để khỏi
  phải chạy lại eval). Phần bảng xếp hạng/điểm giải vẫn ở mục 14–15 như cũ.

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
