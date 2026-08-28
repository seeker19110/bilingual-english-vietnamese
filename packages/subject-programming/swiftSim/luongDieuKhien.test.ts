// Luồng điều khiển, gán và lỗi của bộ chạy Swift rút gọn.
//
// Bổ sung cho `loi.test.ts` (chuyên thông báo lỗi) và `conformance.test.ts` (đối chiếu với
// swiftc): các ca dưới đây canh NHÁNH — break/continue trong từng loại vòng, các dạng lặp,
// switch có lọc, do/catch, và các đường gán sai — vốn là chỗ dễ hỏng âm thầm khi sửa nội bộ.
import { describe, it, expect } from 'vitest'
import { chaySwift } from './index.js'

/** Chạy và bỏ dòng tự khai — để ca kiểm đọc gọn. */
function ra(src: string): string {
  return chaySwift(src).output.split('\n').slice(1).join('\n')
}

describe('vong lap', () => {
  it('repeat-while chay than it nhat mot lan', () => {
    expect(ra('var i = 9\nrepeat { print(i) } while i < 5')).toBe('9\n')
  })
  it('continue trong while', () => {
    expect(ra('var i = 0\nwhile i < 4 { i += 1; if i == 2 { continue }; print(i) }')).toBe(
      '1\n3\n4\n',
    )
  })
  it('break trong while', () => {
    expect(ra('var i = 0\nwhile i < 9 { i += 1; if i == 3 { break }; print(i) }')).toBe('1\n2\n')
  })
  it('continue trong for', () => {
    expect(ra('for i in 1...4 { if i == 2 { continue }; print(i) }')).toBe('1\n3\n4\n')
  })
  it('break trong for', () => {
    expect(ra('for i in 1...9 { if i == 3 { break }; print(i) }')).toBe('1\n2\n')
  })
  it('khoang nua mo bo dau cuoi', () => {
    expect(ra('for i in 1..<3 { print(i) }')).toBe('1\n2\n')
  })
  it('lap tren mang', () => {
    expect(ra('for x in [1, 2] { print(x) }')).toBe('1\n2\n')
  })
  it('lap tren chuoi cho tung ky tu', () => {
    expect(ra('for c in "ab" { print(c) }')).toBe('a\nb\n')
  })
  it('lap tren tu dien tach duoc (khoa, gia)', () => {
    expect(ra('for (k, v) in ["a": 1] { print("\\(k)=\\(v)") }')).toBe('a=1\n')
  })
  it('lap tren gia tri khong lap duoc la loi', () => {
    expect(chaySwift('for x in 5 { print(x) }').error).toContain('Khong lap tren gia tri kieu Int')
  })
})

describe('switch', () => {
  it('case co dieu kien loc (where)', () => {
    expect(
      ra('let n = 5\nswitch n { case let x where x > 3: print("to"); default: print("nho") }'),
    ).toBe('to\n')
  })
  it('roi vao default khi khong case nao khop', () => {
    expect(ra('let n = 1\nswitch n { case 9: print("a"); default: print("d") }')).toBe('d\n')
  })
  it('enum co gia tri kem, lay ra bang let', () => {
    expect(
      ra('enum E { case a(Int) }\nlet e = E.a(1)\nswitch e { case .a(let n): print(n) }'),
    ).toBe('1\n')
  })
})

describe('do / catch / throw', () => {
  it('do-catch bat duoc loi nem ra', () => {
    expect(
      ra(
        'enum L: Error { case x }\nfunc f() throws { throw L.x }\ndo { try f() } catch { print("bat") }',
      ),
    ).toBe('bat\n')
  })
  it('loi khong ai bat thi dung chuong trinh kem huong dan', () => {
    const r = chaySwift('enum L: Error { case x }\nfunc f() throws { throw L.x }\ntry f()')
    expect(r.error).toContain('do { … } catch { … }')
  })
  it('try? bien loi thanh nil', () => {
    expect(
      ra('enum L: Error { case x }\nfunc f() throws -> Int { throw L.x }\nprint(try? f())'),
    ).toBe('nil\n')
  })
})

describe('gan gia tri', () => {
  it('gan vao khoa moi cua tu dien', () => {
    expect(ra('var d = ["a": 1]\nd["b"] = 2\nprint(d)')).toBe('["a": 1, "b": 2]\n')
  })
  it('gan thuoc tinh len gia tri khong phai thuc the la loi', () => {
    expect(chaySwift('var a = 5\na.x = 1').error).toContain('Khong gan duoc thuoc tinh')
  })
  it('gan vao ten chua khai bao la loi', () => {
    expect(chaySwift('x = 1').error).toContain('Chua khai bao "x"')
  })
  it('gan lai hang so (let) la loi kem cach sua', () => {
    expect(chaySwift('let a = 1\na = 2').error).toContain('khai bang "var"')
  })
  it('gan ngoai bien mang la loi noi ro dai mang', () => {
    expect(chaySwift('var a = [1]\na[5] = 2').error).toContain('nam ngoai mang')
  })
})

describe('in gia tri va so sanh', () => {
  it('mang so sanh theo NOI DUNG', () => {
    expect(ra('print([1, 2] == [1, 2])')).toBe('true\n')
  })
  it('tu dien in sap theo khoa (tat dinh)', () => {
    expect(ra('print(["b": 2, "a": 1])')).toBe('["a": 1, "b": 2]\n')
  })
  it('ham in ra (Function)', () => {
    expect(ra('let f = { (x: Int) -> Int in x }\nprint(f)')).toBe('(Function)\n')
  })
  it('doi dau tren gia tri khong phai so la loi', () => {
    expect(chaySwift('print(-"a")').error).toContain('Khong doi dau gia tri kieu String')
  })
  it('doc ten chua khai bao la loi kem cach sua', () => {
    expect(chaySwift('print(zz)').error).toContain('khai truoc bang "let zz = …"')
  })
})
