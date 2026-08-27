// lessons/p6u17.ts — P6-U17: HƯỚNG WEB, chặng S1 — "UI là hàm của state" (module `web-s1-m3`)
// và TypeScript cho giao diện (`web-s1-m4`).
//
// Vì sao ba bài này KHÔNG dạy cú pháp React: thứ khiến người ta viết React sai không phải cú
// pháp JSX — mà là ba thói quen tư duy. (1) coi màn hình là thứ mình đi sửa từng mẩu thay vì
// thứ được TÍNH RA từ state; (2) nhét trạng thái tải/lỗi/rỗng vào mấy biến boolean rời rạc
// rồi để lọt tổ hợp vô nghĩa; (3) tin dữ liệu API bằng `as` rồi vỡ lúc chạy. Cả ba dạy được
// bằng TypeScript thuần, chấm được bằng test-case — và học xong thì đọc React thấy hiển
// nhiên. Bộ chạy TS của môn không có React, nên đây cũng là cách trung thực duy nhất.
//
// Cả ba bài chấm bằng hàm THUẦN: không stdin, không thời gian, không ngẫu nhiên — cùng một
// state luôn ra cùng một màn hình, đúng thứ bài muốn dạy.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U17_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u17-l1',
    unitId: 'p6-u17',
    language: 'typescript',
    title: 'UI là HÀM của state — thôi đi sửa màn hình bằng tay',
    hook: 'Giỏ hàng của bạn hiện "2 món · 30.000đ". Khách xoá một món: bạn gọi hàm xoá khỏi mảng, rồi nhớ sửa số 2 thành 1, rồi nhớ tính lại tổng tiền, rồi nhớ ẩn nút "Thanh toán" nếu giỏ rỗng. Quên MỘT trong bốn chỗ đó là màn hình nói dối người dùng. Cách chữa không phải "nhớ kỹ hơn" — mà là đừng sửa màn hình bằng tay nữa.',
    theory:
      'Có hai cách nghĩ về giao diện.\n\nCÁCH CŨ (thao tác trực tiếp): mỗi khi dữ liệu đổi, bạn đi tìm từng chỗ trên màn hình và sửa nó. Số chỗ phải nhớ tăng theo TÍCH của số trạng thái × số phần tử hiển thị. Đây là lý do giao diện hay "lệch": một chỗ đã cập nhật, chỗ kia thì chưa.\n\nCÁCH MỚI (khai báo): bạn giữ MỘT nguồn sự thật — state — và viết một hàm THUẦN biến state thành mô tả màn hình:\n  giaoDien = ve(state)\nMuốn đổi màn hình thì chỉ được đổi state, rồi để `ve()` chạy lại. Bạn không bao giờ đi sửa màn hình nữa. Đó chính xác là mô hình của React, và cũng là toàn bộ ý nghĩa câu "UI là hàm của state".\n\nHai luật rút ra, quan trọng hơn mọi cú pháp:\n\n① KHÔNG lưu thứ TÍNH ĐƯỢC vào state. Giỏ hàng có `danhSach` thì `soMon` và `tongTien` phải được TÍNH trong lúc vẽ, không được lưu thành trường riêng. Lưu cả hai nghĩa là có hai nguồn sự thật, và sớm muộn chúng lệch nhau — bug "tổng tiền không khớp giỏ" gần như luôn là bug này. (Trong React, đây cũng là câu trả lời cho "khi nào cần useEffect": việc TÍNH giá trị dẫn xuất KHÔNG cần useEffect; useEffect chỉ để đồng bộ với thứ NGOÀI React — mạng, timer, localStorage.)\n\n② Hàm vẽ phải THUẦN: cùng state → cùng kết quả, không đọc giờ hệ thống, không random, không tự đi sửa gì bên ngoài. Thuần thì test được bằng bảng "state này → màn hình này", và cũng là điều kiện để framework được phép chạy lại hàm vẽ bất cứ lúc nào mà không sợ hậu quả.\n\nMẹo đọc code của chính mình: thấy một biến state mà giá trị của nó LUÔN suy được từ biến state khác, hãy xoá nó đi. Mỗi biến state xoá được là một loại bug bạn vĩnh viễn không phải gặp nữa.',
    workedExample: {
      code: `interface MonHang {
  ten: string
  gia: number
  soLuong: number
}

// STATE: chỉ giữ SỰ THẬT GỐC. Không có soMon, không có tongTien — hai thứ đó tính được.
interface TrangThaiGio {
  danhSach: MonHang[]
  maGiamGia: string | null
}

// Giá trị DẪN XUẤT: tính khi cần, không lưu vào state
function tongTien(gio: TrangThaiGio): number {
  const thuong = gio.danhSach.reduce((t, m) => t + m.gia * m.soLuong, 0)
  return gio.maGiamGia === "GIAM10" ? Math.round(thuong * 0.9) : thuong
}

// HÀM VẼ: thuần — cùng state luôn ra cùng chuỗi, không đọc giờ, không random
function ve(gio: TrangThaiGio): string {
  if (gio.danhSach.length === 0) return "Gio hang trong"
  const soMon = gio.danhSach.reduce((t, m) => t + m.soLuong, 0)
  return \`\${soMon} mon - \${tongTien(gio)}d\`
}

const gio: TrangThaiGio = {
  danhSach: [
    { ten: "Ca phe sua", gia: 25000, soLuong: 1 },
    { ten: "Tra da", gia: 5000, soLuong: 1 },
  ],
  maGiamGia: null,
}
console.log(ve(gio))

// Đổi MÀN HÌNH bằng cách đổi STATE, không đi sửa màn hình:
const gioSauKhiXoa: TrangThaiGio = { ...gio, danhSach: gio.danhSach.slice(0, 1) }
console.log(ve(gioSauKhiXoa))`,
      stdinLines: [],
    },
    predict: {
      code: `interface Gio {
  danhSach: { gia: number }[]
  tongTien: number   // <-- lưu SẴN trong state
}

const gio: Gio = { danhSach: [{ gia: 25000 }, { gia: 5000 }], tongTien: 30000 }

// Xoá một món, quên cập nhật tongTien:
gio.danhSach.pop()

console.log(gio.danhSach.length, gio.tongTien)`,
      question: 'Chương trình in ra gì?',
      choices: ['1 30000', '1 25000', '2 30000', '0 0'],
      answerIndex: 0,
      explain:
        'In ra "1 30000": giỏ còn 1 món nhưng tổng tiền vẫn là tiền của 2 món. Không có phép màu nào tự cập nhật `tongTien` cả — nó chỉ là một con số được chép vào từ lúc trước. Đây là bug "tổng tiền không khớp giỏ" mà mọi dự án đều gặp một lần, và cách chữa không phải là nhớ gọi thêm một hàm cập nhật ở 5 chỗ, mà là XOÁ trường `tongTien` khỏi state và tính nó lúc vẽ.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm vẽ giỏ hàng: chặn ca rỗng trước, rồi tính giá trị dẫn xuất, rồi mới dựng chuỗi.',
      lines: [
        'function ve(gio: TrangThaiGio): string {',
        '  if (gio.danhSach.length === 0) return "Gio hang trong"',
        '  const soMon = gio.danhSach.reduce((t, m) => t + m.soLuong, 0)',
        '  const tong = tongTien(gio)',
        '  return `${soMon} mon - ${tong}d`',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm ve(gio: TrangThaiGio): string dựng dòng tóm tắt giỏ hàng từ state.\n\nLuật hiển thị:\n  · Giỏ không có món nào → trả về đúng chuỗi "Gio hang trong".\n  · Ngược lại → "<số món> mon - <tổng tiền>d", trong đó SỐ MÓN là tổng soLuong (2 ly cà phê tính là 2 món), và TỔNG TIỀN là tổng gia × soLuong.\n  · Nếu maGiamGia là "GIAM10" thì tổng tiền giảm 10%, làm tròn bằng Math.round.\n\nBắt buộc: KHÔNG được thêm trường soMon hay tongTien vào interface TrangThaiGio — hai giá trị đó phải được TÍNH trong lúc vẽ. Hàm ve phải THUẦN: không đọc giờ, không random, không sửa gì bên ngoài.\n\nGiữ nguyên phần in kết quả ở cuối.',
      starterCode: `interface MonHang {
  ten: string
  gia: number
  soLuong: number
}

interface TrangThaiGio {
  danhSach: MonHang[]
  maGiamGia: string | null
}

function ve(gio: TrangThaiGio): string {
  // TODO: viết theo luật hiển thị trong đề
  return ""
}

// ---- Đừng sửa phần dưới đây ----
const gioRong: TrangThaiGio = { danhSach: [], maGiamGia: null }
const gioThuong: TrangThaiGio = {
  danhSach: [
    { ten: "Ca phe sua", gia: 25000, soLuong: 2 },
    { ten: "Tra da", gia: 5000, soLuong: 1 },
  ],
  maGiamGia: null,
}
const gioGiamGia: TrangThaiGio = { ...gioThuong, maGiamGia: "GIAM10" }

console.log("Rong:", ve(gioRong))
console.log("Thuong:", ve(gioThuong))
console.log("Giam gia:", ve(gioGiamGia))
console.log("Van thuan:", ve(gioThuong) === ve(gioThuong) ? "co" : "khong")`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Rong: Gio hang trong',
          match: 'contains',
          hidden: false,
          label: 'Giỏ rỗng — trạng thái RỖNG là một màn hình riêng, không phải "0 mon - 0d"',
        },
        {
          stdinLines: [],
          expected: 'Thuong: 3 mon - 55000d',
          match: 'contains',
          hidden: false,
          label: '2 cà phê 25.000đ + 1 trà đá 5.000đ = 3 món, 55.000đ (soLuong tính vào số món)',
        },
        {
          stdinLines: [],
          expected: 'Giam gia: 3 mon - 49500d',
          match: 'contains',
          hidden: false,
          label: 'Cùng giỏ đó kèm mã GIAM10 → 55.000 × 0,9 = 49.500đ',
        },
        {
          stdinLines: [],
          expected: 'Van thuan: co',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — gọi hai lần cùng state phải ra cùng kết quả (hàm thuần)',
        },
      ],
      hints: [
        'Bắt đầu bằng ca rỗng: `if (gio.danhSach.length === 0) return "Gio hang trong"`. Chặn ca đặc biệt ngay đầu hàm giúp phần còn lại chỉ lo một chuyện.',
        'Số món KHÔNG phải danhSach.length — đề nói rõ 2 ly cà phê tính là 2 món, nên phải cộng dồn soLuong: `gio.danhSach.reduce((t, m) => t + m.soLuong, 0)`.',
        'Tổng tiền cộng dồn `m.gia * m.soLuong`. Xong rồi mới xét mã giảm giá: nếu maGiamGia === "GIAM10" thì nhân 0.9 và bọc trong Math.round — nhân trước làm tròn sau, làm ngược lại sẽ lệch vài đồng.',
        'Khung tham chiếu:\n\nfunction ve(gio: TrangThaiGio): string {\n  if (gio.danhSach.length === 0) return "Gio hang trong"\n  const soMon = gio.danhSach.reduce((t, m) => t + m.soLuong, 0)\n  const thuong = gio.danhSach.reduce((t, m) => t + m.gia * m.soLuong, 0)\n  const tong = gio.maGiamGia === "GIAM10" ? Math.round(thuong * 0.9) : thuong\n  return `${soMon} mon - ${tong}d`\n}',
      ],
      sampleSolution: `interface MonHang {
  ten: string
  gia: number
  soLuong: number
}

interface TrangThaiGio {
  danhSach: MonHang[]
  maGiamGia: string | null
}

function ve(gio: TrangThaiGio): string {
  // Ca RỖNG là một màn hình riêng, chặn ngay đầu hàm
  if (gio.danhSach.length === 0) return "Gio hang trong"
  // Hai giá trị DẪN XUẤT — tính tại đây, không lưu vào state
  const soMon = gio.danhSach.reduce((t, m) => t + m.soLuong, 0)
  const thuong = gio.danhSach.reduce((t, m) => t + m.gia * m.soLuong, 0)
  const tong = gio.maGiamGia === "GIAM10" ? Math.round(thuong * 0.9) : thuong
  return \`\${soMon} mon - \${tong}d\`
}

// ---- Đừng sửa phần dưới đây ----
const gioRong: TrangThaiGio = { danhSach: [], maGiamGia: null }
const gioThuong: TrangThaiGio = {
  danhSach: [
    { ten: "Ca phe sua", gia: 25000, soLuong: 2 },
    { ten: "Tra da", gia: 5000, soLuong: 1 },
  ],
  maGiamGia: null,
}
const gioGiamGia: TrangThaiGio = { ...gioThuong, maGiamGia: "GIAM10" }

console.log("Rong:", ve(gioRong))
console.log("Thuong:", ve(gioThuong))
console.log("Giam gia:", ve(gioGiamGia))
console.log("Van thuan:", ve(gioThuong) === ve(gioThuong) ? "co" : "khong")`,
    },
    homework:
      'Mở một màn hình bạn từng viết (hoặc một trang bất kỳ bạn hay dùng) và liệt kê mọi biến trạng thái nó cần. Với từng biến, hỏi: giá trị này có suy ra được từ biến khác không? Gạch bỏ những cái suy ra được — đó là danh sách bug bạn vừa xoá trước khi chúng kịp xảy ra. Nếu bạn đang dùng React: tìm trong dự án mọi useEffect chỉ để tính một giá trị rồi setState, và đổi chúng thành một biểu thức tính thẳng khi vẽ.',
    srsCards: [
      {
        hoi: '"UI là hàm của state" nghĩa là gì trong thực hành?',
        dap: 'Giữ MỘT nguồn sự thật (state) và một hàm thuần biến state thành màn hình. Muốn đổi màn hình thì chỉ đổi state rồi để hàm vẽ chạy lại — không bao giờ đi sửa từng mẩu giao diện bằng tay.',
      },
      {
        hoi: 'Vì sao không được lưu giá trị dẫn xuất (tổng tiền, số món) vào state?',
        dap: 'Vì khi đó có hai nguồn sự thật cho cùng một dữ kiện, và sớm muộn chúng lệch nhau — quên cập nhật một chỗ là màn hình nói dối. Tính lúc vẽ thì không thể lệch.',
      },
      {
        hoi: 'Việc TÍNH một giá trị dẫn xuất có cần useEffect không?',
        dap: 'Không. Cứ tính thẳng trong lúc vẽ. useEffect chỉ dùng để đồng bộ với thứ NGOÀI React (mạng, timer, localStorage, DOM ngoài) — dùng nó để tính toán là tự đẻ thêm một nguồn sự thật và một nhịp trễ.',
      },
    ],
  },
  {
    id: 'p6-u17-l2',
    unitId: 'p6-u17',
    language: 'typescript',
    title: 'Union phân biệt — bốn trạng thái màn hình, không phải ba cờ boolean',
    hook: 'Màn hình "Đơn hàng của tôi" có ba biến: dangTai, loi, duLieu. Một hôm bug xuất hiện: màn hình vừa hiện vòng xoay tải VỪA hiện lỗi mạng. Không ai cố tình đặt hai cờ đó cùng lúc — code chỉ quên tắt dangTai ở một nhánh. TypeScript không bắt được lỗi này, vì với nó dangTai và loi chỉ là hai boolean độc lập, chẳng liên quan gì đến nhau.',
    theory:
      'Một màn hình lấy dữ liệu từ mạng luôn có ĐÚNG BỐN trạng thái: đang tải, rỗng (tải xong nhưng không có gì), lỗi, hoặc có dữ liệu. Cách viết quen tay là ba biến boolean rời rạc:\n\n  dangTai: boolean\n  loi: string | null\n  duLieu: MonHang[] | null\n\nVấn đề: ba biến độc lập tạo ra 2×2×2 = 8 TỔ HỢP có thể, nhưng chỉ 4 tổ hợp có nghĩa. `dangTai: true, loi: "..."` là tổ hợp KHÔNG ai muốn nhưng TypeScript cho phép — vì với nó ba biến này chẳng ràng buộc gì nhau. Bug "vừa tải vừa lỗi" không phải do bạn cẩu thả, mà do KIỂU DỮ LIỆU cho phép trạng thái vô nghĩa tồn tại.\n\nCách chữa: gộp bốn trạng thái vào MỘT trường `trangThai` kiểu chuỗi literal, biến mỗi trạng thái thành một "hình dạng" object riêng — đây gọi là UNION PHÂN BIỆT (discriminated union):\n\n  type ManHinh =\n    | { trangThai: "dang_tai" }\n    | { trangThai: "rong" }\n    | { trangThai: "loi"; thongDiep: string }\n    | { trangThai: "co_du_lieu"; danhSach: MonHang[] }\n\nGiờ TypeScript TỰ tính ra: khi `trangThai === "loi"` thì object CHẮC CHẮN có `thongDiep`, không thể vừa "loi" vừa thiếu nó, và không thể vừa "loi" vừa "dang_tai" — vì một giá trị chỉ mang ĐÚNG MỘT trong bốn hình dạng. Trường `trangThai` gọi là "trường phân biệt" (discriminant): TypeScript dùng đúng nó để biết bạn đang ở nhánh nào.\n\nMuốn dùng union này bạn viết `switch (man.trangThai)`. Điều làm union phân biệt mạnh hơn hẳn if/else là tính VÉT CẠN (exhaustiveness check): thêm nhánh `default` gán biến chưa xử lý vào một tham số kiểu `never`. `never` là kiểu "không có giá trị nào thuộc kiểu này" — nếu switch đã xử lý hết bốn trạng thái, biến còn lại ở default đúng là kiểu never thật. Nhưng nếu sau này bạn thêm trạng thái thứ năm (ví dụ "het_han") mà QUÊN thêm case cho nó, biến ở default sẽ có kiểu là trạng thái thứ năm đó — không gán được vào never — và trình biên dịch đỏ NGAY LÚC BIÊN DỊCH, trước khi code chạy lên production. Không có cách nào cố tình quên một trạng thái mà trót lọt qua tsc.',
    workedExample: {
      code: `interface MonHang {
  ten: string
  gia: number
}

// Bốn "hình dạng" — mỗi hình dạng là MỘT trạng thái, không trộn lẫn được với nhau
type ManHinh =
  | { trangThai: "dang_tai" }
  | { trangThai: "rong" }
  | { trangThai: "loi"; thongDiep: string }
  | { trangThai: "co_du_lieu"; danhSach: MonHang[] }

function ve(man: ManHinh): string {
  switch (man.trangThai) {
    case "dang_tai":
      return "Dang tai..."
    case "rong":
      return "Chua co don hang nao"
    case "loi":
      // Trong nhánh này TypeScript BIẾT man có trường thongDiep — không cần ép kiểu
      return \`Loi: \${man.thongDiep}\`
    case "co_du_lieu":
      return \`\${man.danhSach.length} don hang\`
    default: {
      // Nếu switch còn thiếu một trạng thái, "man" ở đây sẽ KHÔNG phải kiểu never
      // và dòng dưới bị TypeScript báo đỏ ngay lúc biên dịch.
      const kiemTraVetCan: never = man
      return kiemTraVetCan
    }
  }
}

console.log(ve({ trangThai: "dang_tai" }))
console.log(ve({ trangThai: "rong" }))
console.log(ve({ trangThai: "loi", thongDiep: "Mat mang" }))
console.log(ve({ trangThai: "co_du_lieu", danhSach: [{ ten: "Ao thun", gia: 150000 }] }))`,
      stdinLines: [],
    },
    predict: {
      code: `type ManHinh =
  | { trangThai: "dang_tai" }
  | { trangThai: "loi"; thongDiep: string }
  | { trangThai: "co_du_lieu"; danhSach: number[] }

function ve(man: ManHinh): string {
  switch (man.trangThai) {
    case "dang_tai":
      return "Dang tai"
    case "loi":
      return \`Loi: \${man.thongDiep}\`
    case "co_du_lieu":
      return \`\${man.danhSach.length} mon\`
    default: {
      const kiemTraVetCan: never = man
      return kiemTraVetCan
    }
  }
}

console.log(ve({ trangThai: "co_du_lieu", danhSach: [1, 2, 3] }))`,
      question: 'Chương trình in ra gì?',
      choices: ['3 mon', 'co_du_lieu', 'Dang tai', 'undefined mon'],
      answerIndex: 0,
      explain:
        'In ra "3 mon". Trường trangThai chỉ là NHÃN để switch chọn đúng nhánh — nó không tự in ra ("co_du_lieu" không xuất hiện ở đâu trong output, vì code không hề console.log trực tiếp trangThai). "Dang tai" sai vì đó là kết quả của nhánh KHÁC, không phải nhánh được gọi. "undefined mon" đánh lừa người nghĩ trường danhSach chưa được gán — nhưng đối tượng truyền vào có đủ danhSach: [1, 2, 3], nên .length tính đúng ra 3, không hề undefined.',
    },
    parsons: {
      prompt: 'Xếp lại hàm ve: switch theo trangThai, các case trước, default kiểm vét cạn ở cuối.',
      lines: [
        'function ve(man: ManHinh): string {',
        '  switch (man.trangThai) {',
        '    case "dang_tai":',
        '      return "Dang tai..."',
        '    case "loi":',
        '      return `Loi: ${man.thongDiep}`',
        '    default: {',
        '      const kiemTraVetCan: never = man',
        '      return kiemTraVetCan',
        '    }',
        '  }',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm ve(man: ManHinh): string trả về đúng chuỗi cho từng trạng thái, dùng kiểu ManHinh đã cho:\n\n  · "dang_tai" → trả về đúng chuỗi "Dang tai..."\n  · "rong" → trả về đúng chuỗi "Chua co don hang nao"\n  · "loi" → trả về "Loi: <thongDiep>"\n  · "co_du_lieu" → trả về "<số phần tử danhSach> don hang"\n\nBắt buộc: dùng switch theo man.trangThai, có nhánh default gán biến chưa xử lý vào kiểu never (kiểm tra vét cạn) — thiếu nhánh này bài coi như chưa đạt yêu cầu kỹ thuật dù test-case có thể vẫn qua. Không dùng if/else thay switch.',
      starterCode: `interface MonHang {
  ten: string
  gia: number
}

type ManHinh =
  | { trangThai: "dang_tai" }
  | { trangThai: "rong" }
  | { trangThai: "loi"; thongDiep: string }
  | { trangThai: "co_du_lieu"; danhSach: MonHang[] }

function ve(man: ManHinh): string {
  // TODO: switch theo man.trangThai, đủ 4 case + default kiểm vét cạn bằng never
  return ""
}

// ---- Đừng sửa phần dưới đây ----
console.log("Tai:", ve({ trangThai: "dang_tai" }))
console.log("Rong:", ve({ trangThai: "rong" }))
console.log("Loi:", ve({ trangThai: "loi", thongDiep: "Mat mang" }))
console.log(
  "DuLieu:",
  ve({
    trangThai: "co_du_lieu",
    danhSach: [
      { ten: "Ao thun", gia: 150000 },
      { ten: "Quan jean", gia: 350000 },
    ],
  }),
)`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Tai: Dang tai...',
          match: 'contains',
          hidden: false,
          label: 'Trạng thái đang tải',
        },
        {
          stdinLines: [],
          expected: 'Rong: Chua co don hang nao',
          match: 'contains',
          hidden: false,
          label: 'Trạng thái rỗng — khác "đang tải" và khác "0 don hang"',
        },
        {
          stdinLines: [],
          expected: 'Loi: Mat mang',
          match: 'contains',
          hidden: false,
          label: 'Trạng thái lỗi kèm thông điệp',
        },
        {
          stdinLines: [],
          expected: 'DuLieu: 2 don hang',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — trạng thái có dữ liệu, đếm đúng số phần tử danhSach',
        },
      ],
      hints: [
        'Bốn trạng thái ứng với đúng bốn case trong switch (man.trangThai): "dang_tai", "rong", "loi", "co_du_lieu". Mỗi case trả về đúng chuỗi đề yêu cầu.',
        'Ở case "loi" bạn truy cập man.thongDiep bình thường — TypeScript tự biết trong nhánh này man chắc chắn có trường đó, không cần ép kiểu `as`.',
        'Nhánh default không phải để "cho có" — gán `const x: never = man` bên trong nó chính là thứ khiến tsc báo lỗi nếu sau này ai thêm trạng thái mới mà quên xử lý.',
        'Khung tham chiếu:\n\nfunction ve(man: ManHinh): string {\n  switch (man.trangThai) {\n    case "dang_tai":\n      return "Dang tai..."\n    case "rong":\n      return "Chua co don hang nao"\n    case "loi":\n      return `Loi: ${man.thongDiep}`\n    case "co_du_lieu":\n      return `${man.danhSach.length} don hang`\n    default: {\n      const kiemTraVetCan: never = man\n      return kiemTraVetCan\n    }\n  }\n}',
      ],
      sampleSolution: `interface MonHang {
  ten: string
  gia: number
}

type ManHinh =
  | { trangThai: "dang_tai" }
  | { trangThai: "rong" }
  | { trangThai: "loi"; thongDiep: string }
  | { trangThai: "co_du_lieu"; danhSach: MonHang[] }

function ve(man: ManHinh): string {
  switch (man.trangThai) {
    case "dang_tai":
      return "Dang tai..."
    case "rong":
      return "Chua co don hang nao"
    case "loi":
      return \`Loi: \${man.thongDiep}\`
    case "co_du_lieu":
      return \`\${man.danhSach.length} don hang\`
    default: {
      const kiemTraVetCan: never = man
      return kiemTraVetCan
    }
  }
}

// ---- Đừng sửa phần dưới đây ----
console.log("Tai:", ve({ trangThai: "dang_tai" }))
console.log("Rong:", ve({ trangThai: "rong" }))
console.log("Loi:", ve({ trangThai: "loi", thongDiep: "Mat mang" }))
console.log(
  "DuLieu:",
  ve({
    trangThai: "co_du_lieu",
    danhSach: [
      { ten: "Ao thun", gia: 150000 },
      { ten: "Quan jean", gia: 350000 },
    ],
  }),
)`,
    },
    homework:
      'Tìm một màn hình bạn từng viết (hoặc đang viết) có từ hai biến trạng thái boolean/nullable trở lên đi cùng nhau (ví dụ dangTai + loi, hoặc daDang nhap + dangKiemTra). Liệt kê hết các tổ hợp KHÔNG có nghĩa mà kiểu dữ liệu hiện tại vẫn cho phép. Sau đó phác thảo lại bằng một union phân biệt có trường trạng thái duy nhất, và viết nhánh default kiểm vét cạn bằng never cho nó.',
    srsCards: [
      {
        hoi: 'Vì sao ba biến boolean rời rạc (dangTai, loi, duLieu) lại nguy hiểm hơn một union phân biệt?',
        dap: 'Vì ba biến độc lập cho phép mọi tổ hợp trong số 2×2×2 khả năng, kể cả tổ hợp vô nghĩa như "vừa tải vừa lỗi" — TypeScript không biết chúng phải loại trừ nhau. Union phân biệt gộp chúng thành một trường trạng thái duy nhất nên chỉ có đúng các hình dạng bạn khai.',
      },
      {
        hoi: 'Trường "phân biệt" (discriminant) trong union phân biệt dùng để làm gì?',
        dap: 'Là trường chung có giá trị chuỗi literal khác nhau ở mỗi nhánh (ví dụ trangThai). TypeScript đọc giá trị của nó trong switch/if để suy ra CHÍNH XÁC bạn đang ở hình dạng object nào, từ đó cho phép truy cập đúng các trường riêng của nhánh đó mà không cần ép kiểu.',
      },
      {
        hoi: 'Kiểm tra vét cạn (exhaustiveness check) bằng never hoạt động thế nào?',
        dap: 'Ở nhánh default, gán biến còn lại (sau khi đã loại hết các case đã xử lý) vào một tham số khai kiểu never. Nếu switch đã xử lý hết mọi trạng thái, biến đó thật sự có kiểu never nên gán được; còn thiếu case nào thì biến đó vẫn mang kiểu của trạng thái bị bỏ sót, gán vào never là lỗi kiểu — tsc báo đỏ ngay lúc biên dịch.',
      },
    ],
  },
  {
    id: 'p6-u17-l3',
    unitId: 'p6-u17',
    language: 'typescript',
    title: 'Không tin `as` — validate dữ liệu API lúc chạy',
    hook: 'Bạn gọi API "/api/mon-hang", ép kiểu kết quả bằng `as MonHang[]`, code biên dịch sạch không một cảnh báo. Hai tuần sau backend đổi tên trường `gia` thành `giaTien` mà không báo trước. TypeScript của bạn vẫn xanh — vì `as` chỉ là lời hứa miệng với trình biên dịch, không phải một phép kiểm tra. Production thì đỏ.',
    theory:
      'Trình biên dịch TypeScript chỉ đọc CODE của bạn, không bao giờ chạy CODE để xem dữ liệu thật ra sao. Khi bạn viết `const mon = raw as MonHang`, bạn không "chuyển đổi" gì cả — bạn chỉ đang NÓI VỚI TRÌNH BIÊN DỊCH: "tin tôi đi, cái này chắc chắn là MonHang". `as` không sinh ra một dòng code kiểm tra nào, không sinh ra runtime check nào — sau khi build xong nó biến mất hoàn toàn (xoá kiểu là việc TypeScript luôn làm khi biên dịch ra JavaScript). Nếu lời hứa đó sai — dữ liệu thật thiếu trường, sai kiểu, hoặc là null — chương trình vẫn chạy tiếp với một giá trị "trông giống" MonHang nhưng thật ra không phải, và nó vỡ ở một dòng code XA chỗ bạn ép kiểu, khiến việc tìm nguyên nhân khó hơn nhiều.\n\nDữ liệu từ mạng (JSON.parse, fetch, response API) đúng ra phải có kiểu `unknown` — TypeScript không thể biết trước hình dạng của nó, vì hình dạng đó do một hệ thống KHÁC (backend, đôi khi là bên thứ ba) quyết định, có thể đổi bất cứ lúc nào mà frontend không hay. `unknown` là kiểu an toàn: bạn không được dùng nó cho bất kỳ việc gì (đọc trường, gọi hàm...) cho tới khi đã THU HẸP kiểu bằng kiểm tra thật.\n\nCách làm đúng: viết một hàm ép kiểu AN TOÀN — nhận vào `unknown`, tự kiểm TỪNG trường bằng `typeof`/`Array.isArray`/so sánh trực tiếp, và chỉ trả về giá trị đã kiểm khi mọi trường đều đúng hình dạng mong đợi; sai thì bỏ qua phần tử đó hoặc ném lỗi rõ ràng — KHÔNG bao giờ dùng `as` để né việc kiểm tra. Hàm này gọi là "type guard viết tay": nó có kiểm tra CHẠY THẬT lúc runtime, khác hẳn `as` chỉ là khai báo suông.\n\nTrong dự án thật bạn hiếm khi viết tay từng type guard như vậy — CLAUDE.md của dự án này quy định dùng thư viện Zod (`z.object({...}).parse(raw)`). Ý tưởng của Zod y hệt những gì bạn vừa viết tay: định nghĩa "hình dạng mong đợi", kiểm dữ liệu thật khớp hình dạng đó lúc chạy, ném lỗi rõ ràng nếu không khớp — Zod chỉ gói việc đó lại thành một khai báo ngắn gọn thay vì if/typeof lặp đi lặp lại. Học cách viết type guard tay trước khi dùng Zod là để hiểu ĐÚNG Zod đang làm gì bên dưới, không phải gõ thần chú.',
    workedExample: {
      code: `interface MonHang {
  ten: string
  gia: number
}

// Type guard: kiểm MỘT giá trị unknown có đúng hình dạng MonHang không.
// "value is MonHang" là "type predicate" — báo cho TypeScript biết: nếu hàm này
// trả về true, từ chỗ gọi trở đi coi value là MonHang, không cần "as" nữa.
function laMonHang(value: unknown): value is MonHang {
  if (typeof value !== "object" || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.ten === "string" && typeof v.gia === "number"
}

// Dữ liệu từ mạng luôn coi là unknown — không biết trước hình dạng
function docDanhSachMonTuAPI(raw: unknown): MonHang[] {
  if (!Array.isArray(raw)) return []
  // Chỉ giữ phần tử ĐÃ QUA KIỂM TRA — không dùng "as" để ép cả mảng một lượt
  return raw.filter(laMonHang)
}

const duLieuThat: unknown = [
  { ten: "Ca phe sua", gia: 25000 },
  { ten: "Thieu gia" }, // sai hình dạng — sẽ bị lọc bỏ, không làm vỡ chương trình
  { ten: "Tra da", gia: "nam nghin" }, // gia sai kiểu — cũng bị lọc bỏ
]

const monHopLe = docDanhSachMonTuAPI(duLieuThat)
console.log(monHopLe.length)
console.log(monHopLe.map((m) => m.ten).join(", "))`,
      stdinLines: [],
    },
    predict: {
      code: `interface MonHang {
  ten: string
  gia: number
}

const duLieuTuAPI: unknown = { ten: "Ao thun" } // thiếu trường "gia"

// Cách SAI: ép kiểu bằng "as" thay vì kiểm tra
const mon = duLieuTuAPI as MonHang

console.log(typeof mon.gia, mon.gia)`,
      question: 'Chương trình in ra gì?',
      choices: ['undefined undefined', '0 0', 'NaN NaN', 'object undefined'],
      answerIndex: 0,
      explain:
        'In ra "undefined undefined". `as MonHang` chỉ là lời khai với trình biên dịch, không sinh ra bất kỳ kiểm tra nào lúc chạy — object thật sự vẫn chỉ có { ten }, nên mon.gia thật sự là undefined cả về giá trị lẫn typeof của nó. "0 0" và "NaN NaN" đánh lừa người nghĩ JavaScript tự gán một giá trị số mặc định cho trường thiếu — nó không làm vậy, đọc một thuộc tính không tồn tại luôn cho ra đúng undefined. "object undefined" sai vì typeof của giá trị undefined là chuỗi "undefined", không phải "object" (đó là bẫy kinh điển khác — typeof null mới là "object", còn typeof undefined luôn là "undefined").',
    },
    parsons: {
      prompt: 'Xếp lại type guard laMonHang: kiểm object trước, rồi mới kiểm từng trường.',
      lines: [
        'function laMonHang(value: unknown): value is MonHang {',
        '  if (typeof value !== "object" || value === null) return false',
        '  const v = value as Record<string, unknown>',
        '  return typeof v.ten === "string" && typeof v.gia === "number"',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm docDanhSachMon(raw: unknown): MonHang[] đọc dữ liệu "từ API" một cách an toàn.\n\ninterface MonHang { ten: string; gia: number }\n\nLuật:\n  · raw không phải mảng → trả về mảng rỗng [].\n  · Với mỗi phần tử trong raw: nếu KHÔNG phải object có ten kiểu string và gia kiểu number (số hữu hạn, không NaN) thì BỎ QUA phần tử đó, không đưa vào kết quả.\n  · Phần tử hợp lệ thì giữ nguyên trong mảng trả về, đúng thứ tự ban đầu.\n\nBắt buộc: KHÔNG được dùng từ khoá `as` để ép raw hay phần tử của nó sang kiểu MonHang/MonHang[] — mọi việc phải qua kiểm tra runtime thật (typeof, Array.isArray, so sánh). Bạn được phép dùng `as` NỘI BỘ chỉ để đọc object như Record<string, unknown> lúc kiểm tra (như trong ví dụ mẫu), nhưng không được dùng nó để khẳng định kết quả cuối là MonHang mà chưa qua kiểm tra thật.',
      starterCode: `interface MonHang {
  ten: string
  gia: number
}

function docDanhSachMon(raw: unknown): MonHang[] {
  // TODO: raw không phải mảng -> tra ve []
  // TODO: loc tung phan tu, chi giu phan tu co ten: string va gia: number huu han
  return []
}

// ---- Đừng sửa phần dưới đây ----
const hopLe = docDanhSachMon([
  { ten: "Ca phe sua", gia: 25000 },
  { ten: "Thieu gia" },
  { ten: "Tra da", gia: "nam nghin" },
  { ten: "Banh mi", gia: 20000 },
])
console.log("SoMon:", hopLe.length)
console.log("Ten:", hopLe.map((m) => m.ten).join(","))
console.log("KhongPhaiMang:", docDanhSachMon("khong phai mang").length)
console.log("MangRong:", docDanhSachMon([]).length)`,
      testCases: [
        {
          stdinLines: [],
          expected: 'SoMon: 2',
          match: 'contains',
          hidden: false,
          label: 'Lọc đúng 2/4 phần tử hợp lệ (bỏ thiếu trường + sai kiểu)',
        },
        {
          stdinLines: [],
          expected: 'Ten: Ca phe sua,Banh mi',
          match: 'contains',
          hidden: false,
          label: 'Giữ đúng thứ tự ban đầu, chỉ gồm phần tử hợp lệ',
        },
        {
          stdinLines: [],
          expected: 'KhongPhaiMang: 0',
          match: 'contains',
          hidden: false,
          label: 'raw không phải mảng → trả về rỗng, không ném lỗi',
        },
        {
          stdinLines: [],
          expected: 'MangRong: 0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — mảng rỗng đầu vào vẫn trả về mảng rỗng',
        },
      ],
      hints: [
        'Bắt đầu bằng: `if (!Array.isArray(raw)) return []`. Chặn ca "không phải mảng" ngay đầu để phần dưới chỉ cần lo lọc phần tử.',
        'Viết một hàm phụ kiểm MỘT phần tử: nhận `unknown`, trả boolean sau khi kiểm typeof object, khác null, rồi typeof của .ten và .gia. Đọc trường trên unknown thì phải ép sang Record<string, unknown> trước — đây là chỗ DUY NHẤT được dùng as.',
        'Số hữu hạn nghĩa là không NaN và không Infinity: dùng `Number.isFinite(v.gia)` thay vì chỉ `typeof v.gia === "number"`, vì NaN cũng có typeof là "number".',
        'Khung tham chiếu:\n\nfunction laMonHang(value: unknown): value is MonHang {\n  if (typeof value !== "object" || value === null) return false\n  const v = value as Record<string, unknown>\n  return typeof v.ten === "string" && typeof v.gia === "number" && Number.isFinite(v.gia)\n}\n\nfunction docDanhSachMon(raw: unknown): MonHang[] {\n  if (!Array.isArray(raw)) return []\n  return raw.filter(laMonHang)\n}',
      ],
      sampleSolution: `interface MonHang {
  ten: string
  gia: number
}

function laMonHang(value: unknown): value is MonHang {
  if (typeof value !== "object" || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.ten === "string" && typeof v.gia === "number" && Number.isFinite(v.gia)
}

function docDanhSachMon(raw: unknown): MonHang[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(laMonHang)
}

// ---- Đừng sửa phần dưới đây ----
const hopLe = docDanhSachMon([
  { ten: "Ca phe sua", gia: 25000 },
  { ten: "Thieu gia" },
  { ten: "Tra da", gia: "nam nghin" },
  { ten: "Banh mi", gia: 20000 },
])
console.log("SoMon:", hopLe.length)
console.log("Ten:", hopLe.map((m) => m.ten).join(","))
console.log("KhongPhaiMang:", docDanhSachMon("khong phai mang").length)
console.log("MangRong:", docDanhSachMon([]).length)`,
    },
    homework:
      'Tìm trong một dự án bạn từng viết (hoặc dự án DHCB này) mọi chỗ dùng `as` ngay sau kết quả fetch/JSON.parse. Với mỗi chỗ, tự hỏi: nếu backend đổi tên hoặc kiểu một trường mà không báo, code sẽ vỡ ở đâu — ngay tại chỗ ép kiểu, hay âm thầm trôi xa hơn thành NaN/undefined? Chọn một chỗ và viết lại bằng type guard tay (hoặc tra xem file đó đã dùng Zod chưa — dự án DHCB dùng Zod, xem CLAUDE.md mục 4).',
    srsCards: [
      {
        hoi: '`as` có sinh ra kiểm tra nào lúc chương trình chạy không?',
        dap: 'Không. `as` chỉ là lời khai với trình biên dịch lúc biên dịch, không sinh ra một dòng code kiểm tra runtime nào, và biến mất hoàn toàn khi TypeScript xoá kiểu để ra JavaScript — nếu dữ liệu thật sai hình dạng, chương trình vẫn chạy tiếp với giá trị sai mà không hề báo lỗi.',
      },
      {
        hoi: 'Vì sao dữ liệu từ API/JSON.parse nên coi là kiểu `unknown` thay vì ép thẳng sang kiểu mong muốn?',
        dap: 'Vì hình dạng thật của dữ liệu do một hệ thống khác (backend) quyết định và có thể đổi bất cứ lúc nào. `unknown` buộc bạn phải THU HẸP kiểu bằng kiểm tra thật trước khi dùng, thay vì tin suông vào một lời khai không được xác minh.',
      },
      {
        hoi: 'Ý tưởng của Zod (dùng trong dự án DHCB) giống type guard viết tay ở điểm nào?',
        dap: 'Cả hai đều định nghĩa hình dạng dữ liệu mong đợi rồi KIỂM TRA THẬT lúc chạy trên dữ liệu unknown, ném lỗi hoặc từ chối khi không khớp. Zod chỉ gói việc if/typeof lặp lại đó thành một khai báo schema ngắn gọn, không phải một ý tưởng khác.',
      },
    ],
  },
]
