// lessons/p6u112.ts — P6-U112: HƯỚNG WEB, chặng S2 — lưu trữ & định danh phía server, GỘP
// hai module `web-s2-m2` (Cơ sở dữ liệu quan hệ) + `web-s2-m3` (Xác thực & phiên).
//
// l1 đi CỐ Ý theo góc KHÁC p6-u102 (đã dạy khoá lạc quan chống lost update + tiền tố composite
// index): ở đây dạy TOÀN VẸN THAM CHIẾU (referential integrity) qua khoá ngoại — kiểm tra thủ
// công điều mà ràng buộc FOREIGN KEY của CSDL thật làm tự động, cho ca ứng dụng tự build logic
// tay (ORM không bật constraint, hoặc microservice khác DB không share FK).
// l2 dạy hai mảnh của xác thực & phiên: (1) so sánh mật khẩu qua hàm băm MÔ PHỎNG (không dùng
// thư viện thật, ghi rõ đây là mô phỏng để dạy khái niệm) và (2) chọn cơ chế phiên theo luật ưu
// tiên rõ ràng (session-cookie thắng khi cần thu hồi ngay, kể cả khi cả hai điều kiện đều đúng).
//
// Mọi giá trị số/chuỗi trong theory/predict/testCases đã chạy thật qua tsc --strict + node
// trước khi soạn (thư mục /tmp/webs2-u112), không suy đoán.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U112_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u112-l1',
    unitId: 'p6-u112',
    language: 'typescript',
    title: 'Toàn vẹn tham chiếu — đừng tạo đơn hàng cho một khách hàng không tồn tại',
    hook: 'Bạn dùng ORM để "tiện", quên bật ràng buộc khoá ngoại. Một request lỗi gửi lên `khachHangId: "kh-999"` — mã đó KHÔNG tồn tại trong bảng khách hàng. Ứng dụng vẫn "chèn" thành công một đơn hàng trỏ tới một khách hàng MA. Ba tháng sau, báo cáo doanh thu bị lệch vì có đơn hàng không ai đứng tên nhận.',
    theory:
      'TOÀN VẸN THAM CHIẾU (referential integrity) là quy tắc: một bản ghi KHÔNG được trỏ tới (tham chiếu) một bản ghi khác KHÔNG TỒN TẠI. Trong CSDL quan hệ, ràng buộc KHOÁ NGOẠI (FOREIGN KEY) là cơ chế server tự động ép quy tắc này — khai báo `don_hang.khach_hang_id REFERENCES khach_hang(id)` thì CSDL sẽ TỰ TỪ CHỐI mọi lệnh INSERT/UPDATE cố trỏ tới một `id` khách hàng không có trong bảng `khach_hang`, không cần ứng dụng viết thêm dòng code nào.\n\nVẤN ĐỀ: ràng buộc này chỉ hoạt động khi nó THẬT SỰ được khai báo và BẬT trong CSDL. Có những tình huống nó KHÔNG che chắn được:\n\n- Một số ORM, khi sinh schema tự động hoặc cấu hình "nới lỏng" để tiện phát triển, không bật FOREIGN KEY constraint.\n- Kiến trúc microservice: bảng đơn hàng và bảng khách hàng nằm ở HAI CSDL KHÁC NHAU (thuộc hai service khác nhau) — CSDL vật lý không thể ràng buộc chéo qua service khác được, vì mỗi CSDL chỉ biết dữ liệu của chính nó.\n- Dữ liệu đến từ nguồn không qua CSDL trung gian (import file, đồng bộ từ hệ thống cũ).\n\nỞ những tình huống đó, ỨNG DỤNG phải TỰ LÀM lại việc mà FOREIGN KEY vốn làm tự động: kiểm tra khoá tham chiếu có tồn tại TRƯỚC khi ghi. Bài này không thay thế FOREIGN KEY thật (luôn ưu tiên bật ràng buộc ở CSDL khi có thể — nó nhanh hơn, đúng hơn, và không ai quên gọi) — nó dạy CÁCH TỰ VỆ khi ràng buộc đó KHÔNG có sẵn, để logic nghiệp vụ không âm thầm tạo ra dữ liệu mồ côi.',
    workedExample: {
      code: `type DuLieuDon = { sanPham: string; soLuong: number }
type KetQuaThemDon =
  | { thanhCong: true; donHang: { khachHangId: string; sanPham: string; soLuong: number } }
  | { thanhCong: false; loi: string }

function themDonHang(
  khachHangId: string,
  danhSachKhachHangHopLe: string[],
  duLieuDon: DuLieuDon
): KetQuaThemDon {
  // Mo phong FOREIGN KEY: kiem khachHangId co ton tai TRUOC khi "chen"
  if (!danhSachKhachHangHopLe.includes(khachHangId)) {
    return { thanhCong: false, loi: \`Khong tim thay khach hang "\${khachHangId}" — tu choi tao don hang\` }
  }
  return { thanhCong: true, donHang: { khachHangId, ...duLieuDon } }
}

const KHACH_HANG_HOP_LE = ["kh-01", "kh-02", "kh-03"]

console.log(JSON.stringify(themDonHang("kh-02", KHACH_HANG_HOP_LE, { sanPham: "Ao thun", soLuong: 2 })))
console.log(JSON.stringify(themDonHang("kh-99", KHACH_HANG_HOP_LE, { sanPham: "Quan jean", soLuong: 1 })))`,
      stdinLines: [],
    },
    predict: {
      code: `type DuLieuDon = { sanPham: string; soLuong: number }
type KetQuaThemDon =
  | { thanhCong: true; donHang: { khachHangId: string; sanPham: string; soLuong: number } }
  | { thanhCong: false; loi: string }

function themDonHang(
  khachHangId: string,
  danhSachKhachHangHopLe: string[],
  duLieuDon: DuLieuDon
): KetQuaThemDon {
  if (!danhSachKhachHangHopLe.includes(khachHangId)) {
    return { thanhCong: false, loi: \`Khong tim thay khach hang "\${khachHangId}" — tu choi tao don hang\` }
  }
  return { thanhCong: true, donHang: { khachHangId, ...duLieuDon } }
}

const kq = themDonHang("kh-05", ["kh-01", "kh-02"], { sanPham: "Sach", soLuong: 1 })
console.log(kq.thanhCong)`,
      question:
        '"kh-05" KHÔNG có trong danh sách khách hàng hợp lệ. `console.log(kq.thanhCong)` in ra gì?',
      choices: ['false', 'true', 'undefined', 'Ném lỗi (throw), chương trình dừng'],
      answerIndex: 0,
      explain:
        'Kết quả là `false`. `danhSachKhachHangHopLe.includes("kh-05")` trả về `false` vì "kh-05" không nằm trong mảng, nên điều kiện `!...includes(...)` đúng — hàm trả ngay đối tượng `{ thanhCong: false, loi: ... }` mà KHÔNG chạm tới nhánh tạo đơn hàng. Hàm không `throw` — nó trả về một giá trị mô tả thất bại để nơi gọi tự quyết định xử lý tiếp (giống cách nhiều API thiết kế lỗi nghiệp vụ dự đoán được, khác với lỗi hệ thống bất ngờ mới nên `throw`).',
    },
    parsons: {
      prompt: 'Xếp lại hàm themDonHang — kiểm khoá tham chiếu TRƯỚC khi tạo bản ghi.',
      lines: [
        'function themDonHang(khachHangId, danhSachKhachHangHopLe, duLieuDon) {',
        '  if (!danhSachKhachHangHopLe.includes(khachHangId)) {',
        '    return { thanhCong: false, loi: "Khong tim thay khach hang" }',
        '  }',
        '  return { thanhCong: true, donHang: { khachHangId, ...duLieuDon } }',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm themNhieuDonHang(danhSachYeuCau, danhSachKhachHangHopLe) xử lý một loạt yêu cầu tạo đơn hàng.\n\n- Dùng lại đúng luật của themDonHang(khachHangId, danhSachKhachHangHopLe, duLieuDon) ở ví dụ mẫu (viết lại cả hàm).\n- danhSachYeuCau là mảng các đối tượng { khachHangId: string, duLieuDon: DuLieuDon }.\n- Với mỗi phần tử, gọi themDonHang rồi đẩy CHỈ RIÊNG trường thanhCong (boolean) vào mảng trả về, giữ đúng thứ tự.',
      starterCode: `type DuLieuDon = { sanPham: string; soLuong: number }
type KetQuaThemDon =
  | { thanhCong: true; donHang: { khachHangId: string; sanPham: string; soLuong: number } }
  | { thanhCong: false; loi: string }

function themDonHang(
  khachHangId: string,
  danhSachKhachHangHopLe: string[],
  duLieuDon: DuLieuDon
): KetQuaThemDon {
  // TODO: neu khachHangId khong nam trong danhSachKhachHangHopLe, tra { thanhCong: false, loi: ... }
  // nguoc lai tra { thanhCong: true, donHang: { khachHangId, ...duLieuDon } }
  return { thanhCong: false, loi: "chua cai dat" }
}

function themNhieuDonHang(
  danhSachYeuCau: { khachHangId: string; duLieuDon: DuLieuDon }[],
  danhSachKhachHangHopLe: string[]
): boolean[] {
  // TODO: voi moi yeu cau, goi themDonHang va gom truong thanhCong theo dung thu tu
  return []
}

// ---- Đừng sửa phần dưới đây ----
const KHACH_HANG_HOP_LE = ["kh-01", "kh-02", "kh-03"]
const YEU_CAU = [
  { khachHangId: "kh-01", duLieuDon: { sanPham: "But", soLuong: 5 } },
  { khachHangId: "kh-99", duLieuDon: { sanPham: "Vo", soLuong: 3 } },
  { khachHangId: "kh-03", duLieuDon: { sanPham: "Ban phim", soLuong: 1 } },
  { khachHangId: "kh-88", duLieuDon: { sanPham: "Chuot", soLuong: 1 } },
]
console.log(JSON.stringify(themNhieuDonHang(YEU_CAU, KHACH_HANG_HOP_LE)))`,
      testCases: [
        {
          stdinLines: [],
          expected: '[true,false,true,false]',
          match: 'contains',
          hidden: false,
          label: 'kh-01 và kh-03 hợp lệ → true; kh-99 và kh-88 không tồn tại → false, đúng thứ tự',
        },
        {
          stdinLines: [],
          expected: 'false',
          match: 'contains',
          hidden: false,
          label: 'Có ít nhất một kết quả false trong mảng (khách hàng ma bị chặn)',
        },
        {
          stdinLines: [],
          expected: '[true,false,true,false]',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: kiểm cả mảng đầy đủ khớp thứ tự — không hardcode một phần tử riêng lẻ',
        },
      ],
      hints: [
        'themDonHang: dùng danhSachKhachHangHopLe.includes(khachHangId) — nếu KHÔNG có (`!includes(...)`) thì return thất bại NGAY, đừng chạy tiếp xuống dưới.',
        'Chỉ khi qua được kiểm tra ở trên (không return sớm) mới tới dòng return { thanhCong: true, donHang: {...} }.',
        'themNhieuDonHang: dùng vòng lặp, mỗi phần tử gọi themDonHang(yc.khachHangId, danhSachKhachHangHopLe, yc.duLieuDon), push kq.thanhCong (không push cả object kq).',
      ],
      sampleSolution: `type DuLieuDon = { sanPham: string; soLuong: number }
type KetQuaThemDon =
  | { thanhCong: true; donHang: { khachHangId: string; sanPham: string; soLuong: number } }
  | { thanhCong: false; loi: string }

function themDonHang(
  khachHangId: string,
  danhSachKhachHangHopLe: string[],
  duLieuDon: DuLieuDon
): KetQuaThemDon {
  if (!danhSachKhachHangHopLe.includes(khachHangId)) {
    return { thanhCong: false, loi: \`Khong tim thay khach hang "\${khachHangId}" — tu choi tao don hang\` }
  }
  return { thanhCong: true, donHang: { khachHangId, ...duLieuDon } }
}

function themNhieuDonHang(
  danhSachYeuCau: { khachHangId: string; duLieuDon: DuLieuDon }[],
  danhSachKhachHangHopLe: string[]
): boolean[] {
  const ketQua: boolean[] = []
  for (const yc of danhSachYeuCau) {
    const kq = themDonHang(yc.khachHangId, danhSachKhachHangHopLe, yc.duLieuDon)
    ketQua.push(kq.thanhCong)
  }
  return ketQua
}

// ---- Đừng sửa phần dưới đây ----
const KHACH_HANG_HOP_LE = ["kh-01", "kh-02", "kh-03"]
const YEU_CAU = [
  { khachHangId: "kh-01", duLieuDon: { sanPham: "But", soLuong: 5 } },
  { khachHangId: "kh-99", duLieuDon: { sanPham: "Vo", soLuong: 3 } },
  { khachHangId: "kh-03", duLieuDon: { sanPham: "Ban phim", soLuong: 1 } },
  { khachHangId: "kh-88", duLieuDon: { sanPham: "Chuot", soLuong: 1 } },
]
console.log(JSON.stringify(themNhieuDonHang(YEU_CAU, KHACH_HANG_HOP_LE)))`,
    },
    homework:
      'Mở một dự án có dùng ORM (Prisma, TypeORM, Sequelize — hoặc chính `postgres/schema.sql` của dự án DHCB này). Tìm MỘT bảng có cột kiểu "..._id" tham chiếu sang bảng khác (ví dụ `learning_progress.user_id`). Kiểm xem ràng buộc FOREIGN KEY có được khai báo thật trong schema không (từ khoá REFERENCES). Nếu có, thử tưởng tượng: bỏ ràng buộc đó đi, ứng dụng có chỗ nào tự kiểm tra thay không, hay sẽ tạo được bản ghi mồ côi?',
    srsCards: [
      {
        hoi: 'Toàn vẹn tham chiếu (referential integrity) là quy tắc gì?',
        dap: 'Một bản ghi KHÔNG được trỏ tới (tham chiếu) một bản ghi khác KHÔNG TỒN TẠI — ví dụ một đơn hàng không được gắn với một `khachHangId` không có thật trong bảng khách hàng.',
      },
      {
        hoi: 'Vì sao ràng buộc FOREIGN KEY của CSDL đôi khi KHÔNG đủ để bảo vệ toàn vẹn tham chiếu?',
        dap: 'Vì nó chỉ hoạt động khi thật sự được khai báo và bật (một số ORM tắt nó để "tiện"), và không thể ràng buộc chéo khi hai bảng liên quan nằm ở HAI CSDL khác nhau — như trong kiến trúc microservice, mỗi service có CSDL riêng.',
      },
      {
        hoi: 'Khi FOREIGN KEY không có sẵn (microservice khác CSDL), ứng dụng phải làm gì thay?',
        dap: 'Tự kiểm tra khoá tham chiếu có tồn tại TRƯỚC khi ghi bản ghi mới (ví dụ gọi API/tra cứu sang service khác để xác nhận `khachHangId` có thật), tức tự làm lại việc mà FOREIGN KEY vốn làm tự động.',
      },
    ],
  },
  {
    id: 'p6-u112-l2',
    unitId: 'p6-u112',
    language: 'typescript',
    title: 'Xác thực & phiên — so mật khẩu đã băm, chọn session-cookie hay JWT',
    hook: 'Hai lỗi kinh điển của tính năng đăng nhập: (1) so sánh mật khẩu người dùng nhập với mật khẩu LƯU THÔ bằng `===` — một cú rò rỉ CSDL là lộ mật khẩu THẬT của mọi người dùng; (2) chọn JWT cho MỌI trường hợp vì "hiện đại", rồi phát hiện không có cách nào ĐĂNG XUẤT NGAY một token đã phát ra — nó vẫn có hiệu lực tới khi hết hạn dù bạn xoá nó khỏi trình duyệt.',
    theory:
      'PHẦN 1 — SO SÁNH MẬT KHẨU ĐÃ BĂM. Không bao giờ lưu mật khẩu người dùng dạng chữ thô (plaintext), và KHÔNG BAO GIỜ so sánh mật khẩu bằng `===` với dữ liệu thô lưu trong CSDL — một cú rò rỉ dữ liệu là lộ mật khẩu THẬT của mọi tài khoản, và vì nhiều người dùng lại mật khẩu đó ở nơi khác, thiệt hại lan ra ngoài chính hệ thống. Cách đúng: khi đăng ký, băm (hash) mật khẩu bằng một hàm MỘT CHIỀU (không đảo ngược được) rồi chỉ lưu kết quả băm; khi đăng nhập, băm lại mật khẩu VỪA NHẬP và so sánh hai giá trị BĂM với nhau — không bao giờ so plaintext với plaintext, cũng không giải mã ngược hash đã lưu.\n\nBài này dùng MỘT HÀM BĂM GIẢ đơn giản, tất định (cùng đầu vào luôn ra cùng đầu ra) chỉ để dạy đúng LUỒNG so sánh — TUYỆT ĐỐI KHÔNG dùng trong sản phẩm thật. Sản xuất thật PHẢI dùng thư viện hash chuyên dụng như argon2 hoặc bcrypt (dự án DHCB này cũng vậy) — chúng thêm "salt" ngẫu nhiên mỗi lần băm và cố tình làm CHẬM để chống dò brute-force, điều mà hàm giả dưới đây hoàn toàn không có.\n\nPHẦN 2 — CHỌN CƠ CHẾ PHIÊN. Hai cách chuẩn để "nhớ" một người đã đăng nhập:\n\n- SESSION-COOKIE: server tạo một session, LƯU TRẠNG THÁI (ai, khi nào) ở phía server (CSDL/Redis), chỉ gửi cho client một ID ngẫu nhiên qua cookie. Muốn thu hồi (đăng xuất, khoá tài khoản) → server XOÁ session đó, có hiệu lực NGAY LẬP TỨC vì lần request sau server tra lại thấy session đã mất.\n- JWT (JSON Web Token): server KÝ một token TỰ CHỨA đầy đủ thông tin (ai, quyền gì, hết hạn khi nào), không cần lưu gì ở server — bất kỳ server nào có cùng khoá ký đều XÁC MINH được token mà không cần tra cứu, rất hợp khi có NHIỀU SERVER không chia sẻ được state chung. Đánh đổi: một khi đã phát hành, token vẫn CÓ HIỆU LỰC tới khi hết hạn — không có cách "xoá" nó ở giữa chừng như session, trừ khi xây thêm một danh sách đen (mà làm vậy là quay lại phải tra cứu trạng thái ở server, mất bớt lợi thế của JWT).\n\nLuật chọn, theo THỨ TỰ ƯU TIÊN: cần thu hồi ngay (đăng xuất tức thì, khoá tài khoản khẩn cấp) → LUÔN chọn session-cookie, bất kể có cần phân tán hay không — an toàn thắng tiện lợi. Chỉ khi KHÔNG cần thu hồi ngay VÀ cần phân tán nhiều server không chia sẻ state → chọn JWT. Còn lại (không cần thu hồi ngay, không cần phân tán) → mặc định session-cookie, vì nó vẫn an toàn hơn và không có lý do gì phải đánh đổi lấy JWT.',
    workedExample: {
      code: `// MO PHONG bam mat khau — KHONG dung trong san xuat, chi de day khai niem.
function bamMatKhauGia(matKhau: string): number {
  let tong = 0
  for (const kyTu of matKhau) {
    tong += kyTu.charCodeAt(0)
  }
  return tong % 9973
}

function soSanhMatKhau(matKhauNhap: string, hashDaLuu: number): boolean {
  return bamMatKhauGia(matKhauNhap) === hashDaLuu
}

const hashLuuTrongDB = bamMatKhauGia("MatKhauCuaToi123")
console.log(soSanhMatKhau("MatKhauCuaToi123", hashLuuTrongDB)) // mat khau dung
console.log(soSanhMatKhau("mat-khau-sai", hashLuuTrongDB))     // mat khau sai

function chonCoCheSession(canThuHoiNgay: boolean, canPhanTanNhieuServer: boolean): "session-cookie" | "jwt" {
  if (canThuHoiNgay) return "session-cookie"
  if (canPhanTanNhieuServer) return "jwt"
  return "session-cookie"
}

console.log(chonCoCheSession(true, true))   // can thu hoi ngay -> session-cookie (thang truoc)
console.log(chonCoCheSession(false, true))  // chi can phan tan -> jwt
console.log(chonCoCheSession(false, false)) // khong can gi dac biet -> mac dinh session-cookie`,
      stdinLines: [],
    },
    predict: {
      code: `function chonCoCheSession(canThuHoiNgay: boolean, canPhanTanNhieuServer: boolean): "session-cookie" | "jwt" {
  if (canThuHoiNgay) return "session-cookie"
  if (canPhanTanNhieuServer) return "jwt"
  return "session-cookie"
}

console.log(chonCoCheSession(true, true))`,
      question: 'Cả `canThuHoiNgay` và `canPhanTanNhieuServer` đều `true`. Hàm trả về gì?',
      choices: ['session-cookie', 'jwt', 'undefined', 'Cả hai (mảng)'],
      answerIndex: 0,
      explain:
        'Kết quả là `"session-cookie"`. Điều kiện kiểm `canThuHoiNgay` đứng TRƯỚC điều kiện kiểm `canPhanTanNhieuServer`, nên khi cả hai đều đúng, nhánh `if (canThuHoiNgay) return "session-cookie"` chạy TRƯỚC và hàm return NGAY — không bao giờ chạm tới dòng xét `canPhanTanNhieuServer` nữa. Đây đúng ý đồ thiết kế: khả năng thu hồi ngay là yêu cầu AN TOÀN, phải thắng trước lợi ích tiện lợi của việc phân tán.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm chọn cơ chế phiên — khả năng thu hồi ngay phải được kiểm TRƯỚC nhu cầu phân tán.',
      lines: [
        'function chonCoCheSession(canThuHoiNgay, canPhanTanNhieuServer) {',
        '  if (canThuHoiNgay) {',
        '    return "session-cookie"',
        '  }',
        '  if (canPhanTanNhieuServer) {',
        '    return "jwt"',
        '  }',
        '  return "session-cookie"',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm dangNhap(matKhauNhap, hashDaLuu, canThuHoiNgay, canPhanTanNhieuServer) mô phỏng luồng đăng nhập đầy đủ.\n\n- Dùng lại đúng ba hàm ở ví dụ mẫu (bamMatKhauGia, soSanhMatKhau, chonCoCheSession) — viết lại cả ba.\n- Nếu soSanhMatKhau(matKhauNhap, hashDaLuu) sai → trả { thanhCong: false } (KHÔNG có trường coChe).\n- Nếu đúng → trả { thanhCong: true, coChe: chonCoCheSession(canThuHoiNgay, canPhanTanNhieuServer) }.',
      starterCode: `function bamMatKhauGia(matKhau: string): number {
  // TODO: cong ma ky tu (charCodeAt(0)) cua tung ky tu trong matKhau, lay % 9973
  return 0
}

function soSanhMatKhau(matKhauNhap: string, hashDaLuu: number): boolean {
  // TODO: bam matKhauNhap roi so sanh voi hashDaLuu
  return false
}

function chonCoCheSession(canThuHoiNgay: boolean, canPhanTanNhieuServer: boolean): "session-cookie" | "jwt" {
  // TODO: canThuHoiNgay -> "session-cookie" (kiem TRUOC); roi canPhanTanNhieuServer -> "jwt";
  // con lai -> "session-cookie"
  return "session-cookie"
}

function dangNhap(
  matKhauNhap: string,
  hashDaLuu: number,
  canThuHoiNgay: boolean,
  canPhanTanNhieuServer: boolean
): { thanhCong: boolean; coChe?: "session-cookie" | "jwt" } {
  // TODO: mat khau sai -> { thanhCong: false }; dung -> { thanhCong: true, coChe: ... }
  return { thanhCong: false }
}

// ---- Đừng sửa phần dưới đây ----
const HASH_DA_LUU = bamMatKhauGia("BiMat2026!")
console.log(JSON.stringify(dangNhap("BiMat2026!", HASH_DA_LUU, false, true)))
console.log(JSON.stringify(dangNhap("sai-mat-khau", HASH_DA_LUU, false, true)))
console.log(JSON.stringify(dangNhap("BiMat2026!", HASH_DA_LUU, true, true)))
console.log(JSON.stringify(dangNhap("BiMat2026!", HASH_DA_LUU, false, false)))`,
      testCases: [
        {
          stdinLines: [],
          expected: '{"thanhCong":true,"coChe":"jwt"}',
          match: 'contains',
          hidden: false,
          label: 'Mật khẩu đúng, không cần thu hồi ngay nhưng cần phân tán → jwt',
        },
        {
          stdinLines: [],
          expected: '{"thanhCong":false}',
          match: 'contains',
          hidden: false,
          label: 'Mật khẩu sai → thanhCong:false, KHÔNG có trường coChe',
        },
        {
          stdinLines: [],
          expected:
            '{"thanhCong":true,"coChe":"session-cookie"}\n{"thanhCong":true,"coChe":"session-cookie"}',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: cần thu hồi ngay (dù cũng cần phân tán) VÀ trường hợp không cần gì đặc biệt — cả hai đều ra session-cookie',
        },
      ],
      hints: [
        'bamMatKhauGia: for...of duyệt matKhau, cộng dồn kyTu.charCodeAt(0) vào biến tong, cuối cùng return tong % 9973.',
        'soSanhMatKhau: return bamMatKhauGia(matKhauNhap) === hashDaLuu — so sánh HAI GIÁ TRỊ BĂM, không so plaintext.',
        'dangNhap: gọi soSanhMatKhau trước — sai thì return { thanhCong: false } NGAY, đúng thì return { thanhCong: true, coChe: chonCoCheSession(canThuHoiNgay, canPhanTanNhieuServer) }.',
      ],
      sampleSolution: `function bamMatKhauGia(matKhau: string): number {
  let tong = 0
  for (const kyTu of matKhau) {
    tong += kyTu.charCodeAt(0)
  }
  return tong % 9973
}

function soSanhMatKhau(matKhauNhap: string, hashDaLuu: number): boolean {
  return bamMatKhauGia(matKhauNhap) === hashDaLuu
}

function chonCoCheSession(canThuHoiNgay: boolean, canPhanTanNhieuServer: boolean): "session-cookie" | "jwt" {
  if (canThuHoiNgay) return "session-cookie"
  if (canPhanTanNhieuServer) return "jwt"
  return "session-cookie"
}

function dangNhap(
  matKhauNhap: string,
  hashDaLuu: number,
  canThuHoiNgay: boolean,
  canPhanTanNhieuServer: boolean
): { thanhCong: boolean; coChe?: "session-cookie" | "jwt" } {
  if (!soSanhMatKhau(matKhauNhap, hashDaLuu)) {
    return { thanhCong: false }
  }
  return { thanhCong: true, coChe: chonCoCheSession(canThuHoiNgay, canPhanTanNhieuServer) }
}

// ---- Đừng sửa phần dưới đây ----
const HASH_DA_LUU = bamMatKhauGia("BiMat2026!")
console.log(JSON.stringify(dangNhap("BiMat2026!", HASH_DA_LUU, false, true)))
console.log(JSON.stringify(dangNhap("sai-mat-khau", HASH_DA_LUU, false, true)))
console.log(JSON.stringify(dangNhap("BiMat2026!", HASH_DA_LUU, true, true)))
console.log(JSON.stringify(dangNhap("BiMat2026!", HASH_DA_LUU, false, false)))`,
    },
    homework:
      'Đọc `packages/core-auth/auth.ts` và `packages/core-auth/authService.ts` của chính dự án DHCB này. Tìm xem mật khẩu được băm bằng thư viện nào thật (không phải hàm giả như bài học), và cơ chế phiên đang dùng là session-cookie hay JWT (Bearer token) — đối chiếu với luật ưu tiên vừa học, đoán vì sao dự án chọn cơ chế đó (gợi ý: dự án chạy nhiều instance PM2 cluster — đọc mục 6 và mục 13 CLAUDE.md phần cluster mode).',
    srsCards: [
      {
        hoi: 'Vì sao không bao giờ được so sánh mật khẩu người dùng nhập với dữ liệu LƯU THÔ (plaintext) bằng `===`?',
        dap: 'Vì lưu mật khẩu thô nghĩa là một cú rò rỉ CSDL sẽ lộ NGUYÊN VĂN mật khẩu của mọi người dùng — và vì nhiều người lại dùng chung mật khẩu ở nơi khác, thiệt hại lan ra ngoài hệ thống. Đúng cách: băm mật khẩu bằng hàm một chiều, chỉ so sánh hai giá trị BĂM với nhau.',
      },
      {
        hoi: 'Khi nào chọn session-cookie thay vì JWT, kể cả khi cần phân tán nhiều server?',
        dap: 'Khi cần khả năng THU HỒI NGAY (đăng xuất tức thì, khoá tài khoản khẩn cấp) — session-cookie cho server xoá session và có hiệu lực ngay lập tức, trong khi một JWT đã phát ra vẫn có hiệu lực tới khi hết hạn, không "xoá" giữa chừng được. Điều kiện thu hồi ngay LUÔN thắng trước nhu cầu phân tán.',
      },
      {
        hoi: 'JWT phù hợp nhất với tình huống nào?',
        dap: 'Khi KHÔNG cần thu hồi ngay VÀ cần phân tán nhiều server không chia sẻ được state chung — JWT tự chứa đầy đủ thông tin, bất kỳ server nào có cùng khoá ký đều xác minh được mà không cần tra cứu tập trung.',
      },
    ],
  },
]
