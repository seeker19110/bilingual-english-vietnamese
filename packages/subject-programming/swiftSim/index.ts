// swiftSim — BỘ CHẠY SWIFT RÚT GỌN của DHCB (PR-M3, chương trình M §3).
//
// VẤN ĐỀ PHẢI GIẢI: người dùng yêu cầu khoá Swift "từ cơ bản đến nâng cao, đầy đủ và chi tiết"
// (hiến chương M §1), tức phải dạy được CÚ PHÁP THẬT chứ không chỉ cơ chế. Khuôn Go/Rust của
// bậc P6 (mô hình bằng Python, cú pháp thật ở làn C) trung thực nhưng KHÔNG đáp ứng được: học
// viên đi hết track vẫn chưa gõ một dòng Swift nào được chấm.
//
// LỜI GIẢI (hiến chương M §3, quyết định TRỤ CỘT): viết một trình thông dịch TẬP CON của Swift
// bằng TypeScript. Học viên gõ cú pháp Swift thật, bấm Chạy, và được chấm bằng test-case như
// mọi bài khác của môn. Cổng CI và trình duyệt chạy CHUNG một đoạn mã nên không có khe hở trôi
// (§3.1) — khác hẳn mạch Python, nơi python3 ở CI và Pyodide ở trình duyệt là hai bản cài đặt.
//
// ─────────────────────────── LUẬT TỰ KHAI (§3.3, bắt buộc) ───────────────────────────
//
// 1. Mỗi lượt chạy in DONG_TU_KHAI ở dòng đầu.
// 2. Mỗi unit phải có mục "Bộ chạy này KHÔNG làm gì" — nội dung lấy từ KHONG_LAM_GI dưới đây.
// 3. CẤM câu chữ ngụ ý đang chạy trình biên dịch thật ("swiftc của bạn báo lỗi…"). Được phép
//    nói "cú pháp này là cú pháp Swift thật" vì đó là sự thật, nhưng phải kèm chỗ khác biệt.
// 4. Bước ⑦ (về nhà) luôn là làn C: cài Swift/Xcode thật, chạy đúng đoạn vừa viết, đối chiếu.
// 5. Chỗ bộ chạy CỐ Ý khác Swift thật đều nằm trong KHAC_BIET, và bài chạm tới phải nói ra.
//
// TẤT ĐỊNH TUYỆT ĐỐI: không Date.now(), không random, không đồng hồ — cùng mã nguồn luôn cho
// cùng output, nếu không thì không thể làm cổng chấm.
import { LoiSwift } from './lexer.js'
import { BoChay, LoiNem, inGia, type TuyChonChay } from './interpreter.js'

export { LoiSwift } from './lexer.js'
export { inGia, tenKieuCua, type Gia } from './interpreter.js'

/** Dòng tự khai in ở đầu MỌI lượt chạy (§3.3 luật 1). */
export const DONG_TU_KHAI = '[GIA LAP] Bo chay Swift rut gon cua DHCB — khong phai swiftc.'

/**
 * Bộ chạy này KHÔNG làm gì — mỗi unit Swift phải có một mục nói lại đúng danh sách này
 * (§3.3 luật 2). Để ở đây, dạng dữ liệu, để nội dung không chép tay mỗi chỗ một kiểu.
 */
export const KHONG_LAM_GI = [
  'Không có thư viện chuẩn đầy đủ: không Foundation, không SwiftUI, không UIKit.',
  'Không có giao diện, không có ứng dụng thật — phần đó nằm ở làn C (Xcode trên máy bạn).',
  'Không đa luồng thật: không async/await, không Task, không actor.',
  'Không quản lý bộ nhớ thật: không ARC, không weak/unowned, không đếm tham chiếu.',
  'Không có file, không có mạng, không có đồng hồ (cố ý — để bài học luôn cho cùng kết quả).',
  'Cú pháp chỉ phủ phần TẬP CON dạy trong khoá: không có extension, không có subscript tự viết, không có toán tử tự định nghĩa, không có generic có ràng buộc phức tạp.',
] as const

/**
 * KHÁC BIỆT ĐÃ BIẾT so với Swift thật (§3.3 luật 5).
 *
 * Đây là danh sách phải đọc trước khi soạn bất cứ bài Swift nào: bài chạm tới điểm nào thì
 * PHẢI nói ra điểm đó, không được im lặng để học viên tưởng bộ chạy và swiftc giống hệt nhau.
 */
export const KHAC_BIET = [
  {
    diem: 'Thời điểm bắt lỗi kiểu',
    boChay: 'Kiểm LÚC CHẠY — lỗi hiện ra khi dòng đó được thực thi.',
    swiftThat: 'Kiểm LÚC BIÊN DỊCH — chương trình sai kiểu thì không chạy được dòng nào.',
    viSao:
      'Viết bộ kiểm kiểu tĩnh đầy đủ là một dự án riêng. Đổi lại, thông báo lỗi ở đây chỉ đúng số dòng và viết bằng tiếng Việt, dễ hơn hẳn cho người mới.',
  },
  {
    diem: 'Thứ tự duyệt từ điển',
    boChay: 'Sắp theo khoá, tất định.',
    swiftThat: 'KHÔNG bảo đảm thứ tự — mỗi lần chạy có thể khác.',
    viSao:
      'Bài học phải chấm được. Hệ quả bắt buộc: không bài nào được dạy rằng từ điển có thứ tự.',
  },
  {
    diem: 'Đóng (closure) một dòng',
    boChay: 'Trả về giá trị của biểu thức cuối, kể cả khi thân có nhiều lệnh hơn một dòng.',
    swiftThat: 'Chỉ suy ra kết quả ngầm khi thân đúng MỘT biểu thức.',
    viSao: 'Nới lỏng cho người mới; bài học vẫn nên viết `return` cho rõ.',
  },
  {
    diem: 'Tràn số nguyên',
    boChay: 'Dùng số của JavaScript — số rất lớn mất độ chính xác thay vì báo lỗi.',
    swiftThat: 'Int 64-bit, tràn là dừng chương trình ngay.',
    viSao: 'Bài học không đụng tới ngưỡng đó; nếu có thì phải nói ra.',
  },
] as const

export interface SwiftRunResult {
  output: string
  /** Lỗi ĐỘNG CƠ hoặc lỗi chương trình — thứ khiến lượt chạy không hoàn tất. */
  error?: string
}

/**
 * Chạy một chương trình Swift rút gọn.
 *
 * `dongVao` giữ chỗ cho bài có nhập liệu; bộ chạy hiện chưa có `readLine()` (không có stdin
 * trong trình duyệt cho mạch này), nên tham số nhận vào để chữ ký ổn định với runner nhưng
 * chưa dùng — bài Swift lấy dữ liệu từ hằng trong đề, đúng như ví dụ trong sách Swift.
 */
export function chaySwift(
  src: string,
  dongVao: string[] = [],
  tc: TuyChonChay = {},
): SwiftRunResult {
  void dongVao // giữ chỗ cho bài có nhập liệu — xem ghi chú trên
  const bo = new BoChay(tc)
  try {
    const ra = bo.chay(src)
    return { output: DONG_TU_KHAI + '\n' + ra }
  } catch (e) {
    if (e instanceof LoiSwift) {
      const msg = `dong ${e.dong}: ${e.message}`
      return { output: `${DONG_TU_KHAI}\n${msg}\n`, error: msg }
    }
    if (e instanceof LoiNem) {
      // Lỗi được `throw` mà không ai `catch` — Swift thật dừng chương trình y như vậy.
      const msg = `dong ${e.dong}: Loi "${inGia(e.gia)}" duoc nem ra nhung khong co "do { … } catch { … }" nao bat. Bo loi vao khoi do/catch, hoac dung "try?" de bien loi thanh nil.`
      return { output: `${DONG_TU_KHAI}\n${msg}\n`, error: msg }
    }
    throw e
  }
}
