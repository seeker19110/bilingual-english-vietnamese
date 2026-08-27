// lessons/p6u16.ts — P6-U16: HƯỚNG WEB, chặng S1 — trình duyệt thật sự làm gì (module
// `web-s1-m1`) và bố cục/HTML ngữ nghĩa (`web-s1-m2`).
//
// Vì sao unit này nằm ở P6 mà mã lại nhảy lên u16: dải `p6-u5…p6-u15` đã được CHƯƠNG TRÌNH M
// (mở rộng ngôn ngữ: Kotlin · Swift · paradigm) giữ chỗ theo `PROGRESS.md`. Nội dung hướng
// chuyên sâu bắt đầu từ `p6-u16` để hai dòng việc không tranh mã unit của nhau.
//
// Hai bài, đúng thứ tự người học cần: l1 EVENT LOOP (vì sao trang "đứng hình" — nguyên nhân
// số một của web chậm mà không ai đọc ra từ code), l2 HTML NGỮ NGHĨA + bố cục (thứ quyết
// định trang có dùng được bằng bàn phím và trình đọc màn hình hay không).
//
// Bài l1 mô phỏng hàng đợi bằng code ĐỒNG BỘ chứ không dùng setTimeout thật: bộ chạy bài học
// thu output ngay sau khi code chạy xong, nên callback hẹn giờ sẽ không kịp chạy — và quan
// trọng hơn, mô phỏng buộc học viên phải NÓI RA luật xếp hàng thay vì đoán mò kết quả.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U16_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u16-l1',
    unitId: 'p6-u16',
    language: 'javascript',
    title: 'Event loop — vì sao trang web "đứng hình"',
    hook: 'Bạn bấm nút "Tính tổng đơn", trang đơ ba giây: gõ không được, cuộn không được, cả cái vòng xoay đang quay cũng đứng luôn. Không có lỗi nào trong console. Máy vẫn còn 90% CPU rảnh. Nguyên nhân gần như luôn là một: bạn đã chiếm mất luồng DUY NHẤT mà trình duyệt dùng để vẽ giao diện.',
    theory:
      'Trình duyệt chạy JavaScript của trang trên MỘT luồng duy nhất — cùng luồng nó dùng để tính bố cục và vẽ pixel. Nên "đứng hình" không phải là máy yếu: nó là luồng đó đang bận chạy code của bạn và chưa quay lại vẽ được.\n\nEVENT LOOP là luật xếp hàng cho luồng đó. Có ba nhóm việc:\n\n1. VIỆC ĐỒNG BỘ (ngay): mọi dòng code đang chạy. Chạy tới hết, không ai chen vào được.\n2. MICROTASK (vi): việc của `Promise.then`, `await`, `queueMicrotask`. Chạy NGAY SAU khi khối đồng bộ hiện tại kết thúc — và chạy CẠN hàng đợi mới thôi.\n3. MACROTASK (lớn): `setTimeout`, sự kiện click, phản hồi mạng. Mỗi vòng lặp chỉ lấy MỘT việc lớn ra chạy.\n\nMột vòng của event loop, đơn giản hoá nhưng đúng ở phần quan trọng:\n  chạy hết khối đồng bộ → chạy CẠN microtask → (trình duyệt có cơ hội vẽ lại) → lấy MỘT macrotask → lại chạy cạn microtask → …\n\nBa hệ quả nghề nghiệp rút ra được ngay:\n\n· `setTimeout(f, 0)` KHÔNG có nghĩa "chạy ngay". Nó có nghĩa "xếp f vào cuối hàng việc lớn". Mọi microtask đang chờ đều chạy trước nó.\n· Vòng lặp nặng 3 giây làm trang đơ đúng 3 giây, vì trình duyệt chỉ được vẽ lại GIỮA các việc, không phải trong lúc việc đang chạy. Muốn không đơ thì phải CẮT việc ra nhiều mẩu và trả luồng về giữa các mẩu (hoặc đẩy sang Web Worker).\n· Đệ quy microtask không bao giờ nhả luồng: một `Promise.then` tự xếp lại chính nó sẽ làm trang treo VĨNH VIỄN mà CPU vẫn nhìn như đang chạy bình thường — vì hàng microtask phải cạn thì vòng lặp mới đi tiếp.\n\nCái đáng nhớ nhất không phải tên gọi, mà là câu hỏi bạn phải tự hỏi mỗi khi viết một việc tốn thời gian: "đoạn này chiếm luồng vẽ trong bao lâu?" Chuẩn INP của Core Web Vitals (dự án DHCB đặt ngưỡng ≤ 200ms) chính là đo con số đó.',
    workedExample: {
      code: `// Mô phỏng LUẬT XẾP HÀNG của event loop bằng code đồng bộ, để nhìn thấy thứ tự.
// Mỗi việc: { ten, loai } với loai = "ngay" | "vi" | "lon".
const VIEC = [
  { ten: "ve-khung", loai: "ngay" },
  { ten: "hen-gio-0ms", loai: "lon" },
  { ten: "promise-then", loai: "vi" },
  { ten: "doc-cau-hinh", loai: "ngay" },
]

function thuTuChay(danhSach) {
  const ngay = danhSach.filter((v) => v.loai === "ngay") // khối đồng bộ: chạy tới hết
  const vi = danhSach.filter((v) => v.loai === "vi")     // microtask: chạy CẠN ngay sau đó
  const lon = danhSach.filter((v) => v.loai === "lon")   // macrotask: mỗi vòng MỘT việc
  return [...ngay, ...vi, ...lon].map((v) => v.ten)
}

console.log("Thu tu:", thuTuChay(VIEC).join(", "))
// Đọc kết quả: "hen-gio-0ms" đứng SAU "promise-then" dù trong mảng nó đứng trước —
// setTimeout 0ms không hề chạy trước một Promise đã sẵn sàng.`,
      stdinLines: [],
    },
    predict: {
      code: `// Cách xếp hàng SAI mà ai cũng làm lần đầu: cứ chạy theo đúng thứ tự viết
const VIEC = [
  { ten: "ve-khung", loai: "ngay" },
  { ten: "hen-gio-0ms", loai: "lon" },
  { ten: "promise-then", loai: "vi" },
]

console.log(VIEC.map((v) => v.ten).join(", "))`,
      question: 'Đoạn này in ra gì?',
      choices: [
        've-khung, hen-gio-0ms, promise-then',
        've-khung, promise-then, hen-gio-0ms',
        'promise-then, ve-khung, hen-gio-0ms',
        'hen-gio-0ms, promise-then, ve-khung',
      ],
      answerIndex: 0,
      explain:
        'Đoạn code này chỉ in lại mảng theo đúng thứ tự viết, nên kết quả là "ve-khung, hen-gio-0ms, promise-then". Điều đáng nhớ là TRÌNH DUYỆT KHÔNG chạy theo thứ tự đó: nó chạy hết việc đồng bộ, rồi chạy cạn microtask, rồi mới tới macrotask — tức thứ tự thật phải là "ve-khung, promise-then, hen-gio-0ms" (lựa chọn thứ hai). Khoảng cách giữa hai chuỗi này chính là toàn bộ bài học: setTimeout 0ms không hề chạy trước một Promise đã sẵn sàng, dù bạn viết nó trước.',
    },
    parsons: {
      prompt: 'Xếp lại hàm mô phỏng thứ tự chạy — chú ý nhóm nào phải đứng trước nhóm nào.',
      lines: [
        'function thuTuChay(danhSach) {',
        '  const ngay = danhSach.filter((v) => v.loai === "ngay")',
        '  const vi = danhSach.filter((v) => v.loai === "vi")',
        '  const lon = danhSach.filter((v) => v.loai === "lon")',
        '  return [...ngay, ...vi, ...lon].map((v) => v.ten)',
        '}',
      ],
    },
    make: {
      prompt:
        'Viết hàm thuTuChay(danhSach) trả về MẢNG TÊN các việc theo đúng thứ tự event loop chạy chúng.\n\nMỗi việc là { ten, loai } với loai là "ngay" (đồng bộ), "vi" (microtask) hoặc "lon" (macrotask). Một việc "lon" có thể kèm trường sinhVi: "<tên>" — nghĩa là khi chạy xong, nó xếp thêm MỘT microtask vào hàng.\n\nLuật phải mô phỏng đúng:\n  ① Mọi việc "ngay" chạy trước, theo đúng thứ tự trong mảng.\n  ② Rồi chạy CẠN hàng microtask đang chờ, theo thứ tự.\n  ③ Rồi lấy MỘT việc "lon"; chạy xong thì microtask nó vừa sinh ra phải chạy NGAY, trước việc "lon" kế tiếp.\n  ④ Lặp lại ③ tới khi hết việc lớn.\n\nGiữ nguyên phần in kết quả ở cuối.',
      starterCode: `function thuTuChay(danhSach) {
  // TODO: viết theo 4 luật trong đề
  return []
}

// ---- Đừng sửa phần dưới đây ----
const danhSach = JSON.parse(input(""))
console.log("Thu tu:", thuTuChay(danhSach).join(", "))`,
      testCases: [
        {
          stdinLines: [
            '[{"ten":"a","loai":"ngay"},{"ten":"b","loai":"lon"},{"ten":"c","loai":"vi"},{"ten":"d","loai":"ngay"}]',
          ],
          expected: 'Thu tu: a, d, c, b',
          match: 'contains',
          hidden: false,
          label: 'Đồng bộ trước → microtask → macrotask (setTimeout 0ms vẫn xếp cuối)',
        },
        {
          stdinLines: ['[{"ten":"t1","loai":"lon","sinhVi":"t1-vi"},{"ten":"t2","loai":"lon"}]'],
          expected: 'Thu tu: t1, t1-vi, t2',
          match: 'contains',
          hidden: false,
          label: 'Microtask do một macrotask sinh ra phải chạy TRƯỚC macrotask kế tiếp',
        },
        {
          stdinLines: [
            '[{"ten":"v1","loai":"vi"},{"ten":"v2","loai":"vi"},{"ten":"s","loai":"ngay"}]',
          ],
          expected: 'Thu tu: s, v1, v2',
          match: 'contains',
          hidden: false,
          label: 'Hàng microtask chạy CẠN, giữ nguyên thứ tự xếp hàng',
        },
        {
          stdinLines: [
            '[{"ten":"m1","loai":"lon","sinhVi":"m1-vi"},{"ten":"m2","loai":"lon","sinhVi":"m2-vi"},{"ten":"x","loai":"ngay"},{"ten":"y","loai":"vi"}]',
          ],
          expected: 'Thu tu: x, y, m1, m1-vi, m2, m2-vi',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — trộn đủ ba nhóm, có microtask sinh thêm ở mỗi vòng',
        },
      ],
      hints: [
        'Tách mảng đầu vào thành ba nhóm trước đã: việc "ngay", việc "vi", việc "lon". Thứ tự bên trong mỗi nhóm giữ nguyên như trong mảng.',
        'Kết quả bắt đầu bằng toàn bộ nhóm "ngay", rồi tới toàn bộ nhóm "vi" đang chờ. Phần khó chỉ nằm ở nhóm "lon".',
        'Với nhóm "lon": duyệt từng việc một, đẩy tên nó vào kết quả, và NẾU nó có sinhVi thì đẩy luôn tên microtask đó vào ngay sau — trước khi sang việc lớn kế tiếp.',
        'Khung tham chiếu:\n\nfunction thuTuChay(danhSach) {\n  const ketQua = []\n  for (const v of danhSach) if (v.loai === "ngay") ketQua.push(v.ten)\n  for (const v of danhSach) if (v.loai === "vi") ketQua.push(v.ten)\n  for (const v of danhSach) {\n    if (v.loai !== "lon") continue\n    ketQua.push(v.ten)\n    if (v.sinhVi) ketQua.push(v.sinhVi)\n  }\n  return ketQua\n}',
      ],
      sampleSolution: `function thuTuChay(danhSach) {
  const ketQua = []
  // ① khối đồng bộ chạy tới hết, đúng thứ tự viết
  for (const v of danhSach) {
    if (v.loai === "ngay") ketQua.push(v.ten)
  }
  // ② rồi chạy CẠN hàng microtask đang chờ
  for (const v of danhSach) {
    if (v.loai === "vi") ketQua.push(v.ten)
  }
  // ③ mỗi vòng MỘT việc lớn; microtask nó sinh ra chạy ngay sau nó
  for (const v of danhSach) {
    if (v.loai !== "lon") continue
    ketQua.push(v.ten)
    if (v.sinhVi) ketQua.push(v.sinhVi)
  }
  return ketQua
}

// ---- Đừng sửa phần dưới đây ----
const danhSach = JSON.parse(input(""))
console.log("Thu tu:", thuTuChay(danhSach).join(", "))`,
    },
    homework:
      'Mở một trang bạn hay dùng, bật DevTools → tab Performance, bấm ghi rồi tương tác vài lần. Tìm thanh "Long task" (việc dài hơn 50ms) và đọc xem hàm nào chiếm luồng. Sau đó thử tự tạo một long task: viết vòng lặp cộng 300 triệu lần trong một trang trắng có ô input, rồi vừa chạy vừa gõ chữ — bạn sẽ thấy chữ chỉ hiện ra SAU khi vòng lặp xong. Đó chính là thứ người dùng của bạn gặp mỗi lần bạn quên hỏi "đoạn này chiếm luồng vẽ bao lâu?".',
    srsCards: [
      {
        hoi: 'setTimeout(f, 0) nghĩa là gì trong event loop?',
        dap: 'Không phải "chạy ngay", mà là "xếp f vào cuối hàng MACROTASK". Mọi microtask đang chờ (Promise.then, await) đều chạy xong trước f.',
      },
      {
        hoi: 'Vì sao một vòng lặp nặng làm trang đơ, dù CPU còn rảnh?',
        dap: 'Vì JavaScript của trang và việc vẽ giao diện dùng CHUNG một luồng. Trình duyệt chỉ vẽ lại được GIỮA các việc, nên việc nào chạy 3 giây thì trang đứng hình đúng 3 giây.',
      },
      {
        hoi: 'Microtask và macrotask khác nhau ở luật chạy nào?',
        dap: 'Microtask chạy CẠN cả hàng ngay sau khối đồng bộ hiện tại; macrotask mỗi vòng event loop chỉ lấy ra MỘT việc, và sau việc đó lại chạy cạn microtask mới sinh.',
      },
    ],
  },
  {
    id: 'p6-u16-l2',
    unitId: 'p6-u16',
    language: 'html',
    title: 'Bố cục hiện đại: Grid cho khung, Flex cho hàng — và màu lấy từ token',
    hook: 'Trang quản trị của bạn đẹp trên máy bạn. Mở trên điện thoại của khách: hai cột chen nhau, chữ tràn ra ngoài, và cái nút "Lưu" nằm dưới đường gấp màn hình nên không ai bấm. Không phải bạn thiếu CSS — bạn đã chọn nhầm công cụ cho từng việc, và đã ghi cứng màu ở 40 chỗ.',
    theory:
      'Ba quyết định nhỏ dưới đây tách một trang "chạy được" khỏi một trang dùng được thật.\n\n① GRID hay FLEX? Đừng chọn theo cảm giác, chọn theo SỐ CHIỀU bạn cần điều khiển:\n· Grid — bạn muốn quyết định cả HÀNG và CỘT (khung trang: sidebar + nội dung; lưới thẻ sản phẩm).\n· Flex — bạn xếp các phần tử theo MỘT chiều và muốn chúng tự chia chỗ (thanh công cụ, một dòng có tên món bên trái và giá bên phải).\nCâu hỏi tự hỏi: "tôi đang xếp một dòng, hay đang chia một mặt phẳng?" Dòng thì Flex, mặt phẳng thì Grid. Chúng KHÔNG cạnh tranh nhau — khung ngoài Grid, bên trong mỗi ô là Flex, là chuyện rất bình thường.\n\n② MOBILE-FIRST không phải khẩu hiệu, nó là thứ tự viết CSS. Viết luật cho màn hẹp làm mặc định (một cột, không cần media query), rồi mới THÊM luật cho màn rộng:\n  .luoi { display: grid; grid-template-columns: 1fr }\n  @media (min-width: 700px) { .luoi { grid-template-columns: 1fr 1fr } }\nLàm ngược lại (viết cho desktop rồi gỡ dần) khiến điện thoại — nơi đa số người Việt truy cập — phải tải và ghi đè cả đống luật không dùng, và mọi lỗi bố cục đều rơi vào đúng nhóm người dùng đông nhất.\n\n③ TOKEN thay vì màu ghi cứng. Khai giá trị dùng chung một lần ở `:root` bằng biến CSS, rồi mọi nơi đọc qua `var(...)`:\n  :root { --mau-vien: #cccccc; --khoang-cach: 12px }\n  .the { border: 1px solid var(--mau-vien) }\nVì sao đây là luật bắt buộc trong dự án DHCB (CLAUDE.md mục 4.8): app có 4 theme. Màu ghi cứng nghĩa là đổi theme phải đi sửa từng chỗ, và chắc chắn sót — mà chỗ sót thường là chỗ chữ trùng màu nền, tức là một lỗi tương phản a11y. Sửa token thì cả 4 theme cùng đúng.\n\nMột lưu ý về đơn vị: dùng `rem` cho cỡ chữ và khoảng cách chính, `px` cho những thứ thật sự là một chấm màn hình (viền 1px). `rem` đi theo cỡ chữ người dùng đã đặt trong trình duyệt — người mắt kém chỉnh cỡ chữ lên thì trang bạn giãn theo, thay vì giữ nguyên chữ bé tí.',
    workedExample: {
      code: `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Bang quan tri cua hang</title>
    <style>
      /* Token: khai MỘT lần, dùng khắp nơi -> đổi theme chỉ sửa ở đây */
      :root {
        --mau-vien: #cccccc;
        --khoang-cach: 12px;
      }

      /* Mặc định = màn HẸP: một cột. Không cần media query cho trường hợp này. */
      .luoi {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--khoang-cach);
      }

      /* Bên trong mỗi ô là MỘT DÒNG -> đây là việc của flex, không phải grid */
      .the-mon {
        display: flex;
        justify-content: space-between;
        border: 1px solid var(--mau-vien);
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Bang quan tri cua hang</h1>
      <ul class="luoi">
        <li class="the-mon"><span>Ca phe sua</span><span>25000d</span></li>
        <li class="the-mon"><span>Tra da</span><span>5000d</span></li>
      </ul>
    </main>
  </body>
</html>`,
      stdinLines: [],
    },
    predict: {
      code: `<!doctype html>
<html lang="vi">
  <body>
    <style>
      .thanh { display: flex; }
    </style>
    <div class="thanh"><span>Ten mon</span><span>Gia</span></div>
  </body>
</html>`,
      question: 'Bản mô tả cây của trang này chứa dòng nào?',
      choices: [
        'div class="thanh"',
        'div class="flex"',
        'div style="display: flex"',
        'flex class="thanh"',
      ],
      answerIndex: 0,
      explain:
        'Trang chỉ có một thẻ `div` mang `class="thanh"`, nên cây DOM ghi đúng như vậy. Ba lựa chọn kia bắt đúng ba hiểu nhầm hay gặp: CSS KHÔNG đổi tên class của thẻ (`class="flex"` không tự sinh ra), luật trong `<style>` KHÔNG biến thành thuộc tính `style` trên thẻ, và `flex` là một GIÁ TRỊ của thuộc tính `display` chứ không phải một tên thẻ. Cây DOM là cấu trúc; CSS chỉ quyết định cấu trúc đó được VẼ ra sao.',
    },
    parsons: {
      prompt:
        'Xếp lại khối CSS mobile-first: token trước, luật mặc định cho màn hẹp, rồi mới tới luật màn rộng.',
      lines: [
        ':root {',
        '  --khoang-cach: 12px;',
        '}',
        '.luoi {',
        '  display: grid;',
        '  grid-template-columns: 1fr;',
        '  gap: var(--khoang-cach);',
        '}',
        '@media (min-width: 700px) {',
        '  .luoi { grid-template-columns: 1fr 1fr; }',
        '}',
      ],
    },
    make: {
      prompt:
        'Hoàn thiện CSS cho bảng quản trị. Giữ nguyên phần HTML, chỉ viết vào thẻ <style>.\n\nCần ĐÚNG ba luật sau (đúng bộ chọn, đúng các khai báo — không thừa không thiếu). Gõ giá trị đúng y như ghi ở đây:\n\n1. :root — hai token dùng chung:\n   --khoang-cach: 12px\n   --mau-vien: #cccccc\n\n2. .luoi — khung lưới, MẶC ĐỊNH cho màn hẹp là MỘT cột, khoảng cách lấy từ token:\n   display: grid\n   grid-template-columns: 1fr\n   gap: var(--khoang-cach)\n\n3. .the-mon — một DÒNG có tên món bên trái, giá bên phải, viền lấy từ token:\n   display: flex\n   justify-content: space-between\n   border: 1px solid var(--mau-vien)\n\nKhông ghi cứng màu #cccccc ở luật .the-mon — phải đọc qua var(), đó chính là điểm của bài.',
      starterCode: `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Bang quan tri cua hang</title>
    <style>
      /* Viết 3 luật :root, .luoi, .the-mon ở đây */
    </style>
  </head>
  <body>
    <main>
      <h1>Bang quan tri cua hang</h1>
      <ul class="luoi">
        <li class="the-mon"><span>Ca phe sua</span><span>25000d</span></li>
        <li class="the-mon"><span>Tra da</span><span>5000d</span></li>
      </ul>
    </main>
  </body>
</html>
`,
      testCases: [
        {
          stdinLines: [],
          expected: ':root { --khoang-cach: 12px; --mau-vien: #cccccc }',
          match: 'contains',
          hidden: false,
          label: 'Token khai ở :root — một chỗ duy nhất cho cả trang',
        },
        {
          stdinLines: [],
          expected: '.luoi { display: grid; gap: var(--khoang-cach); grid-template-columns: 1fr }',
          match: 'contains',
          hidden: false,
          label: 'Lưới mobile-first: mặc định MỘT cột, khoảng cách đọc từ token',
        },
        {
          stdinLines: [],
          expected:
            '.the-mon { border: 1px solid var(--mau-vien); display: flex; justify-content: space-between }',
          match: 'contains',
          hidden: false,
          label: 'Một dòng hai đầu bằng flex, viền đọc từ token (không ghi cứng màu)',
        },
        {
          stdinLines: [],
          expected: 'ul class="luoi"',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — không được sửa HTML để "chữa" bố cục thay vì sửa CSS',
        },
      ],
      hints: [
        'Biến CSS phải bắt đầu bằng hai dấu gạch ngang: `--khoang-cach`, không phải `khoang-cach`. Khai chúng trong luật `:root` để mọi thẻ trong trang đều đọc được.',
        'Đọc lại một token bằng `var(--ten-token)`, ví dụ `gap: var(--khoang-cach);`. Viết thẳng `gap: --khoang-cach` là sai cú pháp và trình duyệt bỏ qua luật đó.',
        'Grid cho KHUNG (chia mặt phẳng: `.luoi`), flex cho MỘT DÒNG (`.the-mon`). Nếu bạn đang định dùng grid cho `.the-mon` thì hãy hỏi lại: ở đây có mấy chiều cần điều khiển?',
        'Khung tham chiếu:\n\n:root {\n  --khoang-cach: 12px;\n  --mau-vien: #cccccc;\n}\n\n.luoi {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: var(--khoang-cach);\n}\n\n.the-mon {\n  display: flex;\n  justify-content: space-between;\n  border: 1px solid var(--mau-vien);\n}',
      ],
      sampleSolution: `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Bang quan tri cua hang</title>
    <style>
      :root {
        --khoang-cach: 12px;
        --mau-vien: #cccccc;
      }

      .luoi {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--khoang-cach);
      }

      .the-mon {
        display: flex;
        justify-content: space-between;
        border: 1px solid var(--mau-vien);
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Bang quan tri cua hang</h1>
      <ul class="luoi">
        <li class="the-mon"><span>Ca phe sua</span><span>25000d</span></li>
        <li class="the-mon"><span>Tra da</span><span>5000d</span></li>
      </ul>
    </main>
  </body>
</html>`,
    },
    homework:
      'Mở một trang bạn đã làm (hoặc trang bất kỳ bạn hay dùng), bật DevTools và thu hẹp cửa sổ tới cỡ điện thoại. Ghi ra ba chỗ vỡ bố cục đầu tiên bạn thấy. Với mỗi chỗ, tự trả lời: chỗ này đang xếp MỘT DÒNG hay đang chia MẶT PHẲNG? Rồi sửa bằng đúng công cụ tương ứng. Sau đó tìm trong CSS của bạn mọi mã màu ghi cứng và gom chúng thành token ở :root — đếm xem có bao nhiêu chỗ, con số đó chính là số chỗ bạn sẽ phải sửa tay mỗi lần đổi theme nếu không gom.',
    srsCards: [
      {
        hoi: 'Khi nào dùng Grid, khi nào dùng Flex?',
        dap: 'Grid khi cần điều khiển CẢ hàng và cột (chia một mặt phẳng: khung trang, lưới thẻ). Flex khi xếp theo MỘT chiều (một dòng công cụ, tên bên trái giá bên phải). Lồng nhau là bình thường: khung Grid, trong ô là Flex.',
      },
      {
        hoi: 'Mobile-first nghĩa là viết CSS theo thứ tự nào?',
        dap: 'Luật cho màn HẸP viết làm mặc định (không media query), rồi mới thêm @media (min-width: …) cho màn rộng. Viết ngược lại bắt điện thoại tải và ghi đè cả đống luật không dùng.',
      },
      {
        hoi: 'Vì sao dự án cấm ghi cứng mã màu trong CSS?',
        dap: 'Vì app có 4 theme: màu ghi cứng nghĩa là mỗi lần đổi theme phải sửa tay từng chỗ và chắc chắn sót — chỗ sót thường thành lỗi tương phản a11y. Khai token ở :root rồi đọc qua var() thì sửa một chỗ, cả 4 theme cùng đúng.',
      },
    ],
  },
]
