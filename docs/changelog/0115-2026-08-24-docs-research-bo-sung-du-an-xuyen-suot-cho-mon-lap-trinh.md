# docs(research): Bổ sung DỰ ÁN XUYÊN SUỐT cho môn Lập trình (2026-08-24)

Theo yêu cầu tiếp của người dùng ("tạo dự án hoàn chỉnh và dạy trên đó, hoàn thành khoá =
hoàn thành luôn dự án"), soạn `docs/research/dac-ta-du-an-xuyen-suot-mon-lap-trinh-2026-08-24.md`
bổ sung đặc tả môn Lập trình cùng ngày. Điểm chốt đề xuất (CHỜ DUYỆT):

- **Mô hình 2 làn** (căn cứ PBL + spiral curriculum): làn LUYỆN giữ khuôn bài 8 bước; làn
  DỰ ÁN — mỗi unit xây tiếp MỘT dự án trục lớn dần P1→P5, tỷ lệ 70/30 đầu khoá đảo 30/70 cuối.
- **Dự án trục T1 "Cửa hàng của tôi"** (quản lý bán hàng nhỏ, mặc định; T2 quỹ lớp / T3 sổ
  học tập đồng hình, mở sau): console P1 → file/CSV P2 → web+SQL+Git P3 → OOP/API/test/TS P4 →
  deploy Internet thật P5 = milestone cuối, chính là capstone/portfolio.
- **Cơ chế kỹ thuật mới:** workspace dự án per-user (`programming.project_files` +
  `project_snapshots`, quota ~2MB), milestone check chấm HÀNH VI (không chấm giống mẫu), xuất
  GitHub từ P3, kiểm URL deploy sống ở P5. Thêm PR-L3b vào phân đợt.
