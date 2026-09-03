// lessons/p6u5.ts — Bài học P6-U5: KOTLIN NHẬP MÔN — MODEL DỮ LIỆU (PR-M8).
//
// Hiến chương chương trình M (docs/research/companion-va-personal-policy.md §6-§7) xếp Kotlin
// vào P6 unit u5–u7, với sản phẩm trục nhỏ "SỔ CHI TIÊU" tích luỹ qua ba unit:
//   u5 model dữ liệu  →  u6 null safety + collections/lambda  →  u7 sealed class xử lý trạng thái
// Unit này là chặng đầu: dựng cho được một model `KhoanChi` tử tế, chưa đụng null.
//
// LUẬT TỰ KHAI §3.3 áp cho mọi bài ở đây:
//   · Bài l1 có mục "Bộ chạy này KHÔNG làm gì" — nội dung bám đúng hằng KHONG_LAM_GI của
//     kotlinSim/chayKotlin.ts (luật 2). Sửa hằng đó thì sửa cả bài này.
//   · Không câu chữ nào ngụ ý đang chạy kotlinc thật (luật 3).
//   · Bước ⑦ (homework) luôn là làn C — cài Kotlin/Android Studio thật rồi đối chiếu (luật 4).
//   · Bài chạm điểm nào trong bảng KHAC_BIET thì phải nói ra (luật 5): l1 chạm "thời điểm bắt
//     lỗi kiểu" và nói ra ngay trong phần lý thuyết.
//
// RÀNG BUỘC KỸ THUẬT (đã kiểm bằng chayKotlin, không suy đoán): bộ chạy KHÔNG có `readLine()`
// — không có stdin cho mạch này. Nên mọi bài lấy dữ liệu từ HẰNG trong đề, và `stdinLines`
// luôn rỗng.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U5_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u5-l1',
    unitId: 'p6-u5',
    language: 'kotlin',
    title: 'Kotlin bắt đầu từ đâu — val, var và chuỗi mẫu',
    hook: 'Bạn muốn biết tháng này tiêu hết bao nhiêu. Trước khi có app, phải có chỗ ĐỂ SỐ vào đã. Bài này dựng viên gạch đầu tiên của Sổ chi tiêu — và bạn sẽ gặp ngay thói quen làm nên tên tuổi Kotlin: mặc định thì KHÔNG cho sửa.',
    theory:
      'TRƯỚC HẾT, MỘT LỜI THÀNH THẬT. Nút Chạy ở đây gọi BỘ CHẠY KOTLIN RÚT GỌN do dự án tự viết, không phải kotlinc. Cú pháp bạn gõ là cú pháp Kotlin thật, nhưng bộ chạy chỉ hiểu một phần của ngôn ngữ.\n\nBỘ CHẠY NÀY KHÔNG LÀM GÌ:\n- Không có thư viện chuẩn đầy đủ: không java.*, không kotlinx, không Android SDK.\n- Không có giao diện, không có ứng dụng thật — phần đó nằm ở làn C (Android Studio trên máy bạn).\n- Không đa luồng thật: không coroutine, không suspend, không Flow, không Thread.\n- Không có file, không có mạng, không có đồng hồ (cố ý — để bài học luôn cho cùng kết quả).\n- Không có generic tự viết, không extension function, không toán tử tự định nghĩa, không delegate (by lazy…).\n- Không có lớp lồng trong lớp — đưa lớp bên trong ra mục cao nhất.\n\nVà một khác biệt phải nói thẳng: bộ chạy này bắt lỗi kiểu LÚC CHẠY, còn Kotlin thật bắt LÚC BIÊN DỊCH. Trên máy thật, chương trình sai kiểu thì không chạy được dòng nào; ở đây lỗi hiện ra khi dòng đó được thực thi. Đổi lại, thông báo lỗi ở đây chỉ đúng số dòng của bạn và viết bằng tiếng Việt.\n\nVAL VÀ VAR. Kotlin có hai cách đặt tên cho một giá trị:\n    val ten = "Ca phe"   // val = đọc thôi, gán một lần rồi thôi\n    var gia = 25000      // var = đổi được về sau\n\nGán lại một `val` là lỗi. Nghe phiền, nhưng đây là lựa chọn có chủ đích: phần lớn lỗi khó tìm trong phần mềm đến từ một giá trị bị đổi ở chỗ bạn không ngờ. Khai `val` là bạn tự chặn trước cả nhóm lỗi đó. LUẬT THỰC HÀNH: viết `val` trước, chỉ đổi sang `var` khi trình biên dịch bắt bạn phải đổi.\n\nKIỂU TỰ SUY RA. Bạn không phải khai kiểu — Kotlin nhìn giá trị mà suy:\n    val ten = "Ca phe"   // suy ra String\n    val gia = 25000      // suy ra Int\nSuy ra KHÔNG có nghĩa là lỏng lẻo. Một khi đã là Int thì mãi là Int; gán chuỗi vào đó là lỗi. Muốn nói rõ kiểu thì viết `val gia: Int = 25000`.\n\nCHUỖI MẪU — thứ bạn sẽ dùng mỗi ngày. Thay vì cộng chuỗi lằng nhằng, đặt thẳng biến vào trong chuỗi bằng dấu $:\n    println("$ten: $gia dong")\nCần một biểu thức chứ không chỉ một biến thì bọc trong ${...}:\n    println("Ba ly het ${gia * 3} dong")\n\nSỐ NGUYÊN CHIA THÌ CẮT PHẦN LẺ. `7 / 2` ra `3`, không phải `3.5` — vì hai vế đều là Int nên kết quả cũng là Int. Đây là bẫy kinh điển khi tính trung bình. Muốn có phần lẻ thì để một vế là số thực: `7.0 / 2` ra `3.5`.',
    workedExample: {
      code: `fun main() {
    // val: đặt một lần, không đổi được nữa — mặc định nên dùng cái này
    val ten = "Ca phe sang"
    // var: đổi được, dùng khi thật sự cần cộng dồn
    var soTien = 25000

    // chuỗi mẫu: $ten lấy thẳng giá trị của biến vào giữa câu
    println("$ten: $soTien dong")

    // đổi giá trị của var — hợp lệ vì nó khai bằng var
    soTien = soTien + 5000
    println("Sau khi len gia: $soTien dong")

    // \${...} khi cần cả một biểu thức chứ không chỉ tên biến
    println("Uong 3 ngay het \${soTien * 3} dong")

    // bẫy chia số nguyên: hai vế Int nên phần lẻ bị cắt, không làm tròn
    val trungBinh = 7 / 2
    println("7 / 2 = $trungBinh")
}`,
      stdinLines: [],
    },
    predict: {
      code: `fun main() {
    val gia = 25000
    var soLy = 2
    soLy = soLy + 1
    println("\${gia * soLy} dong")
}`,
      question: 'Đoạn này in ra gì?',
      choices: ['75000 dong', '50000 dong', 'Lỗi vì gán lại soLy', 'gia * soLy dong'],
      answerIndex: 0,
      explain:
        'soLy khai bằng var nên gán lại được: 2 + 1 = 3, rồi 25000 * 3 = 75000. Nếu soLy khai bằng val thì dòng `soLy = soLy + 1` mới là lỗi. Và nhớ ${...}: có phép nhân bên trong nên phải bọc ngoặc, viết "$gia * soLy" sẽ in ra chuỗi "25000 * 3" chứ không nhân.',
    },
    parsons: {
      prompt: 'Xếp các dòng: ghi một khoản chi, cộng thêm tiền ship, rồi in tổng.',
      lines: [
        'fun main() {',
        '    val ten = "Tra sua"',
        '    var soTien = 35000',
        '    soTien = soTien + 15000',
        '    println("$ten: $soTien dong")',
        '}',
      ],
    },
    make: {
      prompt:
        'Ghi lại một buổi đi chợ vào Sổ chi tiêu.\n\nViết chương trình:\n\n1. Một `val` tên `mucChi` giữ chuỗi: Di cho\n2. Một `var` tên `soTien` giữ số 120000\n3. Nhớ ra còn mua thêm rau hết 18000 — cộng vào `soTien`\n4. In đúng một dòng theo mẫu: Di cho: 138000 dong\n5. In thêm một dòng cho biết chia đều cho 4 người thì mỗi người bao nhiêu, theo mẫu: Moi nguoi: 34500 dong\n\nDùng chuỗi mẫu ($) chứ đừng cộng chuỗi bằng dấu +.',
      starterCode: `fun main() {
    // 1. val mucChi
    // 2. var soTien

    // 3. cong them 18000 tien rau

    // 4. in "Di cho: ... dong"
    // 5. in "Moi nguoi: ... dong" (chia deu cho 4)
}`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Di cho: 138000 dong',
          match: 'contains',
          hidden: false,
          label: '120000 + 18000 → 138000',
        },
        {
          stdinLines: [],
          expected: 'Moi nguoi: 34500 dong',
          match: 'contains',
          hidden: false,
          label: '138000 chia cho 4 → 34500',
        },
      ],
      hints: [
        'val cho thứ không đổi (tên khoản chi), var cho thứ phải cộng dồn (số tiền). Khai val rồi gán lại là lỗi.',
        'Cộng dồn viết là `soTien = soTien + 18000`. Kotlin cũng cho viết gọn `soTien += 18000`.',
        'Chuỗi mẫu: "$mucChi: $soTien dong". Chỗ nào cần tính toán thì bọc `${...}` — ví dụ `${soTien / 4}`.',
        '138000 chia hết cho 4 nên phép chia Int ra đúng 34500, không lo mất phần lẻ ở bài này.',
      ],
      sampleSolution: `fun main() {
    val mucChi = "Di cho"
    var soTien = 120000
    soTien = soTien + 18000
    println("$mucChi: $soTien dong")
    println("Moi nguoi: \${soTien / 4} dong")
}`,
    },
    homework:
      'LÀN C — làm trên máy thật, không chấm ở đây. Cài Kotlin (kotlinc, hoặc dùng Android Studio) rồi gõ lại ĐÚNG đoạn code bài Make của bạn vào một file `SoChiTieu.kt`, biên dịch và chạy thật. Đối chiếu hai điều: (1) kết quả in ra có giống hệt không; (2) thử đổi `val mucChi` thành gán lại một lần nữa — trên máy thật lỗi xuất hiện LÚC BIÊN DỊCH, trước khi chương trình chạy dòng nào, khác với bộ chạy trong bài. Cảm nhận sự khác nhau đó chính là bài học.',
    srsCards: [
      {
        hoi: 'Kotlin: val khác var chỗ nào?',
        dap: 'val gán một lần rồi không đổi được; var đổi được. Luật thực hành: viết val trước, chỉ đổi sang var khi buộc phải.',
      },
      {
        hoi: 'Trong chuỗi mẫu Kotlin, khi nào phải dùng ${...} thay vì $ten?',
        dap: 'Khi cần cả một BIỂU THỨC chứ không chỉ tên biến. "$gia * 3" in ra chuỗi "25000 * 3"; phải viết "${gia * 3}" mới nhân.',
      },
      {
        hoi: 'Kotlin: 7 / 2 ra bao nhiêu?',
        dap: '3 — hai vế đều Int nên kết quả là Int, phần lẻ bị CẮT chứ không làm tròn. Muốn 3.5 thì để một vế là số thực: 7.0 / 2.',
      },
    ],
  },
  {
    id: 'p6-u5-l2',
    unitId: 'p6-u5',
    language: 'kotlin',
    title: 'Hàm và when — tự xếp nhóm cho khoản chi',
    hook: 'Sổ chi tiêu chỉ hữu ích khi trả lời được "tiền đi đâu mất rồi". Muốn vậy mỗi khoản phải có NHÓM. Gõ tay nhóm cho từng khoản thì được vài hôm là chán — nên ta viết một cái hàm xếp hộ.',
    theory:
      'HÀM là một việc bạn đặt tên rồi gọi lại nhiều lần:\n    fun xepNhom(ten: String): String {\n        return "an uong"\n    }\nĐọc từ trái sang: `fun` là khai báo hàm · `xepNhom` là tên · `(ten: String)` là thứ nhận vào, PHẢI ghi rõ kiểu · `: String` sau ngoặc là kiểu TRẢ VỀ.\n\nKhác với biến, tham số hàm không tự suy kiểu được — Kotlin bắt bạn ghi. Có lý do: tên hàm và kiểu tham số chính là bản hợp đồng giữa bạn và người gọi (kể cả chính bạn sáu tháng sau).\n\nHÀM MỘT BIỂU THỨC. Thân hàm chỉ có mỗi một biểu thức trả về thì bỏ luôn ngoặc nhọn và `return`:\n    fun gapDoi(x: Int): Int = x * 2\nNgắn, và quan trọng hơn: nhìn là biết hàm này chỉ TÍNH ra một giá trị chứ không làm gì khác.\n\nTHAM SỐ MẶC ĐỊNH. Cho tham số một giá trị sẵn thì người gọi được phép bỏ qua:\n    fun mucDo(soTien: Int, nguong: Int = 50000): String = if (soTien >= nguong) "lon" else "nho"\n    mucDo(60000)          // dùng ngưỡng mặc định 50000\n    mucDo(60000, 100000)  // tự đặt ngưỡng khác\nĐây là thứ thay cho việc viết ba hàm gần giống nhau.\n\nIF LÀ BIỂU THỨC, KHÔNG PHẢI CÂU LỆNH. Ở Kotlin, `if` TRẢ VỀ giá trị nên gán thẳng được:\n    val muc = if (soTien >= 50000) "lon" else "nho"\nVì thế Kotlin không có toán tử ba ngôi `? :` như nhiều ngôn ngữ khác — `if/else` đã làm đúng việc đó rồi.\n\nWHEN — thứ bạn sẽ thích. Khi có nhiều nhánh, `if/else if/else` chồng lên nhau đọc rất mệt. `when` viết phẳng:\n    when (nhom) {\n        "an" -> "An uong"\n        "di" -> "Di lai"\n        else -> "Khac"\n    }\nHai kiểu dùng:\n- CÓ chủ đề — `when (nhom)`: so `nhom` với từng nhánh.\n- KHÔNG chủ đề — `when { ... }`: mỗi nhánh là một điều kiện đúng/sai, nhánh ĐẦU TIÊN đúng thì thắng. Hợp cho bậc thang:\n        when {\n            soTien >= 100000 -> "rat lon"\n            soTien >= 30000 -> "vua"\n            else -> "nho"\n        }\nThứ tự nhánh quan trọng: đặt nhánh 30000 lên trước thì khoản 150000 rơi vào "vua" và nhánh "rat lon" không bao giờ chạy.\n\nWHEN DÙNG NHƯ BIỂU THỨC THÌ BẮT BUỘC CÓ `else`. Vì nó phải trả về giá trị trong MỌI trường hợp — thiếu else là còn đường không trả gì. (Ở unit sau, khi gặp sealed class, bạn sẽ thấy trường hợp duy nhất được miễn `else`.)',
    workedExample: {
      code: `// Hàm một biểu thức: chỉ tính ra giá trị, không làm gì khác
fun gapDoi(x: Int): Int = x * 2

// Tham số mặc định: gọi mà bỏ qua "nguong" thì nó tự là 50000
fun mucDo(soTien: Int, nguong: Int = 50000): String =
    if (soTien >= nguong) "lon" else "nho"

// when CÓ chủ đề: so nhom với từng nhánh
fun tenNhom(nhom: String): String {
    return when (nhom) {
        "an" -> "An uong"
        "di" -> "Di lai"
        else -> "Khac"
    }
}

// when KHÔNG chủ đề: bậc thang, nhánh đầu tiên đúng thì thắng
fun xepBac(soTien: Int): String {
    return when {
        soTien >= 100000 -> "rat lon"
        soTien >= 30000 -> "vua"
        else -> "nho"
    }
}

fun main() {
    println(gapDoi(21))
    println(mucDo(60000))          // ngưỡng mặc định
    println(mucDo(60000, 100000))  // tự đặt ngưỡng
    println(tenNhom("di"))
    println(tenNhom("gi do la"))   // rơi vào else
    println(xepBac(150000))
    println(xepBac(45000))
    println(xepBac(9000))
}`,
      stdinLines: [],
    },
    predict: {
      code: `fun xepBac(soTien: Int): String {
    return when {
        soTien >= 30000 -> "vua"
        soTien >= 100000 -> "rat lon"
        else -> "nho"
    }
}
fun main() {
    println(xepBac(150000))
}`,
      question: 'Đoạn này in ra gì?',
      choices: ['vua', 'rat lon', 'nho', 'Lỗi vì hai nhánh cùng đúng'],
      answerIndex: 0,
      explain:
        'when không chủ đề xét các nhánh TỪ TRÊN XUỐNG và dừng ở nhánh đầu tiên đúng. 150000 >= 30000 đã đúng ngay nhánh một nên trả "vua", nhánh "rat lon" không bao giờ tới lượt. Đây là lỗi thứ tự kinh điển: bậc thang phải xếp từ NGƯỠNG CAO xuống ngưỡng thấp.',
    },
    parsons: {
      prompt: 'Xếp các dòng: một hàm when có chủ đề đổi mã nhóm thành tên tiếng Việt, rồi gọi thử.',
      lines: [
        'fun tenNhom(nhom: String): String {',
        '    return when (nhom) {',
        '        "an" -> "An uong"',
        '        else -> "Khac"',
        '    }',
        '}',
        'fun main() {',
        '    println(tenNhom("an"))',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết bộ xếp loại cho Sổ chi tiêu.\n\n1. Hàm `tenNhom(nhom: String): String` đổi mã nhóm thành tên đọc được:\n   "an" → An uong · "di" → Di lai · "hoc" → Hoc hanh · còn lại → Khac\n\n2. Hàm `xepBac(soTien: Int): String` xếp bậc theo số tiền:\n   từ 100000 trở lên → rat lon · từ 30000 trở lên → vua · còn lại → nho\n   (cẩn thận THỨ TỰ nhánh)\n\n3. Trong `main`, in đúng hai dòng theo mẫu:\nHoc hanh - rat lon\nDi lai - nho\n   Dòng một ứng với nhóm "hoc" số tiền 250000; dòng hai ứng với nhóm "di" số tiền 7000.',
      starterCode: `fun tenNhom(nhom: String): String {
    // when co chu de
}

fun xepBac(soTien: Int): String {
    // when khong chu de — chu y thu tu nhanh
}

fun main() {
    // in 2 dong theo mau "<ten nhom> - <bac>"
}`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Hoc hanh - rat lon',
          match: 'contains',
          hidden: false,
          label: 'nhóm "hoc" + 250000',
        },
        {
          stdinLines: [],
          expected: 'Di lai - nho',
          match: 'contains',
          hidden: false,
          label: 'nhóm "di" + 7000',
        },
      ],
      hints: [
        'Hàm phải ghi rõ kiểu tham số và kiểu trả về: fun tenNhom(nhom: String): String { ... }',
        'Đổi một giá trị thành giá trị khác thì dùng when CÓ chủ đề: when (nhom) { "an" -> ...; else -> "Khac" }. Nhớ nhánh else, thiếu là lỗi.',
        'Bậc thang thì dùng when KHÔNG chủ đề và xếp từ ngưỡng CAO xuống thấp, nếu không nhánh cao sẽ không bao giờ chạy.',
        'In ghép hai kết quả bằng chuỗi mẫu: println("${tenNhom("hoc")} - ${xepBac(250000)}").',
      ],
      sampleSolution: `fun tenNhom(nhom: String): String {
    return when (nhom) {
        "an" -> "An uong"
        "di" -> "Di lai"
        "hoc" -> "Hoc hanh"
        else -> "Khac"
    }
}

fun xepBac(soTien: Int): String {
    return when {
        soTien >= 100000 -> "rat lon"
        soTien >= 30000 -> "vua"
        else -> "nho"
    }
}

fun main() {
    println("\${tenNhom("hoc")} - \${xepBac(250000)}")
    println("\${tenNhom("di")} - \${xepBac(7000)}")
}`,
    },
    homework:
      'LÀN C — trên máy thật, không chấm ở đây. Chép hai hàm của bài Make vào một file .kt rồi chạy bằng Kotlin thật. Sau đó thử một việc mà bộ chạy trong bài KHÔNG bắt được: xoá nhánh `else` của `tenNhom` đi. Kotlin thật sẽ từ chối biên dịch ngay, kèm câu đại ý "when dùng làm biểu thức thì phải vét hết trường hợp". Ghi lại nguyên văn câu báo lỗi đó — nó là thứ bạn sẽ gặp lại rất nhiều.',
    srsCards: [
      {
        hoi: 'Kotlin: when CÓ chủ đề và KHÔNG chủ đề khác nhau ra sao?',
        dap: 'when (x) so x với từng nhánh. when { } không có x — mỗi nhánh là một điều kiện đúng/sai, nhánh ĐẦU TIÊN đúng thì thắng, nên bậc thang phải xếp từ ngưỡng cao xuống thấp.',
      },
      {
        hoi: 'Kotlin dùng gì thay cho toán tử ba ngôi của C/Java?',
        dap: 'Vì `if` ở Kotlin là BIỂU THỨC, tự trả về giá trị: val muc = if (t >= 50000) "lon" else "nho". Không cần thêm cú pháp riêng.',
      },
      {
        hoi: 'Khi nào `when` bắt buộc phải có nhánh else?',
        dap: 'Khi dùng làm BIỂU THỨC (kết quả được gán hoặc trả về) — vì phải có giá trị trong mọi trường hợp.',
      },
    ],
  },
  {
    id: 'p6-u5-l3',
    unitId: 'p6-u5',
    language: 'kotlin',
    title: 'data class — model Khoản chi tử tế (dự án nhỏ của unit)',
    hook: 'Tới giờ mỗi khoản chi của bạn là mấy biến rời nhau: tên một chỗ, số tiền một chỗ. Thêm khoản thứ hai là loạn ngay. Cái ta cần là một KIỂU mô tả đúng "một khoản chi" — và Kotlin cho bạn dựng nó trong đúng một dòng.',
    theory:
      'DATA CLASS — một dòng, được rất nhiều.\n    data class KhoanChi(val ten: String, val soTien: Int, val nhom: String)\nDòng này khai một kiểu mới có ba ô. Chữ `data` ở đầu bảo Kotlin tự viết hộ bạn ba thứ mà lớp thường không có:\n\n1. `toString()` đọc được — in ra `KhoanChi(ten=Ca phe, soTien=25000, nhom=an)` thay vì một mã băm vô nghĩa.\n2. `==` so theo NỘI DUNG — hai khoản chi cùng ba ô giá trị thì bằng nhau, dù là hai vật khác nhau trong bộ nhớ.\n3. `copy()` — tạo bản mới đổi vài ô, giữ nguyên phần còn lại.\n\nĐiểm 2 đáng dừng lại. Với lớp THƯỜNG (không có `data`), `==` so xem có phải CÙNG MỘT VẬT không, nên hai vật giống hệt nhau vẫn cho `false`. Đây là nguồn lỗi kinh điển với người mới. Khai `data` là bạn nói: kiểu này định nghĩa bởi GIÁ TRỊ của nó, không phải bởi danh tính.\n\nCOPY — cách sửa dữ liệu mà không sửa dữ liệu:\n    val a = KhoanChi("Ca phe", 25000, "an")\n    val b = a.copy(soTien = 30000)   // b khác giá, các ô còn lại giữ nguyên\n`a` không hề đổi. Đây chính là lý do các ô khai bằng `val`: thay vì sửa tại chỗ, bạn tạo bản mới. Nghe tốn kém nhưng nó xoá sổ cả một họ lỗi "ai đó đổi dữ liệu của tôi sau lưng" — và nó là cách làm chuẩn của Android hiện đại.\n\nGỌI THAM SỐ THEO TÊN. Khi gọi, ghi thẳng tên ô ra:\n    KhoanChi(ten = "Com trua", soTien = 45000, nhom = "an")\nSo với `KhoanChi("Com trua", 45000, "an")`, bản có tên đọc rõ hơn hẳn và không sợ đảo nhầm thứ tự hai tham số cùng kiểu.\n\nHUỶ CẤU TRÚC — lấy các ô ra thành biến rời:\n    val (ten, tien, nhom) = khoan\n\nGOM THÀNH DANH SÁCH. Có kiểu rồi thì nhiều khoản chi chỉ là một danh sách:\n    val so = listOf(\n        KhoanChi("Ca phe", 25000, "an"),\n        KhoanChi("Xe buyt", 7000, "di")\n    )\nVà vài phép tính bạn cần ngay:\n    so.sumOf { it.soTien }                    // cộng tất cả\n    so.filter { it.nhom == "an" }             // lọc ra nhóm ăn uống\n    so.count { it.soTien > 10000 }            // đếm\n    so.maxByOrNull { it.soTien }              // khoản đắt nhất\n    so.joinToString(", ") { it.ten }          // nối tên thành một chuỗi\n`it` là tên mặc định của phần tử đang xét — khỏi phải đặt tên khi lambda chỉ có một tham số. Unit sau sẽ đào sâu phần này; ở đây bạn chỉ cần dùng được.',
    workedExample: {
      code: `// Một dòng khai kiểu: ba ô, đều là val nên không sửa tại chỗ
data class KhoanChi(val ten: String, val soTien: Int, val nhom: String)

fun main() {
    val a = KhoanChi("Ca phe", 25000, "an")
    // toString() tự có nhờ chữ "data" — in ra đọc được ngay
    println(a)

    // == so theo NỘI DUNG: hai vật khác nhau nhưng cùng giá trị thì bằng nhau
    val b = KhoanChi("Ca phe", 25000, "an")
    println(a == b)

    // copy: bản mới đổi một ô, a không hề bị đổi
    val c = a.copy(soTien = 30000)
    println(c)
    println(a)

    // gọi theo TÊN tham số — đọc rõ, không sợ đảo nhầm thứ tự
    val d = KhoanChi(ten = "Com trua", soTien = 45000, nhom = "an")

    // huỷ cấu trúc: tách các ô ra thành biến rời
    val (ten, tien, nhom) = d
    println("$ten | $tien | $nhom")

    // có kiểu rồi thì nhiều khoản chi chỉ là một danh sách
    val so = listOf(a, KhoanChi("Xe buyt", 7000, "di"), d)
    println("Tong: \${so.sumOf { it.soTien }}")
    println("An uong: \${so.filter { it.nhom == "an" }.joinToString(", ") { it.ten }}")
    println("Dat nhat: \${so.maxByOrNull { it.soTien }}")
}`,
      stdinLines: [],
    },
    predict: {
      code: `data class KhoanChi(val ten: String, val soTien: Int)

fun main() {
    val a = KhoanChi("Ca phe", 25000)
    val b = a.copy(soTien = 30000)
    println(a.soTien)
    println(a == KhoanChi("Ca phe", 25000))
}`,
      question: 'Đoạn này in ra hai dòng nào?',
      choices: ['25000 rồi true', '30000 rồi true', '25000 rồi false', '30000 rồi false'],
      answerIndex: 0,
      explain:
        'copy() KHÔNG sửa a — nó tạo một vật mới là b, nên a.soTien vẫn là 25000. Và vì KhoanChi là data class, `==` so theo NỘI DUNG nên hai khoản cùng giá trị cho true. Nếu bỏ chữ `data` đi thì dòng hai sẽ in false, vì lớp thường so theo danh tính.',
    },
    parsons: {
      prompt: 'Xếp các dòng: khai kiểu KhoanChi, tạo hai khoản, rồi in tổng tiền.',
      lines: [
        'data class KhoanChi(val ten: String, val soTien: Int)',
        'fun main() {',
        '    val a = KhoanChi("Ca phe", 25000)',
        '    val b = KhoanChi("Xe buyt", 7000)',
        '    val so = listOf(a, b)',
        '    println(so.sumOf { it.soTien })',
        '}',
      ],
    },
    make: {
      prompt:
        'DỰ ÁN NHỎ CỦA UNIT — bản đầu tiên của Sổ chi tiêu.\n\n1. Khai `data class KhoanChi(val ten: String, val soTien: Int, val nhom: String)`\n\n2. Trong `main`, tạo danh sách ĐÚNG bốn khoản, theo thứ tự này:\n   ("Ca phe", 25000, "an") · ("Xe buyt", 7000, "di") · ("Com trua", 45000, "an") · ("Sach", 120000, "hoc")\n\n3. In ra đúng bốn dòng, theo mẫu:\nTong chi: 197000 dong\nAn uong: 70000 dong\nDat nhat: Sach\nSo khoan tren 20000: 3\n\nGợi ý: dùng sumOf, filter, maxByOrNull, count. Không cần vòng lặp nào cả.',
      starterCode: `data class KhoanChi(val ten: String, val soTien: Int, val nhom: String)

fun main() {
    val so = listOf(
        // 4 khoan chi theo dung thu tu trong de
    )

    // 1) Tong chi
    // 2) Rieng nhom "an"
    // 3) Ten khoan dat nhat
    // 4) Dem so khoan tren 20000
}`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Tong chi: 197000 dong',
          match: 'contains',
          hidden: false,
          label: 'tổng bốn khoản',
        },
        {
          stdinLines: [],
          expected: 'An uong: 70000 dong',
          match: 'contains',
          hidden: false,
          label: 'lọc nhóm "an" rồi cộng',
        },
        {
          stdinLines: [],
          expected: 'Dat nhat: Sach',
          match: 'contains',
          hidden: false,
          label: 'khoản có số tiền lớn nhất',
        },
        {
          stdinLines: [],
          expected: 'So khoan tren 20000: 3',
          match: 'contains',
          hidden: false,
          label: 'đếm khoản > 20000',
        },
      ],
      hints: [
        'Danh sách các khoản: val so = listOf(KhoanChi("Ca phe", 25000, "an"), ...). Mỗi phần tử là một lần gọi KhoanChi.',
        'Tổng: so.sumOf { it.soTien }. Riêng một nhóm thì lọc trước rồi mới cộng: so.filter { it.nhom == "an" }.sumOf { it.soTien }.',
        'Khoản đắt nhất: so.maxByOrNull { it.soTien } trả về CẢ khoản chi, nên muốn in mỗi tên thì lấy tiếp .ten — nhớ dùng ?. vì hàm này có thể trả null khi danh sách rỗng (unit sau đào sâu chỗ này).',
        'Đếm: so.count { it.soTien > 20000 }. Chú ý "trên 20000" là > chứ không phải >=, nhưng ở dữ liệu này hai cách cho cùng kết quả.',
        'Ghép vào chuỗi mẫu: println("Tong chi: ${so.sumOf { it.soTien }} dong").',
      ],
      sampleSolution: `data class KhoanChi(val ten: String, val soTien: Int, val nhom: String)

fun main() {
    val so = listOf(
        KhoanChi("Ca phe", 25000, "an"),
        KhoanChi("Xe buyt", 7000, "di"),
        KhoanChi("Com trua", 45000, "an"),
        KhoanChi("Sach", 120000, "hoc")
    )

    println("Tong chi: \${so.sumOf { it.soTien }} dong")
    println("An uong: \${so.filter { it.nhom == "an" }.sumOf { it.soTien }} dong")
    println("Dat nhat: \${so.maxByOrNull { it.soTien }?.ten}")
    println("So khoan tren 20000: \${so.count { it.soTien > 20000 }}")
}`,
    },
    homework:
      'LÀN C — trên máy thật. Chép Sổ chi tiêu vừa viết sang một file .kt và chạy bằng Kotlin thật, rồi làm hai thí nghiệm: (1) bỏ chữ `data` ở đầu khai báo lớp — `println(a)` sẽ in ra một mã băm khó đọc và `a == b` thành false; đó chính là ba món mà `data` tặng bạn. (2) Thêm ô ngày tháng vào KhoanChi và thử nhóm chi tiêu theo tháng. Ở unit sau, Sổ chi tiêu này sẽ học cách xử lý dữ liệu THIẾU (khoản chưa ghi nhóm) — phần null safety làm nên tên tuổi Kotlin.',
    srsCards: [
      {
        hoi: 'Chữ `data` trong `data class` cho bạn thêm những gì?',
        dap: 'Ba thứ tự sinh: toString() đọc được, == so theo NỘI DUNG (không phải danh tính), và copy() tạo bản mới đổi vài ô.',
      },
      {
        hoi: 'Kotlin: a.copy(soTien = 30000) có làm đổi a không?',
        dap: 'Không. copy() tạo một vật MỚI, a giữ nguyên. Đó là lý do các ô khai bằng val: sửa dữ liệu = tạo bản mới, không sửa tại chỗ.',
      },
      {
        hoi: 'Hai vật cùng giá trị: `==` cho true hay false?',
        dap: 'data class → true (so nội dung). Lớp THƯỜNG → false (so danh tính, tức có phải cùng một vật không). Đây là bẫy kinh điển.',
      },
    ],
  },
]
