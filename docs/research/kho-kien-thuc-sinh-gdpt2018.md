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

| Lớp | Nội dung phân môn Sinh                                                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6   | **Tế bào** (đơn vị cơ bản của sự sống, cấu tạo, phân chia) · phân loại thế giới sống (5 giới) · virus, vi khuẩn, nguyên sinh vật, nấm, thực vật, động vật · đa dạng sinh học                      |
| 7   | **Trao đổi chất và chuyển hoá năng lượng ở sinh vật**: quang hợp, hô hấp tế bào · vận chuyển chất trong cây · dinh dưỡng ở động vật · **cảm ứng ở sinh vật** · sinh trưởng, phát triển · sinh sản |
| 8   | **Cơ thể người**: hệ vận động, tiêu hoá, tuần hoàn, hô hấp, bài tiết, thần kinh, nội tiết, sinh sản · dinh dưỡng và an toàn thực phẩm · **môi trường và hệ sinh thái**                            |
| 9   | **Di truyền học**: ADN, gene, nhiễm sắc thể · **quy luật Mendel** · nguyên phân, giảm phân · di truyền ở người · đột biến · **tiến hoá** (học thuyết Darwin, nguồn gốc sự sống)                   |

### 2.1 Phần TÍNH TOÁN được ở THCS (ít, nhưng có)

| Nội dung               | Công thức                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| Quy luật Mendel        | Lai một cặp tính trạng: F₂ phân li **3 trội : 1 lặn** (kiểu hình), **1 : 2 : 1** (kiểu gene) |
| Lai hai cặp tính trạng | F₂ phân li **9 : 3 : 3 : 1**                                                                 |
| Nguyên phân            | Từ 1 tế bào qua `k` lần nguyên phân → **`2^k`** tế bào con                                   |
| Giảm phân              | 1 tế bào sinh dục chín → 4 tế bào con, bộ NST giảm một nửa (`2n → n`)                        |

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
4. Người có chuyên môn (giáo viên Sinh) duyệt §2-§3 đối chiếu SGK "Kết nối tri thức" trước khi
   đưa vào `data/`.
