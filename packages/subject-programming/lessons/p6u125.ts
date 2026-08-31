// lessons/p6u125.ts — P6-U125: HƯỚNG KIẾN TRÚC, chặng S3 — Nghiệm thu (module
// `architecture-s3-m3`) GỘP Sổ quyết định ADR (module `architecture-s3-m4`).
//
// Gộp hai module vào một unit vì cả hai cùng trả lời một câu hỏi: LÀM SAO GIỮ ĐƯỢC kết quả
// của code mình không tự gõ — nghiệm thu giữ nó ĐÚNG ở lượt này (test canh gác, review theo
// tầng), ADR giữ nó ĐÚNG qua các lượt sau (phiên khác, người khác, mô hình khác). Đúng tiền
// lệ gộp module của web-s1/backend-s3/architecture-s2.
//
// Dùng làn `typescript`, mô phỏng bằng hàm thuần tất định — không hạ tầng thật.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U125_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u125-l1',
    unitId: 'p6-u125',
    language: 'typescript',
    title: 'Nghiệm thu theo tầng — dừng ở tầng hỏng đầu tiên, đừng bình phong cách trước',
    hook: 'Một PR về, bạn mở ra và viết ngay: "chỗ này nên đặt tên biến khác", "thiếu dấu cách". Hai mươi bình luận sau, có người phát hiện cái hàm này trả về sai kiểu — toàn bộ hai mươi bình luận kia vừa thành rác, vì code sắp phải viết lại.',
    theory:
      'Nghiệm thu code mình không tự gõ có hai trụ: một CỔNG TỰ ĐỘNG và một THỨ TỰ ĐỌC.\n\n**TRỤ 1 — TEST CANH GÁC.** Bất biến kiến trúc bị phá thì CI phải ĐỎ, không đợi người review phát hiện. Lý do đơn giản: người review mệt, người review đọc lướt, người review đi nghỉ phép — cái test thì không. Đặc điểm của một test canh gác tốt là nó canh MỘT LUẬT, phát biểu được thành một câu, và bạn viết nó **TRƯỚC KHI GIAO VIỆC** chứ không phải sau khi nhận hàng. Viết trước có hai tác dụng cùng lúc: nó buộc bạn phát biểu bất biến cho rõ (bất biến không viết được thành test thường là bất biến bạn chưa nghĩ xong), và nó biến việc nghiệm thu từ tranh luận thành một lệnh chạy.\n\n**TRỤ 2 — REVIEW THEO TẦNG.** Đọc theo đúng thứ tự này và DỪNG ở tầng hỏng đầu tiên:\n\n1. **Đúng hợp đồng** — vào-ra, kiểu dữ liệu, ca lỗi có khớp đặc tả không?\n2. **Đúng ranh giới** — có đụng vào file/module bị cấm không, có luồn phụ thuộc ngược không?\n3. **Đúng ca biên** — rỗng, null, số 0, trùng lặp, đua điều kiện, thời gian.\n4. **Phong cách** — tên biến, bố cục, comment.\n\nVì sao phải dừng ở tầng hỏng đầu tiên chứ không góp ý cả bốn tầng một thể: nếu tầng 1 hỏng thì phần lớn code sẽ phải viết lại, nên mọi góp ý ở tầng 3–4 đều là công bỏ đi — của cả bạn lẫn bên thi hành. Thứ tự này cũng chống được một thiên lệch rất người: phong cách DỄ NHÌN THẤY nhất nên nó hút hết sự chú ý, trong khi lỗi hợp đồng thì nằm im, không nổi bật, và đắt gấp trăm lần.\n\n**Loại lỗi không cổng nào bắt được.** Đừng nhầm "CI xanh" với "đúng". Trình biên dịch và linter không hiểu nghiệp vụ: chúng không biết tồn kho không được âm, không biết một đơn không được trừ tiền hai lần, không biết ngày phải tính theo UTC. Bốn ổ lỗi kinh điển mà chỉ mắt người (và test ca biên do người nghĩ ra) bắt được: logic nghiệp vụ, ca rỗng, đua điều kiện, và thời gian.',
    workedExample: {
      code: `// Bon tang, khai theo dung THU TU DOC.
const TANG = ["hop dong", "ranh gioi", "ca bien", "phong cach"] as const

type TenTang = (typeof TANG)[number]
type KetQuaReview = Record<TenTang, boolean>

// Tra ve tang HONG DAU TIEN; het hong thi "Dat".
function tangHongDauTien(kq: KetQuaReview): string {
  const hong = TANG.find((t) => !kq[t])
  if (hong === undefined) return "Dat"
  return "Tra lai o tang: " + hong
}

const pr1: KetQuaReview = {
  "hop dong": false,
  "ranh gioi": true,
  "ca bien": false,
  "phong cach": false,
}
const pr2: KetQuaReview = {
  "hop dong": true,
  "ranh gioi": true,
  "ca bien": false,
  "phong cach": true,
}
const pr3: KetQuaReview = {
  "hop dong": true,
  "ranh gioi": true,
  "ca bien": true,
  "phong cach": true,
}

// pr1 hong ca ba tang, nhung chi bao MOT: sua tang 1 xong thi ba tang kia co the khac han.
console.log(tangHongDauTien(pr1))
console.log(tangHongDauTien(pr2))
console.log(tangHongDauTien(pr3))`,
      stdinLines: [],
    },
    predict: {
      code: `const TANG = ["hop dong", "ranh gioi", "ca bien", "phong cach"] as const
type TenTang = (typeof TANG)[number]
type KetQuaReview = Record<TenTang, boolean>
function tangHongDauTien(kq: KetQuaReview): string {
  const hong = TANG.find((t) => !kq[t])
  if (hong === undefined) return "Dat"
  return "Tra lai o tang: " + hong
}
const pr: KetQuaReview = {
  "hop dong": true,
  "ranh gioi": false,
  "ca bien": true,
  "phong cach": false,
}
console.log(tangHongDauTien(pr))`,
      question: 'PR hỏng ở tầng "ranh gioi" và tầng "phong cach". Dòng in ra là gì?',
      choices: [
        'Tra lai o tang: ranh gioi',
        'Tra lai o tang: phong cach',
        'Tra lai o tang: ranh gioi, phong cach',
        'Dat',
      ],
      answerIndex: 0,
      explain:
        '`find` dừng ở phần tử đầu tiên thoả điều kiện, mà `TANG` xếp theo đúng thứ tự đọc nên "ranh gioi" được báo trước. Đây chính là hành vi ta MUỐN: nói một chuyện quan trọng nhất, không đổ cả danh sách. Bên thi hành sửa xong ranh giới rồi review lại — lúc đó lỗi phong cách có thể đã biến mất theo, hoặc đã khác đi.',
    },
    parsons: {
      prompt: 'Xếp lại hàm review theo tầng: tìm tầng hỏng đầu tiên rồi kết luận.',
      lines: [
        'function tangHongDauTien(kq: KetQuaReview): string {',
        '  const hong = TANG.find((t) => !kq[t])',
        '  if (hong === undefined) return "Dat"',
        '  return "Tra lai o tang: " + hong',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết bộ nghiệm thu một PR do bên khác thi hành.\n\n- `tangHongDauTien(kq)`: trả `Tra lai o tang: <tên tầng>` cho tầng hỏng ĐẦU TIÊN theo thứ tự hằng `TANG`; hết hỏng thì trả `Dat`.\n- `demTangHong(kq)`: đếm số tầng hỏng (dùng để ghi biên bản, KHÔNG dùng để trả về cho bên thi hành).\n- `bienBan(kq, testCanhXanh)`: nếu `testCanhXanh` là `false` thì trả `Chua xet: test canh gac dang do` — dù các tầng review có ra sao, vì cổng tự động phải xanh trước khi người bỏ công đọc. Test canh xanh rồi thì trả `<kết quả tangHongDauTien> (con <n> tang hong)` với n là số tầng hỏng.\n\nThứ tự kiểm quan trọng: cổng tự động trước, mắt người sau.',
      starterCode: `const TANG = ["hop dong", "ranh gioi", "ca bien", "phong cach"] as const

type TenTang = (typeof TANG)[number]
type KetQuaReview = Record<TenTang, boolean>

function tangHongDauTien(kq: KetQuaReview): string {
  // TODO
  return ""
}

function demTangHong(kq: KetQuaReview): number {
  // TODO
  return 0
}

function bienBan(kq: KetQuaReview, testCanhXanh: boolean): string {
  // TODO: cong tu dong truoc, mat nguoi sau
  return ""
}

// ---- Đừng sửa phần dưới đây ----
const prA: KetQuaReview = {
  "hop dong": false,
  "ranh gioi": true,
  "ca bien": false,
  "phong cach": true,
}
const prB: KetQuaReview = {
  "hop dong": true,
  "ranh gioi": true,
  "ca bien": true,
  "phong cach": true,
}
console.log(bienBan(prA, false))
console.log(bienBan(prA, true))
console.log(bienBan(prB, true))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Chua xet: test canh gac dang do',
          match: 'contains',
          hidden: false,
          label: 'Test canh gác đỏ → chưa ai phải đọc code',
        },
        {
          stdinLines: [],
          expected: 'Tra lai o tang: hop dong (con 2 tang hong)',
          match: 'contains',
          hidden: false,
          label: 'Báo tầng hỏng đầu tiên, ghi kèm tổng số tầng hỏng vào biên bản',
        },
        {
          stdinLines: [],
          expected: 'Dat (con 0 tang hong)',
          match: 'contains',
          hidden: false,
          label: 'Bốn tầng đều đạt và cổng xanh → nhận',
        },
        {
          stdinLines: [],
          expected:
            'Chua xet: test canh gac dang do\nTra lai o tang: hop dong (con 2 tang hong)\nDat (con 0 tang hong)',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đủ ba dòng đúng thứ tự',
        },
      ],
      hints: [
        'tangHongDauTien: `TANG.find((t) => !kq[t])` trả về tên tầng hoặc `undefined` — so với `undefined` để biết có đạt hết không.',
        'demTangHong: `TANG.filter((t) => !kq[t]).length`.',
        'bienBan: câu lệnh `if (!testCanhXanh) return "Chua xet: test canh gac dang do"` phải đứng ĐẦU TIÊN, rồi mới ghép `tangHongDauTien(kq) + " (con " + demTangHong(kq) + " tang hong)"`.',
      ],
      sampleSolution: `const TANG = ["hop dong", "ranh gioi", "ca bien", "phong cach"] as const

type TenTang = (typeof TANG)[number]
type KetQuaReview = Record<TenTang, boolean>

function tangHongDauTien(kq: KetQuaReview): string {
  const hong = TANG.find((t) => !kq[t])
  if (hong === undefined) return "Dat"
  return "Tra lai o tang: " + hong
}

function demTangHong(kq: KetQuaReview): number {
  return TANG.filter((t) => !kq[t]).length
}

function bienBan(kq: KetQuaReview, testCanhXanh: boolean): string {
  if (!testCanhXanh) return "Chua xet: test canh gac dang do"
  return tangHongDauTien(kq) + " (con " + demTangHong(kq) + " tang hong)"
}

// ---- Đừng sửa phần dưới đây ----
const prA: KetQuaReview = {
  "hop dong": false,
  "ranh gioi": true,
  "ca bien": false,
  "phong cach": true,
}
const prB: KetQuaReview = {
  "hop dong": true,
  "ranh gioi": true,
  "ca bien": true,
  "phong cach": true,
}
console.log(bienBan(prA, false))
console.log(bienBan(prA, true))
console.log(bienBan(prB, true))`,
    },
    homework:
      'Chọn một bất biến thật của dự án bạn đang làm (ví dụ: "packages không được import apps", "mọi handler API phải kiểm token trước khi truy vấn"). Viết một test canh gác cho nó, rồi CỐ TÌNH phá bất biến đó ở một nhánh nháp để xem test có đỏ không. Một test canh gác chưa từng đỏ là một test chưa được chứng minh — nó có thể đang canh nhầm chỗ.',
    srsCards: [
      {
        hoi: 'Test canh gác nên viết vào lúc nào, và vì sao đúng thời điểm đó?',
        dap: 'Viết TRƯỚC khi giao việc. Nó buộc mình phát biểu bất biến cho rõ (bất biến không viết được thành test là bất biến chưa nghĩ xong) và biến việc nghiệm thu từ tranh luận thành một lệnh chạy.',
      },
      {
        hoi: 'Bốn tầng review xếp theo thứ tự nào, và vì sao phải dừng ở tầng hỏng đầu tiên?',
        dap: 'Hợp đồng → ranh giới → ca biên → phong cách. Dừng ở tầng hỏng đầu tiên vì nếu tầng trên hỏng thì code phần lớn phải viết lại, nên mọi góp ý ở tầng dưới đều là công bỏ đi của cả hai bên.',
      },
      {
        hoi: 'Bốn ổ lỗi mà trình biên dịch và linter không bao giờ bắt được là gì?',
        dap: 'Logic nghiệp vụ, ca rỗng, đua điều kiện, và thời gian. Công cụ không hiểu nghiệp vụ — chúng không biết tồn kho không được âm hay một đơn không được trừ tiền hai lần.',
      },
    ],
  },
  {
    id: 'p6-u125-l2',
    unitId: 'p6-u125',
    language: 'typescript',
    title: 'Sổ quyết định (ADR) — ghi cả phương án BỊ LOẠI, nếu không phiên sau sẽ đề xuất lại nó',
    hook: 'Tháng trước cả nhóm cân nhắc rất kỹ rồi loại bỏ phương án dùng hàng đợi. Tháng này một AI (hoặc một người mới) đọc code, thấy chỗ này "rõ ràng nên dùng hàng đợi", và đề xuất lại đúng cái phương án đã bị loại. Không ai nhớ nổi lý do loại là gì — nên cuộc tranh luận chạy lại từ đầu, tốn đúng số giờ như lần trước.',
    theory:
      'ADR (Architecture Decision Record — bản ghi quyết định kiến trúc) là một file ngắn, một quyết định, không sửa lại sau khi chốt. Dự án này có khuôn sẵn ở `docs/templates/adr.md`. Một ADR có **năm phần bắt buộc**:\n\n1. **BỐI CẢNH** — lúc đó ta biết gì, ràng buộc gì (ngân sách, thời hạn, người, phiên bản thư viện). Phần này giải thích vì sao một quyết định hợp lý hôm nay có thể trông ngớ ngẩn sau hai năm: bối cảnh đã đổi.\n2. **PHƯƠNG ÁN ĐÃ CÂN NHẮC** — ít nhất hai, kèm lý do LOẠI của từng phương án bị loại.\n3. **QUYẾT ĐỊNH** — chọn cái nào, phát biểu bằng một câu khẳng định.\n4. **ĐÁNH ĐỔI** — được gì, MẤT gì. ADR nào cũng có phần mất; nếu không thấy mất gì thì thường là chưa nghĩ đủ.\n5. **HỆ QUẢ** — từ nay về sau phải làm gì khác đi, ai bị ràng buộc.\n\nPhần **2 là phần hay bị cắt nhất và cũng đắt nhất khi thiếu.** Một ADR chỉ ghi "ta chọn X" thì lần sau người đọc chỉ biết KẾT LUẬN mà không biết CÂY QUYẾT ĐỊNH — nên họ sẽ tự dựng lại cây đó, và rất có thể đi tới đúng nhánh mình đã chặt. Đây không phải lỗi của họ: thông tin ấy chưa từng được ghi ở đâu cả.\n\n**ADR là BẤT BIẾN với bên thi hành.** Người/AI nhận việc không được lặng lẽ làm khác quyết định đã ghi trong ADR. Muốn đổi thì viết một ADR MỚI thay thế ADR cũ (ADR cũ giữ nguyên, đánh dấu "đã bị thay thế bởi ADR-00xx"). Không xoá, không sửa đè — vì lịch sử quyết định chính là thứ có giá trị: nó cho biết ta đã ĐỔI Ý và đổi vì lý do gì.\n\nHệ quả thực dụng cho việc giao việc mà bạn học ở u124: **liệt kê các ADR liên quan ngay trong brief.** Nếu không, bên thi hành sẽ "cải tiến" đúng những chỗ bạn đã cố tình chọn như vậy.',
    workedExample: {
      code: `const PHAN_BAT_BUOC = ["boiCanh", "phuongAn", "quyetDinh", "danhDoi", "heQua"] as const

type TenPhan = (typeof PHAN_BAT_BUOC)[number]
type Adr = Record<TenPhan, string>

function phanConThieu(adr: Adr): TenPhan[] {
  return PHAN_BAT_BUOC.filter((p) => adr[p].trim() === "")
}

// Phuong an ghi cach nhau bang dau ";" — duoi hai phuong an la khong co so sanh nao ca.
function demPhuongAn(adr: Adr): number {
  if (adr.phuongAn.trim() === "") return 0
  return adr.phuongAn.split(";").length
}

function kiemAdr(adr: Adr): string {
  const thieu = phanConThieu(adr)
  if (thieu.length > 0) return "Thieu phan: " + thieu.join(", ")
  if (demPhuongAn(adr) < 2) return "Thieu phuong an so sanh"
  return "Ghi so duoc"
}

const adrCut: Adr = {
  boiCanh: "Can gui email tuan cho phu huynh",
  phuongAn: "Dung hang doi",
  quyetDinh: "Dung hang doi",
  danhDoi: "Them mot dich vu phai van hanh",
  heQua: "",
}
const adrDu: Adr = {
  boiCanh: "Can gui email tuan, luu luong nho, VPS 3GB RAM",
  phuongAn: "Hang doi rieng: chiu tai tot nhung them dich vu; Cron trong tien trinh: don gian, du cho tai nay",
  quyetDinh: "Dung cron trong tien trinh",
  danhDoi: "Duoc: don gian, khong them ha tang. Mat: kho scale khi vuot 10k email/tuan",
  heQua: "Vuot 10k email/tuan phai viet ADR moi thay the",
}

console.log(kiemAdr(adrCut))
console.log(kiemAdr(adrDu))
console.log("So phuong an trong ADR du:", demPhuongAn(adrDu))`,
      stdinLines: [],
    },
    predict: {
      code: `const PHAN_BAT_BUOC = ["boiCanh", "phuongAn", "quyetDinh", "danhDoi", "heQua"] as const
type TenPhan = (typeof PHAN_BAT_BUOC)[number]
type Adr = Record<TenPhan, string>
function phanConThieu(adr: Adr): TenPhan[] {
  return PHAN_BAT_BUOC.filter((p) => adr[p].trim() === "")
}
function demPhuongAn(adr: Adr): number {
  if (adr.phuongAn.trim() === "") return 0
  return adr.phuongAn.split(";").length
}
function kiemAdr(adr: Adr): string {
  const thieu = phanConThieu(adr)
  if (thieu.length > 0) return "Thieu phan: " + thieu.join(", ")
  if (demPhuongAn(adr) < 2) return "Thieu phuong an so sanh"
  return "Ghi so duoc"
}
const adr: Adr = {
  boiCanh: "Chon co so du lieu",
  phuongAn: "Postgres tu host",
  quyetDinh: "Postgres tu host",
  danhDoi: "Duoc: re. Mat: tu lo backup",
  heQua: "Phai co lich backup hang ngay",
}
console.log(kiemAdr(adr))`,
      question: 'ADR này có đủ cả năm phần, không phần nào rỗng. Dòng in ra là gì?',
      choices: [
        'Thieu phuong an so sanh',
        'Ghi so duoc',
        'Thieu phan: phuongAn',
        'Thieu phan: heQua',
      ],
      answerIndex: 0,
      explain:
        'Đủ năm phần nên qua được nhánh thứ nhất, nhưng ô `phuongAn` chỉ có MỘT phương án (không có dấu ";") nên `demPhuongAn` trả 1, nhỏ hơn 2. Đây đúng là lỗi ADR phổ biến nhất ngoài đời: điền đủ hết các mục nhìn rất chỉn chu, nhưng phần "phương án đã cân nhắc" chỉ chép lại chính cái đã chọn — tức là không ghi lại phương án nào bị loại, và lần sau sẽ có người đề xuất lại nó.',
    },
    parsons: {
      prompt: 'Xếp lại hàm kiểm ADR: thiếu phần thì báo trước, đủ phần rồi mới soi số phương án.',
      lines: [
        'function kiemAdr(adr: Adr): string {',
        '  const thieu = phanConThieu(adr)',
        '  if (thieu.length > 0) return "Thieu phan: " + thieu.join(", ")',
        '  if (demPhuongAn(adr) < 2) return "Thieu phuong an so sanh"',
        '  return "Ghi so duoc"',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết bộ kiểm sổ quyết định ADR trước khi ghi vào `docs/adr/`.\n\n- `phanConThieu(adr)`: trả mảng tên các phần rỗng (rỗng = sau `.trim()` còn chuỗi rỗng), theo đúng thứ tự hằng `PHAN_BAT_BUOC`.\n- `demPhuongAn(adr)`: ô `phuongAn` rỗng thì trả 0; ngược lại đếm số phương án bằng cách tách theo dấu `;` (`split(";").length`).\n- `kiemAdr(adr)`: còn phần rỗng thì trả `Thieu phan: <các phần nối bằng dấu phẩy>`; đủ phần nhưng dưới 2 phương án thì trả `Thieu phuong an so sanh`; đủ cả hai thì trả `Ghi so duoc`.\n- `thayThe(maAdrCu, maAdrMoi)`: trả `ADR <maAdrMoi> thay the ADR <maAdrCu>; giu nguyen ADR cu` — vì đổi quyết định là VIẾT MỚI chứ không sửa đè lên bản cũ.',
      starterCode: `const PHAN_BAT_BUOC = ["boiCanh", "phuongAn", "quyetDinh", "danhDoi", "heQua"] as const

type TenPhan = (typeof PHAN_BAT_BUOC)[number]
type Adr = Record<TenPhan, string>

function phanConThieu(adr: Adr): TenPhan[] {
  // TODO
  return []
}

function demPhuongAn(adr: Adr): number {
  // TODO
  return 0
}

function kiemAdr(adr: Adr): string {
  // TODO
  return ""
}

function thayThe(maAdrCu: string, maAdrMoi: string): string {
  // TODO
  return ""
}

// ---- Đừng sửa phần dưới đây ----
const adr1: Adr = {
  boiCanh: "Chon cach gui email tuan",
  phuongAn: "Hang doi rieng; Cron trong tien trinh",
  quyetDinh: "Cron trong tien trinh",
  danhDoi: "Duoc: don gian. Mat: kho scale",
  heQua: "",
}
const adr2: Adr = {
  boiCanh: "Chon cach gui email tuan",
  phuongAn: "Cron trong tien trinh",
  quyetDinh: "Cron trong tien trinh",
  danhDoi: "Duoc: don gian. Mat: kho scale",
  heQua: "Vuot 10k email/tuan phai viet ADR moi",
}
const adr3: Adr = {
  boiCanh: "Chon cach gui email tuan",
  phuongAn: "Hang doi rieng; Cron trong tien trinh",
  quyetDinh: "Cron trong tien trinh",
  danhDoi: "Duoc: don gian. Mat: kho scale",
  heQua: "Vuot 10k email/tuan phai viet ADR moi",
}
console.log(kiemAdr(adr1))
console.log(kiemAdr(adr2))
console.log(kiemAdr(adr3))
console.log(thayThe("0007", "0012"))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Thieu phan: heQua',
          match: 'contains',
          hidden: false,
          label: 'ADR bỏ trống phần hệ quả',
        },
        {
          stdinLines: [],
          expected: 'Thieu phuong an so sanh',
          match: 'contains',
          hidden: false,
          label: 'Đủ năm phần nhưng chỉ chép lại đúng phương án đã chọn',
        },
        {
          stdinLines: [],
          expected: 'Ghi so duoc',
          match: 'contains',
          hidden: false,
          label: 'Đủ năm phần và có hai phương án để so sánh',
        },
        {
          stdinLines: [],
          expected:
            'Thieu phan: heQua\nThieu phuong an so sanh\nGhi so duoc\nADR 0012 thay the ADR 0007; giu nguyen ADR cu',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đủ bốn dòng, gồm cả luật thay thế ADR',
        },
      ],
      hints: [
        'phanConThieu: `PHAN_BAT_BUOC.filter((p) => adr[p].trim() === "")` — lọc trên hằng nên thứ tự tự đúng.',
        'demPhuongAn: nhớ nhánh rỗng trả 0 TRƯỚC, vì `"".split(";")` vẫn cho mảng một phần tử và sẽ đếm nhầm thành 1.',
        'thayThe: chỉ ghép chuỗi, chú ý đúng dấu chấm phẩy và khoảng trắng: "ADR " + maAdrMoi + " thay the ADR " + maAdrCu + "; giu nguyen ADR cu".',
      ],
      sampleSolution: `const PHAN_BAT_BUOC = ["boiCanh", "phuongAn", "quyetDinh", "danhDoi", "heQua"] as const

type TenPhan = (typeof PHAN_BAT_BUOC)[number]
type Adr = Record<TenPhan, string>

function phanConThieu(adr: Adr): TenPhan[] {
  return PHAN_BAT_BUOC.filter((p) => adr[p].trim() === "")
}

function demPhuongAn(adr: Adr): number {
  if (adr.phuongAn.trim() === "") return 0
  return adr.phuongAn.split(";").length
}

function kiemAdr(adr: Adr): string {
  const thieu = phanConThieu(adr)
  if (thieu.length > 0) return "Thieu phan: " + thieu.join(", ")
  if (demPhuongAn(adr) < 2) return "Thieu phuong an so sanh"
  return "Ghi so duoc"
}

function thayThe(maAdrCu: string, maAdrMoi: string): string {
  return "ADR " + maAdrMoi + " thay the ADR " + maAdrCu + "; giu nguyen ADR cu"
}

// ---- Đừng sửa phần dưới đây ----
const adr1: Adr = {
  boiCanh: "Chon cach gui email tuan",
  phuongAn: "Hang doi rieng; Cron trong tien trinh",
  quyetDinh: "Cron trong tien trinh",
  danhDoi: "Duoc: don gian. Mat: kho scale",
  heQua: "",
}
const adr2: Adr = {
  boiCanh: "Chon cach gui email tuan",
  phuongAn: "Cron trong tien trinh",
  quyetDinh: "Cron trong tien trinh",
  danhDoi: "Duoc: don gian. Mat: kho scale",
  heQua: "Vuot 10k email/tuan phai viet ADR moi",
}
const adr3: Adr = {
  boiCanh: "Chon cach gui email tuan",
  phuongAn: "Hang doi rieng; Cron trong tien trinh",
  quyetDinh: "Cron trong tien trinh",
  danhDoi: "Duoc: don gian. Mat: kho scale",
  heQua: "Vuot 10k email/tuan phai viet ADR moi",
}
console.log(kiemAdr(adr1))
console.log(kiemAdr(adr2))
console.log(kiemAdr(adr3))
console.log(thayThe("0007", "0012"))`,
    },
    homework:
      'Nhớ lại một quyết định kỹ thuật bạn đã chốt trong dự án của mình (chọn thư viện, chọn cách lưu dữ liệu, chọn không làm một tính năng). Viết nó thành một ADR đủ năm phần vào `docs/adr/`. Khó nhất sẽ là phần "phương án bị loại và lý do" — nếu bạn không nhớ nổi lý do loại, đó chính là bằng chứng sống cho bài học này: kiến thức đó đã bốc hơi chỉ sau vài tuần.',
    srsCards: [
      {
        hoi: 'Năm phần bắt buộc của một ADR là gì?',
        dap: 'Bối cảnh, các phương án đã cân nhắc (kèm lý do loại), quyết định, đánh đổi (được gì và MẤT gì), hệ quả về sau. Thiếu phần "mất gì" thường là dấu hiệu chưa nghĩ đủ.',
      },
      {
        hoi: 'Vì sao phần "phương án BỊ LOẠI" là phần đắt nhất khi thiếu?',
        dap: 'Người đọc sau chỉ thấy kết luận mà không thấy cây quyết định, nên họ tự dựng lại và rất dễ đề xuất đúng nhánh đã bị chặt. Lỗi không nằm ở họ — thông tin đó chưa từng được ghi ở đâu.',
      },
      {
        hoi: 'Muốn đổi một quyết định đã ghi trong ADR thì làm thế nào cho đúng?',
        dap: 'Viết một ADR MỚI thay thế ADR cũ; ADR cũ giữ nguyên và đánh dấu đã bị thay thế. Không xoá, không sửa đè — lịch sử đổi ý và lý do đổi chính là phần có giá trị.',
      },
    ],
  },
]
