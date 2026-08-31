// lessons/p6u124.ts — P6-U124: HƯỚNG KIẾN TRÚC, chặng S3 — Giao việc cho AI (hoặc cho người
// mới) (module `architecture-s3-m2`).
//
// u123 dạy VIẾT đặc tả kín. u124 dạy GIAO nó đi: ① brief phải TỰ CHỨA vì bên thi hành không
// thấy ngữ cảnh trước đó; ② chọn đúng ĐỘ TỰ QUYẾT cho từng loại việc, và chống ảo giác bằng
// cách đòi dẫn nguồn thay vì tin lời khẳng định.
//
// Dùng làn `typescript`, mô phỏng bằng hàm thuần tất định — không hạ tầng thật.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U124_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u124-l1',
    unitId: 'p6-u124',
    language: 'typescript',
    title: 'Brief tự chứa — bên thi hành KHÔNG thấy ngữ cảnh trước đó',
    hook: '"Sửa cái hàm đó như mình đã bàn hôm qua nhé, giống chỗ kia ấy." Với một đồng nghiệp ngồi cạnh, câu đó đủ. Với một subagent AI vừa khởi tạo — hoặc với chính bạn ba tháng sau — câu đó là ba chỗ trống liền nhau: hàm nào, bàn cái gì, chỗ kia là chỗ nào.',
    theory:
      'Luật nền của việc giao việc: **bên thi hành không thấy hội thoại trước đó.** Điều này đúng theo nghĩa đen với một subagent AI mới khởi tạo (nó chỉ đọc đúng cái brief bạn gửi), và gần như đúng với một người mới vào dự án. Mọi giả định còn nằm trong đầu bạn mà chưa viết ra thì với họ là KHÔNG TỒN TẠI.\n\nLoại lỗi phổ biến nhất là **tham chiếu treo** — những cụm từ trỏ vào một thứ chỉ có trong ngữ cảnh của người viết:\n\n- "như đã bàn", "như cũ", "giống hôm qua" → trỏ vào một cuộc trao đổi bên thi hành không có.\n- "file đó", "cái kia", "chỗ ấy" → trỏ vào một thứ chỉ người viết đang nhìn thấy.\n- "làm giống chỗ X" mà không nói đường dẫn của X.\n\nChúng nguy hiểm vì đọc rất trôi: người viết đọc lại thấy hoàn toàn rõ ràng, vì trong đầu họ những chỗ trống đó đã có sẵn nội dung. Đó là lý do nên soát bằng MÁY: liệt kê các cụm tham chiếu treo hay gặp và quét brief trước khi gửi — máy không có ngữ cảnh nên nó đọc brief đúng như bên thi hành đọc.\n\nCách chữa mỗi tham chiếu treo đều giống nhau: **thay bằng một thứ CHỈ ĐƯỢC** — đường dẫn file tương đối từ gốc repo, tên hàm cụ thể, số PR, tên hằng. "Giống chỗ kia" → "theo đúng khuôn của `packages/subject-programming/lessons/p6u108.ts`". Chi phí thêm mười giây gõ, đổi lại bỏ được một vòng hỏi-đáp.\n\nGhi chú quan trọng: brief tự chứa KHÔNG có nghĩa là brief dài. Nó có nghĩa là mỗi thứ được nhắc tới đều CHỈ ĐƯỢC. Một brief mười dòng toàn đường dẫn cụ thể còn tự chứa hơn hẳn một brief ba trang toàn "như đã thống nhất".',
    workedExample: {
      code: `// Nhung cum tro vao ngu canh ma ben thi hanh KHONG co.
const THAM_CHIEU_TREO = ["nhu da ban", "nhu cu", "giong hom qua", "file do", "cai kia", "cho ay"]

// Giu dung thu tu trong THAM_CHIEU_TREO de bao loi on dinh, khong phu thuoc thu tu cau chu.
function loiThamChieu(brief: string): string[] {
  const thap = brief.toLowerCase()
  return THAM_CHIEU_TREO.filter((cum) => thap.includes(cum))
}

function soatBrief(brief: string): string {
  const loi = loiThamChieu(brief)
  if (loi.length === 0) return "Tu chua"
  return "Chua tu chua: " + loi.join(", ")
}

const briefXau = "Sua cai ham do nhu da ban hom truoc, lam giong cai kia la duoc"
const briefTot =
  "Sua ham tinhPhiShip trong src/lib/phiShip.ts: don tren 500000 dong thi phi = 0. " +
  "KHONG dung toi src/lib/thanhToan.ts. Chay npm test truoc khi bao xong."

console.log(soatBrief(briefXau))
console.log(soatBrief(briefTot))`,
      stdinLines: [],
    },
    predict: {
      code: `const THAM_CHIEU_TREO = ["nhu da ban", "nhu cu", "giong hom qua", "file do", "cai kia", "cho ay"]
function loiThamChieu(brief: string): string[] {
  const thap = brief.toLowerCase()
  return THAM_CHIEU_TREO.filter((cum) => thap.includes(cum))
}
function soatBrief(brief: string): string {
  const loi = loiThamChieu(brief)
  if (loi.length === 0) return "Tu chua"
  return "Chua tu chua: " + loi.join(", ")
}
console.log(soatBrief("Lam CAI KIA truoc, phan con lai giu NHU CU"))`,
      question: 'Brief viết hoa cả hai cụm. Dòng in ra là gì?',
      choices: [
        'Chua tu chua: nhu cu, cai kia',
        'Chua tu chua: cai kia, nhu cu',
        'Brief sach, khong con tham chieu treo',
        'Chua tu chua: CAI KIA, NHU CU',
      ],
      answerIndex: 0,
      explain:
        'Hai điểm gộp lại. Một, `.toLowerCase()` nên viết hoa vẫn bị bắt. Hai — chỗ dễ nhầm — thứ tự báo lỗi theo THỨ TỰ TRONG HẰNG `THAM_CHIEU_TREO` chứ không theo thứ tự xuất hiện trong câu, vì `filter` chạy trên hằng đó: "nhu cu" đứng trước "cai kia" trong hằng. Báo lỗi ổn định như vậy dễ so sánh giữa các lần chạy hơn.',
    },
    parsons: {
      prompt: 'Xếp lại hàm soát brief: quét cụm tham chiếu treo trước, rồi kết luận.',
      lines: [
        'function loiThamChieu(brief: string): string[] {',
        '  const thap = brief.toLowerCase()',
        '  return THAM_CHIEU_TREO.filter((cum) => thap.includes(cum))',
        '}',
        'function soatBrief(brief: string): string {',
        '  const loi = loiThamChieu(brief)',
        '  if (loi.length === 0) return "Tu chua"',
        '  return "Chua tu chua: " + loi.join(", ")',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết bộ soát brief trước khi bấm gửi cho bên thi hành.\n\n- `loiThamChieu(brief)`: trả mảng các cụm trong `THAM_CHIEU_TREO` xuất hiện trong brief, so sánh KHÔNG phân biệt hoa thường, giữ đúng thứ tự của hằng.\n- `coDuongDan(brief)`: trả `true` nếu brief có ít nhất một đường dẫn file — quy ước đơn giản của bài: chuỗi chứa cả dấu `/` và dấu `.`.\n- `soatBrief(brief)`: còn tham chiếu treo thì trả `Chua tu chua: <các cụm nối bằng dấu phẩy>`; sạch tham chiếu nhưng KHÔNG có đường dẫn nào thì trả `Thieu diem cham file`; đủ cả hai thì trả `Gui duoc`.\n\nThứ tự kiểm quan trọng: tham chiếu treo trước, thiếu đường dẫn sau.',
      starterCode: `const THAM_CHIEU_TREO = ["nhu da ban", "nhu cu", "giong hom qua", "file do", "cai kia", "cho ay"]

function loiThamChieu(brief: string): string[] {
  // TODO
  return []
}

function coDuongDan(brief: string): boolean {
  // TODO: quy uoc cua bai — co ca dau "/" va dau "."
  return false
}

function soatBrief(brief: string): string {
  // TODO
  return ""
}

// ---- Đừng sửa phần dưới đây ----
const b1 = "Sua ham do nhu da ban, phan con lai giu nhu cu"
const b2 = "Sua ham tinhPhiShip: don tren 500000 dong thi phi bang 0"
const b3 = "Sua ham tinhPhiShip trong src/lib/phiShip.ts: don tren 500000 dong thi phi bang 0"
console.log(soatBrief(b1))
console.log(soatBrief(b2))
console.log(soatBrief(b3))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Chua tu chua: nhu da ban, nhu cu',
          match: 'contains',
          hidden: false,
          label: 'Hai tham chiếu treo, báo theo thứ tự hằng',
        },
        {
          stdinLines: [],
          expected: 'Thieu diem cham file',
          match: 'contains',
          hidden: false,
          label: 'Sạch tham chiếu treo nhưng chưa chỉ được file nào',
        },
        {
          stdinLines: [],
          expected: 'Gui duoc',
          match: 'contains',
          hidden: false,
          label: 'Có đường dẫn cụ thể → gửi được',
        },
        {
          stdinLines: [],
          expected: 'Chua tu chua: nhu da ban, nhu cu\nThieu diem cham file\nGui duoc',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đủ ba dòng đúng thứ tự',
        },
      ],
      hints: [
        'loiThamChieu: hạ brief về chữ thường một lần vào biến riêng, rồi `THAM_CHIEU_TREO.filter((cum) => thap.includes(cum))` — lọc trên hằng nên thứ tự tự đúng.',
        'coDuongDan: `return brief.includes("/") && brief.includes(".")` — quy ước thô nhưng đủ cho bài; ngoài đời bạn sẽ dùng biểu thức chính quy chặt hơn.',
        'soatBrief: ba nhánh theo đúng thứ tự — tham chiếu treo, rồi thiếu đường dẫn, rồi "Gui duoc". Đảo thứ tự sẽ làm ca đầu tiên trả sai.',
      ],
      sampleSolution: `const THAM_CHIEU_TREO = ["nhu da ban", "nhu cu", "giong hom qua", "file do", "cai kia", "cho ay"]

function loiThamChieu(brief: string): string[] {
  const thap = brief.toLowerCase()
  return THAM_CHIEU_TREO.filter((cum) => thap.includes(cum))
}

function coDuongDan(brief: string): boolean {
  return brief.includes("/") && brief.includes(".")
}

function soatBrief(brief: string): string {
  const loi = loiThamChieu(brief)
  if (loi.length > 0) return "Chua tu chua: " + loi.join(", ")
  if (!coDuongDan(brief)) return "Thieu diem cham file"
  return "Gui duoc"
}

// ---- Đừng sửa phần dưới đây ----
const b1 = "Sua ham do nhu da ban, phan con lai giu nhu cu"
const b2 = "Sua ham tinhPhiShip: don tren 500000 dong thi phi bang 0"
const b3 = "Sua ham tinhPhiShip trong src/lib/phiShip.ts: don tren 500000 dong thi phi bang 0"
console.log(soatBrief(b1))
console.log(soatBrief(b2))
console.log(soatBrief(b3))`,
    },
    homework:
      'Lấy tin nhắn giao việc gần nhất bạn gửi cho AI (hoặc cho đồng đội). Đưa nó cho một người KHÔNG hề biết dự án và nhờ họ nói lại xem phải làm gì. Mỗi chỗ họ phải hỏi lại chính là một chỗ hở. Viết lại brief cho tới khi họ đọc một lượt là hiểu — đó là thước đo thật của "tự chứa", chính xác hơn mọi checklist.',
    srsCards: [
      {
        hoi: 'Luật nền khi giao việc cho một subagent AI mới khởi tạo là gì?',
        dap: 'Bên thi hành không thấy hội thoại trước đó — họ chỉ đọc đúng cái brief được gửi. Mọi giả định còn nằm trong đầu người giao mà chưa viết ra thì với họ là không tồn tại.',
      },
      {
        hoi: '"Tham chiếu treo" trong brief là gì, và vì sao khó tự phát hiện?',
        dap: 'Là những cụm trỏ vào ngữ cảnh riêng của người viết ("như đã bàn", "file đó", "cái kia"). Khó tự thấy vì người viết đọc lại vẫn thấy rõ ràng — trong đầu họ các chỗ trống ấy đã có sẵn nội dung.',
      },
      {
        hoi: 'Brief "tự chứa" có đồng nghĩa với brief dài không?',
        dap: 'Không. Tự chứa nghĩa là mỗi thứ được nhắc tới đều CHỈ ĐƯỢC (đường dẫn file, tên hàm, số PR). Mười dòng toàn đường dẫn cụ thể còn tự chứa hơn ba trang toàn "như đã thống nhất".',
      },
    ],
  },
  {
    id: 'p6-u124-l2',
    unitId: 'p6-u124',
    language: 'typescript',
    title: 'Chọn độ tự quyết & chống ảo giác — đòi dẫn nguồn thay vì tin lời khẳng định',
    hook: 'Bạn giao một việc đổi tên biến hàng loạt cho một mô hình mạnh nhất, đắt nhất — phí tiền. Bạn giao một quyết định kiến trúc cho một mô hình rẻ nhất — phí cả tuần sửa hậu quả. Chọn sai độ tự quyết tốn tiền theo hai hướng ngược nhau.',
    theory:
      'Giao việc có hai quyết định tách rời nhau, và trộn chúng lại là nguồn của hầu hết rắc rối.\n\n**QUYẾT ĐỊNH 1 — ĐỘ TỰ QUYẾT.** Việc này cần bên thi hành TỰ QUYẾT bao nhiêu? Dự án này chia ba mức (CLAUDE.md mục 3):\n\n- **Cơ học**: lặp theo một khuôn mẫu rõ ràng, không có gì phải quyết (đổi tên hàng loạt, format, chép khuôn). Giao mức rẻ nhất.\n- **Vừa**: một tính năng/hàm rõ ràng đã có đặc tả cụ thể, ít phụ thuộc ngữ cảnh. Bên thi hành chọn chi tiết cài đặt trong ranh giới đã nêu.\n- **Phức tạp**: có quyết định kiến trúc, hoặc đụng nhiều file/luồng liên quan nhau, hoặc cần hiểu sâu ngữ cảnh trước đó. Không giao xuống mức thấp hơn.\n\nHai dấu hiệu tự động nâng một việc lên "phức tạp": nó chứa MỘT QUYẾT ĐỊNH KHÔNG THỂ ĐẢO NGƯỢC RẺ, hoặc nó CHẠM NHIỀU FILE liên quan nhau. Cả hai đều không đo bằng "việc này khó không" mà bằng "sai thì sửa có đắt không".\n\n**QUYẾT ĐỊNH 2 — BẰNG CHỨNG NGHIỆM THU.** Độc lập với mức trên. Luật chống ảo giác của dự án (CLAUDE.md mục 5) rất ngắn: **không nhận lời khẳng định, chỉ nhận dẫn nguồn.** "Đã sửa xong, chắc là chạy được" không phải một báo cáo — nó là một dự đoán. Cái được nhận là: lệnh đã chạy kèm output thật, đường dẫn file cụ thể, số dòng.\n\nCụm từ nào xuất hiện là cờ đỏ: "chắc là", "có lẽ", "về cơ bản đã xong", "should work". Chúng đánh dấu chỗ bên thi hành đang SUY LUẬN thay vì đã KIỂM — và điều đó đúng với cả người lẫn AI.\n\nÔ cuối cùng, hay bị quên nhất: **cấm mở rộng phạm vi.** Nói rõ cái gì KHÔNG được đụng tới. Bên thi hành nào cũng có xu hướng "tiện tay dọn luôn", và một PR lẽ ra sửa ba dòng bỗng đổi mười lăm file — lúc đó không ai review nổi, kể cả bạn.',
    workedExample: {
      code: `function chonDoTuQuyet(canQuyetDinhKienTruc: boolean, lapTheoKhuon: boolean, soFileCham: number): string {
  // Quyet dinh kien truc hoac cham nhieu file => sai thi sua rat dat.
  if (canQuyetDinhKienTruc || soFileCham > 3) return "phuc tap"
  if (lapTheoKhuon) return "co hoc"
  return "vua"
}

const CO_DO = ["chac la", "co le", "ve co ban da xong", "should work"]

function nghiemThuBaoCao(baoCao: string): string {
  const thap = baoCao.toLowerCase()
  const co = CO_DO.find((c) => thap.includes(c))
  if (co !== undefined) return "Tra lai: khang dinh suong (" + co + ")"
  if (!baoCao.includes("$")) return "Tra lai: thieu lenh chay kem output"
  return "Nhan"
}

console.log(chonDoTuQuyet(false, true, 1))
console.log(chonDoTuQuyet(false, false, 2))
console.log(chonDoTuQuyet(false, false, 7))
console.log(nghiemThuBaoCao("Da sua xong, chac la chay duoc"))
console.log(nghiemThuBaoCao("Da sua src/lib/phiShip.ts. $ npm test -> 42 passed"))`,
      stdinLines: [],
    },
    predict: {
      code: `function chonDoTuQuyet(canQuyetDinhKienTruc: boolean, lapTheoKhuon: boolean, soFileCham: number): string {
  if (canQuyetDinhKienTruc || soFileCham > 3) return "phuc tap"
  if (lapTheoKhuon) return "co hoc"
  return "vua"
}
console.log(chonDoTuQuyet(false, true, 9))`,
      question:
        'Việc lặp theo khuôn mẫu rõ ràng (lapTheoKhuon = true) nhưng chạm tới 9 file. Kết quả là gì?',
      choices: ['phuc tap', 'co hoc', 'vua', 'khong xac dinh'],
      answerIndex: 0,
      explain:
        'Nhánh "phuc tap" đứng trước và điều kiện `soFileCham > 3` đã đúng, nên hàm trả về ngay, chưa xét tới `lapTheoKhuon`. Đúng ý muốn: một việc dù cơ học tới đâu, khi trải trên chín file thì cái đắt không còn nằm ở từng chỗ sửa mà ở chỗ NHỚ HẾT chín chỗ đó và không bỏ sót chỗ nào.',
    },
    parsons: {
      prompt: 'Xếp lại hàm nghiệm thu báo cáo: chặn khẳng định suông trước, rồi mới đòi lệnh chạy.',
      lines: [
        'function nghiemThuBaoCao(baoCao: string): string {',
        '  const thap = baoCao.toLowerCase()',
        '  const co = CO_DO.find((c) => thap.includes(c))',
        '  if (co !== undefined) return "Tra lai: khang dinh suong (" + co + ")"',
        '  if (!baoCao.includes("$")) return "Tra lai: thieu lenh chay kem output"',
        '  return "Nhan"',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết bộ điều phối giao việc: chọn độ tự quyết, rồi nghiệm thu báo cáo nhận về.\n\n- `chonDoTuQuyet(canQuyetDinhKienTruc, lapTheoKhuon, soFileCham)`: trả `phuc tap` nếu cần quyết định kiến trúc HOẶC chạm hơn 3 file; ngược lại `co hoc` nếu lặp theo khuôn; còn lại `vua`.\n- `nghiemThuBaoCao(baoCao)`: hạ về chữ thường rồi tìm cụm cờ đỏ đầu tiên trong `CO_DO`; thấy thì trả `Tra lai: khang dinh suong (<cụm>)`. Không thấy nhưng báo cáo KHÔNG chứa ký tự `$` (dấu hiệu có lệnh chạy) thì trả `Tra lai: thieu lenh chay kem output`. Đủ cả hai thì trả `Nhan`.\n\nHai hàm này cố ý tách rời nhau: chọn ai làm là một chuyện, nhận hàng thế nào là chuyện khác.',
      starterCode: `function chonDoTuQuyet(canQuyetDinhKienTruc: boolean, lapTheoKhuon: boolean, soFileCham: number): string {
  // TODO
  return ""
}

const CO_DO = ["chac la", "co le", "ve co ban da xong", "should work"]

function nghiemThuBaoCao(baoCao: string): string {
  // TODO
  return ""
}

// ---- Đừng sửa phần dưới đây ----
console.log(chonDoTuQuyet(true, false, 1))
console.log(chonDoTuQuyet(false, true, 2))
console.log(chonDoTuQuyet(false, false, 2))
console.log(nghiemThuBaoCao("Xong roi, CHAC LA chay duoc"))
console.log(nghiemThuBaoCao("Da sua ham tinhPhiShip"))
console.log(nghiemThuBaoCao("Da sua src/lib/phiShip.ts. $ npm test -> 42 passed"))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'phuc tap',
          match: 'contains',
          hidden: false,
          label: 'Có quyết định kiến trúc → phức tạp, dù chỉ chạm 1 file',
        },
        {
          stdinLines: [],
          expected: 'Tra lai: khang dinh suong (chac la)',
          match: 'contains',
          hidden: false,
          label: 'Cờ đỏ viết hoa vẫn bị bắt (nhờ hạ chữ thường)',
        },
        {
          stdinLines: [],
          expected: 'Tra lai: thieu lenh chay kem output',
          match: 'contains',
          hidden: false,
          label: 'Không có cờ đỏ nhưng cũng không có bằng chứng chạy thật',
        },
        {
          stdinLines: [],
          expected:
            'phuc tap\nco hoc\nvua\nTra lai: khang dinh suong (chac la)\nTra lai: thieu lenh chay kem output\nNhan',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đủ sáu dòng đúng thứ tự',
        },
      ],
      hints: [
        'chonDoTuQuyet: điều kiện đầu là `canQuyetDinhKienTruc || soFileCham > 3` — dùng HOẶC, không phải VÀ.',
        'nghiemThuBaoCao: dùng `CO_DO.find(...)` (trả về cụm hoặc undefined) chứ đừng dùng `some` — vì phải ghép chính cụm tìm được vào câu trả lời.',
        'Nhớ so cờ đỏ trên bản đã `.toLowerCase()`, nhưng kiểm dấu "$" thì trên chuỗi gốc cũng được — dấu "$" không có hoa thường.',
      ],
      sampleSolution: `function chonDoTuQuyet(canQuyetDinhKienTruc: boolean, lapTheoKhuon: boolean, soFileCham: number): string {
  if (canQuyetDinhKienTruc || soFileCham > 3) return "phuc tap"
  if (lapTheoKhuon) return "co hoc"
  return "vua"
}

const CO_DO = ["chac la", "co le", "ve co ban da xong", "should work"]

function nghiemThuBaoCao(baoCao: string): string {
  const thap = baoCao.toLowerCase()
  const co = CO_DO.find((c) => thap.includes(c))
  if (co !== undefined) return "Tra lai: khang dinh suong (" + co + ")"
  if (!baoCao.includes("$")) return "Tra lai: thieu lenh chay kem output"
  return "Nhan"
}

// ---- Đừng sửa phần dưới đây ----
console.log(chonDoTuQuyet(true, false, 1))
console.log(chonDoTuQuyet(false, true, 2))
console.log(chonDoTuQuyet(false, false, 2))
console.log(nghiemThuBaoCao("Xong roi, CHAC LA chay duoc"))
console.log(nghiemThuBaoCao("Da sua ham tinhPhiShip"))
console.log(nghiemThuBaoCao("Da sua src/lib/phiShip.ts. $ npm test -> 42 passed"))`,
    },
    homework:
      'Lần tới giao việc cho AI, thêm đúng hai câu vào cuối brief: (1) "KHÔNG được sửa <danh sách file/thư mục>"; (2) "Báo xong phải kèm lệnh đã chạy và output thật, không nhận câu khẳng định suông". Sau đó đếm xem báo cáo nhận về có bao nhiêu chỗ bạn phải hỏi lại — so với những lần trước khi chưa thêm hai câu này.',
    srsCards: [
      {
        hoi: 'Hai dấu hiệu nào tự động nâng một việc lên mức "phức tạp"?',
        dap: 'Việc chứa một quyết định không thể đảo ngược rẻ, hoặc việc chạm nhiều file liên quan nhau. Thước đo là "sai thì sửa có đắt không", không phải "việc này khó không".',
      },
      {
        hoi: 'Luật chống ảo giác khi nghiệm thu báo cáo nói gì?',
        dap: 'Không nhận lời khẳng định, chỉ nhận dẫn nguồn: lệnh đã chạy kèm output thật, đường dẫn file cụ thể, số dòng. "Chắc là chạy được" là một dự đoán, không phải một báo cáo.',
      },
      {
        hoi: 'Ô nào trong brief hay bị quên nhất, và bỏ quên nó dẫn tới hậu quả gì?',
        dap: 'Ô cấm mở rộng phạm vi — nói rõ cái gì KHÔNG được đụng tới. Thiếu nó thì bên thi hành "tiện tay dọn luôn", một thay đổi ba dòng phình thành mười lăm file và không ai review nổi.',
      },
    ],
  },
]
