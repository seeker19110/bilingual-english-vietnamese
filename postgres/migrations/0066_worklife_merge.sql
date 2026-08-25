-- postgres/migrations/0066_worklife_merge.sql
-- Gộp trụ WORK và LIFE thành MỘT trụ "Công việc & Đời sống" (quyết định người dùng 2026-08-25).
--
-- Cách gộp: ALTER TABLE ... SET SCHEMA — chuyển CHỖ ĐỨNG của bảng, KHÔNG sao chép dữ liệu.
-- Vì vậy thao tác này nhanh (chỉ sửa catalog), giữ nguyên toàn bộ hàng, khoá ngoại, chỉ mục
-- và ràng buộc; và lùi được bằng đúng một lệnh SET SCHEMA ngược lại (xem cuối file).
--
-- KHÔNG có bảng nào trùng tên giữa hai schema (work: projects/tasks/meetings/documents —
-- life: plans/habits/habit_logs/wellbeing_checks/growth_milestones) nên không có xung đột
-- tên khi dồn về một chỗ. Đã đối chiếu 0048_work_domain.sql và 0050_life_foundation.sql.

create schema if not exists worklife;

-- Lũy đẳng: chỉ chuyển khi bảng còn nằm ở schema cũ. Chạy lại lần hai không lỗi.
do $$
declare
  t record;
begin
  for t in
    select table_schema, table_name
    from information_schema.tables
    where table_schema in ('work', 'life')
      and table_type = 'BASE TABLE'
  loop
    execute format('alter table %I.%I set schema worklife', t.table_schema, t.table_name);
  end loop;
end
$$;

-- Chỉ xoá schema cũ khi nó đã RỖNG — `drop schema ... restrict` tự báo lỗi nếu còn sót đối
-- tượng nào (view, hàm, bảng mới thêm sau), nên không có đường xoá nhầm dữ liệu.
drop schema if exists work restrict;
drop schema if exists life restrict;

-- LÙI (rollback thủ công, chạy tay khi cần):
--   create schema if not exists work;
--   create schema if not exists life;
--   alter table worklife.projects set schema work;
--   alter table worklife.tasks set schema work;
--   alter table worklife.meetings set schema work;
--   alter table worklife.documents set schema work;
--   alter table worklife.plans set schema life;
--   alter table worklife.habits set schema life;
--   alter table worklife.habit_logs set schema life;
--   alter table worklife.wellbeing_checks set schema life;
--   alter table worklife.growth_milestones set schema life;
--   drop schema if exists worklife restrict;
