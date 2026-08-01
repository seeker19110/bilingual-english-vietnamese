# Kho kiến thức môn HOÁ HỌC — tiểu học → lớp 12 (bám Chương trình GDPT 2018)

> Ngày: 2026-08-01 · Phục vụ: **GĐ3** (Lý + Hoá) trong `ke-hoach-nen-tang-donghanhcungban-2026-07-31.md` §4
> Đọc trước: `kho-kien-thuc-toan-gdpt2018.md` §0 (nguồn gốc, ranh giới bản quyền, cổng duyệt
> chuyên môn — áp dụng y hệt) và `kho-kien-thuc-ly-gdpt2018.md` §0 (**vấn đề môn KHTN tích hợp,
> áp dụng y hệt cho Hoá**).
> Trạng thái: **bản thảo kỹ thuật — CHƯA DUYỆT CHUYÊN MÔN, chưa được đưa vào `apps/*/src/data/`**

---

## 0. Vị trí môn Hoá trong GDPT 2018 (giống Vật lí)

| Cấp          | Hoá học nằm ở đâu                                                          |
| ------------ | -------------------------------------------------------------------------- |
| Tiểu học 1-3 | Tự nhiên và Xã hội — không có nội dung hoá học đúng nghĩa                  |
| Tiểu học 4-5 | Môn **Khoa học** — sự biến đổi chất ở mức quan sát (nước, không khí, cháy) |
| THCS 6-9     | **Trong môn KHTN** (phân môn Hoá) — không tách riêng                       |
| THPT 10-12   | **Hoá học là môn riêng**, nhóm môn **lựa chọn**                            |

> Quyết định mô hình `subject` (PA A/B/C) đã nêu ở `kho-kien-thuc-ly-gdpt2018.md` §0.1 — **áp
> dụng chung cho cả Lý, Hoá, Sinh**, chốt một lần cho cả ba.

---

## 1. TIỂU HỌC (lớp 4-5) — quan sát, chưa có công thức

Nước (3 thể, vòng tuần hoàn) · không khí (thành phần, vai trò của oxygen với sự cháy) · sự biến
đổi của chất (hoà tan, đông đặc, nóng chảy) · an toàn khi dùng chất tẩy rửa.
**Không có công thức, không có phương trình hoá học** → dạng bài trắc nghiệm/quan sát.

---

## 2. THCS (lớp 6-9) — trong môn KHTN

> ✅ **§2 đã được đối chiếu với SGK KHTN 6-9 "Kết nối tri thức" ngày 2026-08-01** — xem
> `docs/research/muc-luc-sgk/khtn-6..9.md` và **Nhật ký đối chiếu §6** cuối file.

### Lớp 6 — Chất quanh ta (chương II-IV, 9 bài) `[✓]`

Chất và vật thể · ba thể của chất, sự chuyển thể · **oxygen** (tính chất, vai trò với sự cháy) ·
**thành phần không khí** (≈78% N₂, ≈21% O₂, ~1% còn lại) · ô nhiễm không khí · một số vật liệu,
nhiên liệu, nguyên liệu, lương thực – thực phẩm · `[+]` **hỗn hợp** (chất tinh khiết/hỗn hợp,
dung dịch – huyền phù – nhũ tương) · **tách chất** (lọc, cô cạn, chiết).

> Chưa có công thức tính toán → chấm bằng trắc nghiệm.

### Lớp 7 — Nguyên tử, nguyên tố, bảng tuần hoàn, phân tử & liên kết (chương I-II, 6 bài)

| Nội dung                   | Kiến thức cốt lõi                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Nguyên tử `[✓]`            | Cấu tạo: hạt nhân (proton `p⁺`, neutron `n`) + vỏ electron (`e⁻`) · **số p = số e** (nguyên tử trung hoà điện) |
| Nguyên tố hoá học `[✓]`    | Kí hiệu hoá học · **số hiệu nguyên tử Z = số proton** · khối lượng nguyên tử (amu)                             |
| Bảng tuần hoàn `[✓]`       | Ô, chu kì, nhóm · sắp xếp theo **chiều tăng dần điện tích hạt nhân** · kim loại / phi kim / khí hiếm           |
| **Phân tử** `[+]`          | Đơn chất – hợp chất · **khối lượng phân tử = tổng khối lượng các nguyên tử** (Bài 5)                           |
| **Liên kết hoá học** `[+]` | Liên kết ion, liên kết cộng hoá trị ở mức giới thiệu (Bài 6)                                                   |
| **Hoá trị & CTHH** `[+]`   | **Quy tắc hoá trị `x·a = y·b`** · lập CTHH · **`%X = (x·M_X / M) × 100%`** (Bài 7)                             |

> `[+]` Cả chương II (Bài 5-7) trước đây **thiếu hoàn toàn** trong kho kiến thức. Đây là phần
> **tính toán hoá học đầu tiên** của chương trình (quy tắc hoá trị, phần trăm khối lượng nguyên
> tố) — chấm tự động được, nên đưa vào phạm vi GĐ3.

### Lớp 8 — Mol, phương trình hoá học, dung dịch, acid–base

Đây là lớp **bắt đầu tính toán hoá học** — quan trọng nhất về mặt kỹ thuật (cần chấm số + đơn vị).

| Nội dung                                | Công thức cốt lõi                                                                                                                                                                                   |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mol** `[≠]`                           | **`n = m / M`** (mol) · **`n = V(L) / 24,79 (L/mol)`** — điều kiện chuẩn **1 bar, 25 °C**. ⚠️ **KHÔNG phải 24, cũng không phải 22,4** — xác minh trên Bài 3 SGK KHTN 8, xem §6.2                    |
| Khối lượng mol `[✓]`                    | `M` (g/mol) · **tỉ khối `d_A/B = M_A / M_B`** · `d_A/kk = M_A / 29`                                                                                                                                 |
| **Định luật bảo toàn khối lượng** `[✓]` | Tổng khối lượng chất tham gia = tổng khối lượng sản phẩm                                                                                                                                            |
| Phương trình hoá học `[✓]`              | Lập PTHH, **cân bằng số nguyên tử mỗi nguyên tố hai vế** · tính theo PTHH                                                                                                                           |
| **Hiệu suất** `[✓]`                     | **`H = (lượng thực tế / lượng lí thuyết) × 100%`** (nằm trong Bài 6 "Tính theo phương trình hoá học")                                                                                               |
| Nồng độ dung dịch `[≠]`                 | **`C% = (m_ct / m_dd) × 100%`** · **`C_M = n / V`** (mol/L) — SGK dạy ở **Bài 4**, tức TRƯỚC định luật bảo toàn khối lượng (Bài 5) và tính theo PTHH (Bài 6) ⇒ `prerequisites` phải theo thứ tự này |
| Acid – base – oxide – muối `[✓]`        | Tính chất hoá học, thang **pH** (pH < 7 acid, = 7 trung tính, > 7 base) · phản ứng trung hoà · **bảng tính tan**                                                                                    |
| **Phân bón hoá học** `[+]`              | Phân đạm / lân / kali · tính %N, %P₂O₅, %K₂O (Bài 12)                                                                                                                                               |
| Tốc độ phản ứng `[✓]`                   | Các yếu tố ảnh hưởng: nồng độ, nhiệt độ, diện tích bề mặt, chất xúc tác (định tính)                                                                                                                 |

> `[−]` Kho kiến thức cũ xếp acid–base–oxide–muối chung một dòng; SGK tách thành **5 bài riêng**
> (Bài 8 Acid, Bài 9 Base & thang pH, Bài 10 Oxide, Bài 11 Muối, Bài 12 Phân bón) ⇒ khi soạn nội
> dung phải tách theo bài, không gộp.

### Lớp 9 — Kim loại, hữu cơ, tài nguyên vỏ Trái Đất (chương VI-X, 18 bài)

| Nội dung                                       | Kiến thức cốt lõi                                                                                                                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Kim loại `[✓]`                                 | Tính chất chung · **dãy hoạt động hoá học của kim loại** (K, Na, Ca, Mg, Al, Zn, Fe, Pb, H, Cu, Ag, Au) · tách kim loại, hợp kim (gang, thép)                                                          |
| Phi kim `[≠]`                                  | SGK **không có chương phi kim riêng** — chỉ có Bài 21 "Sự khác nhau cơ bản giữa phi kim và kim loại". `[−]` Bỏ "sơ lược bảng tuần hoàn nâng cao" (không có)                                            |
| Hữu cơ `[≠]`                                   | Khái niệm hợp chất hữu cơ · **hydrocarbon**: **alkane `CₙH₂ₙ₊₂`** (Bài 23), **alkene `CₙH₂ₙ`** (Bài 24) · nguồn nhiên liệu. `[−]` Bỏ **acetylene `C₂H₂`** — KHTN 9 KNTT không dạy                      |
| Dẫn xuất `[≠]`                                 | **Ethylic alcohol `C₂H₅OH`** (SGK dùng tên này, không phải "ethanol") · **acetic acid `CH₃COOH`** · **phản ứng ester hoá** (trong Bài 27)                                                              |
| Lipid – carbohydrate – protein – polymer `[≠]` | SGK dành hẳn **chương IX, 5 bài** chứ không phải "giới thiệu": Lipid (28) · Glucose & saccharose (29) · Tinh bột & cellulose `(C₆H₁₀O₅)ₙ` (30) · Protein (31) · Polymer (32)                           |
| **Khai thác tài nguyên từ vỏ Trái Đất** `[+]`  | **Chương X, 3 bài — kho kiến thức trước đây THIẾU HOÀN TOÀN**: sơ lược hoá học vỏ Trái Đất · khai thác đá vôi, công nghiệp silicate · nhiên liệu hoá thạch, **chu trình carbon và sự ấm lên toàn cầu** |

> 🟡 `[−]` **Ăn mòn kim loại** — kho kiến thức cũ có, nhưng mục lục KHTN 9 KNTT **không có bài
> riêng** về ăn mòn. Có thể nằm lồng trong Bài 18/20. **Cần giáo viên xác nhận**, chưa xoá.

---

## 3. THPT (lớp 10-12) — Hoá học là môn riêng

### Lớp 10 — Cấu tạo nguyên tử, liên kết, phản ứng oxi hoá – khử

| Chủ đề               | Kiến thức cốt lõi                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Cấu tạo nguyên tử    | Lớp, phân lớp, **cấu hình electron** · orbital · nguyên tố s, p, d, f · đồng vị, **nguyên tử khối trung bình `M̄ = Σ(Aᵢxᵢ)/100`**      |
| Bảng tuần hoàn       | **Định luật tuần hoàn** · biến đổi tuần hoàn bán kính nguyên tử, độ âm điện, tính kim loại/phi kim · hoá trị cao nhất với O           |
| Liên kết hoá học     | **Liên kết ion** · **liên kết cộng hoá trị** (có cực / không cực) · quy tắc octet · liên kết hydrogen, tương tác van der Waals        |
| Phản ứng oxi hoá–khử | **Số oxi hoá** · chất khử / chất oxi hoá · **cân bằng PTHH bằng phương pháp thăng bằng electron**                                     |
| Năng lượng hoá học   | **Enthalpy `ΔᵣH°₂₉₈`** · phản ứng toả nhiệt (`ΔH < 0`) / thu nhiệt (`ΔH > 0`) · tính `ΔᵣH` theo nhiệt tạo thành / năng lượng liên kết |
| Tốc độ phản ứng      | **`v = k·C_A^a · C_B^b`** · hệ số nhiệt độ Van't Hoff `γ`                                                                             |
| Nhóm halogen         | Tính chất F, Cl, Br, I · hydrogen halide, hydrohalic acid                                                                             |

### Lớp 11 — Cân bằng, nitrogen–sulfur, đại cương hữu cơ

| Chủ đề                             | Kiến thức cốt lõi                                                                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cân bằng hoá học**               | **`K_C = [C]^c[D]^d / ([A]^a[B]^b)`** · **nguyên lí chuyển dịch cân bằng Le Chatelier**                                                                 |
| Điện li                            | Acid–base theo **Brønsted–Lowry** · **`pH = −log[H⁺]`**, `[H⁺][OH⁻] = 10⁻¹⁴` (25 °C) · chuẩn độ acid–base                                               |
| Nitrogen – Sulfur                  | `N₂`, `NH₃`, muối ammonium · `HNO₃` · `SO₂`, `H₂SO₄` · mưa acid                                                                                         |
| Đại cương hữu cơ                   | Công thức phân tử / **công thức đơn giản nhất** · **đồng phân, đồng đẳng** · phương pháp tách và tinh chế · phổ khối lượng, phổ hồng ngoại (giới thiệu) |
| Hydrocarbon                        | **Alkane `CₙH₂ₙ₊₂`** · **Alkene `CₙH₂ₙ`** · **Alkyne `CₙH₂ₙ₋₂`** · **Arene** (benzene và đồng đẳng) · phản ứng thế, cộng, tách, trùng hợp               |
| Dẫn xuất halogen, alcohol, phenol  | `R–X` · **Alcohol `CₙH₂ₙ₊₁OH`** · phenol · phản ứng thế, tách nước, oxi hoá                                                                             |
| Hợp chất carbonyl, carboxylic acid | Aldehyde, ketone · **carboxylic acid `R–COOH`** · phản ứng tráng bạc, ester hoá                                                                         |

### Lớp 12 — Ester–lipid, carbohydrate, polymer, kim loại

| Chủ đề                            | Kiến thức cốt lõi                                                                                                                                  |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ester – Lipid                     | **`RCOOR′`** · phản ứng thuỷ phân, **xà phòng hoá** · chất béo, chỉ số xà phòng hoá                                                                |
| Carbohydrate                      | **Glucose/Fructose `C₆H₁₂O₆`** · **Saccharose `C₁₂H₂₂O₁₁`** · **Tinh bột, cellulose `(C₆H₁₀O₅)ₙ`** · phản ứng tráng bạc, thuỷ phân                 |
| Hợp chất chứa nitrogen            | Amine · **amino acid** (lưỡng tính) · **peptide, protein**, phản ứng màu biuret                                                                    |
| Polymer                           | Phản ứng **trùng hợp** / **trùng ngưng** · chất dẻo, tơ, cao su, keo dán                                                                           |
| Pin điện & điện phân              | **Thế điện cực chuẩn `E°`** · **suất điện động pin `E°_pin = E°_катot − E°_anot`** · **định luật Faraday `m = (A·I·t)/(n·F)`** (`F = 96500 C/mol`) |
| Đại cương kim loại                | Tính chất chung · **dãy điện hoá** · ăn mòn và chống ăn mòn · điều chế kim loại (nhiệt luyện, thuỷ luyện, điện phân)                               |
| Nguyên tố nhóm IA, IIA, phức chất | Kim loại kiềm, kiềm thổ · nước cứng · **sơ lược phức chất** và liên kết trong phức chất                                                            |

---

## 4. Hệ quả kỹ thuật — Hoá KHÓ chấm tự động hơn Toán và Lý

Đây là phần quan trọng nhất về mặt kỹ thuật, cần đọc kỹ trước khi cam kết phạm vi GĐ3.

| Dạng bài                          | Chấm tự động được?                      | Cách làm                                                            |
| --------------------------------- | --------------------------------------- | ------------------------------------------------------------------- |
| Tính theo PTHH (ra số + đơn vị)   | ✅ Được, giống Lý                       | So khớp số + quy đổi đơn vị + dung sai (như `kho-kien-thuc-ly` §4)  |
| Nồng độ, pH, hiệu suất, mol       | ✅ Được                                 | Như trên                                                            |
| **Cân bằng phương trình hoá học** | ✅ Được, nhưng **cần thuật toán riêng** | Xem §4.1 — không so khớp chuỗi được                                 |
| Viết công thức cấu tạo, đồng phân | 🟡 Khó                                  | Cần chuẩn hoá SMILES hoặc giới hạn ở trắc nghiệm chọn đáp án        |
| Chuỗi phản ứng, nhận biết chất    | ❌ Rất khó                              | **Loại khỏi phạm vi MVP** hoặc chuyển thành trắc nghiệm             |
| Giải thích hiện tượng             | ❌ Không (tự luận)                      | **Loại** — nếu làm buộc phải để AI chấm, vi phạm nguyên tắc đã chốt |

### 4.1 Cân bằng phương trình hoá học — thuật toán, KHÔNG dùng AI

Học sinh nhập hệ số, app phải kiểm **đúng về mặt bảo toàn nguyên tố**, không phải so khớp với một
đáp án cố định (vì bội số của một bộ hệ số đúng cũng đúng về mặt toán học, dù thường yêu cầu bộ
số nguyên tối giản).

Cách kiểm đúng, chạy hoàn toàn bằng thuật toán:

1. Phân tích mỗi chất thành vector số nguyên tử theo từng nguyên tố (`H₂SO₄` → `{H:2, S:1, O:4}`).
2. Nhân với hệ số học sinh nhập, cộng theo vế.
3. **Đúng ⟺ vector hai vế bằng nhau** ở mọi nguyên tố (và với phản ứng ion: **bảo toàn điện tích**).
4. Thêm kiểm **tối giản**: chia hệ số cho ƯCLN, yêu cầu ƯCLN = 1.

> Đây là điểm sáng: cân bằng PTHH **chấm chính xác tuyệt đối bằng thuật toán**, không cần AI, và
> lại là dạng bài học sinh luyện nhiều nhất. Rất hợp làm tính năng "đinh" của môn Hoá.

### 4.2 Dữ liệu nền cần có trước

- **Bảng tuần hoàn** dạng dữ liệu (Z, kí hiệu, tên, nguyên tử khối, nhóm, chu kì) — dữ liệu khoa
  học công khai, tự lập được, không vướng bản quyền.
- **Bảng tính tan**, **dãy hoạt động hoá học**, **dãy điện hoá** — cũng là dữ liệu khoa học.
- Parser công thức hoá học (`Fe₂(SO₄)₃` → vector nguyên tố) — cần viết, có xử lý ngoặc lồng nhau
  và chỉ số. Đây là việc gọn, dễ test ca biên, hợp giao subagent.

---

## 5. Việc tiếp theo

1. ~~Chốt PA A/B/C mô hình `subject`~~ **✅ ĐÃ CHỐT: PA C** (2026-08-01), chung cho Lý/Hoá/Sinh.
2. ~~Người có chuyên môn (giáo viên Hoá) duyệt §2, đối chiếu SGK — đặc biệt lưu ý `n = V/24`~~
   **✅ §2 (THCS) ĐÃ ĐỐI CHIẾU 2026-08-01** với SGK KHTN 6-9 KNTT — xem §6. Điểm `n = V/24`
   **đã xác minh và ĐÃ SỬA thành `n = V/24,79`**. **§3 (THPT 10-12) vẫn CHƯA đối chiếu** — chưa
   có SGK Hoá 10-12 trong `tai-lieu-sgk/`. Vẫn cần giáo viên Hoá duyệt lần cuối (§6.3).
3. Chốt phạm vi chấm tự động theo bảng §4 — **loại sớm** các dạng phải chấm tự luận, đừng để tới
   lúc code mới phát hiện không chấm được.
4. Lập dữ liệu nền §4.2 (bảng tuần hoàn, bảng tính tan) — việc cơ học, giao subagent được.
5. **Phần cân bằng PTHH (§4.1) ĐÃ CÓ CODE CHẠY** — `packages/core-grading/chemistry.ts`, kiểm bảo
   toàn nguyên tố + điện tích + tối giản, có test. Không phải chờ tới GĐ3 mới viết.

> ### ✅ ĐÃ CHỐT 2026-08-01 (người dùng duyệt): thứ tự GĐ3 là **HOÁ → LÝ → SINH**.
>
> **Làm HOÁ trước, LÝ sau.** Ngược với tên gọi quen thuộc "Lý–Hoá", nhưng có
> lý do kỹ thuật: cân bằng PTHH (§4.1) là tính năng chấm-tuyệt-đối-chính-xác, độc đáo, dễ tạo giá
> trị thấy được ngay; còn Lý phụ thuộc nặng vào engine đơn vị/dung sai (§4 file Lý) nên nên làm
> sau khi engine đó đã chín qua Toán + Hoá. **Cần người dùng xác nhận.**

---

## 6. Nhật ký đối chiếu SGK (2026-08-01)

**Phạm vi đã đối chiếu:** §2 — THCS lớp 6-9, môn KHTN bộ "Kết nối tri thức" (4 thư mục ảnh trong
`tai-lieu-sgk/SGK-KHTN/6..9/`, trích mục lục bằng OCR tiếng Việt `scripts/ocr-images.py`, ảnh 2
cột đọc thêm bằng `scripts/ocr-crop.py`). Mục lục đầy đủ: `docs/research/muc-luc-sgk/khtn-6..9.md`.
**Chưa đối chiếu:** §1 (tiểu học 4-5), §3 (THPT 10-12) — chưa có sách trong `tai-lieu-sgk/`.

### 6.1 Bảng thay đổi — tất cả mục `[≠]` `[+]` `[−]`

| Lớp | Ký hiệu | Nội dung                                                                                                                                                                        | Đã làm gì                                                                                                            |
| --- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 6   | `[+]`   | Hỗn hợp: chất tinh khiết/hỗn hợp, dung dịch – huyền phù – nhũ tương (Bài 16)                                                                                                    | Bổ sung vào §2 lớp 6 — SGK có hẳn chương IV                                                                          |
| 7   | `[+]`   | **Phân tử – Đơn chất – Hợp chất**; khối lượng phân tử (Bài 5)                                                                                                                   | Bổ sung — kho cũ **thiếu hoàn toàn chương II**                                                                       |
| 7   | `[+]`   | **Giới thiệu về liên kết hoá học** (Bài 6)                                                                                                                                      | Bổ sung                                                                                                              |
| 7   | `[+]`   | **Hoá trị và công thức hoá học**: `x·a = y·b`, `%X = (x·M_X/M)·100%` (Bài 7)                                                                                                    | Bổ sung — đây là **phần tính toán hoá học đầu tiên** của chương trình, chấm tự động được                             |
| 8   | `[≠]`   | **`n = V/24` → `n = V(L)/24,79 (L/mol)`**, đkc **1 bar, 25 °C**                                                                                                                 | **SỬA.** Xác minh trực tiếp trên khung Mục tiêu Bài 3 (`SGK-KHTN/8/page_0017.png`). Xem §6.2 — ảnh hưởng engine chấm |
| 8   | `[≠]`   | Thứ tự dạy: Dung dịch & nồng độ (Bài 4) đứng **trước** ĐLBT khối lượng (Bài 5) và tính theo PTHH (Bài 6)                                                                        | Ghi rõ thứ tự vào §2 để dựng `prerequisites` đúng                                                                    |
| 8   | `[+]`   | **Phân bón hoá học** (Bài 12)                                                                                                                                                   | Bổ sung vào §2 lớp 8                                                                                                 |
| 8   | `[≠]`   | Acid/base/oxide/muối gộp 1 dòng → SGK tách **5 bài riêng** (Bài 8-12)                                                                                                           | Ghi rõ phải tách theo bài khi soạn nội dung                                                                          |
| 9   | `[−]`   | **Acetylene `C₂H₂`**                                                                                                                                                            | **BỎ** — KHTN 9 KNTT chỉ dạy alkane (Bài 23) và alkene (Bài 24)                                                      |
| 9   | `[−]`   | "Sơ lược bảng tuần hoàn nâng cao" ở phần phi kim                                                                                                                                | **BỎ** — không có trong mục lục lớp 9                                                                                |
| 9   | `[≠]`   | "Phi kim: tính chất chung, một số phi kim tiêu biểu"                                                                                                                            | Sửa — SGK chỉ có **Bài 21 "Sự khác nhau cơ bản giữa phi kim và kim loại"**, không có chương phi kim riêng            |
| 9   | `[≠]`   | "Ethanol" → **"Ethylic alcohol"**                                                                                                                                               | Sửa thuật ngữ theo SGK (tên chương VIII)                                                                             |
| 9   | `[≠]`   | Lipid/carbohydrate/protein/polymer "(giới thiệu)" → **hẳn chương IX, 5 bài**                                                                                                    | Nâng mức — đây là phần nội dung lớn, không phải phần giới thiệu                                                      |
| 9   | `[+]`   | **Chương X "Khai thác tài nguyên từ vỏ Trái Đất"** (3 bài): hoá học vỏ Trái Đất, đá vôi & công nghiệp silicate, nhiên liệu hoá thạch, **chu trình carbon & sự ấm lên toàn cầu** | Bổ sung — kho cũ **thiếu hoàn toàn**. Cũng là phần liên quan nội dung mới về phát triển bền vững                     |
| 9   | `[−]`   | **Ăn mòn kim loại** — 🟡 giữ tạm, cần giáo viên xác nhận                                                                                                                        | Không xoá; mục lục không có bài riêng, có thể lồng trong Bài 18/20                                                   |

**Tổng cộng: 15 mục** — `[+]` 5 · `[≠]` 7 · `[−]` 3 · phần còn lại `[✓]` giữ nguyên.

### 6.2 ⚠️ Kết luận điểm nghi ngờ số 1: `n = V/24` hay `n = V/22,4`?

**CẢ HAI ĐỀU SAI. SGK dùng `n = V(L) / 24,79 (L/mol)`.**

Bằng chứng (xác minh trên **nội dung bài học**, không chỉ mục lục): khung "Mục tiêu" của Bài 3
"Mol và tỉ khối chất khí", SGK KHTN 8 KNTT, trang in 16 — ảnh
`tai-lieu-sgk/SGK-KHTN/8/page_0017.png`:

- "Nêu được khái niệm thể tích mol của chất khí ở **áp suất 1 bar và 25 °C**."
- "Sử dụng được công thức **n (mol) = V(L) / 24,79 (L/mol)** để chuyển đổi giữa số mol và thể
  tích chất khí ở điều kiện chuẩn: áp suất 1 bar ở 25 °C."

**Hệ quả kỹ thuật — cần xử lý TRƯỚC khi mở GĐ3 môn Hoá** (ghi thành mục riêng, không sửa code
trong PR tài liệu này):

- Dùng 24 thay vì 24,79 gây sai lệch **≈ 3,3%**, **vượt ngưỡng dung sai 3%** hiện có của
  `packages/core-grading` ⇒ mọi bài chuyển đổi mol ↔ thể tích khí sẽ bị chấm sai nếu để nguyên.
- Đề nghị: đưa **24,79 L/mol thành hằng số có tên** trong dữ liệu môn Hoá (không để "số ma
  thuật"), và cân nhắc dung sai riêng cho dạng bài này.

### 6.3 Danh sách cần GIÁO VIÊN CHUYÊN MÔN (Hoá) duyệt lần cuối

1. **Ăn mòn kim loại có được dạy ở KHTN 9 KNTT không?** Mục lục không có bài riêng — cần xác nhận
   để quyết định giữ hay bỏ khỏi §2 lớp 9.
2. **Mức độ định lượng của Bài 6 "Tính theo phương trình hoá học"** — hiệu suất `H` có được dạy ở
   lớp 8 hay chỉ ở THPT? Chưa xác minh trên nội dung bài.
3. **§3 (THPT lớp 10-12) hoàn toàn chưa đối chiếu** — chưa có SGK Hoá 10-12 trong `tai-lieu-sgk/`.
   Toàn bộ §3 vẫn là **bản thảo theo hiểu biết chung**, chưa được kiểm chứng.
4. **Ảnh hưởng của Thông tư 17/2025** lên nội dung KHTN — không có bản đối chứng để so. **Không
   đoán.** Riêng chương X lớp 9 (chu trình carbon, ấm lên toàn cầu) có thể là phần được tăng
   thời lượng, nhưng chưa xác nhận được.
