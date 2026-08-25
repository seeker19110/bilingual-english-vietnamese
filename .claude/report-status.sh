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
echo "   1. 🟢 npm audit: VỀ 0 LỖ HỔNG (rà soát tự động 2026-08-09). Advisory react-router" \
     "(GHSA-qwww-vcr4-c8h2) đã được GitHub NARROW dải ảnh hưởng xuống <7.18.2 — bản 7.18.2 dự án" \
     "đang dùng chính là bản vá, mục 'giữ nguyên, chấp nhận báo dài hạn' trước đây nay ĐÃ ĐÓNG." \
     "2 advisory mới (js-yaml/nanoid, thuần devDependency) đã vá qua 'overrides' trong" \
     "package.json + npm install"
echo "   2. 🟡 restore:all: mới kiểm chứng nhánh AN TOÀN (tải về); nhánh --restore-into (phá huỷ" \
     "DB thật) chưa test thật"
echo "   3. 🟢 Facebook/Apple/Microsoft OAuth tạm hoãn thêm domain .org (đăng nhập Google/email" \
     "vẫn OK) — xem docs/doi-ten-mien-chinh-org.md"
echo "   4. 🟢 PM2 cluster mode ĐÃ chạy song song thật — VPS nâng lên 3 vCPU / 3GB RAM" \
     "(2026-08-21), 3 instance khai thác đủ 3 core. Việc tách Postgres/Redis ra máy riêng vẫn" \
     "thuộc GĐ2 kế hoạch scale."
echo "   5. 🔴 [xác nhận lại 2026-08-25 qua audit toàn diện] Model Gemini đổi khẩn cấp sang" \
     "gemini-3.6-flash (PR #647, Google gỡ gemini-2.0-flash) — VẪN chưa xác nhận hoạt động," \
     "baseline eval:tutor vẫn là bản 2026-08-21 (cũ hơn ngày đổi prompt/model 2026-08-24)." \
     "Cần chạy tay: npm run eval:tutor -- --write-baseline với key thật trên VPS."
echo "   6. 🟡 [2026-08-25] nginx/en-vi.conf đã sửa trong repo (bỏ CSP-Report-Only lạc hậu còn" \
     "trỏ supabase) nhưng CHƯA áp lên VPS thật — cần copy + nginx -t + systemctl reload nginx."
echo "   7. 🟡 [2026-08-25] Biên độ ngân sách mỏng: bundle JS dùng 99,7% ngưỡng, coverage" \
     "branches chỉ dư 0,13 điểm. Chạy npm run budget để xem số hiện tại."

# Git status
echo ""
echo "🌿 GIT:"
git branch --show-current
git status --short | head -5 || echo "   Working tree clean"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
