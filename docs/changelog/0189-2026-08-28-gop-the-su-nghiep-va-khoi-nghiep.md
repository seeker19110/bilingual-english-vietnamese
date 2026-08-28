# 0189 — Gộp 2 thẻ "Sự Nghiệp" + "Khởi Nghiệp & Đời Sống" thành 1 (2026-08-28)

## Việc đã làm

- `apps/dhcb/src/pages/core/Home.tsx`: mục "Các Không Gian & Bộ Môn" trước đây có 4 thẻ, trong đó
  hai thẻ "Sự Nghiệp & Công Việc" và "Tôi Khởi Nghiệp & Đời Sống" nằm cạnh nhau. Người dùng yêu
  cầu gộp lại thành MỘT thẻ.
- Thẻ mới "Sự Nghiệp, Khởi Nghiệp & Đời Sống" chiếm trọn hàng (`sm:col-span-2`), giữ **đủ** nội
  dung cũ, không mất lối vào nào:
  - 2 huy hiệu: `Career Hub` (tím) + `Life OS` (cam).
  - 4 lối tắt con: Phỏng Vấn STAR · Công Việc Của Tôi · Lean Canvas · Bánh Xe Cuộc Đời
    (2 cột trên màn nhỏ, 4 cột từ `sm`).
  - 2 nút vào không gian giữ nguyên đích cũ: `/su-nghiep` và `/khoi-nghiep`.
- Nhãn đếm ở tiêu đề mục sửa theo thực tế: "4 Không gian chuyên sâu" → "3 Không gian chuyên sâu".
- Gỡ import `Rocket` (lucide-react) không còn dùng.

## Quyết định

- **Không bỏ bớt đích điều hướng.** Hai trụ vẫn là hai không gian riêng ở router, nên gộp ở đây
  chỉ là gộp _thẻ giới thiệu_: thẻ có 2 nút CTA thay vì 1, đảm bảo không ai mất đường vào
  `/khoi-nghiep`.

## Bằng chứng kiểm chứng

- `npm ci` (node_modules lệch lockfile lúc đầu phiên — typecheck/lint báo lỗi giả ở file không đụng tới).
- `npm run build` ✅ · `npm run typecheck` ✅ · `npm run lint` ✅ (0 cảnh báo) ·
  `npm test` ✅ 7580/7580 (499 file) · `npx prettier` ✅.
