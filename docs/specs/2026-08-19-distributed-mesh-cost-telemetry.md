# Feature spec: Distributed WebSocket Mesh & Realtime Cost Telemetry (Platform V4 Phase 5)

| Thuộc tính   | Giá trị                                |
| ------------ | -------------------------------------- |
| Issue        | #v4-05-distributed-mesh-cost-telemetry |
| Spec owner   | Platform Core Team                     |
| Trạng thái   | **Approved for implementation**        |
| Người duyệt  | Architecture Owner                     |
| Ngày duyệt   | 2026-08-19                             |
| Lần cập nhật | 2026-08-19                             |

> Trạng thái: **Approved for implementation** — Mạng lưới WebSocket phân tán & Giám sát chi phí AI thời gian thực.

---

## 1. Tóm tắt quyết định

Xây dựng **Distributed WebSocket Mesh & Realtime Cost Telemetry** — giao thức quản lý kết nối thời gian thực chịu tải cao cho đàm thoại giọng nói, đồ họa Avatar 3D và tương tác Canvas, đồng thời cung cấp hệ thống giám sát chi phí token / micro-USD và độ trễ đa nhà cung cấp (Gemini Live, ElevenLabs, Groq, Whisper) với Circuit Breaker bảo vệ ngân sách người học trong từng phiên.

---

## 2. Vấn đề, người dùng và bằng chứng

- **Khả năng phục hồi kết nối**: Khi học viên đàm thoại trên mạng 4G/WiFi chập chờn, kết nối WebSocket truyền thống dễ bị rớt gói hoặc mất đồng bộ dòng âm thanh/viseme.
- **Kiểm soát chi phí AI**: Các mô hình Realtime Multimodal Voice có chi phí theo giây và token. Cần hiển thị minh bạch cho người học và tự động kích hoạt bảo vệ ngân sách (Budget Quota Guard).

---

## 3. Scope và Yêu cầu Kỹ thuật

### In scope

1. **Hợp đồng Dữ liệu V4.4 (`packages/core-contracts/meshTelemetry.ts`)**:
   - `MeshNodeRoleSchema`, `MeshPeerConnectionSchema`, `RealtimeSessionTelemetrySchema`, `TelemetrySummarySchema`.
2. **Động cơ Quản lý Mạng Lưới & Telemetry Chi Phí (`packages/core-ai/meshTelemetryService.ts`)**:
   - Thuật toán đánh giá độ trễ & chất lượng mạng lưới (`evaluateMeshHealth`).
   - Bộ tính toán chi phí phiên đàm thoại đa provider & Circuit Breaker (`trackLiveSessionCost`).
3. **REST API Handler (`api/mesh-telemetry.ts`)**:
   - `GET/POST /api/mesh-telemetry` hỗ trợ tra cứu chỉ số, ghi nhận telemetry và quản lý ngân sách phiên.
4. **Giao diện Người dùng (`apps/english/src/components/MeshTelemetry/`, `apps/english/src/pages/Companion.tsx`)**:
   - `RealtimeCostTelemetryBadge.tsx`: Huy hiệu chi phí & độ trễ trực quan.
   - `MeshHealthMonitorModal.tsx`: Hộp thoại phân tích độ ổn định mạng lưới.
   - Tích hợp trực tiếp tại trung tâm Bạn Đồng Hành.

---

## 4. Kế hoạch Kiểm thử & Quality Gates

- **Unit & Integration Tests**: 100% tests cho contracts, service logic, API và client api.
- **Quality Gates**: `npm test`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build` đều đạt 100% xanh.
