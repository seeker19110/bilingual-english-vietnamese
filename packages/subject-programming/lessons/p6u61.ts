// lessons/p6u61.ts — P6-U61: HƯỚNG BACKEND, chặng S1 — HTTP đúng nghĩa (module `backend-s1-m1`).
//
// VÌ SAO MÃ UNIT NHẢY LÊN u61: dải `p6-u5…p6-u15` do CHƯƠNG TRÌNH M giữ chỗ, `p6-u16…p6-u21`
// là nội dung S1 của hai hướng `web` và `architecture`, và `p6-u22…p6-u60` đã bị bảng "CHỐT
// CỨNG" của đặc tả S4 chiếm trọn (3 unit × 13 hướng). Đặc tả đó KHÔNG cấp dải nào cho S1 của
// 11 hướng còn lại — thiếu sót đã ghi và vá ở
// `docs/specs/2026-08-27-dai-ma-unit-s1-cac-huong-con-lai.md`: S1 của 11 hướng còn lại dùng
// `p6-u61…p6-u93`, và dải để dành cho S2/S3 dời xuống `p6-u94` trở đi. Không mã nào đã phát
// hành bị đổi, nên không có khoá tiến độ Postgres nào bị ảnh hưởng.
//
// Hai bài, đúng thứ tự người học cần: l1 MÃ TRẠNG THÁI (thứ mọi API sai đầu tiên, và sai âm
// thầm vì client vẫn "chạy được"), l2 PHÂN TRANG CON TRỎ (thứ chỉ lộ ra khi dữ liệu đã lớn,
// tức lúc sửa đã đắt).
//
// Cả hai bài dùng làn `typescript`: hợp đồng API là chuyện KIỂU DỮ LIỆU, nên để trình biên
// dịch tham gia dạy là đúng chỗ — và cổng `lessonsTs.test.ts` chạy tsc thật nên code mẫu
// không thể trôi.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U61_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u61-l1',
    unitId: 'p6-u61',
    language: 'typescript',
    title: 'Mã trạng thái HTTP — nói đúng chuyện gì đã xảy ra',
    hook: 'API của bạn trả 200 kèm `{"ok": false, "error": "khong tim thay"}`. Client vẫn chạy. Nhưng rồi bảng giám sát báo "tỉ lệ lỗi 0%" trong khi người dùng kêu ầm lên, bộ nhớ đệm ở tầng trung gian vui vẻ lưu lại cái "lỗi" đó 5 phút, và cơ chế thử lại tự động thì không thử lại lần nào. Không ai sai một dòng code nào cả — chỉ là bạn đã nói dối hạ tầng.',
    theory:
      'Mã trạng thái KHÔNG phải trang trí. Nó là thứ DUY NHẤT mà các tầng giữa client và server đọc được: proxy, bộ nhớ đệm, cân bằng tải, công cụ giám sát, thư viện thử lại. Chúng không mở thân phản hồi ra đọc.\n\nBa nhóm phải phân biệt được ngay:\n\n· 2xx — ĐÃ LÀM XONG. 200 trả kèm dữ liệu; 201 vừa TẠO MỚI (kèm header Location trỏ tới tài nguyên vừa tạo); 204 làm xong và cố tình không có thân.\n· 4xx — NGƯỜI GỌI SAI, gửi lại y hệt thì vẫn hỏng. 400 thân yêu cầu dị dạng; 401 CHƯA biết bạn là ai; 403 biết rồi nhưng KHÔNG được phép; 404 không có tài nguyên đó; 409 xung đột trạng thái (tạo trùng, sửa bản cũ); 422 đúng khuôn nhưng sai nghiệp vụ.\n· 5xx — SERVER SAI, người gọi không làm gì khác được. 500 lỗi trong code của bạn; 502/503/504 phụ thuộc phía sau hỏng hoặc quá tải.\n\nRanh giới quan trọng nhất là giữa 4xx và 5xx, vì nó quyết định AI phải sửa. Đặt nhầm một lỗi nghiệp vụ vào 500 là kéo đội trực dậy lúc 3 giờ sáng cho một chuyện người dùng gõ sai; đặt nhầm một lỗi hệ thống vào 400 là giấu luôn sự cố thật.\n\nHai cặp hay bị dùng lẫn, đáng thuộc:\n\n① 401 vs 403 — "chưa đăng nhập" khác "đăng nhập rồi nhưng không có quyền". Trả 401 cho người đã đăng nhập là bảo client đi đăng nhập lại, và nó sẽ đá người dùng ra màn hình đăng nhập một cách vô lý.\n② 404 vs 403 khi tài nguyên CÓ TỒN TẠI nhưng người gọi không được xem. Cả hai đều đúng; chọn 404 là CỐ Ý giấu sự tồn tại (chống dò tài nguyên bằng cách thử id). Đó là một quyết định bảo mật, phải ghi vào tài liệu chứ không để mỗi endpoint làm một kiểu.\n\nLuật cuối, và là luật hay bị vi phạm nhất: **đừng bao giờ nhét lỗi vào thân của một phản hồi 200.** Nếu việc không xong, mã trạng thái phải nói ra.',
    workedExample: {
      code: `// Bảng quyết định mã trạng thái cho một endpoint đọc tài nguyên.
// Mô hình hoá bằng union phân biệt để trình biên dịch bắt giúp ca thiếu.
type TinhHuong =
  | { loai: "ok" }
  | { loai: "chuaDangNhap" }
  | { loai: "khongDuQuyen"; giauSuTonTai: boolean }
  | { loai: "khongCo" }
  | { loai: "loiPhuThuoc" }

function maTrangThai(t: TinhHuong): number {
  switch (t.loai) {
    case "ok":
      return 200
    case "chuaDangNhap":
      return 401 // chưa biết bạn là ai — client nên đi đăng nhập
    case "khongDuQuyen":
      // Biết bạn là ai rồi. 403 nói thẳng "không được phép";
      // 404 CỐ Ý giấu sự tồn tại để chống dò id. Là quyết định bảo mật.
      return t.giauSuTonTai ? 404 : 403
    case "khongCo":
      return 404
    case "loiPhuThuoc":
      return 502 // phía sau hỏng, KHÔNG phải người gọi sai
  }
}

const thu: TinhHuong[] = [
  { loai: "ok" },
  { loai: "chuaDangNhap" },
  { loai: "khongDuQuyen", giauSuTonTai: false },
  { loai: "khongDuQuyen", giauSuTonTai: true },
  { loai: "loiPhuThuoc" },
]
console.log(thu.map(maTrangThai).join(" "))
// Thêm một nhánh mới vào TinhHuong mà quên xử lý → tsc báo ngay,
// vì switch không còn phủ hết union. Đó là điểm của union phân biệt.`,
      stdinLines: [],
    },
    predict: {
      code: `// Kiểu API "luôn 200, lỗi để trong thân" — thứ bài học này bảo đừng làm.
type PhanHoi = { ma: number; than: string }

function docDon(coQuyen: boolean, tonTai: boolean): PhanHoi {
  if (!coQuyen) return { ma: 200, than: "loi: khong du quyen" }
  if (!tonTai) return { ma: 200, than: "loi: khong tim thay" }
  return { ma: 200, than: "du lieu don hang" }
}

const r = docDon(false, true)
console.log("GIAM SAT THAY: ma=" + r.ma + " => tinh la THANH CONG")`,
      question: 'Công cụ giám sát đọc phản hồi này và kết luận gì?',
      choices: [
        'GIAM SAT THAY: ma=200 => tinh la THANH CONG',
        'GIAM SAT THAY: ma=403 => tinh la LOI NGUOI GOI',
        'GIAM SAT THAY: ma=500 => tinh la LOI SERVER',
        'GIAM SAT THAY: ma=404 => tinh la KHONG TIM THAY',
      ],
      answerIndex: 0,
      explain:
        'Hàm luôn trả `ma: 200` nên output là dòng đầu. Đó chính là cái bẫy: người dùng bị từ chối quyền, nhưng mọi tầng hạ tầng — proxy, bộ nhớ đệm, bảng giám sát, thư viện thử lại — đều đọc mã 200 và kết luận "thành công". Tỉ lệ lỗi trên bảng giám sát sẽ là 0% trong khi người dùng không dùng được. Chữ "loi" nằm trong thân phản hồi không cứu được gì, vì không tầng nào mở thân ra đọc. Muốn đúng thì phải trả 403.',
    },
    parsons: {
      prompt: 'Xếp lại hàm chọn mã trạng thái — thứ tự các nhánh quyết định ai bị đổ lỗi.',
      lines: [
        'function maTrangThai(t: TinhHuong): number {',
        '  switch (t.loai) {',
        '    case "chuaDangNhap":',
        '      return 401',
        '    case "khongDuQuyen":',
        '      return t.giauSuTonTai ? 404 : 403',
        '    case "loiPhuThuoc":',
        '      return 502',
        '  }',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm maTrangThai(t) trả về SỐ mã trạng thái đúng cho từng tình huống của một endpoint TẠO đơn hàng.\n\nTình huống là một trong các dạng sau (trường `loai`):\n  · "taoMoi" → vừa tạo xong tài nguyên mới\n  · "khongThan" → làm xong, cố ý không trả thân nào\n  · "thanDiDang" → thân yêu cầu sai khuôn\n  · "chuaDangNhap" → chưa biết người gọi là ai\n  · "khongDuQuyen" → biết rồi, nhưng không được phép (kèm cờ giauSuTonTai)\n  · "trungDon" → đơn này đã tồn tại, xung đột trạng thái\n  · "saiNghiepVu" → đúng khuôn nhưng vi phạm luật nghiệp vụ\n  · "loiTrongCode" → lỗi của chính server\n  · "phuThuocQuaTai" → dịch vụ phía sau đang quá tải\n\nBốn dòng in ở cuối đã viết sẵn, đừng sửa — chúng chính là bốn ca chấm.',
      starterCode: `type TinhHuong =
  | { loai: "taoMoi" }
  | { loai: "khongThan" }
  | { loai: "thanDiDang" }
  | { loai: "chuaDangNhap" }
  | { loai: "khongDuQuyen"; giauSuTonTai: boolean }
  | { loai: "trungDon" }
  | { loai: "saiNghiepVu" }
  | { loai: "loiTrongCode" }
  | { loai: "phuThuocQuaTai" }

function maTrangThai(t: TinhHuong): number {
  // TODO: trả về mã đúng cho từng tình huống
  return 200
}

// ---- Đừng sửa phần dưới đây ----
const HOAN_TAT: TinhHuong[] = [{ loai: "taoMoi" }, { loai: "khongThan" }]
const NGUOI_GOI_SAI: TinhHuong[] = [
  { loai: "thanDiDang" },
  { loai: "chuaDangNhap" },
  { loai: "khongDuQuyen", giauSuTonTai: false },
  { loai: "khongDuQuyen", giauSuTonTai: true },
]
const XUNG_DOT: TinhHuong[] = [{ loai: "trungDon" }, { loai: "saiNghiepVu" }]
const SERVER_SAI: TinhHuong[] = [{ loai: "loiTrongCode" }, { loai: "phuThuocQuaTai" }]

console.log("Hoan tat: " + HOAN_TAT.map(maTrangThai).join(" "))
console.log("Nguoi goi sai: " + NGUOI_GOI_SAI.map(maTrangThai).join(" "))
console.log("Xung dot: " + XUNG_DOT.map(maTrangThai).join(" "))
console.log("Server sai: " + SERVER_SAI.map(maTrangThai).join(" "))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Hoan tat: 201 204',
          match: 'contains',
          hidden: false,
          label: 'Tạo mới là 201 chứ không phải 200; làm xong mà không có thân là 204',
        },
        {
          stdinLines: [],
          expected: 'Nguoi goi sai: 400 401 403 404',
          match: 'contains',
          hidden: false,
          label: '401 khác 403; giấu sự tồn tại thì trả 404 — quyết định bảo mật',
        },
        {
          stdinLines: [],
          expected: 'Xung dot: 409 422',
          match: 'contains',
          hidden: false,
          label: 'Xung đột trạng thái là 409; đúng khuôn nhưng sai nghiệp vụ là 422',
        },
        {
          stdinLines: [],
          expected: 'Server sai: 500 503',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — 5xx là lỗi của server, người gọi không sửa được gì',
        },
      ],
      hints: [
        'Dùng switch trên t.loai. Nhóm chúng theo ba họ trước: 2xx đã làm xong, 4xx người gọi sai, 5xx server sai.',
        'Ba ca 2xx: taoMoi → 201 (vừa tạo tài nguyên mới), khongThan → 204 (xong, không có thân), còn lại mới là 200.',
        'Bốn ca 4xx dễ lẫn: thanDiDang → 400, chuaDangNhap → 401, khongDuQuyen → 403, trungDon → 409, saiNghiepVu → 422. Riêng khongDuQuyen có cờ giauSuTonTai: bật thì trả 404 để người gọi không dò được id.',
        'Hai ca 5xx: loiTrongCode → 500, phuThuocQuaTai → 503 (dịch vụ tạm không phục vụ được). Nếu phía sau trả về phản hồi hỏng thì mới là 502.',
      ],
      sampleSolution: `type TinhHuong =
  | { loai: "taoMoi" }
  | { loai: "khongThan" }
  | { loai: "thanDiDang" }
  | { loai: "chuaDangNhap" }
  | { loai: "khongDuQuyen"; giauSuTonTai: boolean }
  | { loai: "trungDon" }
  | { loai: "saiNghiepVu" }
  | { loai: "loiTrongCode" }
  | { loai: "phuThuocQuaTai" }

function maTrangThai(t: TinhHuong): number {
  switch (t.loai) {
    // ── 2xx: đã làm xong ──
    case "taoMoi":
      return 201 // kèm header Location trỏ tới tài nguyên vừa tạo
    case "khongThan":
      return 204
    // ── 4xx: người gọi sai, gửi lại y hệt vẫn hỏng ──
    case "thanDiDang":
      return 400
    case "chuaDangNhap":
      return 401 // CHƯA biết bạn là ai
    case "khongDuQuyen":
      // Biết rồi nhưng không được phép. Giấu sự tồn tại là quyết định bảo mật.
      return t.giauSuTonTai ? 404 : 403
    case "trungDon":
      return 409
    case "saiNghiepVu":
      return 422
    // ── 5xx: server sai, người gọi không làm gì khác được ──
    case "loiTrongCode":
      return 500
    case "phuThuocQuaTai":
      return 503
  }
}

// ---- Đừng sửa phần dưới đây ----
const HOAN_TAT: TinhHuong[] = [{ loai: "taoMoi" }, { loai: "khongThan" }]
const NGUOI_GOI_SAI: TinhHuong[] = [
  { loai: "thanDiDang" },
  { loai: "chuaDangNhap" },
  { loai: "khongDuQuyen", giauSuTonTai: false },
  { loai: "khongDuQuyen", giauSuTonTai: true },
]
const XUNG_DOT: TinhHuong[] = [{ loai: "trungDon" }, { loai: "saiNghiepVu" }]
const SERVER_SAI: TinhHuong[] = [{ loai: "loiTrongCode" }, { loai: "phuThuocQuaTai" }]

console.log("Hoan tat: " + HOAN_TAT.map(maTrangThai).join(" "))
console.log("Nguoi goi sai: " + NGUOI_GOI_SAI.map(maTrangThai).join(" "))
console.log("Xung dot: " + XUNG_DOT.map(maTrangThai).join(" "))
console.log("Server sai: " + SERVER_SAI.map(maTrangThai).join(" "))`,
    },
    homework:
      'Mở một API bạn đã viết (hoặc một API công khai bất kỳ) và gọi nó bằng công cụ dòng lệnh ở chế độ chi tiết để thấy mã trạng thái thật. Thử bốn tình huống: gọi đúng, gọi thiếu token, gọi bằng token của người khác, gọi vào id không tồn tại. Ghi lại mã nhận được và tự chấm: có cái nào trả 200 kèm lỗi trong thân không? Có cái nào trả 500 cho chuyện người dùng gõ sai không? Sửa lại một endpoint theo bảng bạn vừa học.',
    srsCards: [
      {
        hoi: 'Vì sao không được trả 200 kèm lỗi trong thân phản hồi?',
        dap: 'Vì proxy, bộ nhớ đệm, bảng giám sát và thư viện thử lại chỉ đọc MÃ TRẠNG THÁI, không mở thân ra đọc. Trả 200 là báo với toàn bộ hạ tầng rằng việc đã xong.',
      },
      {
        hoi: '401 khác 403 ở chỗ nào?',
        dap: '401 = CHƯA biết bạn là ai (chưa đăng nhập / token hỏng) → client nên đi đăng nhập. 403 = biết rồi nhưng KHÔNG được phép → đăng nhập lại cũng vô ích.',
      },
      {
        hoi: 'Ranh giới 4xx/5xx quyết định điều gì?',
        dap: 'Quyết định AI phải sửa. 4xx là người gọi sai, gửi lại y hệt vẫn hỏng. 5xx là server sai, người gọi không làm gì khác được — và đây mới là thứ đáng báo động cho đội trực.',
      },
      {
        hoi: 'Khi nào trả 404 cho một tài nguyên CÓ tồn tại?',
        dap: 'Khi cố ý giấu sự tồn tại của nó để chống dò id. Đó là quyết định bảo mật, phải thống nhất toàn hệ và ghi vào tài liệu, không để mỗi endpoint làm một kiểu.',
      },
    ],
  },
  {
    id: 'p6-u61-l2',
    unitId: 'p6-u61',
    language: 'typescript',
    title: 'Phân trang bằng con trỏ — vì sao offset vừa chậm vừa SAI',
    hook: 'Người dùng cuộn danh sách đơn hàng. Trang 1 xong, trang 2 xong. Nhưng có một đơn mới vừa được tạo giữa hai lần gọi, và bây giờ đơn cuối của trang 1 tự nhiên hiện lại ở đầu trang 2 — còn một đơn khác thì biến mất luôn, không bao giờ người dùng thấy. Không ai báo lỗi. Không có dòng log nào. Đây là lỗi của OFFSET, và nó có mặt trong gần như mọi API phân trang viết lần đầu.',
    theory:
      'Phân trang bằng `OFFSET n LIMIT k` nghĩa là: "bỏ qua n bản ghi đầu, lấy k bản ghi kế". Hai vấn đề, và vấn đề thứ hai mới là vấn đề thật.\n\n**① Chậm dần, và chậm ở đúng chỗ không ai đo.** Cơ sở dữ liệu không nhảy thẳng tới bản ghi thứ n được — nó phải QUÉT rồi ĐẾM rồi bỏ qua đủ n bản ghi. Trang 1 nhanh, trang 500 quét 500 trang dữ liệu. Người thử nghiệm luôn thử trang 1 nên không ai phát hiện.\n\n**② Kết quả SAI khi dữ liệu thay đổi giữa hai lần gọi** — đây mới là lỗi nghiêm trọng. Offset đếm theo VỊ TRÍ, mà vị trí thì trôi:\n\n· Thêm một bản ghi vào đầu danh sách → mọi thứ dịch xuống một chỗ → bản ghi cuối của trang trước bị LẶP LẠI ở trang sau.\n· Xoá một bản ghi ở trang trước → mọi thứ dịch lên → một bản ghi bị NHẢY QUA, người dùng không bao giờ thấy nó.\n\nKhông có thông báo lỗi nào cho cả hai ca. Dữ liệu chỉ đơn giản là sai.\n\n**Cách đúng: phân trang bằng CON TRỎ (cursor).** Thay vì hỏi "bỏ qua bao nhiêu", hỏi "cho tôi các bản ghi ĐỨNG SAU cái này". Con trỏ là GIÁ TRỊ của khoá sắp xếp, không phải vị trí:\n\n  SELECT * FROM don WHERE id > $conTro ORDER BY id LIMIT 20\n\nBản ghi mới thêm vào đầu không làm dịch gì cả, vì câu hỏi không nhắc tới vị trí. Cơ sở dữ liệu cũng nhảy thẳng được tới chỗ cần bằng index, nên trang 500 nhanh ngang trang 1.\n\n**Ba luật thi hành, sai một cái là hỏng cả cơ chế:**\n\n· Khoá sắp xếp phải DUY NHẤT và KHÔNG ĐỔI. Sắp theo `ngay_tao` mà hai đơn cùng giây là mất bản ghi — phải ghép thêm `id` làm khoá phụ.\n· Con trỏ phải là thứ ĐỤC (opaque) với client: mã hoá base64 hoặc ký, để sau này đổi cách sắp xếp mà không phá client cũ.\n· Hết dữ liệu thì trả con trỏ `null`, KHÔNG phải chuỗi rỗng và cũng không phải bỏ trường đi — client cần một tín hiệu dứt khoát để dừng.\n\nĐánh đổi thành thật: con trỏ KHÔNG nhảy tới trang bất kỳ được ("cho tôi trang 37"). Nếu sản phẩm thật sự cần nhảy trang thì phải chấp nhận offset và nói rõ giới hạn của nó — nhưng danh sách cuộn vô tận, dòng thời gian, xuất dữ liệu thì con trỏ luôn đúng hơn.',
    workedExample: {
      code: `// So hai cách phân trang trên CÙNG một tình huống: có bản ghi mới chen vào giữa hai lần gọi.
type Don = { id: number; ten: string }

const TRUOC: Don[] = [
  { id: 5, ten: "e" },
  { id: 4, ten: "d" },
  { id: 3, ten: "c" },
  { id: 2, ten: "b" },
  { id: 1, ten: "a" },
]
// Giữa hai lần gọi, đơn id=6 được tạo và chen lên đầu (sắp giảm dần theo id).
const SAU: Don[] = [{ id: 6, ten: "f" }, ...TRUOC]

// Cách 1 — OFFSET: đếm theo VỊ TRÍ, mà vị trí thì vừa trôi mất một chỗ.
const trang1Offset = TRUOC.slice(0, 2)
const trang2Offset = SAU.slice(2, 4)

// Cách 2 — CON TRỎ: hỏi "cho tôi các bản ghi đứng SAU id này".
const trang1ConTro = TRUOC.slice(0, 2)
const conTro = trang1ConTro[trang1ConTro.length - 1]!.id
const trang2ConTro = SAU.filter((d) => d.id < conTro).slice(0, 2)

const ten = (ds: Don[]) => ds.map((d) => d.ten).join(",")
console.log("Offset  trang1=" + ten(trang1Offset) + " trang2=" + ten(trang2Offset))
console.log("Con tro trang1=" + ten(trang1ConTro) + " trang2=" + ten(trang2ConTro))
// Offset: "d" hiện LẠI ở trang 2 (đã thấy ở trang 1) và "c" thì mất hút.
// Con trỏ: đi tiếp đúng từ chỗ đã dừng, bản ghi mới chen vào không ảnh hưởng gì.`,
      stdinLines: [],
    },
    predict: {
      code: `// Phân trang bằng offset, và giữa hai lần gọi có một bản ghi bị XOÁ.
const TRUOC = ["e", "d", "c", "b", "a"]
const SAU = ["e", "c", "b", "a"] // "d" vừa bị xoá

const trang1 = TRUOC.slice(0, 2) // ["e", "d"]
const trang2 = SAU.slice(2, 4)

console.log("Nguoi dung thay: " + [...trang1, ...trang2].join(","))`,
      question: 'Người dùng lật hết hai trang thì thấy những mục nào?',
      choices: [
        'Nguoi dung thay: e,d,b,a',
        'Nguoi dung thay: e,d,c,b',
        'Nguoi dung thay: e,d,c,b,a',
        'Nguoi dung thay: e,c,b,a',
      ],
      answerIndex: 0,
      explain:
        'Trang 1 lấy ["e","d"] từ danh sách cũ. Sau khi "d" bị xoá, danh sách còn ["e","c","b","a"], nên `slice(2, 4)` lấy ["b","a"] — và "c" bị NHẢY QUA hoàn toàn. Người dùng thấy e,d,b,a: một mục đã xoá vẫn hiện, còn một mục đang tồn tại thì không bao giờ được thấy. Không có lỗi nào được báo. Đây đúng là loại sai mà offset gây ra và cũng là lý do phân trang bằng con trỏ tồn tại: con trỏ hỏi "đứng sau id nào", không hỏi "bỏ qua bao nhiêu", nên xoá hay thêm ở chỗ khác không làm trôi kết quả.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm lấy một trang bằng con trỏ — chú ý thứ tự lọc, cắt, rồi mới tính con trỏ kế.',
      lines: [
        'function layTrang(ds: Don[], conTro: number | null, kichThuoc: number) {',
        '  const conLai = conTro === null ? ds : ds.filter((d) => d.id < conTro)',
        '  const muc = conLai.slice(0, kichThuoc)',
        '  const conNua = conLai.length > kichThuoc',
        '  const ke = conNua ? muc[muc.length - 1]!.id : null',
        '  return { muc, conTroKe: ke }',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm layTrang(ds, conTro, kichThuoc) phân trang bằng CON TRỎ.\n\n· `ds` đã sắp GIẢM DẦN theo `id` (mới nhất trước) và `id` là duy nhất.\n· `conTro` là `null` cho trang đầu; các trang sau nhận `id` của mục cuối trang trước.\n· Trả về `{ muc, conTroKe }`: `muc` là tối đa `kichThuoc` bản ghi đứng SAU con trỏ, `conTroKe` là `id` của mục cuối — nhưng phải là `null` khi KHÔNG còn dữ liệu nào phía sau nữa.\n\nĐiểm dễ sai nhất: `conTroKe` chỉ khác `null` khi thật sự CÒN bản ghi phía sau, không phải cứ có mục là trả con trỏ. Trả bừa con trỏ thì client lặp thêm một vòng gọi rỗng — và với danh sách cuộn vô tận thì nó không bao giờ biết đã hết.\n\nBốn dòng in ở cuối đã viết sẵn, đừng sửa — chúng chính là bốn ca chấm.',
      starterCode: `type Don = { id: number; ten: string }

function layTrang(
  ds: Don[],
  conTro: number | null,
  kichThuoc: number,
): { muc: Don[]; conTroKe: number | null } {
  // TODO: lọc theo con trỏ, cắt đúng kích thước, rồi tính con trỏ kế
  return { muc: [], conTroKe: null }
}

// ---- Đừng sửa phần dưới đây ----
const DS: Don[] = [
  { id: 5, ten: "e" },
  { id: 4, ten: "d" },
  { id: 3, ten: "c" },
  { id: 2, ten: "b" },
  { id: 1, ten: "a" },
]
const ghi = (r: { muc: Don[]; conTroKe: number | null }) =>
  r.muc.map((d) => d.ten).join(",") + " | ke=" + String(r.conTroKe)

console.log("Trang dau: " + ghi(layTrang(DS, null, 2)))
console.log("Trang giua: " + ghi(layTrang(DS, 4, 2)))
console.log("Trang cuoi: " + ghi(layTrang(DS, 2, 2)))
console.log("Vua het: " + ghi(layTrang(DS, null, 5)))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Trang dau: e,d | ke=4',
          match: 'contains',
          hidden: false,
          label: 'Trang đầu (con trỏ null) lấy từ đầu và trả con trỏ kế',
        },
        {
          stdinLines: [],
          expected: 'Trang giua: c,b | ke=2',
          match: 'contains',
          hidden: false,
          label: 'Trang sau lấy đúng các bản ghi ĐỨNG SAU con trỏ, không lặp không sót',
        },
        {
          stdinLines: [],
          expected: 'Trang cuoi: a | ke=null',
          match: 'contains',
          hidden: false,
          label: 'Hết dữ liệu thì con trỏ kế phải là null — tín hiệu dứt khoát cho client',
        },
        {
          stdinLines: [],
          expected: 'Vua het: e,d,c,b,a | ke=null',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — lấy vừa đủ hết danh sách cũng phải trả null, không được trả con trỏ thừa',
        },
      ],
      hints: [
        'Bước 1: nếu conTro là null thì phần còn lại là cả danh sách; nếu không thì lọc lấy những bản ghi có id NHỎ HƠN con trỏ (vì danh sách sắp giảm dần).',
        'Bước 2: cắt tối đa kichThuoc phần tử đầu của phần còn lại — đó là `muc`.',
        'Bước 3 là chỗ dễ sai: chỉ trả con trỏ kế khi phần còn lại NHIỀU HƠN kichThuoc, tức là thật sự vẫn còn bản ghi phía sau trang này.',
        'Khung tham chiếu:\n\nconst conLai = conTro === null ? ds : ds.filter((d) => d.id < conTro)\nconst muc = conLai.slice(0, kichThuoc)\nconst conTroKe = conLai.length > kichThuoc ? muc[muc.length - 1]!.id : null\nreturn { muc, conTroKe }',
      ],
      sampleSolution: `type Don = { id: number; ten: string }

function layTrang(
  ds: Don[],
  conTro: number | null,
  kichThuoc: number,
): { muc: Don[]; conTroKe: number | null } {
  // ① Hỏi "đứng SAU cái này", không hỏi "bỏ qua bao nhiêu" — nên thêm/xoá ở chỗ
  //    khác không làm trôi kết quả như offset.
  const conLai = conTro === null ? ds : ds.filter((d) => d.id < conTro)

  // ② Cắt đúng một trang.
  const muc = conLai.slice(0, kichThuoc)

  // ③ Chỉ trả con trỏ khi THẬT SỰ còn dữ liệu phía sau. Trả bừa thì client
  //    phải gọi thêm một vòng rỗng mới biết đã hết.
  const conTroKe = conLai.length > kichThuoc ? muc[muc.length - 1]!.id : null

  return { muc, conTroKe }
}

// ---- Đừng sửa phần dưới đây ----
const DS: Don[] = [
  { id: 5, ten: "e" },
  { id: 4, ten: "d" },
  { id: 3, ten: "c" },
  { id: 2, ten: "b" },
  { id: 1, ten: "a" },
]
const ghi = (r: { muc: Don[]; conTroKe: number | null }) =>
  r.muc.map((d) => d.ten).join(",") + " | ke=" + String(r.conTroKe)

console.log("Trang dau: " + ghi(layTrang(DS, null, 2)))
console.log("Trang giua: " + ghi(layTrang(DS, 4, 2)))
console.log("Trang cuoi: " + ghi(layTrang(DS, 2, 2)))
console.log("Vua het: " + ghi(layTrang(DS, null, 5)))`,
    },
    homework:
      'Lấy một bảng có sẵn của bạn (hoặc tạo bảng 100.000 dòng bằng generate_series) và đo thật: chạy `EXPLAIN ANALYZE` cho `OFFSET 0 LIMIT 20` rồi cho `OFFSET 90000 LIMIT 20`, ghi lại hai con số thời gian. Sau đó viết lại truy vấn thứ hai bằng con trỏ (`WHERE id < $1 ORDER BY id DESC LIMIT 20`) và đo lần nữa. Bạn sẽ có một bảng ba dòng — đó là bằng chứng để thuyết phục người khác, chứ không phải câu "nghe nói offset chậm".',
    srsCards: [
      {
        hoi: 'Vì sao OFFSET chậm dần ở trang xa?',
        dap: 'Cơ sở dữ liệu không nhảy thẳng tới bản ghi thứ n được — nó phải quét và bỏ qua đủ n bản ghi trước. Trang 1 nhanh nên không ai phát hiện khi thử.',
      },
      {
        hoi: 'OFFSET gây SAI kết quả trong tình huống nào?',
        dap: 'Khi dữ liệu đổi giữa hai lần gọi. Thêm bản ghi phía trước → một mục bị lặp lại ở trang sau; xoá bản ghi phía trước → một mục bị nhảy qua, không ai thấy. Không có lỗi nào được báo.',
      },
      {
        hoi: 'Con trỏ (cursor) hỏi cơ sở dữ liệu câu hỏi gì?',
        dap: '"Cho tôi các bản ghi ĐỨNG SAU giá trị khoá này" — theo GIÁ TRỊ chứ không theo VỊ TRÍ. Nên thêm/xoá ở chỗ khác không làm trôi kết quả, và index nhảy thẳng được.',
      },
      {
        hoi: 'Con trỏ đánh đổi mất gì so với offset?',
        dap: 'Không nhảy tới trang bất kỳ được ("cho tôi trang 37"). Cuộn vô tận và xuất dữ liệu thì con trỏ luôn đúng hơn; cần nhảy trang thật sự thì phải chấp nhận offset và nói rõ giới hạn.',
      },
    ],
  },
]
