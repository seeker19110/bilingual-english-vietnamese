// Hướng DỮ LIỆU — biến dữ liệu thô thành thứ ra quyết định được.
import type { ProgrammingSpecialization } from './types.js'

export const DATA_SPECIALIZATION: ProgrammingSpecialization = {
  id: 'data',
  name: 'Dữ liệu & Phân tích',
  tagline: 'Đường ống dữ liệu tin cậy và những con số dám dựa vào để quyết định.',
  forWho:
    'Hợp với người thích trả lời câu hỏi bằng bằng chứng và chịu khó làm sạch dữ liệu bẩn. Phần lớn thời gian của nghề là làm sạch, không phải vẽ biểu đồ.',
  prerequisite: 'p3',
  duration: '9–14 tháng',
  languages: ['Python', 'SQL'],
  coreTools: ['pandas/Polars', 'dbt', 'Airflow', 'DuckDB/BigQuery', 'Metabase hoặc Superset'],
  architecture: {
    modules: [
      {
        name: 'Nạp dữ liệu (ingest)',
        role: 'Đưa dữ liệu thô vào, giữ NGUYÊN VẸN. Không làm sạch ở bước này.',
      },
      { name: 'Lớp thô', role: 'Bản sao trung thực của nguồn, để dựng lại được mọi thứ phía sau.' },
      { name: 'Lớp sạch', role: 'Chuẩn hoá kiểu, khử trùng lặp, áp quy tắc chất lượng.' },
      { name: 'Lớp phục vụ', role: 'Bảng sự kiện + bảng chiều cho người dùng cuối truy vấn.' },
      { name: 'Tầng chỉ số', role: 'Nơi DUY NHẤT định nghĩa "doanh thu", "người dùng hoạt động".' },
      { name: 'Điều phối', role: 'Lịch chạy, phụ thuộc, chạy bù. Không chứa logic biến đổi.' },
    ],
    contracts: [
      'Hợp đồng dữ liệu giữa đội sinh và đội dùng: schema, độ tươi, ý nghĩa từng trường.',
      'Mỗi bảng phục vụ có chủ sở hữu và mô tả; không có bảng vô chủ.',
      'Mọi bước biến đổi phải idempotent: chạy lại một ngày cho ra đúng kết quả cũ.',
      'Một chỉ số chỉ có một định nghĩa; phòng ban muốn khác thì đặt tên khác.',
    ],
    keyDecisions: [
      'ETL hay ELT; biến đổi ở đâu quyết định chi phí và khả năng dựng lại.',
      'Hạt mịn của bảng sự kiện — chọn sai thì mọi báo cáo về sau bị khoá cứng.',
      'Theo lô hay theo luồng cho từng nguồn, và ngưỡng độ tươi cam kết.',
      'Xử lý dữ liệu tới muộn: cắt cửa sổ hay tính lại quá khứ.',
    ],
    nfrs: [
      'Độ tươi cam kết theo bảng (ví dụ ≤ 3 giờ) và có cảnh báo khi trễ.',
      'Kiểm chất lượng chặn bước sau khi dữ liệu bẩn, không để lọt tới người dùng.',
      'Chi phí truy vấn hằng tháng có trần và có theo dõi.',
    ],
    specChecklist: [
      'Nguồn dữ liệu, khoá tự nhiên, cách nhận biết bản ghi đã xử lý.',
      'Quy tắc làm sạch và giả định kèm theo — người sau phải kiểm lại được.',
      'Chạy bù quá khứ ra sao; chạy lại có gây nhân đôi không.',
      'Trường nào là dữ liệu cá nhân, ai được xem, giữ bao lâu.',
    ],
  },
  stages: [
    {
      id: 'data-s1',
      tier: 's1',
      name: 'SQL và phân tích cơ bản',
      canDo: 'Trả lời được câu hỏi kinh doanh bằng SQL và trình bày kết quả dễ hiểu.',
      duration: '6–8 tuần',
      modules: [
        {
          id: 'data-s1-m1',
          title: 'SQL phân tích',
          topics: [
            'JOIN các loại, GROUP BY, HAVING',
            'Hàm cửa sổ: xếp hạng, tổng luỹ kế, so kỳ trước',
            'CTE để chia truy vấn dài thành bước đọc được',
          ],
        },
        {
          id: 'data-s1-m2',
          title: 'Làm sạch dữ liệu',
          topics: [
            'Thiếu giá trị, trùng lặp, sai kiểu, ngoại lệ',
            'Chuẩn hoá ngày giờ và múi giờ',
            'Ghi lại giả định làm sạch — người sau phải kiểm được',
          ],
        },
        {
          id: 'data-s1-m3',
          title: 'Thống kê đủ dùng',
          topics: [
            'Trung bình vs trung vị, phương sai, phân vị',
            'Tương quan không phải nhân quả',
            'Sai lầm chọn mẫu và cách nhận ra',
          ],
        },
        {
          id: 'data-s1-m4',
          title: 'Trực quan hoá trung thực',
          topics: [
            'Chọn dạng biểu đồ theo câu hỏi',
            'Trục không cắt gốc gây hiểu sai',
            'Một biểu đồ nói một ý',
          ],
        },
      ],
      project: {
        name: 'Báo cáo kinh doanh từ dữ liệu thật',
        brief: 'Lấy dữ liệu mở của Việt Nam, trả lời 5 câu hỏi có ý nghĩa.',
        requirements: [
          'Toàn bộ bước làm sạch viết thành mã chạy lại được',
          'Mỗi kết luận kèm truy vấn và giới hạn của dữ liệu',
          'Bản trình bày 1 trang cho người không kỹ thuật',
        ],
      },
    },
    {
      id: 'data-s2',
      tier: 's2',
      name: 'Kỹ sư dữ liệu — đường ống',
      canDo: 'Dựng pipeline chạy định kỳ, có kiểm chất lượng, hỏng là biết ngay.',
      duration: '8–10 tuần',
      modules: [
        {
          id: 'data-s2-m1',
          title: 'ETL / ELT',
          topics: [
            'Nạp gia tăng, đánh dấu bản ghi đã xử lý',
            'Idempotent: chạy lại một ngày không nhân đôi dữ liệu',
            'Lưu dữ liệu thô nguyên vẹn để dựng lại được',
          ],
        },
        {
          id: 'data-s2-m2',
          title: 'Mô hình hoá kho dữ liệu',
          topics: [
            'Bảng sự kiện và bảng chiều (star schema)',
            'Chiều biến đổi chậm',
            'Lớp thô → sạch → phục vụ',
          ],
        },
        {
          id: 'data-s2-m3',
          title: 'Điều phối',
          topics: [
            'DAG, phụ thuộc, chạy lại một phần',
            'Lịch chạy, SLA, cảnh báo khi trễ',
            'Chạy bù dữ liệu quá khứ (backfill)',
          ],
        },
        {
          id: 'data-s2-m4',
          title: 'Chất lượng dữ liệu',
          topics: [
            'Kiểm tra: không rỗng, duy nhất, khoảng giá trị, khớp tổng',
            'Hợp đồng dữ liệu giữa đội sinh và đội dùng',
            'Theo vết nguồn gốc (lineage)',
          ],
        },
      ],
      project: {
        name: 'Kho dữ liệu cho dự án cửa hàng',
        brief: 'Pipeline hằng ngày từ CSDL vận hành sang kho phân tích.',
        requirements: [
          'Chạy tự động hằng ngày, chạy lại được cho ngày bất kỳ',
          'Ít nhất 8 kiểm tra chất lượng, hỏng là chặn bước sau',
          'Dashboard doanh thu đọc từ lớp phục vụ',
        ],
      },
    },
    {
      id: 'data-s3',
      tier: 's3',
      name: 'Quy mô và thời gian thực',
      canDo: 'Xử lý dữ liệu lớn hơn RAM, xây luồng gần thời gian thực, tối ưu chi phí.',
      duration: '10–12 tuần',
      modules: [
        {
          id: 'data-s3-m1',
          title: 'Dữ liệu lớn',
          topics: [
            'Định dạng cột (Parquet), phân vùng, nén',
            'Xử lý phân tán: Spark hoặc engine tương đương',
            'Tràn bộ nhớ và lệch phân bố khoá (skew)',
          ],
        },
        {
          id: 'data-s3-m2',
          title: 'Luồng thời gian thực',
          topics: [
            'Kafka, cửa sổ thời gian, dữ liệu tới muộn',
            'Thời gian sự kiện vs thời gian xử lý',
            'Đúng-một-lần và cái giá của nó',
          ],
        },
        {
          id: 'data-s3-m3',
          title: 'Thực nghiệm',
          topics: [
            'A/B test: cỡ mẫu, ý nghĩa thống kê, dừng sớm là gian lận',
            'Chỉ số dẫn dắt vs chỉ số kết quả',
            'Nhân quả khi không thể làm thực nghiệm',
          ],
        },
        {
          id: 'data-s3-m4',
          title: 'Chi phí và quản trị',
          topics: [
            'Tối ưu chi phí truy vấn trên đám mây',
            'Quyền truy cập, che dữ liệu cá nhân',
            'Vòng đời dữ liệu và nghĩa vụ xoá',
          ],
        },
      ],
      project: {
        name: 'Luồng dữ liệu gần thời gian thực',
        brief: 'Bảng điều khiển cập nhật trong vòng vài phút từ sự kiện phát sinh.',
        requirements: [
          'Xử lý đúng sự kiện tới muộn tới 1 giờ',
          'So khớp số liệu luồng với số liệu theo lô — sai lệch < 0,1%',
          'Báo cáo chi phí vận hành hằng tháng ước tính',
        ],
      },
    },
    {
      id: 'data-s4',
      tier: 's4',
      name: 'Chuyên gia — nền tảng dữ liệu',
      canDo: 'Thiết kế nền tảng dữ liệu cho cả tổ chức và chịu trách nhiệm về độ tin cậy số liệu.',
      duration: '12–16 tuần',
      modules: [
        {
          id: 'data-s4-m1',
          title: 'Kiến trúc nền tảng',
          topics: [
            'Lakehouse, định dạng bảng mở (Iceberg/Delta)',
            'Danh mục dữ liệu, tự phục vụ cho người dùng nghiệp vụ',
            'Đa vùng, sao lưu, khôi phục',
          ],
        },
        {
          id: 'data-s4-m2',
          title: 'Độ tin cậy dữ liệu',
          topics: [
            'SLO cho dữ liệu: độ tươi, đầy đủ, chính xác',
            'Phát hiện bất thường tự động',
            'Post-mortem cho sự cố số liệu sai',
          ],
        },
        {
          id: 'data-s4-m3',
          title: 'Định nghĩa chỉ số',
          topics: [
            'Tầng chỉ số dùng chung, một định nghĩa duy nhất',
            'Xử lý khi hai phòng ban cãi nhau về cùng con số',
            'Tài liệu hoá và phiên bản của định nghĩa',
          ],
        },
        {
          id: 'data-s4-m4',
          title: 'Đạo đức và pháp lý',
          topics: [
            'Dữ liệu cá nhân, nghị định bảo vệ dữ liệu tại Việt Nam',
            'Thiên lệch trong dữ liệu dẫn tới quyết định bất công',
            'Minh bạch về giới hạn của số liệu',
          ],
        },
      ],
      project: {
        name: 'Nền tảng dữ liệu tự phục vụ',
        brief: 'Hệ thống để người không biết code tự trả lời câu hỏi của họ.',
        requirements: [
          'Danh mục dữ liệu có mô tả và chủ sở hữu cho mọi bảng phục vụ',
          'SLO độ tươi công bố và đo được',
          'Kiểm soát quyền theo vai trò, có nhật ký truy cập',
        ],
      },
    },
  ],
  capstone: {
    name: 'Hệ dữ liệu được người khác ra quyết định dựa vào',
    brief: 'Toàn bộ chuỗi: thu thập → làm sạch → mô hình → phục vụ → giám sát.',
    requirements: [
      'Chạy tự động ≥ 3 tháng, có nhật ký sự cố và cách xử lý',
      'Kiểm chất lượng chặn dữ liệu bẩn trước khi tới người dùng',
      'Có ít nhất một quyết định thật được đưa ra dựa trên số liệu này',
    ],
  },
  expertSignals: [
    'Nghi ngờ số đẹp bất thường trước khi khoe nó',
    'Nói được dữ liệu này KHÔNG trả lời được câu hỏi gì',
    'Thiết kế pipeline với giả định "hôm nay sẽ phải chạy lại ngày hôm qua"',
    'Đưa ra khoảng tin cậy, không chỉ một con số',
  ],
  careers: ['Data Analyst', 'Analytics Engineer', 'Data Engineer', 'Data Platform Engineer'],
  pitfalls: [
    'Nhảy vào vẽ biểu đồ trước khi kiểm dữ liệu có sạch không',
    'Pipeline không idempotent rồi nhân đôi doanh thu',
    'Mỗi phòng ban một định nghĩa "người dùng hoạt động"',
    'Chỉ học công cụ thời thượng mà SQL còn yếu',
  ],
  resources: [
    'The Data Warehouse Toolkit — Kimball',
    'Fundamentals of Data Engineering — Reis & Housley',
    'Trustworthy Online Controlled Experiments (A/B testing)',
    'Tài liệu dbt và Apache Airflow',
  ],
}
