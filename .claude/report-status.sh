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
echo "   • Sentry (observability) ⚠️ đã code xong (client+server, no-op tới khi có DSN) — CHƯA điền SENTRY_DSN/VITE_SENTRY_DSN trên VPS"
echo "   • Migration 0007/0008 ❌ CHƯA chạy trên Supabase production (cần làm TRƯỚC deploy kế tiếp)"

# Nợ kỹ thuật
echo ""
echo "📝 NỢ KỸ THUẬT (ưu tiên):"
echo "   1. 🔴 Thanh toán Pro (chốt sản phẩm trước — cần quyết định của người dùng)"
echo "   2. 🟡 Đợt 2 CEFR C1/C2: bổ sung ~1.407 từ CEFR-J còn thiếu vào từ điển (khác việc mở cấp C1/C2 vào lộ trình — đã xong PR #209)"
echo "   3. 🟡 Sentry: điền DSN trên VPS + migration 0007/0008 trên Supabase production"
echo "   4. 🟢 Branch protection (chưa xác nhận được qua tool hiện có)"

# Git status
echo ""
echo "🌿 GIT:"
git branch --show-current
git status --short | head -5 || echo "   Working tree clean"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
