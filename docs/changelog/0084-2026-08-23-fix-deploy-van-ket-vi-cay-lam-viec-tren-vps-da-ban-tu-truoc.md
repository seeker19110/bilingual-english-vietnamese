# fix: deploy vẫn kẹt vì cây làm việc trên VPS đã "bẩn" từ trước (2026-08-23)

**Triệu chứng:** auto-deploy đỏ ngay bước SSH đầu tiên suốt 6 run liền
(32634211968 → 32643862602), chưa hề chạy tới `scripts/deploy.sh`:

```
error: Your local changes to the following files would be overwritten by checkout:
	apps/dhcb/public/data/manifest.json
Please commit your changes or stash them before you switch branches.
```

**Quan hệ với PR #631:** #631 đã sửa ĐÚNG gốc bệnh phía repo (hai mẫu ignore neo sai đường dẫn
sau PR-S2 + bỏ theo dõi `manifest.json` + commit lại 130 file truyện đúng dạng generator).
Nhưng **deploy trên chính commit #631 VẪN ĐỎ** (run 32643862602) — lần này danh sách chặn là
130 file `apps/dhcb/public/data/stories/*.json`. Lý do: VPS đã mang sẵn một cây làm việc bẩn từ
những lần build trước, và `git checkout` từ chối ghi đè file đang sửa cục bộ **kể cả khi commit
đích XOÁ hoặc thay nội dung file đó**. Sửa phía repo không tự dọn được trạng thái đã bẩn sẵn
trên máy đích → deploy tự khoá chính nó, không thoát ra được.

**Đã sửa:** thêm `-f` cho `git checkout` ở CẢ `.github/workflows/deploy.yml` và
`scripts/deploy.sh`. Ngay dòng sau đó deploy vốn đã ép thư mục khớp tuyệt đối `origin/main`
(chủ ý ghi rõ trong chú thích đầu `scripts/deploy.sh`: "thay đổi cục bộ lỡ tay trên VPS bị bỏ"),
nên `-f` chỉ thực hiện đúng ý định sẵn có sớm hơn một bước.

**Dọn nốt 3 mẫu ignore còn neo vào đường dẫn trước PR-S2** (#631 mới gom `public/data/`):
`dictionary.backup.json` trong `.gitignore` + `.prettierignore`, và `lessons.json` trong
`.prettierignore` (`src/data/…` → `apps/dhcb/src/data/…`). Đã rà lại toàn bộ hai file: **không
còn mẫu nào neo vào đường dẫn cũ** (`grep -E "^(src|public|api|components|lib|data|pages|prompts)/"`
trả về rỗng). Riêng `lessons.json` chỉ đổi phạm vi kiểm format, KHÔNG đổi nội dung file: nó là
data blob tĩnh 1,1 MB, chỉ các script one-off đã archive mới ghi vào, nên không có cảnh
generator ↔ Prettier đá nhau như 130 file truyện.

**Bài học:** mọi cơ chế "ép máy đích khớp origin" phải chịu được cây làm việc bẩn có sẵn — nếu
không, một file sinh tự động lọt vào Git một lần là đủ khoá đường ống deploy vĩnh viễn.
