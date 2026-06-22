#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Triển khai English Tutor lên VPS
# Cách dùng: bash scripts/deploy.sh
# Chỉnh các biến ở phần CONFIG bên dưới trước khi chạy.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── CONFIG — điền thông tin của bạn vào đây ──────────────────────────────────
VPS_USER="root"                          # user SSH trên VPS (thường là root hoặc ubuntu)
VPS_HOST="160.30.172.203"               # IP VPS
APP_DIR="/var/www/english-tutor"               # đường dẫn thư mục app trên VPS
BRANCH="main"
PM2_PROCESS="english-tutor"

# Biến môi trường cần thêm (bỏ trống nếu đã có sẵn trong .env trên VPS)
CRON_SECRET=""                           # <-- đặt chuỗi bí mật bất kỳ, vd: my-secret-2025
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "═══════════════════════════════════════════════"
echo "  🚀  English Tutor — Deploy to VPS"
echo "═══════════════════════════════════════════════"
echo "  Host : $VPS_USER@$VPS_HOST"
echo "  Dir  : $APP_DIR"
echo "  Branch: $BRANCH"
echo "═══════════════════════════════════════════════"
echo ""

ssh "$VPS_USER@$VPS_HOST" bash <<REMOTE
set -euo pipefail

echo "── [1/5] Vào thư mục app ───────────────────────"
cd "$APP_DIR"

echo "── [2/5] Pull code mới nhất ────────────────────"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

echo "── [3/5] Cài dependencies + build ─────────────"
npm install
npm run build

echo "── [4/5] Cập nhật .env (nếu cần) ──────────────"
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

VAPID_PUB="BP9nog6CutVAu3TM4KyU87JCZMydVmAgAu-tzPUWMd2uztQ1sfkPvoenQ6m6xMxKJ4cQUeAUPLUfHXjvR5Xog10"
VAPID_PRV="BXIMk5KpGP24UkbYzNyfMiKYvqwKnphgJ2Fk79_jyu4"
VAPID_MAIL="mailto:liendv@live.com"

add_env "VAPID_PUBLIC_KEY"  "\$VAPID_PUB"
add_env "VAPID_PRIVATE_KEY" "\$VAPID_PRV"
add_env "VAPID_EMAIL"       "\$VAPID_MAIL"
add_env "CRON_SECRET"       "$CRON_SECRET"

echo "── [5/5] Restart PM2 ───────────────────────────"
pm2 restart "$PM2_PROCESS"
sleep 2
pm2 logs "$PM2_PROCESS" --lines 20 --nostream

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✅  Deploy xong!"
echo "  🌐  https://en-vi.donghanhcungban.com"
echo "═══════════════════════════════════════════════"
REMOTE
