# Tổng hợp Nghiên cứu: Nang Luc Va Do Tuoi

Tài liệu này gộp từ 5 tài liệu nghiên cứu liên quan.

---

## [1] Tài liệu: dac-ta-nang-luc-ca-nhan-theo-do-tuoi-2026-08-23.md

_(Chi tiết nguồn gốc: `dac-ta-nang-luc-ca-nhan-theo-do-tuoi-2026-08-23.md`)_

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

---

## [2] Tài liệu: luong-nguoi-moi-ho-so-nang-luc-an-2026-08-23.md

_(Chi tiết nguồn gốc: `luong-nguoi-moi-ho-so-nang-luc-an-2026-08-23.md`)_

# Luồng người mới — hỏi năng lực, gợi ý mục tiêu, KHÔNG phơi kết quả chẩn đoán (2026-08-23)

> **Yêu cầu người dùng:** _"người mới vào hỏi năng lực và gợi ý mục tiêu cần đạt được tiếp theo,
> không hiện cho người dùng biết như bạn đã nói."_
>
> Đây là **thi hành Luật số 1** đã chốt ở `dong-hanh-va-phat-trien-nang-khieu-2026-08-23.md`:
> _kết quả chẩn đoán không bao giờ là màn hình chính._ Tài liệu này biến nguyên tắc đó thành
> luồng cụ thể, câu chữ cụ thể, và ràng buộc kiểm được bằng test.

---

## 1. Yêu cầu, và một điểm tôi phải nói ngược lại

### 1.1 Yêu cầu đúng ở chỗ nào

Bắt người mới làm bài đánh giá rồi trả về bảng điểm là cách nhanh nhất để mất họ. Ba lý do:

1. **Người mới chưa tin đủ để bị đo.** Đo trước khi tạo giá trị là đòi hỏi một chiều.
2. **Bảng điểm thấp làm tê liệt, không tạo động lực.** Nhất là ở người 30+ hoặc học sinh đang bị
   chấm điểm suốt ngày ở trường.
3. **Con số làm người ta quản lý con số**, thay vì làm việc thật.

Nên: **hỏi thì có, đo thì ngầm, trả ra chỉ một việc nên làm tiếp.** Đây là thiết kế đúng.

### 1.2 Điểm tôi phải nói ngược lại: **ẩn ≠ giấu**

Tôi đề nghị một sửa đổi, và mong bạn cân nhắc: hồ sơ **mặc định ẩn, không bao giờ tự bật ra**,
nhưng **phải xem được khi người dùng chủ động hỏi**, và **xoá được**.

Lý do:

|                                          |                                                                                                                                              |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Niềm tin**                             | Nếu người dùng phát hiện hệ thống giữ một bản đánh giá về họ mà không cho xem, thiệt hại niềm tin lớn hơn nhiều so với lợi ích của việc giấu |
| **Pháp lý & đạo đức dữ liệu**            | Dữ liệu suy luận về một con người vẫn là dữ liệu cá nhân của họ. Repo đã có `consentGrant` — đúng chỗ để dùng                                |
| **Nhất quán với chính tư thế đồng hành** | Luật 6 (mục 2 tài liệu đồng hành): _nói thật khi cần, kể cả điều khó nghe_. Một bạn đồng hành giấu sổ ghi chép về bạn thì không còn là bạn   |
| **Trẻ vị thành niên**                    | Phụ huynh sẽ hỏi. Phải có câu trả lời rõ ràng, xem được                                                                                      |

**Khác biệt then chốt:** "không hiện" nghĩa là **không bao giờ chủ động đẩy ra**, không nằm ở màn
hình chính, không có thông báo, không có huy hiệu, không có biểu đồ trên trang chủ. Chỉ nằm sâu
trong Cài đặt, sau một thao tác có chủ ý. Điều này giữ trọn tinh thần yêu cầu của bạn mà không
biến hệ thống thành hộp đen.

> **✅ ĐÃ CHỐT (người dùng, 2026-08-23):** phương án **ẩn nhưng xem được khi hỏi**. Bổ sung: việc
> XEM hồ sơ ẩn được **khoá thêm bằng 2FA** — chi tiết ở
> `dac-ta-ma-hoa-du-lieu-va-2fa-2026-08-23.md`. Toàn bộ dữ liệu nhạy cảm (T2) được **mã hoá**
> trong DB. Nút "Xoá dữ liệu đánh giá về tôi" **không** cần 2FA — không bao giờ được cản người
> dùng xoá dữ liệu của chính họ.

---

## 2. Kiến trúc ba lớp

```
┌─ LỚP HỎI ──────────── người dùng THẤY ────────────────────────┐
│  5 câu, ~90 giây, giọng trò chuyện, mỗi câu trông như         │
│  câu hỏi sở thích/hoàn cảnh — không câu nào trông như bài thi │
└───────────────────────────────────────────────────────────────┘
                            ↓ suy luận
┌─ LỚP HỒ SƠ ẩn ─────── người dùng KHÔNG thấy (trừ khi tự mở) ──┐
│  30 năng lực × điểm × ĐỘ TIN CẬY · băng tuổi · bậc ·          │
│  họ nghề · tín hiệu năng khiếu · hoàn cảnh chăm sóc           │
└───────────────────────────────────────────────────────────────┘
                            ↓ xếp hạng khoảng cách
┌─ LỚP GỢI Ý ────────── người dùng THẤY ────────────────────────┐
│  ĐÚNG MỘT việc nên làm tiếp + một câu "vì sao" trích lại      │
│  chính lời họ vừa nói. Không điểm, không thang, không so sánh │
└───────────────────────────────────────────────────────────────┘
```

**Luật kiến trúc:** lớp giữa **không có đường ra trực tiếp lên giao diện**. Mọi thứ hiển thị phải
đi qua lớp gợi ý và bị lọc ngôn ngữ ở mục 5. Đây là ràng buộc kiểm được bằng test (mục 9).

---

## 3. Lớp HỎI — 5 câu, 90 giây

> **✅ ĐÃ CHỐT (người dùng, 2026-08-23):** bộ 5 câu dưới đây được duyệt nguyên trạng.

Nguyên tắc: **mỗi câu làm hai việc** — với người dùng nó là câu hỏi về họ; với hệ thống nó là tín
hiệu. Không câu nào có đáp án đúng/sai.

| #   | Câu hỏi (chữ hiển thị)                                     | Cách trả lời                                                  | Suy ra được gì                                                                            | Độ tin cậy |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------- |
| 1   | **"Bạn bao nhiêu tuổi rồi?"**                              | Chọn nhóm tuổi (đã có sẵn trong app)                          | Băng tuổi → danh mục năng lực trọng tâm, giọng nói, nội dung phù hợp lứa                  | **Cao**    |
| 2   | **"Dạo này điều gì chiếm nhiều tâm trí bạn nhất?"**        | Học/thi · Công việc · Sức khoẻ · Tiền bạc · Quan hệ · Chưa rõ | Trụ ưu tiên + áp lực đang có → quyết định gợi ý đầu tiên thuộc mảng nào                   | Cao        |
| 3   | **"Nếu mỗi ngày có thêm một giờ, bạn dùng vào việc gì?"**  | Nhập tự do (ngắn)                                             | Động lực nội tại — thứ họ **muốn**, khác thứ họ **nghĩ mình nên**                         | TB         |
| 4   | **"Việc gì bạn làm mà quên mất thời gian?"**               | Nhập tự do (ngắn)                                             | **Tín hiệu năng khiếu #2** — tự tìm đến khi không ai ép. Câu quan trọng nhất của cả luồng | TB         |
| 5   | **"Lần gần nhất bạn tự học xong một thứ mới là khi nào?"** | Tuần này · Vài tháng trước · Lâu rồi · Không nhớ              | Đà học hiện tại (COG-04 + SEL-01) → quyết định **độ lớn** của việc gợi ý                  | TB         |

Rồi màn cuối — đây là **lớp gợi ý**, không phải câu hỏi thứ 6:

> **"Mình gợi ý bắt đầu từ đây nhé?"** → một việc + một câu vì sao + hai lựa chọn khác thu gọn +
> "để mình chọn thứ khác".

**Vì sao câu 4 quan trọng nhất:** với người 10–18, thành tích không phân biệt được năng khiếu thật
với sự vâng lời — chỉ hành vi tự phát mới phân biệt được. Với người lớn, đây thường là câu đầu tiên
trong đời có người hỏi họ.

**Luật của lớp hỏi:**

1. **Tối đa 5 câu.** Mỗi câu thêm vào làm rơi một phần người dùng.
2. **Bỏ qua được mọi câu.** Bỏ qua chỉ làm giảm độ tin cậy, không chặn luồng.
3. **Không có thanh tiến trình kiểu bài thi**, không đếm điểm, không "câu 3/10".
4. **Không hỏi giới tính ở đây.** Nếu cần cho nội dung sức khoẻ thì hỏi sau, đúng lúc, tuỳ chọn —
   theo luật ở tài liệu khung mục 8.
5. **Không hỏi thu nhập, bệnh sử, hay bất cứ thứ gì nhạy cảm ở lần đầu.**

---

## 4. Lớp HỒ SƠ ẩn

### 4.1 Nội dung

| Trường                                     | Nguồn ban đầu           | Cách làm dày lên                                        |
| ------------------------------------------ | ----------------------- | ------------------------------------------------------- |
| Băng tuổi                                  | Câu 1                   | Ổn định                                                 |
| Điểm 30 năng lực + **độ tin cậy từng cái** | Suy luận thô từ câu 2–5 | Hành vi trong app (bằng chứng E1) qua nhiều tuần        |
| Bậc nghề (B1–B5)                           | Chưa xác định           | Suy từ hành vi + hỏi thêm khi đúng lúc                  |
| Họ nghề                                    | Chưa xác định           | Câu 2 gợi hướng; hỏi rõ khi người dùng đã tin           |
| Tín hiệu năng khiếu                        | Câu 3, 4                | Tích luỹ theo hành vi ≥6 tháng (5 tín hiệu, ngưỡng 3/5) |
| Hoàn cảnh chăm sóc / gián đoạn             | Không hỏi lần đầu       | Chỉ hỏi khi ngữ cảnh làm nó tự nhiên                    |

**Luật độ tin cậy:** sau onboarding, **mọi năng lực đều ở trạng thái "chưa xác minh"** (bằng chứng
loại E4 — tự khai, trọng số thấp nhất). Hệ thống **biết** rằng nó đang đoán, và phải hành xử khiêm
tốn tương ứng: gợi ý nhỏ, dễ đúng, dễ đổi.

### 4.2 Hồ sơ dày lên bằng HÀNH VI, không bằng thêm bài kiểm tra

Đây là điểm thiết kế quan trọng nhất và cũng là điểm phân biệt DHCB với các app "test tính cách":

| Nguồn làm dày hồ sơ                     | Ví dụ                                                                        |
| --------------------------------------- | ---------------------------------------------------------------------------- |
| Người dùng làm gì, có xong không        | Nhận việc rồi bỏ giữa chừng ở tuần 2 → tín hiệu về SEL-01, không phải "lười" |
| Quay lại sau bao lâu khi đứt quãng      | Đo SEL-02 (kiên cường) chính xác hơn mọi bảng hỏi                            |
| Chọn gì khi được đưa 3 lựa chọn         | Lộ ưu tiên thật, khác ưu tiên khai báo                                       |
| Chất lượng câu hỏi họ đặt cho Companion | Tín hiệu năng khiếu #3                                                       |
| Việc khó tới đâu mà vẫn tiến được       | Tín hiệu #5 — chưa chạm trần                                                 |

**Cấm:** bắt người dùng làm thêm bài đánh giá để "cập nhật hồ sơ". Nếu hệ thống cần biết thêm, nó
**hỏi một câu trong lúc trò chuyện**, đúng lúc, hoặc chờ hành vi trả lời hộ.

---

## 5. Lớp GỢI Ý — luật ngôn ngữ (phần thực dụng nhất)

### 5.1 Cấu trúc bắt buộc của một gợi ý

```
[MỘT việc, cụ thể, làm được trong tuần này]
+ [MỘT câu vì sao, TRÍCH LẠI lời người dùng vừa nói]
+ [lối thoát: "hoặc để mình gợi ý thứ khác"]
```

**Luật trích lại:** câu "vì sao" phải bám vào **lời người dùng**, không bám vào dữ liệu suy luận.

- ✅ "Bạn bảo hay quên thời gian khi vẽ — mình nghĩ bắt đầu từ đó là hợp nhất."
- ❌ "Dựa trên hồ sơ, năng lực sáng tạo của bạn đạt 72/100 nên…"

Cả hai câu dùng cùng một suy luận. Câu đầu làm người ta thấy **được lắng nghe**; câu sau làm người
ta thấy **bị đo**.

### 5.2 Bảng cấm / cho phép

| Cấm tuyệt đối                                  | Vì sao                              | Thay bằng                                          |
| ---------------------------------------------- | ----------------------------------- | -------------------------------------------------- |
| Điểm số, phần trăm, thang, sao, cấp độ         | Biến người thành con số             | Mô tả bằng việc làm được                           |
| "Bạn đang ở mức…", "trình độ của bạn là…"      | Ngôn ngữ xếp loại                   | "Mình nghĩ bắt đầu từ… là hợp"                     |
| "Bạn thiếu / yếu / chưa đạt…"                  | Ngôn ngữ khiếm khuyết               | "Thứ này sẽ giúp bạn…"                             |
| "So với người cùng tuổi…", bảng xếp hạng       | Vi phạm Luật 4 (tư thế đồng hành)   | So với chính họ, hoặc không so                     |
| "Đáng lẽ ở tuổi này bạn phải…"                 | Định mệnh luận tuổi tác (rủi ro R1) | "Nhiều người bắt đầu ở tuổi bạn — đây là bước đầu" |
| Biểu đồ radar/nhện năng lực trên trang chủ     | Chính là bảng chấm điểm trá hình    | Không có trên trang chủ. Chấm hết                  |
| Ngôn ngữ chẩn đoán (rối loạn, hội chứng, bệnh) | Ngoài phạm vi, rủi ro R7            | Chỉ sang trợ giúp chuyên môn                       |

### 5.3 Ba lựa chọn, không phải một

Dù chỉ **một** gợi ý nổi bật, luôn kèm **hai lựa chọn thu gọn** + "để mình chọn thứ khác".
Lý do: Luật 1 của tư thế đồng hành — **người dùng chốt, Companion đề xuất**. Một gợi ý duy nhất
không có lối thoát là ra lệnh trá hình.

### 5.4 Khi độ tin cậy thấp (gần như luôn luôn, ở lần đầu)

Gợi ý một việc **tự nó tiết lộ thêm thông tin**, và nhỏ đến mức sai cũng không tốn gì:

- Không chắc bậc nghề → gợi ý viết 5 dòng về việc khó nhất tuần qua. Vừa có giá trị, vừa lộ bậc.
- Không chắc năng khiếu → gợi ý thử một việc 20 phút trong lĩnh vực họ nói ở câu 4.
- Không chắc gì cả → gợi ý theo **câu 2** (điều đang chiếm tâm trí). Luôn đúng ngữ cảnh, kể cả khi
  đoán sai năng lực.

**Nguyên tắc:** khi đoán mò, chọn việc **rẻ và sinh thông tin**, đừng chọn việc lớn và ấn tượng.

---

## 6. Người dùng hỏi "sao bạn biết?" — xử lý trung thực

Đây là ca kiểm tra tính chính trực của cả thiết kế.

| Người dùng hỏi                     | Trả lời                                                                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| "Sao bạn gợi ý cái này?"           | Nói thật, bằng lời thường: "Vì lúc nãy bạn bảo hay quên thời gian khi vẽ, với lại bạn đang bận chuyện thi cử nên mình chọn việc nhỏ thôi." |
| "Bạn có đang chấm điểm tôi không?" | **Không được nói dối.** "Mình có ghi lại vài điều để gợi ý cho đúng. Bạn xem hoặc xoá bất cứ lúc nào — ở đây này."                         |
| "Cho tôi xem đi"                   | Mở ra. Hiển thị bằng **ngôn ngữ mục 5.2** (mô tả bằng việc làm được), không bằng con số thô                                                |
| "Tôi không đồng ý với gợi ý này"   | Nhận, đổi ngay, **và ghi lại rằng suy luận đã sai** — đây là bằng chứng chất lượng cao để hiệu chỉnh                                       |

**Luật:** không bao giờ phủ nhận sự tồn tại của hồ sơ. Ẩn là về **thiết kế giao diện**, không phải
về **sự thật**.

---

## 7. Ca đặc biệt

| Ca                                       | Xử lý                                                                                                                                          |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Người dùng < 16 tuổi**                 | Không hỏi dữ liệu nhạy cảm; gợi ý luôn nhỏ; nếu phụ huynh xem cùng thì **vẫn hỏi riêng ý kiến người học** ở câu 4 (chống rủi ro R10 — ép buộc) |
| **Phụ huynh đòi xem hồ sơ của con**      | Hiển thị bằng ngôn ngữ việc làm được, không bằng điểm. Không cung cấp thứ có thể dùng để so sánh/trách mắng                                    |
| **Người dùng bỏ hết 5 câu**              | Vẫn vào được app. Gợi ý mặc định theo nhóm tuổi. Hồ sơ rỗng, độ tin cậy 0                                                                      |
| **Người dùng quay lại sau 6 tháng vắng** | Không nhắc chuỗi ngày đã mất, không tính sổ (Luật 5). Hỏi lại đúng **một** câu: "Dạo này điều gì đang chiếm tâm trí bạn?" rồi gợi ý mới        |
| **Onboarding môn tiếng Anh đã có sẵn**   | Không hỏi trùng. Xem mục 8                                                                                                                     |

---

## 8. Ghép vào code hiện có (quan trọng — chống trùng hệ)

### 8.1 Hiện trạng đã kiểm

- `apps/dhcb/src/pages/core/Onboarding.tsx` (321 dòng) nằm ở `core/` nhưng **thực chất là onboarding
  MÔN TIẾNG ANH**: trình độ `beginner/intermediate/advanced` (CEFR), mục tiêu `daily/travel/work/
ielts`, số phút mỗi ngày. Chỉ có **nhóm tuổi** là dữ liệu cấp nền tảng.
- Migration `0036_english_user_profile.sql` **đã lường trước đúng vấn đề này**, ghi rõ: _"Môn học
  tiếp theo sẽ có onboarding hoàn toàn khác… nhét chung vào `profiles` sẽ thành bãi cột NULL"_.
  Bảng `english.user_profile` đã tạo và backfill, hiện là **bảng ngủ**.

### 8.2 Quyết định

| Việc                                | Quyết định                                                                                                                             |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Onboarding nền tảng                 | **Lớp MỚI, chạy TRƯỚC** onboarding môn. 5 câu ở mục 3                                                                                  |
| `Onboarding.tsx` hiện tại           | **Giữ nguyên**, đổi vai thành onboarding môn Anh, chạy khi người dùng vào môn Anh lần đầu. Cân nhắc dời sang `pages/subjects/english/` |
| Nhóm tuổi                           | **Chuyển lên lớp nền tảng** (nó là dữ liệu platform: giọng nói, nội dung, băng tuổi) — đồng thời hoàn tất bước chuyển mà `0036` để ngỏ |
| Trình độ / mục tiêu / phút mỗi ngày | Ở lại môn Anh, chuyển sang đọc/ghi `english.user_profile`                                                                              |
| Hồ sơ ẩn                            | Schema `personal` (đúng chỗ theo kiến trúc platform), đi qua `consentGrant` đã có                                                      |
| Không hỏi trùng                     | Người đã onboard môn Anh trước đây → suy ra sẵn phần suy được, chỉ hỏi phần thiếu                                                      |

### 8.3 Ảnh hưởng tới kế hoạch PR

Chèn vào chuỗi C0 → C1 → …:

| PR              | Nội dung                                                                                                                                                                                                                                                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **C1b**         | ✅ **ĐÃ LÀM 2026-08-23.** Tách ranh giới nền tảng/môn ở tầng dữ liệu: migration `0059` + `/api/profile` dual-write trong transaction, đọc ưu tiên `english.user_profile`; `age_group` chốt là dữ liệu NỀN TẢNG (sửa phân loại sai của `0036`). Rollback = revert code, không đụng dữ liệu. Phần UI 5 câu là **C1b-2**, làm sau khi có 2FA |
| **C2b**         | 5 câu + bảng suy luận + luật ngôn ngữ mục 5 thành dữ liệu/cấu hình                                                                                                                                                                                                                                                                        |
| **C3b** _(mới)_ | Bộ lọc ngôn ngữ + test bất biến ở mục 9                                                                                                                                                                                                                                                                                                   |

---

## 9. Ràng buộc kiểm được bằng test (bắt buộc)

| #   | Bất biến                                            | Cách test                                                                                      |
| --- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| T1  | **Không con số năng lực nào rò lên giao diện**      | Quét mọi chuỗi hiển thị sinh từ lớp gợi ý: không khớp `\d+/100`, `\d+%`, "điểm", "mức", "hạng" |
| T2  | **Mỗi lần chỉ một gợi ý nổi bật**                   | Đầu ra lớp gợi ý luôn có đúng 1 mục chính + ≤2 phụ + 1 lối thoát                               |
| T3  | **Từ cấm không xuất hiện**                          | Danh sách cấm mục 5.2 → test chuỗi, chặn CI                                                    |
| T4  | **Bỏ qua mọi câu vẫn vào được app**                 | Test luồng với 5 câu rỗng                                                                      |
| T5  | **Đổi trường giới → đầu ra không đổi**              | Đã có ở tài liệu khung (rủi ro R2); áp cả ở đây                                                |
| T6  | **Hồ sơ xoá được thật**                             | Xoá → truy vấn lại trả rỗng; gợi ý quay về mặc định theo tuổi                                  |
| T7  | **Không màn hình nào ở luồng chính hiển thị hồ sơ** | Test điều hướng: từ trang chủ không có đường tới hồ sơ trong ≤2 chạm                           |

T1 và T3 là hai cổng quan trọng nhất — chúng biến "Luật số 1" từ lời hứa thành thứ CI chặn được.

---

## 10. Đo thành công của luồng này

| Chỉ số nên đo                                             | Chỉ số **không** được dùng làm mục tiêu |
| --------------------------------------------------------- | --------------------------------------- |
| Tỷ lệ hoàn thành 5 câu                                    | Thời gian ở trong app                   |
| Tỷ lệ **bắt đầu** việc được gợi ý                         | Số lần mở app                           |
| Tỷ lệ **hoàn thành** việc đầu tiên trong 7 ngày           | Số câu hỏi đã trả lời                   |
| Tỷ lệ quay lại sau 30 ngày                                | Số huy hiệu đạt được                    |
| Tỷ lệ người dùng đổi gợi ý (đo độ chính xác của suy luận) | —                                       |

Chỉ số quan trọng nhất: **tỷ lệ hoàn thành việc đầu tiên**. Nếu người mới làm xong một việc thật
trong tuần đầu, họ đã có bằng chứng rằng DHCB có ích — và đó là thứ duy nhất giữ họ lại.

---

## 11. Câu cần bạn chốt — ✅ đã chốt hết 2026-08-23

1. **Ẩn tuyệt đối hay ẩn-nhưng-xem-được-khi-hỏi?** Tôi đề xuất phương án 2 (mục 1.2). Nếu bạn chọn
   ẩn tuyệt đối, đề nghị tối thiểu giữ nút xoá dữ liệu.
2. **5 câu có đúng không, hay bạn muốn ít/khác đi?** Câu 4 ("việc gì làm mà quên thời gian") tôi
   đề nghị giữ bằng mọi giá — nó là câu duy nhất bắt được tín hiệu năng khiếu tự phát.
3. **C1b (tách onboarding nền tảng khỏi onboarding môn Anh) làm ngay hay để sau?** Nó đụng màn
   onboarding của mọi người dùng đang hoạt động, nên cần bạn biết trước rủi ro.

---

## [3] Tài liệu: nang-luc-10-18-nen-tang-va-nang-khieu-2026-08-23.md

_(Chi tiết nguồn gốc: `nang-luc-10-18-nen-tang-va-nang-khieu-2026-08-23.md`)_

# 10–18 tuổi — nền tảng học hành · nghiên cứu · hiểu biết rộng, và nuôi năng khiếu (2026-08-23)

> **Yêu cầu người dùng:** _"10–18 tuổi phát triển năng khiếu và năng lực nền tảng: học hành,
> nghiên cứu, hiểu biết về mọi thứ…"_
>
> Thuộc bộ 4 tài liệu. Đọc kèm:
>
> - `dac-ta-nang-luc-ca-nhan-theo-do-tuoi-2026-08-23.md` — khung 3 trục, 30 năng lực lõi
> - `nang-luc-10-40-chi-tiet-2026-08-23.md` — 6 băng N1–N6 (tài liệu này đào sâu **N1 + N2**)
> - `dong-hanh-va-phat-trien-nang-khieu-2026-08-23.md` — tư thế đồng hành + đường ĐỈNH
> - `luong-nguoi-moi-ho-so-nang-luc-an-2026-08-23.md` — người mới vào thì hỏi gì, hiện gì

---

## 1. Vì sao 10–18 là quãng đòn bẩy cao nhất

Ba việc chỉ xảy ra cùng lúc đúng một lần trong đời, ở đúng quãng này:

1. **Bộ máy nạp đang mạnh nhất** — tốc độ xử lý và trí nhớ làm việc lên nhanh, đạt gần đỉnh cuối
   quãng.
2. **Chưa có chi phí cơ hội** — chưa nuôi ai, chưa gánh nợ. Một năm học sai hướng ở tuổi 15 rẻ hơn
   nhiều lần một năm sai hướng ở tuổi 30.
3. **Nền tri thức đang được đổ móng** — và tri thức có tính **cộng dồn phi tuyến**: người biết
   nhiều học cái mới nhanh hơn, vì có sẵn móc để treo cái mới vào. Kiến thức nền là biến dự báo
   mạnh nhất cho việc học cái mới — mạnh hơn cả "thông minh".

Điểm 3 là lý do trung tâm của tài liệu này. **"Hiểu biết về mọi thứ" không phải trang trí** — nó là
**hạ tầng để học nhanh về sau**. Bỏ nó ở tuổi 10–18 là tự đặt trần cho chính mình ở tuổi 30.

---

## 2. Ba trụ nền tảng — và chúng khác nhau thế nào

Người dùng nêu ba thứ. Chúng **không** trùng nhau, và trộn lẫn là sai lầm phổ biến nhất:

| Trụ                | Câu hỏi nó trả lời                                               | Đo bằng                                   | Mã năng lực liên quan           |
| ------------------ | ---------------------------------------------------------------- | ----------------------------------------- | ------------------------------- |
| **HỌC HÀNH**       | "Làm sao nạp một thứ **đã có sẵn đáp án** vào đầu, và giữ được?" | Tốc độ nạp · độ bền sau 3 tháng           | COG-04, SEL-01                  |
| **NGHIÊN CỨU**     | "Làm sao tìm ra câu trả lời **chưa ai đưa cho mình**?"           | Chất lượng câu hỏi · độ chặt của lập luận | COG-01, COG-02, COG-03          |
| **HIỂU BIẾT RỘNG** | "Có đủ móc trong đầu để cái mới **bám vào** không?"              | Khả năng nối hai lĩnh vực xa nhau         | COG-05, nền cho cả hai trụ trên |

**Quan hệ:** hiểu biết rộng là **đất**; học hành là **cách gieo**; nghiên cứu là **cây mọc lên từ
đó**. Học sinh Việt Nam thường được rèn trụ 1 rất kỹ, trụ 3 rời rạc theo môn, và **gần như không
được rèn trụ 2** — đây là khoảng trống DHCB nên nhắm.

---

## 3. Trụ HỌC HÀNH — cái gì thật sự hiệu quả

### 3.1 Bảng xếp hạng theo bằng chứng (Dunlosky và cộng sự, 2013)

| Mức hiệu quả       | Kỹ thuật                                           | Cách làm cụ thể cho 10–18                                                               |
| ------------------ | -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **CAO**            | **Tự kiểm tra (retrieval practice)**               | Gấp sách, tự viết lại những gì nhớ, rồi mới mở ra dò. Không phải đọc lại                |
| **CAO**            | **Học giãn cách (spaced practice)**                | 4 buổi × 30 phút cách nhau tốt hơn 1 buổi 2 tiếng. Repo đã có SRS/FSRS — dùng lại       |
| **TRUNG BÌNH**     | **Xen kẽ (interleaving)**                          | Trộn nhiều dạng bài trong một buổi thay vì làm 20 bài cùng dạng                         |
| **TRUNG BÌNH**     | **Tự giải thích / hỏi "vì sao"**                   | Sau mỗi bài: "vì sao cách này đúng, cách kia sai?"                                      |
| **TRUNG BÌNH**     | **Bài mẫu rồi rút giàn giáo**                      | Người mới xem bài giải mẫu trước; giảm dần phần cho sẵn                                 |
| **THẤP**           | Đọc lại, tô màu (highlight), tóm tắt máy móc       | Cảm giác quen thuộc bị nhầm là đã hiểu — **đây là bẫy lớn nhất**                        |
| **KHÔNG CÓ CƠ SỞ** | "Học theo phong cách học tập" (nhìn/nghe/vận động) | Không có bằng chứng. Chọn cách trình bày theo **nội dung**, không theo "kiểu người học" |

**Điều quan trọng nhất phải dạy cho một đứa trẻ 12 tuổi:** _cảm giác dễ khi học thường là dấu hiệu
đang học kém_. Đọc lại thấy quen → tưởng đã thuộc. Tự kiểm tra thấy khó → mới thật sự đang khắc vào.
Đây gọi là **khó khăn có ích**, và nó ngược với trực giác của gần như mọi học sinh.

### 3.2 Thang học hành 10–18

| Tuổi  | Ngưỡng đạt                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------ |
| 10–12 | Biết mình chưa hiểu chỗ nào **trước** khi bị kiểm tra; ôn bằng tự kiểm tra, không đọc lại        |
| 12–14 | Tự lập lịch ôn giãn cách; chia được bài lớn thành mốc nhỏ                                        |
| 14–16 | Tự chẩn đoán lỗi sai của mình (sai do không biết / do bất cẩn / do hiểu lệch) và xử lý khác nhau |
| 16–18 | Tự thiết kế trọn chu trình ôn cho một kỳ thi lớn, có mốc kiểm lại, tự điều chỉnh giữa chừng      |

### 3.3 Chương trình 12 tuần (áp cho bất kỳ tuổi nào trong quãng)

- Tuần 1: đo nền — học một chương như thường lệ, kiểm tra sau 1 tuần. Ghi lại điểm.
- Tuần 2–5: **đổi sang tự kiểm tra**. Cấm đọc lại làm cách ôn chính.
- Tuần 4–12: lịch giãn cách (1 ngày → 3 ngày → 1 tuần → 3 tuần).
- Tuần 6–12: xen kẽ dạng bài trong mỗi buổi.
- Tuần 8: "sổ lỗi sai" — mỗi lỗi phân loại 3 nhóm ở mục 3.2, xử lý khác nhau.
- Tuần 12: kiểm lại bằng cùng cách đo tuần 1. **So với chính mình**, không so với bạn.

---

## 4. Trụ NGHIÊN CỨU — thang 5 bậc, 10 → 18 tuổi

Đây là trụ bị bỏ trống nhiều nhất. Nghiên cứu **không** phải "làm dự án khoa học to tát" — nó là
thói quen đi từ _thắc mắc_ đến _câu trả lời tự mình kiểm được_.

| Bậc                                            | Tuổi điển hình | Làm được gì                                                                                         | Bài kiểm chứng                                                                         |
| ---------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **R1 — Hỏi & tìm**                             | 10–12          | Đặt câu hỏi rõ; tìm được nguồn; phân biệt nguồn gốc và nguồn chép lại                               | Tìm 3 nguồn cho một thắc mắc, nói được nguồn nào đáng tin hơn và vì sao                |
| **R2 — Kiểm chứng**                            | 12–14          | Đối chiếu nhiều nguồn; phát hiện mâu thuẫn; phân biệt **tương quan** và **nhân quả**                | Bóc một tin sai trên mạng, viết 5 dòng chỉ ra chỗ sai                                  |
| **R3 — Đặt câu hỏi nghiên cứu được**           | 13–15          | Biến thắc mắc mơ hồ thành câu hỏi **có thể trả lời bằng dữ liệu**, có điều kiện sai                 | "Học sinh trường mình ngủ bao nhiêu tiếng, và có liên quan gì tới điểm không?"         |
| **R4 — Thiết kế & thu dữ liệu**                | 14–17          | Chọn cách đo; biết biến gây nhiễu; thu dữ liệu trung thực kể cả khi nó bác bỏ giả thuyết mình thích | Một khảo sát/thí nghiệm nhỏ có mô tả phương pháp                                       |
| **R5 — Phân tích & trình bày, chịu phản biện** | 16–18          | Phân tích, nêu giới hạn của chính mình, bảo vệ trước câu hỏi khó                                    | Trình bày 10 phút + trả lời phản biện; **tự nêu ra được điểm yếu nghiên cứu của mình** |

**Dấu hiệu trưởng thành nghiên cứu quan trọng nhất:** người học **tự nói ra giới hạn của kết quả
mình**. Ai chỉ khoe kết quả mà không nêu giới hạn thì vẫn đang ở R3, dù bài trình bày đẹp.

### 4.1 Dự án nghiên cứu nhỏ — khuôn 12 tuần

| Tuần | Việc                                                | Sản phẩm kiểm được                            |
| ---- | --------------------------------------------------- | --------------------------------------------- |
| 1    | Liệt kê 10 thắc mắc thật của chính mình             | Danh sách 10 câu                              |
| 2    | Chọn 1, mài thành câu hỏi trả lời được bằng dữ liệu | Câu hỏi + **điều kiện để nói mình sai**       |
| 3    | Đọc xem ai đã trả lời rồi                           | 5 nguồn, mỗi nguồn 3 dòng tóm tắt             |
| 4    | Chọn cách đo; liệt kê thứ có thể làm sai lệch       | Mô tả phương pháp 1 trang                     |
| 5–8  | Thu dữ liệu                                         | Dữ liệu thô, **giữ nguyên cả phần không đẹp** |
| 9–10 | Phân tích                                           | Bảng/biểu đồ + phát hiện                      |
| 11   | Viết, có mục "giới hạn của nghiên cứu này"          | Báo cáo 3–5 trang                             |
| 12   | Trình bày + nhận phản biện                          | Buổi 10 phút, có người hỏi khó                |

**Luật:** nếu dữ liệu bác bỏ giả thuyết ban đầu → đó là **kết quả tốt**, không phải thất bại. Phải
nói rõ điều này ngay tuần 1, nếu không người học sẽ vô thức bẻ cong dữ liệu.

**Vai trò của DHCB:** làm người hỏi khó — hỏi "sao em biết?", "còn cách giải thích nào khác?",
"nếu em sai thì sẽ thấy gì?". **Không** làm hộ. Một Companion viết hộ báo cáo sẽ phá đúng thứ nó
định xây.

---

## 5. Trụ HIỂU BIẾT RỘNG — làm sao không thành đố vui

### 5.1 Vấn đề

"Hiểu biết về mọi thứ" dễ tuột thành **trivia**: biết nhiều mẩu rời, không nối được, quên sau vài
tuần. Muốn nó có giá trị thật thì phải nhắm đúng ba thứ:

1. **Mô hình lõi** của mỗi lĩnh vực (10–20 ý lớn), không phải danh sách sự kiện.
2. **Từ vựng của lĩnh vực** — đủ để đọc một bài báo phổ thông về nó mà không lạc.
3. **Khả năng nối** — thấy được hai lĩnh vực xa nhau chạm nhau ở đâu.

Chỉ có (3) mới biến hiểu biết rộng thành lợi thế thật. Và (3) chỉ xuất hiện khi (1) và (2) đủ dày.

### 5.2 Bảy miền tri thức nền

| Miền                     | Vài mô hình lõi cần có trước 18                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| **Thế giới tự nhiên**    | Tiến hoá · nguyên tử & phản ứng · năng lượng và bảo toàn · quy mô vũ trụ                         |
| **Sự sống & cơ thể**     | Tế bào · di truyền · miễn dịch · dinh dưỡng · giấc ngủ                                           |
| **Con người & xã hội**   | Thiên kiến nhận thức · động lực nhóm · thể chế · pháp luật cơ bản                                |
| **Lịch sử & địa lý**     | Trục thời gian lớn · vì sao các nền văn minh mọc ở đâu · lịch sử Việt Nam trong bối cảnh khu vực |
| **Định lượng**           | Xác suất · tỷ lệ và phần trăm · đọc biểu đồ · nhận ra thống kê bị bóp méo                        |
| **Công nghệ**            | Máy tính làm việc thế nào · Internet · dữ liệu cá nhân · AI làm được và **không** làm được gì    |
| **Nghệ thuật & ý nghĩa** | Vì sao con người kể chuyện · đọc một tác phẩm · thẩm mỹ · đạo đức học nhập môn                   |

**Miền "Định lượng" đáng nhấn:** đọc được biểu đồ và nhận ra thống kê bị bóp méo là **năng lực tự
vệ** trong thời đại này, giá trị ngang bất kỳ môn nào trong bảng.

### 5.3 Cơ chế rèn (rẻ, hợp thực tế học sinh Việt Nam)

| Cơ chế                        | Cách làm                                             | Vì sao hiệu quả                                                                                          |
| ----------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Đọc rộng có nhịp**          | 20–30 phút/ngày ngoài sách giáo khoa, tự chọn chủ đề | Đọc nhiều → vốn từ → đọc hiểu tốt hơn → đọc được sách khó hơn. Vòng cộng dồn mạnh nhất trong cả tài liệu |
| **Một câu hỏi mỗi ngày**      | Mỗi ngày một thắc mắc, tự tìm 5 phút, viết 3 dòng    | Rẻ, đều, gắn thẳng vào trụ nghiên cứu R1                                                                 |
| **Bản đồ nối**                | Mỗi tuần nối 2 thứ học ở 2 môn khác nhau             | Chính là năng lực (3) ở mục 5.1 — thứ duy nhất không thể học vẹt                                         |
| **Giải thích cho người khác** | Giải thích một khái niệm cho người nhỏ tuổi hơn      | Lộ ngay chỗ mình chưa hiểu                                                                               |
| **Xoay miền**                 | Mỗi tháng một miền trong 7 miền                      | Chống lệch; đảm bảo không miền nào rỗng                                                                  |

**Ngưỡng đề xuất cuối 18 tuổi:** với mỗi miền trong 7 miền, nói được **3 ý lớn** và **1 câu hỏi
mình vẫn thắc mắc**. Câu hỏi còn thắc mắc quan trọng ngang ba ý lớn — nó chứng minh người học đã
vào đủ sâu để biết mình chưa biết gì.

---

## 6. Năng khiếu trong quãng 10–18

Theo bảng quỹ đạo ở tài liệu đồng hành (mục 5), quãng này có **hai chế độ khác hẳn nhau**:

### 6.1 10–14 — chế độ MỞ RỘNG

- **Mục tiêu: thử nhiều, chưa chốt.** Đây là lúc rẻ nhất để phát hiện năng khiếu ở lĩnh vực không
  ai ngờ.
- **Khuôn thử:** mỗi lĩnh vực **8–12 tuần**, đủ dài để qua đoạn chán đầu tiên (dưới 8 tuần thì chỉ
  đo được sự mới lạ, không đo được năng khiếu).
- **Mỗi năm thử 2–3 lĩnh vực.** Ưu tiên các lĩnh vực trường **không** đo: sư phạm, thủ công, lãnh
  đạo, chăm sóc–thấu cảm, công nghệ.
- **Cấm chốt sớm.** Trừ nhạc/thể thao/cờ (quỹ đạo vốn sớm), đầu tư nặng một lĩnh vực trước 14 tuổi
  thường là quyết định của người lớn, không phải của trẻ.

### 6.2 15–18 — chế độ THU HẸP

- Chọn **1–2 lĩnh vực** đầu tư sâu, dựa trên tín hiệu tích được từ giai đoạn mở rộng.
- Chuyển từ G1 (say mê) sang **G2 (chính xác)**: kỹ thuật đúng, phản hồi sửa lỗi dày, luyện tập có
  cấu trúc.
- **Kích hoạt luật chuyển giao:** với lĩnh vực cần cơ thể hoặc tai người thật (nhạc cụ, thể thao,
  thanh nhạc), DHCB phải nói thẳng rằng cần thầy người thật và giúp tìm.
- Vẫn **giữ đường nền**: SEL và WEL là điều kiện an toàn, không phải thứ đánh đổi cho đường đỉnh.

### 6.3 Năm tín hiệu nhận diện, đọc riêng cho tuổi 10–18

Dùng đúng 5 tín hiệu ở tài liệu đồng hành mục 6.1, nhưng ở tuổi này **tín hiệu #2 quan trọng nhất**:
_tự tìm đến khi không ai ép._ Vì đây là tuổi có nhiều sức ép nhất từ người lớn, nên thành tích cao
**không** phân biệt được năng khiếu thật với sự vâng lời. Chỉ hành vi tự phát mới phân biệt được.

**Cảnh báo phải bật:** thành tích cao + tín hiệu #2 vắng mặt → **nguy cơ ép buộc**. Companion nên
hỏi riêng người học (không qua phụ huynh) xem họ có thật sự muốn theo không.

---

## 7. Ghép vào thực tế học sinh Việt Nam

Bối cảnh thật: lịch học dày, thi chuyển cấp và thi tốt nghiệp là sức ép có thật, thời gian rảnh ít.
Kế hoạch nào bỏ qua điều này sẽ không chạy được.

**Ngân sách đề xuất — 5 giờ/tuần ngoài giờ học chính khoá:**

| Khoản                      | Thời lượng                     | Ghi chú                                      |
| -------------------------- | ------------------------------ | -------------------------------------------- |
| Đọc rộng                   | 20–30 phút × 5 ngày = ~2,5 giờ | Có thể thay bằng nghe khi di chuyển          |
| Một câu hỏi mỗi ngày       | 5 phút × 7 = ~0,5 giờ          | Rẻ nhất, lợi cộng dồn cao nhất               |
| Lĩnh vực năng khiếu        | 1,5–2 giờ                      | Giai đoạn thử thì chia cho lĩnh vực đang thử |
| Bản đồ nối + nhìn lại tuần | 20 phút                        | Chủ nhật                                     |

**Ba luật ghép với mùa thi:**

1. **Mùa thi thì co, không cắt.** Giữ "một câu hỏi mỗi ngày" (5 phút) — nó là sợi dây giữ thói quen.
2. **Kỹ thuật học hành ở mục 3 phục vụ luôn việc thi** — tự kiểm tra và học giãn cách chính là cách
   ôn thi hiệu quả nhất. Đây không phải việc thêm, nó **thay** cách ôn cũ.
3. **Không đánh đổi ngủ.** Thiếu ngủ phá đúng thứ đang cần: trí nhớ củng cố ban đêm. Học thêm 2 giờ
   bằng cách ngủ ít 2 giờ là lỗ.

---

## 8. Cạm bẫy của quãng này

| #   | Cạm bẫy                                       | Hệ quả                                        | Xử lý                                                                   |
| --- | --------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | **Học chỉ để thi**                            | Trụ 2 và 3 rỗng; hết thi là quên              | Ngân sách mục 7 tách riêng, bảo vệ được                                 |
| 2   | **Đọc lại thấy quen, tưởng đã hiểu**          | Điểm thấp bất ngờ, mất tự tin                 | Dạy "khó khăn có ích" ngay từ 10–12 tuổi                                |
| 3   | **Chốt năng khiếu quá sớm**                   | Bỏ lỡ lĩnh vực hợp hơn; kiệt sức              | Luật mở rộng 10–14 (mục 6.1)                                            |
| 4   | **Thành tích cao vì bị ép**                   | Bỏ ngay khi hết người ép, thường ở tuổi 19–22 | Tín hiệu #2 bắt buộc; hỏi riêng người học                               |
| 5   | **So sánh với bạn bè**                        | Hỏng SEL-02 đúng lúc bản sắc hình thành       | Chỉ so với chính mình; không bảng xếp hạng                              |
| 6   | **Bỏ ngủ và vận động để học**                 | Lỗ ròng                                       | Ngưỡng cứng, không thương lượng                                         |
| 7   | **Người lớn dùng kết quả chẩn đoán để trách** | Trẻ giấu điểm yếu → hệ thống mù               | Luật số 1: chẩn đoán không phải bảng chấm; xem tài liệu luồng người mới |

---

## 9. Đo bằng gì (và KHÔNG đo bằng gì)

| Nên đo                                     | Không đo                       |
| ------------------------------------------ | ------------------------------ |
| Độ bền sau 3 tháng (kiểm lại thứ đã học)   | Điểm kiểm tra ngay sau khi học |
| Số lĩnh vực đã thử ≥8 tuần                 | Số giờ ngồi trong app          |
| Chất lượng câu hỏi người học đặt ra        | Số câu trả lời đúng            |
| Có tự nêu được giới hạn của bài mình không | Bài trình bày đẹp tới đâu      |
| Có nối được 2 lĩnh vực xa nhau không       | Số sự kiện nhớ được            |
| Thời gian quay lại sau thất bại            | Số lần thất bại                |

Cột phải không sai — chúng chỉ **dễ đo mà ít nghĩa**. Nếu sản phẩm tối ưu theo cột phải, nó sẽ tạo
ra học sinh giỏi làm bài kiểm tra và không giỏi gì khác.

---

## 10. Hàm ý triển khai

| Việc                                                          | Ghi chú                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| Băng N1 (10–14) và N2 (15–18) đã có trong tài liệu 10–40      | Tài liệu này **bổ sung chiều sâu**, không tạo băng mới        |
| 3 trụ thành 3 lộ trình con trong đường nền                    | Học hành · Nghiên cứu · Hiểu biết rộng                        |
| Thang R1–R5 (nghiên cứu) là **thang mới**, cần contract riêng | Không trùng bậc Dreyfus B1–B5 (vốn dùng cho nghề)             |
| 7 miền tri thức thành dữ liệu tĩnh                            | Mỗi miền: 10–20 mô hình lõi + câu hỏi gợi mở                  |
| Chế độ mở rộng/thu hẹp theo tuổi                              | Đường đỉnh phải đọc tuổi để đổi chế độ (mục 6)                |
| Cảnh báo "nguy cơ ép buộc"                                    | Thành tích cao + thiếu tín hiệu tự phát → hỏi riêng người học |
| SRS/FSRS đã có trong repo                                     | Dùng lại cho học giãn cách, **không** xây mới                 |

---

## 11. Nguồn tham khảo bổ sung

- Dunlosky, J., Rawson, K., Marsh, E., Nathan, M., & Willingham, D. (2013). _Improving Students'
  Learning With Effective Learning Techniques_. _Psychological Science in the Public Interest_,
  14(1) — xếp hạng 10 kỹ thuật học theo mức bằng chứng (mục 3.1).
- Pashler, H. và cộng sự (2008). _Learning Styles: Concepts and Evidence_ — không có cơ sở cho việc
  dạy theo "phong cách học tập".
- Bjork, R. — khái niệm **khó khăn có ích** (desirable difficulties): điều kiện học khó hơn thường
  cho ghi nhớ dài hạn tốt hơn, dù cảm giác lúc học tệ hơn.
- Gagné (DMGT) · Subotnik, Olszewski-Kubilius & Worrell (Talent Development Megamodel) — đã dẫn đầy
  đủ ở `dong-hanh-va-phat-trien-nang-khieu-2026-08-23.md` mục 12.

---

## [4] Tài liệu: nang-luc-10-40-chi-tiet-2026-08-23.md

_(Chi tiết nguồn gốc: `nang-luc-10-40-chi-tiet-2026-08-23.md`)_

# Năng lực cá nhân 10–40 tuổi — bản chi tiết vận hành (2026-08-23)

> **Bản đồng hành** của `dac-ta-nang-luc-ca-nhan-theo-do-tuoi-2026-08-23.md`. Tài liệu kia là
> **khung** (3 trục, 30 năng lực, 8 băng tuổi 6→50+). Tài liệu này **đào sâu quãng 10–40** —
> quãng người dùng đông nhất của DHCB và là quãng **mọi cửa sổ cơ hội mở rồi đóng**.
>
> Khác biệt so với bản khung: chia **6 băng nhỏ** thay vì 5 băng thô, mỗi băng có **ngưỡng đo
> được**, **bài tự chẩn đoán**, **chương trình 12 tuần**, **biến thể theo họ nghề**, và
> **đường bù khi chưa đạt**.
>
> Mọi mã năng lực (`COG-01`, `SEL-02`…) và bậc (`B1`–`B5`) dùng đúng định nghĩa ở bản khung mục 5
> và mục 6 — không định nghĩa lại ở đây.

---

## 1. Vì sao 10–40 đáng tách riêng

Ba mươi năm này quyết định phần lớn phần đời còn lại, vì đúng ba việc xảy ra chồng lên nhau:

1. **Nạp năng lực rẻ nhất** — tốc độ xử lý và trí nhớ làm việc ở hoặc gần đỉnh suốt 15–33.
2. **Chi phí sai lầm thấp nhất rồi tăng vọt** — trước 28 ít người phụ thuộc, sau 30 chi phí cơ hội
   của một năm thử sai tăng nhiều lần.
3. **Lãi kép bắt đầu chạy** — tiền, mạng lưới, uy tín nghề, sức khoẻ: cả bốn đều cộng dồn, và cả
   bốn đều được gieo trong quãng này.

Sau 40 vẫn học được, vẫn đổi nghề được (bản khung mục 7.7–7.9 nói rõ, có bằng chứng). Nhưng sau 40
người ta chủ yếu **thu hoạch hoặc trả nợ** những gì gieo ở 10–40.

---

## 2. Bản đồ 6 băng nhỏ

| Băng   | Tuổi  | Tên gọi                   | Bậc nghề kỳ vọng | Câu hỏi trung tâm của băng                                           |
| ------ | ----- | ------------------------- | ---------------- | -------------------------------------------------------------------- |
| **N1** | 10–14 | Nền tảng & bản sắc sớm    | —                | "Mình học bằng cách nào, và mình là ai khi không ai chấm điểm?"      |
| **N2** | 15–18 | Thăm dò có bằng chứng     | —                | "Mình đã **chạm** vào nghề nào thật, chứ không chỉ thích trên giấy?" |
| **N3** | 19–22 | Bằng chứng làm được việc  | B1 → **B2**      | "Có ai ngoài trường lớp trả tiền/dùng thứ mình làm chưa?"            |
| **N4** | 23–27 | Vào nghề & sở hữu kết quả | B2 → **B3**      | "Mình đã chịu trách nhiệm trọn một kết quả có rủi ro thật chưa?"     |
| **N5** | 28–33 | Áp lực kép & chốt hướng   | B3 → **B4**      | "Mình đang **sâu thêm** hay chỉ đang **lặp lại**?"                   |
| **N6** | 34–40 | Đòn bẩy hoặc chuyển hướng | **B4** (± B5)    | "Giá trị mình tạo ra còn phụ thuộc bao nhiêu vào số giờ mình ngồi?"  |

Ánh xạ về `LifeStageType` đã có trong code (không tạo hệ mới — bản khung mục 12.0):

```
N1 → lower_secondary        N2 → upper_secondary       N3 → university_launchpad
N4 → young_professional     N5 → family_builder        N6 → family_builder + prime_leader
```

---

## 3. Bảng CỬA SỔ — cái gì rẻ đi, cái gì đắt lên

Đây là phần dễ bị dùng sai nhất. Đọc kèm mục 3.3 (cái KHÔNG đóng) và luật chống định mệnh luận.

### 3.1 Cửa sổ hẹp dần theo tuổi

| Cửa sổ                                                     | Rẻ nhất           | Sau đó                                                       | Bằng chứng / cơ chế                                                                                                                                                                                 |
| ---------------------------------------------------------- | ----------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ngữ pháp & phát âm ngoại ngữ gần bản ngữ**               | trước ~17–18      | vẫn học rất tốt, riêng **ngữ âm** khó chạm bản ngữ           | Hartshorne–Tenenbaum–Pinker 2018 (n≈670k): khả năng học ngữ pháp giữ gần nguyên đến ~17,4 rồi giảm dần. **Lưu ý:** phân tích lại (Slik 2022) cho thấy đây là **suy giảm đều**, không phải vách đứng |
| **Nạp khối lượng lớn, kỹ năng vận động/kỹ thuật phức tạp** | 15–25             | vẫn học được, cần nhiều lần lặp hơn                          | Tốc độ xử lý đỉnh cuối teen–đầu 20 (Hartshorne & Germine 2015)                                                                                                                                      |
| **Thử & sai nghề nghiệp**                                  | trước 28          | chi phí cơ hội tăng theo số người phụ thuộc                  | Cơ chế kinh tế–xã hội, không phải sinh học                                                                                                                                                          |
| **Lên bậc B1→B3**                                          | 19–27             | vẫn lên được, nhưng thị trường bắt đầu kỳ vọng bậc theo tuổi | Chuẩn tuyển dụng, không phải giới hạn năng lực                                                                                                                                                      |
| **Lãi kép tài chính**                                      | càng sớm càng lớn | mỗi năm trì hoãn mất phần đuôi dài nhất                      | Toán lãi kép: năm gieo sớm nhất là năm ủ lâu nhất                                                                                                                                                   |
| **Khả năng sinh sản**                                      | —                 | nữ giảm rõ sau ~35; nam chất lượng giao tử giảm dần sau ~40  | Y khoa. Nêu trung tính như **thông tin để lập kế hoạch**, tuyệt đối không kèm phán xét lựa chọn sống                                                                                                |

### 3.2 Cửa sổ MỞ RỘNG theo tuổi (thường bị bỏ quên)

| Năng lực                                       | Đỉnh                   | Hệ quả cho 34–40                                                |
| ---------------------------------------------- | ---------------------- | --------------------------------------------------------------- |
| Vốn từ, tri thức kết tinh, chuyên môn tích luỹ | còn tăng đến **65–70** | Học sâu, viết, giảng dạy, cố vấn ngày càng có lợi thế           |
| Đọc cảm xúc & bối cảnh xã hội (SEL-03)         | **40–50**              | Lãnh đạo, đàm phán, hoà giải, bán hàng phức tạp — vào đúng thời |
| Phán đoán trong bất định (PRO-03)              | tăng theo số ca đã gặp | Đây là chỗ người 34–40 đánh bại người 24                        |

### 3.3 Luật chống định mệnh luận (ràng buộc cứng khi hiển thị)

- Không màn hình nào được nói "đã muộn". Cửa sổ hẹp lại ≠ đóng.
- Mọi cảnh báo cửa sổ **phải** đi kèm đường bù cụ thể ở cùng màn hình.
- Bằng chứng ngược luôn hiển thị cùng chỗ: mục 3.2.
- Người vào DHCB ở tuổi 38 chưa có gì phải nhận được **kế hoạch**, không phải **bản kiểm điểm**.

---

## 4. Chi tiết từng băng

Quy ước: **Ngưỡng** = đo được, người ngoài kiểm chứng được. **Tự chẩn đoán** = trả lời có/không,
≥3 "không" thì băng đó là ưu tiên. **12 tuần** = chương trình một chu kỳ.

---

### 4.1 N1 — 10–14 tuổi · Nền tảng & bản sắc sớm

**Chủ đề:** chuyển từ "học vì người lớn bảo" sang "học vì mình biết cách". Não: tốc độ xử lý lên
nhanh, chức năng điều hành (kiềm chế, lập kế hoạch) **chưa** theo kịp → kỳ vọng phải khớp thực tế
sinh học, không dán nhãn "lười".

| #   | Năng lực                 | Ngưỡng cuối băng                                                               |
| --- | ------------------------ | ------------------------------------------------------------------------------ |
| 1   | COG-04 Siêu nhận thức    | Tự nói được "phần này con chưa chắc" **trước** khi bị kiểm tra                 |
| 2   | COG-04 (b) Chiến lược ôn | Dùng **tự kiểm tra** thay vì đọc lại — quan sát được trong cách ôn             |
| 3   | COG-02 Đánh giá nguồn    | Tự đặt câu "ai nói? sao biết?" với ≥1 tin trên mạng mỗi tuần                   |
| 4   | SEL-01 Tự điều chỉnh     | Giữ một thói quen tự chọn **≥30 ngày liên tục**                                |
| 5   | SEL-02 Kiên cường        | Sau điểm kém, quay lại học trong **≤48 giờ**, không cần dỗ                     |
| 6   | SEL-04 Giao tiếp         | Nói 3 phút trước ≥5 người, không đọc giấy, ≥1 lần/tháng                        |
| 7   | TEC-04 An toàn thông tin | Mọi tài khoản có mật khẩu **riêng** + 2FA; nhận diện được lừa đảo/bắt nạt mạng |
| 8   | WEL-02 Giấc ngủ          | Giờ ngủ cố định; thiết bị **ra khỏi phòng ngủ**                                |
| 9   | WEL-03 Tìm trợ giúp      | Kể được tên **3 người lớn** sẽ tìm khi gặp chuyện                              |

**Tự chẩn đoán (trả lời cùng phụ huynh):**
① Con có tự biết mình chưa hiểu chỗ nào không? ② Con có một thói quen nào tự giữ được trên 1 tháng
không? ③ Sau khi điểm kém, con mất bao lâu để quay lại? ④ Con có ai để kể chuyện khó không?
⑤ Điện thoại có ở trong phòng ngủ ban đêm không?

**Chương trình 12 tuần:**

- Tuần 1–2: nhật ký 2 câu mỗi tối ("hiểu…" / "chưa hiểu…") — dựng COG-04.
- Tuần 3–6: đổi cách ôn sang tự kiểm tra (che đáp án, tự hỏi lại). Đo bằng điểm bài kiểm tra tự làm.
- Tuần 5–12: một thói quen tự chọn, bảng đánh dấu 30 ngày — dựng SEL-01.
- Tuần 7–12: mỗi tháng một lần nói 3 phút trước nhóm — dựng SEL-04.
- Tuần 1: rà toàn bộ tài khoản, bật 2FA, ký quy ước dùng thiết bị cả nhà.

**Cạm bẫy:** khen "con thông minh" thay vì khen nỗ lực + chiến lược → hỏng SEL-02 lâu dài. Và
so sánh xã hội trên mạng đúng lúc bản sắc đang hình thành.

**Chưa đạt thì sao:** không có "trễ" ở băng này. Ưu tiên duy nhất nếu phải chọn một: **SEL-01**
(tự điều chỉnh) — nó mở khoá gần như mọi năng lực còn lại.

---

### 4.2 N2 — 15–18 tuổi · Thăm dò có bằng chứng

**Chủ đề:** bản sắc. Việc nghề: **Exploration — thử, chưa chốt**. Đây là băng **rẻ nhất để sai**;
mọi năm sau đó sai sẽ đắt hơn.

| #   | Năng lực                  | Ngưỡng cuối băng                                                                                |
| --- | ------------------------- | ----------------------------------------------------------------------------------------------- |
| 1   | PRO-05 Mạng lưới sơ khai  | Đã **nói chuyện thật** với ≥5 người đang làm nghề mình quan tâm (không phải đọc bài giới thiệu) |
| 2   | COG-03 Giải quyết vấn đề  | Hoàn thành ≥1 dự án tự chọn 8 tuần, **có sản phẩm người ngoài xem được**                        |
| 3   | COG-05 Tư duy dài hạn     | Viết được "bản đồ 3 ngã rẽ" sau THPT, mỗi ngã kèm đánh đổi cụ thể                               |
| 4   | COG-02 Phản biện          | Phân biệt được tương quan và nhân quả trong một tin thật                                        |
| 5   | TEC-03 Cộng tác AI        | Giữ được luật: AI giải xong → **tự giải lại từ đầu, che đáp án**                                |
| 6   | SEL-01 Học sâu            | Giữ khối 90 phút không thiết bị, 5 buổi/tuần, trong 4 tuần                                      |
| 7   | FIN-01 Dòng tiền          | Ghi chi tiêu **30 ngày liên tục**, nói được con số tháng                                        |
| 8   | Ngoại ngữ (nếu theo đuổi) | Đẩy mạnh **ngay trong băng này** — cửa sổ ngữ âm hẹp dần sau 17–18                              |
| 9   | WEL-02/03                 | Ngủ đủ trong mùa thi; biết dấu hiệu quá tải của bản thân                                        |

**Tự chẩn đoán:** ① Đã nói chuyện với người **đang làm** nghề mình muốn chưa? ② Có sản phẩm nào
người lạ xem được chưa? ③ Nêu được 2 phương án đời mình kèm đánh đổi chưa? ④ Biết mình tiêu bao
nhiêu một tháng không? ⑤ Có tuần nào học sâu không thiết bị chưa?

**Chương trình 12 tuần:**

- Tuần 1: chọn 3 nghề ứng viên → đặt lịch 3 cuộc phỏng vấn nghề 20 phút (người thật).
- Tuần 2–9: một dự án 8 tuần có sản phẩm công khai (bài viết, ứng dụng nhỏ, video, sự kiện…).
- Tuần 4–12: khối học sâu 90 phút × 5 buổi/tuần.
- Tuần 6: bắt đầu ghi chi tiêu 30 ngày.
- Tuần 10–12: viết "bản đồ 3 ngã rẽ", đưa cho ≥1 người lớn phản biện.

**Biến thể theo họ nghề:** kỹ thuật–CNTT & sáng tạo → dự án công khai là bằng chứng mạnh nhất, làm
sớm. Y tế & giáo dục → ưu tiên **giờ tiếp xúc thật** (trợ giúp, gia sư, tình nguyện) hơn dự án.
Sản xuất–kỹ thuật viên → chứng chỉ tay nghề bắt đầu từ băng này là lợi thế lớn.

**Cạm bẫy:** chốt nghề dựa trên **môn học yêu thích** mà chưa từng chạm nghề thật. Môn học ≠ nghề.

**Chưa đạt thì sao:** thiếu dự án/mạng lưới ở tuổi 18 không chặn đường nào cả — nhưng phải làm bù
ngay trong N3, ở đó nó vẫn còn rẻ.

---

### 4.3 N3 — 19–22 tuổi · Bằng chứng làm được việc (B1 → B2)

**Chủ đề:** chuyển từ _được chấm điểm_ sang _được trả tiền / được dùng_. Não gần đỉnh tốc độ và
trí nhớ làm việc → **cửa sổ nạp kỹ năng khó rẻ nhất đời**.

| #   | Năng lực                   | Ngưỡng cuối băng                                                                 |
| --- | -------------------------- | -------------------------------------------------------------------------------- |
| 1   | PRO-01 Chuyên môn → **B2** | Làm được việc thật có **người dùng thật hoặc người trả tiền thật**               |
| 2   | PRO-02 Giao việc trọn gói  | Cam kết hạn thật và giữ được **3 lần liên tiếp**                                 |
| 3   | SEL-04 Viết                | Viết được **1 trang ra quyết định** người lạ đọc hiểu, không cần giải thích thêm |
| 4   | TEC-05 Tự động hoá         | Đã tự bỏ được **≥1 việc tay lặp lại** của chính mình                             |
| 5   | TEC-03 Cộng tác AI         | Dùng AI tăng năng suất **và** vẫn làm được khi không có AI                       |
| 6   | PRO-05 Mạng lưới           | ≥5 quan hệ nghề **ngoài** trường lớp, có thể nhắn tin hỏi việc                   |
| 7   | FIN-02 Dự phòng            | **1 tháng** chi tiêu bằng tiền mặt                                               |
| 8   | FIN-05 Thời gian           | Có khối sâu được bảo vệ hằng tuần                                                |
| 9   | WEL-02 Giấc ngủ            | Nợ ngủ cuối tuần **< 2 giờ**                                                     |

**Tự chẩn đoán:** ① Có ai ngoài thầy cô từng dùng/trả tiền cho thứ mình làm chưa? ② Ba lần gần
nhất hứa hạn, giữ được mấy lần? ③ Viết 1 trang cho người lạ đọc hiểu được không? ④ Có 5 người
nghề ngoài trường để nhắn hỏi không? ⑤ Có 1 tháng chi tiêu tiền mặt chưa?

**Chương trình 12 tuần:**

- Tuần 1–2: chọn **một** việc thật (thực tập, freelance nhỏ, dự án mã nguồn mở, câu lạc bộ có
  khách hàng thật). Không phải bài tập.
- Tuần 3–10: làm nó, có hạn thật, có người ngoài nghiệm thu.
- Tuần 2–12: mỗi tuần **1 bài viết công khai** về thứ mình đang học → dựng SEL-04 + PRO-05 cùng lúc.
- Tuần 4: chọn 1 việc lặp lại của mình → tự động hoá.
- Tuần 1: đặt lệnh trích tiền tự động ngay khi có thu nhập.
- Tuần 1–12: giờ dậy cố định, kể cả cuối tuần.

**Biến thể theo họ nghề:** CNTT/sáng tạo → portfolio công khai quan trọng hơn điểm. Tài chính/pháp
lý/y tế → chứng chỉ và kỳ thi có giá trị gác cổng thật, **thi sớm khi trí nhớ đang đỉnh**. Sản
xuất → giờ tay nghề có giám sát. Dịch vụ công → hiểu quy trình + mạng lưới nội bộ.

**Cạm bẫy lớn nhất của băng này:** tích bằng cấp thay vì tích **bằng chứng làm được việc**. PIAAC
2024 cho thấy bằng cấp không còn bảo chứng năng lực — thị trường đã bắt đầu hành xử theo điều đó.

**Chưa đạt thì sao:** vào N4 mà chưa có bằng chứng thật → ưu tiên tuyệt đối là **#1 và #2**, mọi
thứ khác hoãn được. Một việc thật hoàn thành đúng hạn có giá hơn ba khoá học.

---

### 4.4 N4 — 23–27 tuổi · Vào nghề & sở hữu kết quả (B2 → B3)

**Chủ đề:** Thân mật vs. Cô lập (Erikson) chồng lên đầu Establishment (Super). Đây là băng người
ta dễ **dồn 100% vào nghề** và để trống quan hệ — hoá đơn đến ở N5–N6.

| #   | Năng lực                   | Ngưỡng cuối băng                                                               |
| --- | -------------------------- | ------------------------------------------------------------------------------ |
| 1   | PRO-01 Chuyên môn → **B3** | **Sở hữu trọn một kết quả có rủi ro thật** — tên bạn gắn với việc đó nếu hỏng  |
| 2   | PRO-05 Thương lượng        | Đã đàm phán lương/điều kiện **ít nhất 1 lần**, có chuẩn bị hồ sơ giá trị       |
| 3   | COG-05 Tư duy dài hạn      | Có **giả thuyết nghề 5 năm** viết ra, kèm **điều kiện bác bỏ** và mốc kiểm lại |
| 4   | TEC-03 Cộng tác AI         | Đã chuẩn hoá quy trình có AI cho mảng của mình, có bước kiểm chứng             |
| 5   | FIN-02 Dự phòng            | **3–6 tháng** chi tiêu                                                         |
| 6   | FIN-03 Tích luỹ            | Tỷ lệ tiết kiệm **cố định, tự động**, trích ngày nhận lương                    |
| 7   | SEL-05 Xung đột            | Nêu được bất đồng **sớm**, giữ được quan hệ sau đó                             |
| 8   | WEL-04 Quan hệ             | Có ≥1 quan hệ sâu **chịu được bất đồng**; có lịch cố định cho nó               |
| 9   | WEL-01 Thể chất            | ≥150 phút vận động/tuần, duy trì qua giai đoạn bận                             |

**Tự chẩn đoán:** ① Có việc nào hỏng thì tên mình chịu không? ② Đã từng đàm phán lương chưa?
③ Viết được giả thuyết nghề 5 năm kèm điều kiện bác bỏ chưa? ④ Có 3–6 tháng dự phòng chưa?
⑤ Có quan hệ nào mình đặt lịch cố định như đặt lịch họp không?

**Chương trình 12 tuần:**

- Tuần 1: xin nhận **một mảng có tên mình chịu trách nhiệm**. Đây là hành động quan trọng nhất
  của cả băng — bậc chỉ lên khi có **rủi ro thật + phản hồi thật**.
- Tuần 1–2: đặt lệnh trích tiết kiệm tự động; tính lại quỹ dự phòng theo chi tiêu thật.
- Tuần 3–4: viết giả thuyết nghề 5 năm + điều kiện bác bỏ + mốc kiểm lại 6 tháng.
- Tuần 5–8: chuẩn bị hồ sơ giá trị (việc đã làm → kết quả đo được) → một lần đề nghị thật.
- Tuần 1–12: lịch cố định cho quan hệ quan trọng nhất, đối xử ngang một cuộc họp không dời được.

**Biến thể theo họ nghề:** CNTT → B3 thường đến qua việc sở hữu một hệ thống đang chạy production.
Y tế → qua ca bệnh tự chịu trách nhiệm dưới giám sát. Kinh doanh → qua chỉ tiêu tự gánh. Giáo dục
→ qua lớp/chương trình tự thiết kế. Tài chính–pháp lý → qua hồ sơ tự ký. Sản xuất → qua ca/tổ tự
điều hành.

**Cạm bẫy:** đổi việc liên tục để tăng lương mà **không lên bậc**. Lương tăng, bậc đứng yên → cờ
"đóng băng kinh nghiệm" sẽ bật ở N5.

---

### 4.5 N5 — 28–33 tuổi · Áp lực kép & chốt hướng (B3 → B4)

**Chủ đề:** đỉnh yêu cầu nghề trùng đỉnh yêu cầu gia đình. Đây là băng **rơi rụng nhiều nhất** và
là băng biến ngữ cảnh chăm sóc (mục 5) quyết định nhất.

| #   | Năng lực                      | Ngưỡng cuối băng                                                                 |
| --- | ----------------------------- | -------------------------------------------------------------------------------- |
| 1   | PRO-01 Chuyên môn → **B4**    | **Người khác tìm đến bạn vì ca khó**, không phải vì bạn rảnh                     |
| 2   | PRO-04 Kèm cặp                | ≥1 người **lên bậc** nhờ bạn, nêu tên được                                       |
| 3   | FIN-05 Thời gian & năng lượng | Có khối sâu được bảo vệ **dù bận** — đã đàm phán với cả gia đình và công ty      |
| 4   | SEL-05 Xung đột               | Có cơ chế thật (ví dụ "họp gia đình" 30 phút/tuần)                               |
| 5   | FIN-02/04 Rủi ro              | Bảo hiểm y tế/nhân thọ đã rà; người thụ hưởng đã điền đúng                       |
| 6   | COG-05 Chốt hướng             | Đã **kiểm lại giả thuyết nghề** viết ở N4 và quyết: đi sâu hay chuyển            |
| 7   | TEC-03/05                     | Không tụt lại về công nghệ dù bận — vẫn tự tay làm, không chỉ giao               |
| 8   | WEL-01/02                     | Không đánh đổi ngủ lấy việc quá **2 đêm/tuần**; ngưỡng cứng "không việc sau 23h" |
| 9   | WEL-05 Ý nghĩa                | Nói được vì sao mình làm việc đang làm, **bằng một câu**                         |

**Tự chẩn đoán:** ① Trong 6 tháng qua, có ai tìm đến bạn vì ca khó không? ② Có ai lên bậc nhờ bạn
không? ③ Tuần vừa rồi có khối làm việc sâu nào không bị cắt không? ④ Bạn đang **sâu thêm** hay
đang **lặp lại** năm ngoái? ⑤ Bảo hiểm và người thụ hưởng đã đúng chưa?

**Chương trình 12 tuần:**

- Tuần 1: **cuộc đàm phán ba bên** — bạn, gia đình, công ty — về một khối 3 giờ/tuần bất khả xâm
  phạm. Không có khối này thì không có B4.
- Tuần 2–12: nhận **1 ca khó mỗi quý**, viết lại cách giải sau khi xong (viết lại chính là cơ chế
  chuyển B3→B4).
- Tuần 2–12: kèm **1 người**, 30 phút/tuần, 12 tuần liên tục → PRO-04.
- Tuần 3: rà bảo hiểm + người thụ hưởng + di chúc/uỷ quyền cơ bản.
- Tuần 6: mở lại giả thuyết nghề viết ở N4, đối chiếu điều kiện bác bỏ, **quyết dứt khoát**.
- Tuần 1–12: quy ước "họp gia đình" 30 phút/tuần; ngưỡng cứng không việc sau 23h.

**Cạm bẫy:** hoãn vô thời hạn mọi thứ không khẩn cấp (sức khoẻ, học, quan hệ). Món nợ này **đáo
hạn ở N6**, thường kèm lãi.

**Cờ cảnh báo cần bật ở băng này:** ≥6 năm nghề mà vẫn B2 → "đóng băng kinh nghiệm". Đây là chỗ
phát hiện sớm còn cứu được; phát hiện ở tuổi 40 thì đắt hơn nhiều.

---

### 4.6 N6 — 34–40 tuổi · Đòn bẩy hoặc chuyển hướng (B4, hướng B5)

**Chủ đề:** giá trị chuyển từ _số giờ ngồi_ sang _hệ thống và con người_. Lợi thế nhận thức bắt
đầu nghiêng về phía bạn: đọc người sắp vào đỉnh (40–50), tri thức kết tinh còn tăng dài.

| #   | Năng lực                       | Ngưỡng cuối băng                                                                                         |
| --- | ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| 1   | PRO-03 Lãnh đạo trong bất định | Có **sổ quyết định**: mỗi quyết lớn ghi giả định + mốc kiểm lại + kết quả thật                           |
| 2   | PRO-04 Kèm cặp thành hệ thống  | Tri thức đã ra khỏi đầu bạn — thành quy trình/tài liệu/khoá người khác dùng được                         |
| 3   | Đòn bẩy                        | Ít nhất một nguồn giá trị **không tỷ lệ thuận với số giờ bạn ngồi** (hệ thống, sản phẩm, người, tài sản) |
| 4   | COG-05 Hệ quả bậc 2            | Với mỗi quyết lớn, viết "rồi sao nữa?" **3 lần**                                                         |
| 5   | TEC-03/05                      | Tự tay làm ≥1 dự án nhỏ có AI — chống "lãnh đạo mù công nghệ"                                            |
| 6   | FIN-03 Đầu tư dài hạn          | Có tài sản sinh dòng tiền không phụ thuộc sức lao động; đã rà theo mốc hưu **của chính mình**            |
| 7   | SEL-02 Kiên cường              | Có bản sắc **ngoài chức danh** — trả lời được "tôi là ai nếu mai mất chức danh này"                      |
| 8   | PRO-05 Mạng lưới               | Mạng lưới **không co lại** theo công ty hiện tại                                                         |
| 9   | WEL-01 Thể chất                | Đã thêm **tập kháng lực** — khối cơ bắt đầu cần chủ động giữ từ quãng này                                |

**Tự chẩn đoán:** ① Nếu bạn nghỉ 1 tháng, giá trị bạn tạo ra giảm bao nhiêu phần trăm? ② Tri thức
lõi của bạn có tồn tại ở đâu ngoài đầu bạn không? ③ Bạn là ai nếu mai mất chức danh? ④ Mạng lưới
của bạn có bao nhiêu người ngoài công ty hiện tại? ⑤ Bạn đã học kỹ năng mới nào trong 12 tháng qua?

**Chương trình 12 tuần:**

- Tuần 1: lập **sổ quyết định**. Mỗi quyết lớn: giả định đang đặt cược + mốc kiểm lại. Đây là công
  cụ rẻ nhất để chuyển B4→B5, vì nó biến kinh nghiệm thành phản hồi có kiểm chứng.
- Tuần 2–8: viết/quay lại **một quy trình lõi** của nghề mình → tri thức ra khỏi đầu.
- Tuần 3–12: chọn một người kế nhiệm tiềm năng, giao dần việc thật.
- Tuần 4: tự tay làm một dự án nhỏ có AI, **không giao người khác** làm hộ.
- Tuần 6: rà lại tài chính theo **mốc nghỉ hưu của chính mình** theo luật hiện hành (Bộ luật Lao
  động 2019 có lộ trình tăng dần — không dùng con số nhớ cũ).
- Tuần 1–12: thêm 2 buổi kháng lực/tuần.

**Nếu câu trả lời là CHUYỂN HƯỚNG (hoàn toàn hợp lệ ở băng này):** dùng chuyển giao năng lực —
liệt kê 30 năng lực, đánh dấu cái nào **mang theo được** sang họ nghề mới (nhóm COG/SEL/FIN gần
như luôn mang theo được; PRO-01 thì không). Đường ngắn nhất thường là nghề **kề bên** trong cùng
họ hoặc họ lân cận, không phải nghề hoàn toàn xa lạ.

**Cạm bẫy lớn nhất:** đồng nhất bản thân với chức danh. Khi mất chức danh, WEL-05 và SEL-02 sụp
cùng lúc — và đây là băng bắt đầu có rủi ro đó thật.

---

## 5. Biến ngữ cảnh chăm sóc & gián đoạn nghề (đặc biệt N5–N6)

Bản khung mục 8 đã chốt nguyên tắc: **giới tính không phải trục kỳ vọng năng lực**. Ở quãng 28–40
nguyên tắc đó phải thành cơ chế cụ thể, vì đây đúng là nơi gián đoạn xảy ra.

### 5.1 Cơ chế

```
tuổi_nghề_hiệu_dụng (tháng) = tổng tháng làm nghề − tháng gián đoạn được khai
bậc kỳ vọng                 = f(tuổi_nghề_hiệu_dụng, cường độ thử thách)
```

Người nghỉ 24 tháng nuôi con ở tuổi 31 **không** bị hệ thống xếp là "chậm 2 năm so với tuổi". Mục
tiêu **không hạ**; **mốc thời gian dời**.

### 5.2 Gói "khởi động lại" (mở cho mọi giới)

| Việc                              | Vì sao                                                                                                     |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Lấy lại nhịp trước, tham vọng sau | 4 tuần đầu chỉ khôi phục thói quen làm việc sâu                                                            |
| Cập nhật cái đã đổi trong ngành   | Thường ít hơn người ta sợ; liệt kê ra để hết mơ hồ                                                         |
| Dựng lại mạng lưới                | Nối lại 10 quan hệ cũ trước khi tìm quan hệ mới                                                            |
| Diễn đạt khoảng trống CV          | Nói thẳng, ngắn, không xin lỗi: "Tôi nghỉ 24 tháng chăm con. Đây là việc tôi đã làm được từ khi quay lại." |
| Chọn lại điểm vào                 | Vào bằng **bằng chứng gần nhất** (một dự án thật, ngắn) thay vì bằng CV cũ                                 |

### 5.3 Với người đang trong giai đoạn chăm sóc (chưa gián đoạn hẳn)

- Ưu tiên **FIN-05** (thời gian & năng lượng) lên trên mọi năng lực khác — không có nó thì các
  năng lực khác không có chỗ chạy.
- Chấp nhận **giữ bậc** thay vì lên bậc trong 12–24 tháng là chiến lược đúng, không phải thất bại.
  Hệ thống phải nói điều này ra, rõ ràng.
- Với người bạn đời không phải người chăm chính: nhận phần chăm sóc là **đòn bẩy giảm chênh lệch
  hiệu quả nhất** theo bằng chứng hiện có. DHCB nên nói điều này với mọi giới.

---

## 6. Bảng tự chẩn đoán nhanh (định vị trong 3 phút)

Trả lời "có/không". Đếm số "có" theo từng nhóm.

| #   | Câu hỏi                                                   | Nhóm |
| --- | --------------------------------------------------------- | ---- |
| 1   | Tôi biết mình chưa hiểu chỗ nào **trước** khi bị kiểm tra | COG  |
| 2   | Tôi kiểm được nguồn của một khẳng định trước khi tin      | COG  |
| 3   | Tôi có kế hoạch >1 năm, viết ra, có mốc kiểm lại          | COG  |
| 4   | Tôi giữ được một thói quen tự chọn trên 30 ngày           | SEL  |
| 5   | Sau thất bại, tôi quay lại trong vòng 48 giờ              | SEL  |
| 6   | Tôi nêu bất đồng sớm và vẫn giữ được quan hệ              | SEL  |
| 7   | Tôi viết được 1 trang mà người lạ đọc hiểu ngay           | SEL  |
| 8   | Mọi tài khoản của tôi có mật khẩu riêng + 2FA             | TEC  |
| 9   | Tôi tự bỏ được ít nhất 1 việc tay lặp lại trong năm qua   | TEC  |
| 10  | Tôi dùng AI được và vẫn làm được khi không có AI          | TEC  |
| 11  | Có việc mà nếu hỏng thì tên tôi chịu                      | PRO  |
| 12  | Có người tìm đến tôi vì ca khó                            | PRO  |
| 13  | Có người lên bậc nhờ tôi                                  | PRO  |
| 14  | Tôi có ≥5 quan hệ nghề ngoài nơi làm hiện tại             | PRO  |
| 15  | Tôi đã từng đàm phán lương/điều kiện có chuẩn bị          | PRO  |
| 16  | Tôi biết chính xác thu–chi tháng gần nhất                 | FIN  |
| 17  | Tôi có ≥3 tháng chi tiêu dự phòng                         | FIN  |
| 18  | Tôi có tỷ lệ tiết kiệm cố định, tự động                   | FIN  |
| 19  | Tuần vừa rồi tôi có khối làm việc sâu không bị cắt        | FIN  |
| 20  | Tôi vận động ≥150 phút/tuần                               | WEL  |
| 21  | Nợ ngủ cuối tuần của tôi dưới 2 giờ                       | WEL  |
| 22  | Tôi có người có thể gọi lúc 2 giờ sáng                    | WEL  |
| 23  | Tôi nói được vì sao mình làm việc đang làm, bằng 1 câu    | WEL  |

**Cách đọc:**

- Nhóm nào có nhiều "không" nhất → đó là nhóm ưu tiên, **không phải** nhóm để tự trách.
- Câu 11 "không" ở tuổi ≥25 → ưu tiên tuyệt đối (chặn B3).
- Câu 12–13 "không" ở tuổi ≥30 → nguy cơ đóng băng ở B3.
- Câu 19 "không" ở mọi tuổi → xử lý FIN-05 **trước** mọi thứ khác; không có thời gian sâu thì
  không kế hoạch nào chạy được.
- Câu 17 "không" ở tuổi ≥27 → rủi ro tài chính chặn mọi lựa chọn nghề dũng cảm về sau.

**Luật hiển thị:** chỉ đưa ra **3 việc** một lúc. Danh sách 23 câu là để chẩn đoán, không phải để
giao việc.

---

## 7. Ba thứ lãi kép — bắt đầu ở 20 khác bắt đầu ở 35 nhiều nhất

| Thứ                   | Cơ chế cộng dồn                                      | Hệ quả nếu bắt đầu muộn                                | Đường bù nếu đã muộn                                                                              |
| --------------------- | ---------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| **Tiền**              | Lãi kép: đồng gieo sớm nhất là đồng ủ lâu nhất       | Mất phần đuôi dài nhất, không mua lại được bằng nỗ lực | Tăng **tỷ lệ** tiết kiệm và kéo dài thời gian tạo thu nhập; ưu tiên FIN-04 (nợ) trước FIN-03      |
| **Mạng lưới**         | Quan hệ yếu tích luỹ, mỗi quan hệ mở ra quan hệ khác | Cơ hội đến chậm hơn và ít hơn                          | Đi vào nơi mật độ cao (cộng đồng nghề, viết công khai) — bù được **nhanh nhất** trong ba thứ      |
| **Uy tín nghề (bậc)** | Bậc chỉ lên khi có rủi ro thật lặp lại               | Bị mắc kẹt ở B2–B3 dù thâm niên dài                    | Chủ động nhận việc có rủi ro thật + viết lại cách giải; đây là đường duy nhất, không có đường tắt |

**Điều đáng nói nhất:** trong ba thứ, chỉ **tiền** là thứ mà bắt đầu muộn thực sự mất mát không
bù được hoàn toàn. Mạng lưới và bậc nghề **bù được** — chúng phụ thuộc hành động hiện tại nhiều
hơn phụ thuộc năm sinh. Đây là thông điệp phải hiển thị cho mọi người dùng vào DHCB sau tuổi 33.

---

## 8. Hàm ý cho triển khai

Bản khung đề xuất 5 PR C1→C5. Nếu chốt **phạm vi 10–40**, khối lượng giảm đáng kể và thứ tự nên là:

| PR                     | Điều chỉnh khi thu hẹp về 10–40                                                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **C1** contracts       | `AgeBand` = 6 băng N1–N6 (thay 8 băng); vẫn ánh xạ về `LifeStageType` đã có, không tạo hệ mới                                                              |
| **C2** dữ liệu tĩnh    | Chuyển mục 4 của tài liệu này thành dữ liệu: ngưỡng, tự chẩn đoán, chương trình 12 tuần, biến thể họ nghề                                                  |
| **C2b** bảng chẩn đoán | 23 câu ở mục 6 + luật đọc ở cùng mục — đây là đường vào rẻ nhất cho người dùng mới                                                                         |
| **C3** service         | Chấm điểm, xếp hạng khoảng cách, cờ "đóng băng kinh nghiệm", cơ chế `tuổi_nghề_hiệu_dụng` ở mục 5.1; **test bất biến: đổi trường giới → đầu ra không đổi** |
| **C4** DB + API        | Không đổi so với bản khung                                                                                                                                 |
| **C5** UI              | Ưu tiên hai màn: "tự chẩn đoán 3 phút" và "3 việc trong 12 tuần". Các màn còn lại hoãn được                                                                |

**Đề xuất thứ tự làm thật:** C1 → C2b (chẩn đoán) → C5 màn chẩn đoán → C2 → C3 → C4. Lý do: bảng
chẩn đoán là thứ tạo giá trị cho người dùng **sớm nhất với ít code nhất**, và nó sinh ra dữ liệu
thật để hiệu chỉnh các ngưỡng ở mục 4 — vốn hiện đang dựa trên tài liệu nước ngoài, chưa có dữ
liệu người Việt.

---

## 9. Nguồn bổ sung (ngoài danh mục ở bản khung)

- Hartshorne, J. K., Tenenbaum, J. B., & Pinker, S. (2018). _A critical period for second language
  acquisition: Evidence from 2/3 million English speakers_. _Cognition_, 177 —
  https://dspace.mit.edu/entities/publication/a52f82e4-59da-416c-96e8-28257c058ed9
- van der Slik, F. và cộng sự (2022). _Critical Period Claim Revisited: Reanalysis of Hartshorne,
  Tenenbaum, and Pinker (2018) Suggests Steady Decline and Learner-Type Differences_.
  _Language Learning_ — https://onlinelibrary.wiley.com/doi/full/10.1111/lang.12470
  (**quan trọng:** đây là lý do tài liệu này nói "hẹp dần", không nói "đóng lại")

---

## [5] Tài liệu: dong-hanh-va-phat-trien-nang-khieu-2026-08-23.md

_(Chi tiết nguồn gốc: `dong-hanh-va-phat-trien-nang-khieu-2026-08-23.md`)_

# DHCB là BẠN ĐỒNG HÀNH — tư thế đồng hành & phát triển năng khiếu (2026-08-23)

> **Tuyên bố của người dùng (2026-08-23):** _"tôi muốn DHCB là bạn đồng hành, cùng đồng hành và
> hướng dẫn cá nhân đó phát triển tốt nhất có thể theo độ tuổi, đạt được những năng lực và kỹ năng
> theo độ tuổi, phát triển vượt bậc năng khiếu của họ… góp phần phát triển xã hội ngày càng tốt
> đẹp hơn."_
>
> Đây là **tài liệu thứ ba** của bộ. Hai tài liệu trước trả lời _"cần năng lực gì và làm sao đạt"_.
> Tài liệu này trả lời hai câu chưa ai trả lời: **đồng hành nghĩa là gì (khác gì chấm điểm)** và
> **làm sao phát triển vượt bậc NĂNG KHIẾU**, chứ không chỉ đưa mọi người lên mức chuẩn.
>
> - Khung tổng: `dac-ta-nang-luc-ca-nhan-theo-do-tuoi-2026-08-23.md`
> - Chi tiết 10–40: `nang-luc-10-40-chi-tiet-2026-08-23.md`

---

## 0. Một căng thẳng phải nói thẳng trước

Hai tài liệu trước nghiêng nhiều về **chẩn đoán, ngưỡng, bảng chấm**. Với năng lực **nền** thì
đúng — có sàn khách quan, và người dùng cần biết mình đứng đâu.

Nhưng nếu bê nguyên tư thế đó sang năng khiếu và sang quan hệ hằng ngày, DHCB sẽ thành **máy chấm
điểm người**, đúng thứ tuyên bố trên bác bỏ. Một người 34 tuổi mở app ra và thấy 12 ô đỏ sẽ đóng
app, không phải vì bảng sai mà vì **không ai muốn sống cạnh một cái bảng chấm**.

Tài liệu này giải quyết bằng cách tách vai:

|           | Chẩn đoán (đã có)                       | Đồng hành (tài liệu này)                   |
| --------- | --------------------------------------- | ------------------------------------------ |
| Dùng để   | **Chọn việc tiếp theo**                 | **Đi cùng suốt quãng làm việc đó**         |
| Ai thấy   | Chỉ người dùng, khi họ chủ động mở      | Mọi ngày                                   |
| Hình thức | Bảng, số, khoảng cách                   | Đối thoại, nhắc đúng lúc, ăn mừng đúng chỗ |
| **Cấm**   | Hiển thị như điểm số xếp hạng con người | Phán xét, so sánh với người khác           |

**Luật số 1 của cả sản phẩm:** kết quả chẩn đoán **không bao giờ** là màn hình chính. Nó là công cụ
chọn việc, mở khi cần, đóng lại sau đó.

---

## 1. Bốn cam kết cụ thể (dịch tuyên bố thành ràng buộc kiểm được)

| #   | Tuyên bố                                      | Ràng buộc thi hành được                                                                                                                    |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | "bạn đồng hành"                               | Companion **nhớ ngữ cảnh cá nhân** xuyên trụ, chủ động hỏi thăm khi người dùng vắng, và **không bao giờ** mở đầu bằng số liệu về thiếu sót |
| 2   | "phát triển tốt nhất có thể **theo độ tuổi**" | Mọi mục tiêu sinh ra phải khớp băng tuổi + bậc + hoàn cảnh; không có mục tiêu "chuẩn chung" áp cho mọi người                               |
| 3   | "phát triển **vượt bậc năng khiếu**"          | Có **đường ĐỈNH** riêng, tự chọn, khác hoàn toàn đường nền (mục 3–7)                                                                       |
| 4   | "góp phần phát triển xã hội"                  | Có cơ chế **đóng góp ngược** đo được, không phải khẩu hiệu (mục 9)                                                                         |

---

## 2. Tư thế đồng hành — 8 luật hành xử của Companion

Nền lý thuyết: **Thuyết tự quyết (SDT)** — ba nhu cầu tâm lý cơ bản là **tự chủ, năng lực, kết
nối**. Repo đã có `MotivationDiagnostic` chấm đúng ba trục này (`aut`/`comp`/`rel` trong
`lifeMilestoneMasteryService.ts`), nên tư thế này **cắm được vào code đã có**, không phải xây mới.

| #   | Luật                                                                      | Vì sao (SDT) | Phản ví dụ bị cấm                                          |
| --- | ------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------- |
| 1   | **Người dùng chốt mục tiêu, Companion đề xuất**                           | Tự chủ       | "Hôm nay bạn PHẢI học 20 từ"                               |
| 2   | **Hỏi trước khi khuyên** — hiểu hoàn cảnh rồi mới nói                     | Tự chủ       | Khuyên đổi việc mà không biết họ đang nuôi con nhỏ         |
| 3   | **Mỗi lúc chỉ 3 việc**                                                    | Năng lực     | Danh sách 23 việc cần cải thiện                            |
| 4   | **Ăn mừng tiến bộ so với CHÍNH HỌ**, không so người khác                  | Năng lực     | Bảng xếp hạng công khai người này hơn người kia            |
| 5   | **Gián đoạn là bình thường** — quay lại luôn được chào đón, không tính sổ | Kết nối      | "Bạn đã bỏ 14 ngày, chuỗi streak đã mất" kèm giọng trách   |
| 6   | **Nói thật khi cần**, kể cả điều khó nghe — nhưng luôn kèm đường đi tiếp  | Năng lực     | Khen suông; hoặc chê mà không có bước kế                   |
| 7   | **Biết giới hạn của mình** và chỉ sang người thật khi vượt giới hạn       | Kết nối      | AI tự tư vấn tâm lý lâm sàng, y tế, pháp lý, đầu tư        |
| 8   | **Không lấy thời gian của người dùng làm chỉ số thành công**              | Toàn bộ      | Thiết kế gây nghiện, chuỗi ngày ép buộc, thông báo dồn dập |

**Luật 8 đáng nhấn mạnh:** chỉ số thành công của DHCB là **người dùng tiến bộ trong đời thật**,
không phải số phút họ ở trong app. Hai chỉ số này thường xung đột; khi xung đột, chọn cái đầu.

---

## 3. Hai đường song song: NỀN và ĐỈNH

```
Đường NỀN (mọi người, bắt buộc, có sàn)
  → 30 năng lực lõi theo băng tuổi           → tài liệu 1 & 2
  → Mục tiêu: không ai bị bỏ lại dưới sàn

Đường ĐỈNH (tự chọn, không sàn, không trần)
  → 1–2 lĩnh vực năng khiếu                   → tài liệu này, mục 4–8
  → Mục tiêu: đi xa nhất có thể trong lĩnh vực đó
```

**Ba luật ghép hai đường:**

1. **Đường nền không bao giờ bị hy sinh cho đường đỉnh.** Cụ thể: nhóm **SEL** (cảm xúc–xã hội) và
   **WEL** (sức khoẻ–ý nghĩa) là **điều kiện an toàn** để theo đuổi đường đỉnh. Một tài năng bị
   kiệt sức ở tuổi 19 là thất bại của hệ thống, không phải cái giá phải trả.
2. **Đường đỉnh là tự chọn, luôn rút được.** Không dán nhãn vĩnh viễn, không "đã vào lớp năng
   khiếu thì phải theo".
3. **Không có năng khiếu nổi bật vẫn là bình thường tuyệt đối.** Phần lớn người dùng sẽ ở đường
   nền, và đường nền tự nó đã đủ để có một cuộc đời tốt. Sản phẩm **không được** ngầm truyền thông
   rằng không có năng khiếu là thiếu sót.

---

## 4. Năng khiếu vận hành thế nào (mô hình được chọn)

### 4.1 Gagné — DMGT: **năng khiếu ≠ tài năng**

- **Năng khiếu (gift)** = khả năng tự nhiên nổi trội, còn thô.
- **Tài năng (talent)** = kiến thức & kỹ năng nổi trội **đã phát triển**.
- Chuyển từ _gift_ sang _talent_ cần **quá trình phát triển** + hai loại **xúc tác**:
  - **Nội tại:** động lực, ý chí, tự quản lý, tính khí.
  - **Môi trường:** cơ hội học, người thầy, sự đầu tư bền bỉ, gia đình.

**Hệ quả cho DHCB — quan trọng nhất trong cả tài liệu:** phần lớn thứ quyết định một năng khiếu có
thành tài năng hay không **nằm ở xúc tác, không nằm ở năng khiếu**. Và xúc tác thì **rèn được** —
đó chính là chỗ một bạn đồng hành AI tạo ra giá trị thật, thay vì chỉ đo xem ai có năng khiếu.

### 4.2 Subotnik–Olszewski-Kubilius–Worrell — Talent Development Megamodel

Bốn điểm cốt lõi, đều có hệ quả trực tiếp:

| Phát hiện                                                                                                                   | Hệ quả cho DHCB                                                 |
| --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Năng khiếu đi theo chuỗi: **tiềm năng → thành thạo → chuyên gia → (đôi khi) kiệt xuất**                                     | Mỗi giai đoạn cần **loại hỗ trợ khác nhau** — mục 7             |
| **Mỗi lĩnh vực có quỹ đạo riêng** (bắt đầu, đỉnh, kết thúc khác nhau)                                                       | Không có một lịch chung; phải có **bảng theo lĩnh vực** — mục 5 |
| **Kỹ năng tâm lý xã hội** (động lực, kiên cường, dám mạo hiểm có tính toán) là yếu tố phân định ở bậc cao — và **rèn được** | Đây là **đóng góp lớn nhất DHCB có thể tạo ra** — mục 8         |
| **Cơ hội do xã hội cung cấp** mang tính quyết định ở mọi điểm                                                               | Nối thẳng sang cam kết #4 — mục 9                               |

### 4.3 Điều KHÔNG được nói

Luyện tập có chủ đích là điều kiện **cần**, không phải điều kiện **đủ**; và khả năng chuyên biệt
theo lĩnh vực có vai trò thật. Vì vậy DHCB **không** hứa "cứ luyện 10.000 giờ là thành tài năng" —
đó là lời hứa sai, và nó đổ toàn bộ trách nhiệm thất bại lên người học.

---

## 5. Bảng quỹ đạo theo lĩnh vực năng khiếu

"Cửa sổ nhận diện" = quãng dấu hiệu bắt đầu đọc được. "Đầu tư nặng" = quãng luyện tập có cấu trúc
sinh lợi cao nhất. Bắt đầu muộn hơn vẫn được — chỉ đổi mục tiêu từ _kiệt xuất_ sang _rất giỏi_, và
rất giỏi đã là một cuộc đời tốt.

| Lĩnh vực                   | Nhận diện | Đầu tư nặng | Đỉnh sáng tạo    | Ghi chú                                                                 |
| -------------------------- | --------- | ----------- | ---------------- | ----------------------------------------------------------------------- |
| **Âm nhạc biểu diễn**      | 4–8       | 6–18        | 20–45            | Quỹ đạo sớm nhất; kỹ thuật vận động cần nền sớm                         |
| **Thể thao**               | 6–12      | 10–20       | 18–32 (theo môn) | Ràng buộc sinh lý rõ; cần kế hoạch đời sau thể thao **từ sớm**          |
| **Toán & cờ**              | 8–14      | 12–22       | 20–40            | Nhận diện sớm khá tin cậy; dấu hiệu: tự tìm bài khó khi không ai ép     |
| **Ngôn ngữ**               | 6–14      | 8–20        | rộng             | Ngữ âm hẹp dần sau 17–18; các mặt khác mở rất dài                       |
| **Mỹ thuật thị giác**      | 6–14      | 12–25       | 25–55            | Kỹ thuật sớm, tiếng nói riêng muộn                                      |
| **Viết văn**               | 12–20     | 16–30       | **30–60**        | Cần vốn sống; nhận diện sớm không đáng tin                              |
| **Khoa học & nghiên cứu**  | 12–20     | 18–32       | 30–50            | Phụ thuộc mạnh vào người hướng dẫn                                      |
| **Công nghệ & kỹ thuật**   | 10–18     | 15–30       | 25–45            | Dấu hiệu: tự tháo ra lắp lại, tự làm thứ chưa ai giao                   |
| **Lãnh đạo & khởi nghiệp** | 14–25     | 20–35       | **35–55**        | Cần SEL-03 (đọc người) — vốn đỉnh ở 40–50                               |
| **Sư phạm & truyền đạt**   | 14–25     | 20–40       | 35–60            | Rất hay bị bỏ sót vì trường không đo                                    |
| **Chăm sóc & thấu cảm**    | 10–20     | 18–35       | 35–60            | Năng khiếu thật, giá trị xã hội cao, gần như **không được đo ở đâu cả** |
| **Thủ công & tay nghề**    | 10–18     | 14–28       | 30–55            | Đo bằng sản phẩm, không đo bằng bài kiểm tra                            |

**Ba điều bảng này nói ra:**

1. **Chỉ 3–4 lĩnh vực có cửa sổ thật sự sớm** (nhạc, thể thao, toán/cờ). Phần lớn lĩnh vực còn lại
   nhận diện **sau 12 tuổi**, nhiều lĩnh vực đỉnh **sau 35**. Nỗi sợ "con tôi 10 tuổi chưa lộ năng
   khiếu gì" phần lớn là sợ hão.
2. **Bốn lĩnh vực cuối bảng gần như không được trường học đo** — sư phạm, chăm sóc–thấu cảm, thủ
   công, lãnh đạo. Rất nhiều người sống cả đời tin mình "không có năng khiếu gì" chỉ vì năng khiếu
   của họ không nằm trong bảng điểm. **Đây là khoảng trống lớn nhất DHCB có thể lấp.**
3. Với lĩnh vực đỉnh muộn (viết, lãnh đạo, sư phạm, chăm sóc), người **34–40** đang ở _đầu_ đường
   đỉnh, không phải cuối.

---

## 6. Nhận diện năng khiếu mà KHÔNG dán nhãn

### 6.1 Năm tín hiệu hành vi (quan sát, không phải bài thi)

| #   | Tín hiệu                                                                             | Vì sao đáng tin                                     |
| --- | ------------------------------------------------------------------------------------ | --------------------------------------------------- |
| 1   | **Tốc độ học bất thường** — cần ít lần lặp hơn hẳn người cùng tuổi trong lĩnh vực đó | Chỉ dấu tin cậy nhất và ít phụ thuộc hoàn cảnh nhất |
| 2   | **Tự tìm đến khi không ai ép** — làm cả khi không ai chấm, không ai xem              | Phân biệt năng khiếu thật với thành tích do sức ép  |
| 3   | **Chất lượng câu hỏi** — hỏi thứ người mới thường không nghĩ tới                     | Phản ánh cấu trúc hiểu biết, khó nguỵ tạo           |
| 4   | **Chịu được đoạn luyện tập chán** trong lĩnh vực đó, mà không chịu ở lĩnh vực khác   | Chính là xúc tác nội tại của Gagné, đang hoạt động  |
| 5   | **Chưa chạm trần** — đưa việc khó hơn thì vẫn tiến, không dừng                       | Chỉ dấu tiềm năng còn xa mới hết                    |

**Ngưỡng đề xuất:** ≥3/5 tín hiệu, **duy trì ≥6 tháng** → gợi ý mở đường đỉnh cho lĩnh vực đó.
Gợi ý, **không** phải kết luận, và người dùng (hoặc phụ huynh) chốt.

### 6.2 Sáu luật chống dán nhãn (ràng buộc cứng)

1. **Không có nhãn "có năng khiếu / không có năng khiếu"** trong dữ liệu hay giao diện. Chỉ có
   "đang theo đường đỉnh ở lĩnh vực X" — một **trạng thái**, không phải một **bản chất**.
2. **Rút lúc nào cũng được**, không cần lý do, không hiển thị như thất bại.
3. **Mở được nhiều lĩnh vực theo thời gian.** Người 30 tuổi mới mở đường đỉnh là hoàn toàn bình
   thường — xem quỹ đạo muộn ở mục 5.
4. **Không so sánh giữa người dùng.** Không bảng xếp hạng năng khiếu, dù ở bất kỳ hình thức nào.
5. **Không kết luận từ một bài kiểm tra.** Tín hiệu phải là hành vi, kéo dài, đa nguồn.
6. **Thiếu cơ hội ≠ thiếu năng khiếu.** Với người dùng ở vùng ít điều kiện, tín hiệu 1 và 3 được
   ưu tiên hơn tín hiệu 2 và 5 — vì hai tín hiệu sau phụ thuộc việc có sẵn công cụ/môi trường.

---

## 7. Bốn giai đoạn nuôi năng khiếu — và vai trò DHCB ở mỗi giai đoạn

| Giai đoạn                              | Người học cần gì nhất                             | DHCB làm được gì                                                              | DHCB **không** làm được — phải chuyển giao                                                                                                        |
| -------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **G1 — Say mê** (tiềm năng)            | Được chơi, được thử, được yêu lĩnh vực đó         | Mở cửa nhiều lĩnh vực, gợi ý thử, giữ lửa, **không** ép cấu trúc quá sớm      | —                                                                                                                                                 |
| **G2 — Chính xác** (thành thạo)        | Kỹ thuật đúng, phản hồi sửa lỗi dày               | Luyện tập có cấu trúc, chấm sai sót, lặp cách quãng, nhắc đúng lúc            | Với lĩnh vực cần **cơ thể hoặc tai người thật** (nhạc cụ, thể thao, phẫu thuật, thanh nhạc): **phải có thầy người thật**. DHCB nói thẳng điều này |
| **G3 — Tiếng nói riêng** (chuyên gia)  | Người thầy giỏi, cộng đồng đồng đẳng, cơ hội thật | Nối vào cộng đồng, chuẩn bị hồ sơ, luyện phản biện, giữ kỷ luật dài hạn       | **Không thay được người thầy bậc cao và mạng lưới thật.** Vai trò DHCB chuyển sang **hậu cần và tâm lý**                                          |
| **G4 — Đóng góp** (sáng tạo/kiệt xuất) | Vấn đề đáng giá để giải, sự bền bỉ nhiều năm      | Giữ động lực dài hạn, sổ quyết định, chống kiệt sức, nối sang đóng góp xã hội | Không thay được việc bước vào đấu trường thật                                                                                                     |

**Luật chuyển giao (bắt buộc):** khi người học đạt G2 cao trở lên trong lĩnh vực cần thầy người
thật, Companion **phải chủ động nói ra giới hạn của mình** và giúp tìm thầy/cộng đồng. Một bạn
đồng hành trung thực nói "chỗ này bạn cần một người thầy thật, để mình giúp bạn tìm" — chứ không
giả vờ đủ sức để giữ người dùng ở lại. Đây là hệ quả trực tiếp của Luật 7 và Luật 8 ở mục 2.

---

## 8. Kỹ năng tâm lý xã hội — chỗ DHCB tạo giá trị lớn nhất

Bằng chứng từ TDMM: ở bậc cao, **kỹ năng tâm lý xã hội phân định ai đi tiếp và ai dừng** — và
chúng **rèn được**. Đây cũng chính là "xúc tác nội tại" của Gagné.

Đây là tin tốt cho sản phẩm: DHCB không thay được thầy dạy đàn, nhưng **có thể đồng hành hằng ngày
ở đúng phần quyết định nhất** — thứ mà ngay cả người thầy giỏi cũng chỉ chạm tới vài giờ mỗi tuần.

| Kỹ năng                               | Rèn bằng cách nào (cụ thể, DHCB làm được)                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Động lực bền**                      | Nối việc đang làm với lý do của chính người học (WEL-05); mục tiêu do họ chốt (Luật 1)              |
| **Kiên cường sau thất bại**           | Nhật ký thất bại: mỗi lần hỏng ghi 1 điều học được; đo **thời gian quay lại**, không đo số lần hỏng |
| **Dám mạo hiểm có tính toán**         | Tập chọn việc khó hơn một bậc, có lưới an toàn; ghi vào sổ quyết định                               |
| **Chịu được luyện tập chán**          | Chia nhỏ, đặt mốc gần, làm cho tiến bộ **nhìn thấy được** hằng tuần                                 |
| **Xử lý áp lực thi đấu/trình diễn**   | Diễn tập trong điều kiện gần thật; chuẩn hoá quy trình trước giờ G                                  |
| **Tự quản lý & bảo vệ thời gian sâu** | FIN-05: khối sâu bất khả xâm phạm, đàm phán với gia đình/công việc                                  |
| **Biết khi nào nghỉ**                 | Ngưỡng cứng: không đánh đổi ngủ quá 2 đêm/tuần; phát hiện sớm dấu kiệt sức                          |

Dòng cuối bảng quan trọng ngang các dòng trên. Một bạn đồng hành thật sự là người **bảo bạn nghỉ**
khi cần, không phải người luôn bảo bạn cố thêm.

---

## 9. "Góp phần phát triển xã hội" — cơ chế, không khẩu hiệu

Cam kết #4 chỉ có nghĩa nếu có cơ chế và có cách đo. Bốn cơ chế đề xuất, xếp theo độ khả thi:

| #   | Cơ chế                                       | Cách làm                                                                                                        | Đo bằng                                                      |
| --- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 1   | **Vòng kèm cặp** — người học thành người kèm | Đạt B3+ ở một mảng → mời kèm 1 người đi sau, 30 phút/tuần. Nối thẳng vào PRO-04 (vốn là ngưỡng năng lực của N5) | Số cặp kèm đang hoạt động; số người **lên bậc** nhờ được kèm |
| 2   | **Tiếp cận công bằng**                       | Giữ gói miễn phí đủ dùng thật; ưu tiên người khó khăn. Khớp định hướng "vốn tối thiểu, chi phí thấp" của dự án  | Tỷ lệ người dùng hoạt động thuộc nhóm miễn phí               |
| 3   | **Sản phẩm công khai**                       | Khuyến khích tạo thứ người khác dùng được (bài viết, công cụ, bài giảng) — vốn đã là ngưỡng của N2/N3           | Số sản phẩm công khai người dùng tạo ra                      |
| 4   | **Tri thức mở**                              | Kho lộ trình/tài liệu mở, dùng được cả khi không trả tiền                                                       | Lượt dùng phần mở                                            |

**Nguyên tắc thiết kế:** đóng góp xã hội **không phải một tính năng riêng** treo bên cạnh. Nó là
**giai đoạn tự nhiên** của chính lộ trình cá nhân — vì "cống hiến vs. trì trệ" đúng là chủ đề phát
triển của tuổi 38–50 (Erikson), và vì cách vững nhất để lên B4–B5 là **dạy lại**. Người dùng đóng
góp cho xã hội **trong lúc** phát triển bản thân, không phải sau khi phát triển xong.

**Luật cấm:** không biến đóng góp thành nghĩa vụ, chỉ tiêu, hay điều kiện mở khoá tính năng. Mời,
không ép — nếu không, nó vi phạm Luật 1 (tự chủ) và sẽ hỏng đúng thứ nó định tạo ra.

---

## 10. Hàm ý sản phẩm

### 10.1 Companion cần thêm gì (so với hiện tại)

| Cần                                            | Vì sao                                           | Đã có gì trong repo                                           |
| ---------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------- |
| Bộ nhớ cá nhân xuyên trụ, dài hạn              | Không nhớ thì không phải đồng hành               | Đã có nền `personal` (facts/memory/consent)                   |
| Chủ động đúng liều                             | Đồng hành ≠ chờ được hỏi; nhưng cũng ≠ làm phiền | Cần luật tần suất + tôn trọng im lặng                         |
| Nhận biết hoàn cảnh trước khi khuyên           | Luật 2                                           | Cần trường hoàn cảnh (chăm sóc, gián đoạn) — tài liệu 2 mục 5 |
| Đường đỉnh (năng khiếu) như trạng thái tự chọn | Cam kết #3                                       | Chưa có — phần mới                                            |
| Luật chuyển giao sang người thật               | Mục 7, Luật 7                                    | Chưa có — **phải có trước khi phát hành đường đỉnh**          |
| Vòng kèm cặp                                   | Cam kết #4                                       | Chưa có                                                       |

### 10.2 Điều chỉnh kế hoạch PR

Bổ sung vào kế hoạch C1–C5 (tài liệu 1 mục 12.1, đã thu hẹp ở tài liệu 2 mục 8):

| PR                           | Nội dung mới                                                                                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **C0** _(mới, làm TRƯỚC C1)_ | **Hiến chương đồng hành**: 8 luật ở mục 2 thành ràng buộc kiểm được trong `SupremePrincipleCompliance` đã có + test. Làm trước vì nó chi phối mọi thứ sau |
| **C6** _(mới)_               | Đường đỉnh: `TalentDomain` (12 lĩnh vực mục 5), `TalentSignal` (5 tín hiệu mục 6.1), `TalentStage` (G1–G4), **luật chuyển giao** mục 7                    |
| **C7** _(mới)_               | Vòng kèm cặp (cơ chế #1 mục 9) — dùng lại PRO-04 đã có trong bộ 30 năng lực                                                                               |

### 10.3 Ba câu hỏi cần bạn chốt

1. **C0 làm trước C1 chứ?** Tôi đề xuất **có** — 8 luật đồng hành chi phối toàn bộ giao diện và
   giọng nói của sản phẩm; làm sau sẽ phải sửa lại nhiều.
2. **Đường đỉnh mở cho mọi lứa tuổi hay chỉ trẻ em?** Tôi đề xuất **mọi lứa tuổi** — bảng mục 5 cho
   thấy 4 lĩnh vực đỉnh sau 35, và người lớn Việt Nam gần như chưa từng được ai hỏi "năng khiếu của
   anh/chị là gì".
3. **Vòng kèm cặp (C7) làm ở giai đoạn này hay để sau?** Nó là cơ chế đóng góp xã hội mạnh nhất,
   nhưng cần đủ người dùng mới chạy được. Có thể chỉ dựng contract ở C1 và bật sau.

---

## 11. Rủi ro riêng của "phát triển vượt bậc" (thêm vào 7 rủi ro ở tài liệu 1)

| #   | Rủi ro                                                 | Mức     | Xử lý                                                                                                   |
| --- | ------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------- |
| R8  | **Kiệt sức / mất tuổi thơ** vì đầu tư quá sớm quá nặng | **Cao** | Nhóm WEL là điều kiện an toàn (mục 3, luật 1); ngưỡng cứng về ngủ; phát hiện sớm dấu kiệt sức           |
| R9  | **Bản sắc một chiều** — "tôi chỉ là người chơi đàn"    | **Cao** | Bắt buộc duy trì đường nền; câu hỏi định kỳ "bạn là ai ngoài lĩnh vực này"                              |
| R10 | **Phụ huynh ép** thay vì con tự chọn                   | **Cao** | Tín hiệu #2 (tự tìm đến khi không ai ép) là **bắt buộc** để mở đường đỉnh cho trẻ; hỏi riêng ý kiến trẻ |
| R11 | **Dán nhãn sớm sai** → bỏ sót người nở muộn            | TB      | 6 luật mục 6.2; nhấn mạnh phần lớn lĩnh vực nhận diện sau 12 tuổi                                       |
| R12 | **Bỏ rơi người "không có năng khiếu"**                 | **Cao** | Đường nền là ưu tiên sản phẩm số 1; đường đỉnh không được chiếm chỗ trung tâm giao diện                 |
| R13 | **Hứa hão về kiệt xuất**                               | TB      | Mục 4.3; ngôn ngữ sản phẩm nói "đi xa nhất có thể", không nói "trở thành số một"                        |

---

## 12. Nguồn tham khảo bổ sung

- Gagné, F. _Building gifts into talents: Detailed overview of the DMGT 2.0_ — phân biệt năng
  khiếu/tài năng, hai loại xúc tác.
  https://www.researchgate.net/publication/287583969_Building_gifts_into_talents_Detailed_overview_of_the_DMGT_20
- Subotnik, R., Olszewski-Kubilius, P., & Worrell, F. _The Talent Development Megamodel_ —
  chuỗi tiềm năng → thành thạo → chuyên gia → kiệt xuất; quỹ đạo riêng theo lĩnh vực; vai trò
  quyết định của kỹ năng tâm lý xã hội.
  https://link.springer.com/chapter/10.1007/978-3-030-56869-6_24
- Subotnik, Olszewski-Kubilius & Worrell (2023). _Domain-specific abilities and characteristics:
  Evolving central components of the talent development megamodel_. _High Ability Studies_, 34(2).
  https://www.tandfonline.com/doi/full/10.1080/13598139.2022.2139666
- Deci, E. & Ryan, R. — Thuyết tự quyết (SDT): tự chủ · năng lực · kết nối. Đã hiện diện trong repo
  qua `MotivationDiagnostic` (`packages/core-domains/lifeMilestoneMasteryService.ts`).

---
