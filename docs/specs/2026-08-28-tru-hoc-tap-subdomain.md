# Trụ Học tập lên subdomain riêng `hoc-tap.donghanhcungban.org`

- **Ngày:** 2026-08-28
- **Trạng thái duyệt:** **Approved for implementation**
- **Người/ngày duyệt:** người dùng (chủ dự án), 2026-08-28 — chốt trực tiếp trong phiên:
  "https://www.donghanhcungban.org/mon-hoc trang này chuyển thành subdomain
  hoc-tap.donghanhcungban.org", cộng bốn lựa chọn thiết kế ở §④.
- **Nối tiếp:** `docs/specs/2026-08-28-subdomain-theo-tru.md` (đợt 1: hub). Đây là đợt 2.

## 0. Một câu

Đưa trang danh sách môn và chi tiết môn ra host riêng, bỏ tiền tố `/mon-hoc`, và giữ luật **mỗi
nội dung chỉ sống ở MỘT host**.

## ① Phạm vi

**LÀM:**

- `www…/mon-hoc` → `hoc-tap…/` và `www…/mon-hoc/<mã môn>` → `hoc-tap…/<mã môn>` (301).
- Trên `hoc-tap.`: chỉ `/` và `/<mã môn>` được phục vụ; mọi đường dẫn khác 301 về `www`.
- Liên kết "Môn học" trong app trỏ THẲNG sang subdomain (không đi qua chặng 301).
- Nginx nhận host mới; Express lo toàn bộ luật chuyển hướng.

**MẶC ĐỊNH TẮT:** toàn bộ hành vi mới nằm sau `SUBJECTS_HOSTNAME` (server) và
`VITE_SUBJECTS_HOSTNAME` (client, lúc build). Không đặt = y hệt hôm nay. Lý do: deploy code
trước khi DNS/cert của host mới sống thì `/mon-hoc` 301 tới host chết — thứ tự triển khai không
được phép quyết định thành bại.

**KHÔNG LÀM:**

- **KHÔNG đổi hành vi ở localhost/dev.** `/mon-hoc` phải chạy nguyên như cũ — nếu không
  `npm run dev` và Playwright bị đẩy sang domain production không tồn tại trong môi trường test.
  (Test canh gác đã bắt đúng lỗi này lúc viết — xem §⑤.)
- **KHÔNG viết luật rewrite trong Nginx.** Hai bản luật song song sẽ trôi lệch nhau; đúng bài
  học của khối CSP từng có cả ở Nginx lẫn Express.
- **KHÔNG đụng `/api/*`** (đã xử lý xong trước khối này) và **không đụng file tĩnh**.

## ② Điểm chạm

| Việc | Đường dẫn file                                    | Ghi chú                                  |
| ---- | ------------------------------------------------- | ---------------------------------------- |
| Thêm | `apps/server/src/subjectsRouting.ts` + `.test.ts` | Luật 301, hàm thuần, 46 ca test          |
| Thêm | `apps/dhcb/src/lib/subjectsHost.ts` + `.test.ts`  | Điều hướng phía client, 16 ca test       |
| Thêm | `apps/dhcb/src/components/SubjectsLink.tsx`       | `<a>` khi khác origin, `<Link>` khi cùng |
| Sửa  | `apps/server/src/server.ts`                       | Gắn middleware 301 TRƯỚC static          |
| Sửa  | `apps/dhcb/src/App.tsx`                           | Bảng route đổi hình dạng theo host       |
| Sửa  | 10 file có `nav('/mon-hoc…')` / liên kết cấu hình | Dùng `goToSubjects` / `navigateTo`       |
| Sửa  | `nginx/dhcb.conf`, `nginx/en-vi.conf`             | `server_name` thêm host mới              |

## ③ Hợp đồng dữ liệu

```ts
decideRedirect(opts: {
  hostname: string | undefined
  pathname: string
  search?: string
  subjectIds: readonly string[]
  subjectsHostname?: string   // mặc định hoc-tap.donghanhcungban.org
  canonicalHostname?: string  // mặc định www.donghanhcungban.org
}): { location: string } | null    // null = phục vụ bình thường
```

**Ca lỗi / ca biên (là một phần hợp đồng):**

| Tình huống                                  | Hành vi mong đợi                                         |
| ------------------------------------------- | -------------------------------------------------------- |
| Không có `Host`                             | không chuyển hướng (không đoán mò)                       |
| File tĩnh (`/assets/…`, có đuôi)            | KHÔNG BAO GIỜ chuyển hướng — nếu không trang sẽ trắng    |
| Mã môn không tồn tại trên `hoc-tap.`        | 301 về `www` (không trả SPA ⇒ không sinh nội dung trùng) |
| `hoc-tap…/programming`                      | 301 thẳng `www…/lap-trinh` (môn có không gian riêng)     |
| localhost                                   | không chuyển hướng gì cả                                 |
| Domain lạ giả dạng (`…org.ke-gian.example`) | xử như host thường                                       |

## ④ Tiêu chí chấp nhận

Đo trên `node dist-server/server.js` với các `Host` khác nhau — **11/11 đạt**:

- [x] `www…/mon-hoc` → 301 `https://hoc-tap…/`
- [x] `www…/mon-hoc/mathematics` → 301 `…/mathematics` (bỏ tiền tố)
- [x] giữ query string (`/mon-hoc/physics?a=1` → `/physics?a=1`)
- [x] `hoc-tap…/` và `hoc-tap…/mathematics` → 200
- [x] `hoc-tap…/programming` → 301 `www…/lap-trinh`
- [x] `hoc-tap…/tien-do` và mã môn lạ → 301 về `www`
- [x] `www…/tien-do` KHÔNG đổi · `hoc-tap…/assets/*` KHÔNG bị chuyển hướng · `localhost/mon-hoc` KHÔNG đổi

**Bốn quyết định thiết kế do người dùng chốt (2026-08-28):**

1. Bỏ tiền tố `/mon-hoc` trên subdomain mới.
2. URL cũ **301** (không chạy song song hai địa chỉ).
3. Trên `hoc-tap.` **chỉ** trụ Học tập; phần còn lại 301 về `www`.
4. Liên kết nội bộ **trỏ thẳng** sang subdomain, không mượn chặng 301.

## ⑤ Bất biến không được phá

| Bất biến                                                   | Test nào canh nó                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------ |
| Mọi đường dẫn ngoài `/mon-hoc*` trên `www` KHÔNG đổi       | `apps/server/src/subjectsRouting.test.ts`                    |
| File tĩnh không bao giờ bị chuyển hướng                    | cùng file (`isAssetPath` + ca `/assets/…`)                   |
| localhost/dev giữ nguyên `/mon-hoc`                        | cùng file + `subjectsHost.test.ts`                           |
| Không sinh nội dung trùng ở hai host                       | cùng file (ca mã môn lạ, ca nhiều đoạn)                      |
| URL tuyệt đối không bao giờ đi qua `navigate()` của Router | `subjectsHost.test.ts` (`subjectsTarget` trả kiểu phân biệt) |

> **Test đã chứng minh có tác dụng ngay lúc viết:** bản đầu của `decideRedirect` chuyển hướng
> `/mon-hoc` trên MỌI host không phải `hoc-tap.` — gồm cả `localhost`, tức phá `npm run dev` và
> toàn bộ Playwright. Ca `localhost → /mon-hoc KHÔNG bị chuyển hướng` đỏ ngay, và luật được
> thu hẹp lại bằng `usesSubjectsSubdomain()`.

## ⑥ Quy ước dự án liên quan

- Logic phải test được: `server.ts` gọi `app.listen()` lúc import nên mọi luật đặt ở module
  riêng (bài học `apps/hub` bị bỏ quên — changelog 0191).
- `packages/` không import `apps/`; hai file mới nằm đúng app của mình.
- Comment tiếng Việt nêu **lý do**, không mô tả lại code.
- Thao tác DNS/cert trên VPS là việc tay của chủ dự án; AI chỉ sửa file mẫu và ghi thứ tự.
