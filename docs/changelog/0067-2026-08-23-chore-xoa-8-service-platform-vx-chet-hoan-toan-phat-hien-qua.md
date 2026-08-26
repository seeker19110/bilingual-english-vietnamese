# chore: xoá 8 service "Platform Vx" chết hoàn toàn — phát hiện qua audit toàn diện (2026-08-23)

Audit toàn diện (`docs/framework/QUY-TRINH-AUDIT.md`) rà lại toàn bộ danh sách tính năng
"Platform V2→V7" ghi trong các mục bên dưới, đối chiếu **import thật trong repo** (không tin
tên tính năng trong changelog) để biết cái nào còn được gọi tới. Phát hiện 8 file chỉ tự tham
chiếu trong chính nó + file test riêng — **không một API route, không một trang, không một
companion runtime nào gọi tới**:

- `packages/core-ai/multiAgentConsensusService.ts` (Multi-Agent Delphi Consensus, V6.6)
- `packages/core-personal/dynamicToolSynthesizer.ts` (Dynamic Tool Synthesizer + Zero-Trust Sandbox, V6.6)
- `packages/core-ai/hybridRagEngine.ts` (RRF Hybrid RAG, V6.4)
- `packages/core-learner/adaptiveTestingEngine.ts` (CAT IRT 3PL, V6.4)
- `packages/core-personal/remConsolidationService.ts` (REM Memory Consolidation, V6.5)
- `packages/core-personal/cognitiveLoadRegulator.ts` (Flow State CLI Regulator, V6.7)
- `packages/core-learner/prerequisiteKnowledgeGraph.ts` (BKT DAG Prerequisite Graph, V6.7)
- `packages/core-personal/zkCrypto.ts` (Zero-Knowledge Encryption, V2)

Các test đạt 90-100% coverage vì tự gọi thẳng hàm nội bộ — coverage xanh **không chứng minh
tính năng có dùng được**, chỉ chứng minh code không lỗi cú pháp/kiểu. Đây là bài học cho quy
trình audit: cần đối chiếu **đồ thị import thật** (route đăng ký ở `server.ts`, fetch từ
frontend, companion runtime gọi tới) chứ không tin nhãn "Quality Gates 100% Passed" trong
changelog. Xoá 8 file + 8 file test đi kèm = **2115 dòng**. Các tính năng khác trong danh sách
"Platform Vx" (PvP Arena, Referral VIP, Daily Quests, Memory Palace, Metacognitive Reflection,
Mesh Telemetry, Debate Arena, STEM Scratchpad, Subconscious Insights, A2A Negotiator, Neural
Micro-Curriculum, Vision Solver, Edge AI WebGPU, 3D Avatar) đã xác nhận **còn dùng thật**, đều
reachable từ route/trang/companion studio — giữ nguyên, không đụng tới.

Xác nhận đủ cổng commit sau khi xoá: build ✅ · typecheck ✅ (0 lỗi, xác nhận không import gãy)
· lint ✅ (0 cảnh báo) · format ✅ · test+coverage ✅ (statements 93.97% · branches 90.11% ·
functions 97.01% · lines 93.97% — vẫn trên sàn 90/90/90/90 của `vitest.config.ts`).

**Đề xuất còn để ngỏ (chưa làm, cần người dùng quyết):** cân nhắc dừng thêm "Platform Vx" mới
cho tới khi rà lại mức độ sử dụng thực tế của các tính năng đã có — quy mô tính năng hiện tại
đã vượt xa nhiều so với mục tiêu MVP ghi ở CLAUDE.md mục 1 (app gia sư song ngữ 3 chế độ đơn
giản), rủi ro tiếp tục sinh thêm code không ai dùng.
