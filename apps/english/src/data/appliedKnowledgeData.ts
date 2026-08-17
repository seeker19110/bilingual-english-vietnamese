// apps/english/src/data/appliedKnowledgeData.ts — Kho Dữ Liệu "Ứng Dụng Thực Tế Kiến Thức Đã Học"
// Toàn diện 12 khối lớp & liên môn K12 (Toán, Lý, Hóa, Sinh, Tin, Văn, Anh, Sử, Địa, KTPL)

export type GradeTier = 'all' | 'elementary' | 'secondary' | 'highschool' | 'adult'
export type SubjectId =
  | 'all'
  | 'mathematics'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'informatics'
  | 'literature'
  | 'english'
  | 'economics_law'
  | 'history_geography'

export interface RealWorldApplicationItem {
  id: string
  subjectId: SubjectId
  subjectName: string
  tier: GradeTier
  tierLabel: string
  gradeSpan: string
  topic: string
  academicConcept: string
  intuitiveExplanation: string
  realWorldProblems: Array<{
    title: string
    description: string
    practicalBenefit: string
  }>
  industryApplications: Array<{
    industry: string
    jobTitle: string
    howItIsUsed: string
  }>
  miniProject: {
    title: string
    durationMinutes: number
    instructions: string[]
    deliverable: string
  }
  simulatorType?:
    | 'profit'
    | 'electricity'
    | 'nutrition'
    | 'compound_interest'
    | 'gps_relativity'
    | 'solution_mixing'
    | 'trigonometry_height'
    | 'dopamine_focus'
}

export const APPLIED_KNOWLEDGE_DATA: RealWorldApplicationItem[] = [
  // ==========================================
  // 1. TOÁN HỌC (MATHEMATICS)
  // ==========================================
  {
    id: 'math_derivative_optimization',
    subjectId: 'mathematics',
    subjectName: 'Toán học',
    tier: 'highschool',
    tierLabel: 'Cấp 3 (Lớp 10–12)',
    gradeSpan: 'Lớp 12',
    topic: 'Đạo hàm & Bài toán Tối ưu hóa (Optimization)',
    academicConcept:
      "Khảo sát hàm số, tìm cực trị y' = 0 để xác định giá trị lớn nhất (GTLN) và nhỏ nhất (GTNN).",
    intuitiveExplanation:
      'Đạo hàm là "công cụ đo tốc độ thay đổi". Bất cứ khi nào bạn muốn tìm "điểm ngọt ngào nhất" (bán giá nào lãi nhiều nhất, cắt tấm tôn thế nào đựng được nhiều nước nhất, chạy vận tốc nào ít tốn xăng nhất) — đạo hàm sẽ chỉ đích danh điểm đó.',
    realWorldProblems: [
      {
        title: 'Định giá bán trà sữa/quần áo để lợi nhuận tối đa',
        description:
          'Tăng giá thì lãi mỗi món tăng nhưng số người mua giảm. Hạ giá thì đông khách nhưng lãi mỏng. Đạo hàm giúp tìm điểm giá chính xác để tổng lãi cao nhất.',
        practicalBenefit:
          'Tránh định giá theo cảm tính, tối ưu hóa lợi nhuận ròng cho cửa hàng hoặc dự án kinh doanh.',
      },
      {
        title: 'Thiết kế bao bì lon nước ngọt & hộp carton tiết kiệm vật liệu',
        description:
          'Với cùng thể tích 330ml, kích thước bán kính và chiều cao lon nước ngọt thế nào sẽ tốn ít nhôm nhất để sản xuất hàng triệu lon?',
        practicalBenefit:
          'Tiết kiệm hàng triệu USD chi phí bao bì cho các tập đoàn F&B như Coca-Cola, Pepsi.',
      },
      {
        title: 'Tối ưu hóa cước xe công nghệ và quãng đường giao hàng',
        description:
          'Grab/ShopeeFood liên tục tính toán đạo hàm để điều chỉnh giá cước theo giờ cao điểm và tối ưu hóa thời gian giao hàng.',
        practicalBenefit: 'Tăng thu nhập tài xế, giảm thời gian chờ của khách hàng.',
      },
    ],
    industryApplications: [
      {
        industry: 'Trí tuệ nhân tạo (AI & Data Science)',
        jobTitle: 'AI Research Engineer / Data Scientist',
        howItIsUsed:
          'Mọi mô hình AI hiện đại (ChatGPT, xe tự hành Tesla) đều học bằng thuật toán Gradient Descent (Bản chất là đạo hàm liên tục của hàm mất mát để giảm thiểu sai số).',
      },
      {
        industry: 'Tài chính & Đầu tư',
        jobTitle: 'Quantitative Analyst (Quant)',
        howItIsUsed:
          'Tính tốc độ biến động giá cổ phiếu (Greeks trong định giá phái sinh: Delta, Gamma chính là đạo hàm bậc 1 và bậc 2).',
      },
      {
        industry: 'Logistics & Chuỗi cung ứng',
        jobTitle: 'Supply Chain Operations Manager',
        howItIsUsed:
          'Tối ưu số lượng hàng tồn kho (Mô hình EOQ) để chi phí lưu kho và đặt hàng là thấp nhất.',
      },
    ],
    miniProject: {
      title: 'Tự thiết kế hộp quà tiết kiệm giấy bìa nhất',
      durationMinutes: 20,
      instructions: [
        'Cắt một tờ giấy A4 kích thước 20x20cm.',
        'Cắt 4 góc vuông có cạnh x cm để gấp thành hộp chữ nhật không nắp.',
        "Dùng công thức V(x) = x*(20 - 2x)^2 và đạo hàm V'(x) = 0 để tìm x cho thể tích lớn nhất.",
        'Gấp thực tế và đo lượng hạt gạo đựng được để kiểm chứng kết quả.',
      ],
      deliverable: 'Một chiếc hộp có thể tích chứa lớn nhất từ 1 tờ giấy duy nhất.',
    },
    simulatorType: 'profit',
  },
  {
    id: 'math_trigonometry_height_distance',
    subjectId: 'mathematics',
    subjectName: 'Toán học',
    tier: 'secondary',
    tierLabel: 'Cấp 2 (Lớp 6–9)',
    gradeSpan: 'Lớp 9 & 10',
    topic: 'Lượng Giác & Nghệ Thuật Đo Khoảng Cách Không Cần Trèo',
    academicConcept:
      'Hệ thức lượng trong tam giác vuông: tan(alpha) = Đối / Kề => Chiều cao h = d * tan(alpha).',
    intuitiveExplanation:
      'Lượng giác biến góc nhìn của mắt thành thước đo độ dài. Bạn chỉ cần đứng yên dưới đất, đo góc nhìn lên ngọn cây và đếm bước chân là tính được chiều cao của bất kỳ tòa nhà nào.',
    realWorldProblems: [
      {
        title: 'Đo chiều cao cây xanh hoặc tòa nhà bằng góc nghiêng điện thoại',
        description:
          'Dùng app đo góc (Clinometer) trên điện thoại ngắm đỉnh tòa nhà (vd: góc 45 độ), đo khoảng cách từ chỗ đứng đến chân tòa nhà (30m) => Chiều cao tòa nhà = 30m * tan(45°) + chiều cao mắt (1.6m) = 31.6m.',
        practicalBenefit:
          'Tự khảo sát địa hình, thiết kế sân vườn hoặc lắp đặt giàn phơi/ăng-ten không cần leo trèo nguy hiểm.',
      },
      {
        title: 'Tính toán góc nghiêng tối ưu lắp tấm pin năng lượng mặt trời',
        description:
          'Góc nghiêng của tấm pin mặt trời cần bằng với vĩ độ địa phương (ở Việt Nam từ 10° - 22°) để hứng được lượng bức xạ mặt trời cực đại trong cả năm.',
        practicalBenefit: 'Tăng 15-25% sản lượng điện mặt trời tạo ra cho gia đình.',
      },
    ],
    industryApplications: [
      {
        industry: 'Trắc địa & Đo đạc công trình (Surveying)',
        jobTitle: 'Civil Geomatics Engineer',
        howItIsUsed:
          'Dùng máy toàn đạc điện tử (Total Station) đo đạc tọa độ thi công cầu đường, hầm chui và cao ốc.',
      },
      {
        industry: 'Hàng hải & Hàng không',
        jobTitle: 'Flight Navigation Officer',
        howItIsUsed:
          'Tính toán góc tiếp cận hạ cánh (Glide slope 3 độ) đưa máy bay hạ cánh an toàn trong sương mù.',
      },
    ],
    miniProject: {
      title: 'Tự chế thước đo góc ngắm (Inclinometer) đo chiều cao cột cờ',
      durationMinutes: 20,
      instructions: [
        'Dán một ống hút nhựa lên cạnh thước đo độ 180 độ.',
        'Buộc một sợi chỉ có gắn viên bi ở tâm thước để làm dây dọi trọng lực.',
        'Ngắm đỉnh cột cờ qua ống hút, đọc góc lệch của dây dọi.',
        'Bước đếm khoảng cách tới cột cờ và dùng công thức h = d * tan(alpha) + chiều cao mắt.',
      ],
      deliverable: 'Con số chiều cao chính xác của cột cờ trường học/nhà bạn.',
    },
    simulatorType: 'trigonometry_height',
  },
  {
    id: 'math_compound_interest_progression',
    subjectId: 'mathematics',
    subjectName: 'Toán học',
    tier: 'highschool',
    tierLabel: 'Cấp 3 (Lớp 10–12)',
    gradeSpan: 'Lớp 11–12',
    topic: 'Cấp số nhân & Sức mạnh Lãi kép (Compound Interest)',
    academicConcept: 'Dãy số cấp số nhân u_n = u_1 * q^(n-1) và hàm số mũ A = P*(1 + r)^n.',
    intuitiveExplanation:
      'Lãi kép là "tiền đẻ ra tiền, rồi lãi của tiền lại tiếp tục đẻ ra tiền". Albert Einstein từng gọi lãi kép là kỳ quan thứ 8 của nhân loại — người hiểu nó sẽ kiếm được tiền, người không hiểu sẽ phải trả tiền cho nó.',
    realWorldProblems: [
      {
        title: 'Kế hoạch tự do tài chính & Tích lũy mua nhà tuổi 30',
        description:
          'Nếu tiết kiệm 3 triệu VNĐ mỗi tháng và đầu tư với lợi suất 10%/năm, sau 20 năm bạn không chỉ có 720 triệu vốn gốc mà sẽ có hơn 2,2 tỷ VNĐ nhờ lãi kép.',
        practicalBenefit:
          'Xây dựng thói quen tài chính kỷ luật, không bị cuốn vào bẫy tiêu dùng phung phí.',
      },
      {
        title: 'Nhận diện cái bẫy "Nợ thẻ tín dụng" và "Vay trả góp"',
        description:
          'Lãi suất thẻ tín dụng 25-35%/năm tính theo ngày sẽ khiến một khoản nợ nhỏ tăng gấp đôi sau chưa đầy 3 năm nếu chỉ trả mức tối thiểu.',
        practicalBenefit:
          'Biết cách sử dụng thẻ tín dụng thông minh, không bao giờ rơi vào khủng hoảng nợ nần.',
      },
    ],
    industryApplications: [
      {
        industry: 'Ngân hàng & Quản lý quỹ',
        jobTitle: 'Financial Planner / Wealth Manager',
        howItIsUsed:
          'Lập kế hoạch hưu trí, quỹ học vấn con cái, định giá trái phiếu và dòng tiền chiết khấu (DCF).',
      },
      {
        industry: 'Công nghệ bảo hiểm (InsurTech)',
        jobTitle: 'Actuary (Chuyên viên Định phí Bảo hiểm)',
        howItIsUsed:
          'Tính toán phí bảo hiểm nhân thọ và khả năng chi trả của quỹ dự phòng theo thời gian.',
      },
    ],
    miniProject: {
      title: 'Bản đồ tích lũy 10 năm của bản thân',
      durationMinutes: 15,
      instructions: [
        'Xác định một số tiền nhỏ bạn có thể để dành mỗi tháng (vd: 500.000 VNĐ).',
        'Tính giá trị tương lai sau 5 năm, 10 năm với mức sinh lời 8%/năm.',
        'So sánh kết quả giữa "để tiền trong heo đất" và "đầu tư tích lũy lãi kép".',
      ],
      deliverable: 'Biểu đồ cá nhân hóa mục tiêu tài chính 5-10 năm tới.',
    },
    simulatorType: 'compound_interest',
  },
  {
    id: 'math_statistics_probability',
    subjectId: 'mathematics',
    subjectName: 'Toán học',
    tier: 'secondary',
    tierLabel: 'Cấp 2 (Lớp 6–9)',
    gradeSpan: 'Lớp 7–9 & 10',
    topic: 'Thống kê, Xác suất & Phát hiện Bẫy Số liệu',
    academicConcept:
      'Kỳ vọng E(X), phương sai, độ lệch chuẩn, xác suất có điều kiện P(A|B), định lý Bayes.',
    intuitiveExplanation:
      'Xác suất và thống kê là chiếc kính giúp bạn nhìn thấu sự thật đằng sau những con số giật gân trên mạng xã hội, tránh bị lừa đảo và đưa ra quyết định lý trí trong mọi tình huống không chắc chắn.',
    realWorldProblems: [
      {
        title: 'Hiểu vì sao "Nhà cái luôn thắng" trong cá cược & cờ bạc',
        description:
          'Kỳ vọng toán học E(X) của mọi trò chơi đỏ đen (Vietlott, Roulette, tài xỉu) đều âm đối với người chơi. Chơi càng nhiều ván thì tỷ lệ cháy túi chắc chắn tiến tới 100%.',
        practicalBenefit: 'Miễn dịch hoàn toàn trước các lời mời gọi cờ bạc online, game tài xỉu.',
      },
      {
        title: 'Đánh giá độ chính xác xét nghiệm y khoa (Bẫy Dương tính giả)',
        description:
          'Một xét nghiệm bệnh hiếm có độ chính xác 99%, bạn có kết quả Dương tính nhưng xác suất bạn thực sự bị bệnh có thể chỉ dưới 10% (theo định lý Bayes).',
        practicalBenefit:
          'Bình tĩnh kiểm tra lại thông tin y khoa, không hoảng loạn khi nhận kết quả khám sức khỏe.',
      },
    ],
    industryApplications: [
      {
        industry: 'Thương mại điện tử & MXH (Shopee, TikTok)',
        jobTitle: 'Growth Hacker / A/B Testing Specialist',
        howItIsUsed:
          'Chạy thử nghiệm A/B trên 100.000 người dùng để xem nút bấm màu cam hay màu xanh giúp tăng 15% đơn hàng với mức ý nghĩa thống kê p < 0.05.',
      },
      {
        industry: 'Dược phẩm & Y tế công cộng',
        jobTitle: 'Biostatistician (Chuyên viên Thống kê Sinh học)',
        howItIsUsed:
          'Thử nghiệm lâm sàng vắc-xin và thuốc mới để chứng minh thuốc có hiệu quả thực sự hay chỉ là giả dược (placebo).',
      },
    ],
    miniProject: {
      title: 'Kiểm chứng tính ngẫu nhiên của xúc xắc / đồng xu',
      durationMinutes: 15,
      instructions: [
        'Tung đồng xu 50 lần, ghi lại tỷ lệ Mặt Ngửa.',
        'Tính độ lệch so với xác suất lý thuyết 50%.',
        'Hiểu Luật số lớn (Law of Large Numbers) khi tăng lên 500 lần.',
      ],
      deliverable:
        'Báo cáo thống kê giải thích vì sao mẫu thử càng lớn thì kết quả càng đáng tin cậy.',
    },
  },

  // ==========================================
  // 2. VẬT LÝ (PHYSICS)
  // ==========================================
  {
    id: 'physics_relativity_gps',
    subjectId: 'physics',
    subjectName: 'Vật lý',
    tier: 'highschool',
    tierLabel: 'Cấp 3 (Lớp 10–12)',
    gradeSpan: 'Lớp 12 & Đại học',
    topic: 'Thuyết Tương Đối Einstein & Hệ Thống Định Vị Vệ Tinh GPS',
    academicConcept:
      'Thuyết tương đối hẹp (đồng hồ chuyển động nhanh chạy chậm hơn) và Thuyết tương đối rộng (đồng hồ ở nơi có trọng lực yếu chạy nhanh hơn).',
    intuitiveExplanation:
      'Thời gian không trôi chảy giống nhau ở mọi nơi! Vệ tinh GPS bay trên cao ở tốc độ 14.000 km/h và chịu trọng lực yếu hơn mặt đất, khiến đồng hồ của vệ tinh chạy nhanh hơn dưới mặt đất 38 micro-giây mỗi ngày.',
    realWorldProblems: [
      {
        title:
          'Vì sao không có Thuyết tương đối của Einstein thì Grab/Google Maps bị sai 10km mỗi ngày?',
        description:
          'Sai lệch 38 micro-giây/ngày nhân với vận tốc ánh sáng (300.000 km/s) sẽ khiến vị trí định vị trên bản đồ sai lệch hơn 11 km mỗi ngày chỉ sau 24 giờ.',
        practicalBenefit:
          'Hiểu bản chất công nghệ định vị toàn cầu mà bạn dùng để đặt xe, tìm đường mỗi ngày.',
      },
    ],
    industryApplications: [
      {
        industry: 'Hàng không vũ trụ & Vệ tinh (NASA, SpaceX)',
        jobTitle: 'Aerospace Guidance & Navigation Engineer',
        howItIsUsed:
          'Lập trình thuật toán bù trừ tương đối tính cho các tàu vũ trụ thám hiểm Sao Hỏa và mạng lưới Starlink.',
      },
    ],
    miniProject: {
      title: 'Mô phỏng sai số thời gian tương đối tính',
      durationMinutes: 15,
      instructions: [
        'Mở trình mô phỏng GPS Relativity trên app.',
        'Kéo tăng tốc độ và độ cao vệ tinh để quan sát sai số tích lũy theo thời gian.',
        'Quan sát vị trí của bạn bị trôi dạt khỏi điểm thực tế.',
      ],
      deliverable: 'Hiểu cách phần mềm hiệu chỉnh thời gian chính xác từng nano-giây.',
    },
    simulatorType: 'gps_relativity',
  },
  {
    id: 'physics_electricity_power_cost',
    subjectId: 'physics',
    subjectName: 'Vật lý',
    tier: 'secondary',
    tierLabel: 'Cấp 2 (Lớp 6–9)',
    gradeSpan: 'Lớp 9 & 11',
    topic: 'Công suất Điện, Định luật Joule–Lenz & Tối ưu hóa Tiền điện',
    academicConcept:
      'Công suất P = U*I, Điện năng tiêu thụ A = P*t, Nhiệt lượng tỏa ra Q = I^2*R*t.',
    intuitiveExplanation:
      'Dòng điện giống như dòng nước chảy mang theo năng lượng. Thiết bị có công suất W càng lớn và chạy càng lâu thì đồng hồ điện quay càng nhanh. Tỏa nhiệt trên dây dẫn là hao phí tiền bạc.',
    realWorldProblems: [
      {
        title: 'Cắt giảm 25% hóa đơn tiền điện mùa hè cho gia đình',
        description:
          'Hiểu nguyên lý máy nén điều hòa: Bật 26-27 độ C kèm quạt gió tiêu thụ ít hơn 40% điện so với bật 18-20 độ C liên tục vì máy nén không phải chạy quá tải.',
        practicalBenefit:
          'Tiết kiệm từ 300.000đ đến hơn 1.000.000đ tiền điện mỗi tháng cho gia đình.',
      },
      {
        title: 'Chọn dây dẫn điện và aptomat (CB) an toàn chống cháy nổ',
        description:
          'Khi cắm cùng lúc bếp từ (2000W), ấm siêu tốc (1500W) và lò vi sóng (1000W) vào 1 ổ cắm mỏng, dòng điện I = P/U tăng vọt làm dây phát nhiệt nóng chảy gây chập cháy.',
        practicalBenefit:
          'Bảo vệ an toàn tính mạng và tài sản cho ngôi nhà, biết cách phân tải điện an toàn.',
      },
    ],
    industryApplications: [
      {
        industry: 'Năng lượng tái tạo & Xe điện (VinFast, Tesla)',
        jobTitle: 'Battery Systems Engineer',
        howItIsUsed:
          'Thiết kế hệ thống sạc nhanh và quản lý nhiệt độ pin xe điện để pin không bị quá nhiệt (theo định luật Joule-Lenz).',
      },
      {
        industry: 'Xây dựng & Cơ điện công trình (M&E)',
        jobTitle: 'Electrical Design Engineer',
        howItIsUsed:
          'Tính toán tiết diện dây cáp, bù công suất phản kháng cos phi cho các tòa cao ốc và nhà máy.',
      },
    ],
    miniProject: {
      title: 'Kiểm toán năng lượng (Energy Audit) cho phòng ngủ của bạn',
      durationMinutes: 20,
      instructions: [
        'Đọc nhãn công suất (W) của 5 thiết bị trong phòng: Đèn, Quạt, Laptop, Điều hòa, Bộ sạc.',
        'Ước tính số giờ sử dụng trung bình mỗi ngày.',
        'Tính tổng số số điện (kWh) trong 30 ngày và nhân với giá điện bậc thang.',
      ],
      deliverable:
        'Bảng kê chi tiết thiết bị nào đang "ngốn" nhiều tiền nhất và kế hoạch cắt giảm.',
    },
    simulatorType: 'electricity',
  },
  {
    id: 'physics_waves_noise_cancelling',
    subjectId: 'physics',
    subjectName: 'Vật lý',
    tier: 'highschool',
    tierLabel: 'Cấp 3 (Lớp 10–12)',
    gradeSpan: 'Lớp 11–12',
    topic: 'Sóng Cơ, Giao Thoa Sóng & Công nghệ Chống ồn Chủ động (ANC)',
    academicConcept:
      'Phương trình sóng, hiện tượng giao thoa sóng, cực đại giao thoa khi cùng pha và cực tiểu giao thoa khi ngược pha (triệt tiêu nhau).',
    intuitiveExplanation:
      'Khi hai con sóng gặp nhau, đỉnh sóng gặp đỉnh sóng sẽ tạo ra sóng lớn hơn; nhưng nếu đỉnh sóng gặp đáy sóng (lệch pha 180 độ), chúng sẽ triệt tiêu nhau hoàn toàn thành mặt nước phẳng lặng.',
    realWorldProblems: [
      {
        title: 'Tai nghe chống ồn (AirPods Pro, Sony 1000XM5) hoạt động thế nào?',
        description:
          'Micro bên ngoài thu tiếng ồn môi trường, chip xử lý tạo ra sóng âm ngược pha chính xác 180 độ phát vào tai bạn để triệt tiêu tiếng động cơ máy bay, tiếng xe cộ.',
        practicalBenefit:
          'Bảo vệ thính giác, tập trung học tập và làm việc trong môi trường ồn ào.',
      },
      {
        title: 'Hiện tượng cộng hưởng và sự sụp đổ của cầu cạn / rung lắc nhà cao tầng',
        description:
          'Khi tần số bước chân của đoàn quân hoặc gió bão trùng với tần số dao động riêng của cây cầu, biên độ dao động tăng vọt có thể bẻ gãy bê tông cốt thép.',
        practicalBenefit:
          'Hiểu nguyên lý quả cầu giảm chấn khổng lồ nặng 660 tấn trong tháp Taipei 101 giúp chống bão và động đất.',
      },
    ],
    industryApplications: [
      {
        industry: 'Viễn thông 5G & Vệ tinh (Starlink, Viettel)',
        jobTitle: 'RF (Radio Frequency) Engineer',
        howItIsUsed:
          'Thiết kế ăng-ten mảng pha (Beamforming) điều hướng chùm sóng trực tiếp tới điện thoại của người dùng mà không gây nhiễu.',
      },
      {
        industry: 'Âm học kiến trúc & Sản xuất ô tô',
        jobTitle: 'Acoustic Engineer',
        howItIsUsed:
          'Thiết kế phòng thu âm, nhà hát giao hưởng và khoang lái xe hơi siêu êm cách âm tuyệt đối.',
      },
    ],
    miniProject: {
      title: 'Tự tạo hiện tượng giao thoa sóng âm bằng 2 điện thoại',
      durationMinutes: 15,
      instructions: [
        'Mở trang web phát âm tần số đơn (vd: 440Hz - nốt La) trên cả 2 điện thoại.',
        'Đặt 2 điện thoại cách nhau 50cm.',
        'Di chuyển đầu từ từ qua lại giữa 2 loa: bạn sẽ nghe thấy những điểm âm thanh to rõ và những điểm âm thanh gần như biến mất (giao thoa triệt tiêu).',
      ],
      deliverable: 'Cảm nhận trực tiếp hiện tượng giao thoa sóng ngay trong căn phòng của bạn.',
    },
  },

  // ==========================================
  // 3. HÓA HỌC (CHEMISTRY)
  // ==========================================
  {
    id: 'chem_solution_mixing_sanitizer',
    subjectId: 'chemistry',
    subjectName: 'Hóa học',
    tier: 'secondary',
    tierLabel: 'Cấp 2 (Lớp 6–9)',
    gradeSpan: 'Lớp 8–9',
    topic: 'Nồng Độ Dung Dịch, Công Thức Pha Chế & Cồn Sát Khuẩn 70° Chuẩn Y Tế',
    academicConcept:
      'Nồng độ phần trăm C% = (m_ct / m_dd)*100% và quy tắc đường chéo pha chế dung dịch.',
    intuitiveExplanation:
      'Cồn 90 độ bay hơi quá nhanh và làm đông vón vỏ protein của vi khuẩn khiến cồn không thấm vào bên trong. Cồn 70 độ có lượng nước vừa đủ để giữ cồn thấm sâu tiêu diệt 99.9% vi khuẩn.',
    realWorldProblems: [
      {
        title: 'Pha chế đúng 500ml cồn sát khuẩn 70° từ cồn 90° tại nhà',
        description:
          'Dùng công thức pha loãng V1 * C1 = V2 * C2: Để có 500ml cồn 70°, bạn lấy 388ml cồn 90° pha với 112ml nước cất tinh khiết.',
        practicalBenefit:
          'Tự chủ dung dịch sát khuẩn y tế chuẩn xác, tiết kiệm chi phí trong mùa dịch.',
      },
      {
        title: 'Pha nước muối sinh lý 0.9% súc họng đúng tỷ lệ',
        description:
          'Nước muối quá mặn (ưu trương) sẽ hút nước làm teo rát niêm mạc họng; nước quá nhạt (nhược trương) làm vỡ tế bào. Đúng chuẩn đẳng trương 0.9% là 9g muối ăn trong 1 lít nước.',
        practicalBenefit: 'Bảo vệ đường hô hấp, phòng viêm họng an toàn hàng ngày.',
      },
    ],
    industryApplications: [
      {
        industry: 'Dược phẩm & Bào chế thuốc',
        jobTitle: 'Pharmaceutical Formulation Scientist',
        howItIsUsed:
          'Tính toán nồng độ tá dược, dịch truyền tĩnh mạch và siro thuốc ho đạt độ ổn định cao nhất.',
      },
    ],
    miniProject: {
      title: 'Tự pha 1 chai nước súc miệng sinh lý 0.9% chuẩn khoa học',
      durationMinutes: 15,
      instructions: [
        'Dùng cân tiểu ly cân chính xác 4.5g muối tinh (NaCl).',
        'Rót 500ml nước đun sôi để nguội vào bình sạch.',
        'Khuấy tan hoàn toàn và dùng súc họng mỗi sáng.',
      ],
      deliverable: 'Chai nước súc họng an toàn đạt chuẩn y tế.',
    },
    simulatorType: 'solution_mixing',
  },
  {
    id: 'chem_acid_base_cleaning',
    subjectId: 'chemistry',
    subjectName: 'Hóa học',
    tier: 'secondary',
    tierLabel: 'Cấp 2 (Lớp 6–9)',
    gradeSpan: 'Lớp 8–9 & 11',
    topic: 'Axit – Bazơ, Thang pH & Hóa học Nhà bếp Thực tiễn',
    academicConcept:
      'Phản ứng trung hòa Axit + Bazơ -> Muối + Nước, nồng độ ion H+ và thang pH (0-14).',
    intuitiveExplanation:
      'Vết bẩn trong đời sống chia làm 2 phe: Vết bẩn gốc vô cơ (cặn vôi cặn nước cứng) mang tính kiềm/bazơ thì dùng Axit trị. Vết bẩn dầu mỡ hữu cơ mang tính axit thì dùng Bazơ (xà phòng, baking soda) để nhũ hóa.',
    realWorldProblems: [
      {
        title: 'Tẩy sạch cặn canxi vòi sen và ấm đun nước trong 10 phút',
        description:
          'Cặn trắng bám đáy ấm là Canxi cacbonat (CaCO3). Dùng giấm ăn (Axit axetic) hoặc chanh (Axit citric) phản ứng sinh ra muối tan và sủi bọt khí CO2, làm sạch bóng mà không cần cọ xát.',
        practicalBenefit: 'Không cần mua hóa chất độc hại đắt tiền, bảo vệ sức khỏe gia đình.',
      },
      {
        title: 'Xử lý tắc bồn rửa bát và khử mùi cống bằng Baking Soda + Giấm',
        description:
          'Baking soda (NaHCO3 - bazơ yếu) phản ứng với giấm sinh bọt CO2 áp suất cao kết hợp nhiệt nhẹ làm tan dầu mỡ đóng cặn.',
        practicalBenefit: 'Tự xử lý sự cố gia đình an toàn, tiết kiệm tiền gọi thợ sửa ống nước.',
      },
      {
        title: 'Hiểu đúng độ pH sữa rửa mặt và mỹ phẩm chăm sóc da',
        description:
          'Lớp màng bảo vệ tự nhiên của da có pH 5.5 (hơi axit nhẹ để diệt vi khuẩn). Dùng xà phòng kiềm pH 9-10 làm khô nứt nẻ và sinh mụn.',
        practicalBenefit: 'Chọn sản phẩm chăm sóc da khoa học, không bị quảng cáo đánh lừa.',
      },
    ],
    industryApplications: [
      {
        industry: "Mỹ phẩm & Chăm sóc cá nhân (Unilever, L'Oréal)",
        jobTitle: 'Cosmetic Formulation Chemist',
        howItIsUsed:
          'Cân bằng hệ đệm pH, nhũ tương hóa dầu-nước để tạo kem dưỡng da, serum và son môi.',
      },
      {
        industry: 'Xử lý nước sinh hoạt & Môi trường',
        jobTitle: 'Water Treatment Specialist',
        howItIsUsed:
          'Điều chỉnh pH và châm phèn nhôm (keo tụ) để làm trong nước sông thành nước máy sinh hoạt đạt chuẩn Bộ Y Tế.',
      },
    ],
    miniProject: {
      title: 'Tự chế chỉ thị màu pH từ bắp cải tím',
      durationMinutes: 20,
      instructions: [
        'Luộc vài lá bắp cải tím lấy nước màu tím đậm (chứa chất Anthocyanin).',
        'Rót nước vào 4 cốc nhỏ: Cốc 1 (nước cốt chanh), Cốc 2 (nước lọc), Cốc 3 (nước xà phòng), Cốc 4 (nước rửa chén).',
        'Quan sát màu đổi từ Đỏ (Axit mạnh) -> Tím (Trung tính) -> Xanh lục/Vàng (Bazơ).',
      ],
      deliverable: 'Bộ test pH tự nhiên kiểm tra độ an toàn của các dung dịch trong nhà.',
    },
  },
  {
    id: 'chem_electrochem_lithium_batteries',
    subjectId: 'chemistry',
    subjectName: 'Hóa học',
    tier: 'highschool',
    tierLabel: 'Cấp 3 (Lớp 10–12)',
    gradeSpan: 'Lớp 12',
    topic: 'Điện hóa học, Pin Galvanic & Bí mật Pin Lithium-ion',
    academicConcept:
      'Phản ứng oxi hóa - khử tự phát tạo ra dòng electron (anot và catot), thế điện cực chuẩn E0.',
    intuitiveExplanation:
      'Pin là thiết bị nhốt các phản ứng hóa học lại để bắt các hạt electron chạy qua dây dẫn sinh ra điện trước khi đến đích. Khi sạc điện, bạn dùng dòng điện ép các nguyên tử quay trở lại vị trí ban đầu.',
    realWorldProblems: [
      {
        title: 'Cách dùng và sạc pin điện thoại giúp tăng gấp đôi tuổi thọ',
        description:
          'Vì sao không nên để pin cạn về 0% hoặc cắm sạc qua đêm liên tục ở 100%? Cơ chế tinh thể lithium bị thoái hóa khi ở điện thế quá cao hoặc quá thấp.',
        practicalBenefit:
          'Điện thoại dùng 3-4 năm pin vẫn trâu, không lo bị chai phồng rủi ro cháy nổ.',
      },
      {
        title: 'Bảo vệ vỏ tàu biển và ống dẫn dầu bằng cực kẽm hy sinh',
        description:
          'Gắn một miếng kim loại Kẽm (Zn) vào vỏ tàu bằng Thép (Fe). Kẽm có tính khử mạnh hơn sẽ bị ăn mòn trước để bảo vệ vỏ tàu nguyên vẹn hàng chục năm.',
        practicalBenefit: 'Hiểu nguyên lý chống ăn mòn kim loại trong xây dựng và công trình biển.',
      },
    ],
    industryApplications: [
      {
        industry: 'Pin xe điện & Năng lượng tái tạo (CATL, LG Energy Solution)',
        jobTitle: 'Electrochemical Engineer',
        howItIsUsed:
          'Nghiên cứu vật liệu pin thể rắn (Solid-state battery) giúp xe điện chạy 1000km một lần sạc và sạc đầy trong 10 phút.',
      },
      {
        industry: 'Luyện kim & Chế tạo linh kiện cao cấp',
        jobTitle: 'Electroplating & Surface Finishing Engineer',
        howItIsUsed:
          'Mạ vàng chân chip điện tử, mạ crom chống xước cho chi tiết máy bay và siêu xe.',
      },
    ],
    miniProject: {
      title: 'Tạo pin điện từ quả chanh thắp sáng đèn LED',
      durationMinutes: 20,
      instructions: [
        'Cắm một thanh đồng (cực dương) và một đinh kẽm mạ (cực âm) vào 3 quả chanh.',
        'Nối các quả chanh nối tiếp nhau bằng dây điện.',
        'Nối 2 đầu dây vào đèn LED nhỏ để thấy đèn phát sáng nhờ axit citric trong chanh.',
      ],
      deliverable: 'Một cục pin sinh học mini chứng minh dòng điện sinh ra từ phản ứng hóa học.',
    },
  },

  // ==========================================
  // 4. SINH HỌC (BIOLOGY)
  // ==========================================
  {
    id: 'bio_neuroscience_dopamine_focus',
    subjectId: 'biology',
    subjectName: 'Sinh học',
    tier: 'highschool',
    tierLabel: 'Cấp 3 (Lớp 10–12)',
    gradeSpan: 'Lớp 11 & Đời sống',
    topic: 'Hệ Thần Kinh, Cơ Chế Dopamine & Cai Nghiện Mạng Xã Hội',
    academicConcept:
      'Chất dẫn truyền thần kinh (Neurotransmitter: Dopamine, Serotonin, Cortisol), thụ thể thần kinh và vòng lặp phần thưởng ngẫu nhiên (Reward Loop).',
    intuitiveExplanation:
      'Dopamine không phải là chất tạo ra hạnh phúc, mà là chất tạo ra "ham muốn và sự săn đón". Thuật toán TikTok/Reels lợi dụng cơ chế giật xèng (nhận thưởng ngẫu nhiên) để khiến não bạn liên tục thèm muốn vuốt thêm video tiếp theo.',
    realWorldProblems: [
      {
        title: 'Cách cai nghiện lướt điện thoại vô thức và lấy lại khả năng tập trung sâu',
        description:
          'Thực hiện "Dopamine Detox" 24h: Giảm kích thích nhanh giá rẻ để các thụ thể Dopamine D2 trong não nhạy cảm trở lại, giúp việc đọc sách và học tập trở nên hứng thú tự nhiên.',
        practicalBenefit: 'Tăng gấp đôi thời lượng tập trung Deep Work, giảm lo âu và stress.',
      },
      {
        title: 'Tối ưu hóa nhịp sinh học giấc ngủ bằng ánh sáng mặt trời',
        description:
          'Nhìn ánh sáng mặt trời 10-15 phút sau khi thức dậy kích hoạt tế bào hạch võng mạc (ipRGCs) thiết lập đồng hồ sinh học, giải phóng Cortisol lành mạnh vào buổi sáng và Melatonin đúng giờ vào ban đêm.',
        practicalBenefit: 'Ngủ sâu giấc, thức dậy tràn đầy năng lượng không cần chuông báo thức.',
      },
    ],
    industryApplications: [
      {
        industry: 'Thiết kế sản phẩm hành vi (Behavioral Product Design)',
        jobTitle: 'Gamification & User Retention Strategist',
        howItIsUsed:
          'Thiết kế cơ chế streak, huy hiệu thưởng trong các app học tập (Duolingo, Đồng Hành) để duy trì động lực tích cực.',
      },
    ],
    miniProject: {
      title: 'Nhật ký theo dõi 3 cơn thèm Dopamine nhanh trong ngày',
      durationMinutes: 15,
      instructions: [
        'Mỗi khi bạn vô thức cầm điện thoại mở Facebook/TikTok, hãy dừng lại 10 giây.',
        'Ghi lại cảm xúc lúc đó: Buồn chán? Trốn tránh bài tập khó? Mệt mỏi?',
        'Thay thế bằng 10 lần hít thở sâu hoặc uống 1 ly nước lọc.',
      ],
      deliverable: 'Kiểm soát lại quyền chỉ huy não bộ của chính bạn.',
    },
    simulatorType: 'dopamine_focus',
  },
  {
    id: 'bio_nutrition_metabolism',
    subjectId: 'biology',
    subjectName: 'Sinh học',
    tier: 'secondary',
    tierLabel: 'Cấp 2 (Lớp 6–9)',
    gradeSpan: 'Lớp 8 & 11',
    topic: 'Dinh Dưỡng, Chuyển Hóa Năng Lượng & Khoa Học Giảm Cân / Tăng Cơ',
    academicConcept:
      'Đồng hóa & Dị hóa, ATP, tỉ lệ 3 nhóm đa lượng (Carbohydrate: 4kcal/g, Protein: 4kcal/g, Lipid: 9kcal/g), chỉ số đường huyết GI.',
    intuitiveExplanation:
      'Cơ thể người là một cỗ máy sinh học tinh vi tuân thủ định luật bảo toàn năng lượng. Muốn giảm mỡ thì Calo nạp vào phải nhỏ hơn Calo tiêu hao (TDEE). Không có loại thuốc giảm cân thần kỳ nào có thể bẻ gãy quy luật này.',
    realWorldProblems: [
      {
        title: 'Giảm mỡ khoa học không bị đói hay suy nhược',
        description:
          'Thay vì nhịn ăn mù quáng gây mất cơ bắp và giảm trao đổi chất BMR, bạn chỉ cần thâm hụt 300-500 kcal/ngày và tăng lượng Protein để giữ cơ.',
        practicalBenefit:
          'Có vóc dáng săn chắc, khỏe mạnh bền vững, không bao giờ bị tăng cân trở lại (hiệu ứng Yo-Yo).',
      },
      {
        title: 'Tránh buồn ngủ gật gù sau bữa trưa (Hiện tượng Food Coma)',
        description:
          'Ăn quá nhiều tinh bột tinh chế (cơm trắng, bún, nước ngọt có GI cao) làm đường huyết tăng vọt, tuyến tụy tiết ồ ạt Insulin kéo đường huyết tụt dốc gây buồn ngủ và mệt mỏi.',
        practicalBenefit: 'Tăng 200% sự tập trung và năng suất học tập/làm việc vào buổi chiều.',
      },
    ],
    industryApplications: [
      {
        industry: 'Dinh dưỡng lâm sàng & Thể thao chuyên nghiệp',
        jobTitle: 'Clinical Dietitian / Sports Nutritionist',
        howItIsUsed:
          'Thiết kế thực đơn cá nhân hóa cho vận động viên Olympic và bệnh nhân tiểu đường, tim mạch.',
      },
      {
        industry: 'Công nghệ thực phẩm tương lai (FoodTech)',
        jobTitle: 'Food Product Development Scientist',
        howItIsUsed:
          'Nghiên cứu thịt thực vật (Beyond Meat) và đồ uống dinh dưỡng cân bằng vi sinh đường ruột.',
      },
    ],
    miniProject: {
      title: 'Thiết lập bảng tính TDEE và Macro cá nhân',
      durationMinutes: 15,
      instructions: [
        'Tính năng lượng tiêu hao cơ bản BMR dựa trên công thức Mifflin-St Jeor (Cân nặng, Chiều cao, Tuổi).',
        'Nhân hệ số hoạt động thể chất để ra TDEE.',
        'Phân bổ tỷ lệ Calo: 40% Carb - 30% Protein - 30% Fat cho mục tiêu sức khỏe.',
      ],
      deliverable: 'Kế hoạch dinh dưỡng cá nhân hóa chính xác theo cơ địa của bạn.',
    },
    simulatorType: 'nutrition',
  },
  {
    id: 'bio_genetics_crispr_medicine',
    subjectId: 'biology',
    subjectName: 'Sinh học',
    tier: 'highschool',
    tierLabel: 'Cấp 3 (Lớp 10–12)',
    gradeSpan: 'Lớp 12',
    topic: 'Di Truyền Phân Tử, Đột Biến Gen & Y Học Cá Nhân Hóa (CRISPR)',
    academicConcept:
      'Mã di truyền, nhân đôi ADN, phiên mã, dịch mã, điều hòa biểu hiện gen và công nghệ chỉnh sửa gen.',
    intuitiveExplanation:
      'Mã ADN giống như mã nguồn phần mềm của sự sống gồm 4 chữ cái A, T, G, X. Bệnh di truyền và ung thư là những dòng code bị lỗi chính tả. Công nghệ sinh học hiện đại đang trở thành trình "soạn thảo code" để sửa lỗi gen trực tiếp.',
    realWorldProblems: [
      {
        title: 'Tầm soát sớm ung thư và bệnh di truyền thế hệ tương lai',
        description:
          'Xét nghiệm giải trình tự gen thế hệ mới (NGS) giúp phát hiện đột biến gen BRCA1/BRCA2 để phòng ngừa ung thư vú/buồng trứng từ sớm.',
        practicalBenefit:
          'Chủ động bảo vệ sức khỏe cả gia đình, phát hiện sớm nguy cơ trước khi bệnh bộc phát.',
      },
      {
        title: 'Hiểu vì sao lạm dụng thuốc kháng sinh tạo ra "Siêu vi khuẩn"',
        description:
          'Uống kháng sinh không đủ liều tạo áp lực chọn lọc tự nhiên, tiêu diệt vi khuẩn yếu và để lại vi khuẩn đột biến kháng thuốc sinh sôi.',
        practicalBenefit: 'Sử dụng thuốc kháng sinh đúng cách, bảo vệ hệ miễn dịch và cộng đồng.',
      },
    ],
    industryApplications: [
      {
        industry: 'Công nghệ sinh học & Dược phẩm sinh học (Moderna, Pfizer)',
        jobTitle: 'Genomics & Bioinformatics Scientist',
        howItIsUsed:
          'Thiết kế vắc-xin mRNA chống virus cúm, Covid-19 và liệu pháp tế bào CAR-T tiêu diệt tế bào ung thư.',
      },
      {
        industry: 'Nông nghiệp công nghệ cao',
        jobTitle: 'Plant Geneticist',
        howItIsUsed:
          'Tạo giống lúa chịu mặn, ngô chống sâu bệnh và cây trồng giàu vitamin thích ứng biến đổi khí hậu.',
      },
    ],
    miniProject: {
      title: 'Tách chiết ADN quả dâu tây bằng xà phòng và cồn',
      durationMinutes: 20,
      instructions: [
        'Nghiền nát 1 quả dâu tây trong túi zip cùng dung dịch nước muối + nước rửa chén (phá màng tế bào).',
        'Lọc dịch qua màng vải.',
        'Rót từ từ cồn 90 độ lạnh vào mép cốc: bạn sẽ thấy các sợi ADN trắng đục kết tủa nổi lên mắt thường nhìn thấy được.',
      ],
      deliverable: 'Chiêm ngưỡng tận mắt sợi ADN của sinh vật sống ngay tại nhà.',
    },
  },

  // ==========================================
  // 5. TIN HỌC & CÔNG NGHỆ (INFORMATICS & TECH)
  // ==========================================
  {
    id: 'info_algorithms_automation_ai',
    subjectId: 'informatics',
    subjectName: 'Tin học & AI',
    tier: 'all',
    tierLabel: 'Mọi cấp học',
    gradeSpan: 'Lớp 6–12',
    topic: 'Tư Duy Thuật Toán, Tự Động Hóa & Kỹ Năng Làm Chủ AI',
    academicConcept:
      'Cấu trúc điều khiển (if-else, loop), độ phức tạp thuật toán O(n), xử lý dữ liệu và mô hình ngôn ngữ lớn (LLM).',
    intuitiveExplanation:
      'Lập trình không phải là gõ code phức tạp, mà là nghệ thuật chia một vấn đề lớn thành các bước nhỏ cực kỳ logic mà máy tính hoặc người khác có thể thực hiện chính xác.',
    realWorldProblems: [
      {
        title: 'Tự động hóa công việc văn phòng lặp đi lặp lại',
        description:
          'Một đoạn mã ngắn 20 dòng Python hoặc Google Apps Script có thể gộp 100 file Excel, trích xuất hóa đơn và gửi email báo cáo trong 5 giây thay vì làm tay mất 3 ngày.',
        practicalBenefit:
          'Giải phóng thời gian làm việc vô bổ, tập trung vào tư duy chiến lược và sáng tạo.',
      },
      {
        title: 'Kỹ năng giao tiếp và ra lệnh cho AI (Prompt Engineering đỉnh cao)',
        description:
          'Hiểu bản chất AI là mô hình dự đoán từ tiếp theo: Cung cấp vai trò (Role), bối cảnh (Context), ràng buộc (Constraints) và ví dụ mẫu (Few-shot) để AI cho kết quả hoàn hảo.',
        practicalBenefit:
          'Tăng gấp 5 lần hiệu suất học tập, viết báo cáo, nghiên cứu và lập trình.',
      },
      {
        title: 'Nhận diện và phòng chống 99% các chiêu trò lừa đảo qua mạng',
        description:
          'Hiểu cơ chế tấn công Phishing, Deepfake video/giọng nói mạo danh, mã độc qua file đính kèm và cách kích hoạt xác thực 2 lớp (2FA).',
        practicalBenefit: 'Bảo vệ tuyệt đối tiền trong tài khoản ngân hàng và dữ liệu cá nhân.',
      },
    ],
    industryApplications: [
      {
        industry: 'Công nghệ phần mềm & Khởi nghiệp Tech',
        jobTitle: 'Software Architect / Product Manager',
        howItIsUsed:
          'Xây dựng các ứng dụng triệu người dùng, tối ưu hóa độ trễ máy chủ và trải nghiệm khách hàng.',
      },
      {
        industry: 'An toàn thông tin & An ninh mạng',
        jobTitle: 'Cybersecurity Analyst',
        howItIsUsed:
          'Bảo vệ hệ thống ngân hàng, lưới điện quốc gia khỏi các cuộc tấn công mạng của hacker.',
      },
    ],
    miniProject: {
      title: 'Tạo Prompt Master cho AI biến mọi bài học khó thành truyện tranh',
      durationMinutes: 15,
      instructions: [
        'Soạn một prompt có đủ 4 thành phần: Role, Task, Format, Constraint.',
        'Yêu cầu AI giải thích một khái niệm khó (như "Lực quán tính") theo phong cách truyện trinh thám Conan.',
        'Đánh giá và tinh chỉnh prompt cho đến khi đạt chất lượng xuất sắc.',
      ],
      deliverable: 'Bộ prompt mẫu lưu vào cẩm nang học tập thông minh.',
    },
  },

  // ==========================================
  // 6. NGỮ VĂN & GIAO TIẾP (LITERATURE & COMMUNICATION)
  // ==========================================
  {
    id: 'lit_persuasion_empathy_critical_thinking',
    subjectId: 'literature',
    subjectName: 'Ngữ văn & Giao tiếp',
    tier: 'all',
    tierLabel: 'Mọi cấp học',
    gradeSpan: 'Lớp 6–12',
    topic: 'Nghệ Thuật Thuyết Phục, Thấu Cảm & Tư Duy Phản Biện',
    academicConcept:
      'Văn nghị luận (Luận điểm, luận cứ, luận chứng), 3 trụ cột hùng biện của Aristotle (Ethos - Uy tín, Pathos - Cảm xúc, Logos - Logic).',
    intuitiveExplanation:
      'Học Văn không phải là học thuộc lòng văn mẫu, mà là rèn luyện năng lực mạnh nhất của con người: Hiểu được cảm xúc của người khác (Thấu cảm) và diễn đạt ý tưởng của mình khiến người khác tin tưởng và đồng hành (Thuyết phục).',
    realWorldProblems: [
      {
        title: 'Viết email công việc, CV xin việc & Thư ngỏ gọi vốn ấn tượng',
        description:
          'Ứng dụng cấu trúc văn nghị luận để viết email ngắn gọn, nêu rõ vấn đề -> giải pháp -> lời kêu gọi hành động (Call to Action) khiến người đọc muốn phản hồi ngay lập tức.',
        practicalBenefit:
          'Tăng 80% cơ hội trúng tuyển phỏng vấn và nhận được sự đồng thuận của đồng nghiệp/đối tác.',
      },
      {
        title: 'Đàm phán tăng lương và thuyết phục phụ huynh/thầy cô',
        description:
          'Kết hợp cả 3 yếu tố: Dẫn chứng số liệu cụ thể (Logos), chứng minh năng lực đóng góp (Ethos) và chia sẻ chân thành mục tiêu tương lai (Pathos).',
        practicalBenefit: 'Đạt được mong muốn mà không gây xung đột, giữ gìn mối quan hệ tốt đẹp.',
      },
      {
        title: 'Tư duy phản biện trước tin giả và luận điệu ngụy biện',
        description:
          'Nhận diện các lỗi ngụy biện phổ biến: Công kích cá nhân (Ad Hominem), bù nhìn rơm (Strawman), khái quát hóa vội vã.',
        practicalBenefit:
          'Không bao giờ bị thao túng tâm lý trên mạng xã hội và trong các cuộc tranh luận.',
      },
    ],
    industryApplications: [
      {
        industry: 'Marketing, Quảng cáo & Sáng tạo nội dung',
        jobTitle: 'Creative Director / Copywriter',
        howItIsUsed:
          'Sáng tạo các chiến dịch truyền thông chạm đến trái tim hàng triệu khách hàng (Storytelling).',
      },
      {
        industry: 'Quan hệ công chúng & Quản trị khủng hoảng',
        jobTitle: 'PR & Communications Director',
        howItIsUsed:
          'Soạn thảo thông cáo báo chí, xử lý khủng hoảng truyền thông bảo vệ danh tiếng tập đoàn.',
      },
    ],
    miniProject: {
      title: 'Viết một lá thư thuyết phục 1 trang A4 theo cấu trúc 3 trụ cột',
      durationMinutes: 20,
      instructions: [
        'Chọn 1 đề tài bạn muốn đề xuất (vd: Xin lập câu lạc bộ mới ở trường, xin tài trợ, xin tăng lương).',
        'Viết đoạn 1: Thiết lập uy tín và bối cảnh (Ethos).',
        'Viết đoạn 2: Nêu 3 luận cứ logic có số liệu kiểm chứng (Logos).',
        'Viết đoạn 3: Khơi gợi tầm nhìn và cảm xúc đồng hành (Pathos).',
      ],
      deliverable: 'Một lá thư thuyết phục có tỷ lệ thành công trên 90%.',
    },
  },

  // ==========================================
  // 7. KINH TẾ & PHÁP LUẬT (ECONOMICS & LAW)
  // ==========================================
  {
    id: 'law_contracts_labor_consumer_rights',
    subjectId: 'economics_law',
    subjectName: 'Kinh tế & Pháp luật',
    tier: 'highschool',
    tierLabel: 'Cấp 3 (Lớp 10–12)',
    gradeSpan: 'Lớp 10–12',
    topic: 'Hợp Đồng Lao Động, Luật Người Tiêu Dùng & Cơ Chế Thị Trường',
    academicConcept:
      'Quy luật Cung - Cầu, Lạm phát, Hợp đồng dân sự, Quyền và nghĩa vụ trong Luật Lao động & Luật Doanh nghiệp.',
    intuitiveExplanation:
      'Pháp luật là "luật chơi" của xã hội, kinh tế học là "cách tính điểm". Hiểu luật giúp bạn không bị bóc lột, hiểu kinh tế giúp bạn biết dòng tiền đang chảy về đâu để đón đầu cơ hội.',
    realWorldProblems: [
      {
        title: 'Những điều khoản "tử huyệt" cần soi kỹ trước khi ký Hợp đồng lao động',
        description:
          'Kiểm tra kỹ thời gian thử việc, mức đóng BHXH thật hay lách luật, điều khoản bồi thường đào tạo và cam kết không làm việc cho đối thủ (Non-compete).',
        practicalBenefit: 'Bảo vệ quyền lợi lương thưởng, chế độ thai sản/thất nghiệp khi đi làm.',
      },
      {
        title: 'Đòi lại tiền khi mua phải hàng giả, hàng lỗi (Quyền người tiêu dùng)',
        description:
          'Biết cách sử dụng hóa đơn, biên bản bàn giao và điều khoản bảo hành bắt buộc theo luật để yêu cầu đổi trả hoặc khiếu nại lên Hội Bảo vệ Người Tiêu Dùng.',
        practicalBenefit:
          'Không chịu thiệt thòi tiền bạc khi giao dịch mua bán online hay offline.',
      },
      {
        title: 'Hiểu nguyên nhân giá xăng dầu, thịt heo và bất động sản biến động',
        description:
          'Phân tích chuỗi cung ứng, chi phí đẩy và lạm phát tiền tệ để có kế hoạch chi tiêu gia đình hợp lý trong thời kỳ lạm phát.',
        practicalBenefit: 'Bảo vệ tài sản gia đình khỏi bị bốc hơi do mất giá đồng tiền.',
      },
    ],
    industryApplications: [
      {
        industry: 'Pháp chế doanh nghiệp & Luật sư',
        jobTitle: 'Corporate Legal Counsel',
        howItIsUsed:
          'Rà soát hợp đồng M&A, giải quyết tranh chấp thương mại quốc tế và bảo hộ nhãn hiệu.',
      },
      {
        industry: 'Khởi nghiệp & Quản trị kinh doanh',
        jobTitle: 'Startup Founder / CEO',
        howItIsUsed:
          'Xây dựng cơ cấu vốn góp, điều lệ công ty và chính sách thưởng cổ phần (ESOP) cho nhân sự.',
      },
    ],
    miniProject: {
      title: 'Soạn thảo một biên bản thỏa thuận hợp tác phân chia công bằng',
      durationMinutes: 20,
      instructions: [
        'Tạo một bản thỏa thuận hợp tác làm đồ án/dự án nhóm.',
        'Quy định rõ: Trách nhiệm từng người, Deadline, Tiêu chí hoàn thành.',
        'Quy định điều khoản xử phạt nếu vi phạm cam kết.',
      ],
      deliverable: 'Một bản cam kết chuẩn mực giúp nhóm làm việc không bao giờ cãi vã.',
    },
  },

  // ==========================================
  // 8. ĐỊA LÝ & LỊCH SỬ (HISTORY & GEOGRAPHY)
  // ==========================================
  {
    id: 'geo_climate_urban_logistics',
    subjectId: 'history_geography',
    subjectName: 'Địa lý & Lịch sử',
    tier: 'secondary',
    tierLabel: 'Cấp 2 (Lớp 6–9)',
    gradeSpan: 'Lớp 8–12',
    topic: 'Khí Hậu, Hướng Gió, Địa Hình & Lựa Chọn Bất Động Sản / Nhà Ở',
    academicConcept:
      'Chế độ gió mùa (Gió mùa Đông Bắc, Tây Nam), địa hình đón gió và khuất gió, hiện tượng đảo nhiệt đô thị (Urban Heat Island).',
    intuitiveExplanation:
      'Địa lý là bản đồ cơ hội và thách thức của môi trường sống. Người hiểu địa lý sẽ biết chọn hướng nhà mùa đông ấm mùa hè mát, biết vùng nào không bị ngập úng khi mua nhà và hiểu vì sao các cảng nước sâu luôn là trung tâm kinh tế của thế giới.',
    realWorldProblems: [
      {
        title: 'Cách chọn hướng nhà/ban công chung cư mát mẻ, tiết kiệm tiền điện',
        description:
          'Tại Việt Nam, hướng Nam và Đông Nam đón gió mát mùa hè và tránh gió mùa Đông Bắc lạnh giá; tránh hướng chính Tây bị nắng chiếu gay gắt suốt buổi chiều.',
        practicalBenefit: 'Giảm 30% tiền điện điều hòa, không gian sống dễ chịu quanh năm.',
      },
      {
        title: 'Nhận diện vùng trũng ngập lụt đô thị trước khi mua nhà hoặc thuê trọ',
        description:
          'Dựa vào cốt cao độ địa hình và hệ thống thủy văn sông ngòi để tránh những cung đường rốn ngập khi mưa lớn kết hợp triều cường.',
        practicalBenefit: 'Tránh ngập nước hỏng xe máy, hư hỏng đồ đạc gia đình.',
      },
    ],
    industryApplications: [
      {
        industry: 'Quy hoạch đô thị & Bất động sản',
        jobTitle: 'Urban Planner / Real Estate Analyst',
        howItIsUsed:
          'Quy hoạch hệ thống thoát nước mưa, vành đai cây xanh giảm nhiệt cho các đại đô thị thông minh.',
      },
      {
        industry: 'Logistics & Vận tải biển quốc tế',
        jobTitle: 'Maritime Operations Director',
        howItIsUsed:
          'Lập hải trình tối ưu theo dòng hải lưu và mùa bão để tiết kiệm hàng vạn tấn nhiên liệu cho tàu container.',
      },
    ],
    miniProject: {
      title: 'Vẽ bản đồ hướng nắng và hướng gió cho căn phòng của bạn',
      durationMinutes: 15,
      instructions: [
        'Dùng ứng dụng La bàn trên điện thoại xác định hướng của các cửa sổ trong phòng.',
        'Đánh dấu hướng mặt trời chiếu vào buổi sáng (Đông) và buổi chiều (Tây).',
        'Sắp xếp lại bàn học tránh ánh nắng gắt trực tiếp và đón gió thông thoáng.',
      ],
      deliverable: 'Không gian học tập thoáng mát, đủ ánh sáng tự nhiên.',
    },
  },

  // ==========================================
  // 9. TIỂU HỌC CẤP 1 (ELEMENTARY FOUNDATION)
  // ==========================================
  {
    id: 'elementary_math_life_budget',
    subjectId: 'mathematics',
    subjectName: 'Toán học Tiểu học',
    tier: 'elementary',
    tierLabel: 'Cấp 1 (Lớp 1–5)',
    gradeSpan: 'Lớp 3–5',
    topic: 'Bốn Phép Tính, Phân Số, Tỉ Lệ & Bài Toán Đi Chợ Siêu Thị',
    academicConcept:
      'Cộng trừ nhân chia số tự nhiên, phân số, tỉ lệ phần trăm, đơn vị đo lường (kg, lít, mét, VNĐ).',
    intuitiveExplanation:
      'Toán học tiểu học là ngôn ngữ đếm và cân đo của thế giới. Mọi thứ bạn ăn, mặc, mua sắm và chia sẻ với bạn bè đều bắt đầu từ đây.',
    realWorldProblems: [
      {
        title: 'So sánh giá hàng hóa để mua tiết kiệm nhất ở siêu thị',
        description:
          'Chai dầu ăn 1 lít giá 45.000đ và can 5 lít giá 210.000đ, loại nào rẻ hơn trên mỗi lít? Đơn giá = Tổng tiền / Thể tích.',
        practicalBenefit: 'Giúp cha mẹ tiết kiệm 10-20% chi phí mua sắm hàng tháng.',
      },
      {
        title: 'Chia sẻ công bằng không cãi cọ (Phân số đời thực)',
        description:
          'Một chiếc pizza 8 miếng chia cho 3 người thế nào? Mỗi người 2 miếng và 2 miếng còn lại chia tiếp như thế nào?',
        practicalBenefit: 'Hình thành tư duy công bằng và giải quyết mâu thuẫn từ bé.',
      },
    ],
    industryApplications: [
      {
        industry: 'Bán lẻ & Kinh doanh hộ gia đình',
        jobTitle: 'Quản lý cửa hàng / Chủ tiệm tạp hóa',
        howItIsUsed: 'Tính giá vốn, tiền thối lại cho khách và kiểm kê hàng hóa tồn kho mỗi ngày.',
      },
    ],
    miniProject: {
      title: 'Thử thách "Nhà quản lý tài chính nhí 100.000đ"',
      durationMinutes: 30,
      instructions: [
        'Cầm 100.000đ đi chợ cùng cha mẹ.',
        'Lên danh sách mua đủ: Rau, Thịt/Trứng, Trái cây cho 1 bữa cơm gia đình.',
        'Tính nhẩm tổng tiền trước khi ra quầy thanh toán.',
      ],
      deliverable: 'Một bữa ăn ngon đầy đủ dinh dưỡng trong đúng ngân sách 100k.',
    },
  },
]
