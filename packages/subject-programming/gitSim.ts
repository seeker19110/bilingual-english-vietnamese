// gitSim — TERMINAL GIẢ LẬP (shell + git) cho unit P3-U10/U11 (PR-L9).
//
// VẤN ĐỀ PHẢI GIẢI: hai unit cuối bậc P3 dạy Git/GitHub và dòng lệnh, nhưng sandbox học tập
// không có git, không có hệ điều hành thật, và cổng CI cũng không được đụng vào repo thật.
// Trước đây đây là lý do U10–U11 bị hoãn ("về bản chất không chạy được trong sandbox").
//
// LỜI GIẢI: mô phỏng. Một máy ảo tí hon thuần TypeScript giữ đúng ba khái niệm lõi mà người
// mới phải hiểu — THƯ MỤC LÀM VIỆC · VÙNG CHỜ (staging) · LỊCH SỬ COMMIT — rồi diễn ra bằng
// output y như terminal thật. Học viên GÕ LỆNH THẬT chứ không phải chọn đáp án, và bài tự
// viết chấm được bằng trạng thái repo cuối cùng.
//
// GIỚI HẠN PHẢI NÓI THẲNG VỚI HỌC VIÊN (nội dung bài học có nói): đây là mô hình dạy học, KHÔNG
// phải git thật. Nó cố tình chỉ làm phần lõi: không mạng (push/pull/clone chỉ diễn tả), không
// SHA thật (mã commit sinh tuần tự để bài học tất định), không rebase/stash/cherry-pick. Điều
// gì mô phỏng không làm được thì bài học dạy bằng cách khác chứ KHÔNG giả vờ làm được.
//
// TẤT ĐỊNH TUYỆT ĐỐI: không Date.now(), không random — cùng chuỗi lệnh luôn cho cùng output,
// nếu không thì không thể làm cổng chấm.

/** Kết quả một lượt chạy — cùng hình dạng với các prelude khác của môn. */
export interface GitRunResult {
  output: string
  error?: string
}

interface Commit {
  /** Mã commit giả: 'c1', 'c2'… — tất định để bài học chấm được (git thật dùng SHA-1). */
  id: string
  message: string
  /** Ảnh chụp toàn bộ file tại thời điểm commit (đường dẫn → nội dung). */
  snapshot: Record<string, string>
  parents: string[]
  branch: string
}

interface RepoState {
  /** Đã `git init` chưa — mọi lệnh git khác đều đòi hỏi điều này. */
  khoiTao: boolean
  /** File trong thư mục làm việc (đường dẫn → nội dung). */
  workdir: Record<string, string>
  /** Đường dẫn đã `git add` (vùng chờ), kèm nội dung tại lúc add — đúng như git thật: add
   *  chụp NỘI DUNG chứ không đánh dấu tên file (sửa sau khi add thì phải add lại). */
  staged: Record<string, string>
  commits: Commit[]
  /** Nhánh → id commit mới nhất của nhánh đó. */
  branches: Record<string, string | null>
  nhanhHienTai: string
  demCommit: number
}

function taoRepo(): RepoState {
  return {
    khoiTao: false,
    workdir: {},
    staged: {},
    commits: [],
    branches: {},
    nhanhHienTai: 'main',
    demCommit: 0,
  }
}

/** Commit đang được nhánh hiện tại trỏ tới (null = nhánh chưa có commit nào). */
function commitHienTai(repo: RepoState): Commit | null {
  const id = repo.branches[repo.nhanhHienTai] ?? null
  return id === null ? null : (repo.commits.find((c) => c.id === id) ?? null)
}

/** Ảnh chụp file của commit hiện tại — mốc để so "file nào đã đổi". */
function anhChupHienTai(repo: RepoState): Record<string, string> {
  return commitHienTai(repo)?.snapshot ?? {}
}

/** Tách dòng lệnh thành các từ, hiểu chuỗi trong nháy kép (cho `git commit -m "..."`). */
function tachTu(dong: string): string[] {
  const tu: string[] = []
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(dong)) !== null) {
    tu.push(m[1] ?? m[2] ?? m[3] ?? '')
  }
  return tu
}

/** Lỗi có thông điệp dạy được (tiếng Việt, nói rõ cách sửa) thay vì thông điệp git thật khó hiểu. */
class LoiLenh extends Error {}

function doiHoiRepo(repo: RepoState): void {
  if (!repo.khoiTao) {
    throw new LoiLenh(
      'Thu muc nay chua phai kho git. Chay "git init" truoc da (git init tao thu muc .git — noi git ghi lich su).',
    )
  }
}

/** `git status` — bản rút gọn nhưng giữ đúng BA nhóm mà người mới cần phân biệt. */
function gitStatus(repo: RepoState): string {
  const dong: string[] = [`Tren nhanh ${repo.nhanhHienTai}`]
  const goc = anhChupHienTai(repo)

  const daChuanBi = Object.keys(repo.staged)
    .filter((p) => repo.staged[p] !== goc[p])
    .sort()
  // "Đã sửa nhưng chưa add": nội dung trong thư mục khác với thứ đang nằm ở vùng chờ (nếu có
  // trong vùng chờ) hoặc khác với commit gần nhất.
  const chuaChuanBi = Object.keys(repo.workdir)
    .filter((p) => {
      const mocSoSanh = p in repo.staged ? repo.staged[p] : goc[p]
      return mocSoSanh !== undefined && repo.workdir[p] !== mocSoSanh
    })
    .sort()
  const chuaTheoDoi = Object.keys(repo.workdir)
    .filter((p) => !(p in repo.staged) && !(p in goc))
    .sort()

  if (daChuanBi.length) {
    dong.push('Thay doi da chuan bi de commit:')
    for (const p of daChuanBi) dong.push(`  moi/sua: ${p}`)
  }
  if (chuaChuanBi.length) {
    dong.push('Thay doi chua chuan bi (can git add):')
    for (const p of chuaChuanBi) dong.push(`  sua: ${p}`)
  }
  if (chuaTheoDoi.length) {
    dong.push('File chua duoc theo doi (can git add):')
    for (const p of chuaTheoDoi) dong.push(`  ${p}`)
  }
  if (!daChuanBi.length && !chuaChuanBi.length && !chuaTheoDoi.length) {
    dong.push('Khong co gi de commit, thu muc lam viec sach')
  }
  return dong.join('\n')
}

function gitAdd(repo: RepoState, duongDan: string[]): string {
  doiHoiRepo(repo)
  if (duongDan.length === 0) {
    throw new LoiLenh('Thieu ten file. Vi du: "git add ghi_chu.txt" hoac "git add ." (tat ca).')
  }
  const canAdd = duongDan.includes('.') ? Object.keys(repo.workdir) : duongDan
  for (const p of canAdd) {
    const noiDung = repo.workdir[p]
    if (noiDung === undefined) {
      throw new LoiLenh(`Khong co file "${p}" trong thu muc. Go "ls" de xem dang co nhung file gi.`)
    }
    repo.staged[p] = noiDung
  }
  return ''
}

function gitCommit(repo: RepoState, tu: string[]): string {
  doiHoiRepo(repo)
  const viTriM = tu.findIndex((t) => t === '-m')
  const message = viTriM === -1 ? undefined : tu[viTriM + 1]
  if (!message) {
    throw new LoiLenh(
      'Commit phai co loi nhan. Viet: git commit -m "noi ban vua lam gi" (loi nhan la thu ban doc lai sau 3 thang).',
    )
  }
  const goc = anhChupHienTai(repo)
  const coThayDoi = Object.keys(repo.staged).some((p) => repo.staged[p] !== goc[p])
  if (!coThayDoi) {
    throw new LoiLenh(
      'Khong co gi trong vung cho de commit. Dung "git add <file>" de dua thay doi vao vung cho truoc.',
    )
  }

  repo.demCommit += 1
  const cha = repo.branches[repo.nhanhHienTai]
  const commit: Commit = {
    id: `c${repo.demCommit}`,
    message,
    snapshot: { ...goc, ...repo.staged },
    parents: cha ? [cha] : [],
    branch: repo.nhanhHienTai,
  }
  repo.commits.push(commit)
  repo.branches[repo.nhanhHienTai] = commit.id
  repo.staged = {}
  const soFile = Object.keys(commit.snapshot).length
  return `[${repo.nhanhHienTai} ${commit.id}] ${message}\n ${soFile} file trong ban chup`
}

/** Đi ngược cha để lấy lịch sử của nhánh hiện tại, mới nhất trước. */
function lichSu(repo: RepoState): Commit[] {
  const ra: Commit[] = []
  let id = repo.branches[repo.nhanhHienTai] ?? null
  while (id) {
    const c = repo.commits.find((x) => x.id === id)
    if (!c) break
    ra.push(c)
    id = c.parents[0] ?? null
  }
  return ra
}

function gitLog(repo: RepoState, tu: string[]): string {
  doiHoiRepo(repo)
  const ds = lichSu(repo)
  if (ds.length === 0) return 'Chua co commit nao'
  if (tu.includes('--oneline')) return ds.map((c) => `${c.id} ${c.message}`).join('\n')
  return ds.map((c) => `commit ${c.id}\nNhanh: ${c.branch}\n\n    ${c.message}`).join('\n\n')
}

function gitBranch(repo: RepoState, tu: string[]): string {
  doiHoiRepo(repo)
  const ten = tu[0]
  if (!ten) {
    // Liệt kê: nhánh hiện tại có dấu * đằng trước, đúng như git thật.
    return Object.keys(repo.branches)
      .sort()
      .map((b) => (b === repo.nhanhHienTai ? `* ${b}` : `  ${b}`))
      .join('\n')
  }
  if (ten in repo.branches) throw new LoiLenh(`Nhanh "${ten}" da ton tai roi.`)
  repo.branches[ten] = repo.branches[repo.nhanhHienTai] ?? null
  return ''
}

function chuyenNhanh(repo: RepoState, ten: string, taoMoi: boolean): string {
  doiHoiRepo(repo)
  if (taoMoi) {
    if (ten in repo.branches) throw new LoiLenh(`Nhanh "${ten}" da ton tai roi.`)
    repo.branches[ten] = repo.branches[repo.nhanhHienTai] ?? null
    repo.nhanhHienTai = ten
    return `Da chuyen sang nhanh moi "${ten}"`
  }
  if (!(ten in repo.branches)) {
    throw new LoiLenh(
      `Khong co nhanh "${ten}". Go "git branch" de xem danh sach, hoac them -b de tao nhanh moi.`,
    )
  }
  repo.nhanhHienTai = ten
  // Đổi nhánh thì thư mục làm việc trở về ảnh chụp của nhánh đó — đây chính là điều khiến
  // người mới kinh ngạc nhất ("file của tôi biến mất!"), nên mô phỏng phải làm đúng.
  repo.workdir = { ...anhChupHienTai(repo) }
  repo.staged = {}
  return `Da chuyen sang nhanh "${ten}"`
}

function gitMerge(repo: RepoState, tu: string[]): string {
  doiHoiRepo(repo)
  const ten = tu[0]
  if (!ten) throw new LoiLenh('Thieu ten nhanh. Vi du: git merge tinh-nang-moi')
  if (!(ten in repo.branches)) throw new LoiLenh(`Khong co nhanh "${ten}".`)
  if (ten === repo.nhanhHienTai) throw new LoiLenh('Khong the gop mot nhanh vao chinh no.')

  // `?? null` chứ không để nguyên: tra map bằng khoá cho ra `string | null | undefined` dưới
  // noUncheckedIndexedAccess, mà "nhánh chưa có commit" và "không có khoá" là cùng một ý.
  const idKia = repo.branches[ten] ?? null
  const idNay = repo.branches[repo.nhanhHienTai] ?? null
  if (!idKia) throw new LoiLenh(`Nhanh "${ten}" chua co commit nao de gop.`)

  const dsKia: string[] = []
  let duyet: string | null = idKia
  while (duyet) {
    dsKia.push(duyet)
    duyet = repo.commits.find((c) => c.id === duyet)?.parents[0] ?? null
  }
  // Nhánh hiện tại KHÔNG có commit riêng nào ngoài tổ tiên chung → tua nhanh (fast-forward):
  // git chỉ dời con trỏ nhánh, không tạo commit gộp. Người mới cần thấy sự khác biệt này.
  if (idNay === null || dsKia.includes(idNay)) {
    repo.branches[repo.nhanhHienTai] = idKia
    repo.workdir = { ...anhChupHienTai(repo) }
    return `Tua nhanh (fast-forward). Nhanh ${repo.nhanhHienTai} nay tro toi ${idKia}`
  }

  const kia = repo.commits.find((c) => c.id === idKia)!
  const nay = repo.commits.find((c) => c.id === idNay)!
  repo.demCommit += 1
  const commit: Commit = {
    id: `c${repo.demCommit}`,
    message: `Gop nhanh ${ten} vao ${repo.nhanhHienTai}`,
    // Mô phỏng chỉ gộp Ở MỨC FILE: hai nhánh sửa hai file khác nhau thì gộp gọn. Hai nhánh
    // cùng sửa MỘT file thì git thật báo xung đột — ở đây lấy bản của nhánh được gộp vào và
    // NÓI RÕ trong output, chứ không im lặng giả vờ mọi thứ ổn.
    snapshot: { ...nay.snapshot, ...kia.snapshot },
    parents: [idNay, idKia],
    branch: repo.nhanhHienTai,
  }
  repo.commits.push(commit)
  repo.branches[repo.nhanhHienTai] = commit.id
  repo.workdir = { ...commit.snapshot }

  const trung = Object.keys(kia.snapshot).filter(
    (p) => nay.snapshot[p] !== undefined && nay.snapshot[p] !== kia.snapshot[p],
  )
  const canhBao = trung.length
    ? `\nLuu y: ca hai nhanh cung sua ${trung.join(', ')} — mo phong lay ban cua nhanh ${ten}. Git that se bao XUNG DOT va bat ban tu chon.`
    : ''
  return `Da gop nhanh ${ten} vao ${repo.nhanhHienTai} (commit gop ${commit.id})${canhBao}`
}

/** Lệnh git chưa mô phỏng — nói thẳng là mô hình không làm, kèm điều học viên cần biết. */
const GIT_CHUA_MO_PHONG: Record<string, string> = {
  push: 'Mo phong nay khong co mang nen khong chay duoc "git push". Ngoai doi that: push la day commit tu may ban len GitHub.',
  pull: 'Mo phong nay khong co mang nen khong chay duoc "git pull". Ngoai doi that: pull la keo commit moi tu GitHub ve may ban.',
  clone:
    'Mo phong nay khong co mang nen khong chay duoc "git clone". Ngoai doi that: clone la tai toan bo kho tu GitHub ve may lan dau.',
  rebase: 'Mo phong nay chi day phan loi: rebase khong nam trong bai hoc nay.',
  stash: 'Mo phong nay chi day phan loi: stash khong nam trong bai hoc nay.',
}

function chayGit(repo: RepoState, tu: string[]): string {
  const lenh = tu[0]
  if (!lenh) throw new LoiLenh('Thieu lenh git. Vi du: git status')
  if (lenh in GIT_CHUA_MO_PHONG) throw new LoiLenh(GIT_CHUA_MO_PHONG[lenh]!)

  const conLai = tu.slice(1)
  if (lenh === 'init') {
    if (repo.khoiTao) return 'Thu muc nay da la kho git roi'
    repo.khoiTao = true
    repo.branches[repo.nhanhHienTai] = null
    return `Da khoi tao kho git rong, nhanh mac dinh "${repo.nhanhHienTai}"`
  }
  if (lenh === 'status') {
    doiHoiRepo(repo)
    return gitStatus(repo)
  }
  if (lenh === 'add') return gitAdd(repo, conLai)
  if (lenh === 'commit') return gitCommit(repo, conLai)
  if (lenh === 'log') return gitLog(repo, conLai)
  if (lenh === 'branch') return gitBranch(repo, conLai)
  if (lenh === 'merge') return gitMerge(repo, conLai)
  if (lenh === 'checkout' || lenh === 'switch') {
    doiHoiRepo(repo)
    const taoMoi = conLai[0] === '-b' || conLai[0] === '-c'
    const ten = taoMoi ? conLai[1] : conLai[0]
    if (!ten) throw new LoiLenh('Thieu ten nhanh. Vi du: git switch -c tinh-nang-moi')
    return chuyenNhanh(repo, ten, taoMoi)
  }
  throw new LoiLenh(
    `Mo phong chua ho tro "git ${lenh}". Cac lenh dung duoc: init, status, add, commit, log, branch, switch/checkout, merge.`,
  )
}

/** Lệnh shell tối giản — đủ để dạy U11 (đi lại, xem, tạo file) mà không cần hệ điều hành thật. */
function chayShell(repo: RepoState, tu: string[], dongGoc: string): string {
  const lenh = tu[0]!
  const conLai = tu.slice(1)

  if (lenh === 'pwd') return '/home/ban/du-an'
  if (lenh === 'ls') {
    const ds = Object.keys(repo.workdir).sort()
    return ds.length ? ds.join('\n') : '(thu muc rong)'
  }
  if (lenh === 'cat') {
    const p = conLai[0]
    if (!p) throw new LoiLenh('Thieu ten file. Vi du: cat ghi_chu.txt')
    const noiDung = repo.workdir[p]
    if (noiDung === undefined) throw new LoiLenh(`Khong co file "${p}".`)
    return noiDung
  }
  if (lenh === 'rm') {
    const p = conLai[0]
    if (!p) throw new LoiLenh('Thieu ten file. Vi du: rm ghi_chu.txt')
    if (!(p in repo.workdir)) throw new LoiLenh(`Khong co file "${p}".`)
    delete repo.workdir[p]
    return ''
  }
  if (lenh === 'echo') {
    // Chỉ hiểu dạng: echo "noi dung" > file  (và >> để nối thêm) — đủ để tạo/sửa file trong bài.
    const chuyenHuong = dongGoc.includes('>>') ? '>>' : dongGoc.includes('>') ? '>' : ''
    if (!chuyenHuong) return conLai.join(' ')
    const [phanChu, phanFile] = dongGoc.split(chuyenHuong)
    const chu = tachTu((phanChu ?? '').replace(/^\s*echo\s*/, '')).join(' ')
    const file = tachTu(phanFile ?? '')[0]
    if (!file) throw new LoiLenh('Thieu ten file sau dau ">". Vi du: echo "xin chao" > ghi_chu.txt')
    repo.workdir[file] = chuyenHuong === '>>' ? `${repo.workdir[file] ?? ''}${chu}\n` : `${chu}\n`
    return ''
  }
  if (lenh === 'mkdir' || lenh === 'cd') {
    // Mô phỏng phẳng một thư mục: nhận lệnh để học viên gõ quen tay, nhưng KHÔNG giả vờ có
    // cây thư mục thật (nói rõ còn hơn im lặng làm sai).
    return `(mo phong: khong tao cay thu muc that, moi file nam chung mot thu muc)`
  }
  throw new LoiLenh(
    `Mo phong chua ho tro lenh "${lenh}". Cac lenh dung duoc: pwd, ls, cat, echo, rm, git.`,
  )
}

/**
 * Chạy một loạt lệnh (mỗi dòng một lệnh) trên MỘT kho mới tinh, trả về output như terminal.
 *
 * Định dạng output: mỗi lệnh in ra dòng nhắc `$ <lệnh>` rồi tới kết quả — giống hệt thứ học
 * viên thấy khi xem người khác thao tác, nên đọc lại bài chấm là hiểu ngay chuyện gì xảy ra.
 * Lệnh lỗi in `loi: <thông điệp>` và DỪNG (như thật: gõ sai thì các lệnh sau vô nghĩa).
 */
export function chayLenh(script: string, lenhChuanBi: string[] = []): GitRunResult {
  const repo = taoRepo()
  const dong: string[] = []

  // `lenhChuanBi` dựng sẵn bối cảnh (vd repo đã có sẵn vài commit) mà KHÔNG in ra — nhờ vậy
  // đề bài nói "kho của bạn đang có…" mà học viên không phải gõ lại phần dựng cảnh.
  for (const lenh of lenhChuanBi) {
    const r = chayMotDong(repo, lenh)
    if (r.loi) return { output: '', error: `Loi khi dung boi canh: ${r.loi}` }
  }

  for (const raw of script.split('\n')) {
    const lenh = raw.trim()
    if (!lenh || lenh.startsWith('#')) continue
    dong.push(`$ ${lenh}`)
    const r = chayMotDong(repo, lenh)
    if (r.loi) {
      dong.push(`loi: ${r.loi}`)
      return { output: dong.join('\n'), error: r.loi }
    }
    if (r.ra) dong.push(r.ra)
  }
  return { output: dong.join('\n') }
}

function chayMotDong(repo: RepoState, lenh: string): { ra: string; loi?: string } {
  try {
    const tu = tachTu(lenh)
    if (tu.length === 0) return { ra: '' }
    const ra = tu[0] === 'git' ? chayGit(repo, tu.slice(1)) : chayShell(repo, tu, lenh)
    return { ra }
  } catch (err) {
    return { ra: '', loi: err instanceof Error ? err.message : String(err) }
  }
}
