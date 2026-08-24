# Đặc tả bổ sung — DỰ ÁN XUYÊN SUỐT môn Lập trình (2026-08-24)

> Bổ sung cho `dac-ta-mon-lap-trinh-2026-08-24.md` theo yêu cầu người dùng cùng ngày:
> _"nghiên cứu tạo dự án hoàn chỉnh và dạy trên đó, để khi hoàn thành là hoàn thành luôn dự án."_
>
> Tinh thần: giáo trình không kết thúc bằng chứng chỉ, mà kết thúc bằng **một sản phẩm THẬT
> đang chạy trên Internet, do chính học viên xây từ dòng code đầu tiên** — vừa là bằng chứng
> năng lực (portfolio xin việc), vừa là công cụ dùng được cho chính họ.
>
> Trạng thái: **ĐẶC TẢ — chưa code.** Đọc kèm đặc tả gốc; tài liệu này chỉ ĐIỀU CHỈNH cách tổ
> chức nội dung (mục 4 gốc) và bổ sung cơ chế "workspace dự án", KHÔNG đổi thang P1–P6, khuôn
> bài 8 bước, bộ ngôn ngữ hay phương án sandbox đã chốt.

## 1. Nghiên cứu mô hình — vì sao "một dự án xuyên suốt" và giới hạn của nó

### 1.1 Căn cứ (mô hình đã kiểm chứng, không tự bịa)

- **Project-based learning (PBL):** hiệu quả cao về động lực và khả năng chuyển giao kỹ năng
  sang việc thật — nhưng nghiên cứu CS education cũng chỉ rõ điểm yếu: người mới học bằng dự
  án THUẦN TUÝ dễ quá tải nhận thức và hổng khái niệm nền. Kết luận ngành: **kết hợp** — bài
  luyện có cấu trúc (worked example/Parsons/bài nhỏ) để nạp khái niệm, dự án để lắp ráp.
- **Spiral curriculum (Bruner):** cùng MỘT sản phẩm được quay lại nhiều vòng, mỗi vòng nâng
  độ phức tạp — đúng bản chất nghề phần mềm thật (không ai viết app một lần là xong; refactor
  chính là bài học).
- **Tiền lệ đã chạy đại trà:** CS50 (bài tập dẫn tới final project bắt buộc), The Odin
  Project (chuỗi capstone nối nhau tới full-stack deploy thật), sách "Automate the Boring
  Stuff" (mỗi chương một công cụ dùng được ngay). Mô hình "một app tiến hoá qua toàn khoá"
  chính là cách nhiều bootcamp thu phí cao đang bán — DHCB làm bản tiếng Việt, giá rẻ.

### 1.2 Kết luận thiết kế — mô hình "2 làn"

Mỗi unit của giáo trình gốc giữ nguyên khuôn 8 bước, nhưng bước cuối tách thành 2 làn:

- **Làn LUYỆN (giữ nguyên):** bài Predict/Parsons/Make nhỏ chấm test-case — nạp khái niệm,
  không sợ sai, không ảnh hưởng dự án.
- **Làn DỰ ÁN (mới, thay cho "dự án mini" rời rạc):** mỗi unit kết thúc bằng **một bước xây
  tiếp DỰ ÁN TRỤC** — cùng một sản phẩm lớn dần từ P1 đến P5. "Dự án mini" trong đặc tả gốc
  không bỏ đi mà được **sắp lại thành các chặng của chính dự án trục** (mục 3).

Tỷ lệ thời lượng đề xuất: P1 ~70% luyện / 30% dự án (người mới cần nền) → P5 đảo lại ~30% /
70% (kỹ năng lắp ráp là thứ cần luyện nhất ở cuối). Đây là đường dốc chuẩn của PBL có đỡ.

## 2. Chọn DỰ ÁN TRỤC — tiêu chí và phương án

### 2.1 Tiêu chí (rút từ mục 1)

1. **Thật sự dùng được** cho chính học viên hoặc gia đình họ khi hoàn thành (không phải đồ chơi).
2. **Trải đủ P1→P5 tự nhiên:** có phiên bản CLI đơn giản (P1–P2), lên web (P3), có backend +
   CSDL + test (P4), deploy chạy thật (P5) — không chặng nào gượng ép.
3. **Bối cảnh Việt Nam,** dữ liệu quen thuộc, giải thích được cho người thân ("con làm cái này").
4. **Phạm vi khống chế được:** lõi nghiệp vụ ~5–7 thực thể dữ liệu, không cần realtime/thanh
   toán thật ở bản học.
5. **Cá nhân hoá được** (đổi tên, đổi dữ liệu, thêm tính năng riêng) → mỗi học viên ra một
   sản phẩm KHÔNG giống hệt nhau — chống chép bài và tăng sở hữu (ownership, đúng SDT).

### 2.2 Ba phương án dự án trục (học viên CHỌN 1 lúc vào môn — cùng khung chặng, khác chủ đề)

| Mã     | Dự án                                                                                     | Cho ai hợp                                        | Lõi dữ liệu                                        |
| ------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------- |
| **T1** | **"Cửa hàng của tôi"** — quản lý bán hàng nhỏ (menu, đơn, kho, doanh thu, trang đặt hàng) | Mặc định; gia đình buôn bán nhỏ rất phổ biến ở VN | món hàng · đơn · khách · phiếu nhập · báo cáo      |
| T2     | "Quỹ lớp / Chi tiêu nhà mình" — thu chi, thành viên, báo cáo, trang minh bạch quỹ         | Học sinh, người quản lý quỹ nhóm                  | khoản thu/chi · thành viên · hạng mục · kỳ báo cáo |
| T3     | "Sổ học tập của tôi" — quản lý môn học, deadline, điểm, thẻ ôn, trang chia sẻ tài liệu    | Học sinh–sinh viên                                | môn · nhiệm vụ · điểm · thẻ ôn · tài liệu          |

Ba phương án **đồng hình về kỹ thuật** (đều là CRUD + báo cáo + trang public), nên nội dung
hướng dẫn viết MỘT lần theo T1, T2/T3 chỉ đổi lớp dữ liệu/đề bài — chi phí soạn thêm thấp.
MVP có thể chỉ ship T1, mở T2/T3 sau khi khuôn chạy ổn.

## 3. Bản đồ tiến hoá dự án trục theo P1→P5 (ví dụ theo T1 "Cửa hàng của tôi")

Mỗi chặng ánh xạ đúng unit của đặc tả gốc — cột "Unit gốc" chỉ chỗ kiến thức được nạp trước
khi dùng vào dự án. Nguyên tắc: **không bước dự án nào dùng kiến thức chưa dạy.**

### Chặng P1 — "Máy tính tiền" (console, chạy trong sandbox trình duyệt)

| Bước | Xây gì                                                               | Unit gốc (P1) |
| ---- | -------------------------------------------------------------------- | ------------- |
| 1    | In menu quán cố định, chào theo tên chủ quán (cá nhân hoá đầu tiên)  | U1–U2         |
| 2    | Nhập món + số lượng → tính tiền, tiền thừa                           | U3            |
| 3    | Giảm giá theo hoá đơn (if bậc thang — tái dùng tư duy tiền điện EVN) | U4            |
| 4    | Vòng lặp bán nhiều đơn liên tiếp, tổng doanh thu phiên               | U5–U7         |
| 5    | **Milestone P1:** máy bán hàng console hoàn chỉnh (thay dự án U10)   | U8–U10        |

### Chặng P2 — "Sổ sách tử tế" (hàm, dữ liệu, file)

Tách thành hàm (`tinh_tien`, `in_hoa_don`) · menu là list/dict sửa được (thêm/bớt món) ·
lưu đơn ra CSV, đọc lại lịch sử, báo cáo doanh thu theo ngày · chống nhập bậy (try/except) ·
chia 3 file giao diện/logic/lưu trữ. **Milestone P2:** phần mềm quản lý bán hàng console dùng
được thật, dữ liệu bền qua file (thay dự án U10 gốc "quán cà phê" — chính là nó).

### Chặng P3 — "Lên web" (HTML/CSS/JS + SQL + Git)

Trang giới thiệu cửa hàng (HTML/CSS, mobile-first) · trang đặt hàng chạy JS trong trình
duyệt, giỏ hàng localStorage · chuyển kho dữ liệu CSV → SQLite (sql.js), viết các truy vấn
báo cáo (JOIN/GROUP BY trên chính dữ liệu bán hàng của mình) · đưa toàn bộ lên GitHub, README
tử tế. **Milestone P3:** web tĩnh của cửa hàng chạy được + kho dữ liệu SQL + repo GitHub công
khai (thay dự án U12 gốc).

### Chặng P4 — "Có xương sống" (OOP, API, test, TypeScript)

Mô hình hoá lại bằng class (Order/Menu/Inventory/Report) — bài refactor THẬT trên code cũ của
chính mình (giá trị sư phạm lớn nhất chặng này) · backend API CRUD (FastAPI mức khái niệm) ·
frontend fetch API thay localStorage · viết test cho logic tiền/kho (ca biên giảm giá, âm
kho) · port phần JS sang TypeScript, để type bắt lỗi thật. **Milestone P4:** full-stack mini
chạy local, có test, Git history sạch (thay dự án U12 gốc).

### Chặng P5 — "Ra Internet" (capstone = CHÍNH dự án này)

Thiết kế lại schema tử tế (chuẩn hoá, index, transaction cho đơn hàng) · đăng nhập chủ quán
(hash mật khẩu, session — nhập môn OWASP trên chính app của mình) · deploy free-tier + biến
môi trường + HTTPS · đo và sửa 1 điểm chậm (big-O nhìn thấy được: báo cáo trên 10.000 đơn) ·
viết trang "Về dự án" kể lại hành trình. **Milestone P5 = HOÀN THÀNH MÔN:** sản phẩm chạy
thật trên Internet, repo GitHub đầy đủ lịch sử từ P1 — đúng nghĩa "hoàn thành là hoàn thành
luôn dự án". (Ba đề capstone rời trong đặc tả gốc P5 trở thành **tuỳ chọn làm THÊM** cho ai
muốn sản phẩm thứ hai.)

## 4. Cơ chế kỹ thuật — "workspace dự án" (bổ sung vào khuôn 5 mảnh)

Đây là phần kỹ thuật MỚI so với đặc tả gốc (sandbox chạy từng bài đã có; nay cần **trạng thái
code bền theo học viên** xuyên bài học):

1. **Workspace dự án per-user:** cây file ảo (nhiều file .py/.html/.js/.sql + file dữ liệu)
   lưu Postgres `programming.project_files` (user_id, path, content, updated_at), cache
   localStorage để mở tức thì; sandbox Pyodide/iframe mount cây file này thay vì 1 ô code.
   Dung lượng khống chế: quota ~2MB text/học viên (đủ rất xa cho dự án học).
2. **Bước dự án = bài có "điểm neo":** mỗi bước cho trước diff-mục-tiêu dạng đặc tả (làm gì,
   file nào, tiêu chí) + bộ **milestone check** chạy trên workspace (test-case gọi hàm của học
   viên / kiểm tra output / kiểm tra file tồn tại). Qua check → mở bước sau. Không chấm
   "giống code mẫu" — chấm HÀNH VI, để mỗi người tự do cá nhân hoá.
3. **Kẹt thì có phao, không có "làm hộ":** mỗi bước kèm code mẫu tham chiếu (mở ra bị đánh
   dấu "đã xem mẫu" — chỉ để Companion biết mà kèm sát hơn, KHÔNG trừ điểm, đúng tư thế đồng
   hành); nút "Companion xem giúp" đi qua mode `code_feedback` đếm lượt như đặc tả gốc.
4. **Snapshot theo milestone:** hoàn thành mỗi chặng → snapshot toàn workspace (bảng
   `programming.project_snapshots`) — học viên xem lại "cửa hàng của mình hồi P1" (động lực
   nhìn thấy tiến bộ), và là điểm khôi phục nếu vọc hỏng.
5. **Xuất ra ngoài từ P3:** nút "Tải dự án (.zip)" + hướng dẫn push GitHub trong bài Git —
   từ P3 trở đi **repo GitHub của học viên là bản chính**, workspace trong app đồng bộ chiều
   xuất; DHCB không tự ý ghi lên GitHub học viên (chỉ hướng dẫn, học viên tự thao tác — không
   đụng OAuth scope ghi).
6. **P5 deploy:** hướng dẫn từng bước lên nền tảng free-tier (chạy ngoài DHCB — đúng nguyên
   tắc 0đ hạ tầng cho mình); milestone check cuối = học viên dán URL sản phẩm + app kiểm tra
   URL sống (fetch HEAD từ server, có rate-limit).

Điểm cần kiểm chứng khi code (ghi để không "ảo giác"): hiệu năng mount nhiều file vào
Pyodide FS; giới hạn iframe sandbox khi dự án web nhiều file (dựng blob URL/`srcdoc` từ cây
file); milestone check cho HTML/CSS (dùng kiểm DOM qua iframe + vài luật, không chấm pixel).

## 5. Điều chỉnh đặc tả gốc (delta — phần còn lại giữ nguyên)

1. **Mục 4 gốc (đề cương):** cột "dự án mini" của các unit được thay bằng "bước dự án trục"
   theo bản đồ mục 3 ở trên; bài luyện nhỏ trong unit giữ nguyên.
2. **Mục 6.1 gốc (5 mảnh):** schema `programming.*` thêm 2 bảng `project_files`,
   `project_snapshots` + cột chọn phương án dự án (T1/T2/T3) trong tiến độ.
3. **Mục 7 gốc (phân đợt PR):** chèn **PR-L3b — Workspace dự án + engine milestone check +
   chặng P1 của T1** (sau PR-L3, trước PR-L4); PR-L4 (nội dung P1) soạn bài theo mô hình 2
   làn ngay từ đầu — tránh soạn xong lại sửa.
4. **DoD MVP (mục 8 gốc) thêm:** học xong P1 phải có "máy tính tiền" chạy được trong
   workspace của chính mình + snapshot milestone P1.

## 6. Rủi ro riêng của mô hình dự án xuyên suốt

1. **Học viên bỏ ngang giữa chặng → dự án dở dang gây nản:** mỗi chặng kết thúc ở trạng thái
   DÙNG ĐƯỢC (P1 đã là máy tính tiền chạy được), không có trạng thái "đập ra chưa lắp lại"
   kéo dài quá 1 unit; bài refactor P4 thiết kế theo từng lát nhỏ chạy được.
2. **Workspace hỏng do vọc:** snapshot milestone + nút "khôi phục về milestone gần nhất".
3. **Lệch nhịp 2 làn** (lười luyện, chỉ muốn làm dự án): bước dự án khoá bằng hoàn thành các
   bài luyện then chốt của unit (không khoá 100% bài — tránh lê thê).
4. **Chép code mẫu tràn lan:** chấm hành vi + Predict xen kẽ về chính code nộp (cơ chế đặc tả
   gốc 6.3) + cá nhân hoá dữ liệu khiến mẫu không dán nguyên được.
5. **Ba phương án T1–T3 phình phạm vi soạn:** MVP chỉ T1; T2/T3 chỉ mở khi T1 đo được tỷ lệ
   hoàn thành chặng P1 > ngưỡng đặt sau.

## 7. Việc tiếp theo ngay

1. Người dùng duyệt: mô hình 2 làn (mục 1.2) · dự án trục T1 làm mặc định, T2/T3 để sau
   (mục 2.2) · cơ chế workspace + milestone check (mục 4) · delta phân đợt PR (mục 5).
2. Nếu duyệt → thứ tự làm không đổi: PR-L1 (khung môn) trước; đặc tả này ảnh hưởng từ PR-L3b
   trở đi. Nếu muốn thấy trước: soạn kịch bản chữ hoàn chỉnh CHẶNG P1 (5 bước × khuôn bài)
   để duyệt trải nghiệm trước khi code.
