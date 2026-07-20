# Script: Seed trước audio phát âm từ điển

> ⚠️ Bản spec gốc (Next.js, `words.json`, biến `NEXT_PUBLIC_*`, 1 giọng, luôn upload
> Supabase Storage) đã lỗi thời — dự án cũng đã rời hẳn Supabase (Postgres tự host qua
> `pgPool`, xem `docs/migration-thoat-ly-supabase.md`). Nội dung dưới đây mô tả **script thật
> đang chạy**: `scripts/seed-pronunciations.ts`.

## Mục đích

Chạy 1 lần (hoặc mỗi khi có từ mới) để tạo trước audio cho **toàn bộ từ điển**, thay vì
để người dùng đợi TTS ở lần tra đầu tiên.

## Cách chạy

```bash
npm run seed:pronunciation
```

- Nguồn từ mặc định: toàn bộ `public/data/dictionary/chunk-*.json`.
- Đổi nguồn bằng biến `WORDS_FILE=<file.json>` hoặc `DICT_DIR=<thư mục chunk>`.
- Retry các từ lỗi:
  ```bash
  WORDS_FILE=scripts/seed-errors.json npm run seed:pronunciation
  ```

## Cách hoạt động

- Tạo **2 giọng** (`female`, `male`) cho mỗi từ — người dùng chọn giọng ở nút loa
  (`female2`/`male2` chỉ dùng cho hội thoại bài học, không seed vào bảng `pronunciations`).
- Tái dùng logic gọi TTS + lưu file từ `api/_lib/googleTts.ts` + `api/_lib/pgPool.ts`
  (không viết lại lần 2) — audio lưu qua `saveAudio()` (`api/_lib/fileStorage.ts`), tự
  chọn lưu local VPS hay Cloudflare R2 theo `STORAGE_DRIVER`.
- Bỏ qua (từ, giọng) đã có sẵn trong DB đúng `VOICE_VERSION` hiện tại → chạy lại an
  toàn, resume được nếu bị dừng giữa chừng.
- Chạy song song theo batch (`BATCH_SIZE = 15`), có retry tự động tới 5 vòng
  (`MAX_ROUNDS`) khi gặp lỗi tạm thời.
- Progress bar trong terminal; từ lỗi (sau hết vòng retry) ghi vào `scripts/seed-errors.json`.

## Lưu ý chi phí/hạn mức

- Google TTS: free tier theo ký tự/tháng — từ vựng ngắn nên tốn rất ít.
- Storage: nếu `STORAGE_DRIVER=local` (mặc định) thì audio nằm trên ổ cứng VPS; nếu
  `STORAGE_DRIVER=r2` thì tính vào hạn mức Cloudflare R2 (free tier 10GB).

## Công cụ khuyên dùng hơn: `npm run seed:all`

`scripts/seed-all.ts` gộp seed phát âm từ điển + câu ví dụ CEFR/giáo trình/hội thoại
vào 1 lệnh có báo cáo tiến độ (%) và menu chọn nhóm cần seed. Xem chi tiết:
`docs/seed-guide.md`.

```bash
npm run seed:all             # menu tương tác
npm run seed:all -- --check  # chỉ xem báo cáo, không seed
```
