---
name: ui-ux-craftsman
description: 'Quy chuẩn thiết kế UI/UX đỉnh cao và quy trình triển khai giao diện cho Đồng Hành (Personal AI Companion & English Tutor). Bắt buộc kích hoạt khi tạo mới, thiết kế, review hoặc sửa đổi bất kỳ trang (page), layout, modal, form, audio/voice widget, quiz, flashcard, dashboard hay component nào.'
---

# UI/UX CRAFTSMAN V7.0 — QUY CHUẨN THIẾT KẾ & GIAO DIỆN ĐỈNH CAO

Bộ Skill này đóng gói toàn bộ tri thức thiết kế UI/UX hiện đại, tâm lý học học tập (learning ergonomics), hiệu ứng chuyển động mượt mà 60 FPS, chuẩn khả năng tiếp cận (W3C WCAG 2.2 AAA/AA) và quy trình triển khai giao diện cho hệ sinh thái Đồng Hành.

---

## 1. QUY TRÌNH 5 BƯỚC TRIỂN KHAI KHI CODE GIAO DIỆN MỚI

Mọi thay đổi giao diện trong `apps/english/src/**` đều phải tuân thủ 5 bước tuần tự:

```
[B1: Bối cảnh & Phân loại] ──► [B2: Thiết kế Tokens & Bố cục] ──► [B3: Đủ 5 Trạng thái] ──► [B4: Micro-Interactions] ──► [B5: Verification Gate]
```

### Chi Tiết Phân Loại 5 Focus Studios & Gamification Hub:

1. **Studio 1: Đối thoại & Voice Thời gian thực (Realtime Voice & CyberTutor):**
   - CyberTutor Avatar (`apps/dhcb/src/components/Companion3D/CyberTutorAvatar3D.tsx`) — thực
     tế hiện là **Canvas 2D** (`canvas.getContext('2d')`), KHÔNG phải WebGL/PBR lighting như tên
     gọi "3D" gợi ý; có dải viseme 15 trạng thái. Nâng lên WebGL thật (three.js/PBR/gaze
     tracking) là việc CHƯA làm, cần quyết định riêng trước khi đầu tư.
   - Trạng thái Voice trực quan: `Idle` $\rightarrow$ `Listening (Waveform animation)` $\rightarrow$ `Thinking (Glow pulse)` $\rightarrow$ `Speaking (Viseme morph)`.
2. **Studio 2: Nhận thức Sâu & Cung điện Trí nhớ (Metacognitive Journal & Memory Palace):**
   - Không gian 3D/Isometric hiển thị bản đồ Loci và các điểm neo giác quan.
   - Nhật ký phản tỉnh Socratic với radar phân tích điểm mù tư duy và tiến trình MAI.
3. **Studio 3: Đấu trường Tranh biện & Labs STEM/Phonetics (Debate Arena & STEM Labs):**
   - Timeline phân tích luận điểm Toulmin Model 60 FPS mượt mà.
   - Bảng nháp tương tác từng bước STEM với phản hồi tức thì về tính hợp lệ đại số/hóa học.
4. **Studio 4: Đón đầu Tự trị & Lộ trình Vi mô (Proactive Nudges & Goal AutoPilot):**
   - Banner ngữ cảnh thông minh 1-chạm (Quick Action), thanh tiến độ phân kỳ mục tiêu vi mô.
5. **Studio 5: Tổng hợp Đa Miền & Studio Điều phối Agent (Life Synthesis & Orchestrator):**
   - Bento Grid 5 Miền kết hợp radar năng lực (Learning, Career, Work, Startup, Life).
   - Canvas điều phối Agent với timeline 5 bước (Plan $\to$ Execute $\to$ Verify $\to$ Reflect $\to$ Handoff).
6. **Sàn Đấu Đối Kháng 1v1 PvP & Viral Story Canvas:**
   - Modal sàn đấu 1v1 mượt mà 60 FPS (`PvPBattlefieldModal.tsx`) với thanh máu kép, đồng hồ đếm ngược, combo streak multipliers và hiệu ứng vinh quang Victory.
   - Trình tạo ảnh thẻ Story Canvas độ nét cao (`ViralShareCardGenerator.tsx`) tải ảnh story và chia sẻ Zalo/FB/Telegram 1 chạm.

---

## 2. QUY CHUẨN DESIGN TOKENS & KHẢ NĂNG TIẾP CẬN (WCAG 2.2 AAA / AA)

### A. Quy chuẩn Tương phản Tuyệt đối (W3C Standard)

- **Nội dung văn bản & Tiêu đề (Text & Headings):** BẮT BUỘC đạt chuẩn **WCAG AAA** (Độ tương phản $\ge 7:1$).
- **Giao diện Tương tác & Nút bấm (Interactive Controls & Icons):** BẮT BUỘC đạt chuẩn **WCAG AA** (Độ tương phản $\ge 4.5:1$).
- **Vùng Chạm Mobile (Touch Target):** Tối thiểu $\ge 44 \times 44\text{px}$ cho tất cả nút bấm và vùng tương tác.

### B. Tuân thủ Design Tokens & Không Hardcode Màu

- **Thang Nền / Viền / Chữ Semantic:**
  - Nền & Thẻ: `bg-zinc-950`, `bg-zinc-900`, `bg-zinc-900/80`, `border-zinc-800`, `border-zinc-700`.
  - Chữ: `text-zinc-100` (đọc chính), `text-zinc-300`, `text-zinc-400` (phụ trợ).
  - Điểm nhấn Thương hiệu: `bg-accent-500`, `text-accent-400`, `border-accent-500/30`.
- **CẤM:** Tuyệt đối không hardcode mã màu hex `#...` trong các component giao diện (trừ trường hợp màu trắng cố định của nút bên thứ ba `text-[#fff]`).

---

## 3. ĐẢM BẢO ĐẦY ĐỦ 5 TRẠNG THÁI BẮT BUỘC (THE 5 STATES)

Mọi màn hình hoặc component có tương tác/tải dữ liệu phải xử lý trọn vẹn:

1. **Initial / Empty State:** Khi chưa có dữ liệu/tin nhắn: Icon sinh động + Lời chào ấm áp + Gợi ý bắt đầu (Prompt Starters / Topic Suggestions).
2. **Loading / Skeleton State:** Khung xương tải mờ (`animate-pulse`) khớp chính xác kích thước thật, triệt tiêu hoàn toàn giật bố cục (CLS < 0.1).
3. **Data Loaded State:** Hiển thị dữ liệu trọn vẹn, căn chỉnh lề chuẩn mực, typography sắc nét.
4. **Error / Offline State:** Thông báo lỗi thân thiện kèm nguyên nhân + Nút "Thử lại ngay" (Retry Action) + Chế độ hoạt động Offline dự phòng.
5. **Validation Feedback:** Phản hồi tức thì khi người dùng nhập liệu hoặc thực hiện hành động (Badge, âm thanh nhẹ, toast notification).

---

## 4. VI TƯƠNG TÁC & HIỆU ỨNG VẬT LÝ (MICRO-INTERACTIONS & MOTION)

- **Nút bấm & Card tương tác:** Đầy đủ `hover:border-accent-500/50`, `active:scale-[0.98]`, `focus-visible:ring-2 focus-visible:ring-accent-500`, `disabled:opacity-50 disabled:pointer-events-none`.
- **Chuyển động (Motion Ergonomics):** Sử dụng Spring Physics hoặc CSS Transitions (`transition-all duration-200 ease-out`).
- **A11y:** Mọi nút Icon-only phải có `aria-label` và `title` rõ nghĩa cho Screen Readers.

---

## 5. TÀI LIỆU DESIGN.md — 8 MỤC CHUẨN THAM KHẢO (nghiên cứu từ VoltAgent/awesome-design-md)

Kho `VoltAgent/awesome-design-md` tổng hợp 73 file `DESIGN.md` — tài liệu hệ thống thiết kế dạng
văn bản thuần (khởi xướng bởi Google Stitch) để AI agent đọc và sinh giao diện nhất quán, thay
vì phải parse Figma/JSON. Bổ sung skill này bằng **8 mục chuẩn** làm khung tự kiểm khi thiết kế
màn hình mới cho DHCB — không tạo file `DESIGN.md` riêng (dự án đã có `index.css` +
`tailwind.config.js` làm nguồn sự thật), mà dùng làm CHECKLIST khi review:

1. **Sắc thái & Tâm trạng thị giác (Visual Theme & Atmosphere):** mỗi theme trong 5 theme
   (🌙 Xanh đêm mặc định · ☀️ Blue sky · 🌸 Pink · 🎉 Rực rỡ · 🧒 Nhi đồng) phải giữ đúng "mood" của nó — độ
   đậm nhạt nền, mật độ thông tin, không trộn phong cách giữa các theme khi thêm component mới.
2. **Bảng màu & Vai trò (Color Palette & Roles):** đã có ở mục 2 (design tokens `--a-*`/`--z-*`,
   không hardcode hex). Bổ sung: khi thêm màu ngữ nghĩa MỚI (không phải accent/zinc có sẵn), phải
   đặt tên vai trò rõ ràng (`--c-success`, `--c-danger`…) trong `index.css`, không chèn hex rời.
3. **Quy tắc Typography — bảng phân cấp đầy đủ:** dự án chưa có bảng phân cấp chính thức — khi
   thêm màn hình mới, khai rõ heading dùng cỡ nào theo thang Tailwind hiện có
   (`text-2xl font-bold` cho `h1`, `text-xl font-semibold` cho `h2`, `text-base` cho thân bài,
   `text-sm`/`text-xs` cho phụ trợ — sàn 11px tuyệt đối theo mục 2), tránh mỗi trang tự chế một
   cỡ chữ khác nhau cho cùng cấp tiêu đề.
4. **Component Stylings kèm biến thể trạng thái:** khi định nghĩa 1 component tái dùng (nút, thẻ,
   input, nav item), liệt kê ĐỦ biến thể trong cùng 1 chỗ — mặc định/hover/active/focus/disabled
   (đã có ở mục 4) — **VÀ** kích thước (sm/md/lg nếu có nhiều nơi dùng), không rải rác định nghĩa
   lại cùng component ở nhiều file.
5. **Nguyên tắc Bố cục — thang khoảng cách (Layout Principles & Spacing Scale):** dùng thang
   spacing gốc của Tailwind (`gap-2/3/4/6/8`…), KHÔNG tự chế giá trị `px` tuỳ ý; card/section
   cách nhau tối thiểu `gap-4` trên mobile, `gap-6` trở lên trên desktop.
6. **Chiều sâu & Phân lớp (Depth & Elevation — mục còn thiếu trước bản V7.0 này):** dự án dùng
   3 cấp bề mặt rõ rệt qua nền + viền (KHÔNG dùng shadow nặng gây rối mắt trên nền tối):
   cấp nền trang (`bg-zinc-950`) → cấp thẻ/card (`bg-zinc-900` + `border-zinc-800`) → cấp nổi
   (modal/dropdown/toast: `bg-zinc-900/95` + `border-zinc-700` + `backdrop-blur` nếu che nội dung
   phía sau). Modal/toast luôn có lớp phủ nền `bg-black/60` phía sau để tách bạch cấp.
7. **Do's and Don'ts (rào chắn thiết kế) — chốt lại các luật đã có rải rác:**
   - ✅ Dùng token, không hardcode hex · ✅ Đủ 5 trạng thái (mục 3) · ✅ Vùng chạm ≥44px ·
     ✅ Giữ màu ngữ nghĩa nhất quán (xanh lá = "đúng", đỏ = lỗi) · ✅ Tương phản AAA cho nội
     dung/tiêu đề, AA cho phần còn lại.
   - ❌ Không thêm shadow đậm/gradient loè loẹt phá vỡ "mood" theme tối · ❌ Không tự chế cỡ chữ/
     khoảng cách ngoài thang chuẩn · ❌ Không để icon-only thiếu `aria-label` · ❌ Không copy y
     nguyên phong cách "retro web"/trang ngoài vào DHCB — mọi component mới phải khớp 1 trong 4
     theme sẵn có, không du nhập phong cách rời rạc.
8. **Hành vi Responsive (mục còn thiếu trước bản V7.0 này) — breakpoint & chiến lược:** mobile-
   first tuyệt đối (mục 4, KHUNG bất biến #7): thiết kế cho màn hẹp nhất trước, dùng breakpoint
   Tailwind mặc định `sm(640) / md(768) / lg(1024) / xl(1280)`; nav/menu chuyển từ dạng tab dưới
   (mobile) sang sidebar/topbar (từ `md` trở lên — xem `apps/dhcb/src/components` nav desktop vs
   mobile hiện có); bảng dữ liệu rộng trên mobile phải có phương án cuộn ngang hoặc rút gọn cột,
   không được tràn layout.

**Ghi chú nguồn:** áp dụng như checklist tư duy, KHÔNG sinh file `DESIGN.md`/`preview.html` mới
trong repo — DHCB đã có nguồn sự thật token riêng (`apps/dhcb/src/index.css` +
`tailwind.config.js` + `packages/core-ui/theme.ts`), tránh hai nguồn song song gây lệch.
