// lessons/p6u113.ts — P6-U113: HƯỚNG WEB, chặng S2 — vận hành ứng dụng chạy thật
// (gộp module `web-s2-m4` "Tải dữ liệu ở client" + `web-s2-m5` "Deploy và môi trường").
//
// Hai bài: l1 RACE CONDITION khi gõ tìm kiếm (phản hồi cũ có thể về SAU phản hồi mới — phải
// so số thứ tự, không tin thứ tự VỀ); l2 KIỂM TRA TRƯỚC KHI DEPLOY (biến môi trường bắt buộc
// phải đủ NGAY LÚC KHỞI ĐỘNG, và migration phải là dãy số thứ tự liên tục không gap).
//
// Mọi giá trị trong theory/predict/testCases đã chạy thật qua tsc --strict + node trước khi
// soạn, không suy đoán.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U113_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u113-l1',
    unitId: 'p6-u113',
    language: 'typescript',
    title: 'Race condition khi gõ tìm kiếm — phản hồi VỀ SAU không có nghĩa là MỚI HƠN',
    hook: 'Người dùng gõ ô tìm kiếm: "a", rồi "ab", rồi "abc" — mỗi lần gõ bắn một request. Request của "a" chỉ có vài kết quả nên server trả nhanh; request của "abc" phải lọc kỹ nên trả CHẬM hơn. Nếu bạn cứ thấy phản hồi VỀ là vẽ lên màn hình, kết quả của "a" (về sau) sẽ ĐÈ LÊN kết quả của "abc" — người dùng đang nhìn ô gõ "abc" nhưng màn hình hiện kết quả tìm "a".',
    theory:
      'RACE CONDITION (điều kiện tranh chấp) ở đây không phải giữa hai luồng CPU — mà giữa THỨ TỰ GỬI ĐI và THỨ TỰ VỀ của các request mạng. Mạng không đảm bảo request gửi sau thì về sau: mỗi request có thời gian xử lý khác nhau (tải nhiều/ít dữ liệu, server bận), nên request cũ hoàn toàn có thể VỀ SAU request mới.\n\nMẹo sai phổ biến: "cứ thấy response thì cập nhật màn hình". Với ô tìm kiếm gõ liên tục, mẹo này gây đúng lỗi ở phần hook — kết quả HIỂN THỊ trên màn hình không khớp với NỘI DUNG người dùng đang gõ.\n\nCách sửa đúng: đánh SỐ THỨ TỰ cho mỗi request lúc GỬI ĐI (tăng dần đều, không phụ thuộc lúc nào response về), và server/client giữ một biến "số thứ tự MỚI NHẤT đã gửi". Khi một response về, so số thứ tự CỦA CHÍNH REQUEST ĐÓ với số thứ tự mới nhất đã gửi:\n\n- Nếu số thứ tự của request này >= số mới nhất đã gửi tính tới lúc request đó được gửi → đây là phản hồi của yêu cầu MỚI NHẤT (hoặc chưa có yêu cầu nào mới hơn đè lên) → CẬP NHẬT màn hình.\n- Nếu nhỏ hơn → đã có một yêu cầu MỚI HƠN gửi đi rồi, response này chắc chắn LỖI THỜI dù nó về sau hay trước → BỎ QUA, không vẽ lên màn hình.\n\nCó hai cách triển khai chuẩn ngành: `AbortController` (huỷ hẳn request cũ, tiết kiệm băng thông) hoặc so số thứ tự như trên (đơn giản hơn, không huỷ được request đang bay nhưng vẫn chặn được kết quả cũ đè lên). Bài này tập trung vào cách so số thứ tự — vì nó là NỀN TẢNG mà `AbortController` cũng dựa vào để quyết định request nào còn "đáng tin".',
    workedExample: {
      code: `function xuLyPhanHoi(
  soThuTuYeuCau: number,
  soThuTuMoiNhatDaXuLy: number,
  ketQua: string
): { capNhat: boolean; ketQua?: string } {
  if (soThuTuYeuCau >= soThuTuMoiNhatDaXuLy) {
    return { capNhat: true, ketQua }
  }
  return { capNhat: false }
}

// Mo phong: goi "a" (so 1), roi "ab" (so 2), roi "abc" (so 3).
// Nhung "a" xu ly cham nhat -> phan hoi cua no VE SAU CUNG.
// Thu tu VE: abc (so 3) -> ab (so 2) -> a (so 1)
let moiNhat = 3 // da gui toi request so 3 ("abc") la moi nhat

console.log(JSON.stringify(xuLyPhanHoi(3, moiNhat, "ket qua cua abc"))) // ve dau, dung la moi nhat
console.log(JSON.stringify(xuLyPhanHoi(2, moiNhat, "ket qua cua ab")))  // ve sau, nhung CU hon so 3
console.log(JSON.stringify(xuLyPhanHoi(1, moiNhat, "ket qua cua a")))   // ve cuoi cung, cu nhat`,
      stdinLines: [],
    },
    predict: {
      code: `function xuLyPhanHoi(
  soThuTuYeuCau: number,
  soThuTuMoiNhatDaXuLy: number,
  ketQua: string
): { capNhat: boolean; ketQua?: string } {
  if (soThuTuYeuCau >= soThuTuMoiNhatDaXuLy) {
    return { capNhat: true, ketQua }
  }
  return { capNhat: false }
}

let moiNhat = 5
console.log(JSON.stringify(xuLyPhanHoi(3, moiNhat, "cu")))`,
      question:
        'Đã gửi tới request số 5 (moiNhat = 5). Phản hồi VỀ mang số thứ tự 3 (của một request cũ hơn). Hàm trả về gì?',
      choices: [
        '{"capNhat":false}',
        '{"capNhat":true,"ketQua":"cu"}',
        '{"capNhat":true}',
        'undefined',
      ],
      answerIndex: 0,
      explain:
        'Kết quả là {"capNhat":false}. Điều kiện `soThuTuYeuCau >= soThuTuMoiNhatDaXuLy` là 3 >= 5, sai — nghĩa là đã có một yêu cầu MỚI HƠN (số 4 hoặc 5) gửi đi rồi. Dù response số 3 này về đúng lúc hay về muộn, nó vẫn là kết quả LỖI THỜI so với yêu cầu mới nhất, nên hàm trả capNhat: false để màn hình KHÔNG bị đè bởi dữ liệu cũ.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm xử lý phản hồi chống race condition — chỉ cập nhật khi phản hồi này KHÔNG cũ hơn yêu cầu mới nhất.',
      lines: [
        'function xuLyPhanHoi(soThuTuYeuCau: number, soThuTuMoiNhatDaXuLy: number, ketQua: string) {',
        '  if (soThuTuYeuCau >= soThuTuMoiNhatDaXuLy) {',
        '    return { capNhat: true, ketQua }',
        '  }',
        '  return { capNhat: false }',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hai hàm mô phỏng chống race condition khi gõ tìm kiếm.\n\n- taoBoDemYeuCau(): trả về một hàm KHÔNG tham số, mỗi lần gọi tăng một biến đếm nội bộ lên 1 rồi trả về giá trị MỚI (dùng closure — số thứ tự yêu cầu tiếp theo khi gửi đi).\n- xuLyPhanHoi(soThuTuYeuCau, soThuTuMoiNhatDaXuLy, ketQua): y như ví dụ mẫu — chỉ trả { capNhat: true, ketQua } nếu soThuTuYeuCau >= soThuTuMoiNhatDaXuLy, ngược lại trả { capNhat: false }.',
      starterCode: `function taoBoDemYeuCau(): () => number {
  // TODO: bien dem noi bo bat dau tu 0, moi lan goi ham tra ve tang len 1 roi tra ve
  return () => 0
}

function xuLyPhanHoi(soThuTuYeuCau: number, soThuTuMoiNhatDaXuLy: number, ketQua: string): { capNhat: boolean; ketQua?: string } {
  // TODO: neu soThuTuYeuCau >= soThuTuMoiNhatDaXuLy thi { capNhat: true, ketQua }, nguoc lai { capNhat: false }
  return { capNhat: false }
}

// ---- Đừng sửa phần dưới đây ----
const layStt = taoBoDemYeuCau()
console.log(layStt(), layStt(), layStt())

const moiNhat = 3
console.log(JSON.stringify(xuLyPhanHoi(3, moiNhat, "abc")))
console.log(JSON.stringify(xuLyPhanHoi(2, moiNhat, "ab")))
console.log(JSON.stringify(xuLyPhanHoi(1, moiNhat, "a")))`,
      testCases: [
        {
          stdinLines: [],
          expected: '1 2 3',
          match: 'contains',
          hidden: false,
          label: 'taoBoDemYeuCau: ba lần gọi liên tiếp trả về 1, 2, 3 (đếm dần từ 0)',
        },
        {
          stdinLines: [],
          expected: '{"capNhat":true,"ketQua":"abc"}',
          match: 'contains',
          hidden: false,
          label: 'Phản hồi của request mới nhất (số 3, bằng moiNhat) luôn được cập nhật',
        },
        {
          stdinLines: [],
          expected: '{"capNhat":false}',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: phản hồi của request số 2 và số 1 (nhỏ hơn moiNhat=3) đều bị bỏ qua',
        },
      ],
      hints: [
        'taoBoDemYeuCau dùng closure: let dem = 0 khai báo BÊN NGOÀI hàm trả về, hàm trả về làm dem++ rồi return dem.',
        'xuLyPhanHoi chỉ có đúng MỘT điều kiện if — giống hệt ví dụ mẫu, không cần thêm nhánh nào khác.',
        'Nhớ trả về object có ketQua khi capNhat true, và object KHÔNG có trường ketQua khi capNhat false (giống ví dụ mẫu).',
      ],
      sampleSolution: `function taoBoDemYeuCau(): () => number {
  let dem = 0
  return () => {
    dem++
    return dem
  }
}

function xuLyPhanHoi(soThuTuYeuCau: number, soThuTuMoiNhatDaXuLy: number, ketQua: string): { capNhat: boolean; ketQua?: string } {
  if (soThuTuYeuCau >= soThuTuMoiNhatDaXuLy) {
    return { capNhat: true, ketQua }
  }
  return { capNhat: false }
}

// ---- Đừng sửa phần dưới đây ----
const layStt = taoBoDemYeuCau()
console.log(layStt(), layStt(), layStt())

const moiNhat = 3
console.log(JSON.stringify(xuLyPhanHoi(3, moiNhat, "abc")))
console.log(JSON.stringify(xuLyPhanHoi(2, moiNhat, "ab")))
console.log(JSON.stringify(xuLyPhanHoi(1, moiNhat, "a")))`,
    },
    homework:
      'Mở một ô tìm kiếm thật hay dùng (Google, Shopee, YouTube) — gõ thật nhanh một từ dài rồi XOÁ NGAY chỉ còn 1-2 ký tự, quan sát xem kết quả có bị "nhảy lung tung" (hiện kết quả của từ dài trong khi ô gõ chỉ còn ngắn) hay không trong một khoảnh khắc. Nếu không thấy lỗi, đoán xem họ dùng cơ chế nào (AbortController hay so số thứ tự) để tránh.',
    srsCards: [
      {
        hoi: 'Vì sao "cứ thấy response về là cập nhật màn hình" gây lỗi với ô tìm kiếm gõ liên tục?',
        dap: 'Mạng không đảm bảo request gửi SAU thì về SAU — request cũ (ít dữ liệu, xử lý nhanh) có thể về sau request mới (nhiều dữ liệu, xử lý chậm). Cập nhật vô điều kiện khiến kết quả CŨ đè lên kết quả MỚI trên màn hình.',
      },
      {
        hoi: 'Điều kiện đúng để một phản hồi được phép cập nhật màn hình là gì?',
        dap: 'soThuTuYeuCau của phản hồi đó >= soThuTuMoiNhatDaXuLy (số thứ tự của yêu cầu mới nhất đã gửi) — tức không có yêu cầu nào MỚI HƠN đã gửi đi. Nhỏ hơn thì bỏ qua dù về trước hay về sau.',
      },
      {
        hoi: 'AbortController và so số thứ tự khác nhau ở điểm nào, giống nhau ở điểm nào?',
        dap: 'Giống: cả hai đều dựa trên ý tưởng chỉ tin kết quả của yêu cầu MỚI NHẤT. Khác: AbortController HUỶ HẲN request cũ (tiết kiệm băng thông, server có thể dừng xử lý sớm), còn so số thứ tự vẫn để request cũ chạy xong nhưng chặn kết quả của nó ở phía client.',
      },
    ],
  },
  {
    id: 'p6-u113-l2',
    unitId: 'p6-u113',
    language: 'typescript',
    title: 'Kiểm tra trước khi deploy — biến môi trường và thứ tự migration',
    hook: 'Bạn deploy server lên VPS, mọi thứ khởi động "bình thường", không lỗi gì. Ba tiếng sau, người dùng đầu tiên đăng ký tài khoản — server CRASH vì thiếu biến DATABASE_URL, hoá ra chỉ khi có request thật gọi tới CSDL thì lỗi mới lộ ra. Nếu server kiểm tra biến môi trường ngay lúc khởi động, nó đã crash NGAY LẬP TỨC lúc deploy — dễ phát hiện hơn nhiều so với crash âm thầm giữa đêm khi có người dùng thật.',
    theory:
      'Vận hành một ứng dụng chạy thật (deploy) khác hẳn chạy trên máy mình — không còn ai ngồi cạnh để đọc log ngay khi có lỗi. Hai lớp kiểm tra PHÒNG NGỪA cần làm trước khi một bản deploy được coi là an toàn:\n\nKIỂM TRA BIẾN MÔI TRƯỜNG LÚC KHỞI ĐỘNG: server cần các biến bí mật (DATABASE_URL, API key, JWT secret...) lấy từ môi trường, KHÔNG hardcode trong code (nguyên tắc "không bí mật trong code"). Nếu thiếu một biến quan trọng, cách XẤU là để server chạy bình thường rồi CRASH SAU, ngay lúc có request đầu tiên chạm tới đoạn code cần biến đó — lỗi xuất hiện trễ, khó truy vết, và người dùng thật là người phát hiện ra trước. Cách ĐÚNG là kiểm tra NGAY LÚC KHỞI ĐỘNG: liệt kê các biến bắt buộc, nếu thiếu bất kỳ biến nào thì server CRASH NGAY, in rõ tên biến thiếu, KHÔNG cho phép chạy thiếu.\n\nKIỂM TRA THỨ TỰ MIGRATION: mỗi thay đổi schema CSDL là một file migration đánh số thứ tự (0001, 0002...) — chạy migration THEO ĐÚNG THỨ TỰ SỐ là điều kiện để CSDL luôn ở trạng thái nhất quán, dù deploy trên máy nào hay CSDL trống hoàn toàn. Hai lỗi hay gặp: SỐ BỊ LẶP (hai người cùng đặt tên 0005 do làm việc song song, merge nhầm) và SỐ BỊ BỎ QUA/GAP (xoá nhầm một file migration đã áp dụng ở production, hoặc đặt số nhảy cóc). Cả hai đều phải được PHÁT HIỆN TRƯỚC KHI CHẠY, không phải để CSDL thật báo lỗi giữa chừng — vì migration lỗi giữa chừng có thể để CSDL ở trạng thái NỬA VỜI, khó rollback.\n\nĐiểm chung của cả hai lớp kiểm tra: chuyển một lỗi vốn sẽ xảy ra TRỄ và KHÓ TRUY VẾT (giữa đêm, người dùng thật gặp phải) thành một lỗi xảy ra SỚM và RÕ RÀNG (ngay lúc deploy, đọc log là biết ngay nguyên nhân).',
    workedExample: {
      code: `function kiemTraBienMoiTruong(danhSachBatBuoc: string[], bienHienCo: Record<string, string | undefined>): string[] {
  return danhSachBatBuoc.filter((ten) => !bienHienCo[ten])
}

const BIEN_BAT_BUOC = ["DATABASE_URL", "JWT_SECRET", "GROQ_API_KEY"]
const moiTruongThieu: Record<string, string | undefined> = { DATABASE_URL: "postgres://...", JWT_SECRET: "" }
console.log(JSON.stringify(kiemTraBienMoiTruong(BIEN_BAT_BUOC, moiTruongThieu)))
// JWT_SECRET rong (coi nhu thieu), GROQ_API_KEY khong co key -> ca hai deu thieu

const moiTruongDu: Record<string, string | undefined> = { DATABASE_URL: "postgres://...", JWT_SECRET: "bimat", GROQ_API_KEY: "gsk_..." }
console.log(JSON.stringify(kiemTraBienMoiTruong(BIEN_BAT_BUOC, moiTruongDu))) // rong -> du bien

function kiemTraThuTuMigration(danhSachTen: string[]): boolean {
  const soThuTu = danhSachTen.map((ten) => parseInt(ten.slice(0, 4), 10)).sort((a, b) => a - b)
  for (let i = 0; i < soThuTu.length; i++) {
    if (soThuTu[i] !== i + 1) return false
  }
  return true
}

console.log(kiemTraThuTuMigration(["0001_init", "0003_add_col", "0002_add_index"])) // dung sau khi sap xep
console.log(kiemTraThuTuMigration(["0001_init", "0003_add_col"])) // thieu 0002 -> gap`,
      stdinLines: [],
    },
    predict: {
      code: `function kiemTraThuTuMigration(danhSachTen: string[]): boolean {
  const soThuTu = danhSachTen.map((ten) => parseInt(ten.slice(0, 4), 10)).sort((a, b) => a - b)
  for (let i = 0; i < soThuTu.length; i++) {
    if (soThuTu[i] !== i + 1) return false
  }
  return true
}

console.log(kiemTraThuTuMigration(["0001_a", "0002_b", "0002_c"]))`,
      question: 'Danh sách có 0001, 0002, 0002 (số 0002 bị LẶP, không có 0003). Hàm trả về gì?',
      choices: ['false', 'true', 'undefined', '0'],
      answerIndex: 0,
      explain:
        'Kết quả là false. Sau khi sort, mảng số thứ tự là [1, 2, 2]. Ở vị trí i=2 (phần tử thứ 3), giá trị mong đợi phải là i+1=3, nhưng thực tế là 2 — không khớp nên hàm return false ngay. Số bị LẶP luôn kéo theo một số khác bị THIẾU (ở đây thiếu 0003), nên vòng lặp so `soThuTu[i] !== i + 1` bắt được cả hai loại lỗi bằng cùng một điều kiện.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm kiểm tra thứ tự migration — phải SẮP XẾP theo số trước, rồi mới kiểm liên tục từ 1.',
      lines: [
        'function kiemTraThuTuMigration(danhSachTen: string[]): boolean {',
        '  const soThuTu = danhSachTen.map((ten) => parseInt(ten.slice(0, 4), 10)).sort((a, b) => a - b)',
        '  for (let i = 0; i < soThuTu.length; i++) {',
        '    if (soThuTu[i] !== i + 1) return false',
        '  }',
        '  return true',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hai hàm.\n\n- kiemTraBienMoiTruong(danhSachBatBuoc, bienHienCo): trả về mảng TÊN các biến CÒN THIẾU trong danhSachBatBuoc (rỗng nếu đủ hết). Một biến coi là thiếu nếu bienHienCo[ten] là undefined HOẶC chuỗi rỗng "".\n- kiemTraThuTuMigration(danhSachTen): nhận mảng tên file migration (4 chữ số đầu là số thứ tự, ví dụ "0003_add_col"), trả về true nếu số thứ tự (SAU KHI SẮP XẾP TĂNG DẦN) là dãy liên tục 1,2,3... không lặp không thiếu; false nếu ngược lại. Mảng đầu vào có thể KHÔNG theo đúng thứ tự số.',
      starterCode: `function kiemTraBienMoiTruong(danhSachBatBuoc: string[], bienHienCo: Record<string, string | undefined>): string[] {
  // TODO: loc ra nhung ten trong danhSachBatBuoc ma bienHienCo[ten] la undefined hoac chuoi rong
  return []
}

function kiemTraThuTuMigration(danhSachTen: string[]): boolean {
  // TODO: lay 4 ky tu dau moi ten, parseInt, SAP XEP TANG DAN, roi kiem lien tuc tu 1
  return false
}

// ---- Đừng sửa phần dưới đây ----
console.log(JSON.stringify(kiemTraBienMoiTruong(
  ["DATABASE_URL", "JWT_SECRET", "GROQ_API_KEY"],
  { DATABASE_URL: "postgres://x", JWT_SECRET: "", GROQ_API_KEY: undefined }
)))
console.log(kiemTraThuTuMigration(["0001_init", "0003_add_col", "0002_add_index"]))
console.log(kiemTraThuTuMigration(["0001_init", "0003_add_col"]))`,
      testCases: [
        {
          stdinLines: [],
          expected: '["JWT_SECRET","GROQ_API_KEY"]',
          match: 'contains',
          hidden: false,
          label:
            'DATABASE_URL có giá trị thật nên đủ; JWT_SECRET rỗng và GROQ_API_KEY undefined đều tính là thiếu',
        },
        {
          stdinLines: [],
          expected: 'true',
          match: 'contains',
          hidden: false,
          label:
            '["0001","0003","0002"] không theo thứ tự xuất hiện nhưng sau khi sort là 1,2,3 liên tục → hợp lệ',
        },
        {
          stdinLines: [],
          expected: 'false',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: ["0001","0003"] thiếu số 0002 (gap) → không hợp lệ',
        },
      ],
      hints: [
        'kiemTraBienMoiTruong: dùng danhSachBatBuoc.filter((ten) => !bienHienCo[ten]) — chuỗi rỗng "" và undefined đều là giá trị "falsy" nên !bienHienCo[ten] bắt được cả hai.',
        'kiemTraThuTuMigration: ten.slice(0, 4) lấy 4 ký tự đầu (vd "0003"), parseInt(..., 10) chuyển sang số — nhớ SẮP XẾP mảng số trước khi so, đừng so theo thứ tự xuất hiện gốc trong mảng.',
        'Sau khi có mảng số đã sắp xếp, so từng vị trí i với i+1 (0-based nên phần tử đầu phải là 1) — sai một chỗ là return false ngay, không cần đi hết mảng.',
      ],
      sampleSolution: `function kiemTraBienMoiTruong(danhSachBatBuoc: string[], bienHienCo: Record<string, string | undefined>): string[] {
  return danhSachBatBuoc.filter((ten) => !bienHienCo[ten])
}

function kiemTraThuTuMigration(danhSachTen: string[]): boolean {
  const soThuTu = danhSachTen.map((ten) => parseInt(ten.slice(0, 4), 10)).sort((a, b) => a - b)
  for (let i = 0; i < soThuTu.length; i++) {
    if (soThuTu[i] !== i + 1) return false
  }
  return true
}

// ---- Đừng sửa phần dưới đây ----
console.log(JSON.stringify(kiemTraBienMoiTruong(
  ["DATABASE_URL", "JWT_SECRET", "GROQ_API_KEY"],
  { DATABASE_URL: "postgres://x", JWT_SECRET: "", GROQ_API_KEY: undefined }
)))
console.log(kiemTraThuTuMigration(["0001_init", "0003_add_col", "0002_add_index"]))
console.log(kiemTraThuTuMigration(["0001_init", "0003_add_col"]))`,
    },
    homework:
      'Mở thư mục `postgres/migrations/` trong dự án này (`docs` nhắc tới ở mục "migration Postgres tự host" trong CLAUDE.md) — liệt kê vài tên file, kiểm bằng mắt xem số thứ tự có liên tục không. Nếu dự án bạn từng làm không có kiểm tra biến môi trường lúc khởi động, thử thêm một đoạn `kiemTraBienMoiTruong`-kiểu-này vào file khởi động server, xem log báo gì khi cố tình xoá một biến trong `.env`.',
    srsCards: [
      {
        hoi: 'Vì sao kiểm tra biến môi trường NGAY LÚC KHỞI ĐỘNG tốt hơn là để server crash sau, lúc có request thật gọi tới?',
        dap: 'Crash ngay lúc khởi động xảy ra SỚM và RÕ RÀNG — người deploy thấy log lỗi ngay, biết chính xác biến nào thiếu. Crash lúc có request thật xảy ra TRỄ, khó truy vết, và người dùng thật là người phát hiện ra lỗi trước cả người vận hành.',
      },
      {
        hoi: 'Vì sao khi kiểm tra thứ tự migration phải SẮP XẾP mảng theo số trước, không kiểm theo thứ tự xuất hiện trong mảng?',
        dap: 'Mảng tên file (đọc từ hệ thống file, hoặc do người khác liệt kê) không đảm bảo đúng thứ tự số — ví dụ 0003 có thể đứng trước 0002 trong mảng. Phải sort theo số thứ tự thật rồi mới kiểm tính liên tục, nếu không sẽ báo sai "không hợp lệ" cho một dãy thực ra vẫn đúng.',
      },
      {
        hoi: 'Số migration bị LẶP và số bị THIẾU (gap) có cần hai cách kiểm tra riêng không?',
        dap: 'Không cần — cùng một điều kiện `soThuTu[i] !== i + 1` (sau khi sort) bắt được cả hai: số lặp luôn kéo theo một số khác bị đẩy lệch vị trí gây gap, nên vòng lặp so từng vị trí với giá trị mong đợi phát hiện được cả hai loại lỗi.',
      },
    ],
  },
]
