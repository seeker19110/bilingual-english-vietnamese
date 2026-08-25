// lessons/p3u9.ts — Bài học P3-U9: SQL NÂNG CAO (JOIN, GROUP BY).
// Bậc P3 "Làm được việc thật" — đặc tả docs/research/dac-ta-mon-lap-trinh-2026-08-24.md §4.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P3U9_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p3-u9-l1',
    unitId: 'p3-u9',
    language: 'sql',
    title: 'JOIN và GROUP BY — nối bảng lại rồi tổng hợp thành báo cáo',
    hook: 'Bảng chi_tiet chỉ ghi mon_id = 2, không ghi "Cà phê sữa"; nó cũng không ghi giá. Muốn biết món nào ra tiền nhất, bạn phải NỐI hai bảng lại rồi CỘNG theo nhóm. Đây đúng là cái báo cáo doanh thu mà chủ quán hỏi bạn mỗi tối.',
    theory:
      'VÌ SAO DỮ LIỆU BỊ TÁCH RA NHIỀU BẢNG? Vì không lặp lại. Nếu mỗi dòng bán hàng đều chép tên và giá món, thì đổi giá một món là phải sửa hàng nghìn dòng, và chỉ cần sót một dòng là số liệu sai vĩnh viễn. Nên bảng chi_tiet chỉ giữ mon_id — một con trỏ tới bảng mon. Đó gọi là KHOÁ NGOẠI.\n\nJOIN = ghép dòng của hai bảng theo điều kiện khớp:\n\n    SELECT chi_tiet.so_luong, mon.ten\n    FROM chi_tiet\n    JOIN mon ON chi_tiet.mon_id = mon.id;\n\nMệnh đề ON là LUẬT GHÉP: dòng nào của chi_tiet có mon_id bằng id của dòng nào trong mon thì hai dòng đó dính lại thành một. Khi tên cột trùng nhau ở hai bảng (cả hai đều có id), phải ghi rõ bang.cot.\n\nĐặt biệt danh cho gọn — quy ước phổ biến trong mọi dự án:\n    FROM chi_tiet ct JOIN mon m ON ct.mon_id = m.id\n\nGROUP BY = gom các dòng giống nhau lại thành MỘT dòng, rồi tính trên từng nhóm:\n\n    SELECT nhom, COUNT(*) AS so_mon, SUM(gia) AS tong_gia\n    FROM mon\n    GROUP BY nhom;\n\nCác hàm tổng hợp: COUNT(*) đếm dòng · SUM(x) cộng · AVG(x) trung bình · MIN/MAX.\n\nLUẬT VÀNG của GROUP BY: mọi cột trong SELECT phải HOẶC nằm trong GROUP BY, HOẶC nằm trong một hàm tổng hợp. Viết SELECT ten, SUM(...) mà GROUP BY nhom là vô nghĩa — một nhóm có nhiều tên, máy biết in tên nào?\n\nWHERE hay HAVING? Nhớ theo thời điểm: WHERE lọc TRƯỚC khi gom nhóm (lọc từng dòng), HAVING lọc SAU khi đã gom (lọc từng nhóm, dùng được kết quả của SUM/COUNT).\n    ... GROUP BY m.ten HAVING SUM(ct.so_luong * m.gia) > 50000\n\nHAI CÁI BẪY:\n1. JOIN NHÂN DÒNG. Một đơn có 3 món thì sau khi nối, đơn đó thành 3 dòng. Nên COUNT(*) sau JOIN đếm số DÒNG ĐÃ NỐI, không phải số đơn — muốn đếm đơn phải COUNT(DISTINCT don_hang.id).\n2. HOÀ ĐIỂM THÌ THỨ TỰ KHÔNG XÁC ĐỊNH. ORDER BY tong DESC mà hai nhóm bằng nhau thì máy in nhóm nào trước cũng hợp lệ. Muốn kết quả ổn định (và test không lúc xanh lúc đỏ) phải thêm tiêu chí phụ: ORDER BY tong DESC, ten ASC.',
    workedExample: {
      code: `-- ① Nối hai bảng: mỗi dòng bán hàng nay biết tên và giá món
SELECT ct.don_id, m.ten, ct.so_luong, m.gia
FROM chi_tiet ct
JOIN mon m ON ct.mon_id = m.id;

-- ② Gom nhóm và cộng: doanh thu theo NHÓM hàng (uong / an)
SELECT m.nhom, SUM(ct.so_luong * m.gia) AS doanh_thu
FROM chi_tiet ct
JOIN mon m ON ct.mon_id = m.id
GROUP BY m.nhom
ORDER BY doanh_thu DESC;

-- ③ Bẫy JOIN nhân dòng: đếm DÒNG khác đếm ĐƠN
SELECT COUNT(*) AS so_dong, COUNT(DISTINCT ct.don_id) AS so_don
FROM chi_tiet ct
JOIN mon m ON ct.mon_id = m.id;`,
      stdinLines: [],
    },
    predict: {
      code: `SELECT COUNT(*) AS so FROM don_hang JOIN chi_tiet ON don_hang.id = chi_tiet.don_id;`,
      question:
        'Quán có 4 đơn hàng, bảng chi_tiet có 7 dòng món. Câu đếm sau khi JOIN trả về số mấy?',
      choices: ['4', '7', '11', '28'],
      answerIndex: 1,
      explain:
        'JOIN nhân dòng: mỗi đơn nở ra thành đúng số món của nó, nên kết quả là 7 — số dòng chi tiết, KHÔNG phải 4 đơn. Đây là lý do báo cáo hay bị thổi phồng: đếm nhầm dòng đã nối thành số đơn. Muốn 4 thì phải COUNT(DISTINCT don_hang.id).',
    },
    parsons: {
      prompt: 'Xếp các dòng sau thành câu truy vấn: đếm số món trong mỗi nhóm hàng của bảng mon.',
      lines: [
        'SELECT nhom, COUNT(*) AS so_mon',
        'FROM mon',
        'GROUP BY nhom',
        'ORDER BY so_mon DESC, nhom ASC;',
      ],
    },
    make: {
      prompt:
        'Chủ quán muốn biết MÓN NÀO RA TIỀN NHẤT.\n\nViết MỘT câu truy vấn nối bảng chi_tiet với bảng mon, rồi tính doanh thu từng món:\n- Doanh thu của một dòng bán hàng = so_luong × gia.\n- Gom theo TÊN MÓN.\n- Hai cột: ten và doanh_thu (đúng tên đó).\n- Sắp xếp doanh thu GIẢM DẦN; hai món bằng nhau thì xếp theo tên TĂNG DẦN (A trước) để kết quả ổn định.\n\nChỉ những món ĐÃ TỪNG BÁN mới xuất hiện (JOIN thường tự loại món chưa bán lần nào).',
      starterCode: `SELECT m.ten, ...\nFROM chi_tiet ct\nJOIN mon m ON ...\n-- Thêm GROUP BY và ORDER BY (nhớ tiêu chí phụ cho ca hoà)\n`,
      testCases: [
        {
          stdinLines: [],
          expected:
            'ten | doanh_thu\nCa phe sua | 100000\nCa phe den | 40000\nBanh ngot | 30000\nNuoc cam | 30000\nBanh mi | 20000\nTra da | 20000',
          match: 'exact',
          hidden: false,
          label:
            'Đúng 6 món đã bán, đúng thứ tự. Có HAI cặp hoà điểm (30.000đ và 20.000đ) nên thiếu tiêu chí phụ ORDER BY ... ten ASC là sai thứ tự.',
        },
      ],
      hints: [
        'Doanh thu mỗi dòng là một biểu thức, cộng lại bằng hàm tổng hợp: SUM(ct.so_luong * m.gia) AS doanh_thu.',
        'Luật vàng: cột m.ten có trong SELECT thì phải có trong GROUP BY m.ten; còn doanh_thu đã nằm trong SUM(...) nên không cần.',
        'Ca hoà điểm quyết định đúng/sai ở bài này: ORDER BY doanh_thu DESC, m.ten ASC. Bỏ vế sau thì thứ tự Bánh ngọt/Nước cam là tuỳ máy, hôm nay đúng mai sai.',
      ],
      sampleSolution: `SELECT m.ten, SUM(ct.so_luong * m.gia) AS doanh_thu\nFROM chi_tiet ct\nJOIN mon m ON ct.mon_id = m.id\nGROUP BY m.ten\nORDER BY doanh_thu DESC, m.ten ASC;`,
    },
    homework:
      'Về nhà: viết tiếp 2 câu báo cáo trên chính kho dữ liệu này — (1) doanh thu theo NGÀY (nối thêm bảng don_hang), (2) những món có doanh thu trên 25.000đ (dùng HAVING, không dùng WHERE — hãy thử cả hai để tận mắt thấy vì sao WHERE không làm được). Sau đó tự hỏi: nếu quán có 50.000 dòng bán hàng, đoạn Python bậc P2 của bạn và câu SQL này, cái nào bạn muốn phải sửa khi sếp đổi câu hỏi?',
    srsCards: [
      {
        hoi: 'Sau khi JOIN chi_tiet với mon, COUNT(*) đếm ra số dòng gì — số đơn hay số dòng đã nối?',
        dap: 'Đếm số DÒNG ĐÃ NỐI, không phải số đơn — một đơn có nhiều món thì nở ra nhiều dòng. Muốn đếm đúng số đơn phải dùng COUNT(DISTINCT don_hang.id).',
      },
      {
        hoi: 'WHERE và HAVING khác nhau ở thời điểm lọc nào trong câu truy vấn GROUP BY?',
        dap: 'WHERE lọc TỪNG DÒNG trước khi gom nhóm; HAVING lọc TỪNG NHÓM sau khi đã gom, nên HAVING mới dùng được kết quả của SUM/COUNT còn WHERE thì không.',
      },
      {
        hoi: 'Vì sao dữ liệu bán hàng thường tách ra nhiều bảng (chi_tiet chỉ ghi mon_id) thay vì chép luôn tên và giá món vào từng dòng?',
        dap: 'Để không lặp lại dữ liệu — nếu mỗi dòng bán hàng đều chép tên/giá món, đổi giá một món phải sửa hàng nghìn dòng và chỉ sót một dòng là số liệu sai vĩnh viễn.',
      },
    ],
  },
]
