// lessons/p6u64.ts — P6-U64: HƯỚNG AI, chặng S1 — Đánh giá tự động (module `ai-s1-m3`).
//
// p6-u1 (đã có từ trước) phủ 2/4 module của ai-s1 (gọi mô hình + RAG). Hai module còn lại —
// "Đánh giá tự động" và "An toàn và chi phí" (specializations/ai.ts) — chưa có bài học 8 bước
// thật, nên chặng ai-s1 chưa đăng ký được ở stageUnits.ts. File này khép module thứ ba.
//
// Hai bài, đúng thứ tự nghề thật làm: l1 ĐO ĐƯỢC trước (recall@k của khâu truy hồi — không có
// con số thì "có vẻ tốt hơn" chỉ là cảm giác), l2 DÙNG con số đó để CHẶN HỒI QUY trong CI —
// đúng luật CLAUDE.md mục 8 của chính dự án này: đổi prompt/model PHẢI chạy lại eval và không
// được tụt so với baseline.
//
// Cả hai bài dùng làn `python` thuần, không gọi mô hình thật (đúng luật P4 §5: môn không proxy
// khoá bên thứ ba) — chấm bằng cổng python3 thật (lessonsPython.test.ts).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U64_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u64-l1',
    unitId: 'p6-u64',
    language: 'python',
    title: 'Bộ dữ liệu vàng & recall@k — đo được thì mới sửa được',
    hook: 'Bạn đổi cách cắt đoạn cho hệ RAG, thử vài câu hỏi, thấy "có vẻ ổn hơn". Đồng nghiệp đổi ngược lại, cũng thấy "có vẻ ổn hơn". Cả hai đều đang tự lừa mình bằng cảm giác. Nghề chỉ tin một thứ: một BỘ CÂU HỎI CÓ ĐÁP ÁN CHUẨN, chạy lại được y hệt mỗi lần, ra đúng MỘT con số.',
    theory:
      'BỘ DỮ LIỆU VÀNG (golden set) là danh sách câu hỏi kèm ĐÁP ÁN ĐÚNG đã biết trước — với hệ RAG, "đáp án đúng" thường là đoạn tài liệu LẼ RA phải được truy hồi. Không có bộ này thì mọi so sánh "bản A hay bản B tốt hơn" chỉ là tranh cãi bằng cảm giác.\n\nChỉ số đo khâu truy hồi phổ biến nhất: **recall@k** — trong k đoạn được xếp hạng cao nhất, có bao nhiêu PHẦN TRĂM câu hỏi mà đoạn ĐÚNG nằm lọt trong đó. Công thức: đếm số câu hỏi "trúng" (đoạn đúng nằm trong top-k), chia cho tổng số câu hỏi.\n\nVì sao phải đo theo K chứ không phải "đúng/sai top-1": recall@1 khắt khe (đoạn đúng phải đứng NGAY đầu), recall@5 khoan dung hơn (đoạn đúng chỉ cần lọt vào 5 đoạn đầu — đủ để bước sinh câu trả lời còn cơ hội dùng tới nó). Hai con số phục vụ hai câu hỏi khác nhau: recall@1 nói xếp hạng có SẮC không, recall@5 nói hệ thống có BỎ SÓT hẳn thông tin không.\n\nMột nguyên tắc phải giữ khi soạn bộ vàng: câu hỏi phải LẤY TỪ NGƯỜI DÙNG THẬT (hoặc mô phỏng sát người dùng thật), không phải bịa ra cho dễ đúng. Bộ vàng bịa dễ thường trùng gần như nguyên văn với tài liệu — recall đẹp trên bộ đó không nói lên điều gì về recall thật.',
    workedExample: {
      code: `# Bo vang: moi cau hoi kem CHI SO doan dung (id) trong kho tai lieu
VANG = [2, 0, 4, 1]           # dap an dung cho 4 cau hoi
DU_DOAN = [                   # ket qua he truy hoi tra ve, da XEP HANG
    [2, 5, 1],                 # cau 1: dung nam #1
    [3, 0, 5],                 # cau 2: dung nam #2
    [4, 1, 2],                 # cau 3: dung nam #1
    [3, 5, 2],                 # cau 4: dung KHONG nam trong top-3 -> bo sot
]


def recall_tai_k(vang, du_doan, k):
    dat = 0
    for i in range(len(vang)):
        if vang[i] in du_doan[i][:k]:   # doan dung co nam trong top-k khong
            dat += 1
    return dat / len(vang)


print(f"Recall@1: {recall_tai_k(VANG, DU_DOAN, 1):.2f}")
print(f"Recall@3: {recall_tai_k(VANG, DU_DOAN, 3):.2f}")
# @1 khat khe hon @3: cau 2 chi trung khi noi long thanh top-3`,
      stdinLines: [],
    },
    predict: {
      code: `def recall_tai_k(vang, du_doan, k):
    dat = 0
    for i in range(len(vang)):
        if vang[i] in du_doan[i][:k]:
            dat += 1
    return dat / len(vang)

VANG = [1, 3]
DU_DOAN = [[5, 1, 2], [3, 4, 5]]
print(recall_tai_k(VANG, DU_DOAN, 1))`,
      question: 'recall@1 của hai câu hỏi này là bao nhiêu?',
      choices: ['0.5', '1.0', '0.0', '0.25'],
      answerIndex: 0,
      explain:
        'Câu 1: top-1 là [5], đáp án đúng 1 KHÔNG có mặt → trượt. Câu 2: top-1 là [3], đáp án đúng 3 CÓ mặt → trúng. Một trong hai câu trúng → 1/2 = 0.5. Đây chính là lý do phải đo bằng con số: "có vẻ đúng phân nửa" nghe mơ hồ, còn 0.5 thì so sánh được qua từng lần đổi cấu hình.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm tính recall@k — nhớ chỉ xét k đoạn XẾP HẠNG CAO NHẤT, không phải cả danh sách.',
      lines: [
        'def recall_tai_k(vang, du_doan, k):',
        '    dat = 0',
        '    for i in range(len(vang)):',
        '        if vang[i] in du_doan[i][:k]:',
        '            dat += 1',
        '    return dat / len(vang)',
      ],
    },
    make: {
      prompt:
        'Viết máy tính recall@k cho một bộ dữ liệu vàng.\n\nChương trình đọc:\n- Dòng 1: n (số câu hỏi) và k (top-k), cách nhau một khoảng trắng.\n- n dòng tiếp theo: mỗi dòng "id_dung id1,id2,id3" — id_dung là chỉ số đoạn đúng, phần sau dấu cách là danh sách id đã XẾP HẠNG (đứng trước = hạng cao hơn), cách nhau dấu phẩy.\n\nIn đúng 1 dòng:\nRecall@k: <recall làm tròn 2 chữ số thập phân>\n\nVí dụ n=1, k=1, dòng "2 2,5,1" → id_dung=2 nằm ở vị trí đầu của [2,5,1] → Recall@k: 1.00.',
      starterCode: `first_line = input().split()
n = int(first_line[0])
k = int(first_line[1])
vang = []
du_doan = []
for _ in range(n):
    parts = input().split()
    # parts[0] la id_dung, parts[1] la chuoi "id1,id2,id3" cach nhau dau phay
    ...
# Tinh recall@k roi in: Recall@k: <2 chu so thap phan>
`,
      testCases: [
        {
          stdinLines: ['4 1', '2 2,5,1', '0 3,0,5', '4 4,1,2', '1 3,5,2'],
          expected: 'Recall@k: 0.50',
          match: 'contains',
          hidden: false,
          label: '4 câu hỏi, k=1 → 2/4 trúng',
        },
        {
          stdinLines: ['4 3', '2 2,5,1', '0 3,0,5', '4 4,1,2', '1 3,5,2'],
          expected: 'Recall@k: 0.75',
          match: 'contains',
          hidden: false,
          label: 'Cùng dữ liệu, nới k lên 3 → recall tăng (3/4 trúng)',
        },
        {
          stdinLines: ['1 5', '9 1,2,3'],
          expected: 'Recall@k: 0.00',
          match: 'contains',
          hidden: false,
          label: 'Đáp án đúng không xuất hiện trong kết quả trả về → trượt hẳn',
        },
        {
          stdinLines: ['1 10', '1 1'],
          expected: 'Recall@k: 1.00',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: k lớn hơn cả số phần tử trả về vẫn phải chạy đúng (không lỗi chỉ số)',
        },
        {
          stdinLines: ['2 1', '1 1,2', '2 2,3'],
          expected: 'Recall@k: 1.00',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: mọi câu đều trúng → recall tuyệt đối 1.00',
        },
      ],
      hints: [
        'Tách từng dòng dữ liệu: parts = input().split() cho parts[0] (id_dung dạng chuỗi) và parts[1] (chuỗi id cách nhau dấu phẩy).',
        'Đổi id_dung sang int; đổi chuỗi id thành list bằng [int(x) for x in parts[1].split(",")].',
        'Với mỗi câu hỏi, cắt k phần tử đầu của danh sách xếp hạng rồi kiểm id_dung có nằm trong đó không: id_dung in ds[:k].',
        'Đếm số câu trúng, chia cho n (số câu hỏi), rồi in bằng f"Recall@k: {recall:.2f}".',
      ],
      sampleSolution: `first_line = input().split()
n = int(first_line[0])
k = int(first_line[1])
dat = 0
for _ in range(n):
    parts = input().split()
    id_dung = int(parts[0])
    ds = [int(x) for x in parts[1].split(",")]
    if id_dung in ds[:k]:
        dat += 1
recall = dat / n
print(f"Recall@k: {recall:.2f}")`,
    },
    homework:
      'Tự soạn bộ vàng 10 câu cho một tài liệu bạn có (bài U1 của hướng này đã có sẵn TAI_LIEU quán ăn — dùng lại được). Với mỗi câu, tự tay ghi chỉ số đoạn ĐÚNG. Chạy bộ truy hồi ở bài U1-L1 lên cả 10 câu, ghi lại top-3 mỗi câu, rồi tính recall@1 và recall@3 bằng tay hoặc bằng hàm vừa viết. Recall@1 thấp mà recall@3 cao nói lên điều gì về chỗ cần sửa — xếp hạng hay truy hồi?',
    srsCards: [
      {
        hoi: 'Bộ dữ liệu vàng (golden set) dùng để làm gì?',
        dap: 'Danh sách câu hỏi kèm đáp án ĐÚNG đã biết trước, chạy lại được y hệt mỗi lần — để so sánh hai phiên bản hệ thống bằng CON SỐ thay vì cảm giác "có vẻ tốt hơn".',
      },
      {
        hoi: 'recall@k đo điều gì?',
        dap: 'Trong k đoạn xếp hạng cao nhất, bao nhiêu PHẦN TRĂM câu hỏi mà đoạn ĐÚNG nằm lọt trong đó. recall@1 khắt khe (đoạn đúng phải đứng đầu), recall@5 khoan dung hơn.',
      },
      {
        hoi: 'Vì sao bộ vàng phải lấy từ câu hỏi người dùng thật, không được bịa cho dễ đúng?',
        dap: 'Câu hỏi bịa thường trùng gần nguyên văn với tài liệu, nên recall đẹp trên bộ đó không phản ánh recall thật khi người dùng hỏi bằng lời của họ.',
      },
    ],
  },
  {
    id: 'p6-u64-l2',
    unitId: 'p6-u64',
    language: 'python',
    title: 'Chặn hồi quy chất lượng trong CI — điểm mới không được tệ hơn baseline',
    hook: 'Bạn sửa prompt cho ngắn gọn hơn, đỡ tốn token. Recall tụt từ 0,90 xuống 0,88 — không ai để ý vì code vẫn chạy, build vẫn xanh. Ba tuần sau người dùng phàn nàn trợ lý "trả lời trớt quớt hơn trước", và không ai nhớ nổi PR nào gây ra chuyện đó. Đây chính là lý do CLAUDE.md của dự án này bắt buộc: đổi prompt/model PHẢI chạy lại eval, và CI phải TỰ CHẶN nếu điểm tụt.',
    theory:
      'Đo được (bài trước) mới chỉ là một nửa. Nửa còn lại: biến con số đó thành một CỔNG tự động — chạy trong CI, đỏ là chặn merge, không cần ai nhớ để tự kiểm bằng mắt.\n\nLuật cổng: so điểm MỚI với điểm BASELINE (điểm đã ghi nhận của phiên bản đang chạy production). Tụt QUÁ một ngưỡng dung sai (dung_sai) thì HỎNG.\n\nVì sao cần dung sai thay vì so bằng tuyệt đối (moi < baseline): một vài bài eval có thể dao động vài phần nghìn do thứ tự float cộng dồn khác nhau giữa hai lần chạy — so tuyệt đối sẽ đỏ oan liên tục vì nhiễu không đáng kể. Dung sai nhỏ (ví dụ 0,01) hấp thụ nhiễu đó mà vẫn bắt được hồi quy THẬT.\n\nRanh giới đúng bằng ngưỡng (moi == baseline - dung_sai) KHÔNG tính là hồi quy — điều kiện phải là "<" (tụt SÂU HƠN ngưỡng), không phải "<=". Nếu dùng "<=" thì một điểm chỉ chạm đúng biên dưới cũng bị đánh rớt oan, dù nó vẫn nằm trong biên độ nhiễu cho phép.\n\nMỘT hệ có thể có NHIỀU chỉ số cùng lúc (recall, precision, tốc độ…) — cổng phải kiểm HẾT, không chỉ một cái, và phải NÓI RÕ chỉ số nào hỏng để người sửa biết nhìn đâu. Báo "CI đỏ" suông không đủ; báo "recall tụt" thì sửa đúng chỗ ngay.\n\nCổng này chính là bản chất của `npm run eval:tutor` + `docs/research/eval-tutor-baseline.md` trong CLAUDE.md của dự án — không phải lý thuyết suông, mà là quy trình dự án đang tự áp dụng cho từng PR sửa prompt.',
    workedExample: {
      code: `def chan_hoi_quy(diem_moi, diem_baseline, dung_sai=0.01):
    """Tra ve DANH SACH ten chi so bi hoi quy (tut sau hon nguong dung sai)."""
    hoi_quy = []
    for ten in sorted(diem_baseline):          # sap ten -> ket qua tat dinh
        if diem_moi[ten] < diem_baseline[ten] - dung_sai:
            hoi_quy.append(ten)
    return hoi_quy


BASELINE = {"recall": 0.90, "precision": 0.85, "toc_do": 0.95}
DIEM_MOI = {"recall": 0.88, "precision": 0.86, "toc_do": 0.80}

ket_qua = chan_hoi_quy(DIEM_MOI, BASELINE)
print(ket_qua)
if ket_qua:
    print("HONG: " + ", ".join(ket_qua))
else:
    print("DAT: khong co hoi quy")
# precision TANG (0.86 > 0.85) nen khong bi tinh la hoi quy du gan nguong`,
      stdinLines: [],
    },
    predict: {
      code: `def chan_hoi_quy(diem_moi, diem_baseline, dung_sai):
    hoi_quy = []
    for ten in sorted(diem_baseline):
        if diem_moi[ten] < diem_baseline[ten] - dung_sai:
            hoi_quy.append(ten)
    return hoi_quy

print(chan_hoi_quy({"a": 0.89}, {"a": 0.90}, 0.01))`,
      question:
        'Điểm mới 0.89, baseline 0.90, dung sai 0.01 — RANH GIỚI đúng bằng ngưỡng. Kết quả in ra?',
      choices: ['[]', "['a']", "['a', 'a']", 'Báo lỗi'],
      answerIndex: 0,
      explain:
        'Ngưỡng chặn là baseline - dung_sai = 0.90 - 0.01 = 0.89. Điều kiện là 0.89 < 0.89 — SAI, vì "<" không tính trường hợp BẰNG. Nên "a" không bị coi là hồi quy, kết quả là []. Đây là ranh giới đáng nhớ nhất của bài: nếu code lỡ viết "<=" thay vì "<", điểm đứng đúng ngay biên dưới sẽ bị đánh rớt oan dù nó vẫn nằm trong biên độ nhiễu cho phép.',
    },
    parsons: {
      prompt: 'Xếp lại hàm chặn hồi quy — duyệt theo tên đã sắp xếp để kết quả tất định.',
      lines: [
        'def chan_hoi_quy(diem_moi, diem_baseline, dung_sai):',
        '    hoi_quy = []',
        '    for ten in sorted(diem_baseline):',
        '        if diem_moi[ten] < diem_baseline[ten] - dung_sai:',
        '            hoi_quy.append(ten)',
        '    return hoi_quy',
      ],
    },
    make: {
      prompt:
        'Viết cổng CHẶN HỒI QUY chất lượng, kiểu như `npm run eval:tutor` của dự án này.\n\nChương trình đọc:\n- Dòng 1: n (số chỉ số).\n- n dòng tiếp: "ten diem_baseline diem_moi" (tên, hai số thực), mỗi dòng một chỉ số.\n- Dòng cuối: dung_sai (số thực).\n\nMột chỉ số HỒI QUY khi diem_moi NHỎ HƠN diem_baseline - dung_sai (đúng bằng ngưỡng thì KHÔNG tính).\n\nIn đúng 1 dòng:\n- Nếu có chỉ số hồi quy: "HONG: <ten1>, <ten2>, ..." — các tên theo THỨ TỰ BẢNG CHỮ CÁI, cách nhau ", ".\n- Không có chỉ số nào hồi quy: "DAT: khong co hoi quy".',
      starterCode: `n = int(input())
baseline = {}
moi = {}
for _ in range(n):
    ten, b, m = input().split()
    baseline[ten] = float(b)
    moi[ten] = float(m)
dung_sai = float(input())
# Tim cac ten bi hoi quy (theo thu tu bang chu cai), roi in HONG: ... hoac DAT: ...
`,
      testCases: [
        {
          stdinLines: ['3', 'recall 0.90 0.88', 'precision 0.85 0.86', 'toc_do 0.95 0.80', '0.01'],
          expected: 'HONG: recall, toc_do',
          match: 'contains',
          hidden: false,
          label: 'recall và toc_do tụt sâu hơn dung sai, precision tăng nên không bị tính',
        },
        {
          stdinLines: ['2', 'a 0.5 0.5', 'b 0.7 0.71', '0.01'],
          expected: 'DAT: khong co hoi quy',
          match: 'contains',
          hidden: false,
          label: 'Không chỉ số nào tụt → đạt',
        },
        {
          stdinLines: ['1', 'a 0.90 0.89', '0.01'],
          expected: 'DAT: khong co hoi quy',
          match: 'contains',
          hidden: false,
          label: 'RANH GIỚI: đúng bằng ngưỡng (0.89 = 0.90 − 0.01) → KHÔNG tính là hồi quy',
        },
        {
          stdinLines: ['3', 'z 0.9 0.1', 'a 0.9 0.1', 'm 0.9 0.1', '0.01'],
          expected: 'HONG: a, m, z',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: cả 3 hồi quy, nhưng phải in theo thứ tự BẢNG CHỮ CÁI (a, m, z)',
        },
        {
          stdinLines: ['1', 'a 0.50 0.99', '0.01'],
          expected: 'DAT: khong co hoi quy',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: điểm TĂNG vọt vẫn không phải hồi quy — cổng chỉ canh điểm TỤT',
        },
      ],
      hints: [
        'Đọc từng dòng chỉ số bằng ten, b, m = input().split() — nhớ b/m còn là chuỗi, phải float() trước khi so.',
        'Duyệt theo sorted(baseline) để thứ tự tên luôn nhất quán — không duyệt trực tiếp dict (thứ tự chèn có thể khác thứ tự bảng chữ cái).',
        'Điều kiện hồi quy là "<" chứ không phải "<=": moi[ten] < baseline[ten] - dung_sai. Đứng đúng ngưỡng KHÔNG bị tính.',
        'Gom xong danh sách tên hồi quy: rỗng thì in "DAT: khong co hoi quy"; có thì in "HONG: " + ", ".join(danh_sach).',
      ],
      sampleSolution: `n = int(input())
baseline = {}
moi = {}
for _ in range(n):
    ten, b, m = input().split()
    baseline[ten] = float(b)
    moi[ten] = float(m)
dung_sai = float(input())

hoi_quy = []
for ten in sorted(baseline):
    if moi[ten] < baseline[ten] - dung_sai:
        hoi_quy.append(ten)

if hoi_quy:
    print("HONG: " + ", ".join(hoi_quy))
else:
    print("DAT: khong co hoi quy")`,
    },
    homework:
      'Mở `docs/research/eval-tutor-baseline.md` của chính dự án này (nếu bạn đang làm trên repo DHCB) và đọc cách baseline thật được ghi nhận. So với hàm bạn vừa viết: dự án dùng chỉ số nào làm baseline, ngưỡng dung sai áp dụng ra sao, và khi CI đỏ thì quy trình yêu cầu làm gì trước khi được merge? Nếu không có repo này, thiết kế bằng lời cho một dự án của riêng bạn: chỉ số nào đáng đưa vào cổng, và ai là người có quyền hạ ngưỡng khi cần.',
    srsCards: [
      {
        hoi: 'Cổng chặn hồi quy chất lượng trong CI làm việc gì?',
        dap: 'So điểm MỚI với điểm BASELINE cho từng chỉ số; tụt sâu hơn một ngưỡng dung sai thì báo HỎNG và chặn merge — không cần ai nhớ tự kiểm bằng mắt.',
      },
      {
        hoi: 'Vì sao cần DUNG SAI thay vì so tuyệt đối (mới < baseline)?',
        dap: 'Vài chỉ số dao động vài phần nghìn do nhiễu (thứ tự cộng float khác nhau giữa hai lần chạy) — so tuyệt đối sẽ đỏ oan liên tục. Dung sai nhỏ hấp thụ nhiễu mà vẫn bắt được hồi quy thật.',
      },
      {
        hoi: 'Vì sao điều kiện hồi quy phải là "<" chứ không phải "<="?',
        dap: 'Đứng đúng ngưỡng dung sai vẫn nằm trong biên độ nhiễu cho phép, không phải hồi quy thật. Dùng "<=" sẽ đánh rớt oan những lần chạy chỉ lệch đúng bằng dung sai.',
      },
    ],
  },
]
