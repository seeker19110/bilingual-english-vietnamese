#!/bin/sh
# Chặn dấu xung đột merge lọt vào commit.
#
# VÌ SAO (audit 2026-08-25, F2): `> > > > > > > origin/main` nằm trong PROGRESS.md từ
# 2026-08-21 mà KHÔNG cổng nào bắt được — Prettier đã "sửa" `>>>>>>>` thành blockquote
# markdown lồng nhau, tức là format hợp lệ, nên `format:check` xanh và lint/typecheck
# không đụng tới file .md. Cách duy nhất bắt được là grep thẳng.
#
# Bắt cả 2 dạng: nguyên bản (`>>>>>>>`) và bản đã bị Prettier tách khoảng trắng (`> > > ...`).

set -e

files=$(git diff --cached --name-only --diff-filter=ACM)
[ -z "$files" ] && exit 0

# -I: bỏ qua file nhị phân. Regex neo đầu dòng để không bắt nhầm ví dụ nằm giữa câu.
hits=$(echo "$files" | xargs -r grep -InE '^(<{7}|={7}|>{7})( |$)|^(< ){7}|^(= ){7}|^(> ){7}' 2>/dev/null || true)

if [ -n "$hits" ]; then
  echo "❌ Còn dấu xung đột merge trong các file sắp commit:"
  echo "$hits"
  echo ""
  echo "   Giải xung đột cho hết rồi commit lại. Nếu đây là nội dung THẬT (ví dụ minh hoạ"
  echo "   trong tài liệu), đổi cách viết đi — đừng để nguyên dạng dấu xung đột."
  exit 1
fi
