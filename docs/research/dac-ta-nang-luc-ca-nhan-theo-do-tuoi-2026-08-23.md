# Đặc tả: Năng lực cá nhân theo độ tuổi × bậc thành thạo × ngành nghề (2026-08-23)

> **Câu hỏi nghiên cứu (người dùng đặt):** ở mỗi độ tuổi, một người **cần có những năng lực gì**;
> khác nhau thế nào theo **giới tính**, **thâm niên**, **ngành nghề**; và làm sao **xác định**
> người đó đang ở đâu rồi **hướng dẫn** họ đạt được các năng lực đó.
>
> **Trạng thái:** tài liệu NGHIÊN CỨU + ĐẶC TẢ. Chưa viết code. Cần người dùng duyệt mục 12
> (kế hoạch triển khai) trước khi mở PR code.
>
> **Thuộc trụ:** LIFE + CAREER (nền tảng DHCB). Xây TRÊN hệ đã có
> (`packages/core-domains/lifeMilestoneMasteryService.ts` — 8 giai đoạn cuộc đời), **không** tạo
> hệ song song. Xem mục 12.0 "Luật chống trùng hệ".

> **Bộ tài liệu này gồm 3 phần — đọc theo thứ tự:**
>
> 1. **(file này)** Khung: 3 trục, 30 năng lực lõi, 8 băng tuổi 6→50+.
> 2. `nang-luc-10-40-chi-tiet-2026-08-23.md` — chi tiết vận hành quãng **10–40** (6 băng nhỏ,
>    ngưỡng đo được, bài tự chẩn đoán, chương trình 12 tuần, đường bù khi chưa đạt).
> 3. `dong-hanh-va-phat-trien-nang-khieu-2026-08-23.md` — **tư thế đồng hành** (8 luật hành xử của
>    Companion) + **đường ĐỈNH phát triển năng khiếu** + cơ chế đóng góp xã hội. Chứa luật số 1 của
>    cả sản phẩm: kết quả chẩn đoán không bao giờ là màn hình chính.

---

## 1. Tóm tắt cho người bận

1. **Không dùng "tuổi" làm trục duy nhất.** Tuổi chỉ nói được _cửa sổ cơ hội sinh học/xã hội_.
   Năng lực thật phụ thuộc **bậc thành thạo** (Dreyfus) và **họ ngành nghề**. Ba trục A/B/C ở mục 4.
2. **"Thâm niên" phải đo bằng BẬC, không bằng SỐ NĂM.** Mười năm lặp lại một việc ≠ mười năm tích
   luỹ. Đặc tả dùng thang 5 bậc có tiêu chí chuyển bậc quan sát được (mục 6).
3. **Giới tính KHÔNG phải biến năng lực.** Nó là **biến ngữ cảnh vòng đời** (gián đoạn nghề do
   sinh con/chăm sóc, định kiến tuyển dụng). Hệ thống điều chỉnh _dòng thời gian và nội dung hỗ
   trợ_, tuyệt đối không điều chỉnh _kỳ vọng năng lực_ theo giới. Chi tiết + bằng chứng ở mục 8.
4. **30 năng lực lõi**, 6 nhóm, mã hoá `CAP-<nhóm>-<số>` (mục 5) — đây là danh sách "liệt kê" mà
   yêu cầu đòi hỏi.
5. **Bảng chính** (mục 7): 8 băng tuổi × năng lực trọng tâm × dấu hiệu đạt quan sát được ×
   hành động 90 ngày. Đây là phần "hướng dẫn cá nhân ở độ tuổi đó đạt được".
6. **Xác định bằng bằng chứng, không bằng tự khai.** Bốn loại bằng chứng ở mục 10.

---

## 2. Phạm vi & KHÔNG thuộc phạm vi

| Thuộc phạm vi                                          | Không thuộc phạm vi                            |
| ------------------------------------------------------ | ---------------------------------------------- |
| Người 6 tuổi → 65+ (khớp 8 giai đoạn đã có trong code) | Trẻ 0–6 tuổi (cần chuyên môn nhi khoa riêng)   |
| Năng lực có thể **rèn luyện và quan sát được**         | Chẩn đoán y tế, tâm lý lâm sàng, đo IQ         |
| Hướng dẫn hành động 90 ngày                            | Tư vấn pháp lý, tư vấn đầu tư cá nhân hoá      |
| Bối cảnh Việt Nam (học chế, luật lao động, thị trường) | Xếp hạng/so sánh người dùng với nhau công khai |

**Ranh giới an toàn:** mọi nội dung sinh ra phải đi qua bộ lọc tuân thủ đã có
(`SupremePrincipleCompliance` trong `lifeMilestoneMastery`). Không được phát ngôn kiểu
"ở tuổi này mà chưa X là thất bại" — xem mục 11 (Rủi ro).

---

## 3. Nền khoa học được chọn (và vì sao)

Chọn 6 khung, mỗi khung giải quyết đúng một phần của câu hỏi. Cái gì đã có bằng chứng định lượng
thì dùng số; cái gì chỉ là mô hình mô tả thì dùng làm khung tổ chức, không dùng làm ngưỡng chấm.

| #   | Khung                                                                                                | Trả lời phần nào               | Cách dùng trong DHCB                                                                        |
| --- | ---------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------- |
| 1   | **Erikson** (8 khủng hoảng tâm lý xã hội) + **Havighurst** (nhiệm vụ phát triển)                     | "Tuổi này _việc đời_ là gì"    | Sinh **chủ đề** của mỗi băng tuổi (bản sắc, thân mật, sinh sản–cống hiến, toàn vẹn)         |
| 2   | **Super — Life-Career Rainbow** (Growth → Exploration → Establishment → Maintenance → Disengagement) | "Tuổi này _việc nghề_ là gì"   | Sinh **mục tiêu nghề** của mỗi băng tuổi; giải thích vì sao 24–28 phải thử, 36–45 phải chốt |
| 3   | **Cattell–Horn–Carroll** (trí thông minh lưu động vs. kết tinh) + **Hartshorne & Germine 2015**      | "Tuổi này _não_ mạnh ở đâu"    | Chọn **phương pháp học** theo tuổi (mục 7.9)                                                |
| 4   | **Dreyfus** (5 bậc: Novice → Advanced Beginner → Competent → Proficient → Expert)                    | "Thâm niên thật sự đến đâu"    | **Trục B** — thay hoàn toàn cho "số năm kinh nghiệm"                                        |
| 5   | **WEF Future of Jobs 2025** + **OECD/PIAAC 2024**                                                    | "Thời đại này cần năng lực gì" | Sinh **nội dung** 30 năng lực lõi (mục 5)                                                   |
| 6   | **Baltes — SOC** (Selection–Optimization–Compensation)                                               | "Sau đỉnh thì làm gì"          | Chiến lược cho băng 46+ : chọn hẹp, tối ưu sâu, bù bằng đòn bẩy (mục 7.7–7.8)               |

### 3.1 Ba con số nền tảng phải nhớ

- **Đỉnh năng lực lệch pha nhau rất xa.** Tốc độ xử lý đỉnh ở cuối tuổi teen–đầu 20; trí nhớ làm
  việc đỉnh cuối 20–đầu 30; **đọc cảm xúc người khác đỉnh ở 40–50**; **vốn từ / tri thức kết tinh
  còn tăng đến 65–70** (Hartshorne & Germine, 2015, n≈50.000). ⇒ **Không có "tuổi hết học".**
  Có "tuổi đổi cách học" (mục 7.9).
- **39% năng lực lõi của lực lượng lao động sẽ biến đổi hoặc lỗi thời trước 2030** (WEF 2025);
  nhóm tăng nhanh nhất: AI & dữ liệu lớn, an ninh mạng, năng lực công nghệ; nhóm người-với-người
  tăng mạnh không kém: tư duy sáng tạo, kiên cường/linh hoạt, ham học suốt đời. ⇒ Bộ năng lực
  phải có **cả hai chân** (mục 5), không thiên về kỹ thuật.
- **Kỹ năng người lớn KHÔNG tự động tăng theo tuổi.** PIAAC chu kỳ 2 (công bố 12/2024): năng lực
  đọc hiểu/tính toán của người lớn **giảm hoặc chững** ở hầu hết nước OECD trong 10 năm, kể cả
  nhóm có bằng đại học; khoảng cách giữa nhóm giỏi nhất và yếu nhất **giãn ra**. ⇒ Không rèn thì
  mất. Đây là luận cứ trung tâm cho việc DHCB tồn tại.

---

## 4. Mô hình 3 trục + 2 biến ngữ cảnh

```
Năng lực kỳ vọng của một người
  = f( TRỤC A: giai đoạn đời (tuổi)        → cửa sổ cơ hội, chủ đề đời, phương pháp học
     , TRỤC B: bậc thành thạo (Dreyfus)     → độ sâu kỳ vọng ở năng lực nghề
     , TRỤC C: họ ngành nghề                → năng lực chuyên biệt + đường cong đỉnh nghề
     )
  điều chỉnh bởi
    NGỮ CẢNH 1: gián đoạn sự nghiệp / vai trò chăm sóc  (tuỳ chọn, mục 8)
    NGỮ CẢNH 2: điểm xuất phát (học vấn, sức khoẻ, hoàn cảnh kinh tế)
```

**Vì sao 3 trục chứ không phải 4 (tuổi/giới/thâm niên/ngành):**
"Thâm niên" và "ngành" là trục thật (chúng đổi _nội dung_ năng lực). "Giới tính" **không** đổi nội
dung năng lực — nó đổi _quỹ đạo thời gian_ và _rào cản gặp phải_. Ép nó thành trục thứ 4 sẽ sinh
ra hệ thống ngầm hạ kỳ vọng cho một giới — vừa sai khoa học, vừa là rủi ro đạo đức/pháp lý.

**Quy tắc kết hợp:** Trục A cho **danh mục** năng lực trọng tâm. Trục B cho **ngưỡng đạt** của
từng năng lực nghề. Trục C **thêm** 3–5 năng lực chuyên biệt và **đổi trọng số**. Không trục nào
được phép _xoá_ một năng lực nền (nhóm SEL/WEL luôn bắt buộc ở mọi tổ hợp).

---

## 5. Ba mươi năng lực lõi (danh mục chuẩn)

Mã: `CAP-<nhóm>-<số>`. Mỗi năng lực chấm trên thang **0–100** (mục 9), gắn **bậc Dreyfus** khi
thuộc nhóm PRO/TEC.

### 5.1 Nhóm COG — Nhận thức (nền của mọi trụ)

| Mã     | Năng lực                          | Đo bằng gì (dấu hiệu quan sát được)                                      |
| ------ | --------------------------------- | ------------------------------------------------------------------------ |
| COG-01 | Tư duy phân tích                  | Tách được vấn đề mơ hồ thành các phần kiểm chứng được; nêu được giả định |
| COG-02 | Tư duy phản biện & đánh giá nguồn | Phân biệt tương quan/nhân quả; truy được nguồn gốc một khẳng định        |
| COG-03 | Giải quyết vấn đề phức tạp        | Xử lý được bài toán nhiều ràng buộc, không có đáp án mẫu                 |
| COG-04 | Siêu nhận thức & học cách học     | Tự dự đoán đúng mình biết/không biết gì; chọn đúng chiến lược ôn         |
| COG-05 | Tư duy hệ thống & dài hạn         | Nhìn ra vòng phản hồi, hệ quả bậc 2; lập kế hoạch >1 năm                 |

### 5.2 Nhóm SEL — Cảm xúc & xã hội (WEF: nhóm tăng nhanh thứ 2)

| Mã     | Năng lực                            | Đo bằng gì                                                        |
| ------ | ----------------------------------- | ----------------------------------------------------------------- |
| SEL-01 | Tự điều chỉnh & kiểm soát xung động | Hoãn được phần thưởng; giữ được thói quen 30+ ngày                |
| SEL-02 | Kiên cường & linh hoạt (resilience) | Thời gian phục hồi sau thất bại; số lần quay lại sau gián đoạn    |
| SEL-03 | Đồng cảm & đọc bối cảnh xã hội      | Đọc đúng nhu cầu chưa nói ra của người đối diện                   |
| SEL-04 | Giao tiếp & trình bày thuyết phục   | Người nghe nhắc lại đúng ý chính; viết được văn bản ra quyết định |
| SEL-05 | Hợp tác & xử lý xung đột            | Chủ động nêu bất đồng sớm; giữ được quan hệ sau bất đồng          |

### 5.3 Nhóm TEC — Công nghệ & dữ liệu (WEF: nhóm tăng nhanh nhất)

| Mã     | Năng lực                                        | Đo bằng gì                                           |
| ------ | ----------------------------------------------- | ---------------------------------------------------- |
| TEC-01 | Năng lực số nền                                 | Thiết bị, tệp, sao lưu, tìm kiếm, xác thực thông tin |
| TEC-02 | Đọc & lập luận bằng dữ liệu                     | Đọc được biểu đồ; tự làm được bảng tính có công thức |
| TEC-03 | Cộng tác với AI (đặt bài, kiểm chứng, giới hạn) | Biết khi nào KHÔNG dùng AI; luôn kiểm chứng đầu ra   |
| TEC-04 | An toàn thông tin & quyền riêng tư              | Mật khẩu duy nhất + 2FA; nhận diện lừa đảo           |
| TEC-05 | Tự động hoá công việc lặp                       | Đã tự bỏ được ≥1 việc tay lặp lại/tháng              |

### 5.4 Nhóm PRO — Nghề nghiệp (gắn chặt Trục B & C)

| Mã     | Năng lực                                | Đo bằng gì                                                 |
| ------ | --------------------------------------- | ---------------------------------------------------------- |
| PRO-01 | Chuyên môn lõi của nghề                 | Bậc Dreyfus hiện tại (mục 6)                               |
| PRO-02 | Giao việc trọn gói & quản trị dự án     | Cam kết được thời hạn và giữ được                          |
| PRO-03 | Lãnh đạo & ra quyết định trong bất định | Quyết khi thiếu thông tin, ghi lại lý do, chịu trách nhiệm |
| PRO-04 | Kèm cặp & phát triển người khác         | Có người nêu tên bạn là người đã giúp họ lên bậc           |
| PRO-05 | Thương lượng & xây dựng mạng lưới       | Có mạng lưới yếu (weak ties) ngoài công ty hiện tại        |

### 5.5 Nhóm FIN — Tài chính & nguồn lực

| Mã     | Năng lực                       | Đo bằng gì                                   |
| ------ | ------------------------------ | -------------------------------------------- |
| FIN-01 | Quản lý dòng tiền cá nhân      | Biết chính xác thu–chi tháng gần nhất        |
| FIN-02 | Quỹ dự phòng & bảo hiểm        | Số tháng chi tiêu được phủ bởi tiền mặt      |
| FIN-03 | Tích luỹ & đầu tư dài hạn      | Có tỷ lệ tiết kiệm cố định, tự động hoá      |
| FIN-04 | Quản trị rủi ro & nợ           | Tỷ lệ nợ/thu nhập; hiểu lãi kép cả hai chiều |
| FIN-05 | Quản lý thời gian & năng lượng | Có khối thời gian sâu được bảo vệ hằng tuần  |

### 5.6 Nhóm WEL — Sức khoẻ & ý nghĩa

| Mã     | Năng lực                          | Đo bằng gì                                         |
| ------ | --------------------------------- | -------------------------------------------------- |
| WEL-01 | Thể chất & vận động               | Vận động ≥150 phút/tuần                            |
| WEL-02 | Giấc ngủ                          | Giờ ngủ ổn định; nợ ngủ cuối tuần nhỏ              |
| WEL-03 | Sức khoẻ tinh thần & tìm trợ giúp | Biết dấu hiệu cảnh báo của bản thân; biết tìm ai   |
| WEL-04 | Quan hệ thân mật & gia đình       | Số quan hệ có thể gọi lúc 2 giờ sáng               |
| WEL-05 | Mục đích sống & di sản            | Nói được vì sao mình làm việc đang làm, bằng 1 câu |

> **Bất biến:** với mọi tuổi/giới/nghề, nhóm **SEL** và **WEL** luôn có mặt trong danh mục trọng
> tâm. Đây là chỗ các hệ "phát triển bản thân" thường bỏ quên và là chỗ hỏng gây đổ vỡ nghề nghiệp
> ở băng 36–45.

---

## 6. TRỤC B — Thâm niên đo bằng BẬC, không bằng NĂM

### 6.1 Vì sao bỏ "số năm kinh nghiệm"

Số năm là biến **thay thế tồi**: nó đếm thời gian có mặt, không đếm thời gian _bị thử thách_.
Bằng chứng gián tiếp rất mạnh từ PIAAC 2024 — người lớn có bằng cấp cao mà năng lực vẫn chững/giảm
theo thời gian. Một người 10 năm lặp lại cùng một năm kinh nghiệm sẽ dừng ở bậc 3 vĩnh viễn.
Vì vậy DHCB đo **bậc**, và số năm chỉ dùng để **cảnh báo lệch pha** (mục 6.3).

### 6.2 Thang 5 bậc (Dreyfus, diễn giải cho DHCB)

| Bậc    | Tên           | Đặc trưng nhận biết                                                               | Cần gì để lên bậc kế                              | Thời gian điển hình |
| ------ | ------------- | --------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------- |
| **B1** | Tập sự        | Làm theo quy tắc; không phân biệt được việc nào quan trọng hơn                    | Lặp lại có phản hồi nhanh; checklist              | 0–1 năm             |
| **B2** | Mới thạo việc | Nhận ra tình huống quen; vẫn cần người gỡ khi lệch khuôn                          | Gặp đủ nhiều biến thể; được giao việc hơi quá sức | 1–3 năm             |
| **B3** | Thạo việc     | Tự lập kế hoạch; **chịu trách nhiệm kết quả**, không chỉ thao tác                 | Sở hữu trọn một kết quả có rủi ro thật            | 3–6 năm             |
| **B4** | Thành thục    | Nhìn tình huống theo tổng thể; trực giác đúng thường xuyên, vẫn phân tích khi cần | Dạy lại người khác; đối diện ca khó, hiếm         | 6–12 năm            |
| **B5** | Chuyên gia    | Trực giác dẫn dắt; đặt lại được câu hỏi/định nghĩa vấn đề của ngành               | Tạo ra tri thức mới; xây người kế nhiệm           | 10+ năm             |

> **Luật vàng để lên bậc:** bậc chỉ tăng khi có **rủi ro thật + phản hồi thật**. Học mà không có
> hậu quả thì không lên bậc. Đây là nguyên tắc thiết kế mọi bài tập trong hệ thống này.

### 6.3 Ánh xạ với nhãn thị trường & cờ cảnh báo

| Bậc   | Nhãn thường gặp                         | Cờ cảnh báo DHCB bật khi…                                                                |
| ----- | --------------------------------------- | ---------------------------------------------------------------------------------------- |
| B1–B2 | Intern / Junior / Fresher               | —                                                                                        |
| B3    | Middle / Nhân viên chính                | **Lệch trên:** ≥6 năm nghề mà vẫn B2 → "nguy cơ đóng băng kinh nghiệm"                   |
| B4    | Senior / Chuyên viên chính / Tổ trưởng  | **Lệch dưới:** B4 mà PRO-04 (kèm cặp) = 0 → "chuyên gia cô lập", rủi ro cao khi đổi việc |
| B5    | Lead / Principal / Chuyên gia đầu ngành | **Rủi ro hẹp:** B5 một mảng + TEC-03 thấp → rủi ro lỗi thời do AI                        |

**Cờ "đóng băng kinh nghiệm"** là một trong những giá trị lớn nhất hệ thống có thể tạo ra: nó phát
hiện người đang trôi, trong khi mọi CV vẫn đẹp lên theo năm.

---

## 7. TRỤC A — Bảng chính: năng lực theo băng tuổi

Ký hiệu cột **"Dấu hiệu đạt"**: thứ quan sát/kiểm chứng được, KHÔNG phải cảm nhận.
Ký hiệu **"90 ngày"**: một hành động duy nhất, cụ thể, có thể bắt đầu trong tuần này.

Băng tuổi khớp đúng 8 `LifeStageType` đã có trong `packages/core-contracts/lifeMilestoneMastery.ts`
— **không tạo bộ giai đoạn mới** (xem 12.0).

### 7.1 `early_childhood_primary` — 6–10 tuổi (Cấp 1)

_Chủ đề đời (Erikson): Chăm chỉ vs. Tự ti. Việc nghề (Super): Growth — hình thành khái niệm về mình._

| Năng lực trọng tâm             | Dấu hiệu đạt                                      | Hành động 90 ngày                                     |
| ------------------------------ | ------------------------------------------------- | ----------------------------------------------------- |
| COG-04 Học cách học            | Tự kể được hôm nay học được gì, chỗ nào chưa hiểu | Nhật ký 2 câu mỗi tối: "con hiểu…" / "con chưa hiểu…" |
| SEL-01 Tự điều chỉnh           | Hoàn thành việc chán mà không cần giục 3 lần      | Một việc nhà cố định, tự làm, có bảng đánh dấu        |
| SEL-05 Hợp tác                 | Chơi/làm nhóm không cần người lớn phân xử         | Một hoạt động nhóm cố định hằng tuần                  |
| TEC-01 Số nền + TEC-04 An toàn | Biết không chia sẻ thông tin cá nhân trên mạng    | Quy ước dùng thiết bị viết ra giấy, cả nhà ký         |
| WEL-01/02 Vận động, ngủ        | Vận động ngoài trời mỗi ngày; giờ ngủ cố định     | Khoá giờ ngủ, thiết bị ra khỏi phòng ngủ              |

**Cạm bẫy chính:** đánh đồng "giỏi" với "điểm cao" → hỏng COG-04 và SEL-02 về sau. Người lớn khen
**nỗ lực và chiến lược**, không khen "con thông minh".

### 7.2 `lower_secondary` — 11–14 tuổi (Cấp 2)

_Chủ đề: khởi đầu khủng hoảng bản sắc. Não: tốc độ xử lý đang lên nhanh; điều hành chưa chín._

| Năng lực trọng tâm                | Dấu hiệu đạt                                        | Hành động 90 ngày                                    |
| --------------------------------- | --------------------------------------------------- | ---------------------------------------------------- |
| COG-02 Phản biện & đánh giá nguồn | Tự hỏi "ai nói? sao biết?" trước một tin trên mạng  | Mỗi tuần bóc 1 tin giả, viết 3 dòng vì sao           |
| COG-04 Siêu nhận thức             | Biết mình học tốt hơn bằng cách nào; tự lập lịch ôn | Chuyển sang tự kiểm tra (retrieval) thay vì đọc lại  |
| SEL-02 Kiên cường                 | Sau điểm kém vẫn quay lại trong ≤48 giờ             | "Nhật ký thất bại": mỗi lần hỏng ghi 1 điều học được |
| SEL-04 Giao tiếp                  | Trình bày 3 phút trước lớp không đọc giấy           | Mỗi tháng 1 lần nói trước nhóm ≥5 người              |
| TEC-04 An toàn thông tin          | Có mật khẩu riêng + 2FA; nhận diện bắt nạt mạng     | Rà lại toàn bộ tài khoản, bật 2FA                    |
| WEL-03 Sức khoẻ tinh thần         | Nói được với ≥1 người lớn khi gặp chuyện            | Xác định "3 người con gọi khi khó"                   |

**Cạm bẫy chính:** so sánh xã hội qua mạng xã hội đánh sập SEL-02 đúng lúc bản sắc đang hình thành.

### 7.3 `upper_secondary` — 15–18 tuổi (Cấp 3)

_Chủ đề: Bản sắc vs. Rối loạn vai trò. Việc nghề: Exploration — thử, chưa chốt._

| Năng lực trọng tâm                     | Dấu hiệu đạt                                                | Hành động 90 ngày                                      |
| -------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| COG-01/03 Phân tích, giải quyết vấn đề | Làm được dự án tự chọn, không đề bài mẫu                    | 1 dự án 8 tuần có sản phẩm người ngoài xem được        |
| COG-05 Tư duy dài hạn                  | Nêu được 2 phương án đời mình, kèm đánh đổi                 | Viết "bản đồ 3 ngã rẽ" sau THPT                        |
| PRO-05 Mạng lưới (sơ khai)             | Đã nói chuyện thật với ≥3 người đang làm nghề mình quan tâm | Mỗi tháng 1 cuộc phỏng vấn nghề 20 phút                |
| TEC-02/03 Dữ liệu, cộng tác AI         | Dùng AI để học nhanh hơn mà vẫn tự làm được khi không có AI | Quy tắc: AI giải xong → tự giải lại từ đầu, che đáp án |
| FIN-01 Dòng tiền                       | Biết chi tiêu tháng của mình bằng con số                    | Ghi chi tiêu 30 ngày liên tục                          |
| SEL-01 Tự điều chỉnh                   | Giữ được lịch học sâu tự đặt trong 4 tuần                   | Khối 90 phút không thiết bị, 5 buổi/tuần               |

**Cạm bẫy chính:** chốt nghề quá sớm dựa trên môn học yêu thích, chưa từng tiếp xúc nghề thật.
**Đây là băng tuổi rẻ nhất để thử và sai** — chi phí sai lầm sẽ tăng gấp bội sau 30.

### 7.4 `university_launchpad` — 18–23 tuổi (Đại học / khởi đầu nghề)

\*Não: tốc độ xử lý và trí nhớ làm việc gần đỉnh → đây là **cửa sổ rẻ nhất để nạp kỹ năng khó\***.

| Năng lực trọng tâm                      | Dấu hiệu đạt                                         | Hành động 90 ngày                       |
| --------------------------------------- | ---------------------------------------------------- | --------------------------------------- |
| PRO-01 Chuyên môn lõi → **B2**          | Làm được việc thật có người trả tiền/người dùng thật | Thực tập/dự án thật, không phải bài tập |
| PRO-02 Giao việc trọn gói               | Cam kết deadline và giữ được, 3 lần liên tiếp        | Nhận 1 việc có hạn thật, ngoài trường   |
| SEL-04 Giao tiếp & viết                 | Viết được 1 trang ra quyết định, người lạ đọc hiểu   | Mỗi tuần 1 bài viết công khai           |
| TEC-03 Cộng tác AI + TEC-05 Tự động hoá | Tự bỏ được ≥1 việc tay lặp lại                       | Chọn 1 việc lặp, tự động hoá nó         |
| FIN-02 Quỹ dự phòng                     | Có 1 tháng chi tiêu tiền mặt                         | Trích tự động ngay khi có thu nhập      |
| SEL-03 Đồng cảm + PRO-05 Mạng lưới      | Có ≥5 quan hệ nghề ngoài trường lớp                  | 1 cà phê nghề nghiệp/tháng              |
| WEL-02 Giấc ngủ                         | Nợ ngủ cuối tuần < 2 giờ                             | Giờ dậy cố định kể cả cuối tuần         |

**Cạm bẫy chính:** tích luỹ bằng cấp thay vì tích luỹ **bằng chứng làm được việc**. PIAAC 2024 cho
thấy bằng cấp không còn bảo chứng năng lực.

### 7.5 `young_professional` — 24–28 tuổi (Đi làm & dựng tình yêu)

_Chủ đề: Thân mật vs. Cô lập. Việc nghề: cuối Exploration → đầu Establishment._

| Năng lực trọng tâm           | Dấu hiệu đạt                                           | Hành động 90 ngày                                    |
| ---------------------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| PRO-01 Chuyên môn → **B3**   | Sở hữu trọn một kết quả có rủi ro thật                 | Xin nhận 1 mảng có tên mình chịu trách nhiệm         |
| PRO-05 Thương lượng          | Đã đàm phán lương/điều kiện ít nhất 1 lần              | Chuẩn bị hồ sơ giá trị + 1 lần đề nghị thật          |
| COG-05 Tư duy dài hạn        | Có giả thuyết nghề 5 năm, viết ra, có điều kiện bác bỏ | Viết "giả thuyết nghề" + mốc kiểm lại 6 tháng        |
| FIN-02/03 Dự phòng, tích luỹ | 3–6 tháng dự phòng; tiết kiệm tự động                  | Đặt lệnh trích tự động ngày nhận lương               |
| SEL-03/WEL-04 Thân mật       | Có quan hệ sâu chịu được bất đồng                      | Lịch cố định cho quan hệ quan trọng nhất             |
| TEC-03 Cộng tác AI           | Dùng AI ở mức thay đổi được năng suất, có kiểm chứng   | Chuẩn hoá quy trình làm việc có AI cho mảng của mình |

**Cạm bẫy chính:** dồn toàn bộ vào nghề, để WEL-04 rỗng → chi phí trả ở băng 36–45, thường không
đảo ngược được.

### 7.6 `family_builder` — 28–38 tuổi (Hôn nhân, gia đình, nuôi con)

_Băng **áp lực kép** nặng nhất: đỉnh yêu cầu nghề trùng đỉnh yêu cầu chăm sóc. Đây là nơi biến
ngữ cảnh ở mục 8 phát huy tác dụng._

| Năng lực trọng tâm            | Dấu hiệu đạt                               | Hành động 90 ngày                                 |
| ----------------------------- | ------------------------------------------ | ------------------------------------------------- |
| PRO-01 Chuyên môn → **B3→B4** | Người khác tìm đến bạn vì ca khó           | Nhận 1 ca khó/quý, viết lại cách giải             |
| PRO-04 Kèm cặp                | Có ≥1 người lên bậc nhờ bạn                | Kèm 1 người, 30 phút/tuần, 12 tuần                |
| FIN-05 Thời gian & năng lượng | Có khối sâu được bảo vệ dù bận             | Đàm phán 1 khối 3 giờ/tuần với gia đình + công ty |
| SEL-05 Xung đột               | Nêu bất đồng sớm, giữ được quan hệ         | Quy ước "họp gia đình" 30 phút/tuần               |
| FIN-02/04 Dự phòng, rủi ro    | Bảo hiểm + di chúc/uỷ quyền cơ bản         | Rà bảo hiểm y tế/nhân thọ, người thụ hưởng        |
| WEL-01/02 Thể chất, ngủ       | Không đánh đổi ngủ lấy việc quá 2 đêm/tuần | Ngưỡng cứng: không việc sau 23h                   |

**Cạm bẫy chính:** hoãn vô thời hạn mọi thứ không khẩn cấp (sức khoẻ, học, quan hệ) — món nợ này
đáo hạn ở băng sau.

### 7.7 `prime_leader` — 38–50 tuổi (Đỉnh nghề & ảnh hưởng)

_Chủ đề: Sinh sản–cống hiến vs. Trì trệ. Não: **đọc người và tri thức kết tinh đang ở đỉnh** —
lợi thế cạnh tranh chuyển từ tốc độ sang phán đoán._

| Năng lực trọng tâm             | Dấu hiệu đạt                                                   | Hành động 90 ngày                                              |
| ------------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------- |
| PRO-03 Lãnh đạo trong bất định | Ra quyết định thiếu thông tin, ghi lại lý do, chịu trách nhiệm | Lập "sổ quyết định": mỗi quyết lớn ghi giả định + mốc kiểm lại |
| PRO-04 Kèm cặp → hệ thống      | Có người kế nhiệm được nêu tên                                 | Chọn 1 người kế nhiệm, giao dần việc thật                      |
| COG-05 Tư duy hệ thống         | Nhìn ra hệ quả bậc 2 trước khi quyết                           | Với mỗi quyết lớn: viết "rồi sao nữa?" 3 lần                   |
| TEC-03/05 AI & tự động hoá     | Không rơi vào "lãnh đạo mù công nghệ"                          | Tự tay làm 1 dự án nhỏ có AI, không giao người khác            |
| SEL-02 Kiên cường              | Chịu được mất mát vị thế mà không sụp                          | Chuẩn bị bản sắc ngoài chức danh                               |
| WEL-05 Ý nghĩa                 | Nói được vì sao mình làm việc này bằng 1 câu                   | Viết tuyên bố 1 câu, kiểm lại sau 90 ngày                      |
| FIN-03 Đầu tư dài hạn          | Tài sản sinh dòng tiền không phụ thuộc sức lao động            | Rà lại toàn bộ danh mục theo mốc nghỉ hưu                      |

**Cạm bẫy chính (lớn nhất trong cả bảng):** đồng nhất bản thân với chức danh. Khi mất chức danh,
WEL-05 và SEL-02 sụp cùng lúc.

### 7.8 `sage_legacy` — 50+ tuổi (Trí huệ, chuyển giao, an nhàn)

_Chiến lược Baltes SOC: **Chọn hẹp lại — Tối ưu sâu — Bù bằng đòn bẩy**. Vốn từ và tri thức kết
tinh còn tăng đến 65–70; đọc cảm xúc vẫn mạnh đến sau 60. Đây là băng tuổi **có lợi thế thật**
trong các việc cần phán đoán, cố vấn, hoà giải, kể chuyện, truyền nghề._

Mốc pháp lý Việt Nam cần hiển thị đúng: tuổi nghỉ hưu điều kiện bình thường **năm 2026 là nam 61
tuổi 6 tháng, nữ 57 tuổi**, tăng dần đến **nam 62 (2028)** và **nữ 60 (2035)** theo Bộ luật Lao
động 2019. ⇒ Kế hoạch tài chính/chuyển giao phải tính theo **mốc riêng của từng người**, không
dùng con số "60/55" cũ.

| Năng lực trọng tâm              | Dấu hiệu đạt                                                | Hành động 90 ngày                                    |
| ------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| PRO-04 Truyền nghề              | Tri thức đã ra khỏi đầu bạn, thành thứ người khác dùng được | Viết/quay lại 1 quy trình lõi của nghề               |
| COG-04 Học lại (chống lỗi thời) | Vẫn nạp được kỹ năng mới trong 12 tháng gần nhất            | Học 1 kỹ năng mới bằng cách **dạy lại** nó           |
| FIN-02/03/04 Tài chính hưu      | Biết chính xác mốc hưu của mình + dòng tiền sau hưu         | Tính lại theo mốc luật hiện hành, không theo trí nhớ |
| WEL-01/03 Thể chất, tinh thần   | Sức mạnh cơ + thăng bằng được duy trì có chủ đích           | Thêm tập kháng lực 2 buổi/tuần                       |
| WEL-04/05 Quan hệ, di sản       | Mạng lưới không co lại theo công việc                       | Mỗi tháng nối lại 1 quan hệ cũ                       |
| SEL-03 Đọc người                | Dùng lợi thế này có ý thức: cố vấn, hoà giải                | Nhận 1 vai trò cố vấn/hoà giải thật                  |

**Cạm bẫy chính:** rút lui khỏi cái mới ("tôi già rồi") — đây là **lời tiên tri tự ứng nghiệm**,
mâu thuẫn với bằng chứng về tri thức kết tinh vẫn tăng đến 65–70.

### 7.9 Phương pháp học ĐỔI theo tuổi (hệ quả trực tiếp của mục 3.1)

| Băng tuổi | Lợi thế nhận thức                       | Phương pháp học nên dùng                                                                              |
| --------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 11–23     | Tốc độ xử lý, trí nhớ làm việc gần đỉnh | Nạp khối lượng lớn, luyện tập cường độ cao, ngôn ngữ/kỹ năng vận động phức tạp                        |
| 24–35     | Trí nhớ làm việc đỉnh + đã có nền       | Học sâu một mảng, dự án dài, xây bậc B3→B4                                                            |
| 36–50     | Tri thức kết tinh + đọc người ở đỉnh    | Học bằng **so sánh với cái đã biết**, học qua ca thật, học bằng dạy lại                               |
| 50+       | Kết tinh còn tăng; tốc độ giảm          | Chia nhỏ, lặp cách quãng, **giảm áp lực thời gian** chứ không giảm độ khó, học qua kể chuyện & cố vấn |

> Nguyên tắc: **giảm phụ thuộc vào tốc độ, tăng phụ thuộc vào cấu trúc** khi tuổi tăng. Độ khó
> nội dung KHÔNG giảm.

---

## 8. Biến ngữ cảnh 1 — Giới tính & vai trò chăm sóc (xử lý đúng đắn)

### 8.1 Bằng chứng: chênh lệch đến từ ĐÂU

Yêu cầu ban đầu là "chia theo giới tính". Nghiên cứu cho thấy nếu chia theo giới ở mức **kỳ vọng
năng lực**, hệ thống sẽ mã hoá đúng cái định kiến đang gây ra vấn đề:

- **Hình phạt làm mẹ giải thích tới ~80% khoảng cách thu nhập theo giới**; phần khoảng cách do con
  cái gây ra tăng từ ~40% (1980) lên ~80% (2011) — tức chênh lệch **dịch chuyển vào đúng sự kiện
  sinh con**, không rải đều theo giới.
- Trong thí nghiệm hồ sơ ứng tuyển giống hệt nhau, ứng viên **là mẹ** bị chấm năng lực thấp hơn
  ~10% và bị coi là kém cam kết hơn ~12 điểm phần trăm so với ứng viên không có con.
- Chênh lệch trong học thuật rõ ở nhóm **có con**, mờ hẳn ở nhóm **không có con** — chỉ dấu mạnh
  rằng nguyên nhân là **trách nhiệm chăm sóc + định kiến**, không phải khả năng.

### 8.2 Quyết định thiết kế (BẮT BUỘC)

| Nguyên tắc                                                  | Cụ thể                                                                                                                                       |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Không** dùng giới tính để đặt ngưỡng năng lực             | Bảng mục 7 giống nhau cho mọi giới. Không có "bảng cho nữ"                                                                                   |
| Dùng **vai trò chăm sóc & gián đoạn nghề** làm biến thật    | Trường tự khai, **tuỳ chọn**, bỏ trống được, không mặc định theo giới                                                                        |
| Đo thâm niên bằng **tháng hoạt động nghề**, không bằng tuổi | Người nghỉ 24 tháng nuôi con không bị hệ thống coi là "chậm 2 năm"                                                                           |
| Nội dung hỗ trợ theo **tình huống**, không theo giới        | "Quay lại làm việc sau gián đoạn", "làm việc khi đang chăm người phụ thuộc" — mở cho mọi giới                                                |
| Với nam: khuyến khích **nhận phần chăm sóc**                | Đây là đòn bẩy giảm chênh lệch hiệu quả nhất theo bằng chứng                                                                                 |
| Khác biệt sinh học chỉ vào đúng chỗ của nó                  | Nhóm **WEL** (sức khoẻ sinh sản, tiền mãn kinh, sức khoẻ nam giới, tầm soát theo giới/tuổi) — đây là chỗ giới tính thực sự có ý nghĩa y khoa |

### 8.3 Cơ chế "nhận biết gián đoạn nghề" (career-break aware)

```
tuổi_nghề_hiệu_dụng (tháng) = tổng tháng làm nghề − tháng gián đoạn được khai
bậc kỳ vọng                 = f(tuổi_nghề_hiệu_dụng, cường độ thử thách)
```

Hệ quả UX: sau khi khai gián đoạn, hệ thống **không** hạ mục tiêu, mà **dời mốc thời gian** và
đổi nội dung sang gói "khởi động lại" (lấy lại nhịp, cập nhật công nghệ đã đổi, dựng lại mạng lưới,
diễn đạt khoảng trống trong CV). Đây là khác biệt cốt lõi so với các hệ chấm điểm theo tuổi.

---

## 9. TRỤC C — Họ ngành nghề

Không mô hình hoá từng nghề (hàng nghìn nghề, bảo trì bất khả thi). Dùng **8 họ nghề**, mỗi họ
thêm 3–5 năng lực chuyên biệt và đổi trọng số các nhóm.

| Họ nghề                           | Đỉnh nghề điển hình                            | Cửa sổ then chốt                      | Trọng số cao              | Rủi ro tự động hoá                                 | Nhánh chuyển hướng tự nhiên                        |
| --------------------------------- | ---------------------------------------------- | ------------------------------------- | ------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| **Kỹ thuật – CNTT**               | 30–45 (kỹ thuật) / 40–55 (kiến trúc, lãnh đạo) | 24–32: lên B3–B4                      | TEC, COG                  | **Cao** ở phần lặp; thấp ở thiết kế hệ thống       | Kiến trúc · quản lý kỹ thuật · sản phẩm            |
| **Y tế – chăm sóc**               | 40–60 (kinh nghiệm cộng dồn)                   | 24–35: chuyên khoa hoá                | PRO-01, SEL-03, WEL       | Thấp (tiếp xúc người)                              | Đào tạo · quản lý y tế · y tế dự phòng             |
| **Giáo dục**                      | 35–60                                          | 25–35: dựng phương pháp riêng         | SEL, COG-04               | Thấp–TB; nội dung bị AI ép giá                     | Thiết kế học liệu · quản lý giáo dục · cố vấn      |
| **Kinh doanh – bán hàng**         | 30–50                                          | 24–35: dựng mạng lưới                 | SEL-04/05, PRO-05         | TB (khâu giao dịch bị tự động)                     | Quản lý vùng · phát triển đối tác · khởi nghiệp    |
| **Tài chính – kế toán – pháp lý** | 35–55                                          | 26–38: lên chuyên môn sâu + chứng chỉ | COG-01/02, FIN, TEC-02    | **Cao** ở phần chuẩn hoá                           | Tư vấn · quản trị rủi ro · tuân thủ                |
| **Sáng tạo – truyền thông**       | Rải đều; phụ thuộc tái tạo bản thân            | Suốt đời: chu kỳ 5–7 năm              | COG-03, SEL-04, TEC-03    | **Rất cao** ở khâu sản xuất; thấp ở ý tưởng/uy tín | Giám đốc sáng tạo · sản phẩm nội dung · giảng dạy  |
| **Sản xuất – kỹ thuật viên**      | 30–50; giới hạn bởi thể chất                   | 20–30: chứng chỉ tay nghề             | PRO-01/02, WEL-01, TEC-05 | **Cao**                                            | Giám sát · bảo trì thiết bị mới · an toàn lao động |
| **Dịch vụ công – hành chính**     | 40–60 (thâm niên có giá trị thật)              | 25–40: chuyên môn hoá + mạng lưới     | SEL-05, COG-05, TEC-01    | TB                                                 | Chuyên gia chính sách · đào tạo nội bộ · thanh tra |

**Ba luật đọc bảng này:**

1. **Đỉnh nghề ≠ đỉnh giá trị.** Nghề đỉnh sớm (kỹ thuật, sản xuất) cần chuẩn bị **chuyển đòn bẩy**
   từ tay nghề sang hệ thống/con người trước tuổi 40 — không phải vì suy giảm, mà vì thị trường trả
   giá khác.
2. **Rủi ro tự động hoá cao ⇒ tăng trọng số TEC-03/TEC-05 và COG-03 ngay**, bất kể tuổi. WEF 2025:
   39% năng lực lõi biến đổi trước 2030.
3. **Nghề tiếp xúc người (y tế, giáo dục, hoà giải) có lợi thế TĂNG theo tuổi** — khớp với dữ liệu
   đọc cảm xúc đỉnh ở 40–50 và duy trì đến sau 60.

---

## 10. Cách XÁC ĐỊNH: từ dữ liệu → hồ sơ năng lực → lộ trình

### 10.1 Bốn loại bằng chứng (không chấm bằng tự khai suông)

| Loại                            | Trọng số  | Ví dụ                                                             | Hạn dùng                          |
| ------------------------------- | --------- | ----------------------------------------------------------------- | --------------------------------- |
| **E1 — Hành vi trong hệ thống** | Cao nhất  | Chuỗi ngày học, hoàn thành dự án, tần suất quay lại sau gián đoạn | Luôn mới                          |
| **E2 — Bài đánh giá có chấm**   | Cao       | Bài kiểm tra thích ứng, tình huống nghề, chấm nói/viết            | 12 tháng                          |
| **E3 — Bằng chứng ngoài**       | TB        | Sản phẩm thật, chứng chỉ, phản hồi đồng nghiệp                    | 24 tháng                          |
| **E4 — Tự đánh giá**            | Thấp nhất | Thang tự chấm                                                     | 3 tháng, chỉ dùng khi thiếu E1–E3 |

**Luật:** một năng lực chỉ được coi là "đạt" khi có **≥1 bằng chứng E1–E3**. E4 đơn độc chỉ tạo
trạng thái **"chưa xác minh"**, hiển thị khác màu — không được cộng vào điểm tổng.

### 10.2 Công thức điểm & xếp hạng khoảng cách

```
capScore(c)      = 0..100, hợp nhất từ bằng chứng có trọng số + suy giảm theo hạn dùng
expected(c)      = base(bandTuổi, c)                       // Trục A
                 × weight(hoNghe, c)                        // Trục C
                 + levelBonus(bacDreyfus, c)                // Trục B (chỉ nhóm PRO/TEC)
gap(c)           = max(0, expected(c) − capScore(c))
priority(c)      = gap(c) × leverage(c) × urgency(bandTuổi, c)
```

- `leverage(c)`: năng lực nền (COG-04, SEL-01, SEL-02, FIN-05) có đòn bẩy cao vì mở khoá năng lực
  khác — ưu tiên trước.
- `urgency`: cao khi băng tuổi đang ở **cửa sổ then chốt** của họ nghề (cột 3 mục 9), hoặc khi bật
  cờ cảnh báo mục 6.3.
- Trả về tối đa **3 năng lực ưu tiên** một lúc. Nhiều hơn 3 là chắc chắn thất bại — đây là quyết
  định thiết kế, không phải giới hạn kỹ thuật.

### 10.3 Luồng người dùng (4 bước)

1. **Định vị** (≤5 phút): giai đoạn đời (đã có) + họ nghề + tháng hoạt động nghề + gián đoạn (tuỳ
   chọn) → sinh hồ sơ 30 năng lực ở trạng thái "chưa xác minh".
2. **Xác minh** (theo thời gian): bài đánh giá ngắn + hành vi trong hệ thống nâng dần độ tin cậy.
3. **Chọn 3 ưu tiên**: hệ thống đề xuất, **người dùng chốt** (quyền tự quyết — nguyên tắc SDT đã có
   trong `MotivationDiagnostic`).
4. **Chu kỳ 90 ngày**: mỗi năng lực → 1 hành động duy nhất + 1 dấu hiệu đạt + mốc kiểm lại. Hết chu
   kỳ: chấm lại, đổi ưu tiên, ghi vào sổ quyết định.

---

## 11. Rủi ro & giới hạn (phải xử lý trước khi phát hành)

| #   | Rủi ro                                                                       | Mức     | Cách xử lý                                                                                                                              |
| --- | ---------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | **Định mệnh luận tuổi tác** — người dùng đọc bảng rồi kết luận "tôi trễ rồi" | **Cao** | Mọi màn hình phải nêu bằng chứng ngược (kết tinh tăng đến 65–70); cấm ngôn ngữ "đáng lẽ phải"; bộ lọc `SupremePrincipleCompliance` chặn |
| R2  | **Mã hoá định kiến giới**                                                    | **Cao** | Mục 8.2 là ràng buộc cứng; thêm test tự động: cùng dữ liệu, đổi mỗi trường giới → đầu ra PHẢI giống hệt (trừ nội dung WEL y khoa)       |
| R3  | Dữ liệu nền chủ yếu từ OECD/phương Tây                                       | TB      | Ghi rõ nguồn ở UI; các mốc VN (nghỉ hưu, học chế) lấy theo luật VN; thu thập dữ liệu thật của người dùng VN để hiệu chỉnh sau           |
| R4  | Dữ liệu nhạy cảm (giới, chăm sóc, sức khoẻ, thu nhập)                        | **Cao** | Tất cả **tuỳ chọn**, mặc định trống; đi qua `consentGrant` đã có; không dùng cho quảng cáo/xếp hạng công khai; cho phép xoá             |
| R5  | Sai số tự đánh giá (Dunning–Kruger ở B1–B2)                                  | TB      | Luật E4 ở 10.1                                                                                                                          |
| R6  | Phình phạm vi (30 năng lực × 8 băng × 8 nghề = quá tải)                      | TB      | Chỉ hiện **3 ưu tiên**; phần còn lại chỉ xem khi người dùng chủ động mở                                                                 |
| R7  | Nhầm với tư vấn y tế/tâm lý/pháp lý/đầu tư                                   | **Cao** | WEL-03, FIN-03 phải có khuyến cáo + đường dẫn tới trợ giúp chuyên môn                                                                   |

---

## 12. Đề xuất triển khai vào DHCB

### 12.0 Luật chống trùng hệ (đọc trước khi viết dòng code đầu tiên)

Repo **đã có** hệ giai đoạn đời hoàn chỉnh: `LIFE_STAGE_PROFILES` (8 giai đoạn, ~1000 dòng) trong
`packages/core-domains/lifeMilestoneMasteryService.ts`, contract ở
`packages/core-contracts/lifeMilestoneMastery.ts`, và cột `profiles.age_group` (4 nhóm, migration
`0002`). Bài học từ nợ **N3 "hợp nhất hệ trùng"**:

- ❌ KHÔNG tạo `LifeStageType` thứ hai, KHÔNG tạo bảng giai đoạn mới.
- ✅ Năng lực (`capability`) là **lớp MỚI**, tham chiếu `LifeStageType` **đã có**.
- ✅ `profiles.age_group` (4 nhóm, phục vụ giao diện/giọng điệu theo tuổi) và `LifeStageType`
  (8 giai đoạn, phục vụ nội dung) là **hai việc khác nhau** — giữ cả hai, nhưng phải viết một hàm
  ánh xạ duy nhất giữa chúng, đặt ở `core-contracts`, để không có hai chỗ tự suy diễn.

### 12.1 Chia PR (đề xuất — chờ duyệt)

| PR     | Nội dung                                                                                                                                                                                                                                       | Quy mô | Giao cho                          |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------- |
| **C1** | `core-contracts/capability.ts`: 30 năng lực + `CapabilityGroup`, `MasteryLevel` (B1–B5), `OccupationFamily` (8), `CapabilityEvidence` (E1–E4), `CapabilityProfile`, `CapabilityGap`; + hàm ánh xạ `age_group ⇄ LifeStageType`; test Zod đầy đủ | Vừa    | Opus (đụng contract dùng chung)   |
| **C2** | Bảng dữ liệu tĩnh: `base()` theo 8 băng tuổi, `weight()` theo 8 họ nghề, `levelBonus()` — chuyển đúng mục 7 & 9 thành dữ liệu; test độ phủ (mọi tổ hợp có giá trị hợp lệ)                                                                      | Vừa    | `standard-worker` (đặc tả đã kín) |
| **C3** | `core-domains/capabilityService.ts`: chấm điểm, xếp hạng khoảng cách, chu kỳ 90 ngày, cờ cảnh báo mục 6.3; **+ test bất biến R2** (đổi giới → đầu ra không đổi)                                                                                | Lớn    | `spec-executor`                   |
| **C4** | Migration Postgres: `personal.capability_profile`, `capability_evidence`, `capability_cycle`; API `/api/capability/*`; RLS-tương-đương qua `validateAuth()`                                                                                    | Lớn    | Opus (đụng schema + bảo mật)      |
| **C5** | UI: màn "Định vị năng lực" + "3 ưu tiên" + chu kỳ 90 ngày; a11y AA/AAA theo luật §5 CLAUDE.md                                                                                                                                                  | Lớn    | `standard-worker` + reviewer      |

**Cổng giữa các PR:** C1 phải được duyệt trước khi làm C2–C5 (contract là hợp đồng chung).

### 12.2 Quyết định cần người dùng chốt

1. **Có làm không, và làm tới đâu?** (chỉ C1–C3 làm nền, hay đủ C1–C5 có UI)
2. **Có hỏi giới tính không?** Đề xuất của tôi: **có, nhưng tuỳ chọn và chỉ dùng cho nội dung sức
   khoẻ (WEL)**; các trục khác dùng "vai trò chăm sóc / gián đoạn nghề" thay thế.
3. **8 họ nghề đã đủ chưa** cho tệp người dùng Việt Nam, hay cần tách thêm (nông nghiệp, du lịch –
   nhà hàng khách sạn, logistics)?
4. **Ưu tiên băng tuổi nào trước?** Làm đủ 8 băng tốn nhiều; đề xuất làm trước
   `university_launchpad` + `young_professional` + `family_builder` (18–38) vì đó là tệp người dùng
   đông nhất hiện tại của DHCB.

---

## 13. Nguồn tham khảo

- WEF, _The Future of Jobs Report 2025_ — 39% năng lực lõi biến đổi trước 2030; nhóm năng lực tăng
  nhanh nhất. https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/3-skills-outlook/
- OECD, _Survey of Adult Skills (PIAAC) chu kỳ 2_, công bố 12/2024 — năng lực người lớn giảm/chững
  ở hầu hết nước OECD, bất bình đẳng kỹ năng giãn ra.
  https://www.oecd.org/en/about/news/press-releases/2024/12/adult-skills-in-literacy-and-numeracy-declining-or-stagnating-in-most-oecd-countries.html
- Hartshorne, J. K., & Germine, L. T. (2015). _When Does Cognitive Functioning Peak?_
  _Psychological Science_, 26(4) — đỉnh các năng lực nhận thức lệch pha nhau.
  https://journals.sagepub.com/doi/abs/10.1177/0956797614567339
- Bằng chứng hình phạt làm mẹ: tổng hợp tại
  https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11047346/ và
  https://gap.hks.harvard.edu/getting-job-there-motherhood-penalty
- Tuổi nghỉ hưu Việt Nam theo Bộ luật Lao động 2019, lộ trình 2026:
  https://luatvietnam.vn/lao-dong-tien-luong/tuoi-nghi-huu-nam-2026-thay-doi-the-nao-562-106488-article.html
- Khung mô hình: Erikson (giai đoạn tâm lý xã hội), Havighurst (nhiệm vụ phát triển),
  Super (Life-Career Rainbow), Dreyfus & Dreyfus (5 bậc thành thạo), Cattell–Horn–Carroll,
  Baltes & Baltes (SOC).

---

## 14. Nhật ký quyết định

| Ngày       | Quyết định                                                                              | Lý do                                                                                                                   |
| ---------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 2026-08-23 | Giới tính KHÔNG là trục kỳ vọng năng lực; thay bằng "vai trò chăm sóc & gián đoạn nghề" | Bằng chứng: chênh lệch bám vào sự kiện sinh con và định kiến, không bám vào giới; mã hoá theo giới sẽ tái tạo định kiến |
| 2026-08-23 | Thâm niên đo bằng bậc Dreyfus, không bằng số năm                                        | Số năm không phản ánh tích luỹ; PIAAC 2024 cho thấy năng lực chững/giảm dù thâm niên tăng                               |
| 2026-08-23 | 8 họ nghề thay vì danh mục nghề chi tiết                                                | Bảo trì được; vẫn đủ phân biệt trọng số và đường cong đỉnh nghề                                                         |
| 2026-08-23 | Tái dùng `LifeStageType` 8 giai đoạn đã có, không tạo hệ mới                            | Nợ N3 "hợp nhất hệ trùng"                                                                                               |
| 2026-08-23 | Tối đa 3 năng lực ưu tiên một lúc                                                       | Quá 3 mục tiêu đồng thời thì tỷ lệ hoàn thành sụp                                                                       |
