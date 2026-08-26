-- Migration 0070: "Người thân theo dõi" — liên kết một chiều learner → watcher + báo cáo tuần.
--
-- Đặc tả: docs/research/dac-ta-nguoi-dong-hanh-2026-08-26.md
--
-- KHÁC public.friendships (migration 0053): quan hệ bạn bè ĐỐI XỨNG hai chiều, ai gỡ cũng được,
-- và không kèm quyền xem dữ liệu học tập. Quan hệ ở đây BẤT ĐỐI XỨNG:
--   * chỉ NGƯỜI HỌC (learner) cấp quyền — người lớn không "thêm con" được;
--   * chỉ NGƯỜI THEO DÕI (watcher) nhận báo cáo, và chỉ nhận bản tổng hợp tuần;
--   * người học gỡ bất cứ lúc nào, không cần lý do.
--
-- KHÁC profiles.friend_code: mã mời ở đây DÙNG MỘT LẦN và CÓ HẠN (24 giờ). Quyền xem tiến độ
-- học nặng hơn quyền kết bạn nên không dùng mã vĩnh viễn — mã lộ ra ngoài là lộ vĩnh viễn.

create table if not exists public.companion_links (
  id             uuid primary key default gen_random_uuid(),
  learner_id     uuid not null references public.users(id) on delete cascade,
  watcher_id     uuid not null references public.users(id) on delete cascade,
  -- Chỉ để hiển thị trong giao diện ("Bố/mẹ", "Thầy/cô"), KHÔNG dùng để phân quyền:
  -- mọi watcher đều thấy đúng một bộ trường như nhau.
  relation       text not null default 'family'
                 check (relation in ('family', 'teacher', 'friend')),
  -- Mốc chống gửi trùng báo cáo tuần (xem weeklyReportService.ts#claimDueLinks).
  last_report_at timestamptz,
  created_at     timestamptz not null default now(),
  constraint companion_links_not_self check (learner_id <> watcher_id),
  constraint companion_links_unique unique (learner_id, watcher_id)
);
create index if not exists companion_links_learner_idx on public.companion_links(learner_id);
create index if not exists companion_links_watcher_idx on public.companion_links(watcher_id);

-- Mã mời dùng một lần. Dòng được giữ lại sau khi dùng (used_by/used_at) để người học tra được
-- "mã này ai đã dùng, lúc nào" — nhưng mã đã dùng thì không nhận thêm ai nữa.
create table if not exists public.companion_invites (
  code       text primary key,
  learner_id uuid not null references public.users(id) on delete cascade,
  expires_at timestamptz not null,
  used_by    uuid references public.users(id) on delete set null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists companion_invites_learner_idx
  on public.companion_invites(learner_id, created_at desc);
