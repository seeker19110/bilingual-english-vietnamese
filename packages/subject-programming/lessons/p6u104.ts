// lessons/p6u104.ts — P6-U104: HƯỚNG BACKEND, chặng S2 — module cuối cùng
// (`backend-s2-m3` "Hàng đợi và việc nền" + `backend-s2-m4` "Đồng thời trong ngôn ngữ").
//
// Hai bài: bài 1 dạy at-least-once + idempotent + dead letter queue (hàng đợi việc nền);
// bài 2 dạy race condition bằng cách CHỨNG MINH kết quả sai qua một kịch bản xen kẽ viết tay
// (tất định, không Promise/async thật — môn này chấm trong node:vm đồng bộ, không có event
// loop), rồi sửa bằng thao tác nguyên tử; theory nhắc ngắn deadlock + backpressure.
//
// Dùng làn `typescript`: cổng `lessonsTs.test.ts` chạy tsc thật nên code mẫu không thể trôi.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U104_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u104-l1',
    unitId: 'p6-u104',
    language: 'typescript',
    title: 'Hàng đợi việc nền: vì sao một việc có thể được giao HAI LẦN',
    hook: 'Hệ thống gửi email xác nhận đơn hàng qua hàng đợi. Consumer xử lý xong, gửi email thành công — nhưng đúng lúc chuẩn bị báo "đã xong" cho hàng đợi thì tiến trình bị crash. Hàng đợi không nhận được xác nhận nên coi như việc CHƯA XONG, giao lại cho consumer khác. Khách nhận được hai email giống hệt nhau.',
    theory:
      'Hàng đợi (queue) là nơi một tiến trình PRODUCER (vd: server nhận đơn hàng) bỏ việc vào, và một hoặc nhiều tiến trình CONSUMER (vd: worker nền) lấy việc ra xử lý. Tách rời hai bên như vậy giúp server trả lời khách ngay (không phải chờ gửi email xong mới trả response), và có thể chạy nhiều consumer song song khi việc dồn lại.\n\nHầu hết hàng đợi thật (SQS, RabbitMQ, Redis queue...) chỉ đảm bảo AT-LEAST-ONCE (giao ÍT NHẤT một lần), KHÔNG đảm bảo đúng-một-lần. Lý do rất thực tế: hàng đợi chỉ xoá việc khỏi danh sách SAU KHI nhận được xác nhận "đã xong" từ consumer. Nếu consumer xử lý xong nhưng crash TRƯỚC khi gửi xác nhận, hàng đợi không biết việc đã hoàn tất — nó buộc phải giao lại cho consumer khác (hoặc chính consumer đó sau khi khởi động lại), coi như an toàn hơn là bỏ sót việc. Retry (thử lại khi lỗi mạng, timeout) cũng gây trùng y hệt vậy.\n\nHệ quả bắt buộc: xử lý việc trong consumer PHẢI IDEMPOTENT — nghĩa là chạy LẠI cùng một việc nhiều lần vẫn cho ra đúng kết quả như chạy MỘT lần, không cộng dồn, không lặp tác dụng phụ. Cách làm phổ biến nhất: lưu lại ID của những việc đã xử lý xong (trong CSDL hoặc một Set/bảng "đã xử lý"), và trước khi làm việc mới thì kiểm ID đó đã có chưa — có rồi thì bỏ qua, coi như đã xong.\n\nMức độ nghiêm trọng khi KHÔNG idempotent rất khác nhau tuỳ việc: gửi email xác nhận đơn hàng hai lần thì phiền nhưng không hỏng dữ liệu gì. Còn TRỪ TIỀN tài khoản hai lần cho cùng một đơn hàng là BUG TIỀN BẠC THẬT — khách bị trừ oan, và đây mới là lý do thật sự khiến idempotent trở thành yêu cầu bắt buộc chứ không phải "làm cho chắc".\n\nMột việc có thể LIÊN TỤC THẤT BẠI (vd dữ liệu sai định dạng, service phụ thuộc luôn lỗi) — nếu cứ retry vô hạn thì nó chiếm tài nguyên consumer mãi mãi và không ai biết. DEAD LETTER QUEUE (DLQ) giải quyết việc này: mỗi việc có một bộ đếm số lần thất bại; thất bại quá một NGƯỠNG N cố định thì việc bị CHUYỂN SANG một hàng đợi riêng (DLQ) để người vận hành xem xét thủ công, KHÔNG thử lại nữa — tránh vòng lặp thất bại vô ích và giữ lại bằng chứng để điều tra.',
    workedExample: {
      code: `type Viec = { id: string; noiDung: string }

// Mô phỏng xử lý idempotent: đãXuLyRoi ghi nhớ ID những việc đã làm xong.
// Việc đã có trong đó thì BỎ QUA, không làm lại — dù hàng đợi giao lại bao nhiêu lần.
function xuLyViec(viec: Viec, daXuLyRoi: Set<string>): string {
  if (daXuLyRoi.has(viec.id)) {
    return \`BO QUA (da xu ly roi): \${viec.id}\`
  }
  daXuLyRoi.add(viec.id) // đánh dấu đã xong TRƯỚC khi trả kết quả
  return \`Da xu ly: \${viec.id} - \${viec.noiDung}\`
}

const daXuLyRoi = new Set<string>()
const viec1: Viec = { id: 'don-001', noiDung: 'Gui email xac nhan don hang' }

// Hàng đợi giao việc lần 1 — xử lý bình thường.
console.log(xuLyViec(viec1, daXuLyRoi))
// Consumer crash sau khi xử lý xong nhưng trước khi báo "đã xong" -> hàng đợi giao LẠI y hệt.
console.log(xuLyViec(viec1, daXuLyRoi))
console.log('So email thuc su da gui: 1 (lan 2 bi chan boi idempotent)')`,
      stdinLines: [],
    },
    predict: {
      code: `type Viec = { id: string; noiDung: string }

function xuLyViec(viec: Viec, daXuLyRoi: Set<string>): string {
  if (daXuLyRoi.has(viec.id)) return \`BO QUA: \${viec.id}\`
  daXuLyRoi.add(viec.id)
  return \`Da xu ly: \${viec.id}\`
}

const daXuLyRoi = new Set<string>()
const v: Viec = { id: 'don-9', noiDung: 'x' }
xuLyViec(v, daXuLyRoi)
xuLyViec(v, daXuLyRoi)
console.log(xuLyViec(v, daXuLyRoi))`,
      question: 'Cùng một việc "don-9" được giao xử lý BA lần liên tiếp. Lần thứ ba in ra gì?',
      choices: ['BO QUA: don-9', 'Da xu ly: don-9', 'BO QUA: don-8', 'Loi: da ton tai'],
      answerIndex: 0,
      explain:
        'Lần 1 xử lý xong và thêm "don-9" vào daXuLyRoi. Lần 2 thấy đã có trong Set nên bỏ qua (Set không đổi thêm gì). Lần 3 vẫn thấy "don-9" đã có trong Set từ lần 1 nên tiếp tục bỏ qua — kết quả in ra "BO QUA: don-9". Đây chính là idempotent: dù giao lại bao nhiêu lần, việc chỉ thật sự được XỬ LÝ đúng một lần duy nhất.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm xử lý idempotent — kiểm ID đã xử lý TRƯỚC, đánh dấu đã xong TRƯỚC khi trả kết quả.',
      lines: [
        'function xuLyViec(viec: Viec, daXuLyRoi: Set<string>): string {',
        '  if (daXuLyRoi.has(viec.id)) {',
        '    return `BO QUA: ${viec.id}`',
        '  }',
        '  daXuLyRoi.add(viec.id)',
        '  return `Da xu ly: ${viec.id}`',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hai hàm mô phỏng hàng đợi việc nền có dead letter queue:\n\n1. `xuLyIdempotent(viecId, daXuLyRoi)`: nếu viecId đã có trong daXuLyRoi (Set<string>) → trả "BO_QUA". Chưa có → thêm viecId vào daXuLyRoi rồi trả "DA_XU_LY".\n\n2. `theoDoiThatBai(viecId, soLanThatBai: Map<string, number>, NGUONG: number)`: gọi khi một việc THẤT BẠI — tăng số lần thất bại của viecId lên 1 (nếu chưa có thì coi như đang từ 0). Nếu số lần thất bại SAU KHI TĂNG đạt hoặc vượt NGUONG → trả "CHUYEN_DLQ" (chuyển sang dead letter queue, không thử lại nữa). Chưa đạt ngưỡng → trả "THU_LAI" (còn thử lại được).\n\nSau đó dùng đúng starter code có sẵn (đừng sửa phần dưới) để chạy các kịch bản.',
      starterCode: `function xuLyIdempotent(viecId: string, daXuLyRoi: Set<string>): string {
  // TODO: đã xử lý rồi thì trả "BO_QUA", chưa thì đánh dấu và trả "DA_XU_LY"
  return "BO_QUA"
}

function theoDoiThatBai(viecId: string, soLanThatBai: Map<string, number>, NGUONG: number): string {
  // TODO: tăng số lần thất bại của viecId lên 1, đạt/vượt NGUONG thì trả "CHUYEN_DLQ", chưa thì "THU_LAI"
  return "THU_LAI"
}

// ---- Đừng sửa phần dưới đây ----
const daXuLyRoi = new Set<string>()
console.log("Lan 1:", xuLyIdempotent("don-A", daXuLyRoi))
console.log("Lan 2 (giao lai):", xuLyIdempotent("don-A", daXuLyRoi))
console.log("Viec khac:", xuLyIdempotent("don-B", daXuLyRoi))

const soLanThatBai = new Map<string, number>()
const NGUONG = 3
console.log("That bai 1:", theoDoiThatBai("viec-X", soLanThatBai, NGUONG))
console.log("That bai 2:", theoDoiThatBai("viec-X", soLanThatBai, NGUONG))
console.log("That bai 3:", theoDoiThatBai("viec-X", soLanThatBai, NGUONG))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Lan 1: DA_XU_LY',
          match: 'contains',
          hidden: false,
          label: 'Việc mới, chưa có trong daXuLyRoi → xử lý thật',
        },
        {
          stdinLines: [],
          expected: 'Lan 2 (giao lai): BO_QUA',
          match: 'contains',
          hidden: false,
          label: 'Hàng đợi giao lại cùng ID → bị chặn, không xử lý lần hai',
        },
        {
          stdinLines: [],
          expected: 'Viec khac: DA_XU_LY',
          match: 'contains',
          hidden: false,
          label: 'ID khác (don-B) không bị ảnh hưởng bởi don-A đã xử lý',
        },
        {
          stdinLines: [],
          expected: 'That bai 1: THU_LAI',
          match: 'contains',
          hidden: false,
          label: 'Thất bại lần 1/3, chưa đạt ngưỡng → còn thử lại',
        },
        {
          stdinLines: [],
          expected: 'That bai 2: THU_LAI',
          match: 'contains',
          hidden: false,
          label: 'Thất bại lần 2/3, vẫn chưa đạt ngưỡng',
        },
        {
          stdinLines: [],
          expected: 'That bai 3: CHUYEN_DLQ',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: thất bại lần 3/3, ĐẠT ngưỡng → chuyển dead letter queue, không thử lại nữa',
        },
      ],
      hints: [
        'xuLyIdempotent: dùng daXuLyRoi.has(viecId) để kiểm TRƯỚC — có rồi thì trả "BO_QUA" ngay, chưa có thì .add(viecId) rồi mới trả "DA_XU_LY".',
        'theoDoiThatBai: lấy số lần cũ bằng soLanThatBai.get(viecId) ?? 0, cộng 1, rồi soLanThatBai.set(viecId, soMoi) để lưu lại — đừng quên set lại vào Map, không chỉ tính trong biến tạm.',
        'So sánh soMoi >= NGUONG (không phải >) để trả "CHUYEN_DLQ" — đúng lần thất bại thứ NGUONG là lần chuyển DLQ, không phải lần thứ NGUONG+1.',
      ],
      sampleSolution: `function xuLyIdempotent(viecId: string, daXuLyRoi: Set<string>): string {
  if (daXuLyRoi.has(viecId)) {
    return "BO_QUA"
  }
  daXuLyRoi.add(viecId)
  return "DA_XU_LY"
}

function theoDoiThatBai(viecId: string, soLanThatBai: Map<string, number>, NGUONG: number): string {
  const soCu = soLanThatBai.get(viecId) ?? 0
  const soMoi = soCu + 1
  soLanThatBai.set(viecId, soMoi)
  if (soMoi >= NGUONG) {
    return "CHUYEN_DLQ"
  }
  return "THU_LAI"
}

// ---- Đừng sửa phần dưới đây ----
const daXuLyRoi = new Set<string>()
console.log("Lan 1:", xuLyIdempotent("don-A", daXuLyRoi))
console.log("Lan 2 (giao lai):", xuLyIdempotent("don-A", daXuLyRoi))
console.log("Viec khac:", xuLyIdempotent("don-B", daXuLyRoi))

const soLanThatBai = new Map<string, number>()
const NGUONG = 3
console.log("That bai 1:", theoDoiThatBai("viec-X", soLanThatBai, NGUONG))
console.log("That bai 2:", theoDoiThatBai("viec-X", soLanThatBai, NGUONG))
console.log("That bai 3:", theoDoiThatBai("viec-X", soLanThatBai, NGUONG))`,
    },
    homework:
      'Nghĩ về 3 loại "việc nền" khác nhau trong một app thương mại điện tử: (1) gửi thông báo đẩy khuyến mãi, (2) trừ số lượng tồn kho khi đặt hàng, (3) ghi log truy cập trang. Với mỗi loại, tự trả lời: nếu bị xử lý HAI LẦN do at-least-once thì hậu quả nghiêm trọng tới mức nào (không sao / phiền / hỏng dữ liệu), và loại nào BẮT BUỘC phải làm idempotent kỹ nhất. Viết ra lý do bằng lời, không cần code.',
    srsCards: [
      {
        hoi: 'At-least-once là gì và vì sao hầu hết hàng đợi thật chỉ đảm bảo được mức này?',
        dap: 'Hàng đợi giao MỘT việc ÍT NHẤT một lần, có thể giao lại nhiều lần (do consumer crash trước khi xác nhận, hoặc do retry mạng). Vì hàng đợi chỉ xoá việc SAU KHI nhận xác nhận "đã xong" — không nhận được thì buộc phải giao lại, thà giao trùng còn hơn bỏ sót.',
      },
      {
        hoi: 'Idempotent trong xử lý việc nền nghĩa là gì, và cách làm phổ biến nhất?',
        dap: 'Chạy lại cùng một việc nhiều lần vẫn ra đúng kết quả như chạy một lần, không cộng dồn tác dụng phụ. Cách làm phổ biến: lưu ID việc đã xử lý xong (Set/bảng), kiểm trước khi làm — có rồi thì bỏ qua.',
      },
      {
        hoi: 'Dead letter queue giải quyết vấn đề gì?',
        dap: 'Một việc liên tục thất bại mà cứ retry vô hạn sẽ chiếm tài nguyên vô ích và không ai biết. DLQ: thất bại quá một ngưỡng N thì chuyển việc sang hàng đợi riêng để người xem xét thủ công, không thử lại nữa.',
      },
    ],
  },
  {
    id: 'p6-u104-l2',
    unitId: 'p6-u104',
    language: 'typescript',
    title: 'Race condition: hai luồng cùng cộng biến đếm, mất mất một lần cộng',
    hook: 'Hai request cùng lúc gọi "tăng số lượt xem bài viết lên 1". Bộ đếm đang là 10. Cả hai request đều đọc thấy 10, đều tính ra 11, đều ghi lại 11. Đáng lẽ phải là 12 (hai lần +1), kết quả cuối chỉ là 11 — một lần cộng biến mất không dấu vết, không có lỗi nào được báo.',
    theory:
      'RACE CONDITION (tranh chấp) xảy ra khi nhiều luồng thực thi cùng truy cập một dữ liệu dùng chung, và kết quả cuối cùng PHỤ THUỘC vào THỨ TỰ XEN KẼ của các bước — thứ tự đó lại không do lập trình viên kiểm soát được.\n\nPhép "tăng biến đếm lên 1" trông như MỘT bước, nhưng máy tính thực hiện nó bằng BA bước tách rời: (1) ĐỌC giá trị hiện tại, (2) CỘNG 1 vào giá trị vừa đọc, (3) GHI kết quả trở lại. Nếu hai luồng A và B cùng làm việc này trên cùng một biến, và các bước của chúng XEN KẼ nhau thay vì chạy trọn vẹn từng luồng một, kết quả có thể sai:\n\nBiến đếm bắt đầu = 10.\nA đọc: thấy 10.\nB đọc: thấy 10 (A CHƯA GHI XONG nên B vẫn thấy giá trị cũ).\nA cộng: 10 + 1 = 11. A ghi: biến đếm = 11.\nB cộng: 10 + 1 = 11 (B dùng giá trị B ĐÃ ĐỌC TỪ TRƯỚC, không đọc lại). B ghi: biến đếm = 11.\nKết quả cuối: 11 — dù có HAI lần +1, chỉ MỘT lần được tính. Lần cộng của A bị "nuốt mất" vì B ghi đè lên bằng một giá trị tính từ dữ liệu đã cũ.\n\nCách sửa cốt lõi: gộp đọc-cộng-ghi thành MỘT BƯỚC NGUYÊN TỬ (atomic) — không thể bị luồng khác chen ngang giữa chừng. Trong CSDL thật, đó là câu lệnh `UPDATE bang SET dem = dem + 1` (CSDL tự đảm bảo nguyên tử ở tầng dòng dữ liệu) thay vì đọc giá trị ra ứng dụng, cộng, rồi ghi lại. Trong bộ nhớ một tiến trình, đó là dùng khoá (mutex) hoặc cấu trúc dữ liệu atomic để đảm bảo không luồng nào xen vào giữa ba bước.\n\nHai khái niệm liên quan, chỉ cần hiểu KHÔNG cần code: DEADLOCK là khi hai luồng cùng CHỜ khoá của nhau — luồng A giữ khoá 1 và đang chờ khoá 2, luồng B giữ khoá 2 và đang chờ khoá 1 — cả hai đứng hình mãi mãi vì không bên nào chịu nhả khoá đang giữ. GIỚI HẠN ĐỒNG THỜI (backpressure) là chặn không cho quá N việc chạy song song cùng lúc — việc thứ N+1 phải CHỜ tới khi có một việc trong N đang chạy xong, tránh làm sập hệ thống (hết bộ nhớ, hết kết nối CSDL) khi có quá nhiều việc ập đến cùng lúc.',
    workedExample: {
      code: `type BienDem = { giaTri: number }

// Mô phỏng "đọc" và "ghi" tách rời — đúng 3 bước như CPU thật làm, để có thể XEN KẼ thủ công.
function doc(bienDem: BienDem): number {
  return bienDem.giaTri
}
function ghi(bienDem: BienDem, giaTriMoi: number): void {
  bienDem.giaTri = giaTriMoi
}

// ---- KỊCH BẢN 1: KHÔNG AN TOÀN — hai luồng A, B xen kẽ đúng thứ tự dưới đây (viết tay, tất định) ----
const demKhongAnToan: BienDem = { giaTri: 10 }
const docA = doc(demKhongAnToan)      // A đọc: 10
const docB = doc(demKhongAnToan)      // B đọc TRƯỚC KHI A kịp ghi: cũng thấy 10
ghi(demKhongAnToan, docA + 1)         // A ghi: 10 + 1 = 11
ghi(demKhongAnToan, docB + 1)         // B ghi ĐÈ LÊN bằng giá trị B đã đọc từ trước: 10 + 1 = 11
console.log("Khong an toan - ket qua cuoi:", demKhongAnToan.giaTri) // đáng lẽ 12, chỉ ra 11

// ---- KỊCH BẢN 2: AN TOÀN — gộp đọc-cộng-ghi thành MỘT bước nguyên tử, không thể xen ngang ----
function tangNguyenTu(bienDem: BienDem): void {
  bienDem.giaTri = bienDem.giaTri + 1 // đọc và ghi trong CÙNG một lệnh, không luồng nào chen được
}
const demAnToan: BienDem = { giaTri: 10 }
tangNguyenTu(demAnToan) // A
tangNguyenTu(demAnToan) // B
console.log("An toan - ket qua cuoi:", demAnToan.giaTri) // đúng 12`,
      stdinLines: [],
    },
    predict: {
      code: `type BienDem = { giaTri: number }
function doc(bienDem: BienDem): number {
  return bienDem.giaTri
}
function ghi(bienDem: BienDem, giaTriMoi: number): void {
  bienDem.giaTri = giaTriMoi
}

const dem: BienDem = { giaTri: 5 }
const docA = doc(dem)
const docB = doc(dem)
const docC = doc(dem)
ghi(dem, docA + 1)
ghi(dem, docB + 1)
ghi(dem, docC + 1)
console.log(dem.giaTri)`,
      question:
        'Ba luồng A, B, C đều ĐỌC TRƯỚC khi bất kỳ ai ghi (đọc-đọc-đọc-ghi-ghi-ghi), bắt đầu từ 5. Kết quả cuối in ra?',
      choices: ['6', '8', '5', '3'],
      answerIndex: 0,
      explain:
        'Cả ba luồng đọc TRƯỚC khi ai ghi, nên cả ba đều thấy giá trị cũ là 5 — mỗi luồng tự tính 5+1=6. Lần lượt ghi: A ghi 6, B ghi đè bằng 6 (B cũng tính từ 5), C ghi đè bằng 6 (C cũng tính từ 5). Kết quả cuối là 6, dù có BA lần +1 — chỉ một lần được tính, hai lần kia bị mất hoàn toàn vì mọi luồng đều đọc cùng một giá trị cũ trước khi bất kỳ ai ghi lại.',
    },
    parsons: {
      prompt:
        'Xếp lại kịch bản race condition: A và B cùng đọc TRƯỚC, rồi mới lần lượt ghi — để thấy một lần cộng bị mất.',
      lines: [
        'const dem: BienDem = { giaTri: 10 }',
        'const docA = doc(dem)',
        'const docB = doc(dem)',
        'ghi(dem, docA + 1)',
        'ghi(dem, docB + 1)',
        'console.log(dem.giaTri)',
      ],
    },
    make: {
      prompt:
        'Viết hàm `tangNguyenTu(bienDem)` — tăng bienDem.giaTri lên 1 trong ĐÚNG MỘT dòng lệnh (đọc và ghi gộp làm một, không tách thành biến trung gian) để không thể bị xen ngang.\n\nSau đó viết hàm `chayGioiHanDongThoi(soViecDangChay, GIOI_HAN)`: mô phỏng việc thứ (soViecDangChay + 1) có được PHÉP CHẠY NGAY không. Nếu soViecDangChay < GIOI_HAN → trả "CHAY_NGAY" (còn chỗ trống). Nếu soViecDangChay >= GIOI_HAN → trả "CHO" (đã đầy, phải chờ một việc khác xong trước).\n\nDùng đúng starter code có sẵn (đừng sửa phần dưới) để kiểm cả hai hàm.',
      starterCode: `type BienDem = { giaTri: number }

function tangNguyenTu(bienDem: BienDem): void {
  // TODO: tăng bienDem.giaTri lên 1 trong MỘT dòng, không tách đọc/ghi riêng
}

function chayGioiHanDongThoi(soViecDangChay: number, GIOI_HAN: number): string {
  // TODO: còn chỗ (soViecDangChay < GIOI_HAN) thì "CHAY_NGAY", đầy rồi thì "CHO"
  return "CHO"
}

// ---- Đừng sửa phần dưới đây ----
const dem: BienDem = { giaTri: 100 }
tangNguyenTu(dem) // A
tangNguyenTu(dem) // B
tangNguyenTu(dem) // C
console.log("Dem sau 3 lan tang nguyen tu:", dem.giaTri)

const GIOI_HAN = 3
console.log("Viec thu 1 (dang chay 0):", chayGioiHanDongThoi(0, GIOI_HAN))
console.log("Viec thu 3 (dang chay 2):", chayGioiHanDongThoi(2, GIOI_HAN))
console.log("Viec thu 4 (dang chay 3):", chayGioiHanDongThoi(3, GIOI_HAN))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Dem sau 3 lan tang nguyen tu: 103',
          match: 'contains',
          hidden: false,
          label: '3 lần tăng nguyên tử từ 100, không luồng nào chen ngang → đúng 103',
        },
        {
          stdinLines: [],
          expected: 'Viec thu 1 (dang chay 0): CHAY_NGAY',
          match: 'contains',
          hidden: false,
          label: '0 việc đang chạy, giới hạn 3 → còn chỗ, chạy ngay',
        },
        {
          stdinLines: [],
          expected: 'Viec thu 3 (dang chay 2): CHAY_NGAY',
          match: 'contains',
          hidden: false,
          label: '2 việc đang chạy < 3 → vẫn còn đúng 1 chỗ trống, chạy ngay',
        },
        {
          stdinLines: [],
          expected: 'Viec thu 4 (dang chay 3): CHO',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 3 việc đang chạy = giới hạn 3 → đã đầy, phải chờ',
        },
      ],
      hints: [
        'tangNguyenTu: viết đúng một dòng bienDem.giaTri = bienDem.giaTri + 1 — không tạo biến trung gian lưu giá trị đọc ra rồi mới gán lại, vì tách ra là tạo đúng cái kẽ hở race condition đã học ở workedExample.',
        'chayGioiHanDongThoi: so sánh soViecDangChay < GIOI_HAN (chú ý dấu <, không phải <=) — còn chỗ trống nghĩa là số đang chạy CHƯA CHẠM giới hạn.',
        'Kiểm lại bằng workedExample: giới hạn 3 nghĩa là tối đa 3 việc chạy CÙNG LÚC — khi đã có đúng 3 việc đang chạy (soViecDangChay = 3), việc thứ 4 không còn chỗ nên phải "CHO".',
      ],
      sampleSolution: `type BienDem = { giaTri: number }

function tangNguyenTu(bienDem: BienDem): void {
  bienDem.giaTri = bienDem.giaTri + 1
}

function chayGioiHanDongThoi(soViecDangChay: number, GIOI_HAN: number): string {
  if (soViecDangChay < GIOI_HAN) {
    return "CHAY_NGAY"
  }
  return "CHO"
}

// ---- Đừng sửa phần dưới đây ----
const dem: BienDem = { giaTri: 100 }
tangNguyenTu(dem) // A
tangNguyenTu(dem) // B
tangNguyenTu(dem) // C
console.log("Dem sau 3 lan tang nguyen tu:", dem.giaTri)

const GIOI_HAN = 3
console.log("Viec thu 1 (dang chay 0):", chayGioiHanDongThoi(0, GIOI_HAN))
console.log("Viec thu 3 (dang chay 2):", chayGioiHanDongThoi(2, GIOI_HAN))
console.log("Viec thu 4 (dang chay 3):", chayGioiHanDongThoi(3, GIOI_HAN))`,
    },
    homework:
      'Tra một ngôn ngữ backend bạn biết (Go: goroutine + channel/mutex; Node.js: async/await; Java: Thread + synchronized) và tìm cách nó cung cấp để tránh race condition trên biến dùng chung. Rồi tự trả lời: vì sao JavaScript/Node.js (đơn luồng, một event loop) vẫn có thể gặp lỗi TƯƠNG TỰ race condition khi có nhiều `await` xen giữa đọc và ghi dữ liệu, dù không có hai luồng CPU thật chạy song song?',
    srsCards: [
      {
        hoi: 'Vì sao "tăng biến đếm lên 1" lại có thể bị race condition dù trông như một thao tác?',
        dap: 'Vì nó thực chất là BA bước tách rời: đọc giá trị, cộng 1, ghi lại. Hai luồng xen kẽ đọc-đọc-ghi-ghi (không phải đọc-ghi-đọc-ghi) khiến luồng sau dùng giá trị CŨ đã đọc từ trước, ghi đè và làm mất một lần cộng của luồng kia.',
      },
      {
        hoi: 'Cách sửa cốt lõi cho race condition kiểu đọc-cộng-ghi là gì?',
        dap: 'Gộp đọc-cộng-ghi thành MỘT bước nguyên tử (atomic) không thể bị chen ngang — vd trong CSDL dùng `UPDATE ... SET dem = dem + 1` thay vì đọc ra ứng dụng rồi ghi lại; trong bộ nhớ dùng khoá (mutex).',
      },
      {
        hoi: 'Deadlock khác race condition ở điểm nào?',
        dap: 'Race condition là kết quả SAI do thứ tự xen kẽ không kiểm soát được. Deadlock là hai luồng cùng CHỜ khoá của nhau (A giữ khoá 1 chờ khoá 2, B giữ khoá 2 chờ khoá 1) — cả hai đứng hình mãi mãi, không phải kết quả sai mà là KHÔNG BAO GIỜ có kết quả.',
      },
      {
        hoi: 'Backpressure (giới hạn đồng thời) giải quyết vấn đề gì?',
        dap: 'Chặn không cho quá N việc chạy song song — việc thứ N+1 phải chờ một việc trong N xong trước. Tránh hệ thống sập (hết bộ nhớ, hết kết nối CSDL) khi quá nhiều việc ập đến cùng lúc.',
      },
    ],
  },
]
