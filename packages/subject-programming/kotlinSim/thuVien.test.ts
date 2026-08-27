// THƯ VIỆN DỰNG SẴN của bộ chạy Kotlin — cổng phủ từng hàm một (PR-M7).
//
// Vì sao tách khỏi conformance.test.ts: bộ ca đối chiếu canh NGỮ NGHĨA NGÔN NGỮ (mỗi tính năng
// cú pháp một ca, và sẽ được chạy lại trên kotlinc thật). File này canh BỀ MẶT THƯ VIỆN — danh
// sách hàm mà học viên gõ hằng ngày. Hai thứ hỏng theo hai kiểu khác nhau: ngữ nghĩa sai thì
// dạy sai ngôn ngữ, còn thiếu một hàm thư viện thì bài học tắc giữa chừng mà không ai biết
// trước.
import { describe, expect, it } from 'vitest'
import { chayKotlin } from './chayKotlin.js'

/** Chạy và trả về output đã bỏ dòng tự khai. */
function ra(src: string): string {
  const r = chayKotlin(src)
  expect(r.error, `Doan nay dang le chay duoc:\n${src}\nLoi: ${r.error}`).toBeUndefined()
  return r.output.split('\n').slice(1).join('\n')
}

/** Chạy một biểu thức và trả về đúng dòng in ra. */
function bt(bieuThuc: string, chuanBi = ''): string {
  return ra(`${chuanBi}\nprintln(${bieuThuc})`).trimEnd()
}

describe('thư viện — chuỗi', () => {
  it.each([
    ['"Abc".uppercase()', 'ABC'],
    ['"Abc".lowercase()', 'abc'],
    ['"  x  ".trim()', 'x'],
    ['"".isEmpty()', 'true'],
    ['"a".isNotEmpty()', 'true'],
    ['"   ".isBlank()', 'true'],
    ['"a ".isNotBlank()', 'true'],
    ['"abc".length', '3'],
    ['"abc".contains("b")', 'true'],
    ['"abc".startsWith("ab")', 'true'],
    ['"abc".endsWith("bc")', 'true'],
    ['"abcb".indexOf("b")', '1'],
    ['"abcdef".substring(1, 3)', 'bc'],
    ['"abcdef".substring(4)', 'ef'],
    ['"a-b-a".replace("a", "x")', 'x-b-x'],
    ['"a,b".split(",")', '[a, b]'],
    ['"abc".reversed()', 'cba'],
    ['"ab".repeat(3)', 'ababab'],
    ['"7".padStart(3, "0")', '007'],
    ['"7".padEnd(3, "0")', '700'],
    ['"abc".first()', 'a'],
    ['"abc".last()', 'c'],
    ['"42".toInt()', '42'],
    ['"4.5".toDouble()', '4.5'],
    ['"x".toDoubleOrNull()', 'null'],
    ['"abc".toString()', 'abc'],
    ['"abc".get(1)', 'b'],
    ['"abc"[2]', 'c'],
    ['"abc".indices', '0..2'],
  ])('%s → %s', (bieuThuc, mong) => {
    expect(bt(bieuThuc)).toBe(mong)
  })
})

describe('thư viện — số và ký tự', () => {
  it.each([
    ['5.toString()', '5'],
    ['5.7.toInt()', '5'],
    ['5.toDouble()', '5.0'],
    ['3.coerceAtLeast(5)', '5'],
    ['9.coerceAtMost(5)', '5'],
    ['maxOf(2, 9)', '9'],
    ['minOf(2, 9)', '2'],
    ["'a'.toString()", 'a'],
    ["'a'.uppercaseChar()", 'A'],
    ["'A'.lowercaseChar()", 'a'],
    ["'7'.isDigit()", 'true'],
    ["'x'.isLetter()", 'true'],
    ['true.toString()', 'true'],
  ])('%s → %s', (bieuThuc, mong) => {
    expect(bt(bieuThuc)).toBe(mong)
  })
})

describe('thư viện — danh sách', () => {
  const ds = 'val ds = listOf(3, 1, 2)'
  it.each([
    ['ds.size', '3'],
    ['ds.isEmpty()', 'false'],
    ['ds.isNotEmpty()', 'true'],
    ['ds.contains(2)', 'true'],
    ['ds.indexOf(1)', '1'],
    ['ds.get(0)', '3'],
    ['ds.first()', '3'],
    ['ds.firstOrNull()', '3'],
    ['ds.last()', '2'],
    ['ds.lastOrNull()', '2'],
    ['ds.lastIndex', '2'],
    ['ds.indices', '0..2'],
    ['ds.reversed()', '[2, 1, 3]'],
    ['ds.take(2)', '[3, 1]'],
    ['ds.drop(2)', '[2]'],
    ['ds.sorted()', '[1, 2, 3]'],
    ['ds.sum()', '6'],
    ['ds.average()', '2.0'],
    ['ds.maxOrNull()', '3'],
    ['ds.minOrNull()', '1'],
    ['ds.toList()', '[3, 1, 2]'],
    ['ds.toSet()', '[3, 1, 2]'],
    ['ds.joinToString("-")', '3-1-2'],
    ['ds.toString()', '[3, 1, 2]'],
    ['ds.map { it + 1 }', '[4, 2, 3]'],
    ['ds.mapIndexed { i, x -> i * x }', '[0, 1, 4]'],
    ['ds.filter { it > 1 }', '[3, 2]'],
    ['ds.filterNot { it > 1 }', '[1]'],
    ['ds.any { it > 2 }', 'true'],
    ['ds.any()', 'true'],
    ['ds.all { it > 0 }', 'true'],
    ['ds.none { it > 9 }', 'true'],
    ['ds.none()', 'false'],
    ['ds.count()', '3'],
    ['ds.count { it > 1 }', '2'],
    ['ds.find { it == 2 }', '2'],
    ['ds.find { it == 9 }', 'null'],
    ['ds.sumOf { it * 2 }', '12'],
    ['ds.maxByOrNull { -it }', '1'],
    ['ds.minByOrNull { -it }', '3'],
    ['ds.sortedBy { it }', '[1, 2, 3]'],
    ['ds.sortedByDescending { it }', '[3, 2, 1]'],
    ['ds.fold(10) { a, b -> a + b }', '16'],
    ['ds.reduce { a, b -> a + b }', '6'],
    ['ds.flatMap { listOf(it, it) }', '[3, 3, 1, 1, 2, 2]'],
    ['ds.distinct()', '[3, 1, 2]'],
    ['ds.groupBy { it % 2 }', '{0=[2], 1=[3, 1]}'],
    ['ds.associateWith { it * 2 }', '{1=2, 2=4, 3=6}'],
    ['ds.joinToString(", ") { "n$it" }', 'n3, n1, n2'],
  ])('%s → %s', (bieuThuc, mong) => {
    expect(bt(bieuThuc, ds)).toBe(mong)
  })

  it('sắp chuỗi theo thứ tự chữ cái', () => {
    expect(bt('listOf("b", "a").sorted()')).toBe('[a, b]')
    expect(bt('listOf("b", "a").sortedBy { it }')).toBe('[a, b]')
  })

  it('danh sách sửa được: add, remove, removeAt, gán theo chỉ số', () => {
    expect(
      ra(`val ds = mutableListOf(1, 2, 3)
ds.add(4)
ds.remove(2)
ds.removeAt(0)
ds[0] = 9
println(ds)
println(ds.toMutableList())`),
    ).toBe('[9, 4]\n[9, 4]\n')
  })

  it('remove phần tử không có trả về false', () => {
    expect(bt('ds.remove(9)', 'val ds = mutableListOf(1)')).toBe('false')
  })

  it('forEach và forEachIndexed', () => {
    expect(ra('listOf("a", "b").forEach { print(it) }\nprintln()')).toBe('ab\n')
    expect(ra('listOf("a", "b").forEachIndexed { i, x -> print("$i$x") }\nprintln()')).toBe(
      '0a1b\n',
    )
  })

  it('cộng hai danh sách', () => {
    expect(bt('listOf(1) + listOf(2)')).toBe('[1, 2]')
  })

  it('setOf loại phần tử trùng', () => {
    expect(bt('setOf(1, 2, 1)')).toBe('[1, 2]')
    expect(bt('mutableSetOf(1, 1)')).toBe('[1]')
  })

  it('emptyList và danh sách rỗng', () => {
    expect(bt('emptyList<Int>()')).toBe('[]')
    expect(bt('listOf<Int>().firstOrNull()')).toBe('null')
    expect(bt('listOf<Int>().lastOrNull()')).toBe('null')
    expect(bt('listOf<Int>().maxOrNull()')).toBe('null')
    expect(bt('listOf<Int>().minOrNull()')).toBe('null')
    expect(bt('listOf<Int>().maxByOrNull { it }')).toBe('null')
    expect(bt('listOf<Int>().minByOrNull { it }')).toBe('null')
  })

  it('duyệt khoảng bằng hàm bậc cao', () => {
    expect(bt('(1..3).map { it * 2 }')).toBe('[2, 4, 6]')
    expect(bt('(1..3).sum()')).toBe('6')
    expect(bt('(1..3).first')).toBe('1')
    expect(bt('(1..3).last')).toBe('3')
  })
})

describe('thư viện — Map và Pair', () => {
  const m = 'val m = mapOf("b" to 2, "a" to 1)'
  it.each([
    ['m.size', '2'],
    ['m["a"]', '1'],
    ['m.get("b")', '2'],
    ['m.containsKey("a")', 'true'],
    ['m.isEmpty()', 'false'],
    ['m.isNotEmpty()', 'true'],
    ['m.getOrDefault("z", 0)', '0'],
    ['m.getOrDefault("a", 0)', '1'],
    ['m.keys', '[a, b]'],
    ['m.values', '[1, 2]'],
    ['m.toString()', '{a=1, b=2}'],
    ['m.entries', '[(a, 1), (b, 2)]'],
    ['m.map { it.first }', '[a, b]'],
  ])('%s → %s', (bieuThuc, mong) => {
    expect(bt(bieuThuc, m)).toBe(mong)
  })

  it('Map sửa được: put, remove, gán theo khoá', () => {
    expect(
      ra(`val m = mutableMapOf("a" to 1)
m.put("b", 2)
m["c"] = 3
m.remove("a")
println(m)`),
    ).toBe('{b=2, c=3}\n')
  })

  it('mapOf khoá trùng thì lần sau đè lần trước', () => {
    expect(bt('mapOf("a" to 1, "a" to 2)')).toBe('{a=2}')
  })

  it('Pair: first, second, in ra', () => {
    expect(bt('Pair(1, "x")')).toBe('(1, x)')
    expect(bt('("a" to 2).first')).toBe('a')
    expect(bt('("a" to 2).second')).toBe('2')
    expect(bt('("a" to 2).toString()')).toBe('(a, 2)')
  })

  it('duyệt Map bằng for cho ra từng cặp', () => {
    expect(ra('for ((k, v) in mapOf("a" to 1)) println("$k=$v")')).toBe('a=1\n')
  })
})

describe('thư viện — hàm toàn cục và ngoại lệ dựng sẵn', () => {
  it('require đúng thì đi tiếp, sai thì ném', () => {
    expect(ra('require(true)\nprintln("qua")')).toBe('qua\n')
    expect(chayKotlin('require(false) { "khong dat" }').error).toContain('khong dat')
  })
  it('error() ném ngoại lệ mang thông điệp', () => {
    expect(chayKotlin('error("hong")').error).toContain('hong')
  })
  it('run gọi một khối', () => {
    expect(bt('run { 42 }')).toBe('42')
  })
  it('println không tham số in dòng trống', () => {
    expect(ra('println()')).toBe('\n')
  })
  it('print không tham số không in gì', () => {
    expect(ra('print()\nprint("x")')).toBe('x')
  })
  it('các lớp ngoại lệ dựng sẵn đều dùng được', () => {
    for (const ten of [
      'Exception',
      'RuntimeException',
      'IllegalArgumentException',
      'IllegalStateException',
      'NumberFormatException',
    ]) {
      expect(chayKotlin(`throw ${ten}("x")`).error).toContain('x')
    }
  })
  it('catch bắt theo kiểu và finally vẫn chạy khi có lỗi', () => {
    expect(
      ra(`try {
    throw IllegalStateException("a")
} catch (e: IllegalStateException) {
    println("bat")
} finally {
    println("cuoi")
}`),
    ).toBe('bat\ncuoi\n')
  })
  it('catch không khớp kiểu thì ngoại lệ đi tiếp ra ngoài', () => {
    const r = chayKotlin(`try { throw Exception("x") } catch (e: KhongCo) { println("bat") }`)
    expect(r.error).toBeDefined()
  })
  it('try dùng như biểu thức', () => {
    expect(bt('try { "a".toInt() } catch (e: Exception) { -1 }')).toBe('-1')
  })
})

describe('thư viện — enum, object, companion, is/as', () => {
  it('valueOf tra theo tên, tên lạ thì ném', () => {
    expect(bt('Mau.valueOf("DO")', 'enum class Mau { DO, XANH }')).toBe('DO')
    expect(chayKotlin('enum class Mau { DO }\nprintln(Mau.valueOf("TIM"))').error).toContain('TIM')
  })
  it('as ép kiểu đúng thì qua, sai thì lỗi, as? trả null', () => {
    expect(bt('("x" as String)')).toBe('x')
    expect(bt('(1 as? String)')).toBe('null')
    expect(chayKotlin('println(1 as String)').error).toContain('ep')
  })
  it('is với Any và Number', () => {
    expect(bt('1 is Any')).toBe('true')
    expect(bt('1 is Number')).toBe('true')
    expect(bt('"x" is Number')).toBe('false')
  })
  it('is nhận biết lớp cha và interface', () => {
    expect(
      ra(`interface G
open class A : G
class B : A()
val b: Any = B()
println(b is A)
println(b is G)
println(b is B)`),
    ).toBe('true\ntrue\ntrue\n')
  })
})

describe('thư viện — chuỗi có ký tự thoát và chú thích', () => {
  it('ký tự thoát trong chuỗi', () => {
    expect(ra('println("a\\tb")')).toBe('a\tb\n')
    expect(ra('println("say \\"hi\\"")')).toBe('say "hi"\n')
    expect(ra('println("gia 5\\$")')).toBe('gia 5$\n')
  })
  it('chú thích một dòng và chú thích khối lồng nhau', () => {
    expect(ra('// bo qua\nprintln(1) /* trong /* long */ nua */')).toBe('1\n')
  })
  it('dấu chấm phẩy tuỳ chọn', () => {
    expect(ra('println(1); println(2)')).toBe('1\n2\n')
  })
  it('số có gạch dưới cho dễ đọc', () => {
    expect(bt('1_000_000')).toBe('1000000')
  })
  it('hậu tố L và f được chấp nhận', () => {
    expect(bt('5L')).toBe('5')
    expect(bt('5f')).toBe('5.0')
  })
})

describe('thư viện — biểu thức điều khiển dùng làm giá trị', () => {
  it('when làm biểu thức, có khối nhiều lệnh', () => {
    expect(
      bt(`when (2) {
    1 -> "mot"
    2 -> { "hai" }
    else -> "khac"
}`),
    ).toBe('hai')
  })
  it('when không khớp nhánh nào và không có else trả Unit', () => {
    expect(ra('when (9) { 1 -> println("mot") }\nprintln("xong")')).toBe('xong\n')
  })
  it('when với !in và !is', () => {
    expect(
      ra(`val x: Any = 50
when (x) {
    !in 1..9 -> println("ngoai")
    else -> println("trong")
}
when (x) {
    !is String -> println("khong phai chuoi")
    else -> println("chuoi")
}`),
    ).toBe('ngoai\nkhong phai chuoi\n')
  })
  it('if làm biểu thức với nhánh là khối', () => {
    expect(bt('if (true) { 1 } else { 2 }')).toBe('1')
  })
  it('elvis nối chuỗi phải sang phải', () => {
    expect(bt('a ?: b ?: "cuoi"', 'val a: String? = null\nval b: String? = null')).toBe('cuoi')
  })
  it('elvis kèm throw — mẫu phổ biến của Kotlin', () => {
    expect(
      chayKotlin('val a: String? = null\nval b = a ?: throw Exception("thieu")').error,
    ).toContain('thieu')
  })
})

describe('thư viện — hàm và lambda', () => {
  it('lambda gán vào biến rồi gọi lại', () => {
    expect(ra('val f = { x: Int -> x * 2 }\nprintln(f(4))')).toBe('8\n')
  })
  it('hàm nhận lambda làm tham số', () => {
    expect(
      ra(`fun ap(x: Int, f: (Int) -> Int) = f(x)
println(ap(3) { it + 1 })`),
    ).toBe('4\n')
  })
  it('return trần trong hàm không trả giá trị', () => {
    expect(ra('fun f(x: Int) {\n    if (x > 0) return\n    println("am")\n}\nf(1)\nf(-1)')).toBe(
      'am\n',
    )
  })
  it('hàm cục bộ khai trong thân hàm khác', () => {
    expect(
      ra('fun ngoai(): Int {\n    fun trong() = 7\n    return trong()\n}\nprintln(ngoai())'),
    ).toBe('7\n')
  })
  it('đệ quy', () => {
    expect(ra('fun gt(n: Int): Int = if (n <= 1) 1 else n * gt(n - 1)\nprintln(gt(5))')).toBe(
      '120\n',
    )
  })
  it('toán tử tăng giảm và gán rút gọn', () => {
    expect(
      ra(`var a = 5
a += 2
a -= 1
a *= 2
a /= 3
a %= 3
println(a)
var s = "x"
s += "y"
println(s)`),
    ).toBe('1\nxy\n')
  })
  it('so sánh chuỗi theo thứ tự chữ cái', () => {
    expect(bt('"a" < "b"')).toBe('true')
    expect(bt('"b" >= "a"')).toBe('true')
  })
  it('=== và !== so như == và != trong bộ chạy này', () => {
    expect(bt('1 === 1')).toBe('true')
    expect(bt('1 !== 2')).toBe('true')
  })
  it('toán tử một ngôi + và -', () => {
    expect(bt('-(-3)')).toBe('3')
    expect(bt('+5')).toBe('5')
    expect(bt('!false')).toBe('true')
  })
  it('&& và || ngắn mạch', () => {
    expect(
      ra('fun no(): Boolean { println("chay"); return true }\nval a = false && no()\nprintln(a)'),
    ).toBe('false\n')
    expect(
      ra('fun no(): Boolean { println("chay"); return true }\nval a = true || no()\nprintln(a)'),
    ).toBe('true\n')
  })
})

describe('thư viện — lớp nâng cao', () => {
  it('abstract class không tạo trực tiếp được', () => {
    expect(chayKotlin('abstract class A\nprintln(A())').error).toContain('truu tuong')
  })
  it('interface không tạo thể hiện được', () => {
    expect(chayKotlin('interface I\nprintln(I())').error).toContain('interface')
  })
  it('thuộc tính var của đối tượng gán lại được, val thì không', () => {
    expect(ra('class A(var x: Int)\nval a = A(1)\na.x = 5\nprintln(a.x)')).toBe('5\n')
    expect(chayKotlin('class A(val x: Int)\nval a = A(1)\na.x = 5').error).toContain('val')
  })
  it('gọi thuộc tính không có thì báo tên lớp', () => {
    expect(chayKotlin('class A\nprintln(A().khongCo)').error).toContain('A')
  })
  it('kế thừa nhiều tầng giữ được thuộc tính của ông', () => {
    expect(
      ra(`open class A(val a: Int)
open class B(a: Int, val b: Int) : A(a)
class C(a: Int, b: Int) : B(a, b)
val c = C(1, 2)
println("${'$'}{c.a}-${'$'}{c.b}")`),
    ).toBe('1-2\n')
  })
  it('companion object có cả thuộc tính', () => {
    expect(
      ra('class A {\n    companion object {\n        val ten = "A"\n    }\n}\nprintln(A.ten)'),
    ).toBe('A\n')
  })
  it('data class copy giữ nguyên trường không đổi', () => {
    expect(ra('data class D(val a: Int, val b: Int)\nprintln(D(1, 2).copy(a = 9))')).toBe(
      'D(a=9, b=2)\n',
    )
  })
  it('copy phải gọi bằng tham số có tên', () => {
    expect(chayKotlin('data class D(val a: Int)\nprintln(D(1).copy(9))').error).toContain('ten')
  })
  it('object dùng làm không gian tên', () => {
    expect(ra('object N {\n    fun f() = 1\n}\nprintln(N.f())')).toBe('1\n')
  })
  it('lớp lồng trong lớp báo lỗi rõ ràng (ngoài tập con)', () => {
    expect(chayKotlin('class A {\n    class B\n}').error).toContain('long')
  })
})
