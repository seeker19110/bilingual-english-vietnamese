#!/bin/bash
# Diagnostic script — check 502 Bad Gateway issue

echo "🔍 Diagnosing 502 Bad Gateway..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_pm2() {
  echo -e "${YELLOW}[1/5] PM2 Status${NC}"
  pm2 status
  echo ""
}

check_backend() {
  echo -e "${YELLOW}[2/5] Backend Health (Port 3001)${NC}"
  if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend running on port 3001${NC}"
    curl -s http://localhost:3001/api/health | jq .
  else
    echo -e "${RED}❌ Backend NOT responding on port 3001${NC}"
    echo "   Trying to restart..."
    pm2 restart english-tutor
    sleep 2
    curl -s http://localhost:3001/api/health | jq . || echo "Still not responding"
  fi
  echo ""
}

check_nginx() {
  echo -e "${YELLOW}[3/5] Nginx Config${NC}"
  sudo nginx -t
  echo ""
}

check_nginx_logs() {
  echo -e "${YELLOW}[4/5] Nginx Error Logs (last 30 lines)${NC}"
  sudo tail -30 /var/log/nginx/error.log
  echo ""
}

check_pm2_logs() {
  echo -e "${YELLOW}[5/5] PM2 App Logs (last 50 lines)${NC}"
  pm2 logs english-tutor --lines 50 --nostream
  echo ""
}

# Run all checks
check_pm2
check_backend
check_nginx
check_nginx_logs
check_pm2_logs

echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
echo -e "${YELLOW}Fix suggestions:${NC}"
echo "1. If backend not responding:"
echo "   pm2 restart english-tutor"
echo "   pm2 logs english-tutor"
echo ""
echo "2. If Nginx config error:"
echo "   cat /etc/nginx/sites-available/english-tutor"
echo "   # Fix the config, then:"
echo "   sudo systemctl reload nginx"
echo ""
echo "3. If port 3001 in use:"
echo "   lsof -i :3001"
echo "   kill -9 <PID>"
echo "   pm2 restart english-tutor"
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
