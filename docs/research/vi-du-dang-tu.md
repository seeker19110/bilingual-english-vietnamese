# Ví dụ cho "các dạng của từ" (word forms) — kế hoạch & quyết định

> Bổ sung câu ví dụ song ngữ cho từng **dạng biến thể** của từ trong từ điển
> (số nhiều, các thì, so sánh…). Nối tiếp tính năng word forms (PR #213/#214).

## 1. Vấn đề

Component `WordFormsBlock` mới chỉ hiện **chip từng dạng + nút phát âm** (vd `go → went`),
chưa cho người học thấy dạng đó **dùng trong câu** thế nào. Học viên dễ nhớ mặt chữ nhưng
không biết đặt câu.

## 2. Quyết định (đã chốt với người dùng)

| Vấn đề        | Lựa chọn                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------- |
| **Phạm vi**   | Dạng **bất quy tắc** + từ **CEFR A1–B2** hay gặp (không phủ 100% ~12.649 ô)               |
| **Lưu trữ**   | **File riêng, nạp lười** (`public/data/form-examples.json`) — không phình payload từ điển |
| **Cách soạn** | **Viết tay theo lô nhỏ**, chất lượng cao, mỗi dạng đúng **2 ví dụ** song ngữ              |

Lý do phủ có chọn lọc: phủ toàn bộ ~12.649 ô dạng từ × 2 câu ≈ 25.300 câu, phần lớn là dạng
"đều" ít giá trị học (goes/going/books). Ưu tiên dạng bất quy tắc + A1–B2 cho giá trị cao nhất.

## 3. Kiến trúc

- **Nguồn (soạn tay, có type):** `src/data/form-examples.ts`
  - Shape tái dùng từ `extra-examples.ts`: `Record<string, [ExPair, ExPair]>`, `ExPair = { en, vi }`.
  - **Khoá = `` `${word}|${formKey}` ``** — `word` là TỪ GỐC như trong từ điển, `formKey ∈`
    `plural | v3s | ving | past | pastPart | comparative | superlative`.
  - Mỗi câu **luôn dùng chính dạng biến thể đó** (vd `go|past` → câu chứa "went").
- **Sinh + kiểm tra:** `scripts/gen-form-examples.ts` (`npm run gen:form-examples`)
  - Ghi ra `public/data/form-examples.json`.
  - **Đối chiếu từ điển**: cảnh báo nếu `word|formKey` trỏ tới dạng KHÔNG tồn tại → chip sẽ không hiện.
- **Nạp lười:** `src/data/formExamplesLoader.ts` (giống `extraExamplesLoader.ts`).
- **Hiển thị:** `WordFormsBlock.tsx` nạp map 1 lần (cache module-level), render 2 ví dụ dưới
  dạng nào có sẵn (dùng `KaraokeText` — bấm nghe từng chữ). Dùng chung cho cả 3 nơi:
  Từ điển, `WordCard` (lộ trình), `Flashcard`.

## 4. Lưu ý quan trọng về dữ liệu từ điển

Mỗi từ trong từ điển chỉ giữ **MỘT loại từ (pos) chính**, nên chỉ đặt khoá cho dạng mà từ đó
**thực sự có**:

- `break/fight/ring/cost/hurt/shop/plan` lưu là **danh từ** → chỉ có `plural` (không có `past`).
- `watch` lưu là **động từ** → có `v3s/ving/past`, không có `plural`.
- Tính từ dài (`expensive/beautiful/important/difficult`) dùng more/most → **không** có `-er/-est`.
- Động từ có `past == pastPart` (made, found, told…) → từ điển **không lưu `pastPart` riêng**
  (chip "quá khứ" gánh luôn V3). Chỉ lưu `pastPart` khi khác `past` (go→went/gone).

→ Luôn chạy `npm run gen:form-examples` và soát cảnh báo trước khi commit.

## 5. Trạng thái (Lô 1)

- **251 ô dạng từ = 502 ví dụ**, 0 cảnh báo (mọi khoá khớp dạng thật trong từ điển).
- Phân bố: động từ bất quy tắc (past/pastPart), số nhiều bất quy tắc, so sánh bất quy tắc,
  so sánh thường A1–B2 (hơn/nhất), V-ing & quá khứ động từ thường, V-s ngôi 3, số nhiều thường.
- Test: `WordFormsBlock.test.tsx` thêm ca kiểm chứng ví dụ render (mock loader).

## 6. Lô tiếp theo (khi cần mở rộng)

- Chỉ cần **thêm khoá vào `src/data/form-examples.ts`** rồi `npm run gen:form-examples` — UI tự nhận.
- Ưu tiên tiếp theo: mở rộng số lượng theo tần suất từ (SUBTLEX) trong dải A1–B2 còn thiếu.
