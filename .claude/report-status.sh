#!/bin/bash
# In báo cáo vị trí dự án hiện tại
# Chạy tự động ở đầu mỗi phiên (session-start hook)
#
# LƯU Ý: phần "Đã xong" bên dưới vẫn là TÓM TẮT TĨNH, phải tự tay cập nhật khi trạng thái đổi.
#
# Phần "Nợ kỹ thuật" thì KHÔNG còn chép tay nữa (sửa 2026-09-03): nó đọc THẲNG mục
# "Nợ kỹ thuật còn mở" của PROGRESS.md — nguồn thật duy nhất. Trước đây danh sách này được chép
# cứng vào script và đã lỗi thời HAI LẦN: lần audit 2026-08-01 (báo Sentry/thanh toán Pro/branch
# protection là "chưa làm" trong khi đã xong từ lâu) và lần 2026-09-03 (còn báo ngưỡng CSS 18 kB
# sau khi đã nới lên 20 kB, và coverage 90,56% sau khi đã đo lại). Chép tay thì lần nào cũng chỉ
# đặt lại đồng hồ đếm tới lần lỗi thời sau — nên bỏ hẳn chỗ chép.
#
# Đổi định dạng mục nợ trong PROGRESS.md thì chạy `npm test -- report-status` để biết còn khớp.

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 VỊ TRÍ DỰ ÁN HIỆN TẠI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Đợt việc gần nhất — đọc THẲNG docs/changelog/ (từ 2026-08-26 nhật ký tách khỏi PROGRESS.md,
# mỗi đợt một file, để hai PR song song không còn xung đột ở cùng một chỗ). File có SỐ LỚN NHẤT
# là mới nhất; dòng đầu mỗi file là tiêu đề.
echo ""
echo "🎯 3 ĐỢT VIỆC GẦN NHẤT (docs/changelog/ — xem thêm: npm run changelog):"
if [ -d docs/changelog ]; then
  for f in $(ls docs/changelog/[0-9]*.md 2>/dev/null | sort -r | head -3); do
    head -1 "$f" | sed 's/^# /   · /'
  done
else
  echo "   (chưa có docs/changelog/)"
fi

echo ""
echo "✅ ĐÃ XONG (xác nhận qua audit 2026-08-01, xem CLAUDE.md mục 13 + PROGRESS.md):"
echo "   Prettier, ESLint, TS strict, Husky, commitlint, CI, coverage gate, E2E+a11y, bundle-size budget"
echo "   Sentry (DSN đã điền, xác nhận 2026-07-27) · Branch protection (xác nhận 2026-07-11)"
echo "   Thanh toán Pro/VIP qua SePay (xác nhận 2026-07-27) · Đã rời hẳn Supabase → Postgres tự host"
echo "   Domain mặc định .org + redirect .com/apex → www.org (2026-07-31)"
echo "   Backup + restore R2 (DB/.env/Nginx+crontab+PM2) — kiểm chứng cả 2 chiều (2026-08-01)"

echo ""
echo "📝 NỢ KỸ THUẬT CÒN MỞ (đọc thẳng từ PROGRESS.md — nguồn thật, không chép tay):"
PROGRESS_FILE="${PROGRESS_FILE:-PROGRESS.md}"
if [ -f "$PROGRESS_FILE" ]; then
  no_ky_thuat=$(awk '
    # Rút TIÊU ĐỀ IN ĐẬM của từng mục nợ CÒN MỞ.
    # Còn mở = gạch đầu dòng MỞ ĐẦU bằng 🟡 hoặc 🔴. Mục đã đóng luôn viết dạng "- ~~..." nên
    # tự rơi ra ngoài mẫu này — KHÔNG lọc thêm theo "có chứa ~~", vì một mục còn mở nhắc tới
    # ~~gạch ngang~~ trong chính dòng đầu sẽ bị bỏ sót, đúng kiểu hỏng im lặng mà cổng này
    # sinh ra để chặn.
    # Tiêu đề in đậm có thể vắt qua nhiều dòng nên phải gom tới khi gặp ** đóng — cắt cứng
    # theo số ký tự sẽ xén giữa một ký tự nhiều byte và làm hỏng tiếng Việt.
    /^## Nợ kỹ thuật còn mở/ { inside = 1; next }
    inside && /^## /         { exit }
    inside && /^- (🟡|🔴)/ {
      buf = $0
      sub(/^- /, "", buf)
      while (gsub(/\*\*/, "**", buf) < 2 && (getline nxt) > 0) {
        sub(/^[ \t]+/, "", nxt)
        buf = buf " " nxt
      }
      sub(/^(🟡|🔴)[ ]*/, "", buf)
      if (match(buf, /\*\*.*\*\*/)) buf = substr(buf, RSTART + 2, RLENGTH - 4)
      n++
      print "   " n ". " buf
    }
  ' "$PROGRESS_FILE")
  if [ -n "$no_ky_thuat" ]; then
    echo "$no_ky_thuat"
  else
    echo "   (không đọc được mục nợ — kiểm lại định dạng PROGRESS.md)"
  fi
else
  echo "   (không thấy $PROGRESS_FILE)"
fi

# Git status
echo ""
echo "🌿 GIT:"
git branch --show-current
git status --short | head -5 || echo "   Working tree clean"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
