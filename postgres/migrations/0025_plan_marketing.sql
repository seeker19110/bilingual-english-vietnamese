-- 0025_plan_marketing.sql — Nội dung mô tả gói (badge/tagline + danh sách gạch đầu dòng
-- tính năng/lợi ích) hiển thị ở trang Nâng cấp (UpgradeSection.tsx), quản lý qua /admin (tab
-- "Nội dung gói", api/admin-plan-marketing.ts). Khác plan_feature_flags (bật/tắt tính năng) —
-- đây thuần là NỘI DUNG QUẢNG CÁO/mô tả, không ảnh hưởng quyền truy cập thật.
--
-- 2 bảng: plan_marketing_info (1 dòng/gói: badge + tagline song ngữ) + plan_marketing_bullets
-- (nhiều dòng/gói, có thứ tự, admin thêm/sửa/xoá được).
--
-- Rollback: drop table if exists public.plan_marketing_bullets; drop table if exists public.plan_marketing_info;
create table if not exists public.plan_marketing_info (
  plan         text primary key check (plan in ('free', 'pro', 'vip')),
  badge        text not null default '',
  tagline_vi   text not null default '',
  tagline_en   text not null default '',
  updated_at   timestamptz not null default now()
);

create table if not exists public.plan_marketing_bullets (
  id           bigint generated always as identity primary key,
  plan         text not null check (plan in ('free', 'pro', 'vip')),
  sort_order   integer not null default 0,
  text_vi      text not null,
  text_en      text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists plan_marketing_bullets_plan_order_idx
  on public.plan_marketing_bullets (plan, sort_order);

-- Seed ĐÚNG nội dung đang hiển thị cứng trong UpgradeSection.tsx (2026-07-29) — chạy migration
-- này KHÔNG đổi gì người dùng thấy, chỉ chuyển nguồn dữ liệu từ code sang DB để admin sửa được.
insert into public.plan_marketing_info (plan, badge, tagline_vi, tagline_en) values
  ('free', '🌱', 'Học thử, không tốn phí', 'Try it out, no cost'),
  ('pro', '⭐', 'Học đều mỗi ngày', 'For daily practice'),
  ('vip', '👑', 'Luyện tập chuyên sâu', 'For serious practice')
on conflict (plan) do nothing;

insert into public.plan_marketing_bullets (plan, sort_order, text_vi, text_en) values
  ('free', 10, '4 giọng đọc (2 nữ, 2 nam)', '4 voices (2 female, 2 male)'),
  ('free', 20, '+5 lượt AI/ngày có học từ mới (Chat/Viết/Nói/Nghe), dồn tối đa 35 lượt trong 7 ngày', '+5 AI turns/day when you study new words (Chat/Writing/Speaking/Listening), rolling cap of 35 over 7 days'),
  ('free', 30, 'Đầy đủ lộ trình CEFR A1–C2', 'Full A1–C2 CEFR roadmap'),
  ('pro', 10, '8 giọng đọc chất lượng cao, phát tức thì', '8 high-quality voices, instant playback'),
  ('pro', 20, '30 lượt AI/ngày (gấp ~6 lần Free)', '30 AI turns/day (~6× Free)'),
  ('pro', 30, 'Không lo hết lượt giữa buổi học', 'Won''t run out mid-session'),
  ('vip', 10, 'Trọn bộ 14 giọng Chirp3-HD + giọng đặc biệt + 2 giọng Studio thu âm phòng thu (tiếng Anh)', 'All 14 Chirp3-HD voices + a special voice + 2 studio-quality voices (English)'),
  ('vip', 20, '300 lượt AI/ngày — thoải mái luyện không giới hạn thực tế', '300 AI turns/day — practically unlimited'),
  ('vip', 30, 'Trải nghiệm giọng đọc tốt nhất trong app', 'The best voice quality in the app');
