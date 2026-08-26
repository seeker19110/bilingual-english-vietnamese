# fix(security): Redis — hết báo lỗi giả lúc khởi động + health check thôi nói dối (2026-08-23)

**Bối cảnh:** log production lặp lại `[Security] Redis lỗi (Stream isn't writeable and
enableOfflineQueue options is false) — rate limit tạm dùng Map in-memory mỗi instance`, tức
trong cluster 3 instance hạn mức chống lạm dụng lỏng **gấp 3**.

**Rà ra HAI lỗi, cái thứ hai nặng hơn cái người dùng báo:**

1. **Gọi lệnh Redis khi client chưa `ready`.** `enableOfflineQueue: false` (cố ý, để request
   không phải chờ) nghĩa là lệnh phát ra lúc client còn `connecting`/`reconnecting` sẽ ném
   NGAY đúng câu lỗi trên. Khớp mốc thời gian trong log: PM2 restart 14:31 → lỗi 14:34;
   restart 14:58 → lỗi 14:59. Tức phần lớn là **trục trặc cửa sổ khởi động**, không phải
   Redis chết cả ngày.
2. **`/api/health/deep` NÓI DỐI về cache.** Trường `cache.status` bị **ghi cứng `'up'`**, chỉ
   đọc `REDIS_URL` để đoán _loại_ cache. Redis chết hoàn toàn thì health check VẪN báo
   `up, redis` → mọi cổng giám sát xanh trong khi log đầy lỗi. Đây đúng loại lỗi im lặng làm
   sự cố nằm im.

**Đã làm:**

1. **Chỉ dùng Redis khi `status === 'ready'`** — trong cửa sổ kết nối thì rơi về Map **im
   lặng** (đúng và không đáng báo động); báo động để dành cho lỗi thật.
2. **Log theo CHUYỂN TRẠNG THÁI, không latch vĩnh viễn.** Cờ cũ `warnedRedisFallback` set
   `true` một lần rồi câm mãi: Redis chết lại lần sau không ai biết, mà sống lại cũng không
   ai biết — nhìn log không phân biệt nổi "trục trặc thoáng qua" với "chết cả ngày". Nay có
   `noteRedisDegraded()` + `noteRedisRecovered()`, và có dòng **"Redis đã hoạt động trở lại"**.
3. **`pingRedis()` + `getRedisRuntimeStatus()`** trong `core-auth/security.ts`; `healthDeep`
   nay **PING THẬT**, trả `up` (kèm độ trễ) / `down` (kèm lý do) / `unconfigured`. Redis hỏng
   **KHÔNG** kéo cả hệ thống thành `unhealthy` — rate limit tự rơi về Map, app vẫn phục vụ —
   nhưng phải HIỆN RA.

**Bằng chứng:** 3 test mới cho nhánh cache. Đã kiểm test **thật sự bắt lỗi**: tái tạo bản cũ
(ghi cứng `'up'`) → test đỏ; khôi phục → xanh. Cổng: typecheck ✅ · lint ✅ · format ✅ ·
test **4959/4959** ✅ · build ✅ · size 120.65/123 ✅.

**CÒN LẠI — việc tay, code không quyết được:** bản vá này làm Redis _hết báo lỗi giả_ và
_hiện đúng trạng thái_, nhưng nếu Redis trên VPS thật sự chết thì vẫn phải khởi động nó.
Kiểm bằng `redis-cli ping` (mong đợi `PONG`) và `systemctl status redis-server`; sau khi deploy
bản này, `curl -s localhost:3001/api/health/deep | jq .checks.cache` sẽ nói thẳng up/down.
