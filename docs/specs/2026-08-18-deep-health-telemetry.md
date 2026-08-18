# Feature spec: Deep Health & Infrastructure Telemetry API

| Thuộc tính   | Giá trị                         |
| ------------ | ------------------------------- |
| Issue        | #605                            |
| Spec owner   | Antigravity AI & Platform Lead  |
| Trạng thái   | **Approved for implementation** |
| Người duyệt  | Core Architecture Team          |
| Ngày duyệt   | 2026-08-18                      |
| Lần cập nhật | 2026-08-18                      |

## 1. Tóm tắt quyết định

Bổ sung endpoint kiểm tra sức khỏe chuyên sâu `GET /api/health/deep` song song với endpoint nhẹ `GET /api/health` hiện có. Endpoint mới kiểm tra trạng thái sống của CSDL PostgreSQL, Storage R2/Local, Redis (nếu bật), và cấu hình AI keys, hỗ trợ trả về mã HTTP 200 (Healthy) hoặc 503 (Degraded/Down) kèm metadata chi tiết, phục vụ Uptime Monitoring và Ops runbook.

## 2. Vấn đề và mục tiêu

- Hiện tại `/api/health` chỉ trả `process.uptime()` mà không kiểm tra kết nối DB hay Storage. Khi DB rớt kết nối hoặc pool đầy, monitoring bên ngoài vẫn thấy 200 OK.
- Cần endpoint `GET /api/health/deep` đo đạc chính xác:
  - Database PostgreSQL query `SELECT 1` & connection pool stats.
  - File Storage check (R2 hoặc Local VPS Storage).
  - Trạng thái Redis/In-memory rate limiter.
  - Memory RSS, Heap usage, Uptime.

## 3. Đặc tả API

### Endpoint: `GET /api/health/deep`

- **Headers**: Trả về `Cache-Control: no-store`, `Content-Type: application/json`.
- **Response 200 (All healthy)**:

```json
{
  "status": "healthy",
  "timestamp": "2026-08-18T14:45:00.000Z",
  "uptime": 12345.6,
  "memory": {
    "rssMb": 85.2,
    "heapUsedMb": 42.1
  },
  "checks": {
    "database": {
      "status": "up",
      "latencyMs": 2.4,
      "pool": { "total": 5, "idle": 4, "waiting": 0 }
    },
    "storage": { "status": "up", "driver": "r2" },
    "cache": { "status": "up", "type": "in-memory" }
  }
}
```

- **Response 503 (Degraded / Unhealthy)** nếu Database ping thất bại hoặc timeout > 3s.

## 4. Test plan & Verification

- Unit test cho `api/healthDeep.ts` với mock database success và database timeout/error.
- E2E / integration check qua `npm test`.
