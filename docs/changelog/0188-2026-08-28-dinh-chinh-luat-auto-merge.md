# docs: đính chính luật auto-merge — cửa sổ hẹp, không phải hỏng sẵn (2026-08-28)

**Nhánh:** `claude/hien-trang-du-an-dbch0x`

## Bối cảnh

Ở PR #726 (đợt trước, đã merge), lần gọi bật auto-merge đầu tiên bị GitHub từ chối. Tôi đọc
`CLAUDE.md` mục 11 — nơi ghi "GitHub từ chối auto-merge ở CẢ HAI đầu, PR #724 không có nổi một
cửa sổ để bật" — rồi báo lại người dùng đúng theo cách hiểu đó.

Người dùng hỏi lại: **"bật ngay từ đầu được không?"** Câu hỏi đó buộc phải đọc kỹ lại thông báo
lỗi thật, và hoá ra chẩn đoán trong tài liệu **chưa đầy đủ**.

## Vấn đề: tài liệu điều hành nói sai nguyên nhân

Thông báo GitHub trả về ở lần gọi đầu:

> The pull request is in unstable status (**required checks are failing**)

"**failing**", không phải "pending". Nghĩa là đã có check **ĐỎ** — chứ không phải "CI đang chạy
nên chưa cho bật" như tài liệu mô tả.

Thủ phạm: cổng `metadata` đỏ sau **4 giây** vì tiêu đề PR sai quy ước. Tôi đặt
`fix(kotlinSim): …`, mà regex ở `.github/workflows/pr-policy.yml` chỉ nhận scope **chữ thường**:

```
^(feat|fix|refactor|docs|test|chore|style|perf|build|ci|revert)(\([a-z0-9._/-]+\))?!?: .+
```

Tức auto-merge bị chặn bởi **lỗi của người tạo PR**, không phải bởi cơ chế GitHub. Sau khi sửa
tiêu đề thành `fix(programming): …`, cổng xanh — nhưng lúc đó CI đã chạy xong, nên lần gọi thứ
hai bị từ chối bằng lý do KHÁC: `already in clean status, merge directly`. Cửa sổ đã đóng.

Đây đúng loại lệch mà **Tầng 6b của quy trình audit** sinh ra để bắt: tài liệu điều hành nói một
đằng (auto-merge hỏng sẵn, đừng trông cậy), cơ chế thật một nẻo (auto-merge dùng được, chỉ là
cửa sổ hẹp và mình tự đóng nó). Để nguyên thì mọi phiên sau đều bỏ qua auto-merge vì tin rằng
nó không hoạt động.

## Đã sửa gì trong `CLAUDE.md`

Sửa **tại chỗ** mục 3 và mục 11, không chồng thêm mục mới.

1. **Đính chính đoạn "Vì sao đổi" ở mục 11.** Bỏ khẳng định "từ chối ở CẢ HAI đầu"; ghi rõ
   auto-merge chỉ bật được trong cửa sổ lúc check còn **pending**, kèm nguyên văn thông báo lỗi
   của PR #726 và nguyên nhân thật.
2. **"Ba bước bắt buộc khi tạo PR" → BỐN bước**, thêm bước 1 mới: **kiểm tiêu đề khớp regex
   TRƯỚC khi tạo PR**, chép nguyên văn regex và nêu đúng cái bẫy đã dính (scope chữ thường).
3. **Bước bật auto-merge nói rõ "NGAY TRONG CÙNG NHỊP với lệnh tạo PR"** — không chờ, không kiểm
   gì xen giữa, vì chậm một nhịp là cửa sổ đóng. Và bật không được thì **không bỏ mặc PR**: theo
   dõi, CI xanh là merge (squash) ngay, không chờ người dùng bấm.
4. **Sửa một lỗi định dạng làm vỡ nghĩa câu.** Đoạn điều kiện merge tay có dòng
   `- không xung đột.` bị Prettier hiểu thành gạch đầu dòng, cắt câu "CI xanh + không xung đột"
   làm đôi. Viết lại thành câu liền mạch.
5. Mục 3 (ba việc phải làm khi tạo PR) cập nhật cho khớp, có trỏ sang mục 11.

## Bằng chứng

- Regex chép vào `CLAUDE.md` đã đối chiếu **từng ký tự** với `.github/workflows/pr-policy.yml`
  dòng 49 — không chép theo trí nhớ.
- `npx prettier --write CLAUDE.md` sạch.
- Chỉ sửa tài liệu, không chạm mã nguồn: cổng build/typecheck/lint/test không bị ảnh hưởng.

## Ghi chú

Luật KHÔNG đổi, chỉ chẩn đoán đổi: vẫn là "tạo PR → bật auto-merge ngay → không bật được thì CI
xanh là merge ngay", và vẫn **cấm merge tay khi CI chưa xanh**.
