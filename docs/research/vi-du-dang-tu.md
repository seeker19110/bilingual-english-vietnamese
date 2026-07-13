# Ví dụ cho "các dạng của từ" (word forms) — kế hoạch & quyết định

> Bổ sung câu ví dụ song ngữ cho từng dạng biến thể (số nhiều, thì, so sánh...). Nối tiếp
> tính năng word forms. **ĐÃ LÀM** (Lô 1 + Lô 2, xem `PROGRESS.md`).

## Quyết định đã chốt

| Vấn đề    | Lựa chọn                                                                      |
| --------- | ----------------------------------------------------------------------------- |
| Phạm vi   | Dạng **bất quy tắc** + từ CEFR A1–B2 hay gặp (không phủ 100% ~12.649 ô)       |
| Lưu trữ   | File riêng, nạp lười (`public/data/form-examples.json`) — không phình từ điển |
| Cách soạn | Viết tay theo lô nhỏ, mỗi dạng đúng **2 ví dụ** song ngữ                      |

## Kiến trúc

- Nguồn soạn tay: `src/data/form-examples.ts` — khoá `` `${word}|${formKey}` ``
  (`formKey ∈ plural|v3s|ving|past|pastPart|comparative|superlative`), mỗi câu dùng đúng dạng đó.
- Sinh + kiểm định chéo từ điển: `scripts/gen-form-examples.ts` (`npm run gen:form-examples`) →
  `public/data/form-examples.json`, cảnh báo nếu `word|formKey` trỏ dạng không tồn tại.
- Nạp lười: `src/data/formExamplesLoader.ts`. Hiển thị: `WordFormsBlock.tsx` (dùng ở Từ điển,
  `WordCard`, `Flashcard`).

**Lưu ý dữ liệu:** mỗi từ trong từ điển chỉ giữ 1 loại từ (pos) chính, nên chỉ đặt khoá cho
dạng từ đó thực sự có (vd `watch` là động từ → không có `plural`). Chạy
`npm run gen:form-examples` và soát cảnh báo trước khi commit.

## Trạng thái

- **Lô 1:** 251 ô = 502 ví dụ, 0 cảnh báo (bất quy tắc + A1-B2 hay gặp).
- **Lô 2:** +140 ô = 280 ví dụ, phủ NỐT toàn bộ dạng bất quy tắc còn thiếu trong A1-B2.
- **Tổng: 391 ô = 782 ví dụ, 0 cảnh báo — 250/250 ô bất quy tắc A1-B2 đã phủ 100%.**

## Lô tiếp theo (khi cần mở rộng)

Chỉ cần thêm khoá vào `src/data/form-examples.ts` rồi chạy lại script — UI tự nhận. Ưu tiên
tiếp theo: dạng THƯỜNG (quy tắc) theo tần suất từ (SUBTLEX) trong dải A1-B2.
