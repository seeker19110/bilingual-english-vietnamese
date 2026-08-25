// projectStepsP3 — DỰ ÁN TRỤC T1 "Cửa hàng của tôi", CHẶNG P3 "Lên web" (PR-L8).
// Đặc tả: dac-ta-du-an-xuyen-suot-mon-lap-trinh-2026-08-24.md §3 chặng P3 — "Trang giới thiệu
// cửa hàng (HTML/CSS, mobile-first) · trang đặt hàng chạy JS trong trình duyệt · chuyển kho
// dữ liệu sang SQL, viết truy vấn báo cáo · milestone: web tĩnh chạy được + kho dữ liệu SQL".
//
// KHÁC HAI CHẶNG TRƯỚC Ở CHỖ: chặng P1/P2 thuần Python, chặng này mỗi bước một ngôn ngữ khác
// nhau (html → html/CSS → dom → sql → fetch) — đúng như nghề thật, và là lý do ProjectStep có
// thêm trường `language` (projectSteps.ts). Mỗi bước dùng đúng bộ chạy của bài học tương ứng,
// nên không có engine nào mới phải nuôi.
//
// File làm việc: cửa hàng lên web nên workspace có thêm `trang.html` (bước 1–2), `dat_hang.js`
// (bước 3, 5) và `bao_cao.sql` (bước 4). Code Python của P1/P2 KHÔNG bị đụng tới — dự án lớn
// thêm, không đập đi xây lại.
//
// Mọi dòng chấm điểm in KHÔNG DẤU, như hai chặng trước.
import { TestCaseSchema, type ProgrammingTestCase } from './lessonTypes.js'
import type { ProjectStep } from './projectSteps.js'

export const P3_PAGE_FILE = 'trang.html'
export const P3_ORDER_FILE = 'dat_hang.js'
export const P3_REPORT_FILE = 'bao_cao.sql'

const tc = (
  stdinLines: string[],
  expected: string,
  label: string,
  hidden = false,
  match: 'contains' | 'exact' = 'contains',
): ProgrammingTestCase => TestCaseSchema.parse({ stdinLines, expected, label, hidden, match })

/** Trang đặt hàng có sẵn của bước 3 và 5 — học viên KHÔNG sửa, chỉ viết JavaScript. */
const TRANG_DAT_HANG = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Dat hang</title>
  </head>
  <body>
    <h1>Dat hang</h1>
    <ul id="menu"></ul>
    <label for="o-mon">Ten mon</label>
    <input id="o-mon" type="text" />
    <label for="o-sl">So luong</label>
    <input id="o-sl" type="number" />
    <button id="nut-them">Them vao gio</button>
    <ul id="gio"></ul>
    <p id="tong"></p>
  </body>
</html>`

export const P3_PROJECT_STEPS: ProjectStep[] = [
  {
    id: 'p3-s1',
    isMilestone: false,
    language: 'html',
    files: [P3_PAGE_FILE],
    title: 'Trang giới thiệu cửa hàng — HTML đúng chuẩn',
    unitId: 'p3-u4',
    requirement:
      'Cửa hàng của bạn lên web! Viết file trang.html giới thiệu quán:\n\n1. Khung trang chuẩn: <html lang="vi">, trong <head> có <meta charset="utf-8" /> (thiếu là tiếng Việt hiện thành ký tự lạ) và <title>Quan cua toi</title>.\n2. <h1> tên quán: Quan cua toi\n3. Một đoạn <p> giới thiệu ngắn, có class="gioi-thieu".\n4. Danh sách menu <ul class="menu"> với 3 thẻ <li>, mỗi món một dòng KHÔNG DẤU:\n   Tra da - 5000\n   Nuoc cam - 15000\n   Sua dau - 10000\n5. Một liên kết <a> tới trang đặt hàng: href="dat_hang.html", chữ "Dat hang".',
    hint: 'Khung trang: <!doctype html> rồi <html lang="vi"> chứa <head> (meta charset + title) và <body>. Class viết trong thẻ mở: <ul class="menu">. Liên kết: <a href="dat_hang.html">Dat hang</a>.',
    referenceCode: `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Quan cua toi</title>
  </head>
  <body>
    <h1>Quan cua toi</h1>
    <p class="gioi-thieu">Quan nho ban nuoc giai khat, mo cua tu 7h sang den 9h toi.</p>
    <ul class="menu">
      <li>Tra da - 5000</li>
      <li>Nuoc cam - 15000</li>
      <li>Sua dau - 10000</li>
    </ul>
    <a href="dat_hang.html">Dat hang</a>
  </body>
</html>`,
    checks: [
      tc([], 'html lang="vi"', 'Thẻ html khai báo ngôn ngữ tiếng Việt'),
      tc([], 'meta charset="utf-8"', 'Có khai báo bảng mã (tiếng Việt không bị lỗi phông)'),
      tc([], 'title "Quan cua toi"', 'Tiêu đề trang đúng'),
      tc([], 'h1 "Quan cua toi"', 'Tên quán là tiêu đề lớn nhất trang'),
      tc([], 'p class="gioi-thieu"', 'Đoạn giới thiệu có class đúng'),
      tc([], 'ul class="menu"', 'Menu là danh sách có class'),
      tc([], 'li "Nuoc cam - 15000"', 'Menu đủ món và giá'),
      tc([], 'a href="dat_hang.html" "Dat hang"', 'Ca ẩn: liên kết sang trang đặt hàng', true),
    ],
  },
  {
    id: 'p3-s2',
    isMilestone: false,
    language: 'html',
    files: [P3_PAGE_FILE],
    title: 'Làm đẹp bằng CSS — mobile-first cho khách xem bằng điện thoại',
    unitId: 'p3-u5',
    requirement:
      'Giữ NGUYÊN toàn bộ nội dung bước 1, thêm một thẻ <style> trong <head> với các luật sau (khách của bạn phần lớn xem bằng điện thoại — nên viết cho màn nhỏ trước):\n\n1. body: font-family: sans-serif; margin: 16px\n2. h1: color: #0a7d3c; font-size: 24px\n3. .menu: display: flex; flex-direction: column; gap: 8px; list-style: none; padding: 0\n4. .menu li: background: #f2f2f2; border-radius: 8px; padding: 12px\n5. a: display: inline-block; min-height: 44px\n\nLuật số 5 KHÔNG phải trang trí: 44px là vùng chạm tối thiểu để ngón tay bấm trúng trên điện thoại — nút nhỏ hơn thế là khách bấm trượt và bỏ đi.',
    hint: 'Đặt <style> ... </style> bên trong <head>, sau <title>. Mỗi luật viết dạng bo_chon { thuoc-tinh: gia-tri; }. Bộ chọn ".menu li" nghĩa là "mọi thẻ li nằm trong phần tử có class menu".',
    referenceCode: `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Quan cua toi</title>
    <style>
      body { font-family: sans-serif; margin: 16px; }
      h1 { color: #0a7d3c; font-size: 24px; }
      .menu { display: flex; flex-direction: column; gap: 8px; list-style: none; padding: 0; }
      .menu li { background: #f2f2f2; border-radius: 8px; padding: 12px; }
      a { display: inline-block; min-height: 44px; }
    </style>
  </head>
  <body>
    <h1>Quan cua toi</h1>
    <p class="gioi-thieu">Quan nho ban nuoc giai khat, mo cua tu 7h sang den 9h toi.</p>
    <ul class="menu">
      <li>Tra da - 5000</li>
      <li>Nuoc cam - 15000</li>
      <li>Sua dau - 10000</li>
    </ul>
    <a href="dat_hang.html">Dat hang</a>
  </body>
</html>`,
    checks: [
      tc([], 'body { font-family: sans-serif; margin: 16px }', 'Nền trang có phông và lề'),
      tc([], 'h1 { color: #0a7d3c; font-size: 24px }', 'Tiêu đề mang màu thương hiệu quán'),
      tc(
        [],
        '.menu { display: flex; flex-direction: column; gap: 8px; list-style: none; padding: 0 }',
        'Menu xếp dọc bằng flex, bỏ dấu chấm đầu dòng',
      ),
      tc(
        [],
        '.menu li { background: #f2f2f2; border-radius: 8px; padding: 12px }',
        'Mỗi món thành một thẻ bo tròn',
      ),
      tc([], 'a { display: inline-block; min-height: 44px }', 'Liên kết đủ 44px cho ngón tay'),
      tc([], 'li "Tra da - 5000"', 'Ca ẩn: nội dung bước 1 KHÔNG được mất khi thêm CSS', true),
    ],
  },
  {
    id: 'p3-s3',
    isMilestone: false,
    language: 'dom',
    files: [P3_ORDER_FILE],
    domHtml: TRANG_DAT_HANG,
    title: 'Trang đặt hàng chạy JavaScript — giỏ hàng cộng dồn',
    unitId: 'p3-u6',
    requirement:
      'Trang đặt hàng đã dựng sẵn (bạn KHÔNG sửa HTML, chỉ viết dat_hang.js):\n- ô #o-mon (tên món), ô #o-sl (số lượng), nút #nut-them\n- danh sách #menu, danh sách giỏ #gio, đoạn #tong\n\nMENU dùng lại đúng 3 món của quán: tra da 5000 · nuoc cam 15000 · sua dau 10000.\n\nYêu cầu:\n1. NGAY khi script chạy: render menu vào #menu, mỗi món một <li> dạng "<ten> - <gia>".\n2. Bấm #nut-them: đọc tên món + số lượng, rồi\n   - món có trong MENU → thêm một <li> vào #gio dạng "<ten> x<so luong> = <thanh tien>", và cập nhật #tong thành "Tong: <tong tien>" (CỘNG DỒN qua các lần bấm).\n   - món lạ → đặt #tong thành "Khong co mon nay" và KHÔNG thêm gì vào giỏ.\n3. Trang vừa tải xong: #gio rỗng và #tong trống.',
    hint: 'Khai báo const MENU = { "tra da": 5000, "nuoc cam": 15000, "sua dau": 10000 } rồi giữ một biến tong = 0 bên ngoài hàm xử lý — nhờ nằm ngoài nên nó SỐNG SÓT qua các lần bấm, đó chính là cách giỏ hàng cộng dồn.',
    referenceCode: `const MENU = { "tra da": 5000, "nuoc cam": 15000, "sua dau": 10000 }

const menuEl = document.getElementById("menu")
const gioEl = document.getElementById("gio")
const tongEl = document.getElementById("tong")

// Render menu ngay khi trang mở
for (const ten in MENU) {
  const li = document.createElement("li")
  li.textContent = ten + " - " + MENU[ten]
  menuEl.appendChild(li)
}

let tong = 0
document.getElementById("nut-them").addEventListener("click", () => {
  const ten = document.getElementById("o-mon").value.trim().toLowerCase()
  const soLuong = Number(document.getElementById("o-sl").value)
  if (!(ten in MENU)) {
    tongEl.textContent = "Khong co mon nay"
    return
  }
  const thanhTien = MENU[ten] * soLuong
  const li = document.createElement("li")
  li.textContent = ten + " x" + soLuong + " = " + thanhTien
  gioEl.appendChild(li)
  tong = tong + thanhTien
  tongEl.textContent = "Tong: " + tong
})`,
    checks: [
      tc([], 'li "nuoc cam - 15000"', 'Menu hiện ngay khi trang mở'),
      tc(
        ['dien #o-mon = tra da', 'dien #o-sl = 2', 'click #nut-them'],
        'li "tra da x2 = 10000"',
        'Thêm một món vào giỏ',
      ),
      tc(
        ['dien #o-mon = tra da', 'dien #o-sl = 2', 'click #nut-them'],
        'p id="tong" "Tong: 10000"',
        'Tổng tiền hiện đúng',
      ),
      tc(
        [
          'dien #o-mon = tra da',
          'dien #o-sl = 2',
          'click #nut-them',
          'dien #o-mon = nuoc cam',
          'dien #o-sl = 1',
          'click #nut-them',
        ],
        'p id="tong" "Tong: 25000"',
        'Giỏ CỘNG DỒN qua hai lần bấm',
      ),
      tc(
        ['dien #o-mon = ca phe', 'dien #o-sl = 1', 'click #nut-them'],
        'p id="tong" "Khong co mon nay"',
        'Ca ẩn: món lạ báo rõ, không thêm vào giỏ',
        true,
      ),
      tc(
        ['dien #o-mon = Sua Dau ', 'dien #o-sl = 3', 'click #nut-them'],
        'li "sua dau x3 = 30000"',
        'Ca ẩn: tên gõ hoa/thừa khoảng trắng vẫn nhận (như chặng P2)',
        true,
      ),
    ],
  },
  {
    id: 'p3-s4',
    isMilestone: false,
    language: 'sql',
    files: [P3_REPORT_FILE],
    title: 'Kho dữ liệu SQL — báo cáo doanh thu bằng một câu truy vấn',
    unitId: 'p3-u9',
    requirement:
      'Sổ CSV của chặng P2 đã hết đất dùng: muốn biết "món nào bán chạy nhất tháng này" mà dữ liệu nằm trong file văn bản thì phải tự viết vòng lặp cho từng câu hỏi. Kho dữ liệu SQL trả lời bằng MỘT câu.\n\nCSDL mẫu của quán đã có sẵn 3 bảng: mon(id, ten, nhom, gia) · don_hang(id, ngay, ban) · chi_tiet(don_id, mon_id, so_luong).\n\nViết vào bao_cao.sql MỘT câu truy vấn báo cáo doanh thu theo món:\n- cột 1 tên "ten": tên món\n- cột 2 tên "doanh_thu": tổng tiền món đó mang lại (số lượng × giá)\n- CHỈ các món thực sự đã bán\n- sắp xếp doanh thu giảm dần; HAI MÓN BẰNG ĐIỂM thì món nào tên đứng trước bảng chữ cái xếp trên\n- chỉ lấy 3 dòng đầu.\n\nVÌ SAO PHẢI NÓI RÕ CÁCH XỬ HOÀ: trong dữ liệu quán có hai món doanh thu bằng nhau. Không chỉ định thứ tự phụ thì SQLite muốn trả món nào trước cũng được — báo cáo chạy hai lần ra hai kết quả khác nhau, và đó là loại lỗi khiến người ta mất niềm tin vào số liệu.',
    hint: 'Nối bảng: FROM chi_tiet ct JOIN mon m ON m.id = ct.mon_id. Doanh thu mỗi món: SUM(ct.so_luong * m.gia) AS doanh_thu. Gộp theo món bằng GROUP BY m.ten, rồi ORDER BY doanh_thu DESC, ten ASC LIMIT 3 (cột thứ hai trong ORDER BY chính là luật xử hoà). JOIN đã tự loại món chưa bán — không cần WHERE.',
    referenceCode: `SELECT m.ten AS ten, SUM(ct.so_luong * m.gia) AS doanh_thu
FROM chi_tiet ct
JOIN mon m ON m.id = ct.mon_id
GROUP BY m.ten
ORDER BY doanh_thu DESC, ten ASC
LIMIT 3;`,
    checks: [
      tc([], 'ten | doanh_thu', 'Đặt đúng tên hai cột báo cáo'),
      tc([], 'Ca phe sua | 100000', 'Món doanh thu cao nhất đứng đầu'),
      tc([], 'Ca phe den | 40000', 'Doanh thu từng món tính đúng (số lượng × giá)'),
      tc(
        [],
        'ten | doanh_thu\nCa phe sua | 100000\nCa phe den | 40000\nBanh ngot | 30000',
        'Ca ẩn: đúng 3 dòng, đúng thứ tự, xử hoà theo tên (Banh ngot trước Nuoc cam)',
        true,
        'exact',
      ),
    ],
  },
  {
    id: 'p3-s5',
    isMilestone: true,
    language: 'fetch',
    files: [P3_ORDER_FILE],
    domHtml: TRANG_DAT_HANG,
    title: 'Milestone P3 — trang đặt hàng lấy menu từ API cửa hàng',
    unitId: 'p3-u7',
    requirement:
      'Bước chốt chặng: menu không còn gõ cứng trong code nữa mà LẤY TỪ API — đổi giá thì sửa một chỗ ở máy chủ, mọi khách vào đều thấy giá mới, không phải sửa lại trang.\n\nAPI mẫu của cửa hàng: /api/menu → mảng các món {ten, gia, nhom}.\n\nGiữ nguyên mọi hành vi bước 3 (giỏ cộng dồn, món lạ báo rõ), chỉ đổi nguồn menu:\n1. Khi script chạy: gọi /api/menu, render mỗi món một <li> vào #menu dạng "<ten> - <gia>", rồi đặt #tong thành "San sang" để báo đã tải xong menu.\n2. Bấm #nut-them: tính tiền theo giá LẤY TỪ API (không gõ cứng số nào trong code).\n3. Món lạ vẫn hiện "Khong co mon nay".\n\nLƯU Ý: menu API có 5 món — nhiều hơn 3 món gõ cứng ở bước 3, nên nếu bạn còn sót bảng giá cũ trong code thì các ca kiểm tra sẽ lộ ra ngay.',
    hint: 'Khai báo let BANG_GIA = {} ở ngoài, rồi trong hàm async tải menu: const ds = await (await fetch("/api/menu")).json(); duyệt ds để vừa đổ vào BANG_GIA[mon.ten] = mon.gia vừa render <li>. Hàm xử lý nút đọc BANG_GIA — lúc bấm thì dữ liệu đã tải xong rồi.',
    referenceCode: `const menuEl = document.getElementById("menu")
const gioEl = document.getElementById("gio")
const tongEl = document.getElementById("tong")

let BANG_GIA = {}

async function taiMenu() {
  const res = await fetch("/api/menu")
  const ds = await res.json()
  for (const mon of ds) {
    BANG_GIA[mon.ten] = mon.gia
    const li = document.createElement("li")
    li.textContent = mon.ten + " - " + mon.gia
    menuEl.appendChild(li)
  }
  tongEl.textContent = "San sang"
}

taiMenu()

let tong = 0
document.getElementById("nut-them").addEventListener("click", () => {
  const ten = document.getElementById("o-mon").value.trim().toLowerCase()
  const soLuong = Number(document.getElementById("o-sl").value)
  if (!(ten in BANG_GIA)) {
    tongEl.textContent = "Khong co mon nay"
    return
  }
  const thanhTien = BANG_GIA[ten] * soLuong
  const li = document.createElement("li")
  li.textContent = ten + " x" + soLuong + " = " + thanhTien
  gioEl.appendChild(li)
  tong = tong + thanhTien
  tongEl.textContent = "Tong: " + tong
})`,
    checks: [
      tc([], 'p id="tong" "San sang"', 'Tải menu từ API xong thì báo sẵn sàng'),
      tc([], 'li "ca phe sua - 20000"', 'Món CHỈ có trong API cũng hiện ra (menu thật từ máy chủ)'),
      tc(
        ['dien #o-mon = banh mi', 'dien #o-sl = 2', 'click #nut-them'],
        'li "banh mi x2 = 40000"',
        'Tính tiền bằng giá lấy từ API',
      ),
      tc(
        [
          'dien #o-mon = tra da',
          'dien #o-sl = 2',
          'click #nut-them',
          'dien #o-mon = ca phe sua',
          'dien #o-sl = 1',
          'click #nut-them',
        ],
        'p id="tong" "Tong: 30000"',
        'Giỏ vẫn cộng dồn như bước 3',
      ),
      tc(
        ['dien #o-mon = pho bo', 'dien #o-sl = 1', 'click #nut-them'],
        'p id="tong" "Khong co mon nay"',
        'Ca ẩn: món không có trong API báo rõ',
        true,
      ),
    ],
  },
]
