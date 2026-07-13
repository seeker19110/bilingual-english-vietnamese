# Đặc tả cải thiện UI/UX (bản đã đối chiếu code thật) — 2026-07-13

> Nguồn gốc: người dùng đưa một bản đặc tả UI/UX bên ngoài để đánh giá. Tài liệu này là bản
> **đã kiểm tra lại với code thật** (grep + đọc file), sửa các điểm sai/lỗi thời, và viết lại
> thành việc cụ thể để giao cho agent code làm. **Không suy đoán — mọi dòng dưới đây đều đã đối
> chiếu với file thật tính đến commit hiện tại của nhánh `claude/english-tutor-ui-ux-bb6ckm`.**

## 0. Các điểm trong bản gốc ĐÃ SAI / LỖI THỜI — không đưa vào việc cần làm

Để agent code không làm lại việc đã xong hoặc lật ngược quyết định đã duyệt:

1. **"Chưa có bottom navigation"** — SAI. `src/components/BottomNav.tsx` đã triển khai đủ 4 tab
   (Trang chủ, Lộ trình, Luyện tập, Tiến độ), ẩn ở `/login` `/onboarding`, chỉ hiện `<640px`,
   nhớ route luyện tập gần nhất qua localStorage. Đã xong từ 2026-07-04 (tài liệu
   `cai-tien-ui-ux.md`, mục U-1→U-5). **Không làm lại.**
2. **"Khóa zoom (`user-scalable=no`) là sơ suất a11y"** — SAI. Đây là **quyết định chủ động đã
   duyệt**, ghi rõ ở `index.html` (comment ngay trên thẻ viewport), `AUDIT.md` dòng 553, và
   `CLAUDE.md` mục 13 ("Zoom mobile khóa chủ động — đánh đổi 1 mục a11y, bù bằng sàn chữ ≥11px").
   **Không tự đổi lại** — nếu muốn đổi phải hỏi người dùng trước vì đây là lật quyết định cũ,
   không phải sửa lỗi.
3. **"Số liệu Từ điển mâu thuẫn 12.073/8k/12.245"** — đã từng phát hiện trước (mục E7,
   `docs/research/cai-tien-trai-nghiem-hoc-2026-07-11.md`), có phần đã sửa. Xem mục 2 dưới đây
   để biết hiện trạng thật (vẫn còn 1 chỗ sai như bản gốc mô tả, nhưng lý do khác).

## 1. Việc cần làm — nhóm A: 2 fix nhỏ, rủi ro thấp (ưu tiên 1)

### A1. Theme toggle: chuyển từ cycle sang menu chọn trực tiếp

- **File:** `src/components/ThemeToggle.tsx`
- **Hiện trạng (đã xác nhận):** bấm nút là gọi `cycleTheme()` nhảy thẳng sang theme kế tiếp
  trong mảng `THEMES` (`src/lib/theme.ts`), không có popover, người dùng không thấy trước danh
  sách/tên/trạng thái đang chọn.
- **Việc cần làm:** đổi hành vi bấm nút thành mở popover/menu liệt kê toàn bộ `THEMES` dạng ô
  màu (swatch) + tên (dùng `labelVi`/`labelEn` đã có sẵn) + đánh dấu theme đang chọn (`aria-current`
  hoặc dấu check) + bấm chọn thẳng theme đó (gọi `setTheme(t.value)`), đóng menu sau khi chọn.
  Giữ nguyên `aria-label` hiện có (đã tốt cho screen reader), chỉ thêm phần hiển thị trực quan.
  Đóng menu khi click ra ngoài / phím Esc; điều hướng được bằng bàn phím (arrow/Enter) để giữ
  a11y.
- **Không đụng:** `src/lib/theme.ts`, `src/context/useTheme.ts`, hệ biến CSS `--a-*` — chỉ đổi
  UI của nút bấm.

### A2. Màn Luyện nói (Speaking) thiếu mô tả cấp độ — thiếu nhất quán với Chat

- **File cần sửa:** `src/pages/Speaking.tsx`
- **File tham khảo (đã đúng, copy cách làm từ đây):** `src/pages/Chat.tsx` dòng 137-141
- **Hiện trạng (đã xác nhận):** dữ liệu `descA`/`descB` cho từng mức độ **đã có sẵn** trong
  `LEVELS` (`src/types.ts:167-180`, ví dụ `descA: 'A1–A2, câu đơn giản'`). `Chat.tsx` đã render
  dòng mô tả này dưới 3 nút chọn cấp độ:
  ```tsx
  <p className="text-xs text-zinc-400 mt-1.5 text-center">
    {isA
      ? LEVELS.find((l) => l.value === level)?.descA
      : LEVELS.find((l) => l.value === level)?.descB}
  </p>
  ```
  `Speaking.tsx` (quanh dòng 167-189, khối `<div>` chứa nhãn "Trình độ" + `grid grid-cols-3`)
  **không có** đoạn này.
- **Việc cần làm:** thêm đúng đoạn `<p>` mô tả cấp độ như trên vào `Speaking.tsx`, đặt ngay sau
  khối `grid grid-cols-3 gap-2` chứa các nút cấp độ (trước nút "Bắt đầu luyện nói →"). Không cần
  đổi dữ liệu `LEVELS`, không cần đổi `Chat.tsx`.

## 2. Việc cần làm — nhóm B: Kiểm tra & thống nhất số liệu Từ điển (ưu tiên 2)

- **Đã xác nhận 3 vị trí số liệu:**
  1. `VocabMilestone.tsx`: 4 mốc đặt tên, mốc cuối cùng = **8.000** (`GOAL = MILESTONES[...].count`,
     dòng 18) — đây là **mốc thành tựu đặt tên cao nhất**, không phải tổng số từ. Thanh chỉ vẽ
     đến mốc cuối này (cố ý, không phải lỗi).
  2. `StudyTabs.tsx:827`: `{progress.done}/{progress.total}` — cần xác định `progress.total`
     lấy từ đâu (nghi là tổng từ vựng của **lộ trình học** `getLearningPath()`, ra số ~12.245,
     KHÁC với tổng số mục **từ điển** 12.073 — hai tập dữ liệu khác nhau: một là từ điển tra
     cứu, một là danh sách từ trong lộ trình học có thứ tự).
  3. Tiêu đề trang Từ điển ghi "12.073 từ thông dụng" — đây là tổng số mục trong
     `public/data/dictionary/chunk-*.json` (đã xác nhận ở `AUDIT.md` dòng 40).
- **Việc cần làm (giao cho agent code, cần đọc thêm trước khi sửa):**
  1. Đọc `src/lib/stats.ts` hoặc nơi tính `progress.total` truyền vào `StudyTabs.tsx` để xác
     nhận chính xác nó lấy từ `getLearningPath().length` hay nguồn khác, và giá trị thật hiện
     tại là bao nhiêu.
  2. Nếu `progress.total` (~12.245) khác `12.073` (tổng từ điển) vì **là hai tập dữ liệu khác
     nhau về bản chất** (lộ trình học có thể lặp/thêm cụm từ, từ điển là tra cứu thuần) — KHÔNG
     gộp làm một số duy nhất một cách máy móc. Thay vào đó: đổi nhãn hiển thị cho rõ nghĩa, ví
     dụ `"Tổng đã thuộc: 243/12.245 từ trong lộ trình"` thay vì chỉ "Tổng đã thuộc: X/Y" trần
     trụi dễ hiểu nhầm là tổng từ điển.
  3. Với thanh mốc `VocabMilestone` dừng ở "8k": thêm chú thích ngắn kiểu "(mốc cao nhất)" hoặc
     tooltip giải thích đây là các mốc đặt tên, không phải tổng số từ, để không gây hiểu nhầm
     khi đặt cạnh con số 12.073/12.245.
  4. Kiểm tra xem mục **E7** trong `docs/research/cai-tien-trai-nghiem-hoc-2026-07-11.md` (dòng
     33, 61-62) đã được triển khai tới đâu — tài liệu đó ghi "đã sửa ở trang cấp, sót ở đây
     (`StudyPanel` dùng ở `/learning-path` tổng quan + `/dictionary`)" — tránh làm trùng, chỉ
     hoàn thiện phần còn sót.

## 3. Việc cần làm — nhóm C: Bố cục desktop 2 cột + skeleton + phân nhóm trang chủ (ưu tiên 3, việc lớn hơn)

> Nhóm này đụng nhiều file/layout — agent code nên **đọc kỹ rồi đề xuất kế hoạch chia nhỏ trước
> khi sửa**, đúng quy tắc ở `CLAUDE.md` mục 3 & 7 (giải thích kế hoạch ngắn gọn rồi hỏi trước khi
> sửa nhiều file/đổi cấu trúc). Dưới đây là khung việc, KHÔNG phải chỉ định kỹ thuật chi tiết vì
> chưa đọc hết các file liên quan.

### C1. Bố cục desktop (≥1024px) đỡ trống trải

- Container hiện dùng `max-w-3xl mx-auto` (đã xác nhận ở `Dictionary.tsx:211`, và nhiều trang
  khác dùng pattern tương tự — cần grep `max-w-3xl` toàn `src/pages/` để liệt kê hết trước khi
  sửa).
- Đề xuất: giữ nguyên cột nội dung mobile-first (không phá layout mobile đang hoạt động tốt),
  chỉ thêm breakpoint `lg:` cho các màn có nội dung phù hợp bố cục 2 cột — ví dụ Từ điển (panel
  mốc từ vựng/tab bên trái, flashcard bên phải), màn setup Luyện nói/Chat (mô tả bên trái, form
  chọn bên phải). Cần xem xét từng trang cụ thể, không áp máy móc cho mọi trang.
- **Yêu cầu bắt buộc:** phải test bằng mắt (`npm run dev` + xem ở viewport ≥1024px) trước khi
  báo xong, vì đây là thay đổi layout trực quan, type-check không bắt được lỗi bố cục.

### C2. Skeleton loading nhất quán

- Đã xác nhận: trang Hồ sơ (`Profile.tsx`) có skeleton loader. Cần grep xem những trang gọi AI
  (chấm viết `Writing.tsx`, luyện nói `Speaking.tsx`, chat `Chat.tsx`) hiện xử lý trạng thái
  loading như thế nào (spinner? text? không có gì?) trước khi quyết định cách chuẩn hóa.
- Đề xuất: dùng chung 1 component skeleton (nếu chưa có, tạo `src/components/Skeleton.tsx`),
  áp cho Từ điển + các luồng gọi AI có độ trễ, kèm text trạng thái rõ ràng ("AI đang chấm bài…").

### C3. Phân nhóm tính năng ở trang chủ

- Cần đọc `src/pages/Home.tsx` đầy đủ để biết cấu trúc danh sách tính năng hiện tại (bao nhiêu
  card, đã có card "Học tiếp" nổi bật chưa) trước khi đề xuất phân nhóm — tài liệu
  `cai-tien-trai-nghiem-hoc-2026-07-11.md` (mục E8) đã ghi nhận "thẻ Học tiếp có nhưng lép vế
  giữa menu 7 card" — đây có thể đã là việc tồn đọng đã biết (V-5 trong tài liệu đó), agent code
  nên đọc tài liệu này trước để tránh làm trùng/xung đột hướng đã duyệt.

## 4. Thứ tự khuyến nghị cho agent code

1. Nhóm A (A1, A2) — làm trước, mỗi việc 1 commit riêng, test thủ công bằng mắt.
2. Nhóm B — đọc `src/lib/stats.ts` trước, xác nhận nguồn số liệu, sửa nhãn hiển thị (không đổi
   logic tính toán nếu không cần).
3. Nhóm C — dừng lại, tóm tắt kế hoạch chia nhỏ và xin xác nhận người dùng trước khi sửa (theo
   đúng CLAUDE.md mục 3 & 12 — thay đổi lớn/nhiều file phải hỏi trước).

## 5. Cổng trước khi commit (nhắc lại từ CLAUDE.md mục 8)

Build ✅ · Typecheck ✅ · Lint (0 cảnh báo) ✅ · Test ✅ · tự đọc lại diff · không để lại
`console.log` debug · conventional commits. Nhóm C bắt buộc thêm bước tự chạy thử bằng mắt
(`npm run dev`) ở cả mobile và desktop viewport vì là thay đổi layout trực quan.
