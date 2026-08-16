-- 0042_consent_and_policy.sql — Consent + Personal Policy (V2-04 slice 1,
-- docs/architecture-v2/21-ROADMAP.md mục "V2-04" + 02-SYSTEM-ARCHITECTURE.md mục 7).
--
-- Nằm trong schema `personal` (tạo ở 0041) vì đây vẫn là tầng PLATFORM "Personal OS Core" —
-- quyền của MỘT NGƯỜI, không thuộc môn học nào (docs/adr/0003-bien-gioi-domain-v2.md).
--
-- 2 bảng:
--   personal.consent_grants    — người dùng ĐỒNG Ý cho hệ thống dùng (scope, purpose) tới khi nào.
--   personal.personal_policies — mức thẩm quyền hệ thống được phép hành động thay người dùng.
--
-- ĐẶC ĐIỂM QUAN TRỌNG (giống 0041): APPEND-ONLY về mặt lịch sử.
--   * Thu hồi consent = set `status='revoked'` + `revoked_at`, KHÔNG delete dòng.
--   * Cấp lại consent sau khi thu hồi = INSERT dòng MỚI với `version = version cũ + 1`, KHÔNG
--     update đè bản cũ. Nhờ vậy luôn trả lời được "ngày X người này đã đồng ý điều gì" — yêu cầu
--     "complete audit trail" của V2-04.
--   * Sửa policy cũng vậy: revoke bản cũ (set `revoked_at`) rồi insert bản mới.
-- Cột `status`/`revoked_at` là các cột DUY NHẤT được UPDATE; giá trị nghiệp vụ không bao giờ đổi.
--
-- Vì sao UNIQUE có điều kiện (partial unique) thay vì index thường như 0041: ở 0041 một fact có
-- thể tồn tại nhiều dòng `is_current` do đường sửa/khai báo song song đều đã khoá row trước; còn
-- ở đây consent là quyền — hai dòng "active" cùng (person, scope, purpose) sẽ khiến câu hỏi
-- "người này còn đồng ý không / version mấy" có hai đáp án. DB phải chặn cứng, không dựa vào
-- tầng ứng dụng.
--
-- Rollback: drop table if exists personal.personal_policies;
--           drop table if exists personal.consent_grants;
--           (mất toàn bộ consent + policy cá nhân và lịch sử của chúng)

-- ── consent_grants: người dùng đồng ý cho dùng (scope, purpose) ──────────────
create table if not exists personal.consent_grants (
  id         uuid primary key default gen_random_uuid(),
  person_id  uuid not null references personal.persons(id) on delete cascade,
  -- Dạng "resource.action" (vd 'personal_fact.read') — khớp contract
  -- packages/core-contracts/consentGrant.ts.
  scope      text not null,
  -- TẠI SAO cần quyền này. Cùng 1 scope có thể được cấp cho nhiều purpose, revoke độc lập nhau.
  purpose    text not null,
  -- Tăng dần theo từng lần cấp lại cho cùng (person, scope, purpose) — bắt đầu từ 1.
  version    integer not null default 1 check (version > 0),
  status     text not null default 'active'
             check (status in ('active', 'revoked', 'expired')),
  granted_at timestamptz not null default now(),
  -- null = không hết hạn. Hết hạn được kiểm TRỰC TIẾP lúc query (`expires_at > now()`), không
  -- cần job nền quét đổi status — status='expired' chỉ dành cho việc dọn dẹp về sau.
  expires_at timestamptz,
  revoked_at timestamptz
);

-- Tối đa MỘT consent đang hiệu lực cho mỗi (person, scope, purpose) — xem ghi chú đầu file.
create unique index if not exists idx_consent_grants_active
  on personal.consent_grants (person_id, scope, purpose)
  where status = 'active';

-- Duyệt lịch sử/audit theo person.
create index if not exists idx_consent_grants_person
  on personal.consent_grants (person_id, granted_at);

-- ── personal_policies: thẩm quyền hành động hệ thống được phép ───────────────
create table if not exists personal.personal_policies (
  id             uuid primary key default gen_random_uuid(),
  person_id      uuid not null references personal.persons(id) on delete cascade,
  subject        text not null,
  action         text not null,
  resource_scope text not null,
  authority      text not null
                 check (authority in ('READ', 'SUGGEST', 'DRAFT', 'WRITE_INTERNAL',
                                      'EXECUTE_WITH_CONFIRMATION', 'AUTOMATE', 'DENY')),
  purpose        text not null,
  created_at     timestamptz not null default now(),
  -- Bắt buộc có khi authority='AUTOMATE' (02-SYSTEM-ARCHITECTURE.md mục 7: quyền tự động phải có
  -- expiry/review). Ràng buộc đặt ngay ở DB để không cách nào ghi được AUTOMATE vĩnh viễn.
  review_at      timestamptz,
  -- null = đang hiệu lực. Thu hồi/thay thế = set thời điểm, KHÔNG delete dòng.
  revoked_at     timestamptz,
  constraint personal_policies_automate_needs_review
    check (authority <> 'AUTOMATE' or review_at is not null)
);

-- Tối đa MỘT policy đang hiệu lực cho mỗi (person, subject, action, resource_scope) — nếu có hai,
-- `resolveAuthority` sẽ không biết chọn mức thẩm quyền nào.
create unique index if not exists idx_personal_policies_active
  on personal.personal_policies (person_id, subject, action, resource_scope)
  where revoked_at is null;

create index if not exists idx_personal_policies_person
  on personal.personal_policies (person_id, created_at);
