# Kho kiến thức môn VẬT LÍ — tiểu học → lớp 12 (bám Chương trình GDPT 2018)

> Ngày: 2026-08-01 · Phục vụ: **GĐ3** (Lý + Hoá) trong `ke-hoach-nen-tang-donghanhcungban-2026-07-31.md` §4
> Cùng cấu trúc với `kho-kien-thuc-toan-gdpt2018.md` — đọc §0 của file đó trước (nguồn gốc, ranh
> giới bản quyền, cổng duyệt chuyên môn đều áp dụng y hệt, không lặp lại ở đây).
> Trạng thái: **bản thảo kỹ thuật — CHƯA DUYỆT CHUYÊN MÔN, chưa được đưa vào `apps/*/src/data/`**

---

## 0. ⚠️ PHÁT HIỆN CẤU TRÚC — ảnh hưởng trực tiếp tới KIẾN TRÚC app, phải xử lý trước khi code

Đây là điểm quan trọng nhất của file này, quan trọng hơn cả danh sách công thức bên dưới.

**Trong GDPT 2018, "Vật lí" KHÔNG tồn tại như một môn riêng ở mọi cấp:**

| Cấp              | Vật lí nằm ở đâu                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| Tiểu học lớp 1-3 | Trong môn **Tự nhiên và Xã hội** (chung cả tự nhiên lẫn xã hội) — không có công thức                           |
| Tiểu học lớp 4-5 | Trong môn **Khoa học** (chung Lý + Hoá + Sinh) — mô tả hiện tượng, chưa có công thức ký hiệu                   |
| THCS lớp 6-9     | **Trong môn KHOA HỌC TỰ NHIÊN (KHTN)** — một môn tích hợp gồm 3 phân môn Lý + Hoá + Sinh, **KHÔNG tách riêng** |
| THPT lớp 10-12   | **Vật lí là môn riêng**, thuộc nhóm môn **lựa chọn** (học sinh có thể không chọn học)                          |

### 0.1 Hệ quả kỹ thuật — mô hình `subject` hiện tại KHÔNG đủ

Kiến trúc hiện tại (ADR-0001, migration `0029`) giả định `subject` là chuỗi phẳng
(`'english'`, `'math'`). Giả định đó **đúng với Toán** (Toán là môn riêng xuyên suốt lớp 1-12)
nhưng **sai với Lý/Hoá/Sinh**:

- Học sinh lớp 8 học "KHTN", không học "Vật lí". Nếu app hiện môn "Vật lí" cho lớp 8 thì **lệch
  với thực tế trên lớp** — mất đúng lợi thế "khớp bài đang học" mà SGK thống nhất 2026 mang lại.
- Học sinh lớp 11 thì lại học "Vật lí" đúng nghĩa môn riêng.
- Cùng một mảng kiến thức, **tên môn đổi theo cấp**.

**Ba phương án, cần chốt TRƯỚC khi code GĐ3** (không tự quyết, thuộc diện "đụng kiến trúc" phải
hỏi theo CLAUDE.md mục 12):

| PA  | Cách làm                                                                                       | Ưu                                                       | Nhược                                                                       |
| --- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------- |
| A   | `subject = 'khtn'` cho lớp 6-9, `subject = 'physics'` cho 10-12 (2 môn riêng trong hệ thống)   | Khớp đúng thực tế trường học                             | Tiến độ/SRS bị đứt đoạn khi lên lớp 10; người dùng thấy như 2 môn khác nhau |
| B   | `subject = 'physics'` xuyên suốt, chỉ đổi **nhãn hiển thị** theo lớp                           | Dữ liệu liền mạch, SRS/tiến độ nối từ lớp 6 lên 12       | Lớp 6-9 hiện "Vật lí" trong khi trên lớp gọi "KHTN" — dễ gây bối rối        |
| C   | `subject = 'khtn'` là môn CHA, `physics/chemistry/biology` là phân môn con (thêm cột `branch`) | Đúng nhất về mặt mô hình hoá; hiện đúng tên ở cả hai cấp | Tốn thêm 1 migration + sửa mọi truy vấn đếm lượt đang có                    |

> ### ✅ ĐÃ CHỐT 2026-08-01: **PA C** (người dùng duyệt)
>
> Môn cha `khtn` + cột `branch` (`physics`/`chemistry`/`biology`). Thi hành **khi thật sự bắt đầu
> GĐ3**, không migration sớm: PA A/B đều tạo nợ kỹ thuật phải trả đúng lúc đông người dùng nhất,
> còn PA C chỉ đắt thêm một lần ngay lúc dữ liệu Lý/Hoá còn trống — rẻ nhất để đổi.
> Áp dụng chung cho cả Lý, Hoá, Sinh.

---

## 1. TIỂU HỌC (lớp 1-5) — chưa có công thức

Chỉ mô tả hiện tượng, **không có công thức ký hiệu nào** → nếu làm, đây là dạng "khám phá/quan
sát", chấm bằng trắc nghiệm chọn đáp án, không cần KaTeX, không cần thuật toán chuẩn hoá biểu thức.

| Lớp | Nội dung liên quan Vật lí                                                                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1-3 | (Tự nhiên và Xã hội) Bầu trời ngày/đêm · thời tiết · vật liệu quanh ta · an toàn điện                                        |
| 4   | (Khoa học) **Ánh sáng** (nguồn sáng, bóng tối) · **Âm thanh** · **Nhiệt** (nóng, lạnh, dẫn nhiệt)                            |
| 5   | (Khoa học) **Năng lượng** (mặt trời, gió, nước, chất đốt) · **Điện** (mạch điện đơn giản, vật dẫn/cách điện) · biến đổi chất |

---

## 2. THCS (lớp 6-9) — trong môn KHTN

> Nhắc lại §0: học sinh gọi đây là **KHTN**, không gọi "Vật lí".
>
> ✅ **§2 đã được đối chiếu với SGK KHTN 6-9 "Kết nối tri thức" ngày 2026-08-01** — xem
> `docs/research/muc-luc-sgk/khtn-6..9.md` và **Nhật ký đối chiếu §6** cuối file.

### Lớp 6 — Lực, năng lượng, Trái Đất và bầu trời (chương VIII-X, 16 bài)

| Nội dung                       | Công thức / kiến thức cốt lõi                                                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Đo lường `[≠]`                 | Đo chiều dài, khối lượng, thời gian, nhiệt độ — SGK xếp ở **chương I (kĩ năng KHTN dùng chung)**, không thuộc riêng phân môn Lý          |
| Lực `[✓]`                      | Lực tiếp xúc / không tiếp xúc · biểu diễn lực bằng mũi tên · biến dạng, biến đổi chuyển động                                             |
| **Biến dạng của lò xo** `[+]`  | Độ dãn `Δl = l − l₀`, tỉ lệ với lực (định tính) — Bài 42                                                                                 |
| Trọng lực `[✓]`                | **`P ≈ 10·m`** (P: N; m: kg) — xác minh trên nội dung Bài 43, xem §6.2                                                                   |
| Lực ma sát `[≠]`               | Ma sát trượt, ma sát nghỉ. `[−]` **Bỏ "ma sát lăn"** — mục tiêu Bài 44 chỉ nêu ma sát trượt và ma sát nghỉ                               |
| **Lực cản của nước** `[+]`     | Lực cản của chất lưu (định tính) — Bài 45                                                                                                |
| Năng lượng `[✓]`               | Các dạng năng lượng · **định luật bảo toàn năng lượng** (định tính) · năng lượng hao phí, năng lượng tái tạo, tiết kiệm năng lượng       |
| **Trái Đất và bầu trời** `[+]` | **Chương X, 4 bài — kho cũ THIẾU HOÀN TOÀN**: chuyển động nhìn thấy của Mặt Trời & thiên thể · các pha Mặt Trăng · Hệ Mặt Trời · Ngân Hà |

### Lớp 7 — Tốc độ, âm, ánh sáng, từ (chương III-VI, 13 bài)

| Nội dung                      | Công thức / kiến thức cốt lõi                                                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tốc độ `[✓]`                  | **`v = s / t`** · **đo tốc độ** (Bài 9) · đồ thị quãng đường – thời gian · an toàn giao thông (khoảng cách dừng xe)                                                 |
| Âm thanh `[✓]`                | Nguồn âm, dao động · **biên độ** ↔ độ to; **tần số** ↔ độ cao (`f` đo bằng Hz) · phản xạ âm, tiếng vang, chống ô nhiễm tiếng ồn                                     |
| **Năng lượng ánh sáng** `[+]` | Tia sáng, chùm sáng · bóng tối / bóng nửa tối — Bài 15                                                                                                              |
| Ánh sáng `[✓]`                | **Định luật phản xạ ánh sáng**: tia phản xạ nằm trong mặt phẳng tới, **góc phản xạ = góc tới** (`i' = i`) · ảnh qua gương phẳng (ảnh ảo, đối xứng, cùng kích thước) |
| Từ `[✓]`                      | Nam châm, từ trường, từ phổ · **la bàn**, từ trường Trái Đất (trong Bài 19) · **nam châm điện**                                                                     |

### Lớp 8 — Khối lượng riêng, áp suất, moment, điện, nhiệt (chương III-VI, 17 bài)

| Nội dung                  | Công thức / kiến thức cốt lõi                                                                                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Khối lượng riêng `[✓]`    | **`D = m / V`** (kg/m³) · thực hành xác định khối lượng riêng (Bài 14)                                                                                                                    |
| Áp suất `[✓]`             | **`p = F / S`** (Pa = N/m²) · áp suất chất lỏng theo độ sâu · áp suất khí quyển                                                                                                           |
| Lực đẩy Archimedes `[≠]`  | 🟡 Mục tiêu Bài 17 chỉ nêu **điều kiện ĐỊNH TÍNH** vật nổi/chìm + định luật Archimedes; **không thấy công thức `F_A = d·V`** trong khung mục tiêu ⇒ hạ mức, cần giáo viên xác nhận (§6.3) |
| Đòn bẩy, moment `[✓]`     | 🟡 Moment lực (Bài 18) · điều kiện cân bằng đòn bẩy (Bài 19) — chưa xác minh SGK có cho công thức `M = F·d` hay chỉ định tính                                                             |
| ~~Công, công suất~~ `[−]` | **BỎ KHỎI LỚP 8** — KHTN 8 KNTT **không có bài nào về công/công suất**; nội dung này ở **lớp 9, Bài 4**                                                                                   |
| Điện `[✓]`                | Hiện tượng nhiễm điện do cọ xát · dòng điện, nguồn điện · **mạch điện đơn giản** (Bài 22) · tác dụng của dòng điện · **`I`** (A), **`U`** (V), đo bằng ampe kế/vôn kế                     |
| Nhiệt `[≠]`               | `[+]` **Năng lượng nhiệt và nội năng** (Bài 26 — kho cũ thiếu khái niệm **nội năng**) · truyền nhiệt: dẫn nhiệt, đối lưu, bức xạ nhiệt · sự nở vì nhiệt                                   |

### Lớp 9 — Năng lượng cơ học, ánh sáng, điện, điện từ (chương I-V, 16 bài)

| Nội dung                       | Công thức / kiến thức cốt lõi                                                                                                                                                                                                                                                                              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Năng lượng cơ học** `[+]`    | **Chương I, 3 bài — kho cũ THIẾU HOÀN TOÀN ở lớp 9**: **động năng `W_đ = ½mv²`**, **thế năng `W_t = P·h`** (Bài 2) · **cơ năng `W = W_đ + W_t`** (Bài 3) · **công `A = F·s`, công suất `P = A/t`** (Bài 4 — chuyển từ lớp 8 sang)                                                                          |
| Ánh sáng `[≠]`                 | **Khúc xạ ánh sáng** (Bài 5) · `[+]` **phản xạ toàn phần** (Bài 6) · `[+]` **lăng kính, tán sắc** (Bài 7) · thấu kính hội tụ/phân kì, tiêu cự (Bài 8) · `[+]` **kính lúp** (Bài 10). 🟡 Công thức thấu kính `1/f = 1/d + 1/d'` **chưa xác minh**. `[−]` **Bỏ "máy ảnh, mắt"** — không có trong KHTN 9 KNTT |
| **Định luật Ohm** `[✓]`        | **`I = U / R`** · điện trở dây dẫn **`R = ρ·l / S`**                                                                                                                                                                                                                                                       |
| Đoạn mạch `[✓]`                | **Nối tiếp:** `I = I₁ = I₂`, `U = U₁ + U₂`, `R = R₁ + R₂` · **Song song:** `U = U₁ = U₂`, `I = I₁ + I₂`, `1/R = 1/R₁ + 1/R₂`                                                                                                                                                                               |
| Công, công suất điện `[≠]`     | **`P = U·I`** · **`A = P·t = U·I·t`** · điện năng tiêu thụ (kWh) — Bài 13. 🟡 `P = I²R = U²/R` và **định luật Joule–Lenz `Q = I²Rt`** chưa xác minh có dạy ở KNTT lớp 9 không                                                                                                                              |
| Điện từ `[≠]`                  | **Hiện tượng cảm ứng điện từ**, nguyên tắc tạo dòng điện xoay chiều (Bài 14) · tác dụng của dòng điện xoay chiều (Bài 15). `[−]` **Bỏ lực điện từ, quy tắc bàn tay trái, máy phát điện & máy biến áp thành bài riêng** — không có trong mục lục                                                            |
| Năng lượng với cuộc sống `[≠]` | **Vòng năng lượng trên Trái Đất, năng lượng hoá thạch** (Bài 16) · **năng lượng tái tạo** (Bài 17). 🟡 Hiệu suất `H = A_ích/A_toàn phần` không có bài riêng — chưa xác minh                                                                                                                                |

---

## 3. THPT (lớp 10-12) — Vật lí là môn riêng (nhóm môn lựa chọn)

### Lớp 10 — Cơ học

| Chủ đề | Công thức cốt lõi |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ----------------------------------------------- |
| Động học | **`v = v₀ + at`** · **`s = v₀t + ½at²`** · **`v² − v₀² = 2as`** · rơi tự do (`a = g ≈ 9,8 m/s²`) · chuyển động ném |
| Động lực học | **Định luật I Newton** (quán tính) · **Định luật II: `F⃗ = m·a⃗`** · **Định luật III: `F⃗₁₂ = −F⃗₂₁`** |
| Các lực | Trọng lực `P = mg` · **lực ma sát `F_ms = μN`** · \*\*lực đàn hồi (định luật Hooke) `F = k·                                                                                | Δl  | `** · **lực hướng tâm `F_ht = mv²/r = mω²r`\*\* |
| Công & năng lượng | **`A = F·s·cos α`** · **`P = A/t = F·v`** · **động năng `W_đ = ½mv²`** · **thế năng trọng trường `W_t = mgh`** · **cơ năng `W = W_đ + W_t`** (bảo toàn khi chỉ có lực thế) |
| Động lượng | **`p⃗ = m·v⃗`** · **định luật bảo toàn động lượng** · xung lượng `Δp⃗ = F⃗·Δt` |
| Chuyển động tròn | **`ω = 2π/T = 2πf`** · **`v = ωr`** · gia tốc hướng tâm **`a_ht = v²/r`** |

### Lớp 11 — Dao động, sóng, điện

| Chủ đề | Công thức cốt lõi |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------- |
| Dao động điều hoà | **`x = A·cos(ωt + φ)`** · `v = −ωA·sin(ωt+φ)`, `a = −ω²x` · **con lắc lò xo `T = 2π√(m/k)`** · **con lắc đơn `T = 2π√(l/g)`** · dao động tắt dần, cưỡng bức, cộng hưởng |
| Sóng | **`v = λf = λ/T`** · giao thoa, sóng dừng · sóng điện từ, thang sóng điện từ |
| Điện trường | \*\*Định luật Coulomb `F = k·                                                                                                                                           | q₁q₂ | /(εr²)`** (`k = 9·10⁹ N·m²/C²`) · **cường độ điện trường `E = F/q`** · điện thế, hiệu điện thế `U = A/q`· **tụ điện`C = Q/U`\*\* |
| Dòng điện | **`I = q/t`** · **định luật Ohm toàn mạch `I = ξ/(R + r)`** · ghép nguồn · năng lượng và công suất điện |

### Lớp 12 — Nhiệt, khí, từ, hạt nhân

| Chủ đề | Công thức cốt lõi |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ----------------------------------------------------------------------------------------------------------- |
| Vật lí nhiệt | **Nhiệt lượng `Q = mcΔt`** · **nhiệt nóng chảy `Q = λm`**, **nhiệt hoá hơi `Q = Lm`** · **nguyên lí I nhiệt động lực học `ΔU = A + Q`** |
| Khí lí tưởng | **Boyle `pV = const`** (T không đổi) · **Charles `V/T = const`** (p không đổi) · **`p/T = const`** (V không đổi) · **phương trình trạng thái `pV/T = const`** · **`pV = nRT`** |
| Từ trường | **Lực từ `F = BIl·sin α`** · \*\*lực Lorentz `f =                                                                                                                                           | q   | vB·sin α`** · **từ thông `Φ = BS·cos α`** · **suất điện động cảm ứng `e_c = −ΔΦ/Δt`\*\* (định luật Faraday) |
| Vật lí hạt nhân | Cấu tạo hạt nhân `_Z^A X` · **độ hụt khối `Δm = Zm_p + (A−Z)m_n − m_hn`** · **năng lượng liên kết `E = Δm·c²`** · **định luật phóng xạ `N = N₀·2^(−t/T)`** · phản ứng phân hạch, nhiệt hạch |

---

## 4. Hệ quả cho việc chấm tự động (nguyên tắc "không để AI phán đúng/sai" vẫn giữ)

Vật lí **thuận lợi hơn Toán ở một điểm, khó hơn ở một điểm**:

| Thuận lợi                                                               | Khó hơn                                                                        |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Đa số bài ra **đáp số có đơn vị** → chấm bằng so khớp số + dung sai, dễ | **Phải kiểm ĐƠN VỊ**, không chỉ kiểm số — `10 N` khác `10 kg` dù số giống nhau |
| Ít biểu thức đại số phức tạp hơn Toán                                   | Cần chấp nhận **sai số làm tròn** rộng hơn (vd `g = 9,8` vs `10`)              |

**Yêu cầu bổ sung cho thuật toán chấm ở GĐ3** (ngoài phần đã đặc tả cho Toán ở GĐ2 §3.3):

1. Đáp án Lý là cặp **(giá trị, đơn vị)**, không phải số trần.
2. Phải **quy đổi đơn vị** trước khi so khớp (`1 km = 1000 m`, `1 kWh = 3,6·10⁶ J`) — học sinh
   trả lời đúng nhưng khác đơn vị vẫn phải được tính đúng.
3. **Dung sai cấu hình được theo từng đề** — bài dùng `g = 10` và bài dùng `g = 9,8` ra kết quả
   lệch vài %, không được chấm sai.
4. Ghi rõ trong đề nếu bắt buộc đơn vị cụ thể; nếu không ghi thì phải chấp nhận mọi đơn vị tương đương.

---

## 5. Việc tiếp theo

1. ~~Chốt PA A/B/C ở §0.1~~ **✅ ĐÃ CHỐT: PA C** (2026-08-01). Thi hành khi bắt đầu GĐ3.
2. ~~Người có chuyên môn (giáo viên Lý) duyệt nội dung §2-§3, đối chiếu SGK "Kết nối tri thức".~~
   **✅ §2 (THCS) ĐÃ ĐỐI CHIẾU 2026-08-01** — xem §6. **§3 (THPT 10-12) vẫn CHƯA đối chiếu** (chưa
   có SGK Vật lí 10-12 trong `tai-lieu-sgk/`). Vẫn cần giáo viên Lý duyệt lần cuối — xem §6.3.
3. ~~Bổ sung yêu cầu **đơn vị + quy đổi + dung sai** (§4) vào đặc tả thuật toán chấm~~
   **✅ ĐÃ XONG 2026-08-01** — `packages/core-grading/` đã viết và có test đầy đủ, thiết kế ngay
   từ GĐ2 đúng như khuyến nghị. Xem `docs/research/dac-ta-engine-cham-dung-chung.md`.

> Điểm 3 là góp ý quan trọng: nếu GĐ2 làm engine chấm chỉ biết "số trần", tới GĐ3 sẽ phải đập đi
> làm lại. Rẻ hơn nhiều nếu ngay từ đầu thiết kế kiểu đáp án là **(giá trị, đơn vị tuỳ chọn)** —
> Toán để đơn vị rỗng, Lý/Hoá điền vào.

---

## 6. Nhật ký đối chiếu SGK (2026-08-01)

**Phạm vi đã đối chiếu:** §2 — THCS lớp 6-9, môn KHTN bộ "Kết nối tri thức"
(`tai-lieu-sgk/SGK-KHTN/6..9/`, OCR bằng `scripts/ocr-images.py` + `scripts/ocr-crop.py`). Mục lục
đầy đủ: `docs/research/muc-luc-sgk/khtn-6..9.md`.
**Chưa đối chiếu:** §1 (tiểu học), §3 (THPT 10-12) — chưa có sách trong `tai-lieu-sgk/`.

### 6.1 Bảng thay đổi — tất cả mục `[≠]` `[+]` `[−]`

| Lớp | Ký hiệu | Nội dung                                                                                                   | Đã làm gì                                                                                                      |
| --- | ------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 6   | `[≠]`   | Đo lường (chiều dài, khối lượng, thời gian, nhiệt độ)                                                      | Ghi rõ SGK xếp ở **chương I — kĩ năng KHTN dùng chung**, không thuộc riêng phân môn Lý                         |
| 6   | `[+]`   | **Biến dạng của lò xo** (Bài 42)                                                                           | Bổ sung vào §2 lớp 6                                                                                           |
| 6   | `[−]`   | **Ma sát lăn**                                                                                             | **BỎ** — mục tiêu Bài 44 chỉ nêu ma sát trượt và ma sát nghỉ                                                   |
| 6   | `[+]`   | **Lực cản của nước** (Bài 45)                                                                              | Bổ sung                                                                                                        |
| 6   | `[+]`   | **Chương X "Trái Đất và bầu trời"** (4 bài): Mặt Trời & thiên thể, Mặt Trăng, Hệ Mặt Trời, Ngân Hà         | Bổ sung — kho cũ **thiếu hoàn toàn**                                                                           |
| 7   | `[+]`   | **Đo tốc độ** (Bài 9)                                                                                      | Bổ sung                                                                                                        |
| 7   | `[+]`   | **Năng lượng ánh sáng. Tia sáng, vùng tối** (Bài 15)                                                       | Bổ sung                                                                                                        |
| 8   | `[−]`   | **Công `A = F·s` và công suất `P = A/t`**                                                                  | **CHUYỂN SANG LỚP 9** (Bài 4). KHTN 8 KNTT không có bài nào về công/công suất — **lệch lớn nhất của file này** |
| 8   | `[≠]`   | Lực đẩy Archimedes `F_A = d·V`                                                                             | 🟡 Hạ mức xuống định tính — mục tiêu Bài 17 chỉ nêu điều kiện định tính, cần giáo viên xác nhận                |
| 8   | `[+]`   | **Nội năng** (Bài 26 "Năng lượng nhiệt và nội năng")                                                       | Bổ sung — kho cũ thiếu khái niệm nội năng                                                                      |
| 8   | `[+]`   | Mạch điện đơn giản (Bài 22)                                                                                | Bổ sung                                                                                                        |
| 9   | `[+]`   | **Chương I "Năng lượng cơ học"** (3 bài): `W_đ = ½mv²`, `W_t = P·h`, `W = W_đ + W_t`, `A = F·s`, `P = A/t` | Bổ sung — kho cũ **thiếu hoàn toàn ở lớp 9**                                                                   |
| 9   | `[+]`   | **Phản xạ toàn phần** (Bài 6) · **Lăng kính, tán sắc** (Bài 7) · **Kính lúp** (Bài 10)                     | Bổ sung vào mảng Ánh sáng                                                                                      |
| 9   | `[−]`   | **Máy ảnh, mắt**                                                                                           | **BỎ** — không có trong mục lục KHTN 9 KNTT                                                                    |
| 9   | `[−]`   | **Lực điện từ, quy tắc bàn tay trái, máy phát điện & máy biến áp**                                         | **BỎ** — chương IV chỉ có Bài 14 (cảm ứng điện từ, dòng xoay chiều) và Bài 15 (tác dụng dòng xoay chiều)       |
| 9   | `[≠]`   | Công/công suất điện: `P = I²R = U²/R`, Joule–Lenz `Q = I²Rt`                                               | 🟡 Giữ tạm nhưng đánh dấu chưa xác minh — Bài 13 chỉ ghi "Năng lượng của dòng điện và công suất điện"          |
| 9   | `[≠]`   | Công thức thấu kính `1/f = 1/d + 1/d'`                                                                     | 🟡 Giữ tạm — Bài 10 có "Bài tập thấu kính" nhưng chưa xác minh có công thức hay chỉ dựng ảnh                   |
| 9   | `[≠]`   | Hiệu suất `H = A_ích / A_toàn phần`                                                                        | 🟡 Giữ tạm — không có bài riêng trong mục lục                                                                  |

**Tổng cộng: 18 mục** — `[+]` 8 · `[≠]` 6 · `[−]` 4 · phần còn lại `[✓]` giữ nguyên.

### 6.2 Kết luận các điểm ĐÃ ĐÁNH DẤU NGHI NGỜ

| Chỗ nghi ngờ                                       | Kết luận                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hệ số `g = 10` hay `9,8`?**                      | ✅ **ĐÃ XÁC MINH trên nội dung Bài 43 KHTN 6.** SGK dùng **cả hai, ở hai vai trò khác nhau**: (a) Bảng 43.1 nêu vật 1 kg có "trọng lượng" **9,8 N** trên Trái Đất — giá trị vật lí thật, để so với Mặt Trăng 1,7 N và Hoả tinh 3,6 N; (b) kết luận tính toán ghi số đo `P` (N) **gần bằng 10 lần** số đo `m` (kg) ⇒ **công thức làm bài là `P ≈ 10·m`**, tức `g = 10 N/kg`. Ảnh: `SGK-KHTN/6/page_0155.png` và `page_0157.png` (trang in 155, 156). |
| **Phân môn KHTN tách/gộp thế nào ở lớp 9?**        | ✅ **ĐÃ KẾT LUẬN.** KHTN 9 KNTT vẫn là **MỘT cuốn tích hợp**, nhưng 14 chương được gom thành **3 khối liền mạch theo phân môn** (I-V Lý → VI-X Hoá → XI-XIV Sinh), rõ hơn hẳn lớp 6-8. ⇒ **Quyết định kiến trúc PA C (môn cha `khtn` + cột `branch`) là đúng và đủ**, không cần tách 3 môn riêng ở THCS.                                                                                                                                            |
| **Nội dung STEM / chuyển đổi số mới (TT 17/2025)** | 🟡 **Chưa kết luận được — CẦN GIÁO VIÊN XÁC NHẬN.** Không có bản đối chứng SGK chỉnh sửa theo TT 17/2025 để so. **Không đoán.**                                                                                                                                                                                                                                                                                                                     |

**Hệ quả cho ngưỡng dung sai của engine chấm (điểm nghi ngờ này vốn đặt ra để quyết định dung
sai):** vì SGK dùng song song `9,8` và `10`, bài Lý THCS phải chấp nhận sai lệch **≈ 2%** giữa
hai quy ước. Ngưỡng **3% hiện có là vừa đủ nhưng sát mép** — khuyến nghị **ghi rõ trong đề** giá
trị `g` phải dùng, thay vì trông cậy vào dung sai. Ghi thành mục riêng, không sửa
`packages/core-grading` trong PR tài liệu này.

### 6.3 Danh sách cần GIÁO VIÊN CHUYÊN MÔN (Lý) duyệt lần cuối

1. **Lực đẩy Archimedes lớp 8** — SGK có cho công thức `F_A = d·V` (định lượng) hay chỉ dừng ở
   định tính? Quyết định có ra đề tính `F_A` hay không.
2. **Moment lực lớp 8** — có công thức `M = F·d` không, hay chỉ định tính?
3. **Công thức thấu kính lớp 9** (`1/f = 1/d + 1/d'`) — Bài 10 có dạy hay chỉ dựng ảnh hình học?
4. **Công suất điện lớp 9** — `P = I²R = U²/R` và định luật Joule–Lenz có thuộc phạm vi lớp 9
   KNTT không?
5. **Chương X lớp 6 "Trái Đất và bầu trời"** thuộc branch nào? Tài liệu này tạm xếp `physics`
   theo Chương trình GDPT 2018, nhưng đây là **quy ước**, cần xác nhận.
6. **§3 (THPT lớp 10-12) hoàn toàn chưa đối chiếu** — vẫn là bản thảo theo hiểu biết chung.
