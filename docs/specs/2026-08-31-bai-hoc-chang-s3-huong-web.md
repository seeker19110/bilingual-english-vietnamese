# Đặc tả: Bài học 8 bước thật cho chặng `web-s3` (hướng chuyên sâu Web)

| Thuộc tính   | Giá trị                                    |
| ------------ | ------------------------------------------ |
| Issue        | #                                          |
| Spec owner   | Claude (phiên làm việc 2026-08-31)         |
| Trạng thái   | **Approved for implementation**            |
| Người duyệt  | Chủ dự án (donghanhcungban.org@gmail.com)  |
| Ngày duyệt   | 2026-08-31 (yêu cầu trực tiếp trong phiên) |
| Lần cập nhật | 2026-08-31                                 |

> Không bắt đầu code khi trạng thái chưa là **Approved for implementation**.

## 1. Tóm tắt quyết định

Người dùng yêu cầu trực tiếp trong phiên: "soạn tiếp bài học 8 bước cho chặng web-s3" — tiếp
mạch soạn bài cho `stageUnits.ts` sau `web-s2`. Giải pháp: soạn 6 bài học 8 bước thật cho
`web-s3` "Nâng cao — hiệu năng, kiến trúc, chất lượng" (`specializations/web.ts`, 5 module) ở 3
unit mới, đăng ký cầu nối vào `specializations/stageUnits.ts`.

## 2. Vấn đề, người dùng và bằng chứng

- Persona: người học hướng Web đã xong S1/S2 (đã có bài), vào chặng S3 "Nâng cao — hiệu năng,
  kiến trúc, chất lượng" nhưng chưa có bài học thật.
- Hiện trạng: `stageUnits.ts` trước đợt này có 11 chặng đã đăng ký, `web-s3` chưa có.
- Nguồn bằng chứng: hội thoại phiên này ("soạn tiếp bài học 8 bước cho chặng web-s3").

## 3. Nghiên cứu hiện trạng

- `packages/subject-programming/specializations/web.ts` — 5 module `web-s3`: Hiệu năng web đo
  bằng số (Core Web Vitals, ngân sách bundle), Render phía server (SSR/SSG/streaming, hydration,
  SEO), Kiểm thử tự động (kim tự tháp test, Playwright, ca biên), Kiến trúc frontend lớn (ranh
  giới module, feature-based structure, design system), Bảo mật web thực chiến (XSS/CSRF/SSRF/
  IDOR, CSP, rate limit).
- `PR #780` (chặng `web-s2`) vừa merge trước đợt này — tìm ra một test app-level
  (`ProgrammingSpecializationPage.test.tsx`) hardcode danh sách chặng web đã có bài, phải sửa
  cùng lúc để không đỏ CI khi thêm `web-s2`/`web-s3`.
- Mã unit tự do tại thời điểm soạn: `p6-u114` trở đi (`p6-u111…u113` đã dùng cho `web-s2`).

## 4. Phương án và quyết định

3 unit cho 5 module (như `web-s2`, không theo khuôn "4 module → 3 unit" thường dùng ở các chặng
Backend):

- `p6-u114` (module m1 "Hiệu năng web đo bằng số"): phân loại LCP/INP/CLS theo ba ngưỡng chuẩn
  Google (chính là ngưỡng CLAUDE.md của dự án này đặt); ngân sách bundle chặn CI (dùng số liệu
  thật của dự án: Initial JS ≤ 140KB).
- `p6-u115` (gộp module m2 "Render phía server" + m4 "Kiến trúc frontend lớn" — cả hai là "quyết
  định CẤU TRÚC lớn"): chọn chiến lược render (SSG/SSR/CSR) theo tần suất đổi nội dung + SEO +
  cá nhân hoá; kiểm vi phạm luật phụ thuộc module (feature-based, chặn import chéo feature).
- `p6-u116` (gộp module m3 "Kiểm thử tự động" + m5 "Bảo mật web thực chiến" — cả hai là "gác
  CHẤT LƯỢNG/AN TOÀN trước khi release"): kiểm tỉ lệ kim tự tháp test khoẻ mạnh (unit > integration
  > E2E, có ít nhất 1 E2E); phân loại lỗ hổng (XSS/CSRF/SSRF) theo triệu chứng + giới hạn tốc độ
  > gọi API (rate limit).

**Phương án khác đã cân nhắc và loại:** 5 unit riêng (1:1 với 5 module) — loại vì `m2`/`m4` cùng
là quyết định kiến trúc lớn ở tầm ứng dụng, `m3`/`m5` cùng là cổng chất lượng/an toàn trước khi
phát hành — gộp giữ đúng tinh thần "gộp module khi hợp lý" đã dùng ở `web-s2`.

## 5. Phạm vi

### Trong phạm vi

- 3 unit mới trong `curriculum.ts` (`p6-u114…u116`) + 6 bài học 8 bước
  (`lessons/p6u114..116.ts`), làn `typescript`.
- Đăng ký `stageUnits.ts`: `'web-s3': ['p6-u114', 'p6-u115', 'p6-u116']`.
- Sửa `specializations/stageUnits.test.ts`: ca kiểm "chặng chưa soạn bài" đổi ví dụ từ `web-s3`
  (nay đã có bài) sang `architecture-s2` (vẫn chưa có bài).
- Sửa `apps/dhcb/src/pages/subjects/programming/ProgrammingSpecializationPage.test.tsx`: thêm
  `web-s2`/`web-s3` vào danh sách chặng web đã có bài (test hardcode danh sách, phát hiện qua CI
  đỏ ở PR #780 khi đăng ký `web-s2`).
- Cập nhật `PROGRESS.md` mục "Tiếp theo".

### KHÔNG trong phạm vi

- KHÔNG đổi UI/route mới, không migration, không đổi API.
- KHÔNG soạn bài cho `web-s4` (đã có từ trước) hay chặng khác của hướng khác — ngoài phạm vi.

## 6. Tiêu chí chấp nhận (đo được)

- `npm run typecheck` sạch.
- `npx vitest run packages/subject-programming` xanh 100%, bao gồm `lessonsTs.test.ts` (6 bài
  chạy tsc thật + `node:vm`), `specializations/stageUnits.test.ts`.
- `npm test` (toàn bộ monorepo, gồm `ProgrammingSpecializationPage.test.tsx`) xanh 100%.
- `npm run lint` (`--max-warnings 0`) sạch.
- `npm run build` thành công, `npm run budget` vẫn trong hạn mức.

## 7. Rủi ro, rollout, rollback

- Rủi ro thấp: chỉ thêm dữ liệu hằng biên dịch + sửa 2 test có sẵn cho khớp thực tế mới. Không
  đổi schema DB, không đổi API.
- Rollout: đi theo PR thường, không cần feature flag.
- Rollback: revert PR nếu cần — không có migration, không có dữ liệu người dùng bị ảnh hưởng.
