# fix: Đợt 3 "Dọn nhà" — gom 80 route trùng về 1 URL chính thức mỗi trang (2026-08-24)

**PR 3.1 xong. PR 3.2 (chạy k6 lần đầu) CHƯA làm được — cần VPS thật, xem "⚠️ Cần làm tay" bên dưới.**

**Phát hiện khi đo lại (đo trực tiếp `App.tsx`, không đoán):** 80 route khai báo nhưng chỉ 50
trang thật — 14 component có tới **4 URL cùng render y hệt nội dung, không redirect**. Ví dụ
`/su-nghiep-cua-toi`, `/hoc-su-nghiep`, `/career`, `/su-nghiep` cùng render `<Career />`. Đúng loại
lỗi trùng nội dung PR #645 vừa sửa ở tầng tên miền (apex/`www` cùng phục vụ một nội dung, phải
301), nhưng tầng route trong ứng dụng vẫn còn nguyên vấn đề y hệt.

**Đã sửa: mỗi trang giữ ĐÚNG MỘT URL chính thức** (chọn tiếng Việt, đúng nghĩa nhất — vd
`/su-nghiep` thay vì `/career`). 30 route trùng đổi thành `<Route element={<Navigate replace />}>`
— **không xoá URL nào**, ai có bookmark cũ vẫn vào được, chỉ chuyển hướng ngay lập tức. Route có
tham số (`/subjects/:subjectId` v.v.) cần xử lý riêng vì `<Navigate to>` không tự thay `:param` —
thêm component nhỏ `SubjectRedirect` đọc `useParams()` rồi dựng đường dẫn đích đúng mã môn.

**Đồng thời rà và sửa TOÀN BỘ điểm điều hướng nội bộ** (không chỉ gỡ route) — nếu chỉ thêm redirect
mà giữ nguyên các nút bấm trỏ URL cũ thì mỗi cú click vẫn tốn thêm 1 vòng redirect vô ích:
`BottomNav.tsx` (3 tab), `Layout.tsx` (nav phụ), `Profile.tsx` (4 thẻ hub), `Home.tsx` (nhiều thẻ),
`HomeAiBriefingCard.tsx`, `HomeUniversalAiBar.tsx`, `ProactiveBriefingCard.tsx`,
`StudioSynthesis.tsx`, `CareerInterview.tsx`/`WorkKanban.tsx`/`StartupCanvas.tsx`/`LifeWheel.tsx`
(nút "quay lại"), `Practice.tsx`, `SubjectDetail.tsx`, `EnglishHome.tsx`, và test
`e2e/v2-hubs.spec.ts`. Rà bằng grep toàn diện theo mọi khuôn gọi (`nav()`, `navigate()`, `to=`,
`to:`, `route:`, `path:`, `goto()`) — xác nhận cuối cùng: **0 điểm điều hướng nào còn trỏ URL không
chính thức**.

**Cổng ra (theo đúng khuôn "Đợt ra sao đo vậy" của tài liệu nghiên cứu):**

- Tổng route path trong `App.tsx` vẫn 80 (không mất URL nào), nhưng 0 component nào còn nhiều URL.
- 1 test `e2e/bottomnav.spec.ts` kỳ vọng URL cũ `/phong-luyen-tap` → sửa theo URL chính thức mới
  `/luyen-tap`, đổi luôn tên test cho khớp thực tế.
- **Chạy TOÀN BỘ 14 file E2E** (không chỉ file "có vẻ liên quan") vì route ảnh hưởng xuyên suốt
  app: **219/219 test xanh** (a11y 122 + a11y-aaa/2fa/admin-intake/intake 123 + v2-hubs/bottomnav/
  chat/listening/continue-viewing/admin/smoke/authenticated/comeback 87 — một số spec trùng số
  đếm do chạy theo đợt).

Build ✅ | Type ✅ | Lint ✅ (0 cảnh báo) | Format ✅ | Test ✅ **5178/5178** (418 file — Đợt 3 không
thêm test unit mới, chỉ sửa route + 1 kỳ vọng E2E). Không đổi API, không đổi schema.

**⚠️ Cần làm tay (không làm được trong sandbox sửa lỗi):** PR 3.2 — chạy
`k6 run scripts/load-test/k6-baseline.js` trên VPS thật (200–500 VU trước, ghi lại p95/tỷ lệ lỗi,
rồi mới nới dần). Sandbox không có `k6`, không có `DATABASE_URL`/`REDIS_URL` thật, không nối được
production. Đây là điều kiện duy nhất còn thiếu để đóng trọn Đợt 3.

**Đến đây, cả 3 đợt của tài liệu `nang-tam-du-an-2026-08-24.md` đã có code** (Đợt 1 lưu thật ×3,
Đợt 2 trụ Career hết giả ×2, Đợt 3 gom route). Việc còn mở toàn bộ chỉ còn là việc tay trên VPS
(migration 0063, k6, 2 món nợ Gemini/khoá mã hoá cũ) và đo cổng "5 người dùng quay lại" sau deploy.
