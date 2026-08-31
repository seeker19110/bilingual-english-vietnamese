// lessons/p6u102.ts — P6-U102: HƯỚNG BACKEND, chặng S2 — CSDL quan hệ chuyên sâu
// (module `backend-s2-m1`).
//
// backend-s1 (p6-u61…u63) đã dạy mã trạng thái, phân trang con trỏ, vận hành. S2 đi sâu hơn
// vào CHÍNH cơ sở dữ liệu: hai bài ở đây dạy đúng hai lỗi kinh điển của tầng dữ liệu — LOST
// UPDATE khi nhiều request cùng sửa một dòng, và INDEX HỎNG khi query lọc không đúng TIỀN TỐ
// của composite index. Cả hai đều là lỗi "code chạy ngon, số liệu vẫn sai/chậm" — không có
// stack trace nào báo.
//
// Dùng làn `typescript`: mô hình bản ghi + phiên bản là chuyện KIỂU DỮ LIỆU, và cổng
// `lessonsTs.test.ts` chạy tsc thật nên code mẫu không thể trôi. Không kết nối CSDL thật —
// mọi hành vi (transaction, index) được MÔ PHỎNG bằng hàm thuần, tất định.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U102_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u102-l1',
    unitId: 'p6-u102',
    language: 'typescript',
    title: 'Lost update — hai request cùng sửa một dòng, ai thắng?',
    hook: 'Nhân viên A mở đơn hàng, thấy giá 100.000đ, sửa thành 120.000đ. Cùng lúc đó nhân viên B cũng đang mở đúng đơn đó, thấy giá 100.000đ (chưa kịp thấy bản của A), sửa thành 90.000đ rồi lưu SAU. Kết quả: đơn hàng còn 90.000đ — sửa của A biến mất không dấu vết, không ai báo lỗi, không ai biết.',
    theory:
      'LOST UPDATE (mất bản cập nhật) xảy ra khi hai giao dịch cùng ĐỌC một dòng, rồi cùng GHI dựa trên cái đã đọc — giao dịch ghi SAU âm thầm đè lên giao dịch ghi TRƯỚC, như thể nó chưa từng xảy ra. Nguy hiểm ở chỗ: cả hai giao dịch đều "thành công", không có lỗi nào được báo. Dữ liệu chỉ đơn giản là sai.\n\nHai cách chống, đánh đổi khác nhau:\n\n**KHOÁ BI QUAN (pessimistic locking):** giao dịch A khoá dòng ngay khi đọc (`SELECT ... FOR UPDATE`), giao dịch B phải CHỜ tới khi A xong mới đọc được. An toàn tuyệt đối, nhưng B đứng hình chờ — tệ khi giao dịch A chạy lâu hoặc nhiều người tranh cùng dòng.\n\n**KHOÁ LẠC QUAN (optimistic locking):** không khoá gì cả — mỗi dòng có thêm cột `version`. Khi ghi, câu lệnh kèm điều kiện "chỉ ghi nếu version vẫn đúng bằng lúc tôi đọc". Đúng thì ghi VÀ tăng version lên 1. Sai (ai đó đã ghi trước, version đã đổi) thì TỪ CHỐI — giao dịch phải đọc lại rồi thử lại, hoặc báo cho người dùng biết "dữ liệu đã đổi, xin thử lại".\n\nLạc quan phù hợp khi va chạm HIẾM (đa số request không tranh nhau) — không ai phải chờ trong trường hợp thường; bi quan phù hợp khi va chạm THƯỜNG XUYÊN — chờ một lần còn rẻ hơn thử-rồi-thất-bại nhiều lần.\n\nĐiều phải nhớ nhất: khoá lạc quan không "sửa" xung đột giúp bạn — nó chỉ PHÁT HIỆN xung đột và từ chối ghi đè mù quáng. Xử lý tiếp (đọc lại, gộp, hỏi người dùng) vẫn là việc của tầng ứng dụng.',
    workedExample: {
      code: `type Dong = { id: number; gia: number; version: number }

// Ghi CÓ điều kiện: chỉ thành công nếu version vẫn khớp với lúc đã đọc.
function capNhatLacQuan(
  banGoc: Dong,
  phienBanDaDoc: number,
  giaMoi: number,
): { thanhCong: boolean; dong: Dong } {
  if (banGoc.version !== phienBanDaDoc) {
    // Ai đó đã ghi trước mình -> TỪ CHỐI, không đè lên
    return { thanhCong: false, dong: banGoc }
  }
  return { thanhCong: true, dong: { ...banGoc, gia: giaMoi, version: banGoc.version + 1 } }
}

let dong: Dong = { id: 1, gia: 100000, version: 0 }

// A và B cùng đọc dòng lúc version = 0
const phienBanA = dong.version
const phienBanB = dong.version

// A ghi TRƯỚC — version vẫn khớp -> thành công, version tăng lên 1
const ketQuaA = capNhatLacQuan(dong, phienBanA, 120000)
if (ketQuaA.thanhCong) dong = ketQuaA.dong

// B ghi SAU, dùng version đã đọc TỪ TRƯỚC (0) — nhưng dòng thật giờ đã là version 1
const ketQuaB = capNhatLacQuan(dong, phienBanB, 90000)

console.log("A thanh cong:", ketQuaA.thanhCong)
console.log("B thanh cong:", ketQuaB.thanhCong)
console.log("Gia cuoi cung:", dong.gia)`,
      stdinLines: [],
    },
    predict: {
      code: `type Dong = { id: number; gia: number; version: number }

function capNhatLacQuan(banGoc: Dong, phienBanDaDoc: number, giaMoi: number) {
  if (banGoc.version !== phienBanDaDoc) return { thanhCong: false, dong: banGoc }
  return { thanhCong: true, dong: { ...banGoc, gia: giaMoi, version: banGoc.version + 1 } }
}

let dong: Dong = { id: 9, gia: 50000, version: 3 }
const ketQua = capNhatLacQuan(dong, 3, 70000)
console.log(ketQua.thanhCong, ketQua.dong.version)`,
      question: 'Dòng có version=3, giao dịch đọc đúng version=3 rồi ghi. Kết quả in ra?',
      choices: ['true 4', 'false 3', 'true 3', 'false 4'],
      answerIndex: 0,
      explain:
        'version đã đọc (3) khớp đúng với version của dòng (3) → ghi THÀNH CÔNG, và version tăng lên 4 để lần ghi kế tiếp phải khớp với con số MỚI này. Đây chính là cơ chế: mỗi lần ghi thành công "tiêu thụ" version cũ và phát hành version mới, nên bất kỳ ai còn cầm version cũ sẽ bị từ chối.',
    },
    parsons: {
      prompt: 'Xếp lại hàm ghi có điều kiện — kiểm version TRƯỚC, chỉ tăng version khi ghi thật.',
      lines: [
        'function capNhatLacQuan(banGoc: Dong, phienBanDaDoc: number, giaMoi: number) {',
        '  if (banGoc.version !== phienBanDaDoc) {',
        '    return { thanhCong: false, dong: banGoc }',
        '  }',
        '  return { thanhCong: true, dong: { ...banGoc, gia: giaMoi, version: banGoc.version + 1 } }',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm capNhatLacQuan(banGoc, phienBanDaDoc, giaMoi) mô phỏng ghi có khoá lạc quan.\n\n- Nếu banGoc.version KHÁC phienBanDaDoc → trả { thanhCong: false, dong: banGoc } (dòng GIỮ NGUYÊN, không đổi gì).\n- Nếu KHỚP → trả { thanhCong: true, dong: <bản sao banGoc với gia = giaMoi VÀ version tăng thêm 1> }.\n\nSau đó, dùng starter code có sẵn (đừng sửa phần dưới): 3 giao dịch A, B, C cùng đọc dòng ban đầu (version=0), rồi ghi THEO ĐÚNG THỨ TỰ A → B → C, mỗi lần đều dùng phienBanDaDoc = 0 (đọc từ đầu, chưa ai cập nhật lại). In ra kết quả thanhCong của cả ba và giá/version cuối cùng.',
      starterCode: `type Dong = { id: number; gia: number; version: number }

function capNhatLacQuan(
  banGoc: Dong,
  phienBanDaDoc: number,
  giaMoi: number,
): { thanhCong: boolean; dong: Dong } {
  // TODO: kiểm version rồi ghi có điều kiện
  return { thanhCong: false, dong: banGoc }
}

// ---- Đừng sửa phần dưới đây ----
let dong: Dong = { id: 1, gia: 100000, version: 0 }
const ketQuaA = capNhatLacQuan(dong, 0, 110000)
if (ketQuaA.thanhCong) dong = ketQuaA.dong
const ketQuaB = capNhatLacQuan(dong, 0, 120000)
if (ketQuaB.thanhCong) dong = ketQuaB.dong
const ketQuaC = capNhatLacQuan(dong, 0, 130000)
if (ketQuaC.thanhCong) dong = ketQuaC.dong
console.log("A:", ketQuaA.thanhCong, "B:", ketQuaB.thanhCong, "C:", ketQuaC.thanhCong)
console.log("Gia cuoi:", dong.gia, "Version cuoi:", dong.version)`,
      testCases: [
        {
          stdinLines: [],
          expected: 'A: true B: false C: false',
          match: 'contains',
          hidden: false,
          label:
            'Chỉ giao dịch ĐẦU TIÊN (A) còn giữ đúng version 0 để ghi — B, C đến sau đều bị từ chối',
        },
        {
          stdinLines: [],
          expected: 'Gia cuoi: 110000',
          match: 'contains',
          hidden: false,
          label: 'Giá cuối là của A — B và C không đè lên được vì bị từ chối',
        },
        {
          stdinLines: [],
          expected: 'Version cuoi: 1',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: chỉ MỘT lần ghi thành công nên version chỉ tăng đúng 1 lần, không phải 3',
        },
      ],
      hints: [
        'So sánh banGoc.version !== phienBanDaDoc TRƯỚC — không khớp thì trả về dong: banGoc y nguyên (không đổi gia, không đổi version).',
        'Khớp thì mới tạo bản ghi mới: { ...banGoc, gia: giaMoi, version: banGoc.version + 1 }.',
        'Đừng quên version cũ vẫn giữ nguyên trong ca thất bại — đó là lý do B và C (đều đọc version 0) bị từ chối sau khi A đã ghi thành công và version thật đã lên 1.',
      ],
      sampleSolution: `type Dong = { id: number; gia: number; version: number }

function capNhatLacQuan(
  banGoc: Dong,
  phienBanDaDoc: number,
  giaMoi: number,
): { thanhCong: boolean; dong: Dong } {
  if (banGoc.version !== phienBanDaDoc) {
    return { thanhCong: false, dong: banGoc }
  }
  return { thanhCong: true, dong: { ...banGoc, gia: giaMoi, version: banGoc.version + 1 } }
}

let dong: Dong = { id: 1, gia: 100000, version: 0 }
const ketQuaA = capNhatLacQuan(dong, 0, 110000)
if (ketQuaA.thanhCong) dong = ketQuaA.dong
const ketQuaB = capNhatLacQuan(dong, 0, 120000)
if (ketQuaB.thanhCong) dong = ketQuaB.dong
const ketQuaC = capNhatLacQuan(dong, 0, 130000)
if (ketQuaC.thanhCong) dong = ketQuaC.dong
console.log("A:", ketQuaA.thanhCong, "B:", ketQuaB.thanhCong, "C:", ketQuaC.thanhCong)
console.log("Gia cuoi:", dong.gia, "Version cuoi:", dong.version)`,
    },
    homework:
      'Tra cứu cú pháp khoá bi quan thật của một CSDL bạn biết (PostgreSQL: `SELECT ... FOR UPDATE`; MySQL tương tự). Viết ra bằng lời: nếu đổi bài toán "sửa giá đơn hàng" ở trên sang khoá bi quan, luồng chạy của B sẽ khác gì so với bản lạc quan vừa viết (B chờ hay B bị từ chối)? Rồi tự trả lời: hệ thống ĐẶT CHỖ VÉ (nhiều người cùng bấm giữ 1 ghế cuối cùng) hợp khoá nào hơn — lạc quan hay bi quan? Vì sao?',
    srsCards: [
      {
        hoi: 'Lost update là gì và vì sao nguy hiểm hơn một lỗi báo rõ ràng?',
        dap: 'Hai giao dịch cùng đọc rồi cùng ghi một dòng, ghi SAU âm thầm đè lên ghi TRƯỚC. Nguy hiểm vì cả hai giao dịch đều báo thành công — không có lỗi nào, dữ liệu chỉ đơn giản là sai.',
      },
      {
        hoi: 'Khoá lạc quan phát hiện xung đột bằng cơ chế nào?',
        dap: 'Thêm cột version vào dòng; ghi kèm điều kiện "chỉ ghi nếu version vẫn khớp lúc đọc". Khớp thì ghi và tăng version; không khớp thì từ chối, không đè lên.',
      },
      {
        hoi: 'Chọn khoá lạc quan hay bi quan phụ thuộc điều gì?',
        dap: 'Tần suất va chạm. Va chạm HIẾM → lạc quan (không ai phải chờ trong trường hợp thường). Va chạm THƯỜNG XUYÊN → bi quan (chờ một lần rẻ hơn thử-thất bại nhiều lần).',
      },
    ],
  },
  {
    id: 'p6-u102-l2',
    unitId: 'p6-u102',
    language: 'typescript',
    title: 'Composite index: quy tắc TIỀN TỐ — thêm index mà truy vấn vẫn chậm',
    hook: 'Bạn thêm hẳn một index gồm hai cột `(khach_hang_id, ngay_tao)` cho bảng đơn hàng. Truy vấn "đơn hàng theo ngày" — lọc CHỈ theo `ngay_tao` — vẫn chậm y như trước khi có index. Không phải bug của CSDL. Bạn đã đặt index đúng cột, sai VỊ TRÍ.',
    theory:
      'COMPOSITE INDEX (index nhiều cột) hoạt động như một cuốn danh bạ sắp theo THỨ TỰ ƯU TIÊN các cột: index `(khach_hang_id, ngay_tao)` sắp trước hết theo khach_hang_id, rồi TRONG MỖI khach_hang_id mới sắp tiếp theo ngay_tao — giống sắp học sinh theo lớp trước, rồi trong mỗi lớp mới sắp theo tên.\n\nQUY TẮC TIỀN TỐ (leftmost prefix), luật quan trọng nhất của bài này: index chỉ tăng tốc được truy vấn khi điều kiện WHERE lọc theo các cột TỪ ĐẦU index TRỞ ĐI, KHÔNG BỎ CỘT NÀO:\n\n- WHERE khach_hang_id = X → dùng được (khớp đúng cột đầu).\n- WHERE khach_hang_id = X AND ngay_tao = Y → dùng được (khớp cả hai, theo đúng thứ tự).\n- WHERE ngay_tao = Y (thiếu khach_hang_id) → KHÔNG dùng được — giống muốn tra danh bạ theo TÊN mà danh bạ lại sắp theo LỚP trước: không có cách nhảy thẳng, phải giở từng lớp ra tìm.\n\nVì sao lại vậy: cấu trúc lưu trữ của index (thường là B-tree) chỉ "nhảy nhanh" được theo đúng thứ tự đã sắp. Bỏ qua cột đầu là mất hẳn khả năng nhảy nhanh của toàn bộ phần còn lại, dù cột đó (ngay_tao) VẪN NẰM TRONG index.\n\nCÁI GIÁ PHẢI TRẢ của mọi index, kể cả khi đặt đúng: mỗi lần INSERT/UPDATE/DELETE, CSDL phải cập nhật LẠI toàn bộ index liên quan — nhiều index thì ghi càng chậm. Bảng bị đọc nhiều, ghi ít thì thêm index gần như luôn lợi; bảng bị ghi liên tục (log, event) thì mỗi index thêm vào là một cái giá thật, phải cân nhắc có đáng không.\n\nPARTIAL INDEX (index một phần) là biến thể tiết kiệm: chỉ đánh index những dòng THOẢ một điều kiện (ví dụ `WHERE da_xoa = false`) — nhỏ hơn, nhanh hơn, rẻ hơn cho đúng câu hỏi hay gặp, nhưng vô dụng cho câu hỏi ngoài điều kiện đó.',
    workedExample: {
      code: `type DinhNghiaIndex = { ten: string; cot: string[] }

// Đếm số cột KHỚP LIÊN TỤC từ đầu index — đúng quy tắc leftmost prefix.
function khopIndex(dieuKienWhere: string[], index: DinhNghiaIndex): number {
  const cacCotLoc = new Set(dieuKienWhere)
  let dem = 0
  for (const cot of index.cot) {
    if (cacCotLoc.has(cot)) dem++
    else break // GẶP CỘT KHÔNG CÓ TRONG WHERE LÀ DỪNG NGAY, dù cột sau còn khớp
  }
  return dem
}

const CAC_INDEX: DinhNghiaIndex[] = [
  { ten: "idx_khach_ngay", cot: ["khach_hang_id", "ngay_tao"] },
  { ten: "idx_trang_thai", cot: ["trang_thai"] },
]

console.log("Loc theo khach_hang_id       ->", khopIndex(["khach_hang_id"], CAC_INDEX[0]!))
console.log("Loc theo khach_hang_id+ngay  ->", khopIndex(["khach_hang_id", "ngay_tao"], CAC_INDEX[0]!))
console.log("Loc CHI theo ngay_tao        ->", khopIndex(["ngay_tao"], CAC_INDEX[0]!))
// Dòng cuối: 0 khớp, dù ngay_tao CÓ nằm trong index — vì thiếu cột đầu`,
      stdinLines: [],
    },
    predict: {
      code: `type DinhNghiaIndex = { ten: string; cot: string[] }

function khopIndex(dieuKienWhere: string[], index: DinhNghiaIndex): number {
  const cacCotLoc = new Set(dieuKienWhere)
  let dem = 0
  for (const cot of index.cot) {
    if (cacCotLoc.has(cot)) dem++
    else break
  }
  return dem
}

const idx: DinhNghiaIndex = { ten: "idx_ba_cot", cot: ["a", "b", "c"] }
console.log(khopIndex(["a", "c"], idx))`,
      question: 'WHERE lọc theo cột a và c (bỏ qua b). Số cột index khớp được là bao nhiêu?',
      choices: ['1', '2', '3', '0'],
      answerIndex: 0,
      explain:
        'Kết quả là 1. Vòng lặp xét index theo đúng thứ tự a → b → c: cột "a" có trong điều kiện (đếm 1), nhưng cột "b" thì KHÔNG (dừng ngay bằng break) — dù cột "c" phía sau có nằm trong điều kiện cũng không được xét tới. Đây chính là quy tắc tiền tố: bỏ TRỐNG một cột ở giữa cũng làm gãy chuỗi y hệt bỏ cột đầu.',
    },
    parsons: {
      prompt: 'Xếp lại hàm đếm số cột khớp theo quy tắc tiền tố — gặp cột không khớp là dừng ngay.',
      lines: [
        'function khopIndex(dieuKienWhere: string[], index: DinhNghiaIndex): number {',
        '  const cacCotLoc = new Set(dieuKienWhere)',
        '  let dem = 0',
        '  for (const cot of index.cot) {',
        '    if (cacCotLoc.has(cot)) dem++',
        '    else break',
        '  }',
        '  return dem',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm chonIndexTotNhat(dieuKienWhere, cacIndex) chọn index PHÙ HỢP NHẤT cho một truy vấn.\n\n- Với mỗi index, tính số cột khớp LIÊN TỤC TỪ ĐẦU theo quy tắc tiền tố (dùng lại đúng cách tính của khopIndex trong ví dụ mẫu — bạn phải viết lại hàm đó bên trong bài này).\n- Trả về TÊN của index có số cột khớp CAO NHẤT.\n- Không index nào khớp được ít nhất 1 cột (mọi index đều khớp 0) → trả về chuỗi "KHONG_CO_INDEX_PHU_HOP".\n- Có nhiều index cùng khớp cao nhất → lấy index đứng TRƯỚC trong mảng cacIndex.\n\nDùng đúng type DinhNghiaIndex = { ten: string; cot: string[] } cho tham số cacIndex.',
      starterCode: `type DinhNghiaIndex = { ten: string; cot: string[] }

function khopIndex(dieuKienWhere: string[], index: DinhNghiaIndex): number {
  const cacCotLoc = new Set(dieuKienWhere)
  let dem = 0
  for (const cot of index.cot) {
    if (cacCotLoc.has(cot)) dem++
    else break
  }
  return dem
}

function chonIndexTotNhat(dieuKienWhere: string[], cacIndex: DinhNghiaIndex[]): string {
  // TODO: chọn index có diem khopIndex CAO NHẤT; hoà thì lấy index đứng trước
  return "KHONG_CO_INDEX_PHU_HOP"
}

// ---- Đừng sửa phần dưới đây ----
const CAC_INDEX: DinhNghiaIndex[] = [
  { ten: "idx_khach_ngay", cot: ["khach_hang_id", "ngay_tao"] },
  { ten: "idx_trang_thai", cot: ["trang_thai"] },
  { ten: "idx_khach", cot: ["khach_hang_id"] },
]
console.log(chonIndexTotNhat(["khach_hang_id", "ngay_tao"], CAC_INDEX))
console.log(chonIndexTotNhat(["khach_hang_id"], CAC_INDEX))
console.log(chonIndexTotNhat(["ngay_tao"], CAC_INDEX))
console.log(chonIndexTotNhat(["trang_thai"], CAC_INDEX))
console.log(chonIndexTotNhat(["mau_sac"], CAC_INDEX))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'idx_khach_ngay',
          match: 'contains',
          hidden: false,
          label: 'Lọc khach_hang_id + ngay_tao → khớp trọn index 2 cột, thắng index 1 cột',
        },
        {
          stdinLines: [],
          expected: 'KHONG_CO_INDEX_PHU_HOP',
          match: 'contains',
          hidden: false,
          label: 'Lọc CHỈ ngay_tao (thiếu cột đầu) → không index nào dùng được',
        },
        {
          stdinLines: [],
          expected: 'idx_trang_thai',
          match: 'contains',
          hidden: false,
          label: 'Lọc trang_thai → đúng index riêng cho cột đó',
        },
        {
          stdinLines: [],
          expected: 'KHONG_CO_INDEX_PHU_HOP',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: lọc theo cột không có index nào (mau_sac) → không phù hợp',
        },
      ],
      hints: [
        'Viết lại hàm khopIndex bên trong bài này y hệt ví dụ mẫu — tính số cột khớp liên tục từ đầu, gặp cột không khớp là break.',
        'Duyệt từng index trong cacIndex, tính điểm bằng khopIndex; giữ index có điểm CAO NHẤT thấy được — điểm bằng thì đừng cập nhật (giữ cái thấy TRƯỚC), đó là cách "hoà thì lấy index đứng trước" tự động đúng.',
        'Khởi tạo điểm tốt nhất = 0 và tên tốt nhất = "KHONG_CO_INDEX_PHU_HOP"; chỉ cập nhật khi điểm mới THỰC SỰ lớn hơn (>) điểm đang giữ, không phải >=.',
      ],
      sampleSolution: `type DinhNghiaIndex = { ten: string; cot: string[] }

function khopIndex(dieuKienWhere: string[], index: DinhNghiaIndex): number {
  const cacCotLoc = new Set(dieuKienWhere)
  let dem = 0
  for (const cot of index.cot) {
    if (cacCotLoc.has(cot)) dem++
    else break
  }
  return dem
}

function chonIndexTotNhat(dieuKienWhere: string[], cacIndex: DinhNghiaIndex[]): string {
  let tenTotNhat = "KHONG_CO_INDEX_PHU_HOP"
  let diemTotNhat = 0
  for (const index of cacIndex) {
    const diem = khopIndex(dieuKienWhere, index)
    if (diem > diemTotNhat) {
      diemTotNhat = diem
      tenTotNhat = index.ten
    }
  }
  return tenTotNhat
}

// ---- Đừng sửa phần dưới đây ----
const CAC_INDEX: DinhNghiaIndex[] = [
  { ten: "idx_khach_ngay", cot: ["khach_hang_id", "ngay_tao"] },
  { ten: "idx_trang_thai", cot: ["trang_thai"] },
  { ten: "idx_khach", cot: ["khach_hang_id"] },
]
console.log(chonIndexTotNhat(["khach_hang_id", "ngay_tao"], CAC_INDEX))
console.log(chonIndexTotNhat(["khach_hang_id"], CAC_INDEX))
console.log(chonIndexTotNhat(["ngay_tao"], CAC_INDEX))
console.log(chonIndexTotNhat(["trang_thai"], CAC_INDEX))
console.log(chonIndexTotNhat(["mau_sac"], CAC_INDEX))`,
    },
    homework:
      'Mở một bảng thật bạn có quyền truy cập (hoặc CSDL mẫu bất kỳ) và chạy `EXPLAIN` (PostgreSQL/MySQL) cho hai truy vấn: một truy vấn lọc đúng tiền tố của một index sẵn có, một truy vấn lọc thiếu cột đầu của cùng index đó. So sánh dòng "Index Scan" (dùng được index) với "Seq Scan"/"Table Scan" (phải quét toàn bảng). Ghi lại: bạn có index nào trong hệ thống đang dùng mà đặt SAI THỨ TỰ cột so với cách ứng dụng thật sự truy vấn không?',
    srsCards: [
      {
        hoi: 'Quy tắc tiền tố (leftmost prefix) của composite index nói gì?',
        dap: 'Index chỉ tăng tốc truy vấn khi WHERE lọc theo các cột TỪ ĐẦU index trở đi, không bỏ cột nào ở giữa hay ở đầu. Bỏ cột đầu là mất khả năng dùng index cho toàn bộ phần còn lại, dù cột sau vẫn nằm trong index.',
      },
      {
        hoi: 'Vì sao thêm index không phải lúc nào cũng lợi?',
        dap: 'Mỗi INSERT/UPDATE/DELETE phải cập nhật lại mọi index liên quan — nhiều index thì ghi càng chậm. Bảng ghi liên tục (log, event) phải cân nhắc kỹ trước khi thêm index, không phải "thêm index luôn là tốt".',
      },
      {
        hoi: 'Partial index khác composite index ở điểm nào?',
        dap: 'Partial index chỉ đánh index những dòng THOẢ một điều kiện (vd chưa xoá) — nhỏ và rẻ hơn cho đúng câu hỏi hay gặp, nhưng vô dụng cho truy vấn ngoài điều kiện đó. Composite index đánh mọi dòng theo nhiều cột.',
      },
    ],
  },
]
