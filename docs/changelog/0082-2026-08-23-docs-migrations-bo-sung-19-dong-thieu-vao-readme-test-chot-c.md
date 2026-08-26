# docs(migrations): bổ sung 19 dòng thiếu vào README + test chốt chặn (2026-08-23)

**Bối cảnh:** nợ số 3 (cuối) phát hiện khi làm N4.

**Số liệu THẬT sau khi đối chiếu từng file (khác con số ước đoán ban đầu):** không phải thiếu 16
dòng `0044`→`0059` như đã ghi lúc đầu, mà thiếu **19 dòng** — trong đó **3 file CŨ HƠN `0043`**
cũng đang thiếu: `0027_reserved_names.sql`, `0033_email_reminders.sql`,
`0040_sync_user_settings.sql`. (Thư mục còn có SỐ TRÙNG: hai file `0026_*` và hai file `0027_*`
— đã kiểm, cả bốn nay đều có dòng.)

**Đã làm:**

1. Đọc TỪNG file trong 19 file rồi viết mô tả đúng việc nó làm (không đoán theo tên file).
2. Sửa thứ tự `0009`/`0010` bị đảo (lỗi sẵn có, cùng file nên sửa luôn).
3. **Test chốt chặn `scripts/migrations-readme-coverage.test.ts`** — bắt CẢ hai chiều: file
   `.sql` chưa có dòng mô tả, VÀ README còn nhắc file đã bị xoá. Cố ý KHÔNG kiểm nội dung mô tả
   (ép định dạng chỉ gây phiền, không bắt được lỗi thật).

**Vì sao cần test:** đây là kiểu hỏng IM LẶNG — bảng tụt lại 19 file mà không công cụ nào báo,
người đọc README vẫn tưởng mình nắm hết lịch sử schema. Test biến nó thành lỗi thấy ngay ở CI.

**Bằng chứng:** 61 dòng / 61 file, 0 thiếu. Test đã được kiểm là **thật sự bắt lỗi**: cố tình
đổi tên một file trong README → test đỏ đúng cả 2 ca và nêu đúng tên file; khôi phục → xanh lại.
Cổng: typecheck ✅ · lint ✅ · format ✅ · vitest 4951/4951 ✅.
