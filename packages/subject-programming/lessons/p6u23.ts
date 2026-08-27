// lessons/p6u23.ts — P6-U23: HƯỚNG WEB, chặng S4 — OFFLINE VÀ WEB NÂNG CAO (module
// `web-s4-m2`: service worker & chiến lược cache · IndexedDB, đồng bộ khi có mạng lại).
//
// Hai bài dạy hai phán đoán mà service worker KHÔNG dạy hộ được: (1) tài nguyên này nên lấy
// từ cache trước hay từ mạng trước — chọn sai một lần là người dùng thấy giá cũ của hôm qua,
// hoặc app trắng màn hình khi mất sóng; (2) hàng đợi ghi lúc offline gửi lên thì giải xung
// đột thế nào cho hai máy cùng ra một kết quả.
//
// Bộ chạy không có service worker và không có mạng — nhưng cả hai phán đoán trên đều là hàm
// thuần trên dữ liệu tất định, nên chấm được bằng test-case (luật số 1 của chặng S4).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U23_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u23-l1',
    unitId: 'p6-u23',
    language: 'typescript',
    title: 'Cache-first hay network-first — chọn sai thì người dùng thấy giá của hôm qua',
    hook: 'Bạn bật service worker cho web bán hàng, cache mọi thứ để trang mở nhanh. Hôm sau khách gọi điện: "Trên app ghi 25.000đ mà thu ngân tính 30.000đ". Bạn không hề cache sai — bạn cache đúng thứ không được phép cache.',
    theory:
      'Service worker là một lớp chặn nằm giữa trang và mạng: mọi request đều đi qua nó, và NÓ quyết định lấy từ đâu. Cú pháp học một buổi là xong. Phán đoán mới là phần khó, và chỉ có ba chiến lược đáng nhớ:\n\n· CACHE-FIRST: có trong cache thì trả ngay, không hỏi mạng. Nhanh nhất, offline vẫn chạy. Nhưng nội dung có thể cũ vô thời hạn.\n· NETWORK-FIRST: hỏi mạng trước, hỏng thì mới lấy cache làm phao. Luôn mới, nhưng mạng chậm thì người dùng chờ.\n· STALE-WHILE-REVALIDATE: trả cache ngay cho nhanh, đồng thời âm thầm tải bản mới cho lần sau. Nhanh, nhưng lần này người dùng vẫn thấy bản cũ.\n\nChọn theo hai câu hỏi, không theo sở thích:\n\n① Thứ này CŨ MỘT NGÀY thì có hại không? Có hại (giá tiền, số dư, tin nhắn, tồn kho) → network-first. Vô hại (logo, font, ảnh, mã hash) → cache-first.\n② Thứ này KHÔNG CÓ thì trang còn dùng được không? Không (khung app, CSS gốc) → phải cache-first, vì đó là điều kiện để mở được app lúc mất mạng.\n\nHai luật cứng, học bằng máu của nhiều dự án:\n\n· ĐỪNG BAO GIỜ cache-first thứ có tên KHÔNG đổi khi nội dung đổi. Tài nguyên có hash trong tên (`app.7f3a.js`) thì cache-first vĩnh viễn là an toàn tuyệt đối — tên mới nghĩa là nội dung mới. Còn `/api/gia-san-pham` thì tên y nguyên mà nội dung đổi hằng giờ.\n· ĐỪNG cache phản hồi có dữ liệu riêng của người dùng vào cache dùng chung. Máy tính công cộng, hai người đăng nhập nối nhau — người sau đọc được đơn hàng của người trước. Đây là lỗ hổng, không phải lỗi hiệu năng.\n\nCòn một cái bẫy nữa mà chỉ gặp khi đã có người dùng thật: cập nhật service worker. Bản mới cài xong nhưng bản cũ vẫn đang điều khiển các tab đang mở. Ép nó chiếm quyền ngay giữa lúc người ta đang thao tác thì có thể trộn code mới với dữ liệu cũ. Cách an toàn là chờ người dùng đóng hết tab, hoặc hỏi một câu "đã có bản mới, tải lại?" — chứ không tự ý.',
    workedExample: {
      code: `type ChienLuoc = "cache-first" | "network-first" | "swr"

interface TaiNguyen {
  duong: string
  coHashTrongTen: boolean
  riengTuNguoiDung: boolean
}

// Phán đoán viết thành hàm THUẦN — nhờ vậy nó review được và test được
function chon(tn: TaiNguyen): ChienLuoc {
  // Dữ liệu riêng của người dùng: không được nằm trong cache dùng chung
  if (tn.riengTuNguoiDung) return "network-first"
  // Tên đã có hash: nội dung đổi thì tên đổi — cache mãi mãi vẫn an toàn
  if (tn.coHashTrongTen) return "cache-first"
  // Dữ liệu động: cũ một ngày là hại
  if (tn.duong.startsWith("/api/")) return "network-first"
  // Còn lại (khung app, ảnh, font tên cố định): nhanh trước, mới sau
  return "swr"
}

const ds: TaiNguyen[] = [
  { duong: "/app.7f3a.js", coHashTrongTen: true, riengTuNguoiDung: false },
  { duong: "/api/gia-san-pham", coHashTrongTen: false, riengTuNguoiDung: false },
  { duong: "/api/don-hang-cua-toi", coHashTrongTen: false, riengTuNguoiDung: true },
  { duong: "/logo.png", coHashTrongTen: false, riengTuNguoiDung: false },
]

for (const tn of ds) {
  console.log(tn.duong, "->", chon(tn))
}
// Đọc kết quả: hai đường /api/ cùng ra network-first nhưng vì hai lý do khác nhau —
// một cái sợ dữ liệu cũ, một cái sợ lộ dữ liệu người khác.`,
      stdinLines: [],
    },
    predict: {
      code: `type ChienLuoc = "cache-first" | "network-first"

interface TaiNguyen {
  duong: string
  riengTuNguoiDung: boolean
}

// Cách SAI: "cứ cache hết cho nhanh", chỉ chừa mỗi đường /api/
function chon(tn: TaiNguyen): ChienLuoc {
  if (tn.duong.startsWith("/api/")) return "network-first"
  return "cache-first"
}

const hoaDon: TaiNguyen = { duong: "/hoa-don/2026-08/an.pdf", riengTuNguoiDung: true }
console.log("Hoa don rieng ->", chon(hoaDon))`,
      question: 'Chương trình in ra gì?',
      choices: [
        'Hoa don rieng -> cache-first',
        'Hoa don rieng -> network-first',
        'Hoa don rieng -> swr',
        'Hoa don rieng -> khong cache',
      ],
      answerIndex: 0,
      explain:
        'In ra "cache-first" — và đó là một lỗ hổng bảo mật, không phải lựa chọn hiệu năng. Hàm chỉ nhìn tiền tố đường dẫn nên hoá đơn riêng của An bị cất vào cache dùng chung của trình duyệt; trên máy tính công cộng, người đăng nhập sau mở đúng đường dẫn đó là đọc được file của An. Trường `riengTuNguoiDung` có sẵn ngay trong dữ liệu mà hàm không thèm xét — cache sai chỗ không báo lỗi, nó chỉ im lặng làm rò dữ liệu.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm chọn chiến lược: xét ca nguy hiểm nhất trước, ca an toàn tuyệt đối sau, rồi mới tới mặc định.',
      lines: [
        'function chon(tn: TaiNguyen): ChienLuoc {',
        '  if (tn.riengTuNguoiDung) return "network-first"',
        '  if (tn.coHashTrongTen) return "cache-first"',
        '  if (tn.duong.startsWith("/api/")) return "network-first"',
        '  return "swr"',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm `chon(tn: TaiNguyen): ChienLuoc` quyết định chiến lược cache cho service worker.\n\nLuật, xét THEO ĐÚNG THỨ TỰ NÀY (thứ tự chính là bài học — ca nguy hiểm nhất chặn trước):\n① `riengTuNguoiDung` là true → "network-first" (không được vào cache dùng chung).\n② `coHashTrongTen` là true → "cache-first" (tên đổi khi nội dung đổi, cache mãi vẫn đúng).\n③ đường dẫn bắt đầu bằng "/api/" → "network-first" (dữ liệu cũ là dữ liệu sai).\n④ còn lại → "swr".',
      starterCode: `type ChienLuoc = "cache-first" | "network-first" | "swr"

interface TaiNguyen {
  duong: string
  coHashTrongTen: boolean
  riengTuNguoiDung: boolean
}

function chon(tn: TaiNguyen): ChienLuoc {
  // TODO: bốn luật, đúng thứ tự trong đề
  return "swr"
}

// ---- Đừng sửa phần dưới đây ----
const ds: TaiNguyen[] = [
  { duong: "/app.7f3a.js", coHashTrongTen: true, riengTuNguoiDung: false },
  { duong: "/api/gia-san-pham", coHashTrongTen: false, riengTuNguoiDung: false },
  { duong: "/api/don-hang-cua-toi", coHashTrongTen: false, riengTuNguoiDung: true },
  { duong: "/logo.png", coHashTrongTen: false, riengTuNguoiDung: false },
  { duong: "/hoa-don.a91b.pdf", coHashTrongTen: true, riengTuNguoiDung: true },
]

for (const tn of ds) {
  console.log(tn.duong, "->", chon(tn))
}`,
      testCases: [
        {
          stdinLines: [],
          expected: '/app.7f3a.js -> cache-first',
          match: 'contains',
          hidden: false,
          label: 'Tên có hash → cache mãi mãi vẫn an toàn',
        },
        {
          stdinLines: [],
          expected: '/api/gia-san-pham -> network-first',
          match: 'contains',
          hidden: false,
          label: 'Giá tiền cũ là giá tiền sai → luôn hỏi mạng trước',
        },
        {
          stdinLines: [],
          expected: '/logo.png -> swr',
          match: 'contains',
          hidden: false,
          label: 'Ảnh tên cố định, không riêng tư → nhanh trước, mới sau',
        },
        {
          stdinLines: [],
          expected: '/hoa-don.a91b.pdf -> network-first',
          match: 'contains',
          hidden: false,
          label: 'BẪY: có hash NHƯNG riêng tư — luật riêng tư phải chặn TRƯỚC luật hash',
        },
        {
          stdinLines: [],
          expected: '/api/don-hang-cua-toi -> network-first',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — vừa /api/ vừa riêng tư, vẫn phải là network-first',
        },
      ],
      hints: [
        'Bốn câu `if` liên tiếp, mỗi câu `return` ngay — không cần else, không cần biến trung gian.',
        'Ca "/hoa-don.a91b.pdf" là chỗ duy nhất phân biệt người hiểu bài với người chép luật: nó thoả CẢ HAI điều kiện ① và ②. Ai xét hash trước sẽ cache-first một file riêng tư.',
        'Chuỗi trả về phải khớp từng ký tự: "cache-first", "network-first", "swr". Viết hoa hay thừa dấu cách là test đỏ dù logic đúng.',
        'Khung tham chiếu:\n\nfunction chon(tn: TaiNguyen): ChienLuoc {\n  if (tn.riengTuNguoiDung) return "network-first"\n  if (tn.coHashTrongTen) return "cache-first"\n  if (tn.duong.startsWith("/api/")) return "network-first"\n  return "swr"\n}',
      ],
      sampleSolution: `type ChienLuoc = "cache-first" | "network-first" | "swr"

interface TaiNguyen {
  duong: string
  coHashTrongTen: boolean
  riengTuNguoiDung: boolean
}

function chon(tn: TaiNguyen): ChienLuoc {
  if (tn.riengTuNguoiDung) return "network-first"
  if (tn.coHashTrongTen) return "cache-first"
  if (tn.duong.startsWith("/api/")) return "network-first"
  return "swr"
}

// ---- Đừng sửa phần dưới đây ----
const ds: TaiNguyen[] = [
  { duong: "/app.7f3a.js", coHashTrongTen: true, riengTuNguoiDung: false },
  { duong: "/api/gia-san-pham", coHashTrongTen: false, riengTuNguoiDung: false },
  { duong: "/api/don-hang-cua-toi", coHashTrongTen: false, riengTuNguoiDung: true },
  { duong: "/logo.png", coHashTrongTen: false, riengTuNguoiDung: false },
  { duong: "/hoa-don.a91b.pdf", coHashTrongTen: true, riengTuNguoiDung: true },
]

for (const tn of ds) {
  console.log(tn.duong, "->", chon(tn))
}`,
    },
    homework:
      'Mở một web app bạn hay dùng, vào DevTools tab Application → Cache Storage, xem họ đã cache những gì. Tự chấm từng mục theo hai câu hỏi trong bài: cũ một ngày có hại không, thiếu nó app còn mở được không. Tìm cho ra ít nhất một mục bạn cho là họ chọn sai và viết một câu lý do — bài tập này rèn đúng thứ chuyên gia làm khi nhận bàn giao một dự án lạ.',
    srsCards: [
      {
        hoi: 'Khi nào cache-first là an toàn tuyệt đối?',
        dap: 'Khi tên tài nguyên có hash nội dung (ví dụ app.7f3a.js): nội dung đổi thì tên đổi, nên bản cũ trong cache không bao giờ bị hiểu nhầm là bản mới. Tài nguyên tên cố định mà nội dung đổi thì không được cache-first.',
      },
      {
        hoi: 'Vì sao không được cache phản hồi chứa dữ liệu riêng của người dùng?',
        dap: 'Vì cache của trình duyệt dùng chung cho mọi phiên trên máy đó: trên máy công cộng, người đăng nhập sau mở đúng đường dẫn là đọc được dữ liệu của người trước. Đó là lỗ hổng bảo mật chứ không phải lựa chọn hiệu năng.',
      },
      {
        hoi: 'Hai câu hỏi nào quyết định chọn chiến lược cache cho một tài nguyên?',
        dap: 'Một, thứ này cũ một ngày thì có hại không (có hại thì network-first). Hai, thiếu nó thì trang còn mở được không (không mở được thì phải cache-first để chạy được lúc mất mạng).',
      },
    ],
  },
  {
    id: 'p6-u23-l2',
    unitId: 'p6-u23',
    language: 'typescript',
    title: 'Hàng đợi ghi lúc offline — hai máy phải ra cùng một kết quả',
    hook: 'Anh soạn ghi chú trên điện thoại lúc đang trong hầm gửi xe, chị sửa cùng ghi chú đó trên laptop. Cả hai lên mạng lại cùng lúc. Máy anh hiện bản của anh, máy chị hiện bản của chị, server giữ bản thứ ba. Không máy nào báo lỗi.',
    theory:
      'App offline-first ghi vào IndexedDB trước, xếp thay đổi vào một HÀNG ĐỢI, rồi gửi lên khi có mạng. Phần dễ là hàng đợi. Phần quyết định sản phẩm sống hay chết là: hai thay đổi cùng chạm một bản ghi thì ai thắng.\n\nLuật nền: quy tắc thắng thua phải THUẦN và TẤT ĐỊNH — cùng tập thay đổi thì mọi máy, chạy lúc nào cũng ra cùng kết quả. Không có tính chất đó thì "đồng bộ" chỉ là một cách nói khác của "dữ liệu mỗi máy một kiểu".\n\nCách phổ biến nhất là LWW (last-write-wins): ai có mốc thời gian lớn hơn thì thắng. Nhưng LWW ngây thơ có hai lỗ thủng, và biết hai lỗ này là ranh giới giữa người dùng thư viện và người hiểu nó:\n\n① ĐỒNG HỒ MÁY KHÁCH KHÔNG ĐÁNG TIN. Điện thoại lệch giờ 3 phút, hoặc người dùng tự chỉnh đồng hồ, là thay đổi cũ đè lên thay đổi mới. Nên mốc thời gian nào quyết định thắng thua thì phải do SERVER đóng dấu, hoặc dùng đồng hồ logic (Lamport) thay vì giờ treo tường.\n② HAI MỐC BẰNG NHAU. Hiếm, nhưng có — và lúc đó nếu quy tắc là "cái nào tới trước thì giữ" thì kết quả phụ thuộc thứ tự gửi lên, tức là mỗi máy một kiểu. Phải có một tiêu chí phụ TẤT ĐỊNH để phá hoà, ví dụ so mã thiết bị theo thứ tự chữ cái. Xấu về mặt nghiệp vụ, nhưng nhất quán — và nhất quán mới là thứ không thương lượng được.\n\nĐiều LWW không làm được: nó VỨT một bên đi. Anh viết thêm một đoạn, chị sửa chính tả — LWW giữ đúng một người, công của người kia mất sạch mà không ai được báo. Muốn giữ cả hai thì phải hợp nhất ở mức thao tác (CRDT/OT), đắt hơn nhiều bậc. Phán đoán của chuyên gia là biết khi nào chịu mất (một trường trạng thái, một nút bật/tắt) và khi nào không được phép mất (nội dung do người dùng gõ ra).\n\nCuối cùng: mỗi thay đổi trong hàng đợi phải có ID riêng, vì gửi lên mà mất mạng giữa chừng thì client sẽ gửi lại — server phải nhận ra "cái này xử lý rồi" thay vì tạo thêm một bản ghi nữa. Vẫn là tính lũy đẳng của bài trước, chỉ đổi chỗ áp dụng.',
    workedExample: {
      code: `interface ThayDoi {
  id: string        // id riêng của thay đổi — để gửi lại không tạo bản ghi thứ hai
  banGhi: string    // sửa ghi chú nào
  noiDung: string
  luc: number       // mốc do SERVER đóng dấu, không lấy giờ máy khách
  thietBi: string   // dùng để phá hoà khi luc bằng nhau
}

// Thắng thua TẤT ĐỊNH: luc lớn hơn thắng; bằng nhau thì mã thiết bị lớn hơn thắng
function thangHon(a: ThayDoi, b: ThayDoi): ThayDoi {
  if (a.luc !== b.luc) return a.luc > b.luc ? a : b
  return a.thietBi > b.thietBi ? a : b
}

function honNhat(hangDoi: ThayDoi[]): Map<string, string> {
  const daXuLy = new Set<string>()
  const thang = new Map<string, ThayDoi>()
  for (const td of hangDoi) {
    if (daXuLy.has(td.id)) continue        // gửi lại: bỏ qua, đã xử lý rồi
    daXuLy.add(td.id)
    const cu = thang.get(td.banGhi)
    thang.set(td.banGhi, cu === undefined ? td : thangHon(cu, td))
  }
  const ketQua = new Map<string, string>()
  for (const [banGhi, td] of thang) ketQua.set(banGhi, td.noiDung)
  return ketQua
}

const hangDoi: ThayDoi[] = [
  { id: "t1", banGhi: "ghi-chu-1", noiDung: "mua rau", luc: 10, thietBi: "dtdd" },
  { id: "t2", banGhi: "ghi-chu-1", noiDung: "mua rau va ca", luc: 20, thietBi: "laptop" },
  { id: "t1", banGhi: "ghi-chu-1", noiDung: "mua rau", luc: 10, thietBi: "dtdd" },
]

console.log("ghi-chu-1 =", honNhat(hangDoi).get("ghi-chu-1"))
// Đọc kết quả: "mua rau va ca" — bản luc=20 thắng, và lần gửi lại của t1 không đổi được gì.`,
      stdinLines: [],
    },
    predict: {
      code: `interface ThayDoi {
  banGhi: string
  noiDung: string
  luc: number
}

// Cách SAI: cứ cái nào gửi lên sau thì ghi đè, không nhìn mốc thời gian
function honNhat(hangDoi: ThayDoi[]): string {
  let noiDung = ""
  for (const td of hangDoi) {
    noiDung = td.noiDung
  }
  return noiDung
}

// Điện thoại ra khỏi hầm gửi xe muộn hơn, nhưng thay đổi của nó CŨ hơn (luc 10 < 20)
const hangDoi: ThayDoi[] = [
  { banGhi: "n1", noiDung: "mua rau va ca", luc: 20 },
  { banGhi: "n1", noiDung: "mua rau", luc: 10 },
]

console.log("Ket qua:", honNhat(hangDoi))`,
      question: 'Chương trình in ra gì?',
      choices: [
        'Ket qua: mua rau',
        'Ket qua: mua rau va ca',
        'Ket qua: mua rau,mua rau va ca',
        'Ket qua: (rong)',
      ],
      answerIndex: 0,
      explain:
        'In ra "mua rau" — bản CŨ hơn thắng, vì hàm này lấy thứ tự GỬI LÊN làm luật thay vì mốc thời gian của thay đổi. Máy nào ra khỏi vùng mất sóng muộn hơn thì thắng, dù người đó gõ trước cả tiếng. Người dùng mất chữ mà không có bất kỳ thông báo nào — đây là dạng mất dữ liệu tệ nhất, vì nó im lặng.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm phân định thắng thua: so mốc thời gian trước, bằng nhau thì phá hoà bằng mã thiết bị.',
      lines: [
        'function thangHon(a: ThayDoi, b: ThayDoi): ThayDoi {',
        '  if (a.luc !== b.luc) return a.luc > b.luc ? a : b',
        '  return a.thietBi > b.thietBi ? a : b',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm `honNhat(hangDoi: ThayDoi[]): Map<string, string>` gộp hàng đợi ghi offline thành nội dung cuối của từng bản ghi.\n\nLuật:\n· Thay đổi có `id` đã gặp rồi thì BỎ QUA (client gửi lại không được tính hai lần).\n· Cùng một `banGhi`: thay đổi có `luc` lớn hơn thắng.\n· `luc` bằng nhau: mã `thietBi` LỚN HƠN theo thứ tự chuỗi thắng (phá hoà tất định, để mọi máy ra cùng kết quả).\n· Kết quả là Map từ `banGhi` sang `noiDung` của thay đổi thắng.',
      starterCode: `interface ThayDoi {
  id: string
  banGhi: string
  noiDung: string
  luc: number
  thietBi: string
}

function honNhat(hangDoi: ThayDoi[]): Map<string, string> {
  // TODO: bỏ trùng theo id, rồi chọn thay đổi thắng cho từng bản ghi
  return new Map<string, string>()
}

// ---- Đừng sửa phần dưới đây ----
const hangDoi: ThayDoi[] = [
  { id: "t1", banGhi: "n1", noiDung: "mua rau", luc: 10, thietBi: "dtdd" },
  { id: "t2", banGhi: "n1", noiDung: "mua rau va ca", luc: 20, thietBi: "laptop" },
  { id: "t1", banGhi: "n1", noiDung: "mua rau", luc: 10, thietBi: "dtdd" },
  { id: "t3", banGhi: "n2", noiDung: "goi me", luc: 30, thietBi: "aaa" },
  { id: "t4", banGhi: "n2", noiDung: "goi bo", luc: 30, thietBi: "zzz" },
]
const daoNguoc: ThayDoi[] = [...hangDoi].reverse()

const kq = honNhat(hangDoi)
console.log("n1 =", kq.get("n1"))
console.log("n2 =", kq.get("n2"))
console.log("So ban ghi:", kq.size)
console.log("On dinh:", honNhat(daoNguoc).get("n2") === kq.get("n2") ? "co" : "khong")`,
      testCases: [
        {
          stdinLines: [],
          expected: 'n1 = mua rau va ca',
          match: 'contains',
          hidden: false,
          label: 'luc 20 thắng luc 10, và lần gửi lại của t1 không lật ngược được',
        },
        {
          stdinLines: [],
          expected: 'n2 = goi bo',
          match: 'contains',
          hidden: false,
          label: 'Hai thay đổi cùng luc 30 — phá hoà bằng thietBi lớn hơn ("zzz" > "aaa")',
        },
        {
          stdinLines: [],
          expected: 'So ban ghi: 2',
          match: 'contains',
          hidden: false,
          label: 'Năm thay đổi nhưng chỉ hai bản ghi — kết quả gộp theo banGhi',
        },
        {
          stdinLines: [],
          expected: 'On dinh: co',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — đảo ngược thứ tự gửi lên vẫn phải ra cùng kết quả',
        },
      ],
      hints: [
        'Cần ba thứ: một `Set<string>` cho các id đã xử lý, một `Map<string, ThayDoi>` giữ thay đổi đang thắng của từng bản ghi, và vòng lặp cuối đổi nó thành `Map<string, string>`.',
        'Bỏ trùng phải làm TRƯỚC khi so thắng thua: `if (daXuLy.has(td.id)) continue`, rồi mới `daXuLy.add(td.id)`.',
        'Ca "n2" bắt đúng lỗi hay gặp nhất: viết `a.luc >= b.luc ? a : b` trong một hàm so sánh sẽ khiến kết quả phụ thuộc thứ tự duyệt, và ca ẩn "On dinh" sẽ đỏ. Khi `luc` bằng nhau thì phải so `thietBi`.',
        'Khung tham chiếu cho phần chọn:\n\nconst cu = thang.get(td.banGhi)\nthang.set(td.banGhi, cu === undefined ? td : thangHon(cu, td))',
      ],
      sampleSolution: `interface ThayDoi {
  id: string
  banGhi: string
  noiDung: string
  luc: number
  thietBi: string
}

function thangHon(a: ThayDoi, b: ThayDoi): ThayDoi {
  if (a.luc !== b.luc) return a.luc > b.luc ? a : b
  return a.thietBi > b.thietBi ? a : b
}

function honNhat(hangDoi: ThayDoi[]): Map<string, string> {
  const daXuLy = new Set<string>()
  const thang = new Map<string, ThayDoi>()
  for (const td of hangDoi) {
    if (daXuLy.has(td.id)) continue
    daXuLy.add(td.id)
    const cu = thang.get(td.banGhi)
    thang.set(td.banGhi, cu === undefined ? td : thangHon(cu, td))
  }
  const ketQua = new Map<string, string>()
  for (const [banGhi, td] of thang) ketQua.set(banGhi, td.noiDung)
  return ketQua
}

// ---- Đừng sửa phần dưới đây ----
const hangDoi: ThayDoi[] = [
  { id: "t1", banGhi: "n1", noiDung: "mua rau", luc: 10, thietBi: "dtdd" },
  { id: "t2", banGhi: "n1", noiDung: "mua rau va ca", luc: 20, thietBi: "laptop" },
  { id: "t1", banGhi: "n1", noiDung: "mua rau", luc: 10, thietBi: "dtdd" },
  { id: "t3", banGhi: "n2", noiDung: "goi me", luc: 30, thietBi: "aaa" },
  { id: "t4", banGhi: "n2", noiDung: "goi bo", luc: 30, thietBi: "zzz" },
]
const daoNguoc: ThayDoi[] = [...hangDoi].reverse()

const kq = honNhat(hangDoi)
console.log("n1 =", kq.get("n1"))
console.log("n2 =", kq.get("n2"))
console.log("So ban ghi:", kq.size)
console.log("On dinh:", honNhat(daoNguoc).get("n2") === kq.get("n2") ? "co" : "khong")`,
    },
    homework:
      'Lấy đúng tính năng "Đếm ngược kỳ thi" (`/on-thi`) của dự án này: lịch tính ở client, server chỉ giữ ý định. Giả sử người học khai ngày thi trên điện thoại lúc offline, rồi sửa lại trên máy tính. Viết ra ba dòng: (1) trường nào là "ý định" có thể xung đột, (2) mốc thời gian nào bạn sẽ dùng để phân định và ai đóng dấu nó, (3) trường nào mà LWW là chấp nhận được và trường nào thì mất dữ liệu là không thể tha thứ.',
    srsCards: [
      {
        hoi: 'Vì sao không được lấy giờ máy khách làm mốc phân định thắng thua trong LWW?',
        dap: 'Vì đồng hồ máy khách có thể lệch hoặc bị người dùng chỉnh, khiến một thay đổi cũ có mốc lớn hơn và đè lên thay đổi mới. Mốc quyết định phải do server đóng dấu, hoặc dùng đồng hồ logic thay cho giờ treo tường.',
      },
      {
        hoi: 'Khi hai thay đổi có mốc thời gian bằng nhau thì phải làm gì?',
        dap: 'Phá hoà bằng một tiêu chí phụ tất định, ví dụ so mã thiết bị theo thứ tự chuỗi. Nếu để "cái nào tới trước thì giữ" thì kết quả phụ thuộc thứ tự gửi lên và mỗi máy sẽ ra một dữ liệu khác nhau.',
      },
      {
        hoi: 'Điểm yếu cốt lõi của last-write-wins là gì?',
        dap: 'Nó vứt hẳn một bên đi mà không báo cho ai: hai người sửa hai chỗ khác nhau trong cùng bản ghi thì công của một người mất sạch. Muốn giữ cả hai phải hợp nhất ở mức thao tác bằng CRDT hoặc OT, đắt hơn nhiều bậc.',
      },
    ],
  },
]
