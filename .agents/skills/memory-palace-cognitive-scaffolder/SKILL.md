---
name: memory-palace-cognitive-scaffolder
description: 'Kỹ năng Nghiệp vụ Cung điện Trí nhớ Không gian (Method of Loci), Điều tiết Trạng thái Dòng chảy (Flow State), Hợp nhất Ký ức Giấc ngủ REM, và Phản tỉnh Nhận thức Socratic (Metacognitive Journal). Kích hoạt khi kiến tạo không gian ghi nhớ Loci, tính toán tải nhận thức CLI, phát hiện bẫy tư duy, và củng cố trí nhớ dài hạn.'
---

# MEMORY PALACE & COGNITIVE SCAFFOLDER V7.0

Bộ quy chuẩn kiến tạo không gian ghi nhớ siêu trí nhớ (Method of Loci), điều tiết tải nhận thức thời gian thực và củng cố trí nhớ ngầm trong hệ sinh thái Đồng Hành.

---

## 1. CUNG ĐIỆN TRÍ NHỚ KHÔNG GIAN (SPATIAL METHOD OF LOCI)

`packages/core-ai/memoryPalaceService.ts`, `apps/english/src/components/MemoryPalace/`:

```
[Khái Niệm Trừu Tượng / Từ Vựng C1-C2]
                 │
                 ▼
[Phân Tích Ngũ Quan & Liên Tưởng Dị Biệt (Absurd Mnemonics)]
                 │
                 ▼
[Ánh Xạ Vào Điểm Neo Không Gian (Locus Anchors)]
  ├── 1. Điểm Neo Thị Giác (Visual Monument)
  ├── 2. Điểm Neo Thính Giác (Auditory Echo)
  ├── 3. Điểm Neo Xúc Giác (Tactile Relic)
  └── 4. Biểu Tượng Tự Sự (Narrative Symbol)
                 │
                 ▼
[Cung Điện Trí Nhớ 3D / Isometric View] ──► [Truy Xuất Vĩnh Cửu]
```

### 5 Chủ Đề Không Gian Cung Điện (Palace Themes):

1. **Knowledge Library:** Dành cho từ vựng học thuật và khái niệm khoa học.
2. **Debate Sanctuary:** Dành cho cấu trúc lập luận Toulmin và kỹ năng phản biện.
3. **Philosophical Atrium:** Dành cho tư duy phản tỉnh và triết học ứng dụng.
4. **STEM Laboratory:** Dành cho công thức toán học, vật lý và phản ứng hóa học.
5. **Zen Garden:** Dành cho tĩnh tâm, cân bằng cảm xúc và giảm căng thẳng nhận thức.

---

## 2. ĐIỀU TIẾT TẢI NHẬN THỨC & TRẠNG THÁI DÒNG CHẢY (COGNITIVE LOAD & FLOW STATE)

`packages/core-personal/cognitiveLoadRegulator.ts`:

- **Chỉ Số Tải Nhận Thức (Cognitive Load Index - CLI):**
  $$CLI = w_1 \cdot \text{Latency} + w_2 \cdot \text{RevisionRate} + w_3 \cdot \text{HesitationPauses} + w_4 \cdot \text{RecentErrorRate}$$
- **Duy Trì Vùng Dòng Chảy Tối Ưu (Flow State Zone — Mihaly Csikszentmihalyi):**
  - **Khi Quá Tải ($CLI > 0.75$):** Tự động hạ độ khó bài tập, cung cấp gợi ý Socratic bước đệm hoặc đề xuất nghỉ vi mô 30 giây (Micro-break).
  - **Khi Nhàm Chán ($CLI < 0.25$ và đúng liên tục):** Tự động nâng cao thử thách (IELTS C1/C2, phản xạ thời gian ngắn) để duy trì sự hưng phấn trí tuệ.

---

## 3. HỢP NHẤT TRÍ NHỚ CHU TRÌNH REM (AUTONOMOUS REM CONSOLIDATION)

`packages/core-personal/remConsolidationService.ts`, `api/proactive-briefing.ts`:

- **Mô Hình Đường Cong Lãng Quên Ebbinghaus / FSRS:**
  $$R(t) = e^{-t / S}$$
  Trong đó: $R$ là xác suất nhớ lại (Retrievability), $S$ là độ bền ký ức (Stability), $t$ là số ngày trôi qua.
- **Tối Ưu Điểm Chạm Ôn Tập:** Tự động kích hoạt bài ôn tập ngay khi độ bền ký ức chạm ngưỡng $R \approx 90\%$, tối đa hóa hiệu suất chuyển đổi sang trí nhớ dài hạn (Long-term Potentiation).
- **Morning Briefing Tự Hành:** Tổng hợp bản tin chào buổi sáng cá nhân hóa trước khi người dùng thức giấc.

---

## 4. NHẬT KÝ PHẢN TỈNH NHẬN THỨC SOCRATIC (METACOGNITIVE REFLECTIVE JOURNAL)

`packages/core-personal/metacognitiveReflectionService.ts`, `apps/english/src/components/MetacognitiveReflection/`:

1. **Đo Lường Chỉ Số Tự Nhận Thức (MAI - Metacognitive Awareness Index):**
   - Đánh giá khả năng tự nhận diện điểm mạnh, điểm yếu và chiến lược học tập của bản thân.
2. **Rà Soát 7 Bẫy Tư Duy Kinh Điển (Cognitive Bias Detection):**
   - _Dunning-Kruger (Ảo tưởng năng lực)_
   - _Confirmation Bias (Thiên kiến xác nhận)_
   - _Sunk Cost Fallacy (Chi phí chìm)_
   - _Imposter Syndrome (Hội chứng kẻ giả mạo)_
   - _Overconfidence (Tự tin thái quá)_
   - _Analysis Paralysis (Tê liệt phân tích)_
   - _Status Quo Bias (Thiên kiến giữ nguyên hiện trạng)_
3. **Trích Xuất Khoảnh Khắc "Aha!" (Epiphany Moments):** Ghi nhận những bước ngoặt thấu suốt mô hình tư duy vào Sổ cái Quyết định.
