-- 0021_quest_claims.sql — Hạ tầng NHIỆM VỤ (quest) dùng chung, generic theo `quest_key` +
-- thời gian hồi (cooldown) — không tạo riêng 1 bảng cho mỗi nhiệm vụ, để mở thêm nhiệm vụ mới
-- sau này (xem PROGRESS.md mục "Nhiệm vụ cho user") chỉ cần thêm hằng số ở api/_lib/quests.ts,
-- không cần migration mới.
--
-- Nhiệm vụ ĐẦU TIÊN dùng bảng này: "Chia sẻ công khai" — thưởng +1 ngày gói Pro, hồi sau 7
-- ngày (khớp cửa sổ trượt của gói Free, quyết định 2026-07-28). Xem api/_lib/quests.ts.
--
-- CẢNH BÁO ĐÃ GHI NHẬN (không phải bug, là giới hạn có chủ đích — xem PROGRESS.md): nhiệm vụ
-- "chia sẻ công khai" dùng Web Share API phía client, KHÔNG có cách nào server xác minh được
-- người dùng THẬT SỰ đã đăng công khai ở đâu — chỉ biết họ đã mở hộp thoại chia sẻ của hệ điều
-- hành và không bấm huỷ. Chấp nhận rủi ro này ở quy mô hiện tại (rate-limit 1 lần/7 ngày/tài
-- khoản là đủ chặn lạm dụng hàng loạt); nếu phát hiện lạm dụng thật, cân nhắc thêm device_hash
-- như referral (migration 0008) hoặc bỏ thưởng tiền thật, đổi sang thưởng phi tiền (badge...).
create table if not exists public.quest_claims (
  user_id         uuid not null references public.users(id) on delete cascade,
  quest_key       text not null,
  last_claimed_at timestamptz,
  primary key (user_id, quest_key)
);

-- Nhận thưởng nếu CHƯA từng nhận, hoặc lần nhận trước đã quá `p_cooldown_days` ngày — atomic
-- (khoá dòng bằng FOR UPDATE trước khi kiểm tra), chống 2 request song song cùng qua được.
create or replace function public.claim_quest_if_ready(
  p_user_id        uuid,
  p_quest_key      text,
  p_cooldown_days  integer
) returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_last timestamptz;
begin
  insert into public.quest_claims (user_id, quest_key, last_claimed_at)
  values (p_user_id, p_quest_key, null)
  on conflict (user_id, quest_key) do nothing;

  select last_claimed_at into v_last
  from public.quest_claims
  where user_id = p_user_id and quest_key = p_quest_key
  for update;

  if v_last is not null and v_last > now() - (p_cooldown_days || ' days')::interval then
    return false;
  end if;

  update public.quest_claims
  set last_claimed_at = now()
  where user_id = p_user_id and quest_key = p_quest_key;

  return true;
end;
$$;

-- Rollback: drop function if exists public.claim_quest_if_ready(uuid, text, integer);
--           drop table if exists public.quest_claims;
