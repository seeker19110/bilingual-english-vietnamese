// kotlinSim — BỘ CHẠY KOTLIN RÚT GỌN của DHCB (PR-M7, chương trình M §3).
//
// Tên file KHÔNG phải `index.ts` là có chủ ý: Rollup đặt tên chunk theo tên file, và
// `index-*.js` trùng glob "Initial JS" của `.size-limit.json` — đã dính thật một lần và làm
// ngân sách đội 27 kB (xem PROGRESS.md, bài học của PR hướng chuyên sâu).
//
// VẤN ĐỀ PHẢI GIẢI: hiến chương M §1 xếp Kotlin vào tầng 2, tức phải dạy được CÚ PHÁP THẬT chứ
// không chỉ cơ chế. Khuôn Go/Rust của bậc P6 (mô hình bằng Python, cú pháp thật ở làn C) trung
// thực nhưng không đáp ứng được: học viên đi hết track vẫn chưa gõ một dòng Kotlin nào được chấm.
//
// LỜI GIẢI (§3, quyết định TRỤ CỘT): trình thông dịch TẬP CON viết bằng TypeScript. Cổng CI và
// trình duyệt chạy CHUNG một đoạn mã nên không có khe hở trôi (§3.1) — khác hẳn mạch Python,
// nơi python3 ở CI và Pyodide ở trình duyệt là hai bản cài đặt của cùng một ngôn ngữ.
//
// ─────────────────────────── LUẬT TỰ KHAI (§3.3, bắt buộc) ───────────────────────────
//
// 1. Mỗi lượt chạy in DONG_TU_KHAI ở dòng đầu.
// 2. Mỗi unit phải có mục "Bộ chạy này KHÔNG làm gì" — nội dung lấy từ KHONG_LAM_GI dưới đây.
// 3. CẤM câu chữ ngụ ý đang chạy trình biên dịch thật ("kotlinc của bạn báo lỗi…"). Được phép
//    nói "cú pháp này là cú pháp Kotlin thật" vì đó là sự thật, nhưng phải kèm chỗ khác biệt.
// 4. Bước ⑦ (về nhà) luôn là làn C: cài Kotlin/Android Studio thật, chạy đúng đoạn vừa viết.
// 5. Chỗ bộ chạy CỐ Ý khác Kotlin thật đều nằm trong KHAC_BIET, và bài chạm tới phải nói ra.
//
// TẤT ĐỊNH TUYỆT ĐỐI: không Date.now(), không random, không đồng hồ — cùng mã nguồn luôn cho
// cùng output, nếu không thì không thể làm cổng chấm.
import { LoiKotlin } from './lexer.js'
import { BoChay, LoiNem, inGia, type TuyChonChay } from './interpreter.js'

export { LoiKotlin } from './lexer.js'
export { inGia, tenKieuCua, type Gia } from './interpreter.js'

/** Dòng tự khai in ở đầu MỌI lượt chạy (§3.3 luật 1). */
export const DONG_TU_KHAI = '[GIA LAP] Bo chay Kotlin rut gon cua DHCB — khong phai kotlinc.'

/**
 * Bộ chạy này KHÔNG làm gì — mỗi unit Kotlin phải có một mục nói lại đúng danh sách này
 * (§3.3 luật 2). Để ở đây, dạng dữ liệu, để nội dung không chép tay mỗi chỗ một kiểu.
 */
export const KHONG_LAM_GI = [
  'Không có thư viện chuẩn đầy đủ: không java.*, không kotlinx, không Android SDK.',
  'Không có giao diện, không có ứng dụng thật — phần đó nằm ở làn C (Android Studio trên máy bạn).',
  'Không đa luồng thật: không coroutine, không suspend, không Flow, không Thread.',
  'Không có file, không có mạng, không có đồng hồ (cố ý — để bài học luôn cho cùng kết quả).',
  'Không có generic tự viết, không có extension function, không có toán tử tự định nghĩa, không có delegate (by lazy…).',
  'Không có lớp lồng trong lớp — đưa lớp bên trong ra mục cao nhất.',
] as const

/**
 * KHÁC BIỆT ĐÃ BIẾT so với Kotlin thật (§3.3 luật 5).
 *
 * Đây là danh sách phải đọc trước khi soạn bất cứ bài Kotlin nào: bài chạm tới điểm nào thì
 * PHẢI nói ra điểm đó, không được im lặng để học viên tưởng bộ chạy và kotlinc giống hệt nhau.
 */
export const KHAC_BIET = [
  {
    diem: 'Thời điểm bắt lỗi kiểu',
    boChay: 'Kiểm LÚC CHẠY — lỗi hiện ra khi dòng đó được thực thi.',
    kotlinThat: 'Kiểm LÚC BIÊN DỊCH — chương trình sai kiểu thì không chạy được dòng nào.',
    viSao:
      'Viết bộ kiểm kiểu tĩnh đầy đủ là một dự án riêng. Đổi lại, thông báo lỗi ở đây chỉ đúng số dòng và viết bằng tiếng Việt, dễ hơn hẳn cho người mới.',
  },
  {
    diem: 'Tính null của biến',
    boChay:
      'Theo dõi theo KIỂU KHAI BÁO: ô khai `T?` thì dùng thẳng dấu `.` là lỗi, kể cả khi giá trị lúc đó khác null.',
    kotlinThat: 'Y HỆT — đây là chỗ bộ chạy cố ý bám sát, vì nó là trụ cột của ngôn ngữ.',
    viSao:
      'Nếu chỉ hỏi "giá trị lúc này có null không" thì `s.length` sẽ chạy ngon mỗi khi s khác null, và dạy sai đúng nhóm người dễ sai nhất.',
  },
  {
    diem: 'Phạm vi smart cast',
    boChay: 'Chỉ suy ra từ `x != null` / `x == null` (kèm `&&`) và `is Kieu` trong `when`.',
    kotlinThat: 'Suy ra rộng hơn nhiều, gồm cả sau `return`/`throw` ở nhánh trước và qua `?:`.',
    viSao:
      'Suy sai còn tệ hơn không suy. Bài học nào cần mẫu ngoài phạm vi này thì phải viết `!!` hoặc `?:` cho tường minh.',
  },
  {
    diem: 'Thứ tự duyệt Map',
    boChay: 'Sắp theo khoá, tất định.',
    kotlinThat: '`mapOf`/`mutableMapOf` giữ THỨ TỰ CHÈN (LinkedHashMap) — khác với bộ chạy này.',
    viSao:
      'Bài học phải chấm được và phải cho cùng kết quả mọi lần. Hệ quả bắt buộc: không bài nào được dạy rằng Map giữ thứ tự chèn.',
  },
  {
    diem: 'Thuộc tính tính (`val x get() = …`)',
    boChay: 'Tính MỘT LẦN lúc tạo đối tượng.',
    kotlinThat: 'Tính LẠI mỗi lần đọc.',
    viSao:
      'Đủ cho mọi bài của khoá, nơi thuộc tính tính chỉ dẫn xuất từ dữ liệu không đổi. Bài nào cần tính lại theo trạng thái thay đổi thì phải dùng hàm.',
  },
  {
    diem: '`super` với THUỘC TÍNH',
    boChay: '`super.f()` (hàm) chạy đúng; `super.x` với x là thuộc tính bị ghi đè thì báo lỗi.',
    kotlinThat: '`super.x` lấy được giá trị bản khai ở lớp cha.',
    viSao:
      'Bộ chạy giữ MỘT ô nhớ cho mỗi tên thuộc tính, nên bản ghi đè thay chỗ bản của cha — không còn gì để trả về. Báo lỗi thẳng còn hơn trả âm thầm giá trị của lớp con.',
  },
  {
    diem: 'Tràn số nguyên',
    boChay: 'Dùng số của JavaScript — số rất lớn mất độ chính xác thay vì tràn vòng.',
    kotlinThat: 'Int 32-bit tràn vòng, Long 64-bit.',
    viSao: 'Bài học không đụng tới ngưỡng đó; nếu có thì phải nói ra.',
  },
] as const

export interface KotlinRunResult {
  output: string
  /** Lỗi ĐỘNG CƠ hoặc lỗi chương trình — thứ khiến lượt chạy không hoàn tất. */
  error?: string
}

/**
 * Chạy một chương trình Kotlin rút gọn.
 *
 * `dongVao` giữ chỗ cho bài có nhập liệu; bộ chạy chưa có `readLine()` (không có stdin trong
 * trình duyệt cho mạch này), nên tham số nhận vào để chữ ký ổn định với runner nhưng chưa dùng
 * — bài Kotlin lấy dữ liệu từ hằng trong đề, đúng như ví dụ trong sách Kotlin.
 */
export function chayKotlin(
  src: string,
  dongVao: string[] = [],
  tc: TuyChonChay = {},
): KotlinRunResult {
  void dongVao // giữ chỗ cho bài có nhập liệu — xem ghi chú trên
  const bo = new BoChay(tc)
  try {
    const ra = bo.chay(src)
    return { output: DONG_TU_KHAI + '\n' + ra }
  } catch (e) {
    if (e instanceof LoiKotlin) {
      const msg = `dong ${e.dong}: ${e.message}`
      return { output: `${DONG_TU_KHAI}\n${msg}\n`, error: msg }
    }
    if (e instanceof LoiNem) {
      // Ngoại lệ ném ra mà không ai bắt — Kotlin thật dừng chương trình y như vậy.
      const msg = `dong ${e.dong}: Exception "${inGia(e.gia)}" duoc nem ra nhung khong co "try { … } catch { … }" nao bat.`
      return { output: `${DONG_TU_KHAI}\n${msg}\n`, error: msg }
    }
    throw e
  }
}
