# chore(deps): rà soát toàn bộ PR đang mở — 7 xanh bật auto-merge, 4 bump major đóng lại (2026-08-26)

Rà 11 PR đang mở. Kết quả và lý do quyết định:

- **PR #696** (test glob Tailwind): CI xanh cả 3 cổng nhưng `mergeable_state = dirty` — xung đột
  `PROGRESS.md` với `main` đã tiến lên. Đã merge `main` vào nhánh, giải xung đột (giữ CẢ HAI mục,
  không mất nội dung), bật auto-merge squash. Đã merge lúc 09:39 UTC.
- **Đã bật auto-merge (squash)** cho các PR xanh sẵn: #696, #677 (google-auth-library 11),
  #673 (actions/checkout 7), #672 (github-script 9), #671 (setup-node 7), #670 (ssh-action 1.2.5),
  #669 (upload-artifact 7). Chúng nằm im chỉ vì trước đó chưa ai bật auto-merge, không phải vì lỗi.
- **Đã ĐÓNG 4 bump major** — CI đỏ vì lý do THẬT, không phải flake, và đều cần việc tay riêng:

  | PR   | Bump                       | Nguyên nhân đỏ                                                                                             |
  | ---- | -------------------------- | ---------------------------------------------------------------------------------------------------------- |
  | #678 | vite 7 → 8                 | peer xung đột `@vitejs/plugin-react@4.7.0` (chỉ tới vite 7) ⇒ `npm ci` gãy                                 |
  | #675 | @vitejs/plugin-react 4 → 6 | yêu cầu peer `vite@^8` ⇒ `npm ci` gãy. Phải gộp cùng #678                                                  |
  | #676 | size-limit 12 → 13         | peer xung đột `@size-limit/file@12.1.0`. Phải bump cả hai gói cùng lúc                                     |
  | #674 | express 4 → 5              | `path-to-regexp@8` bỏ cú pháp `/api/*`: boot check chết với `PathError: Missing parameter name at index 6` |

  Quyết định của người dùng (2026-08-26): **giữ nguyên phiên bản**. Dự án đang ổn định, cả bốn
  bản nâng đều breaking và không mang lợi ích cấp bách. Nếu sau này cần nâng: vite 8 + plugin-react 6
  đi CHUNG một PR; size-limit + @size-limit/file đi CHUNG một PR; express 5 phải rà lại toàn bộ
  ~100 route sang cú pháp `/api/*splat` — là việc riêng, không phải bump tự động.

**Bài học kèm theo (đã dính thật ở PR #698):** container phiên mới chưa có `node_modules` thì
`npx prettier` sẽ tải **bản mới nhất**, không phải bản khớp `package-lock.json` — định dạng bảng
Markdown khác nhau giữa hai bản nên local xanh mà CI đỏ. Đúng cái bẫy `CLAUDE.md` mục 8 cảnh báo.
Cách chạy đúng khi chưa `npm ci`: ghim phiên bản, `npx prettier@3.9.6`.
