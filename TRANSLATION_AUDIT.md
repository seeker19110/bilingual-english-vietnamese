# Báo cáo Audit Bản dịch & Đồng bộ Từ vựng

> Ngày: 2026-06-27
> Phạm vi: toàn bộ dữ liệu song ngữ Anh–Việt của ứng dụng
> (từ điển 10.000 mục + từ vựng/câu ở mọi trang khác)

---

## 1. Mục tiêu

1. **Audit toàn bộ bản dịch**, chỉnh sửa cho đúng.
2. **Từ vựng ở các trang khác lấy trong từ điển**; từ nào từ điển chưa có thì
   bổ sung vào theo đúng logic & cấu trúc của từ điển (giữ nghĩa theo ngữ cảnh).

---

## 2. Phương pháp audit

Vì lượng dữ liệu rất lớn (10.000 mục từ điển + **125.878** cặp câu song ngữ ở các
file khác), audit kết hợp 3 lớp:

1. **Kiểm tra tự động toàn bộ** (script `scripts`/scratchpad): quét MỌI mục/cặp để
   bắt các loại lỗi máy phát hiện được:
   - nghĩa tiếng Việt trống / trùng tiếng Anh / không có ký tự tiếng Việt
   - ví dụ tiếng Anh không chứa từ chính
   - nghĩa/ví dụ trùng lặp bất thường, dài/ngắn lệch nhau
   - nghĩa còn lẫn tiếng Anh, phiên âm sai định dạng
2. **Rà tay các mục bị gắn cờ** — đọc từng mục nghi ngờ để xác nhận đúng/sai.
3. **Đọc mẫu trải đều** ~185 mục từ điển dải khắp A→Z để soi lỗi NGỮ NGHĨA mà
   máy không bắt được (nghĩa sai nhưng trông hợp lệ).

---

## 3. Kết quả audit bản dịch

### 3.1. Từ điển (nay 10.007 mục) — **chất lượng tốt**

- Không có mục trống, không trùng từ.
- Các cờ tự động gần như đều là **báo nhầm**:
  - nghĩa tiếng Việt không dấu (vd `mua`, `tin`, `con ong`, `cao`) → **đúng**;
  - ví dụ "thiếu từ" do động từ chia thì (`cling → clung`) hoặc từ ghép gạch nối → **đúng**;
  - nhiều từ cùng nghĩa (`begin/start/starting` → "bắt đầu") → **đúng** (đồng nghĩa).
- **Sửa thật: 1 mục** — `efficiently`: "một cách hiệu suất, hiệu quả" →
  **"một cách hiệu quả"** (bỏ cụm gượng "một cách hiệu suất").

### 3.2. Câu song ngữ ở các trang khác (125.878 cặp) — **sạch**

Gồm: hội thoại (`dialogues`), bài học (`lessons`), mẫu câu (`patterns`),
ví dụ mở rộng (`extra-examples`), giáo trình CEFR (`cefr`), câu thông dụng (`curriculum`).

- Không phát hiện cặp dịch sai.
- Các cờ đều là báo nhầm hợp lệ: ghi chú ngữ pháp tiếng Việt có lẫn thuật ngữ tiếng Anh
  (`am/is/are`, `who/that`…), **tên riêng** giữ nguyên (Lan, Tom, David…), bài **đánh vần**
  (`S-C-H-O-O-L`, `A, E, I, O, U`).

---

## 4. Đồng bộ từ vựng với từ điển (giữ ngữ cảnh)

Đối chiếu **645 từ** trong 34 vòng từ vựng nền tảng (`src/data/curriculum.ts`)
với từ điển: **613/645 đã có** trong từ điển (nay 620/645 sau khi bổ sung).

### 4.1. Bổ sung 7 từ còn thiếu vào từ điển

Thêm theo đúng cấu trúc `DictEntry` (vi, pos, ex_en, ex_vi, ipa_en, ipa_vi),
chèn theo thứ tự ABC: **avocado, endangered, glasses, quarterly, recycle,
watermelon, windy**.

> _24 "mục" còn lại chỉ là chữ cái B–Z trong vòng "Bảng chữ cái" — không phải từ
> vựng nên không đưa vào từ điển._

### 4.2. `café` → `cafe`

Từ điển đã có `cafe`; đổi vòng nền tảng dùng `cafe` cho khớp (tránh trùng lặp).

### 4.3. Làm giàu phiên âm từ từ điển

**621 từ** vựng nền tảng nay được gắn `ipa_en` **lấy trực tiếp từ từ điển**, nên
trang Học theo lộ trình / Lộ trình CEFR hiển thị phiên âm THỐNG NHẤT với trang Từ điển.

- **Giữ ngữ cảnh:** nghĩa tiếng Việt theo từng vòng được giữ nguyên (vd `orange` =
  "màu cam" trong vòng Màu sắc, không lấy "quả cam" của từ điển; `patient` = "bệnh nhân"
  trong vòng Y tế; `May` = "tháng Năm" trong vòng Tháng).
- Không sao chép `ipa_vi` (vì nghĩa tiếng Việt theo ngữ cảnh có thể khác từ điển →
  phiên âm tiếng Việt sẽ không khớp).

### 4.4. Công cụ duy trì đồng bộ

Thêm `scripts/gen-curriculum-json.ts`: sinh `public/data/curriculum.json` từ nguồn
`src/data/curriculum.ts` và tự làm giàu `ipa_en` từ từ điển.
Chạy lại khi sửa từ vựng: `npx tsx scripts/gen-curriculum-json.ts`.

---

## 5. Vấn đề hệ thống cần QUYẾT ĐỊNH: `ipa_vi` chỉ có 1 âm tiết

`ipa_vi` (phiên âm tiếng Việt của _nghĩa_) hiện **chỉ chứa âm tiết ĐẦU** của nghĩa
nhiều chữ — vd "ability" nghĩa "khả năng" nhưng `ipa_vi` = `/xaː˧˩˧/` (chỉ "khả").
Có **9.468/10.007** mục như vậy, và trường này **được hiển thị** ở trang Từ điển
(`Dictionary.tsx`) nên gây hiểu nhầm.

> Đây là vấn đề **phiên âm**, không phải bản dịch, nên chưa tự ý sửa hàng loạt.

**Gợi ý xử lý (chọn 1):**

- **(a) Ẩn `ipa_vi`** ở trang Từ điển — đơn giản, hết gây nhầm (phiên âm tiếng Việt
  ít giá trị với người Việt học tiếng Anh — chiều A).
- (b) Tạo lại `ipa_vi` đầy đủ cho cả nghĩa nhiều âm tiết — cần bộ chuyển chữ→IPA
  tiếng Việt đáng tin cậy, rủi ro sai cao nếu làm ẩu.
- (c) Giữ nguyên.

---

## 6. Cách chạy lại / xác minh

```bash
npm install                              # cài phụ thuộc
npx tsx scripts/gen-curriculum-json.ts   # đồng bộ từ vựng nền tảng ← từ điển
node scripts/gen-data-manifest.mjs       # cập nhật manifest dữ liệu
npm run lint && npx tsc --noEmit && npm test
npm run build                            # build production (đã chạy OK)
```
