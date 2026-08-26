# V2-17 Life Foundation Domain — slice 1: plans, habits, wellbeing, growth milestones (2026-08-17)

Hoàn thành Slice 1 cho V2-17 Life Foundation:

- **Migration `0050_life_foundation.sql`**: Schema `life` với các bảng `plans`, `habits`, `habit_logs`, `wellbeing_checks`, `growth_milestones`.
- **Life Foundation Contracts (`packages/core-contracts/lifeFoundation.ts`)**: `LifePlanSchema`, `HabitSchema`, `HabitLogSchema`, `WellbeingCheckSchema`, `GrowthMilestoneSchema`.
- **Life Foundation Service (`packages/core-life/lifeFoundationService.ts`)**: Habit streak tracking trong transaction, wellbeing scoring (1-10), plan lifecycle, growth milestones.
- **Gate Invariant**: Mỗi subdomain scoped riêng — không có mega Life Agent.
- **API `/api/life`**: GET, POST, PATCH auth-guarded và rate-limited. Đăng ký trong `server.ts`.
- **Test suite & Coverage**: 3845 tests passed 100%, branch coverage 90.02% (statements 95.30%, lines 95.30%, functions 96.95%), build, typecheck, lint (0 warnings), format:check passed 100%.
