---
name: autonomous-agent-orchestrator
description: 'Kỹ năng Nghiệp vụ Điều phối Hệ thống Đa Agent Tự trị (Autonomous Multi-Agent Orchestration), Vòng lặp Nhận thức & Vận hành Siêu Tin cậy. Kích hoạt khi xây dựng các luồng AI tự trị, phân rã mục tiêu (Goal AutoPilot), đấu trường tranh biện đa nhân vật, phản tỉnh Socratic, quản lý ngân sách Agent, tổng hợp công cụ động và xử lý chuỗi fallback.'
---

# AUTONOMOUS AGENT ORCHESTRATION & RELIABILITY V7.0

Bộ quy chuẩn điều phối và kiểm soát các tác tử AI tự trị (Autonomous Agents) hoạt động an toàn, chính xác và có kỷ luật cao nhất trong hệ sinh thái Đồng Hành.

---

## 1. VÒNG LẶP TỰ TRỊ 5 BƯỚC (THE 5-STEP AUTONOMOUS LOOP)

Mọi quy trình điều phối Agent tự trị (`packages/core-personal/agentOrchestratorService.ts`, `api/agent-orchestrator.ts`) đều phải tuân thủ nghiêm ngặt 5 bước có trạng thái xác định:

```
[1. PLAN (Lập Kế hoạch)]
    │ (Phân rã thành các bước vi mô 5-10 phút DAG)
    ▼
[2. EXECUTE (Thực thi)]
    │ (Gọi công cụ có phân quyền & kiểm soát ngân sách)
    ▼
[3. VERIFY (Kiểm chứng)]
    │ (Chạy Unit/Logic Gate & Zod Schema Validation)
    ▼
[4. REFLECT (Phản tỉnh Socratic)]
    │ (Đo lường MAI Index & Phát hiện Bẫy tư duy)
    ▼
[5. HANDOFF (Chuyển giao Kết quả)]
```

### Chi tiết 5 Bước Chuẩn Mực:

1. **Plan (Lập Kế hoạch):** Nhận mục tiêu trừu tượng của người học, phân rã thành DAG (Directed Acyclic Graph) gồm các nhiệm vụ nguyên tử (Atomic Steps) từ 5–10 phút, không phụ thuộc vòng lặp (No Cyclic Dependencies).
2. **Execute (Thực thi):** Thực hiện từng bước với công cụ chuyên biệt. Mỗi bước có giới hạn thời gian (Timeout $\le 10$s) và giới hạn token đầu ra nghiêm ngặt.
3. **Verify (Kiểm chứng):** Kết quả đầu ra của mỗi bước bắt buộc phải qua bộ lọc kiểm tra tất định (Deterministic Assertions & Zod Parse). Nếu thất bại, thử lại tối đa 3 lần với chiến lược tự sửa prompt (Self-Healing Reflection).
4. **Reflect (Phản tỉnh Socratic):** Trích xuất bài học kinh nghiệm, đo lường chỉ số tự nhận thức (Metacognitive Awareness Index - MAI), cập nhật Cung điện Trí nhớ Loci và Sổ cái Quyết định.
5. **Handoff (Chuyển giao):** Bàn giao kết quả hoàn chỉnh cho người dùng kèm các đề xuất hành động 1-chạm kế tiếp (Proposed Actions).

---

## 2. GIAO THỨC ĐỒNG THUẬN ĐA TÁC TỬ (MULTI-AGENT DELPHI CONSENSUS PROTOCOL)

Khi giải quyết các bài toán phức tạp, hệ thống kích hoạt giao thức biểu quyết có trọng số (**Weighted Delphi Consensus** — `packages/core-ai/multiAgentConsensusService.ts`) giữa 4 nhân vật AI chuyên gia:

```
                  [Learner Query / Complex Dilemma]
                                  │
       ┌──────────────┬───────────┴───────────┬──────────────┐
       ▼              ▼                       ▼              ▼
[Pedagogy Master] [Linguistics SOTA] [Career Architect] [STEM Mentor]
 (Weight: 0.30)    (Weight: 0.30)     (Weight: 0.20)     (Weight: 0.20)
       │              │                       │              │
       └──────────────┴───────────┬───────────┴──────────────┘
                                  ▼
                [Consensus Engine & Conflict Resolver]
                                  │ (Scoring ≥ 0.75)
                                  ▼
                   [Unified Consensus Verdict]
```

- **Consensus Degree Scoring:** Tính toán độ tương đồng lập luận giữa các chuyên gia ($S \in [0, 1]$).
- **Conflict Resolution:** Nếu độ bất đồng cao ($S < 0.60$), kích hoạt vòng tranh biện Socratic thứ 2 để tìm điểm chung (Common Ground Synthesis) trước khi đưa ra phán quyết (`ConsensusVerdict`).

---

## 3. TỔNG HỢP CÔNG CỤ ĐỘNG & SANDBOX ZERO-TRUST (DYNAMIC TOOL SYNTHESIZER)

Cho phép Agent tự động tạo công cụ tính toán và biến đổi dữ liệu theo nhu cầu (`packages/core-personal/dynamicToolSynthesizer.ts`):

1. **Zero-Trust AST Sandbox:**
   - Kiểm tra cây cú pháp trừu tượng (AST Inspection) trước khi thực thi.
   - **CẤM TUYỆT ĐỐI:** Mọi lệnh I/O, File System, Network Fetch, Process Access, `eval()`, `Function()`, `import()`, `require()`.
2. **Resource Boundaries:**
   - Giới hạn thời gian thực thi: Timeout $\le 1000$ms.
   - Giới hạn bộ nhớ: Ngăn chặn tràn ngăn xếp (Stack Overflow) và vòng lặp vô hạn (Infinite Loop Detection).

---

## 4. HỢP NHẤT TRÍ NHỚ TỰ TRỊ CHU TRÌNH REM (AUTONOMOUS REM CONSOLIDATION)

Mô phỏng chu trình REM giấc ngủ (`packages/core-personal/remConsolidationService.ts`):

- **Subconscious Nightly Job:** Tự động quét, gom cụm và nén các tương tác, lỗi sai và thành tựu trong ngày thành các khối **Consolidated Memory Blocks**.
- **Forgetting Curve Modeling:** Áp dụng công thức đường cong lãng quên **Ebbinghaus / FSRS ($R = e^{-t/S}$)**, tự động lên lịch ôn tập khi độ lưu giữ $R$ giảm dưới 90%.
- **Proactive Morning Briefing:** Tự động tạo bản tin đón đầu ngày mới cho Bạn Đồng Hành AI trước khi người dùng mở ứng dụng.

---

## 5. LÁ CHẮN AN TOÀN & RÀNG BUỘC NGÂN SÁCH AGENT (GUARDRAILS & BOUNDS)

1. **Giới hạn Số bước Cứng (Max Step Limit):** Mỗi phiên làm việc của Agent tự trị bị khóa tối đa **5–10 bước**. CẤM các vòng lặp đệ quy vô hạn.
2. **Giới hạn Ngân sách Tài chính (USD Cap per Session):**
   - Trần chi phí tối đa: **\$0.02 USD / phiên**.
   - Cảnh báo tại 80% ngân sách $\to$ Tự động chuyển sang mô hình siêu tiết kiệm (Flash-Lite / Edge AI) tại 100% ngân sách.
3. **Human-in-the-Loop (Bắt buộc Xác nhận cho Hành động Rủi ro):**
   - Mọi hành động làm thay đổi vĩnh viễn dữ liệu người dùng, gửi email thật, hoặc phát sinh giao dịch tài chính **BẮT BUỘC** phải yêu cầu người dùng xác nhận trực tiếp (Explicit User Confirmation).
