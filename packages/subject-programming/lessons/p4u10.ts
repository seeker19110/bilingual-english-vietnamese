// lessons/p4u10.ts — Bài học P4-U10: TYPE, INTERFACE — VÌ SAO TYPE CỨU DỰ ÁN LỚN.
// Làn A (chạy thật qua tsc) — trọng tâm sư phạm không phải cú pháp `interface`, mà là cho
// học viên THẤY trình biên dịch chặn dữ liệu sai TRƯỚC KHI chạy, thay vì để nó vỡ lúc chạy
// thật (hoặc tệ hơn, vỡ ở sản phẩm sau khi đã lên hàng chục file khác đọc cùng dữ liệu đó).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P4U10_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p4-u10-l1',
    unitId: 'p4-u10',
    language: 'typescript',
    title: 'type, interface — vì sao type cứu dự án lớn',
    hook: 'Dự án của bạn có 30 file, và một hàm tinhThanhTien(mon) được gọi ở 12 chỗ. Một hôm bạn đổi mon.soLuong từ số thành chuỗi "2" ở MỘT nơi. JavaScript không kêu ca gì — nó cứ nhân, cứ chạy, và bạn chỉ phát hiện ra khi khách hàng phàn nàn hoá đơn sai. TypeScript thì bắt lỗi đó ngay khi bạn gõ xong dòng code, ở đúng dòng gây lỗi, trước khi ai chạy thử.',
    theory:
      'JavaScript không hỏi bạn "biến này chứa cái gì" — nó chấp nhận mọi giá trị vào mọi chỗ, rồi để lỗi xảy ra lúc CHẠY, có khi ở một dòng rất xa chỗ bạn gõ sai. TypeScript thêm một lớp KHAI BÁO KIỂU lên trên JavaScript: bạn nói rõ một biến/tham số/giá trị trả về là kiểu gì, và trình biên dịch (tsc) tự kiểm tra xem toàn bộ code có dùng đúng lời khai đó không — TRƯỚC KHI chạy một dòng nào.\n\nHai cách khai kiểu hay dùng nhất:\n  type TenKieu = { truong: kieu, ... }        (type alias)\n  interface TenKieu { truong: kieu; ... }     (interface)\nVới object đơn giản, hai cách gần như tương đương ở giai đoạn này — cứ chọn interface cho hình dạng dữ liệu, dùng type khi cần gộp nhiều kiểu lại (union, xem bài sau).\n\nQuan trọng hơn cả việc khai kiểu cho biến là khai kiểu cho THAM SỐ và GIÁ TRỊ TRẢ VỀ của hàm:\n  function tinhThanhTien(sp: SanPham, soLuong: number): number { ... }\nKhông ghi `: number` cho tham số nghĩa là TypeScript coi nó là "implicit any" — tức là bỏ hết lợi ích vừa nói, và ở chế độ `strict` (dự án DHCB luôn bật), đó thẳng thừng là LỖI biên dịch, không phải cảnh báo.\n\nCái được lớn nhất không nằm ở việc gõ nhiều hơn vài chữ. Nó nằm ở chỗ: khi dự án lớn lên hàng chục, hàng trăm file, không ai còn nhớ hết "hàm này mong đợi gì" trong đầu — interface CHÍNH LÀ trí nhớ đó, được máy kiểm tra hộ bạn ở mọi nơi, mọi lúc, thay vì phải test thủ công từng đường gọi hàm.',
    workedExample: {
      code: `interface SanPham {
  ten: string
  gia: number
}

// Kiểu cho THAM SỐ và GIÁ TRỊ TRẢ VỀ — không phải chỉ khai kiểu cho biến thường
function tinhThanhTien(sp: SanPham, soLuong: number): number {
  return sp.gia * soLuong
}

const caPhe: SanPham = { ten: "Ca phe sua", gia: 25000 }
console.log("Thanh tien:", tinhThanhTien(caPhe, 3))`,
      stdinLines: [],
    },
    predict: {
      code: `interface SanPham {
  ten: string
  gia: number
}

function tinhThanhTien(sp: SanPham): number {
  return sp.gia
}

const hangLoi: SanPham = { ten: "Ca phe sua", gia: "25000" }
console.log(tinhThanhTien(hangLoi))`,
      question: 'Trường gia được gán chuỗi "25000" thay vì số 25000. Điều gì xảy ra khi biên dịch?',
      choices: ['Dong 10: TS2322', 'Dong 10: TS7006', 'Dong 6: TS2322', 'Dong 6: TS7006'],
      answerIndex: 0,
      explain:
        'interface SanPham khai gia là number, nên gán chuỗi "25000" vào đó bị tsc từ chối ngay — mã lỗi TS2322 ("không thể gán kiểu string cho kiểu number"). Chương trình KHÔNG được chạy, dù bằng mắt thường "25000" trông chẳng khác gì 25000. Đây chính là điều JavaScript thuần không làm được: nó sẽ âm thầm chạy tiếp và có thể gây lỗi tính toán ở một chỗ khác, xa hẳn dòng gán sai này.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự: khai interface, viết hàm dùng interface đó, rồi gọi hàm.',
      lines: [
        'interface HangHoa {',
        '  ten: string',
        '  gia: number',
        '}',
        'function tinhTien(mon: HangHoa): number {',
        '  return mon.gia',
        '}',
        'console.log(tinhTien({ ten: "Tra da", gia: 5000 }))',
      ],
    },
    make: {
      prompt:
        'Chương trình dưới đây tính tổng tiền hai giỏ hàng, nhưng hai hàm tinhThanhTien và tinhTongGioHang chưa có khai báo kiểu cho tham số và giá trị trả về — vì vậy tsc (chế độ strict) từ chối biên dịch.\n\nHãy thêm đúng kiểu:\n  · Tham số của tinhThanhTien là một HangHoa, trả về number.\n  · Tham số của tinhTongGioHang là một mảng HangHoa (HangHoa[]), trả về number.\n\nKHÔNG được dùng any ở bất cứ đâu — dùng any là bỏ qua bài học, và cổng chấm sẽ không tính bài đạt nếu bạn né kiểu bằng any. Đừng sửa phần khai interface hay phần gọi hàm ở cuối.',
      starterCode: `interface HangHoa {
  ten: string
  gia: number
  soLuong: number
}

// TODO: thêm kiểu cho tham số và giá trị trả về (KHÔNG dùng any)
function tinhThanhTien(mon) {
  return mon.gia * mon.soLuong
}

// TODO: thêm kiểu cho tham số và giá trị trả về (KHÔNG dùng any)
function tinhTongGioHang(gioHang) {
  let tong = 0
  for (const mon of gioHang) {
    tong += tinhThanhTien(mon)
  }
  return tong
}

// ---- Đừng sửa phần dưới đây ----
const gioHangA: HangHoa[] = [
  { ten: "Ca phe sua", gia: 25000, soLuong: 2 },
  { ten: "Tra da", gia: 5000, soLuong: 3 },
]
const gioHangB: HangHoa[] = [{ ten: "Banh mi", gia: 15000, soLuong: 4 }]

console.log("Gio A:", tinhTongGioHang(gioHangA))
console.log("Gio B:", tinhTongGioHang(gioHangB))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Gio A: 65000',
          match: 'contains',
          hidden: false,
          label: '2 ly cà phê sữa 25.000đ + 3 trà đá 5.000đ = 65.000đ',
        },
        {
          stdinLines: [],
          expected: 'Gio B: 60000',
          match: 'contains',
          hidden: false,
          label: '4 ổ bánh mì 15.000đ = 60.000đ',
        },
        {
          stdinLines: [],
          expected: 'Khong co loi kieu',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — chương trình phải SẠCH KIỂU (không còn implicit any) mới được chạy',
        },
      ],
      hints: [
        'interface HangHoa đã khai ten: string, gia: number, soLuong: number. Tham số của một hàm nhận một HangHoa thì khai `mon: HangHoa` — y hệt cách bạn khai kiểu cho biến thường, chỉ khác là viết trong ngoặc tròn của hàm.',
        'Lỗi TS7006 "Parameter mon implicitly has an any type" nghĩa là bạn quên khai kiểu cho đúng tham số đó — tsc luôn chỉ rõ tên tham số và số dòng, đọc kỹ thông báo lỗi thay vì đoán.',
        'tinhTongGioHang nhận một MẢNG HangHoa chứ không phải một HangHoa đơn — kiểu mảng viết bằng cách thêm [] sau tên kiểu phần tử, ví dụ HangHoa[].',
        'Khung tham chiếu:\n\nfunction tinhThanhTien(mon: HangHoa): number {\n  return mon.gia * mon.soLuong\n}\n\nfunction tinhTongGioHang(gioHang: HangHoa[]): number {\n  let tong = 0\n  for (const mon of gioHang) {\n    tong += tinhThanhTien(mon)\n  }\n  return tong\n}',
      ],
      sampleSolution: `interface HangHoa {
  ten: string
  gia: number
  soLuong: number
}

function tinhThanhTien(mon: HangHoa): number {
  return mon.gia * mon.soLuong
}

function tinhTongGioHang(gioHang: HangHoa[]): number {
  let tong = 0
  for (const mon of gioHang) {
    tong += tinhThanhTien(mon)
  }
  return tong
}

const gioHangA: HangHoa[] = [
  { ten: "Ca phe sua", gia: 25000, soLuong: 2 },
  { ten: "Tra da", gia: 5000, soLuong: 3 },
]
const gioHangB: HangHoa[] = [{ ten: "Banh mi", gia: 15000, soLuong: 4 }]

console.log("Gio A:", tinhTongGioHang(gioHangA))
console.log("Gio B:", tinhTongGioHang(gioHangB))`,
    },
    homework:
      'Trên máy của bạn: npm install -D typescript, sau đó npx tsc --init để tạo tsconfig.json, mở file đó lên bật "strict": true (nếu chưa có sẵn). Viết một file bai.ts thật của bạn (bất kỳ chương trình nhỏ nào — kể cả bài Make ở trên chép lại), rồi chạy npx tsc --noEmit. Nếu sạch kiểu, lệnh không in gì cả (im lặng = thành công, khác hẳn cách các ngôn ngữ khác báo "OK"). Thử cố tình gõ sai một kiểu (ví dụ gán số cho biến string) và chạy lại — đọc thông báo lỗi thật, đối chiếu với cách bài học này định dạng lỗi.',
    srsCards: [
      {
        hoi: 'Vì sao khai kiểu cho THAM SỐ và GIÁ TRỊ TRẢ VỀ của hàm quan trọng hơn khai kiểu cho biến thường?',
        dap: 'Vì hàm thường được gọi ở nhiều nơi khác nhau trong dự án — khai kiểu ở đó giúp tsc kiểm tra MỌI lời gọi hàm, thay vì chỉ kiểm một biến dùng một lần.',
      },
      {
        hoi: 'Chuyện gì xảy ra khi tsc phát hiện lỗi kiểu (ví dụ TS2322) trong chế độ strict?',
        dap: 'Chương trình KHÔNG được chạy — trình biên dịch dừng lại và in ra danh sách lỗi kèm số dòng, khác với JavaScript vốn cứ chạy tiếp cho tới khi lỗi thật sự xảy ra lúc runtime.',
      },
      {
        hoi: 'Vì sao dùng any để né lỗi kiểu là một lựa chọn tệ?',
        dap: 'any tắt hoàn toàn việc kiểm tra kiểu cho chỗ đó — bạn quay lại đúng tình trạng JavaScript thuần, mất hết lợi ích tsc vừa cung cấp, mà vẫn phải gõ thêm chữ any.',
      },
    ],
  },
]
