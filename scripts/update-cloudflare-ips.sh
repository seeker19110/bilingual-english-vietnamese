#!/usr/bin/env bash
# scripts/update-cloudflare-ips.sh
#
# Tải danh sách IP CHÍNH THỨC của Cloudflare (IPv4 + IPv6) rồi sinh file cấu hình
# Nginx /etc/nginx/cloudflare-realip.conf — dùng để Nginx CHỈ tin header
# "X-Forwarded-For"/"CF-Connecting-IP" khi request thực sự đến từ Cloudflare.
#
# VÌ SAO CẦN FILE NÀY (đọc trước khi chạy):
#   Dải IP Cloudflare có thể thay đổi theo thời gian — không hard-code danh sách
#   tĩnh vào repo (sẽ cũ dần, gây lỗ hổng hoặc chặn nhầm traffic thật). Script này
#   LUÔN lấy danh sách MỚI NHẤT trực tiếp từ cloudflare.com mỗi lần chạy.
#
# CÁCH DÙNG (chạy TRÊN VPS — nơi có internet thật, không chạy trong sandbox này):
#   sudo bash scripts/update-cloudflare-ips.sh
#   sudo nginx -t && sudo systemctl reload nginx
#
# NÊN đặt cron chạy lại mỗi tháng (Cloudflare hiếm khi đổi dải IP nhưng có thể xảy ra):
#   sudo crontab -e
#   0 4 1 * * /usr/bin/bash /var/www/dhcb/scripts/update-cloudflare-ips.sh && systemctl reload nginx

set -euo pipefail

OUT_FILE="/etc/nginx/cloudflare-realip.conf"
TMP_FILE="$(mktemp)"
trap 'rm -f "$TMP_FILE"' EXIT

echo "# Tự động sinh bởi scripts/update-cloudflare-ips.sh — ĐỪNG SỬA TAY." > "$TMP_FILE"
echo "# Cập nhật: $(date -u '+%Y-%m-%d %H:%M UTC'). Nguồn: https://www.cloudflare.com/ips/" >> "$TMP_FILE"
echo "" >> "$TMP_FILE"

echo "Đang tải dải IPv4 Cloudflare..."
curl -fsSL https://www.cloudflare.com/ips-v4 | while IFS= read -r cidr; do
  [ -n "$cidr" ] && echo "set_real_ip_from $cidr;" >> "$TMP_FILE"
done

echo "Đang tải dải IPv6 Cloudflare..."
curl -fsSL https://www.cloudflare.com/ips-v6 | while IFS= read -r cidr; do
  [ -n "$cidr" ] && echo "set_real_ip_from $cidr;" >> "$TMP_FILE"
done

{
  echo ""
  echo "# CF-Connecting-IP = IP thật của trình duyệt, do Cloudflare gắn vào."
  echo "# real_ip_recursive on: xử lý đúng khi có nhiều lớp proxy phía trước Cloudflare."
  echo "real_ip_header CF-Connecting-IP;"
  echo "real_ip_recursive on;"
} >> "$TMP_FILE"

# Kiểm tra tải được danh sách (tránh ghi đè file cũ bằng file rỗng nếu mạng lỗi)
if ! grep -q "^set_real_ip_from" "$TMP_FILE"; then
  echo "LỖI: không tải được dải IP nào — kiểm tra kết nối mạng. Không ghi đè $OUT_FILE." >&2
  exit 1
fi

mv "$TMP_FILE" "$OUT_FILE"
echo "Đã ghi $OUT_FILE ($(grep -c '^set_real_ip_from' "$OUT_FILE") dải IP)."
echo "Chạy tiếp: sudo nginx -t && sudo systemctl reload nginx"
