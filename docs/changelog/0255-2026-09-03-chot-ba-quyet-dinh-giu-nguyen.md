# 0255 — 2026-09-03 — Chốt ba quyết định đang treo: giữ nguyên, thang bậc 5, sàn cover 90%

**PR:** #838 · **Loại:** `docs` — không đổi một dòng mã chạy nào.

## Bối cảnh

Ba câu hỏi tôi để mở ở các đợt trước đã được người dùng trả lời gọn trong một câu:
_"giữ nguyên mọi thứ, thang bậc 5 và cover 90%"_. Đợt này chỉ làm một việc: **ghi ba quyết định
đó thành văn bản** để phiên sau không đi hỏi lại, và quan trọng hơn — không tự ý "sửa" những thứ
đã được chốt là giữ nguyên.

## Đã làm

### 1. `Career.tsx` — giữ CẢ HAI thước đo, và mô tả nợ cũ là SAI

Trước khi ghi, tôi đọc lại code thay vì tin lời sổ nợ:

| Thước đo               | Cấp đo               | Vị trí                                          |
| ---------------------- | -------------------- | ----------------------------------------------- |
| "Số năm kinh nghiệm"   | **Hồ sơ** (cả người) | `<Field label="Số năm kinh nghiệm">` — dòng 662 |
| Thang 5 bậc thành thạo | **Từng kỹ năng**     | nhãn "Bạn đang ở bậc:" — dòng 534               |

Chúng đo hai cấp khác nhau nên **bổ sung nhau chứ không mâu thuẫn**. Mô tả cũ trong sổ nợ ("hai
thước đo mâu thuẫn đang sống song song") không đúng thực tế. Đã đóng mục nợ kèm lý do và số dòng
đã kiểm.

### 2. Coverage — giữ sàn 90%, biên độ hẹp là trạng thái đã chốt

Branches 90,70% trên sàn 90 (dư 0,70 điểm). Quyết định: **không nâng ngưỡng, không chạy đợt viết
test chỉ để đẩy con số.** Đã ghi kèm dặn dò cho phiên sau: thấy `npm run budget` cảnh báo "biên
độ hẹp" thì đừng coi đó là việc bỏ sót. Điều vẫn đúng: tính năng mới phải tự mang test cho nhánh
logic của nó.

### 3. Không tự khởi động việc mới

Hai việc còn mở — đối chiếu Nginx trên VPS, và chạy `npm run swift:conformance` để mở cổng cứng
cho track Swift — vẫn là **việc tay của người dùng**, vì cần SSH và toolchain thật.

## Kiểm chứng

`git diff --stat` chỉ chạm `PROGRESS.md` + file nhật ký này. Không file `.ts`/`.tsx` nào trong
diff, nên không có rủi ro hành vi. Rollback = revert commit.
