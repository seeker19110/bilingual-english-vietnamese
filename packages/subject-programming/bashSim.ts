// bashSim — BỘ CHẠY BASH RÚT GỌN cho tầng 1 của chương trình M (PR-M1).
//
// VẤN ĐỀ PHẢI GIẢI: hiến chương chương trình M §4 quyết định dạy dòng lệnh bằng MÔ PHỎNG chứ
// không phải WASM/judge server — vì shell là thao tác trên HỆ THỐNG FILE: tất định, không cần
// máy ảo, và học viên `rm -rf` thoải mái để học mà lượt sau vẫn sạch.
//
// LỜI GIẢI: đúng khuôn gitSim.ts đã chạy thật từ PR-L9 — một máy ảo tí hon thuần TypeScript.
// Cổng CI và trình duyệt gọi CHUNG hàm chayBash() này, nên không có khe hở "xanh ở CI, rớt ở
// máy học viên" (hiến chương M §3.1 — đúng loại lỗi mà mạch Python python3-vs-Pyodide dính).
//
// LUẬT TỰ KHAI (hiến chương M §3.3, bắt buộc): mỗi lượt chạy in DONG_TU_KHAI ở dòng đầu. Bộ
// chạy này KHÔNG phải bash thật và không được để học viên tưởng nhầm.
//
// BỘ CHẠY NÀY KHÔNG LÀM GÌ (bài học phải nói lại đúng danh sách này):
//   · không mạng (curl/wget/ssh/git), không tiến trình nền (`&`), không `sudo`, không người
//     dùng/nhóm thật (chmod chỉ đổi con số quyền và quyết định `./script.sh` chạy được không);
//   · không `sed`/`awk`, không `while`/`case`/`function`, không mảng, không `$(( ))`;
//   · không tiến trình thật: không PID, không tín hiệu, không thời gian (`date`) — cố ý, vì
//     bài học phải TẤT ĐỊNH mới chấm được.
//
// KHÁC BIỆT ĐÃ BIẾT so với bash thật (hiến chương M §3.3 luật 5 — bài chạm tới phải nói ra):
//   1. `grep` dùng regex kiểu JavaScript, không phải BRE/ERE của GNU grep. Pattern hỏng thì
//      lùi về so khớp chuỗi con.
//   2. `wc` in các số cách nhau MỘT dấu cách, không căn lề theo cột như GNU wc.
//   3. Script `.sh` chạy chung biến với shell gọi nó (bash thật tạo tiến trình con: biến sửa
//      trong script không ảnh hưởng shell cha).
//   4. Thông báo lỗi bằng tiếng Việt không dấu và có kèm số dòng của học viên — cố ý dạy được
//      hơn thông báo gốc (hiến chương M §3.4 "lỗi phải nói được").
//
// TẤT ĐỊNH TUYỆT ĐỐI: không Date.now(), không random, không đồng hồ — cùng script luôn cho
// cùng output, nếu không thì không thể làm cổng chấm.

/** Kết quả một lượt chạy — cùng hình dạng với gitSim/các prelude khác của môn. */
export interface BashRunResult {
  output: string
  error?: string
  /** Mã thoát của lệnh cuối cùng — thứ mà `$?` đọc, và là bài học riêng của tầng 1. */
  exitCode: number
}

/** Dòng tự khai in ở đầu MỌI lượt chạy (hiến chương M §3.3 luật 1). */
export const DONG_TU_KHAI = '[GIA LAP] Bo chay bash rut gon cua DHCB — khong phai bash that.'

/** Thư mục nhà của học viên trong máy ảo. */
const HOME = '/home/ban'

/** Trần số lệnh một lượt chạy — chặn `for` lồng nhau/script tự gọi làm treo trình duyệt. */
const TRAN_LENH = 20000
/** Trần độ dài output — chặn `for` in ra hàng MB làm đơ khung hiển thị. */
const TRAN_OUTPUT = 200000

// ───────────────────────────── Hệ thống file trong bộ nhớ ─────────────────────────────

interface FileNode {
  kind: 'file'
  content: string
  /** Quyền dạng số bát phân (0o644…) — chỉ dùng để quyết định `./script.sh` chạy được không. */
  mode: number
}
interface DirNode {
  kind: 'dir'
  mode: number
}
type Node = FileNode | DirNode

/** Máy ảo: hệ thống file + thư mục hiện tại + biến + mã thoát gần nhất. */
interface May {
  fs: Map<string, Node>
  cwd: string
  vars: Record<string, string>
  lastExit: number
  steps: number
}

function taoMay(): May {
  const fs = new Map<string, Node>()
  fs.set('/', { kind: 'dir', mode: 0o755 })
  fs.set('/home', { kind: 'dir', mode: 0o755 })
  fs.set(HOME, { kind: 'dir', mode: 0o755 })
  return { fs, cwd: HOME, vars: {}, lastExit: 0, steps: 0 }
}

/** Gom đường dẫn về dạng chuẩn: bỏ '.', xử lý '..', bỏ '/' thừa. */
function chuanHoa(duongDan: string): string {
  const tuyetDoi = duongDan.startsWith('/')
  const phan: string[] = []
  for (const p of duongDan.split('/')) {
    if (p === '' || p === '.') continue
    if (p === '..') {
      phan.pop()
      continue
    }
    phan.push(p)
  }
  return tuyetDoi ? `/${phan.join('/')}` : phan.join('/')
}

/** Đổi đường dẫn học viên gõ (tương đối, `~`, tuyệt đối) thành đường dẫn tuyệt đối chuẩn. */
function giai(may: May, duongDan: string): string {
  if (duongDan === '~' || duongDan.startsWith('~/')) return chuanHoa(HOME + duongDan.slice(1))
  if (duongDan.startsWith('/')) return chuanHoa(duongDan)
  return chuanHoa(`${may.cwd}/${duongDan}`)
}

function cha(duongDan: string): string {
  const i = duongDan.lastIndexOf('/')
  return i <= 0 ? '/' : duongDan.slice(0, i)
}

function ten(duongDan: string): string {
  return duongDan.slice(duongDan.lastIndexOf('/') + 1)
}

function laThuMuc(may: May, p: string): boolean {
  return may.fs.get(p)?.kind === 'dir'
}

function layFile(may: May, p: string): FileNode | null {
  const n = may.fs.get(p)
  return n && n.kind === 'file' ? n : null
}

/** Tên các mục nằm TRỰC TIẾP trong thư mục p, đã sắp xếp (tất định). */
function trongThuMuc(may: May, p: string): string[] {
  const ra: string[] = []
  for (const k of may.fs.keys()) {
    if (k !== p && cha(k) === p) ra.push(ten(k))
  }
  return ra.sort()
}

/** Xoá đệ quy một mục (rm -r): xoá chính nó và mọi thứ nằm dưới. */
function xoaDeQuy(may: May, p: string): void {
  for (const k of [...may.fs.keys()]) {
    if (k === p || k.startsWith(`${p}/`)) may.fs.delete(k)
  }
}

// ───────────────────────────── Tách từ (lexer) ─────────────────────────────

type Op = '|' | '||' | '&&' | '>' | '>>' | ';' | '\n'
type Quote = 'none' | 'single' | 'double'
interface PhanTu {
  text: string
  quote: Quote
}
type Token = { t: 'word'; parts: PhanTu[] } | { t: 'op'; v: Op }

/** Lỗi có thông điệp DẠY ĐƯỢC (tiếng Việt, nói rõ cách sửa) thay vì thông điệp gốc khó hiểu. */
class LoiBash extends Error {}

/**
 * Tách script thành token. Giữ nguyên thông tin NHÁY (nháy đơn cấm nội suy biến) vì đó chính
 * là cái bẫy số một của người mới: `echo '$TEN'` khác `echo "$TEN"`.
 */
function tachToken(src: string): Token[] {
  const ra: Token[] = []
  let i = 0
  while (i < src.length) {
    const c = src[i]!
    if (c === '\n') {
      ra.push({ t: 'op', v: '\n' })
      i += 1
      continue
    }
    if (c === ' ' || c === '\t' || c === '\r') {
      i += 1
      continue
    }
    if (c === '#') {
      while (i < src.length && src[i] !== '\n') i += 1
      continue
    }
    if (c === ';') {
      ra.push({ t: 'op', v: ';' })
      i += 1
      continue
    }
    if (c === '|') {
      const doi = src[i + 1] === '|'
      ra.push({ t: 'op', v: doi ? '||' : '|' })
      i += doi ? 2 : 1
      continue
    }
    if (c === '&') {
      if (src[i + 1] !== '&') {
        throw new LoiBash(
          'Bo chay nay khong co tien trinh nen nen khong dung duoc "&". Bo dau & di, hoac dung "&&" neu ban muon "chay tiep khi lenh truoc thanh cong".',
        )
      }
      ra.push({ t: 'op', v: '&&' })
      i += 2
      continue
    }
    if (c === '>') {
      const doi = src[i + 1] === '>'
      ra.push({ t: 'op', v: doi ? '>>' : '>' })
      i += doi ? 2 : 1
      continue
    }
    if (c === '<') {
      throw new LoiBash(
        'Bo chay nay chua ho tro chuyen huong vao "<". Dung "cat file | lenh" de dat cung ket qua.',
      )
    }
    const { parts, next } = docTu(src, i)
    ra.push({ t: 'word', parts })
    i = next
  }
  return ra
}

/** Đọc nguyên khối `$( ... )` bắt đầu tại vị trí `i`, cân theo cặp ngoặc (lồng nhau vẫn đúng). */
function docKhoiNgoac(src: string, i: number): { doan: string; next: number } {
  let sau = 1
  let j = i + 2
  while (j < src.length && sau > 0) {
    if (src[j] === '(') sau += 1
    else if (src[j] === ')') sau -= 1
    j += 1
  }
  if (sau > 0) throw new LoiBash('Thieu dau ngoac dong ")" cho $( ... ).')
  return { doan: src.slice(i, j), next: j }
}

/** Đọc MỘT từ (có thể ghép nhiều đoạn nháy khác nhau, như bash: `"a"b'c'`). */
function docTu(src: string, batDau: number): { parts: PhanTu[]; next: number } {
  const parts: PhanTu[] = []
  let i = batDau
  let dem = ''
  const xa = () => {
    if (dem !== '') {
      parts.push({ text: dem, quote: 'none' })
      dem = ''
    }
  }
  while (i < src.length) {
    const c = src[i]!
    if (' \t\r\n;|&><'.includes(c)) break
    if (c === "'") {
      xa()
      const dong = src.indexOf("'", i + 1)
      if (dong === -1) throw new LoiBash("Thieu dau nhay don dong lai ( ' ).")
      parts.push({ text: src.slice(i + 1, dong), quote: 'single' })
      i = dong + 1
      continue
    }
    if (c === '"') {
      xa()
      let j = i + 1
      let chu = ''
      while (j < src.length && src[j] !== '"') {
        if (src[j] === '\\' && j + 1 < src.length) {
          chu += src[j + 1]
          j += 2
          continue
        }
        if (src[j] === '$' && src[j + 1] === '(') {
          // `$( )` NẰM TRONG nháy kép: chép nguyên khối theo cặp ngoặc, vì nháy kép bên trong
          // nó là của lệnh con chứ không phải dấu đóng của chuỗi ngoài — vd: "co $(… -d" ") dong".
          const { doan, next } = docKhoiNgoac(src, j)
          chu += doan
          j = next
          continue
        }
        chu += src[j]
        j += 1
      }
      if (j >= src.length) throw new LoiBash('Thieu dau nhay kep dong lai ( " ).')
      parts.push({ text: chu, quote: 'double' })
      i = j + 1
      continue
    }
    if (c === '$' && src[i + 1] === '(') {
      // Giữ NGUYÊN `$( ... )` để bước nội suy chạy nó — đếm ngoặc để lồng nhau vẫn đúng.
      const { doan, next } = docKhoiNgoac(src, i)
      dem += doan
      i = next
      continue
    }
    if (c === '\\' && i + 1 < src.length) {
      dem += src[i + 1]
      i += 2
      continue
    }
    dem += c
    i += 1
  }
  xa()
  if (parts.length === 0) parts.push({ text: '', quote: 'single' })
  return { parts, next: i }
}

// ───────────────────────────── Cây lệnh (parser) ─────────────────────────────

interface LenhDon {
  words: Extract<Token, { t: 'word' }>[]
  redir?: { op: '>' | '>>'; target: Extract<Token, { t: 'word' }> }
}
interface Ong {
  chang: LenhDon[]
}
type Menh =
  | { k: 'andor'; dau: Ong; sau: { op: '&&' | '||'; ong: Ong }[] }
  | { k: 'for'; bien: string; gia: Extract<Token, { t: 'word' }>[]; than: Menh[] }
  | { k: 'if'; dieuKien: Menh[]; than: Menh[]; nguoc: Menh[] }

const TU_KHOA = new Set(['do', 'done', 'then', 'else', 'elif', 'fi', 'in'])

function chuNguyen(tok: Token | undefined): string | null {
  if (!tok || tok.t !== 'word') return null
  if (tok.parts.length !== 1 || tok.parts[0]!.quote !== 'none') return null
  return tok.parts[0]!.text
}

class BoPhanTich {
  private i = 0
  constructor(private readonly toks: Token[]) {}

  private peek(): Token | undefined {
    return this.toks[this.i]
  }

  private laNgat(): boolean {
    const t = this.peek()
    return t?.t === 'op' && (t.v === ';' || t.v === '\n')
  }

  private boNgat(): void {
    while (this.laNgat()) this.i += 1
  }

  /** Đọc một dãy mệnh đề cho tới khi gặp từ khoá kết thúc (do/done/then/fi…). */
  chuongTrinh(dung: Set<string>): Menh[] {
    const ra: Menh[] = []
    for (;;) {
      this.boNgat()
      const t = this.peek()
      if (!t) break
      const chu = chuNguyen(t)
      if (chu !== null && dung.has(chu)) break
      ra.push(this.menhDe())
    }
    return ra
  }

  private nuot(chu: string): void {
    if (chuNguyen(this.peek()) !== chu) {
      throw new LoiBash(
        `Thieu tu khoa "${chu}" (cau truc for/if phai du: for…in…do…done, if…then…fi).`,
      )
    }
    this.i += 1
  }

  private menhDe(): Menh {
    const chu = chuNguyen(this.peek())
    if (chu === 'for') return this.vongFor()
    if (chu === 'if') return this.reNhanh()
    return this.andOr()
  }

  private vongFor(): Menh {
    this.i += 1
    const bien = chuNguyen(this.peek())
    if (bien === null || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(bien)) {
      throw new LoiBash('Sau "for" phai la ten bien. Vi du: for f in *.txt; do echo $f; done')
    }
    this.i += 1
    this.nuot('in')
    const gia: Extract<Token, { t: 'word' }>[] = []
    for (;;) {
      const t = this.peek()
      if (!t || t.t !== 'word') break
      if (chuNguyen(t) === 'do') break
      gia.push(t)
      this.i += 1
    }
    this.boNgat()
    this.nuot('do')
    const than = this.chuongTrinh(new Set(['done']))
    this.nuot('done')
    return { k: 'for', bien, gia, than }
  }

  private reNhanh(): Menh {
    this.i += 1
    const dieuKien = this.chuongTrinh(new Set(['then']))
    this.nuot('then')
    const than = this.chuongTrinh(new Set(['else', 'elif', 'fi']))
    let nguoc: Menh[] = []
    const tiep = chuNguyen(this.peek())
    if (tiep === 'elif') {
      // `elif` = một `if` lồng trong nhánh else — dựng lại đúng như bash hiểu.
      nguoc = [this.reNhanh()]
      return { k: 'if', dieuKien, than, nguoc }
    }
    if (tiep === 'else') {
      this.i += 1
      nguoc = this.chuongTrinh(new Set(['fi']))
    }
    this.nuot('fi')
    return { k: 'if', dieuKien, than, nguoc }
  }

  private andOr(): Menh {
    const dau = this.ong()
    const sau: { op: '&&' | '||'; ong: Ong }[] = []
    for (;;) {
      const t = this.peek()
      if (t?.t !== 'op' || (t.v !== '&&' && t.v !== '||')) break
      const op = t.v
      this.i += 1
      this.boNgat()
      sau.push({ op, ong: this.ong() })
    }
    return { k: 'andor', dau, sau }
  }

  private ong(): Ong {
    const chang: LenhDon[] = [this.lenhDon()]
    for (;;) {
      const t = this.peek()
      if (t?.t !== 'op' || t.v !== '|') break
      this.i += 1
      this.boNgat()
      chang.push(this.lenhDon())
    }
    return { chang }
  }

  private lenhDon(): LenhDon {
    const words: Extract<Token, { t: 'word' }>[] = []
    let redir: LenhDon['redir']
    for (;;) {
      const t = this.peek()
      if (!t) break
      if (t.t === 'op') {
        if (t.v === '>' || t.v === '>>') {
          this.i += 1
          const muc = this.peek()
          if (!muc || muc.t !== 'word') {
            throw new LoiBash('Thieu ten file sau dau ">". Vi du: echo "xin chao" > ghi_chu.txt')
          }
          redir = { op: t.v, target: muc }
          this.i += 1
          continue
        }
        break
      }
      if (words.length === 0 && TU_KHOA.has(chuNguyen(t) ?? '')) break
      words.push(t)
      this.i += 1
    }
    if (words.length === 0 && !redir) throw new LoiBash('Cu phap khong hop le (thieu lenh).')
    return redir ? { words, redir } : { words }
  }
}

// ───────────────────────────── Nội suy (biến, $( ), glob) ─────────────────────────────

interface NguCanh {
  may: May
  /** Tham số vị trí `$1 $2…` khi đang chạy một script `.sh`. */
  thamSo: string[]
  /** Nơi ghi output thường (stdout) của lệnh cuối chuỗi ống. */
  inRa: (s: string) => void
  /** Nơi ghi thông báo lỗi (stderr) — luôn ra "màn hình", kể cả trong $( ). */
  inLoi: (s: string) => void
  /** Số dòng học viên đang chạy — để thông báo lỗi chỉ đúng chỗ. */
  dong: number
  /** Độ sâu gọi script, chặn script tự gọi vô hạn. */
  sau: number
}

/** Thay `$TEN`, `${TEN}`, `$?`, `$1`, `$#`, `$@` trong một đoạn chữ. */
function noiSuyBien(s: string, ctx: NguCanh): string {
  let ra = ''
  let i = 0
  while (i < s.length) {
    if (s[i] !== '$') {
      ra += s[i]
      i += 1
      continue
    }
    const sau = s[i + 1]
    if (sau === undefined) {
      ra += '$'
      break
    }
    if (sau === '{') {
      const dong = s.indexOf('}', i + 2)
      if (dong === -1) throw new LoiBash('Thieu dau ngoac nhon dong "}" trong ${...}.')
      ra += tenBien(s.slice(i + 2, dong), ctx)
      i = dong + 1
      continue
    }
    if (sau === '?' || sau === '#' || sau === '@' || /[0-9]/.test(sau)) {
      ra += tenBien(sau, ctx)
      i += 2
      continue
    }
    if (/[A-Za-z_]/.test(sau)) {
      let j = i + 1
      while (j < s.length && /[A-Za-z0-9_]/.test(s[j]!)) j += 1
      ra += tenBien(s.slice(i + 1, j), ctx)
      i = j
      continue
    }
    ra += '$'
    i += 1
  }
  return ra
}

function tenBien(t: string, ctx: NguCanh): string {
  if (t === '?') return String(ctx.may.lastExit)
  if (t === '#') return String(ctx.thamSo.length)
  if (t === '@') return ctx.thamSo.join(' ')
  if (/^[0-9]$/.test(t)) return ctx.thamSo[Number(t) - 1] ?? ''
  if (t === 'HOME') return HOME
  if (t === 'PWD') return ctx.may.cwd
  return ctx.may.vars[t] ?? ''
}

/** Chạy `$( ... )` và trả về output đã cắt dòng trắng cuối — đúng như bash. */
function noiSuyLenh(s: string, ctx: NguCanh): string {
  let ra = ''
  let i = 0
  while (i < s.length) {
    if (s[i] === '$' && s[i + 1] === '(') {
      let sau = 1
      let j = i + 2
      while (j < s.length && sau > 0) {
        if (s[j] === '(') sau += 1
        else if (s[j] === ')') sau -= 1
        j += 1
      }
      const ben = s.slice(i + 2, j - 1)
      let thu = ''
      const con: NguCanh = { ...ctx, inRa: (x) => (thu += x) }
      chayChuoi(ben, con, '')
      ra += thu.replace(/\n+$/, '')
      i = j
      continue
    }
    ra += s[i]
    i += 1
  }
  return ra
}

/** Nở một từ thành DANH SÁCH chuỗi: nội suy → tách khoảng trắng (chỉ phần không nháy) → glob. */
function noTu(tok: Extract<Token, { t: 'word' }>, ctx: NguCanh): string[] {
  const truong: string[] = ['']
  const coGlob: boolean[] = [false]
  const them = (chu: string, tachDuoc: boolean, globDuoc: boolean) => {
    if (!tachDuoc) {
      truong[truong.length - 1] += chu
      if (globDuoc && /[*?]/.test(chu)) coGlob[coGlob.length - 1] = true
      return
    }
    const manh = chu.split(/[ \t\n]+/)
    for (let k = 0; k < manh.length; k += 1) {
      if (k > 0) {
        truong.push('')
        coGlob.push(false)
      }
      const chuManh = manh[k] ?? ''
      const cuoi = truong.length - 1
      truong[cuoi] = (truong[cuoi] ?? '') + chuManh
      if (globDuoc && /[*?]/.test(chuManh)) coGlob[cuoi] = true
    }
  }

  for (const p of tok.parts) {
    if (p.quote === 'single') {
      them(p.text, false, false)
      continue
    }
    // Nháy kép: nội suy nhưng KHÔNG tách khoảng trắng, không glob — đúng luật bash và là lý do
    // "$file" an toàn hơn $file khi tên file có dấu cách.
    const daNoiSuy = noiSuyBien(noiSuyLenh(p.text, ctx), ctx)
    if (p.quote === 'double') them(daNoiSuy, false, false)
    else them(daNoiSuy, true, true)
  }

  // Từ hoàn toàn rỗng do biến rỗng (vd `$KHONG_CO`) thì biến mất, trừ khi được nháy.
  const ra: string[] = []
  for (let k = 0; k < truong.length; k += 1) {
    const v = truong[k]!
    if (v === '' && !tok.parts.some((p) => p.quote !== 'none')) continue
    ra.push(...(coGlob[k] ? moRong(v, ctx) : [v]))
  }
  return ra
}

/** Glob đơn giản: `*` và `?` khớp trong MỘT cấp thư mục. Không khớp gì thì giữ nguyên (như bash). */
function moRong(mau: string, ctx: NguCanh): string[] {
  const thuMuc = mau.includes('/') ? mau.slice(0, mau.lastIndexOf('/')) : ''
  const phanTen = mau.includes('/') ? mau.slice(mau.lastIndexOf('/') + 1) : mau
  const goc = giai(ctx.may, thuMuc === '' ? '.' : thuMuc)
  if (!laThuMuc(ctx.may, goc)) return [mau]
  const re = mauThanhRegex(phanTen)
  const khop = trongThuMuc(ctx.may, goc)
    .filter((n) => re.test(n))
    .map((n) => (thuMuc === '' ? n : `${thuMuc}/${n}`))
  return khop.length ? khop : [mau]
}

function mauThanhRegex(mau: string): RegExp {
  const than = mau
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.')
  return new RegExp(`^${than}$`)
}

// ───────────────────────────── Chạy ─────────────────────────────

interface KetQuaLenh {
  stdout: string
  code: number
}

function ghiRa(ctx: NguCanh, s: string): void {
  if (s !== '') ctx.inRa(s)
}

/** Chạy một chuỗi lệnh (dùng cho script gốc, thân for/if, `$( )`, và file `.sh`). */
function chayChuoi(src: string, ctx: NguCanh, stdin: string): number {
  const toks = tachToken(src)
  const menh = new BoPhanTich(toks).chuongTrinh(new Set())
  return chayMenhDs(menh, ctx, stdin)
}

function chayMenhDs(ds: Menh[], ctx: NguCanh, stdin: string): number {
  let code = ctx.may.lastExit
  for (const m of ds) {
    code = chayMenh(m, ctx, stdin)
    ctx.may.lastExit = code
  }
  return code
}

function chayMenh(m: Menh, ctx: NguCanh, stdin: string): number {
  ctx.may.steps += 1
  if (ctx.may.steps > TRAN_LENH) {
    throw new LoiBash(
      `Da chay qua ${TRAN_LENH} lenh — bo chay dung lai de trinh duyet khong bi treo. Kiem tra lai vong for hoac script tu goi chinh no.`,
    )
  }
  if (m.k === 'andor') {
    let code = chayOng(m.dau, ctx, stdin)
    ctx.may.lastExit = code
    for (const b of m.sau) {
      // `&&` chỉ chạy khi vế trước THÀNH CÔNG (mã 0), `||` chỉ chạy khi vế trước THẤT BẠI.
      if ((b.op === '&&' && code !== 0) || (b.op === '||' && code === 0)) continue
      code = chayOng(b.ong, ctx, stdin)
      ctx.may.lastExit = code
    }
    return code
  }
  if (m.k === 'for') {
    const gia: string[] = []
    for (const g of m.gia) gia.push(...noTu(g, ctx))
    let code = 0
    for (const v of gia) {
      ctx.may.vars[m.bien] = v
      code = chayMenhDs(m.than, ctx, '')
    }
    return code
  }
  const dk = chayMenhDs(m.dieuKien, ctx, '')
  return dk === 0 ? chayMenhDs(m.than, ctx, '') : chayMenhDs(m.nguoc, ctx, '')
}

function chayOng(ong: Ong, ctx: NguCanh, stdin: string): number {
  let vao = stdin
  let code = 0
  for (let k = 0; k < ong.chang.length; k += 1) {
    const cuoi = k === ong.chang.length - 1
    const r = chayLenhDon(ong.chang[k]!, ctx, vao)
    code = r.code
    if (cuoi) ghiRa(ctx, r.stdout)
    else vao = r.stdout
  }
  return code
}

function chayLenhDon(lenh: LenhDon, ctx: NguCanh, stdin: string): KetQuaLenh {
  const tu: string[] = []
  for (const w of lenh.words) tu.push(...noTu(w, ctx))

  // Gán biến đứng một mình: `TEN=gia_tri` (không có lệnh phía sau).
  if (tu.length === 1 && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tu[0]!)) {
    const dau = tu[0]!.indexOf('=')
    ctx.may.vars[tu[0]!.slice(0, dau)] = tu[0]!.slice(dau + 1)
    return { stdout: '', code: 0 }
  }

  let ra: KetQuaLenh
  if (tu.length === 0) ra = { stdout: '', code: 0 }
  else {
    try {
      ra = goiLenh(tu[0]!, tu.slice(1), stdin, ctx)
    } catch (e) {
      if (e instanceof LoiBash) {
        ctx.inLoi(`dong ${ctx.dong}: ${e.message}\n`)
        ra = { stdout: '', code: 1 }
      } else throw e
    }
  }

  if (lenh.redir) {
    const dich = noTu(lenh.redir.target, ctx)
    if (dich.length !== 1) throw new LoiBash('Dau ">" chi nhan DUNG MOT ten file.')
    ghiFile(ctx, dich[0]!, ra.stdout, lenh.redir.op === '>>')
    return { stdout: '', code: ra.code }
  }
  return ra
}

function ghiFile(ctx: NguCanh, duongDan: string, noiDung: string, noiThem: boolean): void {
  const p = giai(ctx.may, duongDan)
  if (laThuMuc(ctx.may, p)) throw new LoiBash(`"${duongDan}" la thu muc, khong ghi de len duoc.`)
  if (!laThuMuc(ctx.may, cha(p))) {
    throw new LoiBash(`Khong co thu muc "${cha(p)}". Tao truoc bang "mkdir -p".`)
  }
  const cu = noiThem ? (layFile(ctx.may, p)?.content ?? '') : ''
  ctx.may.fs.set(p, { kind: 'file', content: cu + noiDung, mode: 0o644 })
}

// ───────────────────────────── Từng lệnh ─────────────────────────────

/** Lệnh cố ý KHÔNG mô phỏng — nói thẳng vì sao, kèm điều học viên cần biết ngoài đời. */
const KHONG_MO_PHONG: Record<string, string> = {
  sudo: 'Bo chay nay khong co nguoi dung/quyen that nen khong co "sudo". Ngoai doi that: sudo chay lenh voi quyen quan tri — dung rat can than.',
  curl: 'Bo chay nay khong co mang nen khong chay duoc "curl". Ngoai doi that: curl tai du lieu tu mot dia chi web ve.',
  wget: 'Bo chay nay khong co mang nen khong chay duoc "wget".',
  ssh: 'Bo chay nay khong co mang nen khong chay duoc "ssh" (dang nhap vao may khac tu xa).',
  git: 'Bai Git dung BO MO PHONG RIENG (unit P3-U10/U11), khong chay chung voi bo chay bash nay.',
  sed: 'Bo chay nay khong co "sed". Dung grep/cut/sort de lam bai.',
  awk: 'Bo chay nay khong co "awk". Dung grep/cut/sort de lam bai.',
  ps: 'Bo chay nay khong co tien trinh that nen khong co "ps".',
  kill: 'Bo chay nay khong co tien trinh that nen khong co "kill".',
  date: 'Bo chay nay KHONG co dong ho — co y, de bai hoc luon cho ra cung ket qua va cham duoc.',
  man: 'Bo chay nay khong co trang huong dan "man". Ngoai doi that: "man ls" mo huong dan cua lenh ls.',
}

const DUNG_DUOC =
  'pwd, cd, ls, mkdir, rm, cp, mv, cat, echo, touch, head, tail, grep, wc, sort, uniq, cut, find, chmod, test/[, true, false, exit, bash/sh, ./script.sh'

function goiLenh(ten0: string, args: string[], stdin: string, ctx: NguCanh): KetQuaLenh {
  const may = ctx.may
  if (ten0 in KHONG_MO_PHONG) throw new LoiBash(KHONG_MO_PHONG[ten0]!)

  // Chạy một file script: `./x.sh` (cần quyền chạy) hoặc `bash x.sh` (không cần).
  if (ten0.includes('/') && !ten0.startsWith('-')) return chayScript(ten0, args, ctx, true)
  if (ten0 === 'bash' || ten0 === 'sh') {
    const f = args[0]
    if (!f) throw new LoiBash('Thieu ten file script. Vi du: bash chao.sh')
    return chayScript(f, args.slice(1), ctx, false)
  }

  switch (ten0) {
    case 'true':
      return { stdout: '', code: 0 }
    case 'false':
      return { stdout: '', code: 1 }
    case 'exit':
      throw new ThoatSom(args[0] === undefined ? may.lastExit : Number(args[0]) || 0)
    case 'pwd':
      return { stdout: `${may.cwd}\n`, code: 0 }
    case 'cd':
      return lenhCd(args, ctx)
    case 'ls':
      return lenhLs(args, ctx)
    case 'mkdir':
      return lenhMkdir(args, ctx)
    case 'touch':
      return lenhTouch(args, ctx)
    case 'rm':
      return lenhRm(args, ctx)
    case 'cp':
    case 'mv':
      return lenhCpMv(ten0, args, ctx)
    case 'cat':
      return lenhCat(args, stdin, ctx)
    case 'echo':
      return lenhEcho(args)
    case 'head':
    case 'tail':
      return lenhHeadTail(ten0, args, stdin, ctx)
    case 'grep':
      return lenhGrep(args, stdin, ctx)
    case 'wc':
      return lenhWc(args, stdin, ctx)
    case 'sort':
      return lenhSort(args, stdin, ctx)
    case 'uniq':
      return lenhUniq(args, stdin, ctx)
    case 'cut':
      return lenhCut(args, stdin, ctx)
    case 'find':
      return lenhFind(args, ctx)
    case 'chmod':
      return lenhChmod(args, ctx)
    case 'test':
    case '[':
      return lenhTest(ten0 === '[' ? args.slice(0, -1) : args, ctx)
    default:
      throw new LoiBash(`Khong tim thay lenh "${ten0}". Cac lenh dung duoc: ${DUNG_DUOC}.`)
  }
}

/** `exit` thoát cả script — ném ra để vòng chạy ngoài cùng bắt. */
class ThoatSom extends Error {
  constructor(readonly code: number) {
    super('exit')
  }
}

function chayScript(
  duongDan: string,
  args: string[],
  ctx: NguCanh,
  canQuyenChay: boolean,
): KetQuaLenh {
  const p = giai(ctx.may, duongDan)
  const f = layFile(ctx.may, p)
  if (!f) throw new LoiBash(`Khong co file "${duongDan}". Go "ls" de xem dang co nhung file gi.`)
  if (canQuyenChay && (f.mode & 0o111) === 0) {
    throw new LoiBash(
      `File "${duongDan}" chua co quyen chay. Chay "chmod +x ${duongDan}" roi thu lai.`,
    )
  }
  if (ctx.sau > 5) {
    throw new LoiBash('Script goi nhau qua sau (co the dang tu goi chinh no) — bo chay dung lai.')
  }
  let thu = ''
  const con: NguCanh = { ...ctx, thamSo: args, sau: ctx.sau + 1, inRa: (s) => (thu += s) }
  let code: number
  try {
    code = chayChuoi(f.content, con, '')
  } catch (e) {
    if (e instanceof ThoatSom) code = e.code
    else throw e
  }
  return { stdout: thu, code }
}

function lenhCd(args: string[], ctx: NguCanh): KetQuaLenh {
  const dich = args[0] ?? '~'
  const p = giai(ctx.may, dich)
  if (!ctx.may.fs.has(p)) throw new LoiBash(`Khong co thu muc "${dich}".`)
  if (!laThuMuc(ctx.may, p)) throw new LoiBash(`"${dich}" la file chu khong phai thu muc.`)
  ctx.may.cwd = p
  return { stdout: '', code: 0 }
}

function chuoiQuyen(n: Node): string {
  const bit = (m: number, k: number, c: string) => ((m & k) === 0 ? '-' : c)
  const m = n.mode
  return (
    (n.kind === 'dir' ? 'd' : '-') +
    bit(m, 0o400, 'r') +
    bit(m, 0o200, 'w') +
    bit(m, 0o100, 'x') +
    bit(m, 0o040, 'r') +
    bit(m, 0o020, 'w') +
    bit(m, 0o010, 'x') +
    bit(m, 0o004, 'r') +
    bit(m, 0o002, 'w') +
    bit(m, 0o001, 'x')
  )
}

function lenhLs(args: string[], ctx: NguCanh): KetQuaLenh {
  const co = args.filter((a) => a.startsWith('-')).join('')
  const dai = co.includes('l')
  const duong = args.filter((a) => !a.startsWith('-'))
  const dich = duong.length ? duong : ['.']
  const dong: string[] = []
  let code = 0
  for (const d of dich) {
    const p = giai(ctx.may, d)
    const n = ctx.may.fs.get(p)
    if (!n) {
      ctx.inLoi(`dong ${ctx.dong}: ls: khong co "${d}"\n`)
      code = 2
      continue
    }
    if (dich.length > 1 && n.kind === 'dir') dong.push(`${d}:`)
    const muc = n.kind === 'dir' ? trongThuMuc(ctx.may, p) : [d]
    for (const m of muc) {
      if (!dai) {
        dong.push(m)
        continue
      }
      const nut = ctx.may.fs.get(n.kind === 'dir' ? chuanHoa(`${p}/${m}`) : p)!
      const co0 = nut.kind === 'file' ? nut.content.length : 0
      dong.push(`${chuoiQuyen(nut)} ${co0} ${m}`)
    }
    if (dich.length > 1) dong.push('')
  }
  return { stdout: dong.length ? `${dong.join('\n').replace(/\n$/, '')}\n` : '', code }
}

function lenhMkdir(args: string[], ctx: NguCanh): KetQuaLenh {
  const cha0 = args.some((a) => a === '-p' || a === '-pv')
  const duong = args.filter((a) => !a.startsWith('-'))
  if (duong.length === 0) throw new LoiBash('Thieu ten thu muc. Vi du: mkdir bai-tap')
  for (const d of duong) {
    const p = giai(ctx.may, d)
    if (ctx.may.fs.has(p)) {
      if (cha0) continue
      throw new LoiBash(`"${d}" da ton tai. Them "-p" neu ban khong muon bao loi khi da co.`)
    }
    if (!laThuMuc(ctx.may, cha(p))) {
      if (!cha0) {
        throw new LoiBash(`Khong co thu muc cha cua "${d}". Them "-p" de tao ca duong dan.`)
      }
      // -p: tạo lần lượt từng cấp còn thiếu.
      const phan = p.split('/').filter(Boolean)
      let dang = ''
      for (const x of phan) {
        dang = `${dang}/${x}`
        if (!ctx.may.fs.has(dang)) ctx.may.fs.set(dang, { kind: 'dir', mode: 0o755 })
      }
      continue
    }
    ctx.may.fs.set(p, { kind: 'dir', mode: 0o755 })
  }
  return { stdout: '', code: 0 }
}

function lenhTouch(args: string[], ctx: NguCanh): KetQuaLenh {
  if (args.length === 0) throw new LoiBash('Thieu ten file. Vi du: touch ghi_chu.txt')
  for (const d of args) {
    const p = giai(ctx.may, d)
    if (ctx.may.fs.has(p)) continue
    if (!laThuMuc(ctx.may, cha(p))) throw new LoiBash(`Khong co thu muc "${cha(p)}".`)
    ctx.may.fs.set(p, { kind: 'file', content: '', mode: 0o644 })
  }
  return { stdout: '', code: 0 }
}

function lenhRm(args: string[], ctx: NguCanh): KetQuaLenh {
  const co = args.filter((a) => a.startsWith('-')).join('')
  const deQuy = co.includes('r') || co.includes('R')
  const boQuaLoi = co.includes('f')
  const duong = args.filter((a) => !a.startsWith('-'))
  if (duong.length === 0 && !boQuaLoi) throw new LoiBash('Thieu ten file. Vi du: rm ghi_chu.txt')
  let code = 0
  for (const d of duong) {
    const p = giai(ctx.may, d)
    if (p === '/' || p === HOME) {
      throw new LoiBash(
        'Bo chay chan xoa thu muc goc/thu muc nha. Ngoai doi that "rm -rf /" pha huy ca may — day chinh la lenh nguy hiem nhat ban can nho.',
      )
    }
    const n = ctx.may.fs.get(p)
    if (!n) {
      if (boQuaLoi) continue
      ctx.inLoi(`dong ${ctx.dong}: rm: khong co "${d}"\n`)
      code = 1
      continue
    }
    if (n.kind === 'dir' && !deQuy) {
      ctx.inLoi(`dong ${ctx.dong}: rm: "${d}" la thu muc — them "-r" de xoa ca ben trong\n`)
      code = 1
      continue
    }
    xoaDeQuy(ctx.may, p)
  }
  return { stdout: '', code }
}

function lenhCpMv(ten0: 'cp' | 'mv', args: string[], ctx: NguCanh): KetQuaLenh {
  const deQuy = args.some((a) => a.startsWith('-') && a.includes('r'))
  const duong = args.filter((a) => !a.startsWith('-'))
  if (duong.length < 2) throw new LoiBash(`Thieu tham so. Vi du: ${ten0} nguon.txt dich.txt`)
  const dich = duong[duong.length - 1]!
  const nguon = duong.slice(0, -1)
  const pDich = giai(ctx.may, dich)
  const vaoThuMuc = laThuMuc(ctx.may, pDich)
  if (nguon.length > 1 && !vaoThuMuc) {
    throw new LoiBash(`Chep nhieu file thi dich phai la THU MUC da ton tai ("${dich}" thi khong).`)
  }
  for (const s of nguon) {
    const pNguon = giai(ctx.may, s)
    const n = ctx.may.fs.get(pNguon)
    if (!n) throw new LoiBash(`Khong co "${s}".`)
    const pCuoi = vaoThuMuc ? chuanHoa(`${pDich}/${ten(pNguon)}`) : pDich
    if (n.kind === 'dir') {
      if (!deQuy) throw new LoiBash(`"${s}" la thu muc — them "-r" de ${ten0} ca ben trong.`)
      for (const k of [...ctx.may.fs.keys()]) {
        if (k !== pNguon && !k.startsWith(`${pNguon}/`)) continue
        const moi = pCuoi + k.slice(pNguon.length)
        ctx.may.fs.set(moi, { ...ctx.may.fs.get(k)! })
      }
    } else {
      if (!laThuMuc(ctx.may, cha(pCuoi))) throw new LoiBash(`Khong co thu muc "${cha(pCuoi)}".`)
      ctx.may.fs.set(pCuoi, { ...n })
    }
    if (ten0 === 'mv') xoaDeQuy(ctx.may, pNguon)
  }
  return { stdout: '', code: 0 }
}

function docFile(d: string, ctx: NguCanh): string {
  const p = giai(ctx.may, d)
  const n = ctx.may.fs.get(p)
  if (!n) throw new LoiBash(`Khong co file "${d}". Go "ls" de xem dang co nhung file gi.`)
  if (n.kind === 'dir') throw new LoiBash(`"${d}" la thu muc chu khong phai file.`)
  return n.content
}

function lenhCat(args: string[], stdin: string, ctx: NguCanh): KetQuaLenh {
  const duong = args.filter((a) => !a.startsWith('-'))
  if (duong.length === 0) return { stdout: stdin, code: 0 }
  let ra = ''
  for (const d of duong) ra += docFile(d, ctx)
  return { stdout: ra, code: 0 }
}

function lenhEcho(args: string[]): KetQuaLenh {
  const khongXuongDong = args[0] === '-n'
  const chu = (khongXuongDong ? args.slice(1) : args).join(' ')
  return { stdout: khongXuongDong ? chu : `${chu}\n`, code: 0 }
}

/** Cắt nội dung thành mảng dòng, bỏ dòng rỗng cuối do ký tự xuống dòng kết thúc file. */
function thanhDong(s: string): string[] {
  if (s === '') return []
  return s.replace(/\n$/, '').split('\n')
}

function noiDong(ds: string[]): string {
  return ds.length ? `${ds.join('\n')}\n` : ''
}

function layNguon(duong: string[], stdin: string, ctx: NguCanh): string {
  if (duong.length === 0) return stdin
  return duong.map((d) => docFile(d, ctx)).join('')
}

function lenhHeadTail(
  ten0: 'head' | 'tail',
  args: string[],
  stdin: string,
  ctx: NguCanh,
): KetQuaLenh {
  let so = 10
  const duong: string[] = []
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i]!
    if (a === '-n') {
      so = Number(args[i + 1])
      if (!Number.isFinite(so))
        throw new LoiBash(`Sau "-n" phai la mot so. Vi du: ${ten0} -n 3 f.txt`)
      i += 1
      continue
    }
    if (/^-\d+$/.test(a)) {
      so = Number(a.slice(1))
      continue
    }
    duong.push(a)
  }
  const dong = thanhDong(layNguon(duong, stdin, ctx))
  return { stdout: noiDong(ten0 === 'head' ? dong.slice(0, so) : dong.slice(-so)), code: 0 }
}

function lenhGrep(args: string[], stdin: string, ctx: NguCanh): KetQuaLenh {
  const co = args.filter((a) => a.startsWith('-')).join('')
  const duong = args.filter((a) => !a.startsWith('-'))
  const mau = duong[0]
  if (mau === undefined) throw new LoiBash('Thieu mau tim. Vi du: grep "loi" nhat_ky.txt')
  const nhieuFile = duong.length > 2
  let re: RegExp
  try {
    re = new RegExp(mau, co.includes('i') ? 'i' : '')
  } catch {
    // Mẫu không phải regex hợp lệ → so khớp như chuỗi con (bash cũng làm được điều tương tự).
    re = new RegExp(mau.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), co.includes('i') ? 'i' : '')
  }
  const ra: string[] = []
  let dem = 0
  const nguon = duong.slice(1)
  const phan = nguon.length
    ? nguon.map((d) => ({ d, noi: docFile(d, ctx) }))
    : [{ d: '', noi: stdin }]
  for (const { d, noi } of phan) {
    thanhDong(noi).forEach((dong, i) => {
      const khop = re.test(dong)
      if (khop === co.includes('v')) return
      dem += 1
      const tienTo = `${nhieuFile ? `${d}:` : ''}${co.includes('n') ? `${i + 1}:` : ''}`
      ra.push(tienTo + dong)
    })
  }
  // Mã thoát của grep là bài học riêng: 0 = TÌM THẤY, 1 = không — đó là thứ `if grep …` dùng.
  const code = dem > 0 ? 0 : 1
  if (co.includes('q')) return { stdout: '', code }
  if (co.includes('c')) return { stdout: `${dem}\n`, code }
  return { stdout: noiDong(ra), code }
}

function lenhWc(args: string[], stdin: string, ctx: NguCanh): KetQuaLenh {
  const co = args.filter((a) => a.startsWith('-')).join('')
  const duong = args.filter((a) => !a.startsWith('-'))
  const noi = layNguon(duong, stdin, ctx)
  const soDong = thanhDong(noi).length
  const soTu = noi.split(/\s+/).filter(Boolean).length
  const soKyTu = noi.length
  const chon: number[] = []
  if (co.includes('l')) chon.push(soDong)
  if (co.includes('w')) chon.push(soTu)
  if (co.includes('c') || co.includes('m')) chon.push(soKyTu)
  const so = chon.length ? chon : [soDong, soTu, soKyTu]
  const duoi = duong.length === 1 ? ` ${duong[0]}` : ''
  return { stdout: `${so.join(' ')}${duoi}\n`, code: 0 }
}

function lenhSort(args: string[], stdin: string, ctx: NguCanh): KetQuaLenh {
  const co = args.filter((a) => a.startsWith('-')).join('')
  const duong = args.filter((a) => !a.startsWith('-'))
  const dong = thanhDong(layNguon(duong, stdin, ctx))
  const sap = [...dong].sort((a, b) =>
    co.includes('n') ? Number(a) - Number(b) || a.localeCompare(b) : a < b ? -1 : a > b ? 1 : 0,
  )
  if (co.includes('r')) sap.reverse()
  const ra = co.includes('u') ? sap.filter((x, i) => i === 0 || x !== sap[i - 1]) : sap
  return { stdout: noiDong(ra), code: 0 }
}

function lenhUniq(args: string[], stdin: string, ctx: NguCanh): KetQuaLenh {
  const co = args.filter((a) => a.startsWith('-')).join('')
  const duong = args.filter((a) => !a.startsWith('-'))
  const dong = thanhDong(layNguon(duong, stdin, ctx))
  const ra: string[] = []
  const dem: number[] = []
  for (const d of dong) {
    // uniq chỉ gộp dòng TRÙNG LIỀN NHAU — đó là lý do luôn phải `sort | uniq`, và là cái bẫy
    // kinh điển của người mới.
    if (ra.length && ra[ra.length - 1] === d) dem[dem.length - 1] = (dem[dem.length - 1] ?? 0) + 1
    else {
      ra.push(d)
      dem.push(1)
    }
  }
  return {
    stdout: noiDong(co.includes('c') ? ra.map((d, i) => `${dem[i]} ${d}`) : ra),
    code: 0,
  }
}

function lenhCut(args: string[], stdin: string, ctx: NguCanh): KetQuaLenh {
  let delim = '\t'
  const truong: number[] = []
  const duong: string[] = []
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i]!
    if (a === '-d') {
      delim = args[i + 1] ?? '\t'
      i += 1
      continue
    }
    if (a.startsWith('-d')) {
      delim = a.slice(2)
      continue
    }
    if (a === '-f' || a.startsWith('-f')) {
      const gia = a === '-f' ? args[++i] : a.slice(2)
      for (const phan of (gia ?? '').split(',')) {
        const n = Number(phan)
        if (!Number.isFinite(n) || n < 1)
          throw new LoiBash('Sau "-f" phai la so cot. Vi du: cut -d, -f2')
        truong.push(n)
      }
      continue
    }
    duong.push(a)
  }
  if (truong.length === 0) throw new LoiBash('Thieu "-f". Vi du: cut -d, -f2 danh_sach.csv')
  const ra = thanhDong(layNguon(duong, stdin, ctx)).map((d) => {
    const cot = d.split(delim)
    return truong.map((t) => cot[t - 1] ?? '').join(delim)
  })
  return { stdout: noiDong(ra), code: 0 }
}

function lenhFind(args: string[], ctx: NguCanh): KetQuaLenh {
  const goc = args[0] && !args[0].startsWith('-') ? args[0] : '.'
  let mau: RegExp | null = null
  let loai: 'f' | 'd' | null = null
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '-name') {
      mau = mauThanhRegex(args[i + 1] ?? '*')
      i += 1
    } else if (args[i] === '-type') {
      const t = args[i + 1]
      if (t !== 'f' && t !== 'd')
        throw new LoiBash('Sau "-type" phai la f (file) hoac d (thu muc).')
      loai = t
      i += 1
    }
  }
  const pGoc = giai(ctx.may, goc)
  if (!ctx.may.fs.has(pGoc)) throw new LoiBash(`Khong co "${goc}".`)
  const ra: string[] = []
  for (const k of [...ctx.may.fs.keys()].sort()) {
    if (k !== pGoc && !k.startsWith(`${pGoc}/`)) continue
    const n = ctx.may.fs.get(k)!
    if (loai === 'f' && n.kind !== 'file') continue
    if (loai === 'd' && n.kind !== 'dir') continue
    if (mau && !mau.test(ten(k))) continue
    ra.push(k === pGoc ? goc : `${goc === '/' ? '' : goc}/${k.slice(pGoc.length + 1)}`)
  }
  return { stdout: noiDong(ra), code: 0 }
}

function lenhChmod(args: string[], ctx: NguCanh): KetQuaLenh {
  const quyen = args[0]
  const duong = args.slice(1)
  if (!quyen || duong.length === 0) throw new LoiBash('Thieu tham so. Vi du: chmod +x chao.sh')
  for (const d of duong) {
    const p = giai(ctx.may, d)
    const n = ctx.may.fs.get(p)
    if (!n) throw new LoiBash(`Khong co "${d}".`)
    if (/^[0-7]{3}$/.test(quyen)) n.mode = parseInt(quyen, 8)
    else if (quyen === '+x' || quyen === 'a+x' || quyen === 'u+x') n.mode |= 0o111
    else if (quyen === '-x') n.mode &= ~0o111
    else {
      throw new LoiBash(
        `Bo chay chi hieu dang so (vd 755) hoac +x/-x, chua hieu "${quyen}". Vi du: chmod 755 chao.sh`,
      )
    }
  }
  return { stdout: '', code: 0 }
}

function lenhTest(args: string[], ctx: NguCanh): KetQuaLenh {
  const dung = (b: boolean): KetQuaLenh => ({ stdout: '', code: b ? 0 : 1 })
  if (args.length === 1) return dung(args[0] !== '')
  if (args.length === 2) {
    const [co, x] = args as [string, string]
    const p = giai(ctx.may, x)
    if (co === '-f') return dung(ctx.may.fs.get(p)?.kind === 'file')
    if (co === '-d') return dung(laThuMuc(ctx.may, p))
    if (co === '-e') return dung(ctx.may.fs.has(p))
    if (co === '-z') return dung(x === '')
    if (co === '-n') return dung(x !== '')
    throw new LoiBash(`Bo chay chua hieu phep thu "${co}". Dung duoc: -f -d -e -z -n.`)
  }
  if (args.length === 3) {
    const [a, co, b] = args as [string, string, string]
    if (co === '=' || co === '==') return dung(a === b)
    if (co === '!=') return dung(a !== b)
    const x = Number(a)
    const y = Number(b)
    const so: Record<string, boolean> = {
      '-eq': x === y,
      '-ne': x !== y,
      '-lt': x < y,
      '-le': x <= y,
      '-gt': x > y,
      '-ge': x >= y,
    }
    if (co in so) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        throw new LoiBash(`Phep thu "${co}" chi so sanh SO. Voi chu thi dung "=" hoac "!=".`)
      }
      return dung(so[co]!)
    }
    throw new LoiBash(
      `Bo chay chua hieu phep thu "${co}". Dung duoc: = != -eq -ne -lt -le -gt -ge.`,
    )
  }
  throw new LoiBash('Cu phap: [ dieu_kien ] — nho khoang trang hai ben dau ngoac vuong.')
}

// ───────────────────────────── Điểm vào ─────────────────────────────

/**
 * Chạy một script bash trên MỘT máy ảo mới tinh, trả về output như terminal.
 *
 * `lenhChuanBi` dựng sẵn bối cảnh (tạo sẵn file/thư mục cho đề bài) và KHÔNG in ra — nhờ vậy
 * đề bài nói "thư mục của bạn đang có…" mà học viên không phải gõ lại phần dựng cảnh. Đây là
 * đúng cơ chế `lenhChuanBi` của gitSim, dùng lại nguyên để trang bài học không phải biết thêm
 * khái niệm mới.
 *
 * `error` chỉ được đặt khi MÃ THOÁT CUỐI CÙNG khác 0 — đúng ngữ nghĩa shell thật ("script này
 * thất bại"). Lệnh lỗi giữa chừng vẫn in thông báo vào output và script vẫn chạy tiếp, vì đó
 * cũng là điều bash thật làm (khác gitSim: ở đó gõ sai là dừng hẳn).
 */
export function chayBash(script: string, lenhChuanBi: string[] = []): BashRunResult {
  const may = taoMay()
  const dongRa: string[] = []
  let tran = false
  const ghi = (s: string) => {
    if (tran) return
    const dai = dongRa.reduce((t, x) => t + x.length, 0)
    if (dai + s.length > TRAN_OUTPUT) {
      tran = true
      dongRa.push('\n[GIA LAP] Output qua dai — bo chay dung in de trinh duyet khong bi treo.\n')
      return
    }
    dongRa.push(s)
  }
  const ctx: NguCanh = { may, thamSo: [], inRa: ghi, inLoi: ghi, dong: 0, sau: 0 }

  // Dựng bối cảnh: chạy im lặng, output bị bỏ đi; lỗi ở đây là lỗi của ĐỀ BÀI, không phải của
  // học viên, nên báo riêng cho người soạn thấy ngay.
  if (lenhChuanBi.length > 0) {
    const loiBoiCanh: string[] = []
    const im: NguCanh = {
      ...ctx,
      inRa: () => {},
      inLoi: (s) => loiBoiCanh.push(s.trim()),
    }
    const r = chayTungDong(lenhChuanBi.join('\n'), im)
    const loi = r.loi ?? loiBoiCanh[0]
    if (loi !== undefined)
      return { output: '', error: `Loi khi dung boi canh: ${loi}`, exitCode: 1 }
  }

  const r = chayTungDong(script, ctx)
  const output = DONG_TU_KHAI + '\n' + dongRa.join('')
  if (r.loi) return { output: `${output}${r.loi}\n`, error: r.loi, exitCode: 1 }
  return {
    output,
    ...(r.code !== 0
      ? { error: `Script ket thuc voi ma thoat ${r.code} (khac 0 = that bai).` }
      : {}),
    exitCode: r.code,
  }
}

/**
 * Quét một dòng để biết: phần chữ NGOÀI nháy (bỏ luôn comment) và dòng đó kết thúc khi còn
 * đang mở nháy nào. Bộ tách khối cần cả hai — nếu không, `echo "chua xong` sẽ bị cắt giữa
 * chuỗi và học viên nhận thông báo lỗi sai chỗ.
 */
function quetDong(d: string, nhayVao: '' | "'" | '"'): { ma: string; nhayRa: '' | "'" | '"' } {
  let nhay = nhayVao
  let ma = ''
  for (let i = 0; i < d.length; i += 1) {
    const c = d[i]!
    if (nhay === '') {
      if (c === '#') break
      if (c === "'" || c === '"') {
        nhay = c
        continue
      }
      if (c === '\\') {
        i += 1
        continue
      }
      ma += c
      continue
    }
    if (c === nhay) nhay = ''
    else if (c === '\\' && nhay === '"') i += 1
  }
  return { ma, nhayRa: nhay }
}

/**
 * Chạy script theo từng "câu lệnh logic" để BIẾT ĐANG Ở DÒNG NÀO khi báo lỗi (hiến chương M
 * §3.4: thông báo lỗi phải chỉ đúng số dòng của học viên).
 *
 * Cách làm: tách script thành các KHỐI — mỗi khối là một dòng đơn, hoặc trọn một cấu trúc
 * nhiều dòng (for…done, if…fi), hoặc một chuỗi trong nháy trải qua nhiều dòng — rồi chạy từng
 * khối, nhớ số dòng bắt đầu của nó.
 */
function chayTungDong(script: string, ctx: NguCanh): { code: number; loi?: string } {
  const dong = script.split('\n')
  let code = ctx.may.lastExit
  let i = 0
  while (i < dong.length) {
    const batDau = i
    const khoi: string[] = []
    let sauMo = 0
    let nhay: '' | "'" | '"' = ''
    do {
      const d = dong[i] ?? ''
      khoi.push(d)
      // Chỉ đếm từ khoá ở phần NGOÀI nháy: `echo "done"` không được tính là đóng vòng for.
      const { ma, nhayRa } = quetDong(d, nhay)
      nhay = nhayRa
      for (const t of ma.split(/[\s;]+/).filter(Boolean)) {
        if (t === 'for' || t === 'if') sauMo += 1
        else if (t === 'done' || t === 'fi') sauMo -= 1
      }
      i += 1
    } while ((sauMo > 0 || nhay !== '') && i < dong.length)

    const chu = khoi.join('\n')
    if (chu.trim() === '' || chu.trim().startsWith('#')) continue
    ctx.dong = batDau + 1
    try {
      code = chayChuoi(chu, ctx, '')
      ctx.may.lastExit = code
    } catch (e) {
      if (e instanceof ThoatSom) return { code: e.code }
      if (e instanceof LoiBash) return { code: 1, loi: `dong ${batDau + 1}: ${e.message}` }
      throw e
    }
  }
  return { code }
}
