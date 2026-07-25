# Lộ trình kỹ thuật: 100k → 200k → 1 triệu active tự host

> Nối tiếp `docs/research/ke-hoach-scale-30k-concurrent.md` (mục tiêu gốc 50k). Tài liệu này
> **KHÔNG xét ngân sách** — chỉ xét khả thi kỹ thuật khi tự host, và **cảnh báo rủi ro an toàn**
> (mất dữ liệu, sập dịch vụ, vận hành quá tải con người) ở từng mốc. Ngân sách là quyết định
> riêng của người dùng, không phải điều kiện chặn ở đây.

## Nguyên tắc xuyên suốt

1. **Không nhảy cóc mốc.** Mỗi mốc phải đo bằng k6 thật (`scripts/load-test/k6-baseline.js`)
   trước khi coi là đạt — không suy diễn từ mốc trước.
2. **Mỗi mốc thêm 1 lớp phức tạp vận hành mới.** Càng lên cao, số việc có thể tự làm 1 mình càng
   giảm — tới 1 triệu, tự host AN TOÀN gần như chắc chắn cần ≥1 người phụ trách hạ tầng full-time
   (không phải cảnh báo ngân sách, mà cảnh báo **rủi ro vận hành**: 1 người không kịp phản ứng sự
   cố 24/7 ở quy mô này).

---

## Mốc 100k concurrent

**Thay đổi so với 50k:** chủ yếu nhân đôi số máy, không đổi kiến trúc.

- Tầng app: 6-8 VPS app (thay vì 3-4), LB thật (Nginx/HAProxy) đã cấu hình ở mục 11 hướng dẫn
  50k — không có gì mới về logic, chỉ thêm máy.
- Tầng DB: 1 primary + **≥1 replica đã bật thật** (code đã sẵn sàng — `getPgReadPool()`, PR
  #329) — route toàn bộ truy vấn đọc nặng (dictionary nếu sau này chuyển vào DB, leaderboard,
  progress tổng hợp) qua đây.
- Redis: cân nhắc Redis Sentinel (2-3 node) để có failover tự động — 1 node đơn ở mốc này bắt
  đầu là điểm chết đáng lo (rate limit + cache TTS/pronunciation phụ thuộc hoàn toàn vào nó).
- AI: bật `AI_CONCURRENCY_*` (đã có code, PR #329) — bắt buộc thật sự ở mốc này, không chỉ
  "chuẩn bị sẵn" nữa, vì tần suất đụng rate limit nhà cung cấp tăng tuyến tính theo user.

**⚠️ Cảnh báo an toàn:** nếu chưa bật Sentry (vẫn là nợ kỹ thuật) — ở 100k, sự cố sẽ xảy ra
THƯỜNG XUYÊN hơn nhiều so với hiện tại mà không ai biết cho tới khi người dùng report. Bắt buộc
phải bật trước khi lên mốc này, không phải tuỳ chọn nữa.

## Mốc 200k concurrent

**Thay đổi kiến trúc thật sự bắt đầu ở đây:**

- **Hàng đợi cho AI (BullMQ hoặc tương đương) trở thành bắt buộc, không còn là lựa chọn.** Ở
  200k, số request đồng thời gọi AI đủ lớn để concurrency limiter (chặn tại chỗ, giữ request
  đợi) bắt đầu gây timeout hàng loạt phía client thay vì chỉ làm chậm — cần chuyển sang mô hình
  hàng đợi thật (client nhận "đang xử lý", poll hoặc WebSocket nhận kết quả). **Đây LÀ breaking
  change UX** (đã nêu ở GĐ3) — cần thiết kế lại luồng Chat/Speaking phía client, không chỉ backend.
- **Phân vùng bảng nóng theo thời gian** (`daily_usage`, có thể cả `chat_sessions`/
  `speaking_sessions`) — Postgres partitioning theo tháng/quý, giảm kích thước index phải quét,
  tăng tốc query + dọn dữ liệu cũ (drop cả partition thay vì DELETE hàng loạt).
- **Kết nối DB**: PgBouncer 1 tầng có thể không đủ — cân nhắc PgBouncer nhiều tầng hoặc
  `pgcat` (hỗ trợ sharding-aware routing tốt hơn) nếu tách nhiều Postgres theo vùng dữ liệu.
- **Cache Redis**: cân nhắc Redis Cluster (sharding thật, không chỉ Sentinel failover) nếu 1
  node đơn (dù có Sentinel) bắt đầu chạm giới hạn CPU/băng thông mạng.

**⚠️ Cảnh báo an toàn nghiêm trọng:** Postgres partitioning và chuyển sang hàng đợi là các thay
đổi **có thể mất dữ liệu hoặc gây downtime dài nếu làm sai** (không giống các bước ở 50k-100k,
vốn chỉ thêm máy). **Bắt buộc test đầy đủ trên môi trường staging/VM riêng trước khi áp production
— không làm trực tiếp trên dữ liệu thật.**

## Mốc 1 triệu active

Đây không còn là "thêm máy" — là **kiến trúc khác hẳn**, dù vẫn tự host được:

- **Postgres HA + sharding thật**: Patroni (tự động failover primary) + Citus hoặc sharding tay
  theo `user_id` (mỗi shard là 1 cụm Postgres riêng, ứng dụng biết route theo hash user_id).
  Đây là thay đổi lớn nhất — ảnh hưởng MỌI query trong `api/_lib/*.ts` hiện đang giả định 1 DB
  duy nhất.
- **Hàng đợi AI phân tán thật** (BullMQ + Redis Cluster làm broker, nhiều worker process/máy
  riêng, tách khỏi tiến trình phục vụ HTTP).
- **CDN edge mạnh hơn**: audio TTS/pronunciation gần như 100% phải phục vụ từ cache CDN
  (Cloudflare R2 + cache rule tối ưu), Node hầu như không bao giờ cache-miss ở steady state.
- **Multi-region cân nhắc** nếu người dùng trải nhiều múi giờ/khu vực địa lý xa (độ trễ mạng
  transatlantic/transpacific bắt đầu đáng kể) — tăng độ phức tạp vận hành rất nhiều (đồng bộ dữ
  liệu giữa vùng, latency ghi).
- **Giám sát 24/7 thật** (không chỉ Sentry bắt lỗi — cần alert PagerDuty/tương đương, người trực
  ca) — ở quy mô này, downtime 10 phút ảnh hưởng hàng chục nghìn người dùng cùng lúc.

**⚠️ Cảnh báo an toàn nghiêm trọng nhất:** tự host ở quy mô 1 triệu active **AN TOÀN chỉ khi có
đội vận hành chuyên trách** (không phải 1 người kiêm nhiệm). Rủi ro thật nếu cố tự host với nhân
sự không đủ: mất dữ liệu do sharding/failover cấu hình sai, downtime kéo dài vì không ai trực khi
sự cố xảy ra ngoài giờ, chi phí sửa lỗi sau khi mất dữ liệu **cao hơn nhiều** so với chi phí thuê
thêm người/dùng managed service cho riêng tầng DB (dù kiến trúc tổng thể vẫn tự host phần còn lại).
Đây là cảnh báo về **an toàn vận hành**, không phải về tiền — quyết định nhân sự vẫn của bạn.

---

## Việc CÓ THỂ chuẩn bị trước (code), CHƯA cần chờ tới mốc tương ứng

Đã làm (PR #329): `getPgReadPool()`, `AI_CONCURRENCY_*`, `MIGRATE_DATABASE_URL`. Các việc sau
**chưa làm** vì cần quyết định kiến trúc rõ ràng hơn trước khi viết code (tránh viết sai rồi phải
viết lại):

- Thiết kế partitioning cho `daily_usage` (cần biết chu kỳ dọn dữ liệu thật trước khi chọn theo
  tháng hay quý).
- Chọn công nghệ hàng đợi (BullMQ vs khác) — phụ thuộc quyết định UX (poll vs WebSocket) chưa có.
- Chọn chiến lược sharding (Citus vs sharding tay) — phụ thuộc traffic pattern thật đo được ở
  mốc 200k, chưa có số liệu.

Khi tới gần mỗi mốc, quay lại yêu cầu tôi đặc tả chi tiết + implement phần tương ứng.
