---
name: autonomous-agent-orchestrator
description: 'Kỹ năng Nghiệp vụ Điều phối Hệ thống Đa Agent Tự trị (Autonomous Multi-Agent Orchestration), Vòng lặp Nhận thức & Vận hành Siêu Tin cậy. Kích hoạt khi xây dựng các luồng AI tự trị, phân rã mục tiêu (Goal AutoPilot), đấu trường tranh biện đa nhân vật, phản tỉnh Socratic, quản lý ngân sách Agent và xử lý chuỗi fallback.'
---

# AUTONOMOUS AGENT ORCHESTRATION & RELIABILITY

Bộ quy chuẩn điều phối và kiểm soát các tác tử AI tự trị (Autonomous Agents) hoạt động an toàn, chính xác và có kỷ luật cao nhất.

---

## 1. VÒNG LẶP TỰ TRỊ 5 BƯỚC (THE 5-STEP AUTONOMOUS LOOP)

Mọi quy trình điều phối Agent tự trị đều phải tuân thủ nghiêm ngặt 5 bước có trạng thái xác định:

```
[1. PLAN (Lập Kế hoạch)]
    │ (Phân rã thành các bước vi mô 5-10 phút)
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

### Chi tiết các bước:

1. **Plan:** Nhận mục tiêu của người học, phân rã thành DAG (Directed Acyclic Graph) gồm các nhiệm vụ nguyên tử (Atomic Steps) không phụ thuộc vòng tròn.
2. **Execute:** Thực hiện từng bước với công cụ tương ứng. Mỗi bước có giới hạn thời gian (Timeout $\le 10$s) và giới hạn token đầu ra.
3. **Verify:** Kết quả đầu ra của mỗi bước bắt buộc phải qua bộ lọc kiểm tra (Deterministic Assertions). Nếu thất bại, thử lại tối đa 3 lần với chiến lược điều chỉnh prompt (Self-Healing Reflection).
4. **Reflect:** Trích xuất bài học kinh nghiệm, đo lường chỉ số tự nhận thức (Metacognitive Awareness Index), cập nhật Cung điện Trí nhớ Loci.
5. **Handoff:** Bàn giao kết quả hoàn chỉnh cho người dùng kèm các đề xuất hành động tiếp theo (Proposed Actions).

---

## 2. MA TRẬN PHÂN QUYỀN & VAI TRÒ AGENT CHUYÊN BIỆT

| Vai trò Agent                 | Trách nhiệm Nghiệp vụ                                    | Quyền Hạn Công Cụ                       | Giới Hạn Ngân Sách |
| :---------------------------- | :------------------------------------------------------- | :-------------------------------------- | :----------------- |
| **Socratic Moderator**        | Điều phối tranh biện, giữ luật Toulmin, chỉ ra ngụy biện | Read-only Context, Debate Scoring       | Thấp (Flash)       |
| **STEM Scratchpad Validator** | Kiểm thử từng bước biến đổi đại số, hóa học              | Step-by-step math solver                | Trung bình (Flash) |
| **Autonomous Task Worker**    | Thực thi nhiệm vụ tự hành phân rã từ mục tiêu            | Limited Tool Execution (No Money/State) | Cao (Flash/Pro)    |
| **Cognitive Reflector**       | Tổng hợp phản tỉnh ban đêm, củng cố ký ức                | Memory Palace DB, Graph Synthesis       | Trung bình (Flash) |
| **Code Quality Sentinel**     | Audit code, kiểm tra 5 Quality Gates, rà soát type       | CLI Runner (typecheck, lint, test)      | Không dùng LLM     |

---

## 3. LÁ CHẮN AN TOÀN & RÀNG BUỘC NGÂN SÁCH AGENT (GUARDRAILS & BOUNDS)

1. **Giới hạn Số bước Tối đa (Max Step Limit):** Mỗi phiên làm việc của Agent tự trị bị khóa cứng tối đa **5–10 bước**. CẤM các vòng lặp vô hạn (Infinite Recursion).
2. **Giới hạn Ngân sách Tài chính (USD Cap per Session):** Mỗi phiên thực thi Agent có trần chi phí tối đa (VD: \$0.02 USD/phiên). Nếu vượt ngưỡng, tự động dừng và trả về kết quả tốt nhất hiện có.
3. **Human-in-the-Loop (Xác nhận Con người cho Hành động Rủi ro):**
   - Mọi hành động làm thay đổi vĩnh viễn dữ liệu người dùng, gửi email thật, hoặc phát sinh thanh toán **BẮT BUỘC** phải yêu cầu người dùng bấm xác nhận (Explicit User Confirmation).
