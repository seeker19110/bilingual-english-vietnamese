// lessons/hoa10c2.ts — Hoá học 10, Chương 2: Bảng tuần hoàn các nguyên tố hoá học (4 bài).
// Đối chiếu mục lục thật: tai-lieu-sgk/SGK-Hoa/10/page_0004.png (OCR 2026-08-31).
// reviewStatus='draft' — nội dung soạn từ docs/research/kho-kien-thuc-hoa-gdpt2018.md §3,
// CHƯA qua giáo viên Hoá duyệt. Xem docs/goals/2026-08-31-mon-hoc-toan-ly-hoa-sinh.md.
import type { ChemLesson } from '../lessonTypes.js'

export const HOA10_C2_LESSONS: ChemLesson[] = [
  {
    id: 'hoa10-c2-b5',
    grade: '10',
    chapterNumber: 2,
    chapterTitle: 'Bảng tuần hoàn các nguyên tố hoá học',
    lessonNumber: 5,
    title: 'Cấu tạo của bảng tuần hoàn các nguyên tố hoá học',
    hook:
      'Mendeleev năm 1869 xếp các nguyên tố theo khối lượng nguyên tử tăng dần và dự đoán ' +
      'chính xác tính chất của những nguyên tố CHƯA TỪNG được tìm ra — bí quyết nằm ở quy ' +
      'luật lặp lại tính chất theo chu kì.',
    theory:
      'Bảng tuần hoàn hiện đại sắp xếp các nguyên tố theo CHIỀU TĂNG DẦN của điện tích hạt ' +
      'nhân (số hiệu nguyên tử Z).\n\n' +
      'Ô NGUYÊN TỐ: mỗi nguyên tố chiếm một ô, chứa số hiệu nguyên tử, kí hiệu hoá học, tên ' +
      'nguyên tố, nguyên tử khối.\n\n' +
      'CHU KÌ: dãy nguyên tố có CÙNG SỐ LỚP ELECTRON, xếp theo hàng ngang. Số thứ tự chu kì = ' +
      'số lớp electron. Bảng tuần hoàn có 7 chu kì (chu kì 1, 2, 3 là chu kì nhỏ; 4, 5, 6, 7 là ' +
      'chu kì lớn).\n\n' +
      'NHÓM: tập hợp nguyên tố có tính chất hoá học TƯƠNG TỰ nhau, xếp theo cột dọc — thường ' +
      'do CÙNG SỐ ELECTRON LỚP NGOÀI CÙNG. Có nhóm A (nguyên tố s, p) và nhóm B (nguyên tố d, ' +
      'chuyển tiếp).\n\n' +
      'Số thứ tự nhóm A = số electron lớp ngoài cùng (với nhóm chính).',
    workedExample: {
      problem:
        'Nguyên tử X có cấu hình electron 1s²2s²2p⁶3s²3p⁴. Xác định X thuộc chu kì mấy, nhóm ' +
        'nào?',
      steps: [
        'Đếm số lớp electron: lớp 1 (1s), lớp 2 (2s,2p), lớp 3 (3s,3p) — có 3 lớp ⇒ X thuộc ' +
          'CHU KÌ 3.',
        'Đếm electron lớp ngoài cùng (lớp 3): 3s²3p⁴ = 2+4 = 6 electron.',
        'Số electron lớp ngoài cùng = 6 ⇒ X thuộc NHÓM VIA.',
        'Kết luận: X ở chu kì 3, nhóm VIA (đây là nguyên tử Sulfur — S, Z=16).',
      ],
      answer: 'Chu kì 3, nhóm VIA.',
    },
    checkQuestions: [
      {
        prompt: 'Số thứ tự chu kì trong bảng tuần hoàn ứng với đại lượng nào của nguyên tử?',
        choices: [
          { id: 'a', label: 'Số lớp electron' },
          { id: 'b', label: 'Số electron lớp ngoài cùng' },
          { id: 'c', label: 'Số proton' },
          { id: 'd', label: 'Số neutron' },
        ],
        answer: { kind: 'choice', correctIds: ['a'] },
        explain:
          'Chu kì = dãy nguyên tố có CÙNG SỐ LỚP ELECTRON. Số thứ tự chu kì chính là số lớp electron.',
      },
      {
        prompt: 'Nguyên tử Y có cấu hình 1s²2s²2p⁶3s²3p¹. Y thuộc nhóm nào trong các nhóm sau?',
        choices: [
          { id: 'IA', label: 'IA' },
          { id: 'IIA', label: 'IIA' },
          { id: 'IIIA', label: 'IIIA' },
          { id: 'IVA', label: 'IVA' },
        ],
        answer: { kind: 'choice', correctIds: ['IIIA'] },
        explain: 'Electron lớp ngoài cùng (lớp 3): 3s²3p¹ = 3 electron ⇒ nhóm IIIA (đây là Al).',
      },
    ],
    srsCards: [
      {
        hoi: 'Nguyên tố xếp trong bảng tuần hoàn theo chiều tăng dần đại lượng gì?',
        dap: 'Điện tích hạt nhân (Z).',
      },
      { hoi: 'Số thứ tự chu kì bằng gì?', dap: 'Số lớp electron.' },
      { hoi: 'Số thứ tự nhóm A (nguyên tố chính) bằng gì?', dap: 'Số electron lớp ngoài cùng.' },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa10-c2-b6',
    grade: '10',
    chapterNumber: 2,
    chapterTitle: 'Bảng tuần hoàn các nguyên tố hoá học',
    lessonNumber: 6,
    title: 'Xu hướng biến đổi một số tính chất của nguyên tử trong một chu kì và một nhóm',
    hook:
      'Vì sao kim loại kiềm (như Na, K) phản ứng mạnh với nước ngay ở nhiệt độ thường, còn ' +
      'khí hiếm gần như trơ tuyệt đối? Xu hướng biến đổi tuần hoàn giải thích được điều này ' +
      'mà không cần học thuộc từng nguyên tố.',
    theory:
      'BÁN KÍNH NGUYÊN TỬ:\n' +
      '— Trong MỘT CHU KÌ (trái → phải): điện tích hạt nhân tăng, lực hút electron mạnh hơn ' +
      '⇒ bán kính GIẢM DẦN.\n' +
      '— Trong MỘT NHÓM (trên → dưới): số lớp electron tăng ⇒ bán kính TĂNG DẦN.\n\n' +
      'ĐỘ ÂM ĐIỆN (khả năng hút electron về mình khi tạo liên kết):\n' +
      '— Trong một chu kì (trái → phải): độ âm điện TĂNG DẦN (ngược xu hướng bán kính).\n' +
      '— Trong một nhóm (trên → dưới): độ âm điện GIẢM DẦN.\n\n' +
      'TÍNH KIM LOẠI / PHI KIM:\n' +
      '— Trong một chu kì (trái → phải): tính kim loại GIẢM, tính phi kim TĂNG.\n' +
      '— Trong một nhóm (trên → dưới): tính kim loại TĂNG, tính phi kim GIẢM.\n\n' +
      'Nguyên tố có độ âm điện lớn nhất trong bảng tuần hoàn: Fluorine (F). Nguyên tố có tính ' +
      'kim loại mạnh nhất (trừ nguyên tố phóng xạ): Francium (Fr) — ở nhóm IA, chu kì lớn.',
    workedExample: {
      problem: 'So sánh bán kính nguyên tử của Na (Z=11) và Mg (Z=12) — cả hai đều thuộc chu kì 3.',
      steps: [
        'Cả Na và Mg đều thuộc CHU KÌ 3 (cùng số lớp electron).',
        'Trong cùng một chu kì, đi từ trái sang phải (Z tăng), bán kính nguyên tử GIẢM DẦN.',
        'Na có Z=11 nhỏ hơn Mg có Z=12 ⇒ Na đứng trước Mg trong chu kì.',
        'Kết luận: bán kính nguyên tử Na LỚN HƠN bán kính nguyên tử Mg.',
      ],
      answer: 'Bán kính Na > bán kính Mg.',
    },
    checkQuestions: [
      {
        prompt: 'Trong một chu kì, đi từ trái sang phải, bán kính nguyên tử biến đổi như thế nào?',
        choices: [
          { id: 'tang', label: 'Tăng dần' },
          { id: 'giam', label: 'Giảm dần' },
        ],
        answer: { kind: 'choice', correctIds: ['giam'] },
        explain:
          'Điện tích hạt nhân tăng dần trong khi số lớp electron không đổi ⇒ lực hút electron mạnh hơn ⇒ bán kính giảm.',
      },
      {
        prompt: 'Trong một nhóm A, đi từ trên xuống dưới, tính kim loại biến đổi như thế nào?',
        choices: [
          { id: 'tang', label: 'Tăng dần' },
          { id: 'giam', label: 'Giảm dần' },
        ],
        answer: { kind: 'choice', correctIds: ['tang'] },
        explain:
          'Số lớp electron tăng, electron ngoài cùng ở xa hạt nhân hơn, dễ bị mất hơn ⇒ tính kim loại tăng.',
      },
    ],
    srsCards: [
      {
        hoi: 'Bán kính nguyên tử biến đổi thế nào trong một chu kì (trái→phải)?',
        dap: 'Giảm dần.',
      },
      { hoi: 'Bán kính nguyên tử biến đổi thế nào trong một nhóm (trên→dưới)?', dap: 'Tăng dần.' },
      { hoi: 'Nguyên tố có độ âm điện lớn nhất bảng tuần hoàn?', dap: 'Fluorine (F).' },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa10-c2-b7',
    grade: '10',
    chapterNumber: 2,
    chapterTitle: 'Bảng tuần hoàn các nguyên tố hoá học',
    lessonNumber: 7,
    title: 'Xu hướng biến đổi thành phần và một số tính chất của hợp chất trong một chu kì',
    hook:
      'Oxide của Sodium (Na₂O) tan trong nước tạo dung dịch base mạnh, còn oxide của Chlorine ' +
      '(Cl₂O₇) tan trong nước lại tạo acid mạnh — cùng là oxide, nhưng tính chất đối lập hoàn ' +
      'toàn tuỳ vị trí trong chu kì.',
    theory:
      'HOÁ TRỊ CAO NHẤT VỚI OXYGEN của các nguyên tố trong MỘT CHU KÌ tăng dần từ trái sang ' +
      'phải, đúng bằng số thứ tự nhóm A (với các nhóm IA đến VIIA): nhóm IA hoá trị I, nhóm ' +
      'IIA hoá trị II... nhóm VIIA hoá trị VII.\n\n' +
      'Ví dụ chu kì 3: Na₂O (hoá trị I) → MgO (II) → Al₂O₃ (III) → SiO₂ (IV) → P₂O₅ (V) → SO₃ ' +
      '(VI) → Cl₂O₇ (VII).\n\n' +
      'TÍNH ACID – BASE của oxide và hydroxide tương ứng biến đổi trong một chu kì (trái → ' +
      'phải): TỪ BASE MẠNH DẦN SANG ACID MẠNH — khớp với xu hướng tính kim loại giảm, tính ' +
      'phi kim tăng đã học ở bài trước.\n\n' +
      'Ví dụ: NaOH (base mạnh) → Mg(OH)₂ (base yếu) → Al(OH)₃ (lưỡng tính) → H₂SiO₃ (acid rất ' +
      'yếu) → H₃PO₄ (acid trung bình) → H₂SO₄ (acid mạnh) → HClO₄ (acid rất mạnh).',
    workedExample: {
      problem:
        'Trong chu kì 3, hợp chất oxide cao nhất của nguyên tố nhóm VA có công thức dạng ' +
        'tổng quát nào? (biết nguyên tố nhóm VA chu kì 3 là Phosphorus, P).',
      steps: [
        'Hoá trị cao nhất với oxygen = số thứ tự nhóm A. Nhóm VA ⇒ hoá trị cao nhất = V.',
        'Oxide có công thức X₂O_y sao cho hoá trị X × 2 = hoá trị O × y (quy tắc hoá trị).',
        'Với hoá trị X = V (5), oxygen hoá trị II: 5×2 = 2×y ⇒ y = 5.',
        'Công thức: P₂O₅.',
      ],
      answer: 'P₂O₅',
    },
    checkQuestions: [
      {
        prompt:
          'Hoá trị cao nhất với oxygen của nguyên tố nhóm VIA (chu kì 3, là Sulfur) là bao ' +
          'nhiêu? (chỉ nhập số)',
        answer: { kind: 'numeric', value: 6 },
        explain: 'Hoá trị cao nhất với oxygen = số thứ tự nhóm A. Nhóm VIA ⇒ hoá trị VI.',
      },
      {
        prompt:
          'Trong một chu kì, đi từ trái sang phải, tính acid của oxide/hydroxide cao nhất biến đổi ra sao?',
        choices: [
          { id: 'tang', label: 'Tăng dần (từ base mạnh sang acid mạnh)' },
          { id: 'giam', label: 'Giảm dần (từ acid mạnh sang base mạnh)' },
        ],
        answer: { kind: 'choice', correctIds: ['tang'] },
        explain:
          'Khớp xu hướng tính kim loại giảm/phi kim tăng: oxide/hydroxide chuyển từ base mạnh (đầu chu kì) sang acid mạnh (cuối chu kì).',
      },
    ],
    srsCards: [
      {
        hoi: 'Hoá trị cao nhất với oxygen của nguyên tố nhóm A bằng gì?',
        dap: 'Bằng số thứ tự nhóm A.',
      },
      {
        hoi: 'Tính acid-base của oxide/hydroxide biến đổi thế nào trong một chu kì?',
        dap: 'Từ base mạnh (đầu chu kì) sang acid mạnh (cuối chu kì).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa10-c2-b8',
    grade: '10',
    chapterNumber: 2,
    chapterTitle: 'Bảng tuần hoàn các nguyên tố hoá học',
    lessonNumber: 8,
    title: 'Định luật tuần hoàn và ý nghĩa của bảng tuần hoàn các nguyên tố hoá học',
    hook:
      'Trước khi biết cấu tạo nguyên tử, Mendeleev chỉ dựa vào tính chất LẶP LẠI theo chu kì ' +
      'đã sắp xếp đúng gần như toàn bộ bảng tuần hoàn — quy luật đó giờ có tên: định luật ' +
      'tuần hoàn.',
    theory:
      'ĐỊNH LUẬT TUẦN HOÀN: tính chất của các nguyên tố và đơn chất, cũng như thành phần và ' +
      'tính chất của các hợp chất tạo nên từ các nguyên tố đó, biến đổi TUẦN HOÀN theo chiều ' +
      'tăng của điện tích hạt nhân.\n\n' +
      '"Tuần hoàn" nghĩa là LẶP LẠI có quy luật sau mỗi chu kì — không phải giống hệt, mà ' +
      'giống về XU HƯỚNG (ví dụ mọi nhóm IA đều là kim loại hoạt động mạnh, mọi nhóm VIIA ' +
      'đều là phi kim hoạt động mạnh).\n\n' +
      'Ý NGHĨA của bảng tuần hoàn: biết vị trí (ô, chu kì, nhóm) của một nguyên tố, ta suy ra ' +
      'được cấu hình electron và ngược lại; từ đó DỰ ĐOÁN được tính chất hoá học cơ bản mà ' +
      'không cần nhớ riêng từng nguyên tố — đây chính là công cụ hệ thống hoá quan trọng ' +
      'nhất của Hoá học.',
    workedExample: {
      problem:
        'Nguyên tố X ở ô số 20 trong bảng tuần hoàn, thuộc chu kì 4, nhóm IIA. Dự đoán X là ' +
        'kim loại hay phi kim, và hoá trị cao nhất với oxygen.',
      steps: [
        'X ở nhóm IIA ⇒ có 2 electron lớp ngoài cùng, dễ NHƯỜNG electron ⇒ X là KIM LOẠI.',
        'Nhóm IIA nằm ở đầu bảng tuần hoàn (cùng nhóm IA) ⇒ tính kim loại khá mạnh (Ca là ' +
          'kim loại kiềm thổ).',
        'Hoá trị cao nhất với oxygen = số thứ tự nhóm A = II.',
        'Kết luận: X là kim loại (thực tế là Calcium — Ca), hoá trị cao nhất với oxygen là II ' +
          '(oxide CaO).',
      ],
      answer: 'X là kim loại, hoá trị cao nhất với oxygen là II.',
    },
    checkQuestions: [
      {
        prompt:
          'Định luật tuần hoàn phát biểu: tính chất các nguyên tố biến đổi theo quy luật gì khi Z tăng dần?',
        choices: [
          { id: 'a', label: 'Biến đổi tuần hoàn (lặp lại có quy luật)' },
          { id: 'b', label: 'Biến đổi ngẫu nhiên, không quy luật' },
          { id: 'c', label: 'Luôn tăng liên tục, không lặp lại' },
          { id: 'd', label: 'Không đổi' },
        ],
        answer: { kind: 'choice', correctIds: ['a'] },
        explain:
          'Định luật tuần hoàn: tính chất biến đổi TUẦN HOÀN (lặp lại theo chu kì) theo chiều tăng điện tích hạt nhân.',
      },
      {
        prompt:
          'Biết vị trí của một nguyên tố trong bảng tuần hoàn (ô, chu kì, nhóm), ta có thể suy ra được điều gì?',
        choices: [
          { id: 'a', label: 'Cấu hình electron và tính chất hoá học cơ bản' },
          { id: 'b', label: 'Chỉ tên gọi, không suy ra được gì khác' },
          { id: 'c', label: 'Chỉ khối lượng riêng' },
        ],
        answer: { kind: 'choice', correctIds: ['a'] },
        explain:
          'Đây chính là Ý NGHĨA quan trọng nhất của bảng tuần hoàn — công cụ dự đoán tính chất mà không cần nhớ riêng từng nguyên tố.',
      },
    ],
    srsCards: [
      {
        hoi: 'Định luật tuần hoàn phát biểu gì?',
        dap: 'Tính chất nguyên tố biến đổi TUẦN HOÀN theo chiều tăng điện tích hạt nhân.',
      },
      {
        hoi: 'Ý nghĩa quan trọng nhất của bảng tuần hoàn?',
        dap: 'Từ vị trí suy ra cấu hình electron và dự đoán tính chất hoá học.',
      },
    ],
    reviewStatus: 'draft',
  },
]
