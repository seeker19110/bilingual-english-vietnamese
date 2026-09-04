// Đợt 2 coverage 2026-09-05: phủ nốt các NHÁNH chưa đi của interpreter.ts (bổ sung cho
// `loi.test.ts` và `luongDieuKhien.test.ts`, không sửa hai file đó).
//
// Mỗi ca dưới đây nhắm đúng một (hoặc vài) nhánh rẽ cụ thể còn 0 lượt chạy theo báo cáo
// coverage — ví dụ: sao chép một giá trị Optional, so sánh hai struct KHÁC kiểu, gọi
// phương thức tự viết trên một enum, các hàm dựng sẵn gọi thiếu đối số/nhãn… Đây đều là
// những dòng Swift người học thật sự có thể gõ, không phải test "cho đủ số".
import { describe, expect, it } from 'vitest'
import { chaySwift, DONG_TU_KHAI } from './index.js'
import { MoiTruong } from './interpreter.js'

/** Chạy và trả về { ra, loi } đã bỏ dòng tự khai — cùng khuôn với loi.test.ts. */
function chay(code: string): { ra: string; loi: string } {
  const r = chaySwift(code)
  return { ra: r.output.replace(`${DONG_TU_KHAI}\n`, ''), loi: r.error ?? '' }
}

describe('sao chép giá trị Optional và biểu diễn kiểu bare', () => {
  it('sao chép biến chứa Optional (chepGia gặp tuyChon)', () => {
    expect(chay('let a: Int? = 5\nvar b = a\nprint(b)').ra).toBe('Optional(5)\n')
  })

  it('in một kiểu dựng sẵn dùng trần (không gọi) — Int như một giá trị', () => {
    expect(chay('print(Int)').ra).toBe('Int\n')
  })

  it('dùng kiểu dựng sẵn trần trong phép tính là lỗi, nói rõ tên kiểu', () => {
    const { loi } = chay('let a = Int\nprint(a + 1)')
    expect(loi).toContain('Khong dung duoc toan tu "+"')
    expect(loi).toContain('Int')
  })

  it('lấy chỉ số trên một Range là lỗi, nêu đúng tên kiểu Range', () => {
    const { loi } = chay('print((1...3)[0])')
    expect(loi).toContain('Khong lay phan tu theo chi so tren Range duoc')
  })

  it('từ điển khoá Int, và tra bằng một giá trị Optional (khoaTuDien mở gói)', () => {
    expect(chay('let k: Int? = 5\nvar d = [5: "hi"]\nprint(d[k])').ra).toBe('Optional("hi")\n')
  })
})

describe('MoiTruong.co() — tra co bien co ton tai (ke ca o pham vi cha) khong', () => {
  it('tim thay o chinh moi truong nay, o moi truong cha, va khong thay o dau ca', () => {
    const goc = new MoiTruong()
    goc.khai('a', { gia: { k: 'int', v: 1 }, hangSo: true })
    const con = new MoiTruong(goc)
    con.khai('b', { gia: { k: 'int', v: 2 }, hangSo: true })

    expect(con.co('b')).toBe(true)
    expect(con.co('a')).toBe(true)
    expect(con.co('khongTonTai')).toBe(false)
  })
})

describe('bangNhau — các nhánh so sánh còn lại', () => {
  it('so sánh khi một vế là Optional (mở gói vế phải)', () => {
    expect(chay('let a: Int? = 5\nprint(5 == a)').ra).toBe('true\n')
  })

  it('nil == nil là true', () => {
    expect(chay('let a: Int? = nil\nprint(a == nil)').ra).toBe('true\n')
  })

  it('hai enum bằng nhau, kèm giá trị đi kèm (associated value)', () => {
    expect(chay('enum E { case a, b }\nprint(E.a == E.a)\nprint(E.a == E.b)').ra).toBe(
      'true\nfalse\n',
    )
    expect(
      chay(
        'enum P { case p(Int, Int) }\nprint(P.p(1, 2) == P.p(1, 2))\nprint(P.p(1, 2) == P.p(1, 3))',
      ).ra,
    ).toBe('true\nfalse\n')
  })

  it('hai struct KHÁC kiểu không bao giờ bằng nhau', () => {
    expect(chay('struct A { var x = 1 }\nstruct B { var x = 1 }\nprint(A() == B())').ra).toBe(
      'false\n',
    )
  })

  it('hai struct CÙNG kiểu nhưng khác giá trị thuộc tính', () => {
    expect(
      chay('struct S { var x = 1 }\nvar a = S()\nvar b = S()\nb.x = 2\nprint(a == b)').ra,
    ).toBe('false\n')
  })

  it('so sánh Int với Double bằng == (mở rộng kiểu số)', () => {
    expect(chay('print(1 == 1.0)').ra).toBe('true\n')
  })

  it('so sánh hai chuỗi bằng == trả đúng true/false', () => {
    expect(chay('print("a" == "a")').ra).toBe('true\n')
  })

  it('so sánh hai giá trị khác kiểu hẳn (Int với String) bằng == la false', () => {
    expect(chay('print(1 == "a")').ra).toBe('false\n')
  })

  it('so sánh hai gia tri Bool bằng ==', () => {
    expect(chay('print(true == true)').ra).toBe('true\n')
  })
})

describe('khai báo không giá trị khởi tạo, hàm/kiểu khai bên trong scope khác', () => {
  it('var khai kiểu Optional mà không có giá trị khởi tạo — mặc định nil', () => {
    expect(chay('var a: Int?\nprint(a)').ra).toBe('nil\n')
  })

  it('func khai BÊN TRONG thân một func khác', () => {
    expect(
      chay('func outer() {\nfunc inner() -> Int { return 5 }\nprint(inner())\n}\nouter()').ra,
    ).toBe('5\n')
  })

  it('struct khai BÊN TRONG thân một func', () => {
    expect(chay('func f() {\nstruct Local { var x = 1 }\nprint(Local().x)\n}\nf()').ra).toBe('1\n')
  })
})

describe('vòng lặp — lỗi thật lan ra ngoài, tuple thiếu phần tử, trần bước cho for', () => {
  it('lỗi thật (không phải break/continue) lan ra khỏi while', () => {
    expect(
      chaySwift('var i = 0\nwhile i < 3 {\ni += 1\nif i == 2 { print(1 / 0) }\n}').error,
    ).toContain('Chia cho 0')
  })

  it('lỗi thật lan ra khỏi repeat-while', () => {
    expect(
      chaySwift('var i = 0\nrepeat {\ni += 1\nif i == 2 { print(1 / 0) }\n} while i < 3').error,
    ).toContain('Chia cho 0')
  })

  it('lỗi thật lan ra khỏi for', () => {
    expect(chaySwift('for i in 1...3 {\nif i == 2 { print(1 / 0) }\n}').error).toContain(
      'Chia cho 0',
    )
  })

  it('for (a, b) tách cặp trên mảng KHÔNG phải cặp — phần thiếu la nil', () => {
    expect(chay('for (a, b) in [1, 2] {\nprint(a)\nprint(b)\n}').ra).toBe('1\nnil\n2\nnil\n')
  })

  it('khoảng lặp quá lớn cũng bị chặn bởi trần bước, không chỉ vòng lặp vô hạn', () => {
    const r = chaySwift('for i in 1...1000 {\n}', [], { tranBuoc: 50 })
    expect(r.error).toContain('Khoang lap qua lon')
  })
})

describe('switch — where=false rơi xuống nhánh khác, lỗi thật trong nhánh, kem thiếu phần tử', () => {
  it('case where=false thì bỏ qua, roi xuong default', () => {
    expect(
      chay('let n = 1\nswitch n { case let x where x > 3: print("to"); default: print("nho") }').ra,
    ).toBe('nho\n')
  })

  it('lỗi thật lan ra khỏi thân một case', () => {
    expect(chaySwift('switch 1 { case 1: print(1 / 0) }').error).toContain('Chia cho 0')
  })

  it('lỗi thật lan ra khỏi thân default', () => {
    expect(chaySwift('switch 1 { case 9: print(1); default: print(1 / 0) }').error).toContain(
      'Chia cho 0',
    )
  })

  it('mẫu case đòi nhiều gia tri kem hơn enum thực co — phần thiếu la nil', () => {
    expect(
      chay(
        'enum E { case p(Int) }\nlet e = E.p(1)\nswitch e { case .p(let a, let b): print(a); print(b) }',
      ).ra,
    ).toBe('1\nnil\n')
  })
})

describe('do/catch — lọc kiểu lỗi không khớp phải continue, và lỗi không ai bắt', () => {
  it('catch loc theo kieu KHONG khop thi roi qua catch bare tiep theo', () => {
    expect(
      chay(
        'enum L1: Error { case a }\nenum L2: Error { case b }\nfunc f() throws { throw L2.b }\ndo {\ntry f()\n} catch let e as L1 {\nprint("L1")\n} catch {\nprint("khac")\n}',
      ).ra,
    ).toBe('khac\n')
  })

  it('khong catch nao khop thi nem lai loi goc, khong ai bat', () => {
    const r = chaySwift(
      'enum L1: Error { case a }\nenum L2: Error { case b }\nfunc f() throws { throw L2.b }\ndo {\ntry f()\n} catch let e as L1 {\nprint("hit")\n}',
    )
    expect(r.error).toContain('do { … } catch { … }')
  })

  it('lỗi thật (không phải throw) trong do KHÔNG bị catch bắt nhầm', () => {
    const r = chaySwift('do {\nprint(1 / 0)\n} catch {\nprint("bat")\n}')
    expect(r.error).toContain('Chia cho 0')
  })

  it('ném một giá trị Optional (mở gói e.gia trong catch)', () => {
    expect(
      chay('enum L: Error { case x }\nlet e: L? = L.x\ndo {\nthrow e\n} catch {\nprint("bat")\n}')
        .ra,
    ).toBe('bat\n')
  })

  it('ném một giá trị KHÔNG phải enum (kieuGia lấy từ tenKieuCua)', () => {
    expect(chay('do {\nthrow 5\n} catch {\nprint("bat")\n}').ra).toBe('bat\n')
  })
})

describe('gán — gán qua thực thể Optional, gán trực tiếp chỉ số, gán gộp từ điển', () => {
  it('gán thuộc tính đi qua một biến Optional (khong can !/?.)', () => {
    expect(chay('struct S { var x = 1 }\nvar a: S? = S()\na.x = 5\nprint(a!.x)').ra).toBe('5\n')
  })

  it('gán trực tiếp (không gộp) vào một chỉ số mảng hợp lệ', () => {
    expect(chay('var a = [1, 2, 3]\na[1] = 9\nprint(a)').ra).toBe('[1, 9, 3]\n')
  })

  it('gán gộp vào một khoá TỪ ĐIỂN đã có', () => {
    expect(chay('var d = ["a": 1]\nd["a"] += 4\nprint(d["a"])').ra).toBe('Optional(5)\n')
  })

  it('gán gộp vào một khoá từ điển CHƯA có là lỗi (mac dinh nil)', () => {
    expect(chaySwift('var d = ["a": 1]\nd["b"] += 1').error).toContain('Optional')
  })

  it('vế trái của "=" không phải biến/thuộc tính/phần tử là lỗi', () => {
    expect(chaySwift('1 = 2').error).toContain('phai la mot bien')
  })
})

describe('toán tử &&, ||, ??, và mở gói "!" — chưa có ca chạy thật nào trước đợt này', () => {
  it('&&: ngắn mạch khi trái false, và chạy phải khi trái true', () => {
    expect(chay('print(false && true)').ra).toBe('false\n')
    expect(chay('print(true && true)').ra).toBe('true\n')
    expect(chay('print(true && false)').ra).toBe('false\n')
  })

  it('||: ngắn mạch khi trái true, và chạy phải khi trái false', () => {
    expect(chay('print(true || false)').ra).toBe('true\n')
    expect(chay('print(false || true)').ra).toBe('true\n')
    expect(chay('print(false || false)').ra).toBe('false\n')
  })

  it('?? trên Optional có giá trị (mở gói vế trái)', () => {
    expect(chay('let a: Int? = 5\nprint(a ?? 0)').ra).toBe('5\n')
  })

  it('?? trên giá trị KHÔNG phải Optional (Swift cũng cho qua) tra lai chinh no', () => {
    expect(chay('let a = 5\nprint(a ?? 0)').ra).toBe('5\n')
  })

  it('"!" mở gói một Optional CÓ giá trị', () => {
    expect(chay('let a: Int? = 5\nprint(a!)').ra).toBe('5\n')
  })

  it('"!" trên giá trị không phải Optional vẫn cho qua', () => {
    expect(chay('let a = 5\nprint(a!)').ra).toBe('5\n')
  })

  it('try? với ham tra ve nil (Optional rong) khong bi boc kep', () => {
    expect(chay('func f() throws -> Int? { return nil }\nprint(try? f())').ra).toBe('nil\n')
  })

  it('try? voi ham tra ve Optional CO gia tri', () => {
    expect(chay('func f() throws -> Int? { return 5 }\nprint(try? f())').ra).toBe('Optional(5)\n')
  })

  it('try? voi ham tra ve gia tri KHONG phai Optional thi tu boc lai', () => {
    expect(chay('func f() throws -> Int { return 5 }\nprint(try? f())').ra).toBe('Optional(5)\n')
  })

  it('try? KHONG nuot loi khac Error (vi du chia cho 0) — van lan ra', () => {
    const r = chaySwift('func f() throws -> Int { return 1 / 0 }\nprint(try? f())')
    expect(r.error).toContain('Chia cho 0')
  })
})

describe('so sánh chuỗi <=, số <=, và toán tử không hợp lệ giữa hai String', () => {
  it('hai chuỗi bằng nhau qua <=', () => {
    expect(chay('print("a" <= "a")').ra).toBe('true\n')
  })

  it('hai số bằng nhau qua <=', () => {
    expect(chay('print(3 <= 3)').ra).toBe('true\n')
  })

  it('toán tử "*" không dùng được giữa hai String', () => {
    expect(chaySwift('let a = "x" * "y"').error).toContain('toan tu "*"')
  })

  it('chuoi truoc "lon hon" chuoi sau qua toan tu ">"', () => {
    expect(chay('print("b" > "a")').ra).toBe('true\n')
  })
})

describe('lấy chỉ số/soNguyen với giá trị không phải Int', () => {
  it('chỉ số mảng phải là Int, không phải String', () => {
    const { loi } = chay('print([1, 2]["x"])')
    expect(loi).toContain('Cho doi mot Int')
    expect(loi).toContain('String')
  })
})

describe('gọi hàm — phương thức tự viết trên enum, gọi optional-chaining, thành viên ngầm kèm đối số', () => {
  it('gọi một hàm tự viết trên một enum thông qua truy cập kiểu', () => {
    expect(
      chay('enum E { case a\nfunc chao() -> String { return "xin chao" }\n}\nprint(E.a.chao())').ra,
    ).toBe('xin chao\n')
  })

  it('gọi phương thức bằng "?." trên nil trả về nil, không nổ', () => {
    expect(chay('let s: String? = nil\nprint(s?.uppercased())').ra).toBe('nil\n')
  })

  it('thành viên ngầm ".ten(doi so)" khớp enum có giá trị kèm theo', () => {
    expect(
      chay(
        'struct S {}\nenum E { case p(Int, Int) }\nlet e: E = .p(3, 4)\nswitch e { case .p(let a, let b): print(a + b) }',
      ).ra,
    ).toBe('7\n')
  })

  it('thành viên ngầm ".ten(doi so)" khong khop enum nao la loi', () => {
    const { loi } = chay('enum E { case p(Int) }\nlet x = .khongTonTai(1)')
    expect(loi).toContain('Khong enum nao co truong hop')
  })

  it('thành viên ngầm ".ten" bỏ qua kiểu KHÔNG phải enum truoc khi tim thay enum khop', () => {
    expect(
      chay('struct S { var x = 1 }\nenum Dir { case up, down }\nlet d: Dir = .up\nprint(d)').ra,
    ).toBe('up\n')
  })

  it('thiếu đối số khi tham số đầu là "_" — goi y khong co nhan cho tham so do', () => {
    const { loi } = chay('func saludar(_ ten: String, tuoi: Int) {}\nsaludar("Lan")')
    expect(loi).toContain('thieu doi so "tuoi"')
    expect(loi).toContain('saludar(…, tuoi: …)')
  })

  it('gọi trực tiếp constructor cua enum ma khong dung dang .<truong hop>', () => {
    const { loi } = chay('enum E { case a }\nlet e = E()')
    expect(loi).toContain('Tao gia tri enum E bang dang')
    expect(loi).toContain('E.<truong hop>')
  })

  it('struct co thuoc tinh khong khai KIEU va khong co GIA TRI mac dinh', () => {
    const { loi } = chay('struct S { var x }\nlet s = S()')
    expect(loi).toContain('chua co gia tri')
  })

  it('lỗi thật trong thân thuộc tính tính lan ra ngoài (khong bi nuot bang TinHieuTra)', () => {
    const r = chaySwift('struct S {\nvar x: Int {\nreturn 1 / 0\n}\n}\nprint(S().x)')
    expect(r.error).toContain('Chia cho 0')
  })
})

describe('hàm dựng sẵn — các nhánh còn thiếu của Int/Double/Bool/Array/abs/min/max', () => {
  it('Int(Int) tra ve chinh no', () => {
    expect(chay('print(Int(5))').ra).toBe('5\n')
  })

  it('Double(Double) tra ve chinh no', () => {
    expect(chay('print(Double(2.5))').ra).toBe('2.5\n')
  })

  it('Double(String) khong doi duoc tra ve nil', () => {
    expect(chay('print(Double("abc"))').ra).toBe('nil\n')
  })

  it('Bool(Bool) tra ve chinh no', () => {
    expect(chay('print(Bool(true))').ra).toBe('true\n')
  })

  it('Bool("false") tra ve Optional(false)', () => {
    expect(chay('print(Bool("false"))').ra).toBe('Optional(false)\n')
  })

  it('Array() khong doi so la loi', () => {
    expect(chaySwift('print(Array())').error).toContain('chi doi duoc tu String hoac mang')
  })

  it('Array(mang) chi don gian chep lai mang', () => {
    expect(chay('print(Array([1, 2]))').ra).toBe('[1, 2]\n')
  })

  it('abs() khong doi so la loi', () => {
    expect(chaySwift('print(abs())').error).toContain('can mot so')
  })

  it('min/max voi mot phan tu khong phai so la loi', () => {
    expect(chaySwift('print(min(1, "x"))').error).toContain('it nhat hai so')
  })

  it('min/max chon dung gia tri nho hon/lon hon o vi tri thu hai', () => {
    expect(chay('print(min(5, 2))').ra).toBe('2\n')
    expect(chay('print(max(2, 9))').ra).toBe('9\n')
  })
})

describe('phương thức chuỗi/mảng/từ điển — các nhánh còn thiếu', () => {
  it('split khong nhan "separator:" van dung duoc vi tri', () => {
    expect(chay('print("a-b-c".split("-"))').ra).toBe('["a", "b", "c"]\n')
  })

  it('append() khong doi so la loi', () => {
    expect(chaySwift('var a = [1]\na.append()').error).toContain('append(…) can mot gia tri')
  })

  it('contains(gia tri) khong dung dong', () => {
    expect(chay('print([1, 2, 3].contains(2))').ra).toBe('true\n')
  })

  it('contains() khong doi so thi so voi nil, khong khop phan tu nao', () => {
    expect(chay('print([1, 2].contains())').ra).toBe('false\n')
  })

  it('map()/filter()/reduce() thieu dong dieu la loi', () => {
    expect(chaySwift('print([1, 2].map(5))').error).toContain('dong (closure)')
    expect(chaySwift('print([1, 2].map())').error).toContain('dong (closure)')
    expect(chaySwift('print([1, 2].filter())').error).toContain('dong (closure)')
    expect(chaySwift('print([1, 2].reduce(0))').error).toContain('dong (closure)')
    expect(chaySwift('print([1, 2].reduce())').error).toContain('dong (closure)')
  })

  it('sorted() khong dong dung so sanh so mac dinh', () => {
    expect(chay('print([3, 1, 2].sorted())').ra).toBe('[1, 2, 3]\n')
  })

  it('sorted() so sanh so mac dinh khi mang tron ca Int va Double', () => {
    expect(chay('print([2, 1.5, 0.5].sorted())').ra).toBe('[0.5, 1.5, 2]\n')
  })

  it('joined() khong nhan separator mac dinh la chuoi rong', () => {
    expect(chay('print(["a", "b"].joined())').ra).toBe('ab\n')
  })

  it('insert() thieu nhan "at:" la loi ro rang', () => {
    expect(chaySwift('var a = [1]\na.insert(2)').error).toContain('Cho doi mot Int')
  })

  it('removeValue voi doi so KHONG nhan "forKey:" van dung duoc vi tri', () => {
    expect(chay('var d = ["a": 1]\nprint(d.removeValue("a"))\nprint(d.count)').ra).toBe(
      'Optional(1)\n0\n',
    )
  })

  it('removeValue khong doi so la loi khoa tu dien', () => {
    expect(chaySwift('var d = ["a": 1]\nprint(d.removeValue())').error).toContain('khoa tu dien')
  })

  it('removeValue voi khoa KHONG ton tai tra ve nil', () => {
    expect(chay('var d = ["a": 1]\nprint(d.removeValue(forKey: "z"))').ra).toBe('nil\n')
  })

  it('isMultiple(of:) tren Int', () => {
    expect(chay('let n = 4\nprint(n.isMultiple(of: 2))').ra).toBe('true\n')
    expect(chay('let n = 5\nprint(n.isMultiple(of: 2))').ra).toBe('false\n')
  })

  it('goi mot thuoc tinh nhu ham co dau ngoac rong ("count()")', () => {
    expect(chay('print([1, 2].count())').ra).toBe('2\n')
  })

  it('hasPrefix khong doi so la loi ro can String', () => {
    expect(chaySwift('print("abc".hasPrefix())').error).toContain('can mot String')
  })

  it('mang: .first va .last tren mang KHONG rong', () => {
    expect(chay('print([1, 2, 3].first)').ra).toBe('Optional(1)\n')
    expect(chay('print([1, 2, 3].last)').ra).toBe('Optional(3)\n')
  })

  it('mang rong: .first cung tra nil giong .last', () => {
    expect(chay('let a: [Int] = []\nprint(a.first)').ra).toBe('nil\n')
  })

  it('description tra ve chuoi mo ta gia tri', () => {
    expect(chay('let a = 5\nprint(a.description)').ra).toBe('5\n')
  })
})

describe('Range .count nửa mở, và từ điển nhiều phần tử khi sắp theo khoá', () => {
  it('Range nua mo .count tru di mot so voi Range dong', () => {
    expect(chay('print((1..<3).count)').ra).toBe('2\n')
  })

  it('tu dien 3 phan tu van sap dung theo khoa', () => {
    expect(chay('let d = ["c": 3, "a": 1, "b": 2]\nprint(d.values)').ra).toBe('[1, 2, 3]\n')
  })
})
