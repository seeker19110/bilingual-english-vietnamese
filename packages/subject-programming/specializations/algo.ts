// Hướng THUẬT TOÁN — không phải một nghề riêng, mà là lớp năng lực nền cắt ngang mọi hướng khác.
import type { ProgrammingSpecialization } from './types.js'

export const ALGO_SPECIALIZATION: ProgrammingSpecialization = {
  id: 'algo',
  name: 'Thuật toán & Giải quyết vấn đề',
  tagline: 'Nền tảng cắt ngang mọi hướng: nghĩ ra lời giải đúng và chứng minh được nó nhanh.',
  forWho:
    'Hợp với người muốn qua vòng phỏng vấn kỹ thuật và muốn tự tin trước bài toán chưa từng gặp. Đây là hướng BỔ TRỢ — nên học song song một hướng sản phẩm, không thay thế nó.',
  prerequisite: 'p3',
  duration: '6–12 tháng (học đều, mỗi ngày một chút)',
  languages: ['Python', 'C++', 'Java hoặc ngôn ngữ bạn thạo nhất'],
  coreTools: ['LeetCode/Codeforces', 'trình gỡ lỗi', 'giấy bút'],
  stages: [
    {
      id: 'algo-s1',
      tier: 's1',
      name: 'Nền tảng và độ phức tạp',
      canDo: 'Phân tích được big-O của code mình viết và chọn đúng cấu trúc dữ liệu cơ bản.',
      duration: '6–8 tuần',
      modules: [
        {
          id: 'algo-s1-m1',
          title: 'Độ phức tạp',
          topics: [
            'Big-O thời gian và bộ nhớ, phân tích khấu hao',
            'Đo thời gian thật để đối chiếu với lý thuyết',
            'Ràng buộc đề bài cho biết thuật toán nào chấp nhận được',
          ],
        },
        {
          id: 'algo-s1-m2',
          title: 'Cấu trúc dữ liệu tuyến tính',
          topics: [
            'Mảng động, danh sách liên kết',
            'Ngăn xếp, hàng đợi, hàng đợi hai đầu',
            'Bảng băm: va chạm, chi phí thật',
          ],
        },
        {
          id: 'algo-s1-m3',
          title: 'Kỹ thuật cơ bản',
          topics: [
            'Hai con trỏ, cửa sổ trượt',
            'Tổng tiền tố',
            'Sắp xếp và tìm kiếm nhị phân — kể cả nhị phân trên đáp án',
          ],
        },
        {
          id: 'algo-s1-m4',
          title: 'Kỷ luật giải bài',
          topics: [
            'Đọc đề, tự nghĩ ca biên trước khi viết code',
            'Viết bản đơn giản chắc đúng làm chuẩn đối chiếu',
            'Kiểm thử ngẫu nhiên so hai lời giải',
          ],
        },
      ],
      project: {
        name: '80 bài nền tảng có nhật ký',
        brief: 'Giải 80 bài mức dễ–trung bình, mỗi bài ghi lại cách nghĩ.',
        requirements: [
          'Mỗi bài ghi: ý tưởng, độ phức tạp, ca biên đã nghĩ',
          'Ít nhất 15 bài giải lại sau 2 tuần mà không nhìn lời giải cũ',
          'Có bộ kiểm thử ngẫu nhiên cho ≥ 5 bài',
        ],
      },
    },
    {
      id: 'algo-s2',
      tier: 's2',
      name: 'Cây, đồ thị, đệ quy',
      canDo: 'Giải được bài toán trên cây và đồ thị, thiết kế được lời giải đệ quy đúng.',
      duration: '8–10 tuần',
      modules: [
        {
          id: 'algo-s2-m1',
          title: 'Đệ quy và quay lui',
          topics: [
            'Nghĩ theo bài toán con, chứng minh dừng',
            'Quay lui có cắt tỉa',
            'Chuyển đệ quy sang lặp khi ngăn xếp là vấn đề',
          ],
        },
        {
          id: 'algo-s2-m2',
          title: 'Cây',
          topics: [
            'Duyệt cây, cây tìm kiếm nhị phân, cây cân bằng',
            'Đống (heap) và hàng đợi ưu tiên',
            'Cây tiền tố (trie)',
          ],
        },
        {
          id: 'algo-s2-m3',
          title: 'Đồ thị',
          topics: [
            'BFS/DFS, thành phần liên thông, sắp xếp tô-pô',
            'Đường đi ngắn nhất: Dijkstra, Bellman-Ford',
            'Cây khung nhỏ nhất, hợp-tìm (union-find)',
          ],
        },
        {
          id: 'algo-s2-m4',
          title: 'Tham lam',
          topics: [
            'Khi tham lam đúng và cách chứng minh',
            'Bài toán lịch biểu, khoảng thời gian',
            'Phản ví dụ để bác bỏ ý tưởng tham lam sai',
          ],
        },
      ],
      project: {
        name: 'Bộ giải bài toán đồ thị thật',
        brief: 'Áp dụng đồ thị vào bài toán đời thật: chỉ đường, xếp lịch, gợi ý.',
        requirements: [
          'Chạy trên dữ liệu thật ≥ 10.000 đỉnh',
          'So sánh ≥ 2 thuật toán với số đo thời gian',
          'Giải thích được vì sao thuật toán chọn là đúng',
        ],
      },
    },
    {
      id: 'algo-s3',
      tier: 's3',
      name: 'Quy hoạch động và kỹ thuật nâng cao',
      canDo: 'Nhận ra và giải được bài quy hoạch động, xử lý bài toán chuỗi và toán rời rạc.',
      duration: '10–12 tuần',
      modules: [
        {
          id: 'algo-s3-m1',
          title: 'Quy hoạch động',
          topics: [
            'Trạng thái, chuyển trạng thái, thứ tự tính',
            'Từ đệ quy có nhớ tới lặp, tối ưu bộ nhớ',
            'Các họ bài kinh điển: ba lô, LIS, chia đoạn',
          ],
        },
        {
          id: 'algo-s3-m2',
          title: 'Chuỗi',
          topics: [
            'KMP, Z-function, băm chuỗi',
            'Trie nâng cao, Aho-Corasick',
            'Khoảng cách chỉnh sửa và ứng dụng thật',
          ],
        },
        {
          id: 'algo-s3-m3',
          title: 'Toán rời rạc ứng dụng',
          topics: [
            'Số học mô-đun, sàng nguyên tố',
            'Tổ hợp, xác suất cơ bản',
            'Hình học cơ bản: bao lồi, giao đoạn thẳng',
          ],
        },
        {
          id: 'algo-s3-m4',
          title: 'Cấu trúc dữ liệu nâng cao',
          topics: [
            'Cây phân đoạn, cây chỉ số nhị phân',
            'Sparse table, truy vấn khoảng',
            'Cấu trúc dữ liệu bền vững (persistent) mức khái niệm',
          ],
        },
      ],
      project: {
        name: 'Thi đấu và phân tích',
        brief: 'Tham gia ≥ 10 cuộc thi lập trình trực tuyến và phân tích bài chưa giải được.',
        requirements: [
          'Nhật ký từng kỳ thi: sai ở đâu, thiếu kiến thức gì',
          'Giải lại toàn bộ bài không làm được, có ghi chú',
          'Xếp hạng cải thiện rõ theo thời gian',
        ],
      },
    },
    {
      id: 'algo-s4',
      tier: 's4',
      name: 'Chuyên gia — thuật toán trong hệ thống thật',
      canDo:
        'Mang tư duy thuật toán vào sản phẩm: chọn cấu trúc dữ liệu cứu được chi phí và độ trễ.',
      duration: '12–16 tuần',
      modules: [
        {
          id: 'algo-s4-m1',
          title: 'Thuật toán trong sản xuất',
          topics: [
            'Cấu trúc dữ liệu xác suất: Bloom filter, HyperLogLog, count-min sketch',
            'Thuật toán trực tuyến và luồng dữ liệu',
            'Tìm kiếm lân cận gần đúng cho tìm kiếm vector',
          ],
        },
        {
          id: 'algo-s4-m2',
          title: 'Tối ưu và NP-khó',
          topics: [
            'Nhận ra bài NP-khó và ngừng tìm lời giải hoàn hảo',
            'Xấp xỉ, heuristic, luyện kim mô phỏng',
            'Quy hoạch tuyến tính mức dùng được',
          ],
        },
        {
          id: 'algo-s4-m3',
          title: 'Song song và bộ nhớ',
          topics: [
            'Thuật toán thân thiện cache',
            'Chia để trị song song, map-reduce',
            'Thuật toán khi dữ liệu lớn hơn RAM',
          ],
        },
        {
          id: 'algo-s4-m4',
          title: 'Phỏng vấn và truyền đạt',
          topics: [
            'Nghĩ thành tiếng, làm rõ đề trước khi code',
            'Thiết kế hệ thống trong 45 phút',
            'Dạy lại thuật toán cho người khác hiểu',
          ],
        },
      ],
      project: {
        name: 'Tối ưu thuật toán cho một hệ thống thật',
        brief: 'Tìm điểm nghẽn thuật toán trong dự án của bạn và thay bằng lời giải tốt hơn.',
        requirements: [
          'Cải thiện đo được ≥ 10 lần ở tình huống thật',
          'Chứng minh tính đúng bằng test đối chiếu với bản cũ',
          'Bài viết giải thích cho người khác học lại được',
        ],
      },
    },
  ],
  capstone: {
    name: 'Năng lực giải bài toán mới được chứng minh',
    brief:
      'Bằng chứng bạn đối mặt được bài toán chưa từng gặp: thi đấu, đóng góp, hoặc tối ưu thật.',
    requirements: [
      'Vượt ≥ 3 vòng phỏng vấn kỹ thuật thật hoặc đạt thứ hạng đáng kể trong kỳ thi',
      'Ít nhất một tối ưu thuật toán áp dụng vào sản phẩm có số đo',
      'Bộ ghi chú cá nhân dùng lại được cho người khác',
    ],
  },
  expertSignals: [
    'Ước lượng độ phức tạp cần thiết từ ràng buộc đề trước khi nghĩ lời giải',
    'Tìm phản ví dụ cho chính ý tưởng của mình trước khi viết code',
    'Biết khi nào lời giải O(n²) là đủ và tối ưu thêm là lãng phí',
    'Giải thích được thuật toán cho người không cùng nền tảng',
  ],
  careers: [
    'Software Engineer (mọi hướng — đây là năng lực nền)',
    'Quantitative Developer',
    'Search / Recommendation Engineer',
    'Research Engineer',
  ],
  pitfalls: [
    'Học thuộc lời giải thay vì học cách nghĩ ra lời giải',
    'Chỉ luyện thuật toán mà không làm sản phẩm nào',
    'Bỏ qua ca biên vì "bài này đơn giản"',
    'Tối ưu vi mô trong khi thuật toán vẫn sai độ phức tạp',
  ],
  resources: [
    'Introduction to Algorithms (CLRS) — tra cứu',
    'Competitive Programming Handbook — Antti Laaksonen',
    'Algorithm Design Manual — Steven Skiena',
    'LeetCode / Codeforces để luyện đều',
  ],
}
