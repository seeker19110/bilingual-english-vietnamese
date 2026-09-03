// kotlinSim/conformance — BỘ CA ĐỐI CHIẾU của bộ chạy Kotlin (PR-M7, hiến chương M §3.4).
//
// VÌ SAO BẮT BUỘC CÓ FILE NÀY: "một interpreter sai âm thầm còn tệ hơn không có interpreter —
// nó dạy sai cú pháp cho người mới, và người mới không có cách nào biết" (§3.4). Mỗi tính năng
// cú pháp mà bộ chạy hứa phải có ÍT NHẤT MỘT ca ở đây, kèm kết quả kỳ vọng và NGUỒN của kết
// quả đó.
//
// ─────────────────────── TRẠNG THÁI XÁC MINH — ĐỌC KỸ ───────────────────────
//
// Hiến chương §3.4 đòi: "Ca đối chiếu phải được chạy tay MỘT LẦN trên trình biên dịch thật và
// ghi lại kết quả vào đặc tả bộ chạy — không suy đoán từ trí nhớ."
//
// ✅ ĐÃ ĐỐI CHIẾU THẬT — 2026-09-03. Cổng §3.4 nay MỞ.
//
// Toàn bộ 48/48 ca đã chạy trên `kotlinc 2.0.21` thật (JRE 21.0.10, Ubuntu) và khớp từng dòng
// với cả kết quả kỳ vọng lẫn bộ chạy DHCB, nên mọi ca mang `daDoiChieu: true`. Môi trường soạn
// PR-M7 trước đây không tải được Kotlin; lần này tải được bản chính thức từ GitHub releases và
// chạy bằng `npm run kotlin:conformance`.
//
// Hệ quả: PR-M8/M9 (nội dung Kotlin) nay ĐƯỢC PHÉP bắt đầu. `conformance.test.ts` vẫn canh
// ràng buộc — thêm ca mới mà để `daDoiChieu: false` thì cổng đóng lại ngay khi có bài Kotlin.
//
// Mỗi ca vẫn giữ trường `nguon` ghi căn cứ của kết quả kỳ vọng (mục nào của tài liệu Kotlin) —
// đối chiếu thật KHÔNG thay thế việc phải nêu nguồn.
//
// Hai bẫy đã sập khi chạy thật lần đầu, đã sửa trong `scripts/kotlin-conformance.ts` (đọc chú
// thích ở đó trước khi sửa script): (1) `kotlin <file>.kt` KHÔNG chạy được file nguồn ở Kotlin
// 2.x — phải `kotlinc` rồi `java -jar`; (2) mỗi ca phải nằm trong `package` riêng, vì hai ca
// cùng khai `data class Diem` là trùng tên ở mức file.

export interface CaDoiChieu {
  ma: string
  /** Tính năng cú pháp mà ca này canh — mỗi tính năng phải có ít nhất một ca. */
  tinhNang: string
  code: string
  /** Output kỳ vọng, ĐÚNG từng ký tự (đã bỏ dòng tự khai của bộ chạy). */
  ky: string
  /** Căn cứ của kết quả kỳ vọng. */
  nguon: string
  /** Đã chạy trên trình biên dịch Kotlin thật chưa — xem ghi chú đầu file. */
  daDoiChieu: boolean
}

/** Nguồn dùng nhiều lần — KDOC = tài liệu chính thức kotlinlang.org/docs. */
const KDOC = (muc: string): string => `kotlinlang.org/docs — ${muc}`

export const CA_DOI_CHIEU: CaDoiChieu[] = [
  // ───────────────────────── Cơ bản ─────────────────────────
  {
    ma: 'K01',
    tinhNang: 'val/var, suy kiểu, in ra',
    code: `val ten = "Lan"
var tuoi = 20
tuoi = tuoi + 1
println(ten)
println(tuoi)`,
    ky: 'Lan\n21\n',
    nguon: KDOC('Basic syntax — Variables'),
    daDoiChieu: true,
  },
  {
    ma: 'K02',
    tinhNang: 'Chia hai Int là chia nguyên; lấy phần dư',
    code: `println(7 / 2)
println(7 % 2)
println(-7 / 2)`,
    ky: '3\n1\n-3\n',
    nguon: KDOC('Numbers — Division of integers (làm tròn về 0)'),
    daDoiChieu: true,
  },
  {
    ma: 'K03',
    tinhNang: 'Double in kèm .0; phép chia có Double cho ra Double',
    code: `println(7.0 / 2)
println(3.0)
println(1.0 / 4)`,
    ky: '3.5\n3.0\n0.25\n',
    nguon: KDOC('Numbers — Floating-point types'),
    daDoiChieu: true,
  },
  {
    ma: 'K04',
    tinhNang: 'Nội suy chuỗi $ten và ${biểu thức}',
    code: `val ten = "Lan"
val n = 3
println("$ten co \${n * 2} quyen vo")`,
    ky: 'Lan co 6 quyen vo\n',
    nguon: KDOC('Strings — String templates'),
    daDoiChieu: true,
  },
  {
    ma: 'K05',
    tinhNang: 'Chuỗi nhiều dòng bằng ba nháy',
    code: `val s = """dong mot
dong hai"""
println(s)`,
    ky: 'dong mot\ndong hai\n',
    nguon: KDOC('Strings — Multiline strings'),
    daDoiChieu: true,
  },
  {
    ma: 'K06',
    tinhNang: 'Nối chuỗi với số bằng dấu +',
    code: `println("so: " + 5)
println("dung: " + true)`,
    ky: 'so: 5\ndung: true\n',
    nguon: KDOC('Strings — String concatenation'),
    daDoiChieu: true,
  },

  // ───────────────────────── Null safety ─────────────────────────
  {
    ma: 'K10',
    tinhNang: 'In một biến nullable — Kotlin KHÔNG bọc như Optional của Swift',
    code: `val s: String? = "hi"
val t: String? = null
println(s)
println(t)`,
    ky: 'hi\nnull\n',
    nguon: KDOC('Null safety — Nullable types'),
    daDoiChieu: true,
  },
  {
    ma: 'K11',
    tinhNang: 'Gọi an toàn ?. trả về null khi đối tượng null',
    code: `val s: String? = null
val t: String? = "abc"
println(s?.length)
println(t?.length)`,
    ky: 'null\n3\n',
    nguon: KDOC('Null safety — Safe calls'),
    daDoiChieu: true,
  },
  {
    ma: 'K12',
    tinhNang: 'Toán tử Elvis ?: thay giá trị khi null',
    code: `val s: String? = null
println(s ?: "mac dinh")
val t: String? = "co"
println(t ?: "mac dinh")`,
    ky: 'mac dinh\nco\n',
    nguon: KDOC('Null safety — Elvis operator'),
    daDoiChieu: true,
  },
  {
    ma: 'K13',
    tinhNang: 'Smart cast sau khi kiểm x != null',
    code: `val s: String? = "xin chao"
if (s != null) {
    println(s.length)
}`,
    ky: '8\n',
    nguon: KDOC('Null safety — Checking for null in conditions'),
    daDoiChieu: true,
  },
  {
    ma: 'K14',
    tinhNang: 'toIntOrNull trả null khi chuỗi không phải số',
    code: `println("42".toIntOrNull())
println("abc".toIntOrNull())
println("7".toInt() + 1)`,
    ky: '42\nnull\n8\n',
    nguon: KDOC('Strings — String conversion / toIntOrNull'),
    daDoiChieu: true,
  },
  {
    ma: 'K15',
    tinhNang: 'Map trả null khi không có khoá',
    code: `val m = mapOf("a" to 1)
println(m["a"])
println(m["b"])`,
    ky: '1\nnull\n',
    nguon: KDOC('Maps — Retrieve a value by key returns null if absent'),
    daDoiChieu: true,
  },

  // ───────────────────────── Điều khiển ─────────────────────────
  {
    ma: 'K20',
    tinhNang: 'if dùng làm BIỂU THỨC (khác Swift)',
    code: `val a = 7
val lon = if (a > 5) "lon" else "nho"
println(lon)`,
    ky: 'lon\n',
    nguon: KDOC('Conditions and loops — If expression'),
    daDoiChieu: true,
  },
  {
    ma: 'K21',
    tinhNang: 'when có chủ đề, nhiều giá trị một nhánh, else',
    code: `val x = 3
when (x) {
    1, 2 -> println("nho")
    3 -> println("ba")
    else -> println("khac")
}`,
    ky: 'ba\n',
    nguon: KDOC('Conditions and loops — When expression'),
    daDoiChieu: true,
  },
  {
    ma: 'K22',
    tinhNang: 'when KHÔNG chủ đề, dùng như chuỗi điều kiện',
    code: `val d = 75
val h = when {
    d >= 90 -> "gioi"
    d >= 70 -> "kha"
    else -> "trung binh"
}
println(h)`,
    ky: 'kha\n',
    nguon: KDOC('Conditions and loops — When without subject'),
    daDoiChieu: true,
  },
  {
    ma: 'K23',
    tinhNang: 'when với in khoảng',
    code: `val n = 15
when (n) {
    in 1..9 -> println("mot chu so")
    in 10..99 -> println("hai chu so")
    else -> println("nhieu hon")
}`,
    ky: 'hai chu so\n',
    nguon: KDOC('Conditions and loops — When, in ranges'),
    daDoiChieu: true,
  },
  {
    ma: 'K24',
    tinhNang: 'Khoảng: .. đóng, until nửa mở, downTo lùi, step',
    code: `for (i in 1..3) print(i)
println()
for (i in 1 until 3) print(i)
println()
for (i in 3 downTo 1) print(i)
println()
for (i in 1..6 step 2) print(i)
println()`,
    ky: '123\n12\n321\n135\n',
    nguon: KDOC('Ranges and progressions'),
    daDoiChieu: true,
  },
  {
    ma: 'K25',
    tinhNang: 'while, do-while, break, continue',
    code: `var i = 0
while (i < 3) { print(i); i++ }
println()
var j = 5
do { print(j); j++ } while (j < 5)
println()
for (k in 1..5) { if (k == 2) continue; if (k == 4) break; print(k) }
println()`,
    ky: '012\n5\n13\n',
    nguon: KDOC('Conditions and loops — While loops, Returns and jumps'),
    daDoiChieu: true,
  },
  {
    ma: 'K26',
    tinhNang: 'for trên danh sách và trên chuỗi',
    code: `for (x in listOf("a", "b")) print(x)
println()
for (c in "abc") print(c)
println()`,
    ky: 'ab\nabc\n',
    nguon: KDOC('Conditions and loops — For loops'),
    daDoiChieu: true,
  },

  // ───────────────────────── Hàm ─────────────────────────
  {
    ma: 'K30',
    tinhNang: 'Hàm có kiểu trả về, hàm một biểu thức',
    code: `fun cong(a: Int, b: Int): Int {
    return a + b
}
fun doi(x: Int) = x * 2
println(cong(2, 3))
println(doi(5))`,
    ky: '5\n10\n',
    nguon: KDOC('Functions — Single-expression functions'),
    daDoiChieu: true,
  },
  {
    ma: 'K31',
    tinhNang: 'Tham số mặc định và tham số gọi theo tên',
    code: `fun chao(ten: String, loi: String = "Xin chao") = "$loi, $ten!"
println(chao("Lan"))
println(chao("Nam", "Hello"))
println(chao(loi = "Hi", ten = "Mai"))`,
    ky: 'Xin chao, Lan!\nHello, Nam!\nHi, Mai!\n',
    nguon: KDOC('Functions — Default arguments, Named arguments'),
    daDoiChieu: true,
  },
  {
    ma: 'K32',
    tinhNang: 'Hàm gọi được trước chỗ khai báo',
    code: `fun ngoai() = ben()
fun ben() = "duoc goi"
println(ngoai())`,
    ky: 'duoc goi\n',
    nguon: KDOC('Functions — top-level functions are visible in the whole file'),
    daDoiChieu: true,
  },

  // ───────────────────────── Lớp ─────────────────────────
  {
    ma: 'K40',
    tinhNang: 'Lớp có hàm dựng chính khai luôn thuộc tính',
    code: `class Nguoi(val ten: String, var tuoi: Int) {
    fun gioiThieu() = "$ten, $tuoi tuoi"
}
val p = Nguoi("Lan", 20)
p.tuoi = 21
println(p.gioiThieu())`,
    ky: 'Lan, 21 tuoi\n',
    nguon: KDOC('Classes — Constructors'),
    daDoiChieu: true,
  },
  {
    ma: 'K41',
    tinhNang: 'Khối init chạy khi tạo đối tượng',
    code: `class A(val x: Int) {
    val gap: Int
    init {
        gap = x * 2
    }
}
println(A(4).gap)`,
    ky: '8\n',
    nguon: KDOC('Classes — Initializer blocks'),
    daDoiChieu: true,
  },
  {
    ma: 'K42',
    tinhNang: 'Kế thừa cần open, ghi đè cần override',
    code: `open class Con(val ten: String) {
    open fun keu() = "..."
}
class Cho(ten: String) : Con(ten) {
    override fun keu() = "Gau"
}
val c: Con = Cho("Mun")
println(c.ten)
println(c.keu())`,
    ky: 'Mun\nGau\n',
    nguon: KDOC('Inheritance — Overriding methods'),
    daDoiChieu: true,
  },
  {
    ma: 'K43',
    tinhNang: 'data class: toString, ==, copy',
    code: `data class Diem(val x: Int, val y: Int)
val a = Diem(1, 2)
val b = Diem(1, 2)
println(a)
println(a == b)
println(a.copy(y = 9))`,
    ky: 'Diem(x=1, y=2)\ntrue\nDiem(x=1, y=9)\n',
    nguon: KDOC('Data classes'),
    daDoiChieu: true,
  },
  {
    ma: 'K44',
    tinhNang: 'Huỷ cấu trúc data class và Pair',
    code: `data class Diem(val x: Int, val y: Int)
val (a, b) = Diem(3, 4)
println("$a-$b")
val (m, n) = Pair("x", 7)
println("$m-$n")`,
    ky: '3-4\nx-7\n',
    nguon: KDOC('Destructuring declarations'),
    daDoiChieu: true,
  },
  {
    ma: 'K45',
    tinhNang: 'Lớp thường so bằng theo THAM CHIẾU (khác data class)',
    code: `class T(val v: Int)
println(T(1) == T(1))
data class D(val v: Int)
println(D(1) == D(1))`,
    ky: 'false\ntrue\n',
    nguon: KDOC('Data classes — equals is generated only for data classes'),
    daDoiChieu: true,
  },
  {
    ma: 'K46',
    tinhNang: 'Thuộc tính tính bằng get()',
    code: `class HcN(val d: Int, val r: Int) {
    val dienTich: Int get() = d * r
}
println(HcN(3, 4).dienTich)`,
    ky: '12\n',
    nguon: KDOC('Properties — Getters and setters'),
    daDoiChieu: true,
  },
  {
    ma: 'K47',
    tinhNang: 'interface với hàm mặc định',
    code: `interface Keu {
    fun ten(): String
    fun chao() = "toi la " + ten()
}
class M : Keu {
    override fun ten() = "meo"
}
println(M().chao())`,
    ky: 'toi la meo\n',
    nguon: KDOC('Interfaces — Implementing interfaces'),
    daDoiChieu: true,
  },
  {
    ma: 'K48',
    tinhNang: 'object là thể hiện duy nhất',
    code: `object Dem {
    var n = 0
    fun tang() { n++ }
}
Dem.tang()
Dem.tang()
println(Dem.n)`,
    ky: '2\n',
    nguon: KDOC('Object declarations'),
    daDoiChieu: true,
  },
  {
    ma: 'K49',
    tinhNang: 'sealed class + when is (smart cast trong nhánh)',
    code: `sealed class KetQua
class Tot(val v: Int) : KetQua()
class Hong(val m: String) : KetQua()
fun ta(r: KetQua) = when (r) {
    is Tot -> "duoc \${r.v}"
    is Hong -> "loi \${r.m}"
}
println(ta(Tot(7)))
println(ta(Hong("mat mang")))`,
    ky: 'duoc 7\nloi mat mang\n',
    nguon: KDOC('Sealed classes'),
    daDoiChieu: true,
  },
  {
    ma: 'K50',
    tinhNang: 'enum class: name, ordinal, values',
    code: `enum class Mau { DO, XANH, VANG }
println(Mau.DO)
println(Mau.XANH.ordinal)
println(Mau.VANG.name)
for (m in Mau.values()) print(m)
println()`,
    ky: 'DO\n1\nVANG\nDOXANHVANG\n',
    nguon: KDOC('Enum classes'),
    daDoiChieu: true,
  },
  {
    ma: 'K51',
    tinhNang: 'enum class có tham số',
    code: `enum class Huong(val goc: Int) {
    BAC(0), DONG(90)
}
println(Huong.DONG.goc)`,
    ky: '90\n',
    nguon: KDOC('Enum classes — Initialization'),
    daDoiChieu: true,
  },
  {
    ma: 'K52',
    tinhNang: 'companion object',
    code: `class Vong(val r: Int) {
    companion object {
        fun donVi() = Vong(1)
    }
}
println(Vong.donVi().r)`,
    ky: '1\n',
    nguon: KDOC('Objects — Companion objects'),
    daDoiChieu: true,
  },

  // ───────────────────────── Bộ sưu tập & lambda ─────────────────────────
  {
    ma: 'K60',
    tinhNang: 'listOf in ra dạng [a, b]; truy cập theo chỉ số; size',
    code: `val ds = listOf(10, 20, 30)
println(ds)
println(ds[1])
println(ds.size)`,
    ky: '[10, 20, 30]\n20\n3\n',
    nguon: KDOC('Collections overview — List'),
    daDoiChieu: true,
  },
  {
    ma: 'K61',
    tinhNang: 'mutableListOf thêm và xoá phần tử',
    code: `val ds = mutableListOf(1, 2)
ds.add(3)
ds.removeAt(0)
println(ds)`,
    ky: '[2, 3]\n',
    nguon: KDOC('List-specific operations'),
    daDoiChieu: true,
  },
  {
    ma: 'K62',
    tinhNang: 'map, filter với tham số ngầm it',
    code: `val ds = listOf(1, 2, 3, 4)
println(ds.filter { it % 2 == 0 })
println(ds.map { it * 10 })`,
    ky: '[2, 4]\n[10, 20, 30, 40]\n',
    nguon: KDOC('Collection transformations / filtering — it implicit name'),
    daDoiChieu: true,
  },
  {
    ma: 'K63',
    tinhNang: 'fold, sumOf, any, all, count',
    code: `val ds = listOf(1, 2, 3)
println(ds.fold(0) { a, b -> a + b })
println(ds.sumOf { it * 2 })
println(ds.any { it > 2 })
println(ds.all { it > 0 })
println(ds.count { it % 2 == 1 })`,
    ky: '6\n12\ntrue\ntrue\n2\n',
    nguon: KDOC('Aggregate operations — fold, sumOf, any, all, count'),
    daDoiChieu: true,
  },
  {
    ma: 'K64',
    tinhNang: 'sortedBy, joinToString',
    code: `data class N(val ten: String, val tuoi: Int)
val ds = listOf(N("Lan", 30), N("Nam", 20))
println(ds.sortedBy { it.tuoi }.joinToString(", ") { it.ten })`,
    ky: 'Nam, Lan\n',
    nguon: KDOC('Collection ordering — sortedBy; joinToString'),
    daDoiChieu: true,
  },
  {
    ma: 'K65',
    tinhNang: 'Lambda nhiều tham số và forEach',
    code: `listOf("a", "b").forEach { println(it) }
val cong = { a: Int, b: Int -> a + b }
println(cong(2, 3))`,
    ky: 'a\nb\n5\n',
    nguon: KDOC('Lambdas — Lambda expression syntax'),
    daDoiChieu: true,
  },
  {
    ma: 'K66',
    tinhNang: 'Map: duyệt, keys, containsKey',
    code: `val m = mapOf("b" to 2, "a" to 1)
println(m.containsKey("a"))
println(m.size)
println(m["b"])`,
    ky: 'true\n2\n2\n',
    nguon: KDOC('Maps — Map-specific operations'),
    daDoiChieu: true,
  },

  // ───────────────────────── Chuỗi ─────────────────────────
  {
    ma: 'K70',
    tinhNang: 'Thao tác chuỗi thường dùng',
    code: `val s = "  Xin Chao  "
println(s.trim())
println(s.trim().uppercase())
println("a,b,c".split(","))
println("abc".length)
println("abc".contains("b"))`,
    ky: 'Xin Chao\nXIN CHAO\n[a, b, c]\n3\ntrue\n',
    nguon: KDOC('Strings — String operations'),
    daDoiChieu: true,
  },

  // ───────────────────────── Ngoại lệ ─────────────────────────
  {
    ma: 'K80',
    tinhNang: 'try/catch bắt ngoại lệ ném ra',
    code: `fun chia(a: Int, b: Int): Int {
    if (b == 0) throw IllegalArgumentException("mau bang 0")
    return a / b
}
try {
    println(chia(6, 2))
    println(chia(1, 0))
} catch (e: Exception) {
    println("bat duoc")
}`,
    ky: '3\nbat duoc\n',
    nguon: KDOC('Exceptions — Exception classes'),
    daDoiChieu: true,
  },
  {
    ma: 'K81',
    tinhNang: 'finally luôn chạy',
    code: `try {
    println("than")
} finally {
    println("cuoi cung")
}`,
    ky: 'than\ncuoi cung\n',
    nguon: KDOC('Exceptions — The finally block'),
    daDoiChieu: true,
  },

  // ───────────────────────── Khác ─────────────────────────
  {
    ma: 'K90',
    tinhNang: 'Tên biến và hàm bằng tiếng Việt có dấu',
    code: `val hoTên = "Nguyễn Văn A"
fun chàoHỏi(x: String) = "Chào $x"
println(chàoHỏi(hoTên))`,
    ky: 'Chào Nguyễn Văn A\n',
    nguon: KDOC('Coding conventions — identifiers allow Unicode letters'),
    daDoiChieu: true,
  },
  {
    ma: 'K91',
    tinhNang: 'is / !is kiểm kiểu',
    code: `val x: Any = "chuoi"
println(x is String)
println(x !is Int)`,
    ky: 'true\ntrue\n',
    nguon: KDOC('Type checks and casts — is and !is operators'),
    daDoiChieu: true,
  },
  {
    ma: 'K92',
    tinhNang: 'Boolean không tự suy từ số (khác C/Python)',
    code: `val a = 1
println(a == 1 && true)
println(a != 1 || false)`,
    ky: 'true\nfalse\n',
    nguon: KDOC('Booleans'),
    daDoiChieu: true,
  },
]
