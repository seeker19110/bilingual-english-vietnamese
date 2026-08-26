# V2-03 Personal World Model — slice 1: persistence + API (2026-08-16, PR #569 đã MERGE)

Wave B của `docs/architecture-v2/21-ROADMAP.md` đã mở. Slice 1 chỉ làm **nền tảng lưu trữ + API**
(chưa có UI, chưa có Life Graph V2-05, chưa có Consent V2-04):

- **Schema Postgres MỚI `personal`** (migration `postgres/migrations/0041_personal_world_model.sql`)
  — tách khỏi `public.*`/`english.*` đúng ADR-0003 (Personal OS Core là tầng PLATFORM, không phụ
  thuộc môn học). 2 bảng: `personal.persons` (1-1 với `public.users`) và
  `personal.personal_facts` (provenance/confidence/sensitivity/expiry + cột `is_current`).
  **Lưu ý trung thực: SQL này CHƯA chạy thật trên Postgres nào** (sandbox không có DB) — mới chỉ
  soát bằng mắt, đối chiếu cú pháp với `schema.sql` + các migration đã chạy được. Nó sẽ được áp
  tự động ở lượt deploy đầu tiên sau khi merge (`scripts/deploy.sh` → `npm run migrate:pg`).
- **Service `packages/core-personal/personService.ts`** — `getOrCreatePerson`, `declareFact`,
  `listFacts`, `correctFact`, `deleteFact`, `exportPersonData`. Đây là nơi ENFORCE 3 rule kiến trúc:
  1. **GATE V2-03** — fact `derived` KHÔNG được ghi đè fact đang hiệu lực có origin `user_declared`
     (ném `ConflictError` 409, không âm thầm supersede). Áp ở CẢ `declareFact` lẫn `correctFact`.
  2. **Supersede là APPEND** — sửa = insert bản mới `supersedes = id bản cũ`, bản cũ chỉ hạ cờ
     `is_current = false`. Xoá cũng là xoá mềm. Không có câu `delete` nào → giữ audit trail.
  3. **Optimistic concurrency** — mọi lượt sửa/xoá đọc bản ghi bằng `select ... for update` trong
     transaction; bản ghi đã hết `is_current` ⇒ 409.
- **API**: `GET /api/persons`; `GET/POST/PATCH?id=/DELETE?id= /api/personal-facts` (mount trong
  `server.ts`). `personId` LUÔN suy ra từ token, không bao giờ nhận từ client; `origin` qua API
  công khai chỉ cho phép `user_declared`/`observed` (`derived`/`imported` dành cho engine nội bộ
  gọi thẳng service, tránh client giả mạo để lách gate).
- Test: 16 test service + 24 test API (toàn bộ suite 3.459 test xanh).

Việc còn mở của V2-03 (slice sau): UI xem/sửa/xoá fact, engine sinh fact `observed`/`derived` từ
hội thoại, chính sách hết hạn (`expiresAt`) tự dọn, gắn Personal World Model vào Context Builder.
