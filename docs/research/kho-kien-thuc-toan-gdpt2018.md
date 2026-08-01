# Kho kiến thức môn TOÁN — mầm non → lớp 12 (bám Chương trình GDPT 2018)

> Ngày: 2026-08-01 · Phục vụ: `docs/research/dac-ta-gd2-mon-toan-2026-08-01.md`
> Trạng thái: **bản thảo kỹ thuật — CHƯA ĐƯỢC DUYỆT CHUYÊN MÔN, chưa được đưa vào `apps/math/src/data/`**

---

## 0. NGUỒN GỐC & GIỚI HẠN — đọc trước khi dùng file này

### 0.00 Căn cứ pháp lý — chuỗi văn bản đã tra cứu (2026-08-01)

| Văn bản                                    | Vai trò                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------- |
| **Thông tư 32/2018/TT-BGDĐT** (26/12/2018) | Ban hành Chương trình GDPT 2018 — văn bản GỐC                             |
| Thông tư 20/2021/TT-BGDĐT                  | Sửa đổi, bổ sung                                                          |
| Thông tư 13/2022/TT-BGDĐT                  | Sửa đổi, bổ sung                                                          |
| **Thông tư 17/2025/TT-BGDĐT**              | **Sửa đổi, bổ sung MỚI NHẤT** — chương trình chỉnh sửa                    |
| **Quyết định 3588/QĐ-BGDĐT** (26/12/2025)  | Chọn bộ **"Kết nối tri thức với cuộc sống"** làm SGK dùng chung toàn quốc |

Bộ GD&ĐT tổ chức tập huấn giáo viên về chương trình chỉnh sửa, rà soát chỉnh sửa SGK một số lớp
cho phù hợp; **SGK chỉnh sửa thực hiện từ năm học 2026-2027**.

> ⚠️ **Điều AI CHƯA biết và KHÔNG được đoán:** nội dung chi tiết Thông tư 17/2025 sửa những gì
> **cụ thể** với môn Toán/KHTN. Đã thử đọc bản gốc trên `vanban.chinhphu.vn` → **HTTP 403**, cùng
> tình trạng với mọi nguồn Việt Nam khác (§0.1). Vì vậy toàn bộ nội dung §2-§5 dưới đây bám khung
> chương trình theo hiểu biết chung, **chưa đối chiếu với bản chỉnh sửa mới nhất** — đây chính là
> việc phải làm khi có SGK thật (xem `huong-dan-doi-chieu-sgk.md`).

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

#### Cách cung cấp nội dung SGK cho AI — KHÁC NHAU theo nơi AI chạy

**✅ CHỐT 2026-08-01: sẽ làm việc này ở PHIÊN LOCAL** (Claude Code chạy trên máy người dùng), nên
`tai-lieu-sgk/` là **đường chính thức**.

| Nơi AI chạy                            | Cách đưa SGK vào                                                                                                                                                                  |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Local** (máy người dùng) — ĐANG DÙNG | ✅ Chép PDF vào `tai-lieu-sgk/`, AI đọc trực tiếp. Nhận được cả bộ, không giới hạn dung lượng chat.                                                                               |
| Từ xa (web/app, container cloud)       | Đính kèm vào khung chat, hoặc chỉ gửi Mục lục. **Không** chép vào `tai-lieu-sgk/` được — container tạm thời, người dùng không truy cập được thư mục đó và file mất khi hết phiên. |

**`tai-lieu-sgk/` đã có trong `.gitignore`** — SGK có bản quyền, repo đẩy lên GitHub, **tuyệt đối
không commit sách vào git**. Dòng ignore này là hàng rào cứng: kể cả AI ở phiên sau lỡ `git add`
thì cũng không lên được GitHub.

**Ưu tiên nội dung cần:** **Toán 6-9 bộ "Kết nối tri thức"** (đợt 2a làm cấp 2 trước). Quy trình
đối chiếu chi tiết: xem **`docs/research/huong-dan-doi-chieu-sgk.md`**.

**Có SGK KHÔNG đồng nghĩa được chép nội dung.** Dùng sách để biết đúng _thứ tự bài, phạm vi từng
lớp, danh mục công thức_ (sự thật + khung chương trình → dùng được). Đề bài và ví dụ trong app
**vẫn phải tự soạn mới** (§0.2). Đọc sách ≠ được quyền sao chép sách.

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

> ✅ **§4 ĐÃ ĐỐI CHIẾU SGK THẬT ngày 2026-08-01** — nguồn: 8 file PDF bộ "Kết nối tri thức" (Toán
> 6-9, mỗi lớp 2 tập) trong `tai-lieu-sgk/`, trích mục lục bằng OCR. Mục lục đầy đủ:
> `docs/research/muc-luc-sgk/toan-6..9.md`. Ký hiệu `[✓] [≠] [+] [−]` theo
> `huong-dan-doi-chieu-sgk.md` §Bước 2; toàn bộ thay đổi liệt kê ở **§8 Nhật ký đối chiếu**.
>
> §3 (lớp 1-5) và §5 (lớp 10-12) **CHƯA đối chiếu** — chưa có SGK các cấp đó trong `tai-lieu-sgk/`.

### Lớp 6

| Mạch | Công thức / kiến thức cốt lõi                                                                                                                                                                                                                                                                                                     |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | `[✓]` Số tự nhiên, luỹ thừa: `aᵐ · aⁿ = aᵐ⁺ⁿ`, `aᵐ : aⁿ = aᵐ⁻ⁿ` (m ≥ n, a ≠ 0) · `[✓]` **ƯCLN, BCNN** · `[✓]` **số nguyên** (quy tắc dấu, quy tắc dấu ngoặc) · `[✓]` **phân số** (tử/mẫu nguyên) · `[+]` **số thập phân** (âm, làm tròn & ước lượng) · `[+]` **tỉ số và tỉ số phần trăm** · `[+]` dấu hiệu chia hết, số nguyên tố |
| HINH | `[✓]` Hình học trực quan: tam giác đều, lục giác đều, hình thoi, hình bình hành, hình thang cân · `[✓]` điểm, đường thẳng, đoạn thẳng, trung điểm · `[✓]` góc và số đo góc · `[+]` **chu vi & diện tích các tứ giác đã học** · `[+]` **tính đối xứng** (trục đối xứng, tâm đối xứng) — cả một chương riêng (V)                    |
| TK   | `[✓]` Thu thập, phân loại dữ liệu · `[✓]` biểu đồ cột kép · `[✓]` xác suất thực nghiệm · `[+]` biểu đồ tranh, bảng thống kê                                                                                                                                                                                                       |

**3 chủ đề MVP đợt 2a (chốt theo SGK):** Số tự nhiên & phép tính · Phân số · Số nguyên _(giữ
nguyên — cả ba là chương I-III và VI của sách, đều ✅ chấm tự động)_

### Lớp 7

| Mạch | Công thức / kiến thức cốt lõi                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | `[✓]` **Số hữu tỉ** ℚ · `[✓]` luỹ thừa số hữu tỉ · `[✓]` **tỉ lệ thức** `a/b = c/d ⟺ ad = bc` · `[✓]` **dãy tỉ số bằng nhau** · `[✓]` đại lượng tỉ lệ thuận `y = kx`, tỉ lệ nghịch `y = a/x` · `[✓]` biểu thức đại số, đa thức một biến (cộng, trừ, nhân, chia) · `[+]` **số thực ℝ**: số thập phân vô hạn tuần hoàn, **số vô tỉ, căn bậc hai số học `√a`**, giá trị tuyệt đối                                                                                                              |
| HINH | `[✓]` Góc ở vị trí đặc biệt (kề bù, đối đỉnh), tia phân giác · `[✓]` tiên đề Euclid về đường thẳng song song · `[✓]` **tổng ba góc trong tam giác = 180°** · `[✓]` các trường hợp bằng nhau của tam giác · `[✓]` **quan hệ giữa góc và cạnh đối diện** · `[✓]` **bất đẳng thức tam giác** `\|b − c\| < a < b + c` · `[✓]` các đường đồng quy trong tam giác · `[+]` **hình hộp chữ nhật, hình lập phương, hình lăng trụ đứng tam giác/tứ giác** (chương X — thể tích, diện tích xung quanh) |
| TK   | `[✓]` Biểu đồ đoạn thẳng, biểu đồ hình quạt tròn · `[✓]` biến cố, xác suất của biến cố · `[+]` thu thập và phân loại dữ liệu (bài mở đầu chương V)                                                                                                                                                                                                                                                                                                                                          |

**3 chủ đề MVP đợt 2a (chốt theo SGK):** Số hữu tỉ · Tỉ lệ thức & đại lượng tỉ lệ · Đa thức một
biến _(`[≠]` đổi "Biểu thức đại số đơn giản" → **Đa thức một biến**: chương VII của sách dành 5
bài cho đa thức một biến, chỉ 1 bài cho biểu thức đại số → đa thức mới là trọng tâm)_

### Lớp 8

| Mạch | Công thức / kiến thức cốt lõi                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | `[✓]` **7 hằng đẳng thức đáng nhớ** (xem §4.1) · `[✓]` phân tích đa thức thành nhân tử · `[✓]` phân thức đại số (4 phép tính) · `[✓]` **phương trình bậc nhất một ẩn** `ax + b = 0` (a ≠ 0) ⟹ `x = −b/a` · `[✓]` **hàm số bậc nhất** `y = ax + b`, hệ số góc `a` · `[+]` **đơn thức, đa thức nhiều biến** (chương I — 5 bài, nền cho hằng đẳng thức) · `[+]` giải bài toán bằng cách lập phương trình                                                                                       |
| HINH | `[✓]` **Định lý Pythagore** `a² + b² = c²` và định lý đảo (SGK đặt ở tập hai, trong chương IX Tam giác đồng dạng) · `[✓]` tứ giác: hình thang cân, hình bình hành, hình chữ nhật, hình thoi, hình vuông · `[✓]` **định lý Thalès** trong tam giác · `[✓]` hình chóp tam giác/tứ giác đều · `[+]` **đường trung bình của tam giác**, **tính chất đường phân giác** (cùng chương IV với Thalès) · `[+]` **tam giác đồng dạng** (3 trường hợp đồng dạng, hình đồng dạng) — cả một chương riêng |
| TK   | `[✓]` Thu thập & phân tích dữ liệu · `[✓]` xác suất lý thuyết vs thực nghiệm · `[+]` `P(A) = n(A)/n(Ω)` — cách tính xác suất bằng tỉ số (bài riêng)                                                                                                                                                                                                                                                                                                                                         |

**3 chủ đề MVP đợt 2a (chốt theo SGK):** Hằng đẳng thức đáng nhớ · Phương trình bậc nhất một ẩn ·
Hàm số bậc nhất _(giữ nguyên — cả ba là chương II và VII của sách; chỉ đổi thứ tự để đúng trình tự
dạy: hằng đẳng thức ở tập một, phương trình/hàm số ở tập hai)_

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

| Mạch | Công thức / kiến thức cốt lõi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | `[✓]` **Căn bậc hai** `√(A²) = \|A\|`, `√(ab) = √a·√b` (a,b ≥ 0), `√(a/b) = √a/√b` (a ≥ 0, b > 0) · `[✓]` **hệ phương trình bậc nhất hai ẩn** (thế, cộng đại số) · `[✓]` **phương trình bậc hai** `ax² + bx + c = 0`: `Δ = b² − 4ac`, `x = (−b ± √Δ)/(2a)` · `[✓]` **định lý Viète** `x₁ + x₂ = −b/a`, `x₁·x₂ = c/a` (SGK dành hẳn 1 bài) · `[✓]` hàm số `y = ax²` (a ≠ 0) · `[+]` **căn bậc ba và căn thức bậc ba** · `[+]` **bất đẳng thức và bất phương trình bậc nhất một ẩn** (cả một chương — II) · `[+]` phương trình quy về bậc nhất (phương trình tích, chứa ẩn ở mẫu)                                                                                                                                                                                                                                                                                                                                                              |
| HINH | `[✓]` **Tỉ số lượng giác góc nhọn**: `sin α = đối/huyền`, `cos α = kề/huyền`, `tan α = đối/kề`, `cot α = kề/đối`; `sin²α + cos²α = 1` · `[✓]` **đường tròn**: `C = 2πR`, `S = πR²`; góc nội tiếp = ½ góc ở tâm cùng chắn cung · `[✓]` hình trụ, hình nón, hình cầu (`S_cầu = 4πR²`, `V_cầu = (4/3)πR³`) · `[+]` **hệ thức giữa cạnh và góc trong tam giác vuông** (Bài 12): cạnh góc vuông = cạnh huyền × sin góc đối = cạnh huyền × cos góc kề; cạnh góc vuông = cạnh góc vuông kia × tan góc đối = × cot góc kề · `[−]` **hệ thức về hình chiếu `h² = b'·c'`, `b² = a·b'`, `a·h = b·c`** — **ĐÃ BỎ**: xác nhận trên nội dung sách 2026-08-01, chương IV lớp 9 KNTT không dạy nhóm hệ thức này (xem §8) · `[+]` **độ dài cung, diện tích hình quạt tròn, hình vành khuyên** · `[+]` **vị trí tương đối** của đường thẳng–đường tròn và của hai đường tròn · `[+]` **tứ giác nội tiếp**, **đa giác đều**, đường tròn ngoại/nội tiếp tam giác |
| TK   | `[✓]` Bảng tần số, tần số tương đối · `[✓]` xác suất của biến cố · `[+]` **tần số & tần số tương đối GHÉP NHÓM** + biểu đồ tương ứng · `[+]` phép thử ngẫu nhiên, không gian mẫu                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

**3 chủ đề MVP đợt 2a (chốt theo SGK):** Căn bậc hai & căn bậc ba · Hệ phương trình bậc nhất hai ẩn ·
Phương trình bậc hai và định lí Viète _(giữ nguyên 3 chủ đề, mở rộng phạm vi cho khớp chương III và
chương VI của sách)_

---

## 5. CẤP 3 — THPT (lớp 10-12) — đợt 2d

> ⚠️ Cấp này kiến thức nặng, rủi ro sai nội dung cao nhất → yêu cầu duyệt chuyên môn kỹ hơn cấp
> dưới (đặc tả GĐ2 §7). Ngoài ra **không phải chủ đề nào cũng chấm tự động được** — phần chứng
> minh/khảo sát hàm số cần lời giải tự luận, nằm ngoài phạm vi MVP (§2.3 đặc tả GĐ2). Ở đợt 2d
> chỉ chọn chủ đề có **đáp số/biểu thức chấm được**.

### Lớp 10

| Mạch | Công thức cốt lõi |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- | --- | --- | --------------------------------------------------------------------- |
| SO | Mệnh đề, tập hợp · bất phương trình & hệ bất phương trình bậc nhất hai ẩn · **dấu tam thức bậc hai** · phương trình quy về bậc hai |
| HINH | **Định lý cosin** `a² = b² + c² − 2bc·cos A` · **định lý sin** `a/sin A = b/sin B = c/sin C = 2R` · **diện tích tam giác**: `S = ½ab·sin C`, `S = abc/(4R)`, `S = pr`, **Heron** `S = √(p(p−a)(p−b)(p−c))` · vectơ (tổng, hiệu, tích vô hướng `a⃗·b⃗ = | a⃗  |     | b⃗  | cos θ`) · phương trình đường thẳng, đường tròn trong mặt phẳng toạ độ |
| TK | Số gần đúng, sai số · các số đặc trưng đo xu thế trung tâm và độ phân tán (phương sai, độ lệch chuẩn) · quy tắc đếm, hoán vị `Pₙ = n!`, chỉnh hợp `Aₙᵏ = n!/(n−k)!`, tổ hợp `Cₙᵏ = n!/(k!(n−k)!)` · **nhị thức Newton** |

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

---

## 8. Nhật ký đối chiếu SGK (2026-08-01)

**Phạm vi đã đối chiếu:** §4 — cấp 2, lớp 6-9, bộ "Kết nối tri thức" (8 tập trong
`tai-lieu-sgk/SGK-Toan/`, trích mục lục bằng OCR tiếng Việt).
**Chưa đối chiếu:** §2 (mầm non), §3 (lớp 1-5), §5 (lớp 10-12) — chưa có sách trong `tai-lieu-sgk/`.

> **Đợt đối chiếu lại — 2026-08-01 (bộ ảnh scan mới).** Nguồn tài liệu đã đổi từ 8 file PDF sang
> 8 thư mục ảnh PNG (`Toan 6-1/` … `Toan 9-2/`), OCR bằng `scripts/ocr-images.py` (thêm bước OCR
> riêng nửa trái/nửa phải ảnh để tách đúng mục lục trình bày 2 cột). Kết quả:
>
> - **Cả 4 lớp 6, 7, 8, 9 đều KHÔNG đổi cấu trúc chương/bài** so với lần đối chiếu trước → 4 file
>   `docs/research/muc-luc-sgk/toan-6..9.md` giữ nguyên bảng, chỉ thêm ghi chú xác nhận.
> - **Bản Toán 9 không còn là bản mẫu thẩm định** — bìa `Toan 9-1/page_0001.png` không còn
>   watermark "Bản mẫu"/"BanMau"; Toán 6 ghi "Tái bản lần thứ năm". 32 bài của Toán 9 trùng khít
>   bản mẫu cũ ⇒ bản in chính thức không đổi cấu trúc.
> - **Điểm nghi vấn §8.3 mục 1 (hệ thức lượng) đã giải quyết** — xem bảng §8.1 và §8.3.
> - **Thêm 1 mục lệch mới** (mục 25 ở §8.1): nhóm hệ thức **cạnh–góc** của Bài 12 mà kho kiến thức
>   trước đây không ghi. Ngoài mục này, không phát hiện thêm lệch nào so với 24 mục cũ.

### 8.1 Bảng thay đổi — tất cả mục `[≠]` `[+]` `[−]`

| Lớp | Ký hiệu | Nội dung                                                                        | Đã làm gì                                                                                                                                                                                                                                                                                        |
| --- | ------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 6   | `[+]`   | Số thập phân (âm), làm tròn & ước lượng                                         | Bổ sung vào mạch SO — SGK có hẳn chương VII                                                                                                                                                                                                                                                      |
| 6   | `[+]`   | Tỉ số và tỉ số phần trăm                                                        | Bổ sung vào mạch SO (Bài 31)                                                                                                                                                                                                                                                                     |
| 6   | `[+]`   | Dấu hiệu chia hết, số nguyên tố                                                 | Bổ sung vào mạch SO (chương II)                                                                                                                                                                                                                                                                  |
| 6   | `[+]`   | Chu vi & diện tích các tứ giác đã học                                           | Bổ sung vào mạch HINH (Bài 20)                                                                                                                                                                                                                                                                   |
| 6   | `[+]`   | Tính đối xứng (trục / tâm đối xứng)                                             | Bổ sung vào mạch HINH — SGK có hẳn chương V                                                                                                                                                                                                                                                      |
| 6   | `[+]`   | Biểu đồ tranh, bảng thống kê                                                    | Bổ sung vào mạch TK (Bài 39)                                                                                                                                                                                                                                                                     |
| 7   | `[+]`   | Số thực ℝ, số vô tỉ, **căn bậc hai số học `√a`**, số thập phân vô hạn tuần hoàn | Bổ sung vào mạch SO — chương II tập một. Kho cũ chỉ nhắc căn bậc hai ở lớp 9                                                                                                                                                                                                                     |
| 7   | `[+]`   | Hình hộp chữ nhật, hình lập phương, hình lăng trụ đứng                          | Bổ sung vào mạch HINH — chương X tập hai                                                                                                                                                                                                                                                         |
| 7   | `[+]`   | Thu thập và phân loại dữ liệu                                                   | Bổ sung vào mạch TK (Bài 17)                                                                                                                                                                                                                                                                     |
| 7   | `[≠]`   | Chủ đề MVP "Biểu thức đại số đơn giản"                                          | **Đổi thành "Đa thức một biến"** — SGK dành 5 bài cho đa thức một biến, chỉ 1 bài cho biểu thức đại số                                                                                                                                                                                           |
| 8   | `[+]`   | Đơn thức, đa thức nhiều biến (chương I, 5 bài)                                  | Bổ sung vào mạch SO — là tiền đề của hằng đẳng thức                                                                                                                                                                                                                                              |
| 8   | `[+]`   | Giải bài toán bằng cách lập phương trình                                        | Bổ sung vào mạch SO (Bài 26)                                                                                                                                                                                                                                                                     |
| 8   | `[+]`   | Đường trung bình của tam giác; tính chất đường phân giác                        | Bổ sung vào mạch HINH — cùng chương IV với Thalès                                                                                                                                                                                                                                                |
| 8   | `[+]`   | Tam giác đồng dạng (3 trường hợp, hình đồng dạng)                               | Bổ sung vào mạch HINH — SGK có hẳn chương IX                                                                                                                                                                                                                                                     |
| 8   | `[+]`   | `P(A) = n(A)/n(Ω)` — tính xác suất bằng tỉ số                                   | Bổ sung vào mạch TK (Bài 31)                                                                                                                                                                                                                                                                     |
| 8   | `[≠]`   | Vị trí định lí Pythagore                                                        | Ghi rõ: SGK đặt ở **tập hai, chương IX (Tam giác đồng dạng)**, không nằm cùng chương tứ giác                                                                                                                                                                                                     |
| 9   | `[+]`   | Bất đẳng thức và **bất phương trình bậc nhất một ẩn**                           | Bổ sung vào mạch SO — SGK có hẳn chương II. Kho cũ **thiếu hoàn toàn** nội dung này ở mọi lớp cấp 2                                                                                                                                                                                              |
| 9   | `[+]`   | Căn bậc ba và căn thức bậc ba                                                   | Bổ sung vào mạch SO (Bài 10)                                                                                                                                                                                                                                                                     |
| 9   | `[+]`   | Phương trình quy về bậc nhất (phương trình tích, chứa ẩn ở mẫu)                 | Bổ sung vào mạch SO (Bài 4)                                                                                                                                                                                                                                                                      |
| 9   | `[+]`   | Độ dài cung tròn, diện tích hình quạt tròn & hình vành khuyên                   | Bổ sung vào mạch HINH (Bài 15)                                                                                                                                                                                                                                                                   |
| 9   | `[+]`   | Vị trí tương đối đường thẳng–đường tròn; hai đường tròn                         | Bổ sung vào mạch HINH (Bài 16-17)                                                                                                                                                                                                                                                                |
| 9   | `[+]`   | Tứ giác nội tiếp, đa giác đều, đường tròn ngoại/nội tiếp tam giác               | Bổ sung vào mạch HINH — chương IX tập hai                                                                                                                                                                                                                                                        |
| 9   | `[+]`   | Tần số & tần số tương đối **ghép nhóm**                                         | Bổ sung vào mạch TK (Bài 24)                                                                                                                                                                                                                                                                     |
| 9   | `[+]`   | Phép thử ngẫu nhiên, không gian mẫu                                             | Bổ sung vào mạch TK (Bài 25)                                                                                                                                                                                                                                                                     |
| 9   | `[−]`   | Hệ thức lượng `h² = b'·c'`, `b² = a·b'`, `a·h = b·c`                            | ✅ **Đã xác nhận trên nội dung sách (2026-08-01) — KHÔNG dạy ở lớp 9 KNTT.** Chương IV chỉ có Bài 11 (tỉ số lượng giác) và Bài 12 (hệ thức giữa cạnh và góc); đọc hết ảnh `Toan 9-1/page_0069.png` → `page_0081.png` không thấy nhóm hệ thức về hình chiếu. Bỏ khỏi mạch HINH lớp 9 (§8.3 mục 1) |

| 9 | `[+]` | Hệ thức giữa **cạnh và góc** trong tam giác vuông (Bài 12) | Bổ sung vào mạch HINH — phát hiện ở đợt đối chiếu lại 2026-08-01, đây mới là nhóm hệ thức thật sự được dạy ở chương IV lớp 9 (thay cho nhóm hệ thức hình chiếu đã bỏ ở dòng trên) |

**Tổng cộng: 25 mục** — `[+]` 22 · `[≠]` 2 · `[−]` 1 · phần còn lại `[✓]` giữ nguyên.
(24 mục ở đợt đối chiếu 2026-08-01 lần đầu + 1 mục bổ sung ở đợt đối chiếu lại với bộ ảnh scan mới.)

### 8.2 Kết luận cho các điểm ĐÃ ĐÁNH DẤU NGHI NGỜ (Bước 3 của quy trình)

| Chỗ nghi ngờ                                                       | Kết luận sau khi đọc mục lục thật                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Thống kê & Xác suất dạy từ lớp mấy**                             | ✅ **Đã kết luận được.** Mạch TK có mặt ở **cả 4 lớp 6-9**, mỗi lớp ít nhất một chương riêng: L6 chương IX (dữ liệu + xác suất thực nghiệm) · L7 chương V (thu thập, biểu diễn) + chương VIII (biến cố, xác suất) · L8 chương V (dữ liệu, biểu đồ) + chương VIII (xác suất) · L9 chương VII (tần số) + chương VIII (xác suất). Kho kiến thức cũ ghi đúng mốc lớp, nhưng **ghi thiếu chi tiết** — đã bổ sung ở §8.1.                                                                                                                            |
| Nội dung **STEM / chuyển đổi số** mới                              | 🟡 **Chưa kết luận được — CẦN GIÁO VIÊN XÁC NHẬN.** Mục lục cho thấy mọi tập đều có "Hoạt động thực hành trải nghiệm" dùng **GeoGebra** (L6-L9) và **Excel** (L9 tập hai). Nhưng **không xác định được** phần nào là do Thông tư 17/2025 thêm vào — bộ ảnh scan mới (2026-08-01) là **ấn bản chính thức** (không còn watermark bản mẫu, Toán 6 "Tái bản lần thứ năm") nhưng vẫn không có bản đối chứng của SGK chỉnh sửa theo TT 17/2025 để so. **Không đoán.**                                                                                |
| **Hệ thức lượng trong tam giác vuông (lớp 9)**                     | ✅ **Đã kết luận được (2026-08-01, bộ ảnh scan mới).** Chương IV lớp 9 KNTT dạy **tỉ số lượng giác góc nhọn** (Bài 11) và **hệ thức giữa cạnh và góc** (Bài 12); đọc toàn bộ nội dung chương (`Toan 9-1/page_0069.png` → `page_0081.png`) **không thấy** nhóm hệ thức về hình chiếu `h² = b'·c'`, `b² = a·b'`, `a·h = b·c` ở bất kỳ khung kiến thức trọng tâm nào. Bài tập 4.15 tuy có dùng chân đường cao `H` với `HB`, `HC` nhưng hướng giải là tỉ số lượng giác, không phải hệ thức hình chiếu. ⇒ **Đã bỏ nhóm hệ thức này khỏi §4 lớp 9.** |
| `n = V/24` hay `V/22,4` · `g = 10` hay `9,8` · phân môn KHTN lớp 9 | Ngoài phạm vi phiên này (thuộc `kho-kien-thuc-hoa` / `kho-kien-thuc-ly`) — chưa có SGK KHTN trong `tai-lieu-sgk/`, **chưa đối chiếu**.                                                                                                                                                                                                                                                                                                                                                                                                         |

### 8.3 Danh sách cần GIÁO VIÊN CHUYÊN MÔN duyệt lần cuối

1. ~~**Hệ thức lượng trong tam giác vuông (lớp 9)**~~ — ✅ **ĐÃ GIẢI QUYẾT 2026-08-01**, không còn
   cần giáo viên duyệt. Bằng chứng: OCR toàn bộ chương IV trên bộ ảnh scan mới
   (`tai-lieu-sgk/SGK-Toan/Toan 9-1/page_0069.png` → `page_0081.png`) — chương chỉ gồm Bài 11
   (tỉ số lượng giác góc nhọn) và Bài 12 (hệ thức giữa cạnh và góc), **không dạy** `h² = b'·c'`,
   `b² = a·b'`, `a·h = b·c`. Kho kiến thức §4 lớp 9 đã bỏ nhóm hệ thức hình chiếu và bổ sung nhóm
   hệ thức cạnh–góc.
2. **Ảnh hưởng của Thông tư 17/2025 lên môn Toán** — 🟡 **VẪN CẦN XÁC NHẬN** (đã thu hẹp).
   Bộ ảnh scan mới (2026-08-01) là **ấn bản chính thức**, không còn watermark "Bản mẫu" như PDF
   cũ (Toán 6 ghi "Tái bản lần thứ năm"), và cấu trúc 32 bài của Toán 9 **trùng khít** bản mẫu
   thẩm định theo QĐ 1551/QĐ-BGDĐT 05/6/2023 ⇒ phần "bản mẫu có thể khác bản in" **đã loại trừ**.
   Còn lại: cần người có bản SGK **chỉnh sửa theo TT 17/2025** áp dụng từ năm học 2026-2027 xác
   nhận thứ tự chương/bài không đổi. **Không đoán.**
3. **Phân bố mạch TK lớp 8** — SGK chia làm hai chương ở hai tập (V và VIII); cần xác nhận thứ tự
   dạy thực tế trên lớp có theo đúng thứ tự sách không (ảnh hưởng `prerequisites`).
4. **Toán 7 — vị trí căn bậc hai số học.** SGK dạy `√a` ngay từ lớp 7 (Bài 6). Cần xác nhận mức độ
   sâu ở lớp 7 so với lớp 9 để đặt `prerequisites` đúng, tránh dạy trùng.
5. **Các bài ❌ (chứng minh hình học)** — Toán 7 chương IV, Toán 8 chương IX. Cần xác nhận việc
   **loại khỏi MVP** là chấp nhận được về mặt sư phạm (học sinh vẫn phải học phần này trên lớp).
