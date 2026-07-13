# ⚠️ Đã chuyển sang `size-limit` — Lighthouse CI KHÔNG còn chạy tự động

Trước đây dự án định dùng Lighthouse CI để chấm điểm Performance/Accessibility/SEO
trong pipeline. **Đã đổi hướng:** Lighthouse không đo được ổn định trong sandbox CI
hiện có, nên ngân sách hiệu năng thật sự đang được gác bằng **`size-limit`** (chặn
bundle JS/CSS phình to) — xem `VITE_BUILD_OPTIMIZATION.md` mục 5 và `PROGRESS.md`.

File này giữ lại vì các quyết định UI/a11y bên dưới **vẫn đúng và đang áp dụng trong
code** — chỉ không còn con số điểm Lighthouse cụ thể để đối chiếu (chưa chạy lại từ
2026-06-24). Muốn tự kiểm tra: `npm run build && npm run preview` rồi mở Chrome
DevTools → Lighthouse (thủ công, không phải bước bắt buộc trước khi merge).

## Các quyết định đã áp dụng trong code

### Cache-Control (Nginx)

File cấu hình: `docs/nginx-cache-headers.conf` — asset có hash cache 1 năm
(`immutable`), `index.html` không cache.

### Google Fonts — preconnect + async load

`index.html` dùng `preconnect`/`dns-prefetch` cho fonts.googleapis.com/gstatic.com,
load CSS font kiểu async (`media="print" onload="this.media='all'"`) + fallback
`<noscript>`.

### JS/CSS bundle

Chunk splitting + compression + Tailwind purge — xem `VITE_BUILD_OPTIMIZATION.md`.
Route nặng nên lazy-load bằng `React.lazy()` + `Suspense` khi thêm mới.

### Animation dùng `transform`/`opacity`

Tránh animate `top`/`left`/`width`/`height` (gây repaint) — dùng `translate`/`opacity`
(GPU-accelerated). Áp dụng cho keyframe CSS tuỳ chỉnh.

### Accessible name cho icon button

Mọi `<button>` chỉ có icon phải có `aria-label` (hoặc `title`) — screen reader không
đọc được icon không tên.

### Zoom mobile — TẮT CÓ CHỦ ĐÍCH (đánh đổi)

`index.html`: `maximum-scale=1.0, user-scalable=no` — giữ layout cố định trên mobile.
Lighthouse sẽ luôn trừ điểm mục "user-scalable=no" vì đây là đánh đổi cố ý, không
phải lỗi. Bù lại: chữ tối thiểu 11px, input 16px (`src/index.css`), double-tap zoom
chặn bằng `touch-action`. Muốn đổi quyết định này: bỏ `maximum-scale=1.0,
user-scalable=no` khỏi viewport meta trong `index.html`.

### Focus + theme-color động

Focus-visible dùng màu accent theo theme (`outline: 2px solid rgb(var(--a-500))`,
`src/index.css`). `<meta name="theme-color">` cập nhật runtime theo theme đang chọn
(`applyTheme()` trong `src/lib/theme.ts`).

### SEO

`robots.txt` (`public/robots.txt`) + `meta description`/`title`/sitemap đã cấu hình —
xem `index.html` và `public/robots.txt`. Open Graph/Twitter Card: chưa thêm, có thể
bổ sung sau nếu cần chia sẻ mạng xã hội đẹp hơn.

## Muốn bật lại Lighthouse CI?

Cần môi trường chạy được Chrome headless ổn định trong CI (sandbox hiện tại không
đáp ứng) — xem ghi chú quyết định trong `PROGRESS.md` trước khi thử lại, tránh lặp
lại lý do đã bỏ.
