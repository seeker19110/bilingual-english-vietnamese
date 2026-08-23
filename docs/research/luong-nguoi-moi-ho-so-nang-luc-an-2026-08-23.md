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
