# 0193 — Trụ Học tập lên `hoc-tap.donghanhcungban.org`

- **Ngày:** 2026-08-28
- **Đặc tả:** `docs/specs/2026-08-28-tru-hoc-tap-subdomain.md`
- **Đợt 2** của `docs/specs/2026-08-28-subdomain-theo-tru.md` (đợt 1 là hub — changelog 0191).

## Đã làm

`/mon-hoc` chuyển sang host riêng, **bỏ tiền tố**, và giữ luật _mỗi nội dung chỉ sống ở MỘT
host_ — cả bốn điểm đều do chủ dự án chốt:

```
www…/mon-hoc              →  hoc-tap…/            (301)
www…/mon-hoc/mathematics  →  hoc-tap…/mathematics (301)
hoc-tap…/tien-do          →  www…/tien-do         (301)   ← mọi thứ ngoài trụ Học tập
```

**Server** — `apps/server/src/subjectsRouting.ts` (mới): `decideRedirect()` thuần, gắn vào
Express **trước** khối static. Phải trước, nếu không `hoc-tap…/tien-do` được trả `index.html`
và app tồn tại ở cả hai host — đúng thứ phương án subdomain sinh ra để tránh.

**Client** — `apps/dhcb/src/lib/subjectsHost.ts` (mới) gom mọi quyết định "đi tới môn học":

- `subjectsTarget()` trả **kiểu phân biệt** `{kind:'path'}` / `{kind:'url'}` chứ không trả chuỗi.
  Cố ý: đưa URL tuyệt đối cho `navigate()` của React Router sẽ hỏng **âm thầm** (nó ghép vào sau
  origin hiện tại). Kiểu phân biệt làm nơi gọi không thể quên khác biệt đó.
- `goToSubjects()` / `navigateTo()` cho ~13 chỗ `nav('/mon-hoc…')`.
- `SubjectsLink.tsx` render `<a>` khi khác origin, `<Link>` khi cùng — **không** dựa vào việc
  React Router có tự xử lý URL tuyệt đối hay không, vì điều đó chưa được dự án này kiểm chứng.
- `App.tsx`: trên host Học tập, `/` là danh sách môn và `/:subjectId` là chi tiết môn.

**Ca đặc biệt:** `hoc-tap…/programming` đi **thẳng** tới `www…/lap-trinh` (môn Lập trình có
không gian riêng) thay vì dựng trang chi tiết rồi mới chuyển tiếp bằng JS — bớt một chặng và
người dùng không thấy nháy.

## Test bắt được một lỗi thật ngay lúc viết

Bản đầu của `decideRedirect` chuyển hướng `/mon-hoc` trên **mọi** host không phải `hoc-tap.` —
gồm cả `localhost`. Nghĩa là `npm run dev` và toàn bộ Playwright sẽ bị đẩy sang một domain
production không tồn tại trong môi trường test. Ca `localhost → /mon-hoc KHÔNG bị chuyển hướng`
đỏ ngay lập tức; luật được thu hẹp bằng `usesSubjectsSubdomain()`.

Đây đúng là loại lỗi mà cổng build/typecheck/lint không bao giờ bắt được.

## Bằng chứng — đo trên server ĐÃ BUILD, 11/11 đạt

| Host + đường dẫn             | Kết quả đo được                                     |
| ---------------------------- | --------------------------------------------------- |
| `www` `/mon-hoc`             | 301 → `https://hoc-tap.donghanhcungban.org/`        |
| `www` `/mon-hoc/mathematics` | 301 → `…/mathematics` (bỏ tiền tố)                  |
| `www` `/mon-hoc/physics?a=1` | 301 → `…/physics?a=1` (giữ query)                   |
| `hoc-tap` `/`                | **200** (danh sách môn)                             |
| `hoc-tap` `/mathematics`     | **200** (chi tiết môn)                              |
| `hoc-tap` `/programming`     | 301 → `www…/lap-trinh`                              |
| `hoc-tap` `/tien-do`         | 301 → `www…/tien-do`                                |
| `hoc-tap` `/khong-co-mon`    | 301 → `www…` (không trả SPA ⇒ không trùng nội dung) |
| `www` `/tien-do`             | **200** — không đổi                                 |
| `hoc-tap` `/assets/*`        | **200** — file tĩnh không bị đẩy đi                 |
| `localhost` `/mon-hoc`       | **200** — dev/E2E không đổi                         |

**Cổng:**

```
Build ✅ | Type ✅ | Lint ✅ (0 cảnh báo) | Format ✅ | Test ✅ (7668/7668, 502 file)
Test mới: 46 ca (server) + 16 ca (client)
```

## Tính năng MẶC ĐỊNH TẮT — tách "code đã lên" khỏi "tính năng đã bật"

Rủi ro nhận ra trong lúc làm: nếu deploy code này TRƯỚC khi `hoc-tap.` phân giải được, thì
`www…/mon-hoc` sẽ 301 tới một host chết — người dùng mất hẳn đường vào trụ Học tập, chỉ vì thứ
tự triển khai. Vì vậy toàn bộ hành vi mới nằm sau hai biến môi trường, **mặc định tắt**:

| Biến                     | Nơi dùng       | Tác dụng khi đặt                       |
| ------------------------ | -------------- | -------------------------------------- |
| `SUBJECTS_HOSTNAME`      | server         | bật luật 301                           |
| `VITE_SUBJECTS_HOSTNAME` | client (build) | liên kết trong app trỏ thẳng subdomain |

Không đặt gì = **mọi thứ y hệt hôm nay** — đã đo trên server đã build: với cờ TẮT,
`www…/mon-hoc` → **200** và `hoc-tap…/tien-do` → **200**, không chuyển hướng gì cả.

Bật server trước rồi client sau thì vô hại (chỉ tốn thêm một chặng 301); ngược lại thì KHÔNG —
bật client khi host chưa sống là mọi liên kết "Môn học" dẫn tới trang chết.

## VIỆC TAY trên VPS — theo ĐÚNG thứ tự

1. **Cloudflare:** thêm bản ghi A `hoc-tap` trỏ về IP VPS.
2. `sudo certbot --nginx -d hoc-tap.donghanhcungban.org --expand` — **trước** khi reload, cert
   hiện tại không phủ host mới.
3. Copy conf + `sudo nginx -t && sudo systemctl reload nginx`.
4. Đặt `SUBJECTS_HOSTNAME` trong `.env` → `pm2 reload dhcb`.
5. Đặt `VITE_SUBJECTS_HOSTNAME` rồi deploy lại (biến của Vite ăn vào lúc BUILD).

Bước 1–3 chưa xong thì cứ để hai biến trống — không có gì đổi.
