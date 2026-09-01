# Spec: Animated Subject Illustrations & Lesson Page Redesign

**Approved for implementation**

## Mục tiêu

Thêm hình ảnh động SVG (thuần SMIL, zero runtime deps) đặc trưng cho từng môn học vào trang danh sách môn (`Subjects.tsx`) và trang chi tiết bài học (`SubjectDetail.tsx`), đồng thời redesign hero banner và chapter cards để tăng nhận diện thương hiệu và trải nghiệm học tập trực quan.

## Phạm vi

- `apps/dhcb/src/components/SubjectIllustration.tsx` — 6 SVG animation SMIL:
  - **Toán học**: đồ thị sin với điểm trượt
  - **Vật lý**: nguyên tử 3 electron quay 3 quỹ đạo
  - **Hóa học**: H₂O với liên kết dao động + electron nhấp nháy
  - **Sinh học**: DNA xoắn kép trượt liên tục
  - **Tiếng Anh**: sách mở + bong bóng hội thoại
  - **Lập trình**: terminal Python với cursor nhấp nháy
- `tailwind.config.js` — animations mới: `float`, `orbit`, `glow-pulse`
- `apps/dhcb/src/pages/learning/Subjects.tsx` — illustration nền mờ, stagger animation
- `apps/dhcb/src/pages/learning/SubjectDetail.tsx` — hero banner gradient, hoa văn lục giác, illustration nổi; chapter cards với số thứ tự + mini illustration

## Rủi ro & Giảm thiểu

- **Hiệu năng SVG**: Dùng SMIL thuần, không JS animation loop; kiểm tra trên thiết bị low-end qua E2E.
- **Contrast/A11y**: Tất cả text giữ nguyên class ≥ `text-xs` (12px) hoặc `text-[11px]`; badge "AI Gia Sư" đã được nâng lên `text-[11px]` theo luật UI nội bộ.
- **UI-only**: Không đụng backend, API, migrations, auth, billing — zero risk dữ liệu.

## Rollback

Revert commit trên nhánh `feat/subject-illustrations`; không cần migration hay script dữ liệu.

## Acceptance Criteria

- [ ] `npm run typecheck` không lỗi
- [ ] `npm run lint` không cảnh báo
- [ ] `npm run test` (bao gồm `scripts/ui-policy.test.ts`) qua 100%
- [ ] E2E a11y scans xanh
- [ ] Không có class `text-[9px]` hay `text-[10px]` trong codebase

## Tài liệu tham khảo

- `docs/research/uiux-va-giao-dien.md` — nghiên cứu UX/UI Đồng Hành
