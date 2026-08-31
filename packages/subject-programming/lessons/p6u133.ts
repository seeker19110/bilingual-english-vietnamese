// lessons/p6u133.ts — P6-U133: HƯỚNG DI ĐỘNG, chặng S1 — Điều hướng & trạng thái CỘNG lưu
// trữ cục bộ (gộp module `mobile-s1-m3` + `mobile-s1-m4`).
//
// Vì sao gộp hai module: cả hai cùng trả lời MỘT câu hỏi — "cái gì phải sống sót, và sống sót
// ở đâu?". m3 lo phần sống sót TRONG MỘT PHIÊN (ngăn xếp màn hình, trạng thái khi xoay máy);
// m4 lo phần sống sót QUA CÁC PHIÊN (kho cục bộ, migration, keystore). Tách ra thành hai unit
// sẽ dạy hai nửa của cùng một quyết định ở hai chỗ khác nhau. Đúng tiền lệ `web-s1`,
// `backend-s2/s3/s4`, `data-s2` gộp module khi hai module cùng một câu hỏi sư phạm.
//
// Làn `typescript` (lý do đầy đủ ghi ở đầu `p6u131.ts`): ngăn xếp điều hướng và chuỗi
// migration đều là cấu trúc dữ liệu thuần, đúng như nhau ở Navigation Compose, SwiftUI
// NavigationStack và React Navigation.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U133_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u133-l1',
    unitId: 'p6-u133',
    language: 'typescript',
    title: 'Ngăn xếp điều hướng — nút Back là một cấu trúc dữ liệu, không phải một mẹo',
    hook: 'Người dùng bấm vào thông báo "Hoá đơn tháng 8 đã tới" và app mở thẳng màn hình hoá đơn. Họ xem xong, bấm Back — và app đóng luôn, về màn hình chính của điện thoại. Đúng ra Back phải đưa họ về danh sách hoá đơn. Lỗi này không nằm ở nút Back: nó nằm ở chỗ deep link đã đặt vào ngăn xếp đúng một màn hình thay vì cả đường đi tới nó.',
    theory:
      'Điều hướng trên di động là một NGĂN XẾP (stack) màn hình, và đó là toàn bộ mô hình cần nhớ. Màn hình mới chồng lên trên; nút Back của hệ thống lấy màn trên cùng ra. Ngăn xếp không bao giờ được rỗng — rỗng nghĩa là app thoát.\n\nBốn thao tác đủ dùng cho gần như mọi app:\n\n- **push**: chồng một màn mới lên trên. Đây là thao tác thường gặp nhất (bấm vào một dòng để xem chi tiết).\n- **pop**: bỏ màn trên cùng, quay về màn dưới nó. Chính là nút Back.\n- **replace**: thay màn trên cùng bằng màn khác, KHÔNG làm ngăn xếp dài thêm. Dùng cho những nơi mà quay lại là vô nghĩa — đăng nhập xong thì thay bằng màn chính, chứ push thì Back sẽ đưa người dùng trở về màn đăng nhập vừa xong.\n- **popToRoot**: bỏ hết chỉ giữ màn gốc. Dùng khi kết thúc một quy trình dài (thanh toán xong thì về đầu).\n\nĐIỀU HƯỚNG SÂU (deep link) là chỗ hay sai nhất, và bài học của nó tinh tế: khi người dùng vào app từ thông báo hoặc từ một đường liên kết, bạn phải DỰNG LẠI CẢ NGĂN XẾP hợp lý dẫn tới màn đích, không phải chỉ đặt màn đích vào. Lý do là nút Back trên di động không có khái niệm "lịch sử trình duyệt" để lùi về — nó chỉ biết lấy phần tử trên cùng của ngăn xếp ra. Ngăn xếp chỉ có một màn thì Back là thoát app, đúng như trong móc thực tế ở trên.\n\nCÒN TRẠNG THÁI KHI XOAY MÁY: xoay ngang màn hình trên Android khiến hệ điều hành huỷ và dựng lại toàn bộ màn hình đó. Mọi biến nằm trong lớp giao diện biến mất. Đây là chỗ khái niệm ViewModel (hoặc lớp giữ trạng thái tương đương ở nền tảng khác) tồn tại: nó SỐNG LÂU HƠN màn hình, nên trạng thái đặt trong đó sống sót qua lần xoay. Luật thi hành rút gọn: dữ liệu người dùng đã nhập và kết quả đã tải về thuộc về ViewModel, còn thứ thuộc về lớp giao diện chỉ là những cái vẽ lại được từ ViewModel.\n\nVÀ MỘT LUẬT CẤM: đừng truyền dữ liệu giữa các màn bằng biến toàn cục. Nó chạy được lúc thử, rồi hỏng đúng trong ba ca — mở hai màn cùng loại chồng nhau (biến toàn cục chỉ có một chỗ, màn sau đè màn trước), quay lại từ deep link (biến toàn cục chưa được ai đặt), và app bị giết rồi khôi phục (biến toàn cục đã reset về rỗng). Cách đúng là truyền ĐỊNH DANH qua tham số điều hướng, rồi màn đích tự lấy dữ liệu từ kho theo định danh đó — nhờ vậy màn đích luôn tự dựng lại được từ chính tham số của nó.',
    workedExample: {
      code: `// Ngan xep man hinh. Man dau tien ("Home") la GOC, khong bao gio bo di.
function dieuHuong(thaoTac: string[]): string[] {
  const nx: string[] = ["Home"]
  for (const t of thaoTac) {
    if (t.startsWith("push:")) {
      nx.push(t.slice(5))                       // chong man moi len tren
    } else if (t === "pop") {
      if (nx.length > 1) nx.pop()               // Back: nhung KHONG bao gio de rong
    } else if (t.startsWith("replace:")) {
      nx[nx.length - 1] = t.slice(8)            // thay man tren cung, khong dai them
    } else if (t === "popToRoot") {
      nx.length = 1                             // ve man goc, ket thuc quy trinh dai
    } else if (t.startsWith("deep:")) {
      const duong = t.slice(5).split(">")       // deep link: DUNG LAI CA duong di
      nx.length = 0
      for (const m of duong) nx.push(m)
    }
  }
  return nx
}

console.log("Vao chi tiet:", dieuHuong(["push:List", "push:Detail"]).join(" > "))
console.log("Bam Back    :", dieuHuong(["push:List", "push:Detail", "pop"]).join(" > "))
console.log("Dang nhap   :", dieuHuong(["push:Login", "replace:Main"]).join(" > "))
console.log("Deep link   :", dieuHuong(["deep:Home>Bill>Item"]).join(" > "))`,
      stdinLines: [],
    },
    predict: {
      code: `function dieuHuong(thaoTac: string[]): string[] {
  const nx: string[] = ["Home"]
  for (const t of thaoTac) {
    if (t.startsWith("push:")) nx.push(t.slice(5))
    else if (t === "pop") { if (nx.length > 1) nx.pop() }
    else if (t.startsWith("replace:")) nx[nx.length - 1] = t.slice(8)
    else if (t.startsWith("deep:")) {
      const duong = t.slice(5).split(">")
      nx.length = 0
      for (const m of duong) nx.push(m)
    }
  }
  return nx
}
console.log("[" + dieuHuong(["deep:Home>Bill>Item", "pop"]).join(">") + "]")`,
      question:
        'Vào app từ deep link "Home>Bill>Item" rồi bấm Back một lần. Ngăn xếp còn lại là gì?',
      choices: ['[Home>Bill]', '[Home]', '[Home>Bill>Item]', '[Bill>Item]'],
      answerIndex: 0,
      explain:
        'Deep link dựng lại CẢ ba màn, nên bấm Back chỉ bỏ màn trên cùng ("Item") và người dùng về đúng danh sách hoá đơn — đúng thứ họ mong đợi. Nếu deep link chỉ đặt một màn "Item" vào ngăn xếp thì Back sẽ gặp ngăn xếp một phần tử và app thoát: đúng lỗi mô tả ở đầu bài.',
    },
    parsons: {
      prompt:
        'Xếp lại nhánh xử lý deep link: cắt lấy đường đi, xoá sạch ngăn xếp cũ, rồi đẩy lần lượt từng màn của đường đi vào.',
      lines: [
        'else if (t.startsWith("deep:")) {',
        '  const duong = t.slice(5).split(">")',
        '  nx.length = 0',
        '  for (const m of duong) nx.push(m)',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm dieuHuong(thaoTac) trả về ngăn xếp màn hình dưới dạng mảng chuỗi. Ngăn xếp bắt đầu là ["Home"].\n\nXử lý 5 loại thao tác:\n- "push:X" — chồng màn X lên trên.\n- "pop" — bỏ màn trên cùng, NHƯNG chỉ khi ngăn xếp còn nhiều hơn 1 màn (không bao giờ để rỗng).\n- "replace:X" — thay màn trên cùng bằng X, ngăn xếp không dài thêm.\n- "popToRoot" — chỉ giữ lại màn đầu tiên.\n- "deep:A>B>C" — xoá sạch ngăn xếp rồi dựng lại đúng đường đi A, B, C.\n\nDùng starter code có sẵn (đừng sửa phần dưới).',
      starterCode: `function dieuHuong(thaoTac: string[]): string[] {
  const nx: string[] = ["Home"]
  // TODO: xu ly 5 loai thao tac
  return nx
}

// ---- Đừng sửa phần dưới đây ----
console.log("Ca 1:", dieuHuong(["push:List", "push:Detail"]).join(" > "))
console.log("Ca 2:", dieuHuong(["push:List", "push:Detail", "pop"]).join(" > "))
console.log("Ca 3:", dieuHuong(["pop", "pop"]).join(" > "))
console.log("Ca 4:", dieuHuong(["push:Login", "replace:Main"]).join(" > "))
console.log("Ca 5:", dieuHuong(["push:A", "push:B", "popToRoot"]).join(" > "))
console.log("Ca 6:", dieuHuong(["push:A", "deep:Home>Bill>Item", "pop"]).join(" > "))`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Ca 1: Home > List > Detail',
          match: 'contains',
          hidden: false,
          label: 'push hai lần: ngăn xếp dài ra đúng thứ tự',
        },
        {
          stdinLines: [],
          expected: 'Ca 2: Home > List',
          match: 'contains',
          hidden: false,
          label: 'Back bỏ đúng màn trên cùng',
        },
        {
          stdinLines: [],
          expected: 'Ca 3: Home',
          match: 'contains',
          hidden: false,
          label: 'Back ở màn gốc không làm ngăn xếp rỗng',
        },
        {
          stdinLines: [],
          expected: 'Ca 4: Home > Main',
          match: 'contains',
          hidden: false,
          label: 'replace thay màn Login, Back không quay về màn đăng nhập vừa xong',
        },
        {
          stdinLines: [],
          expected: 'Ca 5: Home',
          match: 'contains',
          hidden: false,
          label: 'popToRoot bỏ hết chỉ giữ màn gốc',
        },
        {
          stdinLines: [],
          expected: 'Ca 6: Home > Bill',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: deep link dựng lại cả đường đi nên Back về danh sách chứ không thoát app',
        },
      ],
      hints: [
        'Dùng t.startsWith("push:") rồi t.slice(5) để lấy phần tên màn; với "replace:" thì slice(8).',
        'Nhánh "pop" phải có điều kiện nx.length > 1 — thiếu nó là Ca 3 trả về mảng rỗng và app thoát.',
        'Nhánh "deep:" gồm ba việc theo đúng thứ tự: tách đường đi bằng split(">"), xoá ngăn xếp cũ (nx.length = 0), rồi push lần lượt từng màn. Xoá trước, push sau — làm ngược lại là ngăn xếp cũ vẫn còn nguyên ở dưới.',
      ],
      sampleSolution: `function dieuHuong(thaoTac: string[]): string[] {
  const nx: string[] = ["Home"]
  for (const t of thaoTac) {
    if (t.startsWith("push:")) {
      nx.push(t.slice(5))
    } else if (t === "pop") {
      if (nx.length > 1) nx.pop()
    } else if (t.startsWith("replace:")) {
      nx[nx.length - 1] = t.slice(8)
    } else if (t === "popToRoot") {
      nx.length = 1
    } else if (t.startsWith("deep:")) {
      const duong = t.slice(5).split(">")
      nx.length = 0
      for (const m of duong) nx.push(m)
    }
  }
  return nx
}

// ---- Đừng sửa phần dưới đây ----
console.log("Ca 1:", dieuHuong(["push:List", "push:Detail"]).join(" > "))
console.log("Ca 2:", dieuHuong(["push:List", "push:Detail", "pop"]).join(" > "))
console.log("Ca 3:", dieuHuong(["pop", "pop"]).join(" > "))
console.log("Ca 4:", dieuHuong(["push:Login", "replace:Main"]).join(" > "))
console.log("Ca 5:", dieuHuong(["push:A", "push:B", "popToRoot"]).join(" > "))
console.log("Ca 6:", dieuHuong(["push:A", "deep:Home>Bill>Item", "pop"]).join(" > "))`,
    },
    homework:
      'Vẽ ra giấy ngăn xếp màn hình của app sổ chi tiêu bạn định làm, cho ba đường đi: (1) mở app rồi thêm một khoản mới, (2) bấm vào thông báo nhắc "chưa ghi chi tiêu hôm nay", (3) đăng nhập lần đầu. Với mỗi đường, ghi rõ thao tác nào là push, cái nào phải là replace, và deep link phải dựng lại những màn nào. Chỗ nào bạn thấy phân vân giữa push và replace, hãy tự hỏi: "bấm Back ở đây thì người dùng MONG chờ về đâu?"',
    srsCards: [
      {
        hoi: 'Khi nào dùng replace thay vì push khi điều hướng?',
        dap: 'Khi quay lại màn hiện tại là vô nghĩa hoặc sai — ví dụ đăng nhập xong thì replace bằng màn chính, vì push sẽ khiến nút Back đưa người dùng trở về màn đăng nhập họ vừa hoàn tất.',
      },
      {
        hoi: 'Vì sao deep link phải dựng lại cả ngăn xếp chứ không chỉ đặt màn đích vào?',
        dap: 'Vì nút Back trên di động chỉ lấy phần tử trên cùng của ngăn xếp ra, không có lịch sử nào khác để lùi về. Ngăn xếp chỉ có một màn thì Back sẽ thoát app thay vì đưa người dùng về màn cha hợp lý.',
      },
      {
        hoi: 'Truyền dữ liệu giữa các màn bằng biến toàn cục hỏng ở đâu?',
        dap: 'Hỏng ở ba ca: hai màn cùng loại chồng nhau (biến chỉ có một chỗ, màn sau đè màn trước), vào từ deep link (chưa ai đặt biến), và app bị giết rồi khôi phục (biến đã reset). Cách đúng là truyền định danh qua tham số điều hướng rồi màn đích tự lấy dữ liệu từ kho.',
      },
    ],
  },
  {
    id: 'p6-u133-l2',
    unitId: 'p6-u133',
    language: 'typescript',
    title: 'Migration kho cục bộ — người dùng bản sáu tháng trước vẫn phải nâng cấp được',
    hook: 'Bạn đổi tên một cột trong cơ sở dữ liệu trên máy, phát hành bản mới, mọi thứ chạy tốt. Ba tuần sau, một người dùng đang xài bản từ sáu tháng trước cập nhật app — và app văng ngay khi mở, không cách nào vào được. Trên máy chủ bạn chạy migration một lần là xong; trên điện thoại, cơ sở dữ liệu nằm ở MÁY NGƯỜI DÙNG, và bạn không biết họ đang ở phiên bản nào.',
    theory:
      'Lưu trữ cục bộ trên di động có ba tầng, và chọn sai tầng là một quyết định đắt về sau:\n\n- **Khoá-giá trị** (SharedPreferences, UserDefaults, AsyncStorage): vài chục giá trị nhỏ như cỡ chữ, chế độ tối, đã xem hướng dẫn chưa. Đọc nhanh, không truy vấn được. Nhét danh sách hàng nghìn bản ghi vào đây là sai tầng — mỗi lần đọc là nạp và phân tích lại toàn bộ.\n- **Cơ sở dữ liệu quan hệ** (SQLite qua Room, Core Data, hoặc thư viện tương đương): dữ liệu nghiệp vụ có cấu trúc, cần lọc, sắp xếp, phân trang. Đây là chỗ của danh sách chi tiêu.\n- **Kho khoá bảo mật** (Keystore của Android, Keychain của iOS): mã thông báo đăng nhập, khoá mã hoá, bất cứ thứ gì lộ ra là hại người dùng. Tầng này được phần cứng bảo vệ và KHÔNG bị sao lưu tuỳ tiện sang máy khác. Luật cứng: mã thông báo đăng nhập không bao giờ nằm ở tầng khoá-giá trị thường.\n\nPHẦN KHÓ THẬT SỰ là MIGRATION. Trên máy chủ bạn kiểm soát mọi cơ sở dữ liệu và chạy migration đúng một lần. Trên di động, mỗi người dùng giữ một bản riêng, ở một phiên bản riêng, và có người bỏ app cả năm rồi mới cập nhật. Không có ai để bạn "chạy tay" cho họ.\n\nCách làm đúng đã thành chuẩn ngành, và nó đơn giản một cách bất ngờ: gắn cho dữ liệu một SỐ PHIÊN BẢN, rồi viết các bước migration mà mỗi bước chỉ biết NHẢY ĐÚNG MỘT BẬC — bước 1 đưa từ 1 lên 2, bước 2 đưa từ 2 lên 3, và cứ thế. Lúc mở app, chạy TUẦN TỰ mọi bước từ phiên bản đang có tới phiên bản mới nhất. Người dùng ở bản 1 thì chạy ba bước; người dùng ở bản 3 chỉ chạy một bước; ai đã ở bản mới nhất thì không bước nào chạy. Nhờ đó bạn không bao giờ phải viết một hàm "từ bản bất kỳ lên bản mới nhất" — thứ mà số nhánh phải xử lý sẽ nổ tung theo mỗi lần phát hành.\n\nHai bất biến bắt buộc, và chúng đều kiểm được bằng test:\n\n1. **Lũy đẳng**: chạy nâng cấp trên dữ liệu đã ở phiên bản mới nhất phải KHÔNG đổi gì. Vòng lặp dừng ngay vì điều kiện không còn đúng.\n2. **Không bỏ bậc**: mỗi bước chỉ tăng đúng một phiên bản. Viết một bước nhảy từ 1 thẳng lên 4 là ngay lập tức bỏ rơi người dùng đang ở bản 2 và bản 3.\n\nMột lời khuyên thực dụng cuối: mỗi bước migration nên GIỮ được dữ liệu cũ chứ không xoá. Đổi tên cột thì chép sang cột mới rồi mới bỏ cột cũ ở một phiên bản SAU — vì nếu bước migration có lỗi, dữ liệu đã xoá trên máy người dùng thì không ai lấy lại được.',
    workedExample: {
      code: `interface BanGhi {
  phienBan: number
  [khoa: string]: string | number
}

const MOI_NHAT = 4

// Moi buoc chi biet nhay DUNG MOT BAC. BUOC[0]: 1 -> 2, BUOC[1]: 2 -> 3, BUOC[2]: 3 -> 4.
const BUOC: ((b: BanGhi) => BanGhi)[] = [
  (b) => {
    const { ten, ...conLai } = b              // v1 -> v2: doi ten "ten" thanh "tenKhoan"
    return { ...conLai, tenKhoan: String(ten), phienBan: 2 }
  },
  (b) => ({ ...b, loaiTien: "VND", phienBan: 3 }),        // v2 -> v3: them truong moi co mac dinh
  (b) => ({ ...b, soTien: Number(b.soTien), phienBan: 4 }), // v3 -> v4: chuoi -> so
]

function nangCap(ban: BanGhi): BanGhi {
  let kq = ban
  while (kq.phienBan < MOI_NHAT) {
    kq = BUOC[kq.phienBan - 1]!(kq) // chay TUAN TU, khong nhay bac
  }
  return kq
}

// In on dinh: sap khoa theo bang chu cai de ket qua khong phu thuoc thu tu chen.
function moTa(b: BanGhi): string {
  return Object.keys(b).sort().map((k) => k + "=" + b[k]).join(",")
}

console.log("Tu v1:", moTa(nangCap({ phienBan: 1, ten: "Ca phe", soTien: "25000" })))
console.log("Tu v3:", moTa(nangCap({ phienBan: 3, tenKhoan: "Xe bus", loaiTien: "VND", soTien: "7000" })))`,
      stdinLines: [],
    },
    predict: {
      code: `interface BanGhi {
  phienBan: number
  [khoa: string]: string | number
}
const MOI_NHAT = 4
const BUOC: ((b: BanGhi) => BanGhi)[] = [
  (b) => ({ ...b, phienBan: 2 }),
  (b) => ({ ...b, loaiTien: "VND", phienBan: 3 }),
  (b) => ({ ...b, phienBan: 4 }),
]
function nangCap(ban: BanGhi): BanGhi {
  let kq = ban
  let soBuoc = 0
  while (kq.phienBan < MOI_NHAT) {
    kq = BUOC[kq.phienBan - 1]!(kq)
    soBuoc += 1
  }
  return { ...kq, soBuoc }
}
console.log(nangCap({ phienBan: 4, tenKhoan: "Com" }).soBuoc)`,
      question: 'Bản ghi đã ở phiên bản mới nhất (4). Chạy nâng cấp thì mấy bước migration chạy?',
      choices: ['0', '1', '3', '4'],
      answerIndex: 0,
      explain:
        'Điều kiện vòng lặp (phienBan nhỏ hơn MOI_NHAT) sai ngay từ đầu nên không bước nào chạy, dữ liệu giữ nguyên. Đó chính là tính LŨY ĐẲNG: mở app lần thứ hai, thứ mười cũng không làm hỏng dữ liệu. Nếu nâng cấp được viết kiểu "cứ chạy hết mọi bước" thay vì kiểm phiên bản, mỗi lần mở app sẽ chuyển đổi lại dữ liệu đã chuyển đổi rồi — và với bước đổi kiểu chuỗi sang số thì lần thứ hai sẽ ra NaN.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm nâng cấp chạy tuần tự từng bậc cho tới phiên bản mới nhất, dừng đúng lúc.',
      lines: [
        'function nangCap(ban: BanGhi): BanGhi {',
        '  let kq = ban',
        '  while (kq.phienBan < MOI_NHAT) {',
        '    kq = BUOC[kq.phienBan - 1]!(kq)',
        '  }',
        '  return kq',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết bộ nâng cấp kho cục bộ chạy tuần tự từng bậc, có sẵn ba bước migration.\n\n- nangCap(ban): chừng nào ban.phienBan còn nhỏ hơn MOI_NHAT (bằng 4) thì gọi BUOC[phienBan - 1] để nhảy đúng một bậc; hết thì trả kết quả. Bản ghi đã ở phiên bản mới nhất phải trả về nguyên vẹn (lũy đẳng).\n- moTa(b): sắp các khoá theo bảng chữ cái rồi nối thành "khoa=giatri" cách nhau bằng dấu phẩy — để kết quả in ra ổn định, không phụ thuộc thứ tự chèn.\n\nDùng starter code có sẵn (đừng sửa phần dưới).',
      starterCode: `interface BanGhi {
  phienBan: number
  [khoa: string]: string | number
}

const MOI_NHAT = 4

const BUOC: ((b: BanGhi) => BanGhi)[] = [
  (b) => {
    const { ten, ...conLai } = b
    return { ...conLai, tenKhoan: String(ten), phienBan: 2 }
  },
  (b) => ({ ...b, loaiTien: "VND", phienBan: 3 }),
  (b) => ({ ...b, soTien: Number(b.soTien), phienBan: 4 }),
]

function nangCap(ban: BanGhi): BanGhi {
  // TODO: chay tuan tu tung bac cho toi MOI_NHAT
  return ban
}

function moTa(b: BanGhi): string {
  // TODO: sap khoa theo bang chu cai roi noi "khoa=giatri" cach nhau bang dau phay
  return ""
}

// ---- Đừng sửa phần dưới đây ----
console.log("Tu v1:", moTa(nangCap({ phienBan: 1, ten: "Ca phe", soTien: "25000" })))
console.log("Tu v3:", moTa(nangCap({ phienBan: 3, tenKhoan: "Xe bus", loaiTien: "VND", soTien: "7000" })))
const daMoi = { phienBan: 4, tenKhoan: "Com trua", loaiTien: "VND", soTien: 45000 }
console.log("Da moi:", moTa(nangCap(daMoi)) === moTa(daMoi) ? "khong doi" : "bi doi")`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Tu v1: loaiTien=VND,phienBan=4,soTien=25000,tenKhoan=Ca phe',
          match: 'contains',
          hidden: false,
          label:
            'Bản cũ nhất (v1) chạy đủ ba bước: đổi tên trường, thêm loại tiền, đổi kiểu số tiền',
        },
        {
          stdinLines: [],
          expected: 'Tu v3: loaiTien=VND,phienBan=4,soTien=7000,tenKhoan=Xe bus',
          match: 'contains',
          hidden: false,
          label: 'Bản v3 chỉ chạy đúng một bước còn thiếu, không chạy lại bước cũ',
        },
        {
          stdinLines: [],
          expected: 'Da moi: khong doi',
          match: 'contains',
          hidden: false,
          label: 'Lũy đẳng: bản ghi đã mới nhất thì nâng cấp không đổi gì',
        },
        {
          stdinLines: [],
          expected:
            'Tu v1: loaiTien=VND,phienBan=4,soTien=25000,tenKhoan=Ca phe\nTu v3: loaiTien=VND,phienBan=4,soTien=7000,tenKhoan=Xe bus\nDa moi: khong doi',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: cả ba dòng đúng thứ tự (chống hardcode từng dòng riêng lẻ)',
        },
      ],
      hints: [
        'nangCap: một vòng while với điều kiện kq.phienBan < MOI_NHAT. Chỉ số bước cần dùng là kq.phienBan - 1, vì BUOC[0] lo bậc 1 lên 2.',
        'moTa: Object.keys(b).sort() cho danh sách khoá đã sắp, rồi map sang chuỗi "khoa=" + b[khoa], rồi join(",").',
        'Bẫy lũy đẳng: đừng viết vòng for chạy đủ ba bước bất kể phiên bản. Bản ghi đã ở v4 mà chạy lại bước đổi kiểu sẽ ra kết quả sai, và test "Da moi" bắt đúng lỗi đó.',
      ],
      sampleSolution: `interface BanGhi {
  phienBan: number
  [khoa: string]: string | number
}

const MOI_NHAT = 4

const BUOC: ((b: BanGhi) => BanGhi)[] = [
  (b) => {
    const { ten, ...conLai } = b
    return { ...conLai, tenKhoan: String(ten), phienBan: 2 }
  },
  (b) => ({ ...b, loaiTien: "VND", phienBan: 3 }),
  (b) => ({ ...b, soTien: Number(b.soTien), phienBan: 4 }),
]

function nangCap(ban: BanGhi): BanGhi {
  let kq = ban
  while (kq.phienBan < MOI_NHAT) {
    kq = BUOC[kq.phienBan - 1]!(kq)
  }
  return kq
}

function moTa(b: BanGhi): string {
  return Object.keys(b)
    .sort()
    .map((k) => k + "=" + b[k])
    .join(",")
}

// ---- Đừng sửa phần dưới đây ----
console.log("Tu v1:", moTa(nangCap({ phienBan: 1, ten: "Ca phe", soTien: "25000" })))
console.log("Tu v3:", moTa(nangCap({ phienBan: 3, tenKhoan: "Xe bus", loaiTien: "VND", soTien: "7000" })))
const daMoi = { phienBan: 4, tenKhoan: "Com trua", loaiTien: "VND", soTien: 45000 }
console.log("Da moi:", moTa(nangCap(daMoi)) === moTa(daMoi) ? "khong doi" : "bi doi")`,
    },
    homework:
      'Liệt kê mọi thứ app sổ chi tiêu của bạn cần lưu, rồi xếp từng thứ vào đúng một trong ba tầng: khoá-giá trị, cơ sở dữ liệu quan hệ, kho khoá bảo mật. Với tầng cơ sở dữ liệu, viết ra bảng đầu tiên của bạn ở phiên bản 1, rồi tưởng tượng ba tháng nữa bạn muốn thêm trường "danh mục" — viết bước migration v1 lên v2 cho nó. Giá trị mặc định của trường mới là gì cho những bản ghi đã có? Không có câu trả lời cho câu đó nghĩa là bước migration chưa viết được.',
    srsCards: [
      {
        hoi: 'Vì sao migration trên di động khó hơn trên máy chủ?',
        dap: 'Vì cơ sở dữ liệu nằm trên máy từng người dùng, mỗi người ở một phiên bản khác nhau và có người bỏ app cả năm mới cập nhật. Không có ai chạy tay cho họ, nên nâng cấp phải tự chạy đúng từ bất kỳ phiên bản cũ nào.',
      },
      {
        hoi: 'Vì sao mỗi bước migration chỉ được nhảy đúng một bậc phiên bản?',
        dap: 'Để mọi phiên bản cũ đều nâng cấp được bằng cách chạy tuần tự các bước, thay vì phải viết một hàm "từ bản bất kỳ lên bản mới nhất" có số nhánh nổ tung theo mỗi lần phát hành. Bước nhảy nhiều bậc bỏ rơi người dùng ở các bậc trung gian.',
      },
      {
        hoi: 'Ba tầng lưu trữ cục bộ trên di động dùng cho loại dữ liệu nào?',
        dap: 'Khoá-giá trị cho vài chục cài đặt nhỏ; cơ sở dữ liệu quan hệ (SQLite/Room/Core Data) cho dữ liệu nghiệp vụ có cấu trúc cần lọc và sắp xếp; kho khoá bảo mật (Keystore/Keychain) cho mã thông báo đăng nhập và khoá mã hoá.',
      },
    ],
  },
]
