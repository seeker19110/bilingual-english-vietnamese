# V2-09 Companion Runtime — slice 1: intent/domain, planner, context injection, action router & API (2026-08-17, PR #584 đã MERGE)

Hoàn thành Slice 1 cho V2-09 Companion Runtime:

- **Companion Engine Pipeline (`packages/core-personal/companionRuntime.ts`)**: Tích hợp luồng thực thi tổng hợp của Companion Runtime theo `02-SYSTEM-ARCHITECTURE.md` mục 3: `Intent/Domain Resolver → Context Builder (Context Engine) → Companion Planner → Policy Engine → Capability / Tool Router → Result Validator & State Proposal → Read Model Response`.
- **Intent & Domain Resolver (`resolveIntentAndDomain`)**: Phân loại chính xác intent (`set_learning_goal`, `dictionary_lookup`, `update_profile_fact`, `create_memory`, `general_conversation`) và domain (`learning`, `profile`, `personal`).
- **Planner & Action Router (`generatePlan`, `executeCompanionTurn`)**: Lập kế hoạch theo intent, chuyển thành các bước `PlannedStep` và thực thi/đề xuất qua `proposeAction`.
- **API `/api/companion`**: POST endpoint auth-guarded, rate-limited, Zod validation trả về `CompanionResponse` kèm `ContextPackage`, danh sách `ProposedAction` và tóm tắt thực thi. Đăng ký trong `server.ts`.
- **Test suite**: 17 unit tests mới (`companionRuntime.test.ts` và `api/companion.test.ts`), 95 route registration tests passed.
