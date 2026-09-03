# 0256 — 2026-09-03 — Soát lại mục "Cần làm tay": 6/8 mục đã xong từ lâu

**PR:** #839 · **Loại:** `docs` — không đổi một dòng mã chạy nào.

## Vì sao làm

Đi tìm việc tiếp theo, tôi mở mục **"⚠️ Cần làm tay"** của `PROGRESS.md` — đây là danh sách
người dùng đọc để biết **mình** phải làm gì bằng tay (SSH, mua VPS, điền biến môi trường).

Soát bằng chứng cứ thì **6 trong 8 mục đã xong từ lâu** nhưng vẫn nằm nguyên đó như việc chưa
làm. Một danh sách việc tay mà quá nửa là việc đã xong thì tệ hơn không có: nó bắt người dùng đi
làm lại việc đã xong, và làm loãng đúng hai mục còn thật sự cần.

Đây cũng là loại lỗi vừa gây thiệt hại thật ở đợt trước (changelog `0254`): sổ nợ nói
`FeedbackModal` thiếu Escape, tôi đi làm rồi mới phát hiện đã sửa từ trước.

## Đã kiểm những gì

| Mục                                       | Kiểm bằng                                                                                | Kết luận                               |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------- |
| Đối chiếu Swift                           | `download.swift.org` mã 000 · swiftlang 403                                              | **CÒN** — thật sự cần máy có toolchain |
| Đối chiếu Kotlin                          | 48/48 ca `daDoiChieu: true`                                                              | ✅ xong 2026-09-03                     |
| Nhánh `chirp-3-hd-voice`                  | `git ls-remote` không còn nhánh; `VoicePicker.tsx` + `0001_app_settings.sql` đã ở `main` | ✅ đã merge                            |
| Migration `0004` · `0028` · `0034`–`0037` | `scripts/deploy.sh:75` gọi `npm run migrate:pg` **tự động**; repo đã ở `0074`            | ✅ áp từ lâu                           |
| Backup R2 · Sentry                        | đã đánh dấu xong từ trước, giữ nguyên                                                    | ✅                                     |
| Scale 50k · biến môi trường VPS           | không đọc được `.env` của VPS từ máy dựng                                                | **CÒN**                                |

Một ca **cố ý không kết luận vội**: bảng `entitlements` không có code nào đọc. Trông như code
chết, nhưng đọc `0035_entitlements.sql` thì chính migration ghi rõ đây là bước dựng bảng +
backfill có chủ đích, phần đọc để dành bước sau. **Không phải nợ.**

## Đã làm

Chia mục thành **A. CÒN PHẢI LÀM** (3 mục: Swift, hạ tầng scale, biến môi trường VPS) và
**B. ĐÃ XONG — giữ lại kèm bằng chứng** (8 mục). Không xoá trắng mục nào: giữ bằng chứng để lần
sau khỏi đi kiểm lại từ đầu, và giữ các ghi chú còn giá trị tra cứu (đợt `0034`–`0037` bắt mọi
phiên Bearer cũ đăng nhập lại; `viseme_timeline` chỉ phát huy khi có `ELEVENLABS_API_KEY`).

Gộp `ADMIN_EMAILS` — trước đây nằm lẫn trong mục nhánh đã merge nên coi như xong theo — vào khối
biến môi trường ở phần A, vì nó **vẫn là việc tay chưa kiểm chứng được**.

Sửa thêm một chỗ mâu thuẫn ở dòng 1074: phần mô tả tính năng vẫn ghi nhánh đó "CHƯA MERGE".

**Quy ước ghi vào đầu mục:** xong việc nào thì chuyển ngay xuống phần B **kèm bằng chứng**.

## Kiểm chứng

`git diff --stat` chỉ chạm `PROGRESS.md` + file nhật ký này. Đã đối chiếu 9 chuỗi khoá
(`swift:conformance`, `verify-pg-backup`, `loadtest:k6`, `GROQ_API_KEY`, `AZURE_SPEECH_KEY`,
`ADMIN_EMAILS`, `admin-grant-plan`, `ENV_BACKUP_PASSPHRASE`, `rollback-runbook`) vẫn còn trong
file sau khi viết lại — không mục nào bị mất khi rút gọn.
