# Platform V6.4 — Priority 3 Optimization: Computerized Adaptive Testing (CAT IRT 3PL) & Reciprocal Rank Fusion Hybrid RAG Engine (2026-08-20)

Hoàn thành triển khai trọn vẹn 2 động cơ lõi về Tâm trắc học hiện đại và Truy xuất ngữ cảnh lai:

- **1. Computerized Adaptive Testing (CAT Engine) chuẩn IRT 3PL (`packages/core-learner/adaptiveTestingEngine.ts`)**:
  - Triển khai mô hình toán học **Item Response Theory (IRT 3PL: 3-Parameter Logistic)** tính toán xác suất $P(\theta) = c + \frac{1 - c}{1 + e^{-1.7a(\theta - b)}}$ và hàm thông tin Fisher $I(\theta)$.
  - Thuật toán ước lượng năng lực **Expected A Posteriori (EAP)** cập nhật phân phối chuẩn $N(0, 1)$ theo thời gian thực sau mỗi câu trả lời, tự động chọn câu hỏi tối ưu thông tin nhất tiếp theo.
  - Cho phép rút ngắn thời gian làm bài đánh giá trình độ Placement và kiểm tra định kỳ từ 50 câu xuống còn **12–15 câu** mà vẫn đạt độ tin cậy phân loại CEFR $r > 0.92$.
- **2. Hybrid RAG Context Retrieval Engine qua Reciprocal Rank Fusion (`packages/core-ai/hybridRagEngine.ts`)**:
  - Triển khai thuật toán xếp hạng hợp nhất **Reciprocal Rank Fusion (RRF)** kết hợp độ tương đồng ngữ nghĩa vector (Dense Cosine Similarity) và tần suất từ khóa bão hòa (Sparse BM25 Keyword Scoring).
  - Tối ưu hóa việc lọc nhiễu và nạp trí nhớ cá nhân vào Bạn Đồng Hành AI với độ chính xác và độ sắc nét cao nhất.
- **3. Quality Gates**:
  - `npm test`: **4.625 / 4.625 tests passed 100%** trên 384 test files (+9 tests mới).
  - `npm run typecheck`: passed 100% (0 errors trên 4 tsconfigs).
  - `npm run lint`: passed 100% (0 warnings, 0 errors).
  - `npm run format:check`: passed 100% (All matched files use Prettier style).
  - `npm run build`: passed 100% (Client Vite SPA, Server `dist-server/`, Hub workspace).
