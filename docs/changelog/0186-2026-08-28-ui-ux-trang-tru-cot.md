# fix(ui/ux): rà soát 5 trang trụ cột — hộp thoại a11y, lỗi tải bị nuốt, streak sai (2026-08-28)

**Nhánh:** `claude/ui-ux-pillar-pages-45zf17`

## Bối cảnh

Người dùng yêu cầu "kiểm tra ui/ux các trang trụ cột". Rà 5 trang:

| Trụ      | File                                        | Dòng |
| -------- | ------------------------------------------- | ---- |
| Learning | `apps/dhcb/src/pages/learning/Subjects.tsx` | 373  |
| Career   | `pages/domains/career/Career.tsx`           | 905  |
| Work     | `pages/domains/work/Work.tsx`               | 967  |
| Startup  | `pages/domains/startup/Startup.tsx`         | 928  |
| Life     | `pages/domains/life/Life.tsx`               | 957  |

`Subjects.tsx` đã được chăm kỹ (6/6 nút có `tap-44`, có biến thể `theme-light:`). **4 trang
domain thì không** — chúng mang dấu vết của một đợt sinh code hàng loạt chưa đi qua cổng chất
lượng UI/UX của dự án. Đợt này sửa cả ba nhóm vấn đề tìm được.

## 1. Lỗ hổng của chính cổng a11y — 15 hộp thoại chưa từng bị quét

`e2e/a11y.spec.ts` có quét `/su-nghiep`, `/cong-viec-cuoc-song`, `/khoi-nghiep`, `/mon-hoc`
(mở cổng từ 2026-08-27) — nhưng **chỉ ở trạng thái hộp thoại đang ĐÓNG**. 15 hộp thoại nằm sau
`{showXModal && ...}` nên axe chưa bao giờ nhìn thấy. Đo bằng grep trên 4 file:

```
role="dialog"          : 0/15
aria-modal             : 0/15
xử lý phím Escape      : 0/15
bẫy tiêu điểm/trả focus: 0/15
```

Trong khi dự án **đã có** khuôn mẫu đúng ở `components/FeedbackModal.tsx`. Ngoài ra 49/59 thẻ
`<label>` đứng cạnh ô nhập mà không `htmlFor`, không bọc, ô nhập không `id` — nhãn mồ côi, bấm
vào chữ không focus vào ô, trình đọc màn hình đọc ô là "edit, blank" (axe rule `label`).

**Đã làm:**

- **`components/Modal.tsx` mới** — gom đủ 6 hành vi WAI-ARIA APG: `role="dialog"` +
  `aria-modal` + `aria-labelledby`; Escape đóng; bẫy tiêu điểm Tab/Shift+Tab; tự focus vào
  trong khi mở và **trả tiêu điểm về nút đã mở** khi đóng; bấm ra nền để đóng; khoá cuộn nền.
  Nút X có `aria-label`. 15/15 hộp thoại chuyển sang dùng nó.
- **`components/Field.tsx` mới** — render-prop `(id) => ...` gắn nhãn với ô nhập qua `useId()`,
  hợp với cả `input`/`select`/`textarea`. 49 ô chuyển sang dùng; 10 ô vốn đã có `htmlFor` giữ
  nguyên. Thêm 4 ô còn thiếu tên truy cập: 3 thanh trượt wellbeing + select chọn dự án Startup.
- **`e2e/a11y-modals.spec.ts` mới** — cổng chặn CI quét hộp thoại **ĐANG MỞ**, 15 hộp thoại ×
  5 theme. Gom theo trang (4 test × 5 theme = 20 test thay vì 75) để không thổi phồng thời gian
  tường của mảnh E2E (luật CI mục 11.1). Kèm `e2e/helpers/domains.ts` giả dữ liệu 4 trụ.
  Test còn khẳng định tên truy cập của hộp thoại đúng bằng tiêu đề, và Escape đóng được.

**Cổng mới bắt được 2 lỗi contrast thật ngay lượt chạy đầu** (nếu chỉ sửa mã mà không thêm cổng
thì hai lỗi này vẫn nằm nguyên đó):

| Nút                 | Trước                       | Đo được | Sau                       |
| ------------------- | --------------------------- | ------- | ------------------------- |
| "Lưu Bài Toán"      | `bg-red-600` + `text-black` | 4.34:1  | `text-[#fff]` → 4.83:1    |
| "Tạo Giả Thuyết"    | `bg-amber-600` + trắng      | 3.19:1  | `bg-amber-700` → 5.02:1   |
| (3 nút emerald-600) | `bg-emerald-600` + trắng    | 3.77:1  | `bg-emerald-700` → 5.48:1 |

## 2. Lỗi TẢI dữ liệu bị nuốt im lặng — vi phạm CLAUDE.md mục 4.3

Cả 5 trang đều `listHabits().catch(() => [])`, `fetchCareerProfile().catch(() => null)`. Khối
`catch` bao ngoài vì thế **không bao giờ chạy**, và không trang nào có state `error` (0/5).

Hệ quả: mất mạng hoặc API 500 → người dùng thấy đúng màn hình rỗng _"Chưa có thói quen nào.
Nhấn Thêm thói quen để bắt đầu xây dựng chuỗi streak!"_. Người dùng tưởng dữ liệu của mình đã
mất và sẽ nhập lại — nguy hiểm nhất ở Work/Startup nơi dữ liệu là công việc thật.

(Nhánh **ghi** thì vốn đã làm đúng — có `toast.error` đầy đủ. Chỉ nhánh đọc bị bỏ.)

**Đã làm:** bỏ 14 `.catch` nuốt lỗi; thêm state `loadError`; **`components/LoadError.tsx` mới**
(`role="alert"`, nút "Thử lại", câu trấn an "Dữ liệu của bạn vẫn còn nguyên — đây chỉ là lỗi
kết nối"). Nhánh lỗi đặt **trước** nhánh rỗng trong cây render, vì đó chính là chỗ hai trạng
thái bị lẫn vào nhau.

## 3. Số liệu giả hiển thị như thật (`Subjects.tsx`)

Ô "AI Socratic Tutor" in `Tiến độ tổng thể: 78%` và một _"khuyến nghị của AI"_ nêu đích danh
hai chủ đề ("Khảo sát hàm số (Toán 12)", "Phát âm IPA Vowels (CEFR B1)") — **tất cả đều là
chuỗi cứng trong mã**, không đọc dữ liệu người dùng. Ai mở trang cũng thấy y hệt, kể cả người
vừa đăng ký xong.

**Đã làm:** bỏ hẳn con số và lời khuyên bịa (không tô lại — con số bịa hại lòng tin nặng hơn
là không có con số nào). Hai nút bên dưới là điều hướng thật nên giữ nguyên. Việc bỏ % tiến độ
khỏi vị trí nổi bật cũng hợp **luật số 1 của sản phẩm**: kết quả chẩn đoán không bao giờ là màn
hình chính.

## 4. Streak thói quen đếm sai — lỗi logic, không chỉ lỗi UI

`Life.tsx` có nút "Hoàn thành hôm nay" **không khoá lại và không hiện trạng thái đã làm**;
client tự cộng `currentStreak + 1`. Kiểm tiếp xuống server:
`packages/core-domains/lifeFoundationService.ts` cũng `current_streak + 1` **không hề kiểm tra
hôm nay đã ghi nhận chưa**. Bấm 5 lần = streak nhảy 5 ngày. Và nó **không bao giờ reset**: bỏ
lỡ cả tuần rồi quay lại vẫn cộng tiếp như chưa hề đứt. (CLAUDE.md mục 4.9 — async race /
idempotency; đúng loại lỗi không cổng nào bắt được, KHUNG audit Tầng 10.)

**Đã làm — sửa cả ba tầng:**

- **Migration `0072_habit_logs_idempotent.sql`** — dồn bản ghi trùng ngày đã lỡ tạo (giữ bản
  cũ nhất, **cộng dồn `count`** nên không mất thông tin), rồi thêm chỉ mục duy nhất
  `(habit_id, logged_at)`. Ràng buộc ở tầng CSDL nên hai tiến trình PM2 chạy song song cũng
  chỉ một cái ghi được. Lũy đẳng (`if not exists`), có ghi cách lùi.
- **`logHabit()`** — `insert ... on conflict do update` cộng dồn `count`; dùng `(xmax = 0)` để
  biết là hàng vừa CHÈN hay hàng CŨ được cập nhật. **Chỉ lần đầu trong ngày mới đụng streak**,
  và streak nối tiếp chỉ khi hôm qua cũng có check-in, ngược lại **reset về 1**. Thêm
  `for update` khoá hàng habit.
- **UI** — nút khoá lại và đổi chữ thành "Đã xong hôm nay ✓" / "Đang ghi nhận…"; sau khi ghi
  thì **đọc lại từ server** thay vì đoán ở client. Contract `Habit` thêm `lastLoggedAt`
  (`listHabits` lấy qua subquery `max(logged_at)`) để biết hôm nay đã làm chưa **kể cả sau khi
  tải lại trang**.
- **3 test canh gác mới** (`lifeFoundationService.test.ts`): bấm lần hai trong ngày không tăng
  streak (và không hề chạy truy vấn update) · nối tiếp hôm qua thì +1 · bỏ lỡ ngày thì reset
  về 1 nhưng giữ kỷ lục cũ.

## 5. Chống gửi trùng + sàn chạm 44px

- **15/15 form** trước đây không có trạng thái "đang gửi": mạng chậm, bấm "Lưu" hai lần là tạo
  hai bản ghi. Thêm state `submitting`, guard đầu handler, `finally` nhả cờ; nút submit và nút
  Huỷ đều `disabled`, nút submit đổi chữ thành "Đang lưu…".
- **Vùng chạm**: `tap-44` trước đợt này là Career 1/15, Work 0/24, Startup 0/24, Life 0/24 —
  phần lớn nút là `px-3 py-1.5` ≈ cao 28px (CLAUDE.md mục 4.7 chốt sàn 44px). Nay **72/72 nút
  của 4 trang đều có `tap-44`**.
- **Hai `<div onClick>`** (banner Real-Life Lab ở `Subjects.tsx`, thẻ chọn mục tiêu ở
  `Career.tsx`) → `<button>`; thẻ chọn thêm `aria-pressed`.

## Bằng chứng

```
Build ✅ | Type ✅ | Lint ✅ (0 cảnh báo) | Format ✅ | Test ✅
E2E a11y hộp thoại (MỚI): 20/20 xanh — 15 hộp thoại × 5 theme
E2E a11y sẵn có: 4 trang trụ cột vẫn 0 vi phạm
```

## Việc CÒN LẠI, không làm trong đợt này

- **`Career.tsx` vẫn có ô "Số năm kinh nghiệm"**, trong khi
  `docs/research/dac-ta-nang-luc-ca-nhan-theo-do-tuoi-2026-08-23.md` chốt thay nó bằng **thang
  5 bậc thành thạo** — mà trang này đã có `PROFICIENCY_BAND` rồi. Hai thước đo mâu thuẫn đang
  sống song song. Cần người dùng xác nhận là cố ý hay sót trước khi gỡ (đổi thước đo là quyết
  định sản phẩm, không phải việc dọn UI).
- **Không trang trụ nào hỗ trợ chiều B** (0/5 file dùng `direction`; toàn bộ chuỗi hardcode
  tiếng Việt). Đây là nợ đã biết, phạm vi lớn hơn một đợt dọn UI.
- **`Work.tsx`/`Life.tsx` đặt `<Layout>` ở CUỐI JSX** còn Career/Startup đặt ở đầu → thứ tự Tab
  của thanh điều hướng khác nhau giữa các trụ. Sửa được nhưng đụng thứ tự DOM của trang gộp
  `/cong-viec-cuoc-song`, nên tách ra đợt riêng để không trộn vào đợt này.
- **`FeedbackModal.tsx`** đã có `role="dialog"`/`aria-modal` nhưng vẫn **thiếu Escape và bẫy
  tiêu điểm**. Nó có bố cục riêng (nút X tuyệt đối, bo 3xl) nên chuyển sang `Modal` chung sẽ
  đổi giao diện — nằm ngoài phạm vi "trang trụ cột".
