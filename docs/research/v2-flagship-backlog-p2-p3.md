# V2 Flagship Backlog & Nợ Kỹ thuật (Gói P2 & P3)

> Ngày ghi nhận: 2026-08-18  
> Trạng thái: **Technical Debt & Future Backlog (Đã ghi nhận, chờ duyệt triển khai các đợt tiếp theo)**

---

## 1. Gói P2 — Nâng cấp Trải nghiệm Tương tác Đỉnh cao

### P2-1: Full-duplex Voice-to-Voice Streaming

- **Mục tiêu**: Chuyển đổi hội thoại giọng nói sang WebRTC / WebSocket Audio duplex liên tục với độ trễ < 300ms.
- **Nghiên cứu**: Tích hợp OpenAI Realtime API hoặc Gemini Multimodal Live API.
- **Rủi ro & Chi phí**: Chi phí API voice realtime cao hơn ~3–5 lần so với text streaming thông thường $\rightarrow$ Cần gắn circuit breaker và gói Pro/VIP.

### P2-2: Avatar 3D Three.js & Viseme Lip-sync Chuẩn xác

- **Mục tiêu**: Render Avatar 3D phong cách robot nữ viền sáng (WebGL / Three.js / React Three Fiber v8) trực tiếp trên trình duyệt.
- **Đặc tả liên quan**: `docs/research/dac-ta-avatar-3d-chat-luong-cao-2026-07-30.md`.
- **Nghiên cứu**: Đồng bộ Oculus 15 visemes với timestamps từ ElevenLabs TTS.

### P2-3: Tích hợp Hệ sinh thái Ngoài Luồng (Google Calendar, Notion, Trello)

- **Mục tiêu**: Nâng cấp `AutomationGrants` để đồng bộ lịch học vào Google Calendar và xuất việc sang Notion / Trello.
- **Cơ chế an toàn**: Bắt buộc tuân thủ idempotent `ActionReceipt` và cơ chế xác nhận 2 lớp.

---

## 2. Gói P3 — Tối ưu Chi phí Siêu vi mô & Hạ tầng Cực hạn

### P3-1: On-device Edge AI (WebLLM / ONNX Runtime Web)

- **Mục tiêu**: Chạy mô hình ngôn ngữ nhỏ (SLM ~1B-3B parameters) trực tiếp trong trình duyệt bằng WebGPU cho các tác vụ: kiểm tra chính tả, gợi ý từ, phân loại ý định (Intent Routing).
- **Lợi ích**: Giảm 60–80% chi phí gọi cloud API.

### P3-2: Zero-Knowledge Encryption cho Personal Memory Fabric

- **Mục tiêu**: Mã hóa đầu cuối (E2EE) toàn bộ Facts và Memories của người dùng bằng khóa mã hóa dẫn xuất từ mật khẩu (Argon2 / WebCrypto AES-GCM 256-bit).

### P3-3: Cụm Hạ tầng Scale 50k - 100k CCU

- **Mục tiêu**: Triển khai PgBouncer + PostgreSQL Primary/Replica + Redis Cluster phân tán đa vùng.
- **Đặc tả liên quan**: `docs/research/ke-hoach-scale-30k-concurrent.md`.
