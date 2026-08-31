// lessons/hoa10c4.ts — Hoá học 10, Chương 4: Phản ứng oxi hoá - khử (1 bài).
// Mục lục thật: tai-lieu-sgk/SGK-Hoa/10/page_0005.png (OCR 2026-08-31).
import type { ChemLesson } from '../lessonTypes.js'

export const HOA10_C4_LESSONS: ChemLesson[] = [
  {
    id: 'hoa10-c4-b13',
    grade: '10',
    chapterNumber: 4,
    chapterTitle: 'Phản ứng oxi hoá - khử',
    lessonNumber: 13,
    title: 'Phản ứng oxi hoá - khử',
    hook:
      'Đinh sắt bị gỉ, pin điện thoại phóng điện, và ngọn lửa cháy — ba hiện tượng tưởng ' +
      'chẳng liên quan đều cùng một bản chất hoá học: SỰ CHUYỂN ELECTRON giữa các chất.',
    theory:
      'SỐ OXI HOÁ là điện tích giả định của một nguyên tử trong phân tử/ion, tính theo quy ' +
      'ước: nguyên tố tự do có số oxi hoá 0; trong hợp chất, H thường +1 (trừ hydride kim ' +
      'loại −1), O thường −2 (trừ peroxide −1); tổng số oxi hoá trong phân tử trung hoà = 0, ' +
      'trong ion = điện tích ion.\n\n' +
      'CHẤT KHỬ (chất bị oxi hoá): chất NHƯỜNG electron, có số oxi hoá TĂNG sau phản ứng.\n' +
      'CHẤT OXI HOÁ (chất bị khử): chất NHẬN electron, có số oxi hoá GIẢM sau phản ứng.\n\n' +
      'PHẢN ỨNG OXI HOÁ – KHỬ là phản ứng có sự THAY ĐỔI SỐ OXI HOÁ của ít nhất một nguyên ' +
      'tố — luôn xảy ra ĐỒNG THỜI quá trình oxi hoá (nhường e) và quá trình khử (nhận e), số ' +
      'electron nhường = số electron nhận.\n\n' +
      'PHƯƠNG PHÁP THĂNG BẰNG ELECTRON để cân bằng PTHH oxi hoá-khử:\n' +
      '1. Xác định số oxi hoá của nguyên tố thay đổi.\n' +
      '2. Viết quá trình oxi hoá và quá trình khử.\n' +
      '3. Tìm hệ số sao cho số electron nhường = số electron nhận (nhân chéo bội số chung ' +
      'nhỏ nhất).\n' +
      '4. Đặt hệ số vào phương trình, kiểm tra cân bằng nguyên tố khác.',
    workedExample: {
      problem: 'Xác định chất khử, chất oxi hoá trong phản ứng: Zn + CuSO₄ → ZnSO₄ + Cu.',
      steps: [
        'Xác định số oxi hoá trước phản ứng: Zn (đơn chất) = 0; Cu trong CuSO₄ = +2.',
        'Xác định số oxi hoá sau phản ứng: Zn trong ZnSO₄ = +2; Cu (đơn chất) = 0.',
        'Zn: số oxi hoá tăng từ 0 lên +2 (nhường 2e) ⇒ Zn là CHẤT KHỬ (bị oxi hoá).',
        'Cu: số oxi hoá giảm từ +2 xuống 0 (nhận 2e) ⇒ Cu²⁺ là CHẤT OXI HOÁ (bị khử).',
      ],
      answer: 'Chất khử: Zn. Chất oxi hoá: Cu²⁺ (trong CuSO₄).',
    },
    checkQuestions: [
      {
        prompt: 'Chất khử là chất có đặc điểm gì trong phản ứng oxi hoá - khử?',
        choices: [
          { id: 'a', label: 'Nhường electron, số oxi hoá tăng' },
          { id: 'b', label: 'Nhận electron, số oxi hoá giảm' },
          { id: 'c', label: 'Không thay đổi số oxi hoá' },
        ],
        answer: { kind: 'choice', correctIds: ['a'] },
        explain: 'Chất khử = chất bị oxi hoá = chất NHƯỜNG electron ⇒ số oxi hoá TĂNG.',
      },
      {
        prompt:
          'Trong phản ứng Fe + 2HCl → FeCl₂ + H₂, số oxi hoá của Fe thay đổi từ 0 lên bao nhiêu?',
        answer: { kind: 'numeric', value: 2 },
        explain:
          'Fe (đơn chất, số oxi hoá 0) nhường 2e tạo Fe²⁺ trong FeCl₂ ⇒ số oxi hoá Fe tăng lên +2.',
      },
    ],
    srsCards: [
      { hoi: 'Chất khử là gì?', dap: 'Chất nhường electron, có số oxi hoá tăng sau phản ứng.' },
      { hoi: 'Chất oxi hoá là gì?', dap: 'Chất nhận electron, có số oxi hoá giảm sau phản ứng.' },
      {
        hoi: 'Nguyên tắc cân bằng phương trình bằng phương pháp thăng bằng electron?',
        dap: 'Số electron chất khử nhường = số electron chất oxi hoá nhận.',
      },
    ],
    reviewStatus: 'draft',
  },
]
