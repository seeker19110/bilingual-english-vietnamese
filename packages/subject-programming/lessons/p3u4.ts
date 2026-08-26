// lessons/p3u4.ts — Bài học P3-U4: HTML (cấu trúc trang, thẻ ngữ nghĩa).
// Bậc P3 "Làm được việc thật" — đặc tả docs/research/dac-ta-mon-lap-trinh-2026-08-24.md §4.
//
// Bài HTML ĐẦU TIÊN của môn (PR-L7c). Chấm trên BẢN MÔ TẢ CÂY DOM (htmlPrelude.ts) chứ không
// so chuỗi HTML thô — học viên thụt lề kiểu gì cũng được, cái được chấm là cấu trúc.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P3U4_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p3-u4-l1',
    unitId: 'p3-u4',
    language: 'html',
    title: 'HTML — dựng bộ khung của trang web, và dựng cho ĐÚNG NGHĨA',
    hook: 'Quán của bạn đã có máy tính tiền chạy trong terminal, nhưng khách không mở terminal. Họ mở điện thoại. Buổi này bạn dựng trang giới thiệu quán — và học ngay từ bài đầu cách viết HTML mà máy đọc màn hình cũng hiểu, chứ không phải bày chữ cho đẹp mắt là xong.',
    theory:
      'HTML KHÔNG PHẢI NGÔN NGỮ LẬP TRÌNH. Không có biến, không có if, không có vòng lặp. Nó là ngôn ngữ ĐÁNH DẤU: bạn bọc nội dung trong các thẻ để nói "đây là tiêu đề", "đây là danh sách", "đây là liên kết".\n\nBộ khung tối thiểu của MỌI trang:\n\n    <!doctype html>\n    <html lang="vi">\n      <head>\n        <meta charset="utf-8" />\n        <title>Ten trang</title>\n      </head>\n      <body>\n        ... nội dung người ta nhìn thấy ...\n      </body>\n    </html>\n\n- <!doctype html>: báo cho trình duyệt biết đây là HTML hiện đại.\n- lang="vi": trang bằng tiếng Việt. Máy đọc màn hình dựa vào đây để đọc đúng giọng — bỏ đi là người khiếm thị nghe tiếng Việt bằng giọng tiếng Anh.\n- <meta charset="utf-8" />: thiếu dòng này là tiếng Việt có dấu biến thành ký tự lạ.\n- <head> chứa thông tin VỀ trang (không hiện ra); <body> chứa thứ người ta THẤY.\n\nCác thẻ hay dùng nhất:\n    <h1>..</h1> đến <h6>..</h6>   tiêu đề, h1 là to nhất\n    <p>..</p>                     đoạn văn\n    <ul><li>..</li></ul>          danh sách không thứ tự (gạch đầu dòng)\n    <ol><li>..</li></ol>          danh sách CÓ thứ tự (đánh số)\n    <a href="...">..</a>          liên kết\n    <img src="..." alt="..." />   ảnh — thẻ TỰ ĐÓNG, không có thẻ đóng riêng\n    <div>, <span>                 hộp chứa không mang ý nghĩa gì\n\nBA LUẬT PHẢI THUỘC:\n\n1. THẺ ĐÓNG ĐÚNG THỨ TỰ, lồng nhau như hộp trong hộp. <p><b>chu</b></p> đúng; <p><b>chu</p></b> sai — mở sau thì phải đóng trước.\n\n2. CHỌN THẺ THEO Ý NGHĨA, KHÔNG THEO HÌNH DẠNG. Cần chữ to đậm thì dùng <h1> vì nó LÀ tiêu đề, đừng dùng <div> rồi tô CSS cho to. Lý do không phải sạch code: máy đọc màn hình, Google, và phím Tab đều dựa vào ý nghĩa của thẻ. Dùng <div> cho mọi thứ là trang vẫn "nhìn" ổn nhưng người khiếm thị không dùng được.\n\n3. THỨ TỰ TIÊU ĐỀ KHÔNG ĐƯỢC NHẢY CÓC. Một h1 cho tiêu đề chính của trang, rồi h2 cho các mục, h3 cho mục con. Nhảy từ h1 xuống h3 làm người dùng máy đọc màn hình mất phương hướng — họ duyệt trang bằng danh sách tiêu đề.\n\nẢNH LUÔN PHẢI CÓ alt: <img src="quan.jpg" alt="Mat tien quan ca phe" />. alt là câu mô tả cho người không thấy được ảnh. Ảnh chỉ để trang trí thì để alt="" (rỗng) — như vậy máy đọc sẽ bỏ qua, còn thiếu hẳn alt thì nó đọc tên file, rất khó chịu.',
    workedExample: {
      code: `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Tiem banh Nha Lan</title>
  </head>
  <body>
    <h1>Tiem banh Nha Lan</h1>
    <p>Banh mi nong moi sang, giao tan noi trong ban kinh 3km.</p>

    <h2>Mon ban chay</h2>
    <ul>
      <li>Banh mi thit - 20000d</li>
      <li>Banh ngot - 15000d</li>
    </ul>

    <a href="tel:0912345678">Goi dat banh</a>
  </body>
</html>`,
      stdinLines: [],
    },
    predict: {
      code: `<!doctype html><html lang="vi"><body><ul><li>Mot<li>Hai</ul></body></html>`,
      question:
        'Đoạn này QUÊN đóng thẻ <li>. Trình duyệt dựng cây DOM ra sao — nó bỏ qua, tự sửa, hay báo lỗi?',
      choices: [
        'li "Mot"',
        'li "MotHai"',
        'li "Mot Hai"',
        'Trang trắng vì trình duyệt từ chối dựng',
      ],
      answerIndex: 0,
      explain:
        'HTML rất "khoan dung": trình duyệt tự đóng thẻ giúp bạn, nên vẫn ra HAI thẻ li riêng biệt. Đây là con dao hai lưỡi — code sai vẫn chạy nên bạn không biết mình sai, cho tới hôm gặp trường hợp trình duyệt đoán khác ý mình. Cứ đóng thẻ đầy đủ.',
    },
    parsons: {
      prompt: 'Xếp các dòng sau thành bộ khung HTML tối thiểu, đúng thứ tự lồng nhau.',
      lines: [
        '<!doctype html>',
        '<html lang="vi">',
        '  <head>',
        '    <meta charset="utf-8" />',
        '    <title>Quan cua toi</title>',
        '  </head>',
        '  <body>',
        '    <h1>Quan cua toi</h1>',
        '  </body>',
        '</html>',
      ],
    },
    make: {
      prompt:
        'Dựng trang giới thiệu quán cà phê. Viết trang HTML đầy đủ gồm:\n\n1. Bộ khung chuẩn: <!doctype html>, thẻ html có lang="vi", <meta charset="utf-8" />, và <title> ghi "Quan Ca Phe Goc Pho".\n2. Trong body:\n   - Một <h1> ghi "Quan Ca Phe Goc Pho".\n   - Một <p> ghi "Ca phe pha phin, mo tu 6 gio sang den 10 gio toi."\n   - Một <h2> ghi "Menu".\n   - Một <ul> chứa ĐÚNG 3 thẻ <li>: "Ca phe den - 20000d", "Ca phe sua - 25000d", "Tra da - 5000d".\n   - Một liên kết <a href="tel:0900123456"> ghi "Goi dat ban".\n\nViết không dấu như trên cho khớp. Bạn thụt lề và xuống dòng thế nào cũng được — bài chấm CẤU TRÚC trang chứ không chấm cách gõ.',
      starterCode: `<!doctype html>\n<html lang="vi">\n  <head>\n    <meta charset="utf-8" />\n    <!-- Thêm title -->\n  </head>\n  <body>\n    <!-- Thêm h1, p, h2, ul với 3 li, và a -->\n  </body>\n</html>\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'html lang="vi"',
          match: 'contains',
          hidden: false,
          label: 'Thẻ html khai báo lang="vi" (máy đọc màn hình cần, không phải trang trí)',
        },
        {
          stdinLines: [],
          expected: 'meta charset="utf-8"',
          match: 'contains',
          hidden: false,
          label: 'Có <meta charset="utf-8" /> — thiếu là tiếng Việt có dấu thành ký tự lạ',
        },
        {
          stdinLines: [],
          expected: 'h1 "Quan Ca Phe Goc Pho"',
          match: 'contains',
          hidden: false,
          label: 'Tiêu đề chính là h1 (không phải div tô to)',
        },
        {
          stdinLines: [],
          expected:
            'ul\n      li "Ca phe den - 20000d"\n      li "Ca phe sua - 25000d"\n      li "Tra da - 5000d"',
          match: 'contains',
          hidden: false,
          label: 'Menu là <ul> chứa đúng 3 <li>, đúng thứ tự — mỗi li lồng TRONG ul',
        },
        {
          stdinLines: [],
          expected: 'a href="tel:0900123456" "Goi dat ban"',
          match: 'contains',
          hidden: false,
          label: 'Liên kết gọi điện có đúng href và đúng chữ hiển thị',
        },
        {
          stdinLines: [],
          expected: 'title "Quan Ca Phe Goc Pho"',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: <title> nằm trong <head> (tên hiện trên tab trình duyệt)',
        },
        {
          stdinLines: [],
          expected: 'h2 "Menu"',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: mục Menu dùng h2 — không nhảy cóc từ h1 xuống h3',
        },
      ],
      hints: [
        'Bắt đầu từ starter code đã cho: nó đã có sẵn bộ khung, bạn chỉ cần điền <title> vào head và các thẻ nội dung vào body.',
        'Danh sách gồm MỘT thẻ <ul> bọc ngoài, bên trong là ba thẻ <li>. Đừng viết ba thẻ <ul> riêng — như vậy là ba danh sách một món, không phải một menu ba món.',
        'Liên kết viết đủ hai phần: địa chỉ nằm trong href, chữ hiển thị nằm GIỮA hai thẻ: <a href="tel:0900123456">Goi dat ban</a>.',
      ],
      sampleSolution: `<!doctype html>\n<html lang="vi">\n  <head>\n    <meta charset="utf-8" />\n    <title>Quan Ca Phe Goc Pho</title>\n  </head>\n  <body>\n    <h1>Quan Ca Phe Goc Pho</h1>\n    <p>Ca phe pha phin, mo tu 6 gio sang den 10 gio toi.</p>\n    <h2>Menu</h2>\n    <ul>\n      <li>Ca phe den - 20000d</li>\n      <li>Ca phe sua - 25000d</li>\n      <li>Tra da - 5000d</li>\n    </ul>\n    <a href="tel:0900123456">Goi dat ban</a>\n  </body>\n</html>`,
    },
    homework:
      'Về nhà: dựng trang giới thiệu CHÍNH BẠN — tên, một đoạn tự giới thiệu, danh sách 3 việc bạn làm được, liên kết tới Facebook hoặc email. Sau đó bấm Tab liên tục trên trang và xem con trỏ nhảy tới đâu: nếu liên kết của bạn không nhận được Tab thì bạn đã dùng sai thẻ. Trang này sẽ là bản CV tĩnh bạn làm đẹp ở bài sau.',
    srsCards: [
      {
        hoi: 'Vì sao nên chọn thẻ HTML theo Ý NGHĨA (vd h1 cho tiêu đề) thay vì chỉ theo hình dạng chữ to đậm?',
        dap: 'Vì máy đọc màn hình, công cụ tìm kiếm và phím Tab đều dựa vào ý nghĩa của thẻ để hiểu và điều hướng trang — dùng div tô CSS cho to thì trang vẫn nhìn ổn nhưng người khiếm thị không dùng được.',
      },
      {
        hoi: 'Ảnh trang trí không mang thông tin gì thì thuộc tính alt nên viết ra sao?',
        dap: 'alt="" (rỗng) để máy đọc màn hình bỏ qua ảnh đó. Thiếu hẳn thuộc tính alt thì máy đọc sẽ đọc tên file ảnh, rất khó chịu cho người dùng.',
      },
      {
        hoi: 'Thứ tự tiêu đề h1, h2, h3... trên một trang có được nhảy cóc không? Vì sao?',
        dap: 'Không nên. Người dùng máy đọc màn hình duyệt trang bằng danh sách tiêu đề, nhảy từ h1 thẳng xuống h3 khiến họ mất phương hướng về cấu trúc trang.',
      },
    ],
  },
]
