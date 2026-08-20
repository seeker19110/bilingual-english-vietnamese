---
name: pedagogy-linguistics-master
description: 'Kỹ năng nghiệp vụ Sư phạm Song ngữ (Việt ⇄ Anh) và Ngôn ngữ học Ứng dụng đỉnh cao theo chuẩn quốc tế (CEFR A1-C2, IELTS Speaking/Writing Band 9, CAT IRT 3PL, Bayesian Knowledge Tracing DAG, Socratic Scaffolding, IPA Phonetics GOP, Echo Shadowing, Memory Palace Loci, Toulmin Debate). Kích hoạt khi thiết kế hoặc xử lý logic dạy học, chấm điểm, sửa lỗi, lộ trình, phát âm, từ vựng và hội thoại AI.'
---

# PEDAGOGY & APPLIED LINGUISTICS MASTER V7.0 — TIÊU CHUẨN SƯ PHẠM ĐỈNH CAO

Tài liệu này là quy chuẩn nghiệp vụ Sư phạm & Ngôn ngữ học Ứng dụng bắt buộc cho toàn bộ các tính năng Gia sư AI, Đấu trường Tranh biện và Bạn Đồng Hành trong hệ sinh thái Đồng Hành.

---

## 1. NGUYÊN TẮC SƯ PHẠM SONG NGỮ BẤT BIẾN (BILINGUAL DUAL-VOICE PEDAGOGY)

Hệ sinh thái vận hành theo hai chiều học phân biệt (`lib/direction.ts`):

```
[Chiều A: Người Việt học Tiếng Anh]
  ├── Hội thoại & Mẫu câu: Giọng bản ngữ Anh chuẩn (UK/US Accent)
  └── Sửa lỗi, Giải thích Ngữ pháp & Động viên: Giọng tiếng Việt ấm áp, tự nhiên

[Chiều B: Người Nước Ngoài học Tiếng Việt qua Tiếng Anh]
  ├── Hội thoại & Mẫu câu: Giọng chuẩn Tiếng Việt (Bắc/Nam truyền cảm)
  └── Sửa lỗi & Giải thích: Giọng tiếng Anh rõ ràng, dễ hiểu
```

### Quy tắc phản hồi 3 nhịp Sư phạm:

1. **Khích lệ & Công nhận (Acknowledge & Encourage):** Đón nhận ý tưởng của học viên trước khi sửa lỗi để giữ vững tâm lý tự tin (Affective Filter Hypothesis - Krashen).
2. **Sửa lỗi Tinh tế & Giải thích Cơ chế (Precision Correction):** Chỉ ra điểm chưa chuẩn (Ngữ pháp, Dùng từ, Ngữ âm), giải thích _nguyên nhân_ bằng tiếng mẹ đẻ của người học kèm ví dụ tương phản (Contrastive Analysis).
3. **Mở rộng Đòn bẩy & Đặt câu hỏi Socratic (Scaffolding & Socratic Prompt):** Cung cấp cấu trúc nâng cao (C1/C2 idioms, collocations) và kết thúc bằng một câu hỏi gợi mở để người học tiếp tục phản xạ.

---

## 2. KHẢO THÍ THÍCH ỨNG & TRUY VẾT LỖ HỔNG TRI THỨC (CAT IRT 3PL & BKT DAG)

### A. Computerized Adaptive Testing (CAT Engine chuẩn IRT 3PL)

- Triển khai mô hình toán học **Item Response Theory (IRT 3PL: 3-Parameter Logistic)**:
  $$P(\theta) = c + \frac{1 - c}{1 + e^{-1.7a(\theta - b)}}$$
  Trong đó: $a$ là độ phân biệt, $b$ là độ khó, $c$ là hệ số đoán mò.
- Thuật toán ước lượng năng lực **Expected A Posteriori (EAP)** cập nhật phân phối chuẩn $N(0, 1)$ sau từng câu hỏi, tự động chọn câu hỏi tối đa hóa hàm thông tin Fisher $I(\theta)$.
- Rút ngắn bài kiểm tra Placement từ 50 câu xuống còn **12–15 câu** mà vẫn đạt độ tin cậy phân loại CEFR $r > 0.92$.

### B. Prerequisite Knowledge DAG & Bayesian Knowledge Tracing (BKT)

- Mô hình hóa toàn bộ tri thức ngữ pháp, ngữ âm và kỹ năng thành đồ thị có hướng không chu trình (**Prerequisite Knowledge DAG** — `packages/core-learner/prerequisiteKnowledgeGraph.ts`).
- Ứng dụng **Bayesian Knowledge Tracing (BKT)** tính toán xác suất làm chủ $P(L_t)$ sau mỗi bài tập:
  $$P(L_t) = P(L_{t-1} | \text{Action}) + (1 - P(L_{t-1} | \text{Action})) \cdot T$$
- **Backtracking Gap Detection:** Khi học viên gặp khó khăn, tự động truy vết ngược đồ thị tiền đề để phát hiện chính xác nút kiến thức nền tảng bị hổng và tự động sinh bài tập bắc cầu (**Bridging Micro-lessons**) bù đắp tức thì.

---

## 3. NGỮ ÂM HỌC ÂM HỌC & LUYỆN NÓI NÂNG CAO (ACOUSTIC GOP & ECHO SHADOWING)

### A. Goodness of Pronunciation (GOP) & Formant Alignment

- Thuật toán đo lường **Goodness of Pronunciation (GOP)** trên từng âm vị (`packages/core-ai/acousticPhoneticsService.ts`).
- Trích xuất phổ Formant $F_1$ (độ mở miệng/chiều cao lưỡi) và $F_2$ (độ tiến/lùi của lưỡi), phát hiện độ lệch cao độ $F_0$ (Pitch Contour Deviation).
- Đặc trị 8 nhóm âm lỗi kinh điển L1 tiếng Việt: `/θ/`, `/ð/`, `/æ/`, `/r/`, `/-ks/`, `/tʃ/`, `/dʒ/`, `/ʃ/`.

### B. Kỹ thuật 3-Phase Echo Shadowing

1. **Phase 1 (Active Listening & Articulatory Mapping):** Nghe audio mẫu bản ngữ, quan sát chuyển động khẩu hình 3D và đồ thị sóng âm.
2. **Phase 2 (Delayed Echo):** Nói đuổi theo audio mẫu với độ trễ tối ưu 0.4s–0.8s, đồng bộ hóa trọng âm câu và nhịp thở.
3. **Phase 3 (Independent Production & Phoneme Scoring):** Thu âm độc lập, đối soát căn chỉnh âm vị (Phoneme Alignment), chỉ ra % tương đồng và từ cần uốn nắn.

---

## 4. KHUNG THAM CHIẾU QUỐC TẾ & TIÊU CHUẨN IELTS BAND 9

### A. Khung CEFR / CEFR-J (A1 $\to$ C2)

- **A1–A2 (Cơ bản):** 1.273–1.559 từ, câu đơn, nhịp độ nói chậm, ngữ pháp thì căn bản.
- **B1–B2 (Độc lập/Tự chủ):** 2.663–2.993 từ, liên kết câu mạch lạc (cohesive devices), phản xạ tự nhiên, câu điều kiện, modal verbs.
- **C1–C2 (Thành thạo/Chuyên gia):** 1.305–2.375 từ, văn phong học thuật, sắc thái biểu cảm tinh tế (nuances), thành ngữ tự nhiên, đảo ngữ, giả định.

### B. Chuẩn Đánh giá IELTS Speaking (4 Tiêu chí Band 9)

1. **Fluency and Coherence (FC):** Mạch lạc, lưu loát, độ ngập ngừng tự nhiên (hesitation for ideas, not language), discourse markers tự nhiên.
2. **Lexical Resource (LR):** Collocations phong phú, idioms chuẩn ngữ cảnh, paraphrase linh hoạt và xử lý từ vựng hiếm (less common lexical items).
3. **Grammatical Range and Accuracy (GRA):** Cấu trúc đa dạng (câu phức, đảo ngữ, rút gọn mệnh đề), độ chính xác tuyệt đối về thì, hòa hợp chủ-vị và giới từ.
4. **Pronunciation (PR):** Đầy đủ âm đuôi (final consonants), trọng âm từ/câu, nối âm (linking), nuốt âm (elision), và ngữ điệu biểu cảm.

---

## 5. MÔ HÌNH TRANH BIỆN TOULMIN & PHẢN BIỆN NHẬN THỨC (METACGONITION)

- **Cấu trúc Luận điểm Toulmin:**
  - **Claim (Khẳng định):** Tuyên bố rõ ràng, súc tích.
  - **Evidence/Data (Bằng chứng):** Dữ liệu, nghiên cứu hoặc ví dụ thực tế.
  - **Warrant (Cơ sở logic):** Cầu nối liên kết bằng chứng với khẳng định.
  - **Backing (Hỗ trợ thêm):** Luận cứ bổ trợ cho Warrant.
  - **Rebuttal/Counter-argument (Phản đề & Bác bỏ):** Dự đoán luận điểm đối lập và vô hiệu hóa logic.
- **Rà soát Ngụy biện Logic (Fallacy Detection):** Tự động phát hiện và phản biện các lỗi ngụy biện: _Ad Hominem (Công kích cá nhân)_, _Straw Man (Ngụy biện bù nhìn)_, _False Dilemma (Nhị nguyên luận sai lầm)_, _Slippery Slope (Dốc trượt không phanh)_, _Circular Reasoning (Lập luận vòng quanh)_.
