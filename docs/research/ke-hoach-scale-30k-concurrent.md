# Kế hoạch mở rộng: đáp ứng 50.000 người dùng ACTIVE CÙNG LÚC

> Soạn 2026-07-25, **cập nhật mục tiêu 30k → 50.000 concurrent cùng ngày** (giữ tên file cũ để
> không vỡ liên kết — nội dung đã cập nhật). Mục tiêu: nâng hạ tầng từ "1 VPS / 1 tiến trình
> fork" (đủ ~vài trăm–1.000 đồng thời) lên **50.000 người dùng đồng thời (concurrent)**, trong
> **ngân sách đã chốt: $2.000/tháng hạ tầng + AI ≤ ~$1,67/user/tháng** (xem mục 5.1). Đây là tài
> liệu KẾ HOẠCH — GĐ1 đã xong (PR #321, #322), GĐ2–5 chưa làm.

## 0. TL;DR

Kiến trúc hiện tại **không** chịu nổi 30k đồng thời vì 5 nút thắt cứng (đã đối chiếu code thật):

| #   | Nút thắt                                                | Bằng chứng trong code                          | Trần hiện tại                          |
| --- | ------------------------------------------------------- | ---------------------------------------------- | -------------------------------------- |
| 1   | 1 tiến trình Node, fork mode, 1 core                    | `ecosystem.config.cjs` (không set `instances`) | ~1 core JS                             |
| 2   | Pool Postgres `max: 10`                                 | `api/_lib/pgPool.ts:19`                        | 10 query đồng thời                     |
| 3   | Rate limit in-memory `Map`                              | `api/_lib/security.ts:68`                      | Vỡ khi chạy >1 instance                |
| 4   | VPS dùng chung với app "xboss"                          | `ecosystem.config.cjs` (PORT 3001)             | Không tài nguyên riêng                 |
| 5   | Gọi AI trả phí đồng bộ mỗi request (Claude/Whisper/TTS) | `api/ai.ts`, `api/stt.ts`, `api/tts.ts`        | Trần chi phí + rate limit nhà cung cấp |

Điểm mấu chốt: **30k concurrent KHÔNG phải 30k request/giây**. Nếu mỗi người thao tác ~1 lần / 30–60s,
tải nền ~500–1.000 req/s; nhưng lời gọi AI kéo dài 1–5s nên số **request đang bay đồng thời** có thể
1.000–3.000. Con số này quyết định số instance và độ rộng pool/queue.

## 1. Nguyên tắc thiết kế

1. **Không viết lại app** — giữ nguyên logic handler `api/*`, chỉ đổi cách _chạy_ và _chia tải_.
2. **Stateless hoá tiến trình** — mọi state chia sẻ (rate limit, cache, session tạm) ra Redis, để chạy N instance sau load balancer.
3. **Tách phần đắt/chậm (AI) khỏi đường request đồng bộ** khi có thể — cache mạnh + hàng đợi.
4. **Đo trước khi mở rộng** — dựng load test (k6) làm thước đo mỗi giai đoạn, không "mở rộng mù".
5. **Chi phí là ràng buộc số 1** — dự án miễn phí cho cộng đồng; 30k concurrent gọi AI có thể tốn hàng nghìn USD/ngày nếu không cache/giới hạn. Phải chốt ngân sách + hạn mức trước.

## 2. Kiến trúc đích (tóm tắt)

```
                 Cloudflare (CDN + WAF + rate limit biên)
                          │
                    Nginx / LB (nhiều máy)
                          │
        ┌──────── N × Node instance (app, stateless) ────────┐
        │                    │                               │
     Redis (cache +      PgBouncer  ──►  Postgres primary  ──► read-replica(s)
     rate limit +           │
     queue)             Object storage (R2/S3) + CDN cho audio
        │
     Worker pool (BullMQ) ──► gọi AI (Claude/Whisper/TTS) bất đồng bộ
```

## 3. Lộ trình theo giai đoạn (ưu tiên theo đòn bẩy/chi phí)

### GĐ 1 — Cho phép chạy đa tiến trình + đa máy (nền tảng bắt buộc)

Mục tiêu: gỡ nút thắt #1, #3. Đây là điều kiện tiên quyết cho mọi bước sau.

1. **Bước build TS→JS** (`tsc`/esbuild ra `dist/`) rồi chạy `node dist/server.js` thay `tsx`.
   → Gỡ đúng nguyên nhân cluster mode crash trước đây (xung đột `--import tsx` + Node cluster).
2. Bật **PM2 cluster mode** `instances: 'max'` (hoặc chạy container + orchestrator). Tận dụng mọi core.
3. **Redis** (self-host hoặc Upstash) → chuyển rate limit `Map` (`api/_lib/security.ts`) sang Redis
   để đúng khi chạy nhiều instance. Đưa mọi state tạm khác vào Redis.
4. Kiểm chứng: chạy 2–4 instance sau Nginp, xác nhận rate limit + auth hoạt động đồng nhất.

**DoD GĐ1:** app chạy ≥ N instance stateless, rate limit toàn cụm đúng, không hồi quy chức năng.

### GĐ 2 — Tầng dữ liệu chịu tải

Mục tiêu: gỡ nút thắt #2.

1. **PgBouncer** (transaction pooling) trước Postgres — hàng nghìn client → ít kết nối thật.
2. Nâng `max` pool theo instance cho hợp PgBouncer; đặt statement/idle timeout.
3. Tách **Postgres ra máy riêng** (rời VPS dùng chung) — cân nhắc DB có quản lý (Neon/RDS) có sẵn replica + backup.
4. **Read-replica** cho truy vấn đọc nặng (leaderboard, dictionary, progress).
5. Rà index cho các truy vấn nóng (`daily_usage`, `profiles`, `learning_progress`).

**DoD GĐ2:** chịu ≥ 2.000 query đồng thời không cạn kết nối; p95 truy vấn < 50ms ở tải mục tiêu.

### GĐ 3 — Cắt tải AI (chi phí + độ trễ)

Mục tiêu: gỡ nút thắt #5 — quan trọng nhất về tiền.

1. **Cache mạnh TTS** (đã có cache mã hoá — mở rộng), phục vụ audio qua **R2 + CDN** (`STORAGE_DRIVER=r2`), không qua Node.
2. **Cache dictionary/pronunciation** ở Redis + CDN (nội dung tĩnh, dùng lại cao).
3. **Hàng đợi (BullMQ) cho STT/chat/TTS**: request đẩy vào queue, worker pool xử lý, giới hạn concurrency gọi nhà cung cấp → không vượt rate limit Anthropic/Groq/Google, không sập khi tải đỉnh.
4. **Trần chi phí + hạn mức**: giữ đếm lượt server (đã có `usage.ts`), thêm **circuit breaker** khi chi phí/ngày chạm ngưỡng.
5. Cân nhắc model rẻ hơn/self-host STT (Whisper) nếu chi phí Groq/OpenAI vượt ngân sách.

**DoD GĐ3:** ≥ 70% lượt TTS/dictionary phục vụ từ cache/CDN; gọi AI có trần concurrency; có dashboard chi phí.

### GĐ 4 — Quan sát & kiểm chứng tải

1. Bật **Sentry** (đang nợ — chỉ cần điền DSN) + metrics (Prometheus/Grafana hoặc APM sẵn có).
2. **Load test k6**: kịch bản 30k VU (virtual users) mô phỏng nhịp thao tác thật; tìm trần thật từng tầng.
3. Alert theo p95 latency, tỷ lệ lỗi, độ sâu queue, chi phí AI.

**DoD GĐ4:** k6 30k VU đạt p95 < mục tiêu, tỷ lệ lỗi < 1%, không sập tầng nào.

### GĐ 5 — Vận hành & dự phòng

1. Nginx/LB **≥ 2 máy** (bỏ single point of failure), health check tự loại instance chết.
2. Auto-restart + auto-scale (nếu dùng container/K8s hoặc VPS scaling).
3. Backup Postgres tự động + kiểm thử phục hồi; kế hoạch rollback từng giai đoạn.

## 4. Ước lượng tài nguyên (thô — cần k6 xác nhận, đã cập nhật cho mục tiêu 50k)

- **App**: 50k concurrent → ước ~2.500–4.500 req đang bay đồng thời (x1,67 so với ước lượng 30k
  cũ). Mỗi Node instance IO-bound gánh ~1–2k kết nối → cần **~14–27 vCPU** tổng cho tầng app.
- **Redis**: 1 node (cân nhắc thêm replica nếu ngân sách cho phép) — tải rate limit + cache.
- **Postgres**: 1 primary khoẻ (6–8+ vCPU) + 1 replica; PgBouncer gom kết nối — tải tăng so với
  30k, cần đo thật qua k6 trước khi chốt spec máy.
- **AI/chi phí**: **ràng buộc lớn nhất**, càng găng hơn ở 50k. Cache + queue là BẮT BUỘC, không
  còn là "nên làm" — thiếu chúng, chi phí AI ở quy mô 50k gần như chắc chắn vượt trần $1,67/user.

### 4.1 Ngân sách $2.000/tháng có đủ cho 50k không? (đánh giá 2026-07-25)

**Rất eo hẹp — chỉ khả thi nếu tự host toàn bộ (self-host), không dùng managed service cao cấp.**
Lý do:

- Riêng tầng app đã cần ~14–27 vCPU — tương đương 3–6 VPS cỡ trung (4–8 vCPU/máy) ở nhà cung cấp
  giá rẻ (Hetzner/Vultr/DigitalOcean cỡ $40–80/máy/tháng) → **~$150–450/tháng** chỉ cho tầng app.
- Postgres tự host (primary + replica, máy riêng khỏi VPS dùng chung hiện tại) → **~$150–300/tháng**
  tự host; managed (Neon/RDS cỡ tương đương) có thể **gấp 2–4 lần** con số này ở mức tải 50k.
- Redis tự host: **~$20–60/tháng**; managed (Upstash) tính theo lượt gọi — có thể rẻ hơn ở tải
  vừa nhưng cần ước lượng kỹ ở 50k (rate limit + cache gọi rất nhiều lần/giây).
- Load balancer + Nginx: dùng LB của nhà cung cấp (~$10–20/tháng) hoặc thêm 1 VPS nhỏ.
- CDN/object storage cho audio TTS (Cloudflare R2): egress rẻ/miễn phí phần lớn — không đáng kể.

**Tổng tự host ước tính: ~$350–850/tháng** cho hạ tầng lõi — **nằm trong ngân sách $2.000/tháng**,
còn dư cho dự phòng/tăng trưởng. Nhưng nếu chọn managed service (Neon/Upstash/RDS tier cao, K8s
managed...) ở quy mô 50k, **rất dễ vượt $2.000/tháng chỉ riêng phần DB+cache**, chưa tính app.

**Hệ quả cho quyết định 5.2 (nền tảng deploy):** ngân sách này **gần như ép chọn tự host VPS**
(mở rộng từ VPS hiện có, không chuyển sang managed cao cấp) để nằm trong $2.000/tháng — đổi lại
gánh thêm công vận hành (patch OS, backup thủ công, HA tự dựng). Đây là khuyến nghị, cần bạn xác
nhận trước khi thiết kế chi tiết GĐ2.

## 5. Rủi ro & điểm cần bạn quyết

1. ~~**Ngân sách hạ tầng + AI/tháng**~~ **ĐÃ CHỐT (2026-07-25, xem mục 5.1 dưới)**.
2. **Nền tảng deploy**: giữ VPS thủ công (Nginx+PM2) hay chuyển container/managed (Neon/Upstash/Fly/K8s)? Ảnh hưởng toàn bộ cách làm GĐ1–2. **Vẫn CHƯA chốt** — GĐ1 đã làm trên nền VPS thủ công hiện có (chưa cần quyết định này), nhưng GĐ2 (PgBouncer/read-replica) cần chốt trước khi làm.
3. **Tự host hay thuê quản lý** Postgres/Redis (đánh đổi công sức vận hành vs chi phí). Chưa chốt.
4. Cluster mode từng crash — **ĐÃ LÀM GĐ1** (PR #321), đang vá thêm 1 lỗi phát hiện qua log deploy thật (PR #322, xem PROGRESS.md).

### 5.1 Ngân sách (CHỐT 2026-07-25, quy mô nâng lên 50k cùng ngày)

- **Hạ tầng: $2.000/tháng**, tính cho quy mô **tối đa 50.000 concurrent** (không phải mức khởi
  động rồi tăng dần) — đây là ràng buộc CỨNG cho thiết kế GĐ2 (Postgres/Redis/LB): phải chọn
  giải pháp vừa túi tiền này ở tải đỉnh, không phải "cứ dùng managed service tốt nhất rồi tính
  sau". Xem đánh giá chi tiết ở mục 4.1 — **khả thi nếu tự host, eo hẹp/khó khả thi nếu managed
  cao cấp**.
- **AI: trần ≤ 1/3 doanh thu gói Pro dự kiến ($5/tháng/user) = ~$1,67/user/tháng.** Đây là thay
  đổi mô hình sản phẩm quan trọng: **đảo ngược quyết định 2026-07-11** ("dự án dùng MIỄN PHÍ cho
  cộng đồng — KHÔNG làm thanh toán Pro tới khi người dùng chủ động yêu cầu lại", xem CLAUDE.md
  mục 13 + PROGRESS.md mục "Việc còn dang dở" #3). Người dùng dự án đã chủ động yêu cầu lại
  (2026-07-25) — nhưng **thanh toán là 1 trong các việc CLAUDE.md mục 12 bắt buộc dừng lại hỏi
  trước khi làm** ("đụng bảo mật, thanh toán, dữ liệu người dùng thật"). Việc thi hành gói Pro
  $5/tháng (chọn cổng thanh toán, schema, luồng nâng/hạ cấp, thuế/hoá đơn nếu có...) là **một dự
  án riêng, cần đặc tả riêng** — KHÔNG nằm trong phạm vi kế hoạch scale 30k concurrent này. Kế
  hoạch này chỉ DÙNG con số $1,67/user/tháng làm trần thiết kế cho GĐ3 (cache/queue/circuit
  breaker chi phí AI), không tự ý triển khai thu phí.

## 6. Đề xuất bắt đầu

**GĐ 1 đã xong** (PR #321 merged, PR #322 đang vá 1 lỗi phát hiện qua log deploy thật — xem
PROGRESS.md). Ngân sách (5.1) đã chốt. Còn thiếu trước khi làm GĐ2: chốt mục 5.2 (nền tảng
deploy Postgres/Redis) — so sánh chi phí cụ thể trong ngân sách $2.000/tháng. Việc thu phí Pro
(để hiện thực hoá trần ngân sách AI 5.1) là việc riêng, cần bạn xác nhận có muốn bắt đầu đặc tả
tính năng đó ngay bây giờ hay để sau khi xong hạ tầng scale.
