# fix(ci): cổng `metadata` nhận cả `docs/research/` + kiểm đặc tả có thật (2026-08-23)

**Bối cảnh:** nợ số 2 phát hiện khi làm N4. Cổng `metadata` (`.github/workflows/pr-policy.yml`)
bắt PR `feat:` phải link `docs/specs/YYYY-MM-DD-slug.md`, NHƯNG `CLAUDE.md` mục 2 lại chỉ định
`docs/research/*.md` là nguồn thi hành. Hai bên mâu thuẫn → PR feat làm theo lộ trình luôn bị
chặn oan; ở PR #630 đã phải viết spec BÙ sau khi code chỉ để qua cổng.

**Đã làm:**

1. **Nới nơi đặt đặc tả:** cổng nhận CẢ `docs/specs/YYYY-MM-DD-slug.md` LẪN
   `docs/research/<slug>.md` (tên ở research không theo khuôn ngày-đầu — đã kiểm 44 file thật).
2. **Bù lại bằng siết phần thực chất — KIỂM FILE CÓ TỒN TẠI THẬT** trong nhánh (qua
   `repos.getContent` ở `pr.head.sha`). Trước đây cổng CHỈ dò chuỗi trong mô tả PR, nên gõ một
   đường dẫn không có thật vẫn qua — nới nơi đặt mà không kiểm tồn tại thì cổng thành hình thức.
   Lỗi mạng/quyền (khác 404) chỉ ghi `core.warning`, KHÔNG chặn oan PR hợp lệ.
3. Đồng bộ `.github/pull_request_template.md` với cổng (trước đó template chỉ nói `docs/specs/`).

**Bằng chứng:** chạy thật regex mới trên 7 ca dữ liệu thật — khớp 4 ca hợp lệ (spec cũ của
PR #630, research có ngày, research không ngày, dạng link markdown), trượt đúng 3 ca phải trượt
(không có liên kết, `docs/framework/…`, `docs/specs/` sai khuôn tên). Cổng tự nó chạy trên chính
PR này.
