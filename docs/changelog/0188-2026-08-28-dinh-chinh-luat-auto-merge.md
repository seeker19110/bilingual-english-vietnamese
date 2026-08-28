# docs: đính chính luật auto-merge — đừng tin chữ "failing" trong thông báo lỗi (2026-08-28)

**Nhánh:** `claude/hien-trang-du-an-dbch0x`

## Bối cảnh

Ở PR #726, lần gọi bật auto-merge đầu tiên bị GitHub từ chối. Người dùng hỏi lại **"bật ngay từ
đầu được không?"**, nên phải đọc kỹ thông báo lỗi thật thay vì chỉ tin ghi chép cũ.

## Chẩn đoán sai — và cách nó bị bác bỏ

Thông báo GitHub trả về:

> The pull request is in unstable status (**required checks are failing**)

Đọc chữ "failing" (chứ không phải "pending"), tôi kết luận: đã có check **ĐỎ** — và đúng lúc đó
cổng `metadata` vừa đỏ sau 4 giây vì tiêu đề PR sai quy ước (`fix(kotlinSim)`, mà regex chỉ nhận
scope chữ thường). Suy ra: **auto-merge bị chặn bởi lỗi của mình, sửa tiêu đề là bật được.**

**Suy luận đó SAI, và đã bị bác bỏ bằng thí nghiệm ngay trong đợt này.** PR #727 (chính PR
mang thay đổi này) được tạo với tiêu đề ĐÚNG quy ước — kiểm bằng cách chạy chính regex đó trước
khi tạo. Đo trạng thái ngay sau lời gọi bật auto-merge thất bại:

| Check            | Trạng thái               |
| ---------------- | ------------------------ |
| `metadata`       | ✅ **success**           |
| 10 check còn lại | `in_progress` / `queued` |
| Check đỏ         | **KHÔNG CÓ CÁI NÀO**     |

Vẫn bị từ chối bằng **đúng câu thông báo đó**. Nên:

- Chữ "failing" trong thông báo **không có nghĩa là có check đỏ** — nó chỉ là cách GitHub diễn
  đạt trạng thái `unstable`.
- Việc `metadata` đỏ ở PR #726 là **trùng hợp, không phải nhân quả**.
- **Ghi chép cũ trong `CLAUDE.md` ("từ chối ở cả hai đầu, không có cửa sổ để bật") hoá ra ĐÚNG.**

Suýt nữa thì đợt này ghi một chẩn đoán sai vào tài liệu điều hành — đúng loại lỗi mà nó ra đời
để sửa. Bài học chung: **một quan sát trùng khớp không phải là bằng chứng nhân quả**; muốn kết
luận thì phải có ca đối chứng (ở đây là PR tiêu đề đúng mà vẫn bị từ chối).

## Đã sửa gì trong `CLAUDE.md`

Sửa **tại chỗ** mục 3 và mục 11, không chồng thêm mục mới. **Luật không đổi.**

1. **Giữ nguyên kết luận cũ** ("GitHub từ chối auto-merge ở CẢ HAI đầu"), nhưng **thêm cảnh báo
   về chữ "failing"** kèm bảng đo của PR #727 — để phiên sau không lặp lại đúng suy luận nhầm này
   và đi sửa lung tung.
2. **Bước bật auto-merge:** nói rõ gọi **MỘT lần**, đừng chẩn đoán, đừng gọi lại nhiều lần, và
   **tuyệt đối đừng coi thất bại đó là lý do để dừng** — theo dõi CI, xanh + không xung đột là
   merge (squash) NGAY, không chờ người dùng bấm.
3. **"Ba bước bắt buộc khi tạo PR" → BỐN bước**, thêm bước 1: **kiểm tiêu đề khớp regex TRƯỚC khi
   tạo PR**. Lý do đã sửa cho đúng — **không phải** vì nó chặn auto-merge (đã bác bỏ), mà vì
   `metadata` là required status check: tiêu đề sai = PR không vào được `main` cho tới khi sửa,
   mất thêm một vòng CI ~15 phút. Chép nguyên văn regex và nêu cái bẫy đã dính (scope chữ thường).
4. **Sửa một lỗi định dạng làm vỡ nghĩa câu.** Đoạn điều kiện merge tay có dòng
   `- không xung đột.` bị Prettier hiểu thành gạch đầu dòng, cắt câu "CI xanh + không xung đột"
   làm đôi giữa hai khối. Viết lại thành câu liền mạch.
5. **Mục 3** cập nhật cho khớp, trỏ sang mục 11.

## Bằng chứng

- Bảng trạng thái check ở trên đọc trực tiếp từ API GitHub trên PR #727, tại thời điểm lời gọi
  bật auto-merge thất bại — không phải suy đoán.
- Regex chép vào `CLAUDE.md` đã đối chiếu **từng ký tự** với `.github/workflows/pr-policy.yml`
  dòng 49.
- Thông báo lỗi trích trong tài liệu là **nguyên văn** của GitHub.
- Chỉ sửa tài liệu, không chạm mã nguồn.
