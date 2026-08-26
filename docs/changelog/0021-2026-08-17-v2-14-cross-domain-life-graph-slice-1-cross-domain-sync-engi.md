# V2-14 Cross-Domain Life Graph — slice 1: cross-domain sync engine, contracts & API (2026-08-17, PR #589 đã MERGE)

Hoàn thành Slice 1 cho V2-14 Cross-Domain Life Graph:

- **Cross-Domain Graph Contracts (`packages/core-contracts/crossDomainGraph.ts`)**: Schema `CrossDomainGraphProjectionSchema` và `CrossDomainSyncSummarySchema`.
- **Cross-Domain Sync Engine (`packages/core-personal/crossDomainGraphService.ts`)**: Thực thi liên kết `Career goal → skill gap → Learning mastery → Life Graph Nodes & Edges (requires, supports)` mà không vi phạm ranh giới bảng.
- **API (`api/life-graph.ts`)**: Hỗ trợ GET `?kind=cross_domain` và POST `{ kind: 'cross_domain_sync' }` auth-guarded và rate-limited.
- **Test suite**: 3 unit tests mới (`crossDomainGraph.test.ts`, `crossDomainGraphService.test.ts`, `api/life-graph.test.ts`), 103 route registration tests passed.
