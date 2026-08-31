// lessons/hoa10c6.ts — Hoá học 10, Chương 6: Tốc độ phản ứng hoá học (1 bài).
import type { ChemLesson } from '../lessonTypes.js'

export const HOA10_C6_LESSONS: ChemLesson[] = [
  {
    id: 'hoa10-c6-b15',
    grade: '10',
    chapterNumber: 6,
    chapterTitle: 'Tốc độ phản ứng hoá học',
    lessonNumber: 15,
    title: 'Tốc độ phản ứng',
    hook:
      'Que diêm cháy trong tích tắc, nhưng sắt gỉ mất hàng tháng, thậm chí hàng năm. Cùng là ' +
      'phản ứng oxi hoá, vì sao tốc độ khác biệt đến vậy?',
    theory:
      'TỐC ĐỘ PHẢN ỨNG đo mức độ biến thiên nồng độ của chất phản ứng hoặc sản phẩm trong ' +
      'một đơn vị thời gian.\n\n' +
      'BIỂU THỨC TỐC ĐỘ TỨC THỜI cho phản ứng đơn giản aA + bB → sản phẩm: v = k·[A]^a·[B]^b, ' +
      'trong đó k là hằng số tốc độ (phụ thuộc nhiệt độ, bản chất chất phản ứng, không phụ ' +
      'thuộc nồng độ), [A], [B] là nồng độ mol/L.\n\n' +
      'CÁC YẾU TỐ ẢNH HƯỞNG ĐẾN TỐC ĐỘ PHẢN ỨNG:\n' +
      '— NỒNG ĐỘ: nồng độ chất phản ứng càng lớn, tốc độ càng nhanh (va chạm hiệu quả nhiều ' +
      'hơn).\n' +
      "— NHIỆT ĐỘ: nhiệt độ tăng, tốc độ phản ứng tăng — theo HỆ SỐ NHIỆT ĐỘ VAN'T HOFF (γ), " +
      'thường γ = 2÷4: cứ tăng 10°C, tốc độ tăng γ lần.\n' +
      '— DIỆN TÍCH BỀ MẶT: chất rắn nghiền nhỏ có diện tích tiếp xúc lớn hơn ⇒ phản ứng nhanh ' +
      'hơn.\n' +
      '— CHẤT XÚC TÁC: làm tăng tốc độ phản ứng nhưng KHÔNG bị tiêu hao sau phản ứng (khối ' +
      'lượng và bản chất không đổi).\n' +
      '— ÁP SUẤT (với phản ứng có chất khí): áp suất tăng ⇒ nồng độ khí tăng ⇒ tốc độ tăng.',
    workedExample: {
      problem:
        'Một phản ứng có hệ số nhiệt độ γ = 2. Ở 20°C, tốc độ phản ứng là v₀. Hỏi khi tăng ' +
        'nhiệt độ lên 50°C, tốc độ phản ứng tăng bao nhiêu lần?',
      steps: [
        'Xác định số lần tăng 10°C: (50−20)/10 = 3 lần.',
        "Áp dụng công thức Van't Hoff: v(t2)/v(t1) = γ^n, với n là số lần tăng 10°C.",
        'v(50°C)/v(20°C) = 2³ = 8.',
        'Kết luận: tốc độ phản ứng ở 50°C tăng gấp 8 lần so với ở 20°C.',
      ],
      answer: 'Tăng 8 lần.',
    },
    checkQuestions: [
      {
        prompt: 'Chất xúc tác có đặc điểm gì sau khi phản ứng kết thúc?',
        choices: [
          { id: 'a', label: 'Không bị tiêu hao, khối lượng và bản chất không đổi' },
          { id: 'b', label: 'Bị tiêu hao hoàn toàn' },
          { id: 'c', label: 'Chuyển thành sản phẩm chính' },
        ],
        answer: { kind: 'choice', correctIds: ['a'] },
        explain:
          'Đặc điểm cốt lõi của chất xúc tác: làm tăng tốc độ phản ứng nhưng KHÔNG bị tiêu hao — có thể tái sử dụng.',
      },
      {
        prompt:
          'Một phản ứng có hệ số nhiệt độ γ = 3. Nếu tăng nhiệt độ thêm 20°C, tốc độ phản ' +
          'ứng tăng bao nhiêu lần? (chỉ nhập số)',
        answer: { kind: 'numeric', value: 9 },
        explain: 'Số lần tăng 10°C = 20/10 = 2. Tốc độ tăng γ^n = 3² = 9 lần.',
      },
    ],
    srsCards: [
      {
        hoi: "Công thức Van't Hoff về ảnh hưởng nhiệt độ?",
        dap: 'v(t2)/v(t1) = γ^n, với n = số lần tăng 10°C.',
      },
      {
        hoi: 'Chất xúc tác thay đổi thế nào sau phản ứng?',
        dap: 'Không thay đổi khối lượng và bản chất hoá học.',
      },
      {
        hoi: '5 yếu tố ảnh hưởng tốc độ phản ứng?',
        dap: 'Nồng độ, nhiệt độ, diện tích bề mặt, chất xúc tác, áp suất (với khí).',
      },
    ],
    reviewStatus: 'draft',
  },
]
