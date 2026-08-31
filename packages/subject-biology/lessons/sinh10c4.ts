// lessons/sinh10c4.ts — Sinh học 10, Chương 7 & 8 (Bài 20-26).
import type { BiologyLesson } from '../lessonTypes.js'

export const SINH10_C4_LESSONS: BiologyLesson[] = [
  {
    id: 'sinh10-c7-b20',
    grade: '10',
    chapterNumber: 7,
    chapterTitle: 'Sinh học vi sinh vật',
    lessonNumber: 20,
    title: 'Khái quát về vi sinh vật',
    hook: 'Vi sinh vật siêu nhỏ bé, mắt thường không thể thấy được, nhưng chúng chiếm sinh khối khổng lồ và đóng vai trò quyết định trong việc tuần hoàn các nguyên tố hóa học trên Trái Đất.',
    theory:
      'KHÁI NIỆM VI SINH VẬT:\\n' +
      '— Vi sinh vật (Microorganism) là những sinh vật có kích thước siêu nhỏ (tính bằng micrometer), cấu tạo đơn bào hoặc đa bào đơn giản (nhân sơ hoặc nhân thực), có khả năng hấp thụ và chuyển hóa chất dinh dưỡng nhanh, sinh trưởng và sinh sản rất nhanh, phân bố rộng rãi trong tự nhiên.\\n' +
      '— Các nhóm vi sinh vật chính:\\n' +
      '  + Vi sinh vật nhân sơ: Vi khuẩn (Bacteria), Cổ khuẩn (Archaea).\\n' +
      '  + Vi sinh vật nhân thực: Vi tảo (Microalgae), Nấm men (Yeast), Nấm sợi, Động vật nguyên sinh (Protozoa).\\n\\n' +
      'CÁC KIỂU DINH DƯỠNG CỦA VI SINH VẬT:\\n' +
      'Dựa vào nguồn năng lượng và nguồn carbon sử dụng, vi sinh vật được chia thành 4 kiểu dinh dưỡng chính:\\n' +
      '1. Quang tự dưỡng (Photoautotrophy):\\n' +
      '   — Nguồn năng lượng: Ánh sáng.\\n' +
      '   — Nguồn carbon: CO₂.\\n' +
      '   — Ví dụ: Vi khuẩn lam, tảo đơn bào, vi khuẩn lưu huỳnh màu tía và màu lục.\\n' +
      '2. Hóa tự dưỡng (Chemoautotrophy):\\n' +
      '   — Nguồn năng lượng: Chất vô cơ (NH₃, H₂S, NO₂⁻, Fe²⁺...).\\n' +
      '   — Nguồn carbon: CO₂.\\n' +
      '   — Ví dụ: Vi khuẩn nitrat hóa, vi khuẩn oxi hóa sắt, vi khuẩn oxi hóa lưu huỳnh.\\n' +
      '3. Quang dị dưỡng (Photoheterotrophy):\\n' +
      '   — Nguồn năng lượng: Ánh sáng.\\n' +
      '   — Nguồn carbon: Chất hữu cơ.\\n' +
      '   — Ví dụ: Vi khuẩn không lưu huỳnh màu lục và màu tía.\\n' +
      '4. Hóa dị dưỡng (Chemoheterotrophy):\\n' +
      '   — Nguồn năng lượng: Chất hữu cơ.\\n' +
      '   — Nguồn carbon: Chất hữu cơ.\\n' +
      '   — Ví dụ: Vi khuẩn phân hủy, nấm, động vật nguyên sinh, phần lớn vi khuẩn ký sinh.',
    workedExample: {
      problem:
        'Hãy so sánh sự khác nhau cơ bản về nguồn năng lượng và nguồn carbon giữa kiểu dinh dưỡng Quang tự dưỡng và Hóa dị dưỡng.',
      steps: [
        'Xác định tiêu chí so sánh: nguồn năng lượng và nguồn carbon.',
        'Đối với Quang tự dưỡng: Sử dụng năng lượng từ ánh sáng mặt trời; nguồn carbon để tổng hợp chất hữu cơ là chất vô cơ CO₂.',
        'Đối với Hóa dị dưỡng: Sử dụng năng lượng từ các liên kết hóa học trong chất hữu cơ; nguồn carbon cũng chính là các phân tử hữu cơ hấp thụ từ môi trường.',
      ],
      answer:
        'Quang tự dưỡng dùng ánh sáng và CO₂; Hóa dị dưỡng dùng chất hữu cơ làm cả nguồn năng lượng và nguồn carbon.',
    },
    checkQuestions: [
      {
        prompt: 'Nhóm vi sinh vật nào sau đây có kiểu dinh dưỡng hóa tự dưỡng?',
        choices: [
          { id: 'kt_1', label: 'Vi khuẩn nitrat hóa' },
          { id: 'kt_2', label: 'Nấm men bia' },
          { id: 'kt_3', label: 'Tảo lục đơn bào' },
          { id: 'kt_4', label: 'Vi khuẩn lam' },
        ],
        answer: { kind: 'choice', correctIds: ['kt_1'] },
        explain:
          'Vi khuẩn nitrat hóa oxi hóa NH₃ hoặc NO₂⁻ (chất vô cơ) để lấy năng lượng và dùng CO₂ làm nguồn carbon, đây là kiểu hóa tự dưỡng. Tảo lục và vi khuẩn lam là quang tự dưỡng; nấm men là hóa dị dưỡng.',
      },
      {
        prompt:
          'Vi sinh vật sử dụng nguồn năng lượng là ánh sáng và nguồn carbon là chất hữu cơ thuộc kiểu dinh dưỡng nào?',
        choices: [
          { id: 'kd_1', label: 'Quang dị dưỡng' },
          { id: 'kd_2', label: 'Quang tự dưỡng' },
          { id: 'kd_3', label: 'Hóa tự dưỡng' },
          { id: 'kd_4', label: 'Hóa dị dưỡng' },
        ],
        answer: { kind: 'choice', correctIds: ['kd_1'] },
        explain:
          'Sử dụng ánh sáng = Quang; sử dụng chất hữu cơ làm nguồn carbon = Dị dưỡng. Do đó đây là kiểu dinh dưỡng Quang dị dưỡng.',
      },
    ],
    srsCards: [
      {
        hoi: 'Nêu hai tiêu chí để phân chia các kiểu dinh dưỡng ở vi sinh vật?',
        dap: 'Nguồn năng lượng (Ánh sáng hoặc Chất hóa học) và Nguồn carbon (CO₂ hoặc Chất hữu cơ).',
      },
      {
        hoi: 'Kể tên các nhóm vi sinh vật có cấu tạo tế bào nhân sơ?',
        dap: 'Vi khuẩn (Bacteria) và Cổ khuẩn (Archaea).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c7-b21',
    grade: '10',
    chapterNumber: 7,
    chapterTitle: 'Sinh học vi sinh vật',
    lessonNumber: 21,
    title: 'Trao đổi chất, sinh trưởng và sinh sản ở vi sinh vật',
    hook: 'Tại sao thức ăn để ngoài không khí rất nhanh bị ôi thiu? Đó là do tốc độ sinh trưởng và phân chia tế bào cực nhanh của vi sinh vật dưới điều kiện thuận lợi.',
    theory:
      'QUÁ TRÌNH TỔNG HỢP VÀ PHÂN GIẢI Ở VI SINH VẬT:\\n' +
      '— Tổng hợp: Vi sinh vật tổng hợp protein, nucleic acid, carbohydrate, lipid để kiến tạo tế bào. Nhiều nhóm có khả năng tự tổng hợp các amino acid thiết yếu.\\n' +
      '— Phân giải: Vi sinh vật tiết enzyme ngoại bào (protease, amylase, lipase, cellulase...) để phân giải các chất hữu cơ phức tạp trong môi trường thành chất đơn giản, sau đó hấp thụ qua màng sinh chất.\\n\\n' +
      'SINH TRƯỞNG CỦA QUẦN THỂ VI SINH VẬT:\\n' +
      'Sinh trưởng của vi sinh vật được định nghĩa là sự gia tăng số lượng tế bào của quần thể.\\n' +
      '1. Nuôi cấy không liên tục (Batch culture): Không bổ sung chất dinh dưỡng mới và không lấy đi chất thải sinh ra. Quần thể trải qua 4 pha sinh trưởng:\\n' +
      '   — Pha tiềm phát (Lag phase): Tế bào thích nghi với môi trường mới, không phân chia số lượng, enzyme được tổng hợp mạnh mẽ.\\n' +
      '   — Pha lũy thừa (Log phase): Tế bào phân chia với tốc độ tối đa, số lượng tế bào tăng theo cấp số nhân (hằng số sinh trưởng đạt cực đại).\\n' +
      '   — Pha cân bằng (Stationary phase): Tốc độ sinh sản bằng tốc độ chết đi. Số lượng tế bào đạt cực đại và không đổi do dinh dưỡng giảm dần, chất độc tích lũy.\\n' +
      '   — Pha suy vong (Decline phase): Số lượng tế bào chết vượt trội tế bào sinh ra do dinh dưỡng cạn kiệt, chất độc quá nhiều.\\n' +
      '2. Nuôi cấy liên tục (Continuous culture): Bổ sung chất dinh dưỡng mới liên tục và lấy ra lượng dịch nuôi cấy tương đương. Quần thể luôn duy trì ở pha lũy thừa, ứng dụng thu sinh khối và chất kháng sinh.\\n\\n' +
      'HÌNH THỨC SINH SẢN Ở VI SINH VẬT:\\n' +
      '— Vi sinh vật nhân sơ: Phân đôi (phổ biến nhất), nảy chồi và hình thành bào tử sinh sản (như xạ khuẩn). Lưu ý: Nội bào tử (Endospore) ở vi khuẩn chỉ là dạng nghỉ chống chịu điều kiện bất lợi, không phải bào tử sinh sản.\\n' +
      '— Vi sinh vật nhân thực: Sinh sản vô tính (phân đôi, nảy chồi, tạo bào tử vô tính) và sinh sản hữu tính (bằng bào tử hữu tính hoặc tiếp hợp).',
    workedExample: {
      problem:
        'Một quần thể vi khuẩn E. coli ban đầu có 200 tế bào được nuôi cấy trong điều kiện tối ưu. Biết thời gian thế hệ g = 20 phút. Hãy tính số lượng tế bào trong quần thể sau 2 giờ.',
      steps: [
        'Tính số lần phân chia (n): Thời gian nuôi cấy t = 2 giờ = 120 phút. Số lần phân chia n = t / g = 120 / 20 = 6 lần.',
        'Áp dụng công thức tính số lượng tế bào: N = N₀ × 2ⁿ, trong đó N₀ là số tế bào ban đầu, n là số lần phân chia.',
        'Tính toán: N = 200 × 2⁶ = 200 × 64 = 12800 tế bào.',
      ],
      answer: 'Số lượng tế bào vi khuẩn sau 2 giờ là 12.800 tế bào.',
    },
    checkQuestions: [
      {
        prompt:
          'Trong nuôi cấy không liên tục, pha nào có tốc độ sinh trưởng của quần thể vi sinh vật đạt cực đại?',
        choices: [
          { id: 'ps_1', label: 'Pha lũy thừa (Log phase)' },
          { id: 'ps_2', label: 'Pha tiềm phát (Lag phase)' },
          { id: 'ps_3', label: 'Pha cân bằng (Stationary phase)' },
          { id: 'ps_4', label: 'Pha suy vong (Decline phase)' },
        ],
        answer: { kind: 'choice', correctIds: ['ps_1'] },
        explain:
          'Trong pha lũy thừa, các điều kiện dinh dưỡng còn dồi dào, tế bào sinh trưởng và phân chia với tốc độ tối đa, số lượng tăng vọt theo lũy thừa.',
      },
      {
        prompt:
          'Cấu trúc nào sau đây ở vi khuẩn KHÔNG phải là hình thức sinh sản mà chỉ là dạng bảo vệ tế bào vượt qua điều kiện bất lợi?',
        choices: [
          { id: 'bt_1', label: 'Nội bào tử (Endospore)' },
          { id: 'bt_2', label: 'Bào tử đốt' },
          { id: 'bt_3', label: 'Nảy chồi' },
          { id: 'bt_4', label: 'Phân đôi' },
        ],
        answer: { kind: 'choice', correctIds: ['bt_1'] },
        explain:
          'Nội bào tử (endospore) của vi khuẩn hình thành khi môi trường khắc nghiệt. Khi điều kiện thuận lợi, mỗi nội bào tử chỉ nảy mầm thành một tế bào vi khuẩn duy nhất, không làm tăng số lượng cá thể nên không phải là sinh sản.',
      },
    ],
    srsCards: [
      {
        hoi: 'Thời gian thế hệ (g) của vi sinh vật là gì?',
        dap: 'Là khoảng thời gian cần thiết để số lượng tế bào trong quần thể vi sinh vật tăng lên gấp đôi (hoặc thời gian của một chu kỳ phân chia).',
      },
      {
        hoi: 'Tại sao nuôi cấy liên tục lại giữ được quần thể vi sinh vật ở pha lũy thừa?',
        dap: 'Vì liên tục bổ sung chất dinh dưỡng mới và đồng thời loại bỏ các chất độc hại cùng sinh khối dư thừa.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c7-b22',
    grade: '10',
    chapterNumber: 7,
    chapterTitle: 'Sinh học vi sinh vật',
    lessonNumber: 22,
    title: 'Vai trò và ứng dụng của vi sinh vật',
    hook: 'Sữa chua thơm ngon, nước mắm đậm đà, hay các loại thuốc kháng sinh cứu sống hàng triệu người đều là sản phẩm từ hoạt động chuyển hóa của các vi sinh vật nhỏ bé.',
    theory:
      'VAI TRÒ CỦA VI SINH VẬT TRONG TỰ NHIÊN:\\n' +
      '— Phân giải các hợp chất hữu cơ (xác động thực vật) thành chất vô cơ cung cấp cho thực vật, khép kín chu trình tuần hoàn vật chất.\\n' +
      '— Cố định nitrogen khí quyển (đạm) nhờ các vi khuẩn tự do (Azotobacter) hoặc cộng sinh (Rhizobium trong rễ cây họ Đậu), giúp tăng độ phì nhiêu của đất.\\n\\n' +
      'ỨNG DỤNG CỦA VI SINH VẬT TRONG ĐỜI SỐNG:\\n' +
      '1. Công nghệ thực phẩm:\\n' +
      '   — Lên men lactic: Sản xuất sữa chua, muối dưa cà, nem chua nhờ vi khuẩn lactic (Lactobacillus).\\n' +
      '   — Lên men ethanol: Sản xuất rượu, bia, bánh mì nhờ nấm men (Saccharomyces cerevisiae).\\n' +
      '   — Sản xuất nước mắm, nước tương nhờ phân giải protein của nấm mốc hoặc vi khuẩn hữu ích.\\n' +
      '2. Y học:\\n' +
      '   — Sản xuất kháng sinh tự nhiên hoặc bán tổng hợp nhờ nấm mốc (Penicillium) hoặc xạ khuẩn (Streptomyces).\\n' +
      '   — Chuyển gen sản xuất hormone (như insulin trị tiểu đường) hoặc interferon trị virus bằng vi khuẩn E. coli.\\n' +
      '3. Nông nghiệp:\\n' +
      '   — Sản xuất phân bón vi sinh (chứa vi khuẩn cố định đạm, phân giải lân).\\n' +
      '   — Sản xuất thuốc trừ sâu sinh học (ví dụ vi khuẩn Bacillus thuringiensis - Bt sản xuất tinh thể độc diệt sâu hại).\\n' +
      '4. Bảo vệ môi trường:\\n' +
      '   — Xử lý nước thải bằng bể hiếu khí chứa bùn hoạt tính (chứa vi sinh vật phân hủy chất hữu cơ).\\n' +
      '   — Xử lý tràn dầu bằng các chủng vi khuẩn phân hủy hydrocarbon.\\n\\n' +
      'TÁC HẠI CỦA VI SINH VẬT:\\n' +
      '— Gây bệnh truyền nhiễm cho con người (lao, tả, thương hàn), động vật và thực vật.\\n' +
      '— Làm hư hỏng, ôi thiu thực phẩm, gây độc tố nấm mốc (aflatoxin ở lạc mốc).',
    workedExample: {
      problem:
        'Giải thích tại sao khi làm sữa chua, sữa đặc có đường pha loãng sau một thời gian ủ ấm lại chuyển sang trạng thái đông tụ và có vị chua.',
      steps: [
        'Vi khuẩn lactic có sẵn trong hộp sữa chua mồi sử dụng đường lactose trong sữa làm nguồn cacbon và năng lượng.',
        'Quá trình lên men lactic xảy ra: đường lactose chuyển thành axit lactic, làm giảm pH của môi trường sữa xuống mức acid (pH ~ 4.5).',
        'pH giảm khiến protein casein trong sữa bị đông tụ (kết tủa sinh học), tạo trạng thái mịn dẻo, đồng thời axit lactic tạo vị chua đặc trưng cho sữa chua.',
      ],
      answer:
        'Vi khuẩn lactic lên men đường thành axit lactic làm giảm pH, gây đông tụ protein casein trong sữa và tạo vị chua.',
    },
    checkQuestions: [
      {
        prompt:
          'Vi sinh vật nào sau đây được ứng dụng phổ biến để sản xuất penicillin phục vụ ngành y tế?',
        choices: [
          { id: 'ud_1', label: 'Nấm mốc Penicillium' },
          { id: 'ud_2', label: 'Vi khuẩn Escherichia coli' },
          { id: 'ud_3', label: 'Nấm men Saccharomyces' },
          { id: 'ud_4', label: 'Xạ khuẩn Streptomyces' },
        ],
        answer: { kind: 'choice', correctIds: ['ud_1'] },
        explain:
          'Kháng sinh penicillin được phát hiện và chiết xuất đầu tiên từ nấm mốc thuộc chi Penicillium (cụ thể là Penicillium notatum).',
      },
      {
        prompt:
          'Quá trình muối dưa, muối cà đạt yêu cầu là nhờ hoạt động chuyển hóa của nhóm vi sinh vật nào?',
        choices: [
          { id: 'lh_1', label: 'Vi khuẩn lactic' },
          { id: 'lh_2', label: 'Nấm men sinh cồn' },
          { id: 'lh_3', label: 'Nấm mốc phân giải cellulose' },
          { id: 'lh_4', label: 'Vi khuẩn cố định đạm' },
        ],
        answer: { kind: 'choice', correctIds: ['lh_1'] },
        explain:
          'Muối dưa cà dựa trên quá trình lên men lactic của vi khuẩn lactic có sẵn trên bề mặt lá rau quả, chuyển hóa đường thành axit lactic giúp bảo quản rau quả chống thiu hỏng.',
      },
    ],
    srsCards: [
      {
        hoi: 'Thuốc trừ sâu sinh học Bt được sản xuất dựa trên tác nhân vi sinh vật nào?',
        dap: 'Vi khuẩn Bacillus thuringiensis (Bt), có khả năng sinh độc tố dạng tinh thể tiêu diệt côn trùng hại cây.',
      },
      {
        hoi: 'Tại sao vi khuẩn Rhizobium lại có lợi cho cây họ Đậu?',
        dap: 'Vì chúng cộng sinh ở nốt sần rễ cây, chuyển hóa nitơ tự do (N₂) thành dạng ion amoni (NH₄⁺) mà cây có thể hấp thụ được.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c7-b23',
    grade: '10',
    chapterNumber: 7,
    chapterTitle: 'Sinh học vi sinh vật',
    lessonNumber: 23,
    title: 'Thực hành: Một số phương pháp nghiên cứu vi sinh vật',
    hook: 'Làm thế nào để phân lập được một dòng vi khuẩn tinh khiết từ mẫu đất vườn? Điều này đòi hỏi những kỹ thuật vô trùng cực kỳ nghiêm ngặt và sự khéo léo trong thao tác.',
    theory:
      'NGUYÊN TẮC VÔ TRÙNG TRONG NGHIÊN CỨU VI SINH VẬT:\\n' +
      '— Khử trùng dụng cụ (đĩa Petri, ống nghiệm, que cấy) bằng cách hấp áp suất (autoclave) ở 121°C trong 15-20 phút hoặc sấy khô ở 160-180°C.\\n' +
      '— Mọi thao tác cấy truyền vi sinh vật phải được thực hiện trong tủ cấy vô trùng hoặc bên cạnh ngọn lửa đèn cồn để tránh nhiễm chéo từ bào tử nấm/khuẩn ngoài không khí.\\n\\n' +
      'MỘT SỐ PHƯƠNG PHÁP NGHIÊN CỨU CƠ BẢN:\\n' +
      '1. Phương pháp quan sát (Làm tiêu bản hiển vi):\\n' +
      '   — Làm vết bôi vi khuẩn trên lam kính, cố định bằng nhiệt nhẹ.\\n' +
      '   — Nhuộm màu (nhuộm đơn bằng xanh methylene hoặc nhuộm kép Gram). Nhuộm Gram giúp phân biệt vi khuẩn Gram dương (thành peptidoglycan dày, giữ màu tím kết tinh) và Gram âm (thành mỏng hơn có màng ngoài, bắt màu đỏ safranin sau khi tẩy cồn).\\n' +
      '2. Phương pháp phân lập vi sinh vật (Cô lập tế bào đơn lẻ):\\n' +
      '   — Phương pháp cấy ria (Streak plate): Dùng que cấy kim loại vạch các đường ziczac phân tán vi khuẩn trên đĩa thạch dinh dưỡng. Sau khi ủ, các tế bào đơn lẻ phát triển thành các khuẩn lạc (colony) tinh khiết biệt lập.\\n' +
      '3. Phương pháp nuôi cấy và định lượng:\\n' +
      '   — Nuôi cấy trên môi trường thạch đặc hoặc dịch thể để đo mật độ đục hoặc đếm khuẩn lạc để xác định số lượng tế bào sinh sống.',
    workedExample: {
      problem:
        'Mô tả tóm tắt 4 bước chính trong quy trình nhuộm Gram để phân biệt vi khuẩn Gram dương và Gram âm.',
      steps: [
        'Bước 1: Nhỏ thuốc thử nhuộm chính là tím kết tinh (Crystal violet) lên vết bôi vi khuẩn đã cố định bằng nhiệt trong 1 phút, rửa nước. Cả hai nhóm đều bắt màu tím.',
        'Bước 2: Nhỏ dung dịch Iốt (Lugol) làm chất gắn màu trong 1 phút, rửa nước. Tạo phức chất tím kết tinh-iốt lớn trong tế bào.',
        'Bước 3: Tẩy màu bằng cồn 95% (Ethanol) trong 10-30 giây rồi rửa nhanh bằng nước. Gram âm bị mất màu do lớp màng ngoài bị hòa tan và thành mỏng; Gram dương giữ màu tím do thành peptidoglycan dày co lại giữ phức màu.',
        'Bước 4: Nhuộm bổ sung bằng dung dịch Safranin (màu hồng đỏ) trong 1 phút, rửa nước, thấm khô. Gram âm bắt màu hồng đỏ; Gram dương giữ nguyên màu tím.',
      ],
      answer:
        'Quy trình gồm: Nhuộm tím kết tinh -> Gắn màu bằng Iốt -> Tẩy màu bằng cồn -> Nhuộm bổ sung bằng safranin.',
    },
    checkQuestions: [
      {
        prompt:
          'Trong kỹ thuật nhuộm Gram, vi khuẩn Gram âm sẽ có màu sắc gì dưới kính hiển vi khi kết thúc quá trình?',
        choices: [
          { id: 'gr_1', label: 'Màu hồng đỏ' },
          { id: 'gr_2', label: 'Màu tím kết tinh' },
          { id: 'gr_3', label: 'Màu xanh lục' },
          { id: 'gr_4', label: 'Không màu (trong suốt)' },
        ],
        answer: { kind: 'choice', correctIds: ['gr_1'] },
        explain:
          'Vi khuẩn Gram âm bị tẩy màu bởi cồn, sau đó bắt màu của thuốc nhuộm bổ sung safranin nên có màu hồng đỏ dưới kính hiển vi.',
      },
      {
        prompt:
          'Để phân lập các khuẩn lạc vi khuẩn riêng rẽ từ một hỗn hợp ban đầu trên đĩa thạch dinh dưỡng, phương pháp nào sau đây được sử dụng phổ biến nhất?',
        choices: [
          { id: 'pl_1', label: 'Phương pháp cấy ria (Streak plate)' },
          { id: 'pl_2', label: 'Phương pháp nhuộm đơn' },
          { id: 'pl_3', label: 'Nuôi cấy trong môi trường dịch thể liên tục' },
          { id: 'pl_4', label: 'Hấp khử trùng ở 121°C' },
        ],
        answer: { kind: 'choice', correctIds: ['pl_1'] },
        explain:
          'Phương pháp cấy ria trên đĩa thạch giúp pha loãng cơ học mật độ vi khuẩn theo từng phân vùng đường cấy, tạo điều kiện cho các tế bào đơn lẻ tách rời và phát triển thành các khuẩn lạc thuần khiết độc lập.',
      },
    ],
    srsCards: [
      {
        hoi: 'Tại sao vi khuẩn Gram dương giữ được màu tím sau khi tẩy cồn?',
        dap: 'Vì thành tế bào peptidoglycan dày ngăn cản sự rửa trôi phức chất tím kết tinh-iốt ra khỏi tế bào khi tiếp xúc với cồn.',
      },
      {
        hoi: 'Tại sao phải đốt nóng đỏ que cấy trên ngọn lửa đèn cồn trước và sau khi cấy?',
        dap: 'Trước khi cấy: Tiêu diệt mọi vi sinh vật bám trên que cấy tránh nhiễm mẫu; Sau khi cấy: Tiêu diệt vi sinh vật còn bám trên que cấy tránh phát tán ra môi trường.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c8-b24',
    grade: '10',
    chapterNumber: 8,
    chapterTitle: 'Virus và các ứng dụng',
    lessonNumber: 24,
    title: 'Khái quát về virus',
    hook: 'Virus không có cấu tạo tế bào, không thể tự sinh sản hay chuyển hóa năng lượng ở ngoài tế bào chủ. Chúng nằm ở ranh giới giữa vật thể vô sinh và sinh vật sống.',
    theory:
      'KHÁI NIỆM VỀ VIRUS:\\n' +
      '— Virus là thực thể chưa có cấu tạo tế bào, kích thước siêu hiển vi (dao động từ 10 nm đến 300 nm).\\n' +
      '— Ký sinh nội bào bắt buộc: Virus hoàn toàn không có ribosome và các enzyme chuyển hóa vật chất độc lập, chúng chỉ có thể nhân lên bên trong tế bào sống của vật chủ bằng cách sử dụng vật chất và bộ máy sinh tổng hợp của tế bào chủ.\\n\\n' +
      'CẤU TRÚC CHUNG CỦA VIRUS:\\n' +
      'Mọi virus đều gồm hai thành phần cơ bản:\\n' +
      '1. Lõi acid nucleic: Là hệ gene của virus, có thể là DNA hoặc RNA, mạch đơn hoặc mạch kép (khác với sinh vật nhân thực/nhân sơ chỉ có genome DNA mạch kép).\\n' +
      '2. Vỏ protein (capsid): Bao bọc lõi acid nucleic, được cấu tạo từ các đơn vị protein gọi là capsomer. Tổ hợp lõi và capsid gọi là nucleocapsid.\\n' +
      '— Một số loại virus có thêm vỏ ngoài (envelope): cấu tạo bởi lớp lipid kép tương tự màng sinh chất và các gai glycoprotein nhô ra ngoài, đóng vai trò kháng nguyên giúp hấp phụ đặc hiệu vào tế bào chủ.\\n\\n' +
      'CHU TRÌNH NHÂN LÊN CỦA VIRUS TRONG TẾ BÀO CHỦ:\\n' +
      'Gồm 5 giai đoạn liên tiếp:\\n' +
      '1. Hấp phụ (Attachment): Gai glycoprotein hoặc thụ thể bề mặt của virus liên kết đặc hiệu với các thụ thể trên màng tế bào chủ (như chìa khóa và ổ khóa).\\n' +
      '2. Xâm nhập (Entry): Virus đưa toàn bộ hạt virion hoặc chỉ bơm lõi acid nucleic vào bên trong tế bào chất.\\n' +
      '3. Sinh tổng hợp (Synthesis): Hệ gene virus điều khiển bộ máy tế bào chủ tổng hợp acid nucleic và các protein vỏ cho virus.\\n' +
      '4. Lắp ráp (Assembly): Lõi acid nucleic được lồng vào vỏ capsid để tạo thành các hạt virus mới hoàn chỉnh.\\n' +
      '5. Giải phóng (Release): Các virus mới thoát ra ngoài bằng cách phá hủy làm tan tế bào chủ (chu trình sinh tan - lytic) hoặc nảy chồi ra ngoài từ từ mà không làm tan tế bào chủ ngay lập tức (chu trình tiềm tan - lysogenic).',
    workedExample: {
      problem:
        'Hãy phân biệt sự khác nhau giữa chu trình sinh tan (lytic cycle) và chu trình tiềm tan (lysogenic cycle) của bacteriophage (phage - virus ký sinh vi khuẩn).',
      steps: [
        'So sánh về hành vi của DNA virus sau xâm nhập: Trong chu trình sinh tan, DNA virus nhân lên độc lập lập tức; trong chu trình tiềm tan, DNA virus tích hợp vào nhiễm sắc thể của vi khuẩn tạo thành prophage.',
        'So sánh về số phận của tế bào chủ: Sinh tan làm tan tế bào chủ ngay lập tức giải phóng hàng loạt virus; tiềm tan cho phép tế bào chủ tiếp tục phân đôi bình thường, nhân đôi cả prophage mà không phá hủy tế bào.',
        'Nhận diện sự chuyển đổi: Prophage trong tiềm tan có thể cảm ứng tự phát hoặc do tác nhân ngoài để chuyển sang chu trình sinh tan.',
      ],
      answer:
        'Chu trình sinh tan phá hủy tế bào chủ để giải phóng hạt virus mới; chu trình tiềm tan tích hợp hệ gene virus vào NST tế bào chủ để cùng nhân đôi và không phá hủy tế bào ngay.',
    },
    checkQuestions: [
      {
        prompt: 'Thành phần cấu tạo nào sau đây có ở tất cả các loại virus?',
        choices: [
          { id: 'vr_1', label: 'Vỏ ngoài bằng lipid kép' },
          { id: 'vr_2', label: 'Lõi axit nucleic và vỏ capsid protein' },
          { id: 'vr_3', label: 'Hệ bào quan ti thể và ribosome' },
          { id: 'vr_4', label: 'Thành peptidoglycan vững chắc' },
        ],
        answer: { kind: 'choice', correctIds: ['vr_2'] },
        explain:
          'Tất cả các loại virus tối thiểu đều phải có lõi chứa axit nucleic (vật chất di truyền) và lớp vỏ capsid bằng protein bảo vệ bên ngoài. Vỏ ngoài lipid chỉ có ở một số nhóm virus nhất định.',
      },
      {
        prompt: 'Tại sao virus không thể tự nhân đôi ngoài tế bào chủ?',
        choices: [
          {
            id: 'vrc_1',
            label:
              'Vì chúng không có ribosome và các enzyme cần thiết cho sự tự sinh tổng hợp chất',
          },
          {
            id: 'vrc_2',
            label: 'Vì cấu trúc axit nucleic của chúng bị phân hủy ngay khi ra ngoài không khí',
          },
          { id: 'vrc_3', label: 'Vì vỏ capsid ngăn cản mọi phản ứng hóa học xảy ra' },
          { id: 'vrc_4', label: 'Vì chúng chỉ sống được trong môi trường không có oxy' },
        ],
        answer: { kind: 'choice', correctIds: ['vrc_1'] },
        explain:
          'Virus là thực thể chưa có cấu tạo tế bào, thiếu hoàn toàn ribosome (bộ máy dịch mã tổng hợp protein) và các hệ enzyme chuyển hóa năng lượng, do đó không thể tự nhân lên nếu không ký sinh nội bào bắt buộc.',
      },
    ],
    srsCards: [
      {
        hoi: 'Hạt nucleocapsid của virus gồm những thành phần nào?',
        dap: 'Lõi acid nucleic (DNA hoặc RNA) kết hợp với vỏ protein (capsid).',
      },
      {
        hoi: 'Bacteriophage (phage) là gì?',
        dap: 'Là nhóm virus chuyên ký sinh và phá hủy các tế bào vi khuẩn.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c8-b25',
    grade: '10',
    chapterNumber: 8,
    chapterTitle: 'Virus và các ứng dụng',
    lessonNumber: 25,
    title: 'Một số bệnh do virus và các thành tựu nghiên cứu ứng dụng virus',
    hook: 'Từ các bệnh cúm mùa, sốt xuất huyết, đến đại dịch COVID-19 nguy hiểm, virus đã gây tổn thất khổng lồ cho nhân loại. Tuy nhiên, chúng ta cũng đang ứng dụng chính cấu trúc đặc biệt của chúng để cứu người.',
    theory:
      'CÁC BỆNH TRUYỀN NHIỄM DO VIRUS GÂY RA Ở NGƯỜI:\\n' +
      '— Lây qua đường hô hấp: Cúm, Sởi, COVID-19, Thủy đậu.\\n' +
      '— Lây qua đường tiêu hóa: Tiêu chảy cấp do Rotavirus, viêm gan A.\\n' +
      '— Lây qua đường máu, quan hệ tình dục, từ mẹ sang con: HIV/AIDS, viêm gan B, viêm gan C.\\n' +
      '— Lây qua vết cắn của vật trung gian (véc tơ): Sốt xuất huyết (muỗi vằn lây truyền virus Dengue), bệnh Dại (chó, mèo mang virus dại truyền qua vết cắn).\\n\\n' +
      'CƠ CHẾ PHÒNG CHỐNG BỆNH DO VIRUS:\\n' +
      '— Sử dụng Vaccine: Biện pháp hiệu quả nhất để chủ động phòng bệnh. Vaccine kích thích cơ thể sinh kháng thể và tế bào nhớ miễn dịch chống lại virus khi có sự xâm nhiễm thực tế.\\n' +
      '— Không dùng thuốc kháng sinh điều trị bệnh do virus vì kháng sinh chỉ tác động lên các đích đặc hiệu của vi khuẩn (như tổng hợp vách peptidoglycan, ribosome nhân sơ...).\\n\\n' +
      'ỨNG DỤNG CỦA VIRUS TRONG Y HỌC VÀ ĐỜI SỐNG:\\n' +
      '1. Sản xuất chế phẩm sinh học (interferon, hormone insulin): Sử dụng phage làm vectơ chuyển gene mong muốn vào vi khuẩn để sản xuất số lượng lớn.\\n' +
      '2. Liệu pháp gene (Gene therapy): Dùng virus đã được vô hiệu hóa khả năng gây độc làm xe vận chuyển đưa gene lành tích hợp vào hệ gene người bệnh nhằm sửa chữa các lỗi di truyền.\\n' +
      '3. Sản xuất thuốc trừ sâu sinh học: Sử dụng các virus diệt côn trùng hại (như Baculovirus) để phun cho cây trồng, an toàn với môi trường và sức khỏe con người.',
    workedExample: {
      problem:
        'Giải thích tại sao chúng ta không thể sử dụng thuốc kháng sinh để tiêu diệt virus gây bệnh cúm ở người.',
      steps: [
        'Xem xét cơ chế tác dụng của thuốc kháng sinh: Tấn công các cấu trúc đặc thù của tế bào vi khuẩn (thành peptidoglycan, màng sinh chất, ribosome 70S...).',
        'Xem xét cấu tạo của virus cúm: Không có cấu trúc tế bào, không thành peptidoglycan, không ribosome riêng.',
        'Kết luận: Kháng sinh hoàn toàn không có điểm đích tác động trên hạt virus, do đó không tiêu diệt được virus cúm.',
      ],
      answer:
        'Kháng sinh tấn công cấu trúc tế bào đặc trưng của vi khuẩn, trong khi virus không có cấu tạo tế bào nên kháng sinh không có tác dụng.',
    },
    checkQuestions: [
      {
        prompt:
          'Biện pháp nào sau đây là hiệu quả nhất để phòng tránh chủ động các bệnh truyền nhiễm nguy hiểm do virus ở người?',
        choices: [
          { id: 'pv_1', label: 'Tiêm phòng vaccine đầy đủ và đúng lịch' },
          { id: 'pv_2', label: 'Uống thuốc kháng sinh liều cao hàng ngày' },
          { id: 'pv_3', label: 'Chỉ ăn thức ăn chín và uống nước sôi' },
          { id: 'pv_4', label: 'Tránh tiếp xúc hoàn toàn với ánh nắng mặt trời' },
        ],
        answer: { kind: 'choice', correctIds: ['pv_1'] },
        explain:
          'Tiêm vaccine giúp hệ miễn dịch nhận diện trước kháng nguyên của virus, sinh kháng thể tự nhiên và tế bào nhớ, tạo khả năng miễn dịch bền vững phòng bệnh chủ động.',
      },
      {
        prompt:
          'Ứng dụng nào sau đây sử dụng virus làm vectơ chuyển gene lành thay thế gene bệnh ở tế bào người?',
        choices: [
          { id: 'lh_1', label: 'Liệu pháp gene (Gene therapy)' },
          { id: 'lh_2', label: 'Sản xuất thuốc trừ sâu sinh học' },
          { id: 'lh_3', label: 'Lên men sữa chua' },
          { id: 'lh_4', label: 'Phage trị liệu diệt vi khuẩn tả' },
        ],
        answer: { kind: 'choice', correctIds: ['lh_1'] },
        explain:
          'Liệu pháp gene sử dụng virus làm vectơ vận chuyển (vector) để đưa gen lành vào tế bào của bệnh nhân bị đột biến gen nhằm sửa chữa lỗi di truyền.',
      },
    ],
    srsCards: [
      {
        hoi: 'Virus Dengue gây bệnh sốt xuất huyết lây truyền qua con đường nào?',
        dap: 'Lây truyền ngang qua vết đốt của vật trung gian truyền bệnh là muỗi vằn (Aedes aegypti).',
      },
      {
        hoi: 'Tại sao không dùng kháng sinh để trị bệnh cúm?',
        dap: 'Vì kháng sinh chỉ có tác dụng tiêu diệt hoặc ức chế vi khuẩn; virus không có cấu tạo tế bào nên không bị kháng sinh tác động.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c8-b26',
    grade: '10',
    chapterNumber: 8,
    chapterTitle: 'Virus và các ứng dụng',
    lessonNumber: 26,
    title:
      'Thực hành: Điều tra một số bệnh do virus gây ra và nhân giống cây trồng bằng nuôi cấy mô',
    hook: 'Làm thế nào để điều tra dịch tễ học về tình hình bệnh truyền nhiễm do virus ở trường học hoặc địa phương? Và làm sao nhân bản hàng ngàn cây lan quý từ một đỉnh sinh trưởng nhỏ bé?',
    theory:
      'ĐIỀU TRA BỆNH TRUYỀN NHIỄM DO VIRUS GÂY RA:\\n' +
      '— Phương pháp dịch tễ cơ bản: Thiết kế phiếu khảo sát, thu thập số liệu từ trạm y tế địa phương, trường học, hộ gia đình về số ca mắc, đối tượng mắc, triệu chứng và đường lây nhiễm.\\n' +
      '— Mục tiêu: Đánh giá thực trạng dịch bệnh, vẽ biểu đồ diễn biến ca bệnh theo thời gian, đề xuất các khuyến nghị vệ sinh dịch tễ phù hợp.\\n\\n' +
      'KỸ THUẬT NHÂN GIỐNG CÂY TRỒNG BẰNG NUÔI CẤY MÔ (TẾ BÀO THỰC VẬT):\\n' +
      'Dựa trên tính toàn năng của tế bào thực vật: Mỗi tế bào sống đều mang toàn bộ lượng thông tin di truyền của loài, dưới điều kiện thích hợp có thể tái biệt hóa hình thành cây con hoàn chỉnh.\\n' +
      '— Quy trình nhân giống cơ bản:\\n' +
      '  1. Chọn và khử trùng mẫu cấy (thường lấy đỉnh sinh trưởng chứa tế bào phân sinh sạch virus).\\n' +
      '  2. Nuôi cấy cảm ứng tạo Callus (mô sẹo): Dùng môi trường dinh dưỡng bổ sung auxin và cytokinin ở tỉ lệ cân bằng.\\n' +
      '  3. Kích thích phát triển chồi: Tăng tỉ lệ hormone Cytokinin so với Auxin.\\n' +
      '  4. Kích thích ra rễ: Tăng tỉ lệ hormone Auxin so với Cytokinin.\\n' +
      '  5. Huấn luyện cây con ngoài vườn ươm trước khi đưa ra trồng đại trà.\\n' +
      '— Ý nghĩa: Tạo ra lượng lớn cây con sạch bệnh, đồng đều mặt di truyền, bảo tồn nguồn gene thực vật quý hiếm.',
    workedExample: {
      problem:
        'Trong môi trường nuôi cấy mô tế bào thực vật (Callus), để điều khiển mô sẹo phát triển ra rễ hoặc ra chồi, người ta điều chỉnh tỉ lệ của hai loại hormone nào?',
      steps: [
        'Xác định hai loại hormone sinh trưởng thực vật chủ đạo trong nuôi cấy mô là Auxin (kích thích phân chia và ra rễ) và Cytokinin (kích thích phân chia và biệt hóa chồi).',
        'Nếu muốn kích thích tạo chồi: Tăng nồng độ Cytokinin cao hơn Auxin.',
        'If muốn kích thích ra rễ: Tăng nồng độ Auxin cao hơn Cytokinin.',
      ],
      answer: 'Điều chỉnh tỉ lệ hormone Auxin (ra rễ) và Cytokinin (ra chồi).',
    },
    checkQuestions: [
      {
        prompt:
          'Hiện tượng mô sẹo (callus) hình thành chồi hay rễ phụ thuộc chủ yếu vào sự điều hòa tỉ lệ giữa hai nhóm hormone nào?',
        choices: [
          { id: 'hm_1', label: 'Auxin và Cytokinin' },
          { id: 'hm_2', label: 'Ethylene và Abscisic acid' },
          { id: 'hm_3', label: 'Gibberellin và Ethylene' },
          { id: 'hm_4', label: 'Auxin và Gibberellin' },
        ],
        answer: { kind: 'choice', correctIds: ['hm_1'] },
        explain:
          'Sự tương tác tỉ lệ giữa Auxin và Cytokinin là nhân tố quyết định hướng biệt hóa mô sẹo thực vật trong nuôi cấy mô tế bào.',
      },
      {
        prompt:
          'Ý nghĩa thực tiễn nổi bật nhất của phương pháp nhân giống vô tính bằng nuôi cấy mô tế bào thực vật là gì?',
        choices: [
          {
            id: 'yn_1',
            label: 'Tạo ra số lượng lớn cây con đồng đều, sạch bệnh từ một mẫu mô nhỏ ban đầu',
          },
          { id: 'yn_2', label: 'Tăng cường tần số đột biến tạo ra nhiều giống hoa mới lạ' },
          {
            id: 'yn_3',
            label: 'Rút ngắn thời gian sinh trưởng sinh dưỡng để cây ra quả ngay lập tức',
          },
          { id: 'yn_4', label: 'Làm biến đổi bộ NST lưỡng bội thành đa bội' },
        ],
        answer: { kind: 'choice', correctIds: ['yn_1'] },
        explain:
          'Nuôi cấy mô tế bào cho phép nhân giống vô tính nhanh chóng, tạo hàng loạt cây con có kiểu gen đồng nhất với cây mẹ ban đầu và có thể chọn mẫu sạch virus để sản xuất giống sạch bệnh.',
      },
    ],
    srsCards: [
      {
        hoi: 'Tỉ lệ Cytokinin / Auxin thế nào sẽ kích thích mô sẹo thực vật phát triển thành chồi?',
        dap: 'Tỉ lệ Cytokinin / Auxin cao (Cytokinin nhiều hơn Auxin).',
      },
      {
        hoi: 'Nguyên lý sinh học cốt lõi của nuôi cấy mô tế bào thực vật là gì?',
        dap: 'Tính toàn năng của tế bào thực vật (totipotency) và khả năng phản biệt hóa, tái biệt hóa của chúng.',
      },
    ],
    reviewStatus: 'draft',
  },
]
