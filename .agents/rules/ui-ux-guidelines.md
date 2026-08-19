---
description: 'Quy chuẩn UI/UX & Triển khai giao diện Đồng Hành — Áp dụng tự động cho mọi thay đổi Frontend (apps/english/src/**, components, UI)'
---

# QUY CHUẨN THIẾT KẾ UI/UX & QUY TRÌNH TRIỂN KHAI FRONTEND ĐỒNG HÀNH

Mỗi khi tạo mới hoặc sửa đổi component giao diện trong `apps/english/src/**`, AI Agent BẮT BUỘC tuân thủ:

1. **Quy trình 5 bước:**
   - **B1 (Bối cảnh):** AI Chat / Voice Tutor (Waveform, Bubble) | Gamification & Luyện tập (SRS Flashcards, Quiz spring animation) | Dashboard (Bento Grid) | Thanh toán (VietQR, Pricing).
   - **B2 (Design Tokens):** Dùng thang `zinc` + biến CSS `accent` (`bg-zinc-950`, `bg-zinc-900`, `text-zinc-100`, `text-zinc-400`, `text-accent-400`, `bg-accent-500`). **CẤM** hardcode mã hex `#...`.
   - **B3 (5 Trạng thái):** Bắt buộc làm đủ Empty (gợi ý bắt đầu), Loading Skeleton (CLS < 0.1), Data Loaded, Error/Retry, Validation Feedback.
   - **B4 (A11y & Micro-Interactions):** Đủ trạng thái `hover`, `active:scale-[0.98]`, `focus-visible`, `disabled`. Vùng chạm mobile tối thiểu $\ge 44\text{px}$. Nút icon phải có `aria-label` và `title`.
   - **B5 (Verification):** Chạy `npm run lint` và `npm run typecheck`.

2. **Chi tiết tra cứu:** Đọc kỹ hướng dẫn tại [.agents/skills/ui-ux-craftsman/SKILL.md](file:///c:/Users/liend/donghanh/.agents/skills/ui-ux-craftsman/SKILL.md).
