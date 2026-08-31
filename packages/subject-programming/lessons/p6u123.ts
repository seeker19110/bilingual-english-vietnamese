// lessons/p6u123.ts — P6-U123: HƯỚNG KIẾN TRÚC, chặng S3 "Đặc tả thi hành được & nghiệm thu
// code mình không tự gõ" — Đặc tả kín (module `architecture-s3-m1`).
//
// architecture-s2 dạy viết HỢP ĐỒNG cho dữ liệu. S3 lùi thêm một bước nữa: hợp đồng cho
// CHÍNH CÔNG VIỆC. Hai bài ở đây dạy hai thứ làm nên một đặc tả kín: ① sáu ô bắt buộc, đo
// được bằng máy chứ không bằng cảm giác "chắc đủ rồi"; ② tiêu chí chấp nhận phải ĐO ĐƯỢC,
// và phải viết TRƯỚC phần mô tả giải pháp.
//
// Dùng làn `typescript`, mô phỏng bằng hàm thuần tất định — không hạ tầng thật.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U123_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u123-l1',
    unitId: 'p6-u123',
    language: 'typescript',
    title: 'Sáu ô bắt buộc — đo độ kín của đặc tả TRƯỚC khi giao việc đi',
    hook: 'Bạn nhắn cho AI: "Làm giúp mình trang danh sách đơn hàng nhé." Ba mươi giây sau bạn nhận về 400 dòng code chạy được — và sai gần hết: sai chỗ đặt file, sai tên trường, thêm cả một thư viện bạn không muốn. Không phải bên thi hành dở. Là cái đặc tả HỞ, và chỗ hở nào cũng được lấp bằng phỏng đoán.',
    theory:
      'Một đặc tả KÍN được định nghĩa bằng đúng một câu, và câu này đo được: **đọc xong, bên thi hành không phải hỏi lại câu nào để bắt đầu**. Không phải "dài", không phải "chi tiết" — mà là KHÔNG CÒN CHỖ TRỐNG để đoán.\n\nVì sao chỗ trống nguy hiểm hơn chỗ sai: chỗ SAI thì bên thi hành đọc thấy vô lý và hỏi lại; chỗ TRỐNG thì họ lấp bằng giả định hợp lý nhất theo hiểu biết của họ — và bạn chỉ phát hiện ra khi code đã viết xong.\n\nDự án này chốt SÁU Ô BẮT BUỘC (khuôn ở `docs/templates/dac-ta-tinh-nang.md`):\n\n1. **PHẠM VI** — làm gì, và quan trọng không kém: KHÔNG làm gì. Ô "không làm" là cái chặn phình phạm vi; thiếu nó thì bên thi hành "tiện tay dọn luôn" những chỗ bạn không muốn ai đụng.\n2. **ĐIỂM CHẠM FILE** — đường dẫn cụ thể được tạo/sửa. Không có ô này, cùng một tính năng có thể mọc ra ở ba chỗ khác nhau trong repo.\n3. **HỢP ĐỒNG VÀO-RA** — kiểu dữ liệu vào, kiểu ra, và các ca lỗi. Chính là thứ `architecture-s2` đã dạy, nay đặt vào đặc tả.\n4. **TIÊU CHÍ CHẤP NHẬN** — điều kiện ĐO ĐƯỢC để tuyên bố xong (bài sau dạy riêng ô này).\n5. **BẤT BIẾN + TEST CANH** — điều luôn phải đúng, và cái test sẽ đỏ nếu ai phá.\n6. **QUY ƯỚC DỰ ÁN** — phiên bản thư viện được dùng, lối đặt tên, ngôn ngữ comment, cổng phải chạy.\n\nMẹo dùng được ngay: đừng tự chấm "đặc tả của mình đủ chưa" bằng cảm giác. Liệt kê sáu ô thành một danh sách, ô nào rỗng thì ĐÁNH DẤU RỖNG — máy làm được việc đó, và máy không tự an ủi mình như người viết đặc tả vẫn hay làm.',
    workedExample: {
      code: `// Sau o bat buoc, khai o MOT CHO de khong ai nho nham thu tu.
const SAU_O = [
  "phamVi",
  "diemChamFile",
  "hopDongVaoRa",
  "tieuChiChapNhan",
  "batBien",
  "quyUoc",
] as const

type TenO = (typeof SAU_O)[number]
type DacTa = Record<TenO, string>

// O rong (chuoi rong hoac chi co khoang trang) = con HO.
function oConThieu(dacTa: DacTa): TenO[] {
  return SAU_O.filter((o) => dacTa[o].trim() === "")
}

function doDoKin(dacTa: DacTa): string {
  const thieu = oConThieu(dacTa)
  if (thieu.length === 0) return "Kin"
  return "Ho: " + thieu.join(", ")
}

const banNhap: DacTa = {
  phamVi: "Them trang danh sach don hang; KHONG dung toi phan thanh toan",
  diemChamFile: "src/pages/DonHang.tsx",
  hopDongVaoRa: "",
  tieuChiChapNhan: "Mo trang thay du 20 don gan nhat",
  batBien: "",
  quyUoc: "TypeScript strict, comment tieng Viet",
}

console.log(doDoKin(banNhap))
console.log("So o con ho:", oConThieu(banNhap).length)`,
      stdinLines: [],
    },
    predict: {
      code: `const SAU_O = ["phamVi", "diemChamFile", "hopDongVaoRa", "tieuChiChapNhan", "batBien", "quyUoc"] as const
type TenO = (typeof SAU_O)[number]
type DacTa = Record<TenO, string>
function oConThieu(dacTa: DacTa): TenO[] {
  return SAU_O.filter((o) => dacTa[o].trim() === "")
}
function doDoKin(dacTa: DacTa): string {
  const thieu = oConThieu(dacTa)
  if (thieu.length === 0) return "Kin"
  return "Ho: " + thieu.join(", ")
}
const d: DacTa = {
  phamVi: "Sua nut luu",
  diemChamFile: "   ",
  hopDongVaoRa: "vao: id don; ra: don hoac loi 404",
  tieuChiChapNhan: "Bam luu thay thong bao trong 1 giay",
  batBien: "Khong duoc goi lai API hai lan",
  quyUoc: "ESLint 0 canh bao",
}
console.log(doDoKin(d))`,
      question: 'Ô `diemChamFile` chỉ chứa ba dấu cách. Dòng in ra là gì?',
      choices: ['Ho: diemChamFile', 'Kin', 'Ho: khong co o nao', 'Ho: diemChamFile, batBien'],
      answerIndex: 0,
      explain:
        'Chuỗi "   " KHÁC chuỗi rỗng, nhưng `.trim()` cắt hết khoảng trắng nên nó vẫn tính là ô rỗng — đúng ý muốn, vì một ô chỉ có dấu cách thì với người đọc cũng là ô trống. Đây là ca biên hay bị bỏ sót khi tự kiểm đặc tả bằng mắt: nhìn qua thấy "ô nào cũng có gì đó", máy mới nói thật.',
    },
    parsons: {
      prompt: 'Xếp lại hàm đo độ kín: liệt kê ô rỗng trước, rồi kết luận kín hay hở.',
      lines: [
        'function oConThieu(dacTa: DacTa): TenO[] {',
        '  return SAU_O.filter((o) => dacTa[o].trim() === "")',
        '}',
        'function doDoKin(dacTa: DacTa): string {',
        '  const thieu = oConThieu(dacTa)',
        '  if (thieu.length === 0) return "Kin"',
        '  return "Ho: " + thieu.join(", ")',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết bộ kiểm độ kín của đặc tả, dùng đúng sáu ô bắt buộc của dự án.\n\n- `oConThieu(dacTa)`: trả về MẢNG tên các ô rỗng (rỗng nghĩa là sau `.trim()` còn chuỗi rỗng), giữ ĐÚNG thứ tự trong hằng `SAU_O`.\n- `doDoKin(dacTa)`: hết ô rỗng thì trả `Kin`; còn ô rỗng thì trả `Ho: <các ô nối bằng dấu phẩy và một khoảng trắng>`.\n- `sanSangGiao(dacTa)`: trả `Giao duoc` nếu kín, ngược lại trả `Chua giao duoc: con <n> o ho` (n là số ô rỗng).\n\nÔ "phạm vi" phải nêu cả phần KHÔNG làm — nhưng ở bài này ta chỉ kiểm ô có rỗng hay không, phần chất lượng nội dung là việc của người đọc.',
      starterCode: `const SAU_O = [
  "phamVi",
  "diemChamFile",
  "hopDongVaoRa",
  "tieuChiChapNhan",
  "batBien",
  "quyUoc",
] as const

type TenO = (typeof SAU_O)[number]
type DacTa = Record<TenO, string>

function oConThieu(dacTa: DacTa): TenO[] {
  // TODO: loc cac o rong theo dung thu tu SAU_O
  return []
}

function doDoKin(dacTa: DacTa): string {
  // TODO
  return ""
}

function sanSangGiao(dacTa: DacTa): string {
  // TODO
  return ""
}

// ---- Đừng sửa phần dưới đây ----
const banNhap: DacTa = {
  phamVi: "Them bo loc theo trang thai don; KHONG dung toi phan thanh toan",
  diemChamFile: "",
  hopDongVaoRa: "vao: trang thai; ra: mang don",
  tieuChiChapNhan: "",
  batBien: "",
  quyUoc: "TypeScript strict",
}
const banCuoi: DacTa = {
  phamVi: "Them bo loc theo trang thai don; KHONG dung toi phan thanh toan",
  diemChamFile: "src/pages/DonHang.tsx",
  hopDongVaoRa: "vao: trang thai; ra: mang don",
  tieuChiChapNhan: "Loc 'da giao' tra dung 12 don trong bo du lieu mau",
  batBien: "Khong bao gio tra don cua nguoi dung khac",
  quyUoc: "TypeScript strict",
}
console.log(doDoKin(banNhap))
console.log(sanSangGiao(banNhap))
console.log(doDoKin(banCuoi))
console.log(sanSangGiao(banCuoi))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Ho: diemChamFile, tieuChiChapNhan, batBien',
          match: 'contains',
          hidden: false,
          label: 'Bản nháp hở 3 ô, liệt kê đúng thứ tự SAU_O',
        },
        {
          stdinLines: [],
          expected: 'Chua giao duoc: con 3 o ho',
          match: 'contains',
          hidden: false,
          label: 'Chưa giao được, kèm số ô còn hở',
        },
        {
          stdinLines: [],
          expected: 'Kin',
          match: 'contains',
          hidden: false,
          label: 'Bản cuối đủ sáu ô → Kin',
        },
        {
          stdinLines: [],
          expected:
            'Ho: diemChamFile, tieuChiChapNhan, batBien\nChua giao duoc: con 3 o ho\nKin\nGiao duoc',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đủ bốn dòng đúng thứ tự (chống viết cứng một dòng)',
        },
      ],
      hints: [
        'Dùng `SAU_O.filter((o) => dacTa[o].trim() === "")` — vì lọc trên chính hằng SAU_O nên thứ tự tự động đúng, không cần sắp xếp lại.',
        'doDoKin: lấy mảng thiếu, `length === 0` thì trả "Kin", ngược lại `"Ho: " + thieu.join(", ")` — chú ý dấu phẩy có kèm một khoảng trắng.',
        'sanSangGiao gọi lại oConThieu chứ đừng đếm lại từ đầu: `const n = oConThieu(dacTa).length`, rồi ghép chuỗi "Chua giao duoc: con " + n + " o ho".',
      ],
      sampleSolution: `const SAU_O = [
  "phamVi",
  "diemChamFile",
  "hopDongVaoRa",
  "tieuChiChapNhan",
  "batBien",
  "quyUoc",
] as const

type TenO = (typeof SAU_O)[number]
type DacTa = Record<TenO, string>

function oConThieu(dacTa: DacTa): TenO[] {
  return SAU_O.filter((o) => dacTa[o].trim() === "")
}

function doDoKin(dacTa: DacTa): string {
  const thieu = oConThieu(dacTa)
  if (thieu.length === 0) return "Kin"
  return "Ho: " + thieu.join(", ")
}

function sanSangGiao(dacTa: DacTa): string {
  const n = oConThieu(dacTa).length
  if (n === 0) return "Giao duoc"
  return "Chua giao duoc: con " + n + " o ho"
}

// ---- Đừng sửa phần dưới đây ----
const banNhap: DacTa = {
  phamVi: "Them bo loc theo trang thai don; KHONG dung toi phan thanh toan",
  diemChamFile: "",
  hopDongVaoRa: "vao: trang thai; ra: mang don",
  tieuChiChapNhan: "",
  batBien: "",
  quyUoc: "TypeScript strict",
}
const banCuoi: DacTa = {
  phamVi: "Them bo loc theo trang thai don; KHONG dung toi phan thanh toan",
  diemChamFile: "src/pages/DonHang.tsx",
  hopDongVaoRa: "vao: trang thai; ra: mang don",
  tieuChiChapNhan: "Loc 'da giao' tra dung 12 don trong bo du lieu mau",
  batBien: "Khong bao gio tra don cua nguoi dung khac",
  quyUoc: "TypeScript strict",
}
console.log(doDoKin(banNhap))
console.log(sanSangGiao(banNhap))
console.log(doDoKin(banCuoi))
console.log(sanSangGiao(banCuoi))`,
    },
    homework:
      'Lấy một việc bạn từng nhờ AI làm và thấy kết quả lệch ý. Chép lại nguyên văn lời nhờ đó, rồi chấm nó theo sáu ô: ô nào có, ô nào rỗng. Gần như chắc chắn bạn sẽ thấy đúng cái ô rỗng là chỗ AI đoán sai. Viết lại lời nhờ cho kín cả sáu ô rồi giao lại — so hai kết quả.',
    srsCards: [
      {
        hoi: 'Một đặc tả "kín" được định nghĩa đo được như thế nào?',
        dap: 'Đọc xong, bên thi hành không phải hỏi lại câu nào để bắt đầu làm. Không phải dài hay chi tiết, mà là không còn chỗ trống nào để họ phải đoán.',
      },
      {
        hoi: 'Vì sao chỗ TRỐNG trong đặc tả nguy hiểm hơn chỗ SAI?',
        dap: 'Chỗ sai đọc thấy vô lý nên bên thi hành hỏi lại ngay; chỗ trống thì họ tự lấp bằng giả định hợp lý theo hiểu biết riêng, và mình chỉ phát hiện sai khi code đã viết xong.',
      },
      {
        hoi: 'Ô "phạm vi" phải có thêm phần gì thì mới chặn được phình việc?',
        dap: 'Phần KHÔNG làm — liệt kê rõ cái gì không được đụng tới. Thiếu nó thì bên thi hành sẽ "tiện tay dọn luôn" những chỗ mình không muốn ai sửa.',
      },
    ],
  },
  {
    id: 'p6-u123-l2',
    unitId: 'p6-u123',
    language: 'typescript',
    title: 'Tiêu chí chấp nhận đo được — viết TRƯỚC phần mô tả giải pháp',
    hook: '"Trang phải tải nhanh." Bên thi hành làm xong, bạn thấy chậm, họ thấy nhanh. Cãi nhau ba hôm không ai sai — vì cái tiêu chí ấy KHÔNG ĐO ĐƯỢC. Đổi thành "LCP ≤ 2,5 giây trên máy tầm trung, mạng 4G" thì tranh luận biến thành một phép đo.',
    theory:
      'TIÊU CHÍ CHẤP NHẬN là ô quan trọng nhất trong sáu ô, vì nó là thứ duy nhất trả lời được câu "xong CHƯA?". Nó có hai luật.\n\n**Luật 1 — phải ĐO ĐƯỢC.** Một tiêu chí đo được là tiêu chí mà hai người bất kỳ, chạy cùng một phép kiểm, luôn ra cùng một kết luận đạt/không đạt. Dấu hiệu thực dụng để tự soát: có một CON SỐ kèm đơn vị hoặc ngưỡng, và không có TỪ CẢM TÍNH ("nhanh", "mượt", "dễ dùng", "ổn định", "đẹp"). Từ cảm tính nguy hiểm ở chỗ nó nghe rất giống một yêu cầu, nên người viết yên tâm là mình đã nói rồi — trong khi thật ra chưa nói gì.\n\nSo sánh:\n\n- Hở: "Danh sách phải tải nhanh." → Kín: "Với 1.000 bản ghi mẫu, trang hiện đủ danh sách trong ≤ 1,5 giây."\n- Hở: "Xử lý lỗi cho tốt." → Kín: "Gọi API lỗi mạng thì hiện thông báo và nút Thử lại; bấm thử lại gọi đúng 1 lần, không gọi 2 lần."\n- Hở: "Không được chậm hơn hiện tại." → Kín: "Bundle tăng ≤ 5 KB gzip so với `main`."\n\n**Luật 2 — viết TRƯỚC phần mô tả giải pháp.** Nghe ngược nhưng có lý do rất thực tế: nếu mô tả giải pháp trước, tiêu chí sẽ vô thức được uốn theo cái giải pháp mình đã nghĩ ra ("đạt khi hàm X trả về Y") — tức là bạn đang kiểm CÁCH LÀM chứ không kiểm KẾT QUẢ. Viết tiêu chí trước, bạn buộc phải phát biểu bằng ngôn ngữ NGƯỜI DÙNG THẤY GÌ, và tự nhiên chừa lại cho bên thi hành quyền chọn cách làm.\n\nHệ quả thứ ba, đến từ hai luật trên: **chia lát**. Nếu một đặc tả cần tới 15 tiêu chí chấp nhận mới mô tả hết, đó không phải một việc — đó là ba việc. Cắt thành các lát nhỏ, mỗi lát CHẠY ĐƯỢC và KIỂM ĐƯỢC riêng, giao từng lát. Giao một cục lớn thì hoặc nhận về một cục lớn sai, hoặc chờ rất lâu mới biết là sai.',
    workedExample: {
      code: `// Tu cam tinh: nghe giong yeu cau nhung khong ai kiem duoc.
const TU_CAM_TINH = ["nhanh", "muot", "de dung", "on dinh", "dep"]

function coSo(cau: string): boolean {
  // Co it nhat mot chu so 0-9 => co nguong hoac dinh luong.
  for (const ky of cau) {
    if (ky >= "0" && ky <= "9") return true
  }
  return false
}

function coTuCamTinh(cau: string): boolean {
  return TU_CAM_TINH.some((t) => cau.includes(t))
}

function phanLoai(tieuChi: string): string {
  if (coTuCamTinh(tieuChi)) return "mo ho"
  if (!coSo(tieuChi)) return "mo ho"
  return "do duoc"
}

console.log(phanLoai("Trang phai tai nhanh"))
console.log(phanLoai("Hien du danh sach trong 1.5 giay voi 1000 ban ghi"))
console.log(phanLoai("Bam Thu lai goi API dung 1 lan"))
// Bay: co so NHUNG van cam tinh => van la mo ho.
console.log(phanLoai("Tai duoi 2 giay va cam giac that muot"))`,
      stdinLines: [],
    },
    predict: {
      code: `const TU_CAM_TINH = ["nhanh", "muot", "de dung", "on dinh", "dep"]
function coSo(cau: string): boolean {
  for (const ky of cau) {
    if (ky >= "0" && ky <= "9") return true
  }
  return false
}
function coTuCamTinh(cau: string): boolean {
  return TU_CAM_TINH.some((t) => cau.includes(t))
}
function phanLoai(tieuChi: string): string {
  if (coTuCamTinh(tieuChi)) return "mo ho"
  if (!coSo(tieuChi)) return "mo ho"
  return "do duoc"
}
console.log(phanLoai("Bundle tang toi da 5 KB gzip, giao dien on dinh"))`,
      question: 'Câu này có con số 5 KB rất cụ thể. Kết quả phân loại là gì?',
      choices: ['mo ho', 'do duoc', 'vua do duoc vua cam tinh', 'khong xac dinh'],
      answerIndex: 0,
      explain:
        'Nhánh kiểm từ cảm tính đứng TRƯỚC, mà câu có chữ "on dinh" nên trả "mo ho" ngay, chưa kịp xét con số. Đúng ý muốn: một tiêu chí vừa có ngưỡng đo được vừa kèm mệnh đề cảm tính thì vẫn không nghiệm thu được — vì phần cảm tính ấy sẽ là chỗ hai bên cãi nhau lúc nhận hàng.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm phân loại tiêu chí — chặn từ cảm tính trước, rồi mới xét có con số hay không.',
      lines: [
        'function phanLoai(tieuChi: string): string {',
        '  if (coTuCamTinh(tieuChi)) return "mo ho"',
        '  if (!coSo(tieuChi)) return "mo ho"',
        '  return "do duoc"',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết bộ soát tiêu chí chấp nhận cho một đặc tả.\n\n- `phanLoai(tieuChi)`: trả `mo ho` nếu câu chứa bất kỳ từ nào trong `TU_CAM_TINH`, HOẶC không chứa chữ số nào; ngược lại trả `do duoc`. Thứ tự kiểm: từ cảm tính TRƯỚC.\n- `locMoHo(danhSach)`: trả mảng các tiêu chí bị phân loại `mo ho`, giữ nguyên thứ tự đầu vào.\n- `chotDacTa(danhSach)`: nếu không còn tiêu chí mơ hồ thì trả `Chot duoc: <n> tieu chi do duoc`; còn mơ hồ thì trả `Sua lai <k> tieu chi mo ho`.\n\nGợi ý về ý nghĩa: `chotDacTa` chính là cái cổng bạn tự đặt cho mình TRƯỚC khi bấm gửi đặc tả đi.',
      starterCode: `const TU_CAM_TINH = ["nhanh", "muot", "de dung", "on dinh", "dep"]

function coSo(cau: string): boolean {
  for (const ky of cau) {
    if (ky >= "0" && ky <= "9") return true
  }
  return false
}

function coTuCamTinh(cau: string): boolean {
  return TU_CAM_TINH.some((t) => cau.includes(t))
}

function phanLoai(tieuChi: string): string {
  // TODO
  return ""
}

function locMoHo(danhSach: string[]): string[] {
  // TODO
  return []
}

function chotDacTa(danhSach: string[]): string {
  // TODO
  return ""
}

// ---- Đừng sửa phần dưới đây ----
const banNhap = [
  "Trang danh sach phai tai nhanh",
  "Hien du 20 don gan nhat trong 1.5 giay",
  "Xu ly loi cho tot",
]
const banSua = [
  "Hien du 20 don gan nhat trong 1.5 giay",
  "Loi mang thi hien nut Thu lai, bam goi dung 1 lan",
]
console.log(locMoHo(banNhap).length)
console.log(chotDacTa(banNhap))
console.log(chotDacTa(banSua))`,
      testCases: [
        {
          stdinLines: [],
          expected: '2',
          match: 'contains',
          hidden: false,
          label: 'Bản nháp có 2 tiêu chí mơ hồ ("tai nhanh" và "xu ly loi cho tot")',
        },
        {
          stdinLines: [],
          expected: 'Sua lai 2 tieu chi mo ho',
          match: 'contains',
          hidden: false,
          label: 'Chưa chốt được đặc tả khi còn tiêu chí mơ hồ',
        },
        {
          stdinLines: [],
          expected: 'Chot duoc: 2 tieu chi do duoc',
          match: 'contains',
          hidden: false,
          label: 'Bản sửa: cả 2 tiêu chí đều đo được → chốt được',
        },
        {
          stdinLines: [],
          expected: '2\nSua lai 2 tieu chi mo ho\nChot duoc: 2 tieu chi do duoc',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đủ ba dòng đúng thứ tự',
        },
      ],
      hints: [
        'phanLoai: hai lệnh if trả "mo ho" (từ cảm tính trước, rồi thiếu chữ số), cuối cùng trả "do duoc".',
        'locMoHo: `danhSach.filter((t) => phanLoai(t) === "mo ho")` — filter tự giữ nguyên thứ tự đầu vào.',
        'chotDacTa: `const k = locMoHo(danhSach).length`; k === 0 thì dùng `danhSach.length` cho câu "Chot duoc", ngược lại ghép k vào câu "Sua lai ... tieu chi mo ho".',
      ],
      sampleSolution: `const TU_CAM_TINH = ["nhanh", "muot", "de dung", "on dinh", "dep"]

function coSo(cau: string): boolean {
  for (const ky of cau) {
    if (ky >= "0" && ky <= "9") return true
  }
  return false
}

function coTuCamTinh(cau: string): boolean {
  return TU_CAM_TINH.some((t) => cau.includes(t))
}

function phanLoai(tieuChi: string): string {
  if (coTuCamTinh(tieuChi)) return "mo ho"
  if (!coSo(tieuChi)) return "mo ho"
  return "do duoc"
}

function locMoHo(danhSach: string[]): string[] {
  return danhSach.filter((t) => phanLoai(t) === "mo ho")
}

function chotDacTa(danhSach: string[]): string {
  const k = locMoHo(danhSach).length
  if (k === 0) return "Chot duoc: " + danhSach.length + " tieu chi do duoc"
  return "Sua lai " + k + " tieu chi mo ho"
}

// ---- Đừng sửa phần dưới đây ----
const banNhap = [
  "Trang danh sach phai tai nhanh",
  "Hien du 20 don gan nhat trong 1.5 giay",
  "Xu ly loi cho tot",
]
const banSua = [
  "Hien du 20 don gan nhat trong 1.5 giay",
  "Loi mang thi hien nut Thu lai, bam goi dung 1 lan",
]
console.log(locMoHo(banNhap).length)
console.log(chotDacTa(banNhap))
console.log(chotDacTa(banSua))`,
    },
    homework:
      'Mở một việc đang làm dở của bạn và viết 3–5 tiêu chí chấp nhận cho nó — viết TRƯỚC, chưa được nghĩ tới cách làm. Sau đó đọc lại: tiêu chí nào bạn không nêu ra được cách kiểm cụ thể (chạy lệnh gì, bấm vào đâu, nhìn con số nào) thì tiêu chí đó chưa đo được, sửa lại. Nếu viết mãi không dưới 8 tiêu chí thì đó là dấu hiệu phải chia lát, không phải dấu hiệu bạn viết kỹ.',
    srsCards: [
      {
        hoi: 'Dấu hiệu thực dụng nào cho biết một tiêu chí chấp nhận là ĐO ĐƯỢC?',
        dap: 'Có con số kèm đơn vị hoặc ngưỡng, và không chứa từ cảm tính (nhanh, mượt, dễ dùng, ổn định). Đo được nghĩa là hai người bất kỳ chạy cùng phép kiểm luôn ra cùng kết luận đạt hay không.',
      },
      {
        hoi: 'Vì sao phải viết tiêu chí chấp nhận TRƯỚC phần mô tả giải pháp?',
        dap: 'Viết sau thì tiêu chí bị uốn theo giải pháp mình đã nghĩ ra, thành ra kiểm CÁCH LÀM chứ không kiểm KẾT QUẢ. Viết trước buộc phải phát biểu theo cái người dùng thấy, và chừa quyền chọn cách làm cho bên thi hành.',
      },
      {
        hoi: 'Một đặc tả cần tới 15 tiêu chí chấp nhận mới mô tả hết nghĩa là gì?',
        dap: 'Nghĩa là nó không phải một việc mà là nhiều việc — phải chia lát, mỗi lát chạy được và kiểm được riêng, rồi giao từng lát thay vì giao một cục lớn.',
      },
    ],
  },
]
