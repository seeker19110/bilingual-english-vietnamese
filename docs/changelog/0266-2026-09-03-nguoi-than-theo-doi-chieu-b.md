# 0266 — 2026-09-03 — "Người thân theo dõi" nay có bản chiều B

**PR:** (điền sau) · **Loại:** `feat` — trả một phần nợ kỹ thuật ghi ở `PROGRESS.md` "Hai tính
năng mới CHƯA có bản chiều B" (mở từ 2026-08-26, PR #706).

## Vấn đề

Tính năng "Người thân theo dõi" (báo cáo tuần cho bố mẹ/thầy cô qua email) ra mắt 2026-08-26 chỉ
có bản tiếng Việt: khối trong Hồ sơ ẩn hẳn khi `direction === 'B'` (người nước ngoài học tiếng
Việt), và nội dung thư (`weeklyReport.ts`) chỉ viết được tiếng Việt. Người dùng đã xác nhận đây là
nợ có chủ đích ("chiều A là ok rồi, chiều B nợ") — đợt này trả nợ đúng phần đã ghi trong đặc tả
"Việc phải làm khi trả nợ" mục 1, 2, 4 (một phần).

## Thi hành

- **`packages/core-contracts/companionLink.ts`** — thêm `direction: DirectionSchema.default('A')`
  vào `WeeklyReportDataSchema`. Dùng `.default('A')` (không phải `.optional()`) để dữ liệu/test cũ
  trước khi có trường này vẫn hợp lệ mà không cần sửa lại.
- **`apps/server/src/api/_lib/weeklyReport.ts`** — mọi câu (mở đầu/số liệu/câu hỏi gợi ý theo
  cấp/câu khép/footer riêng tư) nay có bản tiếng Anh riêng, chọn theo `data.direction`. KHÔNG
  dùng chung một bộ chuỗi rồi dịch máy — bản tiếng Anh viết tay theo đúng 3 luật giọng văn gốc
  (không phải bảng điểm, không so sánh, tuần kém không phải lời trách).
- **`apps/server/src/api/_lib/weeklyReportService.ts`** — thêm `parseDirection()` đọc
  `learning_progress.settings.direction` (cùng nguồn `packages/core-learner/learnerState.ts` dùng
  ở phía đọc trạng thái learner cho client, không tạo bảng/cột mới), mặc định `'A'` khi thiếu/rác.
- **`apps/dhcb/src/components/CompanionLinkSection.tsx`** — nhận prop `isA` (đúng khuôn
  `ReferralSection`), toàn bộ nhãn/nút/thông báo có bản tiếng Anh. `apps/dhcb/src/pages/core/
Profile.tsx` bỏ điều kiện `{isA && <CompanionLinkSection />}`, luôn render kèm `isA` prop.
- **`e2e/a11y-companion-link.spec.ts`** — thêm 2 theme + 1 vòng AAA quét ở `direction='B'`
  (`uiLang: 'en'`), cùng khuôn `a11y.spec.ts` đã dùng để gác trang chủ chiều B.

## Việc CHƯA làm (cố ý, tách khỏi đợt này)

Chế độ ôn thi (`/on-thi`) vẫn CHƯA có bản chiều B — khác "Người thân theo dõi", nó cần MỘT KỲ THI
KHÁC (VSTEP/chứng chỉ tiếng Việt cho người nước ngoài, không phải "vào lớp 10 — Tiếng Anh"), tức
là việc nội dung chứ không chỉ việc dịch chuỗi. Giữ nguyên trong nợ kỹ thuật, xem `PROGRESS.md`.

## Bằng chứng kiểm chứng

```
Build ✅ | Type ✅ | Lint ✅ (0 cảnh báo) | Format ✅ | Test ✅ (11160/11160, 551 file)
```

Test mới: `apps/server/src/api/_lib/weeklyReport.test.ts` (bổ sung describe "chiều B — thư viết
bằng tiếng Anh, không lẫn tiếng Việt" — canh cả từ trách móc bản tiếng Anh lẫn việc không lẫn dấu
tiếng Việt), `apps/server/src/api/_lib/weeklyReportService.test.ts` (đọc đúng `direction` từ
`settings`, mặc định A khi thiếu), `packages/core-personal/companionLinkService.test.ts` (cập
nhật danh sách trường ĐÓNG của `WeeklyReportDataSchema` thêm `direction`).
