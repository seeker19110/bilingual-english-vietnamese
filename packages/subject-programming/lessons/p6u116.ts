// lessons/p6u116.ts — P6-U116: HƯỚNG WEB, chặng S3 — hai gác cổng TRƯỚC KHI RELEASE
// (gộp `web-s3-m3` "Kiểm thử tự động" + `web-s3-m5` "Bảo mật web thực chiến").
//
// Cả hai module đều là "gác CHẤT LƯỢNG/AN TOÀN trước khi release": m3 hỏi "có TIN được bộ
// test không?" (kim tự tháp đúng tỉ lệ hay ngược đời), m5 hỏi "có ĐANG BỊ khai thác không?"
// (phân loại đúng lỗ hổng để vá đúng chỗ, chặn lạm dụng API bằng rate limit). U114 đã dạy
// đo HIỆU NĂNG bằng số — u116 dạy đo ĐỘ TIN CẬY và AN TOÀN cũng bằng số, không bằng cảm giác.
//
// Dùng làn `typescript`, mọi hàm thuần tất định (không mạng/CSDL thật).
// Mọi output đã chạy thật qua tsc --strict + node trước khi soạn (thư mục /tmp/webs3-u116,
// đã dọn sau khi soạn), không suy đoán.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U116_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u116-l1',
    unitId: 'p6-u116',
    language: 'typescript',
    title: 'Kim tự tháp test — nhiều unit, vừa integration, ít E2E (không phải ngược lại)',
    hook: 'Team viết được 200 test E2E (mở trình duyệt thật, click thật) nhưng chỉ 20 test unit. CI chạy 40 phút, và cứ đổi một dòng CSS không liên quan là vài test E2E đỏ ngẫu nhiên vì trang tải chậm nửa giây. Vấn đề không phải "test ít quá" — team có tới 220 test. Vấn đề là ĐẶT SAI TẦNG: quá nhiều test chậm và dễ vỡ, quá ít test nhanh và ổn định.',
    theory:
      'KIM TỰ THÁP TEST (test pyramid) chia bộ test thành ba tầng theo mức PHỤ THUỘC vào hệ thống thật, đáy rộng nhất, đỉnh hẹp nhất:\n\n- **UNIT (đáy, nhiều nhất)**: kiểm MỘT hàm/MỘT class, không chạm mạng/CSDL/trình duyệt thật. Chạy trong mili-giây, hỏng thì chỉ TRỎ ĐÚNG một chỗ.\n- **INTEGRATION (giữa, vừa phải)**: kiểm nhiều phần GHÉP với nhau (component gọi API giả lập, hàm gọi CSDL test) — chậm hơn unit nhưng vẫn không cần trình duyệt thật.\n- **E2E (đỉnh, ít nhất)**: mở TRÌNH DUYỆT THẬT, click qua LUỒNG CHÍNH như người dùng thật (đăng nhập → thêm giỏ hàng → thanh toán). Chậm nhất (giây, không phải mili-giây) và DỄ VỠ nhất — phụ thuộc mạng, thời gian tải, animation — vì nó chạm vào NHIỀU thành phần thật cùng lúc, một thành phần bất kỳ trục trặc là cả test đỏ dù logic không sai.\n\nKIM TỰ THÁP HỢP LỆ khi số lượng GIẢM DẦN đúng thứ tự từ đáy lên đỉnh: unit nhiều nhất, integration ở giữa, E2E ít nhất — và **phải CÓ ít nhất một E2E** (đỉnh không được rỗng, vì chỉ E2E mới xác nhận luồng chính THẬT SỰ chạy được từ đầu tới cuối, unit/integration không đủ để chứng minh điều đó).\n\nHai kiểu SAI hay gặp, cần phân biệt rõ vì cách sửa khác nhau:\n\n1. **"Ice cream cone" (nón kem, kim tự tháp NGƯỢC)**: E2E nhiều hơn unit — như ví dụ mở đầu. Cách sửa: đẩy phần lớn logic xuống unit test, chỉ giữ E2E cho các luồng chính thật sự cần xác nhận hết-đầu-cuối.\n2. **Thiếu đỉnh (không có E2E nào)**: dù unit/integration đầy đủ, không ai xác nhận luồng chính CHẠY ĐƯỢC thật khi ghép tất cả lại — một lỗi tích hợp (route sai, CSS đè mất nút bấm) có thể lọt qua hoàn toàn.\n\nVí dụ số: 50 unit / 15 integration / 5 E2E là kim tự tháp KHOẺ (50 > 15 > 5, và 5 > 0). Đảo lại 5 unit / 15 integration / 50 E2E là "ice cream cone" — chậm và dễ vỡ dù CÙNG một tổng 70 test.',
    workedExample: {
      code: `function kiemTraTiLeKimTuThap(
  soUnit: number, soIntegration: number, soE2e: number
): { hopLe: boolean; canhBao: string } {
  if (soE2e === 0) {
    return { hopLe: false, canhBao: "thieu-e2e: khong co test luong chinh, kim tu thap khong co dinh" }
  }
  if (soE2e > soUnit) {
    return { hopLe: false, canhBao: "nguoc-kim-tu-thap: E2E nhieu hon unit (ice cream cone anti-pattern)" }
  }
  if (!(soUnit > soIntegration && soIntegration > soE2e)) {
    return { hopLe: false, canhBao: "sai-thu-tu: so luong khong giam dan tu day len dinh" }
  }
  return { hopLe: true, canhBao: "hop-le: kim tu thap dung ti le" }
}

console.log(JSON.stringify(kiemTraTiLeKimTuThap(50, 15, 5)))  // hop le
console.log(JSON.stringify(kiemTraTiLeKimTuThap(5, 15, 50)))  // nguoc kim tu thap
console.log(JSON.stringify(kiemTraTiLeKimTuThap(50, 15, 0)))  // thieu dinh (E2E = 0)`,
      stdinLines: [],
    },
    predict: {
      code: `function kiemTraTiLeKimTuThap(
  soUnit: number, soIntegration: number, soE2e: number
): { hopLe: boolean; canhBao: string } {
  if (soE2e === 0) {
    return { hopLe: false, canhBao: "thieu-e2e" }
  }
  if (soE2e > soUnit) {
    return { hopLe: false, canhBao: "nguoc-kim-tu-thap" }
  }
  if (!(soUnit > soIntegration && soIntegration > soE2e)) {
    return { hopLe: false, canhBao: "sai-thu-tu" }
  }
  return { hopLe: true, canhBao: "hop-le" }
}

console.log(JSON.stringify(kiemTraTiLeKimTuThap(10, 10, 5)))`,
      question: 'soUnit = soIntegration = 10 (BẰNG NHAU, không phải unit nhiều hơn). hopLe là gì?',
      choices: ['true', 'false', 'undefined', 'lỗi runtime'],
      answerIndex: 1,
      explain:
        'Kết quả hopLe là false, canhBao là "sai-thu-tu". Điều kiện `soUnit > soIntegration` đòi hỏi LỚN HƠN THỰC SỰ, không phải "lớn hơn hoặc bằng" — hai tầng bằng nhau nghĩa là số lượng KHÔNG GIẢM DẦN đúng nghĩa từ đáy lên đỉnh, nên vẫn bị coi là sai thứ tự dù chưa tới mức "ngược kim tự tháp".',
    },
    parsons: {
      prompt:
        'Xếp lại các nhánh kiểm tra — nhớ kiểm "không có E2E" TRƯỚC "E2E nhiều hơn unit", vì hai ca đó cần cảnh báo KHÁC nhau.',
      lines: [
        'if (soE2e === 0) {',
        '  return { hopLe: false, canhBao: "thieu-e2e: khong co test luong chinh" }',
        '}',
        'if (soE2e > soUnit) {',
        '  return { hopLe: false, canhBao: "nguoc-kim-tu-thap: E2E nhieu hon unit" }',
        '}',
        'if (!(soUnit > soIntegration && soIntegration > soE2e)) {',
        '  return { hopLe: false, canhBao: "sai-thu-tu" }',
        '}',
        'return { hopLe: true, canhBao: "hop-le" }',
      ],
    },
    make: {
      prompt:
        'Viết hàm kiemTraNhieuKimTuThap(danhSach) chấm một loạt kim tự tháp test cùng lúc.\n\n- Dùng lại đúng luật của kiemTraTiLeKimTuThap(soUnit, soIntegration, soE2e) ở ví dụ mẫu (viết lại cả hàm, ba nhánh cảnh báo + ca hợp lệ, đúng thứ tự kiểm: thiếu E2E trước, ngược kim tự tháp sau, sai thứ tự sau cùng).\n- danhSach là mảng các bộ ba [soUnit, soIntegration, soE2e] (kiểu [number, number, number][]).\n- Với mỗi bộ ba, gọi kiemTraTiLeKimTuThap rồi đẩy CHỈ RIÊNG trường canhBao (string) vào mảng trả về, giữ đúng thứ tự.',
      starterCode: `function kiemTraTiLeKimTuThap(
  soUnit: number, soIntegration: number, soE2e: number
): { hopLe: boolean; canhBao: string } {
  // TODO: soE2e===0 -> "thieu-e2e"; soE2e>soUnit -> "nguoc-kim-tu-thap";
  // khong (soUnit>soIntegration && soIntegration>soE2e) -> "sai-thu-tu"; con lai -> hopLe:true, "hop-le"
  return { hopLe: false, canhBao: "" }
}

function kiemTraNhieuKimTuThap(danhSach: [number, number, number][]): string[] {
  // TODO: voi moi bo ba, goi kiemTraTiLeKimTuThap va lay truong canhBao, gom theo dung thu tu
  return []
}

// ---- Đừng sửa phần dưới đây ----
const DU_LIEU: [number, number, number][] = [
  [50, 15, 5],
  [5, 15, 50],
  [50, 15, 0],
  [10, 10, 5],
]
console.log(JSON.stringify(kiemTraNhieuKimTuThap(DU_LIEU)))`,
      testCases: [
        {
          stdinLines: [],
          expected: '["hop-le","nguoc-kim-tu-thap","thieu-e2e","sai-thu-tu"]',
          match: 'contains',
          hidden: false,
          label: 'Bốn ca: hợp lệ, ngược kim tự tháp, thiếu E2E, hai tầng bằng nhau (sai thứ tự)',
        },
        {
          stdinLines: [],
          expected: 'thieu-e2e',
          match: 'contains',
          hidden: false,
          label: 'Ca soE2e = 0 phải là "thieu-e2e", KHÔNG lẫn với "nguoc-kim-tu-thap"',
        },
        {
          stdinLines: [],
          expected: '["hop-le","nguoc-kim-tu-thap","thieu-e2e","sai-thu-tu"]',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: kiểm cả mảng đầy đủ khớp thứ tự — không hardcode một phần tử riêng lẻ',
        },
      ],
      hints: [
        'Thứ tự kiểm BẮT BUỘC: soE2e === 0 trước tiên (thiếu đỉnh) — nếu kiểm "soE2e > soUnit" trước, ca soE2e=0 vẫn lọt qua vì 0 không lớn hơn soUnit, rồi rớt nhầm xuống nhánh "sai-thu-tu".',
        'Điều kiện hợp lệ dùng > (lớn hơn THỰC SỰ), không phải >=: soUnit > soIntegration && soIntegration > soE2e.',
        'kiemTraNhieuKimTuThap: dùng vòng lặp, mỗi phần tử là const [soUnit, soIntegration, soE2e] = bo, rồi push kiemTraTiLeKimTuThap(...).canhBao.',
      ],
      sampleSolution: `function kiemTraTiLeKimTuThap(
  soUnit: number, soIntegration: number, soE2e: number
): { hopLe: boolean; canhBao: string } {
  if (soE2e === 0) {
    return { hopLe: false, canhBao: "thieu-e2e" }
  }
  if (soE2e > soUnit) {
    return { hopLe: false, canhBao: "nguoc-kim-tu-thap" }
  }
  if (!(soUnit > soIntegration && soIntegration > soE2e)) {
    return { hopLe: false, canhBao: "sai-thu-tu" }
  }
  return { hopLe: true, canhBao: "hop-le" }
}

function kiemTraNhieuKimTuThap(danhSach: [number, number, number][]): string[] {
  const ketQua: string[] = []
  for (const [soUnit, soIntegration, soE2e] of danhSach) {
    ketQua.push(kiemTraTiLeKimTuThap(soUnit, soIntegration, soE2e).canhBao)
  }
  return ketQua
}

// ---- Đừng sửa phần dưới đây ----
const DU_LIEU: [number, number, number][] = [
  [50, 15, 5],
  [5, 15, 50],
  [50, 15, 0],
  [10, 10, 5],
]
console.log(JSON.stringify(kiemTraNhieuKimTuThap(DU_LIEU)))`,
    },
    homework:
      'Mở một dự án bạn đang có test (kể cả dự án nhỏ), đếm số lượng test unit/integration/E2E thật (thư mục test hoặc file cấu hình CI). Tính tỉ lệ theo hàm vừa học — kim tự tháp của bạn hợp lệ hay đang là "ice cream cone"? Nếu thiếu hẳn một tầng, tầng nào và vì sao bạn nghĩ nó bị bỏ qua (khó viết hơn, chậm chạy hơn, hay đơn giản là quên)?',
    srsCards: [
      {
        hoi: 'Ba tầng của kim tự tháp test là gì, xếp từ đáy lên đỉnh?',
        dap: 'Unit (đáy, nhiều nhất, không chạm hệ thống thật) → Integration (giữa, vừa phải, ghép nhiều phần) → E2E (đỉnh, ít nhất, trình duyệt thật theo luồng chính).',
      },
      {
        hoi: 'Vì sao E2E phải là tầng ÍT test nhất, không phải nhiều nhất?',
        dap: 'E2E chạm nhiều thành phần thật cùng lúc (mạng, tải trang, animation) nên CHẬM và DỄ VỠ nhất — một thành phần bất kỳ trục trặc là test đỏ dù logic không sai. Đẩy phần lớn logic xuống unit (nhanh, ổn định) rồi chỉ giữ E2E cho luồng chính thật sự cần xác nhận đầu-cuối.',
      },
      {
        hoi: 'Hai kiểu kim tự tháp KHÔNG hợp lệ khác nhau ở đâu: "ice cream cone" và "thiếu đỉnh"?',
        dap: '"Ice cream cone": E2E NHIỀU hơn unit — chậm, dễ vỡ. "Thiếu đỉnh": soE2e = 0, dù unit/integration đủ vẫn không ai xác nhận luồng chính chạy được thật từ đầu tới cuối.',
      },
    ],
  },
  {
    id: 'p6-u116-l2',
    unitId: 'p6-u116',
    language: 'typescript',
    title: 'Phân loại lỗ hổng theo triệu chứng, và chặn lạm dụng bằng giới hạn tốc độ gọi',
    hook: 'Báo cáo bug ghi: "trang bị hack". Ba chữ đó không nói lên được gì để SỬA. Kẻ tấn công có thể đang chèn script lạ vào trang (XSS), lừa trình duyệt bạn gọi API thay mặt bạn (CSRF), hoặc ép server của bạn gọi tới một URL nội bộ đáng lẽ không ai gọi được (SSRF) — ba lỗ hổng khác hẳn nhau, ba cách vá khác hẳn nhau. Và dù vá hết, một API "kiểm mã giảm giá" không giới hạn tốc độ gọi vẫn có thể bị dò hàng nghìn lần/giây tới khi trúng.',
    theory:
      'PHÂN LOẠI LỖ HỔNG theo TRIỆU CHỨNG (dấu hiệu quan sát được, không phải tên kỹ thuật) giúp vá đúng chỗ:\n\n- **XSS (Cross-Site Scripting)**: kẻ tấn công CHÈN ĐƯỢC SCRIPT LẠ vào trang mà trình duyệt của NẠN NHÂN chạy — ví dụ bình luận chứa `<script>` không được lọc, hiện lên và chạy khi người khác xem trang. Vá bằng: escape/sanitize mọi dữ liệu người dùng trước khi chèn vào HTML, Content Security Policy (CSP) chặn script không rõ nguồn.\n- **CSRF (Cross-Site Request Forgery)**: trang ĐỘC HẠI KHÁC âm thầm khiến trình duyệt của nạn nhân GỬI MỘT YÊU CẦU tới API của bạn, THAY MẶT NẠN NHÂN (dùng đúng cookie phiên đăng nhập của họ) — ví dụ nạn nhân đang đăng nhập ngân hàng, mở một trang lạ có form ẩn tự submit "chuyển khoản". Vá bằng: CSRF token, cookie SameSite.\n- **SSRF (Server-Side Request Forgery)**: kẻ tấn công khiến CHÍNH SERVER của bạn gọi tới một URL DO HỌ ĐƯA VÀO — ví dụ tính năng "tải ảnh từ URL" cho phép nhập `http://169.254.169.254/...` (địa chỉ nội bộ cloud) để server tự lộ thông tin nhạy cảm nội bộ. Vá bằng: chặn danh sách địa chỉ nội bộ, xác thực URL đầu vào nghiêm ngặt.\n\nBa dấu hiệu này KHÔNG loại trừ nhau tuyệt đối trên đời thật (một hệ thống có thể dính cả ba lỗ hổng khác nhau), nhưng khi PHÂN LOẠI MỘT BÁO CÁO CỤ THỂ, ưu tiên theo thứ tự **XSS > CSRF > SSRF** — vì XSS chạm trực tiếp tới TRÌNH DUYỆT của nạn nhân (script chạy ngay khi họ mở trang, tác động tức thì và rộng nhất tới người dùng cuối) nên cần xử lý gấp nhất khi một báo cáo có dấu hiệu mập mờ giữa nhiều loại.\n\nGIỚI HẠN TỐC ĐỘ GỌI (rate limit) chặn một dạng lạm dụng khác: không phải "chèn được gì lạ", mà là GỌI QUÁ NHIỀU LẦN một API hợp lệ — dò mã giảm giá, brute-force mật khẩu, hoặc đơn giản là tốn tiền gọi AI/CSDL của bạn. Thuật toán CỬA SỔ TRƯỢT (sliding window) đơn giản: lấy mốc thời gian gọi CUỐI CÙNG, đếm xem có BAO NHIÊU lần gọi nằm trong 60 giây gần nhất TÍNH TỪ mốc đó lùi lại — nếu số đếm đó VƯỢT QUÁ ngưỡng cho phép mỗi phút, coi là vượt giới hạn.',
    workedExample: {
      code: `function phanLoaiLoHong(
  coChenScriptLaVaoTrang: boolean, coGoiApiThayMatNguoiDung: boolean, coDeServerGoiUrlNguoiDungDua: boolean
): "XSS" | "CSRF" | "SSRF" | "khong-xac-dinh" {
  if (coChenScriptLaVaoTrang) return "XSS"
  if (coGoiApiThayMatNguoiDung) return "CSRF"
  if (coDeServerGoiUrlNguoiDungDua) return "SSRF"
  return "khong-xac-dinh"
}

console.log(phanLoaiLoHong(true, false, false))   // XSS
console.log(phanLoaiLoHong(false, true, false))   // CSRF
console.log(phanLoaiLoHong(false, false, true))   // SSRF

function coVuotGioiHan(danhSachThoiDiemGoi: number[], gioiHanMoiPhut: number): boolean {
  if (danhSachThoiDiemGoi.length === 0) return false
  const cuoi = danhSachThoiDiemGoi[danhSachThoiDiemGoi.length - 1]
  let dem = 0
  for (const t of danhSachThoiDiemGoi) {
    if (t > cuoi - 60) dem++
  }
  return dem > gioiHanMoiPhut
}

console.log(coVuotGioiHan([0, 10, 20, 30, 40, 50], 5))  // 6 lan trong 60s, vuot nguong 5 -> true
console.log(coVuotGioiHan([0, 70, 80, 90], 2))          // 3 lan trong 60s gan nhat, vuot nguong 2 -> true`,
      stdinLines: [],
    },
    predict: {
      code: `function coVuotGioiHan(danhSachThoiDiemGoi: number[], gioiHanMoiPhut: number): boolean {
  if (danhSachThoiDiemGoi.length === 0) return false
  const cuoi = danhSachThoiDiemGoi[danhSachThoiDiemGoi.length - 1]
  let dem = 0
  for (const t of danhSachThoiDiemGoi) {
    if (t > cuoi - 60) dem++
  }
  return dem > gioiHanMoiPhut
}

console.log(coVuotGioiHan([0, 60], 1))`,
      question:
        'Hai lần gọi ở giây 0 và giây 60 — CÁCH NHAU ĐÚNG 60 GIÂY. gioiHanMoiPhut = 1. Kết quả là gì?',
      choices: ['true', 'false', 'undefined', 'lỗi runtime'],
      answerIndex: 1,
      explain:
        'Kết quả là false. cuoi = 60, cuoi - 60 = 0. Điều kiện đếm là `t > cuoi - 60` (LỚN HƠN THỰC SỰ, không phải >=): lần gọi tại giây 0 có 0 > 0 là false nên KHÔNG được đếm, chỉ lần gọi giây 60 được đếm → dem = 1. Rồi 1 > gioiHanMoiPhut (1) cũng false. Đây là bẫy hay gặp: hai lần gọi cách nhau ĐÚNG 60 giây không bị coi là "trong cùng cửa sổ 60 giây" vì biên dưới là mở (loại trừ), không phải đóng.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm coVuotGioiHan — nhớ lấy mốc CUỐI CÙNG trước, rồi mới đếm các mốc nằm trong 60 giây gần nhất.',
      lines: [
        'function coVuotGioiHan(danhSachThoiDiemGoi, gioiHanMoiPhut) {',
        '  if (danhSachThoiDiemGoi.length === 0) return false',
        '  const cuoi = danhSachThoiDiemGoi[danhSachThoiDiemGoi.length - 1]',
        '  let dem = 0',
        '  for (const t of danhSachThoiDiemGoi) {',
        '    if (t > cuoi - 60) dem++',
        '  }',
        '  return dem > gioiHanMoiPhut',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm kiemTraNhieuNguoiDung(danhSachNguoiDung, gioiHanMoiPhut) kiểm nhiều người dùng cùng lúc.\n\n- Dùng lại đúng luật của coVuotGioiHan(danhSachThoiDiemGoi, gioiHanMoiPhut) ở ví dụ mẫu (viết lại cả hàm — nhớ mảng rỗng trả về false ngay, và điều kiện đếm dùng > chứ không phải >=).\n- danhSachNguoiDung là mảng, mỗi phần tử là mảng thời điểm gọi (giây) CỦA MỘT NGƯỜI (kiểu number[][]).\n- Với mỗi người, gọi coVuotGioiHan(dsThoiDiem, gioiHanMoiPhut) rồi đẩy kết quả (boolean) vào mảng trả về, giữ đúng thứ tự người dùng.',
      starterCode: `function coVuotGioiHan(danhSachThoiDiemGoi: number[], gioiHanMoiPhut: number): boolean {
  // TODO: mang rong -> false; cuoi = phan tu cuoi; dem so phan tu t sao cho t > cuoi - 60;
  // tra ve dem > gioiHanMoiPhut
  return false
}

function kiemTraNhieuNguoiDung(danhSachNguoiDung: number[][], gioiHanMoiPhut: number): boolean[] {
  // TODO: voi moi mang thoi diem cua tung nguoi, goi coVuotGioiHan va gom ket qua theo dung thu tu
  return []
}

// ---- Đừng sửa phần dưới đây ----
const NGUOI_DUNG: number[][] = [
  [0, 10, 20, 30, 40, 50],
  [0, 70, 80, 90],
  [],
]
console.log(JSON.stringify(kiemTraNhieuNguoiDung(NGUOI_DUNG, 5)))
console.log(JSON.stringify(kiemTraNhieuNguoiDung(NGUOI_DUNG, 2)))`,
      testCases: [
        {
          stdinLines: [],
          expected: '[true,false,false]',
          match: 'contains',
          hidden: false,
          label:
            'Ngưỡng 5/phút: người 1 gọi 6 lần trong 60s → vượt; người 2 gọi 3 lần → chưa vượt; người 3 không gọi → không vượt',
        },
        {
          stdinLines: [],
          expected: 'false',
          match: 'contains',
          hidden: false,
          label: 'Người dùng không có lần gọi nào (mảng rỗng) phải là false, không phải lỗi',
        },
        {
          stdinLines: [],
          expected: '[true,true,false]',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: ngưỡng 2/phút — người 2 (3 lần trong 60s) giờ cũng vượt',
        },
      ],
      hints: [
        'coVuotGioiHan: mảng rỗng trả về false NGAY (không có phần tử cuối để lấy mốc) — thiếu dòng này sẽ lỗi runtime khi đọc phần tử cuối của mảng rỗng.',
        'Cửa sổ 60 giây tính LÙI TỪ MỐC CUỐI CÙNG: `cuoi - 60`, đếm phần tử `t` thoả `t > cuoi - 60` (dùng > , không phải >=).',
        'kiemTraNhieuNguoiDung: dùng vòng lặp, mỗi phần tử là một mảng thời điểm của MỘT người — gọi coVuotGioiHan(dsThoiDiem, gioiHanMoiPhut) rồi push kết quả boolean.',
      ],
      sampleSolution: `function coVuotGioiHan(danhSachThoiDiemGoi: number[], gioiHanMoiPhut: number): boolean {
  if (danhSachThoiDiemGoi.length === 0) return false
  const cuoi = danhSachThoiDiemGoi[danhSachThoiDiemGoi.length - 1]
  let dem = 0
  for (const t of danhSachThoiDiemGoi) {
    if (t > cuoi - 60) dem++
  }
  return dem > gioiHanMoiPhut
}

function kiemTraNhieuNguoiDung(danhSachNguoiDung: number[][], gioiHanMoiPhut: number): boolean[] {
  const ketQua: boolean[] = []
  for (const dsThoiDiem of danhSachNguoiDung) {
    ketQua.push(coVuotGioiHan(dsThoiDiem, gioiHanMoiPhut))
  }
  return ketQua
}

// ---- Đừng sửa phần dưới đây ----
const NGUOI_DUNG: number[][] = [
  [0, 10, 20, 30, 40, 50],
  [0, 70, 80, 90],
  [],
]
console.log(JSON.stringify(kiemTraNhieuNguoiDung(NGUOI_DUNG, 5)))
console.log(JSON.stringify(kiemTraNhieuNguoiDung(NGUOI_DUNG, 2)))`,
    },
    homework:
      'Chọn một API bạn từng viết hoặc dùng (kiểm mã giảm giá, đăng nhập, gửi OTP...). Nó có giới hạn tốc độ gọi không? Nếu không, dùng hàm coVuotGioiHan vừa học, ước lượng: với ngưỡng bạn tự chọn (vd 5 lần/phút), kẻ tấn công dò 1000 mã trong 10 phút có bị chặn giữa chừng không? Viết ra ngưỡng bạn sẽ đặt và lý do.',
    srsCards: [
      {
        hoi: 'XSS, CSRF, SSRF khác nhau ở AI/CÁI GÌ bị lợi dụng để tấn công?',
        dap: 'XSS: script lạ chạy trên TRÌNH DUYỆT nạn nhân. CSRF: trình duyệt nạn nhân bị lừa GỬI YÊU CẦU thay mặt họ (dùng cookie phiên có sẵn). SSRF: chính SERVER của bạn bị ép gọi tới URL do kẻ tấn công đưa vào.',
      },
      {
        hoi: 'Khi một báo cáo mập mờ giữa nhiều loại lỗ hổng, ưu tiên phân loại theo thứ tự nào và vì sao?',
        dap: 'XSS > CSRF > SSRF — vì XSS chạm trực tiếp và tức thì nhất tới trình duyệt của NGƯỜI DÙNG CUỐI, nên cần xử lý gấp nhất trong ba loại.',
      },
      {
        hoi: 'Thuật toán cửa sổ trượt (sliding window) kiểm rate limit làm theo mấy bước, là những bước nào?',
        dap: 'Lấy mốc thời gian gọi CUỐI CÙNG; đếm số lần gọi nằm trong 60 giây gần nhất TÍNH LÙI TỪ mốc đó (điều kiện là > , không phải >=); so đếm đó với ngưỡng cho phép mỗi phút.',
      },
    ],
  },
]
