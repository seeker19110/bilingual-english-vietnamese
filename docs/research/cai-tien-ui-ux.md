# Nghiên cứu: Cải tiến UI/UX toàn app

> Ngày: 2026-07-04 · Trạng thái: **ĐỀ XUẤT — chờ người dùng duyệt thứ tự ưu tiên trước khi code**
> Phương pháp: lái app THẬT bằng Playwright ở khổ mobile 375×812 (chụp toàn bộ 12 trang chính +
> các luồng tương tác: đăng nhập, onboarding, hội thoại chat có mock API, thẻ từ tab Hôm nay,
> trang chủ khi đã có tiến độ), đo bằng máy (cuộn ngang, kích thước vùng chạm, vị trí phần tử),
> và đối chiếu checklist trong `docs/framework/BO-SUNG-chat-luong-Nhom-2.md` (mục 1 mobile-first,
> mục 5 UI/UX 4 trạng thái). Mọi phát hiện dưới đây đều có bằng chứng đo/chụp thật — không suy đoán.
> Tài liệu anh em: `cai-tien-lo-trinh-hoc.md` (nội dung học — đã code xong 5 đợt, PR #190).

---

## 1. Tóm tắt cho người bận (TL;DR)

Nền UI hiện tại **tốt hơn mặt bằng chung**: không có cuộn ngang ở bất kỳ trang nào (đo 12 trang),
a11y 0 lỗi critical/serious trên cả 4 theme (axe trong E2E), có `prefers-reduced-motion`, có
`pb-safe`/`pt-safe`, input chat 16px không gây zoom iOS, skeleton/empty state hầu hết đã có.
Vấn đề còn lại tập trung vào **luồng sử dụng hằng ngày** chứ không phải thẩm mỹ:

| #   | Vấn đề                                                                                                                                          | Tác động                               | Sửa khó/dễ    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------- |
| U1  | **Trang chủ là menu tĩnh** — không có "Học tiếp", không hiện thẻ SRS đến hạn/mục tiêu ngày; người quay lại phải tự nhớ + 3 chạm mới tới chỗ học | 🔴 Ma sát mỗi ngày                     | Vừa           |
| U2  | **Không có thanh điều hướng dưới** — đổi chế độ nào cũng phải quay về Home (2-3 chạm)                                                           | 🔴 Ma sát mỗi ngày                     | Vừa           |
| U3  | **Onboarding hỏi 3 câu nhưng KHÔNG dùng câu trả lời** — "AI sẽ điều chỉnh độ khó" là lời hứa chưa thực hiện                                     | 🔴 Mất niềm tin + bỏ lỡ cá nhân hóa rẻ | Dễ            |
| U4  | **Chat: hàng nhập tràn 15px ở 375px** — nút gửi dính sát mép phải màn hình (input thiếu `min-w-0`)                                              | 🟡 Bug layout thật                     | Rất dễ        |
| U5  | **Chat: cưỡng bức chờ 10s giữa MỖI tin nhắn** — gãy nhịp hội thoại luyện tập                                                                    | 🟡 Ma sát tính năng chính              | Dễ (cần chốt) |
| U6  | **Lỗi kỹ thuật tiếng Anh phơi nguyên văn ra UI** ("Invalid API response: missing content")                                                      | 🟡 Thiếu chuyên nghiệp                 | Dễ            |

Kèm 5 vấn đề nhỏ hơn (U7–U11) và kế hoạch **5 đợt PR nhỏ** ở mục 5.

---

## 2. Hiện trạng (đo thật, khổ mobile 375×812)

### 2.1 Những cái ĐANG LÀM ĐÚNG (giữ nguyên, không đụng)

- **Không cuộn ngang** ở cả 12 trang (đo `scrollWidth` vs `clientWidth`).
- **A11y**: 68/68 E2E xanh gồm axe quét 4 theme — 0 critical/serious; `aria-label` đầy đủ trên
  nút icon; `prefers-reduced-motion` có xử lý (`index.css:267`).
- **Safe area**: header `pt-safe`, thanh nhập chat `pb-safe` — đúng checklist tai thỏ.
- **Input chat 16px** (`text-base sm:text-sm`) — không gây zoom bất ngờ trên iOS, đúng khung.
- **Ô tìm kiếm Từ điển/Bài hội thoại ghim đáy màn** — đúng vùng ngón cái, làm tốt hơn nhiều app.
- **Thẻ từ (WordCard)**: chữ to, IPA, bấm-để-lật, nút "Để sau/Đã thuộc" to rõ (≥44px), chấm phát âm ngay trên thẻ.
- **Khối "Nhận xét" trong chat** tách riêng bong bóng, viền hổ phách + ✅, bấm nghe được — đúng điểm khác biệt sản phẩm.
- **Màn thiết lập Chat/Speaking** gọn: 1 dropdown + 3 mức + 1 CTA; có mô tả mức ("B1–B2, giao tiếp thường ngày").
- **Onboarding UI** đẹp, 3 bước có progress bar (vấn đề nằm ở chỗ dữ liệu không được dùng — xem U3).
- **Login** gọn, có social login, đổi VI/EN ngay tại chỗ.

### 2.2 Cấu trúc điều hướng hiện tại

```
Home (7 card dọc + 3 ô setting + 2 nút Tiến độ/Lịch sử + Mẹo)
 ├─ Từ điển · Lộ trình · Bài hội thoại · Câu thông dụng · Chat · Nói · Viết   ← 7 card ngang hàng
 ├─ /learning-path → /learning-path/a1..b2 (5 tab: Bài học·Hôm nay·Ôn SRS·Từ khó·Kiểm tra)
 └─ Header mọi trang: ← về Home · palette theme · avatar → /profile
Footer lặp ở mọi trang: QuickActions (Lộ trình · Chia sẻ · Nhắc học)
```

Không có bottom-nav. Đường về chỗ học hằng ngày: Home → Lộ trình → trang cấp → tab Hôm nay = **3 chạm + 2 lần tải trang**, lặp lại mỗi ngày.

---

## 3. Phân tích vấn đề chi tiết

### U1 — Trang chủ là menu tĩnh, không phải "hôm nay bạn học gì" 🔴

Chụp màn Home với người dùng ĐÃ có tiến độ (streak 5, 120 từ): giao diện **y hệt** người mới —
7 card ngang hàng, không mục nào phản ánh trạng thái học (chỉ số streak đổi). Không có:

- "Học tiếp: 👋 Đại từ & lời chào (5/16)" — dù `findNextStep` đã tính sẵn ở trang cấp;
- "🔁 12 thẻ đến hạn ôn" — dù `getSRSStats` đã có, và đây là việc QUAN TRỌNG NHẤT mỗi ngày với SRS;
- "Hôm nay: 3/10 từ mới" — dù Dashboard đã tính.

Nguyên tắc bị vi phạm: màn hình đầu tiên của app dùng-hằng-ngày phải trả lời "**hôm nay tôi cần làm gì?**",
không phải "app này có những gì?". Duolingo/Anki đều mở thẳng vào bài hôm nay.

**Đề xuất:** thêm 1 **thẻ "Học tiếp" nổi bật đầu trang Home** (trên 7 card): mục kế tiếp từ
`findNextStep` + badge SRS đến hạn + progress mục tiêu ngày; bấm vào đi THẲNG tới tab tương ứng
của trang cấp. 7 card giữ nguyên bên dưới (vẫn là menu đầy đủ). Dữ liệu đều có sẵn — chỉ là UI mới.

### U2 — Không có bottom-nav; footer hiện tại không phải điều hướng 🔴

Mọi trang có footer QuickActions (Lộ trình · Chia sẻ · Nhắc học) — trông giống tab bar nhưng
không phải: "Chia sẻ"/"Nhắc học" là hành động phụ, tần suất dùng thấp, lại chiếm vị trí đắt nhất
màn mobile. Trong khi đó đổi từ Chat sang Nói phải: ← về Home, cuộn, bấm card (3 chạm).

**Đề xuất:** bottom tab bar cố định 4 mục: **Trang chủ · Lộ trình · Luyện tập · Tiến độ**
("Luyện tập" mở sheet chọn Chat/Nói/Viết, hoặc nhớ chế độ dùng gần nhất). QuickActions
(Chia sẻ/Nhắc học) dời về trang Hồ sơ/Tiến độ. Đây là thay đổi bố cục lớn nhất trong tài liệu
này — cần người dùng chốt trước khi làm (mục 6, câu 1).

### U3 — Onboarding hỏi nhưng không dùng câu trả lời 🔴 (sửa rẻ nhất, đáng làm sớm)

Onboarding 3 bước hỏi: trình độ (Cơ bản/Trung cấp/Nâng cao — kèm lời hứa _"AI sẽ điều chỉnh độ
khó phù hợp"_), mục tiêu, số phút/ngày → `saveOnboarding()` ghi lên Supabase (`lib/cloud.ts:273`)
— và **không một dòng code nào đọc lại** (`grep` toàn repo: chỉ nơi ghi, không nơi đọc). Hệ quả:

- Chọn "Nâng cao" xong, vào Chat/Speaking mặc định vẫn "Trung cấp"; lộ trình vẫn bắt đầu A1 mà
  không gợi ý nút "Tôi đã biết vòng này" (vừa làm ở PR #190).
- Chọn "5 phút/ngày" nhưng tốc độ học mặc định vẫn 10 từ/ngày, không ai nối 2 thứ với nhau.

**Đề xuất:** đọc lại 3 câu trả lời và nối vào những gì ĐÃ CÓ:
`level` → mặc định Trình độ của Chat/Speaking + (nếu ≥ Trung cấp) banner gợi ý test-out trên
trang A1; `dailyMinutes` → map sang tốc độ 5/10/20 (`setDailySpeed`); `goal` → chọn card nào
được đề xuất đầu trang Home. Toàn bộ là nối dây, không cần tính năng mới.

### U4 — Chat: hàng nhập tràn 15px, nút gửi dính mép màn hình 🟡 (bug thật, sửa 1 dòng)

Đo thật ở 375px: container `px-4` (16px mỗi bên) nhưng nút gửi có `right = 374px` — tức tràn
15px vào vùng padding phải, sát mép màn 1px (ảnh chụp thấy rõ nút bị "cắt"). Nguyên nhân:
`<input>` là flex item có `min-width:auto` mặc định → không co xuống dưới bề rộng nội tại,
đẩy cả hàng vượt container. Hàng: `[+ 38px] [input 268px] [gửi 36px]` + 2 gap 8px = 358px >
343px khả dụng.

**Đề xuất:** thêm `min-w-0` vào input (`Chat.tsx:537`) — 1 class. Kiểm tra luôn hàng tương tự ở
Speaking nếu có.

### U5 — Chat: chờ 10 giây giữa mỗi tin nhắn 🟡 (cần người dùng quyết)

`useApiThrottle` mặc định `delayMs = 10000` — sau MỖI tin nhắn, nút gửi khóa 10s với đồng hồ đếm
ngược. Với "Chat với gia sư" (tag "Phổ biến") — hội thoại tự nhiên có nhịp 2-5s/lượt — 10s mỗi
lượt làm gãy dòng chảy, người dùng gõ xong phải ngồi nhìn đồng hồ. Đây rõ ràng là van chống spam/
tiết kiệm chi phí API (chính đáng!), nhưng 10s là quá tay so với mục đích:
giới hạn lượt/ngày đã có riêng (`daily_usage`), nên throttle chỉ cần chặn double-click và bão request.

**Đề xuất:** giảm còn **3s** (vẫn chặn spam gõ liên tục, gần như vô hình với người dùng thật) —
hoặc giữ 10s nhưng chỉ áp từ tin thứ N trong 1 phút. Ảnh hưởng chi phí: số lượt/ngày đã bị cap
riêng nên thay đổi này KHÔNG tăng trần chi phí, chỉ tăng nhịp trong phiên. Cần người dùng chốt (mục 6, câu 2).

### U6 — Thông báo lỗi kỹ thuật tiếng Anh phơi ra UI 🟡

Chụp được thật khi API trả sai định dạng: toast đỏ đầu màn + hộp đỏ inline cùng hiện
**"Invalid API response: missing content"** — nguyên văn `Error.message` từ `lib/ai.ts:41`
(còn có "API returned empty content array", "API returned non-string text"). Toast đè lên cả
nút header. Người học tiếng Anh trình độ A1 nhìn lỗi này không hiểu gì và không biết làm gì tiếp.
Vi phạm trực tiếp checklist khung: _"Lỗi: thông báo thân thiện (không phơi stack trace) + nút thử lại"_.

**Đề xuất:** tầng UI bắt mọi lỗi từ `callClaude` → hiện 1 thông điệp tiếng Việt thống nhất
("Có lỗi khi kết nối gia sư AI. Bấm thử lại nhé!") + nút Thử lại (giữ nguyên tin nhắn đã gõ);
message kỹ thuật đẩy vào `console.warn` + Sentry (đã có). Hiện 1 CHỖ (inline), bỏ toast trùng.

### U7 — Trang cấp CEFR: lặp ngữ cảnh, nội dung học bị đẩy xuống thấp 🟡

Ở tab "Hôm nay" (màn học chính mỗi ngày), từ trên xuống: header app → breadcrumb "Lộ trình A1→B2"
→ 5 tab → tiêu đề LỚN "A1 — Sơ cấp" → subtitle "Người mới bắt đầu" → chip vòng → hàng progress →
**rồi mới tới thẻ từ** (~600px từ đỉnh màn). Người học nhìn "A1 — Sơ cấp / Người mới bắt đầu"
lặp lại mỗi ngày không thêm thông tin gì. Ngoài ra dòng "Tổng đã thuộc: **0/10199**" lấy tổng
CẢ LỘ TRÌNH 10.199 từ (gồm 8.5k từ Mở rộng) — với người học A1 con số này vô nghĩa và gây nản
(học 1 năm vẫn thấy ~5%). Footer QuickActions cũng lặp ở đây.

**Đề xuất:** ở 4 tab học (không phải tab Bài học): thu tiêu đề cấp thành 1 dòng nhỏ cạnh
breadcrumb; đổi "Tổng đã thuộc 0/10199" → tiến độ CỦA CẤP ("A1: 45/379") — tổng lộ trình đã có ở
trang Tiến độ; cân nhắc bỏ QuickActions ở màn học. Mục tiêu: thẻ từ hiện trong ~250px đầu.

### U8 — 350 bài hội thoại + 300 chủ đề câu: danh sách phẳng, không dấu vết học 🟡

`Lessons.tsx` và `CommonPhrases.tsx` không lưu bất kỳ trạng thái đã xem/đã học nào (grep: 0 chỗ
đụng localStorage/progress). Người xem đến bài 20 hôm qua, hôm nay mở lại thấy đúng danh sách
như lần đầu, tự nhớ mình tới đâu. 350 mục trong 1 danh sách phẳng cũng không nhóm theo chủ đề/cấp.

**Đề xuất:** (a) lưu Set "đã xem" (localStorage như `cefrProgress`) → chip ✓ mờ trên bài đã xem +
nút "Tiếp tục bài N" đầu trang; (b) nhóm danh sách theo cụm 10 bài hoặc theo chủ đề. Không cần
đồng bộ Supabase ở bước đầu (giá trị chính là trong-thiết-bị).

### U9 — Vùng chạm < 44px ở vài nút dùng thường xuyên 🟢

Đo tự động các phần tử tương tác trong viewport (ngưỡng gắt của khung là 44px, đo lỏng 36px vẫn dính):

| Phần tử                                    | Kích thước đo được | Ghi chú                              |
| ------------------------------------------ | ------------------ | ------------------------------------ |
| Avatar mở Hồ sơ (header, mọi trang)        | 28×28              | nút vào Profile duy nhất trên header |
| Nút Nữ/Nam (header Từ điển/Bài hội thoại)  | 75×23              | cao 23px — dễ bấm trượt              |
| Nút ‹ › chuyển "Từ vựng hôm nay" (Từ điển) | 24×24              |                                      |
| Chip từ gợi ý "Chủ đề phổ biến" (Từ điển)  | ~50×26             |                                      |
| Breadcrumb "‹ Lộ trình A1 → B2"            | 126×20             |                                      |
| Chip vòng từ vựng trong unit (trang cấp)   | ~150×30            |                                      |

**Đề xuất:** tăng padding/hit-area lên ≥44px (giữ hình thức hiện tại, nới `p-*` hoặc thêm
`before:absolute before:-inset-*`). Làm 1 lượt trong 1 PR nhỏ.

### U10 — Copy quá đát / không nhất quán 🟢

- Login: _"Dữ liệu lưu trên máy bạn · Hoàn toàn riêng tư"_ — **đã sai** từ khi đồng bộ Supabase
  (chat/viết/nói/tiến độ đều lưu server, RLS). Còn bỏ lỡ điểm cộng thật: "đổi máy không mất tiến độ".
- Trang chủ: badge "Không giới hạn" lặp trên 3/7 card — thông tin thấp, chiếm chỗ tiêu đề (card
  "Các câu thông dụng" bị đẩy xuống 2 dòng vì badge). Có thể chỉ badge những card CÓ giới hạn.
- Từ điển ghi "10.006 từ" / Home ghi "10.000 từ" / FAQ ghi "7400+ từ" (index.html) — 3 con số khác nhau.

### U11 — Empty state thiếu hành động 🟢

Lịch sử rỗng: "Chưa có lịch sử nào. Bắt đầu luyện tập để xem lại ở đây!" — đúng thông điệp nhưng
**không có nút** đi luyện tập (checklist khung: _"Rỗng: thông điệp rõ + hành động gợi ý"_).
Tương tự rà thêm: Từ khó rỗng (đã có hướng dẫn ⭐, đạt), Kiểm tra khi chưa học từ (đạt).

---

## 4. Những thứ đã rà và KHÔNG phải vấn đề

- Cuộn ngang: 0/12 trang. · Tương phản màu: axe pass cả 4 theme. · Zoom input iOS: input ≥16px.
- `prefers-reduced-motion`: có xử lý toàn cục. · Safe-area: có `pt-safe`/`pb-safe`.
- Khối sửa lỗi trong Chat: đã tách bong bóng riêng đẹp (lỗi tôi tưởng gặp hóa ra do mock sai định dạng).
- Skeleton loading: có component + dùng ở các trang nạp dữ liệu.

---

## 5. Kế hoạch thực hiện đề xuất (mỗi đợt 1 PR nhỏ, kiểm tra được)

| Đợt     | Nội dung                                                                                                                  | Vấn đề           | File chính                                                                        | Rủi ro                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **U-1** | Vá nhanh: `min-w-0` input chat · thông điệp lỗi thân thiện · vùng chạm ≥44px · copy (login/badge/số từ) · CTA empty state | U4 U6 U9 U10 U11 | `Chat.tsx`, `lib/ai.ts` (hoặc tầng gọi), `Layout.tsx`, `Login.tsx`, `History.tsx` | Thấp — toàn sửa điểm                                                   |
| **U-2** | Thẻ "Học tiếp" đầu trang Home (mục kế tiếp + SRS due + mục tiêu ngày)                                                     | U1               | `Home.tsx` (+ đọc `cefrProgress`/`srs`/`curriculum`)                              | Thấp — thêm UI, không đổi luồng cũ                                     |
| **U-3** | Nối onboarding → mặc định app (level→độ khó Chat/Nói + gợi ý test-out; phút/ngày→tốc độ 5/10/20)                          | U3               | `Onboarding.tsx`, `lib/cloud.ts`, `Chat/Speaking.tsx`                             | Thấp — chỉ đặt MẶC ĐỊNH, người dùng đổi được                           |
| **U-4** | Gọn header 4 tab học trang cấp + đổi "0/10199" → tiến độ cấp + bỏ QuickActions ở màn học                                  | U7               | `CefrLevelPage.tsx`, `StudyTabs.tsx`                                              | Vừa — đổi bố cục màn học chính                                         |
| **U-5** | Bottom tab bar (Trang chủ·Lộ trình·Luyện tập·Tiến độ) + dời QuickActions · đánh dấu "đã xem" Lessons/Phrases              | U2 U8            | `App.tsx`, component mới `BottomNav`, `Lessons/CommonPhrases.tsx`                 | Cao hơn — đổi khung điều hướng, cần chốt UX                            |
| _(rời)_ | Giảm throttle chat 10s → 3s (hoặc luật khác)                                                                              | U5               | `useApiThrottle` (1 hằng số)                                                      | Không tăng trần chi phí (đã cap lượt/ngày) — nhưng cần người dùng chốt |

Thứ tự đề xuất: **U-1 trước** (toàn vá điểm, gọn 1 PR), U-2/U-3 tiếp (giá trị/công sức cao nhất),
U-4 sau, U-5 cuối (đổi lớn nhất, cần duyệt).

## 6. Câu hỏi cần người dùng chốt trước khi code

1. **Bottom tab bar** (đợt U-5) — đồng ý đổi khung điều hướng? Nếu chưa chắc, có thể làm U-2
   (thẻ Học tiếp) trước rồi xem còn cần bottom-nav không.
2. **Throttle chat**: giảm 10s → 3s? (không tăng trần chi phí vì lượt/ngày đã cap riêng — chỉ
   mượt hơn trong phiên).
3. Thẻ "Học tiếp" trên Home đặt **trên** hàng 3 ô (Ngôn ngữ/Streak/Giọng) hay **dưới** nó?
4. Badge "Không giới hạn": bỏ hẳn, hay đổi thành thông tin hữu ích hơn (vd số bài/số từ)?

---

## 7. Bằng chứng khảo sát

- Ảnh chụp 12 trang + 6 luồng (khổ 375×812, DPR 2) — chụp trong phiên làm việc, mô tả từng phát
  hiện đã ghi ở mục 3 (ảnh không commit vào repo để khỏi phình).
- Số đo cụ thể ghi trong bảng U9; đo hàng nhập chat: `+ (16..54) · input (62..330) · gửi (338..374)`
  trên viewport 375px với container `px-4`.
- Grep xác nhận U3 (không nơi nào đọc `saveOnboarding` data) và U8 (Lessons/CommonPhrases không có
  state đã xem).
