// swiftSim/parser — PHÂN TÍCH CÚ PHÁP Swift rút gọn (PR-M3).
//
// Kiểu parser: đệ quy xuống cho câu lệnh, leo bậc (precedence climbing) cho biểu thức — cùng
// khuôn mọi trình biên dịch thật dùng, và đủ gọn để đọc lại được.
//
// LUẬT SOẠN THÔNG BÁO LỖI (hiến chương M §3.4): không bao giờ nói "unexpected token". Mỗi lỗi
// phải nói học viên ĐANG THIẾU GÌ và SỬA THẾ NÀO, bằng tiếng Việt, kèm số dòng.
import { tachToken, LoiSwift, type Token } from './lexer.js'
import type {
  BieuThuc,
  CaEnum,
  CaSwitch,
  DieuKien,
  KhaiBaoHam,
  KhaiBaoKieu,
  KhoiBat,
  Lenh,
  MauSwitch,
  ThamSo,
} from './ast.js'

/** Bậc ưu tiên toán tử — số lớn buộc chặt hơn. Theo đúng bảng của Swift cho tập con này. */
const BAC: Record<string, number> = {
  '||': 1,
  '&&': 2,
  '==': 3,
  '!=': 3,
  '<': 3,
  '<=': 3,
  '>': 3,
  '>=': 3,
  '??': 4,
  '...': 5,
  '..<': 5,
  '+': 6,
  '-': 6,
  '*': 7,
  '/': 7,
  '%': 7,
}

export function phanTich(src: string): Lenh[] {
  return new BoPhanTich(tachToken(src)).chuongTrinh()
}

class BoPhanTich {
  private i = 0
  constructor(private readonly tk: Token[]) {}

  // ─────────────── tiện ích ───────────────

  private xem(buoc = 0): Token {
    return this.tk[Math.min(this.i + buoc, this.tk.length - 1)]!
  }

  private get dong(): number {
    return this.xem().dong
  }

  private la(chu: string): boolean {
    const t = this.xem()
    return (t.loai === 'dau' || t.loai === 'tuKhoa') && t.chu === chu
  }

  private nhan(chu: string): boolean {
    if (!this.la(chu)) return false
    this.i += 1
    return true
  }

  private doiHoi(chu: string, nhac: string): Token {
    if (!this.la(chu)) throw new LoiSwift(nhac, this.dong)
    return this.tk[this.i++]!
  }

  private doiHoiTen(nhac: string): string {
    const t = this.xem()
    if (t.loai !== 'ten') throw new LoiSwift(nhac, t.dong)
    this.i += 1
    return t.chu
  }

  private boXuongDong(): void {
    while (this.xem().loai === 'xuongDong' || this.la(';')) this.i += 1
  }

  /** Kết thúc một câu lệnh: xuống dòng, dấu ';', hoặc sắp hết khối. */
  private ketThucLenh(): void {
    if (this.xem().loai === 'xuongDong' || this.la(';')) {
      this.boXuongDong()
      return
    }
    if (this.la('}') || this.xem().loai === 'het') return
    throw new LoiSwift(
      `Bo chay khong hieu "${this.xem().chu}" o day. Moi cau lenh Swift viet tren mot dong rieng.`,
      this.dong,
    )
  }

  // ─────────────── chương trình & khối ───────────────

  chuongTrinh(): Lenh[] {
    const ra: Lenh[] = []
    this.boXuongDong()
    while (this.xem().loai !== 'het') {
      ra.push(this.lenh())
      this.boXuongDong()
    }
    return ra
  }

  private khoi(ten: string): Lenh[] {
    this.doiHoi('{', `Thieu dau ngoac nhon "{" mo than ${ten}.`)
    const ra: Lenh[] = []
    this.boXuongDong()
    while (!this.la('}')) {
      if (this.xem().loai === 'het') {
        throw new LoiSwift(`Thieu dau ngoac nhon "}" dong than ${ten}.`, this.dong)
      }
      ra.push(this.lenh())
      this.boXuongDong()
    }
    this.i += 1
    return ra
  }

  // ─────────────── câu lệnh ───────────────

  private lenh(): Lenh {
    const vt = { dong: this.dong }
    if (this.la('import')) {
      // `import Foundation` là dòng đầu của gần như mọi file Swift ngoài đời. Bộ chạy KHÔNG có
      // thư viện chuẩn, nhưng nuốt dòng này để học viên chép code về/đi mà không vấp.
      this.i += 1
      this.doiHoiTen('Sau "import" phai la ten mot module, vi du: import Foundation')
      return { k: 'bieuThuc', bt: { k: 'nil', vt }, vt }
    }
    if (this.la('let') || this.la('var')) return this.khaiBao()
    if (this.la('func')) return { k: 'ham', ham: this.ham(false, false), vt }
    if (this.la('struct') || this.la('class') || this.la('enum') || this.la('protocol')) {
      return { k: 'kieu', kieu: this.kieu(), vt }
    }
    if (this.la('if')) return this.reNhanh()
    if (this.la('guard')) return this.chan()
    if (this.la('while')) {
      this.i += 1
      const dieuKien = this.bieuThuc()
      return { k: 'while', dieuKien, than: this.khoi('while'), vt }
    }
    if (this.la('repeat')) {
      this.i += 1
      const than = this.khoi('repeat')
      this.doiHoi('while', 'Sau khoi "repeat { … }" phai co "while <dieu kien>".')
      return { k: 'repeat', than, dieuKien: this.bieuThuc(), vt }
    }
    if (this.la('for')) return this.vongFor()
    if (this.la('switch')) return this.reNhieuNhanh()
    if (this.la('do')) return this.thuVaBat()
    if (this.la('return')) {
      this.i += 1
      const trong = this.xem().loai === 'xuongDong' || this.la('}') || this.la(';')
      const gia = trong ? undefined : this.bieuThuc()
      this.ketThucLenh()
      return gia === undefined ? { k: 'return', vt } : { k: 'return', gia, vt }
    }
    if (this.la('throw')) {
      this.i += 1
      const gia = this.bieuThuc()
      this.ketThucLenh()
      return { k: 'throw', gia, vt }
    }
    if (this.la('break')) {
      this.i += 1
      this.ketThucLenh()
      return { k: 'break', vt }
    }
    if (this.la('continue')) {
      this.i += 1
      this.ketThucLenh()
      return { k: 'continue', vt }
    }

    // Còn lại: biểu thức, hoặc một phép gán.
    const bt = this.bieuThuc()
    for (const toan of ['=', '+=', '-=', '*=', '/=']) {
      if (this.la(toan)) {
        this.i += 1
        const gia = this.bieuThuc()
        this.ketThucLenh()
        return { k: 'gan', dich: bt, toan, gia, vt }
      }
    }
    this.ketThucLenh()
    return { k: 'bieuThuc', bt, vt }
  }

  private khaiBao(): Lenh {
    const vt = { dong: this.dong }
    const hangSo = this.xem().chu === 'let'
    this.i += 1
    const ten = this.doiHoiTen(
      `Sau "${hangSo ? 'let' : 'var'}" phai la ten bien. Vi du: ${hangSo ? 'let' : 'var'} tuoi = 20`,
    )
    const kieu = this.nhan(':') ? this.tenKieu() : undefined
    const gia = this.nhan('=') ? this.bieuThuc() : undefined
    if (gia === undefined && kieu === undefined) {
      throw new LoiSwift(
        `Bien "${ten}" phai co gia tri khoi tao hoac kieu. Vi du: var ${ten} = 0 hoac var ${ten}: Int`,
        vt.dong,
      )
    }
    this.ketThucLenh()
    return {
      k: 'khaiBao',
      ten,
      hangSo,
      ...(kieu !== undefined ? { kieu } : {}),
      ...(gia !== undefined ? { gia } : {}),
      vt,
    }
  }

  /** Đọc một tên kiểu: `Int`, `String?`, `[Int]`, `[String: Int]`, `(Int) -> Int`. */
  private tenKieu(): string {
    let ra = ''
    if (this.nhan('[')) {
      ra = '[' + this.tenKieu()
      if (this.nhan(':')) ra += ': ' + this.tenKieu()
      this.doiHoi(']', 'Thieu dau ngoac vuong "]" dong kieu mang/tu dien.')
      ra += ']'
    } else if (this.la('(')) {
      // Kiểu hàm — bộ chạy chỉ ghi lại chữ, không kiểm sâu.
      this.i += 1
      const phan: string[] = []
      while (!this.la(')')) {
        phan.push(this.tenKieu())
        if (!this.nhan(',')) break
      }
      this.doiHoi(')', 'Thieu dau ngoac ")" dong kieu ham.')
      ra = `(${phan.join(', ')})`
      if (this.nhan('->')) ra += ' -> ' + this.tenKieu()
    } else {
      ra = this.doiHoiTen('Thieu ten kieu (vi du Int, String, Bool).')
      if (this.nhan('<')) {
        const phan: string[] = []
        while (!this.la('>')) {
          phan.push(this.tenKieu())
          if (!this.nhan(',')) break
        }
        this.doiHoi('>', 'Thieu dau ">" dong danh sach kieu tong quat.')
        ra += `<${phan.join(', ')}>`
      }
    }
    while (this.nhan('?')) ra += '?'
    if (this.nhan('->')) ra += ' -> ' + this.tenKieu()
    return ra
  }

  private thamSoDs(): ThamSo[] {
    this.doiHoi('(', 'Thieu dau ngoac "(" mo danh sach tham so.')
    const ra: ThamSo[] = []
    while (!this.la(')')) {
      // Nhãn ngoài + tên trong: `func f(cho ten: String)`; `_` nghĩa là gọi không cần nhãn.
      let nhan: string | undefined
      let ten: string
      const dau = this.xem()
      if (dau.loai === 'dau' && dau.chu === '_') {
        this.i += 1
        nhan = '_'
        ten = this.doiHoiTen('Sau "_" phai la ten tham so.')
      } else {
        ten = this.doiHoiTen('Thieu ten tham so.')
        if (this.xem().loai === 'ten') {
          nhan = ten
          ten = this.doiHoiTen('Thieu ten tham so.')
        }
      }
      this.doiHoi(':', `Tham so "${ten}" phai khai kieu. Vi du: ${ten}: Int`)
      this.nhan('inout')
      const kieu = this.tenKieu()
      const macDinh = this.nhan('=') ? this.bieuThuc() : undefined
      ra.push({
        ...(nhan !== undefined ? { nhan } : {}),
        ten,
        kieu,
        ...(macDinh !== undefined ? { macDinh } : {}),
      })
      if (!this.nhan(',')) break
    }
    this.doiHoi(')', 'Thieu dau ngoac ")" dong danh sach tham so.')
    return ra
  }

  private ham(bienDoi: boolean, tinh: boolean): KhaiBaoHam {
    const vt = { dong: this.dong }
    this.doiHoi('func', 'Thieu tu khoa "func".')
    const ten = this.doiHoiTen('Sau "func" phai la ten ham. Vi du: func chao() { … }')
    // Kiểu tổng quát `<T>` — bộ chạy chấp nhận cú pháp và bỏ qua ràng buộc lúc chạy.
    if (this.nhan('<')) {
      while (!this.la('>') && this.xem().loai !== 'het') this.i += 1
      this.doiHoi('>', 'Thieu dau ">" dong danh sach kieu tong quat.')
    }
    const thamSo = this.thamSoDs()
    const nemLoi = this.nhan('throws')
    const kieuTra = this.nhan('->') ? this.tenKieu() : undefined
    return {
      ten,
      thamSo,
      ...(kieuTra !== undefined ? { kieuTra } : {}),
      than: this.khoi(`ham "${ten}"`),
      nemLoi,
      bienDoi,
      tinh,
      vt,
    }
  }

  private kieu(): KhaiBaoKieu {
    const vt = { dong: this.dong }
    const loai = this.xem().chu as KhaiBaoKieu['loai']
    this.i += 1
    const ten = this.doiHoiTen(
      `Sau "${loai}" phai la ten kieu, viet hoa chu dau. Vi du: ${loai} Sach { … }`,
    )
    if (this.nhan('<')) {
      while (!this.la('>') && this.xem().loai !== 'het') this.i += 1
      this.doiHoi('>', 'Thieu dau ">" dong danh sach kieu tong quat.')
    }
    const keThua: string[] = []
    if (this.nhan(':')) {
      do keThua.push(this.tenKieu())
      while (this.nhan(','))
    }

    const kb: KhaiBaoKieu = {
      loai,
      ten,
      keThua,
      thuocTinh: [],
      ham: [],
      khoiTao: [],
      ca: [],
      yeuCau: [],
      vt,
    }
    this.doiHoi('{', `Thieu dau ngoac nhon "{" mo than ${loai} ${ten}.`)
    this.boXuongDong()
    while (!this.la('}')) {
      if (this.xem().loai === 'het') {
        throw new LoiSwift(`Thieu dau ngoac nhon "}" dong ${loai} ${ten}.`, this.dong)
      }
      this.thanhVien(kb)
      this.boXuongDong()
    }
    this.i += 1
    return kb
  }

  private thanhVien(kb: KhaiBaoKieu): void {
    const vt = { dong: this.dong }
    if (this.la('case')) {
      this.i += 1
      do {
        const ten = this.doiHoiTen('Sau "case" phai la ten truong hop.')
        const ca: CaEnum = { ten, kemTheo: [] }
        if (this.nhan('(')) {
          while (!this.la(')')) {
            ca.kemTheo.push(this.tenKieu())
            if (!this.nhan(',')) break
          }
          this.doiHoi(')', 'Thieu dau ngoac ")" dong danh sach gia tri kem theo.')
        }
        if (this.nhan('=')) ca.giaTriTho = this.bieuThuc()
        kb.ca.push(ca)
      } while (this.nhan(','))
      return
    }

    const tinh = this.nhan('static')
    this.nhan('override')
    const bienDoi = this.nhan('mutating')

    if (this.la('init')) {
      this.i += 1
      this.nhan('?')
      const thamSo = this.thamSoDs()
      const nemLoi = this.nhan('throws')
      kb.khoiTao.push({
        ten: 'init',
        thamSo,
        than: this.khoi(`init cua ${kb.ten}`),
        nemLoi,
        bienDoi: true,
        tinh: false,
        vt,
      })
      return
    }

    if (this.la('func')) {
      // Protocol: chữ ký không có thân — phân biệt bằng cách nhìn trước tới dấu '{'.
      if (kb.loai === 'protocol' && !this.coThanHam()) {
        this.i += 1
        const ten = this.doiHoiTen('Sau "func" phai la ten ham.')
        const thamSo = this.thamSoDs()
        const kieuTra = this.nhan('->') ? this.tenKieu() : undefined
        kb.yeuCau.push({ ten, thamSo, ...(kieuTra !== undefined ? { kieuTra } : {}), bienDoi })
        return
      }
      kb.ham.push(this.ham(bienDoi, tinh))
      return
    }

    if (this.la('let') || this.la('var')) {
      const hangSo = this.xem().chu === 'let'
      this.i += 1
      const ten = this.doiHoiTen('Sau "let"/"var" phai la ten thuoc tinh.')
      const kieu = this.nhan(':') ? this.tenKieu() : undefined
      // Protocol khai YÊU CẦU thuộc tính bằng `{ get }` hoặc `{ get set }` — không có thân.
      if (
        this.la('{') &&
        (chuNguyenTaiVitri(this.tk, this.i + 1) === 'get' ||
          chuNguyenTaiVitri(this.tk, this.i + 1) === 'set')
      ) {
        this.i += 1
        while (this.la('get') || this.la('set')) this.i += 1
        this.doiHoi('}', 'Yeu cau thuoc tinh cua protocol viet dang: var ten: Kieu { get }')
        kb.thuocTinh.push({
          ten,
          ...(kieu !== undefined ? { kieu } : {}),
          hangSo: true,
          tinh,
          vt,
        })
        return
      }
      // Thuộc tính TÍNH: `var chuVi: Double { return … }`.
      if (this.la('{')) {
        const than = this.khoi(`thuoc tinh tinh "${ten}"`)
        kb.thuocTinh.push({
          ten,
          ...(kieu !== undefined ? { kieu } : {}),
          hangSo: true,
          than,
          tinh,
          vt,
        })
        return
      }
      const khoiTao = this.nhan('=') ? this.bieuThuc() : undefined
      kb.thuocTinh.push({
        ten,
        ...(kieu !== undefined ? { kieu } : {}),
        ...(khoiTao !== undefined ? { khoiTao } : {}),
        hangSo,
        tinh,
        vt,
      })
      return
    }

    throw new LoiSwift(
      `Bo chay khong hieu "${this.xem().chu}" trong than ${kb.loai} ${kb.ten}. Ben trong chi dat duoc: let/var, func, init${kb.loai === 'enum' ? ', case' : ''}.`,
      vt.dong,
    )
  }

  /** Nhìn trước xem một `func` có thân `{ … }` không (để tách chữ ký protocol khỏi hàm thường). */
  private coThanHam(): boolean {
    let j = this.i
    let sau = 0
    while (j < this.tk.length) {
      const t = this.tk[j]!
      if (t.loai === 'xuongDong' || t.loai === 'het') return false
      if (t.chu === '(') sau += 1
      else if (t.chu === ')') sau -= 1
      else if (t.chu === '{' && sau === 0) return true
      j += 1
    }
    return false
  }

  private dieuKienDs(): DieuKien[] {
    const ra: DieuKien[] = []
    do {
      if (this.la('let') || this.la('var')) {
        const hangSo = this.xem().chu === 'let'
        this.i += 1
        const ten = this.doiHoiTen(
          'Sau "if let" phai la ten bien moi. Vi du: if let ten = tenTuyChon',
        )
        // Khai kiểu khi mở gói (`if let x: Int = a`) là cú pháp hợp lệ — nuốt phần kiểu.
        if (this.nhan(':')) this.tenKieu()
        // `if let ten` (Swift 5.7 rút gọn) — vế phải chính là biến cùng tên.
        const gia = this.nhan('=')
          ? this.bieuThuc()
          : ({ k: 'ten', ten, vt: { dong: this.dong } } as BieuThuc)
        ra.push({ k: 'moGoi', ten, gia, hangSo })
      } else {
        ra.push({ k: 'bt', bt: this.bieuThuc() })
      }
    } while (this.nhan(','))
    return ra
  }

  private reNhanh(): Lenh {
    const vt = { dong: this.dong }
    this.doiHoi('if', 'Thieu tu khoa "if".')
    const dieuKien = this.dieuKienDs()
    const than = this.khoi('if')
    if (this.nhan('else')) {
      const nguoc = this.la('if') ? [this.reNhanh()] : this.khoi('else')
      return { k: 'if', dieuKien, than, nguoc, vt }
    }
    return { k: 'if', dieuKien, than, vt }
  }

  private chan(): Lenh {
    const vt = { dong: this.dong }
    this.doiHoi('guard', 'Thieu tu khoa "guard".')
    const dieuKien = this.dieuKienDs()
    this.doiHoi(
      'else',
      'Sau dieu kien cua "guard" phai co "else { … }" — guard bat buoc phai co duong thoat.',
    )
    return { k: 'guard', dieuKien, nguoc: this.khoi('else cua guard'), vt }
  }

  private vongFor(): Lenh {
    const vt = { dong: this.dong }
    this.doiHoi('for', 'Thieu tu khoa "for".')
    const t = this.xem()
    let bien: string
    if (t.loai === 'dau' && t.chu === '_') {
      this.i += 1
      bien = '_'
    } else if (t.loai === 'dau' && t.chu === '(') {
      // `for (khoa, gia) in tuDien` — tách cặp ngay tại chỗ, khuôn duyệt từ điển của Swift.
      this.i += 1
      const phan: string[] = []
      while (!this.la(')')) {
        phan.push(
          this.la('_')
            ? (this.i++, '_')
            : this.doiHoiTen('Trong ngoac cua "for" phai la ten bien.'),
        )
        if (!this.nhan(',')) break
      }
      this.doiHoi(')', 'Thieu dau ngoac ")" dong danh sach bien cua for.')
      bien = `(${phan.join(',')})`
    } else {
      bien = this.doiHoiTen('Sau "for" phai la ten bien lap. Vi du: for so in 1...5')
    }
    this.doiHoi('in', 'Thieu tu khoa "in". Cu phap: for <bien> in <day> { … }')
    const nguon = this.bieuThuc()
    return { k: 'for', bien, nguon, than: this.khoi('for'), vt }
  }

  private reNhieuNhanh(): Lenh {
    const vt = { dong: this.dong }
    this.doiHoi('switch', 'Thieu tu khoa "switch".')
    const gia = this.bieuThuc()
    this.doiHoi('{', 'Thieu dau ngoac nhon "{" mo than switch.')
    this.boXuongDong()
    const ca: CaSwitch[] = []
    let macDinh: Lenh[] | undefined
    while (!this.la('}')) {
      if (this.xem().loai === 'het')
        throw new LoiSwift('Thieu dau ngoac nhon "}" dong switch.', this.dong)
      if (this.nhan('default')) {
        this.doiHoi(':', 'Sau "default" phai co dau hai cham.')
        macDinh = this.thanCa()
        continue
      }
      this.doiHoi('case', 'Trong than switch chi co "case …:" hoac "default:".')
      const mau: MauSwitch[] = []
      do mau.push(this.mauSwitch())
      while (this.nhan(','))
      const loc = this.nhan('where') ? this.bieuThuc() : undefined
      this.doiHoi(':', 'Sau mau cua "case" phai co dau hai cham.')
      ca.push({ mau, ...(loc !== undefined ? { loc } : {}), than: this.thanCa() })
    }
    this.i += 1
    return { k: 'switch', gia, ca, ...(macDinh !== undefined ? { macDinh } : {}), vt }
  }

  /** Thân một `case`: chạy tới `case`/`default`/`}` kế tiếp (Swift không rơi tầng). */
  private thanCa(): Lenh[] {
    const ra: Lenh[] = []
    this.boXuongDong()
    while (!this.la('case') && !this.la('default') && !this.la('}')) {
      if (this.xem().loai === 'het')
        throw new LoiSwift('Thieu dau ngoac nhon "}" dong switch.', this.dong)
      ra.push(this.lenh())
      this.boXuongDong()
    }
    return ra
  }

  private mauSwitch(): MauSwitch {
    // `case let .diem(x, y)` / `case .do` / `case .diem(let x, let y)`
    const buocLet = this.la('let')
    if (buocLet) this.i += 1
    if (this.nhan('.')) {
      const ten = this.doiHoiTen('Sau dau cham phai la ten truong hop cua enum.')
      const buoc: string[] = []
      if (this.nhan('(')) {
        while (!this.la(')')) {
          this.nhan('let')
          buoc.push(this.doiHoiTen('Trong ngoac cua mau phai la ten bien de lay gia tri kem theo.'))
          if (!this.nhan(',')) break
        }
        this.doiHoi(')', 'Thieu dau ngoac ")" dong mau cua case.')
      }
      return { k: 'buocNgam', ten, buoc }
    }
    if (buocLet) {
      const ten = this.doiHoiTen('Sau "case let" phai la ten bien.')
      return { k: 'buoc', ten, buoc: [] }
    }
    return { k: 'gia', bt: this.bieuThuc() }
  }

  private thuVaBat(): Lenh {
    const vt = { dong: this.dong }
    this.doiHoi('do', 'Thieu tu khoa "do".')
    const than = this.khoi('do')
    const bat: KhoiBat[] = []
    while (this.la('catch')) {
      this.i += 1
      let ten: string | undefined
      let kieu: string | undefined
      if (this.la('let')) {
        this.i += 1
        ten = this.doiHoiTen('Sau "catch let" phai la ten bien giu loi.')
        if (this.nhan('as')) kieu = this.tenKieu()
      } else if (this.la('.') || this.xem().loai === 'ten') {
        // `catch LoiX.hetHang` — bộ chạy chỉ dùng phần tên kiểu để lọc.
        kieu = this.la('.') ? undefined : this.tenKieu()
        if (this.nhan('.')) this.doiHoiTen('Sau dau cham phai la ten truong hop cua loi.')
      }
      bat.push({
        ...(ten !== undefined ? { ten } : {}),
        ...(kieu !== undefined ? { kieu } : {}),
        than: this.khoi('catch'),
      })
    }
    if (bat.length === 0) {
      throw new LoiSwift('Sau khoi "do { … }" phai co it nhat mot "catch { … }".', vt.dong)
    }
    return { k: 'do', than, bat, vt }
  }

  // ─────────────── biểu thức ───────────────

  bieuThuc(bacToiThieu = 0): BieuThuc {
    let trai = this.donNguyen()
    for (;;) {
      const t = this.xem()
      // Toán tử ba ngôi ` ? : ` — bậc thấp nhất, kết hợp phải.
      if (t.loai === 'dau' && t.chu === '?' && bacToiThieu === 0) {
        this.i += 1
        const dung = this.bieuThuc()
        this.doiHoi(':', 'Toan tu ba ngoi phai du dang: <dieu kien> ? <neu dung> : <neu sai>')
        const sai = this.bieuThuc()
        trai = { k: 'baNgoi', dieuKien: trai, dung, sai, vt: { dong: t.dong } }
        continue
      }
      if (t.loai !== 'dau') break
      const bac = BAC[t.chu]
      if (bac === undefined || bac < bacToiThieu) break
      this.i += 1
      if (t.chu === '...' || t.chu === '..<') {
        const den = this.bieuThuc(bac + 1)
        trai = { k: 'khoang', tu: trai, den, kin: t.chu === '...', vt: { dong: t.dong } }
        continue
      }
      // `??` kết hợp PHẢI (a ?? b ?? c = a ?? (b ?? c)); các toán tử còn lại kết hợp trái.
      const phai = this.bieuThuc(t.chu === '??' ? bac : bac + 1)
      trai = { k: 'nhiNguyen', toan: t.chu, trai, phai, vt: { dong: t.dong } }
    }
    return trai
  }

  private donNguyen(): BieuThuc {
    const t = this.xem()
    if (t.loai === 'dau' && (t.chu === '-' || t.chu === '!')) {
      this.i += 1
      return { k: 'donNguyen', toan: t.chu, ben: this.donNguyen(), vt: { dong: t.dong } }
    }
    if (this.la('try')) {
      this.i += 1
      const tuyChon = this.nhan('?')
      return { k: 'thu', ben: this.donNguyen(), tuyChon, vt: { dong: t.dong } }
    }
    return this.hauTo(this.nguyenTo())
  }

  private hauTo(bt: BieuThuc): BieuThuc {
    for (;;) {
      const t = this.xem()
      if (t.loai !== 'dau') return bt
      if (t.chu === '.' || t.chu === '?.') {
        this.i += 1
        const ten =
          this.xem().loai === 'tuKhoa'
            ? this.tk[this.i++]!.chu
            : this.doiHoiTen('Sau dau cham phai la ten thuoc tinh hoac ham.')
        bt = { k: 'truyCap', doiTuong: bt, ten, tuyChon: t.chu === '?.', vt: { dong: t.dong } }
        continue
      }
      if (t.chu === '(') {
        bt = { k: 'goi', ham: bt, thamSo: this.thamSoGoi(), vt: { dong: t.dong } }
        continue
      }
      if (t.chu === '[') {
        this.i += 1
        const khoa = this.bieuThuc()
        this.doiHoi(']', 'Thieu dau ngoac vuong "]" dong phep lay phan tu.')
        bt = { k: 'chiSo', doiTuong: bt, khoa, vt: { dong: t.dong } }
        continue
      }
      if (t.chu === '!') {
        this.i += 1
        bt = { k: 'moBuoc', ben: bt, vt: { dong: t.dong } }
        continue
      }
      // Đóng đuôi (trailing closure): `mang.map { … }` và `mang.reduce(0) { … }`.
      if (t.chu === '{' && bt.k === 'truyCap') {
        const dong = this.dongKhoi()
        bt = { k: 'goi', ham: bt, thamSo: [{ gia: dong }], vt: { dong: t.dong } }
        continue
      }
      if (t.chu === '{' && bt.k === 'goi' && bt.ham.k === 'truyCap') {
        // Đóng viết SAU dấu ngoặc là đối số cuối cùng — khuôn quen của reduce/sorted(by:).
        const dong = this.dongKhoi()
        bt = { k: 'goi', ham: bt.ham, thamSo: [...bt.thamSo, { gia: dong }], vt: bt.vt }
        continue
      }
      return bt
    }
  }

  private thamSoGoi(): { nhan?: string; gia: BieuThuc }[] {
    this.doiHoi('(', 'Thieu dau ngoac "(".')
    const ra: { nhan?: string; gia: BieuThuc }[] = []
    this.boXuongDong()
    while (!this.la(')')) {
      // Nhãn tham số: `ten:` (nhưng `a ? b : c` bên trong thì không phải).
      let nhan: string | undefined
      if ((this.xem().loai === 'ten' || this.xem().loai === 'tuKhoa') && this.xem(1).chu === ':') {
        nhan = this.tk[this.i]!.chu
        this.i += 2
      }
      ra.push({ ...(nhan !== undefined ? { nhan } : {}), gia: this.bieuThuc() })
      this.boXuongDong()
      if (!this.nhan(',')) break
      this.boXuongDong()
    }
    this.doiHoi(')', 'Thieu dau ngoac ")" dong danh sach doi so.')
    return ra
  }

  /** Đóng (closure): `{ (x: Int) -> Int in … }`, `{ x in … }`, hoặc `{ … }` dùng `$0`. */
  private dongKhoi(): BieuThuc {
    const vt = { dong: this.dong }
    this.doiHoi('{', 'Thieu dau ngoac nhon "{" mo dong.')
    const thamSo: ThamSo[] = []
    const luu = this.i
    // Thử đọc phần khai tham số trước `in`; không có thì lùi lại và dùng `$0`.
    let coIn = false
    for (let j = this.i, sau = 0; j < this.tk.length; j += 1) {
      const t = this.tk[j]!
      if (t.loai === 'xuongDong' || t.loai === 'het') break
      if (t.chu === '{') sau += 1
      if (t.chu === '}') {
        if (sau === 0) break
        sau -= 1
      }
      if (t.chu === 'in' && sau === 0) {
        coIn = true
        break
      }
    }
    if (coIn) {
      const trongNgoac = this.nhan('(')
      while (!this.la('in') && !this.la(')')) {
        const ten = this.doiHoiTen('Trong khai bao dong phai la ten tham so.')
        const kieu = this.nhan(':') ? this.tenKieu() : undefined
        // Đóng (closure) KHÔNG dùng nhãn đối số — `nhan: '_'` nói đúng điều đó cho bộ chạy.
        thamSo.push({ nhan: '_', ten, ...(kieu !== undefined ? { kieu } : {}) })
        if (!this.nhan(',')) break
      }
      if (trongNgoac) this.doiHoi(')', 'Thieu dau ngoac ")" dong danh sach tham so cua dong.')
      if (this.nhan('->')) this.tenKieu()
      this.doiHoi('in', 'Sau danh sach tham so cua dong phai co tu khoa "in".')
    } else {
      this.i = luu
    }
    const than: Lenh[] = []
    this.boXuongDong()
    while (!this.la('}')) {
      if (this.xem().loai === 'het')
        throw new LoiSwift('Thieu dau ngoac nhon "}" dong khoi dong.', this.dong)
      than.push(this.lenh())
      this.boXuongDong()
    }
    this.i += 1
    return { k: 'dong', thamSo, than, vt }
  }

  private nguyenTo(): BieuThuc {
    const t = this.xem()
    const vt = { dong: t.dong }

    if (t.loai === 'so') {
      this.i += 1
      const gia = Number(t.chu)
      return t.laDouble ? { k: 'soThuc', gia, vt } : { k: 'soNguyen', gia, vt }
    }
    if (t.loai === 'chuoi') {
      this.i += 1
      const manh = (t.manh ?? []).map((m) =>
        m.loai === 'chu'
          ? ({ loai: 'chu', chu: m.noiDung } as const)
          : ({ loai: 'bieuThuc', bt: phanTichBieuThuc(m.noiDung, m.dong) } as const),
      )
      return { k: 'chuoi', manh: [...manh], vt }
    }
    if (this.la('true') || this.la('false')) {
      this.i += 1
      return { k: 'bool', gia: t.chu === 'true', vt }
    }
    if (this.la('nil')) {
      this.i += 1
      return { k: 'nil', vt }
    }
    if (this.la('self')) {
      this.i += 1
      return { k: 'self', vt }
    }
    if (this.la('{')) return this.dongKhoi()
    if (this.la('(')) {
      this.i += 1
      const ben = this.bieuThuc()
      this.doiHoi(')', 'Thieu dau ngoac ")" dong bieu thuc.')
      return ben
    }
    if (this.la('[')) return this.mangHoacTuDien()
    if (this.la('.')) {
      // `.do` — thành viên ngầm của enum, kiểu suy ra từ ngữ cảnh.
      this.i += 1
      const ten = this.doiHoiTen('Sau dau cham phai la ten truong hop cua enum.')
      return { k: 'thanhVienNgam', ten, vt }
    }
    if (t.loai === 'ten') {
      this.i += 1
      return { k: 'ten', ten: t.chu, vt }
    }
    // `_ = <bieu thuc>` — Swift dung dau gach duoi de noi "chay di, toi khong can ket qua".
    if (t.loai === 'dau' && t.chu === '_') {
      this.i += 1
      return { k: 'ten', ten: '_', vt }
    }
    throw new LoiSwift(
      `Bo chay dang cho mot gia tri nhung gap "${t.chu === '\\n' ? 'het dong' : t.chu}".`,
      t.dong,
    )
  }

  private mangHoacTuDien(): BieuThuc {
    const vt = { dong: this.dong }
    this.doiHoi('[', 'Thieu dau ngoac vuong "[".')
    this.boXuongDong()
    if (this.nhan(']')) return { k: 'mang', phanTu: [], vt }
    // `[:]` là từ điển rỗng.
    if (this.la(':')) {
      this.i += 1
      this.doiHoi(']', 'Thieu dau ngoac vuong "]" dong tu dien rong.')
      return { k: 'tuDien', cap: [], vt }
    }
    const dau = this.bieuThuc()
    if (this.nhan(':')) {
      const cap = [{ khoa: dau, gia: this.bieuThuc() }]
      while (this.nhan(',')) {
        this.boXuongDong()
        if (this.la(']')) break
        const khoa = this.bieuThuc()
        this.doiHoi(':', 'Moi phan tu cua tu dien phai la <khoa>: <gia tri>.')
        cap.push({ khoa, gia: this.bieuThuc() })
      }
      this.boXuongDong()
      this.doiHoi(']', 'Thieu dau ngoac vuong "]" dong tu dien.')
      return { k: 'tuDien', cap, vt }
    }
    const phanTu = [dau]
    while (this.nhan(',')) {
      this.boXuongDong()
      if (this.la(']')) break
      phanTu.push(this.bieuThuc())
    }
    this.boXuongDong()
    this.doiHoi(']', 'Thieu dau ngoac vuong "]" dong mang.')
    return { k: 'mang', phanTu, vt }
  }
}

/** Phân tích một biểu thức đứng riêng (dùng cho phần `\(…)` trong chuỗi nội suy). */
function chuNguyenTaiVitri(tk: Token[], i: number): string | null {
  const t = tk[i]
  return t && (t.loai === 'tuKhoa' || t.loai === 'ten') ? t.chu : null
}

function phanTichBieuThuc(src: string, dong: number): BieuThuc {
  try {
    const bp = new BoPhanTich(tachToken(src))
    return bp.bieuThuc()
  } catch (e) {
    // Lỗi bên trong `\(…)` phải chỉ về dòng của CHUỖI, không phải dòng 1 của mảnh con.
    throw new LoiSwift(e instanceof Error ? e.message : String(e), dong)
  }
}
