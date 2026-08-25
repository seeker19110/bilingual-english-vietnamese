# Tối Ưu Hóa Hiệu Năng & Quy Chuẩn Bundle (Performance & Build Optimization)

> Tài liệu tổng hợp các quyết định kỹ thuật về tối ưu hiệu năng frontend, ngân sách bundle, nén tài nguyên, chiến lược caching và quy chuẩn thiết kế UI/A11y cho nền tảng **Đồng Hành**.

---

## 1. Chiến Lược Phân Tách Bundle (Vite Chunk Splitting)

Cấu hình trong `vite.config.ts` nhằm tối thiểu hóa dung lượng initial bundle và tận dụng tối đa cache trình duyệt:

| Chunk                   | Nội dung & Thư viện                      | Mục đích tối ưu                                                |
| :---------------------- | :--------------------------------------- | :------------------------------------------------------------- |
| `vendor-core`           | `react`, `react-dom`, `react-router-dom` | Thư viện nền tảng ít thay đổi → cache lâu dài trên trình duyệt |
| `vendor-ui`             | `lucide-react`                           | Bộ icon SVG nhẹ                                                |
| `vendor-sentry`         | `@sentry/*`                              | Tải động qua dynamic import chỉ khi có `VITE_SENTRY_DSN`       |
| `vendor-misc`           | Các package phụ trợ còn lại              | Gom 1 file tránh phát sinh quá nhiều HTTP requests nhỏ         |
| `js/[name]-[hash:8].js` | App pages & components                   | Tách theo route qua `React.lazy()` và `Suspense`               |

Dữ liệu tĩnh tải dần (_từ điển, mẫu câu, bài học_) được đặt tiền tố riêng (`dict-*`, `pattern-*`, `lesson-*`) để lazy-load mượt mà.

---

## 2. Nén & Lưu Trữ Đệm (Compression & Caching)

1. **Nén trước lúc build (`vite-plugin-compression`)**:
   - Tự động sinh file nén trước `.gz` (Gzip) và `.br` (Brotli) cho mọi asset > 1KB.
   - Nginx server trên VPS ưu tiên phục vụ file `.br`/`.gz` có sẵn (`docs/nginx-cache-headers.conf`).
2. **Cache Busting**:
   - Tất cả JS/CSS asset có hash 8 ký tự (`[name]-[hash:8].ext`).
   - Nginx cấu hình `Cache-Control: public, max-age=31536000, immutable` cho static assets và `no-cache` cho `index.html`.

---

## 3. Ngân Sách Kích Thước Bundle (Size-Limit CI Guard)

Dự án gác chặn kích thước bundle tự động qua `@size-limit/file` trong CI pipeline:

- **Initial JS (Brotli)**: ≤ 140 kB
- **Initial CSS (Brotli)**: ≤ 11 kB

Kiểm tra cục bộ:

```bash
npm run build
npm run size
```

Báo cáo phân tích trực quan được sinh tự động tại `dist/stats.html` (`rollup-plugin-visualizer`).

---

## 4. Quy Chuẩn Hiệu Năng & Trải Nghiệm Người Dùng (UX/A11y/Web Vitals)

1. **Core Web Vitals**: Hướng tới ngân sách:
   - **LCP** (Largest Contentful Paint) ≤ 2.5s
   - **INP** (Interaction to Next Paint) ≤ 200ms
   - **CLS** (Cumulative Layout Shift) ≤ 0.1
2. **Animation**: Chỉ sử dụng GPU-accelerated CSS properties (`transform`, `opacity`), tránh animate các thuộc tính gây reflow/repaint (`top`, `left`, `width`, `height`).
3. **Typography & Fonts**: Self-host font Inter (`@fontsource-variable/inter`), loại bỏ phụ thuộc vào Google Fonts CDN bên ngoài để tăng tốc độ tải và đảm bảo bảo mật CSP.
4. **Accessible Icon Buttons**: Mọi nút bấm chỉ có icon bắt buộc có `aria-label` cho Screen Reader.
5. **Vùng Chạm Mobile**: Vùng chạm tối thiểu **≥ 44×44px** (`.tap-44` hoặc `h-11 w-11`).
