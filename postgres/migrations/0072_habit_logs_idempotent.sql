-- postgres/migrations/0072_habit_logs_idempotent.sql
-- Chặn "check-in thói quen" bị tính nhiều lần trong CÙNG MỘT NGÀY.
--
-- Lỗi đang sửa: logHabit() cũ luôn `current_streak + 1` mỗi lần gọi, không hề nhìn
-- xem hôm nay đã ghi nhận chưa. Nút "Hoàn thành hôm nay" ở trang Cuộc sống cũng không
-- khoá lại, nên bấm 5 lần là chuỗi streak nhảy 5 ngày — con số động viên người dùng
-- trở thành con số bịa. (CLAUDE.md mục 4.9: async race / idempotency.)
--
-- Khoá duy nhất (habit_id, logged_at) biến "một ngày một bản ghi" thành ràng buộc của
-- CSDL, không chỉ là quy ước trong mã: kể cả hai tiến trình PM2 xử lý hai request
-- song song cũng chỉ một cái ghi được.

-- Bước 1 — dồn các bản ghi trùng ngày đã lỡ tạo ra thành MỘT bản ghi.
-- Giữ bản ghi cũ nhất (created_at nhỏ nhất, hoà thì theo id) và CỘNG DỒN `count` của
-- các bản ghi cùng ngày vào nó, nên không mất thông tin "đã làm mấy lượt trong ngày".
with ranked as (
  select
    id,
    habit_id,
    logged_at,
    count,
    first_value(id) over (
      partition by habit_id, logged_at order by created_at, id
    ) as keep_id
  from worklife.habit_logs
),
totals as (
  select keep_id, sum(count) as total_count
  from ranked
  group by keep_id
  having count(*) > 1
)
update worklife.habit_logs l
set count = t.total_count
from totals t
where l.id = t.keep_id;

delete from worklife.habit_logs l
using (
  select
    id,
    first_value(id) over (
      partition by habit_id, logged_at order by created_at, id
    ) as keep_id
  from worklife.habit_logs
) r
where l.id = r.id
  and r.id <> r.keep_id;

-- Bước 2 — ràng buộc. `if not exists` để chạy lại lần hai không lỗi (lũy đẳng).
create unique index if not exists uq_worklife_habit_logs_habit_day
  on worklife.habit_logs (habit_id, logged_at);

-- LÙI (chạy tay khi cần): drop index if exists worklife.uq_worklife_habit_logs_habit_day;
-- Lưu ý: bước 1 KHÔNG lùi được (các bản ghi trùng đã bị dồn). Đó là chủ ý — chúng vốn
-- là dữ liệu rác sinh ra từ lỗi đếm streak.
