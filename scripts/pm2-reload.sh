#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# pm2-reload.sh — Reload app qua PM2 + health check.
#
# Được gọi từ: .github/workflows/deploy.yml, deploy.sh, scripts/deploy.sh
# (một chỗ duy nhất giữ logic reload — sửa ở đây là đủ, không sửa 3 nơi).
#
# [2026-07-20] ĐÃ THỬ cluster mode + wait_ready để reload zero-downtime thật,
# nhưng cluster mode + loader ESM (--import tsx) làm worker crash ngay khi
# khởi động mà KHÔNG in được log gì — lỗi tương thích Node cluster + ESM
# loader. ROLLBACK về fork mode (ecosystem.config.cjs) — chấp nhận vài giây
# downtime mỗi lần reload cho tới khi có cách khác để chạy zero-downtime.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

PM2_PROCESS="english-tutor"
PORT="${PORT:-3001}"
HEALTH_URL="http://localhost:$PORT/api/health"
MAX_WAIT=30   # giây tối đa đợi health OK sau reload

if pm2 describe "$PM2_PROCESS" >/dev/null 2>&1; then
  echo "🔄 Reload PM2 ($PM2_PROCESS)..."
  pm2 reload ecosystem.config.cjs --update-env
else
  echo "🔀 $PM2_PROCESS chưa chạy — start mới..."
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
