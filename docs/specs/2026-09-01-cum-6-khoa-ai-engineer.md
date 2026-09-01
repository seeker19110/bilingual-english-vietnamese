# Đặc tả: CỤM 6 KHOÁ "Kỹ sư AI thực chiến" — từ Python số 0 đến LLMs & AI Agents

> Ngày 2026-09-01. Nguồn yêu cầu: chủ dự án gửi sơ đồ 6 khoá học (Python/AI Cơ Bản → Toán
> Thiết Yếu cho AI → Machine Learning & Data Science → Deep Learning for CV cơ bản → nâng cao
> → LLMs & AI Agents) kèm yêu cầu "thiết kế những khoá học này, viết đặc tả chi tiết triển
> khai đầy đủ, chèn mô phỏng nếu có".
> Khuôn: `docs/templates/dac-ta-tinh-nang.md`. Tiền lệ trực tiếp: khoá ngắn `ml`
> (`docs/specs/2026-08-31-khoa-hoc-may.md`) — khoá thứ 5 của tầng `courses/`.

## 0. Một câu

Thêm **5 khoá ngắn mới + nâng cấp 1 khoá sẵn có** vào tầng khoá ngắn của môn Lập trình
(`packages/subject-programming/courses/`), tạo thành **chuỗi 6 khoá "Kỹ sư AI thực chiến"**
nối nhau bằng `prerequisites`; mọi bài chấm code đều là **Python thuần chạy thật** (Pyodide ở
trình duyệt + python3 trong CI) — thư viện thật (NumPy/scikit-learn/PyTorch) dạy ở tầng
worked-example/predict, còn phần TỰ CÀI (mô phỏng thuật toán bằng Python thuần) là phần được
chấm, đúng triết lý "tự cài để hiểu ruột" của khoá `ml`.

## 1. Nghiên cứu đầu vào

### 1.1. Bản đồ 6 khoá (từ sơ đồ người dùng gửi)

| #   | Khoá (id đề xuất)                        | Nhãn       | Khối lượng sơ đồ      | Chủ đề chính                                                                |
| --- | ---------------------------------------- | ---------- | --------------------- | --------------------------------------------------------------------------- |
| 01  | Python / AI Cơ Bản (`pyai`)              | CƠ BẢN     | 2 modules · 17 buổi   | Python, lập trình cơ bản, data structures, file & OOP, AI là gì, case study |
| 02  | Toán Thiết Yếu cho AI (`mathai`)         | NỀN TẢNG   | 4 modules · 13 buổi   | Xác suất, thống kê, đại số tuyến tính, giải tích, tối ưu hoá                |
| 03  | Machine Learning & Data Science (`mlds`) | CỐT LÕI    | 17 buổi · 7 project   | ML, DS, scikit-learn, NLP, CV, time series, recommendation                  |
| 04  | Deep Learning for CV cơ bản (`cv1`)      | CHUYÊN SÂU | 3 giai đoạn · 14 buổi | NN/CNN, PyTorch, transfer learning, Docker                                  |
| 05  | Deep Learning for CV nâng cao (`cv2`)    | NÂNG CAO   | 4 giai đoạn · 14 buổi | Transformer, ViT, object detection, GAN, diffusion                          |
| 06  | LLMs & AI Agents (`llmagent`)            | MỚI 2026   | 6 chủ đề · 14 buổi    | NLP fundamentals, Transformer & LLMs, RAG, AI agents, deployment            |

### 1.2. Vì sao là KHOÁ NGẮN (tầng `courses/`), không phải hướng chuyên sâu hay lộ trình mới

- Hướng chuyên sâu `ai` (specializations) đã là bản đồ NGHỀ 4 chặng S1–S4; lộ trình
  `principal-ai` đã là tầng LẮP GHÉP chặng. Cả hai không có tầng BÀI HỌC 8 bước vào thẳng
  cho người học theo "khoá" — đúng khoảng trống mà tầng khoá ngắn sinh ra để lấp (tiền lệ
  khoá `ml`).
- Sơ đồ người dùng gửi là 6 khoá RỜI có thứ tự gợi ý — khớp 1-1 với `ShortCourse` +
  `prerequisites` (chuỗi hoá bằng điều kiện vào, không cần kiểu dữ liệu mới).
- Khoá 03 TRÙNG một phần với khoá `ml` sẵn có (bản đồ ML). Luật số 1 của tầng khoá ngắn:
  **tham chiếu, không nhúng** — khoá `mlds` sẽ THAM CHIẾU lại các bài `ml-u1..u3` cho phần
  bản đồ ML, chỉ soạn mới phần Data Science thực chiến + 7 project. Không có bản sao nào.
- Toán: `mathforcode` (môn Toán + hướng nền) đã có S4 "giải tích & tối ưu cho AI/ML". Khoá
  `mathai` đứng ở tầng khoá ngắn với trọng tâm KHÁC (xác suất/thống kê/đại số tuyến tính cho
  AI, 8 bước + SRS); bài tổng kết ghi lối đi tiếp sang `mathforcode` — không nhúng lại.

### 1.3. Hiện trạng hạ tầng (đo thật từ mã nguồn 2026-09-01)

| Thứ                                        | Số thật hôm nay                                                                    |
| ------------------------------------------ | ---------------------------------------------------------------------------------- |
| Tầng khoá ngắn                             | 5 khoá: git · hermes · vibe · openclaw · ml — thêm khoá = 1 file + 1 dòng registry |
| Trang khoá `/lap-trinh/khoa-hoc/:courseId` | ĐÃ CÓ, data-driven — khoá mới tự hiện ở `ProgrammingHome`                          |
| Khuôn bài 8 bước + SRS                     | ĐÃ CÓ (`lessonTypes.ts`), khoá `ml` là tiền lệ python thuần                        |
| Bộ chạy + cổng chấm `python`               | ĐÃ CÓ: Pyodide trình duyệt + `lessonsPython.test.ts` chạy python3 thật trong CI    |
| Regex `lessonId`                           | `(git\|hermes\|vibe\|openclaw\|ml)-u\d+-l\d+` ở 4 chỗ — nới thêm 5 tiền tố mới     |
| Simulator mới                              | KHÔNG CẦN — "mô phỏng" = tự cài thuật toán bằng Python thuần (xem §1.4)            |
| Bài dùng lại được                          | 15 bài `ml-u1..u3` (tham chiếu trong `mlds`); phần còn lại soạn mới                |

### 1.4. "Mô phỏng" nghĩa là gì trong cụm khoá này (quyết định thiết kế)

Pyodide KHÔNG cài được PyTorch/TensorFlow, và CI chấm bằng python3 thuần — nên "mô phỏng"
được chốt là: **mỗi khái niệm cốt lõi có một bản TỰ CÀI chạy được bằng Python thuần** (list +
vòng lặp, không numpy), người học sửa/điền và được chấm bằng test-case thật. Thư viện thật
xuất hiện ở bước worked-example (đọc code mẫu PyTorch/sklearn) và bước predict/quiz (đoán
output, chọn API đúng) — KHÔNG nằm trong code được chấm. Danh sách mô phỏng bắt buộc:

- `pyai`: máy đoán số (vòng lặp phản hồi) · bộ phân loại luật-viết-tay vs học-từ-dữ-liệu.
- `mathai`: mô phỏng tung xu/định lý giới hạn trung tâm (đếm tần suất) · nhân ma trận tự cài ·
  đạo hàm số (finite difference) · gradient descent 1 biến rồi 2 biến.
- `mlds`: pipeline train/test tự cài · TF-IDF mini · trung bình trượt cho time series ·
  gợi ý phim bằng lọc cộng tác user-based (cosine tự cài).
- `cv1`: ảnh = ma trận số (grayscale ASCII render) · convolution 2D tự cài · pooling ·
  forward pass MLP→CNN · vòng lặp huấn luyện với learning rate.
- `cv2`: attention 1 đầu tự cài (Q·K→softmax→V) · IoU + non-max suppression tự cài ·
  mô phỏng vòng khuếch tán (thêm nhiễu/khử nhiễu trên vector nhỏ) · GAN 2 người chơi trên
  phân phối 1 chiều.
- `llmagent`: tokenizer BPE mini · next-token bigram→trigram · embedding + cosine retrieval
  (RAG mini trên 10 đoạn văn) · vòng lặp agent ReAct (nghĩ→gọi tool→quan sát) với tool là
  hàm Python thật · đếm token/chi phí.

Mọi output in ra dùng tiếng Việt KHÔNG DẤU (tiền lệ mọi bài python — Pyodide/CI chấm y hệt).

## ② Phạm vi

**LÀM (5 đợt PR, xem §⑥):**

- 5 file khoá mới `courses/{pyai,mathai,mlds,cv1,cv2,llmagent}.ts` (6 id — `mlds` là file mới,
  khoá `ml` giữ nguyên) + nới `ShortCourseId` + đăng ký `registry.ts`.
- ~22 file bài học mới trong `lessons/` (5 bài/unit — xem cấu trúc §③): `pyaiu1..u4`,
  `mathaiu1..u3`, `mldsu1..u3`, `cv1u1..u3`, `cv2u1..u3`, `llmagentu1..u3` + test tương ứng.
- Nới regex lessonId ở đúng 4 chỗ đã biết: `lessonTypes.ts` (id + unitId),
  `apps/server/src/api/subjects/programming/progress.ts`, `.../feedback.ts`.
- Trường mới KHÔNG cần — `ShortCourse` hiện tại đủ (thứ tự chuỗi thể hiện qua
  `prerequisites` dạng chữ, như tiền lệ).
- Đặc tả này + changelog mỗi đợt.

**KHÔNG làm:**

- KHÔNG simulator/runner mới, KHÔNG UI/route mới, KHÔNG đổi schema DB.
- KHÔNG thư viện Python ngoài trong code được chấm (numpy/sklearn/torch chỉ ở worked example).
- KHÔNG đụng khoá `ml`, hướng `ai`, lộ trình `principal-ai`, `mathforcode` — chỉ THAM CHIẾU.
- KHÔNG kiểu dữ liệu "track/chuỗi khoá" mới ở đợt này (nếu sau muốn UI vẽ chuỗi 6 khoá thành
  sơ đồ như ảnh, đó là đặc tả UI riêng).

## ③ Cấu trúc chi tiết từng khoá

Quy ước chung: mỗi bài đủ 8 bước + ≥ 2 thẻ SRS (một ý/thẻ, đáp ≥ 40 ký tự); bài có code thì
sample solution + worked example + predict phải chạy python3 đạt (`lessonsPython.test.ts`).

### 03a. KHOÁ 01 — `pyai` · "Python / AI Cơ Bản" (4 chương × 4–5 bài = 17 bài)

- `canDo`: "Viết được chương trình Python có hàm, cấu trúc dữ liệu, file và lớp; nói được AI
  học từ dữ liệu khác gì luật viết tay, qua 2 case study tự chạy."
- `prerequisites: []` — cửa vào của cả chuỗi. Bài 1 nhắc: ai muốn học Python kỹ hơn nữa thì
  song song bậc P1 xương sống.

**C1 — Python nhập môn** (`pyai-u1`, 5 bài): ① biến & kiểu & print — chương trình đầu tiên;
② điều kiện if/else — máy phân loại điểm; ③ vòng lặp — máy đoán số (mô phỏng vòng phản hồi:
đoán → so sánh → thu hẹp); ④ hàm — tách việc, tham số, giá trị trả về; ⑤ chuỗi & định dạng —
làm sạch input người dùng.

**C2 — Cấu trúc dữ liệu & file & OOP** (`pyai-u2`, 5 bài): ① list & vòng lặp qua dữ liệu —
tính trung bình/max tự cài; ② dict — đếm tần suất từ (nền cho NLP sau này); ③ đọc/ghi file —
CSV tách bằng split, không thư viện; ④ lớp & đối tượng — lớp `HocVien` có phương thức;
⑤ tổ chức chương trình — module hoá + xử lý lỗi try/except.

**C3 — AI là gì** (`pyai-u3`, 4 bài): ① luật viết tay vs học từ dữ liệu — cùng bài toán lọc
thư rác giải 2 cách (mô phỏng: đếm từ khoá vs ngưỡng học từ dữ liệu đếm được); ② bản đồ
AI/ML/DL/GenAI — quan hệ bao nhau, quiz phân loại ví dụ thật; ③ vòng đời một dự án AI — dữ
liệu → huấn luyện → đánh giá → triển khai (predict từng bước); ④ đạo đức & giới hạn — bias
từ dữ liệu, ảo giác, khi nào KHÔNG dùng AI.

**C4 — Case study chạy thật** (`pyai-u4`, 3 bài): ① case study 1: máy gợi ý món ăn theo
ngân sách (luật + dữ liệu, code chấm thật); ② case study 2: chấm cảm xúc câu tiếng Việt
không dấu bằng từ điển điểm (tiền thân sentiment analysis); ③ tổng kết + bản đồ 5 khoá tiếp
theo của chuỗi.

### 03b. KHOÁ 02 — `mathai` · "Toán Thiết Yếu cho AI" (3 chương × 4–5 bài = 13 bài)

- `canDo`: "Tự cài được nhân ma trận, tính được xác suất/kỳ vọng, lấy đạo hàm số và chạy
  gradient descent hội tụ — đọc hiểu công thức trong tài liệu ML không còn sợ."
- `prerequisites: ['Khoá Python / AI Cơ Bản (pyai) hoặc biết Python căn bản']`.

**C1 — Xác suất & thống kê** (`mathai-u1`, 5 bài): ① xác suất từ đếm — mô phỏng tung xu
10.000 lần, tần suất tiến về 0,5; ② xác suất có điều kiện & Bayes — bài toán xét nghiệm bệnh
tự tính; ③ biến ngẫu nhiên, kỳ vọng, phương sai — tự cài mean/var; ④ phân phối thường gặp —
đều/nhị thức/chuẩn, mô phỏng định lý giới hạn trung tâm (cộng nhiều biến đều → hình chuông);
⑤ thống kê mô tả cho dữ liệu thật — median/percentile/chuẩn hoá z-score tự cài.

**C2 — Đại số tuyến tính** (`mathai-u2`, 4 bài): ① vector — cộng, nhân vô hướng, dot
product, ý nghĩa hình học; ② ma trận & nhân ma trận tự cài 3 vòng lặp — vì sao NN toàn nhân
ma trận; ③ cosine similarity — đo độ giống 2 vector (nền của embedding/RAG); ④ trực giác
trị riêng & PCA — phương sai theo trục (nối lại bài `ml-u2-l3`).

**C3 — Giải tích & tối ưu hoá** (`mathai-u3`, 4 bài): ① đạo hàm = tốc độ đổi — tính đạo hàm
số finite difference tự cài; ② đạo hàm riêng & gradient — mặt lỗi 2 biến; ③ gradient descent
tự cài — tìm đáy parabol, thấy learning rate quá to thì văng; ④ tối ưu trong ML thật — hàm
mất mát MSE, mini-batch, local minimum + tổng kết (lối đi tiếp: hướng nền `mathforcode` S4).

### 03c. KHOÁ 03 — `mlds` · "Machine Learning & Data Science" (4 chương = 17 bài, 7 project)

- `canDo`: "Đi trọn pipeline dữ liệu thật: làm sạch → khám phá → train/đánh giá mô hình →
  7 project nhỏ phủ NLP, ảnh, chuỗi thời gian và hệ gợi ý — tự cài lõi, đọc được code sklearn."
- `prerequisites: ['Khoá Toán Thiết Yếu cho AI (mathai)', 'Khoá Python / AI Cơ Bản (pyai)']`.
- **Tham chiếu 10 bài sẵn có** của khoá `ml` (C1–C2 dưới đây) — không soạn lại, không nhúng.

**C1 — Bản đồ ML & học có giám sát** = `lessonIds: ['ml-u1-l1'..'ml-u1-l5']` (sẵn có).

**C2 — Học không giám sát** = `lessonIds: ['ml-u2-l1'..'ml-u2-l5']` (sẵn có).

**C3 — Data Science thực chiến** (`mlds-u1`, 4 bài MỚI): ① làm sạch dữ liệu — thiếu, trùng,
ngoại lai (IQR tự cài); ② khám phá dữ liệu (EDA) — group-by/pivot tự cài bằng dict; ③ feature
engineering — one-hot, binning, chuẩn hoá, rò rỉ dữ liệu (leakage) là gì; ④ đánh giá cho đúng
— precision/recall/F1/confusion matrix tự cài, vì sao accuracy lừa người khi lệch lớp.

**C4 — 7 project nhỏ** (`mlds-u2` 5 bài + `mlds-u3` 3 bài, MỚI — mỗi bài 1 project trọn gói
trong khuôn 8 bước, dữ liệu nhúng sẵn trong đề): ① dự đoán giá nhà mini (hồi quy, đánh giá
MAE); ② duyệt khoản vay (phân loại + confusion matrix, bàn về công bằng); ③ phân cụm khách
hàng (k-means dùng lại từ `ml`, diễn giải cụm); ④ NLP: lọc thư rác Naive Bayes tự cài trên
bag-of-words; ⑤ CV: nhận chữ số 0/1 trên ảnh 5×5 nhúng sẵn bằng k-NN pixel; ⑥ time series:
trung bình trượt + dự báo naive theo mùa, đánh giá MAPE; ⑦ recommendation: lọc cộng tác
user-based bằng cosine (mô phỏng "người giống bạn cũng thích") + tổng kết — đọc bản dịch
sklearn của cả 7 project ở worked example, lối đi tiếp sang hướng `ai`/`data`.

### 03d. KHOÁ 04 — `cv1` · "Deep Learning for Computer Vision cơ bản" (3 chương = 14 bài)

- `canDo`: "Giải thích và TỰ CÀI được forward pass của MLP và CNN (convolution/pooling),
  chạy được vòng huấn luyện gradient descent trên bài toán ảnh nhỏ; đọc hiểu code PyTorch
  tương đương và biết Docker đóng gói mô hình để làm gì."
- `prerequisites: ['Khoá Machine Learning & Data Science (mlds)']`.

**GĐ1 — Nơ-ron & mạng MLP** (`cv1-u1`, 5 bài): ① ảnh = ma trận số — nạp ảnh grayscale 8×8
nhúng sẵn, render ASCII (mô phỏng "máy nhìn thấy gì"); ② nơ-ron nhân tạo — weighted sum +
bias + ReLU/sigmoid tự cài; ③ MLP forward pass — 2 lớp, nhân ma trận từ `mathai`; ④ hàm mất
mát & softmax + cross-entropy trực giác; ⑤ lan truyền ngược mức trực giác — chain rule trên
mạng 2 nơ-ron, kiểm bằng đạo hàm số.

**GĐ2 — CNN** (`cv1-u2`, 5 bài): ① convolution 2D tự cài — kernel dò cạnh chạy trên ảnh
8×8 (mô phỏng lọc ảnh: thấy output là bản đồ cạnh); ② padding & stride & pooling tự cài;
③ kiến trúc CNN — conv→pool→conv→pool→FC, đếm tham số tay; ④ vòng huấn luyện đầy đủ tự cài
trên bài phân biệt sọc ngang/dọc 5×5 (mô phỏng: loss giảm dần qua epoch, in bảng); ⑤ augment
& overfit trên ảnh — lật/dịch, early stopping.

**GĐ3 — PyTorch, transfer learning & Docker** (`cv1-u3`, 4 bài): ① đọc PyTorch — dịch mạng
tự cài GĐ2 sang `nn.Module` (worked example, quiz đối chiếu từng dòng; code chấm là bản thuần);
② transfer learning — đóng băng backbone, thay đầu phân loại, vì sao ít dữ liệu vẫn được;
③ đánh giá mô hình ảnh — confusion matrix trên ảnh, sai ở đâu nhìn ở đó; ④ Docker & triển
khai — vì sao đóng gói, Dockerfile mẫu cho API dự đoán (predict từng lệnh) + tổng kết.

### 03e. KHOÁ 05 — `cv2` · "Deep Learning for CV nâng cao" (4 chương = 14 bài)

- `canDo`: "Tự cài được attention một đầu và giải thích ViT; tự cài IoU + NMS của object
  detection; giải thích và mô phỏng được GAN, diffusion — đọc hiểu paper/kiến trúc CV 2026."
- `prerequisites: ['Khoá Deep Learning for CV cơ bản (cv1)']`.

**GĐ1 — Transformer & ViT** (`cv2-u1`, 4 bài): ① vì sao cần attention — giới hạn CNN/RNN;
② self-attention một đầu TỰ CÀI (Q·K→scale→softmax→V trên 3 vector nhỏ — mô phỏng bảng
trọng số chú ý in ra được); ③ multi-head + positional encoding trực giác; ④ ViT — cắt ảnh
thành patch = "từ", so kiến trúc với CNN, khi nào ViT thắng.

**GĐ2 — Object detection** (`cv2-u2`, 4 bài): ① bài toán phát hiện vật — box, lớp, điểm
tin cậy; ② IoU tự cài — đo 2 box trùng nhau bao nhiêu; ③ non-max suppression tự cài (mô
phỏng: 5 box chồng nhau → còn 2); ④ dòng họ mô hình — hai pha (R-CNN) vs một pha
(YOLO/SSD/DETR), chọn theo bài toán.

**GĐ3 — Mô hình sinh ảnh** (`cv2-u3`, 4 bài): ① GAN — trò chơi 2 người, mô phỏng generator/
discriminator trên phân phối 1 chiều (đếm được generator "học ra" phân phối thật); ② vì sao
GAN khó huấn luyện — mode collapse; ③ diffusion — mô phỏng thêm nhiễu dần/khử nhiễu dần trên
vector 8 phần tử, in từng bước; ④ bức tranh sinh ảnh 2026 — diffusion vs GAN vs autoregressive,
điều khiển bằng văn bản (CLIP ở mức bản đồ).

**GĐ4 — Tổng hợp** (`cv2` chương 4, 2 bài — nằm cuối `cv2-u3` file thứ 3 hoặc file `cv2u4`
nhỏ): ① project: pipeline nhận diện tổng hợp — nối conv (cv1) + attention + NMS thành bộ dò
"vật sáng" trên ảnh 8×8 nhúng sẵn; ② tổng kết + lối đi tiếp (hướng `ai` S3, khoá `llmagent`).

> Ghi chú soạn: 4 "giai đoạn" của sơ đồ = 4 chương; file bài học vẫn 3–4 file `cv2u1..u4`
> (4+4+4+2 = 14 bài).

### 03f. KHOÁ 06 — `llmagent` · "LLMs & AI Agents" (3 chương = 14 bài)

- `canDo`: "Tự cài tokenizer + sinh next-token + RAG mini + vòng lặp agent ReAct chạy thật
  bằng Python thuần; thiết kế được hệ RAG/agent thực tế và nói được chi phí, giới hạn, cách
  triển khai."
- `prerequisites: ['Khoá Deep Learning for CV cơ bản (cv1) hoặc nắm vững MLP/attention']`.

**C1 — NLP → LLM** (`llmagent-u1`, 5 bài): ① văn bản thành số — tokenizer BPE mini tự cài
(mô phỏng: xem từ hiếm bị cắt thành mảnh); ② embedding — nghĩa là vector, cosine từ `mathai`,
"vua − đàn ông + đàn bà ≈ hậu"; ③ mô hình ngôn ngữ — next-token bigram→trigram tự cài, sinh
văn bản (mô phỏng sinh chữ chạy được); ④ từ n-gram đến Transformer — attention (nối `cv2-u1`
nếu đã học, tự đủ nếu chưa) + pretraining/fine-tuning/RLHF ở mức bản đồ; ⑤ prompt & giới hạn
— few-shot, ảo giác, cửa sổ ngữ cảnh, đếm token/chi phí tự tính.

**C2 — RAG** (`llmagent-u2`, 4 bài): ① vì sao RAG — kiến thức đóng băng vs tra cứu; ② RAG
mini TỰ CÀI: 10 đoạn văn nhúng sẵn → "embedding" bằng vector tần suất từ → cosine → lấy top-2
làm ngữ cảnh (mô phỏng trọn pipeline chạy được); ③ chunking & đánh giá retrieval —
precision@k tự tính, chunk to/nhỏ đánh đổi gì; ④ RAG sản xuất — vector DB, hybrid search,
rerank ở mức bản đồ (đối chiếu worked example kiến trúc thật của chính app này: `/api/agent`).

**C3 — AI Agents & triển khai** (`llmagent-u3`, 5 bài): ① agent là gì — vòng lặp
nghĩ→hành động→quan sát; ② agent ReAct TỰ CÀI: bộ điều phối chọn tool (`tinh_toan`,
`tra_tu_dien` — hàm Python thật) theo từ khoá, chạy tới khi ra đáp án (mô phỏng agent chạy
thật không cần API); ③ tool use & MCP & multi-agent ở mức bản đồ — hợp đồng tool, khi nào
nhiều agent; ④ đánh giá & an toàn agent — eval theo kịch bản, prompt injection, quyền tối
thiểu; ⑤ triển khai — stream, cache, retry/fallback, log chi phí + TỔNG KẾT CHUỖI 6 KHOÁ
(lối đi tiếp: lộ trình `principal-ai`).

## ④ Hợp đồng vào–ra & điểm chạm file

| Việc                                    | File                                                                                                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6 khoá mới                              | `packages/subject-programming/courses/{pyai,mathai,mlds,cv1,cv2,llmagent}.ts`                                                                              |
| Nới id                                  | `courses/types.ts` — `ShortCourseId` thêm 6 giá trị                                                                                                        |
| Đăng ký                                 | `courses/registry.ts` — 6 import + 6 phần tử, THỨ TỰ như bảng §1.1                                                                                         |
| Bài học mới (~22 file + test)           | `lessons/pyaiu1..4.ts`, `mathaiu1..3.ts`, `mldsu1..3.ts`, `cv1u1..3.ts`, `cv2u1..4.ts`, `llmagentu1..3.ts` + đăng ký `lessons.ts` + `lessonsPyai.test.ts`… |
| Nới regex lessonId (4 chỗ, như khoá ml) | `lessonTypes.ts` (id + unitId) · `apps/server/src/api/subjects/programming/progress.ts` · `.../feedback.ts`                                                |

Bất biến giữ nguyên (test canh đã có): mọi `lessonIds` của khoá tra ra bài thật
(`courses.test.ts`) · schema bài 8 bước (`lessons.test.ts`) · code python chạy đạt
(`lessonsPython.test.ts`) · luật thẻ SRS (`srsCards.test.ts`).

## ⑤ Tiêu chí chấp nhận (đo được, cho MỖI đợt PR)

- `npm run typecheck` + `npm run lint` (0 cảnh báo) + `npm test` xanh.
- `npx vitest run packages/subject-programming` xanh 100% — mọi bài code mới chạy python3
  thật đạt hết test-case; mọi mô phỏng §1.4 nằm trong sample solution chạy được (không phải
  pseudo-code).
- Khoá hiện ở `ProgrammingHome`, mở được `/lap-trinh/khoa-hoc/<id>` (data-driven, không sửa UI).
- Khoá `mlds` không nhúng lại nội dung `ml` — C1/C2 chỉ là mảng id (`ml-u1-l1`…).
- Không đụng prompt AI (`feedbackPrompt.ts`) — KHÔNG cần chạy lại eval.

## ⑥ Kế hoạch chia đợt (mỗi đợt một PR trọn vẹn, theo đúng thứ tự)

1. **Đợt 1 — `pyai`** (17 bài): cửa vào chuỗi, nhiều bài nhất nhưng dễ nhất.
2. **Đợt 2 — `mathai`** (13 bài).
3. **Đợt 3 — `mlds`** (7 bài mới + tham chiếu 10 bài `ml`).
4. **Đợt 4 — `cv1`** (14 bài).
5. **Đợt 5 — `cv2` + `llmagent`** (14 + 14 bài — tách 2 PR nếu quá lớn).

Mỗi đợt: file khoá + file bài + nới regex (đợt 1 nới luôn cả 6 tiền tố để 4 đợt sau không
đụng lại 4 chỗ regex) + changelog.

## ⑦ Rủi ro, rollout, rollback

- Rủi ro thấp: toàn dữ liệu hằng biên dịch + nới regex mở rộng thuần; không migration,
  không API mới, không đổi hành vi bài cũ.
- Rủi ro nội dung: 89 bài mới là khối lượng soạn lớn → chia 5 đợt, mỗi đợt có cổng CI chấm
  code thật nên chất lượng không trôi.
- Rollback: revert PR từng đợt — tiến độ bài đã ghi của người dùng nằm bảng sẵn có, không sao.
