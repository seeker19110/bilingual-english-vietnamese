// lessons/p6u118.ts — P6-U118: HƯỚNG KIẾN TRÚC, chặng S2 "Hợp đồng & mô hình miền" —
// Hợp đồng kiểm được (module `architecture-s2-m2`).
//
// p6-u117 dạy ĐẶT TÊN và ĐỊNH NGHĨA dữ liệu trong một ngữ cảnh. Unit này hỏi câu tiếp:
// làm sao dữ liệu đi QUA ranh giới mà bên nhận biết chắc nó đúng khuôn? Hai bài: ① schema
// là hợp đồng kiểm được LÚC CHẠY (mô phỏng Zod bằng hàm thuần, không cần cài thư viện);
// ② union phân biệt để trạng thái sai TRỞ NÊN BẤT KHẢ BIỂU DIỄN, và ca lỗi cũng là hợp đồng.
//
// Dùng làn `typescript`, mô phỏng bằng hàm thuần tất định — không hạ tầng thật.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U118_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u118-l1',
    unitId: 'p6-u118',
    language: 'typescript',
    title: 'Schema là hợp đồng — kiểu TypeScript biến mất lúc chạy, schema thì không',
    hook: 'Bạn khai `interface DonHang { soLuong: number }`, gọi API, và nhận về `soLuong: "ba"`. TypeScript im lặng, vì mọi kiểu đã BỐC HƠI lúc biên dịch — nó chưa bao giờ nhìn thấy dữ liệu thật. Cái duy nhất canh được ranh giới là một đoạn code THẬT SỰ CHẠY và kiểm từng trường.',
    theory:
      'Có một hiểu nhầm rất phổ biến: "dự án dùng TypeScript nên dữ liệu vào chắc chắn đúng kiểu". Sai. Kiểu TypeScript chỉ tồn tại lúc BIÊN DỊCH; sau khi biên dịch, JavaScript chạy ra không còn một dấu vết nào của kiểu. Mọi dữ liệu đến từ BÊN NGOÀI chương trình — phản hồi API, form người dùng, hàng đọc từ CSDL, tin nhắn hàng đợi, file cấu hình — đều là `unknown` cho tới khi có code kiểm chứng.\n\nSCHEMA là mô tả khuôn dữ liệu KIỂM ĐƯỢC LÚC CHẠY: một object/hàm nói rõ trường nào bắt buộc, kiểu gì, ràng buộc gì, và chạy thật để trả lời "dữ liệu này có đúng khuôn không". Các công cụ phổ biến: **Zod** (khai bằng code TypeScript, tự suy ra kiểu tĩnh từ schema — dự án DHCB dùng cái này), **JSON Schema** (khai bằng JSON, ngôn ngữ nào cũng đọc được), **OpenAPI** (mô tả toàn bộ API: đường dẫn, tham số, khuôn phản hồi, mã lỗi).\n\nĐiểm ĂN TIỀN của schema so với `if` rải rác: schema là MỘT nguồn sự thật, dùng được cho cả bốn việc — kiểm lúc chạy, suy ra kiểu tĩnh, sinh tài liệu, sinh dữ liệu test. Viết `if` tay thì bốn việc đó tách rời và sẽ lệch nhau.\n\nBa luật thi hành ở ranh giới:\n\n1. **Kiểm Ở BIÊN, một lần, ngay lối vào.** Sau khi qua cửa, phần còn lại của chương trình được phép tin dữ liệu — không kiểm lại ở mọi tầng.\n2. **Kiểm rồi thì THU HẸP KIỂU.** Đầu vào là `unknown`, đầu ra của bước kiểm là kiểu cụ thể. Đó là lý do không được dùng `as` để "khai đại" — `as` chỉ bảo trình biên dịch im lặng, nó KHÔNG kiểm gì cả.\n3. **Báo lỗi phải nói ĐÚNG TRƯỜNG NÀO SAI.** "Dữ liệu không hợp lệ" là một thông báo vô dụng cho người đang gỡ lỗi lúc 2 giờ sáng; "soLuong: phai la so nguyen duong" thì sửa được ngay.\n\nBài này mô phỏng một schema tối giản bằng hàm thuần — đúng cơ chế Zod làm bên trong: nhận `unknown`, chạy từng luật, gom danh sách lỗi.',
    workedExample: {
      code: `// Mo phong mot schema toi gian: nhan unknown, tra ve DANH SACH LOI (rong = hop le).
interface DauVao {
  ma: unknown
  soLuong: unknown
}

function kiemTraDon(dau: DauVao): string[] {
  const loi: string[] = []

  // Luat 1: ma phai la CHUOI, va bat dau bang "DH-".
  if (typeof dau.ma !== "string") {
    loi.push("ma: phai la chuoi")
  } else if (!dau.ma.startsWith("DH-")) {
    loi.push("ma: phai bat dau bang DH-")
  }

  // Luat 2: soLuong phai la SO NGUYEN DUONG.
  if (typeof dau.soLuong !== "number") {
    loi.push("soLuong: phai la so")
  } else if (!Number.isInteger(dau.soLuong) || dau.soLuong <= 0) {
    loi.push("soLuong: phai la so nguyen duong")
  }

  return loi
}

function ketQua(dau: DauVao): string {
  const loi = kiemTraDon(dau)
  return loi.length === 0 ? "OK" : "Loi: " + loi.join("; ")
}

console.log(ketQua({ ma: "DH-1", soLuong: 3 }))
console.log(ketQua({ ma: "XX-1", soLuong: 3 }))
// Du lieu that tu API co the la chuoi "ba" — kieu TypeScript khong cuu duoc o day.
console.log(ketQua({ ma: "DH-1", soLuong: "ba" }))
console.log(ketQua({ ma: 7, soLuong: 0 }))`,
      stdinLines: [],
    },
    predict: {
      code: `interface DauVao {
  ma: unknown
  soLuong: unknown
}
function kiemTraDon(dau: DauVao): string[] {
  const loi: string[] = []
  if (typeof dau.ma !== "string") {
    loi.push("ma: phai la chuoi")
  } else if (!dau.ma.startsWith("DH-")) {
    loi.push("ma: phai bat dau bang DH-")
  }
  if (typeof dau.soLuong !== "number") {
    loi.push("soLuong: phai la so")
  }
  return loi
}
console.log(kiemTraDon({ ma: "XX-9", soLuong: "hai" }).length)`,
      question: 'Dữ liệu sai CẢ HAI trường. Hàm in ra số mấy?',
      choices: ['2', '1', '0', '4'],
      answerIndex: 0,
      explain:
        'Hàm không dừng ở lỗi đầu tiên — nó chạy hết mọi luật rồi gom danh sách, nên ra 2. Đây là một quyết định thiết kế có chủ đích: người dùng sửa được cả hai lỗi trong MỘT lượt, thay vì sửa một cái, gửi lại, rồi mới biết còn cái nữa. Zod và JSON Schema đều gom lỗi theo kiểu này.',
    },
    parsons: {
      prompt:
        'Xếp lại đoạn kiểm trường `ma`: kiểm kiểu trước, chỉ khi đúng kiểu mới kiểm được nội dung.',
      lines: [
        'if (typeof dau.ma !== "string") {',
        '  loi.push("ma: phai la chuoi")',
        '} else if (!dau.ma.startsWith("DH-")) {',
        '  loi.push("ma: phai bat dau bang DH-")',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm kiemTraKhach(dau) mô phỏng schema kiểm lúc chạy cho dữ liệu khách hàng đến từ API.\n\nĐầu vào có ba trường kiểu `unknown`: ten, tuoi, email. Trả về MẢNG chuỗi lỗi (rỗng = hợp lệ), gom ĐỦ mọi lỗi chứ không dừng ở lỗi đầu, và theo đúng thứ tự ten → tuoi → email:\n\n- ten: không phải chuỗi → `ten: phai la chuoi`; là chuỗi nhưng rỗng (sau khi bỏ khoảng trắng hai đầu bằng .trim()) → `ten: khong duoc rong`\n- tuoi: không phải số → `tuoi: phai la so`; là số nhưng không nguyên hoặc nhỏ hơn 0 → `tuoi: phai la so nguyen khong am`\n- email: không phải chuỗi → `email: phai la chuoi`; là chuỗi nhưng không chứa ký tự "@" → `email: thieu ky tu @`\n\nHàm ketQua đã viết sẵn: rỗng thì in `OK`, có lỗi thì in `Loi: ` + các lỗi nối bằng `"; "`.',
      starterCode: `interface DauVaoKhach {
  ten: unknown
  tuoi: unknown
  email: unknown
}

function kiemTraKhach(dau: DauVaoKhach): string[] {
  const loi: string[] = []
  // TODO: kiem ten, tuoi, email theo dung thu tu; gom DU moi loi
  return loi
}

// ---- Đừng sửa phần dưới đây ----
function ketQua(dau: DauVaoKhach): string {
  const loi = kiemTraKhach(dau)
  return loi.length === 0 ? "OK" : "Loi: " + loi.join("; ")
}
console.log(ketQua({ ten: "Lan", tuoi: 20, email: "lan@vidu.vn" }))
console.log(ketQua({ ten: "   ", tuoi: 20, email: "lan@vidu.vn" }))
console.log(ketQua({ ten: "Lan", tuoi: 20.5, email: "lan-vidu.vn" }))
console.log(ketQua({ ten: 7, tuoi: "hai muoi", email: 99 }))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'OK',
          match: 'contains',
          hidden: false,
          label: 'Dữ liệu đúng cả ba trường → không lỗi nào',
        },
        {
          stdinLines: [],
          expected: 'Loi: ten: khong duoc rong',
          match: 'contains',
          hidden: false,
          label: 'Tên toàn khoảng trắng → phải bắt được nhờ .trim()',
        },
        {
          stdinLines: [],
          expected: 'Loi: tuoi: phai la so nguyen khong am; email: thieu ky tu @',
          match: 'contains',
          hidden: false,
          label: 'Sai hai trường cùng lúc → gom đủ hai lỗi, đúng thứ tự',
        },
        {
          stdinLines: [],
          expected: 'Loi: ten: phai la chuoi; tuoi: phai la so; email: phai la chuoi',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: sai kiểu cả ba trường → ba lỗi kiểu, không rơi vào nhánh kiểm nội dung',
        },
      ],
      hints: [
        'Với mỗi trường dùng khuôn if/else if: `if (typeof dau.x !== "...") { ... } else if (dieu-kien-noi-dung) { ... }` — nhánh else if chỉ chạy khi đã chắc đúng kiểu, nên gọi .trim()/.includes() ở đó là an toàn.',
        'Đừng return sớm sau lỗi đầu tiên: chỉ push vào mảng rồi đi tiếp, cuối hàm mới return mảng.',
        'Tuổi: dùng Number.isInteger(dau.tuoi) để kiểm số nguyên, và điều kiện sai là `!Number.isInteger(dau.tuoi) || dau.tuoi < 0`.',
      ],
      sampleSolution: `interface DauVaoKhach {
  ten: unknown
  tuoi: unknown
  email: unknown
}

function kiemTraKhach(dau: DauVaoKhach): string[] {
  const loi: string[] = []

  if (typeof dau.ten !== "string") {
    loi.push("ten: phai la chuoi")
  } else if (dau.ten.trim() === "") {
    loi.push("ten: khong duoc rong")
  }

  if (typeof dau.tuoi !== "number") {
    loi.push("tuoi: phai la so")
  } else if (!Number.isInteger(dau.tuoi) || dau.tuoi < 0) {
    loi.push("tuoi: phai la so nguyen khong am")
  }

  if (typeof dau.email !== "string") {
    loi.push("email: phai la chuoi")
  } else if (!dau.email.includes("@")) {
    loi.push("email: thieu ky tu @")
  }

  return loi
}

// ---- Đừng sửa phần dưới đây ----
function ketQua(dau: DauVaoKhach): string {
  const loi = kiemTraKhach(dau)
  return loi.length === 0 ? "OK" : "Loi: " + loi.join("; ")
}
console.log(ketQua({ ten: "Lan", tuoi: 20, email: "lan@vidu.vn" }))
console.log(ketQua({ ten: "   ", tuoi: 20, email: "lan@vidu.vn" }))
console.log(ketQua({ ten: "Lan", tuoi: 20.5, email: "lan-vidu.vn" }))
console.log(ketQua({ ten: 7, tuoi: "hai muoi", email: 99 }))`,
    },
    homework:
      'Tìm trong một dự án của bạn (hoặc một đoạn code bạn từng viết) MỘT chỗ nhận dữ liệu từ bên ngoài — fetch API, đọc JSON, đọc form. Hỏi ba câu: (1) chỗ đó có code kiểm lúc chạy không, hay chỉ có khai kiểu/ép `as`? (2) nếu API trả về thiếu một trường thì lỗi sẽ nổ ở đâu — ngay cửa vào hay tận sâu bên trong lúc đọc `undefined.x`? (3) thông báo lỗi có nói ĐÚNG trường nào sai không? Viết ra ba câu trả lời rồi phác hàm kiểm cho chỗ đó.',
    srsCards: [
      {
        hoi: 'Vì sao khai kiểu TypeScript không đủ để tin dữ liệu từ API?',
        dap: 'Vì kiểu chỉ tồn tại lúc biên dịch và biến mất hoàn toàn khi chạy; JavaScript chạy ra không kiểm gì. Dữ liệu từ bên ngoài chỉ thật sự đúng khuôn khi có code kiểm chạy thật lúc chạy, ví dụ một schema Zod.',
      },
      {
        hoi: 'Dùng `as` để ép kiểu dữ liệu vừa nhận từ API có tác dụng gì?',
        dap: 'Chỉ có tác dụng bắt trình biên dịch im lặng — nó không kiểm chứng một chút nào lúc chạy. Muốn thu hẹp kiểu an toàn thì phải kiểm thật rồi mới đổi từ unknown sang kiểu cụ thể.',
      },
      {
        hoi: 'Vì sao hàm kiểm schema nên gom hết lỗi thay vì dừng ở lỗi đầu tiên?',
        dap: 'Để người gửi dữ liệu sửa được tất cả trong một lượt, thay vì sửa một lỗi, gửi lại, rồi mới phát hiện còn lỗi nữa. Zod và JSON Schema đều gom danh sách lỗi theo từng trường vì lý do này.',
      },
    ],
  },
  {
    id: 'p6-u118-l2',
    unitId: 'p6-u118',
    language: 'typescript',
    title: 'Union phân biệt — làm cho trạng thái sai KHÔNG THỂ viết ra được',
    hook: 'Một kiểu `{ daGiao: boolean; maVanDon?: string; lyDoHuy?: string }` cho phép viết ra một đơn vừa đã giao vừa có lý do huỷ, hoặc đã giao mà không có mã vận đơn. Không luật nghiệp vụ nào cho phép mấy trạng thái đó, nhưng KIỂU thì cho — nên sớm muộn sẽ có code tạo ra chúng.',
    theory:
      'Nguyên tắc "làm cho trạng thái sai trở nên BẤT KHẢ BIỂU DIỄN" (make illegal states unrepresentable): thay vì kiểm tra rồi báo lỗi khi ai đó tạo ra dữ liệu vô nghĩa, hãy thiết kế kiểu sao cho dữ liệu vô nghĩa KHÔNG VIẾT RA ĐƯỢC. Lỗi bị chặn lúc biên dịch thì rẻ hơn lỗi bị bắt lúc chạy hàng chục lần.\n\nCông cụ chính là UNION PHÂN BIỆT (discriminated union): liệt kê các trạng thái hợp lệ, mỗi trạng thái mang ĐÚNG những trường mà nó cần, và tất cả cùng có một trường "nhãn" để phân biệt:\n\n    type TrangThaiDon =\n      | { loai: "cho" }\n      | { loai: "giao"; maVanDon: string }\n      | { loai: "huy"; lyDo: string }\n\nSo với kiểu cờ boolean + trường tuỳ chọn, cách này khoá được bốn thứ cùng lúc: không có đơn "giao" mà thiếu mã vận đơn (bắt buộc phải có), không có đơn "huy" kèm mã vận đơn (không khai trường đó), không có đơn vừa giao vừa huỷ (một nhãn thì một trạng thái), và không có trạng thái thứ tư bịa ra (nhãn chỉ nhận ba giá trị).\n\nKhi đọc, TypeScript THU HẸP KIỂU theo nhãn: trong nhánh `loai === "giao"`, trình biên dịch biết chắc có `maVanDon` và biết chắc KHÔNG có `lyDo` — bạn không cần dấu `?` hay `!` nào.\n\nMẹo canh cửa quan trọng: thêm nhánh `default` gán biến kiểu `never`. Khi có người thêm trạng thái thứ tư mà quên xử lý, dòng đó sẽ KHÔNG BIÊN DỊCH ĐƯỢC — trình biên dịch chỉ đúng chỗ cần sửa, thay vì để chương trình chạy im lặng rồi trả về chuỗi rỗng ở production.\n\nCUỐI CÙNG, một luật của chặng này: CA LỖI CŨNG LÀ MỘT PHẦN CỦA HỢP ĐỒNG, không phải phụ lục. Một API nói "trả về đơn hàng" mà không nói "khi hết hàng thì trả mã gì, khi hết hạn thanh toán thì trả mã gì" là một hợp đồng viết dở — bên gọi buộc phải đoán, và mỗi người đoán một kiểu. Union phân biệt là cách gọn nhất để viết ca lỗi vào chính kiểu trả về: kết quả không phải "dữ liệu hoặc ném lỗi", mà là một union `{ loai: "ok"; ... } | { loai: "loi"; ma: string }` mà bên gọi BẮT BUỘC phải xử lý cả hai nhánh.',
    workedExample: {
      code: `// Ba trang thai hop le, moi trang thai mang dung truong no can.
type TrangThaiDon =
  | { loai: "cho" }
  | { loai: "giao"; maVanDon: string }
  | { loai: "huy"; lyDo: string }

function moTa(tt: TrangThaiDon): string {
  switch (tt.loai) {
    case "cho":
      return "Dang cho xu ly"
    case "giao":
      // Trong nhanh nay TypeScript BIET CHAC co maVanDon — khong can dau ? hay !
      return "Da giao - van don " + tt.maVanDon
    case "huy":
      return "Da huy - ly do: " + tt.lyDo
    default: {
      // Canh cua: them trang thai moi ma quen xu ly la KHONG BIEN DICH DUOC.
      const chuaXuLy: never = tt
      return chuaXuLy
    }
  }
}

console.log(moTa({ loai: "cho" }))
console.log(moTa({ loai: "giao", maVanDon: "VD-123" }))
console.log(moTa({ loai: "huy", lyDo: "khach doi y" }))

// Nhung dong duoi day KHONG BIEN DICH DUOC — va do chinh la muc dich:
// moTa({ loai: "giao" })                      // thieu maVanDon
// moTa({ loai: "huy", maVanDon: "VD-1" })     // huy ma co van don
// moTa({ loai: "dang-bay" })                  // trang thai bia ra`,
      stdinLines: [],
    },
    predict: {
      code: `type KetQua =
  | { loai: "ok"; tien: number }
  | { loai: "loi"; ma: string }

function xuLy(kq: KetQua): string {
  if (kq.loai === "ok") {
    return "Thu duoc " + kq.tien + " dong"
  }
  return "That bai voi ma " + kq.ma
}

console.log(xuLy({ loai: "loi", ma: "HET_HANG" }))`,
      question: 'Dòng in ra là gì?',
      choices: [
        'That bai voi ma HET_HANG',
        'Thu duoc 0 dong',
        'That bai voi ma undefined',
        'Thu duoc HET_HANG dong',
      ],
      answerIndex: 0,
      explain:
        'Nhãn `loai` là "loi" nên nhánh đầu bị bỏ qua và hàm đi xuống dòng cuối, nơi TypeScript đã thu hẹp kiểu và biết chắc có trường `ma`. Không thể ra "undefined" như khi dùng trường tuỳ chọn `ma?: string`, vì trong nhánh này `ma` là bắt buộc — đó chính là điều union phân biệt bảo đảm.',
    },
    parsons: {
      prompt:
        'Xếp lại khai báo union phân biệt cho trạng thái đơn hàng — mỗi trạng thái mang đúng trường của nó.',
      lines: [
        'type TrangThaiDon =',
        '  | { loai: "cho" }',
        '  | { loai: "giao"; maVanDon: string }',
        '  | { loai: "huy"; lyDo: string }',
      ],
    },
    make: {
      prompt:
        'Viết hàm moTa(tt) cho một union phân biệt BỐN trạng thái của phiếu bảo hành — và đóng luôn cửa "quên xử lý trạng thái mới".\n\nKiểu đã khai sẵn trong starter code. Trả về chuỗi:\n- `{ loai: "moi" }` → `Phieu moi tao`\n- `{ loai: "dangsua"; kyThuatVien: string }` → `Dang sua - ky thuat vien <kyThuatVien>`\n- `{ loai: "xong"; ngayTra: string }` → `Da xong - tra ngay <ngayTra>`\n- `{ loai: "tuchoi"; lyDo: string }` → `Tu choi - ly do: <lyDo>`\n\nBắt buộc dùng `switch (tt.loai)` và có nhánh `default` gán vào một biến kiểu `never` (xem ví dụ mẫu). Nhánh đó không bao giờ chạy, nhưng nó là thứ khiến trình biên dịch báo lỗi khi có người thêm trạng thái thứ năm mà quên sửa hàm này.',
      starterCode: `type TrangThaiPhieu =
  | { loai: "moi" }
  | { loai: "dangsua"; kyThuatVien: string }
  | { loai: "xong"; ngayTra: string }
  | { loai: "tuchoi"; lyDo: string }

function moTa(tt: TrangThaiPhieu): string {
  // TODO: switch theo tt.loai, du bon nhanh + default gan bien kieu never
  return ""
}

// ---- Đừng sửa phần dưới đây ----
console.log(moTa({ loai: "moi" }))
console.log(moTa({ loai: "dangsua", kyThuatVien: "anh Tam" }))
console.log(moTa({ loai: "xong", ngayTra: "2026-09-05" }))
console.log(moTa({ loai: "tuchoi", lyDo: "het han bao hanh" }))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Phieu moi tao',
          match: 'contains',
          hidden: false,
          label: 'Trạng thái "moi" — không mang thêm trường nào',
        },
        {
          stdinLines: [],
          expected: 'Dang sua - ky thuat vien anh Tam',
          match: 'contains',
          hidden: false,
          label: 'Trạng thái "dangsua" — đọc được kyThuatVien không cần dấu ! hay ?',
        },
        {
          stdinLines: [],
          expected: 'Tu choi - ly do: het han bao hanh',
          match: 'contains',
          hidden: false,
          label: 'Trạng thái "tuchoi" — ca lỗi cũng là một nhánh của hợp đồng',
        },
        {
          stdinLines: [],
          expected:
            'Phieu moi tao\nDang sua - ky thuat vien anh Tam\nDa xong - tra ngay 2026-09-05\nTu choi - ly do: het han bao hanh',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đủ bốn trạng thái đúng thứ tự',
        },
      ],
      hints: [
        'Khung switch: `switch (tt.loai) { case "moi": return "..." ; ... }` — mỗi case return luôn nên không cần break.',
        'Trong nhánh "dangsua" bạn truy cập thẳng tt.kyThuatVien được, vì TypeScript đã thu hẹp kiểu theo nhãn loai.',
        'Nhánh default viết như ví dụ mẫu: mở ngoặc nhọn, `const chuaXuLy: never = tt`, rồi `return chuaXuLy`. Nếu thiếu một case nào đó, đúng dòng gán never này sẽ báo lỗi biên dịch.',
      ],
      sampleSolution: `type TrangThaiPhieu =
  | { loai: "moi" }
  | { loai: "dangsua"; kyThuatVien: string }
  | { loai: "xong"; ngayTra: string }
  | { loai: "tuchoi"; lyDo: string }

function moTa(tt: TrangThaiPhieu): string {
  switch (tt.loai) {
    case "moi":
      return "Phieu moi tao"
    case "dangsua":
      return "Dang sua - ky thuat vien " + tt.kyThuatVien
    case "xong":
      return "Da xong - tra ngay " + tt.ngayTra
    case "tuchoi":
      return "Tu choi - ly do: " + tt.lyDo
    default: {
      const chuaXuLy: never = tt
      return chuaXuLy
    }
  }
}

// ---- Đừng sửa phần dưới đây ----
console.log(moTa({ loai: "moi" }))
console.log(moTa({ loai: "dangsua", kyThuatVien: "anh Tam" }))
console.log(moTa({ loai: "xong", ngayTra: "2026-09-05" }))
console.log(moTa({ loai: "tuchoi", lyDo: "het han bao hanh" }))`,
    },
    homework:
      'Tìm trong code bạn từng viết một kiểu dữ liệu có từ hai trường tuỳ chọn (`?`) trở lên hoặc có cờ boolean kèm trường phụ. Viết ra TẤT CẢ tổ hợp mà kiểu đó cho phép (n trường tuỳ chọn cho 2 mũ n tổ hợp), rồi khoanh những tổ hợp KHÔNG có nghĩa về nghiệp vụ. Viết lại kiểu đó thành union phân biệt sao cho các tổ hợp vô nghĩa biến mất, và đếm xem bạn vừa xoá được bao nhiêu trạng thái sai khỏi hệ thống.',
    srsCards: [
      {
        hoi: 'Nguyên tắc "làm cho trạng thái sai bất khả biểu diễn" nói gì?',
        dap: 'Thay vì kiểm tra lúc chạy rồi báo lỗi khi ai đó tạo dữ liệu vô nghĩa, hãy thiết kế kiểu sao cho dữ liệu vô nghĩa không viết ra được — lỗi bị chặn lúc biên dịch rẻ hơn nhiều lần lỗi bắt lúc chạy.',
      },
      {
        hoi: 'Union phân biệt hơn gì so với một kiểu có cờ boolean kèm nhiều trường tuỳ chọn?',
        dap: 'Mỗi trạng thái mang đúng trường nó cần và bắt buộc phải có, nên không thể thiếu trường của trạng thái đó, không thể kèm trường của trạng thái khác, không thể ở hai trạng thái cùng lúc, và không thể bịa ra trạng thái ngoài danh sách.',
      },
      {
        hoi: 'Nhánh default gán biến kiểu never trong switch dùng để làm gì?',
        dap: 'Làm cửa canh đầy đủ: khi ai đó thêm một trạng thái mới vào union mà quên xử lý, đúng dòng gán never đó không biên dịch được, nên trình biên dịch chỉ thẳng chỗ cần sửa thay vì để chương trình chạy sai âm thầm.',
      },
      {
        hoi: 'Vì sao ca lỗi phải nằm trong hợp đồng chứ không để làm phụ lục?',
        dap: 'Vì nếu hợp đồng không nói khi hết hàng hay hết hạn thì trả về mã gì, mỗi bên gọi sẽ tự đoán một kiểu. Đưa ca lỗi vào chính kiểu trả về (union ok/loi) buộc mọi bên gọi phải xử lý cả hai nhánh.',
      },
    ],
  },
]
