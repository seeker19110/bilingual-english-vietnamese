---
description: 'Quy chuẩn Kỹ thuật & Kiến trúc Nghiêm ngặt Toàn cục — Áp dụng cho mọi file mã nguồn Backend, Frontend, CSDL, Contracts và Tests'
---

# QUY CHUẨN KỸ THUẬT & KIẾN TRÚC NGHIÊM NGẶT (STRICT ENGINEERING STANDARDS)

Mọi thao tác lập trình, refactor, thêm tính năng trong toàn bộ repository BẮT BUỘC tuân thủ:

1. **TypeScript Strict & Zero Any:**
   - CẤM `any` và ép kiểu bừa bãi `as unknown as Type`. Mọi dữ liệu không chắc chắn phải được kiểm tra bằng Zod hoặc Type Guard.
2. **Contract-First & Zod Validation:**
   - Mọi DTO, request body, query params và AI payload đều phải được xác định rõ Schema trong `packages/core-contracts/` và validate qua Zod trước khi xử lý.
3. **Database Integrity & Pool Management:**
   - Thao tác nhiều bảng phải bọc trong `withTransaction`. Luôn bảo đảm `client.release()` giải phóng kết nối PostgreSQL.
   - Migration phải có tính tương thích ngược (Additive-first) và có thể rollback an toàn.
4. **Anti-Hallucination Gate:**
   - Tuyệt đối không cho AI output ghi đè trực tiếp lên quyền hạn, thanh toán, số dư hay chỉ số người dùng mà không qua bộ lọc kiểm tra logic determinism.
5. **Quality Gates Tuyệt Đối:**
   - Trước khi hoàn tất tác vụ, bắt buộc chạy kiểm thử: `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`, `npm run build`. Dung sai lỗi = 0.
