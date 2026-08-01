# Quy trình đối chiếu SGK — biên soạn lại kho kiến thức theo chương trình MỚI NHẤT

> Ngày: 2026-08-01 · Trạng thái: **sẵn sàng thi hành ở PHIÊN LOCAL**
> Dành cho: phiên Claude Code chạy trên **máy người dùng**, có PDF SGK trong `tai-lieu-sgk/`
> Liên quan: `kho-kien-thuc-{toan,ly,hoa,sinh}-gdpt2018.md` · `dac-ta-gd2-mon-toan-2026-08-01.md`

---

## 0. Đọc trước — vì sao cần quy trình này

Bốn file kho kiến thức hiện có được viết **KHÔNG có SGK trong tay** (phiên chạy từ xa, sandbox
chặn mọi nguồn Việt Nam — xem `kho-kien-thuc-toan-gdpt2018.md` §0.1). Chúng bám **kiến thức khoa
học phổ quát** + khung chương trình theo hiểu biết chung, và **chưa từng được đối chiếu** với:

- **Thông tư 17/2025/TT-BGDĐT** — bản sửa đổi Chương trình GDPT mới nhất (AI đọc bản gốc bị 403).
- Bộ SGK **"Kết nối tri thức với cuộc sống"** — dùng chung toàn quốc từ năm học 2026-2027 theo
  **Quyết định 3588/QĐ-BGDĐT** (26/12/2025).

Phiên local có SGK thật → đây là lúc **biến bản thảo thành bản chuẩn**.

### 0.1 Ranh giới bản quyền — KHÔNG đổi dù đã có sách trong tay

Có PDF **không** đồng nghĩa được chép nội dung. Ranh giới giữ nguyên như `kho-kien-thuc-toan` §0.2:

| Lấy từ SGK được                                                       | TUYỆT ĐỐI KHÔNG                                    |
| --------------------------------------------------------------------- | -------------------------------------------------- |
| **Thứ tự chương/bài**, tên bài (dữ kiện về cấu trúc chương trình)     | Chép nguyên văn đề bài, lời văn, hình vẽ           |
| **Danh mục công thức/định lý** xuất hiện ở lớp nào (sự thật khoa học) | Chép cách diễn đạt/trình bày đặc trưng của sách    |
| **Phạm vi kiến thức** từng lớp (mức độ sâu tới đâu)                   | Lấy đề trong sách rồi đổi vài con số               |
| Thứ tự xuất hiện của khái niệm để dựng `prerequisites`                | Sao chép nguyên cấu trúc trình bày của một bài học |

> Đề bài trong app **luôn do template tự sinh theo tham số** (đặc tả GĐ2 §3.2). SGK chỉ dùng để
> biết **dạy gì, theo thứ tự nào**, không phải để lấy nội dung.

---

## 1. Chuẩn bị (làm một lần)

```bash
ls tai-lieu-sgk/            # xác nhận PDF đã có
git check-ignore -v tai-lieu-sgk/   # BẮT BUỘC: xác nhận git đang chặn thư mục này
git status --short          # tai-lieu-sgk/ KHÔNG được xuất hiện ở đây
```

Nếu `git status` có hiện `tai-lieu-sgk/` → **dừng lại**, sửa `.gitignore` trước khi làm tiếp.
Không bao giờ được để tài liệu bản quyền lọt lên GitHub.

**Thứ tự ưu tiên đọc** (không ôm hết một lượt):

1. Toán 6, 7, 8, 9 — đợt 2a làm cấp 2 trước.
2. Toán 1-5 — đợt 2b.
3. KHTN 6-9 — chuẩn bị GĐ3 (Hoá trước, theo thứ tự đã chốt).
4. Toán 10-12 — đợt 2d, làm sau cùng.

---

## 2. Quy trình cho MỖI cuốn sách

### Bước 1 — Trích mục lục

Đọc phần Mục lục, ghi ra danh sách **chương → bài** theo đúng thứ tự sách. Đây là dữ liệu quan
trọng nhất: nó cho phép app hiện đúng bài học sinh đang học trên lớp.

Ghi vào file mới `docs/research/muc-luc-sgk/toan-<lop>.md` theo mẫu:

```md
# Mục lục Toán <lớp> — Kết nối tri thức (đối chiếu ngày YYYY-MM-DD)

| #   | Chương | Bài | Mạch (SO/HINH/TK) | Công thức chính | Chấm tự động được? |
| --- | ------ | --- | ----------------- | --------------- | ------------------ |
| 1   | ...    | ... | SO                | ...             | ✅ / 🟡 / ❌       |
```

Cột **"Chấm tự động được?"** quyết định bài nào vào MVP:

- ✅ ra đáp số/biểu thức → engine `packages/core-grading` chấm được ngay
- 🟡 cần dạng nhập đặc biệt (công thức hoá học, chọn nhiều đáp án)
- ❌ tự luận/chứng minh → **loại khỏi MVP**, không để AI chấm (nguyên tắc đã chốt)

### Bước 2 — Đối chiếu với kho kiến thức hiện có

Với mỗi mục trong `kho-kien-thuc-*.md`, gán một trong bốn trạng thái và **ghi thẳng vào file**:

| Ký hiệu | Nghĩa                                          | Hành động                            |
| ------- | ---------------------------------------------- | ------------------------------------ |
| `[✓]`   | Khớp SGK                                       | Giữ nguyên                           |
| `[≠]`   | Có trong SGK nhưng **khác lớp / khác thứ tự**  | Sửa lại vị trí, **ghi rõ đã sửa gì** |
| `[+]`   | SGK có mà kho kiến thức **thiếu**              | Bổ sung                              |
| `[−]`   | Kho kiến thức có mà SGK **không dạy ở lớp đó** | Bỏ hoặc chuyển sang lớp đúng         |

> **Bắt buộc ghi lại mọi mục `[≠]` `[+]` `[−]`** vào một mục "Nhật ký đối chiếu" cuối mỗi file
> kho kiến thức. Đây là bằng chứng cho thấy nội dung đã được kiểm chứng thật, không phải AI tự
> tin là đúng — trực tiếp phục vụ cổng duyệt chuyên môn (`kho-kien-thuc-toan` §0.3).

### Bước 3 — Soi kỹ những chỗ ĐÃ ĐÁNH DẤU NGHI NGỜ

Các điểm AI tự nhận là rủi ro, **phải kiểm trước tiên**:

| Chỗ nghi ngờ                               | Ở đâu                        | Vì sao nghi                                                                                               |
| ------------------------------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| **`n = V/24` hay `n = V/22,4`**            | `kho-kien-thuc-hoa` §2 lớp 8 | CT 2018 dùng đkc 25 °C 1 bar → 24 L/mol, khác 22,4 của chương trình cũ. AI rất dễ viết theo thói quen cũ. |
| **Hệ số `g = 10` hay `9,8`**               | `kho-kien-thuc-ly` §2        | Quyết định ngưỡng dung sai 3% của engine chấm phụ thuộc điều này                                          |
| **Phân môn KHTN tách/gộp thế nào ở lớp 9** | `kho-kien-thuc-ly` §0        | Ảnh hưởng quyết định kiến trúc PA C (`subject` + `branch`)                                                |
| **Thống kê & Xác suất dạy từ lớp mấy**     | cả 4 file                    | Mạch TK là phần mới của CT 2018, dễ nhớ sai mốc lớp                                                       |
| Nội dung **STEM/AI/chuyển đổi số** mới     | cả 4 file                    | TT 17/2025 tăng thời lượng phần này — AI chưa đọc được nội dung cụ thể                                    |

### Bước 4 — Cập nhật 12 chủ đề đợt 2a

`dac-ta-gd2-mon-toan-2026-08-01.md` §2.1a đang đề xuất 12 chủ đề **dựa trên phỏng đoán**. Sau khi
có mục lục thật → chọn lại 3 chủ đề/lớp theo tiêu chí:

1. Chấm tự động được (cột ✅ ở Bước 1).
2. Là chủ đề **trọng tâm** của lớp đó theo SGK (số tiết nhiều, nhiều bài luyện tập).
3. Có `prerequisites` rõ ràng để dựng được lộ trình.

### Bước 5 — Chạy cổng chất lượng rồi commit

```bash
npm run typecheck && npm run lint && npm run format:check && npm test
```

Commit **chỉ tài liệu**, tuyệt đối không kèm file trong `tai-lieu-sgk/`:

```bash
git status --short          # kiểm tra lại lần cuối trước khi add
git add docs/ && git commit  # KHÔNG dùng `git add -A` ở bước này
```

---

## 3. Việc KHÔNG làm ở phiên đối chiếu này

Giữ phạm vi hẹp, tránh trộn nhiều loại việc vào một PR (kỷ luật đã theo suốt GĐ1):

- ❌ Không viết code app Toán (đó là PR-2 trở đi).
- ❌ Không soạn nội dung bài giảng đầy đủ (đó là PR-1, sau khi chốt xong chủ đề).
- ❌ Không sửa `packages/core-grading` trừ khi đối chiếu phát hiện engine thiếu dạng bài thật sự
  cần — nếu có, **ghi lại thành mục riêng**, không sửa lẫn vào commit tài liệu.

---

## 4. Đầu ra mong đợi của phiên local

1. `docs/research/muc-luc-sgk/toan-6..9.md` — mục lục thật, có cột "chấm tự động được".
2. 4 file `kho-kien-thuc-*.md` đã đối chiếu, mỗi file có **Nhật ký đối chiếu** ghi rõ đã sửa gì.
3. `dac-ta-gd2-mon-toan-2026-08-01.md` §2.1a — 12 chủ đề đợt 2a **chốt theo SGK thật**, không còn
   là phỏng đoán.
4. Danh sách điểm cần **giáo viên có chuyên môn** duyệt lần cuối (những chỗ SGK và kiến thức phổ
   quát không khớp nhau, AI không tự phân xử được).

Xong 4 mục trên là đủ điều kiện mở **PR-1** (soạn 1 bài học mẫu để duyệt định dạng).
