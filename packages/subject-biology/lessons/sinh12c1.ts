// lessons/sinh12c1.ts — Sinh học 12, Phần 5: Di truyền học (Bài 1-19).
import type { BiologyLesson } from '../lessonTypes.js'

export const SINH12_C1_LESSONS: BiologyLesson[] = [
  {
    id: 'sinh12-c1-b1',
    grade: '12',
    chapterNumber: 1,
    chapterTitle: 'Cơ chế di truyền và biến dị',
    lessonNumber: 1,
    title: 'Gen, mã di truyền và nhân đôi ADN',
    hook: 'Làm thế nào một tế bào ban đầu có thể nhân bản chính xác hàng tỷ nucleotit để truyền lại bản thiết kế sự sống cho các tế bào con? Đó là nhờ cơ chế nhân đôi ADN vô cùng chuẩn xác.',
    theory:
      'CẤU TRÚC CỦA GEN:\\n' +
      '— Gen là một đoạn của phân tử ADN mang thông tin mã hóa cho một sản phẩm nhất định (chuỗi polipeptit hoặc phân tử ARN).\\n' +
      '— Cấu trúc vùng mã hóa của gen:\\n' +
      '  + Sinh vật nhân sơ: Vùng mã hóa liên tục (gen không phân mảnh).\\n' +
      '  + Sinh vật nhân thực: Vùng mã hóa không liên tục (gen phân mảnh), xen kẽ giữa các đoạn mã hóa axit amin (exon) là các đoạn không mã hóa (intron).\\n\\n' +
      'MÃ DI TRUYỀN (Genetic code):\\n' +
      '— Mã di truyền là mã bộ ba (codon trên mARN). Có 64 bộ ba, trong đó 61 bộ ba mã hóa cho khoảng 20 loại axit amin.\\n' +
      "— Bộ ba mở đầu: 5'-AUG-3' (mã hóa methionine ở nhân thực, formylmethionine ở nhân sơ).\\n" +
      "— Ba bộ ba kết thúc: 5'-UAA-3', 5'-UAG-3', 5'-UGA-3' (không mã hóa axit amin).\\n" +
      '— Đặc điểm mã di truyền:\\n' +
      '  + Tính liên tục: Mã được đọc từ một điểm xác định theo từng bộ ba, không gối lên nhau.\\n' +
      '  + Tính phổ biến: Tất cả các loài sinh vật đều dùng chung một bộ mã di truyền (trừ vài ngoại lệ).\\n' +
      '  + Tính đặc hiệu: Một bộ ba chỉ mã hóa cho một loại axit amin.\\n' +
      '  + Tính thoái hóa (dư thừa): Nhiều bộ ba khác nhau cùng mã hóa cho một loại axit amin (trừ AUG và UGG).\\n\\n' +
      'QUÁ TRÌNH NHÂN ĐÔI ADN (Tái bản):\\n' +
      'Diễn ra trong pha S của kì trung gian ở tế bào.\\n' +
      '1. Bước 1: Tháo xoắn ADN nhờ enzyme tháo xoắn làm lộ ra chạc chữ Y.\\n' +
      "2. Bước 2: Tổng hợp mạch ADN mới nhờ enzyme ADN polimerase. Nguyên tắc: ADN polimerase chỉ tổng hợp mạch mới theo chiều 5' -> 3' (đọc mạch khuôn 3' -> 5').\\n" +
      "   — Mạch khuôn 3' -> 5': mạch mới được tổng hợp liên tục hướng vào chạc chữ Y.\\n" +
      "   — Mạch khuôn 5' -> 3': mạch mới được tổng hợp gián đoạn thành các đoạn ngắn Okazaki hướng ra ngoài, sau đó được nối lại nhờ enzyme ligase.\\n" +
      '3. Bước 3: Tạo hai phân tử ADN con. Nguyên tắc bán bảo toàn (semiconservative): mỗi ADN con có một mạch cũ của mẹ và một mạch mới tổng hợp.',
    workedExample: {
      problem:
        'Một phân tử ADN xoắn kép có chứa 3000 nucleotit tiến hành nhân đôi liên tiếp 3 lần. Tính số phân tử ADN con được tạo thành và số nucleotit môi trường nội bào cần cung cấp cho quá trình này.',
      steps: [
        'Tính số ADN con tạo ra sau 3 lần nhân đôi: Số ADN con = 2³ = 8 phân tử.',
        'Áp dụng công thức tính số nucleotit môi trường cung cấp: N_mt = N × (2^k - 1), trong đó N là số nu ban đầu (3000), k là số lần nhân đôi (3).',
        'Tính toán: N_mt = 3000 × (2³ - 1) = 3000 × (8 - 1) = 3000 × 7 = 21000 nucleotit.',
      ],
      answer: 'Tạo ra 8 ADN con; môi trường cung cấp 21.000 nucleotit.',
    },
    checkQuestions: [
      {
        prompt:
          'Đặc điểm nào của mã di truyền thể hiện qua việc nhiều bộ ba khác nhau cùng mã hóa cho một loại axit amin?',
        choices: [
          { id: 'md_1', label: 'Tính thoái hóa (dư thừa)' },
          { id: 'md_2', label: 'Tính đặc hiệu' },
          { id: 'md_3', label: 'Tính phổ biến' },
          { id: 'md_4', label: 'Tính liên tục' },
        ],
        answer: { kind: 'choice', correctIds: ['md_1'] },
        explain:
          'Tính thoái hóa nghĩa là một axit amin có thể được mã hóa bởi nhiều bộ ba khác nhau, giúp bảo vệ cơ thể trước các đột biến điểm.',
      },
      {
        prompt:
          'Enzyme nào sau đây trực tiếp thực hiện việc lắp ráp các nucleotit tự do của môi trường vào mạch mới theo nguyên tắc bổ sung trong quá trình nhân đôi ADN?',
        choices: [
          { id: 'ez_1', label: 'ADN polimerase' },
          { id: 'ez_2', label: 'ARN polimerase' },
          { id: 'ez_3', label: 'Ligase' },
          { id: 'ez_4', label: 'Amylase' },
        ],
        answer: { kind: 'choice', correctIds: ['ez_1'] },
        explain:
          "ADN polimerase là enzyme chính xúc tác cho phản ứng gắn các nucleotit tự do triphotphat vào đầu 3'-OH của mạch polynucleotit đang kéo dài.",
      },
    ],
    srsCards: [
      {
        hoi: 'Nêu chiều tổng hợp mạch mới của enzyme ADN polimerase?',
        dap: "Luôn tổng hợp mạch mới theo chiều 5' -> 3' (tương ứng trượt trên mạch khuôn theo chiều 3' -> 5').",
      },
      {
        hoi: 'Thế nào là nguyên tắc bán bảo toàn (bán bảo đi) trong nhân đôi ADN?',
        dap: 'Trong mỗi phân tử ADN con được tạo ra, có một mạch là của ADN mẹ ban đầu và mạch còn lại được tổng hợp mới từ nguyên liệu môi trường.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c1-b2',
    grade: '12',
    chapterNumber: 1,
    chapterTitle: 'Cơ chế di truyền và biến dị',
    lessonNumber: 2,
    title: 'Phiên mã và dịch mã',
    hook: 'Thông tin di truyền lưu trữ trên ADN được chuyển dịch thành cấu trúc protein thực hiện chức năng sinh học thông qua hai bước phiên mã và dịch mã.',
    theory:
      'QUÁ TRÌNH PHIÊN MÃ (Transcription - Tổng hợp ARN):\\n' +
      '— Diễn ra trong nhân tế bào (ở nhân thực) nhờ enzyme ARN polimerase.\\n' +
      "— Diễn biến: ARN polimerase liên kết với vùng khởi động (promoter) của gen, tháo xoắn và trượt dọc mạch khuôn 3' -> 5' của gen để liên kết các ribonucleotit tự do (A, U, G, C) theo nguyên tắc bổ sung (A-U, T-A, G-C, C-G) tạo thành mạch ARN mới theo chiều 5' -> 3'.\\n" +
      '— Xử lý ARN (ở nhân thực): ARN sơ khai bị cắt bỏ các đoạn không mã hóa (intron) và nối các đoạn mã hóa (exon) lại với nhau tạo mARN trưởng thành.\\n\\n' +
      'QUÁ TRÌNH DỊCH MÃ (Translation - Tổng hợp chuỗi polipeptit):\\n' +
      'Diễn ra ở tế bào chất, với sự tham gia của mARN, tARN, ribosome và axit amin tự do.\\n' +
      '1. Bước 1: Hoạt hóa axit amin. Axit amin kết hợp với ATP và liên kết với tARN tương ứng nhờ enzyme đặc hiệu tạo phức hợp aa-tARN.\\n' +
      "2. Bước 2: Dịch mã chuỗi polipeptit. Ribosome gắn vào mARN tại bộ ba mở đầu 5'-AUG-3'. tARN mang axit amin mở đầu tiến vào đối mã bổ sung (UAC).\\n" +
      "   — Ribosome trượt dịch chuyển từng bộ ba dọc theo mARN theo chiều 5' -> 3'. Các phức hợp aa-tARN tiếp theo tiến vào, hình thành liên kết peptit giữa các axit amin.\\n" +
      '   — Khi ribosome tiếp xúc với bộ ba kết thúc (UAA, UAG, UGA), dịch mã dừng lại, chuỗi polipeptit được giải phóng khỏi ribosome.\\n' +
      '3. Bước 3: Cắt bỏ axit amin mở đầu nhờ enzyme chuyên biệt để tạo thành chuỗi polipeptit cấu trúc hoàn chỉnh.',
    workedExample: {
      problem:
        'Một gen cấu trúc ở sinh vật nhân sơ có vùng mã hóa chứa 1800 nucleotit tiến hành phiên mã tạo mARN. mARN này dịch mã tạo protein. Tính số bộ ba mã hóa trên mARN và số axit amin có trong phân tử protein cấu trúc hoàn chỉnh.',
      steps: [
        'Tính số nucleotit trên mạch khuôn mARN: Số nu mARN = N / 2 = 1800 / 2 = 900 nucleotit.',
        'Tính số bộ ba mã hóa: Một bộ ba gồm 3 nu, nên số bộ ba = 900 / 3 = 300 bộ ba.',
        'Tính số axit amin trong chuỗi polipeptit hoàn chỉnh: Số aa = số bộ ba - 1 (bộ ba kết thúc không mã hóa aa) - 1 (axit amin mở đầu bị cắt bỏ sau dịch mã) = 300 - 2 = 298 axit amin.',
      ],
      answer: 'Có 300 bộ ba trên mARN và 298 axit amin trong phân tử protein hoàn chỉnh.',
    },
    checkQuestions: [
      {
        prompt: 'Quá trình phiên mã tổng hợp ARN trong tế bào sử dụng mạch khuôn nào của gen?',
        choices: [
          { id: 'pm_1', label: "Mạch có chiều từ 3' đến 5'" },
          { id: 'pm_2', label: "Mạch có chiều từ 5' đến 3'" },
          { id: 'pm_3', label: 'Cả hai mạch của gen cùng làm khuôn đồng thời' },
          { id: 'pm_4', label: 'Mạch bất kỳ tùy thuộc vào loại enzyme sử dụng' },
        ],
        answer: { kind: 'choice', correctIds: ['pm_1'] },
        explain:
          "Enzyme ARN polimerase chỉ có thể tổng hợp mạch ARN mới theo chiều 5' -> 3', do đó nó bắt buộc phải trượt đọc trên mạch khuôn của gen theo chiều ngược lại là 3' -> 5'.",
      },
      {
        prompt:
          'Phần tử nào đóng vai trò mang bộ ba đối mã (anticodon) vận chuyển axit amin tương ứng tới ribosome trong quá trình dịch mã?',
        choices: [
          { id: 'dm_1', label: 'tARN (ARN vận chuyển)' },
          { id: 'dm_2', label: 'mARN (ARN thông tin)' },
          { id: 'dm_3', label: 'rARN (ARN ribosome)' },
          { id: 'dm_4', label: 'ADN polimerase' },
        ],
        answer: { kind: 'choice', correctIds: ['dm_1'] },
        explain:
          'tARN có một đầu mang axit amin đặc hiệu và một đầu mang bộ ba đối mã (anticodon) bổ sung với codon trên mARN, đóng vai trò như "người phiên dịch".',
      },
    ],
    srsCards: [
      {
        hoi: 'Codon và anticodon nằm trên các phân tử ARN nào?',
        dap: 'Codon nằm trên mARN (ARN thông tin); anticodon nằm trên tARN (ARN vận chuyển).',
      },
      {
        hoi: 'Tại sao ở sinh vật nhân thực, mARN sơ khai phải cắt bỏ intron trước khi dịch mã?',
        dap: 'Vì intron là các đoạn không mang thông tin mã hóa axit amin; chỉ các exon (mạch mã hóa liên tục) mới được nối lại tạo mARN trưởng thành để dịch mã chính xác.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c1-b3',
    grade: '12',
    chapterNumber: 1,
    chapterTitle: 'Cơ chế di truyền và biến dị',
    lessonNumber: 3,
    title: 'Điều hòa biểu hiện gen',
    hook: 'Mỗi tế bào trong cơ thể bạn đều chứa toàn bộ bộ gene giống hệt nhau, nhưng tại sao tế bào mắt lại tổng hợp sắc tố thị giác còn tế bào cơ đùi lại tổng hợp actin? Đó là nhờ cơ chế điều hòa biểu hiện gen.',
    theory:
      'KHÁI NIỆM ĐIỀU HÒA HOẠT ĐỘNG CỦA GEN:\\n' +
      '— Là quá trình điều hòa lượng sản phẩm của gen (ARN hoặc protein) được tạo ra trong tế bào, giúp tế bào tiết kiệm năng lượng và thích nghi tốt với môi trường.\\n\\n' +
      'MÔ HÌNH OPERON LAC Ở VI KHUẨN E. COLI (Jacob và Monod phát hiện):\\n' +
      'Operon là cụm các gen cấu trúc có liên quan về chức năng nằm kề nhau, được phân bố chung một cơ chế điều hòa hoạt động.\\n' +
      '— Cấu trúc Operon Lac gồm:\\n' +
      '  + Vùng khởi động (P - promoter): nơi enzyme ARN polimerase liên kết để khởi đầu phiên mã.\\n' +
      '  + Vùng vận hành (O - operator): vị trí tương tác của protein ức chế để ngăn cản phiên mã.\\n' +
      '  + Nhóm gen cấu trúc (Z, Y, A): mã hóa các enzyme phân giải đường lactose.\\n' +
      '— Gen điều hòa (R): Nằm ngoài operon Lac, chịu trách nhiệm tổng hợp liên tục protein ức chế.\\n\\n' +
      'CƠ CHẾ HOẠT ĐỘNG CỦA OPERON LAC:\\n' +
      '1. Khi môi trường không có lactose:\\n' +
      '   Gen điều hòa (R) tổng hợp protein ức chế. Protein ức chế bám vào vùng vận hành (O), cản trở ARN polimerase liên kết với vùng khởi động (P) → các gen cấu trúc Z, Y, A không phiên mã.\\n' +
      '2. Khi môi trường có lactose:\\n' +
      '   Lactose (chất cảm ứng) liên kết với protein ức chế làm biến đổi cấu trúc không gian của nó, khiến protein ức chế mất khả năng bám vào vùng vận hành (O).\\n   ARN polimerase liên kết tự do với vùng khởi động (P) tiến hành phiên mã nhóm gen Z, Y, A tạo mARN dịch mã ra các enzyme phân giải lactose. Khi lactose bị phân giải hết, protein ức chế lại bám vào vùng O để dừng phiên mã.',
    workedExample: {
      problem:
        'Nếu xảy ra đột biến làm mất chức năng của vùng vận hành (O) trong Operon Lac của vi khuẩn E. coli, điều gì sẽ xảy ra đối với sự biểu hiện của các gen Z, Y, A khi môi trường có hoặc không có đường lactose?',
      steps: [
        'Xác định vai trò của vùng vận hành (O): Là nơi protein ức chế bám vào để tắt operon.',
        'Phân tích đột biến mất chức năng vùng O: Protein ức chế do gen điều hòa R tạo ra không thể bám vào vùng vận hành O nữa.',
        'Kết luận hoạt động: Do protein ức chế không bám được vùng O, enzyme ARN polimerase luôn tự do liên kết với vùng khởi động P và tiến hành phiên mã liên tục. Nhóm gen cấu trúc Z, Y, A sẽ biểu hiện liên tục (phiên mã và dịch mã) bất kể môi trường có hay không có lactose.',
      ],
      answer:
        'Các gen cấu trúc Z, Y, A luôn được phiên mã liên tục bất kể môi trường có hay không có lactose.',
    },
    checkQuestions: [
      {
        prompt:
          'Trong cấu trúc của Operon Lac ở vi khuẩn E. coli, vùng khởi động (P - promoter) có vai trò nào sau đây?',
        choices: [
          {
            id: 'op_1',
            label: 'Là vị trí liên kết của enzyme ARN polimerase để khởi đầu phiên mã',
          },
          { id: 'op_2', label: 'Là nơi protein ức chế bám vào để dừng hoạt động của operon' },
          { id: 'op_3', label: 'Mã hóa trực tiếp các enzyme tiêu hóa đường lactose' },
          { id: 'op_4', label: 'Tổng hợp protein ức chế hoạt động của gen' },
        ],
        answer: { kind: 'choice', correctIds: ['op_1'] },
        explain:
          'Vùng khởi động P là trình diện ADN đặc hiệu nơi ARN polimerase nhận biết và liên kết để bắt đầu trượt dọc operon thực hiện phiên mã.',
      },
      {
        prompt:
          'Chất cảm ứng trong cơ chế hoạt động của Operon Lac ở vi khuẩn E. coli là chất nào dưới đây?',
        choices: [
          { id: 'la_1', label: 'Đường Lactose' },
          { id: 'la_2', label: 'Đường Glucose' },
          { id: 'la_3', label: 'Protein ức chế' },
          { id: 'la_4', label: 'Enzyme ADN polimerase' },
        ],
        answer: { kind: 'choice', correctIds: ['la_1'] },
        explain:
          'Đường lactose đóng vai trò là chất cảm ứng (inducer). Nó liên kết bất hoạt protein ức chế để mở cửa cho operon hoạt động phiên mã.',
      },
    ],
    srsCards: [
      {
        hoi: 'Gen điều hòa (R) có thuộc cấu trúc của Operon Lac không?',
        dap: 'Không. Gen điều hòa R nằm ở phía trước Operon Lac và có promoter riêng, hoạt động độc lập với operon.',
      },
      {
        hoi: 'Tại sao protein ức chế không bám được vào vùng vận hành khi có lactose?',
        dap: 'Vì lactose liên kết trực tiếp với protein ức chế, làm thay đổi cấu hình không gian ba chiều của nó khiến nó không tương thích bám vào vùng O nữa.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c1-b4',
    grade: '12',
    chapterNumber: 1,
    chapterTitle: 'Cơ chế di truyền và biến dị',
    lessonNumber: 4,
    title: 'Đột biến gen',
    hook: 'Một sự thay đổi chỉ một nucleotit duy nhất trong hàng triệu cặp nucleotit của gen có thể gây ra bệnh hồng cầu hình liềm nguy hiểm, nhưng cũng có thể tạo ra những tính trạng mới tuyệt vời cho tiến hóa.',
    theory:
      'KHÁI NIỆM ĐỘT BIẾN GEN:\\n' +
      '— Đột biến gen là những biến đổi trong cấu trúc của gen, liên quan đến một hoặc một số cặp nucleotit (đột biến điểm là đột biến chỉ liên quan đến 1 cặp nucleotit).\\n' +
      '— Alen đột biến: Trạng thái mới của gen sau khi bị đột biến. Thể đột biến là cá thể mang gen đột biến đã biểu hiện ra kiểu hình.\\n\\n' +
      'CÁC DẠNG ĐỘT BIẾN ĐIỂM CHÍNH:\\n' +
      '1. Thay thế một cặp nucleotit (ví dụ thay A-T bằng G-C):\\n' +
      '   — Có thể làm thay đổi 1 axit amin trong chuỗi polipeptit (đột biến sai nghĩa), hoặc làm xuất hiện bộ ba kết thúc sớm (đột biến vô nghĩa), hoặc không đổi axit amin do tính thoái hóa (đột biến đồng nghĩa/im lặng).\\n' +
      '2. Mất một cặp nucleotit hoặc Thêm một cặp nucleotit:\\n' +
      '   — Gây ra hiện tượng dịch khung đọc mã di truyền (frameshift) kể từ điểm xảy ra đột biến, làm thay đổi toàn bộ trình tự axit amin phía sau, thường làm hỏng chức năng protein.\\n\\n' +
      'NGUYÊN NHÂN VÀ CƠ CHẾ PHÁT SINH:\\n' +
      '— Nguyên nhân: Tác nhân vật lý (tia tử ngoại UV, tia phóng xạ), tác nhân hóa học (5-bromuracil 5-BU gây thay thế A-T thành G-C), hoặc các tác nhân sinh học (virus) và sự rối loạn tự nhiên trong nhân đôi ADN.\\n\\n' +
      'VAI TRÒ VÀ Ý NGHĨA:\\n' +
      '— Đối với tiến hóa: Đột biến gen là nguồn nguyên liệu sơ cấp chủ yếu cung cấp các alen mới cho quá trình chọn lọc tự nhiên.\\n' +
      '— Đối với thực tiễn: Tạo ra các đột biến có lợi ở thực vật để chọn giống.',
    workedExample: {
      problem:
        'Một gen cấu trúc có chiều dài 5100 Å có số liên kết hydrogen là 3900. Sau khi bị đột biến điểm dạng thay thế một cặp nucleotit, gen đột biến có 3901 liên kết hydrogen. Xác định số lượng từng loại nucleotit của gen ban đầu và gen đột biến.',
      steps: [
        'Tính tổng số nucleotit của gen (N): N = (2 × L) / 3.4 = (2 × 5100) / 3.4 = 3000 nucleotit.',
        'Tính số nu từng loại của gen ban đầu: Ta có hệ phương trình: 2A + 2G = 3000 và 2A + 3G = 3900. Giải hệ thu được: G = C = 900; A = T = 1500 - 900 = 600 nucleotit.',
        'Xác định dạng đột biến điểm: Gen đột biến tăng 1 liên kết hydro (từ 3900 lên 3901) do thay thế 1 cặp nucleotit. Vì cặp G-X có 3 liên kết hydro, cặp A-T có 2 liên kết hydro, đột biến làm tăng 1 liên kết hydro chính là thay thế 1 cặp A-T bằng 1 cặp G-X.',
        'Tính số nu từng loại của gen đột biến: A_đb = T_đb = 600 - 1 = 599 nucleotit; G_đb = C_đb = 900 + 1 = 901 nucleotit.',
      ],
      answer: 'Gen ban đầu: A=T=600, G=C=900; Gen đột biến: A=T=599, G=C=901.',
    },
    checkQuestions: [
      {
        prompt:
          'Hóa chất 5-bromuracil (5-BU) thường gây ra dạng đột biến gen nào sau đây qua các lần nhân đôi ADN?',
        choices: [
          { id: 'bu_1', label: 'Thay thế cặp A-T bằng cặp G-X' },
          { id: 'bu_2', label: 'Mất một cặp A-T' },
          { id: 'bu_3', label: 'Thêm một cặp G-X' },
          { id: 'bu_4', label: 'Thay thế cặp G-X bằng cặp A-T' },
        ],
        answer: { kind: 'choice', correctIds: ['bu_1'] },
        explain:
          '5-BU là chất đồng đẳng của thymine, khi xen vào mạch ADN sẽ gây bắt cặp nhầm lẫn dẫn đến thay thế cặp A-T bằng G-X sau 3 lần nhân đôi.',
      },
      {
        prompt:
          'Dạng đột biến điểm nào sau đây làm dịch khung đọc mã di truyền và thay đổi toàn bộ chuỗi axit amin kể từ điểm đột biến?',
        choices: [
          { id: 'dk_1', label: 'Mất hoặc thêm một cặp nucleotit' },
          { id: 'dk_2', label: 'Thay thế một cặp nucleotit này bằng một cặp khác' },
          { id: 'dk_3', label: 'Đột biến đồng nghĩa' },
          { id: 'dk_4', label: 'Đột biến đảo vị trí hai cặp nucleotit bất kỳ' },
        ],
        answer: { kind: 'choice', correctIds: ['dk_1'] },
        explain:
          'Mất hoặc thêm một cặp nucleotit làm thay đổi trật tự đọc của các bộ ba kể từ vị trí đột biến, gây đột biến dịch khung đọc mã di truyền.',
      },
    ],
    srsCards: [
      {
        hoi: 'Thể đột biến là gì?',
        dap: 'Là những cá thể mang gene đột biến đã được biểu hiện ra kiểu hình của cơ thể.',
      },
      {
        hoi: 'Tại sao đột biến thay thế cặp nucleotit ít gây hậu quả nghiêm trọng hơn đột biến thêm/mất?',
        dap: 'Vì thay thế chỉ làm thay đổi tối đa một axit amin tại bộ ba bị đột biến, không làm dịch khung đọc mã di truyền của toàn bộ gen phía sau.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c1-b5',
    grade: '12',
    chapterNumber: 1,
    chapterTitle: 'Cơ chế di truyền và biến dị',
    lessonNumber: 5,
    title: 'Nhiễm sắc thể và đột biến cấu trúc nhiễm sắc thể',
    hook: 'Nhiễm sắc thể đóng vai trò như những chiếc tủ lưu trữ tài liệu ADN khổng lồ. Một sự đứt gãy, trao đổi nhầm lẫn các đoạn nhiễm sắc thể sẽ gây ra những biến đổi lớn về kiểu hình sinh vật.',
    theory:
      'CẤU TRÚC SIÊU VI THỂ CỦA NHIỄM SẮC THỂ (ở nhân thực):\\n' +
      '— Sợi nhiễm sắc cấu tạo từ chất nhiễm sắc (ADN quấn quanh các hạt protein histone tạo nucleosome).\\n' +
      '— Mỗi nucleosome gồm 8 phân tử protein histone được quấn quanh bởi 1.75 vòng ADN (khoảng 146 cặp nucleotit).\\n' +
      '— Các cấp độ co xoắn của NST:\\n  + Sợi cơ bản (đường kính 11 nm) → Sợi nhiễm sắc (30 nm) → Sợi siêu xoắn (300 nm) → Cromatid (700 nm) → NST ở kì giữa co xoắn cực đại (1400 nm).\\n\\n' +
      'CÁC DẠNG ĐỘT BIẾN CẤU TRÚC NHIỄM SẮC THỂ:\\n' +
      'Là những biến đổi trong cấu trúc của NST, gồm 4 dạng chính:\\n' +
      '1. Mất đoạn (Deletion): Một đoạn NST bị đứt ra và mất đi.\\n   — Hậu quả: Làm giảm số lượng gen trên NST, thường gây chết hoặc giảm sức sống (ở người, mất đoạn vai ngắn NST số 5 gây hội chứng tiếng mèo kêu, mất đoạn NST số 21 gây ung thư máu).\\n' +
      '2. Lặp đoạn (Duplication): Một đoạn NST được lặp lại một hay nhiều lần.\\n   — Hậu quả: Làm tăng số lượng bản sao của gen, tăng cường hoặc giảm biểu hiện tính trạng (ở lúa mì, lặp đoạn enzym amilase làm tăng hoạt tính phân giải tinh bột tốt cho sản xuất bia).\\n' +
      '3. Đảo đoạn (Inversion): Một đoạn NST bị đứt ra, quay 180 độ rồi gắn lại vào vị trí cũ.\\n   — Hậu quả: Không làm thay đổi số lượng gen, chỉ thay đổi trật tự sắp xếp của gen trên NST, ít ảnh hưởng sức sống, tạo sự đa dạng giữa các nòi trong loài.\\n' +
      '4. Chuyển đoạn (Translocation): Sự trao đổi đoạn giữa các NST không tương đồng (chuyển đoạn tương hỗ, không tương hỗ) hoặc chuyển đoạn trên cùng một NST.\\n   — Hậu quả: Thay đổi nhóm gen liên kết, thường gây giảm khả năng sinh sản (thừa hoặc thiếu gen ở giao tử con).',
    workedExample: {
      problem:
        'Một nhiễm sắc thể có trình tự các gen ban đầu là ABCDE*FGH (dấu * đại diện cho tâm động). Hãy xác định dạng đột biến cấu trúc nhiễm sắc thể trong hai trường hợp sau:\\n1. Nhiễm sắc thể đột biến có trình tự gen: ABDE*FGH\\n2. Nhiễm sắc thể đột biến có trình tự gen: ADCBE*FGH',
      steps: [
        'Phân tích trường hợp 1: Trình tự ban đầu có gen C nằm giữa B và D (ABCDE*FGH). Trình tự đột biến biến mất gen C (ABDE*FGH). Đây là dạng đột biến mất đoạn nhiễm sắc thể (mất đoạn chứa gen C).',
        'Phân tích trường hợp 2: Trình tự đột biến là ADCBE*FGH. So sánh với ban đầu (ABCDE*FGH), đoạn chứa các gen BCD bị đảo ngược trật tự thành DCB. Đây là dạng đột biến đảo đoạn nhiễm sắc thể (đảo đoạn BCD 180 độ).',
      ],
      answer: '1. Đột biến mất đoạn gen C; 2. Đột biến đảo đoạn chứa gen BCD.',
    },
    checkQuestions: [
      {
        prompt:
          'Mức cấu trúc co xoắn nào sau đây của nhiễm sắc thể nhân thực có đường kính sợi đo được là 30 nm?',
        choices: [
          { id: 'ns_1', label: 'Sợi nhiễm sắc (Sợi chất nhiễm sắc)' },
          { id: 'ns_2', label: 'Sợi cơ bản (chuỗi nucleosome)' },
          { id: 'ns_3', label: 'Sợi siêu xoắn' },
          { id: 'ns_4', label: 'Cromatid kì giữa' },
        ],
        answer: { kind: 'choice', correctIds: ['ns_1'] },
        explain:
          'Sợi cơ bản có đường kính 11 nm. Sợi nhiễm sắc co xoắn bậc 2 có đường kính 30 nm. Sợi siêu xoắn có đường kính 300 nm và cromatid là 700 nm.',
      },
      {
        prompt:
          'Bệnh tiếng mèo kêu (cri du chat) ở người do dạng đột biến cấu trúc nhiễm sắc thể nào gây ra?',
        choices: [
          { id: 'mk_1', label: 'Mất đoạn nhiễm sắc thể số 5' },
          { id: 'mk_2', label: 'Lặp đoạn nhiễm sắc thể số 21' },
          { id: 'mk_3', label: 'Đảo đoạn nhiễm sắc thể số 9' },
          { id: 'mk_4', label: 'Chuyển đoạn tương hỗ giữa NST số 22 và số 9' },
        ],
        answer: { kind: 'choice', correctIds: ['mk_1'] },
        explain:
          'Hội chứng tiếng mèo kêu do đột biến mất một phần vai ngắn của nhiễm sắc thể số 5 ở người, biểu hiện trẻ sơ sinh khóc có âm thanh giống tiếng mèo kêu và chậm phát triển trí tuệ.',
      },
    ],
    srsCards: [
      {
        hoi: 'Đơn vị cấu trúc cơ bản của nhiễm sắc thể nhân thực là gì?',
        dap: 'Nucleosome, gồm một lõi 8 phân tử protein histone được quấn quanh bởi khoảng 146 cặp nucleotit ADN.',
      },
      {
        hoi: 'Dạng đột biến cấu trúc NST nào không làm thay đổi số lượng gen trên NST đó?',
        dap: 'Đột biến đảo đoạn và đột biến chuyển đoạn trên cùng một nhiễm sắc thể (chỉ làm thay đổi trật tự sắp xếp gen).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c1-b6',
    grade: '12',
    chapterNumber: 1,
    chapterTitle: 'Cơ chế di truyền và biến dị',
    lessonNumber: 6,
    title: 'Đột biến số lượng nhiễm sắc thể',
    hook: 'Đột biến số lượng nhiễm sắc thể có thể tạo ra những quả dưa hấu không hạt tam bội mọng nước, nhưng ở người, nó cũng gây ra hội chứng Down do thừa một nhiễm sắc thể số 21.',
    theory:
      'KHÁI NIỆM ĐỘT BIẾN SỐ LƯỢNG NHIỄM SẮC THỂ:\\n' +
      'Là sự biến đổi về số lượng NST xảy ra ở một hoặc một số cặp NST tương đồng (lệch bội) hoặc ở toàn bộ các cặp NST (đa bội).\\n\\n' +
      'ĐỘT BIẾN LỆCH BỘI (Aneuploidy):\\n' +
      '— Xảy ra do sự không phân li của một hoặc một số cặp NST trong giảm phân tạo giao tử không bình thường (giao tử n+1 hoặc n-1).\\n' +
      '— Các dạng phổ biến:\\n  + Thể một (Monosomy, 2n - 1): Thiếu 1 NST ở một cặp tương đồng (ví dụ hội chứng Turner XO ở người).\\n  + Thể ba (Trisomy, 2n + 1): Thừa 1 NST ở một cặp tương đồng (ví dụ hội chứng Down có 3 NST số 21, hội chứng Klinefelter XXY).\\n\\n' +
      'ĐỘT BIẾN ĐA BỘI (Polyploidy):\\n' +
      '1. Tự đa bội (Autopolyploidy): Tăng số bộ NST đơn bộ của cùng một loài.\\n   — Đa bội lẻ (3n, 5n...): Cơ thể hầu như không có khả năng sinh sản hữu tính bình thường do tế bào giảm phân rối loạn không tạo được giao tử cân bằng (ứng dụng tạo quả không hạt như dưa hấu 3n, nho 3n).\\n   — Đa bội chẵn (4n, 6n...): Cơ thể sinh trưởng mạnh, cơ quan sinh dưỡng lớn (lá to, quả to), chống chịu tốt.\\n2. Dị đa bội (Allopolyploidy): Bộ NST tăng lên chứa hai hay nhiều bộ NST của các loài khác nhau (hình thành nhờ lai xa kết hợp đa bội hóa, tạo thể song nhị bội 2n_A + 2n_B).',
    workedExample: {
      problem:
        'Ở loài cà chua có bộ nhiễm sắc thể lưỡng bội 2n = 24. Hãy tính số lượng nhiễm sắc thể có trong tế bào sinh dưỡng của các thể đột biến sau:\\n1. Thể một\\n2. Thể ba\\n3. Thể tam bội',
      steps: [
        'Xác định công thức nhiễm sắc thể thể một: Công thức là 2n - 1. Số NST = 24 - 1 = 23 NST.',
        'Xác định công thức nhiễm sắc thể thể ba: Công thức là 2n + 1. Số NST = 24 + 1 = 25 NST.',
        'Xác định công thức nhiễm sắc thể thể tam bội: Công thức là 3n. Biết 2n = 24 -> n = 12. Số NST = 3 × 12 = 36 NST.',
      ],
      answer: '1. Thể một có 23 NST; 2. Thể ba có 25 NST; 3. Thể tam bội có 36 NST.',
    },
    checkQuestions: [
      {
        prompt: 'Hội chứng Down ở người do đột biến lệch bội dạng nào sau đây gây ra?',
        choices: [
          { id: 'lb_1', label: 'Thể ba ở cặp nhiễm sắc thể số 21 (47, XX hoặc XY, +21)' },
          { id: 'lb_2', label: 'Thể một ở cặp nhiễm sắc thể giới tính (45, XO)' },
          { id: 'lb_3', label: 'Thể ba ở cặp nhiễm sắc thể giới tính (47, XXY)' },
          { id: 'lb_4', label: 'Thể tam bội ở tất cả các cặp nhiễm sắc thể (3n = 69)' },
        ],
        answer: { kind: 'choice', correctIds: ['lb_1'] },
        explain:
          'Người mắc hội chứng Down có 3 nhiễm sắc thể ở cặp số 21 (thay vì 2 chiếc bình thường), dẫn đến tổng số NST trong tế bào sinh dưỡng là 47 chiếc.',
      },
      {
        prompt:
          'Tại sao các giống cây trồng tam bội (3n) như dưa hấu 3n, nho 3n thường không có hạt?',
        choices: [
          {
            id: 'kh_1',
            label: 'Do bộ NST lẻ làm cản trở quá trình giảm phân bình thường tạo giao tử hợp lệ',
          },
          { id: 'kh_2', label: 'Do hoa của cây tam bội không có nhụy để thụ phấn' },
          { id: 'kh_3', label: 'Do chất dinh dưỡng tập trung hết vào thịt quả' },
          { id: 'kh_4', label: 'Do xử lý chất gây đột biến làm hạt tiêu biến tự phát' },
        ],
        answer: { kind: 'choice', correctIds: ['kh_1'] },
        explain:
          'Tế bào tam bội 3n có bộ NST lẻ, khi giảm phân các NST tương đồng không thể bắt cặp tương đồng và phân li đồng đều về hai cực, dẫn đến giao tử bị bất thụ (không thụ tinh tạo hạt được).',
      },
    ],
    srsCards: [
      {
        hoi: 'Phân biệt thể lệch bội và thể đa bội?',
        dap: 'Lệch bội là biến đổi số lượng NST xảy ra ở một hoặc một số cặp tương đồng. Đa bội là biến đổi xảy ra ở toàn bộ các cặp NST trong tế bào.',
      },
      {
        hoi: 'Thế song nhị bội (allodiploid) là gì và hình thành như thế nào?',
        dap: 'Là thể dị đa bội mang bộ NST lưỡng bội của hai loài khác nhau (2n_A + 2n_B), được hình thành bằng con đường lai xa kết hợp đa bội hóa.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c1-b7',
    grade: '12',
    chapterNumber: 1,
    chapterTitle: 'Cơ chế di truyền và biến dị',
    lessonNumber: 7,
    title: 'Thực hành: Quan sát tiêu bản nhiễm sắc thể và đột biến nhiễm sắc thể',
    hook: 'Dưới kính hiển vi quang học, chúng ta có thể trực tiếp quan sát bộ nhiễm sắc thể của tế bào đang phân chia và phát hiện các đột biến hình thái hoặc số lượng của chúng.',
    theory:
      'PHƯƠNG PHÁP QUAN SÁT NST Ở TẾ BÀO ĐANG PHÂN CHIA:\\n' +
      '— Nguyên liệu tốt nhất: Tế bào đang ở kì giữa (metaphase) của nguyên phân hoặc giảm phân (do kì giữa NST co xoắn cực đại, nhìn thấy rõ hình thái dạng kép gồm 2 cromatid chung tâm động).\\n' +
      '— Nhuộm màu tiêu bản: Sử dụng các loại thuốc nhuộm kiềm tính liên kết đặc hiệu với ADN (như aceto-carmine hoặc orcein) để NST bắt màu đậm (đỏ/tím).\\n\\n' +
      'PHƯƠNG PHÁP NHẬN DIỆN TIÊU BẢN ĐỘT BIẾN NST:\\n' +
      '1. Tiêu bản tế bào rễ hành ta (nguyên phân): Quan sát các kì nguyên phân và đếm số lượng NST (2n = 16). Phát hiện tế bào lệch bội nếu đếm thừa hoặc thiếu chiếc.\\n' +
      '2. Tiêu bản nhiễm sắc thể khổng lồ ở tuyến nước bọt ấu trùng ruồi giấm (Drosophila):\\n   — NST khổng lồ hình thành do nhân đôi ADN nhiều lần mà tế bào không phân chia.\\n   — Nhuộm bằng orcein thấy các vạch sáng tối rõ nét. Phát hiện đột biến cấu trúc NST như mất đoạn, lặp đoạn (làm thay đổi độ dài, số vạch) hoặc đảo đoạn (vòng đảo đoạn).',
    workedExample: {
      problem:
        'Tại sao khi làm tiêu bản quan sát nhiễm sắc thể, người ta thường cố gắng chọn các tế bào đang ở kì giữa của quá trình phân bào?',
      steps: [
        'Xét trạng thái co xoắn của NST: Trong chu kỳ tế bào, NST biến đổi từ trạng thái dãn xoắn hoàn toàn ở kì trung gian đến co xoắn tăng dần ở kì đầu.',
        'Kì giữa co xoắn tối đa: Tại kì giữa, các NST co xoắn cực đại để chuẩn bị cho sự phân li, làm tăng độ dày và làm rõ ranh giới hình thái đặc trưng (tâm động, cánh ngắn, cánh dài).',
        'Sự phân bố: NST kì giữa xếp hàng trên mặt phẳng xích đạo giúp dễ chụp ảnh, đếm số lượng và so sánh kích thước phục vụ phân tích karyotype bệnh học.',
      ],
      answer:
        'Vì ở kì giữa NST co xoắn cực đại, nhìn rõ nhất hình thái cấu trúc đặc trưng và số lượng NST.',
    },
    checkQuestions: [
      {
        prompt:
          'Để nhuộm màu đặc hiệu giúp hiển thị rõ cấu trúc nhiễm sắc thể dưới kính hiển vi, người ta sử dụng hóa chất nào dưới đây?',
        choices: [
          { id: 'tb_1', label: 'Thuốc nhuộm Orcein hoặc Aceto-carmine' },
          { id: 'tb_2', label: 'Dung dịch nước vôi trong Ca(OH)₂' },
          { id: 'tb_3', label: 'Cồn tuyệt đối 99 độ' },
          { id: 'tb_4', label: 'Dung dịch thuốc thử Benedict' },
        ],
        answer: { kind: 'choice', correctIds: ['tb_1'] },
        explain:
          'Aceto-carmine và Orcein là các phẩm nhuộm kiềm tính có ái lực liên kết cao với chất nhiễm sắc chứa axit nucleic trong nhân tế bào, nhuộm NST thành màu đỏ/đỏ tía.',
      },
      {
        prompt:
          'Đặc điểm nào của NST ở tuyến nước bọt ấu trùng ruồi giấm giúp chúng ta dễ dàng quan sát thấy các đột biến đảo đoạn, lặp đoạn?',
        choices: [
          {
            id: 'rg_1',
            label: 'Kích thước siêu lớn (nhiễm sắc thể khổng lồ) với các vạch băng ngang đặc trưng',
          },
          { id: 'rg_2', label: 'Chúng có số lượng rất ít (chỉ có 2 chiếc)' },
          { id: 'rg_3', label: 'Chúng tự phát sáng trong bóng tối' },
          { id: 'rg_4', label: 'Chúng không có tâm động' },
        ],
        answer: { kind: 'choice', correctIds: ['rg_1'] },
        explain:
          'NST khổng lồ ở tuyến nước bọt ruồi giấm lớn gấp hàng trăm lần NST bình thường, có cấu trúc các vạch sáng tối (vạch băng) rất rõ, dễ dàng nhận ra các lỗi cấu trúc khi các vạch này bị đảo hoặc lặp đoạn.',
      },
    ],
    srsCards: [
      {
        hoi: 'Tại sao phải nhuộm NST bằng thuốc nhuộm kiềm tính?',
        dap: 'Vì ADN trong NST mang điện tích âm (tính axit), sẽ liên kết mạnh với các phân tử thuốc nhuộm mang điện tích dương (kiềm tính), giúp bắt màu đậm rõ rệt.',
      },
      {
        hoi: 'Kể tên kì phân bào dễ đếm số lượng NST nhất?',
        dap: 'Kì giữa (Metaphase) của nguyên phân hoặc giảm phân.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c2-b8',
    grade: '12',
    chapterNumber: 2,
    chapterTitle: 'Tính quy luật của hiện tượng di truyền',
    lessonNumber: 8,
    title: 'Học thuyết di truyền của Mendel',
    hook: 'Gregor Mendel đã lai hàng vạn cây đậu hà lan trong vườn tu viện để tìm ra những quy luật toán học thống trị sự di truyền tính trạng—nền móng cho toàn bộ ngành Di truyền học hiện đại.',
    theory:
      'PHƯƠNG PHÁP NGHIÊN CỨU CỦA MENDEL:\\n' +
      '— Phương pháp phân tích các thế hệ lai (độc đáo):\\n  1. Chọn đối tượng nghiên cứu thuần chủng, tự thụ phấn nghiêm ngặt và có các cặp tính trạng tương phản rõ rệt (đậu Hà Lan).\\n  2. Lai các cặp bố mẹ thuần chủng khác nhau về một hoặc một số cặp tính trạng rồi theo dõi F₁, F₂ và F₃.\\n  3. Sử dụng toán thống kê để phân tích số liệu thu được, từ đó rút ra quy luật di truyền.\\n\\n' +
      'QUY LUẬT PHÂN LI (Lai một cặp tính trạng):\\n' +
      '— Thí nghiệm: Lai P thuần chủng Hạt vàng × Hạt xanh → F₁: 100% Hạt vàng. Cho F₁ tự thụ phấn → F₂: Tỉ lệ kiểu hình xấp xỉ 3 Hạt vàng : 1 Hạt xanh.\\n' +
      '— Nội dung quy luật: Mỗi tính trạng được quy định bởi một cặp nhân tố di truyền (sau này gọi là alen). Trong tế bào sinh dưỡng, các nhân tố di truyền tồn tại thành từng cặp và không hòa trộn vào nhau. Khi giảm phân tạo giao tử, mỗi nhân tố di truyền trong cặp phân li đồng đều về các giao tử (giao tử thuần khiết).\\n\\n' +
      'QUY LUẬT PHÂN LI ĐỘC LẬP (Lai hai cặp tính trạng):\\n' +
      '— Thí nghiệm: P thuần chủng Hạt vàng, trơn × Hạt xanh, nhăn → F₁: 100% Hạt vàng, trơn. F₁ tự thụ phấn → F₂: Tỉ lệ kiểu hình 9 vàng, trơn : 3 vàng, nhăn : 3 xanh, trơn : 1 xanh, nhăn.\\n' +
      '— Nội dung quy luật: Các cặp nhân tố di truyền quy định các tính trạng khác nhau phân li độc lập với nhau trong quá trình hình thành giao tử.\\n  + Điều kiện: Các gen quy định các tính trạng phải nằm trên các cặp nhiễm sắc thể tương đồng khác nhau.',
    workedExample: {
      problem:
        'Cho biết gen A quy định hạt vàng trội hoàn toàn so với gen a quy định hạt xanh; gen B quy định vỏ trơn trội hoàn toàn so với gen b quy định vỏ nhăn. Hai cặp gen này nằm trên hai cặp NST tương đồng khác nhau. Hãy viết tỉ lệ phân li kiểu gen và kiểu hình ở đời con của phép lai: AaBb × Aabb.',
      steps: [
        'Tách riêng từng cặp gen để lai: Phép lai tương đương (Aa × Aa) và (Bb × bb).',
        'Xét cặp 1 (Aa × Aa): Đời con có tỉ lệ kiểu gen là 1/4 AA : 2/4 Aa : 1/4 aa (tỉ lệ 1:2:1); tỉ lệ kiểu hình là 3/4 vàng : 1/4 xanh (tỉ lệ 3:1).',
        'Xét cặp 2 (Bb × bb): Đây là phép lai phân tích, đời con có tỉ lệ kiểu gen là 1/2 Bb : 1/2 bb (tỉ lệ 1:1); tỉ lệ kiểu hình là 1/2 trơn : 1/2 nhăn (tỉ lệ 1:1).',
        'Nhân tổ hợp kết quả của 2 cặp gen (vì chúng phân li độc lập):\\n  + Tỉ lệ kiểu gen: (1 AA : 2 Aa : 1 aa) × (1 Bb : 1 bb) = 1 AABb : 1 Aabb : 2 AaBb : 2 Aabb : 1 aaBb : 1 aabb.\\n  + Tỉ lệ kiểu hình: (3 vàng : 1 xanh) × (1 trơn : 1 nhăn) = 3 vàng, trơn : 3 vàng, nhăn : 1 xanh, trơn : 1 xanh, nhăn.',
      ],
      answer:
        'Tỉ lệ kiểu gen: 1:1:2:2:1:1; Tỉ lệ kiểu hình: 3 vàng, trơn : 3 vàng, nhăn : 1 xanh, trơn : 1 xanh, nhăn.',
    },
    checkQuestions: [
      {
        prompt:
          'Khi lai bố mẹ thuần chủng khác nhau về một cặp tính trạng tương phản thu được F₁ đồng tính trội, cho F₁ tự thụ phấn thu được F₂ phân li kiểu hình theo tỉ lệ trung bình là:',
        choices: [
          { id: 'pl_1', label: '3 trội : 1 lặn' },
          { id: 'pl_2', label: '1 trội : 1 lặn' },
          { id: 'pl_3', label: '9 trội : 7 lặn' },
          { id: 'pl_4', label: '1 trội : 2 trung gian : 1 lặn' },
        ],
        answer: { kind: 'choice', correctIds: ['pl_1'] },
        explain:
          'Theo quy luật phân li của Mendel, phép lai P: AA x aa -> F1: Aa -> F2 tự thụ phân li kiểu hình 3 trội (AA, Aa) : 1 lặn (aa).',
      },
      {
        prompt:
          'Để các cặp gen quy định các tính trạng khác nhau phân li độc lập với nhau trong giảm phân, điều kiện cần thiết là gì?',
        choices: [
          {
            id: 'pll_1',
            label: 'Các gen phải nằm trên các cặp nhiễm sắc thể tương đồng khác nhau',
          },
          { id: 'pll_2', label: 'Các gen phải nằm sát nhau trên cùng một nhiễm sắc thể' },
          { id: 'pll_3', label: 'Bố và mẹ phải có kiểu gen dị hợp tử hoàn toàn' },
          { id: 'pll_4', label: 'Số lượng nhiễm sắc thể trong tế bào phải là số lẻ' },
        ],
        answer: { kind: 'choice', correctIds: ['pll_1'] },
        explain:
          'Mendel phát biểu quy luật phân li độc lập dựa trên việc các gen nằm trên các cặp NST khác nhau, sự phân li của cặp NST này không ảnh hưởng đến sự phân li của cặp NST kia.',
      },
    ],
    srsCards: [
      {
        hoi: 'Phép lai phân tích (test cross) là gì?',
        dap: 'Là phép lai giữa cá thể mang tính trạng trội cần xác định kiểu gen với cá thể mang tính trạng lặn thuần chủng để kiểm tra kiểu gen trội là đồng hợp hay dị hợp.',
      },
      {
        hoi: 'Nêu ý nghĩa cốt lõi của quy luật giao tử thuần khiết của Mendel?',
        dap: 'Trong tế bào giao tử, các nhân tố di truyền (alen) phân li đồng đều, mỗi giao tử chỉ chứa duy nhất một nhân tố di truyền của cặp tương ứng.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c2-b9',
    grade: '12',
    chapterNumber: 2,
    chapterTitle: 'Tính quy luật của hiện tượng di truyền',
    lessonNumber: 9,
    title: 'Tương tác gen và tác động đa hiệu của gen',
    hook: 'Không phải lúc nào một gen cũng chỉ quyết định một tính trạng. Đôi khi nhiều gen cùng bắt tay nhau để tạo nên màu sắc của một bông hoa, hoặc một gen đơn độc lại chi phối hàng loạt đặc điểm trên cơ thể.',
    theory:
      'TƯƠNG TÁC GEN (Gene interaction):\\n' +
      'Là sự tác động qua lại giữa các gen không alen (nằm ở các lôcut khác nhau) trong quá trình hình thành kiểu hình tính trạng.\\n' +
      '1. Tương tác bổ trợ (Complementary interaction):\\n' +
      '   — Hai hay nhiều gen không alen cùng có mặt sẽ tương tác biểu hiện kiểu hình mới khác biệt.\\n   — Ví dụ lai hoa dẹt ở bí F₂ phân li tỉ lệ: 9 dẹt : 6 tròn : 1 dài (tương tác bổ trợ 9:6:1), hoặc ở hoa màu F₂: 9 đỏ : 7 trắng (tương tác bổ trợ 9:7).\\n' +
      '2. Tương tác cộng gộp (Cumulative interaction):\\n' +
      '   — Mỗi alen trội (của bất kỳ locus nào tham gia) đóng góp một lượng ngang nhau vào sự gia tăng biểu hiện của kiểu hình tính trạng.\\n   — Thường gặp ở các tính trạng số lượng (màu da người, năng suất sữa, chiều cao). Ví dụ: da người do 3 cặp gen tương tác cộng gộp quy định.\\n\\n' +
      'TÁC ĐỘNG ĐA HIỆU CỦA GEN (Pleiotropy):\\n' +
      '— Là hiện tượng một gen đột biến hoặc bình thường chi phối sự biểu hiện của nhiều tính trạng khác nhau trên cơ thể sinh vật.\\n' +
      '— Cơ chế: Gen kiểm soát tổng hợp một loại sản phẩm (ví dụ một enzyme) tham gia vào nhiều con đường chuyển hóa khác nhau.\\n  + Ví dụ ở người: Gen đột biến gây hội chứng Marfan làm ngón tay ngón chân dài nhện, thủy tinh thể bị lệch, thành động mạch chủ bị suy yếu; gen đột biến huyết sắc tố hồng cầu hình liềm gây thiếu máu, tổn thương thận, lách, não.',
    workedExample: {
      problem:
        'Ở một loài hoa, khi lai hai dòng hoa trắng thuần chủng với nhau thu được F₁ 100% hoa đỏ. Cho F₁ tự thụ phấn thu được F₂ phân li theo tỉ lệ kiểu hình: 9 hoa đỏ : 7 hoa trắng. Hãy giải thích quy luật di truyền chi phối tính trạng màu hoa và viết kiểu gen quy định kiểu hình hoa đỏ ở F₂.',
      steps: [
        'Phân tích tỉ lệ F₂: Tỉ lệ 9 đỏ : 7 trắng có tổng tổ hợp bằng 16 (9 + 7 = 16). Điều này chứng tỏ F₁ dị hợp tử về 2 cặp gen phân li độc lập (AaBb × AaBb).',
        'Xác định quy luật di truyền: Tỉ lệ kiểu hình 9:7 là dạng biến đổi của tỉ lệ 9:3:3:1 của phép lai hai cặp gen phân li độc lập. Đây là quy luật tương tác bổ trợ giữa hai gen không alen.',
        'Xác định kiểu gen: Kiểu hình hoa đỏ (chiếm 9/16) xuất hiện khi tế bào có mặt đồng thời ít nhất một alen trội của cả hai cặp gen (kiểu gen dạng A-B-). Kiểu hình hoa trắng (chiếm 7/16) xuất hiện khi thiếu một hoặc cả hai alen trội (kiểu gen dạng A-bb, aaB-, aabb).',
      ],
      answer:
        'Tính trạng màu hoa di truyền theo quy luật tương tác bổ trợ 9:7; kiểu gen hoa đỏ là A-B- (gồm AABB, AABb, AaBB, AaBb).',
    },
    checkQuestions: [
      {
        prompt:
          'Khi cho lai phân tích cá thể dị hợp tử về 2 cặp gen phân li độc lập di truyền theo quy luật tương tác bổ trợ kiểu 9:7, tỉ lệ kiểu hình thu được ở đời con lai phân tích là:',
        choices: [
          { id: 'tt_1', label: '1 trội : 3 lặn' },
          { id: 'tt_2', label: '1 trội : 1 lặn' },
          { id: 'tt_3', label: '3 trội : 1 lặn' },
          { id: 'tt_4', label: '9 trội : 7 lặn' },
        ],
        answer: { kind: 'choice', correctIds: ['tt_1'] },
        explain:
          'Cá thể dị hợp AaBb lai phân tích với aabb tạo ra tỉ lệ kiểu gen 1 AaBb (đỏ) : 1 Aabb (trắng) : 1 aaBb (trắng) : 1 aabb (trắng), thu được tỉ lệ kiểu hình là 1 đỏ : 3 trắng (1 trội : 3 lặn).',
      },
      {
        prompt:
          'Hiện tượng một gen chi phối sự biểu hiện của nhiều tính trạng khác nhau trên cơ thể được gọi là:',
        choices: [
          { id: 'dh_1', label: 'Tác động đa hiệu của gen' },
          { id: 'dh_2', label: 'Tương tác bổ trợ giữa các gen' },
          { id: 'dh_3', label: 'Tương tác cộng gộp của gen' },
          { id: 'dh_4', label: 'Trinh sản tự nhiên' },
        ],
        answer: { kind: 'choice', correctIds: ['dh_1'] },
        explain:
          'Đó là định nghĩa của gen đa hiệu (pleiotropic gene): một gen ảnh hưởng lên nhiều tính trạng biểu hiện khác nhau.',
      },
    ],
    srsCards: [
      {
        hoi: 'Thế nào là tương tác cộng gộp?',
        dap: 'Là kiểu tương tác gen trong đó mỗi alen trội của các locus khác nhau đóng góp một lượng đóng góp ngang nhau vào mức độ biểu hiện kiểu hình của tính trạng.',
      },
      {
        hoi: 'Nêu ví dụ về tác động đa hiệu của gen ở người?',
        dap: 'Gen đột biến HbS gây hội chứng hồng cầu hình liềm: vừa làm hồng cầu hình liềm gây thiếu máu, vừa gây tắc nghẽn mạch dẫn tới suy đa tạng.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c2-b10',
    grade: '12',
    chapterNumber: 2,
    chapterTitle: 'Tính quy luật của hiện tượng di truyền',
    lessonNumber: 10,
    title: 'Liên kết gen và hoán vị gen',
    hook: 'Thomas Morgan đã thí nghiệm lai ruồi giấm để phát hiện ra rằng các gen không luôn phân li độc lập—chúng có thể đi cùng nhau trên một nhiễm sắc thể, hoặc đôi khi hoán đổi vị trí cho nhau qua hiện tượng hoán vị.',
    theory:
      'LIÊN KẾT GEN HOÀN TOÀN (Morgan phát hiện ở ruồi giấm):\\n' +
      '— Khái niệm: Các gen nằm trên cùng một nhiễm sắc thể di truyền cùng nhau tạo thành một nhóm gen liên kết (số nhóm gen liên kết của loài bằng số NST đơn bội n của loài đó).\\n' +
      '— Ý nghĩa: Hạn chế sự xuất hiện biến dị tổ hợp, duy trì sự ổn định của nhóm tính trạng tốt luôn đi kèm nhau.\\n\\n' +
      'LIÊN KẾT GEN KHÔNG HOÀN TOÀN (Hoán vị gen):\\n' +
      '— Cơ chế: Trong kì đầu của giảm phân I, các NST kép tương đồng bắt cặp xảy ra sự tiếp hợp và trao đổi chéo đoạn cromatid không chị em, dẫn đến sự tổ hợp lại các gen nằm trên cùng NST.\\n' +
      '— Tần số hoán vị gen (f):\\n  + Công thức: f = (Số cá thể thuộc kiểu hình tái tổ hợp / Tổng số cá thể đời con) × 100%.\\n  + Đặc điểm: Tần số hoán vị gen tỉ lệ thuận với khoảng cách giữa hai gen trên nhiễm sắc thể (càng xa nhau càng dễ hoán vị). Tần số hoán vị luôn bé hơn hoặc bằng 50% (f ≤ 50%).\\n  + Bản đồ di truyền: Bản đồ biểu diễn trật tự phân bố và khoảng cách tương đối giữa các gen trên NST. Đơn vị đo khoảng cách là centimorgan (cM), quy ước 1% hoán vị gen = 1 cM.\\n— Ý nghĩa hoán vị gen: Tăng nguồn biến dị tổ hợp phong phú, tạo tổ hợp gen mới làm nguyên liệu cho tiến hóa.',
    workedExample: {
      problem:
        'Ở ruồi giấm cái dị hợp tử 2 cặp gen kiểu gen AB/ab tiến hành giảm phân tạo giao tử. Biết khoảng cách giữa hai gen A và B trên bản đồ di truyền là 20 cM. Hãy tính tỉ lệ các loại giao tử được tạo ra từ ruồi giấm cái này.',
      steps: [
        'Liên hệ khoảng cách bản đồ với tần số hoán vị gen: Khoảng cách là 20 cM tương ứng với tần số hoán vị gen f = 20%.',
        'Xác định các loại giao tử hoán vị (tái tổ hợp): Giao tử hoán vị mang tổ hợp gen chéo là Ab và aB. Tỉ lệ mỗi loại giao tử hoán vị = f / 2 = 20% / 2 = 10%.',
        'Xác định các loại giao tử liên kết (không hoán vị): Giao tử liên kết mang tổ hợp gen ban đầu của kiểu gen là AB và ab. Tỉ lệ mỗi loại giao tử liên kết = (100% - f) / 2 = (100% - 20%) / 2 = 40%.',
      ],
      answer: 'Giao tử liên kết: AB = ab = 40%; Giao tử hoán vị: Ab = aB = 10%.',
    },
    checkQuestions: [
      {
        prompt: 'Số nhóm gen liên kết tối đa của một loài sinh vật thường bằng:',
        choices: [
          { id: 'lk_1', label: 'Số nhiễm sắc thể trong bộ đơn bội (n) của loài' },
          { id: 'lk_2', label: 'Số nhiễm sắc thể trong bộ lưỡng bội (2n) của loài' },
          { id: 'lk_3', label: 'Số gen cấu trúc tối đa có trên một nhiễm sắc thể' },
          { id: 'lk_4', label: 'Tổng số nucleotit cấu tạo nên hệ gen' },
        ],
        answer: { kind: 'choice', correctIds: ['lk_1'] },
        explain:
          'Các gen nằm trên cùng một NST tạo thành một nhóm liên kết di truyền cùng nhau. Do đó, số nhóm gen liên kết tương ứng bằng số lượng NST đơn bội (n) của loài sinh vật đó.',
      },
      {
        prompt: 'Hiện tượng hoán vị gen xảy ra ở kì nào của quá trình giảm phân sinh giao tử?',
        choices: [
          { id: 'gp_1', label: 'Kì đầu của giảm phân I' },
          { id: 'gp_2', label: 'Kì giữa của giảm phân I' },
          { id: 'gp_3', label: 'Kì sau của giảm phân II' },
          { id: 'gp_4', label: 'Kì cuối của giảm phân II' },
        ],
        answer: { kind: 'choice', correctIds: ['gp_1'] },
        explain:
          'Tiếp hợp và trao đổi chéo giữa các cromatid không chị em của cặp NST tương đồng diễn ra ở kì đầu giảm phân I, đây chính là cơ sở vật lý của hoán vị gen.',
      },
    ],
    srsCards: [
      {
        hoi: 'Tại sao tần số hoán vị gen (f) tối đa chỉ bằng 50%?',
        dap: 'Vì trao đổi chéo chỉ xảy ra giữa 2 trong 4 cromatid của cặp NST tương đồng ở kì đầu giảm phân I, 2 cromatid còn lại không trao đổi chéo giữ nguyên cấu trúc liên kết.',
      },
      {
        hoi: 'Nêu khoảng cách tương đối của 1 centimorgan (cM) trên bản đồ di truyền?',
        dap: '1 cM là khoảng cách tương ứng với tần số hoán vị gen bằng 1%.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c2-b11',
    grade: '12',
    chapterNumber: 2,
    chapterTitle: 'Tính quy luật của hiện tượng di truyền',
    lessonNumber: 11,
    title: 'Di truyền liên kết giới tính và di truyền ngoài nhân',
    hook: 'Tại sao bệnh mù màu và máu khó đông lại phổ biến ở nam giới hơn nữ giới? Và tại sao tất cả con cái đều mang các đặc điểm ti thể giống hệt mẹ của chúng?',
    theory:
      'DI TRUYỀN LIÊN KẾT GIỚI TÍNH:\\n' +
      'Là hiện tượng các gen quy định tính trạng nằm trên nhiễm sắc thể giới tính (X hoặc Y).\\n' +
      '1. Gen trên NST giới tính X (không có alen tương đồng trên Y):\\n' +
      '   — Di truyền chéo: Gen lặn trên X của bố truyền cho con gái, từ con gái truyền cho cháu ngoại trai. Tính trạng dễ biểu hiện ở giới dị giao tử XY (chỉ cần 1 alen lặn X^a đã biểu hiện kiểu hình, ở nữ phải X^aX^a mới biểu hiện).\\n   — Ví dụ: Bệnh máu khó đông, mù màu đỏ-lục ở người.\\n' +
      '2. Gen trên NST giới tính Y (không có alen tương đồng trên X):\\n' +
      '   — Di truyền thẳng: Truyền trực tiếp từ bố cho 100% con trai ở giới dị giao tử XY (ví dụ gen quy định túm lông ở vành tai người).\\n\\n' +
      'DI TRUYỀN NGOÀI NHÂN (Di truyền tế bào chất / Di truyền theo dòng mẹ):\\n' +
      '— Đặc điểm: Các gen nằm trên phân tử ADN dạng vòng kép trong các bào quan ở tế bào chất như ti thể (ở động vật và thực vật) hoặc lục lạp (ở thực vật).\\n' +
      '— Kết quả phép lai thuận nghịch khác nhau: Phép lai thuận nghịch cho đời con 100% có kiểu hình giống cơ thể mẹ gánh vác việc thụ tinh.\\n  + Cơ chế: Khi thụ tinh, giao tử đực (tinh trùng) chỉ truyền nhân mà hầu như không truyền tế bào chất, toàn bộ tế bào chất của hợp tử do giao tử cái (trứng) cung cấp.',
    workedExample: {
      problem:
        'Tiến hành hai phép lai thuận nghịch ở loài cây hoa phấn:\\nPhép lai 1 (Thuận): Mẹ lá xanh đốm trắng × Bố lá xanh bình thường.\\nPhép lai 2 (Nghịch): Mẹ lá xanh bình thường × Bố lá xanh đốm trắng.\\nHãy dự đoán kết quả kiểu hình ở đời con của hai phép lai và giải thích cơ chế di truyền.',
      steps: [
        'Nhận diện kiểu di truyền: Tính trạng màu lá (xanh đốm trắng - variegation) ở cây hoa phấn do gen nằm trong lục lạp ở tế bào chất quy định.',
        'Phân tích phép lai 1 (Thuận): Cơ thể mẹ cung cấp noãn (tế bào chất) có lá xanh đốm trắng. Đời con thu được 100% cây con có kiểu hình lá xanh đốm trắng.',
        'Phân tích phép lai 2 (Nghịch): Cơ thể mẹ có lá xanh bình thường cung cấp noãn. Đời con thu được 100% cây con có kiểu hình lá xanh bình thường.',
        'Giải thích cơ chế: Do gen quy định màu lá nằm ngoài nhân (trong lục lạp). Hợp tử nhận toàn bộ tế bào chất và lục lạp từ noãn của mẹ, nên kiểu hình đời con hoàn toàn tuân theo dòng mẹ.',
      ],
      answer:
        'Phép lai 1 ra 100% xanh đốm trắng; Phép lai 2 ra 100% xanh bình thường. Di truyền theo dòng mẹ do gen nằm trong lục lạp tế bào chất.',
    },
    checkQuestions: [
      {
        prompt:
          'Bệnh mù màu đỏ - lục ở người do gen lặn nằm trên nhiễm sắc thể giới tính X không có alen tương đồng trên Y quy định. Một người con trai bị mù màu sẽ nhận gen bệnh này từ ai?',
        choices: [
          { id: 'gt_1', label: 'Chắc chắn nhận từ người mẹ' },
          { id: 'gt_2', label: 'Chắc chắn nhận từ người bố' },
          { id: 'gt_3', label: 'Nhận từ cả bố và mẹ' },
          { id: 'gt_4', label: 'Nhận ngẫu nhiên do đột biến tự phát khi thụ tinh' },
        ],
        answer: { kind: 'choice', correctIds: ['gt_1'] },
        explain:
          'Con trai có kiểu gen X^a Y. Alen Y nhận từ bố, do đó alen X^a mang gen gây bệnh mù màu bắt buộc phải nhận từ nhiễm sắc thể X của người mẹ truyền cho.',
      },
      {
        prompt:
          'Đặc điểm nào dưới đây là đặc trưng của hiện tượng di truyền ngoài nhân (tế bào chất)?',
        choices: [
          {
            id: 'tbc_1',
            label:
              'Kết quả phép lai thuận nghịch khác nhau, đời con luôn biểu hiện tính trạng giống mẹ',
          },
          { id: 'tbc_2', label: 'Tính trạng chỉ biểu hiện ở giới đực' },
          { id: 'tbc_3', label: 'Di truyền chéo từ bố sang con gái rồi sang cháu ngoại trai' },
          {
            id: 'tbc_4',
            label: 'Tỉ lệ phân li kiểu hình ở đời con luôn tuân theo định luật Mendel',
          },
        ],
        answer: { kind: 'choice', correctIds: ['tbc_1'] },
        explain:
          'Do tế bào chất của hợp tử hầu hết do noãn của mẹ đóng góp, nên mọi gen nằm trong ti thể hay lục lạp tế bào chất của mẹ sẽ truyền cho tất cả đời con bất kể đực cái.',
      },
    ],
    srsCards: [
      {
        hoi: 'Tại sao gen ngoài nhân di truyền theo dòng mẹ?',
        dap: 'Vì khi thụ tinh, giao tử đực (tinh trùng) chỉ truyền nhân vào trong trứng, toàn bộ tế bào chất chứa các bào quan (ti thể, lục lạp) của hợp tử được lấy từ noãn của mẹ.',
      },
      {
        hoi: 'Hiện tượng di truyền chéo (criss-cross inheritance) là gì?',
        dap: 'Là hiện tượng gen lặn trên NST X của bố truyền cho con gái (ở dạng dị hợp không biểu hiện) rồi biểu hiện ở cháu ngoại trai.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c2-b12',
    grade: '12',
    chapterNumber: 2,
    chapterTitle: 'Tính quy luật của hiện tượng di truyền',
    lessonNumber: 12,
    title: 'Ảnh hưởng của môi trường lên sự biểu hiện của gen',
    hook: 'Tại sao những chú thỏ Himalaya cạo lông ở lưng và chườm nước đá lại mọc ra chùm lông màu đen thay vì màu trắng? Môi trường có vai trò gì trong sự biểu hiện kiểu hình?',
    theory:
      'MỐI QUAN HỆ GIỮA KIỂU GEN, MÔI TRƯỜNG VÀ KIỂU HÌNH:\\n' +
      '— Kiểu hình là kết quả tương tác giữa kiểu gen và môi trường sinh thái ngoài tế bào.\\n  + Kiểu gen quy định khả năng phản ứng của cơ thể trước các môi trường khác nhau.\\n  + Môi trường quyết định sự biểu hiện cụ thể của kiểu gen thành kiểu hình.\\n\\n' +
      'THƯỜNG BIẾN (Biến đổi kiểu hình không di truyền):\\n' +
      '— Định nghĩa: Là những biến đổi về kiểu hình của cùng một kiểu gen dưới tác động trực tiếp của các điều kiện môi trường khác nhau.\\n' +
      '— Đặc điểm: Biến đổi đồng loạt, định hướng phù hợp với môi trường, giúp sinh vật thích nghi tạm thời. Thường biến không làm thay đổi kiểu gen nên không di truyền.\\n  + Ví dụ: Cây hoa cẩm tú cầu có cùng kiểu gen nhưng nở hoa màu xanh lam ở đất chua (pH < 7) và màu hồng đỏ ở đất kiềm (pH > 7).\\n\\n' +
      'MỨC PHẢN ỨNG (Norm of reaction):\\n' +
      '— Định nghĩa: Tập hợp các kiểu hình của cùng một kiểu gen tương ứng với các điều kiện môi trường khác nhau.\\n' +
      '— Đặc điểm: Mức phản ứng do kiểu gen quy định nên di truyền được. Mỗi gen có mức phản ứng rộng hoặc hẹp khác nhau:\\n  + Tính trạng chất lượng (hình dạng quả, màu sắc hoa): Mức phản ứng hẹp, ít phụ thuộc môi trường.\\n  + Tính trạng số lượng (sản lượng sữa, khối lượng hạt): Mức phản ứng rộng, phụ thuộc nhiều vào chăm sóc và môi trường.',
    workedExample: {
      problem:
        'Giải thích tại sao thỏ Himalaya bình thường có bộ lông màu trắng, riêng các đầu mút cơ thể (tai, bàn chân, đuôi, mũi) lại có màu đen, và hiện tượng này phản ánh sự tác động của yếu tố nào.',
      steps: [
        'Tìm hiểu cơ chế tạo sắc tố melanin: Sắc tố melanin làm lông thỏ có màu đen, được tổng hợp nhờ hoạt động của một enzyme nhạy cảm với nhiệt độ.',
        'Tác động của nhiệt độ cơ thể: Enzyme này bị bất hoạt ở nhiệt độ cao (nhiệt độ lõi cơ thể thỏ khoảng 37°C), khiến lông ở lưng và thân thỏ mọc ra màu trắng. Ngược lại, các đầu mút cơ thể (tai, đuôi, chân, mũi) có nhiệt độ thấp hơn, tạo điều kiện cho enzyme hoạt động tổng hợp melanin làm lông mọc màu đen.',
        'Chứng minh bằng thực nghiệm: Nếu cạo lông ở lưng thỏ và chườm nước đá liên tục, vùng lưng lạnh đi sẽ kích hoạt enzyme hoạt động, khiến lông mọc lại ở vùng đó có màu đen.',
      ],
      answer:
        'Do nhiệt độ môi trường ảnh hưởng đến hoạt động của enzyme tổng hợp sắc tố đen: nhiệt độ thấp ở đầu mút kích hoạt enzyme hoạt động làm lông màu đen.',
    },
    checkQuestions: [
      {
        prompt: 'Thường biến ở sinh vật có đặc điểm nổi bật nào dưới đây?',
        choices: [
          {
            id: 'tb_1',
            label: 'Biến đổi đồng loạt, định hướng thích nghi và không di truyền cho thế hệ sau',
          },
          { id: 'tb_2', label: 'Làm biến đổi cấu trúc kiểu gen dẫn đến di truyền mạnh mẽ' },
          { id: 'tb_3', label: 'Xuất hiện riêng lẻ, vô hướng không dự đoán trước được' },
          { id: 'tb_4', label: 'Chỉ xảy ra ở các loài động vật bậc cao' },
        ],
        answer: { kind: 'choice', correctIds: ['tb_1'] },
        explain:
          'Thường biến chỉ là sự điều chỉnh kiểu hình linh hoạt của cơ thể trước môi trường, kiểu gen không đổi nên không di truyền được.',
      },
      {
        prompt:
          'Tập hợp tất cả các kiểu hình của cùng một kiểu gen tương ứng với các điều kiện môi trường khác nhau được gọi là:',
        choices: [
          { id: 'pr_1', label: 'Mức phản ứng' },
          { id: 'pr_2', label: 'Thường biến thích nghi' },
          { id: 'pr_3', label: 'Kiểu hình đa sắc' },
          { id: 'pr_4', label: 'Độ phản ứng gen' },
        ],
        answer: { kind: 'choice', correctIds: ['pr_1'] },
        explain:
          'Mức phản ứng là giới hạn biểu hiện kiểu hình của kiểu gen. Mức phản ứng rộng hay hẹp do chính kiểu gen quy định di truyền.',
      },
    ],
    srsCards: [
      {
        hoi: 'Mức phản ứng của một kiểu gen do yếu tố nào quy định và có di truyền không?',
        dap: 'Do chính kiểu gen quy định và di truyền được cho đời con.',
      },
      {
        hoi: 'Phân biệt thường biến và đột biến?',
        dap: 'Thường biến: Biến đổi kiểu hình, không đổi kiểu gen, đồng loạt, thích nghi, không di truyền. Đột biến: Biến đổi kiểu gen (và kiểu hình), riêng lẻ, vô hướng, di truyền được.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c2-b13',
    grade: '12',
    chapterNumber: 2,
    chapterTitle: 'Tính quy luật của hiện tượng di truyền',
    lessonNumber: 13,
    title: 'Thực hành: Lai giống',
    hook: 'Làm thế nào các nhà khoa học và nông dân lai tạo thành công những giống lúa lai F₁ năng suất vượt trội? Chúng ta sẽ tìm hiểu các kỹ thuật lai hữu tính trên hoa.',
    theory:
      'QUY TRÌNH LAI HỮU TÍNH Ở THỰC VẬT (lai hoa lưỡng tính):\\n' +
      'Để tránh tự thụ phấn ngoài ý muốn, quy trình lai gồm các bước nghiêm ngặt:\\n' +
      '1. Bước 1: Khử đực ở hoa của cây chọn làm mẹ.\\n   — Chọn những nụ hoa cái chưa nở (bao phấn chưa chín và chưa giải phóng hạt phấn).\\n   — Dùng kẹp y tế tách nhẹ cánh hoa, cắt bỏ toàn bộ nhị đực (bao phấn), chỉ để lại nhụy cái vô hại.\\n2. Bước 2: Bảo vệ hoa mẹ.\\n   — Bao kín hoa đã khử đực bằng túi nilon hoặc giấy mỏng để ngăn chặn hạt phấn lạ ngoài môi trường bay vào thụ phấn chéo ngoài ý muốn.\\n3. Bước 3: Thụ phấn nhân tạo.\\n   — Khi nhụy hoa mẹ chín (tiết dịch nhầy ở đầu nhụy), thu hạt phấn từ hoa đực của cây chọn làm bố (bao phấn đã chín và vỡ). Rắc nhẹ hạt phấn này lên đầu nhụy hoa mẹ.\\n4. Bước 4: Gắn thẻ theo dõi.\\n   — Bao kín hoa lại, gắn nhãn ghi rõ tên bố mẹ, ngày thực hiện lai để theo dõi kết quả thu hoạch hạt lai F₁.',
    workedExample: {
      problem:
        'Tại sao trong quy trình lai hoa lưỡng tính (như hoa đậu Hà Lan), bước cắt bỏ bao phấn (khử đực) ở cây mẹ bắt buộc phải được thực hiện khi hoa còn ở dạng nụ chưa nở?',
      steps: [
        'Nhận diện đặc tính tự thụ phấn: Hoa lưỡng tính của một số loài tự thụ phấn rất sớm, ngay khi hoa hé nở hoặc thậm chí trong nụ kín (tự thụ phấn nghiêm ngặt).',
        'Phân tích nếu khử đực muộn (khi hoa đã nở): Bao phấn đã chín và vỡ ra giải phóng hạt phấn bám vào đầu nhụy của chính hoa đó, quá trình thụ tinh tự phát đã xảy ra.',
        'Kết luận: Phải khử đực từ sớm khi hoa còn dạng nụ để chắc chắn hạt phấn của bản thân hoa mẹ chưa chín, đảm bảo noãn chỉ được thụ tinh bởi hạt phấn từ cây bố chọn lọc.',
      ],
      answer:
        'Khử đực khi hoa dạng nụ để chắc chắn bao phấn chưa chín vỡ, ngăn ngừa hoa tự thụ phấn ngoài ý muốn trước khi lai.',
    },
    checkQuestions: [
      {
        prompt:
          'Trong quy trình lai hữu tính thực vật, việc bao kín hoa mẹ sau khi khử đực nhằm mục đích gì?',
        choices: [
          {
            id: 'lh_1',
            label:
              'Ngăn chặn hạt phấn lạ ngoài gió hoặc do côn trùng mang đến thụ phấn chéo ngoài ý muốn',
          },
          { id: 'lh_2', label: 'Giữ nhiệt độ cho hoa ấm áp để mau chín noãn' },
          { id: 'lh_3', label: 'Ngăn không cho ánh sáng chiếu vào hoa làm biến tính sắc tố' },
          { id: 'lh_4', label: 'Để hoa dễ dàng hấp thụ khí oxy' },
        ],
        answer: { kind: 'choice', correctIds: ['lh_1'] },
        explain:
          'Bao kín hoa mẹ bảo vệ noãn khỏi sự xâm nhập của các nguồn hạt phấn ngẫu nhiên ngoài môi trường, bảo đảm độ chính xác của phép lai chọn lọc.',
      },
      {
        prompt: 'Bước đầu tiên trong quy trình lai hữu tính ở cây hoa lưỡng tính làm mẹ là:',
        choices: [
          { id: 'lh_11', label: 'Khử đực (cắt bỏ nhị đực khi còn là nụ)' },
          { id: 'lh_12', label: 'Thu thập hạt phấn của cây bố' },
          { id: 'lh_13', label: 'Rắc hạt phấn lên đầu nhụy' },
          { id: 'lh_14', label: 'Thu hoạch hạt lai F₁ đem gieo' },
        ],
        answer: { kind: 'choice', correctIds: ['lh_11'] },
        explain:
          'Bước 1 là khử đực ở cây chọn làm mẹ để triệt tiêu nguồn hạt phấn tự thân của hoa mẹ đó.',
      },
    ],
    srsCards: [
      {
        hoi: 'Hoa lưỡng tính là gì?',
        dap: 'Là hoa có chứa đồng thời cả bộ nhị (cơ quan sinh sản đực) và bộ nhụy (cơ quan sinh sản cái) trên cùng một bông hoa.',
      },
      {
        hoi: 'Tại sao phải gắn thẻ nhãn lên hoa sau khi thụ phấn lai?',
        dap: 'Để ghi nhận thông tin phép lai (kiểu gen/dòng bố mẹ, ngày thụ phấn) phục vụ quản lý và đối chiếu kết quả F₁ thu hoạch sau này.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c3-b14',
    grade: '12',
    chapterNumber: 3,
    chapterTitle: 'Di truyền học quần thể',
    lessonNumber: 14,
    title: 'Cấu trúc di truyền của quần thể',
    hook: 'Một quần thể sinh vật không chỉ đơn giản là tập hợp các cá thể. Chúng liên kết với nhau bằng một vốn gen chung được đặc trưng bởi tần số các alen và tần số các kiểu gen.',
    theory:
      'KHÁI NIỆM VỀ QUẦN THỂ DI TRUYỀN:\\n' +
      '— Quần thể là tập hợp các cá thể cùng loài, cùng sống trong một khoảng không gian xác định, vào một thời điểm nhất định và có khả năng giao phối sinh sản ra đời con hữu thụ.\\n' +
      '— Vốn gen (Gene pool): Toàn bộ các alen của tất cả các gen trong quần thể tại một thời điểm xác định. Đặc trưng bằng:\\n  + Tần số kiểu gen: Tỉ lệ số cá thể mang kiểu gen đó trên tổng số cá thể của quần thể.\\n  + Tần số alen: Tỉ lệ số alen đó trên tổng số alen của locus đó trong quần thể.\\n\\n' +
      'QUẦN THỂ TỰ PHỐI (Tự thụ phấn hoặc Giao phối cận huyết):\\n' +
      '— Đặc điểm biến đổi cấu trúc qua các thế hệ tự phối liên tiếp:\\n  + Tần số kiểu gen đồng hợp tử tăng dần, dị hợp tử giảm dần.\\n  + Qua n thế hệ tự phối liên tiếp từ 100% cá thể dị hợp Aa:\\n    * Tỉ lệ dị hợp Aa = (1/2)ⁿ.\\n    * Tỉ lệ đồng hợp trội AA = đồng hợp lặn aa = [1 - (1/2)ⁿ] / 2.\\n  + Tần số các alen (A và a) không thay đổi nếu không có tác động của các nhân tố tiến hóa khác.\\n— Hậu quả: Gây ra hiện tượng thoái hóa giống ở động vật và thực vật do các alen lặn có hại có cơ hội gặp nhau tạo kiểu gen đồng hợp lặn biểu hiện ra kiểu hình gây hại.',
    workedExample: {
      problem:
        'Một quần thể thực vật ban đầu có cấu trúc di truyền là 100% Aa. Tiến hành tự thụ phấn bắt buộc liên tiếp qua 3 thế hệ. Hãy tính tần số kiểu gen Aa, AA và aa ở thế hệ F₃.',
      steps: [
        'Tính tần số kiểu gen dị hợp Aa ở thế hệ F₃ (n = 3): Tỉ lệ Aa = (1/2)³ = 1/8 = 0.125 (hay 12.5%).',
        'Tính tần số kiểu gen đồng hợp trội AA ở F₃: Tỉ lệ AA = [1 - (1/2)³] / 2 = [1 - 1/8] / 2 = (7/8) / 2 = 7/16 = 0.4375 (hay 43.75%).',
        'Tính tần số kiểu gen đồng hợp lặn aa ở F₃: Do tự phối cân bằng hai phía, tỉ lệ aa = tỉ lệ AA = 0.4375 (hay 43.75%).',
        'Kiểm tra lại tổng: AA + Aa + aa = 0.4375 + 0.125 + 0.4375 = 1.0 (Chính xác).',
      ],
      answer: 'Cấu trúc di truyền ở F₃ là: 0.4375 AA : 0.125 Aa : 0.4375 aa.',
    },
    checkQuestions: [
      {
        prompt:
          'Cấu trúc di truyền của một quần thể tự thụ phấn bắt buộc qua nhiều thế hệ liên tiếp có xu hướng biến đổi thế nào?',
        choices: [
          { id: 'qp_1', label: 'Tần số kiểu gen đồng hợp tăng dần, dị hợp giảm dần' },
          { id: 'qp_2', label: 'Tần số kiểu gen dị hợp tăng dần, đồng hợp giảm dần' },
          { id: 'qp_3', label: 'Tần số các alen lặn tăng dần, alen trội giảm dần' },
          { id: 'qp_4', label: 'Cấu trúc di truyền giữ trạng thái cân bằng không thay đổi' },
        ],
        answer: { kind: 'choice', correctIds: ['qp_1'] },
        explain:
          'Tự thụ phấn làm các cặp gen dị hợp phân li tạo đồng hợp ở đời con, tích lũy dần qua các thế hệ làm giảm dị hợp tử đi một nửa mỗi đời.',
      },
      {
        prompt:
          'Tại sao luật hôn nhân và gia đình cấm người có họ hàng gần (trong phạm vi 3 đời) kết hôn với nhau dưới góc độ di truyền học?',
        choices: [
          {
            id: 'lh_1',
            label:
              'Làm tăng tần số kiểu gen đồng hợp lặn, khiến các gen lặn có hại biểu hiện ra kiểu hình gây dị tật bẩm sinh',
          },
          { id: 'lh_2', label: 'Làm mất đi hoàn toàn các nhiễm sắc thể giới tính ở đời con' },
          { id: 'lh_3', label: 'Gây ra đột biến đảo đoạn nhiễm sắc thể hàng loạt' },
          { id: 'lh_4', label: 'Làm giảm kích thước cơ thể đời con đi một nửa' },
        ],
        answer: { kind: 'choice', correctIds: ['lh_1'] },
        explain:
          'Giao phối cận huyết (cận huyết thống) làm tăng tỉ lệ đồng hợp lặn ở đời con. Nhiều gen lặn có hại vốn ở trạng thái dị hợp Aa ẩn giấu sẽ gặp nhau tạo aa biểu hiện bệnh tật di truyền nguy hiểm.',
      },
    ],
    srsCards: [
      {
        hoi: 'Vốn gen (gene pool) của quần thể là gì?',
        dap: 'Là toàn bộ các alen của tất cả các gen trong quần thể tại một thời điểm xác định.',
      },
      {
        hoi: 'Tính tỉ lệ kiểu gen dị hợp Aa ở thế hệ tự phối thứ 4 xuất phát từ quần thể 100% Aa?',
        dap: 'Aa = (1/2)⁴ = 1/16 = 6.25%.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c3-b15',
    grade: '12',
    chapterNumber: 3,
    chapterTitle: 'Di truyền học quần thể',
    lessonNumber: 15,
    title: 'Trạng thái cân bằng di truyền của quần thể ngẫu phối',
    hook: 'Định luật Hardy–Weinberg cho phép chúng ta dùng toán học xác định chính xác tỉ lệ người mang gen bệnh tiềm ẩn trong cộng đồng chỉ từ việc biết số lượng ca bệnh biểu hiện.',
    theory:
      'QUẦN THỂ NGẪU PHỐI (Panmixia):\\n' +
      '— Đặc điểm: Các cá thể trong quần thể lựa chọn bạn tình giao phối hoàn toàn ngẫu nhiên. Tạo nên sự đa dạng kiểu gen khổng lồ (biến dị tổ hợp).\\n\\n' +
      'ĐỊNH LUẬT HARDY–WEINBERG (Cân bằng quần thể):\\n' +
      '— Nội dung: Trong một quần thể lớn ngẫu phối, nếu không có các nhân tố làm thay đổi tần số alen (đột biến, chọn lọc, di nhập gen...), thì tần số các alen và thành phần kiểu gen của quần thể sẽ được duy trì ổn định không đổi qua các thế hệ.\\n' +
      '— Công thức toán học (cho 1 locus có 2 alen A và a):\\n  Gọi p là tần số alen A, q là tần số alen a (p + q = 1).\\n  Quần thể đạt trạng thái cân bằng di truyền khi thành phần kiểu gen tuân theo đẳng thức:\\n  p² AA + 2pq Aa + q² aa = 1.\\n— Điều kiện nghiệm đúng của định luật:\\n  1. Quần thể phải có kích thước lớn.\\n  2. Các cá thể ngẫu phối tự do.\\n  3. Không có đột biến, hoặc tần số đột biến thuận nghịch bằng nhau.\\n  4. Không có chọn lọc tự nhiên (các kiểu gen có sức sống ngang nhau).\\n  5. Quần thể phải được cách ly, không có sự di nhập gen.',
    workedExample: {
      problem:
        'Ở một quần thể người đạt trạng thái cân bằng di truyền Hardy–Weinberg, tỉ lệ người bị bệnh bạch tạng (do gen lặn a nằm trên NST thường quy định) là 1/10000 (tức là 0.0001). Tính tần số của alen a, alen A và tỉ lệ phần trăm người bình thường mang gen bệnh (kiểu gen Aa) trong quần thể này.',
      steps: [
        'Xác định tần số kiểu gen đồng hợp lặn aa (bệnh bạch tạng): q² = 0.0001.',
        'Tính tần số alen a: q = √0.0001 = 0.01.',
        'Tính tần số alen A: p = 1 - q = 1 - 0.01 = 0.99.',
        'Tính tỉ lệ người bình thường mang gen bệnh (kiểu gen dị hợp Aa): Tỉ lệ Aa = 2pq = 2 × 0.99 × 0.01 = 0.0198 (tương đương 1.98% dân số).',
      ],
      answer: 'Tần số alen a = 0.01; tần số alen A = 0.99; tỉ lệ người mang gen bệnh Aa là 1.98%.',
    },
    checkQuestions: [
      {
        prompt:
          'Một quần thể sinh vật đạt trạng thái cân bằng di truyền Hardy–Weinberg có tần số alen A = 0.6 và a = 0.4. Thành phần kiểu gen của quần thể này là:',
        choices: [
          { id: 'hw_1', label: '0.36 AA : 0.48 Aa : 0.16 aa' },
          { id: 'hw_2', label: '0.60 AA : 0.00 Aa : 0.40 aa' },
          { id: 'hw_3', label: '0.40 AA : 0.20 Aa : 0.40 aa' },
          { id: 'hw_4', label: '0.16 AA : 0.48 Aa : 0.36 aa' },
        ],
        answer: { kind: 'choice', correctIds: ['hw_1'] },
        explain:
          'Áp dụng công thức cân bằng: p² AA + 2pq Aa + q² aa = 1. Với p = 0.6 và q = 0.4 -> p² = 0.36; 2pq = 2(0.6)(0.4) = 0.48; q² = 0.16. Ta được cấu trúc 0.36 AA : 0.48 Aa : 0.16 aa.',
      },
      {
        prompt: 'Định luật Hardy–Weinberg KHÔNG nghiệm đúng trong điều kiện nào sau đây?',
        choices: [
          {
            id: 'dk_1',
            label: 'Quần thể xảy ra chọn lọc tự nhiên đào thải các cá thể đồng hợp lặn',
          },
          { id: 'dk_2', label: 'Số lượng cá thể của quần thể cực kỳ lớn' },
          { id: 'dk_3', label: 'Không xảy ra di nhập gen giữa các quần thể lân cận' },
          { id: 'dk_4', label: 'Các cá thể ngẫu phối hoàn toàn tự do' },
        ],
        answer: { kind: 'choice', correctIds: ['dk_1'] },
        explain:
          'Chọn lọc tự nhiên đào thải kiểu gen đồng hợp lặn sẽ làm giảm tần số alen lặn q qua mỗi thế hệ, phá vỡ trạng thái cân bằng vốn có của quần thể.',
      },
    ],
    srsCards: [
      {
        hoi: 'Viết công thức định luật Hardy–Weinberg cho quần thể cân bằng có 2 alen A và a?',
        dap: 'p² AA + 2pq Aa + q² aa = 1 (với p là tần số alen A, q là tần số alen a và p + q = 1).',
      },
      {
        hoi: 'Nêu hai đặc điểm quan trọng nhất của quần thể ngẫu phối?',
        dap: 'Giao phối tự do ngẫu nhiên giữa các cá thể, và duy trì tần số alen không đổi qua các thế hệ dưới điều kiện tiêu chuẩn.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c4-b16',
    grade: '12',
    chapterNumber: 4,
    chapterTitle: 'Ứng dụng di truyền học',
    lessonNumber: 16,
    title: 'Chọn giống vật nuôi và cây trồng bằng phương pháp truyền thống',
    hook: 'Từ tổ tiên là loài gà rừng nhỏ bé, con người đã chọn lọc tạo ra hàng trăm giống gà chuyên thịt, chuyên trứng năng suất cao nhờ các phương pháp chọn giống cổ điển.',
    theory:
      'CHỌN GIỐNG TỪ NGUỒN BIẾN DỊ TỔ HỢP:\\n' +
      '— Cơ chế: Cho lai giữa các dòng thuần chủng khác nhau để tạo ra các biến dị tổ hợp phong phú ở đời con, sau đó chọn lọc cá thể có tổ hợp gen mong muốn và tự phối/giao phối gần để tạo dòng thuần chủng mới.\\n\\n' +
      'ƯU THẾ LAI (Hybrid vigor):\\n' +
      '— Khái niệm: Hiện tượng con lai F₁ có sức sống cao hơn, sinh trưởng nhanh hơn, chống chịu tốt hơn và năng suất vượt trội so với các dòng bố mẹ thuần chủng.\\n' +
      '— Học thuyết siêu trội (phổ biến nhất): Giải thích ưu thế lai xuất hiện do kiểu gen dị hợp tử (Aa, Bb...) vượt trội về tính trạng so với các kiểu gen đồng hợp tử (AA, aa, BB, bb...).\\n' +
      '— Đặc điểm quan trọng: Ưu thế lai biểu hiện cao nhất ở đời F₁, sau đó giảm dần qua các thế hệ tự phối do tỉ lệ dị hợp tử giảm. Vì vậy con lai F₁ không được dùng làm giống để nhân giống cho đời sau, chỉ dùng vào mục đích kinh tế (thương phẩm).\\n\\n' +
      'PHƯƠNG PHÁP TẠO ƯU THẾ LAI:\\n' +
      '— Lai khác dòng đơn: Dòng A × Dòng B → F₁.\\n' +
      '— Lai khác dòng kép: (Dòng A × Dòng B) × (Dòng C × Dòng D) → F₁.',
    workedExample: {
      problem:
        'Tại sao các nhà khoa học luôn khuyến cáo nông dân không được sử dụng các hạt lúa lai F1 có ưu thế lai cực cao để làm giống gieo cấy cho vụ sau?',
      steps: [
        'Phân tích kiểu gen F1 mang ưu thế lai: F1 là cơ thể dị hợp tử về nhiều cặp gen (AaBb...).',
        'Phân tích di truyền đời sau: Nếu lấy F1 làm giống tự thụ phấn, đời F2 sẽ xảy ra quá trình phân li kiểu gen làm tăng tỉ lệ đồng hợp tử (đồng hợp trội AA, đồng hợp lặn aa) và giảm tỉ lệ dị hợp tử đi một nửa.',
        'Hệ quả kiểu hình: Tỉ lệ đồng hợp lặn tăng lên làm biểu hiện các tính trạng xấu có hại, ưu thế lai bị giảm sút nghiêm trọng ở đời F2, năng suất lúa giảm mạnh không đồng đều.',
      ],
      answer:
        'Vì đời sau tự thụ phấn sẽ xảy ra hiện tượng phân li làm giảm tỉ lệ dị hợp tử, tăng đồng hợp tử dẫn đến thoái hóa giống và mất ưu thế lai.',
    },
    checkQuestions: [
      {
        prompt:
          'Giả thuyết siêu trội giải thích hiện tượng ưu thế lai cho rằng con lai F₁ đạt năng suất vượt trội là do sở hữu cấu trúc kiểu gen nào?',
        choices: [
          { id: 'ut_1', label: 'Dị hợp tử về nhiều cặp gen khác nhau (AaBb...)' },
          { id: 'ut_2', label: 'Đồng hợp tử trội về tất cả các cặp gen (AABB...)' },
          { id: 'ut_3', label: 'Đồng hợp tử lặn có hại bị triệt tiêu hoàn toàn' },
          { id: 'ut_4', label: 'Bộ nhiễm sắc thể bị đa bội hóa lên 4n' },
        ],
        answer: { kind: 'choice', correctIds: ['ut_1'] },
        explain:
          'Thuyết siêu trội khẳng định trạng thái dị hợp tử (Aa) có hoạt tính enzym và khả năng thích nghi cao hơn hẳn các trạng thái đồng hợp tử tương ứng (AA hoặc aa).',
      },
      {
        prompt:
          'Trong chọn giống truyền thống, để duy trì và ổn định một tính trạng tốt vừa chọn lọc được từ biến dị tổ hợp, người ta áp dụng biện pháp nào?',
        choices: [
          {
            id: 'cg_1',
            label:
              'Cho tự thụ phấn bắt buộc hoặc giao phối cận huyết qua nhiều thế hệ để tạo dòng thuần chủng',
          },
          { id: 'cg_2', label: 'Cho lai xa với các loài hoang dại khác dòng' },
          { id: 'cg_3', label: 'Tiến hành đa bội hóa bộ nhiễm sắc thể' },
          { id: 'cg_4', label: 'Sử dụng con lai F₁ làm giống thương phẩm lâu dài' },
        ],
        answer: { kind: 'choice', correctIds: ['cg_1'] },
        explain:
          'Tự thụ phấn hoặc giao phối cận huyết liên tục giúp đồng hợp hóa bộ gen, cố định tính trạng tốt thành dòng thuần chủng ổn định di truyền.',
      },
    ],
    srsCards: [
      {
        hoi: 'Tại sao ưu thế lai biểu hiện cao nhất ở đời F₁?',
        dap: 'Vì đời F₁ có tỉ lệ kiểu gen dị hợp tử cao nhất; các thế hệ sau tự phối tỉ lệ dị hợp tử giảm làm giảm ưu thế lai.',
      },
      {
        hoi: 'Lai kinh tế là gì?',
        dap: 'Là phép lai giữa các dòng thuần chủng khác nhau để lấy con lai F₁ thương phẩm (lấy thịt, trứng, sữa) mà không dùng làm giống.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c4-b17',
    grade: '12',
    chapterNumber: 4,
    chapterTitle: 'Ứng dụng di truyền học',
    lessonNumber: 17,
    title: 'Chọn giống bằng công nghệ tế bào',
    hook: 'Công nghệ tế bào cho phép chúng ta tạo ra loài cây lai "Pomato" vừa ra quả cà chua ở trên vừa tạo củ khoai tây ở dưới đất bằng kỹ thuật dung hợp tế bào trần.',
    theory:
      'CÔNG NGHỆ TẾ BÀO THỰC VẬT:\\n' +
      '1. Dung hợp tế bào trần (Somatic hybridization):\\n' +
      '   — Cách làm: Loại bỏ thành xenlulozo của tế bào sinh dưỡng hai loài khác nhau tạo tế bào trần, sau đó cho dung hợp tạo tế bào lai. Nuôi cấy tế bào lai phát triển thành cây lai song nhị bội khác loài mà không cần qua sinh sản hữu tính (ví dụ cây Pomato lai giữa khoai tây và cà chua).\\n' +
      '2. Nuôi cấy hạt phấn hoặc noãn chưa thụ tinh (đơn bội n):\\n' +
      '   — Cách làm: Nuôi hạt phấn (n) trên môi trường nhân tạo tạo mô đơn bội, sau đó xử lý bằng hóa chất colchicine để lưỡng bội hóa tạo dòng lưỡng bội (2n) thuần chủng tuyệt đối về tất cả các gen.\\n\\n' +
      'CÔNG NGHỆ TẾ BÀO ĐỘNG VẬT:\\n' +
      '1. Nhân bản vô tính động vật bằng chuyển nhân (Cloning):\\n' +
      '   — Đại diện: Cừu Dolly (1996).\\n   — Ý nghĩa: Nhân nhanh các cá thể động vật quý hiếm hoặc mang gene trị bệnh y học.\\n' +
      '2. Cấy truyền phôi (Embryo transfer):\\n' +
      '   — Cách làm: Tách phôi của động vật quý hiếm thành nhiều phôi nhỏ rồi cấy vào tử cung của các con cái nhận mang thai hộ.\\n   — Ý nghĩa: Nhân nhanh số lượng con giống quý hiếm từ một phôi ban đầu.',
    workedExample: {
      problem:
        'Hãy mô tả quy trình tạo dòng thực vật lưỡng bội (2n) thuần chủng tuyệt đối về tất cả các gen bằng kỹ thuật nuôi cấy hạt phấn.',
      steps: [
        'Thu hoạch hạt phấn: Lấy các hạt phấn đơn bội (n) từ bao phấn của cây có kiểu gen dị hợp (ví dụ AaBb).',
        'Nuôi cấy in vitro: Nuôi các hạt phấn này trên môi trường dinh dưỡng thích hợp kích thích chúng phân chia tạo mô đơn bội (n).',
        'Lưỡng bội hóa: Xử lý mô đơn bội bằng hóa chất Colchicine (ức chế thoi vô sắc ngăn phân chia NST), làm bộ NST nhân đôi lên thành lưỡng bội (2n).',
        'Kết quả: Mô lưỡng bội phát triển thành cây con 2n. Vì mọi cặp NST đều nhân đôi từ một bộ đơn bội ban đầu nên cây con tạo ra đồng hợp tử thuần chủng tuyệt đối về tất cả các cặp gen (ví dụ AABB hoặc aabb).',
      ],
      answer:
        'Nuôi cấy hạt phấn (n) tạo mô đơn bội -> Lưỡng bội hóa bằng Colchicine -> Cây lưỡng bội (2n) thuần chủng tuyệt đối.',
    },
    checkQuestions: [
      {
        prompt:
          'Phương pháp công nghệ tế bào thực vật nào tạo ra cây lai mang bộ NST của hai loài khác nhau mà không cần qua giao phối hữu tính?',
        choices: [
          { id: 'tb_1', label: 'Dung hợp tế bào trần' },
          { id: 'tb_2', label: 'Nuôi cấy hạt phấn đơn bội' },
          { id: 'tb_3', label: 'Nuôi cấy mô sẹo thực vật' },
          { id: 'tb_4', label: 'Chọn lọc dòng tế bào xoma có biến dị' },
        ],
        answer: { kind: 'choice', correctIds: ['tb_1'] },
        explain:
          'Dung hợp tế bào trần kết hợp toàn bộ tế bào chất và nhân của hai loài khác nhau, tạo ra tế bào lai song nhị bội nhân tạo.',
      },
      {
        prompt:
          'Trong quy trình nhân bản vô tính cừu Dolly, tế bào chất của hợp tử nhân bản có nguồn gốc từ:',
        choices: [
          { id: 'dl_1', label: 'Tế bào trứng đã bị loại bỏ nhân của cừu cho trứng' },
          { id: 'dl_2', label: 'Tế bào tuyến vú của cừu cho nhân' },
          { id: 'dl_3', label: 'Tế bào tử cung của cừu mang thai hộ' },
          { id: 'dl_4', label: 'Hỗn hợp tế bào chất của cả ba con cừu' },
        ],
        answer: { kind: 'choice', correctIds: ['dl_1'] },
        explain:
          'Nhân tế bào lấy từ cừu cho nhân (tuyến vú) được chuyển vào tế bào trứng đã bị hút bỏ nhân của cừu cho trứng. Do đó, tế bào chất hoàn toàn từ tế bào trứng này cung cấp.',
      },
    ],
    srsCards: [
      {
        hoi: 'Colchicine hoạt động theo cơ chế nào để gây đa bội hóa?',
        dap: 'Ức chế sự hình thành thoi vô sắc trong quá trình phân bào, khiến NST nhân đôi nhưng không thể phân li về hai cực tế bào.',
      },
      {
        hoi: 'Nêu ý nghĩa lớn nhất của kỹ thuật cấy truyền phôi ở bò sữa?',
        dap: 'Nhân nhanh số lượng con con quý hiếm từ một phôi bò mẹ tốt nhờ nhiều bò mẹ thông thường mang thai hộ.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c4-b18',
    grade: '12',
    chapterNumber: 4,
    chapterTitle: 'Ứng dụng di truyền học',
    lessonNumber: 18,
    title: 'Chọn giống bằng công nghệ gen',
    hook: 'Bằng công nghệ gen chuyển, chúng ta đã tạo ra giống lúa vàng chứa vitamin A cứu sống hàng triệu trẻ em thiếu dinh dưỡng, hay những con vi khuẩn E. coli sản xuất hormone insulin trị bệnh tiểu đường.',
    theory:
      'KHÁI NIỆM VỀ CÔNG NGHỆ GEN:\\n' +
      '— Là quy trình tạo ra những tế bào hoặc sinh vật có gen bị biến đổi hoặc có thêm gen mới, từ đó tạo ra những đặc tính mới mong muốn.\\n' +
      '— Sinh vật biến đổi gen (GMO): Sinh vật có hệ gen được biến đổi nhân tạo (được chuyển gen mới, làm bất hoạt gen có sẵn, hoặc biến đổi tăng hoạt tính gen).\\n\\n' +
      'KỸ THUẬT CHUYỂN GEN (Kỹ thuật tái tổ hợp ADN):\\n' +
      'Gồm 3 bước cơ bản:\\n' +
      '1. Bước 1: Tạo ADN tái tổ hợp.\\n   — Tách thể truyền (plasmid vi khuẩn hoặc virut) và gen cần chuyển từ tế bào cho.\\n   — Cắt thể truyền và gen cần chuyển bằng cùng một loại enzyme cắt giới hạn (restrictase) tạo đầu dính tương thích.\\n   — Nối gen cần chuyển vào thể truyền nhờ enzyme nối ligase tạo ADN tái tổ hợp.\\n2. Bước 2: Đưa ADN tái tổ hợp vào tế bào nhận.\\n   — Dùng CaCl₂ hoặc xung điện để làm giãn màng sinh chất tế bào nhận (thường là vi khuẩn E. coli) giúp ADN tái tổ hợp xâm nhập vào.\\n3. Bước 3: Phân lập dòng tế bào chứa ADN tái tổ hợp.\\n   — Nuôi cấy tế bào trên môi trường chọn lọc chứa gen đánh dấu (như gen kháng kháng sinh có trên thể truyền) để cô lập dòng tế bào đã nhận gen thành công.\\n\\n' +
      'THÀNH TỰU CÔNG NGHỆ GEN:\\n' +
      '— Động vật: Cừu chuyển gen tổng hợp protein người trong sữa; chuột nhắt mang gen sinh trưởng của chuột cống to gấp đôi.\\n' +
      '— Thực vật: Bông kháng sâu hại (mang gen Bt độc tố diệt sâu); lúa vàng (Golden Rice) tổng hợp beta-carotene (tiền chất vitamin A).\\n' +
      '— Vi sinh vật: Vi khuẩn E. coli chuyển gen sản xuất insulin người trị tiểu đường, hormone sinh trưởng.',
    workedExample: {
      problem:
        'Hãy giải thích tại sao trong kỹ thuật chuyển gen, người ta bắt buộc phải sử dụng cùng một loại enzyme restrictase để cắt cả ADN của thể truyền (plasmid) và ADN chứa gen cần chuyển.',
      steps: [
        'Nhận diện cơ chế cắt của restrictase: Enzym restrictase cắt ADN tại những trình tự nucleotit xác định (điểm nhận biết).',
        'Tạo đầu dính: Vết cắt lệch tạo ra các đầu mạch đơn nhô ra gọi là đầu dính (sticky ends) mang trình tự nucleotit bổ sung.',
        'Kết quả nối: Nếu cắt bằng cùng một loại restrictase, đầu dính của plasmid và đầu dính của gen cần chuyển sẽ có trình tự nucleotit đối xứng bổ sung khớp khít với nhau, tạo điều kiện cho các liên kết hydro hình thành dễ dàng khi bổ sung enzym ligase nối mạch.',
      ],
      answer:
        'Cắt bằng cùng một loại restrictase để tạo ra các đầu dính bổ sung khớp khít với nhau, giúp nối gen vào thể truyền dễ dàng.',
    },
    checkQuestions: [
      {
        prompt:
          'Enzyme nào sau đây được dùng để cắt phân tử ADN tại những vị trí đặc hiệu trong kỹ thuật tạo ADN tái tổ hợp?',
        choices: [
          { id: 'ez_1', label: 'Restrictase (Enzyme cắt giới hạn)' },
          { id: 'ez_2', label: 'Ligase (Enzyme nối)' },
          { id: 'ez_3', label: 'ADN polimerase' },
          { id: 'ez_4', label: 'ARN polimerase' },
        ],
        answer: { kind: 'choice', correctIds: ['ez_1'] },
        explain:
          'Restrictase nhận biết trình tự nucleotit đặc hiệu trên ADN và cắt đứt liên kết photphodieste ở vị trí xác định tạo đầu dính hoặc đầu bằng.',
      },
      {
        prompt:
          'Thành tựu nào sau đây là sản phẩm ứng dụng trực tiếp của công nghệ gen chuyển ở thực vật?',
        choices: [
          { id: 'tt_1', label: 'Cây bông mang gen Bt kháng sâu hại' },
          { id: 'tt_2', label: 'Cây lai Pomato vừa ra quả cà chua vừa tạo củ khoai tây' },
          { id: 'tt_3', label: 'Dòng lúa lưỡng bội thuần chủng tạo ra từ nuôi cấy hạt phấn' },
          { id: 'tt_4', label: 'Quả dưa hấu tam bội không hạt' },
        ],
        answer: { kind: 'choice', correctIds: ['tt_1'] },
        explain:
          'Cây bông kháng sâu mang gen độc tố tinh thể diệt côn trùng từ vi khuẩn Bacillus thuringiensis là thành tựu chuyển gen thực vật điển hình. Cây Pomato là dung hợp tế bào trần.',
      },
    ],
    srsCards: [
      {
        hoi: 'ADN tái tổ hợp gồm những thành phần nào?',
        dap: 'Thể truyền (vector - thường là plasmid hoặc virut) liên kết hóa học với gen cần chuyển của sinh vật khác.',
      },
      {
        hoi: 'Tại sao vi khuẩn E. coli thường được chọn làm tế bào nhận trong công nghệ gen sản xuất y dược?',
        dap: 'Vì E. coli sinh sản rất nhanh (khoảng 20 phút nhân đôi một lần), giúp nhân nhanh số lượng gen chuyển để thu hoạch lượng lớn sản phẩm protein mong muốn trong thời gian ngắn.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c5-b19',
    grade: '12',
    chapterNumber: 5,
    chapterTitle: 'Di truyền học người',
    lessonNumber: 19,
    title: 'Di truyền y học và bảo vệ vốn gen loài người',
    hook: 'Di truyền y học giúp chúng ta giải mã các nguyên nhân gây ung thư, dự báo nguy cơ sinh con dị tật bẩm sinh nhờ các phương pháp xét nghiệm sàng lọc trước sinh hiện đại.',
    theory:
      'KHÁI NIỆM DI TRUYỀN Y HỌC:\\n' +
      'Là một nhánh của di truyền học người chuyên nghiên cứu cơ chế phát sinh, chẩn đoán, phòng ngừa và điều trị các bệnh di truyền ở người.\\n\\n' +
      'CÁC NHÓM BỆNH DI TRUYỀN CHÍNH:\\n' +
      '1. Bệnh di truyền phân tử (đột biến gen):\\n   — Bệnh phêninkêtô niệu (PKU): Do đột biến gen mã hóa enzym chuyển hóa axit amin phenylalanine thành tyrosine. Axit amin phenylalanine tích tụ đầu độc tế bào thần kinh gây mất trí trí tuệ.\\n   — Bệnh hồng cầu hình liềm, mù màu, máu khó đông.\\n2. Hội chứng bệnh liên quan đến đột biến NST (rối loạn số lượng/cấu trúc NST):\\n   — Hội chứng Down (3 NST 21), Klinefelter (XXY), Turner (XO), Patau (3 NST 13), Edward (3 NST 18).\\n3. Bệnh ung thư (ác tính):\\n   — Do đột biến gen tiền ung thư (chuyển thành gen ung thư trội biểu hiện liên tục) hoặc đột biến gen ức chế khối u (gen lặn mất chức năng bảo vệ tế bào), làm tế bào phân chia mất kiểm soát hình thành khối u di căn.\\n\\n' +
      'BẢO VỆ VỐN GEN LOÀI NGƯỜI:\\n' +
      '— Tư vấn di truyền y học: Phân tích phả hệ, xét nghiệm di truyền đưa ra lời khuyên cho các cặp vợ chồng có nguy cơ sinh con mắc bệnh.\\n' +
      '— Sàng lọc trước sinh: Chọc dò dịch ối, sinh thiết tua nhau thai, xét nghiệm máu mẹ (NIPT) để phát hiện dị tật NST từ giai đoạn phôi thai.\\n' +
      '— Liệu pháp gene: Đưa gene lành thay gene đột biến bệnh lý trực tiếp vào tế bào người.',
    workedExample: {
      problem:
        'Giải thích cơ chế phát sinh bệnh phêninkêtô niệu (PKU) ở người và phương pháp điều trị đơn giản hiệu quả nhất đối với trẻ mắc bệnh này.',
      steps: [
        'Cơ chế di truyền: Bệnh PKU do đột biến gen lặn nằm trên NST thường gây mất hoạt tính của enzyme phenylalanine hydroxylase (enzym chuyển hóa axit amin phenylalanine thành tyrosine).',
        'Hậu quả sinh lý: Phenylalanine từ thức ăn không được chuyển hóa, tích lũy trong máu và đi vào não gây tổn thương trực tiếp hệ thần kinh trung ương, khiến trẻ bị thiểu năng trí tuệ nặng.',
        'Điều trị: Phát hiện sớm trẻ mắc bệnh ngay sau sinh qua sàng lọc sơ sinh. Phương pháp điều trị hiệu quả nhất là áp dụng chế độ ăn kiêng nghiêm ngặt giảm tối đa axit amin phenylalanine trong khẩu phần ăn của trẻ bệnh.',
      ],
      answer:
        'Do đột biến gen lặn làm thiếu hụt enzym chuyển hóa phenylalanine gây ngộ độc não bộ; điều trị bằng chế độ ăn kiêng phenylalanine.',
    },
    checkQuestions: [
      {
        prompt:
          'Bệnh di truyền nào sau đây ở người do đột biến gen lặn trên nhiễm sắc thể thường gây ra và có thể điều trị hiệu quả bằng chế độ ăn kiêng?',
        choices: [
          { id: 'yh_1', label: 'Bệnh phêninkêtô niệu (PKU)' },
          { id: 'yh_2', label: 'Hội chứng Down' },
          { id: 'yh_3', label: 'Hội chứng Turner' },
          { id: 'yh_4', label: 'Bệnh mù màu đỏ - lục' },
        ],
        answer: { kind: 'choice', correctIds: ['yh_1'] },
        explain:
          'Bệnh PKU là bệnh di truyền phân tử điển hình có thể kiểm soát hoàn toàn triệu chứng nếu phát hiện sớm và cho trẻ ăn kiêng thực phẩm chứa phenylalanine.',
      },
      {
        prompt:
          'Các gen ung thư (oncogene) hoạt động trong tế bào thường gây ra sự phân chia vô hạn hình thành khối u là do đột biến dạng nào của gen tiền ung thư?',
        choices: [
          { id: 'ut_1', label: 'Đột biến trội làm gen hoạt động mạnh mẽ vượt mức bình thường' },
          { id: 'ut_2', label: 'Đột biến lặn làm gen mất hoàn toàn hoạt tính' },
          { id: 'ut_3', label: 'Đột biến mất đoạn nhiễm sắc thể giới tính Y' },
          { id: 'ut_4', label: 'Đột biến đảo đoạn tâm động nhiễm sắc thể' },
        ],
        answer: { kind: 'choice', correctIds: ['ut_1'] },
        explain:
          'Gen tiền ung thư (proto-oncogene) khi bị đột biến trội (gain-of-function) chuyển thành gen ung thư (oncogene) hoạt động quá mức, kích thích tế bào tăng phân chia liên tục.',
      },
    ],
    srsCards: [
      {
        hoi: 'Liệu pháp gen (gene therapy) là gì?',
        dap: 'Là kỹ thuật đưa gen lành thay thế hoặc sửa chữa gen đột biến gây bệnh trực tiếp trong tế bào của người bệnh.',
      },
      {
        hoi: 'Kể tên 3 hội chứng bệnh ở người do đột biến số lượng NST?',
        dap: 'Hội chứng Down (3 NST 21), hội chứng Klinefelter (XXY) và hội chứng Turner (XO).',
      },
    ],
    reviewStatus: 'draft',
  },
]
