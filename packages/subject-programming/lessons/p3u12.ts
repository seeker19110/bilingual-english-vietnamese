// lessons/p3u12.ts — Bài học P3-U12: MILESTONE CHẶNG P3 (PR-L11).
// Đặc tả docs/research/dac-ta-mon-lap-trinh-2026-08-24.md §4 unit 12 ("Dự án — Tổng kết P3 ·
// Web sổ chi tiêu: form nhập → lưu → thống kê").
//
// ĐỀ KHÁC DỰ ÁN TRỤC có chủ đích: dự án trục (cửa hàng) đã có milestone riêng ở chặng P3 của
// nó. Bài này là đề ĐỘC LẬP để học viên chứng minh mình tự ráp được từ đầu — cùng cách bài
// milestone P1-U10 làm (máy bán nước, khác quán nước của dự án trục).
//
// Ráp lại toàn bộ mạch web của bậc: DOM + sự kiện (U6) · mảng/object để gom dữ liệu (U1–U3)
// · render danh sách (U7). Phần LƯU TRỮ (localStorage) không mô phỏng được trong bộ chạy nên
// dạy bằng lý thuyết + việc về nhà — đúng luật "không giả vờ" đã đặt ra ở mạch Git (U10–U11).
import type { ProgrammingLesson } from '../lessonTypes.js'

const TRANG = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>So chi tieu</title>
  </head>
  <body>
    <h1>So chi tieu</h1>
    <label for="o-ten">Ten khoan chi</label>
    <input id="o-ten" type="text" />
    <label for="o-tien">So tien</label>
    <input id="o-tien" type="number" />
    <label for="o-loai">Hang muc</label>
    <input id="o-loai" type="text" />
    <button id="nut-them">Them khoan chi</button>
    <ul id="danh-sach"></ul>
    <p id="tong"></p>
    <ul id="thong-ke"></ul>
  </body>
</html>`

export const P3U12_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p3-u12-l1',
    unitId: 'p3-u12',
    language: 'dom',
    domHtml: TRANG,
    title: 'Milestone P3 — sổ chi tiêu chạy trên web, tự ráp từ đầu',
    hook: 'Cuối bậc rồi. Lần này không ai chia nhỏ đề cho bạn nữa: một trang web thật, có form nhập, có danh sách, có thống kê — thứ mà tháng sau bạn vẫn mở ra dùng để xem tiền đi đâu mất.',
    theory:
      'Bài này không dạy khái niệm mới. Nó bắt bạn RÁP những thứ đã học thành một ứng dụng hoàn chỉnh — và đó chính là kỹ năng mà mọi bài luyện nhỏ không dạy được.\n\nKHUÔN CỦA MỌI ỨNG DỤNG QUẢN LÝ, nhớ khuôn này là làm được vô số app:\n\n1. MỘT NƠI GIỮ DỮ LIỆU — thường là một mảng trong bộ nhớ:\n    const khoanChi = []   // mỗi phần tử: { ten, tien, loai }\n2. THÊM vào dữ liệu khi người dùng thao tác (bấm nút, gửi form).\n3. RENDER LẠI toàn bộ giao diện TỪ dữ liệu đó.\n\nĐiểm mấu chốt nằm ở bước 3, và người mới hay làm ngược: họ vừa thêm vào mảng, vừa tự tay chèn thêm một dòng vào trang. Hai nơi giữ trạng thái thì sớm muộn cũng lệch nhau — xoá một khoản mà con số tổng vẫn như cũ, đó là bug kinh điển. Quy tắc: DỮ LIỆU LÀ SỰ THẬT DUY NHẤT, giao diện chỉ là ảnh chiếu của nó. Mỗi lần dữ liệu đổi thì vẽ lại từ đầu:\n\n    function ve() {\n      danhSach.textContent = ""          // xoá sạch rồi vẽ lại — đơn giản mà không bao giờ lệch\n      for (const k of khoanChi) { ... }\n    }\n\nGOM NHÓM ĐỂ THỐNG KÊ — khuôn đếm bằng object, dùng suốt đời:\n    const theoLoai = {}\n    for (const k of khoanChi) {\n      theoLoai[k.loai] = (theoLoai[k.loai] || 0) + k.tien\n    }\nDòng giữa đọc là: "lấy tổng đang có của hạng mục này, chưa có thì coi như 0, rồi cộng thêm". Không có phần `|| 0` thì lần đầu bạn cộng vào undefined và nhận về NaN.\n\nDUYỆT OBJECT: Object.keys(theoLoai) cho mảng các hạng mục, Object.entries(theoLoai) cho mảng cặp [tên, tổng] — dùng cái nào cũng được, miễn bạn render ra đủ.\n\nVỀ LƯU TRỮ: app thật phải nhớ dữ liệu sau khi tắt trình duyệt, và công cụ cho việc đó là localStorage:\n    localStorage.setItem("chi_tieu", JSON.stringify(khoanChi))\n    const cu = JSON.parse(localStorage.getItem("chi_tieu") || "[]")\nLưu ý localStorage CHỈ chứa được chuỗi, nên phải JSON.stringify lúc ghi và JSON.parse lúc đọc. Bộ chạy của bài học không có localStorage nên phần này KHÔNG nằm trong đề chấm — bạn làm nó ở việc về nhà, trên trang thật của mình.',
    workedExample: {
      code: `// Trang có sẵn: #o-ten, #o-tien, #o-loai, #nut-them, #danh-sach, #tong, #thong-ke
// Ví dụ mẫu làm PHẦN LÕI: giữ dữ liệu trong mảng rồi vẽ lại danh sách sau mỗi lần thêm.

const khoanChi = []                                  // ① nơi giữ dữ liệu — sự thật duy nhất

function ve() {                                      // ③ vẽ lại TỪ dữ liệu
  const ds = document.getElementById("danh-sach")
  ds.textContent = ""                                // xoá sạch, khỏi lo lệch
  for (const k of khoanChi) {
    const li = document.createElement("li")
    li.textContent = k.ten + ": " + k.tien
    ds.appendChild(li)
  }
}

document.getElementById("nut-them").addEventListener("click", () => {
  const ten = document.getElementById("o-ten").value
  const tien = Number(document.getElementById("o-tien").value)  // value là CHUỖI
  khoanChi.push({ ten: ten, tien: tien })            // ② thêm vào dữ liệu
  ve()                                               // rồi vẽ lại
})`,
      stdinLines: ['dien #o-ten = An sang', 'dien #o-tien = 30000', 'click #nut-them'],
    },
    predict: {
      code: `const theoLoai = {}
for (const k of [{ loai: "an", tien: 30000 }, { loai: "an", tien: 20000 }]) {
  theoLoai[k.loai] = theoLoai[k.loai] + k.tien
}
document.getElementById("tong").textContent = "an: " + theoLoai["an"]`,
      question: 'Đoạn này thiếu phần "|| 0" khi cộng dồn. Đoạn #tong hiện chữ gì?',
      choices: ['an: NaN', 'an: 50000', 'an: 20000', 'an: undefined'],
      answerIndex: 0,
      explain:
        'Lần lặp đầu, theoLoai["an"] chưa tồn tại nên trả về undefined; undefined + 30000 ra NaN. Từ đó mọi phép cộng sau đều NaN. Đó là lý do khuôn gom nhóm luôn viết (theoLoai[k.loai] || 0) + k.tien — phần || 0 nói "chưa có thì coi như 0".',
    },
    parsons: {
      prompt: 'Xếp các dòng thành hàm gom tổng tiền theo hạng mục rồi render ra danh sách.',
      lines: [
        'const theoLoai = {}',
        'for (const k of khoanChi) {',
        '  theoLoai[k.loai] = (theoLoai[k.loai] || 0) + k.tien',
        '}',
        'for (const loai of Object.keys(theoLoai)) {',
        '  const li = document.createElement("li")',
        '  li.textContent = loai + ": " + theoLoai[loai]',
        '  thongKe.appendChild(li)',
        '}',
      ],
    },
    make: {
      prompt:
        'Làm sổ chi tiêu chạy trên web. Trang đã dựng sẵn (bạn chỉ viết JavaScript):\n- ô nhập #o-ten, #o-tien, #o-loai\n- nút #nut-them\n- danh sách #danh-sach · đoạn #tong · danh sách #thong-ke\n\nMỗi lần bấm "Them khoan chi", lấy dữ liệu 3 ô rồi cập nhật CẢ BA phần:\n\n1. #danh-sach: mỗi khoản một thẻ <li> đúng dạng:\n<ten> - <tien> (<loai>)\nví dụ: An sang - 30000 (an uong)\n2. #tong: đúng dòng:\nTong chi: <tổng tất cả>\n3. #thong-ke: mỗi HẠNG MỤC một thẻ <li> đúng dạng, theo thứ tự hạng mục xuất hiện lần đầu:\n<loai>: <tổng của hạng mục đó>\n\nBẮT BUỘC: giữ dữ liệu trong MỘT mảng và VẼ LẠI từ mảng đó sau mỗi lần thêm — đừng vừa đẩy vào mảng vừa tự chèn thẻ, hai nơi giữ trạng thái là sớm muộn cũng lệch.\n\nTrang vừa tải xong (chưa bấm nút) thì cả ba phần phải còn trống.',
      starterCode: `const khoanChi = []\n\nfunction ve() {\n  // xoá sạch #danh-sach và #thong-ke rồi vẽ lại từ khoanChi\n  // tính tổng chung cho #tong, gom theo hạng mục cho #thong-ke\n}\n\ndocument.getElementById("nut-them").addEventListener("click", () => {\n  // đọc 3 ô (nhớ Number cho số tiền), push vào khoanChi, rồi gọi ve()\n})\n`,
      testCases: [
        {
          stdinLines: [
            'dien #o-ten = An sang',
            'dien #o-tien = 30000',
            'dien #o-loai = an uong',
            'click #nut-them',
          ],
          expected: 'li "An sang - 30000 (an uong)"',
          match: 'contains',
          hidden: false,
          label: 'Thêm một khoản → hiện đúng dạng trong danh sách',
        },
        {
          stdinLines: [
            'dien #o-ten = An sang',
            'dien #o-tien = 30000',
            'dien #o-loai = an uong',
            'click #nut-them',
            'dien #o-ten = Ca phe',
            'dien #o-tien = 25000',
            'dien #o-loai = an uong',
            'click #nut-them',
          ],
          expected: 'p id="tong" "Tong chi: 55000"',
          match: 'contains',
          hidden: false,
          label: 'Hai khoản → tổng chi cộng dồn đúng',
        },
        {
          stdinLines: [
            'dien #o-ten = An sang',
            'dien #o-tien = 30000',
            'dien #o-loai = an uong',
            'click #nut-them',
            'dien #o-ten = Ca phe',
            'dien #o-tien = 25000',
            'dien #o-loai = an uong',
            'click #nut-them',
            'dien #o-ten = Xang',
            'dien #o-tien = 50000',
            'dien #o-loai = di lai',
            'click #nut-them',
          ],
          expected: 'li "an uong: 55000"',
          match: 'contains',
          hidden: false,
          label: 'Thống kê gom đúng tổng theo hạng mục',
        },
        {
          stdinLines: [
            'dien #o-ten = An sang',
            'dien #o-tien = 30000',
            'dien #o-loai = an uong',
            'click #nut-them',
            'dien #o-ten = Xang',
            'dien #o-tien = 50000',
            'dien #o-loai = di lai',
            'click #nut-them',
          ],
          expected: 'li "di lai: 50000"',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: hạng mục THỨ HAI cũng phải có dòng thống kê riêng',
        },
        {
          stdinLines: [
            'dien #o-ten = An sang',
            'dien #o-tien = 30000',
            'dien #o-loai = an uong',
            'click #nut-them',
            'click #nut-them',
          ],
          expected: 'p id="tong" "Tong chi: 60000"',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: bấm hai lần cùng dữ liệu → hai khoản, KHÔNG nhân đôi danh sách khi vẽ lại',
        },
        {
          // Khớp tuyệt đối cả cây: cách duy nhất khẳng định trang ban đầu CÒN TRỐNG.
          stdinLines: [],
          expected:
            'html lang="vi"\n  head\n    meta charset="utf-8"\n    title "So chi tieu"\n  body\n    h1 "So chi tieu"\n    label for="o-ten" "Ten khoan chi"\n    input id="o-ten" type="text"\n    label for="o-tien" "So tien"\n    input id="o-tien" type="number"\n    label for="o-loai" "Hang muc"\n    input id="o-loai" type="text"\n    button id="nut-them" "Them khoan chi"\n    ul id="danh-sach"\n    p id="tong"\n    ul id="thong-ke"',
          match: 'exact',
          hidden: true,
          label: 'Ca ẩn: chưa bấm nút → cả ba phần còn trống (không tự chạy lúc tải)',
        },
      ],
      hints: [
        'Khuôn ba phần: một mảng khoanChi giữ dữ liệu · hàm ve() vẽ lại TOÀN BỘ từ mảng đó · hàm xử lý click chỉ push vào mảng rồi gọi ve().',
        'Trong ve(), việc đầu tiên là xoá sạch: danhSach.textContent = "" và thongKe.textContent = "". Không xoá thì mỗi lần vẽ lại là danh sách dài thêm một lần nữa.',
        'Gom hạng mục: const theoLoai = {}; for (const k of khoanChi) { theoLoai[k.loai] = (theoLoai[k.loai] || 0) + k.tien }. Rồi duyệt Object.keys(theoLoai) để tạo <li> cho từng hạng mục. Tổng chung cộng dồn trong cùng vòng lặp đó.',
      ],
      sampleSolution: `const khoanChi = []
const danhSach = document.getElementById("danh-sach")
const thongKe = document.getElementById("thong-ke")
const tongEl = document.getElementById("tong")

function ve() {
  danhSach.textContent = ""
  thongKe.textContent = ""
  let tong = 0
  const theoLoai = {}
  for (const k of khoanChi) {
    const li = document.createElement("li")
    li.textContent = k.ten + " - " + k.tien + " (" + k.loai + ")"
    danhSach.appendChild(li)
    tong = tong + k.tien
    theoLoai[k.loai] = (theoLoai[k.loai] || 0) + k.tien
  }
  tongEl.textContent = "Tong chi: " + tong
  for (const loai of Object.keys(theoLoai)) {
    const li = document.createElement("li")
    li.textContent = loai + ": " + theoLoai[loai]
    thongKe.appendChild(li)
  }
}

document.getElementById("nut-them").addEventListener("click", () => {
  const ten = document.getElementById("o-ten").value
  const tien = Number(document.getElementById("o-tien").value)
  const loai = document.getElementById("o-loai").value
  khoanChi.push({ ten: ten, tien: tien, loai: loai })
  ve()
})`,
    },
    homework:
      'Về nhà — biến bài này thành app bạn dùng thật: (1) Thêm lưu trữ bằng localStorage để tắt trình duyệt mở lại vẫn còn dữ liệu: sau mỗi lần ve() thì localStorage.setItem("chi_tieu", JSON.stringify(khoanChi)), và lúc trang tải thì đọc ngược lại bằng JSON.parse(localStorage.getItem("chi_tieu") || "[]"). (2) Thêm nút xoá cho từng khoản — chỉ cần xoá khỏi MẢNG rồi gọi ve(), giao diện tự đúng theo, đó là phần thưởng của việc giữ một nguồn sự thật duy nhất. (3) Đưa trang lên GitHub như bài U10 đã dạy: bạn vừa có sản phẩm thứ hai cho hồ sơ.',
    srsCards: [
      {
        hoi: 'Vì sao không nên vừa push vào mảng vừa tự chèn thẻ vào trang?',
        dap: 'Vì thành hai nơi giữ trạng thái, sớm muộn cũng lệch nhau (xoá một khoản mà tổng vẫn như cũ). Quy tắc: dữ liệu là sự thật duy nhất, mỗi lần nó đổi thì xoá sạch giao diện và vẽ lại từ đầu.',
      },
      {
        hoi: 'Khuôn gom nhóm để thống kê bằng object viết thế nào?',
        dap: 'theoLoai[k.loai] = (theoLoai[k.loai] || 0) + k.tien — đọc là "lấy tổng đang có, chưa có thì coi như 0, rồi cộng thêm". Thiếu || 0 thì lần đầu cộng vào undefined và ra NaN.',
      },
      {
        hoi: 'localStorage lưu được kiểu dữ liệu gì?',
        dap: 'CHỈ lưu được chuỗi. Nên phải JSON.stringify(mang) lúc ghi và JSON.parse(chuoi) lúc đọc. Đọc lần đầu chưa có gì thì dùng || "[]" để có mảng rỗng thay vì null.',
      },
    ],
  },
]
