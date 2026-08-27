# feat(programming): chi tiết chặng S4 cho toàn bộ 13 hướng chuyên sâu (2026-08-27)

**Nhánh:** `claude/chi-tiet-chang-s4-13-huong`

## Bối cảnh

PR #718 và #719 mở tầng "chi tiết chặng" (`SpecStageDetail`) cho S2 và S3 của 13 hướng; PR #720
soạn bài học 8 bước cho `web-s4`. Còn trống đúng một mảng: **chi tiết chặng S4 của 12 hướng kia**
— người học mở trang chặng đích của hướng mình chọn thì thấy ít hơn hẳn hai chặng trước đó. Đợt
này lấp kín, để cả 13 hướng đều có chi tiết đủ **4/4 chặng**.

## Đã làm

- **13 file mới** `specializations/details/<hướng>-s4.ts`, mỗi file: 4 module (riêng `algo`,
  `web`… theo đúng bản đồ hướng) × (mục tiêu · 2–4 bài luyện tay · 2–3 câu tự kiểm có đáp án ·
  2–3 dấu hiệu đã nắm), 4–5 tiêu chí rubric có cách chứng minh, và đặc tả mẫu 6 ô.
- Đăng ký 13 mục vào `specializations/stageDetails.ts` (chỉ THÊM phần tử, không đổi thứ tự cũ).
- **Siết cổng:** thêm ca "mỗi hướng có đúng một chi tiết cho chặng S4" vào
  `specStageDetails.test.ts` — thiếu một hướng là CI đỏ, không phải trang thiếu nội dung.
- Đặc tả giao việc: `docs/specs/2026-08-27-chi-tiet-chang-s4-13-huong.md`.

## Quyết định kèm theo

- **Đảo lại nhận định của đặc tả S3 rằng "S4 phụ thuộc bối cảnh công ty nên không đặc tả chung
  được".** Nhận định đó đúng một nửa: thứ không đặc tả chung được là **quy mô và công cụ**; thứ
  đặc tả chung được — và cũng là thứ phân biệt chuyên gia với người thạo việc — là **trách
  nhiệm**: nói được hệ chịu được bao nhiêu, hỏng thì ai làm gì, chứng minh bằng số nào. Nên nội
  dung S4 bám vào **diễn tập, số đo và nghiệm thu**, không bám tên công nghệ.
- **Hình dạng `practice` của S4 khác S2/S3 một cách có chủ ý:** phần lớn là ĐO và DIỄN TẬP (khôi
  phục dữ liệu, sự cố, chuyển vùng, cập nhật theo đợt có đường lui) chứ không phải viết thêm tính
  năng. Ở bậc này, thứ chưa từng diễn tập thì coi như chưa có.
- **Ràng buộc riêng ghi thẳng vào dữ liệu, không để ngầm:** hướng `security` ghi luật đạo đức
  (chỉ tấn công hệ thống của chính mình hoặc môi trường được phép) vào comment đầu file và ô
  "KHÔNG làm"; hướng `systems` ghi lời khuyên chọn MỘT đường (ngôn ngữ hoặc nhân) vì làm dở cả
  hai thì không chứng minh được gì.
- **`web-s4` nói rõ quan hệ hai tầng** ngay trong comment: chi tiết chặng KHÔNG thay thế bài học
  8 bước đã có ở `p6-u22`…`p6-u24`, hai tầng bổ sung nhau.

## Bằng chứng kiểm chứng

- Cổng chống copy-paste giữa các hướng làm đúng việc của nó: mọi mục tiêu module và tiêu chí
  rubric phải khác nguyên văn giữa 13 hướng, nên không hướng nào lấp bằng cách chép hướng khác.
- `npm test` — 490 file, toàn bộ xanh; `specStageDetails.test.ts` từ 16 lên **17 ca** (thêm ca S4).
- `npm run typecheck` · `npm run lint` (0 cảnh báo) · `npm run build` · `npm run budget` — sạch.

## Việc để ngỏ (cố ý)

- **Bài học 8 bước cho S4 của 12 hướng còn lại** (`p6-u25`…`p6-u60`) — tầng khác, đặc tả riêng ở
  `docs/specs/2026-08-27-chang-s4-13-huong.md`.
- **Chi tiết chặng S1** của mọi hướng vẫn chưa soạn (S1 là chặng nhập môn, hai hướng `web` và
  `architecture` đã có bài học 8 bước thay thế phần đó).
