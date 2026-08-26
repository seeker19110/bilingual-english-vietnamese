# V2-05 Life Graph foundation — slice 1 (2026-08-17)

Đã triển khai nền persistence/service/API, chưa UI và chưa chạy migration trên production:

- Migration `0043_life_graph.sql`: 9 node type + 7 relation đúng contract hiện có; composite FK
  `(node_id, person_id)` chặn orphan/cross-user edge ngay tại DB; soft archive, optimistic
  `version`, audit log append-only và trigger buộc `LifeGoal` chỉ trỏ node `Goal`.
- `lifeGraphService.ts`: create/list/get/update/archive node, create/list/archive edge, integrity
  validator và lifecycle `active → achieved|abandoned|blocked`, `blocked → active|abandoned`;
  trạng thái terminal không được mở lại âm thầm.
- API `/api/life-graph` + `/api/life-goals`: bắt buộc auth/rate limit, `personId` chỉ suy từ token,
  input Zod strict. Không có UI trong slice này.
- Gate backfill chọn đúng goal onboarding hiện hành từ `public.profiles.goal + daily_minutes`, chỉ
  khi `onboarded=true`. Life Graph giữ projection + định danh nguồn, không copy `daily_minutes`;
  Learning vẫn là source of truth. Adapter chạy lại không tạo projection trùng và đọc ngược luôn
  lấy payload Learning thật, đồng thời chặn nếu label projection đã lệch nghĩa.

Giới hạn: migration mới chỉ được kiểm qua code/tests trong CI/local, không chạy production. V2-04
enforcement gate vẫn deferred tới Context Builder/tool execution; slice V2-05 này không tuyên bố
V2-04 hoàn tất.

**CI đỏ do coverage nhánh (2026-08-17, PR #578, tự sửa trong cùng PR):** code slice 1 thiếu test
ca biên khiến branch coverage toàn repo còn 89.77% (< ngưỡng CI 90%). Đã bổ sung ~40 test case cho
`lifeGraphService.ts` + `api/life-graph.ts` (not-found/conflict/version-mismatch,
`includeArchived`, các `kind` GET/DELETE còn thiếu, method 405, lỗi non-AppError) — nâng coverage
2 file lên 100% statements/lines/functions, ≥ 90% nhánh. Toàn suite 3591 test xanh sau đó.
