// lessons/p6u107.ts — P6-U107: HƯỚNG BACKEND, chặng S3 "Hệ phân tán" — Vận hành hệ đã lớn
// (gộp `backend-s3-m3` "Chịu lỗi" + `backend-s3-m4` "Quan sát hệ thống").
//
// p6-u105/u106 dạy CÁCH DỰNG hệ phân tán (sharding, gọi mạng không-biết, đồng thuận…).
// U107 dạy điều xảy ra SAU khi hệ đã chạy thật: một dịch vụ phụ thuộc bắt đầu hỏng (bài 1 —
// circuit breaker chặn lỗi lan ra, không để người dùng chờ timeout hàng loạt), và làm sao
// BIẾT hệ đang khoẻ hay không bằng CON SỐ chứ không phải cảm giác (bài 2 — SLO/error budget).
//
// Dùng làn `typescript`, mô phỏng bằng hàm/class thuần tất định — không mạng/CSDL thật.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U107_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u107-l1',
    unitId: 'p6-u107',
    language: 'typescript',
    title: 'Circuit breaker — ngừng gọi dịch vụ đang hỏng, đừng để cả hệ chờ chết theo',
    hook: 'Dịch vụ "kiểm tồn kho" bắt đầu treo, mỗi lệnh gọi mất 10 giây mới timeout. Trang thanh toán của bạn gọi nó cho MỌI đơn hàng — không sửa gì, chỉ vì một dịch vụ phụ thuộc chậm, cả trang thanh toán cũng chậm theo, rồi nghẽn hết luồng xử lý. Cái cần làm không phải "chờ nó khoẻ lại", mà là NGỪNG GỌI NGAY khi phát hiện nó đang hỏng.',
    theory:
      'CIRCUIT BREAKER (cầu dao điện tử) là một máy trạng thái đứng giữa bạn và một dịch vụ phụ thuộc, có 3 trạng thái:\n\n1. CLOSED (đóng — bình thường): cho mọi cuộc gọi đi qua thật. Nếu lỗi LIÊN TIẾP vượt một ngưỡng (vd 3 lỗi liền nhau) thì chuyển sang OPEN.\n2. OPEN (mở — đang ngắt): CHẶN NGAY mọi cuộc gọi, không gọi dịch vụ đang hỏng nữa — trả lỗi tức thì thay vì bắt người dùng chờ timeout. Đây chính là phần ngược đời nhưng đúng: "mở" nghĩa là mạch bị NGẮT, giống cầu dao điện thật nhảy lên để ngắt dòng khi quá tải.\n3. HALF_OPEN (thử lại sau nghỉ): sau một khoảng nghỉ, cho ĐÚNG MỘT cuộc gọi thử đi qua để dò xem dịch vụ đã khoẻ chưa. Thử thành công → về CLOSED (tin tưởng lại). Thử thất bại → quay lại OPEN (chưa khoẻ, ngắt tiếp).\n\nVí dụ số: ngưỡng lỗi liên tiếp = 3. Gọi thất bại lần 1, 2 — vẫn CLOSED (chưa tới ngưỡng), cuộc gọi vẫn đi qua thật. Lỗi lần thứ 3 (liên tiếp) → chuyển ngay sang OPEN. Từ đó mọi cuộc gọi tiếp theo bị chặn ngay lập tức, không chạm tới dịch vụ nữa, cho tới khi có lệnh "thử lại" đưa nó vào HALF_OPEN.\n\nHai kỹ thuật thân cận, chỉ cần NẮM Ý TƯỞNG (không cần cài trong bài này):\n\n- BULKHEAD (khoang tàu — mượn từ vách ngăn nước trên tàu thuỷ): giới hạn số lời gọi ĐỒNG THỜI cho MỖI dịch vụ phụ thuộc RIÊNG BIỆT (vd tối đa 10 luồng gọi "kiểm tồn kho" cùng lúc), để một dịch vụ hỏng ngốn hết luồng/kết nối không ăn lan sang phần còn lại của hệ thống — giống vách ngăn giữ nước tràn vào một khoang không nhấn chìm cả tàu.\n- SUY GIẢM CÓ KIỂM SOÁT (graceful degradation): khi một phần phụ thuộc hỏng, trả về dữ liệu CŨ/RÚT GỌN (vd hiện tồn kho lần cache gần nhất, ẩn tính năng gợi ý) thay vì để CẢ TRANG sập theo. Người dùng vẫn dùng được phần lõi, chỉ mất phần phụ.',
    workedExample: {
      code: `type TrangThai = "CLOSED" | "OPEN" | "HALF_OPEN"

class CircuitBreaker {
  private trangThai: TrangThai = "CLOSED"
  private soLoiLienTiep = 0
  private nguong: number

  constructor(nguong: number) {
    this.nguong = nguong
  }

  // Mo phong mot cuoc goi toi dich vu phu thuoc, tra ve hanh dong THAT SU xay ra
  goi(ketQuaGiaLap: boolean): string {
    if (this.trangThai === "OPEN") {
      return "chan_ngay" // dang OPEN -> khong cham toi dich vu, tra loi ngay
    }

    if (this.trangThai === "HALF_OPEN") {
      // dang thu lai: DUNG MOT cuoc goi thu di qua
      if (ketQuaGiaLap) {
        this.trangThai = "CLOSED"
        this.soLoiLienTiep = 0
      } else {
        this.trangThai = "OPEN"
        this.soLoiLienTiep = 0
      }
      return "goi_thu_nua_mo"
    }

    // trangThai === "CLOSED": goi that
    if (ketQuaGiaLap) {
      this.soLoiLienTiep = 0
    } else {
      this.soLoiLienTiep++
      if (this.soLoiLienTiep >= this.nguong) {
        this.trangThai = "OPEN"
      }
    }
    return "goi_that"
  }

  // Ham phu de test: chuyen thu cong tu OPEN sang HALF_OPEN (mo phong "het thoi gian nghi")
  choPhepThuLai(): void {
    if (this.trangThai === "OPEN") this.trangThai = "HALF_OPEN"
  }

  layTrangThai(): TrangThai {
    return this.trangThai
  }
}

const cb = new CircuitBreaker(3)
console.log(cb.goi(false)) // goi_that (loi 1)
console.log(cb.goi(false)) // goi_that (loi 2)
console.log(cb.goi(false)) // goi_that (loi 3 -> vuot nguong, chuyen OPEN)
console.log(cb.goi(true)) // chan_ngay (dang OPEN, khong goi that nua)
console.log(cb.layTrangThai())
cb.choPhepThuLai()
console.log(cb.goi(true)) // goi_thu_nua_mo -> thanh cong -> ve CLOSED
console.log(cb.layTrangThai())`,
      stdinLines: [],
    },
    predict: {
      code: `type TrangThai = "CLOSED" | "OPEN" | "HALF_OPEN"
class CB {
  trangThai: TrangThai = "CLOSED"
  soLoiLienTiep = 0
  nguong = 3
  goi(ok: boolean): string {
    if (this.trangThai === "OPEN") return "chan_ngay"
    if (this.trangThai === "HALF_OPEN") {
      this.trangThai = ok ? "CLOSED" : "OPEN"
      this.soLoiLienTiep = 0
      return "goi_thu_nua_mo"
    }
    if (ok) this.soLoiLienTiep = 0
    else {
      this.soLoiLienTiep++
      if (this.soLoiLienTiep >= this.nguong) this.trangThai = "OPEN"
    }
    return "goi_that"
  }
}
const cb = new CB()
cb.goi(false)
cb.goi(false)
cb.goi(false)
console.log(cb.goi(true))`,
      question:
        'Gọi goi(false) đúng 3 lần liên tiếp (ngưỡng=3), rồi gọi goi(true) lần thứ 4. Kết quả in ra là gì?',
      choices: ['chan_ngay', 'goi_that', 'goi_thu_nua_mo', 'CLOSED'],
      answerIndex: 0,
      explain:
        'Kết quả là "chan_ngay". Ba lỗi liên tiếp đầu tiên đều CÒN ở trạng thái CLOSED lúc gọi (mỗi lần trả "goi_that"), và lần thứ 3 làm soLoiLienTiep chạm ngưỡng 3 nên chuyển trangThai sang OPEN NGAY SAU khi trả kết quả đó. Vì vậy lệnh gọi thứ 4 (goi(true)) rơi vào nhánh OPEN ngay từ đầu hàm, bị chặn trước khi kịp xét ketQuaGiaLap — trả về "chan_ngay" dù tham số truyền vào là true. Đây là bẫy hay nhầm: OPEN chặn TẤT CẢ cuộc gọi kế tiếp, không quan tâm cuộc gọi đó có "đáng lẽ" thành công hay không.',
    },
    parsons: {
      prompt: 'Xếp lại nhánh xử lý khi circuit breaker đang ở trạng thái CLOSED trong hàm goi().',
      lines: [
        'if (ketQuaGiaLap) {',
        '  this.soLoiLienTiep = 0',
        '} else {',
        '  this.soLoiLienTiep++',
        '  if (this.soLoiLienTiep >= this.nguong) {',
        '    this.trangThai = "OPEN"',
        '  }',
        '}',
        'return "goi_that"',
      ],
    },
    make: {
      prompt:
        'Viết class CircuitBreaker mô phỏng đúng máy trạng thái 3 trạng thái CLOSED/OPEN/HALF_OPEN như ví dụ mẫu.\n\n- constructor(nguong: number) — nguong là số lỗi LIÊN TIẾP để chuyển từ CLOSED sang OPEN.\n- goi(ketQuaGiaLap: boolean): string — trả về đúng MỘT trong ba chuỗi: "chan_ngay" (đang OPEN, không gọi thật), "goi_thu_nua_mo" (đang HALF_OPEN, thử một cuộc gọi), "goi_that" (đang CLOSED, gọi thật).\n  - Đang OPEN: luôn trả "chan_ngay", không đổi trạng thái.\n  - Đang HALF_OPEN: nếu ketQuaGiaLap=true thì chuyển CLOSED và reset soLoiLienTiep=0; nếu false thì chuyển OPEN và reset soLoiLienTiep=0. Luôn trả "goi_thu_nua_mo".\n  - Đang CLOSED: nếu ketQuaGiaLap=true thì reset soLoiLienTiep=0; nếu false thì tăng soLoiLienTiep, và nếu soLoiLienTiep >= nguong thì chuyển sang OPEN. Luôn trả "goi_that".\n- choPhepThuLai(): void — nếu đang OPEN thì chuyển sang HALF_OPEN (mô phỏng hết thời gian nghỉ).\n- layTrangThai(): string — trả về trạng thái hiện tại.',
      starterCode: `type TrangThai = "CLOSED" | "OPEN" | "HALF_OPEN"

class CircuitBreaker {
  private trangThai: TrangThai = "CLOSED"
  private soLoiLienTiep = 0
  private nguong: number

  constructor(nguong: number) {
    this.nguong = nguong
  }

  goi(ketQuaGiaLap: boolean): string {
    // TODO: cai dat dung 3 nhanh CLOSED / OPEN / HALF_OPEN nhu de bai
    return "goi_that"
  }

  choPhepThuLai(): void {
    // TODO: neu dang OPEN thi chuyen sang HALF_OPEN
  }

  layTrangThai(): TrangThai {
    return this.trangThai
  }
}

// ---- Đừng sửa phần dưới đây ----
const cb1 = new CircuitBreaker(3)
console.log("b1:", cb1.goi(false), cb1.goi(false), cb1.goi(false))
console.log("b1 sau nguong:", cb1.goi(true))
console.log("b1 trang thai:", cb1.layTrangThai())

const cb2 = new CircuitBreaker(2)
cb2.goi(false)
cb2.goi(false)
cb2.choPhepThuLai()
console.log("b2 thu lai that bai:", cb2.goi(false))
console.log("b2 trang thai:", cb2.layTrangThai())`,
      testCases: [
        {
          stdinLines: [],
          expected: 'b1: goi_that goi_that goi_that',
          match: 'contains',
          hidden: false,
          label: 'CLOSED: 3 lỗi liên tiếp vẫn "goi_that" cho tới khi vượt ngưỡng',
        },
        {
          stdinLines: [],
          expected: 'b1 sau nguong: chan_ngay',
          match: 'contains',
          hidden: false,
          label: 'Vượt ngưỡng 3 lỗi liên tiếp → chuyển OPEN, cuộc gọi kế bị chặn ngay',
        },
        {
          stdinLines: [],
          expected: 'b2 thu lai that bai: goi_thu_nua_mo',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: HALF_OPEN cho một cuộc gọi thử, thử thất bại → quay lại OPEN',
        },
        {
          stdinLines: [],
          expected: 'b2 trang thai: OPEN',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: sau lần thử HALF_OPEN thất bại, trạng thái phải là OPEN, không phải HALF_OPEN',
        },
      ],
      hints: [
        'Kiểm this.trangThai trước tiên: OPEN thì trả "chan_ngay" ngay, không đụng gì khác.',
        'HALF_OPEN: đổi trangThai theo ketQuaGiaLap (true→CLOSED, false→OPEN), reset soLoiLienTiep=0, rồi trả "goi_thu_nua_mo".',
        'CLOSED: false thì tăng soLoiLienTiep rồi so sánh với this.nguong bằng >= để quyết có chuyển OPEN không; true thì reset về 0. Luôn trả "goi_that" ở nhánh này.',
      ],
      sampleSolution: `type TrangThai = "CLOSED" | "OPEN" | "HALF_OPEN"

class CircuitBreaker {
  private trangThai: TrangThai = "CLOSED"
  private soLoiLienTiep = 0
  private nguong: number

  constructor(nguong: number) {
    this.nguong = nguong
  }

  goi(ketQuaGiaLap: boolean): string {
    if (this.trangThai === "OPEN") {
      return "chan_ngay"
    }
    if (this.trangThai === "HALF_OPEN") {
      if (ketQuaGiaLap) {
        this.trangThai = "CLOSED"
      } else {
        this.trangThai = "OPEN"
      }
      this.soLoiLienTiep = 0
      return "goi_thu_nua_mo"
    }
    if (ketQuaGiaLap) {
      this.soLoiLienTiep = 0
    } else {
      this.soLoiLienTiep++
      if (this.soLoiLienTiep >= this.nguong) {
        this.trangThai = "OPEN"
      }
    }
    return "goi_that"
  }

  choPhepThuLai(): void {
    if (this.trangThai === "OPEN") this.trangThai = "HALF_OPEN"
  }

  layTrangThai(): TrangThai {
    return this.trangThai
  }
}

// ---- Đừng sửa phần dưới đây ----
const cb1 = new CircuitBreaker(3)
console.log("b1:", cb1.goi(false), cb1.goi(false), cb1.goi(false))
console.log("b1 sau nguong:", cb1.goi(true))
console.log("b1 trang thai:", cb1.layTrangThai())

const cb2 = new CircuitBreaker(2)
cb2.goi(false)
cb2.goi(false)
cb2.choPhepThuLai()
console.log("b2 thu lai that bai:", cb2.goi(false))
console.log("b2 trang thai:", cb2.layTrangThai())`,
    },
    homework:
      'Tra cứu một thư viện circuit breaker thật trong ngôn ngữ bạn quen (vd "opossum" cho Node.js, "resilience4j" cho Java, "pybreaker" cho Python). Đọc phần cấu hình của nó: ngưỡng lỗi tính theo SỐ LƯỢNG liên tiếp hay theo TỈ LỆ LỖI trong một cửa sổ thời gian (vd "50% lỗi trong 10 giây gần nhất")? Viết 2-3 câu so sánh cách đó với bản "đếm lỗi liên tiếp" đơn giản trong bài — cách nào chịu được một lỗi ngẫu nhiên xen giữa các lần thành công tốt hơn?',
    srsCards: [
      {
        hoi: 'Circuit breaker có 3 trạng thái nào, và OPEN nghĩa là gì?',
        dap: 'CLOSED (bình thường, gọi thật) → OPEN (đang ngắt — chặn NGAY mọi cuộc gọi, không chạm tới dịch vụ hỏng nữa) → HALF_OPEN (thử một cuộc gọi sau khi nghỉ; thành công về CLOSED, thất bại quay lại OPEN).',
      },
      {
        hoi: 'Vì sao circuit breaker chuyển sang OPEN lại tốt hơn là cứ để mỗi cuộc gọi tự chờ timeout?',
        dap: 'Vì chặn ngay lập tức trả lỗi tức thì, không bắt người dùng/luồng xử lý chờ hết giờ timeout — tránh nghẽn hàng loạt lan từ một dịch vụ hỏng ra cả hệ thống.',
      },
      {
        hoi: 'Bulkhead khác circuit breaker ở điểm nào?',
        dap: 'Bulkhead giới hạn số lời gọi ĐỒNG THỜI cho từng dịch vụ phụ thuộc riêng biệt để một dịch vụ hỏng không ngốn hết tài nguyên chung; circuit breaker thì NGẮT hẳn việc gọi khi phát hiện dịch vụ đang lỗi liên tiếp.',
      },
      {
        hoi: '"Suy giảm có kiểm soát" (graceful degradation) là gì?',
        dap: 'Khi một phần phụ thuộc hỏng, trả về dữ liệu cũ/rút gọn (vd cache gần nhất, ẩn tính năng phụ) thay vì để cả trang/hệ thống sập — người dùng vẫn dùng được phần lõi.',
      },
    ],
  },
  {
    id: 'p6-u107-l2',
    unitId: 'p6-u107',
    language: 'typescript',
    title: 'SLO và ngân sách lỗi — bao nhiêu lỗi thì vẫn "đủ tốt", bao nhiêu thì vi phạm cam kết',
    hook: 'Sếp hỏi: "Hệ thống chạy ổn không?" Bạn trả lời "khá ổn, thỉnh thoảng có lỗi" — câu đó không nói lên được gì. Đội vận hành hệ thống thật không trả lời bằng cảm giác: họ có một CON SỐ chính xác — "còn được phép lỗi bao nhiêu request nữa trong tháng này trước khi vi phạm cam kết".',
    theory:
      'Ba khái niệm đi liền nhau:\n\n**SLI** (Service Level Indicator) = chỉ số ĐO ĐƯỢC THẬT, vd "tỉ lệ request trả về thành công".\n\n**SLO** (Service Level Objective) = MỤC TIÊU cam kết cho SLI đó trong một kỳ, vd "99.9% request phải thành công trong 30 ngày".\n\n**ERROR BUDGET** (ngân sách lỗi) = số lượng request được phép lỗi mà VẪN đạt SLO, tính bằng `(1 - SLO) × tổng số request`. Ví dụ số: 1.000.000 request/tháng, SLO = 99.9% (0.999) → ngân sách lỗi = (1 − 0.999) × 1.000.000 = 0.001 × 1.000.000 = 1.000 request được phép lỗi. Nếu tháng đó xảy ra 1.200 lỗi thật → VI PHẠM (vượt ngân sách 200 request); nếu chỉ 800 lỗi → vẫn AN TOÀN, còn dư 200 request trong ngân sách.\n\nÝ nghĩa thực tế: error budget không phải để "chấp nhận lỗi cho vui" — nó là RANH GIỚI quyết định. Còn ngân sách → đội có thể mạo hiểm triển khai tính năng mới, thử nghiệm. Ngân sách sắp cạn hoặc đã vi phạm → phải DỪNG lại, ưu tiên sửa độ tin cậy trước khi làm tính năng mới. Đây là cách biến "hệ thống có ổn không" từ một câu hỏi cảm tính thành một con số ai cũng tính ra giống nhau.\n\nBA TRỤ quan sát hệ thống (chỉ cần nắm khái niệm, không cài trong bài này) — mỗi trụ trả lời một câu hỏi khác nhau:\n\n- METRIC: con số theo thời gian (vd tỉ lệ lỗi mỗi phút) — trả lời "CÁI GÌ đang xảy ra, ở mức tổng quan".\n- LOG: dòng sự kiện chi tiết từng request — trả lời "CHUYỆN GÌ đã xảy ra ở một thời điểm cụ thể".\n- TRACE: đường đi của MỘT request xuyên qua nhiều dịch vụ — trả lời "request này CHẬM/LỖI Ở ĐÂU trong chuỗi gọi nhau".\n\nBa trụ chỉ thật sự hữu ích khi NỐI ĐƯỢC VỚI NHAU qua một ID CHUNG (thường gọi request id hoặc trace id) — sinh ra ngay từ request đầu vào, đi kèm suốt qua mọi dịch vụ, xuất hiện trong cả metric (gắn nhãn), log (ghi kèm mỗi dòng) lẫn trace. Nhờ ID chung đó, khi metric báo "tỉ lệ lỗi tăng vọt lúc 14h05", ta lọc log/trace theo đúng khoảng đó và ID liên quan để lần NGƯỢC từ TRIỆU CHỨNG (con số bất thường) về NGUYÊN NHÂN (dịch vụ nào, request nào, lỗi gì) — thay vì mò từng dòng log không có mối liên hệ.',
    workedExample: {
      code: `type KetQuaNganSach = {
  nganSachChoPhep: number
  daDung: number
  conLai: number
  viPham: boolean
}

function tinhNganSachLoi(tongRequest: number, slo: number, soLoiThucTe: number): KetQuaNganSach {
  // Ngan sach cho phep = lam tron XUONG cua tong request * (1 - slo)
  const nganSachChoPhep = Math.floor(tongRequest * (1 - slo))
  return {
    nganSachChoPhep,
    daDung: soLoiThucTe,
    conLai: nganSachChoPhep - soLoiThucTe,
    viPham: soLoiThucTe > nganSachChoPhep,
  }
}

// Kich ban 1: dung SLO 99.9%, 1 trieu request, 800 loi thuc te -> con du ngan sach
const ketQua1 = tinhNganSachLoi(1000000, 0.999, 800)
console.log("KB1:", ketQua1)

// Kich ban 2: cung SLO, nhung 1200 loi thuc te -> vi pham
const ketQua2 = tinhNganSachLoi(1000000, 0.999, 1200)
console.log("KB2:", ketQua2)`,
      stdinLines: [],
    },
    predict: {
      code: `function tinhNganSachLoi(tongRequest: number, slo: number, soLoiThucTe: number) {
  const nganSachChoPhep = Math.floor(tongRequest * (1 - slo))
  return {
    nganSachChoPhep,
    daDung: soLoiThucTe,
    conLai: nganSachChoPhep - soLoiThucTe,
    viPham: soLoiThucTe > nganSachChoPhep,
  }
}
const kq = tinhNganSachLoi(200000, 0.995, 1200)
console.log(kq.nganSachChoPhep, kq.viPham)`,
      question:
        'Với 200.000 request, SLO=99.5% (0.995), thực tế 1.200 lỗi — ngân sách cho phép là bao nhiêu và có vi phạm không?',
      choices: ['1000 true', '1000 false', '1200 false', '200 true'],
      answerIndex: 0,
      explain:
        'Ngân sách cho phép = Math.floor(200000 × (1 − 0.995)) = Math.floor(200000 × 0.005) = Math.floor(1000) = 1000. Thực tế 1.200 lỗi > 1.000 ngân sách → viPham = true. Đáp án "1000 true" đúng. Lưu ý phân biệt với lựa chọn sai "1200 false" — 1200 chính là soLoiThucTe (đầu vào), không phải nganSachChoPhep (kết quả tính ra) — dễ nhầm hai con số vì chúng gần nhau về ý nghĩa nhưng khác vai trò hoàn toàn.',
    },
    parsons: {
      prompt: 'Xếp lại phần tính toán bên trong hàm tinhNganSachLoi.',
      lines: [
        'const nganSachChoPhep = Math.floor(tongRequest * (1 - slo))',
        'return {',
        '  nganSachChoPhep,',
        '  daDung: soLoiThucTe,',
        '  conLai: nganSachChoPhep - soLoiThucTe,',
        '  viPham: soLoiThucTe > nganSachChoPhep,',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm tinhNganSachLoi(tongRequest: number, slo: number, soLoiThucTe: number) trả về object { nganSachChoPhep, daDung, conLai, viPham }.\n\n- nganSachChoPhep = Math.floor(tongRequest × (1 − slo)) — số lỗi tối đa được phép mà vẫn đạt SLO.\n- daDung = soLoiThucTe (nguyên văn, không tính lại).\n- conLai = nganSachChoPhep − soLoiThucTe (có thể ÂM nếu đã vượt ngân sách).\n- viPham = true khi soLoiThucTe > nganSachChoPhep, ngược lại false.\n\nViết thêm hàm inKetQua(nhan: string, tongRequest, slo, soLoiThucTe) gọi tinhNganSachLoi rồi in ra đúng định dạng: `nhan + ": " + JSON.stringify(ketQua)`.',
      starterCode: `type KetQuaNganSach = {
  nganSachChoPhep: number
  daDung: number
  conLai: number
  viPham: boolean
}

function tinhNganSachLoi(tongRequest: number, slo: number, soLoiThucTe: number): KetQuaNganSach {
  // TODO: tinh dung 4 truong nhu de bai
  return { nganSachChoPhep: 0, daDung: 0, conLai: 0, viPham: false }
}

function inKetQua(nhan: string, tongRequest: number, slo: number, soLoiThucTe: number): void {
  // TODO: goi tinhNganSachLoi roi in "nhan: {...}" bang JSON.stringify
}

// ---- Đừng sửa phần dưới đây ----
inKetQua("Thang 1 (an toan)", 1000000, 0.999, 800)
inKetQua("Thang 2 (vi pham)", 1000000, 0.999, 1200)
inKetQua("Dich vu nho", 5000, 0.99, 60)`,
      testCases: [
        {
          stdinLines: [],
          expected: '"nganSachChoPhep":1000,"daDung":800,"conLai":200,"viPham":false',
          match: 'contains',
          hidden: false,
          label: 'Kịch bản an toàn: 800 lỗi < 1000 ngân sách → viPham=false, còn dư 200',
        },
        {
          stdinLines: [],
          expected: '"nganSachChoPhep":1000,"daDung":1200,"conLai":-200,"viPham":true',
          match: 'contains',
          hidden: false,
          label: 'Kịch bản vi phạm: 1200 lỗi > 1000 ngân sách → viPham=true, conLai âm',
        },
        {
          stdinLines: [],
          expected: '"nganSachChoPhep":50,"daDung":60,"conLai":-10,"viPham":true',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: SLO 99% với 5000 request → ngân sách 50, 60 lỗi thực tế vượt ngưỡng',
        },
      ],
      hints: [
        'nganSachChoPhep phải dùng Math.floor để LÀM TRÒN XUỐNG — đừng để số thập phân lọt qua.',
        'conLai = nganSachChoPhep - soLoiThucTe — số này được phép ÂM khi đã vượt ngân sách, đừng chặn ở 0.',
        'inKetQua chỉ cần: const kq = tinhNganSachLoi(...) rồi console.log(`${nhan}: ${JSON.stringify(kq)}`).',
      ],
      sampleSolution: `type KetQuaNganSach = {
  nganSachChoPhep: number
  daDung: number
  conLai: number
  viPham: boolean
}

function tinhNganSachLoi(tongRequest: number, slo: number, soLoiThucTe: number): KetQuaNganSach {
  const nganSachChoPhep = Math.floor(tongRequest * (1 - slo))
  return {
    nganSachChoPhep,
    daDung: soLoiThucTe,
    conLai: nganSachChoPhep - soLoiThucTe,
    viPham: soLoiThucTe > nganSachChoPhep,
  }
}

function inKetQua(nhan: string, tongRequest: number, slo: number, soLoiThucTe: number): void {
  const kq = tinhNganSachLoi(tongRequest, slo, soLoiThucTe)
  console.log(\`\${nhan}: \${JSON.stringify(kq)}\`)
}

// ---- Đừng sửa phần dưới đây ----
inKetQua("Thang 1 (an toan)", 1000000, 0.999, 800)
inKetQua("Thang 2 (vi pham)", 1000000, 0.999, 1200)
inKetQua("Dich vu nho", 5000, 0.99, 60)`,
    },
    homework:
      'Chọn một dịch vụ trực tuyến bạn dùng hằng ngày (email, ngân hàng số, app gọi xe…) — thử tra "SLA" hoặc "uptime" công khai của nó (nhiều công ty công bố, vd "99.9% uptime"). Tính thử: nếu dịch vụ đó phục vụ 10 triệu request/tháng, ngân sách lỗi theo SLO đó là bao nhiêu request? Viết 2-3 câu: bạn nghĩ con số đó lớn hay nhỏ so với quy mô thật của dịch vụ, và vì sao chỉ tăng SLO thêm 0.09% (từ 99.9% lên 99.99%) lại được xem là một bước nhảy vọt về độ khó kỹ thuật.',
    srsCards: [
      {
        hoi: 'SLI, SLO, error budget khác nhau ở điểm nào?',
        dap: 'SLI là chỉ số ĐO ĐƯỢC THẬT (vd tỉ lệ thành công). SLO là MỤC TIÊU cam kết cho SLI đó trong một kỳ (vd 99.9%/30 ngày). Error budget là số lượng request được phép lỗi mà vẫn đạt SLO, tính bằng (1−SLO)×tổng request.',
      },
      {
        hoi: 'Vì sao error budget dùng Math.floor (làm tròn xuống) khi tính ngân sách cho phép?',
        dap: 'Vì số lỗi phải là số nguyên đếm được — làm tròn LÊN sẽ nới lỏng cam kết hơn mức SLO thật cho phép, nên phải làm tròn XUỐNG để giữ đúng ý nghĩa "không được vượt quá" của cam kết.',
      },
      {
        hoi: 'Ba trụ quan sát hệ thống (metric/log/trace) trả lời câu hỏi gì, và vì sao cần một ID chung để nối chúng?',
        dap: 'Metric cho biết CÁI GÌ đang xảy ra ở mức tổng quan, log cho biết CHUYỆN GÌ đã xảy ra chi tiết, trace cho biết một request CHẬM/LỖI Ở ĐÂU qua nhiều dịch vụ. Cần ID chung (request/trace id) đi kèm cả ba để lần từ triệu chứng (metric bất thường) ngược về nguyên nhân cụ thể (log/trace liên quan).',
      },
      {
        hoi: 'Error budget dùng để làm gì trong quyết định vận hành hằng ngày?',
        dap: 'Còn ngân sách → đội có thể mạo hiểm triển khai/thử nghiệm tính năng mới. Ngân sách sắp cạn hoặc đã vi phạm → phải dừng lại, ưu tiên sửa độ tin cậy trước khi làm tính năng mới.',
      },
    ],
  },
]
