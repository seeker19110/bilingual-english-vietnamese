# ADR-0001: Nền tảng đa lĩnh vực donghanhcungban.com

- **Trạng thái:** Đã chấp nhận
- **Ngày:** 2026-07-31
- **Liên quan:** `docs/research/ke-hoach-nen-tang-donghanhcungban-2026-07-31.md` (bản phác thảo đầy đủ),
  `docs/research/dac-ta-gd1-tach-loi-monorepo-2026-07-31.md` (đặc tả thi hành)

## Bối cảnh

Hiện có **một** app chạy thật tại `en-vi.donghanhcungban.com`: gia sư tiếng Anh AI
(React 18 + Vite 7 + Express + PostgreSQL tự host trên VPS, auth Bearer tự viết,
thanh toán SePay). Repo là một app đơn: `src/` (102 file `lib`, 47 component),
`api/` (~50 handler + 86 file `_lib`), `server.ts`, `postgres/`.

Chủ dự án muốn `donghanhcungban.com` trở thành nền tảng "đồng hành" đa lĩnh vực:
trước hết là học hành (tiếng Anh → Toán → Lý → Hoá), sau đó nuôi dạy con và phát
triển nghề nghiệp.

Ràng buộc thực tế, quyết định mọi lựa chọn dưới đây:

- **Một người làm** (chủ dự án mới học lập trình, làm cùng AI).
- **VPS 1 vCPU**, vốn tối thiểu — chi phí là ràng buộc cứng.
- App hiện tại **đã có người dùng thật và đã thu tiền** → không được phép hồi quy.

## Quyết định

**1. Bố cục domain — hub + subdomain mỗi môn, hạ tầng dùng chung, thi hành ở "mức 2".**

- `donghanhcungban.com` = trang hub (giới thiệu, đăng nhập chung, điều hướng, bảng giá).
- Mỗi môn một subdomain: `en-vi.` (đã có) · `math.` · `ly.` · `hoa.` … (viết thường).
- **Mỗi môn một bundle frontend riêng, nhưng CHỈ MỘT tiến trình PM2** phục vụ tất cả:
  Nginx định tuyến mọi subdomain về `127.0.0.1:3001`; Express chọn thư mục `dist`
  theo header `Host`; `/api/*` là một bộ dùng chung.
- Tách thành nhiều tiến trình ("mức 3") **để dành**, khi đạt bất kỳ ngưỡng nào:
  một môn chiếm > 50% CPU của tiến trình chung · cần deploy môn A không gián đoạn
  môn B · đã lên VPS nhiều core (khi đó **bắt buộc** có `REDIS_URL`).

**2. Repo — monorepo bằng npm workspaces.**

`packages/core-auth`, `core-billing`, `core-ai`, `core-ui` + `apps/english`, `apps/hub`,
`apps/math` (về sau). **Không** thêm Turborepo, **không** đổi sang pnpm, **không** nâng
React/TS/Tailwind/ESLint — giữ đúng luật phiên bản ở `CLAUDE.md` §6.

**3. Dữ liệu — một schema `core` + mỗi môn một schema riêng.**

- `core`: `users`, `sessions`, `profiles`, `payments`, `plan_prices`, `plan_features`,
  `daily_usage`, `app_settings`, `push_subscriptions` — những thứ không thuộc về môn nào.
- `english`, `math`, … : bảng riêng của từng môn (`chat_sessions`, `writing_submissions`,
  `speaking_sessions`, `learning_progress`, `pronunciations`, …).
- Đếm lượt tổng quát hoá từ `mode` thành **`(subject, mode)`**; hạn mức ngày vẫn là
  **kho chung toàn nền tảng**, không chia theo môn.
  > ⚠️ Câu trên **đã bị sửa cùng ngày** — xem mục bổ sung 7 ở cuối: hạn mức chỉ áp cho tiếng Anh.

## Lý do

**Vì sao subdomain chứ không phải route `/toan` trong một app:** bundle sẽ phình cho
người chỉ học một môn, và một lỗi ở môn mới làm sập app đang có người trả tiền. Subdomain
cô lập được rủi ro đó ở tầng frontend mà không tốn thêm gì.

**Vì sao vẫn chung một tiến trình (mức 2):** với 1 vCPU, chạy N tiến trình Node là
N×~200MB RAM và N tiến trình tranh nhau đúng một core — chậm hơn chứ không an toàn hơn.
Backend hơn nữa **đã dùng chung sẵn**: auth, đếm lượt, SePay, `/api/agent`, `/api/tts`,
`/api/stt`, cache mã hoá. Tách tiến trình lúc này là nhân bản vô ích. Cùng tiến trình còn
làm SSO gần như miễn phí: cùng secret, chỉ cần cookie `domain=.donghanhcungban.com`.

**Vì sao monorepo:** đây là điều kiện để mức 2 nâng lên mức 3 mà không phải viết lại — nếu
lõi đã nằm trong `packages/`, tách tiến trình chỉ là thêm entry `ecosystem.config.cjs` +
đổi port Nginx. Một CI, một chỗ sửa lõi, không phải publish package nội bộ. npm workspaces
có sẵn trong npm, không thêm công cụ mới cho người mới học phải gánh.

**Vì sao tách schema DB:** `daily_usage` hiện có cột cứng `chat_count`/`writing_count`/…
Thêm môn theo kiểu cũ nghĩa là thêm cột mãi mãi. `(subject, mode)` dạng dòng thì môn mới
không cần migration. Tách schema giữ `public` khỏi thành bãi rác vài chục bảng và làm rõ
bảng nào thuộc lõi (không được sửa tuỳ tiện) so với bảng nào thuộc một môn.

**Vì sao hạn mức dùng chung toàn nền tảng:** dễ hiểu với người dùng ("còn X lượt hôm nay"),
dễ định giá, và chống lạm dụng tốt hơn N hạn mức riêng cộng lại.
_(Đoạn này đã bị sửa cùng ngày — xem mục bổ sung 7.)_

## Các phương án đã cân nhắc

- **Một app, nhiều route** (`/anh`, `/toan`): đơn giản nhất, SSO miễn phí. Loại vì bundle
  phình và không cô lập được rủi ro với app đang có doanh thu.
- **Tách hẳn: mỗi môn một repo + một tiến trình + một DB**: cô lập tối đa, deploy độc lập.
  Loại **ở thời điểm này** vì 1 vCPU không gánh nổi và một người không vận hành nổi N hệ
  thống; auth/thanh toán sẽ phải nhân bản hoặc dựng thêm dịch vụ nội bộ. Đây chính là
  "mức 3", giữ làm đường nâng cấp chứ không phải phương án bị bác bỏ vĩnh viễn.
- **Nhiều repo + package nội bộ published**: có ích khi nhiều nhóm làm song song. Với một
  người thì chỉ tăng ma sát (bump version, publish, cập nhật chéo).
- **Turborepo / pnpm workspaces**: nhanh hơn khi repo lớn. Loại lúc đầu — thêm công cụ mới
  cho người mới học, và vi phạm luật giữ nguyên phiên bản. Xem lại nếu build chậm thật.
- **Giữ nguyên `public`, thêm cột cho mỗi môn**: rẻ trước mắt, nợ kỹ thuật tăng theo số môn.

## Hệ quả

**Tích cực**

- Mở môn mới không đụng vào app tiếng Anh đang chạy thật.
- Một tài khoản + một gói cước dùng cho mọi môn — lợi thế lớn nhất so với app đơn môn.
- Auth/thanh toán/AI-gateway/theme/CI viết một lần, dùng cho mọi môn.

**Đánh đổi & rủi ro phải chấp nhận**

- **GĐ1 (tách lõi) là refactor lớn, rủi ro cao, KHÔNG mang lại tính năng mới nào cho người
  dùng.** Phải làm thuần refactor, E2E xanh trước và sau, deploy từng bước, giữ rollback.
- Migration `(subject, mode)` là **thay đổi phá vỡ** → phải làm sớm khi dữ liệu còn ít,
  có backfill `subject='english'` và đường lùi.
- Import path toàn repo sẽ đổi khi file chuyển vào `packages/` — một PR cơ học lớn.
- Mức 2 nghĩa là một tiến trình sập thì mọi môn cùng sập. Chấp nhận, đổi lấy chi phí thấp;
  ngưỡng nâng cấp đã ghi rõ ở trên.

**Việc tiếp theo**

1. Đặc tả chi tiết GĐ1 (file phải di chuyển, migration cụ thể, kế hoạch test hồi quy).
2. Thi hành GĐ1 theo từng PR nhỏ, mỗi PR một thay đổi logic, không kèm tính năng mới.
3. Nâng VPS trước khi bắt đầu GĐ2 (Toán).

---

## Bổ sung cùng ngày 2026-07-31 (trước khi thi hành; mục 7 SỬA một phần quyết định 3)

**4. Tiền tố nội dung chuyển khoản SePay: `DHCB` dùng chung toàn nền tảng**, không tách theo môn.
Lý do: một gói cước dùng cho mọi môn, nên tiền tố theo môn là sai mô hình kinh doanh; người chuyển
khoản cũng chỉ phải nhớ một dạng nội dung. **Ràng buộc vĩnh viễn:** webhook chấp nhận cả `DHCB…`
lẫn `ENVI…` (giao dịch cũ, và người dùng copy lại nội dung cũ). Không bao giờ bỏ `ENVI` khỏi danh
sách chấp nhận, cũng không gỡ bộ lọc `ENVI` trên trang SePay.

**5. Dữ liệu học tập tách theo môn ở tầng schema.** Bảng học (`chat_sessions`,
`writing_submissions`, `speaking_sessions`, `learning_progress`, `pronunciations`,
`challenge_entries`, `tutor_feedback`) chuyển sang schema `english`. `tts_cache` ở lại `core` vì
khoá là hash nội dung, môn nào cũng dùng chung được. Môn mới tạo schema riêng với bảng của riêng nó;
khoá ngoại tới `core.users(id)` là điểm nối duy nhất giữa các schema.

**6. Cơ chế học & ôn tập tách riêng từng môn — KHÔNG đưa vào `packages/core-*`.**
Đảo lại đề xuất ban đầu (định chuyển thuật toán SRS vào lõi). Lý do: ôn từ vựng và ôn công thức Toán
khác nhau về bản chất — Toán còn phải sinh lại đề theo tham số, chấm bước giải, phân biệt "nhầm dấu"
với "chưa hiểu khái niệm". Một trừu tượng SRS chung sẽ hoặc quá loãng để dùng được, hoặc thành nút
thắt mà sửa cho môn này thì hỏng môn kia.
**Đánh đổi chấp nhận có chủ đích:** thuật toán lập lịch ôn sẽ tồn tại nhiều bản sao; lỗi trong công
thức tính khoảng cách ôn phải sửa ở từng môn. Ghi nợ kỹ thuật trong `PROGRESS.md`. Xét gộp lại **chỉ
khi** tới môn thứ ba mà cả ba bản sao vẫn giống hệt nhau — tách dựa trên bằng chứng, không phỏng đoán.

**7. Hạn mức lượt dùng: CHỈ áp cho tiếng Anh. Các môn khác không giới hạn.**
Quyết định của chủ dự án, **sửa lại** phần "kho chung toàn nền tảng" ở quyết định 3.

- `english` giữ nguyên xi cơ chế hiện có (cửa sổ trượt 7 ngày cho Free, hạn mức ngày cho Pro/VIP).
- Môn mới mở ra không giới hạn — ưu tiên để người học dùng thoải mái khi môn còn mới, chưa có
  người dùng, và cần thu hút.

**Thi hành bằng cấu hình, không bằng `if` rải rác trong code:** bảng `subject_limits(subject,
enforced)`, `english` = `true`, còn lại = `false`. `consumeUsage()` vẫn được gọi ở **mọi** môn,
nhưng khi `enforced = false` thì chỉ ghi nhận vào `usage_events` rồi cho qua.

**Rủi ro đã nêu với chủ dự án và được chấp nhận:** không hạn mức nghĩa là **chi phí AI không có
trần** — một người dùng hoặc một script có thể gọi hàng nghìn lượt/ngày. Hai biện pháp giảm nhẹ, cả
hai đều **không** làm phiền người dùng thật:

1. **Vẫn đếm dù không chặn** — nếu không đếm thì không biết môn Toán tốn bao nhiêu cho tới lúc nhận
   hoá đơn, và cũng không có cơ sở để chọn hạn mức hợp lý khi cần bật.
2. **Phanh tay bật được trong vài giây** — admin đổi `enforced` sang `true` cho riêng một môn, không
   cần deploy.

Rate limit kỹ thuật chống spam theo IP/token (`api/_lib/security.ts`) **vẫn áp cho mọi môn** — đó là
bảo vệ hạ tầng, khác với hạn mức nghiệp vụ, và không được tắt.

**8. ĐẢO LẠI mục 7 (2026-07-31, cùng ngày): hạn mức lượt AI các môn khác áp dụng BẰNG môn tiếng Anh.**
Quyết định mới nhất của chủ dự án — mục 7 ở trên **không còn hiệu lực**, giữ lại nguyên văn chỉ để
biết đã từng cân nhắc phương án "không giới hạn" và tại sao đổi ý (an toàn chi phí hơn).

- Mọi môn (`english`, `math`, `ly`, `hoa`, …) dùng **chung một bộ hạn mức** — cùng cơ chế cửa sổ
  trượt 7 ngày cho Free, cùng hạn mức ngày cho Pro/VIP như tiếng Anh hiện có.
- Hạn mức là **kho chung theo người dùng**, không cộng dồn theo môn (khớp lại với ý ban đầu ở
  quyết định 3: "một tài khoản, một gói cước dùng cho mọi môn").
- Bảng `subject_limits(subject, enforced)` ở mục 7 **vẫn giữ lại** nhưng đổi giá trị mặc định:
  mọi môn `enforced = true` ngay từ đầu. Bảng này vẫn có ích làm phanh tay — nếu môn nào cần nới
  tạm thời (ví dụ giai đoạn ra mắt), admin bật `enforced = false` cho riêng môn đó, không cần deploy.
- `usage_events` vẫn đếm theo `(user_id, day, subject, mode)`, nhưng khi tính "còn bao nhiêu lượt
  hôm nay" của Free thì **cộng gộp mọi `subject`** của user trong ngày/cửa sổ trượt, không tách riêng
  theo môn — đúng nghĩa "kho chung".

**Vì sao đổi:** để hạn mức "không giới hạn" (mục 7) là chấp nhận rủi ro chi phí AI không trần cho một
tính năng đang thử nghiệm; chủ dự án thấy dùng cùng hạn mức đã kiểm chứng với tiếng Anh an toàn hơn
và nhất quán hơn với nguyên tắc "một gói cho mọi môn" đã đặt ra từ đầu, và có thể nới sau bằng
`subject_limits` khi thật sự cần chứ không mặc định mở toang.
