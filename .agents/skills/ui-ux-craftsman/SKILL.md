---
name: ui-ux-craftsman
description: 'Quy chuẩn thiết kế UI/UX đỉnh cao và quy trình triển khai giao diện cho Đồng Hành (Personal AI Companion & English Tutor). Bắt buộc kích hoạt khi tạo mới, thiết kế, review hoặc sửa đổi bất kỳ trang (page), layout, modal, form, audio/voice widget, quiz, flashcard, dashboard hay component nào.'
---

# UI/UX CRAFTSMAN — QUY CHUẨN THIẾT KẾ & QUY TRÌNH TRIỂN KHAI GIAO DIỆN ĐỈNH CAO

Bộ Skill này đóng gói toàn bộ tri thức thiết kế UI/UX hiện đại, tâm lý học học tập (learning ergonomics), hiệu ứng chuyển động mượt mà (smooth motion), chuẩn khả năng tiếp cận (W3C WCAG 2.2 AAA/AA) và quy trình triển khai giao diện cho hệ sinh thái Đồng Hành.

---

## 1. QUY TRÌNH 5 BƯỚC TRIỂN KHAI KHI CODE GIAO DIỆN MỚI

Mọi thay đổi giao diện trong `apps/english/src/**` đều phải tuân thủ 5 bước tuần tự:

```
[B1: Bối cảnh & Phân loại] ──► [B2: Thiết kế Tokens & Bố cục] ──► [B3: Đủ 5 Trạng thái] ──► [B4: Micro-Interactions] ──► [B5: Verification Gate]
```

### Bước 1: Xác định Phân loại Màn hình & Bối cảnh Trải nghiệm

1. **Studio 1: Đối thoại & Voice Thời gian thực (Realtime Voice & CyberTutor):**
   - Không gian hội thoại tập trung, bong bóng chat phân cấp người dùng và AI rõ ràng.
   - Trạng thái Voice trực quan: `Idle` $\rightarrow$ `Listening (Waveform animation)` $\rightarrow$ `Processing/Thinking` $\rightarrow$ `Speaking`.
   - Phân tích ngữ âm/từ vựng (phonetics & grammar) mở rộng dạng Popover/Card tinh tế.
2. **Studio 2: Nhận thức Sâu & Cung điện Trí nhớ (Metacognitive Journal & Memory Palace):**
   - Không gian 3D/Isometric hiển thị bản đồ Loci và các điểm neo giác quan.
   - Nhật ký phản tỉnh Socratic với radar phân tích điểm mù tư duy và tiến trình MAI.
3. **Studio 3: Đấu trường Tranh biện & Labs STEM/Phonetics (Debate Arena & STEM Labs):**
   - Timeline phân tích luận điểm Toulmin Model 60 FPS mượt mà.
   - Bảng nháp tương tác từng bước STEM với phản hồi tức thì về tính hợp lệ đại số/hóa học.
4. **Studio 4: Đón đầu Tự trị & Lộ trình Vi mô (Proactive Nudges & Goal AutoPilot):**
   - Banner ngữ cảnh thông minh 1-chạm (Quick Action), thanh tiến độ phân kỳ mục tiêu.
5. **Studio 5: Tổng hợp Đa Miền & Studio Điều phối Agent (Life Synthesis & Orchestrator):**
   - Bento Grid đa chiều kết hợp biểu đồ radar năng lực (Learning, Career, Work, Startup, Life).
   - Canvas điều phối Agent tự trị với timeline hiển thị 5 bước (Plan $\to$ Execute $\to$ Verify $\to$ Reflect $\to$ Handoff).

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

1. **Initial / Empty State:**
   - Khi chưa có dữ liệu/tin nhắn: Icon sinh động + Lời chào ấm áp + Gợi ý bắt đầu (Prompt Starters / Topic Suggestions).
2. **Loading / Skeleton State:**
   - Khung xương tải mờ (`animate-pulse`) khớp chính xác kích thước thật, triệt tiêu hoàn toàn giật bố cục (CLS < 0.1).
3. **Data Loaded State:**
   - Hiển thị dữ liệu trọn vẹn, căn chỉnh lề chuẩn mực, typography sắc nét.
4. **Error / Offline State:**
   - Thông báo lỗi thân thiện kèm nguyên nhân + Nút "Thử lại ngay" (Retry Action) + Chế độ hoạt động Offline dự phòng.
5. **Validation Feedback:**
   - Phản hồi tức thì khi người dùng nhập liệu hoặc thực hiện hành động (Badge, âm thanh nhẹ, toast notification).

---

## 4. VI TƯƠNG TÁC & HIỆU ỨNG VẬT LÝ (MICRO-INTERACTIONS & MOTION)

- **Nút bấm & Card tương tác:** Đầy đủ `hover:border-accent-500/50`, `active:scale-[0.98]`, `focus-visible:ring-2 focus-visible:ring-accent-500`, `disabled:opacity-50 disabled:pointer-events-none`.
- **Chuyển động (Motion Ergonomics):** Sử dụng Spring Physics hoặc CSS Transitions (`transition-all duration-200 ease-out`).
- **A11y:** Mọi nút Icon-only phải có `aria-label` và `title` rõ nghĩa cho Screen Readers.

---

## 5. CỔNG KIỂM THỬ GIAO DIỆN (VERIFICATION GATE)

Trước khi hoàn tất code giao diện, bắt buộc chạy:

1. `npm run lint` — Kiểm tra toàn bộ cú pháp code & quy tắc a11y.
2. `npm run typecheck` — TypeScript strict 0 lỗi.
3. `npm test` — Chạy pass 100% tests liên quan đến component và hook.
