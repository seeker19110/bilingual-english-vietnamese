# 0167 — ci: changelog chấp nhận số trùng, chốt quy ước cấp số "quét rồi +1"

- **Ngày:** 2026-08-27
- **PR:** #708
- **Nhánh:** `claude/programming-lessons-tl3tbg`

## Vấn đề

`scripts/changelog.test.ts` đòi số thứ tự **tăng nghiêm ngặt**, tức coi hai file cùng số là
lỗi. Nhưng cách cấp số của repo là phi tập trung: người soạn chạy `npm run changelog`, lấy số
lớn nhất + 1. Hai nhánh soạn cùng lúc thì **cùng thấy một số lớn nhất**, nên cùng chọn một số.

Trùng số vì thế không phải sai sót của ai — nó là hệ quả tất yếu của cách cấp số. Cổng lại
đánh trượt đúng cái nó không nên chặn.

Giá phải trả đo được: riêng PR #703 dính **bốn lượt CI đỏ** vì chuyện này —

| Lượt | Số trùng             | Va với                   |
| ---- | -------------------- | ------------------------ |
| 1    | `0154`               | PR rate-limit            |
| 2    | `0155`,`0156`,`0157` | PR #702 (ba số CÙNG LÚC) |
| 3    | `0159`               | PR #705                  |
| 4    | `0160`               | PR #707                  |

Mỗi lượt tốn một vòng CI đầy đủ cộng một lượt đổi tên file kèm sửa tham chiếu chéo.

Đáng chú ý nhất: **`scripts/changelog.ts` vẫn ghi "trùng số không sao"** ngay trong comment
của chính nó. Công cụ và cổng mâu thuẫn nhau, và cổng thắng.

## Việc đã làm

1. **Test chấp nhận số trùng** — `toBeGreaterThan` → `toBeGreaterThanOrEqual` (thứ tự không
   giảm thay vì tăng nghiêm ngặt).
2. **Thêm quy tắc phá hoà cố định** trong `readEntries()`: cùng số thì **ngày mới hơn trước,
   rồi tới tên file**. Trước đây số trùng làm thứ tự rơi về thứ tự `readdir` — khác nhau giữa
   các máy — nên hook đầu phiên có thể in ra hai kết quả khác nhau cho cùng một thư mục.
3. **Hai ca thử mới**, chạy trên **thư mục giả** chứ không trên `docs/changelog/` thật: hôm nay
   thư mục thật không có số trùng nào, nên kiểm ở đó là test đạt một cách RỖNG — vẫn xanh kể cả
   khi luật cũ được đặt lại.
4. **Chốt quy ước bằng chữ** trong `docs/changelog/README.md` và comment của
   `scripts/changelog.ts`: quét rồi lấy max + 1; trùng số là bình thường, **đừng đổi tên file
   để "chữa"**.

## Quyết định kèm theo

- **Chọn "cho phép trùng" chứ không phải "đòi duy nhất".** Tôi từng đề xuất nới thành "chỉ đòi
  số duy nhất" — đề xuất đó SAI và không chữa được gì: hai nhánh cùng lấy max+1 sẽ cho ra cùng
  một số, mà đó chính là trùng, nên luật duy nhất vẫn đánh trượt y hệt luật cũ.
- **Không đổi sang tên file theo dấu thời gian.** Cách đó cũng bỏ được va chạm, nhưng phải đổi
  tên toàn bộ 160+ file đang có và sửa mọi tham chiếu — đắt hơn hẳn mà lợi ích thêm không đáng.
- **Giữ nguyên mọi bất biến còn lại**: khuôn tên `NNNN-YYYY-MM-DD-slug.md`, dòng đầu là tiêu đề
  cấp 1, không file rỗng, `PROGRESS.md` không chồng thêm mục.

## Bằng chứng kiểm chứng

Chạy thật, không suy đoán:

- `npx vitest run scripts/changelog.test.ts` → **8/8 xanh**.
- **Ca thử ngược 1 — test có bắt được lỗi không:** gỡ quy tắc phá hoà khỏi `readEntries()` rồi
  chạy lại → đỏ đúng một test ("thứ tự XÁC ĐỊNH khi số trùng"), 7 test kia vẫn xanh. Khôi phục
  → 8/8 xanh trở lại.
- **Ca thử ngược 2 — số trùng THẬT có còn làm đỏ CI không:** tạo file
  `0166-2026-08-27-dot-gia-song-song.md` trùng số với đợt mới nhất, đúng kịch bản hai PR song
  song → **8/8 vẫn xanh**. Trước bản sửa, chính ca này đã đánh đỏ PR #703 bốn lượt. Xoá file
  giả sau khi đo, `git status` sạch.
- `prettier --check`, `lint`, `typecheck`, toàn bộ `npm test`: xem mô tả PR.
