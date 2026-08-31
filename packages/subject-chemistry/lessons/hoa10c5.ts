// lessons/hoa10c5.ts — Hoá học 10, Chương 5: Năng lượng hoá học (1 bài).
import type { ChemLesson } from '../lessonTypes.js'

export const HOA10_C5_LESSONS: ChemLesson[] = [
  {
    id: 'hoa10-c5-b14',
    grade: '10',
    chapterNumber: 5,
    chapterTitle: 'Năng lượng hoá học',
    lessonNumber: 14,
    title: 'Biến thiên enthalpy trong các phản ứng hoá học',
    hook:
      'Túi chườm lạnh y tế "kích hoạt" bằng cách bóp vỡ một gói hoá chất bên trong — phản ứng ' +
      'xảy ra HẤP THỤ nhiệt từ môi trường, làm túi lạnh đi ngay lập tức.',
    theory:
      'ENTHALPY (kí hiệu H) là một dạng năng lượng đặc trưng cho một hệ ở áp suất không đổi. ' +
      'Ta không đo được H tuyệt đối, chỉ đo được sự THAY ĐỔI enthalpy khi phản ứng xảy ra — ' +
      'gọi là BIẾN THIÊN ENTHALPY, kí hiệu ΔᵣH°₂₉₈ (đo ở điều kiện chuẩn, 25°C, 1 bar).\n\n' +
      'PHẢN ỨNG TOẢ NHIỆT: giải phóng năng lượng ra môi trường, ΔH < 0 (âm). Ví dụ: đốt cháy ' +
      'nhiên liệu, phản ứng trung hoà acid-base.\n\n' +
      'PHẢN ỨNG THU NHIỆT: hấp thụ năng lượng từ môi trường, ΔH > 0 (dương). Ví dụ: phản ứng ' +
      'nhiệt phân CaCO₃, hoà tan một số muối như NH₄NO₃ trong nước (làm lạnh — dùng trong túi ' +
      'chườm lạnh).\n\n' +
      'Cách tính ΔᵣH theo NHIỆT TẠO THÀNH chuẩn (ΔfH°): ΔᵣH° = Σ ΔfH°(sản phẩm) − Σ ΔfH°(chất ' +
      'đầu), có nhân hệ số cân bằng của mỗi chất.\n\n' +
      'Cách tính ΔᵣH theo NĂNG LƯỢNG LIÊN KẾT (Eb): ΔᵣH° = Σ Eb(liên kết bị phá vỡ ở chất ' +
      'đầu) − Σ Eb(liên kết hình thành ở sản phẩm).',
    workedExample: {
      problem:
        'Phản ứng CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l) có ΔfH°(CH₄) = −75 kJ/mol, ΔfH°(CO₂) = ' +
        '−394 kJ/mol, ΔfH°(H₂O) = −286 kJ/mol, ΔfH°(O₂) = 0 kJ/mol. Tính ΔᵣH° của phản ứng.',
      steps: [
        'Áp dụng công thức: ΔᵣH° = Σ ΔfH°(sản phẩm) − Σ ΔfH°(chất đầu), nhân đúng hệ số cân ' +
          'bằng.',
        'Sản phẩm: 1×ΔfH°(CO₂) + 2×ΔfH°(H₂O) = 1×(−394) + 2×(−286) = −394 − 572 = −966 kJ.',
        'Chất đầu: 1×ΔfH°(CH₄) + 2×ΔfH°(O₂) = 1×(−75) + 2×0 = −75 kJ.',
        'ΔᵣH° = −966 − (−75) = −891 kJ/mol.',
      ],
      answer: 'ΔᵣH° = −891 kJ/mol (phản ứng toả nhiệt mạnh — đúng bản chất phản ứng cháy).',
    },
    checkQuestions: [
      {
        prompt: 'Phản ứng toả nhiệt có giá trị ΔH như thế nào?',
        choices: [
          { id: 'am', label: 'ΔH âm (ΔH < 0)' },
          { id: 'duong', label: 'ΔH dương (ΔH > 0)' },
        ],
        answer: { kind: 'choice', correctIds: ['am'] },
        explain: 'Phản ứng toả nhiệt giải phóng năng lượng ra môi trường ⇒ ΔH < 0 theo quy ước.',
      },
      {
        prompt:
          'Phản ứng H₂(g) + Cl₂(g) → 2HCl(g) có ΔfH°(HCl) = −92 kJ/mol, ΔfH°(H₂) = ΔfH°(Cl₂) ' +
          '= 0. Tính ΔᵣH° của phản ứng (kJ/mol, chỉ nhập số).',
        answer: { kind: 'numeric', value: -184 },
        explain: 'ΔᵣH° = 2×(−92) − (0+0) = −184 kJ/mol.',
      },
    ],
    srsCards: [
      { hoi: 'Phản ứng toả nhiệt có dấu ΔH thế nào?', dap: 'ΔH < 0 (âm).' },
      { hoi: 'Phản ứng thu nhiệt có dấu ΔH thế nào?', dap: 'ΔH > 0 (dương).' },
      {
        hoi: 'Công thức tính ΔᵣH theo nhiệt tạo thành?',
        dap: 'ΔᵣH° = Σ ΔfH°(sản phẩm) − Σ ΔfH°(chất đầu), nhân hệ số cân bằng.',
      },
    ],
    reviewStatus: 'draft',
  },
]
