# V2-01 — ADR domain boundary + lint boundary rule (2026-08-16, M2/S1 DONE)

Owner xác nhận M1 đủ để chuyển tiếp. `docs/adr/0003-bien-gioi-domain-v2.md` — biên giới THẬT
hiện có (Personal OS Core chưa tồn tại, xác nhận ở V2-00): 2 lớp, không phải 3 —
**Platform** (`packages/core-*`, dùng chung mọi domain tương lai) và **Learning domain**
(`apps/english/` + phần lớn `api/*.ts`); `apps/hub/` xếp cùng nhóm platform về dependency (chưa
sở hữu business truth). Luật enforce NGAY: `packages/**` không được import `apps/**` — thêm
`no-restricted-imports` override trong `.eslintrc.cjs`, xác nhận 0 vi phạm hiện có (grep +
`npm run lint` xanh) và rule hoạt động đúng (thử 1 ca vi phạm cố ý, thấy lỗi, rồi xoá). Trả lời
câu hỏi mở TTS/STT từ V2-00: xếp **platform** (tham số hoá theo domain gọi tới, không có logic
ngôn ngữ hard-code trong `packages/core-ai`). Luật "domain không import domain khác" (mục 11
`02-SYSTEM-ARCHITECTURE.md`) CHƯA enforce — chỉ có 1 domain thật, chưa có ca cụ thể để viết đúng,
để dành khi domain thứ 2 xuất hiện. Goal file: M2/S1 → DONE; còn mở M3/S1 (V2-02 field-by-field
contract diff, việc lớn hơn) và M1/S4 (latency production, WAITING, cần quyền VPS).
