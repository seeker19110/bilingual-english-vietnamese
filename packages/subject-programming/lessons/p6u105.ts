// lessons/p6u105.ts — P6-U105: HƯỚNG BACKEND, chặng S3 "Hệ phân tán" — Nền tảng lý thuyết
// (module `backend-s3-m1`).
//
// backend-s2 (p6-u102…u104) dạy trong PHẠM VI MỘT DỊCH VỤ (một CSDL, một cache, một hàng đợi).
// S3 mở sang NHIỀU dịch vụ/nhiều máy — hai bài ở đây dạy đúng hai sự thật gốc của hệ phân
// tán: dữ liệu phải CHIA RA nhiều máy (sharding) và một cuộc GỌI MẠNG có thể kết thúc ở trạng
// thái KHÔNG BIẾT (không phải chỉ thành công/thất bại như gọi hàm cùng tiến trình) — nối
// thẳng vào bài IDEMPOTENT đã học ở `p6-u104-l1` (hàng đợi), giờ áp dụng cho cả lệnh gọi mạng.
//
// Dùng làn `typescript`, mô phỏng bằng hàm thuần tất định — không mạng/CSDL thật.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U105_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u105-l1',
    unitId: 'p6-u105',
    language: 'typescript',
    title: 'Sharding bằng modulo — thêm một máy là xáo trộn gần hết dữ liệu',
    hook: 'Hệ thống của bạn chia dữ liệu người dùng ra 3 máy bằng công thức "mã người dùng chia lấy dư 3". Chạy ổn nhiều tháng. Rồi bạn thêm máy thứ 4 để chịu tải — và gần như MỌI người dùng đột nhiên bị tính lại thuộc về một máy KHÁC. Hệ thống phải chuyển dữ liệu ồ ạt chỉ vì thêm một máy.',
    theory:
      'SHARDING (phân mảnh) là chia dữ liệu ra nhiều máy để một máy không phải gánh hết. Cách đơn giản nhất: băm khoá thành một con số, rồi lấy CHIA DƯ cho số máy (modulo) — `may = bam(khoa) % so_may`.\n\nVấn đề chết người của modulo: nó phụ thuộc vào TỔNG SỐ MÁY. Đổi số máy từ N sang N+1 là đổi luôn PHÉP CHIA DƯ cho gần như mọi khoá — không phải một vài khoá bị dịch chuyển, mà là PHẦN LỚN khoá cùng lúc rơi sang máy khác. Với 6 khoá minh hoạ trong ví dụ mẫu, thêm đúng 1 máy (3→4) làm 5/6 khoá đổi chỗ — hệ thống phải sao chép lại gần như toàn bộ dữ liệu chỉ để thêm MỘT máy.\n\nCÁCH NGÀNH SỬA (chỉ cần hiểu Ý TƯỞNG, không cần cài trong bài này): CONSISTENT HASHING — thay vì chia dư theo số máy, đặt cả khoá lẫn máy lên một VÒNG TRÒN số (hash ring); mỗi khoá thuộc về máy GẦN NÓ NHẤT theo chiều kim đồng hồ trên vòng. Thêm một máy chỉ chèn nó vào MỘT điểm trên vòng — chỉ những khoá nằm giữa máy mới và máy liền trước nó bị dịch chuyển, phần còn lại của vòng KHÔNG đụng tới. Đây là kỹ thuật đứng sau hầu hết hệ phân tán thật (Cassandra, DynamoDB, memcached phân tán).\n\nBài học rút ra không phải "đừng dùng modulo" — với hệ nhỏ, cố định số máy thì modulo vẫn ổn, đơn giản, dễ hiểu. Bài học là: PHẢI BIẾT TRƯỚC cái giá khi hệ lớn lên, để chọn đúng kỹ thuật (modulo hay consistent hashing) THEO ĐÚNG QUY MÔ, không phải chọn bừa rồi trả giá lúc nửa đêm khi hệ thống đã có dữ liệu thật.',
    workedExample: {
      code: `// Bam mot khoa thanh so bang tong ma ky tu — don gian, tat dinh
function bamKhoa(khoa: string): number {
  let tong = 0
  for (const ch of khoa) tong += ch.charCodeAt(0)
  return tong
}

function chonMay(khoa: string, soMay: number): number {
  return bamKhoa(khoa) % soMay
}

const KHOA = ["user:1", "user:2", "user:3", "user:4", "user:5", "user:6"]

console.log("--- 3 may ---")
for (const k of KHOA) console.log(k, "->", chonMay(k, 3))

console.log("--- 4 may (them 1 may) ---")
for (const k of KHOA) console.log(k, "->", chonMay(k, 4))
// Doi chieu hai bang: 5/6 khoa DOI MAY chi vi them dung MOT may`,
      stdinLines: [],
    },
    predict: {
      code: `function bamKhoa(khoa: string): number {
  let tong = 0
  for (const ch of khoa) tong += ch.charCodeAt(0)
  return tong
}
function chonMay(khoa: string, soMay: number): number {
  return bamKhoa(khoa) % soMay
}
console.log(chonMay("user:1", 3), chonMay("user:1", 4))`,
      question: 'Khoá "user:1" được chọn máy nào khi hệ có 3 máy, và khi hệ có 4 máy?',
      choices: ['2 2', '2 3', '0 1', '2 0'],
      answerIndex: 0,
      explain:
        'Cả hai lần đều ra máy 2 — đây là khoá HIẾM HOI không bị đổi máy khi thêm node (trùng hợp về mặt số học, không phải quy luật). Ví dụ mẫu đã cho thấy 5/6 khoá khác thì đổi máy; "user:1" là ca ngoại lệ may mắn. Bẫy của bài: đừng nghĩ MỌI khoá đều đổi máy — chỉ là ĐA SỐ áp đảo, và bạn không đoán trước được khoá nào là ngoại lệ.',
    },
    parsons: {
      prompt: 'Xếp lại hàm đếm số khoá đổi máy khi số lượng máy thay đổi.',
      lines: [
        'function demThayDoi(danhSachKhoa: string[], soMayCu: number, soMayMoi: number): number {',
        '  let dem = 0',
        '  for (const khoa of danhSachKhoa) {',
        '    if (chonMay(khoa, soMayCu) !== chonMay(khoa, soMayMoi)) dem++',
        '  }',
        '  return dem',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm demThayDoi(danhSachKhoa, soMayCu, soMayMoi) đếm bao nhiêu khoá bị ĐỔI MÁY khi số lượng máy thay đổi.\n\n- Dùng lại đúng chonMay(khoa, soMay) = bamKhoa(khoa) % soMay như ví dụ mẫu (viết lại cả hai hàm bamKhoa và chonMay trong bài này).\n- Với mỗi khoá trong danhSachKhoa: nếu chonMay(khoa, soMayCu) KHÁC chonMay(khoa, soMayMoi) thì đếm thêm 1.\n- Trả về tổng số khoá bị đổi.',
      starterCode: `function bamKhoa(khoa: string): number {
  let tong = 0
  for (const ch of khoa) tong += ch.charCodeAt(0)
  return tong
}

function chonMay(khoa: string, soMay: number): number {
  return bamKhoa(khoa) % soMay
}

function demThayDoi(danhSachKhoa: string[], soMayCu: number, soMayMoi: number): number {
  // TODO: dem so khoa co chonMay khac nhau giua soMayCu va soMayMoi
  return 0
}

// ---- Đừng sửa phần dưới đây ----
const KHOA = ["user:1", "user:2", "user:3", "user:4", "user:5", "user:6"]
console.log("3->4 may:", demThayDoi(KHOA, 3, 4))
console.log("3->3 may:", demThayDoi(KHOA, 3, 3))
console.log("4->8 may:", demThayDoi(KHOA, 4, 8))`,
      testCases: [
        {
          stdinLines: [],
          expected: '3->4 may: 5',
          match: 'contains',
          hidden: false,
          label: 'Thêm 1 máy (3→4) → 5/6 khoá bị xáo trộn',
        },
        {
          stdinLines: [],
          expected: '3->3 may: 0',
          match: 'contains',
          hidden: false,
          label: 'Số máy không đổi → không khoá nào bị đổi chỗ',
        },
        {
          stdinLines: [],
          expected: '4->8 may:',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: gấp đôi số máy vẫn phải chạy đúng, không hardcode theo bộ 3→4',
        },
      ],
      hints: [
        'Viết lại đúng bamKhoa và chonMay như ví dụ mẫu — tổng mã ký tự rồi chia dư cho số máy.',
        'Duyệt từng khoá trong danhSachKhoa, so sánh chonMay(khoa, soMayCu) với chonMay(khoa, soMayMoi) — khác nhau thì đếm thêm 1.',
        'Không cần lưu danh sách khoá bị đổi, chỉ cần ĐẾM — một biến dem tăng dần là đủ.',
      ],
      sampleSolution: `function bamKhoa(khoa: string): number {
  let tong = 0
  for (const ch of khoa) tong += ch.charCodeAt(0)
  return tong
}

function chonMay(khoa: string, soMay: number): number {
  return bamKhoa(khoa) % soMay
}

function demThayDoi(danhSachKhoa: string[], soMayCu: number, soMayMoi: number): number {
  let dem = 0
  for (const khoa of danhSachKhoa) {
    if (chonMay(khoa, soMayCu) !== chonMay(khoa, soMayMoi)) dem++
  }
  return dem
}

// ---- Đừng sửa phần dưới đây ----
const KHOA = ["user:1", "user:2", "user:3", "user:4", "user:5", "user:6"]
console.log("3->4 may:", demThayDoi(KHOA, 3, 4))
console.log("3->3 may:", demThayDoi(KHOA, 3, 3))
console.log("4->8 may:", demThayDoi(KHOA, 4, 8))`,
    },
    homework:
      'Tra cứu "consistent hashing" (tiếng Anh, có nhiều hình minh hoạ vòng tròn dễ hiểu). Vẽ tay (giấy hoặc công cụ bất kỳ) một vòng tròn với 3 máy đặt sẵn và 6 khoá; đánh dấu khoá nào thuộc máy nào. Rồi thêm một máy thứ 4 vào một điểm trên vòng — đếm bằng tay có bao nhiêu khoá đổi máy. So sánh con số đó với 5/6 của modulo bạn vừa đo được trong bài.',
    srsCards: [
      {
        hoi: 'Sharding bằng modulo có vấn đề gì khi thêm hoặc bớt máy?',
        dap: 'Modulo phụ thuộc TỔNG SỐ MÁY — đổi số máy làm gần như MỌI khoá đổi kết quả chia dư cùng lúc, buộc hệ thống sao chép lại phần lớn dữ liệu chỉ vì thêm/bớt một máy.',
      },
      {
        hoi: 'Consistent hashing giải quyết vấn đề của modulo như thế nào?',
        dap: 'Đặt khoá và máy lên một VÒNG TRÒN số; mỗi khoá thuộc máy gần nó nhất theo chiều kim đồng hồ. Thêm một máy chỉ ảnh hưởng khoá nằm GIỮA máy mới và máy liền trước, không đụng tới phần còn lại của vòng.',
      },
      {
        hoi: 'Khi nào modulo sharding vẫn là lựa chọn hợp lý?',
        dap: 'Khi hệ nhỏ và số máy CỐ ĐỊNH, ít khi thay đổi — modulo đơn giản, dễ hiểu, đủ dùng. Vấn đề chỉ nổ ra khi cần thêm/bớt máy trên hệ đã có dữ liệu thật.',
      },
    ],
  },
  {
    id: 'p6-u105-l2',
    unitId: 'p6-u105',
    language: 'typescript',
    title: 'Gọi mạng khác gọi hàm: timeout không phải THẤT BẠI, mà là KHÔNG BIẾT',
    hook: 'Trong một tiến trình, gọi hàm chỉ có hai kết cục: chạy xong, hoặc ném lỗi — không có kết cục thứ ba. Qua mạng thì khác: bạn gửi lệnh "trừ 200.000đ" rồi máy chủ XỬ LÝ XONG, nhưng gói tin phản hồi bị rớt trên đường về. Bạn thấy TIMEOUT. Server đã trừ tiền chưa? Bạn không biết — và cách bạn xử lý sự KHÔNG BIẾT đó quyết định khách hàng bị trừ tiền một lần hay hai lần.',
    theory:
      'Gọi hàm cùng tiến trình có đúng HAI kết cục: THÀNH CÔNG hoặc LỖI (ném exception) — không có vùng xám. Gọi qua MẠNG có tới BA kết cục:\n\n1. THÀNH CÔNG — gửi đi, xử lý xong, nhận được phản hồi.\n2. THẤT BẠI CHẮC CHẮN — kết nối bị từ chối NGAY LẬP TỨC (server chưa hề nhận được yêu cầu). An toàn để gửi lại.\n3. **KHÔNG BIẾT (timeout)** — hết giờ chờ mà không thấy phản hồi. Yêu cầu có thể đã: (a) chưa tới server, (b) tới server nhưng đang xử lý dở, hoặc (c) server đã XỬ LÝ XONG nhưng phản hồi bị rớt trên đường về. Bạn KHÔNG có cách nào phân biệt ba khả năng đó chỉ bằng việc hết giờ chờ.\n\nCái bẫy: nhiều người mới coi timeout như "thất bại chắc chắn" rồi gửi lại y hệt như luật 2 — với khả năng (c), gửi lại là XỬ LÝ TRÙNG LẦN THỨ HAI.\n\nCách xử lý ĐÚNG, nối thẳng vào bài IDEMPOTENT đã học (`p6-u104-l1`, hàng đợi): mỗi yêu cầu mang một ID DUY NHẤT do CLIENT tạo (không phải server), giữ NGUYÊN qua mọi lần gửi lại. Server ghi nhớ các ID đã xử lý — gặp lại ID cũ thì BỎ QUA, không làm lại. Nhờ vậy: dù client gửi lại bao nhiêu lần sau timeout, server chỉ trừ tiền ĐÚNG MỘT LẦN.\n\nĐiều nguy hiểm nhất là làm NGƯỢC lại: mỗi lần gửi lại lại SINH ID MỚI (tưởng "để chắc ăn, gửi bản mới cho sạch") — server không có cách nào biết đó là yêu cầu trùng, và xử lý cả hai như hai giao dịch thật. Ví dụ mẫu minh hoạ đúng cặp đối lập này: cùng ID → trừ tiền một lần; ID khác nhau mỗi lần gửi → trừ tiền gấp đôi.',
    workedExample: {
      code: `type TaiKhoan = { soDu: number }

const daXuLy = new Set<string>() // cac ID da tung xu ly

function xuLyThanhToan(idYeuCau: string, taiKhoan: TaiKhoan, soTien: number): void {
  if (daXuLy.has(idYeuCau)) return // idempotent: da lam roi thi bo qua
  taiKhoan.soDu -= soTien
  daXuLy.add(idYeuCau)
}

// Kich ban DUNG: client giu NGUYEN id qua lan goi lai sau timeout
const taiKhoanA: TaiKhoan = { soDu: 1000000 }
xuLyThanhToan("thanh-toan-1", taiKhoanA, 200000)   // server xu ly xong, phan hoi bi rot
xuLyThanhToan("thanh-toan-1", taiKhoanA, 200000)   // client timeout -> GUI LAI dung id cu
console.log("Dung ID: so du con", taiKhoanA.soDu, "- xu ly", daXuLy.size, "lan")

// Kich ban SAI: client sinh ID MOI moi lan tuong la "gui ban sach"
const daXuLyB = new Set<string>()
function xuLyThanhToanB(idYeuCau: string, taiKhoan: TaiKhoan, soTien: number): void {
  if (daXuLyB.has(idYeuCau)) return
  taiKhoan.soDu -= soTien
  daXuLyB.add(idYeuCau)
}
const taiKhoanB: TaiKhoan = { soDu: 1000000 }
xuLyThanhToanB("req-A", taiKhoanB, 200000)
xuLyThanhToanB("req-B", taiKhoanB, 200000)   // id khac -> tuong la yeu cau MOI, tru lan 2
console.log("ID moi moi lan: so du con", taiKhoanB.soDu)`,
      stdinLines: [],
    },
    predict: {
      code: `const daXuLy = new Set<string>()
function xuLy(id: string, so: { gia: number }, tru: number) {
  if (daXuLy.has(id)) return
  so.gia -= tru
  daXuLy.add(id)
}
const vi = { gia: 500000 }
xuLy("a", vi, 100000)
xuLy("a", vi, 100000)
xuLy("a", vi, 100000)
console.log(vi.gia)`,
      question:
        'Cùng một ID "a" được gọi xuLy ba lần liên tiếp (mô phỏng client gửi lại 2 lần sau timeout). Số dư cuối là bao nhiêu?',
      choices: ['400000', '350000', '450000', '500000'],
      answerIndex: 0,
      explain:
        'Kết quả là 400000 — chỉ trừ MỘT lần 100.000 (500.000 − 100.000), dù hàm được gọi ba lần. Vì ID "a" đã có trong daXuLy sau lần gọi đầu, hai lần gọi sau bị chặn ngay ở dòng if. Đây chính là điểm mấu chốt: idempotent không phải "chặn được request thứ hai" — nó chặn được BẤT KỲ SỐ LẦN gửi lại nào, miễn ID giữ nguyên.',
    },
    parsons: {
      prompt: 'Xếp lại hàm xử lý thanh toán idempotent — kiểm ID đã xử lý TRƯỚC khi trừ tiền.',
      lines: [
        'function xuLyThanhToan(idYeuCau: string, taiKhoan: TaiKhoan, soTien: number): void {',
        '  if (daXuLy.has(idYeuCau)) return',
        '  taiKhoan.soDu -= soTien',
        '  daXuLy.add(idYeuCau)',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hệ mô phỏng client GỬI LẠI sau timeout theo hai chiến lược, rồi so sánh.\n\nHàm xuLyThanhToan(idYeuCau, taiKhoan, soTien, daXuLy) — idempotent: nếu idYeuCau đã có trong daXuLy (Set<string>) thì bỏ qua; chưa có thì trừ soTien khỏi taiKhoan.soDu rồi thêm idYeuCau vào daXuLy.\n\nChương trình chính (đừng sửa phần dưới): mô phỏng CÙNG một giao dịch 150.000đ bị timeout 2 lần (tổng 3 lần gọi) theo HAI chiến lược — "giu_id" (luôn dùng lại "giao-dich-1") và "id_moi" (mỗi lần tạo id khác: "gd-1", "gd-2", "gd-3") — trên hai tài khoản RIÊNG BIỆT cùng khởi điểm 1.000.000đ. In số dư cuối của cả hai.',
      starterCode: `type TaiKhoan = { soDu: number }

function xuLyThanhToan(
  idYeuCau: string,
  taiKhoan: TaiKhoan,
  soTien: number,
  daXuLy: Set<string>,
): void {
  // TODO: idempotent — id da co trong daXuLy thi bo qua, chua co thi tru tien roi ghi nhan
}

// ---- Đừng sửa phần dưới đây ----
const taiKhoanGiuId: TaiKhoan = { soDu: 1000000 }
const daXuLyGiuId = new Set<string>()
xuLyThanhToan("giao-dich-1", taiKhoanGiuId, 150000, daXuLyGiuId)
xuLyThanhToan("giao-dich-1", taiKhoanGiuId, 150000, daXuLyGiuId)
xuLyThanhToan("giao-dich-1", taiKhoanGiuId, 150000, daXuLyGiuId)

const taiKhoanIdMoi: TaiKhoan = { soDu: 1000000 }
const daXuLyIdMoi = new Set<string>()
xuLyThanhToan("gd-1", taiKhoanIdMoi, 150000, daXuLyIdMoi)
xuLyThanhToan("gd-2", taiKhoanIdMoi, 150000, daXuLyIdMoi)
xuLyThanhToan("gd-3", taiKhoanIdMoi, 150000, daXuLyIdMoi)

console.log("Giu id:", taiKhoanGiuId.soDu)
console.log("Id moi:", taiKhoanIdMoi.soDu)`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Giu id: 850000',
          match: 'contains',
          hidden: false,
          label: 'Giữ nguyên ID qua 3 lần gọi → chỉ trừ MỘT lần 150.000đ',
        },
        {
          stdinLines: [],
          expected: 'Id moi: 550000',
          match: 'contains',
          hidden: false,
          label: 'Mỗi lần sinh ID mới → trừ CẢ BA lần, mất 450.000đ',
        },
        {
          stdinLines: [],
          expected: 'Giu id: 850000\nId moi: 550000',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đối chiếu cả hai dòng cùng lúc, đúng thứ tự in',
        },
      ],
      hints: [
        'Điều kiện chặn PHẢI đứng đầu hàm: if (daXuLy.has(idYeuCau)) return — trước khi đụng tới taiKhoan.soDu.',
        'Chỉ khi ID CHƯA có trong daXuLy mới: taiKhoan.soDu -= soTien rồi daXuLy.add(idYeuCau).',
        'Không cần sửa gì ở phần "đừng sửa" — hai Set daXuLyGiuId/daXuLyIdMoi độc lập nhau, tự nó tạo ra khác biệt giữa hai chiến lược.',
      ],
      sampleSolution: `type TaiKhoan = { soDu: number }

function xuLyThanhToan(
  idYeuCau: string,
  taiKhoan: TaiKhoan,
  soTien: number,
  daXuLy: Set<string>,
): void {
  if (daXuLy.has(idYeuCau)) return
  taiKhoan.soDu -= soTien
  daXuLy.add(idYeuCau)
}

// ---- Đừng sửa phần dưới đây ----
const taiKhoanGiuId: TaiKhoan = { soDu: 1000000 }
const daXuLyGiuId = new Set<string>()
xuLyThanhToan("giao-dich-1", taiKhoanGiuId, 150000, daXuLyGiuId)
xuLyThanhToan("giao-dich-1", taiKhoanGiuId, 150000, daXuLyGiuId)
xuLyThanhToan("giao-dich-1", taiKhoanGiuId, 150000, daXuLyGiuId)

const taiKhoanIdMoi: TaiKhoan = { soDu: 1000000 }
const daXuLyIdMoi = new Set<string>()
xuLyThanhToan("gd-1", taiKhoanIdMoi, 150000, daXuLyIdMoi)
xuLyThanhToan("gd-2", taiKhoanIdMoi, 150000, daXuLyIdMoi)
xuLyThanhToan("gd-3", taiKhoanIdMoi, 150000, daXuLyIdMoi)

console.log("Giu id:", taiKhoanGiuId.soDu)
console.log("Id moi:", taiKhoanIdMoi.soDu)`,
    },
    homework:
      'Tra cứu tài liệu của một thư viện gọi HTTP bạn biết (fetch, axios, requests của Python…) — nó có tự động RETRY khi gặp timeout không, và nếu có thì retry đó có mang theo idempotency key không? Viết ra 2-3 câu: nếu bạn đang thiết kế API thanh toán thật, bạn sẽ bắt CLIENT gửi kèm trường "idempotency key" trong mọi yêu cầu ghi dữ liệu (POST/PUT), hay để SERVER tự đoán? Vì sao id phải do client sinh, không phải server?',
    srsCards: [
      {
        hoi: 'Gọi mạng khác gọi hàm cùng tiến trình ở điểm nào?',
        dap: 'Gọi hàm chỉ có 2 kết cục: thành công hoặc lỗi. Gọi mạng có 3 kết cục: thành công, thất bại chắc chắn (an toàn gửi lại), và KHÔNG BIẾT (timeout — có thể server đã xử lý xong nhưng phản hồi bị rớt).',
      },
      {
        hoi: 'Vì sao coi timeout là "thất bại chắc chắn" rồi gửi lại là nguy hiểm?',
        dap: 'Vì server có thể ĐÃ xử lý xong yêu cầu, chỉ là phản hồi bị mất — gửi lại như một yêu cầu mới sẽ xử lý TRÙNG LẦN THỨ HAI (vd trừ tiền hai lần) nếu không có cơ chế idempotent.',
      },
      {
        hoi: 'ID yêu cầu (idempotency key) phải do ai sinh ra và giữ nguyên khi nào?',
        dap: 'Do CLIENT sinh ra (không phải server), và phải GIỮ NGUYÊN qua mọi lần gửi lại cùng một ý định — server dựa vào ID đó để nhận ra yêu cầu trùng và bỏ qua, dù được gọi bao nhiêu lần.',
      },
    ],
  },
]
