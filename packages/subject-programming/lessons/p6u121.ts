// lessons/p6u121.ts — P6-U121: HƯỚNG DỮ LIỆU, chặng S2 — Mô hình hoá kho dữ liệu
// (module `data-s2-m2`).
//
// u117 dạy ĐƯA dữ liệu vào kho cho đúng và chạy lại được. Unit này trả lời câu kế tiếp:
// đưa vào rồi thì XẾP thế nào để người phân tích tự trả lời được câu hỏi của họ. Hai bài:
// star schema (bảng sự kiện + bảng chiều) và chiều biến đổi chậm (SCD type 2) — thứ quyết
// định báo cáo quá khứ của bạn có kể đúng lịch sử hay không.
//
// Dùng làn `typescript`, mô phỏng bằng hàm thuần tất định — không kho dữ liệu thật.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U121_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u121-l1',
    unitId: 'p6-u121',
    language: 'typescript',
    title: 'Star schema — bảng sự kiện đo cái gì, bảng chiều mô tả cái đó',
    hook: 'CSDL vận hành của cửa hàng có 40 bảng chuẩn hoá đẹp đẽ. Chị kế toán muốn biết "doanh thu theo tỉnh theo tháng" và phải nối 7 bảng mới ra được — nên chị bỏ cuộc, quay lại xuất Excel bằng tay. Kho dữ liệu tồn tại để sửa đúng chuyện đó: không phải để lưu, mà để CÂU HỎI TRỞ NÊN DỄ HỎI.',
    theory:
      'STAR SCHEMA (lược đồ hình sao) chia mọi bảng trong kho phân tích thành đúng HAI LOẠI:\n\n**BẢNG SỰ KIỆN (fact table)** — mỗi dòng là một việc ĐÃ XẢY RA, đo được bằng số: một lượt bán, một lần đăng nhập, một cuộc gọi. Cột của nó gồm các SỐ ĐO (measure: số lượng, thành tiền) và các KHOÁ trỏ sang bảng chiều. Bảng sự kiện rất dài (hàng trăm triệu dòng) nhưng hẹp, và chỉ được THÊM chứ hầu như không sửa.\n\n**BẢNG CHIỀU (dimension table)** — mỗi dòng mô tả một THỰC THỂ tham gia sự kiện: sản phẩm, khách hàng, cửa hàng, ngày. Ngắn (vài nghìn tới vài triệu dòng) nhưng rộng, chứa mọi thuộc tính người ta muốn dùng để LỌC và NHÓM: tên, nhóm hàng, tỉnh, phân khúc khách.\n\nVẽ ra thì bảng sự kiện nằm giữa, các bảng chiều toả ra xung quanh — nhìn như một ngôi sao, nên có tên đó. Mọi câu hỏi phân tích khi ấy có cùng một hình dạng: **NHÓM theo thuộc tính của chiều, CỘNG số đo của bảng sự kiện.** "Doanh thu theo tỉnh theo tháng" chỉ còn là hai phép nối, và chị kế toán tự viết được.\n\nVài quy tắc quan trọng khi mô hình hoá:\n\n- **HẠT (grain) phải được tuyên bố trước tiên và bằng một câu.** "Mỗi dòng là MỘT DÒNG HÀNG trong một hoá đơn" khác hẳn "mỗi dòng là MỘT HOÁ ĐƠN". Trộn hai hạt trong cùng bảng là nguồn gốc của mọi con số tổng bị nhân đôi về sau.\n- **KHOÁ THAY THẾ (surrogate key)**: bảng chiều dùng một id kỹ thuật do kho tự sinh, không dùng thẳng mã của hệ vận hành — vì mã nguồn có thể đổi, bị dùng lại, hoặc trùng giữa hai hệ, còn khoá thay thế thì không.\n- **CỐ Ý KHÔNG CHUẨN HOÁ SÂU.** Ở kho vận hành, tách "tỉnh" ra bảng riêng là đúng đắn (tránh lặp). Ở kho phân tích, để thẳng cột `tinh` trong chiều cửa hàng là đúng đắn — mỗi lần tách thêm một bảng là mỗi câu hỏi phải nối thêm một lần.\n\nCuối cùng là ba lớp mà đường ống đi qua, ngành gọi bằng nhiều tên nhưng ý như nhau: **THÔ** (bản sao y nguyên của nguồn, không sửa gì — để dựng lại được) → **SẠCH** (đã chuẩn hoá kiểu, khử trùng, sửa đơn vị) → **PHỤC VỤ** (đã dựng thành star schema cho người dùng cuối). Người phân tích chỉ đọc lớp phục vụ; lớp thô là lưới an toàn khi phát hiện logic sai.',
    workedExample: {
      code: `interface ChieuSanPham {
  id: number // khoa thay the do kho tu sinh
  ten: string
  nhom: string
}

interface SuKienBan {
  sanPhamId: number // khoa tro sang chieu
  soLuong: number // so do
  thanhTien: number // so do
}

const CHIEU_SP: ChieuSanPham[] = [
  { id: 1, ten: "Ca phe sua", nhom: "Do uong" },
  { id: 2, ten: "Tra dao", nhom: "Do uong" },
  { id: 3, ten: "Banh mi", nhom: "Do an" },
]

const SU_KIEN: SuKienBan[] = [
  { sanPhamId: 1, soLuong: 2, thanhTien: 50000 },
  { sanPhamId: 3, soLuong: 1, thanhTien: 20000 },
  { sanPhamId: 2, soLuong: 3, thanhTien: 90000 },
  { sanPhamId: 1, soLuong: 1, thanhTien: 25000 },
]

// Cau hoi phan tich luon co CUNG mot hinh dang:
// noi su kien voi chieu -> nhom theo thuoc tinh cua chieu -> cong so do.
function doanhThuTheoNhom(suKien: SuKienBan[], chieu: ChieuSanPham[]): Map<string, number> {
  const nhomCuaId = new Map<number, string>()
  for (const c of chieu) nhomCuaId.set(c.id, c.nhom)

  const ketQua = new Map<string, number>()
  for (const s of suKien) {
    const nhom = nhomCuaId.get(s.sanPhamId) ?? "Khong ro"
    ketQua.set(nhom, (ketQua.get(nhom) ?? 0) + s.thanhTien)
  }
  return ketQua
}

for (const [nhom, tien] of doanhThuTheoNhom(SU_KIEN, CHIEU_SP)) {
  console.log(nhom + ":", tien)
}`,
      stdinLines: [],
    },
    predict: {
      code: `interface SuKien {
  sanPhamId: number
  thanhTien: number
}
const SU_KIEN: SuKien[] = [
  { sanPhamId: 1, thanhTien: 50000 },
  { sanPhamId: 9, thanhTien: 30000 },
]
const nhomCuaId = new Map<number, string>([[1, "Do uong"]])
const ketQua = new Map<string, number>()
for (const s of SU_KIEN) {
  const nhom = nhomCuaId.get(s.sanPhamId) ?? "Khong ro"
  ketQua.set(nhom, (ketQua.get(nhom) ?? 0) + s.thanhTien)
}
for (const [nhom, tien] of ketQua) console.log(nhom + "=" + tien)`,
      question:
        'Sự kiện thứ hai trỏ tới sản phẩm id 9 — id này KHÔNG có trong bảng chiều. Chương trình in ra gì?',
      choices: [
        'Do uong=50000\nKhong ro=30000',
        'Chi mot dong: Do uong=50000, su kien mo coi bi bo qua',
        'Chi mot dong: Do uong=80000, gop het vao nhom co san',
        'Chuong trinh dung lai vi khong tim thay id 9',
      ],
      answerIndex: 0,
      explain:
        'Sự kiện MỒ CÔI (trỏ tới khoá chiều không tồn tại) không tự biến mất: ở đây nó rơi vào nhóm "Khong ro" và vẫn được cộng tiền. Đó là hành vi ĐÚNG mà bạn nên chủ động chọn — tổng doanh thu vẫn khớp với nguồn, và cái nhóm "Khong ro" chình ình trong báo cáo chính là cảnh báo rằng bảng chiều đang thiếu dữ liệu. Nếu lặng lẽ bỏ qua sự kiện mồ côi, tiền sẽ biến mất khỏi báo cáo mà không ai biết.',
    },
    parsons: {
      prompt:
        'Xếp lại vòng lặp cộng dồn số đo theo thuộc tính của chiều (đã có sẵn map nhomCuaId).',
      lines: [
        'const ketQua = new Map<string, number>()',
        'for (const s of suKien) {',
        '  const nhom = nhomCuaId.get(s.sanPhamId) ?? "Khong ro"',
        '  ketQua.set(nhom, (ketQua.get(nhom) ?? 0) + s.thanhTien)',
        '}',
        'return ketQua',
      ],
    },
    make: {
      prompt:
        'Viết hàm doanhThuTheoTinh(suKien, chieuCuaHang) dựng báo cáo doanh thu theo TỈNH từ star schema.\n\n- chieuCuaHang: mảng { id, ten, tinh }.\n- suKien: mảng { cuaHangId, thanhTien }.\n- Nối sự kiện với chiều qua cuaHangId, cộng thanhTien theo cột `tinh`.\n- Sự kiện MỒ CÔI (cuaHangId không có trong chiều) phải vào nhóm "Khong ro", KHÔNG được bỏ đi — tổng báo cáo phải luôn khớp tổng nguồn.\n- Trả về Map<string, number>.',
      starterCode: `interface ChieuCuaHang {
  id: number
  ten: string
  tinh: string
}

interface SuKienBan {
  cuaHangId: number
  thanhTien: number
}

function doanhThuTheoTinh(suKien: SuKienBan[], chieu: ChieuCuaHang[]): Map<string, number> {
  // TODO
  return new Map<string, number>()
}

// ---- Đừng sửa phần dưới đây ----
const CHIEU: ChieuCuaHang[] = [
  { id: 1, ten: "Quan 1", tinh: "TP HCM" },
  { id: 2, ten: "Thu Duc", tinh: "TP HCM" },
  { id: 3, ten: "Hai Chau", tinh: "Da Nang" },
]
const SU_KIEN: SuKienBan[] = [
  { cuaHangId: 1, thanhTien: 50000 },
  { cuaHangId: 3, thanhTien: 20000 },
  { cuaHangId: 2, thanhTien: 30000 },
  { cuaHangId: 9, thanhTien: 10000 },
]
const bc = doanhThuTheoTinh(SU_KIEN, CHIEU)
for (const [tinh, tien] of bc) console.log(tinh + "=" + tien)
let tong = 0
for (const t of bc.values()) tong += t
console.log("Tong bao cao:", tong)`,
      testCases: [
        {
          stdinLines: [],
          expected: 'TP HCM=80000',
          match: 'contains',
          hidden: false,
          label: 'TP HCM gộp hai cửa hàng Quận 1 + Thủ Đức: 50.000 + 30.000',
        },
        {
          stdinLines: [],
          expected: 'Da Nang=20000',
          match: 'contains',
          hidden: false,
          label: 'Đà Nẵng chỉ có Hải Châu: 20.000',
        },
        {
          stdinLines: [],
          expected: 'Khong ro=10000',
          match: 'contains',
          hidden: false,
          label: 'Sự kiện mồ côi (cửa hàng id 9) vào nhóm "Khong ro", không bị bỏ',
        },
        {
          stdinLines: [],
          expected: 'Tong bao cao: 110000',
          match: 'contains',
          hidden: false,
          label: 'Tổng báo cáo khớp đúng tổng nguồn 110.000 — bằng chứng không mất tiền',
        },
        {
          stdinLines: [],
          expected: 'TP HCM=80000\nDa Nang=20000\nKhong ro=10000\nTong bao cao: 110000',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đủ bốn dòng đúng thứ tự xuất hiện lần đầu của từng tỉnh',
        },
      ],
      hints: [
        'Bước 1: dựng một Map<number, string> tra tỉnh theo id cửa hàng — duyệt mảng chiều một lần duy nhất, đừng tìm tuyến tính trong vòng lặp sự kiện.',
        'Bước 2: duyệt sự kiện, lấy tỉnh bằng map.get(...) ?? "Khong ro", rồi cộng dồn: ketQua.set(tinh, (ketQua.get(tinh) ?? 0) + s.thanhTien).',
        'Thứ tự dòng in ra là thứ tự CHÈN vào Map (JavaScript giữ nguyên) — nên nếu bạn duyệt sự kiện đúng thứ tự mảng thì TP HCM ra trước, rồi Da Nang, rồi Khong ro.',
      ],
      sampleSolution: `interface ChieuCuaHang {
  id: number
  ten: string
  tinh: string
}

interface SuKienBan {
  cuaHangId: number
  thanhTien: number
}

function doanhThuTheoTinh(suKien: SuKienBan[], chieu: ChieuCuaHang[]): Map<string, number> {
  const tinhCuaId = new Map<number, string>()
  for (const c of chieu) tinhCuaId.set(c.id, c.tinh)

  const ketQua = new Map<string, number>()
  for (const s of suKien) {
    const tinh = tinhCuaId.get(s.cuaHangId) ?? "Khong ro"
    ketQua.set(tinh, (ketQua.get(tinh) ?? 0) + s.thanhTien)
  }
  return ketQua
}

// ---- Đừng sửa phần dưới đây ----
const CHIEU: ChieuCuaHang[] = [
  { id: 1, ten: "Quan 1", tinh: "TP HCM" },
  { id: 2, ten: "Thu Duc", tinh: "TP HCM" },
  { id: 3, ten: "Hai Chau", tinh: "Da Nang" },
]
const SU_KIEN: SuKienBan[] = [
  { cuaHangId: 1, thanhTien: 50000 },
  { cuaHangId: 3, thanhTien: 20000 },
  { cuaHangId: 2, thanhTien: 30000 },
  { cuaHangId: 9, thanhTien: 10000 },
]
const bc = doanhThuTheoTinh(SU_KIEN, CHIEU)
for (const [tinh, tien] of bc) console.log(tinh + "=" + tien)
let tong = 0
for (const t of bc.values()) tong += t
console.log("Tong bao cao:", tong)`,
    },
    homework:
      'Lấy một hệ thống bạn hiểu (quán ăn, lớp học, app của bạn) và viết ra giấy một star schema: một câu tuyên bố HẠT của bảng sự kiện, danh sách số đo, và 3–4 bảng chiều kèm các thuộc tính người ta sẽ muốn lọc/nhóm theo. Rồi thử đặt 5 câu hỏi phân tích và kiểm xem mô hình của bạn trả lời được cả 5 không. Câu nào không trả lời được thường là do thiếu một thuộc tính trong chiều — bổ sung rồi ghi lại vì sao ban đầu bạn quên nó.',
    srsCards: [
      {
        hoi: 'Bảng sự kiện và bảng chiều khác nhau thế nào trong star schema?',
        dap: 'Bảng sự kiện ghi việc đã xảy ra kèm số đo (số lượng, thành tiền) và khoá trỏ sang chiều — rất dài mà hẹp. Bảng chiều mô tả thực thể (sản phẩm, cửa hàng, ngày) với các thuộc tính để lọc và nhóm — ngắn mà rộng.',
      },
      {
        hoi: 'Tuyên bố HẠT (grain) của bảng sự kiện nghĩa là gì, và vì sao phải làm trước tiên?',
        dap: 'Là câu nói rõ "mỗi dòng đại diện cho đúng cái gì" (một dòng hàng, hay một hoá đơn). Phải chốt trước vì trộn hai hạt trong cùng một bảng làm mọi con số tổng bị nhân lên mà không có dấu hiệu báo lỗi.',
      },
      {
        hoi: 'Vì sao kho phân tích CỐ Ý không chuẩn hoá sâu như kho vận hành?',
        dap: 'Mỗi lần tách thêm một bảng là mỗi câu hỏi phân tích phải nối thêm một lần. Kho phân tích tối ưu cho việc hỏi dễ và đọc nhanh, còn kho vận hành tối ưu cho việc ghi và tránh lặp dữ liệu.',
      },
      {
        hoi: 'Ba lớp thô → sạch → phục vụ, và vai trò của lớp thô là gì?',
        dap: 'Thô là bản sao y nguyên nguồn, sạch là đã chuẩn kiểu và khử trùng, phục vụ là star schema cho người dùng cuối. Lớp thô là lưới an toàn: phát hiện logic biến đổi sai thì dựng lại được tất cả mà không cần xin lại nguồn.',
      },
    ],
  },
  {
    id: 'p6-u121-l2',
    unitId: 'p6-u121',
    language: 'typescript',
    title: 'Chiều biến đổi chậm (SCD type 2) — báo cáo quá khứ phải kể đúng chuyện quá khứ',
    hook: 'Tháng 5 chị Lan làm ở cửa hàng Quận 1 và bán được 50 triệu. Tháng 6 chị chuyển sang Thủ Đức. Bạn cập nhật bảng nhân viên — một dòng UPDATE, mất nửa giây. Và ngay lập tức, báo cáo doanh thu THÁNG 5 của cửa hàng Quận 1 tụt mất 50 triệu, vì hệ thống nay tin rằng chị Lan luôn luôn thuộc Thủ Đức.',
    theory:
      'Thuộc tính của bảng chiều có đổi, nhưng đổi CHẬM: khách chuyển địa chỉ, sản phẩm đổi nhóm hàng, nhân viên đổi cửa hàng. Ngành gọi đó là CHIỀU BIẾN ĐỔI CHẬM (SCD — Slowly Changing Dimension), và có mấy cách xử lý, đánh số theo truyền thống của Kimball:\n\n**TYPE 1 — GHI ĐÈ.** Sửa thẳng giá trị cũ, không giữ lịch sử. Đơn giản và đúng khi giá trị cũ là SAI (gõ nhầm tên, sai chính tả). Nhưng nếu giá trị cũ là ĐÚNG ở thời điểm của nó, ghi đè sẽ viết lại quá khứ như trong cảnh mở đầu.\n\n**TYPE 2 — THÊM DÒNG MỚI, GIỮ LỊCH SỬ.** Mỗi lần thuộc tính đổi, dòng cũ được ĐÓNG lại và một dòng mới mở ra. Mỗi dòng mang thêm ba cột kỹ thuật:\n\n- `hieuLucTu` — từ thời điểm nào giá trị này đúng\n- `hieuLucDen` — tới thời điểm nào (dòng đang mở để `null` hoặc một mốc rất xa)\n- `laHienTai` — cờ tiện dụng để lọc nhanh dòng đang có hiệu lực\n\nKhoá tự nhiên (mã nhân viên) khi đó KHÔNG còn duy nhất trong bảng chiều — một nhân viên có nhiều dòng. Cái duy nhất là khoá thay thế (surrogate key) mà bài trước đã nói: **mỗi PHIÊN BẢN của một thực thể là một khoá thay thế riêng.** Bảng sự kiện lưu khoá thay thế ĐÚNG TẠI THỜI ĐIỂM sự kiện xảy ra, nên nó vĩnh viễn trỏ về phiên bản đúng — báo cáo tháng 5 tự động kể chuyện tháng 5, không cần logic đặc biệt nào.\n\nQuy tắc chọn: **hỏi "nếu giá trị này đổi, báo cáo cũ có nên đổi theo không?"** Nên đổi (sửa lỗi gõ) → type 1. Không nên đổi (chuyển cửa hàng, đổi phân khúc khách) → type 2. Type 2 tốn chỗ và làm truy vấn phức tạp hơn, nên đừng áp cho MỌI cột — chỉ những cột mà lịch sử thật sự có ý nghĩa.\n\nCái bẫy hay gặp nhất khi tự cài type 2: **quên đóng dòng cũ.** Lúc đó một nhân viên có hai dòng cùng `laHienTai = true`, và mọi phép nối với bảng sự kiện sẽ NHÂN ĐÔI doanh thu. Vì vậy bất biến bắt buộc phải có test canh: **với mỗi khoá tự nhiên, đúng MỘT dòng đang mở.**',
    workedExample: {
      code: `interface DongChieu {
  khoaThayThe: number
  maNhanVien: string
  cuaHang: string
  hieuLucTu: string
  hieuLucDen: string // "" nghia la dang mo
  laHienTai: boolean
}

// SCD type 2: DONG dong cu lai roi MO dong moi, khong ghi de.
function apDungType2(
  lichSu: DongChieu[],
  maNhanVien: string,
  cuaHangMoi: string,
  ngay: string,
): DongChieu[] {
  const ketQua: DongChieu[] = []
  let khoaLonNhat = 0
  for (const d of lichSu) {
    if (d.khoaThayThe > khoaLonNhat) khoaLonNhat = d.khoaThayThe
    // Dong dang mo cua DUNG nhan vien nay thi dong lai
    if (d.maNhanVien === maNhanVien && d.laHienTai) {
      ketQua.push({ ...d, hieuLucDen: ngay, laHienTai: false })
    } else {
      ketQua.push(d)
    }
  }
  ketQua.push({
    khoaThayThe: khoaLonNhat + 1,
    maNhanVien,
    cuaHang: cuaHangMoi,
    hieuLucTu: ngay,
    hieuLucDen: "",
    laHienTai: true,
  })
  return ketQua
}

const BAN_DAU: DongChieu[] = [
  {
    khoaThayThe: 1,
    maNhanVien: "NV01",
    cuaHang: "Quan 1",
    hieuLucTu: "2026-01-01",
    hieuLucDen: "",
    laHienTai: true,
  },
]

const sau = apDungType2(BAN_DAU, "NV01", "Thu Duc", "2026-06-01")
for (const d of sau) {
  console.log(d.khoaThayThe, d.cuaHang, d.hieuLucTu, "->", d.hieuLucDen || "dang mo")
}
console.log("So dong dang mo:", sau.filter((d) => d.laHienTai).length)`,
      stdinLines: [],
    },
    predict: {
      code: `interface DongChieu {
  maNhanVien: string
  cuaHang: string
  laHienTai: boolean
}
const LICH_SU: DongChieu[] = [
  { maNhanVien: "NV01", cuaHang: "Quan 1", laHienTai: true },
  { maNhanVien: "NV01", cuaHang: "Thu Duc", laHienTai: true },
]
const SU_KIEN = [{ maNhanVien: "NV01", tien: 50000 }]
let tong = 0
for (const s of SU_KIEN) {
  for (const d of LICH_SU) {
    if (d.maNhanVien === s.maNhanVien && d.laHienTai) tong += s.tien
  }
}
console.log("Tong:", tong)`,
      question:
        'Người viết QUÊN đóng dòng cũ nên NV01 có hai dòng cùng laHienTai = true. Nối với một sự kiện 50.000đ ra tổng bao nhiêu?',
      choices: ['Tong: 100000', 'Tong: 50000', 'Tong: 0', 'Tong: 25000'],
      answerIndex: 0,
      explain:
        'Sự kiện khớp với CẢ HAI dòng đang mở nên tiền được cộng hai lần — doanh thu phình gấp đôi mà không có bất kỳ thông báo lỗi nào. Đây là lý do bất biến "mỗi khoá tự nhiên đúng MỘT dòng đang mở" phải có test canh gác, chứ không thể trông vào việc người soạn nhớ đóng dòng cũ.',
    },
    parsons: {
      prompt:
        'Xếp lại phần đóng dòng cũ trong SCD type 2 (bên trong vòng lặp duyệt lịch sử hiện có).',
      lines: [
        'if (d.maNhanVien === maNhanVien && d.laHienTai) {',
        '  ketQua.push({ ...d, hieuLucDen: ngay, laHienTai: false })',
        '} else {',
        '  ketQua.push(d)',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm traCuuTaiThoiDiem(lichSu, maNhanVien, ngay) trả về cửa hàng mà một nhân viên thuộc về TẠI MỘT NGÀY trong quá khứ.\n\nMỗi dòng lịch sử có: maNhanVien, cuaHang, hieuLucTu, hieuLucDen (chuỗi rỗng "" nghĩa là dòng đang mở).\n\nQuy tắc: dòng khớp là dòng có đúng maNhanVien VÀ hieuLucTu <= ngay VÀ (hieuLucDen === "" HOẶC ngay < hieuLucDen). So sánh chuỗi ngày dạng YYYY-MM-DD bằng toán tử <, > là đúng thứ tự thời gian nên cứ so trực tiếp.\n\nKhông tìm thấy dòng nào thì trả về "Khong ro".',
      starterCode: `interface DongChieu {
  maNhanVien: string
  cuaHang: string
  hieuLucTu: string
  hieuLucDen: string // "" = dang mo
}

function traCuuTaiThoiDiem(lichSu: DongChieu[], maNhanVien: string, ngay: string): string {
  // TODO
  return ""
}

// ---- Đừng sửa phần dưới đây ----
const LICH_SU: DongChieu[] = [
  { maNhanVien: "NV01", cuaHang: "Quan 1", hieuLucTu: "2026-01-01", hieuLucDen: "2026-06-01" },
  { maNhanVien: "NV01", cuaHang: "Thu Duc", hieuLucTu: "2026-06-01", hieuLucDen: "" },
]
console.log("Thang 5:", traCuuTaiThoiDiem(LICH_SU, "NV01", "2026-05-15"))
console.log("Thang 7:", traCuuTaiThoiDiem(LICH_SU, "NV01", "2026-07-15"))
console.log("Dung ngay chuyen:", traCuuTaiThoiDiem(LICH_SU, "NV01", "2026-06-01"))
console.log("Truoc khi vao lam:", traCuuTaiThoiDiem(LICH_SU, "NV01", "2025-12-31"))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Thang 5: Quan 1',
          match: 'contains',
          hidden: false,
          label: 'Ngày 15/5 nằm trong khoảng hiệu lực của dòng cũ → Quận 1',
        },
        {
          stdinLines: [],
          expected: 'Thang 7: Thu Duc',
          match: 'contains',
          hidden: false,
          label: 'Ngày 15/7 rơi vào dòng đang mở → Thủ Đức',
        },
        {
          stdinLines: [],
          expected: 'Dung ngay chuyen: Thu Duc',
          match: 'contains',
          hidden: false,
          label: 'Biên: đúng ngày chuyển, khoảng đóng ở đầu và mở ở cuối nên thuộc dòng MỚI',
        },
        {
          stdinLines: [],
          expected: 'Truoc khi vao lam: Khong ro',
          match: 'contains',
          hidden: false,
          label: 'Ngày trước mọi dòng lịch sử → không dòng nào khớp, trả "Khong ro"',
        },
        {
          stdinLines: [],
          expected:
            'Thang 5: Quan 1\nThang 7: Thu Duc\nDung ngay chuyen: Thu Duc\nTruoc khi vao lam: Khong ro',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: cả bốn dòng đúng thứ tự (chống hardcode từng dòng riêng lẻ)',
        },
      ],
      hints: [
        'Duyệt lịch sử, với mỗi dòng kiểm ba điều kiện nối bằng &&: đúng mã nhân viên, d.hieuLucTu <= ngay, và (d.hieuLucDen === "" || ngay < d.hieuLucDen).',
        'Chú ý ca biên "đúng ngày chuyển": dòng cũ có hieuLucDen = "2026-06-01" nên điều kiện ngay < hieuLucDen là SAI với ngày 2026-06-01 → dòng cũ bị loại, dòng mới nhận. Nếu bạn viết <= ở đó, cả hai dòng cùng khớp và bài sai.',
        'Tìm thấy thì return d.cuaHang ngay trong vòng lặp; ra khỏi vòng lặp mà chưa return thì return "Khong ro".',
      ],
      sampleSolution: `interface DongChieu {
  maNhanVien: string
  cuaHang: string
  hieuLucTu: string
  hieuLucDen: string // "" = dang mo
}

function traCuuTaiThoiDiem(lichSu: DongChieu[], maNhanVien: string, ngay: string): string {
  for (const d of lichSu) {
    if (d.maNhanVien !== maNhanVien) continue
    if (d.hieuLucTu > ngay) continue
    const conHieuLuc = d.hieuLucDen === "" || ngay < d.hieuLucDen
    if (conHieuLuc) return d.cuaHang
  }
  return "Khong ro"
}

// ---- Đừng sửa phần dưới đây ----
const LICH_SU: DongChieu[] = [
  { maNhanVien: "NV01", cuaHang: "Quan 1", hieuLucTu: "2026-01-01", hieuLucDen: "2026-06-01" },
  { maNhanVien: "NV01", cuaHang: "Thu Duc", hieuLucTu: "2026-06-01", hieuLucDen: "" },
]
console.log("Thang 5:", traCuuTaiThoiDiem(LICH_SU, "NV01", "2026-05-15"))
console.log("Thang 7:", traCuuTaiThoiDiem(LICH_SU, "NV01", "2026-07-15"))
console.log("Dung ngay chuyen:", traCuuTaiThoiDiem(LICH_SU, "NV01", "2026-06-01"))
console.log("Truoc khi vao lam:", traCuuTaiThoiDiem(LICH_SU, "NV01", "2025-12-31"))`,
    },
    homework:
      'Chọn 5 thuộc tính trong một hệ thống bạn biết (ví dụ: tên khách, hạng thành viên, địa chỉ giao hàng, nhóm sản phẩm, giá bán). Với từng cái, tự trả lời câu hỏi quyết định: "nếu giá trị này đổi, báo cáo tháng trước có nên đổi theo không?" — rồi ghi type 1 hay type 2 kèm một câu lý do. Chú ý ít nhất một cái sẽ khiến bạn phân vân; ghi lại chỗ phân vân đó, vì trong thực tế đấy chính là chỗ phải đi hỏi người dùng nghiệp vụ chứ không tự quyết.',
    srsCards: [
      {
        hoi: 'SCD type 1 và type 2 xử lý thay đổi của bảng chiều khác nhau ra sao?',
        dap: 'Type 1 ghi đè giá trị cũ và mất lịch sử; type 2 đóng dòng cũ lại rồi mở một dòng mới, nên mỗi phiên bản của thực thể được giữ nguyên cùng khoảng thời gian hiệu lực của nó.',
      },
      {
        hoi: 'Câu hỏi nào giúp quyết định một cột nên dùng type 1 hay type 2?',
        dap: '"Nếu giá trị này đổi, báo cáo cũ có nên đổi theo không?" — nên đổi (sửa lỗi gõ nhầm) thì type 1; không nên đổi (nhân viên chuyển cửa hàng, khách đổi phân khúc) thì type 2.',
      },
      {
        hoi: 'Trong SCD type 2, ba cột kỹ thuật thêm vào mỗi dòng chiều là gì?',
        dap: 'hieuLucTu (từ khi nào giá trị đúng), hieuLucDen (tới khi nào, dòng đang mở thì để rỗng/null) và laHienTai (cờ lọc nhanh dòng đang có hiệu lực).',
      },
      {
        hoi: 'Quên đóng dòng cũ khi áp SCD type 2 gây hậu quả gì?',
        dap: 'Một khoá tự nhiên có hai dòng cùng đang mở, nên mọi phép nối với bảng sự kiện đều nhân đôi số đo — doanh thu phình lên mà không hề có thông báo lỗi nào.',
      },
    ],
  },
]
