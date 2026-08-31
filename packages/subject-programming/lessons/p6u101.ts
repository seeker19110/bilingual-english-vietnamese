// lessons/p6u101.ts — Unit p6-u101 "Post-mortem & trách nhiệm vận hành" của chặng
// principal-s4 "Dẫn dắt & trách nhiệm" (giai đoạn P5 "Tầm trưởng",
// docs/specs/2026-08-31-dot-4-p5-tam-truong.md mục ③). Luật soạn riêng của unit này: post-mortem
// dạy tinh thần KHÔNG ĐỔ LỖI CÁ NHÂN — mọi ví dụ nói về hệ thống/quy trình, không nêu một
// người cụ thể làm sai. Sự cố AI được nói riêng là ÂM THẦM và mang tính XÁC SUẤT, khác sự cố
// hạ tầng thường (sập là biết ngay).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6_U101_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u101-l1',
    unitId: 'p6-u101',
    language: 'python',
    title: 'Post-mortem không đổ lỗi',
    hook: 'Sự cố xảy ra. Câu hỏi sai là "ai làm sai" — câu đó khiến người ta giấu bớt chi tiết ở lần sau vì sợ bị nêu tên. Câu hỏi đúng là "QUY TRÌNH nào để lỗ hổng này lọt qua, và làm sao hệ thống tự bắt được nó lần sau". Đó là tinh thần post-mortem không đổ lỗi (blameless post-mortem).',
    theory:
      'POST-MORTEM (mổ xẻ sau sự cố) là tài liệu viết SAU KHI sự cố đã qua, mục đích duy nhất là để KHÔNG LẶP LẠI — không phải để tìm người chịu trách nhiệm cá nhân. Ba phần bắt buộc, theo đúng thứ tự:\n\n1. DÒNG THỜI GIAN (timeline) — liệt kê MỐC SỰ KIỆN khách quan theo giờ: lúc triển khai, lúc chỉ số bắt đầu bất thường, lúc có cảnh báo, lúc phát hiện, lúc khắc phục. Chỉ ghi SỰ KIỆN, không ghi nhận định ai đúng ai sai.\n2. NGUYÊN NHÂN GỐC (root cause) qua kỹ thuật 5 WHYS — hỏi "vì sao" liên tiếp, mỗi câu trả lời lại bị hỏi tiếp "vì sao" cho tới khi chạm một nguyên nhân ở tầng QUY TRÌNH/HỆ THỐNG (thiếu bước kiểm tra tự động, thiếu cảnh báo, thiếu tài liệu) chứ không dừng ở tầng "một người bấm nhầm nút". Dừng sớm ở "người X quên bước Y" là post-mortem HỜI HỢT — vì sao hệ thống lại ĐỂ một người quên mà không có gì chặn lại?\n3. HÀNH ĐỘNG CÓ CHỦ (action items) — mỗi hành động khắc phục phải có NGƯỜI NHẬN cụ thể và HẠN cụ thể, nhắm vào tầng quy trình đã tìm ra ở bước 2 (thêm bước kiểm tra tự động, thêm cảnh báo, viết checklist) — không phải "nhắc mọi người cẩn thận hơn".\n\nVì sao "không đổ lỗi" lại giúp hệ thống AN TOÀN HƠN: khi người báo cáo sự cố không sợ bị nêu tên, họ kể ĐẦY ĐỦ chi tiết thật (kể cả phần họ có thể đã góp phần gây ra) thay vì che bớt để tự bảo vệ mình — và chi tiết đầy đủ mới tìm ra được nguyên nhân gốc thật.',
    workedExample: {
      code: `# Dem so cau "vi sao" da co trong ban post-mortem, kiem co dat toi nguyen nhan goc chua
cau_vi_sao = [
    "Vi sao API tra loi 500? -> Vi ham xu ly gap loi khi input rong",
    "Vi sao input rong lot qua? -> Vi khong co validate dau vao",
    "Vi sao khong co validate? -> Vi checklist review khong bat buoc muc nay",
    "Vi sao checklist thieu muc nay? -> Vi checklist chua duoc cap nhat sau lan truoc",
    "Vi sao chua cap nhat? -> Vi khong co quy trinh dinh ky ra soat checklist",
]

if len(cau_vi_sao) >= 5:
    print("Da cham nguyen nhan goc: thieu quy trinh dinh ky ra soat checklist")
else:
    print(f"Con thieu {5 - len(cau_vi_sao)} cau vi sao")`,
      stdinLines: [],
    },
    predict: {
      code: `so_why = 3\nif so_why < 5:\n    print(f"thieu {5 - so_why}")\nelse:\n    print("du")`,
      question: 'Bản post-mortem mới có 3 câu "vì sao" — máy in ra gì?',
      choices: ['thieu 2', 'thieu 3', 'du', 'thieu 5'],
      answerIndex: 0,
      explain:
        '3 < 5 nên vào nhánh in "thieu {5 - so_why}" = "thieu {5-3}" = "thieu 2". Luật 5 whys yêu cầu ĐỦ 5 lượt hỏi mới coi là chạm nguyên nhân gốc — dừng ở lượt thứ 3 thường vẫn còn ở tầng "ai đó quên làm gì", chưa tới tầng quy trình.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự: đọc số câu vì sao đã có → so với ngưỡng 5 → in số còn thiếu hoặc xác nhận đã đủ.',
      lines: [
        'so_why = int(input("So cau vi sao: "))',
        'if so_why < 5:',
        '    print(f"Con thieu {5 - so_why} cau vi sao")',
        'else:',
        '    print("Da du 5 cau vi sao, cham nguyen nhan goc")',
      ],
    },
    make: {
      prompt:
        'Viết máy kiểm bản post-mortem đã chạm nguyên nhân gốc chưa.\n\nChương trình đọc 1 dòng input(): số lượng câu "vì sao" (whys) đã có trong bản post-mortem, là một số nguyên.\n\nLuật: cần ĐỦ 5 câu vì sao mới coi là chạm nguyên nhân gốc.\n\nNếu số câu < 5, in "Con thieu <so con thieu> cau vi sao" (số còn thiếu = 5 trừ số hiện có).\nNếu số câu >= 5, in "Da du 5 cau vi sao, cham nguyen nhan goc".',
      starterCode: `so_why = int(input("So cau vi sao: "))\n# Neu so_why < 5: in "Con thieu <5 - so_why> cau vi sao"\n# Nguoc lai: in "Da du 5 cau vi sao, cham nguyen nhan goc"\n`,
      testCases: [
        {
          stdinLines: ['2'],
          expected: 'Con thieu 3 cau vi sao',
          match: 'contains',
          hidden: false,
          label: 'Mới có 2 câu vì sao → còn thiếu 3',
        },
        {
          stdinLines: ['5'],
          expected: 'Da du 5 cau vi sao, cham nguyen nhan goc',
          match: 'contains',
          hidden: false,
          label: 'Đủ đúng 5 câu → đạt (ranh giới >=, không phải >)',
        },
        {
          stdinLines: ['7'],
          expected: 'Da du 5 cau vi sao, cham nguyen nhan goc',
          match: 'contains',
          hidden: false,
          label: 'Vượt 5 câu vẫn tính là đạt',
        },
        {
          stdinLines: ['0'],
          expected: 'Con thieu 5 cau vi sao',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: chưa có câu nào → còn thiếu đủ 5',
        },
      ],
      hints: [
        'Đọc số nguyên bằng int(input(...)).',
        'So sánh so_why với 5: if so_why < 5 thì còn thiếu, else thì đã đủ — chú ý dùng >= (đủ ĐÚNG 5 cũng tính là đạt, không phải phải hơn 5).',
        'In bằng f-string: print(f"Con thieu {5 - so_why} cau vi sao") ở nhánh thiếu.',
      ],
      sampleSolution: `so_why = int(input("So cau vi sao: "))\nif so_why < 5:\n    print(f"Con thieu {5 - so_why} cau vi sao")\nelse:\n    print("Da du 5 cau vi sao, cham nguyen nhan goc")`,
    },
    homework:
      'Chọn MỘT sự cố nhỏ đã gặp gần đây trong việc học/làm code của bạn (bug tự phát hiện, bài tập nộp sai, deploy hỏng...). Viết post-mortem 3 phần đúng khuôn: dòng thời gian (chỉ sự kiện, không nhận định), 5 câu vì sao liên tiếp tới nguyên nhân ở tầng quy trình, và ít nhất 1 hành động có người nhận (chính bạn) + hạn cụ thể. Không được viết câu nào đổ lỗi cho một người — kể cả chính bạn.',
    srsCards: [
      {
        hoi: 'Ba phần bắt buộc của một post-mortem không đổ lỗi là gì, theo đúng thứ tự?',
        dap: 'Dòng thời gian (chỉ sự kiện khách quan) → nguyên nhân gốc qua 5 whys (dừng ở tầng quy trình/hệ thống, không dừng ở "ai đó quên") → hành động có chủ (có người nhận + hạn cụ thể).',
      },
      {
        hoi: 'Vì sao dừng 5 whys ở "người X quên bước Y" là hời hợt?',
        dap: 'Vì câu hỏi đúng tiếp theo là "vì sao hệ thống lại để một người quên mà không có gì chặn lại" — nguyên nhân gốc thật nằm ở tầng quy trình/hệ thống thiếu cơ chế bắt lỗi đó, không phải ở cá nhân.',
      },
      {
        hoi: 'Vì sao tinh thần "không đổ lỗi" giúp hệ thống an toàn hơn về lâu dài?',
        dap: 'Người báo cáo không sợ bị nêu tên nên kể đầy đủ chi tiết thật thay vì che bớt để tự bảo vệ — chi tiết đầy đủ mới tìm ra được nguyên nhân gốc thật, chi tiết bị giấu thì sự cố tương tự sẽ lặp lại.',
      },
    ],
  },
  {
    id: 'p6-u101-l2',
    unitId: 'p6-u101',
    language: 'python',
    title: 'Trách nhiệm khi vận hành AI — sự cố âm thầm theo xác suất',
    hook: 'Server sập thì biết ngay — trang trắng xoá, cảnh báo hú. AI gia sư trả lời sai 8% câu hỏi thì KHÔNG có gì hú cả — mỗi câu vẫn trả lời trôi chảy, tự tin, chỉ là thỉnh thoảng sai. Sự cố AI không "sập", nó ÂM THẦM XUỐNG CẤP theo xác suất — và im lặng là chính điều làm nó nguy hiểm.',
    theory:
      'Sự cố hạ tầng truyền thống (server, mạng) có đặc điểm: NHỊ PHÂN (hoặc chạy hoặc không) và ỒN ÀO (log lỗi, cảnh báo, người dùng báo ngay). Sự cố AI khác hẳn ở cả hai điểm:\n\n1. XÁC SUẤT, không nhị phân — một model có thể "đúng 92%, sai 8%" là trạng thái BÌNH THƯỜNG của nó, không phải model "hỏng". Vấn đề vận hành thật là khi tỉ lệ sai TĂNG DẦN theo thời gian (model cũ đi, dữ liệu đầu vào đổi khác so với lúc huấn luyện/thiết kế prompt) mà không ai để ý.\n2. ÂM THẦM, không ồn ào — không có cảnh báo tự nhiên nào cho "AI trả lời sai nhưng nghe tự tin". Người dùng có thể tin và làm theo câu trả lời sai mà không báo lỗi, vì họ không có cách nào biết là sai.\n\nVì hai điểm khác biệt đó, trách nhiệm vận hành AI đòi phải chủ động THEO DÕI CHỈ SỐ và đặt NGƯỠNG CẢNH BÁO — không thể chờ "ai đó báo lỗi" như hạ tầng thường. Quy trình tối thiểu: ghi lại tỉ lệ lỗi (hoặc chỉ số chất lượng tương đương) theo từng ngày → so với một ngưỡng đã thống nhất trước → ngày nào VƯỢT ngưỡng thì cảnh báo NGAY, không chờ dồn thành xu hướng rõ rệt mới xử lý — vì lúc dồn đủ rõ để "nhìn thấy bằng mắt" thường là đã dùng sai kết quả AI trong một khoảng thời gian dài trước đó.',
    workedExample: {
      code: `# Kiem tung ngay co vuot nguong canh bao khong
ty_le_loi = [1.2, 0.8, 5.5, 2.1, 6.0]   # % loi tung ngay
nguong = 3.0                             # % - thong nhat truoc

co_canh_bao = False
for i, tl in enumerate(ty_le_loi, start=1):   # i bat dau tu 1 = ngay thu may
    if tl > nguong:
        print(f"Ngay {i}: canh bao ({tl}%)")
        co_canh_bao = True
if not co_canh_bao:
    print("Khong ngay nao vuot nguong")`,
      stdinLines: [],
    },
    predict: {
      code: `ty_le = [1.0, 4.0, 2.0]\nnguong = 3.0\nfor i, tl in enumerate(ty_le, start=1):\n    if tl > nguong:\n        print(i)`,
      question: 'Chỉ số nào (bắt đầu từ 1) được in ra?',
      choices: ['2', '1', '3', '1 và 2'],
      answerIndex: 0,
      explain:
        'Chỉ có phần tử ở vị trí thứ 2 (giá trị 4.0) lớn hơn ngưỡng 3.0. enumerate(ty_le, start=1) đánh số bắt đầu từ 1 nên chỉ số ngày là 2, không phải chỉ số mảng 1.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự: đọc dữ liệu và ngưỡng → duyệt từng ngày kèm chỉ số → so với ngưỡng và in cảnh báo → nếu không ngày nào vượt thì báo yên.',
      lines: [
        'ty_le = [float(v) for v in input("Ty le loi: ").split(",")]',
        'nguong = float(input("Nguong: "))',
        'co_canh_bao = False',
        'for i, tl in enumerate(ty_le, start=1):',
        '    if tl > nguong:',
        '        print(f"Ngay {i}: canh bao ({tl}%)")',
        '        co_canh_bao = True',
        'if not co_canh_bao:',
        '    print("Khong ngay nao vuot nguong")',
      ],
    },
    make: {
      prompt:
        'Viết máy phát hiện ngày vượt ngưỡng cảnh báo từ log tỉ lệ lỗi AI.\n\nChương trình đọc 2 dòng input():\n- Dòng 1: danh sách tỉ lệ lỗi theo ngày, là các số thực (%), cách nhau dấu phẩy, ví dụ "1.2,0.8,5.5,2.1,6.0".\n- Dòng 2: ngưỡng cảnh báo, một số thực (%).\n\nIn ra CHỈ SỐ NGÀY (bắt đầu từ 1, tức ngày thứ mấy trong danh sách) của MỌI ngày có tỉ lệ lỗi VƯỢT ngưỡng (lớn hơn, không tính bằng), mỗi ngày một dòng theo mẫu "Ngay <so>: canh bao (<ty le>%)". Nếu không có ngày nào vượt, in "Khong ngay nao vuot nguong".',
      starterCode: `ty_le = [float(v) for v in input("Ty le loi: ").split(",")]\nnguong = float(input("Nguong: "))\n# Duyet tung ngay kem chi so bat dau tu 1 (enumerate(..., start=1))\n# Neu ty_le[i] > nguong: in "Ngay <i>: canh bao (<ty_le>%)"\n# Neu khong co ngay nao vuot: in "Khong ngay nao vuot nguong"\n`,
      testCases: [
        {
          stdinLines: ['1.2,0.8,5.5,2.1,6.0', '3'],
          expected: 'Ngay 3: canh bao (5.5%)\nNgay 5: canh bao (6.0%)',
          match: 'contains',
          hidden: false,
          label: 'Ngày 3 và 5 vượt ngưỡng 3.0',
        },
        {
          stdinLines: ['1.0,2.0', '5'],
          expected: 'Khong ngay nao vuot nguong',
          match: 'contains',
          hidden: false,
          label: 'Không ngày nào vượt ngưỡng cao',
        },
        {
          stdinLines: ['9.9', '1'],
          expected: 'Ngay 1: canh bao (9.9%)',
          match: 'contains',
          hidden: false,
          label: 'Chỉ 1 ngày, vượt ngưỡng',
        },
        {
          stdinLines: ['3.0,3.0', '3.0'],
          expected: 'Khong ngay nao vuot nguong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: bằng đúng ngưỡng — KHÔNG tính là vượt (phải LỚN HƠN mới cảnh báo)',
        },
      ],
      hints: [
        'Tách và đổi kiểu: [float(v) for v in ...split(",")] cho danh sách số thực.',
        'Dùng enumerate(ty_le, start=1) để có cả chỉ số NGÀY (bắt đầu từ 1) và giá trị tỉ lệ trong cùng một vòng lặp.',
        'Điều kiện là > nguong (lớn hơn, không phải >=) — dùng một biến cờ (vd co_canh_bao = False) để biết cuối vòng lặp có in được dòng nào không, nếu không thì in "Khong ngay nao vuot nguong".',
      ],
      sampleSolution: `ty_le = [float(v) for v in input("Ty le loi: ").split(",")]\nnguong = float(input("Nguong: "))\nco_canh_bao = False\nfor i, tl in enumerate(ty_le, start=1):\n    if tl > nguong:\n        print(f"Ngay {i}: canh bao ({tl}%)")\n        co_canh_bao = True\nif not co_canh_bao:\n    print("Khong ngay nao vuot nguong")`,
    },
    homework:
      'Giả sử bạn phụ trách vận hành một tính năng AI trong app này (ví dụ chấm điểm phát âm). Viết ra: bạn sẽ chọn chỉ số nào để theo dõi hằng ngày (không nhất thiết là "tỉ lệ lỗi" — có thể là tỉ lệ người dùng bấm "không đúng", thời gian phản hồi...), ngưỡng cảnh báo bạn đặt là bao nhiêu và vì sao đặt ở mức đó, và nếu ngưỡng bị vượt liên tục 3 ngày thì bước tiếp theo của quy trình (không phải của một cá nhân) là gì.',
    srsCards: [
      {
        hoi: 'Sự cố AI khác sự cố hạ tầng truyền thống (server, mạng) ở hai điểm nào?',
        dap: 'XÁC SUẤT thay vì nhị phân (một tỉ lệ lỗi nền là bình thường, vấn đề là khi nó TĂNG DẦN) và ÂM THẦM thay vì ồn ào (không có cảnh báo tự nhiên, câu trả lời sai vẫn trông tự tin trôi chảy).',
      },
      {
        hoi: 'Vì sao vận hành AI cần chủ động đặt ngưỡng cảnh báo thay vì chờ người dùng báo lỗi?',
        dap: 'Vì người dùng không có cách nào tự biết một câu trả lời AI là sai để mà báo — sự cố im lặng xuống cấp; phải chủ động theo dõi chỉ số chất lượng và so với ngưỡng đã thống nhất trước, không chờ "nhìn thấy bằng mắt".',
      },
      {
        hoi: 'Ngưỡng cảnh báo nên xử lý thế nào khi bị vượt — chờ dồn thành xu hướng hay xử lý ngay?',
        dap: 'Ngày nào vượt ngưỡng thì cảnh báo NGAY, không chờ dồn nhiều ngày mới xử lý — vì lúc xu hướng đã đủ rõ để thấy bằng mắt thường là đã dùng sai kết quả AI trong một khoảng thời gian dài trước đó.',
      },
    ],
  },
]
