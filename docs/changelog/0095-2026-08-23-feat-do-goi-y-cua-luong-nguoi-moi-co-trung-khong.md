# feat: đo gợi ý của luồng người mới có TRÚNG không (2026-08-23)

Migration `0062` + `getIntakeStats()` + `/api/admin-intake-stats` + thẻ "việc đầu tiên" trên trang
chủ. Tách **hai câu hỏi khác nhau** (trộn lẫn là mất cả hai):

1. **Suy luận có đúng không?** → nhận việc CHÍNH / đổi sang lựa chọn khác / bỏ qua.
2. **Có tác dụng thật không?** → làm xong việc đầu **trong 7 ngày**.

Một gợi ý được nhận ngay nhưng không ai làm xong vẫn là gợi ý tồi. Ngược lại, tỷ lệ "đổi việc" cao
KHÔNG hẳn xấu — nghĩa là màn gợi ý đang làm đúng việc của nó (đưa lựa chọn thật), chỉ là thứ tự
xếp chưa chuẩn.

**Ba quyết định đáng nhớ:**

- **Lưu `suggested_task_id` thay vì tính lại.** `buildIntakeResult()` thuần nên hôm nay tính lại
  vẫn đúng — nhưng ngày mai sửa thuật toán là toàn bộ số liệu lịch sử đổi theo và **mất khả năng
  so sánh trước/sau khi cải tiến**.
- **`markTaskDone` có `where task_done_at is null`** — bấm lại không dời mốc; không có điều kiện
  này thì mọi phép đo "trong 7 ngày" đều sai.
- **Mẫu số 0 trả `null`, không phải 0** — "chưa có dữ liệu" và "bằng không" là hai chuyện khác
  nhau, gộp lại là tự lừa mình khi đọc số liệu.

**Thẻ "việc đầu tiên" (`FirstTaskCard`)** là điều kiện cần để chỉ số tồn tại: không có chỗ đánh dấu
xong thì tỷ lệ hoàn thành vĩnh viễn bằng 0 — đo đúng con số 0 rồi tưởng gợi ý dở. Thẻ tự ẩn khi
xong, không nhắc lại, không đếm ngày còn lại (Luật 8: không lấy thời gian người dùng làm chỉ số).

**Trung thực về số liệu:** "đã làm xong" là **tự khai**, không đo được khách quan — ghi thẳng vào
payload API để người đọc số liệu không quên. Thống kê chỉ ĐẾM, không đụng hai cột đã mã hoá (có
test chốt).

**Kiểm chứng:** 5073 test xanh (+9) · a11y 21/21 · **truy vấn thống kê chạy THẬT trên PostgreSQL 16
với dữ liệu dựng sẵn** — người trả lời cách đây 100 ngày bị loại đúng, và người làm xong ở **ngày
thứ 9 KHÔNG** bị tính vào "trong 7 ngày" (đúng chỗ mock không bắt được) · boot check
`/api/admin-intake-stats` trả 401 khi chưa đăng nhập.

**Ghi lại một sai lầm của chính tôi trong lượt này:** một thay thế mã nguồn im lặng không khớp
(prettier đã gộp chữ ký hàm thành một dòng), và tôi đã **chẩn đoán nhầm là `dist/` cũ gây typecheck
xanh giả** — thực ra typecheck luôn trung thực, chỉ là mã nguồn chưa hề đổi. Bài học: script sửa mã
phải `assert` mọi thay thế, và khi typecheck xanh bất ngờ thì nghi mã nguồn trước khi nghi công cụ.
