# Spec: V2-09 Companion Runtime

**Trạng thái:** Approved for implementation
**Ngày:** 2026-08-17
**Tác giả:** Antigravity AI
**Mục tiêu:** Xây dựng luồng thực thi tổng hợp của Companion Runtime theo chuẩn kiến trúc V2 (02-SYSTEM-ARCHITECTURE.md mục 3, 9, 10).

## 1. Bối cảnh & Mục tiêu

- Companion Runtime kết nối toàn bộ hạ tầng Personal OS (Personal World Model, Life Graph, Knowledge Fabric, Context Engine, ProposedAction & Tool Manifests).
- Luồng tuần tự bất biến: `Intent/Domain Resolution → Context Resolution (Context Engine) → Companion Planner → Policy Engine → Capability / Tool Router → Result Validator & State Proposal → Response Read Model`.
- Invariant bất biến: Planning ≠ Execution ≠ State Mutation.

## 2. Thiết kế kỹ thuật

- **Companion Runtime Service:** `packages/core-personal/companionRuntime.ts`
  - `resolveIntentAndDomain(input)`: Phân loại intent (`lookup_word`, `set_goal`, `update_fact`, `general_chat`, v.v.) và targetDomain (`learning`, `profile`, `general`).
  - `buildContextPackage(...)`: Gọi Context Engine lấy context items hợp lệ với budget & permission.
  - `generatePlan(...)`: Sinh các bước tác vụ cần thực hiện (Tool / Capability invocations).
  - `executePlanSteps(...)`: Tạo các `ProposedAction` tương ứng qua `proposeAction`, tự động chạy bước an toàn và giữ `pending` bước rủi ro cao hoặc cần confirm.
  - `synthesizeReply(...)`: Tổng hợp câu trả lời hoàn chỉnh trả về người dùng kèm danh sách `ProposedAction` và tóm tắt thực thi.
- **API Handler:** `api/companion.ts`
  - POST `/api/companion`: Nhận `{ message, intent?, domain? }`, xác thực JWT, kiểm tra rate limit, trả về `CompanionResponse`.

## 3. Validation & Testing

- Unit tests: `packages/core-personal/companionRuntime.test.ts`.
- API tests: `api/companion.test.ts`.
- Route registration test: `api/routes-registered.test.ts`.
