// Đợt 2 coverage 2026-09-05: NHÁNH CÚ PHÁP CÒN LẠI của `parser.ts` (bộ chạy Swift, PR-M3).
//
// File này KHÔNG canh một chủ đề nghiệp vụ — nó canh các NHÁNH parser mà `loi.test.ts` và
// `luongDieuKhien.test.ts` chưa từng đi qua: khai biến chỉ có kiểu (không giá trị), tên kiểu
// tổng quát viết tường minh (`Array<Int>`), yêu cầu hàm/thuộc tính của protocol không khai kiểu
// trả về, `if let ten: Kieu = …` và dạng rút gọn `if let ten { … }`, vòng `for` huỷ cấu trúc có
// `_`, thân struct/switch/dòng (closure) bỏ ngỏ dấu `}`, bắt lỗi theo kiểu không dùng "let",
// mảng/từ điển có dấu phẩy thừa ở cuối, và lỗi cú pháp NẰM BÊN TRONG một mảnh nội suy `\(...)`.
// Mỗi ca vẫn kiểm HÀNH VI thật (giá trị in ra hoặc thông điệp lỗi), không chỉ "gọi cho chạy qua".
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

describe('khai báo biến chỉ có KIỂU, không có giá trị khởi tạo', () => {
  it('var chi khai kieu Optional (KHONG gia tri) roi gan sau', () => {
    expect(chay('var a: Int?\na = 5\nprint(a)').ra).toBe('Optional(5)\n')
  })
})

describe('tên kiểu tổng quát viết tường minh trong khai báo', () => {
  it('Array<Int> lam kieu bien', () => {
    expect(chay('let a: Array<Int> = [1, 2]\nprint(a)').ra).toBe('[1, 2]\n')
  })
})

describe('tên kiểu HÀM viết KHÔNG có ngoặc bọc tham số (kiểu cong ối, ít gặp)', () => {
  it('Kieu tra ve la mot kieu ham viet lien "->" khong ngoac', () => {
    expect(
      chay(
        'func aplicar(f: Int -> Int, x: Int) -> Int {\nreturn f(x)\n}\nprint(aplicar(f: { $0 + 1 }, x: 2))',
      ).ra,
    ).toBe('3\n')
  })
})

describe('protocol yêu cầu HÀM không khai kiểu trả về', () => {
  it('yeu cau ham khong co "-> Kieu" van phan tich duoc, va cai dat duoc', () => {
    expect(
      chay('protocol P {\nfunc lam()\n}\nstruct S: P {\nfunc lam() { print("x") }\n}\nS().lam()')
        .ra,
    ).toBe('x\n')
  })
})

describe('thân struct/class mở "{" mà không đóng "}"', () => {
  it('struct chua dong bao loi ro ten kieu', () => {
    loiDayDuoc('struct S {\nvar x = 1', 2, 'dong struct S')
  })
})

describe('protocol khai YÊU CẦU thuộc tính mà không viết kiểu tường minh', () => {
  it('var ten { get } khong co dau hai cham + kieu van duoc chap nhan la yeu cau', () => {
    expect(
      chay('protocol P {\nvar ten { get }\n}\nstruct S: P {\nvar ten = "x"\n}\nprint(S().ten)').ra,
    ).toBe('x\n')
  })
})

describe('thuộc tính TÍNH không khai kiểu tường minh', () => {
  it('var dienTich { return … } khong co ": Kieu" truoc dau ngoac nhon', () => {
    expect(chay('struct S {\nvar dienTich {\nreturn 10\n}\n}\nprint(S().dienTich)').ra).toBe('10\n')
  })
})

describe('thành viên lạ trong thân ENUM (khác struct — có gợi ý thêm "case")', () => {
  it('thong bao loi cua enum liet ke them "case" ma struct khong co', () => {
    loiDayDuoc('enum E {\nswitch 1 {\n}\n}', 2, ', case')
  })
})

describe('protocol khai hàm kèm THÂN ngay trong protocol (không phải chữ ký)', () => {
  it('ham co than trong protocol duoc coi la ham thuong, khong phai yeu cau bat buoc', () => {
    expect(
      chay(
        'protocol P {\nfunc greet() { print("hi") }\n}\nstruct S: P {\n}\nlet s = S()\nprint("ok")',
      ).ra,
    ).toBe('ok\n')
  })
})

describe('switch mở "{" mà không đóng "}" (ở cả hai vòng quét)', () => {
  it('switch rong chua dong ngay tu dau', () => {
    loiDayDuoc('switch 1 {', 1, 'dong switch')
  })
  it('switch dang doc than mot case thi het bai', () => {
    loiDayDuoc('switch 1 {\ncase 1:\nprint(1)', 3, 'dong switch')
  })
})

describe('"if let" có khai kiểu tường minh, và dạng rút gọn không "="', () => {
  it('if let ten: Kieu = gia tri', () => {
    expect(chay('func f(_ a: Int?) {\nif let x: Int = a {\nprint(x)\n}\n}\nf(5)').ra).toBe('5\n')
  })
  it('if let ten (rut gon Swift 5.7, khong co "=")', () => {
    expect(chay('func f(_ a: Int?) {\nif let a {\nprint(a)\n}\n}\nf(9)').ra).toBe('9\n')
  })
})

describe('vòng for huỷ cấu trúc theo cặp có phần tử bỏ qua bằng "_"', () => {
  it('for (_, gia) in tu dien chi lay gia tri', () => {
    expect(chay('for (_, v) in ["a": 1] { print(v) }').ra).toBe('1\n')
  })
})

describe('lambda lồng lambda khi quét trước tìm "in" phải đếm đúng độ sâu ngoặc', () => {
  it('dong khong khai tham so, ben trong lai co mot dong khac', () => {
    expect(chay('let f = { [1, 2, 3].contains { $0 > 2 } }\nprint(f())').ra).toBe('true\n')
  })
  it('dong nhieu dong, xuong dong xay ra truoc khi tim thay "in"/"}"', () => {
    expect(chay('let f = {\nprint("a")\nreturn 1\n}\nprint(f())').ra).toBe('a\n1\n')
  })
})

describe('dòng (closure) mở "{" mà không đóng "}"', () => {
  it('dong chua dong bao loi ro', () => {
    loiDayDuoc('let f = { print(1)', 1, 'dong khoi dong')
  })
})

describe('bắt lỗi (catch) theo KIỂU mà không dùng "let"', () => {
  it('catch KieuLoi.truongHop chi loc theo kieu, bo qua truong hop cu the', () => {
    expect(
      chay(
        'enum L: Error { case x }\nfunc f() throws { throw L.x }\ndo {\ntry f()\n} catch L.x {\nprint("bat kieu")\n}',
      ).ra,
    ).toBe('bat kieu\n')
  })
  it('catch .truongHop khong khai kieu (bat MOI loi, chi loc theo ten truong hop)', () => {
    expect(
      chay(
        'enum L: Error { case x }\nfunc f() throws { throw L.x }\ndo {\ntry f()\n} catch .x {\nprint("bat")\n}',
      ).ra,
    ).toBe('bat\n')
  })
})

describe('truy cập thành viên bằng dấu chấm khi tên thành viên trùng TỪ KHOÁ', () => {
  it('.self truy cap thanh cong ve mat cu phap, that bai co giai thich luc chay', () => {
    loiDayDuoc('struct S { var x = 1 }\nlet s = S()\nprint(s.self)', 3, 'khong co thuoc tinh')
  })
})

describe('mảng/từ điển có dấu phẩy thừa ở phần tử cuối', () => {
  it('mang co dau phay thua', () => {
    expect(chay('print([1, 2,])').ra).toBe('[1, 2]\n')
  })
  it('tu dien co dau phay thua', () => {
    expect(chay('let d = ["a": 1, "b": 2,]\nprint(d.count)').ra).toBe('2\n')
  })
})

describe('nguyên tố (primary) chờ một giá trị mà gặp thứ khác không phải xuống dòng', () => {
  it('gap dau ngoac dong ngay noi dang cho gia tri', () => {
    loiDayDuoc('let a = )', 1, 'dang cho mot gia tri')
  })
})

describe('lỗi cú pháp NẰM BÊN TRONG nội suy \\(...) vẫn chỉ đúng dòng chuỗi ngoài', () => {
  it('bieu thuc hong trong \\(...) bi bat va doi lai dung dong cua chuoi ngoai', () => {
    loiDayDuoc('print("ok")\nprint("x: \\(1 + )")', 2, 'dang cho mot gia tri')
  })
})
