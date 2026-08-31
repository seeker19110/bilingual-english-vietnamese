// lessons/p6u117.ts — P6-U117: HƯỚNG KIẾN TRÚC, chặng S2 "Hợp đồng & mô hình miền" —
// Mô hình hoá miền (module `architecture-s2-m1`).
//
// architecture-s1 dạy CẮT RANH GIỚI giữa các module. S2 hỏi câu tiếp theo: bên trong mỗi
// ranh giới ấy, dữ liệu được GỌI TÊN và ĐỊNH NGHĨA thế nào cho khỏi hiểu nhầm. Hai bài ở đây
// dạy hai trụ của mô hình hoá miền (DDD): ① ngôn ngữ chung + ngữ cảnh giới hạn — cùng một
// chữ mang nghĩa khác nhau ở hai bộ phận; ② thực thể vs giá trị + bất biến nghiệp vụ.
//
// Dùng làn `typescript`, mô phỏng bằng hàm thuần tất định — không hạ tầng thật.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U117_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u117-l1',
    unitId: 'p6-u117',
    language: 'typescript',
    title: 'Ngôn ngữ chung & ngữ cảnh giới hạn — cùng chữ "đơn hàng", hai nghĩa khác nhau',
    hook: 'Anh thủ kho nói "đơn hàng này 3 kiện, giao quận 7". Chị kế toán nói "đơn hàng này 250 nghìn, chưa xuất hoá đơn". Hai người dùng CÙNG MỘT CHỮ mà đang nói về hai thứ khác nhau. Lập trình viên nghe xong, gộp cả hai vào một class Order 40 trường — và bắt đầu ba năm sửa lỗi.',
    theory:
      'NGÔN NGỮ CHUNG (ubiquitous language) là luật đầu tiên của mô hình hoá miền: tên trong code phải TRÙNG tên người làm nghiệp vụ dùng hằng ngày. Nghiệp vụ nói "phiếu xuất kho" thì code đặt `phieuXuatKho`, không đặt `DocumentB`. Vì sao đây là chuyện kiến trúc chứ không phải chuyện thẩm mỹ: mỗi lần dịch từ ngôn ngữ nghiệp vụ sang ngôn ngữ code là một lần có cơ hội dịch sai, và cái sai đó không lộ ra cho tới lúc tính nhầm tiền.\n\nNhưng ngôn ngữ chung có một giới hạn quan trọng: nó chỉ chung TRONG MỘT PHẠM VI. Đó là NGỮ CẢNH GIỚI HẠN (bounded context) — vùng mà mỗi từ có đúng MỘT nghĩa.\n\nVí dụ chữ "đơn hàng" trong một cửa hàng online:\n\n- Ở ngữ cảnh KHO: đơn hàng = danh sách món cần lấy khỏi kệ + số kiện + địa chỉ giao. Kho KHÔNG quan tâm giá tiền.\n- Ở ngữ cảnh KẾ TOÁN: đơn hàng = tổng tiền + thuế + trạng thái hoá đơn. Kế toán KHÔNG quan tâm hàng nằm kệ nào.\n- Ở ngữ cảnh CHĂM SÓC KHÁCH: đơn hàng = lịch sử liên lạc + khiếu nại.\n\nSai lầm kinh điển là cố gắng làm MỘT mô hình "đơn hàng" đúng cho cả ba. Kết quả là một kiểu dữ liệu khổng lồ mà mỗi ngữ cảnh chỉ dùng một phần ba, phần còn lại luôn `null` — và không ai dám xoá trường nào vì "biết đâu chỗ kia dùng".\n\nCách làm đúng: MỖI ngữ cảnh có mô hình RIÊNG của nó, và giữa hai ngữ cảnh là một HỢP ĐỒNG dịch qua lại (chỉ vài trường thật sự cần đi qua ranh giới, thường là mã đơn để nối hai bên). Hai mô hình được phép tiến hoá độc lập — kho thêm trường "kệ" không làm kế toán phải build lại.\n\nDấu hiệu bạn đang thiếu ngữ cảnh giới hạn: một kiểu dữ liệu có tên rất chung ("Order", "User", "Item"), rất nhiều trường tuỳ chọn, và mỗi lần sửa nó là ba đội phải họp.',
    workedExample: {
      code: `// Mot don hang di qua BA ngu canh, moi noi chi lay phan minh can.
type BoiCanh = "kho" | "ketoan"

interface DonHangGoc {
  ma: string
  soKien: number
  tongTien: number
}

// KHONG lam mot ham "moTa" chung chung; moi ngu canh mot cach hieu rieng.
function moTaTheoBoiCanh(boiCanh: BoiCanh, don: DonHangGoc): string {
  if (boiCanh === "kho") {
    // Kho chi quan tam so kien de xep xe — khong nhac toi tien.
    return "Kho: don " + don.ma + " co " + don.soKien + " kien"
  }
  // Ke toan chi quan tam tien — khong nhac toi kien.
  return "Ke toan: don " + don.ma + " tri gia " + don.tongTien + " dong"
}

const don: DonHangGoc = { ma: "DH-1", soKien: 3, tongTien: 250000 }
console.log(moTaTheoBoiCanh("kho", don))
console.log(moTaTheoBoiCanh("ketoan", don))

// Diem chung DUY NHAT di qua ranh gioi hai ngu canh: ma don.
console.log("Khoa noi hai ngu canh:", don.ma)`,
      stdinLines: [],
    },
    predict: {
      code: `type BoiCanh = "kho" | "ketoan"
interface DonHangGoc {
  ma: string
  soKien: number
  tongTien: number
}
function moTaTheoBoiCanh(boiCanh: BoiCanh, don: DonHangGoc): string {
  if (boiCanh === "kho") {
    return "Kho: don " + don.ma + " co " + don.soKien + " kien"
  }
  return "Ke toan: don " + don.ma + " tri gia " + don.tongTien + " dong"
}
const don: DonHangGoc = { ma: "DH-7", soKien: 2, tongTien: 90000 }
console.log(moTaTheoBoiCanh("ketoan", don))`,
      question: 'Gọi với bối cảnh "ketoan" thì dòng in ra là gì?',
      choices: [
        'Ke toan: don DH-7 tri gia 90000 dong',
        'Kho: don DH-7 co 2 kien',
        'Ke toan: don DH-7 tri gia 2 kien',
        'Khong ro boi canh',
      ],
      answerIndex: 0,
      explain:
        'Bối cảnh "ketoan" đi thẳng xuống nhánh cuối, dùng `tongTien` = 90000. Điểm cốt lõi của bài: CÙNG một đối tượng `don` mà hai bối cảnh mô tả bằng hai bộ trường khác nhau — kho không bao giờ nhắc tiền, kế toán không bao giờ nhắc kiện. Đó chính là ngữ cảnh giới hạn thể hiện trong code.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm mô tả đơn hàng theo bối cảnh — nhánh kho trước, kế toán là nhánh mặc định.',
      lines: [
        'function moTaTheoBoiCanh(boiCanh: BoiCanh, don: DonHangGoc): string {',
        '  if (boiCanh === "kho") {',
        '    return "Kho: don " + don.ma + " co " + don.soKien + " kien"',
        '  }',
        '  return "Ke toan: don " + don.ma + " tri gia " + don.tongTien + " dong"',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm tomTat(boiCanh, don) tách một đơn hàng thành ba cách hiểu theo ba ngữ cảnh giới hạn.\n\nTham số `don` có ba trường: ma (chuỗi), soKien (số), tongTien (số). Trả về CHUỖI theo đúng bối cảnh:\n\n- "kho" → `Kho: don <ma> co <soKien> kien`\n- "ketoan" → `Ke toan: don <ma> tri gia <tongTien> dong`\n- "cskh" → `CSKH: dang ho tro don <ma>` (chăm sóc khách không cần biết kiện lẫn tiền)\n- bối cảnh khác → `Khong ro boi canh`\n\nChú ý: bối cảnh nào KHÔNG được nhắc tới trường nó không quan tâm — đó là toàn bộ bài học.',
      starterCode: `type BoiCanh = "kho" | "ketoan" | "cskh" | "khac"

interface DonHangGoc {
  ma: string
  soKien: number
  tongTien: number
}

function tomTat(boiCanh: BoiCanh, don: DonHangGoc): string {
  // TODO: moi ngu canh mot cach hieu rieng
  return ""
}

// ---- Đừng sửa phần dưới đây ----
const donTest: DonHangGoc = { ma: "DH-9", soKien: 4, tongTien: 180000 }
console.log(tomTat("kho", donTest))
console.log(tomTat("ketoan", donTest))
console.log(tomTat("cskh", donTest))
console.log(tomTat("khac", donTest))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Kho: don DH-9 co 4 kien',
          match: 'contains',
          hidden: false,
          label: 'Ngữ cảnh kho — chỉ nói số kiện, không nói tiền',
        },
        {
          stdinLines: [],
          expected: 'Ke toan: don DH-9 tri gia 180000 dong',
          match: 'contains',
          hidden: false,
          label: 'Ngữ cảnh kế toán — chỉ nói tiền, không nói kiện',
        },
        {
          stdinLines: [],
          expected: 'CSKH: dang ho tro don DH-9',
          match: 'contains',
          hidden: false,
          label: 'Ngữ cảnh chăm sóc khách — chỉ cần mã đơn',
        },
        {
          stdinLines: [],
          expected:
            'Kho: don DH-9 co 4 kien\nKe toan: don DH-9 tri gia 180000 dong\nCSKH: dang ho tro don DH-9\nKhong ro boi canh',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đủ bốn dòng đúng thứ tự, kể cả nhánh bối cảnh lạ',
        },
      ],
      hints: [
        'Dùng chuỗi if/else theo từng giá trị của boiCanh, hoặc switch — nhớ có nhánh cuối trả "Khong ro boi canh".',
        'Nối chuỗi bằng dấu + và đừng quên khoảng trắng hai bên, ví dụ "Kho: don " + don.ma + " co " + don.soKien + " kien".',
        'Nhánh "cskh" CHỈ dùng don.ma — cố tình không đụng tới soKien và tongTien, vì ngữ cảnh đó không quan tâm hai trường ấy.',
      ],
      sampleSolution: `type BoiCanh = "kho" | "ketoan" | "cskh" | "khac"

interface DonHangGoc {
  ma: string
  soKien: number
  tongTien: number
}

function tomTat(boiCanh: BoiCanh, don: DonHangGoc): string {
  if (boiCanh === "kho") {
    return "Kho: don " + don.ma + " co " + don.soKien + " kien"
  }
  if (boiCanh === "ketoan") {
    return "Ke toan: don " + don.ma + " tri gia " + don.tongTien + " dong"
  }
  if (boiCanh === "cskh") {
    return "CSKH: dang ho tro don " + don.ma
  }
  return "Khong ro boi canh"
}

// ---- Đừng sửa phần dưới đây ----
const donTest: DonHangGoc = { ma: "DH-9", soKien: 4, tongTien: 180000 }
console.log(tomTat("kho", donTest))
console.log(tomTat("ketoan", donTest))
console.log(tomTat("cskh", donTest))
console.log(tomTat("khac", donTest))`,
    },
    homework:
      'Chọn một chỗ làm/lớp học/nhóm bạn biết và tìm MỘT từ được hai bộ phận dùng với hai nghĩa khác nhau (ví dụ "học sinh" với giáo vụ là hồ sơ nhập học, với giáo viên là người ngồi trong lớp; "khách" với bán hàng là người đã mua, với marketing là người mới để lại số điện thoại). Viết ra hai định nghĩa đó, liệt kê trường dữ liệu của mỗi bên, rồi trả lời: nếu gộp thành một mô hình duy nhất thì trường nào sẽ luôn trống ở một trong hai bên?',
    srsCards: [
      {
        hoi: 'Ngôn ngữ chung trong mô hình hoá miền yêu cầu điều gì ở cách đặt tên?',
        dap: 'Tên trong code phải trùng đúng từ mà người làm nghiệp vụ dùng hằng ngày. Mỗi lần phải dịch từ ngôn ngữ nghiệp vụ sang tên khác trong code là một cơ hội dịch sai, và cái sai đó thường chỉ lộ ra khi đã tính nhầm.',
      },
      {
        hoi: 'Ngữ cảnh giới hạn giải quyết vấn đề gì?',
        dap: 'Nó khoanh vùng mà mỗi từ chỉ có đúng một nghĩa, nên cùng chữ "đơn hàng" được phép mang nghĩa khác nhau ở kho và ở kế toán, mỗi bên một mô hình riêng thay vì một mô hình khổng lồ dùng chung.',
      },
      {
        hoi: 'Dấu hiệu nào cho thấy một hệ thống đang thiếu ngữ cảnh giới hạn?',
        dap: 'Một kiểu dữ liệu tên rất chung (Order, User) với rất nhiều trường tuỳ chọn hầu như luôn null ở một nửa các chỗ dùng, và mỗi lần sửa nó là nhiều đội phải họp vì không ai dám xoá trường nào.',
      },
    ],
  },
  {
    id: 'p6-u117-l2',
    unitId: 'p6-u117',
    language: 'typescript',
    title: 'Thực thể vs giá trị, và bất biến nghiệp vụ — điều LUÔN đúng dù thao tác nào',
    hook: 'Hai tờ 50 nghìn giống hệt nhau thì tiêu tờ nào cũng như nhau — tiền là GIÁ TRỊ. Hai bạn cùng tên Nguyễn Văn An lại là hai người khác nhau, đổi tên vẫn là chính người đó — người là THỰC THỂ. Nhầm hai loại này là nhầm luôn cách so sánh, cách lưu, và cách sửa dữ liệu.',
    theory:
      'Mô hình miền phân biệt hai loại đối tượng, và cách phân biệt là hỏi: "cái này có DANH TÍNH RIÊNG không?"\n\n**THỰC THỂ (entity)** — có định danh riêng, tồn tại xuyên thời gian dù mọi thuộc tính đổi hết. Khách hàng, đơn hàng, tài khoản. Hai thực thể BẰNG NHAU khi CÙNG ĐỊNH DANH, bất kể các trường khác khác nhau (khách đổi tên, đổi số điện thoại vẫn là khách đó).\n\n**GIÁ TRỊ (value object)** — không có định danh, chỉ là dữ liệu mô tả. Số tiền, địa chỉ, khoảng thời gian, toạ độ. Hai giá trị BẰNG NHAU khi MỌI TRƯỜNG bằng nhau. Vì không có danh tính, giá trị nên là BẤT BIẾN (immutable): muốn đổi thì tạo cái mới, không sửa tại chỗ — giống như bạn không "sửa" số 5 thành số 7, bạn dùng số 7.\n\nHệ quả rất thực tế: nếu bạn sửa tại chỗ một đối tượng giá trị đang được nhiều nơi cùng tham chiếu, bạn vừa âm thầm đổi dữ liệu ở tất cả những nơi đó. Đây là một trong những lớp lỗi khó tìm nhất, và nó biến mất hoàn toàn nếu giá trị là bất biến.\n\n**BẤT BIẾN NGHIỆP VỤ (business invariant)** là mệnh đề LUÔN ĐÚNG, bất kể hệ thống đang chạy thao tác nào: tồn kho không âm; tổng tiền đơn hàng bằng tổng các dòng hàng; một ghế trong rạp chỉ bán cho một người; số dư sau khi rút không dưới hạn mức thấu chi.\n\nBất biến khác VALIDATION ĐẦU VÀO ở chỗ nào? Validation kiểm dữ liệu người dùng vừa gõ có hợp lệ không. Bất biến kiểm TRẠNG THÁI HỆ THỐNG sau mỗi thay đổi vẫn đúng luật nghiệp vụ. Một yêu cầu có thể hoàn toàn hợp lệ về hình thức (xuất kho 10 cái, số nguyên dương, đúng mã hàng) mà vẫn phá bất biến (trong kho chỉ còn 3 cái).\n\nLuật thi hành: đặt việc kiểm bất biến vào ĐÚNG MỘT CHỖ — bên trong chính đối tượng giữ trạng thái đó, và mọi thay đổi phải đi qua chỗ đó. Rải việc kiểm ra khắp các tầng gọi tới là bảo đảm sẽ có một đường gọi nào đó quên kiểm.',
    workedExample: {
      code: `// GIA TRI: bang nhau khi MOI TRUONG bang nhau, khong co dinh danh.
interface SoTien {
  soDong: number
  donVi: string
}

function tienBangNhau(a: SoTien, b: SoTien): boolean {
  return a.soDong === b.soDong && a.donVi === b.donVi
}

// THUC THE: bang nhau khi CUNG DINH DANH, du ten khac nhau.
interface KhachHang {
  id: string
  ten: string
}

function khachBangNhau(a: KhachHang, b: KhachHang): boolean {
  return a.id === b.id
}

console.log("Hai to 50k:", tienBangNhau({ soDong: 50000, donVi: "VND" }, { soDong: 50000, donVi: "VND" }))
console.log("Khach doi ten:", khachBangNhau({ id: "KH-1", ten: "An" }, { id: "KH-1", ten: "An Nguyen" }))
console.log("Hai khach trung ten:", khachBangNhau({ id: "KH-1", ten: "An" }, { id: "KH-2", ten: "An" }))

// BAT BIEN: ton kho khong bao gio am — kiem TRUOC khi doi trang thai.
function xuatKho(ton: number, soLuong: number): string {
  if (soLuong > ton) return "Tu choi: khong du ton kho"
  return "Ton kho con: " + (ton - soLuong)
}

console.log(xuatKho(10, 3))
console.log(xuatKho(10, 12))`,
      stdinLines: [],
    },
    predict: {
      code: `interface KhachHang {
  id: string
  ten: string
}
function khachBangNhau(a: KhachHang, b: KhachHang): boolean {
  return a.id === b.id
}
const x: KhachHang = { id: "KH-5", ten: "Binh" }
const y: KhachHang = { id: "KH-5", ten: "Nguyen Van Binh" }
const z: KhachHang = { id: "KH-6", ten: "Binh" }
console.log("cung id:", khachBangNhau(x, y), "- cung ten:", khachBangNhau(x, z))`,
      question: 'Dòng in ra là gì?',
      choices: [
        'cung id: true - cung ten: false',
        'cung id: false - cung ten: true',
        'cung id: true - cung ten: true',
        'cung id: false - cung ten: false',
      ],
      answerIndex: 0,
      explain:
        'Khách hàng là THỰC THỂ nên chỉ so `id`. x và y cùng id KH-5 → true dù tên viết khác (người ta bổ sung họ vào tên, vẫn là một người). x và z trùng tên nhưng khác id → false (hai người khác nhau tình cờ trùng tên). Nếu đem cách so của giá trị (so mọi trường) áp cho thực thể, bạn sẽ tạo ra một khách hàng mới mỗi lần người ta sửa tên.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm xuất kho có kiểm bất biến "tồn kho không âm" — kiểm TRƯỚC, đổi trạng thái SAU.',
      lines: [
        'function xuatKho(ton: number, soLuong: number): string {',
        '  if (soLuong > ton) return "Tu choi: khong du ton kho"',
        '  return "Ton kho con: " + (ton - soLuong)',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm xuatKho(ton, soLuong) canh HAI bất biến nghiệp vụ cùng lúc, và hàm tienBangNhau(a, b) so hai đối tượng giá trị.\n\nxuatKho(ton, soLuong) trả chuỗi:\n- soLuong <= 0 → `Tu choi: so luong phai duong` (yêu cầu vô nghĩa, chặn ngay)\n- soLuong > ton → `Tu choi: khong du ton kho` (đúng bất biến "tồn kho không âm")\n- còn lại → `Ton kho con: <ton - soLuong>`\n\nThứ tự kiểm quan trọng: kiểm số lượng dương TRƯỚC, vì xuất -5 cái sẽ LÀM TĂNG tồn kho nếu lọt qua.\n\ntienBangNhau(a, b) trả true khi CẢ soDong VÀ donVi bằng nhau (đối tượng giá trị so mọi trường).',
      starterCode: `interface SoTien {
  soDong: number
  donVi: string
}

function xuatKho(ton: number, soLuong: number): string {
  // TODO: kiem hai bat bien theo dung thu tu
  return ""
}

function tienBangNhau(a: SoTien, b: SoTien): boolean {
  // TODO: gia tri thi so MOI truong
  return false
}

// ---- Đừng sửa phần dưới đây ----
console.log(xuatKho(10, 4))
console.log(xuatKho(10, 25))
console.log(xuatKho(10, -5))
console.log("cung tien:", tienBangNhau({ soDong: 50000, donVi: "VND" }, { soDong: 50000, donVi: "VND" }))
console.log("khac don vi:", tienBangNhau({ soDong: 50000, donVi: "VND" }, { soDong: 50000, donVi: "USD" }))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Ton kho con: 6',
          match: 'contains',
          hidden: false,
          label: 'Xuất 4 trong 10 → còn 6, không phá bất biến nào',
        },
        {
          stdinLines: [],
          expected: 'Tu choi: khong du ton kho',
          match: 'contains',
          hidden: false,
          label: 'Xuất 25 khi chỉ còn 10 → chặn, vì tồn kho không được âm',
        },
        {
          stdinLines: [],
          expected: 'Tu choi: so luong phai duong',
          match: 'contains',
          hidden: false,
          label: 'Xuất -5 → chặn ngay ở kiểm thứ nhất (nếu lọt sẽ làm TĂNG tồn kho)',
        },
        {
          stdinLines: [],
          expected: 'cung tien: true',
          match: 'contains',
          hidden: false,
          label: 'Hai số tiền mọi trường bằng nhau → bằng nhau',
        },
        {
          stdinLines: [],
          expected:
            'Ton kho con: 6\nTu choi: khong du ton kho\nTu choi: so luong phai duong\ncung tien: true\nkhac don vi: false',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đủ năm dòng đúng thứ tự, gồm cả ca khác đơn vị tiền',
        },
      ],
      hints: [
        'Trong xuatKho, viết hai câu if trả về sớm trước, rồi mới tới dòng tính tồn kho còn lại.',
        'Thứ tự hai câu if không hoán đổi được: nếu kiểm "soLuong > ton" trước thì -5 lọt qua (vì -5 không lớn hơn 10) và tồn kho sẽ thành 15.',
        'tienBangNhau chỉ cần một biểu thức: a.soDong === b.soDong && a.donVi === b.donVi — đúng định nghĩa "giá trị bằng nhau khi mọi trường bằng nhau".',
      ],
      sampleSolution: `interface SoTien {
  soDong: number
  donVi: string
}

function xuatKho(ton: number, soLuong: number): string {
  if (soLuong <= 0) return "Tu choi: so luong phai duong"
  if (soLuong > ton) return "Tu choi: khong du ton kho"
  return "Ton kho con: " + (ton - soLuong)
}

function tienBangNhau(a: SoTien, b: SoTien): boolean {
  return a.soDong === b.soDong && a.donVi === b.donVi
}

// ---- Đừng sửa phần dưới đây ----
console.log(xuatKho(10, 4))
console.log(xuatKho(10, 25))
console.log(xuatKho(10, -5))
console.log("cung tien:", tienBangNhau({ soDong: 50000, donVi: "VND" }, { soDong: 50000, donVi: "VND" }))
console.log("khac don vi:", tienBangNhau({ soDong: 50000, donVi: "VND" }, { soDong: 50000, donVi: "USD" }))`,
    },
    homework:
      'Lấy một dự án bạn từng viết (hoặc bài tập cũ) và phân loại mọi kiểu dữ liệu trong đó thành THỰC THỂ hay GIÁ TRỊ, ghi rõ lý do bằng câu hỏi "cái này có định danh riêng không?". Sau đó viết ra 3 bất biến nghiệp vụ của dự án đó (dạng "luôn luôn ..."), và với mỗi bất biến, chỉ ra ĐÚNG MỘT chỗ trong code chịu trách nhiệm canh nó. Nếu bạn tìm thấy hai chỗ cùng canh một bất biến, đó là dấu hiệu sớm sẽ có một chỗ quên cập nhật.',
    srsCards: [
      {
        hoi: 'Câu hỏi nào phân biệt được thực thể với đối tượng giá trị?',
        dap: '"Cái này có định danh riêng tồn tại xuyên thời gian không?" Có thì là thực thể (so bằng định danh, mọi thuộc tính đổi vẫn là nó); không thì là giá trị (so bằng mọi trường, nên là bất biến).',
      },
      {
        hoi: 'Vì sao đối tượng giá trị nên bất biến, sửa thì tạo cái mới?',
        dap: 'Vì nó không có danh tính, nhiều nơi có thể cùng tham chiếu một đối tượng giá trị; sửa tại chỗ sẽ âm thầm đổi dữ liệu ở tất cả những nơi đó — một lớp lỗi rất khó tìm và biến mất hẳn khi giá trị bất biến.',
      },
      {
        hoi: 'Bất biến nghiệp vụ khác validation đầu vào ở chỗ nào?',
        dap: 'Validation kiểm dữ liệu vừa nhập có hợp lệ về hình thức không; bất biến kiểm trạng thái hệ thống sau mỗi thay đổi vẫn đúng luật nghiệp vụ. Yêu cầu xuất 10 cái hợp lệ hoàn toàn về hình thức vẫn phá bất biến nếu kho chỉ còn 3.',
      },
    ],
  },
]
