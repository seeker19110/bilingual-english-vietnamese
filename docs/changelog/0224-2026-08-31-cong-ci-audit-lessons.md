# 0224 — `audit:lessons` thành cổng chặn CI

**Ngày:** 2026-08-31 · **Nhánh:** `claude/audit-lesson-course-quality-fgvw04`
**Tiếp nối:** đợt 0223 (công cụ audit ra đời ở đó, khi ấy chưa gắn vào CI)
**Báo cáo:** `docs/research/audit-chat-luong-bai-hoc-2026-08-31.md` mục 5

## Việc đã làm

Thêm một bước vào job `audit` của `.github/workflows/ci.yml`:

```yaml
- name: Chất lượng nội dung bài học (audit:lessons)
  run: npm run audit:lessons -- --ci
```

`audit` nằm trong `needs` của required status check `quality`, nên từ nay **lỗi nội dung học =
PR không vào được `main`**: bài mồ côi, khoá/lộ trình trỏ bài không tồn tại, hai bài sinh cùng
một URL, bước ⑥ (tự viết) chép lại nguyên bước ③ (ví dụ mẫu). Đây là lớp lỗi mà hai cổng sẵn có
(Zod `LessonSchema` + chạy thật `sampleSolution`) không thể bắt vì chúng chỉ nhìn TỪNG BÀI cô lập.

## Quyết định kèm theo

**Đặt ở job `audit`, không phải `unit`.** Luật CI của dự án (CLAUDE.md mục 11.1 luật 1) yêu cầu
gắn bước mới vào job con hợp lý nhất thay vì nối vào một job đã dài. `audit` là job ngắn nhất
(~40 giây: `npm audit` + codemap cycles), còn lượt rà này ~5 giây và không có I/O (dữ liệu là
hằng biên dịch) — nên nó không đụng tới đường tới hạn. Nối vào `unit` (một trong hai job dài
nhất) sẽ kéo dài đúng nhánh đang quyết định thời gian tường.

## Bằng chứng kiểm chứng

- **Cổng thật sự đỏ, không xanh suông:** cố ý sửa ví dụ mẫu của `hermes-u1-l2` trùng lại lời giải
  → `npm run audit:lessons -- --ci` thoát **mã 1** và gọi đúng tên bài; khôi phục → thoát **mã 0**.
- `npx vitest run scripts/ci-workflow-policy.test.ts` → **7/7 xanh** (test canh 4 luật CI: mọi job
  phải nằm trong cây `needs` của `quality`/`e2e`, hai job đó là job tổng hợp, E2E chia mảnh, chỉ
  upload artifact khi đỏ).
- `npm run typecheck` · `npm run lint` (0 cảnh báo) · `npm run format:check` → xanh.
