# PROGRESS.md — Trạng thái dự án

> AI đọc file này để biết đang ở đâu. Chi tiết tính năng: `PROJECT.md`. Lịch sử đầy đủ từng PR:
> `git log`/PR đã merge trên GitHub — file này chỉ giữ **tóm tắt** + việc còn mở + quyết định lớn.
>
> **Nhịp làm việc theo giới hạn giờ (CLAUDE.md mục 3):** ≥ 70% usage → hoàn tất việc đang làm, tạo
> PR rồi DỪNG chờ duyệt. < 70% → sau khi PR merge, tự động tiếp tục mục kế tiếp.

## Giai đoạn hiện tại

**Nhật ký từng đợt việc nay nằm ở `docs/changelog/` — mỗi đợt MỘT FILE riêng.**

Xem nhanh: `npm run changelog` (in 10 đợt gần nhất) · `npm run changelog -- 30` (30 đợt) ·
`npm run changelog -- --all`. Hoặc mở thẳng `docs/changelog/`, file có SỐ LỚN NHẤT là mới nhất.

**Vì sao tách ra (quyết định 2026-08-26).** Trước đây mọi đợt việc đều chèn thêm một mục vào ĐẦU
mục này. Hệ quả: PR nào cũng sửa cùng một chỗ của cùng một file, nên cứ hai PR chạy song song là
xung đột — riêng ngày 2026-08-26 đã xung đột **bốn lần liên tiếp** (PR #693, #695, #696, #697),
lần nào cũng cùng một kiểu "cả hai bên cùng thêm mục ở đầu file" và phải giải tay. Tách mỗi đợt
thành một file riêng thì hai PR ghi hai file khác nhau, git không có gì để xung đột.

Cố ý **KHÔNG** commit file index sinh tự động: chính cái index đó sẽ lại thành một file mà mọi PR
cùng sửa, tức là dựng lại đúng vấn đề vừa bỏ. Thay vào đó `npm run changelog` đọc thẳng thư mục.

**File này giữ lại phần thật sự là TRẠNG THÁI HIỆN TẠI** — thứ được sửa tại chỗ chứ không chồng
thêm: nợ kỹ thuật còn mở, quyết định quan trọng, việc tiếp theo, việc cần làm tay. Đó là lý do
những mục đó vẫn nằm nguyên ở đây.

**Cắt gọn 2026-09-06 (đánh giá sâu dự án, `docs/changelog/0276-*.md`):** file này từ 3.797
dòng về ~700 dòng. Mọi phần đã hoàn tất (lộ trình English Tutor OS đã FROZEN, nhật ký trước khi
tách changelog, toàn bộ mục "Tiếp theo" cũ đã ✅, GĐ2 STEM) dời **nguyên văn** sang
`docs/legacy/progress-luu-tru-den-2026-09-06.md`; nợ đã đóng dời sang
`docs/legacy/no-ky-thuat-da-dong.md`. Bản đồ tài liệu nào còn hiệu lực, tài liệu nào chỉ tham
khảo: `docs/README.md`.

**Vị trí hôm nay (2026-09-06):** app nền tảng chạy thật tại `donghanhcungban.org`; môn Anh
chín nhất (A1→C2, 3 chế độ, hai chiều A/B); môn Lập trình có xương sống P1–P6 + 14 hướng chuyên
sâu + khoá ngắn + lộ trình mục tiêu; 4 trụ Career/Work/Startup/Life có trang; 3 môn STEM
(`packages/subject-{physics,chemistry,biology}`) mới là **bản nháp chưa nối vào app** (theo dõi ở
`docs/goals/2026-08-31-mon-hoc-toan-ly-hoa-sinh.md`). Cổng chất lượng đo thật 2026-09-06:
typecheck ✅ · 574 file / 12.160 unit test ✅ · coverage sàn 97/93/96/97.

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
Sentry error tracking (**đã bật thật trên VPS, 2026-07-27** — DSN đã điền, đã xác nhận lỗi test
ghi nhận được) · CI/CD tự deploy + tự chạy migration Postgres khi merge vào `main`
(`npm run migrate:pg` trong pipeline deploy, không cần chạy tay) · audit bảo mật/logic nhiều đợt
(RLS theo cột chặn tự nâng Pro/bypass lượt, timeout fetch, refund lượt khi provider lỗi, ranh
giới ngày theo giờ VN — chi tiết `AUDIT.md`) · **deploy zero-downtime (2026-07-20)**: PM2
chuyển cluster mode (1 instance) + `wait_ready` (`server.ts` gửi `process.send('ready')` sau
`app.listen` + graceful shutdown SIGINT/SIGTERM) — trước đó fork mode `pm2 reload` = tắt cũ
rồi mới bật mới → app chết ~10s mỗi lần deploy (thấy trong log deploy: 9 lần curl
"Couldn't connect"); logic reload + health check gom về `scripts/pm2-reload.sh` (cả
`deploy.yml`/`deploy.sh`/`scripts/deploy.sh` cùng gọi, tự phát hiện fork mode cũ để
delete+start MỘT lần vì PM2 không đổi được exec_mode qua reload) — đã kiểm chứng bằng PM2
thật trong sandbox: 3.766 request liên tục xuyên 2 lần reload, 0 request rớt.

**Tính năng mới:** Thử thách "Challenge 1 phút/ngày" (`/challenge`) — từ 2026-07-15 chạy
**CHU KỲ TUẦN** Thứ 2→CN (bảng 7 ô, tổng kết tuần vào CN, ăn mừng 7/7; bỏ vòng 30 ngày/vé
nghỉ/mốc — huy hiệu sẽ quay lại ở M2). ~~Migration `0010_challenge_entries.sql` chưa chạy trên
production~~ **hết hiệu lực (2026-07-20)** — ghi chú từ thời Supabase; sau khi rời hẳn sang
Postgres tự host, bảng `challenge_entries` đã có sẵn trong `postgres/schema.sql` (baseline khi
khởi tạo DB mới) nên tự động có qua `npm run migrate:pg`, không cần chạy riêng.

**i18n/UX:** song ngữ toàn site kể cả `/login` · bottom-nav mobile (Trang chủ/Lộ trình/Luyện
tập/Tiến độ) · thẻ "Học tiếp" ở Home · karaoke (sáng chữ theo giọng đọc) áp dụng mọi TTS >1 từ ·
chuẩn hoá vị trí nút loa/micro + vùng chạm ≥44px.

**Giọng TTS 14 giọng + gói VIP + admin cấu hình (2026-07-21, nhánh
`claude/chirp-3-hd-voice-upgrade-c06eds` — ✅ ĐÃ MERGE, ghi chú "CHƯA MERGE" cũ đã sai; đo lại
2026-09-03: nhánh không còn trên remote, tính năng đã ở trên `main`):** mở rộng từ 4 → 14
giọng Chirp3-HD thật (7 nữ/7 nam, xác minh qua Google TTS `voices.list`) cho cả en-US/vi-VN ·
mọi user tự chọn giọng ở trang Hồ sơ (`VoicePicker`), lưu toàn cục áp dụng mọi trang · thêm gói
`vip` (bên cạnh free/pro) · **quyết định người dùng 2026-07-21:** hạn mức free=5/pro=100/
vip=không giới hạn (lượt/tính năng/ngày), khuyến mãi ra mắt hiện đang bật (mọi user = VIP tới
hết 31/12/2026, cấu hình được) · trang `/admin-settings` (admin xác thực qua `ADMIN_EMAILS`
trong `.env`) cho chỉnh 15 hạn mức + bật/tắt khuyến mãi lưu trong bảng `app_settings` — server
(`usage.ts`/`voiceAccess.ts`, cache 30s) và client (`src/lib/appSettings.ts`, đồng bộ lúc mở
app qua ETag/If-None-Match, không fetch thừa khi chưa đổi gì) đều đọc từ đây, không còn hard-
code trong nhiều file rời rạc.

**Quản trị VIP/gói (2026-07-28):** Danh sách VIP whitelist (thêm/xoá email → tự cấp/hạ VIP vĩnh
viễn, kể cả người chưa đăng ký) + Ma trận tính năng theo gói Free/Pro/VIP (admin bật/tắt từng
tính năng, thêm/xoá tính năng mới) — 2 tab mới trong `/admin`, xem chi tiết trong "Tiếp theo" và
`docs/` liên quan nếu cần đào sâu.

**Trang Nghe `/listening` — thư viện nghe song ngữ (2026-08-01, PR #434, đang bổ sung nội dung
theo đợt):** trang mới gom 4 mục để NGHE (không chấm điểm, khác `/phrases` và tab "Nghe" trong
`/practice`): câu thông dụng + hội thoại (tái dùng dữ liệu sẵn có, đổi cách trình bày) và **truyện
song ngữ MỚI** (`ft-*`/`fb-*`/... theo 6 thể loại `fairy-tale`/`fable`/`vn-folk`/`myth`/`humor`/
`children`, xem `docs/research/danh-muc-truyen-nghe-2026-08-01.md` — chốt 120 truyện, làm dần mỗi
đợt ~10 truyện/PR). Hạ tầng: `data/stories/{index.ts,loader.ts,raw/*.json}` +
`scripts/gen-stories-json.mjs` (`npm run gen:stories`, nối vào `build`) sinh
`public/data/stories/`; UI `pages/Listening.tsx` (tab đồng bộ URL) + `pages/StoryReader.tsx` (đọc
truyện, tự cuộn theo câu, ghi nguồn bắt buộc) + `components/StoryCard.tsx`. Bản tiếng Anh **bắt
buộc tải thật từ Project Gutenberg** (không gõ từ trí nhớ — CLAUDE.md §5), tiếng Việt Opus dịch
tay chất lượng văn học. Migration `0032` bật feature `listening` cho mọi gói.
**Tiến độ nội dung [cập nhật 2026-08-03, đếm file thật]:** ✅ **`fairy-tale` XONG 20/20** · ✅
**`vn-folk` XONG 20/20** · ✅ **`fable` XONG 20/20** — ba thể loại đã hoàn tất trọn vẹn.
🔵 **`myth` 24/25** (Kingsley 8 + Bulfinch 12 + Colum Bắc Âu 4; chỉ còn Cupid và Psyche).
🔓 **`vn-folk` 24 truyện — thể loại KHÔNG CÒN TRẦN** (chủ dự án chốt 2026-08-03: cứ còn truyện
dân gian Việt Nam hay và chưa có thì bổ sung tiếp). Vì thế `vn-folk` ghi số tuyệt đối, KHÔNG ghi
dạng `n/20` nữa, và tổng danh mục 125 giờ chỉ là **sàn**, không phải đích.
`humor` 0/20 · `children` 0/20. **Tổng 88 truyện.**
🚨 **Sự cố trùng lặp 2026-08-03 (đã xử lý):** đã soạn `vn-tam-cam` rồi mới thấy `ft-tam-cam` ĐÃ
CÓ SẴN ở thể loại `fairy-tale` (bản dài gấp đôi) — đã xoá bản trùng. Nguyên nhân: kiểm "truyện VN
đã có" bằng `ls raw/vn-*.json`, tức lọc theo TIỀN TỐ THỂ LOẠI, trong khi truyện Việt Nam nằm rải
cả ở `fairy-tale` và `humor`. **Thể loại KHÔNG suy ra được quốc gia.** Quy tắc mới đã ghi vào
danh mục §5: trước khi soạn truyện mới phải rà TOÀN BỘ `raw/*.json` không lọc tiền tố.
✅ **Rào cản mạng ĐÃ GỠ (2026-08-03):** `gutenberg.org` giờ truy cập được từ môi trường Claude
Code web (`curl` PG 3327 trả HTTP 200) — ghi chú cũ ngày 2026-08-02 nói `fable`/`myth`/`humor`/
`children` "bị chặn cứng" đã hết hiệu lực, 4 thể loại phụ thuộc Gutenberg làm tiếp được bình thường.
⚠️ Cách cập nhật con số này: **đếm file thật** (`ls apps/english/src/data/stories/raw/ft-*.json |
wc -l`), đừng cộng nhẩm — ghi chú trước đó từng ghi `fairy-tale` "12/20" trong khi thực tế mới có
11 file, và ghi `myth` "chưa bắt đầu" trong khi thực tế đã có 16 file.

## Tiếp theo

> Mỗi mục 1 PR, dừng xin duyệt ở mỗi cổng (CLAUDE.md mục 3). Mục đã ✅ KHÔNG nằm ở đây — xem
> `docs/changelog/`. Viết lại toàn bộ ngày 2026-09-06 theo kết luận đánh giá sâu: **kỹ thuật
> đã khoẻ, cái thiếu là bằng chứng người học thật; ưu tiên chiều sâu hơn chiều rộng.**

### Ưu tiên 1 — bằng chứng người dùng thật (trước mọi tính năng mới)

- **[2026-09-06] Đóng băng mở rộng phạm vi trong 2–4 tuần** (người dùng quyết): không thêm
  môn/khoá/hướng mới cho tới khi có số đo người học thật. Lý do: 3 tuần qua ~15 đợt việc/ngày,
  hầu hết là mở rộng chiều rộng (14 hướng lập trình, 8 khoá ngắn, 2 bộ chạy ngôn ngữ, 3 môn STEM
  nháp), trong khi chưa có một con số retention nào.
- **[2026-09-06] ✅ Đo phễu học thật — XONG (`docs/changelog/0277-*.md`).** Hạ tầng đã có
  (bảng `analytics_events`, `lib/analytics.ts`, tab admin Analytics + DAU/WAU/MAU). Lỗ hổng: 3/6
  bước phễu (`signup`, `first_session_done`, `day2_return`) chưa nơi nào bắn → luôn 0. Sửa bằng
  cách SUY RA từ `users.created_at` + `daily_usage` ngay trong `analytics-summary.ts` (một câu
  SQL, đã chạy thật trên Postgres 16), không bắn từ client. Từ nay tab admin Analytics đọc
  được phễu thật, có cả số quá khứ.
- **[2026-09-06] Mời 5 người học thật, quan sát 2 tuần** (việc tay của người dùng, xem mục
  "Cần làm tay"). Sau 2 tuần đọc phễu + DAU/returning rồi mới quyết mảng nào đi sâu.

### Ưu tiên 2 — nợ nội dung của mảng đã ship (đi sâu, không mở rộng)

- ~~Lộ trình "Kỹ Sư Trưởng AI": quiz sau chặng mới soạn 4/22~~ — **SAI, đo lại 2026-09-06:**
  `stageQuizzes.ts` đã có **27 chặng** (22/22 P1–P4 + 4 P5 + dư), đặc tả
  `docs/specs/2026-08-31-quiz-18-chang-con-lai.md` đã thi hành, test canh mỗi chặng đúng 5 câu.
  Ghi nhầm vì chép từ nhật ký đợt 3 (`0210`) mà không kiểm mã — đúng lỗi mà luật "đo, đừng
  đoán" nhắm tới. Không còn việc.
- **Chế độ ôn thi chiều B (`vsl-b1`) dùng tạm bộ từ A1–B1 học ngược** vì repo chưa có bộ từ
  vựng tiếng Việt phân bậc — việc NỘI DUNG vài nghìn mục, cần đặc tả riêng trước (xem "Nợ kỹ
  thuật còn mở").
- **Chương trình M (mở rộng ngôn ngữ) 11/12 PR — PR-M4–M6 (nội dung Swift) CHẶN** cho tới khi
  đối chiếu bộ chạy Swift với `swift` thật (việc tay, mục "Cần làm tay" A). Hiến chương:
  `docs/research/dac-ta-mo-rong-ngon-ngu-va-tu-duy-2026-08-26.md`.
- **3 môn STEM (Lý/Hoá/Sinh) — bản nháp chờ duyệt chuyên môn, CHƯA nối vào `apps/`.** Cổng bắt
  buộc trước khi nối: duyệt nội dung theo GDPT 2018 (`docs/goals/2026-08-31-mon-hoc-toan-ly-hoa-sinh.md`).
  Không nối khi chưa có người học thật ở môn Anh/Lập trình cần nó.
- **4 trang trụ Career/Work/Startup/Life chưa có chiều B** (0/4 file dùng `direction`) — nợ có
  chủ đích, người dùng chốt "chiều B nợ". Làm khi có người học chiều B thật.

### Ưu tiên 3 — kỹ thuật (nhỏ, đo được, không đổi hành vi)

- **Tách 4 file giao diện > 1.700 dòng** — ✅ XONG cả 4 (mỗi file một PR, có Tầng 8b):
  `StudyTabs.tsx` 2.071 → `studyTabs/` (`docs/changelog/0278`) · `Practice.tsx` 1.752 → `practice/`
  (`0279`) · `Lessons.tsx` 1.693 → `lessons/` (`0280`) · `AppliedKnowledge.tsx` 1.942 → trang 112
  dòng + `appliedKnowledge/` 14 file, state theo từng simulator — **phương án A**, giá trị nhập
  không còn được nhớ khi đổi simulator (`0281`, đặc tả
  `docs/specs/2026-09-06-tach-applied-knowledge-theo-simulator.md`). Phần dở còn lại
  `lessons/LessonView.tsx` 1.016 dòng cũng đã tách: chế độ Đóng vai ra hook `useRolePlay` + 3
  component, còn 699 dòng (`0282`, đặc tả `docs/specs/2026-09-06-tach-dong-vai-lesson-view.md`).
- **Rà lại sau vài ngày:** log Redis (`pm2 logs dhcb --err`) sau khi VPS có swap — còn ~7 lần
  rớt/ngày thì đào tiếp, giảm hẳn thì đóng nợ (chi tiết ở "Nợ kỹ thuật còn mở").
- **Đã kiểm 2026-09-06, KHÔNG cần làm:** (1) Zod — mọi handler API có đọc `req.body/query/params`
  đều đã validate bằng Zod (46 handler không dùng Zod là handler không đọc input); (2) 28 chỗ
  tắt `react-hooks/exhaustive-deps` trong 16 file đều là khuôn có chủ đích và có comment
  (khoá invalidation thủ công `refresh`/`ready` cho dữ liệu localStorage, hoặc effect chỉ chạy
  lúc mount) — không phải stale closure.

## ⚠️ Cần làm tay (không cần PR)

> **Soát lại toàn bộ 2026-09-03 bằng chứng cứ, không bằng trí nhớ.** Mục này là thứ người dùng
> đọc để biết MÌNH phải làm gì — nên một mục đã xong nằm lại đây không vô hại: nó bắt người
> dùng đi làm việc đã xong. Lần soát này tìm thấy **6 mục như vậy** (xem phần B).
> Quy tắc từ nay: xong mục nào thì chuyển ngay xuống phần B kèm **bằng chứng**, đừng xoá trắng —
> để lần sau khỏi phải đi kiểm lại từ đầu.

### A. CÒN PHẢI LÀM

- **[2026-09-06] Mời 5 người học thật (mỗi người một trụ: Anh · Lập trình · Career/Work ·
  Life · một người học chiều B), dùng 2 tuần.** Không cần công cụ ngoài: tab admin "Analytics"
  - "Sử dụng & chi phí" đã có DAU/WAU/MAU/returning và phễu. Ghi lại thứ họ dùng và thứ họ bỏ
    qua — đây là dữ liệu duy nhất quyết định được mảng nào đáng đi sâu. Xem "Tiếp theo" ưu tiên 1.

- **[2026-08-27] Đối chiếu bộ chạy Swift với `swift` THẬT — CHẶN chương trình M từ PR-M4.**
  Chạy trên máy có Xcode hoặc Swift toolchain:
  `npm run swift:conformance`
  Script sinh một file `.swift` gồm đúng 41 ca đối chiếu, chạy bằng `swift`, so từng ca với kết
  quả kỳ vọng **và** với output của bộ chạy DHCB, rồi in ca nào lệch. Xong thì đặt
  `daDoiChieu: true` cho các ca đã khớp trong
  `packages/subject-programming/swiftSim/conformance.ts`, ghi phiên bản `swift --version` vào
  `docs/research/dac-ta-bo-chay-swift-2026-08-27.md` mục 4, rồi commit.
  **Vì sao AI không tự làm được — đã thử lại 2026-09-03 và VẪN chặn:** `download.swift.org` trả
  mã 000 (không tới được), `github.com/swiftlang/swift/releases` trả 403. Khác Kotlin ở đúng
  điểm này: Kotlin tải được từ GitHub releases nên cổng đó đã tự mở (phần B mục 1).
  Hiến chương chương trình M §3.4 cấm suy đoán kết quả từ trí nhớ.
  **Hệ quả nếu bỏ qua:** PR-M4–M6 (nội dung Swift) không được bắt đầu — `conformance.test.ts`
  tự làm CI đỏ nếu có bài `language: 'swift'` khi ca còn chưa đối chiếu. Đây là **việc duy nhất
  còn lại của cả chương trình M** (11/12 PR đã xong).

- **Kế hoạch scale 50k concurrent (2026-07-25) — phần code/config/docs ĐÃ XONG (PR #321–#326),
  còn lại là việc hạ tầng thật cần người dùng tự làm:**
  1. **Mua thêm VPS** (khuyến nghị: tách Postgres/Redis ra 1 VPS riêng 6–8 vCPU trước tiên —
     xem runbook `docs/deploy-vps-ubuntu.md` mục "GĐ2"), sau đó thêm 2–3 VPS app khi k6 xác
     nhận cần (đo trước, đừng mua hết 1 lần).
  2. **Chạy `bash scripts/verify-pg-backup.sh`** trên VPS ít nhất 1 lần để xác nhận backup
     cron hiện có thật sự restore được (chưa từng kiểm chứng).
  3. **Cài k6 + chạy `npm run loadtest:k6`** (`BASE_URL=... VU_TARGET=... k6 run
scripts/load-test/k6-baseline.js`) nhắm staging/production — tăng dần VU_TARGET, KHÔNG
     nhảy thẳng lên 50k. Đây là bước đo THẬT còn thiếu — mọi con số vCPU trong kế hoạch hiện
     vẫn là ước lượng lý thuyết.
  4. Xem `docs/rollback-runbook.md` nếu có sự cố khi triển khai các bước trên.
  5. Xem `docs/research/ke-hoach-scale-30k-concurrent.md` (tên file cũ, nội dung đã cập nhật
     mục tiêu 50k) để biết đầy đủ bối cảnh/ngân sách/quyết định đã chốt.

- **Biến môi trường trên VPS — KHÔNG kiểm chứng được từ máy dựng** (phiên AI không đọc được
  `.env` của VPS; cả ba mục dưới đây đều "thiếu thì tính năng tự tắt", không làm vỡ app):
  - `GROQ_API_KEY` (hoặc `OPENAI_API_KEY`) — cần cho STT (`/api/stt`). Thiếu thì luyện nói rơi
    về Web Speech API dự phòng.
  - `ADMIN_EMAILS` — xác thực trang `/admin-settings` (`packages/core-auth/adminAuth.ts`).
    Thiếu thì không ai vào được trang quản trị. Mẫu ở `.env.example` dòng 207.
  - `AZURE_SPEECH_KEY`/`AZURE_SPEECH_REGION` — **TÙY CHỌN**, chỉ cần khi muốn bật chấm phát âm
    chi tiết qua Azure. Tạo resource "Speech service" (free tier F0, 5h audio/tháng) ở Azure
    Portal → Keys and Endpoint. Thiếu thì `/api/pronounce-assess` trả "chưa cấu hình" và client
    rơi về Giai đoạn 1 miễn phí.

### B. ĐÃ XONG — giữ lại kèm bằng chứng, đừng làm lại

1. **~~Đối chiếu bộ chạy Kotlin với `kotlinc` thật~~ — ✅ XONG 2026-09-03, cổng §3.4 ĐÃ MỞ.**
   48/48 ca chạy trên `kotlinc 2.0.21` thật (JRE 21.0.10) và khớp hết; mọi ca nay
   `daDoiChieu: true`. Hoá ra không cần máy riêng — proxy tải được `kotlin-compiler-2.0.21.zip`
   từ GitHub releases và máy dựng đã có sẵn `java`. PR-M8/M9 (nội dung Kotlin) đã làm xong nhờ
   cổng này. Nhật ký `docs/changelog/0248-*.md`.
2. **~~Nâng cấp giọng TTS 14 giọng + gói VIP + admin cấu hình (nhánh
   `claude/chirp-3-hd-voice-upgrade-c06eds`)~~ — ✅ ĐÃ MERGE.** Mục cũ ghi "chưa merge, PHẢI
   chạy đủ cổng trước khi merge" — **sai từ lâu**. Bằng chứng (đo 2026-09-03):
   `git ls-remote --heads origin` **không còn nhánh đó**, và tính năng đã nằm trên `main`
   (`apps/dhcb/src/components/VoicePicker.tsx`, `postgres/migrations/0001_app_settings.sql`,
   `packages/core-billing/promo.ts`). Riêng `ADMIN_EMAILS` vẫn là việc tay — đã dời lên phần A.
3. **~~Migration `0004_plan_expires_at.sql`~~** · 4. **~~Migration `0028_tts_viseme_timeline.sql`~~** · 5. **~~Migration `0034`–`0037` (ADR-0002)~~** — ✅ **đều đã chạy trên production từ lâu.**
   Bằng chứng: `scripts/deploy.sh` dòng 75 gọi `npm run migrate:pg` **tự động mỗi lần deploy**,
   và repo nay đã ở migration `0074` (77 file) — tức mọi migration số nhỏ hơn đã được áp qua các
   lượt deploy từ đó tới nay. Ghi chú còn giá trị tra cứu: đợt `0034`–`0037` khiến **mọi phiên
   Bearer cũ phải đăng nhập lại một lần** (đánh đổi đã xác nhận, không phải lỗi); cột
   `viseme_timeline` chỉ phát huy khi có `ELEVENLABS_API_KEY` + giọng VIP "Rachel" (giọng Google
   Chirp3-HD không có timestamp nên vẫn chạy đường ước lượng).
4. **~~Backup R2~~ — ✅ XONG (2026-07-29, người dùng xác nhận).** VPS có đủ **3 dòng cron**
   (`pg_dump` 5h03, `backup:r2` 3h10, `backup:env` 3h10), đã xác nhận upload thật cả 2 loại.
   Trong lúc rà soát còn phát hiện và bịt thêm lỗ hổng `.env` chưa từng được backup ở đâu
   (`scripts/backup-env-to-r2.ts` + `restore-env-from-r2.ts`, mã hoá AES-256-GCM, PR #369).
   `ENV_BACKUP_PASSPHRASE` tạo bằng `openssl rand -base64 24`, lưu ở password manager,
   **KHÔNG** đặt trong `.env`.
5. **~~`SENTRY_DSN`/`VITE_SENTRY_DSN`~~ — ✅ XONG (2026-07-27, người dùng xác nhận).** Đã điền
   trên VPS, đã thấy lỗi test được ghi nhận trên Sentry. Không còn no-op.
6. **Cấp Pro/VIP thủ công** (vẫn dùng được, không phải việc phải làm): admin gọi
   `POST /api/admin-grant-plan` body `{ "email": "...", "plan": "pro", "days": 30 }` với Bearer
   token của admin — `days: null` = vĩnh viễn.

## Quyết định quan trọng

- **[2026-09-05] 🔑 QUYẾT ĐỊNH QUAN TRỌNG — thêm Tầng 8b "NHÌN trang thật bằng ảnh chụp" vào
  `docs/framework/QUY-TRINH-AUDIT.md`, BẮT BUỘC với mọi đợt việc chạm giao diện** (người dùng
  chốt trong phiên, cùng PR `#863`; cập nhật chéo mục 2 `CLAUDE.md`).

  Căn cứ đo được, không phải phòng xa: chuỗi ba đợt trên tìm ra **bốn** lỗi lặp nội dung, **không
  lỗi nào** bị build/typecheck/lint/test/a11y bắt, và cả bốn chỉ lộ ra khi chụp ảnh trang rồi
  nhìn. Lý do chúng vô hình khi đọc mã: lỗi nằm ở **quan hệ giữa các chỗ cách xa nhau** (một
  `PageHeader` và một hero cách 40 dòng cùng in một câu) hoặc ở **con số chỉ tồn tại sau khi
  trình duyệt dựng xong** (trang cao 37.266px vì lưới dừng ở nấc `sm:`).

  Nội dung tầng: chụp `fullPage` ở **1440px và 390px**, **trước và sau** khi sửa, kèm 4 câu phải
  tự trả lời trên mỗi ảnh, công thức Playwright chạy được ngay, và 3 cái bẫy đã dính thật. Đặt là
  tầng phụ theo tiền lệ `1b`/`2b`/`5b`/`6b` nên tổng số tầng chính vẫn là 11.

  **Đánh đổi đã biết:** tầng này làm mọi đợt việc UI dài thêm một bước tay. Nếu sau vài đợt thấy
  tốn hơn lợi thì xem lại — ghi ở đây để lần sau có căn cứ đánh giá chứ không phải cãi từ trí nhớ.

- **[2026-09-03] Màu Tailwind cố định: GIỮ NGUYÊN, không token hoá ~4.100 chỗ — người dùng
  chốt.** Câu hỏi đặt ra sau PR #842: có nên đổi các họ màu Tailwind gốc (`amber` 763 ·
  `emerald` 700 · `rose` 480 · `sky` 328 · `indigo` 277…) sang token vai trò (`--info-*`,
  `--warn-*`…) để chúng tự đổi theo theme như `--z-*`/`--a-*` không? **Trả lời: KHÔNG.**
  Lý do: (a) đổi thì chạm >4.000 chỗ trong ~120 file với **rủi ro thị giác thật**, đổi lấy
  sự nhất quán về hình thức; (b) lý do an toàn — thứ duy nhất đáng đánh đổi rủi ro đó — **đã
  không còn**: 720 chỗ rớt tương phản đã vá xong ở PR #842, và cổng
  `scripts/fixed-color-contrast-audit.test.ts` nay đo MỌI màu cứng dùng làm màu chữ trên cả
  5 theme mỗi lần `npm test`. Giữ nguyên là giữ cách viết quen thuộc mà vẫn không tái diễn
  loại lỗi vừa sửa.
  **Luật thi hành cho code mới:** dùng màu Tailwind cố định làm màu chữ thì phải kèm biến thể
  `theme-light:text-<họ>-800/900` NGAY TỪ ĐẦU; quên thì cổng trên đỏ và chỉ luôn cách vá.
  Đừng mở lại cuộc bàn này nếu không có dữ kiện mới.

- **[2026-09-03] "Giữ nguyên mọi thứ, thang bậc 5 và cover 90%" — người dùng chốt ba việc đang
  treo, KHÔNG đổi một dòng mã chạy nào.**
  1. **`Career.tsx` giữ CẢ HAI thước đo.** "Số năm kinh nghiệm" (trường hồ sơ, dòng 662) và
     thang 5 bậc thành thạo (per-kỹ-năng, dòng 534) đo hai cấp khác nhau nên bổ sung nhau. Mục
     nợ cũ mô tả chúng là "mâu thuẫn" — mô tả đó sai, đã đóng mục nợ kèm lý do.
  2. **Sàn coverage giữ nguyên 90%.** Biên độ 0,70 điểm được chấp nhận; không nâng ngưỡng,
     không viết test chỉ để đẩy số.
  3. **Không tự khởi động việc mới.** Hai việc còn mở (đối chiếu Nginx trên VPS, chạy
     `npm run swift:conformance` để mở cổng cứng cho track Swift) vẫn là **việc tay của người
     dùng** — AI không thay thế được vì cần SSH/toolchain thật.

- **[2026-08-04] Tự viết "bản đồ code" thay GitNexus.** `npm run codemap` — dùng TypeScript
  compiler API (đã có sẵn, KHÔNG thêm dependency) dựng đồ thị import + đồ thị lời gọi hàm, lưu
  `.codemap/graph.json` (gitignore, dựng lại được). Đo thật: 480 file · 1364 cạnh import · 4341
  cạnh lời gọi trong ~9 giây. Lệnh tra cứu: `impact` (sửa file này gãy chỗ nào), `callers` (ai gọi
  hàm này), `hotspots`, `cycles`, `orphans`. Logic thuần tách ở `scripts/lib/codemap.ts` (18 test).
  Phát hiện ngay khi chạy thử: 3 chu trình import trong `apps/english/src/data/` (cefr.ts ↔
  cefrAdvanced.ts, curriculum.ts ↔ cefrC1C2Vocab.ts, curriculum.ts ↔ cefrA1B2ExtraVocab.ts) —
  chưa gây lỗi nhưng nên gỡ, đã ghi vào "Nợ kỹ thuật còn mở".

- **[2026-08-04] Không cài `obra/superpowers` và `GitNexus` — chỉ dung hợp ý hay vào khung sẵn có.**
  Đã rà cả 14 skill của `obra/superpowers` (MIT). 10/14 skill (brainstorming, writing-plans,
  executing-plans, subagent-driven-development, dispatching-parallel-agents, using-git-worktrees,
  requesting/receiving-code-review, using-superpowers, writing-skills) **đã có tương đương** trong
  `docs/framework/KIEN-TRUC-DIEU-PHOI-3-TANG.md` — cài plugin sẽ tạo nguồn luật thứ hai song song
  với `CLAUDE.md`, dễ khiến agent hành xử không nhất quán. 4 skill còn thiếu đã được viết lại bằng
  tiếng Việt và nhúng thẳng vào khung: TDD RED-GREEN-REFACTOR + debug 5 bước (KHUNG 1, GĐ5),
  bằng chứng-trước-khi-báo-xong + hoàn tất nhánh an toàn (KHUNG 2, Phần A).
  **GitNexus bị loại** vì license PolyForm Noncommercial 1.0.0 xung đột với việc dự án đã thu phí
  Pro/VIP qua SePay — không đưa vào quy trình chính thức của repo.

- **[2026-07-31] Mở rộng thành nền tảng đa lĩnh vực — ĐÃ CHỐT.** Xem mục "Tiếp theo" ở trên +
  `docs/adr/0001-nen-tang-da-linh-vuc.md` (nguồn sự thật, đừng chép lại chi tiết ra đây kẻo lệch
  khi ADR được bổ sung sau này).

- **Bảng xếp hạng (LeagueSection trong `/challenge`) TẠM TẮT (2026-07-27).** Lý do: ở quy mô
  ít người dùng, bảng gần trống/chỉ vài người khiến người mới thấy app "vắng vẻ" và bỏ đi —
  phản tác dụng với mục tiêu giữ chân. Làm thành **cầu dao trong `app_settings`**
  (`leaderboardEnabled`, migration `0018_leaderboard_toggle.sql`) thay vì comment code, để admin
  tự bật lại qua `/admin-settings` KHÔNG cần deploy khi đủ đông người dùng hoạt động/tuần (đề
  xuất mốc tham khảo ~200). Component `LeagueSection.tsx` + `api/leaderboard.ts` giữ nguyên
  không xoá. Client đọc qua `isLeaderboardEnabled()` (`src/lib/appSettings.ts`), dùng ở
  `Challenge.tsx` giống cách `getLimits()` đã dùng (đọc trực tiếp lúc render, không qua context).
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

- **Thanh toán Pro: KHÔNG làm (2026-07-11)** → **[Cập nhật 2026-07-24]** người dùng chủ động
  yêu cầu chuẩn bị TRƯỚC phần hạ tầng kỹ thuật (hạn dùng gói + cấp Pro thủ công qua admin —
  xem mục "Đã xong"), **CHƯA quyết định giá/cổng thanh toán/có siết hạn mức Free hay không**.
  App vẫn miễn phí như cũ, chưa có trang giá nào hiển thị cho người dùng thường. Việc còn lại
  khi quyết định thu phí thật: chọn cổng (khuyến nghị Casso/SePay — chỉ cần tài khoản ngân
  hàng cá nhân, KHÔNG cần hộ kinh doanh/MST như PayOS), chốt mức giá, trang `/upgrade` +
  webhook thanh toán thật gọi `admin-grant-plan` (hoặc endpoint tương đương) tự động thay vì
  admin gõ tay.
- **Giá gói ĐÃ CHỐT LẦN CUỐI (2026-07-27, thay bảng giá nháp cùng ngày):** Pro **20.000đ/10
  ngày · 40.000đ/tháng · 360.000đ/năm**; VIP **30.000đ/10 ngày · 75.000đ/tháng · 500.000đ/năm**.
  Đây là giá NIÊM YẾT — **dịp lễ/Tết sẽ giảm thêm**, mức và thời điểm quyết định sau từng đợt.
- **M2 Thanh toán Pro/VIP qua SePay: CODE ĐÃ XONG (2026-07-27)** — thay PayOS (PayOS đòi tư
  cách hộ kinh doanh/MST, SePay chỉ cần tài khoản ngân hàng cá nhân). **SePay KHÁC PayOS về bản
  chất:** không phải cổng trung gian, không giữ tiền, không có `checkoutUrl`, không redirect —
  chỉ theo dõi tài khoản ngân hàng và bắn webhook khi tiền về. Đã triển khai đúng mô hình đó:
  - **Schema:** migration `0014_plan_prices.sql` (bảng `plan_prices` — 3 chu kỳ `10day`/`month`/
    `year`, có `sale_price_vnd`/`sale_until` cho khuyến mãi dịp lễ sau này, ĐỘC LẬP với
    `promoUntil` sẵn có trong `app_settings` — trường đó là hạn mức lượt dùng, khác hẳn giá bán)
    · `0015_payments.sql` (bảng `payments`, UNIQUE `payment_code` + UNIQUE `provider_txn_id`
    chống trùng webhook ở TẦNG DB).
  - **Lib thuần (test kỹ, không đụng DB):** `api/_lib/prices.ts` (đọc giá + cache 30s + tính giá
    hiệu lực khi có khuyến mãi) · `api/_lib/sepay.ts` (sinh mã `ENVI` + 8 ký tự tránh nhầm
    0/O/1/I/L, dựng URL ảnh QR không gọi API ngoài, dò mã trong nội dung chuyển khoản không
    phân biệt hoa/thường, xác thực API Key bằng `timingSafeEqual`).
  - **API:** `GET /api/plan-prices` (công khai) · `POST /api/checkout` (tạo đơn, tự sinh mã, tự
    retry nếu trùng) · `POST /api/payment-webhook` (SePay gọi — chống trùng bằng
    `UPDATE ... WHERE status='pending'` + bắt lỗi `23505` cho ca hiếm hơn, kiểm tra đủ tiền mới
    cấp gói qua `grantPlanDays()` dùng chung, luôn trả `{"success":true}` khi đã xử lý xong để
    SePay không retry vô ích) · `GET /api/payment-status` (UI poll vì SePay không redirect) ·
    `GET /api/payment-history`.
  - **UI:** `UpgradeSection.tsx` trong `/profile` — chọn gói/chu kỳ → hiện QR + số tài khoản +
    nội dung chuyển khoản (nút sao chép) + đếm ngược 30 phút, tự poll tới khi `paid`. Ẩn hẳn nếu
    đã VIP.
  - **Test:** 40 test mới (unit thuần cho sepay/prices + handler-level cho 5 API), phủ đủ ca
    biên: sai khoá, tiền ra không liên quan, không khớp mã, thiếu tiền, webhook lặp, 2 webhook
    song song, UNIQUE violation, đúng số ngày theo từng chu kỳ.
  - **Còn lại là VIỆC TAY** (không phải code): đăng ký SePay + liên kết ngân hàng, điền
    `SEPAY_WEBHOOK_API_KEY`/`SEPAY_BANK_ACCOUNT`/`SEPAY_BANK_CODE` trên VPS, tạo webhook trỏ
    `/api/payment-webhook` + BẬT lọc tiền tố "ENVI", chạy `npm run migrate:pg` trước khi deploy,
    và nên chạy thử chuyển khoản thật số tiền nhỏ trước khi công bố rộng rãi.
  - Có đường xử lý tay cho ca người dùng gõ sai nội dung chuyển khoản (tiền vào nhưng không
    khớp đơn nào) — dùng `/api/admin-grant-plan` sẵn có, xem mục "Ca lệch" trong đặc tả.
  - Chi tiết đầy đủ: `docs/research/dac-ta-thanh-toan-2026-07-25.md`.
- **Đánh giá lại chi phí/hạn mức sau khi có giá bán thật (2026-07-27)** — phát hiện qua đọc
  code (không đoán): (1) `app_settings.promo_until` mặc định 2027-01-01 khiến `effectivePlan()`
  nâng MỌI gói lên 1 bậc — trong lúc bật, Pro/VIP nhận y hệt hạn mức + giọng, và Free được nâng
  lên hạn mức Pro. **Phải tắt khuyến mãi trong `/admin-settings` để giá bán mới có ý nghĩa.**
  (2) Giọng "Studio" ($24/1 triệu ký tự, KHÔNG có hạn mức miễn phí — đắt gấp 12 lần Chirp3-HD
  $2/1 triệu ký tự có 1 triệu miễn phí/tháng) đã **rút khỏi Pro, chỉ còn VIP**
  (`api/_lib/voiceAccess.ts`, `src/lib/voiceTiers.ts` — 2 nơi phải khớp tay, không share code
  api/↔src/). (3) Gói Free giới hạn còn 4 giọng (2 nữ Kore/Aoede + 2 nam Puck/Charon, đều đã
  seed sẵn nên phát ngay). Giá Google Cloud TTS xác nhận qua tài liệu thật, không suy đoán.
- **Hạn mức Pro/VIP đổi sang 1 số TỔNG lượt/ngày (2026-07-27, thay "5 số riêng theo chế độ")**
  — migration `0016_daily_total_limit.sql`: cột `app_settings.pro_daily_limit`/`vip_daily_limit`
  (mặc định Pro 30, VIP 300 — ĐÂY LÀ TỔNG, không nhân theo 5 chế độ) + hàm SQL
  `consume_usage_total` (SUM cả 5 cột `daily_usage` so với hạn mức, vẫn tăng đúng cột theo mode
  để giữ breakdown thống kê). Xoá 15 cột cũ (5 free đã CHẾT từ trước + 5 pro + 5 vip theo chế
  độ). `AdminLimitsPanel.tsx` viết lại: mỗi gói Pro/VIP chỉ còn 1 ô nhập, không còn hàng Free
  (Free không đọc `app_settings`, hiện ô đó chỉ gây hiểu nhầm).
- **Hạn mức Free đổi từ "tuần lịch" sang CỬA SỔ TRƯỢT 7 ngày liền kề thật (2026-07-27)** — quyết
  định chủ động để công bằng hơn với người học dồn cuối tuần (mô hình cũ 0012 reset cứng về 0
  mỗi thứ Hai, mất công tích luỹ nếu học nhiều vào thứ Bảy/Chủ nhật). Migration
  `0017_free_rolling_credit.sql`: bảng `free_daily_credit` (1 dòng/ngày/user, `bonus_earned` +
  `credits_spent`) + hàm `grant_daily_bonus_rolling`/`consume_rolling_credit`/
  `refund_rolling_credit` — "còn bao nhiêu lượt hôm nay" = tổng +5 nhận trong 7 ngày gần nhất
  trừ lượt đã dùng trong chính 7 ngày đó, trần tự nhiên vẫn 35 (không có cơ chế dồn bù ngày bỏ
  lỡ nên không cần cột cap riêng). `consume_rolling_credit` KHOÁ CÁC DÒNG trong cửa sổ bằng
  `SELECT ... FOR UPDATE` TRƯỚC rồi mới SUM (Postgres không cho `FOR UPDATE` cùng hàm gộp) —
  chống 2 request song song cùng đọc "còn lượt" rồi cùng trừ vượt quá số thật. Bảng
  `weekly_ai_credit` (0012) GIỮ NGUYÊN, không xoá — code đã ngừng đọc/ghi, dọn ở migration sau
  khi xác nhận mô hình mới chạy ổn trên production.
- **Giữ nguyên phiên bản:** Tailwind 3, ESLint 8 (`.eslintrc.cjs`) — không nâng v4/flat config.
- **Bundle-size budget (`size-limit`) thay Lighthouse CI** — Lighthouse không đo được trong môi
  trường sandbox/CI hiện có (`NO_FCP` ở mọi cấu hình). Cân nhắc lại nếu có runner thật sau này.
- **Zod validate input** đã rollout xong toàn bộ `api/*.ts` (đợt cuối `ai.ts`, dùng Zod v4).
- **Nhiều phiên làm việc có thể chạy song song** trên cùng repo — kiểm tra PR đang mở trên
  GitHub trước khi bắt đầu 1 kế hoạch lớn đã có sẵn trong `docs/research/`, tránh trùng công sức.
- **Gộp mọi script audio cache về 1 file `scripts/seed-all.ts` (2026-07-20, theo yêu cầu người
  dùng).** Trước đó có 3 script rời: `seed-all.ts` (seed nội dung), `sync-storage-to-r2.ts`
  (đẩy audio local → R2), `verify-r2-sync.ts` (đối chiếu R2 thật + xoá local an toàn). Đã gộp
  2 script sau vào `seed-all.ts` dưới dạng menu "s"/"v" (tương tác) hoặc cờ
  `--sync-r2`/`--verify-r2` (CI/cron) — xóa hẳn 2 file cũ + 2 dòng `package.json`
  (`sync:r2`/`verify:r2`). Không đổi logic bên trong (copy nguyên hàm, chỉ đổi tên biến/hàm
  tránh trùng namespace) — chưa tự chạy được trong sandbox này (không cài `node_modules`) nên
  CHỈ xác nhận bằng: không trùng định danh (grep), ngoặc cân bằng toàn file, và `prettier
--write` parse thành công không lỗi cú pháp. Cập nhật `docs/seed-guide.md` mục 5+7 +
  `docs/migration-thoat-ly-supabase.md` bước 7 theo lệnh mới. **Việc người dùng cần làm:** SSH
  VPS, `git pull`, thử `STORAGE_DRIVER=r2 npm run seed:all -- --sync-r2 --dry-run` xác nhận
  chạy đúng trước khi tin tưởng hoàn toàn (chưa test bằng máy thật).

- **Đợt tối ưu `scripts/seed-all.ts` — remap/verify/dọn orphan (2026-07-23→24, PR #308–#315,
  đã merge hết).** Từ thực tế chạy thật trên VPS (bảng `tts_cache` phình tới ~1,25 triệu dòng
  sau đợt mở rộng 14 giọng Chirp3-HD), phát hiện + sửa liền một mạch:
  - #308: `verifyDb()` từng coi câu pattern hợp lệ (đúng giọng/version, chỉ đơn giản ngoài
    top-N `seed-index.json`) là "orphan" → xoá nhầm cache còn dùng được; remap-only ("m")
    trước đó chỉ quét top-N nên cache giọng cũ của các câu ngoài top-N không bao giờ được
    remap. Sửa: bảo vệ hash pattern hợp lệ khỏi bị tính orphan + remap-only quét ĐỦ 100/100
    câu/chủ thể (remap không tốn API nên quét hết không sao) — seed thật (tốn phí) vẫn giữ
    nguyên top-N (mặc định 20/100, `TOP_N` khi chạy `npm run rank:patterns`).
  - #310: nhánh remap gọi `verifyDb()` quét lặp lại 2 lần tập hash pattern đầy đủ (~1,6
    triệu) → OOM. Thêm cờ `patternsAreFull` để bỏ bước quét dư thừa.
  - #311: log Postgres xác nhận VPS bị **restart ngoài ý muốn** (nghi cập nhật hệ điều hành
    tự động) giữa lúc script chạy hàng giờ → lỗi `57P01` làm crash toàn bộ tiến trình. Thêm
    `withDbRetry()` (backoff 1s/3s/8s) cho các vòng đọc/xoá dài.
  - #312: `cleanOrphans()` chạy im lặng suốt vòng xoá (có thể hàng trăm nghìn dòng) — thêm
    progress bar (`cli-progress`).
  - #313: vòng xoá orphan vốn TUẦN TỰ (1 dòng/lần, mỗi dòng 1 round-trip network) — đổi
    sang chạy song song có giới hạn (`DELETE_CONCURRENCY = 12`, khớp pool DB `max: 10`).
  - #314: `getR2Client()` tạo `S3Client` MỚI mỗi lần gọi (rò rỉ handle/socket) — cache lại 1
    instance dùng chung, sửa OOM khi xoá nhiều orphan liên tục.
  - #315: `fetchAllRows()` dùng LIMIT/OFFSET — mỗi trang phải quét & bỏ qua toàn bộ dòng
    trước đó (O(n²)), ở bảng >1 triệu dòng thành "treo" thật sự. Đổi sang **keyset
    pagination** (`where (khóa) > khóa_cuối`, dùng index). Đồng thời `verifyDb()` từng gom
    CẢ bảng `tts_cache` (kèm `audio_url`) vào 1 mảng trong RAM cùng lúc với nhiều Set lớn —
    đổi sang **stream từng trang** (`streamRows()`), bỏ hẳn mảng đầy đủ.
  - Kết quả người dùng xác nhận: hết treo, hết OOM, tốc độ xoá orphan "cải thiện rất nhanh".

## Sự cố hạ tầng đã xử lý (post-mortem ngắn)

- 🟢 **[2026-08-30 16:20 UTC → 2026-09-02 ~03:00 UTC, ĐÃ XỬ LÝ] VPS mất kết nối outbound tới
  GitHub — auto-deploy fail liên tục ~34 giờ, production đứng ở code cũ.**

  **Phát hiện:** kiểm tra thủ công workflow `Deploy to VPS` (`.github/workflows/deploy.yml`)
  thấy **toàn bộ ≥30 lần chạy liên tiếp** đều `failure`/`cancelled` kể từ lần thành công gần
  nhất (`2026-08-30T16:20:50Z`) — bao gồm cả lần chạy ngay sau khi merge PR #807. App (`pm2`/
  `/api/health`) không bị ảnh hưởng vì runtime không cần gọi GitHub — chỉ đường **deploy** đứt.

  **Log lỗi thấy được (2 dạng xen kẽ, cùng gốc mạng phía VPS):**
  - `dial tcp <VPS_IP>:22: i/o timeout` — Actions không SSH vào được VPS.
  - `fatal: unable to access 'https://github.com/...': Failed to connect to github.com port 443
... Couldn't connect to server` — SSH vào được nhưng VPS không ra được Internet để
    `git fetch`.

  **Nguyên nhân gốc:** sự cố mạng phía **nhà cung cấp VPS** (không phải do cấu hình DNS/
  firewall/iptables trên VPS — đã loại trừ qua checklist chẩn đoán SSH). Tự phục hồi/được xử lý
  ở tầng hạ tầng, không cần đổi code hay cấu hình trong repo.

  **Xác minh đã khôi phục:** run deploy `33584562143` (commit `4551ba6c` = PR #807) chuyển từ
  `failure` sang `success` sau khi người dùng chạy lại; các lần deploy kế tiếp lên xanh bình
  thường.

  **Bài học:** `deploy.yml` hiện KHÔNG có cảnh báo khi fail liên tiếp nhiều lần — sự cố này bị
  phát hiện muộn (thủ công, không phải qua thông báo tự động). Cân nhắc thêm bước báo (ví dụ
  comment/issue tự động) khi 2-3 lần deploy liên tiếp fail, để không phải chờ ai đó chủ động rà
  Actions mới biết production bị "đứng" so với `main`. Chưa làm — để mở nếu thấy cần.

## Nợ kỹ thuật còn mở

> Mục này CHỈ giữ nợ **đang mở** (🟡/🔴). Nợ đã đóng (🟢) được dời sang
> `docs/legacy/no-ky-thuat-da-dong.md` (2026-09-01) để file này chỉ nói trạng thái hiện tại —
> đúng vai trò ở mục 2 `CLAUDE.md`. Đóng một món nợ = cắt khối đó dán sang file kia, kèm ngày.

- 🟡 **[2026-08-28 — rà UI/UX 5 trang trụ cột, xem `docs/changelog/0186-*.md`] Ba việc còn để
  ngỏ, cần người dùng quyết hoặc tách đợt riêng.**

  1. ~~**`Career.tsx` vẫn hỏi "Số năm kinh nghiệm"**~~ — ✅ **ĐÓNG 2026-09-03, người dùng chốt
     "giữ nguyên mọi thứ, thang bậc 5".** Mô tả cũ ("hai thước đo mâu thuẫn sống song song") là
     **SAI** — đã đọc lại code: `<Field label="Số năm kinh nghiệm">` (dòng 662) là trường của
     **HỒ SƠ**, một con số cho cả người; còn `PROFICIENCY_BAND_LABELS` hiện dưới nhãn "Bạn đang
     ở bậc:" (dòng 534) gắn với **TỪNG KỸ NĂNG**. Hai thứ đo hai cấp khác nhau nên **bổ sung
     nhau, không mâu thuẫn**. Giữ nguyên cả hai, không đổi một dòng mã nào.
  2. ~~**`Work.tsx`/`Life.tsx` đặt `<Layout>` ở CUỐI JSX** (Career/Startup đặt ở đầu)~~ — ✅
     **KHÔNG CÒN, đo lại 2026-09-03:** cả bốn file nay đều đặt `<Layout>` ở CUỐI, đã nhất quán
     (Career 966/970 · Startup 973/977 · Work 997/1001 · Life 992/996 — dòng/tổng dòng).
  3. ~~**`components/FeedbackModal.tsx` thiếu Escape + bẫy tiêu điểm**~~ — ✅ **ĐÃ XONG, đo lại
     2026-09-03:** file nay dùng hook `useDialogBehavior` (đủ 6 hành vi hộp thoại: Escape, bẫy
     tiêu điểm, trả tiêu điểm khi đóng, khoá cuộn nền…), giữ nguyên bố cục riêng đúng như lo
     ngại ban đầu. Hook đó trước đây **không có test nào**; PR đợt này bổ sung 11 test canh cả
     6 hành vi (`useDialogBehavior.test.tsx`) — xem `docs/changelog/0254-*.md`.

  Ngoài ra: **4 trang trụ Career/Work/Startup/Life vẫn chưa có bản chiều B** (0/4 file dùng
  `direction`, toàn bộ chuỗi hardcode tiếng Việt) — cùng loại nợ với mục ngay dưới đây.

- 🟡 **[2026-08-26 — NỢ CÓ CHỦ ĐÍCH, người dùng chốt; TRẢ XONG PHẦN GIAO DIỆN 2026-09-05] Hai
  tính năng mới CHƯA có bản chiều B** (người nước ngoài học tiếng Việt). Người dùng xác nhận:
  "chiều A là ok rồi, chiều B nợ".

  **Trạng thái nay: CẢ HAI tính năng đã chạy được ở chiều B** ("Người thân theo dõi" 2026-09-03,
  "Chế độ ôn thi" 2026-09-05). Phần còn mở KHÔNG còn là việc dịch giao diện nữa mà là **việc
  NỘI DUNG**: bộ từ vựng tiếng Việt phân bậc cho phạm vi ôn thi `vsl-b1` (chi tiết ngay dưới).

  **[2026-09-03] "Người thân theo dõi" — ĐÃ TRẢ XONG.** Khối `CompanionLinkSection.tsx` nay nhận
  prop `isA` (như `ReferralSection`) và render đủ ở cả hai chiều — bỏ điều kiện `{isA && ...}` ở
  `Profile.tsx`. Nội dung thư (`weeklyReport.ts`) viết hoàn toàn bằng tiếng Anh ở chiều B (mở đầu/
  câu hỏi gợi ý theo cấp/dòng số liệu/footer riêng biệt, không trộn ngôn ngữ) — `direction` đọc
  từ `learning_progress.settings` qua `weeklyReportService.parseDirection()` (server-side, cùng
  nguồn `packages/core-learner/learnerState.ts` dùng ở client), thêm vào
  `WeeklyReportDataSchema` với `.default('A')` để dữ liệu/test cũ không cần đổi. Cổng
  `e2e/a11y-companion-link.spec.ts` đã nới thêm 2 theme + 1 vòng AAA ở `direction='B'`.

  **[2026-09-05] "Chế độ ôn thi" — ĐÃ TRẢ XONG phần giao diện + kỳ thi.** `ExamPlan.tsx` nay song
  ngữ trọn vẹn theo khuôn `isA ? 'vi' : 'en'` (giống `CompanionLinkSection`), `ExamKindSchema` mở
  thêm `vsl-b1` (chứng chỉ tiếng Việt bậc 3 theo Khung năng lực tiếng Việt cho người nước ngoài,
  Thông tư 17/2015) và `examKindForDirection()` chọn kỳ thi theo chiều học. Không cần migration:
  cột `exam_kind` là `text` không có ràng buộc CHECK. Cổng `e2e/a11y-exam-plan.spec.ts` nới thêm
  2 theme × 2 màn hình + 1 vòng AAA ở `direction='B'`, **cộng một test bất biến mới**: quét toàn
  bộ `main` ở chiều B và bắt đỏ nếu lọt bất kỳ ký tự có dấu tiếng Việt nào. 17/17 test xanh.

  **GIỚI HẠN CÒN LẠI, cố ý và NÓI THẲNG trên giao diện** (người dùng không có ưu tiên khi được
  hỏi, nên chọn phương án ship được ngay): phạm vi ôn của `vsl-b1` dùng lại chính bộ cặp từ
  A1–B1 sẵn có, học ngược chiều Việt → Anh, vì repo **chưa có bộ từ vựng tiếng Việt phân bậc**.
  Bậc hiển thị vì vậy là bậc CEFR của phía tiếng Anh, không phải bậc tiếng Việt thật — trang
  `/on-thi` in rõ điều này cho người học ở khối "Scope note", không giấu. Ghi chú giới hạn cũng
  nằm ngay trên `ExamKindSchema`.

  **Việc còn lại (đợt NỘI DUNG riêng, chưa lên lịch):** soạn bộ từ vựng tiếng Việt phân bậc theo
  Khung năng lực tiếng Việt cho người nước ngoài rồi thay vào phạm vi của `vsl-b1`. Đây là việc
  soạn nội dung vài nghìn mục cần nguồn tham chiếu, không phải việc sửa mã — nên tách hẳn, và
  cần một đặc tả riêng trước khi bắt đầu.

- 🟡 **[2026-08-26 — HẠ MỨC sau khi chẩn đoán; ban đầu ghi 🔴 là ĐÁNH GIÁ QUÁ NẶNG] Redis rớt
  kết nối 7 lần/ngày, mỗi lần DƯỚI MỘT GIÂY.** `pm2 logs dhcb --err` cho thấy 7 cặp log
  (00:03 · 00:27 · 02:50 · 03:41 · 04:37 · 05:28 · 08:03), mỗi cặp là "Redis lỗi (Stream isn't
  writeable…)" rồi "Redis đã hoạt động trở lại".

  **Vì sao hạ từ 🔴 xuống 🟡:** hai dòng của mỗi cặp có **CÙNG dấu thời gian đến giây**
  (`00:03:51` cho cả hai). Gián đoạn dưới 1 giây, 7 lần/ngày ⇒ cửa sổ rate limit lỏng chỉ vài
  mili giây, không ai khai thác được. Lần ghi đầu gắn 🔴 dựa trên giả định ngầm rằng gián đoạn
  kéo dài — **không kiểm dấu thời gian trước khi gắn nhãn**. Ghi lại lỗi suy luận này vì nó
  đúng loại sai mà quy trình audit sinh ra để bắt.

  **BỐN giả thuyết đã bị bác bỏ bằng số đo thật — đừng đi lại đường cũ:**

  | Giả thuyết                 | Số đo                                          | Kết luận                            |
  | -------------------------- | ---------------------------------------------- | ----------------------------------- |
  | Redis đóng client nhàn rỗi | `timeout 0`                                    | ❌ Redis không bao giờ đóng vì idle |
  | Redis bị khởi động lại     | `uptime_in_seconds: 232420` (2,7 ngày)         | ❌ không restart                    |
  | Chạm `maxclients`          | `rejected_connections: 0`, `maxclients: 10000` | ❌                                  |
  | `REDIS_URL` sai định dạng  | có dấu hai chấm, đúng chuẩn `redis://:pass@`   | ❌                                  |
  | Trùng job cron             | cron chạy 3:05/3:10/3:15 + 0:00/12:00          | ❌ chỉ 1/7 mốc gần trùng            |

  **Manh mối còn lại, chưa đủ kết luận:** `connected_clients: 2` trong khi có 3 instance PM2
  (kết nối tạo lazy nên có thể chỉ phản ánh lúc vừa reload); và khoảng cách giữa các lần rớt có
  nhịp 51 → 56 → 51 phút không thuộc cron nào.

  **Mốc theo dõi, KHÔNG vá vội:** VPS mới có swap từ 2026-08-26. Giả thuyết còn sống là máy bị
  áp lực bộ nhớ khiến tiến trình đình trệ, không đáp TCP keepalive (`tcp-keepalive 300`) nên
  Redis ngắt. Nếu vậy thì swap đã xử lý gián tiếp. **Đọc lại `pm2 logs dhcb --err` sau vài
  ngày:** còn đúng ~7 lần/ngày ⇒ nguyên nhân nằm chỗ khác, đào tiếp; giảm hẳn ⇒ đóng nợ.

  **Nếu phải vá:** KHÔNG đảo `enableOfflineQueue: false` (đặt có chủ đích để rate limit không
  treo request khi Redis chết). Ứng viên hợp lý là nới `connectTimeout` (đang 2000ms) — nhưng
  chỉ khi có bằng chứng, không theo linh cảm.

- 🟡 **[ĐO LẠI 2026-08-26 — nợ này ĐÃ THU HẸP, không còn đúng như mô tả cũ] Chỉ COVERAGE còn
  mỏng; ngân sách BUNDLE nay rộng.**

  **[Đo lại 2026-09-01, đợt tối ưu dự án]** Trước đợt: JS 127,36 / 140 kB · CSS **17,00 / 18 kB
  (còn đúng 1 kB — PR #797 thêm keyframes/utility)** · branches **90,19%** (còn 0,19 điểm).
  Sau đợt: JS 127,26 kB (chunk `lessons` 3 MB của môn Lập trình đã tách thành 153 chunk theo
  unit, nạp lười; `programmingRoutes` 48 kB gzip → 0,5 kB) · branches **90,67%** (còn 0,67 điểm) nhờ test
  `progressSync.ts` (74 → 92%) + `co-learning-audio.ts`. CSS KHÔNG đổi — vẫn là biên độ mỏng nhất, thêm animation/theme
  mới là phải rà `tailwind.config.js` trước. Chạy `npm run budget` để xem số hiện tại. Số đo thật hôm nay trên `main` (chạy `npm ci` sạch rồi
  `npm run build`):

  | Ngân sách            | Số thật   | Ngưỡng | Biên độ          |
  | -------------------- | --------- | ------ | ---------------- |
  | Initial JS (brotli)  | 124,83 kB | 140 kB | dư **~10,8%**    |
  | Initial CSS (brotli) | 16,23 kB  | 18 kB  | dư **~9,8%**     |
  | Coverage branches    | 90,54%    | 90%    | dư **0,54 điểm** |

  **[Đo lại 2026-09-02] CSS đã hết mỏng — NỚI ngưỡng 18→20 kB, phần bundle của nợ này ĐÓNG.**
  Rà lại: `dist/assets/index-*.css` đã qua Tailwind v3 JIT purge đúng (không safelist thừa,
  không class chết) — không có "rác" thật để cắt mà không đụng nhiều file UI (đổi số class dùng
  trong component, rủi ro phá giao diện). Ngưỡng 18 kB là tự đặt, không phải giới hạn kỹ thuật,
  nên chọn nới thay vì cắt CSS đang dùng. Sửa `.size-limit.json` (CSS 18→20 kB). Số đo lại trên
  `main` sau khi sửa (`npm ci && npm run build && npm run budget`):

  | Ngân sách            | Số thật   | Ngưỡng | Biên độ      |
  | -------------------- | --------- | ------ | ------------ |
  | Initial JS (brotli)  | 127,26 kB | 140 kB | dư **~9,1%** |
  | Initial CSS (brotli) | 17,00 kB  | 20 kB  | dư **~15%**  |

  **[Đo lại 2026-09-05, audit toàn diện F10] CSS lại mỏng đi: 18,03 / 20 kB — chỉ còn ~1,97 kB
  (dư ~9,9%), tức đã ăn hết một nửa phần vừa nới ngày 02/09.** JS 128,44 / 140 kB (dư ~8,3%).
  Không nới thêm lần nữa: nới hai lần liên tiếp là biến ngân sách thành thứ chạy theo số đo. Thêm
  animation/theme mới thì rà `tailwind.config.js` TRƯỚC, và chạy `npm run budget` để xem số hiện tại.

  Coverage branches vẫn mỏng — **nhưng biên độ đó nay là CHẤP NHẬN ĐƯỢC theo quyết định người
  dùng (2026-09-03: "cover 90%")**. Số hiện tại 90,70% trên sàn 90 = dư 0,70 điểm. **KHÔNG nâng
  ngưỡng, và KHÔNG chạy đợt viết test chỉ để đẩy con số.** Phiên sau đọc cảnh báo của
  `npm run budget` ("biên độ hẹp") thì đừng tự ý "sửa" — đó là trạng thái đã chốt, không phải
  việc bỏ sót. Điều VẪN đúng: tính năng mới phải tự mang test cho nhánh logic của nó, nếu không
  cổng coverage sẽ đỏ.

  **[Đo lại 2026-08-27, sau PR-M7]** Ba con số trên là bản mới nhất. Đợt PR-M7 là ca thực tế
  đầu tiên nợ này bật ra: bộ chạy Kotlin (~4.000 dòng nguồn) làm branches tụt xuống **88,75%**
  — CI sẽ đỏ. Đã trả bằng cách **viết thêm test chứ không nâng ngưỡng** (hai file mới phủ bề
  mặt thư viện và đường lỗi), kéo lên 90,29%. Bài học: PR nào thêm một khối mã lớn thì phải
  **đo coverage TRƯỚC khi mở PR**, đừng đợi CI báo.

  **Phần bundle của nợ này coi như đóng.** Con số "99,7%" ghi ngày 2026-08-25 đã lạc hậu: ngưỡng
  JS được nới 123 → 140 kB và CSS 16 → 18 kB ở các PR sau đó, mà mục nợ không ai cập nhật. Đây
  đúng loại lệch mà Tầng 6b của quy trình audit sinh ra để bắt — tài liệu điều hành nói một
  đằng, số thật một nẻo — nên ghi lại để lần sau đo trước khi tin.

  **[Đo lại 2026-08-28] Phần coverage đã NỚI GẤP ĐÔI, chưa đóng.** Biên độ branches từ 0,27 lên
  **0,54 điểm** (90,27 → 90,54%) nhờ 90 test bù cho `kotlinSim`/`swiftSim`/`mistakes.ts` —
  xem `docs/changelog/0187-2026-08-28-super-kotlin-va-bien-do-coverage.md`. Đợt đó cũng bắt ra
  một lỗi thật nhờ đi tìm nhánh thiếu test (`super.f()` gọi vòng vô tận làm sập bộ chạy Kotlin),
  tức bản thân việc vá coverage có giá trị chứ không chỉ là làm đẹp con số. Vẫn còn mỏng: nửa
  điểm là đủ để một PR thêm khối mã lớn mà quên test làm CI đỏ.

  **[Đo lại 2026-09-05, PR #856 — phần coverage của nợ này coi như ĐÓNG.]** Sau đợt bổ sung
  test cho 33 file logic thuần, GỘP với PR #855 (542 test nhắm 18 file phủ thấp nhất) chạy
  song song: stmts **98,32%** · branches **94,53%** · funcs **97,69%** · lines **98,32%**
  (573/573 file test xanh). Sàn siết lên 97/93/96/97, biên độ branches nay **1,53 điểm** —
  gần gấp ba mức 0,54 ghi ở trên, đủ chỗ cho một PR thêm khối mã lớn. Đợt này cũng bắt ra một lỗi thật nữa (id trùng do `Date.now()` ở
  `memoryPalaceService.ts` làm API trả 404 sai) — lần thứ hai liên tiếp việc vá coverage lòi
  ra bug thật chứ không chỉ làm đẹp con số. Đợt này còn bắt thêm một cái bẫy đáng nhớ: một
  test của chính đợt đã **khoá hành vi LỖI làm chuẩn** (`find /` chỉ trả về `/`), chỉ lộ ra
  khi gộp với PR #855 vốn đã vá đúng lỗi đó. Bài học ghi lại trong changelog 0269: "nhánh
  không chạm tới được" KHÔNG đồng nghĩa "nhánh đúng".

  **Không đóng hẳn được ở mức 100%, và đây là kết luận có chủ đích, không phải việc bỏ dở.**
  Phần chưa phủ còn lại là (a) nhánh phòng thủ chết do `noUncheckedIndexedAccess` bắt viết,
  (b) vỏ bọc WebSocket/mạng sống thuộc phạm vi E2E. Danh sách mã chết cụ thể theo từng
  file:dòng nằm ở `docs/changelog/0269-2026-09-05-nang-coverage-33-file-logic-thuan.md`.

  **[ĐÃ QUYẾT 2026-09-05 — đợt mã chết, changelog 0270] Xong, không còn treo.** Đo lại thì
  danh sách cũ đã lỗi thời (một số mục nay đã được phủ sau PR #855); còn đúng 31 nhánh, soát
  từng dòng: **xoá 3** (nhánh "đường dẫn tương đối" của `bashSim.chuanHoa` + cặp tham số
  `tachDuoc`/`globDuoc` luôn bằng nhau của `noTu.them` — cả hai vừa chết vừa gây hiểu nhầm),
  **giữ 28** vì chúng hoặc là giá trị mặc định do `noUncheckedIndexedAccess` bắt viết (xoá
  thì phải thay bằng `!`, đi lùi), hoặc là chốt chặn trạng thái hỏng chống vòng lặp vô hạn.

  **[Đo lại 2026-08-31, sau loạt "thiết kế lại web cho desktop" PR #743/#750/#756] Bundle ăn
  bớt biên độ, coverage chưa đo lại.** `npm run build && npm run budget` trên `main` sau khi cả
  3 PR merge:

  | Ngân sách            | Số thật   | Ngưỡng | Biên độ      |
  | -------------------- | --------- | ------ | ------------ |
  | Initial JS (brotli)  | 126,60 kB | 140 kB | dư **~9,6%** |
  | Initial CSS (brotli) | 16,53 kB  | 18 kB  | dư **~8,2%** |

  So với lượt đo 2026-08-28 (JS dư ~10,8%, CSS dư ~9,8%), cả hai đều hẹp lại — sidebar desktop
  thu gọn được + cột "Sửa lỗi & giải thích" ở Chat + `useIsDesktopViewport` là phần thêm mới ăn
  vào biên độ. Vẫn còn dư, không chặn CI, nhưng CSS chỉ còn dư dưới 10% — PR sau thêm CSS diện
  rộng (nhiều `lg:`/`xl:` mới) nên đo `npm run budget` TRƯỚC khi mở PR, đừng đợi CI báo. Chưa
  chạy lại `npm run test:coverage` trong đợt này (đổi UI, không đổi nhánh logic mới).

  **Đo lại bất cứ lúc nào:** `npm run build && npm run test:coverage && npm run budget`
  (`scripts/check-budget-margin.ts`, thêm ở PR #664 — in biên độ còn lại thành số, cảnh báo khi
  bundle ≥95% ngân sách hoặc coverage dư <1 điểm).

  **Điều kiện gỡ nợ — chọn một, KHÔNG lặng lẽ nâng ngưỡng:** (a) giảm bundle thật
  (code-splitting thêm, bỏ dependency eager) và bổ sung test cho các file nhánh phủ thấp
  (`geminiLiveService.ts` 14 nhánh thiếu · `co-learning-audio.ts` 12 · `neuroAffectiveService.ts`
  8 · `redisChat.ts` 8); hoặc (b) nâng ngưỡng CÓ CHỦ ĐÍCH kèm lý do ghi vào chính mục này.

  **[2026-09-04] (b) đã chọn — người dùng yêu cầu rõ "nâng coverage lên 100%", ghi đè quyết
  định "KHÔNG nâng ngưỡng" ở trên (2026-09-03).** Phương án chọn: nâng sàn CI dần dần (không
  viết test bổ sung ồ ạt cho toàn repo — khối lượng quá lớn một đợt). Trước khi đo được số
  thật, `npm run test:coverage` không chạy trọn trên Windows vì 3 lỗi cùng lớp nguyên nhân với
  PR #794 (so đường dẫn `\` vs `/`, encoding console) — đã vá cả ba (xem
  `docs/changelog/0267-2026-09-04-siet-san-coverage-va-va-3-loi-windows.md`). Số đo thật sau vá:
  stmts 96,36% · branches 90,71% · funcs 95,19% · lines 96,36%. Ngưỡng `vitest.config.ts` nâng
  thành statements 95 · branches 90 (giữ nguyên, biên độ mỏng nhất) · functions 94 · lines 95.
  Branches vẫn là chỉ số cần vá tiếp — file nhánh phủ thấp liệt kê ở trên chưa đổi.

  **[2026-09-05] ĐỢT 2 — trả đúng chỗ mỏng bằng TEST, không phải bằng cách nâng ngưỡng suông.**
  Đo `coverage-final.json` để biết chính xác nhánh nào chưa đi, xếp hạng ra 18 file gom 586/1.461
  nhánh chưa đi của cả repo (40%), giao 8 subagent song song viết **542 test mới** (11.160 →
  11.702). Không sửa một dòng mã nguồn nào. Số đo thật sau đợt: **stmts 97,00 · branches 94,06 ·
  funcs 95,95 · lines 97,00**; sàn nâng thành **96 / 93 / 95 / 96** (vẫn chừa ~1 điểm biên độ).
  Chi tiết từng file + giải trình nhánh còn trống:
  `docs/changelog/0268-2026-09-05-coverage-dot-2-nhanh-chua-phu.md`.

  **Điều quan trọng nhất rút ra: 100% branch KHÔNG đạt được bằng test hợp lệ.** Gần như toàn bộ
  nhánh còn trống sau đợt này là fallback `?? ''`/`?? null`/`?? 0` sinh ra do
  `noUncheckedIndexedAccess` mà vế phải không thể chạy (bất biến nơi gọi bảo đảm vế trái luôn có
  giá trị), cộng vài `throw e` lưới an toàn cho lỗi lập trình. Muốn chạm 100% phải viết test giả
  tạo hoặc dọn mã phòng thủ — cả hai đắt hơn giá trị thu được. **Phiên sau đừng đặt mục tiêu
  100%**; muốn siết tiếp thì nhắm nhóm phủ thấp kế tiếp (`core-personal/*`, `core-domains/*`,
  `api/domains/*`), và biết trước rằng chỗ dễ đã hết.

  **Ba nghi bug phát hiện khi viết test — ĐÃ SỬA XONG 2026-09-05 (nhánh
  `fix/ba-loi-bo-chay-bash-kotlin`, xem `docs/changelog/0269-2026-09-05-sua-ba-loi-bo-chay-bash-kotlin.md`),
  mỗi lỗi có test canh riêng:**
  (1) `packages/subject-programming/bashSim.ts` — `find /` **bỏ sót TOÀN BỘ nội dung**: bộ lọc
  `k.startsWith(pGoc + '/')` với `pGoc === '/'` ghép ra tiền tố `'//'`, không khoá nào khớp nên
  lệnh im lặng trả về đúng một dòng `/`. Chẩn đoán ban đầu ghi ở đây ("cắt lệch 1 ký tự") CHƯA
  ĐÚNG HẲN — lỗi cắt có thật nhưng nằm SAU bộ lọc nên chưa bao giờ kịp lộ ra. Sửa bằng một biến
  `tienTo` dùng chung cho cả bước lọc lẫn bước cắt;
  (2) `kotlinSim` `associateWith` không khử trùng khoá → gộp theo khoá, giá trị lần cuối thắng;
  (3) `kotlinSim` `println` bỏ qua `override fun toString()` → thêm `chuoiHoa()` (chuỗi hoá để in,
  đệ quy qua List/Map/Pair), dùng cho cả `println`/`print` lẫn nội suy `"$x"`. Xác nhận đây là
  LỖI chứ không phải khác biệt cố ý: không mục nào trong `KHAC_BIET` nói tới nó.

  **Bài học ghi lại để đừng lặp:** nghi bug suy ra từ ĐỌC MÃ phải chạy thử trước khi tin. Lỗi (1)
  bị mô tả sai ở trên vì suy từ công thức `slice()` mà không chạy `find /` một lần — chạy thử mất
  mười giây và cho ra triệu chứng khác hẳn, nặng hơn, ở một dòng khác.

- 🟡 **[2026-08-25] Tầng 8 (Core Web Vitals) và Tầng 9 (vận hành production) CHƯA kiểm được
  trong lượt audit toàn diện 2026-08-25.** Proxy của container chặn
  `en-vi.donghanhcungban.org` (403 CONNECT tunnel). Hai tầng này được ghi **TRỐNG**, không chấm
  đạt — một lượt audit thiếu 2/13 tầng thì không được coi là đã phủ hết.

  **Điều kiện gỡ nợ:** từ máy có mạng tới server — chạy Lighthouse trên trang chủ + Dictionary +
  1 trang CEFR (ngân sách LCP ≤ 2,5s · INP ≤ 200ms · CLS ≤ 0,1), và đọc Sentry (lỗi mới chưa
  xem xét) + `pm2 logs`/số lần restart + dung lượng ổ đĩa.

- 🟡 **[2026-08-26] Dải nhiễu của eval rộng hơn mức một PR có thể phân biệt được.** Hai lượt
  chạy liên tiếp, cùng prompt · model · bộ đề · `--delay`, cách nhau vài phút: FP-rate 0% →
  5,6%, specificity 100% → 94,4%, Type-hit 86,0% → 76,7%. Chỉ MỘT câu đổi phán đoán
  (`edge-05`: TN → FP) đã làm FP-rate nhảy 5,6 điểm, vì mẫu số chỉ có 18 câu đúng/ca biên.

  Hệ quả: luật "recall/precision không được tụt" ở `CLAUDE.md` mục 8 hiện **không phân biệt
  được** một prompt tệ đi 5 điểm với nhiễu lấy mẫu — cả hai trông giống hệt nhau. Dải nhiễu và
  cách đọc đã ghi vào cuối `docs/research/eval-tutor-baseline.md` (chênh ≤ 1 câu không phải
  bằng chứng; nghi ngờ thì chạy ≥ 3 lượt so trung bình; Type-hit không dùng pass/fail; chỉ số
  đáng tin nhất là recall theo từng nhóm lỗi).

  **Cách chữa thật** là mở rộng golden set — nhất là nhóm câu đúng/ca biên, hiện chỉ 18 câu —
  chứ không phải chạy đi chạy lại cùng 62 câu. Chưa làm vì cần soạn fixture mới có đối chiếu.

  **Rủi ro nếu để lâu:** Gemini là fallback THỨ 3 trong chat (sau Groq, Anthropic) — sự cố chỉ lộ
  ra khi cả hai provider chính cùng lúc gặp vấn đề, tức âm thầm mất một lớp dự phòng mà không ai
  biết cho tới khi cần đến nó.

- 🟡 **[2026-08-23] MÃ HOÁ DỮ LIỆU NGƯỜI DÙNG — ĐÃ BẬT cho dữ liệu MỚI; còn nợ dữ liệu CŨ.**
  _(Cập nhật cùng ngày: người dùng đảo quyết định — "phải mã hoá dữ liệu người dùng". Secret 2FA
  đã mã hoá thật ngay từ bản đầu, không có giai đoạn plaintext. Phần còn nợ là **viết lại dữ liệu
  CŨ đang có** — tên, email, tiến độ — vốn rủi ro cao vì đụng dữ liệu thật; và **người dùng vẫn
  cần chốt nơi cất khoá gốc**, hướng dẫn ở `docs/van-hanh-khoa-ma-hoa.md`.)_ Hạ tầng
  **đã dựng xong và có test** (`packages/core-config/userDataCrypto.ts`, 18 test: AES-256-GCM,
  khoá mỗi người suy ra bằng `HMAC(USER_DATA_MASTER_KEY, user_id)`, chuỗi tự mô tả
  `v<n>:<iv>:<cipher>`, IV luôn ngẫu nhiên, `keyVersion` sẵn từ bản đầu, `isEncryptedField()` cho
  phép chuyển đổi dần, `hashLookupValue()` cho cột cần tra cứu). **Nhưng CHƯA nối vào bất kỳ dữ
  liệu nào** — module hiện đang NGỦ, không chỗ nào gọi, không ảnh hưởng gì đang chạy.

  **Việc còn lại + câu hỏi chưa có đáp án — **cất khoá gốc `USER_DATA_MASTER_KEY` ở đâu?** Khoá phải nằm KHÁC chỗ với backup DB (cất chung thì mã hoá vô
  nghĩa: ai lấy được backup lấy luôn khoá), mà **mất khoá = mất vĩnh viễn toàn bộ dữ liệu đã mã
  hoá, không có đường khôi phục\*\*. Bật mã hoá khi chưa chốt chỗ cất khoá là tự tạo rủi ro mất dữ
  liệu lớn hơn rủi ro nó định phòng.

  **Điều kiện gỡ nợ:** người dùng chốt nơi cất + cách sao lưu khoá gốc. Xong việc đó thì làm theo
  thứ tự ở `docs/research/dac-ta-ma-hoa-du-lieu-va-2fa-2026-08-23.md` mục 6:
  **S-3 trước** (mã hoá dữ liệu MỚI — gần như miễn phí vì dữ liệu chưa tồn tại), **S-4 sau và
  cân nhắc kỹ** (mã hoá dữ liệu CŨ — đụng dữ liệu thật của người dùng đang hoạt động, rủi ro cao).

  **Rủi ro đang chấp nhận trong lúc ghi nợ:** bản dump PostgreSQL và file backup trên Cloudflare R2
  vẫn là **plaintext** — lộ khoá R2 là lộ dữ liệu người dùng. Đây là lý do món nợ này không nên để
  quá lâu. Giảm nhẹ tạm thời: siết quyền truy cập khoá R2 và rà lại ai đang giữ nó.

  **Hệ quả cần biết khi làm tiếp tính năng:** hồ sơ năng lực ẩn và câu trả lời tự do (câu 3–4 của
  luồng người mới) là dữ liệu tầng T2 — theo đặc tả thì phải mã hoá. Nếu làm **C1b-2** (màn 5 câu)
  trước khi gỡ nợ này, dữ liệu đó sẽ nằm plaintext. Hai lựa chọn khi tới đó: ① chấp nhận plaintext
  tạm rồi mã hoá sau (module đã sẵn, chỉ cần thêm 1 biến môi trường + viết lại dữ liệu), hoặc
  ② hoãn C1b-2, làm **S-1 (2FA TOTP)** trước — 2FA độc lập hoàn toàn với mã hoá và không bị chặn
  bởi câu hỏi khoá gốc.

- 🟡 **[2026-08-21] Gemini Live — đã thay code GIẢ bằng kết nối WebSocket THẬT, nhưng CHƯA test
  với API key thật.** Nhánh `claude/gemini-live-integration-xo175x` trước đó (commit `cf44362`
  "feat: implement horizon features and stress test suite") đã có sẵn một bộ khung lớn (~4100
  dòng: `packages/core-ai/geminiLiveService.ts`, `wsGeminiLiveHandler.ts`, `api/gemini-live.ts`,
  contract `packages/core-contracts/geminiLive.ts`, hook `apps/english/src/lib/geminiLiveApi.ts`,
  đã gắn vào `server.ts` chạy thật) — nhưng khi đọc kỹ, `geminiLiveService.ts` **không hề gọi API
  Gemini thật**: mỗi 20 audio chunk người dùng gửi lên, code chỉ **echo ngược chính audio đó** giả
  làm phản hồi AI. Đã sửa `packages/core-ai/geminiLiveService.ts` để **thật sự mở WebSocket** tới
  `wss://generativelanguage.googleapis.com/.../BidiGenerateContent` (đọc `docs/research/dac-ta-gemini-live-2026-08-21.md`
  để biết bối cảnh — chọn Phương án C: Live chỉ cho phần hội thoại, giữ pipeline STT/LLM/TTS cũ
  cho phần sửa lỗi 2 giọng). Đã verify: test đơn vị (mock `ws` qua `_setWebSocketFactoryForTests`,
  6/6 pass), `npm test` toàn bộ 5019/5019 pass, build/typecheck/lint xanh. **CHƯA verify được** với
  `GEMINI_API_KEY` thật (sandbox không có key) — trước khi dùng thật cần: (1) thêm
  `GEMINI_API_KEY` vào `.env`, (2) xác nhận model Live khả dụng qua `GEMINI_LIVE_MODEL` (mặc định
  `gemini-2.0-flash-exp`, Google hay đổi tên/khả dụng model Live), (3) thử 1 phiên thật qua
  `/ws/gemini-live`, (4) audit lại các file "V6.x/V7.0" khác cùng thời điểm với `cf44362` xem có
  scaffolding giả tương tự không (chưa rà — người dùng đã được báo, quyết định xử lý riêng sau).
