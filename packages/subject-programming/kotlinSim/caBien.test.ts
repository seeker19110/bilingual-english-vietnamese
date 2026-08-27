// CA BIÊN của bộ chạy Kotlin (PR-M7) — đường LỖI và các góc ít đi tới.
//
// Vì sao cần một file riêng cho đường lỗi: với người mới, **đường lỗi mới là đường hay đi
// nhất**. Ba file kia canh lúc mã ĐÚNG (conformance), lúc thư viện được gọi ĐÚNG (thuVien) và
// chất lượng câu chữ của một số lỗi tiêu biểu (loi). File này canh phần còn lại: mọi ngã rẽ mà
// bộ chạy phải từ chối tử tế thay vì ném lỗi JavaScript trần ra màn hình.
import { describe, expect, it } from 'vitest'
import { chayKotlin } from './chayKotlin.js'

/** Chạy và bắt buộc phải có lỗi; trả về thông điệp. */
function loi(src: string): string {
  const r = chayKotlin(src)
  expect(r.error, `Doan nay dang le phai bao loi:\n${src}`).toBeDefined()
  return r.error!
}

/** Chạy và bắt buộc KHÔNG lỗi; trả output đã bỏ dòng tự khai. */
function ra(src: string): string {
  const r = chayKotlin(src)
  expect(r.error, `Doan nay dang le chay duoc:\n${src}\nLoi: ${r.error}`).toBeUndefined()
  return r.output.split('\n').slice(1).join('\n')
}

describe('ca biên — toán tử dùng sai kiểu', () => {
  it.each([
    ['println("a" - 1)', 'toan tu'],
    ['println(true + 1)', 'toan tu'],
    ['println(listOf(1) - listOf(2))', 'toan tu'],
    ['println(1 < "a")', 'toan tu'],
    ['println(-"a")', 'doi dau'],
  ])('%s báo lỗi có chữ "%s"', (src, chua) => {
    expect(loi(src)).toContain(chua)
  })

  it('toán tử với null nói rõ phải xử lý null trước', () => {
    const m = loi('val a: Int? = null\nval b = a!! \nprintln(1 + (null as Int?)!!)')
    expect(m.length).toBeGreaterThan(10)
  })

  it('chia và lấy dư cho 0 ở kiểu Double KHÔNG lỗi (đúng IEEE, khác Int)', () => {
    expect(ra('println(1.0 / 0)')).toBe('Infinity\n')
  })

  it('lấy phần dư với 0 ở Int thì lỗi', () => {
    expect(loi('println(5 % 0)')).toContain('mau so')
  })
})

describe('ca biên — duyệt và chỉ số', () => {
  it('for trên thứ không duyệt được', () => {
    expect(loi('for (x in 5) println(x)')).toContain('duyet')
  })
  it('in với thứ không phải tập hợp', () => {
    expect(loi('println(1 in 5)')).toContain('in')
  })
  it('lấy phần tử trên null', () => {
    expect(loi('val a: List<Int>? = null\nprintln(a!![0])')).toContain('null')
  })
  it('lấy phần tử theo chỉ số trên kiểu không hỗ trợ', () => {
    expect(loi('println(5[0])')).toContain('chi so')
  })
  it('chỉ số âm trên danh sách', () => {
    expect(loi('println(listOf(1)[-1])')).toContain('chi so')
  })
  it('chỉ số ngoài chuỗi', () => {
    expect(loi('println("ab"[9])')).toContain('ky tu')
  })
  it('gán theo chỉ số ngoài phạm vi', () => {
    expect(loi('val ds = mutableListOf(1)\nds[5] = 9')).toContain('pham vi')
  })
  it('gán theo chỉ số trên kiểu không hỗ trợ', () => {
    expect(loi('var s = "ab"\ns[0] = "c"')).toContain('chi so')
  })
  it('removeAt ngoài phạm vi', () => {
    expect(loi('val ds = mutableListOf(1)\nds.removeAt(9)')).toContain('pham vi')
  })
  it('substring ngoài chuỗi', () => {
    expect(loi('println("ab".substring(0, 9))')).toContain('substring')
  })
  it('reduce trên danh sách rỗng', () => {
    expect(loi('println(listOf<Int>().reduce { a, b -> a + b })')).toContain('rong')
  })
  it('first/last trên chuỗi rỗng', () => {
    expect(loi('println("".first())')).toContain('rong')
    expect(loi('println("".last())')).toContain('rong')
  })
  it('last trên danh sách rỗng chỉ sang lastOrNull', () => {
    expect(loi('println(listOf<Int>().last())')).toContain('lastOrNull')
  })
  it('average của danh sách rỗng là NaN, không lỗi', () => {
    expect(ra('println(listOf<Int>().average())')).toBe('NaN\n')
  })
})

describe('ca biên — huỷ cấu trúc', () => {
  it('tách từ thứ không tách được', () => {
    expect(loi('val (a, b) = 5')).toContain('tach')
  })
  it('tách danh sách đủ dài thì được', () => {
    expect(ra('val (a, b) = listOf(1, 2, 3)\nprintln("$a$b")')).toBe('12\n')
  })
  it('tách danh sách quá ngắn thì lỗi', () => {
    expect(loi('val (a, b) = listOf(1)')).toContain('tach')
  })
  it('tách trong vòng for trên danh sách cặp', () => {
    expect(ra('for ((a, b) in listOf(Pair(1, 2))) println("$a-$b")')).toBe('1-2\n')
  })
})

describe('ca biên — gán và phạm vi', () => {
  it('gán vào thứ không phải biến', () => {
    expect(loi('1 = 2')).toContain('Ve trai')
  })
  it('gán thuộc tính trên kiểu không phải đối tượng', () => {
    expect(loi('var a = 5\na.x = 1')).toContain('thuoc tinh')
  })
  it('gán thuộc tính không tồn tại', () => {
    expect(loi('class A(var x: Int)\nval a = A(1)\na.y = 2')).toContain('khong co')
  })
  it('gán vào biến chưa khai báo', () => {
    expect(loi('x = 1')).toContain('var x')
  })
  it('biến khai trong khối không thấy được ngoài khối', () => {
    expect(loi('if (true) { val trong = 1 }\nprintln(trong)')).toContain('trong')
  })
  it('biến ngoài thấy được trong khối', () => {
    expect(ra('val ngoai = 1\nif (true) { println(ngoai) }')).toBe('1\n')
  })
})

describe('ca biên — gọi hàm', () => {
  it('gọi thứ không phải hàm', () => {
    expect(loi('val a = 5\nprintln(a())')).toContain('goi duoc')
  })
  it('truyền quá nhiều tham số', () => {
    expect(loi('fun f(a: Int) = a\nprintln(f(1, 2))')).toContain('nhieu hon')
  })
  it('tham số mặc định tính theo tham số truyền trước đó', () => {
    expect(ra('fun f(a: Int, b: Int = 10) = a + b\nprintln(f(1))')).toBe('11\n')
  })
  it('gọi hàm trên null bằng dấu chấm', () => {
    expect(loi('val s: String? = null\nprintln(s!!.uppercase())')).toContain('!!')
  })
  it('gọi hàm an toàn trên null trả null', () => {
    expect(ra('val s: String? = null\nprintln(s?.uppercase())')).toBe('null\n')
  })
  it('gọi hàm không có trên kiểu cơ bản', () => {
    expect(loi('println(5.khongCo())')).toContain('khong co')
  })
  it('this ngoài lớp thì báo lỗi', () => {
    expect(loi('println(this)')).toContain('this')
  })
})

describe('ca biên — điều khiển vòng lặp', () => {
  it('continue trong while', () => {
    expect(
      ra(
        'var i = 0\nvar t = 0\nwhile (i < 5) { i++; if (i % 2 == 0) continue; t += i }\nprintln(t)',
      ),
    ).toBe('9\n')
  })
  it('break và continue trong do-while', () => {
    expect(ra('var i = 0\ndo { i++; if (i < 3) continue; break } while (true)\nprintln(i)')).toBe(
      '3\n',
    )
  })
  it('break trong for trên Map', () => {
    expect(ra('for ((k, v) in mapOf("a" to 1, "b" to 2)) { println(k); break }')).toBe('a\n')
  })
  it('thân vòng lặp không cần ngoặc nhọn', () => {
    expect(ra('for (i in 1..3) print(i)\nprintln()')).toBe('123\n')
  })
  it('khoảng lùi bằng downTo kèm step', () => {
    expect(ra('for (i in 6 downTo 1 step 2) print(i)\nprintln()')).toBe('642\n')
  })
  it('step âm hoặc bằng 0 thì báo lỗi', () => {
    expect(loi('for (i in 1..5 step 0) print(i)')).toContain('so duong')
  })
  it('step đứng sau thứ không phải khoảng', () => {
    expect(loi('println(5 step 2)')).toContain('khoang')
  })
  it('khoảng rỗng thì không lặp lần nào', () => {
    expect(ra('for (i in 5..1) print(i)\nprintln("xong")')).toBe('xong\n')
  })
})

describe('ca biên — in ra các loại giá trị', () => {
  it.each([
    ['println(Unit)', 'kotlin.Unit'],
    ['println(1..3)', '1..3'],
    ['println({ x: Int -> x })', '(ham)'],
    ['fun f() {}\nprintln(f())', 'kotlin.Unit'],
  ])('%s in ra %s', (src, mong) => {
    expect(ra(src).trimEnd()).toBe(mong)
  })

  it('in một lớp thường không phải data class', () => {
    expect(ra('class A\nprintln(A())').trimEnd()).toContain('@doiTuong')
  })
  it('toString của lớp thường', () => {
    expect(ra('class A\nprintln(A().toString())').trimEnd()).toContain('@doiTuong')
  })
  it('toString tự viết được ưu tiên hơn bản dựng sẵn', () => {
    expect(ra('class A {\n    fun toString2() = "tu viet"\n}\nprintln(A().toString2())')).toBe(
      'tu viet\n',
    )
  })
  it('in enum bằng toString', () => {
    expect(ra('enum class M { A }\nprintln(M.A.toString())')).toBe('A\n')
  })
})

describe('ca biên — bộ tách từ', () => {
  it('ký tự không dùng được trong Kotlin', () => {
    expect(loi('val a = 1 # 2')).toContain('ban phim')
  })
  it('ký tự thoát không hợp lệ trong chuỗi', () => {
    expect(loi('println("a\\q")')).toContain('thoat')
  })
  it('hằng ký tự nhiều hơn một ký tự', () => {
    expect(loi("val c = 'ab'")).toContain('MOT ky tu')
  })
  it('ký tự thoát không hợp lệ trong hằng ký tự', () => {
    expect(loi("val c = '\\q'")).toContain('thoat')
  })
  it('chuỗi ba nháy chưa đóng', () => {
    expect(loi('val s = \u0022\u0022\u0022chua dong')).toContain('ba nhay')
  })
  it('nội suy ${ chưa đóng', () => {
    expect(loi('println("${1 + 2")')).toContain('}')
  })
  it('chuỗi ba nháy giữ nguyên dấu $ không nội suy khi không có tên', () => {
    expect(ra('println("""gia $ 5""")')).toBe('gia $ 5\n')
  })
})

describe('ca biên — bộ phân tích cú pháp', () => {
  it('thiếu ngoặc tròn quanh điều kiện if', () => {
    expect(loi('if true { println(1) }')).toContain('ngoac tron')
  })
  it('thiếu tên biến sau val', () => {
    expect(loi('val = 1')).toContain('TEN')
  })
  it('for thiếu từ khoá in', () => {
    expect(loi('for (i = 1) println(i)')).toContain('in')
  })
  it('when thiếu dấu mũi tên', () => {
    expect(loi('when (1) { 1 println("x") }')).toContain('->')
  })
  it('try không có catch lẫn finally', () => {
    expect(loi('try { println(1) }')).toContain('catch')
  })
  it('catch thiếu ngoặc tròn', () => {
    expect(loi('try { println(1) } catch { println(2) }')).toContain('catch')
  })
  it('bổ nghĩa đứng trước thứ không khai được', () => {
    // `open val` ở cấp cao nhất là lỗi TĨNH của Kotlin, bộ chạy không kiểm kiểu tĩnh nên cho
    // qua (xem bảng khác biệt). Thứ nó phải chặn là bổ nghĩa đứng trước thứ không phải khai báo.
    expect(loi('data 5')).toContain('class')
  })
  it('thân lớp chứa thứ không khai được', () => {
    expect(loi('class A {\n    println(1)\n}')).toContain('val, var, fun')
  })
  it('ngoặc tròn mở không đóng', () => {
    expect(loi('println((1 + 2)')).toContain('ngoac tron')
  })
  it('lambda chưa đóng', () => {
    expect(loi('val f = { x: Int -> x')).toContain('}')
  })
  it('dùng ngoặc vuông làm danh sách', () => {
    expect(loi('val a = [1]')).toContain('listOf')
  })
  it('biểu thức cụt', () => {
    expect(loi('val a = 1 +')).toContain('Khong hieu')
  })
})

describe('ca biên — lớp và kế thừa', () => {
  it('hàm dựng của lớp cha nhận tham số tính từ tham số con', () => {
    expect(
      ra(`open class A(val ten: String)
class B(x: String) : A(x + "!")
println(B("a").ten)`),
    ).toBe('a!\n')
  })
  it('interface không có thân vẫn tuân theo được', () => {
    expect(ra('interface I\nclass A : I\nprintln(A() is I)')).toBe('true\n')
  })
  it('thuộc tính khai trong thân lớp có giá trị mặc định', () => {
    expect(ra('class A {\n    var dem = 0\n}\nval a = A()\na.dem = 5\nprintln(a.dem)')).toBe('5\n')
  })
  it('thuộc tính không khai giá trị thì là null', () => {
    expect(ra('class A {\n    var x: Int? = null\n}\nprintln(A().x)')).toBe('null\n')
  })
  it('object có khối init', () => {
    expect(ra('object O {\n    val x = 1\n}\nprintln(O.x)')).toBe('1\n')
  })
  it('companion không có thành viên được hỏi thì báo lỗi', () => {
    expect(
      loi('class A {\n    companion object {\n        val x = 1\n    }\n}\nprintln(A.y)'),
    ).toContain('thanh vien')
  })
  it('hỏi thành viên trên lớp không có companion', () => {
    expect(loi('class A\nprintln(A.x)')).toContain('thanh vien')
  })
  it('enum không có hằng được hỏi', () => {
    expect(loi('enum class M { A }\nprintln(M.B)')).toContain('thanh vien')
  })
  it('hàm mặc định của interface gọi được qua lớp con', () => {
    expect(
      ra(`interface I {
    fun ten(): String
    fun chao() = "chao " + ten()
}
open class A : I {
    override fun ten() = "a"
}
class B : A()
println(B().chao())`),
    ).toBe('chao a\n')
  })
})

describe('ca biên — smart cast không suy quá xa', () => {
  it('smart cast qua && giữ được cho cả hai biến', () => {
    expect(
      ra(`val a: String? = "x"
val b: String? = "yy"
if (a != null && b != null) println(a.length + b.length)`),
    ).toBe('3\n')
  })
  it('nhánh else của if (x == null) biết x khác null', () => {
    expect(
      ra(`val s: String? = "abc"
if (s == null) {
    println("rong")
} else {
    println(s.length)
}`),
    ).toBe('3\n')
  })
  it('KHÔNG suy qua ?: — đúng như bảng khác biệt đã ghi', () => {
    // Kotlin thật cho phép; bộ chạy cố ý không suy, nên bài học phải viết tường minh.
    expect(
      loi('val s: String? = null\nval t = s ?: "x"\nval n: String? = s\nprintln(n.length)'),
    ).toContain('co the null')
  })
  it('kiểu trả về nullable của hàm tự viết được theo dõi', () => {
    expect(loi('fun f(): String? = "x"\nprintln(f().length)')).toContain('co the null')
  })
  it('tham số hàm khai nullable cũng được theo dõi', () => {
    expect(loi('fun f(s: String?) = s.length\nprintln(f("a"))')).toContain('co the null')
  })
  it('as? cho ra giá trị có thể null', () => {
    expect(loi('val x: Any = 1\nval s = x as? String\nprintln(s.length)')).toContain('co the null')
  })
})
