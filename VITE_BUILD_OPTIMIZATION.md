# Vite Build Optimization

Cấu hình build production trong `vite.config.ts` — mục tiêu: bundle nhỏ, tải nhanh.
Ngân sách bundle được **CI kiểm tra tự động** bằng `size-limit` (xem mục 5), không
phải Lighthouse — xem `LIGHTHOUSE_OPTIMIZATION.md`.

## 1. Chunk strategy (`manualChunks` trong `vite.config.ts`)

| Chunk                   | Chứa                               | Ghi chú                                                         |
| ----------------------- | ---------------------------------- | --------------------------------------------------------------- |
| `vendor-sentry`         | `@sentry/*`                        | Tách riêng vì chỉ tải khi có `VITE_SENTRY_DSN` (dynamic import) |
| `vendor-core`           | react, react-dom, react-router     | Ít đổi → cache trình duyệt lâu                                  |
| `vendor-supabase`       | `@supabase/supabase-js`            |                                                                 |
| `vendor-ui`             | `lucide-react`                     |                                                                 |
| `vendor-misc`           | mọi package `node_modules` còn lại | Gộp 1 file thay vì tách từng package — tránh nhiều request nhỏ  |
| `js/[name]-[hash:8].js` | app code (mỗi route/component)     | Tách theo route qua `React.lazy()`                              |

Dữ liệu lazy-load (từ điển/mẫu câu/bài học) có tiền tố riêng để không trùng tên:
`dict-*`, `pattern-*`, `lesson-*` (xem hàm `chunkFileNames` trong `vite.config.ts`).

## 2. Compression

Plugin `vite-plugin-compression` tự sinh `.gz` + `.br` cho mọi file > 1KB (giữ nguyên
file gốc, web server chọn theo `Accept-Encoding`). Nginx trên VPS cần bật gzip (và
brotli nếu có module) — xem `docs/nginx-cache-headers.conf`.

## 3. Cache busting

`entryFileNames`/`chunkFileNames`/`assetFileNames` đều dùng hash 8 ký tự
(`[name]-[hash:8].ext`) — build khác → hash khác → browser tự tải file mới, không
cần xoá cache tay. Kết hợp Nginx `expires 30d` cho asset có hash, `no-cache` cho
`index.html`.

## 4. Source maps

`sourcemap: 'hidden'` — sinh file `.map` để debug lỗi production nhưng KHÔNG
reference trong file JS public (không lộ source thật cho người dùng). Chưa tự động
upload `.map` lên Sentry (không có bước CI cho việc này) — nếu cần, upload thủ công
khi debug.

## 5. Kiểm tra ngân sách bundle

```bash
npm run build
npm run size          # chạy size-limit, đối chiếu .size-limit.json
```

Ngân sách hiện tại (`.size-limit.json`, đo brotli):

- Initial JS (entry + vendors): ≤ 116 kB
- Initial CSS: ≤ 9.3 kB

CI (`.github/workflows/ci.yml`, job `quality`) chạy `npm run size` trên mọi PR — vượt
ngân sách sẽ fail CI. Xem chi tiết chunk trong `dist/stats.html` sau khi build
(`rollup-plugin-visualizer`).

## 6. Vượt ngân sách? Cách xử lý

1. Lazy load thêm route: `React.lazy()` + `Suspense`.
2. Kiểm tra package trùng lặp: `npm ls <package>`.
3. Dynamic import cho phần ít dùng: `import('./module').then(m => m.default)`.
4. Nếu ngân sách thật sự cần tăng (tính năng mới hợp lý) — sửa `.size-limit.json`
   kèm giải thích trong PR.
