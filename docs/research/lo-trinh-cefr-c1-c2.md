# Kế hoạch & thực thi: Thêm cấp C1–C2 vào lộ trình CEFR (Đợt 2)

> 2026-07-06 · **ĐÃ THỰC HIỆN** (PR — xem `PROGRESS.md`). Mục tiêu: mở rộng lộ trình từ A1→B2
> thành **A1→C2 đầy đủ**, gộp phần từ vựng CEFR C1/C2 ("Đợt 2").

## 1. Phát hiện then chốt

Lộ trình vốn **data-driven** từ `CEFR_LEVELS` (`src/data/cefr.ts`) — `RoadmapTab`/`Home`/
`CefrLevelPage` tự duyệt `levels.map(...)`, `computeLockedMapPersisted` tự nối chuỗi mở khóa,
`CefrWordLevel`/`LEVEL_COLOR` đã sẵn `'C1'|'C2'`. → Thêm C1/C2 chủ yếu là **thêm dữ liệu**,
không viết lại logic.

## 2. Nguồn từ vựng

Chọn **từ điển dự án đã gắn nhãn C1/C2** (2.357 từ, có sẵn nghĩa TV + ví dụ song ngữ + phiên
âm + tần suất) thay vì headword Octanove trần (1.955 từ, không nghĩa). Làm sạch: bỏ ~9 từ gắn
nhầm (`freq < 2000`) + ~100 từ trùng nền tảng A1-B2 → **C1 = 687 từ · C2 = 1.561 từ**.

## 3. Kiến trúc dữ liệu

```
scripts/gen-cefr-c1c2-vocab.ts → src/data/cefrC1C2Vocab.json (KHÔNG sửa tay)
  → src/data/cefrC1C2Vocab.ts (wrapper kiểu)
    → curriculum.ts: FOUNDATION += CEFR_C1C2_CIRCLES
    → cefrAdvanced.ts: buildUnits() + ngữ pháp soạn tay → C1_LEVEL/C2_LEVEL
      → cefr.ts: CEFR_LEVELS.push(C1_LEVEL, C2_LEVEL)
```

Sau khi sửa nguồn `.ts`, chạy lại `npx tsx scripts/gen-curriculum-json.ts` +
`scripts/gen-learn-json.ts` (client đọc qua `fetch('/data/*.json')`).

## 4. Ngữ pháp C1/C2 (soạn tay, `src/data/cefrAdvanced.ts`)

- **C1 (10 bài/6 Phần):** rút gọn mệnh đề quan hệ · câu chẻ It/Wh-cleft · đảo ngữ phủ định &
  điều kiện · V-ing/to-V đổi nghĩa · thức giả định + wish · nhượng bộ.
- **C2 (7 bài/6 Phần):** đảo ngữ nâng cao & fronting · lược bỏ/thay thế · danh từ hóa · mệnh đề
  phân từ/tuyệt đối · giả định trang trọng · tình thái/hedging.

Không đổi schema DB — cột `cefr_grammar`/`cefr_dialogues`/`cefr_unlocked` là mảng id tự do,
C1/C2 dùng chung.

## 5. Bổ sung (đã làm)

- **Gom từ vựng theo chủ đề**: 10 chủ đề (Kinh doanh, Luật pháp, Khoa học...) qua nghĩa TV +
  gốc từ tiếng Anh; ~7% khớp, còn lại theo loại từ. Unit đổi thành Phần Ngữ pháp (có hội thoại)
  → Phần Từ vựng theo chủ đề.
- **Hội thoại cho mọi Phần ngữ pháp**: 12 hội thoại C1/C2 mới, dùng đúng cấu trúc bài.

## 6. Kiểm chứng

Build/typecheck/lint/test/size-limit xanh; E2E a11y `/learning-path/c1` 0 critical/serious 4
theme; lái app thật xác nhận bản đồ 6 cấp + nội dung Phần render đúng.
