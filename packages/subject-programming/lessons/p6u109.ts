// lessons/p6u109.ts — P6-U109: HƯỚNG BACKEND, chặng S4 "Quy mô lớn và trách nhiệm vận hành"
// — module `backend-s4-m2` "Lưu trữ chuyên biệt".
//
// p6-u102 đã dạy CSDL QUAN HỆ chuyên sâu (transaction, index B-tree) trong phạm vi MỘT dịch
// vụ. Bài này KHÔNG dạy lại transaction/index — nó dạy khi nào CSDL quan hệ KHÔNG CÒN LÀ LỰA
// CHỌN ĐÚNG (bài l1: chọn đúng loại kho theo đặc điểm truy vấn) và cấu trúc lưu trữ đứng sau
// đa số CSDL hiện đại phi-B-tree (bài l2: LSM tree vs B-tree — đánh đổi ghi/đọc).
//
// Dùng làn `typescript`, mô phỏng bằng hàm thuần tất định — không mạng/CSDL thật.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U109_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u109-l1',
    unitId: 'p6-u109',
    language: 'typescript',
    title: 'Khi nào rời khỏi CSDL quan hệ — mỗi bài toán hợp một loại kho',
    hook: 'Đội bạn đang dùng MỘT CSDL quan hệ cho mọi thứ: tìm sản phẩm theo từ khoá, biểu đồ nhiệt độ cảm biến mỗi giây, và gợi ý "bạn có thể quen biết". Cả ba đều CHẠY ĐƯỢC — nhưng tìm từ khoá chậm dần khi mô tả sản phẩm dài ra, biểu đồ cảm biến làm bảng phình hàng tỷ dòng, còn "bạn của bạn của bạn" thì mỗi lần truy vấn là một chuỗi JOIN dài dằng dặc. CSDL quan hệ không SAI — chỉ là mỗi bài toán này có một loại kho SINH RA ĐỂ LÀM ĐÚNG VIỆC ĐÓ.',
    theory:
      'CSDL quan hệ (Postgres, MySQL…) là kho ĐA NĂNG — làm được hầu hết mọi việc, nhưng không phải việc nào cũng làm TỐT NHẤT. Ba loại truy vấn có kho CHUYÊN BIỆT vượt trội hẳn:\n\n1. **TÌM KIẾM FULL-TEXT** (search engine, kiểu Elasticsearch): truy vấn dạng "tìm mọi mô tả có chứa từ X, xếp hạng theo mức liên quan". CSDL quan hệ có `LIKE`/index văn bản nhưng không có xếp hạng liên quan tốt, không chịu được lỗi chính tả, không tổng hợp (facet) nhanh. Search engine dựng sẵn INDEX ĐẢO (inverted index: từ → danh sách tài liệu chứa nó) tối ưu đúng việc này.\n\n2. **CHUỖI THỜI GIAN** (time-series, kiểu InfluxDB/Prometheus): dữ liệu GHI LIÊN TỤC theo mốc thời gian (mỗi giây một điểm nhiệt độ, mỗi request một điểm độ trễ), truy vấn chủ yếu là "trung bình/tổng trong một KHOẢNG THỜI GIAN". Kho time-series nén dữ liệu theo thời gian rất tốt (giá trị liền kề thường gần giống nhau) và có sẵn phép tổng hợp theo cửa sổ thời gian — CSDL quan hệ phải quét/JOIN thủ công, chậm dần khi số dòng lên hàng tỷ.\n\n3. **ĐỒ THỊ** (graph, kiểu Neo4j): dữ liệu là QUAN HỆ NHIỀU-NHIỀU DÀY ĐẶC (mạng xã hội: ai theo dõi ai), truy vấn kiểu "bạn của bạn của bạn" (đi qua NHIỀU CẤP quan hệ). CSDL quan hệ mô phỏng bằng bảng nối rồi JOIN — mỗi cấp thêm một JOIN, đi 3-4 cấp là truy vấn chậm hẳn. Kho đồ thị lưu quan hệ như CON TRỎ TRỰC TIẾP giữa các nút, đi qua nhiều cấp chỉ là "nhảy theo con trỏ", không cần JOIN.\n\nBài học không phải "bỏ CSDL quan hệ" — phần lớn dữ liệu ứng dụng (đơn hàng, tài khoản, giao dịch — cần ràng buộc chặt, transaction, đã học ở p6-u102) vẫn nên nằm ở CSDL quan hệ. Chỉ RỜI ĐI khi một loại truy vấn cụ thể có đặc điểm khớp hẳn với một kho chuyên biệt, và thường là CHẠY SONG SONG (CSDL quan hệ giữ dữ liệu gốc, kho chuyên biệt phục vụ đúng loại truy vấn đó), không phải thay thế hoàn toàn.',
    workedExample: {
      code: `// Dac diem mot truy van, dung de chon loai kho phu hop
type DacDiemTruyVan = {
  canTimTheoTuKhoa: boolean // tim van ban tu do, can xep hang lien quan
  canTimTheoKhoangThoiGian: boolean // truy van theo [tu_luc, den_luc]
  canDiQuaNhieuCapQuanHe: boolean // kieu "ban cua ban cua ban"
}

// Luat uu tien RO RANG, tat dinh — kiem tung dac diem theo thu tu co dinh
function chonLoaiKho(dd: DacDiemTruyVan): string {
  if (dd.canDiQuaNhieuCapQuanHe) return "do-thi"
  if (dd.canTimTheoKhoangThoiGian) return "chuoi-thoi-gian"
  if (dd.canTimTheoTuKhoa) return "tim-kiem-fulltext"
  return "csdl-quan-he" // khong dac diem nao noi bat -> kho da nang la du
}

console.log(chonLoaiKho({ canTimTheoTuKhoa: true, canTimTheoKhoangThoiGian: false, canDiQuaNhieuCapQuanHe: false }))
console.log(chonLoaiKho({ canTimTheoTuKhoa: false, canTimTheoKhoangThoiGian: true, canDiQuaNhieuCapQuanHe: false }))
console.log(chonLoaiKho({ canTimTheoTuKhoa: true, canTimTheoKhoangThoiGian: false, canDiQuaNhieuCapQuanHe: true }))
console.log(chonLoaiKho({ canTimTheoTuKhoa: false, canTimTheoKhoangThoiGian: false, canDiQuaNhieuCapQuanHe: false }))
// Dong 3: co ca tim tu khoa LAN di nhieu cap -> do-thi thang the (uu tien cao nhat)`,
      stdinLines: [],
    },
    predict: {
      code: `type DacDiemTruyVan = {
  canTimTheoTuKhoa: boolean
  canTimTheoKhoangThoiGian: boolean
  canDiQuaNhieuCapQuanHe: boolean
}
function chonLoaiKho(dd: DacDiemTruyVan): string {
  if (dd.canDiQuaNhieuCapQuanHe) return "do-thi"
  if (dd.canTimTheoKhoangThoiGian) return "chuoi-thoi-gian"
  if (dd.canTimTheoTuKhoa) return "tim-kiem-fulltext"
  return "csdl-quan-he"
}
console.log(chonLoaiKho({ canTimTheoTuKhoa: true, canTimTheoKhoangThoiGian: true, canDiQuaNhieuCapQuanHe: false }))`,
      question:
        'Truy vấn vừa có canTimTheoTuKhoa=true, vừa có canTimTheoKhoangThoiGian=true (không đi qua nhiều cấp quan hệ). Hàm chọn loại kho nào?',
      choices: ['chuoi-thoi-gian', 'tim-kiem-fulltext', 'do-thi', 'csdl-quan-he'],
      answerIndex: 0,
      explain:
        'Kết quả là "chuoi-thoi-gian" — luật ưu tiên kiểm THEO THỨ TỰ: canDiQuaNhieuCapQuanHe trước (false, bỏ qua), rồi canTimTheoKhoangThoiGian (true → trả về ngay "chuoi-thoi-gian"), không bao giờ chạm tới nhánh canTimTheoTuKhoa dù nó cũng true. Bẫy của bài: đừng nghĩ hàm "cộng dồn" các đặc điểm — nó dừng lại ở ĐIỀU KIỆN ĐẦU TIÊN khớp theo đúng thứ tự viết trong code.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm chọn loại kho theo đúng thứ tự ưu tiên (đồ thị > chuỗi thời gian > tìm kiếm > quan hệ).',
      lines: [
        'function chonLoaiKho(dd: DacDiemTruyVan): string {',
        '  if (dd.canDiQuaNhieuCapQuanHe) return "do-thi"',
        '  if (dd.canTimTheoKhoangThoiGian) return "chuoi-thoi-gian"',
        '  if (dd.canTimTheoTuKhoa) return "tim-kiem-fulltext"',
        '  return "csdl-quan-he"',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm demTheoLoaiKho(danhSachTruyVan) đếm số truy vấn rơi vào TỪNG loại kho, trả về một object.\n\n- Dùng lại đúng chonLoaiKho(dd) như ví dụ mẫu (viết lại hàm này trong bài, cùng luật ưu tiên: đồ thị > chuỗi thời gian > tìm kiếm > quan hệ).\n- danhSachTruyVan là mảng DacDiemTruyVan.\n- Trả về object có 4 khoá: "do-thi", "chuoi-thoi-gian", "tim-kiem-fulltext", "csdl-quan-he" — mỗi khoá là số truy vấn thuộc loại đó (bắt đầu từ 0, không có thì vẫn phải có khoá với giá trị 0).',
      starterCode: `type DacDiemTruyVan = {
  canTimTheoTuKhoa: boolean
  canTimTheoKhoangThoiGian: boolean
  canDiQuaNhieuCapQuanHe: boolean
}

function chonLoaiKho(dd: DacDiemTruyVan): string {
  if (dd.canDiQuaNhieuCapQuanHe) return "do-thi"
  if (dd.canTimTheoKhoangThoiGian) return "chuoi-thoi-gian"
  if (dd.canTimTheoTuKhoa) return "tim-kiem-fulltext"
  return "csdl-quan-he"
}

function demTheoLoaiKho(danhSachTruyVan: DacDiemTruyVan[]): Record<string, number> {
  // TODO: dem so truy van roi vao tung loai kho, tra ve object du 4 khoa
  return {}
}

// ---- Đừng sửa phần dưới đây ----
const TRUY_VAN: DacDiemTruyVan[] = [
  { canTimTheoTuKhoa: true, canTimTheoKhoangThoiGian: false, canDiQuaNhieuCapQuanHe: false },
  { canTimTheoTuKhoa: false, canTimTheoKhoangThoiGian: true, canDiQuaNhieuCapQuanHe: false },
  { canTimTheoTuKhoa: false, canTimTheoKhoangThoiGian: false, canDiQuaNhieuCapQuanHe: true },
  { canTimTheoTuKhoa: false, canTimTheoKhoangThoiGian: false, canDiQuaNhieuCapQuanHe: false },
  { canTimTheoTuKhoa: true, canTimTheoKhoangThoiGian: true, canDiQuaNhieuCapQuanHe: false },
]
console.log(JSON.stringify(demTheoLoaiKho(TRUY_VAN)))`,
      testCases: [
        {
          stdinLines: [],
          expected: '"tim-kiem-fulltext":1',
          match: 'contains',
          hidden: false,
          label: 'Đúng 1 truy vấn thuần tìm từ khoá',
        },
        {
          stdinLines: [],
          expected: '"do-thi":1',
          match: 'contains',
          hidden: false,
          label: 'Đúng 1 truy vấn đi qua nhiều cấp quan hệ',
        },
        {
          stdinLines: [],
          expected: '"csdl-quan-he":1',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: truy vấn không đặc điểm nào nổi bật vẫn được đếm đúng vào quan hệ',
        },
      ],
      hints: [
        'Khởi tạo object đếm với cả 4 khoá bằng 0 trước khi duyệt: { "do-thi": 0, "chuoi-thoi-gian": 0, "tim-kiem-fulltext": 0, "csdl-quan-he": 0 }.',
        'Duyệt từng phần tử trong danhSachTruyVan, gọi chonLoaiKho(dd) rồi tăng đúng khoá tương ứng lên 1.',
        'JSON.stringify của object không đảm bảo thứ tự khoá cố định theo thứ tự bạn khởi tạo trong TypeScript hiện đại (theo thứ tự khai báo) — chỉ cần đúng SỐ ĐẾM ở mỗi khoá là đạt, không cần đúng thứ tự chuỗi.',
      ],
      sampleSolution: `type DacDiemTruyVan = {
  canTimTheoTuKhoa: boolean
  canTimTheoKhoangThoiGian: boolean
  canDiQuaNhieuCapQuanHe: boolean
}

function chonLoaiKho(dd: DacDiemTruyVan): string {
  if (dd.canDiQuaNhieuCapQuanHe) return "do-thi"
  if (dd.canTimTheoKhoangThoiGian) return "chuoi-thoi-gian"
  if (dd.canTimTheoTuKhoa) return "tim-kiem-fulltext"
  return "csdl-quan-he"
}

function demTheoLoaiKho(danhSachTruyVan: DacDiemTruyVan[]): Record<string, number> {
  const dem: Record<string, number> = {
    "do-thi": 0,
    "chuoi-thoi-gian": 0,
    "tim-kiem-fulltext": 0,
    "csdl-quan-he": 0,
  }
  for (const dd of danhSachTruyVan) {
    const loai = chonLoaiKho(dd)
    dem[loai]++
  }
  return dem
}

// ---- Đừng sửa phần dưới đây ----
const TRUY_VAN: DacDiemTruyVan[] = [
  { canTimTheoTuKhoa: true, canTimTheoKhoangThoiGian: false, canDiQuaNhieuCapQuanHe: false },
  { canTimTheoTuKhoa: false, canTimTheoKhoangThoiGian: true, canDiQuaNhieuCapQuanHe: false },
  { canTimTheoTuKhoa: false, canTimTheoKhoangThoiGian: false, canDiQuaNhieuCapQuanHe: true },
  { canTimTheoTuKhoa: false, canTimTheoKhoangThoiGian: false, canDiQuaNhieuCapQuanHe: false },
  { canTimTheoTuKhoa: true, canTimTheoKhoangThoiGian: true, canDiQuaNhieuCapQuanHe: false },
]
console.log(JSON.stringify(demTheoLoaiKho(TRUY_VAN)))`,
    },
    homework:
      'Chọn một ứng dụng bạn dùng hàng ngày (mạng xã hội, sàn thương mại điện tử, app theo dõi sức khoẻ…). Liệt kê 3 loại truy vấn khác nhau mà nó chắc chắn phải xử lý, và với mỗi loại, đoán xem nó khớp với kho nào trong 4 loại đã học (quan hệ / tìm kiếm / chuỗi thời gian / đồ thị). Giải thích ngắn gọn vì sao — không cần tra cứu kiến trúc thật của ứng dụng đó, chỉ cần lập luận từ ĐẶC ĐIỂM truy vấn.',
    srsCards: [
      {
        hoi: 'Ba loại truy vấn nào có kho lưu trữ CHUYÊN BIỆT vượt trội hơn CSDL quan hệ?',
        dap: 'Tìm kiếm full-text (xếp hạng liên quan, kiểu Elasticsearch), dữ liệu chuỗi thời gian (ghi liên tục theo mốc, truy vấn theo khoảng thời gian), và dữ liệu đồ thị (quan hệ nhiều-nhiều dày đặc, truy vấn nhiều cấp kiểu "bạn của bạn").',
      },
      {
        hoi: 'Vì sao CSDL quan hệ chậm dần khi truy vấn kiểu "bạn của bạn của bạn" đi qua nhiều cấp?',
        dap: 'Mỗi cấp quan hệ cần thêm một JOIN trên bảng nối — đi 3-4 cấp là chồng nhiều JOIN, chậm hẳn. Kho đồ thị lưu quan hệ như con trỏ trực tiếp giữa các nút, đi nhiều cấp chỉ là nhảy theo con trỏ, không cần JOIN.',
      },
      {
        hoi: 'Rời sang kho chuyên biệt có nghĩa là BỎ HẲN CSDL quan hệ không?',
        dap: 'Không — phần lớn dữ liệu cần ràng buộc chặt/transaction vẫn nên ở CSDL quan hệ. Kho chuyên biệt thường CHẠY SONG SONG, chỉ phục vụ đúng loại truy vấn khớp đặc điểm của nó.',
      },
    ],
  },
  {
    id: 'p6-u109-l2',
    unitId: 'p6-u109',
    language: 'typescript',
    title: 'LSM tree vs B-tree — cấu trúc lưu trữ nào thắng phụ thuộc tỉ lệ ghi/đọc',
    hook: 'Hai đội cùng chọn CSDL cho hai hệ thống khác nhau. Đội A lưu METRIC (nhiệt độ, độ trễ) — GHI liên tục hàng chục nghìn điểm mỗi giây, ít khi đọc lại. Đội B lưu CẤU HÌNH hệ thống — ĐỌC liên tục (mọi service đọc cấu hình mỗi lần khởi động), gần như không đổi. Nếu cả hai đội cùng dùng một cấu trúc lưu trữ, MỘT trong hai đội đang trả giá đắt hơn cần thiết — vì đọc và ghi không "rẻ như nhau" trên đĩa.',
    theory:
      'Bên dưới mọi CSDL là một cấu trúc lưu trữ trên đĩa quyết định GHI và ĐỌC nhanh hay chậm. Hai cấu trúc phổ biến nhất đánh đổi NGƯỢC nhau:\n\n**B-TREE** (CSDL quan hệ truyền thống dùng — Postgres, MySQL mặc định): cập nhật TẠI CHỖ (in-place) — sửa một dòng là tìm đúng vị trí trên đĩa rồi ghi đè ngay đó. ĐỌC nhanh (đi thẳng tới vị trí nhờ cấu trúc cây đã sắp xếp sẵn). Nhưng GHI phải TÌM ĐÚNG VỊ TRÍ trên đĩa (seek ngẫu nhiên) mỗi lần — với ổ đĩa cơ khí xưa, seek rất chậm; với SSD hiện đại đỡ hơn nhưng vẫn tốn hơn ghi tuần tự.\n\n**LSM TREE** (Log-Structured Merge tree — nhiều CSDL NoSQL/time-series hiện đại dùng: Cassandra, RocksDB, InfluxDB): mọi lần ghi chỉ APPEND (nối thêm vào cuối) một file tuần tự trên đĩa — không cần tìm vị trí, cực nhanh. Định kỳ, một tiến trình nền gọi là COMPACTION gộp nhiều file nhỏ đã ghi thành file lớn hơn, dọn dữ liệu cũ/trùng. Đổi lại, ĐỌC phải kiểm tra NHIỀU LỚP (memtable đang ghi dở trong RAM + nhiều file đã ghi trên đĩa) để tìm bản mới nhất của một khoá — chậm hơn B-tree một chút vì phải tra nhiều nơi thay vì một cây đã gộp sẵn.\n\nTóm gọn đánh đổi: **LSM tree GHI RẺ, ĐỌC ĐẮT hơn. B-tree GHI ĐẮT, ĐỌC RẺ hơn.** Không cấu trúc nào "tốt hơn" tuyệt đối — cấu trúc THẮNG phụ thuộc TỈ LỆ GHI/ĐỌC của khối lượng công việc thật: hệ ghi nhiều (log, metric, sự kiện) nên chọn LSM; hệ đọc nhiều/ghi hiếm (dữ liệu cấu hình, danh mục ít đổi) nên chọn B-tree. Có thể ước lượng bằng công thức tương đối, tất định: chi phí LSM = tỉ lệ ghi × 1 + tỉ lệ đọc × 3 (đọc tốn gấp 3 vì phải kiểm nhiều lớp); chi phí B-tree = tỉ lệ ghi × 3 + tỉ lệ đọc × 1 (ghi tốn gấp 3 vì seek ngẫu nhiên). Cấu trúc nào có tổng chi phí THẤP HƠN thì thắng cho khối lượng công việc đó.',
    workedExample: {
      code: `// Uoc luong chi phi tuong doi cho mot workload theo ti le ghi/doc
// tiLeGhi + tiLeDoc = 1.0 (vd 0.8 ghi / 0.2 doc)
function chiPhiLSM(tiLeGhi: number, tiLeDoc: number): number {
  return tiLeGhi * 1 + tiLeDoc * 3 // ghi re (append), doc dat (nhieu lop)
}

function chiPhiBTree(tiLeGhi: number, tiLeDoc: number): number {
  return tiLeGhi * 3 + tiLeDoc * 1 // ghi dat (seek), doc re (mot cay)
}

function chonCauTruc(tiLeGhi: number, tiLeDoc: number): string {
  const lsm = chiPhiLSM(tiLeGhi, tiLeDoc)
  const btree = chiPhiBTree(tiLeGhi, tiLeDoc)
  return lsm < btree ? "LSM" : "B-tree"
}

// Workload metric/log: ghi nhieu, doc it
console.log("Metric (ghi 0.8/doc 0.2):", chonCauTruc(0.8, 0.2))
// Workload cau hinh: doc nhieu, ghi hiem
console.log("Cau hinh (ghi 0.1/doc 0.9):", chonCauTruc(0.1, 0.9))
// Diem hoa: ghi bang doc
console.log("Can bang (ghi 0.5/doc 0.5):", chonCauTruc(0.5, 0.5))
// tai 0.5/0.5: chiPhiLSM = 0.5+1.5=2.0, chiPhiBTree = 1.5+0.5=2.0 -> bang nhau, LSM khong "<" nen thua ve B-tree`,
      stdinLines: [],
    },
    predict: {
      code: `function chiPhiLSM(g: number, d: number): number {
  return g * 1 + d * 3
}
function chiPhiBTree(g: number, d: number): number {
  return g * 3 + d * 1
}
function chonCauTruc(g: number, d: number): string {
  return chiPhiLSM(g, d) < chiPhiBTree(g, d) ? "LSM" : "B-tree"
}
console.log(chonCauTruc(0.9, 0.1))`,
      question: 'Workload ghi 0.9 / đọc 0.1 (ghi áp đảo, giống log server). Hàm chọn cấu trúc nào?',
      choices: ['LSM', 'B-tree', 'khong-xac-dinh', 'ca-hai'],
      answerIndex: 0,
      explain:
        'Kết quả là "LSM" — chiPhiLSM = 0.9×1 + 0.1×3 = 1.2, chiPhiBTree = 0.9×3 + 0.1×1 = 2.8. LSM thấp hơn hẳn nên thắng. Đúng như lý thuyết: workload GHI ÁP ĐẢO (giống log/metric thật) thì cấu trúc ghi rẻ (LSM) chiếm ưu thế rõ rệt, không phải trường hợp sít sao như ví dụ 0.5/0.5 trong bài mẫu.',
    },
    parsons: {
      prompt: 'Xếp lại hàm chọn cấu trúc lưu trữ dựa trên chi phí LSM và B-tree.',
      lines: [
        'function chonCauTruc(tiLeGhi: number, tiLeDoc: number): string {',
        '  const lsm = chiPhiLSM(tiLeGhi, tiLeDoc)',
        '  const btree = chiPhiBTree(tiLeGhi, tiLeDoc)',
        '  return lsm < btree ? "LSM" : "B-tree"',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm phanLoaiWorkload(danhSachWorkload) trả về mảng tên cấu trúc THẮNG cho từng workload, theo đúng thứ tự.\n\n- Dùng lại đúng chiPhiLSM(g, d) = g*1 + d*3, chiPhiBTree(g, d) = g*3 + d*1, chonCauTruc(g, d) như ví dụ mẫu (viết lại cả ba hàm).\n- danhSachWorkload là mảng các cặp [tiLeGhi, tiLeDoc] (kiểu [number, number][]).\n- Với mỗi cặp, gọi chonCauTruc rồi đẩy kết quả ("LSM" hoặc "B-tree") vào mảng trả về, giữ đúng thứ tự.',
      starterCode: `function chiPhiLSM(tiLeGhi: number, tiLeDoc: number): number {
  return tiLeGhi * 1 + tiLeDoc * 3
}

function chiPhiBTree(tiLeGhi: number, tiLeDoc: number): number {
  return tiLeGhi * 3 + tiLeDoc * 1
}

function chonCauTruc(tiLeGhi: number, tiLeDoc: number): string {
  const lsm = chiPhiLSM(tiLeGhi, tiLeDoc)
  const btree = chiPhiBTree(tiLeGhi, tiLeDoc)
  return lsm < btree ? "LSM" : "B-tree"
}

function phanLoaiWorkload(danhSachWorkload: [number, number][]): string[] {
  // TODO: voi moi cap [tiLeGhi, tiLeDoc], goi chonCauTruc va gom ket qua theo dung thu tu
  return []
}

// ---- Đừng sửa phần dưới đây ----
const WORKLOAD: [number, number][] = [
  [0.8, 0.2], // log/metric: ghi nhieu
  [0.1, 0.9], // cau hinh: doc nhieu
  [0.5, 0.5], // can bang
  [0.3, 0.7], // doc nhinh hon
  [0.95, 0.05], // ghi cuc nhieu
  [0.05, 0.95], // doc cuc nhieu
]
console.log(JSON.stringify(phanLoaiWorkload(WORKLOAD)))`,
      testCases: [
        {
          stdinLines: [],
          expected: '["LSM","B-tree","B-tree","B-tree","LSM","B-tree"]',
          match: 'contains',
          hidden: false,
          label:
            'Sáu workload phân loại đúng: chỉ workload ghi áp đảo (0.8/0.2, 0.95/0.05) chọn LSM',
        },
        {
          stdinLines: [],
          expected: '"LSM"',
          match: 'contains',
          hidden: false,
          label: 'Workload ghi cực nhiều (0.95/0.05) cũng phải ra LSM',
        },
        {
          stdinLines: [],
          expected: '["LSM","B-tree","B-tree","B-tree","LSM","B-tree"]',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: workload đọc cực nhiều (0.05/0.95) đứng cuối phải ra B-tree, không phá kết quả các workload trước',
        },
      ],
      hints: [
        'Duyệt mảng danhSachWorkload bằng vòng lặp, mỗi phần tử là một cặp [tiLeGhi, tiLeDoc] — tách ra bằng const [g, d] = cap.',
        'Gọi chonCauTruc(g, d) cho từng cặp rồi push kết quả vào mảng ketQua — giữ đúng thứ tự duyệt.',
        'Không cần sắp xếp lại kết quả — thứ tự trả về phải trùng thứ tự trong danhSachWorkload đầu vào.',
      ],
      sampleSolution: `function chiPhiLSM(tiLeGhi: number, tiLeDoc: number): number {
  return tiLeGhi * 1 + tiLeDoc * 3
}

function chiPhiBTree(tiLeGhi: number, tiLeDoc: number): number {
  return tiLeGhi * 3 + tiLeDoc * 1
}

function chonCauTruc(tiLeGhi: number, tiLeDoc: number): string {
  const lsm = chiPhiLSM(tiLeGhi, tiLeDoc)
  const btree = chiPhiBTree(tiLeGhi, tiLeDoc)
  return lsm < btree ? "LSM" : "B-tree"
}

function phanLoaiWorkload(danhSachWorkload: [number, number][]): string[] {
  const ketQua: string[] = []
  for (const [g, d] of danhSachWorkload) {
    ketQua.push(chonCauTruc(g, d))
  }
  return ketQua
}

// ---- Đừng sửa phần dưới đây ----
const WORKLOAD: [number, number][] = [
  [0.8, 0.2], // log/metric: ghi nhieu
  [0.1, 0.9], // cau hinh: doc nhieu
  [0.5, 0.5], // can bang
  [0.3, 0.7], // doc nhinh hon
  [0.95, 0.05], // ghi cuc nhieu
  [0.05, 0.95], // doc cuc nhieu
]
console.log(JSON.stringify(phanLoaiWorkload(WORKLOAD)))`,
    },
    homework:
      'Tra cứu (tiếng Anh) khái niệm "compaction" trong LSM tree — tìm một hình minh hoạ hoặc đoạn mô tả ngắn về việc các file nhỏ được gộp thành file lớn ở nền như thế nào. Viết 2-3 câu: vì sao compaction chạy NGẦM (background) thay vì chặn việc ghi mới, và điều gì xảy ra nếu compaction chạy KHÔNG kịp so với tốc độ ghi vào (gợi ý: liên hệ hàng đợi bị đầy đã học ở p6-u104).',
    srsCards: [
      {
        hoi: 'B-tree và LSM tree đánh đổi ghi/đọc theo hướng nào?',
        dap: 'B-tree: cập nhật tại chỗ, đọc nhanh nhưng ghi phải seek tìm đúng vị trí trên đĩa nên ghi chậm. LSM tree: mọi ghi chỉ append tuần tự nên ghi nhanh, nhưng đọc phải kiểm nhiều lớp (memtable + nhiều file) nên đọc chậm hơn.',
      },
      {
        hoi: 'Compaction trong LSM tree làm gì?',
        dap: 'Tiến trình nền định kỳ gộp nhiều file nhỏ đã ghi (do append liên tục sinh ra) thành file lớn hơn, dọn dữ liệu cũ/trùng — giữ số lớp cần kiểm khi đọc không phình vô hạn.',
      },
      {
        hoi: 'Loại workload nào nên chọn LSM, loại nào nên chọn B-tree?',
        dap: 'Workload GHI áp đảo (log, metric, sự kiện liên tục) nên chọn LSM vì ghi rẻ. Workload ĐỌC áp đảo, ghi hiếm (cấu hình, danh mục ít đổi) nên chọn B-tree vì đọc rẻ hơn.',
      },
    ],
  },
]
