# Audit chất lượng bài học & khoá học môn Lập trình — 2026-08-31

**Phạm vi:** toàn bộ nội dung học của môn Lập trình — 277 bài học 8 bước · 5 khoá ngắn ·
14 hướng chuyên sâu (52 chặng) · 1 lộ trình mục tiêu.
**Công cụ:** `npm run audit:lessons` (`scripts/audit-lessons.ts`) — chạy lại được, tất định.

## 1. Vì sao cần lớp rà này

Môn Lập trình đã có hai cổng CI mạnh cho nội dung: **khuôn** (Zod `LessonSchema`) và **code mẫu
chạy thật** (`lessonsPython/Ts/Sql/Git/Hermes/Vibe/Openclaw.test.ts` chấm `sampleSolution` bằng
đúng `grading.ts` học viên gặp). Nhưng cả hai đều kiểm TỪNG BÀI một cách cô lập. Còn một lớp lỗi
chỉ thấy khi nhìn toàn bộ kho nội dung cùng lúc:

| Loại lỗi                          | Cổng nào bắt được? | Hậu quả nếu lọt                                     |
| --------------------------------- | ------------------ | --------------------------------------------------- |
| Bài mồ côi (không trang nào dẫn)  | không cổng nào     | soạn xong nhưng học viên không bao giờ thấy         |
| Khoá/lộ trình trỏ bài không có    | test riêng lẻ      | nút "Vào học" dẫn tới trang trắng                   |
| Hai bài sinh ra CÙNG một URL slug | không cổng nào     | trang này đè trang kia sau khi đổi route            |
| Bước ⑥ chép lại nguyên bước ③     | không cổng nào     | bài "chạy đúng" nhưng học viên không phải nghĩ gì   |
| Thiếu ca test ẩn / gợi ý một bậc  | không cổng nào     | qua bài bằng hardcode; bí là tắc, không có đường ra |

## 2. Kết quả rà

### 2.1. Sạch ngay từ đầu (không phát hiện ca nào)

- **Tham chiếu:** 0 khoá ngắn / lộ trình trỏ bài hoặc chặng không tồn tại.
- **Bài mồ côi:** 0 — mọi bài đều đi tới được qua xương sống P1–P6, `SPEC_STAGE_UNITS`, hoặc
  một khoá ngắn.
- **URL:** 0 cặp `<mã>--<tiêu đề>` đụng nhau, 0 id trùng, 0 tiêu đề trùng.
- **Cấu trúc hướng:** 14/14 hướng đủ 4 chặng S1→S4, id chặng khớp `<hướng>-<bậc>`; mọi unit khai
  trong `SPEC_STAGE_UNITS` đều đã có bài thật.
- **Predict:** 0 bài có lựa chọn trùng nhau.

### 2.2. Đã tìm ra và ĐÃ SỬA trong đợt này

**9 bài có bước ⑥ (tự viết) trùng hệt bước ③ (ví dụ mẫu)** — ví dụ mẫu in ra đúng chuỗi lệnh mà
đề bài yêu cầu học viên tự nghĩ, nên bài Make chỉ còn là thao tác chép. Cách sửa: **đổi ví dụ mẫu
sang một tình huống KHÁC cùng khuôn** (giữ nguyên đề bài, test-case và lời giải), để bước ③ dạy
bằng ví dụ và bước ⑥ mới là lần đầu học viên tự làm.

| Bài              | Ví dụ mẫu trước (trùng đề)              | Ví dụ mẫu sau (tình huống khác)                 |
| ---------------- | --------------------------------------- | ----------------------------------------------- |
| `hermes-u1-l2`   | model `hermes-4-405b` + `tieu-hao-thap` | model `hermes-4-70b` + `hermes-4-mini`          |
| `hermes-u1-l5`   | profile `thu-ky` + `tro-ly-du-an`       | profile `ke-toan` + `cham-soc-khach`            |
| `hermes-u1-l7`   | `/learn bao-cao-tuan`                   | `/learn tom-tat-email`                          |
| `hermes-u2-l3`   | `litellm/hermes-4` + `-mini`            | `litellm/hermes-4-70b` + `litellm/curator-mini` |
| `hermes-u2-l5`   | `litellm/hermes-4`                      | `litellm/hermes-4-70b`                          |
| `vibe-u3-l2`     | tính năng "bộ đếm số lần chia tiền"     | tính năng "ghi chú cho lần chia tiền"           |
| `vibe-u3-l4`     | cặp tính năng thu-chi + tổng kết        | cặp tính năng danh sách món + tổng tiền bàn     |
| `vibe-u4-l2`     | "máy tính giảm giá"                     | "máy tính tiền boa"                             |
| `openclaw-u1-l2` | `onboard` + `gateway status`            | `onboard` + `models`                            |

Mọi ví dụ mẫu mới đều được cổng CI sẵn có chạy thật trên bộ mô phỏng tương ứng (mục 4).

### 2.3. Còn lại — ngoại lệ CÓ CHỦ Ý, không sửa

4 bài mở đầu khoá công cụ (`git-u4-l5`, `hermes-u1-l1`, `vibe-u1-l1`, `openclaw-u1-l1`) vẫn có
lời giải trùng ví dụ mẫu, vì lời giải chỉ có **đúng một lệnh** — bài dạy "đọc bảng trạng thái",
mà chỉ tồn tại một lệnh để gõ. Sửa ở đây sẽ là bịa thêm thao tác thừa. Script hạ chúng xuống mức
**cảnh báo** kèm lý do, không phải lỗi.

## 3. Hai heuristic đã bị loại vì tạo báo động giả

Ghi lại để lần sau không dựng lại:

1. **"Dòng Parsons trùng nhau ⇒ nhiều đáp án đúng" — SAI.** 59 ca ban đầu, soát tay thì tất cả
   đều hợp lệ (`git add .` xuất hiện hai lần, `kiemtra` hai lần, `return "dat"` hai lần…). Hai
   dòng GIỐNG HỆT nhau hoán vị cho nhau vẫn ra CÙNG một chuỗi kết quả, nên không hề có mơ hồ khi
   chấm. Đã bỏ hẳn luật này.
2. **"Không có ca test ẩn ⇒ hardcode được" — chỉ đúng với bài viết code.** Bài mô phỏng công cụ
   (git/hermes/vibe/openclaw/bash) học viên gõ LỆNH, output do bộ mô phỏng sinh, không hardcode
   được. Bài SQL có ca `match: 'exact'` phủ toàn bộ kết quả trên bộ dữ liệu cố định cũng vậy.
   Luật nay chỉ áp cho bài viết code không có ca `exact` — về 0 ca.

Ngoài ra mẫu bắt "chỗ soạn dở" ban đầu quét `TODO|xxx|chưa viết` trần, cho 4 báo động giả (bài
Git cố ý dạy `echo "xxx go nham xxx"`, bài đặc tả nói "giả định chưa viết ra"). Nay chỉ bắt
`TODO:`/`FIXME:` kiểu ghi chú người soạn và các câu hứa hẹn ("sẽ bổ sung sau", "đang soạn").

## 4. Bằng chứng kiểm chứng

- `npx tsx scripts/audit-lessons.ts` → **0 LỖI · 4 cảnh báo** (đúng 4 ngoại lệ ở mục 2.3).
- `npx vitest run packages/subject-programming/lessonsHermes.test.ts lessonsVibe.test.ts lessonsOpenclaw.test.ts lessons.test.ts`
  → xanh: mọi ví dụ mẫu mới chạy sạch trên bộ mô phỏng, mọi `sampleSolution` vẫn đạt 100% test-case.

## 5. Cổng CI (bổ sung 2026-08-31, người dùng chốt sau khi đọc báo cáo)

`npm run audit:lessons -- --ci` nay là **bước chặn CI**, đặt trong job `audit` của
`.github/workflows/ci.yml` (job đó nằm trong `needs` của required status check `quality`, nên
lỗi nội dung = PR không vào được `main`).

Vì sao đặt ở `audit` chứ không phải `unit`: theo luật CI của dự án (CLAUDE.md mục 11.1 luật 1)
bước mới phải gắn vào **job con hợp lý nhất**, không nối thêm vào job đã dài. `audit` là job
ngắn nhất (~40 giây), còn lượt rà này chỉ mất ~5 giây và không có I/O — nó không đụng tới đường
tới hạn, trong khi `unit` là một trong hai job dài nhất.

Đã kiểm chứng cổng **thật sự đỏ**, không phải xanh suông: cố ý làm ví dụ mẫu của `hermes-u1-l2`
trùng lại lời giải → script thoát mã 1 và gọi đúng tên bài; khôi phục → thoát mã 0.
