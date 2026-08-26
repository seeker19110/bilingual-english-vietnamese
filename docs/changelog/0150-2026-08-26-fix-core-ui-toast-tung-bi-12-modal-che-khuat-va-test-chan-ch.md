# fix(core-ui): toast từng bị 12 modal che khuất — và test chặn cho glob Tailwind (2026-08-26)

Việc nối tiếp ngay sau PR #693, xuất phát từ chính ghi chú tôi để lại cho reviewer ở PR đó:
_"bất kỳ class Tailwind nào chỉ dùng trong `packages/core-ui/` đều âm thầm không có tác dụng
trước PR này — nên rà lại xem còn class nào khác đang trong tình trạng đó không"_. Rà xong,
phát hiện bản vá glob ở PR #693 đã **âm thầm sửa thêm một lỗi thật mà lúc đó chưa ai biết**.

- **Cách rà (đo, không đoán):** build CSS ở HAI cấu hình — có và không có glob `packages/core-ui`
  — rồi diff từng rule. Kết quả dứt khoát: **đúng 4 rule mới được kích hoạt, 0 rule bị mất**.
  Ba rule là bản vá tương phản đã biết (`theme-light:text-red-800` × 3 theme sáng). Rule thứ tư
  thì không ai để ý: **`.z-[100]` của khung toast**.
- **Hậu quả thật của rule thứ tư:** trước PR #693, khung toast **không có `z-index` nào cả** nên
  chỉ xếp theo thứ tự DOM. Trong khi đó app có **12 modal `fixed inset-0 z-50`** (thanh toán
  admin, PvP Arena, MicroDrill, LiveDebate, ProactiveAgent, ShareProgress…) và 1 modal `z-[60]`
  (QuickActions). Nghĩa là **mọi toast hiện lên trong lúc một modal đang mở đều nằm SAU lớp phủ
  và người dùng không nhìn thấy gì** — kể cả toast báo lỗi. Đây là lỗi im lặng đúng nghĩa: không
  gãy build, không cảnh báo, chỉ là thông báo biến mất.
- **Kiểm chứng bằng trình duyệt thật:** đo `getComputedStyle` của khung toast trên app đang
  chạy → `z-index = 100`. Cùng với chứng cứ diff CSS (rule KHÔNG tồn tại ở bản build cũ), điều
  này xác nhận trạng thái trước đây là `auto`.
- **Test chặn mới** (`packages/core-ui/tailwindContent.test.ts`, 3 test): bắt buộc **cả
  `apps/dhcb` lẫn `apps/hub`** có glob trỏ tới `packages/core-ui/`, kèm một test canh chính hai
  class từng chết lặng (`z-[100]`, `theme-light:text-red-800`) để test không trở thành vô nghĩa.
  **Đã kiểm chứng test không rỗng:** gỡ glob ra thì đỏ đúng chỗ, khôi phục thì xanh.
- **Bài học ghi lại:** class Tailwind dùng trong `packages/` mà không nằm trong `content` glob sẽ
  **biến mất không một tiếng động**. Đây là loại lỗi không cổng nào của dự án bắt được trước đó —
  nay đã có cổng.
