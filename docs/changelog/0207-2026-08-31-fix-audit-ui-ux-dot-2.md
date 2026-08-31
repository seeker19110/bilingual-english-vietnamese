# 0207 — Sửa lỗi audit UI/UX đợt 2 (mật độ, bàn phím ảo, hiệu ứng)

Tiếp nối đợt 1 (PR #760, changelog `0206`) — thi hành các mục 🟡 còn lại của báo cáo
`docs/research/audit-ui-ux-desktop-mobile-2026-08-31.md` mà đợt 1 chưa làm (không nhét chung
để giữ PR nhỏ). Nhánh cũ `claude/ui-ux-audit-desktop-mobile-vy96rk` đã merge xong nên đổi tên
nhánh mới `claude/ui-ux-audit-p2` (theo quy ước "PR đã merge = fresh work, không stack tiếp").

## Đã sửa (2 commit)

1. **Mật độ & phân trang (B6, B11):**
   - `History.tsx`/`MistakeBank.tsx`: thêm phân trang "Xem thêm" (8 mobile / 20 desktop) — trước
     đó render toàn bộ mảng không giới hạn.
   - `Dictionary.tsx`: `PAGE_SIZE` cố định 3 → responsive theo `useIsDesktopViewport()` (5 mobile
     / 12 desktop), kèm `safePage` tránh rơi vào trang trống khi resize làm số trang giảm.
   - `Dashboard.tsx`: heatmap lịch hoạt động giới hạn `lg:max-w-sm` — ô ngày ~90px trên desktop
     (đo trên trình duyệt thật ở đợt 1) nay ~45px, không còn đẩy số liệu chính xuống dưới màn
     hình; nhãn "Lượt AI tuần này (chat + nói + viết…)" rút gọn tránh cắt ellipsis ở mobile.

2. **Bàn phím ảo iOS + hiệu ứng + vùng chạm còn sót (B3, B4, B13):**
   - Hook mới `lib/useVisualViewportHeight.ts` (SSR-safe, ngưỡng 100px lọc nhiễu thanh địa chỉ)
     áp cho `Chat.tsx`/`Speaking.tsx`: khi bàn phím ảo mở, dùng chiều cao `visualViewport` thật
     thay vì `100dvh` (`dvh` không co theo bàn phím trên iOS Safari) — giữ nguyên
     `setTimeout(scrollIntoView)` cho lần focus đầu tiên vì `resize` chỉ bắn sau khi bàn phím
     trượt lên xong.
   - `LifeGraph.tsx`/`ActionCanvas.tsx`: thêm `tap-44`/`tap-44-y` cho các nút ngoài modal còn
     thiếu (modal trong các file này đã sửa ở đợt 1).
   - Chuẩn hoá `transition-all` → `transition-colors`/`transition-[thuộc-tính-cụ-thể]` ở
     `Home.tsx`, `Layout.tsx`, `Dashboard.tsx`, `CefrLevelPage.tsx` — chỉ đổi chỗ thực sự chỉ
     hoạt ảnh 1 nhóm thuộc tính; giữ `transition-all` kèm comment ở chỗ đổi thật cả màu lẫn
     transform cùng lúc.

## Xác minh lại và bác bỏ 1 phát hiện của báo cáo audit

Mục **B18** của báo cáo nêu `text-[#fff]`/`text-[#09090b]` ở `Startup.tsx`, `Work.tsx`,
`Life.tsx`, `Career.tsx`, `CareerInterview.tsx`, `DesktopSidebar.tsx` là hex cứng cần đổi sang
token. Rà lại từng dòng: tất cả đều nằm trên nền **cố định** (gradient/màu solid không đổi theo
theme — `bg-purple-600`, `bg-emerald-700`, `from-accent-500…to-indigo-500`…), trong khi
`--c-white` **bị đảo thành màu tối** ở các theme nền sáng (xem `packages/core-ui/theme.css`).
Đổi sang `text-white`/`text-zinc-950` ở đây sẽ tạo **chữ tối trên nền tối** — đúng bẫy mà luật
4.8 CLAUDE.md cảnh báo. Kết luận: **giữ nguyên**, không sửa — ghi lại để đợt sau khỏi lặp lại
cùng một đề xuất sai.

## Còn lại cho đợt sau

Mục E của báo cáo, phần còn nặng nhất: bố cục 2 cột thật trên desktop cho Home/Speaking/
Writing/Profile, tách trang bảng giá riêng (hiện nằm trong Profile, không so sánh được cạnh
nhau trên màn rộng). Sẽ làm PR riêng vì rủi ro vỡ layout cao hơn, cần kiểm bằng trình duyệt
thật trước khi tạo PR.

## Bằng chứng

- `npm run typecheck` ✅ (4 project) · `npm run lint` ✅ (0 cảnh báo) ·
  `npx vitest run` ✅ 510 file / 8288 test · `npm run build` ✅ (dhcb + server + hub) ·
  `npm run budget` ✅ JS 126,97/140kB (90,7%), CSS 16,69/18kB (92,7%) — trong ngân sách.
