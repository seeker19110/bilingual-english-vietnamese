// lessons/p3u6b.ts — Bài học P3-U6 (bài 2): DOM & SỰ KIỆN.
// Bậc P3 "Làm được việc thật" — đặc tả docs/research/dac-ta-mon-lap-trinh-2026-08-24.md §4
// ("JS: DOM, sự kiện, thao tác trang — dự án mini: máy tính tiền điện CHẠY TRÊN WEB").
//
// Bài 'dom' đầu tiên (PR-L7d): học viên chỉ viết JavaScript, trang HTML đã cho sẵn ở domHtml.
// Test-case dùng `stdinLines` làm CHUỖI HÀNH ĐỘNG của người dùng (xem domPrelude.ts).
import type { ProgrammingLesson } from '../lessonTypes.js'

const TRANG = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Tinh tien dien</title>
  </head>
  <body>
    <h1>Tinh tien dien</h1>
    <label for="so-kwh">So dien thang nay (kWh)</label>
    <input id="so-kwh" type="number" />
    <button id="nut-tinh">Tinh tien</button>
    <p id="ket-qua"></p>
  </body>
</html>`

export const P3U6B_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p3-u6-l2',
    unitId: 'p3-u6',
    language: 'dom',
    domHtml: TRANG,
    title: 'DOM và sự kiện — làm cho trang phản ứng lại người dùng',
    hook: 'Bài tính tiền điện bậc thang bạn viết ở bậc P1 chạy trong terminal, chỉ mình bạn dùng được. Hôm nay vẫn logic đó, nhưng có ô nhập và cái nút — gửi link cho mẹ bạn là mẹ tự tra được tiền điện. Đó là toàn bộ khác biệt giữa "bài tập" và "thứ dùng được".',
    theory:
      'Trang web sau khi tải xong biến thành một CÂY đối tượng trong bộ nhớ, gọi là DOM. JavaScript sửa cây đó thì trang đổi theo ngay lập tức — không tải lại.\n\nBA VIỆC, làm đi làm lại cả đời:\n\n1. TÌM phần tử\n    document.getElementById("ket-qua")     // theo id, nhanh và rõ\n    document.querySelector("#ket-qua")     // theo bộ chọn CSS, linh hoạt hơn\n    document.querySelectorAll(".mon")      // TẤT CẢ phần tử khớp\n\n2. ĐỌC / SỬA phần tử\n    el.textContent = "Xin chao"    // đổi CHỮ (an toàn, dùng cái này)\n    el.value                       // giá trị đang gõ trong ô input\n    el.classList.add("an")         // thêm/bớt class để đổi giao diện\n\ntextContent hay innerHTML? Dùng textContent. innerHTML nhét cả thẻ HTML vào, nên nếu chữ đó do người dùng gõ thì bạn vừa mở cửa cho người ta chèn mã độc vào trang mình (lỗi XSS). Chỉ dùng innerHTML khi bạn TỰ tạo ra đoạn HTML đó.\n\n3. NGHE sự kiện\n    nut.addEventListener("click", () => { ... })\nDịch ra tiếng Việt: "này nút, mỗi khi bị bấm thì chạy hàm này giúp tôi". Hàm đó gọi là HÀM XỬ LÝ, và nó chạy SAU — vào lúc người dùng bấm, không phải lúc bạn viết.\n\nĐây là chỗ lật ngược cách nghĩ so với bậc P1: chương trình console chạy từ trên xuống rồi kết thúc; trang web thì DỰNG SẴN rồi NGỒI CHỜ. Phần lớn code của bạn nằm trong các hàm chờ được gọi.\n\nBỐN CÁI BẪY, gần như ai cũng dính đủ:\n\n1. input.value LUÔN LÀ CHUỖI, kể cả khi ô có type="number". Quên Number() thì "5" + 1 ra "51". Đây vẫn là cái bẫy bạn gặp ở bài JavaScript trước, nay xuất hiện đúng chỗ nguy hiểm nhất.\n2. Đặt thẻ <script> TRƯỚC nội dung thì getElementById trả về null, vì lúc script chạy thẻ kia chưa tồn tại. Đặt script ở cuối body, hoặc dùng thuộc tính defer.\n3. Gọi NHẦM hàm thay vì truyền hàm: addEventListener("click", tinhTien()) là chạy tinhTien NGAY rồi đưa kết quả cho trình duyệt — phải viết addEventListener("click", tinhTien), không có dấu ngoặc.\n4. Quên rằng hàm xử lý chạy LÚC SAU: biến bạn đọc bên trong nó lấy giá trị tại thời điểm bấm, không phải lúc trang tải.',
    workedExample: {
      code: `// Trang đã có sẵn: ô #so-kwh, nút #nut-tinh, đoạn #ket-qua

const o = document.getElementById("so-kwh")       // ① TÌM các phần tử cần dùng
const nut = document.getElementById("nut-tinh")
const ketQua = document.getElementById("ket-qua")

nut.addEventListener("click", () => {             // ③ NGHE: mỗi khi nút bị bấm...
  const soKwh = Number(o.value)                   // value là CHUỖI -> đổi sang số
  ketQua.textContent = "Ban vua nhap: " + soKwh   // ② SỬA chữ của đoạn văn
})`,
      stdinLines: ['dien #so-kwh = 42', 'click #nut-tinh'],
    },
    predict: {
      code: `const o = document.getElementById("so-kwh")\no.value = "5"\ndocument.getElementById("ket-qua").textContent = o.value + 1`,
      question: 'Ô nhập có type="number" và đang chứa 5. Đoạn này đặt chữ gì vào #ket-qua?',
      choices: ['51', '6', 'NaN', 'Báo lỗi vì cộng chuỗi với số'],
      answerIndex: 0,
      explain:
        'type="number" chỉ ràng buộc thứ người dùng gõ được, KHÔNG đổi kiểu của .value — nó vẫn là chuỗi "5". Nên dấu + nối chuỗi, ra "51". Đây là bẫy số một của bài này: mọi thứ đọc từ ô nhập đều phải Number() trước khi tính.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành đoạn script: bấm nút thì hiện số kWh vừa nhập vào đoạn #ket-qua.',
      lines: [
        'const nut = document.getElementById("nut-tinh")',
        'nut.addEventListener("click", () => {',
        '  const soKwh = Number(document.getElementById("so-kwh").value)',
        '  document.getElementById("ket-qua").textContent = "So kWh: " + soKwh',
        '})',
      ],
    },
    make: {
      prompt:
        'Đưa bài tiền điện bậc thang của bậc P1 lên web. Trang đã dựng sẵn (bạn KHÔNG sửa HTML, chỉ viết JavaScript):\n- ô nhập #so-kwh\n- nút #nut-tinh\n- đoạn văn #ket-qua để hiện kết quả\n\nKhi người dùng bấm nút, tính tiền điện theo bậc thang EVN rồi đặt vào #ket-qua đúng dòng:\nTien dien: <số tiền> dong\n\nBậc thang (giống hệt bài P1-U4):\n- 50 kWh đầu: 1893 đ/kWh\n- 50 kWh tiếp theo (từ 51 đến 100): 1956 đ/kWh\n- từ kWh thứ 101 trở đi: 2271 đ/kWh\n\nVí dụ: 30 kWh → 56.790đ · 60 kWh → 114.210đ · 150 kWh → 306.000đ.\n\nLƯU Ý: chỉ tính KHI BẤM NÚT. Trang vừa tải xong thì #ket-qua phải còn trống.',
      starterCode: `const o = document.getElementById("so-kwh")\nconst nut = document.getElementById("nut-tinh")\nconst ketQua = document.getElementById("ket-qua")\n\nnut.addEventListener("click", () => {\n  // Đọc số kWh (nhớ đổi kiểu!), tính tiền bậc thang, rồi đặt vào ketQua.textContent\n})\n`,
      testCases: [
        {
          stdinLines: ['dien #so-kwh = 30', 'click #nut-tinh'],
          expected: 'p id="ket-qua" "Tien dien: 56790 dong"',
          match: 'contains',
          hidden: false,
          label: '30 kWh → 56.790đ (chỉ nằm trong bậc 1)',
        },
        {
          stdinLines: ['dien #so-kwh = 60', 'click #nut-tinh'],
          expected: 'p id="ket-qua" "Tien dien: 114210 dong"',
          match: 'contains',
          hidden: false,
          label: '60 kWh → 114.210đ (bắc qua bậc 2)',
        },
        {
          stdinLines: ['dien #so-kwh = 150', 'click #nut-tinh'],
          expected: 'p id="ket-qua" "Tien dien: 306000 dong"',
          match: 'contains',
          hidden: false,
          label: '150 kWh → 306.000đ (đủ cả ba bậc)',
        },
        {
          stdinLines: ['dien #so-kwh = 50', 'click #nut-tinh'],
          expected: 'p id="ket-qua" "Tien dien: 94650 dong"',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đúng 50 kWh — RANH GIỚI giữa bậc 1 và bậc 2',
        },
        {
          stdinLines: ['dien #so-kwh = 0', 'click #nut-tinh'],
          expected: 'p id="ket-qua" "Tien dien: 0 dong"',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 0 kWh → 0 đồng, không được ra NaN',
        },
        {
          // Chấm KHỚP TUYỆT ĐỐI cả cây: cách duy nhất khẳng định #ket-qua CÒN TRỐNG (so
          // 'contains' một dòng sẽ khớp cả khi dòng đó đã có chữ đằng sau).
          stdinLines: [],
          expected:
            'html lang="vi"\n  head\n    meta charset="utf-8"\n    title "Tinh tien dien"\n  body\n    h1 "Tinh tien dien"\n    label for="so-kwh" "So dien thang nay (kWh)"\n    input id="so-kwh" type="number"\n    button id="nut-tinh" "Tinh tien"\n    p id="ket-qua"',
          match: 'exact',
          hidden: true,
          label:
            'Ca ẩn: trang vừa tải, CHƯA bấm nút → #ket-qua còn trống (tính sẵn lúc tải là sai)',
        },
      ],
      hints: [
        'Toàn bộ phần tính toán phải nằm BÊN TRONG hàm xử lý của addEventListener — viết ở ngoài là nó chạy ngay lúc trang tải, trước khi người dùng kịp nhập gì.',
        'Đọc số: const soKwh = Number(o.value). Thiếu Number() thì mọi phép cộng sẽ nối chuỗi và bạn ra những con số kỳ quái.',
        'Logic bậc thang y hệt bài P1-U4, chỉ đổi cách viết sang JavaScript: if (soKwh <= 50) { tien = soKwh * 1893 } else if (soKwh <= 100) { tien = 50 * 1893 + (soKwh - 50) * 1956 } else { ... }. Cuối cùng: ketQua.textContent = "Tien dien: " + tien + " dong".',
      ],
      sampleSolution: `const o = document.getElementById("so-kwh")\nconst nut = document.getElementById("nut-tinh")\nconst ketQua = document.getElementById("ket-qua")\n\nnut.addEventListener("click", () => {\n  const soKwh = Number(o.value)\n  let tien = 0\n  if (soKwh <= 50) {\n    tien = soKwh * 1893\n  } else if (soKwh <= 100) {\n    tien = 50 * 1893 + (soKwh - 50) * 1956\n  } else {\n    tien = 50 * 1893 + 50 * 1956 + (soKwh - 100) * 2271\n  }\n  ketQua.textContent = "Tien dien: " + tien + " dong"\n})`,
    },
    homework:
      'Về nhà: thêm hai thứ vào trang này. (1) Nhập số âm hoặc bỏ trống thì hiện "Vui long nhap so kWh hop le" thay vì ra kết quả kỳ quái — dùng lại thói quen kiểm dữ liệu nhập từ bậc P2. (2) Bấm phím Enter trong ô nhập cũng tính luôn, không bắt người ta rời tay khỏi bàn phím (nghe sự kiện "keydown" và kiểm e.key === "Enter"). Thứ hai này chính là khác biệt giữa trang chạy được và trang dùng thấy sướng.',
  },
]
