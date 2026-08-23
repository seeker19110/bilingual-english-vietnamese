-- 0062_intake_outcome.sql — ĐO xem gợi ý của luồng người mới có TRÚNG không.
-- Đặc tả: docs/research/luong-nguoi-moi-ho-so-nang-luc-an-2026-08-23.md mục 10.
--
-- Hai câu hỏi khác nhau, cần hai tín hiệu khác nhau — trộn lẫn là mất cả hai:
--   1. SUY LUẬN có đúng không? → người dùng nhận việc CHÍNH, hay đổi sang lựa chọn khác, hay bỏ.
--   2. Gợi ý có TÁC DỤNG THẬT không? → họ có làm xong việc đó trong 7 ngày không.
-- Câu 1 đo chất lượng thuật toán chọn việc. Câu 2 đo giá trị thật của cả luồng. Một gợi ý được
-- nhận ngay nhưng không ai làm xong thì vẫn là gợi ý tồi.
--
-- Vì sao lưu `suggested_task_id` thay vì tính lại: `buildIntakeResult()` là hàm thuần nên hôm nay
-- tính lại vẫn ra đúng — nhưng NGÀY MAI sửa thuật toán là toàn bộ số liệu lịch sử đổi theo, và ta
-- mất khả năng so sánh trước/sau khi cải tiến. Ghi lại thứ ĐÃ gợi ý là cách duy nhất giữ số liệu
-- trung thực.
--
-- Idempotent. Rollback:
--   alter table personal.intake drop column if exists suggested_task_id,
--     drop column if exists task_chosen_at, drop column if exists task_done_at;

alter table personal.intake add column if not exists suggested_task_id text;
alter table personal.intake add column if not exists task_chosen_at timestamptz;
alter table personal.intake add column if not exists task_done_at timestamptz;

-- Truy vấn thống kê luôn lọc theo mốc thời gian trả lời (xem theo tuần/tháng).
create index if not exists intake_completed_idx on personal.intake(completed_at)
  where completed_at is not null;
