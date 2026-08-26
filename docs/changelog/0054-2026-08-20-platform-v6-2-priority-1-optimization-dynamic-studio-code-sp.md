# Platform V6.2 — Priority 1 Optimization: Dynamic Studio Code-Splitting, Chunking & Native AI Prompt/Context Caching Engine (2026-08-20)

Hoàn thành triển khai trọn vẹn 2 trụ cột nâng cấp chiến lược Mức Ưu Tiên 1 (Priority 1):

- **1. Dynamic Studio Code-Splitting & Lazy Loading (`apps/english/src/components/CompanionStudios/`, `apps/english/src/pages/Companion.tsx`)**:
  - Tách 5 Focus Studios của trang Bạn Đồng Hành (`/dong-hanh`) thành các module con độc lập: `StudioDialogue`, `StudioCognitive`, `StudioLabs`, `StudioProactive`, `StudioSynthesis` và `StudioLoadingSkeleton`.
  - Áp dụng cơ chế nạp lười `lazyWithRetry` bọc `<Suspense fallback={<StudioLoadingSkeleton />}>`, phân tách bundle thành các dynamic chunks siêu nhẹ (mỗi studio chỉ 6-12KB gzip), tối ưu hóa thời gian tải ban đầu và giữ render 60 FPS mượt mà.
  - Tách file quản lý kiểu và hằng số dùng chung `studioTypes.ts` tuân thủ chuẩn fast refresh của React.
- **2. Native AI System Instruction & Prompt/Context Caching Gateway (`api/_lib/geminiApi.ts`, `packages/core-ai/chatProviders.ts`)**:
  - Nâng cấp `callGemini`: Sử dụng chuẩn `systemInstruction: { parts: [{ text: system }] }` chính thức của Google Gemini API v1beta và hỗ trợ `cachedContent` context caching thay cho cơ chế fake user/model message cũ.
  - Nâng cấp `callAnthropicChat`: Hỗ trợ cấu trúc Prompt Caching `cache_control: { type: 'ephemeral' }` giúp giảm đến 90% chi phí đọc input token cho các system prompt và kho tri thức lớn.
- **3. Caching Telemetry & Token Cost Savings Tracking (`packages/core-ai/capabilityCostTracker.ts`)**:
  - Mở rộng `CapabilityCostMetric` và `CapabilityCostSummary` theo dõi `cacheReadTokens`, `cacheWriteTokens`, và số tiền tiết kiệm được (`costSavedUsd`).
  - Cập nhật thuật toán tính toán chi phí `calculateCostUsd` với mức chiết khấu 90% khi Cache Hit.
- **4. Quality Gates**:
  - `npm test`: **4.606 / 4.606 tests passed 100%** trên 380 test files (+4 tests mới).
  - `npm run typecheck`: passed 100% (0 errors trên 4 tsconfigs).
  - `npm run lint`: passed 100% (0 warnings, 0 errors).
  - `npm run format:check`: passed 100% (All matched files use Prettier style).
  - `npm run build`: passed 100% (Client Vite SPA, Server `dist-server/`, Hub workspace).

Hoàn thành tái cấu trúc toàn diện kiến trúc phân cấp trang, định tuyến và giao diện người dùng theo domain chuẩn duy nhất **www.donghanhcungban.org**:

- **1. Chuẩn hóa Tên miền & Sửa Xung đột Định tuyến (`apps/english/src/App.tsx`, `apps/hub/src/App.tsx`, `index.html`)**:
  - Hợp nhất toàn bộ ứng dụng trên domain chuẩn `https://www.donghanhcungban.org` (Canonical tags, OpenGraph meta, Hub config, Server routing).
  - Khắc phục triệt để xung đột route: Xóa route `/profile` trùng lặp ghi đè sang `/cai-dat`, chuẩn hóa `/chat` $\to$ `/tro-truyen` (AI Tutor Chat), phân tách `/tin-nhan` (P2P Friends Chat), sửa dynamic route `/learning-path/:levelId` $\to$ `<CefrLevelPage />`.
- **2. Global Studio Switcher Header (`apps/english/src/components/Layout.tsx`)**:
  - Tích hợp **Global Studio Switcher Dropdown** ở đỉnh trang: Chuyển đổi nhanh giữa 5 miền cốt lõi (🌟 Bạn Đồng Hành AI, 🇬🇧 Gia Sư Tiếng Anh, ⚡ Hub Luyện Tập, 📐 Khoa Học STEM, 💼 Sự Nghiệp & Work, 🌱 Đời Sống & Life Graph).
- **3. Adaptive BottomNav với Glowing Center Companion Button (`apps/english/src/components/BottomNav.tsx`)**:
  - Nâng cấp 5 tab chiến lược (Trang chủ, Học tập, Đồng Hành AI, Luyện tập, Cá nhân) với nút tâm điểm **Orb Glow** và tự động nhận diện route cha/con.
- **4. Bento Grid 3 Tầng Cho Hub Luyện Tập & Trang Chủ (`apps/english/src/pages/Practice.tsx`, `apps/english/src/pages/Home.tsx`)**:
  - Thiết kế lại `/luyen-tap` với 3 tầng: 4 Kỹ năng cốt lõi $\to$ 8 Bài tập phản xạ nhanh $\to$ Kho học liệu & công cụ bổ trợ (Từ điển 12k+ IPA, Truyện song ngữ Karaoke, Mẫu câu, Sổ tay lỗi sai, Thử thách video).
  - Cập nhật số liệu từ điển 12.000+ từ chuẩn IPA trên Trang chủ.
- **5. Quality Gates**:
  - `npm test`: **4.602 / 4.602 tests passed 100%** trên 379 test files.
  - `npm run typecheck`: passed 100% (0 errors trên 4 tsconfigs).
  - `npm run lint`: passed 100% (0 warnings, 0 errors).
  - `npm run build`: passed 100% (Frontend Vite, Server `dist-server/`, Hub workspace).

Hoàn thành triển khai toàn diện và nâng cấp hệ sinh thái Đồng Hành lên trạng thái **Đỉnh Cao Chuyên Nghiệp (Executive Flagship Platform V6)**:

- **1. Hợp đồng Dữ liệu V5.4 & V5.5 (`packages/core-contracts/lifeSynthesis.ts`, `packages/core-contracts/agentOrchestrator.ts`)**:
  - `LifeDomainScoreSchema`, `StrategicRecommendationSchema`, `PredictiveGoalHorizonSchema`, `LifeSynthesisReportSchema` (chuẩn `v5.4.0`).
  - `AutonomousAgentRoleSchema`, `AgentBudgetGuardrailSchema`, `AgentTaskStepSchema`, `AgentExecutionSessionSchema` (chuẩn `v5.5.0`).
- **2. Động cơ Tổng hợp Đa Miền & Điều phối Agent Tự trị (`packages/core-personal/lifeSynthesisService.ts`, `packages/core-personal/agentOrchestratorService.ts`, `api/life-synthesis.ts`, `api/agent-orchestrator.ts`)**:
  - Thuật toán `generateLifeSynthesisReport`: Tổng hòa tín hiệu từ 5 miền (`Learning`, `Career`, `Work`, `Startup`, `Life`), tính toán `HolisticAlignmentScore`, `LifeSynergyIndex`, `CognitiveResilienceScore` và trích xuất khuyến nghị chiến lược đòn bẩy cao.
  - Thuật toán `predictGoalTrajectory`: Mô phỏng xác suất về đích mục tiêu và các đường găng chiến lược (Critical Path Steps).
  - Thuật toán `orchestrateAutonomousAgentTask`: Vòng lặp tự trị 5 bước (`plan` $\rightarrow$ `execute` $\rightarrow$ `verify` $\rightarrow$ `reflect` $\rightarrow$ `handoff`) cho 5 vai trò Agent với lá chắn bảo vệ ngân sách USD & tokens.
  - REST Endpoints `GET/POST /api/life-synthesis`, `GET/POST /api/agent-orchestrator` và client libraries `apps/english/src/lib/lifeSynthesisApi.ts`, `apps/english/src/lib/agentOrchestratorApi.ts`.
- **3. Frontend Cockpit & Studio Navigation Architecture (`apps/english/src/components/LifeSynthesis/`, `apps/english/src/components/AgentOrchestrator/`, `apps/english/src/pages/Companion.tsx`)**:
  - Tái cấu trúc toàn bộ trải nghiệm Bạn Đồng Hành (`/dong-hanh`) thành **5 Focus Studios Chuyên Sâu**:
    - 💬 **Studio 1: Đối thoại & Voice Thời gian thực** _(CyberTutor Avatar 3D, Realtime Multimodal Orb, Phân loại ý định 5 Miền, Socratic Prompt Starters, Proposed Actions)_.
    - 🧠 **Studio 2: Nhận thức Sâu & Cung điện Trí nhớ** _(Metacognitive Journal, Spatial Memory Palace Method of Loci, Subconscious Nightly Consolidation, Socratic Diagnostics)_.
    - ⚔️ **Studio 3: Đấu trường Tranh biện & Labs STEM/Phonetics** _(AI Multi-Agent Debate Arena Toulmin Model, STEM Multi-Step Scratchpad, Articulatory 3D Phonetics, Echo Shadowing, Scenario Holodeck)_.
    - 🎯 **Studio 4: Đón đầu Tự trị & Lộ trình Vi mô** _(Proactive Bio-Adaptive Nudges, Goal AutoPilot, Spaced Collocations Graph, Workplace Harvester, Wearables Sync, A2A Mesh)_.
    - 🔮 **Studio 5: Tổng hợp Đa Miền & Studio Điều phối Agent** _(Life Synthesis Dashboard, Predictive Goal Horizon, Multi-Agent Orchestrator Studio, Action Canvas Workspace)_.
  - Tuân thủ nghiêm ngặt kỹ năng `ui-ux-craftsman`, Bento Grid hiện đại, Glassmorphism, chuẩn A11y WCAG 2.2 AA (vùng chạm $\ge 44$px, tương phản cao, focus-visible states), xử lý trọn vẹn 5 trạng thái.
- **4. Quality Gates**:
  - `npm test`: **4.589 / 4.589 tests passed 100%** trên 378 test files.
  - `npm run typecheck`: passed 100% (0 errors trên 4 tsconfigs).
  - `npm run lint`: passed 100% (0 warnings, 0 errors).
  - `npm run format:check`: passed 100% (All matched files use Prettier style).
  - `npm run build`: passed 100% (Client Vite SPA, Server `dist-server/`, Hub workspace).
