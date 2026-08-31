// lessons/hoa11c2.ts — Hoá học 11, Chương 2: Nitrogen - Sulfur (6 bài).
// Đối chiếu mục lục thật: tai-lieu-sgk/SGK-Hoa/11/page_0004.png (OCR 2026-08-31).
// reviewStatus='draft' — soạn từ docs/research/kho-kien-thuc-hoa-gdpt2018.md §3, chưa duyệt.
import type { ChemLesson } from '../lessonTypes.js'

export const HOA11_C2_LESSONS: ChemLesson[] = [
  {
    id: 'hoa11-c2-b4',
    grade: '11',
    chapterNumber: 2,
    chapterTitle: 'Nitrogen - Sulfur',
    lessonNumber: 4,
    title: 'Nitrogen',
    hook:
      'Khí nitrogen chiếm tới 78% thể tích không khí xung quanh ta, nhưng con người và thực vật ' +
      'không thể trực tiếp "hít thở" để lấy đạm. Lý do là liên kết ba siêu bền giữa hai nguyên tử.',
    theory:
      'TRẠNG THÁI TỰ NHIÊN VÀ CẤU TẠO:\\n' +
      '— Nitrogen (N) thuộc nhóm VA, chu kì 2. Phân tử nitrogen gồm 2 nguyên tử (N₂).\\n' +
      '— Công thức electron: :N⋮⋮N:; công thức cấu tạo: N≡N.\\n' +
      '— Năng lượng liên kết rất lớn (946 kJ/mol) làm N₂ rất bền ở nhiệt độ thường (trơ về mặt hoá học).\\n\\n' +
      'TÍNH CHẤT HOÁ HỌC CƠ BẢN:\\n' +
      'Nitrogen vừa có tính khử, vừa có tính oxi hoá (do số oxi hoá 0 là trung gian, có thể giảm xuống −3 hoặc tăng lên +1, +2, +3, +4, +5).\\n' +
      '1. Tính oxi hoá (thể hiện khi tác dụng với chất khử mạnh hơn như kim loại, hydrogen):\\n' +
      '   — Tác dụng với hydrogen ở nhiệt độ cao, áp suất cao, xúc tác: N₂ + 3H₂ ⇌ 2NH₃ (phản ứng thuận nghịch, toả nhiệt).\\n' +
      '   — Tác dụng với kim loại ở nhiệt độ cao (riêng Lithium phản ứng ngay ở nhiệt độ thường): 3Mg + N₂ → Mg₃N₂.\\n' +
      '2. Tính khử (thể hiện khi tác dụng với chất oxi hoá mạnh hơn như oxygen):\\n' +
      '   — Ở nhiệt độ rất cao (khoảng 3000 °C hoặc tia lửa điện): N₂ + O₂ ⇌ 2NO (Nitric oxide, khí không màu, hoá nâu ngoài không khí tạo NO₂).',
    workedExample: {
      problem:
        'Trong công nghiệp, người ta sản xuất NH₃ từ N₂ và H₂ ở nhiệt độ 450 °C, áp suất 200 bar, ' +
        'xúc tác Fe. Để tăng hiệu suất của phản ứng toả nhiệt này: N₂(g) + 3H₂(g) ⇌ 2NH₃(g) (ΔH < 0), ' +
        'ta nên tăng hay giảm áp suất của hệ phản ứng? Giải thích.',
      steps: [
        'Đếm số phân tử khí ở hai vế phương trình: vế trái có 1 (N₂) + 3 (H₂) = 4 phân tử khí; vế phải có 2 (NH₃) phân tử khí.',
        'Vì tổng số phân tử khí vế trái (4) lớn hơn vế phải (2) nên khi tăng áp suất, cân bằng dịch chuyển theo chiều làm giảm số phân tử khí.',
        'Chiều làm giảm số phân tử khí là chiều thuận (4 → 2) tạo ra NH₃.',
        'Kết luận: Cần TĂNG áp suất của hệ phản ứng để cân bằng dịch chuyển theo chiều thuận, làm tăng hiệu suất tạo NH₃.',
      ],
      answer: 'Tăng áp suất',
    },
    checkQuestions: [
      {
        prompt: 'Liên kết trong phân tử N₂ là loại liên kết nào?',
        choices: [
          { id: 'don', label: 'Liên kết đơn' },
          { id: 'doi', label: 'Liên kết đôi' },
          { id: 'ba', label: 'Liên kết ba' },
          { id: 'ion', label: 'Liên kết ion' },
        ],
        answer: { kind: 'choice', correctIds: ['ba'] },
        explain:
          'Phân tử N₂ có công thức cấu tạo N≡N, tức là có liên kết ba cộng hoá trị không cực bền vững.',
      },
      {
        prompt:
          'Khí NO (nitric oxide) sinh ra khi giông bão có sấm sét hoá nâu ngoài không khí tạo thành khí nào?',
        choices: [
          { id: 'no2', label: 'NO₂ (nitrogen dioxide, màu nâu đỏ)' },
          { id: 'n2o', label: 'N₂O (dinitrogen monoxide, khí cười)' },
          { id: 'n2o5', label: 'N₂O₅' },
          { id: 'nh3', label: 'NH₃ (ammonia)' },
        ],
        answer: { kind: 'choice', correctIds: ['no2'] },
        explain:
          'NO tác dụng ngay với oxygen trong không khí ở điều kiện thường tạo khí NO₂ màu nâu đỏ: 2NO + O₂ → 2NO₂.',
      },
    ],
    srsCards: [
      {
        hoi: 'Tại sao nitrogen trơ ở nhiệt độ thường?',
        dap: 'Vì phân tử N₂ có liên kết ba N≡N siêu bền, năng lượng liên kết rất lớn (946 kJ/mol).',
      },
      {
        hoi: 'Nitrogen thể hiện tính chất gì khi tác dụng với hydrogen?',
        dap: 'Thể hiện tính oxi hoá (số oxi hoá giảm từ 0 xuống −3).',
      },
      { hoi: 'Khí NO hoá nâu ngoài không khí tạo chất gì?', dap: 'Khí NO₂ màu nâu đỏ.' },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa11-c2-b5',
    grade: '11',
    chapterNumber: 2,
    chapterTitle: 'Nitrogen - Sulfur',
    lessonNumber: 5,
    title: 'Ammonia - Muối ammonium',
    hook:
      'Ammonia là hợp chất nhân tạo quan trọng hàng đầu thế giới, là nguyên liệu sản xuất phân bón đạm ' +
      'nuôi sống một nửa dân số toàn cầu. Khí này có mùi khai đặc trưng.',
    theory:
      'AMMONIA (NH₃):\\n' +
      '— Cấu tạo: Nguyên tử N liên kết với 3 nguyên tử H bằng liên kết cộng hoá trị phân cực. Phân tử có hình chóp tam giác. Nguyên tử N còn một cặp electron tự do chưa tham gia liên kết.\\n' +
      '— Tính chất vật lí: Khí không màu, mùi khai và sốc, nhẹ hơn không khí. NH₃ tan RẤT NHIỀU trong nước do tạo liên kết hydrogen mạnh với nước.\\n' +
      '— Tính chất hoá học:\\n' +
      '  1. Tính base yếu: Dung dịch NH₃ làm quỳ tím hoá xanh, phenolphthalein hoá hồng. Tác dụng với acid tạo muối ammonium: NH₃ + HCl → NH₄Cl.\\n' +
      '  2. Tính khử (do N có số oxi hoá cực tiểu −3): Phản ứng cháy trong oxygen: 4NH₃ + 3O₂ → 2N₂ + 6H₂O (nhiệt độ cao).\\n\\n' +
      'MUỐI AMMONIUM (chứa ion NH₄⁺):\\n' +
      '— Tính chất: Đều dễ tan trong nước, điện li mạnh thành ion: NH₄Cl → NH₄⁺ + Cl⁻.\\n' +
      '— Phản ứng với dung dịch kiềm (dùng để nhận biết ion ammonium): NH₄⁺ + OH⁻ → NH₃↑ + H₂O (khí thoát ra mùi khai, làm quỳ tím ẩm hoá xanh).\\n' +
      '— Kém bền nhiệt (bị phân huỷ khi đun nóng): NH₄Cl(r) → NH₃(k) + HCl(k).',
    workedExample: {
      problem:
        'Nhỏ dung dịch NaOH vào ống nghiệm đựng dung dịch muối ammonium chloride NH₄Cl, thấy có khí ' +
        'không màu thoát ra. Viết phương trình ion rút gọn của phản ứng này.',
      steps: [
        'NaOH phân li tạo Na⁺ và OH⁻; NH₄Cl phân li tạo NH₄⁺ và Cl⁻.',
        'Phản ứng xảy ra giữa ion NH₄⁺ và OH⁻: NH₄⁺ + OH⁻ ⇌ NH₃↑ + H₂O.',
        'Khí thoát ra là NH₃ có mùi khai đặc trưng.',
        'Phương trình ion rút gọn thu được là NH₄⁺ + OH⁻ → NH₃ + H₂O.',
      ],
      answer: 'NH4+ + OH- -> NH3 + H2O',
    },
    checkQuestions: [
      {
        prompt:
          'Khi hoà tan khí NH₃ vào nước, dung dịch thu được làm chỉ thị phenolphthalein chuyển sang màu gì?',
        choices: [
          { id: 'do', label: 'Đỏ' },
          { id: 'xanh', label: 'Xanh' },
          { id: 'hong', label: 'Hồng' },
          { id: 'khong', label: 'Không đổi màu' },
        ],
        answer: { kind: 'choice', correctIds: ['hong'] },
        explain:
          'Dung dịch NH₃ có tính base yếu, làm quỳ tím hoá xanh và phenolphthalein hoá hồng.',
      },
      {
        prompt:
          'Để nhận biết ion ammonium (NH₄⁺) trong dung dịch, người ta đun nóng dung dịch đó với dung dịch chất nào?',
        choices: [
          { id: 'hcl', label: 'HCl' },
          { id: 'naoh', label: 'NaOH' },
          { id: 'nacl', label: 'NaCl' },
          { id: 'h2so4', label: 'H₂SO₄' },
        ],
        answer: { kind: 'choice', correctIds: ['naoh'] },
        explain:
          'NaOH cung cấp ion OH⁻. Khi đun nóng, NH₄⁺ phản ứng với OH⁻ giải phóng khí NH₃ mùi khai, làm xanh giấy quỳ ẩm.',
      },
    ],
    srsCards: [
      {
        hoi: 'Tại sao NH₃ tan rất nhiều trong nước?',
        dap: 'Vì NH₃ tạo được liên kết hydrogen liên phân tử mạnh với phân tử nước.',
      },
      {
        hoi: 'Hai tính chất hoá học đặc trưng của NH₃ là gì?',
        dap: 'Tính base yếu và tính khử (do số oxi hoá −3).',
      },
      {
        hoi: 'Hiện tượng nhận biết muối ammonium tác dụng với kiềm?',
        dap: 'Sinh khí mùi khai (NH₃) làm hoá xanh giấy quỳ ẩm.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa11-c2-b6',
    grade: '11',
    chapterNumber: 2,
    chapterTitle: 'Nitrogen - Sulfur',
    lessonNumber: 6,
    title: 'Một số hợp chất của nitrogen với oxygen',
    hook:
      'Axit nitric (HNO₃) là một axit mạnh và chất oxi hoá cực mạnh. Nó có thể hoà tan được cả đồng (Cu) ' +
      '— kim loại trơ mà axit dạ dày HCl cũng phải "bó tay".',
    theory:
      'CÁC OXIDE CỦA NITROGEN (NOx):\\n' +
      '— Gồm: N₂O (khí cười), NO (không màu, hoá nâu ngoài không khí), NO₂ (màu nâu đỏ, độc), N₂O₄ (không màu).\\n' +
      '— Khí NOx phát thải từ động cơ đốt trong, nhà máy nhiệt điện là nguyên nhân chính gây mưa acid và khói mù quang hoá.\\n\\n' +
      'ACID NITRIC (HNO₃):\\n' +
      '1. Tính acid mạnh: Là một trong các acid vô cơ mạnh nhất, điện li hoàn toàn: HNO₃ → H⁺ + NO₃⁻.\\n' +
      '2. Tính oxi hoá mạnh (đặc trưng nhất):\\n' +
      '   — Do N có số oxi hoá cực đại +5 trong HNO₃, nó luôn bị khử xuống số oxi hoá thấp hơn (NO₂, NO, N₂O, N₂, NH₄⁺).\\n' +
      '   — Oxi hoá hầu hết kim loại (trừ vàng Au, bạch kim Pt) tạo muối nitrate của kim loại có số oxi hoá cao nhất, KHÔNG giải phóng khí H₂.\\n' +
      '   — HNO₃ đặc tạo khí NO₂ màu nâu đỏ; HNO₃ loãng tạo khí NO không màu hoá nâu.\\n\\n' +
      'HIỆN TƯỢNG MƯA ACID:\\n' +
      '— Mưa acid là nước mưa có pH < 5,6, hình thành do các khí khí thải độc hại như SO₂ và NOx tan trong nước mưa tạo thành acid mạnh tương ứng (H₂SO₄, HNO₃).' +
      ' Tác hại: tàn phá rừng, huỷ hoại sinh vật thuỷ sinh, ăn mòn công trình kiến trúc bằng đá và kim loại.',
    workedExample: {
      problem:
        'Cho kim loại Copper (đồng, Cu) phản ứng với dung dịch HNO₃ loãng dư, sinh ra khí nitric oxide (NO) ' +
        'không màu. Viết phương trình hoá học dạng phân tử đã cân bằng của phản ứng này.',
      steps: [
        'Xác định chất phản ứng và sản phẩm: Cu + HNO₃ → Cu(NO₃)₂ + NO + H₂O.',
        'Xác định số oxi hoá thay đổi: Cu (0 → +2); N (+5 → +2 trong NO).',
        'Viết quá trình oxi hoá và khử:\\n  Cu → Cu²⁺ + 2e (nhường 2e)\\n  N⁺⁵ + 3e → N⁺² (nhận 3e).',
        'Thăng bằng electron: nhân hệ số 3 vào Cu, nhân hệ số 2 vào N⁺².\\n  3Cu + 8HNO₃ → 3Cu(NO₃)₂ + 2NO + 4H₂O.',
        'Kiểm tra cân bằng nguyên tố H và O: vế trái có 8 H, vế phải có 4×2=8 H. Cân bằng hoàn tất.',
      ],
      answer: '3Cu + 8HNO3 -> 3Cu(NO3)2 + 2NO + 4H2O',
    },
    checkQuestions: [
      {
        prompt: 'Khí chính nào sau đây là nguyên nhân gây ra hiện tượng mưa acid?',
        choices: [
          { id: 'co2', label: 'CO₂ và CH₄' },
          { id: 'so2', label: 'SO₂ và các oxide của nitrogen (NOx)' },
          { id: 'o2', label: 'O₂ và N₂' },
          { id: 'cfc', label: 'CFC và O₃' },
        ],
        answer: { kind: 'choice', correctIds: ['so2'] },
        explain:
          'SO₂ và NOx (NO, NO₂) do con người thải ra không khí gặp nước mưa, oxygen tạo thành các acid H₂SO₄, HNO₃ rơi xuống gây mưa acid.',
      },
      {
        prompt:
          'Khi cho kim loại sắt (Fe) tác dụng với dung dịch HNO₃ loãng, dư thì thu được muối sắt có hoá trị mấy?',
        choices: [
          { id: 'ii', label: 'Sắt(II) (Fe²⁺)' },
          { id: 'iii', label: 'Sắt(III) (Fe³⁺)' },
          { id: 'ii_iii', label: 'Hỗn hợp sắt(II) và sắt(III)' },
          { id: 'khong', label: 'Không phản ứng' },
        ],
        answer: { kind: 'choice', correctIds: ['iii'] },
        explain:
          'Vì HNO₃ dư có tính oxi hoá rất mạnh nên sẽ oxi hoá kim loại sắt lên mức oxi hoá cao nhất là sắt(III) (+3), tạo muối Fe(NO₃)₃.',
      },
    ],
    srsCards: [
      {
        hoi: 'Khí NOx và SO₂ gây ra hiện tượng gì?',
        dap: 'Hiện tượng mưa acid (nước mưa có pH < 5,6).',
      },
      {
        hoi: 'Tính chất đặc trưng của HNO₃ khác axit thường thế nào?',
        dap: 'Tính oxi hoá rất mạnh, tác dụng kim loại tạo muối hoá trị cao nhất và khí (NO, NO₂...), không tạo H₂.',
      },
      { hoi: 'Khí sinh ra khi kim loại tác dụng với HNO₃ đặc?', dap: 'Khí NO₂ màu nâu đỏ.' },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa11-c2-b7',
    grade: '11',
    chapterNumber: 2,
    chapterTitle: 'Nitrogen - Sulfur',
    lessonNumber: 7,
    title: 'Sulfur và sulfur dioxide',
    hook:
      'Lưu huỳnh (Sulfur) là chất rắn màu vàng, gắn liền với núi lửa và là thành phần của thuốc súng đen.' +
      ' Khi đốt cháy lưu huỳnh, ta thu được khí SO₂ có mùi hắc nghẹt thở.',
    theory:
      'ĐƠN CHẤT SULFUR (S):\\n' +
      '— Cấu tạo: Ở nhiệt độ thường gồm 8 nguyên tử liên kết vòng (S₈), thường viết đơn giản là S.\\n' +
      '— Tính chất hoá học: Có số oxi hoá trung gian 0, nên vừa có tính oxi hoá vừa có tính khử.\\n' +
      '  1. Tính oxi hoá: Tác dụng với kim loại tạo muối sulfide: Fe + S → FeS (t °C); tác dụng với thủy ngân ở nhiệt độ thường (dùng để thu gom thủy ngân rơi vỡ): Hg + S → HgS.\\n' +
      '  2. Tính khử: Tác dụng với chất oxi hoá mạnh (như O₂): S + O₂ → SO₂ (t °C).\\n\\n' +
      'SULFUR DIOXIDE (SO₂):\\n' +
      '— Tính chất vật lí: Khí không màu, mùi hắc, nặng hơn không khí, độc, tan nhiều trong nước tạo dung dịch acid yếu sulfurous (H₂SO₃).\\n' +
      '— Tính chất hoá học:\\n' +
      '  1. Là acidic oxide: Tác dụng với dung dịch base tạo muối sulfite/hydrogen sulfite.\\n' +
      '  2. Tính khử (SO₂ phản ứng với chất oxi hoá mạnh): Làm mất màu nước Bromine: SO₂ + Br₂ + 2H₂O → H₂SO₄ + 2HBr (ứng dụng nhận biết SO₂).\\n' +
      '  3. Tính oxi hoá (SO₂ phản ứng với chất khử mạnh): SO₂ + 2H₂S → 3S↓ + 2H₂O (tạo lưu huỳnh kết tủa màu vàng).',
    workedExample: {
      problem:
        'Viết phương trình hoá học thể hiện tính khử của khí sulfur dioxide (SO₂) khi sục khí này vào dung dịch nước bromine (Br₂).',
      steps: [
        'Xác định chất phản ứng: SO₂ (chất khử), Br₂ (chất oxi hoá), H₂O.',
        'Xác định sản phẩm: Sulfur bị oxi hoá từ +4 lên +6 (H₂SO₄); Bromine bị khử từ 0 xuống −1 (HBr).',
        'Viết phương trình phản ứng: SO₂ + Br₂ + 2H₂O → H₂SO₄ + 2HBr.',
        'Kiểm tra cân bằng nguyên tố: vế trái có 4 H, vế phải có 2 + 2 = 4 H. Đã cân bằng.',
      ],
      answer: 'SO2 + Br2 + 2H2O -> H2SO4 + 2HBr',
    },
    checkQuestions: [
      {
        prompt:
          'Ứng dụng thực tế của sulfur để thu gom kim loại độc thủy ngân (Hg) rơi vỡ dựa vào phản ứng nào ở nhiệt độ thường?',
        choices: [
          { id: 'a', label: 'Hg + S → HgS' },
          { id: 'b', label: '2Hg + O₂ → 2HgO' },
          { id: 'c', label: 'Hg + Cl₂ → HgCl₂' },
        ],
        answer: { kind: 'choice', correctIds: ['a'] },
        explain:
          'Sulfur (S) phản ứng ngay với thủy ngân (Hg) ở nhiệt độ thường tạo thành muối HgS không bay hơi, không độc, dễ thu dọn.',
      },
      {
        prompt: 'Khí SO₂ làm mất màu dung dịch nào sau đây nhờ tính khử của nó?',
        choices: [
          { id: 'brom', label: 'Dung dịch nước Bromine (Br₂)' },
          { id: 'hcl', label: 'Dung dịch HCl' },
          { id: 'nacl', label: 'Dung dịch NaCl' },
        ],
        answer: { kind: 'choice', correctIds: ['brom'] },
        explain:
          'SO₂ có tính khử mạnh, phản ứng với nước bromine làm mất màu nâu đỏ của bromine: SO₂ + Br₂ + 2H₂O → H₂SO₄ + 2HBr.',
      },
    ],
    srsCards: [
      {
        hoi: 'Lưu huỳnh thể hiện tính oxi hoá khi phản ứng với chất nào?',
        dap: 'Khi phản ứng với kim loại (như Fe, Zn, Hg) và hydrogen.',
      },
      {
        hoi: 'Chất nào dùng để xử lý sự cố tràn thuỷ ngân?',
        dap: 'Bột lưu huỳnh (S) vì phản ứng xảy ra ngay ở nhiệt độ thường tạo muối HgS kết tủa.',
      },
      {
        hoi: 'Hiện tượng khi sục khí SO₂ vào nước bromine?',
        dap: 'Dung dịch bromine bị mất màu nâu đỏ.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa11-c2-b8',
    grade: '11',
    chapterNumber: 2,
    chapterTitle: 'Nitrogen - Sulfur',
    lessonNumber: 8,
    title: 'Sulfuric acid và muối sulfate',
    hook:
      'Sulfuric acid (H₂SO₄) đậm đặc háo nước đến mức có thể "hút" nước từ phân tử đường ăn (sucrose), ' +
      'biến đống đường trắng tinh thành một cột than đen xì bốc khói nóng bỏng.',
    theory:
      'SULFURIC ACID (H₂SO₄):\\n' +
      '— Axit loãng: Mang đầy đủ tính chất chung của axit mạnh (đổi màu quỳ tím sang đỏ; tác dụng kim loại trước H giải phóng H₂; tác dụng base, basic oxide, muối).\\n' +
      '— Axit đặc (tính chất đặc biệt):\\n' +
      '  1. Tính oxi hoá cực mạnh (do S⁺⁶ ở số oxi hoá cao nhất): Tác dụng hầu hết kim loại (trừ Au, Pt) giải phóng sản phẩm khử như SO₂, S, H₂S; không tạo khí H₂. Thụ động hoá Al, Fe, Cr trong H₂SO₄ đặc, nguội.\\n' +
      '  2. Tính háo nước mạnh: Chiếm nước từ chất hữu cơ (như tinh bột, đường...) hoá đen chất đó (cacbon hoá). Khi pha loãng, phải rót TỪ TỪ axit đặc vào nước dọc theo đũa thuỷ tinh và khuấy đều; KHÔNG được làm ngược lại vì sẽ gây nổ bỏng.\\n\\n' +
      'MUỐI SULFATE VÀ NHẬN BIẾT ION SULFATE (SO₄²⁻):\\n' +
      '— Hầu hết các muối sulfate đều dễ tan, ngoại trừ BaSO₄ (kết tủa trắng, không tan trong axit mạnh), PbSO₄, và ít tan như CaSO₄, Ag₂SO₄.\\n' +
      '— Nhận biết ion SO₄²⁻: Dùng ion Ba²⁺ (từ dung dịch BaCl₂ hoặc Ba(OH)₂), phản ứng tạo kết tủa trắng BaSO₄ không tan trong axit mạnh: Ba²⁺ + SO₄²⁻ → BaSO₄↓.',
    workedExample: {
      problem: 'Trình bày cách pha loãng dung dịch H₂SO₄ đặc an toàn trong phòng thí nghiệm.',
      steps: [
        'Chuẩn bị một cốc nước cất.',
        'Rót từ từ, từng giọt axit H₂SO₄ đặc dọc theo đũa thuỷ tinh vào cốc nước.',
        'Khuấy nhẹ đều dung dịch bằng đũa thuỷ tinh.',
        'Lưu ý tuyệt đối: KHÔNG được rót nước vào axit đặc vì quá trình hoà tan toả nhiệt rất lớn làm nước sôi đột ngột kéo theo các giọt axit đặc bắn ra ngoài gây bỏng cực kỳ nguy hiểm.',
      ],
      answer: 'Rót từ từ axit đặc vào nước',
    },
    checkQuestions: [
      {
        prompt:
          'Để nhận biết ion sulfate (SO₄²⁻) trong dung dịch, người ta sử dụng dung dịch chứa ion nào sau đây?',
        choices: [
          { id: 'ba', label: 'Barium (Ba²⁺)' },
          { id: 'na', label: 'Sodium (Na⁺)' },
          { id: 'cl', label: 'Chloride (Cl⁻)' },
          { id: 'no3', label: 'Nitrate (NO₃⁻)' },
        ],
        answer: { kind: 'choice', correctIds: ['ba'] },
        explain:
          'Dùng Ba²⁺ (như dung dịch BaCl₂) để tạo kết tủa trắng BaSO₄ không tan trong axit mạnh: Ba²⁺ + SO₄²⁻ → BaSO₄↓.',
      },
      {
        prompt:
          'Kim loại nào sau đây bị THỤ ĐỘNG HOÁ (không phản ứng) trong dung dịch H₂SO₄ đặc, nguội?',
        choices: [
          { id: 'cu', label: 'Copper (Cu)' },
          { id: 'zn', label: 'Zinc (Zn)' },
          { id: 'fe', label: 'Iron (Fe)' },
          { id: 'mg', label: 'Magnesium (Mg)' },
        ],
        answer: { kind: 'choice', correctIds: ['fe'] },
        explain:
          'Sắt (Fe), Aluminium (Al), và Chromium (Cr) bị thụ động hoá trong dung dịch axit nitric đặc, nguội và sulfuric acid đặc, nguội.',
      },
    ],
    srsCards: [
      {
        hoi: 'Quy tắc pha loãng H₂SO₄ đặc an toàn?',
        dap: 'Rót từ từ axit đặc vào nước, không làm ngược lại.',
      },
      {
        hoi: 'Tính chất đặc trưng của H₂SO₄ đặc là gì?',
        dap: 'Tính oxi hoá cực mạnh và tính háo nước mạnh.',
      },
      {
        hoi: 'Thuốc thử và hiện tượng nhận biết ion SO₄²⁻?',
        dap: 'Dung dịch chứa ion Ba²⁺ (như BaCl₂), tạo kết tủa trắng BaSO₄ không tan trong axit.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa11-c2-b9',
    grade: '11',
    chapterNumber: 2,
    chapterTitle: 'Nitrogen - Sulfur',
    lessonNumber: 9,
    title: 'Ôn tập chương 2',
    hook:
      'Chương 2 giới thiệu cho chúng ta hai phi kim nhóm A phi thường: Nitrogen và Sulfur. ' +
      'Các hợp chất của chúng chi phối cả nông nghiệp và công nghiệp nặng.',
    theory:
      'HỆ THỐNG HOÁ KIẾN THỨC CHƯƠNG 2:\\n' +
      '1. Nitrogen (N₂): trơ ở nhiệt độ thường do liên kết ba N≡N. Có cả tính khử và tính oxi hoá.\\n' +
      '2. Ammonia (NH₃): phân tử phân cực, có tính base yếu và tính khử. Muối ammonium kém bền nhiệt, giải phóng NH₃ khi đun nóng với kiềm.\\n' +
      '3. Acid Nitric (HNO₃): acid mạnh, chất oxi hoá cực mạnh. Oxi hoá hầu hết kim loại lên hoá trị cao nhất mà không tạo H₂.\\n' +
      '4. Mưa acid: do khí SO₂ và NOx tan trong nước mưa gây ra.\\n' +
      '5. Sulfur (S): vừa có tính oxi hoá vừa có tính khử. SO₂ là acidic oxide, có tính khử (mất màu nước bromine) và tính oxi hoá (phản ứng với H₂S tạo S vàng).\\n' +
      '6. Sulfuric acid (H₂SO₄): đặc có tính oxi hoá mạnh và háo nước mạnh. Nhận biết ion SO₄²⁻ bằng kết tủa trắng BaSO₄.',
    workedExample: {
      problem:
        'Sục khí SO₂ dư vào dung dịch Ba(OH)₂ dư. Cho biết hiện tượng xảy ra và viết phương trình ion rút gọn.',
      steps: [
        'SO₂ tác dụng với dung dịch kiềm dư Ba(OH)₂ tạo muối trung hoà kết tủa.',
        'Phương trình phản ứng: SO₂ + Ba(OH)₂ → BaSO₃↓ + H₂O.',
        'Hiện tượng: xuất hiện kết tủa trắng (Barium sulfite, BaSO₃).',
        'Phương trình ion rút gọn: SO₂ + Ba²⁺ + 2OH⁻ → BaSO₃↓ + H₂O.',
      ],
      answer: 'Ba2+ + 2OH- + SO2 -> BaSO3 + H2O',
    },
    checkQuestions: [
      {
        prompt: 'Hợp chất nào sau đây của nitrogen thể hiện tính base yếu?',
        choices: [
          { id: 'nh3', label: 'NH₃ (Ammonia)' },
          { id: 'hno3', label: 'HNO₃ (Acid nitric)' },
          { id: 'nh4cl', label: 'NH₄Cl (Ammonium chloride)' },
          { id: 'no2', label: 'NO₂' },
        ],
        answer: { kind: 'choice', correctIds: ['nh3'] },
        explain:
          'NH₃ tan trong nước phân li ra ion OH⁻ thể hiện tính base yếu: NH₃ + H₂O ⇌ NH₄⁺ + OH⁻.',
      },
      {
        prompt: 'Để nhận biết muối chứa ion SO₄²⁻ trong các mẫu thử, ta nhỏ dung dịch nào sau đây?',
        choices: [
          { id: 'bacl2', label: 'BaCl₂' },
          { id: 'nacl', label: 'NaCl' },
          { id: 'hcl', label: 'HCl' },
          { id: 'nano3', label: 'NaNO₃' },
        ],
        answer: { kind: 'choice', correctIds: ['bacl2'] },
        explain:
          'BaCl₂ phân li ra ion Ba²⁺, ion này kết hợp với SO₄²⁻ tạo kết tủa trắng BaSO₄ không tan trong axit.',
      },
    ],
    srsCards: [
      {
        hoi: 'Khí không màu hoá nâu ngoài không khí khi tác dụng với O₂?',
        dap: 'Khí nitric oxide (NO).',
      },
      { hoi: 'Khí có mùi hắc làm mất màu dung dịch bromine?', dap: 'Khí sulfur dioxide (SO₂).' },
      {
        hoi: 'Kim loại Fe phản ứng với H₂SO₄ đặc nóng tạo khí gì?',
        dap: 'Khí sulfur dioxide (SO₂).',
      },
    ],
    reviewStatus: 'draft',
  },
]
