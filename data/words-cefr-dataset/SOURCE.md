# Words-CEFR-Dataset — nguồn & giấy phép

Wordlist CEFR bổ sung (MIT license) — dùng làm tầng tra cứu THỨ 2, sau CEFR-J/Octanove
(`data/cefrj/`), để phủ thêm các từ CEFR-J không có: dạng biến thể (số nhiều, quá khứ,
gerund...), từ ít phổ biến hơn, v.v.

## File

- `subset.csv` — cột `word,pos_tag,level`. Đây là **bản trích lọc** (KHÔNG phải toàn bộ dữ
  liệu gốc): chỉ giữ lại các dòng có `word` khớp với từ trong
  `public/data/dictionary/chunk-*.json` của dự án này (19.811/248.185 dòng gốc), để tránh
  commit nguyên bộ dữ liệu ~13MB (đa số không liên quan tới từ vựng của app). `pos_tag` là
  nhãn Penn Treebank gốc (NN, VB, JJ...) — xem `api/_lib/wordsCefrDataset.ts` để biết cách map
  sang pos viết tắt của dự án (n/v/adj/...). `level` là số 1-6 (1=A1...6=C2); **số nguyên =
  đối chiếu khớp CEFR-J gốc (đã spot-check: abandon/verb=3, accept/verb=2, action/noun=1,
  happy/adjective=1, record/noun=3, record/verb=2 — khớp 100% với `data/cefrj/`), số thập
  phân (vd 2.5) = suy luận/nội suy theo tần suất, độ tin cậy thấp hơn**.

## Nguồn tải (dữ liệu gốc, ĐẦY ĐỦ — chưa lọc)

https://github.com/Maximax67/Words-CEFR-Dataset (thư mục `csv/`: `words.csv`, `word_pos.csv`,
`pos_tags.csv`). Xây dựng bằng cách phân tích Google Books Ngram (1-grams) + CEFR-J + suy luận
lemma/stem (spaCy, LemmInflect) — xem README của repo gốc để biết chi tiết phương pháp.
Cùng tác giả với gói Python [`cefrpy`](https://github.com/Maximax67/cefrpy).

## Giấy phép — MIT (dùng thương mại thoải mái)

MIT License, Copyright (c) 2024 Belikov Maxim. Cho phép dùng, copy, sửa, phân phối, kể cả
thương mại — chỉ cần giữ lại thông báo bản quyền khi phân phối lại phần lớn phần mềm/dữ liệu
gốc (đã ghi ở đây).

## Trích dẫn

> Words CEFR Dataset by Maxim Belikov (Maximax67), 2024. MIT License.
> https://github.com/Maximax67/Words-CEFR-Dataset — trích lọc còn 19.811/248.185 dòng, chỉ
> giữ từ có trong từ điển của dự án này.

## Cách tạo lại bản trích lọc (khi từ điển dự án có thêm từ mới)

1. Tải 3 file gốc:
   ```
   curl -sSL https://raw.githubusercontent.com/Maximax67/Words-CEFR-Dataset/main/csv/words.csv -o /tmp/words.csv
   curl -sSL https://raw.githubusercontent.com/Maximax67/Words-CEFR-Dataset/main/csv/word_pos.csv -o /tmp/word_pos.csv
   curl -sSL https://raw.githubusercontent.com/Maximax67/Words-CEFR-Dataset/main/csv/pos_tags.csv -o /tmp/pos_tags.csv
   ```
2. Chạy `WORDS_CEFR_RAW_DIR=/tmp npm run extract:words-cefr` (xem
   `scripts/extract-words-cefr-subset.ts`) — đọc 3 file trên + toàn bộ
   `public/data/dictionary/chunk-*.json`, ghi lại `data/words-cefr-dataset/subset.csv`.
