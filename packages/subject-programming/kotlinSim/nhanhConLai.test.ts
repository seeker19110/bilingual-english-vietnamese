// NHÁNH CÒN LẠI của bộ chạy Kotlin — đợt nâng coverage 2026-09-05.
//
// Vì sao có file này: bốn file kia (conformance/thuVien/caBien/loi) đã phủ gần hết interpreter.ts
// nhưng vẫn còn ~126 NHÁNH rẽ chưa từng đi qua — phần lớn là những tổ hợp hiếm nhưng vẫn hợp lệ:
// in ra một tham chiếu hàm (không gọi), so sánh hai giá trị Unit/enum/ngoại lệ bằng "==", gọi
// phương thức qua dấu chấm KHÔNG dùng "!!" trước, when không có chủ đề nhưng vẫn viết mẫu "in"/
// "is", lớp kế thừa một tên chưa từng khai báo, v.v. Mỗi test dưới đây nhắm ĐÚNG một nhánh cụ thể
// (ghi số dòng của interpreter.ts tại thời điểm viết trong tên/mô tả) — không gộp nhiều nhánh vào
// một assertion mơ hồ.
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

describe('nhanh con lai — tenKieuCua() qua thong diep loi "doi dau" (donNguyen "-")', () => {
  // Mỗi ca ép "-" chạy trên một GIA TRỊ không phải số — donNguyen("-") không hỗ trợ kiểu đó nên
  // luôn báo lỗi, và thông điệp lỗi gọi tenKieuCua() để nêu đúng tên kiểu. Đây là cách rẻ nhất để
  // đi qua TỪNG case của switch trong tenKieuCua() mà không cần một API riêng cho từng kiểu.
  it.each([
    ['println(-setOf(1, 2))', 'kieu Set'],
    ['println(-mapOf("a" to 1))', 'kieu Map'],
    ['println(-Pair(1, 2))', 'kieu Pair'],
    ['println(-(1..3))', 'kieu IntRange'],
    ['class A\nprintln(-A)', 'kieu A'],
    ['enum class M { A }\nprintln(-M.A)', 'kieu M'],
    ['val a: Int? = null\nprintln(-a)', 'kieu null'],
  ])('%s → chua "%s"', (src, chua) => {
    expect(loi(src)).toContain(chua)
  })

  it('doi dau tren mot HAM da khai (khong phai lambda) — case "ham"', () => {
    expect(loi('fun f() {}\nval g = f\nprintln(-g)')).toContain('kieu Function')
  })

  it('doi dau tren mot LAMBDA — case "lambda"', () => {
    expect(loi('val g = { 1 }\nprintln(-g)')).toContain('kieu Function')
  })

  it('doi dau tren gia tri Double thi CHAY duoc (khong qua tenKieuCua)', () => {
    expect(ra('println(-5.5)')).toBe('-5.5\n')
  })
})

describe('nhanh con lai — tenKieuCua() qua "khong lay duoc phan tu theo chi so"', () => {
  // layChiSo() chỉ hỗ trợ List/String/Map/null; mọi kiểu khác rơi vào nhánh mặc định gọi
  // tenKieuCua(o) — dùng để phủ nốt case 'double'/'kyTu'/'unit' còn thiếu.
  it.each([
    ['println(5.0[0])', 'Double'],
    ["println('a'[0])", 'Char'],
    ['println(Unit[0])', 'Unit'],
  ])('%s → chua "%s"', (src, chua) => {
    expect(loi(src)).toContain(chua)
  })
})

describe('nhanh con lai — in ra tham chieu HAM va LOP (inGia case "ham"/"lop")', () => {
  it('gan mot ham da khai vao bien roi in — case "ham" cua inGia()', () => {
    expect(ra('fun f() {}\nval g = f\nprintln(g)')).toBe('(ham)\n')
  })

  it('goi thang ten mot ham DUNG SAN (khong ngoac) tra ve tham chieu lop', () => {
    // SAN_CO co "listOf" nhung o day dung nhu MOT GIA TRI (khong goi) — nhanh L661.
    expect(ra('println(listOf)')).toBe('listOf\n')
  })
})

describe('nhanh con lai — bang() (toan tu "==") tren cac kieu it dung', () => {
  it('so sanh int va double bang gia tri, khong bang KIEU', () => {
    expect(ra('println(1 == 1.0)')).toBe('true\n')
  })
  it('hai kieu khac nhau (bool vs int) luon KHONG bang', () => {
    expect(ra('println(true == 1)')).toBe('false\n')
  })
  it('so sanh hai gia tri Boolean', () => {
    expect(ra('println(true == false)')).toBe('false\n')
    expect(ra('println(true == true)')).toBe('true\n')
  })
  it('hai Map khac SO LUONG cap luon khong bang', () => {
    expect(ra('println(mapOf("a" to 1) == mapOf("a" to 1, "b" to 2))')).toBe('false\n')
  })
  it('hai Map cung noi dung thi bang', () => {
    expect(ra('println(mapOf("a" to 1) == mapOf("a" to 1))')).toBe('true\n')
  })
  it('hai hang enum: cung hang thi bang, khac hang thi khong', () => {
    expect(ra('enum class M { A, B }\nprintln(M.A == M.A)')).toBe('true\n')
    expect(ra('enum class M { A, B }\nprintln(M.A == M.B)')).toBe('false\n')
  })
  it('hai ngoai le dung sẵn so NOI DUNG (lop + thong diep), khong so tham chieu', () => {
    expect(ra('val e1 = Exception("a")\nval e2 = Exception("a")\nprintln(e1 == e2)')).toBe('true\n')
  })
  it('data class so NOI DUNG cac truong', () => {
    expect(ra('data class D(val a: Int)\nprintln(D(1) == D(1))')).toBe('true\n')
    expect(ra('data class D(val a: Int)\nprintln(D(1) == D(2))')).toBe('false\n')
  })
  it('Unit va IntRange roi vao nhanh mac dinh (so THAM CHIEU) — hai gia tri tao rieng thi KHONG bang', () => {
    // Day la mot GIOI HAN da biet, khong phai muc tieu cua test: bang() khong co case rieng cho
    // 'unit'/'khoang' nen dung so sanh tham chieu (===) — hai the hien tao doc lap luon la false.
    expect(ra('println(Unit == Unit)')).toBe('false\n')
    expect(ra('println((1..3) == (1..3))')).toBe('false\n')
  })
})

describe('nhanh con lai — chay() khong tu goi "main" neu no khong phai ham', () => {
  it('main la mot BIEN thuong (khong phai ham) thi khong bi goi', () => {
    expect(ra('val main = 5\nprintln(main)')).toBe('5\n')
  })
})

describe('nhanh con lai — lop cuc bo trong than ham', () => {
  it('khai bao class BEN TRONG than mot ham (khong phai cap cao nhat)', () => {
    expect(ra('fun f(): Int {\n    class A(val x: Int)\n    return A(5).x\n}\nprintln(f())')).toBe(
      '5\n',
    )
  })
})

describe('nhanh con lai — khai bao bien khong co gia tri khoi tao', () => {
  it('var khong co kieu, khong co gia tri ban dau', () => {
    expect(ra('var x\nx = 5\nprintln(x)')).toBe('5\n')
  })
  it('var co kieu nhung khong co gia tri ban dau', () => {
    expect(ra('var x: Int\nx = 5\nprintln(x)')).toBe('5\n')
  })
})

describe('nhanh con lai — dieu khien vong lap: break/throw xuyen qua while va do-while', () => {
  it('break trong while', () => {
    expect(ra('var i = 0\nwhile (true) { i++; if (i == 3) break }\nprintln(i)')).toBe('3\n')
  })
  it('loi that (khong phai break/continue) trong while thi DI TIEP ra ngoai', () => {
    expect(
      ra(
        'try {\n    while (true) { throw Exception("boom") }\n} catch (e: Exception) { println("bat: " + e.message) }',
      ),
    ).toBe('bat: boom\n')
  })
  it('loi that trong do-while thi DI TIEP ra ngoai', () => {
    expect(
      ra(
        'try {\n    do { throw Exception("boom2") } while (true)\n} catch (e: Exception) { println("bat: " + e.message) }',
      ),
    ).toBe('bat: boom2\n')
  })
})

describe('nhanh con lai — try/finally voi return (khong phai LoiNem)', () => {
  it('return ben trong try van chay finally truoc khi tra ve', () => {
    expect(
      ra(
        'fun f(): Int {\n    try {\n        return 5\n    } finally {\n        println("cuoi")\n    }\n}\nprintln(f())',
      ),
    ).toBe('cuoi\n5\n')
  })
})

describe('nhanh con lai — when khong co chu de nhung van viet mau "in"/"is"', () => {
  // Cu phap nay ky la (Kotlin that khong co ich gi khi dung) nhung parser van cho qua; luc chay
  // khopMau() khong co chu de (gia===undefined) nen luon coi la KHONG khop, roi qua else.
  it('mau "in" trong when khong chu de luon khong khop', () => {
    expect(ra('when {\n    in 1..3 -> println("a")\n    else -> println("b")\n}')).toBe('b\n')
  })
  it('mau "is" trong when khong chu de luon khong khop', () => {
    expect(ra('when {\n    is Int -> println("a")\n    else -> println("b")\n}')).toBe('b\n')
  })
})

describe('nhanh con lai — lop ke thua mot ten CHUA TUNG khai bao', () => {
  // Parser khong kiem tra ten lop cha co ton tai hay khong; luc chay, is-check va tra ham deu
  // phai DUNG LAI giua chung khi leo len gap mot ten khong co trong bo chay.
  it('is-check dung lai khi gap lop cha khong ton tai', () => {
    expect(ra('class B : KhongCoThat()\nval b = B()\nprintln(b is B)\nprintln(b is KhacNua)')).toBe(
      'true\nfalse\n',
    )
  })
  it('tra ham cung dung lai, bao loi ro rang thay vi vong vo tan', () => {
    expect(
      loi(
        'class B : KhongCoThat() {\n    fun greet() = "hi"\n}\nval b = B()\nprintln(b.greet())\nprintln(b.missing())',
      ),
    ).toContain('B khong co "missing"')
  })
})

describe('nhanh con lai — catch bat theo LOP CHA cua ngoai le dung san', () => {
  it('catch (e: RuntimeException) bat duoc IllegalStateException', () => {
    expect(
      ra(
        'try {\n    throw IllegalStateException("x")\n} catch (e: RuntimeException) {\n    println("caught: " + e.message)\n}',
      ),
    ).toBe('caught: x\n')
  })
  it('catch (e: IllegalArgumentException) bat duoc NumberFormatException', () => {
    expect(
      ra(
        'try {\n    "abc".toInt()\n} catch (e: IllegalArgumentException) {\n    println("caught nfe")\n}',
      ),
    ).toBe('caught nfe\n')
  })
})

describe('nhanh con lai — smart cast: chieu ngoc va truong hop khong suy duoc', () => {
  it('null != s (dao chieu so voi s != null) van smart-cast duoc', () => {
    expect(ra('val s: String? = "hi"\nif (null != s) { println(s.length) }')).toBe('2\n')
  })
  it('so sanh voi null ma khong ben nao la TEN bien thi khong lam gi (khong crash)', () => {
    expect(ra('if (5 != null) { println("ok") }')).toBe('ok\n')
  })
  it('nhanh SAI huong (if (s == null) roi dung s trong CHINH nhanh do) KHONG duoc smart-cast', () => {
    // Day la kiem tra dung dan: dieu kien "s == null" chi chung minh khac null o nhanh ELSE,
    // nen truy cap s.length ngay trong nhanh THEN van phai bi chan.
    expect(loi('val s: String? = null\nif (s == null) { println(s.length) }')).toContain(
      'co the null',
    )
  })
})

describe('nhanh con lai — suy tinh-null tu GIA TRI khoi tao (btCoTheNull)', () => {
  it('khai bao khong kieu, khong gia tri ban dau thi coi la co the null', () => {
    expect(ra('var x\nx = 5\nprintln(x)')).toBe('5\n')
  })
  it('gan thang null lam gia tri khoi tao', () => {
    expect(ra('val a = null\nprintln(a)')).toBe('null\n')
  })
  it('gan tu MOT BIEN nullable khac (khong khai kieu) thi ke thua tinh-null cua no', () => {
    expect(loi('val a: String? = null\nval b = a\nprintln(b.length)')).toContain('co the null')
  })
  it('gan tu chi so cua MAP (khong khai kieu) thi coi la co the null', () => {
    expect(loi('val m = mapOf("a" to 1)\nval v = m["b"]\nprintln(v.toString())')).toContain(
      'co the null',
    )
  })
})

describe('nhanh con lai — "this" ben trong than lop (thanh cong)', () => {
  it('this.x doc duoc thuoc tinh cua chinh doi tuong', () => {
    expect(ra('class A(val x: Int) {\n    fun show() = this.x\n}\nprintln(A(7).show())')).toBe(
      '7\n',
    )
  })
})

describe('nhanh con lai — "!!" tren gia tri THAT SU khac null', () => {
  it('!! khong lam gi khi gia tri khac null, tra chinh gia tri do', () => {
    expect(ra('val s: String? = "hi"\nprintln(s!!.length)')).toBe('2\n')
  })
})

describe('nhanh con lai — toan tu hai ngoi tren null va tren so thap phan', () => {
  it('toan tu tren mot bien null (khong qua "." nen khong bi chan som hon)', () => {
    expect(loi('val a: Int? = null\nprintln(a + 1)')).toContain('gia tri dang la null')
  })
  it('cong/tru/nhan giua Int va Double cho ra Double', () => {
    expect(ra('println(1 + 2.5)')).toBe('3.5\n')
  })
  it('lay du giua Int va Double cho ra Double', () => {
    expect(ra('println(5.5 % 2)')).toBe('1.5\n')
  })
  it('so sanh chuoi bang "> va <="', () => {
    expect(ra('println("b" > "a")')).toBe('true\n')
    expect(ra('println("a" <= "b")')).toBe('true\n')
  })
})

describe('nhanh con lai — soCua(): thanh cong voi Double, bao loi voi kieu khac so', () => {
  it('repeat() nhan so lan la Double van chay duoc', () => {
    expect(ra('println("x".repeat(3.0))')).toBe('xxx\n')
  })
  it('maxOf tren mot gia tri khong phai so thi bao loi ro rang', () => {
    expect(loi('println(maxOf(1, "a"))')).toContain('can mot so')
  })
})

describe('nhanh con lai — toan tu "in" tren List va chuoi con', () => {
  it('phan tu trong danh sach', () => {
    expect(ra('println(2 in listOf(1, 2, 3))')).toBe('true\n')
  })
  it('chuoi con nam trong chuoi lon hon', () => {
    expect(ra('println("b" in "abc")')).toBe('true\n')
  })
  it('thuoc khoang downTo (buoc am)', () => {
    expect(ra('println(5 in 10 downTo 1)')).toBe('true\n')
    expect(ra('println(15 in 10 downTo 1)')).toBe('false\n')
  })
})

describe('nhanh con lai — tach bo (destructuring) qua nhieu bien hon so truong data class', () => {
  it('xin 2 phan nhung data class chi co 1 tham so thi bao loi', () => {
    expect(loi('data class P(val a: Int)\nval (x, y) = P(1)')).toContain('Khong tach duoc 2')
  })
})

describe('nhanh con lai — lay chi so tren gia tri null (khong qua "!!")', () => {
  it('a[0] khi a la null bao loi rieng (khac thong diep cua "!!")', () => {
    expect(loi('val a: List<Int>? = null\nprintln(a[0])')).toContain(
      'Lay phan tu tren mot gia tri dang la null',
    )
  })
})

describe('nhanh con lai — gan theo chi so tren List/Map BAT BIEN (tao bang listOf/mapOf)', () => {
  it('gan ds[i] = ... khi ds tao bang listOf() thi bao loi', () => {
    expect(loi('val ds = listOf(1)\nds[0] = 9')).toContain('KHONG sua duoc')
  })
  it('gan m[k] = ... khi m tao bang mapOf() thi bao loi', () => {
    expect(loi('val m = mapOf("a" to 1)\nm["a"] = 2')).toContain('KHONG sua duoc')
  })
  it('gan m[k] = ... khi k DA CO trong Map SUA duoc thi ghi de gia tri cu', () => {
    expect(ra('val m = mutableMapOf("a" to 1)\nm["a"] = 99\nprintln(m)')).toBe('{a=99}\n')
  })
})

describe('nhanh con lai — truy cap AN TOAN "?." tren THUOC TINH (khong phai loi goi ham) cua null', () => {
  it('s?.length tren s dang null tra ve null', () => {
    expect(ra('val s: String? = null\nprintln(s?.length)')).toBe('null\n')
  })
})

describe('nhanh con lai — enum: thuoc tinh "values" khong ngoac (truy cap tinh)', () => {
  it('M.values (khong goi ()) van tra ve danh sach ca hang', () => {
    expect(ra('enum class M { A, B }\nprintln(M.values)')).toBe('[A, B]\n')
  })
})

describe('nhanh con lai — goi mot ten khong phai bien, khong phai ham dung san, khong phai lop', () => {
  it('goi mot ten hoan toan xa la bao loi ro rang', () => {
    expect(loi('unknownFunc()')).toContain('Chua co ham hay lop nao ten "unknownFunc"')
  })
})

describe('nhanh con lai — goi phuong thuc qua dau cham TREN GIA TRI CO THE NULL (khong "!!")', () => {
  it('s.uppercase() khi s khai String? bi chan bang thong diep huong dan', () => {
    expect(loi('val s: String? = null\nprintln(s.uppercase())')).toContain('KHONG duoc goi thang')
  })
  it('gia tri THUC SU null luc chay du bo suy tinh-null khai bao khong bat duoc (gioi han da biet)', () => {
    // "when" khong nam trong danh sach cac dang bieu thuc ma btCoTheNull() phan tich, nen s duoc
    // coi la "khong the null" — loi chi lo ra luc CHAY THAT, dung y nghia cua ca bien nay.
    expect(
      loi('val s = when (1) {\n    2 -> "x"\n    else -> null\n}\nprintln(s.uppercase())'),
    ).toContain('Goi "uppercase()" tren mot gia tri dang la null')
  })
})

describe('nhanh con lai — goi phuong thuc tren THAM CHIEU LOP khong phai enum', () => {
  it('A.foo() khi A la lop thuong (khong phai enum, khong co companion) bao loi', () => {
    expect(loi('class A\nA.foo()')).toContain('khong co thanh vien')
  })
})

describe('nhanh con lai — override toString() cua data class duoc GOI TRUC TIEP', () => {
  it('goi .toString() tuong minh dung ham nguoi hoc tu viet, khong dung ban tu sinh', () => {
    expect(
      ra(
        'data class D(val a: Int) {\n    override fun toString(): String = "custom"\n}\nprintln(D(1).toString())',
      ),
    ).toBe('custom\n')
  })
  it('khong ghi de thi .toString() tuong minh dung ban tu sinh', () => {
    expect(ra('data class D(val a: Int)\nprintln(D(5).toString())')).toBe('D(a=5)\n')
  })
})

describe('nhanh con lai — thuoc tinh khong co gia tri khoi tao trong object/enum', () => {
  it('thuoc tinh cua object khong co gia tri ban dau la null', () => {
    expect(ra('object O {\n    var x: Int?\n}\nprintln(O.x)')).toBe('null\n')
  })
  it('enum co them THUOC TINH khai trong than (ngoai tham so ham dung)', () => {
    expect(
      ra('enum class M(val v: Int) {\n    A(1), B(2);\n    val label = "x"\n}\nprintln(M.A.label)'),
    ).toBe('x\n')
  })
})

describe('nhanh con lai — thuoc tinh TINH (get()) tren "object" chua duoc ho tro', () => {
  it('object voi get() bao loi ro rang thay vi tra gia tri sai (gioi han da biet)', () => {
    expect(
      loi('object O {\n    val computed: Int\n        get() = 42\n}\nprintln(O.computed)'),
    ).toContain('O khong co "computed"')
  })
})

describe('nhanh con lai — goi truc tiep mot LAMBDA nhieu tham so voi it doi so hon khai bao', () => {
  it('goi lambda 2 tham so voi 1 doi so, tham so con lai la null', () => {
    expect(ra('val f = { a: Int, b: Int -> a }\nprintln(f(5))')).toBe('5\n')
  })
})

describe('nhanh con lai — mapOf() nhan phan tu KHONG PHAI cap "to"', () => {
  it('mapOf(1, 2) bao loi huong dan dung "to"', () => {
    expect(loi('mapOf(1, 2)')).toContain('to giaTri')
  })
})

describe('nhanh con lai — goi "Unit" nhu mot ham (co ngoac)', () => {
  it('Unit() tra ve chinh doi tuong Unit', () => {
    expect(ra('println(Unit())')).toBe('kotlin.Unit\n')
  })
})

describe('nhanh con lai — cac lop ngoai le dung san khoi tao KHONG kem thong diep', () => {
  it('Exception() khong tham so co message rong', () => {
    expect(
      ra('try { throw Exception() } catch (e: Exception) { println("[" + e.message + "]") }'),
    ).toBe('[]\n')
  })
})

describe('nhanh con lai — require() voi thong diep KHONG phai lambda, hoac khong co thong diep', () => {
  it('require(false) khong co thong diep dung cau mac dinh', () => {
    expect(ra('try { require(false) } catch (e: Exception) { println(e.message) }')).toBe(
      'Failed requirement.\n',
    )
  })
  it('require(false, "chuoi") thong diep la gia tri thuong, khong phai lambda', () => {
    expect(
      ra('try { require(false, "gia tri sai") } catch (e: Exception) { println(e.message) }'),
    ).toBe('gia tri sai\n')
  })
})

describe('nhanh con lai — maxOf/minOf: nhanh con lai cua ternary khi doi so DAU tien lon hon', () => {
  it('maxOf(9, 2) tra ve doi so dau (nhanh true)', () => {
    expect(ra('println(maxOf(9, 2))')).toBe('9\n')
  })
  it('minOf(9, 2) tra ve doi so sau (nhanh true cua <=)', () => {
    expect(ra('println(minOf(9, 2))')).toBe('2\n')
  })
})

describe('nhanh con lai — goi ham voi tham so ten khong ton tai', () => {
  it('liet ke ten tham so hop le khi ham co tham so', () => {
    expect(loi('fun f(a: Int) = a\nprintln(f(z = 1))')).toContain('Cac tham so hop le: a.')
  })
  it('noi ro "(khong co)" khi ham khong nhan tham so nao', () => {
    expect(loi('fun f() = 1\nprintln(f(z = 1))')).toContain('Cac tham so hop le: (khong co).')
  })
  it('thieu mot tham so bat buoc (khong co gia tri mac dinh) thi bao loi', () => {
    expect(loi('fun f(a: Int, b: Int) = a + b\nprintln(f(1))')).toContain(
      'Goi ham "f" thieu tham so "b"',
    )
  })
})

describe('nhanh con lai — phuong thuc CHUOI/SO/KY TU it dung: goi khong co, va toChar', () => {
  it('goi mot phuong thuc khong co tren String bao loi', () => {
    expect(loi('println("abc".khongCo())')).toContain('Kieu String khong co')
  })
  it('goi mot phuong thuc khong co tren Char bao loi', () => {
    expect(loi("println('a'.khongCo())")).toContain('Kieu Char khong co')
  })
  it('so nguyen doi thanh ky tu bang toChar()', () => {
    expect(ra('println(65.toChar())')).toBe('A\n')
  })
  it('length() goi bang ngoac (khong phai thuoc tinh)', () => {
    expect(ra('println("abc".length())')).toBe('3\n')
  })
})

describe('nhanh con lai — Map.put()/.remove() theo phuong thuc (khac cu phap "[]")', () => {
  it('put() len khoa DA CO thi ghi de', () => {
    expect(ra('val m = mutableMapOf("a" to 1)\nm.put("a", 99)\nprintln(m)')).toBe('{a=99}\n')
  })
  it('remove() tren Map bat bien (mapOf) bao loi', () => {
    expect(loi('val m = mapOf("a" to 1)\nm.remove("a")')).toContain('Map tao bang mapOf()')
  })
})

describe('nhanh con lai — List.size()/.remove() goi bang phuong thuc', () => {
  it('size() goi bang ngoac (khac thuoc tinh .size)', () => {
    expect(ra('println(listOf(1, 2).size())')).toBe('2\n')
  })
  it('remove() tren danh sach bat bien (listOf) bao loi', () => {
    expect(loi('val ds = listOf(1)\nds.remove(1)')).toContain('Danh sach tao bang listOf()')
  })
})

describe('nhanh con lai — sum()/maxOrNull()/minOrNull() voi danh sach Int lan Double', () => {
  it('sum() co it nhat mot Double thi ket qua la Double', () => {
    expect(ra('println(listOf(1, 2.5).sum())')).toBe('3.5\n')
  })
  it('maxOrNull() phai xet ca phan tu O GIUA lon hon phan tu dau', () => {
    expect(ra('println(listOf(1, 5, 3).maxOrNull())')).toBe('5\n')
  })
  it('minOrNull() phai xet ca phan tu O GIUA nho hon phan tu dau', () => {
    expect(ra('println(listOf(5, 1, 3).minOrNull())')).toBe('1\n')
  })
})

describe('nhanh con lai — sorted()/sortedByDescending() tren CHUOI voi 3+ phan tu', () => {
  // Voi dung 2 phan tu, thuat toan sap xep co the chi goi comparator MOT chieu — dung 3 phan tu
  // de chac chan ca hai nhanh cua ternary so sanh chuoi (< va >) deu duoc di qua.
  it('sorted() tren danh sach 3 chuoi', () => {
    expect(ra('println(listOf("b", "a", "c").sorted())')).toBe('[a, b, c]\n')
  })
  it('sortedByDescending() tren danh sach 3 chuoi', () => {
    expect(ra('println(listOf("b", "a", "c").sortedByDescending { it })')).toBe('[c, b, a]\n')
  })
})

describe('nhanh con lai — joinToString() khong tham so, va filterNotNull()', () => {
  it('joinToString() khong doi so nao dung dau phan cach mac dinh ", "', () => {
    expect(ra('println(listOf(3, 1, 2).joinToString())')).toBe('3, 1, 2\n')
  })
  it('joinToString voi CHI lambda (khong dau phan cach) van dung mac dinh ", "', () => {
    expect(ra('println(listOf(3, 1, 2).joinToString { "n$it" })')).toBe('n3, n1, n2\n')
  })
  it('filterNotNull() loai bo cac phan tu null trong danh sach', () => {
    expect(ra('println(listOf(1, null, 2).filterNotNull())')).toBe('[1, 2]\n')
  })
})

// ── Ba lỗi phát hiện khi viết test đợt coverage 2026-09-05, sửa ở PR ngay sau đó ──
//
// Cả ba đều thuộc loại "test cũ không hề chạm tới": bộ test trước đó chưa bao giờ in một đối
// tượng có `override fun toString()`, cũng chưa bao giờ gọi `associateWith` trên danh sách có
// phần tử trùng. Test dưới đây canh đúng hành vi đã sửa, để nó không lặng lẽ hồi quy.
describe('lỗi đã sửa 2026-09-05 — associateWith khử trùng khoá', () => {
  it('phần tử trùng nhau gộp thành MỘT cặp, không sinh Map hai khoá giống nhau', () => {
    expect(ra('println(listOf(1, 1, 2).associateWith { it * 2 })')).toBe('{1=2, 2=4}\n')
  })

  it('giá trị của lần cuối thắng, đúng như Kotlin thật', () => {
    // Đếm số lần gọi để phân biệt "lấy lần cuối" với "bỏ qua lần sau".
    expect(ra('var n = 0\nprintln(listOf("a", "a").associateWith { n += 1; n })')).toBe('{a=2}\n')
  })

  it('chuỗi khác nhau vẫn giữ đủ cặp (không khử nhầm)', () => {
    expect(ra('println(listOf("b", "a").associateWith { it.length })')).toBe('{a=1, b=1}\n')
  })
})

describe('lỗi đã sửa 2026-09-05 — println tôn trọng override fun toString()', () => {
  const lop = `class Diem(val x: Int, val y: Int) {
  override fun toString(): String { return "Diem[$x;$y]" }
}
`

  it('println dùng toString() do học viên viết, khớp với x.toString() tường minh', () => {
    expect(ra(`${lop}val d = Diem(1, 2)\nprintln(d)\nprintln(d.toString())`)).toBe(
      'Diem[1;2]\nDiem[1;2]\n',
    )
  })

  it('nội suy chuỗi "$d" cũng đi qua toString() đó', () => {
    expect(ra(`${lop}val d = Diem(3, 4)\nprintln("toa do: $d")`)).toBe('toa do: Diem[3;4]\n')
  })

  it('phần tử BÊN TRONG List/Map/Pair cũng được gọi toString()', () => {
    expect(ra(`${lop}println(listOf(Diem(1, 1), Diem(2, 2)))`)).toBe('[Diem[1;1], Diem[2;2]]\n')
    expect(ra(`${lop}println(mapOf("a" to Diem(5, 6)))`)).toBe('{a=Diem[5;6]}\n')
    expect(ra(`${lop}println(Pair(Diem(7, 8), 9))`)).toBe('(Diem[7;8], 9)\n')
  })

  it('data class KHÔNG override thì vẫn in dạng tự sinh như cũ', () => {
    expect(ra('data class P(val a: Int)\nprintln(P(1))')).toBe('P(a=1)\n')
  })

  it('print (không xuống dòng) cũng dùng toString() đó', () => {
    expect(ra(`${lop}print(Diem(0, 0))`)).toBe('Diem[0;0]')
  })
})
