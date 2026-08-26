// lessons/p5u5.ts — P5-U5: Thiết kế CSDL (làn A, `sql` — SQLite thật qua sql.js).
//
// Bảng `chi_tiet` của bộ dữ liệu mẫu (sqlDataset.ts) CỐ TÌNH thiếu khoá chính và khoá ngoại —
// nó là "trước khi thiết kế tử tế" của chính bài này, nên bài dựng được cảnh dữ liệu rác chui
// vào mà CSDL không hé răng, rồi mới vá.
//
// Mọi con số kỳ vọng trong test-case đã chạy thật trên sql.js khi soạn (kể cả cái bất ngờ:
// khoá chính ghép tự sinh ra sqlite_autoindex_..., nên bảng có SẴN một index trước khi học
// viên tạo index nào).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P5U5_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p5-u5-l1',
    unitId: 'p5-u5',
    language: 'sql',
    title: 'Thiết kế CSDL: để dữ liệu sai KHÔNG VÀO ĐƯỢC, thay vì đi dọn sau',
    hook: 'Bảng chi_tiet của quán đang chạy tốt. Nhưng nó cho phép ghi một dòng chi tiết trỏ tới đơn hàng số 99 không tồn tại, với số lượng âm — và SQLite nhận, không nói một lời. Ba tháng nữa, khi báo cáo doanh thu ra số lạ, bạn sẽ đi tìm nguyên nhân ở đúng dòng đó.',
    theory:
      'Ở bậc P3 bạn học CÁCH HỎI dữ liệu. Bậc này học CÁCH DỰNG CHỖ CHỨA nó. Bốn thứ, xếp theo thứ tự quan trọng:\n\n1. CHUẨN HOÁ — mỗi sự thật chỉ được ghi ở MỘT chỗ. Nếu tên khách nằm trong cả bảng đơn hàng lẫn bảng khách, thì đến ngày khách đổi tên bạn có hai phiên bản sự thật, và không cách nào biết cái nào đúng. Quy tắc thực dụng cho người mới: thấy một giá trị lặp lại y hệt ở nhiều dòng → nó nên là một bảng riêng, và chỗ cũ chỉ giữ id trỏ sang.\n\n2. KHOÁ CHÍNH (PRIMARY KEY) — câu trả lời cho "cái gì làm một dòng là DUY NHẤT?". Bảng chi_tiet hiện không có khoá chính, nên cùng một món ghi hai dòng cho cùng một đơn cũng không ai cản. Khoá chính ở đây phải là CẶP (don_id, mon_id) — gọi là khoá chính ghép.\n\n3. KHOÁ NGOẠI (FOREIGN KEY) — câu trả lời cho "dòng này trỏ đi đâu, và chỗ đó có thật không?". Viết REFERENCES don_hang(id) là bạn nhờ CSDL canh giùm. Lưu ý riêng của SQLite: nó chỉ THỰC SỰ canh khi bạn bật PRAGMA foreign_keys = ON — mặc định tắt vì lý do tương thích ngược. Rất nhiều dự án khai báo khoá ngoại rồi tưởng mình an toàn.\n\n4. INDEX — cuốn mục lục của bảng. Không có index, tìm một dòng là quét cả bảng, O(n). Có index đúng cột, còn O(log n). Cái giá: mỗi lần ghi phải cập nhật cả mục lục, và index chiếm chỗ. Nên: tạo index cho cột hay dùng để LỌC hoặc để NỐI bảng, đừng tạo bừa cho mọi cột.\n\nCòn một thứ nữa, thuộc về lúc GHI chứ không phải lúc dựng bảng: GIAO DỊCH (transaction). Thêm một đơn hàng thật ra là hai việc — ghi vào don_hang và ghi vào chi_tiet. Nếu điện tắt giữa hai việc đó, bạn có một đơn hàng rỗng nằm trong CSDL mãi mãi. Bọc cả hai trong BEGIN ... COMMIT thì hoặc cả hai cùng vào, hoặc không cái nào vào. ROLLBACK là nút hoàn tác: mọi thứ từ BEGIN tới đó bị xoá sạch như chưa từng xảy ra.\n\nCâu để nhớ cả bài: ràng buộc không phải là thứ làm phiền bạn lúc viết code — nó là thứ cứu bạn lúc 11 giờ đêm đi tìm dữ liệu sai.',
    workedExample: {
      code: `-- 1. Bảng chi_tiet hiện tại KHÔNG canh gì cả. Thử ghi một dòng rác:
INSERT INTO chi_tiet (don_id, mon_id, so_luong) VALUES (99, 99, -5);

-- Nó vào ngon lành. Đây là dòng trỏ tới đơn 99 và món 99 đều không tồn tại, số lượng âm:
SELECT COUNT(*) AS dong_rac FROM chi_tiet
WHERE don_id NOT IN (SELECT id FROM don_hang) OR so_luong <= 0;

-- 2. Dựng lại cho tử tế: khoá chính ghép + khoá ngoại + ràng buộc CHECK
PRAGMA foreign_keys = ON;                 -- SQLite chỉ canh khoá ngoại khi bật dòng này

CREATE TABLE chi_tiet_tot (
  don_id INTEGER NOT NULL REFERENCES don_hang(id),   -- phải trỏ tới đơn có thật
  mon_id INTEGER NOT NULL REFERENCES mon(id),        -- phải trỏ tới món có thật
  so_luong INTEGER NOT NULL CHECK (so_luong > 0),    -- không cho số lượng âm hay 0
  PRIMARY KEY (don_id, mon_id)                       -- một đơn không ghi trùng một món
);

-- 3. Giao dịch: thêm đơn mới gồm HAI việc, hoặc cùng vào hoặc không cái nào vào
BEGIN;
  INSERT INTO don_hang (id, ngay, ban) VALUES (7, '2026-08-05', 2);
  INSERT INTO chi_tiet_tot (don_id, mon_id, so_luong) VALUES (7, 3, 2);
ROLLBACK;                                  -- đổi ý -> mọi thứ từ BEGIN bị xoá sạch

SELECT COUNT(*) AS so_don_sau_rollback FROM don_hang;   -- vẫn 4, đơn số 7 chưa hề tồn tại

-- 4. Index: cuốn mục lục cho cột hay dùng để nối bảng
CREATE INDEX idx_ct_tot_don ON chi_tiet_tot(don_id);
SELECT name AS ten_index FROM sqlite_master
WHERE type = 'index' AND tbl_name = 'chi_tiet_tot';`,
      stdinLines: [],
    },
    predict: {
      code: `INSERT INTO chi_tiet (don_id, mon_id, so_luong) VALUES (99, 99, -5);

SELECT COUNT(*) AS rac FROM chi_tiet
WHERE don_id NOT IN (SELECT id FROM don_hang);`,
      question:
        'Đơn hàng số 99 không hề tồn tại trong bảng don_hang. Câu lệnh trên cho kết quả gì?',
      choices: [
        '1',
        'Bao loi FOREIGN KEY constraint failed',
        'Bao loi CHECK constraint failed',
        '2',
      ],
      answerIndex: 0,
      explain:
        'Kết quả là 1 — dòng rác đã vào bảng êm ru, và câu đếm tìm thấy nó. CSDL không báo lỗi vì bảng chi_tiet không hề khai báo khoá ngoại: nó chỉ là ba cột số, và với SQLite thì 99 cũng là một con số hợp lệ như mọi con số khác. Bài học: CSDL chỉ canh những gì bạn BẢO nó canh. Mọi ràng buộc bạn không viết ra lúc thiết kế đều trở thành việc đi dọn dữ liệu sau này — mà lúc đó bạn không còn biết dòng nào đúng để giữ lại.',
    },
    parsons: {
      prompt:
        'Xếp lại câu lệnh tạo bảng chi tiết đơn hàng cho tử tế — có khoá ngoại, ràng buộc và khoá chính ghép.',
      lines: [
        'CREATE TABLE chi_tiet_moi (',
        '  don_id INTEGER NOT NULL REFERENCES don_hang(id),',
        '  mon_id INTEGER NOT NULL REFERENCES mon(id),',
        '  so_luong INTEGER NOT NULL CHECK (so_luong > 0),',
        '  PRIMARY KEY (don_id, mon_id)',
        ');',
      ],
    },
    make: {
      prompt:
        "Thiết kế lại bảng chi tiết đơn hàng cho tử tế, rồi chứng minh nó chạy đúng. Viết một đoạn SQL làm ĐÚNG THỨ TỰ các việc sau:\n\n1. Bật canh khoá ngoại: PRAGMA foreign_keys = ON;\n2. Tạo bảng chi_tiet_moi gồm don_id, mon_id, so_luong. Yêu cầu: don_id trỏ tới don_hang(id), mon_id trỏ tới mon(id), so_luong phải > 0, và khoá chính là CẶP (don_id, mon_id).\n3. Chép toàn bộ dữ liệu từ chi_tiet sang chi_tiet_moi.\n4. Tạo index tên idx_ct_don trên cột don_id của bảng mới.\n5. Mở một giao dịch, thêm đơn hàng id = 5 vào don_hang và một dòng chi tiết cho nó, rồi ROLLBACK.\n6. Cuối cùng in ba kết quả, theo đúng thứ tự này:\n   - SELECT COUNT(*) AS so_dong FROM chi_tiet_moi;\n   - SELECT COUNT(*) AS so_don FROM don_hang;\n   - SELECT COUNT(*) AS so_khoa_ngoai FROM pragma_foreign_key_list('chi_tiet_moi');\n\nĐọc kỹ hai con số cuối trước khi nộp: chúng nói cho bạn biết ROLLBACK có thật sự hoàn tác không, và CSDL có thật sự nhận khoá ngoại của bạn không.",
      starterCode: `-- 1. Bật canh khoá ngoại (SQLite mặc định TẮT)


-- 2. Tạo bảng chi_tiet_moi: khoá ngoại + CHECK + khoá chính ghép


-- 3. Chép dữ liệu từ chi_tiet sang


-- 4. Index cho cột don_id


-- 5. Giao dịch rồi ROLLBACK


-- 6. Ba câu SELECT kiểm chứng
`,
      testCases: [
        {
          stdinLines: [],
          expected: 'so_dong\n7',
          match: 'contains',
          hidden: false,
          label: 'Bảng mới nhận đủ 7 dòng chép từ chi_tiet',
        },
        {
          stdinLines: [],
          expected: 'so_don\n4',
          match: 'contains',
          hidden: false,
          label: 'Sau ROLLBACK, đơn hàng số 5 biến mất — bảng don_hang vẫn 4 dòng',
        },
        {
          stdinLines: [],
          expected: 'so_khoa_ngoai\n2',
          match: 'contains',
          hidden: false,
          label: 'Bảng mới khai báo đúng HAI khoá ngoại (don_hang và mon)',
        },
        {
          stdinLines: [],
          expected: 'idx_ct_don',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: index idx_ct_don tồn tại thật trong CSDL',
        },
        {
          stdinLines: [],
          expected: 'sqlite_autoindex_chi_tiet_moi_1',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: khoá chính ghép TỰ SINH thêm một index nữa — bằng chứng khoá chính đã được khai đúng',
        },
      ],
      hints: [
        'Khoá chính ghép viết thành một dòng riêng ở cuối phần khai cột: PRIMARY KEY (don_id, mon_id). Viết PRIMARY KEY sau tên từng cột là bạn đang khai HAI khoá chính riêng lẻ — SQLite sẽ báo lỗi.',
        'Chép dữ liệu bằng INSERT ... SELECT, không cần liệt kê từng dòng: INSERT INTO chi_tiet_moi SELECT don_id, mon_id, so_luong FROM chi_tiet;',
        'Hai câu SELECT cuối phải chạy SAU ROLLBACK. Đặt chúng vào giữa BEGIN và ROLLBACK thì bạn đang đo trạng thái chưa chốt, và so_don sẽ ra 5 chứ không phải 4.',
        'Ca ẩn cuối cùng kiểm một index bạn KHÔNG hề tạo: sqlite_autoindex_chi_tiet_moi_1. SQLite tự sinh nó cho khoá chính ghép — nghĩa là nếu ca này trượt, khoá chính của bạn chưa được khai đúng chỗ.',
        "Khung tham chiếu cho phần giao dịch:\n\nBEGIN;\n  INSERT INTO don_hang (id, ngay, ban) VALUES (5, '2026-08-04', 4);\n  INSERT INTO chi_tiet_moi (don_id, mon_id, so_luong) VALUES (5, 1, 2);\nROLLBACK;",
      ],
      sampleSolution: `-- 1. SQLite chỉ canh khoá ngoại khi bật dòng này
PRAGMA foreign_keys = ON;

-- 2. Bảng chi tiết dựng tử tế: trỏ đâu cũng phải có thật, số lượng phải dương,
--    và một đơn không thể ghi trùng cùng một món hai lần.
CREATE TABLE chi_tiet_moi (
  don_id INTEGER NOT NULL REFERENCES don_hang(id),
  mon_id INTEGER NOT NULL REFERENCES mon(id),
  so_luong INTEGER NOT NULL CHECK (so_luong > 0),
  PRIMARY KEY (don_id, mon_id)
);

-- 3. Chép dữ liệu cũ sang
INSERT INTO chi_tiet_moi SELECT don_id, mon_id, so_luong FROM chi_tiet;

-- 4. Mục lục cho cột hay dùng để nối bảng
CREATE INDEX idx_ct_don ON chi_tiet_moi(don_id);

-- 5. Thêm một đơn gồm HAI việc, rồi đổi ý -> cả hai cùng biến mất
BEGIN;
  INSERT INTO don_hang (id, ngay, ban) VALUES (5, '2026-08-04', 4);
  INSERT INTO chi_tiet_moi (don_id, mon_id, so_luong) VALUES (5, 1, 2);
ROLLBACK;

-- 6. Kiểm chứng
SELECT COUNT(*) AS so_dong FROM chi_tiet_moi;
SELECT COUNT(*) AS so_don FROM don_hang;
SELECT COUNT(*) AS so_khoa_ngoai FROM pragma_foreign_key_list('chi_tiet_moi');
SELECT name AS ten_index FROM sqlite_master
WHERE type = 'index' AND tbl_name = 'chi_tiet_moi';`,
    },
    homework:
      'Giữ nguyên bài làm, thêm vào cuối một dòng thử phá: INSERT INTO chi_tiet_moi (don_id, mon_id, so_luong) VALUES (99, 1, 2); Lần này CSDL phải từ chối. Rồi thử đổi so_luong thành -1 với đơn có thật — nó cũng phải từ chối, nhưng bằng một thông điệp lỗi KHÁC. Đọc kỹ hai thông điệp đó: trong dự án thật, chính chúng là thứ bạn bắt được để trả về mã 422 hay 409 cho người dùng.',
    srsCards: [
      {
        hoi: 'Chuẩn hoá CSDL nói ngắn gọn là gì?',
        dap: 'Mỗi sự thật chỉ được ghi ở MỘT chỗ. Thấy một giá trị lặp lại y hệt qua nhiều dòng thì nó nên tách thành bảng riêng, chỗ cũ chỉ giữ id trỏ sang — để sửa một lần là đúng mọi nơi.',
      },
      {
        hoi: 'Khai báo REFERENCES trong SQLite đã đủ để CSDL canh khoá ngoại chưa?',
        dap: 'Chưa. SQLite mặc định TẮT việc canh khoá ngoại vì tương thích ngược; phải bật PRAGMA foreign_keys = ON ở mỗi kết nối thì ràng buộc mới thật sự có hiệu lực.',
      },
      {
        hoi: 'Index đánh đổi cái gì lấy cái gì?',
        dap: 'Đổi tốc độ ĐỌC lấy chi phí GHI và chỗ lưu: tìm theo cột có index còn O(log n) thay vì quét cả bảng, nhưng mỗi lần thêm/sửa dòng đều phải cập nhật thêm mục lục. Nên chỉ đánh index cho cột hay dùng để lọc hoặc nối bảng.',
      },
      {
        hoi: 'Giao dịch (BEGIN ... COMMIT) giải quyết vấn đề gì?',
        dap: 'Vấn đề "làm được một nửa": khi một thao tác nghiệp vụ gồm nhiều câu lệnh, giao dịch bảo đảm hoặc tất cả cùng vào, hoặc không cái nào vào — nên không còn cảnh đơn hàng đã ghi mà chi tiết thì chưa.',
      },
    ],
  },
]
