// sqlDataset — KHO DỮ LIỆU MẪU cho các bài SQL (PR-L7b2).
//
// Dùng CHUNG cho ba nơi: cổng CI (lessonsSql.test.ts), sandbox trong trình duyệt
// (apps/dhcb/src/workers/sqlWorker.ts) và ví dụ trong nội dung bài học. Một nguồn duy nhất
// nên kết quả học viên thấy luôn khớp kết quả cổng chấm.
//
// Nguyên tắc soạn dữ liệu: NHỎ và ĐOÁN ĐƯỢC. Học viên phải tự nhẩm được câu trả lời rồi mới
// đối chiếu với máy — bảng vài chục nghìn dòng chỉ dạy được cách bấm Enter. Bối cảnh giữ
// nguyên quán cà phê của dự án trục để kiến thức nối vào cái đã biết.

/** DDL + dữ liệu mẫu. Chạy MỘT LẦN khi mở phiên làm bài, trước câu SQL của học viên. */
export const SQL_SEED = `
CREATE TABLE mon (
  id INTEGER PRIMARY KEY,
  ten TEXT NOT NULL,
  nhom TEXT NOT NULL,
  gia INTEGER NOT NULL
);

CREATE TABLE don_hang (
  id INTEGER PRIMARY KEY,
  ngay TEXT NOT NULL,
  ban INTEGER NOT NULL
);

CREATE TABLE chi_tiet (
  don_id INTEGER NOT NULL,
  mon_id INTEGER NOT NULL,
  so_luong INTEGER NOT NULL
);

INSERT INTO mon (id, ten, nhom, gia) VALUES
  (1, 'Ca phe den', 'uong', 20000),
  (2, 'Ca phe sua', 'uong', 25000),
  (3, 'Tra da', 'uong', 5000),
  (4, 'Nuoc cam', 'uong', 30000),
  (5, 'Banh mi', 'an', 20000),
  (6, 'Banh ngot', 'an', 15000);

INSERT INTO don_hang (id, ngay, ban) VALUES
  (1, '2026-08-01', 1),
  (2, '2026-08-01', 3),
  (3, '2026-08-02', 1),
  (4, '2026-08-03', 2);

INSERT INTO chi_tiet (don_id, mon_id, so_luong) VALUES
  (1, 1, 2),
  (1, 5, 1),
  (2, 3, 4),
  (3, 2, 1),
  (3, 6, 2),
  (4, 2, 3),
  (4, 4, 1);
`
