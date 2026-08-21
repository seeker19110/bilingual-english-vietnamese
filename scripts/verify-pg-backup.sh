#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/verify-pg-backup.sh — Kiểm thử PHỤC HỒI backup Postgres (GĐ5 kế hoạch
# scale 50k concurrent, xem docs/research/ke-hoach-scale-30k-concurrent.md).
#
# VÌ SAO CẦN SCRIPT NÀY: có backup (cron pg_dump, xem docs/setup-postgresql-vps.md
# mục 7) KHÔNG có nghĩa là backup DÙNG ĐƯỢC khi cần — file có thể hỏng, thiếu bảng,
# hoặc lệnh restore sai cú pháp mà không ai biết cho tới lúc THẬT SỰ cần khôi phục
# (lúc đó đã quá muộn để phát hiện). Script này restore backup vào 1 DATABASE TẠM
# (không đụng database thật đang chạy), kiểm tra vài bảng cốt lõi có dữ liệu, rồi
# XOÁ database tạm — an toàn chạy định kỳ (vd hàng tuần) mà không ảnh hưởng production.
#
# CÁCH DÙNG (chạy trên VPS có Postgres, KHÔNG chạy trong CI/sandbox — cần Postgres
# thật + file backup thật):
#   bash scripts/verify-pg-backup.sh /var/backups/dhcb_20260725.sql.gz
#   (không truyền tham số → tự tìm file *.sql.gz mới nhất trong /var/backups)
#
# Thoát mã 0 = phục hồi + kiểm tra OK. Khác 0 = có vấn đề, ĐỌC KỸ log trước khi
# yên tâm rằng backup hiện tại dùng được.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups}"
TEST_DB="dhcb_restore_test"
BACKUP_FILE="${1:-}"

if [ -z "$BACKUP_FILE" ]; then
  BACKUP_FILE=$(find "$BACKUP_DIR" -maxdepth 1 -name '*.sql.gz' -printf '%T@ %p\n' 2>/dev/null \
    | sort -rn | head -1 | cut -d' ' -f2-)
fi

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Không tìm thấy file backup. Truyền đường dẫn trực tiếp hoặc kiểm tra \$BACKUP_DIR ($BACKUP_DIR)."
  exit 1
fi

if [ "$(id -un)" = "postgres" ]; then
  PSQL="psql"
else
  PSQL="sudo -u postgres psql"
fi

echo "── Kiểm thử phục hồi backup: $BACKUP_FILE ──────────────"

# Dọn database test cũ (nếu lần chạy trước lỗi giữa chừng chưa kịp xoá)
$PSQL -c "drop database if exists $TEST_DB;" >/dev/null

echo "1/4 — Tạo database tạm '$TEST_DB'..."
$PSQL -c "create database $TEST_DB;" >/dev/null

echo "2/4 — Phục hồi backup vào database tạm..."
if ! gunzip -c "$BACKUP_FILE" | $PSQL -d "$TEST_DB" >/tmp/restore-test.log 2>&1; then
  echo "❌ Lệnh phục hồi LỖI — xem /tmp/restore-test.log"
  $PSQL -c "drop database if exists $TEST_DB;" >/dev/null
  exit 1
fi

echo "3/4 — Kiểm tra vài bảng cốt lõi có dữ liệu (users, profiles, app_settings)..."
FAIL=0
for TABLE in users profiles app_settings; do
  COUNT=$($PSQL -d "$TEST_DB" -tAc "select count(*) from public.$TABLE" 2>/dev/null || echo "ERROR")
  if [ "$COUNT" = "ERROR" ]; then
    echo "   ❌ Bảng '$TABLE' — KHÔNG đọc được (thiếu bảng hoặc lỗi quyền)."
    FAIL=1
  else
    echo "   ✓ Bảng '$TABLE': $COUNT dòng."
  fi
done

echo "4/4 — Dọn database tạm..."
$PSQL -c "drop database if exists $TEST_DB;" >/dev/null

if [ "$FAIL" -ne 0 ]; then
  echo "❌ Kiểm thử phục hồi CÓ VẤN ĐỀ — xem log ở trên. Backup này CHƯA đáng tin cậy."
  exit 1
fi

echo "✅ Phục hồi + kiểm tra OK — backup $BACKUP_FILE dùng được."
