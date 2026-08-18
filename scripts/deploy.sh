#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Triển khai English Tutor, CHẠY TRỰC TIẾP TRÊN VPS (không SSH).
#
# Cách dùng (đang đứng trên VPS, user root):
#     cd /var/www/english-tutor
#     bash scripts/deploy.sh
#   (hoặc gọi từ bất kỳ đâu: bash /var/www/english-tutor/scripts/deploy.sh)
#
# Cơ chế: ép thư mục code KHỚP CHÍNH XÁC với origin/main (git reset --hard) →
#         dọn file build/data cũ → cài + build sạch → restart PM2 → health check.
# Nhờ "reset --hard origin/main", mọi PR đã merge vào main đều được gộp, và mọi
# thay đổi cục bộ lỡ tay trên VPS bị bỏ → tránh kẹt "git pull" hay sót dữ liệu cũ.
#
# AN TOÀN: .env / node_modules / dist đều nằm trong .gitignore nên KHÔNG bị xoá.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── CONFIG — chỉnh nếu cần ───────────────────────────────────────────────────
APP_DIR="/var/www/english-tutor"         # đường dẫn thư mục app trên VPS
BRANCH="main"                            # luôn deploy main (gồm mọi PR đã merge)
PM2_PROCESS="english-tutor"
PORT="3001"                              # cổng app để kiểm tra health sau restart

# Biến môi trường cần thêm (bỏ trống nếu đã có sẵn trong .env trên VPS)
CRON_SECRET=""                           # <-- đặt chuỗi bí mật nếu .env chưa có
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "═══════════════════════════════════════════════"
echo "  🚀  English Tutor — Deploy (trên VPS)"
echo "  Dir   : $APP_DIR"
echo "  Branch: $BRANCH (ép khớp origin/$BRANCH)"
echo "═══════════════════════════════════════════════"

echo "── [1/6] Vào thư mục app ───────────────────────"
cd "$APP_DIR"

echo "── [2/6] Ép code KHỚP origin/$BRANCH (gồm mọi PR đã merge) ──"
if [ -n "${GITHUB_TOKEN:-}" ]; then
  REPO_NAME="${GITHUB_REPOSITORY:-seeker19110/donghanh}"
  git fetch "https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO_NAME}.git" "$BRANCH" --prune --tags
  git checkout -B "$BRANCH" FETCH_HEAD
  git reset --hard FETCH_HEAD
else
  git fetch origin --prune --tags
  git checkout -B "$BRANCH" "origin/$BRANCH"
  git reset --hard "origin/$BRANCH"
fi
echo "  → Đang ở commit:"
git --no-pager log -1 --oneline

echo "── [3/6] Dọn build & dữ liệu CŨ (tránh sót, vd lessons 1000 bài cũ) ──"
rm -rf dist                              # dist gitignore → xoá tay để build lại sạch
git clean -fd public/data || true        # bỏ file rác không-theo-dõi trong public/data

echo "── [4/7] Cài dependencies (npm ci) ─────────────"
npm ci || npm install                    # npm ci: cài đúng lockfile; lỗi → fallback install

echo "── [5/7] Chạy migration Postgres tự host còn thiếu ─────"
# Tự áp mọi file postgres/migrations/*.sql chưa chạy (cần DATABASE_URL trong .env —
# xem postgres/migrations/README.md). Dừng deploy nếu migration lỗi (set -e ở trên).
npm run migrate:pg

echo "── [6/7] Build ──────────────────────────────────"
npm run build

echo "── [7/7] Cập nhật .env (nếu cần) ──────────────"
ENV_FILE="$APP_DIR/.env"

add_env() {
  local key="$1" val="$2"
  if [ -z "$val" ]; then return; fi
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    echo "  ✓ $key đã có trong .env — bỏ qua"
  else
    echo "${key}=${val}" >> "$ENV_FILE"
    echo "  + Đã thêm $key vào .env"
  fi
}

# Web Push (VAPID): KHÔNG nhúng khoá vào script — tránh lộ secret trong git.
# Khoá đã có sẵn trong .env trên VPS. Ở đây CHỈ kiểm tra, thiếu thì cảnh báo.
for VK in VAPID_PUBLIC_KEY VAPID_PRIVATE_KEY VAPID_EMAIL; do
  if grep -q "^${VK}=" "$ENV_FILE" 2>/dev/null; then
    echo "  ✓ $VK đã có trong .env"
  else
    echo "  ⚠️  .env thiếu $VK — thêm tay nếu cần Web Push"
  fi
done

# CRON_SECRET: chỉ thêm nếu bạn điền ở phần CONFIG (mặc định trống → bỏ qua).
add_env "CRON_SECRET" "$CRON_SECRET"

echo "── [7/7] Reload PM2 (zero-downtime) + kiểm tra health ─────────"
# Logic reload + health check dùng chung ở scripts/pm2-reload.sh
# (cluster mode + wait_ready; tự xử lý chuyển đổi fork→cluster lần đầu)
PORT="$PORT" bash "$APP_DIR/scripts/pm2-reload.sh"

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✅  Deploy xong! (đã khớp origin/$BRANCH)"
echo "  🌐  https://en-vi.donghanhcungban.com"
echo "═══════════════════════════════════════════════"
echo ""
echo "  Nhắc:"
echo "  • App là PWA: máy đang xem có thể giữ cache cũ → bấm Ctrl+Shift+R"
echo "    (hoặc xoá site data) để thấy bản mới."
