# 0254 — 2026-09-03 — Cổng canh 6 hành vi hộp thoại, và soát lại sổ nợ kỹ thuật

PR: (điền sau) · Nhánh: `claude/viec-tiep-theo-mjoode`

## Bối cảnh

Chương trình M khép ở PR-M12 (#836). Đi tìm việc tiếp theo, tôi mở mục "Nợ kỹ thuật còn mở" của
`PROGRESS.md` và định làm mục _"`FeedbackModal.tsx` thiếu Escape + bẫy tiêu điểm"_.

**Mục đó đã được sửa từ trước.** File nay dùng hook `useDialogBehavior`. Sổ nợ nói sai thực tế,
và nó vừa làm tôi mất công đi làm một việc đã xong — đúng thứ mà Tầng 6b của
`docs/framework/QUY-TRINH-AUDIT.md` đặt ra để chặn ("tài liệu điều hành có nói đúng thực tế
không").

Nên đợt này làm hai việc: soát lại cả bốn mục nợ đang mở **bằng chứng cứ**, và bịt lỗ hổng thật
sự tìm thấy trên đường.

## Lỗ hổng thật: hạ tầng a11y dùng chung KHÔNG có một test nào

`useDialogBehavior.ts` cài **6 hành vi bắt buộc của hộp thoại** (role/aria-modal/aria-labelledby ·
Escape · bẫy tiêu điểm · tự đưa và TRẢ tiêu điểm · bấm nền · khoá cuộn nền), và được dùng lại ở
nhiều hộp thoại có bố cục riêng: `FeedbackModal`, `ShareProgress`, `QuickActions`,
`PvPArenaLobbyModal`, `PvPBattlefieldModal`…

Trước đợt này nó **không có test nào**. Và nó nằm đúng **vùng mù của cổng a11y e2e**:
`e2e/a11y.spec.ts` quét trang lúc mới tải, khi mọi hộp thoại còn đóng — axe không bao giờ nhìn
thấy chúng.

Hệ quả nếu để trống: ai đó bỏ `onKeyDown` khỏi một hộp thoại, hoặc sửa hook làm hỏng bẫy tiêu
điểm, thì **người dùng bàn phím bị kẹt trong hộp thoại mà không cổng nào đỏ**. Hỏng im lặng, trên
đúng thứ CLAUDE.md mục 4.5 đặt làm sàn cứng.

Đã thêm `useDialogBehavior.test.tsx` — **11 test canh đủ 6 hành vi**, gồm cả các ca dễ bị bỏ sót:
Tab ở GIỮA thì không được can thiệp · bấm phần tử con KHÔNG được đóng (nếu không người dùng mất
dữ liệu đang nhập) · khoá cuộn phải **trả lại giá trị cũ** chứ không xoá trắng · hộp thoại đang
ĐÓNG thì không được cướp tiêu điểm hay khoá cuộn.

### Test có thật sự bắt lỗi không — đã kiểm bằng đột biến

11 test xanh ngay lượt đầu là chuyện đáng nghi, nên tôi **cố tình phá hook ba lần** rồi chạy lại:

| Đột biến                     | Kết quả       |
| ---------------------------- | ------------- |
| Bỏ xử lý `Escape`            | ❌ 1 test đỏ  |
| Bỏ bẫy tiêu điểm (`Tab`)     | ❌ 2 test đỏ  |
| Không trả tiêu điểm khi đóng | ❌ 1 test đỏ  |
| Khôi phục nguyên trạng       | ✅ 11/11 xanh |

Đã xác minh `git diff` của hook rỗng sau khi khôi phục — không sót đột biến nào.

## Soát lại sổ nợ: 2 trong 4 mục đã lạc hậu

| Mục nợ                                                       | Kiểm bằng                                                                                    | Kết luận                                      |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Hai file cấu hình Nginx cùng mô tả một server                | `ls nginx/*.conf` → vẫn còn `dhcb.conf` và `en-vi.conf`                                      | **CÒN MỞ** (cần SSH lên VPS — việc tay)       |
| `Career.tsx` vẫn hỏi "Số năm kinh nghiệm"                    | `yearsOfExperience` còn, kèm ô `type="number"`, sống song song với `PROFICIENCY_BAND_LABELS` | **CÒN MỞ** (cần người dùng quyết)             |
| `Work.tsx`/`Life.tsx` đặt `<Layout>` khác chỗ Career/Startup | Đo vị trí dòng: Career 966/970 · Startup 973/977 · Work 997/1001 · Life 992/996              | ✅ **KHÔNG CÒN** — cả bốn đã nhất quán ở CUỐI |
| `FeedbackModal` thiếu Escape + bẫy tiêu điểm                 | File dùng `useDialogBehavior`                                                                | ✅ **ĐÃ XONG**                                |

Đã sửa hai mục lạc hậu trong `PROGRESS.md`, **kèm số đo** để lần sau không phải đi đo lại.

## Điều đợt này KHÔNG làm được, nói thẳng

**Biên độ coverage branches vẫn mỏng nguyên: 90,70% / sàn 90 — dư 0,70 điểm.** `npm run budget`
vẫn cảnh báo "tính năng nhỏ kế tiếp nhiều khả năng sẽ làm CI đỏ".

11 test mới **không** cải thiện con số đó, và điều này là **đúng thiết kế chứ không phải thiếu
sót**: `vitest.config.ts` cố ý loại `components/` khỏi phép đo coverage (quyết định 2026-08-03,
lý do ghi ngay trong config: hook/UI chỉ là vỏ mỏng, test cho chúng chủ yếu kiểm chứng chính cái
mock vừa dựng). Hook này nằm ở `apps/dhcb/src/components/`, nên nằm ngoài phép đo.

Nói cách khác: giá trị của đợt này là **cổng canh**, không phải con số. Ai muốn nới biên độ
coverage thì phải nhắm vào `packages/**` và `apps/dhcb/src/lib/**` — số đo hiện tại (đo lại
2026-09-03, 1.458 nhánh chưa phủ) cho thấy chỗ đáng làm nhất là
`kotlinSim/interpreter.ts` (126 nhánh chưa phủ) · `swiftSim/interpreter.ts` (100) ·
`gitSim.ts` (59) · `openclawSim.ts` (49) · `core-auth/authService.ts` (23).

## Bằng chứng kiểm chứng

- 11 test mới xanh, và **đã kiểm bằng đột biến** rằng chúng thật sự bắt lỗi (bảng trên).
- `npm run typecheck` ✅ · `npm run lint` (0 cảnh báo) ✅ · `npm test` **545 file / 11.116 test
  xanh** ✅ · `npm run build` ✅ · `npm run test:coverage` ✅ (ngưỡng vẫn đạt).

## Việc tiếp theo

- **Nới biên độ coverage branches** — chỗ đáng làm đã liệt kê ở trên, kèm số nhánh chưa phủ.
- **Hai mục nợ còn mở** đều cần người dùng: Nginx (SSH lên VPS xem
  `/etc/nginx/sites-enabled/`, giữ đúng một file trong repo) và `Career.tsx` (bỏ "số năm kinh
  nghiệm" hay giữ song song với thang 5 bậc — quyết định sản phẩm).
- **Mạch Swift của chương trình M** vẫn chờ việc tay: `npm run swift:conformance` trên máy có
  Swift toolchain.
