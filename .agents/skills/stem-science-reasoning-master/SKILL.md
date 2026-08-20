---
name: stem-science-reasoning-master
description: 'Kỹ năng Nghiệp vụ Khoa học STEM & Suy luận Logic Đa bước (Interactive STEM Scratchpad, Step-by-Step Algebraic & Chemical Equation Validator, Socratic Micro-Hints, LaTeX Formatting, Vision Solver). Kích hoạt khi giải toán, lý, hóa, sinh, kiểm thử từng bước biến đổi đại số, cân bằng phản ứng hóa học và trình bày công thức LaTeX.'
---

# STEM SCIENCE & MULTI-STEP REASONING MASTER V7.0

Bộ quy chuẩn kiểm thử logic từng bước, giải quyết bài toán khoa học tự nhiên (Toán, Lý, Hóa, Sinh) và sư phạm gợi ý Socratic trong hệ sinh thái Đồng Hành.

---

## 1. BẢNG NHÁP KIỂM THỬ TỪNG BƯỚC STEM (INTERACTIVE STEM SCRATCHPAD)

`packages/core-ai/stemScratchpadService.ts`, `api/stem-scratchpad.ts`, `apps/english/src/components/StemScratchpad/`:

```
[Bài Toán STEM / Phương Trình / Bài Tập Hóa Học]
                       │
                       ▼
[Người Học Nhập Từng Bước Biến Đổi (Step-by-Step Input)]
                       │
                       ▼
[Deterministic Step Validator Engine]
  ├── 1. Algebraic Transformation Check (Toán / Lý)
  ├── 2. Atom Count & Oxidation State Balance (Hóa học)
  └── 3. Dimensional Analysis & Units Consistency (Vật lý)
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
[Hợp Lệ: Valid Step]       [Lỗi Logic: Step Error]
  - Đi tiếp bước sau         - Chỉ rõ bản chất lỗi sai
  - Cập nhật tiến độ         - Sinh Socratic Micro-Hint (Không spoil đáp án)
```

### 4 Bộ Môn Khoa Học Cốt Lõi:

1. **Toán học (Mathematics):** Đại số tuyến tính, giải tích, phương trình vi phân, lượng giác, hình học không gian.
2. **Vật lý (Physics):** Cơ học Newton, điện từ học, quang học sóng, nhiệt động lực học, vật lý hạt nhân.
3. **Hóa học (Chemistry):** Cân bằng phản ứng oxi hóa - khử, hóa học hữu cơ, động hóa học, cân bằng ion dung dịch.
4. **Sinh học (Biology):** Di truyền phân tử (ADN/ARN), dịch mã di truyền, chu trình tế bào, cân bằng sinh thái.

---

## 2. QUY CHUẨN XÁC THỰC PHƯƠNG TRÌNH & BẢO TOÀN NGUYÊN TỐ (SYMBOLIC PARSER)

1. **Kiểm Tra Biến Đổi Đại Số (Algebraic Consistency):**
   - Đảm bảo tính đẳng trị logic qua từng dòng biến đổi (tập xác định, điều kiện nghiệm ngoại lai, chia cho 0).
2. **Cân Bằng Phương Trình Hóa Học (Stoichiometry & Atom Balance):**
   - Đếm số lượng từng nguyên tử hai vế phương trình $\sum \text{Atom}_{\text{reactants}} = \sum \text{Atom}_{\text{products}}$.
   - Bảo toàn điện tích $\sum q_{\text{reactants}} = \sum q_{\text{products}}$.
3. **Kiểm Tra Thứ Nguyên (Dimensional Analysis):**
   - Đối soát đơn vị vật lý ở cả hai vế công thức trước khi thực hiện phép tính số học.

---

## 3. NGUYÊN TẮC GỢI Ý VI MÔ SOCRATIC (SOCRATIC MICRO-HINTS)

- **CẤM:** Tuyệt đối không đưa ra đáp số cuối cùng ngay lập tức khi học viên gặp bế tắc.
- **Quy Trình 3 Bậc Gợi Ý:**
  - **Bậc 1 (Conceptual Clue):** Nhắc lại định luật hoặc định lý liên quan (VD: _"Em có nhớ định luật bảo toàn động lượng áp dụng cho hệ kín như thế nào không?"_).
  - **Bậc 2 (Structural Prompt):** Hướng dẫn cấu trúc biến đổi bước tiếp theo (VD: _"Hãy thử chuyển hết các số hạng chứa biến $x$ sang vế trái và quy đồng mẫu số"_).
  - **Bậc 3 (Direct Step Check):** Chỉ ra điểm tính toán nhầm cụ thể (VD: _"Ở dòng 2, khi nhân cả hai vế với $-1$, chiều của bất phương trình cần thay đổi"_).

---

## 4. QUY CHUẨN KẾT XUẤT CÔNG THỨC TOÁN HỌC LATEX

Mọi công thức toán học và khoa học trong phản hồi AI phải được định dạng chuẩn xác bằng LaTeX:

- **Công Thức Trong Dòng (Inline Math):** Sử dụng `\( ... \)` hoặc `$ ... $` (VD: `$E = mc^2$`).
- **Công Thức Khối (Display Math Block):** Sử dụng `\[ ... \]` hoặc `$$ ... $$` căn giữa:
  $$\int_{-\infty}^{+\infty} e^{-x^2} dx = \sqrt{\pi}$$
- **Ký Hiệu Phản Ứng Hóa Học:** Sử dụng mũi tên rõ ràng kèm trạng thái chất:
  $$\text{CaCO}_3\text{(r)} \xrightarrow{t^\circ} \text{CaO}\text{(r)} + \text{CO}_2\text{(k)}\uparrow$$
