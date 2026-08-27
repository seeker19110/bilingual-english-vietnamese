// lessons/p6u18.ts — Bài học P6-U18: bậc P6 "Chuyên sâu", hướng WEB, chặng S1,
// module `web-s1-m5` "Accessibility nhập môn" (packages/subject-programming/specializations/web.ts).
//
// HAI CHỦ ĐỀ của module: (1) bàn phím/focus đi hết mọi luồng — HTML ngữ nghĩa trước, ARIA sau;
// (2) tương phản màu + vùng chạm. Bài này dạy chủ đề (1) và mở rộng sang "4 trạng thái của một
// màn hình" (tải/rỗng/lỗi/có dữ liệu) — luật a11y cứng của chính dự án DHCB (CLAUDE.md mục 4.5:
// nội dung AAA ≥ 7:1, phần còn lại AA, cổng CI 0 vi phạm) dùng làm ví dụ thật xuyên suốt.
//
// LƯU Ý VỀ GIỚI HẠN BỘ CHẤM: bản mô tả cây DOM (htmlPrelude.ts, ATTRS_QUAN_TRONG) chỉ in ra
// id/class/href/src/alt/type/name/value/for/lang/charset — KHÔNG có tabindex/role/aria-*. Vì
// vậy phần "bàn phím thật" (Tab/Enter/Space) và "role=status/aria-live" được dạy bằng lý thuyết
// + Predict/Parsons + trang domHtml đã DỰNG SẴN cho đúng chuẩn (button thật, role/aria-live có
// sẵn trên trang) — bài Make chấm phần LOGIC học viên tự viết (chuyển trạng thái/nội dung),
// không chấm được thuộc tính ARIA. Đây là giới hạn CÓ CHỦ ĐÍCH của bộ chạy, không phải sơ suất.
import type { ProgrammingLesson } from '../lessonTypes.js'

const TRANG_FAQ = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Cau hoi thuong gap</title>
  </head>
  <body>
    <h1>Cau hoi thuong gap</h1>
    <div class="faq">
      <button id="cau-1" class="cau-hoi">Lam sao dang ky tai khoan?</button>
      <p id="tra-loi-1" class="tra-loi an">Bam nut Dang ky o goc tren, dien email va mat khau.</p>
      <button id="cau-2" class="cau-hoi">App co mien phi khong?</button>
      <p id="tra-loi-2" class="tra-loi an">Co, ban hoc mien phi voi so luot gioi han moi ngay.</p>
    </div>
  </body>
</html>`

const TRANG_TRANG_THAI = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Danh sach hoc vien</title>
  </head>
  <body>
    <h1>Danh sach hoc vien</h1>
    <div id="thong-bao" role="status" aria-live="polite"></div>
    <ul id="danh-sach"></ul>
    <button id="nut-tai">Mo phong: dang tai</button>
    <button id="nut-rong">Mo phong: rong</button>
    <button id="nut-loi">Mo phong: loi</button>
    <button id="nut-co-du-lieu">Mo phong: co du lieu</button>
  </body>
</html>`

export const P6U18_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u18-l1',
    unitId: 'p6-u18',
    language: 'dom',
    domHtml: TRANG_FAQ,
    title: 'Bàn phím và focus: đừng bỏ lại ai',
    hook: 'Mở trang FAQ bằng chuột thì dễ. Nhưng người dùng khiếm thị dùng trình đọc màn hình, người run tay chỉ gõ được bàn phím — họ có mở được câu trả lời không? Luật a11y của chính dự án này (CLAUDE.md mục 4.5) bắt buộc mọi luồng phải đi hết được bằng Tab/Enter/Space, không có ngoại lệ nào, kể cả "chỉ là một cái accordion nhỏ".',
    theory:
      'CÓ HAI CÁCH LÀM MỘT NÚT BẤM, và chỉ một cách đúng.\n\nCách sai — quen tay từ CSS: <div class="nut" onclick="...">Bam vao day</div>. Trông giống nút, nhưng trình duyệt KHÔNG coi div là phần tử tương tác: nó không nhận được focus khi bấm Tab (không có trong luồng tab mặc định), và Enter/Space trên nó không phát sự kiện gì cả — bạn phải tự viết thêm code bắt keydown, tự set tabindex, tự set role="button", dễ quên sót một trong ba thứ đó và thế là hỏng.\n\nCách đúng: dùng đúng thẻ ngữ nghĩa cho đúng việc — <button> để bấm, <a href> để đi trang khác, <input>/<select> để nhập liệu. Trình duyệt cho KHÔNG mọi thứ: tự vào luồng Tab theo đúng thứ tự trên trang, Enter và Space đều tự kích hoạt sự kiện "click" (không cần bạn viết thêm dòng nào), và trình đọc màn hình tự đọc đúng vai trò "button". Đây là luật "HTML ngữ nghĩa trước, ARIA sau": ARIA (role, aria-*) chỉ dùng khi KHÔNG CÓ thẻ HTML nào làm sẵn việc đó — nó là miếng vá, không phải lựa chọn đầu tiên. Trang của bài này đã dùng <button> cho hai câu hỏi, nên phần "bàn phím hoạt động" bạn được cho không — việc của bạn chỉ là viết đúng logic mở/đóng.\n\nHAI CẠM BẪY LIÊN QUAN, nhớ để không tự tay phá luồng bàn phím của người khác:\n\n1. tabindex DƯƠNG (tabindex="1", "2"...) — nghe có vẻ hay vì "tự xếp thứ tự Tab", nhưng nó ĐÈ thứ tự tự nhiên của trang và làm rối tung luồng khi trang có nhiều phần tử. Chỉ dùng tabindex="0" (thêm phần tử vào luồng Tab tự nhiên, đúng vị trí trong HTML) hoặc tabindex="-1" (bỏ khỏi Tab nhưng vẫn focus được bằng JS — dùng cho hộp thoại). Không bao giờ dùng số dương.\n\n2. outline: none trong CSS — dòng này XOÁ vòng viền focus mặc định của trình duyệt mà không thay bằng gì khác. Người dùng bàn phím bấm Tab liên tục mà không thấy con trỏ đang ở đâu — với họ trang coi như bị mù. Muốn đổi kiểu viền thì đổi màu/độ dày, đừng bao giờ xoá hẳn.\n\nCác quy tắc này không phải lý thuyết suông: `e2e/a11y.spec.ts` của dự án quét đủ AA trên mọi trang, và một div-giả-nút hay một outline:none là đúng loại lỗi bị chặn ở CI.',
    workedExample: {
      code: `// Trang co san: nut #cau-1/#cau-2 (that su la <button>), doan tra loi #tra-loi-1/#tra-loi-2
// (dang co class "an" = dang an). Vi du mau: mo/dong CAU 1 khi bam.

const cau1 = document.getElementById("cau-1")
const traLoi1 = document.getElementById("tra-loi-1")

cau1.addEventListener("click", () => {
  // classList.toggle: co thi bo, chua co thi them — dung mot dong thay vi if/else
  traLoi1.classList.toggle("an")     // an <-> hien
  cau1.classList.toggle("mo")        // danh dau nut dang mo, de CSS doi kieu hien thi
})
// Vi la <button> that, Enter va Space cung phat "click" y het chuot bam — khong can them dong nao.`,
      stdinLines: ['click #cau-1'],
    },
    predict: {
      code: `// Doan nay chay TRUC TIEP, khong nam trong ham xu ly su kien nao ca.
const traLoi1 = document.getElementById("tra-loi-1")
const cau1 = document.getElementById("cau-1")
traLoi1.classList.toggle("an")
cau1.classList.toggle("mo")`,
      question: 'Sau khi đoạn code này chạy xong, dòng nào có mặt trong bản mô tả cây DOM?',
      choices: [
        'p id="tra-loi-1" class="tra-loi" "Bam nut Dang ky o goc tren, dien email va mat khau."',
        'p id="tra-loi-1" class="tra-loi an" "Bam nut Dang ky o goc tren, dien email va mat khau."',
        'button id="cau-1" class="cau-hoi" "Lam sao dang ky tai khoan?"',
        'p id="tra-loi-1" class="an" "Bam nut Dang ky o goc tren, dien email va mat khau."',
      ],
      answerIndex: 0,
      explain:
        'classList.toggle("an") chỉ đụng vào ĐÚNG MỘT class tên "an" — có thì bỏ nó đi (giữ nguyên các class khác), chưa có thì thêm vào — chứ không thay cả chuỗi class (đáp án 4 sai vì tưởng nó xoá hết class cũ). Đoạn trả lời mất "an" nên hiện ra (đáp án 2 là trạng thái CŨ, đã đổi rồi). Nút #cau-1 cũng được toggle "mo" trong CÙNG đoạn code — quên dòng đó (đáp án 3) là thiếu một nửa việc, y hệt lỗi hay gặp ở bài Make. Vì đoạn code chạy ngay lập tức (không đợi click), không cần mô phỏng thao tác bàn phím hay chuột nào cả — nó tự đổi cây DOM khi trang tải.',
    },
    parsons: {
      prompt: 'Xếp lại đoạn mở/đóng câu trả lời khi bấm nút #cau-1, dùng classList.toggle.',
      lines: [
        'const cau1 = document.getElementById("cau-1")',
        'const traLoi1 = document.getElementById("tra-loi-1")',
        'cau1.addEventListener("click", () => {',
        '  traLoi1.classList.toggle("an")',
        '  cau1.classList.toggle("mo")',
        '})',
      ],
    },
    make: {
      prompt:
        'Trang FAQ đã dựng sẵn hai câu hỏi (bạn chỉ viết JavaScript, KHÔNG sửa HTML):\n- nút #cau-1 với đoạn trả lời #tra-loi-1\n- nút #cau-2 với đoạn trả lời #tra-loi-2\n\nCả hai đoạn trả lời đang có class "tra-loi an" (class "an" = đang ẩn).\n\nViết JS làm cho:\n1. Bấm nút câu hỏi → đoạn trả lời TƯƠNG ỨNG bỏ class "an" (hiện ra), đồng thời nút đó CÓ thêm class "mo".\n2. Bấm lại lần nữa (cùng nút) → đoạn trả lời có lại class "an" (ẩn đi), nút MẤT class "mo".\n3. Hai câu hỏi ĐỘC LẬP nhau — bấm câu 1 không được ảnh hưởng câu 2.\n\nKHÔNG cần thêm tabindex hay bắt sự kiện bàn phím: nút đã là <button> thật, Enter/Space tự hoạt động.',
      starterCode: `const cau1 = document.getElementById("cau-1")
const traLoi1 = document.getElementById("tra-loi-1")
const cau2 = document.getElementById("cau-2")
const traLoi2 = document.getElementById("tra-loi-2")

// Viet ham xu ly chung cho ca hai cap nut/dap-an, hoac lam rieng tung cap deu duoc.
`,
      testCases: [
        {
          stdinLines: [],
          expected: 'p id="tra-loi-1" class="tra-loi an"',
          match: 'contains',
          hidden: false,
          label: 'Trang vừa tải: câu trả lời 1 còn ẩn (class "an")',
        },
        {
          stdinLines: ['click #cau-1'],
          expected: 'p id="tra-loi-1" class="tra-loi"',
          match: 'contains',
          hidden: false,
          label: 'Bấm câu 1 → đoạn trả lời 1 hết class "an", nút mang class "mo"',
        },
        {
          stdinLines: ['click #cau-1'],
          expected: 'button id="cau-1" class="cau-hoi mo"',
          match: 'contains',
          hidden: false,
          label: 'Bấm câu 1 → chính nút #cau-1 có thêm class "mo"',
        },
        {
          stdinLines: ['click #cau-1', 'click #cau-1'],
          expected: 'p id="tra-loi-1" class="tra-loi an"',
          match: 'contains',
          hidden: false,
          label: 'Bấm lại lần hai → đóng lại, class "an" quay về',
        },
        {
          stdinLines: ['click #cau-2'],
          expected: 'p id="tra-loi-1" class="tra-loi an"',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: bấm câu 2 không được làm đổi trạng thái câu 1',
        },
        {
          stdinLines: ['click #cau-1', 'click #cau-2'],
          expected:
            '      p id="tra-loi-1" class="tra-loi" "Bam nut Dang ky o goc tren, dien email va mat khau."\n      button id="cau-2" class="cau-hoi mo" "App co mien phi khong?"',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: mở cả hai câu cùng lúc — cả hai cùng hiện, không tranh chấp nhau',
        },
      ],
      hints: [
        'classList.toggle("ten-lop") là một dòng thay được cho cả if/else: có thì bỏ, chưa có thì thêm.',
        'Cần đúng hai chỗ đổi mỗi lần bấm: class "an" trên ĐOẠN TRẢ LỜI, và class "mo" trên NÚT. Thiếu một trong hai là sai test.',
        'Viết một hàm nhận vào (nut, traLoi) rồi gọi hai lần cho hai cặp — tránh chép logic hai lần (DRY).',
        'Khung tham chiếu: function gan(nut, traLoi) { nut.addEventListener("click", () => { traLoi.classList.toggle("an"); nut.classList.toggle("mo") }) }; rồi gọi gan(cau1, traLoi1) và gan(cau2, traLoi2).',
      ],
      sampleSolution: `const cau1 = document.getElementById("cau-1")
const traLoi1 = document.getElementById("tra-loi-1")
const cau2 = document.getElementById("cau-2")
const traLoi2 = document.getElementById("tra-loi-2")

function gan(nut, traLoi) {
  nut.addEventListener("click", () => {
    traLoi.classList.toggle("an")
    nut.classList.toggle("mo")
  })
}

gan(cau1, traLoi1)
gan(cau2, traLoi2)`,
    },
    homework:
      'Về nhà: mở một trang bất kỳ bạn hay dùng (kể cả trang của chính dự án này), gõ chuột ra một góc rồi CHỈ dùng bàn phím — Tab để đi tới, Shift+Tab để lùi, Enter/Space để bấm — thử thao tác hết một luồng chính (đăng nhập, gửi form...). Ghi lại: có chỗ nào Tab "nhảy qua" một nút không tới được không? Có chỗ nào bạn mất dấu focus đang ở đâu không (nghi ngờ outline: none)? Nếu tự viết trang riêng, thử làm một nút bằng <div onclick> rồi tự Tab tới xem — cảm nhận trực tiếp sự khác biệt với <button> sẽ nhớ lâu hơn đọc lý thuyết.',
    srsCards: [
      {
        hoi: 'Vì sao <div onclick> không thay thế được <button> dù trông giống hệt bằng CSS?',
        dap: 'Vì trình duyệt không coi div là phần tử tương tác: nó không tự vào luồng Tab, và Enter/Space trên nó không tự phát sự kiện gì. Phải tự thêm tabindex, bắt keydown, gán role="button" — dễ thiếu sót. <button> có sẵn cả ba thứ đó.',
      },
      {
        hoi: 'tabindex="1", "2"... (số dương) có vấn đề gì?',
        dap: 'Nó đè lên thứ tự Tab tự nhiên của trang, làm luồng bàn phím rối loạn khi trang có nhiều phần tử. Chỉ nên dùng tabindex="0" (vào luồng tự nhiên) hoặc tabindex="-1" (bỏ khỏi Tab, focus được bằng JS) — không bao giờ dùng số dương.',
      },
      {
        hoi: 'Luật "HTML ngữ nghĩa trước, ARIA sau" nghĩa là gì?',
        dap: 'Dùng đúng thẻ HTML làm sẵn việc đó (button, a href, input...) trước — trình duyệt tự lo bàn phím và trình đọc màn hình. Chỉ thêm ARIA (role, aria-*) khi KHÔNG có thẻ HTML nào làm được việc đó; ARIA là miếng vá, không phải lựa chọn đầu tiên.',
      },
    ],
  },
  {
    id: 'p6-u18-l2',
    unitId: 'p6-u18',
    language: 'dom',
    domHtml: TRANG_TRANG_THAI,
    title: 'Bốn trạng thái của một màn hình đúng chuẩn',
    hook: 'Danh sách học viên của bạn "trống" — nhưng trống vì CHƯA TẢI XONG, vì THẬT SỰ chưa có ai, hay vì SERVER LỖI? Với mắt thường thì cả ba trông giống nhau (một khoảng trắng). Với người dùng trình đọc màn hình thì càng tệ hơn: im lặng là im lặng, họ không biết trang có đang làm gì hay đã treo.',
    theory:
      'MỌI MÀN HÌNH LẤY DỮ LIỆU TỪ SERVER đều có đúng 4 TRẠNG THÁI, không hơn không kém — quên một trạng thái là để lại một màn hình trống khó hiểu cho người dùng:\n\n1. TẢI (loading) — vừa gọi API, chưa có kết quả. Phải cho người dùng biết trang ĐANG LÀM VIỆC, không phải bị treo.\n2. RỖNG (empty) — gọi xong, server trả về danh sách 0 phần tử. Đây KHÔNG PHẢI lỗi — phải nói rõ "chưa có gì" chứ không để trắng tinh như đang tải.\n3. LỖI (error) — gọi thất bại (mất mạng, server 500...). Phải nói rõ có lỗi, càng tốt nếu cho cách thử lại.\n4. CÓ DỮ LIỆU (data) — trường hợp vui vẻ, hiện danh sách thật.\n\nBốn trạng thái LOẠI TRỪ NHAU: tại một thời điểm chỉ đúng một trạng thái đang hiện, ba cái kia phải dọn sạch — giống hệt bài học "một nguồn sự thật, vẽ lại từ đầu" (không được vừa còn dòng "Dang tai..." cũ vừa hiện danh sách mới đè lên).\n\nVÌ SAO CẦN role="status"/aria-live NGOÀI PHẦN NHÌN THẤY: người dùng mắt thường thấy chữ đổi là biết ngay. Người dùng trình đọc màn hình thì KHÔNG tự động biết một vùng trên trang vừa đổi nội dung — trình đọc chỉ đọc theo nơi con trỏ đang đứng. Thẻ có role="status" + aria-live="polite" báo cho trình đọc: "vùng này vừa đổi, đọc lên cho người dùng nghe, đợi họ ngừng thao tác thì đọc" — nhờ vậy "Dang tai..." rồi "Da tai xong: 3 hoc vien" được ĐỌC RA, không chỉ hiện chữ. Trang của bài này đã có sẵn div#thong-bao với hai thuộc tính đó — việc của bạn là đổi ĐÚNG NỘI DUNG của nó theo từng trạng thái, phần loan báo cho trình đọc màn hình trình duyệt tự lo.\n\nDự án DHCB áp luật a11y cứng cho đúng việc này (CLAUDE.md mục 4.5): nội dung/tiêu đề phải đạt AAA (tương phản ≥ 7:1), phần còn lại đạt AA — cổng CI `e2e/a11y.spec.ts` + `e2e/a11y-aaa.spec.ts` quét 15 trang × 5 theme, 0 vi phạm mới qua được. Một màn hình thiếu trạng thái LỖI hay RỖNG không tự động bị cổng này bắt (đó là lỗi HÀNH VI, không phải lỗi màu sắc) — nhưng nó cùng một tinh thần: đừng để người dùng đứng trước một màn hình im lặng không biết chuyện gì đang xảy ra.',
    workedExample: {
      code: `// Trang co san: #thong-bao (co san role="status" aria-live="polite"), #danh-sach (ul rong).
// Vi du mau: xu ly rieng trang thai "dang tai".

function hienThiTai() {
  document.getElementById("danh-sach").textContent = ""      // don sach truoc — dung mot nguon
  document.getElementById("thong-bao").textContent = "Dang tai..."
}

document.getElementById("nut-tai").addEventListener("click", hienThiTai)
// Nguoi dung mat thuong thay chu "Dang tai...". Nguoi dung trinh doc man hinh nghe duoc y het,
// vi #thong-bao co san aria-live="polite" tren trang — JS chi can doi dung noi dung.`,
      stdinLines: ['click #nut-tai'],
    },
    predict: {
      code: `// Doan nay chay TRUC TIEP (khong nam trong ham xu ly su kien), mo phong kieu code
// "QUEN don danh sach cu" duoc noi toi o ly thuyet.
const ds = document.getElementById("danh-sach")
const li = document.createElement("li")
li.textContent = "An"
ds.appendChild(li)
document.getElementById("thong-bao").textContent = "Co loi xay ra, thu lai sau."
// Y: da co san 1 hoc vien trong danh sach, roi doi thong bao sang "loi" MA KHONG don danh sach.`,
      question: 'Sau khi đoạn code này chạy xong, dòng nào có mặt trong bản mô tả cây DOM?',
      choices: [
        'div id="thong-bao" "Co loi xay ra, thu lai sau."',
        'div id="thong-bao" "Chua co hoc vien nao."',
        'div id="thong-bao" "Dang tai..."',
        'li "Binh"',
      ],
      answerIndex: 0,
      explain:
        'Đoạn code chỉ gán textContent mới cho #thong-bao — nó KHÔNG hề đụng tới #danh-sach, nên thẻ <li>An</li> vẫn còn nguyên trên trang dù thông báo đã báo "lỗi" (đáp án 1 đúng). Đáp án 2 và 3 là hai trạng thái KHÁC không xảy ra ở đây, đáp án 4 là học viên tưởng tượng thêm một học viên chưa từng được tạo. Đây đúng loại bug "quên dọn nguồn cũ" ở lý thuyết: 4 trạng thái loại trừ nhau, chuyển trạng thái nào cũng phải dọn sạch phần hiển thị của trạng thái khác, không chỉ đổi mỗi dòng thông báo.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm hiển thị trạng thái RỖNG cho đúng: dọn danh sách rồi mới báo trạng thái.',
      lines: [
        'function hienThiRong() {',
        '  document.getElementById("danh-sach").textContent = ""',
        '  document.getElementById("thong-bao").textContent = "Chua co hoc vien nao."',
        '}',
      ],
    },
    make: {
      prompt:
        'Trang đã dựng sẵn (bạn chỉ viết JavaScript): #thong-bao (đã có role="status"/aria-live), #danh-sach (ul rỗng), và bốn nút mô phỏng bốn trạng thái: #nut-tai, #nut-rong, #nut-loi, #nut-co-du-lieu.\n\nMỗi lần bấm một nút, phải LUÔN dọn sạch #danh-sach trước, rồi:\n\n1. #nut-tai → #thong-bao = "Dang tai..." · #danh-sach để trống.\n2. #nut-rong → #thong-bao = "Chua co hoc vien nao." · #danh-sach để trống.\n3. #nut-loi → #thong-bao = "Co loi xay ra, thu lai sau." · #danh-sach để trống.\n4. #nut-co-du-lieu → thêm ĐÚNG hai thẻ <li>: "An" rồi "Binh" (đúng thứ tự) vào #danh-sach, và #thong-bao = "Da tai xong: 2 hoc vien".\n\nTrang vừa tải xong (chưa bấm nút nào) thì #thong-bao và #danh-sach đều còn trống — đừng tự chạy sẵn trạng thái nào lúc tải.',
      starterCode: `const thongBao = document.getElementById("thong-bao")
const danhSach = document.getElementById("danh-sach")

function donDanhSach() {
  danhSach.textContent = ""
}

// Gan su kien cho 4 nut: nut-tai, nut-rong, nut-loi, nut-co-du-lieu
`,
      testCases: [
        {
          stdinLines: [],
          expected:
            'html lang="vi"\n  head\n    meta charset="utf-8"\n    title "Danh sach hoc vien"\n  body\n    h1 "Danh sach hoc vien"\n    div id="thong-bao"\n    ul id="danh-sach"\n    button id="nut-tai" "Mo phong: dang tai"\n    button id="nut-rong" "Mo phong: rong"\n    button id="nut-loi" "Mo phong: loi"\n    button id="nut-co-du-lieu" "Mo phong: co du lieu"',
          match: 'exact',
          hidden: false,
          label: 'Trang vừa tải: cả thông báo lẫn danh sách đều còn trống',
        },
        {
          stdinLines: ['click #nut-tai'],
          expected: 'div id="thong-bao" "Dang tai..."',
          match: 'contains',
          hidden: false,
          label: 'Bấm mô phỏng "đang tải" → thông báo đúng chữ',
        },
        {
          stdinLines: ['click #nut-rong'],
          expected: 'div id="thong-bao" "Chua co hoc vien nao."',
          match: 'contains',
          hidden: false,
          label: 'Bấm mô phỏng "rỗng" → thông báo đúng chữ, không phải lỗi',
        },
        {
          stdinLines: ['click #nut-loi'],
          expected: 'div id="thong-bao" "Co loi xay ra, thu lai sau."',
          match: 'contains',
          hidden: false,
          label: 'Bấm mô phỏng "lỗi" → thông báo đúng chữ',
        },
        {
          stdinLines: ['click #nut-co-du-lieu'],
          expected: '      li "An"\n      li "Binh"',
          match: 'contains',
          hidden: false,
          label: 'Bấm mô phỏng "có dữ liệu" → hai học viên đúng thứ tự',
        },
        {
          stdinLines: ['click #nut-co-du-lieu', 'click #nut-loi'],
          expected: '    ul id="danh-sach"\n    button id="nut-tai"',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: chuyển từ "có dữ liệu" sang "lỗi" phải DỌN SẠCH danh sách cũ',
        },
        {
          stdinLines: ['click #nut-tai', 'click #nut-co-du-lieu', 'click #nut-tai'],
          expected:
            '    div id="thong-bao" "Dang tai..."\n    ul id="danh-sach"\n    button id="nut-tai"',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: quay lại "đang tải" sau khi đã có dữ liệu → danh sách cũ phải biến mất',
        },
      ],
      hints: [
        'Viết một hàm donDanhSach() dùng chung cho cả bốn nút — gọi nó ĐẦU TIÊN trong mọi trường hợp, trước khi đổi #thong-bao hay thêm <li>.',
        'Bug hay gặp nhất: chuyển từ trạng thái "có dữ liệu" sang trạng thái khác mà quên xoá #danh-sach — danh sách cũ tồn tại lẫn với thông báo mới.',
        'Trạng thái "có dữ liệu" cần document.createElement("li") hai lần, gán textContent rồi appendChild — đúng thứ tự "An" trước "Binh" sau.',
        'Khung tham chiếu: function xuLy(chu, coDuLieu) { donDanhSach(); thongBao.textContent = chu; if (coDuLieu) { for (const ten of ["An", "Binh"]) { const li = document.createElement("li"); li.textContent = ten; danhSach.appendChild(li) } } }',
      ],
      sampleSolution: `const thongBao = document.getElementById("thong-bao")
const danhSach = document.getElementById("danh-sach")

function donDanhSach() {
  danhSach.textContent = ""
}

document.getElementById("nut-tai").addEventListener("click", () => {
  donDanhSach()
  thongBao.textContent = "Dang tai..."
})

document.getElementById("nut-rong").addEventListener("click", () => {
  donDanhSach()
  thongBao.textContent = "Chua co hoc vien nao."
})

document.getElementById("nut-loi").addEventListener("click", () => {
  donDanhSach()
  thongBao.textContent = "Co loi xay ra, thu lai sau."
})

document.getElementById("nut-co-du-lieu").addEventListener("click", () => {
  donDanhSach()
  for (const ten of ["An", "Binh"]) {
    const li = document.createElement("li")
    li.textContent = ten
    danhSach.appendChild(li)
  }
  thongBao.textContent = "Da tai xong: 2 hoc vien"
})`,
    },
    homework:
      'Về nhà: mở một trang thật (của dự án này hoặc trang bất kỳ) có danh sách tải từ server (ví dụ trang tin nhắn, trang sản phẩm). Tắt mạng rồi tải lại trang — nó có báo lỗi rõ ràng hay treo trắng vô định? Tìm một tài khoản mới toanh chưa có dữ liệu gì (giỏ hàng trống, chưa có lịch sử...) — trang có nói rõ "chưa có gì" hay chỉ hiện khoảng trắng giống hệt lúc đang tải? Nếu tự viết trang riêng, thêm hẳn 4 trạng thái theo đúng khuôn bài này — dùng lại được ở bất kỳ màn hình lấy dữ liệu nào bạn làm sau này.',
    srsCards: [
      {
        hoi: 'Bốn trạng thái bắt buộc của một màn hình lấy dữ liệu từ server là gì?',
        dap: 'Tải (đang gọi API, chưa có kết quả) · Rỗng (gọi xong, 0 phần tử — không phải lỗi) · Lỗi (gọi thất bại) · Có dữ liệu (trường hợp vui vẻ). Bốn trạng thái loại trừ nhau, chuyển sang trạng thái nào cũng phải dọn sạch ba trạng thái còn lại.',
      },
      {
        hoi: 'role="status" + aria-live="polite" dùng để làm gì?',
        dap: 'Báo cho trình đọc màn hình biết một vùng vừa đổi nội dung để tự đọc lên cho người dùng nghe (đợi họ ngừng thao tác rồi mới đọc, vì là "polite"). Người mắt thường thấy chữ đổi là biết ngay; người dùng trình đọc màn hình cần thuộc tính này mới "nghe" được thay đổi đó.',
      },
      {
        hoi: 'Lỗi hay gặp nhất khi chuyển trạng thái trên một màn hình 4-trạng-thái là gì?',
        dap: 'Quên dọn sạch phần hiển thị của trạng thái CŨ trước khi hiện trạng thái MỚI — ví dụ chuyển từ "có dữ liệu" sang "lỗi" mà danh sách cũ vẫn còn nguyên trên trang, lẫn với thông báo lỗi mới.',
      },
    ],
  },
]
