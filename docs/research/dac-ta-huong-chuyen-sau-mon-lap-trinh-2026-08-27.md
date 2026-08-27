# Đặc tả: 12 HƯỚNG CHUYÊN SÂU của môn Lập trình (2026-08-27)

> Nguồn thi hành: `packages/subject-programming/specializations/`.
> Đọc kèm: `docs/research/dac-ta-mon-lap-trinh-2026-08-24.md` (thang P1–P6, xương sống) và
> `docs/research/dac-ta-du-an-xuyen-suot-mon-lap-trinh-2026-08-24.md` (mô hình 2 làn).

## 1. Vấn đề

Môn Lập trình hiện có xương sống P1→P5 và một bậc P6 "Chuyên sâu" chỉ gồm 4 dòng mô tả
(`curriculum.ts`). Người học đi hết P5 sẽ hỏi đúng một câu mà app chưa trả lời được: **"giờ tôi
đi đâu tiếp?"**

P1–P5 dạy được "lập trình được". Nhưng **"chuyên gia" thì không có đường chung**: người làm web
app, người làm nhúng, người làm nhân hệ điều hành đi ba con đường khác hẳn nhau — khác ngôn ngữ,
khác công cụ, khác cả tiêu chuẩn "thế nào là giỏi". Gộp chúng vào một bậc là nói dối người học.

## 2. Quyết định

Thêm **tầng HƯỚNG CHUYÊN SÂU** song song với xương sống, gồm **13 hướng** — 11 hướng sản
phẩm (chọn MỘT) và 2 hướng nền cắt ngang (học song song):

| #   | Hướng                          | Mã         | Vào từ bậc | Thời lượng  |
| --- | ------------------------------ | ---------- | ---------- | ----------- |
| 1   | Lập trình Web                  | `web`      | P4         | 9–14 tháng  |
| 2   | Ứng dụng di động               | `mobile`   | P4         | 9–14 tháng  |
| 3   | Backend & Hệ phân tán          | `backend`  | P4         | 10–16 tháng |
| 4   | Dữ liệu & Phân tích            | `data`     | P3         | 9–14 tháng  |
| 5   | Trí tuệ nhân tạo & Học máy     | `ai`       | P4         | 12–18 tháng |
| 6   | DevOps, Cloud & SRE            | `devops`   | P4         | 9–14 tháng  |
| 7   | An toàn thông tin              | `security` | P5         | 12–18 tháng |
| 8   | Lập trình hệ thống             | `systems`  | P5         | 12–18 tháng |
| 9   | Lập trình Game                 | `game`     | P4         | 10–16 tháng |
| 10  | Nhúng & IoT                    | `embedded` | P4         | 10–16 tháng |
| 11  | Ứng dụng Desktop & Công cụ     | `desktop`  | P4         | 8–12 tháng  |
| 12  | Thuật toán & Giải quyết vấn đề | `algo`     | P3         | 6–12 tháng  |

### 2.1. Khuôn chung — mọi hướng giống hệt nhau về CẤU TRÚC

Cấu trúc đồng nhất là điều kiện để so sánh được các hướng với nhau và để test kiểm được khuôn
dạng thay vì kiểm từng chữ:

- **Đúng 4 chặng** `S1` (căn bản) → `S2` (vững tay) → `S3` (nâng cao) → `S4` (chuyên gia).
- Mỗi chặng: `canDo` đo được, thời lượng, **3–5 module** kiến thức, và **1 dự án** có tiêu chí
  chấp nhận đo được.
- Mỗi hướng còn có: **capstone** (sản phẩm tốt nghiệp hướng), `expertSignals` (dấu hiệu chuyên
  gia), `careers`, `pitfalls`, `resources`.
- **Bản đồ kiến trúc bắt buộc** (`architecture`, xem §2.4) — 5 ô: module · hợp đồng · quyết định
  phải chốt sớm · NFR · checklist đặc tả.
- Tổng: **5 sản phẩm phải nộp mỗi hướng** (4 dự án chặng + capstone) — nghĩa là **65 dự án** cho
  toàn bộ 13 hướng (52 chặng, 211 module học, 263 mục kiến trúc).

### 2.2. Ba luật nội dung

1. **Dự án là đơn vị hoàn thành, không phải bài học.** Chặng chỉ tính là xong khi có sản phẩm
   đạt đủ tiêu chí chấp nhận. Tiêu chí phải đo được ("giữ ≥ 60 FPS trên máy mục tiêu"), không
   được là cảm tính ("làm game mượt").
2. **`expertSignals` là HÀNH VI quan sát được, không phải số năm kinh nghiệm.** Đây là hệ quả
   trực tiếp của luật trong `dac-ta-nang-luc-ca-nhan-theo-do-tuoi-2026-08-23.md`: thang đo là
   bậc thành thạo, không phải thâm niên.
3. **Không hướng nào "xịn hơn" hướng nào.** Không có xếp hạng, không có nhãn "hot". Mỗi hướng
   nói rõ _hợp với ai_ và _không hợp với ai_ để người học tự chọn có thông tin — đúng luật số 1
   của sản phẩm: đây là công cụ chọn việc, không phải bảng chấm điểm con người.

### 2.4. Lát cắt KIẾN TRÚC — bắt buộc ở mọi hướng (bổ sung 2026-08-27)

**Lý do bổ sung (người dùng nêu):** phần lớn việc về sau là _đặc tả kiến trúc cho AI code_, chứ
không phải tự gõ từng dòng. Bản đầu của tầng này chỉ có "học gì" và "làm dự án gì" — thiếu đúng
thứ người đặc tả cần. Bốn lỗ hổng cụ thể khi đặc tả thiếu kiến trúc:

| Thiếu                          | Hệ quả khi giao cho AI/người khác thi hành      |
| ------------------------------ | ----------------------------------------------- |
| Ranh giới module               | Bên thi hành tự bịa cấu trúc, mỗi lượt một kiểu |
| Hợp đồng giữa module           | Hai phần viết xong không ghép được              |
| Yêu cầu phi chức năng (NFR)    | Code chạy được nhưng chậm / không an toàn       |
| Tiêu chí nghiệm thu + bất biến | Không có cách chứng minh bên thi hành làm đúng  |

Vì vậy **mọi hướng** phải khai đủ `SpecArchitecture` (5 ô, `types.ts`):

1. **`modules`** — module điển hình của hệ thống trong hướng đó, mỗi module ghi **trách nhiệm duy
   nhất** _và_ việc nó **không được làm**. Test canh: `role` phải > 25 ký tự để loại ô chỉ chép
   lại tên module.
2. **`contracts`** — cái gì đi qua ranh giới và ràng buộc phải giữ (schema, tiến hoá không phá,
   idempotency, mã lỗi).
3. **`keyDecisions`** — quyết định phải chốt SỚM vì đổi về sau rất đắt, kèm đánh đổi. Chốt xong
   ghi thành ADR có nêu **phương án bị loại** — nếu không, phiên sau sẽ đề xuất lại đúng nó.
4. **`nfrs`** — yêu cầu phi chức năng đặc trưng, viết thành **số**. NFR không đo được là NFR
   không tồn tại.
5. **`specChecklist`** — thứ phải viết rõ trong đặc tả thì bên thi hành mới làm đúng ngay lượt
   đầu.

### 2.5. Hướng `architecture` — sáu ô bắt buộc của một đặc tả kín

Hướng thứ 13 dạy chính kỹ năng này. Khuôn **đặc tả kín** mà nó dùng (chặng S3):

1. **Phạm vi** — làm gì _và KHÔNG làm gì_ (ô "không làm" quan trọng ngang ô "làm").
2. **Điểm chạm** — đường dẫn file cụ thể, không nói chung chung "sửa phần backend".
3. **Hợp đồng** — kiểu dữ liệu vào/ra viết hẳn ra, kèm ca lỗi.
4. **Tiêu chí chấp nhận** — đo được, kèm lệnh chạy để chứng minh.
5. **Bất biến** không được phá + test nào canh nó.
6. **Quy ước dự án** liên quan — bên thi hành không thấy được hội thoại trước đó.

Bốn chặng của hướng: **S1 ranh giới & module** → **S2 hợp đồng & mô hình miền** → **S3 đặc tả
thi hành được & nghiệm thu code mình không tự gõ** → **S4 tiến hoá kiến trúc và dẫn dắt nhiều
bên thi hành**. Điều kiện vào là **P4, cố ý không mở sớm hơn**: chưa tự tay làm hỏng thứ gì thì
đặc tả chỉ là chữ đẹp (có test canh điều kiện này).

### 2.3. Điều kiện đầu vào và thứ tự

- `prerequisite` là bậc xương sống tối thiểu. Hai hướng vào sớm nhất từ P3: **dữ liệu** (chỉ cần
  SQL + Python) và **thuật toán** (chỉ cần cấu trúc dữ liệu nền).
- **`algo` là hướng BỔ TRỢ, học song song, không thay thế một hướng sản phẩm.** Ghi rõ trong
  `forWho` và trong hướng dẫn chọn ở trang danh sách.
- Khuyến nghị: đi một hướng chính tới hết S3 rồi mới mở hướng thứ hai.

## 3. Điểm chạm code

| Thành phần           | Đường dẫn                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| Kiểu dữ liệu         | `packages/subject-programming/specializations/types.ts`                                                   |
| 12 file nội dung     | `packages/subject-programming/specializations/<mã>.ts`                                                    |
| Sổ đăng ký + hàm tra | `packages/subject-programming/specializations/registry.ts`                                                |
| Test bất biến        | `packages/subject-programming/specializations.test.ts`                                                    |
| Trang danh sách      | `apps/dhcb/src/pages/subjects/programming/ProgrammingSpecializations.tsx` — `/lap-trinh/huong`            |
| Trang chi tiết       | `apps/dhcb/src/pages/subjects/programming/ProgrammingSpecializationPage.tsx` — `/lap-trinh/huong/:specId` |
| Lối vào              | Khối ⑥ trong `ProgrammingHome.tsx`                                                                        |

**Tên file KHÔNG được là `index.ts`.** Rollup đặt tên chunk theo tên file, nên `index.ts` sinh ra
`dist/js/index-*.js` — trùng glob `"Initial JS"` của `.size-limit.json` và làm ngân sách bundle
đội thêm ~27 kB dù dữ liệu chỉ nạp ở route lười. Đây là lỗi đã dính thật trong đợt này, đổi tên
thành `registry.ts` là hết.

## 4. Tiêu chí chấp nhận

- [x] 13 hướng, id duy nhất, mỗi hướng đúng 4 chặng theo thứ tự S1→S4.
- [x] **Mọi hướng có đủ 5 ô kiến trúc** (≥4 module, ≥3 hợp đồng/quyết định/NFR/checklist); mỗi
      module nêu trách nhiệm thật, không chỉ chép lại tên.
- [x] Hai hướng nền tách nhóm đúng; `productSpecializations()` + `crossCuttingSpecializations()`
      luôn phủ kín danh sách, không chồng lấn.
- [x] Id module duy nhất toàn bộ và đúng tiền tố chặng; không ô văn bản nào rỗng.
- [x] Mọi chặng có dự án ≥ 2 tiêu chí chấp nhận; capstone ≥ 3 tiêu chí.
- [x] `getSpecialization` / `getSpecStage` trả `undefined` với mã lạ — **không đoán bừa**.
- [x] Ba route mới qua cả hai cổng a11y (A/AA và AAA) trên 5 theme.
- [x] Ngân sách bundle không đội: 124,35 kB / 140 kB (baseline trước đợt: 124,08 kB).

## 4.1. Khuôn dùng được ngay trong repo

Sáu ô của §2.5 đã thành file điền được, không phải đọc lại đặc tả rồi tự nhớ:

- `docs/templates/dac-ta-tinh-nang.md` — khuôn đặc tả giao việc (6 ô + ô nghiệm thu).
- `docs/templates/adr.md` — khuôn ADR, có ô **"vì sao loại các phương án kia"** và ô **"điều kiện
  xem lại"** (hai ô hay bị bỏ nhất, và là hai ô khiến ADR còn giá trị sau vài tháng).

## 5. Việc còn để ngỏ (cố ý)

1. ~~**Chưa có bài học 8 bước cho các hướng.**~~ Hai đợt bổ sung trong cùng ngày 2026-08-27,
   **hai tầng khác nhau, không đè nhau**:
   - **Bài học 8 bước** — chặng `web-s1` (7 bài, `p6-u16…u18`) và `architecture-s1`
     (6 bài, `p6-u19…u21`). Hai luật rút ra, áp cho mọi chặng sau: mã unit của nội dung hướng
     **bắt đầu từ `p6-u16`** (dải `p6-u5…u15` thuộc CHƯƠNG TRÌNH M, mã unit là khoá tiến độ
     Postgres nên không được lấn); chặng nào đã có bài phải khai vào
     `specializations/stageUnits.ts` thì giao diện mới hiện lối "Vào học" — cổng
     `stageUnits.test.ts` kiểm chéo.
   - **Chi tiết chặng (đợt 0179)** — **S2 của cả 13 hướng**: mỗi module có mục tiêu · bài luyện
     tay · câu tự kiểm · dấu hiệu đã nắm; mỗi chặng có rubric nghiệm thu (kèm cách chứng minh)
     và **đặc tả mẫu 6 ô** theo §2.5. Dữ liệu `specializations/details/<hướng>-s2.ts` + sổ đăng
     ký `stageDetails.ts`; trang `/lap-trinh/huong/:specId/:stageId`.
     **Cố ý KHÔNG làm bài học 8 bước cho cả 13 hướng**: 9/13 hướng không có bộ chạy trong trình
     duyệt, ép khuôn Predict/Parsons/Make lên chúng sẽ đẻ ra nội dung giả — tầng này là bản đồ
     và nghiệm thu, chấm code tự động vẫn thuộc xương sống P1–P5.
     Còn lại: chi tiết cho S1/S3/S4 và bài học cho các chặng khác — khuôn đã sẵn ở cả hai tầng.
2. ~~**Chưa lưu tiến độ hướng xuống Postgres.**~~ **[Xong 2026-08-27]** Hai mức, bổ sung cho nhau:
   **mức CHẶNG** — bảng `programming.spec_enrollment` + `spec_stage_progress` (migration `0071`,
   endpoint `/api/programming/specialization`): đang theo hướng nào, chặng nào đã xong.
   **Mức MỤC trong chặng (đợt 0179)** — từng module và từng tiêu chí rubric đánh dấu được qua
   `/api/programming/progress` với khoá `web-s2-m1` / `web-s2-r3`, dùng chung bảng
   `programming.lesson_progress`, không cần migration.
   Ghi chú cũ giữ lại: id chặng và
   id module đã đặt ổn định từ bây giờ để làm khoá tiến độ sau này không phải di trú.
3. **Chưa có gợi ý hướng theo hồ sơ người học.** Cố ý: gợi ý sai còn tệ hơn không gợi ý. Muốn làm
   thì phải bám `dac-ta-nang-luc-ca-nhan-theo-do-tuoi-2026-08-23.md` và tuyệt đối không hiện con
   số năng lực lên giao diện.
