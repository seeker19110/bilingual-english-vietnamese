# Audit UI/UX toàn diện — Desktop + Mobile (2026-08-31)

> Audit CHỈ ĐỌC + BÁO CÁO theo `docs/framework/QUY-TRINH-AUDIT.md` (không sửa code trong lúc
> audit). Phạm vi: toàn bộ frontend `apps/dhcb/src` + `apps/hub/src`, đối chiếu chuẩn nội bộ
> CLAUDE.md mục 4 (vùng chạm ≥ 44px, sàn chữ ≥ 11px, input 16px, token màu `--a-*`/`--z-*`,
> WCAG AA/AAA) và tiêu chuẩn ngành (WAI-ARIA APG, iOS safe-area, dvh).
>
> **Ba lớp bằng chứng:** (1) đọc code mobile-first, (2) đọc code desktop, (3) chạy `npm run dev`
> thật + Chromium thật, chụp 41 ảnh ở 1440×900 và 390×844, cả theme tối lẫn Blue sky, đo tràn
> ngang bằng JS (`scrollWidth − clientWidth`). Phát hiện nặng nhất (mục 1) đã được xác minh lại
> trực tiếp trên `apps/dhcb/src/index.css` trước khi ghi vào báo cáo.

## Tóm tắt điều hành

- **Không có lỗi chặn thao tác trên trình duyệt thật**: 0 tràn ngang ở 11 trang × 2 viewport,
  0 lỗi JS runtime, layout không vỡ. Nền tảng thiết kế (token 5 theme, `--sidebar-w`,
  `tap-44`, `Modal.tsx`, safe-area utilities) đều đúng chuẩn — vấn đề chủ yếu là **độ phủ
  không đều**: nơi dùng nguyên thuỷ chung thì rất tốt, nơi tự chế thì lệch chuẩn.
- **10 phát hiện 🔴** (vi phạm luật bắt buộc hoặc hỏng thật trên thiết bị), **~20 phát hiện 🟡**,
  còn lại 🟢. Ba cụm đáng làm trước: (a) luật input 16px bị vô hiệu → iOS auto-zoom;
  (b) ~24 modal tự chế thiếu Escape/focus-trap; (c) sidebar desktop mất active-state ở các
  trang luyện tập chính.

---

## A. 🔴 Nghiêm trọng (vi phạm luật bắt buộc / hỏng thật)

### A1. Luật "input font 16px" bị Tailwind ghi đè ở ~90 input → iOS auto-zoom

`apps/dhcb/src/index.css:91-99` ép `input,textarea,select { font-size:16px }` cho màn cảm ứng
nhưng đặt trong `@layer base`; class `text-sm`/`text-xs` nằm ở `@layer utilities` (layer sau)
nên **thắng bất kể specificity** — luật coi như không tồn tại ở mọi input có class cỡ chữ.
Ví dụ: `pages/domains/work/Work.tsx:636,693,736,824,923,958`, `Career.tsx:683,840,911`,
`Life.tsx:760,818,837`, `Chat.tsx:113` (select), `WorkKanban.tsx:120,164` (12px).
→ **Sửa 1 chỗ:** chuyển rule sang layer utilities (hoặc thêm `!important` trong media query
`(pointer: coarse)`), sau đó rà bỏ `text-sm` khỏi input. Mẫu đúng đã có: `Chat.tsx:867`
`text-base sm:text-sm`.

### A2. App `hub` không có luật 16px, không `tap-44`, không safe-area

`apps/hub/src/index.css` (47 dòng) thiếu hẳn media query `(pointer: coarse)` và mọi utility
mobile. `HubLogin.tsx:235` input `text-sm` → **màn đăng nhập landing bị iOS auto-zoom**;
`HubLogin.tsx:389` nút hiện/ẩn mật khẩu `h-8 w-8` (32px).
→ Tách phần base/utilities dùng chung vào `packages/core-ui` và import ở cả hai app.

### A3. BottomNav: `pb-safe` nằm trong chiều cao cứng → bị bóp trên iPhone có notch

`components/BottomNav.tsx:98` `h-[5.25rem] pb-safe`: box-sizing border-box nên trên iPhone
(inset ≈ 34px) vùng nội dung chỉ còn ~50px — 5 tab bị ép, `tap-44` tràn hộp. Trong khi
`index.css:39` tính `--bnav-only-h = 5.25rem + max(12px, safe)` (giả định CỘNG thêm) → token
CSS lệch với DOM thật.
→ Đổi thành `min-h-[5.25rem] pb-safe` hoặc `h-[calc(5.25rem+env(safe-area-inset-bottom))]`.

### A4. ~24 hộp thoại tự chế `fixed inset-0`, chỉ 4 file dùng `Modal.tsx`

`Modal.tsx` đạt đủ 6 hành vi WAI-ARIA APG (role/aria-modal/Escape/focus-trap/trả focus/khoá
cuộn nền, nút đóng 44px, `max-h-[90dvh]`), nhưng phần lớn modal bỏ qua nó:
`IntegrationsModal.tsx:95`, `MemoryPalaceExplorerModal.tsx:114`, `AgentOrchestratorModal.tsx:81`,
`PvPArenaLobbyModal.tsx:93`, `PvPBattlefieldModal.tsx:123`, `QuickActions.tsx:165`,
`ShareProgress.tsx:67`, `FeedbackModal.tsx:102`, `LiveDebateModal.tsx`, `MicroDrillModal.tsx`,
`ActionCanvas/*Modal.tsx`, `LifeGraph.tsx`, `StartupCanvas.tsx`, `Companion.tsx`… Thiếu
Escape + focus trap là lỗi nặng nhất với người dùng bàn phím desktop; một số còn dùng
`max-h-[90vh]` (không phải dvh — tràn dưới thanh URL iOS: `StemScratchpadModal.tsx:110`,
`MemoryPalaceExplorerModal.tsx:115`, `LiveDebateModal.tsx:91`) hoặc `overflow-hidden` cắt
nội dung không cuộn được (`PvPBattlefieldModal.tsx:124`).
→ Chuyển dần sang `<Modal>` (ưu tiên luồng chính); thêm lint/test canh chặn `fixed inset-0`
mới ngoài `Modal.tsx`.

### A5. Sidebar desktop mất active-state ở các trang luyện tập chính

`DesktopSidebar.tsx:37-41,84-85` chỉ có mục `/`, `/tien-do`, `/trang-ca-nhan` + STUDIOS, so
khớp bằng `startsWith`. BottomNav (`BottomNav.tsx:407-531`) có 5 tab với bảng path dài
(`PRACTICE_PATHS`: `/tro-truyen`, `/luyen-noi`, `/luyen-viet`, `/tu-dien`, `/bai-hoc`…).
Kết quả: đứng ở Chat/Speaking/Writing/Dictionary/Lessons/History… **không mục sidebar nào
sáng** — desktop mất định vị trong khi mobile vẫn có.
→ Tách bảng path của BottomNav ra `lib/navPaths.ts` dùng chung; bổ sung mục Luyện tập.

### A6. Sàn chữ 11px bị vi phạm 217 chỗ (202 × `text-[10px]`, 15 × `text-[9px]`)

Nặng nhất: nhãn tab trung tâm BottomNav `BottomNav.tsx:180` `text-[10px] sm:text-[11px]` —
đúng phần tử điều hướng chính ở breakpoint nhỏ nhất (trình duyệt thật cũng thấy nhãn bị cắt
"Agent Bạn Đồn…"). Khác: `Layout.tsx:182` (badge 9px), `Home.tsx:243,294,341,344`,
`Profile.tsx:472`, `Writing.tsx:455`, `A2ANegotiatorCard.tsx:155,181`…
→ Codemod 1 lượt `text-[9px]`/`text-[10px]` → `text-[11px]` + lint rule chặn tái phạm;
rút gọn nhãn tab thành "Đồng Hành".

### A7. Cụm nút gửi tin của Chat 36px, không `tap-44`

`Chat.tsx:815,830,878,887` (`p-2.5` + icon 16px = 36×36, `gap-2` sát nhau) và nút vote
`Chat.tsx:327,342` (`h-9 w-9`). Trang Speaking đã làm đúng (`Speaking.tsx:1071,1132`
`tap-44 p-3`) — áp cùng mẫu.

### A8. CTA chính cuối trang bị BottomNav che ở mobile (thấy trên trình duyệt thật)

"Chấm bài ngay" (`/luyen-viet`) và "Bắt đầu đếm ngược" (`/on-thi`) nằm sát đáy, bị BottomNav/
fade che một phần — thiếu `pb-[calc(...+var(--bnav-h))]` mà ~30 trang khác đã dùng.
(Ảnh: `writing-mobile-full.png`, `on-thi-mobile-full.png`.)

### A9. `⌘K` mở Studio switcher nhưng không quản lý focus

`Layout.tsx:68-73` chỉ toggle state; dropdown `:147-195` không `role="menu"`, không focus mục
đầu, không điều hướng mũi tên, Escape đóng nhưng không trả focus. Người dùng bàn phím mở xong
phải Tab mò từ đầu tài liệu.

### A10. Giá gói Pro/VIP hiện "…" vĩnh viễn khi API `plan_prices` lỗi

Trên trình duyệt thật (`profile-mobile-full.png`): ô giá "10 ngày/Tháng/Năm" chỉ hiện "…" —
không skeleton, không thông báo lỗi, không retry. Đây là màn THANH TOÁN, trạng thái lỗi im
lặng vi phạm luật 4.3. Cùng họ: `Profile.tsx:92,106` fetch thưởng không `catch`/loading.

---

## B. 🟡 Nên sửa

**Mobile:**

1. `OfflineSyncIndicator.tsx:49` `fixed bottom-20` (80px) đè lên BottomNav (84px + safe-area)
   → dùng `bottom-[calc(1rem+var(--bnav-h))]`.
2. Toast (`packages/core-ui/ToastProvider.tsx:96-101`): nút đóng ~14px, container `top-0
z-[100]` đè header che nút Back trong 4 giây → `tap-44` + hạ xuống `top-14`.
3. 0 chỗ dùng `visualViewport`: bàn phím ảo iOS không co `dvh`, ô nhập Chat bị che, chỉ vá bằng
   `setTimeout(scrollIntoView)` (`Chat.tsx:874-877`); BottomNav không ẩn khi bàn phím mở.
4. 192 chỗ nút `py-1`/`py-1.5` không `tap-44` (vd `Home.tsx:256-271,357-378`,
   `Lessons.tsx:999-1026` nút `w-6 h-6` = 24px, `LifeGraph.tsx:794,860,949`).
5. Header mobile 7 cụm trong `h-14` (`Layout.tsx:104-260`), tiêu đề bị cắt cụt "Xin ch…",
   "Không …" (ảnh `home-mobile.png`, `learn-mobile-full.png`); các nút bị flex ép dưới 44px dù
   có class `tap-44` → gom bớt vào menu "⋯".
6. Heatmap Dashboard (`Dashboard.tsx:418-425`): div không focus được, thông tin chỉ trong
   `title` (hover) — vô dụng trên cảm ứng; desktop thì ô ~90px quá to, đẩy số liệu chính xuống
   dưới màn hình (ảnh `tien-do-desktop.png`); mobile label "Lượt AI tuần này…/35" cắt ellipsis.
7. Tab "Kiểm tra" wrap 2 dòng ở `/lo-trinh-hoc/a1` mobile (lệch chiều cao pill).

**Desktop:** 8. Luồng chính vẫn 1 cột hẹp: `Home.tsx:144` `max-w-3xl` 0 class `lg:`; `Speaking.tsx:988`
(Chat có cột feedback, Speaking cùng mô hình thì không); `Writing.tsx:95,365` `max-w-2xl`
— trình soạn luận bỏ trống ~55% màn 1440px, chưa có bố cục "soạn | nhận xét";
`ExamPlan.tsx:266`, `LiveLocation.tsx:328`, `Profile.tsx:197`, `RoadmapTab.tsx` tương tự.
→ Áp mẫu 2 cột/master-detail đã có ở `Dashboard.tsx:767-780`, `CefrLevelPage.tsx:377-378`. 9. Container lệch nhau vô cớ: header `max-w-3xl lg:max-w-5xl` vs trang `max-w-6xl`/`5xl`/`4xl`/
`3xl`/`2xl` → định nghĩa token bề rộng `.page-narrow`/`.page-wide` dùng chung. 10. Ô nhập Chat `max-w-3xl mx-auto` (`Chat.tsx:814-815`) lệch khỏi cột hội thoại `lg:max-w-5xl`. 11. Loading dạng chữ/spinner thay skeleton (`ChatWindow.tsx:157-159`, `ChatList.tsx:92`,
`ExamPlan.tsx:274`, `LiveLocation.tsx:335`) dù đã có `CardListSkeleton`; lỗi mạng không
retry (`ChatWindow.tsx:150-153`, `Chat.tsx:795-799`) dù đã có `LoadError`. 12. Bảng giá nằm lẫn trong Profile, `sm:grid-cols-2`, không route riêng, không so sánh
`lg:grid-cols-3/4`; sidebar không có mục Nâng cấp. 13. 0 chỗ `max-w-prose`: `ProgrammingLessonPage.tsx:161` `max-w-4xl` → ~120-130 ký tự/dòng. 14. Danh sách dài không phân trang: `History.tsx`, `MistakeBank.tsx`, `ChatList.tsx:151`,
`Friends.tsx`; `Dictionary.tsx:33` `PAGE_SIZE = 3` quá nhỏ. 15. Nút không hover state ở `Intake.tsx` (9 nút), `TwoFactorSection.tsx` (10 nút),
`EmailVerifySection.tsx`, `location/TripActions.tsx`, `TripSetup.tsx`. 16. `transition-all` 196 lần (vs `transition-colors` 54) — chuẩn hoá lại. 17. Theme sáng: `DesktopSidebar.tsx`, `ChatList/ChatWindow` 0 override `theme-light:`; palette
studio cố định (`lib/studios.ts:34-79` `text-amber-400`…) thiếu tương phản trên nền sáng —
trình duyệt thật xác nhận: "Live Studio" và chip chào trông như disabled ở Blue sky
(ảnh `home-bluesky-desktop.png`). 18. Màu hex cứng ngoài luật 4.8: `DesktopSidebar.tsx:130`, `TwoFactorSection.tsx:210,277`,
`CodeEditor.tsx:101` + `CodeSurface.tsx:19` (`bg-[#0a0a0a]` cứng cả 4 theme), loạt
`text-black` ở `LifeGraph.tsx:423,520,599`, scrollbar hub hard-code. 19. Aside Dashboard `sticky top-20` không `max-h`/`overflow-y-auto` (`Dashboard.tsx:780`) —
nội dung cao hơn viewport bị cắt; `CefrLevelPage.tsx:378` làm đúng. 20. Phím `/` focus ô nhập ĐẦU TIÊN trong DOM (`Layout.tsx:74-81`), không phải ô chính của trang. 21. Nút đổi theme hành xử như toggle, không thấy menu chọn 4 theme khi click trên trình duyệt
thật (`theme-menu-open.png`) — cần rà lại tương tác mở menu swatch. 22. `/lo-trinh-hoc/a1` mobile bắn ~20 request bị **429** khi tải (prefetch audio ồ ạt?) — rà
lại prefetch, dù không phải lỗi UI thuần.

## C. 🟢 Nhỏ

- `custom-scrollbar` là class chết (`ChatWindow.tsx:156`, `ChatList.tsx:107,151` — không định
  nghĩa ở CSS nào; đã xác minh bằng grep).
- `Layout.tsx:182` `py-0.2` không phải giá trị Tailwind hợp lệ (bị bỏ qua im lặng).
- `Layout.tsx:93` còn `h-screen` (tấm nền Reachability — nên `dvh`, và nên `lg:hidden`
  vì là hack mobile nhưng vẫn render desktop; header `z-50` > sidebar `z-40`).
- `LifeWheel.tsx:160` `w-[320px] shrink-0` tràn ở iPhone SE 320px (container còn 288px).
- Comment `index.css:39` nói BottomNav "hiện ở MỌI kích thước" — sai, thực tế `lg:hidden`.
- `CodeSurface.tsx:19` `overflow-x-auto` thiếu `tabIndex={0}` (WCAG 2.1.1 — bàn phím không
  cuộn được).
- Input ngày `/on-thi` hiện "mm/dd/yyyy" tiếng Anh (native date theo locale trình duyệt).
- Hàng chip "GỢI Ý NHANH" cuộn ngang nhưng không có dấu hiệu cuộn được (ảnh `home-mobile.png`).
- BottomNav trộn ngôn ngữ nhãn: "Profile" cạnh "Trang chủ"/"Phòng Học".
- `Modal.tsx:110` cuộn cả header — nên `sticky top-0` cho tiêu đề + nút X.
- Tooltip sidebar thu gọn dùng `title` gốc (trễ ~1s, không theo theme).
- `ChatPage.tsx` là trang duy nhất không có `<h1>` (thêm `sr-only`).
- Thứ bậc heading thị giác đảo (`Home.tsx:227` h2 `text-xs` < `:242` h3 `text-base`).

## D. Đã tốt (giữ và nhân rộng)

- Hệ token 5 theme `--z-*`/`--a-*`/`--c-white` phủ gần như toàn bộ UI; focus-visible outline
  theo `--a-500` đổi đúng theo theme.
- Kiến trúc `--sidebar-w` + `useIsDesktopViewport` (render theo nhánh, không nhân đôi DOM);
  `lib/studios.ts` một nguồn sự thật cho header + sidebar.
- Hệ safe-area chuẩn hoá (`--bnav-h`, `.pb-safe`, `.tap-44`/`.tap-44-y` — 408 lần dùng);
  Chat/Speaking dùng `100dvh`; chặn double-tap zoom; scrollbar mảnh chỉ bật cho chuột.
- `Modal.tsx`, `Field.tsx`, `LoadError.tsx`, `Skeleton.tsx` — nguyên thuỷ đúng chuẩn, vấn đề
  chỉ là độ phủ.
- `Speaking.tsx` là trang mẫu vùng chạm (mic 80px, nút phụ `tap-44 p-3`, sticky `pb-safe`).
- Trình duyệt thật: 0 tràn ngang, 0 lỗi JS runtime, theme tối nhất quán, sidebar thu gọn mượt;
  trạng thái tải/lỗi làm tốt ở `ExamPlan`, `LiveLocation`, `Writing`.
- Không còn `<div onClick>` nào chưa focus được (2 chỗ còn nhắc là comment ghi nhận đã sửa).

## E. Đề xuất thứ tự sửa (mỗi mục ≈ 1 PR nhỏ)

1. **Vá 1 dòng lan toả rộng:** chuyển rule 16px sang mức thắng utilities (A1) + `min-h` cho
   BottomNav (A3) + `pb` cho 2 CTA bị che (A8) + vị trí `OfflineSyncIndicator` (B1).
2. **Codemod sàn chữ 11px** (A6) + `tap-44` cho cụm nút Chat và các nhóm B4.
3. **Bảng path nav dùng chung** cho sidebar active-state (A5) + focus cho ⌘K (A9).
4. **Chiến dịch Modal:** chuyển dần 24 modal về `<Modal>` (A4), kèm test canh gác.
5. **Trạng thái lỗi thanh toán** (A10) + skeleton/retry nhóm B11.
6. **Nâng desktop đợt 2:** Home/Writing/Speaking/Profile 2 cột (B8), token bề rộng trang (B9).
7. **Theme sáng:** override `theme-light:` cho sidebar/chat/studios (B17) + dọn hex cứng (B18).
8. Hub: dùng chung base CSS mobile (A2).
