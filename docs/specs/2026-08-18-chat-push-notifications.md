# Feature spec: Real-time Chat Offline Web Push Notifications

| Thuộc tính   | Giá trị                         |
| ------------ | ------------------------------- |
| Issue        | #606                            |
| Spec owner   | Antigravity AI & Platform Lead  |
| Trạng thái   | **Approved for implementation** |
| Người duyệt  | Core Architecture Team          |
| Ngày duyệt   | 2026-08-18                      |
| Lần cập nhật | 2026-08-18                      |

## 1. Tóm tắt quyết định

Tích hợp Web Push Notifications cho hệ thống chat 1-1 giữa người dùng. Khi có tin nhắn mới từ bạn bè gửi qua WebSocket hoặc REST API, nếu người nhận đang ngoại tuyến (không có active WebSocket connection), backend tự động gửi Web Push Notification dẫn thẳng tới phòng chat `/tin-nhan?roomId=<roomId>`.

## 2. Luồng hoạt động

1. Người dùng A gửi tin nhắn tới phòng DM `roomId`.
2. Backend lưu tin nhắn vào CSDL PostgreSQL và phát sinh sự kiện `message`.
3. Backend kiểm tra danh sách thành viên còn lại trong phòng (Người dùng B).
4. Kiểm tra presence: Nếu Người dùng B không kết nối WebSocket (`localSockets` / Redis presence rỗng):
   - Truy vấn bảng `push_subscriptions` lấy các subscription còn hiệu lực của B.
   - Gửi payload push qua `web-push`:
     ```json
     {
       "title": "Tin nhắn mới từ <Tên Người Gửi>",
       "body": "<Nội dung tin nhắn (đã qua lọc nội dung)>",
       "url": "/tin-nhan?roomId=<roomId>",
       "tag": "chat-room-<roomId>",
       "icon": "/icons/icon-192.png"
     }
     ```
5. Nếu subscription trả về `410 Gone` hoặc `404 Not Found`, backend tự động xóa subscription hỏng.

## 3. Bảo mật & Giới hạn

- Giới hạn tần suất: Không gửi dồn dập nhiều push cho cùng 1 phòng chat trong khoảng thời gian < 10 giây (debounce/cooldown).
- Nội dung: Tuân thủ content moderation masking (hiển thị `***` cho từ nhạy cảm nếu đã bị lọc).

## 4. Test plan & Verification

- Unit test mock `webpush.sendNotification` khi gửi tin nhắn chat cho user offline.
- Unit test verify không gửi push nếu user đang online trong WebSocket room.
