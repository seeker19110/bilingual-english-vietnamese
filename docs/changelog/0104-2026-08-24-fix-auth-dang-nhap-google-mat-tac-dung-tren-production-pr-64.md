# fix(auth): đăng nhập Google mất tác dụng trên production — PR #646 (2026-08-24)

**Triệu chứng người dùng báo:** bấm nút Google là hiện ngay "Không kết nối được Google. Vui
lòng thử lại", không có gì trong Console DevTools.

**Nguyên nhân thật:** đợt dời `apps/english` → `apps/dhcb` (PR-S2, 2026-08-23) đặt
`root: appDir` trong `apps/dhcb/vite.config.ts` nhưng **thiếu `envDir`**. Vite mặc định tìm
`.env` ngay tại `root` (`apps/dhcb/`) thay vì gốc repo (nơi `.env` thật nằm) — nên MỌI biến
`VITE_*` (không riêng Google) đều rỗng trong bundle build production. `loginWithGoogle()`
(`packages/core-ui/clientAuth.ts`) ném `Error('Thiếu VITE_GOOGLE_CLIENT_ID')` ngay khi bấm nút
— không log console — bị `Login.tsx` nuốt gọn thành thông báo lỗi chung.

`apps/hub/vite.config.ts` đã có sẵn đúng dòng `envDir` này kèm comment giải thích y hệt lỗi
này — chỉ là lúc tách `apps/dhcb` sau đó bị bỏ sót, không đồng bộ.

**Sửa:** thêm `envDir: repoRoot` vào `apps/dhcb/vite.config.ts`. Xác minh bằng build thật 2
lần (không fix / có fix `git stash`) — không fix thì bundle hoàn toàn thiếu client ID test,
có fix thì đúng. Build + typecheck + lint + 272 test đều xanh.

**Việc tay còn nợ sau khi merge:** build lại production trên VPS (`npm run build` với `.env`
thật đã có `VITE_GOOGLE_CLIENT_ID`) rồi reload PM2 — code fix không tự có tác dụng nếu VPS
đang chạy bundle cũ đã build từ trước.
