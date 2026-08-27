-- Migration 0070: Chế độ ôn thi có hạn chót ("Đếm ngược kỳ thi").
--
-- Đặc tả: docs/research/dac-ta-che-do-on-thi-2026-08-26.md (mục 6).
--
-- KHÔNG có bảng lưu lịch từng ngày — cố ý. Lịch được TÍNH LẠI mỗi lần mở, từ trạng thái học
-- thật (learning_progress + SRS), bằng hàm thuần `packages/core-examplan/examPlan.ts`. Lưu lịch
-- xuống DB là tự chuốc bài toán đồng bộ khi người học đi lệch kế hoạch — mà họ luôn đi lệch.

create table if not exists public.exam_plans (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  -- Đợt 1 chỉ một giá trị: 'vao10-english'. Cột text (không enum) để thêm kỳ thi sau không cần
  -- migration đổi kiểu.
  exam_kind       text not null,
  exam_date       date not null,
  -- Mục tiêu do người học TỰ GHI ('7 điểm'). KHÔNG dùng để chấm, không đối chiếu với bất cứ gì —
  -- chỉ hiện lại cho họ nhớ mình đang nhắm gì.
  target_label    text check (target_label is null or char_length(target_label) <= 60),
  scope_items     integer not null default 0 check (scope_items >= 0),
  daily_cap_items integer not null default 10 check (daily_cap_items between 0 and 200),
  -- Thứ trong tuần xin nghỉ: 0 = chủ nhật … 6 = thứ bảy.
  rest_days       smallint[] not null default '{}',
  status          text not null default 'active' check (status in ('active', 'expired', 'archived')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists exam_plans_user_idx on public.exam_plans(user_id, created_at desc);

-- MỘT kế hoạch đang chạy mỗi người (luật sản phẩm 4.4): người ôm ba kỳ thi cùng lúc thì bỏ cả
-- ba. Ràng buộc ở DB chứ không chỉ ở code — hai tab mở song song vẫn không lách được.
create unique index if not exists exam_plans_one_active
  on public.exam_plans(user_id) where status = 'active';
