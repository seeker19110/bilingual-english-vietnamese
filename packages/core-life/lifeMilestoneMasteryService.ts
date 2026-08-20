// packages/core-life/lifeMilestoneMasteryService.ts — Domain Service Quản trị Cột mốc Cuộc đời, Động lực Bền vững & Bộ lọc Tuân thủ Tối thượng.
// Tuân thủ 2 Quy ước Tối thượng: TUÂN THỦ PHÁP LUẬT và YÊU THƯƠNG CON NGƯỜI.

import { randomUUID } from 'node:crypto'
import {
  LIFE_MILESTONE_MASTERY_SCHEMA_VERSION,
  type LifeStageType,
  type CapitalCategory,
  type LifeStageProfile,
  type FiveCapitalsAssessment,
  FiveCapitalsAssessmentSchema,
  type SupremePrincipleCompliance,
  SupremePrincipleComplianceSchema,
  type DailyLifeOSRoutine,
  DailyLifeOSRoutineSchema,
  type MotivationDiagnostic,
  MotivationDiagnosticSchema,
  type MicroEvidenceLog,
  MicroEvidenceLogSchema,
} from '../core-contracts/lifeMilestoneMastery.js'
import { vnDateStr } from '../core-db/date.js'

// 1. Kho Dữ Liệu Chuẩn Mực 8 Giai Đoạn Cuộc Đời
const LIFE_STAGE_PROFILES: Record<LifeStageType, LifeStageProfile> = {
  early_childhood_primary: {
    stage: 'early_childhood_primary',
    ageRange: '6 – 10 tuổi (Cấp 1)',
    vietnameseTitle: 'Tiểu học: Gieo mầm Tự lập & Nuôi dưỡng Tò mò Tự nhiên',
    developmentalCore:
      'Sự siêng năng vs Tự ti (Erikson: Industry vs Inferiority) — Kỷ luật sinh hoạt và EQ nền tảng',
    benchmarks: [
      {
        id: 'ec-indep-1',
        title: 'Tự lập sinh hoạt cá nhân',
        category: 'physical',
        tier: 'baseline',
        description:
          'Tự vệ sinh, tự gấp quần áo, dọn góc học tập, ăn uống khoa học không phụ thuộc màn hình',
        measurableMetric: '100% tự giác hoàn thành việc nhà cơ bản hàng ngày',
      },
      {
        id: 'ec-lang-2',
        title: 'Tiếng Việt trôi chảy & Phản xạ tiếng Anh tự nhiên',
        category: 'human',
        tier: 'baseline',
        description:
          'Đọc sách truyện tiếng Việt phong phú; phản xạ nghe - nói tiếng Anh tự nhiên (A1–A2)',
        measurableMetric: 'Đọc 30+ trang/tuần; hiểu hội thoại tiếng Anh thiếu nhi',
      },
      {
        id: 'ec-logic-3',
        title: 'Tư duy logic sơ cấp & Bơi lội an toàn',
        category: 'human',
        tier: 'baseline',
        description:
          'Toán học trực quan, giải đố logic (cờ vua/ghép hình) và biết bơi chống đuối nước',
        measurableMetric: 'Biết bơi liên tục 50m; giải toán tư duy cấp 1',
      },
      {
        id: 'ec-beyond-books',
        title: 'Đọc 50 – 100 cuốn sách/năm & Tư duy phản biện',
        category: 'human',
        tier: 'beyond_excellence',
        description: 'Đọc đa dạng khoa học, lịch sử, văn học; đặt 5 câu hỏi "Tại sao?" mỗi ngày',
        measurableMetric: 'Đọc >= 50 cuốn sách/năm và ghi chép cảm nhận ngắn',
      },
      {
        id: 'ec-beyond-art',
        title: 'Năng khiếu thể thao hoặc nghệ thuật bền bỉ',
        category: 'physical',
        tier: 'beyond_excellence',
        description: 'Chơi thành thạo một nhạc cụ hoặc môn thể thao đối kháng để rèn ý chí',
        measurableMetric: 'Tập luyện đều đặn >= 3 buổi/tuần trong 1 năm',
      },
    ],
    deathTraps: [
      {
        trapName: 'Nghiện thiết bị số & Màn hình thụ động',
        riskDescription:
          'Trẻ tiếp xúc quá sớm với video ngắn (TikTok, YouTube Shorts), game mất kiểm soát',
        consequence: 'Suy giảm khả năng tập trung sâu, thụ động, giảm giao tiếp xã hội',
        antidoteStrategy:
          'Giới hạn thời gian màn hình < 60p/ngày; cha mẹ đồng hành đọc sách và chơi thể thao',
      },
      {
        trapName: 'Bao bọc quá mức (Helicopter Parenting)',
        riskDescription: 'Cha mẹ làm hộ mọi việc từ nhỏ, không cho con tự giải quyết vấn đề',
        consequence: 'Trẻ ỷ lại, tự ti khi gặp khó khăn, thiếu bản lĩnh tự lập',
        antidoteStrategy:
          'Giao việc nhà có trách nhiệm, khen ngợi sự nỗ lực thay vì khen thông minh bẩm sinh',
      },
    ],
  },

  lower_secondary: {
    stage: 'lower_secondary',
    ageRange: '11 – 14 tuổi (Cấp 2)',
    vietnameseTitle: 'THCS: Phương pháp Tự học & Kỷ luật Số',
    developmentalCore:
      'Khủng hoảng bản sắc sơ khai — Làm chủ phương pháp tự học và công nghệ an toàn',
    benchmarks: [
      {
        id: 'ls-self-learn',
        title: 'Phương pháp tự học có hệ thống',
        category: 'human',
        tier: 'baseline',
        description:
          'Tự lập thời gian biểu, ghi chú Cornell, sơ đồ tư duy không cần cha mẹ nhắc nhở',
        measurableMetric: 'Duy trì kết quả học tập Top 15% lớp; tự giác học mỗi tối',
      },
      {
        id: 'ls-lang-b1',
        title: 'Ngoại ngữ đạt chuẩn B1 – B2 (IELTS 5.5 – 6.5)',
        category: 'human',
        tier: 'baseline',
        description: 'Nghe hiểu tin tức quốc tế cơ bản, thuyết trình tiếng Anh 5 phút tự tin',
        measurableMetric: 'Chứng chỉ CEFR B1/B2 hoặc tương đương IELTS 5.5+',
      },
      {
        id: 'ls-tech-fq',
        title: 'Kỹ năng số & Tài chính vỡ lòng',
        category: 'financial',
        tier: 'baseline',
        description:
          'Gõ phím 10 ngón 40+ WPM; hiểu ranh giới Cần (Needs) vs Muốn (Wants); có heo đất tiết kiệm',
        measurableMetric: 'Tốc độ gõ >= 40 WPM; duy trì thói quen ghi chép chi tiêu tiền túi',
      },
      {
        id: 'ls-beyond-top',
        title: 'Đỗ trường Chuyên / Top đầu & Tranh biện',
        category: 'human',
        tier: 'beyond_excellence',
        description:
          'Đỗ vào THPT Chuyên hoặc trường Top đầu; tham gia CLB tranh biện (Debate/STEM)',
        measurableMetric: 'Đạt giải thưởng học thuật cấp trường/huyện hoặc giải STEM',
      },
      {
        id: 'ls-beyond-prod',
        title: 'Tạo sản phẩm số cá nhân đầu tay',
        category: 'human',
        tier: 'beyond_excellence',
        description: 'Viết blog, làm video giáo dục hoặc lập trình mini-game/app nhỏ',
        measurableMetric: 'Hoàn thành và xuất bản 1 dự án số hoàn chỉnh',
      },
    ],
    deathTraps: [
      {
        trapName: 'Bạo lực học đường & Áp lực đồng trang lứa',
        riskDescription: 'Bị tẩy chay hoặc bắt nạt trực tuyến, đua đòi theo thói hư tật xấu',
        consequence: 'Tổn thương tâm lý kéo dài, sa sút học tập, tự cô lập',
        antidoteStrategy:
          'Gia đình duy trì đối thoại cởi mở mỗi tối; dạy kỹ năng tự vệ và chọn bạn tốt',
      },
      {
        trapName: 'Thức khuya chơi game làm lùn chiều cao',
        riskDescription: 'Thức sau 23h làm gián đoạn hormone tăng trưởng (GH)',
        consequence: 'Bỏ lỡ cửa sổ vàng phát triển thể chất và chiều cao tối đa',
        antidoteStrategy: 'Quy ước gia đình: Ngắt Wi-Fi sau 22h, ngủ đủ 8h, chơi thể thao bật nhảy',
      },
    ],
  },

  upper_secondary: {
    stage: 'upper_secondary',
    ageRange: '15 – 18 tuổi (Cấp 3 / Tuổi 16–17)',
    vietnameseTitle: 'THPT: Bệ phóng Học thuật, Định vị Nghề nghiệp & Bản lĩnh Tình cảm',
    developmentalCore:
      'Định vị bản sắc cá nhân (Identity vs Role Confusion) — Khát vọng, ranh giới và chuẩn bị đại học',
    benchmarks: [
      {
        id: 'us-ielts-sat',
        title: 'IELTS 7.0 – 8.0 / SAT 1400+ & Đỗ Đại học mơ ước',
        category: 'human',
        tier: 'baseline',
        description:
          'Làm chủ ngoại ngữ học thuật, thi đỗ trường Đại học đúng nguyện vọng và năng lực',
        measurableMetric: 'IELTS >= 7.0 hoặc giải HSG/SAT >= 1350; trúng tuyển Đại học mục tiêu',
      },
      {
        id: 'us-ikigai',
        title: 'Định hướng sự nghiệp sớm theo Ikigai',
        category: 'human',
        tier: 'baseline',
        description:
          'Xác định rõ điểm mạnh, sở thích, nhu cầu thị trường; không chạy theo trào lưu mù quáng',
        measurableMetric: 'Bản đồ định hướng 4 câu hỏi Ikigai rõ ràng và thực tế',
      },
      {
        id: 'us-love-boundaries',
        title: 'Tình cảm trong sáng & Ranh giới an toàn cá nhân',
        category: 'social',
        tier: 'baseline',
        description:
          'Tình yêu học trò lành mạnh, cùng nhau tiến bộ; hiểu rõ sự đồng thuận, an toàn giới tính',
        measurableMetric: 'Biết nói "Không" trước cám dỗ; không để cảm xúc phá vỡ mục tiêu học tập',
      },
      {
        id: 'us-beyond-income',
        title: 'Tự lập tài chính sớm trước 18 tuổi',
        category: 'financial',
        tier: 'beyond_excellence',
        description:
          'Kiếm được thu nhập chân chính đầu tiên qua gia sư, dịch thuật, thiết kế, freelance',
        measurableMetric:
          'Tự chi trả một phần chi phí cá nhân hoặc mua thiết bị học tập bằng tiền tự kiếm',
      },
      {
        id: 'us-beyond-scholarship',
        title: 'Học bổng Đại học & Hồ sơ Hoạt động Lãnh đạo',
        category: 'human',
        tier: 'beyond_excellence',
        description: 'Sở hữu Portfolio dự án xã hội / CLB nổi bật, giành học bổng tài trợ',
        measurableMetric: 'Học bổng bán phần/toàn phần hoặc vai trò Trưởng ban dự án ngoại khóa',
      },
    ],
    deathTraps: [
      {
        trapName: 'Chọn sai ngành do nghe theo trào lưu',
        riskDescription: 'Chọn ngành theo đám đông mà không hiểu bản thân và nhu cầu thị trường',
        consequence: 'Chán nản, bỏ học giữa chừng hoặc lãng phí 4 năm đại học',
        antidoteStrategy:
          'Tìm kiếm Mentor trong ngành, phỏng vấn thực tế người đang đi làm trước khi đăng ký',
      },
      {
        trapName: 'Yêu đương mù quáng & Quan hệ tình dục không an toàn',
        riskDescription:
          'Thiếu kiến thức giới tính dẫn đến hậu quả mang thai ngoài ý muốn hoặc sốc tâm lý',
        consequence: 'Gián đoạn tương lai học vấn, gánh nặng tâm lý nặng nề',
        antidoteStrategy:
          'Giáo dục giới tính khoa học, thiết lập ranh giới rõ ràng, tôn trọng giá trị bản thân',
      },
    ],
  },

  university_launchpad: {
    stage: 'university_launchpad',
    ageRange: '18 – 23 tuổi (Đại học & Khởi đầu Sự nghiệp)',
    vietnameseTitle: 'Đại học: Thực chiến Chuyên môn & Độc lập Toàn diện',
    developmentalCore:
      'Sự thân mật & Độc lập (Intimacy vs Isolation) — Biến tri thức thành giá trị thị trường',
    benchmarks: [
      {
        id: 'ul-internship',
        title: 'Tốt nghiệp Giỏi & 2+ Kỳ Thực Tập Doanh Nghiệp',
        category: 'human',
        tier: 'baseline',
        description:
          'Tốt nghiệp loại Giỏi; hoàn thành ít nhất 2 kỳ thực tập thực chiến tại công ty uy tín',
        measurableMetric: 'GPA >= 3.2/4.0; thư giới thiệu xuất sắc từ cấp trên thực tập',
      },
      {
        id: 'ul-fin-indep',
        title: 'Độc lập tài chính & Quỹ khẩn cấp 3–6 tháng',
        category: 'financial',
        tier: 'baseline',
        description: 'Tự chi trả 100% sinh hoạt phí sau tốt nghiệp; sạch nợ xấu; có quỹ dự phòng',
        measurableMetric: 'Quỹ khẩn cấp tích lũy >= 3 tháng chi phí tối thiểu',
      },
      {
        id: 'ul-health-habit',
        title: 'Phong cách sống & Thể chất đỉnh cao',
        category: 'physical',
        tier: 'baseline',
        description:
          'Duy trì thói quen tập gym/chạy bộ đều đặn, không nghiện chất kích thích/mạng xã hội',
        measurableMetric: 'Chạy bộ 10km hoặc tập thể lực 3 buổi/tuần; BMI chuẩn 19-23',
      },
      {
        id: 'ul-beyond-performer',
        title: 'Top Performer & Lương Khởi điểm Vượt trội',
        category: 'human',
        tier: 'beyond_excellence',
        description:
          'Được nhận làm nhân viên chính thức ngay từ khi thực tập với mức đãi ngộ Top 10%',
        measurableMetric: 'Mức lương khởi điểm vượt 50% mặt bằng chung ngành',
      },
      {
        id: 'ul-beyond-invest',
        title: 'Bắt đầu Tích sản Dài hạn (Lãi kép từ tuổi 20)',
        category: 'financial',
        tier: 'beyond_excellence',
        description:
          'Trích đều đặn 20% thu nhập hàng tháng đầu tư vào quỹ chỉ số (Index Fund) hoặc vàng',
        measurableMetric: 'Danh mục tích sản liên tục tăng trưởng 12 tháng không gián đoạn',
      },
    ],
    deathTraps: [
      {
        trapName: 'Nợ tiêu dùng tín dụng đen & Bẫy làm giàu nhanh/Cờ bạc mạng',
        riskDescription: 'Vướng vào app vay nợ, tiền ảo đa cấp, tài xỉu, cá độ bóng đá',
        consequence: 'Mất danh dự, hủy hoại tương lai tài chính, khủng hoảng gia đình',
        antidoteStrategy:
          'Quy tắc vàng: Tuyệt đối không chạm vào cờ bạc; chỉ đầu tư vào thứ mình hiểu rõ và đúng pháp luật',
      },
      {
        trapName: 'Ảo tưởng bằng cấp & Lười thực chiến',
        riskDescription:
          'Chỉ học vẹt trên trường, thiếu kỹ năng mềm và khả năng giải quyết vấn đề thực tế',
        consequence: 'Thất nghiệp hoặc làm trái ngành lương thấp khi ra trường',
        antidoteStrategy:
          'Đi làm thêm/thực tập từ năm 2; ứng dụng công cụ AI nâng cao năng suất thực chiến',
      },
    ],
  },

  young_professional: {
    stage: 'young_professional',
    ageRange: '24 – 28 tuổi (Đi làm & Xây dựng Tình yêu)',
    vietnameseTitle: 'Trưởng thành: Vững Chuyên môn, An toàn Tài chính & Tình yêu Chín muồi',
    developmentalCore: 'Khẳng định giá trị nghề nghiệp và tìm kiếm bạn đời đồng điệu giá trị sống',
    benchmarks: [
      {
        id: 'yp-senior-lead',
        title: 'Cấp bậc Senior / Team Lead / Kinh doanh dòng tiền dương',
        category: 'human',
        tier: 'baseline',
        description:
          'Thăng tiến lên vị trí chuyên gia nòng cốt; thu nhập tăng x2–x3 so với khởi điểm',
        measurableMetric: 'Đảm nhận vai trò phụ trách dự án hoặc quản lý nhóm 3-5 người',
      },
      {
        id: 'yp-love-commit',
        title: 'Tình yêu chín muồi & Cam kết hôn nhân',
        category: 'social',
        tier: 'baseline',
        description:
          'Mối quan hệ đôi lứa thấu cảm, cùng thống nhất kế hoạch tài chính và gia đình tương lai',
        measurableMetric:
          'Đồng thuận về 4 yếu tố: Giá trị sống, Quản lý tiền bạc, Con cái, Gia đình hai bên',
      },
      {
        id: 'yp-fin-security',
        title: 'An toàn Tài chính Cấp 1 & Phụng dưỡng cha mẹ',
        category: 'financial',
        tier: 'baseline',
        description: 'Sở hữu danh mục tích sản; bảo hiểm sức khỏe đầy đủ; báo hiếu cha mẹ đều đặn',
        measurableMetric: 'Có bảo hiểm sức khỏe trụ cột; gửi quà phụng dưỡng cha mẹ định kỳ',
      },
      {
        id: 'yp-beyond-multi-income',
        title: '2 – 3 Nguồn Thu Nhập & Vốn Mua Nhà Đầu Tiên',
        category: 'financial',
        tier: 'beyond_excellence',
        description:
          'Đa dạng hóa thu nhập từ chuyên môn và đầu tư; tích lũy đủ 40-50% giá trị căn hộ đầu tiên',
        measurableMetric: 'Tài sản ròng đạt mốc 500M - 1B VNĐ hoàn toàn trong sạch',
      },
      {
        id: 'yp-beyond-influence',
        title: 'Đóng góp dự án quy mô lớn & Mạng lưới cố vấn',
        category: 'human',
        tier: 'beyond_excellence',
        description:
          'Có mối quan hệ thân tình với các bậc tiền bối/chuyên gia hàng đầu trong ngành',
        measurableMetric: 'Xây dựng mạng lưới cố vấn chất lượng cao (3+ Mentors uy tín)',
      },
    ],
    deathTraps: [
      {
        trapName: 'Cưới vội sai người do áp lực tuổi tác',
        riskDescription:
          'Kết hôn khi chưa hiểu rõ bản chất, quan điểm tiền bạc và lối sống của nhau',
        consequence: 'Xung đột triền miên, ly hôn sớm, tổn thương tâm lý',
        antidoteStrategy:
          'Tìm hiểu kỹ ít nhất 1-2 năm; thẳng thắn đối thoại tiền hôn nhân về tài chính và con cái',
      },
      {
        trapName: 'FOMO đầu tư rủi ro cao & Đòn bẩy tài chính quá mức',
        riskDescription: 'Vay nợ quá đà để lướt sóng đất/chứng khoán liều lĩnh',
        consequence: 'Cháy tài khoản, mất sạch số tiền tích lũy của tuổi trẻ',
        antidoteStrategy:
          'Tuân thủ kỷ luật phân bổ tài sản 50/20/30; chỉ dùng tiền nhàn rỗi để đầu tư dài hạn',
      },
    ],
  },

  family_builder: {
    stage: 'family_builder',
    ageRange: '28 – 38 tuổi (Hôn nhân, Gia đình & Nuôi dạy Con)',
    vietnameseTitle: 'Tổ ấm: Hôn nhân Hạnh phúc, Nuôi dạy Con Thông thái & Độc lập Tài chính',
    developmentalCore:
      'Sinh tạo & Nuôi dưỡng thế hệ sau (Generativity vs Stagnation) — Trụ cột vững chãi',
    benchmarks: [
      {
        id: 'fb-marriage-harmony',
        title: 'Hôn nhân Hòa hợp & Giao tiếp Thấu cảm',
        category: 'social',
        tier: 'baseline',
        description:
          'Giao tiếp bất bạo động, chia sẻ việc nhà và áp lực; vượt qua khủng hoảng hôn nhân 3-7 năm',
        measurableMetric: 'Dành ít nhất 1 buổi hẹn hò riêng (Date Night) mỗi tuần cùng bạn đời',
      },
      {
        id: 'fb-wise-parenting',
        title: 'Nuôi dạy con khoa học & An toàn tâm lý',
        category: 'moral_legacy',
        tier: 'baseline',
        description:
          'Áp dụng thai giáo, giáo dục sớm, rèn con tự lập, đọc sách và song ngữ từ 0-6 tuổi',
        measurableMetric:
          'Không dùng đòn roi/bạo lực lời nói; đồng hành chơi cùng con >= 30p mỗi ngày',
      },
      {
        id: 'fb-home-education-fund',
        title: 'Sở hữu nhà ở & Quỹ Giáo dục Tương lai cho con',
        category: 'financial',
        tier: 'baseline',
        description:
          'An cư lạc nghiệp; thiết lập quỹ giáo dục riêng đảm bảo việc học hành của con đến Đại học',
        measurableMetric: 'Sở hữu nhà ở ổn định; quỹ học vấn của con đạt ít nhất 3 năm chi phí học',
      },
      {
        id: 'fb-beyond-fire2',
        title: 'Độc lập Tài chính Cấp 2 (FIRE)',
        category: 'financial',
        tier: 'beyond_excellence',
        description:
          'Dòng tiền thụ động từ tích sản chi trả được 100% mức sống cơ bản của cả gia đình',
        measurableMetric: 'Tài sản sinh lời thụ động >= 25x chi phí sinh hoạt năm của gia đình',
      },
      {
        id: 'fb-beyond-child-talent',
        title: 'Đồng hành phát triển tài năng sớm cho con',
        category: 'moral_legacy',
        tier: 'beyond_excellence',
        description:
          'Phát hiện và bồi dưỡng năng khiếu đặc biệt của con với tinh thần tôn trọng cá tính riêng',
        measurableMetric:
          'Con phát triển vượt trội cả EQ, ngôn ngữ và thể chất trong môi trường yêu thương',
      },
    ],
    deathTraps: [
      {
        trapName: 'Mất kết nối vợ chồng sau khi có con & Ngoại tình',
        riskDescription:
          'Dành 100% thời gian cho con cái/công việc, bỏ bê cảm xúc của người bạn đời',
        consequence: 'Gia đình rạn nứt, lạnh nhạt, nguy cơ tan vỡ hôn nhân',
        antidoteStrategy:
          'Ưu tiên mối quan hệ vợ chồng là số 1 (sau đó mới tới con); duy trì giao tiếp sâu lắng',
      },
      {
        trapName: 'Gánh nặng nợ vay mua nhà vượt quá 50% thu nhập',
        riskDescription: 'Cố mua nhà vượt quá khả năng chi trả, đòn bẩy ngân hàng quá lớn',
        consequence: 'Căng thẳng tài chính triền miên, mất ngủ, ảnh hưởng hòa khí gia đình',
        antidoteStrategy:
          'Tổng nghĩa vụ trả nợ ngân hàng không bao giờ vượt quá 35-40% thu nhập ổn định',
      },
    ],
  },

  prime_leader: {
    stage: 'prime_leader',
    ageRange: '38 – 50 tuổi (Đỉnh cao Sự nghiệp & Di sản)',
    vietnameseTitle: 'Đỉnh cao: Vị thế Xã hội, Cố vấn Thế hệ & Phụng dưỡng Chu toàn',
    developmentalCore:
      'Khẳng định vị thế và tạo ra tác động xã hội lớn; làm chỗ dựa vững chắc cho cả dòng họ',
    benchmarks: [
      {
        id: 'pl-executive-status',
        title: 'Lãnh đạo Cấp cao / Chuyên gia Đầu ngành / Chủ Doanh nghiệp',
        category: 'human',
        tier: 'baseline',
        description:
          'Tạo công ăn việc làm cho xã hội, đóng góp giá trị lớn cho ngành nghề và đất nước',
        measurableMetric: 'Quản lý tổ chức/doanh nghiệp phát triển bền vững và tạo giá trị thực tế',
      },
      {
        id: 'pl-mentor-teen',
        title: 'Làm Người Cố Vấn (Mentor) cho con tuổi dậy thì',
        category: 'social',
        tier: 'baseline',
        description:
          'Thấu hiểu tâm lý tuổi nổi loạn của con, định hướng con vào Đại học hàng đầu/du học an toàn',
        measurableMetric:
          'Con cái tin tưởng chia sẻ mọi khó khăn; tự tin bước vào ngưỡng cửa đại học',
      },
      {
        id: 'pl-filial-piety',
        title: 'Chăm sóc y tế tối ưu cho cha mẹ già tròn chữ Hiếu',
        category: 'moral_legacy',
        tier: 'baseline',
        description:
          'Đảm bảo điều kiện y tế, điều dưỡng và phụng dưỡng tốt nhất cho đấng sinh thành',
        measurableMetric: 'Khám sức khỏe định kỳ và bảo hiểm y tế cao cấp cho cha mẹ hai bên',
      },
      {
        id: 'pl-beyond-family-values',
        title: 'Định hình Gia phong & Quy chuẩn Đạo đức Dòng họ',
        category: 'moral_legacy',
        tier: 'beyond_excellence',
        description:
          'Xây dựng truyền thống gia đình hiếu học, chính trực, yêu thương và giúp đỡ nhau',
        measurableMetric:
          'Biên soạn Quy ước gia đình (Family Values) truyền thừa cho các thế hệ sau',
      },
      {
        id: 'pl-beyond-philanthropy',
        title: 'Cống hiến Xã hội & Thiện nguyện Bền vững',
        category: 'moral_legacy',
        tier: 'beyond_excellence',
        description: 'Tài trợ học bổng, xây trường học, giúp đỡ những hoàn cảnh khó khăn thực chất',
        measurableMetric: 'Thành lập hoặc tài trợ thường niên cho một dự án xã hội có ý nghĩa',
      },
    ],
    deathTraps: [
      {
        trapName: 'Đột quỵ & Bệnh tật do hủy hoại sức khỏe ở tuổi trung niên',
        riskDescription: 'Làm việc kiệt sức, nhậu nhẹt tiếp khách triền miên, không khám sức khỏe',
        consequence: 'Mất trắng tất cả khi đang ở đỉnh cao sự nghiệp',
        antidoteStrategy:
          'Khám sức khỏe tổng quát 6 tháng/lần; từ chối bia rượu quá đà; ngủ đủ giấc',
      },
      {
        trapName: 'Ngủ quên trên chiến thắng dẫn đến tụt hậu chuyên môn',
        riskDescription: 'Bảo thủ, không cập nhật công nghệ mới và AI',
        consequence: 'Bị thị trường và thế hệ trẻ đào thải trong vòng 3-5 năm',
        antidoteStrategy:
          'Duy trì tinh thần Lifelong Learning; cập nhật liên tục các xu hướng công nghệ mới',
      },
    ],
  },

  sage_legacy: {
    stage: 'sage_legacy',
    ageRange: '50+ tuổi (Trí huệ, Chuyển giao Thế hệ & An nhàn)',
    vietnameseTitle: 'Viên mãn: Tự do Tài chính Toàn phần, Gia đạo An lạc & Di sản Trường tồn',
    developmentalCore:
      'Sự vẹn toàn nhân cách (Ego Integrity vs Despair) — Tự hào về cuộc đời đã sống',
    benchmarks: [
      {
        id: 'sl-full-fire',
        title: 'Tự do Tài chính Toàn phần & Hưu trí Thảnh thơi',
        category: 'financial',
        tier: 'baseline',
        description:
          'Không còn áp lực kiếm tiền; tài sản sinh sôi tự động; bảo hiểm y tế toàn diện',
        measurableMetric: 'Thu nhập thụ động vượt trội chi phí hưu trí an nhàn',
      },
      {
        id: 'sl-clear-inheritance',
        title: 'Chuyển giao Di sản & Thừa kế Văn minh',
        category: 'financial',
        tier: 'baseline',
        description:
          'Kế hoạch thừa kế minh bạch, đúng pháp luật, phòng tránh mọi mâu thuẫn cho con cháu',
        measurableMetric:
          'Di chúc và phương án chuyển giao tài sản được pháp luật công nhận rõ ràng',
      },
      {
        id: 'sl-inner-peace',
        title: 'Tâm thái An nhiên & Sức khỏe Dẻo dai',
        category: 'physical',
        tier: 'baseline',
        description:
          'Sống an lạc qua thiền định, đọc sách, làm vườn; gia đạo con cháu hiếu thảo hòa thuận',
        measurableMetric: 'Tập thể dục dưỡng sinh mỗi ngày; tinh thần minh mẫn, thư thái',
      },
      {
        id: 'sl-beyond-legacy',
        title: 'Để lại Di sản Tinh thần & Quỹ Khuyến học Cho Đời',
        category: 'moral_legacy',
        tier: 'beyond_excellence',
        description:
          'Viết hồi ký, truyền đạt kinh nghiệm sống cho thế hệ sau; lập quỹ học bổng lâu dài',
        measurableMetric:
          'Tác phẩm hồi ký hoặc công trình đóng góp được cộng đồng và gia tộc tôn vinh',
      },
      {
        id: 'sl-beyond-longevity',
        title: 'Sống Thọ, Sống Khỏe & Minh Mẫn Đến 85 – 95+ Tuổi',
        category: 'physical',
        tier: 'beyond_excellence',
        description:
          'Duy trì sự độc lập trong sinh hoạt và trí tuệ sáng suốt suốt những năm tháng tuổi già',
        measurableMetric:
          'Tự chủ hoàn toàn sinh hoạt cá nhân, truyền cảm hứng sống đẹp cho con cháu',
      },
    ],
    deathTraps: [
      {
        trapName: 'Tranh chấp tài sản và rạn nứt gia tộc đời sau',
        riskDescription: 'Không minh bạch trong việc phân chia tài sản thừa kế',
        consequence: 'Con cái từ mặt nhau, gia phong sụp đổ',
        antidoteStrategy:
          'Tham vấn luật sư lập di chúc văn minh, công bằng, giáo dục con cái tự lập từ sớm',
      },
      {
        trapName: 'Cô đơn, trầm cảm và suy giảm nhận thức tuổi già',
        riskDescription: 'Mất kết nối với xã hội sau khi nghỉ hưu, chỉ ở nhà một mình',
        consequence: 'Mau già nua, suy giảm trí nhớ (Alzheimer), mất niềm vui sống',
        antidoteStrategy:
          'Tham gia các câu lạc bộ người cao tuổi, làm từ thiện, duy trì đọc sách mỗi ngày',
      },
    ],
  },
}

// 2. Phân tích & Đánh giá 5 Nguồn Vốn (5 Capitals)
export function evaluateFiveCapitals(
  personId: string,
  scores: {
    human: number
    physical: number
    social: number
    financial: number
    moralLegacy: number
  },
): FiveCapitalsAssessment {
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n * 10) / 10))
  const h = clamp(scores.human)
  const p = clamp(scores.physical)
  const s = clamp(scores.social)
  const f = clamp(scores.financial)
  const m = clamp(scores.moralLegacy)

  const overallBalance = Math.round(((h + p + s + f + m) / 5) * 10) / 10

  // Tìm nguồn vốn điểm thấp nhất làm điểm nghẽn
  const capitals: Array<{ category: CapitalCategory; score: number }> = [
    { category: 'human', score: h },
    { category: 'physical', score: p },
    { category: 'social', score: s },
    { category: 'financial', score: f },
    { category: 'moral_legacy', score: m },
  ]
  capitals.sort((a, b) => a.score - b.score)
  const bottleneck = capitals[0]!.category

  return FiveCapitalsAssessmentSchema.parse({
    id: randomUUID(),
    personId,
    humanScore: h,
    physicalScore: p,
    socialScore: s,
    financialScore: f,
    moralLegacyScore: m,
    overallBalanceScore: overallBalance,
    bottleneckCapital: bottleneck,
    createdAt: new Date().toISOString(),
    schemaVersion: LIFE_MILESTONE_MASTERY_SCHEMA_VERSION,
  })
}

// 3. Bộ Kiểm Định Tuân Thủ 2 Quy Ước Tối Thượng: Pháp Luật & Lòng Yêu Thương
export function verifySupremeCompliance(
  personId: string,
  input: {
    planText: string
    actionItems: string[]
    targetAudience?: string
  },
): SupremePrincipleCompliance {
  const combinedText =
    `${input.planText} ${input.actionItems.join(' ')} ${input.targetAudience ?? ''}`.toLowerCase()

  const legalFlags: string[] = []
  const compassionFlags: string[] = []
  const legalChecklist: string[] = []
  const compassionChecklist: string[] = []

  // BỘ TỪ KHÓA BẤT HỢP PHÁP / RỦI RO PHÁP LÝ CAO
  const illegalPatterns: Array<{ pattern: RegExp; reason: string }> = [
    {
      pattern: /(cờ bạc|tài xỉu|cá độ|đánh bạc|lô đề)/i,
      reason: 'Có dấu hiệu liên quan đến cờ bạc cá cược vi phạm pháp luật',
    },
    {
      pattern: /(lừa đảo|chiếm đoạt|gian lận|scam|ponzi|đa cấp bất chính)/i,
      reason: 'Có dấu hiệu gian lận, lừa đảo chiếm đoạt tài sản',
    },
    {
      pattern: /(trốn thuế|rửa tiền|lậu|buôn lậu)/i,
      reason: 'Có dấu hiệu vi phạm quy định về thuế và thương mại',
    },
    {
      pattern: /(bạo lực|đánh nhau|đe dọa|khủng bố|vũ khí)/i,
      reason: 'Có dấu hiệu bạo lực hoặc đe dọa an toàn tính mạng con người',
    },
    {
      pattern: /(đạo văn|ăn cắp bản quyền|sao chép lậu|hack|bẻ khóa)/i,
      reason: 'Có dấu hiệu vi phạm quyền sở hữu trí tuệ và an ninh mạng',
    },
    {
      pattern: /(tín dụng đen|bốc bát họ|cho vay nặng lãi)/i,
      reason: 'Có dấu hiệu vi phạm quy định cho vay tín dụng',
    },
  ]

  for (const { pattern, reason } of illegalPatterns) {
    if (pattern.test(combinedText)) {
      legalFlags.push(reason)
    }
  }

  // BỘ TỪ KHÓA ĐỘC HẠI / PHẢN TRẮC ẨN
  const antiCompassionPatterns: Array<{ pattern: RegExp; reason: string }> = [
    {
      pattern: /(hại người|chèn ép|dìm hàng|trả thù|phá hoại)/i,
      reason: 'Mục tiêu thể hiện tâm lý thù hận, gây hại cho người khác',
    },
    {
      pattern: /(bỏ bê con cái|bỏ rơi cha mẹ|bất hiếu)/i,
      reason: 'Có hành vi bỏ bê trách nhiệm chăm sóc và yêu thương gia đình',
    },
    {
      pattern: /(hủy hoại bản thân|tự tử|hành xác)/i,
      reason: 'Thiếu lòng tự trắc ẩn và bảo vệ sinh mạng bản thân',
    },
  ]

  for (const { pattern, reason } of antiCompassionPatterns) {
    if (pattern.test(combinedText)) {
      compassionFlags.push(reason)
    }
  }

  // Ghi nhận checklist tích cực
  if (legalFlags.length === 0) {
    legalChecklist.push('Hoạt động minh bạch, tuân thủ đúng Hiến pháp và Pháp luật Việt Nam')
    legalChecklist.push('Tôn trọng quyền sở hữu trí tuệ, danh dự và tài sản của người khác')
    legalChecklist.push('Không có dấu hiệu gian lận hay đường tắt tiêu cực')
  }

  if (compassionFlags.length === 0) {
    compassionChecklist.push(
      'Động lực xuất phát từ tình yêu thương bản thân, gia đình và cộng đồng',
    )
    compassionChecklist.push('Hành động mang lại giá trị nhân văn và phụng sự cuộc sống')
    compassionChecklist.push('Thực hành lòng tự trắc ẩn và không làm tổn hại ai')
  }

  const isLegallyCompliant = legalFlags.length === 0
  const isCompassionAligned = compassionFlags.length === 0
  const allFlags = [...legalFlags, ...compassionFlags]

  let verdict: 'approved' | 'requires_revision' | 'rejected' = 'approved'
  let explanation =
    'Kế hoạch hoàn toàn minh bạch, tuân thủ pháp luật và giàu tính nhân văn yêu thương con người.'

  if (!isLegallyCompliant) {
    verdict = 'rejected'
    explanation = `Kế hoạch vi phạm Quy ước Tối thượng về Pháp luật: ${legalFlags.join('; ')}.`
  } else if (!isCompassionAligned) {
    verdict = 'requires_revision'
    explanation = `Kế hoạch cần điều chỉnh tâm thế để phù hợp với Quy ước Yêu thương con người: ${compassionFlags.join('; ')}.`
  }

  return SupremePrincipleComplianceSchema.parse({
    id: randomUUID(),
    personId,
    isLegallyCompliant,
    isCompassionAligned,
    legalChecklist,
    compassionChecklist,
    flaggedConcerns: allFlags,
    verdict,
    explanation,
    evaluatedAt: new Date().toISOString(),
    schemaVersion: LIFE_MILESTONE_MASTERY_SCHEMA_VERSION,
  })
}

// 4. Sinh Lịch Trình Ngày Hiệu Suất Cao Cá Nhân Hóa (Daily LifeOS Routine)
export function generateDailyLifeOSRoutine(
  personId: string,
  stage: LifeStageType,
  customTopPriorities?: string[],
): DailyLifeOSRoutine {
  const profile = LIFE_STAGE_PROFILES[stage]

  let morningExercise = 20
  let morningMindFood = 20
  let deepWorkMins = 180
  let compassionateAction = 'Nấu bữa cơm gia đình hoặc gửi lời hỏi thăm ấm áp tới cha mẹ/người thân'
  let defaultPriorities: string[] = []

  switch (stage) {
    case 'early_childhood_primary':
      morningExercise = 25
      morningMindFood = 15
      deepWorkMins = 60
      compassionateAction = 'Chủ động giúp cha mẹ dọn mâm cơm và cảm ơn thầy cô'
      defaultPriorities = [
        'Tự gấp chăn màn và chuẩn bị sách vở',
        'Đọc 15 trang truyện thiếu nhi',
        'Luyện nghe tiếng Anh 20p',
      ]
      break
    case 'lower_secondary':
      morningExercise = 30
      morningMindFood = 20
      deepWorkMins = 120
      compassionateAction = 'Hướng dẫn bài học khó cho một người bạn trong lớp'
      defaultPriorities = [
        'Học 1 bài ngữ pháp CEFR B1',
        'Luyện gõ 10 ngón 15p',
        'Chơi bóng rổ/bơi 30p',
      ]
      break
    case 'upper_secondary':
      morningExercise = 30
      morningMindFood = 25
      deepWorkMins = 180
      compassionateAction = 'Động viên bạn bè cùng tiến bộ, đối xử chân thành với người yêu'
      defaultPriorities = [
        'Luyện 1 bài đọc IELTS Reading 8.0',
        'Giải đề toán phân hóa',
        'Nghiên cứu ngành học Ikigai',
      ]
      break
    case 'university_launchpad':
      morningExercise = 35
      morningMindFood = 25
      deepWorkMins = 200
      compassionateAction = 'Dành 30 phút hỗ trợ dự án tình nguyện hoặc giúp đỡ bạn bè cùng phòng'
      defaultPriorities = [
        'Hoàn thiện đồ án chuyên môn',
        'Luyện tiếng Anh giao tiếp công sở',
        'Trích 20% lương tích sản',
      ]
      break
    case 'young_professional':
      morningExercise = 30
      morningMindFood = 20
      deepWorkMins = 240
      compassionateAction = 'Lắng nghe và chia sẻ chân thành cùng bạn đời, gửi quà biếu cha mẹ'
      defaultPriorities = [
        'Giải quyết công việc trọng tâm của dự án',
        'Trao đổi kế hoạch gia đình',
        'Đọc 20 trang sách quản trị/đầu tư',
      ]
      break
    case 'family_builder':
      morningExercise = 30
      morningMindFood = 15
      deepWorkMins = 240
      compassionateAction = 'Đọc sách truyện và chơi đùa trọn vẹn cùng con 30 phút không điện thoại'
      defaultPriorities = [
        'Lãnh đạo nhóm đạt mục tiêu kinh doanh',
        'Dành thời gian chất lượng cho con',
        'Kiểm tra ngân sách gia đình',
      ]
      break
    case 'prime_leader':
      morningExercise = 40
      morningMindFood = 20
      deepWorkMins = 200
      compassionateAction =
        'Cố vấn cho một nhân sự trẻ tiềm năng và chăm sóc sức khỏe chu đáo cho cha mẹ'
      defaultPriorities = [
        'Quyết định chiến lược công ty',
        'Tâm sự định hướng cho con tuổi lớn',
        'Tập luyện thể thao duy trì tim mạch',
      ]
      break
    case 'sage_legacy':
      morningExercise = 45
      morningMindFood = 30
      deepWorkMins = 90
      compassionateAction =
        'Chia sẻ bài học cuộc đời cho con cháu và tham gia hoạt động từ thiện địa phương'
      defaultPriorities = [
        'Đi bộ dưỡng sinh sáng sớm',
        'Viết hồi ký/đọc sách triết học',
        'Chăm sóc vườn cây và gắn kết gia đình',
      ]
      break
  }

  const finalPriorities =
    customTopPriorities && customTopPriorities.length > 0
      ? customTopPriorities.slice(0, 5)
      : defaultPriorities

  return DailyLifeOSRoutineSchema.parse({
    id: randomUUID(),
    personId,
    stage,
    morningGoldenHour: {
      exerciseMinutes: morningExercise,
      mindFoodMinutes: morningMindFood,
      top3Priorities: finalPriorities,
    },
    deepWorkMinutes: deepWorkMins,
    compassionateAction,
    eveningReflection: {
      gratitudeEntries: [
        'Biết ơn vì một ngày trọn vẹn được sống, cống hiến và học hỏi',
        'Biết ơn những người thân yêu luôn bên cạnh đồng hành',
        `Biết ơn vì bản thân đã kiên trì theo đuổi mục tiêu của giai đoạn ${profile.ageRange}`,
      ],
      microVictories: [
        'Đã hoàn thành 100% các ưu tiên then chốt trong ngày',
        'Đã giữ gìn tính chính trực và đối xử tử tế với mọi người xung quanh',
      ],
      bedtimeTarget: '22:30',
    },
    createdAt: new Date().toISOString(),
    schemaVersion: LIFE_MILESTONE_MASTERY_SCHEMA_VERSION,
  })
}

// 5. Chẩn Đoán Động Lực Thuyết Tự Quyết (SDT) & Kê Toa Tinh Thần Logotherapy
export function diagnoseMotivationAndBelief(
  personId: string,
  input: {
    autonomy: number // 1-10
    competence: number // 1-10
    relatedness: number // 1-10
    isChasingInstantDopamine: boolean
    whyReason: string
  },
): MotivationDiagnostic {
  const aut = Math.max(1, Math.min(10, Math.round(input.autonomy)))
  const comp = Math.max(1, Math.min(10, Math.round(input.competence)))
  const rel = Math.max(1, Math.min(10, Math.round(input.relatedness)))

  const sdtAverage = (aut + comp + rel) / 3
  const dopamineDynamic: 'tonic_sustainable' | 'phasic_scattered' = input.isChasingInstantDopamine
    ? 'phasic_scattered'
    : 'tonic_sustainable'

  let beliefIndex = sdtAverage * 10
  if (dopamineDynamic === 'phasic_scattered') {
    beliefIndex = Math.max(10, beliefIndex - 20)
  }
  beliefIndex = Math.round(beliefIndex * 10) / 10

  const steps: string[] = []
  if (aut < 6) {
    steps.push(
      'Chuyển đổi tâm thế từ "Tôi buộc phải làm" sang "Tôi chọn làm vì đây là con đường tự do của tôi"',
    )
  }
  if (comp < 6) {
    steps.push(
      'Chia nhỏ mục tiêu lớn thành các nhiệm vụ 15 phút để tích lũy chiến thắng vi mô (Micro-wins)',
    )
  }
  if (rel < 6) {
    steps.push('Gắn hành động học tập/làm việc với lợi ích cụ thể của người thân yêu nhất')
  }
  if (dopamineDynamic === 'phasic_scattered') {
    steps.push(
      'Thực hiện thanh lọc kỹ thuật số (Dopamine Fasting): Tắt mạng xã hội 2 giờ trước khi ngủ và trong giờ Deep Work',
    )
  }
  steps.push('Ghi nhận ít nhất 3 bằng chứng kỷ luật nhỏ vào Nhật ký Chiến thắng mỗi tối')

  return MotivationDiagnosticSchema.parse({
    id: randomUUID(),
    personId,
    autonomyLevel: aut,
    competenceLevel: comp,
    relatednessLevel: rel,
    dopamineDynamic,
    unshakeableBeliefIndex: beliefIndex,
    logotherapyWhyReason:
      input.whyReason.trim() ||
      'Tôi hành động vì tình yêu thương gia đình và khát vọng sống một đời chính trực rực rỡ.',
    prescribedActionSteps: steps,
    createdAt: new Date().toISOString(),
    schemaVersion: LIFE_MILESTONE_MASTERY_SCHEMA_VERSION,
  })
}

// 6. Ghi Nhận Bằng Chứng Vi Mô (Micro-Evidence) Củng Cố Tính Dẻo Não Bộ
export function createMicroEvidenceLogInMemory(
  personId: string,
  input: {
    actionDescription: string
    capitalReinforced: CapitalCategory
    loggedAt?: string
    currentStreak?: number
  },
): MicroEvidenceLog {
  return MicroEvidenceLogSchema.parse({
    id: randomUUID(),
    personId,
    actionDescription: input.actionDescription,
    capitalReinforced: input.capitalReinforced,
    loggedAt: input.loggedAt ?? vnDateStr(),
    streakCount: (input.currentStreak ?? 0) + 1,
    createdAt: new Date().toISOString(),
    schemaVersion: LIFE_MILESTONE_MASTERY_SCHEMA_VERSION,
  })
}

// 7. Truy xuất thông tin Profile từng độ tuổi
export function getLifeStageProfile(stage: LifeStageType): LifeStageProfile {
  return LIFE_STAGE_PROFILES[stage]
}

export function getAllLifeStageProfiles(): LifeStageProfile[] {
  return Object.values(LIFE_STAGE_PROFILES)
}
