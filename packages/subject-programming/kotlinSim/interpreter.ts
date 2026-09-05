// kotlinSim/interpreter — NGỮ NGHĨA của bộ chạy Kotlin rút gọn (PR-M7).
//
// ╔══════════════════════════════════════════════════════════════════════════════════════════╗
// ║ QUYẾT ĐỊNH TRỤ CỘT: theo dõi TÍNH NULL KHAI BÁO ở Ô BIẾN, không ở giá trị.                ║
// ╚══════════════════════════════════════════════════════════════════════════════════════════╝
//
// swiftSim bọc Optional tường minh được vì Swift in ra `Optional("Lan")`. Kotlin KHÔNG bọc:
// `val s: String? = "hi"; println(s)` in ra đúng `hi`. Nên không mượn được cách đó.
//
// Nhưng thứ Kotlin dạy nằm ở chỗ khác: `s.length` với `s: String?` là LỖI BIÊN DỊCH, kể cả khi
// s đang có giá trị. Nếu bộ chạy chỉ hỏi "giá trị lúc này có null không" thì `s.length` sẽ chạy
// ngon lành mỗi khi s khác null — và dạy sai thói quen cho đúng nhóm người dễ sai nhất.
//
// Nên: ô biến khai kiểu `T?` mang cờ `coTheNull`, và truy cập `.` không an toàn lên ô đó là lỗi
// NGAY, kèm ba cách sửa (`?.` · `?:` · `!!`) — tái hiện đúng thông điệp của trình biên dịch thật.
//
// HỆ QUẢ BẮT BUỘC: phải làm SMART CAST. Không có nó thì `if (s != null) { s.length }` sẽ báo lỗi
// oan trong khi Kotlin thật cho phép, mà đó lại là mẫu đầu tiên học viên gặp ở bài null safety.
// Phạm vi đã làm: nhánh `then` của `if (x != null)`, và phần còn lại của khối sau
// `if (x == null) return`.
//
// TẤT ĐỊNH TUYỆT ĐỐI: không Date.now(), không random, không đồng hồ — cùng mã nguồn luôn cho
// cùng output, nếu không thì không thể làm cổng chấm.
import { LoiKotlin } from './lexer.js'
import { phanTich } from './parser.js'
import type { BieuThuc, KhaiBaoHam, KhaiBaoKieu, Lenh, MauWhen, ThamSo, ViTri } from './ast.js'

// ───────────────────────────── Giá trị ─────────────────────────────

export type Gia =
  | { k: 'int'; gia: number }
  | { k: 'double'; gia: number }
  | { k: 'chuoi'; gia: string }
  | { k: 'kyTu'; gia: string }
  | { k: 'bool'; gia: boolean }
  | { k: 'null' }
  | { k: 'unit' }
  | { k: 'ds'; pt: Gia[]; doi: boolean; tap?: boolean }
  | { k: 'map'; cap: { khoa: Gia; gia: Gia }[]; doi: boolean }
  | { k: 'cap'; a: Gia; b: Gia }
  | { k: 'khoang'; tu: number; den: number; buoc: number }
  | {
      k: 'ham'
      ten: string
      thamSo: ThamSo[]
      than: Lenh[]
      dong: MoiTruong
      tuThan?: Gia
      /** Kiểu trả về khai báo — cần để biết `f()` có thể null hay không. */
      kieuTra?: string
    }
  | { k: 'lambda'; thamSo: string[]; than: Lenh[]; dong: MoiTruong }
  /** `thuTuData` chỉ có ở data class: thứ tự trường để in và so bằng theo NỘI DUNG. */
  | { k: 'doiTuong'; lop: string; truong: Map<string, O>; thuTuData?: string[] }
  | { k: 'lop'; ten: string }
  | { k: 'enum'; lop: string; ten: string; thuTu: number; truong: Map<string, O> }
  /**
   * Ngoại lệ dựng sẵn. Phải là kiểu giá trị RIÊNG chứ không phải chuỗi: `catch (e: X)` cần
   * biết TÊN LỚP để khớp đúng nhánh, mà chuỗi thì mọi ngoại lệ đều thành `String`.
   */
  | { k: 'ngoaiLe'; lop: string; thongDiep: string }

/** Một ô nhớ: giá trị + hai thứ chỉ ô mới biết (hằng hay biến, có thể null hay không). */
interface O {
  gia: Gia
  hangSo: boolean
  coTheNull: boolean
}

export interface TuyChonChay {
  tranBuoc?: number
  tranKyTu?: number
}

/**
 * Khoá ẩn giữ tên lớp CHA của lớp đang khai phương thức chạy dở — chỗ `super.x` bắt đầu tra.
 * Có "$" nên lexer không sinh ra được định danh trùng, không sợ va chạm với biến của học viên.
 */
const KHOA_SUPER = 'super$lop'

/** Lỗi do `throw` của học viên — khác LoiKotlin (lỗi của bộ chạy khi mã sai). */
export class LoiNem extends Error {
  constructor(
    readonly gia: Gia,
    readonly dong: number,
  ) {
    super('loi duoc nem')
  }
}

class TinHieuReturn {
  constructor(readonly gia: Gia) {}
}
class TinHieuBreak {}
class TinHieuContinue {}

class MoiTruong {
  private o = new Map<string, O>()
  constructor(readonly cha?: MoiTruong) {}

  khai(ten: string, o: O): void {
    this.o.set(ten, o)
  }

  timO(ten: string): O | undefined {
    const tai = this.o.get(ten)
    if (tai !== undefined) return tai
    return this.cha?.timO(ten)
  }

  coTaiCho(ten: string): boolean {
    return this.o.has(ten)
  }
}

// ───────────────────────────── In giá trị ─────────────────────────────

/** Định dạng số theo đúng cách Kotlin in: Int không có `.0`, Double thì có. */
function inSo(g: Gia & { k: 'int' | 'double' }): string {
  if (g.k === 'int') return String(g.gia)
  if (Number.isFinite(g.gia) && Number.isInteger(g.gia)) return `${g.gia}.0`
  return String(g.gia)
}

export function inGia(g: Gia): string {
  switch (g.k) {
    case 'int':
    case 'double':
      return inSo(g)
    case 'chuoi':
      return g.gia
    case 'kyTu':
      return g.gia
    case 'bool':
      return g.gia ? 'true' : 'false'
    case 'null':
      return 'null'
    case 'unit':
      return 'kotlin.Unit'
    case 'ds':
      // Kotlin in Set y hệt List: `[1, 2]` — nên không tách nhánh theo `g.tap`.
      return `[${g.pt.map(inGia).join(', ')}]`
    case 'map':
      return `{${g.cap.map((c) => `${inGia(c.khoa)}=${inGia(c.gia)}`).join(', ')}}`
    case 'cap':
      return `(${inGia(g.a)}, ${inGia(g.b)})`
    case 'khoang':
      return `${g.tu}..${g.den}`
    case 'ham':
    case 'lambda':
      return '(ham)'
    case 'lop':
      return g.ten
    case 'enum':
      return g.ten
    case 'ngoaiLe':
      // Đúng dạng `toString()` của ngoại lệ trên JVM — có ca đối chiếu K82 canh.
      return `java.lang.${g.lop}: ${g.thongDiep}`
    case 'doiTuong': {
      if (g.thuTuData === undefined) return `${g.lop}@doiTuong`
      const phan = g.thuTuData.map((t) => `${t}=${inGia(g.truong.get(t)?.gia ?? { k: 'null' })}`)
      return `${g.lop}(${phan.join(', ')})`
    }
  }
}

export function tenKieuCua(g: Gia): string {
  switch (g.k) {
    case 'int':
      return 'Int'
    case 'double':
      return 'Double'
    case 'chuoi':
      return 'String'
    case 'kyTu':
      return 'Char'
    case 'bool':
      return 'Boolean'
    case 'null':
      return 'null'
    case 'unit':
      return 'Unit'
    case 'ds':
      return g.tap === true ? 'Set' : 'List'
    case 'map':
      return 'Map'
    case 'cap':
      return 'Pair'
    case 'khoang':
      return 'IntRange'
    case 'ham':
    case 'lambda':
      return 'Function'
    case 'lop':
      return g.ten
    case 'enum':
      return g.lop
    case 'ngoaiLe':
      return g.lop
    case 'doiTuong':
      return g.lop
  }
}

/** So sánh bằng theo ngữ nghĩa `==` của Kotlin (so NỘI DUNG, không so tham chiếu). */
function bang(a: Gia, b: Gia): boolean {
  if (a.k === 'null' || b.k === 'null') return a.k === 'null' && b.k === 'null'
  if ((a.k === 'int' || a.k === 'double') && (b.k === 'int' || b.k === 'double')) {
    return a.gia === b.gia
  }
  if (a.k !== b.k) return false
  switch (a.k) {
    case 'chuoi':
    case 'kyTu':
      return a.gia === (b as typeof a).gia
    case 'bool':
      return a.gia === (b as typeof a).gia
    case 'ds': {
      const y = b as typeof a
      return a.pt.length === y.pt.length && a.pt.every((x, i) => bang(x, y.pt[i]!))
    }
    case 'map': {
      const y = b as typeof a
      if (a.cap.length !== y.cap.length) return false
      return a.cap.every((c) => y.cap.some((d) => bang(c.khoa, d.khoa) && bang(c.gia, d.gia)))
    }
    case 'cap': {
      const y = b as typeof a
      return bang(a.a, y.a) && bang(a.b, y.b)
    }
    case 'enum': {
      const y = b as typeof a
      return a.lop === y.lop && a.ten === y.ten
    }
    case 'ngoaiLe': {
      const y = b as typeof a
      return a.lop === y.lop && a.thongDiep === y.thongDiep
    }
    case 'doiTuong': {
      const y = b as typeof a
      // `data class` so NỘI DUNG; lớp thường so THAM CHIẾU — đúng Kotlin thật.
      if (a === b) return true
      if (a.thuTuData === undefined || y.thuTuData === undefined || a.lop !== y.lop) return false
      return a.thuTuData.every((t) =>
        bang(a.truong.get(t)?.gia ?? { k: 'null' }, y.truong.get(t)?.gia ?? { k: 'null' }),
      )
    }
    default:
      return a === b
  }
}

/** Khoá dùng để tra trong Map — tất định, đúng ngữ nghĩa `==`. */
function khoaCua(g: Gia): string {
  return `${g.k}:${inGia(g)}`
}

export class BoChay {
  private ra: string[] = []
  private soKyTu = 0
  private buoc = 0
  private tranBuoc: number
  private tranKyTu: number
  private toanCuc = new MoiTruong()
  private lop = new Map<string, KhaiBaoKieu>()
  /** Bản sao data class có so bằng theo nội dung — giữ riêng để `bang()` biết. */
  private laDataLop = new Set<string>()

  constructor(tc: TuyChonChay = {}) {
    this.tranBuoc = tc.tranBuoc ?? 200_000
    this.tranKyTu = tc.tranKyTu ?? 200_000
  }

  chay(src: string): string {
    const ct = phanTich(src)
    // Nâng khai báo lớp và hàm lên trước — Kotlin cho gọi hàm khai sau chỗ gọi.
    for (const l of ct) {
      if (l.k === 'kieu') this.dangKyKieu(l.kieu)
      if (l.k === 'ham') this.dangKyHam(l.ham, this.toanCuc)
    }
    for (const l of ct) {
      if (l.k === 'kieu' || l.k === 'ham') continue
      this.lenh(l, this.toanCuc)
    }
    // Kotlin chạy từ `main()` nếu có; nếu không thì mã ở cấp cao nhất đã chạy ở trên.
    const m = this.toanCuc.timO('main')
    if (m !== undefined && (m.gia.k === 'ham' || m.gia.k === 'lambda')) {
      this.goiGiaTri(m.gia, [], { dong: 1 })
    }
    return this.ra.join('')
  }

  // ───────────────────────── Hạ tầng ─────────────────────────

  private demBuoc(vt: ViTri): void {
    this.buoc++
    if (this.buoc > this.tranBuoc) {
      throw new LoiKotlin(
        `Chuong trinh chay qua ${this.tranBuoc} buoc va da bi dung lai. Gan nhu chac chan co mot vong lap khong bao gio ket thuc — kiem lai dieu kien dung cua while/for.`,
        vt.dong,
      )
    }
  }

  private in(s: string): void {
    this.soKyTu += s.length
    if (this.soKyTu > this.tranKyTu) {
      throw new LoiKotlin(
        `Chuong trinh in ra qua ${this.tranKyTu} ky tu va da bi dung lai. Kiem lai xem co dang in trong mot vong lap qua dai khong.`,
        0,
      )
    }
    this.ra.push(s)
  }

  private dangKyKieu(k: KhaiBaoKieu): void {
    this.lop.set(k.ten, k)
    if (k.laData) this.laDataLop.add(k.ten)
    if (k.loai === 'object') {
      // `object X { }` là thể hiện duy nhất, tạo ngay.
      const dt = this.taoDoiTuongRong(k)
      this.toanCuc.khai(k.ten, { gia: dt, hangSo: true, coTheNull: false })
      return
    }
    if (k.loai === 'enum') {
      this.toanCuc.khai(k.ten, { gia: { k: 'lop', ten: k.ten }, hangSo: true, coTheNull: false })
      return
    }
    this.toanCuc.khai(k.ten, { gia: { k: 'lop', ten: k.ten }, hangSo: true, coTheNull: false })
  }

  private dangKyHam(h: KhaiBaoHam, mt: MoiTruong): void {
    mt.khai(h.ten, {
      gia: {
        k: 'ham',
        ten: h.ten,
        thamSo: h.thamSo,
        than: h.than,
        dong: mt,
        ...(h.kieuTra !== undefined ? { kieuTra: h.kieuTra } : {}),
      },
      hangSo: true,
      coTheNull: false,
    })
  }

  /** Kiểu khai có dấu `?` ở cuối nghĩa là ô đó có thể null. */
  private kieuCoTheNull(kieu: string | undefined): boolean {
    return kieu !== undefined && kieu.trimEnd().endsWith('?')
  }

  // ───────────────────────── Câu lệnh ─────────────────────────

  private khoi(ds: Lenh[], mt: MoiTruong): Gia {
    let cuoi: Gia = { k: 'unit' }
    // Nâng khai báo hàm/lớp cục bộ.
    for (const l of ds) {
      if (l.k === 'ham') this.dangKyHam(l.ham, mt)
      if (l.k === 'kieu') this.dangKyKieu(l.kieu)
    }
    for (const l of ds) {
      if (l.k === 'ham' || l.k === 'kieu') continue
      cuoi = this.lenh(l, mt)
    }
    return cuoi
  }

  private lenh(l: Lenh, mt: MoiTruong): Gia {
    this.demBuoc(l.vt)
    switch (l.k) {
      case 'khaiBao': {
        const gia = l.gia !== undefined ? this.bt(l.gia, mt) : ({ k: 'null' } as Gia)
        // Suy tính-null: từ kiểu khai nếu có, nếu không thì từ giá trị khởi tạo.
        const coTheNull =
          l.kieu !== undefined ? this.kieuCoTheNull(l.kieu) : this.btCoTheNull(l.gia, mt)
        mt.khai(l.ten, { gia, hangSo: l.hangSo, coTheNull })
        return { k: 'unit' }
      }
      case 'khaiBaoRa': {
        const g = this.bt(l.gia, mt)
        const phan = this.tachRa(g, l.ten.length, l.vt)
        l.ten.forEach((t, i) => mt.khai(t, { gia: phan[i]!, hangSo: true, coTheNull: false }))
        return { k: 'unit' }
      }
      case 'gan': {
        this.gan(l.dich, l.toan, l.gia, mt, l.vt)
        return { k: 'unit' }
      }
      case 'bieuThuc':
        return this.bt(l.bt, mt)
      case 'if': {
        const dk = this.bt(l.dieuKien, mt)
        if (this.laDung(dk, l.vt)) {
          const con = new MoiTruong(mt)
          this.apSmartCast(l.dieuKien, con, mt, true)
          return this.khoi(l.than, con)
        }
        if (l.nguoc !== undefined) {
          const con = new MoiTruong(mt)
          this.apSmartCast(l.dieuKien, con, mt, false)
          return this.khoi(l.nguoc, con)
        }
        // `if (x == null) return` — phần còn lại của khối biết x khác null.
        this.apSmartCast(l.dieuKien, mt, mt, false)
        return { k: 'unit' }
      }
      case 'while': {
        for (;;) {
          this.demBuoc(l.vt)
          if (!this.laDung(this.bt(l.dieuKien, mt), l.vt)) break
          try {
            this.khoi(l.than, new MoiTruong(mt))
          } catch (e) {
            if (e instanceof TinHieuBreak) break
            if (e instanceof TinHieuContinue) continue
            throw e
          }
        }
        return { k: 'unit' }
      }
      case 'doWhile': {
        for (;;) {
          this.demBuoc(l.vt)
          try {
            this.khoi(l.than, new MoiTruong(mt))
          } catch (e) {
            if (e instanceof TinHieuBreak) break
            if (!(e instanceof TinHieuContinue)) throw e
          }
          if (!this.laDung(this.bt(l.dieuKien, mt), l.vt)) break
        }
        return { k: 'unit' }
      }
      case 'for': {
        const nguon = this.bt(l.nguon, mt)
        const ds = this.duyet(nguon, l.vt)
        for (const x of ds) {
          this.demBuoc(l.vt)
          const con = new MoiTruong(mt)
          if (l.bien.length === 1) {
            con.khai(l.bien[0]!, { gia: x, hangSo: true, coTheNull: false })
          } else {
            const phan = this.tachRa(x, l.bien.length, l.vt)
            l.bien.forEach((t, i) => con.khai(t, { gia: phan[i]!, hangSo: true, coTheNull: false }))
          }
          try {
            this.khoi(l.than, con)
          } catch (e) {
            if (e instanceof TinHieuBreak) break
            if (e instanceof TinHieuContinue) continue
            throw e
          }
        }
        return { k: 'unit' }
      }
      case 'when':
        return this.chayWhen(l.chuDe, l.nhanh, l.macDinh, mt, l.vt)
      case 'return':
        throw new TinHieuReturn(l.gia !== undefined ? this.bt(l.gia, mt) : { k: 'unit' })
      case 'break':
        throw new TinHieuBreak()
      case 'continue':
        throw new TinHieuContinue()
      case 'throw':
        throw new LoiNem(this.bt(l.gia, mt), l.vt.dong)
      case 'try':
        return this.chayTry(l.than, l.bat, l.cuoiCung, mt)
      case 'ham':
        this.dangKyHam(l.ham, mt)
        return { k: 'unit' }
      case 'kieu':
        this.dangKyKieu(l.kieu)
        return { k: 'unit' }
    }
  }

  private chayTry(
    than: Lenh[],
    bat: { ten: string; kieu?: string; than: Lenh[] }[],
    cuoiCung: Lenh[] | undefined,
    mt: MoiTruong,
  ): Gia {
    let ra: Gia = { k: 'unit' }
    try {
      ra = this.khoi(than, new MoiTruong(mt))
    } catch (e) {
      if (e instanceof LoiNem) {
        const khop = bat.find((b) => b.kieu === undefined || this.laKieu(e.gia, b.kieu))
        if (khop === undefined) {
          if (cuoiCung !== undefined) this.khoi(cuoiCung, new MoiTruong(mt))
          throw e
        }
        const con = new MoiTruong(mt)
        con.khai(khop.ten, { gia: e.gia, hangSo: true, coTheNull: false })
        ra = this.khoi(khop.than, con)
      } else {
        if (cuoiCung !== undefined) this.khoi(cuoiCung, new MoiTruong(mt))
        throw e
      }
    }
    if (cuoiCung !== undefined) this.khoi(cuoiCung, new MoiTruong(mt))
    return ra
  }

  private chayWhen(
    chuDe: BieuThuc | undefined,
    nhanh: { mau: MauWhen[]; than: Lenh[] }[],
    macDinh: Lenh[] | undefined,
    mt: MoiTruong,
    vt: ViTri,
  ): Gia {
    const gia = chuDe !== undefined ? this.bt(chuDe, mt) : undefined
    for (const n of nhanh) {
      for (const m of n.mau) {
        if (this.khopMau(m, gia, mt, vt)) {
          const con = new MoiTruong(mt)
          // Smart cast trong nhánh `is Kieu` khi chủ đề là một tên biến.
          if (m.k === 'la' && !m.phuDinh && chuDe !== undefined && chuDe.k === 'ten') {
            const o = mt.timO(chuDe.ten)
            if (o !== undefined) con.khai(chuDe.ten, { ...o, coTheNull: false })
          }
          return this.khoi(n.than, con)
        }
      }
    }
    if (macDinh !== undefined) return this.khoi(macDinh, new MoiTruong(mt))
    return { k: 'unit' }
  }

  private khopMau(m: MauWhen, gia: Gia | undefined, mt: MoiTruong, vt: ViTri): boolean {
    switch (m.k) {
      case 'dieuKien':
        return this.laDung(this.bt(m.bt, mt), vt)
      case 'gia':
        return gia !== undefined && bang(gia, this.bt(m.bt, mt))
      case 'trong': {
        if (gia === undefined) return false
        const co = this.thuocVe(gia, this.bt(m.bt, mt), vt)
        return m.phuDinh ? !co : co
      }
      case 'la': {
        if (gia === undefined) return false
        const co = this.laKieu(gia, m.kieu)
        return m.phuDinh ? !co : co
      }
    }
  }

  private laKieu(g: Gia, kieu: string): boolean {
    const k = kieu.replace('?', '')
    if (tenKieuCua(g) === k) return true
    // Kế thừa: đi ngược cây lớp cha và interface.
    if (g.k === 'doiTuong') {
      let cur: string | undefined = g.lop
      while (cur !== undefined) {
        if (cur === k) return true
        const kb: KhaiBaoKieu | undefined = this.lop.get(cur)
        if (kb === undefined) break
        if (kb.giaoDien.includes(k)) return true
        cur = kb.cha?.ten
      }
    }
    if (g.k === 'ngoaiLe') {
      // Cây thừa kế rút gọn của ngoại lệ dựng sẵn — đủ cho `catch (e: Exception)` bắt tất cả.
      if (k === 'Exception' || k === 'Throwable') return true
      if (k === 'RuntimeException') {
        return [
          'RuntimeException',
          'IllegalArgumentException',
          'IllegalStateException',
          'NumberFormatException',
        ].includes(g.lop)
      }
      if (k === 'IllegalArgumentException') {
        return g.lop === 'IllegalArgumentException' || g.lop === 'NumberFormatException'
      }
    }
    if (k === 'Any') return g.k !== 'null'
    if (k === 'Number') return g.k === 'int' || g.k === 'double'
    return false
  }

  // ───────────────────────── Smart cast ─────────────────────────

  /**
   * Ghi đè cờ `coTheNull` trong phạm vi con khi điều kiện đã chứng minh biến khác null.
   *
   * Chỉ nhận hai dạng đúng như Kotlin dạy ở bài đầu — `x != null` và `x == null` — cộng phép
   * `&&` nối chúng lại. Cố ý KHÔNG suy diễn xa hơn: suy sai còn tệ hơn không suy.
   */
  private apSmartCast(dk: BieuThuc, dich: MoiTruong, goc: MoiTruong, nhanhDung: boolean): void {
    if (dk.k === 'nhiNguyen' && dk.toan === '&&' && nhanhDung) {
      this.apSmartCast(dk.trai, dich, goc, true)
      this.apSmartCast(dk.phai, dich, goc, true)
      return
    }
    if (dk.k === 'nhiNguyen' && (dk.toan === '!=' || dk.toan === '==')) {
      const { trai, phai } = dk
      const tenBen = trai.k === 'ten' ? trai : phai.k === 'ten' ? phai : undefined
      const benNull = trai.k === 'null' ? trai : phai.k === 'null' ? phai : undefined
      if (tenBen === undefined || benNull === undefined) return
      // `x != null` đúng ở nhánh then; `x == null` đúng ở nhánh else.
      const chungMinhKhacNull = dk.toan === '!=' ? nhanhDung : !nhanhDung
      if (!chungMinhKhacNull) return
      const o = goc.timO(tenBen.ten)
      if (o !== undefined && o.coTheNull) {
        dich.khai(tenBen.ten, { gia: o.gia, hangSo: o.hangSo, coTheNull: false })
      }
    }
  }

  /** Biểu thức này có thể cho ra null không (theo KHAI BÁO, không theo giá trị lúc chạy). */
  private btCoTheNull(bt: BieuThuc | undefined, mt: MoiTruong): boolean {
    if (bt === undefined) return true
    if (bt.k === 'null') return true
    if (bt.k === 'ten') return mt.timO(bt.ten)?.coTheNull ?? false
    if (bt.k === 'truyCap') return bt.anToan || TRA_VE_NULL.has(bt.ten)
    if (bt.k === 'chiSo') {
      const o = this.bt(bt.doiTuong, mt)
      return o.k === 'map' // Map[khoa] trả về null khi không có khoá
    }
    if (bt.k === 'goi' && bt.ham.k === 'truyCap') return TRA_VE_NULL.has(bt.ham.ten)
    if (bt.k === 'goi' && bt.ham.k === 'ten') {
      // Hàm học viên tự viết: tính-null lấy từ KIỂU TRẢ VỀ đã khai (`fun f(): String?`).
      const o = mt.timO(bt.ham.ten)
      if (o !== undefined && o.gia.k === 'ham') return this.kieuCoTheNull(o.gia.kieuTra)
    }
    if (bt.k === 'ep') return bt.anToan
    return false
  }

  // ───────────────────────── Biểu thức ─────────────────────────

  private bt(e: BieuThuc, mt: MoiTruong): Gia {
    this.demBuoc(e.vt)
    switch (e.k) {
      case 'soNguyen':
        return { k: 'int', gia: e.gia }
      case 'soThuc':
        return { k: 'double', gia: e.gia }
      case 'kyTu':
        return { k: 'kyTu', gia: e.gia }
      case 'bool':
        return { k: 'bool', gia: e.gia }
      case 'null':
        return { k: 'null' }
      case 'chuoi': {
        let s = ''
        for (const m of e.manh) {
          if (m.loai === 'chu') s += m.chu ?? ''
          else s += this.chuoiHoa(this.bt(m.bt!, mt), e.vt)
        }
        return { k: 'chuoi', gia: s }
      }
      case 'ten': {
        const o = mt.timO(e.ten)
        if (o === undefined) {
          const sanCo = SAN_CO.has(e.ten)
          // `Unit` là ĐỐI TƯỢNG dựng sẵn, không phải tên lớp — in ra phải là `kotlin.Unit`.
          if (e.ten === 'Unit') return { k: 'unit' }
          if (sanCo) return { k: 'lop', ten: e.ten }
          throw new LoiKotlin(
            `Chua khai bao "${e.ten}". Kiem lai chinh ta, hoac them "val ${e.ten} = ..." truoc khi dung.`,
            e.vt.dong,
          )
        }
        return o.gia
      }
      case 'this': {
        const o = mt.timO('this')
        if (o === undefined) {
          throw new LoiKotlin('"this" chi dung duoc ben trong mot lop.', e.vt.dong)
        }
        return o.gia
      }
      case 'super': {
        const o = mt.timO('this')
        if (o === undefined)
          throw new LoiKotlin('"super" chi dung duoc ben trong mot lop.', e.vt.dong)
        return o.gia
      }
      case 'donNguyen': {
        const g = this.bt(e.ben, mt)
        if (e.toan === '-') {
          if (g.k === 'int') return { k: 'int', gia: -g.gia }
          if (g.k === 'double') return { k: 'double', gia: -g.gia }
          throw new LoiKotlin(`Khong the doi dau cho gia tri kieu ${tenKieuCua(g)}.`, e.vt.dong)
        }
        return { k: 'bool', gia: !this.laDung(g, e.vt) }
      }
      case 'nhiNguyen':
        return this.nhiNguyen(e, mt)
      case 'khoang': {
        const tu = this.soCua(this.bt(e.tu, mt), e.vt)
        const den = this.soCua(this.bt(e.den, mt), e.vt)
        const buoc = e.buoc !== undefined ? this.soCua(this.bt(e.buoc, mt), e.vt) : 1
        if (buoc <= 0) {
          throw new LoiKotlin('Buoc cua khoang ("step") phai la so duong.', e.vt.dong)
        }
        if (e.loai === 'den') return { k: 'khoang', tu, den, buoc }
        if (e.loai === 'until') return { k: 'khoang', tu, den: den - 1, buoc }
        return { k: 'khoang', tu, den, buoc: -buoc }
      }
      case 'ifBt':
        return this.laDung(this.bt(e.dieuKien, mt), e.vt)
          ? this.bt(e.dung, new MoiTruong(mt))
          : this.bt(e.sai, new MoiTruong(mt))
      case 'whenBt':
        return this.chayWhen(e.chuDe, e.nhanh, e.macDinh, mt, e.vt)
      case 'tryBt':
        return this.chayTry(e.than, e.bat, e.cuoiCung, mt)
      case 'elvis': {
        const t = this.bt(e.trai, mt)
        return t.k === 'null' ? this.bt(e.phai, mt) : t
      }
      case 'epKhongNull': {
        const g = this.bt(e.ben, mt)
        if (g.k === 'null') {
          throw new LoiKotlin(
            'Dung "!!" tren mot gia tri dang la null nen chuong trinh dung lai — day dung la loi NullPointerException kinh dien. Dung "?." hoac "?:" de xu ly truong hop null thay vi ep bang "!!".',
            e.vt.dong,
          )
        }
        return g
      }
      case 'la': {
        const g = this.bt(e.ben, mt)
        const co = this.laKieu(g, e.kieu)
        return { k: 'bool', gia: e.phuDinh ? !co : co }
      }
      case 'ep': {
        const g = this.bt(e.ben, mt)
        if (this.laKieu(g, e.kieu) || e.kieu.replace('?', '') === 'Any') return g
        if (e.anToan) return { k: 'null' }
        throw new LoiKotlin(
          `Khong the ep gia tri kieu ${tenKieuCua(g)} thanh ${e.kieu}. Dung "as?" neu muon nhan null thay vi dung chuong trinh.`,
          e.vt.dong,
        )
      }
      case 'lambda':
        return { k: 'lambda', thamSo: e.thamSo, than: e.than, dong: mt }
      case 'chiSo': {
        const o = this.bt(e.doiTuong, mt)
        const kh = this.bt(e.khoa, mt)
        return this.layChiSo(o, kh, e.vt)
      }
      case 'truyCap':
        return this.truyCap(e, mt)
      case 'goi':
        return this.goi(e, mt)
    }
  }

  private nhiNguyen(e: BieuThuc & { k: 'nhiNguyen' }, mt: MoiTruong): Gia {
    const { toan } = e
    if (toan === '&&') {
      return this.laDung(this.bt(e.trai, mt), e.vt)
        ? { k: 'bool', gia: this.laDung(this.bt(e.phai, mt), e.vt) }
        : { k: 'bool', gia: false }
    }
    if (toan === '||') {
      return this.laDung(this.bt(e.trai, mt), e.vt)
        ? { k: 'bool', gia: true }
        : { k: 'bool', gia: this.laDung(this.bt(e.phai, mt), e.vt) }
    }
    return this.nhiNguyenTren(this.bt(e.trai, mt), this.bt(e.phai, mt), toan, e.vt)
  }

  /**
   * Phép hai ngôi tính trên GIÁ TRỊ (đã đánh giá xong hai vế).
   *
   * Tách khỏi `nhiNguyen` để phép gán rút gọn (`+=`, `-=`…) dùng CHUNG toàn bộ luật ở đây —
   * kể cả chia nguyên và nối chuỗi — thay vì chép lại. Chép lại là cách chắc chắn nhất để hai
   * đường lệch nhau về sau.
   */
  private nhiNguyenTren(a: Gia, b: Gia, toan: string, vt: ViTri): Gia {
    if (toan === '==' || toan === '===') return { k: 'bool', gia: bang(a, b) }
    if (toan === '!=' || toan === '!==') return { k: 'bool', gia: !bang(a, b) }
    if (toan === 'in') return { k: 'bool', gia: this.thuocVe(a, b, vt) }
    if (toan === '!in') return { k: 'bool', gia: !this.thuocVe(a, b, vt) }

    // Nối chuỗi: Kotlin cho `"a" + bat ky gia tri nao`.
    if (toan === '+' && a.k === 'chuoi') return { k: 'chuoi', gia: a.gia + inGia(b) }

    if (a.k === 'null' || b.k === 'null') {
      throw new LoiKotlin(
        `Khong the dung toan tu "${toan}" voi mot gia tri dang la null. Xu ly truong hop null truoc bang "?:" hoac kiem "if (x != null)".`,
        vt.dong,
      )
    }

    if ((a.k === 'int' || a.k === 'double') && (b.k === 'int' || b.k === 'double')) {
      const caHaiInt = a.k === 'int' && b.k === 'int'
      const x = a.gia
      const y = b.gia
      switch (toan) {
        case '+':
        case '-':
        case '*': {
          const r = toan === '+' ? x + y : toan === '-' ? x - y : x * y
          return caHaiInt ? { k: 'int', gia: r } : { k: 'double', gia: r }
        }
        case '/': {
          if (y === 0 && caHaiInt) {
            throw new LoiKotlin(
              'Chia mot so nguyen cho 0. Kiem lai mau so truoc khi chia.',
              vt.dong,
            )
          }
          // CHIA NGUYÊN khi cả hai vế là Int — đúng Kotlin, và là bẫy kinh điển của người mới.
          return caHaiInt ? { k: 'int', gia: Math.trunc(x / y) } : { k: 'double', gia: x / y }
        }
        case '%': {
          if (y === 0 && caHaiInt) {
            throw new LoiKotlin('Lay phan du voi 0. Kiem lai mau so.', vt.dong)
          }
          return caHaiInt ? { k: 'int', gia: x % y } : { k: 'double', gia: x % y }
        }
        case '<':
          return { k: 'bool', gia: x < y }
        case '>':
          return { k: 'bool', gia: x > y }
        case '<=':
          return { k: 'bool', gia: x <= y }
        case '>=':
          return { k: 'bool', gia: x >= y }
      }
    }

    if (a.k === 'chuoi' && b.k === 'chuoi') {
      switch (toan) {
        case '<':
          return { k: 'bool', gia: a.gia < b.gia }
        case '>':
          return { k: 'bool', gia: a.gia > b.gia }
        case '<=':
          return { k: 'bool', gia: a.gia <= b.gia }
        case '>=':
          return { k: 'bool', gia: a.gia >= b.gia }
      }
    }

    if (toan === '+' && a.k === 'ds' && b.k === 'ds') {
      return { k: 'ds', pt: [...a.pt, ...b.pt], doi: false }
    }

    throw new LoiKotlin(
      `Khong dung duoc toan tu "${toan}" giua ${tenKieuCua(a)} va ${tenKieuCua(b)}.`,
      vt.dong,
    )
  }

  private laDung(g: Gia, vt: ViTri): boolean {
    if (g.k !== 'bool') {
      throw new LoiKotlin(
        `Dieu kien phai la Boolean (true/false), nhung dang la ${tenKieuCua(g)}. Kotlin khong tu coi so hay chuoi la dung/sai nhu mot so ngon ngu khac.`,
        vt.dong,
      )
    }
    return g.gia
  }

  private soCua(g: Gia, vt: ViTri): number {
    if (g.k === 'int' || g.k === 'double') return g.gia
    throw new LoiKotlin(`Cho nay can mot so, nhung dang la ${tenKieuCua(g)}.`, vt.dong)
  }

  private duyet(g: Gia, vt: ViTri): Gia[] {
    if (g.k === 'ds') return [...g.pt]
    if (g.k === 'chuoi') return [...g.gia].map((c) => ({ k: 'kyTu', gia: c }) as Gia)
    if (g.k === 'khoang') {
      const ra: Gia[] = []
      if (g.buoc > 0) for (let i = g.tu; i <= g.den; i += g.buoc) ra.push({ k: 'int', gia: i })
      else for (let i = g.tu; i >= g.den; i += g.buoc) ra.push({ k: 'int', gia: i })
      return ra
    }
    if (g.k === 'map') return g.cap.map((c) => ({ k: 'cap', a: c.khoa, b: c.gia }) as Gia)
    throw new LoiKotlin(
      `Khong duyet duoc gia tri kieu ${tenKieuCua(g)} bang vong for. Chi duyet duoc List, Set, Map, chuoi va khoang.`,
      vt.dong,
    )
  }

  private thuocVe(x: Gia, tap: Gia, vt: ViTri): boolean {
    if (tap.k === 'khoang') {
      const n = this.soCua(x, vt)
      return tap.buoc > 0 ? n >= tap.tu && n <= tap.den : n <= tap.tu && n >= tap.den
    }
    if (tap.k === 'ds') return tap.pt.some((p) => bang(p, x))
    if (tap.k === 'map') return tap.cap.some((c) => bang(c.khoa, x))
    if (tap.k === 'chuoi' && x.k === 'chuoi') return tap.gia.includes(x.gia)
    throw new LoiKotlin(`Khong dung duoc "in" voi ${tenKieuCua(tap)}.`, vt.dong)
  }

  private tachRa(g: Gia, n: number, vt: ViTri): Gia[] {
    if (g.k === 'cap' && n === 2) return [g.a, g.b]
    if (g.k === 'ds' && g.pt.length >= n) return g.pt.slice(0, n)
    if (g.k === 'doiTuong') {
      const kb = this.lop.get(g.lop)
      if (kb !== undefined && kb.laData) {
        const ten = kb.thamSoDung.map((t) => t.ten).slice(0, n)
        if (ten.length === n) return ten.map((t) => g.truong.get(t)?.gia ?? { k: 'null' })
      }
    }
    throw new LoiKotlin(
      `Khong tach duoc ${n} phan tu tu gia tri kieu ${tenKieuCua(g)}. Chi tach duoc Pair, List du dai, hoac data class.`,
      vt.dong,
    )
  }

  private layChiSo(o: Gia, kh: Gia, vt: ViTri): Gia {
    if (o.k === 'ds') {
      const i = this.soCua(kh, vt)
      if (i < 0 || i >= o.pt.length) {
        throw new LoiKotlin(
          `Lay phan tu thu ${i} trong danh sach chi co ${o.pt.length} phan tu (chi so dem tu 0, nen hop le la 0 den ${o.pt.length - 1}).`,
          vt.dong,
        )
      }
      return o.pt[i]!
    }
    if (o.k === 'chuoi') {
      const i = this.soCua(kh, vt)
      if (i < 0 || i >= o.gia.length) {
        throw new LoiKotlin(`Lay ky tu thu ${i} trong chuoi chi co ${o.gia.length} ky tu.`, vt.dong)
      }
      return { k: 'kyTu', gia: o.gia[i]! }
    }
    if (o.k === 'map') {
      const c = o.cap.find((x) => khoaCua(x.khoa) === khoaCua(kh))
      // Kotlin: `map[khoa]` trả về null khi không có khoá — KHÔNG dừng chương trình.
      return c === undefined ? { k: 'null' } : c.gia
    }
    if (o.k === 'null') {
      throw new LoiKotlin(
        'Lay phan tu tren mot gia tri dang la null. Kiem null truoc bang "if (x != null)" hoac dung "?.".',
        vt.dong,
      )
    }
    throw new LoiKotlin(`Khong lay duoc phan tu theo chi so tren ${tenKieuCua(o)}.`, vt.dong)
  }

  private gan(dich: BieuThuc, toan: string, giaBt: BieuThuc, mt: MoiTruong, vt: ViTri): void {
    const tinh = (cu: Gia): Gia => {
      const moi = this.bt(giaBt, mt)
      if (toan === '=') return moi
      return this.nhiNguyenGia(cu, moi, toan[0]!, vt)
    }

    if (dich.k === 'ten') {
      const o = mt.timO(dich.ten)
      if (o === undefined) {
        throw new LoiKotlin(
          `Chua khai bao "${dich.ten}". Them "var ${dich.ten} = ..." truoc khi gan.`,
          vt.dong,
        )
      }
      if (o.hangSo) {
        throw new LoiKotlin(
          `"${dich.ten}" khai bang "val" nen khong gan lai duoc. Doi thanh "var" neu that su can thay doi gia tri.`,
          vt.dong,
        )
      }
      o.gia = tinh(o.gia)
      return
    }
    if (dich.k === 'truyCap') {
      const o = this.bt(dich.doiTuong, mt)
      if (o.k !== 'doiTuong' && o.k !== 'enum') {
        throw new LoiKotlin(`Khong gan duoc thuoc tinh tren ${tenKieuCua(o)}.`, vt.dong)
      }
      const t = o.truong.get(dich.ten)
      if (t === undefined) {
        throw new LoiKotlin(`Lop ${tenKieuCua(o)} khong co thuoc tinh "${dich.ten}".`, vt.dong)
      }
      if (t.hangSo) {
        throw new LoiKotlin(
          `Thuoc tinh "${dich.ten}" khai bang "val" nen khong gan lai duoc.`,
          vt.dong,
        )
      }
      t.gia = tinh(t.gia)
      return
    }
    if (dich.k === 'chiSo') {
      const o = this.bt(dich.doiTuong, mt)
      const kh = this.bt(dich.khoa, mt)
      if (o.k === 'ds') {
        if (!o.doi) {
          throw new LoiKotlin(
            'Danh sach nay tao bang listOf() nen KHONG sua duoc. Dung mutableListOf() neu can thay doi.',
            vt.dong,
          )
        }
        const i = this.soCua(kh, vt)
        if (i < 0 || i >= o.pt.length) {
          throw new LoiKotlin(`Gan vao chi so ${i} ngoai pham vi danh sach.`, vt.dong)
        }
        o.pt[i] = tinh(o.pt[i]!)
        return
      }
      if (o.k === 'map') {
        if (!o.doi) {
          throw new LoiKotlin(
            'Map nay tao bang mapOf() nen KHONG sua duoc. Dung mutableMapOf() neu can thay doi.',
            vt.dong,
          )
        }
        const c = o.cap.find((x) => khoaCua(x.khoa) === khoaCua(kh))
        if (c === undefined) o.cap.push({ khoa: kh, gia: this.bt(giaBt, mt) })
        else c.gia = tinh(c.gia)
        this.sapMap(o)
        return
      }
      throw new LoiKotlin(`Khong gan duoc theo chi so tren ${tenKieuCua(o)}.`, vt.dong)
    }
    throw new LoiKotlin('Ve trai cua phep gan phai la mot bien, thuoc tinh hoac phan tu.', vt.dong)
  }

  private nhiNguyenGia(a: Gia, b: Gia, toan: string, vt: ViTri): Gia {
    return this.nhiNguyenTren(a, b, toan, vt)
  }

  /**
   * Chuỗi hoá ĐỂ IN RA. Khác `inGia` ở đúng một điểm: tôn trọng `override fun toString()` mà
   * học viên tự viết. Kotlin thật gọi `toString()` cho MỌI giá trị đem in — kể cả phần tử nằm
   * trong List/Map/Pair — nên hàm này đi đệ quy qua các kiểu chứa.
   *
   * Trước 2026-09-05 `println` gọi thẳng `inGia`, nên `override fun toString()` bị bỏ qua khi
   * in nhưng lại có hiệu lực khi gọi `x.toString()` tường minh: cùng một đối tượng cho hai kết
   * quả khác nhau tuỳ cách in. Đó là LỖI, không phải khác biệt cố ý — không mục nào trong
   * KHAC_BIET nói tới nó.
   */
  private chuoiHoa(g: Gia, vt: ViTri): string {
    switch (g.k) {
      case 'doiTuong':
        if (this.timHam(g.lop, 'toString') !== undefined) {
          return inGia(this.goiGiaTri(this.thanhVien(g, 'toString', vt), [], vt))
        }
        break
      case 'ds':
        return `[${g.pt.map((x) => this.chuoiHoa(x, vt)).join(', ')}]`
      case 'map':
        return `{${g.cap
          .map((c) => `${this.chuoiHoa(c.khoa, vt)}=${this.chuoiHoa(c.gia, vt)}`)
          .join(', ')}}`
      case 'cap':
        return `(${this.chuoiHoa(g.a, vt)}, ${this.chuoiHoa(g.b, vt)})`
    }
    return inGia(g)
  }

  /** Sắp Map theo khoá — TẤT ĐỊNH, vì bài học phải chấm được (xem KHAC_BIET). */
  private sapMap(m: Gia & { k: 'map' }): void {
    m.cap.sort((x, y) =>
      khoaCua(x.khoa) < khoaCua(y.khoa) ? -1 : khoaCua(x.khoa) > khoaCua(y.khoa) ? 1 : 0,
    )
  }

  // ───────────────────────── Truy cập và gọi ─────────────────────────

  private truyCap(e: BieuThuc & { k: 'truyCap' }, mt: MoiTruong): Gia {
    // Cảnh báo tính-null KHAI BÁO — trụ cột của bộ chạy này (xem đầu file).
    if (!e.anToan && this.btCoTheNull(e.doiTuong, mt)) {
      throw new LoiKotlin(
        `Gia tri nay khai kieu co the null nen KHONG duoc dung thang dau "." — day dung la loi ma trinh bien dich Kotlin chan lai. Ba cach sua: "?.${e.ten}" (null thi bo qua), "?: giaTriMacDinh" (thay the khi null), hoac "!!" (khang dinh chac chan khac null, sai thi dung chuong trinh).`,
        e.vt.dong,
      )
    }
    const o = this.bt(e.doiTuong, mt)
    if (o.k === 'null') {
      if (e.anToan) return { k: 'null' }
      throw new LoiKotlin(
        `Truy cap "${e.ten}" tren mot gia tri dang la null. Dung "?.${e.ten}" de bo qua khi null.`,
        e.vt.dong,
      )
    }
    return this.thanhVien(
      o,
      e.ten,
      e.vt,
      e.doiTuong.k === 'super' ? this.lopSuperCua(mt, e.vt) : undefined,
    )
  }

  /** Lớp CHA để `super` bắt đầu tra — không có nghĩa là lớp hiện tại không kế thừa ai. */
  private lopSuperCua(mt: MoiTruong, vt: ViTri): string | undefined {
    const o = mt.timO(KHOA_SUPER)
    if (o === undefined || o.gia.k !== 'lop') {
      throw new LoiKotlin(
        'Lop nay khong ke thua lop nao nen khong dung duoc "super". Them ": LopCha()" vao khai bao lop, hoac bo "super".',
        vt.dong,
      )
    }
    return o.gia.ten
  }

  /**
   * `batDauTu` = tên lớp bắt đầu tra phương thức. Chỉ `super.x` truyền vào (lớp CHA của lớp
   * đang khai phương thức chạy dở); mọi lời gọi thường để trống và tra từ lớp của đối tượng.
   */
  private thanhVien(o: Gia, ten: string, vt: ViTri, batDauTu?: string): Gia {
    // Thuộc tính của đối tượng / enum
    if (o.k === 'doiTuong' || o.k === 'enum') {
      const t = batDauTu === undefined ? o.truong.get(ten) : undefined
      if (t !== undefined) return t.gia
      if (o.k === 'enum' && batDauTu === undefined) {
        if (ten === 'name') return { k: 'chuoi', gia: o.ten }
        if (ten === 'ordinal') return { k: 'int', gia: o.thuTu }
      }
      const tim = this.timHamKemLop(batDauTu ?? tenKieuCua(o), ten)
      if (tim !== undefined) {
        const h = tim.ham
        // Kotlin cho viết `ten` thay cho `this.ten` trong thân lớp, nên môi trường của phương
        // thức phải thấy thẳng các thuộc tính của chính đối tượng — thiếu bước này thì mọi
        // phương thức đọc thuộc tính đều báo "chua khai bao".
        const dong = new MoiTruong(this.toanCuc)
        dong.khai('this', { gia: o, hangSo: true, coTheNull: false })
        for (const [k2, v] of o.truong) dong.khai(k2, v)
        // Ghi lớp cha của lớp KHAI phương thức này, để `super.x` bên trong thân tra đúng chỗ.
        // Tên có "$" nên không định danh Kotlin nào trùng được (lexer chỉ nhận chữ/số/gạch dưới).
        const cha = this.lop.get(tim.lopKhaiBao)?.cha?.ten
        if (cha !== undefined) {
          dong.khai(KHOA_SUPER, { gia: { k: 'lop', ten: cha }, hangSo: true, coTheNull: false })
        }
        return { k: 'ham', ten, thamSo: h.thamSo, than: h.than, dong, tuThan: o }
      }
      // `super.ten` với `ten` là THUỘC TÍNH: bộ chạy chỉ giữ MỘT ô cho mỗi tên, nên giá trị của
      // lớp cha đã bị bản ghi đè thay thế — không có gì để trả về. Nói thẳng ra thay vì báo
      // "lop khong co ten" (sai lệch: lớp có, chỉ là super không lấy được).
      if (batDauTu !== undefined && o.truong.has(ten)) {
        throw new LoiKotlin(
          `"super.${ten}" khong dung duoc trong bo chay nay vi "${ten}" la THUOC TINH, khong phai ham — bo chay chi giu mot o cho moi ten nen gia tri cua lop cha khong con. Doi thanh ham roi goi "super.${ten}()", hoac dat hai ten khac nhau.`,
          vt.dong,
        )
      }
      // Thuộc tính tính (get()) đã được dựng sẵn khi tạo đối tượng, nên tới đây là không có.
      throw new LoiKotlin(
        `Lop ${tenKieuCua(o)} khong co "${ten}". Kiem lai chinh ta hoac xem lai khai bao cua lop.`,
        vt.dong,
      )
    }
    // Truy cập tĩnh qua tên lớp: enum entry, companion, hàm dựng sẵn
    if (o.k === 'lop') {
      const kb = this.lop.get(o.ten)
      if (kb !== undefined) {
        if (kb.loai === 'enum') {
          const idx = kb.ca.findIndex((c) => c.ten === ten)
          if (idx >= 0) return this.taoEnum(kb, idx)
          if (ten === 'values') {
            return {
              k: 'ds',
              pt: kb.ca.map((_, i) => this.taoEnum(kb, i)),
              doi: false,
            }
          }
        }
        const dh = kb.dongHanh
        if (dh !== undefined) {
          const h = dh.ham.find((x) => x.ten === ten)
          if (h !== undefined) {
            return { k: 'ham', ten, thamSo: h.thamSo, than: h.than, dong: this.toanCuc }
          }
          const p = dh.thuocTinh.find((x) => x.ten === ten)
          if (p !== undefined && p.khoiTao !== undefined) return this.bt(p.khoiTao, this.toanCuc)
        }
      }
      throw new LoiKotlin(`"${o.ten}" khong co thanh vien "${ten}".`, vt.dong)
    }
    // Thành viên dựng sẵn của kiểu cơ bản — trả về "hàm gắn sẵn" để lời gọi xử lý.
    const sanCo = this.thanhVienSanCo(o, ten)
    if (sanCo !== undefined) return sanCo
    throw new LoiKotlin(
      `Kieu ${tenKieuCua(o)} khong co "${ten}" trong bo chay nay. Xem muc "Bo chay nay KHONG lam gi" cua bai hoc.`,
      vt.dong,
    )
  }

  private timHam(lop: string, ten: string): KhaiBaoHam | undefined {
    return this.timHamKemLop(lop, ten)?.ham
  }

  /**
   * Như `timHam`, nhưng trả kèm TÊN LỚP đã khai hàm đó.
   *
   * Cần tên lớp khai báo để `super.f()` biết bắt đầu tra từ đâu: nếu chỉ biết lớp của đối
   * tượng thì `super.f()` trong thân `f` sẽ tìm lại đúng `f` vừa ghi đè và gọi vòng vô tận.
   */
  private timHamKemLop(
    lop: string,
    ten: string,
  ): { ham: KhaiBaoHam; lopKhaiBao: string } | undefined {
    let cur: string | undefined = lop
    while (cur !== undefined) {
      const kb: KhaiBaoKieu | undefined = this.lop.get(cur)
      if (kb === undefined) return undefined
      const h = kb.ham.find((x) => x.ten === ten && !x.truuTuong)
      if (h !== undefined) return { ham: h, lopKhaiBao: cur }
      // Hàm mặc định của interface.
      for (const g of kb.giaoDien) {
        const kg = this.lop.get(g)
        const hg = kg?.ham.find((x) => x.ten === ten && !x.truuTuong)
        if (hg !== undefined) return { ham: hg, lopKhaiBao: g }
      }
      cur = kb.cha?.ten
    }
    return undefined
  }

  private goi(e: BieuThuc & { k: 'goi' }, mt: MoiTruong): Gia {
    const ts = e.thamSo.map((t) => ({
      ...(t.nhan !== undefined ? { nhan: t.nhan } : {}),
      gia: this.bt(t.gia, mt),
    }))
    const dongCuoi = e.dongCuoi !== undefined ? this.bt(e.dongCuoi, mt) : undefined
    if (dongCuoi !== undefined) ts.push({ gia: dongCuoi })

    // Hàm dựng sẵn ở dạng tên trần: println, listOf, …
    if (e.ham.k === 'ten') {
      const o = mt.timO(e.ham.ten)
      if (o === undefined) {
        const r = this.goiSanCo(e.ham.ten, ts, e.vt, mt)
        if (r !== undefined) return r
        // Tạo thể hiện của lớp.
        const kb = this.lop.get(e.ham.ten)
        if (kb !== undefined) return this.taoTheHien(kb, ts, e.vt)
        // Kotlin cho gọi `ten()` thay cho `this.ten()` trong thân lớp — kể cả hàm mặc định
        // của interface gọi một hàm mà lớp cài đặt (mẫu ở ngay bài interface đầu tiên).
        const tuThan = mt.timO('this')
        if (tuThan !== undefined && tuThan.gia.k === 'doiTuong') {
          const h = this.thanhVien(tuThan.gia, e.ham.ten, e.vt)
          return this.goiGiaTri(h, ts, e.vt)
        }
        throw new LoiKotlin(
          `Chua co ham hay lop nao ten "${e.ham.ten}". Kiem lai chinh ta.`,
          e.vt.dong,
        )
      }
      if (o.gia.k === 'lop') {
        const kb = this.lop.get(o.gia.ten)
        if (kb !== undefined) return this.taoTheHien(kb, ts, e.vt)
      }
      return this.goiGiaTri(o.gia, ts, e.vt)
    }

    // Phương thức: `x.f(...)` — thành viên dựng sẵn xử lý ngay để tránh dựng closure thừa.
    if (e.ham.k === 'truyCap') {
      const nhan = e.ham
      if (!nhan.anToan && this.btCoTheNull(nhan.doiTuong, mt)) {
        throw new LoiKotlin(
          `Gia tri nay khai kieu co the null nen KHONG duoc goi thang "${nhan.ten}()" bang dau ".". Ba cach sua: "?.${nhan.ten}()", "?: giaTriMacDinh", hoac "!!".`,
          e.vt.dong,
        )
      }
      const o = this.bt(nhan.doiTuong, mt)
      if (o.k === 'null') {
        if (nhan.anToan) return { k: 'null' }
        throw new LoiKotlin(
          `Goi "${nhan.ten}()" tren mot gia tri dang la null. Dung "?.${nhan.ten}()".`,
          e.vt.dong,
        )
      }
      // `super.f(...)`: bỏ qua thành viên dựng sẵn và tra thẳng từ lớp CHA, nếu không lời gọi
      // sẽ tìm lại đúng hàm vừa ghi đè và lặp vô tận.
      const lopSuper = nhan.doiTuong.k === 'super' ? this.lopSuperCua(mt, e.vt) : undefined
      if (lopSuper !== undefined) {
        return this.goiGiaTri(this.thanhVien(o, nhan.ten, e.vt, lopSuper), ts, e.vt)
      }
      const r = this.goiThanhVien(o, nhan.ten, ts, e.vt, mt)
      if (r !== undefined) return r
      const h = this.thanhVien(o, nhan.ten, e.vt)
      return this.goiGiaTri(h, ts, e.vt)
    }

    return this.goiGiaTri(this.bt(e.ham, mt), ts, e.vt)
  }

  goiGiaTri(f: Gia, ts: { nhan?: string; gia: Gia }[], vt: ViTri): Gia {
    if (f.k === 'lambda') {
      const mt = new MoiTruong(f.dong)
      if (f.thamSo.length === 0) {
        mt.khai('it', { gia: ts[0]?.gia ?? { k: 'unit' }, hangSo: true, coTheNull: false })
      } else {
        f.thamSo.forEach((t, i) =>
          mt.khai(t, { gia: ts[i]?.gia ?? { k: 'null' }, hangSo: true, coTheNull: false }),
        )
      }
      try {
        return this.khoi(f.than, mt)
      } catch (err) {
        if (err instanceof TinHieuReturn) return err.gia
        throw err
      }
    }
    if (f.k === 'ham') {
      const mt = new MoiTruong(f.dong)
      this.gapThamSo(f.thamSo, ts, mt, vt, f.ten)
      try {
        this.khoi(f.than, mt)
        return { k: 'unit' }
      } catch (err) {
        if (err instanceof TinHieuReturn) return err.gia
        throw err
      }
    }
    throw new LoiKotlin(`Gia tri kieu ${tenKieuCua(f)} khong goi duoc nhu mot ham.`, vt.dong)
  }

  private gapThamSo(
    khai: ThamSo[],
    ts: { nhan?: string; gia: Gia }[],
    mt: MoiTruong,
    vt: ViTri,
    tenHam: string,
  ): void {
    const dat = new Map<string, Gia>()
    let viTri = 0
    for (const t of ts) {
      if (t.nhan !== undefined) {
        if (!khai.some((k) => k.ten === t.nhan)) {
          throw new LoiKotlin(
            `Ham "${tenHam}" khong co tham so ten "${t.nhan}". Cac tham so hop le: ${khai.map((k) => k.ten).join(', ') || '(khong co)'}.`,
            vt.dong,
          )
        }
        dat.set(t.nhan, t.gia)
      } else {
        const k = khai[viTri]
        if (k === undefined) {
          throw new LoiKotlin(
            `Ham "${tenHam}" nhan ${khai.length} tham so nhung dang duoc goi voi nhieu hon.`,
            vt.dong,
          )
        }
        dat.set(k.ten, t.gia)
        viTri++
      }
    }
    for (const k of khai) {
      if (dat.has(k.ten)) {
        mt.khai(k.ten, {
          gia: dat.get(k.ten)!,
          hangSo: true,
          coTheNull: this.kieuCoTheNull(k.kieu),
        })
        continue
      }
      if (k.macDinh !== undefined) {
        mt.khai(k.ten, {
          gia: this.bt(k.macDinh, mt),
          hangSo: true,
          coTheNull: this.kieuCoTheNull(k.kieu),
        })
        continue
      }
      throw new LoiKotlin(
        `Goi ham "${tenHam}" thieu tham so "${k.ten}". Truyen them gia tri cho no, hoac cho no mot gia tri mac dinh trong khai bao ham.`,
        vt.dong,
      )
    }
  }

  // ───────────────────────── Lớp và thể hiện ─────────────────────────

  private taoDoiTuongRong(kb: KhaiBaoKieu): Gia {
    const dt: Gia = { k: 'doiTuong', lop: kb.ten, truong: new Map() }
    for (const p of kb.thuocTinh) {
      if (p.than !== undefined) continue
      dt.truong.set(p.ten, {
        gia: p.khoiTao !== undefined ? this.bt(p.khoiTao, this.toanCuc) : { k: 'null' },
        hangSo: p.hangSo,
        coTheNull: this.kieuCoTheNull(p.kieu),
      })
    }
    return dt
  }

  private taoEnum(kb: KhaiBaoKieu, idx: number): Gia {
    const ca = kb.ca[idx]!
    const g: Gia = { k: 'enum', lop: kb.ten, ten: ca.ten, thuTu: idx, truong: new Map() }
    kb.thamSoDung.forEach((t, i) => {
      const bt = ca.thamSo[i]
      g.truong.set(t.ten, {
        gia: bt !== undefined ? this.bt(bt, this.toanCuc) : { k: 'null' },
        hangSo: t.laThuocTinh !== 'var',
        coTheNull: this.kieuCoTheNull(t.kieu),
      })
    })
    for (const p of kb.thuocTinh) {
      if (p.than !== undefined) continue
      g.truong.set(p.ten, {
        gia: p.khoiTao !== undefined ? this.bt(p.khoiTao, this.toanCuc) : { k: 'null' },
        hangSo: p.hangSo,
        coTheNull: this.kieuCoTheNull(p.kieu),
      })
    }
    return g
  }

  private taoTheHien(kb: KhaiBaoKieu, ts: { nhan?: string; gia: Gia }[], vt: ViTri): Gia {
    if (kb.loai === 'interface') {
      throw new LoiKotlin(`Khong tao duoc the hien cua interface "${kb.ten}".`, vt.dong)
    }
    if (kb.truuTuong) {
      throw new LoiKotlin(
        `"${kb.ten}" la lop truu tuong (abstract) nen khong tao truc tiep duoc. Tao mot lop con cua no.`,
        vt.dong,
      )
    }
    const dt: Gia = {
      k: 'doiTuong',
      lop: kb.ten,
      truong: new Map(),
      ...(kb.laData ? { thuTuData: kb.thamSoDung.map((t) => t.ten) } : {}),
    }
    const mt = new MoiTruong(this.toanCuc)
    mt.khai('this', { gia: dt, hangSo: true, coTheNull: false })

    // Gán tham số hàm dựng.
    const gapMt = new MoiTruong(this.toanCuc)
    this.gapThamSo(kb.thamSoDung, ts, gapMt, vt, kb.ten)
    for (const t of kb.thamSoDung) {
      const g = gapMt.timO(t.ten)!.gia
      mt.khai(t.ten, { gia: g, hangSo: true, coTheNull: this.kieuCoTheNull(t.kieu) })
      if (t.laThuocTinh !== undefined) {
        dt.truong.set(t.ten, {
          gia: g,
          hangSo: t.laThuocTinh === 'val',
          coTheNull: this.kieuCoTheNull(t.kieu),
        })
      }
    }

    // Kế thừa: dựng phần của lớp cha trước.
    if (kb.cha !== undefined) {
      const kbCha = this.lop.get(kb.cha.ten)
      if (kbCha !== undefined) {
        const tsCha = kb.cha.thamSo.map((b) => ({ gia: this.bt(b, mt) }))
        const cha = this.taoTheHien(kbCha, tsCha, vt)
        if (cha.k === 'doiTuong')
          for (const [k, v] of cha.truong) if (!dt.truong.has(k)) dt.truong.set(k, v)
      }
    }

    // Thuộc tính khai trong thân.
    for (const p of kb.thuocTinh) {
      if (p.than !== undefined) continue
      dt.truong.set(p.ten, {
        gia: p.khoiTao !== undefined ? this.bt(p.khoiTao, mt) : { k: 'null' },
        hangSo: p.hangSo,
        coTheNull: this.kieuCoTheNull(p.kieu),
      })
    }

    // init { } — thân init phải THẤY và GÁN ĐƯỢC các thuộc tính của đối tượng.
    //
    // `val gap: Int` khai không kèm giá trị rồi gán trong init là mẫu chuẩn của Kotlin, nên
    // trong lúc chạy init các ô phải tạm bỏ cờ hằng; gán xong mới khoá lại. Dùng CHUNG đối
    // tượng ô (không sao chép) để phép gán chạm thẳng vào thuộc tính thật.
    if (kb.khoiKhoiTao.length > 0) {
      const khoaLai: { o: O; cu: boolean }[] = []
      for (const [k2, v] of dt.truong) {
        khoaLai.push({ o: v, cu: v.hangSo })
        v.hangSo = false
        mt.khai(k2, v)
      }
      this.khoi(kb.khoiKhoiTao, mt)
      for (const x of khoaLai) x.o.hangSo = x.cu
    }

    // Thuộc tính TÍNH: tính ngay lúc tạo (tập con — đủ cho mọi bài của khoá).
    for (const p of kb.thuocTinh) {
      if (p.than === undefined) continue
      const m2 = new MoiTruong(this.toanCuc)
      m2.khai('this', { gia: dt, hangSo: true, coTheNull: false })
      for (const [k, v] of dt.truong) m2.khai(k, v)
      let g: Gia = { k: 'unit' }
      try {
        this.khoi(p.than, m2)
      } catch (err) {
        if (err instanceof TinHieuReturn) g = err.gia
        else throw err
      }
      dt.truong.set(p.ten, { gia: g, hangSo: true, coTheNull: false })
    }
    return dt
  }

  // ───────────────────────── Dựng sẵn ─────────────────────────

  private goiSanCo(
    ten: string,
    ts: { nhan?: string; gia: Gia }[],
    vt: ViTri,
    mt: MoiTruong,
  ): Gia | undefined {
    const g = (i: number): Gia => ts[i]?.gia ?? { k: 'unit' }
    switch (ten) {
      case 'println':
        this.in(ts.length === 0 ? '\n' : this.chuoiHoa(g(0), vt) + '\n')
        return { k: 'unit' }
      case 'print':
        this.in(ts.length === 0 ? '' : this.chuoiHoa(g(0), vt))
        return { k: 'unit' }
      case 'listOf':
        return { k: 'ds', pt: ts.map((t) => t.gia), doi: false }
      case 'mutableListOf':
      case 'arrayListOf':
        return { k: 'ds', pt: ts.map((t) => t.gia), doi: true }
      case 'setOf':
      case 'mutableSetOf': {
        const pt: Gia[] = []
        for (const t of ts) if (!pt.some((p) => bang(p, t.gia))) pt.push(t.gia)
        return { k: 'ds', pt, doi: ten === 'mutableSetOf', tap: true }
      }
      case 'mapOf':
      case 'mutableMapOf': {
        const cap: { khoa: Gia; gia: Gia }[] = []
        for (const t of ts) {
          if (t.gia.k !== 'cap') {
            throw new LoiKotlin(
              'mapOf() nhan cac cap dang "khoa to giaTri", vi du mapOf("a" to 1).',
              vt.dong,
            )
          }
          const cu = cap.find(
            (c) => khoaCua(c.khoa) === khoaCua(t.gia.k === 'cap' ? t.gia.a : t.gia),
          )
          if (cu !== undefined) cu.gia = t.gia.b
          else cap.push({ khoa: t.gia.a, gia: t.gia.b })
        }
        const m: Gia = { k: 'map', cap, doi: ten === 'mutableMapOf' }
        this.sapMap(m)
        return m
      }
      case 'Pair':
        return { k: 'cap', a: g(0), b: g(1) }
      case 'Unit':
        return { k: 'unit' }
      case 'emptyList':
        return { k: 'ds', pt: [], doi: false }
      case 'error':
        throw new LoiNem(
          { k: 'ngoaiLe', lop: 'IllegalStateException', thongDiep: inGia(g(0)) },
          vt.dong,
        )
      case '__nem':
        throw new LoiNem(g(0), vt.dong)
      case 'Exception':
      case 'RuntimeException':
      case 'IllegalArgumentException':
      case 'IllegalStateException':
      case 'NumberFormatException':
        return { k: 'ngoaiLe', lop: ten, thongDiep: ts.length > 0 ? inGia(g(0)) : '' }
      case 'require': {
        if (!this.laDung(g(0), vt)) {
          // Thông điệp của require là LAMBDA (`require(x) { "..." }`), phải GỌI mới ra chữ —
          // in thẳng thì học viên nhận được đúng chữ "(ham)" thay vì lý do họ vừa viết.
          const bo = ts[1]?.gia
          const td =
            bo === undefined
              ? 'Failed requirement.'
              : bo.k === 'lambda' || bo.k === 'ham'
                ? inGia(this.goiGiaTri(bo, [], vt))
                : inGia(bo)
          throw new LoiNem(
            { k: 'ngoaiLe', lop: 'IllegalArgumentException', thongDiep: td },
            vt.dong,
          )
        }
        return { k: 'unit' }
      }
      case 'maxOf':
        return this.soCua(g(0), vt) >= this.soCua(g(1), vt) ? g(0) : g(1)
      case 'minOf':
        return this.soCua(g(0), vt) <= this.soCua(g(1), vt) ? g(0) : g(1)
      case 'run': {
        const f = g(0)
        return this.goiGiaTri(f, [], vt)
      }
      default:
        void mt
        return undefined
    }
  }

  /** Thành viên dựng sẵn KHÔNG cần tham số (thuộc tính): `.length`, `.size`, `.indices`… */
  private thanhVienSanCo(o: Gia, ten: string): Gia | undefined {
    if (o.k === 'chuoi') {
      if (ten === 'length') return { k: 'int', gia: o.gia.length }
      if (ten === 'indices') return { k: 'khoang', tu: 0, den: o.gia.length - 1, buoc: 1 }
    }
    if (o.k === 'ds') {
      if (ten === 'size') return { k: 'int', gia: o.pt.length }
      if (ten === 'indices') return { k: 'khoang', tu: 0, den: o.pt.length - 1, buoc: 1 }
      if (ten === 'lastIndex') return { k: 'int', gia: o.pt.length - 1 }
    }
    if (o.k === 'map') {
      if (ten === 'size') return { k: 'int', gia: o.cap.length }
      if (ten === 'keys') return { k: 'ds', pt: o.cap.map((c) => c.khoa), doi: false, tap: true }
      if (ten === 'values') return { k: 'ds', pt: o.cap.map((c) => c.gia), doi: false }
      if (ten === 'entries')
        return {
          k: 'ds',
          pt: o.cap.map((c) => ({ k: 'cap', a: c.khoa, b: c.gia }) as Gia),
          doi: false,
        }
    }
    if (o.k === 'cap') {
      if (ten === 'first') return o.a
      if (ten === 'second') return o.b
    }
    if (o.k === 'khoang') {
      if (ten === 'first') return { k: 'int', gia: o.tu }
      if (ten === 'last') return { k: 'int', gia: o.den }
    }
    if (o.k === 'enum') {
      if (ten === 'name') return { k: 'chuoi', gia: o.ten }
      if (ten === 'ordinal') return { k: 'int', gia: o.thuTu }
    }
    if (o.k === 'ngoaiLe' && ten === 'message') return { k: 'chuoi', gia: o.thongDiep }
    return undefined
  }

  /** Phương thức dựng sẵn (có ngoặc gọi). Trả `undefined` nếu không phải hàm dựng sẵn. */
  private goiThanhVien(
    o: Gia,
    ten: string,
    ts: { nhan?: string; gia: Gia }[],
    vt: ViTri,
    mt: MoiTruong,
  ): Gia | undefined {
    const a = (i: number): Gia => ts[i]?.gia ?? { k: 'unit' }

    // ── Hàm tĩnh của enum: `Mau.values()`, `Mau.valueOf("DO")` ──
    if (o.k === 'lop') {
      const kb = this.lop.get(o.ten)
      if (kb !== undefined && kb.loai === 'enum') {
        if (ten === 'values') {
          return { k: 'ds', pt: kb.ca.map((_, i) => this.taoEnum(kb, i)), doi: false }
        }
        if (ten === 'valueOf') {
          const can = inGia(a(0))
          const idx = kb.ca.findIndex((c) => c.ten === can)
          if (idx < 0) {
            throw new LoiNem(
              {
                k: 'ngoaiLe',
                lop: 'IllegalArgumentException',
                thongDiep: `No enum constant ${kb.ten}.${can}`,
              },
              vt.dong,
            )
          }
          return this.taoEnum(kb, idx)
        }
      }
      return undefined
    }
    const goiF = (f: Gia, ...args: Gia[]): Gia =>
      this.goiGiaTri(
        f,
        args.map((x) => ({ gia: x })),
        vt,
      )

    // ── Chuỗi ──
    if (o.k === 'chuoi') {
      const s = o.gia
      switch (ten) {
        case 'uppercase':
        case 'toUpperCase':
          return { k: 'chuoi', gia: s.toUpperCase() }
        case 'lowercase':
        case 'toLowerCase':
          return { k: 'chuoi', gia: s.toLowerCase() }
        case 'trim':
          return { k: 'chuoi', gia: s.trim() }
        case 'isEmpty':
          return { k: 'bool', gia: s.length === 0 }
        case 'isNotEmpty':
          return { k: 'bool', gia: s.length > 0 }
        case 'isBlank':
          return { k: 'bool', gia: s.trim().length === 0 }
        case 'isNotBlank':
          return { k: 'bool', gia: s.trim().length > 0 }
        case 'length':
          return { k: 'int', gia: s.length }
        case 'contains':
          return { k: 'bool', gia: s.includes(inGia(a(0))) }
        case 'startsWith':
          return { k: 'bool', gia: s.startsWith(inGia(a(0))) }
        case 'endsWith':
          return { k: 'bool', gia: s.endsWith(inGia(a(0))) }
        case 'indexOf':
          return { k: 'int', gia: s.indexOf(inGia(a(0))) }
        case 'substring': {
          const tu = this.soCua(a(0), vt)
          const den = ts.length > 1 ? this.soCua(a(1), vt) : s.length
          if (tu < 0 || den > s.length || tu > den) {
            throw new LoiKotlin(
              `substring(${tu}, ${den}) nam ngoai chuoi dai ${s.length} ky tu.`,
              vt.dong,
            )
          }
          return { k: 'chuoi', gia: s.slice(tu, den) }
        }
        case 'replace':
          return { k: 'chuoi', gia: s.split(inGia(a(0))).join(inGia(a(1))) }
        case 'split': {
          const dau = inGia(a(0))
          return {
            k: 'ds',
            pt: s.split(dau).map((x) => ({ k: 'chuoi', gia: x }) as Gia),
            doi: false,
          }
        }
        case 'reversed':
          return { k: 'chuoi', gia: [...s].reverse().join('') }
        case 'repeat':
          return { k: 'chuoi', gia: s.repeat(Math.max(0, this.soCua(a(0), vt))) }
        case 'padStart':
          return {
            k: 'chuoi',
            gia: s.padStart(this.soCua(a(0), vt), ts.length > 1 ? inGia(a(1)) : ' '),
          }
        case 'padEnd':
          return {
            k: 'chuoi',
            gia: s.padEnd(this.soCua(a(0), vt), ts.length > 1 ? inGia(a(1)) : ' '),
          }
        case 'first':
          if (s.length === 0) throw new LoiKotlin('first() tren chuoi rong.', vt.dong)
          return { k: 'kyTu', gia: s[0]! }
        case 'last':
          if (s.length === 0) throw new LoiKotlin('last() tren chuoi rong.', vt.dong)
          return { k: 'kyTu', gia: s[s.length - 1]! }
        case 'toInt': {
          const n = Number(s.trim())
          if (!/^[+-]?\d+$/.test(s.trim()) || !Number.isFinite(n)) {
            throw new LoiNem(
              {
                k: 'ngoaiLe',
                lop: 'NumberFormatException',
                thongDiep: `For input string: "${s}"`,
              },
              vt.dong,
            )
          }
          return { k: 'int', gia: n }
        }
        case 'toIntOrNull': {
          const t = s.trim()
          if (!/^[+-]?\d+$/.test(t)) return { k: 'null' }
          return { k: 'int', gia: Number(t) }
        }
        case 'toDouble': {
          const n = Number(s.trim())
          if (!Number.isFinite(n)) {
            throw new LoiNem(
              {
                k: 'ngoaiLe',
                lop: 'NumberFormatException',
                thongDiep: `For input string: "${s}"`,
              },
              vt.dong,
            )
          }
          return { k: 'double', gia: n }
        }
        case 'toDoubleOrNull': {
          const n = Number(s.trim())
          return Number.isFinite(n) && s.trim() !== '' ? { k: 'double', gia: n } : { k: 'null' }
        }
        case 'toString':
          return o
        case 'get':
          return this.layChiSo(o, a(0), vt)
      }
      return undefined
    }

    // ── Số ──
    if (o.k === 'int' || o.k === 'double') {
      switch (ten) {
        case 'toString':
          return { k: 'chuoi', gia: inGia(o) }
        case 'toInt':
          return { k: 'int', gia: Math.trunc(o.gia) }
        case 'toDouble':
          return { k: 'double', gia: o.gia }
        case 'toChar':
          return { k: 'kyTu', gia: String.fromCharCode(o.gia) }
        case 'coerceAtLeast':
          return o.gia < this.soCua(a(0), vt) ? a(0) : o
        case 'coerceAtMost':
          return o.gia > this.soCua(a(0), vt) ? a(0) : o
      }
      return undefined
    }

    if (o.k === 'kyTu') {
      switch (ten) {
        case 'toString':
          return { k: 'chuoi', gia: o.gia }
        case 'uppercaseChar':
          return { k: 'kyTu', gia: o.gia.toUpperCase() }
        case 'lowercaseChar':
          return { k: 'kyTu', gia: o.gia.toLowerCase() }
        case 'isDigit':
          return { k: 'bool', gia: /[0-9]/.test(o.gia) }
        case 'isLetter':
          return { k: 'bool', gia: /\p{L}/u.test(o.gia) }
      }
      return undefined
    }

    if (o.k === 'bool' && ten === 'toString') return { k: 'chuoi', gia: inGia(o) }

    // ── Map ──
    if (o.k === 'map') {
      switch (ten) {
        case 'get':
          return this.layChiSo(o, a(0), vt)
        case 'containsKey':
          return { k: 'bool', gia: o.cap.some((c) => khoaCua(c.khoa) === khoaCua(a(0))) }
        case 'isEmpty':
          return { k: 'bool', gia: o.cap.length === 0 }
        case 'isNotEmpty':
          return { k: 'bool', gia: o.cap.length > 0 }
        case 'put': {
          if (!o.doi)
            throw new LoiKotlin(
              'Map tao bang mapOf() khong sua duoc. Dung mutableMapOf().',
              vt.dong,
            )
          const c = o.cap.find((x) => khoaCua(x.khoa) === khoaCua(a(0)))
          if (c !== undefined) c.gia = a(1)
          else o.cap.push({ khoa: a(0), gia: a(1) })
          this.sapMap(o)
          return { k: 'unit' }
        }
        case 'remove': {
          if (!o.doi)
            throw new LoiKotlin(
              'Map tao bang mapOf() khong sua duoc. Dung mutableMapOf().',
              vt.dong,
            )
          const i = o.cap.findIndex((x) => khoaCua(x.khoa) === khoaCua(a(0)))
          if (i >= 0) o.cap.splice(i, 1)
          return { k: 'unit' }
        }
        case 'getOrDefault': {
          const c = o.cap.find((x) => khoaCua(x.khoa) === khoaCua(a(0)))
          return c === undefined ? a(1) : c.gia
        }
        case 'toString':
          return { k: 'chuoi', gia: inGia(o) }
      }
      // Hàm bậc cao trên Map: coi mỗi phần tử là một Pair.
      const nhuDs: Gia = {
        k: 'ds',
        pt: o.cap.map((c) => ({ k: 'cap', a: c.khoa, b: c.gia }) as Gia),
        doi: false,
      }
      return this.goiThanhVien(nhuDs, ten, ts, vt, mt)
    }

    // ── Danh sách / tập hợp / khoảng ──
    const dsGia: Gia[] | undefined =
      o.k === 'ds' ? o.pt : o.k === 'khoang' ? this.duyet(o, vt) : undefined
    if (dsGia !== undefined) {
      const laDoi = o.k === 'ds' && o.doi
      const moi = (pt: Gia[]): Gia => ({ k: 'ds', pt, doi: false })
      switch (ten) {
        case 'size':
          return { k: 'int', gia: dsGia.length }
        case 'isEmpty':
          return { k: 'bool', gia: dsGia.length === 0 }
        case 'isNotEmpty':
          return { k: 'bool', gia: dsGia.length > 0 }
        case 'contains':
          return { k: 'bool', gia: dsGia.some((x) => bang(x, a(0))) }
        case 'indexOf':
          return { k: 'int', gia: dsGia.findIndex((x) => bang(x, a(0))) }
        case 'get':
          return this.layChiSo(o, a(0), vt)
        case 'add': {
          if (!laDoi) {
            throw new LoiKotlin(
              'Danh sach tao bang listOf() KHONG them phan tu duoc. Dung mutableListOf() neu can thay doi.',
              vt.dong,
            )
          }
          ;(o as Gia & { k: 'ds' }).pt.push(a(0))
          return { k: 'bool', gia: true }
        }
        case 'remove':
        case 'removeAt': {
          if (!laDoi) {
            throw new LoiKotlin(
              'Danh sach tao bang listOf() KHONG xoa phan tu duoc. Dung mutableListOf().',
              vt.dong,
            )
          }
          const pt = (o as Gia & { k: 'ds' }).pt
          const i = ten === 'removeAt' ? this.soCua(a(0), vt) : pt.findIndex((x) => bang(x, a(0)))
          if (i < 0 || i >= pt.length) {
            if (ten === 'remove') return { k: 'bool', gia: false }
            throw new LoiKotlin(
              `removeAt(${i}) ngoai pham vi danh sach ${pt.length} phan tu.`,
              vt.dong,
            )
          }
          const bo = pt.splice(i, 1)[0]!
          return ten === 'remove' ? { k: 'bool', gia: true } : bo
        }
        case 'first':
          if (dsGia.length === 0) {
            throw new LoiKotlin(
              'first() tren danh sach rong. Dung firstOrNull() de nhan null thay vi loi.',
              vt.dong,
            )
          }
          return dsGia[0]!
        case 'firstOrNull':
          return dsGia.length === 0 ? { k: 'null' } : dsGia[0]!
        case 'last':
          if (dsGia.length === 0) {
            throw new LoiKotlin(
              'last() tren danh sach rong. Dung lastOrNull() de nhan null thay vi loi.',
              vt.dong,
            )
          }
          return dsGia[dsGia.length - 1]!
        case 'lastOrNull':
          return dsGia.length === 0 ? { k: 'null' } : dsGia[dsGia.length - 1]!
        case 'reversed':
          return moi([...dsGia].reverse())
        case 'take':
          return moi(dsGia.slice(0, Math.max(0, this.soCua(a(0), vt))))
        case 'drop':
          return moi(dsGia.slice(Math.max(0, this.soCua(a(0), vt))))
        case 'distinct': {
          const pt: Gia[] = []
          for (const x of dsGia) if (!pt.some((p) => bang(p, x))) pt.push(x)
          return moi(pt)
        }
        case 'toList':
          return moi([...dsGia])
        case 'toMutableList':
          return { k: 'ds', pt: [...dsGia], doi: true }
        case 'toSet': {
          const pt: Gia[] = []
          for (const x of dsGia) if (!pt.some((p) => bang(p, x))) pt.push(x)
          return { k: 'ds', pt, doi: false, tap: true }
        }
        case 'sum': {
          let laDouble = false
          let t = 0
          for (const x of dsGia) {
            if (x.k === 'double') laDouble = true
            t += this.soCua(x, vt)
          }
          return laDouble ? { k: 'double', gia: t } : { k: 'int', gia: t }
        }
        case 'average': {
          if (dsGia.length === 0) return { k: 'double', gia: Number.NaN }
          let t = 0
          for (const x of dsGia) t += this.soCua(x, vt)
          return { k: 'double', gia: t / dsGia.length }
        }
        case 'maxOrNull':
          return dsGia.length === 0
            ? { k: 'null' }
            : dsGia.reduce((p, c) => (this.soCua(c, vt) > this.soCua(p, vt) ? c : p))
        case 'minOrNull':
          return dsGia.length === 0
            ? { k: 'null' }
            : dsGia.reduce((p, c) => (this.soCua(c, vt) < this.soCua(p, vt) ? c : p))
        case 'sorted':
          return moi(
            [...dsGia].sort((x, y) =>
              x.k === 'chuoi' && y.k === 'chuoi'
                ? x.gia < y.gia
                  ? -1
                  : x.gia > y.gia
                    ? 1
                    : 0
                : this.soCua(x, vt) - this.soCua(y, vt),
            ),
          )
        case 'joinToString': {
          const dau = ts.length > 0 && ts[0]!.gia.k === 'chuoi' ? inGia(ts[0]!.gia) : ', '
          const bien = ts.find((t) => t.gia.k === 'lambda' || t.gia.k === 'ham')
          const phan =
            bien !== undefined ? dsGia.map((x) => inGia(goiF(bien.gia, x))) : dsGia.map(inGia)
          return { k: 'chuoi', gia: phan.join(dau) }
        }
        // ── Hàm bậc cao ──
        case 'forEach': {
          for (const x of dsGia) {
            this.demBuoc(vt)
            goiF(a(0), x)
          }
          return { k: 'unit' }
        }
        case 'forEachIndexed': {
          dsGia.forEach((x, i) => {
            this.demBuoc(vt)
            this.goiGiaTri(a(0), [{ gia: { k: 'int', gia: i } }, { gia: x }], vt)
          })
          return { k: 'unit' }
        }
        case 'map':
          return moi(dsGia.map((x) => goiF(a(0), x)))
        case 'mapIndexed':
          return moi(
            dsGia.map((x, i) =>
              this.goiGiaTri(a(0), [{ gia: { k: 'int', gia: i } }, { gia: x }], vt),
            ),
          )
        case 'filter':
          return moi(dsGia.filter((x) => this.laDung(goiF(a(0), x), vt)))
        case 'filterNot':
          return moi(dsGia.filter((x) => !this.laDung(goiF(a(0), x), vt)))
        case 'filterNotNull':
          return moi(dsGia.filter((x) => x.k !== 'null'))
        case 'any':
          return {
            k: 'bool',
            gia:
              ts.length === 0
                ? dsGia.length > 0
                : dsGia.some((x) => this.laDung(goiF(a(0), x), vt)),
          }
        case 'all':
          return { k: 'bool', gia: dsGia.every((x) => this.laDung(goiF(a(0), x), vt)) }
        case 'none':
          return {
            k: 'bool',
            gia:
              ts.length === 0
                ? dsGia.length === 0
                : !dsGia.some((x) => this.laDung(goiF(a(0), x), vt)),
          }
        case 'count':
          return {
            k: 'int',
            gia:
              ts.length === 0
                ? dsGia.length
                : dsGia.filter((x) => this.laDung(goiF(a(0), x), vt)).length,
          }
        case 'find':
        case 'firstOrNullBy':
          return dsGia.find((x) => this.laDung(goiF(a(0), x), vt)) ?? { k: 'null' }
        case 'sumOf': {
          let laDouble = false
          let t = 0
          for (const x of dsGia) {
            const r = goiF(a(0), x)
            if (r.k === 'double') laDouble = true
            t += this.soCua(r, vt)
          }
          return laDouble ? { k: 'double', gia: t } : { k: 'int', gia: t }
        }
        case 'maxByOrNull':
          return dsGia.length === 0
            ? { k: 'null' }
            : dsGia.reduce((p, c) =>
                this.soCua(goiF(a(0), c), vt) > this.soCua(goiF(a(0), p), vt) ? c : p,
              )
        case 'minByOrNull':
          return dsGia.length === 0
            ? { k: 'null' }
            : dsGia.reduce((p, c) =>
                this.soCua(goiF(a(0), c), vt) < this.soCua(goiF(a(0), p), vt) ? c : p,
              )
        case 'sortedBy':
        case 'sortedByDescending': {
          const dau = ten === 'sortedBy' ? 1 : -1
          return moi(
            [...dsGia].sort((x, y) => {
              const kx = goiF(a(0), x)
              const ky = goiF(a(0), y)
              if (kx.k === 'chuoi' && ky.k === 'chuoi') {
                return dau * (kx.gia < ky.gia ? -1 : kx.gia > ky.gia ? 1 : 0)
              }
              return dau * (this.soCua(kx, vt) - this.soCua(ky, vt))
            }),
          )
        }
        case 'fold': {
          let acc = a(0)
          for (const x of dsGia) {
            this.demBuoc(vt)
            acc = this.goiGiaTri(a(1), [{ gia: acc }, { gia: x }], vt)
          }
          return acc
        }
        case 'reduce': {
          if (dsGia.length === 0) throw new LoiKotlin('reduce() tren danh sach rong.', vt.dong)
          let acc = dsGia[0]!
          for (const x of dsGia.slice(1)) acc = this.goiGiaTri(a(0), [{ gia: acc }, { gia: x }], vt)
          return acc
        }
        case 'flatMap': {
          const pt: Gia[] = []
          for (const x of dsGia) {
            const r = goiF(a(0), x)
            if (r.k === 'ds') pt.push(...r.pt)
            else pt.push(r)
          }
          return moi(pt)
        }
        case 'groupBy': {
          const cap: { khoa: Gia; gia: Gia }[] = []
          for (const x of dsGia) {
            const kh = goiF(a(0), x)
            const c = cap.find((y) => khoaCua(y.khoa) === khoaCua(kh))
            if (c !== undefined && c.gia.k === 'ds') c.gia.pt.push(x)
            else cap.push({ khoa: kh, gia: { k: 'ds', pt: [x], doi: false } })
          }
          const m: Gia = { k: 'map', cap, doi: false }
          this.sapMap(m)
          return m
        }
        case 'associateWith': {
          // Map KHONG cho trung khoa: phan tu trung nhau trong danh sach nguon phai gop lai
          // thanh MOT cap, gia tri cua lan cuoi thang - dung nhu Kotlin that. Thieu buoc nay
          // thi `listOf(1, 1, 2).associateWith { ... }` ra Map co hai cap khoa `1`, tuc mot
          // cau truc Kotlin khong bao gio dung duoc. `mapOf`/`groupBy` da khu trung tu dau,
          // rieng duong nay bi bo sot toi 2026-09-05.
          const cap: { khoa: Gia; gia: Gia }[] = []
          for (const x of dsGia) {
            const gia = goiF(a(0), x)
            const cu = cap.find((c) => khoaCua(c.khoa) === khoaCua(x))
            if (cu !== undefined) cu.gia = gia
            else cap.push({ khoa: x, gia })
          }
          const m: Gia = { k: 'map', cap, doi: false }
          this.sapMap(m)
          return m
        }
        case 'toString':
          return { k: 'chuoi', gia: inGia(o) }
      }
      return undefined
    }

    // ── Đối tượng do học viên định nghĩa: data class có sẵn toString/copy ──
    if (o.k === 'doiTuong') {
      const kb = this.lop.get(o.lop)
      if (kb !== undefined && kb.laData) {
        if (ten === 'toString' && this.timHam(o.lop, 'toString') === undefined) {
          const phan = kb.thamSoDung.map(
            (t) => `${t.ten}=${inGia(o.truong.get(t.ten)?.gia ?? { k: 'null' })}`,
          )
          return { k: 'chuoi', gia: `${o.lop}(${phan.join(', ')})` }
        }
        if (ten === 'copy') {
          const dt: Gia = {
            k: 'doiTuong',
            lop: o.lop,
            truong: new Map(),
            ...(o.thuTuData !== undefined ? { thuTuData: o.thuTuData } : {}),
          }
          for (const [k2, v] of o.truong) dt.truong.set(k2, { ...v })
          for (const t of ts) {
            if (t.nhan === undefined) {
              throw new LoiKotlin(
                'copy() phai goi bang tham so co ten, vi du copy(ten = "moi").',
                vt.dong,
              )
            }
            const cu = dt.truong.get(t.nhan)
            if (cu === undefined) {
              throw new LoiKotlin(`Lop ${o.lop} khong co thuoc tinh "${t.nhan}".`, vt.dong)
            }
            dt.truong.set(t.nhan, { ...cu, gia: t.gia })
          }
          return dt
        }
      }
      if (ten === 'toString' && this.timHam(o.lop, 'toString') === undefined) {
        return { k: 'chuoi', gia: inGia(o) }
      }
    }
    if (o.k === 'enum' && ten === 'toString') return { k: 'chuoi', gia: o.ten }
    if (o.k === 'cap' && ten === 'toString') return { k: 'chuoi', gia: inGia(o) }
    return undefined
  }
}

/** Tên dựng sẵn dùng được mà không cần khai báo. */
const SAN_CO = new Set([
  'println',
  'Unit',
  'print',
  'listOf',
  'mutableListOf',
  'setOf',
  'mutableSetOf',
  'mapOf',
  'mutableMapOf',
  'Pair',
  'emptyList',
  'error',
  'require',
  'maxOf',
  'minOf',
])

/** Hàm/thuộc tính dựng sẵn TRẢ VỀ giá trị có thể null — nguồn cho suy tính-null khai báo. */
const TRA_VE_NULL = new Set([
  'toIntOrNull',
  'toDoubleOrNull',
  'firstOrNull',
  'lastOrNull',
  'maxOrNull',
  'minOrNull',
  'maxByOrNull',
  'minByOrNull',
  'find',
  'getOrNull',
])
