# 🎯 Lighthouse Optimization Guide

> **Date:** 2026-06-24  
> **Current Scores:** Performance 73, Accessibility 75, SEO 91

---

## 1. Performance Optimization (73 → 90+)

### 1.1 Cache-Control Headers (Priority: HIGH)

**Problem:** Assets cached for only 1 day; should be 1 year with hash-based filenames.

**Solution:** Apply nginx cache headers (see `docs/nginx-cache-headers.conf`):

```nginx
# Cache file with hash — 1 year (immutable)
location ~* /assets/.*\.[a-f0-9]{8}\.(js|css|woff2)$ {
  expires 365d;
  add_header Cache-Control "public, immutable";
}

# Don't cache index.html
location = /index.html {
  expires -1;
  add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

**Impact:** Save ~500ms on repeat visits (leverage browser cache).

### 1.2 Render-Blocking Resources

#### Google Fonts Optimization

**Before:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter..." />
<!-- blocks render for 920ms -->
```

**After:**
```html
<!-- Preconnect for faster DNS + TCP handshake -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://fonts.gstatic.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- async load with display=swap: fallback system font first -->
<link rel="stylesheet" 
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" 
  media="print" 
  onload="this.media='all'" />

<!-- Fallback for no-JS -->
<noscript>
  <link rel="stylesheet" 
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" />
</noscript>
```

**Impact:** Reduce FCP from 3.7s to <2.5s.

#### CSS Code-Splitting

**Optional:** Inline critical CSS for above-the-fold content

```typescript
// vite.config.ts example
// (Already handled by Vite's code-splitting + compression)
```

### 1.3 JavaScript Bundle Optimization

**Current:** 219 KiB unused JS

**Solutions:**
- ✅ Already implemented: vite manualChunks (vendor-core, vendor-supabase, etc.)
- ✅ Already implemented: Gzip + Brotli compression
- Option: Lazy load routes with `React.lazy()` + `Suspense`

```typescript
// src/App.tsx example
const Chat = lazy(() => import('./pages/Chat'))

<Suspense fallback={<PageLoading />}>
  <Routes>
    <Route path="/chat" element={<Chat />} />
  </Routes>
</Suspense>
```

### 1.4 CSS Bundle Optimization

**Current:** 39 KiB unused CSS

**Already done:** Tailwind CSS purging (automatically removes unused classes in production).

### 1.5 Web Animations

**Problem:** 16 animations not using composited properties (re-layout/repaint).

**Solution:** Use `transform` and `opacity` instead of `width/height/top/left`.

**Before:**
```css
@keyframes fadeIn {
  from { opacity: 0; top: -10px; }  /* causes repaint */
  to { opacity: 1; top: 0; }
}
```

**After:**
```css
@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(-10px);  /* efficient: GPU accelerated */
  }
  to { 
    opacity: 1; 
    transform: translateY(0);
  }
}
```

**Tailwind:** Already using `translate-*` utilities, but verify custom animations.

---

## 2. Accessibility Optimization (75 → 90+)

### 2.1 Accessible Names for Buttons

**Problem:** Buttons without text lack aria-label (screen readers read "button").

**Solution:** Add aria-label to all icon buttons.

```tsx
// BEFORE (bad)
<button>
  <LogOut className="w-4 h-4" />
</button>

// AFTER (good)
<button aria-label="Logout">
  <LogOut className="w-4 h-4" />
</button>

// AFTER (better - with i18n)
<button aria-label={T.logout} title={T.logout}>
  <LogOut className="w-4 h-4" />
</button>
```

**Status:** ✅ Fixed in Layout.tsx (lines 39, 88)

### 2.2 Color Contrast Ratios

**Problem:** text-zinc-500/600 on bg-zinc-950 fails WCAG AAA (7:1 ratio for <14px text).

**Solution:** Upgrade text color class

| Old | New | Reason |
|-----|-----|--------|
| `text-zinc-500` | `text-zinc-400` | Higher contrast |
| `text-zinc-600` | `text-zinc-500` | Higher contrast |

**Affected components:**
- ✅ Layout.tsx: subtitle, usage text, logout button
- ✅ Home.tsx: practice text, language/voice labels, bell icon, chevron icons, tip text
- Todo: Check other pages (Chat.tsx, Learn.tsx, Writing.tsx, Dictionary.tsx)

**How to verify:**
```bash
# Use WebAIM contrast checker
# https://webaim.org/resources/contrastchecker/

# Or check Lighthouse accessibility report
npm run build
# Open http://localhost:5173 in Chrome DevTools → Lighthouse
```

### 2.3 Form Labels and ARIA

**Status:** ✅ No major forms in app (mostly UI controls)

### 2.4 Zoom on mobile — intentionally disabled (trade-off)

**Decision (product):** zoom is **disabled** on mobile so the app keeps a native, fixed
layout (`<meta name="viewport">` keeps `maximum-scale=1.0, user-scalable=no`).

**Trade-off:** Lighthouse a11y will flag *"[user-scalable=no] is used in the <meta name=viewport>"*
and dock the score for that single audit. This is accepted on purpose. Mitigations so legibility
is not hurt:
- Body text floored at ≥11px and inputs at 16px (`src/index.css`) so nothing is too small to read.
- Double-tap zoom blocked via `touch-action: pan-x pan-y`; input focus never triggers iOS zoom (16px font).

> If the priority later flips to a perfect a11y score, drop `maximum-scale=1.0, user-scalable=no`
> from the viewport meta to re-enable pinch-zoom.

### 2.5 Themed focus & dynamic theme-color

- Focus-visible outline uses the active theme accent (`outline: 2px solid rgb(var(--a-500))`)
  so keyboard focus stays clearly visible across all 4 themes.
- `<meta name="theme-color">` is updated at runtime by `applyTheme()` (`src/lib/theme.ts`)
  to match the selected theme (Xanh đêm / Blue sky / Pink / Rực rỡ).

---

## 3. SEO Optimization (91 → 100)

### 3.1 robots.txt Syntax

**Problem:** Lighthouse reported 26 syntax errors in robots.txt.

**Status:** ✅ Fixed: cleaned up formatting, added comments, proper User-agent syntax.

```bash
# Validate robots.txt
# https://www.robotstxt.org/
```

### 3.2 Metadata

**Status:** ✅ Already configured:
- `meta name="description"` (in index.html)
- `title` tag
- Open Graph meta tags (optional, not present)

**Enhancement (optional):**
```html
<!-- Add Open Graph for social sharing -->
<meta property="og:title" content="Gia su tieng Anh AI" />
<meta property="og:description" content="Hoc tieng Anh cung gia su AI..." />
<meta property="og:image" content="https://..." />
<meta property="og:url" content="https://en-vi.donghanhcungban.com" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Gia su tieng Anh AI" />
<meta name="twitter:description" content="..." />
```

### 3.3 Sitemap

**Status:** ✅ Already referenced in robots.txt

**Recommendation:** Generate dynamic sitemap:
```typescript
// api/sitemap.xml.ts
export default async function handler(req: Request) {
  const pages = ['/', '/chat', '/writing', '/speaking', '/learn', '/dictionary']
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `
  <url>
    <loc>https://en-vi.donghanhcungban.com${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '/' ? '1.0' : '0.8'}</priority>
  </url>
`).join('')}
</urlset>`
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  })
}
```

---

## 4. Deployment Checklist

### 4.1 Before Deploy to Production

- [ ] Run Lighthouse audit locally: `npm run build && npm run dev`
- [ ] Check Performance score ≥ 85
- [ ] Check Accessibility score ≥ 85
- [ ] Check SEO score ≥ 90
- [ ] Verify cache headers in Nginx config
- [ ] Test Google Fonts load time (Chrome DevTools → Network)
- [ ] Test color contrast with WAVE or axe DevTools

### 4.2 Nginx Deployment

```bash
# 1. Update /etc/nginx/sites-available/en-vi.donghanhcungban.com
# Include cache-headers.conf (see docs/nginx-cache-headers.conf)

# 2. Reload Nginx
sudo nginx -t
sudo systemctl reload nginx

# 3. Verify headers
curl -I https://en-vi.donghanhcungban.com/index.html
# Should see: Cache-Control: no-cache, no-store, must-revalidate

curl -I https://en-vi.donghanhcungban.com/assets/main-abc12345.js
# Should see: Cache-Control: public, immutable
```

### 4.3 Monitor Performance

Use Chrome DevTools:
1. Open DevTools → Network tab
2. Disable cache (checkbox)
3. Reload → check FCP, LCP, CLS
4. Enable cache → reload again → should be <500ms total

---

## 5. Further Optimization (Nice-to-have)

- [ ] **Service Worker:** Cache API responses (Workbox)
- [ ] **Image optimization:** WebP with fallback (already done via vite-plugin-imagemin)
- [ ] **HTTP/2 push:** Preload critical assets via Link header
- [ ] **Minify SVG:** Already done by esbuild
- [ ] **CDN:** Cloudflare or similar for global distribution

---

## 6. Git Commits

```bash
# Commit log
commit XXX  Optimize for Lighthouse: cache headers, fonts, accessibility, SEO
  - Add nginx cache headers config (docs/nginx-cache-headers.conf)
  - Optimize Google Fonts with preconnect + async load
  - Fix color contrast (text-zinc-500→400, text-zinc-600→500)
  - Fix button aria-labels (Layout.tsx)
  - Clean up robots.txt syntax
```

---

## 7. Resources

- [Lighthouse scoring guide](https://developers.google.com/web/tools/lighthouse/v3/scoring)
- [Web Vitals](https://web.dev/vitals/)
- [WCAG accessibility guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [robots.txt syntax](https://www.robotstxt.org/)
- [HTTP caching best practices](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)

---

**Last Updated:** 2026-06-24  
**Next Review:** After deploy, run Lighthouse again to verify improvements
