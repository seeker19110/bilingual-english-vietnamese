// CỔNG "LỖI PHẢI NÓI ĐƯỢC" của bộ chạy Kotlin (PR-M7, hiến chương M §3.4).
//
// §3.4 đặt ra ba yêu cầu cho thông báo lỗi, và đây là chỗ canh cả ba:
//   ① chỉ ĐÚNG SỐ DÒNG của học viên;
//   ② viết bằng tiếng Việt dễ hiểu, không phải thuật ngữ trình biên dịch;
//   ③ nói được PHẢI LÀM GÌ, không chỉ nói cái gì sai.
//
// Đây là lý do sư phạm chính đáng thứ hai của cả quyết định tự viết interpreter (§3): với
// người mới, một thông báo lỗi dạy được còn giá trị hơn một trình biên dịch đúng chuẩn.
import { describe, expect, it } from 'vitest'
import { chayKotlin } from './chayKotlin.js'

/** Chạy và bắt buộc phải có lỗi; trả về thông điệp. */
function loi(src: string): string {
  const r = chayKotlin(src)
  expect(r.error, `Doan nay dang le phai bao loi:\n${src}`).toBeDefined()
  return r.error!
}

describe('lỗi chỉ đúng số dòng', () => {
  it('lỗi ở dòng 3 thì báo dòng 3', () => {
    expect(loi('val a = 1\nval b = 2\nval c = khongCo + 1')).toContain('dong 3')
  })
  it('lỗi bên trong thân hàm chỉ đúng dòng của thân', () => {
    expect(loi('fun f() {\n    val x = 1\n    x = 2\n}\nf()')).toContain('dong 3')
  })
  it('lỗi bên trong nội suy chuỗi vẫn chỉ đúng dòng', () => {
    expect(loi('println("gia tri: ${khongCo}")')).toContain('dong 1')
  })
})

describe('lỗi nói được PHẢI LÀM GÌ', () => {
  it('gán lại val: nói rõ đổi sang var', () => {
    const m = loi('val a = 1\na = 2')
    expect(m).toContain('val')
    expect(m).toContain('var')
  })
  it('biến chưa khai báo: gợi ý kiểm chính tả và cách khai', () => {
    const m = loi('println(tong)')
    expect(m).toContain('chinh ta')
  })
  it('dùng nullable bằng dấu chấm: nêu ĐỦ BA cách mở', () => {
    const m = loi('val s: String? = "hi"\nprintln(s.length)')
    expect(m).toContain('?.')
    expect(m).toContain('?:')
    expect(m).toContain('!!')
  })
  it('!! trên null: nói rõ đây là lỗi kinh điển và cách tránh', () => {
    const m = loi('val s: String? = null\nprintln(s!!.length)')
    expect(m).toContain('NullPointerException')
    expect(m).toContain('?.')
  })
  it('sửa listOf: chỉ sang mutableListOf', () => {
    const m = loi('val ds = listOf(1)\nds.add(2)')
    expect(m).toContain('mutableListOf')
  })
  it('sửa mapOf: chỉ sang mutableMapOf', () => {
    const m = loi('val m = mapOf("a" to 1)\nm.put("b", 2)')
    expect(m).toContain('mutableMapOf')
  })
  it('chỉ số ngoài phạm vi: nói rõ phạm vi hợp lệ', () => {
    const m = loi('val ds = listOf(1, 2)\nprintln(ds[5])')
    expect(m).toContain('0 den 1')
  })
  it('chia cho 0: bảo kiểm mẫu số', () => {
    expect(loi('println(1 / 0)')).toContain('mau so')
  })
  it('điều kiện không phải Boolean: nói rõ Kotlin không tự suy', () => {
    const m = loi('if (1) { println("x") }')
    expect(m).toContain('Boolean')
  })
  it('thiếu tham số khi gọi hàm: nói tên tham số còn thiếu', () => {
    const m = loi('fun f(a: Int, b: Int) = a + b\nprintln(f(1))')
    expect(m).toContain('"b"')
  })
  it('tên tham số sai: liệt kê các tham số hợp lệ', () => {
    const m = loi('fun f(a: Int) = a\nprintln(f(x = 1))')
    expect(m).toContain('a')
  })
  it('dùng ngoặc vuông tạo danh sách: chỉ sang listOf', () => {
    expect(loi('val ds = [1, 2]')).toContain('listOf')
  })
  it('if làm giá trị mà thiếu else: nói rõ vì sao bắt buộc', () => {
    expect(loi('val a = if (true) 1')).toContain('else')
  })
  it('first() trên danh sách rỗng: chỉ sang firstOrNull()', () => {
    expect(loi('println(listOf<Int>().first())')).toContain('firstOrNull')
  })
})

describe('lỗi cú pháp cũng phải dạy được', () => {
  it('quên đóng ngoặc nhọn', () => {
    expect(loi('fun f() {\n    println(1)')).toContain('}')
  })
  it('chuỗi chưa đóng', () => {
    expect(loi('println("chua dong)')).toContain('nhay kep')
  })
  it('chú thích khối chưa đóng', () => {
    expect(loi('/* mo ma khong dong\nprintln(1)')).toContain('*/')
  })
})

describe('hai trần cứng chống treo trình duyệt', () => {
  it('trần số bước chặn vòng lặp vô tận và nói rõ phải kiểm gì', () => {
    const m = chayKotlin('while (true) { }', [], { tranBuoc: 1000 }).error!
    expect(m).toContain('vong lap')
  })
  it('trần ký tự chặn in ra hàng loạt', () => {
    const m = chayKotlin('for (i in 1..100000) println("xxxxxxxxxx")', [], {
      tranKyTu: 500,
    }).error!
    expect(m).toContain('in ra')
  })
})

describe('ngoại lệ không ai bắt thì dừng chương trình, có giải thích', () => {
  it('throw không có try/catch', () => {
    const m = loi('throw Exception("hong roi")')
    expect(m).toContain('try')
    expect(m).toContain('catch')
  })
  it('toInt() trên chuỗi không phải số ném ngoại lệ', () => {
    expect(loi('println("abc".toInt())')).toContain('abc')
  })
})
