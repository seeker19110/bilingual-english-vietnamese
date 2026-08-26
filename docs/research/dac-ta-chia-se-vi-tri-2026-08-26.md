# Đặc tả: Chia sẻ vị trí thời gian thực ("Đi chung") — 2026-08-26

> Trạng thái: ĐÃ TRIỂN KHAI (giai đoạn 1). Xem `PROGRESS.md` mục cùng ngày.
> Điểm chạm code: `postgres/migrations/0068_location_sharing.sql` ·
> `packages/core-location/` · `packages/core-contracts/location.ts` ·
> `apps/server/src/api/platform/location.ts` · `apps/dhcb/src/pages/core/LiveLocation.tsx`

## 1. Vấn đề

Nhóm bạn đi chơi chung (đi phượt, đi hội chợ, đi ăn ở khu đông người) rất hay lạc nhau:
gọi điện thì ồn không nghe được, nhắn "tao đang ở gần cái cây to" thì không ai hình dung ra.
Người dùng cần thấy nhau ĐANG Ở ĐÂU trên bản đồ, ngay lúc này, và **chủ động bật/tắt** được.

## 2. Nghiên cứu — vì sao chọn cách này

**Tham chiếu thị trường.** Google Maps "Share location", Zalo/Messenger "Live Location",
Apple "Find My" đều theo cùng một khuôn: chia sẻ theo **phiên có hạn giờ**, có **công tắc dừng
ngay**, và **không** mặc định bật. Điểm hay nhất đáng học của Google Maps: chia sẻ luôn kèm thời
hạn (15 phút / 1 giờ / đến hết ngày) — người dùng không phải nhớ đi tắt.

**Chọn transport.** Ba phương án cân nhắc:

| Phương án                               | Ưu                                                  | Nhược                                                   |
| --------------------------------------- | --------------------------------------------------- | ------------------------------------------------------- |
| Polling REST đơn thuần                  | Đơn giản nhất, chạy mọi nơi                         | Trễ vài giây, tốn request khi nhóm đông                 |
| SSE (server-sent events)                | Một chiều nhẹ                                       | Vẫn cần REST để gửi lên, thêm một loại kết nối mới      |
| **WebSocket + fallback polling (CHỌN)** | Dự án ĐÃ có sẵn hạ tầng WS + Redis pub/sub cho chat | Mạng công cộng/proxy đôi khi chặn WS → nên có đường lui |

Chọn WebSocket vì `packages/core-chat/wsHandler.ts` + `redisChat.ts` đã giải xong đúng bài toán
khó (auth qua cookie khi upgrade, fan-out giữa nhiều instance PM2). Tính năng mới dùng lại
`publish/subscribeChannel` của core-chat, chỉ khác **kênh theo CHUYẾN** (`loc:session:<id>`)
thay vì theo user. Client **tự quay về polling REST 8 giây/lần** khi WS không mở được — bản đồ
vẫn chạy, chỉ chậm hơn.

**Chọn bản đồ.** Google Maps JavaScript API, nạp bằng thẻ `<script>` LƯỜI (chỉ khi mở màn hình
bản đồ) chứ không qua gói npm — ngân sách bundle của dự án rất mỏng (xem `PROGRESS.md`, mục nợ
kỹ thuật) và script CDN không tính vào bundle. Thiếu key thì màn hình vẫn dùng được: danh sách
khoảng cách + nút "Chỉ đường" mở `google.com/maps/dir` (URL công khai, không cần key).

## 3. Luật riêng tư (phần quan trọng nhất — đừng nới)

1. **Không có chia sẻ vĩnh viễn.** Mọi chuyến bắt buộc có `expires_at` (1 / 4 / 8 giờ). Hết hạn
   là dừng, không cần ai bấm gì.
2. **Không lưu lịch sử hành trình.** Bảng `location.positions` giữ ĐÚNG MỘT dòng cho mỗi người
   trong mỗi chuyến (upsert đè lên). Không ai — kể cả admin — dựng lại được đường đi của ai.
3. **Tắt là xoá, không phải ẩn.** Bấm tắt chia sẻ → server `delete` dòng vị trí ngay
   (`updateSharing`), đồng thời client dừng `watchPosition` (đỡ tốn pin).
4. **Mặc định TẮT.** Tạo chuyến hay vào chuyến đều `sharing_enabled = false` — phải tự bấm bật.
5. **Chế độ gần đúng.** `precision_mode = 'approx'` làm tròn toạ độ về lưới ~500m **ở server**
   trước khi lưu, nên toạ độ chính xác không bao giờ tới máy người khác.
6. **Nhật ký đồng thuận.** `location.consent_log` ghi mọi lần vào/rời/bật/tắt (KHÔNG ghi toạ độ)
   để người dùng tự kiểm được "ai đã thấy mình khi nào".
7. **Kết thúc chuyến xoá sạch** vị trí của tất cả thành viên, và job nền 15 phút/lần
   (`purgeExpiredPositions`) dọn nốt các chuyến hết hạn.

## 4. Mô hình dữ liệu

Schema `location` (migration 0068): `sessions` · `session_members` · `positions` ·
`consent_log`. Chi tiết cột xem ngay trong file migration (có chú thích tiếng Việt).

Vào chuyến bằng **mã mời 6 ký tự** (bộ ký tự bỏ 0/O/1/I/L như `friend_code`), chia sẻ qua link
`/di-chung/<MÃ>`. Cố ý KHÔNG ràng buộc "phải là bạn bè": đi chơi hay có người quen của bạn mình,
người có mã mới vào được và chỉ thấy người trong chuyến đó.

## 5. API

| Method + đường dẫn                   | Việc                                                               |
| ------------------------------------ | ------------------------------------------------------------------ |
| `GET /api/location`                  | Chuyến còn hiệu lực của tôi                                        |
| `GET /api/location?sessionId=`       | Toàn cảnh 1 chuyến (403 nếu không phải thành viên)                 |
| `POST /api/location`                 | Tạo chuyến (tối đa 5 chuyến mở/người)                              |
| `POST /api/location?action=join`     | Vào chuyến bằng mã mời                                             |
| `POST /api/location?action=position` | Gửi vị trí (đường lui của WebSocket)                               |
| `PATCH /api/location?action=sharing` | Bật/tắt chia sẻ, đổi độ chính xác                                  |
| `PATCH /api/location`                | Điểm hẹn / bán kính cảnh báo / gia hạn / kết thúc (chỉ chủ chuyến) |
| `DELETE /api/location?sessionId=`    | Rời chuyến (xoá vị trí của mình)                                   |
| `WS /ws/location`                    | `subscribe` · `position` · `unsubscribe`                           |

Mọi lối vào đều qua `validateAuth()` + rate limit, và **mọi hàm nghiệp vụ tự kiểm lại tư cách
thành viên ở DB** (`getActiveMembership`) — kể cả trên WebSocket đang mở, vì quyền có thể mất
giữa chừng. Gửi vị trí vào chuyến không có quyền trả `200 {ok:false}` chứ không phải 403, để
người ngoài không dò được sessionId nào có thật.

## 6. Chống lạc

- **Khoảng cách tới từng người** tính ngay trên máy (haversine, `geo.ts`) — không tốn request.
- **Cảnh báo đi lạc**: ai cách "mốc" quá `alert_radius_m` (mặc định 300m) thì hiện cảnh báo.
  Mốc = **điểm hẹn** nếu chủ chuyến đã đặt, không thì **tâm nhóm** (trung bình toạ độ).
- **Điểm hẹn** đặt bằng một nút "Đặt điểm hẹn tại đây"; mọi người bấm "Chỉ đường" là mở Google
  Maps dẫn tới đó.
- **Mức pin** của mỗi người hiển thị kèm (Battery Status API, nơi nào không hỗ trợ thì ẩn) —
  biết bạn sắp hết pin thì đừng đứng đợi tin nhắn.

## 7. Tiết kiệm pin & dữ liệu

`watchMyPosition` chỉ gửi lên khi **đã đi ≥ 20m** hoặc **quá 30 giây** kể từ lần gửi trước
(`shouldSendUpdate`, có test ca biên). Tắt chia sẻ → `clearWatch` ngay, không để GPS chạy nền.

## 8. Việc còn để lại cho giai đoạn sau

1. **Chạy nền khi tắt màn hình.** Trình duyệt dừng `watchPosition` khi tab ẩn lâu; muốn chuẩn
   phải có app native hoặc `Background Geolocation` (chưa khả dụng rộng trên trình duyệt). Hiện
   tại người dùng cần để màn hình mở khi cần bám theo nhau — nên ghi rõ trong hướng dẫn.
2. **Đường đi lịch sử theo phiên** (kiểu "xem lại chuyến"): CỐ Ý chưa làm, vì trái luật 2 ở mục 3. Muốn làm phải hỏi ý người dùng và làm dạng opt-in riêng.
3. **Thông báo đẩy khi có người tụt lại** — cần nối vào `packages/core-chat/chatPush.ts`.
4. **Nhóm đông (> ~20 người)**: hiện fan-out mỗi vị trí tới toàn nhóm; đông hơn nên gộp nhịp
   (gửi 1 gói/2 giây cho cả nhóm) thay vì mỗi người một sự kiện.
