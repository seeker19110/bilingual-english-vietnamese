# 0171 — Quét toàn bộ trang: sửa lỗi trang trắng ở `/login`

- **Ngày:** 2026-08-27
- **Loại:** fix
- **PR:** (điền sau khi tạo)

## Việc đã làm

Quét **toàn bộ 91 route** khai báo trong `apps/dhcb/src/App.tsx` bằng một crawler Playwright
tạm (dùng `mockLogin` của `e2e/helpers/auth.ts`), ghi lại với mỗi trang: URL cuối cùng, độ dài
text hiển thị, lỗi console, lỗi runtime và dấu hiệu ErrorBoundary.

Kết quả: **1 trang hỏng thật** — `/login`.

### Lỗi: người đã đăng nhập vào `/login` thấy TRANG TRẮNG

`Login.tsx` gọi `nav('/')` **ngay trong thân render** rồi `return null`:

```tsx
if (user) {
  nav('/')
  return null
}
```

Đây là side effect chạy trong lúc React đang render — React bỏ qua, nên URL **đứng nguyên ở
`/login`** trong khi component đã trả `null`. Người dùng nhìn thấy màn hình trắng hoàn toàn
(đo được: 0 ký tự trong `<body>`).

**Sửa:** dùng `<Navigate to="/" replace />` — một component, chuyển hướng ở giai đoạn commit
thay vì trong render.

**Test canh gác mới:** `e2e/login-redirect.spec.ts` (2 ca: đã đăng nhập → bị đẩy về `/` và
trang có nội dung; chưa đăng nhập → vẫn thấy form đăng nhập).

## Các trang KHÔNG hỏng (đã loại trừ)

- 401/404 trong console ở `/thu-thach`, `/so-tay-loi-sai`, `/ban-dong-hanh`,
  `/lap-trinh/bai-hoc/:id`, `/nhom-di-chung/:code` là do môi trường quét chạy Vite dev
  **không có Postgres thật** — không phải lỗi code.
- `/mon-hoc/mathematics` bị đẩy về `/mon-hoc` cũng vì cùng lý do (API `getSubjectDetails`
  fail). Xem "Góp ý" bên dưới.
- 34 route alias (`/career`, `/work`, `/profile`, `/subjects/:id`…) chuyển hướng đúng đích.

## Góp ý còn mở (chưa làm trong PR này)

`SubjectDetail.tsx` bắt lỗi `getSubjectDetails()` bằng `.catch(() => nav('/mon-hoc'))` — API
lỗi thì người dùng bị đá về danh sách môn **không kèm thông báo nào**, khó phân biệt với
"môn không tồn tại". Trái tinh thần luật §4.3 (mọi thao tác có thể fail đều có nhánh lỗi trên
UI). Đề xuất: hiện toast/`ErrorState` với nút thử lại, chỉ chuyển hướng khi server thật sự
trả 404.

## Bằng chứng kiểm chứng

```
Build ✅ | Type ✅ | Lint ✅ (0 cảnh báo) | Format ✅ | Test ✅ (6783/6783, 482 file)
E2E login-redirect.spec.ts ✅ (2/2)
```
