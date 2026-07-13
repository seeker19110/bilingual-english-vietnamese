# Kế hoạch & Quyết định: Bổ sung các dạng biến thể của từ vào từ điển (word forms)

> Ngày lập: 2026-07-06 · Yêu cầu: bổ sung dạng biến thể của từ (số ít/nhiều, các thì…), hiển thị
> **trong phần giải thích nghĩa của TỪ GỐC**, chất lượng sư phạm cao — áp dụng cả khi TRA TỪ ĐIỂN
> lẫn khi HỌC TỪ MỚI (flashcard/lộ trình).

## Bối cảnh

Từ điển 12.062 từ (`public/data/dictionary/chunk-*.json`) chưa có trường dạng biến thể — tra "go"
không thấy went/gone/goes/going. ~94 entry là dạng bất quy tắc có sẵn (went, mice…) nhưng chỉ ghi
chú trong nghĩa, không liên kết cấu trúc về từ gốc. Server search tra "books"/"played" ra 0 kết quả.

## Chuẩn sư phạm áp dụng (theo Oxford/Cambridge Learner's)

1. Dạng biến thể hiển thị **ngay trong entry từ gốc**, có nút phát âm từng dạng.
2. Chỉ dạng **bất quy tắc** mới có entry tra cứu riêng (trỏ về từ gốc) — **không** thêm hàng chục
   nghìn dạng quy tắc (books, played…) làm entry riêng, tránh loãng từ điển/phá SRS.
3. Dạng quy tắc xử lý ở **tầng tìm kiếm**: tra "books" → trả entry "book" kèm chú thích.
4. Không sinh dạng sai: danh từ không đếm được không hiện số nhiều; modal verb không chia; tính từ
   dài dùng "more/most" chứ không bịa "beautifuler".

## Quyết định thiết kế

- **Lưu sẵn (precompute) forms vào JSON** (không tính lúc chạy) — kiểm định offline một lần, server
  search dùng ngay, không tốn CPU client. Thêm trường `forms?: WordForms` + `base?: string` vào
  `DictEntry` (`src/types.ts`).
- **Nguồn sinh dữ liệu 3 tầng** (`scripts/gen-word-forms.ts`, script `_lib/irregularForms.ts`):
  1. Bảng bất quy tắc soạn tay (~200 động từ, ~60 danh từ, ~10 tính từ so sánh, ~150 từ không đếm được).
  2. Quy tắc chính tả thuật toán (số nhiều/V-s/V-ing/V-ed, gấp đôi phụ âm CVC…) — trường hợp không
     chắc chắn (đa âm tiết) thì **bỏ qua** thay vì đoán.
  3. Kiểm định chéo với 94 entry biến thể có sẵn trước khi ghi; không ghi đè nếu lệch.
- Phạm vi: n/v/adj/adv có dạng biến thể; các loại từ khác (prep/conj/pron…) bỏ qua.

## Các bước đã triển khai

1. Schema (`WordForms`) + script sinh forms + ≥25 test ca biên (CVC doubling, e câm, y→ies,
   uncountable, bất quy tắc).
2. Vá ~40–60 dạng bất quy tắc còn thiếu entry riêng (hid, woken, geese, leaves…) + gắn `base` cho
   toàn bộ entry biến thể.
3. UI từ điển: khối "Các dạng của từ" (`WordFormsBlock.tsx`) — chip nhãn Việt + từ + phát âm; dạng
   bất quy tắc tô màu nhấn; liên kết "→ Xem từ gốc".
4. Tìm kiếm hiểu biến thể: index dạng→từ gốc ở `api/_lib/dictionaryData.ts`, trả entry gốc lên đầu
   kết quả kèm `matchedForm`.
5. `WordFormsBlock` gắn vào mọi nơi HỌC từ mới: `WordCard`, `Flashcard`, `StudyTabs`, `WordOfTheDay`
   — dữ liệu forms đi kèm sẵn trong `DictEntry`, không cần gọi thêm API.

## Rủi ro đã lưu ý

Sinh dạng sai (đa âm tiết, -o→es) là rủi ro sư phạm cao nhất → xử lý bằng 3 tầng + validation chéo,
nghi ngờ thì bỏ qua. Phình dữ liệu chunk (+250–400KB ước tính) → đo thật, gzip đã bật. SRS tính
trùng "go"/"went" là 2 từ khác nhau — ngoài phạm vi đợt này, ghi nợ kỹ thuật (trường `base` tạo nền
để khử trùng sau).
