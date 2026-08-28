# 0190 — Vá các phát hiện của audit 2026-08-28 + gỡ định vị "gia sư tiếng Anh" ở mức nền tảng

- **PR:** #728 (cùng PR với báo cáo audit 0189)
- **Ngày:** 2026-08-28
- **Bối cảnh:** báo cáo audit `0189-2026-08-28-audit-toan-dien.md` nêu 7 phát hiện; người dùng
  yêu cầu vá. Trong lúc vá, người dùng gửi ảnh thẻ chia sẻ của `DONGHANHCUNGBAN.ORG` vẫn ghi
  "Gia sư tiếng Anh AI — Luyện nói, viết, đọc cùng AI" và yêu cầu **rà toàn bộ dự án** về định vị.

## Phần A — Vá phát hiện audit

| #      | Việc đã làm                                                                                                                                                                                                                                               |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F1** | `.claude/report-status.sh`: đóng nợ #5 (baseline `eval:tutor` đã chạy lại 2026-08-26, mới hơn lần đổi prompt 2026-08-25) và nợ #6 (`nginx/en-vi.conf` đã áp lên VPS 2026-08-26); cập nhật số đo nợ #7 theo phép đo thật; thêm nợ #8 (migration trùng số). |
| **F3** | `apps/server/src/api/learning/subjects.ts`: thêm comment nêu rõ vì sao endpoint công khai có chủ đích, kèm ràng buộc "đừng thêm dữ liệu theo user vào file này".                                                                                          |
| **F5** | `CLAUDE.md`: sửa **24 chỗ** đường dẫn chết sang vị trí thật sau đợt cải tổ `apps/dhcb`/`apps/server`, cộng 2 mô tả lạc hậu (Supabase Auth → auth tự viết trên Postgres; Supabase Storage → Cloudflare R2). Đã kiểm từng đường dẫn mới bằng `ls`.          |
| **F6** | `packages/core-personal/companionLinkService.ts`: mã mời "Người thân theo dõi" chuyển từ `Math.random()` sang `crypto.randomInt`. **Kèm test canh gác** — ghim `Math.random` về hằng số rồi khẳng định hai mã vẫn khác nhau.                              |
| **F7** | `packages/core-ui/clientAuth.ts`: `state` của OAuth Google chuyển sang `crypto.getRandomValues` (16 byte = 128 bit, hex). **Kèm test canh gác** cùng kiểu.                                                                                                |
| **F8** | (MỚI, phát hiện trong lúc vá) `packages/subject-programming/lessonsPython.test.ts`: các test sinh tiến trình `python3` thật nay có timeout tường minh 30s thay vì mặc định 5s của vitest.                                                                 |
| **F2** | **KHÔNG sửa** — xem mục "Không làm" bên dưới.                                                                                                                                                                                                             |
| **F4** | **KHÔNG sửa** — migration trùng số đã chạy trên production; đổi tên file = runner (theo dõi theo TÊN FILE) chạy lại lần nữa. Ghi thành nợ #8 trong hook thay vì sửa liều.                                                                                 |

**Bằng chứng cho 2 test canh gác (F6, F7):** cả hai đã chứng minh **ĐỎ trước khi vá, XANH sau** —
tạm hoàn nguyên code về `Math.random` thì test đỏ đúng một ca, khôi phục thì xanh lại.

**Bằng chứng cho F8:** máy rảnh, bài chậm nhất đo được **2,4s** trên trần 5s (dư ~2x). Khi chạy
cùng lúc với bộ E2E, `p5-u6-l1` mất **5,35s** và ĐỎ — code không sai, trần quá sát. Vá TEST chứ
không vá code sản phẩm (đúng hướng dẫn Tầng 1b của quy trình audit).

## Phần B — Định vị sản phẩm: gỡ "gia sư tiếng Anh" khỏi mức NỀN TẢNG

Người dùng báo thẻ chia sẻ sai. Truy nguyên ra **ba tầng nguyên nhân khác nhau**, không phải một:

1. **Ảnh trong thẻ là ảnh HIỆN TẠI, và nó sai kích thước.** `og:image` đang trỏ
   `icon-512.png` — ảnh VUÔNG 512×512 — trong khi `twitter:card` khai `summary_large_image`
   (chuẩn 1200×630). Ảnh mũi tên xanh trong ảnh chụp của người dùng chính là file đó bị nhét vào
   khung ngang. Comment ngay trong `apps/dhcb/index.html` đã tự ghi nhận "chưa có ảnh 1200×630
   chuyên dụng". → **CHƯA vá, cần thiết kế ảnh riêng, chờ người dùng quyết.**
2. **Tiêu đề trong thẻ là bản CŨ, không còn trong repo.** Đã đổi ở commit `a3ffcb1` (2026-08-25).
   → cache của Facebook. Việc tay: bấm "Scrape Again" trong Facebook Sharing Debugger.
3. **`apps/hub` — trang chủ nền tảng — KHÔNG được phục vụ ở đâu cả.** Cả `nginx/dhcb.conf:61,70`
   lẫn `apps/server/src/server.ts:100` đều trỏ MỌI host về `dist/` của app `@dhcb/app`. Comment ở
   `server.ts:88–97` mô tả "chọn app theo Host header" qua biến `EN_VI_HOSTNAME` — nhưng
   `EN_VI_HOSTNAME` **chỉ xuất hiện trong comment**, không dòng code nào đọc nó. Hub được build
   mỗi lần deploy rồi bỏ đi. → **CHƯA vá, là quyết định kiến trúc + hạ tầng, chờ người dùng.**

### Đã vá trong PR này — các chuỗi định vị ở MỨC NỀN TẢNG

| Nơi                                                             | Trước                                       | Sau                                            |
| --------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------- |
| `apps/dhcb/public/manifest.webmanifest` (`name`, `description`) | "Đồng Hành Cùng Bạn — Gia Sư Tiếng Anh AI"  | "… — Nền tảng đồng hành cá nhân" + mô tả 5 trụ |
| `apps/dhcb/src/i18n/index.ts` (`loginBrand`, `loginTagline`)    | "Gia sư tiếng Anh AI" / "AI Language Tutor" | "Đồng Hành Cùng Bạn" + tagline 5 trụ (VI & EN) |
| `packages/core-auth/emailVerification.ts` (tiêu đề email)       | "… mã xác thực Gia sư tiếng Anh AI"         | "… mã xác thực Đồng Hành Cùng Bạn"             |
| `packages/core-auth/passwordReset.ts` (tiêu đề email)           | "Đặt lại mật khẩu — Gia sư tiếng Anh AI"    | "Đặt lại mật khẩu — Đồng Hành Cùng Bạn"        |
| `apps/server/src/server.ts` (log khởi động)                     | "✅ English Tutor đang chạy…"               | "✅ Đồng Hành Cùng Bạn (DHCB) đang chạy…"      |
| `apps/dhcb/src/components/ShareResultCard.tsx` (`appName`)      | "Gia sư tiếng Anh AI"                       | "Đồng Hành Cùng Bạn"                           |
| `e2e/smoke.spec.ts`                                             | chốt tiêu đề theo tên cũ                    | chốt theo tên mới + tagline (xem dưới)         |

Lý do đổi: đây đều là chuỗi dùng chung cho MỌI môn — tên PWA, màn đăng nhập nền tảng, email của
TÀI KHOẢN nền tảng, log tiến trình (PM2 đã đổi tên `english-tutor` → `dhcb` từ 2026-08-21).

**Tên thương hiệu KHÔNG dịch** — bản EN của `loginBrand` cũng là "Đồng Hành Cùng Bạn" (trước là
"AI Language Tutor"). Vì vậy smoke test không còn phân biệt được ngôn ngữ qua tiêu đề; đã đổi
sang chốt bằng **tagline** ("Học tập · Sự nghiệp · …" ⇄ "Learning · Career · …") — vẫn kiểm đúng
thứ cần kiểm là giao diện có đổi ngôn ngữ hay không.

### CỐ Ý GIỮ NGUYÊN — thuộc riêng môn Tiếng Anh, không phải mức nền tảng

`apps/dhcb/src/pages/subjects/english/EnglishHome.tsx` · `.../WordDetail.tsx` (tiêu đề SEO của
trang từ điển từng từ) · `apps/dhcb/src/components/ShareProgress.tsx`. Đổi những chỗ này mới là
sai — chúng đang mô tả đúng môn học mà người dùng đang ở trong.

## Không làm (nêu rõ lý do)

- **F2 — 3 test E2E bộ chạy Web Worker.** Chạy lại TOÀN BỘ bộ E2E lần hai: **634/634 XANH**, kể
  cả 3 test hôm trước đỏ — và lượt này còn chạy dưới tải NẶNG HƠN (có `npm test` chạy song song).
  Cộng với 29/29 khi chạy riêng và 5/5 dưới tải CPU nhân tạo, tức **không tái hiện được**. Quy
  trình audit cấm kết luận "flake" khi chưa chỉ ra được cơ chế, nên KHÔNG nới timeout/đổi test
  theo phỏng đoán. Ghi nhận là mục cần theo dõi; CI vẫn có `retries: 1` đỡ.
- **og:image 1200×630** và **định tuyến cho `apps/hub`** — cần quyết định của người dùng.

## Bằng chứng kiểm chứng

```
Build ✅ | Type ✅ (0 lỗi) | Lint ✅ (0 cảnh báo) | Format ✅ | Test ✅ (7582/7582, 499 file)
Size ✅ Initial JS 124,83/140 kB · CSS 16,26/18 kB (không đổi so với trước khi vá)
E2E smoke sau đổi branding ✅ 3/3 | E2E toàn bộ (lượt tái hiện F2) ✅ 634/634
Test canh gác F6/F7: chứng minh ĐỎ trước khi vá, XANH sau
```
