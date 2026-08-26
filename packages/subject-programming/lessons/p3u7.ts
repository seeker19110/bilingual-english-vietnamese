// lessons/p3u7.ts — Bài học P3-U7: FETCH API (PR-L7e).
// Bậc P3 "Làm được việc thật" — đặc tả docs/research/dac-ta-mon-lap-trinh-2026-08-24.md §4
// ("JS: fetch API, render danh sách — dự án mini: Trang tra thời tiết 63 tỉnh thành").
//
// Bài 'fetch' = bài DOM cộng fetch GIẢ LẬP (fetchPrelude.ts): sandbox không có mạng, nên
// /api/thoi-tiet được một fake fetch phục vụ từ bộ dữ liệu mẫu cố định (weatherData.ts).
// Test-case dùng `stdinLines` làm chuỗi hành động người dùng, y hệt bài DOM.
// LƯU Ý KHI SỬA expected: giá trị nhiệt độ/trạng thái trời lấy từ weatherData.ts (sinh
// deterministic) — đổi công thức bên đó là phải sửa số ở đây (cổng lessonsFetch.test.ts chặn).
import type { ProgrammingLesson } from '../lessonTypes.js'

const TRANG_DANH_SACH = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Thoi tiet 63 tinh</title>
  </head>
  <body>
    <h1>Thoi tiet 63 tinh</h1>
    <button id="nut-tai">Tai du lieu</button>
    <ul id="danh-sach"></ul>
    <p id="trang-thai"></p>
  </body>
</html>`

const TRANG_TRA_CUU = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Tra thoi tiet</title>
  </head>
  <body>
    <h1>Tra thoi tiet</h1>
    <label for="o-tinh">Ten tinh/thanh pho</label>
    <input id="o-tinh" type="text" />
    <button id="nut-tra">Tra cuu</button>
    <p id="ket-qua"></p>
  </body>
</html>`

export const P3U7_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p3-u7-l1',
    unitId: 'p3-u7',
    language: 'fetch',
    domHtml: TRANG_DANH_SACH,
    title: 'Fetch API — lấy dữ liệu từ xa và render danh sách',
    hook: 'Mọi trang bạn dùng hằng ngày — thời tiết, tỉ giá, kết quả bóng đá — đều làm đúng một việc: hỏi một máy chủ ở xa "cho tôi dữ liệu", nhận về JSON, rồi vẽ lên trang. Hôm nay bạn làm chính việc đó với bảng thời tiết 63 tỉnh thành.',
    theory:
      'GỌI DỮ LIỆU TỪ XA — fetch:\n    const res = await fetch("/api/thoi-tiet")\n    const ds = await res.json()\n\nHai dòng, nhưng là hai ý tưởng lớn:\n\n1. MẠNG LÀ VIỆC PHẢI CHỜ. Dữ liệu nằm ở máy khác, đi qua mạng mất thời gian — nên fetch KHÔNG trả về dữ liệu, nó trả về một Promise ("lời hứa sẽ có kết quả"). Từ khoá await nghĩa là "đứng đây chờ lời hứa đó thành sự thật rồi mới đi tiếp". Và luật của JavaScript: chỉ được await bên trong hàm có chữ async đằng trước.\n\n2. CHỜ HAI LẦN, KHÔNG PHẢI MỘT. Lần một chờ máy chủ TRẢ LỜI (res — response). Lần hai chờ ĐỌC XONG phần thân và đổi từ chữ JSON thành mảng/object thật: res.json() — nó cũng trả Promise, nên cũng phải await. Quên await là bạn cầm trong tay một Promise chứ không phải dữ liệu, và mọi thứ sau đó ra "[object Promise]" hoặc undefined.\n\nDữ liệu về rồi thì RENDER — biến mỗi phần tử của mảng thành một thẻ trên trang:\n    for (const tinh of ds) {\n      const li = document.createElement("li")   // tạo thẻ mới trong bộ nhớ\n      li.textContent = tinh.ten                  // đặt chữ (textContent — an toàn XSS)\n      danhSach.appendChild(li)                   // gắn vào trang thì mới nhìn thấy\n    }\nKhuôn TẠO → ĐẶT CHỮ → GẮN này bạn sẽ dùng cả đời làm web. Trước khi render nhớ xoá kết quả cũ (danhSach.textContent = "") — bấm nút hai lần mà danh sách dài gấp đôi là quên bước này.\n\nVỀ SANDBOX HỌC TẬP: máy học không có mạng thật, nên /api/thoi-tiet là API MẪU chạy ngay trong máy — dùng y hệt fetch thật, chỉ khác là dữ liệu (danh sách 63 tỉnh thành, nhiệt độ, trạng thái trời) là dữ liệu mẫu cố định, không phải thời tiết hôm nay. Gọi địa chỉ khác sẽ báo lỗi mạng — đúng như fetch thật khi mất mạng.\n\nBẪY HAY GẶP:\n1. Quên MỘT trong hai await — ra "[object Promise]".\n2. Viết await ngoài hàm async — trình duyệt báo lỗi cú pháp.\n3. addEventListener với hàm async: viết nut.addEventListener("click", async () => { ... }) — chữ async đặt ngay trước dấu ngoặc của hàm xử lý.',
    workedExample: {
      code: `// Trang có sẵn: nút #nut-tai, danh sách rỗng #danh-sach, đoạn #trang-thai
// Ví dụ này tải NGAY khi trang mở (chưa cần nút) và chỉ hiện 3 tỉnh đầu cho gọn.

async function taiThoiTiet() {              // async: bên trong mới được dùng await
  const res = await fetch("/api/thoi-tiet") // chờ máy chủ trả lời...
  const ds = await res.json()               // ...rồi chờ đọc xong JSON thành mảng
  const danhSach = document.getElementById("danh-sach")
  for (const tinh of ds.slice(0, 3)) {      // 3 phần tử đầu của mảng
    const li = document.createElement("li") // TẠO thẻ
    li.textContent = tinh.ten + ": " + tinh.nhietDo + " do C"  // ĐẶT CHỮ
    danhSach.appendChild(li)                // GẮN vào trang
  }
}
taiThoiTiet()                               // gọi hàm — quên dòng này là không gì chạy cả`,
      stdinLines: [],
    },
    predict: {
      code: `async function main() {\n  const res = await fetch("/api/thoi-tiet")\n  const ds = await res.json()\n  document.getElementById("trang-thai").textContent = "Da tai " + ds.length + " tinh"\n}\nmain()`,
      question: 'API mẫu trả về đủ 63 tỉnh thành. Đoạn #trang-thai sẽ hiện chữ gì?',
      choices: [
        'Da tai 63 tinh',
        'Da tai undefined tinh',
        '[object Promise]',
        'Không hiện gì vì thiếu await',
      ],
      answerIndex: 0,
      explain:
        'Cả hai chỗ chờ đều có await nên ds là MẢNG thật, ds.length là 63. Nếu quên await res.json() thì ds là Promise — ds.length ra undefined; quên cả hai thì cộng chuỗi với Promise ra "[object Promise]". Đó chính là hai lựa chọn sai — hai lỗi bạn sẽ tự tay gây ra ít nhất một lần.',
    },
    parsons: {
      prompt:
        'Xếp các dòng thành hàm xử lý: bấm nút thì tải dữ liệu rồi render mỗi tỉnh một dòng <li>.',
      lines: [
        'nut.addEventListener("click", async () => {',
        '  const res = await fetch("/api/thoi-tiet")',
        '  const ds = await res.json()',
        '  for (const tinh of ds) {',
        '    const li = document.createElement("li")',
        '    li.textContent = tinh.ten',
        '    danhSach.appendChild(li)',
        '  }',
        '})',
      ],
    },
    make: {
      prompt:
        'Làm trang thời tiết 63 tỉnh thành. Trang đã dựng sẵn (bạn chỉ viết JavaScript):\n- nút #nut-tai\n- danh sách rỗng #danh-sach\n- đoạn văn #trang-thai\n\nKhi người dùng bấm nút:\n1. Gọi fetch("/api/thoi-tiet") lấy mảng 63 tỉnh (mỗi phần tử có ten, nhietDo, troi).\n2. Render MỖI tỉnh một thẻ <li> trong #danh-sach, chữ đúng dạng:\n<ten>: <nhietDo> do C, <troi>\n(ví dụ: An Giang: 18 do C, nắng)\n3. Đặt vào #trang-thai đúng dòng: Da tai 63 tinh (số 63 phải LẤY TỪ độ dài mảng, không gõ cứng).\n\nTrang vừa tải xong (chưa bấm nút) thì danh sách và #trang-thai phải còn trống.',
      starterCode: `const nut = document.getElementById("nut-tai")\nconst danhSach = document.getElementById("danh-sach")\nconst trangThai = document.getElementById("trang-thai")\n\nnut.addEventListener("click", async () => {\n  // 1. fetch + json (nhớ await cả hai)\n  // 2. vòng lặp: tạo <li>, đặt chữ, gắn vào danhSach\n  // 3. trangThai: "Da tai <số> tinh"\n})\n`,
      testCases: [
        {
          stdinLines: ['click #nut-tai'],
          expected: 'li "An Giang: 18 do C, nắng"',
          match: 'contains',
          hidden: false,
          label: 'Bấm nút → tỉnh đầu danh sách (An Giang) hiện đúng định dạng',
        },
        {
          stdinLines: ['click #nut-tai'],
          expected: 'li "Hà Nội: 35 do C, có giông"',
          match: 'contains',
          hidden: false,
          label: 'Hà Nội hiện đúng số liệu của API',
        },
        {
          stdinLines: ['click #nut-tai'],
          expected: 'p id="trang-thai" "Da tai 63 tinh"',
          match: 'contains',
          hidden: false,
          label: 'Đếm đủ 63 tỉnh từ độ dài mảng',
        },
        {
          stdinLines: ['click #nut-tai'],
          expected: 'li "Yên Bái: 20 do C, mưa rào"',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: tỉnh CUỐI danh sách cũng phải được render (lặp đủ mảng)',
        },
        {
          // Khớp tuyệt đối cả cây = cách duy nhất khẳng định trang ban đầu CÒN TRỐNG.
          stdinLines: [],
          expected:
            'html lang="vi"\n  head\n    meta charset="utf-8"\n    title "Thoi tiet 63 tinh"\n  body\n    h1 "Thoi tiet 63 tinh"\n    button id="nut-tai" "Tai du lieu"\n    ul id="danh-sach"\n    p id="trang-thai"',
          match: 'exact',
          hidden: true,
          label: 'Ca ẩn: chưa bấm nút → danh sách và trạng thái còn trống',
        },
        {
          stdinLines: ['click #nut-tai', 'click #nut-tai'],
          expected: 'p id="trang-thai" "Da tai 63 tinh"',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: bấm nút HAI lần — không được nhân đôi danh sách (xoá cũ trước khi render)',
        },
      ],
      hints: [
        'Hàm xử lý phải là hàm async: nut.addEventListener("click", async () => { ... }) — không có chữ async thì await bên trong báo lỗi cú pháp.',
        'Chờ HAI lần: const res = await fetch("/api/thoi-tiet") rồi const ds = await res.json(). Thiếu cái thứ hai là ds thành Promise, ds.length ra undefined.',
        'Render: danhSach.textContent = "" để xoá kết quả cũ, rồi for (const tinh of ds) { const li = document.createElement("li"); li.textContent = tinh.ten + ": " + tinh.nhietDo + " do C, " + tinh.troi; danhSach.appendChild(li) }. Cuối cùng: trangThai.textContent = "Da tai " + ds.length + " tinh".',
      ],
      sampleSolution: `const nut = document.getElementById("nut-tai")\nconst danhSach = document.getElementById("danh-sach")\nconst trangThai = document.getElementById("trang-thai")\n\nnut.addEventListener("click", async () => {\n  const res = await fetch("/api/thoi-tiet")\n  const ds = await res.json()\n  danhSach.textContent = ""\n  for (const tinh of ds) {\n    const li = document.createElement("li")\n    li.textContent = tinh.ten + ": " + tinh.nhietDo + " do C, " + tinh.troi\n    danhSach.appendChild(li)\n  }\n  trangThai.textContent = "Da tai " + ds.length + " tinh"\n})`,
    },
    homework:
      'Về nhà: thêm dòng "Dang tai..." vào #trang-thai NGAY khi bấm nút, trước dòng await đầu tiên — với API mẫu thì nó biến mất tức thì, nhưng với mạng thật (vài trăm mili giây tới vài giây) đây chính là trạng thái tải mà mọi app tử tế đều có. Rồi thử đọc thêm: fetch thật còn cần xử lý lỗi mạng bằng try/catch — bài sau bạn sẽ gặp res.ok và lỗi 404.',
    srsCards: [
      {
        hoi: 'Vì sao gọi fetch phải await HAI lần?',
        dap: 'Lần một chờ máy chủ TRẢ LỜI (res = await fetch(url)), lần hai chờ ĐỌC XONG phần thân và đổi JSON thành mảng/object thật (ds = await res.json()). Thiếu lần hai thì ds là Promise, ds.length ra undefined.',
      },
      {
        hoi: 'Khuôn ba bước để biến một phần tử mảng thành thẻ trên trang là gì?',
        dap: 'TẠO → ĐẶT CHỮ → GẮN: document.createElement("li") rồi li.textContent = ... rồi danhSach.appendChild(li). Nhớ xoá kết quả cũ trước khi render, không thì bấm hai lần là danh sách dài gấp đôi.',
      },
      {
        hoi: 'Muốn await bên trong hàm xử lý sự kiện thì viết thế nào?',
        dap: 'Đặt chữ async ngay trước hàm xử lý: nut.addEventListener("click", async () => { ... }). Không có async thì await bên trong báo lỗi cú pháp.',
      },
    ],
  },
  {
    id: 'p3-u7-l2',
    unitId: 'p3-u7',
    language: 'fetch',
    domHtml: TRANG_TRA_CUU,
    title: 'Tra cứu theo tham số — query string và xử lý lỗi 404',
    hook: 'Danh sách 63 dòng là để nhìn; người dùng thật muốn GÕ "Đà Nẵng" và nhận đúng một câu trả lời. Muốn vậy phải gửi kèm câu hỏi trong địa chỉ — và phải sống sót khi người ta gõ một tỉnh không tồn tại.',
    theory:
      'GỬI THAM SỐ TRONG ĐỊA CHỈ — query string: phần sau dấu ? của URL:\n    /api/thoi-tiet?tinh=Hà Nội\nnghĩa là "vẫn API thời tiết, nhưng chỉ lấy tỉnh tên là Hà Nội". Dạng tổng quát: ?ten1=giatri1&ten2=giatri2.\n\nTên tỉnh có dấu, có khoảng trắng — những ký tự không được phép đứng trần trong URL. Luôn bọc giá trị bằng encodeURIComponent():\n    const url = "/api/thoi-tiet?tinh=" + encodeURIComponent(oTinh.value)\nNó đổi "Hà Nội" thành "H%C3%A0%20N%E1%BB%99i" — máy chủ tự giải mã lại. Quên bọc thì tỉnh có ký tự đặc biệt (dấu &, dấu +...) sẽ làm hỏng cả câu hỏi.\n\nKHI MÁY CHỦ NÓI "KHÔNG CÓ" — status code: mọi câu trả lời HTTP mang một mã số:\n    200 = ổn, đây là dữ liệu\n    404 = không tìm thấy thứ bạn hỏi\n    500 = máy chủ hỏng\nfetch cho bạn hai cửa kiểm tra: res.status (con số) và res.ok (true khi status 200–299).\n\nĐIỀU NGƯỢC TRỰC GIÁC NHẤT CỦA fetch: nhận về 404 KHÔNG phải là lỗi theo nghĩa của JavaScript — fetch vẫn resolve bình thường, không ném gì cả (với fetch, "hỏi được và bị trả lời KHÔNG" vẫn là hỏi thành công; nó chỉ ném lỗi khi KHÔNG HỎI ĐƯỢC — mất mạng, sai địa chỉ máy chủ). Nên khuôn chuẩn là:\n    const res = await fetch(url)\n    if (res.ok) {\n      const tinh = await res.json()   // dùng dữ liệu\n    } else {\n      // báo cho người dùng: không tìm thấy\n    }\nQuên kiểm res.ok là app hiện "undefined do C" khi người dùng gõ sai tên — lỗi này ngoài đời nhiều vô kể.\n\nAPI MẪU của sandbox: /api/thoi-tiet?tinh=<tên> trả 200 kèm một object {ten, nhietDo, troi}, hoặc 404 kèm {error} nếu tên không có trong 63 tỉnh. Tên tra không phân biệt hoa thường.',
    workedExample: {
      code: `// Trang có sẵn: ô #o-tinh, nút #nut-tra, đoạn #ket-qua
const oTinh = document.getElementById("o-tinh")
const nut = document.getElementById("nut-tra")
const ketQua = document.getElementById("ket-qua")

nut.addEventListener("click", async () => {
  // Bọc giá trị người gõ bằng encodeURIComponent rồi ghép vào sau ?tinh=
  const url = "/api/thoi-tiet?tinh=" + encodeURIComponent(oTinh.value)
  const res = await fetch(url)
  if (res.ok) {                              // 200 → có dữ liệu
    const tinh = await res.json()
    ketQua.textContent = tinh.ten + ": " + tinh.nhietDo + " do C"
  } else {                                   // 404 → máy chủ nói "không có tỉnh này"
    ketQua.textContent = "Khong co tinh nay (ma loi " + res.status + ")"
  }
})`,
      stdinLines: ['dien #o-tinh = Đà Nẵng', 'click #nut-tra'],
    },
    predict: {
      code: `async function main() {\n  const res = await fetch("/api/thoi-tiet?tinh=Sai Gon")\n  document.getElementById("ket-qua").textContent = "ok=" + res.ok + ", status=" + res.status\n}\nmain()`,
      question: '"Sai Gon" không có trong 63 tỉnh của API mẫu. Đoạn #ket-qua hiện gì?',
      choices: [
        'ok=false, status=404',
        'ok=true, status=200',
        'Không hiện gì vì fetch ném lỗi, chương trình dừng',
        'ok=false, status=500',
      ],
      answerIndex: 0,
      explain:
        'Hỏi một thứ không tồn tại thì máy chủ trả lời 404 — nhưng với fetch đó vẫn là "hỏi thành công", KHÔNG ném lỗi: res về bình thường với ok=false, status=404. Đây là điều ngược trực giác nhất của fetch, và là lý do phải tự tay kiểm res.ok.',
    },
    parsons: {
      prompt: 'Xếp các dòng thành hàm xử lý: tra tỉnh theo ô nhập, có kiểm res.ok trước khi dùng.',
      lines: [
        'nut.addEventListener("click", async () => {',
        '  const url = "/api/thoi-tiet?tinh=" + encodeURIComponent(oTinh.value)',
        '  const res = await fetch(url)',
        '  if (res.ok) {',
        '    const tinh = await res.json()',
        '    ketQua.textContent = tinh.ten + ": " + tinh.nhietDo + " do C"',
        '  } else {',
        '    ketQua.textContent = "Khong tim thay tinh nay"',
        '  }',
        '})',
      ],
    },
    make: {
      prompt:
        'Làm trang tra cứu thời tiết theo tên tỉnh. Trang đã dựng sẵn:\n- ô nhập #o-tinh\n- nút #nut-tra\n- đoạn văn #ket-qua\n\nKhi bấm nút:\n1. Lấy tên tỉnh trong ô, gọi /api/thoi-tiet?tinh=<tên> (bọc tên bằng encodeURIComponent).\n2. Nếu tìm thấy (res.ok): hiện vào #ket-qua đúng dạng:\n<ten>: <nhietDo> do C, <troi>\nDÙNG ten TỪ DỮ LIỆU TRẢ VỀ, không dùng chữ trong ô nhập (người dùng gõ "hà nội" thì vẫn phải hiện "Hà Nội").\n3. Nếu không tìm thấy: hiện đúng dòng: Khong tim thay tinh nay',
      starterCode: `const oTinh = document.getElementById("o-tinh")\nconst nut = document.getElementById("nut-tra")\nconst ketQua = document.getElementById("ket-qua")\n\nnut.addEventListener("click", async () => {\n  // 1. ghép url với encodeURIComponent(oTinh.value) rồi fetch\n  // 2. res.ok ? hiện dữ liệu : hiện "Khong tim thay tinh nay"\n})\n`,
      testCases: [
        {
          stdinLines: ['dien #o-tinh = Đà Nẵng', 'click #nut-tra'],
          expected: 'p id="ket-qua" "Đà Nẵng: 26 do C, mưa rào"',
          match: 'contains',
          hidden: false,
          label: 'Tra "Đà Nẵng" → đúng số liệu của API',
        },
        {
          stdinLines: ['dien #o-tinh = Sai Gon', 'click #nut-tra'],
          expected: 'p id="ket-qua" "Khong tim thay tinh nay"',
          match: 'contains',
          hidden: false,
          label: 'Tỉnh không tồn tại → báo không tìm thấy (kiểm res.ok)',
        },
        {
          stdinLines: ['dien #o-tinh = TP. Hồ Chí Minh', 'click #nut-tra'],
          expected: 'p id="ket-qua" "TP. Hồ Chí Minh: 21 do C, nhiều mây"',
          match: 'contains',
          hidden: false,
          label: 'Tên có dấu chấm, khoảng trắng vẫn tra được (encodeURIComponent)',
        },
        {
          stdinLines: ['dien #o-tinh = hà nội', 'click #nut-tra'],
          expected: 'p id="ket-qua" "Hà Nội: 35 do C, có giông"',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: gõ thường "hà nội" → hiện tên chuẩn TỪ DỮ LIỆU, không phải chữ trong ô',
        },
        {
          stdinLines: [
            'dien #o-tinh = Sai Gon',
            'click #nut-tra',
            'dien #o-tinh = Cần Thơ',
            'click #nut-tra',
          ],
          expected: 'p id="ket-qua" "Cần Thơ: 30 do C, nắng"',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: tra hỏng rồi tra lại đúng — kết quả mới đè thông báo lỗi cũ',
        },
      ],
      hints: [
        'Khuôn giống hệt ví dụ mẫu: hàm xử lý async, ghép url bằng "/api/thoi-tiet?tinh=" + encodeURIComponent(oTinh.value), rồi await fetch(url).',
        'Rẽ nhánh theo res.ok: if (res.ok) { const tinh = await res.json(); ... } else { ketQua.textContent = "Khong tim thay tinh nay" }. Chỉ gọi res.json() ở nhánh ok.',
        'Hiện kết quả từ DỮ LIỆU trả về: ketQua.textContent = tinh.ten + ": " + tinh.nhietDo + " do C, " + tinh.troi — dùng tinh.ten chứ không phải oTinh.value.',
      ],
      sampleSolution: `const oTinh = document.getElementById("o-tinh")\nconst nut = document.getElementById("nut-tra")\nconst ketQua = document.getElementById("ket-qua")\n\nnut.addEventListener("click", async () => {\n  const url = "/api/thoi-tiet?tinh=" + encodeURIComponent(oTinh.value)\n  const res = await fetch(url)\n  if (res.ok) {\n    const tinh = await res.json()\n    ketQua.textContent = tinh.ten + ": " + tinh.nhietDo + " do C, " + tinh.troi\n  } else {\n    ketQua.textContent = "Khong tim thay tinh nay"\n  }\n})`,
    },
    homework:
      'Về nhà: (1) bọc cả khối fetch trong try/catch và hiện "Loi mang, thu lai sau" khi lỗi — trong sandbox hãy tự gây lỗi bằng cách gọi một địa chỉ ngoài /api/thoi-tiet để thấy nhánh catch chạy thật. (2) Ô trống mà bấm nút thì nhắc "Hay nhap ten tinh" ngay, KHÔNG gọi mạng — tiết kiệm một vòng hỏi-đáp vô ích là thói quen của người làm web có nghề.',
    srsCards: [
      {
        hoi: 'fetch nhận về mã 404 thì có ném lỗi không?',
        dap: 'KHÔNG. Với fetch, "hỏi được và bị trả lời KHÔNG" vẫn là hỏi thành công — res về bình thường với ok=false, status=404. Nó chỉ ném lỗi khi KHÔNG HỎI ĐƯỢC (mất mạng, sai địa chỉ). Nên phải tự kiểm res.ok.',
      },
      {
        hoi: 'Vì sao phải bọc giá trị bằng encodeURIComponent khi ghép vào query string?',
        dap: 'Vì tên có dấu, khoảng trắng, dấu & là những ký tự không được đứng trần trong URL. encodeURIComponent("Hà Nội") thành "H%C3%A0%20N%E1%BB%99i"; quên bọc thì câu hỏi gửi lên bị hỏng.',
      },
    ],
  },
]
