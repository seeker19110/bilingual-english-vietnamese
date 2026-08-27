// lessons/p6u21.ts — P6-U21: HƯỚNG KIẾN TRÚC, chặng S1 — hai khuôn giấy tờ mà học viên phải
// dùng được ngay sau chặng: ĐẶC TẢ KÍN (`docs/templates/dac-ta-tinh-nang.md`, sáu ô bắt buộc)
// và SỔ QUYẾT ĐỊNH ADR (`docs/templates/adr.md`).
//
// Vì sao hai khuôn này nằm ở S1 dù chương trình xếp chúng ở S3: chặng S1 kết bằng một dự án
// mà học viên phải GIAO cho người khác (hoặc AI) một đề xuất cắt lại ranh giới. Không có khuôn
// đặc tả và khuôn ADR thì phần giao việc ấy chỉ là lời nói miệng. Ở đây dạy đúng phần KIỂM
// ĐƯỢC BẰNG MÁY của hai khuôn — đủ sáu ô hay chưa, tiêu chí có đo được không, ADR có ghi
// phương án bị loại không — còn phần nội dung sâu để dành cho S3.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U21_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u21-l1',
    unitId: 'p6-u21',
    language: 'typescript',
    title: 'Đặc tả kín — sáu ô, và ô "KHÔNG làm" quan trọng ngang ô "làm"',
    hook: 'Bạn nhờ làm "màn hình lịch sử đơn hàng". Kết quả nhận về: đúng màn hình đó, kèm một hệ thống lọc nâng cao, một nút xuất Excel, và một bảng mới trong cơ sở dữ liệu. Không ai làm sai cả — bạn không hề nói cái gì KHÔNG được làm, nên bên thi hành phải tự đoán, và họ đoán rộng.',
    theory:
      'Một đặc tả KÍN nghĩa là: người nhận đọc xong bắt tay vào việc được ngay, không phải hỏi lại câu nào. Đây là kỹ năng quyết định chất lượng khi phần lớn code do AI hoặc người khác viết — vì AI viết rất nhanh, nhưng chỉ viết đúng thứ mà đặc tả nói rõ.\n\nSÁU Ô BẮT BUỘC (khuôn `docs/templates/dac-ta-tinh-nang.md` của dự án này):\n\n① PHẠM VI — làm gì, và KHÔNG làm gì. Ô "không làm" quan trọng ngang ô "làm": nó chặn phình phạm vi và bảo vệ những chỗ tuyệt đối không được đụng (bảng dữ liệu thật, luồng thanh toán).\n② ĐIỂM CHẠM — đường dẫn file cụ thể sẽ thêm hoặc sửa. "Sửa phần backend" không phải điểm chạm, đó là lời chúc may mắn.\n③ HỢP ĐỒNG VÀO-RA — kiểu dữ liệu vào, kiểu ra, và ca lỗi. Ca lỗi là một phần hợp đồng chứ không phải phụ lục.\n④ TIÊU CHÍ CHẤP NHẬN — đo được, và mỗi dòng nói rõ chạy lệnh nào thì biết là đạt.\n⑤ BẤT BIẾN không được phá, kèm tên test canh nó.\n⑥ QUY ƯỚC DỰ ÁN liên quan — bên thi hành KHÔNG thấy hội thoại trước đó, mọi giả định phải viết ra.\n\nLUẬT SỐ MỘT của khuôn này: viết ô ④ TRƯỚC ô mô tả giải pháp. Nghe ngược đời nhưng rất hiệu quả — không viết nổi tiêu chí đo được nghĩa là chính bạn chưa hiểu rõ việc mình đang giao, và lúc đó mọi mô tả giải pháp chỉ là đoán.\n\nTIÊU CHÍ THẾ NÀO LÀ ĐO ĐƯỢC? Phép thử rẻ nhất: trong câu đó có CON SỐ hoặc có LỆNH chạy được không? So sánh hai dòng:\n\n  · "trang phải nhanh" — không đo được; hai người sẽ nghiệm thu ra hai kết quả khác nhau.\n  · "danh sách 1.000 dòng hiện xong dưới 300ms, đo bằng npm run bench:list" — đo được; đạt hay không đạt là chuyện của cái máy, không phải chuyện tranh luận.\n\nCùng luật đó áp cho yêu cầu phi chức năng: NFR không đo được là NFR không tồn tại. "Bảo mật tốt", "dễ dùng", "ổn định" đều là câu chúc. Phiên bản dùng được: "p95 dưới 300ms ở 1.000 bản ghi", "bundle không quá 250KB", "0 vi phạm a11y mức AA trên 15 trang". Ba câu sau đặt được vào cổng CI; ba câu trước thì không.\n\nCUỐI CÙNG, CHIA LÁT. Một đặc tả tốt mô tả một lát nhỏ, chạy được, kiểm được. Giao một cục lớn thì bạn chỉ phát hiện ra hiểu lầm ở cuối, lúc đã tốn hết công. Giao ba lát nhỏ thì hiểu lầm lộ ra ở lát đầu tiên, khi sửa còn rẻ.',
    workedExample: {
      code: `// Sáu ô bắt buộc, viết đúng THỨ TỰ CHUẨN để báo cáo thiếu ô lúc nào cũng dễ đọc.
const O_BAT_BUOC = ["phamVi", "diemCham", "hopDong", "tieuChi", "batBien", "quyUoc"] as const

interface DacTa {
  oDaDien: string[]
  khongLam: string[]
  tieuChi: string[]
}

const ban: DacTa = {
  oDaDien: ["phamVi", "diemCham", "hopDong", "tieuChi", "quyUoc"], // thiếu batBien
  khongLam: ["khong dung bang payments"],
  tieuChi: ["trang phai nhanh"], // không có số, không có lệnh -> không đo được
}

const daDien = new Set(ban.oDaDien)
const thieu = O_BAT_BUOC.filter((o) => !daDien.has(o))
// Phép thử rẻ nhất cho "đo được": câu đó có chứa con số nào không
const doDuoc = ban.tieuChi.filter((t) => /[0-9]/.test(t)).length

console.log("Thieu o: " + (thieu.length === 0 ? "khong" : thieu.join(", ")))
console.log("Tieu chi do duoc: " + doDuoc + "/" + ban.tieuChi.length)
// Đọc kết quả: đặc tả này chưa giao được. Thiếu ô bất biến nghĩa là bên thi hành
// không biết cái gì tuyệt đối không được phá; còn "trang phai nhanh" thì hai người
// nghiệm thu sẽ ra hai kết luận khác nhau.`,
      stdinLines: [],
    },
    predict: {
      code: `const O_BAT_BUOC = ["phamVi", "diemCham", "hopDong", "tieuChi", "batBien", "quyUoc"] as const

const oDaDien = ["phamVi", "tieuChi", "quyUoc"]
const tieuChi = ["p95 duoi 300ms", "khong lam vo man hinh cu", "bundle duoi 250KB"]

const daDien = new Set(oDaDien)
const thieu = O_BAT_BUOC.filter((o) => !daDien.has(o))
const doDuoc = tieuChi.filter((t) => /[0-9]/.test(t)).length

console.log("Thieu " + thieu.length + " o, tieu chi do duoc " + doDuoc + "/" + tieuChi.length)`,
      question: 'Đoạn này in ra gì?',
      choices: [
        'Thieu 3 o, tieu chi do duoc 2/3',
        'Thieu 3 o, tieu chi do duoc 3/3',
        'Thieu 2 o, tieu chi do duoc 2/3',
        'Thieu 3 o, tieu chi do duoc 1/3',
      ],
      answerIndex: 0,
      explain:
        'Sáu ô chuẩn trừ ba ô đã điền (phamVi, tieuChi, quyUoc) còn thiếu ba: diemCham, hopDong, batBien. Trong ba tiêu chí, hai câu có chữ số ("300ms" và "250KB"), còn "khong lam vo man hinh cu" thì không — nên ra 2/3. Chỗ đáng nhớ: phép thử "có con số không" rất thô, nó không hiểu nghĩa câu; nhưng nó bắt được đúng loại tiêu chí nguy hiểm nhất — loại nghe rất hợp lý mà hai người nghiệm thu sẽ ra hai kết luận khác nhau.',
    },
    parsons: {
      prompt: 'Xếp lại đoạn kiểm "còn thiếu ô nào" theo đúng thứ tự chuẩn của khuôn.',
      lines: [
        'const daDien = new Set(dacTa.oDaDien)',
        'const thieu = O_BAT_BUOC.filter((o) => !daDien.has(o))',
        'if (thieu.length > 0) {',
        '  return "Chua kin - thieu o: " + thieu.join(", ")',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm kiemDacTa(dacTa) — cổng chặn một đặc tả chưa kín trước khi nó được giao đi.\n\nĐặc tả là { oDaDien: string[], khongLam: string[], tieuChi: string[] }. Thứ tự chuẩn của sáu ô bắt buộc: phamVi, diemCham, hopDong, tieuChi, batBien, quyUoc.\n\nHàm trả về MỘT chuỗi, xét theo đúng thứ tự sau (gặp lỗi nào thì trả ngay lỗi đó, không xét tiếp):\n\n  ① Thiếu ô → "Chua kin - thieu o: " kèm tên các ô còn thiếu theo THỨ TỰ CHUẨN, nối bằng dấu phẩy và một dấu cách.\n  ② Đủ sáu ô nhưng khongLam rỗng → "Chua kin - thieu muc KHONG LAM".\n  ③ Không có tiêu chí nào → "Chua kin - chua co tieu chi chap nhan".\n  ④ Có tiêu chí không đo được (câu KHÔNG chứa chữ số nào) → "Chua kin - tieu chi do duoc: k/n" với k là số tiêu chí đo được, n là tổng số tiêu chí.\n  ⑤ Qua hết → "Kin - giao duoc".\n\nGiữ nguyên phần in kết quả ở cuối.',
      starterCode: `const O_BAT_BUOC = ["phamVi", "diemCham", "hopDong", "tieuChi", "batBien", "quyUoc"] as const

interface DacTa {
  oDaDien: string[]
  khongLam: string[]
  tieuChi: string[]
}

function kiemDacTa(dacTa: DacTa): string {
  // TODO: viết theo 5 luật trong đề
  return ""
}

// ---- Đừng sửa phần dưới đây ----
const DU_O = ["phamVi", "diemCham", "hopDong", "tieuChi", "batBien", "quyUoc"]

const thieuO: DacTa = {
  oDaDien: ["phamVi", "tieuChi", "quyUoc"],
  khongLam: ["khong dung bang payments"],
  tieuChi: ["p95 duoi 300ms"],
}
const quenKhongLam: DacTa = {
  oDaDien: DU_O,
  khongLam: [],
  tieuChi: ["p95 duoi 300ms"],
}
const tieuChiSuong: DacTa = {
  oDaDien: DU_O,
  khongLam: ["khong doi schema"],
  tieuChi: ["p95 duoi 300ms", "trang phai nhanh", "bundle duoi 250KB"],
}
const kin: DacTa = {
  oDaDien: DU_O,
  khongLam: ["khong doi schema", "khong dung bang payments"],
  tieuChi: ["p95 duoi 300ms o 1000 ban ghi", "0 vi pham a11y muc AA tren 15 trang"],
}

console.log("Thieu o:", kiemDacTa(thieuO))
console.log("Quen:", kiemDacTa(quenKhongLam))
console.log("Suong:", kiemDacTa(tieuChiSuong))
console.log("Kin:", kiemDacTa(kin))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Thieu o: Chua kin - thieu o: diemCham, hopDong, batBien',
          match: 'contains',
          hidden: false,
          label: 'Báo thiếu ô theo THỨ TỰ CHUẨN, không theo thứ tự người ta điền',
        },
        {
          stdinLines: [],
          expected: 'Quen: Chua kin - thieu muc KHONG LAM',
          match: 'contains',
          hidden: false,
          label: 'Đủ sáu ô vẫn chưa đủ — không có mục KHÔNG LÀM là mời phình phạm vi',
        },
        {
          stdinLines: [],
          expected: 'Suong: Chua kin - tieu chi do duoc: 2/3',
          match: 'contains',
          hidden: false,
          label: '"trang phai nhanh" không có số nên không nghiệm thu được',
        },
        {
          stdinLines: [],
          expected: 'Kin: Kin - giao duoc',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — đủ sáu ô, có mục KHÔNG LÀM, mọi tiêu chí đều có ngưỡng số',
        },
      ],
      hints: [
        'Thứ tự kiểm chính là thứ tự các câu lệnh return trong hàm: viết lần lượt ①→⑤, mỗi luật một `if` trả về ngay. Không cần biến trạng thái nào cả.',
        'Báo thiếu ô theo thứ tự chuẩn nghĩa là phải duyệt O_BAT_BUOC rồi lọc, chứ đừng duyệt `oDaDien`: `O_BAT_BUOC.filter((o) => !daDien.has(o))`.',
        'Phép thử "đo được": `/[0-9]/.test(t)` — câu có ít nhất một chữ số. Thô nhưng đủ bắt loại tiêu chí cảm tính như "trang phai nhanh".',
        'Ô ④ chỉ báo khi CÓ tiêu chí không đo được, tức `doDuoc < tieuChi.length`. Nếu tất cả đều đo được thì đi tiếp xuống ⑤, đừng in "n/n" ra rồi coi là lỗi.',
      ],
      sampleSolution: `const O_BAT_BUOC = ["phamVi", "diemCham", "hopDong", "tieuChi", "batBien", "quyUoc"] as const

interface DacTa {
  oDaDien: string[]
  khongLam: string[]
  tieuChi: string[]
}

function kiemDacTa(dacTa: DacTa): string {
  // ① Thiếu ô — duyệt theo THỨ TỰ CHUẨN để báo cáo lúc nào cũng đọc được như nhau
  const daDien = new Set(dacTa.oDaDien)
  const thieu = O_BAT_BUOC.filter((o) => !daDien.has(o))
  if (thieu.length > 0) return "Chua kin - thieu o: " + thieu.join(", ")

  // ② Không có mục KHÔNG LÀM là mời bên thi hành tự mở rộng phạm vi
  if (dacTa.khongLam.length === 0) return "Chua kin - thieu muc KHONG LAM"

  // ③ Có ô tiêu chí mà bên trong rỗng thì cũng như không có
  if (dacTa.tieuChi.length === 0) return "Chua kin - chua co tieu chi chap nhan"

  // ④ Phép thử rẻ nhất cho "đo được": trong câu có con số nào không
  const doDuoc = dacTa.tieuChi.filter((t) => /[0-9]/.test(t)).length
  if (doDuoc < dacTa.tieuChi.length) {
    return "Chua kin - tieu chi do duoc: " + doDuoc + "/" + dacTa.tieuChi.length
  }

  // ⑤ Qua hết mới được phép nói là giao được
  return "Kin - giao duoc"
}

// ---- Đừng sửa phần dưới đây ----
const DU_O = ["phamVi", "diemCham", "hopDong", "tieuChi", "batBien", "quyUoc"]

const thieuO: DacTa = {
  oDaDien: ["phamVi", "tieuChi", "quyUoc"],
  khongLam: ["khong dung bang payments"],
  tieuChi: ["p95 duoi 300ms"],
}
const quenKhongLam: DacTa = {
  oDaDien: DU_O,
  khongLam: [],
  tieuChi: ["p95 duoi 300ms"],
}
const tieuChiSuong: DacTa = {
  oDaDien: DU_O,
  khongLam: ["khong doi schema"],
  tieuChi: ["p95 duoi 300ms", "trang phai nhanh", "bundle duoi 250KB"],
}
const kin: DacTa = {
  oDaDien: DU_O,
  khongLam: ["khong doi schema", "khong dung bang payments"],
  tieuChi: ["p95 duoi 300ms o 1000 ban ghi", "0 vi pham a11y muc AA tren 15 trang"],
}

console.log("Thieu o:", kiemDacTa(thieuO))
console.log("Quen:", kiemDacTa(quenKhongLam))
console.log("Suong:", kiemDacTa(tieuChiSuong))
console.log("Kin:", kiemDacTa(kin))`,
    },
    homework:
      'Mở `docs/templates/dac-ta-tinh-nang.md` và điền nó cho một việc nhỏ có thật mà bạn định nhờ AI làm trong tuần này. Bắt buộc theo luật số một: viết ô ④ tiêu chí chấp nhận TRƯỚC, và mỗi dòng phải kèm lệnh chứng minh. Điền xong, thử đọc lại như thể bạn là người nhận việc và chưa từng nghe bạn nói gì trước đó — mỗi chỗ bạn phải giải thích thêm trong đầu chính là một chỗ đặc tả còn hở. Vá những chỗ đó rồi mới giao. Sau khi nhận kết quả, điền nốt ô nghiệm thu bằng output THẬT của lệnh, không viết "chạy ok".',
    srsCards: [
      {
        hoi: 'Sáu ô bắt buộc của một đặc tả kín gồm những gì?',
        dap: 'Phạm vi (có mục KHÔNG làm), điểm chạm file cụ thể, hợp đồng vào-ra kèm ca lỗi, tiêu chí chấp nhận đo được, bất biến kèm test canh, và quy ước dự án liên quan.',
      },
      {
        hoi: 'Luật số một khi điền khuôn đặc tả là gì?',
        dap: 'Viết ô tiêu chí chấp nhận TRƯỚC ô mô tả giải pháp. Không viết nổi tiêu chí đo được nghĩa là chính người giao việc chưa hiểu rõ việc mình đang giao.',
      },
      {
        hoi: 'Mục "KHÔNG làm" giải quyết vấn đề gì mà mục "làm" không giải quyết được?',
        dap: 'Nó chặn phình phạm vi và bảo vệ những chỗ tuyệt đối không được đụng. Thiếu nó thì bên thi hành phải tự đoán ranh giới, và họ thường đoán rộng ra chứ không đoán hẹp lại.',
      },
      {
        hoi: 'Làm sao phân biệt nhanh một tiêu chí đo được với một câu chúc?',
        dap: 'Nhìn xem câu đó có con số hoặc lệnh chạy được không. "Trang phải nhanh" là câu chúc; "danh sách 1.000 dòng hiện xong dưới 300ms, đo bằng npm run bench:list" thì máy quyết định đạt hay không, không phải người tranh luận.',
      },
    ],
  },
  {
    id: 'p6-u21-l2',
    unitId: 'p6-u21',
    language: 'typescript',
    title: 'ADR — ghi cả phương án bị loại, nếu không phiên sau sẽ đề xuất lại đúng nó',
    hook: 'Tháng trước cả đội cân nhắc ba tuần rồi quyết định không tách microservice. Hôm nay có người mới (hoặc một phiên AI mới) mở lời: "sao mình không tách microservice nhỉ?". Không ai còn nhớ đủ lý do để phản biện gọn, thế là mất thêm một buổi họp — mà kết luận vẫn y hệt lần trước.',
    theory:
      'ADR — Architecture Decision Record, bản ghi quyết định kiến trúc (khuôn của Michael Nygard) — là một file ngắn ghi MỘT quyết định. Không phải tài liệu hướng dẫn dùng, không phải mô tả hệ thống. Nó chỉ trả lời: lúc đó ta biết gì, cân nhắc những gì, chọn gì, và đánh đổi gì.\n\nBỐN Ô CỦA MỘT ADR (khuôn `docs/templates/adr.md` của dự án này):\n\n· BỐI CẢNH — vấn đề gì buộc phải quyết NGAY BÂY GIỜ, kèm ràng buộc thật: thời gian, tiền, người, dữ liệu đang chạy. Không kể lể lịch sử.\n· CÁC PHƯƠNG ÁN ĐÃ CÂN NHẮC — ít nhất hai, mỗi phương án ghi được gì và mất gì. Chỉ có một phương án thì đó không phải quyết định, đó là thông báo.\n· QUYẾT ĐỊNH và VÌ SAO LOẠI CÁC PHƯƠNG ÁN KIA. Ô "vì sao loại" là ô quan trọng nhất của cả khuôn, và cũng là ô hay bị bỏ trống nhất. Không có nó thì mọi phiên sau sẽ đề xuất lại đúng phương án vừa loại, và bạn phải tranh luận lại từ đầu bằng trí nhớ đã phai.\n· HỆ QUẢ — việc kéo theo, đánh đổi cố tình chấp nhận, và ĐIỀU KIỆN XEM LẠI: số liệu nào vượt ngưỡng nào thì quyết định này nên được xét lại.\n\nĐiều kiện xem lại là thứ biến ADR từ một tờ giấy cứng nhắc thành một quyết định sống. Ví dụ: "chọn một khối liền có module rõ; xem lại khi thời gian deploy vượt 20 phút HOẶC khi có từ 3 đội cùng sửa một thư mục". Viết được câu đó nghĩa là bạn biết mình đang đánh cược vào giả định nào — và bạn sẽ biết lúc giả định ấy hết đúng, thay vì cãi nhau bằng cảm giác.\n\nADR LÀ BẤT BIẾN VỚI BÊN THI HÀNH. Người (hoặc AI) nhận việc không được lặng lẽ làm khác ADR. Muốn khác thì viết ADR MỚI THAY THẾ ADR cũ, và ADR cũ chuyển trạng thái "đã bị thay thế bởi ADR-N" chứ không bị xoá. Giữ lại bản cũ mới là điểm mạnh của cách làm này: sáu tháng sau bạn đọc được cả đường đi của tư duy, không chỉ điểm dừng cuối cùng.\n\nKHI NÀO VIẾT ADR: khi quyết định KHÓ ĐẢO NGƯỢC hoặc đắt (chọn cơ sở dữ liệu, chia ranh giới module, chọn cách xác thực, đồng bộ hay hàng đợi). Quyết định dễ đảo (đặt tên biến, chọn thư viện nhỏ dùng ở một chỗ) thì đừng viết — một sổ ADR đầy chuyện vặt là một sổ không ai đọc, và như vậy thì cũng bằng không có.\n\nMột mẹo viết: đặt tiêu đề ADR ở THỂ KHẲNG ĐỊNH, ví dụ "Dùng một khối liền có module rõ, chưa tách dịch vụ". Đọc mục lục là biết hệ thống đã chốt những gì mà không phải mở từng file.',
    workedExample: {
      code: `interface Adr {
  tieuDe: string
  phuongAn: string[]
  viSaoLoai: string
  dieuKienXemLai: string
}

const adr: Adr = {
  tieuDe: "Dung mot khoi lien co module ro, chua tach dich vu",
  phuongAn: ["mot khoi lien", "tach 4 dich vu"],
  viSaoLoai: "Tach dich vu som phai tra gia phan tan: theo dau, giao dich, trien khai.",
  dieuKienXemLai: "", // <- ô hay bị bỏ trống nhất sau ô "vì sao loại"
}

// Kiểm những thứ máy kiểm được; phần nội dung sâu thì người đọc mới thẩm định nổi.
if (adr.phuongAn.length < 2) {
  console.log("Chua phai ADR - moi co " + adr.phuongAn.length + " phuong an")
} else if (adr.viSaoLoai.trim() === "") {
  console.log("Chua phai ADR - thieu o vi sao loai")
} else if (adr.dieuKienXemLai.trim() === "") {
  console.log("Chua phai ADR - thieu dieu kien xem lai")
} else {
  console.log("ADR du o - chot duoc")
}
// Đọc kết quả: ADR này gần đủ, chỉ thiếu điều kiện xem lại — mà thiếu nó thì sáu
// tháng nữa không ai biết khi nào được phép mở lại cuộc tranh luận.`,
      stdinLines: [],
    },
    predict: {
      code: `const phuongAn = ["mot khoi lien"]
const viSaoLoai = "Tach dich vu som phai tra gia phan tan."

const duPhuongAn = phuongAn.length >= 2
const duLyDo = viSaoLoai.trim() !== ""

console.log("Du phuong an: " + duPhuongAn + ", du ly do loai: " + duLyDo)`,
      question: 'Đoạn này in ra gì?',
      choices: [
        'Du phuong an: false, du ly do loai: true',
        'Du phuong an: true, du ly do loai: true',
        'Du phuong an: false, du ly do loai: false',
        'Du phuong an: true, du ly do loai: false',
      ],
      answerIndex: 0,
      explain:
        'Mảng chỉ có một phương án nên `phuongAn.length >= 2` là false; chuỗi lý do có nội dung nên `duLyDo` là true — in ra "Du phuong an: false, du ly do loai: true". Chỗ đáng nhớ: một ADR chỉ liệt kê đúng phương án mình đã chọn thì không phải quyết định, đó là thông báo. Và trớ trêu là nó vẫn có ô "vì sao loại" điền đầy chữ — loại một phương án chưa từng được ghi ra thì người đọc sau không kiểm chứng được gì.',
    },
    parsons: {
      prompt:
        'Xếp lại chuỗi kiểm một ADR: phương án trước, lý do loại sau, điều kiện xem lại cuối.',
      lines: [
        'if (adr.phuongAn.length < 2) {',
        '  return "Chua phai ADR - moi co " + adr.phuongAn.length + " phuong an"',
        '}',
        'if (adr.viSaoLoai.trim() === "") {',
        '  return "Chua phai ADR - thieu o vi sao loai"',
        '}',
        'if (adr.dieuKienXemLai.trim() === "") {',
        '  return "Chua phai ADR - thieu dieu kien xem lai"',
        '}',
        'return "ADR du o - chot duoc"',
      ],
    },
    make: {
      prompt:
        'Viết hàm kiemAdr(adr) — cổng chặn một ADR chưa đủ ô trước khi nó được chốt vào sổ quyết định.\n\nADR là { tieuDe: string, phuongAn: string[], viSaoLoai: string, dieuKienXemLai: string }.\n\nHàm trả về MỘT chuỗi, xét theo đúng thứ tự sau (gặp lỗi nào trả ngay lỗi đó, không xét tiếp):\n\n  ① Tiêu đề rỗng hoặc chỉ toàn khoảng trắng → "Chua phai ADR - thieu tieu de".\n  ② Ít hơn 2 phương án → "Chua phai ADR - moi co n phuong an" (n là số phương án thật).\n  ③ Ô vì sao loại rỗng hoặc chỉ toàn khoảng trắng → "Chua phai ADR - thieu o vi sao loai".\n  ④ Ô điều kiện xem lại rỗng hoặc chỉ toàn khoảng trắng → "Chua phai ADR - thieu dieu kien xem lai".\n  ⑤ Qua hết → "ADR du o - chot duoc".\n\nLưu ý: chuỗi chỉ chứa dấu cách phải bị coi là RỖNG — một ô điền dấu cách cho qua cổng còn tệ hơn ô để trống, vì nó trông như đã điền.\n\nGiữ nguyên phần in kết quả ở cuối.',
      starterCode: `interface Adr {
  tieuDe: string
  phuongAn: string[]
  viSaoLoai: string
  dieuKienXemLai: string
}

function kiemAdr(adr: Adr): string {
  // TODO: viết theo 5 luật trong đề
  return ""
}

// ---- Đừng sửa phần dưới đây ----
const thongBao: Adr = {
  tieuDe: "Dung mot khoi lien co module ro",
  phuongAn: ["mot khoi lien"],
  viSaoLoai: "Tach dich vu som phai tra gia phan tan.",
  dieuKienXemLai: "Khi deploy vuot 20 phut",
}
const quenLyDo: Adr = {
  tieuDe: "Dung mot khoi lien co module ro",
  phuongAn: ["mot khoi lien", "tach 4 dich vu"],
  viSaoLoai: "   ",
  dieuKienXemLai: "Khi deploy vuot 20 phut",
}
const quenXemLai: Adr = {
  tieuDe: "Chon Postgres tu host thay vi dich vu quan ly",
  phuongAn: ["tu host", "dich vu quan ly"],
  viSaoLoai: "Dich vu quan ly dat gap 5 lan ma du an dang von toi thieu.",
  dieuKienXemLai: "",
}
const dat: Adr = {
  tieuDe: "Dung mot khoi lien co module ro, chua tach dich vu",
  phuongAn: ["mot khoi lien", "tach 4 dich vu", "tach 2 dich vu"],
  viSaoLoai: "Tach som phai tra gia phan tan trong khi doi chi co 1 nguoi.",
  dieuKienXemLai: "Khi deploy vuot 20 phut hoac co tu 3 doi cung sua mot thu muc",
}

console.log("Thong bao:", kiemAdr(thongBao))
console.log("Quen ly do:", kiemAdr(quenLyDo))
console.log("Quen xem lai:", kiemAdr(quenXemLai))
console.log("Dat:", kiemAdr(dat))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Thong bao: Chua phai ADR - moi co 1 phuong an',
          match: 'contains',
          hidden: false,
          label: 'Một phương án thì không phải quyết định, chỉ là thông báo',
        },
        {
          stdinLines: [],
          expected: 'Quen ly do: Chua phai ADR - thieu o vi sao loai',
          match: 'contains',
          hidden: false,
          label: 'Ô điền ba dấu cách phải bị coi là rỗng',
        },
        {
          stdinLines: [],
          expected: 'Quen xem lai: Chua phai ADR - thieu dieu kien xem lai',
          match: 'contains',
          hidden: false,
          label: 'Thiếu điều kiện xem lại thì không ai biết khi nào được mở lại tranh luận',
        },
        {
          stdinLines: [],
          expected: 'Dat: ADR du o - chot duoc',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — đủ bốn ô, ba phương án, có ngưỡng xem lại đo được',
        },
      ],
      hints: [
        'Năm luật là năm câu lệnh return viết lần lượt, không cần biến trạng thái. Thứ tự viết chính là thứ tự ưu tiên báo lỗi trong đề.',
        'Muốn coi chuỗi toàn khoảng trắng là rỗng thì luôn `.trim()` trước khi so sánh: `adr.viSaoLoai.trim() === ""`. So thẳng với chuỗi rỗng sẽ cho "   " lọt qua cổng.',
        'Số phương án phải in ra là số THẬT trong mảng, nên ghép `adr.phuongAn.length` vào chuỗi chứ đừng viết cứng số 1 — ADR có 0 phương án cũng phải báo đúng.',
        'Khung tham chiếu:\n\nif (adr.tieuDe.trim() === "") return "Chua phai ADR - thieu tieu de"\nif (adr.phuongAn.length < 2) return "Chua phai ADR - moi co " + adr.phuongAn.length + " phuong an"\n… rồi hai ô còn lại, cuối cùng return "ADR du o - chot duoc"',
      ],
      sampleSolution: `interface Adr {
  tieuDe: string
  phuongAn: string[]
  viSaoLoai: string
  dieuKienXemLai: string
}

function kiemAdr(adr: Adr): string {
  // ① Tiêu đề ở thể khẳng định là thứ giúp đọc mục lục biết hệ thống đã chốt gì
  if (adr.tieuDe.trim() === "") return "Chua phai ADR - thieu tieu de"

  // ② Một phương án thì không phải quyết định, chỉ là thông báo
  if (adr.phuongAn.length < 2) {
    return "Chua phai ADR - moi co " + adr.phuongAn.length + " phuong an"
  }

  // ③ Ô quan trọng nhất: không ghi thì phiên sau đề xuất lại đúng phương án vừa loại
  //    (trim trước khi so — ô điền toàn dấu cách trông như đã điền, còn tệ hơn để trống)
  if (adr.viSaoLoai.trim() === "") return "Chua phai ADR - thieu o vi sao loai"

  // ④ Điều kiện xem lại biến quyết định cứng thành quyết định sống
  if (adr.dieuKienXemLai.trim() === "") return "Chua phai ADR - thieu dieu kien xem lai"

  // ⑤ Đủ ô mới được chốt vào sổ
  return "ADR du o - chot duoc"
}

// ---- Đừng sửa phần dưới đây ----
const thongBao: Adr = {
  tieuDe: "Dung mot khoi lien co module ro",
  phuongAn: ["mot khoi lien"],
  viSaoLoai: "Tach dich vu som phai tra gia phan tan.",
  dieuKienXemLai: "Khi deploy vuot 20 phut",
}
const quenLyDo: Adr = {
  tieuDe: "Dung mot khoi lien co module ro",
  phuongAn: ["mot khoi lien", "tach 4 dich vu"],
  viSaoLoai: "   ",
  dieuKienXemLai: "Khi deploy vuot 20 phut",
}
const quenXemLai: Adr = {
  tieuDe: "Chon Postgres tu host thay vi dich vu quan ly",
  phuongAn: ["tu host", "dich vu quan ly"],
  viSaoLoai: "Dich vu quan ly dat gap 5 lan ma du an dang von toi thieu.",
  dieuKienXemLai: "",
}
const dat: Adr = {
  tieuDe: "Dung mot khoi lien co module ro, chua tach dich vu",
  phuongAn: ["mot khoi lien", "tach 4 dich vu", "tach 2 dich vu"],
  viSaoLoai: "Tach som phai tra gia phan tan trong khi doi chi co 1 nguoi.",
  dieuKienXemLai: "Khi deploy vuot 20 phut hoac co tu 3 doi cung sua mot thu muc",
}

console.log("Thong bao:", kiemAdr(thongBao))
console.log("Quen ly do:", kiemAdr(quenLyDo))
console.log("Quen xem lai:", kiemAdr(quenXemLai))
console.log("Dat:", kiemAdr(dat))`,
    },
    homework:
      'Chọn một quyết định kiến trúc đã có sẵn trong dự án DHCB — ví dụ "rời Supabase sang PostgreSQL tự host", "giữ Tailwind 3 không nâng v4", hoặc "lịch ôn thi tính ở client, server chỉ giữ ý định". Mở `docs/templates/adr.md` và viết ADR NGƯỢC cho nó: dựng lại bối cảnh, ít nhất hai phương án, lý do loại phương án kia, và điều kiện xem lại. Viết xong đưa cho một người (hoặc một phiên AI mới) đọc và hỏi họ: "đọc xong bạn còn muốn đề xuất phương án bị loại nữa không?". Nếu còn, ô vì sao loại của bạn chưa đủ mạnh — đó chính là bài kiểm tra thật của một ADR.',
    srsCards: [
      {
        hoi: 'Ô nào là ô quan trọng nhất của một ADR, và bỏ trống nó thì hậu quả gì?',
        dap: 'Ô "vì sao loại các phương án kia". Bỏ trống thì mỗi phiên sau — người mới hoặc AI mới — sẽ đề xuất lại đúng phương án vừa bị loại, và cả đội phải tranh luận lại từ đầu bằng trí nhớ đã phai.',
      },
      {
        hoi: 'Ô "điều kiện xem lại" trong ADR dùng để làm gì?',
        dap: 'Ghi trước số liệu hoặc giả định nào hết đúng thì quyết định phải được xét lại, ví dụ deploy vượt 20 phút. Nó biến một quyết định cứng thành quyết định sống, và tránh cãi nhau bằng cảm giác về sau.',
      },
      {
        hoi: 'Muốn làm khác một ADR đã chốt thì phải làm gì?',
        dap: 'Viết một ADR MỚI thay thế nó, và chuyển ADR cũ sang trạng thái đã bị thay thế chứ không xoá. Bên thi hành không được lặng lẽ làm khác, vì ADR là bất biến với họ.',
      },
      {
        hoi: 'Loại quyết định nào đáng viết ADR, loại nào thì không?',
        dap: 'Đáng viết khi quyết định khó đảo ngược hoặc đắt: chọn cơ sở dữ liệu, chia ranh giới module, chọn cách xác thực, đồng bộ hay hàng đợi. Chuyện dễ đảo thì đừng viết — sổ ADR đầy chuyện vặt là sổ không ai đọc.',
      },
    ],
  },
]
