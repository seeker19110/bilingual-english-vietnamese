// lessons/p6u99.ts — Unit p6-u99 "RAG vs fine-tune & chọn model" của chặng principal-s3
// "Quyết định kiến trúc AI bằng ADR" (P5 "Tầm trưởng",
// docs/specs/2026-08-31-dot-4-p5-tam-truong.md mục ③).
//
// unitId 'p6-u99' thuộc bậc P6 chuẩn (curriculum.ts phải khai unit này — việc của phiên chính,
// không phải file này).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6_U99_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u99-l1',
    unitId: 'p6-u99',
    language: 'python',
    title: 'RAG vs fine-tune — chọn theo tốc độ dữ liệu đổi',
    hook: 'Chatbot hỗ trợ khách hàng cần biết giá sản phẩm — giá đổi mỗi tuần. Chatbot viết văn bản pháp lý cần đúng văn phong hợp đồng — văn phong đó ổn định hàng năm. Cùng là "cho AI biết thêm kiến thức", nhưng RAG và fine-tune phù hợp với hai bài toán khác hẳn nhau — và câu hỏi quyết định không phải "cái nào xịn hơn" mà là "dữ liệu của bạn đổi nhanh cỡ nào".',
    theory:
      'RAG (Retrieval-Augmented Generation) = mỗi lần trả lời, hệ thống TRA CỨU tài liệu liên quan rồi đưa vào prompt cho model đọc — model gốc không đổi, chỉ đổi NGUỒN TÀI LIỆU nó được xem.\n\nFINE-TUNE = huấn luyện lại (một phần) trọng số của model trên bộ dữ liệu riêng — kiến thức và văn phong bị "nướng" thẳng vào model.\n\nHai trục quyết định:\n1. TẦN SUẤT DỮ LIỆU ĐỔI — RAG chỉ cần cập nhật tài liệu (rẻ, tức thời). Fine-tune phải huấn luyện lại (chậm, tốn tiền) mỗi lần đổi. Dữ liệu đổi CÀNG NHANH thì RAG càng có lợi thế cập nhật.\n2. VĂN PHONG/ĐỊNH DẠNG ĐẶC THÙ — nếu output cần một giọng văn, cấu trúc, hoặc kỹ năng riêng biệt (không chỉ là "biết thêm sự thật"), fine-tune dạy được điều đó vào model; RAG chỉ thêm được THÔNG TIN, không dạy được CÁCH NÓI.\n\nLuật quyết định đơn giản dùng trong bài này: dữ liệu đổi quá thường xuyên (dưới 30 ngày một lần) thì RAG luôn thắng, bất kể văn phong — vì fine-tune không theo kịp tốc độ đổi. Nếu dữ liệu đủ ổn định (30 ngày trở lên) mà CẦN văn phong/định dạng đặc thù thì chọn fine-tune. Ổn định mà KHÔNG cần văn phong đặc thù thì vẫn chọn RAG — rẻ và linh hoạt hơn, không có lý do gì trả thêm chi phí huấn luyện.\n\nThực tế nhiều hệ AI dùng CẢ HAI: fine-tune để dạy văn phong nền, RAG để bơm sự thật mới nhất — nhưng bài này tập trung vào cách LÝ LUẬN chọn, không phải cách kết hợp.',
    workedExample: {
      code: `# Luat chon RAG hay fine-tune
so_ngay_doi = 7            # du lieu gia san pham doi moi tuan
can_van_phong_dac_thu = False

if so_ngay_doi < 30:
    khuyen_nghi = "RAG (du lieu doi qua nhanh de fine-tune theo kip)"
elif can_van_phong_dac_thu:
    khuyen_nghi = "fine-tune (du lieu on dinh, can van phong dac thu)"
else:
    khuyen_nghi = "RAG (du lieu on dinh nhung khong can van phong dac thu, RAG re va linh hoat hon)"

print(f"Khuyen nghi: {khuyen_nghi}")`,
      stdinLines: [],
    },
    predict: {
      code: `so_ngay_doi = 365\ncan_van_phong = True\nif so_ngay_doi < 30:\n    print("RAG")\nelif can_van_phong:\n    print("fine-tune")\nelse:\n    print("RAG khac")`,
      question: 'Dữ liệu đổi 365 ngày một lần, cần văn phong đặc thù. In ra gì?',
      choices: ['fine-tune', 'RAG', 'RAG khac', 'Không in gì'],
      answerIndex: 0,
      explain:
        '365 không nhỏ hơn 30 nên nhánh đầu bị bỏ qua; can_van_phong là True nên rơi vào nhánh elif, in "fine-tune". Dữ liệu ổn định lâu dài + cần văn phong riêng là đúng trường hợp fine-tune có lợi thế.',
    },
    parsons: {
      prompt:
        'Xếp đúng luật quyết định: đổi quá nhanh → RAG; ổn định + cần văn phong → fine-tune; ổn định + không cần văn phong → vẫn RAG.',
      lines: [
        'if so_ngay_doi < 30:',
        '    khuyen_nghi = "RAG (qua nhanh)"',
        'elif can_van_phong_dac_thu:',
        '    khuyen_nghi = "fine-tune (on dinh, can van phong)"',
        'else:',
        '    khuyen_nghi = "RAG (on dinh, khong can van phong)"',
      ],
    },
    make: {
      prompt:
        'Viết máy khuyến nghị RAG hay fine-tune.\n\nChương trình đọc 2 dòng input():\n- Dòng 1: số ngày trung bình dữ liệu thay đổi một lần (số nguyên).\n- Dòng 2: "co" hoặc "khong" — có cần văn phong/định dạng đặc thù hay không.\n\nLuật (xét theo đúng thứ tự):\n1. Nếu số ngày < 30 → in "Khuyen nghi: RAG (du lieu doi qua nhanh de fine-tune theo kip)"\n2. Nếu không, và dòng 2 là "co" → in "Khuyen nghi: fine-tune (du lieu on dinh, can van phong dac thu)"\n3. Còn lại → in "Khuyen nghi: RAG (du lieu on dinh nhung khong can van phong dac thu, RAG re va linh hoat hon)"',
      starterCode: `so_ngay = int(input("So ngay doi trung binh: "))\ncan_van_phong = input("Can van phong dac thu (co/khong): ")\n# Ap dung 3 luat theo dung thu tu, in dung 1 dong khuyen nghi\n`,
      testCases: [
        {
          stdinLines: ['7', 'khong'],
          expected: 'Khuyen nghi: RAG (du lieu doi qua nhanh de fine-tune theo kip)',
          match: 'contains',
          hidden: false,
          label: 'Đổi mỗi 7 ngày → quá nhanh, luôn RAG',
        },
        {
          stdinLines: ['365', 'co'],
          expected: 'Khuyen nghi: fine-tune (du lieu on dinh, can van phong dac thu)',
          match: 'contains',
          hidden: false,
          label: 'Ổn định 365 ngày + cần văn phong đặc thù → fine-tune',
        },
        {
          stdinLines: ['365', 'khong'],
          expected:
            'Khuyen nghi: RAG (du lieu on dinh nhung khong can van phong dac thu, RAG re va linh hoat hon)',
          match: 'contains',
          hidden: false,
          label: 'Ổn định nhưng không cần văn phong đặc thù → vẫn RAG',
        },
        {
          stdinLines: ['30', 'co'],
          expected: 'Khuyen nghi: fine-tune (du lieu on dinh, can van phong dac thu)',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đúng 30 ngày — KHÔNG nhỏ hơn 30 nên đã tính là ổn định',
        },
      ],
      hints: [
        'Đọc so_ngay bằng int(input(...)); can_van_phong đọc thẳng bằng input(...) vì đề đã cho đúng chuỗi "co"/"khong".',
        'if so_ngay < 30: ... — ranh giới là < 30, đúng 30 KHÔNG rơi vào nhánh này (thuộc "ổn định").',
        'elif can_van_phong == "co": ... else: ... — nhớ in đúng nguyên văn 3 câu khuyến nghị, kể cả phần chú thích trong ngoặc.',
      ],
      sampleSolution: `so_ngay = int(input("So ngay doi trung binh: "))\ncan_van_phong = input("Can van phong dac thu (co/khong): ")\nif so_ngay < 30:\n    print("Khuyen nghi: RAG (du lieu doi qua nhanh de fine-tune theo kip)")\nelif can_van_phong == "co":\n    print("Khuyen nghi: fine-tune (du lieu on dinh, can van phong dac thu)")\nelse:\n    print("Khuyen nghi: RAG (du lieu on dinh nhung khong can van phong dac thu, RAG re va linh hoat hon)")`,
    },
    homework:
      'Lấy 2 hệ AI thật (của bạn hoặc bạn biết): một cái nên dùng RAG, một cái nên dùng fine-tune (hoặc cả hai). Với mỗi cái, trả lời: dữ liệu đổi bao lâu một lần (ước lượng), có cần văn phong/định dạng đặc thù không? Viết 1 ADR ngắn cho quyết định đó theo khuôn bài u98-l1.',
    srsCards: [
      {
        hoi: 'Trục quyết định số 1 giữa RAG và fine-tune là gì?',
        dap: 'Tần suất dữ liệu đổi. RAG chỉ cần cập nhật tài liệu (rẻ, tức thời); fine-tune phải huấn luyện lại mỗi lần đổi (chậm, tốn tiền) — dữ liệu đổi càng nhanh, RAG càng có lợi.',
      },
      {
        hoi: 'Fine-tune làm được điều gì mà RAG không làm được?',
        dap: 'RAG chỉ thêm được THÔNG TIN (tài liệu tra cứu); fine-tune dạy được CÁCH NÓI — văn phong, cấu trúc, kỹ năng riêng biệt được "nướng" vào trọng số model.',
      },
      {
        hoi: 'Dữ liệu ổn định (đổi chậm) nhưng KHÔNG cần văn phong đặc thù thì nên chọn RAG hay fine-tune?',
        dap: 'Vẫn nên chọn RAG — rẻ và linh hoạt hơn. Không có lý do trả thêm chi phí huấn luyện khi mục tiêu chỉ là "biết thêm sự thật", không cần dạy cách nói riêng.',
      },
    ],
  },
  {
    id: 'p6-u99-l2',
    unitId: 'p6-u99',
    language: 'python',
    title: 'Chọn model theo chi phí × chất lượng — loại phương án bị áp đảo',
    hook: 'Bảng so sánh 5 model AI: giá khác nhau, điểm chất lượng khác nhau. Model nào "tốt nhất" phụ thuộc bạn coi trọng gì — nhưng có những model KHÔNG BAO GIỜ đáng chọn, dù bạn coi trọng gì đi nữa: khi có một model khác vừa rẻ hơn VỪA tốt hơn (hoặc bằng). Loại những model đó ra trước, danh sách còn lại mới đáng cân nhắc.',
    theory:
      'Khi so hai lựa chọn theo HAI tiêu chí trái hướng (giá càng THẤP càng tốt, chất lượng càng CAO càng tốt), một phương án bị coi là BỊ ÁP ĐẢO (dominated) nếu tồn tại một phương án KHÁC:\n- có giá THẤP HƠN HOẶC BẰNG, VÀ\n- có chất lượng CAO HƠN HOẶC BẰNG,\n- và ít nhất MỘT trong hai điều đó là chặt hơn (thấp hơn thật sự, hoặc cao hơn thật sự) — nếu hai phương án giống hệt nhau về cả giá lẫn điểm thì không phương án nào áp đảo phương án kia.\n\nMột phương án bị áp đảo thì KHÔNG BAO GIỜ đáng chọn: luôn có phương án kia tốt hơn hoặc bằng ở cả hai mặt. Tập hợp các phương án KHÔNG bị áp đảo gọi là ĐƯỜNG BIÊN HIỆU QUẢ (efficient frontier / Pareto frontier) — đây mới là danh sách thật sự cần cân nhắc; việc chọn cái nào trong đường biên phụ thuộc bạn ưu tiên rẻ hay ưu tiên chất lượng, nhưng chọn ngoài đường biên luôn là một sai lầm có thể chứng minh được bằng số.\n\nVí dụ "A:10:70, B:15:65, C:20:90": B (giá 15, điểm 65) so với A (giá 10, điểm 70) — A rẻ hơn (10 ≤ 15) VÀ tốt hơn (70 ≥ 65), ít nhất một điều chặt hơn thật sự (10 < 15) → B bị A áp đảo, loại B. A so với C: A rẻ hơn nhưng điểm THẤP hơn — không bên nào áp đảo bên nào. Kết quả: A và C nằm trên đường biên, B bị loại.',
    workedExample: {
      code: `# Loc danh sach model, giu lai nhung model KHONG bi ap dao
models = [("A", 10, 70), ("B", 15, 65), ("C", 20, 90)]  # (ten, gia, diem)

def bi_ap_dao(m, models):
    ten, gia, diem = m
    for ten2, gia2, diem2 in models:
        if ten2 == ten:
            continue
        # m2 ap dao m neu re hon-hoac-bang VA tot hon-hoac-bang, VA that su chat hon o it nhat 1 mat
        re_hon_hoac_bang = gia2 <= gia
        tot_hon_hoac_bang = diem2 >= diem
        chat_hon_that_su = gia2 < gia or diem2 > diem
        if re_hon_hoac_bang and tot_hon_hoac_bang and chat_hon_that_su:
            return True
    return False

for m in models:
    if not bi_ap_dao(m, models):
        print(m[0])   # con lai tren duong bien: A, C`,
      stdinLines: [],
    },
    predict: {
      code: `models = [("X", 5, 50), ("Y", 5, 80)]\n\ndef bi_ap_dao(m, models):\n    ten, gia, diem = m\n    for t2, g2, d2 in models:\n        if t2 == ten:\n            continue\n        if g2 <= gia and d2 >= diem and (g2 < gia or d2 > diem):\n            return True\n    return False\n\nfor m in models:\n    if not bi_ap_dao(m, models):\n        print(m[0])`,
      question: 'X giá 5 điểm 50, Y giá 5 điểm 80 (giá bằng nhau). In ra gì?',
      choices: ['Y', 'X\nY', 'X', 'Không in gì'],
      answerIndex: 0,
      explain:
        'Y áp đảo X: giá bằng nhau (5 ≤ 5) và điểm Y cao hơn thật sự (80 > 50) — đủ điều kiện "chặt hơn ở ít nhất một mặt". X bị áp đảo, chỉ Y còn lại trên đường biên.',
    },
    parsons: {
      prompt:
        'Xếp đúng hàm kiểm tra một model có bị áp đảo bởi model khác trong danh sách hay không.',
      lines: [
        'def bi_ap_dao(m, models):',
        '    ten, gia, diem = m',
        '    for ten2, gia2, diem2 in models:',
        '        if ten2 == ten:',
        '            continue',
        '        if gia2 <= gia and diem2 >= diem and (gia2 < gia or diem2 > diem):',
        '            return True',
        '    return False',
      ],
    },
    make: {
      prompt:
        'Viết máy lọc "đường biên hiệu quả" từ danh sách model AI.\n\nChương trình đọc 1 dòng input(): danh sách model, mỗi model dạng "ten:gia:diem" (giá VNĐ/1000 token là số nguyên, điểm chất lượng 0-100 là số nguyên), các model cách nhau dấu chấm phẩy (vd "A:10:70;B:15:65;C:20:90").\n\nMột model bị coi là BỊ ÁP ĐẢO nếu tồn tại model khác vừa giá <= VỪA điểm >=, và ít nhất một trong hai điều đó chặt hơn thật sự (giá thấp hơn thật sự HOẶC điểm cao hơn thật sự).\n\nIn ra tên các model KHÔNG bị áp đảo, mỗi tên một dòng, theo ĐÚNG thứ tự xuất hiện trong input gốc.',
      starterCode: `raw = input("Danh sach model: ")\nmodels = []\nfor phan in raw.split(";"):\n    ten, gia, diem = phan.split(":")\n    models.append((ten, int(gia), int(diem)))\n# Voi tung model, kiem co bi model khac ap dao khong; neu khong thi in ten\n`,
      testCases: [
        {
          stdinLines: ['A:10:70;B:15:65;C:20:90'],
          expected: 'A\nC',
          match: 'contains',
          hidden: false,
          label: 'B bị A áp đảo (rẻ hơn và tốt hơn) → chỉ A, C còn lại',
        },
        {
          stdinLines: ['X:5:50;Y:5:80'],
          expected: 'Y',
          match: 'contains',
          hidden: false,
          label: 'Giá bằng nhau, Y điểm cao hơn thật sự → Y áp đảo X',
        },
        {
          stdinLines: ['P:10:60;Q:20:80;R:30:60'],
          expected: 'P\nQ',
          match: 'contains',
          hidden: false,
          label: 'R bị Q áp đảo (Q rẻ hơn và điểm bằng-hoặc-hơn) → P, Q còn lại',
        },
        {
          stdinLines: ['M:10:50;N:10:50;K:5:50'],
          expected: 'K',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: M và N giống hệt nhau (không áp đảo lẫn nhau) nhưng cả hai đều bị K áp đảo (rẻ hơn, điểm bằng)',
        },
      ],
      hints: [
        'Parse từng model: tách theo ";" rồi mỗi phần tách tiếp theo ":" thành (ten, gia, diem) — nhớ đổi gia/diem sang int.',
        'Viết hàm kiểm tra một model m có bị áp đảo không: duyệt các model KHÁC (bỏ qua chính nó — so theo vị trí/tên), nếu có model2 với gia2<=gia và diem2>=diem và (gia2<gia hoặc diem2>diem) thì m bị áp đảo.',
        'Duyệt models theo ĐÚNG thứ tự gốc, in tên model nào không bị áp đảo — đừng sort lại danh sách, thứ tự output phải khớp thứ tự input.',
      ],
      sampleSolution: `raw = input("Danh sach model: ")\nmodels = []\nfor phan in raw.split(";"):\n    ten, gia, diem = phan.split(":")\n    models.append((ten, int(gia), int(diem)))\n\ndef bi_ap_dao(chi_so, models):\n    ten, gia, diem = models[chi_so]\n    for i, (ten2, gia2, diem2) in enumerate(models):\n        if i == chi_so:\n            continue\n        if gia2 <= gia and diem2 >= diem and (gia2 < gia or diem2 > diem):\n            return True\n    return False\n\nfor i, m in enumerate(models):\n    if not bi_ap_dao(i, models):\n        print(m[0])`,
    },
    homework:
      'Lấy bảng giá/chất lượng thật của 3-4 model AI bạn biết (tự ước lượng điểm chất lượng theo cảm nhận nếu không có số chính thức). Chạy thuật toán bài này lên đó. Có model nào bị áp đảo mà đội bạn (hoặc bạn) vẫn đang dùng không? Nếu có, vì sao — có lý do nào KHÔNG nằm trong hai trục giá/chất lượng (vd độ trễ, giới hạn tốc độ, hỗ trợ) khiến việc dùng nó vẫn hợp lý?',
    srsCards: [
      {
        hoi: 'Một phương án bị coi là "bị áp đảo" (dominated) khi nào?',
        dap: 'Khi tồn tại phương án khác vừa rẻ hơn-hoặc-bằng VỪA tốt hơn-hoặc-bằng, và ít nhất một trong hai điều đó chặt hơn thật sự (rẻ hơn thật hoặc tốt hơn thật). Phương án bị áp đảo không bao giờ đáng chọn.',
      },
      {
        hoi: 'Đường biên hiệu quả (efficient/Pareto frontier) là gì?',
        dap: 'Tập hợp các phương án KHÔNG bị áp đảo bởi bất kỳ phương án nào khác. Đây là danh sách thật sự đáng cân nhắc — chọn ngoài đường biên là sai lầm chứng minh được bằng số, chọn cái nào TRONG đường biên mới là chuyện ưu tiên cá nhân.',
      },
      {
        hoi: 'Vì sao hai phương án giống hệt nhau cả giá lẫn điểm thì không cái nào áp đảo cái nào?',
        dap: 'Điều kiện áp đảo đòi hỏi ít nhất MỘT mặt phải chặt hơn thật sự (thấp hơn thật hoặc cao hơn thật), không chỉ bằng-hoặc-hơn ở cả hai mặt. Bằng nhau tuyệt đối ở cả hai trục thì không thoả điều kiện "chặt hơn thật sự".',
      },
    ],
  },
]
