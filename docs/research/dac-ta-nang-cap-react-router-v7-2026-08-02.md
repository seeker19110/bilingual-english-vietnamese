# Đặc tả: nâng cấp `react-router-dom` 6 → 7 (vá CVE moderate)

> Nghiên cứu 2026-08-02, theo yêu cầu "nghiên cứu + lên kế hoạch" ở `PROGRESS.md` mục "Nợ kỹ
> thuật còn mở" (mục react-router). Đây là ĐẶC TẢ/KẾ HOẠCH — **chưa thi hành code**, cần bạn
> duyệt trước khi làm (CLAUDE.md mục 3: "cổng giữa các giai đoạn" + mục 12: breaking change ảnh
> hưởng nhiều nơi phải hỏi trước).

## 1. Vì sao phải nâng major, không có bản vá ở nhánh 6.x

`npm audit` xác nhận 2 lỗ hổng moderate:

- `GHSA-wrjc-x8rr-h8h6` — Open redirect qua backslash trong `<Link>`/`useNavigate`.
- `GHSA-337j-9hxr-rhxg` — Arbitrary Constructor Injection qua `deserializeErrors()` (SSR
  hydration).

Dải phiên bản dính lỗ hổng: `6.0.0 – 7.17.0`. Bản vá nằm ở `react-router-dom@7.18.2` — **không
có bản 6.x nào được vá** (đã kiểm tra: bản 6.x mới nhất là `6.30.4`, vẫn nằm trong dải dính lỗi).
Muốn hết audit warning bắt buộc phải lên major 7.

## 2. Đánh giá rủi ro cụ thể cho dự án này

Đã quét toàn bộ codebase (`apps/english/src`, `apps/hub/src`) dùng `react-router-dom`:

- **API đang dùng:** `BrowserRouter`, `Routes`, `Route`, `Navigate`, `Link`, `useLocation`,
  `useNavigate`, `useParams`, `useSearchParams` — 32 file.
- **KHÔNG dùng** bất kỳ API "data router" nào: không `createBrowserRouter`, không
  `RouterProvider`, không `loader`/`action` trên route, không `<Outlet>`, không
  `useLoaderData`/`useActionData`/`useRouteError`. (Các chuỗi `action:` tìm thấy trong code đều
  là field object thường — payload gọi API, JSX prop `onClick`-style — không liên quan router.)
- Toàn app render qua `<BrowserRouter><Routes>...<Route>...</Routes></BrowserRouter>` đơn giản ở
  `apps/english/src/App.tsx` (32 `<Route>`, không lồng route con qua `<Outlet>`).

→ Đây là **kịch bản migration dễ nhất** trong tài liệu chính thức của React Router: ứng dụng chỉ
dùng "Declarative Mode" (tương đương "Library Mode" cũ), không có SSR, không có data
loader/action. React Router v7 **giữ nguyên** toàn bộ API kể trên ở chế độ Declarative Mode — v7
gộp 3 chế độ (Declarative/Data/Framework) vào 1 package, không bắt buộc đổi sang data router nếu
không cần.

## 3. Thay đổi cần biết khi lên v7 (đọc từ CHANGELOG + upgrade guide chính thức)

1. **Yêu cầu React ≥ 18** — dự án đã dùng React `^18.3.1`, đạt yêu cầu, không cần đổi.
2. **`future` flags của v6.30 nên bật trước khi nhảy v7** (`v7_relativeSplatPath`,
   `v7_startTransition`, …) để bắt sớm hành vi khác biệt — nhưng vì dự án không dùng route lồng
   kiểu splat (`*`) phức tạp và không có `Suspense`+`useNavigate` transition đặc thù, rủi ro thấp;
   vẫn nên bật thử trên nhánh 6.30.4 trước 1 bước trung gian nếu muốn an toàn tối đa (tuỳ chọn,
   xem mục 5).
3. **`json()`/`defer()` bị xoá** — dự án không dùng (không có loader), không ảnh hưởng.
4. **`useSearchParams`, `useNavigate`, `useParams`, `<Navigate>`, `<Link>`** giữ nguyên chữ ký —
   8 file đang dùng `useSearchParams` không cần sửa.
5. **Tên package không đổi** (`react-router-dom` vẫn tồn tại làm alias sang `react-router` cho
   tương thích ngược) — không bắt buộc đổi import, dù tài liệu mới khuyến khích chuyển sang
   `react-router` (gộp package). **Khuyến nghị: giữ nguyên `react-router-dom` ở lần nâng này**,
   tránh đổi 32 file import cùng lúc với nâng version — giảm diện thay đổi trong 1 PR.

## 4. Kế hoạch thực hiện (đề xuất chia 1 PR, có thể tách bước nếu muốn thận trọng hơn)

1. `npm install react-router-dom@^7.18.2` (bump duy nhất trong `package.json`/`package-lock.json`).
2. Chạy `npm run typecheck` — bắt lỗi type do đổi API (nếu có) ngay tại bước này trước khi chạy gì
   khác.
3. Chạy `npm run build && npm run lint && npm test` (cổng commit CLAUDE.md mục 8).
4. **Test tay bắt buộc** (do E2E hiện tại chỉ có 7 file, không phủ hết mọi route):
   - Đăng nhập → điều hướng qua ít nhất: Home, Chat, Speaking, Writing, Listening, Stories,
     Dictionary, Learn, Dashboard, Profile — xác nhận route khớp URL, back/forward trình duyệt
     hoạt động đúng.
   - Test riêng các trang dùng `useSearchParams` (Landing, LandingEn, CefrLevelPage, Chat,
     Listening, AdminDashboard, ResetPassword, Speaking) — xác nhận query string đọc/ghi đúng.
   - Test `<Navigate replace>` (3 chỗ: chưa đăng nhập → `/login`, chưa onboard → `/onboarding`,
     không phải admin → `/`) — xác nhận redirect không lặp vô hạn, không để lại lịch sử back rác.
5. Chạy `npm run test:e2e` đầy đủ (Playwright) — đây là cổng merge, không phải cổng commit, nhưng
   nên chạy trước khi xin duyệt vì đổi router ảnh hưởng toàn bộ điều hướng trong test.
6. Cập nhật `package.json` dependency + `CLAUDE.md` (không cần sửa mục "GIỮ NGUYÊN PHIÊN BẢN" vì
   mục đó chỉ áp cho React/TS/Tailwind/ESLint, không nhắc react-router) + xoá dòng nợ kỹ thuật
   react-router khỏi `PROGRESS.md`.

## 5. Phương án thận trọng hơn (nếu muốn giảm rủi ro tối đa)

Thay vì nhảy thẳng 6.24.1 → 7.18.2, có thể chia 2 bước:

- **Bước A:** 6.24.1 → 6.30.4 (bản 6.x mới nhất, cùng major, an toàn tuyệt đối) + bật các
  `future` flags (`v7_relativeSplatPath`, `v7_startTransition`, `v7_fetcherPersist`,
  `v7_normalizeFormMethod`, `v7_partialHydration`, `v7_skipActionErrorRevalidation`) trên
  `<BrowserRouter future={{...}}>` — các flag này làm 6.x tự cảnh báo console nếu code phụ thuộc
  hành vi cũ sắp đổi ở v7, giúp phát hiện sớm mà KHÔNG cần đổi major.
- **Bước B:** sau khi chạy ổn định vài ngày không thấy warning, mới lên hẳn `^7.18.2`.

Đánh đổi: an toàn hơn nhưng tốn 2 PR + 2 lần chờ duyệt thay vì 1. Vì đã xác nhận app không dùng
API phức tạp (mục 2), tôi nghiêng về **làm thẳng 1 bước (mục 4)** — nhưng để bạn quyết định cuối
cùng.

## 6. Việc KHÔNG làm trong lần nâng này

- Không đổi sang `createBrowserRouter`/data router — không cần thiết, tăng rủi ro không đáng.
- Không đổi import từ `react-router-dom` sang `react-router` — giữ nguyên tên package đang dùng.
- Không đụng `apps/hub` nếu hub không dùng react-router (cần xác nhận lại lúc thi hành — file này
  chỉ quét `apps/english`).

## Kết luận / việc cần bạn quyết định

Đề xuất: chọn giữa **phương án 1 bước** (mục 4, nhanh, rủi ro thấp vì codebase chỉ dùng API cơ
bản) hoặc **phương án 2 bước** (mục 5, an toàn hơn, chậm hơn). Sau khi bạn chọn, tôi sẽ thi hành
trên 1 nhánh riêng, chạy đủ cổng commit + test tay theo mục 4, rồi báo cáo trước khi xin merge.
