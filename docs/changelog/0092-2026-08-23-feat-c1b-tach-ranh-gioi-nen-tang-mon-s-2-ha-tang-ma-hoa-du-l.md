# feat: C1b tách ranh giới nền tảng/môn + S-2 hạ tầng mã hoá dữ liệu người dùng (2026-08-23)

**Người dùng chốt 3 việc:** ① hồ sơ năng lực **ẩn nhưng xem được khi hỏi** · ② bộ **5 câu**
onboarding duyệt nguyên trạng · ③ **làm C1b luôn**. Kèm yêu cầu mới: _"mã hoá toàn bộ dữ liệu
người dùng, chỉ tài khoản đó khi kích hoạt 2FA thì mới xem và hỏi được"_.

**Đã làm (code, cổng xanh toàn bộ):**

1. **S-2 — hạ tầng mã hoá** `packages/core-config/userDataCrypto.ts` (+18 test):
   AES-256-GCM, khoá mỗi người suy ra bằng `HMAC(USER_DATA_MASTER_KEY, user_id)` nên **không cần
   bảng khoá**; chuỗi lưu tự mô tả `v<n>:<iv>:<cipher>` ⇒ không cần cột phụ; **IV luôn ngẫu nhiên**
   (tránh đúng lỗi dùng lại nonce mà `ttsCrypto` từng mắc, audit 2026-08-12); **`keyVersion` có
   ngay từ bản đầu** nên xoay khoá không phải viết lại toàn bộ dữ liệu; `isEncryptedField()` cho
   phép chuyển đổi DẦN (bản ghi cũ plaintext vẫn đọc được); `hashLookupValue()` cho cột cần tra cứu
   (email) — cố định phiên bản 1 vì đổi là mọi user cũ không đăng nhập được. Biến môi trường +
   **cảnh báo mất khoá = mất vĩnh viễn** đã ghi vào `.env.example`.
2. **C1b — tách ranh giới nền tảng vs môn học:** migration `0059` + `/api/profile` (+5 test).
   `english.user_profile` (bảng NGỦ từ `0036`) được đánh thức: **dual-write trong một
   transaction**, đọc bằng LEFT JOIN ưu tiên bảng môn rồi rơi về `public.profiles`.
   **Sửa một phân loại sai của `0036`:** `age_group` là dữ liệu **NỀN TẢNG** (quyết định giọng
   Companion qua `ageGroupToneBlock`, nội dung theo lứa, băng tuổi hồ sơ năng lực — dùng cho MỌI
   môn), không phải dữ liệu môn Anh ⇒ `0059` xoá cột trùng bên bảng môn, giữ nguồn sự thật duy
   nhất ở `public.profiles`. Rollback = revert code, **không đụng dữ liệu**.

**Tài liệu mới:** `docs/research/dac-ta-ma-hoa-du-lieu-va-2fa-2026-08-23.md` — khảo sát hiện trạng
(**2FA CHƯA CÓ**; đã có tiền lệ mã hoá ở `core-ai/ttsCrypto.ts`), so sánh mã hoá phía server vs
E2EE, **phân tầng T0/T1/T2**, thiết kế TOTP (mã khôi phục, cửa sổ nâng quyền 15 phút, chống dò),
và bảng "mã hoá KHÔNG giải quyết được gì".

**Ba điểm tôi nói ngược lại, chờ người dùng chốt (mục 7 của tài liệu đó):**

1. **Không nên làm E2EE.** Khoá dẫn xuất từ mật khẩu người dùng ⇒ server mù ⇒ **Companion không
   đọc được hồ sơ** (mất chức năng cốt lõi), **quên mật khẩu = mất sạch dữ liệu**, không tính được
   streak/lượt dùng/bảng xếp hạng. Khuyến nghị **mã hoá phía server** (đã dựng ở S-2).
2. **2FA nên TUỲ CHỌN**, chỉ bắt buộc khi XEM hồ sơ ẩn / hỏi "bạn biết gì về tôi". Bắt buộc toàn
   bộ sẽ chặn học sinh 10–18 chưa có điện thoại riêng. Companion vẫn **dùng** hồ sơ để gợi ý mà
   không cần 2FA; chỉ **đọc nội dung hồ sơ ra thành lời** mới cần.
3. **Mã hoá dữ liệu cũ (S-4) nên để sau.** Dữ liệu MỚI mã hoá gần như miễn phí (chưa tồn tại);
   dữ liệu CŨ đắt và rủi ro cao. Thứ tự đề xuất: **S-1 (2FA) → S-3 (mã hoá dữ liệu mới) → dừng
   đánh giá → S-4**.

**➡️ Người dùng chốt (2026-08-23): MÃ HOÁ — GHI NỢ.** Hạ tầng giữ lại (đã có test, đang NGỦ,
không nối vào dữ liệu nào nên không ảnh hưởng gì đang chạy). Điều kiện gỡ nợ + rủi ro đang chấp
nhận: xem mục "Nợ kỹ thuật còn mở" đầu danh sách.
