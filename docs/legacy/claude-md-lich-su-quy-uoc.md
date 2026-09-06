# Lịch sử quy ước & trạng thái cũ của `CLAUDE.md` (dời ngày 2026-09-06)

> `CLAUDE.md` được AI đọc TOÀN BỘ đầu mỗi phiên, nên nó chỉ nên chứa **luật hiện hành**. Phần
> giải thích lịch sử (vì sao có luật, PR nào đã dính lỗi gì) và bản mô tả trạng thái dài (đã có
> `PROGRESS.md` làm nguồn duy nhất) dời nguyên văn sang đây. Đọc khi muốn hiểu **vì sao** một
> luật tồn tại trước khi đề nghị đổi nó.

---

## A. Mục 3 cũ — "Cách quản lý dự án" (bản đầy đủ tới 2026-09-05)

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
  3. **Bật auto-merge (squash) ngay trong cùng nhịp với lệnh tạo PR; bật không được thì theo dõi
     và merge (squash) ngay khi CI xanh** — xem mục 11, và nhớ kiểm tiêu đề khớp quy ước TRƯỚC
     khi tạo PR (tiêu đề sai làm cổng `metadata` đỏ trong ~4 giây, đóng luôn cửa sổ auto-merge).
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

---

## B. Mục 11 cũ — "Quy ước Git" (bản đầy đủ, gồm lịch sử auto-merge PR #693/#709/#724/#726/#727)

## 11. Quy ước Git

Mỗi tính năng/sửa lỗi một nhánh riêng · commit nhỏ, mỗi commit một thay đổi logic · **conventional commits** (`feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`) · mọi merge vào nhánh chính qua pull request (kể cả làm một mình) · **không push thẳng nhánh chính**.

**LUÔN BẬT AUTO-MERGE CHO MỌI PR (quy ước người dùng chốt 2026-08-25, làm rõ 2026-08-26).**
**Trong CÙNG NHỊP với lệnh tạo PR** (không chờ, không kiểm gì xen giữa): **bỏ nháp nếu đang là
draft → bật auto-merge (squash)** — không hỏi lại. Điều này AN TOÀN vì nhánh `main` đã có branch
protection với required status check (`quality`, `e2e`, `metadata`): auto-merge chỉ merge khi CẢ
BA check xanh, check đỏ thì PR nằm nguyên đó.

**Bật auto-merge THẤT BẠI thì TỰ MERGE TAY, miễn là CI đã xanh (quy ước người dùng chốt
2026-08-28, thay cho luật cũ "báo lại người dùng chứ đừng tự merge tay").** Điều kiện đủ để merge
tay: đã xong TẤT CẢ việc được giao trong phiên, CI xanh cả ba check, và không xung đột. Đủ ba
điều đó thì merge (squash) NGAY, không hỏi lại — dù auto-merge có bật được hay không.

Vì sao đổi: auto-merge chỉ là cơ chế XẾP HÀNG CHỜ, nên GitHub từ chối nó ở CẢ HAI đầu — lúc CI
đang chạy ("unstable status") lẫn lúc CI đã xong ("already in clean status, merge directly").
Ở PR #724 nó không có nổi một cửa sổ để bật, khiến PR nằm chờ người dùng bấm tay dù mọi cổng đã
xanh — đúng thứ mà quy ước auto-merge sinh ra để tránh. Cái người dùng muốn là **CI xanh thì PR
vào `main`**, không phải **auto-merge phải được bật**; nên khi phương tiện hỏng thì đi thẳng tới
mục đích.

**[Đo lại 2026-08-28, PR #726 + #727 — ĐỪNG tin chữ "failing" trong thông báo lỗi.]** Khi
auto-merge không bật được lúc CI đang chạy, GitHub trả về:

> The pull request is in unstable status (**required checks are failing**)

Câu này GÂY HIỂU NHẦM: "failing" ở đây KHÔNG có nghĩa là có check đỏ — nó chỉ là cách GitHub
diễn đạt trạng thái `unstable`. Đã đo trực tiếp ở PR #727: `metadata` **xanh**, mọi check khác
đang `in_progress`/`queued`, **không một check nào đỏ**, mà vẫn bị từ chối bằng đúng câu đó.

Vì sao ghi lại: ở PR #726 câu thông báo này xuất hiện đúng lúc `metadata` vừa đỏ (tiêu đề sai
quy ước), nên rất dễ kết luận nhầm rằng "sửa cho hết đỏ là bật được". PR #727 bác bỏ điều đó —
tiêu đề đúng, `metadata` xanh, vẫn bị từ chối. **Trùng hợp, không phải nhân quả.**

Kết luận giữ nguyên như cũ: **auto-merge qua công cụ hiện có coi như không bật được**, nên đừng
tốn thời gian chẩn đoán nó. Cứ gọi một lần trong cùng nhịp tạo PR (rẻ, biết đâu repo/công cụ đổi),
thất bại thì đi thẳng tới mục đích: theo dõi CI, xanh là merge (squash) ngay.

Vẫn giữ nguyên: **KHÔNG merge tay để đi tắt khi CI CHƯA xanh.** Đó mới là điều cấm.

**BỐN BƯỚC BẮT BUỘC KHI TẠO PR (chốt 2026-08-27, bổ sung bước 1 ngày 2026-08-28) — làm liền
một mạch, KHÔNG hỏi lại giữa chừng:**

1. **Kiểm TIÊU ĐỀ khớp quy ước TRƯỚC khi tạo PR.** Cổng `metadata` là required status check, nên
   tiêu đề sai = PR KHÔNG vào được `main` cho tới khi sửa; nó lại chạy xong trong ~4 giây nên đỏ
   gần như tức thì (đã dính ở PR #726). Sửa được bằng cách đổi tiêu đề, nhưng mất thêm một vòng
   CI — rẻ hơn nhiều nếu kiểm trước. Regex thật ở `.github/workflows/pr-policy.yml`:

   ```
   ^(feat|fix|refactor|docs|test|chore|style|perf|build|ci|revert)(\([a-z0-9._/-]+\))?!?: .+
   ```

   Bẫy đã dính: **scope chỉ nhận CHỮ THƯỜNG** — `fix(kotlinSim)` trượt, `fix(programming)` đạt.
   Tên module viết hoa lạc đà thì dùng tên trụ/gói thay vì bê nguyên tên file.

   **[Bổ sung 2026-09-02, PR #810] Cổng `metadata` còn kiểm cả MÔ TẢ PR, không chỉ tiêu đề —
   đã dính đỏ 3 lượt liên tiếp vì viết mô tả tự do.** Đọc `.github/workflows/pr-policy.yml`
   TRƯỚC khi viết mô tả, không đoán khuôn. Hai luật:
   - **PR không phải nháp** phải có ĐỦ 6 tiêu đề (khớp chữ, có dấu, đúng thứ tự không bắt buộc
     nhưng đủ mặt): `## Tóm tắt` · `## Issue / outcome` · `## Research / spec` ·
     `## Validation` · `## Rủi ro, rollout và rollback` · `## Definition of Done`. Khuôn khác
     (vd "## Test plan") KHÔNG thay thế được — cổng so khớp `body.includes(heading)` từng chữ.
   - **Tiêu đề bắt đầu `feat(` hoặc `feat:`** còn bị kiểm THÊM: mô tả phải chứa một đường dẫn
     khớp `docs/specs/YYYY-MM-DD-slug.md` hoặc `docs/research/<slug>.md` VÀ file đó phải THẬT
     SỰ tồn tại trong nhánh (cổng tự `getContent` kiểm), cộng cụm chữ "Approved for
     implementation" ở đâu đó trong mô tả. Việc KHÔNG có đặc tả trước (vd tái cấu trúc UI theo
     yêu cầu trực tiếp trong phiên, không phải tính năng nghiệp vụ mới) thì đổi loại commit
     sang `refactor`/`style`/`chore` cho đúng bản chất thay vì cố nhét `feat` — vừa đúng ngữ
     nghĩa Conventional Commits, vừa khỏi vướng cổng spec-link.

2. **Tạo PR ở trạng thái SẴN SÀNG (ready), không bao giờ để nháp.** Nếu công cụ mặc định tạo
   nháp thì bỏ nháp NGAY. Lý do: GitHub từ chối bật auto-merge trên PR nháp ("Pull request is a
   draft" — đã dính thật ở PR #693).
3. **Bật auto-merge (squash) ngay sau lệnh tạo PR** — gọi MỘT lần, không hỏi lại. Thực tế đo
   được là nó gần như luôn thất bại (xem đính chính ở trên), nên **đừng chẩn đoán, đừng gọi lại
   nhiều lần, và tuyệt đối đừng coi đó là lý do để dừng.** Thất bại thì **KHÔNG bỏ mặc PR:**
   theo dõi nó, và **CI xanh + không xung đột là merge (squash) NGAY**, không chờ người dùng bấm.
   Mục tiêu là PR vào `main`; auto-merge chỉ là một cách đạt tới đó, và là cách hay hỏng.
4. **Chỉ gộp `main` khi THẬT SỰ CẦN, đừng gộp theo phản xạ.** Bối cảnh: PR #709 từng kẹt vì
   `mergeable_state` là `behind` — repo khi đó bật "Require branches to be up to date before
   merging", khiến mỗi lần có PR khác merge là mọi PR đang mở phải gộp `main` rồi chờ CI lại
   ~15–20 phút, trong khi `main` có thể tiến tiếp. **Người dùng đã TẮT ô đó (2026-08-27)**, nên
   nhánh tụt sau `main` KHÔNG còn chặn merge nữa. Từ nay chỉ gộp `main` khi:
   - GitHub báo **xung đột** (`mergeable_state: dirty`) — bắt buộc, xem mục 11 phần auto-merge; hoặc
   - `main` vừa đổi thứ mà PR này cũng đụng (cùng file/luồng), tức có nguy cơ **xung đột ngữ
     nghĩa** mà git không báo.

**Chạy lại cổng ở máy sau khi gộp — chỉ khi cần:** merge SẠCH (không xung đột, không đụng file
chung) thì KHÔNG chạy lại toàn bộ cổng ở máy, vì CI đã chạy đúng trên kết quả đã gộp rồi — chạy
lại là làm hai lần cùng một việc, tốn ~10 phút mỗi vòng. Merge CÓ xung đột, hoặc `main` chạm file
mà PR cũng chạm → mới chạy lại đủ cổng ở máy (đây đúng là ca luật mục 9 nhắm tới).

Mục đích của cả bốn: **CI xanh là PR vào `main`, không cần NGƯỜI DÙNG bấm nút.** Việc của AI là
đưa PR tới đích đó — ready, không xung đột, CI xanh — rồi để auto-merge nổ, hoặc tự merge (squash)
nếu auto-merge không bật được. **Không merge tay để đi tắt** khi CI chưa xanh.

**Bật auto-merge KHÔNG phải là hết trách nhiệm.** PR mình tạo là PR của mình: nếu CI đỏ thì
phải đọc log, **tái hiện lỗi ở máy**, sửa và push cho tới khi xanh — không để PR nằm đỏ chờ
người dùng. Nếu `main` tiến lên gây xung đột thì merge `main` vào nhánh, giải xung đột, rồi
**chạy lại toàn bộ cổng trên kết quả đã merge** (mục 9) trước khi push.

---

## C. Mục 13 cũ — "Trạng thái hiện tại" (cập nhật tới 2026-09-01)

## 13. Trạng thái hiện tại

> Cập nhật 2026-07-11.

- [x] Khởi tạo project + đăng nhập — auth tự viết trên Postgres tự host (Bearer token,
      `packages/core-auth/auth.ts`; client `apps/dhcb/src/lib/auth.ts` + `AuthProvider`). Ban đầu
      làm bằng Supabase Auth, đã rời hẳn từ 2026-07-20 (xem mục 6).
- [x] Chế độ Chat (MVP) — gọi AI thật qua `/api/agent` (edge function ép model + token)
- [x] Chế độ Luyện viết + chấm điểm (MVP) — chấm kiểu IELTS
- [x] Giới hạn lượt — lượt dùng đã đồng bộ lên Supabase (`daily_usage`); gói `plan` đọc từ bảng `profiles`. ~~Quyết định 2026-07-11: dự án dùng MIỄN PHÍ cho cộng đồng — KHÔNG làm thanh toán Pro~~ **[Cập nhật 2026-07-27] Đã đảo ngược — người dùng chủ động yêu cầu làm thanh toán thật.** Đã triển khai xong M2: mua Pro/VIP qua SePay (chuyển khoản ngân hàng cá nhân, không qua cổng trung gian). Giá: Pro 20.000đ/10 ngày · 40.000đ/tháng · 360.000đ/năm; VIP 30.000đ/10 ngày · 75.000đ/tháng · 500.000đ/năm — lưu trong `plan_prices` (migration `0014`), đổi giá không cần deploy. Xem chi tiết mục 13 "Trạng thái hiện tại" và `docs/research/dac-ta-thanh-toan-2026-07-25.md`.
- [x] Deploy VPS (Express `server.ts` + PM2 + Nginx + Let's Encrypt) — ĐÃ deploy thật tại https://donghanhcungban.org và https://en-vi.donghanhcungban.org (PM2 process `dhcb` — đổi tên từ `english-tutor`, xác nhận 2026-08-21, port 3001, VPS 3 vCPU / 3GB RAM `103.118.29.58`, thư mục `/var/www/dhcb`). SSL Let's Encrypt tự renew. **[Cập nhật 2026-08-19] Đang chạy CLUSTER MODE 3 instances ổn định.** Cấu hình `instances: 'max'` tận dụng toàn bộ 3 vCPU cores, `REDIS_URL` rate-limit tập trung, `DATABASE_URL` kết nối PostgreSQL `dhcb`. (code + hướng dẫn: `docs/deploy-vps-ubuntu.md`)
- [x] Đồng bộ dữ liệu — chat/viết/nói/lượt dùng lưu lên DB, login thống nhất cho mọi trang. **[Cập nhật 2026-07-20]** Đã rời Supabase hoàn toàn sang PostgreSQL tự host + auth Bearer token tự viết. Xem `docs/migration-thoat-ly-supabase.md` + `postgres/schema.sql`
- [x] Chế độ Luyện nói song ngữ — TTS chính Google Cloud TTS qua `/api/tts` (cache mã hóa AES-256-GCM, lưu Cloudflare R2 trên production qua `STORAGE_DRIVER=r2` — xem mục 6; bắt buộc đăng nhập mới lấy được khoá giải mã), Web Speech API chỉ còn fallback. **STT thật**: ghi âm trình duyệt (`MediaRecorder`, `apps/dhcb/src/lib/sttServer.ts`) → base64 lên `/api/stt` → Whisper qua Groq hoặc OpenAI (`packages/core-ai/stt.ts` gắn vào `/api/stt` trong `apps/server/src/routes.ts` + `packages/core-ai/openaiStt.ts`, có `GROQ_API_KEY` thì dùng Groq `whisper-large-v3-turbo`, không thì OpenAI `gpt-4o-mini-transcribe`); Web Speech API (`apps/dhcb/src/lib/stt.ts`) chỉ còn dự phòng. Cần `GROQ_API_KEY` (hoặc `OPENAI_API_KEY`).
- [x] Mở chiều B: dạy tiếng Việt cho người nước ngoài (nút gạt ngôn ngữ + đảo giọng) — `apps/dhcb/src/lib/storage.ts`
- [x] Chế độ Học theo lộ trình (`/learn`) — curriculum nền tảng theo vòng tròn chủ đề rồi nối tiếp bằng từ điển; tốc độ học **5/10/20 từ/ngày, tự chọn ở Hồ sơ** (`apps/dhcb/src/lib/curriculum.ts` — `getDailySpeed`/`setDailySpeed`; mặc định 10 cho người dùng mới, người dùng cũ giữ 20); ôn ngẫu nhiên không lặp trong 1 vòng; học xong hiện câu thông dụng ráp từ các từ vừa học. Dữ liệu: `apps/dhcb/src/data/curriculum.ts`, logic: `apps/dhcb/src/lib/curriculum.ts`
- [x] Lộ trình CHUẨN CEFR — **A1→C2 đầy đủ 6 cấp** (2026-07-06 mở thêm C1/C2, xem `docs/research/lo-trinh-cefr-c1-c2.md`): C1 687 từ / 10 bài ngữ pháp, C2 1.561 từ / 7 bài — từ vựng C1/C2 lấy TỰ ĐỘNG từ từ điển đã gắn nhãn CEFR (`scripts/archive/gen-cefr-c1c2-vocab.ts` → `apps/dhcb/src/data/cefrC1C2Vocab.json`, lọc `freq≥2000` bỏ từ gắn nhầm + khử trùng nền tảng), ngữ pháp soạn tay ở `apps/dhcb/src/data/cefrAdvanced.ts` (nối vào `CEFR_LEVELS`; accent rose/cyan trong `cefrAccent.ts`). A1–B2: 21 unit / ~55 bài ngữ pháp; mỗi cấp có mục tiêu "can-do", mỗi bài có cấu trúc + giải thích tiếng Việt + ví dụ bấm nghe; liên kết trọn 34 vòng từ vựng (flashcard `WordCard`, vào SRS + đếm lượt ngày). **Mỗi cấp 1 TRANG RIÊNG** `/learning-path/a1…c2` (`apps/dhcb/src/pages/subjects/english/CefrLevelPage.tsx`): thẻ "Học tiếp", unit theo trình tự ① Từ vựng → ② Ngữ pháp → ③ Hội thoại, mục hoàn thành 100% tự ẩn (xem lại được), bài ngữ pháp có nút "Đã học xong" (`apps/dhcb/src/lib/cefrProgress.ts` — đồng bộ Supabase qua cột `cefr_grammar`/`cefr_dialogues` của `learning_progress`, migration `0007`). Trang `/learning-path` = tổng quan 6 cấp (`RoadmapTab.tsx` + mốc từ vựng); màn chi tiết dùng chung ở `CefrLessonViews.tsx`. **4 tab học Hôm nay · Ôn SRS · Từ khó · Kiểm tra nằm TRONG trang từng cấp** (thanh tab đầu trang `CefrLevelPage.tsx`, nội dung `apps/dhcb/src/components/StudyTabs.tsx`) và lọc dữ liệu THEO TỪ VỰNG CỦA CẤP (`getLevelWords()`; cấp cuối C2 học tiếp phần ngoài CEFR — `getBeyondCefrWords()`); giới hạn ngày (tốc độ 5/10/20 từ/lượt tự chọn, tối đa 5× tốc độ/ngày) vẫn tính chung toàn app. Dữ liệu: `apps/dhcb/src/data/cefr.ts`. **[Cập nhật 2026-07-06]** Toàn bộ từ điển (10.746 từ) đã 100% có nhãn CEFR thật (`DictEntry.level`, gắn qua CEFR-J/Octanove/Words-CEFR-Dataset + AI cho phần còn lại — xem PROGRESS.md các đợt "gắn nhãn CEFR") và 10.425/10.746 (97%) đã có `freq` thật (SUBTLEX-US, `scripts/assign-word-freq.ts`) nên phần "Mở rộng" đã sắp đúng theo **tần suất** (`compareByFreq`), không còn theo alphabet. Từ vựng Đợt 1 CEFR-J (A1-B2, 1.649 từ + 125 cụm) và cấp C1/C2 của lộ trình (2.248 từ, dùng lại từ đã gắn nhãn) đã hoàn tất. **[Cập nhật 2026-07-11]** Đợt 2 dictionary-completion (bổ sung từ CEFR-J C1/C2 còn thiếu vào từ điển) **ĐÃ HOÀN TẤT** (xem PROGRESS.md mục "Đợt 2 (C1-C2) đã HOÀN TẤT HẲN") — đã xác minh lại: toàn bộ 12.073 từ trong từ điển đều có nhãn CEFR (0 từ thiếu). **[Đo lại 2026-08-12, audit luồng dữ liệu]** Số thật hiện tại: **12.168 từ**, vẫn 100% có nhãn CEFR hợp lệ (0 thiếu, 0 sai giá trị) — phân bố A1 1.273 · A2 1.559 · B1 2.663 · B2 2.993 · C1 1.305 · C2 2.375; **94,9% có `freq`** (619 từ chưa có, không phải 97% như con số cũ ở trên); 0 từ trùng lặp giữa các chunk, 0 từ dư khoảng trắng. Ngưỡng `freq≥2000` nay loại **0 từ** (giữ làm lưới an toàn, xem comment trong script).
- [x] (v2) Theo dõi tiến bộ, streak, chấm phát âm — streak, WordOfTheDay, Flashcard, cache phát âm (`apps/server/src/api/subjects/english/pronunciation.ts`); chấm phát âm chạy trình duyệt bằng Web Speech + Levenshtein (`apps/dhcb/src/lib/pronounceScore.ts` + `apps/dhcb/src/components/PronunciationCheck.tsx`).
- [x] Bảng tiến độ (`/progress`) — streak + biểu đồ 7 ngày, mục tiêu từ mới hôm nay + lượt còn lại, số từ đã thuộc + cần ôn SRS + % lộ trình, % hoàn thành từng cấp CEFR A1→B2, tổng kết phiên. Logic: `apps/dhcb/src/lib/stats.ts`; UI: `apps/dhcb/src/pages/core/Dashboard.tsx`.
- [x] Tên miền canonical (SEO) đọc từ `VITE_SITE_URL` trong `apps/dhcb/src/App.tsx`, mặc định domain production. Xem `.env.example`.
- [x] **Hệ thống theme + audit UI** — màu nhấn thương hiệu thành biến CSS `--a-*` (class `accent-*`, map trong `tailwind.config.js`). **5 theme, mặc định Xanh đêm**: 🌙 Xanh đêm · ☀️ Blue sky · 🌸 Pink · 🎉 Rực rỡ · 🧒 Nhi đồng (theme `kid`, tách riêng khỏi 4 theme cycle qua `ThemeToggle`, chọn bằng đường riêng — xem `packages/core-ui/theme.ts`). Chọn theme qua menu swatch (`apps/dhcb/src/components/ThemeToggle.tsx`); định nghĩa ở `apps/dhcb/src/index.css` + `packages/core-ui/theme.ts`. Giữ màu ngữ nghĩa. Font: sàn chữ ≥ 11px, input 16px. Zoom mobile khóa chủ động (đánh đổi 1 mục a11y, bù bằng sàn chữ).
- [x] Giọng điệu Chat/Speaking thân mật, nhẹ nhàng hơn + nút "Kết thúc & chấm điểm" cuối phiên
      (chấm kiểu IELTS Speaking: fluency/từ vựng/ngữ pháp, riêng Speaking có thêm phát âm) — kết quả
      chỉ hiện tạm trong phiên, không lưu Supabase. Xem `PROGRESS.md` (PR #170).
- [x] **Hướng chuyên sâu "Toán học cho Lập trình" (`mathforcode`, hướng thứ 14, PR #739,
      2026-08-30)** — hướng NỀN cắt ngang (như `algo`/`architecture`) trong môn Lập trình, đủ 4
      chặng S1→S4: nền tảng rời rạc (bù 2, Boolean, modulo, Big-O) → tổ hợp & xác suất → đại số
      tuyến tính ứng dụng → giải tích & tối ưu cho AI/ML (tự cài gradient descent bằng Python
      thuần). Đồng thời thêm chương trình tương ứng vào môn Toán
      (`STEM_CURRICULUM.mathematics`, `apps/dhcb/src/data/stemCurriculum.ts`) nên khoá học hiện
      diện ở CẢ HAI môn. Đặc tả: `docs/specs/2026-08-30-toan-hoc-cho-lap-trinh.md`.
- [x] **Lộ trình mục tiêu "Kỹ Sư Trưởng AI" (`principal-ai`, tầng LỘ TRÌNH MỤC TIÊU mới của môn
      Lập trình, 4 đợt PR #766/#769/#771/2026-08-31, HOÀN TẤT TRỌN VẸN)** — tầng thứ 4 (bên
      cạnh xương sống P1–P6, `specializations/` 14 hướng, `courses/` khoá ngắn): manifest ghép
      CHẶNG của nhiều hướng có sẵn theo thứ tự phụ thuộc, đích là năng lực người ra quyết định
      hệ AI (`packages/subject-programming/learningPaths/`). 5 giai đoạn P1→P5: P1 Nền toán &
      thuật toán → P2 Dữ liệu & backend → P3 Trục AI chính → P4 Vận hành & tin cậy (đều lắp từ
      chặng hướng chuyên sâu sẵn có) → **P5 "Tầm trưởng"** (nội dung MỚI, đợt 4: 4 chặng RIÊNG
      `principal-s1…s4` — vận hành AI/đặc tả+eval, hệ tác tử & MCP, quyết định kiến trúc bằng
      ADR, dẫn dắt & trách nhiệm — không phải hướng chuyên sâu thứ 15). Chẩn đoán chọn điểm vào
      tất định chấm client (đợt 2); vòng lặp học có bằng chứng: quiz chấm server ≥ 4/5 mới qua
      chặng + kho artifact cá nhân + Companion kiểm hiểu tuỳ chọn qua `/api/agent` (đợt 3).
      Trang `/lap-trinh/lo-trinh/principal-ai` (+ `/chan-doan`, `/chang/:stageId`). Đặc tả:
      `docs/specs/2026-08-31-khoa-hoc-ky-su-truong-ai.md` +
      `docs/specs/2026-08-31-dot-4-p5-tam-truong.md` (đặc tả con đợt 4).

### Việc còn dang dở / cần quyết định

1. STT đã xong (Whisper Groq/OpenAI qua `/api/stt`) **và đã đếm lượt riêng** (mode `stt` tách khỏi
   `speaking`: cột `stt_count`, giới hạn free 10/pro 100 — `packages/core-billing/usage.ts`, `apps/dhcb/src/types.ts`). Còn: thêm
   `GROQ_API_KEY` (hoặc `OPENAI_API_KEY`) vào `.env` trên VPS.
2. Cluster mode đã áp dụng thật trên VPS (xác nhận 2026-07-25) — chuyển fork→cluster qua
   `scripts/pm2-reload.sh` đã chạy xong. **[Cập nhật 2026-08-21] VPS đã nâng lên 3 vCPU / 3GB
   RAM** — cluster mode nay chạy thật 3 instances song song (không còn bị giới hạn 1 vCPU như
   trước), khớp với mô tả PM2 3 instances ở mục 13. `packages/core-auth/security.ts` (`validateAuth`) đã
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

- [x] **"Người thân theo dõi" — báo cáo tuần cho phụ huynh/thầy cô**: người học tự tạo mã mời
      (dùng MỘT LẦN, hạn 24 giờ) cho tối đa 2 người thân; tối chủ nhật 19h hệ thống gửi email
      tổng hợp tuần, luôn kết bằng một câu gợi ý để hỏi chuyện. **Riêng tư là ràng buộc kỹ
      thuật:** chỉ NGƯỜI HỌC cấp quyền (không có đường ngược lại) · mặc định TẮT · gỡ là ngừng
      ngay · danh sách trường được xem là ĐÓNG, chốt trong contract và có test canh gác —
      KHÔNG bao giờ gồm nội dung chat với Companion, nhật ký cảm xúc, hay bất kỳ con số năng
      lực nào · không có endpoint xem tiến độ thời gian thực (cố ý). PR #706 (migration `0069`).
      Đặc tả: `docs/research/dac-ta-nguoi-dong-hanh-2026-08-26.md`. ⚠️ Chưa có bản chiều B.

- [x] **Chế độ ôn thi có hạn chót ("Đếm ngược kỳ thi", `/on-thi`)**: khai ngày thi → lập lịch
      NGƯỢC từ ngày đó về hôm nay. Lõi là `packages/core-examplan` — hàm thuần, tất định,
      KHÔNG có AI (lập lịch phải kiểm chứng được bằng test, và mỗi lần mở app không được ra một
      lịch khác nhau). Ba giai đoạn `build`/`consolidate`/`taper` nâng dần `request_retention`
      của FSRS (0,90 → 0,93 → 0,95); T-3 trở đi KHÔNG thêm mục mới. Trễ thì **nén lịch, không
      phạt**; không kịp thì **nói thẳng** và đề xuất cắt phạm vi. Màn hình chính là đồng hồ đếm
      ngược + đúng 3 việc hôm nay, KHÔNG phải bảng điểm (luật số 1 của sản phẩm). Lịch tính ở
      CLIENT, server chỉ giữ ý định. Đợt 1 một kỳ thi duy nhất: vào lớp 10 — Tiếng Anh, phạm vi
      từ vựng A1→B1. Cờ tắt khẩn cấp phần FSRS: `localStorage.srs_retention_off = '1'`.
      PR #706 (migration `0070`). Đặc tả: `docs/research/dac-ta-che-do-on-thi-2026-08-26.md`.
      ⚠️ Chưa có bản chiều B (cần kỳ thi khác, là việc nội dung không phải việc dịch).

- [x] **Cụm 6 khoá ngắn "Kỹ sư AI thực chiến" (môn Lập trình, 2026-09-01, 5 đợt PR #798-#803 +
      #800/#801/#802/#803)** — chuỗi `pyai` (Python/AI cơ bản, 17 bài) → `mathai` (Toán thiết yếu
      cho AI, 13 bài) → `mlds` (Machine Learning & Data Science) → `cv1` (Deep Learning for CV cơ
      bản) → `cv2` (Transformer/ViT, Object Detection...) → `llmagent`, mỗi khoá có `prerequisites`
      trỏ khoá trước. File khoá: `packages/subject-programming/courses/{pyai,mathai,mlds,cv1,cv2,llmagent}.ts`,
      nội dung bài: `packages/subject-programming/lessons/`. Đặc tả khung:
      `docs/specs/2026-09-01-cum-6-khoa-ai-engineer.md` + đặc tả nội dung riêng từng khoá cùng
      thư mục `docs/specs/`.

Chú thích: `[x]` xong · `[~]` làm một phần · `[ ]` chưa làm.
