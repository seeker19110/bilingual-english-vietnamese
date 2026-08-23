# Mã hoá dữ liệu người dùng + 2FA (2026-08-23)

> **Yêu cầu người dùng:** _"mã hóa toàn bộ dữ liệu người dùng, chỉ tài khoản đó khi kích hoạt 2FA
> thì mới xem và hỏi được."_
>
> Đây là quyết định đụng **bảo mật + dữ liệu người dùng thật + breaking change nhiều nơi** →
> CLAUDE.md §12 buộc phải trình bày trước khi làm. Tài liệu này: khảo sát hiện trạng, phân tích
> hai cách làm, **khuyến nghị**, và những chỗ cần bạn chốt.

---

## 1. Hiện trạng (đã kiểm bằng cách đọc code, không phỏng đoán)

| Hạng mục                    | Trạng thái                                                                                                                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2FA / TOTP**              | **CHƯA CÓ.** Không có file, cột DB, hay route nào. Phải xây từ đầu                                                                                                                       |
| Xác thực                    | Tự viết: Bearer token, email/mật khẩu + Google Identity Services (`packages/core-auth/`)                                                                                                 |
| **Mã hoá — đã có tiền lệ**  | `packages/core-ai/ttsCrypto.ts`: **AES-256-GCM**, khoá gốc từ env `TTS_ENCRYPTION_MASTER_KEY`, khoá từng bản ghi **suy ra bằng HMAC-SHA256** (không lưu khoá riêng ⇒ không cần thêm cột) |
| Dữ liệu người dùng hiện tại | Lưu **plaintext** trong PostgreSQL tự host (`public.profiles`, `learning_progress`, lịch sử chat, …)                                                                                     |
| Backup                      | DB + .env + cấu hình đẩy lên Cloudflare R2 (đã kiểm chứng 2 chiều 2026-08-01)                                                                                                            |

**Điểm đáng lo nhất hiện nay không phải thiếu mã hoá, mà là backup:** một bản dump DB nằm trên R2 ở
dạng plaintext — nếu lộ khoá R2 thì lộ toàn bộ dữ liệu. Mã hoá ở tầng ứng dụng đóng được đúng lỗ
hổng này.

---

## 2. "Mã hoá toàn bộ" — hai cách hiểu, hậu quả khác nhau rất xa

### Cách A — Mã hoá phía server, khoá do server giữ

Server giải mã khi phục vụ request. DB và backup chỉ chứa ciphertext.

|                         |                                                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Chống được**          | Lộ bản dump DB · lộ backup R2 · người có quyền đọc DB nhưng không có quyền vào server · lộ ổ đĩa            |
| **Không chống được**    | Kẻ chiếm được quyền chạy mã trên server (vì khoá cũng ở đó)                                                 |
| **Ảnh hưởng tính năng** | Gần như không. Companion vẫn đọc được hồ sơ, streak/lượt dùng/bảng xếp hạng vẫn chạy, admin vẫn hỗ trợ được |
| **Chi phí**             | Vừa. Tái dùng đúng khuôn `ttsCrypto.ts` đã có                                                               |
| **Quên mật khẩu**       | Bình thường, khôi phục được                                                                                 |

### Cách B — Mã hoá đầu-cuối (E2EE), khoá dẫn xuất từ mật khẩu người dùng

Chỉ người dùng đọc được. Server mù hoàn toàn.

|                            |                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Chống được**             | Mọi thứ ở cách A, **cộng thêm** kẻ chiếm quyền server, cộng thêm chính người vận hành                                                                                                                                                                                                                                                                                                                                                |
| **Cái mất — nghiêm trọng** | ① **Companion AI không đọc được hồ sơ** ⇒ mất trọn giá trị "bạn đồng hành biết ngữ cảnh" — đây là chức năng cốt lõi của DHCB<br>② **Quên mật khẩu = mất sạch dữ liệu vĩnh viễn**, không có đường khôi phục<br>③ Không tính được streak/bảng xếp hạng/lượt dùng phía server<br>④ Email nhắc học không có nội dung cá nhân hoá<br>⑤ Admin không hỗ trợ được người dùng gặp sự cố<br>⑥ Không tìm kiếm được trong dữ liệu của chính mình |
| **Chi phí**                | Rất lớn. Đụng gần như mọi tính năng đang chạy                                                                                                                                                                                                                                                                                                                                                                                        |

**Kết luận thẳng:** Cách B **mâu thuẫn trực tiếp** với chính tầm nhìn bạn đặt ra ở tài liệu đồng
hành — một Companion "biết ngữ cảnh mọi trụ" không thể vận hành trên dữ liệu nó không đọc được.

---

## 3. Khuyến nghị: Cách A + phân tầng nhạy cảm

Không mã hoá mọi thứ như nhau. Mã hoá **đồng loạt và mù quáng** làm hỏng truy vấn, chỉ số, và
hiệu năng mà không tăng an toàn tương ứng.

| Tầng              | Nội dung                                                                                                                        | Xử lý                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **T0 — Vận hành** | `user_id`, `plan`, ngày hết hạn, số lượt dùng, mốc thời gian, cờ trạng thái                                                     | **Không mã hoá.** Cần để truy vấn, đếm, lọc, tính hạn. Bản thân chúng không tiết lộ điều riêng tư |
| **T1 — Cá nhân**  | Tên, email, nhóm tuổi, mục tiêu học, tiến độ                                                                                    | **Mã hoá** (server đọc được). Email cần giữ thêm **cột băm** để tra cứu đăng nhập                 |
| **T2 — Nhạy cảm** | **Hồ sơ năng lực ẩn**, câu trả lời tự do câu 3–4, tín hiệu năng khiếu, hoàn cảnh chăm sóc/gián đoạn, nhật ký, ghi chú Companion | **Mã hoá + cần 2FA để XEM**                                                                       |

**Cơ chế khoá — tái dùng đúng khuôn đã có:**

```
khoá_người_dùng = HMAC-SHA256( USER_DATA_MASTER_KEY , user_id )
ciphertext       = AES-256-GCM( khoá_người_dùng , iv ngẫu nhiên , plaintext )
```

Không lưu khoá riêng cho từng bản ghi ⇒ không cần thêm cột khoá, y hệt cách `ttsCrypto.ts` đang làm
cho cache TTS.

### 3.1 Ba việc bắt buộc kèm theo (nếu thiếu thì mã hoá thành phản tác dụng)

| #   | Việc                                                       | Vì sao                                                                                                                                               |
| --- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Sao lưu khoá gốc ra NGOÀI server, ở nơi khác backup DB** | Mất khoá = mất **toàn bộ** dữ liệu, không cứu được. Đây là rủi ro lớn nhất của cả phương án. Khoá **không được** nằm cùng chỗ với bản dump nó bảo vệ |
| 2   | **Cột băm cho trường cần tra cứu** (email)                 | Ciphertext AES-GCM khác nhau mỗi lần ⇒ không `WHERE email = ?` được. Phải có `email_hash` (HMAC) để đăng nhập                                        |
| 3   | **Kế hoạch xoay khoá**                                     | Thêm `key_version` vào mỗi bản ghi từ đầu. Thêm sau thì phải viết lại toàn bộ dữ liệu                                                                |

---

## 4. 2FA — thiết kế

### 4.1 Chọn phương thức

| Phương thức                             | Đánh giá                                                                                                              |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **TOTP** (Google Authenticator, Authy…) | **Chọn cái này.** Miễn phí, không phụ thuộc nhà mạng, chuẩn mở (RFC 6238), thư viện phổ biến, hợp dự án vốn tối thiểu |
| SMS OTP                                 | Tốn tiền mỗi tin, kém an toàn (đổi SIM), phụ thuộc nhà mạng                                                           |
| Email OTP                               | Có thể làm phương án dự phòng — nhưng nếu email đã bị chiếm thì vô nghĩa                                              |
| WebAuthn/Passkey                        | An toàn nhất, nhưng phức tạp hơn nhiều. Để giai đoạn sau                                                              |

### 4.2 Điểm tôi cần nói ngược lại: 2FA **tuỳ chọn**, không bắt buộc

Yêu cầu ghi "chỉ tài khoản đó khi kích hoạt 2FA thì mới xem và hỏi được". Tôi đề nghị hiểu và làm
như sau:

| Việc                                        | Có cần 2FA?        | Lý do                                                                                                                                     |
| ------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Dùng app bình thường (học, chat, luyện nói) | **Không**          | Bắt buộc 2FA để dùng app sẽ chặn phần lớn người dùng — đặc biệt học sinh 10–18 chưa có điện thoại riêng. Đây là rào cản làm chết sản phẩm |
| **Xem hồ sơ năng lực ẩn**                   | **Có**             | Đúng ý bạn. Đây là dữ liệu T2                                                                                                             |
| **Hỏi Companion "bạn biết gì về tôi"**      | **Có**             | Vì câu trả lời chính là nội dung T2                                                                                                       |
| Chat/học bình thường với Companion          | **Không**          | Companion vẫn **dùng** hồ sơ để gợi ý hay hơn, chỉ không **đọc nội dung hồ sơ ra** cho người dùng nghe                                    |
| Xoá dữ liệu đánh giá                        | **Không**          | Không bao giờ được cản người dùng xoá dữ liệu của họ                                                                                      |
| Đổi mật khẩu / email / xoá tài khoản        | **Có, nếu đã bật** | Chuẩn ngành                                                                                                                               |

**Phân biệt then chốt:** Companion **dùng** hồ sơ ẩn để chọn việc gợi ý (không cần 2FA), nhưng
**đọc nội dung hồ sơ ra thành lời** thì cần 2FA. Đúng tinh thần "ẩn nhưng xem được khi hỏi" mà bạn
đã chốt — chỉ thêm một lớp khoá ở cửa "xem".

> Nếu bạn muốn 2FA **bắt buộc cho mọi người**, tôi làm được — nhưng cần bạn biết rõ cái giá: mất
> phần lớn người dùng học sinh, và mọi người quên thiết bị 2FA sẽ mất tài khoản.

### 4.3 Thiết kế TOTP

| Hạng mục          | Quyết định                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| Chuẩn             | TOTP RFC 6238, SHA-1, 6 chữ số, chu kỳ 30 giây (mặc định để tương thích mọi app xác thực)               |
| Dung sai lệch giờ | ±1 bước (±30 giây)                                                                                      |
| Lưu secret        | **Mã hoá** bằng chính cơ chế mục 3 — secret TOTP là dữ liệu T2                                          |
| **Mã khôi phục**  | **Bắt buộc có.** 10 mã dùng-một-lần, chỉ hiện đúng một lần lúc bật, lưu dạng **băm** (không lưu mã gốc) |
| Chống dò          | Giới hạn 5 lần sai / 15 phút / tài khoản, dùng lại `checkRateLimit` đã có                               |
| Chống dùng lại mã | Ghi lại bước thời gian đã dùng, chặn dùng lại cùng mã trong cùng chu kỳ                                 |
| Phiên nâng quyền  | Sau khi nhập đúng 2FA, mở "cửa sổ nâng quyền" **15 phút** — không bắt nhập lại mỗi thao tác             |
| Tắt 2FA           | Cần nhập đúng 2FA hiện tại **và** mật khẩu                                                              |

### 4.4 Ca người dùng 10–18 tuổi

Học sinh có thể không có điện thoại riêng. Xử lý:

- 2FA vẫn tuỳ chọn ⇒ các em dùng app bình thường được.
- Không bật 2FA ⇒ **không xem được hồ sơ năng lực chi tiết**. Đây là mặc định an toàn: đúng nhóm
  cần bảo vệ nhất khỏi việc bị người khác đọc hồ sơ.
- **Vẫn xoá được** dữ liệu đánh giá mà không cần 2FA.
- Mã khôi phục có thể in ra giấy — hợp với hoàn cảnh không có thiết bị riêng.

---

## 5. Cái mã hoá KHÔNG giải quyết được (nói thẳng để không hiểu nhầm)

| Vấn đề                                                  | Mã hoá có cứu không                                               |
| ------------------------------------------------------- | ----------------------------------------------------------------- |
| Lộ dump DB / backup R2                                  | **Có** — đây là lợi ích chính, và có thật                         |
| Nhân viên/người vận hành đọc trộm DB trực tiếp          | **Có** (nếu họ không vào được server)                             |
| Kẻ chiếm quyền chạy mã trên server                      | **Không** — khoá ở đó                                             |
| Lỗ hổng phân quyền trong chính API (`validateAuth` sai) | **Không** — API tự giải mã rồi trả về. **Đây vẫn là rủi ro số 1** |
| Người dùng bị lộ mật khẩu                               | **Không** — 2FA mới cứu được ca này                               |
| SQL injection                                           | **Không** — nhưng dự án đã dùng truy vấn tham số hoá              |

**Suy ra thứ tự ưu tiên đúng:** ① 2FA (chống chiếm tài khoản — rủi ro có thật và phổ biến nhất) →
② rà soát phân quyền API → ③ mã hoá T2 → ④ mã hoá T1. Mã hoá quan trọng, nhưng **không** phải việc
đáng làm đầu tiên.

---

## 6. Kế hoạch PR đề xuất

| PR      | Nội dung                                                                                                                                                                                 | Rủi ro   | Ghi chú                                                                                                                           |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **S-1** | **TOTP 2FA**: bảng `user_2fa` (secret mã hoá, mã khôi phục băm, `key_version`), bật/tắt, xác minh, cửa sổ nâng quyền 15 phút, giới hạn dò, UI trong Cài đặt                              | TB       | Độc lập, làm được ngay, giá trị tức thì                                                                                           |
| **S-2** | **Hạ tầng mã hoá dùng chung**: `packages/core-crypto/userDataCrypto.ts` theo khuôn `ttsCrypto.ts` + `USER_DATA_MASTER_KEY` + `key_version` + hướng dẫn sao lưu khoá + kịch bản xoay khoá | TB       | Chưa mã hoá dữ liệu nào — chỉ dựng hạ tầng + test                                                                                 |
| **S-3** | **Mã hoá T2**: hồ sơ năng lực ẩn + trả lời tự do + tín hiệu năng khiếu. Dữ liệu này **chưa tồn tại** ⇒ mã hoá ngay từ đầu, **không cần migration chuyển đổi**                            | **Thấp** | Làm cùng lúc với PR tạo hồ sơ ẩn (C4) — rẻ nhất                                                                                   |
| **S-4** | **Mã hoá T1** dữ liệu đang có (tên, email + `email_hash`, tiến độ)                                                                                                                       | **CAO**  | Đụng dữ liệu thật của người dùng đang hoạt động. Cần: backup trước, migration hai chiều, kế hoạch rollback, chạy thử trên bản sao |

**Thứ tự khuyến nghị: S-1 → S-2 → S-3 → (dừng, đánh giá lại) → S-4.**

Lý do dừng trước S-4: dữ liệu mới (S-3) mã hoá gần như miễn phí vì chưa tồn tại. Dữ liệu cũ (S-4)
đắt và rủi ro cao. Làm xong S-3 rồi hãy quyết có đáng làm S-4 không.

---

## 7. Cần bạn chốt

1. **Cách A (server giữ khoá) — đúng ý bạn chứ?** Cách B (E2EE) làm Companion mù, mất chức năng cốt
   lõi, và quên mật khẩu là mất sạch dữ liệu. Tôi khuyến nghị Cách A.
2. **2FA tuỳ chọn (chỉ bắt buộc khi XEM hồ sơ ẩn) — đồng ý chứ?** Bắt buộc toàn bộ sẽ chặn học
   sinh 10–18.
3. **Chat/học bình thường không cần 2FA — đúng ý bạn chứ?** Chỉ "xem hồ sơ" và "hỏi bạn biết gì về
   tôi" mới cần.
4. **S-4 (mã hoá dữ liệu cũ) làm luôn hay để sau?** Tôi đề nghị **để sau**, làm S-1→S-3 trước.
5. **Bạn sẽ cất khoá gốc ở đâu?** Phải khác chỗ với backup DB. Không có câu trả lời cho câu này thì
   **chưa nên bắt đầu S-2** — mất khoá là mất trắng, không cứu được.
