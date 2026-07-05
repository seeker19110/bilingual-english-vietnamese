# WIP — thay 409 từ (chưa merge vào từ điển thật)

Thư mục tạm, KHÔNG phải một phần của app — chỉ để không mất tiến độ khi phiên làm việc bị dừng
giữa chừng do chạm giới hạn sử dụng (xem `PROGRESS.md` mục "⏸️ ĐANG LÀM DỞ").

- `selected-409.csv` — 409 từ CEFR-J chọn để thay thế 409 từ không có nhãn (idiom/từ lóng công
  nghệ) trong `public/data/dictionary/`, đã lọc trùng/rác.
- `entries-batch-0.json`, `entries-batch-2.json`, `entries-batch-3.json` — 307/409 entry đầy đủ
  (word/pos/level/vi/ex_en/ex_vi/ipa_en/ipa_vi), đã kiểm tra khớp 100% word/pos/level + spot-check
  IPA tay, sẵn sàng gộp vào dictionary.
- `batch-1.csv` — 102 từ CÒN LẠI chưa có nội dung (agent bị dừng do hit session limit) — cần giao
  lại agent viết tiếp theo đúng định dạng/quy tắc IPA như PROGRESS.md mô tả.

**Xoá thư mục này sau khi đã gộp xong toàn bộ 409 entry vào `public/data/dictionary/`.**
