# Spec: V2-17 Life Foundation Domain

**Trạng thái:** Approved for implementation
**Ngày:** 2026-08-17
**Tác giả:** Antigravity AI
**Mục tiêu:** Xây dựng Bounded Context Life Foundation Domain cho Personal OS theo 21-ROADMAP.md Wave E.

## 1. Bối cảnh & Mục tiêu

- Cung cấp các primitives quản lý cuộc sống: Plans, Habits, Wellbeing, Growth Milestones.
- **Không có mega Life Agent** — mỗi subdomain được scoped riêng với policy layer độc lập.
- Tuân thủ Gate Invariant: mỗi domain chỉ đọc/ghi dữ liệu của mình, không query bảng domain khác.

## 2. Thiết kế kỹ thuật

- **Database (`postgres/migrations/0050_life_foundation.sql`)**: Schema `life` gồm:
  - `life.plans`: id, person_id, title, plan_type, period_start, period_end, status (draft→active→completed/archived), version.
  - `life.habits`: build/break habits với streak tracking (current_streak, best_streak), is_active.
  - `life.habit_logs`: ghi log từng lần thực hiện habit, tự động cập nhật streak.
  - `life.wellbeing_checks`: mood/energy/stress score (1-10) kèm notes.
  - `life.growth_milestones`: mốc phát triển theo area (health/career/learning/...).
- **Contracts (`packages/core-contracts/lifeFoundation.ts`)**: `LifePlanSchema`, `HabitSchema`, `HabitLogSchema`, `WellbeingCheckSchema`, `GrowthMilestoneSchema`.
- **Service (`packages/core-life/lifeFoundationService.ts`)**: CRUD đầy đủ, habit streak update trong transaction.
- **API (`api/life.ts`)**: GET, POST, PATCH endpoints auth-guarded và rate-limited.

## 3. Validation & Testing

- Unit tests: `packages/core-contracts/lifeFoundation.test.ts`, `packages/core-life/lifeFoundationService.test.ts`, `api/life.test.ts`.
- Route registration test: `api/routes-registered.test.ts` (tự động pick up route mới).
