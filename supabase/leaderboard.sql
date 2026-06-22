-- ============================================================================
-- leaderboard.sql — Bảng xếp hạng toàn server
-- ----------------------------------------------------------------------------
-- Chạy 1 lần trong Supabase SQL Editor để kích hoạt tính năng.
-- An toàn khi chạy lại nhiều lần (dùng OR REPLACE / ADD COLUMN IF NOT EXISTS).
--
-- CÁCH DÙNG:
--   1. Mở Supabase Dashboard → SQL Editor → New query
--   2. Dán toàn bộ file này vào, bấm "Run"
--   3. Deploy code mới lên server là xong.
-- ============================================================================

-- ── 1. Thêm cột words_learned vào profiles ───────────────────────────────────
-- Lưu tổng số từ đã thuộc (sync từ localStorage khi user học)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS words_learned integer NOT NULL DEFAULT 0;

-- ── 2. Hàm lấy bảng xếp hạng (bypass RLS an toàn vì SECURITY DEFINER) ────────
-- Chỉ trả về: id, tên hiển thị, cấp độ, điểm, số từ đã học
-- KHÔNG trả về email hoặc bất kỳ thông tin nhạy cảm nào
--
-- Công thức điểm:
--   Chat   × 1 điểm  (nhẹ nhàng, dễ làm)
--   Nói    × 2 điểm  (khó hơn, rèn kỹ năng thực tế)
--   Viết   × 3 điểm  (khó nhất, chấm IELTS)
--
-- period: 'week' (7 ngày qua) | 'month' (30 ngày qua)
CREATE OR REPLACE FUNCTION public.get_leaderboard(period text DEFAULT 'week')
RETURNS TABLE (
  id            uuid,
  name          text,
  user_level    text,
  score         integer,
  words_learned integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since_date date;
BEGIN
  -- Tính ngày bắt đầu kỳ
  IF period = 'month' THEN
    since_date := CURRENT_DATE - INTERVAL '30 days';
  ELSE
    since_date := CURRENT_DATE - INTERVAL '7 days';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    COALESCE(p.name, 'Ẩn danh')::text AS name,
    COALESCE(p.user_level, 'beginner')::text AS user_level,
    -- Tổng điểm trong kỳ: chat×1 + nói×2 + viết×3
    COALESCE(
      SUM(
        (d.chat_count    * 1)
      + (d.speaking_count * 2)
      + (d.writing_count  * 3)
      )::integer,
      0
    ) AS score,
    -- Tổng từ đã học (lifetime, không giới hạn theo kỳ)
    COALESCE(p.words_learned, 0) AS words_learned
  FROM public.profiles p
  LEFT JOIN public.daily_usage d
    ON  d.user_id  = p.id
    AND d.day::date >= since_date
  WHERE p.onboarded = true
  GROUP BY p.id, p.name, p.user_level, p.words_learned
  -- Chỉ hiện user có ít nhất 1 hoạt động hoặc đã học từ nào đó
  HAVING
    COALESCE(SUM(d.chat_count + d.speaking_count + d.writing_count), 0) > 0
    OR COALESCE(p.words_learned, 0) > 0
  ORDER BY score DESC, words_learned DESC
  LIMIT 100;
END;
$$;

-- ── 3. Cấp quyền gọi hàm cho mọi user đăng nhập ─────────────────────────────
GRANT EXECUTE ON FUNCTION public.get_leaderboard(text) TO authenticated;
