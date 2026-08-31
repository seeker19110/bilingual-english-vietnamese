// lessons/p6u108.ts — P6-U108: HƯỚNG BACKEND, chặng S4 "Chuyên gia — quy mô lớn và trách
// nhiệm vận hành" — Thiết kế hệ thống quy mô (module `backend-s4-m1`).
//
// backend-s3 dạy CÁCH một hệ phân tán CHỊU LỖI (circuit breaker, error budget). S4 lùi một
// bước ra XA hơn: TRƯỚC KHI viết một dòng code, người thiết kế hệ quy mô lớn phải TRẢ LỜI
// ĐƯỢC BẰNG SỐ hai câu hỏi — "hệ này cần chịu bao nhiêu tải?" và "đặt máy chủ ở đâu thì người
// dùng chờ ít nhất?" — hai bài ở đây dạy đúng hai phép tính đó.
//
// Dùng làn `typescript`, mô phỏng bằng hàm thuần tất định — không hạ tầng thật.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U108_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u108-l1',
    unitId: 'p6-u108',
    language: 'typescript',
    title: 'Ước lượng dung lượng — trả lời "cần bao nhiêu máy" bằng số, không bằng cảm giác',
    hook: 'Sếp hỏi: "Hệ thống mới chịu được không?" Câu trả lời "chắc được" không phải một câu trả lời — nó là một lời cầu nguyện. Dân thiết kế hệ quy mô lớn trả lời bằng BA CON SỐ: QPS trung bình, QPS lúc cao điểm, và dung lượng lưu trữ cần trong N ngày tới. Ba con số đó tính được TRÊN GIẤY, trước khi viết dòng code đầu tiên.',
    theory:
      'ƯỚC LƯỢNG DUNG LƯỢNG (capacity estimation) là bài toán số học đơn giản nhưng bị bỏ qua nhiều nhất: đi từ giả định về NGƯỜI DÙNG tới con số MÁY CHỦ cần có.\n\n**QPS TRUNG BÌNH** (queries per second — số yêu cầu mỗi giây): lấy TỔNG số lượt yêu cầu trong một ngày, chia cho số giây trong ngày (86.400 giây = 24×60×60).\n\n    QPS trung bình = tổng lượt/ngày ÷ 86.400\n\n**QPS ĐỈNH**: lưu lượng KHÔNG rải đều 24 giờ — giờ ăn trưa hay giờ tối luôn đông hơn hẳn giờ 3 giờ sáng. Ngành thường nhân QPS trung bình với một HỆ SỐ ĐỈNH (thường 2–5 lần tuỳ sản phẩm, đo từ dữ liệu thật nếu có, ước lượng nếu chưa có) để ra con số PHẢI CHỊU ĐƯỢC, không phải con số THƯỜNG GẶP:\n\n    QPS đỉnh = QPS trung bình × hệ số đỉnh\n\nThiết kế theo QPS trung bình là công thức chắc chắn SẬP đúng giờ cao điểm — đúng lúc đông người dùng nhất.\n\n**DUNG LƯỢNG LƯU TRỮ**: số bản ghi mỗi ngày × kích thước một bản ghi × số ngày cần giữ. Con số ra đơn vị byte, thường quy đổi sang GB (chia 1 tỷ) cho dễ đọc.\n\nBa con số này không cần chính xác tuyệt đối — sai số 20-30% vẫn hữu ích, vì nó CHUYỂN câu hỏi từ "chắc được không?" (không thể chứng minh) sang "150 máy có đủ không, hay cần 200?" (một câu hỏi có thể tranh luận bằng số). Đó là toàn bộ giá trị của ước lượng dung lượng: KHÔNG PHẢI để đúng 100%, mà để bắt đầu cuộc thảo luận đúng chỗ.',
    workedExample: {
      code: `function qpsTrungBinh(tongLuotMoiNgay: number): number {
  return Math.round(tongLuotMoiNgay / 86400)
}

function qpsDinh(qtb: number, heSoDinh: number): number {
  return Math.round(qtb * heSoDinh)
}

function dungLuongGB(soBanGhiMoiNgay: number, kichThuocByte: number, soNgayLuu: number): number {
  const bytes = soBanGhiMoiNgay * kichThuocByte * soNgayLuu
  return Math.round((bytes / 1_000_000_000) * 100) / 100 // lam tron 2 chu so
}

// 8.640.000 luot/ngay (vd 864.000 nguoi dung x 10 luot/nguoi)
const qtb = qpsTrungBinh(8640000)
console.log("QPS trung binh:", qtb)
console.log("QPS dinh (he so 3):", qpsDinh(qtb, 3))

// Moi ban ghi 500 byte, giu 30 ngay
console.log("Dung luong 30 ngay:", dungLuongGB(8640000, 500, 30), "GB")`,
      stdinLines: [],
    },
    predict: {
      code: `function qpsTrungBinh(tongLuotMoiNgay: number): number {
  return Math.round(tongLuotMoiNgay / 86400)
}
function qpsDinh(qtb: number, heSoDinh: number): number {
  return Math.round(qtb * heSoDinh)
}
const qtb = qpsTrungBinh(4320000)
console.log(qtb, qpsDinh(qtb, 4))`,
      question:
        '4.320.000 lượt/ngày (bằng nửa ví dụ mẫu), hệ số đỉnh 4. QPS trung bình và QPS đỉnh là bao nhiêu?',
      choices: ['50 200', '50 150', '100 400', '25 100'],
      answerIndex: 0,
      explain:
        'QPS trung bình = 4.320.000 ÷ 86.400 = 50 (đúng bằng nửa 100 của ví dụ mẫu, vì tổng lượt giảm một nửa). QPS đỉnh = 50 × 4 = 200. Điểm cần nhớ: QPS đỉnh phụ thuộc CẢ tổng lượt LẪN hệ số đỉnh — đổi một trong hai là đổi kết quả, không thể nhẩm tắt.',
    },
    parsons: {
      prompt: 'Xếp lại chuỗi tính từ tổng lượt/ngày ra QPS trung bình rồi QPS đỉnh.',
      lines: [
        'function qpsTrungBinh(tongLuotMoiNgay: number): number {',
        '  return Math.round(tongLuotMoiNgay / 86400)',
        '}',
        'function qpsDinh(qtb: number, heSoDinh: number): number {',
        '  return Math.round(qtb * heSoDinh)',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết bộ ước lượng dung lượng đầy đủ cho một dịch vụ mới.\n\n- qpsTrungBinh(tongLuotMoiNgay): làm tròn(tongLuotMoiNgay / 86400).\n- qpsDinh(qtb, heSoDinh): làm tròn(qtb × heSoDinh).\n- dungLuongGB(soBanGhiMoiNgay, kichThuocByte, soNgayLuu): tổng byte = soBanGhiMoiNgay × kichThuocByte × soNgayLuu, quy đổi sang GB (chia 1.000.000.000) rồi làm tròn 2 chữ số thập phân (dùng Math.round(x * 100) / 100).\n\nDùng starter code có sẵn (đừng sửa phần dưới): tính cho dịch vụ 17.280.000 lượt/ngày, hệ số đỉnh 5, mỗi bản ghi 1000 byte, giữ 90 ngày.',
      starterCode: `function qpsTrungBinh(tongLuotMoiNgay: number): number {
  // TODO
  return 0
}

function qpsDinh(qtb: number, heSoDinh: number): number {
  // TODO
  return 0
}

function dungLuongGB(soBanGhiMoiNgay: number, kichThuocByte: number, soNgayLuu: number): number {
  // TODO
  return 0
}

// ---- Đừng sửa phần dưới đây ----
const qtb = qpsTrungBinh(17280000)
console.log("QPS trung binh:", qtb)
console.log("QPS dinh:", qpsDinh(qtb, 5))
console.log("Dung luong:", dungLuongGB(17280000, 1000, 90), "GB")`,
      testCases: [
        {
          stdinLines: [],
          expected: 'QPS trung binh: 200',
          match: 'contains',
          hidden: false,
          label: '17.280.000 / 86.400 = 200 QPS trung bình',
        },
        {
          stdinLines: [],
          expected: 'QPS dinh: 1000',
          match: 'contains',
          hidden: false,
          label: '200 × 5 = 1000 QPS đỉnh',
        },
        {
          stdinLines: [],
          expected: 'Dung luong: 1555.2 GB',
          match: 'contains',
          hidden: false,
          label: '17.280.000 × 1000 × 90 ÷ 1 tỷ = 1555.2 GB',
        },
        {
          stdinLines: [],
          expected: 'QPS trung binh: 200\nQPS dinh: 1000\nDung luong: 1555.2 GB',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: cả ba dòng cùng lúc khớp thứ tự (kiểm không hardcode một dòng riêng lẻ)',
        },
      ],
      hints: [
        'qpsTrungBinh: Math.round(tongLuotMoiNgay / 86400) — đừng quên Math.round, phép chia số nguyên trong TypeScript ra số thực có phần lẻ.',
        'qpsDinh: Math.round(qtb * heSoDinh) — nhân trực tiếp QPS trung bình đã tính với hệ số.',
        'dungLuongGB: tính tổng byte trước (ba số nhân nhau), rồi chia 1_000_000_000, rồi Math.round(... * 100) / 100 để làm tròn đúng 2 chữ số thập phân.',
      ],
      sampleSolution: `function qpsTrungBinh(tongLuotMoiNgay: number): number {
  return Math.round(tongLuotMoiNgay / 86400)
}

function qpsDinh(qtb: number, heSoDinh: number): number {
  return Math.round(qtb * heSoDinh)
}

function dungLuongGB(soBanGhiMoiNgay: number, kichThuocByte: number, soNgayLuu: number): number {
  const bytes = soBanGhiMoiNgay * kichThuocByte * soNgayLuu
  return Math.round((bytes / 1_000_000_000) * 100) / 100
}

// ---- Đừng sửa phần dưới đây ----
const qtb = qpsTrungBinh(17280000)
console.log("QPS trung binh:", qtb)
console.log("QPS dinh:", qpsDinh(qtb, 5))
console.log("Dung luong:", dungLuongGB(17280000, 1000, 90), "GB")`,
    },
    homework:
      'Ước lượng dung lượng cho một dịch vụ thật bạn biết (app bạn hay dùng, hoặc dự án của chính bạn). Tự đặt giả định: số người dùng hoạt động, số lượt/người/ngày, hệ số đỉnh hợp lý theo giờ cao điểm của loại sản phẩm đó (app đặt đồ ăn đỉnh giờ trưa/tối; app ngân hàng đỉnh đầu/cuối tháng). Tính ra QPS đỉnh và dung lượng 1 năm. So với "chắc được" — con số cụ thể này giúp bạn quyết định gì mà cảm giác không giúp được?',
    srsCards: [
      {
        hoi: 'QPS trung bình tính từ đâu, và vì sao chưa đủ để thiết kế hệ thống?',
        dap: 'QPS trung bình = tổng lượt/ngày ÷ 86.400 giây. Chưa đủ vì lưu lượng không rải đều 24 giờ — thiết kế theo trung bình sẽ sập đúng giờ cao điểm, lúc đông người dùng nhất.',
      },
      {
        hoi: 'QPS đỉnh khác QPS trung bình ở đâu?',
        dap: 'QPS đỉnh = QPS trung bình × hệ số đỉnh (thường 2–5 lần) — đại diện tải THẬT PHẢI CHỊU ĐƯỢC ở giờ cao điểm, không phải tải thường gặp trung bình cả ngày.',
      },
      {
        hoi: 'Giá trị thật của ước lượng dung lượng là gì, nếu con số không cần chính xác 100%?',
        dap: 'Chuyển câu hỏi từ "chắc được không?" (không chứng minh được) sang một con số cụ thể có thể tranh luận và đo lại — đó mới là mục đích, không phải để đúng tuyệt đối.',
      },
    ],
  },
  {
    id: 'p6-u108-l2',
    unitId: 'p6-u108',
    language: 'typescript',
    title: 'Đa vùng địa lý — cái giá của độ trễ ánh sáng, không có công nghệ nào vượt qua được',
    hook: 'Bạn tối ưu code tới mức xử lý một yêu cầu chỉ mất 2 mili-giây. Nhưng máy chủ đặt ở Mỹ, người dùng ở Việt Nam — chỉ riêng việc TÍN HIỆU ĐI QUA ĐẠI DƯƠNG rồi QUAY LẠI đã mất hơn 200 mili-giây. Không CPU nào nhanh hơn được, vì đối thủ ở đây không phải phần cứng — là tốc độ ánh sáng.',
    theory:
      'Tín hiệu mạng đi trong sợi quang với tốc độ khoảng 200.000 km/giây (chậm hơn tốc độ ánh sáng trong chân không ~300.000 km/s vì thuỷ tinh làm chậm ánh sáng lại — đây là con số THỰC TẾ của cáp quang, không phải lý thuyết). Đây là GIỚI HẠN VẬT LÝ — không phần mềm hay phần cứng nào vượt qua được, dù bạn có bao nhiêu tiền.\n\nĐỘ TRỄ ĐI-VỀ (RTT — round-trip time) tối thiểu giữa hai điểm cách nhau D km:\n\n    RTT (giây) = 2 × D ÷ 200.000\n\nNhân 2 vì tín hiệu phải đi VÀ VỀ (yêu cầu đi, phản hồi về). Ví dụ Sài Gòn – Singapore (~1.100km): RTT tối thiểu ≈ 11 mili-giây. Sài Gòn – bờ Tây nước Mỹ (~13.000km): RTT tối thiểu ≈ 130 mili-giây — và đó là con số TỐT NHẤT CÓ THỂ, chưa tính độ trễ xử lý, hàng đợi mạng, hay việc cáp không đi đường thẳng.\n\nHỆ QUẢ THIẾT KẾ: nếu người dùng ở nhiều châu lục, đặt DUY NHẤT một trung tâm dữ liệu là chấp nhận một nửa người dùng chịu RTT hàng trăm mili-giây cho MỌI yêu cầu — dù hệ thống có nhanh tới đâu. Giải pháp là ĐA VÙNG ĐỊA LÝ (multi-region): đặt bản sao dịch vụ gần người dùng ở nhiều nơi, để mỗi người chỉ nói chuyện với trung tâm dữ liệu GẦN NHẤT. Cái giá đánh đổi: dữ liệu ghi ở vùng này phải ĐỒNG BỘ sang vùng khác — và việc đồng bộ đó lại tốn đúng cái RTT vừa tính, nên dữ liệu ở xa luôn có độ trễ (nối lại khái niệm NHẤT QUÁN CUỐI CÙNG đã học ở `backend-s3`).\n\nBài học không phải "luôn cần đa vùng" — một sản phẩm chỉ phục vụ người dùng trong nước thì một trung tâm dữ liệu là đủ, đơn giản hơn nhiều. Bài học là: TRƯỚC KHI quyết định đa vùng hay không, phải TÍNH RA con số RTT thật cho đối tượng người dùng của mình, chứ không quyết định theo cảm tính "chắc cần cho chắc".',
    workedExample: {
      code: `const TOC_DO_KM_S = 200000 // toc do tin hieu trong soi quang, km/giay

function rttMs(khoangCachKm: number): number {
  return Math.round((2 * khoangCachKm / TOC_DO_KM_S) * 1000) // doi giay -> mili-giay
}

console.log("SG - Singapore (1100km):", rttMs(1100), "ms")
console.log("SG - bo Tay My (13000km):", rttMs(13000), "ms")
console.log("SG - chau Au (10000km):", rttMs(10000), "ms")

// So sanh: neu SLO yeu cau phan hoi duoi 100ms, tuyen nao KHONG dat duoc
// chi rieng bang do tre mang, chua tinh thoi gian xu ly?`,
      stdinLines: [],
    },
    predict: {
      code: `const TOC_DO_KM_S = 200000
function rttMs(khoangCachKm: number): number {
  return Math.round((2 * khoangCachKm / TOC_DO_KM_S) * 1000)
}
console.log(rttMs(5000))`,
      question: 'Khoảng cách 5.000km. RTT tối thiểu là bao nhiêu mili-giây?',
      choices: ['50', '25', '100', '10'],
      answerIndex: 0,
      explain:
        'RTT = 2 × 5000 ÷ 200000 × 1000 = 50ms. Bẫy dễ nhầm nhất: quên nhân 2 (đi VÀ về) sẽ ra 25 — đúng bằng độ trễ MỘT CHIỀU, không phải RTT thật mà ứng dụng đo được (yêu cầu đi, đợi xử lý, phản hồi về).',
    },
    parsons: {
      prompt: 'Xếp lại hàm tính RTT tối thiểu theo khoảng cách và tốc độ tín hiệu trong sợi quang.',
      lines: [
        'const TOC_DO_KM_S = 200000',
        'function rttMs(khoangCachKm: number): number {',
        '  return Math.round((2 * khoangCachKm / TOC_DO_KM_S) * 1000)',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm chonVungGanNhat(khoangCachDenCacVung) chọn trung tâm dữ liệu GẦN NHẤT (RTT thấp nhất) cho một người dùng.\n\n- Tham số là một mảng các { tenVung: string, khoangCachKm: number }.\n- Với mỗi vùng, tính RTT bằng công thức đã học: Math.round((2 * khoangCachKm / 200000) * 1000).\n- Trả về TÊN vùng có RTT THẤP NHẤT. Nhiều vùng cùng RTT thấp nhất thì lấy vùng đứng TRƯỚC trong mảng.',
      starterCode: `const TOC_DO_KM_S = 200000

function rttMs(khoangCachKm: number): number {
  return Math.round((2 * khoangCachKm / TOC_DO_KM_S) * 1000)
}

function chonVungGanNhat(khoangCachDenCacVung: { tenVung: string; khoangCachKm: number }[]): string {
  // TODO: chon vung co RTT thap nhat; hoa thi lay vung dung truoc
  return ""
}

// ---- Đừng sửa phần dưới đây ----
const VUNG = [
  { tenVung: "Singapore", khoangCachKm: 1100 },
  { tenVung: "Tokyo", khoangCachKm: 4300 },
  { tenVung: "US-West", khoangCachKm: 13000 },
]
console.log(chonVungGanNhat(VUNG))
console.log(chonVungGanNhat([{ tenVung: "A", khoangCachKm: 5000 }, { tenVung: "B", khoangCachKm: 5000 }]))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Singapore',
          match: 'contains',
          hidden: false,
          label: 'Singapore gần nhất (1100km) trong ba vùng → RTT thấp nhất',
        },
        {
          stdinLines: [],
          expected: 'Singapore\nA',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: hai vùng cùng khoảng cách (hoà) → lấy vùng đứng trước trong mảng ("A")',
        },
      ],
      hints: [
        'Duyệt mảng khoangCachDenCacVung, tính rttMs(vung.khoangCachKm) cho từng phần tử.',
        'Giữ biến "rtt thấp nhất thấy được" và "tên vùng tương ứng" — chỉ cập nhật khi rtt mới THỰC SỰ nhỏ hơn (<), không phải nhỏ hơn hoặc bằng, để ca hoà tự động giữ vùng thấy TRƯỚC.',
        'Khởi tạo rtt thấp nhất bằng Infinity trước vòng lặp để chắc chắn phần tử đầu tiên luôn được nhận.',
      ],
      sampleSolution: `const TOC_DO_KM_S = 200000

function rttMs(khoangCachKm: number): number {
  return Math.round((2 * khoangCachKm / TOC_DO_KM_S) * 1000)
}

function chonVungGanNhat(khoangCachDenCacVung: { tenVung: string; khoangCachKm: number }[]): string {
  let tenTotNhat = ""
  let rttThapNhat = Infinity
  for (const vung of khoangCachDenCacVung) {
    const rtt = rttMs(vung.khoangCachKm)
    if (rtt < rttThapNhat) {
      rttThapNhat = rtt
      tenTotNhat = vung.tenVung
    }
  }
  return tenTotNhat
}

// ---- Đừng sửa phần dưới đây ----
const VUNG = [
  { tenVung: "Singapore", khoangCachKm: 1100 },
  { tenVung: "Tokyo", khoangCachKm: 4300 },
  { tenVung: "US-West", khoangCachKm: 13000 },
]
console.log(chonVungGanNhat(VUNG))
console.log(chonVungGanNhat([{ tenVung: "A", khoangCachKm: 5000 }, { tenVung: "B", khoangCachKm: 5000 }]))`,
    },
    homework:
      'Dùng công cụ đo ping thật (lệnh `ping` trên máy, hoặc trang đo độ trễ trực tuyến) đo RTT thật từ máy bạn tới 2-3 máy chủ ở các nước khác nhau. So sánh RTT ĐO ĐƯỢC với RTT LÝ THUYẾT tính bằng công thức trong bài (dựa vào khoảng cách địa lý ước lượng). RTT thật luôn LỚN HƠN lý thuyết — viết 2-3 câu giải thích vì sao (gợi ý: cáp không đi đường thẳng, phải qua nhiều trạm trung chuyển, mỗi trạm có độ trễ xử lý riêng).',
    srsCards: [
      {
        hoi: 'Công thức tính RTT tối thiểu theo khoảng cách là gì, và vì sao nhân 2?',
        dap: 'RTT (ms) = (2 × khoảng cách km ÷ 200.000 km/s) × 1000. Nhân 2 vì tín hiệu phải đi VÀ VỀ — yêu cầu đi tới, phản hồi phải quay lại mới tính là một lượt hoàn chỉnh.',
      },
      {
        hoi: 'Vì sao độ trễ do khoảng cách địa lý không thể tối ưu bằng code hay phần cứng nhanh hơn?',
        dap: 'Vì đó là GIỚI HẠN VẬT LÝ — tốc độ tín hiệu trong sợi quang (~200.000 km/s) là hằng số, không phụ thuộc CPU hay thuật toán. Muốn giảm độ trễ chỉ có cách giảm KHOẢNG CÁCH (đặt máy chủ gần người dùng hơn).',
      },
      {
        hoi: 'Đa vùng địa lý giải quyết vấn đề gì, và đánh đổi lại cái gì?',
        dap: 'Giải quyết: người dùng nói chuyện với trung tâm dữ liệu GẦN NHẤT thay vì một trung tâm duy nhất ở xa. Đánh đổi: dữ liệu phải đồng bộ giữa các vùng, và việc đồng bộ đó tốn đúng RTT giữa các vùng — dẫn tới nhất quán cuối cùng thay vì tức thời.',
      },
    ],
  },
]
