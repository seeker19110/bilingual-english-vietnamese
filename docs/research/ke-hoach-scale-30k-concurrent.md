# Kế hoạch mở rộng: đáp ứng 30.000 người dùng ACTIVE CÙNG LÚC

> Soạn 2026-07-25. Mục tiêu: nâng hạ tầng từ "1 VPS / 1 tiến trình fork" (đủ ~vài trăm–1.000
> đồng thời) lên **30.000 người dùng đồng thời (concurrent)**. Đây là tài liệu KẾ HOẠCH — chưa
> thực thi. Cần người dùng duyệt phạm vi + ngân sách trước khi bắt tay (cổng giai đoạn, CLAUDE.md §3).

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

## 4. Ước lượng tài nguyên (thô — cần k6 xác nhận)

- **App**: giả định ~1.500–3.000 req đang bay đồng thời. Mỗi Node instance IO-bound gánh ~1–2k kết nối → cần **~8–16 vCPU** tổng cho tầng app (vd 2–4 máy 4 vCPU), có headroom.
- **Redis**: 1 node (HA nếu cần) — tải rate limit + cache nhẹ với RAM.
- **Postgres**: 1 primary khoẻ (4–8 vCPU) + 1 replica; PgBouncer gom kết nối.
- **AI/chi phí**: **ràng buộc lớn nhất** — phải chốt ngân sách/ngày. Cache + queue để chặn trần.

## 5. Rủi ro & điểm cần bạn quyết

1. **Ngân sách hạ tầng + AI/tháng** — 30k concurrent là quy mô tốn kém; dự án đang "miễn phí cộng đồng". Cần con số trần.
2. **Nền tảng deploy**: giữ VPS thủ công (Nginx+PM2) hay chuyển container/managed (Neon/Upstash/Fly/K8s)? Ảnh hưởng toàn bộ cách làm GĐ1–2.
3. **Tự host hay thuê quản lý** Postgres/Redis (đánh đổi công sức vận hành vs chi phí).
4. Cluster mode từng crash — GĐ1 bước build TS→JS là cách gỡ đã phân tích, cần thực nghiệm lại cẩn thận.

## 6. Đề xuất bắt đầu

Làm **GĐ 1** trước (đa tiến trình + Redis rate limit) vì nó là nền cho mọi bước và rủi ro thấp,
đo được ngay. Nhưng **trước GĐ1 cần bạn chốt mục 5.1 (ngân sách) và 5.2 (nền tảng deploy)** —
hai quyết định này định hình cách triển khai.
