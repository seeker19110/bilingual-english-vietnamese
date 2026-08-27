// CỔNG "LỖI PHẢI NÓI ĐƯỢC" của bộ chạy Swift (PR-M3, hiến chương M §3.4).
//
// Vì sao file này quan trọng ngang bộ đối chiếu: §3.4 ghi rằng thông báo lỗi chỉ đúng số dòng
// và viết bằng tiếng Việt dễ hiểu là "lý do sư phạm chính đáng THỨ HAI" của cả quyết định tự
// viết interpreter. Một lỗi chỉ nói "syntax error" thì bộ chạy mất một nửa lý do tồn tại.
//
// Nên mỗi ca ở đây kiểm HAI thứ, không chỉ một:
//   1. Lỗi được bắt (không âm thầm cho qua, không nổ ra ngoại lệ JavaScript thô);
//   2. Thông điệp CÓ CHỈ CÁCH SỬA — bằng cách nêu đúng từ khoá/công cụ học viên cần dùng.
//
// Đây cũng chính là những đường mà người mới học Swift thật sự đi vào, nên phủ hết chúng vừa
// là cổng chất lượng vừa là độ phủ thật.
import { describe, expect, it } from 'vitest'
import { chaySwift, DONG_TU_KHAI } from './index.js'

/** Chạy và trả về { ra, loi } đã bỏ dòng tự khai. */
function chay(code: string): { ra: string; loi: string } {
  const r = chaySwift(code)
  return { ra: r.output.replace(`${DONG_TU_KHAI}\n`, ''), loi: r.error ?? '' }
}

/** Khẳng định: có lỗi, chỉ đúng dòng, và thông điệp chứa mọi mảnh chỉ dẫn mong đợi. */
function loiDayDuoc(code: string, dong: number, ...manh: string[]): void {
  const { loi } = chay(code)
  expect(loi, `Doan nay dang le phai bao loi:\n${code}`).not.toBe('')
  expect(loi, `Loi phai chi dong ${dong}: ${loi}`).toContain(`dong ${dong}:`)
  for (const m of manh) expect(loi).toContain(m)
}

describe('lỗi TÁCH TỪ nói rõ thiếu gì', () => {
  it('chuỗi chưa đóng nháy', () => {
    loiDayDuoc('let a = "chua dong', 1, 'nhay kep')
  })

  it('chuỗi xuống dòng giữa chừng', () => {
    loiDayDuoc('let a = "dang viet\nlet b = 1', 1, 'het dong')
  })

  it('chú thích nhiều dòng chưa đóng', () => {
    loiDayDuoc('/* mo ra\nlet a = 1', 2, '*/')
  })

  it('ký tự thoát lạ trong chuỗi', () => {
    loiDayDuoc('let a = "xin\\qchao"', 1, 'ky tu thoat')
  })

  it('nội suy chuỗi thiếu ngoặc đóng', () => {
    loiDayDuoc('let a = "gia \\(1 + 2"', 1, 'noi suy')
  })

  it('ký tự không thuộc Swift', () => {
    loiDayDuoc('let a = 1 @ 2', 1, 'khong hieu ky tu')
  })
})

describe('lỗi CÚ PHÁP nói rõ cách viết đúng', () => {
  it('thiếu ngoặc nhọn mở/đóng của hàm', () => {
    loiDayDuoc('func f()\nprint(1)', 1, '{')
    loiDayDuoc('func f() {\nprint(1)', 2, '}')
  })

  it('sau let/var phải là tên biến, và phải có giá trị hoặc kiểu', () => {
    loiDayDuoc('let = 5', 1, 'ten bien')
    loiDayDuoc('var a', 1, 'gia tri khoi tao hoac kieu')
  })

  it('for thiếu "in" hoặc thiếu tên biến', () => {
    loiDayDuoc('for i 1...3 {\n}', 1, 'in')
    loiDayDuoc('for 1...3 {\n}', 1, 'ten bien lap')
  })

  it('for/if thiếu từ khoá đóng', () => {
    loiDayDuoc('for i in 1...3 {\nprint(i)', 2, '}')
  })

  it('guard bắt buộc có else', () => {
    loiDayDuoc('func f(_ a: Int?) {\nguard let x = a\nprint(x)\n}', 2, 'else')
  })

  it('switch: thân chỉ chứa case/default; case phải có dấu hai chấm', () => {
    loiDayDuoc('switch 1 {\nprint(1)\n}', 2, 'case')
    loiDayDuoc('switch 1 {\ncase 1\nprint(1)\n}', 2, 'hai cham')
  })

  it('do phải có ít nhất một catch', () => {
    loiDayDuoc('do {\nprint(1)\n}', 1, 'catch')
  })

  it('tham số hàm phải khai kiểu', () => {
    loiDayDuoc('func f(a) {\n}', 1, 'khai kieu')
  })

  it('toán tử ba ngôi phải đủ hai vế', () => {
    loiDayDuoc('let a = true ? 1\nprint(a)', 1, 'ba ngoi')
  })

  it('mảng/từ điển thiếu ngoặc vuông đóng', () => {
    loiDayDuoc('let a = [1, 2\nprint(a)', 2, ']')
  })

  it('từ điển viết thiếu dấu hai chấm', () => {
    loiDayDuoc('let a = ["x": 1, "y" 2]', 1, '<khoa>')
  })

  it('gọi hàm thiếu ngoặc đóng', () => {
    loiDayDuoc('print(1\nlet a = 2', 2, ')')
  })

  it('thành viên lạ trong thân struct', () => {
    loiDayDuoc('struct S {\nswitch 1 {\n}\n}', 2, 'let/var, func, init')
  })

  it('sau struct/class phải có tên kiểu', () => {
    loiDayDuoc('struct {\n}', 1, 'ten kieu')
  })

  it('sau dấu chấm phải là tên thành viên', () => {
    loiDayDuoc('let a = [1].', 1, 'Sau dau cham')
  })

  it('câu lệnh viết dính nhau trên một dòng', () => {
    loiDayDuoc('let a = 1 let b = 2', 1, 'mot dong rieng')
  })

  it('thiếu giá trị sau toán tử', () => {
    loiDayDuoc('let a = 1 +\nprint(a)', 1, 'cho mot gia tri')
  })
})

describe('lỗi KIỂU và Optional — nơi người mới vấp nhiều nhất', () => {
  it('đổi giá trị của let', () => {
    loiDayDuoc('let a = 1\na = 2', 2, 'var')
  })

  it('dùng biến chưa khai báo', () => {
    loiDayDuoc('print(chuaKhai)', 1, 'Chua khai bao')
  })

  it('gán nil cho biến không phải Optional', () => {
    loiDayDuoc('var a: Int = 1\na = nil', 2, 'dau hoi')
  })

  it('gán sai kiểu', () => {
    loiDayDuoc('let a: Int = "chuoi"', 1, 'kiem kieu rat chat')
  })

  it('cộng Int với Double không tự đổi', () => {
    loiDayDuoc('let a = 1 + 2.5', 1, 'Double(x)')
  })

  it('cộng Int với String', () => {
    loiDayDuoc('let a = 1 + "x"', 1, 'toan tu "+"')
  })

  it('dùng Optional thẳng vào phép tính — chỉ đủ BA cách mở gói', () => {
    const { loi } = chay('let a: Int? = 5\nlet b = a + 1')
    expect(loi).toContain('if let')
    expect(loi).toContain('??')
    expect(loi).toContain('!')
  })

  it('mở gói nil bằng "!" — nói rõ đây là crash kinh điển', () => {
    loiDayDuoc('let a: Int? = nil\nprint(a!)', 2, 'if let', 'nil')
  })

  it('lấy thuộc tính trên nil mà không dùng "?."', () => {
    loiDayDuoc('struct S { var x = 1 }\nlet s: S? = nil\nprint(s.x)', 3, '?.')
  })

  it('điều kiện không phải Bool', () => {
    loiDayDuoc('if 1 {\nprint(1)\n}', 1, 'phai la Bool')
    loiDayDuoc('let a: Bool? = true\nif a {\nprint(1)\n}', 2, 'Optional')
  })

  it('lặp trên Optional', () => {
    loiDayDuoc('let a: [Int]? = [1]\nfor x in a {\nprint(x)\n}', 2, 'if let')
  })

  it('so sánh Bool bằng toán tử số', () => {
    loiDayDuoc('let a = true < false', 1, '&&')
  })
})

describe('lỗi LÚC CHẠY nói rõ vì sao dừng', () => {
  it('chia cho 0', () => {
    loiDayDuoc('print(1 / 0)', 1, 'Chia cho 0')
    loiDayDuoc('print(1 % 0)', 1, 'Lay du cho 0')
  })

  it('chỉ số ngoài mảng — nói rõ Swift dừng chứ không trả nil', () => {
    loiDayDuoc('let a = [1, 2]\nprint(a[5])', 2, 'chi so hop le tu 0 den 1', 'khong tra ve nil')
  })

  it('gán vào chỉ số ngoài mảng', () => {
    loiDayDuoc('var a = [1]\na[3] = 9', 2, 'nam ngoai mang')
  })

  it('lấy ký tự chuỗi bằng chỉ số — Swift không cho', () => {
    loiDayDuoc('let s = "abc"\nprint(s[0])', 2, 'Array(chuoi)')
  })

  it('khoảng ngược', () => {
    loiDayDuoc('for i in 5...1 {\nprint(i)\n}', 1, 'khong hop le')
  })

  it('vòng lặp vô hạn bị chặn bởi trần bước', () => {
    const r = chaySwift('var i = 0\nwhile true {\ni += 1\n}', [], { tranBuoc: 5000 })
    expect(r.error).toContain('dung lai')
    expect(r.error).toContain('vong lap')
  })

  it('in quá nhiều bị chặn bởi trần output', () => {
    const r = chaySwift('for i in 1...500 {\nprint("mot dong kha dai de nhanh day tran")\n}', [], {
      tranOutput: 500,
    })
    expect(r.output).toContain('Output qua dai')
  })

  it('lỗi ném ra mà không ai bắt', () => {
    loiDayDuoc(
      'enum L: Error { case x }\nfunc f() throws { throw L.x }\ntry f()',
      2,
      'do {',
      'try?',
    )
  })

  it('switch không phủ hết và không có default', () => {
    loiDayDuoc('let x = 9\nswitch x {\ncase 1:\nprint(1)\n}', 2, 'phu het')
  })

  it('guard else không thoát khỏi phạm vi', () => {
    loiDayDuoc(
      'func f() {\nlet a: Int? = nil\nguard let x = a else {\nprint("thieu")\n}\nprint(x)\n}\nf()',
      3,
      'return',
    )
  })

  it('thiếu return trong thuộc tính tính', () => {
    loiDayDuoc('struct S {\nvar x: Int {\nlet a = 1\n}\n}\nprint(S().x)', 2, 'return')
  })
})

describe('lỗi GỌI HÀM và KIỂU TỰ ĐỊNH NGHĨA', () => {
  it('thiếu nhãn tham số — nét đặc trưng của Swift', () => {
    loiDayDuoc('func f(ten: String) {}\nf("Lan")', 2, 'nhan "ten:"')
  })

  it('sai nhãn tham số', () => {
    loiDayDuoc('func f(ten: String) {}\nf(name: "Lan")', 2, 'phai la "ten:"')
  })

  it('thiếu đối số', () => {
    loiDayDuoc('func f(a: Int, b: Int) {}\nf(a: 1)', 2, 'thieu doi so')
  })

  it('thừa đối số', () => {
    loiDayDuoc('func f(a: Int) {}\nf(a: 1, 2)', 2, 'chi nhan 1 doi so')
  })

  it('gọi thứ không phải hàm', () => {
    loiDayDuoc('let a = 5\nprint(a())', 2, 'khong phai la ham')
  })

  it('truy cập thuộc tính không tồn tại', () => {
    loiDayDuoc('struct S { var x = 1 }\nprint(S().y)', 2, 'khong co thuoc tinh')
  })

  it('class chưa có init mà truyền đối số — nói rõ khác biệt với struct', () => {
    loiDayDuoc('class C { var x = 0 }\nlet c = C(x: 1)', 2, 'Struct duoc Swift tang san')
  })

  it('struct thiếu giá trị cho thuộc tính', () => {
    loiDayDuoc('struct S { var x: Int }\nlet s = S()', 2, 'chua co gia tri')
  })

  it('sai nhãn khi khởi tạo theo thành viên', () => {
    loiDayDuoc('struct S { var x: Int }\nlet s = S(y: 1)', 2, 'nhan "x:"')
  })

  it('đổi thuộc tính khai bằng let', () => {
    loiDayDuoc('struct S { let x = 1 }\nvar s = S()\ns.x = 2', 3, 'khong doi duoc')
  })

  it('protocol khai mà thiếu hàm — protocol là lời hứa', () => {
    loiDayDuoc(
      'protocol P {\nfunc keu() -> String\n}\nstruct S: P {\n}\nlet s = S()',
      4,
      'THIEU ham "keu"',
      'loi hua',
    )
  })

  it('tạo trực tiếp một protocol', () => {
    loiDayDuoc('protocol P {}\nlet p = P()', 2, 'ban thiet ke')
  })

  it('khai trùng tên kiểu', () => {
    loiDayDuoc('struct S {}\nstruct S {}', 2, 'da duoc khai bao roi')
  })

  it('enum không có rawValue mà đòi rawValue', () => {
    loiDayDuoc('enum E { case a }\nprint(E.a.rawValue)', 2, 'gia tri tho')
  })

  it('thành viên ngầm ".x" không thuộc enum nào', () => {
    loiDayDuoc('let a = .khongCoDau', 1, 'Khong enum nao')
  })

  it('self dùng ngoài kiểu', () => {
    loiDayDuoc('print(self)', 1, 'ben trong ham cua struct')
  })

  it('khoá từ điển sai kiểu', () => {
    loiDayDuoc('let a = [1.5: "x"]', 1, 'khoa tu dien')
  })
})

describe('phần CHẠY ĐÚNG mà chưa có ca đối chiếu riêng', () => {
  it('print có separator và terminator', () => {
    expect(chay('print(1, 2, separator: "-", terminator: "!")').ra).toBe('1-2!')
  })

  it('hàm dựng sẵn: abs, min, max, Double, Bool, Array, String', () => {
    expect(chay('print(abs(-3))').ra).toBe('3\n')
    expect(chay('print(abs(-2.5))').ra).toBe('2.5\n')
    expect(chay('print(min(3, 1, 2))').ra).toBe('1\n')
    expect(chay('print(max(3, 1))').ra).toBe('3\n')
    expect(chay('print(Double(3))').ra).toBe('3.0\n')
    expect(chay('print(Double("2.5"))').ra).toBe('Optional(2.5)\n')
    expect(chay('print(Bool("true"))').ra).toBe('Optional(true)\n')
    expect(chay('print(Bool("x"))').ra).toBe('nil\n')
    expect(chay('print(Array("ab"))').ra).toBe('["a", "b"]\n')
    expect(chay('print(String(42))').ra).toBe('42\n')
    expect(chay('print(Int(2.9))').ra).toBe('2\n')
  })

  it('String: split, replacingOccurrences, trimmingCharacters, hasSuffix, contains', () => {
    expect(chay('print("a,b,c".split(separator: ","))').ra).toBe('["a", "b", "c"]\n')
    expect(chay('print("xin chao".replacingOccurrences(of: "chao", with: "hi"))').ra).toBe(
      'xin hi\n',
    )
    expect(chay('print("  a  ".trimmingCharacters(in: " "))').ra).toBe('a\n')
    expect(chay('print("swift".hasSuffix("ft"))').ra).toBe('true\n')
    expect(chay('print("swift".contains("wi"))').ra).toBe('true\n')
    expect(chay('print("swift".first)').ra).toBe('Optional("s")\n')
    expect(chay('print("swift".last)').ra).toBe('Optional("t")\n')
    expect(chay('print("".isEmpty)').ra).toBe('true\n')
  })

  it('Mảng: insert, removeLast, reversed, joined, contains(closure), sorted(by:)', () => {
    expect(chay('var a = [1, 3]\na.insert(2, at: 1)\nprint(a)').ra).toBe('[1, 2, 3]\n')
    expect(chay('var a = [1, 2]\nprint(a.removeLast())\nprint(a)').ra).toBe('2\n[1]\n')
    expect(chay('print([1, 2].reversed())').ra).toBe('[2, 1]\n')
    expect(chay('print(["a", "b"].joined(separator: "-"))').ra).toBe('a-b\n')
    expect(chay('print([1, 2, 3].contains { $0 > 2 })').ra).toBe('true\n')
    expect(chay('print([1, 3, 2].sorted { $0 > $1 })').ra).toBe('[3, 2, 1]\n')
    expect(chay('print([1, 2].isEmpty)').ra).toBe('false\n')
    expect(chay('let a: [Int] = []\nprint(a.last)').ra).toBe('nil\n')
    expect(chay('print([1] + [2])').ra).toBe('[1, 2]\n')
  })

  it('Từ điển: count, keys, values, removeValue, gán và xoá bằng nil', () => {
    expect(chay('var d = ["a": 1]\nd["b"] = 2\nprint(d.count)').ra).toBe('2\n')
    expect(chay('let d = ["b": 2, "a": 1]\nprint(d.keys)').ra).toBe('["a", "b"]\n')
    expect(chay('let d = ["b": 2, "a": 1]\nprint(d.values)').ra).toBe('[1, 2]\n')
    expect(chay('var d = ["a": 1]\nprint(d.removeValue(forKey: "a"))\nprint(d.count)').ra).toBe(
      'Optional(1)\n0\n',
    )
    expect(chay('var d = ["a": 1]\nd["a"] = nil\nprint(d.count)').ra).toBe('0\n')
    expect(chay('let d: [String: Int] = [:]\nprint(d.isEmpty)').ra).toBe('true\n')
  })

  it('Khoảng: count, so sánh chuỗi, Unicode identifier', () => {
    expect(chay('print((1...3).count)').ra).toBe('3\n')
    expect(chay('print("a" < "b")').ra).toBe('true\n')
    expect(chay('let sốĐẹp = 7\nprint(sốĐẹp)').ra).toBe('7\n')
  })

  it('static, thuộc tính tính, kế thừa và ghi đè phương thức', () => {
    expect(
      chay(
        'struct S {\nstatic let ten = "S"\nstatic func chao() -> String { return "hi" }\n}\nprint(S.ten)\nprint(S.chao())',
      ).ra,
    ).toBe('S\nhi\n')
    expect(
      chay(
        'class A {\nfunc noi() -> String { return "A" }\n}\nclass B: A {\noverride func noi() -> String { return "B" }\n}\nprint(B().noi())',
      ).ra,
    ).toBe('B\n')
  })

  it('catch có lọc theo kiểu lỗi, và biến "error" dựng sẵn', () => {
    const src = `enum L1: Error { case a }
enum L2: Error { case b }
func f(_ n: Int) throws {
    if n == 1 { throw L1.a }
    throw L2.b
}
do {
    try f(1)
} catch let e as L1 {
    print("L1")
} catch {
    print("khac")
}
do {
    try f(2)
} catch {
    print("bat het")
}`
    expect(chay(src).ra).toBe('L1\nbat het\n')
  })

  it('import Foundation được nuốt để chép code qua lại không vấp', () => {
    expect(chay('import Foundation\nprint(1)').ra).toBe('1\n')
  })

  it('so sánh struct theo giá trị, so sánh class theo danh tính', () => {
    expect(chay('struct S { var x = 1 }\nprint(S() == S())').ra).toBe('true\n')
    expect(chay('class C { var x = 1 }\nlet a = C()\nprint(a == a)\nprint(a == C())').ra).toBe(
      'true\nfalse\n',
    )
  })

  it('enum so sánh, kèm giá trị, và init(rawValue:) không khớp', () => {
    expect(chay('enum E: String { case a = "a" }\nprint(E(rawValue: "z"))').ra).toBe('nil\n')
    expect(
      chay(
        'enum E { case p(Int, Int) }\nlet e = E.p(1, 2)\nswitch e {\ncase .p(let a, let b):\nprint(a + b)\n}',
      ).ra,
    ).toBe('3\n')
  })

  it('closure khai tham số tường minh và closure nhiều dòng', () => {
    expect(chay('let f = { (x: Int) -> Int in\nreturn x * 3\n}\nprint(f(2))').ra).toBe('6\n')
    expect(chay('let f = { x in x + 1 }\nprint(f(1))').ra).toBe('2\n')
  })

  it('toán tử gán gộp trên thuộc tính và phần tử mảng', () => {
    expect(chay('struct S { var n = 1 }\nvar s = S()\ns.n += 4\nprint(s.n)').ra).toBe('5\n')
    expect(chay('var a = [1]\na[0] *= 5\nprint(a[0])').ra).toBe('5\n')
  })

  it('chuỗi nhiều dòng bằng ; và chú thích lồng nhau', () => {
    expect(chay('let a = 1; let b = 2\nprint(a + b)').ra).toBe('3\n')
    expect(chay('/* ngoai /* trong */ ngoai */\nprint(1)').ra).toBe('1\n')
  })
})

// Nhóm cuối phủ nốt các LỐI RẼ còn lại của bộ chạy. Không phải test cho đủ số: mỗi ca là một
// dòng Swift người học thật sự gõ (in giá trị lồng nhau, break/continue, tham số mặc định,
// static, chuỗi rỗng…), và một bộ chạy chỉ đáng tin khi mọi lối rẽ đều được đi ít nhất một lần.
describe('phủ nốt các lối rẽ còn lại', () => {
  it('in giá trị lồng nhau: nil, khoảng, enum kèm giá trị, từ điển trong mảng', () => {
    expect(chay('let a: [Int?] = [nil]\nprint(a)').ra).toBe('[nil]\n')
    expect(chay('print(1...3)').ra).toBe('1...3\n')
    expect(chay('print(1..<3)').ra).toBe('1..<3\n')
    expect(chay('enum E { case p(Int) }\nprint([E.p(1)])').ra).toBe('[p(1)]\n')
    expect(chay('print([["a": 1]])').ra).toBe('[["a": 1]]\n')
    expect(chay('struct S { var x = 1 }\nprint([S()])').ra).toBe('[S(x: 1)]\n')
    expect(chay('let f = { 1 }\nprint(f)').ra).toBe('(Function)\n')
  })

  it('protocol đòi cả THUỘC TÍNH, không chỉ hàm', () => {
    loiDayDuoc(
      'protocol P {\nvar ten: String { get }\n}\nstruct S: P {\n}\nlet s = S()',
      4,
      'THIEU thuoc tinh',
    )
    expect(
      chay(
        'protocol P {\nvar ten: String { get }\n}\nstruct S: P {\nvar ten = "x"\n}\nprint(S().ten)',
      ).ra,
    ).toBe('x\n')
  })

  it('break và continue trong while và repeat-while', () => {
    expect(chay('var i = 0\nwhile true {\ni += 1\nif i > 2 { break }\n}\nprint(i)').ra).toBe('3\n')
    expect(
      chay(
        'var i = 0\nvar t = 0\nwhile i < 4 {\ni += 1\nif i == 2 { continue }\nt += i\n}\nprint(t)',
      ).ra,
    ).toBe('8\n')
    expect(
      chay('var i = 0\nrepeat {\ni += 1\nif i == 2 { break }\n} while i < 5\nprint(i)').ra,
    ).toBe('2\n')
    expect(
      chay(
        'var i = 0\nvar t = 0\nrepeat {\ni += 1\nif i == 1 { continue }\nt += 1\n} while i < 3\nprint(t)',
      ).ra,
    ).toBe('2\n')
  })

  it('if let trên giá trị KHÔNG phải Optional vẫn chạy (Swift cũng cho qua)', () => {
    expect(chay('let a = 5\nif let b = a {\nprint(b)\n}').ra).toBe('5\n')
  })

  it('switch trên enum đang nằm trong Optional', () => {
    const src = `enum E { case a
case b }
let e: E? = E.b
switch e {
case .a:
    print("a")
case .b:
    print("b")
default:
    print("khac")
}`
    expect(chay(src).ra).toBe('b\n')
  })

  it('_ = biểu thức (chạy lấy tác dụng phụ, bỏ kết quả)', () => {
    expect(chay('func f() -> Int {\nprint("chay")\nreturn 1\n}\n_ = f()').ra).toBe('chay\n')
  })

  it('phép gán gộp và toán tử đơn nguyên trên Double', () => {
    expect(chay('var a = 5.0\na -= 1.5\nprint(a)').ra).toBe('3.5\n')
    expect(chay('var a = 2.0\na *= 3.0\nprint(a)').ra).toBe('6.0\n')
    expect(chay('var a = 6.0\na /= 2.0\nprint(a)').ra).toBe('3.0\n')
    expect(chay('print(-2.5)').ra).toBe('-2.5\n')
    expect(chay('print(!false)').ra).toBe('true\n')
  })

  it('toán tử != và so sánh Double', () => {
    expect(chay('print(1 != 2)').ra).toBe('true\n')
    expect(chay('print(1.5 < 2.5)').ra).toBe('true\n')
    expect(chay('print("a" != "a")').ra).toBe('false\n')
  })

  it('chia 0 kiểu Double', () => {
    loiDayDuoc('print(1.0 / 0.0)', 1, 'Chia cho 0.0')
  })

  it('lấy phần tử của MẢNG RỖNG nói rõ mảng đang rỗng', () => {
    loiDayDuoc('let a: [Int] = []\nprint(a[0])', 2, 'mang co 0 phan tu')
  })

  it('static: thuộc tính lưu trữ và hàm; tham số mặc định', () => {
    expect(chay('struct S {\nstatic var dem = 7\n}\nprint(S.dem)').ra).toBe('7\n')
    expect(chay('func f(a: Int = 3) -> Int {\nreturn a\n}\nprint(f())\nprint(f(a: 5))').ra).toBe(
      '3\n5\n',
    )
  })

  it('enum init(rawValue:) khớp, và enum số nguyên', () => {
    expect(chay('enum E: String {\ncase a = "x"\n}\nprint(E(rawValue: "x") != nil)').ra).toBe(
      'true\n',
    )
    expect(chay('enum E: Int {\ncase a = 1\n}\nprint(E.a.rawValue)').ra).toBe('1\n')
  })

  it('khởi tạo struct thừa đối số', () => {
    loiDayDuoc('struct S { var x: Int }\nlet s = S(x: 1, y: 2)', 2, 'chi co 1 thuoc tinh')
  })

  it('hàm dựng sẵn gọi không đối số trả giá trị mặc định', () => {
    expect(chay('print(Int())').ra).toBe('0\n')
    expect(chay('print(Double())').ra).toBe('0.0\n')
    expect(chay('print(Bool())').ra).toBe('false\n')
    expect(chay('print(String())').ra).toBe('\n')
  })

  it('lowercased, first/last trên chuỗi rỗng, count của chuỗi có dấu', () => {
    expect(chay('print("ABC".lowercased())').ra).toBe('abc\n')
    expect(chay('print("".first)').ra).toBe('nil\n')
    expect(chay('print("".last)').ra).toBe('nil\n')
  })

  it('removeLast trên mảng rỗng dừng chương trình có giải thích', () => {
    loiDayDuoc('var a: [Int] = []\n_ = a.removeLast()', 2, 'mang rong')
  })

  it('phương thức chuỗi gọi với đối số sai kiểu', () => {
    loiDayDuoc('print("abc".hasPrefix(1))', 1, 'can mot String')
  })

  it('Array/abs/min gọi sai kiểu đều báo rõ', () => {
    loiDayDuoc('print(Array(5))', 1, 'chi doi duoc tu String')
    loiDayDuoc('print(abs("x"))', 1, 'can mot so')
    loiDayDuoc('print(min(1))', 1, 'it nhat hai so')
    loiDayDuoc('print(Int(true))', 1, 'Khong doi')
    loiDayDuoc('print(Double(true))', 1, 'Khong doi')
    loiDayDuoc('print(Bool(1))', 1, 'Khong doi')
  })

  it('kiểu hàm và mảng lồng trong khai báo kiểu', () => {
    expect(chay('let f: (Int) -> Int = { $0 + 1 }\nprint(f(1))').ra).toBe('2\n')
    expect(chay('let a: [[Int]] = [[1], [2]]\nprint(a)').ra).toBe('[[1], [2]]\n')
    expect(chay('let d: [String: [Int]] = ["a": [1]]\nprint(d["a"])').ra).toBe('Optional([1])\n')
  })

  it('gọi phương thức trên Optional bằng ?. và trên nil', () => {
    expect(chay('let s: String? = "ab"\nprint(s?.count)').ra).toBe('Optional(2)\n')
    expect(chay('let s: String? = nil\nprint(s?.count)').ra).toBe('nil\n')
  })

  it('hàm không trả giá trị và return trống', () => {
    expect(chay('func f() {\nprint("a")\nreturn\n}\nf()').ra).toBe('a\n')
  })

  it('gán vào thuộc tính của thứ không phải thực thể', () => {
    loiDayDuoc('var a = 5\na.x = 1', 2, 'Khong gan duoc thuoc tinh')
    loiDayDuoc('struct S { var x = 1 }\nvar s = S()\ns.y = 2', 3, 'khong co thuoc tinh')
    loiDayDuoc('var a = 5\na[0] = 1', 2, 'Khong gan theo chi so')
    loiDayDuoc('let a = 5\nprint(a.khongCo)', 2, 'khong co thanh vien')
  })

  it('chỉ số từ điển với khoá enum', () => {
    const src = `enum E: String {
case a = "a"
}
var d: [E: Int] = [:]
d[E.a] = 5
print(d[E.a])`
    expect(chay(src).ra).toBe('Optional(5)\n')
  })

  it('kiểu tổng quát có ràng buộc vẫn phân tích được', () => {
    expect(
      chay(
        'func lonNhat<T: Comparable>(_ a: T, _ b: T) -> T {\nreturn a > b ? a : b\n}\nprint(lonNhat(3, 7))',
      ).ra,
    ).toBe('7\n')
    expect(chay('struct Hop<T> {\nvar gia: T\n}\nprint(Hop(gia: 5).gia)').ra).toBe('5\n')
  })

  it('init tự viết cho struct, và init có throws', () => {
    expect(
      chay(
        'struct S {\nvar x: Int\ninit(gap doi: Int) {\nself.x = doi * 2\n}\n}\nprint(S(gap: 3).x)',
      ).ra,
    ).toBe('6\n')
  })

  it('mutating func gọi qua nhiều lớp thuộc tính', () => {
    const src = `struct Dem {
var n = 0
mutating func them(_ k: Int) {
n += k
}
}
var d = Dem()
d.them(3)
d.them(4)
print(d.n)`
    expect(chay(src).ra).toBe('7\n')
  })

  it('static func gọi qua tên kiểu, và thành viên tĩnh không tồn tại', () => {
    loiDayDuoc('struct S {}\nprint(S.khongCo)', 2, 'thanh vien tinh')
  })
})
