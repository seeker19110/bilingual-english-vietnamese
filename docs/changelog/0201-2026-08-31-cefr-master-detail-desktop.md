# 0201 — CefrLevelPage master–detail cho desktop (PR 3)

PR 3 trong loạt thiết kế lại web cho desktop (tiếp nối `0199-2026-08-30-thiet-ke-lai-web-cho-desktop.md`
— PR 1+2: sidebar + Chat hai cột). Trang cấp CEFR (`/lo-trinh-hoc/<cấp>`) trước đây khi mở 1
màn con (flashcard từ vựng / bài ngữ pháp / hội thoại) chiếm TOÀN màn hình kể cả ở desktop —
học xong một mục phải bấm "Back" về danh sách rồi mới chọn được mục tiếp theo.

## Đã làm

- `apps/dhcb/src/pages/subjects/english/CefrLevelPage.tsx`:
  - Thêm `masterList` — danh sách unit rút gọn (dùng lại nguyên `UnitSection` đã có, không viết
    component mới), tính TRƯỚC 3 nhánh early-return của màn con (hoist `unitLessonStarts` lên
    sớm hơn để `masterList` dùng được).
  - `shell()` nhận thêm tham số `master?: React.ReactNode` — khi có VÀ `isDesktop` (≥1024px,
    `useIsDesktopViewport` có sẵn từ PR 1+2), render 2 cột: trái là `masterList` (cuộn riêng,
    `max-h-[calc(100dvh-6rem)]`), phải là màn con đang mở. Bấm mục khác trong cột trái đổi
    thẳng cột phải (`setLesson`/`setCircle`/`onOpenDialogue` y hệt danh sách chính) — không rời
    trang.
  - 3 nhánh `dialogue`/`circle`/`lesson` truyền `masterList` vào `shell()`. Nhánh `examing` (thi
    cuối cấp) CỐ Ý không truyền — giữ toàn màn hình như cũ, kể cả ở desktop.
  - `<lg` (mobile/tablet): hành vi CŨ giữ nguyên 100% — `shell()` chỉ đổi bố cục khi
    `master && isDesktop` đều đúng.

## KHÔNG LÀM (đúng phạm vi PR 3)

- Không đổi trang `/lo-trinh-hoc` (danh sách 6 cấp) — chỉ đổi bên trong 1 trang cấp.
- Không thêm trạng thái "đang chọn" (highlight) cho mục trong cột trái — để đơn giản, không
  bắt buộc theo tiêu chí chấp nhận ban đầu.
- Không đổi `UnitSection` — dùng lại nguyên vẹn, chỉ gọi thêm 1 lần nữa ở vị trí mới.

## Bằng chứng kiểm chứng

```
Build ✅ | Type ✅ | Lint ✅ (0 cảnh báo)
Budget: JS 126.48/140kB (90.3%) | CSS 16.49/18kB (91.6%)
```

(Điền tiếp: unit test + E2E full suite sau khi chạy xong — xem mục Nghiệm thu ở spec liên quan
`docs/specs/2026-08-31-cefr-master-detail-desktop.md`.)
