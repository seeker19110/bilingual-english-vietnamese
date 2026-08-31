// lessons/p6u119.ts — P6-U119: HƯỚNG KIẾN TRÚC, chặng S2 "Hợp đồng & mô hình miền" —
// GỘP hai module cuối: `architecture-s2-m3` (Tiến hoá không phá) + `architecture-s2-m4`
// (Dữ liệu là phần khó đổi nhất).
//
// Gộp vì hai module trả lời cùng MỘT câu hỏi từ hai phía: khi hợp đồng đã có người dùng thật,
// đổi nó thế nào cho không gãy (m3), và vì sao dữ liệu là chỗ đắt nhất khi đổi sai (m4).
// Đúng tiền lệ web-s1/backend-s2 gộp module khi hợp lý.
//
// Dùng làn `typescript`, mô phỏng bằng hàm thuần tất định — không hạ tầng thật.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U119_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u119-l1',
    unitId: 'p6-u119',
    language: 'typescript',
    title: 'Mở rộng rồi mới thu hẹp — đổi schema mà không làm gãy bản đang chạy',
    hook: 'Bạn đổi tên cột `ten` thành `hoTen` trong một lệnh migration. Migration chạy 3 giây, và trong 3 giây đó bản app cũ vẫn đang chạy trên điện thoại của 4.000 người — tất cả cùng lúc đọc một cột vừa biến mất. Đổi tên là thao tác PHÁ VỠ, dù nó chỉ là "đổi tên".',
    theory:
      'Lúc chưa có ai dùng, đổi hợp đồng dữ liệu là chuyện của một dòng lệnh. Từ lúc có người dùng thật, mọi thay đổi phải trả lời được câu hỏi: TRONG KHOẢNG THỜI GIAN CHUYỂN TIẾP, bản cũ và bản mới cùng chạy — cả hai có sống được không?\n\nPhân loại thay đổi:\n\n- **AN TOÀN (tương thích ngược):** thêm trường TUỲ CHỌN mới; thêm giá trị mới vào một trường mà bên đọc đã có nhánh mặc định; nới lỏng ràng buộc.\n- **PHÁ VỠ:** xoá trường; đổi tên trường (= xoá + thêm); đổi kiểu; đổi Ý NGHĨA của trường mà giữ nguyên tên (nguy hiểm nhất, vì không công cụ nào phát hiện được — ví dụ trường `giaBan` từ "chưa gồm thuế" đổi thành "đã gồm thuế").\n- **BẪY ÍT AI NGỜ:** thêm trường BẮT BUỘC cũng là phá vỡ, vì mọi bên ghi cũ đang gửi dữ liệu thiếu trường đó.\n\nKhuôn xử lý chuẩn cho một thay đổi phá vỡ là MỞ RỘNG RỒI THU HẸP (expand and contract), bốn bước, mỗi bước triển khai riêng và có thể dừng lại:\n\n1. **MỞ RỘNG:** thêm cái mới, GIỮ NGUYÊN cái cũ. Bên ghi ghi vào CẢ HAI, bên đọc vẫn đọc cái cũ. Hợp đồng lúc này rộng ra, chưa ai bị ảnh hưởng.\n2. **BÙ DỮ LIỆU (backfill):** chép dữ liệu lịch sử từ trường cũ sang trường mới, chạy nền theo từng lô nhỏ để không khoá bảng.\n3. **CHUYỂN ĐỌC:** cho bên đọc chuyển sang trường mới, có đường lui (`hoTen ?? ten`) phòng bản ghi sót. Đây là bước có thể QUAY LUI dễ nhất — chỉ cần deploy lại bản cũ.\n4. **THU HẸP:** sau khi chắc chắn không còn ai đọc/ghi trường cũ (đo bằng log thật, không bằng cảm giác), mới xoá nó.\n\nHai luật đi kèm: (a) **MIGRATION PHẢI QUAY LUI ĐƯỢC** — mỗi bước có bước ngược lại tương ứng, và bước xoá dữ liệu thì phải sao lưu trước, vì "quay lui" một lệnh xoá là bất khả nếu không còn dữ liệu; (b) **PHIÊN BẢN HOÁ** khi không thể tương thích ngược: giữ `/v1` sống song song `/v2` cho tới khi bên gọi cuối cùng chuyển xong — API công khai thì không có cách nào ép người khác deploy cùng lúc với mình.\n\nGiá phải trả của khuôn này là một khoảng thời gian hệ thống có DỮ LIỆU THỪA và code xấu hơn (đọc hai trường, ghi hai trường). Đó là cái giá có chủ đích, đổi lấy việc không có phút downtime nào — và nó chỉ xấu tạm thời NẾU bạn thật sự làm bước 4.',
    workedExample: {
      code: `// Ban ghi trong giai doan chuyen tiep: co the co truong cu, truong moi, hoac CA HAI.
interface BanGhi {
  ten?: string
  hoTen?: string
}

// Buoc 1 (MO RONG): ghi vao CA HAI truong — ban cu va ban moi cung doc duoc.
function ghiMoRong(hoTen: string): BanGhi {
  return { ten: hoTen, hoTen: hoTen }
}

// Buoc 3 (CHUYEN DOC): uu tien truong moi, LUI ve truong cu neu ban ghi cu chua duoc bu.
function docAnToan(bg: BanGhi): string {
  return bg.hoTen ?? bg.ten ?? "(khong ro)"
}

// Ban ghi cu (chi co ten) — chua kip backfill.
console.log("Ban ghi cu:", docAnToan({ ten: "Lan" }))
// Ban ghi giai doan mo rong — co ca hai.
console.log("Mo rong:", docAnToan(ghiMoRong("Nguyen Thi Lan")))
// Ban ghi sau khi THU HEP — chi con truong moi.
console.log("Sau thu hep:", docAnToan({ hoTen: "Tran Van Nam" }))
// Ban ghi hong — khong co truong nao: van khong no, tra ve gia tri noi ro la khong biet.
console.log("Ban ghi hong:", docAnToan({}))`,
      stdinLines: [],
    },
    predict: {
      code: `interface BanGhi {
  ten?: string
  hoTen?: string
}
function docAnToan(bg: BanGhi): string {
  return bg.hoTen ?? bg.ten ?? "(khong ro)"
}
console.log(docAnToan({ ten: "Cu", hoTen: "Moi" }) + " | " + docAnToan({ ten: "Cu" }) + " | " + docAnToan({}))`,
      question: 'Ba bản ghi ở ba giai đoạn khác nhau. Dòng in ra là gì?',
      choices: [
        'Moi | Cu | (khong ro)',
        'Cu | Cu | (khong ro)',
        'Moi | (khong ro) | (khong ro)',
        'Cu | Moi | (khong ro)',
      ],
      answerIndex: 0,
      explain:
        'Toán tử `??` lấy giá trị đầu tiên khác null/undefined. Bản ghi có cả hai trường thì trường MỚI thắng (đúng mục tiêu của bước "chuyển đọc"); bản ghi cũ chưa backfill thì lui về trường cũ nên vẫn đọc được; bản ghi không có gì thì trả chuỗi nói rõ là không biết, thay vì trả `undefined` rồi nổ ở chỗ khác.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm đọc an toàn ở giai đoạn chuyển tiếp: ưu tiên trường mới, lui về trường cũ, cuối cùng mới là giá trị mặc định.',
      lines: [
        'function docAnToan(bg: BanGhi): string {',
        '  return bg.hoTen ?? bg.ten ?? "(khong ro)"',
        '}',
      ],
    },
    make: {
      prompt:
        'Mô phỏng trọn một lượt mở-rộng-rồi-thu-hẹp cho việc đổi trường `ten` thành `hoTen`.\n\nViết HAI hàm:\n\n1. moTaGhi(giaiDoan, hoTen) — cho biết một lần ghi ở giai đoạn đó tạo ra những trường nào:\n   - "truoc" (chưa bắt đầu đổi) → `ten=<hoTen>`\n   - "morong" (đang chạy song song) → `ten=<hoTen>;hoTen=<hoTen>`\n   - "thuhep" (đã xoá trường cũ) → `hoTen=<hoTen>`\n   - giai đoạn lạ → `giai doan khong hop le`\n\n2. docAnToan(bg) — đọc bản ghi có thể ở BẤT KỲ giai đoạn nào: ưu tiên bg.hoTen, lui về bg.ten, không có gì thì trả `(khong ro)`. Dùng toán tử `??`.\n\nĐiểm phải hiểu: docAnToan viết MỘT lần và chạy đúng ở cả ba giai đoạn — đó là lý do bước "chuyển đọc" triển khai được mà không cần đồng bộ với bước ghi.',
      starterCode: `type GiaiDoan = "truoc" | "morong" | "thuhep" | "la"

interface BanGhi {
  ten?: string
  hoTen?: string
}

function moTaGhi(giaiDoan: GiaiDoan, hoTen: string): string {
  // TODO: moi giai doan ghi ra bo truong khac nhau
  return ""
}

function docAnToan(bg: BanGhi): string {
  // TODO: uu tien truong moi, lui ve truong cu, cuoi cung la "(khong ro)"
  return ""
}

// ---- Đừng sửa phần dưới đây ----
console.log(moTaGhi("truoc", "Lan"))
console.log(moTaGhi("morong", "Lan"))
console.log(moTaGhi("thuhep", "Lan"))
console.log(moTaGhi("la", "Lan"))
console.log(docAnToan({ ten: "Cu" }), docAnToan({ ten: "Cu", hoTen: "Moi" }), docAnToan({}))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'ten=Lan;hoTen=Lan',
          match: 'contains',
          hidden: false,
          label: 'Giai đoạn mở rộng ghi vào CẢ HAI trường',
        },
        {
          stdinLines: [],
          expected: 'giai doan khong hop le',
          match: 'contains',
          hidden: false,
          label: 'Giai đoạn lạ → nói rõ không hợp lệ, không đoán bừa',
        },
        {
          stdinLines: [],
          expected: 'Cu Moi (khong ro)',
          match: 'contains',
          hidden: false,
          label: 'Một hàm đọc chạy đúng ở cả ba loại bản ghi',
        },
        {
          stdinLines: [],
          expected: 'ten=Lan\nten=Lan;hoTen=Lan\nhoTen=Lan\ngiai doan khong hop le\nCu Moi (khong ro)',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đủ năm dòng đúng thứ tự bốn giai đoạn ghi + một dòng đọc',
        },
      ],
      hints: [
        'moTaGhi chỉ là nối chuỗi: giai đoạn "morong" trả "ten=" + hoTen + ";hoTen=" + hoTen (dấu chấm phẩy ở giữa, không có khoảng trắng).',
        'docAnToan viết gọn trong một dòng: return bg.hoTen ?? bg.ten ?? "(khong ro)" — thứ tự này chính là "ưu tiên trường mới, lui về trường cũ".',
        'Dòng in cuối truyền BA đối số cho console.log nên chúng được nối bằng khoảng trắng: "Cu Moi (khong ro)".',
      ],
      sampleSolution: `type GiaiDoan = "truoc" | "morong" | "thuhep" | "la"

interface BanGhi {
  ten?: string
  hoTen?: string
}

function moTaGhi(giaiDoan: GiaiDoan, hoTen: string): string {
  if (giaiDoan === "truoc") return "ten=" + hoTen
  if (giaiDoan === "morong") return "ten=" + hoTen + ";hoTen=" + hoTen
  if (giaiDoan === "thuhep") return "hoTen=" + hoTen
  return "giai doan khong hop le"
}

function docAnToan(bg: BanGhi): string {
  return bg.hoTen ?? bg.ten ?? "(khong ro)"
}

// ---- Đừng sửa phần dưới đây ----
console.log(moTaGhi("truoc", "Lan"))
console.log(moTaGhi("morong", "Lan"))
console.log(moTaGhi("thuhep", "Lan"))
console.log(moTaGhi("la", "Lan"))
console.log(docAnToan({ ten: "Cu" }), docAnToan({ ten: "Cu", hoTen: "Moi" }), docAnToan({}))`,
    },
    homework:
      'Lấy một bảng dữ liệu hoặc một kiểu API bạn từng viết và chọn MỘT trường bạn muốn đổi tên hoặc đổi kiểu. Viết ra kế hoạch bốn bước mở-rộng-rồi-thu-hẹp cho đúng trường đó: mỗi bước triển khai cái gì, ai đọc/ghi gì trong lúc đó, và LÀM SAO BIẾT được đã an toàn để sang bước sau (đo bằng gì — log, số lượt gọi, phiên bản app còn hoạt động?). Câu cuối là câu khó nhất và là câu quan trọng nhất.',
    srsCards: [
      {
        hoi: 'Vì sao đổi tên một trường lại được xếp vào thay đổi phá vỡ?',
        dap: 'Vì đổi tên thực chất là xoá trường cũ cộng thêm trường mới, mà trong khoảng chuyển tiếp bản cũ vẫn đang chạy và đọc trường cũ vừa biến mất — nên nó gãy y như một lệnh xoá cột.',
      },
      {
        hoi: 'Bốn bước của khuôn mở rộng rồi thu hẹp là gì?',
        dap: 'Mở rộng (thêm cái mới, giữ cái cũ, ghi cả hai) → bù dữ liệu lịch sử theo lô → chuyển bên đọc sang trường mới có đường lui → thu hẹp, xoá cái cũ sau khi đo chắc không còn ai dùng.',
      },
      {
        hoi: 'Loại thay đổi schema nào nguy hiểm nhất vì không công cụ nào phát hiện được?',
        dap: 'Đổi Ý NGHĨA của một trường mà giữ nguyên tên và kiểu, ví dụ giaBan từ "chưa gồm thuế" thành "đã gồm thuế" — mọi kiểm tra kiểu và schema đều xanh, chỉ có số tiền là sai.',
      },
      {
        hoi: 'Thêm một trường BẮT BUỘC vào hợp đồng có phải thay đổi an toàn không?',
        dap: 'Không, đó là thay đổi phá vỡ: mọi bên ghi hiện có đang gửi dữ liệu thiếu trường đó nên sẽ bị từ chối ngay. Muốn an toàn thì thêm dạng tuỳ chọn trước, rồi mới siết thành bắt buộc sau khi mọi bên ghi đã cập nhật.',
      },
    ],
  },
  {
    id: 'p6-u119-l2',
    unitId: 'p6-u119',
    language: 'typescript',
    title: 'Nguồn sự thật duy nhất, và ba chỗ sai đắt nhất: tiền, thời gian, định danh',
    hook: 'Code sai thì sửa xong deploy là hết. DỮ LIỆU sai thì nó nằm đó — trong hàng triệu bản ghi lịch sử, trong file sao lưu, trong báo cáo đã gửi cho khách. Bạn không "deploy" lại được quá khứ. Đó là lý do phần khó đổi nhất của một hệ thống không phải code, mà là dữ liệu.',
    theory:
      'NGUỒN SỰ THẬT DUY NHẤT (single source of truth): với mỗi mẩu dữ liệu, phải có ĐÚNG MỘT chỗ được quyền GHI, mọi chỗ khác chỉ ĐỌC. Khi hai chỗ cùng được ghi một sự thật, câu hỏi "cái nào đúng?" không có câu trả lời kỹ thuật nào cả — chỉ còn cách đoán, và người đoán thường là bạn, lúc nửa đêm, khi khách gọi khiếu nại.\n\nNHÂN BẢN DỮ LIỆU (denormalize) để đọc nhanh là chính đáng — ví dụ lưu sẵn `tenKhach` trong bảng đơn hàng để khỏi join. Nhưng phải trả đủ giá của nó: bản sao SẼ LỆCH khi bản gốc đổi, nên mỗi bản sao cần một cơ chế cập nhật rõ ràng và một cách phát hiện lệch. Luật thực dụng: bản sao chỉ được đọc, và luôn nói rõ nó là ẢNH CHỤP tại thời điểm nào. Có một ngoại lệ quan trọng ngược lại: dữ liệu mang tính LỊCH SỬ thì phải chép cứng chứ không tham chiếu — hoá đơn phải lưu giá TẠI LÚC MUA, vì tháng sau giá đổi mà hoá đơn cũ đổi theo là sai về kế toán lẫn pháp lý.\n\n**BA CHỖ SAI ĐẮT NHẤT:**\n\n**1. TIỀN.** Không bao giờ dùng số thực (float) cho tiền: `0.1 + 0.2` trong mọi ngôn ngữ dùng chuẩn IEEE-754 không cho ra `0.3`. Lưu bằng SỐ NGUYÊN ở đơn vị nhỏ nhất (đồng với VND, cent với USD) và LUÔN kèm ĐƠN VỊ TIỀN — một cột `gia: 100` không có đơn vị là một quả bom hẹn giờ. Tỷ giá thì phải lưu kèm thời điểm quy đổi.\n\n**2. THỜI GIAN.** Lưu bằng UTC kèm múi giờ, hiển thị mới đổi sang giờ địa phương. Phân biệt ba thứ khác nhau hay bị gộp: thời điểm SỰ VIỆC XẢY RA, thời điểm hệ thống GHI NHẬN, và NGÀY theo lịch nơi người dùng sống (một giao dịch lúc 23h ngày 31/8 giờ Việt Nam là ngày 30/8 theo giờ UTC — báo cáo tháng sẽ lệch nếu chọn nhầm mốc).\n\n**3. ĐỊNH DANH.** Đừng dùng số tự tăng làm mã công khai: nó lộ quy mô kinh doanh (mã đơn 1247 = bạn mới có 1247 đơn), cho phép người ngoài dò tuần tự, và va nhau khi gộp dữ liệu từ hai hệ thống. Đừng dùng dữ liệu nghiệp vụ làm khoá chính (email, số điện thoại) vì chúng ĐỔI được. Định danh nên VÔ NGHĨA, ổn định và không bao giờ tái sử dụng: mã của một bản ghi đã xoá KHÔNG được cấp lại cho bản ghi khác.\n\nMẫu số chung của cả ba: chúng đều là quyết định làm MỘT LẦN lúc thiết kế, ai cũng thấy chỉnh sửa được sau — cho tới khi có vài triệu bản ghi mang cái sai đó.',
    workedExample: {
      code: `// TIEN: luu bang SO NGUYEN don vi nho nhat (dong), khong dung so thuc.
console.log("So thuc:", 0.1 + 0.2)              // KHONG ra 0.3
console.log("Bang 0.3?", 0.1 + 0.2 === 0.3)     // false — day la ly do khong dung float cho tien

interface SoTien {
  soDong: number // luon la so NGUYEN
  donVi: "VND"   // don vi la mot phan cua du lieu, khong phai quy uoc ngam
}

function cong(a: SoTien, b: SoTien): SoTien {
  return { soDong: a.soDong + b.soDong, donVi: "VND" }
}

function dinhDang(t: SoTien): string {
  return t.soDong.toLocaleString("vi-VN") + " " + t.donVi
}

console.log("Tong:", dinhDang(cong({ soDong: 150000, donVi: "VND" }, { soDong: 99500, donVi: "VND" })))

// DINH DANH: vo nghia, khong lo quy mo, khong tuan tu doan duoc.
function maDon(thuTu: number): string {
  // Doi lai: mot ma tuan tu cho biet ban vua ban duoc bao nhieu don.
  return "DH-" + String(thuTu)
}
console.log("Ma lo quy mo:", maDon(1247))

// THOI GIAN: luu UTC, hien thi moi doi sang gio dia phuong.
const mocUtc = "2026-08-31T16:30:00Z"
console.log("Luu tru (UTC):", mocUtc)`,
      stdinLines: [],
    },
    predict: {
      code: `console.log("tong:", 0.1 + 0.2, "| bang 0.3?", 0.1 + 0.2 === 0.3)`,
      question: 'Dòng in ra là gì?',
      choices: [
        'tong: 0.30000000000000004 | bang 0.3? false',
        'tong: 0.3 | bang 0.3? true',
        'tong: 0.3 | bang 0.3? false',
        'tong: 0.30000000000000004 | bang 0.3? true',
      ],
      answerIndex: 0,
      explain:
        'Số thực theo chuẩn IEEE-754 lưu số ở hệ nhị phân, mà 0,1 và 0,2 không biểu diễn chính xác được ở hệ đó — nên tổng lệch một chút ở chữ số thứ 17 và phép so bằng cho false. Với tiền, sai số nhỏ này cộng dồn qua hàng triệu giao dịch thành số tiền có thật; vì vậy tiền luôn lưu bằng số nguyên đơn vị nhỏ nhất.',
    },
    parsons: {
      prompt: 'Xếp lại kiểu số tiền an toàn và hàm cộng tiền theo số nguyên đơn vị đồng.',
      lines: [
        'interface SoTien {',
        '  soDong: number',
        '  donVi: "VND"',
        '}',
        'function cong(a: SoTien, b: SoTien): SoTien {',
        '  return { soDong: a.soDong + b.soDong, donVi: "VND" }',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết bộ ba hàm canh ba chỗ sai đắt nhất.\n\n1. congTien(a, b): cộng hai số tiền dạng { soDong, donVi }. Nếu HAI ĐƠN VỊ KHÁC NHAU thì trả về chuỗi `Loi: khac don vi tien` — không được cộng bừa. Giống nhau thì trả `<tổng> <đơn vị>` (ví dụ `249500 VND`).\n\n2. maAnToan(uuid): trả về `Ma: <uuid>` — mã vô nghĩa truyền từ ngoài vào, không suy ra từ số thứ tự.\n\n3. ngayTheoLich(mocUtcGio, lechMuiGio): nhận GIỜ trong ngày theo UTC (0–23) và độ lệch múi giờ (ví dụ 7 cho Việt Nam), trả về `Cung ngay` nếu mocUtcGio + lechMuiGio còn nhỏ hơn 24, ngược lại trả `Sang ngay hom sau` — đúng cái bẫy làm lệch báo cáo theo ngày.',
      starterCode: `interface SoTien {
  soDong: number
  donVi: string
}

function congTien(a: SoTien, b: SoTien): string {
  // TODO: khac don vi thi TU CHOI, khong cong bua
  return ""
}

function maAnToan(uuid: string): string {
  // TODO
  return ""
}

function ngayTheoLich(mocUtcGio: number, lechMuiGio: number): string {
  // TODO: cong gio roi so voi 24
  return ""
}

// ---- Đừng sửa phần dưới đây ----
console.log(congTien({ soDong: 150000, donVi: "VND" }, { soDong: 99500, donVi: "VND" }))
console.log(congTien({ soDong: 150000, donVi: "VND" }, { soDong: 10, donVi: "USD" }))
console.log(maAnToan("a3f1c9"))
console.log(ngayTheoLich(10, 7))
console.log(ngayTheoLich(23, 7))`,
      testCases: [
        {
          stdinLines: [],
          expected: '249500 VND',
          match: 'contains',
          hidden: false,
          label: 'Cùng đơn vị → cộng số nguyên đồng, giữ nguyên đơn vị',
        },
        {
          stdinLines: [],
          expected: 'Loi: khac don vi tien',
          match: 'contains',
          hidden: false,
          label: 'Khác đơn vị → từ chối, vì cộng VND với USD là vô nghĩa',
        },
        {
          stdinLines: [],
          expected: 'Ma: a3f1c9',
          match: 'contains',
          hidden: false,
          label: 'Mã vô nghĩa, không lộ số thứ tự đơn hàng',
        },
        {
          stdinLines: [],
          expected: 'Sang ngay hom sau',
          match: 'contains',
          hidden: false,
          label: '23h UTC + 7 = 30 ≥ 24 → theo lịch Việt Nam đã sang ngày hôm sau',
        },
        {
          stdinLines: [],
          expected: '249500 VND\nLoi: khac don vi tien\nMa: a3f1c9\nCung ngay\nSang ngay hom sau',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đủ năm dòng đúng thứ tự, gồm cả ca 10h UTC vẫn cùng ngày',
        },
      ],
      hints: [
        'congTien: kiểm `a.donVi !== b.donVi` trước và trả chuỗi lỗi ngay; còn lại trả (a.soDong + b.soDong) + " " + a.donVi.',
        'Nối số với chuỗi bằng dấu + là TypeScript tự đổi số sang chuỗi, không cần String() — nhưng viết String(...) cũng đúng.',
        'ngayTheoLich: `return mocUtcGio + lechMuiGio < 24 ? "Cung ngay" : "Sang ngay hom sau"`.',
      ],
      sampleSolution: `interface SoTien {
  soDong: number
  donVi: string
}

function congTien(a: SoTien, b: SoTien): string {
  if (a.donVi !== b.donVi) return "Loi: khac don vi tien"
  return (a.soDong + b.soDong) + " " + a.donVi
}

function maAnToan(uuid: string): string {
  return "Ma: " + uuid
}

function ngayTheoLich(mocUtcGio: number, lechMuiGio: number): string {
  return mocUtcGio + lechMuiGio < 24 ? "Cung ngay" : "Sang ngay hom sau"
}

// ---- Đừng sửa phần dưới đây ----
console.log(congTien({ soDong: 150000, donVi: "VND" }, { soDong: 99500, donVi: "VND" }))
console.log(congTien({ soDong: 150000, donVi: "VND" }, { soDong: 10, donVi: "USD" }))
console.log(maAnToan("a3f1c9"))
console.log(ngayTheoLich(10, 7))
console.log(ngayTheoLich(23, 7))`,
    },
    homework:
      'Mở một dự án bất kỳ (của bạn hoặc mã nguồn mở) và soi đúng ba chỗ: (1) tiền được lưu kiểu gì, có kèm đơn vị không; (2) thời gian lưu UTC hay giờ địa phương, và báo cáo "theo ngày" của nó dùng mốc nào; (3) khoá chính là số tự tăng, email, hay mã vô nghĩa. Với mỗi chỗ, viết một câu: nếu chỗ này sai thì phải sửa bao nhiêu bản ghi lịch sử để khắc phục? Con số đó chính là cái giá của việc quyết định vội lúc đầu.',
    srsCards: [
      {
        hoi: 'Nguồn sự thật duy nhất yêu cầu gì với mỗi mẩu dữ liệu?',
        dap: 'Đúng một chỗ được quyền ghi, mọi chỗ khác chỉ đọc. Khi hai chỗ cùng ghi một sự thật thì câu hỏi cái nào đúng không còn câu trả lời kỹ thuật nào, chỉ còn cách đoán.',
      },
      {
        hoi: 'Vì sao không lưu tiền bằng số thực (float)?',
        dap: 'Vì chuẩn IEEE-754 không biểu diễn chính xác được 0,1 và 0,2 nên phép cộng lệch ở chữ số cuối; sai số cộng dồn qua hàng triệu giao dịch thành tiền thật. Lưu số nguyên ở đơn vị nhỏ nhất kèm đơn vị tiền.',
      },
      {
        hoi: 'Ba mốc thời gian nào hay bị gộp nhầm thành một?',
        dap: 'Thời điểm sự việc thật sự xảy ra, thời điểm hệ thống ghi nhận, và ngày theo lịch nơi người dùng sống — chọn nhầm mốc làm lệch báo cáo theo ngày với giao dịch sát nửa đêm.',
      },
      {
        hoi: 'Vì sao không nên dùng số tự tăng làm mã công khai?',
        dap: 'Nó lộ quy mô kinh doanh, cho người ngoài dò tuần tự sang bản ghi khác, và va nhau khi gộp dữ liệu từ hai hệ thống. Mã công khai nên vô nghĩa, ổn định và không bao giờ được cấp lại.',
      },
    ],
  },
]
