// swiftSim/conformance — BỘ CA ĐỐI CHIẾU của bộ chạy Swift (PR-M3, hiến chương M §3.4).
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
// Môi trường soạn PR này KHÔNG có Swift (`swift`/`swiftc` không có sẵn, và proxy chặn tải từ
// swift.org — đã thử, trả 403). Nên phần đó CHƯA làm được ở đây, và tuyệt đối không được vờ
// như đã làm. Cách xử lý:
//
//   · Mỗi ca có trường `nguon` ghi rõ căn cứ của kết quả kỳ vọng (mục nào của tài liệu ngôn
//     ngữ Swift), và `daDoiChieu` = false cho tới khi có người chạy thật.
//   · `npm run swift:conformance` sinh ra file .swift chứa ĐÚNG các ca này, chạy bằng `swift`
//     nếu máy có, rồi so từng dòng và báo lệch. Người dùng chạy MỘT lệnh trên máy có Xcode là
//     xong, kết quả ghi ngược lại vào đây.
//   · Cổng cứng của hiến chương §8 (interpreter phải qua bộ đối chiếu TRƯỚC khi soạn nội dung)
//     vì vậy CHƯA đóng: PR-M4 không được bắt đầu trước khi việc chạy thật này xong.
//
// Ghi thẳng ra như vậy để phiên sau không tưởng nhầm là đã đối chiếu xong.

export interface CaDoiChieu {
  ma: string
  /** Tính năng cú pháp mà ca này canh — mỗi tính năng phải có ít nhất một ca. */
  tinhNang: string
  code: string
  /** Output kỳ vọng, ĐÚNG từng ký tự (đã bỏ dòng tự khai của bộ chạy). */
  ky: string
  /** Căn cứ của kết quả kỳ vọng. */
  nguon: string
  /** Đã chạy trên trình biên dịch Swift thật chưa — xem ghi chú đầu file. */
  daDoiChieu: boolean
}

/** Nguồn dùng nhiều lần — TSPL = The Swift Programming Language (docs.swift.org). */
const TSPL = (muc: string): string => `TSPL — ${muc}`

export const CA_DOI_CHIEU: CaDoiChieu[] = [
  {
    ma: 'C01',
    tinhNang: 'let/var, suy kiểu, in ra',
    code: `let ten = "Lan"
var tuoi = 20
tuoi = tuoi + 1
print(ten)
print(tuoi)`,
    ky: 'Lan\n21\n',
    nguon: TSPL('The Basics — Constants and Variables'),
    daDoiChieu: false,
  },
  {
    ma: 'C02',
    tinhNang: 'Chia số nguyên cắt phần thập phân',
    code: `print(7 / 2)
print(7 % 2)`,
    ky: '3\n1\n',
    nguon: TSPL('Basic Operators — Arithmetic Operators (Int division truncates)'),
    daDoiChieu: false,
  },
  {
    ma: 'C03',
    tinhNang: 'Double in ra kèm .0 khi là số tròn',
    code: `let a = 3.0
let b = 7.0 / 2.0
print(a)
print(b)`,
    ky: '3.0\n3.5\n',
    nguon: TSPL('The Basics — Floating-Point Numbers; mô tả in của Double'),
    daDoiChieu: false,
  },
  {
    ma: 'C04',
    tinhNang: 'Nội suy chuỗi \\(…)',
    code: `let ten = "Lan"
let tuoi = 20
print("Toi la \\(ten), \\(tuoi) tuoi")`,
    ky: 'Toi la Lan, 20 tuoi\n',
    nguon: TSPL('Strings and Characters — String Interpolation'),
    daDoiChieu: false,
  },
  {
    ma: 'C05',
    tinhNang: 'Optional: in ra dạng Optional(…) và nil',
    code: `var ten: String? = "Lan"
print(ten)
ten = nil
print(ten)`,
    ky: 'Optional("Lan")\nnil\n',
    nguon: TSPL('The Basics — Optionals; print của Optional dùng phản chiếu'),
    daDoiChieu: false,
  },
  {
    ma: 'C06',
    tinhNang: 'if let mở gói',
    code: `let so: Int? = 5
if let s = so {
    print(s + 1)
} else {
    print("khong co")
}`,
    ky: '6\n',
    nguon: TSPL('The Basics — Optional Binding'),
    daDoiChieu: false,
  },
  {
    ma: 'C07',
    tinhNang: 'Toán tử ?? (nil-coalescing)',
    code: `let ten: String? = nil
print(ten ?? "khach")`,
    ky: 'khach\n',
    nguon: TSPL('Basic Operators — Nil-Coalescing Operator'),
    daDoiChieu: false,
  },
  {
    ma: 'C08',
    tinhNang: 'Int(String) trả Optional',
    code: `print(Int("42"))
print(Int("abc"))`,
    ky: 'Optional(42)\nnil\n',
    nguon: TSPL('The Basics — Optionals (ví dụ Int(possibleNumber))'),
    daDoiChieu: false,
  },
  {
    ma: 'C09',
    tinhNang: 'guard let',
    code: `func chao(_ ten: String?) {
    guard let t = ten else {
        print("thieu ten")
        return
    }
    print("Chao \\(t)")
}
chao("Lan")
chao(nil)`,
    ky: 'Chao Lan\nthieu ten\n',
    nguon: TSPL('Control Flow — Early Exit'),
    daDoiChieu: false,
  },
  {
    ma: 'C10',
    tinhNang: 'Chuỗi tuỳ chọn ?.',
    code: `struct Nguoi { var ten: String }
let a: Nguoi? = Nguoi(ten: "Lan")
let b: Nguoi? = nil
print(a?.ten)
print(b?.ten)`,
    ky: 'Optional("Lan")\nnil\n',
    nguon: TSPL('Optional Chaining'),
    daDoiChieu: false,
  },
  {
    ma: 'C11',
    tinhNang: 'if / else if / else',
    code: `let diem = 7
if diem >= 8 {
    print("gioi")
} else if diem >= 5 {
    print("dat")
} else {
    print("chua dat")
}`,
    ky: 'dat\n',
    nguon: TSPL('Control Flow — Conditional Statements'),
    daDoiChieu: false,
  },
  {
    ma: 'C12',
    tinhNang: 'for-in trên khoảng đóng và nửa mở',
    code: `for i in 1...3 {
    print(i)
}
for i in 0..<2 {
    print(i)
}`,
    ky: '1\n2\n3\n0\n1\n',
    nguon: TSPL('Basic Operators — Range Operators'),
    daDoiChieu: false,
  },
  {
    ma: 'C13',
    tinhNang: 'while và repeat-while',
    code: `var n = 0
while n < 2 {
    n += 1
}
print(n)
repeat {
    n += 1
} while n < 4
print(n)`,
    ky: '2\n4\n',
    nguon: TSPL('Control Flow — While Loops'),
    daDoiChieu: false,
  },
  {
    ma: 'C14',
    tinhNang: 'switch không rơi tầng, có default',
    code: `let x = 2
switch x {
case 1:
    print("mot")
case 2:
    print("hai")
default:
    print("khac")
}`,
    ky: 'hai\n',
    nguon: TSPL('Control Flow — Switch (no implicit fallthrough)'),
    daDoiChieu: false,
  },
  {
    ma: 'C15',
    tinhNang: 'Hàm có nhãn tham số và giá trị mặc định',
    code: `func chao(ten: String, lan: Int = 1) -> String {
    var ra = ""
    for _ in 1...lan {
        ra += "Chao \\(ten)! "
    }
    return ra
}
print(chao(ten: "Lan"))
print(chao(ten: "Hoa", lan: 2))`,
    ky: 'Chao Lan! \nChao Hoa! Chao Hoa! \n',
    nguon: TSPL('Functions — Argument Labels and Default Parameter Values'),
    daDoiChieu: false,
  },
  {
    ma: 'C16',
    tinhNang: 'Nhãn ngoài `_` (gọi không cần nhãn)',
    code: `func binhPhuong(_ x: Int) -> Int {
    return x * x
}
print(binhPhuong(4))`,
    ky: '16\n',
    nguon: TSPL('Functions — Omitting Argument Labels'),
    daDoiChieu: false,
  },
  {
    ma: 'C17',
    tinhNang: 'struct là KIỂU GIÁ TRỊ (gán là chép)',
    code: `struct Diem {
    var x: Int
    var y: Int
}
var a = Diem(x: 1, y: 2)
var b = a
b.x = 99
print(a.x)
print(b.x)`,
    ky: '1\n99\n',
    nguon: TSPL('Structures and Classes — Structures and Enumerations Are Value Types'),
    daDoiChieu: false,
  },
  {
    ma: 'C18',
    tinhNang: 'class là KIỂU THAM CHIẾU (gán là dùng chung)',
    code: `class Hop {
    var n: Int
    init(n: Int) {
        self.n = n
    }
}
let h1 = Hop(n: 1)
let h2 = h1
h2.n = 99
print(h1.n)
print(h2.n)`,
    ky: '99\n99\n',
    nguon: TSPL('Structures and Classes — Classes Are Reference Types'),
    daDoiChieu: false,
  },
  {
    ma: 'C19',
    tinhNang: 'Khởi tạo theo thành viên của struct',
    code: `struct Sach {
    var ten: String
    var gia: Int
}
let s = Sach(ten: "Doraemon", gia: 25000)
print(s.ten)
print(s.gia)`,
    ky: 'Doraemon\n25000\n',
    nguon: TSPL('Initialization — Memberwise Initializers for Structure Types'),
    daDoiChieu: false,
  },
  {
    ma: 'C20',
    tinhNang: 'mutating func đổi được thuộc tính của struct',
    code: `struct Dem {
    var so = 0
    mutating func tang() {
        so += 1
    }
}
var d = Dem()
d.tang()
d.tang()
print(d.so)`,
    ky: '2\n',
    nguon: TSPL('Methods — Modifying Value Types from Within Instance Methods'),
    daDoiChieu: false,
  },
  {
    ma: 'C21',
    tinhNang: 'Thuộc tính tính (computed property)',
    code: `struct HinhChuNhat {
    var rong: Int
    var cao: Int
    var dienTich: Int {
        return rong * cao
    }
}
let h = HinhChuNhat(rong: 3, cao: 4)
print(h.dienTich)`,
    ky: '12\n',
    nguon: TSPL('Properties — Computed Properties'),
    daDoiChieu: false,
  },
  {
    ma: 'C22',
    tinhNang: 'enum + switch trên enum',
    code: `enum Huong {
    case bac
    case nam
}
let h = Huong.nam
switch h {
case .bac:
    print("len")
case .nam:
    print("xuong")
}`,
    ky: 'xuong\n',
    nguon: TSPL('Enumerations — Matching Enumeration Values with a Switch Statement'),
    daDoiChieu: false,
  },
  {
    ma: 'C23',
    tinhNang: 'enum có giá trị thô (rawValue)',
    code: `enum Mau: String {
    case doo = "do"
    case xanh = "xanh"
}
print(Mau.doo.rawValue)`,
    ky: 'do\n',
    nguon: TSPL('Enumerations — Raw Values'),
    daDoiChieu: false,
  },
  {
    ma: 'C24',
    tinhNang: 'enum có giá trị kèm theo (associated values)',
    code: `enum KetQua {
    case thanhCong(Int)
    case thatBai(String)
}
let k = KetQua.thanhCong(10)
switch k {
case .thanhCong(let diem):
    print("duoc \\(diem)")
case .thatBai(let ly):
    print(ly)
}`,
    ky: 'duoc 10\n',
    nguon: TSPL('Enumerations — Associated Values'),
    daDoiChieu: false,
  },
  {
    ma: 'C25',
    tinhNang: 'protocol và tuân thủ',
    code: `protocol Keu {
    func keu() -> String
}
struct Meo: Keu {
    func keu() -> String {
        return "Meo"
    }
}
struct Cho: Keu {
    func keu() -> String {
        return "Gau"
    }
}
func choKeu(_ con: Keu) {
    print(con.keu())
}
choKeu(Meo())
choKeu(Cho())`,
    ky: 'Meo\nGau\n',
    nguon: TSPL('Protocols — Protocols as Types'),
    daDoiChieu: false,
  },
  {
    ma: 'C26',
    tinhNang: 'Hàm tổng quát (generic)',
    code: `func doiCho<T>(_ a: T, _ b: T) -> [T] {
    return [b, a]
}
print(doiCho(1, 2))
print(doiCho("a", "b"))`,
    ky: '[2, 1]\n["b", "a"]\n',
    nguon: TSPL('Generics — Generic Functions'),
    daDoiChieu: false,
  },
  {
    ma: 'C27',
    tinhNang: 'throws / do-catch',
    code: `enum LoiATM: Error {
    case khongDu
}
func rut(_ so: Int, con: Int) throws -> Int {
    if so > con {
        throw LoiATM.khongDu
    }
    return con - so
}
do {
    let x = try rut(50, con: 100)
    print(x)
    let y = try rut(500, con: 100)
    print(y)
} catch {
    print("that bai")
}`,
    ky: '50\nthat bai\n',
    nguon: TSPL('Error Handling — Handling Errors Using Do-Catch'),
    daDoiChieu: false,
  },
  {
    ma: 'C28',
    tinhNang: 'try? biến lỗi thành nil',
    code: `enum Loi: Error {
    case xau
}
func nem() throws -> Int {
    throw Loi.xau
}
let x = try? nem()
print(x)`,
    ky: 'nil\n',
    nguon: TSPL('Error Handling — Converting Errors to Optional Values'),
    daDoiChieu: false,
  },
  {
    ma: 'C29',
    tinhNang: 'Mảng: count, append, phần tử theo chỉ số',
    code: `var so = [3, 1, 2]
so.append(4)
print(so.count)
print(so[0])
print(so)`,
    ky: '4\n3\n[3, 1, 2, 4]\n',
    nguon: TSPL('Collection Types — Arrays'),
    daDoiChieu: false,
  },
  {
    ma: 'C30',
    tinhNang: 'map / filter / reduce với $0',
    code: `let so = [1, 2, 3, 4]
print(so.map { $0 * 2 })
print(so.filter { $0 % 2 == 0 })
print(so.reduce(0) { $0 + $1 })`,
    ky: '[2, 4, 6, 8]\n[2, 4]\n10\n',
    nguon: TSPL('Closures — Shorthand Argument Names'),
    daDoiChieu: false,
  },
  {
    ma: 'C31',
    tinhNang: 'sorted() và mảng chuỗi in kèm nháy',
    code: `let ten = ["Nam", "An", "Bao"]
print(ten.sorted())`,
    ky: '["An", "Bao", "Nam"]\n',
    nguon: TSPL('Collection Types + mô tả in của Array chứa String'),
    daDoiChieu: false,
  },
  {
    ma: 'C32',
    tinhNang: 'Từ điển: tra khoá trả Optional',
    code: `let tuoi = ["Lan": 20]
print(tuoi["Lan"])
print(tuoi["Ai"])`,
    ky: 'Optional(20)\nnil\n',
    nguon: TSPL('Collection Types — Accessing and Modifying a Dictionary'),
    daDoiChieu: false,
  },
  {
    ma: 'C33',
    tinhNang: 'first/last của mảng trả Optional',
    code: `let a = [10, 20]
let b: [Int] = []
print(a.first)
print(b.first)`,
    ky: 'Optional(10)\nnil\n',
    nguon: TSPL('Collection Types — Arrays (first/last là Optional)'),
    daDoiChieu: false,
  },
  {
    ma: 'C34',
    tinhNang: 'String: count, uppercased, hasPrefix',
    code: `let s = "swift"
print(s.count)
print(s.uppercased())
print(s.hasPrefix("sw"))`,
    ky: '5\nSWIFT\ntrue\n',
    nguon: TSPL('Strings and Characters — String Properties and Methods'),
    daDoiChieu: false,
  },
  {
    ma: 'C35',
    tinhNang: 'let là hằng — dùng lại giá trị, không đổi',
    code: `let a = 5
let b = a + 1
print(a)
print(b)`,
    ky: '5\n6\n',
    nguon: TSPL('The Basics — Constants and Variables'),
    daDoiChieu: false,
  },
  {
    ma: 'C36',
    tinhNang: 'Toán tử ba ngôi',
    code: `let diem = 9
print(diem >= 5 ? "dat" : "truot")`,
    ky: 'dat\n',
    nguon: TSPL('Basic Operators — Ternary Conditional Operator'),
    daDoiChieu: false,
  },
  {
    ma: 'C37',
    tinhNang: 'Ngắn mạch của && và ||',
    code: `func nói(_ s: String) -> Bool {
    print(s)
    return true
}
let x = false && nói("khong in")
let y = true || nói("cung khong in")
print(x)
print(y)`,
    ky: 'false\ntrue\n',
    nguon: TSPL('Basic Operators — Logical Operators (short-circuit evaluation)'),
    daDoiChieu: false,
  },
  {
    ma: 'C38',
    tinhNang: 'Kế thừa lớp và gọi phương thức của cha',
    code: `class ConVat {
    var ten: String
    init(ten: String) {
        self.ten = ten
    }
    func gioiThieu() -> String {
        return "Toi la \\(ten)"
    }
}
class Meo: ConVat {
}
let m = Meo(ten: "Mun")
print(m.gioiThieu())`,
    ky: 'Toi la Mun\n',
    nguon: TSPL('Inheritance — Defining a Base Class / Subclassing'),
    daDoiChieu: false,
  },
  {
    ma: 'C39',
    tinhNang: 'switch có where',
    code: `let n = 4
switch n {
case let x where x % 2 == 0:
    print("chan")
default:
    print("le")
}`,
    ky: 'chan\n',
    nguon: TSPL('Control Flow — Where'),
    daDoiChieu: false,
  },
  {
    ma: 'C40',
    tinhNang: 'break và continue trong vòng lặp',
    code: `for i in 1...5 {
    if i == 2 {
        continue
    }
    if i == 4 {
        break
    }
    print(i)
}`,
    ky: '1\n3\n',
    nguon: TSPL('Control Flow — Control Transfer Statements'),
    daDoiChieu: false,
  },
  {
    ma: 'C41',
    tinhNang: 'Tên biến/hàm có dấu tiếng Việt (Swift cho phép Unicode)',
    code: `let hoTên = "Nguyen Van A"
func chàoHỏi(_ t: String) -> String {
    return "Chao \\(t)"
}
print(chàoHỏi(hoTên))`,
    ky: 'Chao Nguyen Van A\n',
    nguon: TSPL('The Basics — Naming Constants and Variables (Unicode characters allowed)'),
    daDoiChieu: false,
  },
]
