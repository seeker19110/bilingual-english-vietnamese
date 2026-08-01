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

> **Khuyến nghị của tôi: PA C**, nhưng **chỉ khi thật sự bắt đầu GĐ3** — không migration sớm. Lý
> do: PA A/B đều tạo nợ kỹ thuật phải trả lại đúng lúc đông người dùng nhất, trong khi PA C chỉ
> đắt thêm một lần ngay lúc dữ liệu Lý/Hoá còn trống (rẻ nhất để đổi). Nhưng đây là quyết định
> kiến trúc → **xin ý kiến người dùng trước, không tự làm.**

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

### Lớp 6 — Mở đầu, đo lường, lực

| Nội dung   | Công thức / kiến thức cốt lõi                                                                |
| ---------- | -------------------------------------------------------------------------------------------- |
| Đo lường   | Đo chiều dài, khối lượng, thời gian, nhiệt độ · sai số, cách chọn dụng cụ đo                 |
| Lực        | Lực tiếp xúc / không tiếp xúc · biểu diễn lực bằng mũi tên · biến dạng, biến đổi chuyển động |
| Trọng lực  | **`P = 10m`** (P: trọng lượng — N; m: khối lượng — kg; hệ số 10 N/kg dùng ở cấp THCS)        |
| Lực ma sát | Ma sát trượt, ma sát nghỉ, ma sát lăn · lợi và hại của ma sát                                |
| Năng lượng | Các dạng năng lượng · **định luật bảo toàn năng lượng** (phát biểu định tính ở lớp 6)        |

### Lớp 7 — Tốc độ, âm, ánh sáng, từ

| Nội dung | Công thức / kiến thức cốt lõi                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tốc độ   | **`v = s / t`** · đồ thị quãng đường – thời gian · an toàn giao thông (khoảng cách dừng xe)                                                                         |
| Âm thanh | Nguồn âm, dao động · **biên độ** ↔ độ to; **tần số** ↔ độ cao (`f` đo bằng Hz) · phản xạ âm, tiếng vang                                                             |
| Ánh sáng | **Định luật phản xạ ánh sáng**: tia phản xạ nằm trong mặt phẳng tới, **góc phản xạ = góc tới** (`i' = i`) · ảnh qua gương phẳng (ảnh ảo, đối xứng, cùng kích thước) |
| Từ       | Nam châm, từ trường, từ phổ · **la bàn**, từ trường Trái Đất · **nam châm điện**                                                                                    |

### Lớp 8 — Áp suất, công, điện, nhiệt

| Nội dung           | Công thức / kiến thức cốt lõi                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Khối lượng riêng   | **`D = m / V`** (kg/m³)                                                                                                   |
| Áp suất            | **`p = F / S`** (Pa = N/m²) · **áp suất chất lỏng `p = d·h`** · áp suất khí quyển                                         |
| Lực đẩy Archimedes | **`F_A = d · V`** (d: trọng lượng riêng chất lỏng; V: thể tích phần vật chìm) · điều kiện nổi/chìm/lơ lửng                |
| Đòn bẩy, moment    | **Moment lực `M = F · d`** · điều kiện cân bằng đòn bẩy                                                                   |
| Công, công suất    | **`A = F · s`** (J) · **`P = A / t`** (W)                                                                                 |
| Điện               | Hiện tượng nhiễm điện · dòng điện, nguồn điện · tác dụng của dòng điện · **`I`** (A), **`U`** (V), đo bằng ampe kế/vôn kế |
| Nhiệt              | Truyền nhiệt: dẫn nhiệt, đối lưu, bức xạ nhiệt · sự nở vì nhiệt                                                           |

### Lớp 9 — Điện, điện từ, năng lượng, ánh sáng

| Nội dung             | Công thức / kiến thức cốt lõi                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Định luật Ohm**    | **`I = U / R`** · điện trở dây dẫn **`R = ρ·l / S`**                                                                                       |
| Đoạn mạch            | **Nối tiếp:** `I = I₁ = I₂`, `U = U₁ + U₂`, `R = R₁ + R₂` · **Song song:** `U = U₁ = U₂`, `I = I₁ + I₂`, `1/R = 1/R₁ + 1/R₂`               |
| Công, công suất điện | **`P = U·I = I²R = U²/R`** · **`A = P·t = U·I·t`** · **định luật Joule–Lenz `Q = I²·R·t`**                                                 |
| Điện từ              | Lực điện từ · **quy tắc bàn tay trái** · **hiện tượng cảm ứng điện từ**, dòng điện cảm ứng (Faraday) · máy phát điện, máy biến áp          |
| Ánh sáng             | **Khúc xạ ánh sáng** · thấu kính hội tụ/phân kì, tiêu cự · ảnh qua thấu kính · **`1/f = 1/d + 1/d'`** (công thức thấu kính) · máy ảnh, mắt |
| Năng lượng           | **Định luật bảo toàn và chuyển hoá năng lượng** · năng lượng tái tạo · hiệu suất **`H = A_có ích / A_toàn phần × 100%`**                   |

---

## 3. THPT (lớp 10-12) — Vật lí là môn riêng (nhóm môn lựa chọn)

### Lớp 10 — Cơ học

| Chủ đề            | Công thức cốt lõi                                                                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ----------------------------------------------- |
| Động học          | **`v = v₀ + at`** · **`s = v₀t + ½at²`** · **`v² − v₀² = 2as`** · rơi tự do (`a = g ≈ 9,8 m/s²`) · chuyển động ném                                                         |
| Động lực học      | **Định luật I Newton** (quán tính) · **Định luật II: `F⃗ = m·a⃗`** · **Định luật III: `F⃗₁₂ = −F⃗₂₁`**                                                                     |
| Các lực           | Trọng lực `P = mg` · **lực ma sát `F_ms = μN`** · \*\*lực đàn hồi (định luật Hooke) `F = k·                                                                                | Δl  | `** · **lực hướng tâm `F_ht = mv²/r = mω²r`\*\* |
| Công & năng lượng | **`A = F·s·cos α`** · **`P = A/t = F·v`** · **động năng `W_đ = ½mv²`** · **thế năng trọng trường `W_t = mgh`** · **cơ năng `W = W_đ + W_t`** (bảo toàn khi chỉ có lực thế) |
| Động lượng        | **`p⃗ = m·v⃗`** · **định luật bảo toàn động lượng** · xung lượng `Δp⃗ = F⃗·Δt`                                                                                             |
| Chuyển động tròn  | **`ω = 2π/T = 2πf`** · **`v = ωr`** · gia tốc hướng tâm **`a_ht = v²/r`**                                                                                                  |

### Lớp 11 — Dao động, sóng, điện

| Chủ đề            | Công thức cốt lõi                                                                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------- |
| Dao động điều hoà | **`x = A·cos(ωt + φ)`** · `v = −ωA·sin(ωt+φ)`, `a = −ω²x` · **con lắc lò xo `T = 2π√(m/k)`** · **con lắc đơn `T = 2π√(l/g)`** · dao động tắt dần, cưỡng bức, cộng hưởng |
| Sóng              | **`v = λf = λ/T`** · giao thoa, sóng dừng · sóng điện từ, thang sóng điện từ                                                                                            |
| Điện trường       | \*\*Định luật Coulomb `F = k·                                                                                                                                           | q₁q₂ | /(εr²)`** (`k = 9·10⁹ N·m²/C²`) · **cường độ điện trường `E = F/q`** · điện thế, hiệu điện thế `U = A/q`· **tụ điện`C = Q/U`\*\* |
| Dòng điện         | **`I = q/t`** · **định luật Ohm toàn mạch `I = ξ/(R + r)`** · ghép nguồn · năng lượng và công suất điện                                                                 |

### Lớp 12 — Nhiệt, khí, từ, hạt nhân

| Chủ đề          | Công thức cốt lõi                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ----------------------------------------------------------------------------------------------------------- |
| Vật lí nhiệt    | **Nhiệt lượng `Q = mcΔt`** · **nhiệt nóng chảy `Q = λm`**, **nhiệt hoá hơi `Q = Lm`** · **nguyên lí I nhiệt động lực học `ΔU = A + Q`**                                                     |
| Khí lí tưởng    | **Boyle `pV = const`** (T không đổi) · **Charles `V/T = const`** (p không đổi) · **`p/T = const`** (V không đổi) · **phương trình trạng thái `pV/T = const`** · **`pV = nRT`**              |
| Từ trường       | **Lực từ `F = BIl·sin α`** · \*\*lực Lorentz `f =                                                                                                                                           | q   | vB·sin α`** · **từ thông `Φ = BS·cos α`** · **suất điện động cảm ứng `e_c = −ΔΦ/Δt`\*\* (định luật Faraday) |
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

1. **Chốt PA A/B/C ở §0.1** (mô hình `subject` cho KHTN) — **quyết định kiến trúc, cần người dùng
   duyệt**, làm trước khi viết một dòng code GĐ3 nào.
2. Người có chuyên môn (giáo viên Lý) duyệt nội dung §2-§3, đối chiếu SGK "Kết nối tri thức".
3. Bổ sung yêu cầu **đơn vị + quy đổi + dung sai** (§4) vào đặc tả thuật toán chấm — lưu ý phần
   này nên thiết kế **ngay từ GĐ2 (Toán)** để không phải viết lại engine chấm ở GĐ3.

> Điểm 3 là góp ý quan trọng: nếu GĐ2 làm engine chấm chỉ biết "số trần", tới GĐ3 sẽ phải đập đi
> làm lại. Rẻ hơn nhiều nếu ngay từ đầu thiết kế kiểu đáp án là **(giá trị, đơn vị tuỳ chọn)** —
> Toán để đơn vị rỗng, Lý/Hoá điền vào.
