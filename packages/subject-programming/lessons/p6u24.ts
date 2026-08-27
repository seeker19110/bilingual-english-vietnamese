// lessons/p6u24.ts — P6-U24: HƯỚNG WEB, chặng S4 — VẬN HÀNH SẢN PHẨM (module `web-s4-m3`:
// log có cấu trúc/trace/metric · cảnh báo theo triệu chứng người dùng, không theo CPU).
//
// Vì sao dạy được bằng hàm thuần: cả hai bài đều là ĐỌC SỐ. Bài l1 dạy vì sao trung bình
// che mất người dùng khổ nhất và p95 thì không; bài l2 dạy luật cảnh báo phải bám triệu
// chứng người dùng (tỉ lệ lỗi ăn vào ngân sách lỗi) thay vì bám tài nguyên máy. Dữ liệu độ
// trễ và log là mảng hằng — không cần Prometheus để học đúng phán đoán.
//
// Module `web-s4-m4` (dẫn dắt kỹ thuật: ADR, review, ước lượng) CỐ Ý không có bài ở đợt này:
// phần ADR đã có bài thật ở `p6-u21` (hướng Kiến trúc S1), còn review/ước lượng thì không
// quy được về test-case — đúng luật số 1 của chặng S4 thì phải để ngỏ chứ không lấp bằng
// bài lý thuyết suông.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U24_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u24-l1',
    unitId: 'p6-u24',
    language: 'typescript',
    title: 'Trung bình nói dối — đọc p95 mới thấy người dùng khổ',
    hook: 'Bảng theo dõi ghi "độ trễ trung bình 180ms", xanh lè suốt tuần. Cùng tuần đó bộ phận chăm sóc khách hàng nhận 40 lời phàn nàn "app đơ khi bấm thanh toán". Cả hai đều đúng: 90 người được phục vụ trong 100ms, 10 người chờ 3 giây, và trung bình thì không quan tâm bạn là ai trong hai nhóm đó.',
    theory:
      'Vận hành sản phẩm thật cần ba loại tín hiệu, và lẫn lộn chúng là gốc của mọi bảng theo dõi vô dụng:\n\n· LOG: một dòng cho một sự việc đã xảy ra ("đơn 123 thanh toán lỗi thẻ"). Trả lời "chuyện gì đã xảy ra với ca cụ thể này".\n· METRIC: một con số theo thời gian, đã gộp ("số request/giây", "p95 độ trễ"). Trả lời "hệ thống đang khoẻ hay yếu".\n· TRACE: một request đi qua những đâu và mỗi chặng tốn bao lâu. Trả lời "thời gian đó ĐỔ VÀO ĐÂU".\n\nBa thứ trả lời ba câu khác nhau; thiếu trace thì biết chậm mà không biết chậm ở khâu nào, thiếu log thì không dựng lại được ca cụ thể của một khách hàng đang gọi điện.\n\nGiờ tới phần dễ sai nhất: gộp số. Trung bình cộng là một cách gộp TỆ cho độ trễ, vì độ trễ không phân bố đều — nó có đuôi dài. Một vài request rất chậm bị hàng nghìn request nhanh pha loãng, và đúng nhóm chậm đó mới là nhóm bỏ app mà đi.\n\nDùng PHÂN VỊ. p95 = giá trị mà 95% request nhanh hơn hoặc bằng. "p95 = 3.000ms" đọc là: cứ 20 lượt bấm thì có 1 lượt chờ 3 giây. Câu đó nói được thành lời với người không kỹ thuật; "trung bình 180ms" thì không.\n\nCách tính (định nghĩa nearest-rank, dùng trong bài này):\n  ① sắp danh sách tăng dần\n  ② vị trí = ceil(95/100 × N), tính từ 1\n  ③ lấy phần tử ở vị trí đó\nVới N = 10 thì vị trí = 10 → p95 chính là giá trị lớn nhất. Đó không phải lỗi: 10 mẫu thì đơn giản là chưa đủ dữ liệu để nói về 5% xấu nhất — và biết điều đó cũng là một phần của nghề.\n\nBa luật thực chiến:\n· Không bao giờ tính phân vị từ các phân vị đã gộp sẵn. Trung bình của p95 ba máy KHÔNG phải p95 toàn hệ.\n· Đo ở phía NGƯỜI DÙNG, không chỉ ở server. Server trả lời trong 50ms mà máy khách ở 3G thì người dùng vẫn chờ 2 giây — chỉ số INP của Core Web Vitals (dự án DHCB đặt ngưỡng ≤ 200ms) đo đúng phần server không nhìn thấy.\n· Kèm p99 khi lượng người dùng lớn: 1% của một triệu lượt vẫn là mười nghìn người.',
    workedExample: {
      code: `// Nearest-rank: sắp tăng dần, lấy phần tử ở vị trí ceil(p/100 * N)
function phanVi(soLieu: number[], p: number): number {
  if (soLieu.length === 0) return 0
  const sap = [...soLieu].sort((a, b) => a - b)   // .sort() mặc định so CHUỖI — phải truyền hàm
  const viTri = Math.ceil((p / 100) * sap.length)
  return sap[Math.max(1, viTri) - 1] ?? 0
}

function trungBinh(soLieu: number[]): number {
  if (soLieu.length === 0) return 0
  return Math.round(soLieu.reduce((t, x) => t + x, 0) / soLieu.length)
}

// 20 lượt bấm "Thanh toán": 18 lượt nhanh, 2 lượt sập nguồn dự phòng
const doTre: number[] = [
  90, 95, 100, 105, 110, 88, 92, 97, 101, 103,
  99, 96, 94, 102, 107, 91, 98, 104,
  3000, 3200,
]

console.log("Trung binh:", trungBinh(doTre))
console.log("p50:", phanVi(doTre, 50))
console.log("p95:", phanVi(doTre, 95))
// Đọc kết quả: trung bình 240ms nhìn "hơi chậm", p50 100ms nhìn "rất nhanh",
// còn p95 3000ms mới nói đúng chuyện đang xảy ra với 1 trong 20 người.`,
      stdinLines: [],
    },
    predict: {
      code: `// Cái bẫy kinh điển của JavaScript: .sort() không tham số so sánh CHUỖI, không so SỐ
const doTre: number[] = [90, 100, 3000, 250]

const sapSai = [...doTre].sort()
const sapDung = [...doTre].sort((a, b) => a - b)

console.log("Sap sai:", sapSai.join(","), "| Sap dung:", sapDung.join(","))`,
      question: 'Chương trình in ra gì?',
      choices: [
        'Sap sai: 100,250,3000,90 | Sap dung: 90,100,250,3000',
        'Sap sai: 90,100,250,3000 | Sap dung: 90,100,250,3000',
        'Sap sai: 3000,250,100,90 | Sap dung: 90,100,250,3000',
        'Sap sai: 90,250,100,3000 | Sap dung: 90,100,250,3000',
      ],
      answerIndex: 0,
      explain:
        'In ra "Sap sai: 100,250,3000,90" — vì `.sort()` không có hàm so sánh sẽ đổi mọi phần tử thành chuỗi rồi so theo bảng chữ cái: "100" < "250" < "3000" < "90". Hậu quả trong bài này rất cụ thể: p95 tính trên danh sách sắp sai sẽ trả về 90ms trong khi sự thật là 3000ms — bảng theo dõi xanh lè trong lúc người dùng đang chờ ba giây. Luôn viết `.sort((a, b) => a - b)` khi sắp số.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm phân vị theo nearest-rank: chặn ca rỗng, sắp số, tính vị trí, lấy phần tử.',
      lines: [
        'function phanVi(soLieu: number[], p: number): number {',
        '  if (soLieu.length === 0) return 0',
        '  const sap = [...soLieu].sort((a, b) => a - b)',
        '  const viTri = Math.ceil((p / 100) * sap.length)',
        '  return sap[Math.max(1, viTri) - 1] ?? 0',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm `phanVi(soLieu: number[], p: number): number` theo định nghĩa nearest-rank:\n① sắp tăng dần (nhớ truyền hàm so sánh SỐ),\n② `viTri = Math.ceil(p / 100 * N)` đếm từ 1,\n③ trả phần tử ở vị trí đó (chỉ số mảng là `viTri - 1`).\n\nCa biên bắt buộc:\n· Danh sách rỗng → trả 0, không được ném lỗi.\n· `p = 0` → `viTri` tính ra 0, phải kẹp lên 1 để vẫn trả phần tử nhỏ nhất.\n\nKHÔNG được sửa mảng gốc `soLieu` (dùng `[...soLieu]` rồi mới sort) — hàm đo đạc mà làm biến dạng dữ liệu đầu vào là một loại lỗi rất khó lần ra.',
      starterCode: `function phanVi(soLieu: number[], p: number): number {
  // TODO: nearest-rank
  return 0
}

// ---- Đừng sửa phần dưới đây ----
const doTre: number[] = [90, 100, 3000, 250, 95, 105, 98, 102, 3200, 97]
const goc: string = doTre.join(",")

console.log("p50:", phanVi(doTre, 50))
console.log("p95:", phanVi(doTre, 95))
console.log("p0:", phanVi(doTre, 0))
console.log("Rong:", phanVi([], 95))
console.log("Khong pha mang goc:", doTre.join(",") === goc ? "co" : "khong")`,
      testCases: [
        {
          stdinLines: [],
          expected: 'p50: 100',
          match: 'contains',
          hidden: false,
          label: '10 mẫu, p50 → vị trí ceil(0,5 × 10) = 5 → giá trị thứ 5 sau khi sắp là 100',
        },
        {
          stdinLines: [],
          expected: 'p95: 3200',
          match: 'contains',
          hidden: false,
          label: 'p95 với N = 10 rơi đúng vào giá trị lớn nhất — 10 mẫu chưa đủ nói về 5% xấu nhất',
        },
        {
          stdinLines: [],
          expected: 'p0: 90',
          match: 'contains',
          hidden: false,
          label: 'Ca biên p = 0: vị trí tính ra 0, phải kẹp lên 1 chứ không được trả undefined',
        },
        {
          stdinLines: [],
          expected: 'Rong: 0',
          match: 'contains',
          hidden: false,
          label: 'Danh sách rỗng → 0, không ném lỗi (giờ chưa có lưu lượng là chuyện bình thường)',
        },
        {
          stdinLines: [],
          expected: 'Khong pha mang goc: co',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — `.sort()` sửa tại chỗ; quên sao chép là mảng gốc bị sắp lại',
        },
      ],
      hints: [
        'Chặn ca rỗng ngay dòng đầu: `if (soLieu.length === 0) return 0`.',
        '`.sort()` sửa THẲNG mảng gốc và mặc định so theo chuỗi. Cả hai điều đó đều làm bạn rớt một ca: viết `const sap = [...soLieu].sort((a, b) => a - b)`.',
        'Vị trí đếm từ 1 còn chỉ số mảng đếm từ 0, nên phần tử cần lấy là `sap[viTri - 1]`. Với p = 0 thì `viTri` bằng 0, dùng `Math.max(1, viTri)` để kẹp.',
        'Khung tham chiếu:\n\nconst viTri = Math.ceil((p / 100) * sap.length)\nreturn sap[Math.max(1, viTri) - 1] ?? 0',
      ],
      sampleSolution: `function phanVi(soLieu: number[], p: number): number {
  if (soLieu.length === 0) return 0
  const sap = [...soLieu].sort((a, b) => a - b)
  const viTri = Math.ceil((p / 100) * sap.length)
  return sap[Math.max(1, viTri) - 1] ?? 0
}

// ---- Đừng sửa phần dưới đây ----
const doTre: number[] = [90, 100, 3000, 250, 95, 105, 98, 102, 3200, 97]
const goc: string = doTre.join(",")

console.log("p50:", phanVi(doTre, 50))
console.log("p95:", phanVi(doTre, 95))
console.log("p0:", phanVi(doTre, 0))
console.log("Rong:", phanVi([], 95))
console.log("Khong pha mang goc:", doTre.join(",") === goc ? "co" : "khong")`,
    },
    homework:
      'Mở trang Trạng thái tính năng của chính dự án này (nó đang báo độ trễ từng dịch vụ: AI hội thoại, STT, TTS, R2). Tự hỏi ba câu: con số đang hiện là trung bình hay phân vị, nó đo ở server hay ở máy người dùng, và nếu 1 trong 20 lượt nói của học viên chờ 3 giây thì bảng đó có đỏ lên không. Câu trả lời cho câu cuối thường là "không" — và đó là bài học đắt nhất của cả unit này.',
    srsCards: [
      {
        hoi: 'Vì sao độ trễ trung bình là con số gây hiểu lầm?',
        dap: 'Vì độ trễ có đuôi dài: vài request rất chậm bị hàng nghìn request nhanh pha loãng, nên trung bình vẫn đẹp trong khi một nhóm người dùng thật đang chờ vài giây. Phân vị p95/p99 mới lộ ra nhóm đó.',
      },
      {
        hoi: 'Log, metric và trace trả lời ba câu hỏi khác nhau nào?',
        dap: 'Log trả lời chuyện gì đã xảy ra với một ca cụ thể; metric trả lời hệ thống đang khoẻ hay yếu theo thời gian; trace trả lời thời gian của một request đổ vào chặng nào. Thiếu trace thì biết chậm mà không biết chậm ở đâu.',
      },
      {
        hoi: 'Có được tính p95 toàn hệ bằng cách lấy trung bình p95 của từng máy không?',
        dap: 'Không. Phân vị không cộng gộp được như thế; trung bình của các p95 không phải p95 của toàn bộ dữ liệu. Muốn đúng thì phải gộp từ dữ liệu thô hoặc dùng cấu trúc gộp được như histogram.',
      },
    ],
  },
  {
    id: 'p6-u24-l2',
    unitId: 'p6-u24',
    language: 'typescript',
    title: 'Cảnh báo theo triệu chứng người dùng, không theo CPU',
    hook: 'Ba giờ sáng, điện thoại rung: "CPU máy web-2 đạt 85%". Bạn bò dậy, mở laptop, hoá ra đang chạy sao lưu định kỳ — người dùng không hề hấn gì. Một tháng sau, thanh toán lỗi 40% suốt hai tiếng và không có cái chuông nào kêu: CPU lúc đó rất thấp, vì hệ thống có làm được gì đâu mà tốn CPU.',
    theory:
      'Có hai kiểu cảnh báo, và chọn nhầm kiểu là lý do các đội trực đêm kiệt sức mà sự cố thật vẫn lọt:\n\n· CẢNH BÁO NGUYÊN NHÂN (CPU, RAM, số kết nối): kêu khi một tài nguyên bất thường. Vấn đề: bất thường KHÔNG có nghĩa người dùng đang khổ, và người dùng khổ thì thường tài nguyên lại rất bình thường.\n· CẢNH BÁO TRIỆU CHỨNG (tỉ lệ request lỗi, p95 độ trễ, tỉ lệ thanh toán thất bại): kêu khi NGƯỜI DÙNG đang chịu hậu quả. Đây là thứ đáng dựng người dậy lúc ba giờ sáng.\n\nLuật một câu: đánh thức người vì TRIỆU CHỨNG, dùng NGUYÊN NHÂN để chẩn đoán sau khi đã bị đánh thức.\n\nĐể nói "người dùng đang khổ" thành số, dùng SLO và NGÂN SÁCH LỖI:\n\n· SLO là lời hứa, ví dụ "99% request thành công trong 30 ngày".\n· Ngân sách lỗi = 100% − SLO = 1%. Đây là lượng hỏng bạn được phép tiêu mà chưa lỗi hứa. Ngân sách còn nhiều thì cứ phát hành tính năng; tiêu gần hết thì đóng băng, quay về sửa độ ổn định. Nó biến cuộc cãi vã "làm tính năng hay sửa lỗi" thành một con số.\n· TỐC ĐỘ TIÊU (burn rate) = tỉ lệ lỗi hiện tại ÷ ngân sách lỗi. Bằng 1 nghĩa là đang tiêu đúng nhịp, hết đúng vào cuối kỳ. Bằng 14,4 nghĩa là tiêu hết ngân sách 30 ngày trong khoảng hai ngày — đó mới là báo động.\n\nVì sao phải nhìn tốc độ tiêu chứ không nhìn tỉ lệ lỗi trần trụi: "lỗi 2%" là nhiều hay ít còn tuỳ lời hứa. Với SLO 99% thì 2% là gấp đôi ngân sách; với SLO 90% thì vẫn trong tầm.\n\nVà một luật chống mệt mỏi vì chuông: dùng HAI CỬA SỔ. Cửa sổ ngắn (5 phút) để phản ứng nhanh, cửa sổ dài (1 giờ) để xác nhận đó không phải một nhịp nhiễu. Chỉ báo động khi CẢ HAI cùng vượt ngưỡng. Một cảnh báo mà người trực học được thói quen tắt đi là một cảnh báo còn tệ hơn không có — vì nó tạo cảm giác an toàn giả.',
    workedExample: {
      code: `interface CuaSo {
  ten: string
  tiLeLoi: number   // 0,02 = 2% request lỗi trong cửa sổ này
}

const SLO = 0.99                    // hứa 99% request thành công
const NGAN_SACH_LOI = 1 - SLO       // 1% được phép hỏng

function tocDoTieu(tiLeLoi: number): number {
  return tiLeLoi / NGAN_SACH_LOI
}

// Chỉ báo động khi CẢ HAI cửa sổ cùng vượt — cửa sổ dài lọc nhiễu tức thời
function coBaoDong(ngan: CuaSo, dai: CuaSo, nguong: number): boolean {
  return tocDoTieu(ngan.tiLeLoi) > nguong && tocDoTieu(dai.tiLeLoi) > nguong
}

const nhieuTucThoi: CuaSo = { ten: "5 phut", tiLeLoi: 0.2 }
const binhThuongDai: CuaSo = { ten: "1 gio", tiLeLoi: 0.001 }
const suCoThat: CuaSo = { ten: "1 gio", tiLeLoi: 0.18 }

console.log("Toc do tieu khi loi 2%:", tocDoTieu(0.02))
console.log("Nhieu tuc thoi:", coBaoDong(nhieuTucThoi, binhThuongDai, 14.4) ? "BAO DONG" : "im lang")
console.log("Su co that:", coBaoDong(nhieuTucThoi, suCoThat, 14.4) ? "BAO DONG" : "im lang")
// Đọc kết quả: cùng một cửa sổ 5 phút đang lỗi 20%, nhưng chỉ khi cửa sổ 1 giờ CŨNG xấu
// thì chuông mới kêu — đó là cách một đội trực ngủ được mà vẫn không bỏ sót sự cố.`,
      stdinLines: [],
    },
    predict: {
      code: `const SLO = 0.99
const NGAN_SACH_LOI = 1 - SLO

function tocDoTieu(tiLeLoi: number): number {
  return tiLeLoi / NGAN_SACH_LOI
}

// Cách SAI: coi "lỗi 2% nghe cũng ít" và chỉ báo động khi vượt 10%
function coBaoDongNgayTho(tiLeLoi: number): string {
  return tiLeLoi > 0.1 ? "BAO DONG" : "im lang"
}

console.log("Toc do tieu:", Math.round(tocDoTieu(0.02) * 10) / 10, "| Ngay tho noi:", coBaoDongNgayTho(0.02))`,
      question: 'Chương trình in ra gì?',
      choices: [
        'Toc do tieu: 2 | Ngay tho noi: im lang',
        'Toc do tieu: 2 | Ngay tho noi: BAO DONG',
        'Toc do tieu: 0.2 | Ngay tho noi: im lang',
        'Toc do tieu: 20 | Ngay tho noi: BAO DONG',
      ],
      answerIndex: 0,
      explain:
        'In ra "Toc do tieu: 2 | Ngay tho noi: im lang". Tỉ lệ lỗi 2% chia cho ngân sách 1% ra tốc độ tiêu bằng 2 — đang đốt ngân sách lỗi nhanh gấp đôi mức cho phép, tức hết veo ngân sách 30 ngày trong 15 ngày. Nhưng ngưỡng "10% mới kêu" thì im lặng, vì nó so tỉ lệ lỗi với một con số nghĩ trong đầu thay vì so với lời hứa mình đã cam kết. Ngưỡng cảnh báo phải suy ra từ SLO, không phải chọn theo cảm giác.',
    },
    parsons: {
      prompt:
        'Xếp lại luật cảnh báo hai cửa sổ: tính tốc độ tiêu từ ngân sách lỗi, rồi bắt CẢ HAI cửa sổ cùng vượt.',
      lines: [
        'const NGAN_SACH_LOI = 1 - SLO',
        'function tocDoTieu(tiLeLoi: number): number {',
        '  return tiLeLoi / NGAN_SACH_LOI',
        '}',
        'function coBaoDong(ngan: CuaSo, dai: CuaSo, nguong: number): boolean {',
        '  return tocDoTieu(ngan.tiLeLoi) > nguong && tocDoTieu(dai.tiLeLoi) > nguong',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm `xetCanhBao(ngan: CuaSo, dai: CuaSo): string` cho một dịch vụ có SLO 99% (ngân sách lỗi 1%), ngưỡng tốc độ tiêu là 14.4.\n\nLuật:\n· `tocDoTieu = tiLeLoi / 0.01`.\n· Trả "BAO DONG" khi CẢ HAI cửa sổ có tốc độ tiêu LỚN HƠN 14.4.\n· Chỉ cửa sổ ngắn vượt → trả "theo doi" (có thể là nhiễu tức thời, chưa dựng ai dậy).\n· Còn lại → trả "im lang".\n\nDùng đúng ba chuỗi đó, không thêm chữ.',
      starterCode: `interface CuaSo {
  ten: string
  tiLeLoi: number
}

const NGAN_SACH_LOI = 0.01
const NGUONG = 14.4

function xetCanhBao(ngan: CuaSo, dai: CuaSo): string {
  // TODO: tính tốc độ tiêu của hai cửa sổ rồi xét ba ca
  return "im lang"
}

// ---- Đừng sửa phần dưới đây ----
const yen: CuaSo = { ten: "5 phut", tiLeLoi: 0.0005 }
const yenDai: CuaSo = { ten: "1 gio", tiLeLoi: 0.0004 }
const nhieu: CuaSo = { ten: "5 phut", tiLeLoi: 0.2 }
const daiSach: CuaSo = { ten: "1 gio", tiLeLoi: 0.001 }
const daiXau: CuaSo = { ten: "1 gio", tiLeLoi: 0.18 }
const vuaDung: CuaSo = { ten: "cua so", tiLeLoi: 0.144 }

console.log("Yen tinh:", xetCanhBao(yen, yenDai))
console.log("Nhieu tuc thoi:", xetCanhBao(nhieu, daiSach))
console.log("Su co that:", xetCanhBao(nhieu, daiXau))
console.log("Dung nguong:", xetCanhBao(vuaDung, vuaDung))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Yen tinh: im lang',
          match: 'contains',
          hidden: false,
          label: 'Lỗi 0,05% — tiêu chậm hơn nhịp cho phép, không ai bị đánh thức',
        },
        {
          stdinLines: [],
          expected: 'Nhieu tuc thoi: theo doi',
          match: 'contains',
          hidden: false,
          label: 'Cửa sổ 5 phút xấu nhưng 1 giờ vẫn sạch → theo dõi, chưa dựng ai dậy',
        },
        {
          stdinLines: [],
          expected: 'Su co that: BAO DONG',
          match: 'contains',
          hidden: false,
          label: 'Cả hai cửa sổ cùng đốt ngân sách → đây mới là lúc gọi người trực',
        },
        {
          stdinLines: [],
          expected: 'Dung nguong: im lang',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — tốc độ tiêu ĐÚNG BẰNG 14.4: đề nói "lớn hơn", nên chưa báo động',
        },
      ],
      hints: [
        'Tính trước hai con số rồi mới xét: `const a = ngan.tiLeLoi / NGAN_SACH_LOI` và `const b = dai.tiLeLoi / NGAN_SACH_LOI`.',
        'Thứ tự ba ca: xét "cả hai cùng vượt" TRƯỚC, rồi mới tới "chỉ cửa sổ ngắn vượt", cuối cùng là im lặng. Đảo thứ tự thì ca sự cố thật rơi vào nhánh "theo doi".',
        'Ca ẩn bắt dấu so sánh: đề viết "lớn hơn 14.4", nên `>=` sẽ làm ca đúng-bằng-ngưỡng báo động sai. Số thực chia nhau hay lệch ở chữ số cuối, nên đây là chỗ phải đọc kỹ đề chứ không đoán.',
        'Khung tham chiếu:\n\nif (a > NGUONG && b > NGUONG) return "BAO DONG"\nif (a > NGUONG) return "theo doi"\nreturn "im lang"',
      ],
      sampleSolution: `interface CuaSo {
  ten: string
  tiLeLoi: number
}

const NGAN_SACH_LOI = 0.01
const NGUONG = 14.4

function xetCanhBao(ngan: CuaSo, dai: CuaSo): string {
  const a = ngan.tiLeLoi / NGAN_SACH_LOI
  const b = dai.tiLeLoi / NGAN_SACH_LOI
  if (a > NGUONG && b > NGUONG) return "BAO DONG"
  if (a > NGUONG) return "theo doi"
  return "im lang"
}

// ---- Đừng sửa phần dưới đây ----
const yen: CuaSo = { ten: "5 phut", tiLeLoi: 0.0005 }
const yenDai: CuaSo = { ten: "1 gio", tiLeLoi: 0.0004 }
const nhieu: CuaSo = { ten: "5 phut", tiLeLoi: 0.2 }
const daiSach: CuaSo = { ten: "1 gio", tiLeLoi: 0.001 }
const daiXau: CuaSo = { ten: "1 gio", tiLeLoi: 0.18 }
const vuaDung: CuaSo = { ten: "cua so", tiLeLoi: 0.144 }

console.log("Yen tinh:", xetCanhBao(yen, yenDai))
console.log("Nhieu tuc thoi:", xetCanhBao(nhieu, daiSach))
console.log("Su co that:", xetCanhBao(nhieu, daiXau))
console.log("Dung nguong:", xetCanhBao(vuaDung, vuaDung))`,
    },
    homework:
      'Viết SLO đầu tiên cho một tính năng của chính bạn, đúng một câu có số: "X% lượt <hành động> thành công trong <khoảng thời gian>". Rồi tính ngân sách lỗi và trả lời: tuần vừa rồi bạn đã tiêu hết bao nhiêu phần trăm ngân sách đó? Nếu không trả lời được thì bạn chưa đo triệu chứng người dùng — và đó là việc phải làm trước khi dựng bất kỳ cảnh báo nào.',
    srsCards: [
      {
        hoi: 'Nên đánh thức người trực lúc ba giờ sáng vì tín hiệu loại nào?',
        dap: 'Vì triệu chứng người dùng — tỉ lệ lỗi, độ trễ p95, tỉ lệ giao dịch thất bại. Tín hiệu nguyên nhân như CPU hay RAM dùng để chẩn đoán sau khi đã bị đánh thức, chứ không dùng làm cớ đánh thức.',
      },
      {
        hoi: 'Ngân sách lỗi được tính thế nào và dùng để làm gì?',
        dap: 'Ngân sách lỗi bằng 100% trừ SLO, ví dụ SLO 99% thì ngân sách là 1%. Nó biến tranh cãi làm tính năng hay sửa ổn định thành một con số: còn ngân sách thì cứ phát hành, tiêu gần hết thì đóng băng và quay về sửa.',
      },
      {
        hoi: 'Vì sao luật cảnh báo nên dùng hai cửa sổ thời gian?',
        dap: 'Cửa sổ ngắn giúp phản ứng nhanh, cửa sổ dài xác nhận đó không phải nhiễu tức thời; chỉ báo động khi cả hai cùng vượt ngưỡng. Nhờ vậy người trực không bị đánh thức vì một nhịp lỗi thoáng qua rồi học thói quen tắt chuông.',
      },
    ],
  },
]
