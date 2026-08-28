// swiftSim/interpreter — CHẠY cây cú pháp Swift rút gọn (PR-M3).
//
// QUYẾT ĐỊNH THIẾT KẾ QUAN TRỌNG NHẤT: Optional được BỌC TƯỜNG MINH.
// Một giá trị `String?` có mặt là `{k:'tuyChon'}` bọc quanh chuỗi, không phải chuỗi trần. Nhờ
// vậy bộ chạy làm được đúng ba việc mà người mới học Swift vấp nhiều nhất:
//   · `print(ten)` với `ten: String?` in ra `Optional("Lan")` — y như Swift thật, chứ không im
//     lặng in "Lan" rồi để học viên ngã ngửa khi gặp trình biên dịch thật;
//   · dùng thẳng một Optional vào phép tính thì báo lỗi ĐÚNG CHỖ, kèm ba cách mở gói;
//   · `!` mở gói một `nil` thì dừng với thông điệp nói rõ vì sao — đúng cái crash kinh điển.
// Đây là trụ cột "Optional" mà hiến chương M §7 xếp vào track Swift, nên nó phải đúng chứ
// không được xấp xỉ.
//
// KIỂM KIỂU: bộ chạy kiểm LÚC CHẠY (dynamic), Swift thật kiểm LÚC BIÊN DỊCH. Khác biệt này
// được khai thẳng trong `docs/` và trong bài học — xem KHAC_BIET ở index.ts.
import { LoiSwift } from './lexer.js'
import { phanTich } from './parser.js'
import type { BieuThuc, DieuKien, KhaiBaoHam, KhaiBaoKieu, Lenh, ThamSo } from './ast.js'

// ───────────────────────────── Giá trị lúc chạy ─────────────────────────────

export type Gia =
  | { k: 'int'; v: number }
  | { k: 'double'; v: number }
  | { k: 'chuoi'; v: string }
  | { k: 'bool'; v: boolean }
  /** Optional RỖNG (`nil`). */
  | { k: 'khong' }
  /** Optional CÓ giá trị — bọc tường minh, xem ghi chú đầu file. */
  | { k: 'tuyChon'; v: Gia }
  | { k: 'mang'; v: Gia[] }
  | { k: 'tuDien'; v: Map<string, { khoa: Gia; gia: Gia }> }
  | { k: 'khoang'; tu: number; den: number; kin: boolean }
  | { k: 'thucThe'; kieu: string; laLop: boolean; truong: Map<string, Gia> }
  | { k: 'ca'; kieu: string; ten: string; kem: Gia[] }
  | {
      k: 'ham'
      ten: string
      thamSo: ThamSo[]
      than: Lenh[]
      moi: MoiTruong
      tuThan?: Gia
      kieuTra?: string
    }
  | { k: 'kieu'; ten: string }

/** Tín hiệu điều khiển luồng — dùng ngoại lệ cho gọn, đúng khuôn interpreter cây. */
class TinHieuTra extends Error {
  constructor(readonly gia: Gia) {
    super('return')
  }
}
class TinHieuNgat extends Error {}
class TinHieuTiep extends Error {}
export class LoiNem extends Error {
  constructor(
    readonly gia: Gia,
    readonly dong: number,
  ) {
    super('throw')
  }
}

interface O {
  gia: Gia
  hangSo: boolean
  kieu?: string
}

export class MoiTruong {
  private bang = new Map<string, O>()
  constructor(readonly cha?: MoiTruong) {}

  khai(ten: string, o: O): void {
    this.bang.set(ten, o)
  }

  tim(ten: string): O | undefined {
    return this.bang.get(ten) ?? this.cha?.tim(ten)
  }

  co(ten: string): boolean {
    return this.bang.has(ten) || (this.cha?.co(ten) ?? false)
  }
}

// ───────────────────────────── Tiện ích giá trị ─────────────────────────────

const KHONG: Gia = { k: 'khong' }

/** Sao chép SÂU cho ngữ nghĩa GIÁ TRỊ (struct, mảng, từ điển). Lớp thì KHÔNG chép. */
export function chepGia(g: Gia): Gia {
  if (g.k === 'mang') return { k: 'mang', v: g.v.map(chepGia) }
  if (g.k === 'tuDien') {
    const v = new Map<string, { khoa: Gia; gia: Gia }>()
    for (const [k, c] of g.v) v.set(k, { khoa: c.khoa, gia: chepGia(c.gia) })
    return { k: 'tuDien', v }
  }
  if (g.k === 'tuyChon') return { k: 'tuyChon', v: chepGia(g.v) }
  if (g.k === 'thucThe') {
    // ĐÂY là khác biệt struct/class — trụ cột đầu tiên của track Swift (hiến chương §7).
    if (g.laLop) return g
    const truong = new Map<string, Gia>()
    for (const [k, v] of g.truong) truong.set(k, chepGia(v))
    return { k: 'thucThe', kieu: g.kieu, laLop: false, truong }
  }
  if (g.k === 'ca') return { k: 'ca', kieu: g.kieu, ten: g.ten, kem: g.kem.map(chepGia) }
  return g
}

/** Tên kiểu để in trong thông báo lỗi — dùng đúng chữ Swift để học viên tra được. */
export function tenKieuCua(g: Gia): string {
  switch (g.k) {
    case 'int':
      return 'Int'
    case 'double':
      return 'Double'
    case 'chuoi':
      return 'String'
    case 'bool':
      return 'Bool'
    case 'khong':
      return 'nil'
    case 'tuyChon':
      return `${tenKieuCua(g.v)}?`
    case 'mang':
      return `[${g.v[0] ? tenKieuCua(g.v[0]) : 'Element'}]`
    case 'tuDien':
      return 'Dictionary'
    case 'khoang':
      return 'Range'
    case 'thucThe':
      return g.kieu
    case 'ca':
      return g.kieu
    case 'ham':
      return 'Function'
    case 'kieu':
      return g.ten
  }
}

/** In một giá trị đúng như `print` của Swift — kể cả `Optional(…)`, đây là chỗ hay bị bất ngờ. */
export function inGia(g: Gia): string {
  switch (g.k) {
    case 'int':
      return String(g.v)
    case 'double':
      // Swift in 3.0 chứ không phải 3 — giữ đúng để học viên nhận ra Double khác Int.
      return Number.isInteger(g.v) ? `${g.v}.0` : String(g.v)
    case 'chuoi':
      return g.v
    case 'bool':
      return g.v ? 'true' : 'false'
    case 'khong':
      return 'nil'
    case 'tuyChon':
      return `Optional(${inTrongCauTruc(g.v)})`
    case 'mang':
      return `[${g.v.map(inTrongCauTruc).join(', ')}]`
    case 'tuDien': {
      // Swift KHÔNG bảo đảm thứ tự từ điển; bộ chạy sắp theo khoá để bài học tất định.
      const cap = [...g.v.values()].sort((a, b) => (inGia(a.khoa) < inGia(b.khoa) ? -1 : 1))
      return `[${cap.map((c) => `${inTrongCauTruc(c.khoa)}: ${inTrongCauTruc(c.gia)}`).join(', ')}]`
    }
    case 'khoang':
      return `${g.tu}${g.kin ? '...' : '..<'}${g.den}`
    case 'thucThe': {
      const truong = [...g.truong.entries()].map(([k, v]) => `${k}: ${inTrongCauTruc(v)}`)
      return `${g.kieu}(${truong.join(', ')})`
    }
    case 'ca':
      return g.kem.length ? `${g.ten}(${g.kem.map(inTrongCauTruc).join(', ')})` : g.ten
    case 'ham':
      return '(Function)'
    case 'kieu':
      return g.ten
  }
}

/** Bên trong mảng/Optional/struct, Swift in chuỗi KÈM dấu nháy. */
function inTrongCauTruc(g: Gia): string {
  return g.k === 'chuoi' ? `"${g.v}"` : inGia(g)
}

function laThat(g: Gia, dong: number): boolean {
  if (g.k === 'bool') return g.v
  if (g.k === 'tuyChon' || g.k === 'khong') {
    throw new LoiSwift(
      'Dieu kien nay la mot Optional chu khong phai Bool. Swift bat mo goi truoc: dung "if let", "!" hoac "?? false".',
      dong,
    )
  }
  throw new LoiSwift(
    `Dieu kien phai la Bool, dang la ${tenKieuCua(g)}. Swift khong coi so khac 0 la "dung" nhu mot so ngon ngu khac.`,
    dong,
  )
}

function bangNhau(a: Gia, b: Gia): boolean {
  const x = a.k === 'tuyChon' ? a.v : a
  const y = b.k === 'tuyChon' ? b.v : b
  if (x.k === 'khong' || y.k === 'khong') return x.k === 'khong' && y.k === 'khong'
  if (x.k === 'ca' && y.k === 'ca') {
    return (
      x.kieu === y.kieu &&
      x.ten === y.ten &&
      x.kem.length === y.kem.length &&
      x.kem.every((v, i) => bangNhau(v, y.kem[i]!))
    )
  }
  if (x.k === 'mang' && y.k === 'mang') {
    return x.v.length === y.v.length && x.v.every((v, i) => bangNhau(v, y.v[i]!))
  }
  if (x.k === 'thucThe' && y.k === 'thucThe') {
    if (x.kieu !== y.kieu) return false
    if (x.laLop) return x === y
    for (const [k, v] of x.truong) if (!bangNhau(v, y.truong.get(k) ?? KHONG)) return false
    return true
  }
  if ((x.k === 'int' || x.k === 'double') && (y.k === 'int' || y.k === 'double')) return x.v === y.v
  if (x.k === 'chuoi' && y.k === 'chuoi') return x.v === y.v
  if (x.k === 'bool' && y.k === 'bool') return x.v === y.v
  return false
}

/** Khoá từ điển dạng chuỗi — đủ cho String/Int/enum, là những kiểu bài học dùng. */
function khoaTuDien(g: Gia, dong: number): string {
  const x = g.k === 'tuyChon' ? g.v : g
  if (x.k === 'chuoi') return `s:${x.v}`
  if (x.k === 'int') return `i:${x.v}`
  if (x.k === 'ca') return `e:${x.kieu}.${x.ten}`
  throw new LoiSwift(
    `Kieu ${tenKieuCua(g)} khong dung lam khoa tu dien duoc trong bo chay nay (dung String, Int hoac enum).`,
    dong,
  )
}

// ───────────────────────────── Bộ thông dịch ─────────────────────────────

export interface TuyChonChay {
  /** Trần số bước — chặn vòng lặp vô hạn treo trình duyệt. */
  tranBuoc?: number
  /** Trần độ dài output. */
  tranOutput?: number
}

export class BoChay {
  private toanCuc = new MoiTruong()
  private kieu = new Map<string, KhaiBaoKieu>()
  private ra: string[] = []
  private daiRa = 0
  private buoc = 0
  private tranBuoc: number
  private tranOutput: number
  private tranDat = false

  constructor(tc: TuyChonChay = {}) {
    this.tranBuoc = tc.tranBuoc ?? 200000
    this.tranOutput = tc.tranOutput ?? 200000
  }

  chay(src: string): string {
    const ct = phanTich(src)
    // Khai báo kiểu và hàm được nạp TRƯỚC — Swift cho phép gọi hàm khai sau chỗ dùng.
    for (const l of ct) {
      if (l.k === 'kieu') this.napKieu(l.kieu)
      else if (l.k === 'ham') this.napHam(l.ham, this.toanCuc)
    }
    for (const l of ct) {
      if (l.k === 'kieu' || l.k === 'ham') continue
      this.lenh(l, this.toanCuc)
    }
    return this.ra.join('')
  }

  private in(s: string): void {
    if (this.tranDat) return
    if (this.daiRa + s.length > this.tranOutput) {
      this.tranDat = true
      this.ra.push('\n[GIA LAP] Output qua dai — bo chay dung in de trinh duyet khong bi treo.\n')
      return
    }
    this.daiRa += s.length
    this.ra.push(s)
  }

  private demBuoc(dong: number): void {
    this.buoc += 1
    if (this.buoc > this.tranBuoc) {
      throw new LoiSwift(
        `Chuong trinh chay qua ${this.tranBuoc} buoc — bo chay dung lai de trinh duyet khong bi treo. Kiem tra lai vong lap: dieu kien dung co bao gio thanh false khong?`,
        dong,
      )
    }
  }

  private napKieu(kb: KhaiBaoKieu): void {
    if (this.kieu.has(kb.ten)) {
      throw new LoiSwift(`Kieu "${kb.ten}" da duoc khai bao roi.`, kb.vt.dong)
    }
    this.kieu.set(kb.ten, kb)
    this.toanCuc.khai(kb.ten, { gia: { k: 'kieu', ten: kb.ten }, hangSo: true })
    if (kb.loai !== 'protocol') this.kiemTuanThu(kb)
  }

  /** Protocol chỉ có nghĩa nếu việc thiếu hàm bị BẮT — nếu không nó chỉ là chữ trang trí. */
  private kiemTuanThu(kb: KhaiBaoKieu): void {
    for (const ten of kb.keThua) {
      const p = this.kieu.get(ten.replace(/\?$/, ''))
      if (!p || p.loai !== 'protocol') continue
      for (const yc of p.yeuCau) {
        const co = kb.ham.some((h) => h.ten === yc.ten && h.thamSo.length === yc.thamSo.length)
        if (!co) {
          throw new LoiSwift(
            `${kb.loai} ${kb.ten} khai la tuan theo protocol ${p.ten} nhung THIEU ham "${yc.ten}". Protocol la loi hua: khai roi thi phai co du.`,
            kb.vt.dong,
          )
        }
      }
      for (const tt of p.thuocTinh) {
        const co = kb.thuocTinh.some((x) => x.ten === tt.ten)
        if (!co) {
          throw new LoiSwift(
            `${kb.loai} ${kb.ten} khai la tuan theo protocol ${p.ten} nhung THIEU thuoc tinh "${tt.ten}".`,
            kb.vt.dong,
          )
        }
      }
    }
  }

  private napHam(h: KhaiBaoHam, moi: MoiTruong): void {
    moi.khai(h.ten, {
      gia: {
        k: 'ham',
        ten: h.ten,
        thamSo: h.thamSo,
        than: h.than,
        moi,
        ...(h.kieuTra !== undefined ? { kieuTra: h.kieuTra } : {}),
      },
      hangSo: true,
    })
  }

  // ─────────────── câu lệnh ───────────────

  private khoi(ds: Lenh[], moi: MoiTruong): void {
    for (const l of ds) this.lenh(l, moi)
  }

  private lenh(l: Lenh, moi: MoiTruong): void {
    this.demBuoc(l.vt.dong)
    switch (l.k) {
      case 'khaiBao': {
        // Ghi chú: Swift cho phép CHE biến ở scope trong, nên khai trùng tên không phải lỗi ở
        // đây — bộ chạy không kiểm gì thêm trước khi khai.
        const tho = l.gia ? this.bieuThuc(l.gia, moi) : KHONG
        const gia = this.bocTheoKieu(chepGia(tho), l.kieu)
        this.kiemKieuKhai(gia, l.kieu, l.ten, l.vt.dong)
        moi.khai(l.ten, {
          gia,
          hangSo: l.hangSo,
          ...(l.kieu !== undefined ? { kieu: l.kieu } : {}),
        })
        return
      }
      case 'gan':
        this.gan(l.dich, l.toan, l.gia, moi, l.vt.dong)
        return
      case 'bieuThuc':
        this.bieuThuc(l.bt, moi)
        return
      case 'if': {
        const con = new MoiTruong(moi)
        if (this.dieuKienDs(l.dieuKien, con, l.vt.dong)) this.khoi(l.than, con)
        else if (l.nguoc) this.khoi(l.nguoc, new MoiTruong(moi))
        return
      }
      case 'guard': {
        // `guard` mở gói vào CHÍNH scope hiện tại — đó là điểm khác `if let` và là lý do người
        // ta thích nó: giá trị dùng được cho tới hết hàm.
        if (this.dieuKienDs(l.dieuKien, moi, l.vt.dong)) return
        this.khoi(l.nguoc, new MoiTruong(moi))
        throw new LoiSwift(
          'Nhanh "else" cua guard phai thoat khoi pham vi (return, break, continue hoac throw).',
          l.vt.dong,
        )
      }
      case 'while':
        for (;;) {
          this.demBuoc(l.vt.dong)
          if (!laThat(this.moGoiNeuCan(this.bieuThuc(l.dieuKien, moi)), l.vt.dong)) break
          try {
            this.khoi(l.than, new MoiTruong(moi))
          } catch (e) {
            if (e instanceof TinHieuNgat) break
            if (!(e instanceof TinHieuTiep)) throw e
          }
        }
        return
      case 'repeat':
        for (;;) {
          this.demBuoc(l.vt.dong)
          try {
            this.khoi(l.than, new MoiTruong(moi))
          } catch (e) {
            if (e instanceof TinHieuNgat) break
            if (!(e instanceof TinHieuTiep)) throw e
          }
          if (!laThat(this.moGoiNeuCan(this.bieuThuc(l.dieuKien, moi)), l.vt.dong)) break
        }
        return
      case 'for': {
        const nguon = this.bieuThuc(l.nguon, moi)
        for (const pt of this.dayLap(nguon, l.vt.dong)) {
          this.demBuoc(l.vt.dong)
          const con = new MoiTruong(moi)
          if (l.bien.startsWith('(')) {
            // `for (khoa, gia) in tuDien` — dayLap() tra ve cap dang mang hai phan tu.
            const ten = l.bien.slice(1, -1).split(',')
            const cap = pt.k === 'mang' ? pt.v : [pt]
            ten.forEach((n, i) => {
              if (n !== '_') con.khai(n, { gia: cap[i] ?? KHONG, hangSo: true })
            })
          } else if (l.bien !== '_') {
            con.khai(l.bien, { gia: pt, hangSo: true })
          }
          try {
            this.khoi(l.than, con)
          } catch (e) {
            if (e instanceof TinHieuNgat) break
            if (!(e instanceof TinHieuTiep)) throw e
          }
        }
        return
      }
      case 'switch':
        this.reNhieuNhanh(l, moi)
        return
      case 'return':
        throw new TinHieuTra(l.gia ? this.bieuThuc(l.gia, moi) : KHONG)
      case 'break':
        throw new TinHieuNgat()
      case 'continue':
        throw new TinHieuTiep()
      case 'throw':
        throw new LoiNem(this.bieuThuc(l.gia, moi), l.vt.dong)
      case 'do':
        this.thuVaBat(l, moi)
        return
      case 'ham':
        this.napHam(l.ham, moi)
        return
      case 'kieu':
        if (!this.kieu.has(l.kieu.ten)) this.napKieu(l.kieu)
        return
    }
  }

  private dieuKienDs(ds: DieuKien[], moi: MoiTruong, dong: number): boolean {
    for (const d of ds) {
      if (d.k === 'bt') {
        if (!laThat(this.bieuThuc(d.bt, moi), dong)) return false
        continue
      }
      const g = this.bieuThuc(d.gia, moi)
      if (g.k === 'khong') return false
      moi.khai(d.ten, { gia: g.k === 'tuyChon' ? g.v : g, hangSo: d.hangSo })
    }
    return true
  }

  private dayLap(g: Gia, dong: number): Gia[] {
    if (g.k === 'khoang') {
      const ra: Gia[] = []
      const het = g.kin ? g.den : g.den - 1
      if (het - g.tu > this.tranBuoc) {
        throw new LoiSwift(
          'Khoang lap qua lon — bo chay dung lai de trinh duyet khong bi treo.',
          dong,
        )
      }
      for (let i = g.tu; i <= het; i += 1) ra.push({ k: 'int', v: i })
      return ra
    }
    if (g.k === 'mang') return g.v
    if (g.k === 'chuoi') return [...g.v].map((c) => ({ k: 'chuoi', v: c }))
    if (g.k === 'tuDien') {
      // Sắp theo khoá cho tất định — Swift thật KHÔNG bảo đảm thứ tự, bài học không được dựa vào.
      return [...g.v.values()]
        .sort((a, b) => (inGia(a.khoa) < inGia(b.khoa) ? -1 : 1))
        .map((c) => ({ k: 'mang', v: [c.khoa, c.gia] }))
    }
    if (g.k === 'khong' || g.k === 'tuyChon') {
      throw new LoiSwift(
        'Khong lap tren mot Optional duoc. Mo goi truoc bang "if let" hoac "?? []".',
        dong,
      )
    }
    throw new LoiSwift(`Khong lap tren gia tri kieu ${tenKieuCua(g)} duoc.`, dong)
  }

  private reNhieuNhanh(l: Extract<Lenh, { k: 'switch' }>, moi: MoiTruong): void {
    const gia = this.bieuThuc(l.gia, moi)
    for (const ca of l.ca) {
      const con = new MoiTruong(moi)
      let khop = false
      for (const m of ca.mau) {
        if (m.k === 'gia') {
          if (bangNhau(gia, this.bieuThuc(m.bt, con))) khop = true
        } else if (m.k === 'buoc') {
          con.khai(m.ten, { gia, hangSo: true })
          khop = true
        } else {
          const x = gia.k === 'tuyChon' ? gia.v : gia
          if (x.k === 'ca' && x.ten === m.ten) {
            m.buoc.forEach((ten, i) => con.khai(ten, { gia: x.kem[i] ?? KHONG, hangSo: true }))
            khop = true
          }
        }
        if (khop) break
      }
      if (!khop) continue
      if (ca.loc && !laThat(this.bieuThuc(ca.loc, con), l.vt.dong)) continue
      try {
        this.khoi(ca.than, con)
      } catch (e) {
        if (!(e instanceof TinHieuNgat)) throw e
      }
      return
    }
    if (l.macDinh) {
      try {
        this.khoi(l.macDinh, new MoiTruong(moi))
      } catch (e) {
        if (!(e instanceof TinHieuNgat)) throw e
      }
      return
    }
    // Swift đòi switch phải phủ HẾT; không có nhánh nào khớp là lỗi của người viết, không phải
    // chuyện im lặng bỏ qua.
    throw new LoiSwift(
      `Khong co "case" nao khop gia tri ${inGia(gia)}, va cung khong co "default". Switch trong Swift phai phu het moi truong hop.`,
      l.vt.dong,
    )
  }

  private thuVaBat(l: Extract<Lenh, { k: 'do' }>, moi: MoiTruong): void {
    try {
      this.khoi(l.than, new MoiTruong(moi))
    } catch (e) {
      if (!(e instanceof LoiNem)) throw e
      for (const b of l.bat) {
        const x = e.gia.k === 'tuyChon' ? e.gia.v : e.gia
        const kieuGia = x.k === 'ca' ? x.kieu : tenKieuCua(x)
        if (b.kieu !== undefined && b.kieu !== kieuGia) continue
        const con = new MoiTruong(moi)
        if (b.ten !== undefined) con.khai(b.ten, { gia: e.gia, hangSo: true })
        con.khai('error', { gia: e.gia, hangSo: true })
        this.khoi(b.than, con)
        return
      }
      throw e
    }
  }

  // ─────────────── gán ───────────────

  private gan(dich: BieuThuc, toan: string, btGia: BieuThuc, moi: MoiTruong, dong: number): void {
    const moiGia = this.bieuThuc(btGia, moi)

    if (dich.k === 'ten') {
      // `_ = f()` — chay lay tac dung phu roi bo ket qua.
      if (dich.ten === '_') return
      const o = moi.tim(dich.ten)
      if (!o) throw new LoiSwift(`Chua khai bao "${dich.ten}".`, dong)
      if (o.hangSo) {
        throw new LoiSwift(
          `"${dich.ten}" khai bang "let" nen khong doi duoc. Muon doi thi khai bang "var".`,
          dong,
        )
      }
      const tinh = toan === '=' ? moiGia : this.tinhGop(toan, o.gia, moiGia, dong)
      o.gia = this.bocTheoKieu(chepGia(tinh), o.kieu)
      this.kiemKieuKhai(o.gia, o.kieu, dich.ten, dong)
      return
    }

    if (dich.k === 'truyCap') {
      const chu = this.bieuThuc(dich.doiTuong, moi)
      const x = chu.k === 'tuyChon' ? chu.v : chu
      if (x.k !== 'thucThe') {
        throw new LoiSwift(`Khong gan duoc thuoc tinh "${dich.ten}" cho ${tenKieuCua(chu)}.`, dong)
      }
      const cu = x.truong.get(dich.ten)
      if (cu === undefined) {
        throw new LoiSwift(`Kieu ${x.kieu} khong co thuoc tinh "${dich.ten}".`, dong)
      }
      const kb = this.kieu.get(x.kieu)
      const tt = kb?.thuocTinh.find((t) => t.ten === dich.ten)
      if (tt?.hangSo && tt.than === undefined) {
        throw new LoiSwift(
          `Thuoc tinh "${dich.ten}" cua ${x.kieu} khai bang "let" nen khong doi duoc sau khi khoi tao.`,
          dong,
        )
      }
      const tinh = toan === '=' ? moiGia : this.tinhGop(toan, cu, moiGia, dong)
      x.truong.set(dich.ten, this.bocTheoKieu(chepGia(tinh), tt?.kieu))
      return
    }

    if (dich.k === 'chiSo') {
      const chu = this.bieuThuc(dich.doiTuong, moi)
      const khoa = this.bieuThuc(dich.khoa, moi)
      if (chu.k === 'mang') {
        const i = this.soNguyen(khoa, dong)
        if (i < 0 || i >= chu.v.length) {
          throw new LoiSwift(
            `Chi so ${i} nam ngoai mang (mang co ${chu.v.length} phan tu, chi so hop le tu 0 den ${chu.v.length - 1}).`,
            dong,
          )
        }
        chu.v[i] = toan === '=' ? chepGia(moiGia) : this.tinhGop(toan, chu.v[i]!, moiGia, dong)
        return
      }
      if (chu.k === 'tuDien') {
        const k = khoaTuDien(khoa, dong)
        if (toan === '=' && moiGia.k === 'khong') {
          chu.v.delete(k)
          return
        }
        const cu = chu.v.get(k)?.gia
        const tinh = toan === '=' ? moiGia : this.tinhGop(toan, cu ?? KHONG, moiGia, dong)
        chu.v.set(k, { khoa, gia: chepGia(tinh) })
        return
      }
      throw new LoiSwift(`Khong gan theo chi so cho ${tenKieuCua(chu)} duoc.`, dong)
    }

    throw new LoiSwift('Ve trai cua dau "=" phai la mot bien, thuoc tinh hoac phan tu.', dong)
  }

  private tinhGop(toan: string, cu: Gia, moi: Gia, dong: number): Gia {
    return this.nhiNguyen(toan.slice(0, 1), cu, moi, dong)
  }

  // ─────────────── biểu thức ───────────────

  bieuThuc(bt: BieuThuc, moi: MoiTruong): Gia {
    this.demBuoc(bt.vt.dong)
    switch (bt.k) {
      case 'soNguyen':
        return { k: 'int', v: bt.gia }
      case 'soThuc':
        return { k: 'double', v: bt.gia }
      case 'bool':
        return { k: 'bool', v: bt.gia }
      case 'nil':
        return KHONG
      case 'chuoi': {
        let s = ''
        for (const m of bt.manh) {
          s += m.loai === 'chu' ? (m.chu ?? '') : inGia(this.bieuThuc(m.bt!, moi))
        }
        return { k: 'chuoi', v: s }
      }
      case 'ten': {
        const o = moi.tim(bt.ten)
        if (o) return o.gia
        const sanCo = this.tenSanCo(bt.ten)
        if (sanCo) return sanCo
        throw new LoiSwift(
          `Chua khai bao "${bt.ten}". Kiem tra lai chinh ta, hoac khai truoc bang "let ${bt.ten} = …".`,
          bt.vt.dong,
        )
      }
      case 'self': {
        const o = moi.tim('self')
        if (!o)
          throw new LoiSwift(
            '"self" chi dung duoc ben trong ham cua struct/class/enum.',
            bt.vt.dong,
          )
        return o.gia
      }
      case 'mang':
        return { k: 'mang', v: bt.phanTu.map((p) => chepGia(this.bieuThuc(p, moi))) }
      case 'tuDien': {
        const v = new Map<string, { khoa: Gia; gia: Gia }>()
        for (const c of bt.cap) {
          const khoa = this.bieuThuc(c.khoa, moi)
          v.set(khoaTuDien(khoa, bt.vt.dong), { khoa, gia: chepGia(this.bieuThuc(c.gia, moi)) })
        }
        return { k: 'tuDien', v }
      }
      case 'donNguyen': {
        const g = this.moGoiNeuCan(this.bieuThuc(bt.ben, moi))
        if (bt.toan === '-') {
          if (g.k === 'int') return { k: 'int', v: -g.v }
          if (g.k === 'double') return { k: 'double', v: -g.v }
          throw new LoiSwift(`Khong doi dau gia tri kieu ${tenKieuCua(g)} duoc.`, bt.vt.dong)
        }
        return { k: 'bool', v: !laThat(g, bt.vt.dong) }
      }
      case 'nhiNguyen': {
        // `&&` và `||` phải NGẮN MẠCH: vế phải chỉ chạy khi cần.
        if (bt.toan === '&&' || bt.toan === '||') {
          const trai = laThat(this.bieuThuc(bt.trai, moi), bt.vt.dong)
          if (bt.toan === '&&' && !trai) return { k: 'bool', v: false }
          if (bt.toan === '||' && trai) return { k: 'bool', v: true }
          return { k: 'bool', v: laThat(this.bieuThuc(bt.phai, moi), bt.vt.dong) }
        }
        if (bt.toan === '??') {
          const trai = this.bieuThuc(bt.trai, moi)
          if (trai.k === 'khong') return this.bieuThuc(bt.phai, moi)
          return trai.k === 'tuyChon' ? trai.v : trai
        }
        return this.nhiNguyen(
          bt.toan,
          this.bieuThuc(bt.trai, moi),
          this.bieuThuc(bt.phai, moi),
          bt.vt.dong,
        )
      }
      case 'khoang': {
        const tu = this.soNguyen(this.bieuThuc(bt.tu, moi), bt.vt.dong)
        const den = this.soNguyen(this.bieuThuc(bt.den, moi), bt.vt.dong)
        if (bt.kin && den < tu) {
          throw new LoiSwift(
            `Khoang ${tu}...${den} khong hop le: dau khoang phai nho hon hoac bang cuoi khoang.`,
            bt.vt.dong,
          )
        }
        return { k: 'khoang', tu, den, kin: bt.kin }
      }
      case 'baNgoi':
        return laThat(this.moGoiNeuCan(this.bieuThuc(bt.dieuKien, moi)), bt.vt.dong)
          ? this.bieuThuc(bt.dung, moi)
          : this.bieuThuc(bt.sai, moi)
      case 'moBuoc': {
        const g = this.bieuThuc(bt.ben, moi)
        if (g.k === 'khong') {
          throw new LoiSwift(
            'Gia tri dang la nil ma bi mo goi bang "!" — chuong trinh dung lai. Day chinh la loi crash pho bien nhat cua nguoi moi hoc Swift. Dung "if let" hoac "??" de xu ly truong hop nil thay vi ep mo goi.',
            bt.vt.dong,
          )
        }
        return g.k === 'tuyChon' ? g.v : g
      }
      case 'thu': {
        // `try?` bien loi thanh nil; `try` de loi bay len khoi do/catch.
        if (!bt.tuyChon) return this.bieuThuc(bt.ben, moi)
        try {
          const g = this.bieuThuc(bt.ben, moi)
          return g.k === 'khong' || g.k === 'tuyChon' ? g : { k: 'tuyChon', v: g }
        } catch (e) {
          if (e instanceof LoiNem) return KHONG
          throw e
        }
      }
      case 'thanhVienNgam':
        return this.caNgam(bt.ten, bt.vt.dong)
      case 'dong':
        return {
          k: 'ham',
          ten: '(dong)',
          thamSo: bt.thamSo,
          than: bt.than,
          moi,
        }
      case 'chiSo':
        return this.layChiSo(
          this.bieuThuc(bt.doiTuong, moi),
          this.bieuThuc(bt.khoa, moi),
          bt.vt.dong,
        )
      case 'truyCap':
        return this.truyCap(bt, moi)
      case 'goi':
        return this.goi(bt, moi)
    }
  }

  private nhiNguyen(toan: string, a0: Gia, b0: Gia, dong: number): Gia {
    if (toan === '==') return { k: 'bool', v: bangNhau(a0, b0) }
    if (toan === '!=') return { k: 'bool', v: !bangNhau(a0, b0) }

    const a = this.doiHoiDaMoGoi(a0, toan, dong)
    const b = this.doiHoiDaMoGoi(b0, toan, dong)

    if (a.k === 'chuoi' && b.k === 'chuoi') {
      if (toan === '+') return { k: 'chuoi', v: a.v + b.v }
      const so = ['<', '<=', '>', '>='] as const
      if ((so as readonly string[]).includes(toan)) {
        const c = a.v < b.v ? -1 : a.v > b.v ? 1 : 0
        return { k: 'bool', v: soSanh(toan, c) }
      }
      throw new LoiSwift(`Khong dung duoc toan tu "${toan}" giua hai String.`, dong)
    }
    if (a.k === 'mang' && b.k === 'mang' && toan === '+') {
      return { k: 'mang', v: [...a.v.map(chepGia), ...b.v.map(chepGia)] }
    }
    if ((a.k === 'int' || a.k === 'double') && (b.k === 'int' || b.k === 'double')) {
      // Swift KHÔNG tự đổi Int sang Double — đây là cái bẫy số một khi tính toán, phải giữ.
      if (a.k !== b.k) {
        throw new LoiSwift(
          `Swift khong tu doi ${tenKieuCua(a)} sang ${tenKieuCua(b)}. Doi tay truoc: Double(x) hoac Int(x).`,
          dong,
        )
      }
      const laInt = a.k === 'int'
      switch (toan) {
        case '+':
          return { k: a.k, v: a.v + b.v }
        case '-':
          return { k: a.k, v: a.v - b.v }
        case '*':
          return { k: a.k, v: a.v * b.v }
        case '/':
          if (b.v === 0) {
            throw new LoiSwift(
              laInt
                ? 'Chia cho 0 — chuong trinh dung lai. Kiem tra mau so truoc khi chia.'
                : 'Chia cho 0.0.',
              dong,
            )
          }
          // Chia SỐ NGUYÊN trong Swift cắt phần thập phân: 7 / 2 = 3, không phải 3.5.
          return { k: a.k, v: laInt ? Math.trunc(a.v / b.v) : a.v / b.v }
        case '%':
          if (b.v === 0) throw new LoiSwift('Lay du cho 0 — chuong trinh dung lai.', dong)
          return { k: a.k, v: a.v % b.v }
        default: {
          const c = a.v < b.v ? -1 : a.v > b.v ? 1 : 0
          return { k: 'bool', v: soSanh(toan, c) }
        }
      }
    }
    if (a.k === 'bool' && b.k === 'bool') {
      throw new LoiSwift(`Voi Bool chi dung "&&", "||", "==", "!=" — khong dung "${toan}".`, dong)
    }
    throw new LoiSwift(
      `Khong dung duoc toan tu "${toan}" giua ${tenKieuCua(a)} va ${tenKieuCua(b)}.`,
      dong,
    )
  }

  /** Optional lọt vào phép tính là lỗi kinh điển — bắt tại chỗ và chỉ đủ ba cách sửa. */
  private doiHoiDaMoGoi(g: Gia, toan: string, dong: number): Gia {
    if (g.k === 'tuyChon' || g.k === 'khong') {
      throw new LoiSwift(
        `Gia tri ben "${toan}" la Optional (${tenKieuCua(g)}) nen chua dung truc tiep duoc. Mo goi truoc bang mot trong ba cach: "if let", "??" (gia tri thay the), hoac "!" (chac chan co).`,
        dong,
      )
    }
    return g
  }

  private soNguyen(g0: Gia, dong: number): number {
    const g = this.moGoiNeuCan(g0)
    if (g.k !== 'int') {
      throw new LoiSwift(`Cho doi mot Int nhung nhan duoc ${tenKieuCua(g0)}.`, dong)
    }
    return g.v
  }

  private moGoiNeuCan(g: Gia): Gia {
    return g.k === 'tuyChon' ? g.v : g
  }

  /** Bọc giá trị vào Optional nếu kiểu khai báo có dấu `?` — xem ghi chú đầu file. */
  private bocTheoKieu(g: Gia, kieu: string | undefined): Gia {
    if (kieu === undefined || !kieu.endsWith('?')) return g
    if (g.k === 'khong' || g.k === 'tuyChon') return g
    return { k: 'tuyChon', v: g }
  }

  /** Kiểm kiểu LÚC CHẠY: Swift thật bắt lúc biên dịch, đây là khác biệt đã khai. */
  private kiemKieuKhai(g: Gia, kieu: string | undefined, ten: string, dong: number): void {
    if (kieu === undefined) return
    const goc = kieu.replace(/\?$/, '')
    const tuyChon = kieu.endsWith('?')
    if (g.k === 'khong') {
      if (tuyChon) return
      throw new LoiSwift(
        `"${ten}" khai kieu ${kieu} nen KHONG duoc nhan nil. Muon cho phep nil thi khai la ${kieu}? (co dau hoi).`,
        dong,
      )
    }
    // Kiểu TỔNG QUÁT (`T`, `Element`…) chỉ là chỗ trống, không phải kiểu thật — không kiểm.
    const laKieuThat =
      ['Int', 'Double', 'String', 'Bool', 'Any'].includes(goc) ||
      goc.startsWith('[') ||
      goc.startsWith('(') ||
      this.kieu.has(goc)
    if (!laKieuThat) return
    const that = tenKieuCua(g.k === 'tuyChon' ? g.v : g)
    const hop =
      goc === that ||
      goc.startsWith('[') ||
      that.startsWith('[') ||
      this.kieu.has(goc) ||
      goc === 'Any' ||
      that === 'Function'
    if (!hop) {
      throw new LoiSwift(
        `"${ten}" khai kieu ${kieu} nhung gia tri lai la ${that}. Swift kiem kieu rat chat: doi tay bang ${goc}(…) neu that su muon doi.`,
        dong,
      )
    }
  }

  private layChiSo(chu0: Gia, khoa: Gia, dong: number): Gia {
    const chu = this.moGoiNeuCan(chu0)
    if (chu.k === 'mang') {
      const i = this.soNguyen(khoa, dong)
      const pt = chu.v[i]
      if (pt === undefined) {
        throw new LoiSwift(
          `Chi so ${i} nam ngoai mang (mang co ${chu.v.length} phan tu${chu.v.length ? `, chi so hop le tu 0 den ${chu.v.length - 1}` : ''}). Swift dung han chuong trinh khi vuot mang, khong tra ve nil.`,
          dong,
        )
      }
      return pt
    }
    if (chu.k === 'tuDien') {
      // Tra từ điển LUÔN trả Optional — vì khoá có thể không tồn tại. Đây là điểm học viên hay
      // quên, và là lý do `dict["x"]` không dùng thẳng được.
      const c = chu.v.get(khoaTuDien(khoa, dong))
      return c === undefined ? KHONG : { k: 'tuyChon', v: c.gia }
    }
    if (chu.k === 'chuoi') {
      throw new LoiSwift(
        'Swift KHONG cho lay ky tu bang chi so so (chuoi[0]). Dung Array(chuoi)[0] hoac chuoi.first.',
        dong,
      )
    }
    throw new LoiSwift(`Khong lay phan tu theo chi so tren ${tenKieuCua(chu0)} duoc.`, dong)
  }

  private caNgam(ten: string, dong: number): Gia {
    for (const kb of this.kieu.values()) {
      if (kb.loai !== 'enum') continue
      const ca = kb.ca.find((c) => c.ten === ten)
      if (ca) return { k: 'ca', kieu: kb.ten, ten, kem: [] }
    }
    throw new LoiSwift(`Khong enum nao co truong hop ".${ten}".`, dong)
  }

  private truyCap(bt: Extract<BieuThuc, { k: 'truyCap' }>, moi: MoiTruong): Gia {
    const chu = this.bieuThuc(bt.doiTuong, moi)
    // Chuỗi tuỳ chọn `?.`: gặp nil thì cả biểu thức thành nil, không nổ.
    if (chu.k === 'khong') {
      if (bt.tuyChon) return KHONG
      throw new LoiSwift(
        `Gia tri dang la nil nen khong lay duoc "${bt.ten}". Dung "?." de bo qua khi nil, hoac "if let" de xu ly.`,
        bt.vt.dong,
      )
    }
    const x = this.moGoiNeuCan(chu)
    if (x.k === 'kieu') {
      const kb = this.kieu.get(x.ten)
      const ca = kb?.ca.find((c) => c.ten === bt.ten)
      if (ca) return { k: 'ca', kieu: x.ten, ten: bt.ten, kem: [] }
      const h = kb?.ham.find((f) => f.ten === bt.ten && f.tinh)
      if (h) return { k: 'ham', ten: h.ten, thamSo: h.thamSo, than: h.than, moi: this.toanCuc }
      const tt = kb?.thuocTinh.find((t) => t.ten === bt.ten && t.tinh)
      if (tt?.khoiTao) return this.bieuThuc(tt.khoiTao, this.toanCuc)
      throw new LoiSwift(`Kieu ${x.ten} khong co thanh vien tinh "${bt.ten}".`, bt.vt.dong)
    }
    // Chuỗi tuỳ chọn `a?.ten` LUÔN cho ra Optional — vì cả chuỗi có thể đứt giữa chừng. Đây là
    // điều người mới hay quên: `a?.ten` không phải String mà là String?.
    const bocChuoi = (g: Gia): Gia =>
      bt.tuyChon && g.k !== 'khong' && g.k !== 'tuyChon' ? { k: 'tuyChon', v: g } : g

    const sanCo = this.thuocTinhSanCo(x, bt.ten)
    if (sanCo) return bocChuoi(sanCo)
    if (x.k === 'thucThe') {
      const truong = x.truong.get(bt.ten)
      if (truong !== undefined) return bocChuoi(truong)
      const kb = this.kieu.get(x.kieu)
      const tt = kb?.thuocTinh.find((t) => t.ten === bt.ten && t.than)
      if (tt?.than) {
        const con = new MoiTruong(this.toanCuc)
        con.khai('self', { gia: x, hangSo: true })
        for (const [k, v] of x.truong) con.khai(k, { gia: v, hangSo: true })
        // Báo lỗi ở dòng KHAI BÁO thuộc tính, không phải dòng gọi — người sửa cần tới đúng đó.
        return bocChuoi(this.thanTraGia(tt.than, con, tt.vt.dong))
      }
      const h = this.timHam(x.kieu, bt.ten)
      if (h) {
        return {
          k: 'ham',
          ten: h.ten,
          thamSo: h.thamSo,
          than: h.than,
          moi: this.toanCuc,
          tuThan: x,
          ...(h.kieuTra !== undefined ? { kieuTra: h.kieuTra } : {}),
        }
      }
      throw new LoiSwift(`Kieu ${x.kieu} khong co thuoc tinh hay ham ten "${bt.ten}".`, bt.vt.dong)
    }
    if (x.k === 'ca') {
      if (bt.ten === 'rawValue') {
        const kb = this.kieu.get(x.kieu)
        const ca = kb?.ca.find((c) => c.ten === x.ten)
        if (ca?.giaTriTho) return this.bieuThuc(ca.giaTriTho, this.toanCuc)
        throw new LoiSwift(`Enum ${x.kieu} khong co gia tri tho (raw value).`, bt.vt.dong)
      }
      const h = this.timHam(x.kieu, bt.ten)
      if (h) {
        return {
          k: 'ham',
          ten: h.ten,
          thamSo: h.thamSo,
          than: h.than,
          moi: this.toanCuc,
          tuThan: x,
        }
      }
    }
    throw new LoiSwift(`${tenKieuCua(x)} khong co thanh vien ten "${bt.ten}".`, bt.vt.dong)
  }

  private timHam(tenKieu: string, ten: string): KhaiBaoHam | undefined {
    let kb = this.kieu.get(tenKieu)
    const daXet = new Set<string>()
    while (kb && !daXet.has(kb.ten)) {
      daXet.add(kb.ten)
      const h = kb.ham.find((f) => f.ten === ten)
      if (h) return h
      // Kế thừa lớp: tìm tiếp lên cha.
      const cha = kb.keThua.map((t) => this.kieu.get(t)).find((k) => k && k.loai !== 'protocol')
      kb = cha
    }
    return undefined
  }

  private thanTraGia(than: Lenh[], moi: MoiTruong, dong: number): Gia {
    try {
      this.khoi(than, moi)
    } catch (e) {
      if (e instanceof TinHieuTra) return e.gia
      throw e
    }
    throw new LoiSwift('Thieu "return" — ham/thuoc tinh nay phai tra ve mot gia tri.', dong)
  }

  // ─────────────── gọi hàm ───────────────

  private goi(bt: Extract<BieuThuc, { k: 'goi' }>, moi: MoiTruong): Gia {
    const dong = bt.vt.dong
    const doiSo = bt.thamSo.map((t) => ({
      ...(t.nhan !== undefined ? { nhan: t.nhan } : {}),
      gia: this.bieuThuc(t.gia, moi),
    }))

    // Hàm dựng sẵn (print, Int(), String()…) và khởi tạo kiểu.
    if (bt.ham.k === 'ten') {
      const dungSan = this.goiDungSan(bt.ham.ten, doiSo, dong)
      if (dungSan) return dungSan.gia
      const kb = this.kieu.get(bt.ham.ten)
      if (kb) return this.khoiTao(kb, doiSo, dong)
    }
    // Phương thức của giá trị dựng sẵn: "abc".uppercased(), mang.append(…)
    if (bt.ham.k === 'truyCap') {
      const tenThanhVien = bt.ham.ten
      const chu = this.bieuThuc(bt.ham.doiTuong, moi)
      if (chu.k === 'khong' && bt.ham.tuyChon) return KHONG
      const pt = this.phuongThucSanCo(chu, bt.ham.ten, doiSo, dong)
      if (pt) return pt.gia
      // Enum có giá trị kèm theo: `.diem(3, 4)` — gọi chính "tên trường hợp".
      const x = this.moGoiNeuCan(chu)
      if (x.k === 'kieu') {
        const kb = this.kieu.get(x.ten)
        const ca = kb?.ca.find((c) => c.ten === tenThanhVien)
        if (ca) return { k: 'ca', kieu: x.ten, ten: ca.ten, kem: doiSo.map((d) => chepGia(d.gia)) }
      }
    }
    if (bt.ham.k === 'thanhVienNgam') {
      const tenCa = bt.ham.ten
      for (const kb of this.kieu.values()) {
        if (kb.loai !== 'enum') continue
        const ca = kb.ca.find((c) => c.ten === tenCa)
        if (ca) return { k: 'ca', kieu: kb.ten, ten: ca.ten, kem: doiSo.map((d) => chepGia(d.gia)) }
      }
    }

    const ham = this.bieuThuc(bt.ham, moi)
    if (ham.k !== 'ham') {
      throw new LoiSwift(`${tenKieuCua(ham)} khong phai la ham nen khong goi duoc.`, dong)
    }
    return this.chayHam(ham, doiSo, dong)
  }

  chayHam(
    ham: Extract<Gia, { k: 'ham' }>,
    doiSo: { nhan?: string; gia: Gia }[],
    dong: number,
  ): Gia {
    const con = new MoiTruong(ham.moi)
    if (ham.tuThan) con.khai('self', { gia: ham.tuThan, hangSo: false })
    // Trong thân hàm của một kiểu, tên thuộc tính dùng trực tiếp được (`n += 1`). Bản sao cục
    // bộ này phải ghi ngược lại thực thể lúc xong — nhưng CHỈ khi nó thật sự đổi, nếu không
    // `self.x = …` (sửa thẳng thực thể) sẽ bị bản sao cũ đè lên. Đó là lý do có `chupVao`.
    const chupVao = new Map<string, Gia>()
    if (ham.tuThan?.k === 'thucThe') {
      for (const [k, v] of ham.tuThan.truong) {
        con.khai(k, { gia: v, hangSo: false })
        chupVao.set(k, v)
      }
    }

    // Đóng dùng `$0`, `$1` khi không khai tham số — khuôn quen thuộc của map/filter.
    if (ham.thamSo.length === 0 && doiSo.length > 0) {
      doiSo.forEach((d, i) => con.khai(`$${i}`, { gia: d.gia, hangSo: true }))
    }

    ham.thamSo.forEach((ts, i) => {
      const d = doiSo[i]
      if (d === undefined) {
        if (ts.macDinh) {
          con.khai(ts.ten, {
            gia: this.bieuThuc(ts.macDinh, con),
            hangSo: true,
            ...(ts.kieu !== undefined ? { kieu: ts.kieu } : {}),
          })
          return
        }
        throw new LoiSwift(
          `Ham "${ham.ten}" thieu doi so "${ts.ten}". Goi dung dang: ${ham.ten}(${ham.thamSo.map((t) => `${t.nhan === '_' ? '' : `${t.nhan ?? t.ten}: `}…`).join(', ')})`,
          dong,
        )
      }
      // NHÃN tham số là nét đặc trưng của Swift — gọi thiếu/sai nhãn là lỗi thật, phải nói ra.
      const nhanCan = ts.nhan === '_' ? undefined : (ts.nhan ?? ts.ten)
      if (nhanCan !== undefined && d.nhan !== nhanCan) {
        throw new LoiSwift(
          d.nhan === undefined
            ? `Doi so thu ${i + 1} cua "${ham.ten}" phai co nhan "${nhanCan}:". Swift dung nhan de doc cho ro nghia.`
            : `Doi so thu ${i + 1} cua "${ham.ten}" dang co nhan "${d.nhan}:" nhung phai la "${nhanCan}:".`,
          dong,
        )
      }
      const gia = this.bocTheoKieu(chepGia(d.gia), ts.kieu)
      this.kiemKieuKhai(gia, ts.kieu, ts.ten, dong)
      con.khai(ts.ten, { gia, hangSo: true, ...(ts.kieu !== undefined ? { kieu: ts.kieu } : {}) })
    })

    if (doiSo.length > ham.thamSo.length && ham.thamSo.length > 0) {
      throw new LoiSwift(
        `Ham "${ham.ten}" chi nhan ${ham.thamSo.length} doi so nhung duoc goi voi ${doiSo.length}.`,
        dong,
      )
    }

    let ketQua: Gia = KHONG
    try {
      // Đóng một dòng không có `return`: giá trị của biểu thức cuối CHÍNH LÀ kết quả (Swift 5.1).
      // Phải xử riêng TRƯỚC khi chạy thân, nếu không biểu thức đó bị chạy hai lần — và một
      // biểu thức có tác dụng phụ (print, append) sẽ nhân đôi âm thầm.
      const cuoi = ham.than[ham.than.length - 1]
      if (ham.than.length === 1 && cuoi?.k === 'bieuThuc') {
        ketQua = this.bieuThuc(cuoi.bt, con)
      } else {
        this.khoi(ham.than, con)
      }
    } catch (e) {
      if (!(e instanceof TinHieuTra)) throw e
      ketQua = e.gia
    }
    // Ghi lại thay đổi của `mutating func` lên chính thực thể — chỉ những thuộc tính mà bản
    // sao cục bộ đã đổi so với lúc vào (xem ghi chú ở `chupVao`).
    if (ham.tuThan?.k === 'thucThe') {
      for (const k of ham.tuThan.truong.keys()) {
        const o = con.tim(k)
        if (o && o.gia !== chupVao.get(k)) ham.tuThan.truong.set(k, o.gia)
      }
    }
    return this.bocTheoKieu(ketQua, ham.kieuTra)
  }

  private khoiTao(kb: KhaiBaoKieu, doiSo: { nhan?: string; gia: Gia }[], dong: number): Gia {
    if (kb.loai === 'protocol') {
      throw new LoiSwift(`Protocol ${kb.ten} la ban thiet ke, khong tao truc tiep duoc.`, dong)
    }
    if (kb.loai === 'enum') {
      // `MauSac(rawValue: "do")` trả Optional — có thể không khớp trường hợp nào.
      const tho = doiSo.find((d) => d.nhan === 'rawValue')
      if (tho) {
        const ca = kb.ca.find(
          (c) => c.giaTriTho && bangNhau(this.bieuThuc(c.giaTriTho, this.toanCuc), tho.gia),
        )
        return ca === undefined
          ? KHONG
          : { k: 'tuyChon', v: { k: 'ca', kieu: kb.ten, ten: ca.ten, kem: [] } }
      }
      throw new LoiSwift(`Tao gia tri enum ${kb.ten} bang dang ${kb.ten}.<truong hop>.`, dong)
    }

    const thucThe: Gia = {
      k: 'thucThe',
      kieu: kb.ten,
      laLop: kb.loai === 'class',
      truong: new Map(),
    }
    // Thuộc tính lưu trữ: lấy giá trị mặc định trước (kể cả của lớp cha).
    for (const k of this.dayKeThua(kb)) {
      for (const tt of k.thuocTinh) {
        if (tt.than || tt.tinh) continue
        thucThe.truong.set(
          tt.ten,
          tt.khoiTao
            ? this.bocTheoKieu(chepGia(this.bieuThuc(tt.khoiTao, this.toanCuc)), tt.kieu)
            : KHONG,
        )
      }
    }

    const init = this.timKhoiTao(kb)
    if (init) {
      const ham: Extract<Gia, { k: 'ham' }> = {
        k: 'ham',
        ten: `${kb.ten}.init`,
        thamSo: init.thamSo,
        than: init.than,
        moi: this.toanCuc,
        tuThan: thucThe,
      }
      this.chayHam(ham, doiSo, dong)
      return thucThe
    }

    // Không có init tự viết → khởi tạo theo THÀNH VIÊN (memberwise), nét riêng của struct Swift.
    if (kb.loai === 'class' && doiSo.length > 0) {
      throw new LoiSwift(
        `Class ${kb.ten} chua co "init" nen khong nhan doi so. Struct duoc Swift tang san init theo thanh vien, class thi KHONG — phai tu viet.`,
        dong,
      )
    }
    const luuTru = kb.thuocTinh.filter((t) => !t.than && !t.tinh)
    doiSo.forEach((d, i) => {
      const tt = luuTru[i]
      if (!tt) {
        throw new LoiSwift(
          `${kb.ten} chi co ${luuTru.length} thuoc tinh nhung duoc tao voi ${doiSo.length} doi so.`,
          dong,
        )
      }
      if (d.nhan !== undefined && d.nhan !== tt.ten) {
        throw new LoiSwift(
          `Khoi tao ${kb.ten}: doi so thu ${i + 1} phai co nhan "${tt.ten}:" (Swift tang san init theo dung thu tu thuoc tinh).`,
          dong,
        )
      }
      const gia = this.bocTheoKieu(chepGia(d.gia), tt.kieu)
      this.kiemKieuKhai(gia, tt.kieu, tt.ten, dong)
      thucThe.truong.set(tt.ten, gia)
    })
    for (const tt of luuTru) {
      if (
        thucThe.truong.get(tt.ten)?.k === 'khong' &&
        !tt.khoiTao &&
        !(tt.kieu ?? '').endsWith('?')
      ) {
        const daCho = doiSo.length > luuTru.indexOf(tt)
        if (!daCho) {
          throw new LoiSwift(
            `Thuoc tinh "${tt.ten}" cua ${kb.ten} chua co gia tri. Truyen vao luc tao: ${kb.ten}(${luuTru.map((t) => `${t.ten}: …`).join(', ')})`,
            dong,
          )
        }
      }
    }
    return thucThe
  }

  private dayKeThua(kb: KhaiBaoKieu): KhaiBaoKieu[] {
    const ra: KhaiBaoKieu[] = []
    let cur: KhaiBaoKieu | undefined = kb
    const daXet = new Set<string>()
    while (cur && !daXet.has(cur.ten)) {
      daXet.add(cur.ten)
      ra.unshift(cur)
      cur = cur.keThua.map((t) => this.kieu.get(t)).find((k) => k && k.loai !== 'protocol')
    }
    return ra
  }

  private timKhoiTao(kb: KhaiBaoKieu): KhaiBaoHam | undefined {
    for (const k of [...this.dayKeThua(kb)].reverse()) {
      if (k.khoiTao[0]) return k.khoiTao[0]
    }
    return undefined
  }

  // ─────────────── sẵn có ───────────────

  private tenSanCo(ten: string): Gia | undefined {
    if (
      ten === 'print' ||
      ten === 'Int' ||
      ten === 'String' ||
      ten === 'Double' ||
      ten === 'Bool'
    ) {
      return { k: 'kieu', ten }
    }
    return undefined
  }

  private goiDungSan(
    ten: string,
    doiSo: { nhan?: string; gia: Gia }[],
    dong: number,
  ): { gia: Gia } | undefined {
    const dau = doiSo[0]?.gia
    switch (ten) {
      case 'print': {
        const phan = doiSo.filter((d) => d.nhan === undefined).map((d) => inGia(d.gia))
        const cach = doiSo.find((d) => d.nhan === 'separator')
        const ket = doiSo.find((d) => d.nhan === 'terminator')
        const sep = cach && cach.gia.k === 'chuoi' ? cach.gia.v : ' '
        const end = ket && ket.gia.k === 'chuoi' ? ket.gia.v : '\n'
        this.in(phan.join(sep) + end)
        return { gia: KHONG }
      }
      case 'Int': {
        if (dau === undefined) return { gia: { k: 'int', v: 0 } }
        const x = this.moGoiNeuCan(dau)
        if (x.k === 'int') return { gia: x }
        if (x.k === 'double') return { gia: { k: 'int', v: Math.trunc(x.v) } }
        if (x.k === 'chuoi') {
          // Int("abc") tra ve nil — day la vi du Optional dep nhat cua Swift.
          const s = x.v.trim()
          const ok = /^[+-]?\d+$/.test(s)
          return { gia: ok ? { k: 'tuyChon', v: { k: 'int', v: Number(s) } } : KHONG }
        }
        throw new LoiSwift(`Khong doi ${tenKieuCua(dau)} sang Int duoc.`, dong)
      }
      case 'Double': {
        if (dau === undefined) return { gia: { k: 'double', v: 0 } }
        const x = this.moGoiNeuCan(dau)
        if (x.k === 'double') return { gia: x }
        if (x.k === 'int') return { gia: { k: 'double', v: x.v } }
        if (x.k === 'chuoi') {
          const s = x.v.trim()
          const ok = /^[+-]?\d+(\.\d+)?$/.test(s)
          return { gia: ok ? { k: 'tuyChon', v: { k: 'double', v: Number(s) } } : KHONG }
        }
        throw new LoiSwift(`Khong doi ${tenKieuCua(dau)} sang Double duoc.`, dong)
      }
      case 'String': {
        if (dau === undefined) return { gia: { k: 'chuoi', v: '' } }
        return { gia: { k: 'chuoi', v: inGia(dau) } }
      }
      case 'Bool': {
        if (dau === undefined) return { gia: { k: 'bool', v: false } }
        const x = this.moGoiNeuCan(dau)
        if (x.k === 'bool') return { gia: x }
        if (x.k === 'chuoi') {
          return {
            gia:
              x.v === 'true'
                ? { k: 'tuyChon', v: { k: 'bool', v: true } }
                : x.v === 'false'
                  ? { k: 'tuyChon', v: { k: 'bool', v: false } }
                  : KHONG,
          }
        }
        throw new LoiSwift(`Khong doi ${tenKieuCua(dau)} sang Bool duoc.`, dong)
      }
      case 'Array': {
        const x = dau ? this.moGoiNeuCan(dau) : undefined
        if (x?.k === 'chuoi')
          return { gia: { k: 'mang', v: [...x.v].map((c) => ({ k: 'chuoi', v: c })) } }
        if (x?.k === 'mang') return { gia: chepGia(x) }
        throw new LoiSwift('Array(…) trong bo chay nay chi doi duoc tu String hoac mang.', dong)
      }
      case 'abs': {
        const x = dau ? this.moGoiNeuCan(dau) : undefined
        if (x?.k === 'int') return { gia: { k: 'int', v: Math.abs(x.v) } }
        if (x?.k === 'double') return { gia: { k: 'double', v: Math.abs(x.v) } }
        throw new LoiSwift('abs(…) can mot so.', dong)
      }
      case 'min':
      case 'max': {
        const so = doiSo.map((d) => this.moGoiNeuCan(d.gia))
        if (so.length < 2 || so.some((s) => s.k !== 'int' && s.k !== 'double')) {
          throw new LoiSwift(`${ten}(…) can it nhat hai so.`, dong)
        }
        const v = (so as { k: 'int' | 'double'; v: number }[]).reduce((a, b) =>
          ten === 'min' ? (b.v < a.v ? b : a) : b.v > a.v ? b : a,
        )
        return { gia: v }
      }
      default:
        return undefined
    }
  }

  private thuocTinhSanCo(x: Gia, ten: string): Gia | undefined {
    if (x.k === 'chuoi') {
      if (ten === 'count') return { k: 'int', v: [...x.v].length }
      if (ten === 'isEmpty') return { k: 'bool', v: x.v.length === 0 }
      if (ten === 'first') return x.v ? { k: 'tuyChon', v: { k: 'chuoi', v: [...x.v][0]! } } : KHONG
      if (ten === 'last') {
        const m = [...x.v]
        return m.length ? { k: 'tuyChon', v: { k: 'chuoi', v: m[m.length - 1]! } } : KHONG
      }
    }
    if (x.k === 'mang') {
      if (ten === 'count') return { k: 'int', v: x.v.length }
      if (ten === 'isEmpty') return { k: 'bool', v: x.v.length === 0 }
      // first/last tra Optional — vi mang co the rong. Day la cho hay quen.
      if (ten === 'first') return x.v.length ? { k: 'tuyChon', v: x.v[0]! } : KHONG
      if (ten === 'last') return x.v.length ? { k: 'tuyChon', v: x.v[x.v.length - 1]! } : KHONG
    }
    if (x.k === 'tuDien') {
      if (ten === 'count') return { k: 'int', v: x.v.size }
      if (ten === 'isEmpty') return { k: 'bool', v: x.v.size === 0 }
      if (ten === 'keys' || ten === 'values') {
        const cap = [...x.v.values()].sort((a, b) => (inGia(a.khoa) < inGia(b.khoa) ? -1 : 1))
        return { k: 'mang', v: cap.map((c) => (ten === 'keys' ? c.khoa : c.gia)) }
      }
    }
    if (x.k === 'khoang') {
      if (ten === 'count')
        return { k: 'int', v: Math.max(0, (x.kin ? x.den : x.den - 1) - x.tu + 1) }
    }
    if (ten === 'description') return { k: 'chuoi', v: inGia(x) }
    return undefined
  }

  private phuongThucSanCo(
    chu: Gia,
    ten: string,
    doiSo: { nhan?: string; gia: Gia }[],
    dong: number,
  ): { gia: Gia } | undefined {
    const x = this.moGoiNeuCan(chu)
    const dau = doiSo[0]?.gia
    const chayDong = (g: Gia, args: Gia[]): Gia => {
      if (g.k !== 'ham') throw new LoiSwift(`"${ten}" can mot dong (closure) lam doi so.`, dong)
      return this.chayHam(
        g,
        args.map((a) => ({ gia: a })),
        dong,
      )
    }

    if (x.k === 'chuoi') {
      switch (ten) {
        case 'uppercased':
          return { gia: { k: 'chuoi', v: x.v.toUpperCase() } }
        case 'lowercased':
          return { gia: { k: 'chuoi', v: x.v.toLowerCase() } }
        case 'hasPrefix':
          return { gia: { k: 'bool', v: x.v.startsWith(this.chuoiCua(dau, ten, dong)) } }
        case 'hasSuffix':
          return { gia: { k: 'bool', v: x.v.endsWith(this.chuoiCua(dau, ten, dong)) } }
        case 'contains':
          return { gia: { k: 'bool', v: x.v.includes(this.chuoiCua(dau, ten, dong)) } }
        case 'trimmingCharacters':
          return { gia: { k: 'chuoi', v: x.v.trim() } }
        case 'replacingOccurrences': {
          const cu = doiSo.find((d) => d.nhan === 'of')?.gia
          const moiC = doiSo.find((d) => d.nhan === 'with')?.gia
          return {
            gia: {
              k: 'chuoi',
              v: x.v.split(this.chuoiCua(cu, ten, dong)).join(this.chuoiCua(moiC, ten, dong)),
            },
          }
        }
        case 'split': {
          const sep = doiSo.find((d) => d.nhan === 'separator')?.gia ?? dau
          return {
            gia: {
              k: 'mang',
              v: x.v
                .split(this.chuoiCua(sep, ten, dong))
                .filter((s) => s !== '')
                .map((s) => ({ k: 'chuoi', v: s })),
            },
          }
        }
      }
    }

    if (x.k === 'mang') {
      switch (ten) {
        case 'append':
          if (dau === undefined) throw new LoiSwift('append(…) can mot gia tri.', dong)
          x.v.push(chepGia(dau))
          return { gia: KHONG }
        case 'contains':
          if (dau?.k === 'ham') {
            return { gia: { k: 'bool', v: x.v.some((p) => laThat(chayDong(dau, [p]), dong)) } }
          }
          return { gia: { k: 'bool', v: x.v.some((p) => bangNhau(p, dau ?? KHONG)) } }
        case 'map':
          return { gia: { k: 'mang', v: x.v.map((p) => chayDong(dau ?? KHONG, [p])) } }
        case 'filter':
          return {
            gia: { k: 'mang', v: x.v.filter((p) => laThat(chayDong(dau ?? KHONG, [p]), dong)) },
          }
        case 'reduce': {
          const dongGop = doiSo[1]?.gia ?? KHONG
          return { gia: x.v.reduce((acc, p) => chayDong(dongGop, [acc, p]), dau ?? KHONG) }
        }
        case 'sorted': {
          const ban = [...x.v]
          if (dau?.k === 'ham') {
            ban.sort((a, b) => (laThat(chayDong(dau, [a, b]), dong) ? -1 : 1))
          } else {
            ban.sort((a, b) => {
              const p = this.moGoiNeuCan(a)
              const q = this.moGoiNeuCan(b)
              if ((p.k === 'int' || p.k === 'double') && (q.k === 'int' || q.k === 'double')) {
                return p.v - q.v
              }
              return inGia(p) < inGia(q) ? -1 : 1
            })
          }
          return { gia: { k: 'mang', v: ban } }
        }
        case 'reversed':
          return { gia: { k: 'mang', v: [...x.v].reverse() } }
        case 'joined': {
          const sep = doiSo.find((d) => d.nhan === 'separator')?.gia
          const s = sep === undefined ? '' : this.chuoiCua(sep, ten, dong)
          return { gia: { k: 'chuoi', v: x.v.map((p) => inGia(p)).join(s) } }
        }
        case 'removeLast': {
          const p = x.v.pop()
          if (p === undefined)
            throw new LoiSwift('removeLast() tren mang rong — chuong trinh dung lai.', dong)
          return { gia: p }
        }
        case 'insert': {
          const i = this.soNguyen(doiSo.find((d) => d.nhan === 'at')?.gia ?? KHONG, dong)
          x.v.splice(i, 0, chepGia(dau ?? KHONG))
          return { gia: KHONG }
        }
      }
    }

    if (x.k === 'tuDien') {
      if (ten === 'removeValue') {
        const khoa = doiSo.find((d) => d.nhan === 'forKey')?.gia ?? dau ?? KHONG
        const k = khoaTuDien(khoa, dong)
        const c = x.v.get(k)
        x.v.delete(k)
        return { gia: c === undefined ? KHONG : { k: 'tuyChon', v: c.gia } }
      }
    }

    if (ten === 'isMultiple') {
      const y = doiSo.find((d) => d.nhan === 'of')?.gia
      if (x.k === 'int' && y && this.moGoiNeuCan(y).k === 'int') {
        return { gia: { k: 'bool', v: x.v % (this.moGoiNeuCan(y) as { v: number }).v === 0 } }
      }
    }

    const tt = this.thuocTinhSanCo(x, ten)
    if (tt && doiSo.length === 0) return { gia: tt }
    return undefined
  }

  private chuoiCua(g: Gia | undefined, ten: string, dong: number): string {
    const x = g ? this.moGoiNeuCan(g) : undefined
    if (x?.k !== 'chuoi') throw new LoiSwift(`"${ten}" can mot String lam doi so.`, dong)
    return x.v
  }
}

function soSanh(toan: string, c: number): boolean {
  switch (toan) {
    case '<':
      return c < 0
    case '<=':
      return c <= 0
    case '>':
      return c > 0
    default:
      return c >= 0
  }
}
