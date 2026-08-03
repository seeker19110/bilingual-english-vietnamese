#!/bin/bash
# In báo cáo vị trí dự án hiện tại
# Chạy tự động ở đầu mỗi phiên (session-start hook)
#
# LƯU Ý: phần "Nợ kỹ thuật"/"Đã xong" bên dưới là TÓM TẮT TĨNH, phải TỰ TAY cập nhật khi trạng
# thái đổi (xem PROGRESS.md mục "Nợ kỹ thuật còn mở" là nguồn thật) — nếu để lâu không sửa sẽ lại
# lỗi thời như lần audit 2026-08-01 phát hiện (từng báo sai: Sentry/thanh toán Pro/branch
# protection/migration Supabase đều đã xong từ lâu nhưng script vẫn báo "chưa làm").

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 VỊ TRÍ DỰ ÁN HIỆN TẠI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Giai đoạn hiện tại
echo ""
echo "🎯 GIAI ĐOẠN:"
grep "^## Giai đoạn hiện tại" PROGRESS.md -A 3 | tail -3

echo ""
echo "✅ ĐÃ XONG (xác nhận qua audit 2026-08-01, xem CLAUDE.md mục 13 + PROGRESS.md):"
echo "   Prettier, ESLint, TS strict, Husky, commitlint, CI, coverage gate, E2E+a11y, bundle-size budget"
echo "   Sentry (DSN đã điền, xác nhận 2026-07-27) · Branch protection (xác nhận 2026-07-11)"
echo "   Thanh toán Pro/VIP qua SePay (xác nhận 2026-07-27) · Đã rời hẳn Supabase → Postgres tự host"
echo "   Domain mặc định .org + redirect .com/apex → www.org (2026-07-31)"
echo "   Backup + restore R2 (DB/.env/Nginx+crontab+PM2) — kiểm chứng cả 2 chiều (2026-08-01)"

echo ""
echo "📝 NỢ KỸ THUẬT THẬT (đọc chi tiết ở PROGRESS.md mục \"Nợ kỹ thuật còn mở\"):"
echo "   1. 🟡 react-router: ĐÃ NÂNG lên v7.18.2 (2026-08-02), hết 2 CVE moderate cũ nhưng phát" \
     "sinh 1 cảnh báo high MỚI (CSRF chế độ RSC, GHSA-qwww-vcr4-c8h2) — app không dùng RSC nên" \
     "chấp nhận, chờ bản vá upstream"
echo "   2. 🟡 restore:all: mới kiểm chứng nhánh AN TOÀN (tải về); nhánh --restore-into (phá huỷ" \
     "DB thật) chưa test thật"
echo "   3. 🟢 Facebook/Apple/Microsoft OAuth tạm hoãn thêm domain .org (đăng nhập Google/email" \
     "vẫn OK) — xem docs/doi-ten-mien-chinh-org.md"
echo "   4. 🟢 PM2 cluster mode đúng cơ chế nhưng VPS 1 vCPU nên chưa có lợi ích song song thật" \
     "(cần thêm phần cứng, GĐ2 kế hoạch scale)"

# Git status
echo ""
echo "🌿 GIT:"
git branch --show-current
git status --short | head -5 || echo "   Working tree clean"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
