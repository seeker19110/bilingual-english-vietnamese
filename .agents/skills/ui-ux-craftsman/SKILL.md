---
name: ui-ux-craftsman
description: 'Quy chuẩn thiết kế UI/UX đỉnh cao và quy trình triển khai giao diện cho Đồng Hành (Personal AI Companion & English Tutor). Bắt buộc kích hoạt khi tạo mới, thiết kế, review hoặc sửa đổi bất kỳ trang (page), layout, modal, form, audio/voice widget, quiz, flashcard, dashboard hay component nào.'
---

# UI/UX CRAFTSMAN — QUY CHUẨN THIẾT KẾ & QUY TRÌNH TRIỂN KHAI GIAO DIỆN ĐỒNG HÀNH

Bộ Skill này đóng gói toàn bộ tri thức thiết kế UI/UX hiện đại, tâm lý học học tập (learning ergonomics), hiệu ứng chuyển động mượt mà (smooth motion), chuẩn khả năng tiếp cận (WCAG 2.2 AA) và quy trình triển khai giao diện cho hệ sinh thái Đồng Hành.

---

## 1. QUY TRÌNH 5 BƯỚC TRIỂN KHAI KHI CODE GIAO DIỆN MỚI

Mọi thay đổi giao diện trong `apps/english/src/**` đều phải tuân thủ 5 bước tuần tự:

```
[B1: Bối cảnh & Phân loại] ──► [B2: Thiết kế Tokens & Bố cục] ──► [B3: Đủ 5 Trạng thái] ──► [B4: Micro-Interactions] ──► [B5: Verification Gate]
```

### Bước 1: Xác định Phân loại Màn hình & Bối cảnh Trải nghiệm

1. **Hội thoại & Trợ lý Giọng nói AI (Chat, Voice Tutor, STT/TTS):**
   - Không gian hội thoại tập trung, bong bóng chat (chat bubbles) phân cấp người dùng và AI rõ ràng.
   - Trạng thái Voice trực quan: `Idle` $\rightarrow$ `Listening (Waveform animation)` $\rightarrow$ `Processing/Thinking` $\rightarrow$ `Speaking`.
   - Phân tích ngữ âm/từ vựng (phonetics & grammar) mở rộng dạng Popover/Card tinh tế.
2. **Luyện tập & Gamification (SRS Flashcards, Quiz, Quests, Streaks):**
   - Tương tác nảy (spring physics), phản hồi thị giác ngay lập tức khi trả lời Đúng/Sai (Confetti, rung nhẹ haptic/shake).
   - Thẻ từ vựng lật mượt 3D (`flip animation`), nút bấm to rõ dễ thao tác trên mobile.
3. **Bảng điều khiển & Tiến độ Cá nhân (Personal Hub, Radar Chart, Streak Counter):**
   - Bố cục **Bento Grid** hiện đại, kết hợp biểu đồ phân tích kỹ năng (Speaking/Listening/Writing/Reading).
   - Hiển thị streak lửa và điểm thưởng nổi bật tạo động lực học tập.
4. **Thanh toán & Nâng cấp Gói (Pricing Matrix, VietQR Modal):**
   - Bảng giá phân tầng rõ ràng (Free / Pro / VIP), nhấn mạnh giá trị cốt lõi.
   - Modal quét mã VietQR tự động cập nhật trạng thái khi thanh toán thành công (Zero-friction checkout).

---

### Bước 2: Thiết kế Bố cục & Tuân thủ Design Tokens

- **Cơ chế Đảo màu qua Biến CSS:**
  - Sử dụng hệ màu semantic được map qua biến CSS:
    - Thang nền/viền/chữ: `bg-zinc-950`, `bg-zinc-900`, `border-zinc-800`, `text-zinc-100`, `text-zinc-400`.
    - Màu nhấn thương hiệu: `bg-accent-500`, `text-accent-400`, `border-accent-500/30`.
    - Màu tương phản cố định: `text-white` / `bg-white`.
  - **CẤM** hardcode mã hex `#...` trong component giao diện.
- **Hệ thống Lưới & Khoảng cách:**
  - Lưới cơ sở 4px / 8px: `gap-2`, `gap-3`, `gap-4`, `p-4`, `p-6`.
  - Vùng chạm tối thiểu trên mobile: $\ge 44 \times 44\text{px}$ cho tất cả nút bấm và icon interactive.

---

### Bước 3: Đảm bảo đầy đủ 5 Trạng thái Bắt buộc (The 5 States)

Mọi màn hình hoặc component có tương tác/tải dữ liệu phải xử lý trọn vẹn:

1. **Initial / Empty State:**
   - Khi chưa có dữ liệu/tin nhắn: Icon minh họa sinh động + Lời chào thân thiện + Gợi ý bắt đầu (Prompt starters / Topic suggestions).
2. **Loading / Skeleton State:**
   - Khung xương tải mờ (`animate-pulse`) khớp chính xác bố cục thật, chống giật layout (CLS < 0.1).
3. **Data Loaded State:**
   - Trạng thái hiển thị nội dung hoàn chỉnh, mượt mà.
4. **Error / Offline State:**
   - Thông báo lỗi ấm áp, thân thiện kèm nút "Thử lại" hoặc tiếp tục học offline.
5. **Validation Feedback:**
   - Báo lỗi trường nhập liệu, âm thanh / hình ảnh phản hồi khi hoàn thành bài tập.

---

### Bước 4: Vi tương tác & Khả năng Tiếp cận (Micro-Interactions & A11y)

- **Nút bấm & Clickable:** Đủ trạng thái `hover:bg-...`, `active:scale-[0.98]`, `focus-visible:ring-2 focus-visible:ring-accent-500`, `disabled:opacity-50`.
- **Chuyển động giao diện:** Ưu tiên chuyển động mượt mà với `framer-motion` hoặc CSS transitions (`duration-200 ease-out`).
- **A11y (WCAG 2.2 AA):**
  - Mọi nút Icon-only phải có `aria-label` và `title`.
  - Độ tương phản chữ tối thiểu $4.5:1$ trên tất cả theme.

---

### Bước 5: Cổng Kiểm thử (Verification Gate)

Trước khi bàn giao code, chạy:

1. `npm run lint` — Kiểm tra toàn bộ cú pháp code.
2. `npm run typecheck` — TypeScript strict không còn lỗi type.
3. `npm test` — Chạy pass các unit tests liên quan.

---

## 2. MẪU COMPONENT CHUẨN MỰC (GOLDEN PATTERNS)

### Mẫu 1: Card Chủ đề Học tập (Learning Topic Bento Card)

```tsx
export function LearningTopicCard({ title, level, progress, icon: Icon, onClick }: TopicCardProps) {
  return (
    <button
      onClick={onClick}
      className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-accent-500/50 hover:bg-zinc-900/80 active:scale-[0.98] transition-all text-left flex flex-col justify-between group focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:outline-none w-full"
    >
      <div className="flex items-center justify-between w-full">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-accent-400 group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5" />
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-500/10 text-accent-400 border border-accent-500/20">
          {level}
        </span>
      </div>
      <div className="mt-4">
        <h4 className="text-base font-semibold text-zinc-100 group-hover:text-accent-400 transition-colors">
          {title}
        </h4>
        <div className="mt-3 w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-accent-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </button>
  )
}
```
