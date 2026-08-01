# Kho kiến thức môn SINH HỌC — tiểu học → lớp 12 (bám Chương trình GDPT 2018)

> Ngày: 2026-08-01 · Phục vụ: **GĐ3+** — hoàn thiện bộ ba KHTN (Lý · Hoá · Sinh)
> Đọc trước: `kho-kien-thuc-toan-gdpt2018.md` §0 (nguồn gốc, ranh giới bản quyền, cổng duyệt) và
> `kho-kien-thuc-ly-gdpt2018.md` §0 (**vấn đề môn KHTN tích hợp — áp dụng y hệt cho Sinh**).
> Trạng thái: **bản thảo kỹ thuật — CHƯA DUYỆT CHUYÊN MÔN, chưa được đưa vào `apps/*/src/data/`**

---

## 0. Vị trí môn Sinh + ⚠️ CẢNH BÁO PHẠM VI

| Cấp          | Sinh học nằm ở đâu                                    |
| ------------ | ----------------------------------------------------- |
| Tiểu học 1-3 | Tự nhiên và Xã hội (cây cối, con vật, cơ thể người)   |
| Tiểu học 4-5 | Môn **Khoa học**                                      |
| THCS 6-9     | **Trong môn KHTN** (phân môn Sinh) — không tách riêng |
| THPT 10-12   | **Sinh học là môn riêng**, nhóm môn **lựa chọn**      |

### 0.1 ⚠️ Sinh học KHÁC HẲN Toán/Lý/Hoá về khả năng chấm tự động — đọc kỹ trước khi cam kết

Đây là kết luận quan trọng nhất của file này:

**Sinh học chủ yếu là kiến thức MÔ TẢ, không phải tính toán.** Ước lượng thô tỉ lệ dạng bài:

| Môn  | Bài ra đáp số/biểu thức chấm được bằng thuật toán | Bài mô tả/giải thích (không chấm tự động được) |
| ---- | ------------------------------------------------- | ---------------------------------------------- |
| Toán | ~95%                                              | ~5%                                            |
| Hoá  | ~60%                                              | ~40%                                           |
| Lý   | ~70%                                              | ~30%                                           |
| Sinh | **~15%**                                          | **~85%**                                       |

**Hệ quả thẳng thắn:** engine chấm (`dac-ta-engine-cham-dung-chung.md`) — thứ tạo ra phần lớn giá
trị cho Toán/Lý/Hoá — **gần như vô dụng với Sinh học**. Phần tính toán được của Sinh chỉ gồm
di truyền (tỉ lệ phân li), năng lượng sinh thái, và vài công thức ADN (§3).

**Ba lựa chọn, cần chốt trước khi làm Sinh:**

| PA  | Cách làm                                               | Đánh giá                                                                                      |
| --- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| A   | **Không làm Sinh** ở giai đoạn này                     | Trung thực nhất với thế mạnh sản phẩm (chấm chính xác không cần AI)                           |
| B   | Làm Sinh nhưng **chỉ trắc nghiệm + thẻ ghi nhớ (SRS)** | ✅ **Khuyến nghị** — SRS vốn là thứ app đã làm tốt cho từ vựng tiếng Anh, tái dùng được thẳng |
| C   | Làm đủ, dùng AI chấm phần tự luận                      | ❌ **Vi phạm nguyên tắc đã chốt** "không để AI phán đúng/sai" + đội chi phí AI                |

> ### ✅ ĐÃ CHỐT 2026-08-01 (người dùng duyệt): **PA B** — trắc nghiệm + SRS.
>
> **PA B**, và đây là chỗ có mối nối bất ngờ: **Sinh học về bản chất gần với HỌC TỪ
> VỰNG hơn là với Toán** — đều là "nhớ nhiều khái niệm, ôn lặp lại ngắt quãng". App đã có sẵn
> engine SRS chạy tốt cho tiếng Anh (`apps/english/src/lib/srs.ts`) → **tái dùng cho Sinh rẻ hơn
> nhiều so với xây engine chấm mới**. Cần người dùng xác nhận.

---

## 1. TIỂU HỌC (lớp 1-5)

Thực vật, động vật quanh ta · **cơ thể người** (các giác quan, cơ quan tiêu hoá, hô hấp, tuần
hoàn ở mức nhận biết) · dinh dưỡng, vệ sinh, an toàn · **chuỗi thức ăn** đơn giản · môi trường và
bảo vệ môi trường. **Không có công thức** → trắc nghiệm/ghép nối/quan sát.

---

## 2. THCS (lớp 6-9) — trong môn KHTN

> ✅ **§2 đã được đối chiếu với SGK KHTN 6-9 "Kết nối tri thức" ngày 2026-08-01** — xem
> `docs/research/muc-luc-sgk/khtn-6..9.md` và **Nhật ký đối chiếu §5** cuối file.

| Lớp     | Nội dung phân môn Sinh                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 6 `[✓]` | **Tế bào** (đơn vị cơ bản của sự sống, cấu tạo, phân chia) · phân loại thế giới sống · `[+]` **khoá lưỡng phân** · virus, vi khuẩn, nguyên sinh vật, nấm, thực vật, động vật · đa dạng sinh học · `[+]` **từ tế bào đến cơ thể** (cơ thể đơn bào/đa bào, tế bào → mô → cơ quan → hệ cơ quan)                                                                                                                                                                                                                       |
| 7 `[✓]` | **Trao đổi chất và chuyển hoá năng lượng ở sinh vật**: quang hợp, hô hấp tế bào · `[+]` **trao đổi khí ở sinh vật** · trao đổi nước & chất dinh dưỡng ở thực vật và động vật · **cảm ứng ở sinh vật** · sinh trưởng, phát triển · sinh sản · `[+]` **cơ thể sinh vật là một thể thống nhất** (Bài 42)                                                                                                                                                                                                              |
| 8 `[≠]` | **Cơ thể người** (11 bài): hệ vận động, tiêu hoá, tuần hoàn, hô hấp, bài tiết, `[+]` **điều hoà môi trường trong**, thần kinh & giác quan, nội tiết, `[+]` **da và điều hoà thân nhiệt**, sinh sản · **Sinh vật và môi trường** (7 bài): nhân tố sinh thái, `[+]` **quần thể**, `[+]` **quần xã**, hệ sinh thái, `[+]` **sinh quyển**, `[+]` **cân bằng tự nhiên**, `[+]` **bảo vệ môi trường**                                                                                                                    |
| 9 `[≠]` | **Di truyền học**: `[≠]` **DNA / RNA** (SGK dùng tên quốc tế, không phải ADN/ARN), nucleic acid & gene, tái bản – phiên mã – dịch mã, nhiễm sắc thể · **quy luật Mendel** · nguyên phân, giảm phân · `[+]` **NST giới tính & cơ chế xác định giới tính** · `[+]` **di truyền liên kết** (dạy ngay ở lớp 9, không phải chờ lớp 12) · đột biến gene, đột biến NST · di truyền ở người, `[+]` **ứng dụng công nghệ di truyền** · **tiến hoá** (khái niệm & chọn lọc, cơ chế tiến hoá, phát sinh & phát triển sự sống) |

### 2.1 Phần TÍNH TOÁN được ở THCS (ít, nhưng có)

| Nội dung                     | Công thức                                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| Quy luật Mendel `[✓]`        | Lai một cặp tính trạng: F₂ phân li **3 trội : 1 lặn** (kiểu hình), **1 : 2 : 1** (kiểu gene) |
| Lai hai cặp tính trạng `[✓]` | F₂ phân li **9 : 3 : 3 : 1**                                                                 |
| Nguyên phân `[✓]`            | Từ 1 tế bào qua `k` lần nguyên phân → **`2^k`** tế bào con (đã có mầm ở lớp 6, Bài 20)       |
| Giảm phân `[✓]`              | 1 tế bào sinh dục chín → 4 tế bào con, bộ NST giảm một nửa (`2n → n`)                        |
| **Cấu trúc DNA** `[+]`       | **`A = T`, `G = C`** · `N = 2A + 2G` (Bài 38 — kho cũ chỉ nêu ở lớp 12)                      |
| **Tái bản DNA** `[+]`        | Qua `k` lần → **`2^k`** phân tử (Bài 39)                                                     |
| **Dịch mã** `[+]`            | Số bộ ba mã hoá `= N/6` (Bài 40)                                                             |
| **Xác định giới tính** `[+]` | XX / XY · tỉ lệ phân li giới tính **1 : 1** (Bài 44)                                         |
| **Mật độ quần thể** `[+]`    | Số cá thể / đơn vị diện tích (hoặc thể tích) — KHTN 8 Bài 42                                 |

> **Nhận xét quan trọng cho phạm vi GĐ3:** phần tính toán của Sinh ở THCS **nhiều hơn ước lượng
> ban đầu** — chương XI-XII lớp 9 (di truyền phân tử + NST) có tới 5 nhóm công thức chấm tự động
> được, thay vì chỉ 4 dòng như bản thảo cũ. Tuy vậy kết luận §0.1 (Sinh ~15% chấm được) vẫn giữ:
> 5 nhóm này nằm gọn trong 2/14 chương của lớp 9.

---

## 3. THPT (lớp 10-12) — Sinh học là môn riêng

### Lớp 10 — Sinh học tế bào & vi sinh vật

Thành phần hoá học của tế bào (nước, carbohydrate, lipid, protein, nucleic acid) · cấu trúc tế
bào nhân sơ / nhân thực · **vận chuyển qua màng** (khuếch tán, thẩm thấu, vận chuyển chủ động) ·
**chuyển hoá năng lượng**: enzyme, hô hấp tế bào, quang hợp · **chu kì tế bào**, nguyên phân,
giảm phân · công nghệ tế bào · vi sinh vật, virus, ứng dụng.

### Lớp 11 — Sinh học cơ thể

Trao đổi nước và khoáng ở thực vật · quang hợp và năng suất cây trồng · hô hấp ở thực vật ·
tiêu hoá, hô hấp, tuần hoàn, bài tiết ở động vật · **cân bằng nội môi** · cảm ứng ở thực vật và
động vật · sinh trưởng và phát triển · sinh sản · ứng dụng trong nông nghiệp và y học.

### Lớp 12 — Di truyền, tiến hoá, sinh thái

| Chủ đề             | Kiến thức cốt lõi                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Di truyền phân tử  | ADN, **nhân đôi ADN**, phiên mã, dịch mã · **mã di truyền** (bộ ba, tính thoái hoá) · điều hoà biểu hiện gene                   |
| Di truyền NST      | Quy luật Mendel · liên kết gene, hoán vị gene · di truyền liên kết giới tính · đột biến gene, đột biến NST                      |
| Di truyền quần thể | **Định luật Hardy–Weinberg**: `p² + 2pq + q² = 1`, `p + q = 1` · cấu trúc di truyền quần thể tự phối / ngẫu phối                |
| Ứng dụng           | Di truyền y học · công nghệ gene · tư vấn di truyền                                                                             |
| Tiến hoá           | Bằng chứng tiến hoá · học thuyết Darwin, thuyết tiến hoá tổng hợp hiện đại · **các nhân tố tiến hoá** · hình thành loài         |
| Sinh thái          | Quần thể, quần xã, **hệ sinh thái** · chuỗi và lưới thức ăn · **tháp sinh thái** · chu trình sinh địa hoá · phát triển bền vững |

### 3.1 Phần TÍNH TOÁN được ở THPT — danh sách đầy đủ

Đây là **toàn bộ** những gì engine chấm dùng được cho Sinh học:

| Nội dung                       | Công thức                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Cấu trúc ADN                   | **`A = T`, `G = X`** · tổng nucleotide `N = 2A + 2G` · **chiều dài `L = (N/2) × 3,4 Å`**               |
| Liên kết hydrogen              | **`H = 2A + 3G`**                                                                                      |
| Nhân đôi ADN                   | Qua `k` lần → **`2^k`** phân tử; số nucleotide môi trường cung cấp `= N(2^k − 1)`                      |
| Phiên mã / dịch mã             | Số bộ ba mã hoá `= N/6` · số amino acid trong chuỗi polypeptide `= N/6 − 1`                            |
| Nguyên phân / giảm phân        | Số tế bào con, số NST qua các kì                                                                       |
| **Hardy–Weinberg**             | `p² + 2pq + q² = 1` — tính tần số allele, tần số kiểu gene                                             |
| Quy luật Mendel & hoán vị gene | Tỉ lệ phân li kiểu hình/kiểu gene · **tần số hoán vị gene `f = (số cá thể tái tổ hợp / tổng) × 100%`** |
| Hiệu suất sinh thái            | **`H = (năng lượng bậc sau / năng lượng bậc trước) × 100%`** (thường ~10%)                             |

> Nhận xét: các công thức trên **đều ra đáp số thuần** (số nguyên, phần trăm, chiều dài có đơn
> vị) → engine chấm hiện có **dùng được ngay, không cần bổ sung gì**. Nghĩa là nếu làm Sinh theo
> PA B, phần tính toán này chi phí gần như bằng 0.

---

## 4. Kết luận & khuyến nghị

1. ~~Chốt PA A/B/C ở §0.1~~ **✅ ĐÃ CHỐT: PA B** (2026-08-01) — trắc nghiệm + SRS, cộng phần
   tính toán §3.1 dùng engine chấm sẵn có (`packages/core-grading`, đã viết xong).
2. Sinh học **không cần engine chấm mới** — nó cần **engine SRS**, thứ app đã có và đã chạy tốt
   cho từ vựng tiếng Anh suốt thời gian qua. Đây là chỗ tái dùng rẻ nhất trong toàn bộ kế hoạch
   đa môn.
3. ~~Thứ tự đề xuất cho GĐ3~~ **✅ ĐÃ CHỐT: Hoá → Lý → Sinh** (2026-08-01): — Hoá trước vì cân bằng PTHH chấm chính xác tuyệt đối (tính năng "đinh"),
   Lý sau vì phụ thuộc engine đơn vị/dung sai, Sinh cuối vì mô hình học khác hẳn (SRS chứ không
   phải chấm) nên nên tách ra làm riêng, không trộn nhịp với hai môn kia.
4. ~~Người có chuyên môn (giáo viên Sinh) duyệt §2-§3 đối chiếu SGK "Kết nối tri thức".~~
   **✅ §2 (THCS) ĐÃ ĐỐI CHIẾU 2026-08-01** — xem §5. **§3 (THPT 10-12) vẫn CHƯA đối chiếu** (chưa
   có SGK Sinh học 10-12 trong `tai-lieu-sgk/`). Vẫn cần giáo viên Sinh duyệt lần cuối — xem §5.3.

---

## 5. Nhật ký đối chiếu SGK (2026-08-01)

**Phạm vi đã đối chiếu:** §2 — THCS lớp 6-9, môn KHTN bộ "Kết nối tri thức"
(`tai-lieu-sgk/SGK-KHTN/6..9/`, OCR bằng `scripts/ocr-images.py` + `scripts/ocr-crop.py`). Mục lục
đầy đủ: `docs/research/muc-luc-sgk/khtn-6..9.md`.
**Chưa đối chiếu:** §1 (tiểu học), §3 (THPT 10-12) — chưa có sách trong `tai-lieu-sgk/`.

**Phần Sinh chiếm tỉ trọng lớn nhất trong KHTN THCS:** 22/55 bài lớp 6 · 22/42 bài lớp 7 ·
18/47 bài lớp 8 · 16/51 bài lớp 9. Riêng lớp 7 phần Sinh chiếm **hơn nửa sách**.

### 5.1 Bảng thay đổi — tất cả mục `[≠]` `[+]` `[−]`

| Lớp | Ký hiệu | Nội dung                                                                                    | Đã làm gì                                                                                                          |
| --- | ------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 6   | `[+]`   | **Khoá lưỡng phân** (Bài 26)                                                                | Bổ sung vào §2 lớp 6                                                                                               |
| 6   | `[+]`   | **Từ tế bào đến cơ thể** (chương VI): cơ thể đơn bào/đa bào, tổ chức cơ thể đa bào          | Bổ sung — kho cũ gộp vào "tế bào", SGK có chương riêng                                                             |
| 7   | `[+]`   | **Trao đổi khí ở sinh vật** (Bài 28)                                                        | Bổ sung                                                                                                            |
| 7   | `[+]`   | **Cơ thể sinh vật là một thể thống nhất** (Bài 42)                                          | Bổ sung — bài tổng kết của cả sách, kho cũ thiếu                                                                   |
| 8   | `[+]`   | **Điều hoà môi trường trong của cơ thể người** (Bài 36)                                     | Bổ sung — khái niệm cân bằng nội môi xuất hiện sớm hơn kho cũ ghi (kho xếp ở lớp 11)                               |
| 8   | `[+]`   | **Da và điều hoà thân nhiệt ở người** (Bài 39)                                              | Bổ sung                                                                                                            |
| 8   | `[≠]`   | "Môi trường và hệ sinh thái" gộp 1 dòng → SGK có **chương VIII, 7 bài riêng**               | Chi tiết hoá: nhân tố sinh thái, quần thể, quần xã, hệ sinh thái, sinh quyển, cân bằng tự nhiên, bảo vệ môi trường |
| 8   | `[+]`   | **Mật độ quần thể** — công thức chấm tự động được (Bài 42)                                  | Bổ sung vào §2.1                                                                                                   |
| 9   | `[≠]`   | **"ADN / ARN" → "DNA / RNA"**; **`G = X` → `G = C`**                                        | **SỬA thuật ngữ** — SGK KNTT dùng tên quốc tế (chương XI, Bài 38)                                                  |
| 9   | `[+]`   | **Nucleic acid & gene; tái bản DNA; phiên mã; dịch mã; mối quan hệ gene → tính trạng**      | Chi tiết hoá — kho cũ gộp thành "ADN, gene". SGK dành 4 bài (38-41)                                                |
| 9   | `[+]`   | **Cấu trúc DNA `A = T`, `G = C`, `N = 2A + 2G`; `2^k` phân tử sau tái bản; số bộ ba `N/6`** | Bổ sung vào **§2.1** — kho cũ chỉ nêu các công thức này ở **lớp 12** (§3.1)                                        |
| 9   | `[+]`   | **NST giới tính và cơ chế xác định giới tính** (Bài 44) — tỉ lệ 1 : 1                       | Bổ sung, kể cả vào §2.1 (chấm tự động được)                                                                        |
| 9   | `[≠]`   | **Di truyền liên kết** — kho cũ xếp ở lớp 12                                                | **CHUYỂN xuống lớp 9** (Bài 45). SGK dạy ngay ở THCS                                                               |
| 9   | `[+]`   | **Ứng dụng công nghệ di truyền vào đời sống** (Bài 48)                                      | Bổ sung                                                                                                            |
| 9   | `[≠]`   | "Nguồn gốc sự sống"                                                                         | Sửa tên theo SGK: **"Sự phát sinh và phát triển sự sống trên Trái Đất"** (Bài 51)                                  |

**Tổng cộng: 15 mục** — `[+]` 10 · `[≠]` 5 · `[−]` 0 · phần còn lại `[✓]` giữ nguyên.
Không có mục `[−]` nào: **mọi nội dung kho kiến thức ghi cho THCS đều thật sự có trong SGK**;
vấn đề duy nhất là ghi **quá sơ lược** so với dung lượng thật của sách.

### 5.2 Kết luận cho quyết định PA B (trắc nghiệm + SRS)

Đối chiếu **củng cố PA B**, không làm lung lay:

- Tỉ lệ bài mô tả rất cao đúng như dự đoán — ví dụ lớp 7 có 22 bài Sinh thì 6 bài là **thực hành**
  (không chấm tự động được) và phần lớn còn lại là mô tả cơ chế.
- Nhưng có một **điều chỉnh nhỏ**: phần chấm tự động được ở THCS **nhiều hơn bản thảo cũ ghi** —
  chương XI-XII lớp 9 (DNA, tái bản, dịch mã, NST, giới tính) cho 5 nhóm công thức, cộng mật độ
  quần thể ở lớp 8. Vẫn nằm trong ngưỡng ~15% nên **không cần đổi PA**.

### 5.3 Danh sách cần GIÁO VIÊN CHUYÊN MÔN (Sinh) duyệt lần cuối

1. **Mức độ định lượng của chương XI-XII lớp 9** — SGK có ra bài tập tính `N`, `A/T/G/C`, số bộ
   ba, hay chỉ dừng ở mô tả cơ chế? Quyết định phạm vi bài tập chấm tự động được.
2. **Di truyền liên kết ở lớp 9** — mức độ sâu tới đâu so với lớp 12, để đặt `prerequisites` đúng
   và tránh dạy trùng.
3. **Thuật ngữ DNA/RNA vs ADN/ARN** — xác nhận SGK KNTT dùng nhất quán tên quốc tế ở mọi bài
   (đối chiếu này chỉ đọc mục lục chương XI, chưa đọc toàn bộ nội dung).
4. **§3 (THPT lớp 10-12) hoàn toàn chưa đối chiếu** — vẫn là bản thảo theo hiểu biết chung.
