#!/usr/bin/env bash
#
# setup-swap.sh — Tạo file swap trên VPS. Chạy MỘT LẦN, cần quyền root.
#
# Vì sao cần (đo thật 2026-08-26 trên VPS 3 vCPU / 3GB):
#   free -h  →  total 2.9Gi · used 1.1Gi · available 1.8Gi · Swap 0B
# Lúc rảnh thì dư dả. Nhưng `scripts/deploy.sh` chạy `npm ci` + `npm run build` NGAY TRÊN
# máy đang phục vụ — Vite + `tsc -b` 16 workspace ngốn thêm 1–1,5 GB ở đỉnh. Cộng vào 1,1 GB
# đang chạy là chạm trần. Không có swap thì kernel gọi OOM killer, và OOM killer KHÔNG chọn
# tiến trình "đáng chết": nó có thể giết PostgreSQL giữa lúc deploy.
#
# Swap không làm máy nhanh hơn. Nó biến "OOM giết mất một dịch vụ" thành "deploy chậm hơn
# vài chục giây" — đó là toàn bộ mục đích.
#
# Cách dùng:
#   sudo bash scripts/setup-swap.sh          # mặc định 6G, hỏi xác nhận
#   sudo bash scripts/setup-swap.sh 4G       # đổi kích thước
#   sudo bash scripts/setup-swap.sh 6G --yes # bỏ qua hỏi (dùng trong script tự động)
#
# Gỡ swap (nếu cần quay lại):
#   sudo swapoff /swapfile && sudo rm -f /swapfile
#   rồi xoá dòng /swapfile trong /etc/fstab
set -euo pipefail

SWAPFILE=/swapfile
SIZE=6G
ASSUME_YES=0
for arg in "$@"; do
  case "$arg" in
    --yes) ASSUME_YES=1 ;;
    *) SIZE="$arg" ;;
  esac
done

if [[ $EUID -ne 0 ]]; then
  echo "❌ Cần chạy bằng root: sudo bash scripts/setup-swap.sh ${SIZE}" >&2
  exit 1
fi

# Chốt an toàn: script này ghi một file nhiều GB và sửa /etc/fstab của MÁY ĐANG CHẠY NÓ.
# Chạy nhầm trên máy dev hay trong container là mất đĩa vô ích, nên phải xác nhận có chủ đích.
if [[ $ASSUME_YES -ne 1 ]]; then
  echo "Sắp tạo swap ${SIZE} tại ${SWAPFILE} trên máy: $(hostname)"
  echo "Việc này ghi một file ${SIZE} vào đĩa và thêm một dòng vào /etc/fstab."
  read -r -p "Gõ 'co' rồi Enter để tiếp tục: " tra_loi
  if [[ "$tra_loi" != "co" ]]; then
    echo "Đã huỷ, không thay đổi gì."
    exit 0
  fi
fi

echo "── [1/6] Kiểm tra swap hiện có ─────────────────"
if swapon --show | grep -q .; then
  echo "⚠️  Máy ĐÃ có swap:"
  swapon --show
  echo "   Nếu muốn thay bằng file mới, tắt cái cũ trước rồi chạy lại script này."
  exit 0
fi
echo "   Chưa có swap nào — tiếp tục."

echo "── [2/6] Kiểm tra dung lượng đĩa còn trống ─────"
# Swap chiếm đĩa THẬT. Tạo file 6G trên phân vùng còn 5G là làm hỏng máy, nên chặn ở đây.
CAN_GB=$(numfmt --from=iec "${SIZE}" | awk '{print int($1/1024/1024/1024)}')
FREE_GB=$(df -BG --output=avail / | tail -1 | tr -dc '0-9')
echo "   Cần: ${CAN_GB}G · Còn trống trên /: ${FREE_GB}G"
# Chừa lại 2G cho hệ thống thở (log, cache, artefact build).
if (( FREE_GB < CAN_GB + 2 )); then
  echo "❌ Không đủ đĩa. Cần ${CAN_GB}G swap + 2G dự phòng, mà chỉ còn ${FREE_GB}G." >&2
  echo "   Giảm kích thước (vd: sudo bash scripts/setup-swap.sh 2G) hoặc dọn đĩa trước." >&2
  exit 1
fi

echo "── [3/6] Tạo file swap ${SIZE} ──────────────────"
# fallocate nhanh hơn dd nhiều; một số filesystem không hỗ trợ thì lùi về dd.
if ! fallocate -l "${SIZE}" "${SWAPFILE}" 2>/dev/null; then
  echo "   fallocate không dùng được, chuyển sang dd (chậm hơn, vài phút)…"
  dd if=/dev/zero of="${SWAPFILE}" bs=1M count=$((CAN_GB * 1024)) status=progress
fi
# Chỉ root đọc/ghi — swap chứa nội dung bộ nhớ tiến trình, kể cả secret đang nằm trong RAM.
chmod 600 "${SWAPFILE}"

echo "── [4/6] Định dạng và bật ───────────────────────"
mkswap "${SWAPFILE}" >/dev/null
swapon "${SWAPFILE}"

echo "── [5/6] Giữ swap sau khi khởi động lại ─────────"
if ! grep -q "^${SWAPFILE} " /etc/fstab; then
  echo "${SWAPFILE} none swap sw 0 0" >> /etc/fstab
  echo "   Đã thêm dòng vào /etc/fstab."
else
  echo "   /etc/fstab đã có dòng swap — bỏ qua."
fi

echo "── [6/6] Giảm swappiness ────────────────────────"
# Mặc định Ubuntu là 60: kernel đẩy dữ liệu sang swap khá sớm, làm chậm ngay cả khi còn RAM.
# Đặt 10 = chỉ dùng swap khi RAM thật sự cạn — đúng vai trò "phao cứu sinh" ta cần ở đây.
sysctl -w vm.swappiness=10 >/dev/null
if ! grep -q "^vm.swappiness" /etc/sysctl.conf; then
  echo "vm.swappiness=10" >> /etc/sysctl.conf
fi

echo ""
echo "✅ Xong. Trạng thái bộ nhớ hiện tại:"
free -h
