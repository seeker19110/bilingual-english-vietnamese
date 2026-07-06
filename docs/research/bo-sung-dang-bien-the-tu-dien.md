# Kế hoạch: Bổ sung các dạng biến thể của từ vào từ điển (word forms)

> Ngày lập: 2026-07-06 · Nhánh: `claude/dictionary-word-expansion-hxheuf`
> Yêu cầu người dùng: bổ sung các từ liên quan đến từ trong từ điển (số ít/số nhiều,
> các thì quá khứ/hiện tại…), **hiển thị trong phần giải thích ý nghĩa của TỪ GỐC**,
> chất lượng cao theo tiêu chuẩn sư phạm. Áp dụng ở **cả hai nơi**: khi TRA TỪ ĐIỂN
> và khi HỌC TỪ MỚI trong lộ trình (flashcard) — người dùng luôn thấy đủ thông tin
> liên quan để học rõ ràng hơn.

## 1. Hiện trạng (đã khảo sát mã nguồn + dữ liệu thật)

- Từ điển: **12.062 từ** trong `public/data/dictionary/chunk-000..009.json` (nguồn sự
  thật — cả client `src/data/dictionary/loader.ts` lẫn server `api/_lib/dictionaryData.ts`
  đều đọc từ đây). `src/data/dictionary.json` cũ đã bị xoá.
- `DictEntry` (`src/types.ts`) chưa có trường nào về dạng biến thể.
- Từ gốc **không hiển thị** các dạng của nó: tra "go" không thấy went/gone/goes/going.
- ~**94 entry** là dạng bất quy tắc đã tồn tại rời rạc (went, gone, mice, feet…) — chỉ
  ghi chú trong nghĩa ("quá khứ của go"), **không có liên kết cấu trúc** về từ gốc.
- Rà 73 động từ bất quy tắc phổ biến: **thiếu 9 dạng** làm entry (hid, lain, ridden,
  rung, showed, swam, swum, woke/woken); danh từ số nhiều bất quy tắc thiếu nhiều
  (geese, leaves, halves, shelves, potatoes, tomatoes, cities, babies, analyses…).
- Server search (`api/dictionary.ts`) chưa hiểu biến thể: tra **"books"/"played" ra
  0 kết quả** (dạng quy tắc không có entry riêng — đúng, nhưng lẽ ra phải trỏ về từ gốc).

## 2. Chuẩn sư phạm áp dụng (theo từ điển học tiếng Oxford/Cambridge Learner's)

1. **Dạng biến thể hiển thị NGAY TRONG entry của từ gốc** (phần giải thích nghĩa) —
   người học thấy trọn "gia đình dạng từ" một chỗ, có nút phát âm từng dạng.
2. **Chỉ dạng BẤT QUY TẮC mới đáng có entry tra cứu riêng** (went, mice) — vai trò là
   "biển chỉ đường" trỏ về từ gốc. **KHÔNG** thêm hàng chục nghìn dạng quy tắc
   (books, played, playing…) làm entry riêng — sẽ làm loãng từ điển, phá SRS/lộ trình,
   phình dữ liệu vô ích.
3. **Dạng quy tắc xử lý ở tầng tìm kiếm**: tra "books" → trả về entry "book" (kèm chú
   thích "dạng số nhiều"). Người học gõ bất kỳ dạng nào cũng tra được.
4. **Không sinh dạng sai**: danh từ không đếm được (advice, information, furniture…)
   KHÔNG hiển thị số nhiều mà ghi "(danh từ không đếm được)"; modal verb (can, must…)
   không chia; tính từ dài dùng "more/most + adj" chứ không bịa "beautifuler".
5. **Nhãn tiếng Việt nhất quán**: số nhiều · ngôi 3 số ít (V-s) · quá khứ (V2) ·
   quá khứ phân từ (V3) · dạng V-ing · so sánh hơn · so sánh nhất. Dạng bất quy tắc
   được đánh dấu nổi bật (người học cần chú ý học thuộc).

## 3. Thiết kế dữ liệu

### 3.1. Mở rộng `DictEntry` (src/types.ts + api/\_lib/dictionaryData.ts)

```ts
export interface WordForms {
  // Danh từ
  plural?: string // 'books', 'children' — bỏ trống nếu không đếm được
  uncountable?: boolean // true → UI ghi "(không đếm được)", không hiện plural
  // Động từ
  v3s?: string // goes  (ngôi 3 số ít)
  ving?: string // going (V-ing)
  past?: string // went  (quá khứ V2)
  pastPart?: string // gone  (quá khứ phân từ V3) — chỉ lưu khi ≠ past
  // Tính từ / trạng từ
  comparative?: string // bigger — chỉ lưu khi có dạng -er/-est thật
  superlative?: string // biggest
  irregular?: boolean // true → UI đánh dấu "bất quy tắc" (màu nhấn)
}

export interface DictEntry {
  // ...các trường hiện có giữ nguyên...
  forms?: WordForms // các dạng biến thể — sinh bằng scripts/gen-word-forms.ts
  base?: string // CHỈ có ở entry là dạng biến thể (went → base: 'go')
}
```

**Quyết định: LƯU SẴN (precompute) toàn bộ forms vào JSON** thay vì tính lúc chạy.
Lý do: dữ liệu được kiểm định offline một lần (an toàn hơn áp quy tắc chính tả lúc
runtime — dễ sót ca biên), server search dùng được ngay, hiển thị không tốn CPU client.
Chi phí: ước tính +250–400KB tổng (trước gzip) chia đều 10 chunk — gzip nén tốt vì
pattern lặp; đã có bundle-size budget canh chừng, sẽ đo thật ở bước thực hiện.

### 3.2. Nguồn sinh dữ liệu — KHÔNG để AI "đoán mò"

`scripts/gen-word-forms.ts` (chạy 1 lần, chạy lại an toàn) gồm 3 tầng:

1. **Bảng bất quy tắc soạn tay** (`scripts/_lib/irregularForms.ts`):
   - ~200 động từ bất quy tắc (danh sách chuẩn giáo khoa, đủ 3 cột V1-V2-V3).
   - ~60 danh từ số nhiều bất quy tắc (man/men, leaf/leaves, criterion/criteria…).
   - ~10 tính từ so sánh bất quy tắc (good/better/best, bad/worse/worst, far…).
   - ~150 danh từ không đếm được phổ biến (advice, information, money, rice…).
   - Modal/khiếm khuyết + từ không chia (can, must, ought…) → loại trừ.
2. **Quy tắc chính tả tiếng Anh** (thuần thuật toán, có test ca biên):
   - Số nhiều/V-s: +s · s/x/z/ch/sh→+es · phụ âm+y→ies · một số -o→+es (bảng con).
   - V-ing/V-ed: bỏ e câm (make→making) · gấp đôi phụ âm CVC 1 âm tiết
     (run→running, stop→stopped) · phụ âm+y→ied · giữ y trước -ing.
   - Đa âm tiết gấp đôi phụ âm phụ thuộc TRỌNG ÂM (begin→beginning nhưng
     open→opening) → dùng bảng ngoại lệ soạn tay cho ~40 từ phổ biến; từ đa âm
     tiết không chắc chắn thì **bỏ qua forms động từ đó** (thà thiếu còn hơn sai).
   - So sánh hơn/nhất: CHỈ sinh cho tính từ 1 âm tiết + 2 âm tiết đuôi -y
     (happy→happier); còn lại không lưu (UI hiểu là "more/most + adj").
3. **Kiểm định chéo (validation) trước khi ghi**:
   - Mọi form sinh ra được đối chiếu với 94 entry biến thể có sẵn (went, mice…) —
     lệch là fail, in báo cáo, không ghi đè.
   - Không form nào trùng chính từ gốc, không chuỗi rỗng, chỉ a-z/'/-.
   - In thống kê: bao nhiêu từ có forms, bao nhiêu bất quy tắc, bao nhiêu bị bỏ qua.

> Phạm vi áp dụng: n (6.484) · v (1.979) · adj (2.515) · adv (864, chỉ dạng so sánh
> nếu có) — các loại còn lại (prep/conj/pron/art/num/interj) không chia, bỏ qua.
> Entry là cụm nhiều từ (a.m., phrasal…) và entry đã là dạng biến thể (có `base`)
> cũng bỏ qua.

## 4. Các bước thực hiện (chia nhỏ — mỗi bước 1 PR hoặc 1 commit kiểm tra được)

### Bước 1 — Nền dữ liệu: schema + script sinh forms + test

- `src/types.ts`: thêm `WordForms`, `forms?`, `base?` (đồng bộ `api/_lib/dictionaryData.ts`).
- `scripts/_lib/irregularForms.ts`: các bảng bất quy tắc soạn tay (mục 3.2).
- `scripts/gen-word-forms.ts`: sinh + kiểm định + ghi ngược vào 10 chunk JSON.
- `src/lib/wordForms.test.ts` (hoặc test cho script): ≥25 ca biên — CVC doubling,
  e câm, y→ies, -o→es, uncountable, modal loại trừ, bất quy tắc khớp bảng.
- Chạy script → commit dữ liệu chunk mới + báo cáo thống kê trong mô tả PR.

### Bước 2 — Vá dạng bất quy tắc còn thiếu + chuẩn hoá entry biến thể cũ

- Script rà: dạng bất quy tắc nào trong bảng chưa có entry riêng → sinh danh sách
  (~40–60 từ: hid, woken, geese, leaves, cities…). Soạn entry đầy đủ chất lượng
  (nghĩa Việt chuẩn "dạng quá khứ của hide", ví dụ thật, IPA, level/freq kế thừa
  từ gốc) — soạn tay/AI có rà soát, khối lượng nhỏ nên kiểm được từng từ.
- Gắn `base` cho toàn bộ entry biến thể (94 cũ + mới thêm); thống nhất câu nghĩa.

### Bước 3 — UI từ điển: khối "Các dạng của từ" trong phần nghĩa

- `Dictionary.tsx` (thẻ kết quả tra từ): dưới nghĩa tiếng Việt, thêm khối
  **"Các dạng của từ"** — mỗi dạng là chip: nhãn Việt nhỏ (số nhiều / quá khứ / V-ing /
  so sánh hơn…) + từ + nút phát âm (`PronounceButton`); dạng bất quy tắc tô màu nhấn
  kèm nhãn "bất quy tắc"; bấm chip → đổ từ đó vào ô tra cứu.
  Uncountable → dòng "(danh từ không đếm được)".
- Entry biến thể (có `base`): hiện liên kết "→ Xem từ gốc: go" bấm được.
- Song ngữ theo `direction` A/B (nhãn tiếng Việt ↔ tiếng Anh) như phần còn lại của trang.
- Tách component `WordFormsBlock.tsx` để tái dùng (bước 4).

### Bước 4 — Tìm kiếm hiểu biến thể (server)

- `api/_lib/dictionaryData.ts`: khi nạp từ điển, build **index dạng→từ gốc**
  (từ trường `forms` + `base`) — cache RAM cùng chỗ `getAllEntries()`.
- `api/dictionary.ts`: query khớp index → trả entry TỪ GỐC lên đầu kết quả kèm
  `matchedForm` để client ghi chú nhỏ ("books là dạng số nhiều của book").
- E2E/unit: tra books, played, went, children, happier đều ra từ gốc.

### Bước 5 — Forms khi HỌC TỪ MỚI trong lộ trình (yêu cầu chính thức, không tuỳ chọn)

- Hiện `WordFormsBlock` (dạng thu gọn) ở mọi chỗ người dùng HỌC từ:
  - `WordCard.tsx` — thẻ học từ của lộ trình CEFR/vòng từ vựng (mặt nghĩa của thẻ);
  - `Flashcard.tsx` — flashcard trang Từ điển;
  - `StudyTabs.tsx` — tab Hôm nay / Ôn SRS / Từ khó (dùng chung WordCard);
  - `WordOfTheDay.tsx` — thẻ "Từ vựng hôm nay".
- Nguyên tắc mobile-first: mặc định gọn 1–2 dòng chip; dạng bất quy tắc luôn hiện rõ
  (đó là phần người học dễ sai nhất); phát âm được từng dạng bằng nút loa sẵn có.
- Dữ liệu forms đi kèm sẵn trong `DictEntry` nên các màn học KHÔNG cần gọi thêm API.

## 5. Ảnh hưởng & rủi ro

| Rủi ro                                            | Mức                 | Giảm thiểu                                                                                 |
| ------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------ |
| Sinh dạng SAI (gấp đôi phụ âm đa âm tiết, -o→es…) | Cao nhất về sư phạm | 3 tầng ở mục 3.2; nghi ngờ thì bỏ qua, không đoán; validation chéo với entry có sẵn        |
| Phình dữ liệu chunk (+250–400KB)                  | Trung bình          | Đo thật sau bước 1; chỉ lưu dạng ≠ suy ra hiển nhiên nếu vượt ngân sách; gzip Nginx đã bật |
| UI quá tải thông tin trên mobile                  | Trung bình          | Khối forms gọn 1–2 dòng chip, ẩn/hiện được; mobile-first theo BO-SUNG-\*                   |
| SRS/lộ trình tính trùng (go và went là 2 "từ")    | Có sẵn từ trước     | Ngoài phạm vi đợt này; trường `base` tạo nền để khử trùng sau (ghi nợ kỹ thuật)            |
| Migration Supabase                                | Không có            | Chỉ đổi JSON tĩnh + code, không đổi schema DB                                              |

## 6. Tiêu chí nghiệm thu (Definition of Done)

- [ ] ≥95% danh từ đếm được có `plural`; 100% động từ thường dụng (freq ≤ 3000) có đủ 4 dạng; tính từ ngắn có so sánh hơn/nhất.
- [ ] 0 dạng sai trong mẫu kiểm tra tay 100 từ ngẫu nhiên phân tầng theo POS.
- [ ] Danh từ không đếm được phổ biến KHÔNG hiện plural (kiểm advice, information, furniture, money, rice).
- [ ] Tra go/child/big thấy khối "Các dạng của từ" có phát âm; tra went thấy link về go; tra books/played ra từ gốc.
- [ ] Khi HỌC từ mới (WordCard lộ trình, Flashcard, tab Hôm nay/Ôn SRS/Từ khó, Từ vựng hôm nay) đều thấy các dạng của từ ngay trên thẻ, không cần thao tác thêm.
- [ ] Cổng commit: build + typecheck + lint 0 warning + format + test xanh; bundle-size budget không vỡ.
