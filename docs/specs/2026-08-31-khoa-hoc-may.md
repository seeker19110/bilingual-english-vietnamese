# Đặc tả: KHOÁ RIÊNG "Học máy — bản đồ Machine Learning" (khoá ngắn thứ năm)

> Ngày 2026-08-31. Khoá ngắn thứ năm của môn Lập trình, LÀM ĐÚNG THEO TIỀN LỆ các khoá
> Git/Hermes/Vibe/OpenClaw (`packages/subject-programming/courses/`). Nguồn yêu cầu: chủ dự án
> gửi sơ đồ tư duy "Machine Learning — 2026 update" (bản đồ đầy đủ các nhánh ML) kèm yêu cầu
> "nghiên cứu thiết kế và tạo khoá học này".
> Khuôn: `docs/templates/dac-ta-tinh-nang.md`.

## 0. Một câu

Khoá học ĐỘC LẬP **"Học máy — từ hồi quy đến AI tạo sinh"** (`/lap-trinh/khoa-hoc/ml`,
20 bài / 4 chương, ngôn ngữ bài học `python` thuần — KHÔNG thư viện ngoài) đi trọn bản đồ
Machine Learning 2026: học có giám sát → không giám sát → ensemble/RL/các kiểu học lai →
học sâu & AI tạo sinh — mỗi khái niệm đều TỰ CÀI bằng Python thuần để hiểu ruột, chấm bằng
cổng python3 thật đã có (`lessonsPython.test.ts`), không cần simulator mới.

## 1. Nghiên cứu đầu vào

### 1.1. Bản đồ nội dung (từ sơ đồ người dùng gửi)

Sơ đồ "Machine Learning — 2026 update" chia 12 nhánh: Supervised (Regression:
linear/polynomial/ridge/lasso · Classification: logistic/SVM/trees/k-NN/Naive Bayes) ·
Unsupervised (Clustering: k-means/DBSCAN/mean-shift… · Association rules: Apriori/FP-Growth ·
Dimensionality reduction: PCA/t-SNE/UMAP/SVD/LDA) · Reinforcement (Q-learning/DQN/SARSA/
policy gradient/actor-critic) · Self-supervised (contrastive/MLM/BYOL) · Semi-supervised
(self-training/co-training) · Transfer (fine-tuning/feature extraction) · Deep Learning
(FNN/CNN/RNN/Transformers/GNN/autoencoders) · Generative AI (LLMs/diffusion/GANs/multimodal) ·
Ensemble (bagging/boosting/stacking/voting) · Probabilistic Graphical Models (Bayes nets/
MRF/HMM). Khoá phủ đủ 12 nhánh: nhánh lõi tự cài bằng code, nhánh chuyên sâu dạy ở mức
bản-đồ-nhận-đường (biết nó là gì, khi nào dùng, học tiếp ở đâu).

### 1.2. Vì sao là KHOÁ NGẮN, không phải hướng chuyên sâu mới

- Hướng `ai` (specializations) ĐÃ CÓ bản đồ 4 chặng S1–S4 mức nghề nghiệp (12–18 tháng);
  thêm hướng thứ 15 trùng phạm vi là nhân đôi nguồn sự thật.
- Cái đang THIẾU là tầng bài học 8 bước THẬT, vào thẳng được, cho người muốn hiểu ML từ số 0
  — đúng vai của tầng khoá ngắn (học độc lập, không đòi bậc P nào).
- Khoá ngắn `ml` vì thế là CỬA VÀO thực hành; ai học xong muốn đi nghề thì chuyển sang hướng
  chuyên sâu `ai` (ghi rõ trong bài tổng kết).

### 1.3. Đối tượng & điều kiện vào

- Người đã biết Python căn bản (biến, hàm, vòng lặp, list — tương đương P1–P2).
- `prerequisites: []` (vào thẳng như mọi khoá ngắn) nhưng `duration` ghi rõ nên biết Python
  căn bản trước; bài 1 có nhắc lối về P1 cho ai chưa từng code.

### 1.4. Hiện trạng hạ tầng (đo thật từ mã nguồn 2026-08-31)

| Thứ                                        | Số thật hôm nay                                                                     |
| ------------------------------------------ | ----------------------------------------------------------------------------------- |
| Tầng khoá ngắn `courses/`                  | ĐÃ CÓ 4 khoá: git · hermes · vibe · openclaw — thêm khoá = 1 file + 1 dòng registry |
| Trang khoá `/lap-trinh/khoa-hoc/:courseId` | ĐÃ CÓ, data-driven — khoá mới tự hiện ở `ProgrammingHome`                           |
| Khuôn bài 8 bước + SRS                     | ĐÃ CÓ (`lessonTypes.ts`)                                                            |
| Bộ chạy + cổng chấm ngôn ngữ `python`      | ĐÃ CÓ (Pyodide ở trình duyệt, `lessonsPython.test.ts` chạy python3 thật trong CI)   |
| Regex `lessonId`                           | `(git\|hermes\|vibe\|openclaw)-u\d+-l\d+` ở 4 chỗ — nới thêm `ml`                   |
| Simulator mới                              | KHÔNG CẦN — bài chạy Python thuần                                                   |
| Bài dùng lại được                          | 0 — 20/20 bài mới (`ml-u1..u4`)                                                     |

## ② Phạm vi

**LÀM:**

- `courses/ml.ts` + thêm `'ml'` vào `ShortCourseId` + đăng ký `registry.ts`.
- 4 file bài học `lessons/mlu1..mlu4.ts` (5 bài/file, 20 bài, đủ 8 bước + thẻ SRS) + đăng ký
  `lessons.ts`.
- Nới regex lessonId ở 4 chỗ: `lessonTypes.ts` (id + unitId), `apps/server/.../progress.ts`,
  `apps/server/.../feedback.ts`.
- Đặc tả này + changelog.

**KHÔNG làm:**

- KHÔNG simulator mới, KHÔNG UI/route mới, KHÔNG đổi schema DB (tiến độ dùng bảng sẵn có).
- KHÔNG thư viện Python ngoài (numpy/sklearn) — mọi bài chạy Python thuần để Pyodide và
  python3 CI chấm y hệt nhau.
- KHÔNG đụng hướng chuyên sâu `ai` (bản đồ nghề giữ nguyên).

## ③ Cấu trúc khoá (4 chương × 5 bài)

**C1 — Bản đồ ML & Học có giám sát** (`ml-u1`): ① ML là gì — luật viết tay vs học từ dữ liệu

- bản đồ 12 nhánh; ② hồi quy tuyến tính tự cài (least squares); ③ phân loại k-NN tự cài;
  ④ tách train/test + accuracy — vì sao không chấm trên dữ liệu đã học; ⑤ overfitting &
  bias-variance + ridge/lasso ở mức trực giác.

**C2 — Học không giám sát** (`ml-u2`): ① k-means tự cài một vòng gán-cụm; ② chuẩn hoá dữ
liệu & khoảng cách (min-max) — vì sao thiếu nó k-NN/k-means hỏng; ③ giảm chiều — phương sai
theo trục, trực giác PCA (nhắc t-SNE/UMAP); ④ luật kết hợp — support/confidence kiểu Apriori;
⑤ DBSCAN trực giác (điểm lõi trong bán kính eps) + chọn thuật toán cụm.

**C3 — Ensemble, RL & các kiểu học lai** (`ml-u3`): ① bagging & random forest — bỏ phiếu đa
số; ② boosting — học từ lỗi, tăng trọng số ca sai (XGBoost family); ③ voting/stacking — hard
vs soft voting; ④ học tăng cường — công thức cập nhật Q-learning tự cài (nhắc DQN/SARSA/
policy gradient); ⑤ semi-/self-supervised & transfer — pseudo-labeling tự cài (nhắc
contrastive/MLM/fine-tuning).

**C4 — Học sâu & AI tạo sinh** (`ml-u4`): ① nơ-ron & MLP — forward pass tự cài (weighted sum

- ReLU); ② gradient descent tự cài + trực giác lan truyền ngược; ③ CNN/RNN/Transformer —
  convolution 1D tự cài, kiến trúc nào cho dữ liệu nào (nhắc GNN/autoencoder); ④ AI tạo sinh —
  next-token bằng đếm bigram tự cài (LLM/diffusion/GAN/multimodal); ⑤ Naive Bayes & mô hình đồ
  thị xác suất + TỔNG KẾT bản đồ, lối đi tiếp sang hướng chuyên sâu `ai`.

Luật soạn bài giữ nguyên các cổng đã có: sample solution + worked example + predict chạy
python3 thật phải đạt (`lessonsPython.test.ts`); thẻ SRS theo luật `srsCards.test.ts`
(một ý/thẻ, đáp ≥ 40 ký tự); output in ra dùng tiếng Việt KHÔNG DẤU (tiền lệ mọi bài python).

## ④ Tiêu chí chấp nhận (đo được)

- `npm run typecheck` sạch; `npm run lint` (`--max-warnings 0`) sạch.
- `npx vitest run packages/subject-programming` xanh 100% — gồm `lessons.test.ts` (schema),
  `lessonsPython.test.ts` (code chạy thật đạt hết test-case), `courses.test.ts` (mọi
  lessonIds tra ra bài thật), `srsCards.test.ts`.
- Khoá hiện ở `ProgrammingHome` và mở được `/lap-trinh/khoa-hoc/ml` (data-driven, không sửa UI).

## ⑤ Rủi ro, rollout, rollback

- Rủi ro thấp: thêm dữ liệu hằng biên dịch + nới 1 nhánh regex; không migration, không API
  mới. Regex nới thêm `ml` là mở rộng thuần (id cũ không đổi nghĩa).
- Rollout: 1 PR duy nhất (nội dung tĩnh, có cổng CI chấm code thật).
- Rollback: revert PR — không ảnh hưởng dữ liệu người dùng (tiến độ bài `ml-*` nếu đã ghi thì
  nằm im, không phá gì).
