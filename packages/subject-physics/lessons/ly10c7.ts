// lessons/ly10c7.ts — Vật lí 10, Chương 7: Biến dạng của vật rắn. Áp suất chất lỏng (2 bài).
import type { PhysicsLesson } from '../lessonTypes.js'

export const LY10_C7_LESSONS: PhysicsLesson[] = [
  {
    id: 'ly10-c7-b33',
    grade: '10',
    chapterNumber: 7,
    chapterTitle: 'Biến dạng của vật rắn. Áp suất chất lỏng',
    lessonNumber: 33,
    title: 'Biến dạng của vật rắn',
    hook:
      'Dây cung bắn tên hay đệm nhảy lò xo trampoline có thể co giãn đàn hồi linh hoạt rồi quay lại hình dạng cũ. ' +
      'Nhưng nếu kéo quá mạnh, chúng sẽ bị méo mó vĩnh viễn. Đâu là ranh giới khoa học cho sự đàn hồi?',
    theory:
      'PHÂN LOẠI BIẾN DẠNG:\\n' +
      '— Biến dạng đàn hồi: Vật lấy lại được hình dạng và kích thước ban đầu sau khi ngừng tác dụng lực.\\n' +
      '— Biến dạng dẻo (không đàn hồi): Vật giữ nguyên hình dạng biến đổi sau khi lực ngừng tác dụng.\\n' +
      '— Giới hạn đàn hồi: Lực tác dụng tối đa mà vật vẫn có thể phục hồi lại hình dạng cũ.\\n\\n' +
      'ĐẶC ĐIỂM BIẾN DẠNG KÉO VÀ NÉN:\\n' +
      '— Biến dạng kéo: Chiều dài vật tăng lên (Δl > 0), các phân tử kéo ra xa nhau, lực đàn hồi xuất hiện hướng vào trong chống lại lực kéo.\\n' +
      '— Biến dạng nén: Chiều dài vật giảm đi (Δl < 0), các phân tử ép sát nhau, lực đàn hồi hướng ra ngoài chống lại lực nén.\\n\\n' +
      'ĐỊNH LUẬT HOOKE (ĐỊNH LUẬT ĐÀN HỒI LÒ XO):\\n' +
      '— Phát biểu: Trong giới hạn đàn hồi, độ lớn lực đàn hồi của lò xo tỉ lệ thuận với độ biến dạng của lò xo.\\n' +
      '— Công thức: F_đh = k.|Δl|.\\n' +
      '  — k: Độ cứng (độ chịu biến dạng) của lò xo. Đơn vị: Newton trên mét (N/m).\\n' +
      '  — Δl = l - l_o: Độ biến dạng của lò xo (l độ dài sau biến dạng, l_o độ dài tự nhiên ban đầu). Đơn vị: mét (m).',
    workedExample: {
      problem:
        'Một lò xo có độ cứng k = 100 N/m có chiều dài tự nhiên l_o = 15 cm. Treo thẳng đứng lò xo và móc vào đầu dưới ' +
        'một vật nặng để lò xo giãn ra đạt chiều dài l = 18 cm. Tính độ lớn lực đàn hồi xuất hiện và trọng lượng của vật treo (coi lò xo đứng yên).',
      steps: [
        'Đổi chiều dài tự nhiên l_o = 15 cm = 0,15 m. Chiều dài lúc sau l = 18 cm = 0,18 m.',
        'Tính độ biến dạng kéo của lò xo: |Δl| = l - l_o = 0,18 - 0,15 = 0,03 m.',
        'Áp dụng định luật Hooke để tính lực đàn hồi: F_đh = k.|Δl| = 100 * 0,03 = 3 (N).',
        'Vì vật treo đứng yên cân bằng nên trọng lượng P của vật bằng đúng độ lớn lực đàn hồi: P = F_đh = 3 N.',
      ],
      answer: 'Lực đàn hồi: 3 N; Trọng lượng vật: 3 N.',
    },
    checkQuestions: [
      {
        prompt:
          'Viết công thức tính độ lớn lực đàn hồi F_đh của lò xo có độ cứng k và độ biến dạng |Δl| theo Định luật Hooke.',
        choices: [
          { id: 'ct_1', label: 'F_đh = k * |Δl|' },
          { id: 'ct_2', label: 'F_đh = k / |Δl|' },
          { id: 'ct_3', label: 'F_đh = |Δl| / k' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['ct_1'],
        },
        explain:
          'Độ lớn lực đàn hồi của lò xo tỉ lệ thuận trực tiếp với độ biến dạng của nó thông qua hệ số độ cứng k.',
      },
      {
        prompt:
          'Một lò xo có độ cứng 200 N/m bị nén một đoạn 0,02 m. Tính độ lớn lực đàn hồi của lò xo xuất hiện lúc này.',
        answer: {
          kind: 'numeric',
          value: 4,
          unit: 'N',
        },
        explain: 'F_đh = k * |Δl| = 200 * 0,02 = 4 N.',
      },
    ],
    srsCards: [
      {
        hoi: 'Độ cứng k của lò xo đo bằng đơn vị gì trong hệ SI?',
        dap: 'Newton trên mét (N/m).',
      },
      {
        hoi: 'Giới hạn đàn hồi là gì?',
        dap: 'Là giá trị lực tác dụng tối đa lên vật mà khi ngừng tác dụng lực vật vẫn có thể lấy lại hình dạng cũ.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly10-c7-b34',
    grade: '10',
    chapterNumber: 7,
    chapterTitle: 'Biến dạng của vật rắn. Áp suất chất lỏng',
    lessonNumber: 34,
    title: 'Khối lượng riêng. Áp suất chất lỏng',
    hook:
      'Tại sao một chiếc tàu sân bay bằng thép khổng lồ có thể nổi ung dung trên mặt biển, trong khi một cây kim khâu nhỏ bằng sắt ' +
      'lại chìm nghỉm ngay lập tức? Câu trả lời nằm ở khái niệm khối lượng riêng và áp suất.',
    theory:
      'KHỐI LƯỢNG RIÊNG (DENSITY):\\n' +
      '— Khối lượng riêng (ρ) của một chất là khối lượng của một đơn vị thể tích chất đó.\\n' +
      '— Công thức: ρ = m / V (m là khối lượng, V là thể tích). Đơn vị trong hệ SI: kg/m³.\\n\\n' +
      'ÁP SUẤT (PRESSURE):\\n' +
      '— Áp suất là độ lớn của áp lực (lực nén vuông góc) tác dụng lên một đơn vị diện tích bị ép.\\n' +
      '— Công thức: p = F / S. Đơn vị trong hệ SI: Pascal (Pa), với 1 Pa = 1 N/m².\\n\\n' +
      'ÁP SUẤT CHẤT LỎNG (HYDROSTATIC PRESSURE):\\n' +
      '— Chất lỏng tác dụng áp suất lên đáy bình, thành bình và mọi điểm trong lòng chất lỏng.\\n' +
      '— Công thức tính áp suất chất lỏng ở độ sâu h tính từ mặt thoáng chất lỏng:\\n' +
      '  — p = p_o + ρ.g.h (p_o là áp suất khí quyển bề mặt thoáng, ρ là khối lượng riêng chất lỏng).\\n' +
      '  — Áp suất tĩnh của riêng cột chất lỏng: p_tĩnh = ρ.g.h.\\n\\n' +
      'LỰC ĐẨY ARCHIMEDES (ARCHIMEDES LIFT FORCE):\\n' +
      '— Lực đẩy tác dụng lên một vật chìm trong chất lưu hướng thẳng đứng từ dưới lên có độ lớn bằng trọng lượng phần chất lưu bị vật chiếm chỗ:\\n' +
      '  — F_A = ρ_cl.g.V (V là thể tích phần vật chìm trong chất lưu, ρ_cl là khối lượng riêng chất lưu).',
    workedExample: {
      problem:
        'Một người thợ lặn ở độ sâu h = 10 m dưới mặt nước biển. Biết khối lượng riêng của nước biển là ρ = 1000 kg/m³, ' +
        'gia tốc trọng trường g = 10 m/s². Tính áp suất do cột nước biển tác dụng lên người thợ lặn (bỏ qua áp suất khí quyển).',
      steps: [
        'Xác định độ sâu h = 10 m, khối lượng riêng nước biển ρ = 1000 kg/m³, gia tốc g = 10 m/s².',
        'Tính áp suất tĩnh của cột nước biển ở độ sâu h: p_tĩnh = ρ.g.h.',
        'Thay số: p_tĩnh = 1000 * 10 * 10 = 100000 (Pa) = 100 kPa.',
      ],
      answer: 'p = 100000 Pa',
    },
    checkQuestions: [
      {
        prompt:
          'Viết công thức tính áp suất cột chất lỏng p ở độ sâu h dưới mặt chất lỏng có khối lượng riêng ρ (bỏ qua áp suất khí quyển).',
        choices: [
          { id: 'ct_1', label: 'p = ρ * g * h' },
          { id: 'ct_2', label: 'p = ρ * g / h' },
          { id: 'ct_3', label: 'p = F / S' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['ct_1'],
        },
        explain:
          'Áp suất do cột chất lỏng gây ra tỉ lệ thuận với độ sâu h và khối lượng riêng ρ của chất lỏng: p = ρgh.',
      },
      {
        prompt:
          'Một khối gỗ có thể tích 0,002 m³ chìm hoàn toàn trong nước có khối lượng riêng 1000 kg/m³. Tính độ lớn lực đẩy Archimedes tác dụng lên khối gỗ (lấy g = 10 m/s²).',
        answer: {
          kind: 'numeric',
          value: 20,
          unit: 'N',
        },
        explain: 'F_A = ρ * g * V = 1000 * 10 * 0,002 = 20 N.',
      },
    ],
    srsCards: [
      {
        hoi: 'Đơn vị đo áp suất Pascal (Pa) tương đương với những đơn vị cơ bản nào?',
        dap: 'Newton trên mét vuông (N/m²).',
      },
      {
        hoi: 'Lực đẩy Archimedes phụ thuộc vào hai yếu tố nào?',
        dap: 'Thể tích phần chất lưu bị vật chiếm chỗ và khối lượng riêng của chất lưu đó.',
      },
    ],
    reviewStatus: 'draft',
  },
]
