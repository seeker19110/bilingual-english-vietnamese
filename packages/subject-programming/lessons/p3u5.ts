// lessons/p3u5.ts — Bài học P3-U5: CSS (box model, flex, mobile-first).
// Bậc P3 "Làm được việc thật" — đặc tả docs/research/dac-ta-mon-lap-trinh-2026-08-24.md §4.
//
// GIỚI HẠN CỦA BỘ CHẤM, người soạn phải biết: bài chấm phần KHAI BÁO CSS đã chuẩn hoá
// (htmlPrelude.chuanHoaCss), KHÔNG đo kết quả hiển thị thật (muốn đo phải có trình duyệt
// thật + đo layout). Vì vậy đề bài phải nói RÕ cần đúng những khai báo nào, đừng ra đề kiểu
// "làm cho đẹp" rồi chấm bằng chuỗi.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P3U5_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p3-u5-l1',
    unitId: 'p3-u5',
    language: 'html',
    title: 'CSS — hộp, khoảng thở, và hàng ngang không cần vật lộn',
    hook: 'Trang HTML bài trước đúng chuẩn nhưng nhìn như tài liệu năm 1998: chữ đè sát nhau, menu xếp dọc một cột dài thượt. CSS là lớp trang điểm — nhưng chỉ cần hiểu ĐÚNG HAI thứ là đủ dùng 80% thời gian: hộp và flex.',
    theory:
      'CSS gắn vào trang bằng thẻ <style> đặt trong <head>:\n\n    <style>\n      .menu { display: flex; gap: 12px; }\n    </style>\n\nMỗi LUẬT gồm bộ chọn + các khai báo:\n\n    .menu      { display: flex;  gap: 12px; }\n    ^bộ chọn     ^thuộc tính:giá trị\n\nBA KIỂU BỘ CHỌN hay dùng:\n    p          -> mọi thẻ p\n    .mon       -> mọi thẻ có class="mon"   (dấu chấm = class, DÙNG CÁI NÀY LÀ CHÍNH)\n    #tieu-de   -> thẻ có id="tieu-de"      (id là duy nhất trên trang)\n\nMÔ HÌNH HỘP (box model) — mọi thẻ đều là một cái hộp gồm 4 lớp, từ trong ra ngoài:\n    nội dung -> padding (đệm bên TRONG viền) -> border (viền) -> margin (khoảng cách bên NGOÀI)\nNhớ mẹo: padding là lớp lót trong hộp quà, margin là khoảng trống giữa các hộp trên bàn. Chữ chạm sát viền thì thêm padding; hai khối dính nhau thì thêm margin.\n\nFLEX — xếp hàng ngang, thứ mà người mới hay vật lộn cả buổi:\n    .menu { display: flex; gap: 12px; }\ndisplay: flex biến các con TRỰC TIẾP thành hàng ngang; gap là khoảng cách giữa chúng. Ba thuộc tính đi kèm hay dùng: justify-content (dồn theo chiều ngang), align-items (canh theo chiều dọc), flex-wrap: wrap (chật thì xuống dòng thay vì tràn).\n\nMOBILE-FIRST — luật của dự án này: viết CSS cho MÀN HÌNH NHỎ trước, rồi mới thêm phần cho màn lớn:\n\n    .menu { display: flex; flex-wrap: wrap; }        /* mặc định: điện thoại */\n    @media (min-width: 768px) { .menu { gap: 24px; } }   /* màn rộng thì thoáng hơn */\n\nLàm ngược lại (desktop trước rồi "sửa" cho mobile) là cách sinh ra những trang vỡ trên điện thoại — mà phần lớn khách của quán bạn dùng điện thoại.\n\nHAI ĐIỀU NÊN BIẾT SỚM:\n1. Vùng bấm được phải đủ to cho ngón tay: tối thiểu 44×44 pixel. Nút bé xíu là lỗi dùng được, không phải lỗi thẩm mỹ.\n2. Màu chữ phải tương phản đủ với nền. Chữ xám nhạt trên nền trắng nhìn "sang" trên máy bạn, nhưng ra nắng thì không ai đọc nổi.\n\nLƯU Ý VỀ CÁCH CHẤM BÀI NÀY: bộ chấm đọc các KHAI BÁO CSS bạn viết (đã chuẩn hoá, nên thứ tự gõ không quan trọng), chứ không đo trang hiển thị thật. Vì vậy đề sẽ nói rõ cần đúng những khai báo nào — còn việc trang có đẹp không thì bạn tự nhìn ở khung xem trang bên cạnh.',
    workedExample: {
      code: `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Tiem banh Nha Lan</title>
    <style>
      /* Mobile-first: mặc định là cho màn hình nhỏ */
      body { font-family: sans-serif; margin: 16px; }

      .menu {
        display: flex;        /* các li thành hàng ngang */
        flex-wrap: wrap;      /* chật thì xuống dòng, không tràn */
        gap: 12px;            /* khoảng cách giữa các món */
        list-style: none;     /* bỏ dấu chấm đầu dòng */
        padding: 0;
      }

      .mon {
        border: 1px solid #ccc;   /* viền hộp */
        border-radius: 8px;
        padding: 12px;            /* đệm bên trong, cho chữ khỏi chạm viền */
      }
    </style>
  </head>
  <body>
    <h1>Tiem banh Nha Lan</h1>
    <ul class="menu">
      <li class="mon">Banh mi thit</li>
      <li class="mon">Banh ngot</li>
    </ul>
  </body>
</html>`,
      stdinLines: [],
    },
    predict: {
      code: `<!doctype html><html lang="vi"><head><style>.a{gap:8px;display:flex}</style></head><body><p class="a">x</p></body></html>`,
      question:
        'Bộ chấm chuẩn hoá CSS trước khi so. Khai báo gõ theo thứ tự gap rồi display sẽ hiện ra thế nào?',
      choices: [
        '.a { display: flex; gap: 8px }',
        '.a { gap: 8px; display: flex }',
        '.a { display:flex;gap:8px }',
        'Báo lỗi vì thiếu dấu chấm phẩy cuối',
      ],
      answerIndex: 0,
      explain:
        'Bộ chấm sắp các khai báo theo bảng chữ cái (display trước gap) và chuẩn hoá khoảng trắng, nên bạn gõ thứ tự nào cũng được — điều đó có chủ đích: thứ tự khai báo trong một luật CSS không làm đổi kết quả hiển thị, nên nó không đáng để bắt lỗi. Dấu chấm phẩy cuối cùng cũng có thể bỏ.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành luật CSS xếp menu thành hàng ngang, cách nhau 12px, xuống dòng khi chật.',
      lines: ['.menu {', '  display: flex;', '  flex-wrap: wrap;', '  gap: 12px;', '}'],
    },
    make: {
      prompt:
        'Làm đẹp trang quán cà phê bằng CSS. Giữ nguyên phần HTML đã cho trong starter code, chỉ thêm nội dung vào thẻ <style>.\n\nCần ĐÚNG hai luật sau (đúng bộ chọn, đúng các khai báo — không thừa không thiếu):\n\n1. .menu — xếp menu thành hàng ngang, các món cách nhau 12px:\n   display: flex\n   gap: 12px\n\n2. .mon — mỗi món là một cái hộp có viền và có đệm bên trong:\n   border: 1px solid #ccc\n   padding: 12px\n\nThứ tự bạn gõ các khai báo không quan trọng (bộ chấm tự sắp lại), nhưng đừng thêm khai báo nào khác vào hai luật này.',
      starterCode: `<!doctype html>\n<html lang="vi">\n  <head>\n    <meta charset="utf-8" />\n    <title>Quan Ca Phe Goc Pho</title>\n    <style>\n      /* Viết 2 luật .menu và .mon ở đây */\n    </style>\n  </head>\n  <body>\n    <h1>Quan Ca Phe Goc Pho</h1>\n    <ul class="menu">\n      <li class="mon">Ca phe den</li>\n      <li class="mon">Tra da</li>\n    </ul>\n  </body>\n</html>\n`,
      testCases: [
        {
          stdinLines: [],
          expected: '.menu { display: flex; gap: 12px }',
          match: 'contains',
          hidden: false,
          label: 'Luật .menu có đúng display: flex và gap: 12px',
        },
        {
          stdinLines: [],
          expected: '.mon { border: 1px solid #ccc; padding: 12px }',
          match: 'contains',
          hidden: false,
          label: 'Luật .mon có đúng border và padding (padding = đệm BÊN TRONG viền)',
        },
        {
          stdinLines: [],
          expected: 'ul class="menu"\n      li class="mon" "Ca phe den"',
          match: 'contains',
          hidden: false,
          label: 'HTML giữ nguyên: các li vẫn nằm trong ul và vẫn mang đúng class',
        },
        {
          stdinLines: [],
          expected: 'html lang="vi"',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: không được làm hỏng bộ khung chuẩn khi thêm CSS',
        },
      ],
      hints: [
        'CSS viết BÊN TRONG thẻ <style> đã có sẵn trong starter code, không viết vào body.',
        'Một luật gồm bộ chọn rồi dấu ngoặc nhọn: .menu { ... }. Nhớ dấu chấm ở đầu — .menu nghĩa là "thẻ nào có class menu"; viết menu không dấu chấm là tìm thẻ tên <menu>.',
        'Mỗi khai báo có dạng thuoc-tinh: gia-tri; ví dụ display: flex; và gap: 12px; — dấu hai chấm ngăn tên với giá trị, dấu chấm phẩy kết thúc khai báo.',
      ],
      sampleSolution: `<!doctype html>\n<html lang="vi">\n  <head>\n    <meta charset="utf-8" />\n    <title>Quan Ca Phe Goc Pho</title>\n    <style>\n      .menu {\n        display: flex;\n        gap: 12px;\n      }\n\n      .mon {\n        border: 1px solid #ccc;\n        padding: 12px;\n      }\n    </style>\n  </head>\n  <body>\n    <h1>Quan Ca Phe Goc Pho</h1>\n    <ul class="menu">\n      <li class="mon">Ca phe den</li>\n      <li class="mon">Tra da</li>\n    </ul>\n  </body>\n</html>`,
    },
    homework:
      'Về nhà: mở trang CV bạn viết ở bài trước và làm đẹp nó — nhưng thử theo thứ tự này: thu cửa sổ trình duyệt còn hẹp như điện thoại TRƯỚC, làm cho vừa mắt ở khổ đó, rồi mới kéo rộng ra. Đó chính là mobile-first. Xong thì bấm Ctrl và cuộn để phóng to 200%: chữ có còn đọc được, nút có còn bấm được không? Nếu vỡ, đó là bài học đáng giá hơn mọi lời khuyên về màu sắc.',
  },
]
