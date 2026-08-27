// lessons/p6u63.ts — P6-U63: HƯỚNG BACKEND, chặng S1 — lỗi & log (`backend-s1-m3`) và
// vòng đời tiến trình (`backend-s1-m4`).
//
// Mã unit thuộc dải `p6-u61…p6-u93` dành cho S1 của 11 hướng còn lại — xem
// `docs/specs/2026-08-27-dai-ma-unit-s1-cac-huong-con-lai.md`.
//
// Hai bài này là phần "vận hành" của chặng, và cố ý đặt cuối: học viên chỉ thấy chúng đáng
// giá sau khi đã có một dịch vụ chạy được ở hai unit trước. l1 PHÂN LOẠI LỖI + LOG (thứ quyết
// định bạn có lần ra được sự cố lúc 3 giờ sáng không), l2 TẮT ÊM (thứ quyết định mỗi lần
// triển khai có làm rớt yêu cầu của người dùng không).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U63_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u63-l1',
    unitId: 'p6-u63',
    language: 'typescript',
    title: 'Ba nhóm lỗi và log lần ra được — đừng đánh thức người trực vì lỗi gõ sai',
    hook: 'Ba giờ sáng, điện thoại đội trực réo: "tỉ lệ lỗi 8%". Họ dậy, mở log, thấy 4.000 dòng `Error: invalid email`. Không ai hỏng gì cả — chỉ là người dùng gõ sai email, chuyện xảy ra suốt ngày. Nhưng lẫn trong 4.000 dòng đó có 3 dòng cơ sở dữ liệu mất kết nối, và không ai tìm ra chúng.',
    theory:
      'Log không phải để "ghi lại cho có". Log là thứ duy nhất bạn có lúc sự cố, khi không debug được và không tái hiện được. Nó phải trả lời hai câu: **chuyện gì hỏng** và **ai phải sửa**.\n\n**BA NHÓM LỖI, và ranh giới giữa chúng quyết định ai bị đánh thức:**\n\n· **Lỗi người dùng** — họ nhập sai, gửi thiếu trường, hết hạn phiên. Xảy ra suốt ngày, hoàn toàn bình thường. Ghi ở mức `info` hoặc `warn`. **Không bao giờ báo động.**\n· **Lỗi phụ thuộc** — cơ sở dữ liệu quá tải, dịch vụ bên thứ ba hết giờ chờ, mạng chập. Không phải code bạn sai, nhưng là sự cố thật. Mức `error`, có báo động khi vượt ngưỡng, và thường xử lý bằng thử lại có giới hạn.\n· **Lỗi trong code** — `undefined is not a function`, chia cho 0, một nhánh bạn tưởng không bao giờ chạy tới. Mức `error`, báo động ngay, và mỗi cái là một bug phải sửa.\n\nTrộn ba nhóm này vào một mức là hỏng cả hệ thống cảnh báo: hoặc bạn tắt báo động vì quá ồn, hoặc bạn bỏ sót sự cố thật. Cả hai kết cục đều đã xảy ra ở dự án thật.\n\n**LOG CÓ CẤU TRÚC.** Một dòng chữ tự do (`"loi khi tao don cho user 123"`) chỉ người đọc được. Một dòng JSON (`{"muc":"error","nhom":"phuThuoc","maYeuCau":"abc","endpoint":"/don"}`) thì MÁY lọc và gộp được — và lúc sự cố bạn cần đếm, nhóm, lọc chứ không cần đọc.\n\n**MÃ YÊU CẦU XUYÊN SUỐT.** Sinh một mã duy nhất ở cửa vào, gắn vào MỌI dòng log của yêu cầu đó, và trả nó về cho client trong header. Khi người dùng báo lỗi kèm mã đó, bạn dựng lại được toàn bộ đường đi của họ bằng một câu truy vấn. Không có nó thì bạn đang mò trong hàng triệu dòng.\n\n**KHÔNG BAO GIỜ LOG: mật khẩu, token, số thẻ, và thông tin định danh cá nhân.** Lý do không phải là "sợ hacker đọc log server": nhật ký được sao chép, gửi sang dịch vụ giám sát, giữ hàng tháng và nhiều người xem được. Một token lọt vào log là một token đã lộ. Cách làm đúng là **danh sách trường nhạy cảm bị che ngay tại hàm ghi log**, chứ không phải trông vào việc mỗi người tự nhớ — vì sẽ có người quên.',
    workedExample: {
      code: `// Bộ ghi log tí hon: phân nhóm lỗi, gắn mã yêu cầu, và CHE trường nhạy cảm.
type Nhom = "nguoiDung" | "phuThuoc" | "trongCode"

// Che tại HÀM GHI, không trông vào việc mỗi người gọi tự nhớ.
const TRUONG_NHAY_CAM = ["matKhau", "token", "soThe"]

function ghiLog(maYeuCau: string, nhom: Nhom, thongDiep: string, kem: Record<string, unknown>) {
  const sach: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(kem)) {
    sach[k] = TRUONG_NHAY_CAM.includes(k) ? "***" : v
  }
  // Lỗi người dùng KHÔNG phải sự cố — mức thấp hơn để không đánh thức ai.
  const muc = nhom === "nguoiDung" ? "warn" : "error"
  return JSON.stringify({ muc, nhom, maYeuCau, thongDiep, ...sach })
}

console.log(ghiLog("yc-1", "nguoiDung", "email khong hop le", { email: "abc" }))
console.log(ghiLog("yc-2", "phuThuoc", "het gio cho CSDL", { msCho: 5000 }))
console.log(ghiLog("yc-3", "trongCode", "khong doc duoc truong", { token: "bi-mat-that" }))
// Dòng cuối: giá trị token bị thay bằng *** dù người gọi vô tình truyền nó vào.`,
      stdinLines: [],
    },
    predict: {
      code: `// Cách gộp mọi lỗi vào một mức — thứ làm hỏng hệ thống cảnh báo.
const suKien = [
  { nhom: "nguoiDung", so: 4000 },
  { nhom: "phuThuoc", so: 3 },
  { nhom: "trongCode", so: 1 },
]

// Đội trực đặt ngưỡng: báo động khi số dòng mức "error" vượt 100.
const soError = suKien.reduce((t, s) => t + s.so, 0)
console.log("So dong error: " + soError + " | bao dong? " + (soError > 100))`,
      question: 'Bảng cảnh báo hiển thị gì?',
      choices: [
        'So dong error: 4004 | bao dong? true',
        'So dong error: 4 | bao dong? false',
        'So dong error: 3 | bao dong? false',
        'So dong error: 4000 | bao dong? true',
      ],
      answerIndex: 0,
      explain:
        'Vì mọi nhóm bị gộp vào cùng mức "error", tổng là 4004 và báo động nổ. Nhưng 4000 dòng trong đó là người dùng gõ sai email — chuyện bình thường. Đội trực bị đánh thức vì một thứ không ai cần sửa, và sau vài đêm như thế họ sẽ tắt báo động. Khi tắt rồi thì 3 dòng "phuThuoc" và 1 dòng "trongCode" — những thứ thật sự là sự cố — cũng không ai thấy. Đó là lý do ranh giới ba nhóm lỗi quan trọng hơn bản thân việc ghi log.',
    },
    parsons: {
      prompt: 'Xếp lại hàm ghi log — chú ý việc che trường nhạy cảm phải xảy ra TRƯỚC khi ghi.',
      lines: [
        'function ghiLog(maYeuCau: string, nhom: Nhom, thongDiep: string, kem: Record<string, unknown>) {',
        '  const sach: Record<string, unknown> = {}',
        '  for (const [k, v] of Object.entries(kem)) {',
        '    sach[k] = TRUONG_NHAY_CAM.includes(k) ? "***" : v',
        '  }',
        '  const muc = nhom === "nguoiDung" ? "warn" : "error"',
        '  return JSON.stringify({ muc, nhom, maYeuCau, thongDiep, ...sach })',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm ghiLog(maYeuCau, nhom, thongDiep, kem) trả về MỘT CHUỖI JSON của một dòng log có cấu trúc.\n\nBa luật:\n  ① Mức log suy từ nhóm: "nguoiDung" → "warn"; "phuThuoc" và "trongCode" → "error". Lỗi người dùng KHÔNG được đánh thức ai.\n  ② Mọi trường trong `kem` có tên nằm trong TRUONG_NHAY_CAM (matKhau, token, soThe, cmnd) phải bị thay giá trị bằng chuỗi "***". Che tại hàm này, không trông vào người gọi.\n  ③ Thứ tự khoá trong JSON: muc, nhom, maYeuCau, thongDiep, rồi tới các trường của `kem` theo đúng thứ tự chúng xuất hiện.\n\nBốn dòng in ở cuối đã viết sẵn, đừng sửa — chúng chính là bốn ca chấm.',
      starterCode: `type Nhom = "nguoiDung" | "phuThuoc" | "trongCode"
const TRUONG_NHAY_CAM = ["matKhau", "token", "soThe", "cmnd"]

function ghiLog(
  maYeuCau: string,
  nhom: Nhom,
  thongDiep: string,
  kem: Record<string, unknown>,
): string {
  // TODO: che trường nhạy cảm, suy mức từ nhóm, trả JSON
  return ""
}

// ---- Đừng sửa phần dưới đây ----
console.log("Nguoi dung: " + ghiLog("yc-1", "nguoiDung", "email sai", { email: "abc" }))
console.log("Phu thuoc: " + ghiLog("yc-2", "phuThuoc", "het gio cho", { msCho: 5000 }))
console.log("Che: " + ghiLog("yc-3", "trongCode", "loi la", { token: "abc", soThe: "4111" }))
console.log("Tron: " + ghiLog("yc-4", "nguoiDung", "sai mk", { email: "a@b.c", matKhau: "123" }))`,
      testCases: [
        {
          stdinLines: [],
          expected:
            'Nguoi dung: {"muc":"warn","nhom":"nguoiDung","maYeuCau":"yc-1","thongDiep":"email sai","email":"abc"}',
          match: 'contains',
          hidden: false,
          label: 'Lỗi người dùng ghi mức warn — không đánh thức đội trực',
        },
        {
          stdinLines: [],
          expected:
            'Phu thuoc: {"muc":"error","nhom":"phuThuoc","maYeuCau":"yc-2","thongDiep":"het gio cho","msCho":5000}',
          match: 'contains',
          hidden: false,
          label: 'Lỗi phụ thuộc là sự cố thật — mức error',
        },
        {
          stdinLines: [],
          expected:
            'Che: {"muc":"error","nhom":"trongCode","maYeuCau":"yc-3","thongDiep":"loi la","token":"***","soThe":"***"}',
          match: 'contains',
          hidden: false,
          label: 'Trường nhạy cảm bị che ngay tại hàm ghi',
        },
        {
          stdinLines: [],
          expected:
            'Tron: {"muc":"warn","nhom":"nguoiDung","maYeuCau":"yc-4","thongDiep":"sai mk","email":"a@b.c","matKhau":"***"}',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — trộn trường thường và trường nhạy cảm, chỉ che đúng cái cần che',
        },
      ],
      hints: [
        'Duyệt `Object.entries(kem)` để dựng một object mới, thay giá trị bằng "***" khi tên khoá nằm trong TRUONG_NHAY_CAM. Đừng sửa `kem` tại chỗ.',
        'Mức log: chỉ "nguoiDung" mới là "warn", hai nhóm còn lại đều "error".',
        'Thứ tự khoá trong JSON.stringify theo thứ tự bạn đặt vào object, nên viết `{ muc, nhom, maYeuCau, thongDiep, ...sach }` là đúng thứ tự đề yêu cầu.',
        'Khung tham chiếu:\n\nconst sach: Record<string, unknown> = {}\nfor (const [k, v] of Object.entries(kem)) sach[k] = TRUONG_NHAY_CAM.includes(k) ? "***" : v\nreturn JSON.stringify({ muc, nhom, maYeuCau, thongDiep, ...sach })',
      ],
      sampleSolution: `type Nhom = "nguoiDung" | "phuThuoc" | "trongCode"
const TRUONG_NHAY_CAM = ["matKhau", "token", "soThe", "cmnd"]

function ghiLog(
  maYeuCau: string,
  nhom: Nhom,
  thongDiep: string,
  kem: Record<string, unknown>,
): string {
  // ② Che tại HÀM GHI. Trông vào việc mỗi người gọi tự nhớ thì sẽ có người quên,
  //    và một token lọt vào log là một token đã lộ.
  const sach: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(kem)) {
    sach[k] = TRUONG_NHAY_CAM.includes(k) ? "***" : v
  }

  // ① Lỗi người dùng xảy ra suốt ngày và không ai phải sửa — đừng để nó
  //    lẫn vào mức error, nếu không đội trực sẽ tắt báo động.
  const muc = nhom === "nguoiDung" ? "warn" : "error"

  // ③ JSON giữ thứ tự khoá theo thứ tự đặt vào.
  return JSON.stringify({ muc, nhom, maYeuCau, thongDiep, ...sach })
}

// ---- Đừng sửa phần dưới đây ----
console.log("Nguoi dung: " + ghiLog("yc-1", "nguoiDung", "email sai", { email: "abc" }))
console.log("Phu thuoc: " + ghiLog("yc-2", "phuThuoc", "het gio cho", { msCho: 5000 }))
console.log("Che: " + ghiLog("yc-3", "trongCode", "loi la", { token: "abc", soThe: "4111" }))
console.log("Tron: " + ghiLog("yc-4", "nguoiDung", "sai mk", { email: "a@b.c", matKhau: "123" }))`,
    },
    homework:
      'Lấy 200 dòng log gần nhất của một dịch vụ bạn đang chạy và tự phân loại tay từng dòng vào ba nhóm. Đếm tỉ lệ. Nếu nhóm "người dùng" chiếm phần lớn mà đang nằm ở mức error thì bạn vừa tìm ra lý do đội trực không tin bảng cảnh báo nữa. Sau đó thử tìm trong log xem có mật khẩu, token hay số điện thoại nào lọt vào không — nếu có, thêm danh sách che ngay tại hàm ghi log chứ đừng đi sửa từng chỗ gọi.',
    srsCards: [
      {
        hoi: 'Ba nhóm lỗi của một dịch vụ, và mức log tương ứng?',
        dap: 'Lỗi người dùng (warn, không báo động) · lỗi phụ thuộc (error, báo động theo ngưỡng) · lỗi trong code (error, báo động ngay, mỗi cái là một bug).',
      },
      {
        hoi: 'Hậu quả của việc gộp lỗi người dùng vào mức error?',
        dap: 'Cảnh báo nổ vì chuyện bình thường, đội trực mất niềm tin rồi tắt báo động — và khi đó sự cố thật cũng không ai thấy.',
      },
      {
        hoi: 'Mã yêu cầu xuyên suốt dùng để làm gì?',
        dap: 'Gắn vào mọi dòng log của cùng một yêu cầu và trả về cho client. Người dùng báo lỗi kèm mã đó là bạn dựng lại được toàn bộ đường đi bằng một câu truy vấn.',
      },
      {
        hoi: 'Vì sao che dữ liệu nhạy cảm phải làm tại HÀM GHI LOG?',
        dap: 'Vì trông vào việc mỗi người gọi tự nhớ thì sẽ có người quên. Log được sao chép, gửi đi và giữ lâu, nên một token lọt vào log là một token đã lộ.',
      },
    ],
  },
  {
    id: 'p6-u63-l2',
    unitId: 'p6-u63',
    language: 'typescript',
    title: 'Tắt êm — mỗi lần triển khai không được làm rớt yêu cầu nào',
    hook: 'Bạn deploy bản mới lúc 10 giờ sáng. Ba giây sau, 40 người dùng nhận lỗi mạng: đơn hàng của họ đang xử lý dở thì tiến trình bị giết. Log không ghi gì cả — tiến trình chết trước khi kịp ghi. Bản mới chạy tốt, bản cũ cũng chạy tốt; thứ hỏng là KHOẢNG GIỮA hai bản, và không ai từng viết một dòng code nào cho khoảng đó.',
    theory:
      'Mỗi lần triển khai là một lần giết tiến trình đang phục vụ người thật. Hệ điều hành (hoặc bộ điều phối container) gửi tín hiệu `SIGTERM`, chờ một khoảng ân hạn, rồi `SIGKILL` — cái sau không thương lượng được. Việc của bạn là dùng cho hết khoảng ân hạn đó cho tử tế.\n\n**BỐN BƯỚC CỦA TẮT ÊM, và thứ tự là phần quan trọng nhất:**\n\n① **Ngừng nhận việc MỚI, nhưng chưa đóng cửa.** Đánh dấu tiến trình là "đang tắt" và cho `/health/ready` trả về không-sẵn-sàng. Bộ cân bằng tải thấy vậy sẽ ngừng gửi yêu cầu mới tới đây.\n② **CHỜ các yêu cầu ĐANG CHẠY xong.** Đây là lý do tồn tại của cả cơ chế. Yêu cầu dở dang bị cắt giữa chừng có thể đã ghi nửa vời — client nhận lỗi trong khi việc đã làm một phần.\n③ **Đóng phụ thuộc theo thứ tự NGƯỢC lúc mở.** Đóng kết nối cơ sở dữ liệu trước khi các yêu cầu xong là tự bắn vào chân mình.\n④ **Có trần thời gian.** Nếu sau N giây vẫn còn việc chưa xong thì thoát luôn, vì `SIGKILL` sắp tới rồi và chết dở còn tệ hơn chết gọn.\n\n**HAI LOẠI KIỂM TRA SỨC KHOẺ, và lẫn chúng là một lỗi kinh điển:**\n\n· **Liveness** — "tiến trình còn sống không?" Hỏng thì bộ điều phối KHỞI ĐỘNG LẠI nó. Phải cực đơn giản, KHÔNG được hỏi cơ sở dữ liệu. Nếu liveness kiểm cả CSDL thì lúc CSDL chậm, toàn bộ tiến trình sẽ bị khởi động lại hàng loạt — biến một sự cố nhỏ thành sập toàn hệ.\n· **Readiness** — "sẵn sàng NHẬN VIỆC chưa?" Hỏng thì bộ cân bằng tải chỉ NGỪNG GỬI, không giết. Cái này mới được phép kiểm phụ thuộc bắt buộc, và cũng chính là cái phải trả "không" ngay ở bước ① của tắt êm.\n\nCâu hỏi để nhớ ranh giới: *"nếu cái này hỏng, khởi động lại tiến trình có giúp gì không?"* Có → liveness. Không → readiness.\n\n**Một điểm hay bị bỏ sót:** giữa lúc `/health/ready` trả "không" và lúc bộ cân bằng tải thật sự ngừng gửi có một độ trễ (thường vài giây, bằng chu kỳ nó hỏi). Nên bước ① phải CHỜ thêm khoảng đó trước khi sang bước ②, nếu không vẫn rớt vài yêu cầu cuối. Đây đúng loại chi tiết chỉ lộ ra khi chạy thật.',
    workedExample: {
      code: `// Vòng đời tiến trình, mô phỏng bằng máy trạng thái để nhìn thấy thứ tự.
type Trang = "chay" | "dangTat" | "daThoat"

class TienTrinh {
  trang: Trang = "chay"
  private dangChay = 0
  nhatKy: string[] = []

  nhanYeuCau(): boolean {
    // Đang tắt thì TỪ CHỐI việc mới — nhưng việc cũ vẫn chạy tiếp.
    if (this.trang !== "chay") return false
    this.dangChay += 1
    return true
  }

  xongMotYeuCau() {
    if (this.dangChay > 0) this.dangChay -= 1
  }

  // Readiness: được phép nói "không" ngay khi bắt đầu tắt.
  sanSang(): boolean {
    return this.trang === "chay"
  }

  // Liveness: chỉ hỏi "còn sống không". KHÔNG hỏi CSDL, KHÔNG phụ thuộc trạng thái tắt —
  // vì trả "chết" lúc đang tắt êm sẽ khiến bộ điều phối giết ngay, đúng thứ ta đang tránh.
  conSong(): boolean {
    return this.trang !== "daThoat"
  }

  nhanSigterm() {
    this.trang = "dangTat"
    this.nhatKy.push("1-ngung-nhan-viec-moi")
    this.nhatKy.push("2-cho-" + this.dangChay + "-yeu-cau-dang-chay")
    this.nhatKy.push("3-dong-ket-noi-csdl")
    this.trang = "daThoat"
    this.nhatKy.push("4-thoat")
  }
}

const p = new TienTrinh()
p.nhanYeuCau()
p.nhanYeuCau()
p.xongMotYeuCau()
p.nhanSigterm()
console.log("Nhat ky: " + p.nhatKy.join(" > "))
console.log("Sau SIGTERM nhan viec moi? " + p.nhanYeuCau())`,
      stdinLines: [],
    },
    predict: {
      code: `// Liveness kiểm CẢ cơ sở dữ liệu — cách biến một sự cố nhỏ thành sập toàn hệ.
let csdlOk = false // CSDL vừa chậm/mất kết nối trong 30 giây

function liveness(): boolean {
  return csdlOk // sai: hỏi cả phụ thuộc
}

// Bộ điều phối: liveness hỏng thì KHỞI ĐỘNG LẠI tiến trình.
const soInstance = 12
const soBiGiet = liveness() ? 0 : soInstance
console.log("So instance bi khoi dong lai: " + soBiGiet)`,
      question: 'Khi cơ sở dữ liệu chậm 30 giây, chuyện gì xảy ra?',
      choices: [
        'So instance bi khoi dong lai: 12',
        'So instance bi khoi dong lai: 0',
        'So instance bi khoi dong lai: 3',
        'So instance bi khoi dong lai: 6',
      ],
      answerIndex: 0,
      explain:
        'Liveness hỏi cả cơ sở dữ liệu, nên khi CSDL chậm thì MỌI instance đều báo "chết" cùng lúc và bị khởi động lại đồng loạt. Tệ hơn: chúng khởi động lại rồi cùng lúc đổ vào CSDL đang yếu để mở kết nối mới, làm nó sập hẳn. Một sự cố nhỏ tự nhân lên thành sự cố toàn hệ. Câu hỏi phân biệt là: "nếu cái này hỏng, khởi động lại tiến trình có giúp gì không?" — CSDL chậm thì khởi động lại chẳng giúp gì, nên nó thuộc readiness chứ không phải liveness.',
    },
    parsons: {
      prompt: 'Xếp lại quy trình tắt êm — thứ tự bốn bước là toàn bộ nội dung của bài.',
      lines: [
        'nhanSigterm() {',
        '  this.trang = "dangTat"',
        '  this.nhatKy.push("1-ngung-nhan-viec-moi")',
        '  this.nhatKy.push("2-cho-" + this.dangChay + "-yeu-cau-dang-chay")',
        '  this.nhatKy.push("3-dong-ket-noi-csdl")',
        '  this.trang = "daThoat"',
        '  this.nhatKy.push("4-thoat")',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết lớp TienTrinh mô phỏng vòng đời một dịch vụ, đủ bốn bước tắt êm.\n\nPhương thức cần có:\n  · `nhanYeuCau()` → true nếu nhận, false nếu đang tắt. Nhận thì tăng số việc đang chạy.\n  · `xongMotYeuCau()` → giảm số việc đang chạy, không cho xuống dưới 0.\n  · `sanSang()` (readiness) → chỉ true khi còn ở trạng thái "chay".\n  · `conSong()` (liveness) → true tới tận khi đã thoát hẳn. KHÔNG được trả false lúc đang tắt êm, vì như thế bộ điều phối sẽ giết ngay giữa chừng.\n  · `nhanSigterm()` → ghi vào `nhatKy` đúng bốn dòng theo thứ tự: "1-ngung-nhan-viec-moi", "2-cho-<N>-yeu-cau-dang-chay" (N là số việc đang chạy lúc nhận tín hiệu), "3-dong-ket-noi-csdl", "4-thoat"; rồi chuyển trạng thái sang đã thoát.\n\nBốn dòng in ở cuối đã viết sẵn, đừng sửa — chúng chính là bốn ca chấm.',
      starterCode: `type Trang = "chay" | "dangTat" | "daThoat"

class TienTrinh {
  trang: Trang = "chay"
  nhatKy: string[] = []

  nhanYeuCau(): boolean {
    return false // TODO
  }
  xongMotYeuCau(): void {
    // TODO
  }
  sanSang(): boolean {
    return false // TODO
  }
  conSong(): boolean {
    return false // TODO
  }
  nhanSigterm(): void {
    // TODO
  }
}

// ---- Đừng sửa phần dưới đây ----
const p = new TienTrinh()
p.nhanYeuCau()
p.nhanYeuCau()
p.nhanYeuCau()
p.xongMotYeuCau()
console.log("Truoc SIGTERM: sanSang=" + p.sanSang() + " conSong=" + p.conSong())
p.nhanSigterm()
console.log("Nhat ky: " + p.nhatKy.join(" > "))
console.log("Sau SIGTERM: nhanViecMoi=" + p.nhanYeuCau() + " sanSang=" + p.sanSang())
console.log("Da thoat: conSong=" + p.conSong())`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Truoc SIGTERM: sanSang=true conSong=true',
          match: 'contains',
          hidden: false,
          label: 'Lúc chạy bình thường thì cả hai kiểm tra đều xanh',
        },
        {
          stdinLines: [],
          expected:
            'Nhat ky: 1-ngung-nhan-viec-moi > 2-cho-2-yeu-cau-dang-chay > 3-dong-ket-noi-csdl > 4-thoat',
          match: 'contains',
          hidden: false,
          label: 'Đủ bốn bước, đúng thứ tự, và đếm đúng 2 yêu cầu còn dở',
        },
        {
          stdinLines: [],
          expected: 'Sau SIGTERM: nhanViecMoi=false sanSang=false',
          match: 'contains',
          hidden: false,
          label: 'Đang tắt thì từ chối việc mới và readiness báo không sẵn sàng',
        },
        {
          stdinLines: [],
          expected: 'Da thoat: conSong=false',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — liveness chỉ false SAU KHI đã thoát hẳn, không phải lúc đang tắt êm',
        },
      ],
      hints: [
        'Giữ một biến đếm private cho số yêu cầu đang chạy. `nhanYeuCau` chỉ tăng khi trạng thái còn là "chay".',
        'Điểm dễ sai: `conSong()` phải là `this.trang !== "daThoat"`, KHÔNG phải `=== "chay"`. Trả false lúc đang tắt êm là tự xin bộ điều phối giết mình giữa chừng.',
        'Trong `nhanSigterm`, đọc số việc đang chạy TRƯỚC khi làm gì khác, vì dòng nhật ký thứ hai cần đúng con số tại thời điểm nhận tín hiệu.',
        'Khung tham chiếu cho nhật ký:\n\nthis.nhatKy.push("2-cho-" + this.dangChay + "-yeu-cau-dang-chay")',
      ],
      sampleSolution: `type Trang = "chay" | "dangTat" | "daThoat"

class TienTrinh {
  trang: Trang = "chay"
  nhatKy: string[] = []
  private dangChay = 0

  nhanYeuCau(): boolean {
    // ① Đang tắt thì từ chối việc MỚI — việc cũ vẫn được chạy nốt.
    if (this.trang !== "chay") return false
    this.dangChay += 1
    return true
  }

  xongMotYeuCau(): void {
    if (this.dangChay > 0) this.dangChay -= 1
  }

  // Readiness: "sẵn sàng nhận việc chưa". Hỏng thì bộ cân bằng tải NGỪNG GỬI, không giết.
  sanSang(): boolean {
    return this.trang === "chay"
  }

  // Liveness: "còn sống không". Hỏng thì bộ điều phối KHỞI ĐỘNG LẠI — nên trong lúc
  // tắt êm vẫn phải trả true, nếu không nó giết đúng lúc ta đang chờ việc dở xong.
  conSong(): boolean {
    return this.trang !== "daThoat"
  }

  nhanSigterm(): void {
    const conDo = this.dangChay // đọc TRƯỚC khi đổi gì
    this.trang = "dangTat"
    this.nhatKy.push("1-ngung-nhan-viec-moi")
    this.nhatKy.push("2-cho-" + conDo + "-yeu-cau-dang-chay")
    // ③ Đóng phụ thuộc theo thứ tự NGƯỢC lúc mở, và chỉ sau khi việc dở đã xong.
    this.nhatKy.push("3-dong-ket-noi-csdl")
    this.trang = "daThoat"
    this.nhatKy.push("4-thoat")
  }
}

// ---- Đừng sửa phần dưới đây ----
const p = new TienTrinh()
p.nhanYeuCau()
p.nhanYeuCau()
p.nhanYeuCau()
p.xongMotYeuCau()
console.log("Truoc SIGTERM: sanSang=" + p.sanSang() + " conSong=" + p.conSong())
p.nhanSigterm()
console.log("Nhat ky: " + p.nhatKy.join(" > "))
console.log("Sau SIGTERM: nhanViecMoi=" + p.nhanYeuCau() + " sanSang=" + p.sanSang())
console.log("Da thoat: conSong=" + p.conSong())`,
    },
    homework:
      'Trên dịch vụ của bạn, gửi `SIGTERM` bằng tay (`kill -TERM <pid>`) trong lúc đang có một yêu cầu chậm chạy dở, và xem yêu cầu đó có hoàn tất không. Nếu client nhận lỗi mạng thì bạn vừa tái hiện được đúng thứ xảy ra mỗi lần deploy. Sau đó thêm bộ xử lý `SIGTERM` theo bốn bước và thử lại. Cuối cùng, đọc lại hai endpoint sức khoẻ của bạn và tự hỏi từng cái: "nếu cái này hỏng, khởi động lại tiến trình có giúp gì không?" — câu trả lời quyết định nó là liveness hay readiness.',
    srsCards: [
      {
        hoi: 'Bốn bước của tắt êm, đúng thứ tự?',
        dap: '① ngừng nhận việc mới (readiness báo không sẵn sàng) ② chờ việc đang chạy xong ③ đóng phụ thuộc theo thứ tự ngược lúc mở ④ có trần thời gian rồi thoát.',
      },
      {
        hoi: 'Liveness khác readiness ở hậu quả nào?',
        dap: 'Liveness hỏng → bộ điều phối KHỞI ĐỘNG LẠI tiến trình. Readiness hỏng → bộ cân bằng tải chỉ NGỪNG GỬI việc, không giết.',
      },
      {
        hoi: 'Vì sao liveness KHÔNG được kiểm cơ sở dữ liệu?',
        dap: 'CSDL chậm sẽ làm mọi instance cùng báo chết và bị khởi động lại đồng loạt, rồi cùng lúc đổ vào CSDL đang yếu — một sự cố nhỏ thành sập toàn hệ.',
      },
      {
        hoi: 'Câu hỏi để phân biệt liveness với readiness?',
        dap: '"Nếu cái này hỏng, khởi động lại tiến trình có giúp gì không?" Có → liveness. Không → readiness.',
      },
    ],
  },
]
