// lessons/hoa10c7.ts — Hoá học 10, Chương 7: Nhóm halogen (2 bài).
import type { ChemLesson } from '../lessonTypes.js'

export const HOA10_C7_LESSONS: ChemLesson[] = [
  {
    id: 'hoa10-c7-b16',
    grade: '10',
    chapterNumber: 7,
    chapterTitle: 'Nhóm halogen',
    lessonNumber: 16,
    title: 'Nhóm halogen',
    hook:
      'Nước máy có mùi Chlorine — chính nguyên tố này khử trùng nước sinh hoạt của hàng tỷ ' +
      'người mỗi ngày. Vì sao nhóm halogen lại có tính oxi hoá mạnh đến vậy?',
    theory:
      'NHÓM HALOGEN (nhóm VIIA) gồm: Fluorine (F), Chlorine (Cl), Bromine (Br), Iodine (I) — ' +
      'đều có 7 electron lớp ngoài cùng, chỉ cần nhận thêm 1 electron để đạt octet.\n\n' +
      'Vì vậy halogen có TÍNH OXI HOÁ MẠNH (dễ nhận electron) — tính oxi hoá GIẢM DẦN theo ' +
      'chiều F > Cl > Br > I (đúng xu hướng độ âm điện giảm dần khi đi xuống nhóm).\n\n' +
      'Đơn chất halogen tồn tại ở dạng PHÂN TỬ HAI NGUYÊN TỬ (X₂), liên kết cộng hoá trị ' +
      'không cực. Trạng thái ở điều kiện thường: F₂ (khí), Cl₂ (khí), Br₂ (lỏng), I₂ (rắn) — ' +
      'màu sắc và trạng thái biến đổi theo chiều tăng khối lượng phân tử.\n\n' +
      'Tính chất hoá học đặc trưng: halogen phản ứng được với hầu hết kim loại tạo muối ' +
      'halide, phản ứng với hydrogen tạo hydrogen halide (HX), và các halogen mạnh hơn có ' +
      'thể ĐẨY halogen yếu hơn ra khỏi muối halide của nó (Cl₂ đẩy được Br₂ ra khỏi dung ' +
      'dịch muối bromide, do Cl có tính oxi hoá mạnh hơn Br).',
    workedExample: {
      problem: 'Cho khí Cl₂ vào dung dịch NaBr. Dự đoán hiện tượng xảy ra và giải thích.',
      steps: [
        'So sánh tính oxi hoá: Cl có độ âm điện lớn hơn Br (Cl đứng trên Br trong nhóm VIIA) ' +
          '⇒ Cl₂ có tính oxi hoá MẠNH HƠN Br₂.',
        'Chất có tính oxi hoá mạnh hơn sẽ đẩy được chất có tính oxi hoá yếu hơn ra khỏi muối ' +
          'của nó.',
        'Phản ứng xảy ra: Cl₂ + 2NaBr → 2NaCl + Br₂.',
        'Hiện tượng: dung dịch chuyển màu (xuất hiện Br₂ màu nâu đỏ/vàng cam).',
      ],
      answer: 'Cl₂ + 2NaBr → 2NaCl + Br₂ — dung dịch chuyển màu do Br₂ sinh ra.',
    },
    checkQuestions: [
      {
        prompt: 'Tính oxi hoá của các halogen biến đổi theo chiều nào (từ mạnh đến yếu)?',
        choices: [
          { id: 'a', label: 'F > Cl > Br > I' },
          { id: 'b', label: 'I > Br > Cl > F' },
          { id: 'c', label: 'Cl > F > I > Br' },
        ],
        answer: { kind: 'choice', correctIds: ['a'] },
        explain:
          'Đúng xu hướng độ âm điện giảm dần khi đi xuống nhóm VIIA: F có tính oxi hoá mạnh nhất, I yếu nhất trong 4 halogen phổ biến.',
      },
      {
        prompt: 'Nguyên tử halogen cần nhận thêm bao nhiêu electron để đạt cấu hình octet bền?',
        answer: { kind: 'numeric', value: 1 },
        explain:
          'Halogen có 7 electron lớp ngoài cùng, chỉ cần thêm 1e để đủ 8 — đây là lý do chúng có tính oxi hoá mạnh, dễ nhận electron.',
      },
    ],
    srsCards: [
      {
        hoi: 'Nhóm halogen gồm những nguyên tố nào?',
        dap: 'Fluorine (F), Chlorine (Cl), Bromine (Br), Iodine (I) — nhóm VIIA.',
      },
      {
        hoi: 'Tính oxi hoá của halogen biến đổi thế nào từ F đến I?',
        dap: 'Giảm dần: F > Cl > Br > I.',
      },
      {
        hoi: 'Đơn chất halogen tồn tại ở dạng gì?',
        dap: 'Phân tử hai nguyên tử (X₂), liên kết cộng hoá trị không cực.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa10-c7-b17',
    grade: '10',
    chapterNumber: 7,
    chapterTitle: 'Nhóm halogen',
    lessonNumber: 17,
    title: 'Hydrogen halide và một số phản ứng của ion halide',
    hook:
      'Acid trong dạ dày (HCl) giúp tiêu hoá thức ăn, nhưng cũng là hydrogen halide — cùng ' +
      'họ hoá chất với acid dùng để khắc kính (HF).',
    theory:
      'HYDROGEN HALIDE (HX, với X = F, Cl, Br, I) là hợp chất giữa hydrogen và halogen, liên ' +
      'kết cộng hoá trị CÓ CỰC (do halogen có độ âm điện lớn hơn hydrogen).\n\n' +
      'Khi tan trong nước, hydrogen halide tạo thành HYDROHALIC ACID (dung dịch acid). Độ ' +
      'mạnh acid tăng dần: HF (acid yếu, do liên kết H-F ngắn và bền) < HCl < HBr < HI (acid ' +
      'mạnh nhất).\n\n' +
      'PHẢN ỨNG NHẬN BIẾT ION HALIDE (Cl⁻, Br⁻, I⁻) bằng dung dịch AgNO₃: tạo kết tủa với ' +
      'màu sắc đặc trưng khác nhau —\n' +
      '— AgCl: kết tủa TRẮNG\n' +
      '— AgBr: kết tủa VÀNG NHẠT\n' +
      '— AgI: kết tủa VÀNG ĐẬM\n' +
      '(F⁻ không tạo kết tủa với Ag⁺ do AgF tan trong nước — đây là ngoại lệ đáng nhớ.)\n\n' +
      'Phản ứng tổng quát: X⁻ + Ag⁺ → AgX↓ (X = Cl, Br, I).',
    workedExample: {
      problem:
        'Có 2 dung dịch không màu đựng riêng biệt: NaCl và NaBr. Nêu cách phân biệt hai dung ' +
        'dịch này bằng một thuốc thử.',
      steps: [
        'Chọn thuốc thử: dung dịch AgNO₃ (bạc nitrate).',
        'Nhỏ AgNO₃ vào từng mẫu thử.',
        'Nếu xuất hiện kết tủa TRẮNG (AgCl) ⇒ mẫu đó là dung dịch NaCl.',
        'Nếu xuất hiện kết tủa VÀNG NHẠT (AgBr) ⇒ mẫu đó là dung dịch NaBr.',
      ],
      answer: 'Dùng AgNO₃: NaCl cho kết tủa trắng (AgCl), NaBr cho kết tủa vàng nhạt (AgBr).',
    },
    checkQuestions: [
      {
        prompt: 'Ion Cl⁻ tạo kết tủa màu gì khi phản ứng với dung dịch AgNO₃?',
        choices: [
          { id: 'trang', label: 'Trắng' },
          { id: 'vangnhat', label: 'Vàng nhạt' },
          { id: 'vangdam', label: 'Vàng đậm' },
        ],
        answer: { kind: 'choice', correctIds: ['trang'] },
        explain:
          'AgCl là kết tủa TRẮNG — dùng để nhận biết ion Cl⁻ (khác với AgBr vàng nhạt, AgI vàng đậm).',
      },
      {
        prompt: 'Trong 4 acid HF, HCl, HBr, HI, acid nào MẠNH NHẤT?',
        choices: [
          { id: 'HF', label: 'HF' },
          { id: 'HI', label: 'HI' },
        ],
        answer: { kind: 'choice', correctIds: ['HI'] },
        explain:
          'Độ mạnh acid tăng dần HF < HCl < HBr < HI — HI mạnh nhất do liên kết H-I dài, dễ phân li H⁺ nhất.',
      },
    ],
    srsCards: [
      { hoi: 'Kết tủa của AgCl có màu gì?', dap: 'Trắng.' },
      { hoi: 'Kết tủa của AgBr có màu gì?', dap: 'Vàng nhạt.' },
      { hoi: 'Ion halide nào KHÔNG tạo kết tủa với Ag⁺?', dap: 'F⁻ (vì AgF tan trong nước).' },
      {
        hoi: 'Độ mạnh acid của các hydrohalic acid tăng theo chiều nào?',
        dap: 'HF < HCl < HBr < HI.',
      },
    ],
    reviewStatus: 'draft',
  },
]
