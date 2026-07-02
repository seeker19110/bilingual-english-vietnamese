#!/bin/bash
# In báo cáo vị trí dự án hiện tại
# Chạy tự động ở đầu mỗi phiên (session-start hook)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 VỊ TRÍ DỰ ÁN HIỆN TẠI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Giai đoạn hiện tại
echo ""
echo "🎯 GIAI ĐOẠN:"
grep "^## Giai đoạn hiện tại" PROGRESS.md -A 3 | tail -3

# Đã xong
echo ""
echo "✅ BƯỚC 1 (Dựng hàng rào):"
echo "   Prettier, ESLint, TS strict, Husky, commitlint, CI"
echo "   • Branch protection: ❌ chưa kiểm"

echo ""
echo "✅ BƯỚC 2 (Lấp lỗ hổng):"
echo "   • Unit test + coverage gate ✅"
echo "   • E2E Playwright + a11y ✅"
echo "   • Bundle-size budget ✅"
echo "   • Theme/mobile ✅"
echo "   • Sentry (observability) ❌ CHƯA CÓ"
echo "   • Migration docs ❓ chưa rõ"

# Nợ kỹ thuật
echo ""
echo "📝 NỢ KỸ THUẬT (ưu tiên):"
echo "   1. 🔴 Thanh toán Pro (chốt sản phẩm trước)"
echo "   2. 🟡 Script gắn CEFR (chưa chạy thật)"
echo "   3. 🟡 Sentry (observability)"
echo "   4. 🟢 Branch protection + migration docs"

# Git status
echo ""
echo "🌿 GIT:"
git branch --show-current
git status --short | head -5 || echo "   Working tree clean"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
