# 0220 — 2026-08-31 — Bài học 8 bước thật cho chặng `architecture-s3` (hướng Kiến trúc)

**Đặc tả:** `docs/specs/2026-08-31-bai-hoc-chang-s3-huong-kien-truc.md`
(Trạng thái: Approved for implementation)

## Việc đã làm

Chặng `architecture-s3` ("Đặc tả thi hành được & nghiệm thu code mình không tự gõ") trước đây
mới có metadata 4 module trong `packages/subject-programming/specializations/architecture.ts`,
chưa có bài học nào — học viên bấm "Vào học" gặp trang trắng. Đợt này soạn **3 unit / 6 bài**
theo khuôn 8 bước, làn `typescript`, mô phỏng bằng hàm thuần tất định (không thư viện ngoài).

- **`p6-u123` — Đặc tả kín (m1)**
  - `p6-u123-l1` "Sáu ô bắt buộc": đo độ kín bằng máy thay vì bằng cảm giác — `oConThieu` /
    `doDoKin` / `sanSangGiao`. Ca biên dạy trong bài: ô chỉ chứa khoảng trắng vẫn là ô rỗng.
  - `p6-u123-l2` "Tiêu chí chấp nhận đo được": phân loại `do duoc` / `mo ho` (có con số VÀ
    không có từ cảm tính), viết tiêu chí TRƯỚC mô tả giải pháp, và dấu hiệu phải chia lát.
- **`p6-u124` — Giao việc cho AI hoặc cho người mới (m2)**
  - `p6-u124-l1` "Brief tự chứa": quét tham chiếu treo ("như đã bàn", "file đó", "cái kia") và
    đòi ít nhất một điểm chạm file trước khi bấm gửi.
  - `p6-u124-l2` "Chọn độ tự quyết & chống ảo giác": `chonDoTuQuyet` (cơ học / vừa / phức tạp
    theo luật CLAUDE.md mục 3) + `nghiemThuBaoCao` trả lại báo cáo có cờ đỏ khẳng định suông
    hoặc thiếu lệnh chạy kèm output.
- **`p6-u125` — Nghiệm thu (m3) GỘP Sổ quyết định ADR (m4)**
  - `p6-u125-l1` "Nghiệm thu theo tầng": test canh gác viết TRƯỚC khi giao việc; review 4 tầng
    hợp đồng → ranh giới → ca biên → phong cách, dừng ở tầng hỏng đầu tiên; cổng tự động phải
    xanh trước khi người bỏ công đọc.
  - `p6-u125-l2` "Sổ quyết định (ADR)": 5 phần bắt buộc, luật ghi cả phương án BỊ LOẠI (thiếu
    nó thì phiên sau sẽ đề xuất lại đúng nó), và luật đổi quyết định bằng ADR mới thay thế chứ
    không sửa đè.

Lý do gộp m3+m4 vào một unit: cả hai cùng trả lời "làm sao GIỮ ĐÚNG kết quả của code mình không
tự gõ" — nghiệm thu giữ đúng ở lượt này, ADR giữ đúng qua các lượt sau. Đúng tiền lệ gộp module
của `web-s1`, `backend-s3`, `architecture-s2`.

## Điểm chạm file

- Mới: `packages/subject-programming/lessons/p6u123.ts`, `p6u124.ts`, `p6u125.ts`.
- Sửa: `packages/subject-programming/lessons.ts` (import + spread 3 mảng bài),
  `packages/subject-programming/curriculum.ts` (3 entry `p6-u123..u125` ở bậc P6),
  `packages/subject-programming/specializations/stageUnits.ts` (`'architecture-s3': [...]`).
- Mới: `docs/specs/2026-08-31-bai-hoc-chang-s3-huong-kien-truc.md`, file nhật ký này.

## Bằng chứng kiểm chứng

```
$ npx vitest run packages/subject-programming
  Test Files  49 passed (49)
       Tests  3106 passed (3106)

$ npm run typecheck        # tsc 4 project — không lỗi
$ npx eslint packages/subject-programming --max-warnings 0   # sạch
$ npx prettier --check <các file đã chạm>                    # sạch
$ npm run build            # ✓ built in 3.25s, exit 0
```

Riêng `lessonsTs.test.ts` (217 test) chạy **tsc thật** cho từng bài mới rồi thực thi trong
`node:vm`: code mẫu đạt hết test-case, ví dụ mẫu chạy không lỗi, đáp án Predict khớp output
thật và không lựa chọn sai nào lại khớp.

## Ghi chú

Đợt này chạy song song với hai đợt soạn bài khác (`data-s3`, `mobile-s1`) trên cùng nhánh, nên
dải unit được chốt bằng cách đo số lớn nhất đang có ngay trước khi đặt tên: `p6-u123..u125`
(dải `p6-u126..u128` thuộc đợt `data-s3`). Không đụng `PROGRESS.md`.
