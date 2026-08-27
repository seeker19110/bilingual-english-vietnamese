// Hướng AI — từ dùng mô hình có sẵn tới huấn luyện và đưa mô hình vào sản xuất.
import type { ProgrammingSpecialization } from './types.js'

export const AI_SPECIALIZATION: ProgrammingSpecialization = {
  id: 'ai',
  name: 'Trí tuệ nhân tạo & Học máy',
  tagline: 'Xây sản phẩm AI dùng được thật: đo được chất lượng, kiểm soát được chi phí và rủi ro.',
  forWho:
    'Hợp với người thích toán ứng dụng và thí nghiệm có kỷ luật. Cần chấp nhận rằng phần lớn công việc là dữ liệu và đánh giá, không phải chọn mô hình.',
  prerequisite: 'p4',
  duration: '12–18 tháng',
  languages: ['Python', 'SQL', 'TypeScript (phần ứng dụng)'],
  coreTools: ['PyTorch', 'scikit-learn', 'Hugging Face', 'MLflow', 'vector database'],
  architecture: {
    modules: [
      {
        name: 'Tầng prompt / cấu hình mô hình',
        role: 'Nơi DUY NHẤT chứa prompt và chọn model. Không rải prompt khắp code.',
      },
      {
        name: 'Cổng gọi mô hình',
        role: 'Timeout, thử lại, cache, đếm chi phí. Đổi nhà cung cấp chỉ sửa ở đây.',
      },
      {
        name: 'Truy hồi (RAG)',
        role: 'Chia đoạn, tìm kiếm, xếp hạng lại. Trả về đoạn + nguồn, không trả về câu trả lời.',
      },
      {
        name: 'Lõi nghiệp vụ',
        role: 'Quyết định làm gì với kết quả mô hình. Phải chạy được cả khi mô hình trả rác.',
      },
      {
        name: 'Bộ đánh giá',
        role: 'Dữ liệu vàng + chỉ số. Chạy trong CI, chặn hồi quy chất lượng.',
      },
      {
        name: 'Kiểm duyệt & giới hạn',
        role: 'Chặn nội dung hại, giới hạn lượt và ngân sách. Ở SERVER, không ở client.',
      },
    ],
    contracts: [
      'Đầu ra mô hình phải qua schema; không tin văn bản tự do đi thẳng vào nghiệp vụ.',
      'Mọi câu trả lời dựa trên tài liệu phải kèm nguồn kiểm chứng được.',
      'Đổi prompt hoặc model là thay đổi hợp đồng chất lượng — bắt buộc chạy lại bộ đánh giá và dán kết quả.',
      'Dữ liệu người dùng gửi cho mô hình phải nêu rõ: cái gì gửi, cái gì tuyệt đối không.',
    ],
    keyDecisions: [
      'Prompt tốt hơn hay tinh chỉnh mô hình — tinh chỉnh khoá luôn chi phí vận hành về sau.',
      'Ranh giới tác tử: được gọi công cụ nào, ngân sách bao nhiêu lượt, ai duyệt thao tác nguy hiểm.',
      'Nội dung sinh ra được lưu hay không, lưu bao lâu, để làm gì.',
    ],
    nfrs: [
      'Chỉ số chất lượng trên bộ vàng có sàn, tụt là CI đỏ.',
      'Chi phí trung bình mỗi yêu cầu có trần; có cảnh báo khi vượt.',
      'Độ trễ p95 cho luồng tương tác; có đường lui khi mô hình chậm hoặc lỗi.',
    ],
    specChecklist: [
      'Bộ đánh giá và ngưỡng chấp nhận — viết TRƯỚC khi chỉnh prompt.',
      'Hành vi khi mô hình trả sai định dạng, trả rỗng, hoặc timeout.',
      'Ranh giới an toàn: nội dung cấm, dữ liệu cấm gửi đi, thao tác cấm tự động.',
      'Trần chi phí và cách đếm lượt cho từng gói người dùng.',
    ],
  },
  stages: [
    {
      id: 'ai-s1',
      tier: 's1',
      name: 'Ứng dụng LLM — làm sản phẩm trước',
      canDo: 'Xây ứng dụng dùng mô hình ngôn ngữ có đánh giá tự động và kiểm soát chi phí.',
      duration: '6–8 tuần',
      modules: [
        {
          id: 'ai-s1-m1',
          title: 'Gọi mô hình đúng cách',
          topics: [
            'Prompt có cấu trúc, đầu ra ràng buộc theo schema',
            'Token, cửa sổ ngữ cảnh, chi phí mỗi lượt',
            'Streaming, timeout, thử lại khi lỗi',
          ],
        },
        {
          id: 'ai-s1-m2',
          title: 'RAG — trả lời dựa trên tài liệu',
          topics: [
            'Chia đoạn, embedding, tìm kiếm vector và tìm kiếm từ khoá',
            'Kết hợp hai loại tìm kiếm và xếp hạng lại',
            'Trích dẫn nguồn, chống bịa đặt',
          ],
        },
        {
          id: 'ai-s1-m3',
          title: 'Đánh giá tự động',
          topics: [
            'Bộ dữ liệu vàng, chỉ số recall/precision cho tác vụ của bạn',
            'Mô hình chấm mô hình: khi nào tin được',
            'Chặn hồi quy chất lượng trong CI',
          ],
        },
        {
          id: 'ai-s1-m4',
          title: 'An toàn và chi phí',
          topics: [
            'Tiêm lệnh (prompt injection) và cách giảm thiểu',
            'Giới hạn lượt, cache, chọn mô hình theo độ khó',
            'Ghi log không lộ dữ liệu người dùng',
          ],
        },
      ],
      project: {
        name: 'Trợ lý hỏi đáp trên tài liệu của bạn',
        brief: 'Ứng dụng trả lời câu hỏi dựa trên tập tài liệu, có trích dẫn.',
        requirements: [
          'Bộ đánh giá ≥ 50 câu hỏi có đáp án chuẩn, chạy tự động',
          'Mọi câu trả lời kèm nguồn kiểm chứng được',
          'Báo cáo chi phí trung bình mỗi câu hỏi',
        ],
      },
    },
    {
      id: 'ai-s2',
      tier: 's2',
      name: 'Học máy cổ điển',
      canDo: 'Xây mô hình dự đoán từ dữ liệu bảng, đánh giá đúng và không tự lừa mình.',
      duration: '10–12 tuần',
      modules: [
        {
          id: 'ai-s2-m1',
          title: 'Nền tảng',
          topics: [
            'Học có giám sát: hồi quy, phân loại',
            'Tách tập train/valid/test và rò rỉ dữ liệu',
            'Đánh đổi thiên lệch–phương sai',
          ],
        },
        {
          id: 'ai-s2-m2',
          title: 'Đặc trưng và mô hình',
          topics: [
            'Kỹ thuật đặc trưng, mã hoá biến hạng mục',
            'Cây tăng cường (gradient boosting) — vũ khí chính cho dữ liệu bảng',
            'Điều chuẩn, tinh chỉnh siêu tham số',
          ],
        },
        {
          id: 'ai-s2-m3',
          title: 'Đánh giá nghiêm khắc',
          topics: [
            'Chọn chỉ số theo hậu quả sai, không theo thói quen',
            'Dữ liệu mất cân bằng, ma trận nhầm lẫn, ngưỡng quyết định',
            'Kiểm định chéo theo thời gian cho dữ liệu chuỗi',
          ],
        },
        {
          id: 'ai-s2-m4',
          title: 'Giải thích mô hình',
          topics: [
            'Độ quan trọng đặc trưng, SHAP',
            'Kiểm tra công bằng giữa các nhóm',
            'Khi mô hình đơn giản là lựa chọn đúng',
          ],
        },
      ],
      project: {
        name: 'Dự đoán có ích cho dự án của bạn',
        brief: 'Ví dụ: dự báo nhu cầu món theo ngày cho dự án cửa hàng.',
        requirements: [
          'So sánh với mô hình cơ sở ngây thơ — phải thắng rõ ràng',
          'Kiểm chứng theo thời gian, không xáo trộn ngẫu nhiên',
          'Phân tích các ca sai nặng nhất và lý do',
        ],
      },
    },
    {
      id: 'ai-s3',
      tier: 's3',
      name: 'Học sâu',
      canDo: 'Huấn luyện và tinh chỉnh mạng nơ-ron cho bài toán thị giác hoặc ngôn ngữ.',
      duration: '12–14 tuần',
      modules: [
        {
          id: 'ai-s3-m1',
          title: 'Nền tảng học sâu',
          topics: [
            'Lan truyền ngược, hàm mất mát, bộ tối ưu',
            'Chuẩn hoá, dropout, lịch học tốc độ',
            'Gỡ lỗi huấn luyện: mất mát không giảm thì làm gì',
          ],
        },
        {
          id: 'ai-s3-m2',
          title: 'Kiến trúc',
          topics: [
            'CNN cho ảnh, Transformer cho chuỗi',
            'Cơ chế chú ý (attention) hiểu tới mức vẽ lại được',
            'Học chuyển giao và tinh chỉnh',
          ],
        },
        {
          id: 'ai-s3-m3',
          title: 'Dữ liệu là mô hình',
          topics: [
            'Gán nhãn, đo độ đồng thuận giữa người gán',
            'Tăng cường dữ liệu, dữ liệu tổng hợp',
            'Dịch chuyển phân phối giữa lúc huấn luyện và lúc chạy thật',
          ],
        },
        {
          id: 'ai-s3-m4',
          title: 'Tinh chỉnh mô hình ngôn ngữ',
          topics: [
            'LoRA / tinh chỉnh hiệu quả tham số',
            'Chưng cất (distillation), lượng tử hoá',
            'Khi tinh chỉnh KHÔNG đáng so với prompt tốt hơn',
          ],
        },
      ],
      project: {
        name: 'Mô hình tinh chỉnh cho bài toán tiếng Việt',
        brief: 'Chọn tác vụ tiếng Việt và tinh chỉnh một mô hình mở cho tác vụ đó.',
        requirements: [
          'So sánh với mô hình gốc và với giải pháp prompt thuần',
          'Thẻ mô hình (model card): dữ liệu, giới hạn, rủi ro',
          'Chạy được suy luận trên phần cứng bình dân, có số đo độ trễ',
        ],
      },
    },
    {
      id: 'ai-s4',
      tier: 's4',
      name: 'Chuyên gia — MLOps và hệ thống AI',
      canDo: 'Đưa mô hình vào sản xuất, theo dõi, cập nhật an toàn và chịu trách nhiệm hậu quả.',
      duration: '12–16 tuần',
      modules: [
        {
          id: 'ai-s4-m1',
          title: 'Sản xuất hoá',
          topics: [
            'Đóng gói mô hình, phiên bản dữ liệu và mã',
            'Phục vụ suy luận: theo lô, trực tuyến, biên',
            'Tối ưu độ trễ và chi phí GPU',
          ],
        },
        {
          id: 'ai-s4-m2',
          title: 'Giám sát mô hình',
          topics: [
            'Phát hiện dịch chuyển dữ liệu và suy giảm chất lượng',
            'Vòng phản hồi từ người dùng thành dữ liệu huấn luyện',
            'Thí nghiệm trực tuyến cho mô hình mới',
          ],
        },
        {
          id: 'ai-s4-m3',
          title: 'Hệ tác tử',
          topics: [
            'Gọi công cụ, lập kế hoạch nhiều bước, giới hạn quyền',
            'Đánh giá tác tử theo kết quả nhiệm vụ, không theo văn phong',
            'Chi phí và vòng lặp vô hạn — cắt bằng ngân sách cứng',
          ],
        },
        {
          id: 'ai-s4-m4',
          title: 'Trách nhiệm',
          topics: [
            'Đánh giá tác hại, nhóm bị ảnh hưởng',
            'Quyền riêng tư, dữ liệu huấn luyện và bản quyền',
            'Nói rõ giới hạn cho người dùng cuối',
          ],
        },
      ],
      project: {
        name: 'Hệ thống AI vận hành thật',
        brief: 'Mô hình phục vụ người dùng thật với giám sát và quy trình cập nhật.',
        requirements: [
          'Đường ống huấn luyện lại tự động, có kiểm duyệt trước khi phát hành',
          'Bảng theo dõi chất lượng và chi phí theo ngày',
          'Tài liệu rủi ro và cơ chế người dùng báo lỗi mô hình',
        ],
      },
    },
  ],
  capstone: {
    name: 'Sản phẩm AI có người dùng và có bằng chứng chất lượng',
    brief: 'Ứng dụng AI bạn vận hành, đo đạc và cải thiện qua nhiều vòng.',
    requirements: [
      'Bộ đánh giá chạy trong CI, chặn hồi quy chất lượng',
      'Số liệu chất lượng và chi phí công bố theo tháng',
      'Ít nhất 2 vòng cải thiện có bằng chứng trước–sau',
      'Tài liệu giới hạn và rủi ro viết cho người dùng đọc',
    ],
  },
  expertSignals: [
    'Xây bộ đánh giá trước khi chỉnh mô hình',
    'Nghi ngờ kết quả quá tốt vì thường là rò rỉ dữ liệu',
    'Chọn giải pháp đơn giản nhất đạt yêu cầu, kể cả khi không dùng AI',
    'Nói được mô hình sai kiểu gì và ai chịu thiệt khi nó sai',
  ],
  careers: [
    'AI Engineer / LLM Application Engineer',
    'Machine Learning Engineer',
    'MLOps Engineer',
    'Applied Research Engineer',
  ],
  pitfalls: [
    'Chỉnh prompt theo cảm giác vì không có bộ đánh giá',
    'Rò rỉ dữ liệu tương lai vào tập huấn luyện',
    'Dùng độ chính xác trên dữ liệu mất cân bằng nặng',
    'Bỏ qua chi phí suy luận cho tới lúc nhận hoá đơn',
  ],
  resources: [
    'Hands-On Machine Learning — Aurélien Géron',
    'Deep Learning — Goodfellow, Bengio, Courville',
    'Designing Machine Learning Systems — Chip Huyen',
    'Tài liệu chính thức PyTorch và Hugging Face',
  ],
}
