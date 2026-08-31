# Tổng hợp Nghiên cứu: Companion Va Personal Policy

Tài liệu này gộp từ 9 tài liệu nghiên cứu liên quan.

---

## [1] Tài liệu: dac-ta-companion-4-tru-chi-doc-2026-08-27.md

_(Chi tiết nguồn gốc: `dac-ta-companion-4-tru-chi-doc-2026-08-27.md`)_

# Đặc tả — Companion nhìn thấy dữ liệu 4 trụ Career/Work/Startup/Life (bản CHỈ-ĐỌC)

- **Ngày:** 2026-08-27
- **Trạng thái:** **Approved for implementation**
- **Người/ngày duyệt:** người dùng chốt 2026-08-27 (chọn phương án "làm bản chỉ-đọc trước,
  phần ghi tách đợt sau" khi được hỏi giữa hai lựa chọn: viết đặc tả đầy đủ cho cả phần ghi,
  hay làm ngay bản chỉ-đọc an toàn).
- **Bối cảnh phát sinh:** đợt quét trụ cột dự án 2026-08-27.

## 1. Vấn đề

`CLAUDE.md` mục 1 mô tả Companion là **"tác tử AI xuyên suốt"** cả 5 trụ. Đo mã thật cho thấy
không phải vậy:

| Điểm                        | Hiện trạng trước đợt này                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Read model nạp vào ngữ cảnh | Chỉ trụ **Learning** (`companionRuntime.ts` có đúng một nhánh `if (domain === 'learning')`)                                    |
| Nhận diện ý định            | Không có mẫu câu nào cho Career/Work/Startup/Life                                                                              |
| Domain mặc định             | Rơi về `learning` — mọi câu không nhận diện được đều bị gán trụ Học tập                                                        |
| Capability của planner      | 4 cái, đều thuộc Learning/personal: `learning.update_goal`, `dictionary.lookup`, `profile.update_fact`, `memory.create_record` |

Hệ quả cụ thể: hỏi Companion về sự nghiệp thì nó **trả lời được nhưng không thấy dữ liệu** —
dù 4 trụ này có 16 bảng và 5 service đầy đủ (`careerService` 430 dòng/test 814,
`workService` 422/798, `startupService` 332/430, 2 service Life 1.361/472).

## 2. Phạm vi đợt này — CHỈ-ĐỌC

**LÀM:** Companion **đọc** được tóm tắt dữ liệu 4 trụ để trả lời đúng ngữ cảnh.

**KHÔNG LÀM (tách đợt sau, cần đặc tả riêng):** thêm capability **ghi** cho 4 trụ (tạo mục tiêu
nghề nghiệp, thêm việc, thêm thói quen…). Lý do tách: chạm dữ liệu người dùng thật thuộc diện
`CLAUDE.md` mục 12 "phải dừng và hỏi"; phần ghi còn phải chốt mức rủi ro từng capability và cơ
chế xác nhận, đủ lớn để đứng riêng.

Hôm nay muốn Companion thay đổi dữ liệu 4 trụ thì vẫn phải đi qua `proposedActionService`
(người dùng bấm xác nhận) như mọi hành động có rủi ro khác — đợt này **không nới** đường đó.

## 3. Thiết kế

### 3.1. Read model — `packages/core-domains/domainReadModelService.ts`

Theo đúng khuôn `core-learner/learningReadModelService`: một hàm `get*ReadModel` nạp dữ liệu,
một hàm `format*ForContext` dựng chuỗi một dòng, và một hàm điều phối
`getDomainReadModelForContext(pool, personId, domain)` trả `null` cho trụ ngoài nhóm.

| Trụ     | Trường tóm tắt                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Career  | vị trí hiện tại/mục tiêu · số năm kinh nghiệm · ngành · số kinh nghiệm đã ghi · số mục tiêu đang theo đuổi · tối đa 5 kỹ năng mục tiêu cần |
| Work    | số dự án đang chạy · đếm việc theo 4 trạng thái · số việc **quá hạn mà chưa xong** · số việc khẩn cấp chưa xong                            |
| Startup | số venture · tên + giai đoạn venture gần nhất · số vấn đề và đếm giả định theo 4 trạng thái **của venture gần nhất**                       |
| Life    | số kế hoạch đang chạy · số thói quen đang bật · chuỗi ngày dài nhất · điểm tự chấm gần nhất                                                |

**Vì sao Startup chỉ đếm cho venture gần nhất:** `listProblems`/`listHypotheses` gắn theo
**venture** (`ventureId` là tham số bắt buộc), không theo người. Lặp mọi venture sẽ thành N
truy vấn; venture gần nhất cũng chính là cái người dùng đang nói tới khi mở lời.

### 3.2. Riêng tư — hai ràng buộc bất biến, đều phải có test canh gác

1. **Không lấy nội dung tự do nhạy cảm.** Chỉ số đếm, trạng thái, tiêu đề ngắn. Cụ thể cấm:
   `notes` của `wellbeing_checks` (nhật ký cảm xúc) và `description` dài của dự án/venture.
2. **Không lách cổng đồng ý.** Khối tóm tắt chỉ **thực sự** được nạp khi
   `isConsentActive(personId, domain, purpose)` trong `contextEngine` cho phép. Mã read model
   chỉ đưa `domainState` vào rồi để cổng quyết định — **không** tự kiểm tra thay, **không** bỏ qua.

Hai ràng buộc này nối tiếp tinh thần "danh sách trường được xem là ĐÓNG" của tính năng
"Người thân theo dõi" (`docs/research/dac-ta-nguoi-dong-hanh-2026-08-26.md`).

### 3.3. Nhận diện trụ

Bảng từ khoá **tất định**, không hỏi LLM: bước này chạy trước cả khi dựng ngữ cảnh nên phải rẻ,
nhanh, và cho cùng kết quả với cùng câu để test kiểm được. Nhận diện sai chỉ làm nạp thiếu/thừa
một khối tóm tắt, không phá hỏng lượt thoại.

**Thứ tự nhánh là ràng buộc thiết kế, không phải chi tiết cài đặt:**

1. Các ý định **HÀNH ĐỘNG** (tra từ · cập nhật hồ sơ · ghi nhớ) xét **trước** bảng từ khoá trụ.
   Nếu không, câu "ghi nhớ giúp tôi **cuộc họp** ngày mai" chứa từ khoá trụ Work sẽ bị cướp khỏi
   ý định `create_memory`.
2. Nhánh **"mục tiêu"** phải hỏi bảng từ khoá **trước** khi kết luận là mục tiêu HỌC TẬP —
   "mục tiêu" là từ chung của cả 5 trụ, để nguyên thì câu "mục tiêu sự nghiệp của tôi là gì"
   bị gán `learning`.

**Giới hạn chấp nhận:** câu gọi tên nhiều trụ cùng lúc ("cân bằng cuộc sống và công việc") lấy
trụ đứng trước trong bảng. Không có đáp án đúng duy nhất cho loại câu đó nên bảng cố ý không cố
xử lý; giao diện vẫn truyền `targetDomain` tường minh được và giá trị đó luôn thắng bảng từ khoá.

### 3.4. Đổi domain mặc định `learning` → `general`

`general` **không phải giá trị mới**: `synthesizeCompanionReply` vốn đã xử lý riêng
(`domain !== 'general' && domain !== 'all'` → bỏ dòng "lĩnh vực trọng tâm"), tức nó vốn là giá
trị trung tính có chỗ đứng trong mã.

Ba nơi khẳng định mặc định cũ phải được cập nhật **kèm lý do tại chỗ**:
`companionRuntime.test.ts`, `scripts/eval-v2-routing.test.ts`, và các ca `gen-*` trong
`scripts/eval-v2-routing-fixtures.json`.

## 4. Tiêu chí chấp nhận

- [x] `getDomainReadModelForContext` trả chuỗi tóm tắt cho đủ 4 trụ, `null` cho trụ khác.
- [x] Companion nạp đúng read model theo `domain`, `provenance` là `<domain>:read_model`.
- [x] Read model hỏng → vẫn trả lời được, chỉ thiếu ngữ cảnh (có test).
- [x] Nhật ký cảm xúc không lọt vào model lẫn chuỗi đã format (có test).
- [x] Câu "ghi nhớ … cuộc họp …" vẫn ra `create_memory` (có test).
- [x] Câu "mục tiêu sự nghiệp …" ra `career`, không phải `learning` (có test).
- [x] `targetDomain` tường minh luôn thắng bảng từ khoá (có test).
- [x] Bộ eval định tuyến mở rộng để có ca cho 4 trụ; độ chính xác không tụt dưới ngưỡng 85%.
- [x] Không có migration; không đụng prompt/model AI.

## 5. Việc tách ra đợt sau

1. **Capability GHI cho 4 trụ** — cần đặc tả riêng: danh sách capability, mức rủi ro từng cái,
   cơ chế xác nhận, và cách hiện "tác vụ đề xuất" trên giao diện từng trụ.
2. **Nợ có sẵn `mem-7`**: câu "nhớ giúp tôi là tôi mệt" ra `update_profile_fact` thay vì
   `create_memory` vì chứa "tôi là" và nhánh `profile` đứng trước nhánh `memory`. Đã kiểm chứng
   là lỗi có TRƯỚC đợt này (trên `origin/main`, nhánh Profile dòng 141 vốn đứng trước Memory
   dòng 155). Đảo thứ tự có thể hỏng ca khác nên cần đợt riêng đo lại toàn bộ bộ eval.
3. **Điều hướng 5 trụ** — `BottomNav` cho Learning 2 tab còn 4 trụ kia gộp dưới tab Hồ sơ.
   Đây là quyết định sản phẩm, chờ người dùng chốt.

---

## [2] Tài liệu: dac-ta-nguoi-dong-hanh-2026-08-26.md

_(Chi tiết nguồn gốc: `dac-ta-nguoi-dong-hanh-2026-08-26.md`)_

# Đặc tả: "Người đồng hành" — báo cáo tuần cho phụ huynh / thầy cô — 2026-08-26

> Trạng thái: **ĐẶC TẢ, CHƯA TRIỂN KHAI**. Research-first theo KHUNG 3 · CLAUDE.md mục 0.
> Ý tưởng #2 trong đợt đề xuất tích hợp 2026-08-26; người dùng chọn "1-2 làm trước".
> Điểm chạm dự kiến: `postgres/migrations/0069_companion_links.sql` ·
> `packages/core-personal/companionLinkService.ts` · `packages/core-contracts/companionLink.ts` ·
> `apps/server/src/api/personal/companion-link.ts` ·
> `apps/server/src/api/_lib/weeklyReport.ts` (nội dung thuần, có test) ·
> `apps/dhcb/src/pages/core/Profile.tsx` (khối bật/tắt).
>
> ⚠️ **Đặt tên tránh nhầm:** "Companion — Bạn Đồng Hành" đã là tên tác tử AI của nền tảng
> (`apps/server/src/api/personal/companion.ts`). Tính năng này là **người thật**, nên trong code
> dùng `companion_link` / "người theo dõi" và trong giao diện gọi là **"Người thân theo dõi"** —
> KHÔNG dùng lại chữ "Bạn Đồng Hành".

## 1. Vấn đề

Người **học** là học sinh; người **trả tiền** là phụ huynh. Hiện app không có đường nào để phụ
huynh thấy giá trị họ đang mua. Hệ quả: gia hạn Pro phụ thuộc hoàn toàn vào việc đứa trẻ tự xin
tiền — kênh yếu nhất có thể có.

Ngoài doanh thu, đây còn là đòn bẩy **giữ chân**: học một mình thì bỏ dễ; có một người lớn hỏi
"tuần này con học gì thế" mỗi tuần thì khó bỏ hơn nhiều.

## 2. Nghiên cứu — vì sao chọn cách này

**Ba khuôn trên thị trường:**

| Khuôn                                           | Đại diện                                           | Đánh giá                                                                                |
| ----------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Tài khoản phụ huynh riêng, quản lý con          | Khan Academy, Duolingo for Schools                 | Mạnh nhất nhưng nặng: cần luồng đăng ký riêng, quyền quản trị, đổi mô hình tài khoản    |
| **Liên kết 1-1 + báo cáo đẩy qua email (CHỌN)** | Duolingo "weekly progress email", Strava followers | Nhẹ nhất, dùng lại hạ tầng email đã chạy, không đổi mô hình tài khoản                   |
| Bảng điều khiển thời gian thực cho phụ huynh    | Một số app luyện thi VN                            | Biến app thành công cụ giám sát → phá hỏng quan hệ đồng hành, trái luật hành xử đã chốt |

Chọn khuôn 2. Ba lý do cụ thể với DHCB:

1. **Hạ tầng đã có gần đủ.** `emailReminders.ts` đã chạy scheduler thật, `mailQuota.ts` đã lo
   trần mail/ngày + kênh dự phòng, `friends.ts`/`friend_code` đã giải xong bài toán "mời bằng mã",
   `consents.ts` đã có mô hình cấp/thu hồi quyền có lịch sử.
2. **Không tốn token AI.** Báo cáo là số liệu tổng hợp + một câu gợi ý chọn từ bảng mẫu — đây là
   đòn bẩy doanh thu rẻ nhất trong danh sách đề xuất.
3. **Đúng tư thế sản phẩm.** `dong-hanh-va-phat-trien-nang-khieu-2026-08-23.md` (8 luật hành xử
   theo SDT) chống lại mọi thứ làm xói mòn tự chủ. Bảng giám sát thời gian thực là đúng thứ bị
   chống. Báo cáo tuần do người học **tự bật** thì không.

## 3. Luật riêng tư (phần quan trọng nhất — ràng buộc kỹ thuật, không phải tuỳ chọn)

Lấy nguyên tinh thần đã áp cho tính năng "Đi chung" (`dac-ta-chia-se-vi-tri-2026-08-26.md` mục 3):

1. **Mặc định TẮT.** Không có liên kết nào tự sinh ra. Người học phải tự tạo mã mời.
2. **Người học là bên cấp quyền, luôn luôn.** Mã mời do **người học** tạo, người thân nhập mã.
   Không có đường ngược lại (người lớn không "thêm con" được) — nếu không, tính năng thành công
   cụ áp đặt.
3. **Tắt là ngừng ngay.** Người học gỡ liên kết bất cứ lúc nào, không cần lý do, không thông báo
   cho bên kia lý do. Báo cáo kế tiếp không gửi.
4. **Danh sách trường được xem là ĐÓNG và chốt trong code**, không phải cấu hình động:

   **ĐƯỢC xem** — `weeklyReport.ts` chỉ dựng từ đúng các trường này:
   - số ngày đã học trong tuần / mục tiêu tuần
   - streak hiện tại
   - số từ mới đã thuộc trong tuần, số thẻ đã ôn
   - cấp CEFR đang học + % hoàn thành cấp đó
   - một **câu gợi ý để hỏi** (chọn từ bảng mẫu tĩnh, xem mục 5)

   **KHÔNG BAO GIỜ được xem** (kể cả admin không bật hộ được):
   - nội dung chat với tác tử Companion
   - nhật ký cảm xúc / neuro-affective / subconscious / memories cá nhân
   - hồ sơ năng lực ẩn, kết quả chẩn đoán, bất kỳ **con số năng lực** nào
     (đã có 7 test bất biến chặn CI về rò con số năng lực —
     `luong-nguoi-moi-ho-so-nang-luc-an-2026-08-23.md`; báo cáo này phải nằm trong cùng lưới đó)
   - bài viết/bài nói cụ thể và lỗi sai cụ thể (mistake bank)
   - vị trí, danh sách bạn bè, lịch sử thanh toán

5. **Tối đa 2 người theo dõi** mỗi người học ở đợt 1. Không phải giới hạn kỹ thuật — là giới hạn
   sản phẩm để tính năng không trượt thành "cả họ giám sát".
6. **Báo cáo là TUẦN, không phải thời gian thực.** Không có endpoint nào cho người theo dõi hỏi
   "bây giờ nó đang làm gì". Cố ý.
7. **Người học luôn thấy được ai đang theo dõi mình** và lần gửi báo cáo gần nhất.

## 4. Mô hình dữ liệu

`postgres/migrations/0069_companion_links.sql`:

```sql
-- Liên kết "người học ← người thân theo dõi". KHÁC friendships (quan hệ ngang hàng, hai chiều):
-- quan hệ này MỘT CHIỀU và bất đối xứng — chỉ learner cấp quyền, chỉ watcher nhận báo cáo.
create table if not exists public.companion_links (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.profiles(id) on delete cascade,
  watcher_id uuid not null references public.profiles(id) on delete cascade,
  relation text not null default 'family',      -- family | teacher | friend (chỉ để hiển thị)
  created_at timestamptz not null default now(),
  last_report_at timestamptz,
  constraint companion_links_not_self check (learner_id <> watcher_id),
  constraint companion_links_unique unique (learner_id, watcher_id)
);
create index if not exists companion_links_learner_idx on public.companion_links(learner_id);
create index if not exists companion_links_watcher_idx on public.companion_links(watcher_id);

-- Mã mời DÙNG MỘT LẦN, có hạn — khác friend_code (mã cố định, dùng mãi). Quyền xem tiến độ
-- nặng hơn quyền kết bạn nên không dùng mã vĩnh viễn.
create table if not exists public.companion_invites (
  code text primary key,
  learner_id uuid not null references public.profiles(id) on delete cascade,
  expires_at timestamptz not null,
  used_by uuid references public.profiles(id),
  used_at timestamptz,
  created_at timestamptz not null default now()
);
```

Quyết định: mã mời **dùng một lần, hạn 24 giờ**, sinh ngẫu nhiên đủ dài (≥ 10 ký tự base32,
không dùng ký tự dễ nhầm). Rate-limit tạo mã và nhập mã như `friends.ts` (30/phút/IP).

## 5. Nội dung báo cáo — `weeklyReport.ts` (hàm thuần, có test)

Theo đúng khuôn `reminderContent.ts` đã có: **toàn bộ hàm dựng nội dung là hàm thuần**, không
truy vấn DB; handler/scheduler lo phần query rồi gọi vào.

Nguyên tắc viết nội dung (đây là phần dễ làm hỏng nhất):

- **Không phải bảng điểm.** Mở đầu bằng việc đứa trẻ **đã làm được**, không bằng con số thiếu hụt.
- **Không so sánh với người khác.** Không xếp hạng, không phần trăm so với bạn cùng lứa.
- **Tuần kém không được viết thành lời trách.** Học 0-1 ngày → thông điệp chuyển sang hướng
  "tuần này có vẻ bận" + gợi ý hỏi thăm, **không** "con bạn đã bỏ học 6 ngày".
- **Luôn kết bằng MỘT câu gợi ý để hỏi**, cụ thể theo nội dung tuần đó ("Tuần này con học chủ đề
  đồ ăn — thử hỏi con gọi món bằng tiếng Anh xem"). Đây là thứ tạo ra giá trị thật: biến báo cáo
  thành một cuộc trò chuyện, không thành một cuộc kiểm tra.

Bảng mẫu tĩnh theo 4 tình huống: `tuần tốt` · `tuần đều` · `tuần thưa` · `tuần vắng`. Chọn bằng
hàm thuần giống `pickReminderMessage()`.

**Ca biên có test:**

| Ca                                  | Kỳ vọng                                                                |
| ----------------------------------- | ---------------------------------------------------------------------- |
| Tuần đầu tiên, chưa có dữ liệu      | Không gửi báo cáo (không có gì để nói)                                 |
| Học 0 ngày cả tuần                  | Thông điệp `tuần vắng`, tuyệt đối không có từ trách móc                |
| Người học gỡ liên kết giữa tuần     | Không gửi, kể cả khi scheduler đã gom dữ liệu                          |
| Người theo dõi không xác minh email | Không gửi                                                              |
| 2 người theo dõi                    | Mỗi người một thư, không lộ sự tồn tại của người kia                   |
| Chạm trần mail ngày                 | Đi kênh dự phòng qua `sendMailWithQuota` — không được im lặng nuốt lỗi |

## 6. Lịch gửi

Chủ nhật 19:00 giờ VN (tái dùng scheduler đã có trong `apps/server/src/server.ts`). Chọn tối chủ
nhật vì đó là lúc gia đình Việt có mặt ở nhà và tuần mới chưa bắt đầu — báo cáo còn kịp đổi được
điều gì đó.

Báo cáo tuần **không** đi qua đường `email_reminders` (cooldown 3 ngày, mục đích khác) — dùng cột
`last_report_at` riêng trên `companion_links` để chống gửi trùng khi scheduler chạy trên 3 instance
PM2 (điều kiện chống trùng: `last_report_at < đầu tuần này`, cập nhật trong cùng transaction).
⚠️ Đây là ca **idempotency đa tiến trình** — đúng loại lỗi CLAUDE.md mục 4.9 cảnh báo; phải có
test mô phỏng hai tiến trình chạy đồng thời.

## 7. Chia PR

| PR  | Nội dung                                                                                      | Cổng ra                                  |
| --- | --------------------------------------------------------------------------------------------- | ---------------------------------------- |
| C1  | Migration `0070` + `companionLinkService.ts` + contract Zod (tạo mã / nhập mã / gỡ / liệt kê) | Test service, ràng buộc riêng tư có test |
| C2  | `weeklyReport.ts` hàm thuần + toàn bộ ca biên mục 5                                           | Test xanh, coverage nhánh ≥ 90%          |
| C3  | Nối scheduler + gửi mail thật + chống trùng đa tiến trình                                     | Test idempotency; smoke gửi thử 1 thư    |
| C4  | UI trong Hồ sơ: tạo mã mời, xem ai đang theo dõi, gỡ liên kết                                 | a11y AA/AAA 0 vi phạm                    |

## 8. Việc để lại

- **Lớp học / cohort cho trung tâm (B2B)** dùng chung nền quyền xem này — ý tưởng #5 trong đợt đề
  xuất, chỉ mở sau khi C1–C4 chạy thật.
- Báo cáo cho kế hoạch ôn thi (ý tưởng #1): khi cả hai xong, báo cáo tuần thêm đúng một dòng
  "còn N ngày đến kỳ thi". Làm sau, trong một PR riêng, để không sửa `weeklyReport.ts` hai lần.

---

## [3] Tài liệu: dac-ta-ma-hoa-du-lieu-va-2fa-2026-08-23.md

_(Chi tiết nguồn gốc: `dac-ta-ma-hoa-du-lieu-va-2fa-2026-08-23.md`)_

# Mã hoá dữ liệu người dùng + 2FA (2026-08-23)

> **Yêu cầu người dùng:** _"mã hóa toàn bộ dữ liệu người dùng, chỉ tài khoản đó khi kích hoạt 2FA
> thì mới xem và hỏi được."_
>
> Đây là quyết định đụng **bảo mật + dữ liệu người dùng thật + breaking change nhiều nơi** →
> CLAUDE.md §12 buộc phải trình bày trước khi làm. Tài liệu này: khảo sát hiện trạng, phân tích
> hai cách làm, **khuyến nghị**, và những chỗ cần bạn chốt.

---

## 1. Hiện trạng (đã kiểm bằng cách đọc code, không phỏng đoán)

| Hạng mục                    | Trạng thái                                                                                                                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2FA / TOTP**              | **CHƯA CÓ.** Không có file, cột DB, hay route nào. Phải xây từ đầu                                                                                                                       |
| Xác thực                    | Tự viết: Bearer token, email/mật khẩu + Google Identity Services (`packages/core-auth/`)                                                                                                 |
| **Mã hoá — đã có tiền lệ**  | `packages/core-ai/ttsCrypto.ts`: **AES-256-GCM**, khoá gốc từ env `TTS_ENCRYPTION_MASTER_KEY`, khoá từng bản ghi **suy ra bằng HMAC-SHA256** (không lưu khoá riêng ⇒ không cần thêm cột) |
| Dữ liệu người dùng hiện tại | Lưu **plaintext** trong PostgreSQL tự host (`public.profiles`, `learning_progress`, lịch sử chat, …)                                                                                     |
| Backup                      | DB + .env + cấu hình đẩy lên Cloudflare R2 (đã kiểm chứng 2 chiều 2026-08-01)                                                                                                            |

**Điểm đáng lo nhất hiện nay không phải thiếu mã hoá, mà là backup:** một bản dump DB nằm trên R2 ở
dạng plaintext — nếu lộ khoá R2 thì lộ toàn bộ dữ liệu. Mã hoá ở tầng ứng dụng đóng được đúng lỗ
hổng này.

---

## 2. "Mã hoá toàn bộ" — hai cách hiểu, hậu quả khác nhau rất xa

### Cách A — Mã hoá phía server, khoá do server giữ

Server giải mã khi phục vụ request. DB và backup chỉ chứa ciphertext.

|                         |                                                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Chống được**          | Lộ bản dump DB · lộ backup R2 · người có quyền đọc DB nhưng không có quyền vào server · lộ ổ đĩa            |
| **Không chống được**    | Kẻ chiếm được quyền chạy mã trên server (vì khoá cũng ở đó)                                                 |
| **Ảnh hưởng tính năng** | Gần như không. Companion vẫn đọc được hồ sơ, streak/lượt dùng/bảng xếp hạng vẫn chạy, admin vẫn hỗ trợ được |
| **Chi phí**             | Vừa. Tái dùng đúng khuôn `ttsCrypto.ts` đã có                                                               |
| **Quên mật khẩu**       | Bình thường, khôi phục được                                                                                 |

### Cách B — Mã hoá đầu-cuối (E2EE), khoá dẫn xuất từ mật khẩu người dùng

Chỉ người dùng đọc được. Server mù hoàn toàn.

|                            |                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Chống được**             | Mọi thứ ở cách A, **cộng thêm** kẻ chiếm quyền server, cộng thêm chính người vận hành                                                                                                                                                                                                                                                                                                                                                |
| **Cái mất — nghiêm trọng** | ① **Companion AI không đọc được hồ sơ** ⇒ mất trọn giá trị "bạn đồng hành biết ngữ cảnh" — đây là chức năng cốt lõi của DHCB<br>② **Quên mật khẩu = mất sạch dữ liệu vĩnh viễn**, không có đường khôi phục<br>③ Không tính được streak/bảng xếp hạng/lượt dùng phía server<br>④ Email nhắc học không có nội dung cá nhân hoá<br>⑤ Admin không hỗ trợ được người dùng gặp sự cố<br>⑥ Không tìm kiếm được trong dữ liệu của chính mình |
| **Chi phí**                | Rất lớn. Đụng gần như mọi tính năng đang chạy                                                                                                                                                                                                                                                                                                                                                                                        |

**Kết luận thẳng:** Cách B **mâu thuẫn trực tiếp** với chính tầm nhìn bạn đặt ra ở tài liệu đồng
hành — một Companion "biết ngữ cảnh mọi trụ" không thể vận hành trên dữ liệu nó không đọc được.

---

## 3. Khuyến nghị: Cách A + phân tầng nhạy cảm

Không mã hoá mọi thứ như nhau. Mã hoá **đồng loạt và mù quáng** làm hỏng truy vấn, chỉ số, và
hiệu năng mà không tăng an toàn tương ứng.

| Tầng              | Nội dung                                                                                                                        | Xử lý                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **T0 — Vận hành** | `user_id`, `plan`, ngày hết hạn, số lượt dùng, mốc thời gian, cờ trạng thái                                                     | **Không mã hoá.** Cần để truy vấn, đếm, lọc, tính hạn. Bản thân chúng không tiết lộ điều riêng tư |
| **T1 — Cá nhân**  | Tên, email, nhóm tuổi, mục tiêu học, tiến độ                                                                                    | **Mã hoá** (server đọc được). Email cần giữ thêm **cột băm** để tra cứu đăng nhập                 |
| **T2 — Nhạy cảm** | **Hồ sơ năng lực ẩn**, câu trả lời tự do câu 3–4, tín hiệu năng khiếu, hoàn cảnh chăm sóc/gián đoạn, nhật ký, ghi chú Companion | **Mã hoá + cần 2FA để XEM**                                                                       |

**Cơ chế khoá — tái dùng đúng khuôn đã có:**

```
khoá_người_dùng = HMAC-SHA256( USER_DATA_MASTER_KEY , user_id )
ciphertext       = AES-256-GCM( khoá_người_dùng , iv ngẫu nhiên , plaintext )
```

Không lưu khoá riêng cho từng bản ghi ⇒ không cần thêm cột khoá, y hệt cách `ttsCrypto.ts` đang làm
cho cache TTS.

### 3.1 Ba việc bắt buộc kèm theo (nếu thiếu thì mã hoá thành phản tác dụng)

| #   | Việc                                                       | Vì sao                                                                                                                                               |
| --- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Sao lưu khoá gốc ra NGOÀI server, ở nơi khác backup DB** | Mất khoá = mất **toàn bộ** dữ liệu, không cứu được. Đây là rủi ro lớn nhất của cả phương án. Khoá **không được** nằm cùng chỗ với bản dump nó bảo vệ |
| 2   | **Cột băm cho trường cần tra cứu** (email)                 | Ciphertext AES-GCM khác nhau mỗi lần ⇒ không `WHERE email = ?` được. Phải có `email_hash` (HMAC) để đăng nhập                                        |
| 3   | **Kế hoạch xoay khoá**                                     | Thêm `key_version` vào mỗi bản ghi từ đầu. Thêm sau thì phải viết lại toàn bộ dữ liệu                                                                |

---

## 4. 2FA — thiết kế

### 4.1 Chọn phương thức

| Phương thức                             | Đánh giá                                                                                                              |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **TOTP** (Google Authenticator, Authy…) | **Chọn cái này.** Miễn phí, không phụ thuộc nhà mạng, chuẩn mở (RFC 6238), thư viện phổ biến, hợp dự án vốn tối thiểu |
| SMS OTP                                 | Tốn tiền mỗi tin, kém an toàn (đổi SIM), phụ thuộc nhà mạng                                                           |
| Email OTP                               | Có thể làm phương án dự phòng — nhưng nếu email đã bị chiếm thì vô nghĩa                                              |
| WebAuthn/Passkey                        | An toàn nhất, nhưng phức tạp hơn nhiều. Để giai đoạn sau                                                              |

### 4.2 Điểm tôi cần nói ngược lại: 2FA **tuỳ chọn**, không bắt buộc

Yêu cầu ghi "chỉ tài khoản đó khi kích hoạt 2FA thì mới xem và hỏi được". Tôi đề nghị hiểu và làm
như sau:

| Việc                                        | Có cần 2FA?        | Lý do                                                                                                                                     |
| ------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Dùng app bình thường (học, chat, luyện nói) | **Không**          | Bắt buộc 2FA để dùng app sẽ chặn phần lớn người dùng — đặc biệt học sinh 10–18 chưa có điện thoại riêng. Đây là rào cản làm chết sản phẩm |
| **Xem hồ sơ năng lực ẩn**                   | **Có**             | Đúng ý bạn. Đây là dữ liệu T2                                                                                                             |
| **Hỏi Companion "bạn biết gì về tôi"**      | **Có**             | Vì câu trả lời chính là nội dung T2                                                                                                       |
| Chat/học bình thường với Companion          | **Không**          | Companion vẫn **dùng** hồ sơ để gợi ý hay hơn, chỉ không **đọc nội dung hồ sơ ra** cho người dùng nghe                                    |
| Xoá dữ liệu đánh giá                        | **Không**          | Không bao giờ được cản người dùng xoá dữ liệu của họ                                                                                      |
| Đổi mật khẩu / email / xoá tài khoản        | **Có, nếu đã bật** | Chuẩn ngành                                                                                                                               |

**Phân biệt then chốt:** Companion **dùng** hồ sơ ẩn để chọn việc gợi ý (không cần 2FA), nhưng
**đọc nội dung hồ sơ ra thành lời** thì cần 2FA. Đúng tinh thần "ẩn nhưng xem được khi hỏi" mà bạn
đã chốt — chỉ thêm một lớp khoá ở cửa "xem".

> Nếu bạn muốn 2FA **bắt buộc cho mọi người**, tôi làm được — nhưng cần bạn biết rõ cái giá: mất
> phần lớn người dùng học sinh, và mọi người quên thiết bị 2FA sẽ mất tài khoản.

### 4.3 Thiết kế TOTP

| Hạng mục          | Quyết định                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| Chuẩn             | TOTP RFC 6238, SHA-1, 6 chữ số, chu kỳ 30 giây (mặc định để tương thích mọi app xác thực)               |
| Dung sai lệch giờ | ±1 bước (±30 giây)                                                                                      |
| Lưu secret        | **Mã hoá** bằng chính cơ chế mục 3 — secret TOTP là dữ liệu T2                                          |
| **Mã khôi phục**  | **Bắt buộc có.** 10 mã dùng-một-lần, chỉ hiện đúng một lần lúc bật, lưu dạng **băm** (không lưu mã gốc) |
| Chống dò          | Giới hạn 5 lần sai / 15 phút / tài khoản, dùng lại `checkRateLimit` đã có                               |
| Chống dùng lại mã | Ghi lại bước thời gian đã dùng, chặn dùng lại cùng mã trong cùng chu kỳ                                 |
| Phiên nâng quyền  | Sau khi nhập đúng 2FA, mở "cửa sổ nâng quyền" **15 phút** — không bắt nhập lại mỗi thao tác             |
| Tắt 2FA           | Cần nhập đúng 2FA hiện tại **và** mật khẩu                                                              |

### 4.4 Ca người dùng 10–18 tuổi

Học sinh có thể không có điện thoại riêng. Xử lý:

- 2FA vẫn tuỳ chọn ⇒ các em dùng app bình thường được.
- Không bật 2FA ⇒ **không xem được hồ sơ năng lực chi tiết**. Đây là mặc định an toàn: đúng nhóm
  cần bảo vệ nhất khỏi việc bị người khác đọc hồ sơ.
- **Vẫn xoá được** dữ liệu đánh giá mà không cần 2FA.
- Mã khôi phục có thể in ra giấy — hợp với hoàn cảnh không có thiết bị riêng.

---

## 5. Cái mã hoá KHÔNG giải quyết được (nói thẳng để không hiểu nhầm)

| Vấn đề                                                  | Mã hoá có cứu không                                               |
| ------------------------------------------------------- | ----------------------------------------------------------------- |
| Lộ dump DB / backup R2                                  | **Có** — đây là lợi ích chính, và có thật                         |
| Nhân viên/người vận hành đọc trộm DB trực tiếp          | **Có** (nếu họ không vào được server)                             |
| Kẻ chiếm quyền chạy mã trên server                      | **Không** — khoá ở đó                                             |
| Lỗ hổng phân quyền trong chính API (`validateAuth` sai) | **Không** — API tự giải mã rồi trả về. **Đây vẫn là rủi ro số 1** |
| Người dùng bị lộ mật khẩu                               | **Không** — 2FA mới cứu được ca này                               |
| SQL injection                                           | **Không** — nhưng dự án đã dùng truy vấn tham số hoá              |

**Suy ra thứ tự ưu tiên đúng:** ① 2FA (chống chiếm tài khoản — rủi ro có thật và phổ biến nhất) →
② rà soát phân quyền API → ③ mã hoá T2 → ④ mã hoá T1. Mã hoá quan trọng, nhưng **không** phải việc
đáng làm đầu tiên.

---

## 6. Kế hoạch PR đề xuất

| PR      | Nội dung                                                                                                                                                                                 | Rủi ro   | Ghi chú                                                                                                                           |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **S-1** | **TOTP 2FA**: bảng `user_2fa` (secret mã hoá, mã khôi phục băm, `key_version`), bật/tắt, xác minh, cửa sổ nâng quyền 15 phút, giới hạn dò, UI trong Cài đặt                              | TB       | Độc lập, làm được ngay, giá trị tức thì                                                                                           |
| **S-2** | **Hạ tầng mã hoá dùng chung**: `packages/core-crypto/userDataCrypto.ts` theo khuôn `ttsCrypto.ts` + `USER_DATA_MASTER_KEY` + `key_version` + hướng dẫn sao lưu khoá + kịch bản xoay khoá | TB       | Chưa mã hoá dữ liệu nào — chỉ dựng hạ tầng + test                                                                                 |
| **S-3** | **Mã hoá T2**: hồ sơ năng lực ẩn + trả lời tự do + tín hiệu năng khiếu. Dữ liệu này **chưa tồn tại** ⇒ mã hoá ngay từ đầu, **không cần migration chuyển đổi**                            | **Thấp** | Làm cùng lúc với PR tạo hồ sơ ẩn (C4) — rẻ nhất                                                                                   |
| **S-4** | **Mã hoá T1** dữ liệu đang có (tên, email + `email_hash`, tiến độ)                                                                                                                       | **CAO**  | Đụng dữ liệu thật của người dùng đang hoạt động. Cần: backup trước, migration hai chiều, kế hoạch rollback, chạy thử trên bản sao |

**Thứ tự khuyến nghị: S-1 → S-2 → S-3 → (dừng, đánh giá lại) → S-4.**

Lý do dừng trước S-4: dữ liệu mới (S-3) mã hoá gần như miễn phí vì chưa tồn tại. Dữ liệu cũ (S-4)
đắt và rủi ro cao. Làm xong S-3 rồi hãy quyết có đáng làm S-4 không.

---

## 7. Cần bạn chốt

1. **Cách A (server giữ khoá) — đúng ý bạn chứ?** Cách B (E2EE) làm Companion mù, mất chức năng cốt
   lõi, và quên mật khẩu là mất sạch dữ liệu. Tôi khuyến nghị Cách A.
2. **2FA tuỳ chọn (chỉ bắt buộc khi XEM hồ sơ ẩn) — đồng ý chứ?** Bắt buộc toàn bộ sẽ chặn học
   sinh 10–18.
3. **Chat/học bình thường không cần 2FA — đúng ý bạn chứ?** Chỉ "xem hồ sơ" và "hỏi bạn biết gì về
   tôi" mới cần.
4. **S-4 (mã hoá dữ liệu cũ) làm luôn hay để sau?** Tôi đề nghị **để sau**, làm S-1→S-3 trước.
5. **Bạn sẽ cất khoá gốc ở đâu?** Phải khác chỗ với backup DB. Không có câu trả lời cho câu này thì
   **chưa nên bắt đầu S-2** — mất khoá là mất trắng, không cứu được.

---

## [4] Tài liệu: dac-ta-chia-se-vi-tri-2026-08-26.md

_(Chi tiết nguồn gốc: `dac-ta-chia-se-vi-tri-2026-08-26.md`)_

# Đặc tả: Chia sẻ vị trí thời gian thực ("Đi chung") — 2026-08-26

> Trạng thái: ĐÃ TRIỂN KHAI (giai đoạn 1) + ĐÃ THIẾT KẾ LẠI UI/UX. Xem `PROGRESS.md` mục cùng ngày.
> Điểm chạm code: `postgres/migrations/0068_location_sharing.sql` ·
> `packages/core-location/` · `packages/core-contracts/location.ts` ·
> `apps/server/src/api/platform/location.ts` · `apps/dhcb/src/pages/core/LiveLocation.tsx` ·
> `apps/dhcb/src/components/location/` · `apps/dhcb/src/lib/locationFormat.ts`

## 1. Vấn đề

Nhóm bạn đi chơi chung (đi phượt, đi hội chợ, đi ăn ở khu đông người) rất hay lạc nhau:
gọi điện thì ồn không nghe được, nhắn "tao đang ở gần cái cây to" thì không ai hình dung ra.
Người dùng cần thấy nhau ĐANG Ở ĐÂU trên bản đồ, ngay lúc này, và **chủ động bật/tắt** được.

## 2. Nghiên cứu — vì sao chọn cách này

**Tham chiếu thị trường.** Google Maps "Share location", Zalo/Messenger "Live Location",
Apple "Find My" đều theo cùng một khuôn: chia sẻ theo **phiên có hạn giờ**, có **công tắc dừng
ngay**, và **không** mặc định bật. Điểm hay nhất đáng học của Google Maps: chia sẻ luôn kèm thời
hạn (15 phút / 1 giờ / đến hết ngày) — người dùng không phải nhớ đi tắt.

**Chọn transport.** Ba phương án cân nhắc:

| Phương án                               | Ưu                                                  | Nhược                                                   |
| --------------------------------------- | --------------------------------------------------- | ------------------------------------------------------- |
| Polling REST đơn thuần                  | Đơn giản nhất, chạy mọi nơi                         | Trễ vài giây, tốn request khi nhóm đông                 |
| SSE (server-sent events)                | Một chiều nhẹ                                       | Vẫn cần REST để gửi lên, thêm một loại kết nối mới      |
| **WebSocket + fallback polling (CHỌN)** | Dự án ĐÃ có sẵn hạ tầng WS + Redis pub/sub cho chat | Mạng công cộng/proxy đôi khi chặn WS → nên có đường lui |

Chọn WebSocket vì `packages/core-chat/wsHandler.ts` + `redisChat.ts` đã giải xong đúng bài toán
khó (auth qua cookie khi upgrade, fan-out giữa nhiều instance PM2). Tính năng mới dùng lại
`publish/subscribeChannel` của core-chat, chỉ khác **kênh theo CHUYẾN** (`loc:session:<id>`)
thay vì theo user. Client **tự quay về polling REST 8 giây/lần** khi WS không mở được — bản đồ
vẫn chạy, chỉ chậm hơn.

**Chọn bản đồ.** Google Maps JavaScript API, nạp bằng thẻ `<script>` LƯỜI (chỉ khi mở màn hình
bản đồ) chứ không qua gói npm — ngân sách bundle của dự án rất mỏng (xem `PROGRESS.md`, mục nợ
kỹ thuật) và script CDN không tính vào bundle. Thiếu key thì màn hình vẫn dùng được: danh sách
khoảng cách + nút "Chỉ đường" mở `google.com/maps/dir` (URL công khai, không cần key).

## 3. Luật riêng tư (phần quan trọng nhất — đừng nới)

1. **Không có chia sẻ vĩnh viễn.** Mọi chuyến bắt buộc có `expires_at` (1 / 4 / 8 giờ). Hết hạn
   là dừng, không cần ai bấm gì.
2. **Không lưu lịch sử hành trình.** Bảng `location.positions` giữ ĐÚNG MỘT dòng cho mỗi người
   trong mỗi chuyến (upsert đè lên). Không ai — kể cả admin — dựng lại được đường đi của ai.
3. **Tắt là xoá, không phải ẩn.** Bấm tắt chia sẻ → server `delete` dòng vị trí ngay
   (`updateSharing`), đồng thời client dừng `watchPosition` (đỡ tốn pin).
4. **Mặc định TẮT.** Tạo chuyến hay vào chuyến đều `sharing_enabled = false` — phải tự bấm bật.
5. **Chế độ gần đúng.** `precision_mode = 'approx'` làm tròn toạ độ về lưới ~500m **ở server**
   trước khi lưu, nên toạ độ chính xác không bao giờ tới máy người khác.
6. **Nhật ký đồng thuận.** `location.consent_log` ghi mọi lần vào/rời/bật/tắt (KHÔNG ghi toạ độ)
   để người dùng tự kiểm được "ai đã thấy mình khi nào".
7. **Kết thúc chuyến xoá sạch** vị trí của tất cả thành viên, và job nền 15 phút/lần
   (`purgeExpiredPositions`) dọn nốt các chuyến hết hạn.

## 4. Mô hình dữ liệu

Schema `location` (migration 0068): `sessions` · `session_members` · `positions` ·
`consent_log`. Chi tiết cột xem ngay trong file migration (có chú thích tiếng Việt).

Vào chuyến bằng **mã mời 6 ký tự** (bộ ký tự bỏ 0/O/1/I/L như `friend_code`), chia sẻ qua link
`/nhom-di-chung/<MÃ>`. Cố ý KHÔNG ràng buộc "phải là bạn bè": đi chơi hay có người quen của bạn mình,
người có mã mới vào được và chỉ thấy người trong chuyến đó.

## 5. API

| Method + đường dẫn                   | Việc                                                               |
| ------------------------------------ | ------------------------------------------------------------------ |
| `GET /api/location`                  | Chuyến còn hiệu lực của tôi                                        |
| `GET /api/location?sessionId=`       | Toàn cảnh 1 chuyến (403 nếu không phải thành viên)                 |
| `POST /api/location`                 | Tạo chuyến (tối đa 5 chuyến mở/người)                              |
| `POST /api/location?action=join`     | Vào chuyến bằng mã mời                                             |
| `POST /api/location?action=position` | Gửi vị trí (đường lui của WebSocket)                               |
| `PATCH /api/location?action=sharing` | Bật/tắt chia sẻ, đổi độ chính xác                                  |
| `PATCH /api/location`                | Điểm hẹn / bán kính cảnh báo / gia hạn / kết thúc (chỉ chủ chuyến) |
| `DELETE /api/location?sessionId=`    | Rời chuyến (xoá vị trí của mình)                                   |
| `WS /ws/location`                    | `subscribe` · `position` · `unsubscribe`                           |

Mọi lối vào đều qua `validateAuth()` + rate limit, và **mọi hàm nghiệp vụ tự kiểm lại tư cách
thành viên ở DB** (`getActiveMembership`) — kể cả trên WebSocket đang mở, vì quyền có thể mất
giữa chừng. Gửi vị trí vào chuyến không có quyền trả `200 {ok:false}` chứ không phải 403, để
người ngoài không dò được sessionId nào có thật.

## 6. Chống lạc

- **Khoảng cách tới từng người + giữa TỪNG CẶP thành viên** tính ngay trên máy (haversine,
  `geo.ts`) — không tốn request. Danh sách khoảng cách cặp giúp cả nhóm biết ai gần ai mà không
  cần lấy bản thân mình làm mốc so sánh.
- **Cảnh báo đi lạc**: ai cách "mốc" quá `alert_radius_m` (mặc định 300m) thì hiện cảnh báo.
  Mốc = **điểm hẹn** nếu chủ chuyến đã đặt, không thì **tâm nhóm** (trung bình toạ độ).
- **Điểm hẹn** đặt bằng một nút "Đặt điểm hẹn tại đây"; mọi người bấm "Chỉ đường" là mở Google
  Maps dẫn tới đó.
- **Mức pin** của mỗi người hiển thị kèm (Battery Status API, nơi nào không hỗ trợ thì ẩn) —
  biết bạn sắp hết pin thì đừng đứng đợi tin nhắn.

## 7. Tiết kiệm pin & dữ liệu

`watchMyPosition` chỉ gửi lên khi **đã đi ≥ 20m** hoặc **quá 30 giây** kể từ lần gửi trước
(`shouldSendUpdate`, có test ca biên). Tắt chia sẻ → `clearWatch` ngay, không để GPS chạy nền.

## 7b. Giao diện — nguyên tắc bố cục (thiết kế lại 2026-08-26)

Bối cảnh dùng thật quyết định bố cục: người dùng **đang đi bộ ngoài đường, một tay cầm máy,
nắng chói, đang vội**. Đây là màn hình "liếc một giây là biết", không phải trang tài liệu để đọc.

1. **Xếp theo mức khẩn**, không xếp theo thứ tự nghĩ ra: cảnh báo đi lạc → bản đồ (45dvh) →
   ai đang ở đâu → nhóm giãn bao xa → cài đặt → rời/kết thúc.
2. **Công tắc chia sẻ dính đáy màn hình** (`ShareToggle`), luôn trong tầm ngón cái, không bao giờ
   nằm trong menu con — vì luật của tính năng là "bấm tắt là dừng NGAY" (mục 3, luật 3). Hai
   trạng thái khác nhau về **màu + biểu tượng + chữ**, và luôn nói rõ ai đang thấy mình.
3. **Màu định danh nối hai cách nhìn** (`components/location/memberColor.ts`): mỗi người một màu
   cố định suy từ `userId`, dùng chung cho chấm trên bản đồ và avatar trong danh sách.
4. **Hành động phá huỷ phải xác nhận hai bước** — "Kết thúc chuyến" xoá vị trí của tất cả mọi
   người và không hoàn tác được.
5. **Bản đồ không tự canh khung khi người dùng đang kéo** — vị trí cập nhật vài giây/lần, cứ
   `fitBounds` mỗi lần là kéo giật màn hình của người đang xem đường.
6. **Màu nút**: nền `accent-500` LUÔN đi với mực tối `text-[#09090b]`. Chữ trắng trên nền accent
   rớt AA ở cả 5 theme (2,54–3,53 < 4,5) — đã đo, xem `PROGRESS.md`.

**Cổng chặn:** trang được quét ở CẢ HAI cổng a11y × 5 theme qua fixture dùng chung
`e2e/helpers/location.ts`. Giao diện trong chuyến chỉ hiện sau khi có dữ liệu backend, nên
`page.goto` trơn KHÔNG quét được — thêm màn hình mới cho tính năng này thì phải nối vào fixture đó.

## 8. Việc còn để lại cho giai đoạn sau

1. **Chạy nền khi tắt màn hình.** Trình duyệt dừng `watchPosition` khi tab ẩn lâu; muốn chuẩn
   phải có app native hoặc `Background Geolocation` (chưa khả dụng rộng trên trình duyệt). Hiện
   tại người dùng cần để màn hình mở khi cần bám theo nhau — nên ghi rõ trong hướng dẫn.
2. **Đường đi lịch sử theo phiên** (kiểu "xem lại chuyến"): CỐ Ý chưa làm, vì trái luật 2 ở mục 3. Muốn làm phải hỏi ý người dùng và làm dạng opt-in riêng.
3. **Thông báo đẩy khi có người tụt lại** — cần nối vào `packages/core-chat/chatPush.ts`.
4. **Nhóm đông (> ~20 người)**: hiện fan-out mỗi vị trí tới toàn nhóm; đông hơn nên gộp nhịp
   (gửi 1 gói/2 giây cho cả nhóm) thay vì mỗi người một sự kiện.

---

## [5] Tài liệu: dac-ta-che-do-on-thi-2026-08-26.md

_(Chi tiết nguồn gốc: `dac-ta-che-do-on-thi-2026-08-26.md`)_

# Đặc tả: Chế độ ôn thi có hạn chót ("Đếm ngược kỳ thi") — 2026-08-26

> Trạng thái: **ĐẶC TẢ, CHƯA TRIỂN KHAI**. Research-first theo KHUNG 3 · CLAUDE.md mục 0.
> Ý tưởng #1 trong đợt đề xuất tích hợp 2026-08-26; người dùng chọn "1-2 làm trước".
> Điểm chạm dự kiến: `postgres/migrations/0070_exam_plan.sql` · `packages/core-examplan/` ·
> `packages/core-contracts/examPlan.ts` · `apps/server/src/api/learning/exam-plan.ts` ·
> `apps/dhcb/src/pages/learning/ExamPlan.tsx`.

## 1. Vấn đề

App hiện học theo **nhịp vô hạn**: CEFR A1→C2, SRS đến hạn, streak ngày. Nhịp đó tốt cho người
đã có động lực sẵn, nhưng phần lớn người học Việt Nam hành động theo **hạn chót thật**: thi vào
lớp 10, thi tốt nghiệp THPT, IELTS/VSTEP, thi học kỳ. Không có hạn chót thì gói Pro là "tuỳ
hứng"; có hạn chót thì nó là thứ bắt buộc phải mua.

Hệ quả đo được của thiết kế hiện tại: người dùng không có cách trả lời câu hỏi **"hôm nay tôi
phải làm gì để kịp ngày X?"**. Họ tự phải quy đổi từ "còn 400 từ chưa thuộc" sang "mỗi ngày học
bao nhiêu" — đó chính là việc máy nên làm.

## 2. Nghiên cứu — vì sao chọn cách này

**Tham chiếu thị trường.** Ba khuôn phổ biến:

| Khuôn                                                   | Đại diện                        | Điểm đáng học                      | Điểm KHÔNG học theo                                 |
| ------------------------------------------------------- | ------------------------------- | ---------------------------------- | --------------------------------------------------- |
| Lộ trình cố định theo tuần                              | Hầu hết app luyện thi VN        | Dễ hiểu, dễ bán                    | Trễ một tuần là hỏng cả lộ trình, người học bỏ luôn |
| Adaptive thuần theo mô hình trí nhớ                     | Anki / SuperMemo                | Đúng khoa học trí nhớ              | Không biết "ngày thi", ôn dàn trải, không nén được  |
| **Lập lịch NGƯỢC từ hạn chót + mô hình trí nhớ (CHỌN)** | Duolingo "goal", một số app SAT | Vừa có hạn chót vừa tự nén khi trễ | Phức tạp hơn, phải test kỹ ca biên                  |

Chọn khuôn 3 vì dự án **đã có sẵn nửa khó**: FSRS thật (`apps/dhcb/src/lib/srs.ts`, thư viện
`ts-fsrs`) mô hình hoá được xác suất nhớ lại. Thứ còn thiếu chỉ là **lớp lập lịch ngược** — biết
ngày thi thì mỗi ngày phải "trả" bao nhiêu nợ.

**Điểm mấu chốt của FSRS trong bối cảnh thi cử:** FSRS lập lịch để giữ retention ở mức
`request_retention` **vô thời hạn**. Ôn thi thì khác — chỉ cần nhớ **đúng vào ngày X**. Nghĩa là:

- Còn xa ngày thi → giữ `request_retention` mặc định (~0.9), ôn thưa, tiết kiệm lượt.
- Càng gần ngày thi → nâng `request_retention` lên (0.95) để lịch ôn dày lên, các thẻ "vừa đủ
  nhớ" được kéo về trước ngày thi thay vì rơi vào sau đó.
- **Không** thẻ nào được để `due` rơi vào **sau** ngày thi mà chưa ôn ít nhất một lần trong
  cửa sổ T-7.

Đây là thay đổi **tham số**, không phải viết lại thuật toán — rẻ và có thể tắt bằng cờ.

**Vì sao KHÔNG dùng AI để lập lịch.** Lập lịch là bài toán tất định, kiểm chứng được bằng test.
Đưa AI vào đây thì mỗi lần mở app ra một lịch khác nhau (người học mất niềm tin), lại tốn token
cho việc số học. Giống quyết định đã chốt ở engine chấm: **không có AI trong luồng chấm/lập lịch**.

## 3. Phạm vi đợt 1 — CHỈ MỘT KỲ THI

Rủi ro 🔴 lớn nhất của tính năng này là **phình phạm vi** (đúng loại rủi ro đã ghi ở GĐ2). Nên
đợt 1 chốt cứng:

- **Kỳ thi duy nhất: thi vào lớp 10 — môn Tiếng Anh.**
  Lý do chọn: (a) Tiếng Anh là môn chín nhất của app, đã có 12.168 từ gắn nhãn CEFR, SRS chạy
  thật, mistake bank, chấm viết/nói; (b) không phụ thuộc engine chấm Toán đang thiếu (mục 8);
  (c) tệp người học đông và có người trả tiền rõ ràng (phụ huynh — xem đặc tả ý tưởng #2).
- **Không** làm Toán, không làm IELTS, không làm THPT ở đợt 1. Chỉ mở đợt sau khi đợt 1 đạt cổng ra.
- **Không** làm ngân hàng đề full-length ở đợt 1 (xem mục 7 — đó là đợt 2).

## 4. Luật sản phẩm (đừng nới)

1. **Kết quả chẩn đoán KHÔNG phải màn hình chính** — luật số 1 của sản phẩm
   (`dong-hanh-va-phat-trien-nang-khieu-2026-08-23.md`). Màn hình chính của chế độ ôn thi là
   **đồng hồ đếm ngược + đúng 3 việc hôm nay**. Điểm chẩn đoán chỉ hiện khi người học tự bấm xem.
2. **Trễ không bị phạt, chỉ bị nén.** Bỏ 5 ngày thì hệ thống KHÔNG hiện "bạn đã bỏ lỡ 5 ngày" mà
   tính lại khối lượng còn lại chia cho số ngày còn lại. Không có màn hình xấu hổ.
3. **Nói thật khi không kịp.** Nếu khối lượng còn lại vượt trần mỗi ngày (mục 5), hệ thống phải
   nói thẳng "với quỹ thời gian này, mục tiêu sát thực tế là X, không phải Y" và đề xuất **cắt
   phạm vi** — chứ không im lặng nhồi lịch không ai theo nổi.
4. **Một kế hoạch tại một thời điểm.** Không cho tạo nhiều kế hoạch song song ở đợt 1 (tránh
   người học ôm 3 kỳ thi rồi bỏ cả 3).
5. **Hạn chót có thật.** `exam_date` bắt buộc, phải ở tương lai, tối đa 18 tháng.

## 5. Thuật toán lập lịch ngược (phần lõi, package thuần hàm)

Đặt ở `packages/core-examplan/` — **hàm thuần, tất định, không gọi DB, không gọi AI**, dùng chung
client lẫn server (đúng khuôn `core-grading` cũ). Đầu vào/đầu ra:

```ts
interface ExamPlanInput {
  today: string // 'YYYY-MM-DD' theo giờ VN
  examDate: string // 'YYYY-MM-DD'
  scopeItems: number // tổng số mục phải nắm (từ vựng + điểm ngữ pháp)
  masteredItems: number // đã nắm (từ learning_progress + SRS state)
  dueToday: number // số thẻ SRS đến hạn hôm nay
  dailyCapItems: number // trần người học tự đặt (mặc định theo tốc độ đã chọn 5/10/20)
  restDays: number[] // 0-6, ngày trong tuần người học xin nghỉ
}

interface ExamPlanOutput {
  daysLeft: number
  effectiveDaysLeft: number // đã trừ ngày nghỉ
  todayNewItems: number
  todayReviewItems: number
  phase: 'build' | 'consolidate' | 'taper' // T-∞..T-14 | T-14..T-3 | T-3..T-0
  feasibility: 'comfortable' | 'tight' | 'not-feasible'
  suggestedScopeCut: number | null // chỉ khác null khi not-feasible
  requestRetention: number // truyền cho FSRS
}
```

Quy tắc:

- `effectiveDaysLeft = số ngày từ today→examDate, trừ restDays`, **tối thiểu 1** (ngày thi cũng
  còn học được buổi sáng — nhưng không chia cho 0).
- Giai đoạn `taper` (T-3 → T-0): **không thêm mục MỚI**, chỉ ôn lại — nhồi kiến thức mới sát ngày
  thi làm hỏng cả phần đã thuộc.
- `requestRetention`: `build` = 0.90 · `consolidate` = 0.93 · `taper` = 0.95.
- `todayNewItems = ceil((scopeItems - masteredItems) / effectiveDaysLeft)`, chặn trên bởi
  `dailyCapItems - todayReviewItems` (ôn có ưu tiên cao hơn học mới — nợ cũ trả trước).
- `feasibility`: `not-feasible` khi `todayNewItems > dailyCapItems` **sau khi** đã trừ ôn;
  khi đó `suggestedScopeCut = scopeItems - (dailyCapItems_hữu_dụng * effectiveDaysLeft)`.

**Ca biên bắt buộc có test** (mục 4.9 CLAUDE.md — mỗi nhánh logic phức tạp ≥ 1 test ca biên):

| Ca                           | Kỳ vọng                                                               |
| ---------------------------- | --------------------------------------------------------------------- |
| `examDate` = hôm nay         | `effectiveDaysLeft = 1`, phase `taper`, `todayNewItems = 0`           |
| `examDate` đã qua            | Trả lỗi, không âm ngày — kế hoạch chuyển trạng thái `expired`         |
| Tất cả 7 ngày đều là restDay | `effectiveDaysLeft` không bằng 0; cảnh báo cấu hình vô lý             |
| `masteredItems > scopeItems` | `todayNewItems = 0`, không âm                                         |
| `dueToday` ≥ `dailyCapItems` | `todayNewItems = 0` (ôn hết trần), không âm                           |
| Còn 200 ngày, scope nhỏ      | `comfortable`, `todayNewItems` ≥ 1 (không ra 0 rồi đứng im mãi)       |
| Còn 3 ngày, scope lớn        | `not-feasible` + `suggestedScopeCut > 0`                              |
| Đổi múi giờ / qua nửa đêm VN | Ngày tính theo `vnDateStr()` của `@dhcb/core-db/date`, không theo UTC |

## 6. Mô hình dữ liệu

`postgres/migrations/0070_exam_plan.sql`:

```sql
create table if not exists public.exam_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exam_kind text not null,             -- 'vao10-english' (đợt 1 chỉ 1 giá trị)
  exam_date date not null,
  target_label text,                   -- mục tiêu do người học tự ghi ('7 điểm'), KHÔNG dùng để chấm
  scope_items int not null default 0,
  daily_cap_items int not null default 10,
  rest_days smallint[] not null default '{}',
  status text not null default 'active',   -- active | expired | archived
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Đợt 1: MỘT kế hoạch active mỗi người (luật sản phẩm #4).
create unique index if not exists exam_plans_one_active
  on public.exam_plans(user_id) where status = 'active';
```

**Không** tạo bảng lưu lịch từng ngày. Lịch được **tính lại mỗi lần mở** từ trạng thái học thật
(`learning_progress`, SRS) — lưu lịch xuống DB là tự chuốc lấy bài toán đồng bộ khi người học đi
lệch kế hoạch, mà họ luôn đi lệch.

## 7. Đợt 2 (chưa làm ở đợt 1) — thi thử

Thi thử full-length ở mốc T-60 / T-30 / T-7. Hai việc chặn:

- **Ngân hàng đề.** Không chép đề có bản quyền. Hai đường: (a) tự soạn theo cấu trúc đề công bố
  của Sở GD; (b) sinh bằng AI rồi **người duyệt tay** (cùng ranh giới đã chốt cho hình minh hoạ
  môn Sinh). Phải chốt trước khi viết code.
- **Engine chấm.** ⚠️ **`packages/core-grading` KHÔNG còn trong repo** — đã bị xoá ở đợt cải tổ
  cấu trúc 2026-08-23 vì "mồ côi" (không ai import). Bản đầy đủ 9 file + 74 test vẫn nằm trong
  lịch sử git tại commit `9fa6f59`; khôi phục bằng
  `git checkout 9fa6f59 -- packages/core-grading` rồi gắn lại `package.json`/`tsconfig.json`
  composite và project reference. **Đợt 1 của tính năng này KHÔNG cần engine đó** (tiếng Anh chấm
  bằng SRS + luồng viết/nói sẵn có) — ghi lại ở đây để đợt 2 (và GĐ3 môn Hoá) không tưởng nhầm là
  code đã mất.

## 8. Chia PR

| PR  | Nội dung                                                                                        | Cổng ra                                             |
| --- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| E1  | `packages/core-examplan/` — hàm thuần + toàn bộ ca biên mục 5                                   | Test xanh, coverage nhánh ≥ 90%                     |
| E2  | Migration `0070` + `apps/server/src/api/learning/exam-plan.ts` (GET/POST/DELETE) + contract Zod | Boot check + test handler                           |
| E3  | UI `ExamPlan.tsx` — đếm ngược + "3 việc hôm nay" + luồng tạo kế hoạch                           | a11y AA/AAA 0 vi phạm, mobile-first                 |
| E4  | Nối FSRS `requestRetention` theo `phase` + cờ tắt được                                          | `eval` SRS: số lượt ôn không tăng vọt ở phase build |

Mỗi PR một cổng, dừng xin duyệt (CLAUDE.md mục 3).

## 9. Việc để lại

- Kỳ thi thứ hai (Toán vào 10) — chỉ mở sau khi đợt 1 có người dùng thật.
- Nhắc học theo kế hoạch (tái dùng `emailReminders.ts` + `push.ts`): thông điệp đổi thành
  "còn N ngày, hôm nay X việc" — làm chung với ý tưởng #2 để không sửa `reminderContent.ts` hai lần.

---

## [6] Tài liệu: dac-ta-mo-rong-ngon-ngu-va-tu-duy-2026-08-26.md

_(Chi tiết nguồn gốc: `dac-ta-mo-rong-ngon-ngu-va-tu-duy-2026-08-26.md`)_

# Mở rộng ngôn ngữ & tư duy môn Lập trình — hiến chương chương trình M (quyết định 2026-08-26)

> Hiến chương của **chương trình M** (Mở rộng), nối tiếp ba hiến chương bậc đã có:
> `dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md` (luật ba làn) ·
> `dac-ta-bac-p5-deploy-va-lan-c-2026-08-26.md` (chấm bằng phép đếm) ·
> `dac-ta-bac-p6-bon-track-va-ranh-gioi-ngon-ngu-2026-08-26.md` (ranh giới ngôn ngữ chạy được).
> Mọi PR của chương trình M phải theo file này.

## 0. Yêu cầu gốc và điều đã cảnh báo với người dùng

Người dùng yêu cầu (2026-08-26), sau khi đã nghe phân tích hiện trạng:

- **Tầng 1** — bổ sung **dòng lệnh (`bash`)**.
- **Tầng 2** — bổ sung **Kotlin** và **Swift**.
- **Tầng 3** — bổ sung **PARADIGM** (không thêm ngôn ngữ), "để nâng cao tư duy, hệ thống".
- Ràng buộc chất lượng: **"theo tiêu chuẩn cao nhất cho học viên"**.

Ba điều đã nói thẳng với người dùng trước khi bắt tay, ghi lại để phiên sau không tưởng nhầm
là chưa cân nhắc:

1. **Thêm tên ngôn ngữ vào bảng là việc rẻ và vô ích.** Đếm thật trên 60 bài hiện có:
   Java 0 bài · C# 0 · Go 0 · C 0 · C++ 0 · Rust 0. Tức **6/8 ngôn ngữ mà đặc tả gốc đã liệt kê
   hiện chỉ tồn tại dưới dạng một dòng chữ trong bảng.** Chương trình M vì vậy **không được
   phép** dừng ở mức thêm tên: mỗi ngôn ngữ thêm vào phải kèm **bộ chạy chấm được** hoặc bị loại.
2. **Nội dung môn đang mỏng hơn đề cương gốc 4–5 lần** (đặc tả ghi P1 "~40 bài", thực có 10 bài;
   toàn môn 60 bài). Làm dày P1–P3 có lợi cho người học hơn là mở ngôn ngữ thứ 9, thứ 10. Người
   dùng đã nghe và vẫn chọn mở rộng — đây là **quyết định của người dùng**, không phải sơ suất.
   Hệ quả phải chấp nhận: môn sẽ RỘNG trước khi DÀY.
3. **P6 vẫn là bản mở đường** (hiến chương P6 §0): chưa có người học thật đi hết P1–P5. Nội dung
   chương trình M nằm phần lớn ở P6 nên thừa hưởng nguyên cảnh báo đó.

## 1. Vấn đề phải giải

Kotlin và Swift **không có engine nào của môn chạy được** — hệt Go và Rust. Nhưng khác Go/Rust ở
một điểm quyết định: **người dùng yêu cầu khoá Swift "từ cơ bản đến nâng cao, đầy đủ và chi
tiết"**, tức phải dạy được **CÚ PHÁP**, chứ không chỉ cơ chế.

Khuôn Go/Rust (mô hình bằng Python, cú pháp thật ở làn C) **không đáp ứng được yêu cầu đó**: nó
dạy cơ chế rất tốt và hoàn toàn trung thực, nhưng học viên đi hết track vẫn chưa từng gõ một
dòng Swift nào được chấm.

Nên câu phải trả lời: dạy cú pháp Kotlin/Swift **bằng cách nào** mà không vi phạm luật "không
giả vờ" đã theo từ P3-U10?

## 2. Quyết định 1 — Vẫn KHÔNG dựng judge server

Giữ nguyên kết luận hiến chương P5 §6 và P6 §2, vì ba lý do ở đó chưa thứ nào mất hiệu lực: VPS
3 vCPU / 3GB đang gánh web + Postgres + Redis + PM2 cluster 3 instance; chạy code người lạ trên
máy chủ của mình là bề mặt tấn công lớn nhất dự án có thể tự tạo; và chi phí thường xuyên trái
nguyên tắc "0đ hạ tầng thêm cho tới khi có doanh thu tương ứng".

Điều kiện mở lại vẫn là ba điều kiện của hiến chương P6 §2 (có người học thật yêu cầu ở quy mô
đủ lớn **VÀ** có ngân sách hạ tầng riêng **VÀ** có đặc tả cô lập được duyệt).

## 3. Quyết định 2 (TRỤ CỘT) — Bộ chạy TẬP CON viết bằng TypeScript, chạy trong Worker

Đây là cách thứ ba, nằm giữa "judge server" và "mô hình Python", và là cách duy nhất vừa dạy
được cú pháp vừa trung thực.

**Nguyên tắc:** viết một **trình thông dịch tập con** của Kotlin/Swift bằng TypeScript, chạy
trong Web Worker. Học viên gõ **cú pháp Swift/Kotlin thật**, bấm Chạy, và được **chấm bằng
test-case như mọi bài khác của môn**.

### 3.1 Vì sao TypeScript-trong-Worker, không phải Python-trong-Pyodide

Đã cân nhắc viết interpreter bằng Python để tái dùng engine Pyodide sẵn có. **Bác bỏ**, vì:

| Tiêu chí                           | Interpreter bằng TS (Worker)                    | Interpreter bằng Python (Pyodide)                         |
| ---------------------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| Khởi động ở trình duyệt            | Tức thì (đã trong bundle Worker)                | Phải tải **~13MB Pyodide** trước                          |
| Cổng CI chấm code mẫu              | Chạy thẳng bằng `vitest`                        | Cần `python3` + nạp Pyodide                               |
| Rủi ro trôi giữa CI và trình duyệt | **Không có** — cùng một file TS chạy cả hai nơi | Có (đúng loại khe hở `lessonsPython.test.ts` đã cảnh báo) |
| Ngân sách bundle                   | Worker nạp lười, không đụng Initial JS          | Không đụng                                                |

Cột "rủi ro trôi" là cột quyết định. Hiến chương P6 §4 đã ghi một ca có thật: bài dùng
`threading` **xanh ở CI** (python3 chạy thread bình thường) nhưng **rớt trên máy học viên**
(Pyodide không tạo được thread) — cổng không bắt được vì cổng chạy đúng thứ bị hỏng ở nơi kia.
Interpreter viết bằng TS **triệt tiêu hẳn loại lỗi đó**: cổng CI và trình duyệt chạy **cùng một
đoạn mã**, không phải hai bản cài đặt của cùng một ngôn ngữ.

### 3.2 Tiền lệ trong repo — không phải phát minh mới

Cách này đã chạy thật ba lần trong môn:

- `gitSim.ts` (422 dòng) — mô phỏng Git, chấm 3 bài P3-U10/U11.
- `httpSimPrelude.ts` — module `requests` giả lập, làn B của P4.
- `apiSimPrelude.ts` — gói `fastapi` giả lập, 4 bài P4.

Chương trình M nâng cùng kỹ thuật đó lên một bậc: từ "giả lập một thư viện" thành "giả lập một
ngôn ngữ".

### 3.3 LUẬT TỰ KHAI (bắt buộc, không có ngoại lệ)

Kế thừa luật tự khai của hiến chương P4 và siết chặt hơn vì đối tượng giả lập lần này lớn hơn:

1. **Bộ chạy in một dòng khai báo ngay đầu mỗi lượt chạy**, ví dụ:
   `[GIA LAP] Bo chay Swift rut gon cua DHCB — khong phai swiftc.`
2. **Mỗi unit phải có mục "Bộ chạy này KHÔNG làm gì"**, liệt kê thẳng: không có thư viện chuẩn
   đầy đủ, không SwiftUI/UIKit/Foundation, không đa luồng thật, không quản lý bộ nhớ thật.
3. **CẤM câu chữ ngụ ý đang chạy trình biên dịch thật.** Không "swiftc của bạn báo lỗi…".
   Được phép nói "cú pháp này là cú pháp Swift thật" — vì đó là sự thật — nhưng phải kèm chỗ
   khác biệt khi có.
4. **Bước ⑦ (về nhà) luôn là làn C**: cài Swift/Xcode (hoặc Kotlin/Android Studio) thật, chạy
   đúng đoạn vừa viết, đối chiếu. **Không chấm hộ làn C** (luật 3 hiến chương P4).
5. Khi bộ chạy **cố ý khác** ngôn ngữ thật ở điểm nào, điểm đó phải nằm trong bảng "khác biệt đã
   biết" của đặc tả bộ chạy, và bài chạm tới nó phải nói ra.

### 3.4 Cổng chất lượng riêng của bộ chạy

Một interpreter sai âm thầm còn tệ hơn không có interpreter: nó **dạy sai cú pháp** cho người
mới, và người mới không có cách nào biết. Nên bắt buộc:

- **Bộ test đối chiếu (conformance)**: mỗi tính năng cú pháp có ≥ 1 ca kiểm chứng kết quả khớp
  ngữ nghĩa Swift/Kotlin thật. Ca đối chiếu phải được **chạy tay một lần trên trình biên dịch
  thật** và ghi lại kết quả vào đặc tả bộ chạy — không suy đoán từ trí nhớ.
- **Cổng nội dung**: code mẫu (`make.sampleSolution`) của MỌI bài phải chạy thật và đạt HẾT
  test-case, đúng khuôn `lessonsPython.test.ts` đang làm — thêm `lessonsSwift.test.ts` và
  `lessonsKotlin.test.ts`.
- **Lỗi phải NÓI ĐƯỢC**: thông báo lỗi của bộ chạy phải chỉ đúng **số dòng của học viên** và
  viết bằng tiếng Việt dễ hiểu. Đây là nơi bộ chạy tự viết **hơn hẳn** trình biên dịch thật với
  người mới, và là lý do sư phạm chính đáng thứ hai của quyết định này.

## 4. Quyết định 3 — Tầng 1: `bash` mô phỏng, KHÔNG dùng WASM

Shell là thao tác trên **hệ thống file**, tất định, không cần máy ảo. Nên `bash` đi theo đúng
khuôn `gitSim.ts`: mô phỏng bằng TypeScript, hệ thống file trong bộ nhớ, dựng lại từ đầu mỗi
lượt chạy (học viên `rm -rf` thoải mái để học, lượt sau vẫn sạch).

**Tập lệnh bắt buộc phủ:** `pwd cd ls mkdir rm cp mv cat echo head tail grep wc sort uniq cut
find chmod` · ống `|` · chuyển hướng `>` `>>` · biến và `$(...)` · `&&` `||` · mã thoát
(`exit code`) · vòng `for` · `if` · chạy script `.sh`.

**Không phủ (khai báo thẳng trong bài):** không mạng, không tiến trình nền, không `sudo`, không
quyền người dùng thật, không `sed`/`awk` đầy đủ (chỉ dạng cơ bản nếu cần).

**FS của `bash` tách riêng với FS của `gitSim`** ở giai đoạn đầu. Gộp hai thế giới lại (để dạy
"gõ `git` trong shell") là việc đáng làm nhưng là **PR riêng, sau khi cả hai chạy ổn** — gộp
sớm là cách chắc nhất để hỏng cả hai thứ đang chạy tốt.

## 5. Quyết định 4 — Tầng 3: PARADIGM, dạy bằng ngôn ngữ đã có

Không thêm ngôn ngữ nào cho tầng 3. C/C++ và Rust đã phủ mảng "hiểu máy tính"; thêm
Zig/Julia/Elixir là chạy theo hype và sẽ lại thành tên suông (xem §0.1). Tầng 3 mở theo **cách
nghĩ**, dạy bằng Python/TypeScript đã có bộ chạy.

Ba trụ, chọn vì đây đúng là thứ ngăn cách "người viết được code" với "kỹ sư":

| Trụ                                      | Dạy cái gì                                                                                                                                                             | Vì sao là tiêu chuẩn cao nhất                                                                                                                         |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F — Lập trình hàm**                    | Bất biến · hàm thuần · hàm bậc cao · `map/filter/reduce` · đệ quy · lười (generator) · kiểu tổng/tích · **tách hiệu ứng phụ ra khỏi lõi thuần**                        | Là nguồn gốc của gần hết cải tiến ngôn ngữ 15 năm qua; "lõi thuần + vỏ hiệu ứng" là kiến trúc dễ test nhất tồn tại                                    |
| **C — Đồng thời & phân tán**             | Mô hình xen kẽ tất định · tranh chấp · khoá & deadlock · actor/thông điệp · **idempotency** · at-least-once vs exactly-once · đồng hồ logic · retry + backoff + jitter | Mọi hệ thống thật đều phân tán từ lúc có 2 tiến trình; đây cũng là loại lỗi mà type-checker **không bao giờ** bắt được (đúng luật §4.9 của CLAUDE.md) |
| **S — Thiết kế hệ thống & tư duy kỹ sư** | Ước lượng số lớn · cache · hàng đợi · phân mảnh · bất biến & ca biên · quan sát được · **phân tích sự cố** · đọc code lạ · gọi tên đánh đổi                            | Là thứ phỏng vấn cấp cao hỏi và là thứ người tự học thiếu nhiều nhất                                                                                  |

Trụ C **kế thừa và mở rộng** mô hình xen kẽ tất định đã dựng ở `p6-u2` (track Go) — không viết
lại. Và tiếp tục **cấm tuyệt đối `threading`/`multiprocessing`** (hiến chương P6 §4, đã kiểm
chứng trên Pyodide 314.0.5).

## 6. Vị trí trong khung P1–P6 — KHÔNG đụng schema

Ràng buộc cứng phải tôn trọng: mã bài là `^p[1-6]-u\d+-l\d+$`, và mã này là **khoá tiến độ
trong Postgres**. Dựng hệ bậc song song (S1–S5 cho Swift) sẽ phải sửa regex, khoá tiến độ,
route, UI và toàn bộ test — thay đổi phá vỡ, nhiều PR, đổi lấy rất ít giá trị cho học viên.
**Bác bỏ.**

Xếp chỗ như sau:

| Nội dung          | Chỗ đặt                                         | Vì sao                                                                                                                                                        |
| ----------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bash` (tầng 1)   | **Mở rộng `p3-u11` "Công cụ dev"** từ 1 → 4 bài | Unit đã có sẵn đúng chủ đề. **Không thêm unit mới vào P3** vì `p3-u12` là milestone cuối bậc, và `curriculum.test.ts` bắt unit cuối bậc phải có `projectStep` |
| Kotlin (tầng 2)   | **P6 unit u5–u7** (3 unit)                      | P4 đã đóng tròn với TypeScript; đổi P4 là thay đổi phá vỡ. Tầng 2 là "chọn 1 nhánh nghề" → đúng bản chất **track tự chọn** của P6                             |
| Swift (tầng 2)    | **P6 unit u8–u12** (5 unit)                     | Nhiều unit hơn Kotlin vì người dùng yêu cầu riêng khoá Swift "cơ bản → nâng cao, đầy đủ và chi tiết"                                                          |
| Paradigm (tầng 3) | **P6 unit u13–u15** (3 trụ F/C/S)               | Chuyên đề tự chọn — đúng định nghĩa P6                                                                                                                        |

**P6 giãn từ 4 → 15 unit.** Hệ quả cần xử ở PR giao diện: trang bậc P6 hiện bày 4 track ngang
hàng; 15 unit phải **gom nhóm theo track** chứ không đổ thành một danh sách dài.

**P6 vẫn KHÔNG có chặng dự án trục** (hiến chương P6 §7 — dự án trục kết thúc ở P5). Dự án của
chương trình M nằm **trong bài học**, xem §7.

## 7. Dự án lồng trong bài — luật riêng của chương trình M

Người dùng yêu cầu "lồng những dự án tốt vào trong bài học". Luật:

- **Mỗi unit kết bằng một mini-project chấm được**, dùng đúng kiến thức của unit, không phải bài
  tập rời rạc.
- **Mỗi track có một sản phẩm trục nhỏ tích luỹ qua các unit của track** (khác dự án trục T1 của
  P1–P5 — track P6 là hướng tự chọn, không bắt buộc tuần tự):
  - **Kotlin:** "Sổ chi tiêu" — model dữ liệu → null safety → collections/lambda → sealed class
    xử lý trạng thái. Làn C: dựng thành app Android thật.
  - **Swift:** "Sổ tay học tập" — value vs reference → Optional → protocol + generic → error
    handling → mô hình bất đồng bộ. Làn C: dựng thành app SwiftUI thật.
  - **Paradigm F:** refactor một đoạn code có hiệu ứng phụ thành "lõi thuần + vỏ hiệu ứng".
  - **Paradigm C:** dựng bộ mô phỏng lịch xen kẽ, tự tìm ra lỗi mất cập nhật, rồi tự sửa.
  - **Paradigm S:** phân tích một sự cố có thật (dùng ngay hồ sơ sự cố của chính dự án này —
    `docs/ke-hoach-khoi-phuc-su-co-server.md`) và viết post-mortem.
- **Phần "app thật" luôn ở làn C.** Không mô phỏng SwiftUI, không mô phỏng Android Studio — cùng
  lý do deploy không mô phỏng ở P5.

## 8. Thứ tự thi hành — 12 PR

Thứ tự này có chủ đích: **hạ tầng trước nội dung**, và **rẻ trước đắt**, để nếu phải dừng giữa
chừng thì thứ đã merge vẫn dùng được.

| PR          | Nội dung                                                                | Loại               |
| ----------- | ----------------------------------------------------------------------- | ------------------ |
| **M0**      | Hiến chương này                                                         | Đặc tả             |
| **M1**      | Hạ tầng `bash` (`bashSim.ts` + runner + test)                           | Hạ tầng            |
| **M2**      | Nội dung `p3-u11` mở rộng — 3 bài dòng lệnh                             | Nội dung           |
| **M3**      | Hạ tầng `swiftsim` — interpreter + bộ test đối chiếu                    | Hạ tầng (đắt nhất) |
| **M4–M6**   | Nội dung Swift `p6-u8`…`p6-u12` (5 unit)                                | Nội dung           |
| **M7**      | Hạ tầng `kotlinsim` — interpreter + bộ test đối chiếu                   | Hạ tầng            |
| **M8–M9**   | Nội dung Kotlin `p6-u5`…`p6-u7` (3 unit)                                | Nội dung           |
| **M10–M11** | Nội dung Paradigm `p6-u13`…`p6-u15` (3 trụ)                             | Nội dung           |
| **M12**     | Giao diện: gom nhóm 15 unit P6 theo track, nhãn ngôn ngữ mới, a11y, e2e | Giao diện          |

**Cổng giữa M3 và M4:** interpreter Swift phải qua bộ test đối chiếu **trước khi** soạn một bài
nội dung nào. Soạn nội dung trên một interpreter chưa kiểm chứng là cách chắc chắn nhất để phải
viết lại cả 20 bài.

## 9. Điều KHÔNG làm (ghi để phiên sau khỏi mở lại)

- **Không dựng judge server** (§2) — kể cả khi thêm 3 ngôn ngữ.
- **Không dựng hệ bậc song song S1–S5** (§6) — thay đổi phá vỡ, giá trị thấp.
- **Không thêm ngôn ngữ cho tầng 3** (§5) — tầng 3 mở theo paradigm.
- **Không mô phỏng SwiftUI / UIKit / Android Studio / Xcode** (§7) — làn C.
- **Không dùng `threading`/`multiprocessing`** trong bất cứ nội dung nào (hiến chương P6 §4).
- **Không gộp FS của `bash` với `gitSim`** ở giai đoạn đầu (§4).
- **Không hứa bộ chạy đầy đủ.** Bộ chạy là TẬP CON, và mỗi unit phải nói ra nó thiếu gì (§3.3).

## 10. Tiêu chí nghiệm thu của cả chương trình

1. Ba ngôn ngữ mới (`bash`, `swift`, `kotlin`) đều có **bộ chạy chấm được** — không ngôn ngữ nào
   chỉ tồn tại dưới dạng tên trong bảng (đây là bài học §0.1, và là tiêu chí quan trọng nhất).
2. Code mẫu của **mọi** bài mới chạy thật, đạt hết test-case, chặn CI.
3. Bộ test đối chiếu của `swiftsim`/`kotlinsim` xanh, và mỗi ca đối chiếu có ghi nguồn kết quả
   thật.
4. Mỗi unit mới có **mini-project chấm được** và **mục "bộ chạy không làm gì"**.
5. Mỗi bài mới có **2–4 thẻ SRS** (giữ chuẩn 195 thẻ hiện hành, `srsCards.test.ts` canh).
6. Trang bậc P6 bày 15 unit **gom theo track**, không phải danh sách dài.
7. Toàn bộ cổng của dự án xanh: build · typecheck · lint 0 cảnh báo · format · test · e2e ·
   a11y (A/AA 0 vi phạm + AAA cho nội dung/tiêu đề) · ngân sách bundle.
8. Không bài nào vi phạm luật tự khai §3.3 — rà bằng cách đọc lại, và bằng cổng nếu tự động hoá
   được.

---

## [7] Tài liệu: dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md

_(Chi tiết nguồn gốc: `dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md`)_

# Bậc P4 — Mô phỏng tới đâu, làm thật từ đâu (quyết định 2026-08-26)

> Trả lời câu hỏi đặt ra trước khi soạn P4: "dạy backend bằng mô phỏng tới đâu, phần nào
> chuyển hẳn sang làm trên máy thật + nộp bằng chứng". Đây là **hiến chương của bậc P4** —
> mọi PR nội dung P4 phải theo.

## 1. Vì sao phải chốt trước

P1–P3 chạy trọn trong sandbox trình duyệt (Pyodide · Worker JS · SQLite-WASM · fetch giả lập
· gitSim). Từ P4 mô hình này bắt đầu đuối: HTTP thật, server thật, deploy thật không mô phỏng
được trung thực. Mà **luật "không giả vờ"** của môn (đã đặt từ P3-U10 Git) cấm bịa ra một
"server" rồi bảo học viên rằng họ vừa chạy backend.

## 2. Luật phân tuyến (bất biến của P4)

Mỗi bài P4 phải rơi vào ĐÚNG MỘT trong ba làn, và **giao diện phải nói rõ đang ở làn nào**:

| Làn   | Tên                                    | Chạy ở đâu                         | Dùng cho                                                                    | Chấm bằng                                    |
| ----- | -------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------- |
| **A** | **Chạy thật trong sandbox**            | Pyodide / Worker                   | OOP (U1–U3), lỗi & logging (U4), test tự động (U5–U6), TypeScript (U10–U11) | test-case như P1–P3                          |
| **B** | **Mô phỏng KHAI BÁO MINH BẠCH**        | Pyodide + thư viện giả lập của môn | HTTP client (U7), định tuyến backend (U8–U9)                                | test-case chạy trên vật giả lập              |
| **C** | **Làm trên MÁY THẬT + nộp bằng chứng** | máy học viên                       | dựng server thật, gọi API có key thật, milestone U12                        | học viên tự khai + Companion soát bằng chứng |

Luật kèm theo, không được vi phạm:

1. **Làn B phải tự khai.** Mọi vật giả lập in ra dòng đầu tiên có chữ `[GIẢ LẬP]` và bài học
   nói rõ: "cái này KHÔNG phải server thật; nó chỉ chạy đúng phần định tuyến/xử lý để bạn
   hiểu cơ chế". Cấm dùng chữ "server của bạn đang chạy tại http://…" khi không có server.
2. **Làn B luôn có làn C đi kèm.** Mỗi unit làn B bắt buộc có bước ⑦ (ứng dụng về nhà) là
   phiên bản THẬT của chính bài đó trên máy học viên (`uvicorn`, `pytest`, `curl`), kèm mô tả
   bằng chứng cần chụp/dán. Học được cơ chế trong 5 phút ở làn B, rồi chạm vào cái thật ở làn C.
3. **Không chấm điểm làn C bằng cách đoán.** Không có server để kiểm chứng thì hệ thống
   KHÔNG được đánh dấu "đạt" thay học viên. Làn C dùng cơ chế tự khai + bằng chứng (giống
   khuôn milestone dự án trục đã có), và Companion đối chiếu bằng chứng đó, có quyền nói
   "chưa đủ căn cứ".
4. **Không dựng judge server đa ngôn ngữ ở P4.** Đặc tả gốc (§ "Judge server") để việc đó cho
   P5+ và phải có đặc tả riêng. P4 không mở cửa này.

## 3. Áp vào từng unit P4

| Unit                | Làn | Hạ tầng cần thêm                                                                                                                                                                                                                                       |
| ------------------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| U1–U3 OOP, refactor | A   | không — Pyodide sẵn có                                                                                                                                                                                                                                 |
| U4 lỗi & logging    | A   | không (`logging` có trong Pyodide; output qua stderr → gộp vào stdout)                                                                                                                                                                                 |
| U5–U6 test tự động  | A   | **`pytestPrelude.ts`** — bộ chạy test tối giản tương thích cú pháp pytest (`assert`, `pytest.raises`, `pytest.approx`, `parametrize`), thu thập hàm `test_*` rồi in báo cáo kiểu pytest. Khai báo rõ là bản rút gọn của môn, không phải pytest đầy đủ. |
| U7 HTTP & REST      | B   | **`httpSimPrelude.ts`** — `requests.get/post` giả lập trỏ vào bộ dữ liệu tĩnh của môn (dùng lại `weatherData.ts`/`shopData.ts`), có status code + JSON + lỗi mạng để dạy xử lý lỗi                                                                     |
| U8–U9 backend nhỏ   | B   | **`apiSimPrelude.ts`** — object `app` có decorator `@app.get/post/put/delete`, một `client` gọi thẳng handler trong tiến trình + SQLite qua `sqlite3` của Pyodide. Chấm = so JSON trả về. Làn C: chạy FastAPI + uvicorn thật ở nhà.                    |
| U10–U11 TypeScript  | A   | **cổng type-check phía SERVER** (`/api/ts-check`) dùng `typescript` đã có sẵn trong repo — KHÔNG nhét compiler TS vào bundle trình duyệt (ngân sách bundle đang ở 99,7%, xem nợ kỹ thuật #7)                                                           |
| U12 milestone       | C   | dùng lại khuôn milestone tự khai của dự án trục                                                                                                                                                                                                        |

## 4. Thứ tự thi hành (mỗi chặng chạy được độc lập)

- **L12** — U1–U4 (OOP + lỗi/logging). Làn A thuần, KHÔNG hạ tầng mới. ✅
- **L13** — `pytestPrelude` + `pyLanes` + cổng CI + U5–U6. ✅
- **L14** — `httpSimPrelude` + U7. ✅
- **L15** — `apiSimPrelude` (định tuyến + SQLite) + U8–U9. ✅
- **L16** — `/api/ts-check` + làn TypeScript + U10–U11. ✅
- **L17** — bước dự án trục chặng P4 + U12 milestone. ✅

### 4.1. Cơ chế chung của ba làn Python mở rộng (chốt khi thi hành L13)

Ba làn `pytest` · `httpsim` · `apisim` KHÔNG đẻ thêm engine nào: chúng vẫn chạy trên đúng
Python đã có (Pyodide ở trình duyệt, python3 ở cổng CI). Khác biệt duy nhất được khai báo ở
**một chỗ** — `packages/subject-programming/pyLanes.ts`:

- `fileCuaLan(lane)` — các module Python ghi vào thư mục làm việc trước khi chạy;
- `noiCodeTheoLan(lane, code)` — phần nối THÊM VÀO CUỐI code học viên.

Luật kèm theo, rút từ đúng thứ suýt sai khi làm: **không chèn prelude vào ĐẦU code học viên**
— làm vậy số dòng trong traceback lệch đi và người mới sẽ đi tìm lỗi ở một dòng không tồn tại.
Prelude luôn là FILE riêng; code học viên giữ nguyên dòng 1.

Hệ quả hạ tầng: workspace (cả Pyodide lẫn cổng CI) nay **tạo được thư mục con**, vì
`from fastapi.testclient import TestClient` đòi `fastapi` phải là một GÓI Python thật.

## 5. Điều KHÔNG làm ở P4 (ghi để phiên sau khỏi mở lại)

- Không cấp container/VM cho học viên (tốn tiền VPS, rủi ro bảo mật — đặc tả gốc đã loại).
- Không proxy API bên thứ ba có key qua server của mình (lộ hạn mức, dễ bị lạm dụng): U7 làn C
  yêu cầu học viên tự đăng ký free tier và chạy trên máy họ.
- Không mô phỏng deploy. Deploy là nội dung P5 và bắt buộc làn C.

---

## [8] Tài liệu: dac-ta-bac-p5-deploy-va-lan-c-2026-08-26.md

_(Chi tiết nguồn gốc: `dac-ta-bac-p5-deploy-va-lan-c-2026-08-26.md`)_

# Bậc P5 — Đo được thì mới dạy được, deploy thì không mô phỏng (quyết định 2026-08-26)

> Hiến chương của bậc P5, nối tiếp `dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md`. Mọi PR nội
> dung P5 phải theo. Trả lời hai câu hỏi mà bậc này bắt buộc phải chốt trước khi soạn:
> (1) dạy hiệu năng/thuật toán mà không có đồng hồ đáng tin thì chấm bằng gì;
> (2) deploy — thứ hiến chương P4 đã cấm mô phỏng — thì dạy ra sao.

## 1. Bậc P5 khác các bậc trước ở đâu

P1–P4 dạy "viết được cho chạy đúng". P5 dạy thứ khác hẳn: **cùng một kết quả đúng, có cách rẻ
và có cách đắt** — và người kỹ sư là người phân biệt được. Kèm theo đó là ba mảng mà đến bậc
này mới đủ nền để chạm: thiết kế CSDL tử tế, bảo mật nhập môn, và đưa sản phẩm ra Internet.

Hệ quả: bậc này KHÔNG cần engine mới nào. Bốn làn đã có (`python` · `sql` · `apisim` · `pytest`)
đủ chở toàn bộ nội dung. Cái phải chốt là **cách chấm**, không phải hạ tầng.

## 2. Luật số 1 của bậc — CHẤM BẰNG PHÉP ĐẾM, KHÔNG CHẤM BẰNG ĐỒNG HỒ

Bài đầu tiên của P5 là big-O. Phản xạ tự nhiên là cho học viên đo `time.perf_counter()` rồi
chấm "phải nhanh hơn X giây". **Cấm làm vậy**, vì ba lý do đã lường trước:

1. **Không tái lập được.** Cùng một code chạy trên Pyodide (WASM, máy học viên, có thể là điện
   thoại) và trên runner CI khác nhau cả chục lần. Ngưỡng giây nào cũng sai ở một trong hai nơi.
2. **Dạy sai bản chất.** Big-O nói về _tốc độ tăng_, không nói về số giây. Học viên đo được
   0,8 giây rồi kết luận "thuật toán tốt" là đã hiểu ngược.
3. **Test theo thời gian là test flaky** — đúng thứ Tầng 1b của `QUY-TRINH-AUDIT.md` bắt.

Thay vào đó, luật của bậc:

- **Đo thời gian là để NHÌN THẤY, chấm điểm là ĐẾM THAO TÁC.** Bài học vẫn cho học viên chạy
  thí nghiệm đồng hồ thật (bước ③ ví dụ mẫu và bước ⑦ về nhà) — đó là chỗ trực giác hình
  thành. Nhưng bước ⑥ (Make, có test-case) luôn chấm trên một **bộ đếm xác định**: số lần so
  sánh, số vòng lặp, số lần đọc CSDL. Cùng một input thì mọi máy cho cùng một con số.
- **Test-case của bài hiệu năng phải phân biệt được hai lời giải cùng ra kết quả đúng.** Nếu
  bộ test cho lời giải O(n²) đi qua thì bài đó chưa dạy được gì: thêm ca ẩn dựng dữ liệu đủ
  lớn để chỉ lời giải đúng độ phức tạp mới trả lời nổi.

## 3. Làn C và deploy — không mô phỏng, không chấm hộ

Hiến chương P4 §5 đã chốt: "Không mô phỏng deploy. Deploy là nội dung P5 và bắt buộc làn C."
Giữ nguyên, và nói rõ thêm cách thi hành:

| Thứ                                | Làm ở đâu                                     | Hệ thống chấm thế nào                         |
| ---------------------------------- | --------------------------------------------- | --------------------------------------------- |
| Cấu hình bằng biến môi trường      | làn A (`python`, `os.environ` thật)           | test-case bình thường — đây là CODE, đo được  |
| Hash mật khẩu, chống SQL injection | làn A (`python` — `sqlite3` + `hashlib` thật) | test-case bình thường                         |
| Thiết kế schema, index, giao dịch  | làn A (`sql` — SQLite thật)                   | test-case bình thường                         |
| **Dựng máy chủ, deploy, HTTPS**    | **làn C — máy thật của học viên**             | **KHÔNG chấm tự động. Tự khai + bằng chứng.** |

Luật kèm theo:

1. **Tách phần đo được ra khỏi phần không đo được.** Unit deploy (U8) không dạy "bấm nút trên
   Render" như nội dung chính — nội dung chấm được của nó là thứ khiến deploy thành công hay
   thất bại trong 90% trường hợp thật: **ứng dụng đọc cấu hình từ môi trường, và bí mật không
   nằm trong code**. Phần thao tác nền tảng nằm ở bước ⑦, làn C.
2. **Không hứa hộ nền tảng.** Bài học KHÔNG ghi tên một nhà cung cấp free-tier cụ thể như thể
   nó sẽ còn miễn phí mãi (các nền tảng đổi chính sách liên tục). Bài dạy _tiêu chí chọn_ và
   _thứ phải chuẩn bị_; danh sách nền tảng cụ thể để ở phần về nhà, ghi rõ "kiểm lại chính
   sách hiện hành trước khi đăng ký".
3. **Milestone P5 = hoàn thành môn, nhưng vẫn không chấm hộ.** Học viên nộp URL sống + link
   repo; hệ thống kiểm URL có sống hay không (fetch HEAD, có rate-limit — hạ tầng của PR sau),
   Companion đối chiếu bằng chứng và **có quyền nói "chưa đủ căn cứ"**. Không có URL sống thì
   không có dấu hoàn thành — đúng luật "không giả vờ" đã theo từ P3-U10.

## 4. Bảo mật — dạy bằng CHÍNH lỗi của mình, không bằng danh sách

OWASP top 3 (injection · XSS · auth hỏng) rất dễ trượt thành bài học thuộc lòng. Luật của bậc:
mỗi lỗ hổng phải được **cho nổ trước, vá sau, trên chính code học viên vừa viết ở bậc trước**.

- **Injection:** dựng câu SQL bằng ghép chuỗi rồi cho một input "hiền lành" phá tan bảng —
  học viên tự thấy. Rồi vá bằng tham số `?`. Chấm được: ca ẩn đưa vào input hiểm.
- **Auth:** lưu mật khẩu thô rồi in bảng ra là hiểu ngay vấn đề. Vá bằng hash có muối
  (`hashlib.pbkdf2_hmac` — có thật trong Pyodide, không cần thư viện ngoài).
  Unit này chạy ở làn A chứ không phải làn B: `sqlite3` và `hashlib` là thật, còn bộ API giả
  lập của môn chưa có header nên kể chuyện `Authorization: Bearer …` trên nó sẽ là bịa —
  phần phiên đăng nhập qua header để ở bước ⑦, làn C.
- **XSS** dạy ở mức nhận biết trong phần lý thuyết + về nhà: bộ chạy DOM của môn không phải
  trình duyệt đầy đủ nên không dựng được ca nổ trung thực; **không giả vờ chấm** thứ mình
  không kiểm chứng được (đúng luật 3 của hiến chương P4).

## 5. Áp vào từng unit P5

| Unit                  | Làn | Ngôn ngữ | Ghi chú                                                                            |
| --------------------- | --- | -------- | ---------------------------------------------------------------------------------- |
| U1 Big-O trực quan    | A   | `python` | chấm bằng bộ đếm so sánh; đồng hồ chỉ để nhìn                                      |
| U2 Tìm kiếm & sắp xếp | A   | `python` | nhị phân + sort; ca ẩn đủ lớn để loại lời giải quét tuyến tính                     |
| U3 CTDL nền           | A   | `python` | stack/queue/dict/đệ quy — mỗi cấu trúc gắn một việc chỉ nó làm gọn                 |
| U4 Cây & đồ thị       | A   | `python` | BFS/DFS trên bản đồ có thật (tuyến xe buýt), không dùng thư viện                   |
| U5 Thiết kế CSDL      | A   | `sql`    | chuẩn hoá, khoá ngoại, index, giao dịch — SQLite thật                              |
| U6 Bảo mật nhập môn   | A   | `python` | injection + hash mật khẩu, nổ trước vá sau — `sqlite3` thật, không cần API giả lập |
| U7 Hiệu năng          | A   | `python` | O(n²) → tra bảng băm trên 10.000 đơn; ca ẩn loại lời giải chậm                     |
| U8 Deploy             | A+C | `python` | phần chấm: cấu hình bằng môi trường + không bí mật trong code                      |
| U9 Milestone P5       | B+C | `apisim` | ráp cả bậc; phần deploy thật nằm ở làn C, tự khai + bằng chứng                     |

## 6. Điều KHÔNG làm ở P5 (ghi để phiên sau khỏi mở lại)

- **Không dựng judge server đa ngôn ngữ.** Đặc tả gốc để ngỏ cho "P5–P6"; sau khi soạn xong P5
  bằng bốn làn sẵn có, kết luận là **không cần** — nó chỉ cần thiết khi mở track Java/Go/C ở
  P6, và lúc đó phải có đặc tả riêng về cô lập tiến trình.
- **Không tự động push/deploy hộ học viên**, không xin OAuth scope ghi lên GitHub của họ (giữ
  nguyên quyết định của đặc tả dự án trục §4.5).
- **Không đo thời gian để chấm điểm** (luật §2) — kể cả khi "chỉ một ca thôi".

---

## [9] Tài liệu: dac-ta-bac-p6-bon-track-va-ranh-gioi-ngon-ngu-2026-08-26.md

_(Chi tiết nguồn gốc: `dac-ta-bac-p6-bon-track-va-ranh-gioi-ngon-ngu-2026-08-26.md`)_

# Bậc P6 — Bốn track chuyên sâu và ranh giới "ngôn ngữ nào chạy được" (quyết định 2026-08-26)

> Hiến chương của bậc P6, nối tiếp `dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md` (luật ba làn)
> và `dac-ta-bac-p5-deploy-va-lan-c-2026-08-26.md` (chấm bằng phép đếm, deploy không mô phỏng).
> Mọi PR nội dung P6 phải theo.

## 0. Cảnh báo đã nêu với người dùng trước khi làm

Đặc tả gốc (`dac-ta-mon-lap-trinh-2026-08-24.md` §4) ghi rõ bốn track P6 **"soạn sau khi P1–P5
chạy thật"** — tức sau khi có người học đi hết P1–P5 và ta biết chỗ nào họ vấp. Bậc này được
soạn TRƯỚC mốc đó theo yêu cầu trực tiếp của người dùng. Hệ quả cần nhớ khi đọc lại: nội dung P6
chưa được hiệu chỉnh theo dữ liệu người học thật, nên nó là **bản mở đường**, dễ phải sửa hơn
P1–P5. Ghi ra đây để phiên sau không tưởng nhầm là đã kiểm chứng ngoài đời.

## 1. Vấn đề riêng của bậc này

P6 mở bốn track: **AI ứng dụng** (Python) · **Backend cloud** (Go) · **Hệ thống** (C → Rust) ·
**Luyện phỏng vấn thuật toán** (Python). Hai track giữa dùng ngôn ngữ mà **không engine nào của
môn chạy được** — Pyodide chạy Python, Worker chạy JavaScript, sql.js chạy SQLite, hết.

Nên câu phải trả lời trước khi soạn một chữ nào: dạy Go và Rust **bằng cách nào** mà không vi
phạm luật "không giả vờ" đã theo từ P3-U10?

## 2. Quyết định 1 — KHÔNG dựng judge server, kể cả ở P6

Đặc tả gốc (§ "Judge server") để ngỏ phương án B: Judge0/isolate tự host trên VPS để chấm
Java/Go/C. Hiến chương P5 §6 đã kết luận không cần ở P5. Nay xét lại đúng ở chỗ nó được dành
cho — P6 — và kết luận vẫn là **KHÔNG**, vì ba lý do có thật, không phải ngại việc:

1. **Tiền và máy.** VPS hiện tại 3 vCPU / 3GB RAM đang chạy web + Postgres + Redis + PM2
   cluster 3 instance. Một judge server đa ngôn ngữ cần RAM/CPU riêng và phải cô lập thật
   (container per-run, giới hạn thời gian/bộ nhớ/mạng). Đây là chi phí thường xuyên, trong khi
   nguyên tắc của dự án là 0đ hạ tầng thêm cho tới khi có doanh thu tương ứng.
2. **Bảo mật.** Chạy code người lạ trên máy chủ của mình là bề mặt tấn công lớn nhất mà dự án
   có thể tự tạo ra. Nó cần một đặc tả riêng về cô lập tiến trình, hạn mức, và quy trình sự cố —
   không phải một mục trong PR nội dung.
3. **Giá trị sư phạm thấp hơn tưởng.** Cái người mới cần ở track Go/Rust không phải là "trình
   biên dịch nói câu gì" — mà là **hiểu CƠ CHẾ**: vì sao chia sẻ bộ nhớ giữa hai luồng lại sinh
   lỗi, sở hữu và mượn nghĩa là gì. Cơ chế đó dạy được bằng thứ chạy được ngay.

Điều kiện để MỞ LẠI câu hỏi này (ghi để phiên sau khỏi bàn từ đầu): khi môn có người học thật
yêu cầu chấm cú pháp Go/Rust ở quy mô đủ lớn, VÀ dự án có ngân sách hạ tầng riêng, VÀ có đặc tả
cô lập được duyệt. Thiếu một trong ba thì câu trả lời vẫn là không.

## 3. Quyết định 2 — Track Go/Rust dạy CƠ CHẾ bằng mô hình chạy được, cú pháp thật ở làn C

Đây là cách duy nhất vừa trung thực vừa dạy được. Luật:

- **Bài xây một MÔ HÌNH của cơ chế, bằng Python, và nói thẳng đó là mô hình.** Học viên không
  "viết Go" — họ viết một bộ mô phỏng xen kẽ luồng, hoặc một bộ kiểm tra quyền sở hữu. Cái họ
  hiểu xong là thứ Go/Rust thật sự làm.
- **CẤM câu chữ ngụ ý đang chạy ngôn ngữ đó.** Không "chương trình Go của bạn chạy ra…". Bài
  phải nêu rõ chỗ mô hình khác thật.
- **Bước ⑦ (về nhà) luôn là làn C:** cài Go/Rust thật, chạy đúng kịch bản vừa mô hình hoá, đối
  chiếu. Với Rust, bài chỉ đích danh mã lỗi thật của trình biên dịch (E0382 dùng giá trị đã
  chuyển quyền · E0505 không thể chuyển khi đang bị mượn) để học viên biết mình phải thấy gì.
- **Không chấm hộ làn C** — giữ nguyên luật 3 của hiến chương P4.

Đổi lại, mô hình có một ưu điểm mà chạy thật KHÔNG có: **cuộc đua trở nên tái lập được.** Chạy
hai luồng thật thì lỗi mất cập nhật xuất hiện lúc có lúc không, và người mới kết luận "code em
chạy đúng mà". Mô hình xen kẽ tất định cho phép chỉ thẳng vào MỘT lịch xen kẽ cụ thể và nói:
đây, chính chỗ này.

## 4. Quyết định 3 (hạ tầng, đã KIỂM CHỨNG) — không bài nào của môn được dùng `threading`

Đã chạy thử thật trên Pyodide 314.0.5 của repo khi soạn bậc này:

```
import threading            -> OK
threading.Thread(...).start() -> RuntimeError: can't start new thread
```

Nghĩa là: bài dùng thread sẽ **XANH ở cổng CI** (python3 trên runner chạy thread bình thường)
và **RỚT trên máy học viên**. Đây đúng loại khe hở mà `lessonsPython.test.ts` đã cảnh báo từ
đầu môn, chỉ khác là lần này cổng không bắt được vì cổng chạy đúng thứ bị hỏng ở nơi kia.

**Luật:** nội dung môn Lập trình không được dựa vào `threading`, `multiprocessing`, hay bất cứ
thứ gì cần luồng thật. Đồng thời (concurrency) dạy bằng mô hình xen kẽ tất định (§3). Nếu sau
này có bài cần thread, phải kiểm lại Pyodide TRƯỚC, và nếu vẫn không chạy thì cổng CI phải mọc
thêm một bước chặn — không để nó lọt qua bằng niềm tin.

## 5. Quyết định 4 — Track AI: không proxy khoá LLM của học viên

Giữ nguyên luật của hiến chương P4 §5 (không proxy API bên thứ ba có key qua server của mình:
lộ hạn mức, dễ bị lạm dụng). Hệ quả cho track AI ứng dụng:

- Phần **chấm được** là phần có thật và không cần khoá: **truy hồi** — cắt đoạn, vector hoá, đo
  tương đồng, xếp hạng. Đây cũng là phần quyết định chất lượng một hệ RAG; gọi LLM chỉ là bước
  cuối cùng và là bước dễ nhất.
- Phần **gọi LLM thật** (có khoá riêng của học viên, tự đăng ký free tier) nằm ở bước ⑦, làn C.
- Chấm điểm tương đồng tới 3 chữ số thập phân là **có chủ đích**: nó buộc học viên tính cosine
  thật chứ không đếm từ trùng cho qua. Phép toán chỉ gồm `+`, `*`, `/`, `sqrt` trên IEEE754 nên
  cùng thứ tự cộng sẽ cho cùng kết quả ở cả python3 lẫn Pyodide.

## 6. Áp vào từng unit P6

| Unit                          | Làn | Ngôn ngữ | Dạy cái gì (phần CHẤM ĐƯỢC)                                      | Làn C ở bước ⑦                    |
| ----------------------------- | --- | -------- | ---------------------------------------------------------------- | --------------------------------- |
| U1 Track AI ứng dụng          | A   | `python` | RAG: cắt đoạn có chồng lấn · cosine · xếp hạng top-k             | Gọi LLM thật bằng khoá riêng      |
| U2 Track backend cloud (Go)   | A   | `python` | Mô hình xen kẽ tất định: mất cập nhật · kênh gom về một chủ      | Cài Go, chạy `go run -race`       |
| U3 Track hệ thống (C → Rust)  | A   | `python` | Bộ kiểm quyền sở hữu: chuyển quyền · mượn · dùng sau khi chuyển  | Cài Rust, đối chiếu E0382 / E0505 |
| U4 Track phỏng vấn thuật toán | A   | `python` | Kadane O(n) + ca biên toàn số âm + phương pháp trả lời phỏng vấn | Luyện đề, nói to cách nghĩ        |

**Bốn track = bốn bài, mỗi unit một bài** — đúng khung `curriculum.ts` đã có, không đổi khung.
Track là hướng đi tự chọn, không phải chuỗi tuần tự: học viên chọn track, bài của track là cửa
vào, phần đi sâu nằm ở làn C và ở việc tự luyện.

## 7. Dự án trục KẾT THÚC Ở P5, không kéo sang P6

`dac-ta-du-an-xuyen-suot-mon-lap-trinh-2026-08-24.md` §3 chốt "Milestone P5 = HOÀN THÀNH MÔN".
Nên P6 **không có chặng dự án trục** (`PROJECT_STAGES` dừng ở `p5`), và `projectMilestone` của
P6 — "sản phẩm thứ hai theo track tự chọn" — là đề mở của riêng học viên, không phải bước có
milestone check. Ghi ra để phiên sau không đi thêm `projectStepsP6.ts` cho đủ bộ.

## 8. Điều KHÔNG làm ở P6 (ghi để phiên sau khỏi mở lại)

- Không dựng judge server (§2), không cấp container/VM cho học viên.
- Không dùng `threading`/`multiprocessing` trong nội dung (§4, đã kiểm chứng).
- Không proxy khoá LLM (§5).
- Không mô phỏng Docker/CI-CD. Chúng là thao tác trên máy thật, thuộc làn C — cùng lý do deploy
  không mô phỏng ở P5.
- Không thêm chặng dự án trục cho P6 (§7).

---
