# 0251 — 2026-09-03 — PR-M10: Paradigm F (lập trình hàm) và C (đồng thời & phân tán)

PR: (điền sau) · Nhánh: `claude/viec-tiep-theo-mjoode`

## Bối cảnh

Track Kotlin xong ở PR-M9 (changelog 0250). Swift vẫn kẹt cổng cứng §8, nên **Paradigm là mạch
duy nhất của chương trình M còn đi tiếp được** — nó không thêm ngôn ngữ nên không qua cổng nào
đang đóng.

Đợt này làm hai trong ba trụ: **F (lập trình hàm)** và **C (đồng thời & phân tán)**. Trụ **S
(thiết kế hệ thống)** để PR-M11, đúng cách hiến chương chia M10/M11.

## Đã làm — 2 unit, 4 bài, ngôn ngữ Python

Tầng 3 **không thêm ngôn ngữ** (hiến chương §5) — dạy bằng bộ chạy đã có, mở theo _cách nghĩ_.
Hệ quả tốt: mọi bài ở đây đi qua `lessonsPython.test.ts`, **cổng nội dung mạnh nhất của môn**.

| Bài         | Dạy                                                                             |
| ----------- | ------------------------------------------------------------------------------- |
| `p6-u13-l1` | Hàm thuần, bất biến, `map`/`filter`/`reduce`, lười (lazy)                       |
| `p6-u13-l2` | **Lõi thuần + vỏ hiệu ứng** — dự án: tách một đoạn code có hiệu ứng phụ         |
| `p6-u14-l1` | Xen kẽ tất định, mất cập nhật, khoá, miền găng, deadlock, actor                 |
| `p6-u14-l2` | **Idempotency + retry/backoff/jitter** — dự án: webhook chịu được bản tin trùng |

**Kế thừa, không viết lại** (hiến chương §5): trụ C dùng đúng mô hình `chay_xen_ke(lich)` đã dựng
ở `p6-u2` (track Go) rồi mở rộng sang khoá và idempotency. Và **không dùng threading/
multiprocessing** (hiến chương P6 §4) — luồng thật trong sandbox chỉ cho một kết quả may rủi,
không dạy được gì; cảm giác bất định giao sang làn C.

Hai dự án đều nối thẳng vào đời thật: `u13-l2` là kiến trúc mà `dungTrangThai` của track Kotlin
vừa dùng; `u14-l2` là **chính webhook thanh toán của dự án này** (`/api/payment-webhook`, ngân
hàng giao at-least-once) — bài về nhà bắt học viên soi đúng ba câu hỏi để phát hiện lỗi cộng
tiền hai lần.

## Cổng Python nghiêm hơn cổng Kotlin — và nó bắt lỗi của tôi

`lessonsPython.test.ts` kiểm **đáp án `predict` phải là chuỗi con của output THẬT**, và các lựa
chọn sai thì không được khớp. Cổng Kotlin (M8/M9) không kiểm điều này.

Hai bài `p6-u13` bị đánh rớt vì tôi viết đáp án theo lối văn xuôi — `"[0, 1] rồi True"` — trong
khi output thật là hai dòng `[0, 1]` và `True`. Đã sửa **code predict in một dòng** (`print(goc,
goc is moi)`) và đáp án thành đúng chuỗi output (`"[0, 1] True"`). Cách này còn tốt hơn về sư
phạm: học viên đối chiếu được từng ký tự với thứ máy in ra.

## Bốn cổng khác cũng bắt lỗi, cả bốn đều đúng

1. **`LessonSchema` (Zod)** — `parsons.lines` không cho chuỗi RỖNG (min 1 ký tự). Tôi chèn dòng
   trống cho dễ đọc; đã bỏ. Cùng lỗi này làm đỏ luôn `srsCards.test.ts` (nó validate cả bài).
2. **`lessonMarkdown.test.ts`** — cụm `` `threading`/`multiprocessing` `` (hai code span dính
   nhau qua dấu gạch chéo) làm backtick lọt nguyên ra màn hình. Đã bỏ backtick, viết chữ thường.
   Đây là **lần thứ hai** cổng markdown bắt lỗi cùng loại: dấu markdown lồng/dính nhau. Bài học
   cho phiên sau: trong `theory`, tránh code span dính liền dấu câu hoặc lồng trong `**bold**`.
3. **Ví dụ mẫu `chay_co_khoa` thiếu `return chung`** — in ra `None`, tức là **mâu thuẫn thẳng
   với điều bài đang dạy** (khoá chữa được mất cập nhật). Bắt được nhờ tự chạy ví dụ mẫu qua
   python3 trước khi commit, không phải nhờ cổng.
4. **Parsons của `u14-l1` không chạy độc lập** (`ban_sao = chung` mà chưa có `chung`). Đã thêm
   dòng khởi tạo.

## Bằng chứng kiểm chứng

- **`lessonsPython.test.ts`** — chạy `python3` THẬT: code mẫu 4 bài đạt **hết test-case** (15 ca),
  ví dụ mẫu chạy sạch, đáp án predict khớp output thật.
- Tự chạy toàn bộ workedExample / predict / sampleSolution / parsons qua `python3` trước khi
  commit — chính chỗ này bắt được lỗi thiếu `return`.
- `npm run typecheck` ✅ · `npm run lint` (0 cảnh báo) ✅ · `npm test` **543 file / 11.079 test
  xanh** ✅ · `npm run build` ✅ · `npx prettier --check` ✅.

Không thêm test trình duyệt: mạch Python đã có sẵn đường đi được phủ từ trước (khác Kotlin ở
M8 — lúc đó là ngôn ngữ MỚI nên phải chốt đường đi trong giao diện).

## Việc tiếp theo

- **PR-M11** — trụ **S (thiết kế hệ thống & tư duy kỹ sư)**, `p6-u15`: ước lượng số lớn · cache ·
  hàng đợi · phân mảnh · quan sát được · **phân tích sự cố**. Hiến chương §7 chỉ định rõ dự án:
  phân tích một sự cố CÓ THẬT, dùng ngay hồ sơ `docs/ke-hoach-khoi-phuc-su-co-server.md` của
  chính dự án này, rồi viết post-mortem.
- **PR-M12** — giao diện: gom nhóm 15 unit P6 theo track, nhãn ngôn ngữ, a11y, e2e.
- **PR-M4…M6** (Swift) vẫn kẹt cổng cứng §8 — cần máy có Swift toolchain.
