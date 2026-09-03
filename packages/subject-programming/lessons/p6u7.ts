// lessons/p6u7.ts — Bài học P6-U7: SEALED CLASS & TRẠNG THÁI (PR-M9).
//
// Chặng CUỐI (3/3) của track Kotlin. Khép sản phẩm trục "Sổ chi tiêu": u5 dựng model, u6 xử lý
// dữ liệu thiếu, u7 mô tả TRẠNG THÁI MÀN HÌNH bằng sealed class — đúng cách Android hiện đại
// dựng UI, nên nối thẳng sang làn C được.
//
// LUẬT TỰ KHAI §3.3 — điểm PHẢI nói ra ở unit này (luật 5), tra bảng KHAC_BIET:
//   · "`when` biểu thức KHÔNG khớp nhánh nào" — bộ chạy trả `kotlin.Unit` và chạy tiếp; Kotlin
//     THẬT thì KHÔNG DỊCH NỔI. Đây là khác biệt nặng nhất của unit này, vì chính khả năng bắt
//     lỗi lúc biên dịch mới là LÝ DO người ta dùng sealed class. Bài l1 nói thẳng và đẩy việc
//     kiểm chứng sang làn C. (Khác biệt này do PR-M9 phát hiện khi dò engine và đã bổ sung vào
//     hằng KHAC_BIET của kotlinSim/chayKotlin.ts.)
//   · "Phạm vi smart cast" — bộ chạy suy được từ `is Kieu` trong `when`, đúng thứ unit này cần.
//
// RÀNG BUỘC KỸ THUẬT (đã dò bằng chayKotlin): không có lớp lồng trong lớp — sealed class và các
// lớp con đều phải khai ở mức cao nhất. Không có `let`/`mapNotNull`. Không có stdin.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U7_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u7-l1',
    unitId: 'p6-u7',
    language: 'kotlin',
    title: 'sealed class — kể hết các trạng thái có thể xảy ra',
    hook: 'Màn hình Sổ chi tiêu của bạn không chỉ có một dáng vẻ: lúc đang tải, lúc hiện danh sách, lúc báo mất mạng, lúc sổ trống trơn. Cách làm phổ biến là nhét ba biến cờ rồi cầu trời chúng không mâu thuẫn. Kotlin cho bạn cách nói thẳng: "màn hình này có ĐÚNG bốn trạng thái, không có cái thứ năm".',
    theory:
      'VẤN ĐỀ CỦA MẤY BIẾN CỜ. Cách viết ai cũng từng làm:\n    var dangTai = true\n    var loi: String? = null\n    var danhSach = listOf<KhoanChi>()\nBa biến này sinh ra 8 tổ hợp, mà chỉ 4 tổ hợp có nghĩa. Sáu tổ hợp vô nghĩa còn lại — "vừa đang tải vừa có lỗi", "hết tải nhưng danh sách rỗng mà không lỗi" — chính là chỗ bug sinh sôi. Và không có gì ngăn bạn rơi vào chúng.\n\nSEALED CLASS — "kín", theo nghĩa danh sách các lớp con là ĐÓNG:\n    sealed class TrangThai\n    object DangTai : TrangThai()\n    object SoTrong : TrangThai()\n    data class Xong(val soKhoan: Int, val tong: Int) : TrangThai()\n    data class Loi(val thongDiep: String) : TrangThai()\n\nĐọc thành lời: một `TrangThai` là MỘT trong bốn thứ trên, không thể là gì khác. Tám tổ hợp vô nghĩa biến mất vì không còn cách nào viết ra chúng.\n\nHai kiểu lớp con, chọn theo việc nó có mang dữ liệu không:\n- `object` — trạng thái KHÔNG kèm dữ liệu, chỉ cần một bản duy nhất (`DangTai`, `SoTrong`).\n- `data class` — trạng thái CÓ kèm dữ liệu (`Xong` mang số khoản và tổng tiền).\n\nWHEN + IS = SMART CAST. Đây là chỗ mọi thứ ăn khớp:\n    when (t) {\n        is DangTai -> "Dang tai..."\n        is SoTrong -> "So chua co khoan nao"\n        is Xong -> "\\${t.soKhoan} khoan, tong \\${t.tong} dong"   // t hiểu là Xong, đọc thẳng ô\n        is Loi -> "Loi: \\${t.thongDiep}"\n    }\nTrong nhánh `is Xong`, Kotlin TỰ HIỂU `t` là `Xong` nên bạn đọc `t.soKhoan` không cần ép kiểu. Đó là smart cast của bài trước, nay áp cho kiểu chứ không phải cho null.\n\nVÀ ĐÂY LÀ PHẦN THƯỞNG LỚN NHẤT: `when` trên sealed class **không cần nhánh else**, vì trình biên dịch tự biết bạn đã kể hết. Quan trọng hơn — mai này bạn thêm trạng thái thứ năm, trình biên dịch sẽ **chỉ ra TỪNG CHỖ** `when` chưa xử lý nó. Bug không còn cơ hội trốn tới lúc chạy.\n\n⚠️ KHÁC BIỆT PHẢI BIẾT, VÀ LẦN NÀY RẤT ĐÁNG CHÚ Ý: bộ chạy trong bài **KHÔNG kiểm được điều đó**. Bỏ bớt một nhánh `when` ở đây thì chương trình vẫn chạy và in ra `kotlin.Unit`; còn Kotlin thật sẽ TỪ CHỐI BIÊN DỊCH. Nói cách khác, đúng cái lợi ích chính của sealed class là thứ chỉ máy thật chứng minh được cho bạn thấy. Bài về nhà của unit này giao đúng việc đó — hãy làm, vì đọc mô tả không thay được cảm giác thấy trình biên dịch chặn tay mình.',
    workedExample: {
      code: `// sealed class và các lớp con đều khai ở mức cao nhất (không lồng trong lớp khác)
sealed class TrangThai
object DangTai : TrangThai()
object SoTrong : TrangThai()
data class Xong(val soKhoan: Int, val tong: Int) : TrangThai()
data class Loi(val thongDiep: String) : TrangThai()

// when trên sealed class: KHÔNG cần else, vì đã kể hết các trạng thái
fun moTa(t: TrangThai): String = when (t) {
    is DangTai -> "Dang tai..."
    is SoTrong -> "So chua co khoan nao"
    // trong nhánh này Kotlin tự hiểu t là Xong nên đọc thẳng ô, khỏi ép kiểu
    is Xong -> "\${t.soKhoan} khoan, tong \${t.tong} dong"
    is Loi -> "Loi: \${t.thongDiep}"
}

fun main() {
    val cacTrangThai = listOf(DangTai, SoTrong, Xong(4, 197000), Loi("mat mang"))
    for (t in cacTrangThai) {
        println(moTa(t))
    }
}`,
      stdinLines: [],
    },
    predict: {
      code: `sealed class KetQua
object Rong : KetQua()
data class CoDuLieu(val n: Int) : KetQua()

fun mo(k: KetQua): String = when (k) {
    is Rong -> "rong"
    is CoDuLieu -> "co \${k.n} muc"
}

fun main() {
    println(mo(CoDuLieu(3)))
}`,
      question: 'Đoạn này in ra gì?',
      choices: ['co 3 muc', 'rong', 'kotlin.Unit', 'Lỗi vì when thiếu else'],
      answerIndex: 0,
      explain:
        '`k` là `CoDuLieu(3)` nên rơi vào nhánh `is CoDuLieu`, và trong nhánh đó Kotlin smart cast `k` thành `CoDuLieu` nên đọc được `k.n`. Không cần `else`: trên sealed class, kể hết các lớp con là đủ. Lưu ý bộ chạy trong bài KHÔNG tự kiểm điều "kể hết" đó — thiếu nhánh thì nó in ra kotlin.Unit chứ không báo lỗi như Kotlin thật.',
    },
    parsons: {
      prompt: 'Xếp các dòng: khai sealed class hai trạng thái rồi mô tả một trạng thái bằng when.',
      lines: [
        'sealed class TrangThai',
        'object DangTai : TrangThai()',
        'data class Xong(val soKhoan: Int) : TrangThai()',
        'fun moTa(t: TrangThai): String = when (t) {',
        '    is DangTai -> "Dang tai..."',
        '    is Xong -> "Xong: \\${t.soKhoan} khoan"',
        '}',
        'fun main() {',
        '    println(moTa(Xong(4)))',
        '}',
      ],
    },
    make: {
      prompt:
        'Mô tả trạng thái màn hình Sổ chi tiêu.\n\n1. Khai `sealed class TrangThai` với BA lớp con (đúng tên này):\n   - `object DangTai` — không mang dữ liệu\n   - `data class Xong(val soKhoan: Int)` — mang số khoản chi\n   - `data class Loi(val thongDiep: String)` — mang câu báo lỗi\n\n2. Viết `fun moTa(t: TrangThai): String` dùng `when (t)`, KHÔNG có nhánh else:\n   - DangTai → `Dang tai...`\n   - Xong → `Xong: <soKhoan> khoan`\n   - Loi → `Loi: <thongDiep>`\n\n3. Trong `main`, in đúng ba dòng bằng cách gọi `moTa` cho `DangTai`, `Xong(4)` và `Loi("mat mang")`:\nDang tai...\nXong: 4 khoan\nLoi: mat mang',
      starterCode: `sealed class TrangThai
// 3 lop con: object DangTai, data class Xong, data class Loi

fun moTa(t: TrangThai): String = when (t) {
    // 3 nhanh, KHONG co else
}

fun main() {
    // in 3 dong
}`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Dang tai...',
          match: 'contains',
          hidden: false,
          label: 'trạng thái object không mang dữ liệu',
        },
        {
          stdinLines: [],
          expected: 'Xong: 4 khoan',
          match: 'contains',
          hidden: false,
          label: 'smart cast đọc t.soKhoan',
        },
        {
          stdinLines: [],
          expected: 'Loi: mat mang',
          match: 'contains',
          hidden: false,
          label: 'smart cast đọc t.thongDiep',
        },
      ],
      hints: [
        'Lớp con của sealed class khai ở MỨC CAO NHẤT, không lồng trong lớp khác: `object DangTai : TrangThai()` và `data class Xong(val soKhoan: Int) : TrangThai()`.',
        'Trạng thái không mang dữ liệu thì dùng `object`; mang dữ liệu thì dùng `data class`.',
        'Mỗi nhánh viết `is TenLopCon -> ...`. Trong nhánh đó Kotlin tự hiểu kiểu nên đọc thẳng `t.soKhoan`, không cần ép kiểu.',
        'Nhớ bọc `${...}` khi nhét `t.soKhoan` vào giữa chuỗi: `"Xong: ${t.soKhoan} khoan"`.',
      ],
      sampleSolution: `sealed class TrangThai
object DangTai : TrangThai()
data class Xong(val soKhoan: Int) : TrangThai()
data class Loi(val thongDiep: String) : TrangThai()

fun moTa(t: TrangThai): String = when (t) {
    is DangTai -> "Dang tai..."
    is Xong -> "Xong: \${t.soKhoan} khoan"
    is Loi -> "Loi: \${t.thongDiep}"
}

fun main() {
    println(moTa(DangTai))
    println(moTa(Xong(4)))
    println(moTa(Loi("mat mang")))
}`,
    },
    homework:
      'LÀN C — việc quan trọng nhất của cả unit, làm trên máy thật. Chép bài Make sang file .kt, chạy bằng Kotlin thật cho ra đúng ba dòng. Rồi XOÁ nhánh `is Loi` trong `when` và biên dịch lại. Kotlin thật sẽ TỪ CHỐI, kèm câu đại ý "when expression must be exhaustive, add is Loi branch or else branch" — ghi lại nguyên văn. Đây chính là điều bộ chạy trong bài KHÔNG làm được (ở đây nó chỉ in ra kotlin.Unit), và cũng chính là lý do người ta dùng sealed class: thêm một trạng thái mới thì trình biên dịch chỉ tận tay mọi chỗ chưa xử lý nó, thay vì để bạn phát hiện qua báo lỗi của người dùng.',
    srsCards: [
      {
        hoi: 'Sealed class giải quyết vấn đề gì mà mấy biến cờ không giải quyết được?',
        dap: 'Ba biến cờ sinh 8 tổ hợp mà chỉ 4 có nghĩa; các tổ hợp vô nghĩa là chỗ bug sinh ra. Sealed class nói "chỉ có đúng N trạng thái này", nên không còn cách nào viết ra tổ hợp vô nghĩa.',
      },
      {
        hoi: 'Khi nào lớp con của sealed class dùng `object`, khi nào dùng `data class`?',
        dap: '`object` khi trạng thái KHÔNG mang dữ liệu (DangTai, SoTrong) — chỉ cần một bản duy nhất. `data class` khi có mang dữ liệu (Xong(soKhoan), Loi(thongDiep)).',
      },
      {
        hoi: 'Vì sao `when` trên sealed class không cần nhánh `else`?',
        dap: 'Vì danh sách lớp con là ĐÓNG nên trình biên dịch tự biết đã kể hết. Lợi ích lớn nhất: thêm trạng thái mới thì nó chỉ ra TỪNG chỗ when chưa xử lý, bắt lỗi lúc biên dịch.',
      },
      {
        hoi: 'Bỏ bớt một nhánh `when` trên sealed class: bộ chạy của bài và Kotlin thật khác nhau ra sao?',
        dap: 'Bộ chạy vẫn chạy và in ra kotlin.Unit. Kotlin thật KHÔNG DỊCH NỔI. Chính khả năng bắt lỗi lúc biên dịch đó mới là lý do dùng sealed class — phải kiểm trên máy thật.',
      },
    ],
  },
  {
    id: 'p6-u7-l2',
    unitId: 'p6-u7',
    language: 'kotlin',
    title: 'Sổ chi tiêu hoàn chỉnh — dự án khép track Kotlin',
    hook: 'Ba unit vừa rồi, mỗi unit cho bạn một mảnh: model dữ liệu, xử lý ô trống, mô tả trạng thái. Bài này ghép cả ba thành một thứ chạy được từ đầu tới cuối — đúng bộ khung mà một app Sổ chi tiêu thật dùng.',
    theory:
      'HÌNH DÁNG CỦA MỘT TÍNH NĂNG THẬT. Gần như mọi màn hình có dữ liệu đều đi theo ba lớp:\n\n1. **Model** — dữ liệu là gì. `data class KhoanChi(...)` từ u5.\n2. **Xử lý** — tính ra thứ cần hiển thị, chịu được dữ liệu thiếu. Lambda + null safety từ u6.\n3. **Trạng thái** — màn hình đang ở tình huống nào. `sealed class TrangThai` từ u7.\n\nTách ba lớp này ra không phải để cho đẹp. Nó cho bạn thứ quý nhất: **lớp 2 và 3 kiểm được mà không cần giao diện**. Hàm nhận danh sách và trả về `TrangThai` là hàm thuần — cho cùng đầu vào thì luôn ra cùng kết quả, nên viết test cho nó dễ như tính toán. Trên máy thật, đây chính là chỗ bạn đặt phần lớn test của mình.\n\nHÀM DỰNG TRẠNG THÁI — tim của bài này:\n    fun dungTrangThai(so: List<KhoanChi>): TrangThai {\n        if (so.isEmpty()) return SoTrong\n        return Xong(so.size, so.sumOf { it.soTien })\n    }\nĐọc thành lời: sổ rỗng thì trạng thái là "trống", còn lại là "xong" kèm số liệu tính sẵn. Chú ý thứ tự: **ca biên xử lý TRƯỚC**. Viết ngược lại thì `maxByOrNull` trên sổ rỗng sẽ dắt bạn vào đúng cái bẫy null của u6.\n\nMỘT LƯU Ý VỀ THỨ TỰ KIỂM TRA. Khi nhiều ca biên chồng nhau, xếp từ ca HẸP nhất tới ca rộng nhất — giống bậc thang `when` ở u5. Sổ rỗng hẹp hơn sổ có dữ liệu, nên nó đứng trước.\n\nVÀ ĐỪNG QUÊN Ô TRỐNG. Sổ thật luôn có khoản chưa xếp nhóm. Bài này gom chúng vào nhóm `chua xep` thay vì bỏ đi — vì tiền đã tiêu thì vẫn phải tính, đúng như u6 đã bàn.\n\nLÀN C: y hệt bộ khung này chạy trong một app Android thật. `TrangThai` thành thứ mà giao diện quan sát, `dungTrangThai` thành hàm trong lớp giữ trạng thái của màn hình, và `when (t)` thành chỗ quyết định vẽ vòng quay, vẽ danh sách hay vẽ câu báo lỗi. Bạn không phải học lại kiến trúc mới — bạn vừa viết nó xong rồi.',
    workedExample: {
      code: `data class KhoanChi(val ten: String, val soTien: Int, val nhom: String?)

sealed class TrangThai
object SoTrong : TrangThai()
data class Xong(val soKhoan: Int, val tong: Int) : TrangThai()

// Hàm THUẦN: cùng đầu vào luôn cho cùng kết quả, nên test được mà không cần giao diện
fun dungTrangThai(so: List<KhoanChi>): TrangThai {
    // ca biên xử lý TRƯỚC — sổ rỗng thì không có gì để tính
    if (so.isEmpty()) return SoTrong
    return Xong(so.size, so.sumOf { it.soTien })
}

fun main() {
    val so = listOf(
        KhoanChi("Ca phe", 25000, "an"),
        KhoanChi("Com trua", 45000, "an"),
        KhoanChi("Sach", 120000, null)
    )

    val t = dungTrangThai(so)
    when (t) {
        is SoTrong -> println("So chua co khoan nao")
        is Xong -> println("\${t.soKhoan} khoan, tong \${t.tong} dong")
    }

    // khoản chưa xếp nhóm vẫn được tính, chỉ gom vào một nhóm riêng
    val theoNhom = so.groupBy { it.nhom ?: "chua xep" }
    for ((nhom, ds) in theoNhom) {
        println("$nhom: \${ds.sumOf { it.soTien }} dong")
    }

    // và ca biên: sổ rỗng đi đúng nhánh còn lại
    when (dungTrangThai(listOf())) {
        is SoTrong -> println("So rong: dung nhanh SoTrong")
        is Xong -> println("khong bao gio toi day")
    }
}`,
      stdinLines: [],
    },
    predict: {
      code: `data class K(val ten: String, val soTien: Int)

sealed class TT
object Rong : TT()
data class Xong(val n: Int) : TT()

fun dung(so: List<K>): TT {
    if (so.isEmpty()) return Rong
    return Xong(so.size)
}

fun main() {
    val t = dung(listOf())
    println(when (t) {
        is Rong -> "rong"
        is Xong -> "co \${t.n}"
    })
}`,
      question: 'Đoạn này in ra gì?',
      choices: ['rong', 'co 0', 'kotlin.Unit', 'Lỗi vì danh sách rỗng'],
      answerIndex: 0,
      explain:
        'Danh sách rỗng nên `dung` trả về `Rong` ngay ở câu kiểm tra ca biên đầu tiên, và `when` đi vào nhánh `is Rong`. Đây chính là giá trị của việc xử lý ca biên TRƯỚC: không dòng nào phải hỏi "nhỡ sổ rỗng thì sao" thêm lần nữa, vì kiểu `TrangThai` đã trả lời hộ rồi.',
    },
    parsons: {
      prompt: 'Xếp các dòng: hàm dựng trạng thái từ danh sách, xử lý ca biên sổ rỗng trước.',
      lines: [
        'sealed class TrangThai',
        'object SoTrong : TrangThai()',
        'data class Xong(val soKhoan: Int) : TrangThai()',
        'fun dungTrangThai(so: List<Int>): TrangThai {',
        '    if (so.isEmpty()) return SoTrong',
        '    return Xong(so.size)',
        '}',
        'fun main() {',
        '    println(dungTrangThai(listOf(1, 2)))',
        '}',
      ],
    },
    make: {
      prompt:
        'DỰ ÁN KHÉP TRACK KOTLIN — Sổ chi tiêu hoàn chỉnh, ghép cả ba unit.\n\n1. `data class KhoanChi(val ten: String, val soTien: Int, val nhom: String?)`\n\n2. `sealed class TrangThai` với hai lớp con: `object SoTrong` và `data class Xong(val soKhoan: Int, val tong: Int)`\n\n3. `fun dungTrangThai(so: List<KhoanChi>): TrangThai` — sổ rỗng trả `SoTrong`, còn lại trả `Xong` kèm số khoản và TỔNG tiền.\n\n4. Trong `main`, dùng danh sách:\n   ("Ca phe", 25000, "an") · ("Com trua", 45000, "an") · ("Sach", 120000, null)\n\n   In đúng ba dòng:\nXong: 3 khoan, 190000 dong\nChua xep: 120000 dong\nSo rong: dung\n\n   - Dòng 1: dùng `when` trên `dungTrangThai(so)`, nhánh `SoTrong` in `So trong`.\n   - Dòng 2: tổng tiền riêng những khoản CHƯA xếp nhóm (nhom == null).\n   - Dòng 3: gọi lại `dungTrangThai(listOf())`, đi vào nhánh `SoTrong` thì in `So rong: dung`.',
      starterCode: `data class KhoanChi(val ten: String, val soTien: Int, val nhom: String?)

sealed class TrangThai
// object SoTrong, data class Xong(soKhoan, tong)

fun dungTrangThai(so: List<KhoanChi>): TrangThai {
    // ca bien truoc: so rong
}

fun main() {
    val so = listOf(
        // 3 khoan theo de
    )
    // 1) when tren dungTrangThai(so)
    // 2) tong tien nhung khoan chua xep nhom
    // 3) kiem ca bien voi listOf()
}`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Xong: 3 khoan, 190000 dong',
          match: 'contains',
          hidden: false,
          label: 'trạng thái Xong kèm số khoản và tổng',
        },
        {
          stdinLines: [],
          expected: 'Chua xep: 120000 dong',
          match: 'contains',
          hidden: false,
          label: 'tổng riêng khoản nhom == null',
        },
        {
          stdinLines: [],
          expected: 'So rong: dung',
          match: 'contains',
          hidden: false,
          label: 'ca biên sổ rỗng đi đúng nhánh SoTrong',
        },
      ],
      hints: [
        'Xử lý ca biên TRƯỚC trong dungTrangThai: `if (so.isEmpty()) return SoTrong` rồi mới tính phần còn lại.',
        'Tổng tiền: `so.sumOf { it.soTien }`. Số khoản: `so.size`.',
        'Lọc khoản chưa xếp nhóm: `so.filter { it.nhom == null }.sumOf { it.soTien }`.',
        'Dòng 1 viết bằng when: `val t = dungTrangThai(so)` rồi `when (t) { is SoTrong -> println("So trong"); is Xong -> println("Xong: ${t.soKhoan} khoan, ${t.tong} dong") }`.',
        'Không cần nhánh else vì TrangThai chỉ có hai lớp con — nhưng nhớ bộ chạy ở đây không tự kiểm điều đó, Kotlin thật mới kiểm.',
      ],
      sampleSolution: `data class KhoanChi(val ten: String, val soTien: Int, val nhom: String?)

sealed class TrangThai
object SoTrong : TrangThai()
data class Xong(val soKhoan: Int, val tong: Int) : TrangThai()

fun dungTrangThai(so: List<KhoanChi>): TrangThai {
    if (so.isEmpty()) return SoTrong
    return Xong(so.size, so.sumOf { it.soTien })
}

fun main() {
    val so = listOf(
        KhoanChi("Ca phe", 25000, "an"),
        KhoanChi("Com trua", 45000, "an"),
        KhoanChi("Sach", 120000, null)
    )

    val t = dungTrangThai(so)
    when (t) {
        is SoTrong -> println("So trong")
        is Xong -> println("Xong: \${t.soKhoan} khoan, \${t.tong} dong")
    }

    println("Chua xep: \${so.filter { it.nhom == null }.sumOf { it.soTien }} dong")

    when (dungTrangThai(listOf())) {
        is SoTrong -> println("So rong: dung")
        is Xong -> println("sai")
    }
}`,
    },
    homework:
      'LÀN C — bước cuối của cả track Kotlin. Chép dự án sang máy thật, chạy bằng Kotlin thật cho khớp ba dòng. Rồi làm hai việc để thấy nó là bộ khung THẬT chứ không phải bài tập: (1) Thêm trạng thái thứ ba `data class Loi(val thongDiep: String) : TrangThai()` — trình biên dịch sẽ lập tức chỉ ra MỌI chỗ `when` chưa xử lý nó; đó là sealed class đang làm việc cho bạn. (2) Nếu bạn muốn đi tiếp: mở Android Studio, tạo project trống, và đặt `dungTrangThai` vào một ViewModel, `when (t)` vào chỗ vẽ giao diện. Kiến trúc không đổi một chữ — bạn chỉ thay `println` bằng thành phần giao diện. Đó là lý do ba unit vừa rồi dạy theo thứ tự này.',
    srsCards: [
      {
        hoi: 'Vì sao nên tách hàm dựng trạng thái ra khỏi giao diện?',
        dap: 'Vì nó thành hàm THUẦN — cùng đầu vào luôn cho cùng kết quả, nên test được mà không cần dựng giao diện. Đây là chỗ đặt phần lớn test của một tính năng.',
      },
      {
        hoi: 'Trong hàm dựng trạng thái, nên kiểm ca biên (danh sách rỗng) ở đâu?',
        dap: 'TRƯỚC, ngay đầu hàm, rồi return sớm. Xếp từ ca hẹp tới ca rộng. Viết ngược lại thì các phép như maxByOrNull trên danh sách rỗng sẽ dắt vào bẫy null.',
      },
      {
        hoi: 'Ba lớp của một tính năng có dữ liệu, theo thứ tự?',
        dap: 'Model (data class: dữ liệu là gì) → Xử lý (lambda + null safety: tính thứ cần hiển thị) → Trạng thái (sealed class: màn hình đang ở tình huống nào).',
      },
    ],
  },
]
