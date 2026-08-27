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
