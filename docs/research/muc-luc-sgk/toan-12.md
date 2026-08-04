# Mục lục Toán 12 — Kết nối tri thức (đối chiếu ngày 2026-08-03)

> Nguồn: ảnh scan trong `tai-lieu-sgk/SGK-Toan/12-1/` (tập một), `12-2/` (tập hai), `12-3/`
> (**Chuyên đề học tập Toán 12**) — không commit. Mục lục ở `page_0005.png` (tập một),
> `page_0003.png` (tập hai), `page_0005.png` (chuyên đề); OCR 2 cột bằng `scripts/ocr-crop.py`.
> Chỉ lấy **cấu trúc chương/bài** — ranh giới bản quyền §0.1 của `huong-dan-doi-chieu-sgk.md`.

## ⚠️ Hai loại sách KHÁC NHAU

| Thư mục         | Loại sách                      | Bắt buộc?                                                |
| --------------- | ------------------------------ | -------------------------------------------------------- |
| `12-1` + `12-2` | **SGK chính** (Toán 12, 2 tập) | ✅ Bắt buộc với **mọi** học sinh                         |
| `12-3`          | **Chuyên đề học tập Toán 12**  | ❌ **Tự chọn** theo định hướng nghề nghiệp (35 tiết/năm) |

Bìa `12-3/page_0001.png` ghi rõ "Chuyên đề học tập Toán 12" — cùng loại với `10-3`, `11-3`.

---

## A. SGK CHÍNH — Toán 12 (bắt buộc)

**Tổng quan: 6 chương · 19 bài** (tập một chương I–III / Bài 1–10 · tập hai chương IV–VI / Bài 11–19).
Đây là lớp có **ít bài nhất** cấp THPT (10 → 27 bài, 11 → 33 bài, 12 → 19 bài).

| #   | Chương                                                                 | Bài                                                                         | Mạch | Công thức/khái niệm chính                                                                     | Chấm tự động được? |
| --- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------- | ------------------ |
| 1   | I. Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số                    | Bài 1. Tính đơn điệu và cực trị của hàm số                                  | SO   | dấu `f'(x)` → đồng biến/nghịch biến · điều kiện cực trị                                       | ✅                 |
| 2   | I                                                                      | Bài 2. Giá trị lớn nhất và giá trị nhỏ nhất của hàm số                      | SO   | GTLN–GTNN trên đoạn/khoảng                                                                    | ✅                 |
| 3   | I                                                                      | Bài 3. Đường tiệm cận của đồ thị hàm số                                     | SO   | tiệm cận **ngang, đứng, xiên**                                                                | ✅                 |
| 4   | I                                                                      | Bài 4. Khảo sát sự biến thiên và vẽ đồ thị của hàm số                       | SO   | sơ đồ khảo sát · hàm bậc ba, hàm phân thức `(ax+b)/(cx+d)` và `(ax²+bx+c)/(px+q)`             | 🟡 (vẽ đồ thị ❌)  |
| 5   | I                                                                      | Bài 5. Ứng dụng đạo hàm để giải quyết một số vấn đề liên quan đến thực tiễn | SO   | bài toán tối ưu thực tế                                                                       | ✅                 |
| 6   | II. Vectơ và hệ trục toạ độ trong không gian                           | Bài 6. Vectơ trong không gian                                               | HINH | phép toán vectơ trong không gian · **tích vô hướng**                                          | ✅                 |
| 7   | II                                                                     | Bài 7. Hệ trục toạ độ trong không gian                                      | HINH | hệ `Oxyz` · toạ độ điểm, toạ độ vectơ                                                         | ✅                 |
| 8   | II                                                                     | Bài 8. Biểu thức toạ độ của các phép toán vectơ                             | HINH | toạ độ tổng/hiệu/tích · **`a⃗·b⃗ = a₁b₁ + a₂b₂ + a₃b₃`** · độ dài, góc, khoảng cách           | ✅                 |
| 9   | III. Các số đặc trưng đo mức độ phân tán của mẫu số liệu **ghép nhóm** | Bài 9. Khoảng biến thiên và khoảng tứ phân vị                               | TK   | `R = max − min` · **`Δ_Q = Q₃ − Q₁`** cho mẫu ghép nhóm                                       | ✅                 |
| 10  | III                                                                    | Bài 10. Phương sai và độ lệch chuẩn                                         | TK   | **`s²`**, **`s`** của mẫu **ghép nhóm**                                                       | ✅                 |
| 11  | IV. Nguyên hàm và tích phân                                            | Bài 11. Nguyên hàm                                                          | SO   | **`∫xⁿdx = xⁿ⁺¹/(n+1) + C`** (n ≠ −1) · bảng nguyên hàm cơ bản                                | ✅                 |
| 12  | IV                                                                     | Bài 12. Tích phân                                                           | SO   | **`∫ₐᵇ f(x)dx = F(b) − F(a)`** (Newton–Leibniz) · tính chất tích phân                         | ✅                 |
| 13  | IV                                                                     | Bài 13. Ứng dụng hình học của tích phân                                     | SO   | **diện tích hình phẳng** · **thể tích khối tròn xoay `V = π∫ₐᵇ f²(x)dx`** (đã xác minh)       | ✅                 |
| 14  | V. Phương pháp toạ độ trong không gian                                 | Bài 14. Phương trình mặt phẳng                                              | HINH | **`Ax + By + Cz + D = 0`** · vectơ pháp tuyến · **tích có hướng** (đã xác minh) · `d(M, (P))` | ✅                 |
| 15  | V                                                                      | Bài 15. Phương trình đường thẳng trong không gian                           | HINH | PT tham số, PT chính tắc · vị trí tương đối                                                   | ✅                 |
| 16  | V                                                                      | Bài 16. Công thức tính góc trong không gian                                 | HINH | góc giữa hai đường thẳng, đường thẳng–mặt phẳng, hai mặt phẳng (theo toạ độ)                  | ✅                 |
| 17  | V                                                                      | Bài 17. Phương trình mặt cầu                                                | HINH | **`(x−a)² + (y−b)² + (z−c)² = R²`**                                                           | ✅                 |
| 18  | VI. Xác suất có điều kiện                                              | Bài 18. Xác suất có điều kiện                                               | TK   | **`P(A\|B) = P(A∩B)/P(B)`** · sơ đồ hình cây                                                  | ✅                 |
| 19  | VI                                                                     | Bài 19. Công thức xác suất toàn phần và công thức Bayes                     | TK   | **`P(A) = P(B)P(A\|B) + P(B̄)P(A\|B̄)`** · **công thức Bayes**                                  | ✅                 |

Ngoài ra: "Bài tập cuối chương" mỗi chương · **Hoạt động thực hành trải nghiệm** (tập một: khảo sát
và vẽ đồ thị bằng GeoGebra; vẽ vectơ tổng bằng GeoGebra; độ dài gang tay · tập hai: tính nguyên
hàm/tích phân bằng GeoGebra; tính gần đúng tích phân bằng phương pháp hình thang; vẽ đồ hoạ 3D bằng
GeoGebra) · Bài tập ôn tập cuối năm — ❌, loại khỏi MVP.

## B. CHUYÊN ĐỀ HỌC TẬP Toán 12 (TỰ CHỌN)

**3 chuyên đề · 7 bài.**

| #   | Chuyên đề                                                                   | Bài                                                                                                    | Mạch | Nội dung chính                                               | Chấm tự động được? |
| --- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---- | ------------------------------------------------------------ | ------------------ |
| 1   | CĐ 1. Biến ngẫu nhiên rời rạc. Các số đặc trưng của biến ngẫu nhiên rời rạc | Bài 1. Biến ngẫu nhiên rời rạc và các số đặc trưng                                                     | TK   | bảng phân bố · **kì vọng `E(X)`**, phương sai, độ lệch chuẩn | ✅                 |
| 2   | CĐ 1                                                                        | Bài 2. Biến ngẫu nhiên có phân bố nhị thức và áp dụng                                                  | TK   | **phân bố nhị thức `B(n, p)`**                               | ✅                 |
| 3   | CĐ 2. Ứng dụng toán học để giải quyết một số bài toán tối ưu                | Bài 3. Vận dụng hệ bất phương trình bậc nhất hai ẩn để giải quyết một số bài toán quy hoạch tuyến tính | SO   | **quy hoạch tuyến tính**                                     | ✅                 |
| 4   | CĐ 2                                                                        | Bài 4. Vận dụng đạo hàm để giải quyết một số bài toán tối ưu                                           | SO   | tối ưu bằng đạo hàm                                          | ✅                 |
| 5   | CĐ 3. Ứng dụng toán học trong một số vấn đề liên quan đến tài chính         | Bài 5. Tiền tệ. Lãi suất                                                                               | SO   | **lãi đơn, lãi kép `A = P(1+r)ⁿ`**                           | ✅                 |
| 6   | CĐ 3                                                                        | Bài 6. Tín dụng. Vay nợ                                                                                | SO   | trả góp, dư nợ                                               | ✅                 |
| 7   | CĐ 3                                                                        | Bài 7. Đầu tư tài chính. Lập kế hoạch tài chính cá nhân                                                | SO   | giá trị hiện tại/tương lai của dòng tiền                     | 🟡                 |

## Ghi chú đối chiếu

1. 🔴 **SỐ PHỨC ĐÃ BỎ HOÀN TOÀN.** Đã OCR **toàn bộ** ba tập (`12-1` 52 ảnh, `12-2` 37 ảnh, `12-3`
   37 ảnh) tìm chuỗi "số phức" — **0 kết quả**. Số phức không còn nằm trong chương trình Toán THPT
   2018 ở bất kì lớp nào. Đây là thay đổi lớn nhất so với chương trình cũ.
2. ✅ **Tích phân VẪN CÒN** (chương IV, Bài 11–13) — cả nguyên hàm, tích phân, ứng dụng diện tích
   và thể tích khối tròn xoay (đã xác minh bằng OCR nội dung Bài 13).
3. ✅ **Khảo sát và vẽ đồ thị hàm số VẪN CÒN** (chương I, Bài 4). Phạm vi hàm: **bậc ba** và **hai
   dạng phân thức**; đã bỏ hàm trùng phương `y = ax⁴ + bx² + c` khỏi phần khảo sát so với chương
   trình cũ — 🟡 **CẦN GIÁO VIÊN XÁC NHẬN** (kết luận này rút từ mục lục + đề mục Bài 4, chưa đọc
   toàn bộ bài tập cuối chương).
4. ✅ **Tích có hướng của hai vectơ CÓ dạy** — xác minh bằng OCR nội dung chương V (dùng để tìm
   vectơ pháp tuyến của mặt phẳng). Không có bài riêng, nằm lồng trong Bài 14.
5. 🔴 **Mũ – lôgarit KHÔNG ở lớp 12** mà ở **lớp 11** (Toán 11 chương VI). Toán 12 không có chương
   nào về mũ/lôgarit.
6. **Vectơ được dạy ở CẢ lớp 10 (mặt phẳng) và lớp 12 (không gian)**, không phải lớp 11.
7. **Xác suất có điều kiện + công thức Bayes ở lớp 12** (chương VI) — nội dung **mới hoàn toàn** so
   với chương trình cũ.
8. Bài 4 (Khảo sát & vẽ đồ thị) gắn 🟡: phần lập bảng biến thiên/tìm tiệm cận chấm được, phần **vẽ
   đồ thị** thì ❌ — tách hai loại câu hỏi khi dựng `ProblemTemplate`.
