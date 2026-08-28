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
echo "   5. 🟢 [ĐÓNG 2026-08-28] Model Gemini (gemini-3.6-flash, PR #647) chạy thật trên" \
     "production, VÀ baseline eval:tutor đã chạy lại ngày 2026-08-26 (recall 97,7% / precision" \
     "97,7% — docs/research/eval-tutor-baseline.md), MỚI HƠN lần đổi nội dung prompt/model gần" \
     "nhất (2026-08-25). Cả hai vế của nợ này đã xong."
echo "   6. 🟢 [ĐÓNG 2026-08-26] nginx/en-vi.conf đã sửa trong repo (bỏ CSP-Report-Only lạc" \
     "hậu còn trỏ supabase) VÀ đã áp lên VPS thật, cùng lượt với cloudflare-realip.conf để bịt" \
     "lỗ hổng rate limit (xác nhận bằng bài thử A/B — xem PROGRESS.md)."
echo "   7. 🟡 [đo lại 2026-08-28, audit toàn diện] Ngân sách BUNDLE rộng: Initial JS" \
     "124,83/140 kB (dư ~10,8%), CSS 16,26/18 kB (dư ~9,7%) — CSS mỏng hơn JS. COVERAGE:" \
     "branches 90,56% trên sàn 90 = dư 0,56 điểm, vẫn là biên độ hẹp nhất trong 4 chỉ số" \
     "(stmts 95,28 · funcs 95,34 · lines 95,28). Chạy npm run budget để xem số hiện tại."
echo "   8. 🟡 [2026-08-28] 3 cặp migration TRÙNG SỐ: 0026 · 0027 · 0059. Không cặp nào chạm" \
     "chung bảng nên thứ tự không rủi ro, và runner theo dõi theo TÊN FILE nên không bỏ sót." \
     "CỐ Ý KHÔNG đổi số: migration đã chạy trên production, đổi tên file = chạy lại lần nữa."

# Git status
echo ""
echo "🌿 GIT:"
git branch --show-current
git status --short | head -5 || echo "   Working tree clean"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
