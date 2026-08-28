// Kế thừa, `super`, và các nhánh điều khiển của bộ chạy Kotlin rút gọn.
//
// Vì sao có file này: `super.f()` từng gọi VÒNG VÔ TẬN — `super` trả về chính `this`, nên lời
// gọi lại rơi đúng vào hàm vừa ghi đè. Hệ quả không phải một lỗi tiếng Việt mà là RangeError
// của JavaScript thoát ra ngoài `chayKotlin()`, tức sập cả runner. Các ca dưới đây canh để
// chuyện đó không quay lại.
import { describe, it, expect } from 'vitest'
import { chayKotlin } from './chayKotlin.js'

/** Chạy và bỏ dòng tự khai — để ca kiểm đọc gọn. */
function ra(src: string): string {
  return chayKotlin(src).output.split('\n').slice(1).join('\n')
}

describe('ke thua va super', () => {
  it('lop con ghi de ham cua lop cha', () => {
    expect(
      ra(
        'open class A { open fun f() = "A" }\nclass B : A() { override fun f() = "B" }\nprintln(B().f())',
      ),
    ).toBe('B\n')
  })

  it('super.f() goi ban cua lop CHA, khong goi lai chinh no', () => {
    expect(
      ra(
        'open class A { open fun f() = "A" }\nclass B : A() { override fun f() = super.f() + "B" }\nprintln(B().f())',
      ),
    ).toBe('AB\n')
  })

  it('super.f() dung qua ba tang ke thua', () => {
    expect(
      ra(
        [
          'open class A { open fun f() = "A" }',
          'open class B : A() { override fun f() = super.f() + "B" }',
          'class C : B() { override fun f() = super.f() + "C" }',
          'println(C().f())',
        ].join('\n'),
      ),
    ).toBe('ABC\n')
  })

  it('super.f() nhay qua lop giua khong ghi de', () => {
    expect(
      ra(
        [
          'open class A { open fun f() = "A" }',
          'open class B : A()',
          'class C : B() { override fun f() = super.f() + "C" }',
          'println(C().f())',
        ].join('\n'),
      ),
    ).toBe('AC\n')
  })

  it('super trong lop khong ke thua ai la loi co huong dan', () => {
    const r = chayKotlin('class A { fun f() = super.toString() }\nprintln(A().f())')
    expect(r.error).toContain('khong ke thua lop nao')
  })

  it('super ngoai lop la loi', () => {
    expect(chayKotlin('println(super.toString())').error).toContain(
      '"super" chi dung duoc ben trong mot lop',
    )
  })

  it('super voi THUOC TINH bi ghi de bao dung ly do', () => {
    const r = chayKotlin(
      'open class A { open val ten = "A" }\nclass B : A() { override val ten = "B"\nfun ca() = super.ten }\nprintln(B().ca())',
    )
    expect(r.error).toContain('la THUOC TINH')
  })

  it('bien ten bat dau bang "super" khong bi khoa an cua super che mat', () => {
    expect(ra('val superLop = 5\nprintln(superLop)')).toBe('5\n')
  })

  it('giao dien: kiem "is" tren kieu giao dien', () => {
    expect(
      ra(
        'interface I { fun f(): String }\nclass C : I { override fun f() = "i" }\nval x: I = C()\nprintln(x is I)',
      ),
    ).toBe('true\n')
  })
})

describe('vong lap va nhay', () => {
  it('do-while chay than it nhat mot lan roi moi kiem dieu kien', () => {
    expect(ra('var i = 9\ndo { print(i) } while (i < 5)')).toBe('9')
  })
  it('continue trong do-while bo qua phan con lai cua vong', () => {
    expect(ra('var i = 0\ndo { i++; if (i == 2) continue; print(i) } while (i < 4)')).toBe('134')
  })
  it('break thoat do-while', () => {
    expect(ra('var i = 0\ndo { i++; if (i == 3) break; print(i) } while (i < 9)')).toBe('12')
  })
  it('continue trong while', () => {
    expect(ra('var i = 0\nwhile (i < 4) { i++; if (i == 2) continue; print(i) }')).toBe('134')
  })
  it('downTo dem lui', () => {
    expect(ra('for (i in 3 downTo 1) print(i)')).toBe('321')
  })
  it('step nhay quang', () => {
    expect(ra('for (i in 1..5 step 2) print(i)')).toBe('135')
  })
  it('step khong duong la loi', () => {
    expect(chayKotlin('for (i in 1..5 step 0) print(i)').error).toContain('phai la so duong')
  })
  it('for tren gia tri khong duyet duoc la loi co huong dan', () => {
    expect(chayKotlin('for (x in 5) print(x)').error).toContain('Chi duyet duoc List, Set, Map')
  })
})

describe('try / catch / finally', () => {
  it('finally chay ke ca khi khong co loi', () => {
    expect(ra('try { println("a") } finally { println("f") }')).toBe('a\nf\n')
  })
  it('finally chay truoc khi loi bay ra ngoai', () => {
    expect(
      ra(
        'try { try { throw RuntimeException("x") } finally { println("f") } } catch (e: Exception) { println("bat") }',
      ),
    ).toBe('f\nbat\n')
  })
  it('catch co kieu chi bat dung kieu do', () => {
    expect(
      ra(
        'try { throw IllegalStateException("x") } catch (e: IllegalStateException) { println("khop") }',
      ),
    ).toBe('khop\n')
  })
  it('catch khong ghi kieu thi bat moi thu', () => {
    expect(ra('try { throw RuntimeException("x") } catch (e) { println("moi") }')).toBe('moi\n')
  })
  it('ngoai le khong ai bat thi dung chuong trinh, khong lam sap bo chay', () => {
    const r = chayKotlin('throw RuntimeException("hu")')
    expect(r.error).toContain('khong co "try { … } catch { … }" nao bat')
  })
})

describe('in gia tri va ten kieu', () => {
  it('Set in nhu List', () => {
    expect(ra('println(setOf(1, 2))')).toBe('[1, 2]\n')
  })
  it('Map in dang khoa=gia', () => {
    expect(ra('println(mapOf("a" to 1))')).toBe('{a=1}\n')
  })
  it('Pair in dang (a, b)', () => {
    expect(ra('println(Pair(1, "x"))')).toBe('(1, x)\n')
  })
  it('khoang in dang tu..den', () => {
    expect(ra('println(1..3)')).toBe('1..3\n')
  })
  it('lambda in ra (ham)', () => {
    expect(ra('val f = { x: Int -> x }\nprintln(f)')).toBe('(ham)\n')
  })
  it('enum in ra ten hang', () => {
    expect(ra('enum class M { A, B }\nprintln(M.A)')).toBe('A\n')
  })
  it('ngoai le in dung dang toString cua JVM', () => {
    expect(ra('println(RuntimeException("hu"))')).toBe('java.lang.RuntimeException: hu\n')
  })
  it('data class in ra tung truong', () => {
    expect(ra('data class P(val a: Int)\nprintln(P(1))')).toBe('P(a=1)\n')
  })
  it('lop thuong khong in noi dung', () => {
    expect(ra('class Q(val a: Int)\nprintln(Q(1))')).toBe('Q@doiTuong\n')
  })
  it('println tra ve Unit', () => {
    expect(ra('println(println("x"))')).toBe('x\nkotlin.Unit\n')
  })
  it('ten kieu hien trong thong bao loi', () => {
    expect(chayKotlin('println(-"a")').error).toContain('kieu String')
    expect(chayKotlin('if (1) println("x")').error).toContain('dang la Int')
  })
})

describe('so sanh va toan tu', () => {
  it('=== so tham chieu, hai doi tuong khac nhau thi khac', () => {
    expect(ra('class Q\nprintln(Q() !== Q())')).toBe('true\n')
  })
  it('=== tren cung mot doi tuong la true', () => {
    expect(ra('class Q\nval a = Q()\nprintln(a === a)')).toBe('true\n')
  })
  it('== tren Set / Map / Pair so NOI DUNG', () => {
    expect(ra('println(setOf(1, 2) == setOf(1, 2))')).toBe('true\n')
    expect(ra('println(mapOf("a" to 1) == mapOf("a" to 1))')).toBe('true\n')
    expect(ra('println(Pair(1, 2) == Pair(1, 2))')).toBe('true\n')
  })
  it('!in phu dinh phep thuoc ve', () => {
    expect(ra('println(5 !in 1..3)')).toBe('true\n')
  })
  it('in tren Map hoi theo KHOA', () => {
    expect(ra('println("a" in mapOf("a" to 1))')).toBe('true\n')
  })
  it('noi chuoi voi gia tri bat ky', () => {
    expect(ra('println("n=" + listOf(1, 2))')).toBe('n=[1, 2]\n')
  })
  it('chia nguyen cho 0 bao loi ro rang', () => {
    expect(chayKotlin('println(1 / 0)').error).toContain('Chia mot so nguyen cho 0')
  })
})

describe('tach bien (destructuring) va !!', () => {
  it('tach tu Pair', () => {
    expect(ra('val (a, b) = Pair(1, 2)\nprintln(a + b)')).toBe('3\n')
  })
  it('tach tu data class', () => {
    expect(ra('data class P(val a: Int, val b: Int)\nval (x, y) = P(1, 2)\nprintln(x + y)')).toBe(
      '3\n',
    )
  })
  it('tach tu gia tri khong tach duoc la loi co huong dan', () => {
    expect(chayKotlin('val (a, b) = 5').error).toContain('Chi tach duoc Pair, List du dai')
  })
  it('!! tren null dung chuong trinh dung kieu NullPointerException', () => {
    expect(chayKotlin('val s: String? = null\nprintln(s!!)').error).toContain(
      'NullPointerException',
    )
  })
})

describe('when', () => {
  it('when khong co chu de dung nhu chuoi if', () => {
    expect(ra('val n = 5\nwhen { n > 3 -> println("to"); else -> println("nho") }')).toBe('to\n')
  })
  it('when voi "is" khop theo kieu', () => {
    expect(
      ra('val a: Any = "s"\nwhen (a) { is String -> println("chuoi"); else -> println("khac") }'),
    ).toBe('chuoi\n')
  })
  it('when khong khop nhanh nao va khong co else thi khong lam gi', () => {
    expect(ra('val n = 9\nwhen (n) { 1 -> println("a") }')).toBe('')
  })
})

describe('ham', () => {
  it('chay tu main() khi co', () => {
    expect(ra('fun main() { println("m") }')).toBe('m\n')
  })
  it('ham cuc bo trong than ham khac', () => {
    expect(ra('fun main() { fun g() = 5\nprintln(g()) }')).toBe('5\n')
  })
  it('goi mot gia tri khong phai ham la loi', () => {
    expect(chayKotlin('val a = 5\nprintln(a())').error).toBeDefined()
  })
})
