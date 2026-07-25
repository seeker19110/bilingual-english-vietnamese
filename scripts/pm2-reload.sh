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
#
# [2026-07-25] Gỡ nguyên nhân crash (build server.ts sang JS thật — xem
# tsconfig.server.json), bật lại cluster mode trong ecosystem.config.cjs. PHÁT
# HIỆN khi xem log deploy thật: `pm2 reload` KHÔNG đổi được exec_mode/instances
# của process đang chạy — nó chỉ reload lại process trong ĐÚNG cấu hình cũ
# (deploy 2026-07-25 log "ids: [ 1 ]" — vẫn 1 tiến trình, cluster mode chưa hề
# được áp dụng dù ecosystem.config.cjs đã đổi). Phải `pm2 delete` + `pm2 start`
# lại thì PM2 mới đọc `exec_mode`/`instances` mới. Bên dưới tự phát hiện lệch
# cấu hình (so `pm2 jlist` thật đang chạy với ecosystem.config.cjs) để chọn
# đúng lệnh — CHỈ lần đổi cấu hình mới có downtime vài giây, các lần sau (cấu
# hình không đổi) vẫn `pm2 reload` như cũ.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

PM2_PROCESS="english-tutor"
PORT="${PORT:-3001}"
HEALTH_URL="http://localhost:$PORT/api/health"
MAX_WAIT=30   # giây tối đa đợi health OK sau reload

# exec_mode mong muốn đọc thẳng từ ecosystem.config.cjs (tránh 2 nơi phải sửa
# đồng bộ) — PM2 nội bộ dùng chuỗi "cluster_mode"/"fork_mode" (không phải
# "cluster"/"fork" như trong file cấu hình).
DESIRED_EXEC_MODE=$(node -e "
  const cfg = require('./ecosystem.config.cjs').apps[0]
  console.log((cfg.exec_mode || 'fork') + '_mode')
")

# exec_mode THẬT đang chạy (rỗng nếu process chưa tồn tại)
CURRENT_EXEC_MODE=$(pm2 jlist 2>/dev/null | node -e "
  let data = ''
  process.stdin.on('data', (c) => (data += c))
  process.stdin.on('end', () => {
    try {
      const list = JSON.parse(data)
      const proc = list.find((p) => p.name === '$PM2_PROCESS')
      console.log(proc ? proc.pm2_env.exec_mode : '')
    } catch {
      console.log('')
    }
  })
")

if [ -z "$CURRENT_EXEC_MODE" ]; then
  echo "🔀 $PM2_PROCESS chưa chạy — start mới..."
  pm2 start ecosystem.config.cjs
elif [ "$CURRENT_EXEC_MODE" != "$DESIRED_EXEC_MODE" ]; then
  echo "⚠️  exec_mode đổi ($CURRENT_EXEC_MODE → $DESIRED_EXEC_MODE) — pm2 reload không áp dụng được,"
  echo "   phải xoá + start lại (có downtime vài giây LẦN NÀY)..."
  pm2 delete "$PM2_PROCESS" || true
  pm2 start ecosystem.config.cjs
else
  echo "🔄 Reload PM2 ($PM2_PROCESS)..."
  pm2 reload ecosystem.config.cjs --update-env
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
