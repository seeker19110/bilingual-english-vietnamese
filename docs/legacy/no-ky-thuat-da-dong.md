# Nợ kỹ thuật ĐÃ ĐÓNG — kho lưu (tách khỏi `PROGRESS.md` ngày 2026-09-01)

`PROGRESS.md` mục "Nợ kỹ thuật còn mở" chỉ giữ nợ **đang mở**; các khối dưới đây là nợ đã gỡ,
dời nguyên văn sang đây để giữ bằng chứng và bài học (cách chẩn đoán, số đo, giả thuyết đã bác
bỏ). Thứ tự: như thứ tự cũ trong `PROGRESS.md`, mới hơn ở trên.

Khi đóng thêm một món nợ: cắt khối đó khỏi `PROGRESS.md`, dán vào ĐẦU danh sách dưới đây.

- 🟢 **[ĐÓNG 2026-08-28] Giao diện coi người dùng là khách khi mở subdomain khác.**
  **Đính chính mô tả ban đầu của mục này:** nó viết "`validateAuth` chấp nhận cookie khi thiếu
  Bearer" — SAI. Từ Bước 6 (`docs/adr/0002-quan-ly-nguoi-dung.md`), `validateAuth` **chỉ** đọc
  cookie `session_token` và **bỏ qua hoàn toàn** header `Authorization`. Đo trực tiếp trên
  server đã build với DB thật: cùng một phiên, gọi `/api/auth?action=me` chỉ với cookie → 200,
  chỉ với Bearer → 401. Nghĩa là API trên subdomain mới **vốn đã xác thực được** nhờ cookie
  `Domain=.donghanhcungban.org`.
  Chỗ thật sự hỏng nằm ở CLIENT: app dùng "có token trong `localStorage` không" làm cờ
  đã-đăng-nhập, mà `localStorage` cô lập theo origin — `getCurrentUser()` thoát sớm, và
  `cloud.ts`/`challengeCloud.ts`/`tutorFeedback.ts` lặng lẽ bỏ qua đồng bộ. Đã vá bằng action
  `session-from-cookie`: nạp lại cờ đó đúng một lần lúc khởi động.

- 🟢 **[2026-08-26 — ĐÃ GỠ, kiểm chứng bằng bài thử] Rate limit từng bị né hoàn toàn bằng
  header `X-Forwarded-For` giả; nay đã bịt cả hai tầng.**

  **Trước khi vá** — 40 request vào `/api/app-settings` (giới hạn 30/phút) với IP giả ngẫu
  nhiên mỗi lần: **40 lần `200`, không một `429`**. Nguyên nhân: nginx dùng
  `$proxy_add_x_forwarded_for` (NỐI ip thật vào CUỐI) trong khi `getClientIp()` đọc phần tử
  ĐẦU — tức giá trị client tự khai.

  **Sau khi vá** — chạy lại đúng hai bài thử ở `docs/cloudflare-setup.md`:

  | Bài thử                           | Kết quả                            | Đọc thế nào                                                                                                        |
  | --------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
  | A — IP giả **ngẫu nhiên** mỗi lần | **30 × `200`, rồi 10 × `429`**     | Khớp CHÍNH XÁC giới hạn 30/phút ⇒ đếm theo IP thật, header giả vô tác dụng                                         |
  | B — IP giả **cố định**            | **40 × `429`** ngay từ request đầu | Chạy từ cùng máy với A nên cùng IP thật; quota đã bị A dùng hết ⇒ hai bài dùng CHUNG một bộ đếm, đúng như phải thế |

  Bài B trả `429` ngay từ đầu thoạt nhìn có vẻ lạ, nhưng đó mới là bằng chứng mạnh nhất: nếu
  rate limit còn tin header giả thì B đã có bộ đếm riêng và trả `200`.

  **Hai tầng đã áp:** (1) `getClientIp()` đọc `CF-Connecting-IP` → `X-Real-IP` → XFF phần tử
  CUỐI (PR #701, 7 test chặn hồi quy trong `packages/core-http/http.test.ts`); (2) nginx
  `cloudflare-realip.conf` chỉ nhận header từ đúng dải IP Cloudflare — người dùng đã áp lên VPS
  cùng ngày.

  **Bài học ghi lại:** lỗ hổng sống sót qua nhiều lần rà soát vì cách kiểm chứng cũ hỏi sai
  câu — _"IP hiển thị có đúng không?"_ (nhìn log là trả lời được) thay vì _"IP có ghi đè được
  không?"_ (chỉ trả lời được bằng cách tự tấn công mình). Tài liệu đã đổi sang câu thứ hai.

- 🟢 **[2026-08-26 — ĐÃ GỠ] VPS production đã có swap 6 GB.** `scripts/setup-swap.sh` chạy
  thật trên máy: `free -h` nay báo `Swap: 6.0Gi · used 0B` (dùng 0B là đúng —
  `vm.swappiness=10` nên kernel chỉ chạm swap khi RAM thật sự cạn). Đĩa còn 22 GB trước khi
  tạo nên không sát đáy. Ghi lại bối cảnh gốc: Số đo người dùng gửi từ VPS hôm nay:

  ```
  free -h  →  total 2.9Gi · used 1.1Gi · available 1.8Gi · Swap 0B
  pm2 list →  3 instance dhcb: 218,7 + 217,6 + 231,1 MB · pm2-logrotate 57,5 MB
  ```

  Lúc rảnh dư dả (dùng ~40% RAM). Chỗ nguy hiểm là **lúc deploy**: `scripts/deploy.sh` chạy
  `npm ci` + `npm run build` ngay trên máy đang phục vụ, Vite + `tsc -b` 16 workspace ngốn thêm
  1–1,5 GB ở đỉnh — chạm trần 2,9 GB. Không swap thì kernel gọi OOM killer, mà OOM killer
  **không chọn tiến trình đáng chết**: nó có thể giết PostgreSQL giữa lúc deploy.

  **Điều kiện gỡ nợ:** trên VPS chạy `sudo bash scripts/setup-swap.sh 6G` rồi xác nhận
  `free -h` thấy dòng Swap khác `0B`. Xem `docs/deploy-vps-ubuntu.md` Bước 3a.

  **Hai thứ nữa phát hiện cùng lúc, chưa vá (đề xuất, chờ người dùng chốt):**
  1. `ecosystem.config.cjs` **thiếu `max_memory_restart`** — instance rò rỉ bộ nhớ thì PM2
     không tự khởi động lại, để mặc kernel giết bừa. Đề xuất `'400M'` (mỗi instance đang dùng
     ~220 MB, nên 400 MB là ngưỡng bất thường rõ ràng chứ không phải mức bình thường).
  2. `PG_POOL_MAX` mặc định **10 mỗi tiến trình × 3 instance = 30 kết nối** Postgres thật.
     Chưa vỡ (`max_connections` mặc định 100) nhưng thừa; đề xuất đặt `PG_POOL_MAX=5`.

  **↺ 64 — ĐÃ KẾT LUẬN, không phải crash.** Đọc `pm2 logs dhcb --err --lines 200`: 200 dòng
  log lỗi gần nhất KHÔNG có một stack trace crash nào, không có tiến trình thoát bất thường.
  Toàn bộ là cảnh báo Redis rớt (mục trên) và 2 lỗi TTS Gemini có xử lý sẵn. Vậy 64 là cộng
  dồn qua các lần `pm2 reload` khi deploy — bình thường.

- 🟢 **[2026-08-25 → ĐÃ GỠ 2026-08-26] `nginx/en-vi.conf` nay ĐÃ áp lên VPS thật** (làm cùng lúc với việc áp `cloudflare-realip.conf` để bịt lỗ hổng rate limit — xác nhận bằng bài thử A/B ở mục trên). Ghi lại bối cảnh gốc: Audit
  2026-08-25 (F5) phát hiện bản `Content-Security-Policy-Report-Only` trong nginx còn whitelist
  `*.supabase.co` dù dự án rời Supabase từ 2026-07-20, lại thiếu facebook/apple/microsoft,
  `media-src blob:` và `frame-src accounts.google.com` so với CSP thật — nên nó chỉ sinh báo cáo
  vi phạm GIẢ. Đã xoá hẳn ở PR #664 (giữ đúng MỘT nguồn CSP là Express).

  **Điều kiện gỡ nợ:** copy file lên VPS rồi:

  ```bash
  sudo nginx -t && sudo systemctl reload nginx
  ```

  **Vì sao chưa gỡ được từ đây:** repo chỉ chứa BẢN SAO cấu hình; file thi hành thật nằm trên
  server. Sửa trong repo mà quên áp = tài liệu nói một đằng, server chạy một nẻo — đúng loại
  lệch mà Tầng 6b của quy trình audit sinh ra để bắt.

- 🟢 **[2026-08-26 — ĐÃ GỠ] Baseline eval gia sư ĐÃ CÓ SỐ THẬT, chất lượng sư phạm không tụt.**
  Chạy trên VPS với key thật: **62/62 câu chấm được**, recall 97,7% · precision 97,7% ·
  FP-rate 5,6% · specificity 94,4% · Feedback VI 100% · Type-hit 76,7%. 9/11 nhóm lỗi đạt
  tuyệt đối; chỉ bỏ sót `adj-02` (trật tự tính từ). Số liệu ở
  `docs/research/eval-tutor-baseline.md`.

  **Đính chính một điều mục nợ này từng ghi sai:** nó viết "baseline vẫn là bản 2026-08-21".
  Không đúng — `git log -- docs/research/eval-tutor-baseline.md` cho ĐÚNG MỘT commit trong
  toàn bộ lịch sử (PR #625), và nội dung là bản mẫu rỗng ghi rõ "⏳ CHƯA CÓ SỐ LIỆU BASELINE".
  Tức **chưa từng có baseline số nào, ở bất kỳ ngày nào**, và luật ở `CLAUDE.md` mục 8 ("PR
  sửa prompt/model phải dán bảng so sánh, recall/precision không được tụt") **chưa bao giờ thi
  hành được** vì không có mốc để so. Lần chạy 2026-08-26 là baseline ĐẦU TIÊN, không phải một
  lần so sánh. Bài học: một mục nợ khẳng định "bản ngày X" mà không ai mở file ra xem thì nó
  chỉ là tin đồn được chép lại — kiểm bằng `git log` trước khi chép.

  **Đo đúng đường production.** `chatFallback.ts` gọi theo thứ tự Groq → Anthropic → Gemini,
  và script eval cũng ưu tiên Groq trước, nên số trên là chất lượng của **provider chính** mà
  người dùng thật đang gặp. Gemini (`gemini-3.6-flash`) là lớp dự phòng thứ ba — health-check
  07:00 ngày 26/8 xác nhận nó gọi được (512ms), nhưng chất lượng sư phạm của riêng nhánh đó
  vẫn chưa đo; chạy `npm run eval:tutor` trên máy KHÔNG có `GROQ_API_KEY`/`ANTHROPIC_API_KEY`
  thì script sẽ rơi xuống Gemini và đo được. Hai tính năng vision
  (`visionSolverService.ts`, `ambientVisionService.ts`) dùng chung model đó, cũng chưa thử tay.

  **Ba việc phải làm để chạy được, ghi lại vì đều là bẫy thật:**
  1. Script đọc `process.env.GROQ_API_KEY` nguyên chuỗi làm Bearer token, trong khi production
     đi qua `groqKeyPool()` tách nhiều key theo dấu phẩy → 62/62 lỗi `401` và một báo động sự
     cố production hoàn toàn không có thật. Đã vá.
  2. Báo lỗi chỉ giữ `lastErr` nên `429` của khoá đang sống bị `401` của khoá hỏng che mất →
     chẩn đoán sai thêm hai vòng. Nay in trạng thái TỪNG khoá: `[#1→429 #2→429]`. Đã vá.
  3. Một khoá trong `.env` hỏng vật lý — dài 50 ký tự thay vì 56, kết thúc bằng ký tự `>`, sai
     định dạng `gsk_[A-Za-z0-9]+`. Bị cắt cụt lúc ghi file, không phải bị thu hồi. Đã thay.

  Groq tính hạn mức theo **TÀI KHOẢN chứ không theo khoá**, nên gộp nhiều khoá cùng một tài
  khoản vào bể KHÔNG tăng quota — chỉ có giá trị dự phòng khi một khoá bị thu hồi. Đúng cho cả
  production. Chạy eval cần `--delay 3000` (62 câu ≈ 3–4 phút); `--delay 500` mặc định làm tắc
  từ câu 22.

- 🟢 **[2026-08-21] Đã vá 15 test e2e đỏ trên `main`** (phát hiện khi driving PR #617 tới green —
  commit `fd188ef` "restructure platform hub and dedicated english studio routing" đổi route "/"
  từ `EnglishHome` sang `Home` (platform hub mới) và dời `EnglishHome` sang `/hoc-tieng-anh`, kéo
  theo 2 loại lỗi:
  1. **5 test sai route** (`e2e/a11y.spec.ts` "Home — gợi ý luyện nói..." × 5 theme,
     `e2e/comeback.spec.ts` × 2, `e2e/bottomnav.spec.ts` × 1 — nhãn tab đổi "Lộ trình" →
     "Học Tiếng Anh"): sửa test trỏ đúng `/hoc-tieng-anh` thay vì `/` cho nội dung đã dời, và
     cập nhật locator theo nhãn mới.
  2. **9 lỗi a11y `color-contrast` thật** trên `Home.tsx` (platform hub mới) và `EnglishHome.tsx`
     — 2 dạng bug lặp lại từ đợt vá PR #616 trước: (a) pill/nút dùng thẳng `text-emerald/blue/
purple/orange/amber/sky-300` thiếu biến thể `theme-light:text-*-800` nên nhạt trên 3 theme
     sáng; (b) nút nền `bg-accent-500`/`bg-emerald-500` dùng `text-zinc-950` — token `--z-950`
     BỊ ĐẢO CHIỀU ở theme sáng (nhạt nhất thay vì đậm nhất, xem PROGRESS.md đợt vá PR #616) nên
     chữ gần trắng trên nền sáng → sửa bằng màu cố định `text-[#09090b]` (không qua token z-\*,
     đã tính contrast ≥ 5.9:1 trên cả 5 theme accent màu khác nhau) thay vì `text-zinc-950`.
     Xác nhận: `npx playwright test e2e/a11y.spec.ts e2e/bottomnav.spec.ts e2e/comeback.spec.ts`
     134/134 pass cục bộ; build/typecheck/lint/format/`npm test` (5019/5019) đều xanh.

- 🟢 **[ĐÃ TRẢ 2026-08-24 — xem mục "Giai đoạn hiện tại"]** Nâng lại plugin lên `7.1.1` + sửa
  đúng bản chất 95 lỗi (danh sách 73 lỗi cũ đã phình theo code mới), 0 eslint-disable mới.
  Ghi chú gốc giữ lại bên dưới để tra cứu:
