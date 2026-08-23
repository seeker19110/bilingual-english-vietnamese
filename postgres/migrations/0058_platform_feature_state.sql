-- 0058_platform_feature_state.sql — Kho trạng thái tính năng THEO USER, dùng chung.
--
-- Vá vi phạm 12-factor "stateless process" (đề xuất N3, 2026-08-23): hàng loạt handler
-- (memory-palace, action-canvas, metacognitive-reflection, neural-curriculum,
-- avatar-embodiment…) đang giữ state trong Map in-memory cấp module — mất khi restart,
-- và VỠ trong PM2 cluster (mỗi instance một bản copy). Bảng này là backing service chung:
-- mỗi (user, tính năng) một dòng JSONB, handler stateless hoàn toàn.
--
-- Rollback: DROP TABLE platform.feature_state;

create schema if not exists platform;

create table if not exists platform.feature_state (
  user_id    uuid not null references public.users(id) on delete cascade,
  feature    text not null,
  state      jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, feature)
);

comment on table platform.feature_state is
  'Trạng thái tính năng theo user (JSONB) — thay Map in-memory, xem packages/core-db/featureState.ts';
