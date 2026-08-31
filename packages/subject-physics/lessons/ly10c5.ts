// lessons/ly10c5.ts — Vật lí 10, Chương 5: Động lượng (3 bài).
import type { PhysicsLesson } from '../lessonTypes.js'

export const LY10_C5_LESSONS: PhysicsLesson[] = [
  {
    id: 'ly10-c5-b28',
    grade: '10',
    chapterNumber: 5,
    chapterTitle: 'Động lượng',
    lessonNumber: 28,
    title: 'Động lượng',
    hook:
      'Một chiếc tàu thuỷ siêu trọng di chuyển rất chậm vẫn có thể tông sập cầu cảng, và một viên đạn súng nhỏ xíu bay tốc độ cao ' +
      'mang sức phá huỷ cực lớn. Cả hai đều mang một đại lượng cơ học đặc trưng gọi là Động lượng.',
    theory:
      'ĐỊNH NGHĨA ĐỘNG LƯỢNG (MOMENTUM):\\n' +
      '— Động lượng của một vật có khối lượng m đang chuyển động với vận tốc vectơ v là đại lượng đo bằng tích của khối lượng và vectơ vận tốc của vật.\\n' +
      '— Công thức vectơ: vectơ p = m.vectơ v.\\n' +
      '— Đặc điểm: Động lượng là đại lượng vectơ có cùng hướng với vận tốc. Đơn vị trong hệ SI: kilôgam mét trên giây (kg.m/s) hoặc Newton giây (N.s).\\n\\n' +
      'XUNG LƯỢNG CỦA LỰC (IMPULSE OF FORCE):\\n' +
      '— Khi một lực vectơ F tác dụng lên vật trong khoảng thời gian ngắn Δt, tích vectơ F.Δt gọi là xung lượng của lực trong khoảng thời gian đó. Đơn vị: N.s.\\n' +
      '— Dạng khác của Định luật 2 Newton: vectơ F = Δvectơ p / Δt.\\n' +
      '— Ý nghĩa: Độ biến thiên động năng/động lượng của vật bằng xung lượng của lực tác dụng lên vật: Δvectơ p = vectơ F.Δt.',
    workedExample: {
      problem:
        'Một quả bóng đá có khối lượng m = 400g bay thẳng vào tường theo phương ngang với vận tốc v₁ = 10 m/s ' +
        'và nảy ngược trở lại với vận tốc v₂ = 10 m/s theo hướng cũ. Tính độ lớn độ biến thiên động lượng của quả bóng.',
      steps: [
        'Đổi khối lượng quả bóng sang kg: m = 400g = 0,4 kg.',
        'Chọn chiều dương là chiều chuyển động ban đầu của quả bóng hướng vào tường. Vận tốc đầu v₁ = 10 m/s.',
        'Vì bóng nảy ngược lại nên vận tốc sau trái dấu: v₂ = -10 m/s.',
        'Tính động lượng ban đầu: p₁ = m.v₁ = 0,4 * 10 = 4 (kg.m/s).',
        'Tính động lượng lúc sau: p₂ = m.v₂ = 0,4 * (-10) = -4 (kg.m/s).',
        'Tính độ biến thiên động lượng: Δp = p₂ - p₁ = -4 - 4 = -8 (kg.m/s).',
        'Độ lớn độ biến thiên động lượng là |Δp| = 8 kg.m/s.',
      ],
      answer: '|Δp| = 8 kg.m/s',
    },
    checkQuestions: [
      {
        prompt:
          'Viết công thức tính vectơ động lượng p của một vật dựa vào khối lượng m và vectơ vận tốc v.',
        choices: [
          { id: 'ct_1', label: 'vectơ p = m * vectơ v' },
          { id: 'ct_2', label: 'vectơ p = m / vectơ v' },
          { id: 'ct_3', label: 'vectơ p = 0,5 * m * vectơ v²' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['ct_1'],
        },
        explain: 'Vectơ động lượng bằng tích khối lượng nhân với vectơ vận tốc vật: p = mv.',
      },
      {
        prompt:
          'Một lực kéo 50 N tác dụng lên một chiếc xe đẩy trong khoảng thời gian 0,2s. Tính độ biến thiên động lượng của chiếc xe đẩy (bỏ qua các lực khác).',
        answer: {
          kind: 'numeric',
          value: 10,
          unit: 'kg*m/s',
        },
        explain: 'Δp = F * Δt = 50 * 0,2 = 10 kg.m/s (hoặc N.s).',
      },
    ],
    srsCards: [
      {
        hoi: 'Động lượng của vật thay đổi như thế nào nếu khối lượng tăng gấp đôi và vận tốc giảm đi một nửa?',
        dap: 'Động lượng không đổi (vì p tỉ lệ với tích m.v).',
      },
      {
        hoi: 'Xung lượng của lực đo bằng đơn vị gì và bằng đại lượng biến thiên nào của vật?',
        dap: 'Đo bằng N.s, bằng độ biến thiên động lượng của vật.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly10-c5-b29',
    grade: '10',
    chapterNumber: 5,
    chapterTitle: 'Động lượng',
    lessonNumber: 29,
    title: 'Định luật bảo toàn động lượng',
    hook:
      'Khi một khẩu đại bác khổng lồ bắn một quả đạn nặng đi thẳng về phía trước, cả khẩu đại bác sẽ bị giật mạnh lùi lại phía sau. ' +
      'Định luật bảo toàn động lượng chính là chìa khóa giải thích hiện tượng giật lùi và nguyên lí bay của tên lửa.',
    theory:
      'HỆ KÍN (HỆ CÔ LẬP):\\n' +
      '— Hệ gồm nhiều vật tương tác với nhau mà không chịu tác dụng của ngoại lực, hoặc các ngoại lực cân bằng nhau (hợp ngoại lực bằng 0).\\n\\n' +
      'ĐỊNH LUẬT BẢO TOÀN ĐỘNG LƯỢNG:\\n' +
      '— Phát biểu: Tổng động lượng của một hệ kín là một đại lượng bảo toàn (không đổi theo thời gian).\\n' +
      "— Biểu thức cho hệ 2 vật: vectơ p₁ + vectơ p₂ = vectơ p₁'" +
      " + vectơ p₂' hay m₁.vectơ v₁ + m₂.vectơ v₂ = m₁.vectơ v₁' + m₂.vectơ v₂'.\\n\\n" +
      'ỨNG DỤNG CỦA ĐỊNH LUẬT:\\n' +
      "1. Va chạm mềm: Hai vật va chạm rồi dính vào nhau chuyển động cùng vận tốc v'.\\n" +
      "   — Công thức: v' = (m₁.v₁ + m₂.v₂) / (m₁ + m₂) (dạng đại số trên trục thẳng).\\n" +
      '2. Chuyển động bằng phản lực: Một phần của hệ tách ra và phóng đi về một hướng, làm phần còn lại chuyển động về hướng ngược lại (vd: súng giật khi bắn, tên lửa phun khí gas).',
    workedExample: {
      problem:
        'Một khẩu súng trường có khối lượng M = 4 kg bắn một viên đạn có khối lượng m = 20g với vận tốc v = 600 m/s thoát ra khỏi nòng súng. ' +
        'Tính vận tốc giật lùi của khẩu súng (coi hệ súng và đạn là hệ kín trước và sau khi bắn).',
      steps: [
        'Đổi khối lượng viên đạn sang kg: m = 20g = 0,02 kg.',
        'Trước khi bắn, cả súng và đạn đều đứng yên: Tổng động lượng hệ ban đầu p_đầu = 0.',
        'Sau khi bắn, viên đạn bay đi với vận tốc v, súng giật lùi với vận tốc V. Tổng động lượng hệ: p_sau = m.v + M.V.',
        'Vì hệ súng đạn là hệ kín lúc phát hoả, áp dụng ĐLBT động lượng: p_đầu = p_sau => 0 = m.v + M.V.',
        'M.V = -m.v => V = -(m.v) / M.',
        'Thay số: V = -(0,02 * 600) / 4 = -12 / 4 = -3 (m/s).',
        'Dấu trừ chứng tỏ súng giật lùi ngược hướng bay của viên đạn với tốc độ 3 m/s.',
      ],
      answer: 'V = -3 m/s',
    },
    checkQuestions: [
      {
        prompt: 'Định luật bảo toàn động lượng chỉ áp dụng đúng cho hệ vật có tính chất nào?',
        choices: [
          { id: 'he_kin', label: 'Hệ kín (hệ cô lập)' },
          { id: 'he_mo', label: 'Hệ mở chịu nhiều ma sát lớn từ môi trường' },
          { id: 'he_quay', label: 'Hệ vật đang chuyển động quay liên tục' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['he_kin'],
        },
        explain:
          'Bảo toàn động lượng đòi hỏi hợp ngoại lực bằng không, tức là hệ phải cô lập (hệ kín).',
      },
      {
        prompt:
          'Một xe lăn A khối lượng 1 kg chuyển động với tốc độ 2 m/s va chạm và dính vào một xe lăn B khối lượng 1 kg đang đứng yên. Tính tốc độ của hai xe sau va chạm.',
        answer: {
          kind: 'numeric',
          value: 1,
          unit: 'm/s',
        },
        explain: "Va chạm mềm: v' = (m_A * v_A) / (m_A + m_B) = (1 * 2) / (1 + 1) = 1 m/s.",
      },
    ],
    srsCards: [
      {
        hoi: 'Phát biểu định luật bảo toàn động lượng?',
        dap: 'Tổng động lượng của một hệ kín là một đại lượng bảo toàn.',
      },
      {
        hoi: 'Nguyên tắc chuyển động bằng phản lực là gì?',
        dap: 'Một phần vật chất phóng ra theo một hướng, phần còn lại sẽ chuyển động ngược hướng do bảo toàn động lượng.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly10-c5-b30',
    grade: '10',
    chapterNumber: 5,
    chapterTitle: 'Động lượng',
    lessonNumber: 30,
    title: 'Thực hành: Xác định động lượng của vật trước và sau va chạm',
    hook:
      'Làm thế nào để đo đạc và kiểm chứng định luật bảo toàn động lượng trong phòng thí nghiệm khi thời gian va chạm xảy ra chỉ trong tích tắc? ' +
      'Sử dụng băng đệm khí và cổng quang điện chính là lời giải.',
    theory:
      'NGUYÊN TẮC THỰC HÀNH VA CHẠM ĐỆM KHÍ:\\n' +
      '— Băng đệm khí thổi luồng hơi nâng các xe trượt lên, triệt tiêu ma sát trượt giúp hệ hai xe trượt gần như là hệ kín hoàn hảo.\\n' +
      '— Sử dụng hai cổng quang điện kết nối đồng hồ hiện số.\\n' +
      '  — Tốc độ xe trượt: v = d / t (d là độ rộng tấm bản nhựa chắn sáng gắn trên xe, t là thời gian chắn cổng quang).\\n\\n' +
      'PHÉP ĐO VA CHẠM MỀM (Hai xe dính nhau):\\n' +
      '— Mắc miếng dính velcro lên mặt tiếp xúc hai xe để chúng dính nhau sau va chạm.\\n' +
      "— Đo tốc độ xe 1 trước va chạm v₁ và tốc độ hai xe dính nhau v' sau va chạm.\\n" +
      "— Kiểm tra: m₁.v₁ ≈ (m₁ + m₂).v'.\\n\\n" +
      'PHÉP ĐO VA CHẠM ĐÀN HỒI (Hai xe nảy nhau):\\n' +
      '— Mắc lò xo hoặc đệm cao su lên mặt tiếp xúc.\\n' +
      "— Đo tốc độ v₁, v₂ trước va chạm và v₁', v₂' sau va chạm.\\n" +
      "— Kiểm tra: m₁.v₁ + m₂.v₂ ≈ m₁.v₁' + m₂.v₂'.",
    workedExample: {
      problem:
        'Trong thí nghiệm va chạm mềm, xe 1 khối lượng m₁ = 0,3 kg chuyển động qua cổng quang 1 đo được tốc độ v₁ = 2,0 m/s, ' +
        "đến va chạm dính vào xe 2 khối lượng m₂ = 0,2 kg đang đứng yên. Cả hai xe đi qua cổng quang 2 đo được tốc độ v' = 1,2 m/s. " +
        'So sánh tổng động lượng trước và sau va chạm.',
      steps: [
        'Tính tổng động lượng trước va chạm: p_trước = m₁.v₁ + m₂.v₂ = 0,3 * 2,0 + 0 = 0,6 (kg.m/s).',
        "Tính tổng động lượng sau va chạm: p_sau = (m₁ + m₂).v' = (0,3 + 0,2) * 1,2 = 0,5 * 1,2 = 0,6 (kg.m/s).",
        'So sánh: p_trước = p_sau = 0,6 kg.m/s. Thực nghiệm hoàn toàn trùng khớp lý thuyết bảo toàn động lượng.',
      ],
      answer: 'Tổng động lượng trước và sau va chạm đều bằng 0,6 kg.m/s.',
    },
    checkQuestions: [
      {
        prompt:
          'Thiết bị nào giúp loại bỏ tối đa lực ma sát trượt trong bài thực hành va chạm vật lý?',
        choices: [
          { id: 'dem_khi', label: 'Băng đệm khí (Air track)' },
          { id: 'thuoc_day', label: 'Thước dây cuộn' },
          { id: 'dynamo', label: 'Lực kế lò xo' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['dem_khi'],
        },
        explain:
          'Băng đệm khí phun không khí nâng xe trượt lửng lơ trên đệm khí, giảm thiểu ma sát về gần bằng 0.',
      },
      {
        prompt:
          'Một xe trượt khối lượng 0,2 kg chuyển động với tốc độ 1,5 m/s va chạm mềm với xe trượt thứ hai khối lượng 0,1 kg đang đứng yên. Tính động lượng tổng cộng của hệ sau va chạm.',
        answer: {
          kind: 'numeric',
          value: 0.3,
          unit: 'kg*m/s',
        },
        explain:
          'Theo ĐLBT động lượng, tổng động lượng sau va chạm bằng tổng động lượng trước va chạm: p = m_1 * v_1 = 0,2 * 1,5 = 0,3 kg.m/s.',
      },
    ],
    srsCards: [
      {
        hoi: 'Làm thế nào để xác định vận tốc của xe trượt đi qua cổng quang điện trong phòng thực hành?',
        dap: 'Bằng tỉ số v = d / t (d là độ rộng bản chắn sáng, t là thời gian chắn chùm sáng cổng quang).',
      },
      {
        hoi: 'Tại sao cần dán miếng dính velcro vào hai đầu xe trượt?',
        dap: 'Để thực hiện phép đo thí nghiệm va chạm mềm (hai xe dính chặt vào nhau sau va chạm).',
      },
    ],
    reviewStatus: 'draft',
  },
]
