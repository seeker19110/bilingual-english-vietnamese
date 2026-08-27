import { describe, it, expect } from 'vitest'
import { chayKotlin } from './chayKotlin.js'

/** Chạy và trả về output đã bỏ dòng tự khai — để ca kiểm đọc gọn. */
function ra(src: string): string {
  const r = chayKotlin(src)
  return r.output.split('\n').slice(1).join('\n')
}

describe('khoi dong bo chay Kotlin', () => {
  it('in ra chuoi', () => {
    expect(ra('fun main() { println("xin chao") }')).toBe('xin chao\n')
  })
  it('chay ma o cap cao nhat, khong can main', () => {
    expect(ra('println(1 + 2)')).toBe('3\n')
  })
  it('chia hai Int la chia nguyen', () => {
    expect(ra('println(7 / 2)')).toBe('3\n')
  })
  it('Double in kem .0', () => {
    expect(ra('println(7.0 / 2)')).toBe('3.5\n')
  })
  it('noi suy chuoi', () => {
    expect(ra('val t = "Lan"\nval n = 3\nprintln("$t co ${n * 2} quyen")')).toBe('Lan co 6 quyen\n')
  })
  it('val khong gan lai duoc', () => {
    expect(chayKotlin('val a = 1\na = 2').error).toContain('val')
  })
  it('for tren khoang', () => {
    expect(ra('for (i in 1..3) print(i)')).toBe('123')
  })
  it('when co chu de', () => {
    expect(
      ra(
        'val x = 2\nwhen (x) { 1 -> println("mot"); 2 -> println("hai"); else -> println("khac") }',
      ),
    ).toBe('hai\n')
  })
  it('if la bieu thuc', () => {
    expect(ra('val a = if (3 > 2) "to" else "nho"\nprintln(a)')).toBe('to\n')
  })
  it('data class co toString san', () => {
    expect(ra('data class N(val ten: String, val tuoi: Int)\nprintln(N("Lan", 20))')).toBe(
      'N(ten=Lan, tuoi=20)\n',
    )
  })
  it('lambda va map/filter', () => {
    expect(ra('val ds = listOf(1,2,3,4)\nprintln(ds.filter { it % 2 == 0 }.map { it * 10 })')).toBe(
      '[20, 40]\n',
    )
  })
  it('null: dung thang dau cham la loi du dang co gia tri', () => {
    const r = chayKotlin('val s: String? = "hi"\nprintln(s.length)')
    expect(r.error).toContain('co the null')
  })
  it('null: smart cast sau if != null', () => {
    expect(ra('val s: String? = "hi"\nif (s != null) { println(s.length) }')).toBe('2\n')
  })
  it('null: elvis', () => {
    expect(ra('val s: String? = null\nprintln(s ?: "khong co")')).toBe('khong co\n')
  })
  it('null: ?. tra null', () => {
    expect(ra('val s: String? = null\nprintln(s?.length)')).toBe('null\n')
  })
  it('null: !! tren null thi dung chuong trinh', () => {
    expect(chayKotlin('val s: String? = null\nprintln(s!!.length)').error).toContain('!!')
  })
  it('lop, ke thua, override', () => {
    expect(
      ra(
        'open class A(val ten: String) { open fun keu() = "A $ten" }\nclass B(ten: String) : A(ten) { override fun keu() = "B $ten" }\nprintln(B("x").keu())',
      ),
    ).toBe('B x\n')
  })
  it('sealed class + when is', () => {
    expect(
      ra(
        'sealed class R\nclass Ok(val v: Int) : R()\nclass Loi(val m: String) : R()\nval r: R = Ok(5)\nwhen (r) { is Ok -> println("ok ${r.v}"); is Loi -> println("loi") }',
      ),
    ).toBe('ok 5\n')
  })
  it('enum class', () => {
    expect(ra('enum class M { DO, XANH }\nprintln(M.DO)\nprintln(M.XANH.ordinal)')).toBe('DO\n1\n')
  })
  it('map tra null khi thieu khoa', () => {
    expect(ra('val m = mapOf("a" to 1)\nprintln(m["b"])')).toBe('null\n')
  })
  it('fold', () => {
    expect(ra('println(listOf(1,2,3).fold(0) { a, b -> a + b })')).toBe('6\n')
  })
  it('try catch', () => {
    expect(
      ra(
        'try { throw Exception("hong") } catch (e: Exception) { println("bat duoc: ${e.message}") }',
      ),
    ).toBe('bat duoc: hong\n')
  })
  it('tran buoc chan vong lap vo tan', () => {
    expect(chayKotlin('while (true) { }', [], { tranBuoc: 500 }).error).toContain('vong lap')
  })
})
