// kotlinSim/parser — PHÂN TÍCH CÚ PHÁP cho bộ chạy Kotlin rút gọn (PR-M7).
//
// Cách làm: đệ quy xuống cho câu lệnh, leo bậc cho biểu thức — cùng khuôn với swiftSim để hai
// bộ chạy đọc chéo được. Bốn chỗ Kotlin KHÁC hẳn Swift và là nguồn lỗi chính khi viết file này:
//
//   ① XUỐNG DÒNG LÀ DẤU KẾT CÂU. Không có dấu chấm phẩy bắt buộc, nên parser phải biết chỗ nào
//      xuống dòng kết thúc câu và chỗ nào chỉ là ngắt dòng cho dễ đọc (sau toán tử, sau dấu mở
//      ngoặc). Đây là chỗ tốn công nhất.
//   ② `if`, `when`, `try` VỪA LÀ CÂU LỆNH VỪA LÀ BIỂU THỨC. `val x = if (a) 1 else 2` hợp lệ.
//   ③ LAMBDA ĐUÔI: `ds.map { it * 2 }` — khối `{ … }` đứng NGOÀI ngoặc gọi hàm. Phải phân biệt
//      với khối thân thường, và với `{ }` của khai báo lớp.
//   ④ HÀM TRUNG TỐ: `1 until 10`, `10 downTo 1`, `a to b` — tên thường đứng ở vị trí toán tử.
//
// Thứ tự ưu tiên toán tử theo đúng Kotlin (cao → thấp): hậu tố · tiền tố · as · nhân · cộng ·
// khoảng · hàm trung tố · elvis · in/is · so sánh · bằng · && · ||. Lưu ý elvis BÓ CHẶT HƠN so
// sánh — xếp nhầm là `a ?: b > c` chạy sai mà không báo lỗi.
import { tachTu, LoiKotlin, type Token } from './lexer.js'
import type {
  BieuThuc,
  CaEnum,
  KhaiBaoHam,
  KhaiBaoKieu,
  KhoiBat,
  Lenh,
  MauWhen,
  NhanhWhen,
  ThamSo,
  ThamSoDung,
  ThuocTinh,
  ViTri,
} from './ast.js'

/** Tên hàm dùng ở vị trí trung tố mà bộ chạy hiểu. */
const TRUNG_TO = new Set(['until', 'downTo', 'step', 'to'])

/** Từ khoá bổ nghĩa đứng trước khai báo — gom lại rồi mới biết đang khai cái gì. */
const BO_NGHIA = new Set([
  'open',
  'override',
  'abstract',
  'private',
  'public',
  'protected',
  'internal',
  'data',
  'sealed',
  'companion',
])

export class BoPhanTich {
  private t: Token[]
  private i = 0

  constructor(src: string) {
    this.t = tachTu(src)
  }

  // ───────────────────────── Tiện ích duyệt token ─────────────────────────

  private hienTai(): Token {
    return this.t[this.i]!
  }

  private vt(): ViTri {
    return { dong: this.hienTai().dong }
  }

  /** Bỏ qua mọi token xuống dòng liên tiếp. */
  private boXuongDong(): void {
    while (this.hienTai().loai === 'xuongDong') this.i++
  }

  /** Bỏ qua xuống dòng VÀ dấu chấm phẩy — dùng giữa các câu lệnh. */
  private boNganCach(): void {
    while (this.hienTai().loai === 'xuongDong' || this.hienTai().chu === ';') this.i++
  }

  private la(chu: string): boolean {
    const t = this.hienTai()
    return (t.loai === 'dau' || t.loai === 'tuKhoa') && t.chu === chu
  }

  /** Nhìn trước n token, BỎ QUA xuống dòng — để quyết định rẽ nhánh. */
  private nhinXa(n: number): Token {
    let j = this.i
    let con = n
    while (j < this.t.length) {
      if (this.t[j]!.loai !== 'xuongDong') {
        if (con === 0) return this.t[j]!
        con--
      }
      j++
    }
    return this.t[this.t.length - 1]!
  }

  private an(chu: string): boolean {
    if (this.la(chu)) {
      this.i++
      return true
    }
    return false
  }

  /** Như `an` nhưng cho phép xuống dòng đứng trước (dùng cho `else`, `{` của lambda đuôi…). */
  private anQuaDong(chu: string): boolean {
    const luu = this.i
    this.boXuongDong()
    if (this.la(chu)) {
      this.i++
      return true
    }
    this.i = luu
    return false
  }

  private buoc(chu: string, goiY: string): void {
    this.boXuongDong()
    if (!this.an(chu)) {
      throw new LoiKotlin(
        `Thieu "${chu}" o day. ${goiY} (dang thay: "${this.hienTai().chu || 'het bai'}")`,
        this.hienTai().dong,
      )
    }
  }

  private tenBatBuoc(viec: string): string {
    this.boXuongDong()
    const t = this.hienTai()
    // Một số từ khoá mềm của Kotlin vẫn dùng làm tên được trong tập con này.
    if (t.loai !== 'ten') {
      throw new LoiKotlin(
        `Cho nay can mot cai TEN (${viec}), nhung dang thay "${t.chu || 'het bai'}".`,
        t.dong,
      )
    }
    this.i++
    return t.chu
  }

  // ───────────────────────── Điểm vào ─────────────────────────

  phanTich(): Lenh[] {
    const ra: Lenh[] = []
    this.boNganCach()
    while (this.hienTai().loai !== 'het') {
      ra.push(this.cauLenh())
      this.boNganCach()
    }
    return ra
  }

  /** Thân khối `{ … }`. */
  private khoi(): Lenh[] {
    this.buoc('{', 'Than cua khoi lenh phai nam trong cap ngoac nhon.')
    const ra: Lenh[] = []
    this.boNganCach()
    while (!this.la('}')) {
      if (this.hienTai().loai === 'het') {
        throw new LoiKotlin(
          'Khoi lenh mo bang "{" ma khong dong bang "}". Dem lai so ngoac nhon.',
          this.hienTai().dong,
        )
      }
      ra.push(this.cauLenh())
      this.boNganCach()
    }
    this.i++ // '}'
    return ra
  }

  /** Thân của if/while/for: hoặc một khối, hoặc đúng MỘT câu lệnh (Kotlin cho phép bỏ ngoặc). */
  private thanHoacMotLenh(): Lenh[] {
    this.boXuongDong()
    if (this.la('{')) return this.khoi()
    return [this.cauLenh()]
  }

  // ───────────────────────── Câu lệnh ─────────────────────────

  private cauLenh(): Lenh {
    this.boNganCach()
    const t = this.hienTai()
    const vt = this.vt()

    // Gom bổ nghĩa (open/override/data/sealed/…) rồi mới biết khai cái gì.
    if (t.loai === 'tuKhoa' && BO_NGHIA.has(t.chu)) {
      const bn = this.gomBoNghia()
      const sau = this.hienTai()
      if (sau.chu === 'class' || sau.chu === 'interface' || sau.chu === 'object') {
        return { k: 'kieu', kieu: this.khaiBaoKieu(bn), vt }
      }
      if (sau.chu === 'enum') {
        return { k: 'kieu', kieu: this.khaiBaoKieu(bn), vt }
      }
      if (sau.chu === 'fun') {
        return { k: 'ham', ham: this.khaiBaoHam(bn), vt }
      }
      if (sau.chu === 'val' || sau.chu === 'var') {
        return this.khaiBaoBien()
      }
      throw new LoiKotlin(
        `Sau tu khoa "${bn.join(' ')}" phai la class, interface, object, fun, val hoac var.`,
        sau.dong,
      )
    }

    if (t.chu === 'val' || t.chu === 'var') return this.khaiBaoBien()
    if (t.chu === 'fun') return { k: 'ham', ham: this.khaiBaoHam([]), vt }
    if (t.chu === 'class' || t.chu === 'interface' || t.chu === 'object' || t.chu === 'enum') {
      return { k: 'kieu', kieu: this.khaiBaoKieu([]), vt }
    }

    if (t.chu === 'if') return this.lenhIf()
    if (t.chu === 'while') return this.lenhWhile()
    if (t.chu === 'do') return this.lenhDoWhile()
    if (t.chu === 'for') return this.lenhFor()
    if (t.chu === 'when') return this.lenhWhen()
    if (t.chu === 'try') return this.lenhTry()

    if (t.chu === 'return') {
      this.i++
      // `return` trần: nếu hết dòng hoặc gặp `}` thì không có giá trị.
      if (this.hienTai().loai === 'xuongDong' || this.la('}') || this.hienTai().loai === 'het') {
        return { k: 'return', vt }
      }
      return { k: 'return', gia: this.bieuThuc(), vt }
    }
    if (t.chu === 'break') {
      this.i++
      return { k: 'break', vt }
    }
    if (t.chu === 'continue') {
      this.i++
      return { k: 'continue', vt }
    }
    if (t.chu === 'throw') {
      this.i++
      return { k: 'throw', gia: this.bieuThuc(), vt }
    }

    // Còn lại: biểu thức, có thể theo sau là phép gán.
    const bt = this.bieuThuc()
    const g = this.hienTai()
    if (
      g.loai === 'dau' &&
      (g.chu === '=' ||
        g.chu === '+=' ||
        g.chu === '-=' ||
        g.chu === '*=' ||
        g.chu === '/=' ||
        g.chu === '%=')
    ) {
      this.i++
      this.boXuongDong()
      return { k: 'gan', dich: bt, toan: g.chu, gia: this.bieuThuc(), vt }
    }
    if (g.loai === 'dau' && (g.chu === '++' || g.chu === '--')) {
      this.i++
      const mot: BieuThuc = { k: 'soNguyen', gia: 1, vt }
      return { k: 'gan', dich: bt, toan: g.chu === '++' ? '+=' : '-=', gia: mot, vt }
    }
    return { k: 'bieuThuc', bt, vt }
  }

  private gomBoNghia(): string[] {
    const ra: string[] = []
    while (this.hienTai().loai === 'tuKhoa' && BO_NGHIA.has(this.hienTai().chu)) {
      ra.push(this.hienTai().chu)
      this.i++
      this.boXuongDong()
    }
    return ra
  }

  private khaiBaoBien(): Lenh {
    const vt = this.vt()
    const hangSo = this.hienTai().chu === 'val'
    this.i++
    this.boXuongDong()

    // Huỷ cấu trúc: `val (a, b) = cap`
    if (this.la('(')) {
      this.i++
      const ten: string[] = []
      do {
        this.boXuongDong()
        ten.push(this.tenBatBuoc('ten bien khi tach bo cac phan'))
        this.boXuongDong()
      } while (this.an(','))
      this.buoc(')', 'Danh sach ten khi tach phai dong bang ngoac tron.')
      this.buoc('=', 'Tach bo cac phan thi bat buoc phai gan gia tri ngay.')
      this.boXuongDong()
      return { k: 'khaiBaoRa', ten, gia: this.bieuThuc(), vt }
    }

    const ten = this.tenBatBuoc('ten bien')
    let kieu: string | undefined
    if (this.an(':')) kieu = this.tenKieu()
    let gia: BieuThuc | undefined
    if (this.an('=')) {
      this.boXuongDong()
      gia = this.bieuThuc()
    }
    return {
      k: 'khaiBao',
      ten,
      ...(kieu !== undefined ? { kieu } : {}),
      ...(gia !== undefined ? { gia } : {}),
      hangSo,
      vt,
    }
  }

  /**
   * Tên kiểu — bộ chạy KHÔNG kiểm kiểu tĩnh (xem KHAC_BIET), nên chỉ đọc cho qua và giữ lại
   * chuỗi để thông báo lỗi đọc được. Hiểu `Int?`, `List<String>`, `Map<String, Int>`.
   */
  private tenKieu(): string {
    this.boXuongDong()
    let ra = ''
    // Kiểu HÀM: `(Int) -> Int`, `() -> Unit`, `(Int, String) -> Boolean`. Bộ chạy không kiểm
    // kiểu tĩnh nên chỉ cần đọc cho hết, nhưng PHẢI đọc được — nếu không thì mọi hàm bậc cao
    // có khai kiểu tham số đều không phân tích nổi.
    if (this.la('(')) {
      let sau = 0
      do {
        if (this.la('(')) sau++
        if (this.la(')')) sau--
        ra += this.hienTai().chu
        this.i++
      } while (sau > 0 && this.hienTai().loai !== 'het')
      this.boXuongDong()
      if (this.an('->')) {
        ra += '->' + this.tenKieu()
      }
      return ra
    }
    const t = this.hienTai()
    if (t.loai !== 'ten' && t.loai !== 'tuKhoa') {
      throw new LoiKotlin(`Cho nay can mot ten KIEU, dang thay "${t.chu || 'het bai'}".`, t.dong)
    }
    ra += t.chu
    this.i++
    if (this.la('<')) {
      let sau = 0
      do {
        if (this.la('<')) sau++
        if (this.la('>')) sau--
        ra += this.hienTai().chu
        this.i++
      } while (sau > 0 && this.hienTai().loai !== 'het')
    }
    if (this.an('?')) ra += '?'
    return ra
  }

  private khaiBaoHam(boNghia: string[]): KhaiBaoHam {
    const vt = this.vt()
    this.buoc('fun', 'Khai bao ham bat dau bang tu khoa fun.')
    const ten = this.tenBatBuoc('ten ham')
    const thamSo = this.danhSachThamSo()
    let kieuTra: string | undefined
    if (this.an(':')) kieuTra = this.tenKieu()

    const ghiDe = boNghia.includes('override')
    const mo = boNghia.includes('open')
    const truuTuongBn = boNghia.includes('abstract')

    // Hàm một biểu thức: `fun doi(x: Int) = x * 2`
    if (this.anQuaDong('=')) {
      this.boXuongDong()
      const bt = this.bieuThuc()
      return {
        ten,
        thamSo,
        ...(kieuTra !== undefined ? { kieuTra } : {}),
        than: [{ k: 'return', gia: bt, vt }],
        ghiDe,
        mo,
        truuTuong: false,
        vt,
      }
    }

    // Không có thân → là yêu cầu của interface hoặc hàm abstract.
    const luu = this.i
    this.boXuongDong()
    if (!this.la('{')) {
      this.i = luu
      return {
        ten,
        thamSo,
        ...(kieuTra !== undefined ? { kieuTra } : {}),
        than: [],
        ghiDe,
        mo,
        truuTuong: true,
        vt,
      }
    }
    this.i = luu
    return {
      ten,
      thamSo,
      ...(kieuTra !== undefined ? { kieuTra } : {}),
      than: this.khoi(),
      ghiDe,
      mo,
      truuTuong: truuTuongBn,
      vt,
    }
  }

  private danhSachThamSo(): ThamSo[] {
    this.buoc('(', 'Sau ten ham phai la cap ngoac tron chua danh sach tham so.')
    const ra: ThamSo[] = []
    this.boXuongDong()
    while (!this.la(')')) {
      this.boXuongDong()
      const ten = this.tenBatBuoc('ten tham so')
      let kieu: string | undefined
      if (this.an(':')) kieu = this.tenKieu()
      let macDinh: BieuThuc | undefined
      if (this.an('=')) {
        this.boXuongDong()
        macDinh = this.bieuThuc()
      }
      ra.push({
        ten,
        ...(kieu !== undefined ? { kieu } : {}),
        ...(macDinh !== undefined ? { macDinh } : {}),
      })
      this.boXuongDong()
      if (!this.an(',')) break
      this.boXuongDong()
    }
    this.buoc(')', 'Danh sach tham so phai dong bang ngoac tron.')
    return ra
  }

  // ───────────────────────── Khai báo kiểu ─────────────────────────

  private khaiBaoKieu(boNghia: string[]): KhaiBaoKieu {
    const vt = this.vt()
    let loai: KhaiBaoKieu['loai']
    if (this.an('enum')) {
      this.boXuongDong()
      this.buoc('class', 'Sau "enum" phai la tu khoa "class".')
      loai = 'enum'
    } else if (this.an('class')) loai = 'class'
    else if (this.an('interface')) loai = 'interface'
    else if (this.an('object')) loai = 'object'
    else {
      throw new LoiKotlin(
        'Cho nay can class, interface, object hoac enum class.',
        this.hienTai().dong,
      )
    }

    const ten = this.tenBatBuoc('ten kieu')

    // Tham số hàm dựng chính.
    const thamSoDung: ThamSoDung[] = []
    if (this.la('(')) {
      this.i++
      this.boXuongDong()
      while (!this.la(')')) {
        this.boXuongDong()
        const bnTs = this.gomBoNghia()
        let laThuocTinh: 'val' | 'var' | undefined
        if (this.la('val')) {
          laThuocTinh = 'val'
          this.i++
        } else if (this.la('var')) {
          laThuocTinh = 'var'
          this.i++
        }
        const tenTs = this.tenBatBuoc('ten tham so hàm dung')
        let kieu: string | undefined
        if (this.an(':')) kieu = this.tenKieu()
        let macDinh: BieuThuc | undefined
        if (this.an('=')) {
          this.boXuongDong()
          macDinh = this.bieuThuc()
        }
        thamSoDung.push({
          ten: tenTs,
          ...(kieu !== undefined ? { kieu } : {}),
          ...(macDinh !== undefined ? { macDinh } : {}),
          ...(laThuocTinh !== undefined ? { laThuocTinh } : {}),
          ghiDe: bnTs.includes('override'),
        })
        this.boXuongDong()
        if (!this.an(',')) break
        this.boXuongDong()
      }
      this.buoc(')', 'Danh sach tham so hàm dung phai dong bang ngoac tron.')
    }

    // Kế thừa: `: Cha(x), GiaoDien`
    let cha: KhaiBaoKieu['cha']
    const giaoDien: string[] = []
    if (this.an(':')) {
      do {
        this.boXuongDong()
        const tenCha = this.tenBatBuoc('ten lop cha hoac giao dien')
        if (this.la('(')) {
          const ts = this.thamSoGoi()
          cha = { ten: tenCha, thamSo: ts.map((x) => x.gia) }
        } else if (cha === undefined && giaoDien.length === 0) {
          // Chưa biết là lớp cha hay giao diện — interpreter tra bảng kiểu để quyết.
          giaoDien.push(tenCha)
        } else {
          giaoDien.push(tenCha)
        }
        this.boXuongDong()
      } while (this.an(','))
    }

    const kb: KhaiBaoKieu = {
      loai,
      ten,
      laData: boNghia.includes('data'),
      laSealed: boNghia.includes('sealed'),
      mo: boNghia.includes('open') || boNghia.includes('sealed') || boNghia.includes('abstract'),
      truuTuong: boNghia.includes('abstract'),
      thamSoDung,
      ...(cha !== undefined ? { cha } : {}),
      giaoDien,
      thuocTinh: [],
      ham: [],
      khoiKhoiTao: [],
      ca: [],
      vt,
    }

    // Thân — enum không bắt buộc có thân, lớp cũng vậy.
    const luu = this.i
    this.boXuongDong()
    if (!this.la('{')) {
      this.i = luu
      return kb
    }
    this.i++ // '{'
    this.boNganCach()

    if (loai === 'enum') {
      kb.ca = this.danhSachCaEnum()
      this.boNganCach()
      // Sau `;` enum có thể còn thân thường.
    }

    while (!this.la('}')) {
      if (this.hienTai().loai === 'het') {
        throw new LoiKotlin(
          `Than cua "${ten}" mo bang "{" ma khong dong bang "}".`,
          this.hienTai().dong,
        )
      }
      this.thanhVienKieu(kb)
      this.boNganCach()
    }
    this.i++ // '}'
    return kb
  }

  private danhSachCaEnum(): CaEnum[] {
    const ra: CaEnum[] = []
    this.boNganCach()
    while (this.hienTai().loai === 'ten') {
      const ten = this.hienTai().chu
      this.i++
      let thamSo: BieuThuc[] = []
      if (this.la('(')) thamSo = this.thamSoGoi().map((x) => x.gia)
      ra.push({ ten, thamSo })
      this.boXuongDong()
      if (!this.an(',')) break
      this.boNganCach()
    }
    this.boNganCach()
    this.an(';')
    return ra
  }

  private thanhVienKieu(kb: KhaiBaoKieu): void {
    const bn = this.gomBoNghia()

    if (this.la('init')) {
      this.i++
      kb.khoiKhoiTao.push(...this.khoi())
      return
    }

    if (bn.includes('companion') && this.la('object')) {
      this.i++
      // Tên của companion là tuỳ chọn và không dùng tới trong tập con này.
      if (this.hienTai().loai === 'ten') this.i++
      const trong: KhaiBaoKieu = {
        loai: 'object',
        ten: `${kb.ten}.Companion`,
        laData: false,
        laSealed: false,
        mo: false,
        truuTuong: false,
        thamSoDung: [],
        giaoDien: [],
        thuocTinh: [],
        ham: [],
        khoiKhoiTao: [],
        ca: [],
        vt: this.vt(),
      }
      this.buoc('{', 'Than companion object phai nam trong ngoac nhon.')
      this.boNganCach()
      while (!this.la('}')) {
        if (this.hienTai().loai === 'het') {
          throw new LoiKotlin(
            'companion object mo bang "{" ma khong dong bang "}".',
            this.hienTai().dong,
          )
        }
        this.thanhVienKieu(trong)
        this.boNganCach()
      }
      this.i++
      kb.dongHanh = { thuocTinh: trong.thuocTinh, ham: trong.ham }
      return
    }

    if (this.la('fun')) {
      kb.ham.push(this.khaiBaoHam(bn))
      return
    }

    if (this.la('val') || this.la('var')) {
      const vt = this.vt()
      const hangSo = this.hienTai().chu === 'val'
      this.i++
      const ten = this.tenBatBuoc('ten thuoc tinh')
      let kieu: string | undefined
      if (this.an(':')) kieu = this.tenKieu()
      let khoiTao: BieuThuc | undefined
      let than: Lenh[] | undefined
      if (this.an('=')) {
        this.boXuongDong()
        khoiTao = this.bieuThuc()
      }
      // Thuộc tính tính: `val x: Int get() = …` hoặc `get() { … }`
      const luu = this.i
      this.boXuongDong()
      if (this.hienTai().loai === 'ten' && this.hienTai().chu === 'get') {
        this.i++
        this.buoc('(', 'Sau "get" phai la cap ngoac tron rong.')
        this.buoc(')', 'Sau "get(" phai dong ngay bang ")".')
        if (this.anQuaDong('=')) {
          this.boXuongDong()
          than = [{ k: 'return', gia: this.bieuThuc(), vt }]
        } else {
          than = this.khoi()
        }
      } else {
        this.i = luu
      }
      const tt: ThuocTinh = {
        ten,
        ...(kieu !== undefined ? { kieu } : {}),
        ...(khoiTao !== undefined ? { khoiTao } : {}),
        hangSo,
        ghiDe: bn.includes('override'),
        ...(than !== undefined ? { than } : {}),
        vt,
      }
      kb.thuocTinh.push(tt)
      return
    }

    if (this.la('class') || this.la('interface') || this.la('object') || this.la('enum')) {
      // Kiểu lồng — bộ chạy nâng nó lên phạm vi ngoài cùng (tập con, xem KHONG_LAM_GI).
      throw new LoiKotlin(
        'Bo chay nay chua ho tro khai bao lop long trong lop. Dua lop ben trong ra ngoai muc cao nhat.',
        this.hienTai().dong,
      )
    }

    throw new LoiKotlin(
      `Trong than mot lop chi khai duoc val, var, fun, init hoac companion object — dang thay "${this.hienTai().chu || 'het bai'}".`,
      this.hienTai().dong,
    )
  }

  // ───────────────────────── Câu lệnh điều khiển ─────────────────────────

  private lenhIf(): Lenh {
    const vt = this.vt()
    this.buoc('if', '')
    this.buoc('(', 'Dieu kien cua if phai nam trong ngoac tron.')
    this.boXuongDong()
    const dieuKien = this.bieuThuc()
    this.buoc(')', 'Dieu kien cua if phai dong bang ngoac tron.')
    const than = this.thanHoacMotLenh()
    let nguoc: Lenh[] | undefined
    if (this.anQuaDong('else')) {
      this.boXuongDong()
      nguoc = this.la('if') ? [this.lenhIf()] : this.thanHoacMotLenh()
    }
    return { k: 'if', dieuKien, than, ...(nguoc !== undefined ? { nguoc } : {}), vt }
  }

  private lenhWhile(): Lenh {
    const vt = this.vt()
    this.buoc('while', '')
    this.buoc('(', 'Dieu kien cua while phai nam trong ngoac tron.')
    this.boXuongDong()
    const dieuKien = this.bieuThuc()
    this.buoc(')', 'Dieu kien cua while phai dong bang ngoac tron.')
    return { k: 'while', dieuKien, than: this.thanHoacMotLenh(), vt }
  }

  private lenhDoWhile(): Lenh {
    const vt = this.vt()
    this.buoc('do', '')
    const than = this.thanHoacMotLenh()
    this.boXuongDong()
    this.buoc('while', 'Sau than cua do phai co while(dieu kien).')
    this.buoc('(', 'Dieu kien cua do-while phai nam trong ngoac tron.')
    this.boXuongDong()
    const dieuKien = this.bieuThuc()
    this.buoc(')', 'Dieu kien cua do-while phai dong bang ngoac tron.')
    return { k: 'doWhile', than, dieuKien, vt }
  }

  private lenhFor(): Lenh {
    const vt = this.vt()
    this.buoc('for', '')
    this.buoc('(', 'Vong for cua Kotlin viet la for (x in nguon).')
    this.boXuongDong()
    const bien: string[] = []
    if (this.an('(')) {
      do {
        this.boXuongDong()
        bien.push(this.tenBatBuoc('ten bien lap'))
        this.boXuongDong()
      } while (this.an(','))
      this.buoc(')', 'Danh sach bien lap phai dong bang ngoac tron.')
    } else {
      bien.push(this.tenBatBuoc('ten bien lap'))
    }
    this.buoc('in', 'Vong for cua Kotlin dung tu khoa "in": for (x in danhSach).')
    this.boXuongDong()
    const nguon = this.bieuThuc()
    this.buoc(')', 'Phan dau vong for phai dong bang ngoac tron.')
    return { k: 'for', bien, nguon, than: this.thanHoacMotLenh(), vt }
  }

  private lenhWhen(): Lenh {
    const vt = this.vt()
    const w = this.whenChung()
    return {
      k: 'when',
      ...(w.chuDe !== undefined ? { chuDe: w.chuDe } : {}),
      nhanh: w.nhanh,
      ...(w.macDinh !== undefined ? { macDinh: w.macDinh } : {}),
      vt,
    }
  }

  private whenChung(): { chuDe?: BieuThuc; nhanh: NhanhWhen[]; macDinh?: Lenh[] } {
    this.buoc('when', '')
    let chuDe: BieuThuc | undefined
    if (this.la('(')) {
      this.i++
      this.boXuongDong()
      chuDe = this.bieuThuc()
      this.buoc(')', 'Chu de cua when phai dong bang ngoac tron.')
    }
    this.buoc('{', 'Than cua when phai nam trong ngoac nhon.')
    const nhanh: NhanhWhen[] = []
    let macDinh: Lenh[] | undefined
    this.boNganCach()
    while (!this.la('}')) {
      if (this.hienTai().loai === 'het') {
        throw new LoiKotlin('Khoi when mo bang "{" ma khong dong bang "}".', this.hienTai().dong)
      }
      if (this.hienTai().loai === 'ten' && this.hienTai().chu === 'else') {
        this.i++
        this.buoc('->', 'Sau "else" trong when phai la dau "->".')
        macDinh = this.thanNhanhWhen()
        this.boNganCach()
        continue
      }
      if (this.la('else')) {
        this.i++
        this.buoc('->', 'Sau "else" trong when phai la dau "->".')
        macDinh = this.thanNhanhWhen()
        this.boNganCach()
        continue
      }
      const mau: MauWhen[] = []
      do {
        this.boXuongDong()
        mau.push(this.mauWhen(chuDe !== undefined))
        this.boXuongDong()
      } while (this.an(','))
      this.buoc('->', 'Moi nhanh cua when phai co dau "->" truoc phan than.')
      nhanh.push({ mau, than: this.thanNhanhWhen() })
      this.boNganCach()
    }
    this.i++ // '}'
    return {
      ...(chuDe !== undefined ? { chuDe } : {}),
      nhanh,
      ...(macDinh !== undefined ? { macDinh } : {}),
    }
  }

  private mauWhen(coChuDe: boolean): MauWhen {
    if (this.la('in') || (this.la('!') && this.nhinXa(1).chu === 'in')) {
      const phuDinh = this.an('!')
      this.buoc('in', '')
      this.boXuongDong()
      return { k: 'trong', bt: this.bieuThuc(), phuDinh }
    }
    if (this.la('is') || (this.la('!') && this.nhinXa(1).chu === 'is')) {
      const phuDinh = this.an('!')
      this.buoc('is', '')
      return { k: 'la', kieu: this.tenKieu(), phuDinh }
    }
    const bt = this.bieuThuc()
    return coChuDe ? { k: 'gia', bt } : { k: 'dieuKien', bt }
  }

  /** Thân một nhánh `when`: một khối, hoặc một câu lệnh/biểu thức. */
  private thanNhanhWhen(): Lenh[] {
    this.boXuongDong()
    if (this.la('{')) return this.khoi()
    return [this.cauLenh()]
  }

  private lenhTry(): Lenh {
    const vt = this.vt()
    const t = this.tryChung()
    return {
      k: 'try',
      than: t.than,
      bat: t.bat,
      ...(t.cuoiCung !== undefined ? { cuoiCung: t.cuoiCung } : {}),
      vt,
    }
  }

  private tryChung(): { than: Lenh[]; bat: KhoiBat[]; cuoiCung?: Lenh[] } {
    this.buoc('try', '')
    const than = this.khoi()
    const bat: KhoiBat[] = []
    while (this.anQuaDong('catch')) {
      this.buoc('(', 'Sau "catch" phai la (ten: KieuLoi).')
      this.boXuongDong()
      const ten = this.tenBatBuoc('ten bien giu loi')
      let kieu: string | undefined
      if (this.an(':')) kieu = this.tenKieu()
      this.buoc(')', 'Phan khai bao cua catch phai dong bang ngoac tron.')
      bat.push({ ten, ...(kieu !== undefined ? { kieu } : {}), than: this.khoi() })
    }
    let cuoiCung: Lenh[] | undefined
    if (this.anQuaDong('finally')) cuoiCung = this.khoi()
    if (bat.length === 0 && cuoiCung === undefined) {
      throw new LoiKotlin(
        'Khoi try phai di kem it nhat mot "catch" hoac mot "finally", neu khong thi no khong bat duoc gi.',
        this.hienTai().dong,
      )
    }
    return { than, bat, ...(cuoiCung !== undefined ? { cuoiCung } : {}) }
  }

  // ───────────────────────── Biểu thức (leo bậc) ─────────────────────────

  bieuThuc(): BieuThuc {
    return this.hoac()
  }

  private hoac(): BieuThuc {
    let trai = this.va()
    while (this.la('||')) {
      const vt = this.vt()
      this.i++
      this.boXuongDong()
      trai = { k: 'nhiNguyen', toan: '||', trai, phai: this.va(), vt }
    }
    return trai
  }

  private va(): BieuThuc {
    let trai = this.bang()
    while (this.la('&&')) {
      const vt = this.vt()
      this.i++
      this.boXuongDong()
      trai = { k: 'nhiNguyen', toan: '&&', trai, phai: this.bang(), vt }
    }
    return trai
  }

  private bang(): BieuThuc {
    let trai = this.soSanh()
    while (this.la('==') || this.la('!=') || this.la('===') || this.la('!==')) {
      const toan = this.hienTai().chu
      const vt = this.vt()
      this.i++
      this.boXuongDong()
      trai = { k: 'nhiNguyen', toan, trai, phai: this.soSanh(), vt }
    }
    return trai
  }

  private soSanh(): BieuThuc {
    let trai = this.kiemTraTen()
    while (this.la('<') || this.la('>') || this.la('<=') || this.la('>=')) {
      const toan = this.hienTai().chu
      const vt = this.vt()
      this.i++
      this.boXuongDong()
      trai = { k: 'nhiNguyen', toan, trai, phai: this.kiemTraTen(), vt }
    }
    return trai
  }

  /** `in` / `!in` / `is` / `!is` — Kotlin gọi là "named checks". */
  private kiemTraTen(): BieuThuc {
    let trai = this.elvis()
    for (;;) {
      const vt = this.vt()
      if (this.la('is')) {
        this.i++
        trai = { k: 'la', ben: trai, kieu: this.tenKieu(), phuDinh: false, vt }
        continue
      }
      if (this.la('in')) {
        this.i++
        this.boXuongDong()
        trai = { k: 'nhiNguyen', toan: 'in', trai, phai: this.elvis(), vt }
        continue
      }
      if (this.la('!') && (this.nhinXa(1).chu === 'is' || this.nhinXa(1).chu === 'in')) {
        this.i++
        if (this.an('is')) {
          trai = { k: 'la', ben: trai, kieu: this.tenKieu(), phuDinh: true, vt }
        } else {
          this.buoc('in', '')
          this.boXuongDong()
          trai = { k: 'nhiNguyen', toan: '!in', trai, phai: this.elvis(), vt }
        }
        continue
      }
      return trai
    }
  }

  private elvis(): BieuThuc {
    const trai = this.trungTo()
    if (this.la('?:')) {
      const vt = this.vt()
      this.i++
      this.boXuongDong()
      // Phải phải kết hợp: `a ?: b ?: c` = `a ?: (b ?: c)`
      return { k: 'elvis', trai, phai: this.elvis(), vt }
    }
    return trai
  }

  /** Hàm trung tố: `1 until 10`, `10 downTo 1`, `a to b`, `... step 2`. */
  private trungTo(): BieuThuc {
    let trai = this.khoang()
    while (this.hienTai().loai === 'ten' && TRUNG_TO.has(this.hienTai().chu)) {
      const ten = this.hienTai().chu
      const vt = this.vt()
      this.i++
      this.boXuongDong()
      const phai = this.khoang()
      if (ten === 'until' || ten === 'downTo') {
        trai = { k: 'khoang', tu: trai, den: phai, loai: ten, vt }
      } else if (ten === 'step') {
        if (trai.k !== 'khoang') {
          throw new LoiKotlin(
            '"step" chi dung duoc ngay sau mot khoang, vi du 1..10 step 2.',
            vt.dong,
          )
        }
        trai = { ...trai, buoc: phai }
      } else {
        // `a to b` → cặp, biểu diễn bằng lời gọi hàm dựng sẵn.
        trai = {
          k: 'goi',
          ham: { k: 'ten', ten: 'Pair', vt },
          thamSo: [{ gia: trai }, { gia: phai }],
          vt,
        }
      }
    }
    return trai
  }

  private khoang(): BieuThuc {
    const tu = this.cong()
    if (this.la('..')) {
      const vt = this.vt()
      this.i++
      this.boXuongDong()
      return { k: 'khoang', tu, den: this.cong(), loai: 'den', vt }
    }
    return tu
  }

  private cong(): BieuThuc {
    let trai = this.nhan()
    while (this.la('+') || this.la('-')) {
      const toan = this.hienTai().chu
      const vt = this.vt()
      this.i++
      this.boXuongDong()
      trai = { k: 'nhiNguyen', toan, trai, phai: this.nhan(), vt }
    }
    return trai
  }

  private nhan(): BieuThuc {
    let trai = this.epKieu()
    while (this.la('*') || this.la('/') || this.la('%')) {
      const toan = this.hienTai().chu
      const vt = this.vt()
      this.i++
      this.boXuongDong()
      trai = { k: 'nhiNguyen', toan, trai, phai: this.epKieu(), vt }
    }
    return trai
  }

  private epKieu(): BieuThuc {
    let ben = this.tienTo()
    while (this.la('as')) {
      const vt = this.vt()
      this.i++
      const anToan = this.an('?')
      ben = { k: 'ep', ben, kieu: this.tenKieu(), anToan, vt }
    }
    return ben
  }

  private tienTo(): BieuThuc {
    const vt = this.vt()
    if (this.la('-')) {
      this.i++
      return { k: 'donNguyen', toan: '-', ben: this.tienTo(), vt }
    }
    if (this.la('!')) {
      this.i++
      return { k: 'donNguyen', toan: '!', ben: this.tienTo(), vt }
    }
    if (this.la('+')) {
      this.i++
      return this.tienTo()
    }
    return this.hauTo()
  }

  private hauTo(): BieuThuc {
    let bt = this.nguyenTo()
    for (;;) {
      const vt = this.vt()
      if (this.la('.') || this.la('?.')) {
        const anToan = this.hienTai().chu === '?.'
        this.i++
        this.boXuongDong()
        const ten = this.tenBatBuoc('ten thuoc tinh hoac ham')
        bt = { k: 'truyCap', doiTuong: bt, ten, anToan, vt }
        continue
      }
      if (this.la('!!')) {
        this.i++
        bt = { k: 'epKhongNull', ben: bt, vt }
        continue
      }
      // Tham số kiểu tường minh ở lời gọi: `listOf<Int>()`, `mutableListOf<String>()`.
      // Nhập nhằng với phép so sánh `a < b`, nên chỉ ăn khi quét được tới `>` mà giữa đó toàn
      // token của một tên kiểu, VÀ ngay sau `>` là dấu `(`. Không khớp thì trả token về nguyên.
      if (this.la('<') && this.laThamSoKieu()) {
        let sau = 0
        do {
          if (this.la('<')) sau++
          if (this.la('>')) sau--
          this.i++
        } while (sau > 0 && this.hienTai().loai !== 'het')
        continue
      }
      if (this.la('(')) {
        const ts = this.thamSoGoi()
        const dong = this.lambdaDuoi()
        bt = {
          k: 'goi',
          ham: bt,
          thamSo: ts,
          ...(dong !== undefined ? { dongCuoi: dong } : {}),
          vt,
        }
        continue
      }
      // Lambda đuôi không kèm ngoặc: `ds.map { it * 2 }`
      if (this.la('{')) {
        const dong = this.lambda()
        bt = { k: 'goi', ham: bt, thamSo: [], dongCuoi: dong, vt }
        continue
      }
      if (this.la('[')) {
        this.i++
        this.boXuongDong()
        const khoa = this.bieuThuc()
        this.buoc(']', 'Chi so phai dong bang ngoac vuong.')
        bt = { k: 'chiSo', doiTuong: bt, khoa, vt }
        continue
      }
      return bt
    }
  }

  /**
   * Đứng ở dấu `<`: đây có phải danh sách THAM SỐ KIỂU của lời gọi không?
   *
   * Đúng khi giữa `<` và `>` chỉ có token của tên kiểu (tên, dấu chấm, phẩy, `?`, `<`, `>`) và
   * ngay sau `>` là `(`. Ràng buộc cuối là thứ tách nó khỏi phép so sánh: `a < b` không bao giờ
   * có `>` rồi `(` liền theo cách đó.
   */
  private laThamSoKieu(): boolean {
    let j = this.i
    let sau = 0
    while (j < this.t.length) {
      const tk = this.t[j]!
      if (tk.loai === 'het' || tk.loai === 'xuongDong') return false
      if (tk.chu === '<') sau++
      else if (tk.chu === '>') {
        sau--
        if (sau === 0) {
          const ke = this.t[j + 1]
          return ke !== undefined && ke.chu === '('
        }
      } else if (tk.loai !== 'ten' && tk.chu !== '.' && tk.chu !== ',' && tk.chu !== '?') {
        return false
      }
      j++
    }
    return false
  }

  /** Sau `f(...)` có thể còn một lambda đuôi: `ds.fold(0) { a, b -> a + b }`. */
  private lambdaDuoi(): BieuThuc | undefined {
    const luu = this.i
    if (this.la('{')) return this.lambda()
    this.i = luu
    return undefined
  }

  private thamSoGoi(): { nhan?: string; gia: BieuThuc }[] {
    this.buoc('(', 'Loi goi ham phai co cap ngoac tron.')
    const ra: { nhan?: string; gia: BieuThuc }[] = []
    this.boXuongDong()
    while (!this.la(')')) {
      this.boXuongDong()
      // Tham số có tên: `f(ten = 1)` — phân biệt với phép so sánh bằng cách nhìn trước.
      if (
        this.hienTai().loai === 'ten' &&
        this.nhinXa(1).chu === '=' &&
        this.nhinXa(1).loai === 'dau'
      ) {
        const nhan = this.hienTai().chu
        this.i += 2
        this.boXuongDong()
        ra.push({ nhan, gia: this.bieuThuc() })
      } else {
        ra.push({ gia: this.bieuThuc() })
      }
      this.boXuongDong()
      if (!this.an(',')) break
      this.boXuongDong()
    }
    this.buoc(')', 'Loi goi ham phai dong bang ngoac tron.')
    return ra
  }

  private lambda(): BieuThuc {
    const vt = this.vt()
    this.buoc('{', 'Lambda phai nam trong ngoac nhon.')
    this.boXuongDong()

    // Có danh sách tham số không? Nhìn trước tới `->` mà không vượt qua `}` hay xuống dòng kép.
    const thamSo: string[] = []
    const luu = this.i
    let coMuiTen = false
    {
      let j = this.i
      let sau = 0
      while (j < this.t.length) {
        const tk = this.t[j]!
        if (tk.loai === 'het') break
        if (tk.chu === '{' || tk.chu === '(' || tk.chu === '[') sau++
        else if (tk.chu === '}' || tk.chu === ')' || tk.chu === ']') {
          if (sau === 0) break
          sau--
        } else if (tk.chu === '->' && sau === 0) {
          coMuiTen = true
          break
        } else if (tk.loai === 'xuongDong' && sau === 0) break
        j++
      }
    }
    if (coMuiTen) {
      do {
        this.boXuongDong()
        thamSo.push(this.tenBatBuoc('ten tham so cua lambda'))
        // Kiểu của tham số lambda là TUỲ CHỌN — bộ chạy không kiểm kiểu tĩnh nên đọc cho qua.
        if (this.an(':')) this.tenKieu()
        this.boXuongDong()
      } while (this.an(','))
      this.buoc('->', 'Danh sach tham so cua lambda ket thuc bang dau "->".')
    } else {
      this.i = luu
    }

    const than: Lenh[] = []
    this.boNganCach()
    while (!this.la('}')) {
      if (this.hienTai().loai === 'het') {
        throw new LoiKotlin('Lambda mo bang "{" ma khong dong bang "}".', vt.dong)
      }
      than.push(this.cauLenh())
      this.boNganCach()
    }
    this.i++ // '}'
    return { k: 'lambda', thamSo, than, vt }
  }

  private nguyenTo(): BieuThuc {
    const t = this.hienTai()
    const vt = this.vt()

    if (t.loai === 'so') {
      this.i++
      const gia = Number(t.chu)
      return t.laDouble ? { k: 'soThuc', gia, vt } : { k: 'soNguyen', gia, vt }
    }
    if (t.loai === 'kyTu') {
      this.i++
      return { k: 'kyTu', gia: t.chu, vt }
    }
    if (t.loai === 'chuoi') {
      this.i++
      const manh = (t.manh ?? []).map((m) =>
        m.loai === 'chu'
          ? { loai: 'chu' as const, chu: m.noiDung }
          : { loai: 'bieuThuc' as const, bt: new BoPhanTich(m.noiDung).bieuThucDon(m.dong) },
      )
      return { k: 'chuoi', manh, vt }
    }
    if (t.chu === 'true' || t.chu === 'false') {
      this.i++
      return { k: 'bool', gia: t.chu === 'true', vt }
    }
    if (t.chu === 'null') {
      this.i++
      return { k: 'null', vt }
    }
    if (t.chu === 'this') {
      this.i++
      return { k: 'this', vt }
    }
    if (t.chu === 'super') {
      this.i++
      return { k: 'super', vt }
    }
    if (t.chu === 'if') {
      // `if` dùng như biểu thức — bắt buộc phải có `else`.
      this.buoc('if', '')
      this.buoc('(', 'Dieu kien cua if phai nam trong ngoac tron.')
      this.boXuongDong()
      const dieuKien = this.bieuThuc()
      this.buoc(')', 'Dieu kien cua if phai dong bang ngoac tron.')
      const dung = this.nhanhBieuThuc()
      this.boXuongDong()
      if (!this.an('else')) {
        throw new LoiKotlin(
          'Dung "if" lam GIA TRI thi bat buoc phai co "else", vi khong co else thi truong hop kia khong ra gia tri nao.',
          vt.dong,
        )
      }
      const sai = this.nhanhBieuThuc()
      return { k: 'ifBt', dieuKien, dung, sai, vt }
    }
    if (t.chu === 'when') {
      const w = this.whenChung()
      return {
        k: 'whenBt',
        ...(w.chuDe !== undefined ? { chuDe: w.chuDe } : {}),
        nhanh: w.nhanh,
        ...(w.macDinh !== undefined ? { macDinh: w.macDinh } : {}),
        vt,
      }
    }
    if (t.chu === 'try') {
      const tr = this.tryChung()
      return {
        k: 'tryBt',
        than: tr.than,
        bat: tr.bat,
        ...(tr.cuoiCung !== undefined ? { cuoiCung: tr.cuoiCung } : {}),
        vt,
      }
    }
    if (t.chu === 'throw') {
      // `?: throw ...` là mẫu rất phổ biến của Kotlin — cho phép throw ở vị trí biểu thức.
      this.i++
      this.boXuongDong()
      const gia = this.bieuThuc()
      return { k: 'goi', ham: { k: 'ten', ten: '__nem', vt }, thamSo: [{ gia }], vt }
    }
    if (this.la('{')) return this.lambda()
    if (this.la('(')) {
      this.i++
      this.boXuongDong()
      const bt = this.bieuThuc()
      this.buoc(')', 'Ngoac tron mo ra thi phai dong lai.')
      return bt
    }
    if (this.la('[')) {
      throw new LoiKotlin(
        'Kotlin khong tao danh sach bang ngoac vuong. Dung listOf(1, 2, 3) hoac mutableListOf().',
        vt.dong,
      )
    }
    if (t.loai === 'ten') {
      this.i++
      return { k: 'ten', ten: t.chu, vt }
    }

    throw new LoiKotlin(
      `Khong hieu "${t.chu || 'het bai'}" o vi tri nay. Kiem lai xem co thieu toan tu hoac dau ngoac khong.`,
      t.dong,
    )
  }

  /** Nhánh của `if` dùng làm biểu thức: khối `{ … }` lấy giá trị lệnh cuối, hoặc một biểu thức. */
  private nhanhBieuThuc(): BieuThuc {
    this.boXuongDong()
    if (this.la('{')) {
      const vt = this.vt()
      const than = this.khoi()
      // Bọc thành lambda gọi ngay — interpreter lấy giá trị lệnh cuối.
      return { k: 'goi', ham: { k: 'lambda', thamSo: [], than, vt }, thamSo: [], vt }
    }
    return this.bieuThuc()
  }

  /** Phân tích một biểu thức đứng riêng (dùng cho mảnh nội suy trong chuỗi). */
  bieuThucDon(dong: number): BieuThuc {
    try {
      const bt = this.bieuThuc()
      return bt
    } catch (e) {
      if (e instanceof LoiKotlin) throw new LoiKotlin(e.message, dong)
      throw e
    }
  }
}

export function phanTich(src: string): Lenh[] {
  return new BoPhanTich(src).phanTich()
}
