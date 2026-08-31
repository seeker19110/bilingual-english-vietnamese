// lessons/p6u66.ts — P6-U66: HƯỚNG DỮ LIỆU, chặng S1 — Hàm cửa sổ & CTE (module `data-s1-m1`).
//
// p3-u8/p3-u9 đã dạy SELECT/JOIN/GROUP BY/HAVING trên cùng kho dữ liệu (sqlDataset.ts) — file
// này ĐI XA HƠN, không dạy lại: hàm cửa sổ (window function) giữ nguyên từng dòng thay vì gộp
// như GROUP BY, và CTE (WITH) chia truy vấn dài thành các bước có tên, đọc được.
//
// Engine sql.js (SQLite qua WASM) — CI và trình duyệt dùng CHUNG một engine, đã tự kiểm mọi
// truy vấn chạy thật trước khi soạn (window function + CTE đều hỗ trợ đầy đủ).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U66_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u66-l1',
    unitId: 'p6-u66',
    language: 'sql',
    title: 'RANK() OVER — xếp hạng từng dòng mà KHÔNG gộp mất dòng nào',
    hook: 'Chủ quán hỏi: "món nào bán chạy NHẤT trong từng nhóm — đồ uống riêng, đồ ăn riêng?" GROUP BY chỉ cho bạn MỘT dòng tổng mỗi nhóm — nó gộp mất luôn danh sách xếp hạng bên trong nhóm đó. Bạn cần vừa giữ TỪNG món, vừa biết nó đứng thứ mấy trong nhóm của nó.',
    theory:
      'HÀM CỬA SỔ (window function) khác GROUP BY ở một điểm cốt lõi: **GROUP BY gộp nhiều dòng thành MỘT dòng; hàm cửa sổ giữ nguyên MỌI dòng, chỉ thêm một cột tính theo "cửa sổ" dòng xung quanh nó.**\n\nCú pháp chung: ham(...) OVER (PARTITION BY cot_nhom ORDER BY cot_sap_xep)\n\n- PARTITION BY chia dữ liệu thành các NHÓM (giống GROUP BY), nhưng KHÔNG gộp dòng — mỗi nhóm vẫn giữ nguyên số dòng của nó.\n- ORDER BY (bên trong OVER) quyết định thứ tự TÍNH TOÁN trong từng nhóm — ví dụ ai đứng hạng 1.\n\nBa hàm xếp hạng hay dùng, khác nhau ở cách xử lý ĐỒNG HẠNG (tie):\n- ROW_NUMBER(): luôn đánh số 1,2,3,4… không bao giờ trùng số, kể cả khi giá trị bằng nhau (máy tự chọn ai đứng trước theo ORDER BY phụ).\n- RANK(): giá trị bằng nhau thì CÙNG hạng, nhưng hạng KẾ TIẾP bị NHẢY SỐ đúng bằng số dòng đồng hạng (hai dòng cùng hạng 3 thì dòng sau là hạng 5, không phải 4).\n- DENSE_RANK(): giá trị bằng nhau thì CÙNG hạng, và hạng kế tiếp KHÔNG nhảy số (hai dòng cùng hạng 3 thì dòng sau là hạng 4).\n\nQuán ăn xếp hạng "top 3 món bán chạy" mà lỡ dùng RANK() khi có đồng hạng ở vị trí 1–2 thì "top 3" sẽ hụt mất một món — đây là bẫy thật, không phải lý thuyết suông.\n\nMuốn xếp hạng theo METRIC ĐÃ GỘP (như tổng doanh thu mỗi món) thì phải GOM TRƯỚC bằng GROUP BY hoặc CTE (bài này dùng CTE — xem cách viết ở workedExample), rồi mới XẾP HẠNG trên kết quả đã gộp đó. Viết RANK() OVER trực tiếp lên dữ liệu THÔ (chưa gộp) sẽ xếp hạng từng DÒNG bán hàng lẻ, không phải từng MÓN — một lỗi hay gặp của người mới học hàm cửa sổ.',
    workedExample: {
      code: `-- Buoc 1 (CTE): gop doanh thu theo TUNG MON, giu ca cot nhom
WITH doanh_thu_mon AS (
  SELECT m.ten, m.nhom, SUM(ct.so_luong * m.gia) AS doanh_thu
  FROM chi_tiet ct
  JOIN mon m ON ct.mon_id = m.id
  GROUP BY m.ten, m.nhom
)
-- Buoc 2: xep hang TRONG TUNG NHOM tren ket qua da gop o buoc 1
SELECT nhom, ten, doanh_thu,
       RANK() OVER (PARTITION BY nhom ORDER BY doanh_thu DESC) AS hang
FROM doanh_thu_mon
ORDER BY nhom, hang;`,
      stdinLines: [],
    },
    predict: {
      code: `WITH doanh_thu_mon AS (
  SELECT m.ten, SUM(ct.so_luong * m.gia) AS doanh_thu
  FROM chi_tiet ct
  JOIN mon m ON ct.mon_id = m.id
  GROUP BY m.ten
)
SELECT ten, doanh_thu, RANK() OVER (ORDER BY doanh_thu DESC) AS hang
FROM doanh_thu_mon
ORDER BY hang, ten;`,
      question:
        'Nước cam và Bánh ngọt CÙNG doanh thu 30.000đ, cùng đứng hạng 3. Bánh mì (20.000đ, đứng ngay sau) được xếp hạng mấy?',
      choices: [
        'Banh mi | 20000 | 5',
        'Banh mi | 20000 | 4',
        'Banh mi | 20000 | 6',
        'Banh mi | 20000 | 3',
      ],
      answerIndex: 0,
      explain:
        'RANK() NHẢY SỐ sau đồng hạng: hai món cùng hạng 3 (Nước cam, Bánh ngọt) chiếm hết "vị trí 3 và 4", nên món kế tiếp phải là hạng 5 — không phải hạng 4. Đây chính là khác biệt với DENSE_RANK(), vốn sẽ cho Bánh mì hạng 4 (không nhảy số). Chọn sai hàm là báo cáo "top 5" hay "top 10" sẽ lệch số món thật so với ý định.',
    },
    parsons: {
      prompt:
        'Xếp lại truy vấn: gộp doanh thu theo món bằng CTE trước, rồi mới xếp hạng trong từng nhóm.',
      lines: [
        'WITH doanh_thu_mon AS (',
        '  SELECT m.ten, m.nhom, SUM(ct.so_luong * m.gia) AS doanh_thu',
        '  FROM chi_tiet ct',
        '  JOIN mon m ON ct.mon_id = m.id',
        '  GROUP BY m.ten, m.nhom',
        ')',
        'SELECT nhom, ten, doanh_thu,',
        '       RANK() OVER (PARTITION BY nhom ORDER BY doanh_thu DESC) AS hang',
        'FROM doanh_thu_mon',
        'ORDER BY nhom, hang;',
      ],
    },
    make: {
      prompt:
        'Chủ quán muốn biết món nào bán CHẠY NHẤT (theo SỐ LƯỢNG, không phải doanh thu) trong TỪNG NHÓM hàng.\n\nViết MỘT câu truy vấn:\n1. Dùng CTE gộp TỔNG SỐ LƯỢNG đã bán của từng món (cột tong_sl), giữ cả cột nhom.\n2. Trên kết quả đã gộp đó, xếp hạng bằng RANK() OVER, PARTITION BY nhom, ORDER BY tong_sl GIẢM DẦN.\n3. Bốn cột đúng tên: nhom, ten, tong_sl, hang.\n4. Sắp kết quả cuối theo nhom, rồi hang, rồi ten (để ca đồng hạng có thứ tự ổn định).',
      starterCode: `WITH sl_mon AS (
  SELECT m.ten, m.nhom, SUM(ct.so_luong) AS tong_sl
  FROM chi_tiet ct
  JOIN mon m ON ct.mon_id = m.id
  GROUP BY m.ten, m.nhom
)
SELECT nhom, ten, tong_sl,
       -- Them cot hang bang RANK() OVER, PARTITION BY nhom, ORDER BY tong_sl DESC
       ...
FROM sl_mon
ORDER BY nhom, hang, ten;
`,
      testCases: [
        {
          stdinLines: [],
          expected:
            'nhom | ten | tong_sl | hang\nan | Banh ngot | 2 | 1\nan | Banh mi | 1 | 2\nuong | Ca phe sua | 4 | 1\nuong | Tra da | 4 | 1\nuong | Ca phe den | 2 | 3\nuong | Nuoc cam | 1 | 4',
          match: 'exact',
          hidden: false,
          label:
            'Đúng 6 dòng, đủ cả hai nhóm; nhóm uống có CẶP ĐỒNG HẠNG (Cà phê sữa/Trà đá cùng 4)',
        },
      ],
      hints: [
        'Cấu trúc chuẩn: WITH ten_cte AS (câu SELECT gộp) SELECT ... FROM ten_cte — CTE là một "bảng tạm có tên", dùng được như bảng thường ở câu SELECT phía sau.',
        'Cột hang: RANK() OVER (PARTITION BY nhom ORDER BY tong_sl DESC) AS hang — PARTITION BY quyết định "trong nhóm nào", ORDER BY (bên trong OVER) quyết định thứ tự xếp hạng.',
        'Đồng hạng ở nhóm "uong": Cà phê sữa và Trà đá đều bán 4 → cả hai hạng 1, Cà phê đen (2) nhảy thẳng lên hạng 3 (RANK nhảy số sau đồng hạng, không phải hạng 2).',
        'ORDER BY cuối cùng của câu SELECT ngoài (không phải trong OVER) quyết định THỨ TỰ HIỂN THỊ kết quả — khác với ORDER BY trong OVER (quyết định cách TÍNH hạng). Cả hai đều cần.',
      ],
      sampleSolution: `WITH sl_mon AS (
  SELECT m.ten, m.nhom, SUM(ct.so_luong) AS tong_sl
  FROM chi_tiet ct
  JOIN mon m ON ct.mon_id = m.id
  GROUP BY m.ten, m.nhom
)
SELECT nhom, ten, tong_sl,
       RANK() OVER (PARTITION BY nhom ORDER BY tong_sl DESC) AS hang
FROM sl_mon
ORDER BY nhom, hang, ten;`,
    },
    homework:
      'Đổi RANK() thành DENSE_RANK() trong câu Make và chạy lại (trên máy có sql.js hoặc bất kỳ SQLite nào). Ghi lại: hạng của Cà phê đen đổi từ mấy thành mấy? Rồi tự trả lời bằng lời: nếu chủ quán yêu cầu báo cáo "top 3 nhóm hạng bán chạy nhất" (hạng 1, 2, 3 — không phải 3 món), RANK() và DENSE_RANK() có cho ra CÙNG SỐ MÓN không khi có đồng hạng ở giữa?',
    srsCards: [
      {
        hoi: 'Hàm cửa sổ (window function) khác GROUP BY ở điểm cốt lõi nào?',
        dap: 'GROUP BY GỘP nhiều dòng thành một dòng. Hàm cửa sổ GIỮ NGUYÊN mọi dòng, chỉ thêm một cột tính theo PARTITION BY/ORDER BY bên trong OVER(...) — không mất dòng nào.',
      },
      {
        hoi: 'RANK() và DENSE_RANK() xử lý đồng hạng (tie) khác nhau thế nào?',
        dap: 'Cả hai cho các dòng bằng giá trị CÙNG một hạng. Khác ở dòng KẾ TIẾP: RANK() nhảy số đúng bằng số dòng đồng hạng (hai dòng hạng 3 → dòng sau hạng 5); DENSE_RANK() không nhảy số (dòng sau hạng 4).',
      },
      {
        hoi: 'Vì sao phải GOM (GROUP BY/CTE) dữ liệu TRƯỚC khi xếp hạng theo một chỉ số đã tổng hợp (như tổng doanh thu mỗi món)?',
        dap: 'RANK() OVER áp trực tiếp lên dữ liệu thô sẽ xếp hạng từng DÒNG bán hàng lẻ, không phải từng MÓN đã cộng dồn. Phải gộp trước (thường bằng CTE) rồi mới xếp hạng trên kết quả đã gộp.',
      },
    ],
  },
  {
    id: 'p6-u66-l2',
    unitId: 'p6-u66',
    language: 'sql',
    title: 'CTE (WITH) & tổng luỹ kế — chia truy vấn dài thành các bước đặt tên',
    hook: 'Bạn viết một câu SELECT lồng ba tầng subquery để tính doanh thu luỹ kế theo ngày. Một tuần sau đọc lại, chính bạn cũng không hiểu tầng giữa đang tính cái gì. CTE giải quyết đúng vấn đề đó: đặt TÊN cho từng bước, đọc từ trên xuống như một công thức.',
    theory:
      'CTE (Common Table Expression) là một "bảng tạm có TÊN", sống trong đúng MỘT câu truy vấn:\n\n    WITH ten_cte AS (\n      SELECT ...\n    )\n    SELECT ... FROM ten_cte ...;\n\nSau khi khai báo, ten_cte dùng được y hệt một bảng thật ở câu SELECT phía sau — nhưng KHÔNG lưu lại vào cơ sở dữ liệu, chỉ tồn tại trong lượt chạy câu này.\n\nSo với SUBQUERY lồng nhau (SELECT ... FROM (SELECT ... FROM (SELECT ...))), CTE đọc được THEO THỨ TỰ TỰ NHIÊN — bước 1 làm gì, bước 2 làm gì — thay vì phải đọc từ TRONG RA NGOÀI như subquery lồng. Đây không phải khác biệt về TỐC ĐỘ (SQLite có thể thực thi giống hệt nhau) — mà là khác biệt về NGƯỜI ĐỌC SAU NÀY hiểu được hay không.\n\nMỘT câu có thể khai NHIỀU CTE, cách nhau dấu phẩy, và CTE SAU được phép dùng CTE TRƯỚC:\n\n    WITH buoc1 AS (...), buoc2 AS (SELECT ... FROM buoc1 ...)\n    SELECT ... FROM buoc2;\n\nĐây chính là cách "chia truy vấn dài thành các bước đọc được" — mỗi CTE là MỘT Ý, đặt tên theo ý đó (doanh_thu_ngay, khach_vip…), không đặt tên chung chung (tmp1, x).\n\nTỔNG LUỸ KẾ (running total) là ứng dụng kinh điển của CTE + hàm cửa sổ đi cùng nhau:\n\n    SUM(cot) OVER (ORDER BY cot_thoi_gian)\n\nKhông có PARTITION BY (hoặc PARTITION BY toàn bộ), ORDER BY quyết định "cộng dồn tới đâu": mỗi dòng nhận tổng của MỌI dòng từ đầu tới chính nó (mặc định window frame là "từ đầu tới dòng hiện tại"). Đây là công thức đứng sau mọi biểu đồ "doanh thu luỹ kế", "số người dùng tích luỹ" mà sản phẩm thật hay hiển thị.',
    workedExample: {
      code: `-- Buoc 1 (CTE): doanh thu THEO NGAY (phai noi ca 3 bang)
WITH doanh_thu_ngay AS (
  SELECT dh.ngay, SUM(ct.so_luong * m.gia) AS doanh_thu
  FROM don_hang dh
  JOIN chi_tiet ct ON ct.don_id = dh.id
  JOIN mon m ON m.id = ct.mon_id
  GROUP BY dh.ngay
)
-- Buoc 2: cong don theo thoi gian tren ket qua buoc 1
SELECT ngay, doanh_thu,
       SUM(doanh_thu) OVER (ORDER BY ngay) AS luy_ke
FROM doanh_thu_ngay
ORDER BY ngay;`,
      stdinLines: [],
    },
    predict: {
      code: `WITH doanh_thu_ngay AS (
  SELECT dh.ngay, SUM(ct.so_luong * m.gia) AS doanh_thu
  FROM don_hang dh
  JOIN chi_tiet ct ON ct.don_id = dh.id
  JOIN mon m ON m.id = ct.mon_id
  GROUP BY dh.ngay
),
tong_luy_ke AS (
  SELECT ngay, doanh_thu, SUM(doanh_thu) OVER (ORDER BY ngay) AS luy_ke
  FROM doanh_thu_ngay
)
SELECT luy_ke FROM tong_luy_ke ORDER BY ngay DESC LIMIT 1;`,
      question:
        'Câu này lấy dòng CUỐI CÙNG (ngày muộn nhất) của cột luỹ kế. Giá trị in ra là bao nhiêu?',
      choices: ['240000', '135000', '105000', '80000'],
      answerIndex: 0,
      explain:
        'Luỹ kế của NGÀY MUỘN NHẤT luôn bằng TỔNG DOANH THU của TOÀN BỘ dữ liệu — vì SUM(...) OVER (ORDER BY ngay) cộng dồn từ đầu tới dòng hiện tại, và dòng cuối cùng đã cộng hết mọi ngày. 80.000 + 55.000 + 105.000 = 240.000. Đây là cách nhanh để kiểm tra một cột luỹ kế có đúng không: dòng cuối phải khớp SUM() không cửa sổ của toàn bộ dữ liệu.',
    },
    parsons: {
      prompt:
        'Xếp lại truy vấn hai CTE nối tiếp: gộp doanh thu theo ngày, rồi cộng dồn theo thời gian.',
      lines: [
        'WITH doanh_thu_ngay AS (',
        '  SELECT dh.ngay, SUM(ct.so_luong * m.gia) AS doanh_thu',
        '  FROM don_hang dh',
        '  JOIN chi_tiet ct ON ct.don_id = dh.id',
        '  JOIN mon m ON m.id = ct.mon_id',
        '  GROUP BY dh.ngay',
        ')',
        'SELECT ngay, doanh_thu,',
        '       SUM(doanh_thu) OVER (ORDER BY ngay) AS luy_ke',
        'FROM doanh_thu_ngay',
        'ORDER BY ngay;',
      ],
    },
    make: {
      prompt:
        'Chủ quán muốn theo dõi SỐ ĐƠN HÀNG luỹ kế theo ngày (không phải doanh thu).\n\nViết MỘT câu truy vấn dùng CTE:\n1. CTE đầu gộp SỐ ĐƠN của từng ngày (đếm dòng bảng don_hang theo ngay) — cột so_don.\n2. Trên kết quả đó, tính cột luy_ke = tổng luỹ kế của so_don theo thứ tự ngày.\n3. Ba cột đúng tên: ngay, so_don, luy_ke. Sắp theo ngay tăng dần.',
      starterCode: `WITH don_ngay AS (
  SELECT ngay, COUNT(*) AS so_don
  FROM don_hang
  GROUP BY ngay
)
SELECT ngay, so_don,
       -- Them cot luy_ke bang SUM(so_don) OVER (ORDER BY ngay)
       ...
FROM don_ngay
ORDER BY ngay;
`,
      testCases: [
        {
          stdinLines: [],
          expected:
            'ngay | so_don | luy_ke\n2026-08-01 | 2 | 2\n2026-08-02 | 1 | 3\n2026-08-03 | 1 | 4',
          match: 'exact',
          hidden: false,
          label: '4 đơn hàng trải 3 ngày → luỹ kế tăng dần 2, 3, 4',
        },
      ],
      hints: [
        'CTE đầu chỉ cần GROUP BY ngay và COUNT(*) — không cần JOIN gì (số đơn không phụ thuộc món đã bán).',
        'Cột luy_ke: SUM(so_don) OVER (ORDER BY ngay) AS luy_ke — không cần PARTITION BY vì đây là luỹ kế trên TOÀN BỘ dữ liệu, không chia nhóm.',
        'Kiểm nhanh đúng/sai: dòng CUỐI của luy_ke phải bằng TỔNG so_don của mọi ngày cộng lại (2+1+1=4) — đúng bằng dòng cuối trong kết quả mong đợi.',
      ],
      sampleSolution: `WITH don_ngay AS (
  SELECT ngay, COUNT(*) AS so_don
  FROM don_hang
  GROUP BY ngay
)
SELECT ngay, so_don,
       SUM(so_don) OVER (ORDER BY ngay) AS luy_ke
FROM don_ngay
ORDER BY ngay;`,
    },
    homework:
      'Viết lại câu Make bằng SUBQUERY LỒNG thay vì CTE (không dùng WITH — đặt câu GROUP BY vào trong dấu ngoặc ngay sau FROM). Kết quả phải giống hệt. So sánh hai bản viết bằng mắt: bản nào bạn muốn gặp lại sau 6 tháng? Nếu cần thêm bước thứ ba (ví dụ lọc chỉ những ngày có luỹ kế > 3), thêm vào bản CTE dễ hơn hay bản subquery lồng dễ hơn?',
    srsCards: [
      {
        hoi: 'CTE (Common Table Expression) là gì và sống trong phạm vi nào?',
        dap: 'Một "bảng tạm có tên" khai bằng WITH ten AS (...), dùng được như bảng thật ở câu SELECT phía sau — nhưng KHÔNG lưu vào cơ sở dữ liệu, chỉ tồn tại trong đúng MỘT lượt chạy câu truy vấn đó.',
      },
      {
        hoi: 'CTE khác subquery lồng nhau ở điểm nào — về tốc độ hay về gì?',
        dap: 'Không phải về TỐC ĐỘ (có thể thực thi giống hệt nhau) — mà về NGƯỜI ĐỌC: CTE đọc theo thứ tự tự nhiên (bước 1, bước 2…), còn subquery lồng phải đọc từ trong ra ngoài.',
      },
      {
        hoi: 'Công thức tính tổng luỹ kế (running total) bằng hàm cửa sổ là gì?',
        dap: 'SUM(cot) OVER (ORDER BY cot_thoi_gian) — không có PARTITION BY, mỗi dòng nhận tổng của mọi dòng từ đầu tới chính nó theo thứ tự ORDER BY.',
      },
    ],
  },
]
