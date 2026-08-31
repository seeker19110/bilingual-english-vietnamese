// lessons/p6u95.ts — Unit "Đo lường AI: eval & chi phí" của chặng principal-s1 "Vận hành AI
// hiệu quả" (giai đoạn P5 "Tầm trưởng"). Xem docs/specs/2026-08-31-dot-4-p5-tam-truong.md
// mục ③.
//
// Bài dạy trực giác recall/precision (dùng lại đúng cặp thước đo dự án này dùng cho
// eval-tutor thật, xem CLAUDE.md mục 4/8) và ước lượng chi phí token — không gọi AI thật,
// mọi phép tính là số học thuần Python.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6_U95_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u95-l1',
    unitId: 'p6-u95',
    language: 'python',
    title: 'Eval căn bản — recall và precision trên bộ ca vàng',
    hook: 'Bộ lọc thư rác của bạn chặn đúng 90% thư rác thật — nghe ngon. Nhưng nó cũng chặn nhầm 1 trong 5 email quan trọng của khách hàng. Một con số "đúng 90%" giấu mất chuyện đó. Muốn biết AI đáng tin tới đâu, phải nhìn HAI con số riêng: bắt được bao nhiêu ca thật (recall), và đoán "có" thì đúng bao nhiêu phần (precision).',
    theory:
      'Chấm một mô hình phân loại (AI đoán "có/không") cần một BỘ CA VÀNG — các ca đã biết chắc đáp án đúng — rồi so nhãn AI đoán với nhãn thật. Bốn kết quả có thể xảy ra ở MỘT ca:\n- TRUE POSITIVE (TP): thật là "có", AI đoán "có" — đúng.\n- FALSE POSITIVE (FP): thật là "không", AI đoán "có" — báo động giả (vd chặn nhầm thư quan trọng thành rác).\n- FALSE NEGATIVE (FN): thật là "có", AI đoán "không" — bỏ lọt (vd để lọt thư rác vào hộp thư).\n- TRUE NEGATIVE (TN): thật là "không", AI đoán "không" — đúng.\n\nHai thước đo cốt lõi:\n- RECALL = TP / (TP + FN) — trong số ca THẬT LÀ "CÓ", AI bắt được bao nhiêu phần? Recall thấp = bỏ lọt nhiều.\n- PRECISION = TP / (TP + FP) — trong số ca AI ĐOÁN "CÓ", bao nhiêu phần đúng thật? Precision thấp = báo động giả nhiều.\n\nHai thước đo này thường ĐÁNH ĐỔI nhau: AI càng "dễ dãi" đoán "có" thì recall tăng (bắt được nhiều hơn) nhưng precision giảm (đoán ẩu, sai nhiều hơn). Chọn ưu tiên bên nào phụ thuộc hậu quả: chẩn đoán bệnh nặng thì ưu tiên recall cao (thà báo động giả còn hơn bỏ lọt ca bệnh thật); gợi ý quảng cáo thì có thể chịu recall thấp hơn để đổi lấy precision cao (không làm phiền người dùng bằng gợi ý sai). Đúng khuôn dự án DHCB đang dùng để chấm gia sư AI (`npm run eval:tutor`, xem CLAUDE.md mục 4).',
    workedExample: {
      code: `# Cham AI loc thu rac tren 5 email da biet dap an that
that = [1, 1, 0, 1, 0]      # 1 = rac, 0 = khong rac (dap an dung)
doan = [1, 0, 0, 1, 1]      # AI doan

tp = sum(1 for t, d in zip(that, doan) if t == 1 and d == 1)
fp = sum(1 for t, d in zip(that, doan) if t == 0 and d == 1)
fn = sum(1 for t, d in zip(that, doan) if t == 1 and d == 0)

recall = tp / (tp + fn)       # bat duoc bao nhieu phan rac that
precision = tp / (tp + fp)    # doan "rac" thi dung bao nhieu phan
print(f"TP={tp} FP={fp} FN={fn}")
print(f"Recall: {round(recall, 2)}")
print(f"Precision: {round(precision, 2)}")`,
      stdinLines: [],
    },
    predict: {
      code: `that = [1, 1, 1]\ndoan = [1, 1, 1]\ntp = sum(1 for t, d in zip(that, doan) if t == 1 and d == 1)\nfn = sum(1 for t, d in zip(that, doan) if t == 1 and d == 0)\nprint(round(tp / (tp + fn), 2))`,
      question: 'AI đoán đúng cả 3 ca "có" — recall in ra bao nhiêu?',
      choices: ['1.0', '0.0', '3.0', 'Báo lỗi chia cho 0'],
      answerIndex: 0,
      explain:
        'tp=3 (cả 3 ca thật "có" AI đều đoán "có"), fn=0 (không bỏ lọt ca nào) → recall = 3/(3+0) = 1.0. Recall = 1.0 nghĩa là bắt được TOÀN BỘ ca thật, không bỏ lọt ca nào.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự: đếm tp/fp/fn → tính recall → tính precision.',
      lines: [
        'tp = sum(1 for t, d in zip(that, doan) if t == 1 and d == 1)',
        'fp = sum(1 for t, d in zip(that, doan) if t == 0 and d == 1)',
        'fn = sum(1 for t, d in zip(that, doan) if t == 1 and d == 0)',
        'recall = tp / (tp + fn)',
        'precision = tp / (tp + fp)',
      ],
    },
    make: {
      prompt:
        'Viết máy chấm recall và precision cho một bộ ca vàng.\n\nChương trình đọc 2 dòng input():\n- Dòng 1: nhãn THẬT, các số 0/1 cách nhau dấu phẩy (vd "1,1,0,1,0").\n- Dòng 2: nhãn AI ĐOÁN, cùng độ dài, cùng định dạng.\n\nTính recall = TP/(TP+FN) và precision = TP/(TP+FP), làm tròn 2 chữ số thập phân. Nếu mẫu số của một thước đo bằng 0 (không có ca nào để chia) thì thước đo đó in ra "0.0". In đúng 2 dòng:\nRecall: <so>\nPrecision: <so>',
      starterCode: `that = [int(x) for x in input("Nhan that: ").split(",")]\ndoan = [int(x) for x in input("AI doan: ").split(",")]\n# Dem tp, fp, fn roi tinh recall, precision (nho xu ly mau so = 0)\n`,
      testCases: [
        {
          stdinLines: ['1,1,0,1,0', '1,0,0,1,1'],
          expected: 'Recall: 0.67\nPrecision: 0.67',
          match: 'contains',
          hidden: false,
          label: 'tp=2, fn=1, fp=1 → recall=precision=0.67',
        },
        {
          stdinLines: ['1,1,1', '1,1,1'],
          expected: 'Recall: 1.0\nPrecision: 1.0',
          match: 'contains',
          hidden: false,
          label: 'Đoán đúng hết → recall và precision đều 1.0',
        },
        {
          stdinLines: ['0,0,0', '0,1,0'],
          expected: 'Recall: 0.0\nPrecision: 0.0',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: không có ca "có" thật nào (mẫu số recall = 0) và 1 báo động giả (precision = 0)',
        },
      ],
      hints: [
        'Đếm bằng zip: tp = sum(1 for t, d in zip(that, doan) if t == 1 and d == 1) — tương tự cho fp (t==0, d==1) và fn (t==1, d==0).',
        'recall = tp / (tp + fn) NHƯNG nếu (tp + fn) == 0 thì gán recall = 0.0 để tránh chia cho 0 — tương tự cho precision với (tp + fp).',
        'Làm tròn bằng round(recall, 2) trước khi in; in đúng mẫu print(f"Recall: {recall}") và print(f"Precision: {precision}").',
      ],
      sampleSolution: `that = [int(x) for x in input("Nhan that: ").split(",")]\ndoan = [int(x) for x in input("AI doan: ").split(",")]\ntp = sum(1 for t, d in zip(that, doan) if t == 1 and d == 1)\nfp = sum(1 for t, d in zip(that, doan) if t == 0 and d == 1)\nfn = sum(1 for t, d in zip(that, doan) if t == 1 and d == 0)\nrecall = round(tp / (tp + fn), 2) if (tp + fn) > 0 else 0.0\nprecision = round(tp / (tp + fp), 2) if (tp + fp) > 0 else 0.0\nprint(f"Recall: {recall}")\nprint(f"Precision: {precision}")`,
    },
    homework:
      'Nghĩ ra một tính năng AI trong app DHCB (chấm phát âm, sửa lỗi ngữ pháp, gợi ý bài học...) và một bộ 5 ca vàng tưởng tượng (nhãn thật + AI đoán). Tự tính tay recall/precision. Với tính năng bạn chọn, bỏ lọt một ca thật (FN) và báo động giả (FP) — cái nào gây hại nhiều hơn cho người học? Bạn muốn tối ưu recall hay precision, vì sao?',
    srsCards: [
      {
        hoi: 'Recall và precision đo hai điều khác nhau gì?',
        dap: 'Recall = TP/(TP+FN): trong số ca THẬT LÀ "có", AI bắt được bao nhiêu phần (recall thấp = bỏ lọt nhiều). Precision = TP/(TP+FP): trong số ca AI ĐOÁN "có", bao nhiêu phần đúng thật (precision thấp = báo động giả nhiều).',
      },
      {
        hoi: 'False positive và false negative khác nhau ra sao? Cho ví dụ.',
        dap: 'False positive (FP): thật là "không" mà đoán "có" — báo động giả (chặn nhầm thư quan trọng thành rác). False negative (FN): thật là "có" mà đoán "không" — bỏ lọt (để lọt thư rác thật vào hộp thư).',
      },
      {
        hoi: 'Vì sao recall và precision thường đánh đổi nhau?',
        dap: 'AI càng "dễ dãi" đoán "có" thì bắt được nhiều ca thật hơn (recall tăng) nhưng cũng đoán sai nhiều hơn (precision giảm). Ưu tiên bên nào tuỳ hậu quả: y tế ưu tiên recall cao, gợi ý quảng cáo có thể ưu tiên precision cao.',
      },
    ],
  },
  {
    id: 'p6-u95-l2',
    unitId: 'p6-u95',
    language: 'python',
    title: 'Ngân sách token & chi phí — và ý tưởng cache prompt',
    hook: 'AI không tính tiền theo "một câu hỏi" — nó tính theo TOKEN, đơn vị mảnh nhỏ của chữ (một từ tiếng Anh thường là 1-2 token, một câu tiếng Việt dài có thể vài chục token). Không ước lượng trước, hoá đơn cuối tháng dễ thành cú sốc. May là công thức tính chỉ là số học lớp 5.',
    theory:
      'Nhà cung cấp AI tính tiền theo ĐƠN GIÁ MỖI 1000 TOKEN (input và output có thể khác giá, ở đây bài học đơn giản hoá thành một đơn giá chung). Công thức:\n\nchi_phi = (tong_token / 1000) * don_gia\n\nVí dụ: dùng 150.000 token trong tháng, đơn giá 20 đồng/1000 token → chi phí = (150.000/1000) * 20 = 3.000 đồng.\n\nƯớc lượng trước ngân sách token giúp trả lời "tính năng này có rẻ đủ để mở miễn phí cho mọi người không?" — đúng câu hỏi CLAUDE.md dự án này luôn đặt ra khi thêm một lời gọi AI (mục 7: "mọi lệnh gọi AI phải đếm/giới hạn lượt").\n\nMột kỹ thuật giảm chi phí phổ biến: PROMPT CACHING — nếu phần ĐẦU của prompt (vd hướng dẫn hệ thống, ví dụ mẫu) giống hệt nhau giữa nhiều lần gọi, nhà cung cấp có thể ghi nhớ phần đó và tính giá RẺ HƠN NHIỀU (hoặc miễn phí) cho những lần gọi lặp lại — chỉ phần thay đổi (câu hỏi mới của người dùng) mới tính giá đầy đủ. Vì vậy soạn prompt với phần "khung cố định" đứng TRƯỚC phần "nội dung thay đổi" không chỉ gọn mà còn tiết kiệm tiền thật — dự án này áp dụng đúng ý tưởng đó ở "Prompt Caching Gateway" (xem `.agents/skills/financial-security-sentinel`).',
    workedExample: {
      code: `# Uoc luong chi phi AI trong thang tu tong token va don gia
tong_token = 150000       # so token da dung trong thang
don_gia = 20.0             # dong tren 1000 token

chi_phi = tong_token / 1000 * don_gia
print(f"Tong token: {tong_token}")
print(f"Chi phi uoc tinh: {int(chi_phi)} dong")

# Neu 40% so lan goi trung prompt (duoc cache), phan do gan nhu mien phi
token_duoc_cache = tong_token * 0.4
token_phai_tra = tong_token - token_duoc_cache
chi_phi_co_cache = token_phai_tra / 1000 * don_gia
print(f"Chi phi neu co cache 40%: {int(chi_phi_co_cache)} dong")`,
      stdinLines: [],
    },
    predict: {
      code: `tong_token = 500000\ndon_gia = 10.0\nchi_phi = tong_token / 1000 * don_gia\nprint(int(chi_phi))`,
      question: '500.000 token, đơn giá 10 đồng/1000 token — chi phí in ra bao nhiêu?',
      choices: ['5000', '50000', '45000', '500000'],
      answerIndex: 0,
      explain:
        '500.000 / 1000 = 500 (nghìn token), nhân đơn giá 10 đồng → 500 * 10 = 5000 đồng. int() ở đây chỉ cắt phần thập phân (5000.0 → 5000), không làm tròn số đã nguyên.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự: chia tổng token cho 1000 → nhân đơn giá → làm tròn xuống số nguyên.',
      lines: [
        'so_nghin_token = tong_token / 1000',
        'chi_phi_thuc = so_nghin_token * don_gia',
        'chi_phi_lam_tron = int(chi_phi_thuc)',
        'print(f"Chi phi: {chi_phi_lam_tron} dong")',
      ],
    },
    make: {
      prompt:
        'Viết máy ước lượng chi phí AI trong tháng.\n\nChương trình đọc 2 dòng input():\n- Dòng 1: tổng số token dùng trong tháng (số nguyên).\n- Dòng 2: đơn giá VNĐ trên 1000 token (số thực).\n\nTính chi phí = tổng_token / 1000 * đơn_giá, LÀM TRÒN XUỐNG (bỏ phần thập phân) thành số nguyên đồng. In đúng 1 dòng:\nChi phi: <so> dong',
      starterCode: `tong_token = int(input("Tong token: "))\ndon_gia = float(input("Don gia moi 1000 token: "))\n# Tinh chi phi va lam tron xuong so nguyen\n`,
      testCases: [
        {
          stdinLines: ['150000', '20'],
          expected: 'Chi phi: 3000 dong',
          match: 'contains',
          hidden: false,
          label: '150.000 token, đơn giá 20 → 3.000 đồng',
        },
        {
          stdinLines: ['999', '15'],
          expected: 'Chi phi: 14 dong',
          match: 'contains',
          hidden: false,
          label: '999 token, đơn giá 15 → 14,985 làm tròn xuống còn 14',
        },
        {
          stdinLines: ['2500000', '7.5'],
          expected: 'Chi phi: 18750 dong',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: 2.500.000 token, đơn giá 7.5 → 18.750 đồng (chia hết, không mất phần thập phân)',
        },
      ],
      hints: [
        'Đọc đúng kiểu: int(input(...)) cho tổng token (số nguyên), float(input(...)) cho đơn giá (số thực).',
        'Công thức: chi_phi = tong_token / 1000 * don_gia — phép / luôn ra số thực dù tong_token là int.',
        'Làm tròn xuống bằng int(chi_phi) — int() trên số dương luôn CẮT phần thập phân, đúng nghĩa "làm tròn xuống" ở bài này. In bằng print(f"Chi phi: {int(chi_phi)} dong").',
      ],
      sampleSolution: `tong_token = int(input("Tong token: "))\ndon_gia = float(input("Don gia moi 1000 token: "))\nchi_phi = tong_token / 1000 * don_gia\nprint(f"Chi phi: {int(chi_phi)} dong")`,
    },
    homework:
      'Ước lượng chi phí tháng cho một tính năng AI bạn tưởng tượng: giả sử 1.000 người dùng, mỗi người gọi AI 20 lần/ngày, mỗi lần tốn trung bình 500 token, đơn giá 15 đồng/1000 token. Tính chi phí một tháng (30 ngày) KHÔNG cache, rồi tính lại NẾU 50% token được cache (gần miễn phí). Chênh lệch bao nhiêu? Từ con số đó, bạn có nghĩ tính năng này mở miễn phí cho mọi người được không?',
    srsCards: [
      {
        hoi: 'Công thức ước lượng chi phí AI theo token là gì?',
        dap: 'chi_phi = (tong_token / 1000) * don_gia_moi_1000_token — nhà cung cấp AI tính tiền theo token (mảnh nhỏ của chữ), không theo "một câu hỏi".',
      },
      {
        hoi: 'Prompt caching giúp tiết kiệm chi phí bằng cách nào?',
        dap: 'Nếu phần ĐẦU prompt (hướng dẫn hệ thống, ví dụ mẫu) giống hệt nhau giữa nhiều lần gọi, nhà cung cấp ghi nhớ và tính giá rẻ hơn nhiều cho những lần lặp lại — chỉ phần thay đổi mới tính giá đầy đủ. Nên đặt phần cố định TRƯỚC phần thay đổi trong prompt.',
      },
    ],
  },
]
