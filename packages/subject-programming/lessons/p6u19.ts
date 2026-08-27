// lessons/p6u19.ts — P6-U19: HƯỚNG KIẾN TRÚC, chặng S1 — module có ranh giới
// (`architecture-s1-m1`) và luật phụ thuộc một chiều (`architecture-s1-m2`).
//
// Vì sao mã unit bắt đầu từ u19: dải `p6-u5…p6-u15` do CHƯƠNG TRÌNH M giữ chỗ, `p6-u16…u18`
// là chặng S1 của hướng WEB. Mã unit là khoá tiến độ trong Postgres nên hai dòng việc không
// được lấn dải của nhau.
//
// THÁCH THỨC RIÊNG CỦA HƯỚNG NÀY và cách giải: nội dung ở đây là KỸ NĂNG ĐẶC TẢ chứ không
// phải cú pháp, mà bài Make thì phải chấm được bằng test-case. Cách giải quyết xuyên suốt ba
// unit: biến mỗi luật kiến trúc thành MỘT HÀM THUẦN đọc bản mô tả hệ thống rồi trả về báo cáo
// vi phạm. Học viên không "viết văn về kiến trúc" — họ viết đúng loại máy kiểm mà một dự án
// thật đặt trong CI (`npm run codemap`, lint luật phụ thuộc, test canh gác). Học xong là có
// công cụ dùng được, không phải chỉ có ý thức.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U19_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u19-l1',
    unitId: 'p6-u19',
    language: 'typescript',
    title: 'Trách nhiệm duy nhất — đo bằng "đổi cái này thì phải mở mấy file"',
    hook: 'Sếp bảo: "đổi luật giảm giá thôi, nhanh mà". Bạn mở 11 file. Sửa xong thì màn hình gửi email vỡ, vì nó cũng đang đọc chung cái hàm tính tiền đó. Không ai viết dòng code nào tệ cả — ranh giới module bị cắt sai từ đầu, và giá của nó được trả lại mỗi lần có yêu cầu mới.',
    theory:
      'Câu "mỗi module chỉ làm một việc" nghe thì hay nhưng không dùng được: "một việc" là bao nhiêu? Cách phát biểu dùng được nói về CON NGƯỜI chứ không về code:\n\n  Một module chỉ nên đổi vì MỘT lý do nghiệp vụ — tức chỉ nên có MỘT nhóm người có quyền yêu cầu nó đổi.\n\nModule "donHang" mà vừa đổi khi kinh doanh sửa luật giảm giá, vừa đổi khi kế toán sửa mẫu hoá đơn, vừa đổi khi kỹ thuật đổi cơ sở dữ liệu — đó là ba lý do, ba nhóm người. Ba nhóm ấy yêu cầu sửa vào ba thời điểm khác nhau, và mỗi lần sửa lại có nguy cơ làm hỏng phần của hai nhóm kia. Đó chính là lý do bạn phải mở 11 file.\n\nHAI THƯỚC ĐO, cả hai đều đếm được, không cần cảm tính:\n\n· KẾT DÍNH — đếm số lý do thay đổi của một module. 1 là tốt. Từ 2 trở lên là dấu hiệu module đang gánh việc của người khác.\n· GHÉP NỐI — đếm số module phải mở cho MỘT yêu cầu thay đổi. Trong dự án DHCB, con số này lấy được bằng máy: `npm run codemap -- impact <file>`.\n\nCẮT THEO NGHIỆP VỤ, ĐỪNG CẮT THEO LOẠI FILE. Cấu trúc `components/ utils/ services/` trông rất gọn, nhưng nó tách những thứ ĐỔI CÙNG LÚC ra ba thư mục khác nhau, và gom những thứ chẳng liên quan gì nhau vào cùng một thư mục. Thêm tính năng "đặt lịch" là phải rải code ra ba chỗ. Trong khi `datLich/ thanhToan/ hoSo/` giữ mọi thứ đổi cùng nhau nằm cạnh nhau — thêm tính năng là thêm MỘT thư mục, bỏ tính năng là xoá MỘT thư mục.\n\nMODULE ẨN CÁI GÌ. Một module tốt để lộ rất ít và giấu rất nhiều: giấu cấu trúc dữ liệu bên trong, giấu thư viện nó đang dùng, giấu cả chuyện nó lưu vào Postgres hay vào bộ nhớ. Bên gọi chỉ biết "gọi hàm này, nhận về kiểu kia". Đó là module SÂU: bề mặt hẹp, ruột dày. Ngược lại là module NÔNG — bề mặt rộng gần bằng ruột, kiểu một hàm `luuVaoBangDonHangRoiGuiEmailVaTruTonKho(...)`. Nó không giấu được gì nên cũng không tiết kiệm cho ai được gì.\n\nMột cảnh báo về liều lượng: chia nhỏ quá cũng là bệnh. Mười module mà mỗi module ba dòng thì bạn không giảm được độ phức tạp, bạn chỉ chuyển nó từ trong một file ra thành dây nhợ giữa các file. Thước đo vẫn là câu hỏi cũ: đổi một yêu cầu nghiệp vụ thì phải mở mấy chỗ.',
    workedExample: {
      code: `// Bản mô tả module: mỗi module kèm CÁC LÝ DO NGHIỆP VỤ khiến nó phải sửa.
interface Module {
  ten: string
  lyDoDoi: string[]
}

const heThong: Module[] = [
  // 3 lý do = 3 nhóm người có quyền bắt module này đổi -> ranh giới cắt sai
  { ten: "donHang", lyDoDoi: ["doi luat giam gia", "doi mau hoa don", "doi kho luu"] },
  { ten: "guiEmail", lyDoDoi: ["doi mau email"] },
]

// Đếm lý do là cách rẻ nhất để thấy module nào đang gánh việc của người khác.
for (const m of heThong) {
  const so = m.lyDoDoi.length
  console.log(m.ten + ": " + so + " ly do -> " + (so >= 2 ? "canh bao" : "dat"))
}
// Đọc kết quả: "guiEmail" đạt KHÔNG PHẢI vì nó nhỏ, mà vì chỉ một nhóm người
// (bộ phận marketing) có quyền yêu cầu nó đổi.`,
      stdinLines: [],
    },
    predict: {
      code: `interface Module {
  ten: string
  lyDoDoi: string[]
}

const ds: Module[] = [
  { ten: "donHang", lyDoDoi: ["doi luat giam gia", "doi kho luu"] },
  { ten: "guiEmail", lyDoDoi: ["doi mau email"] },
]

// Cách báo cáo SAI mà ai cũng viết lần đầu: đếm module thay vì đếm lý do
const soViPham = ds.filter((m) => m.lyDoDoi.length >= 2).length
console.log("Bao cao: " + ds.length + " module, " + soViPham + " vi pham")`,
      question: 'Đoạn này in ra gì?',
      choices: [
        'Bao cao: 2 module, 1 vi pham',
        'Bao cao: 2 module, 3 vi pham',
        'Bao cao: 3 module, 1 vi pham',
        'Bao cao: 2 module, 0 vi pham',
      ],
      answerIndex: 0,
      explain:
        'Mảng có 2 module nên `ds.length` là 2. Chỉ "donHang" có từ 2 lý do trở lên nên `soViPham` là 1, ra "Bao cao: 2 module, 1 vi pham". Chỗ đáng nhớ: con số 1 này chưa nói được điều quan trọng nhất. Biết "có 1 module vi phạm" thì bạn vẫn chưa biết phải cắt ở đâu; phải biết module ĐÓ có mấy lý do và là những lý do gì thì mới cắt được. Bài Make ngay dưới đây bắt bạn báo cáo đủ mức chi tiết ấy.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm sắp xếp danh sách vi phạm: nặng nhất lên đầu, bằng nhau thì theo tên A→Z.',
      lines: [
        'function xepViPham(viPham: Module[]): Module[] {',
        '  return [...viPham].sort((a, b) => {',
        '    if (b.lyDoDoi.length !== a.lyDoDoi.length) {',
        '      return b.lyDoDoi.length - a.lyDoDoi.length',
        '    }',
        '    return a.ten < b.ten ? -1 : 1',
        '  })',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm soatTrachNhiem(ds) — máy soát trách nhiệm duy nhất, thứ bạn có thể đặt vào CI của một dự án thật.\n\nMỗi module là { ten: string, lyDoDoi: string[] }. Hàm trả về MỘT chuỗi, xét theo đúng thứ tự sau:\n\n  ① Danh sách rỗng → trả "Chua co module nao" (chưa có bản đồ thì không kết luận gì, đừng trả "tất cả đạt").\n  ② Module VI PHẠM là module có từ 2 lý do trở lên. Không có cái nào → trả "Tat ca dat: moi module doi vi 1 ly do".\n  ③ Có vi phạm → trả "Vi pham: " kèm danh sách, sắp NHIỀU LÝ DO TRƯỚC, số lý do bằng nhau thì tên A→Z. Mỗi mục viết dạng ten(n ly do), nối nhau bằng dấu phẩy và một dấu cách.\n\nVí dụ ô ③: "Vi pham: thanhToan(3 ly do), donHang(2 ly do)".\n\nGiữ nguyên phần in kết quả ở cuối.',
      starterCode: `interface Module {
  ten: string
  lyDoDoi: string[]
}

function soatTrachNhiem(ds: Module[]): string {
  // TODO: viết theo 3 luật trong đề
  return ""
}

// ---- Đừng sửa phần dưới đây ----
const rong: Module[] = []
const kho: Module[] = [
  { ten: "donHang", lyDoDoi: ["doi luat giam gia", "doi kho luu"] },
  { ten: "thanhToan", lyDoDoi: ["doi cong thanh toan", "doi mau hoa don", "doi tien te"] },
  { ten: "guiEmail", lyDoDoi: ["doi mau email"] },
]
const sach: Module[] = [
  { ten: "gioHang", lyDoDoi: ["doi luat gio hang"] },
  { ten: "tonKho", lyDoDoi: ["doi cach dem ton"] },
]
const dongSo: Module[] = [
  { ten: "baoCao", lyDoDoi: ["doi chi so", "doi ky bao cao"] },
  { ten: "anhSanPham", lyDoDoi: ["doi kich thuoc", "doi noi luu"] },
]

console.log("Rong:", soatTrachNhiem(rong))
console.log("Kho:", soatTrachNhiem(kho))
console.log("Sach:", soatTrachNhiem(sach))
console.log("Dong so:", soatTrachNhiem(dongSo))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Rong: Chua co module nao',
          match: 'contains',
          hidden: false,
          label: 'Bản đồ rỗng — không có dữ liệu thì không được kết luận "tất cả đạt"',
        },
        {
          stdinLines: [],
          expected: 'Kho: Vi pham: thanhToan(3 ly do), donHang(2 ly do)',
          match: 'contains',
          hidden: false,
          label: 'Có vi phạm — nặng nhất lên đầu, guiEmail 1 lý do không bị nêu tên',
        },
        {
          stdinLines: [],
          expected: 'Sach: Tat ca dat: moi module doi vi 1 ly do',
          match: 'contains',
          hidden: false,
          label: 'Mọi module chỉ có 1 lý do đổi',
        },
        {
          stdinLines: [],
          expected: 'Dong so: Vi pham: anhSanPham(2 ly do), baoCao(2 ly do)',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — bằng điểm thì xếp theo tên A→Z, không theo thứ tự trong mảng',
        },
      ],
      hints: [
        'Chặn ca rỗng ngay dòng đầu: `if (ds.length === 0) return "Chua co module nao"`. Xử lý ca đặc biệt trước giúp phần còn lại chỉ lo một chuyện.',
        'Lọc vi phạm trước khi sắp xếp: `const viPham = ds.filter((m) => m.lyDoDoi.length >= 2)`. Nếu mảng này rỗng thì trả ngay câu "Tat ca dat: ...".',
        'Sắp xếp hai tầng: so số lý do trước (`b.lyDoDoi.length - a.lyDoDoi.length`), bằng nhau mới so tên (`a.ten < b.ten ? -1 : 1`). Nhớ `[...viPham].sort(...)` để không sửa mảng gốc — hàm soát mà làm hỏng dữ liệu vào là cái bẫy rất khó tìm.',
        'Ghép chuỗi bằng map rồi join: `viPham.map((m) => m.ten + "(" + m.lyDoDoi.length + " ly do)").join(", ")`.',
      ],
      sampleSolution: `interface Module {
  ten: string
  lyDoDoi: string[]
}

function soatTrachNhiem(ds: Module[]): string {
  // ① Chưa có bản đồ thì không kết luận — im lặng còn hơn báo cáo sai
  if (ds.length === 0) return "Chua co module nao"

  // ② Vi phạm = từ 2 lý do đổi trở lên (2 nhóm người cùng có quyền bắt module đổi)
  const viPham = ds.filter((m) => m.lyDoDoi.length >= 2)
  if (viPham.length === 0) return "Tat ca dat: moi module doi vi 1 ly do"

  // ③ Nặng nhất lên đầu; bằng nhau thì theo tên để báo cáo TẤT ĐỊNH
  //    (cùng dữ liệu vào phải ra cùng một dòng, nếu không thì không đưa vào CI được)
  const xep = [...viPham].sort((a, b) => {
    if (b.lyDoDoi.length !== a.lyDoDoi.length) {
      return b.lyDoDoi.length - a.lyDoDoi.length
    }
    return a.ten < b.ten ? -1 : 1
  })
  return "Vi pham: " + xep.map((m) => m.ten + "(" + m.lyDoDoi.length + " ly do)").join(", ")
}

// ---- Đừng sửa phần dưới đây ----
const rong: Module[] = []
const kho: Module[] = [
  { ten: "donHang", lyDoDoi: ["doi luat giam gia", "doi kho luu"] },
  { ten: "thanhToan", lyDoDoi: ["doi cong thanh toan", "doi mau hoa don", "doi tien te"] },
  { ten: "guiEmail", lyDoDoi: ["doi mau email"] },
]
const sach: Module[] = [
  { ten: "gioHang", lyDoDoi: ["doi luat gio hang"] },
  { ten: "tonKho", lyDoDoi: ["doi cach dem ton"] },
]
const dongSo: Module[] = [
  { ten: "baoCao", lyDoDoi: ["doi chi so", "doi ky bao cao"] },
  { ten: "anhSanPham", lyDoDoi: ["doi kich thuoc", "doi noi luu"] },
]

console.log("Rong:", soatTrachNhiem(rong))
console.log("Kho:", soatTrachNhiem(kho))
console.log("Sach:", soatTrachNhiem(sach))
console.log("Dong so:", soatTrachNhiem(dongSo))`,
    },
    homework:
      'Lấy một dự án bạn đang làm (hoặc chính repo DHCB). Chọn 5 file lớn nhất, và với mỗi file tự trả lời: "sáu tháng qua, những YÊU CẦU NGHIỆP VỤ nào đã bắt file này sửa?" — lịch sử git giúp bạn: `git log --oneline -- <file>` rồi đọc tiêu đề commit. File nào có từ 2 nhóm lý do khác hẳn nhau, ghi nó ra. Sau đó chạy `npm run codemap -- impact <file>` cho đúng file đó và đếm xem sửa nó thì gãy bao nhiêu chỗ. Hai con số ấy là hồ sơ bệnh án đầu tiên của hệ thống bạn đang giữ.',
    srsCards: [
      {
        hoi: 'Phát biểu dùng được của "trách nhiệm duy nhất" là gì?',
        dap: 'Một module chỉ nên đổi vì MỘT lý do nghiệp vụ — tức chỉ một nhóm người có quyền yêu cầu nó đổi. Đếm được số lý do thì biết ngay module có đang gánh việc của người khác hay không.',
      },
      {
        hoi: 'Vì sao cắt thư mục theo loại file (components/, utils/) lại tốn công về sau?',
        dap: 'Vì nó tách những thứ ĐỔI CÙNG LÚC ra ba chỗ khác nhau và gom những thứ không liên quan vào một chỗ. Thêm hay bỏ một tính năng phải rải sửa nhiều thư mục, thay vì thêm hoặc xoá đúng một thư mục nghiệp vụ.',
      },
      {
        hoi: 'Module "sâu" khác module "nông" ở chỗ nào?',
        dap: 'Module sâu có bề mặt hẹp mà ruột dày: giấu cấu trúc dữ liệu, thư viện và cách lưu trữ bên trong. Module nông có bề mặt rộng gần bằng ruột nên chẳng giấu được gì, bên gọi vẫn phải biết mọi chi tiết.',
      },
      {
        hoi: 'Chia module càng nhỏ càng nhiều thì càng tốt — đúng hay sai?',
        dap: 'Sai. Chia quá nhỏ chỉ chuyển độ phức tạp từ trong một file ra thành dây nhợ giữa nhiều file. Thước đo vẫn là: đổi một yêu cầu nghiệp vụ thì phải mở bao nhiêu chỗ.',
      },
    ],
  },
  {
    id: 'p6-u19-l2',
    unitId: 'p6-u19',
    language: 'typescript',
    title: 'Luật phụ thuộc — mũi tên chỉ được đi một chiều',
    hook: 'Bạn muốn viết test cho hàm tính tiền đơn hàng. Vừa import nó vào, test đỏ: nó kéo theo module gửi email, module đó cần biến môi trường SMTP, mà máy chạy test thì không có. Lõi nghiệp vụ của bạn vừa bị hạ tầng cầm tù — và bạn phát hiện ra điều đó ở đúng lúc muộn nhất.',
    theory:
      'Trong một hệ thống, mỗi lần A import B là bạn vừa ký một cam kết: A không thể sống thiếu B. Kiến trúc tốt hay xấu phần lớn nằm ở chỗ CÁC MŨI TÊN ẤY CHỈ VỀ ĐÂU.\n\nLuật gần như không có ngoại lệ: mũi tên chỉ đi từ NGOÀI VÀO TRONG.\n\n  ngoài (giao diện, hạ tầng: HTTP, Postgres, SMTP, tệp)\n     ↓ được phép import\n  ứng dụng (các luồng việc: đặt hàng, thanh toán)\n     ↓ được phép import\n  lõi (luật nghiệp vụ thuần: tính tiền, kiểm điều kiện)\n\nLõi KHÔNG được biết gì về hai tầng trên. Không phải vì đẹp, mà vì ba cái lợi rất cụ thể: (1) test được lõi mà không cần cơ sở dữ liệu, chạy trong mili giây; (2) đổi Postgres sang thứ khác không chạm một dòng luật nghiệp vụ; (3) đọc lõi là hiểu ngay công ty làm nghề gì, không phải lội qua code kết nối mạng.\n\nCÒN KHI LÕI THẬT SỰ CẦN GỬI EMAIL? Đây là chỗ người mới thấy luật trên là bất khả thi, và là chỗ có kỹ thuật ĐẢO PHỤ THUỘC. Lõi không import module email; lõi tự khai một CỔNG — một interface mô tả cái nó cần:\n\n  // ở lõi\n  interface CongThongBao { gui(den: string, noiDung: string): void }\n\nRồi tầng ngoài viết một cài đặt cho cổng đó (dùng SMTP thật) và CẮM VÀO lúc khởi động. Mũi tên import bây giờ đi từ ngoài vào trong đúng luật, dù luồng gọi lúc chạy vẫn đi từ trong ra ngoài. Đó là điểm hay nhất của kỹ thuật này: chiều PHỤ THUỘC và chiều GỌI không nhất thiết cùng chiều nhau. Và test lõi thì cắm một cổng giả ghi vào mảng, không cần SMTP.\n\nVÒNG PHỤ THUỘC là bệnh, không phải phong cách. A import B, B import C, C import A — thì ba cái đó thật ra là MỘT module bị chẻ làm ba file: không hiểu riêng được, không test riêng được, không tái dùng riêng được. Bệnh này lây rất nhanh vì mỗi bước đều "chỉ thêm một import nhỏ thôi".\n\nCHẶN BẰNG CÔNG CỤ, ĐỪNG CHẶN BẰNG NHẮC NHỞ. Nhắc nhau trong review là biện pháp thua chắc: người mệt, người mới, phiên AI mới, ai cũng có thể lỡ tay. Dự án DHCB làm đúng cách này — luật "packages/ không được import apps/ và api/" nằm trong cấu hình ESLint, và `npm run codemap -- cycles` liệt kê vòng phụ thuộc bằng máy. Vi phạm là CI đỏ ngay trong PR, không đợi ai phát hiện.\n\nMột lưu ý khi đi soát hệ thống người khác: đừng nhìn tên thư mục mà đoán tầng, hãy đọc IMPORT THẬT. Rất nhiều dự án có thư mục tên "core" nhưng bên trong lại import thẳng thư viện gọi HTTP — sơ đồ nói một đằng, code làm một nẻo, và code mới là thứ chạy.',
    workedExample: {
      code: `type Tang = "loi" | "ungDung" | "ngoai"

// Bậc càng NHỎ càng ở trong. Được phép nhập module có bậc NHỎ HƠN HOẶC BẰNG mình.
const BAC: Record<Tang, number> = { loi: 0, ungDung: 1, ngoai: 2 }

interface Mod {
  ten: string
  tang: Tang
  nhap: string[]
}

const heThong: Mod[] = [
  { ten: "tinhTien", tang: "loi", nhap: ["guiEmail"] },    // lõi gọi ra ngoài -> SAI
  { ten: "datHang", tang: "ungDung", nhap: ["tinhTien"] }, // 1 -> 0: đúng chiều
  { ten: "guiEmail", tang: "ngoai", nhap: [] },
]

const bang = new Map<string, Tang>(heThong.map((m) => [m.ten, m.tang]))
for (const m of heThong) {
  for (const ten of m.nhap) {
    const tangDich = bang.get(ten)
    if (tangDich === undefined) continue
    // Nhập module ở tầng NGOÀI hơn mình = mũi tên đi ngược
    if (BAC[tangDich] > BAC[m.tang]) console.log("Nguoc chieu: " + m.ten + " -> " + ten)
  }
}
// Đọc kết quả: chỉ "tinhTien -> guiEmail" bị nêu. Cách sửa KHÔNG phải đổi tên thư mục,
// mà là để lõi khai một cổng thông báo rồi cắm cài đặt SMTP từ ngoài vào.`,
      stdinLines: [],
    },
    predict: {
      code: `type Tang = "loi" | "ungDung" | "ngoai"

const BAC: Record<Tang, number> = { loi: 0, ungDung: 1, ngoai: 2 }

const nguon: Tang = "loi"
const dich: Tang = "ngoai"

console.log("Nguoc chieu:", BAC[dich] > BAC[nguon] ? "co" : "khong")`,
      question: 'Đoạn này in ra gì?',
      choices: [
        'Nguoc chieu: co',
        'Nguoc chieu: khong',
        'Nguoc chieu: undefined',
        'Nguoc chieu: 0',
      ],
      answerIndex: 0,
      explain:
        'BAC["ngoai"] là 2, BAC["loi"] là 0, mà 2 lớn hơn 0 nên biểu thức cho "co", in ra "Nguoc chieu: co". Ý cần nhớ: một module ở tầng lõi mà nhập module ở tầng ngoài luôn là vi phạm, bất kể module đó tên gì hay nằm ở thư mục nào. So bậc SỐ là cách kiểm khách quan duy nhất — nhìn tên thư mục để đoán tầng thì rất hay sai, vì nhiều dự án có thư mục tên "core" nhưng bên trong gọi thẳng HTTP.',
    },
    parsons: {
      prompt: 'Xếp lại vòng lặp soát chiều phụ thuộc của một module.',
      lines: [
        'for (const ten of m.nhap) {',
        '  if (ten === m.ten) continue',
        '  const tangDich = bang.get(ten)',
        '  if (tangDich === undefined) continue',
        '  if (BAC[tangDich] > BAC[m.tang]) {',
        '    viPham.push(m.ten + " -> " + ten)',
        '  }',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm soatChieu(ds) — máy canh luật phụ thuộc, đúng loại kiểm mà ESLint của dự án DHCB đang chạy trong CI.\n\nMỗi module là { ten: string, tang: Tang, nhap: string[] } với Tang là "loi" | "ungDung" | "ngoai". Bậc: loi = 0, ungDung = 1, ngoai = 2. Một module được phép nhập module có bậc NHỎ HƠN HOẶC BẰNG bậc của mình.\n\nHàm trả về MỘT chuỗi, xét theo đúng thứ tự sau:\n\n  ① Danh sách rỗng → "Chua co module nao".\n  ② Duyệt module theo thứ tự trong mảng, trong mỗi module duyệt nhap theo thứ tự. Bỏ qua hai trường hợp: tên nhập chính là tên module đó, và tên nhập không có trong danh sách.\n  ③ Vi phạm là khi bậc của module ĐÍCH lớn hơn bậc của module đang xét. Ghi dạng "nguon -> dich".\n  ④ Không có vi phạm nào → "Phu thuoc mot chieu: dat". Có thì trả "Nguoc chieu: " kèm các vi phạm nối nhau bằng dấu phẩy và một dấu cách, giữ nguyên thứ tự đã duyệt.\n\nVí dụ ô ④: "Nguoc chieu: tinhTien -> guiEmail, tinhTien -> luuDon".\n\nGiữ nguyên phần in kết quả ở cuối.',
      starterCode: `type Tang = "loi" | "ungDung" | "ngoai"

const BAC: Record<Tang, number> = { loi: 0, ungDung: 1, ngoai: 2 }

interface Mod {
  ten: string
  tang: Tang
  nhap: string[]
}

function soatChieu(ds: Mod[]): string {
  // TODO: viết theo 4 luật trong đề
  return ""
}

// ---- Đừng sửa phần dưới đây ----
const rong: Mod[] = []
const benh: Mod[] = [
  { ten: "tinhTien", tang: "loi", nhap: ["guiEmail", "luuDon"] },
  { ten: "datHang", tang: "ungDung", nhap: ["tinhTien"] },
  { ten: "guiEmail", tang: "ngoai", nhap: ["datHang"] },
  { ten: "luuDon", tang: "ngoai", nhap: [] },
]
const lanh: Mod[] = [
  { ten: "tinhTien", tang: "loi", nhap: [] },
  { ten: "datHang", tang: "ungDung", nhap: ["tinhTien"] },
  { ten: "apiDatHang", tang: "ngoai", nhap: ["datHang", "tinhTien"] },
]
const laVaTuNhap: Mod[] = [
  { ten: "tinhTien", tang: "loi", nhap: ["tinhTien", "khongTonTai"] },
  { ten: "kiemKho", tang: "loi", nhap: ["tinhTien"] },
]

console.log("Rong:", soatChieu(rong))
console.log("Benh:", soatChieu(benh))
console.log("Lanh:", soatChieu(lanh))
console.log("La:", soatChieu(laVaTuNhap))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Rong: Chua co module nao',
          match: 'contains',
          hidden: false,
          label: 'Chưa có module nào — không kết luận "đạt"',
        },
        {
          stdinLines: [],
          expected: 'Benh: Nguoc chieu: tinhTien -> guiEmail, tinhTien -> luuDon',
          match: 'contains',
          hidden: false,
          label: 'Lõi nhập hạ tầng hai lần; "guiEmail -> datHang" (2 → 1) thì hợp lệ',
        },
        {
          stdinLines: [],
          expected: 'Lanh: Phu thuoc mot chieu: dat',
          match: 'contains',
          hidden: false,
          label: 'Mọi mũi tên đi từ ngoài vào trong hoặc trong cùng tầng',
        },
        {
          stdinLines: [],
          expected: 'La: Phu thuoc mot chieu: dat',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — tự nhập chính mình và tên lạ đều phải bỏ qua, không báo bừa',
        },
      ],
      hints: [
        'Dựng sẵn bảng tra tên → tầng trước khi duyệt: `const bang = new Map<string, Tang>(ds.map((m) => [m.ten, m.tang]))`. Không có bảng này thì mỗi lần tra lại phải quét cả mảng.',
        'Hai lần `continue` trong vòng lặp trong: bỏ qua khi `ten === m.ten` (tự nhập chính mình), và bỏ qua khi `bang.get(ten)` là undefined (tên không có trong danh sách).',
        'So sánh phải dùng BẬC SỐ chứ không so chuỗi tầng: `BAC[tangDich] > BAC[m.tang]`. So hai chuỗi bằng dấu lớn hơn sẽ cho kết quả theo bảng chữ cái, hoàn toàn vô nghĩa ở đây.',
        'Gom vi phạm vào mảng `viPham: string[]` rồi cuối hàm mới quyết định trả câu nào — như vậy thứ tự báo cáo đúng bằng thứ tự duyệt, và mỗi nhánh chỉ có một chỗ trả kết quả.',
      ],
      sampleSolution: `type Tang = "loi" | "ungDung" | "ngoai"

const BAC: Record<Tang, number> = { loi: 0, ungDung: 1, ngoai: 2 }

interface Mod {
  ten: string
  tang: Tang
  nhap: string[]
}

function soatChieu(ds: Mod[]): string {
  // ① Chưa có bản đồ thì không kết luận gì
  if (ds.length === 0) return "Chua co module nao"

  // Bảng tra tên -> tầng, dựng một lần thay vì quét lại mảng mỗi lần tra
  const bang = new Map<string, Tang>(ds.map((m) => [m.ten, m.tang]))
  const viPham: string[] = []

  for (const m of ds) {
    for (const ten of m.nhap) {
      // ② Tự nhập chính mình: không phải quan hệ giữa hai module
      if (ten === m.ten) continue
      const tangDich = bang.get(ten)
      // ② Tên không có trong bản đồ: không đủ dữ liệu để kết luận, im lặng
      if (tangDich === undefined) continue
      // ③ Đích ở tầng NGOÀI hơn nguồn = mũi tên đi ngược luật
      if (BAC[tangDich] > BAC[m.tang]) viPham.push(m.ten + " -> " + ten)
    }
  }

  // ④ Một chỗ quyết định kết quả; thứ tự báo cáo đúng bằng thứ tự duyệt
  if (viPham.length === 0) return "Phu thuoc mot chieu: dat"
  return "Nguoc chieu: " + viPham.join(", ")
}

// ---- Đừng sửa phần dưới đây ----
const rong: Mod[] = []
const benh: Mod[] = [
  { ten: "tinhTien", tang: "loi", nhap: ["guiEmail", "luuDon"] },
  { ten: "datHang", tang: "ungDung", nhap: ["tinhTien"] },
  { ten: "guiEmail", tang: "ngoai", nhap: ["datHang"] },
  { ten: "luuDon", tang: "ngoai", nhap: [] },
]
const lanh: Mod[] = [
  { ten: "tinhTien", tang: "loi", nhap: [] },
  { ten: "datHang", tang: "ungDung", nhap: ["tinhTien"] },
  { ten: "apiDatHang", tang: "ngoai", nhap: ["datHang", "tinhTien"] },
]
const laVaTuNhap: Mod[] = [
  { ten: "tinhTien", tang: "loi", nhap: ["tinhTien", "khongTonTai"] },
  { ten: "kiemKho", tang: "loi", nhap: ["tinhTien"] },
]

console.log("Rong:", soatChieu(rong))
console.log("Benh:", soatChieu(benh))
console.log("Lanh:", soatChieu(lanh))
console.log("La:", soatChieu(laVaTuNhap))`,
    },
    homework:
      'Chạy `npm run codemap -- cycles` trên repo DHCB (hoặc dự án của bạn) và đọc kết quả. Nếu không có vòng nào, hãy tự tạo một vòng giả trong nhánh tạm: cho hai file bất kỳ import lẫn nhau, chạy lại lệnh và xem công cụ có bắt được không — một cái máy canh mà bạn chưa từng thấy nó báo đỏ thì bạn chưa biết nó có hoạt động hay không. Sau đó mở `.eslintrc.cjs` của dự án, tìm luật cấm `packages/` import `apps/`, và tự trả lời: nếu luật này bị xoá, bao lâu nữa sẽ có người vô tình vi phạm?',
    srsCards: [
      {
        hoi: 'Luật phụ thuộc phát biểu thế nào, và lõi được biết gì về hạ tầng?',
        dap: 'Mũi tên import chỉ đi từ ngoài vào trong: hạ tầng và giao diện được nhập ứng dụng, ứng dụng được nhập lõi. Lõi không được biết gì về hai tầng trên — không nhập HTTP, cơ sở dữ liệu hay SMTP.',
      },
      {
        hoi: 'Lõi cần gửi email mà không được import module email — làm cách nào?',
        dap: 'Đảo phụ thuộc: lõi tự khai một interface (cổng) mô tả thứ nó cần, tầng ngoài viết cài đặt thật rồi cắm vào lúc khởi động. Chiều import đi vào trong, còn chiều gọi lúc chạy vẫn đi ra ngoài.',
      },
      {
        hoi: 'Vòng phụ thuộc giữa ba module gây hại cụ thể ra sao?',
        dap: 'Ba module đó thật ra là một module bị chẻ làm ba file: không hiểu riêng được, không test riêng được, không tái dùng riêng được, và mỗi lần sửa một cái đều phải kiểm cả ba.',
      },
      {
        hoi: 'Vì sao nhắc nhau giữ ranh giới trong review là biện pháp thua chắc?',
        dap: 'Vì nó dựa vào trí nhớ và sự tỉnh táo của con người, thứ luôn hỏng lúc mệt hoặc lúc có người mới. Phải chuyển thành cổng tự động — lint luật phụ thuộc và lệnh dò vòng — để vi phạm làm CI đỏ ngay trong PR.',
      },
    ],
  },
]
