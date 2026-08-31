// lessons/hoa11c1.ts — Hoá học 11, Chương 1: Cân bằng hoá học (3 bài).
// Đối chiếu mục lục thật: tai-lieu-sgk/SGK-Hoa/11/page_0004.png (OCR 2026-08-31).
// reviewStatus='draft' — soạn từ docs/research/kho-kien-thuc-hoa-gdpt2018.md §3, chưa duyệt.
import type { ChemLesson } from '../lessonTypes.js'

export const HOA11_C1_LESSONS: ChemLesson[] = [
  {
    id: 'hoa11-c1-b1',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Cân bằng hoá học',
    lessonNumber: 1,
    title: 'Khái niệm về cân bằng hoá học',
    hook:
      'Hầu hết các phản ứng trong công nghiệp không xảy ra hoàn toàn đến cùng. Chúng dừng lại ở ' +
      'một trạng thái mà cả chất tham gia và sản phẩm cùng tồn tại song song — đó là trạng thái cân bằng.',
    theory:
      'PHẢN ỨNG MỘT CHIỀU VÀ PHẢN ỨNG THUẬN NGHỊCH:\\n' +
      '— Phản ứng một chiều: phản ứng chỉ xảy ra theo một chiều từ chất tham gia tạo thành sản phẩm (dùng mũi tên đơn →).\\n' +
      '— Phản ứng thuận nghịch: trong cùng điều kiện, phản ứng xảy ra theo cả hai chiều trái ngược nhau: chiều thuận (chất đầu → sản phẩm) và chiều nghịch (sản phẩm → chất đầu) (dùng mũi tên hai chiều ⇌).\\n\\n' +
      'TRẠNG THÁI CÂN BẰNG HOÁ HỌC:\\n' +
      '— Trạng thái cân bằng của phản ứng thuận nghịch là trạng thái tại đó tốc độ phản ứng thuận bằng tốc độ phản ứng nghịch (vt = vn).\\n' +
      '— Đây là CÂN BẰNG ĐỘNG: phản ứng thuận và nghịch vẫn tiếp tục xảy ra với tốc độ bằng nhau, nồng độ của các chất trong hệ không thay đổi nữa.\\n\\n' +
      'HẰNG SỐ CÂN BẰNG (Kc):\\n' +
      '— Đối với phản ứng thuận nghịch tổng quát ở trạng thái khí hoặc dung dịch: aA + bB ⇌ cC + dD.\\n' +
      '— Biểu thức hằng số cân bằng: Kc = ([C]^c * [D]^d) / ([A]^a * [B]^b). Trong đó [A], [B], [C], [D] là nồng độ mol/L của các chất ở trạng thái cân bằng. Chất rắn không xuất hiện trong biểu thức Kc.\\n\\n' +
      'NGUYÊN LÍ CHUYỂN DỊCH CÂN BẰNG LE CHATELIER:\\n' +
      '— Phát biểu: Một phản ứng thuận nghịch đang ở trạng thái cân bằng, khi chịu một tác động từ bên ngoài (như biến đổi nồng độ, nhiệt độ, áp suất), cân bằng sẽ chuyển dịch theo chiều làm GIẢM tác động đó.\\n' +
      '— Nhiệt độ: Tăng nhiệt độ làm cân bằng dịch chuyển theo chiều thu nhiệt (ΔH > 0), giảm nhiệt độ dịch chuyển theo chiều toả nhiệt (ΔH < 0).\\n' +
      '— Áp suất: Tăng áp suất chung của hệ làm cân bằng dịch chuyển theo chiều làm giảm số phân tử khí (chiều có tổng hệ số khí nhỏ hơn), giảm áp suất dịch chuyển theo chiều tăng số phân tử khí. Nếu số phân tử khí ở hai vế bằng nhau, áp suất không ảnh hưởng.\\n' +
      '— Nồng độ: Tăng nồng độ một chất làm cân bằng dịch chuyển theo chiều làm giảm nồng độ chất đó (tiêu thụ chất đó).',
    workedExample: {
      problem:
        'Cho phản ứng thuận nghịch ở trạng thái cân bằng: N₂(g) + 3H₂(g) ⇌ 2NH₃(g). ' +
        'Biết nồng độ cân bằng của các chất là [N₂] = 0,01 M, [H₂] = 2,0 M, [NH₃] = 0,4 M. ' +
        'Tính hằng số cân bằng Kc của phản ứng ở nhiệt độ này.',
      steps: [
        'Viết biểu thức hằng số cân bằng Kc cho phản ứng: Kc = [NH₃]² / ([N₂] * [H₂]³).',
        'Thay các giá trị nồng độ cân bằng vào biểu thức: Kc = 0,4² / (0,01 * 2,0³).',
        'Tính toán giá trị: tử số = 0,4² = 0,16; mẫu số = 0,01 * 8 = 0,08.',
        'Kết quả: Kc = 0,16 / 0,08 = 2,0.',
      ],
      answer: 'Kc = 2',
    },
    checkQuestions: [
      {
        prompt:
          'Ở trạng thái cân bằng hoá học, tốc độ phản ứng thuận (vt) và tốc độ phản ứng nghịch (vn) có mối quan hệ như thế nào?',
        choices: [
          { id: 'bang', label: 'vt = vn (bằng nhau)' },
          { id: 'lon', label: 'vt > vn (thuận lớn hơn)' },
          { id: 'nho', label: 'vt < vn (thuận nhỏ hơn)' },
          { id: 'triet', label: 'Cả hai tốc độ đều bằng 0' },
        ],
        answer: { kind: 'choice', correctIds: ['bang'] },
        explain:
          'Cân bằng hoá học là trạng thái tại đó tốc độ phản ứng thuận bằng tốc độ phản ứng nghịch (vt = vn).',
      },
      {
        prompt:
          'Cho phản ứng toả nhiệt: N₂(g) + 3H₂(g) ⇌ 2NH₃(g) (ΔH < 0). ' +
          'Khi tăng nhiệt độ của hệ, cân bằng sẽ dịch chuyển theo chiều nào?',
        choices: [
          { id: 'thuan', label: 'Chiều thuận' },
          { id: 'nghich', label: 'Chiều nghịch' },
          { id: 'khong', label: 'Không dịch chuyển' },
        ],
        answer: { kind: 'choice', correctIds: ['nghich'] },
        explain:
          'Theo nguyên lí Le Chatelier, khi tăng nhiệt độ, cân bằng dịch chuyển theo chiều thu nhiệt (ΔH > 0). Vì chiều thuận toả nhiệt (ΔH < 0) nên chiều nghịch là chiều thu nhiệt. Do đó cân bằng dịch chuyển theo chiều nghịch.',
      },
    ],
    srsCards: [
      {
        hoi: 'Cân bằng hoá học là gì?',
        dap: 'Là trạng thái của phản ứng thuận nghịch khi tốc độ phản ứng thuận bằng tốc độ phản ứng nghịch (vt = vn).',
      },
      {
        hoi: 'Tại sao cân bằng hoá học gọi là cân bằng động?',
        dap: 'Vì các phản ứng thuận và nghịch vẫn tiếp tục xảy ra với tốc độ bằng nhau, không dừng lại.',
      },
      {
        hoi: 'Nguyên lí Le Chatelier phát biểu thế nào?',
        dap: 'Cân bằng dịch chuyển theo chiều chống lại tác động bên ngoài (nhiệt độ, nồng độ, áp suất) để làm giảm tác động đó.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa11-c1-b2',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Cân bằng hoá học',
    lessonNumber: 2,
    title: 'Cân bằng trong dung dịch nước',
    hook:
      'Nước nguyên chất dẫn điện cực kỳ kém, nhưng nước muối hay nước chanh lại dẫn điện rất tốt. ' +
      'Bí ẩn nằm ở sự phân li thành các hạt mang điện chuyển động tự do — gọi là ion.',
    theory:
      'SỰ ĐIỆN LI:\\n' +
      '— Sự điện li là quá trình phân li các chất trong nước thành các ion.\\n' +
      '— Chất điện li mạnh: phân li hoàn toàn thành ion khi tan trong nước (gồm acid mạnh như HCl, HNO₃, H₂SO₄; base mạnh như NaOH, KOH, Ca(OH)₂; và hầu hết muối). Dùng mũi tên một chiều (→).\\n' +
      '— Chất điện li yếu: chỉ phân li một phần thành ion (gồm acid yếu như CH₃COOH, H₂CO₃, H₂S; base yếu như NH₃; nước). Dùng mũi tên hai chiều (⇌).\\n\\n' +
      'THUYẾT ACID - BASE CỦA BRØNSTED - LOWRY:\\n' +
      '— Acid là chất nhường proton (H⁺).\\n' +
      '— Base là chất nhận proton (H⁺).\\n' +
      '— Ví dụ: NH₃ + H₂O ⇌ NH₄⁺ + OH⁻. H₂O nhường H⁺ cho NH₃ nên H₂O là acid; NH₃ nhận H⁺ tạo NH₄⁺ nên NH₃ là base.\\n\\n' +
      'TÍCH SỐ ION CỦA NƯỚC VÀ pH:\\n' +
      '— Sự tự điện li của nước: H₂O ⇌ H⁺ + OH⁻. Ở 25 °C, tích số ion của nước là Kw = [H⁺][OH⁻] = 10⁻¹⁴.\\n' +
      '— Khái niệm pH: pH = −log[H⁺].\\n' +
      '— Môi trường: Trung tính (pH = 7, [H⁺] = 10⁻⁷ M); Acid (pH < 7, [H⁺] > 10⁻⁷ M); Base (pH > 7, [H⁺] < 10⁻⁷ M).\\n' +
      '— Chất chỉ thị màu: Quỳ tím (hoá đỏ trong acid, hoá xanh trong base); Phenolphthalein (hoá hồng trong base, không màu trong acid/trung tính).\\n\\n' +
      'CHUẨN ĐỘ ACID - BASE:\\n' +
      '— Chuẩn độ là phương pháp xác định nồng độ của một chất bằng một dung dịch chuẩn đã biết nồng độ.\\n' +
      '— Điểm tương đương là thời điểm acid và base phản ứng vừa đủ với nhau, nhận biết qua sự đổi màu đột ngột của chất chỉ thị.',
    workedExample: {
      problem: 'Tính pH của dung dịch chứa HCl 0,001 M ở 25 °C.',
      steps: [
        'HCl là acid mạnh, điện li hoàn toàn trong nước: HCl → H⁺ + Cl⁻.',
        'Vì phân li hoàn toàn nên nồng độ H⁺ sinh ra bằng nồng độ ban đầu của HCl: [H⁺] = 0,001 M = 10⁻³ M.',
        'Áp dụng công thức tính pH: pH = −log[H⁺] = −log(10⁻³).',
        'Kết quả: pH = 3.',
      ],
      answer: 'pH = 3',
    },
    checkQuestions: [
      {
        prompt: 'Theo thuyết Brønsted - Lowry, base là chất có khả năng làm gì?',
        choices: [
          { id: 'nhuong', label: 'Nhường proton (H⁺)' },
          { id: 'nhan', label: 'Nhận proton (H⁺)' },
          { id: 'electron', label: 'Nhường cặp electron' },
          { id: 'dienli', label: 'Điện li ra ion OH⁻' },
        ],
        answer: { kind: 'choice', correctIds: ['nhan'] },
        explain:
          'Theo thuyết Brønsted - Lowry, base là chất nhận proton (H⁺), acid là chất nhường proton (H⁺).',
      },
      {
        prompt: 'Một dung dịch có nồng độ [H⁺] = 10⁻⁹ M ở 25 °C. Hãy tính pH của dung dịch này.',
        answer: { kind: 'numeric', value: 9 },
        explain: 'Theo công thức: pH = −log[H⁺] = −log(10⁻⁹) = 9.',
      },
    ],
    srsCards: [
      {
        hoi: 'Chất điện li mạnh là gì?',
        dap: 'Là chất phân li hoàn toàn thành ion khi tan trong nước (acid mạnh, base mạnh, hầu hết muối).',
      },
      {
        hoi: 'Định nghĩa acid và base theo Brønsted - Lowry?',
        dap: 'Acid nhường proton (H⁺); Base nhận proton (H⁺).',
      },
      { hoi: 'Tích số ion của nước Kw ở 25 °C bằng bao nhiêu?', dap: 'Kw = [H⁺][OH⁻] = 10⁻¹⁴.' },
      { hoi: 'Công thức tính pH?', dap: 'pH = −log[H⁺].' },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa11-c1-b3',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Cân bằng hoá học',
    lessonNumber: 3,
    title: 'Ôn tập chương 1',
    hook:
      'Cân bằng hoá học và cân bằng trong dung dịch là nền tảng cốt lõi giải thích hoạt động của cơ thể ' +
      '(như hệ đệm pH trong máu) cho đến các nhà máy sản xuất hoá chất quy mô lớn.',
    theory:
      'HỆ THỐNG HOÁ KIẾN THỨC CHƯƠNG 1:\\n' +
      '1. Cân bằng hoá học là trạng thái động, vt = vn. Kc chỉ phụ thuộc vào nhiệt độ, không phụ thuộc vào nồng độ các chất.\\n' +
      '2. Chuyển dịch cân bằng tuân theo nguyên lí Le Chatelier. Các yếu tố ảnh hưởng gồm: Nhiệt độ (luôn ảnh hưởng), Nồng độ, Áp suất (chỉ ảnh hưởng khi có chất khí và có sự thay đổi số phân tử khí).\\n' +
      '3. Sự điện li chia làm điện li mạnh (→) và điện li yếu (⇌).\\n' +
      '4. Thuyết acid-base của Brønsted-Lowry mở rộng khái niệm acid/base không chỉ giới hạn trong nước (acid nhường H⁺, base nhận H⁺).\\n' +
      '5. Môi trường acid pH < 7, trung tính pH = 7, base pH > 7 (ở 25 °C). Chuẩn độ acid-base dựa trên phản ứng trung hoà giữa H⁺ và OH⁻.',
    workedExample: {
      problem:
        'Trộn 100 mL dung dịch acid mạnh HNO₃ 0,1 M với 100 mL dung dịch base mạnh NaOH 0,1 M ở 25 °C. ' +
        'Tính pH của dung dịch sau khi trộn.',
      steps: [
        'Tính số mol H⁺ từ HNO₃: nH⁺ = 0,1 M * 0,1 L = 0,01 mol.',
        'Tính số mol OH⁻ từ NaOH: nOH⁻ = 0,1 M * 0,1 L = 0,01 mol.',
        'Viết phương trình ion rút gọn của phản ứng trung hoà: H⁺ + OH⁻ → H₂O.',
        'Vì nH⁺ = nOH⁻ = 0,01 mol nên hai chất phản ứng vừa đủ với nhau.',
        'Dung dịch sau phản ứng chỉ chứa muối trung tính NaNO₃ và nước, không dư acid hay base. Môi trường trung tính.',
        'Kết quả ở 25 °C: pH = 7.',
      ],
      answer: 'pH = 7',
    },
    checkQuestions: [
      {
        prompt: 'Phản ứng nào sau đây thuộc loại phản ứng thuận nghịch?',
        choices: [
          { id: 'a', label: 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g)' },
          { id: 'b', label: 'NaOH + HCl → NaCl + H₂O' },
          { id: 'c', label: '2H₂ + O₂ → 2H₂O (đốt cháy)' },
          { id: 'd', label: 'Fe + 2HCl → FeCl₂ + H₂' },
        ],
        answer: { kind: 'choice', correctIds: ['a'] },
        explain:
          'Phản ứng tổng hợp NH₃ là phản ứng thuận nghịch nổi tiếng (sử dụng mũi tên hai chiều ⇌). Các phản ứng còn lại đều xảy ra một chiều đến cùng.',
      },
      {
        prompt: 'Dung dịch chất nào sau đây làm quỳ tím chuyển sang màu đỏ?',
        choices: [
          { id: 'hcl', label: 'HCl 0,1 M' },
          { id: 'naoh', label: 'NaOH 0,1 M' },
          { id: 'nacl', label: 'NaCl 0,1 M' },
          { id: 'c2h5oh', label: 'C₂H₅OH (ethanol)' },
        ],
        answer: { kind: 'choice', correctIds: ['hcl'] },
        explain:
          'HCl là acid mạnh, tạo môi trường acid (pH < 7) làm quỳ tím hoá đỏ. NaOH làm quỳ tím hoá xanh. NaCl và ethanol trung tính không làm đổi màu quỳ.',
      },
    ],
    srsCards: [
      { hoi: 'Kc thay đổi khi nào?', dap: 'Chỉ thay đổi khi nhiệt độ thay đổi.' },
      {
        hoi: 'Chất xúc tác có làm cân bằng chuyển dịch không?',
        dap: 'Không. Chất xúc tác chỉ làm phản ứng nhanh đạt tới trạng thái cân bằng hơn (tăng cả vt và vn lên cùng số lần).',
      },
      {
        hoi: 'Tại sao chuẩn độ acid-base cần chất chỉ thị?',
        dap: 'Để nhận biết thời điểm dừng chuẩn độ (điểm tương đương) khi acid và base phản ứng vừa đủ.',
      },
    ],
    reviewStatus: 'draft',
  },
]
