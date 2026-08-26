# feat: C1b-2 — luồng người mới 5 câu → hồ sơ ẩn → gợi ý một việc (2026-08-23)

Thi hành **Luật số 1** (kết quả chẩn đoán không bao giờ là màn hình chính) thành code chạy được.
Kiến trúc 3 lớp đúng đặc tả `luong-nguoi-moi-ho-so-nang-luc-an-2026-08-23.md`:

- **Lớp HỎI** — `pages/core/Intake.tsx` tại route `/bat-dau`: 5 câu, bỏ qua câu nào cũng được, bỏ
  hết vẫn vào được app. Không thanh tiến trình kiểu bài thi, không đếm điểm.
- **Lớp HỒ SƠ ẨN** — `core-personal/intakeService.ts` + migration `0061` (`personal.intake`).
  Hai câu TỰ DO (câu 3, 4) **mã hoá** bằng `userDataCrypto`; câu chọn-sẵn để nguyên (giá trị đóng,
  cần lọc/thống kê, chỉ 6 và 4 khả năng nên giấu cũng vô nghĩa). Nhóm tuổi **không** lưu ở đây —
  nguồn sự thật vẫn là `public.profiles.age_group` (giữ đúng ranh giới mà `0059` vừa dọn).
- **Lớp GỢI Ý** — `core-personal/intakeSuggestion.ts`: hàm THUẦN, tất định, không gọi AI. Trả đúng
  **1 việc** + ≤2 lựa chọn. Câu "vì sao" **trích lại lời người dùng** (ưu tiên câu 4 > câu 3 > mối
  bận tâm), không bao giờ nói về "hồ sơ" hay suy luận.

**Bộ lọc ngôn ngữ + test quét toàn bộ:** vì hàm thuần và không gian đầu vào nhỏ, test quét **hết
1.575 tổ hợp** (5 tuổi × 7 bận tâm × 5 đà học × 3 × 3 văn bản) và khẳng định không tổ hợp nào sinh
ra điểm số / xếp loại / so sánh / định mệnh luận tuổi tác. Đây là thứ biến Luật số 1 từ lời hứa
thành bảo chứng máy kiểm được (bất biến T1/T3 của đặc tả).

**Một bẫy đáng ghi lại:** bản đầu bộ lọc dùng `\b` của JS — nhưng `\b` chỉ hiểu `[A-Za-z0-9_]`,
nên `\bđáng lẽ` và `mà\b` KHÔNG BAO GIỜ khớp. Nghĩa là bộ lọc mù với đúng phần tiếng Việt có dấu
mà nó sinh ra để canh. Test bắt được ngay; đã đổi sang lookaround `(?<!\p{L})…(?!\p{L})` với cờ
`u`. **Bài học chung: đừng dùng `\b` cho tiếng Việt.**

**Luồng người mới nối liền:** `RequireAuth` đổi đích từ `/onboarding` → `/bat-dau`; trang `/bat-dau`
tự hỏi server, ai trả lời rồi thì chuyển thẳng sang `/onboarding` (onboarding MÔN). Cố ý **không**
thêm cờ vào payload `/api/auth` — cờ đó nằm trong luồng đăng nhập của mọi người dùng, đụng vào là
rủi ro cho cả người không liên quan. **Người đã onboarded từ trước không bao giờ vào nhánh này.**

**Kiểm chứng:** 5064 test xanh (+30 mới) · build/typecheck/lint xanh · `e2e/a11y-intake.spec.ts`
16/16 (3 màn × 5 theme + 1 test bất biến chống rò số) · migration `0061` chạy THẬT trên PostgreSQL 16
(idempotent, ràng buộc CHECK chặn đúng giá trị lạ) · boot check `/api/intake` trả 401 khi chưa đăng nhập.
