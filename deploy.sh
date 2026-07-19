#!/usr/bin/env bash
#
# Script deploy lên VPS cho app "english-tutor".
# Cách dùng trên VPS (trong thư mục project):
#   bash deploy.sh
#
# Việc nó làm:
#   1. Lấy code mới nhất từ Git (fetch tất cả PR đã merge)
#   2. Xóa mọi local changes để code sạch
#   3. Cài thư viện -> chạy migration Postgres tự host còn thiếu -> build -> khởi động lại app
#   4. Hiển thị danh sách các thay đổi được kéo
#
# Migration: TỰ ĐỘNG áp mọi file postgres/migrations/*.sql chưa chạy (script
# scripts/run-pg-migrations.ts, kết nối THẲNG Postgres tự host qua DATABASE_URL trong
# .env — xem docs/setup-postgresql-vps.md + docs/deploy-vps-ubuntu.md).

set -e   # Gặp lỗi ở bất kỳ bước nào là dừng ngay, không deploy code lỗi.

# Nhánh muốn deploy. Đổi sang nhánh khác nếu cần (vd: claude/english-tutor-deploy-r07bh3).
BRANCH="main"

echo "==> 1/8 Lấy code mới từ origin/$BRANCH (tất cả PR đã merge)"
git fetch origin

echo "==> 2/8 Kiểm tra nhánh hiện tại"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
  echo "⚠️ Đang ở nhánh '$CURRENT_BRANCH', chuyển sang '$BRANCH'..."
  git checkout "$BRANCH"
fi

echo "==> 3/8 Xóa mọi thay đổi local + cập nhật về origin/$BRANCH"
# Lưu ý: lệnh này KHÔNG đụng tới .env (đã nằm trong .gitignore), nên secret an toàn.
git reset --hard "origin/$BRANCH"

echo "==> 4/8 Hiển thị danh sách commit vừa kéy (PR đã merge)"
echo "---"
git log -5 --oneline --decorate
echo "---"

echo "==> 5/8 Cài thư viện theo package-lock.json"
npm ci

echo "==> 6/8 Chạy migration Postgres tự host còn thiếu (dừng deploy nếu lỗi)"
npm run migrate:pg

echo "==> 7/8 Build frontend"
npm run build

echo "==> 8/8 Khởi động lại app qua PM2 (kèm nạp lại biến môi trường)"
pm2 restart english-tutor --update-env

echo "==> ✅ Xong! Deploy hoàn tất."
echo "🎉 Code đã cập nhật, tất cả PR đã merge được kéy thành công."
