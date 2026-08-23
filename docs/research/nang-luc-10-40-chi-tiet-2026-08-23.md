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
