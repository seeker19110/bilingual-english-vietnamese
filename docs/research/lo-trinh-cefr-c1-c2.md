# Kế hoạch & thực thi: Thêm cấp C1–C2 vào lộ trình CEFR (Đợt 2)

> Ngày: 2026-07-06 · Trạng thái: **ĐÃ THỰC HIỆN** (xem PROGRESS.md để biết PR)
> Mục tiêu: mở rộng lộ trình học từ **A1→B2** thành **A1→C2 đầy đủ**, gộp luôn
> phần từ vựng CEFR C1/C2 ("Đợt 2").

## 1. Bối cảnh

Trước thay đổi này, lộ trình `/learning-path` chỉ có 4 cấp A1–B2 (1.523 từ nền
tảng thủ công + 61 bài ngữ pháp). Toàn bộ từ C1/C2 nằm lẫn trong mục "Mở rộng"
(gắn vào trang B2), không có trang cấp riêng, không có mục tiêu can-do, không có
ngữ pháp nâng cao.

## 2. Phát hiện then chốt (kiến trúc đã sẵn sàng)

Lộ trình gần như **data-driven** từ `CEFR_LEVELS` (`src/data/cefr.ts`):

- `RoadmapTab`, `Home`, `CefrLevelPage` đều duyệt `levels.map(...)` → tự render 6 cấp.
- `computeLockedMapPersisted` duyệt chuỗi cấp theo thứ tự → tự nối B2→C1→C2.
- `studyPool` cấp CUỐI (+`getBeyondCefrWords`) bám `levels[length-1]` → phần "học
  tiếp ngoài CEFR" tự dời từ B2 sang C2.
- `CefrWordLevel` (`types.ts`) + `LEVEL_COLOR` (`pos.ts`) đã có sẵn `'C1'|'C2'`
  và màu rose/cyan.

→ Thêm C1/C2 chủ yếu là **thêm dữ liệu**, không phải viết lại logic.

## 3. Nguồn từ vựng (quyết định)

Số "1.407 từ" người dùng nêu là **từ vựng chuẩn CEFR C1/C2**. Đối chiếu các nguồn
trong repo:

| Nguồn                               | Số từ     | Có nghĩa TV + ví dụ?          |
| ----------------------------------- | --------- | ----------------------------- |
| Octanove C1/C2 (headword)           | 1.955     | Không (chỉ headword+pos+CEFR) |
| Octanove ∩ từ điển dự án            | 629       | Có                            |
| **Từ điển dự án đã gắn nhãn C1/C2** | **2.357** | **Có (100%)**                 |

Chọn **từ điển đã gắn nhãn** vì mọi từ đều có sẵn nghĩa tiếng Việt + câu ví dụ
song ngữ + phiên âm + tần suất (đã gắn qua chính các wordlist CEFR chuẩn
Octanove/CEFR-J/Words-CEFR-Dataset ở các PR trước). Không phải gõ tay lại.

**Làm sạch:** bỏ ~9 từ bị nguồn nội suy gắn nhầm (dạng biến thể rất thông dụng như
"trying", "standing", "cannot" — lọc `freq >= 2000`) và ~100 từ đã có trong nền
tảng A1–B2. Kết quả: **C1 = 687 từ · C2 = 1.561 từ · tổng 2.248 từ** — bao trùm
trọn lô 1.407 và không để sót từ C1/C2 nào ở mục "Mở rộng".

## 4. Kiến trúc dữ liệu (tái lập được)

```
scripts/gen-cefr-c1c2-vocab.ts   (đọc từ điển đã gắn nhãn, lọc + sắp tần suất)
        │  ghi
        ▼
src/data/cefrC1C2Vocab.json      (circles[] + c1/c2UnitCircleIds[][])  ← KHÔNG sửa tay
        │  import qua
        ▼
src/data/cefrC1C2Vocab.ts        (wrapper gắn kiểu Circle)
        ├─→ curriculum.ts:  FOUNDATION = [...FOUNDATION_BASE, ...CEFR_C1C2_CIRCLES]
        └─→ cefrAdvanced.ts: buildUnits() ghép nhóm vòng vào từng "Phần" của cấp
                             + soạn tay ngữ pháp C1/C2 → export C1_LEVEL, C2_LEVEL
                                    │
                                    ▼
                             cefr.ts: CEFR_LEVELS.push(C1_LEVEL, C2_LEVEL)
```

Client đọc qua `fetch('/data/*.json')`, nên sau khi sửa nguồn `.ts` phải chạy lại:
`npx tsx scripts/gen-curriculum-json.ts` + `npx tsx scripts/gen-learn-json.ts`.

## 5. Ngữ pháp C1/C2 (soạn tay, `src/data/cefrAdvanced.ts`)

Cùng chuẩn "làm giàu" như A1–B2 (cấu trúc + giải thích TV + ví dụ nghe được + mẹo

- lỗi thường gặp + quiz).

* **C1 (10 bài / 6 Phần):** rút gọn mệnh đề quan hệ · mệnh đề quan hệ + giới từ/
  lượng từ · câu chẻ It-cleft & Wh-cleft · đảo ngữ phủ định & điều kiện · động từ
  - V-ing/to-V đổi nghĩa · thức giả định + wish/if only · nhượng bộ & liên kết.
* **C2 (7 bài / 6 Phần):** đảo ngữ nâng cao (So/Such/Only) & fronting · lược bỏ/
  thay thế · danh từ hóa · mệnh đề phân từ & tuyệt đối · giả định trang trọng &
  thành ngữ cố định · tình thái & hedging nâng cao.

## 6. Màu & điểm chạm khác

- `cefrAccent.ts` + `Dashboard.tsx`: thêm accent **rose (C1)** / **cyan (C2)** (khớp
  `LEVEL_COLOR` badge từ đã có → AA đã được kiểm qua gate `/dictionary`).
- Nhãn "A1 → B2" → "A1 → C2" ở `Learn.tsx`, `CefrLevelPage.tsx`, `RoadmapTab.tsx`.
- Không đổi schema DB: cột `cefr_grammar`/`cefr_dialogues`/`cefr_unlocked` là mảng
  id chuỗi tự do — C1/C2 dùng chung.

## 7. Kiểm chứng

- Cổng chất lượng: build · typecheck · lint (0 cảnh báo) · test (201/201) ·
  size-limit (Initial JS 114.31/116 kB) đều xanh.
- E2E a11y: thêm `/learning-path/c1`, 0 critical/serious ở cả 4 theme.
- Lái app thật (Playwright): bản đồ hiện đủ 6 cấp; mở khóa C1/C2 → 7/14 Phần render
  đúng (vòng từ vựng + bài ngữ pháp có cấu trúc + hội thoại); mở 1 bài ngữ pháp C1
  thấy đủ nội dung.

## 8. Bổ sung sau (đã làm — 2 việc tùy chọn)

**(a) Gom vòng từ vựng theo CHỦ ĐỀ.** Generator phân mỗi từ vào 1 nhóm dựa trên
NGHĨA tiếng Việt (khớp từ khóa) + gốc từ tiếng Anh đặc trưng (vd `-ology`→khoa học,
`juris-`→luật): 10 chủ đề (Kinh doanh, Luật pháp, Khoa học, Y học, Môi trường, Nghệ
thuật, Xã hội, Cảm xúc, Tư duy, Giao tiếp). Từ không khớp chủ đề (đa số từ nâng cao
trừu tượng/chung — chỉ ~7% khớp được chủ đề) gom theo LOẠI TỪ (Danh/Động/Tính-trạng
từ nâng cao). Nhóm lớn cắt thành nhiều "Phần" ≤5 vòng để không có unit khổng lồ.
→ Mô hình unit C1/C2 đổi: **Phần NGỮ PHÁP** (soạn tay, kèm hội thoại, không có bước
từ vựng) đứng trước, rồi **Phần TỪ VỰNG theo chủ đề** (không có ngữ pháp) — mỗi Phần
mạch lạc. `buildUnits()` trong `cefrAdvanced.ts` ghép 2 loại; `cefrC1C2Vocab.json`
xuất thêm `c1Units`/`c2Units` (mô tả Phần từ vựng).

**(b) Thêm hội thoại cho MỌI Phần ngữ pháp.** Mỗi bài ngữ pháp C1/C2 (6 Phần C1 + 6
Phần C2) nay có 1 hội thoại minh họa dùng chính cấu trúc bài đó (`dialogues.ts`,
tổng **12 hội thoại C1/C2**, dialogues.json 65 chủ đề / 139 hội thoại).

## 9. Còn có thể làm tiếp (không bắt buộc)

- Nâng độ phủ phân loại chủ đề (hiện ~7% từ khớp chủ đề; còn lại theo loại từ) —
  cần từ điển chủ đề chi tiết hơn hoặc phân loại bằng AI.
