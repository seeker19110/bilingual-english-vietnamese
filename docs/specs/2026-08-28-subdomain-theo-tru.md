# Subdomain riêng cho từng trụ — hạ tầng định tuyến theo Host

- **Ngày:** 2026-08-28
- **Trạng thái duyệt:** **Approved for implementation**
- **Người/ngày duyệt:** người dùng (chủ dự án), 2026-08-28 — chốt trực tiếp trong phiên làm việc:
  "trỏ vào hub.donghanhcungban.org, tôi sẽ thêm trên cloudflare", và sau đó
  "https://www.donghanhcungban.org/mon-hoc trang này chuyển thành subdomain
  hoc-tap.donghanhcungban.org". Ba lựa chọn thiết kế ở §④ cũng do người dùng chốt cùng ngày.
- **Nguồn phát hiện:** `docs/changelog/0189-2026-08-28-audit-toan-dien.md` (audit toàn diện).

## 0. Một câu

Cho mỗi trụ của nền tảng một subdomain riêng, bắt đầu bằng landing `apps/hub` tại
`hub.donghanhcungban.org` — và trước hết là **cài đặt thật** cơ chế chọn app theo `Host` mà tài
liệu dự án đã mô tả suốt nhiều tuần nhưng code không hề có.

## Bối cảnh: một tính năng đã bốc hơi mà tài liệu vẫn tả như đang chạy

`apps/server/src/server.ts` có 10 dòng comment mô tả "chọn app theo Host header" qua biến
`EN_VI_HOSTNAME`; `.env.example` hướng dẫn đặt biến đó; `PROGRESS.md` còn ghi một đợt "sửa lỗi"
cho nó. Nhưng `EN_VI_HOSTNAME` **chỉ tồn tại trong comment và tài liệu** — không dòng code nào
đọc. Bên dưới chỉ có đúng một `express.static(appDistDir)` áp cho MỌI host, nên `apps/hub` được
build lại mỗi lần deploy rồi bị bỏ đi.

Không cổng nào bắt được: build/typecheck/lint/test đều xanh, vì không có gì sai về kiểu hay cú
pháp. Nhiều khả năng logic mất trong đợt cải tổ PR-S3 khi `server.ts` dời từ gốc repo sang
`apps/server/src/`. Bài học đưa thẳng vào thiết kế dưới đây: **phần định tuyến phải là hàm thuần
có test**, không nằm trong file mà test không import được.

## ① Phạm vi

**LÀM (đợt 1 — đã thi hành, PR #730):**

- Cài đặt thật việc chọn thư mục build theo `Host` header.
- `hub.donghanhcungban.org` → `apps/hub/dist`; mọi host còn lại → `dist/` (app nền tảng).
- Meta chia sẻ của hub: `og:image`, `og:site_name`, `og:locale`, `og:url`/`canonical` trỏ đúng
  subdomain mới.
- Nginx: thêm host mới vào `server_name` block `:80` và `:443`.

**LÀM (đợt 2 — kế tiếp, PR riêng):**

- Vá đăng nhập xuyên subdomain TRƯỚC (xem §⑤ bất biến "đăng nhập không đứt").
- Chuyển `/mon-hoc` sang `hoc-tap.donghanhcungban.org`, **bỏ tiền tố** `/mon-hoc` trên subdomain
  mới; URL cũ 301 sang URL mới.

**KHÔNG LÀM:**

- **KHÔNG đổi hành vi của bất kỳ host nào đang chạy thật** (`www` · apex · `en-vi.org` ·
  `en-vi.com`). Đây là ràng buộc cứng, có test canh (§⑤).
- **KHÔNG đụng `/api/*`** — khối route API xử lý xong trước khối static, không đi qua bảng này.
- **KHÔNG tự thao tác DNS/certbot trên VPS** — việc tay của chủ dự án (§⑥).
- Đợt 1 KHÔNG chuyển trang nào cần đăng nhập sang subdomain riêng, vì phiên đăng nhập chưa nối
  tiếp được giữa các origin.

## ② Điểm chạm

| Việc | Đường dẫn file                        | Ghi chú                                             |
| ---- | ------------------------------------- | --------------------------------------------------- |
| Thêm | `apps/server/src/staticApps.ts`       | Hàm thuần chọn thư mục build theo host              |
| Thêm | `apps/server/src/staticApps.test.ts`  | 14 ca canh gác                                      |
| Sửa  | `apps/server/src/server.ts`           | Dùng module trên cho static + fallback SPA          |
| Sửa  | `apps/hub/index.html`                 | Meta chia sẻ + canonical                            |
| Thêm | `apps/hub/public/icon-512.png`        | Ảnh cho thẻ chia sẻ                                 |
| Sửa  | `nginx/dhcb.conf`, `nginx/en-vi.conf` | `server_name` thêm host hub                         |
| Sửa  | `.env.example`                        | `HUB_HOSTNAME` thay `EN_VI_HOSTNAME` (không ai đọc) |
| Sửa  | `vitest.config.ts`                    | Mở `include` cho test ngoài `api/`                  |

**Ảnh hưởng lan ra:** `server.ts` là điểm khởi tạo, không ai import nó → không có consumer bị
gãy. `staticApps.ts` là file mới, chỉ `server.ts` dùng.

## ③ Hợp đồng dữ liệu

**Vào:**

```ts
resolveDistDir(opts: {
  hostname: string | undefined      // req.hostname của Express (đã bỏ cổng)
  hubHostnames: string[]            // parseHubHostnames(process.env.HUB_HOSTNAME)
  appDistDir: string
  hubDistDir: string
  hubBuildExists?: (dir: string) => boolean   // bơm được để test không phụ thuộc đĩa
}): string
```

**Ra:** đường dẫn thư mục build sẽ phục vụ request đó.

**Ca lỗi (là một phần hợp đồng):**

| Tình huống                             | Hành vi mong đợi                                          |
| -------------------------------------- | --------------------------------------------------------- |
| Không có `Host` header                 | app nền tảng (không đoán mò)                              |
| Host lạ / domain tấn công              | app nền tảng                                              |
| Đúng host hub nhưng CHƯA build hub     | app nền tảng — thà hiện sai app còn hơn 404 cả domain     |
| `HUB_HOSTNAME` rỗng hoặc dấu phẩy thừa | không sinh host rỗng (host rỗng sẽ khớp nhầm mọi request) |

## ④ Tiêu chí chấp nhận

- [x] `Host: hub.donghanhcungban.org` trả bundle HUB — đo trên `node dist-server/server.js`.
- [x] `Host: www` / `en-vi` trả bundle APP **không đổi** — cùng phép đo.
- [x] SPA fallback hoạt động trên host hub (đường dẫn lạ → 200, không 404).
- [x] `/icon-512.png` trên host hub trả 200.
- [x] 14 ca `staticApps.test.ts` xanh, và **ĐỎ khi bỏ phần định tuyến** (chứng minh test có tác dụng).
- [x] Toàn bộ cổng: `npm run typecheck && npm run lint && npm run format:check && npm test && npm run build`.

**Ba quyết định thiết kế do người dùng chốt (2026-08-28):**

1. Trên subdomain mới **bỏ tiền tố** `/mon-hoc` — `hoc-tap.…/` là danh sách môn, `hoc-tap.…/mathematics` là chi tiết môn.
2. URL cũ `www.…/mon-hoc*` **301** sang URL mới (gom SEO, không để hai URL cùng nội dung).
3. Việc vá đăng nhập xuyên subdomain đi **PR riêng, làm trước** — không trộn thay đổi auth (chạm mọi người dùng) vào cùng diff với thay đổi định tuyến.

**Lệnh chứng minh:**

```bash
npm run typecheck && npm run lint && npm run format:check && npm test && npm run build
npx vitest run apps/server/src/staticApps.test.ts
PORT=3998 NODE_ENV=production node dist-server/server.js &
curl -s -H "Host: hub.donghanhcungban.org" localhost:3998/ | grep -c manifest.webmanifest   # phải là 0
curl -s -H "Host: www.donghanhcungban.org" localhost:3998/ | grep -c manifest.webmanifest   # phải là 1
```

## ⑤ Bất biến không được phá

| Bất biến                                                                 | Test nào canh nó                                    |
| ------------------------------------------------------------------------ | --------------------------------------------------- |
| Các domain đang chạy thật KHÔNG đổi hành vi khi không đặt `HUB_HOSTNAME` | `apps/server/src/staticApps.test.ts` (nhóm it.each) |
| Host lạ không bao giờ rơi vào hub                                        | cùng file                                           |
| Thiếu bản build hub → không 404 cả domain                                | cùng file                                           |
| **Đăng nhập không đứt khi đổi subdomain** (chặn đợt 2, xem dưới)         | **CHƯA CÓ — phải viết trước khi chuyển `/mon-hoc`** |

> **Bất biến cuối là điều kiện chặn của đợt 2 — ĐÃ VÁ 2026-08-28.**
>
> **Đính chính bản viết đầu tiên của mục này:** nó ghi "`validateAuth` chấp nhận cookie khi
> thiếu Bearer", tức mô tả cơ chế dual-accept của Bước 3. SAI — Bước 6
> (`docs/adr/0002-quan-ly-nguoi-dung.md`) đã bỏ hẳn Bearer: `validateAuth` CHỈ đọc cookie
> `session_token`. Đo trên server đã build với DB thật: cùng một phiên, `?action=me` chỉ với
> cookie → **200**, chỉ với Bearer → **401**.
>
> Hệ quả: API trên subdomain mới **vốn đã xác thực được** (cookie `Domain=.donghanhcungban.org`
> đi theo mọi subdomain). Chỗ hỏng nằm ở CLIENT — app dùng "có token trong `localStorage`
> không" làm cờ đã-đăng-nhập, mà `localStorage` cô lập theo origin, nên người dùng bị hiện
> thành khách và `cloud.ts`/`challengeCloud.ts`/`tutorFeedback.ts` bỏ qua đồng bộ.
>
> Đã vá bằng action `session-from-cookie` (POST): nạp lại cờ đó đúng một lần lúc khởi động.

## ⑥ Quy ước dự án liên quan

- Import xuyên gói dùng `@dhcb/<gói>/<file>` (không đuôi `.js`); import nội bộ gói dùng đường
  tương đối CÓ đuôi `.js`.
- `packages/` không được import `apps/` (ESLint chặn) — vì vậy `staticApps.ts` đặt trong
  `apps/server/src/`, không đẩy vào `packages/core-http`.
- Comment giải thích bằng tiếng Việt ở chỗ quan trọng; nêu **lý do**, không chỉ mô tả code.
- Mọi thay đổi Nginx/DNS/cert trên VPS là **việc tay của chủ dự án**, AI chỉ sửa file mẫu trong
  repo và ghi rõ thứ tự thao tác.
- Thứ tự thao tác VPS bắt buộc: (1) Cloudflare thêm bản ghi A; (2)
  `sudo certbot --nginx -d <host> --expand` **trước** khi reload — cert hiện tại không phủ host
  mới, reload trước sẽ làm `nginx -t` đỏ; (3) copy conf + `nginx -t && systemctl reload nginx`.

## Nghiệm thu

Đợt 1 đã đạt toàn bộ tiêu chí §④ (bằng chứng trong `docs/changelog/0191-2026-08-28-hub-subdomain.md`).
Đợt 2 chưa bắt đầu; điều kiện chặn là bất biến "đăng nhập không đứt" ở §⑤.
