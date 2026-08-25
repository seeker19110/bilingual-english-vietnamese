// lessons/p3u8.ts — Bài học P3-U8: SQL CƠ BẢN (SELECT/WHERE/ORDER BY/LIMIT).
// Bậc P3 "Làm được việc thật" — đặc tả docs/research/dac-ta-mon-lap-trinh-2026-08-24.md §4.
//
// Bài SQL ĐẦU TIÊN của môn (PR-L7b2). Chạy trên SQLite thật (sql.js) với kho dữ liệu mẫu
// dùng chung ở sqlDataset.ts — mỗi lượt chạy là một CSDL sạch.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P3U8_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p3-u8-l1',
    unitId: 'p3-u8',
    language: 'sql',
    title: 'SQL — hỏi dữ liệu bằng câu, thay vì viết vòng lặp',
    hook: 'Ở bậc P2 bạn mở file CSV, đọc từng dòng, lọc bằng if, cộng bằng vòng lặp. SQL đảo ngược việc đó: bạn MÔ TẢ thứ mình muốn, còn cách lấy để máy lo. Và đây là kỹ năng dùng được cả đời — kế toán, marketing, vận hành đều tra dữ liệu bằng SQL, không riêng dân lập trình.',
    theory:
      'CSDL quan hệ là các BẢNG có cột và dòng — giống hệt trang tính Excel, khác ở chỗ mỗi cột có kiểu cố định và bảng có thể nối với nhau.\n\nKho dữ liệu của quán trong bài này có bảng mon:\n    id | ten        | nhom | gia\n    1  | Ca phe den | uong | 20000\n    ...\n\nCÂU LỆNH SELECT — đọc theo đúng thứ tự máy làm, không phải thứ tự bạn viết:\n\n    SELECT ten, gia      -- ④ lấy ra cột nào\n    FROM mon             -- ① từ bảng nào\n    WHERE nhom = \'uong\'  -- ② giữ lại dòng nào\n    ORDER BY gia DESC    -- ③ sắp xếp thế nào\n    LIMIT 3;             -- ⑤ lấy mấy dòng đầu\n\nBốn mảnh ghép, nhớ theo việc chúng làm:\n- FROM: chọn bảng.\n- WHERE: LỌC DÒNG. Toán tử: = (bằng — MỘT dấu bằng, không phải == như Python), <>, <, >, <=, >=, BETWEEN a AND b, IN (...), LIKE \'%ca phe%\' (% là "gì cũng được").\n- ORDER BY: sắp xếp. ASC tăng dần (mặc định), DESC giảm dần.\n- LIMIT n: chỉ lấy n dòng đầu — luôn dùng khi mới dò dữ liệu lạ, đừng kéo về 2 triệu dòng.\n\nBỐN CÁI BẪY của người mới:\n1. Chuỗi phải bọc NHÁY ĐƠN: \'uong\'. Nháy kép trong SQL nghĩa là TÊN CỘT, nên "uong" sẽ báo lỗi "không có cột uong".\n2. So sánh bằng dùng MỘT dấu =, khác Python.\n3. Kết thúc câu bằng dấu chấm phẩy.\n4. NULL không phải 0, cũng không phải chuỗi rỗng — nó là "không có dữ liệu". Đừng viết = NULL (luôn sai); phải viết IS NULL / IS NOT NULL.\n\nSELECT * lấy MỌI cột — tiện lúc dò, nhưng trong việc thật hãy kể tên cột bạn cần: đọc rõ hơn, chạy nhẹ hơn, và không vỡ khi người khác thêm cột mới.\n\nĐổi tên cột hiển thị bằng AS: SELECT gia AS gia_ban FROM mon; — tên cột trong kết quả chính là thứ bộ chấm nhìn vào, nên đề bài yêu cầu tên nào thì đặt đúng tên đó.',
    workedExample: {
      code: `-- Xem toàn bộ bảng trước đã: luôn nhìn dữ liệu trước khi viết câu hỏi khó
SELECT * FROM mon;

-- Lọc: chỉ đồ uống, sắp theo giá giảm dần, lấy 3 dòng đắt nhất
SELECT ten, gia
FROM mon
WHERE nhom = 'uong'      -- nháy ĐƠN cho chuỗi; một dấu = để so sánh
ORDER BY gia DESC        -- DESC = giảm dần
LIMIT 3;

-- Tìm theo tên gần đúng: % nghĩa là "gì cũng được"
SELECT ten, gia FROM mon WHERE ten LIKE 'Ca phe%';`,
      stdinLines: [],
    },
    predict: {
      code: `SELECT COUNT(*) AS so FROM mon WHERE gia >= 20000;`,
      question:
        'Bảng mon có 6 món, giá lần lượt 20000, 25000, 5000, 30000, 20000, 15000. Câu này trả về số mấy?',
      choices: ['3', '4', '2', '6'],
      answerIndex: 1,
      explain:
        '>= là "lớn hơn HOẶC BẰNG" nên hai món giá đúng 20000 được tính: 20000, 25000, 30000, 20000 → 4 món. Nếu viết > 20000 (bỏ dấu bằng) thì chỉ còn 2. Sai một ký tự, lệch cả báo cáo — đây là lỗi ranh giới quen thuộc bạn đã gặp ở bài tiền điện bậc thang.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành câu truy vấn: lấy tên và giá các món nhóm "an", sắp theo giá tăng dần.',
      lines: ['SELECT ten, gia', 'FROM mon', "WHERE nhom = 'an'", 'ORDER BY gia ASC;'],
    },
    make: {
      prompt:
        "Quán cần bảng giá đồ uống cao cấp để in menu.\n\nViết MỘT câu SELECT lấy từ bảng mon:\n- Chỉ các món thuộc nhóm 'uong'.\n- Chỉ những món có giá TỪ 20000 trở lên.\n- Hai cột: ten và gia (đúng tên đó).\n- Sắp xếp theo giá GIẢM DẦN.\n- Chỉ lấy 2 dòng đầu.\n\nKết quả mong đợi có dạng:\nten | gia\nNuoc cam | 30000\n...",
      starterCode: `SELECT ten, gia\nFROM mon\n-- Thêm WHERE (hai điều kiện, nối bằng AND), ORDER BY và LIMIT\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'ten | gia\nNuoc cam | 30000\nCa phe sua | 25000',
          match: 'exact',
          hidden: false,
          label:
            'Đúng 2 dòng, đúng thứ tự: Nước cam 30.000đ rồi Cà phê sữa 25.000đ. Chấm KHỚP TUYỆT ĐỐI nên lọt thêm Trà đá (dưới ngưỡng) hay Bánh mì (nhóm "an") là rớt ngay.',
        },
      ],
      hints: [
        'Hai điều kiện lọc cùng lúc thì nối bằng AND: WHERE nhom = ... AND gia >= ... — nhớ nháy ĐƠN cho chuỗi.',
        '"Từ 20000 trở lên" là >= 20000, không phải > 20000. Bánh mì giá đúng 20000 nhưng thuộc nhóm "an" nên vẫn bị điều kiện nhóm loại ra.',
        'Thứ tự các mảnh là cố định: SELECT ... FROM ... WHERE ... ORDER BY gia DESC LIMIT 2; — đặt LIMIT trước ORDER BY sẽ báo lỗi cú pháp.',
      ],
      sampleSolution: `SELECT ten, gia\nFROM mon\nWHERE nhom = 'uong' AND gia >= 20000\nORDER BY gia DESC\nLIMIT 2;`,
    },
    homework:
      'Về nhà: mở lại file CSV bán hàng bạn làm ở bài P3-U3 và viết ra giấy 5 câu hỏi bạn thật sự muốn biết ("món nào bán dưới 10 lần?", "ngày nào đông nhất?"). Với mỗi câu, viết thử câu SELECT tương ứng trên kho dữ liệu của bài này. Chưa cần đúng hết — điều đáng giá là tập DIỄN ĐẠT câu hỏi kinh doanh thành câu truy vấn, đó mới là kỹ năng người ta trả tiền.',
  },
]
