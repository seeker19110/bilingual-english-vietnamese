# 0269 — 2026-09-05 — Sửa 3 lỗi của bộ chạy bash/Kotlin do đợt coverage phát hiện

## Việc đã làm

Đợt coverage hôm trước (`0268`) không sửa mã nguồn, chỉ ghi lại ba nghi bug lộ ra trong lúc viết
test. Đợt này sửa cả ba, mỗi lỗi có test canh riêng để không hồi quy.

### 1. `bashSim.ts` — `find /` bỏ sót TOÀN BỘ nội dung (nặng hơn chẩn đoán ban đầu)

Chẩn đoán ghi ở `0268` là "cắt lệch 1 ký tự, `/home` ra `ome`". **Viết test xong mới thấy chẩn
đoán đó chưa đúng hẳn** — và đây là lý do phải chạy thử thay vì tin lời giải thích: cùng dòng
đó còn một lỗi đứng TRƯỚC và nặng hơn.

Bộ lọc `k.startsWith(`${pGoc}/`)` với `pGoc === '/'` ghép ra tiền tố `'//'`, không khoá nào
khớp. Hệ quả: `find /` **im lặng** trả về đúng một dòng `/` thay vì cả cây thư mục — mất dữ
liệu, không phải sai định dạng. Lỗi cắt ký tự có thật, nhưng nằm sau bộ lọc nên chưa bao giờ
kịp lộ ra.

Sửa: tính một lần `const tienTo = pGoc === '/' ? '/' : `${pGoc}/`` rồi dùng cho cả bước lọc lẫn
bước cắt — một biến chữa cả hai lỗi, thay vì vá riêng từng chỗ. Đo lại: `find /` nay in đủ
`/` · `/home` · `/home/ban` · `/tmp` · `/tmp/kho` · `/tmp/kho/a.txt`.

### 2. `kotlinSim` — `associateWith` không khử trùng khoá

`listOf(1, 1, 2).associateWith { it * 2 }` cho ra `{1=2, 1=2, 2=4}`: một `Map` có hai cặp cùng
khoá `1` — cấu trúc mà Kotlin thật không bao giờ dựng được. `mapOf` và `groupBy` đều đã khử
trùng từ đầu, riêng đường này bị bỏ sót.

Sửa: gộp theo khoá, **giá trị lần cuối thắng** (đúng ngữ nghĩa `associateWith` của Kotlin).

### 3. `kotlinSim` — `println` bỏ qua `override fun toString()`

`println(x)` gọi thẳng `inGia()` nên luôn in dạng tự sinh, trong khi `x.toString()` tường minh
lại tôn trọng bản `override` của học viên. Cùng một đối tượng cho hai kết quả khác nhau tuỳ
cách in — và cách sai lại là cách người mới dùng nhiều nhất. Không mục nào trong `KHAC_BIET`
nói tới điểm này, nên đây là lỗi chứ không phải khác biệt cố ý.

Sửa: thêm `chuoiHoa()` — chuỗi hoá để in, tôn trọng `toString()` tự viết, **đi đệ quy qua
List/Map/Pair** vì Kotlin thật cũng gọi `toString()` cho phần tử bên trong. Dùng cho cả
`println`/`print` lẫn nội suy chuỗi `"$x"` (hai chỗ này phải khớp nhau).

## Bằng chứng kiểm chứng

Build ✅ · Type ✅ · Lint ✅ (0 cảnh báo) · Format ✅ · Test ✅ toàn bộ · Coverage ✅ đạt sàn
96/93/95/96 vừa siết ở `0268`.

Test canh mới: 3 ca cho `find /` (liệt kê đủ cây · không mất chữ cái đầu · thư mục con không hồi
quy), 3 ca cho `associateWith` (gộp trùng · lần cuối thắng · không khử nhầm), 6 ca cho
`toString` (println khớp `.toString()` · nội suy · phần tử trong List/Map/Pair · data class
không override giữ nguyên · `print`).

## Bài học rút ra

**Nghi bug do đọc mã mà ra thì phải chạy thử trước khi tin.** Lỗi 1 được mô tả sai ở `0268` vì
người phát hiện suy từ công thức `slice()` chứ không chạy `find /` một lần. Chạy thử mất mười
giây và cho thấy triệu chứng thật khác hẳn — nặng hơn, và ở một dòng khác.
