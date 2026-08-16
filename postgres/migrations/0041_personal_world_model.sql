-- 0041_personal_world_model.sql — Personal World Model (V2-03 slice 1,
-- docs/architecture-v2/21-ROADMAP.md mục "V2-03" + 02-SYSTEM-ARCHITECTURE.md mục 4).
--
-- Vì sao SCHEMA RIÊNG `personal` (không nhét vào `public`/`english`): theo
-- docs/adr/0003-bien-gioi-domain-v2.md, "Personal OS Core" là tầng PLATFORM dùng chung cho mọi
-- môn học — không được phụ thuộc vào schema của môn tiếng Anh. Tách schema để biên giới domain
-- nhìn thấy được ngay ở tầng DB (giống cách `english.*` đã tách khỏi `public.*` ở 0030).
--
-- 2 bảng:
--   personal.persons        — danh tính cấp Personal OS, 1-1 với public.users (auth).
--   personal.personal_facts — kho fact có provenance/confidence/sensitivity/expiry.
--
-- ĐẶC ĐIỂM QUAN TRỌNG: personal_facts là APPEND-ONLY về mặt lịch sử. Sửa 1 fact = INSERT bản ghi
-- mới trỏ `supersedes` về bản cũ, đồng thời set bản cũ `is_current = false`. Xoá cũng chỉ set
-- `is_current = false` — KHÔNG bao giờ `delete` dòng, để giữ audit trail "trước đây từng tin gì"
-- (mục 18 02-SYSTEM-ARCHITECTURE.md). Cột `is_current` là cột duy nhất được UPDATE.
--
-- Rollback: drop table if exists personal.personal_facts; drop table if exists personal.persons;
--           drop schema if exists personal;   (mất toàn bộ fact cá nhân + lịch sử của chúng)

create schema if not exists personal;

-- ── persons: 1 user auth ⇄ đúng 1 Person ────────────────────────────────────
create table if not exists personal.persons (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references public.users(id) on delete cascade,
  display_name text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── personal_facts: fact cá nhân có nguồn gốc + độ tin cậy + độ nhạy cảm ─────
create table if not exists personal.personal_facts (
  id                uuid primary key default gen_random_uuid(),
  person_id         uuid not null references personal.persons(id) on delete cascade,
  namespace         text not null,
  key               text not null,
  value             jsonb not null,
  origin            text not null
                    check (origin in ('user_declared', 'observed', 'derived', 'imported')),
  confidence        numeric(3, 2) not null check (confidence >= 0 and confidence <= 1),
  source            jsonb not null,
  sensitivity       text not null
                    check (sensitivity in ('public', 'personal', 'sensitive', 'restricted')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  last_confirmed_at timestamptz,
  expires_at        timestamptz,
  -- Trỏ về bản ghi bị thay thế (null = bản đầu tiên của (person_id, namespace, key)).
  supersedes        uuid references personal.personal_facts(id),
  -- true = bản đang có hiệu lực. Đặt false khi bị supersede hoặc bị "xoá" (xoá mềm).
  is_current        boolean not null default true
);

-- Tra cứu fact đang hiệu lực theo (person, namespace, key) — đường đi nóng của mọi lượt đọc
-- và của khoá row `select ... for update` khi supersede.
create index if not exists idx_personal_facts_active
  on personal.personal_facts (person_id, namespace, key)
  where is_current;

-- Duyệt lịch sử/export theo person.
create index if not exists idx_personal_facts_person
  on personal.personal_facts (person_id, created_at);
