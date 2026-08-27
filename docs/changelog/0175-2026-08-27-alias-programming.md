# 0175 — Thêm alias `/programming` + test canh gác toàn bộ cặp alias Việt–Anh

- **Ngày:** 2026-08-27
- **Loại:** fix
- **PR:** (điền sau khi tạo)

## Vấn đề

Câu hỏi "`/lap-trinh` và `/programming` khác hay giống nhau" dẫn tới một lỗi im lặng.

Đo bằng trình duyệt thật (Playwright, đã đăng nhập giả):

| Đường dẫn                                                                       | Đi tới đâu   | Bản chất                                                    |
| ------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------- |
| `/lap-trinh`                                                                    | `/lap-trinh` | route thật, trang chủ môn Lập trình                         |
| `/programming`                                                                  | **`/`**      | ❌ **không có route** — rơi vào `*` rồi bị đẩy về trang chủ |
| `/mon-hoc/programming`                                                          | `/lap-trinh` | chuyển hướng có chủ ý (`App.tsx`)                           |
| `/subjects/programming` · `/phong-hoc/programming` · `/hoc-mon-hoc/programming` | `/lap-trinh` | chuyển hướng 2 chặng qua `SubjectRedirect`                  |

`lap-trinh` là URL tiếng Việt cho người dùng; `programming` là **mã định danh môn** trong
`packages/core-learner/subjectRegistry.ts` (và tên thư mục mã nguồn
`pages/subjects/programming/`). Cùng trỏ một môn, nhưng chỉ `lap-trinh` là đường dẫn thật.

Mọi trụ/môn khác đều có cặp Việt–Anh (`/tieng-anh` ↔ `/english`, `/su-nghiep` ↔ `/career`,
`/khoi-nghiep` ↔ `/startup`, `/cuoc-song` ↔ `/life`…). **Riêng Lập trình thiếu alias tiếng
Anh.** Lỗi này không ồn ào: route `*` ở cuối `App.tsx` nuốt mọi đường dẫn lạ rồi đẩy về trang
chủ, nên nhìn qua tưởng app chạy bình thường — không phải trang môn, cũng không phải 404.

## Đã làm

1. Thêm `<Route path="/programming" element={<Navigate to="/lap-trinh" replace />} />`.
2. Thêm `e2e/route-alias.spec.ts` — đối chiếu **10 cặp alias** (`/english`, `/tieng-anh`,
   `/programming`, `/career`, `/startup`, `/profile`, `/companion`, `/subjects`, `/workspace`,
   `/simulators`) + một ca chốt hành vi route `*` (đường dẫn không tồn tại vẫn về trang chủ,
   để việc thêm alias mới không vô tình phá nhánh bắt-tất).

## Bằng chứng kiểm chứng

Test được **chứng minh là bắt được lỗi thật**, không phải test trang trí: tạm gỡ dòng route
vừa thêm rồi chạy lại → ca `/programming` **đỏ**; khôi phục → xanh.

```
Build ✅ | Type ✅ | Lint ✅ (0 cảnh báo) | Format ✅ | Test ✅ (6790/6790, 483 file)
E2E route-alias.spec.ts ✅ 11/11
codemap impact App.tsx → chỉ 1 file bị ảnh hưởng (main.tsx), không consumer nào khác
```
