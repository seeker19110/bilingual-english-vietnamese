#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# pm2-reload.sh — Reload app qua PM2 KHÔNG DOWNTIME + health check.
#
# Được gọi từ: .github/workflows/deploy.yml, deploy.sh, scripts/deploy.sh
# (một chỗ duy nhất giữ logic reload — sửa ở đây là đủ, không sửa 3 nơi).
#
# Cơ chế zero-downtime: ecosystem.config.cjs chạy cluster mode + wait_ready →
# "pm2 reload" khởi động process MỚI, đợi nó báo ready rồi mới tắt process CŨ.
#
# Trường hợp đặc biệt (tự xử lý): PM2 KHÔNG đổi được exec_mode qua reload.
# Nếu process đang chạy fork mode cũ (hoặc chưa chạy) → delete + start một lần
# (chịu vài giây downtime DUY NHẤT lần chuyển đổi này).
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

PM2_PROCESS="english-tutor"
PORT="${PORT:-3001}"
HEALTH_URL="http://localhost:$PORT/api/health"
MAX_WAIT=30   # giây tối đa đợi health OK sau reload

# Đọc exec_mode hiện tại của process từ PM2 (jlist = JSON). Không có process → "none".
CURRENT_MODE=$(pm2 jlist 2>/dev/null | node -e "
  let raw = '';
  process.stdin.on('data', (c) => (raw += c));
  process.stdin.on('end', () => {
    // pm2 jlist đôi khi in kèm dòng log trước JSON → cắt từ ký tự '[' đầu tiên
    const json = raw.slice(raw.indexOf('['));
    const apps = JSON.parse(json || '[]');
    const app = apps.find((a) => a.name === '$PM2_PROCESS');
    console.log(app ? app.pm2_env.exec_mode : 'none');
  });
" 2>/dev/null || echo 'none')

if [ "$CURRENT_MODE" = "cluster_mode" ]; then
  echo "🔄 Reload PM2 (cluster + wait_ready → zero-downtime)..."
  pm2 reload ecosystem.config.cjs --update-env
else
  echo "🔀 exec_mode hiện tại: $CURRENT_MODE — cần delete + start để áp cluster mode"
  echo "   (một lần duy nhất, chịu vài giây downtime)"
  pm2 delete "$PM2_PROCESS" 2>/dev/null || true
  pm2 start ecosystem.config.cjs
fi
pm2 save || true

echo "⏳ Health check (tối đa ${MAX_WAIT}s)..."
for i in $(seq 1 "$MAX_WAIT"); do
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
    echo "✅ Health OK (sau ${i}s) — $HEALTH_URL"
    exit 0
  fi
  sleep 1
done

echo "❌ Health check FAILED sau ${MAX_WAIT}s — app không phản hồi ở cổng $PORT"
echo "   Xem log: pm2 logs $PM2_PROCESS --lines 50"
pm2 logs "$PM2_PROCESS" --lines 30 --nostream || true
exit 1
