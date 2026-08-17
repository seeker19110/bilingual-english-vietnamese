# Spec: V2-14 Cross-Domain Life Graph

**Trạng thái:** Approved for implementation
**Ngày:** 2026-08-17
**Tác giả:** Antigravity AI
**Mục tiêu:** Đồng bộ và liên kết trạng thái giữa Career, Learning và Personal vào Life Graph theo 21-ROADMAP.md Wave E.

## 1. Bối cảnh & Mục tiêu

- Xây dựng luồng thực thi mẫu kết nối đa domain:
  `Career goal: Data Analyst → skill gap SQL/English/Statistics → Learning plans → evidence/mastery → Career progress / Life Graph Edges`.
- **Gate Invariant:** Không query trực tiếp vào bảng Learning từ Career hay Cross-Domain Sync, luôn đọc qua typed `LearningReadModel`.

## 2. Thiết kế kỹ thuật

- **Contracts (`packages/core-contracts/crossDomainGraph.ts`)**: `CrossDomainGraphProjectionSchema`, `CrossDomainSyncSummarySchema`.
- **Service (`packages/core-personal/crossDomainGraphService.ts`)**: `syncCrossDomainLifeGraph(pool, personId, userId)`:
  - Tra cứu Career Goals đang hoạt động (`listCareerGoals`).
  - Tra cứu Learning State (`getLearningReadModel`).
  - Đảm bảo các node `Goal` và `Skill` tương ứng tồn tại trong `personal.graph_nodes`.
  - Thiết lập quan hệ `requires` và `supports` khi năng lực học tập đạt mức chuẩn.
- **API (`api/life-graph.ts`)**: Bổ sung endpoint GET `?kind=cross_domain` và POST `{ kind: 'cross_domain_sync' }`.

## 3. Validation & Testing

- Unit tests: `packages/core-contracts/crossDomainGraph.test.ts`, `packages/core-personal/crossDomainGraphService.test.ts`.
- API tests: `api/life-graph.test.ts`.
- Route registration test: `api/routes-registered.test.ts`.
