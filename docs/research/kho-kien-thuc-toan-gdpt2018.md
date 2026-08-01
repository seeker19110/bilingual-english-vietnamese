# Kho kiến thức môn TOÁN — mầm non → lớp 12 (bám Chương trình GDPT 2018)

> Ngày: 2026-08-01 · Phục vụ: `docs/research/dac-ta-gd2-mon-toan-2026-08-01.md`
> Trạng thái: **bản thảo kỹ thuật — CHƯA ĐƯỢC DUYỆT CHUYÊN MÔN, chưa được đưa vào `apps/math/src/data/`**

---

## 0. NGUỒN GỐC & GIỚI HẠN — đọc trước khi dùng file này

### 0.0 ⚠️ CẬP NHẬT LỚN 2026-08-01 — SGK thống nhất toàn quốc từ năm học 2026-2027

Phát hiện qua kiểm chứng (người dùng nêu, AI tra cứu xác nhận):

- Bộ **"Kết nối tri thức với cuộc sống"** (NXB Giáo dục Việt Nam) được chọn làm **bộ SGK thống
  nhất dùng chung toàn quốc từ năm học 2026-2027**. Bộ GD&ĐT không biên soạn sách mới (cần 2-3
  năm) mà chọn 1 trong 3 bộ hiện hành, dựa trên tham vấn các sở GD + chuyên gia.
- Chương trình được **tinh chỉnh**: tăng thời lượng khoa học công nghệ, đổi mới sáng tạo, STEM,
  chuyển đổi số, **giáo dục trí tuệ nhân tạo (AI)**; hiệu chỉnh Lịch sử/Địa lý/GDCD theo địa giới
  hành chính + mô hình chính quyền địa phương hai cấp.

**Hệ quả cho dự án — ĐỔI GIẢ ĐỊNH, theo hướng TỐT hơn:**

| Trước (giả định cũ)                                            | Sau (thực tế 2026-2027)                                                           |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 3 bộ SGK song song → app phải viết trung lập, không bám bộ nào | **Một bộ duy nhất** → app bám đúng thứ tự chương/bài của "Kết nối tri thức"       |
| Lộ trình chỉ bám được khung mạch kiến thức chung của GDPT 2018 | Lộ trình khớp **đúng bài học sinh đang học trên lớp** → khác biệt cạnh tranh thật |

> Ghi chú về mức độ ảnh hưởng tới môn TOÁN cụ thể: các điều chỉnh được nêu tập trung vào thời
> lượng STEM/AI/chuyển đổi số và nhóm môn xã hội — **chưa có căn cứ nào cho thấy công thức/định
> lý Toán thay đổi** (bản chất chúng là sự thật khoa học, không đổi theo văn bản). Phần có thể
> xê dịch là **thứ tự và phạm vi bài theo từng lớp**. Vì vậy vẫn phải đối chiếu SGK thật (§0.3),
> nhưng phần công thức ở §3-§5 giữ nguyên giá trị.

### 0.1 Việc đã thử và KHÔNG làm được (ghi trung thực, không tô hồng)

Phiên AI này chạy trong sandbox có **chặn kết nối mạng ra ngoài theo danh sách cho phép**. Đã thử
thật và thất bại:

| Nguồn                                            | Kết quả thật                                              |
| ------------------------------------------------ | --------------------------------------------------------- |
| `taphuan.nxbgd.vn`                               | HTTP 403 qua WebFetch · `curl` trả `000` (không nối được) |
| `hanhtrangso.nxbgd.vn`                           | `curl` trả `000`                                          |
| `sachgiaokhoa.edu.vn`                            | `curl` trả `000`                                          |
| `moet.gov.vn`                                    | `curl` trả `000`                                          |
| `thuvienphapluat.vn` (bản CT GDPT 2018 môn Toán) | HTTP 403                                                  |

**Nguyên nhân đã xác định chính xác** (không phải trang chặn): `curl` tới
`taphuan.nxbgd.vn/tap-huan/chi-tiet-sach/toan-5-tap-mot-...` trả về
`curl: (56) CONNECT tunnel failed, response 403` — tức **proxy của sandbox từ chối mở đường ra
host đó**. DNS phân giải bình thường (Cloudflare, chung hạ tầng `taphuan.olm.vn`). Máy người dùng
truy cập bình thường; chỉ môi trường AI bị chặn.

**Kết luận: AI KHÔNG tự tải được sách giáo khoa hay bản gốc Thông tư 32.** Mọi nội dung dưới đây
viết từ **kiến thức toán học phổ quát** (công thức/định lý là sự thật khoa học, không thuộc bản
quyền ai) và **khung mạch kiến thức GDPT 2018 theo hiểu biết chung**, KHÔNG phải trích từ SGK.

#### Cách khắc phục đã chốt: người dùng cấp PDF vào `tai-lieu-sgk/`

- Thư mục `tai-lieu-sgk/` **đã được thêm vào `.gitignore`** — SGK có bản quyền, repo này đẩy lên
  GitHub, **tuyệt đối không commit sách vào git**.
- Ưu tiên: **Toán 6-9 bộ "Kết nối tri thức"** (đợt 2a làm cấp 2 trước). Nếu file nặng, chỉ riêng
  **phần Mục lục** mỗi cuốn đã đủ giá trị — cho biết chính xác thứ tự chương/bài để dựng lộ trình.
- **Có PDF KHÔNG đồng nghĩa được chép nội dung.** Dùng sách để biết đúng _thứ tự bài, phạm vi
  từng lớp, danh mục công thức_ (sự thật + khung chương trình → dùng được). Đề bài và ví dụ trong
  app **vẫn phải tự soạn mới** (§0.2). Đọc sách ≠ được quyền sao chép sách.

### 0.2 Vì sao cách này lại ĐÚNG về bản quyền (không chỉ là giải pháp chữa cháy)

Trùng khớp với rủi ro 🔴 cao đã ghi ở `ke-hoach-nen-tang-donghanhcungban-2026-07-31.md` §6:

| Được dùng thoải mái                                                                 | TUYỆT ĐỐI KHÔNG                                             |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Công thức, định lý, định luật (sự thật khoa học — không ai độc quyền)               | Chép nguyên văn đề bài / lời văn / hình vẽ trong SGK        |
| Tên gọi chuẩn của định lý ("định lý Pythagore", "hằng đẳng thức đáng nhớ")          | Chép cách diễn đạt đặc trưng, cách trình bày riêng của SGK  |
| Trình tự/phạm vi kiến thức theo lớp (bám Chương trình GDPT 2018 — văn bản nhà nước) | Sao chép cấu trúc chương/mục chi tiết của một bộ SGK cụ thể |
| Ví dụ **tự soạn mới**, cùng dạng công thức giải                                     | Đổi vài con số trong đề SGK rồi coi là "đề mới"             |

> Ranh giới thực hành: **"cùng công thức giải, đề khác hẳn"** — không phải "cùng đề, khác số".
> Đề trong app do **template sinh theo tham số** (xem đặc tả GĐ2 §3.2), không lấy từ nguồn nào.

### 0.3 Cổng bắt buộc trước khi dùng

File này **chưa được phép** đưa vào `apps/math/src/data/`. Phải qua **duyệt chuyên môn bởi người
thật** (giáo viên Toán hoặc người có chuyên môn) — đối chiếu từng mục với SGK/chương trình hiện
hành, vì AI không tự xác minh được (xem §0.1). Đây đúng là biện pháp giảm rủi ro "Nội dung bài
giảng sai kiến thức toán" đã ghi ở đặc tả GĐ2 §7 (🔴 cao).

---

## 1. Cách tổ chức dữ liệu — 3 loại bản ghi

Kho kiến thức không phải văn bản trôi mà là **dữ liệu có cấu trúc** để app dùng được (sinh đề,
chấm, SRS công thức). Ba loại:

### 1.1 `Formula` — công thức / định lý / định luật (đơn vị KIẾN THỨC)

```ts
type Formula = {
  id: string //  vd: 'm8.hdt.binh-phuong-tong'  (môn.chủ đề.tên)
  grade: Grade //  'mn' | 1..12
  strand: Strand //  mạch kiến thức, xem §1.4
  name: string //  'Bình phương của một tổng'
  statement: string //  phát biểu, dạng KaTeX: '(a+b)^2 = a^2 + 2ab + b^2'
  conditions?: string //  điều kiện áp dụng, vd 'a ≥ 0' — RẤT quan trọng, hay bị bỏ sót
  prerequisites: string[] //  id các Formula phải biết trước → dựng được đồ thị lộ trình
  srsEligible: boolean //  có đưa vào SRS công thức không (định nghĩa thì không, công thức thì có)
}
```

> `prerequisites` là thứ biến danh sách phẳng thành **lộ trình học thật**: app tự biết muốn học
> "phương trình bậc hai" thì phải xong "căn bậc hai" + "hằng đẳng thức" trước.

### 1.2 `ProblemTemplate` — khuôn sinh đề (đơn vị LUYỆN TẬP)

Gắn với ≥1 `Formula`. Cấu trúc chi tiết đã đặc tả ở GĐ2 §3.2 — không lặp lại ở đây. Điểm bắt
buộc: **đề tự soạn 100%**, tham số sinh ngẫu nhiên trong khoảng hợp lệ, đáp án tính từ đúng bộ
tham số vừa sinh (một nguồn sự thật duy nhất).

### 1.3 `Lesson` — bài giảng ngắn (đơn vị DẠY)

Gồm: dẫn nhập → phát biểu công thức → 2-3 ví dụ mẫu có lời giải từng bước → liên kết tới các
`ProblemTemplate` để luyện. **Ví dụ mẫu do người soạn/duyệt, không sinh tự động** (rủi ro sai
kiến thức, §0.3).

### 1.4 Mạch kiến thức (`Strand`) — theo GDPT 2018

Chương trình GDPT 2018 môn Toán tổ chức theo **3 mạch xuyên suốt** (cấu trúc tuyến tính kết hợp
"đồng tâm xoáy ốc"):

| Mã     | Mạch                                  |
| ------ | ------------------------------------- |
| `SO`   | Số, Đại số và Một số yếu tố giải tích |
| `HINH` | Hình học và Đo lường                  |
| `TK`   | Thống kê và Xác suất                  |

---

## 2. MẦM NON (3-6 tuổi) — làm quen, KHÔNG phải "Toán"

> ⚠️ Cấp này **không có công thức nào**. Đây là **làm quen với toán** (số lượng, hình dạng, so
> sánh), theo Chương trình Giáo dục Mầm non (văn bản riêng, không thuộc GDPT 2018 phổ thông).
> Vì vậy đợt 2c trong đặc tả GĐ2 được đánh dấu là **thiết kế riêng, không tái dùng khung luyện
> tập của các cấp trên** — trẻ chưa đọc viết thạo, không nhập được đáp số.

Kỹ năng (thay cho "công thức"), chia theo độ tuổi:

| Độ tuổi | Kỹ năng                                                                                                                                  |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 3-4     | Đếm 1-5 · nhận biết hình tròn/vuông · so sánh to-nhỏ, nhiều-ít · ghép đôi tương ứng 1-1                                                  |
| 4-5     | Đếm 1-10 · nhận biết hình tam giác/chữ nhật · so sánh dài-ngắn, cao-thấp · xếp thứ tự 3 đối tượng                                        |
| 5-6     | Đếm 1-20, nhận mặt chữ số · tách-gộp nhóm trong phạm vi 10 · nhận biết khối cầu/trụ/vuông · định hướng không gian (trên-dưới, trước-sau) |

**Hệ quả kỹ thuật:** tương tác phải là **chạm / kéo-thả / chọn hình / giọng nói**, không có ô nhập
đáp án. Chấm = so khớp lựa chọn, không cần thuật toán chuẩn hoá biểu thức.

---

## 3. CẤP 1 — TIỂU HỌC (lớp 1-5)

> Đặc điểm: rất ít "công thức" theo nghĩa ký hiệu; chủ yếu là **quy tắc tính** và **thuật toán
> đặt tính**. Hầu như **không cần KaTeX** (trừ phân số lớp 4-5) → nhẹ hơn cấp 2/3 nhiều.

### Lớp 1

| Mạch | Nội dung                                                                   |
| ---- | -------------------------------------------------------------------------- |
| SO   | Số 0-100 · cộng, trừ trong phạm vi 100 (không nhớ) · so sánh `>`, `<`, `=` |
| HINH | Hình vuông, tròn, tam giác, chữ nhật · đo độ dài bằng đơn vị tự quy ước    |
| TK   | (chưa có)                                                                  |

### Lớp 2

| Mạch | Nội dung                                                                                                   |
| ---- | ---------------------------------------------------------------------------------------------------------- |
| SO   | Số đến 1000 · cộng trừ có nhớ · **bảng nhân, bảng chia 2-5** · thừa số × thừa số = tích                    |
| HINH | Đường thẳng, đường cong, đoạn thẳng · **đơn vị đo:** cm, dm, m; kg; lít · xem đồng hồ (giờ đúng, giờ rưỡi) |
| TK   | Đọc biểu đồ tranh đơn giản                                                                                 |

### Lớp 3

| Mạch | Nội dung                                                                                                                                                          |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | Số đến 100 000 · bảng nhân chia 6-9 · nhân/chia số có nhiều chữ số cho số có 1 chữ số · **phép chia có dư** (`a = b×q + r`, `0 ≤ r < b`)                          |
| HINH | **Chu vi hình chữ nhật** `P = (a + b) × 2` · **chu vi hình vuông** `P = a × 4` · **diện tích HCN** `S = a × b` · **diện tích hình vuông** `S = a × a` · góc vuông |
| TK   | Bảng số liệu, biểu đồ tranh                                                                                                                                       |

### Lớp 4

| Mạch | Nội dung                                                                                                                                                      |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | Số tự nhiên lớn, hàng và lớp · **dấu hiệu chia hết cho 2, 3, 5, 9** · **phân số**: rút gọn, quy đồng, so sánh, cộng trừ nhân chia phân số                     |
| HINH | **Diện tích hình bình hành** `S = a × h` · **diện tích hình thoi** `S = (d₁ × d₂) / 2` · hai đường thẳng song song, vuông góc · đơn vị đo diện tích (cm², m²) |
| TK   | Biểu đồ cột · số trung bình cộng                                                                                                                              |

### Lớp 5

| Mạch | Nội dung                                                                                                                                                                                                                                                   |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | **Số thập phân**: 4 phép tính · **tỉ số phần trăm** · **toán chuyển động đều**: `s = v × t`, `v = s / t`, `t = s / v`                                                                                                                                      |
| HINH | **Diện tích tam giác** `S = (a × h) / 2` · **diện tích hình thang** `S = ((a + b) × h) / 2` · **chu vi hình tròn** `C = d × 3,14` · **diện tích hình tròn** `S = r × r × 3,14` · **thể tích HHCN** `V = a × b × c` · **thể tích hình lập phương** `V = a³` |
| TK   | Biểu đồ hình quạt · làm quen khả năng xảy ra của sự kiện                                                                                                                                                                                                   |

---

## 4. CẤP 2 — THCS (lớp 6-9) — đợt 2a, làm TRƯỚC

### Lớp 6

| Mạch | Công thức / kiến thức cốt lõi                                                                                                                                                                      |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | Số tự nhiên, luỹ thừa: `aᵐ · aⁿ = aᵐ⁺ⁿ`, `aᵐ : aⁿ = aᵐ⁻ⁿ` (m ≥ n, a ≠ 0) · **ƯCLN, BCNN** · **số nguyên** (cộng trừ nhân chia số âm, quy tắc dấu) · **phân số** (mở rộng lớp 4 sang tử/mẫu nguyên) |
| HINH | Hình học trực quan: tam giác đều, lục giác đều, hình thoi, hình bình hành · điểm, đường thẳng, đoạn thẳng, trung điểm · góc và số đo góc                                                           |
| TK   | Thu thập, phân loại dữ liệu · biểu đồ cột kép · xác suất thực nghiệm                                                                                                                               |

**3 chủ đề MVP đợt 2a:** Số tự nhiên & phép tính · Phân số · Số nguyên

### Lớp 7

| Mạch | Công thức / kiến thức cốt lõi                                                                                                                                                                                                                       |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------ |
| SO   | **Số hữu tỉ** ℚ · luỹ thừa số hữu tỉ · **tỉ lệ thức** `a/b = c/d ⟺ ad = bc` · **dãy tỉ số bằng nhau** `a/b = c/d = (a+c)/(b+d)` (b+d ≠ 0) · đại lượng tỉ lệ thuận `y = kx`, tỉ lệ nghịch `y = a/x` · biểu thức đại số, đa thức một biến             |
| HINH | Hai góc đối đỉnh (bằng nhau) · tiên đề Euclid về đường thẳng song song · **tổng ba góc trong tam giác = 180°** · các trường hợp bằng nhau của tam giác (c-c-c, c-g-c, g-c-g) · **quan hệ giữa góc và cạnh đối diện** · **bất đẳng thức tam giác** ` | b − c | < a < b + c` · các đường đồng quy trong tam giác |
| TK   | Biểu đồ đoạn thẳng, biểu đồ quạt tròn · biến cố, xác suất của biến cố đơn giản                                                                                                                                                                      |

**3 chủ đề MVP đợt 2a:** Số hữu tỉ · Biểu thức đại số đơn giản · Tỉ lệ thức

### Lớp 8

| Mạch | Công thức / kiến thức cốt lõi                                                                                                                                                                                                                               |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | **7 hằng đẳng thức đáng nhớ** (xem §4.1) · phân tích đa thức thành nhân tử · phân thức đại số · **phương trình bậc nhất một ẩn** `ax + b = 0` (a ≠ 0) ⟹ `x = −b/a` · **hàm số bậc nhất** `y = ax + b`, hệ số góc `a`                                        |
| HINH | **Định lý Pythagore** `a² + b² = c²` (tam giác vuông, c là cạnh huyền) và định lý đảo · tứ giác: hình thang, hình bình hành, hình chữ nhật, hình thoi, hình vuông (dấu hiệu nhận biết) · **định lý Thalès** trong tam giác · hình chóp tam giác/tứ giác đều |
| TK   | Thu thập & phân tích dữ liệu · xác suất lý thuyết vs thực nghiệm                                                                                                                                                                                            |

**3 chủ đề MVP đợt 2a:** Phương trình bậc nhất một ẩn · Hằng đẳng thức đáng nhớ · Hàm số bậc nhất

#### 4.1 Bảy hằng đẳng thức đáng nhớ (lớp 8) — bản ghi mẫu đầy đủ

Đây là **ví dụ mẫu về độ chi tiết mà mọi mục khác cần đạt** khi soạn thật vào `data/`:

| #   | Tên                      | Phát biểu (KaTeX)                     |
| --- | ------------------------ | ------------------------------------- |
| 1   | Bình phương của một tổng | `(a+b)^2 = a^2 + 2ab + b^2`           |
| 2   | Bình phương của một hiệu | `(a-b)^2 = a^2 - 2ab + b^2`           |
| 3   | Hiệu hai bình phương     | `a^2 - b^2 = (a-b)(a+b)`              |
| 4   | Lập phương của một tổng  | `(a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3` |
| 5   | Lập phương của một hiệu  | `(a-b)^3 = a^3 - 3a^2b + 3ab^2 - b^3` |
| 6   | Tổng hai lập phương      | `a^3 + b^3 = (a+b)(a^2 - ab + b^2)`   |
| 7   | Hiệu hai lập phương      | `a^3 - b^3 = (a-b)(a^2 + ab + b^2)`   |

### Lớp 9

| Mạch | Công thức / kiến thức cốt lõi                                                                                                                                                                                                                                                                                                                                          |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | **Căn bậc hai** `√(a²) =                                                                                                                                                                                                                                                                                                                                               | a   | `, `√(ab) = √a · √b`(a,b ≥ 0),`√(a/b) = √a/√b`(a ≥ 0, b > 0) · **hệ phương trình bậc nhất hai ẩn** (thế, cộng đại số) · **phương trình bậc hai**`ax² + bx + c = 0`: biệt thức `Δ = b² − 4ac`, nghiệm `x = (−b ± √Δ)/(2a)`; **định lý Viète** `x₁ + x₂ = −b/a`, `x₁·x₂ = c/a`· hàm số`y = ax²` |
| HINH | **Tỉ số lượng giác góc nhọn**: `sin α = đối/huyền`, `cos α = kề/huyền`, `tan α = đối/kề`, `cot α = kề/đối`; `sin²α + cos²α = 1` · **hệ thức lượng trong tam giác vuông**: `h² = b'·c'`, `b² = a·b'`, `a·h = b·c` · **đường tròn**: `C = 2πR`, `S = πR²`; góc nội tiếp = ½ góc ở tâm cùng chắn cung · hình trụ, hình nón, hình cầu (`S_cầu = 4πR²`, `V_cầu = (4/3)πR³`) |
| TK   | Bảng tần số, tần số tương đối · xác suất của biến cố                                                                                                                                                                                                                                                                                                                   |

**3 chủ đề MVP đợt 2a:** Phương trình bậc hai · Hệ phương trình bậc nhất hai ẩn · Căn bậc hai

---

## 5. CẤP 3 — THPT (lớp 10-12) — đợt 2d

> ⚠️ Cấp này kiến thức nặng, rủi ro sai nội dung cao nhất → yêu cầu duyệt chuyên môn kỹ hơn cấp
> dưới (đặc tả GĐ2 §7). Ngoài ra **không phải chủ đề nào cũng chấm tự động được** — phần chứng
> minh/khảo sát hàm số cần lời giải tự luận, nằm ngoài phạm vi MVP (§2.3 đặc tả GĐ2). Ở đợt 2d
> chỉ chọn chủ đề có **đáp số/biểu thức chấm được**.

### Lớp 10

| Mạch | Công thức cốt lõi                                                                                                                                                                                                                                      |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- | --- | --- | --------------------------------------------------------------------- |
| SO   | Mệnh đề, tập hợp · bất phương trình & hệ bất phương trình bậc nhất hai ẩn · **dấu tam thức bậc hai** · phương trình quy về bậc hai                                                                                                                     |
| HINH | **Định lý cosin** `a² = b² + c² − 2bc·cos A` · **định lý sin** `a/sin A = b/sin B = c/sin C = 2R` · **diện tích tam giác**: `S = ½ab·sin C`, `S = abc/(4R)`, `S = pr`, **Heron** `S = √(p(p−a)(p−b)(p−c))` · vectơ (tổng, hiệu, tích vô hướng `a⃗·b⃗ = | a⃗  |     | b⃗  | cos θ`) · phương trình đường thẳng, đường tròn trong mặt phẳng toạ độ |
| TK   | Số gần đúng, sai số · các số đặc trưng đo xu thế trung tâm và độ phân tán (phương sai, độ lệch chuẩn) · quy tắc đếm, hoán vị `Pₙ = n!`, chỉnh hợp `Aₙᵏ = n!/(n−k)!`, tổ hợp `Cₙᵏ = n!/(k!(n−k)!)` · **nhị thức Newton**                                |

### Lớp 11

| Mạch | Công thức cốt lõi                                                                                                                                                                                                                                                                                                                                                                           |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | **Lượng giác**: công thức cộng, nhân đôi, hạ bậc, biến đổi tổng↔tích · phương trình lượng giác cơ bản · **dãy số, cấp số cộng** `uₙ = u₁ + (n−1)d`, `Sₙ = n(u₁+uₙ)/2` · **cấp số nhân** `uₙ = u₁·qⁿ⁻¹`, `Sₙ = u₁(1−qⁿ)/(1−q)` (q ≠ 1) · giới hạn dãy số/hàm số, hàm số liên tục · **đạo hàm**: quy tắc `(uv)' = u'v + uv'`, `(u/v)' = (u'v − uv')/v²`, đạo hàm hàm hợp; bảng đạo hàm cơ bản |
| HINH | Quan hệ song song & vuông góc trong không gian · **góc giữa đường thẳng và mặt phẳng**, góc nhị diện · khoảng cách · **thể tích khối lăng trụ** `V = S·h`, **khối chóp** `V = ⅓S·h`                                                                                                                                                                                                         |
| TK   | Xác suất có điều kiện · công thức cộng, nhân xác suất · biến cố độc lập                                                                                                                                                                                                                                                                                                                     |

### Lớp 12

| Mạch | Công thức cốt lõi                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | Ứng dụng đạo hàm: đơn điệu, cực trị, GTLN-GTNN, tiệm cận, khảo sát & vẽ đồ thị · **luỹ thừa, mũ, logarit**: `log(ab) = log a + log b`, `log(a/b) = log a − log b`, `log aⁿ = n·log a`, đổi cơ số `log_b a = log_c a / log_c b` · phương trình, bất phương trình mũ & logarit · **nguyên hàm, tích phân**: `∫xⁿdx = xⁿ⁺¹/(n+1) + C` (n ≠ −1), tích phân từng phần; ứng dụng tính diện tích hình phẳng, thể tích khối tròn xoay |
| HINH | **Toạ độ trong không gian Oxyz**: phương trình mặt phẳng `Ax + By + Cz + D = 0`, phương trình đường thẳng, **phương trình mặt cầu** `(x−a)² + (y−b)² + (z−c)² = R²` · tích có hướng · khoảng cách từ điểm đến mặt phẳng                                                                                                                                                                                                       |
| TK   | Thống kê ghép nhóm (số đặc trưng đo xu thế trung tâm, độ phân tán)                                                                                                                                                                                                                                                                                                                                                            |

---

## 6. Hệ quả cho kế hoạch GĐ2 — điều chỉnh đề xuất

Sau khi lập kho kiến thức, **thứ tự 4 đợt ở đặc tả GĐ2 §2.1 vẫn hợp lý**, và có thêm căn cứ kỹ
thuật cụ thể để giữ nguyên:

| Đợt | Cấp     | Độ khó KỸ THUẬT (không phải độ khó kiến thức)                                                                |
| --- | ------- | ------------------------------------------------------------------------------------------------------------ |
| 2a  | Cấp 2   | **Vừa** — cần KaTeX + chấm biểu thức, nhưng chủ đề gọn, chấm tự động rõ ràng → kiểm chứng kiến trúc tốt nhất |
| 2b  | Cấp 1   | **Dễ nhất** — hầu như không cần KaTeX, đáp án là số → tái dùng thẳng khung 2a, ít việc mới                   |
| 2c  | Mầm non | **Khó khác loại** — không có đáp số, phải làm UI chạm/kéo-thả/giọng nói riêng → cần đặc tả UX riêng          |
| 2d  | Cấp 3   | **Khó nhất** — nhiều chủ đề không chấm tự động được (chứng minh, khảo sát hàm), rủi ro sai nội dung cao nhất |

> Ghi chú quan trọng cho 2d: phải **lọc chủ đề chấm được** trước khi cam kết phạm vi — nếu ôm cả
> khảo sát hàm số/chứng minh hình không gian thì buộc phải dùng AI chấm tự luận, **vi phạm nguyên
> tắc "không để AI phán đúng/sai"** đã chốt. Đề xuất 2d chỉ nhận: giải phương trình/bất phương
> trình, tính đạo hàm/nguyên hàm/tích phân, tính toán vectơ-toạ độ, xác suất-tổ hợp — đều ra đáp
> số hoặc biểu thức chuẩn hoá được.

---

## 7. Việc tiếp theo

1. **Người có chuyên môn duyệt file này** (đối chiếu SGK/chương trình thật) — cổng bắt buộc §0.3.
2. Chốt danh sách chủ đề đợt 2a (§4, đã đề xuất sẵn 12 chủ đề).
3. Chuyển các mục ở §4 (cấp 2) thành bản ghi `Formula` có cấu trúc theo §1.1 — bắt đầu từ lớp 8
   (hằng đẳng thức, §4.1 đã có sẵn bảng đầy đủ làm mẫu).
4. Từ `Formula` mới viết `ProblemTemplate` (đề tự sinh) và `Lesson`.

> Các môn **Lý, Hoá** (định luật, phương trình phản ứng, bảng tuần hoàn) thuộc **GĐ3** theo kế
> hoạch tổng — sẽ có file kho kiến thức riêng, cùng cấu trúc file này, viết khi tới lượt. Không
> soạn trước để tránh phình phạm vi (rủi ro 🔴 cao đã ghi ở kế hoạch tổng §6).
