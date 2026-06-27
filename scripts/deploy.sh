#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Triển khai English Tutor lên VPS (LUÔN ra đúng bản mới nhất của main)
#
# Cách dùng:  bash scripts/deploy.sh
#
# Cơ chế: SSH vào VPS → ép thư mục code KHỚP CHÍNH XÁC với origin/main
#         (git reset --hard) → dọn file build/data cũ → cài + build sạch → restart.
# Nhờ "reset --hard origin/main", mọi PR đã merge vào main đều được gộp, và mọi
# thay đổi cục bộ lỡ tay trên VPS bị bỏ → tránh kẹt "git pull" hay sót dữ liệu cũ.
#
# AN TOÀN: .env / node_modules / dist đều nằm trong .gitignore nên KHÔNG bị xoá.
# Chỉ chỉnh phần CONFIG bên dưới trước khi chạy.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── CONFIG — điền thông tin của bạn vào đây ──────────────────────────────────
VPS_USER="root"                          # user SSH trên VPS (thường là root hoặc ubuntu)
VPS_HOST="160.30.172.203"                # IP VPS
APP_DIR="/var/www/english-tutor"         # đường dẫn thư mục app trên VPS
BRANCH="main"                            # luôn deploy main (gồm mọi PR đã merge)
PM2_PROCESS="english-tutor"
PORT="3001"                              # cổng app để kiểm tra health sau khi restart

# Biến môi trường cần thêm (bỏ trống nếu đã có sẵn trong .env trên VPS)
CRON_SECRET=""                           # <-- đặt chuỗi bí mật bất kỳ, vd: my-secret-2025
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "═══════════════════════════════════════════════"
echo "  🚀  English Tutor — Deploy to VPS"
echo "═══════════════════════════════════════════════"
echo "  Host  : $VPS_USER@$VPS_HOST"
echo "  Dir   : $APP_DIR"
echo "  Branch: $BRANCH (ép khớp origin/$BRANCH)"
echo "═══════════════════════════════════════════════"
echo ""

ssh "$VPS_USER@$VPS_HOST" bash <<REMOTE
set -euo pipefail

echo "── [1/6] Vào thư mục app ───────────────────────"
cd "$APP_DIR"

echo "── [2/6] Ép code KHỚP origin/$BRANCH (gồm mọi PR đã merge) ──"
git fetch origin --prune --tags
# Tạo/ép nhánh local trỏ đúng origin/main rồi reset cứng → khớp tuyệt đối, bỏ drift cục bộ.
git checkout -B "$BRANCH" "origin/$BRANCH"
git reset --hard "origin/$BRANCH"
echo "  → Đang ở commit:"
git --no-pager log -1 --oneline

echo "── [3/6] Dọn build & dữ liệu CŨ (tránh sót, vd lessons 1000 bài cũ) ──"
# dist nằm trong .gitignore nên git không tự xoá → xoá tay để build lại sạch.
rm -rf dist
# Xoá file rác KHÔNG được theo dõi trong public/data (data sinh thừa của bản cũ).
# .env không nằm trong public/data nên tuyệt đối an toàn.
git clean -fd public/data || true

echo "── [4/6] Cài dependencies (npm ci) + build ─────"
# npm ci: cài đúng theo package-lock (sạch, lặp lại được). Lỗi lockfile → fallback install.
npm ci || npm install
npm run build

echo "── [5/6] Cập nhật .env (nếu cần) ──────────────"
ENV_FILE="$APP_DIR/.env"

add_env() {
  local key="\$1" val="\$2"
  if [ -z "\$val" ]; then return; fi
  if grep -q "^\${key}=" "\$ENV_FILE" 2>/dev/null; then
    echo "  ✓ \$key đã có trong .env — bỏ qua"
  else
    echo "\${key}=\${val}" >> "\$ENV_FILE"
    echo "  + Đã thêm \$key vào .env"
  fi
}

# Web Push (VAPID): KHÔNG nhúng khoá vào script — tránh lộ secret trong git.
# Khoá đã có sẵn trong .env trên VPS (push đang chạy ở production). Ở đây CHỈ kiểm tra:
# thiếu thì cảnh báo để bạn tự thêm, không tự điền giá trị bí mật.
for VK in VAPID_PUBLIC_KEY VAPID_PRIVATE_KEY VAPID_EMAIL; do
  if grep -q "^\${VK}=" "\$ENV_FILE" 2>/dev/null; then
    echo "  ✓ \$VK đã có trong .env"
  else
    echo "  ⚠️  .env thiếu \$VK — thêm tay nếu cần Web Push"
  fi
done

# CRON_SECRET: chỉ thêm nếu bạn điền ở phần CONFIG (mặc định trống → bỏ qua).
add_env "CRON_SECRET" "$CRON_SECRET"

echo "── [6/6] Restart PM2 + kiểm tra health ─────────"
# startOrRestart: tự khởi động nếu chưa chạy, nạp lại cấu hình ecosystem + env mới.
pm2 startOrRestart ecosystem.config.cjs --update-env || pm2 restart "$PM2_PROCESS" --update-env
pm2 save || true
sleep 3

echo "  → Health check:"
if curl -fsS "http://localhost:$PORT/api/health" >/dev/null 2>&1; then
  echo "    ✅ /api/health OK (port $PORT)"
else
  echo "    ⚠️  /api/health KHÔNG phản hồi — xem log bên dưới:"
fi
pm2 logs "$PM2_PROCESS" --lines 20 --nostream || true

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✅  Deploy xong! (đã khớp origin/$BRANCH)"
echo "  🌐  https://en-vi.donghanhcungban.com"
echo "═══════════════════════════════════════════════"
echo ""
echo "  Nhắc:"
echo "  • Nếu main có migration DB mới (supabase/migrations/*.sql) →"
echo "    chạy nó trên Supabase Dashboard (SQL Editor) cho đủ tính năng."
echo "  • App là PWA: máy đang xem có thể giữ cache cũ → bấm Ctrl+Shift+R"
echo "    (hoặc xoá site data) để thấy bản mới. manifest.json đổi version"
echo "    nên Service Worker thường tự cập nhật sau ít phút."
REMOTE
