---
name: life-career-strategic-advisor
description: 'Kỹ năng Nghiệp vụ Cố vấn Chiến lược Đa Miền & Định hướng Cuộc đời (Life Synthesis 5 Domains, Career Architecture, Predictive Goal Horizon, Decision Ledger, Action Canvas). Kích hoạt khi tổng hợp 5 miền cuộc sống, lập kế hoạch phát triển sự nghiệp, mô phỏng xác suất về đích mục tiêu, và ghi nhận sổ cái quyết định.'
---

# LIFE & CAREER STRATEGIC ADVISOR V7.0

Bộ quy chuẩn cố vấn chiến lược, tổng hòa 5 miền cuộc sống, dự báo quỹ đạo mục tiêu và quản trị quyết định dài hạn trong hệ sinh thái Đồng Hành.

---

## 1. TỔNG HÒA 5 MIỀN CUỘC SỐNG (THE 5-DOMAIN LIFE SYNTHESIS ENGINE)

`packages/core-personal/lifeSynthesisService.ts`, `api/life-synthesis.ts`, `apps/english/src/components/LifeSynthesis/`:

```
                 [Dữ Liệu Hành Vi & Tiến Độ Thực Tế]
                                  │
       ┌───────────┬──────────────┼──────────────┬───────────┐
       ▼           ▼              ▼              ▼           ▼
  [Learning]   [Career]        [Work]        [Startup]     [Life]
  (Học tập)   (Sự nghiệp)    (Công việc)   (Khởi nghiệp)  (Đời sống)
       │           │              │              │           │
       └───────────┴──────────────┼──────────────┴───────────┘
                                  ▼
                    [Life Synthesis Engine]
                                  ├── 1. Holistic Alignment Score (HAS)
                                  ├── 2. Life Synergy Index (LSI)
                                  ├── 3. Cognitive Resilience Score (CRS)
                                  └── 4. High-Leverage Strategic Directives
```

### 3 Chỉ Số Đo Lường Sức Khỏe Toàn Diện:

1. **Holistic Alignment Score (HAS $\in [0, 100]$):** Đo lường mức độ đồng bộ giữa mục tiêu dài hạn và hành động hàng ngày.
2. **Life Synergy Index (LSI $\in [0, 100]$):** Đánh giá hiệu ứng cộng hưởng đòn bẩy giữa các miền (VD: kỹ năng tiếng Anh hỗ trợ thăng tiến sự nghiệp và mở rộng kinh doanh).
3. **Cognitive Resilience Score (CRS $\in [0, 100]$):** Đo lường khả năng phục hồi nhận thức, duy trì cân bằng năng lượng và phòng ngừa kiệt sức (Burnout Prevention).

---

## 2. DỰ BÁO QUỸ ĐẠO MỤC TIÊU & ĐƯỜNG GĂNG CHIẾN LƯỢC (PREDICTIVE GOAL HORIZON)

Thuật toán mô phỏng đường găng (**Critical Path Modeling**):

- **Xác Suất Về Đích Đúng Hạn (Completion Probability $P_{\text{success}}$):** Tính toán dựa trên vận tốc tích lũy hàng tuần (Velocity Rate), độ trễ trung bình và tần suất gián đoạn.
- **Phát Hiện Điểm Nghẽn Chiến Lược (Critical Path Bottlenecks):** Tự động phát hiện mắt xích yếu nhất đang kìm hãm toàn bộ tiến độ (VD: từ vựng chuyên ngành chưa đủ khiến việc viết đề án khởi nghiệp bị đình trệ).
- **Chiến Lược Tái Cân Bằng Nhanh (Rebalancing Directive):** Đề xuất phân bổ lại thời gian và năng lượng một cách thực tế.

---

## 3. SỔ CÁI QUYẾT ĐỊNH & PHÂN TÍCH ĐÁNH ĐỔI (DECISION LEDGER & TRADE-OFFS)

`packages/core-contracts/decisionRecord.ts`, `api/personal-facts.ts`:

1. **Khung Ghi Nhận Quyết Định Chuẩn Mực:**
   - **Bối Cảnh & Giả Định (Context & Assumptions):** Các dữ kiện và điều kiện tiên quyết tại thời điểm ra quyết định.
   - **Các Lựa Chọn Thay Thế (Alternative Options):** Ít nhất 2 phương án đối trọng kèm ma trận ưu/nhược điểm.
   - **Đánh Đổi Chấp Nhận (Accepted Trade-offs):** Rõ ràng những gì phải hy sinh (thời gian, tiền bạc, năng lượng ngắn hạn) để đổi lấy mục tiêu dài hạn.
   - **Mốc Đánh Giá Lại (Review Horizon):** Ngày hẹn kiểm tra lại kết quả thực tế sau 30/90/180 ngày.
2. **Phòng Ngừa Thiên Kiến Quyết Định:** Tự động đối chiếu với 7 bẫy tư duy để tránh quyết định do cảm xúc bộc phát.

---

## 4. KHÔNG GIAN BẢNG VẼ HÀNH ĐỘNG ĐA MIỀN (ACTION CANVAS HUB)

`packages/core-personal/actionCanvasService.ts`, `apps/english/src/pages/ActionCanvas.tsx`:

- Mô hình hóa ý tưởng thành đồ thị node phân cấp 5 miền: `goal` $\rightarrow$ `task` $\rightarrow$ `decision_bridge` $\rightarrow$ `metric`.
- Thuật toán tự động sắp xếp bố cục chống chồng lấn thẻ (Auto-layout Hierarchical Tree).
- Kết xuất Markdown 1-chạm tương thích Notion, Obsidian và Google Docs.
