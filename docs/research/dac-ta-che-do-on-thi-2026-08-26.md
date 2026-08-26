# Đặc tả: Chế độ ôn thi có hạn chót ("Đếm ngược kỳ thi") — 2026-08-26

> Trạng thái: **ĐẶC TẢ, CHƯA TRIỂN KHAI**. Research-first theo KHUNG 3 · CLAUDE.md mục 0.
> Ý tưởng #1 trong đợt đề xuất tích hợp 2026-08-26; người dùng chọn "1-2 làm trước".
> Điểm chạm dự kiến: `postgres/migrations/0069_exam_plan.sql` · `packages/core-examplan/` ·
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

`postgres/migrations/0069_exam_plan.sql`:

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
| E2  | Migration `0069` + `apps/server/src/api/learning/exam-plan.ts` (GET/POST/DELETE) + contract Zod | Boot check + test handler                           |
| E3  | UI `ExamPlan.tsx` — đếm ngược + "3 việc hôm nay" + luồng tạo kế hoạch                           | a11y AA/AAA 0 vi phạm, mobile-first                 |
| E4  | Nối FSRS `requestRetention` theo `phase` + cờ tắt được                                          | `eval` SRS: số lượt ôn không tăng vọt ở phase build |

Mỗi PR một cổng, dừng xin duyệt (CLAUDE.md mục 3).

## 9. Việc để lại

- Kỳ thi thứ hai (Toán vào 10) — chỉ mở sau khi đợt 1 có người dùng thật.
- Nhắc học theo kế hoạch (tái dùng `emailReminders.ts` + `push.ts`): thông điệp đổi thành
  "còn N ngày, hôm nay X việc" — làm chung với ý tưởng #2 để không sửa `reminderContent.ts` hai lần.
