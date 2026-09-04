// Đợt 2 coverage 2026-09-05: NHÁNH CÚ PHÁP CÒN LẠI của `parser.ts` (bộ chạy Kotlin, PR-M7).
//
// File này KHÔNG canh một chủ đề nghiệp vụ — nó canh các NHÁNH parser mà `loi.test.ts`,
// `caBien.test.ts`, `khoi.test.ts`, `keThua.test.ts` và `thuVien.test.ts` chưa từng đi qua:
// từ khoá bổ nghĩa (`private`/`open`…) đứng trước `enum`/`fun`/`val`, tham số không khai kiểu,
// tham số hàm dựng có giá trị mặc định, kế thừa nhiều giao diện, companion object có tên,
// thuộc tính tính (`get()`), `else if`, thân class/companion/when bỏ ngỏ dấu `}`, lambda nhiều
// dòng không khai `it ->`, và lỗi cú pháp NẰM BÊN TRONG một mảnh nội suy chuỗi (phải lùi đúng
// số dòng của chuỗi ngoài, không phải dòng 1 của mảnh con). Mỗi ca vẫn kiểm HÀNH VI thật (giá
// trị in ra hoặc thông điệp lỗi), không chỉ "gọi cho chạy qua".
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

describe('tenBatBuoc — hết bài ngay chỗ cần một tên', () => {
  it('khai val mà hết file luôn thì báo "het bai" thay vì chuỗi rỗng', () => {
    expect(loi('val')).toContain('het bai')
  })
})

describe('từ khoá bổ nghĩa đứng trước enum/fun/val/var', () => {
  it('private enum class', () => {
    expect(ra('private enum class Color { RED }\nprintln(Color.RED)')).toBe('RED\n')
  })
  it('private fun', () => {
    expect(ra('private fun loiChao() = 1\nprintln(loiChao())')).toBe('1\n')
  })
  it('private val', () => {
    expect(ra('private val x = 1\nprintln(x)')).toBe('1\n')
  })
  it('private var', () => {
    expect(ra('private var y = 2\ny = 3\nprintln(y)')).toBe('3\n')
  })
})

describe('tên kiểu phải là TEN hoặc TỪ KHOÁ, không phải số', () => {
  it('khai kiểu bằng một con số báo lỗi rõ', () => {
    expect(loi('val x: 5 = 1')).toContain('KIEU')
  })
  it('khai kieu ma het bai luon thi bao "het bai" thay vi chuoi rong', () => {
    expect(loi('val x:')).toContain('het bai')
  })
})

describe('khai báo biến chỉ có KIỂU, không có giá trị khởi tạo', () => {
  it('var chi khai kieu, gan gia tri sau', () => {
    expect(ra('var x: Int\nx = 5\nprintln(x)')).toBe('5\n')
  })
})

describe('gán gộp "++"/"--" viết lại thành phép gán "+="/"-="', () => {
  it('hau to ++ tren bien', () => {
    expect(ra('var y = 1\ny++\nprintln(y)')).toBe('2\n')
  })
  it('hau to -- tren bien', () => {
    expect(ra('var y = 1\ny--\nprintln(y)')).toBe('0\n')
  })
})

describe('khai báo hàm/tham số bỏ qua phần không bắt buộc', () => {
  it('hàm interface không khai kiểu trả về vẫn phân tích được', () => {
    expect(
      ra('interface I { fun f() }\nclass C : I { override fun f() = 1 }\nprintln(C().f())'),
    ).toBe('1\n')
  })
  it('tham số hàm không khai kiểu (bộ chạy khong ep kieu tinh)', () => {
    expect(ra('fun f(a) = a\nprintln(f(5))')).toBe('5\n')
  })
  it('tham số hàm dựng có ca khai kieu lan gia tri mac dinh', () => {
    expect(ra('class A(val x: Int = 5)\nprintln(A().x)')).toBe('5\n')
  })
  it('tham số hàm dựng có gia tri mac dinh nhung KHONG khai kieu', () => {
    expect(ra('class A(val x = 5)\nprintln(A().x)')).toBe('5\n')
  })
})

describe('kế thừa nhiều giao diện sau lớp cha', () => {
  it('class ke thua mot lop cha va HAI giao dien', () => {
    expect(
      ra(
        'open class A\ninterface I1\ninterface I2\nclass B : A(), I1, I2\nprintln(B() is I1 && B() is I2)',
      ),
    ).toBe('true\n')
  })
})

describe('companion object có tên', () => {
  it('ten cua companion la tuy chon, khong dung toi nhung phai bo qua duoc', () => {
    expect(
      ra('class A {\n    companion object Nom {\n        val x = 1\n    }\n}\nprintln(A.x)'),
    ).toBe('1\n')
  })
})

describe('thân class/companion/when mở "{" mà không đóng "}"', () => {
  it('than class chua dong', () => {
    expect(loi('class A {\n    val x = 1')).toContain('khong dong')
  })
  it('than companion object chua dong', () => {
    expect(loi('class A {\n    companion object {\n        val x = 1')).toContain(
      'companion object',
    )
  })
  it('than when chua dong', () => {
    expect(loi('when (1) {\n    1 -> println("a")')).toContain('khong dong')
  })
})

describe('thuộc tính TÍNH — get() dạng khối và dạng biểu thức', () => {
  it('get() dang khoi lenh', () => {
    expect(
      ra(
        'class A {\n    val x: Int\n        get() {\n            return 5\n        }\n}\nprintln(A().x)',
      ),
    ).toBe('5\n')
  })
  it('get() dang bieu thuc mot dong', () => {
    expect(ra('class A {\n    val x: Int\n        get() = 7\n}\nprintln(A().x)')).toBe('7\n')
  })
})

describe('thành viên lạ trong thân lớp bị từ chối', () => {
  it('mot loi goi ham truc tiep trong than lop khong phai val/var/fun/init/companion', () => {
    expect(loi('class A {\n    println(1)\n}')).toContain('chi khai duoc')
  })
  it('mot tu khoa bo nghia dung mot minh roi het bai cung bao "het bai"', () => {
    expect(loi('class A {\n    private')).toContain('het bai')
  })
})

describe('câu lệnh if/else if/else (dạng CÂU LỆNH, không phải giá trị)', () => {
  it('else if noi tiep chon dung nhanh', () => {
    expect(
      ra(
        'val x = 5\nif (x < 0) {\n    println("neg")\n} else if (x == 0) {\n    println("zero")\n} else {\n    println("pos")\n}',
      ),
    ).toBe('pos\n')
  })
})

describe('if dùng làm GIÁ TRỊ với "else if" nối tiếp', () => {
  it('else if chon dung nhanh', () => {
    expect(
      ra('val x = 5\nval r = if (x < 0) "neg" else if (x == 0) "zero" else "pos"\nprintln(r)'),
    ).toBe('pos\n')
  })
})

describe('phân biệt tham số kiểu tổng quát "<...>" với phép so sánh', () => {
  it('"<" ngay truoc xuong dong khong phai tham so kieu, van la phep so sanh binh thuong', () => {
    expect(ra('val a = 1\nval b = 2\nprintln(a <\n    b)')).toBe('true\n')
  })
  it('"<...>" khong dong o cuoi file van khong lam vo bo phan tich (roi tro thanh phep so sanh)', () => {
    const r = chayKotlin('val T = 2\nval x = 1\nx<T')
    expect(r.error).toBeUndefined()
  })
})

describe('lambda nhiều dòng không khai "tên_tham_số ->"', () => {
  it('lambda 2 cau lenh, dong dau khong co "->" nen phai quet qua xuong dong moi biet', () => {
    expect(ra('val f = { println("hi")\n    println("bye")\n}\nf()')).toBe('hi\nbye\n')
  })
  it('lambda mo bang "{" ma khong dong bang "}" bao loi ro', () => {
    expect(loi('val a = {1+1')).toContain('Lambda')
  })
})

describe('try dùng làm giá trị (biểu thức) kèm finally', () => {
  it('try-bieu-thuc co finally van tra dung gia tri cua nhanh than', () => {
    expect(ra('val r = try { 5 } finally { println("f") }\nprintln(r)')).toBe('f\n5\n')
  })
})

describe('lỗi cú pháp NẰM BÊN TRONG nội suy chuỗi vẫn chỉ đúng dòng chuỗi ngoài', () => {
  it('bieu thuc hong trong ${...} bi bat va doi lai dung dong cua chuoi ngoai', () => {
    expect(loi('println("gia tri: ${1 + }")')).toContain('dong 1')
  })
})
