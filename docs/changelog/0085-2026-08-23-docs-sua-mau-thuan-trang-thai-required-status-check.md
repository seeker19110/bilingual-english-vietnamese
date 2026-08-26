# docs: sửa mâu thuẫn trạng thái required status check (2026-08-23)

**Vấn đề:** hai tài liệu nói ngược nhau về cùng một việc — `CLAUDE.md` mục 13 (#6) ghi branch
protection + CI check bắt buộc "ĐÃ XONG, xác nhận 2026-07-11", còn đặc tả platform mục 5.3 ghi
"VIỆC TAY người dùng, chưa làm được từ phía AI". Phiên sau đọc trúng file nào thì tin file đó.

**Đã hỏi người dùng và được xác nhận: ĐÃ BẬT.** Sửa cả hai tài liệu cho khớp thực tế, và ghi rõ
danh sách check bắt buộc gồm **`quality`, `e2e` VÀ `metadata`** (đặc tả cũ chỉ nhắc 2 check —
thiếu `metadata`, chính là cổng bắt PR có mô tả đầy đủ + liên kết đặc tả).

**Bài học ghi vào đặc tả:** trạng thái VIỆC TAY (thứ chỉ người dùng làm được trên giao diện
GitHub/VPS) phải HỎI người dùng để xác nhận, không suy từ trí nhớ phiên trước — AI không có
cách nào tự kiểm branch protection từ trong phiên (công cụ GitHub sẵn có không đọc được rule).
