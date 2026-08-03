-- 0026_achievement_rewards.sql — Phần thưởng cho HUY HIỆU & MỐC (src/data/achievements.ts,
-- 19 huy hiệu hiện có, xem CLAUDE.md/PROGRESS.md mục "Huy hiệu & mốc"). Quyết định 2026-08-03:
-- mỗi huy hiệu tặng thêm N ngày gói Pro/VIP, ADMIN cấu hình được TỪNG huy hiệu (bật/tắt, gói,
-- số ngày) và áp dụng NGAY LẬP TỨC cho toàn bộ người dùng (không cần deploy lại) — cùng mô
-- hình với plan_marketing_info/plan_prices, KHÔNG tạo bảng riêng cho mỗi huy hiệu.
--
-- Xác minh "đã đạt huy hiệu" khi cấp thưởng làm Ở SERVER (api/_lib/achievementRewards.ts),
-- KHÔNG tin danh sách huy hiệu client gửi lên (localStorage sửa được) — giống cách quest
-- "thi đạt cấp CEFR" đã làm (migration 0021, api/_lib/quests.ts).

create table if not exists public.achievement_rewards (
  achievement_id text primary key,
  enabled        boolean not null default true,
  reward_plan    text not null default 'pro' check (reward_plan in ('pro', 'vip')),
  reward_days    integer not null default 0 check (reward_days >= 0),
  updated_at     timestamptz not null default now()
);

-- 1 huy hiệu chỉ nhận thưởng ĐÚNG 1 LẦN/tài khoản (mốc đạt được là vĩnh viễn — không giống
-- nhiệm vụ lặp lại theo cooldown) — PK (user_id, achievement_id) tự chặn claim trùng.
create table if not exists public.achievement_claims (
  user_id        uuid not null references public.users(id) on delete cascade,
  achievement_id text not null,
  claimed_at     timestamptz not null default now(),
  primary key (user_id, achievement_id)
);
create index if not exists achievement_claims_user_idx on public.achievement_claims(user_id);

-- Giá trị mặc định ban đầu — mốc/huy hiệu càng khó càng thưởng nhiều, admin chỉnh lại tuỳ ý
-- qua /api/admin-achievement-rewards. Danh sách id PHẢI khớp src/data/achievements.ts.
insert into public.achievement_rewards (achievement_id, reward_plan, reward_days) values
  ('streak_7', 'pro', 1),
  ('streak_30', 'pro', 3),
  ('streak_100', 'pro', 7),
  ('streak_365', 'vip', 30),
  ('vocab_100', 'pro', 1),
  ('vocab_500', 'pro', 3),
  ('vocab_1000', 'pro', 7),
  ('cefr_a1', 'pro', 2),
  ('cefr_a2', 'pro', 3),
  ('cefr_b1', 'pro', 5),
  ('cefr_b2', 'pro', 7),
  ('cefr_c1', 'vip', 10),
  ('cefr_c2', 'vip', 15),
  ('speak_10', 'pro', 2),
  ('write_10', 'pro', 2),
  ('challenge_10', 'pro', 2),
  ('challenge_30', 'pro', 5),
  ('challenge_100', 'vip', 10),
  ('challenge_perfect_week', 'pro', 3)
on conflict (achievement_id) do nothing;

-- Rollback: drop table if exists public.achievement_claims;
--           drop table if exists public.achievement_rewards;
