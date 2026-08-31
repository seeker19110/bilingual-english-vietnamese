// lessons/p6u110.ts — P6-U110: HƯỚNG BACKEND, chặng S4 "Vận hành ở quy mô lớn" — module cuối
// (gộp `backend-s4-m3` "Bảo mật hệ thống" + `backend-s4-m4` "Kỷ luật vận hành").
//
// Bài 1 — phân quyền chi tiết + đặc quyền tối thiểu + deny-by-default: một hệ thống lớn có
// NHIỀU vai trò, NHIỀU tài nguyên — quy tắc "không khớp thì cấm" là thứ duy nhất an toàn khi
// danh sách quy tắc chưa liệt kê hết mọi trường hợp. Bài 2 — phân loại mức độ sự cố theo tiêu
// chí đo được + leo thang theo thời gian treo: khi hệ thống đã lớn, "sự cố nghiêm trọng cỡ
// nào" không còn là cảm giác của người trực, mà là một hàm tất định ai tính cũng ra cùng kết quả.
//
// Dùng làn `typescript`, mô phỏng bằng hàm thuần tất định — không mạng/CSDL/chứng chỉ thật.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U110_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u110-l1',
    unitId: 'p6-u110',
    language: 'typescript',
    title: 'Deny-by-default — không có quy tắc cho phép rõ ràng thì mặc định TỪ CHỐI',
    hook: 'Một nhân viên kế toán đăng nhập, gõ nhầm URL của trang quản trị nhân sự — và nó MỞ ĐƯỢC, chỉ vì hệ thống quên viết quy tắc chặn riêng cho đường dẫn đó. Hệ thống phân quyền tốt không hỏi "có quy tắc nào CẤM việc này không" — nó hỏi ngược lại: "có quy tắc nào CHO PHÉP việc này không". Không tìm thấy thì từ chối, dù chưa ai từng nghĩ tới việc cấm nó.',
    theory:
      'ĐẶC QUYỀN TỐI THIỂU (principle of least privilege): mỗi vai trò chỉ được cấp ĐÚNG những quyền cần để làm việc của mình, không hơn — kế toán xem được hoá đơn thì không có nghĩa kế toán cũng xem được hồ sơ lương nhân sự, dù cả hai đều là "dữ liệu tài chính".\n\nDENY-BY-DEFAULT (mặc định từ chối): danh sách quy tắc chỉ liệt kê những gì được PHÉP LÀM. Khi kiểm một yêu cầu, ta dò xem có quy tắc nào khớp CHÍNH XÁC không — có thì cho qua, KHÔNG CÓ thì từ chối, không có ngoại lệ "coi như cho phép" ngầm định. Đây là hướng an toàn hơn hẳn cách làm ngược lại (allow-by-default — mặc định cho phép, chỉ liệt kê thứ bị cấm): danh sách CẤM không bao giờ liệt kê hết được mọi trường hợp xấu, còn danh sách CHO PHÉP thiếu một dòng thì chỉ đơn giản là bị từ chối oan — vô hại hơn nhiều so với lộ dữ liệu.\n\nVí dụ số: danh sách quy tắc có 2 dòng — { vaiTro: "ke_toan", tainguyen: "hoa_don", hanhDong: "doc" } và { vaiTro: "ke_toan", tainguyen: "hoa_don", hanhDong: "sua" }. Yêu cầu (ke_toan, hoa_don, doc) → khớp dòng 1 → CHO PHÉP. Yêu cầu (ke_toan, ho_so_luong, doc) → không dòng nào có tainguyen="ho_so_luong" → TỪ CHỐI, dù cùng vai trò kế toán. Yêu cầu (ke_toan, hoa_don, xoa) → có vaiTro và tainguyen khớp nhưng hanhDong="xoa" không khớp dòng nào → vẫn TỪ CHỐI — phải khớp CẢ BA trường, khớp một phần không tính.\n\nHai mảnh liên quan, chỉ cần NẮM Ý TƯỞNG (không cần cài trong bài này):\n\n- XÁC THỰC GIỮA DỊCH VỤ BẰNG mTLS (mutual TLS): khi dịch vụ A gọi dịch vụ B nội bộ, không chỉ B chứng minh danh tính với A (như HTTPS thường thấy khi trình duyệt gọi web) — CẢ HAI CHIỀU đều phải chứng minh, mỗi dịch vụ có một chứng chỉ số riêng. Nhờ vậy một tiến trình lạ chen vào mạng nội bộ, dù gọi đúng địa chỉ, cũng không giả danh được dịch vụ hợp lệ vì không có chứng chỉ đúng.\n- KIỂM TOÁN TRUY CẬP DỮ LIỆU CÁ NHÂN: ghi lại NHẬT KÝ ai/cái gì đã XEM dữ liệu nhạy cảm (kể cả một tác tử AI nội bộ), khi nào, xem trường nào — không phải để NGĂN truy cập (đó là việc của phân quyền), mà để TRUY VẾT SAU KHI sự việc đã xảy ra: nếu phát hiện rò rỉ, nhật ký này cho biết chính xác ai đã chạm vào dữ liệu đó và lúc nào.',
    workedExample: {
      code: `type QuyTac = { vaiTro: string; tainguyen: string; hanhDong: string }

// Deny-by-default: chi CHO PHEP khi tim thay quy tac khop CA BA truong.
// Khong tim thay -> tu choi, khong co "quy tac ngam cho phep".
function kiemTraQuyen(
  vaiTro: string,
  tainguyen: string,
  hanhDong: string,
  danhSachQuyTac: QuyTac[]
): boolean {
  return danhSachQuyTac.some(
    (qt) => qt.vaiTro === vaiTro && qt.tainguyen === tainguyen && qt.hanhDong === hanhDong
  )
}

const quyTac: QuyTac[] = [
  { vaiTro: "ke_toan", tainguyen: "hoa_don", hanhDong: "doc" },
  { vaiTro: "ke_toan", tainguyen: "hoa_don", hanhDong: "sua" },
  { vaiTro: "quan_ly_nhan_su", tainguyen: "ho_so_luong", hanhDong: "doc" },
]

console.log(kiemTraQuyen("ke_toan", "hoa_don", "doc", quyTac)) // true - khop dung dong 1
console.log(kiemTraQuyen("ke_toan", "ho_so_luong", "doc", quyTac)) // false - sai tainguyen
console.log(kiemTraQuyen("ke_toan", "hoa_don", "xoa", quyTac)) // false - sai hanhDong
console.log(kiemTraQuyen("quan_ly_nhan_su", "ho_so_luong", "doc", quyTac)) // true - dung vai tro`,
      stdinLines: [],
    },
    predict: {
      code: `type QuyTac = { vaiTro: string; tainguyen: string; hanhDong: string }

function kiemTraQuyen(vaiTro: string, tainguyen: string, hanhDong: string, ds: QuyTac[]): boolean {
  return ds.some((qt) => qt.vaiTro === vaiTro && qt.tainguyen === tainguyen && qt.hanhDong === hanhDong)
}

const quyTac: QuyTac[] = [
  { vaiTro: "ke_toan", tainguyen: "hoa_don", hanhDong: "doc" },
]

console.log(kiemTraQuyen("ke_toan", "hoa_don", "sua", quyTac))`,
      question:
        'Danh sách quy tắc chỉ có đúng một dòng cho phép kế toán ĐỌC hoá đơn. Gọi kiemTraQuyen với hành động "sua" (sửa) — kết quả in ra là gì?',
      choices: ['false', 'true', 'undefined', 'lỗi runtime'],
      answerIndex: 0,
      explain:
        'Kết quả là false. Dòng quy tắc duy nhất có hanhDong="doc", trong khi yêu cầu kiểm tra hanhDong="sua" — ba trường phải khớp CHÍNH XÁC cùng lúc (vaiTro, tainguyen, hanhDong), khớp 2/3 trường không tính là khớp. Không có quy tắc nào khớp đủ ba trường nên .some() trả về false — đây chính là deny-by-default: thiếu quy tắc cho phép rõ ràng thì mặc định từ chối, không có "coi như được vì vai trò và tài nguyên đã đúng".',
    },
    parsons: {
      prompt: 'Xếp lại thân hàm kiemTraQuyen theo đúng logic deny-by-default.',
      lines: [
        'function kiemTraQuyen(',
        '  vaiTro: string,',
        '  tainguyen: string,',
        '  hanhDong: string,',
        '  danhSachQuyTac: QuyTac[]',
        '): boolean {',
        '  return danhSachQuyTac.some(',
        '    (qt) => qt.vaiTro === vaiTro && qt.tainguyen === tainguyen && qt.hanhDong === hanhDong',
        '  )',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm kiemTraQuyen(vaiTro: string, tainguyen: string, hanhDong: string, danhSachQuyTac: QuyTac[]): boolean theo đúng nguyên tắc deny-by-default.\n\n- QuyTac là type { vaiTro: string; tainguyen: string; hanhDong: string }.\n- Trả về true CHỈ KHI danh sách có ÍT NHẤT MỘT quy tắc khớp CHÍNH XÁC cả ba trường (vaiTro, tainguyen, hanhDong).\n- Không có quy tắc nào khớp đủ cả ba trường → trả về false (mặc định từ chối, không có ngoại lệ ngầm).\n\nViết thêm hàm demQuyenDuocCap(vaiTro: string, danhSachQuyTac: QuyTac[]): number đếm số quy tắc trong danh sách có vaiTro khớp đúng (dùng để nhanh chóng biết một vai trò đang có bao nhiêu quyền được cấp).',
      starterCode: `type QuyTac = { vaiTro: string; tainguyen: string; hanhDong: string }

function kiemTraQuyen(
  vaiTro: string,
  tainguyen: string,
  hanhDong: string,
  danhSachQuyTac: QuyTac[]
): boolean {
  // TODO: deny-by-default - true CHI KHI co quy tac khop CA BA truong
  return false
}

function demQuyenDuocCap(vaiTro: string, danhSachQuyTac: QuyTac[]): number {
  // TODO: dem so quy tac co vaiTro khop dung
  return 0
}

// ---- Đừng sửa phần dưới đây ----
const quyTac: QuyTac[] = [
  { vaiTro: "ke_toan", tainguyen: "hoa_don", hanhDong: "doc" },
  { vaiTro: "ke_toan", tainguyen: "hoa_don", hanhDong: "sua" },
  { vaiTro: "quan_ly_nhan_su", tainguyen: "ho_so_luong", hanhDong: "doc" },
]

console.log("doc hoa don:", kiemTraQuyen("ke_toan", "hoa_don", "doc", quyTac))
console.log("xem luong:", kiemTraQuyen("ke_toan", "ho_so_luong", "doc", quyTac))
console.log("xoa hoa don:", kiemTraQuyen("ke_toan", "hoa_don", "xoa", quyTac))
console.log("so quyen ke toan:", demQuyenDuocCap("ke_toan", quyTac))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'doc hoa don: true',
          match: 'contains',
          hidden: false,
          label: 'Có quy tắc khớp đủ 3 trường → cho phép',
        },
        {
          stdinLines: [],
          expected: 'xem luong: false',
          match: 'contains',
          hidden: false,
          label: 'Sai tainguyen so với mọi quy tắc của vai trò đó → deny-by-default từ chối',
        },
        {
          stdinLines: [],
          expected: 'xoa hoa don: false',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đúng vaiTro+tainguyen nhưng sai hanhDong vẫn phải từ chối',
        },
        {
          stdinLines: [],
          expected: 'so quyen ke toan: 2',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: demQuyenDuocCap đếm đúng số quy tắc có vaiTro="ke_toan"',
        },
      ],
      hints: [
        'Dùng danhSachQuyTac.some(qt => ...) và so sánh cả ba trường bằng && — thiếu một điều kiện là sai deny-by-default.',
        'demQuyenDuocCap dùng .filter(qt => qt.vaiTro === vaiTro).length, không cần so tainguyen/hanhDong.',
        'Đừng viết nhánh "nếu vaiTro hợp lệ thì mặc định true" — mọi quyền phải xuất phát từ một dòng quy tắc khớp thật.',
      ],
      sampleSolution: `type QuyTac = { vaiTro: string; tainguyen: string; hanhDong: string }

function kiemTraQuyen(
  vaiTro: string,
  tainguyen: string,
  hanhDong: string,
  danhSachQuyTac: QuyTac[]
): boolean {
  return danhSachQuyTac.some(
    (qt) => qt.vaiTro === vaiTro && qt.tainguyen === tainguyen && qt.hanhDong === hanhDong
  )
}

function demQuyenDuocCap(vaiTro: string, danhSachQuyTac: QuyTac[]): number {
  return danhSachQuyTac.filter((qt) => qt.vaiTro === vaiTro).length
}

// ---- Đừng sửa phần dưới đây ----
const quyTac: QuyTac[] = [
  { vaiTro: "ke_toan", tainguyen: "hoa_don", hanhDong: "doc" },
  { vaiTro: "ke_toan", tainguyen: "hoa_don", hanhDong: "sua" },
  { vaiTro: "quan_ly_nhan_su", tainguyen: "ho_so_luong", hanhDong: "doc" },
]

console.log("doc hoa don:", kiemTraQuyen("ke_toan", "hoa_don", "doc", quyTac))
console.log("xem luong:", kiemTraQuyen("ke_toan", "ho_so_luong", "doc", quyTac))
console.log("xoa hoa don:", kiemTraQuyen("ke_toan", "hoa_don", "xoa", quyTac))
console.log("so quyen ke toan:", demQuyenDuocCap("ke_toan", quyTac))`,
    },
    homework:
      'Nghĩ về một ứng dụng bạn dùng có nhiều vai trò người dùng (vd nhóm chat có "chủ nhóm"/"thành viên", app ngân hàng có "chủ tài khoản"/"đồng sở hữu"). Liệt kê 3 cặp (vai trò, hành động) mà bạn TIN là vai trò thấp hơn KHÔNG được phép làm — rồi thử tưởng tượng nếu hệ thống đó lỡ dùng allow-by-default (mặc định cho phép, chỉ liệt kê điều cấm) thay vì deny-by-default, điều gì có thể xảy ra nếu người viết quy tắc quên liệt kê một trong ba cặp đó?',
    srsCards: [
      {
        hoi: 'Deny-by-default nghĩa là gì, và vì sao an toàn hơn allow-by-default?',
        dap: 'Chỉ cho phép khi tìm thấy quy tắc CHO PHÉP khớp rõ ràng — không tìm thấy thì mặc định từ chối. An toàn hơn vì danh sách CẤM không bao giờ liệt kê hết mọi trường hợp xấu, còn thiếu một dòng CHO PHÉP chỉ gây từ chối oan (vô hại hơn lộ dữ liệu).',
      },
      {
        hoi: 'Nguyên tắc đặc quyền tối thiểu (least privilege) là gì?',
        dap: 'Mỗi vai trò chỉ được cấp đúng những quyền cần cho công việc của mình, không hơn — quyền trên một tài nguyên không tự động kéo theo quyền trên tài nguyên khác dù cùng nhóm dữ liệu.',
      },
      {
        hoi: 'mTLS (mutual TLS) khác HTTPS thông thường ở điểm nào khi hai dịch vụ nội bộ gọi nhau?',
        dap: 'HTTPS thường chỉ server chứng minh danh tính với client; mTLS bắt CẢ HAI CHIỀU chứng minh — mỗi dịch vụ có chứng chỉ riêng, nên một tiến trình lạ trong mạng nội bộ không giả danh được dịch vụ hợp lệ dù gọi đúng địa chỉ.',
      },
      {
        hoi: 'Kiểm toán truy cập dữ liệu cá nhân dùng để làm gì — ngăn chặn hay truy vết?',
        dap: 'Để TRUY VẾT SAU KHI sự việc xảy ra, không phải để ngăn chặn (đó là việc của phân quyền) — ghi lại ai/cái gì đã xem dữ liệu nào, khi nào, để khi phát hiện rò rỉ biết chính xác nguồn gốc.',
      },
    ],
  },
  {
    id: 'p6-u110-l2',
    unitId: 'p6-u110',
    language: 'typescript',
    title: 'Phân loại mức độ sự cố và leo thang — con số quyết định, không phải cảm giác',
    hook: 'Nửa đêm, hệ thống báo lỗi. Người trực phải quyết trong vài giây: đánh thức cả đội hay để sáng mai xử lý? Nếu quyết định dựa trên "cảm giác nghiêm trọng" thì mỗi ca trực một kiểu — đội chuyên nghiệp không làm vậy: họ có một HÀM tất định, cho cùng đầu vào luôn ra cùng mức độ, và một QUY TẮC leo thang tính bằng phút, không phải bằng cảm giác "chắc để lâu được".',
    theory:
      'PHÂN LOẠI MỨC ĐỘ SỰ CỐ (severity) phải dựa trên TIÊU CHÍ ĐO ĐƯỢC, theo thứ tự ưu tiên rõ ràng — không phải "nghe có vẻ nghiêm trọng":\n\nSEV1 (nghiêm trọng nhất) — bất kỳ điều nào sau đây xảy ra: MẤT DỮ LIỆU, hoặc MẤT TIỀN (giao dịch sai/thất thoát), hoặc số người dùng bị ảnh hưởng đạt một NGƯỠNG LỚN (ví dụ ≥ 10.000 người).\n\nSEV2 (vừa) — KHÔNG rơi vào SEV1, nhưng số người dùng bị ảnh hưởng đạt một ngưỡng vừa (ví dụ ≥ 100 người, dưới 10.000).\n\nSEV3 (nhỏ) — mọi trường hợp còn lại.\n\nThứ tự kiểm PHẢI đi từ SEV1 xuống — vì mất dữ liệu dù chỉ ảnh hưởng 5 người vẫn là SEV1, không phải "ít người nên nhẹ". Ví dụ số: 50 người dùng bị ảnh hưởng, KHÔNG mất dữ liệu, KHÔNG mất tiền → không rơi vào điều kiện SEV1 nào, và 50 < 100 nên cũng không đạt SEV2 → kết quả là SEV3. Nhưng nếu chỉ 5 người dùng bị ảnh hưởng mà CÓ mất dữ liệu → SEV1 ngay lập tức, dù số người rất nhỏ — vì điều kiện "mất dữ liệu" đứng ĐỘC LẬP với ngưỡng số người.\n\nQUY TRÌNH LEO THANG (escalation) đo bằng THỜI GIAN CHƯA GIẢI QUYẾT, ngưỡng khác nhau theo mức độ — sự cố càng nghiêm trọng thì thời gian chịu được càng ngắn: SEV1 quá 15 phút chưa giải quyết → phải leo thang (gọi thêm người, báo cấp trên). SEV2 quá 60 phút. SEV3 quá 240 phút (4 giờ). Ví dụ số: một sự cố SEV1 đã treo 20 phút → 20 > 15 → phải leo thang. Cùng thời gian 20 phút đó nếu là sự cố SEV2 → 20 < 60 → CHƯA cần leo thang, vẫn trong ngưỡng chịu được của mức độ đó.\n\nHai mảnh liên quan, chỉ cần NẮM Ý TƯỞNG (không cần cài trong bài này):\n\n- POST-MORTEM KHÔNG ĐỔ LỖI (blameless): sau khi sự cố kết thúc, buổi rà soát tập trung câu hỏi "QUY TRÌNH/HỆ THỐNG hỏng ở khâu nào khiến lỗi này lọt qua được" — KHÔNG phải "ai đã bấm sai nút". Lý do: nếu văn hoá đổ lỗi cá nhân, người tiếp theo gặp dấu hiệu bất thường sẽ CHE GIẤU thay vì báo sớm, vì sợ bị quy trách nhiệm — khiến sự cố lần sau phát hiện càng muộn.\n- DI TRÚ DỮ LIỆU LỚN KHÔNG DOWNTIME: chuyển dữ liệu quy mô lớn (đổi schema, đổi hệ CSDL) làm theo TỪNG BƯỚC NHỎ có thể DỪNG/LÙI giữa chừng (vd ghi đồng thời vào cả kho cũ và kho mới một thời gian, kiểm tra khớp dữ liệu, rồi mới chuyển hẳn) — thay vì một lệnh chạy một lần rồi hy vọng nó đúng, vì lệnh một lần mà sai giữa chừng thì không có đường lùi an toàn.',
    workedExample: {
      code: `type MucDo = "SEV1" | "SEV2" | "SEV3"

// Uu tien kiem SEV1 truoc: mat du lieu HOAC mat tien HOAC anh huong >= 10000 nguoi.
function phanLoaiMucDo(soNguoiDungAnhHuong: number, coMatDuLieu: boolean, coMatTien: boolean): MucDo {
  if (coMatDuLieu || coMatTien || soNguoiDungAnhHuong >= 10000) {
    return "SEV1"
  }
  if (soNguoiDungAnhHuong >= 100) {
    return "SEV2"
  }
  return "SEV3"
}

// Nguong leo thang (phut) rieng cho tung muc do.
function canLeoThang(mucDo: MucDo, soPhutChuaGiaiQuyet: number): boolean {
  const nguongTheoMucDo: Record<MucDo, number> = { SEV1: 15, SEV2: 60, SEV3: 240 }
  return soPhutChuaGiaiQuyet > nguongTheoMucDo[mucDo]
}

console.log(phanLoaiMucDo(50, false, false)) // SEV3 - it nguoi, khong mat gi
console.log(phanLoaiMucDo(5, true, false)) // SEV1 - mat du lieu, du chi 5 nguoi
console.log(phanLoaiMucDo(500, false, false)) // SEV2 - du 100 nguoi tro len
console.log(canLeoThang("SEV1", 20)) // true - 20 phut > nguong 15 cua SEV1
console.log(canLeoThang("SEV2", 20)) // false - 20 phut < nguong 60 cua SEV2`,
      stdinLines: [],
    },
    predict: {
      code: `type MucDo = "SEV1" | "SEV2" | "SEV3"

function phanLoaiMucDo(soNguoi: number, matDuLieu: boolean, matTien: boolean): MucDo {
  if (matDuLieu || matTien || soNguoi >= 10000) return "SEV1"
  if (soNguoi >= 100) return "SEV2"
  return "SEV3"
}

console.log(phanLoaiMucDo(8000, false, true))`,
      question:
        '8.000 người dùng bị ảnh hưởng, KHÔNG mất dữ liệu, nhưng CÓ mất tiền. Hàm phanLoaiMucDo trả về mức độ nào?',
      choices: ['SEV1', 'SEV2', 'SEV3', 'undefined'],
      answerIndex: 0,
      explain:
        'Kết quả là SEV1. Điều kiện SEV1 là "coMatDuLieu HOẶC coMatTien HOẶC soNguoiDung >= 10000" — chỉ cần MỘT trong ba đúng là đủ. Ở đây coMatTien=true nên toàn bộ điều kiện OR đã đúng, hàm trả về SEV1 ngay từ nhánh if đầu tiên — dù số người (8.000) CHƯA đạt ngưỡng 10.000 để tự nó gây SEV1. Đây là bẫy hay nhầm: nhiều người chỉ nhìn vào số người dùng (8.000 < 10.000) rồi kết luận sai là SEV2, quên mất "mất tiền" là điều kiện ĐỘC LẬP đứng riêng trong phép OR.',
    },
    parsons: {
      prompt: 'Xếp lại thân hàm phanLoaiMucDo theo đúng thứ tự ưu tiên SEV1 → SEV2 → SEV3.',
      lines: [
        'function phanLoaiMucDo(soNguoiDungAnhHuong: number, coMatDuLieu: boolean, coMatTien: boolean): MucDo {',
        '  if (coMatDuLieu || coMatTien || soNguoiDungAnhHuong >= 10000) {',
        '    return "SEV1"',
        '  }',
        '  if (soNguoiDungAnhHuong >= 100) {',
        '    return "SEV2"',
        '  }',
        '  return "SEV3"',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hai hàm phân loại và leo thang sự cố.\n\n- phanLoaiMucDo(soNguoiDungAnhHuong: number, coMatDuLieu: boolean, coMatTien: boolean): "SEV1"|"SEV2"|"SEV3":\n  - SEV1 nếu coMatDuLieu HOẶC coMatTien HOẶC soNguoiDungAnhHuong >= 10000 (kiểm ĐẦU TIÊN).\n  - Nếu không phải SEV1: SEV2 nếu soNguoiDungAnhHuong >= 100.\n  - Còn lại: SEV3.\n- canLeoThang(mucDo: "SEV1"|"SEV2"|"SEV3", soPhutChuaGiaiQuyet: number): boolean — trả về true khi soPhutChuaGiaiQuyet VƯỢT QUÁ (strictly greater than) ngưỡng của mức độ đó: SEV1 → 15 phút, SEV2 → 60 phút, SEV3 → 240 phút.',
      starterCode: `type MucDo = "SEV1" | "SEV2" | "SEV3"

function phanLoaiMucDo(
  soNguoiDungAnhHuong: number,
  coMatDuLieu: boolean,
  coMatTien: boolean
): MucDo {
  // TODO: kiem SEV1 truoc (mat du lieu HOAC mat tien HOAC >= 10000 nguoi), roi SEV2, roi SEV3
  return "SEV3"
}

function canLeoThang(mucDo: MucDo, soPhutChuaGiaiQuyet: number): boolean {
  // TODO: SEV1>15, SEV2>60, SEV3>240 phut thi phai leo thang
  return false
}

// ---- Đừng sửa phần dưới đây ----
console.log("50 nguoi, khong mat gi:", phanLoaiMucDo(50, false, false))
console.log("5 nguoi, mat du lieu:", phanLoaiMucDo(5, true, false))
console.log("500 nguoi:", phanLoaiMucDo(500, false, false))
console.log("SEV1 treo 20 phut:", canLeoThang("SEV1", 20))
console.log("SEV2 treo 20 phut:", canLeoThang("SEV2", 20))
console.log("SEV3 treo 300 phut:", canLeoThang("SEV3", 300))`,
      testCases: [
        {
          stdinLines: [],
          expected: '50 nguoi, khong mat gi: SEV3',
          match: 'contains',
          hidden: false,
          label: 'Ít người, không mất dữ liệu/tiền → SEV3',
        },
        {
          stdinLines: [],
          expected: '5 nguoi, mat du lieu: SEV1',
          match: 'contains',
          hidden: false,
          label: 'Mất dữ liệu là SEV1 độc lập với số người dùng, dù chỉ 5 người',
        },
        {
          stdinLines: [],
          expected: '500 nguoi: SEV2',
          match: 'contains',
          hidden: false,
          label: 'Đạt ngưỡng 100 người trở lên, không mất dữ liệu/tiền, dưới 10000 → SEV2',
        },
        {
          stdinLines: [],
          expected: 'SEV1 treo 20 phut: true',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: SEV1 treo 20 phút > ngưỡng 15 → phải leo thang',
        },
        {
          stdinLines: [],
          expected: 'SEV2 treo 20 phut: false',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: SEV2 treo 20 phút < ngưỡng 60 → chưa cần leo thang',
        },
        {
          stdinLines: [],
          expected: 'SEV3 treo 300 phut: true',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: SEV3 treo 300 phút > ngưỡng 240 → phải leo thang',
        },
      ],
      hints: [
        'phanLoaiMucDo phải kiểm SEV1 TRƯỚC TIÊN bằng phép OR ba điều kiện — đừng kiểm soNguoiDungAnhHuong trước rồi mới xét mất dữ liệu/tiền.',
        'canLeoThang dùng một Record<MucDo, number> hoặc chuỗi if/else so soPhutChuaGiaiQuyet với đúng ngưỡng của mucDo, nhớ dùng dấu > (vượt quá) chứ không phải >=.',
        'Với phanLoaiMucDo: nếu đã return "SEV1" ở nhánh đầu thì các dòng sau không chạy tới nữa — không cần else, cứ return sớm.',
      ],
      sampleSolution: `type MucDo = "SEV1" | "SEV2" | "SEV3"

function phanLoaiMucDo(
  soNguoiDungAnhHuong: number,
  coMatDuLieu: boolean,
  coMatTien: boolean
): MucDo {
  if (coMatDuLieu || coMatTien || soNguoiDungAnhHuong >= 10000) {
    return "SEV1"
  }
  if (soNguoiDungAnhHuong >= 100) {
    return "SEV2"
  }
  return "SEV3"
}

function canLeoThang(mucDo: MucDo, soPhutChuaGiaiQuyet: number): boolean {
  const nguongTheoMucDo: Record<MucDo, number> = { SEV1: 15, SEV2: 60, SEV3: 240 }
  return soPhutChuaGiaiQuyet > nguongTheoMucDo[mucDo]
}

// ---- Đừng sửa phần dưới đây ----
console.log("50 nguoi, khong mat gi:", phanLoaiMucDo(50, false, false))
console.log("5 nguoi, mat du lieu:", phanLoaiMucDo(5, true, false))
console.log("500 nguoi:", phanLoaiMucDo(500, false, false))
console.log("SEV1 treo 20 phut:", canLeoThang("SEV1", 20))
console.log("SEV2 treo 20 phut:", canLeoThang("SEV2", 20))
console.log("SEV3 treo 300 phut:", canLeoThang("SEV3", 300))`,
    },
    homework:
      'Tìm một bài "post-mortem" công khai của một công ty công nghệ lớn (nhiều công ty đăng công khai sau sự cố nghiêm trọng, tìm từ khoá "[tên công ty] postmortem outage"). Đọc phần "nguyên nhân gốc rễ" (root cause) — nó mô tả một QUY TRÌNH/HỆ THỐNG hỏng ở đâu, hay mô tả một CÁ NHÂN đã làm sai? Viết 2-3 câu về việc bài viết đó có giữ đúng tinh thần "blameless" (không đổ lỗi) hay không, và vì sao cách viết đó (dù người đọc ngoài công ty) vẫn quan trọng với việc đội ngũ nội bộ có dám báo sự cố sớm ở lần sau hay không.',
    srsCards: [
      {
        hoi: 'Vì sao phải kiểm điều kiện SEV1 TRƯỚC, thay vì kiểm số người dùng ảnh hưởng trước?',
        dap: 'Vì mất dữ liệu hoặc mất tiền là SEV1 ĐỘC LẬP với số người dùng — một sự cố chỉ ảnh hưởng 5 người nhưng mất dữ liệu vẫn phải là SEV1, nếu kiểm số người trước sẽ nhầm nó thành SEV3.',
      },
      {
        hoi: 'Ngưỡng leo thang (phút) của SEV1/SEV2/SEV3 khác nhau thế nào, và vì sao SEV1 có ngưỡng ngắn nhất?',
        dap: 'SEV1 quá 15 phút, SEV2 quá 60 phút, SEV3 quá 240 phút chưa giải quyết thì phải leo thang. SEV1 ngắn nhất vì mức độ nghiêm trọng cao nhất — càng để lâu thiệt hại càng lớn, nên thời gian chịu được trước khi cần thêm người phải ngắn hơn.',
      },
      {
        hoi: 'Post-mortem không đổ lỗi (blameless) tập trung vào câu hỏi gì, và vì sao?',
        dap: 'Tập trung "quy trình/hệ thống hỏng ở khâu nào" thay vì "ai đã bấm sai" — vì văn hoá đổ lỗi cá nhân khiến người sau che giấu dấu hiệu bất thường thay vì báo sớm, làm sự cố lần sau phát hiện muộn hơn.',
      },
      {
        hoi: 'Di trú dữ liệu lớn không downtime nên làm theo cách nào, và vì sao không nên chạy một lệnh một lần?',
        dap: 'Làm theo từng bước nhỏ có thể dừng/lùi giữa chừng (vd ghi đồng thời kho cũ và mới, kiểm khớp dữ liệu, rồi mới chuyển hẳn) — vì một lệnh chạy một lần mà sai giữa chừng thì không có đường lùi an toàn.',
      },
    ],
  },
]
