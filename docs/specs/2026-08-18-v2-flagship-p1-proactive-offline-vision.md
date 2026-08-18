# Đặc tả V2 Flagship P1: Proactive Briefings, PWA Offline Mode & Multimodal Vision Solver

> Trạng thái: **Approved for implementation** (2026-08-18)  
> Phạm vi: Nâng cấp Platform V2 lên phiên bản Flagship với 3 tính năng P1 cốt lõi.

---

## 1. Mục tiêu & Bối cảnh

Nền tảng V2 đã có đầy đủ hệ thống 5 miền chuyên biệt (Học tập, Sự nghiệp, Công việc, Khởi nghiệp, Đời sống) và Bạn Đồng Hành AI (Companion). Để nâng cấp trải nghiệm người dùng lên mức cao cấp nhất, giai đoạn **P1** bổ sung:

1. **Proactive Companion Briefings & Web Push**: Trợ lý tự động tổng hợp trạng thái đa miền (Habits cần check-in, thẻ từ vựng SRS đến hạn, mục tiêu sự nghiệp, tâm trạng) và chủ động gửi thông báo / hiển thị bản tin tổng quan ngày (Morning/Evening Briefing).
2. **PWA Offline Mode & Auto-Sync**: Hỗ trợ học thẻ nhớ từ vựng SRS và check-in thói quen ngay cả khi mất mạng; tự động đồng bộ lên máy chủ khi có kết nối trở lại kèm thanh chỉ báo trạng thái offline.
3. **Multimodal Vision STEM Solver**: Tải ảnh chụp bài tập Toán, Lý, Hóa, Sinh hoặc tài liệu $\rightarrow$ AI Vision phân tích đề bài, trích xuất công thức và giải step-by-step chi tiết.

---

## 2. Thiết kế Kỹ thuật Chi tiết

### 2.1. Proactive Briefing (`packages/core-contracts/proactiveBriefing.ts` & `proactiveBriefingService.ts`)

- **Schema**:
  - `ProactiveBriefingRequest`: `{ personId, type?: 'morning' | 'evening', forceRegenerate?: boolean }`
  - `ProactiveBriefingItem`: `{ domain: 'learning' | 'career' | 'work' | 'startup' | 'life', title: string, action: string, route: string, priority: 'urgent' | 'high' | 'normal' }`
  - `ProactiveBriefing`: `{ id: string, personId: string, type: 'morning' | 'evening', greeting: string, summary: string, actionItems: ProactiveBriefingItem[], insights: string[], generatedAt: string }`
- **Service**:
  - Đọc `LearningReadModel` (số thẻ SRS đến hạn, chuỗi streak).
  - Đọc `LifeFoundation` (danh sách thói quen chưa check-in hôm nay, điểm wellbeing).
  - Đọc `Career` (mục tiêu nghề nghiệp còn mở).
  - Sinh bản tin tổng hợp theo mẫu sư phạm cá nhân hóa và tích hợp gửi Web Push nếu có subscription.

### 2.2. PWA Offline Mode & Auto-Sync (`apps/english/src/lib/offlineStore.ts`)

- Quản lý hàng đợi `offline_sync_queue` trong `localStorage` / `IndexedDB`:
  - `enqueueOfflineAction({ kind: 'srs_review' | 'habit_checkin', payload })`
  - `getPendingActions()`
  - `flushOfflineQueue(apiSyncFn)`
- Tự động bắt sự kiện `window.addEventListener('online', ...)` để flush hàng đợi lên máy chủ.

### 2.3. Multimodal Vision Solver (`packages/core-contracts/visionSolver.ts` & `visionSolverService.ts`)

- Nhận hình ảnh Base64 (hoặc Data URL) + `subjectId` + `gradeLevel` + `userPrompt`.
- Sử dụng Google Gemini Generative AI Vision API (`inlineData` base64 parts) để phân tích hình ảnh và trả về:
  - `problemText`: Đề bài nhận dạng được từ ảnh (kèm LaTeX nếu có).
  - `steps`: Danh sách các bước giải step-by-step (`title`, `detail`, `formula`).
  - `finalAnswer`: Đáp số cuối cùng.
  - `confidence`: Độ tin cậy (0.0 - 1.0).

---

## 3. Cổng Chất lượng (Quality Gates)

- 100% unit tests pass trên tất cả các module mới.
- Branch coverage $\ge 90\%$.
- Typecheck (0 error), Lint (0 warning), Prettier format chuẩn.
