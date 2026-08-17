# V2-05 Life Graph foundation — slice 1

## Quyết định ownership

Learning goal được chọn cho gate là mục tiêu onboarding đang chạy thật:
`public.profiles.goal + daily_minutes`, với điều kiện `onboarded=true`. Bảng
`english.user_profile` chưa được dùng vì hiện chỉ là snapshot backfill và không phải nguồn code
production đang đọc/ghi.

Life Graph là projection/read view, không giành ownership của Learning. Bảng
`personal.life_goal_sources` chỉ lưu `(domain, type, source_id)`; không lưu bản sao
`daily_minutes`. Adapter đọc payload từ Learning mỗi lần dựng read view. Nếu label node khác label
nguồn, adapter trả conflict thay vì âm thầm đổi nghĩa.

## Integrity và concurrency

- Composite foreign key của edge tới `(node_id, person_id)` chặn cả orphan lẫn cross-user edge.
- Mọi update/archive khoá row và yêu cầu `expectedVersion`; stale writer nhận 409.
- Delete API là soft archive. Mutation tạo audit row append-only trong cùng transaction.
- Xoá mềm node đồng thời archive mọi edge active nối vào node đó.
- Trigger DB buộc `personal.life_goals.node_id` trỏ node type `Goal` cùng person.

## Backfill và round-trip

`POST /api/life-goals` backfill goal của chính user đã xác thực. Unique source key làm thao tác
idempotent. `GET /api/life-goals?nodeId=...` đọc node/source link, đọc lại Learning source và trả
`GoalSchema` hiện có. Test tự động chứng minh:

1. gọi backfill hai lần trả cùng node;
2. không có câu UPDATE/DELETE tới `public.profiles`;
3. `label`, `targetMinutesPerDay`, status và learner identity giữ nguyên sau round-trip;
4. profile chưa onboarding không bị biến default DB thành goal do người dùng khai.

## Rollback

Rollback production ưu tiên gỡ route/code và giữ bảng/audit. Nếu migration chưa có dữ liệu cần
giữ, drop theo thứ tự: `life_graph_audit_log`, `life_goal_sources`, `life_goals`,
`life_graph_edges`, `life_graph_nodes`. Không drop schema `personal` hoặc bảng V2-03/V2-04.

## Chưa làm

- UI Life Graph/Goal Graph;
- bulk backfill toàn bộ production;
- outbox/reconciliation khi Learning goal thay đổi;
- Context Builder/tool runtime enforcement của V2-04.
