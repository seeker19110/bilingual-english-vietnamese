# Vận hành khoá mã hoá dữ liệu người dùng

> Áp dụng cho `USER_DATA_MASTER_KEY` — khoá gốc của `packages/core-config/userDataCrypto.ts`.
> Đọc file này TRƯỚC khi deploy bản có mã hoá lên VPS.

## 0. Điều quan trọng nhất, đọc trước mọi thứ khác

**Mất khoá = mất vĩnh viễn toàn bộ dữ liệu đã mã hoá.** Không có cửa sau, không có đường khôi phục,
không ai — kể cả người viết code — lấy lại được. Backup CSDL cũng vô dụng vì trong đó chỉ có
ciphertext.

Đồng thời: **cất khoá chung chỗ với backup CSDL thì mã hoá trở nên vô nghĩa** — ai lấy được backup
cũng lấy luôn khoá.

Hai câu trên kéo về hai hướng ngược nhau. Cách thoát duy nhất: **giữ ít nhất hai bản khoá, ở hai
nơi khác nhau, và không nơi nào trùng với nơi để backup CSDL.**

## 1. Tạo khoá

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Chạy **một lần duy nhất** cho cả hệ thống. Đừng tạo lại khi deploy lại — khoá mới không giải mã
được dữ liệu cũ.

## 2. Cất ở đâu (đề xuất cho quy mô hiện tại, chi phí 0đ)

| Bản                | Nơi cất                                                                       | Vai trò                                               |
| ------------------ | ----------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Bản dùng**       | `/var/www/dhcb/.env` trên VPS, quyền `chmod 600`, chủ sở hữu là user chạy PM2 | App đọc từ đây                                        |
| **Bản dự phòng 1** | Trình quản lý mật khẩu cá nhân (Bitwarden/1Password/KeePass)                  | Khôi phục khi VPS chết                                |
| **Bản dự phòng 2** | In ra giấy, cất nơi an toàn ngoài máy tính                                    | Khôi phục khi mất cả tài khoản trình quản lý mật khẩu |

**Tuyệt đối KHÔNG:** commit vào git · gửi qua chat/email · để trong cùng bucket R2 với backup CSDL
· lưu trong ảnh chụp màn hình trên điện thoại đồng bộ đám mây.

## 3. Kiểm tra trước khi deploy

```bash
# Trên VPS, trong thư mục app:
grep -c '^USER_DATA_MASTER_KEY=' .env          # phải ra 1
node -e "const k=process.env.USER_DATA_MASTER_KEY||require('fs').readFileSync('.env','utf8').match(/^USER_DATA_MASTER_KEY=(.*)$/m)?.[1]; \
  console.log(Buffer.from(k,'base64').length === 32 ? 'OK: khoá 32 byte' : 'SAI: không phải 32 byte')"
stat -c '%a %U' .env                            # nên là 600 và đúng user chạy PM2
```

Chưa đặt khoá thì **các tính năng cần mã hoá sẽ báo lỗi rõ ràng** (`Server chưa cấu hình
USER_DATA_MASTER_KEY`) chứ không âm thầm lưu plaintext — cố ý thiết kế như vậy.

## 4. Dữ liệu cũ chưa mã hoá thì sao

`decryptUserField()` trả nguyên văn khi giá trị chưa mã hoá (`isEncryptedField()` phân biệt). Nghĩa
là **bật mã hoá không làm hỏng dữ liệu đang có**: bản ghi cũ đọc bình thường, bản ghi mới được mã
hoá. Viết lại dữ liệu cũ là việc riêng, làm sau, không gấp.

## 5. Xoay khoá (khi nghi khoá bị lộ)

1. Sinh khoá mới (mục 1).
2. Trên VPS: `USER_DATA_MASTER_KEY_V1=<khoá cũ>`, `USER_DATA_MASTER_KEY=<khoá mới>`,
   `USER_DATA_KEY_VERSION=2`. Giữ **cả hai** — bỏ khoá cũ ngay là mất dữ liệu chưa viết lại.
3. Deploy. Dữ liệu cũ vẫn giải mã được (phong bì tự mô tả phiên bản), dữ liệu mới dùng khoá mới.
4. Viết lại dần dữ liệu cũ (đọc → ghi lại), rồi mới gỡ `USER_DATA_MASTER_KEY_V1`.

Không cần dừng dịch vụ ở bất kỳ bước nào.

## 6. Tình huống xấu

| Tình huống             | Xử lý                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| VPS chết, còn khoá     | Dựng lại VPS, restore CSDL, đặt lại khoá vào `.env` → dữ liệu đọc lại bình thường                                                          |
| **Mất khoá, còn CSDL** | **Dữ liệu đã mã hoá mất vĩnh viễn.** Chỉ còn cách xoá và bắt người dùng thiết lập lại (với 2FA: xoá `user_2fa`, người dùng bật lại từ đầu) |
| Nghi khoá bị lộ        | Xoay khoá (mục 5) + rà log truy cập + cân nhắc buộc thiết lập lại 2FA                                                                      |
| Quên có đặt khoá chưa  | Chạy mục 3                                                                                                                                 |

## 7. Cái mã hoá này KHÔNG bảo vệ

- Kẻ chiếm được quyền chạy mã trên VPS — khoá cũng ở đó.
- Lỗi phân quyền trong API: handler tự giải mã rồi trả về, nên `validateAuth()` vẫn là tuyến phòng
  thủ số 1.

Chi tiết phân tích: `docs/research/dac-ta-ma-hoa-du-lieu-va-2fa-2026-08-23.md` mục 5.
