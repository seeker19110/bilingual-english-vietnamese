# 0218 — Bài học 8 bước thật cho chặng architecture-s2

- **Ngày:** 2026-08-31
- **PR:** #783
- **Nguồn nội dung:** `packages/subject-programming/specializations/architecture.ts` (chặng
  `architecture-s2` "Hợp đồng & mô hình miền", 4 module) +
  `docs/research/dac-ta-huong-chuyen-sau-mon-lap-trinh-2026-08-27.md`

> Đánh số 0218 (bỏ qua 0217) vì đợt `data-s2` được soạn SONG SONG trong cùng phiên và đã nhận
> số kế tiếp — tránh hai file changelog trùng tên gây xung đột khi hai nhánh gặp nhau.

## Việc đã làm

Soạn 6 bài học 8 bước thật cho chặng `architecture-s2` của hướng chuyên sâu Kiến trúc (trước đó
chặng này mới có metadata module, chưa có bài nào), ở 3 unit mới, làn `typescript` — mô phỏng
mọi khái niệm bằng hàm thuần tất định, không cần cài thư viện ngoài:

- `p6-u117` (module m1 "Mô hình hoá miền") — `lessons/p6u117.ts`:
  - `l1` ngôn ngữ chung + ngữ cảnh giới hạn: cùng chữ "đơn hàng" mang nghĩa khác nhau ở kho,
    kế toán và chăm sóc khách; mã đơn là thứ DUY NHẤT đi qua ranh giới hai ngữ cảnh.
  - `l2` thực thể vs đối tượng giá trị (so bằng định danh vs so mọi trường, vì sao giá trị nên
    bất biến) + bất biến nghiệp vụ "tồn kho không âm", kèm bẫy thứ tự kiểm (xuất số âm lọt qua
    sẽ LÀM TĂNG tồn kho).
- `p6-u118` (module m2 "Hợp đồng kiểm được") — `lessons/p6u118.ts`:
  - `l1` schema là hợp đồng kiểm được lúc chạy: kiểu TypeScript bốc hơi sau biên dịch nên dữ
    liệu ngoài phải kiểm ở biên; mô phỏng Zod bằng hàm nhận `unknown` và gom ĐỦ lỗi theo trường.
  - `l2` union phân biệt làm trạng thái sai bất khả biểu diễn, nhánh `default` gán `never` làm
    cửa canh đầy đủ, và luật "ca lỗi cũng là một phần hợp đồng".
- `p6-u119` (gộp module m3 "Tiến hoá không phá" + m4 "Dữ liệu là phần khó đổi nhất") —
  `lessons/p6u119.ts`:
  - `l1` bốn bước mở rộng → bù dữ liệu → chuyển đọc → thu hẹp; phân loại thay đổi an toàn vs phá
    vỡ (đổi tên = xoá + thêm; thêm trường bắt buộc cũng là phá vỡ; đổi Ý NGHĨA mà giữ tên là loại
    nguy hiểm nhất vì không công cụ nào bắt được); migration phải quay lui được.
  - `l2` nguồn sự thật duy nhất + ba chỗ sai đắt nhất: tiền (không dùng float — bài Predict dùng
    đúng `0.1 + 0.2`), thời gian (UTC, ba mốc hay bị gộp), định danh (không dùng số tự tăng làm
    mã công khai, không lấy dữ liệu nghiệp vụ làm khoá chính).

## Quyết định kèm theo

- 4 module gộp thành 3 unit: m3+m4 vào chung `p6-u119` vì cả hai cùng trả lời một câu hỏi —
  "đổi hợp đồng đã có người dùng thật thế nào cho an toàn" — đúng tiền lệ `backend-s2/s3/s4`.
- Đăng ký cầu nối: `'architecture-s2': ['p6-u117', 'p6-u118', 'p6-u119']` trong
  `specializations/stageUnits.ts`.
- Sửa `specializations/stageUnits.test.ts`: ca "chặng chưa soạn bài trả mảng rỗng" đổi ví dụ từ
  `architecture-s2` (nay đã có bài) sang `architecture-s4` (vẫn chưa có bài) — sửa dữ liệu ví dụ
  của test, không nới lỏng luật nào.

## Bằng chứng kiểm chứng

- `npx vitest run packages/subject-programming`: 49/49 file, 3064/3064 test xanh — gồm
  `lessonsTs.test.ts` (chạy tsc THẬT + node:vm: code mẫu đạt hết test-case, ví dụ mẫu chạy không
  lỗi, đáp án Predict khớp output thật), `lessons.test.ts`, `srsCards.test.ts`,
  `curriculum.test.ts`, `specializations/stageUnits.test.ts`.
- `npm run typecheck` sạch (cả 4 tsconfig).
- `npm run lint` (`--max-warnings 0`) sạch.
