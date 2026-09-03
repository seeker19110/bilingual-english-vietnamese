// lessons/p6u6.ts — Bài học P6-U6: NULL SAFETY + COLLECTIONS (PR-M9).
//
// Chặng 2/3 của track Kotlin (chương trình M). Sản phẩm trục "Sổ chi tiêu" từ u5 nay gặp DỮ
// LIỆU THẬT: khoản chi chưa kịp xếp nhóm, số tiền gõ sai, ghi chú bỏ trống.
//
// LUẬT TỰ KHAI §3.3 — điểm phải nói ra ở unit này (luật 5), tra bảng KHAC_BIET:
//   · "Tính null của biến" — bộ chạy theo dõi theo KIỂU KHAI BÁO, Y HỆT Kotlin thật. Đây là
//     chỗ bộ chạy cố ý bám sát nhất, và bài l1 nói rõ điều đó (tin được, không phải xấp xỉ).
//   · "Phạm vi smart cast" — bộ chạy HẸP HƠN Kotlin thật: chỉ suy từ `x != null`/`x == null`
//     (kèm `&&`) và `is Kieu` trong `when`. Bài l1 nói ra, và mọi mẫu ngoài phạm vi đó trong
//     unit này đều viết `?:`/`!!` tường minh.
//   · "Thứ tự duyệt Map" — bộ chạy sắp theo KHOÁ, Kotlin thật giữ thứ tự chèn. Bài l2 dùng
//     groupBy nên PHẢI nói ra, và tuyệt đối không bài nào dạy rằng Map giữ thứ tự chèn.
//
// RÀNG BUỘC KỸ THUẬT (đã dò bằng chayKotlin, không suy đoán): bộ chạy KHÔNG có `let`, KHÔNG có
// `mapNotNull`. Có `filterNotNull`, `groupBy`, `toIntOrNull`, `sumOf`, `sortedByDescending`.
// Không có stdin (`readLine`) nên dữ liệu nằm trong hằng của đề.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U6_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u6-l1',
    unitId: 'p6-u6',
    language: 'kotlin',
    title: 'Null safety — thứ làm nên tên tuổi Kotlin',
    hook: 'Sổ chi tiêu của bạn chạy ngon cho tới hôm bạn ghi vội một khoản mà quên xếp nhóm. Ở phần lớn ngôn ngữ, ô trống đó sẽ làm chương trình chết giữa chừng vào lúc bạn ít ngờ nhất. Kotlin chọn cách khác: bắt bạn xử lý ô trống NGAY LÚC VIẾT.',
    theory:
      'BÀI TOÁN TỶ ĐÔ. Người phát minh ra tham chiếu null gọi nó là "sai lầm tỷ đô của tôi" — vì hàng chục năm qua nó là nguyên nhân số một làm phần mềm sập. Vấn đề không phải bản thân giá trị rỗng, mà là ngôn ngữ CHO PHÉP bạn quên mất nó có thể rỗng.\n\nKotlin chia kiểu làm hai nửa:\n    val a: String  = "Lan"   // KHÔNG BAO GIỜ null — bảo đảm\n    val b: String? = null    // CÓ THỂ null — dấu ? là lời cảnh báo\n\nDấu `?` không phải trang trí. Với `b: String?`, viết `b.length` là LỖI, và đây là điểm mấu chốt: **lỗi vì KIỂU KHAI BÁO là "có thể null", chứ không phải vì giá trị lúc đó đang null**. Kể cả khi bạn vừa gán `b = "Lan"` ở dòng trên, `b.length` vẫn bị chặn. Nghe khắt khe, nhưng chính sự khắt khe đó mới đáng giá: nó bắt lỗi ở mọi đường đi của chương trình, không chỉ đường bạn đang thử.\n\nĐây là chỗ bộ chạy của bài học **bám sát Kotlin thật nhất** — tính null theo kiểu khai báo hoạt động y hệt. Bạn học được ở đây cái gì thì mang sang máy thật dùng được cái đó.\n\nBA CÁCH XỬ LÝ, dùng đúng chỗ:\n\n1. `?.` — GỌI AN TOÀN. Null thì cả biểu thức thành null, không nổ:\n        b?.length      // null nếu b null, ngược lại là độ dài\n2. `?:` — TOÁN TỬ ELVIS (nghiêng đầu nhìn giống mái tóc Elvis). Thay giá trị khi null:\n        b?.length ?: 0            // null thì lấy 0\n        khoan.nhom ?: "chua xep"  // rất hay dùng cho ô bỏ trống\n3. `!!` — KHẲNG ĐỊNH. "Tôi chắc chắn khác null, sai thì cho dừng":\n        b!!.length\n   **Dùng `!!` là bạn đang đánh cược.** Sai thì chương trình dừng ngay tại đó. Luật thực hành: mỗi lần định gõ `!!`, hỏi lại "mình có thật sự chắc không, hay chỉ đang muốn cho qua?" — gần như luôn có cách viết bằng `?:` tử tế hơn.\n\nSMART CAST — phần thưởng cho việc kiểm tra tử tế. Kiểm null xong thì Kotlin TỰ HIỂU từ đó trở đi nó khác null, khỏi cần `?.`:\n        if (ten != null) {\n            println(ten.length)   // không cần ?. nữa\n        }\n\n⚠️ KHÁC BIỆT PHẢI BIẾT: bộ chạy trong bài suy ra smart cast HẸP HƠN Kotlin thật — chỉ từ `x != null` / `x == null` (kể cả nối bằng `&&`) và từ `is Kieu` trong `when`. Kotlin thật suy rộng hơn (ví dụ sau một câu `return` ở nhánh trước). Nên trong khoá này, mẫu nào nằm ngoài hai dạng trên thì cứ viết `?.` hoặc `?:` cho tường minh — vừa chạy đúng ở đây, vừa là lối viết rõ ràng trên máy thật.\n\nCUỐI CÙNG, `toIntOrNull()`. Đổi chuỗi sang số mà chuỗi hỏng thì trả null thay vì nổ:\n        "12".toIntOrNull()   // 12\n        "abc".toIntOrNull()  // null\n        "abc".toIntOrNull() ?: 0\nĐây là mẫu chuẩn khi nhận dữ liệu người dùng gõ vào — và nó cho thấy triết lý của Kotlin: chỗ nào có thể hỏng thì kiểu dữ liệu NÓI RA, không giấu.',
    workedExample: {
      code: `fun main() {
    // Hai nửa của hệ kiểu: chắc chắn có, và có thể rỗng
    val chac: String = "Lan"
    val cothe: String? = null

    println(chac.length)      // dùng thẳng được, kiểu bảo đảm khác null

    // ?. gọi an toàn — null thì cả biểu thức thành null, không nổ
    println(cothe?.length)

    // ?: elvis — thay giá trị khi null
    println(cothe?.length ?: 0)
    println(cothe ?: "(chua ghi)")

    // smart cast: kiểm xong thì khỏi cần ?. nữa
    val ten: String? = "Minh"
    if (ten != null) {
        println("Chao \${ten}, ten dai \${ten.length} ky tu")
    }

    // toIntOrNull: chuỗi hỏng thì trả null thay vì làm sập chương trình
    println("12".toIntOrNull())
    println("mot hai".toIntOrNull())
    println("mot hai".toIntOrNull() ?: -1)
}`,
      stdinLines: [],
    },
    predict: {
      code: `fun main() {
    val nhom: String? = null
    val ten: String? = "Sach"
    println(nhom ?: "chua xep")
    println(ten?.length ?: 0)
}`,
      question: 'Đoạn này in ra hai dòng nào?',
      choices: ['chua xep rồi 4', 'null rồi 4', 'chua xep rồi 0', 'Lỗi vì nhom đang null'],
      answerIndex: 0,
      explain:
        'Dòng một: `nhom` đang null nên `?:` thay bằng "chua xep". Dòng hai: `ten` KHÔNG null nên `ten?.length` cho 4, `?:` không phải ra tay. Điểm cần nhớ: `?:` chỉ nhảy vào khi vế trái là null — nó không "luôn luôn thay thế".',
    },
    parsons: {
      prompt: 'Xếp các dòng: in nhóm của khoản chi, nếu chưa xếp nhóm thì in chữ thay thế.',
      lines: [
        'fun main() {',
        '    val nhom: String? = null',
        '    println(nhom ?: "chua xep nhom")',
        '    val ghiChu: String? = "mua tang ban"',
        '    println(ghiChu?.length ?: 0)',
        '}',
      ],
    },
    make: {
      prompt:
        'Dọn một khoản chi ghi vội.\n\nCho sẵn ba giá trị (khai đúng như vậy, ĐỪNG đổi kiểu):\n    val ten: String? = "Ca phe"\n    val nhom: String? = null\n    val soTienGo: String = "25k"\n\nIn đúng ba dòng:\n1. Tên khoản chi, chưa ghi thì thay bằng chữ `(chua dat ten)`\n   → mẫu: Ten: Ca phe\n2. Nhóm, chưa xếp thì thay bằng chữ `chua xep nhom`\n   → mẫu: Nhom: chua xep nhom\n3. Số tiền đổi từ chuỗi sang số; đổi KHÔNG được thì lấy 0\n   → mẫu: So tien: 0\n\n(Chuỗi "25k" cố tình gõ sai — `toIntOrNull()` sẽ trả null, và đó chính là điều bài này muốn bạn xử lý.)',
      starterCode: `fun main() {
    val ten: String? = "Ca phe"
    val nhom: String? = null
    val soTienGo: String = "25k"

    // 1. Ten: ...   (thay "(chua dat ten)" khi null)
    // 2. Nhom: ...  (thay "chua xep nhom" khi null)
    // 3. So tien: ... (toIntOrNull, hong thi 0)
}`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Ten: Ca phe',
          match: 'contains',
          hidden: false,
          label: 'ten khác null → giữ nguyên',
        },
        {
          stdinLines: [],
          expected: 'Nhom: chua xep nhom',
          match: 'contains',
          hidden: false,
          label: 'nhom null → dùng chữ thay thế',
        },
        {
          stdinLines: [],
          expected: 'So tien: 0',
          match: 'contains',
          hidden: false,
          label: '"25k" đổi số hỏng → 0',
        },
      ],
      hints: [
        'Thay giá trị khi null là việc của toán tử elvis `?:`. Ví dụ: `nhom ?: "chua xep nhom"`.',
        'Đổi chuỗi sang số an toàn: `soTienGo.toIntOrNull()` — trả null khi chuỗi không phải số nguyên, nên ghép luôn `?: 0`.',
        'Đừng dùng `!!` ở bài này: `nhom` chắc chắn đang null nên `!!` sẽ làm chương trình dừng lại, đúng như nó được thiết kế.',
        'Ghép vào chuỗi mẫu, nhớ bọc `${...}` khi bên trong có toán tử: println("Nhom: ${nhom ?: "chua xep nhom"}").',
      ],
      sampleSolution: `fun main() {
    val ten: String? = "Ca phe"
    val nhom: String? = null
    val soTienGo: String = "25k"

    println("Ten: \${ten ?: "(chua dat ten)"}")
    println("Nhom: \${nhom ?: "chua xep nhom"}")
    println("So tien: \${soTienGo.toIntOrNull() ?: 0}")
}`,
    },
    homework:
      'LÀN C — trên máy thật, không chấm ở đây. Chép bài Make sang một file .kt rồi chạy bằng Kotlin thật. Sau đó làm hai thí nghiệm: (1) đổi `println("Nhom: ${nhom ?: "chua xep nhom"}")` thành `println("Nhom: ${nhom.length}")` — trình biên dịch sẽ CHẶN NGAY, kèm câu đại ý "chỉ được gọi trên kiểu String?, hãy dùng ?. hoặc !!"; ghi lại nguyên văn. (2) Thử `nhom!!.length` — lần này nó DỊCH ĐƯỢC nhưng sập lúc chạy với NullPointerException. Hai thí nghiệm này cho thấy đúng cái giá của `!!`: nó chuyển một lỗi mà máy bắt hộ được thành một lỗi chỉ người dùng cuối mới gặp.',
    srsCards: [
      {
        hoi: 'Vì sao Kotlin chặn `b.length` khi b khai kiểu có thể null, dù b đang giữ chuỗi thật?',
        dap: 'Vì Kotlin xét KIỂU KHAI BÁO (String? = có thể null), không xét giá trị lúc đó. Nhờ vậy lỗi bị bắt trên mọi đường đi của chương trình, không chỉ đường đang chạy thử.',
      },
      {
        hoi: 'Gọi an toàn và toán tử elvis của Kotlin khác nhau thế nào?',
        dap: '`?.` gọi an toàn — null thì cả biểu thức thành null. `?:` (elvis) thay bằng giá trị khác KHI vế trái null. Hay đi cùng nhau: `b?.length ?: 0`.',
      },
      {
        hoi: 'Khi nào KHÔNG nên dùng `!!` trong Kotlin?',
        dap: 'Gần như luôn luôn. `!!` biến lỗi máy bắt được lúc biên dịch thành lỗi sập lúc chạy. Chỉ dùng khi thật sự chắc chắn; còn lại viết `?:` hoặc `?.`.',
      },
      {
        hoi: '`"abc".toIntOrNull()` trả về gì?',
        dap: 'null — vì "abc" không phải số nguyên. Đây là mẫu chuẩn để nhận dữ liệu người dùng gõ: ghép `?: 0` để có giá trị dự phòng thay vì làm sập chương trình.',
      },
    ],
  },
  {
    id: 'p6-u6-l2',
    unitId: 'p6-u6',
    language: 'kotlin',
    title: 'Lambda và collections — hỏi câu hỏi về cả sổ chi tiêu',
    hook: 'Một khoản chi thì nhìn là biết. Hai trăm khoản thì phải BIẾT HỎI: nhóm nào ngốn nhất, tháng này có khoản nào bất thường không, những khoản chưa xếp nhóm chiếm bao nhiêu. Kotlin trả lời mấy câu đó bằng một dòng mỗi câu.',
    theory:
      'LAMBDA — một mẩu việc đem đi gửi. Viết trong ngoặc nhọn, và khi chỉ có MỘT tham số thì Kotlin đặt tên sẵn cho nó là `it`:\n    ds.filter { it.soTien > 50000 }\nĐọc thành lời: "lọc lấy những phần tử mà số tiền lớn hơn 50000". Không có vòng lặp nào, không có biến đếm, không có chỗ để viết sai chỉ số.\n\nBỘ CÂU HỎI DÙNG HẰNG NGÀY (đều nhận một lambda):\n    ds.filter { ... }              // giữ lại phần tử thoả điều kiện\n    ds.map { ... }                 // biến mỗi phần tử thành thứ khác\n    ds.sumOf { it.soTien }         // cộng dồn một ô\n    ds.count { ... }               // đếm\n    ds.any { ... } / ds.none { ... }   // có cái nào không / không có cái nào\n    ds.maxByOrNull { it.soTien }   // phần tử lớn nhất\n    ds.sortedByDescending { ... }  // sắp giảm dần\n    ds.groupBy { it.nhom }         // gom thành Map: khoá → danh sách\n\nCHÚ Ý CÁI ĐUÔI `OrNull`. `maxByOrNull` trả về **kiểu có thể null**, vì danh sách rỗng thì làm gì có phần tử lớn nhất. Đây chính là bài trước quay lại: kiểu dữ liệu NÓI RA chỗ có thể rỗng, và bạn phải xử lý:\n    ds.maxByOrNull { it.soTien }?.ten ?: "(so trong)"\nMột ngôn ngữ không có null safety sẽ vui vẻ trả về thứ gì đó rồi làm bạn sập ở dòng sau.\n\nNỐI CHUỖI PHÉP TÍNH. Sức mạnh thật nằm ở chỗ ghép chúng lại, đọc từ trái sang phải như một câu:\n    ds.filter { it.nhom == "an" }.sumOf { it.soTien }\n    // "lấy nhóm ăn uống, rồi cộng số tiền lại"\n\nDỮ LIỆU THẬT THÌ CÓ Ô TRỐNG. Sổ chi tiêu thật sẽ có khoản chưa xếp nhóm (`nhom: String?`). Hai cách xử lý, chọn theo ý định:\n    ds.filter { it.nhom != null }        // bỏ qua khoản chưa xếp\n    ds.map { it.nhom ?: "chua xep" }     // gom chúng thành một nhóm riêng\nCách hai thường đúng hơn về mặt nghiệp vụ: khoản chưa xếp nhóm vẫn là tiền bạn đã tiêu, giấu đi thì tổng bị sai.\n\nCòn `ds.filterNotNull()` dùng khi cả PHẦN TỬ có thể null (`List<String?>`), khác với trường hợp trên là phần tử chắc chắn có nhưng một Ô BÊN TRONG nó có thể null.\n\n⚠️ KHÁC BIỆT PHẢI BIẾT — `groupBy` trả về một Map, và **bộ chạy trong bài duyệt Map theo THỨ TỰ KHOÁ (a → z)**, trong khi Kotlin thật giữ THỨ TỰ CHÈN. Nên đừng bao giờ dựa vào thứ tự chèn của Map, dù ở đây hay trên máy thật — muốn thứ tự nào thì nói ra bằng `sortedBy`. Đây là luật viết code tốt, không chỉ là chuyện của bộ chạy này.',
    workedExample: {
      code: `data class KhoanChi(val ten: String, val soTien: Int, val nhom: String?)

fun main() {
    val so = listOf(
        KhoanChi("Ca phe", 25000, "an"),
        KhoanChi("Xe buyt", 7000, "di"),
        KhoanChi("Com trua", 45000, "an"),
        KhoanChi("Sach", 120000, null)   // ghi vội, chưa xếp nhóm
    )

    // lambda một tham số: Kotlin đặt tên sẵn là "it"
    println(so.filter { it.soTien > 20000 }.map { it.ten })

    // nối phép tính, đọc từ trái sang như một câu
    println(so.filter { it.nhom == "an" }.sumOf { it.soTien })

    // đuôi OrNull: danh sách rỗng thì không có max, nên kiểu trả về CÓ THỂ null
    println(so.maxByOrNull { it.soTien }?.ten ?: "(so trong)")

    // ô nhom có thể null: gom thành nhóm riêng thay vì giấu đi
    val theoNhom = so.groupBy { it.nhom ?: "chua xep" }
    // Map ở bộ chạy này duyệt theo THỨ TỰ KHOÁ, không phải thứ tự chèn
    for ((nhom, ds) in theoNhom) {
        println("$nhom: \${ds.size} khoan, \${ds.sumOf { it.soTien }} dong")
    }

    println(so.count { it.nhom == null })
    println(so.any { it.soTien > 100000 })
}`,
      stdinLines: [],
    },
    predict: {
      code: `data class K(val ten: String, val soTien: Int)

fun main() {
    val so = listOf(K("a", 10000), K("b", 30000))
    println(so.filter { it.soTien > 50000 }.sumOf { it.soTien })
    println(so.filter { it.soTien > 50000 }.maxByOrNull { it.soTien }?.ten ?: "khong co")
}`,
      question: 'Đoạn này in ra hai dòng nào?',
      choices: ['0 rồi khong co', '0 rồi null', '40000 rồi b', 'Lỗi vì danh sách sau filter rỗng'],
      answerIndex: 0,
      explain:
        'Không khoản nào trên 50000 nên `filter` cho danh sách RỖNG. `sumOf` trên danh sách rỗng là 0 (hợp lý: chưa cộng gì thì bằng 0). `maxByOrNull` trên danh sách rỗng trả null — đó chính là lý do nó có đuôi OrNull — nên `?:` nhảy vào và in "khong co". Danh sách rỗng là ca biên phải luôn nghĩ tới, và Kotlin buộc bạn nghĩ tới bằng chính kiểu trả về.',
    },
    parsons: {
      prompt: 'Xếp các dòng: tính tổng tiền của riêng nhóm "an" trong sổ chi tiêu.',
      lines: [
        'data class KhoanChi(val ten: String, val soTien: Int, val nhom: String?)',
        'fun main() {',
        '    val so = listOf(',
        '        KhoanChi("Ca phe", 25000, "an"),',
        '        KhoanChi("Sach", 120000, null)',
        '    )',
        '    println(so.filter { it.nhom == "an" }.sumOf { it.soTien })',
        '}',
      ],
    },
    make: {
      prompt:
        'Trả lời ba câu hỏi về sổ chi tiêu — mỗi câu một dòng, KHÔNG dùng vòng lặp.\n\nKhai `data class KhoanChi(val ten: String, val soTien: Int, val nhom: String?)` rồi tạo đúng danh sách này:\n    ("Ca phe", 25000, "an") · ("Xe buyt", 7000, "di") · ("Com trua", 45000, "an") · ("Sach", 120000, null)\n\nIn đúng ba dòng:\nChua xep nhom: 1 khoan\nDat nhat: Sach\nNhom an: 70000 dong\n\nDòng 2 phải chịu được cả trường hợp sổ rỗng: nếu không có khoản nào thì in `Dat nhat: (so trong)` (dữ liệu trên thì luôn ra Sach, nhưng cách viết phải đúng).',
      starterCode: `data class KhoanChi(val ten: String, val soTien: Int, val nhom: String?)

fun main() {
    val so = listOf(
        // 4 khoan theo dung de
    )

    // 1) dem so khoan chua xep nhom
    // 2) ten khoan dat nhat, so rong thi "(so trong)"
    // 3) tong tien rieng nhom "an"
}`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Chua xep nhom: 1 khoan',
          match: 'contains',
          hidden: false,
          label: 'đếm khoản có nhom == null',
        },
        {
          stdinLines: [],
          expected: 'Dat nhat: Sach',
          match: 'contains',
          hidden: false,
          label: 'maxByOrNull + xử lý null',
        },
        {
          stdinLines: [],
          expected: 'Nhom an: 70000 dong',
          match: 'contains',
          hidden: false,
          label: 'lọc nhóm "an" rồi cộng',
        },
      ],
      hints: [
        'Đếm theo điều kiện: `so.count { it.nhom == null }`. Chú ý so sánh với null bằng `==`, không phải `!= null`.',
        'Khoản đắt nhất: `so.maxByOrNull { it.soTien }` trả về kiểu CÓ THỂ null (sổ rỗng thì không có max), nên phải `?.ten ?: "(so trong)"`.',
        'Lọc rồi cộng là nối hai phép: `so.filter { it.nhom == "an" }.sumOf { it.soTien }`.',
        'Nhớ bọc `${...}` trong chuỗi mẫu khi bên trong có lời gọi hàm.',
      ],
      sampleSolution: `data class KhoanChi(val ten: String, val soTien: Int, val nhom: String?)

fun main() {
    val so = listOf(
        KhoanChi("Ca phe", 25000, "an"),
        KhoanChi("Xe buyt", 7000, "di"),
        KhoanChi("Com trua", 45000, "an"),
        KhoanChi("Sach", 120000, null)
    )

    println("Chua xep nhom: \${so.count { it.nhom == null }} khoan")
    println("Dat nhat: \${so.maxByOrNull { it.soTien }?.ten ?: "(so trong)"}")
    println("Nhom an: \${so.filter { it.nhom == "an" }.sumOf { it.soTien }} dong")
}`,
    },
    homework:
      'LÀN C — trên máy thật. Chép bài Make sang file .kt và chạy bằng Kotlin thật, rồi thử hai việc. (1) Đổi danh sách thành rỗng (`listOf()`) và chạy lại: dòng "Dat nhat" phải ra `(so trong)` chứ không được sập — nếu bạn lỡ viết `!!` thay cho `?:` thì đây là lúc nó phản chủ. (2) Thêm `println(so.groupBy { it.nhom ?: "chua xep" })` rồi so thứ tự các nhóm in ra với thứ tự bạn thấy trong bài: Kotlin thật giữ THỨ TỰ CHÈN, bộ chạy trong bài sắp theo khoá. Bài học rút ra dùng được cả đời: đừng bao giờ để code phụ thuộc vào thứ tự của Map.',
    srsCards: [
      {
        hoi: 'Trong lambda một tham số của Kotlin, `it` là gì?',
        dap: 'Tên mặc định Kotlin đặt sẵn cho tham số duy nhất, khỏi phải tự đặt. Ví dụ `ds.filter { it.soTien > 100 }` — `it` là phần tử đang xét.',
      },
      {
        hoi: 'Vì sao `maxByOrNull` có đuôi OrNull?',
        dap: 'Vì danh sách RỖNG thì không có phần tử lớn nhất, nên kiểu trả về là có thể null. Buộc người viết xử lý ca biên đó bằng `?.` / `?:` thay vì sập lúc chạy.',
      },
      {
        hoi: 'Sổ có khoản `nhom` null: nên lọc bỏ hay gom thành nhóm riêng?',
        dap: 'Thường nên gom thành nhóm riêng (`it.nhom ?: "chua xep"`) — khoản chưa xếp nhóm vẫn là tiền đã tiêu, lọc bỏ đi thì tổng bị sai.',
      },
      {
        hoi: 'Có được dựa vào thứ tự duyệt của Map trong Kotlin không?',
        dap: 'Không nên. Kotlin thật giữ thứ tự chèn còn bộ chạy của bài sắp theo khoá — muốn thứ tự nào thì nói ra bằng `sortedBy`, đừng phụ thuộc mặc định.',
      },
    ],
  },
]
