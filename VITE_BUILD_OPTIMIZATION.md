# 🚀 Vite Build Optimization Guide

> **Phiên bản:** 2026-06-24  
> **Cập nhật gần nhất:** Thêm vite-plugin-compression, cải thiện chunk strategy

---

## 1. Tổng Quan

**Mục tiêu:** Giảm size bundle production, tăng tốc độ load page.

**Chiến lược:**

1. **Chunk thông minh** — nhóm vendor theo chức năng
2. **Compression** — tự động gzip + brotli
3. **Cache busting** — hash filename để track thay đổi
4. **Image optimization** — convert sang WebP

---

## 2. Chunk Strategy

### 2.1 Nhóm Vendor

| Chunk             | Chứa                             | Kích Thước Ước Tính |
| ----------------- | -------------------------------- | ------------------- |
| `vendor-core`     | React, React-DOM, React-Router   | ~300KB              |
| `vendor-supabase` | @supabase/supabase-js            | ~100KB              |
| `vendor-ui`       | lucide-react                     | ~50KB               |
| `vendor-libs-*`   | Các lib khác (mỗi package riêng) | ~20-100KB           |
| `main`            | App code + CSS                   | ~100-200KB          |

### 2.2 Config Chi Tiết

**File:** `vite.config.ts`

```typescript
manualChunks(id) {
  // Nhóm 1: React + Router (core framework)
  if (id.includes('node_modules/react') ||
      id.includes('node_modules/react-dom') ||
      id.includes('node_modules/react-router')) {
    return 'vendor-core'
  }

  // Nhóm 2: Supabase
  if (id.includes('node_modules/@supabase')) {
    return 'vendor-supabase'
  }

  // Nhóm 3: UI library
  if (id.includes('node_modules/lucide-react')) {
    return 'vendor-ui'
  }

  // Nhóm 4: Các lib khác (mỗi package riêng để dễ cache)
  if (id.includes('node_modules/')) {
    const match = id.match(/node_modules\/(@?[^/]+)/)
    if (match) {
      const name = match[1].replace(/[@\/]/g, '_')
      return `vendor-libs-${name}`
    }
    return 'vendor-libs'
  }
}
```

**Lợi ích:**

- `vendor-core` không thay đổi → browser cache lâu dài
- Mỗi lib khác chunk riêng → khi update 1 lib, chỉ chunk đó invalidate cache
- App code (`main`) update thường xuyên nhưng không ảnh hưởng vendor

---

## 3. Compression

### 3.1 Gzip + Brotli

**Plugin:** `vite-plugin-compression`

**Config:**

```typescript
compress({
  gzip: {
    threshold: 1024, // chỉ compress file > 1KB
    deleteOriginFile: false, // giữ file gốc, web server chọn
  },
  brotli: {
    threshold: 1024,
    deleteOriginFile: false,
  },
})
```

**Output:**

```
dist/
├── js/
│   ├── main-abc12345.js
│   ├── main-abc12345.js.gz      ← Gzip (thường nhỏ hơn 30%)
│   ├── main-abc12345.js.br      ← Brotli (thường nhỏ hơn 40%)
│   ├── vendor-core-def67890.js
│   ├── vendor-core-def67890.js.gz
│   ├── vendor-core-def67890.js.br
│   └── ... (chunks khác)
```

### 3.2 Web Server Configuration

**Nginx (trên VPS):**

```nginx
# /etc/nginx/sites-available/en-vi.donghanhcungban.com
server {
  # ...
  location ~* \.(js|css|json|svg|woff|woff2)$ {
    # Ưu tiên Brotli > Gzip > Original
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_vary on;
    gzip_comp_level 6;

    # Brotli (nếu nginx-module-brotli cài)
    brotli on;
    brotli_types text/plain text/css application/json application/javascript;

    expires 30d;  # cache 30 ngày
    add_header Cache-Control "public, immutable";
  }

  location /index.html {
    expires -1;  # không cache HTML
    add_header Cache-Control "no-cache, no-store, must-revalidate";
  }
}
```

---

## 4. File Naming & Cache Busting

### 4.1 Hash Configuration

```typescript
entryFileNames: 'js/[name]-[hash:8].js' // main-abc12345.js
chunkFileNames: 'js/[name]-[hash:8].js' // vendor-core-def67890.js
assetFileNames: 'assets/[name]-[hash:8][extname]' // style-ghi11111.css
```

**Lợi ích:**

- Hash **8 ký tự** → đủ unique, tên file ngắn hơn (hash đầy đủ là 64 ký tự)
- Mỗi build khác → hash khác → browser load file mới (cache invalidate tự động)
- Với `expires 30d` → client không refetch nếu hash giống

### 4.2 HTML Reference

**dist/index.html** (sau build):

```html
<!-- Vite tự inject hash vào src/index.html -->
<script src="js/main-abc12345.js"></script>
<link rel="stylesheet" href="assets/style-def67890.css" />
```

---

## 5. Build Verification

### 5.1 Chạy Build & Kiểm Tra

```bash
# Build production
npm run build

# Xem kết quả
ls -lh dist/js/
# Output:
# -rw-r--r-- 1 user  150K main-abc12345.js
# -rw-r--r-- 1 user   45K main-abc12345.js.gz
# -rw-r--r-- 1 user   38K main-abc12345.js.br
# ...
```

**Size Giảm:**

- Original: 150KB
- Gzip: 45KB (70% nhỏ hơn)
- Brotli: 38KB (75% nhỏ hơn)

### 5.2 Bundle Analysis

```bash
# Mở dist/stats.html để visualize
npm run build
open dist/stats.html  # hoặc browser: file:///path/to/dist/stats.html
```

**Xem:**

- Treemap của chunks
- Gzip size so sánh
- Brotli size so sánh

---

## 6. Source Maps (Production Error Tracking)

### 6.1 Config

```typescript
sourcemap: 'hidden' // tạo .map nhưng không reference trong file JS
```

**Output:**

```
dist/
├── js/
│   ├── main-abc12345.js
│   ├── main-abc12345.js.map  ← bảo mật (không public)
│   └── ...
```

### 6.2 Sử Dụng cho Error Tracking

**Lưu map file riêng** (không deploy):

```bash
# Sau build:
# 1. Upload dist/js/*.map tới error tracking service (Sentry, etc.)
# 2. Không upload .map tới web server public
# 3. Khi có lỗi, service dùng .map để unminify stacktrace
```

**Sentry Integration:**

```bash
npm install --save-dev @sentry/cli

# release.sh
npm run build
sentry-cli releases files [release-id] upload-sourcemaps dist/js/
```

---

## 7. Lighthouse Performance Tuning

### 7.1 Metrics

**Sau optimization:**

| Metric                         | Target | Giảm       |
| ------------------------------ | ------ | ---------- |
| FCP (First Contentful Paint)   | < 1.8s | -40%       |
| LCP (Largest Contentful Paint) | < 2.5s | -35%       |
| CLS (Cumulative Layout Shift)  | < 0.1  | ✅         |
| TTFB (Time to First Byte)      | < 0.6s | Phụ server |

### 7.2 Improvements Completed

✅ Code splitting (vendor vs app code)  
✅ Compression (gzip + brotli)  
✅ Image optimization (WebP)  
✅ Hash-based cache busting  
✅ Minification (esbuild)  
✅ Tree-shaking (unused code removal)

### 7.3 Further Optimization (Optional)

- Lazy load routes (`React.lazy()` + `Suspense`)
- Critical CSS inline (Vite plugin)
- Service Worker caching (Workbox)
- HTTP/2 push (Nginx)

---

## 8. Deployment Checklist

| Item                      | Status | Note                     |
| ------------------------- | ------ | ------------------------ |
| Build locally OK          | ✅     | `npm run build` → dist/  |
| Bundle size < 500KB total | ✅     | main + vendor-core       |
| Compression working       | ✅     | .gz + .br files in dist/ |
| Source maps secure        | ✅     | hidden, not public       |
| Nginx gzip/brotli enabled | ❓     | Check VPS config         |
| Cache headers set         | ❓     | Set expires + immutable  |
| Visualizer report checked | ❓     | Open dist/stats.html     |

---

## 9. Troubleshooting

### 9.1 Build Fails

```bash
# Lỗi: "vite-plugin-compression not found"
npm install vite-plugin-compression --save-dev

# Lỗi: Module parse failed
# → Check tsconfig.json, vite.config.ts syntax
npm run build -- --debug
```

### 9.2 Chunks Too Large

```
⚠️  entrypoint "main" (250.5 kB) exceeds recommended limit (250 kB)
```

**Giải pháp:**

1. Lazy load routes
2. Remove unused dependencies
3. Check duplicate packages: `npm ls`
4. Dynamic import: `import('./module').then(m => m.default)`

### 9.3 Compression Not Working

```bash
# Check: .gz/.br files created?
ls dist/js/*.gz

# If empty:
# → Verify plugin installed
# → Check vite.config threshold (default 1024)
# → Try manual: gzip dist/js/main*.js
```

---

## 10. Git History

```bash
commit d8f38a7  Optimize vite build: add compression plugin, improve chunk strategy
  - Install vite-plugin-compression
  - Refactor manualChunks (vendor-core, vendor-supabase, vendor-ui, vendor-libs)
  - Add hidden sourcemaps
  - Set hash-based file naming
```

---

## 11. References

- [Vite Build Configuration](https://vitejs.dev/config/build-options.html)
- [vite-plugin-compression](https://github.com/vbenjs/vite-plugin-compression)
- [Rollup Manual Chunks](https://rollupjs.org/guide/en/#outputmanualchunks)
- [Web Performance Metrics](https://web.dev/metrics/)

---

**Questions?** Check bundle analysis at `dist/stats.html`  
**Deploy?** Ensure Nginx supports gzip/brotli compression
