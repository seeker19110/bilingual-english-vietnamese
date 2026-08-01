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

> **✅ ĐÃ ĐỐI CHIẾU SGK 2026-08-01** — bộ "Kết nối tri thức", `tai-lieu-sgk/SGK-Ly/10..12/`.
> Mục lục đầy đủ: `docs/research/muc-luc-sgk/ly-10.md` · `ly-11.md` · `ly-12.md`.
> Ký hiệu trong bảng: `[✓]` khớp SGK · `[≠]` khác lớp/khác mức · `[+]` bổ sung theo SGK ·
> `[−]` bỏ vì SGK không dạy. Nhật ký đầy đủ ở §6.4.

**Cấu trúc chương thật của 3 cuốn (căn cứ mục lục):**

| Lớp | Số chương | Số bài | Các chương                                                                                                                                                                |
| --- | --------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 10  | 7         | 34     | I. Mở đầu · II. Động học · III. Động lực học · IV. Năng lượng, công, công suất · V. Động lượng · VI. Chuyển động tròn đều · VII. Biến dạng của vật rắn. Áp suất chất lỏng |
| 11  | 4         | 26     | I. Dao động · II. Sóng · III. Điện trường · IV. Dòng điện. Mạch điện                                                                                                      |
| 12  | 4         | 25     | I. Vật lí nhiệt · II. Khí lí tưởng · III. Từ trường · IV. Vật lí hạt nhân                                                                                                 |

### Lớp 10 — Cơ học (7 chương · 34 bài)

| Chương SGK                                | Chủ đề                               | Công thức cốt lõi                                                                             | Đối chiếu                                                  |
| ----------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| I. Mở đầu                                 | Phương pháp & sai số                 | sai số tuyệt đối/tương đối, cách ghi kết quả đo (Bài 3)                                       | `[+]` kho cũ thiếu hoàn toàn                               |
| II. Động học                              | Chuyển động thẳng                    | **`v = v₀ + at`** · **`d = v₀t + ½at²`** · **`v² − v₀² = 2ad`** · rơi tự do · chuyển động ném | `[✓]`                                                      |
| II                                        | Độ dịch chuyển vs quãng đường        | phân biệt **`d`** (vector) và **`s`** (vô hướng); đồ thị `d–t`                                | `[+]` kho cũ gộp làm một                                   |
| III. Động lực học                         | Ba định luật Newton                  | **I** (quán tính) · **II `F⃗ = m·a⃗`** · **III `F⃗₁₂ = −F⃗₂₁`**                               | `[✓]`                                                      |
| III                                       | Các lực                              | `P = mg` · **`F_ms = μN`** · lực căng dây · lực cản, lực nâng                                 | `[+]` bổ sung lực căng, lực cản/lực nâng (Bài 17, 19)      |
| III                                       | Moment lực                           | **`M = F·d`** · cân bằng của vật rắn (Bài 21)                                                 | `[+]` kho cũ thiếu — mức định lượng cần giáo viên xác nhận |
| IV. Năng lượng, công, công suất           | Công & công suất                     | **`A = F·s·cos α`** · **`P = A/t = F·v`**                                                     | `[✓]` (xem §6.4 về phân tầng với lớp 9)                    |
| IV                                        | Cơ năng                              | **`W_đ = ½mv²`** · **`W_t = mgh`** · **`W = W_đ + W_t`**, bảo toàn khi chỉ có lực thế         | `[✓]`                                                      |
| IV                                        | Hiệu suất                            | **`H = A_ích/A_toàn phần · 100%`** (Bài 27 — bài riêng)                                       | `[+]` kho cũ không có ở lớp 10                             |
| V. Động lượng                             | Động lượng                           | **`p⃗ = m·v⃗`** · **ĐLBT động lượng** · xung lượng `Δp⃗ = F⃗·Δt` · va chạm                    | `[✓]`                                                      |
| VI. Chuyển động tròn đều                  | Chuyển động tròn                     | **`ω = 2π/T = 2πf`** · **`v = ωr`** · **`a_ht = v²/r = ω²r`** · **`F_ht = mv²/r = mω²r`**     | `[✓]`                                                      |
| VII. Biến dạng vật rắn. Áp suất chất lỏng | Biến dạng                            | **định luật Hooke `F = k·                                                                     | Δl                                                         | `** (Bài 33) | `[≠]` kho cũ xếp chung mục "Các lực"; SGK để thành **chương riêng cuối sách** |
| VII                                       | Khối lượng riêng & áp suất chất lỏng | **`ρ = m/V`** · **`p = ρgh`** (Bài 34)                                                        | `[+]` kho cũ thiếu ở lớp 10 (chỉ có ở KHTN 8)              |

**Không có ở Vật lí 10 (khác chương trình cũ):** nhiệt học, chất khí, thuyết động học phân tử —
đã chuyển xuống **lớp 12**.

### Lớp 11 — Dao động, sóng, điện trường, dòng điện (4 chương · 26 bài)

| Chương SGK               | Chủ đề                                                    | Công thức cốt lõi                                               | Đối chiếu                                                                       |
| ------------------------ | --------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| I. Dao động              | Dao động điều hoà                                         | **`x = A·cos(ωt + φ)`** · `v = −ωA·sin(ωt+φ)` · **`a = −ω²x`**  | `[✓]`                                                                           |
| I                        | Năng lượng dao động                                       | `W_đ`, `W_t`, cơ năng dao động bảo toàn (Bài 5, 7)              | `[+]` kho cũ thiếu                                                              |
| I                        | Con lắc lò xo `T = 2π√(m/k)` · con lắc đơn `T = 2π√(l/g)` | —                                                               | `[≠]` 🟡 **không có bài riêng trong mục lục** — giữ tạm, cần giáo viên xác nhận |
| I                        | Tắt dần, cưỡng bức, cộng hưởng                            | (định tính)                                                     | `[✓]`                                                                           |
| II. Sóng                 | Sóng cơ                                                   | **`v = λf = λ/T`** · sóng ngang/dọc · giao thoa · sóng dừng     | `[✓]`                                                                           |
| II                       | Sóng điện từ                                              | thang sóng điện từ · `c = 3·10⁸ m/s`                            | `[✓]`                                                                           |
| II                       | Sóng âm                                                   | đo tần số sóng âm, đo tốc độ truyền âm (Bài 10, 15 — thực hành) | `[+]`                                                                           |
| III. Điện trường         | Định luật Coulomb                                         | **`F = k·                                                       | q₁q₂                                                                            | /(εr²)`**, `k = 9·10⁹ N·m²/C²` | `[✓]` |
| III                      | Cường độ điện trường                                      | **`E = F/q`** · **điện trường đều `E = U/d`**                   | `[+]` bổ sung điện trường đều (Bài 18)                                          |
| III                      | Thế năng điện, điện thế                                   | thế năng điện (Bài 19) · **`V = A/q`**, `U = A/q`               | `[+]` bổ sung thế năng điện                                                     |
| III                      | Tụ điện                                                   | **`C = Q/U`** · năng lượng tụ điện                              | `[✓]`                                                                           |
| IV. Dòng điện. Mạch điện | Dòng điện & điện trở                                      | **`I = q/t`** · **`R = U/I`** (định luật Ohm) · điện trở suất   | `[✓]`                                                                           |
| IV                       | Nguồn điện                                                | **`ξ`**, **`r`** · **Ohm toàn mạch `I = ξ/(R + r)`**            | `[✓]`                                                                           |
| IV                       | Ghép nguồn (nối tiếp/song song)                           | —                                                               | `[−]` **không thấy trong mục lục** — bỏ, hoặc chờ giáo viên xác nhận            |
| IV                       | Năng lượng & công suất điện                               | **`A = UIt`** · **`P = UI`**                                    | `[✓]`                                                                           |

**Không có ở Vật lí 11 (khác chương trình cũ):** quang hình (khúc xạ, thấu kính, mắt — đã ở
**KHTN 9**), từ trường & cảm ứng điện từ (đã lên **lớp 12**), dòng điện trong các môi trường,
dòng điện xoay chiều & mạch RLC.

### Lớp 12 — Nhiệt, khí, từ, hạt nhân (4 chương · 25 bài)

| Chương SGK          | Chủ đề                                                                                       | Công thức cốt lõi                                                           | Đối chiếu                                                  |
| ------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------- |
| I. Vật lí nhiệt     | Cấu trúc chất, sự chuyển thể                                                                 | mô hình động học phân tử, 3 thể (Bài 1)                                     | `[+]` kho cũ thiếu                                         |
| I                   | Nội năng & nguyên lí I                                                                       | **`ΔU = A + Q`**                                                            | `[✓]`                                                      |
| I                   | Thang nhiệt độ                                                                               | **`T(K) = t(°C) + 273,15`** (Bài 3)                                         | `[+]` kho cũ thiếu                                         |
| I                   | Nhiệt lượng                                                                                  | **`Q = mcΔt`** · **`Q = λm`** (nóng chảy) · **`Q = Lm`** (hoá hơi)          | `[✓]`                                                      |
| II. Khí lí tưởng    | Ba định luật chất khí                                                                        | **Boyle `pV = const`** · **Charles `V/T = const`** · `p/T = const`          | `[✓]`                                                      |
| II                  | Phương trình trạng thái                                                                      | **`pV/T = const`** · **`pV = nRT`**                                         | `[✓]`                                                      |
| II                  | Mô hình vi mô                                                                                | **`p = ⅓·μ·v̄²`** · **`W̄_đ = (3/2)kT`** (Bài 12)                             | `[+]` kho cũ thiếu — mức định lượng cần giáo viên xác nhận |
| III. Từ trường      | Lực từ                                                                                       | **`F = BIl·sin α`** · cảm ứng từ `B` (T)                                    | `[✓]`                                                      |
| III                 | Lực Lorentz `f =                                                                             | q                                                                           | vB·sin α`                                                  | —   | `[−]` 🟡 **không có bài nào trong mục lục** — nghi thừa theo chương trình cũ, cần giáo viên xác nhận trước khi xoá |
| III                 | Từ thông & cảm ứng điện từ                                                                   | **`Φ = BS·cos α`** · **`e_c = −ΔΦ/Δt`** (Faraday) · Lenz                    | `[✓]`                                                      |
| III                 | Máy phát điện xoay chiều · ứng dụng cảm ứng điện từ · điện từ trường và mô hình sóng điện từ | (Bài 17, 18, 19)                                                            | `[+]` kho cũ thiếu cả 3 bài                                |
| IV. Vật lí hạt nhân | Cấu trúc hạt nhân                                                                            | **`_Z^A X`** · proton, neutron, đồng vị                                     | `[✓]`                                                      |
| IV                  | Năng lượng liên kết                                                                          | **`Δm = Zm_p + (A−Z)m_n − m_hn`** · **`E = Δm·c²`** · phân hạch, nhiệt hạch | `[✓]`                                                      |
| IV                  | Phóng xạ                                                                                     | tia α, β, γ · **`N = N₀·2^(−t/T)`**                                         | `[✓]` (dạng `e^(−λt)` chưa xác minh)                       |
| IV                  | Công nghiệp hạt nhân                                                                         | nhà máy điện hạt nhân, an toàn phóng xạ (Bài 24)                            | `[+]` kho cũ thiếu                                         |

**Không có ở Vật lí 12 (khác chương trình cũ):** dao động & sóng cơ (đã ở **lớp 11**), dòng điện
xoay chiều & mạch RLC, sóng ánh sáng & giao thoa ánh sáng, lượng tử ánh sáng, mẫu nguyên tử Bohr,
thuyết tương đối hẹp.

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
   **✅ §2 (THCS) ĐÃ ĐỐI CHIẾU 2026-08-01** — xem §6. **✅ §3 (THPT 10-12) CŨNG ĐÃ ĐỐI CHIẾU
   2026-08-01** (SGK Vật lí 10, 11, 12 KNTT) — xem §6.4. Vẫn cần giáo viên Lý duyệt lần cuối —
   xem §6.3 (cấp 2) và §6.5 (cấp 3). Còn lại **§1 (tiểu học) chưa đối chiếu**.
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
**Phần THPT (§3) được đối chiếu ở đợt sau, cùng ngày** — ghi riêng ở **§6.4** và **§6.5** bên dưới
để phân biệt rõ với phần cấp 2 (§6.1-§6.3).
**Chưa đối chiếu:** §1 (tiểu học) — chưa có sách trong `tai-lieu-sgk/`.

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
6. ~~**§3 (THPT lớp 10-12) hoàn toàn chưa đối chiếu**~~ **✅ ĐÃ ĐỐI CHIẾU 2026-08-01** — xem §6.4.
   Danh sách cần duyệt riêng cho cấp 3 ở **§6.5**.

---

### 6.4 Nhật ký đối chiếu — phần THPT (§3, lớp 10-12) · 2026-08-01

**Phạm vi:** SGK **Vật lí 10, 11, 12** bộ "Kết nối tri thức với cuộc sống"
(`tai-lieu-sgk/SGK-Ly/10..12/`, mục lục ở `page_0005.png` của mỗi cuốn, OCR bằng
`scripts/ocr-crop.py` vì mục lục trình bày 2 cột). Mục lục đầy đủ:
`docs/research/muc-luc-sgk/ly-10.md` · `ly-11.md` · `ly-12.md`.
Thư mục con `cd/` trong mỗi lớp là đĩa tài nguyên đính kèm SGK, **không phải trang sách** — bỏ qua.

**Quy mô sách:** Vật lí 10 = 7 chương / 34 bài · Vật lí 11 = 4 chương / 26 bài ·
Vật lí 12 = 4 chương / 25 bài. **Tổng 15 chương / 85 bài.**

#### Bảng thay đổi — tất cả mục `[≠]` `[+]` `[−]` của phần THPT

| Lớp | Ký hiệu | Nội dung                                                                                                                  | Đã làm gì                                                                                                   |
| --- | ------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 10  | `[+]`   | **Sai số phép đo** (Bài 3 — chương I Mở đầu)                                                                              | Bổ sung — kho cũ thiếu hoàn toàn chương I                                                                   |
| 10  | `[+]`   | **Phân biệt độ dịch chuyển `d` (vector) và quãng đường `s`** · đồ thị `d–t` (Bài 4, 7)                                    | Bổ sung — kho cũ gộp làm một                                                                                |
| 10  | `[+]`   | **Lực căng dây** (Bài 17) · **lực cản, lực nâng** (Bài 19)                                                                | Bổ sung vào mục "Các lực"                                                                                   |
| 10  | `[+]`   | **Moment lực `M = F·d`. Cân bằng của vật rắn** (Bài 21)                                                                   | Bổ sung — mức định lượng cần giáo viên xác nhận                                                             |
| 10  | `[+]`   | **Hiệu suất `H = A_ích/A_toàn phần`** (Bài 27 — có **bài riêng**)                                                         | Bổ sung — trước đây chỉ treo nghi vấn ở lớp 9 (§6.1); nay xác định lớp 10 là nơi dạy chính                  |
| 10  | `[+]`   | **Khối lượng riêng `ρ = m/V`, áp suất chất lỏng `p = ρgh`** (Bài 34)                                                      | Bổ sung — kho cũ chỉ có ở KHTN 8, tưởng cấp 3 không học lại                                                 |
| 10  | `[≠]`   | **Định luật Hooke `F = k·\|Δl\|`**                                                                                        | Chuyển từ mục "Các lực" sang **chương VII riêng "Biến dạng của vật rắn"** (Bài 33) — SGK để cuối sách       |
| 11  | `[≠]`   | **Con lắc lò xo `T = 2π√(m/k)` · con lắc đơn `T = 2π√(l/g)`**                                                             | 🟡 Giữ tạm, đánh dấu chưa xác minh — chương I **không có bài riêng nào** về con lắc                         |
| 11  | `[+]`   | **Năng lượng trong dao động điều hoà** (Bài 5, 7 — 2 bài)                                                                 | Bổ sung — kho cũ thiếu                                                                                      |
| 11  | `[+]`   | **Điện trường đều `E = U/d`** (Bài 18) · **thế năng điện** (Bài 19)                                                       | Bổ sung                                                                                                     |
| 11  | `[+]`   | **Sóng âm** — đo tần số sóng âm (Bài 10), đo tốc độ truyền âm (Bài 15)                                                    | Bổ sung                                                                                                     |
| 11  | `[−]`   | **Ghép nguồn điện (nối tiếp / song song)**                                                                                | **BỎ** — không có dấu vết trong mục lục chương IV (5 bài)                                                   |
| 12  | `[+]`   | **Cấu trúc của chất. Sự chuyển thể** (Bài 1) · **Thang nhiệt độ `T(K) = t(°C) + 273,15`** (Bài 3)                         | Bổ sung — kho cũ thiếu 2 bài đầu chương I                                                                   |
| 12  | `[+]`   | **Áp suất khí theo mô hình động học phân tử `p = ⅓μv̄²`** · **`W̄_đ = (3/2)kT`** (Bài 12)                                   | Bổ sung — mức định lượng cần giáo viên xác nhận                                                             |
| 12  | `[+]`   | **Máy phát điện xoay chiều** (Bài 17) · **Ứng dụng cảm ứng điện từ** (Bài 18) · **Điện từ trường, sóng điện từ** (Bài 19) | Bổ sung — kho cũ thiếu cả 3 bài của chương III                                                              |
| 12  | `[+]`   | **Công nghiệp hạt nhân** (Bài 24)                                                                                         | Bổ sung                                                                                                     |
| 12  | `[−]`   | **Lực Lorentz `f = \|q\|vB·sin α`**                                                                                       | 🟡 Đánh dấu nghi thừa — chương III chỉ có Bài 15 "Lực từ tác dụng lên **dây dẫn mang dòng điện**". Chưa xoá |

**Tổng cộng phần THPT: 17 mục** — `[+]` 13 · `[≠]` 2 · `[−]` 2 · phần còn lại `[✓]` giữ nguyên.
(Cộng với 18 mục của cấp 2 ở §6.1 ⇒ **35 mục lệch trên toàn file**.)

#### Kết luận các điểm nghi ngờ ĐÃ XÁC MINH ĐƯỢC ở cấp 3

| Điểm nghi ngờ                                                       | Kết luận                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Công / công suất / hiệu suất / cơ năng dạy ở lớp nào?**           | ✅ **DẠY Ở CẢ HAI CẤP, khác độ sâu — KHÔNG xoá nội dung cấp 2.** KHTN 9 chương I: `A = F·s`, `P = A/t`, `W_đ = ½mv²`, `W_t = P·h`. Vật lí 10 chương IV: `A = F·s·cos α` (thêm góc), `P = A/t = F·v` (thêm dạng `F·v`), **định luật bảo toàn cơ năng thành bài riêng** (Bài 26), **hiệu suất thành bài riêng** (Bài 27). ⇒ Ghi rõ 2 layer trong kho, giữ nguyên cả hai. |
| **Định luật bảo toàn động lượng dạy ở lớp nào?**                    | ✅ **CHỈ Ở VẬT LÍ 10** (chương V, Bài 28-30). Không có ở cấp 2 — mục lục KHTN 6-9 không có bài nào về động lượng. Kho kiến thức đã xếp đúng.                                                                                                                                                                                                                           |
| **Nhiệt học & chất khí ở lớp 10 hay lớp 12?**                       | ✅ **LỚP 12** (chương I "Vật lí nhiệt", chương II "Khí lí tưởng"). Vật lí 10 KNTT **hoàn toàn không có nhiệt học** — khác hẳn chương trình cũ. Kho kiến thức đã xếp đúng ở lớp 12.                                                                                                                                                                                     |
| **Từ trường & cảm ứng điện từ ở lớp 11 hay lớp 12?**                | ✅ **LỚP 12** (chương III). Vật lí 11 KNTT chỉ có điện trường + dòng điện một chiều. Kho kiến thức đã xếp đúng.                                                                                                                                                                                                                                                        |
| **Quang hình (thấu kính, mắt) có ở cấp 3 không?**                   | ✅ **KHÔNG.** Không xuất hiện trong mục lục cả 3 lớp — đã chuyển hẳn xuống **KHTN 9**. Củng cố quyết định ở §6.1 (bỏ "máy ảnh, mắt" khỏi lớp 9 là do SGK KHTN 9 không có bài riêng, chứ không phải vì chuyển lên cấp 3).                                                                                                                                               |
| **Dòng điện xoay chiều / mạch RLC / quang phổ / lượng tử ánh sáng** | ✅ **KHÔNG CÓ ở bất kỳ lớp nào 10-12.** Chương trình 2018 đã bỏ. Kho kiến thức vốn không ghi ⇒ đúng, không cần sửa.                                                                                                                                                                                                                                                    |
| **Đơn vị & ký hiệu chuẩn hệ SI**                                    | 🟡 **XÁC MINH ĐƯỢC SỰ TỒN TẠI, chưa đọc trọn bảng.** Vật lí 10 có mục riêng đầu sách "Bảng đơn vị đo lường thuộc hệ SI dùng trong SGK Vật lí 10": 7 đơn vị cơ bản + bảng đơn vị dẫn xuất + ghi chú vận dụng theo bài. OCR bảng bị vỡ (nhiều ô nhỏ), chỉ đọc chắc vài dòng (rad/s, rad/s², m³, Hz, N, N·m). **Không chép bảng vào kho** — xem §6.5 mục 5.               |

### 6.5 Danh sách cần GIÁO VIÊN CHUYÊN MÔN (Lý) duyệt — riêng phần THPT

1. **Vật lí 10, Bài 21 (Moment lực)** — SGK có nêu công thức `M = F·d` định lượng hay chỉ định
   tính? (Câu hỏi song song với mục 2 của §6.3 ở lớp 8.)
2. **Vật lí 10, Bài 34** — bài này có nhắc lại **nguyên lí Pascal** và **lực đẩy Archimedes** ở
   mức định lượng không? Tên bài chỉ ghi "Khối lượng riêng. Áp suất chất lỏng".
3. **Giá trị `g` dùng trong bài tập Vật lí 10** — `9,8 m/s²` hay `10 m/s²`? Ở KHTN 6 đã xác minh
   SGK dùng `P ≈ 10·m`; **chưa xác minh cho cấp 3**. Ảnh hưởng trực tiếp ngưỡng dung sai engine chấm.
4. **Vật lí 11 — con lắc lò xo / con lắc đơn** có được dạy (dù không có bài riêng) không? Nếu có
   thì `T = 2π√(m/k)`, `T = 2π√(l/g)` có thuộc phạm vi ra đề không?
5. **Vật lí 10 — bảng đơn vị hệ SI đầu sách:** cần bản đầy đủ, chính xác để chuẩn hoá danh mục đơn
   vị hợp lệ của engine chấm (yêu cầu §4 "đáp án là cặp (giá trị, đơn vị)"). OCR hiện chưa đủ tin cậy.
6. **Vật lí 12 — lực Lorentz** có nằm trong Bài 15 không, hay CT 2018 đã bỏ hẳn?
7. **Vật lí 12, Bài 12** — mức định lượng của `p = ⅓μv̄²` và `W̄_đ = (3/2)kT`.
8. **Vật lí 12, Bài 23** — định luật phóng xạ viết dạng `N = N₀·2^(−t/T)`, `N = N₀·e^(−λt)`, hay cả hai?
9. **Vật lí 12 không có bài thực hành nào trong mục lục** (khác lớp 10 và 11) — đúng vậy hay thực
   hành được gộp trong bài? Chưa kết luận.
