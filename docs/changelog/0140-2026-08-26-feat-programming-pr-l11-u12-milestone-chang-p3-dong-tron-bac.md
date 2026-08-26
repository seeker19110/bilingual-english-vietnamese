# feat(programming): PR-L11 — U12 milestone chặng P3, ĐÓNG TRỌN BẬC P3 (2026-08-26)

Bài cuối cùng của bậc P3. Từ đây môn Lập trình có **trọn vẹn ba bậc P1 · P2 · P3** — 35 bài
học đủ khuôn 8 bước, ba chặng dự án trục, và mọi mạch hạ tầng đã dựng xong.

- **Đề ĐỘC LẬP với dự án trục có chủ đích** (sổ chi tiêu web, không phải cửa hàng): dự án
  trục đã có milestone riêng ở chặng P3 của nó, nên bài này là phép thử "tự ráp được từ đầu"
  — cùng cách bài milestone P1-U10 làm (máy bán nước, khác quán nước của dự án trục).
- **Dạy đúng thứ mọi bài luyện nhỏ không dạy được:** khuôn của mọi ứng dụng quản lý — một
  mảng giữ dữ liệu · thêm vào khi người dùng thao tác · **vẽ lại toàn bộ giao diện TỪ dữ liệu
  đó**. Người mới hay làm ngược (vừa push vào mảng vừa tự chèn thẻ), thành hai nơi giữ trạng
  thái rồi lệch nhau; bài chốt thẳng quy tắc "dữ liệu là sự thật duy nhất".
- **Ca ẩn chặn đúng lỗi đó:** bấm nút hai lần với cùng dữ liệu — ai vẽ lại đúng cách thì ra
  hai khoản, ai vừa push vừa chèn thì danh sách nhân đôi.
- **localStorage KHÔNG nằm trong đề chấm** (bộ chạy không có) — dạy ở lý thuyết + việc về
  nhà, đúng luật "không giả vờ" đã đặt ra ở mạch Git U10–U11.
- **Kiểm chứng:** 450 file / **5760 test xanh**; E2E `programming-lesson` có test mới chạy
  code mẫu bài này thật trong Chromium. Branches 90,29%, Initial JS 88,1%.
- **Còn lại của môn:** chặng P4–P5 của dự án trục và nội dung bậc P4 trở lên (thuộc giai đoạn
  sau, cần hạ tầng mới: OOP/test/API/TypeScript).
