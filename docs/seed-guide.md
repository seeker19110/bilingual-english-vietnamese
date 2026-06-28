# Hướng dẫn seed audio (`seed:all`) — báo cáo, remap, verify

Script: `scripts/seed-all.ts` · Lệnh: `npm run seed:all`

Mục tiêu: tạo sẵn (cache) audio **phát âm từ điển** + **TTS câu** lên Supabase
(bảng `pronunciations` và `tts_cache` + Storage) để client phát ngay, **không phải
gọi Google TTS realtime** → nhanh + rẻ.

> File này dành cho người mới: giải thích từng lệnh và cách đọc số liệu. Nếu chỉ
> cần chạy nhanh: `npm run seed:all -- --check` (xem báo cáo) →
> `npm run seed:all -- --all` (seed hết) → `npm run seed:verify` (kiểm tra).

---

## 1. Các lệnh

| Lệnh | Làm gì |
|---|---|
| `npm run seed:all` | Menu tương tác: in báo cáo → chọn nhóm để seed (lặp tới khi thoát). |
| `npm run seed:all -- --check` | **Chỉ in báo cáo** tiến độ rồi thoát (không seed, không menu). |
| `npm run seed:all -- --all` | Seed **tất cả** nhóm còn thiếu, không hỏi (dùng cho CI/cron). |
| `npm run seed:verify` | = `seed:all -- --verify`. **Kiểm tra kỹ** DB (đối chiếu 2 chiều). |
| `npm run seed:all -- --force` | Tạo lại + **ghi đè** cả audio đã có. |

Biến môi trường thêm:

- `LIMIT=20` — giới hạn số tác vụ mỗi nhóm (debug nhanh).
- `VERIFY_DECRYPT=20` — (kèm `--verify`) tải + **giải mã thử** 20 file để chắc dùng được.
- `WORDS_FILE=scripts/seed-errors.json` — chỉ seed lại danh sách từ trong file (retry lỗi).
- `BASE_URL=...` — host để ghép `audio_url` khi lưu Storage (mặc định lấy từ `.env`).

Bắt buộc có trong `.env`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`GOOGLE_TTS_API_KEY`, `TTS_ENCRYPTION_MASTER_KEY`.

---

## 2. Đọc báo cáo tiến độ

```
📊 BÁO CÁO TIẾN ĐỘ SEED (sẵn sàng cho client)
  ⏳ Phát âm từ điển (pronunciations)            20012/20014  ▓▓▓▓▓▓▓▓▓▓ 100.0%
  ⏳ Câu + ví dụ giáo trình nền tảng (/learn)      1747/2772  ▓▓▓▓▓▓░░░░  63.0%
  ...
  📦 TỔNG CỘNG                                 142238/422447  ▓▓▓░░░░░░░  33.7%
```

- Mỗi dòng = 1 **nhóm**, số `done/total` = đã seed / cần seed (theo tập **kỳ vọng**
  dựng từ dữ liệu tĩnh trong repo, nên `total` cố định).
- 6 nhóm theo thứ tự ưu tiên client cần (seed dở vẫn có sẵn cái hay dùng nhất trước):
  `pron` → `curriculum` → `cefr` → `lessons-early` (50 bài đầu) → `patterns` (Cụm từ)
  → `lessons-rest`.

> ⚠️ **Lưu ý "số liệu nhảy loạn xạ" (ĐÃ SỬA):** trước đây hàm đọc DB phân trang
> 1000 dòng/lần bằng `.range()` **mà không `ORDER BY`**. Postgres không đảm bảo thứ
> tự dòng giữa các trang → với `tts_cache` hàng trăm nghìn dòng, các trang chồng/lọt
> dòng ngẫu nhiên → mỗi lần chạy ra số khác nhau. Nay đã **luôn sắp xếp theo khóa
> duy nhất** (`tts_cache`→`hash`, `pronunciations`→`word,voice`) nên số liệu **ổn
> định, chạy lại y hệt** (xem `fetchAllRows` trong `scripts/seed-all.ts`).

Dòng đầu khi audit: `xong (27330 phát âm, 301227 câu TTS)` = **tổng số dòng thật**
trong DB. Con số này có thể **lớn hơn** `done` của báo cáo vì DB còn chứa **bản ghi
thừa (orphan)** không nằm trong tập kỳ vọng (xem mục 4) — đây là chuyện bình thường,
không phải lỗi.

---

## 3. Remap — chuyển cache cũ sang khóa mới, KHÔNG tốn quota API

### Vì sao có remap
Khóa cache 1 câu = `hash(text + lang + voice + VOICE_VERSION)` (32 hex đầu của SHA-256).
Khi đổi giọng TTS, ta tăng `VOICE_VERSION` (hiện là `chirp3hd-v2`, ở
`api/_lib/googleTts.ts`) → **hash đổi** → mọi câu đã seed trước đó không còn khớp.

Nhưng audio cũ vẫn nằm trên Storage, chỉ là **đã mã hóa bằng khóa suy từ hash cũ**.
Tạo lại bằng cách gọi Google TTS sẽ **tốn quota**. Remap tránh điều đó.

### Remap chạy thế nào
Trong `processTask` (`scripts/seed-all.ts`), với mỗi câu chưa có ở hash mới, **trước
khi gọi Google** script thử:

1. Tìm bản ghi ở **hash cũ** = `hash(text + lang + voice)` (thiếu `VOICE_VERSION`).
2. Nếu có → **tải audio cũ → giải mã bằng hash cũ → mã hóa lại bằng hash mới → upload**
   → ghi dòng `tts_cache` mới.
3. Chỉ tốn **băng thông Storage**, **0 quota Google**. Đếm vào cột `↺ remapped`.
4. Remap lỗi (file hỏng/mạng) → tự chuyển sang gọi Google tạo mới (`✓ ok`).

### Cách kích hoạt remap
**Không có lệnh riêng** — cứ seed bình thường:

```bash
npm run seed:all -- --all      # gặp câu nào remap được, tự remap; còn lại generate mới
```

Cuối mỗi vòng có thống kê: `✓ OK (gọi Google)  ↺ Remap (tái mã hóa)  ⏭ Skip (đã có)  ✗ Lỗi`.
Nếu thấy `↺ Remap` lớn nghĩa là đang tận dụng lại audio cũ — đỡ tốn tiền.

> `--force` sẽ **bỏ qua** cả skip lẫn remap và **gọi Google tạo lại tất cả** (tốn quota).
> Chỉ dùng khi thật sự muốn làm mới audio.

---

## 4. Verify — kiểm tra kỹ DB (đối chiếu 2 chiều)

```bash
npm run seed:verify                  # hoặc: npm run seed:all -- --verify
VERIFY_DECRYPT=20 npm run seed:verify  # thêm: tải + giải mã thử 20 file

# ⚠️ STORAGE_DRIVER=local: audio_url hay là đường dẫn TƯƠNG ĐỐI (/uploads/...).
# Node fetch không nhận URL tương đối → phải cho base, nếu không giải mã thử fail HẾT:
VERIFY_DECRYPT=20 VERIFY_BASE_URL=https://en-vi.donghanhcungban.com npm run seed:verify
```

Khác báo cáo thường (chỉ đếm thiếu), verify đối chiếu **HAI CHIỀU** + kiểm đường dẫn:

1. **Chiều THIẾU** (theo nhóm): câu kỳ vọng nào **chưa có** trong DB.
   `✅` đủ · `⚠️` còn thiếu.
2. **Chiều THỪA — orphan**: bản ghi `tts_cache` **có trong DB nhưng không còn kỳ vọng**,
   gom theo `lang/voice`. Thường là:
   - giọng `female2`/`male2` đã bỏ ở curriculum/CEFR/Cụm từ (giờ chỉ seed `female`/`male`), hoặc
   - audio của `VOICE_VERSION` **cũ** còn sót.

   Orphan **vô hại** (chỉ tốn ít dung lượng, không bao giờ bị phát). Muốn dọn sạch:
   chạy `supabase/refresh-tts-voices.sql` trong SQL Editor (xóa dòng cache cũ) rồi seed lại.
3. **Nhất quán đường dẫn**: `audio_url` phải chứa đúng `${lang}/${voice}/${hash}.mp3`.
4. **Giải mã thử** (khi đặt `VERIFY_DECRYPT=N`): tải N file + giải mã bằng khóa suy từ
   hash để chắc audio **dùng được thật**, không chỉ tồn tại dòng DB. Khi fail, in
   **lý do gom nhóm** + vài mẫu để biết hỏng ở khâu nào:
   - `URL_TƯƠNG_ĐỐI` / `Failed to parse URL` → `audio_url` tương đối (local mode) mà
     chưa cho base → **đặt `VERIFY_BASE_URL=https://...`** rồi chạy lại (đây là lỗi của
     phép thử, KHÔNG phải audio hỏng — trình duyệt vẫn phát được vì tự resolve theo origin).
   - `HTTP_4xx/5xx` → file chưa có trên Storage/Nginx (đường dẫn lỗi hoặc chưa upload).
   - `OperationError` → giải mã thất bại thật: sai `TTS_ENCRYPTION_MASTER_KEY` (khác lúc
     mã hóa) hoặc file ciphertext hỏng.
   - `BODY_NGẮN_*` → tải về quá ngắn (thường là trang lỗi HTML, không phải audio).

Kết luận cuối:
- `✅ DB KHỚP tập kỳ vọng` — mọi câu cần thiết đã có, đường dẫn đúng (có thể còn orphan để dọn).
- `⚠️ Chưa khớp: thiếu N câu...` — chạy `npm run seed:all -- --all` để bù.

---

## 5. Đồng bộ audio Supabase → VPS (`sync:storage`)

VPS chạy `STORAGE_DRIVER=local` (Nginx phục vụ `/uploads/`), nhưng nhiều file đã được
seed lên **Supabase Storage** trước đó (riêng bảng `pronunciations` seed luôn đẩy thẳng
lên Supabase). Script `scripts/sync-storage-to-vps.ts` **tải xuống** các file đó về
`UPLOADS_DIR` của VPS — **chỉ file nào chưa có ở local**.

```bash
# CHẠY TRÊN VPS (nơi có UPLOADS_DIR) — quy trình 2 bước:

# Bước 1 — TẢI FILE về local
npm run sync:storage -- --dry-run     # xem trước: còn thiếu local bao nhiêu, KHÔNG tải
npm run sync:storage                  # tải thật các file còn thiếu về /uploads
npm run sync:storage -- --force       # tải lại + ghi đè cả file local đã có
BUCKET=pronunciations npm run sync:storage   # chỉ đồng bộ 1 bucket

# Bước 2 — ĐỔI audio_url sang local (để app phục vụ từ VPS, không qua Supabase)
npm run sync:storage -- --rewrite-urls --dry-run   # xem trước sẽ đổi bao nhiêu dòng
npm run sync:storage -- --rewrite-urls             # đổi thật (ghi DB)
```

Cách hoạt động (an toàn, chạy lại nhiều lần được):
- Đọc DB lấy danh sách file kỳ vọng theo bucket: `tts-cache` (`${lang}/${voice}/${hash}.mp3`,
  audio đã mã hóa) và `pronunciations` (`${word}-${voice}.mp3`, mp3 thường).
- File local **đã có** → bỏ qua. **Chưa có** → tải từ Supabase (`storage.download`, dùng
  service-role nên đọc được cả bucket private) → ghi ra `${UPLOADS_DIR}/${bucket}/${key}`.
- **Không** ghi đè file local (trừ `--force`), **không** đụng DB.

Đọc kết quả **bước 1 (tải file)**:
- `⏭ đã có` — file local sẵn rồi, bỏ qua.
- `↓ tải về` — vừa kéo từ Supabase xuống.
- `∅ thiếu trên Supabase` — không có ở **cả** local lẫn Supabase → cần tạo lại bằng
  `npm run seed:all -- --all`.

Đọc kết quả **bước 2 (đổi URL, `--rewrite-urls`)**:
- `✏️ đã đổi` — `audio_url` vừa được trỏ sang `/uploads/...` (vì file đã có ở VPS).
- `⏭ đã local` — `audio_url` vốn đã trỏ local, không đụng.
- `∅ chưa có file VPS` — file chưa tải về → **bỏ qua, KHÔNG đổi** (tránh link hỏng);
  chạy lại bước 1 rồi đổi URL lại.

Quy tắc an toàn của `--rewrite-urls`: **chỉ đổi dòng đã có file ở VPS**, **không đụng**
dòng đã trỏ local, **không xóa** gì. Mặc định ghi URL **tương đối** `/uploads/...`
(trình duyệt tự resolve theo domain — không gắn cứng host). Muốn ghi tuyệt đối thì đặt
`REWRITE_BASE_URL=https://en-vi.donghanhcungban.com`.

---

## 6. Kiểm tra Storage ↔ VPS (`check:supabase`)

Khác `sync:storage` (đi từ **dòng DB**), script `scripts/check-supabase-audio.ts` đi từ
**object THẬT trên Supabase Storage**: liệt kê đệ quy từng bucket, đối chiếu file local
trên VPS, báo cáo VPS còn thiếu gì — và bắt được cả file có trên Storage mà **DB không
có** (orphan storage). Có cờ `--seed` để tải các file thiếu về.

```bash
# CHẠY TRÊN VPS
npm run check:supabase            # chỉ báo cáo: Storage ↔ VPS ↔ DB
npm run check:supabase -- --seed  # tải các object Storage còn thiếu ở VPS về local
BUCKET=tts-cache npm run check:supabase   # chỉ 1 bucket
```

Báo cáo mỗi bucket:
- **Trên Supabase Storage** — tổng số object thật trong bucket.
- **Đã có ở VPS local** / **THIẾU ở VPS local** — đối chiếu file dưới `UPLOADS_DIR`
  (tts-cache còn gom số thiếu theo thư mục `lang/voice`).
- **Đối chiếu DB** — `có dòng` (object khớp 1 dòng tts_cache/pronunciations) vs
  `orphan storage` (file trên Storage nhưng KHÔNG có dòng DB — không bao giờ được app dùng).

Khi nào dùng `check:supabase` vs `sync:storage`:
- `sync:storage` — đảm bảo mọi thứ **DB cần** có ở VPS (đúng cái app phục vụ).
- `check:supabase` — đối chiếu **kho file thật** trên Storage, phát hiện chênh lệch/orphan.

---

## 7. Quy trình khuyến nghị

```bash
# Seed audio (tạo cache TTS)
npm run seed:all -- --check     # 1. Xem còn thiếu bao nhiêu (số liệu nay ổn định)
npm run seed:all -- --all       # 2. Seed hết (tự remap cái nào remap được)
npm run seed:verify             # 3. Kiểm tra: thiếu / thừa / đường dẫn
VERIFY_DECRYPT=20 npm run seed:verify   # 4. (tùy chọn) chắc chắn audio giải mã được

# Đưa audio về VPS local (chạy TRÊN VPS)
npm run sync:storage                       # 5. Tải file Supabase → VPS (cái DB cần)
npm run sync:storage -- --rewrite-urls     # 6. Trỏ audio_url sang /uploads (file đã có ở VPS)
npm run check:supabase                     # 7. Đối chiếu kho Storage thật ↔ VPS (tùy chọn)
```

Nếu seed bị lỗi giữa chừng: danh sách lỗi được ghi ra `scripts/seed-errors.json`
(phát âm) và `scripts/prefetch-tts-errors.json` (câu TTS) để retry sau.
