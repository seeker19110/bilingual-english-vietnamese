// lessons/p6u20.ts — P6-U20: HƯỚNG KIẾN TRÚC, chặng S1 — vẽ để nghĩ (`architecture-s1-m3`)
// và đọc hệ thống người khác (`architecture-s1-m4`).
//
// Hai bài này là phần "bằng chứng" của chặng S1: dự án cuối chặng đòi một sơ đồ C4 hai tầng
// và một danh sách vòng phụ thuộc LẤY BẰNG CÔNG CỤ, không bằng đọc tay. Nên l1 dạy cách bắt
// một bản đồ tự khai báo nó còn khớp code hay không, còn l2 dạy đúng hai phép đo mà
// `npm run codemap` cung cấp: điểm nóng (fan-in) và vòng phụ thuộc.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U20_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u20-l1',
    unitId: 'p6-u20',
    language: 'typescript',
    title: 'Vẽ để nghĩ — bản đồ phải trả lời được một câu hỏi',
    hook: 'Trong tài liệu công ty có một sơ đồ kiến trúc rất đẹp: mười hai hộp, mũi tên cong, bốn màu. Bạn hỏi "vậy khi khách bấm Thanh toán thì đi qua những hộp nào?" — không ai chỉ được. Sơ đồ ấy vẽ từ 2023, hai hộp trong đó đã bị xoá khỏi code, và một luồng quan trọng thì không có trên hình.',
    theory:
      'Sơ đồ kiến trúc có hai loại. Loại thứ nhất để TRANG TRÍ slide — vẽ xong là chết. Loại thứ hai để NGHĨ và để TRẢ LỜI CÂU HỎI — nó sống được vì có người dùng nó hằng tuần. Luật đơn giản để không rơi vào loại thứ nhất: trước khi vẽ, viết ra CÂU HỎI mà hình này phải trả lời. Không viết được câu hỏi thì đừng vẽ.\n\nMÔ HÌNH C4 (Simon Brown) chia bản đồ theo mức phóng to, mỗi mức trả lời một loại câu hỏi khác nhau:\n\n· Tầng 1 — BỐI CẢNH: hệ thống của ta là một hộp; xung quanh là người dùng và hệ thống ngoài. Trả lời: "ta nói chuyện với ai bên ngoài?"\n· Tầng 2 — HỘP LỚN: bên trong hệ thống có những ứng dụng/kho dữ liệu nào (web app, server API, Postgres, Redis). Trả lời: "cái gì chạy ở đâu, giao tiếp bằng giao thức gì?"\n· Tầng 3 — THÀNH PHẦN: bên trong MỘT hộp lớn có những module nào. Trả lời: "trách nhiệm nằm ở đâu?"\n· Tầng 4 — mã nguồn: gần như không bao giờ nên vẽ, vì code đã là bản đồ chính xác nhất của chính nó rồi.\n\nDừng ở tầng đủ dùng. Đa số đội chỉ cần tầng 1 và 2, cộng thêm tầng 3 cho đúng một hộp đang gây tranh cãi.\n\nSƠ ĐỒ TUẦN TỰ chỉ vẽ cho luồng CÓ TRANH CÃI — thường là luồng có tiền, có việc chạy song song, hoặc có nhiều ca lỗi. Vẽ sơ đồ tuần tự cho luồng "đăng nhập bằng email" là phí thời gian; vẽ cho luồng "webhook thanh toán về hai lần thì sao" thì đáng, vì chính lúc vẽ bạn sẽ phát hiện ra mình chưa quyết định gì cho ca đó.\n\nBA BỆNH của bản đồ, và cả ba đều máy phát hiện được nếu bạn chịu viết bản đồ ra dưới dạng DỮ LIỆU thay vì dưới dạng ảnh:\n\n① HỘP MA — sơ đồ có mũi tên trỏ tới một hộp không tồn tại (đã đổi tên, đã xoá). Bản đồ đang nói dối, và người mới sẽ đi tìm mất nửa buổi.\n② HỘP MỒ CÔI — một hộp không gọi ai và không ai gọi. Hoặc bạn quên vẽ mũi tên, hoặc thứ đó thật sự đã chết trong hệ thống. Cả hai đều đáng biết.\n③ NHẢY TẦNG — một hộp ở tầng bối cảnh trỏ thẳng vào một thành phần bên trong. Đó là dấu hiệu ranh giới bị xuyên qua: có ai đó đang gọi tắt vào ruột của module khác.\n\nĐây là lý do bài Make dưới đây bắt bạn viết máy soát bản đồ. Một bản đồ vẽ bằng ảnh thì không kiểm được bằng máy, nên nó cứ lệch dần khỏi code mà không ai biết. Một bản đồ viết bằng dữ liệu (hoặc bằng cú pháp văn bản như Mermaid) thì đặt được vào CI, và ngày nó lệch là ngày CI đỏ.',
    workedExample: {
      code: `type TangHop = "boiCanh" | "hopLon" | "thanhPhan"

interface Hop {
  ten: string
  tang: TangHop
  goi: string[]
}

const banDo: Hop[] = [
  { ten: "nguoiHoc", tang: "boiCanh", goi: ["webApp"] },
  { ten: "webApp", tang: "hopLon", goi: ["apiServer", "cdnCu"] }, // cdnCu đã bị xoá khỏi code
  { ten: "apiServer", tang: "hopLon", goi: [] },
  { ten: "baoCaoTuan", tang: "hopLon", goi: [] },                 // không ai gọi -> mồ côi
]

const coThat = new Set(banDo.map((h) => h.ten))
const duocGoi = new Set(banDo.flatMap((h) => h.goi))

for (const h of banDo) {
  for (const ten of h.goi) {
    // ① hộp ma: bản đồ trỏ tới thứ không tồn tại
    if (!coThat.has(ten)) console.log("Ban do noi doi: " + h.ten + " goi " + ten)
  }
  // ② hộp mồ côi: không gọi ai và không ai gọi
  if (h.goi.length === 0 && !duocGoi.has(h.ten)) console.log("Hop mo coi: " + h.ten)
}
// Đọc kết quả: bản đồ này sai HAI chỗ mà nhìn bằng mắt rất khó thấy — đúng loại lỗi
// nên giao cho máy, y như dự án DHCB giao việc dò vòng phụ thuộc cho codemap.`,
      stdinLines: [],
    },
    predict: {
      code: `interface Hop {
  ten: string
  goi: string[]
}

const banDo: Hop[] = [
  { ten: "webApp", goi: ["apiServer", "cdnCu"] },
  { ten: "apiServer", goi: [] },
]

const coThat = new Set(banDo.map((h) => h.ten))
const ma = banDo.flatMap((h) => h.goi).filter((ten) => !coThat.has(ten))

console.log("Hop ma: " + ma.length + " (" + ma.join(", ") + ")")`,
      question: 'Đoạn này in ra gì?',
      choices: [
        'Hop ma: 1 (cdnCu)',
        'Hop ma: 2 (apiServer, cdnCu)',
        'Hop ma: 0 ()',
        'Hop ma: 1 (apiServer)',
      ],
      answerIndex: 0,
      explain:
        'Tập tên có thật là {webApp, apiServer}. Danh sách mọi lời gọi là ["apiServer", "cdnCu"], lọc bỏ tên có thật thì chỉ còn "cdnCu" — in ra "Hop ma: 1 (cdnCu)". Ý cần nhớ: "cdnCu" là một hộp đã bị xoá khỏi code nhưng vẫn còn trên bản đồ, và không ai nhận ra bằng mắt vì hình vẽ trông vẫn hợp lý. Bản đồ viết dưới dạng dữ liệu thì máy tìm ra loại lỗi này trong một phần nghìn giây; bản đồ vẽ dưới dạng ảnh thì phải chờ một người mới đi lạc mới lộ.',
    },
    parsons: {
      prompt: 'Xếp lại đoạn dựng hai tập tra cứu rồi tìm hộp ma của một bản đồ.',
      lines: [
        'const coThat = new Set(banDo.map((h) => h.ten))',
        'const canhBao: string[] = []',
        'for (const h of banDo) {',
        '  for (const ten of h.goi) {',
        '    if (coThat.has(ten)) continue',
        '    canhBao.push("Ban do noi doi: " + h.ten + " goi " + ten)',
        '  }',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm kiemBanDo(banDo) — máy soát bản đồ kiến trúc, thứ giữ cho sơ đồ không lệch khỏi code.\n\nMỗi hộp là { ten: string, tang: TangHop, goi: string[] } với TangHop là "boiCanh" | "hopLon" | "thanhPhan".\n\nHàm gom các cảnh báo rồi trả về MỘT chuỗi:\n\n  ① Bản đồ rỗng → "Chua co ban do".\n  ② HỘP MA: một hộp gọi tên không có trong bản đồ → "Ban do noi doi: nguon goi ten".\n  ③ HỘP MỒ CÔI: hộp không gọi ai VÀ không ai gọi nó → "Hop mo coi: ten".\n  ④ NHẢY TẦNG: hộp tầng "boiCanh" gọi thẳng một hộp tầng "thanhPhan" → "Nhay tang: nguon -> dich". (Chỉ xét lời gọi tới hộp CÓ THẬT.)\n  ⑤ Không có cảnh báo nào → "Ban do dung duoc".\n\nThứ tự trong chuỗi kết quả: hết nhóm ② rồi tới nhóm ③ rồi tới nhóm ④; trong mỗi nhóm giữ nguyên thứ tự duyệt bản đồ. Nối các cảnh báo bằng " | " (dấu cách, gạch đứng, dấu cách).\n\nVí dụ: "Ban do noi doi: webApp goi cdnCu | Hop mo coi: baoCaoTuan".\n\nGiữ nguyên phần in kết quả ở cuối.',
      starterCode: `type TangHop = "boiCanh" | "hopLon" | "thanhPhan"

interface Hop {
  ten: string
  tang: TangHop
  goi: string[]
}

function kiemBanDo(banDo: Hop[]): string {
  // TODO: viết theo 5 luật trong đề
  return ""
}

// ---- Đừng sửa phần dưới đây ----
const rong: Hop[] = []
const lech: Hop[] = [
  { ten: "nguoiHoc", tang: "boiCanh", goi: ["webApp"] },
  { ten: "webApp", tang: "hopLon", goi: ["apiServer", "cdnCu"] },
  { ten: "apiServer", tang: "hopLon", goi: [] },
  { ten: "baoCaoTuan", tang: "hopLon", goi: [] },
]
const sach: Hop[] = [
  { ten: "nguoiHoc", tang: "boiCanh", goi: ["webApp"] },
  { ten: "webApp", tang: "hopLon", goi: ["apiServer"] },
  { ten: "apiServer", tang: "hopLon", goi: ["boChamBai"] },
  { ten: "boChamBai", tang: "thanhPhan", goi: [] },
]
const xuyenTang: Hop[] = [
  { ten: "nguoiHoc", tang: "boiCanh", goi: ["boChamBai"] },
  { ten: "webApp", tang: "hopLon", goi: ["boChamBai"] },
  { ten: "boChamBai", tang: "thanhPhan", goi: [] },
]

console.log("Rong:", kiemBanDo(rong))
console.log("Lech:", kiemBanDo(lech))
console.log("Sach:", kiemBanDo(sach))
console.log("Xuyen tang:", kiemBanDo(xuyenTang))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Rong: Chua co ban do',
          match: 'contains',
          hidden: false,
          label: 'Chưa có bản đồ — không được kết luận "dùng được"',
        },
        {
          stdinLines: [],
          expected: 'Lech: Ban do noi doi: webApp goi cdnCu | Hop mo coi: baoCaoTuan',
          match: 'contains',
          hidden: false,
          label: 'Hộp ma trước, hộp mồ côi sau — đúng thứ tự nhóm trong đề',
        },
        {
          stdinLines: [],
          expected: 'Sach: Ban do dung duoc',
          match: 'contains',
          hidden: false,
          label: 'boChamBai được apiServer gọi nên không mồ côi, dù bản thân nó không gọi ai',
        },
        {
          stdinLines: [],
          expected: 'Xuyen tang: Nhay tang: nguoiHoc -> boChamBai',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — chỉ hộp boiCanh gọi thẳng thanhPhan mới là nhảy tầng, hopLon thì không',
        },
      ],
      hints: [
        'Dựng hai tập trước khi duyệt: `const coThat = new Set(banDo.map((h) => h.ten))` và `const duocGoi = new Set(banDo.flatMap((h) => h.goi))`. Có hai tập này thì mọi luật còn lại chỉ là một phép kiểm nhỏ.',
        'Vì thứ tự kết quả gom theo NHÓM chứ không theo hộp, hãy dùng ba mảng riêng — `ma`, `moCoi`, `nhayTang` — rồi cuối hàm mới nối lại theo thứ tự đó.',
        'Mồ côi là điều kiện KÉP: `h.goi.length === 0 && !duocGoi.has(h.ten)`. Một hộp lá (không gọi ai) mà có người gọi thì hoàn toàn bình thường.',
        'Nhảy tầng cần tra tầng của đích, nên cần thêm bảng `new Map<string, TangHop>(banDo.map((h) => [h.ten, h.tang]))`. Nhớ bỏ qua đích không có thật — nó đã bị báo ở nhóm hộp ma rồi, báo lại hai lần là nhiễu.',
      ],
      sampleSolution: `type TangHop = "boiCanh" | "hopLon" | "thanhPhan"

interface Hop {
  ten: string
  tang: TangHop
  goi: string[]
}

function kiemBanDo(banDo: Hop[]): string {
  // ① Chưa có bản đồ thì không kết luận
  if (banDo.length === 0) return "Chua co ban do"

  const coThat = new Set(banDo.map((h) => h.ten))
  const duocGoi = new Set(banDo.flatMap((h) => h.goi))
  const tangCua = new Map<string, TangHop>(banDo.map((h) => [h.ten, h.tang]))

  // Ba mảng riêng vì kết quả gom theo NHÓM, không theo thứ tự hộp
  const ma: string[] = []
  const moCoi: string[] = []
  const nhayTang: string[] = []

  for (const h of banDo) {
    for (const ten of h.goi) {
      // ② Bản đồ trỏ tới hộp không tồn tại
      if (!coThat.has(ten)) ma.push("Ban do noi doi: " + h.ten + " goi " + ten)
    }
  }
  for (const h of banDo) {
    // ③ Điều kiện KÉP: hộp lá có người gọi thì vẫn bình thường
    if (h.goi.length === 0 && !duocGoi.has(h.ten)) moCoi.push("Hop mo coi: " + h.ten)
  }
  for (const h of banDo) {
    if (h.tang !== "boiCanh") continue
    for (const ten of h.goi) {
      // ④ Đích không có thật đã báo ở nhóm ②, không báo lại lần nữa
      if (tangCua.get(ten) === "thanhPhan") nhayTang.push("Nhay tang: " + h.ten + " -> " + ten)
    }
  }

  const canhBao = [...ma, ...moCoi, ...nhayTang]
  // ⑤ Sạch thì nói thẳng là dùng được — báo cáo im lặng khiến người đọc tưởng máy hỏng
  if (canhBao.length === 0) return "Ban do dung duoc"
  return canhBao.join(" | ")
}

// ---- Đừng sửa phần dưới đây ----
const rong: Hop[] = []
const lech: Hop[] = [
  { ten: "nguoiHoc", tang: "boiCanh", goi: ["webApp"] },
  { ten: "webApp", tang: "hopLon", goi: ["apiServer", "cdnCu"] },
  { ten: "apiServer", tang: "hopLon", goi: [] },
  { ten: "baoCaoTuan", tang: "hopLon", goi: [] },
]
const sach: Hop[] = [
  { ten: "nguoiHoc", tang: "boiCanh", goi: ["webApp"] },
  { ten: "webApp", tang: "hopLon", goi: ["apiServer"] },
  { ten: "apiServer", tang: "hopLon", goi: ["boChamBai"] },
  { ten: "boChamBai", tang: "thanhPhan", goi: [] },
]
const xuyenTang: Hop[] = [
  { ten: "nguoiHoc", tang: "boiCanh", goi: ["boChamBai"] },
  { ten: "webApp", tang: "hopLon", goi: ["boChamBai"] },
  { ten: "boChamBai", tang: "thanhPhan", goi: [] },
]

console.log("Rong:", kiemBanDo(rong))
console.log("Lech:", kiemBanDo(lech))
console.log("Sach:", kiemBanDo(sach))
console.log("Xuyen tang:", kiemBanDo(xuyenTang))`,
    },
    homework:
      'Vẽ bản đồ tầng 2 (hộp lớn) của một hệ thống bạn đang dùng hằng ngày — có thể là chính DHCB: `apps/dhcb`, `apps/hub`, `apps/server`, Postgres, Redis, R2, các API AI bên ngoài. Trước khi vẽ, viết ra một câu hỏi cụ thể mà hình này phải trả lời, ví dụ "một lần luyện nói đi qua những hộp nào và tốn tiền ở hộp nào?". Vẽ xong, đối chiếu từng mũi tên với code thật (`apps/server/src/routes.ts` là chỗ dễ đối chiếu nhất) và đánh dấu mũi tên nào bạn chỉ đoán chứ chưa kiểm.',
    srsCards: [
      {
        hoi: 'Luật để một sơ đồ kiến trúc không biến thành đồ trang trí là gì?',
        dap: 'Trước khi vẽ phải viết ra CÂU HỎI cụ thể mà hình đó phải trả lời. Không viết được câu hỏi thì đừng vẽ, vì sẽ không có ai dùng nó và nó sẽ lệch khỏi code mà không ai biết.',
      },
      {
        hoi: 'Bốn tầng của mô hình C4 lần lượt trả lời điều gì?',
        dap: 'Bối cảnh: ta nói chuyện với ai bên ngoài. Hộp lớn: cái gì chạy ở đâu, giao tiếp bằng gì. Thành phần: trách nhiệm nằm ở module nào. Tầng mã nguồn gần như không nên vẽ vì code đã là bản đồ chính xác nhất của chính nó.',
      },
      {
        hoi: 'Nên vẽ sơ đồ tuần tự cho luồng nào?',
        dap: 'Chỉ cho luồng có tranh cãi — luồng dính tiền, chạy song song hoặc nhiều ca lỗi. Chính lúc vẽ bạn sẽ phát hiện mình chưa quyết định gì cho một ca lỗi nào đó; luồng đơn giản thì vẽ chỉ tốn thời gian.',
      },
      {
        hoi: 'Vì sao nên viết bản đồ dưới dạng dữ liệu hoặc văn bản thay vì ảnh?',
        dap: 'Vì dạng dữ liệu thì máy kiểm được và đặt được vào CI: hộp ma, hộp mồ côi, nhảy tầng đều tự lộ. Bản đồ dạng ảnh cứ lệch dần khỏi code cho tới khi có người mới đi lạc mới phát hiện.',
      },
    ],
  },
  {
    id: 'p6-u20-l2',
    unitId: 'p6-u20',
    language: 'typescript',
    title: 'Đọc hệ thống người khác — điểm nóng và vòng phụ thuộc',
    hook: 'Ngày đầu nhận bàn giao một dự án 400 file. Không có tài liệu, người viết đã nghỉ. Bạn có hai ngày trước khi phải sửa lỗi đầu tiên. Đọc từ file đầu tiên tới file cuối cùng là chắc chắn thất bại — nhưng có hai phép đo, chạy trong vài giây, cho bạn biết nên đọc file nào trước và nên sợ chỗ nào.',
    theory:
      'Khi tiếp quản hệ thống người khác, thứ bạn cần không phải là hiểu hết, mà là biết ĐỌC CÁI GÌ TRƯỚC và SỢ CHỖ NÀO. Ba việc dưới đây làm được trong một buổi.\n\n① LẦN THEO MỘT LUỒNG, từ đầu vào tới cơ sở dữ liệu. Chọn đúng một thao tác quan trọng (ví dụ "người dùng bấm Lưu bài viết"), rồi đi từng chặng: cái nút → hàm gọi API → route ở server → hàm nghiệp vụ → câu lệnh SQL. Một luồng đi trọn dạy bạn nhiều hơn mười file đọc rời rạc, vì nó cho bạn thấy các quy ước THẬT của dự án: xác thực làm ở đâu, lỗi chuyển thành cái gì, dữ liệu được kiểm ở tầng nào.\n\n② TÌM ĐIỂM NÓNG bằng FAN-IN — số file import một file. File có fan-in cao nhất là rủi ro cao nhất, vì sửa nó là động vào mọi thứ đang gọi nó. Đây thường là file tiện ích dùng chung, lớp kết nối cơ sở dữ liệu, hoặc một kiểu dữ liệu trung tâm. Đừng nhầm fan-in cao với "code tệ": một `pgPool` có fan-in cao là chuyện tự nhiên. Con số ấy chỉ nói một điều — MỌI thay đổi ở đây đều phải cẩn thận và phải có test canh. Trong dự án DHCB, phép đo này có sẵn: `npm run codemap -- hotspots`, và `npm run codemap -- impact <file>` cho biết sửa một file thì gãy tới đâu.\n\n③ DÒ VÒNG PHỤ THUỘC. Vòng là chỗ hệ thống mất khả năng chia nhỏ: A cần B, B (qua vài chặng) lại cần A. Bạn không thể hiểu, test hay tái dùng riêng bất cứ mắt xích nào trong vòng.\n\nCÁCH DÒ VÒNG mà bài Make dưới đây bắt bạn viết là thuật toán BÓC LÁ, dễ hiểu và tất định: lặp đi lặp lại việc gỡ bỏ mọi node KHÔNG CÒN phụ thuộc vào ai (node lá). Mỗi lần gỡ, một số node khác trở thành lá. Nếu tới lúc không gỡ được gì nữa mà vẫn còn node sót lại, thì phần sót lại chính là chỗ có vòng. Đây cũng là ý tưởng của sắp xếp tô-pô, và của cách một trình đóng gói quyết định thứ tự nạp module.\n\nCUỐI CÙNG, NHẬN DIỆN RANH GIỚI BỊ RÒ. Ba dấu hiệu đọc code là thấy: một module đọc thẳng vào cấu trúc dữ liệu bên trong của module khác thay vì gọi hàm của nó; một cái tên rất chung ("utils", "helpers", "common") mà bên trong chứa cả luật nghiệp vụ — đó là nơi luật đi lạc và không ai canh; và mã "biết quá nhiều", ví dụ một component giao diện tự viết câu SQL. Cả ba đều là ứng viên đầu tiên cho việc cắt lại ranh giới ở dự án cuối chặng.\n\nMột lời khuyên về thái độ: hệ thống người khác trông lộn xộn thường là vì bạn chưa biết những ràng buộc mà người viết phải chịu. Ghi nhận xét của bạn ra giấy, nhưng đừng vội kết luận "code rác" trước khi lần được một luồng trọn vẹn.',
    workedExample: {
      code: `// Bản đồ phụ thuộc dạng cạnh: { tu, den } nghĩa là file "tu" NHẬP file "den".
interface Canh {
  tu: string
  den: string
}

const canh: Canh[] = [
  { tu: "pageA", den: "pgPool" },
  { tu: "pageB", den: "pgPool" },
  { tu: "apiC", den: "pgPool" },
  { tu: "apiC", den: "pageA" },
]

// Fan-in: bao nhiêu file NHẬP file này. Cao nhất = điểm nóng = rủi ro cao nhất.
const fanIn = new Map<string, number>()
for (const c of canh) fanIn.set(c.den, (fanIn.get(c.den) ?? 0) + 1)

let nong = ""
let soNong = -1
for (const [ten, so] of [...fanIn.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
  if (so > soNong) {
    nong = ten
    soNong = so
  }
}
console.log("Diem nong: " + nong + " (" + soNong + " file nhap)")
// Đọc kết quả: pgPool bị 3 file nhập. Điều đó KHÔNG có nghĩa pgPool viết tệ — nó
// chỉ có nghĩa mọi thay đổi ở đó đều phải có test canh, vì gãy là gãy cả ba chỗ.`,
      stdinLines: [],
    },
    predict: {
      code: `interface Canh {
  tu: string
  den: string
}

const canh: Canh[] = [
  { tu: "pageA", den: "pgPool" },
  { tu: "pageB", den: "pgPool" },
  { tu: "apiC", den: "pageA" },
]

const fanIn = new Map<string, number>()
for (const c of canh) fanIn.set(c.den, (fanIn.get(c.den) ?? 0) + 1)

console.log("pgPool=" + (fanIn.get("pgPool") ?? 0) + " apiC=" + (fanIn.get("apiC") ?? 0))`,
      question: 'Đoạn này in ra gì?',
      choices: ['pgPool=2 apiC=0', 'pgPool=2 apiC=1', 'pgPool=3 apiC=0', 'pgPool=2 apiC=undefined'],
      answerIndex: 0,
      explain:
        'Hai cạnh có `den` là "pgPool" nên fan-in của nó là 2. Không cạnh nào trỏ TỚI "apiC" — apiC chỉ đi nhập người khác — nên `fanIn.get("apiC")` là undefined, và toán tử `??` đổi nó thành 0, ra "pgPool=2 apiC=0". Hai chỗ đáng nhớ: fan-in đếm chiều ĐI VÀO chứ không phải chiều đi ra, và một file chưa từng bị ai nhập phải cho ra số 0 chứ không phải chữ undefined lọt lên báo cáo.',
    },
    parsons: {
      prompt: 'Xếp lại một vòng bóc lá: gỡ mọi node không còn phụ thuộc vào ai.',
      lines: [
        'const la = [...conLai].filter((ten) => {',
        '  const ra = phuThuoc.get(ten) ?? []',
        '  return ra.every((d) => !conLai.has(d))',
        '})',
        'if (la.length === 0) break',
        'for (const ten of la) {',
        '  conLai.delete(ten)',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm docHeThong(canh) — hai phép đo đầu tiên khi tiếp quản một hệ thống lạ.\n\nMỗi cạnh là { tu: string, den: string }, nghĩa là file "tu" NHẬP file "den".\n\nHàm trả về MỘT chuỗi gồm hai phần nối bằng " | ":\n\n  ① ĐIỂM NÓNG: file có fan-in (số file nhập nó) lớn nhất, viết "Diem nong: ten (n file nhap)". Nhiều file cùng fan-in lớn nhất thì lấy tên nhỏ nhất theo A→Z.\n  ② VÒNG PHỤ THUỘC: dùng cách bóc lá — lặp việc gỡ mọi file không còn nhập file nào chưa bị gỡ; khi không gỡ được nữa mà vẫn còn file sót lại thì có vòng. Viết "Co vong phu thuoc" hoặc "Khong co vong".\n\nDanh sách cạnh rỗng → trả "Chua co phu thuoc nao" (không có phần nào khác).\n\nVí dụ: "Diem nong: pgPool (3 file nhap) | Khong co vong".\n\nGiữ nguyên phần in kết quả ở cuối.',
      starterCode: `interface Canh {
  tu: string
  den: string
}

function docHeThong(canh: Canh[]): string {
  // TODO: viết theo 2 phép đo trong đề
  return ""
}

// ---- Đừng sửa phần dưới đây ----
const rong: Canh[] = []
const lanh: Canh[] = [
  { tu: "pageA", den: "pgPool" },
  { tu: "pageB", den: "pgPool" },
  { tu: "apiC", den: "pgPool" },
  { tu: "apiC", den: "pageA" },
]
const coVong: Canh[] = [
  { tu: "donHang", den: "kho" },
  { tu: "kho", den: "vanChuyen" },
  { tu: "vanChuyen", den: "donHang" },
  { tu: "giaoDien", den: "donHang" },
]
const hoaDiem: Canh[] = [
  { tu: "x", den: "beta" },
  { tu: "y", den: "alpha" },
]

console.log("Rong:", docHeThong(rong))
console.log("Lanh:", docHeThong(lanh))
console.log("Vong:", docHeThong(coVong))
console.log("Hoa:", docHeThong(hoaDiem))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Rong: Chua co phu thuoc nao',
          match: 'contains',
          hidden: false,
          label: 'Không có cạnh nào — không có điểm nóng để nói',
        },
        {
          stdinLines: [],
          expected: 'Lanh: Diem nong: pgPool (3 file nhap) | Khong co vong',
          match: 'contains',
          hidden: false,
          label: 'pgPool bị 3 file nhập; đồ thị bóc lá được sạch nên không có vòng',
        },
        {
          stdinLines: [],
          expected: 'Vong: Diem nong: donHang (2 file nhap) | Co vong phu thuoc',
          match: 'contains',
          hidden: false,
          label: 'donHang → kho → vanChuyen → donHang: bóc lá không gỡ hết được',
        },
        {
          stdinLines: [],
          expected: 'Hoa: Diem nong: alpha (1 file nhap) | Khong co vong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — hoà fan-in thì lấy tên A→Z, không lấy tên gặp trước',
        },
      ],
      hints: [
        'Fan-in đếm theo trường `den`: `for (const c of canh) fanIn.set(c.den, (fanIn.get(c.den) ?? 0) + 1)`. Toán tử `??` lo giúp bạn lần đếm đầu tiên.',
        'Muốn hoà thì lấy tên A→Z, cách gọn nhất là sắp các cặp [tên, số] theo tên trước rồi mới quét tìm số lớn nhất bằng phép so sánh CHẶT (`so > soNong`) — như vậy cái gặp trước theo bảng chữ cái sẽ thắng.',
        'Bóc lá cần hai cấu trúc: `conLai` là Set mọi tên xuất hiện (cả tu lẫn den), và `phuThuoc` là Map từ tên tới danh sách tên nó nhập. Một file chưa nhập ai thì tra ra mảng rỗng.',
        'Vòng bóc lá: mỗi lượt lọc ra các tên mà MỌI đích của nó đã bị gỡ (`ra.every((d) => !conLai.has(d))`); không lọc được cái nào thì `break`. Sau vòng lặp, `conLai.size > 0` nghĩa là có vòng.',
      ],
      sampleSolution: `interface Canh {
  tu: string
  den: string
}

function docHeThong(canh: Canh[]): string {
  // Chưa có cạnh nào thì không có gì để đo
  if (canh.length === 0) return "Chua co phu thuoc nao"

  // ① Fan-in: đếm theo ĐÍCH, tức số file NHẬP file đó
  const fanIn = new Map<string, number>()
  for (const c of canh) fanIn.set(c.den, (fanIn.get(c.den) ?? 0) + 1)

  // Sắp theo tên trước rồi so CHẶT: hoà điểm thì tên A→Z thắng, kết quả tất định
  let nong = ""
  let soNong = -1
  const theoTen = [...fanIn.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))
  for (const [ten, so] of theoTen) {
    if (so > soNong) {
      nong = ten
      soNong = so
    }
  }

  // ② Bóc lá: gỡ dần các file không còn nhập ai; sót lại nghĩa là có vòng
  const conLai = new Set<string>()
  const phuThuoc = new Map<string, string[]>()
  for (const c of canh) {
    conLai.add(c.tu)
    conLai.add(c.den)
    phuThuoc.set(c.tu, [...(phuThuoc.get(c.tu) ?? []), c.den])
  }
  for (;;) {
    const la = [...conLai].filter((ten) => {
      const ra = phuThuoc.get(ten) ?? []
      return ra.every((d) => !conLai.has(d))
    })
    if (la.length === 0) break
    for (const ten of la) conLai.delete(ten)
  }

  const ketVong = conLai.size > 0 ? "Co vong phu thuoc" : "Khong co vong"
  return "Diem nong: " + nong + " (" + soNong + " file nhap) | " + ketVong
}

// ---- Đừng sửa phần dưới đây ----
const rong: Canh[] = []
const lanh: Canh[] = [
  { tu: "pageA", den: "pgPool" },
  { tu: "pageB", den: "pgPool" },
  { tu: "apiC", den: "pgPool" },
  { tu: "apiC", den: "pageA" },
]
const coVong: Canh[] = [
  { tu: "donHang", den: "kho" },
  { tu: "kho", den: "vanChuyen" },
  { tu: "vanChuyen", den: "donHang" },
  { tu: "giaoDien", den: "donHang" },
]
const hoaDiem: Canh[] = [
  { tu: "x", den: "beta" },
  { tu: "y", den: "alpha" },
]

console.log("Rong:", docHeThong(rong))
console.log("Lanh:", docHeThong(lanh))
console.log("Vong:", docHeThong(coVong))
console.log("Hoa:", docHeThong(hoaDiem))`,
    },
    homework:
      'Chạy `npm run codemap -- hotspots` trên repo DHCB, lấy ba file đầu bảng. Với mỗi file, chạy tiếp `npm run codemap -- impact <file>` và ghi lại số chỗ bị ảnh hưởng. Sau đó chọn MỘT luồng có thật (gợi ý: một lần chấm bài viết) và lần theo trọn vẹn từ nút bấm trong `apps/dhcb/src` tới câu lệnh SQL, viết ra 5 chặng đó kèm đường dẫn file. Cuối cùng tự trả lời: trong ba file điểm nóng, file nào bạn thấy đang chứa LUẬT NGHIỆP VỤ lẽ ra phải nằm ở chỗ khác?',
    srsCards: [
      {
        hoi: 'Fan-in của một file là gì và nó cảnh báo điều gì?',
        dap: 'Là số file import file đó. Fan-in cao nghĩa là rủi ro cao — mọi thay đổi ở đây đều lan rộng nên phải có test canh. Nó không đồng nghĩa với code tệ: lớp kết nối cơ sở dữ liệu có fan-in cao là chuyện tự nhiên.',
      },
      {
        hoi: 'Thuật toán bóc lá dò vòng phụ thuộc hoạt động thế nào?',
        dap: 'Lặp việc gỡ mọi node không còn phụ thuộc vào node nào chưa bị gỡ. Mỗi lượt gỡ lại sinh ra node lá mới. Khi không gỡ được gì nữa mà vẫn còn node sót lại thì phần sót đó chính là vòng.',
      },
      {
        hoi: 'Việc đầu tiên nên làm khi tiếp quản một dự án lạ 400 file là gì?',
        dap: 'Lần theo trọn MỘT luồng có thật từ đầu vào tới cơ sở dữ liệu. Một luồng đi trọn dạy nhiều hơn mười file đọc rời rạc, vì nó lộ ra quy ước thật của dự án: xác thực ở đâu, lỗi thành cái gì, dữ liệu kiểm ở tầng nào.',
      },
      {
        hoi: 'Ba dấu hiệu đọc code là thấy ranh giới module đang bị rò rỉ?',
        dap: 'Một module đọc thẳng cấu trúc dữ liệu bên trong module khác; thư mục tên rất chung (utils, common) mà chứa luật nghiệp vụ; và mã biết quá nhiều, ví dụ component giao diện tự viết câu SQL.',
      },
    ],
  },
]
