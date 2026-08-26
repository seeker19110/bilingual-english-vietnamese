# V2-04 Consent + Personal Policy — slice 1: persistence + API (2026-08-16)

Việc kế tiếp của Wave B sau V2-03. Slice 1 chỉ làm **nền tảng lưu trữ + API** cho ConsentGrant và
PersonalPolicy, cùng khuôn với slice 1 của V2-03:

- **Migration `postgres/migrations/0042_consent_and_policy.sql`** — 2 bảng trong schema `personal`
  (đã tạo ở 0041): `personal.consent_grants` (scope/purpose/version/status/expires_at) và
  `personal.personal_policies` (subject/action/resource_scope/authority/review_at). Cả hai
  **APPEND-ONLY**: thu hồi chỉ set `status`/`revoked_at`, cấp lại/sửa là INSERT dòng MỚI — không
  `delete`, không update giá trị nghiệp vụ (yêu cầu "complete audit trail" của V2-04).
  Hai **partial UNIQUE index** đảm bảo tối đa 1 bản đang hiệu lực cho mỗi
  (person, scope, purpose) và (person, subject, action, resource_scope) — khác 0041 (index thường)
  vì hai bản "active" song song sẽ khiến câu hỏi "còn quyền không / mức nào" có hai đáp án.
  Thêm `check` constraint `authority='AUTOMATE' ⇒ review_at is not null` (mục 7
  `02-SYSTEM-ARCHITECTURE.md`).
  **Lưu ý trung thực: SQL này CHƯA chạy thật trên Postgres nào** (sandbox không có DB) — mới soát
  bằng mắt, đối chiếu `schema.sql` + migration 0041. Sẽ áp tự động ở lượt deploy sau khi merge.
- **`packages/core-personal/consentService.ts`** — `grantConsent` (đã có bản active thì revoke bản
  cũ + insert `version + 1` trong cùng transaction, `select ... for update` chống race),
  `listConsents`, `revokeConsent` (404 nếu không phải chủ, **409 nếu đã thu hồi/hết hạn** — cùng
  quy ước với `deleteFact`), `isConsentActive` (so `expires_at > now()` NGAY trong SQL nên grant
  quá hạn vẫn trả `false` dù DB còn ghi `active` — không cần job dọn ở slice này).
- **`packages/core-personal/policyService.ts`** — `setPolicy` (revoke bản cũ + insert bản mới),
  `listPolicies`, `revokePolicy`, và `resolveAuthority(pool, personId, subject, action,
resourceScope)` trả `AuthorityLevel | null`. **`null` = chưa có policy**, cố ý KHÔNG tự bịa mức
  mặc định (mỗi loại tool có mức đáy khác nhau — đó là quyết định của tầng gọi). Đây chính là điểm
  nối cho Context Builder (V2-07) / tool execution (V2-08).
- **API** (mount trong `server.ts`, rate limit 30/phút, `personId` luôn suy từ token qua
  `getOrCreatePerson`, ownership kiểm ngay trong SQL): `GET/POST/DELETE?id= /api/consents` và
  `GET/POST/DELETE?id= /api/personal-policies`. Ràng buộc "AUTOMATE phải có `reviewAt`" bị Zod
  chặn ở API (400) trước khi chạm DB; contract `.refine()` + `check` constraint là hai lưới sau.
- Test: 24 test service + 29 test API mới (toàn bộ suite xanh — số liệu ở phần báo cáo PR).

**GIỚI HẠN PHẢI GHI RÕ (chưa đạt gate roadmap):** gate của V2-04 là _"revoke có hiệu lực ở Context
Builder và tool execution"_ — **CHƯA verify được**, vì Context Builder (V2-07) và tool execution
(V2-08) chưa tồn tại. Slice này mới dựng nền persistence + API + hai hàm điểm nối
(`isConsentActive`, `resolveAuthority`); **chưa có chỗ nào trong hệ thống thực sự GỌI chúng trước
khi đọc dữ liệu/chạy tool**. Việc còn mở: wiring vào Context Builder/tool execution, UI quản lý
consent/policy, audit log ghi lại từng lượt kiểm quyền, và job xử lý `status='expired'`/`review_at`
tới hạn.
