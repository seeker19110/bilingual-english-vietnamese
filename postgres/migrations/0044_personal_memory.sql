-- 0044_personal_memory.sql — V2-06 Personal Knowledge Fabric slice 1.
--
-- MemoryRecord trong schema `personal`: bộ nhớ cá nhân hóa phân theo namespace
-- (semantic | episodic | preference | commitment | domain), có provenance,
-- sensitivity và retention policy.
--
-- Rollback vận hành ưu tiên: gỡ route/code và GIỮ bảng để không mất audit. Chỉ khi chắc chắn
-- chưa có dữ liệu cần giữ: drop theo thứ tự memory_records_audit_log → memory_records.
-- KHÔNG drop schema personal hay bảng V2-03/V2-04/V2-05.

create table if not exists personal.memory_records (
  id              uuid primary key default gen_random_uuid(),
  person_id       uuid not null references personal.persons(id) on delete cascade,
  namespace       text not null check (namespace in (
                    'semantic', 'episodic', 'preference', 'commitment', 'domain'
                  )),
  content         text not null check (char_length(content) between 1 and 2000),
  provenance      text not null check (char_length(provenance) between 1 and 200),
  sensitivity     text not null check (sensitivity in ('public', 'personal', 'sensitive', 'restricted')),
  status          text not null check (status in ('accepted', 'merged', 'expired')),
  merged_from_id  uuid references personal.memory_records(id),
  version         integer not null default 1 check (version > 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  retain_until    timestamptz,
  unique (id, person_id)
);

create index if not exists idx_memory_records_person_ns
  on personal.memory_records (person_id, namespace, created_at)
  where status <> 'expired';

create index if not exists idx_memory_records_retention
  on personal.memory_records (retain_until)
  where retain_until is not null and status <> 'expired';

create table if not exists personal.memory_records_audit_log (
  id          bigserial primary key,
  record_id   uuid not null,
  person_id   uuid not null,
  action      text not null check (action in ('INSERT', 'UPDATE', 'MERGE', 'EXPIRE', 'DELETE')),
  changes     jsonb not null default '{}'::jsonb,
  changed_by  text not null check (char_length(changed_by) between 1 and 100),
  audited_at  timestamptz not null default now()
);

create index if not exists idx_memory_audit_person_record
  on personal.memory_records_audit_log (person_id, record_id, audited_at);
