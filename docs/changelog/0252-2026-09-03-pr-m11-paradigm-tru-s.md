# 0252 — 2026-09-03 — PR-M11: Paradigm trụ S, khép nội dung chương trình M

PR: (điền sau) · Nhánh: `claude/viec-tiep-theo-mjoode`

## Bối cảnh

Trụ F và C xong ở PR-M10 (changelog 0251). Đợt này làm trụ cuối — **S: thiết kế hệ thống & tư
duy kỹ sư** (`p6-u15`) — khép cụm paradigm và **khép phần NỘI DUNG của chương trình M**, chỉ còn
PR-M12 (giao diện) và mạch Swift đang kẹt cổng cứng.

## Đã làm — `p6-u15`, 2 bài

| Bài         | Dạy                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| `p6-u15-l1` | Ước lượng số lớn (mẫu 4 bước), cache/hàng đợi/phân mảnh và CÁI GIÁ của từng cái, gọi tên đánh đổi, ba tầng quan sát được |
| `p6-u15-l2` | **Phân tích sự cố + post-mortem** — dự án khép cụm                                                                       |

## Dự án dùng SỰ CỐ CÓ THẬT của chính dự án này

Hiến chương §7 chỉ định rõ: _"phân tích một sự cố có thật — dùng ngay hồ sơ sự cố của chính dự
án này"_. Bài `l2` dùng đúng sự cố **30/07/2026** (auto-deploy hỏng 5 lần liên tiếp sau khi VPS
đổi IP), chép từ mục 7 của `docs/ke-hoach-khoi-phuc-su-co-server.md`.

Sự cố đó dạy được thứ mà một ví dụ bịa ra không dạy nổi: **ba lỗi ĐỘC LẬP xếp chồng**, mỗi lỗi
che lỗi sau nó.

1. Secret `VPS_HOST` trỏ IP cũ → hết giờ kết nối. Sửa xong, chạy lại…
2. …lộ ra khoá SSH sai định dạng → "không tìm thấy khoá". Sửa xong, chạy lại…
3. …lộ ra tài khoản DB thiếu quyền trên schema `public`. **Lỗi này có sẵn từ hôm dựng VPS**, chỉ
   chưa lộ vì trước đó chưa qua nổi bước SSH.

Ba bài học rút ra, đều viết thành nội dung dạy: lỗi nhìn thấy là **lớp ngoài cùng** (sửa xong
phải CHẠY LẠI, đừng tuyên bố xong sớm) · **thông điệp lỗi đổi thì hướng điều tra phải đổi** (hết
giờ ≠ xác thực hỏng, hai câu chỉ về hai chỗ khác hẳn) · **cái hỏng tệ nhất là cái hỏng IM LẶNG**
(5 lần thất bại không ai hay — chính là tầng cảnh báo thiếu, nối thẳng vào mục "quan sát được"
của bài `l1`).

Ví dụ mẫu của `l2` **mô hình hoá đúng sự cố đó bằng code**: vòng lặp sửa-rồi-chạy-lại in ra đúng
bốn lượt (`i/o timeout` → `no key found` → `permission denied` → `success`). Học viên thấy cơ chế
"nhiều lớp" chứ không chỉ đọc mô tả.

Bài Make là **công cụ soát post-mortem** theo đúng khuôn sáu ô của dự án: bắt ô thiếu VÀ ô chỉ
toàn dấu cách, tính downtime từ hai mốc `HH:MM`. Nội dung nhấn: ô "cách ngăn tái diễn" là ô DUY
NHẤT tạo giá trị lâu dài, và nó chỉ có giá trị khi là thay đổi CỤ THỂ kiểm được — "cẩn thận hơn"
coi như bỏ trống.

## Bằng chứng kiểm chứng

- **`lessonsPython.test.ts`** (chạy `python3` THẬT): code mẫu 2 bài đạt **hết 6 test-case**, ví dụ
  mẫu chạy sạch, **đáp án `predict` khớp output thật** và không lựa chọn sai nào trùng khớp.
- Tự chạy toàn bộ workedExample / predict / sampleSolution / parsons qua `python3` trước khi
  commit — lần này **không có lỗi nào**, nhờ áp sẵn ba bài học soạn bài của M9/M10 (ghi ở đầu
  file `p6u15.ts`): đáp án predict phải là chuỗi con của output thật · `parsons.lines` không có
  chuỗi rỗng · trong `theory` tránh code span dính dấu câu hoặc lồng trong đậm.
- `npm run typecheck` ✅ · `npm run lint` (0 cảnh báo) ✅ · `npm test` **543 file / 11.099 test
  xanh, đạt ngay lượt đầu** ✅ · `npm run build` ✅ · `npx prettier --check` ✅.

Đáng ghi: đây là đợt soạn nội dung ĐẦU TIÊN của mạch M không bị cổng nào đánh rớt. Ba bài học
tích luỹ từ hai đợt trước đã chuyển thành ghi chú ngay đầu file, nên phiên sau không phải học lại
bằng cách đỏ CI.

## Việc tiếp theo

**Phần NỘI DUNG của chương trình M đã xong**, trừ mạch Swift:

- **PR-M12** — giao diện: gom nhóm 15 unit P6 theo track (Kotlin `u5–u7` · Swift `u8–u12` ·
  Paradigm `u13–u15`), nhãn ngôn ngữ, a11y, e2e. Đây là việc còn lại DUY NHẤT không bị chặn.
- **PR-M4…M6** (nội dung Swift `p6-u8…u12`) vẫn kẹt **cổng cứng §8** — cần máy có Swift
  toolchain. Đã thử lại 2026-09-03: `download.swift.org` không tới được, GitHub swiftlang 403.
