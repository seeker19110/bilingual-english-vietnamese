# V2-07 Context Engine — slice 1: selection pipeline, security filtering & API (2026-08-17, PR #582 đã MERGE)

Hoàn thành Slice 1 cho V2-07 Context Engine:

- **Context Builder Pipeline (`packages/core-personal/contextEngine.ts`)**: Triển khai thứ tự chọn chuẩn (Selection Order: `current_request` → `active_goal_or_project` → `authoritative_domain_state` → `user_declared_fact` → `validated_derived_memory` → `recent_episodic_context`).
- **Security & Privacy Boundary**: Kiểm tra consent hợp lệ theo (scope, purpose) qua `isConsentActive` (đạt GATE V2-04), lọc thẩm quyền cá nhân (omits DENY từ `resolveAuthority`), loại bỏ item vượt ngưỡng `maxSensitivity` (`public` < `personal` < `sensitive` < `restricted`), và ràng buộc cứng token budget (`tokenUsed <= tokenBudget`).
- **API `/api/context-package`**: POST endpoint auth-guarded, rate-limited, Zod validation trả về `ContextPackage` chuẩn contract. Đăng ký trong `server.ts`.
- **Test suite**: 11 unit tests mới (`contextEngine.test.ts` và `api/context-package.test.ts`), 91 route registration tests passed.
