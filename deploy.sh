#!/usr/bin/env bash
#
# Script deploy lên VPS cho app "english-tutor".
# Cách dùng trên VPS (trong thư mục project):
#   bash deploy.sh
#
# Việc nó làm: lấy code mới nhất từ Git -> cài thư viện -> build -> khởi động lại app.

set -e   # Gặp lỗi ở bất kỳ bước nào là dừng ngay, không deploy code lỗi.

# Nhánh muốn deploy. Đổi sang nhánh khác nếu cần (vd: claude/english-tutor-deploy-r07bh3).
BRANCH="main"

echo "==> 1/5 Lấy code mới từ origin/$BRANCH"
git fetch origin

echo "==> 2/5 Ép code về đúng origin/$BRANCH (xóa mọi sửa tay trên file đã commit)"
# Lưu ý: lệnh này KHÔNG đụng tới .env (đã nằm trong .gitignore), nên secret an toàn.
git reset --hard "origin/$BRANCH"

echo "==> 3/5 Cài thư viện theo package-lock.json"
npm ci

echo "==> 4/5 Build frontend"
npm run build

echo "==> 5/5 Khởi động lại app qua PM2 (kèm nạp lại biến môi trường)"
pm2 restart english-tutor --update-env

echo "==> Xong! Deploy hoàn tất."
