# 0206 — Sửa lỗi từ audit UI/UX desktop + mobile

Đợt việc thi hành báo cáo `docs/research/audit-ui-ux-desktop-mobile-2026-08-31.md` (audit
đọc code mobile + desktop + kiểm trên trình duyệt thật, 41 ảnh chụp Chromium thật). Sửa toàn
bộ 10 phát hiện 🔴 và phần lớn phát hiện 🟡, chia làm 5 commit theo cụm để dễ soát:

1. `docs(audit)` — báo cáo audit.
2. `fix(ui)` codemod sàn chữ 11px — 221 chỗ `text-[9px]`/`text-[10px]` → `text-[11px]`.
3. `fix(ui)` cụm core shell (A1, A3, A5, A9):
   - Luật "input 16px chống zoom iOS" thêm `!important` — trước đó nằm trong `@layer base`
     nên bị Tailwind utilities (`text-sm`) ghi đè ở ~90 input, coi như vô hiệu.
   - `BottomNav`: `h-[5.25rem]` → `min-h-[5.25rem]` (không bị bóp trên iPhone có notch); nhãn
     tab trung tâm rút gọn "Đồng Hành" (trước bị cắt "Agent Bạn Đồn…" ở 390px).
   - Sidebar desktop mất active-state ở Chat/Speaking/Writing/Dictionary/Lessons — tách bảng
     path dùng chung `lib/navPaths.ts`, sidebar và BottomNav cùng nguồn sự thật.
   - `⌘K` Studio switcher: quản lý focus đầy đủ (role=menu, mũi tên, Escape trả focus).
   - Toast/`OfflineSyncIndicator` không còn đè header/BottomNav; hub thêm luật 16px + `tap-44`.
   - Thêm test canh gác `scripts/ui-policy.test.ts` chặn tái phạm `text-[9-10px]` và
     `max-h-[NNvh]` mới (bắt dùng `dvh`).
4. `fix(ui)` cụm modal (A4) — ~24 hộp thoại tự chế `fixed inset-0` bỏ qua `Modal.tsx` chuẩn
   (thiếu Escape/focus-trap/trả focus). Quyết định: **không ép về `<Modal>`** vì mỗi hộp có
   header đặc thù (gradient, avatar đối đầu, tab phòng…) — ép vào sẽ phá bố cục. Thay vào đó
   tách hook `useDialogBehavior.ts` từ chính `Modal.tsx` và áp tại chỗ cho 14 file, cùng
   `vh→dvh`, nút đóng lên `tap-44`, bỏ `overflow-hidden` cắt nội dung dài.
5. `fix(ui)` cụm trang & trạng thái (A7, A8, A10, B*) — `tap-44` cho nút Chat/Home/Lessons,
   nút "Thử lại" của Chat có tác dụng thật (`reloadChat()` mới trong `lib/useChat.ts`),
   Skeleton/LoadError thay text/spinner trần (ChatWindow, ChatList, ExamPlan, LiveLocation),
   giá gói Pro/VIP không còn hiện "…" vĩnh viễn khi API lỗi (`UpgradeSection`), hover state +
   token màu cho các form thiếu (Intake, TwoFactorSection, EmailVerifySection, TripActions/
   TripSetup), Dashboard aside cuộn được + heatmap focus được.

## Cố ý KHÔNG đổi

- `bg-[#0a0a0a]` của khung code (`CodeEditor.tsx`, `CodeSurface.tsx`) giữ hex cứng có chủ ý,
  kèm comment: token `--z-950`/`--c-white` bị **đảo màu** ở theme sáng, dùng token vào đây sẽ
  làm mất nền tối cố định của IDE (giữ 1 điểm ngoại lệ luật 4.8, đã ghi lý do tại chỗ).
- 4 chỗ `text-black` còn lại ngoài `LifeGraph.tsx` (`ShareProgress.tsx`, `PvPArenaLobbyModal`,
  `PvPBattlefieldModal`, `Companion.tsx`) không đổi — đây là `#000` thật, không phải bẫy
  `text-white`→`--c-white` mà audit A4 nêu cho LifeGraph.

## Còn lại cho đợt sau (việc thiết kế lớn hơn, không nhét chung PR)

Xem mục E của báo cáo audit: nâng Home/Speaking/Writing/Profile lên bố cục 2 cột thật trên
desktop, tách trang bảng giá riêng, phân trang History/MistakeBank, xử lý `visualViewport`
cho bàn phím ảo iOS, thu nhỏ heatmap Dashboard, dọn `transition-all`/màu hex cứng còn sót.

## Bằng chứng

- `npm run typecheck` ✅ (4 project) · `npm run lint` ✅ (0 cảnh báo) ·
  `npx vitest run` ✅ 508 file / 8190 test · `npm run build` ✅ (dhcb + server + hub) ·
  `npm run budget` ✅ JS 126,93/140kB (90,7%), CSS 16,67/18kB (92,6%) — trong ngân sách.
- Chưa chạy lại kiểm trình duyệt thật sau đợt sửa này (đợt 0205 làm trước khi sửa) — nên làm
  một lượt kiểm mắt nữa trước khi coi audit là khép kín hoàn toàn.
