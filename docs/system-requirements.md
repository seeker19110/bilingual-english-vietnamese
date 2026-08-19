# Cấu hình Hệ thống, Runtime & Yêu cầu Vận hành (System Requirements)

Tài liệu này đặc tả chi tiết các yêu cầu về phần cứng, môi trường runtime, chính sách phiên bản phần mềm và cấu hình môi trường để phát triển và vận hành hệ thống **Đồng Hành** ổn định, trơn tru và tối ưu chi phí.

---

## 1. Chính sách Phần mềm & Runtime Cốt lõi (Software & Runtime Policy)

> [!IMPORTANT]
> **Quy tắc bất biến (Project Invariant):** Dự án **KHÔNG tự ý nâng cấp** các framework/tooling cốt lõi lên phiên bản mới hơn khi chưa có đánh giá tương thích và phê duyệt kiến trúc. Mọi cài đặt dependencies phải dùng `npm ci` để bám sát `package-lock.json`.

| Thành phần           | Phiên bản cố định              | Lý do & Ràng buộc kỹ thuật                                                                                                        |
| :------------------- | :----------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| **Node.js**          | **v22.x LTS**                  | Chuẩn hóa cho toàn bộ hệ thống ESM, native crypto/fetch, `tsx`, và PM2 Cluster Mode. Không dùng Node 23+ (bản thử nghiệm).        |
| **React**            | **18.3.x**                     | Giữ ổn định với hệ sinh thái UI, Audio streaming, SSE hooks và component lifecycle. Tránh vỡ khi lên React 19.                    |
| **Tailwind CSS**     | **v3.4.x**                     | Dự án xây dựng 5 theme màu ngữ nghĩa và design tokens (`--a-*`, `--z-*`) dựa trên engine Tailwind v3. Không nâng lên Tailwind v4. |
| **ESLint & Tooling** | **ESLint 8 (`.eslintrc.cjs`)** | Giữ tương thích với toàn bộ plugin custom. Không chuyển sang ESLint 9 (Flat config).                                              |
| **PostgreSQL**       | **15+ / 16+**                  | Hỗ trợ đầy đủ JSONB, Full-text search và kết nối an toàn qua connection pool.                                                     |

---

## 2. Cấu hình Máy chủ Vận hành (Server / Production VPS)

Hệ thống backend được thiết kế theo mô hình **Modular Monolith** chạy bằng **PM2 Cluster** phía sau **Nginx Reverse Proxy**.

| Hạng mục             | Cấu hình Tối thiểu (Dev / Staging / Thử nghiệm) | Cấu hình Khuyến nghị (Production ổn định & Tải cao)                      |
| :------------------- | :---------------------------------------------- | :----------------------------------------------------------------------- |
| **Hệ điều hành**     | Ubuntu 22.04 / 24.04 LTS (x86_64)               | Ubuntu 24.04 LTS                                                         |
| **CPU**              | 1 vCPU                                          | **3 – 4 vCPU** _(Khai thác PM2 Cluster Mode `instances: max`)_           |
| **RAM**              | 2 GB _(Cần bật thêm 2GB Swap file)_             | **4 GB – 8 GB** _(Dư dả cho Node workers, Postgres cache và Redis)_      |
| **Ổ cứng (Disk)**    | 20 GB SSD                                       | **40 GB – 80 GB SSD NVMe**                                               |
| **Node.js**          | v22.x hệ thống (`/usr/bin/node`)                | v22.x LTS                                                                |
| **Process Manager**  | PM2 (1 instance / Fork mode)                    | **PM2 Cluster Mode** (3+ workers song song, port 3001)                   |
| **Cơ sở dữ liệu**    | PostgreSQL 15+ (local)                          | PostgreSQL 16+ _(Cấu hình `pgPool` hoặc PgBouncer)_                      |
| **Cache & Realtime** | In-memory Map fallback                          | **Redis 7+** _(Local hoặc cụm riêng, kết nối qua `REDIS_URL`)_           |
| **Web Server**       | Nginx HTTP/1.1                                  | **Nginx HTTP/2** + SSL Let's Encrypt + Cache static assets               |
| **Audio Storage**    | `STORAGE_DRIVER=local` (`/uploads/`)            | **Cloudflare R2** (`STORAGE_DRIVER=r2`) _(Giải phóng I/O và ổ cứng VPS)_ |

> [!NOTE]
> **Thông số máy chủ Production thực tế hiện tại:**
>
> - VPS: 3 vCPU / 3 GB RAM (Ubuntu 24.04).
> - PM2: 3 cluster workers (`english-tutor`, port 3001).
> - PostgreSQL: Database `dhcb`, user `dhcb_app`.
> - Redis: Cấu hình `REDIS_URL` nội bộ xử lý rate-limit và WebSocket pub/sub.
> - Audio Storage: **Cloudflare R2** (`STORAGE_DRIVER=r2`), lưu trữ vĩnh viễn audio cache mã hóa an toàn.

---

## 3. Cấu hình Máy Phát triển (Local Development)

Dành cho lập trình viên tham gia phát triển, biên dịch và chạy bộ kiểm thử toàn diện (> 4.400 unit/integration tests và Playwright E2E):

| Hạng mục             | Cấu hình Tối thiểu              | Cấu hình Khuyến nghị                                           |
| :------------------- | :------------------------------ | :------------------------------------------------------------- |
| **Hệ điều hành**     | Windows 10/11, macOS 12+, Linux | Windows 11 / macOS (Apple Silicon M1+) / Ubuntu 24.04          |
| **CPU**              | 4 Cores                         | **8 Cores / 16 Threads** _(Chạy mượt Vitest parallel workers)_ |
| **RAM**              | 8 GB                            | **16 GB – 32 GB** _(Vite dev server + TypeScript check + DB)_  |
| **Ổ đĩa**            | 10 GB trống                     | SSD NVMe tốc độ cao                                            |
| **Công cụ bắt buộc** | Node.js 22.x, npm >= 10, Git    | Node.js 22.x, Docker Desktop (PostgreSQL local), VS Code       |

---

## 4. Cấu hình Thiết bị Người dùng (Client-Side & End-User)

Hệ thống hoạt động trên nền Web SPA / PWA, tối ưu cho cả Desktop lẫn Thiết bị di động:

- **Trình duyệt Web**:
  - _Tối thiểu_: Chrome / Edge / Brave (Chromium $\ge$ 100), Safari 16+, Firefox 115+.
  - _Khuyến nghị_: **Chromium $\ge$ 113** (Google Chrome, Microsoft Edge) để kích hoạt **WebGPU** cho Edge AI.
- **Phần cứng & Thiết bị ngoại vi**:
  - **Microphone & Loa/Tai nghe**: Bắt buộc khi sử dụng Luyện nói song ngữ, STT và Hội thoại Full-Duplex Realtime Voice.
  - **Card đồ họa hỗ trợ WebGPU (Khuyến nghị)**: Cho phép chạy động cơ **Edge AI** cục bộ ngay trên trình duyệt (kiểm tra ngữ pháp, phân loại ý định trong 0ms, không tốn chi phí API và đảm bảo riêng tư). Nếu thiết bị không hỗ trợ, hệ thống tự động fallback lên Cloud Gateway.
- **Tốc độ Mạng**:
  - Tối thiểu **2 Mbps** (Ping $\le$ 80ms) để đảm bảo truyền tải liên tục dữ liệu âm thanh qua WebSocket và phản hồi SSE Streaming mượt mà.

---

## 5. Danh mục Biến Môi trường (.env Prerequisites)

Các biến môi trường trọng yếu cần thiết lập để hệ thống hoạt động đầy đủ tính năng:

```env
# ── Cơ sở dữ liệu PostgreSQL ──
DATABASE_URL=postgresql://dhcb_app:mat-khau@localhost:5432/dhcb

# ── Redis tập trung (Bắt buộc khi chạy PM2 Cluster nhiều workers) ──
REDIS_URL=redis://:mat-khau-redis@127.0.0.1:6379

# ── Khóa mã hóa Audio Cache AES-256-GCM (32 bytes Base64 cố định) ──
TTS_ENCRYPTION_MASTER_KEY=...

# ── Cổng & Bảo mật Nguồn gọi API ──
PORT=3001
ALLOWED_ORIGINS=https://donghanhcungban.org,https://en-vi.donghanhcungban.org

# ── AI Gateway Providers ──
GEMINI_API_KEY=AIza...
GROQ_API_KEY=gsk_...
GOOGLE_TTS_API_KEY=AIza...

# ── Xác thực Google OAuth ──
GOOGLE_CLIENT_ID=xxxxxxxxxx.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxx.apps.googleusercontent.com
```

---

## 6. Lộ trình Nâng cấp Mở rộng (Scaling Path - GĐ2 > 50k Concurrent)

Khi lưu lượng người dùng tăng trưởng vượt mức chịu tải của 1 máy chủ:

1. **Tách riêng Cụm Cơ sở dữ liệu**: Đặt PostgreSQL trên VPS độc lập (4 vCPU / 8 GB RAM) và cấu hình **PgBouncer** làm cổng connection pool trung gian.
2. **Tách riêng Cụm Redis**: Độc lập hóa Redis Server để làm bus pub/sub cho WebSocket và phân tán rate-limiting đa máy chủ.
3. **Chuyển kho lưu trữ sang Cloudflare R2**: Bật `STORAGE_DRIVER=r2` để lưu trữ vĩnh viễn kho cache audio TTS mà không gây phình dung lượng đĩa của VPS ứng dụng.
