# V2-05 Life Graph foundation — slice 2: UI, reconciliation & bulk backfill (2026-08-17, PR #580 đã MERGE)

Hoàn thành Slice 2 cho V2-05 Life Graph:

- **UI Mạng lưới cá nhân**: Trang `/life-graph` (`apps/english/src/pages/LifeGraph.tsx`) hiển thị danh sách các Node và Edges của người dùng trực quan, nhẹ, không dùng thư viện đồ thị cồng kềnh; thêm entry point tại trang Profile (`apps/english/src/pages/Profile.tsx`).
- **Client API**: `apps/english/src/lib/lifeGraphApi.ts` bọc các endpoint `/api/life-graph` và `/api/life-goals`.
- **Outbox/Reconciliation**: Hook `backfillCurrentLearningGoal` vào `api/profile.ts` để đồng bộ tự động Life Graph projection khi user cập nhật mục tiêu học tập.
- **Bulk Backfill Script**: `scripts/backfill-life-goals.ts` hỗ trợ batch backfill toàn bộ profile hợp lệ.
- **Gate verification**: `npm run build`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test` (3591 tests) đều pass 100%.
