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

Thêm **tầng HƯỚNG CHUYÊN SÂU** song song với xương sống, gồm **12 hướng**:

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
- Tổng: **5 sản phẩm phải nộp mỗi hướng** (4 dự án chặng + capstone) — nghĩa là 60 dự án cho
  toàn bộ 12 hướng.

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

- [x] 12 hướng, id duy nhất, mỗi hướng đúng 4 chặng theo thứ tự S1→S4.
- [x] Id module duy nhất toàn bộ và đúng tiền tố chặng; không ô văn bản nào rỗng.
- [x] Mọi chặng có dự án ≥ 2 tiêu chí chấp nhận; capstone ≥ 3 tiêu chí.
- [x] `getSpecialization` / `getSpecStage` trả `undefined` với mã lạ — **không đoán bừa**.
- [x] Hai trang mới qua cả hai cổng a11y (A/AA và AAA) trên 5 theme.
- [x] Ngân sách bundle không đội: 124,35 kB / 140 kB (baseline trước đợt: 124,08 kB).

## 5. Việc còn để ngỏ (cố ý)

1. **Chưa có bài học 8 bước cho các hướng.** Tầng này là _bản đồ_ (module + dự án + tiêu chí),
   chưa phải nội dung dạy từng bài như P1–P5. Soạn bài cho một hướng là một đợt việc riêng, nên
   bắt đầu từ `web` vì nó dùng lại được hạ tầng `htmlPrelude`/`domPrelude`/`fetchPrelude` sẵn có.
2. **Chưa lưu tiến độ hướng xuống Postgres.** Khi soạn bài thật mới cần bảng tiến độ; id chặng và
   id module đã đặt ổn định từ bây giờ để làm khoá tiến độ sau này không phải di trú.
3. **Chưa có gợi ý hướng theo hồ sơ người học.** Cố ý: gợi ý sai còn tệ hơn không gợi ý. Muốn làm
   thì phải bám `dac-ta-nang-luc-ca-nhan-theo-do-tuoi-2026-08-23.md` và tuyệt đối không hiện con
   số năng lực lên giao diện.
