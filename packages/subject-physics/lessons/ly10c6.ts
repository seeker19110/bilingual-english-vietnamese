// lessons/ly10c6.ts — Vật lí 10, Chương 6: Chuyển động tròn đều (2 bài).
import type { PhysicsLesson } from '../lessonTypes.js'

export const LY10_C6_LESSONS: PhysicsLesson[] = [
  {
    id: 'ly10-c6-b31',
    grade: '10',
    chapterNumber: 6,
    chapterTitle: 'Chuyển động tròn đều',
    lessonNumber: 31,
    title: 'Động học của chuyển động tròn đều',
    hook:
      'Cánh quạt phong điện khổng lồ quay đều đặn hay Mặt Trăng quay quanh Trái Đất đều vẽ nên những đường tròn kì diệu. ' +
      'Làm thế nào để tính toán quãng đường và tốc độ quay của chúng?',
    theory:
      'ĐỊNH NGHĨA CHUYỂN ĐỘNG TRÒN ĐỀU:\\n' +
      '— Chuyển động tròn là chuyển động có quỹ đạo là một đường tròn.\\n' +
      '— Chuyển động tròn đều là chuyển động tròn có tốc độ dài không đổi (đi được những cung tròn có độ dài bằng nhau trong những khoảng thời gian bằng nhau).\\n\\n' +
      'CÁC ĐẠI LƯỢNG ĐẶC TRƯNG:\\n' +
      '1. Độ dịch chuyển góc (Δθ): Góc quét bởi bán kính nối từ tâm đến vật trong thời gian Δt. Đơn vị: Radian (rad). Hệ thức: π rad = 180°.\\n' +
      '2. Tốc độ góc (ω): Đại lượng đo bằng độ dịch chuyển góc chia cho thời gian dịch chuyển góc tương ứng.\\n' +
      '   — Công thức: ω = Δθ / Δt. Đơn vị: Radian trên giây (rad/s).\\n' +
      '3. Chu kì (T): Khoảng thời gian vật đi hết một vòng tròn quỹ đạo. Đơn vị: Giây (s). Công thức: T = 2π / ω.\\n' +
      '4. Tần số (f): Số vòng vật đi được trong một giây. Đơn vị: Hertz (Hz) hoặc 1/s. Công thức: f = 1 / T = ω / 2π.\\n' +
      '5. Tốc độ dài (v): Tốc độ đi dọc theo cung tròn của quỹ đạo. Công thức: v = s / t = ω.r (với r là bán kính đường tròn).\\n' +
      '  — Chú ý: Vectơ vận tốc dài luôn có phương tiếp tuyến với đường tròn quỹ đạo, hướng thay đổi liên tục dù độ lớn v không đổi.',
    workedExample: {
      problem:
        'Một cánh quạt trần quay đều với tốc độ góc ω = 20 rad/s. Bán kính từ tâm đến đầu cánh quạt là r = 0,5 m. ' +
        'Tính tốc độ dài của đầu cánh quạt, chu kì và tần số quay của quạt.',
      steps: [
        'Xác định tốc độ góc ω = 20 rad/s, bán kính r = 0,5 m.',
        'Tính tốc độ dài của đầu cánh quạt: v = ω.r = 20 * 0,5 = 10 (m/s).',
        'Tính chu kì quay T: T = 2π / ω = 2 * 3,1416 / 20 ≈ 0,314 (s).',
        'Tính tần số quay f: f = 1 / T = 20 / (2π) ≈ 3,18 (Hz) (tức quạt quay hơn 3 vòng trong 1 giây).',
      ],
      answer: 'v = 10 m/s; T ≈ 0,314 s; f ≈ 3,18 Hz.',
    },
    checkQuestions: [
      {
        prompt:
          'Viết công thức liên hệ giữa tốc độ dài (v), tốc độ góc (ω) và bán kính quỹ đạo (r) trong chuyển động tròn đều.',
        choices: [
          { id: 'ct_1', label: 'v = ω * r' },
          { id: 'ct_2', label: 'v = ω / r' },
          { id: 'ct_3', label: 'ω = v * r' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['ct_1'],
        },
        explain: 'Tốc độ dài bằng tốc độ góc nhân với bán kính quỹ đạo: v = ωr.',
      },
      {
        prompt:
          'Một bánh xe quay đều với tốc độ góc 20 rad/s. Một điểm nằm cách trục quay 0,5 m có tốc độ dài bằng bao nhiêu?',
        answer: {
          kind: 'numeric',
          value: 10,
          unit: 'm/s',
        },
        explain: 'Tốc độ dài v = ω * r = 20 * 0,5 = 10 m/s.',
      },
    ],
    srsCards: [
      {
        hoi: 'Đơn vị đo chuẩn của tốc độ góc trong hệ SI là gì?',
        dap: 'Radian trên giây (rad/s).',
      },
      {
        hoi: 'Tại sao vectơ vận tốc trong chuyển động tròn đều không phải là vectơ không đổi?',
        dap: 'Vì tuy độ lớn của vận tốc không đổi, hướng của vectơ vận tốc luôn thay đổi (luôn có phương tiếp tuyến quỹ đạo).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly10-c6-b32',
    grade: '10',
    chapterNumber: 6,
    chapterTitle: 'Chuyển động tròn đều',
    lessonNumber: 32,
    title: 'Lực hướng tâm và gia tốc hướng tâm',
    hook:
      'Khi ô tô đi qua khúc cua tròn, bánh xe bám chặt mặt đường nhờ lực ma sát hướng vào tâm cua. ' +
      'Nếu đường trơn trượt mất đi lực này, xe sẽ văng ra ngoài theo quán tính. Lực hướng vào tâm này là gì?',
    theory:
      'GIA TỐC HƯỚNG TÂM (CENTRIPETAL ACCELERATION):\\n' +
      '— Trong chuyển động tròn đều, tuy tốc độ dài không đổi nhưng hướng vận tốc thay đổi liên tục, sinh ra gia tốc hướng tâm (vectơ a_ht).\\n' +
      '— Hướng: Vectơ gia tốc hướng tâm luôn hướng vào tâm của đường tròn quỹ đạo.\\n' +
      '— Độ lớn: a_ht = v² / r = ω².r.\\n\\n' +
      'LỰC HƯỚNG TÂM (CENTRIPETAL FORCE):\\n' +
      '— Lực (hoặc hợp lực) tác dụng lên vật chuyển động tròn đều gây ra gia tốc hướng tâm gọi là lực hướng tâm.\\n' +
      '— Hướng: Luôn hướng vào tâm quỹ đạo tròn.\\n' +
      '— Độ lớn: F_ht = m.a_ht = m.v² / r = m.ω².r.\\n' +
      '— Bản chất: Lực hướng tâm không phải lực mới trong tự nhiên, nó chỉ là một trong các lực cơ học đã biết (ma sát nghỉ, lực hấp dẫn, lực căng dây...) đóng vai trò hướng vào tâm để giữ vật chuyển động tròn.',
    workedExample: {
      problem:
        'Một ô tô khối lượng m = 1000 kg đi vào khúc cua tròn bán kính r = 50 m với tốc độ không đổi v = 10 m/s. ' +
        'Tính gia tốc hướng tâm và lực hướng tâm do lực ma sát giữa bánh xe và mặt đường cung cấp.',
      steps: [
        'Xác định khối lượng m = 1000 kg, bán kính r = 50 m, tốc độ v = 10 m/s.',
        'Tính gia tốc hướng tâm: a_ht = v² / r = 10² / 50 = 100 / 50 = 2 (m/s²).',
        'Tính lực hướng tâm tác dụng lên xe: F_ht = m.a_ht = 1000 * 2 = 2000 (N).',
        'Kết luận: Lực ma sát nghỉ giữa bánh xe và mặt đường đóng vai trò lực hướng tâm có độ lớn tối thiểu 2000 N để xe không bị trượt văng.',
      ],
      answer: 'a_ht = 2 m/s²; F_ht = 2000 N.',
    },
    checkQuestions: [
      {
        prompt:
          'Viết công thức tính độ lớn gia tốc hướng tâm a_ht của vật chuyển động tròn đều theo tốc độ dài v và bán kính r.',
        choices: [
          { id: 'ct_1', label: 'a_ht = v² / r' },
          { id: 'ct_2', label: 'a_ht = v / r' },
          { id: 'ct_3', label: 'a_ht = v * r' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['ct_1'],
        },
        explain:
          'Gia tốc hướng tâm tỉ lệ thuận với bình phương tốc độ dài và tỉ lệ nghịch bán kính quỹ đạo.',
      },
      {
        prompt:
          'Một sợi dây treo vật nặng 2 kg quay tròn đều trong mặt phẳng nằm ngang với bán kính quỹ đạo r = 0,5 m. Tốc độ dài của vật là v = 5 m/s. Tính lực căng dây đóng vai trò lực hướng tâm.',
        answer: {
          kind: 'numeric',
          value: 100,
          unit: 'N',
        },
        explain: 'F_ht = m * v² / r = 2 * 5² / 0,5 = 2 * 25 / 0,5 = 100 N.',
      },
    ],
    srsCards: [
      {
        hoi: 'Vectơ gia tốc hướng tâm trong chuyển động tròn đều có hướng như thế nào?',
        dap: 'Luôn hướng vào tâm của quỹ đạo tròn.',
      },
      {
        hoi: 'Lực hướng tâm có phải một lực độc lập mới xuất hiện không?',
        dap: 'Không, nó chỉ là tên gọi vai trò của các lực có sẵn (như ma sát, hấp dẫn, căng dây) khi hướng vào tâm quỹ đạo tròn.',
      },
    ],
    reviewStatus: 'draft',
  },
]
