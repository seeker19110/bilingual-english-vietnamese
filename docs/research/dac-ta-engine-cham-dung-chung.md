# Đặc tả ENGINE CHẤM DÙNG CHUNG (Toán · Lý · Hoá) — `packages/core-grading`

> Ngày: 2026-08-01 · Trạng thái: **ĐÃ THI HÀNH** — `packages/core-grading/` đã có code + 74 test
> (99% câu lệnh · 90,6% nhánh). Bước 1-4 của §10 xong; còn bước 5 (nối vào `api/` chấm lại phía
> server) chờ khi có app Toán thật. Đặc tả gốc: **KÍN, sẵn sàng thi hành** (đủ chi tiết để giao
> `spec-executor` theo CLAUDE.md §3 — schema, API, tiêu chí chấp nhận đều đã chốt)
> Chặn: **PR-5 của GĐ2** (`dac-ta-gd2-mon-toan-2026-08-01.md` §5) — phải xong trước
> Căn cứ phát sinh: `kho-kien-thuc-ly-gdpt2018.md` §4 + `kho-kien-thuc-hoa-gdpt2018.md` §4

---

## 0. Vì sao phải làm NGAY ở GĐ2, không chờ GĐ3

Đặc tả GĐ2 ban đầu (§3.3) mô tả chấm là "so khớp số/biểu thức chuẩn hoá" — **đúng cho Toán,
thiếu cho Lý/Hoá**:

| Phát hiện khi lập kho kiến thức Lý/Hoá       | Hệ quả nếu engine chỉ biết "số trần"                       |
| -------------------------------------------- | ---------------------------------------------------------- |
| Đáp án Lý/Hoá là **(giá trị, đơn vị)**       | `10 N` và `10 kg` bị chấm như nhau → sai nghiêm trọng      |
| Học sinh trả `1 km` thay `1000 m` — vẫn đúng | Bị chấm sai → mất niềm tin, đúng rủi ro 🔴 đã ghi ở GĐ2 §7 |
| Bài dùng `g = 10` vs `g = 9,8` lệch vài %    | Dung sai cứng → chấm sai hàng loạt                         |
| Cân bằng PTHH cần kiểm bảo toàn nguyên tố    | Không so khớp chuỗi được → phải có nhánh riêng             |

**Chi phí sửa sau ≫ chi phí thiết kế đúng ngay.** Engine viết cho Toán trước, nhưng **kiểu dữ
liệu đáp án phải mở sẵn cho đơn vị** ngay từ đầu (Toán để đơn vị rỗng).

**Nguyên tắc bất di bất dịch: KHÔNG có AI trong luồng chấm.** Engine thuần thuật toán, tất định
(cùng đầu vào → cùng kết quả), chạy được offline, test được 100%. AI chỉ dùng để _giải thích_
sau khi đã biết đúng/sai — không bao giờ để _phán_ đúng/sai.

---

## 1. Vị trí & ranh giới

```
packages/core-grading/          ← MỚI
  src/
    index.ts                    ← export công khai: gradeAnswer, parseAnswer
    number.ts                   ← chuẩn hoá số (dấu phẩy thập phân VN, luỹ thừa, …)
    units.ts                    ← hệ đơn vị: vector thứ nguyên + quy đổi
    tolerance.ts                ← chính sách dung sai
    expression.ts               ← so khớp biểu thức đại số (§5)
    chemistry.ts                ← công thức hoá học + cân bằng PTHH (§6)
    types.ts
  test/                         ← bắt buộc, xem §8
```

Thuần TypeScript, **không phụ thuộc React, không gọi mạng, không đọc DB**. Dùng được cả ở client
(chấm nhanh, phản hồi tức thì) lẫn server (chấm lại để chống gian lận — xem §7).

---

## 2. API công khai — hợp đồng duy nhất

```ts
/** Chấm một câu trả lời. Thuần tuý, tất định, không side-effect, không AI. */
export function gradeAnswer(raw: string, spec: AnswerSpec): GradeResult

export type GradeResult = {
  correct: boolean
  /** Mã lý do — để UI hiện gợi ý mà KHÔNG cần gọi AI. Xem §2.1 */
  reason: ReasonCode
  /** Dạng đã chuẩn hoá của câu trả lời, để hiện lại cho học sinh + lưu log */
  normalized?: string
}
```

### 2.1 `ReasonCode` — phản hồi có ích mà không cần AI

Đây là điểm khiến engine có giá trị sư phạm, không chỉ đúng/sai:

| Mã                  | Ý nghĩa                                         | Gợi ý hiện cho học sinh                  |
| ------------------- | ----------------------------------------------- | ---------------------------------------- |
| `CORRECT`           | Đúng                                            | —                                        |
| `CORRECT_LOOSE`     | Đúng nhưng lệch nhẹ trong dung sai              | "Đúng rồi! Lưu ý làm tròn."              |
| `WRONG_VALUE`       | Sai giá trị                                     | —                                        |
| `WRONG_UNIT`        | **Số đúng, đơn vị sai**                         | "Kết quả đúng nhưng sai đơn vị."         |
| `MISSING_UNIT`      | Đề yêu cầu đơn vị mà học sinh không ghi         | "Nhớ ghi đơn vị nhé."                    |
| `WRONG_DIMENSION`   | Sai thứ nguyên (trả khối lượng cho câu hỏi lực) | "Đại lượng này không phải khối lượng."   |
| `NOT_SIMPLIFIED`    | Đúng nhưng chưa tối giản (phân số, hệ số PTHH)  | "Đúng rồi, rút gọn thêm nhé."            |
| `SIGN_ERROR`        | Đúng trị tuyệt đối, sai dấu                     | "Kiểm tra lại dấu."                      |
| `UNBALANCED_ATOMS`  | PTHH chưa cân bằng nguyên tố                    | Chỉ rõ nguyên tố nào lệch                |
| `UNBALANCED_CHARGE` | PTHH ion chưa cân bằng điện tích                | —                                        |
| `PARSE_ERROR`       | Không hiểu được câu trả lời                     | "Chưa đọc được, kiểm tra lại cách viết." |
| `EMPTY`             | Bỏ trống                                        | —                                        |

> `WRONG_UNIT` và `SIGN_ERROR` là hai lỗi phổ biến nhất của học sinh THCS/THPT — bắt đúng được
> chúng bằng thuật toán tạo ra phản hồi chất lượng cao mà **không tốn một đồng tiền AI nào**.

### 2.2 `AnswerSpec` — khai báo đáp án đúng

```ts
export type AnswerSpec =
  NumericSpec | ExpressionSpec | FractionSpec | ChoiceSpec | ChemFormulaSpec | ChemEquationSpec

type NumericSpec = {
  kind: 'numeric'
  value: number //  giá trị đúng, ở ĐƠN VỊ CHUẨN (SI) — không phải đơn vị hiển thị
  unit?: string //  vd 'm/s'. Bỏ trống = đại lượng không đơn vị (Toán)
  unitRequired?: boolean //  mặc định true khi có `unit`
  tolerance?: Tolerance //  mặc định: xem §4
}
```

**Quy tắc chốt:** `value` luôn lưu ở **đơn vị SI cơ sở**, quy đổi diễn ra lúc chấm. Nhờ vậy học
sinh trả `1 km`, `1000 m` hay `100000 cm` đều so được với cùng một con số.

---

## 3. Chuẩn hoá SỐ — bẫy tiếng Việt phải xử lý

Đây là chỗ dễ sai nhất và **ảnh hưởng 100% người dùng Việt Nam**:

| Đầu vào học sinh gõ  | Ý nghĩa           | Ghi chú                                                    |
| -------------------- | ----------------- | ---------------------------------------------------------- |
| `0,5`                | 0.5               | **Dấu phẩy thập phân — chuẩn Việt Nam, PHẢI hỗ trợ**       |
| `0.5`                | 0.5               | Kiểu Anh–Mỹ, học sinh dùng máy tính bỏ túi hay gõ kiểu này |
| `1.000`              | ⚠️ **nhập nhằng** | VN: một nghìn · Anh–Mỹ: 1.0 — xem quy tắc bên dưới         |
| `1 000`, `1.000.000` | 1000, 1000000     | Dấu phân nhóm nghìn                                        |
| `2^3`, `2**3`        | 8                 |                                                            |
| `1,5.10^3`, `1,5e3`  | 1500              | Ký hiệu khoa học, kiểu VN dùng dấu `.` làm dấu nhân        |
| `−5` (U+2212)        | -5                | Dấu trừ Unicode do copy-paste                              |
| `½`                  | 0.5               | Ký tự phân số Unicode                                      |
| `π`, `pi`            | 3.14159…          |                                                            |
| `√2`, `sqrt(2)`      | 1.41421…          |                                                            |

**Quy tắc gỡ nhập nhằng `1.000`** (chốt, phải test):

1. Nếu chuỗi có **cả** `,` và `.` → dấu xuất hiện **sau cùng** là dấu thập phân, dấu kia là phân nhóm.
2. Nếu chỉ có **một loại** dấu, xuất hiện **một lần**, và **đúng 3 chữ số** theo sau → coi là
   **phân nhóm nghìn** (`1.000` = 1000, `1,000` = 1000).
3. Ngược lại → coi là **dấu thập phân** (`1.5` = 1.5, `0,5` = 0.5).
4. Trường hợp còn nhập nhằng thật sự (`1.000` mà đề mong 1.0) → **đề phải ràng buộc dung sai đủ
   chặt để phân biệt**; nếu không, trả `PARSE_ERROR` còn hơn chấm bừa.

> Quy tắc 2 cố tình ưu tiên cách hiểu Việt Nam vì người dùng mục tiêu là học sinh Việt.

---

## 4. Đơn vị & thứ nguyên

### 4.1 Mô hình

Mỗi đơn vị = **(hệ số quy đổi về SI, vector thứ nguyên)**. Vector 7 chiều theo SI cơ sở:

```
[ kg , m , s , A , K , mol , cd ]
```

Ví dụ: `N` (newton) = hệ số `1`, vector `[1, 1, −2, 0, 0, 0, 0]` (kg·m·s⁻²).
`km/h` = hệ số `1/3.6`, vector `[0, 1, −1, 0, 0, 0, 0]`.

**Lợi ích quyết định:** so sánh **vector thứ nguyên** phát hiện được `WRONG_DIMENSION` — học sinh
trả khối lượng cho câu hỏi về lực bị bắt ngay, dù con số có thể trùng.

### 4.2 Bộ đơn vị tối thiểu phải hỗ trợ

| Nhóm       | Đơn vị                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| Độ dài     | `mm cm dm m km`                                                                                              |
| Khối lượng | `mg g kg tấn` (`t`)                                                                                          |
| Thời gian  | `s min h ngày`                                                                                               |
| Diện tích  | `cm² m² km² ha`                                                                                              |
| Thể tích   | `mL cm³ L m³`                                                                                                |
| Tốc độ     | `m/s km/h`                                                                                                   |
| Lực        | `N kN`                                                                                                       |
| Áp suất    | `Pa kPa bar atm`                                                                                             |
| Năng lượng | `J kJ cal kcal kWh`                                                                                          |
| Công suất  | `W kW MW`                                                                                                    |
| Điện       | `A mA V mV Ω kΩ C F Wb T`                                                                                    |
| Nhiệt độ   | `°C K` — ⚠️ **quy đổi CÓ ĐỘ LỆCH GỐC** (`K = °C + 273,15`), không phải nhân hệ số. Phải xử lý riêng, dễ sai. |
| Hoá học    | `mol mmol g/mol M` (mol/L) `%`                                                                               |

---

## 5. Dung sai (`Tolerance`)

```ts
type Tolerance =
  | { mode: 'exact' } //  bằng đúng (số nguyên, phân số tối giản)
  | { mode: 'absolute'; eps: number } //  |a − b| ≤ eps
  | { mode: 'relative'; pct: number } //  |a − b| / |b| ≤ pct
  | { mode: 'sigfig'; digits: number } //  khớp tới n chữ số có nghĩa
```

**Mặc định khi đề không khai báo:**

| Môn  | Mặc định                                                                      |
| ---- | ----------------------------------------------------------------------------- |
| Toán | `exact` với số nguyên/phân số · `relative 0,1%` với số thập phân              |
| Lý   | **`relative 3%`** — hấp thụ chênh lệch `g = 9,8` vs `10`, làm tròn trung gian |
| Hoá  | **`relative 1%`** — hấp thụ chênh lệch nguyên tử khối làm tròn                |

> Vì sao Lý lỏng hơn Hoá: hằng số `g` chênh 2% giữa hai quy ước phổ biến, còn nguyên tử khối chỉ
> chênh dưới 1%. Con số này **phải kiểm chứng bằng bộ test thật** (§8) rồi mới chốt, không đoán.

---

## 6. So khớp BIỂU THỨC đại số — dùng thăm dò số, KHÔNG dùng CAS

Vấn đề: `2(x+1)`, `2x+2`, `2·x+2` là **cùng một biểu thức**, nhưng so chuỗi thì khác nhau.

**Hai hướng, và lý do chọn:**

| Hướng                               | Đánh giá                                                                                            |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| Rút gọn ký hiệu bằng CAS (`mathjs`) | Đúng về lý thuyết nhưng **nặng bundle** (mathjs vài trăm kB), và rút gọn ký hiệu vẫn có ca thất bại |
| ✅ **Thăm dò số ngẫu nhiên**        | Nhẹ, dễ hiểu, dễ test, độ tin cậy thực tế rất cao — **CHỌN**                                        |

### 6.1 Thuật toán thăm dò số

1. Parse cả hai biểu thức thành AST (parser tự viết, phạm vi: `+ − × ÷ ^ √`, ngoặc, hàm lượng
   giác/log cơ bản, biến chữ cái).
2. Lấy tập biến hợp của hai bên. Nếu **khác tập biến** → sai ngay.
3. Lặp `N = 20` lần: gán mỗi biến một giá trị ngẫu nhiên trong khoảng an toàn (tránh 0, ±1 vì
   nhiều biểu thức sai vẫn trùng tại các điểm đó), tính cả hai vế.
4. Nếu một lần cho ra `NaN`/`∞`/chia cho 0 ở **một trong hai bên** → bỏ mẫu đó, lấy mẫu khác (tối
   đa 100 lần thử) — **không** coi là sai.
5. **Đúng ⟺ cả `N` mẫu đều khớp** trong dung sai `relative 1e-9`.

> Xác suất hai biểu thức khác nhau trùng nhau tại 20 điểm ngẫu nhiên là gần như bằng 0. Đây là kỹ
> thuật chuẩn, đơn giản hơn CAS rất nhiều mà đủ tin cậy cho phạm vi phổ thông.

**Kiểm tối giản riêng:** đúng về giá trị nhưng chưa rút gọn (`4/8` vs `1/2`) → `NOT_SIMPLIFIED`,
vẫn tính đúng hay không **do đề quyết định** (`requireSimplified?: boolean`).

---

## 7. Hoá học

### 7.1 Parser công thức — `Fe₂(SO₄)₃` → vector nguyên tố

Yêu cầu: xử lý **ngoặc lồng nhau**, chỉ số dưới cả dạng ASCII (`Fe2(SO4)3`) lẫn Unicode
(`Fe₂(SO₄)₃`), tiền tố hệ số, ngậm nước (`CuSO₄·5H₂O`), ion mang điện (`SO₄²⁻`).

Kết quả: `{ Fe: 2, S: 3, O: 12 }` + điện tích.

### 7.2 Cân bằng phương trình hoá học — chấm TUYỆT ĐỐI chính xác

Không so với một đáp án cố định (bội số của bộ hệ số đúng cũng bảo toàn nguyên tố). Cách đúng:

1. Parse mỗi chất → vector nguyên tố (§7.1).
2. Nhân hệ số học sinh nhập, cộng theo từng vế.
3. **Đúng ⟺ vector hai vế bằng nhau ở MỌI nguyên tố** — nếu lệch, trả `UNBALANCED_ATOMS` **kèm
   tên nguyên tố lệch** (phản hồi cực kỳ có ích, miễn phí).
4. Phản ứng ion: kiểm thêm **bảo toàn điện tích** → `UNBALANCED_CHARGE`.
5. Kiểm **tối giản**: `ƯCLN(các hệ số) = 1`, nếu không → `NOT_SIMPLIFIED`.
6. Hệ số phải là **số nguyên dương**.

> Đây là dạng bài học sinh luyện nhiều nhất mà lại chấm chính xác 100% bằng thuật toán thuần —
> ứng viên số một cho tính năng "đinh" của môn Hoá (xem `kho-kien-thuc-hoa-gdpt2018.md` §4.1).

---

## 8. Chống gian lận — chấm ở đâu

| Nơi                 | Vai trò                                                              |
| ------------------- | -------------------------------------------------------------------- |
| **Client**          | Chấm tức thì để phản hồi nhanh (UX). **KHÔNG tin được.**             |
| **Server** (`api/`) | Chấm LẠI bằng **cùng một hàm** trước khi ghi điểm/tiến độ/SRS vào DB |

Đúng nguyên tắc CLAUDE.md §4.2 ("không tin client; logic nhạy cảm luôn ở server"). Vì engine là
package thuần TS dùng chung, **hai nơi chạy cùng một code** → không có nguy cơ lệch logic.

Đề sinh theo tham số: **đáp án đúng KHÔNG được gửi xuống client** trước khi học sinh nộp — server
giữ `seed` sinh đề, tự tính lại đáp án khi chấm.

---

## 9. Tiêu chí chấp nhận (nghiệm thu PR)

Bắt buộc có test tự động cho **toàn bộ** ca dưới đây — đây là bộ test ca biên mà đặc tả GĐ2 §5
yêu cầu ở PR-5:

**Số & định dạng**

- `0,5` = `0.5` = `1/2` = `½` đều đúng cho đáp án 0.5
- `1.000` hiểu là 1000 (quy tắc §3), `1.5` hiểu là 1.5
- `−5` (dấu trừ Unicode) = `-5`
- `1,5.10^3` = `1,5e3` = `1500`
- Khoảng trắng thừa, dấu `=` thừa ở đầu (`= 5`) vẫn chấp nhận
- Bỏ trống → `EMPTY` (không phải `PARSE_ERROR`)

**Đơn vị**

- `1 km` = `1000 m` = `100000 cm` (đáp án đúng 1000 m)
- Phân biệt hai lỗi (luật đã làm rõ khi thi hành — bản đặc tả đầu tiên nêu hai ca trùng nhau):
  - con số TRÙNG đáp án nhưng đơn vị khác thứ nguyên (`10 kg` khi đáp án `10 N`) → `WRONG_UNIT`
    (học sinh tính đúng, chỉ ghi nhầm đơn vị)
  - con số cũng khác (`10 kg` khi đáp án `50 N`) → `WRONG_DIMENSION` (hiểu sai bản chất đại lượng)
- Thiếu đơn vị khi `unitRequired` → `MISSING_UNIT`
- `25 °C` = `298,15 K` (**ca độ lệch gốc — bắt buộc test**)

**Dung sai**

- `g = 10` vs `g = 9,8`: kết quả lệch 2,04% vẫn đúng với mặc định môn Lý (3%)
- Lệch 5% → sai
- `CORRECT_LOOSE` được trả đúng khi lệch trong dung sai nhưng khác giá trị chuẩn

**Biểu thức**

- `2(x+1)` = `2x+2` = `2*x + 2`
- `x^2-1` = `(x-1)(x+1)`
- `x+1` ≠ `x-1` (phải sai)
- Biểu thức có mẫu số triệt tiêu tại điểm thăm dò → vẫn chấm đúng (lấy mẫu lại, §6.1 bước 4)
- `4/8` với `requireSimplified` → `NOT_SIMPLIFIED`

**Hoá học**

- `Fe2(SO4)3` = `Fe₂(SO₄)₃` → `{Fe:2, S:3, O:12}`
- `CuSO₄·5H₂O` parse đúng (ngậm nước)
- PTHH cân bằng đúng → `CORRECT`
- Hệ số gấp đôi bộ tối giản → `NOT_SIMPLIFIED`
- Lệch nguyên tố → `UNBALANCED_ATOMS` **có nêu đúng tên nguyên tố lệch**
- Phản ứng ion lệch điện tích → `UNBALANCED_CHARGE`

**Bất biến chung**

- `gradeAnswer` là **hàm thuần**: gọi 2 lần cùng đầu vào → cùng kết quả (kể cả nhánh thăm dò
  ngẫu nhiên §6 — dùng seed cố định để tất định)
- **Không có** lệnh gọi mạng / AI nào trong package (test canh gác: quét import)

**Cổng chất lượng:** độ phủ test của `packages/core-grading` **≥ 90%** (cao hơn ngưỡng chung của
repo — vì chấm sai ảnh hưởng trực tiếp niềm tin người học, rủi ro 🔴 ở GĐ2 §7).

---

## 10. Thứ tự thi hành

| Bước | Nội dung                                    | Phục vụ         | Giao cho                                         |
| ---- | ------------------------------------------- | --------------- | ------------------------------------------------ |
| 1    | `types.ts` + `number.ts` + test (§3)        | Toán            | `spec-executor`                                  |
| 2    | `units.ts` + `tolerance.ts` + test (§4, §5) | Lý/Hoá (mở sẵn) | `spec-executor`                                  |
| 3    | `expression.ts` + test (§6)                 | Toán PR-5       | `complex-implementer` (thuật toán, cần tự quyết) |
| 4    | `chemistry.ts` + test (§7)                  | GĐ3 Hoá         | `spec-executor`                                  |
| 5    | Nối vào `api/` chấm lại phía server (§8)    | Cả 3 môn        | `standard-worker`                                |

Bước 1-3 nằm trong phạm vi **GĐ2 PR-5**. Bước 4 hoãn tới GĐ3 nhưng **kiểu dữ liệu phải có sẵn từ
bước 1** để không phải đổi API về sau.
