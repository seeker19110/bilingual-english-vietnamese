// lessons/p6u128.ts — P6-U128: HƯỚNG DỮ LIỆU, chặng S3 "Quy mô và thời gian thực" —
// chi phí & quản trị (module `data-s3-m4`) gộp với thực nghiệm (module `data-s3-m3`).
//
// Vì sao gộp: hai module cùng trả lời một câu hỏi mà kỹ sư dữ liệu bị hỏi nhiều nhất khi lên
// mức S3 — "con số này ĐÁNG BAO NHIÊU?". Bài 1 đo cái giá phải trả để có con số (byte quét,
// tiền đám mây, nghĩa vụ giữ dữ liệu cá nhân); bài 2 đo mức tin cậy của con số khi đem nó ra
// quyết định (cỡ mẫu, dừng sớm là gian lận). Đúng tiền lệ backend-s2/s3/s4 gộp m3+m4 thành
// unit cuối chặng.
//
// Dùng làn `typescript`, mô phỏng bằng hàm thuần tất định — bảng phân vùng và bảng cột là
// mảng nhỏ, không kho dữ liệu thật; phần A/B test chấm bằng luật quyết định, KHÔNG random
// (logic ngẫu nhiên không test được, xem QUY-TRINH-AUDIT tầng 10).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U128_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u128-l1',
    unitId: 'p6-u128',
    language: 'typescript',
    title: 'Quét ít đi thì rẻ đi — phân vùng, định dạng cột và nghĩa vụ với dữ liệu cá nhân',
    hook: 'Một truy vấn `SELECT * FROM su_kien WHERE ngay = hom_qua` chạy 40 giây và hoá đơn cuối tháng nhảy thêm vài triệu đồng. Cả hai con số đến từ đúng MỘT nguyên nhân: kho dữ liệu vừa đọc trọn 2 TB để trả về 3 MB, vì bảng không phân vùng và câu lệnh xin hết mọi cột.',
    theory:
      'Trên kho dữ liệu đám mây, đơn vị tính tiền thường là **số byte ĐƯỢC QUÉT**, không phải số dòng trả về. Nghĩa là tối ưu chi phí và tối ưu tốc độ là cùng một việc: **làm sao chạm vào ít dữ liệu nhất có thể.** Có ba đòn bẩy, và chúng nhân với nhau chứ không cộng.\n\n**Đòn bẩy 1 — phân vùng (partitioning) cắt theo DÒNG.** Dữ liệu được xếp vào các thư mục theo giá trị một cột, thường là ngày. Truy vấn lọc đúng cột đó chỉ đọc những thư mục liên quan; các thư mục còn lại thậm chí không được mở. Đó gọi là CẮT TỈA PHÂN VÙNG (partition pruning). Nó chỉ hoạt động khi điều kiện lọc đặt TRỰC TIẾP lên cột phân vùng: bọc cột trong một hàm (kiểu `WHERE year(ngay) = 2026`) là engine không cắt tỉa được nữa và bạn quay về quét toàn bảng mà không hề có thông báo nào.\n\nSố phân vùng cũng có điểm gãy: quá thô (một phân vùng mỗi năm) thì cắt tỉa vô nghĩa; quá mịn (một phân vùng mỗi phút) thì sinh hàng triệu tệp tí hon và siêu dữ liệu tự nó trở thành nút cổ chai — chuyện quen thuộc gọi là "vấn đề tệp nhỏ".\n\n**Đòn bẩy 2 — định dạng cột (Parquet, ORC) cắt theo CỘT.** Định dạng theo dòng như CSV lưu mỗi dòng liền một mạch, nên muốn đọc một cột vẫn phải quét qua mọi cột. Định dạng cột lưu mỗi cột thành một khối riêng: xin 2 cột trong bảng 50 cột thì đọc đúng 2 khối. Đây chính là câu trả lời cho câu hỏi vì sao `SELECT *` bị coi là thói quen xấu trên kho phân tích — không phải vì gõ nhiều chữ, mà vì nó vô hiệu hoá đòn bẩy này.\n\n**Đòn bẩy 3 — nén.** Dữ liệu cùng một cột thì cùng kiểu và hay lặp lại, nên nén rất tốt (mã hoá từ điển, mã hoá theo loạt). Ít byte trên đĩa là ít byte phải đọc, và cũng ít tiền lưu trữ.\n\nBa đòn bẩy nhân nhau: quét 1 phân vùng trong 365 phân vùng, lấy 2 cột trong 50 cột, nén 4 lần — bạn chạm vào khoảng một phần bảy nghìn dữ liệu so với truy vấn ngây thơ.\n\nCuối cùng, một loại chi phí không nằm trên hoá đơn: **dữ liệu giữ càng lâu, nghĩa vụ càng nặng.** Bảng sự kiện thô chứa dữ liệu cá nhân là rủi ro pháp lý và rủi ro rò rỉ tăng theo thời gian. Nên mọi bảng cần một CHÍNH SÁCH VÒNG ĐỜI: giữ bản thô bao lâu, khi nào chỉ giữ bản đã tổng hợp, và cột nào phải CHE (băm số điện thoại, giữ ba số đầu mã bưu chính thay vì địa chỉ đầy đủ). Xoá đúng hạn không chỉ là tuân thủ pháp luật — nó cũng làm bảng nhỏ đi và truy vấn rẻ đi. Ở đây lợi ích và nghĩa vụ trùng nhau, chuyện hiếm gặp.',
    workedExample: {
      code: `interface PhanVung {
  ngay: string
  soDong: number
}

interface Cot {
  ten: string
  byteMoiDong: number
}

const PHAN_VUNG: PhanVung[] = [
  { ngay: "2026-08-29", soDong: 1000 },
  { ngay: "2026-08-30", soDong: 2000 },
  { ngay: "2026-08-31", soDong: 3000 },
]

const COT: Cot[] = [
  { ten: "ma_don", byteMoiDong: 8 },
  { ten: "tien", byteMoiDong: 8 },
  { ten: "ghi_chu", byteMoiDong: 200 }, // cot nang nhat, hiem khi can
]

// Cat tia phan vung: chi giu phan vung nam trong danh sach ngay can.
function catTia(pv: PhanVung[], ngayCan: string[]): PhanVung[] {
  return pv.filter((p) => ngayCan.includes(p.ngay))
}

// Byte quet = (tong so dong cua phan vung con lai) x (tong byte cua cac cot duoc chon).
function byteQuet(pv: PhanVung[], cot: Cot[], cotCan: string[]): number {
  const dong = pv.reduce((t, p) => t + p.soDong, 0)
  const byteDong = cot
    .filter((c) => cotCan.includes(c.ten))
    .reduce((t, c) => t + c.byteMoiDong, 0)
  return dong * byteDong
}

const moiTen = byteQuet(PHAN_VUNG, COT, ["ma_don", "tien", "ghi_chu"])
const khonNgoan = byteQuet(catTia(PHAN_VUNG, ["2026-08-31"]), COT, ["ma_don", "tien"])

console.log("Quet toan bang, moi cot:", moiTen)
console.log("Cat tia + chon cot     :", khonNgoan)
console.log("Re hon so lan          :", moiTen / khonNgoan)`,
      stdinLines: [],
    },
    predict: {
      code: `interface PhanVung {
  ngay: string
  soDong: number
}
const PHAN_VUNG: PhanVung[] = [
  { ngay: "2026-08-29", soDong: 1000 },
  { ngay: "2026-08-30", soDong: 2000 },
  { ngay: "2026-08-31", soDong: 3000 },
]
// Dieu kien loc BOC cot phan vung trong mot ham -> engine khong cat tia duoc
function catTiaHong(pv: PhanVung[]): PhanVung[] {
  return pv
}
console.log(catTiaHong(PHAN_VUNG).reduce((t, p) => t + p.soDong, 0))`,
      question:
        'Điều kiện lọc bọc cột phân vùng trong một hàm nên engine không cắt tỉa được. Số dòng phải quét là bao nhiêu?',
      choices: [
        '6000',
        '3000 — van chi doc phan vung moi nhat',
        '0 vi khong khop dieu kien nao',
        '2000 — trung binh cac phan vung',
      ],
      answerIndex: 0,
      explain:
        'Không cắt tỉa được thì mọi phân vùng đều bị mở: 1000 cộng 2000 cộng 3000 bằng 6000 dòng. Đây là kiểu lỗi tốn tiền âm thầm nhất trên kho đám mây — truy vấn vẫn trả về đúng kết quả, không có cảnh báo nào, chỉ hoá đơn là biết. Cách phát hiện là đọc bản kế hoạch thực thi và xem số phân vùng bị quét.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm tính số byte quét: cộng số dòng của các phân vùng còn lại, cộng byte của các cột được chọn, rồi nhân hai con số.',
      lines: [
        'function byteQuet(pv: PhanVung[], cot: Cot[], cotCan: string[]): number {',
        '  const dong = pv.reduce((t, p) => t + p.soDong, 0)',
        '  const byteDong = cot',
        '    .filter((c) => cotCan.includes(c.ten))',
        '    .reduce((t, c) => t + c.byteMoiDong, 0)',
        '  return dong * byteDong',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết một máy ước lượng chi phí truy vấn để so hai cách viết cùng một câu hỏi.\n\n- catTia(pv, ngayCan): chỉ giữ phân vùng có ngày nằm trong danh sách ngayCan.\n- byteQuet(pv, cot, cotCan): tổng số dòng của các phân vùng nhân tổng byte mỗi dòng của các cột được chọn.\n- tienNghin(byte, nghinDongMoiMB): quy byte ra tiền, làm tròn XUỐNG số nguyên; 1 MB tính tròn là 1.000.000 byte.\n\nDùng starter code có sẵn (đừng sửa phần dưới): 3 phân vùng, 3 cột, giá 2 nghìn đồng mỗi MB quét.',
      starterCode: `interface PhanVung {
  ngay: string
  soDong: number
}

interface Cot {
  ten: string
  byteMoiDong: number
}

function catTia(pv: PhanVung[], ngayCan: string[]): PhanVung[] {
  // TODO
  return []
}

function byteQuet(pv: PhanVung[], cot: Cot[], cotCan: string[]): number {
  // TODO
  return 0
}

function tienNghin(byte: number, nghinDongMoiMB: number): number {
  // TODO
  return 0
}

// ---- Đừng sửa phần dưới đây ----
const PHAN_VUNG: PhanVung[] = [
  { ngay: "29", soDong: 1000 },
  { ngay: "30", soDong: 2000 },
  { ngay: "31", soDong: 3000 },
]
const COT: Cot[] = [
  { ten: "ma_don", byteMoiDong: 10 },
  { ten: "tien", byteMoiDong: 10 },
  { ten: "ghi_chu", byteMoiDong: 180 },
]
const ngayNgo = byteQuet(PHAN_VUNG, COT, ["ma_don", "tien", "ghi_chu"])
const toiUu = byteQuet(catTia(PHAN_VUNG, ["31"]), COT, ["ma_don", "tien"])
console.log("Ngay ngo:", ngayNgo, "byte, tien", tienNghin(ngayNgo, 2))
console.log("Toi uu  :", toiUu, "byte, tien", tienNghin(toiUu, 2))
console.log("Re hon so lan:", ngayNgo / toiUu)`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Ngay ngo: 1200000 byte, tien 2',
          match: 'contains',
          hidden: false,
          label:
            '6000 dòng nhân 200 byte = 1.200.000 byte, tức 1,2 MB nhân 2 nghìn, làm tròn xuống 2',
        },
        {
          stdinLines: [],
          expected: 'Toi uu  : 60000 byte, tien 0',
          match: 'contains',
          hidden: false,
          label: '3000 dòng nhân 20 byte = 60.000 byte — chưa tới 1 MB nên tiền làm tròn xuống 0',
        },
        {
          stdinLines: [],
          expected: 'Re hon so lan: 20',
          match: 'contains',
          hidden: false,
          label: 'Cắt tỉa phân vùng và chọn cột nhân nhau cho hệ số tiết kiệm 20 lần',
        },
        {
          stdinLines: [],
          expected:
            'Ngay ngo: 1200000 byte, tien 2\nToi uu  : 60000 byte, tien 0\nRe hon so lan: 20',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: cả ba dòng đúng thứ tự (chống hardcode từng dòng riêng lẻ)',
        },
      ],
      hints: [
        'catTia: một dòng filter với ngayCan.includes(p.ngay) — đây chính là thứ engine làm khi điều kiện lọc đặt trực tiếp lên cột phân vùng.',
        'byteQuet gồm hai phép cộng dồn rồi một phép nhân: tổng soDong của phân vùng, tổng byteMoiDong của những cột có tên nằm trong cotCan.',
        'tienNghin: byte chia 1000000 rồi nhân nghinDongMoiMB, bọc trong Math.floor để làm tròn xuống — 60.000 byte phải ra 0 chứ không phải 0,12.',
      ],
      sampleSolution: `interface PhanVung {
  ngay: string
  soDong: number
}

interface Cot {
  ten: string
  byteMoiDong: number
}

function catTia(pv: PhanVung[], ngayCan: string[]): PhanVung[] {
  return pv.filter((p) => ngayCan.includes(p.ngay))
}

function byteQuet(pv: PhanVung[], cot: Cot[], cotCan: string[]): number {
  const dong = pv.reduce((t, p) => t + p.soDong, 0)
  const byteDong = cot
    .filter((c) => cotCan.includes(c.ten))
    .reduce((t, c) => t + c.byteMoiDong, 0)
  return dong * byteDong
}

function tienNghin(byte: number, nghinDongMoiMB: number): number {
  return Math.floor((byte / 1000000) * nghinDongMoiMB)
}

// ---- Đừng sửa phần dưới đây ----
const PHAN_VUNG: PhanVung[] = [
  { ngay: "29", soDong: 1000 },
  { ngay: "30", soDong: 2000 },
  { ngay: "31", soDong: 3000 },
]
const COT: Cot[] = [
  { ten: "ma_don", byteMoiDong: 10 },
  { ten: "tien", byteMoiDong: 10 },
  { ten: "ghi_chu", byteMoiDong: 180 },
]
const ngayNgo = byteQuet(PHAN_VUNG, COT, ["ma_don", "tien", "ghi_chu"])
const toiUu = byteQuet(catTia(PHAN_VUNG, ["31"]), COT, ["ma_don", "tien"])
console.log("Ngay ngo:", ngayNgo, "byte, tien", tienNghin(ngayNgo, 2))
console.log("Toi uu  :", toiUu, "byte, tien", tienNghin(toiUu, 2))
console.log("Re hon so lan:", ngayNgo / toiUu)`,
    },
    homework:
      'Lấy một bảng thật bạn truy vấn thường xuyên (hoặc một tệp CSV lớn). Trả lời trên giấy: (1) nếu phân vùng nó theo ngày, một truy vấn "hôm qua" sẽ chạm bao nhiêu phần trăm dữ liệu hiện tại; (2) truy vấn bạn hay viết dùng mấy cột trên tổng số cột; (3) bảng đó có cột nào là dữ liệu cá nhân, và bạn thấy giữ bản thô bao lâu là hợp lý. Câu (3) khó nhất vì nó không có đáp án kỹ thuật — hãy viết lý do chứ không chỉ viết con số.',
    srsCards: [
      {
        hoi: 'Trên kho dữ liệu đám mây, chi phí một truy vấn thường tính theo cái gì?',
        dap: 'Theo số byte được QUÉT chứ không phải số dòng trả về, nên tối ưu tiền và tối ưu tốc độ là cùng một việc: chạm vào ít dữ liệu nhất có thể.',
      },
      {
        hoi: 'Cắt tỉa phân vùng bị vô hiệu trong trường hợp nào?',
        dap: 'Khi điều kiện lọc bọc cột phân vùng trong một hàm hoặc phép biến đổi, engine không so trực tiếp được với giá trị phân vùng nên quét toàn bảng mà không báo lỗi gì.',
      },
      {
        hoi: 'Định dạng cột như Parquet tiết kiệm chi phí bằng cơ chế nào?',
        dap: 'Mỗi cột được lưu thành khối riêng nên truy vấn chỉ đọc đúng những cột nó xin; ngoài ra dữ liệu cùng cột thì đồng kiểu và lặp nhiều nên nén rất tốt.',
      },
      {
        hoi: 'Vì sao chia phân vùng quá mịn lại phản tác dụng?',
        dap: 'Vì sinh ra rất nhiều tệp tí hon, khiến siêu dữ liệu và chi phí mở tệp trở thành nút cổ chai — đó là vấn đề tệp nhỏ quen thuộc của kho dữ liệu.',
      },
    ],
  },
  {
    id: 'p6-u128-l2',
    unitId: 'p6-u128',
    language: 'typescript',
    title: 'A/B test — dừng sớm khi thấy số đẹp chính là gian lận',
    hook: 'Chạy thử nghiệm được hai ngày, phiên bản B đang hơn A tới 12%. Cả nhóm muốn dừng ngay và công bố thắng lợi. Nếu bạn làm vậy, con số 12% kia có xác suất rất cao là ngẫu nhiên thuần tuý — và bạn vừa biến một phép đo thành một lời đồn.',
    theory:
      'Thử nghiệm A/B tồn tại vì một lý do duy nhất: **phân biệt cải tiến thật với dao động ngẫu nhiên.** Bỏ qua kỷ luật thống kê thì nó không còn tác dụng ấy, và thứ bạn có chỉ là một trò tung đồng xu tốn kém.\n\n**Cỡ mẫu phải tính TRƯỚC, không phải nhìn TRONG lúc chạy.** Cỡ mẫu phụ thuộc ba thứ: tỉ lệ chuyển đổi nền hiện tại, mức chênh lệch nhỏ nhất đáng quan tâm (nhỏ hơn nữa thì có thật cũng không đáng làm), và mức chấp nhận sai. Một quy luật rất chống trực giác cần nhớ: **muốn phát hiện chênh lệch nhỏ đi một nửa thì cần cỡ mẫu lớn gấp bốn** — nên "đo được một cải thiện 0,5%" thường là điều bất khả với lưu lượng của phần lớn sản phẩm.\n\n**DỪNG SỚM (peeking) là cách gian lận phổ biến nhất, và người làm thường không biết mình đang gian lận.** Cơ chế như sau: chênh lệch giữa hai nhánh dao động liên tục quanh giá trị thật. Nếu bạn ngó bảng điều khiển mỗi ngày và cho phép mình dừng ngay khi thấy "có ý nghĩa thống kê", thì bạn đã tạo ra rất nhiều cơ hội để bắt gặp một dao động may mắn. Mức sai lầm danh nghĩa 5% sẽ phồng lên khoảng 20–30% với thói quen ngó hằng ngày. Luật nghiêm ngặt: **chốt trước ngày dừng và cỡ mẫu, rồi chỉ đọc kết quả một lần.** (Có những phương pháp cho phép nhìn giữa chừng một cách hợp lệ — kiểm định tuần tự, biên alpha-spending — nhưng chúng phải được thiết kế TỪ ĐẦU, không phải áp vào sau khi đã trót nhìn.)\n\nBa cái bẫy nữa hay gặp:\n\n- **Chỉ số dẫn dắt thay cho chỉ số kết quả.** Số lượt bấm là chỉ số dẫn dắt (đo được sớm, ồn ào); doanh thu giữ chân sau 30 ngày là chỉ số kết quả. Tối ưu chỉ số dẫn dắt mà làm hỏng chỉ số kết quả là chuyện xảy ra liên tục, ví dụ tiêu đề giật gân làm tăng lượt bấm và giảm tin cậy.\n- **Nhiều chỉ số cùng lúc.** Kiểm 20 chỉ số ở mức 5% thì trung bình có một chỉ số "thắng" hoàn toàn do may rủi. Phải chọn MỘT chỉ số quyết định trước khi chạy.\n- **Không thể làm thực nghiệm thì đừng giả vờ.** Khi không chia ngẫu nhiên được (thay đổi về giá, tính năng dùng chung cho cả nhóm bạn bè), hãy dùng phương pháp nhân quả có tên gọi rõ ràng — khác biệt kép, đối chứng tổng hợp, hồi quy gãy khúc — và nói thẳng giả định của nó. So sánh trước-sau trơn trụi không phải nhân quả: mùa vụ, chiến dịch quảng cáo và thời tiết đều đang cùng thay đổi với bạn.\n\nCuối cùng, một luật nghề: **kết quả âm cũng là kết quả.** Thử nghiệm cho thấy tính năng không có tác dụng đã tiết kiệm cho bạn công bảo trì nó suốt nhiều năm. Nhóm nào chỉ công bố thử nghiệm thắng thì hồ sơ số liệu của nhóm đó không dùng được nữa.',
    workedExample: {
      code: `interface Nhanh {
  ten: string
  soNguoi: number
  soChuyenDoi: number
}

function tiLe(n: Nhanh): number {
  return n.soNguoi === 0 ? 0 : n.soChuyenDoi / n.soNguoi
}

// Luat quyet dinh TAT DINH, chot truoc khi chay:
// 1) chua du co mau thi KHONG duoc ket luan, du chenh lech trong dep the nao;
// 2) du mau roi thi chenh lech phai vuot nguong toi thieu dang quan tam.
function ketLuan(a: Nhanh, b: Nhanh, coMauToiThieu: number, nguong: number): string {
  if (a.soNguoi < coMauToiThieu || b.soNguoi < coMauToiThieu) return "CHUA DU MAU"
  const chenh = tiLe(b) - tiLe(a)
  if (Math.abs(chenh) < nguong) return "KHONG KHAC BIET"
  return chenh > 0 ? "B THANG" : "A THANG"
}

const NGAY_2_A: Nhanh = { ten: "A", soNguoi: 200, soChuyenDoi: 20 } // 10%
const NGAY_2_B: Nhanh = { ten: "B", soNguoi: 200, soChuyenDoi: 24 } // 12%
const CUOI_A: Nhanh = { ten: "A", soNguoi: 5000, soChuyenDoi: 500 } // 10%
const CUOI_B: Nhanh = { ten: "B", soNguoi: 5000, soChuyenDoi: 510 } // 10,2%

console.log("Ngay 2:", ketLuan(NGAY_2_A, NGAY_2_B, 5000, 0.01))
console.log("Cuoi  :", ketLuan(CUOI_A, CUOI_B, 5000, 0.01))
// Ngay 2 trong nhu B thang dam; du mau roi thi chenh lech co lai con 0,2%.`,
      stdinLines: [],
    },
    predict: {
      code: `interface Nhanh {
  soNguoi: number
  soChuyenDoi: number
}
function tiLe(n: Nhanh): number {
  return n.soNguoi === 0 ? 0 : n.soChuyenDoi / n.soNguoi
}
const a: Nhanh = { soNguoi: 200, soChuyenDoi: 20 }
const b: Nhanh = { soNguoi: 200, soChuyenDoi: 24 }
console.log(tiLe(b) - tiLe(a) > 0, b.soNguoi >= 5000)`,
      question:
        'Ngày thứ hai của thử nghiệm: B nhỉnh hơn A, nhưng cỡ mẫu đã chốt trước là 5.000 mỗi nhánh. Hai giá trị in ra là gì?',
      choices: ['true false', 'true true', 'false false', 'false true'],
      answerIndex: 0,
      explain:
        'B đang hơn thật (giá trị đầu là true) nhưng mới có 200 người mỗi nhánh, còn xa cỡ mẫu 5.000 (giá trị sau là false). Đúng hai giá trị này là toàn bộ cái bẫy dừng sớm: điều kiện "trông có vẻ thắng" đã đạt trong khi điều kiện "được phép kết luận" thì chưa. Luật quyết định phải kiểm điều kiện thứ hai TRƯỚC.',
    },
    parsons: {
      prompt:
        'Xếp lại luật quyết định: chặn khi chưa đủ mẫu, tính chênh lệch, so với ngưỡng tối thiểu rồi mới kết luận bên nào thắng.',
      lines: [
        'function ketLuan(a: Nhanh, b: Nhanh, coMauToiThieu: number, nguong: number): string {',
        '  if (a.soNguoi < coMauToiThieu || b.soNguoi < coMauToiThieu) return "CHUA DU MAU"',
        '  const chenh = tiLe(b) - tiLe(a)',
        '  if (Math.abs(chenh) < nguong) return "KHONG KHAC BIET"',
        '  return chenh > 0 ? "B THANG" : "A THANG"',
        '}',
      ],
    },
    make: {
      prompt:
        'Cài luật quyết định của một thử nghiệm A/B tử tế — luật chốt TRƯỚC khi chạy, không đổi giữa chừng.\n\n- tiLe(n): tỉ lệ chuyển đổi của một nhánh; nhánh không có ai thì trả 0.\n- ketLuan(a, b, coMauToiThieu, nguong): trả "CHUA DU MAU" nếu một trong hai nhánh chưa đạt cỡ mẫu; nếu đủ mẫu mà trị tuyệt đối của chênh lệch nhỏ hơn ngưỡng thì trả "KHONG KHAC BIET"; còn lại trả "B THANG" khi B cao hơn, "A THANG" khi A cao hơn.\n- Thứ tự kiểm là bắt buộc: cỡ mẫu trước, chênh lệch sau. Đảo lại là cài đúng cái bẫy dừng sớm.\n\nDùng starter code có sẵn (đừng sửa phần dưới): ba thời điểm đọc số của cùng một thử nghiệm.',
      starterCode: `interface Nhanh {
  soNguoi: number
  soChuyenDoi: number
}

function tiLe(n: Nhanh): number {
  // TODO
  return 0
}

function ketLuan(a: Nhanh, b: Nhanh, coMauToiThieu: number, nguong: number): string {
  // TODO
  return ""
}

// ---- Đừng sửa phần dưới đây ----
const SOM_A: Nhanh = { soNguoi: 200, soChuyenDoi: 20 }
const SOM_B: Nhanh = { soNguoi: 200, soChuyenDoi: 24 }
const CUOI_A: Nhanh = { soNguoi: 5000, soChuyenDoi: 500 }
const CUOI_B: Nhanh = { soNguoi: 5000, soChuyenDoi: 510 }
const THANG_B: Nhanh = { soNguoi: 5000, soChuyenDoi: 600 }
console.log("Ti le som B:", tiLe(SOM_B))
console.log("Doc som   :", ketLuan(SOM_A, SOM_B, 5000, 0.01))
console.log("Doc cuoi  :", ketLuan(CUOI_A, CUOI_B, 5000, 0.01))
console.log("B thang that:", ketLuan(CUOI_A, THANG_B, 5000, 0.01))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Ti le som B: 0.12',
          match: 'contains',
          hidden: false,
          label: '24 chia 200 bằng 0,12',
        },
        {
          stdinLines: [],
          expected: 'Doc som   : CHUA DU MAU',
          match: 'contains',
          hidden: false,
          label: 'Chênh lệch trông đẹp nhưng chưa đủ cỡ mẫu thì không được kết luận',
        },
        {
          stdinLines: [],
          expected: 'Doc cuoi  : KHONG KHAC BIET',
          match: 'contains',
          hidden: false,
          label: 'Đủ mẫu rồi, chênh lệch 0,2% nhỏ hơn ngưỡng 1% nên không có khác biệt đáng kể',
        },
        {
          stdinLines: [],
          expected: 'B thang that: B THANG',
          match: 'contains',
          hidden: false,
          label: 'Đủ mẫu và chênh lệch 2% vượt ngưỡng thì mới được tuyên bố B thắng',
        },
        {
          stdinLines: [],
          expected:
            'Ti le som B: 0.12\nDoc som   : CHUA DU MAU\nDoc cuoi  : KHONG KHAC BIET\nB thang that: B THANG',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: cả bốn dòng đúng thứ tự (chống hardcode từng dòng riêng lẻ)',
        },
      ],
      hints: [
        'tiLe: nhớ chặn chia cho không bằng cách kiểm soNguoi bằng 0 trước — nhánh rỗng phải ra 0 chứ không ra NaN.',
        'ketLuan: viết ba câu lệnh return nối tiếp theo đúng thứ tự đề bài, đừng gộp thành một biểu thức điều kiện lồng nhau. Thứ tự chính là bài học.',
        'Trị tuyệt đối của chênh lệch dùng Math.abs — nếu quên, nhánh A thắng đậm sẽ bị xếp nhầm thành không khác biệt.',
      ],
      sampleSolution: `interface Nhanh {
  soNguoi: number
  soChuyenDoi: number
}

function tiLe(n: Nhanh): number {
  return n.soNguoi === 0 ? 0 : n.soChuyenDoi / n.soNguoi
}

function ketLuan(a: Nhanh, b: Nhanh, coMauToiThieu: number, nguong: number): string {
  if (a.soNguoi < coMauToiThieu || b.soNguoi < coMauToiThieu) return "CHUA DU MAU"
  const chenh = tiLe(b) - tiLe(a)
  if (Math.abs(chenh) < nguong) return "KHONG KHAC BIET"
  return chenh > 0 ? "B THANG" : "A THANG"
}

// ---- Đừng sửa phần dưới đây ----
const SOM_A: Nhanh = { soNguoi: 200, soChuyenDoi: 20 }
const SOM_B: Nhanh = { soNguoi: 200, soChuyenDoi: 24 }
const CUOI_A: Nhanh = { soNguoi: 5000, soChuyenDoi: 500 }
const CUOI_B: Nhanh = { soNguoi: 5000, soChuyenDoi: 510 }
const THANG_B: Nhanh = { soNguoi: 5000, soChuyenDoi: 600 }
console.log("Ti le som B:", tiLe(SOM_B))
console.log("Doc som   :", ketLuan(SOM_A, SOM_B, 5000, 0.01))
console.log("Doc cuoi  :", ketLuan(CUOI_A, CUOI_B, 5000, 0.01))
console.log("B thang that:", ketLuan(CUOI_A, THANG_B, 5000, 0.01))`,
    },
    homework:
      'Chọn một thay đổi bạn đang muốn làm cho sản phẩm của mình (đổi chữ trên nút, đổi thứ tự màn hình). Viết ra TRƯỚC bốn thứ, đúng như một bản đăng ký thử nghiệm: chỉ số quyết định duy nhất, mức chênh lệch nhỏ nhất đáng để bạn giữ thay đổi đó, ngày dừng, và điều bạn sẽ làm nếu kết quả là âm. Giữ tờ giấy đó. Nếu sau này bạn thấy mình muốn sửa một trong bốn dòng ấy giữa chừng, bạn vừa bắt quả tang chính mình đang dừng sớm.',
    srsCards: [
      {
        hoi: 'Vì sao dừng thử nghiệm A/B ngay khi thấy kết quả đẹp là gian lận?',
        dap: 'Vì chênh lệch dao động quanh giá trị thật, nên mỗi lần ngó là thêm một cơ hội bắt gặp dao động may mắn; mức sai lầm danh nghĩa 5% phồng lên tới hai ba chục phần trăm khi nhìn hằng ngày.',
      },
      {
        hoi: 'Cỡ mẫu của một thử nghiệm phụ thuộc những yếu tố nào?',
        dap: 'Tỉ lệ chuyển đổi nền hiện tại, mức chênh lệch nhỏ nhất đáng quan tâm, và mức chấp nhận sai — trong đó muốn phát hiện chênh lệch nhỏ đi một nửa thì cần cỡ mẫu lớn gấp bốn.',
      },
      {
        hoi: 'Chỉ số dẫn dắt khác chỉ số kết quả thế nào, và rủi ro là gì?',
        dap: 'Chỉ số dẫn dắt đo được sớm nhưng ồn ào (lượt bấm), chỉ số kết quả mới là điều thật sự muốn (doanh thu, giữ chân); tối ưu chỉ số dẫn dắt có thể làm hỏng chỉ số kết quả.',
      },
      {
        hoi: 'Khi không chia ngẫu nhiên được thì đo tác động bằng cách nào?',
        dap: 'Dùng phương pháp nhân quả có tên gọi rõ ràng như khác biệt kép, đối chứng tổng hợp hay hồi quy gãy khúc, và nói rõ giả định; so sánh trước-sau trơn trụi không phải bằng chứng nhân quả.',
      },
    ],
  },
]
