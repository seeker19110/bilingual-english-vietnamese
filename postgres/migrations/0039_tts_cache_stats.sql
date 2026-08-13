-- 0039_tts_cache_stats.sql — Số liệu vận hành cho cache TTS (trang admin "Cache TTS & R2").
--
-- Vì sao cần: trước đây KHÔNG có chỗ nào ghi lại /api/tts đã phục vụ từ cache hay phải gọi
-- API sinh mới, nên không trả lời được "cache hit bao nhiêu %" hay "còn thiếu bao nhiêu".
--
-- Rollback:
--   drop table if exists public.tts_cache_audit;
--   drop table if exists public.tts_cache_stats;
-- An toàn: cả 2 bảng chỉ chứa số liệu thống kê, xoá đi không mất audio hay dữ liệu học tập.

-- ── 1. Đếm hit/miss theo NGÀY ───────────────────────────────────────────────────────────
-- Gộp sẵn theo (ngày, lang, voice) thay vì ghi từng sự kiện: một dòng upsert rẻ hơn nhiều so
-- với bảng log phình vô hạn, và trang admin chỉ cần mức tổng hợp này.
-- `day` là NGÀY GIỜ VIỆT NAM (vnDateStr) — phải khớp cách daily_usage đang tính ngày, nếu
-- không biểu đồ 2 chỗ sẽ lệch nhau đúng 1 ngày ở khoảng nửa đêm.
create table if not exists public.tts_cache_stats (
  day    date not null,
  lang   text not null,
  voice  text not null,
  -- Phục vụ được từ cache, KHÔNG gọi API TTS → tiền tiết kiệm được.
  hits   bigint not null default 0,
  -- Phải gọi API TTS sinh mới → tốn tiền.
  misses bigint not null default 0,
  primary key (day, lang, voice)
);
create index if not exists tts_cache_stats_day_idx on public.tts_cache_stats(day);

-- ── 2. Kết quả quét đối chiếu DB ↔ R2 ───────────────────────────────────────────────────
-- Bucket có hàng chục nghìn file nên KHÔNG quét đồng bộ trong request admin (sẽ timeout).
-- Admin bấm "Quét lại" → chạy nền → ghi kết quả vào đây; trang hiển thị lần quét gần nhất.
create table if not exists public.tts_cache_audit (
  id          uuid primary key default gen_random_uuid(),
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  -- running | done | error
  status      text not null default 'running',
  error       text,
  -- { db_total, db_on_r2, db_off_r2, r2_total, missing_on_r2, orphan_on_r2, samples: {...} }
  result      jsonb
);
create index if not exists tts_cache_audit_started_idx on public.tts_cache_audit(started_at desc);
