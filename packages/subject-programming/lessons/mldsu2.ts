// lessons/mldsu2.ts — Bốn project đầu của chương C4 "7 project thực chiến" (khoá ngắn
// "Machine Learning & Data Science", docs/specs/2026-09-01-mlds-bai-hoc-chi-tiet.md §3.1–3.4):
// hồi quy, phân loại + công bằng, gom cụm, NLP.
//
// unitId 'mlds-u2' là "unit ảo" của tầng khoá ngắn (xem lessons/mldsu1.ts). Toàn bộ code được
// chấm viết bằng Python THUẦN — không numpy/sklearn/pandas.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const MLDS_U2_LESSONS: ProgrammingLesson[] = [
  {
    id: 'mlds-u2-l1',
    unitId: 'mlds-u2',
    language: 'python',
    title: 'Project 1 — dự đoán giá nhà mini và đo sai số bằng MAE',
    hook: 'Nhà 45 m² trong ngõ đó giá bao nhiêu? Môi giới trả lời bằng kinh nghiệm; bạn trả lời bằng 6 căn đã bán quanh đó và một đường thẳng. Project đầu tiên của khoá: đi trọn một vòng từ dữ liệu thô tới con số dự đoán KÈM sai số trung bình — vì một dự đoán không có sai số đi kèm là một lời nói suông.',
    theory:
      'Đây là project đầu tiên: bạn ráp lại hồi quy tuyến tính (ml-u1-l2) với thói quen đo lường của người làm dữ liệu.\n\nMÔ HÌNH: gia = a × dien_tich + b, học bằng công thức least squares đã có ở ml-u1-l2:\n- a = tổng[(x − tb_x)(y − tb_y)] / tổng[(x − tb_x)²]\n- b = tb_y − a × tb_x\n\nTHƯỚC ĐO MỚI — MAE (Mean Absolute Error, sai số tuyệt đối trung bình): MAE = trung bình của |thật − dự đoán|. Ưu điểm lớn nhất là nó CÙNG ĐƠN VỊ với dữ liệu: "MAE 17,5 triệu" nói thẳng vào mặt bạn rằng mô hình lệch trung bình 17,5 triệu mỗi căn. Bạn không cần giải thích gì thêm cho người không làm kỹ thuật.\n\nHọ thước đo hồi quy, biết để đọc báo cáo người khác:\n- MAE — trung bình sai số tuyệt đối, mọi sai số nặng như nhau.\n- RMSE — căn của trung bình bình phương sai số, PHẠT NẶNG các ca lệch lớn. Chọn RMSE khi một cú lệch to tệ hơn nhiều cú lệch nhỏ.\n- MAPE — sai số theo phần trăm, dùng khi các giá trị chênh nhau nhiều bậc (gặp lại ở project 6).\n\nMột tính chất đẹp của hồi quy tuyến tính, nên tự kiểm bằng tay: đường hồi quy LUÔN đi qua điểm (trung bình x, trung bình y). Đưa vào diện tích đúng bằng trung bình thì mô hình trả về đúng giá trung bình. Nếu code của bạn không có tính chất đó, bạn đã sai công thức ở đâu đó.\n\nCẢNH BÁO nghề, phải nói thẳng: MAE trong bài này được đo TRÊN CHÍNH DỮ LIỆU HUẤN LUYỆN vì tập chỉ có 6 căn. Đó là con số LẠC QUAN — mô hình đã "thấy đáp án" (ml-u1-l4). Với dữ liệu thật bạn phải chia train/test rồi báo cáo MAE trên test. Ở đây ta chấp nhận đánh đổi để bài đủ nhỏ, nhưng phải nói ra, không được giấu.\n\nBản sklearn của cả project này gọn đúng bốn dòng: LinearRegression().fit(X, y), rồi mean_absolute_error(y, model.predict(X)). Bạn tự cài hôm nay để biết bốn dòng đó tính gì.',
    workedExample: {
      code: `# Hoi quy tuyen tinh + MAE tren mot bang nho
du_lieu = [(30, 950), (40, 1180), (50, 1520)]   # (dien tich m2, gia trieu)
x = [d[0] for d in du_lieu]
y = [d[1] for d in du_lieu]

tb_x = sum(x) / len(x)
tb_y = sum(y) / len(y)
tu_so = sum((x[i] - tb_x) * (y[i] - tb_y) for i in range(len(x)))
mau_so = sum((x[i] - tb_x) ** 2 for i in range(len(x)))
a = tu_so / mau_so                      # do doc: moi m2 them bao nhieu trieu
b = tb_y - a * tb_x                     # diem cat truc
print(f"Mo hinh: gia = {round(a, 2)} * dien_tich + {round(b, 2)}")

sai_so = [abs(y[i] - (a * x[i] + b)) for i in range(len(x))]
mae = sum(sai_so) / len(sai_so)         # MAE: cung don vi voi gia
print(f"MAE: {round(mae, 2)} trieu")
print(f"Kiem tra: dua vao tb_x={tb_x} -> {round(a * tb_x + b, 2)} (phai bang tb_y={tb_y})")`,
      stdinLines: [],
    },
    predict: {
      code: `y_that = [100, 200, 300]\ny_doan = [110, 190, 330]\nsai = [abs(y_that[i] - y_doan[i]) for i in range(3)]\nprint(sum(sai) / 3)`,
      question: 'MAE của ba dự đoán này bằng bao nhiêu?',
      choices: ['16.666666666666668', '10.0', '50.0', '0.0'],
      answerIndex: 0,
      explain:
        'Sai số tuyệt đối là 10, 10, 30 → tổng 50, chia 3 = 16.67. Chú ý dấu GIÁ TRỊ TUYỆT ĐỐI: nếu quên abs() thì 10 + (−10) + 30 sẽ triệt tiêu nhau và cho con số đẹp giả tạo — một mô hình đoán cao chỗ này, thấp chỗ kia sẽ trông như hoàn hảo.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự một project hồi quy: tách cột → học tham số → dự đoán → đo sai số.',
      lines: [
        'x = [d[0] for d in du_lieu]',
        'y = [d[1] for d in du_lieu]',
        'tb_x, tb_y = sum(x) / len(x), sum(y) / len(y)',
        'a = sum((x[i] - tb_x) * (y[i] - tb_y) for i in range(len(x))) / sum((x[i] - tb_x) ** 2 for i in range(len(x)))',
        'b = tb_y - a * tb_x',
        'mae = sum(abs(y[i] - (a * x[i] + b)) for i in range(len(x))) / len(x)',
      ],
    },
    make: {
      prompt:
        'Làm trọn project dự đoán giá nhà với dữ liệu 6 căn đã nhúng sẵn trong starterCode (diện tích m², giá triệu đồng).\n\nChương trình đọc MỘT dòng input(): diện tích căn cần định giá (số nguyên).\n\nIn đúng 3 dòng:\nMo hinh: gia = <a> * dien_tich + <b>\nMAE tren du lieu huan luyen: <mae>\nDu doan <dien tich> m2: <gia> trieu\n\nMọi con số làm tròn 2 chữ số. a và b học bằng công thức least squares; MAE đo trên chính 6 căn dữ liệu.\n\nGợi ý tự kiểm: diện tích trung bình của 6 căn là 55 — đưa vào 55 phải ra đúng giá trung bình 1655.0.',
      starterCode: `DU_LIEU = [(30, 950), (40, 1180), (50, 1520), (60, 1790), (70, 2110), (80, 2380)]\ndien_tich = int(input("Dien tich can dinh gia (m2): "))\nx = [d[0] for d in DU_LIEU]\ny = [d[1] for d in DU_LIEU]\n# Hoc a, b bang least squares\n# Tinh MAE tren chinh DU_LIEU\n# Du doan cho dien_tich\n`,
      testCases: [
        {
          stdinLines: ['55'],
          expected:
            'Mo hinh: gia = 29.17 * dien_tich + 50.57\nMAE tren du lieu huan luyen: 17.52\nDu doan 55 m2: 1655.0 trieu',
          match: 'contains',
          hidden: false,
          label: 'Diện tích bằng trung bình → dự đoán đúng giá trung bình 1655.0',
        },
        {
          stdinLines: ['100'],
          expected: 'Du doan 100 m2: 2967.71 trieu',
          match: 'contains',
          hidden: false,
          label: 'Ngoại suy ra ngoài khoảng dữ liệu (30–80 m²)',
        },
        {
          stdinLines: ['45'],
          expected: 'Du doan 45 m2: 1363.29 trieu',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: nội suy giữa hai điểm dữ liệu',
        },
      ],
      hints: [
        'Tách hai cột trước: x là diện tích, y là giá. Cả công thức least squares chỉ làm việc trên hai list này.',
        'Công thức đã có ở ml-u1-l2: a = tổng[(x−tb_x)(y−tb_y)] / tổng[(x−tb_x)²], rồi b = tb_y − a × tb_x. Đừng đảo thứ tự — b cần a đã tính xong.',
        'MAE = sum(abs(y[i] - (a * x[i] + b)) for i in range(len(x))) / len(x). Nhớ abs(), thiếu nó thì sai số dương và âm triệt tiêu nhau.',
        'Làm tròn CHỈ khi in: round(a, 2) trong f-string. Nếu làm tròn a rồi mới tính b và MAE thì sai số cộng dồn và ba con số sẽ lệch.',
      ],
      sampleSolution: `DU_LIEU = [(30, 950), (40, 1180), (50, 1520), (60, 1790), (70, 2110), (80, 2380)]\ndien_tich = int(input("Dien tich can dinh gia (m2): "))\n\nx = [d[0] for d in DU_LIEU]\ny = [d[1] for d in DU_LIEU]\ntb_x = sum(x) / len(x)\ntb_y = sum(y) / len(y)\ntu_so = sum((x[i] - tb_x) * (y[i] - tb_y) for i in range(len(x)))\nmau_so = sum((x[i] - tb_x) ** 2 for i in range(len(x)))\na = tu_so / mau_so\nb = tb_y - a * tb_x\nprint(f"Mo hinh: gia = {round(a, 2)} * dien_tich + {round(b, 2)}")\n\nmae = sum(abs(y[i] - (a * x[i] + b)) for i in range(len(x))) / len(x)\nprint(f"MAE tren du lieu huan luyen: {round(mae, 2)}")\n\ngia = a * dien_tich + b\nprint(f"Du doan {dien_tich} m2: {round(gia, 2)} trieu")`,
    },
    homework:
      'Vào một trang rao bán nhà, chép tay 10 căn cùng một khu vực (diện tích và giá). Thay vào DU_LIEU rồi chạy lại. Trả lời ba câu: (1) độ dốc a bằng bao nhiêu, nghĩa là mỗi m² đáng giá bao nhiêu ở khu đó? (2) MAE bao nhiêu — bạn có dám mua bán dựa trên mô hình lệch chừng đó không? (3) Căn nào lệch xa nhất so với đường hồi quy, và vì sao (tầng cao? mặt tiền? ngõ nhỏ?) — chính câu ba chỉ cho bạn feature còn thiếu.',
    srsCards: [
      {
        hoi: 'MAE là gì và ưu điểm lớn nhất của nó?',
        dap: 'MAE = trung bình của |thật − dự đoán|. Ưu điểm: CÙNG ĐƠN VỊ với dữ liệu, nên "MAE 17,5 triệu" tự giải thích được cho người không làm kỹ thuật.',
      },
      {
        hoi: 'MAE khác RMSE ở chỗ nào?',
        dap: 'MAE coi mọi sai số nặng như nhau. RMSE bình phương sai số nên PHẠT NẶNG các ca lệch lớn — chọn RMSE khi một cú lệch to tệ hơn nhiều cú lệch nhỏ.',
      },
      {
        hoi: 'Tính chất nào của hồi quy tuyến tính dùng để tự kiểm code?',
        dap: 'Đường hồi quy luôn đi qua điểm (trung bình x, trung bình y). Đưa vào x bằng trung bình phải ra đúng y trung bình — không đúng là công thức đã sai.',
      },
      {
        hoi: 'Vì sao MAE đo trên dữ liệu huấn luyện là con số lạc quan?',
        dap: 'Vì mô hình đã "thấy" chính các điểm đó khi học. Con số trung thực phải đo trên tập test mà mô hình chưa từng gặp.',
      },
    ],
  },
  {
    id: 'mlds-u2-l2',
    unitId: 'mlds-u2',
    language: 'python',
    title: 'Project 2 — duyệt khoản vay bằng k-NN và câu hỏi công bằng',
    hook: 'Ngân hàng đưa bạn 8 hồ sơ cũ kèm kết quả duyệt/từ chối, rồi hỏi: hồ sơ mới này nên duyệt không? Bạn viết được mô hình trong 30 dòng. Câu khó hơn nằm ngay sau đó: nếu mô hình từ chối một người, bạn có giải thích được VÌ SAO cho họ nghe không?',
    theory:
      'Project 2 ráp ba thứ đã học: k-NN (ml-u1-l3), chuẩn hoá min-max (ml-u2-l2, mlds-u1-l3) và ma trận nhầm lẫn (mlds-u1-l4).\n\nQUY TRÌNH đúng thứ tự, và thứ tự này quan trọng:\n1. Chia dữ liệu thành TRAIN và TEST trước mọi thứ khác.\n2. Học min/max CHỈ TỪ TRAIN, áp lên cả train lẫn test (luật chống rò rỉ ở mlds-u1-l3). Hồ sơ mới có thể chuẩn hoá ra ngoài [0, 1] — đúng, không phải lỗi.\n3. Với mỗi hồ sơ test: tính khoảng cách tới toàn bộ train, lấy k = 3 hàng xóm gần nhất, bỏ phiếu đa số.\n4. Đếm TP/FP/FN/TN trên tập test, báo cáo.\n\nVì sao BẮT BUỘC chuẩn hoá ở bài này: thu nhập chạy 12–30 (triệu), nợ chạy 2–14 (triệu). Nếu để thô, một chênh lệch 10 triệu thu nhập và 10 triệu nợ đóng góp bằng nhau vào khoảng cách dù dải giá trị của chúng khác nhau — thang đo lớn hơn sẽ lấn át. Chuẩn hoá đưa cả hai về [0, 1] để mỗi trục nói tiếng nói ngang nhau.\n\nBỎ PHIẾU với k lẻ (k = 3) thì không bao giờ hoà. Đó là lý do người ta chọn k lẻ cho bài nhị phân.\n\nBA CÂU HỎI NGHIỆP VỤ mà bài này bắt buộc phải đặt, và chúng quan trọng ngang phần code:\n\n1. TẬP TEST QUÁ NHỎ. Bốn hồ sơ test cho accuracy 1.0 — con số đó KHÔNG có nghĩa là mô hình hoàn hảo, nó chỉ có nghĩa là bạn chưa đo được gì cả. Một hồ sơ sai là accuracy tụt xuống 0.75. Luật ngón tay cái: dưới vài trăm ca test thì mọi con số đều là ước lượng rất thô.\n\n2. CHỌN THƯỚC ĐO THEO CÁI GIÁ CỦA LỖI. FP (duyệt nhầm người không trả được) làm ngân hàng mất tiền. FN (từ chối nhầm người tốt) làm một gia đình không mua được nhà — mất mát này không nằm trong sổ sách của ngân hàng, nên rất dễ bị bỏ quên. Ai chịu thiệt hại nào là câu hỏi phải trả lời TRƯỚC khi chọn tối ưu precision hay recall.\n\n3. CÔNG BẰNG (fairness). Mô hình học từ quyết định CŨ của con người. Nếu trước đây người duyệt có thiên kiến, mô hình sẽ học đúng thiên kiến đó rồi đóng dấu "khách quan vì máy tính tính" lên nó. Hai điều tối thiểu phải làm: (a) không đưa các thuộc tính nhạy cảm (giới tính, dân tộc, tôn giáo) vào feature — và nhớ rằng chúng có thể LỌT VÀO GIÁN TIẾP qua feature khác như địa chỉ; (b) đo lại precision/recall RIÊNG cho từng nhóm dân cư, vì mô hình có thể tốt trên tổng thể mà rất tệ với một nhóm. Nhiều nước đã có luật buộc bên cho vay giải thích được lý do từ chối — một mô hình không giải thích được là mô hình không dùng được, dù điểm cao.',
    workedExample: {
      code: `# k-NN k=3 co chuan hoa: tham so min/max HOC TU TRAIN roi ap len ho so moi
TRAIN = [(20, 2, 1), (25, 5, 1), (30, 3, 1), (18, 10, 0),
         (12, 8, 0), (15, 12, 0), (28, 14, 0), (22, 4, 1)]

min_tn = min(h[0] for h in TRAIN)   # tham so tien xu ly: chi tu TRAIN
max_tn = max(h[0] for h in TRAIN)
min_no = min(h[1] for h in TRAIN)
max_no = max(h[1] for h in TRAIN)

def chuan(tn, no):
    return ((tn - min_tn) / (max_tn - min_tn), (no - min_no) / (max_no - min_no))

def du_doan(tn, no):
    diem = chuan(tn, no)
    kc = []
    for t in TRAIN:
        p = chuan(t[0], t[1])
        d = (p[0] - diem[0]) ** 2 + (p[1] - diem[1]) ** 2   # binh phuong khoang cach
        kc.append((d, t[2]))
    kc.sort()                                   # gan nhat len dau
    gan = kc[:3]
    so_duyet = sum(1 for x in gan if x[1] == 1)
    return 1 if so_duyet * 2 > 3 else 0         # bo phieu da so, k le nen khong hoa

print(du_doan(24, 3))   # thu nhap cao, no thap
print(du_doan(14, 11))  # thu nhap thap, no cao`,
      stdinLines: [],
    },
    predict: {
      code: `gan = [(0.01, 0), (0.05, 1), (0.09, 0)]\nso_duyet = sum(1 for x in gan if x[1] == 1)\nprint(so_duyet, 1 if so_duyet * 2 > 3 else 0)`,
      question: 'Ba hàng xóm gần nhất có nhãn 0, 1, 0 — kết quả bỏ phiếu là gì?',
      choices: ['1 0', '1 1', '2 1', '0 0'],
      answerIndex: 0,
      explain:
        'Chỉ 1 trong 3 hàng xóm mang nhãn duyệt, 1 × 2 = 2 không lớn hơn 3 nên kết quả là 0 (từ chối). Chú ý k-NN KHÔNG quan tâm hàng xóm gần tới mức nào — hàng xóm ở khoảng cách 0.01 và 0.09 có phiếu bằng nhau. Muốn phiếu nặng nhẹ theo khoảng cách thì phải dùng biến thể weighted k-NN.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự CHỐNG RÒ RỈ của một pipeline phân loại có chuẩn hoá.',
      lines: [
        'min_tn, max_tn = min(h[0] for h in TRAIN), max(h[0] for h in TRAIN)',
        'diem = chuan(ho_so[0], ho_so[1])',
        'kc = [((chuan(t[0], t[1])[0] - diem[0]) ** 2 + (chuan(t[0], t[1])[1] - diem[1]) ** 2, t[2]) for t in TRAIN]',
        'kc.sort()',
        'gan = kc[:3]',
        'nhan = 1 if sum(1 for x in gan if x[1] == 1) * 2 > 3 else 0',
      ],
    },
    make: {
      prompt:
        'Làm trọn project duyệt khoản vay. TRAIN (8 hồ sơ) và TEST (4 hồ sơ) đã nhúng sẵn trong starterCode, mỗi hồ sơ là (thu nhập triệu, nợ triệu, nhãn) với nhãn 1 = duyệt, 0 = từ chối.\n\nChương trình đọc 2 dòng input(): thu nhập rồi nợ của hồ sơ MỚI (số nguyên).\n\nQuy trình bắt buộc:\n1. Học min/max của cả hai cột CHỈ TỪ TRAIN, chuẩn hoá min-max.\n2. Phân loại bằng k-NN với k = 3, khoảng cách Euclid trên toạ độ đã chuẩn hoá, bỏ phiếu đa số.\n3. Chấm trên tập TEST rồi phân loại hồ sơ mới.\n\nIn đúng 3 dòng:\nTP=<tp> FP=<fp> FN=<fn> TN=<tn>\nAccuracy tren tap test: <x>\nHo so cua ban: duyet  (hoặc "Ho so cua ban: tu choi")\n\nAccuracy làm tròn 2 chữ số.',
      starterCode: `TRAIN = [(20, 2, 1), (25, 5, 1), (30, 3, 1), (18, 10, 0),\n         (12, 8, 0), (15, 12, 0), (28, 14, 0), (22, 4, 1)]\nTEST = [(24, 3, 1), (14, 11, 0), (26, 12, 0), (19, 5, 1)]\nK = 3\n# Hoc min/max tu TRAIN, viet ham chuan(tn, no) va du_doan(tn, no)\n# Cham tren TEST (dem TP/FP/FN/TN), roi doc ho so moi tu input()\n`,
      testCases: [
        {
          stdinLines: ['21', '4'],
          expected: 'TP=2 FP=0 FN=0 TN=2\nAccuracy tren tap test: 1.0',
          match: 'contains',
          hidden: false,
          label: 'Chấm đúng 4 hồ sơ test: 2 duyệt, 2 từ chối',
        },
        {
          stdinLines: ['21', '4'],
          expected: 'Ho so cua ban: duyet',
          match: 'contains',
          hidden: false,
          label: 'Thu nhập khá, nợ thấp → 3 hàng xóm đều là hồ sơ được duyệt',
        },
        {
          stdinLines: ['13', '12'],
          expected: 'Ho so cua ban: tu choi',
          match: 'contains',
          hidden: false,
          label: 'Thu nhập thấp, nợ cao → 3 hàng xóm đều bị từ chối',
        },
        {
          stdinLines: ['30', '2'],
          expected: 'Ho so cua ban: duyet',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: hồ sơ nằm ở rìa dải dữ liệu train',
        },
      ],
      hints: [
        'Viết hàm chuan(tn, no) trả về BỘ ĐÔI đã chuẩn hoá, dùng chung cho cả điểm train lẫn hồ sơ mới — viết hai lần công thức là nguồn của lỗi lệch.',
        'So sánh khoảng cách thì KHÔNG cần math.sqrt: căn bậc hai là hàm tăng nên thứ tự không đổi. Bỏ nó đi cho gọn và nhanh.',
        'kc.append((d, nhan)) rồi kc.sort() — Python sắp xếp bộ đôi theo phần tử đầu, tức theo khoảng cách tăng dần. Lấy 3 phần tử đầu bằng kc[:3].',
        'Bỏ phiếu: so_duyet * 2 > K. Viết vậy để đổi K sang 5 hay 7 vẫn đúng, không phải sửa lại con số 1 hay 2.',
      ],
      sampleSolution: `TRAIN = [(20, 2, 1), (25, 5, 1), (30, 3, 1), (18, 10, 0),\n         (12, 8, 0), (15, 12, 0), (28, 14, 0), (22, 4, 1)]\nTEST = [(24, 3, 1), (14, 11, 0), (26, 12, 0), (19, 5, 1)]\nK = 3\n\nmin_tn = min(h[0] for h in TRAIN)\nmax_tn = max(h[0] for h in TRAIN)\nmin_no = min(h[1] for h in TRAIN)\nmax_no = max(h[1] for h in TRAIN)\n\n\ndef chuan(tn, no):\n    return ((tn - min_tn) / (max_tn - min_tn), (no - min_no) / (max_no - min_no))\n\n\ndef du_doan(tn, no):\n    diem = chuan(tn, no)\n    kc = []\n    for t in TRAIN:\n        p = chuan(t[0], t[1])\n        d = (p[0] - diem[0]) ** 2 + (p[1] - diem[1]) ** 2\n        kc.append((d, t[2]))\n    kc.sort()\n    gan = kc[:K]\n    so_duyet = sum(1 for x in gan if x[1] == 1)\n    return 1 if so_duyet * 2 > K else 0\n\n\ntp = fp = fn = tn = 0\nfor t in TEST:\n    p = du_doan(t[0], t[1])\n    if t[2] == 1 and p == 1:\n        tp += 1\n    elif t[2] == 0 and p == 1:\n        fp += 1\n    elif t[2] == 1 and p == 0:\n        fn += 1\n    else:\n        tn += 1\nprint(f"TP={tp} FP={fp} FN={fn} TN={tn}")\nprint(f"Accuracy tren tap test: {round((tp + tn) / len(TEST), 2)}")\n\nthu_nhap = int(input("Thu nhap (trieu): "))\nno = int(input("No (trieu): "))\nprint("Ho so cua ban: " + ("duyet" if du_doan(thu_nhap, no) == 1 else "tu choi"))`,
    },
    homework:
      'Mô hình của bạn vừa đạt accuracy 1.0 trên tập test. Viết ra ba lý do vì sao bạn KHÔNG được đem con số đó đi báo cáo như một lời hứa. Rồi thêm vào TRAIN một cột giả "quận" (giá trị 1 hoặc 2) sao cho quận 2 toàn hồ sơ bị từ chối, chạy lại và xem mô hình đối xử với hồ sơ quận 2 thế nào. Đó là mô phỏng thu nhỏ của cách thiên kiến lịch sử chui vào mô hình qua một feature trông hoàn toàn vô hại.',
    srsCards: [
      {
        hoi: 'Vì sao phải chuẩn hoá trước khi chạy k-NN?',
        dap: 'Vì k-NN đo khoảng cách. Cột có dải giá trị lớn hơn sẽ lấn át cột nhỏ dù không quan trọng hơn. Min-max đưa mọi cột về [0, 1] để mỗi trục có tiếng nói ngang nhau.',
      },
      {
        hoi: 'Vì sao chọn k LẺ cho bài phân loại nhị phân?',
        dap: 'Để bỏ phiếu đa số không bao giờ hoà — với k = 3 hoặc 5 luôn có một bên thắng, không cần luật phá hoà tuỳ tiện.',
      },
      {
        hoi: 'Mô hình duyệt vay học từ quyết định cũ của con người có rủi ro gì?',
        dap: 'Nó học luôn thiên kiến lịch sử rồi khoác cho thiên kiến đó vẻ khách quan của máy. Phải loại thuộc tính nhạy cảm (kể cả lọt vào gián tiếp qua địa chỉ) và đo precision/recall riêng cho từng nhóm dân cư.',
      },
      {
        hoi: 'Accuracy 1.0 trên tập test 4 mẫu nói lên điều gì?',
        dap: 'Gần như không nói lên gì — tập test quá nhỏ nên con số là ước lượng rất thô (sai một ca là tụt còn 0.75). Cần vài trăm ca test trở lên mới đáng tin.',
      },
    ],
  },
  {
    id: 'mlds-u2-l3',
    unitId: 'mlds-u2',
    language: 'python',
    title: 'Project 3 — phân cụm khách hàng và đặt tên cho từng cụm',
    hook: 'Bạn có 8 khách hàng, không ai dán nhãn "VIP" hay "bình thường" cho bạn cả. K-means chia họ thành hai nhóm trong nửa giây. Nhưng máy chỉ trả về "cụm 0" và "cụm 1" — việc của bạn là nhìn vào tâm cụm rồi ĐẶT TÊN cho chúng, và đó mới là phần tạo ra giá trị.',
    theory:
      'Project 3 dùng lại k-means (ml-u2-l1) và chuẩn hoá (ml-u2-l2), lần này đi trọn vòng lặp chứ không chỉ một bước gán.\n\nVÒNG LẶP K-MEANS, lặp cho tới khi ổn định:\n1. GÁN: mỗi điểm về tâm gần nhất.\n2. CẬP NHẬT: tâm mới = trung bình các điểm trong cụm.\nLặp lại. Thuật toán dừng khi không điểm nào đổi cụm — với dữ liệu tách bạch, thường chỉ 2–3 vòng.\n\nVẤN ĐỀ TẤT ĐỊNH, phải xử lý dứt khoát: k-means thật khởi tạo tâm NGẪU NHIÊN, nên chạy hai lần có thể ra hai kết quả khác nhau (sklearn khắc phục bằng n_init: chạy nhiều lần rồi giữ kết quả tốt nhất). Trong bài này ta chốt cứng: tâm khởi tạo là điểm ĐẦU và điểm CUỐI của danh sách. Nhờ vậy chạy lại bao nhiêu lần cũng ra một kết quả — điều kiện bắt buộc để bài có thể chấm bằng test-case.\n\nDIỄN GIẢI CỤM là bước mà máy không làm hộ được. Quy trình chuẩn:\n1. Nhìn TÂM của từng cụm — cụm nào chi tiêu cao, mua nhiều lần?\n2. Nhìn KÍCH THƯỚC — cụm 3 người và cụm 300 người mang ý nghĩa kinh doanh khác hẳn.\n3. Đặt tên bằng ngôn ngữ nghiệp vụ: "khách VIP mua thường xuyên", "khách thử một lần rồi thôi".\n4. Ứng với mỗi cụm là một hành động khác nhau: cụm VIP thì chăm sóc riêng, cụm ngủ đông thì gửi ưu đãi đánh thức.\nMột báo cáo dừng ở "có 2 cụm" là báo cáo chưa làm xong việc.\n\nCHỌN k BAO NHIÊU: k-means bắt bạn khai trước số cụm. Cách chọn phổ biến là ELBOW — chạy với k = 1, 2, 3... rồi vẽ tổng bình phương khoảng cách trong cụm; chỗ đường gãy khuỷu là k hợp lý. Cách khác là silhouette. Bài này chốt k = 2 vì dữ liệu tách bạch rõ, nhưng phải biết rằng với dữ liệu thật, chọn k là một quyết định chứ không phải hằng số.',
    workedExample: {
      code: `# Mot vong k-means day du: gan roi cap nhat tam
KHACH = [(1, 2), (2, 3), (1, 1), (3, 2), (20, 15), (22, 18), (19, 14), (25, 20)]
tam = [KHACH[0], KHACH[-1]]      # khoi tao TAT DINH: diem dau va diem cuoi

for _ in range(3):               # 3 vong la du on dinh voi du lieu tach bach
    nhom = [[], []]
    for kh in KHACH:             # buoc GAN
        d0 = (kh[0] - tam[0][0]) ** 2 + (kh[1] - tam[0][1]) ** 2
        d1 = (kh[0] - tam[1][0]) ** 2 + (kh[1] - tam[1][1]) ** 2
        nhom[0 if d0 <= d1 else 1].append(kh)
    for c in range(2):           # buoc CAP NHAT
        if nhom[c]:
            tam[c] = (sum(p[0] for p in nhom[c]) / len(nhom[c]),
                      sum(p[1] for p in nhom[c]) / len(nhom[c]))

for c in range(2):
    print(f"Cum {c}: tam ({round(tam[c][0], 2)}, {round(tam[c][1], 2)}), so khach {len(nhom[c])}")`,
      stdinLines: [],
    },
    predict: {
      code: `nhom = [(1, 2), (2, 3), (1, 1), (3, 2)]\ntam_x = sum(p[0] for p in nhom) / len(nhom)\ntam_y = sum(p[1] for p in nhom) / len(nhom)\nprint(tam_x, tam_y)`,
      question: 'Tâm mới của cụm gồm 4 điểm này nằm ở đâu?',
      choices: ['1.75 2.0', '2.0 1.75', '7.0 8.0', '1.0 1.0'],
      answerIndex: 0,
      explain:
        'Tâm là trung bình theo TỪNG TRỤC riêng: x = (1+2+1+3)/4 = 1.75, y = (2+3+1+2)/4 = 2.0. Chú ý tâm cụm thường KHÔNG trùng với bất kỳ điểm dữ liệu nào — nó là một điểm ảo đại diện cho cả nhóm. (Muốn tâm luôn là một điểm thật thì dùng biến thể k-medoids.)',
    },
    parsons: {
      prompt: 'Xếp đúng một vòng lặp k-means: khởi tạo tâm → gán → cập nhật tâm.',
      lines: [
        'tam = [KHACH[0], KHACH[-1]]',
        'for _ in range(3):',
        '    nhom = [[], []]',
        '    for kh in KHACH:',
        '        d0 = (kh[0] - tam[0][0]) ** 2 + (kh[1] - tam[0][1]) ** 2',
        '        d1 = (kh[0] - tam[1][0]) ** 2 + (kh[1] - tam[1][1]) ** 2',
        '        nhom[0 if d0 <= d1 else 1].append(kh)',
        '    for c in range(2):',
        '        tam[c] = (sum(p[0] for p in nhom[c]) / len(nhom[c]), sum(p[1] for p in nhom[c]) / len(nhom[c]))',
      ],
    },
    make: {
      prompt:
        'Làm trọn project phân cụm khách hàng. Dữ liệu 8 khách đã nhúng sẵn: mỗi khách là (chi tiêu triệu, số lần mua).\n\nChạy k-means với k = 2, tâm khởi tạo là KHACH[0] và KHACH[-1], lặp đúng 3 vòng (gán → cập nhật tâm). Điểm cách đều hai tâm thì về cụm 0.\n\nSau đó chương trình đọc 2 dòng input(): chi tiêu và số lần mua của một khách MỚI (số nguyên), rồi gán khách đó vào cụm gần nhất.\n\nIn đúng 4 dòng:\nCum 0: tam (<x>, <y>), so khach <n>\nCum 1: tam (<x>, <y>), so khach <n>\nCum chi tieu cao nhat: cum <c>\nKhach moi thuoc: cum <c>\n\nToạ độ tâm làm tròn 2 chữ số. "Cụm chi tiêu cao nhất" là cụm có toạ độ x (chi tiêu) của tâm lớn hơn.',
      starterCode: `KHACH = [(1, 2), (2, 3), (1, 1), (3, 2), (20, 15), (22, 18), (19, 14), (25, 20)]\ntam = [KHACH[0], KHACH[-1]]\nfor _ in range(3):\n    nhom = [[], []]\n    # buoc GAN: moi khach ve tam gan nhat\n    # buoc CAP NHAT: tam moi = trung binh cac diem trong cum\n# in 2 dong tam, dong cum chi tieu cao nhat, roi doc khach moi tu input()\n`,
      testCases: [
        {
          stdinLines: ['2', '2'],
          expected:
            'Cum 0: tam (1.75, 2.0), so khach 4\nCum 1: tam (21.5, 16.75), so khach 4\nCum chi tieu cao nhat: cum 1',
          match: 'contains',
          hidden: false,
          label: 'Hai tâm cụm hội tụ sau 3 vòng, mỗi cụm 4 khách',
        },
        {
          stdinLines: ['2', '2'],
          expected: 'Khach moi thuoc: cum 0',
          match: 'contains',
          hidden: false,
          label: 'Khách mới chi tiêu thấp → nhóm khách nhỏ',
        },
        {
          stdinLines: ['24', '19'],
          expected: 'Khach moi thuoc: cum 1',
          match: 'contains',
          hidden: false,
          label: 'Khách mới chi tiêu cao → nhóm VIP',
        },
        {
          stdinLines: ['10', '8'],
          expected: 'Khach moi thuoc: cum 0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: khách nằm giữa hai cụm, vẫn gần cụm 0 hơn',
        },
      ],
      hints: [
        'Biến nhom phải được TẠO LẠI ([[], []]) ở đầu MỖI vòng lặp. Quên bước này thì các điểm bị nhồi thêm mỗi vòng và số khách in ra sẽ gấp ba.',
        'Gán một dòng: nhom[0 if d0 <= d1 else 1].append(kh) — dùng <= để ca cách đều về cụm 0 đúng như đề yêu cầu.',
        'Cập nhật tâm: trung bình theo từng trục riêng. Kiểm if nhom[c] trước khi chia, phòng ca cụm rỗng (chia cho 0).',
        'Sau vòng lặp, biến nhom vẫn giữ kết quả lần gán cuối — dùng len(nhom[c]) để in số khách, không cần đếm lại.',
      ],
      sampleSolution: `KHACH = [(1, 2), (2, 3), (1, 1), (3, 2), (20, 15), (22, 18), (19, 14), (25, 20)]\ntam = [KHACH[0], KHACH[-1]]\n\nfor _ in range(3):\n    nhom = [[], []]\n    for kh in KHACH:\n        d0 = (kh[0] - tam[0][0]) ** 2 + (kh[1] - tam[0][1]) ** 2\n        d1 = (kh[0] - tam[1][0]) ** 2 + (kh[1] - tam[1][1]) ** 2\n        nhom[0 if d0 <= d1 else 1].append(kh)\n    for c in range(2):\n        if nhom[c]:\n            tam[c] = (sum(p[0] for p in nhom[c]) / len(nhom[c]),\n                      sum(p[1] for p in nhom[c]) / len(nhom[c]))\n\nfor c in range(2):\n    print(f"Cum {c}: tam ({round(tam[c][0], 2)}, {round(tam[c][1], 2)}), so khach {len(nhom[c])}")\ncao = 0 if tam[0][0] > tam[1][0] else 1\nprint(f"Cum chi tieu cao nhat: cum {cao}")\n\nchi_tieu = int(input("Chi tieu (trieu): "))\nso_lan = int(input("So lan mua: "))\nd0 = (chi_tieu - tam[0][0]) ** 2 + (so_lan - tam[0][1]) ** 2\nd1 = (chi_tieu - tam[1][0]) ** 2 + (so_lan - tam[1][1]) ** 2\nprint(f"Khach moi thuoc: cum {0 if d0 <= d1 else 1}")`,
    },
    homework:
      'Đặt tên nghiệp vụ cho hai cụm vừa tìm được, và với mỗi cụm viết MỘT hành động cụ thể bạn sẽ đề xuất với chủ cửa hàng (không phải "chăm sóc tốt hơn" — phải cụ thể tới mức làm được ngay tuần sau). Rồi thêm vào KHACH ba khách nằm lưng chừng, ví dụ (10, 8), (12, 9), (11, 7), chạy lại và xem hai tâm dịch đi bao nhiêu. Nhóm lưng chừng bị ép về một trong hai cụm — đó là lúc bạn nên cân nhắc k = 3.',
    srsCards: [
      {
        hoi: 'Hai bước lặp lại của k-means là gì?',
        dap: 'GÁN mỗi điểm về tâm gần nhất, rồi CẬP NHẬT tâm = trung bình các điểm trong cụm. Lặp cho tới khi không điểm nào đổi cụm.',
      },
      {
        hoi: 'Vì sao k-means thật có thể ra kết quả khác nhau giữa hai lần chạy?',
        dap: 'Vì tâm được khởi tạo ngẫu nhiên. sklearn khắc phục bằng n_init (chạy nhiều lần, giữ kết quả tốt nhất); bài học chốt cứng tâm khởi tạo để kết quả tất định, chấm được bằng test.',
      },
      {
        hoi: 'Sau khi có kết quả gom cụm thì việc còn lại của người phân tích là gì?',
        dap: 'Diễn giải: nhìn tâm và kích thước từng cụm, đặt tên bằng ngôn ngữ nghiệp vụ, và gắn cho mỗi cụm MỘT hành động cụ thể. Báo cáo dừng ở "có 2 cụm" là chưa làm xong việc.',
      },
      {
        hoi: 'Chọn số cụm k bằng cách nào?',
        dap: 'Elbow (vẽ tổng bình phương khoảng cách trong cụm theo k, lấy chỗ đường gãy khuỷu) hoặc silhouette. k là một quyết định, không phải hằng số cho sẵn.',
      },
    ],
  },
  {
    id: 'mlds-u2-l4',
    unitId: 'mlds-u2',
    language: 'python',
    title: 'Project 4 — lọc thư rác bằng Naive Bayes trên bag-of-words',
    hook: 'Bài đầu tiên của khoá "Học máy" mở đầu bằng chính ví dụ này: viết 1.000 luật lọc thư rác là vô vọng. Bây giờ bạn đủ sức làm cách đúng — đưa máy 6 lá thư đã dán nhãn, để nó tự đếm xem chữ nào hay xuất hiện ở đâu, rồi tự quyết định.',
    theory:
      'Project 4 mở cánh cửa NLP (xử lý ngôn ngữ tự nhiên) và dùng lại Naive Bayes (ml-u4-l5), lần này trên văn bản thật.\n\nBAG-OF-WORDS (túi từ): biểu diễn một văn bản bằng tập các từ xuất hiện trong nó, VỨT BỎ thứ tự. "meo duoi chuot" và "chuot duoi meo" thành y hệt nhau. Nghe như mất mát nghiêm trọng — và đúng là mất — nhưng để lọc thư rác thì bấy nhiêu đã đủ tốt, vì tín hiệu nằm ở TỪ NÀO chứ không ở trật tự. (Muốn giữ trật tự thì cần n-gram, và xa hơn nữa là Transformer — bản đồ ở ml-u4-l3.)\n\nNAIVE BAYES cho văn bản. Với mỗi lớp c (spam / ham), tính điểm:\n  P(c) × tích các P(từ | c)\nChữ "naive" (ngây thơ) nằm ở chỗ ta giả định các từ ĐỘC LẬP với nhau — điều rõ ràng sai trong ngôn ngữ ("trúng" và "thưởng" luôn đi đôi). Giả định sai mà mô hình vẫn chạy tốt: đó là một trong những nghịch lý nổi tiếng và hữu ích nhất của ngành.\n\nHAI KỸ THUẬT BẮT BUỘC, thiếu là mô hình vỡ:\n\n1. LÀM TRƠN LAPLACE (add-one smoothing). Một từ chưa từng xuất hiện trong lớp spam sẽ có P = 0, mà 0 nhân với bất cứ gì cũng bằng 0 — MỘT từ lạ đủ giết cả tích số. Cách sửa: cộng 1 vào mọi bộ đếm.\n     P(từ | c) = (số lần từ xuất hiện trong c + 1) / (tổng số từ của c + |V|)\n   với |V| là kích thước TỪ ĐIỂN (số từ khác nhau trên toàn bộ dữ liệu huấn luyện). Cộng |V| vào mẫu số để tổng xác suất vẫn bằng 1.\n\n2. CỘNG LOG THAY VÌ NHÂN. Nhân 50 xác suất nhỏ với nhau cho ra số bé tới mức máy tính làm tròn thành 0 (underflow). Vì log là hàm TĂNG, so sánh log(A) với log(B) cho cùng kết luận như so sánh A với B, mà log biến tích thành tổng:\n     log P(c) + Σ log P(từ | c)\n   Đây là mẹo tiêu chuẩn, mọi thư viện thật đều làm thế.\n\nTIỀN XỬ LÝ VĂN BẢN thật còn nhiều bước ta bỏ qua ở đây cho gọn nhưng phải biết tên: hạ chữ thường, bỏ dấu câu, bỏ stopword (từ dừng như "và", "là"), tách từ tiếng Việt (khó hơn tiếng Anh nhiều vì từ ghép không có dấu cách phân định), và TF-IDF — cân lại trọng số để từ hiếm mà đặc trưng được coi trọng hơn từ đâu cũng có.\n\nTrong sklearn: CountVectorizer + MultinomialNB, hai dòng. Bạn đếm tay hôm nay để biết hai dòng đó đếm gì.',
    workedExample: {
      code: `import math

HUAN_LUYEN = [("trung thuong ngay hom nay", "spam"),
              ("nhan qua mien phi ngay", "spam"),
              ("hop luc ba gio chieu", "ham")]

dem = {"spam": {}, "ham": {}}     # lop -> tu -> so lan
tong = {"spam": 0, "ham": 0}      # tong so tu cua moi lop
so_thu = {"spam": 0, "ham": 0}    # so la thu cua moi lop
tu_dien = set()                   # tap tu khac nhau tren toan bo du lieu

for noi_dung, nhan in HUAN_LUYEN:
    so_thu[nhan] += 1
    for tu in noi_dung.split():
        dem[nhan][tu] = dem[nhan].get(tu, 0) + 1
        tong[nhan] += 1
        tu_dien.add(tu)

v = len(tu_dien)
thu = "trung thuong ngay".split()
for nhan in ("spam", "ham"):
    d = math.log(so_thu[nhan] / len(HUAN_LUYEN))          # log cua xac suat tien nghiem
    for tu in thu:
        d += math.log((dem[nhan].get(tu, 0) + 1) / (tong[nhan] + v))   # Laplace + log
    print(nhan, round(d, 2))`,
      stdinLines: [],
    },
    predict: {
      code: `dem_spam = {"trung": 2}\ntong_spam = 14\nv = 22\nprint((dem_spam.get("xin", 0) + 1) / (tong_spam + v))`,
      question:
        'Từ "xin" chưa từng xuất hiện trong thư rác. Xác suất sau khi làm trơn Laplace là bao nhiêu?',
      choices: ['0.027777777777777776', 'Khong tinh duoc', '1.0', 'Lỗi KeyError'],
      answerIndex: 0,
      explain:
        '(0 + 1) / (14 + 22) = 1/36 ≈ 0.0278. Không có Laplace thì con số này là 0, và vì ta NHÂN các xác suất, một số 0 duy nhất sẽ kéo cả tích về 0 — chỉ cần lá thư chứa một từ lạ là mô hình mất khả năng phán đoán. Cộng 1 vào tử và |V| vào mẫu giữ cho mọi từ có một phần xác suất nhỏ nhưng khác 0.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự huấn luyện Naive Bayes trên văn bản.',
      lines: [
        'for noi_dung, nhan in HUAN_LUYEN:',
        '    so_thu[nhan] += 1',
        '    for tu in noi_dung.split():',
        '        dem[nhan][tu] = dem[nhan].get(tu, 0) + 1',
        '        tong[nhan] += 1',
        '        tu_dien.add(tu)',
        'v = len(tu_dien)',
      ],
    },
    make: {
      prompt:
        'Làm trọn project lọc thư rác. Tập huấn luyện 6 lá thư đã nhúng sẵn (3 spam, 3 thư thường), mỗi lá là một chuỗi từ cách nhau bởi dấu cách.\n\nChương trình đọc MỘT dòng input(): nội dung lá thư cần kiểm tra.\n\nHuấn luyện Naive Bayes bag-of-words với làm trơn Laplace (cộng 1 vào tử, cộng |V| vào mẫu, |V| = số từ khác nhau trên toàn bộ tập huấn luyện) và cộng LOG thay vì nhân. Điểm của một lớp = log P(lớp) + tổng log P(từ | lớp) trên mọi từ của lá thư.\n\nIn đúng 2 dòng:\nSo tu trong thu: <số từ>\nKet luan: SPAM  (nếu điểm spam LỚN HƠN điểm ham, ngược lại in "Ket luan: KHONG PHAI SPAM")',
      starterCode: `import math\n\nHUAN_LUYEN = [\n    ("trung thuong ngay hom nay", "spam"),\n    ("nhan qua mien phi ngay", "spam"),\n    ("trung thuong tien mat", "spam"),\n    ("hop luc ba gio chieu", "ham"),\n    ("gui bao cao hom nay", "ham"),\n    ("hen gap chieu mai", "ham"),\n]\n# Dem: dem[lop][tu], tong[lop], so_thu[lop], tu_dien\n# Doc thu tu input().split(), tinh diem log cho tung lop roi so sanh\n`,
      testCases: [
        {
          stdinLines: ['trung thuong tien mat'],
          expected: 'So tu trong thu: 4\nKet luan: SPAM',
          match: 'contains',
          hidden: false,
          label: 'Toàn từ đặc trưng của thư rác',
        },
        {
          stdinLines: ['gui bao cao chieu mai'],
          expected: 'So tu trong thu: 5\nKet luan: KHONG PHAI SPAM',
          match: 'contains',
          hidden: false,
          label: 'Toàn từ công việc → thư thường',
        },
        {
          stdinLines: ['nhan qua mien phi'],
          expected: 'Ket luan: SPAM',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: cụm từ quảng cáo chưa từng xuất hiện nguyên vẹn ở lớp ham',
        },
      ],
      hints: [
        'Ba bộ đếm phải xây trong MỘT vòng duyệt tập huấn luyện: dem[nhan][tu], tong[nhan] (tổng số từ), so_thu[nhan] (số lá thư). Thêm mọi từ vào tu_dien (một set) để lấy |V|.',
        '|V| là số từ khác nhau trên TOÀN BỘ dữ liệu (cả spam lẫn ham), không phải riêng từng lớp — dùng cùng một |V| cho cả hai mẫu số.',
        'Công thức Laplace: (dem[nhan].get(tu, 0) + 1) / (tong[nhan] + v). Dùng .get(tu, 0) để từ lạ không gây KeyError.',
        'Cộng log: d = math.log(so_thu[nhan] / 6) rồi d += math.log(...) cho từng từ. Điểm sẽ là số ÂM — bình thường, vì log của số nhỏ hơn 1 luôn âm; ta chỉ so sánh hai số âm với nhau.',
      ],
      sampleSolution: `import math\n\nHUAN_LUYEN = [\n    ("trung thuong ngay hom nay", "spam"),\n    ("nhan qua mien phi ngay", "spam"),\n    ("trung thuong tien mat", "spam"),\n    ("hop luc ba gio chieu", "ham"),\n    ("gui bao cao hom nay", "ham"),\n    ("hen gap chieu mai", "ham"),\n]\n\ndem = {"spam": {}, "ham": {}}\ntong = {"spam": 0, "ham": 0}\nso_thu = {"spam": 0, "ham": 0}\ntu_dien = set()\nfor noi_dung, nhan in HUAN_LUYEN:\n    so_thu[nhan] += 1\n    for tu in noi_dung.split():\n        dem[nhan][tu] = dem[nhan].get(tu, 0) + 1\n        tong[nhan] += 1\n        tu_dien.add(tu)\nv = len(tu_dien)\n\nthu = input("Noi dung thu: ").split()\nprint(f"So tu trong thu: {len(thu)}")\n\ndiem = {}\nfor nhan in ("spam", "ham"):\n    d = math.log(so_thu[nhan] / len(HUAN_LUYEN))\n    for tu in thu:\n        d += math.log((dem[nhan].get(tu, 0) + 1) / (tong[nhan] + v))\n    diem[nhan] = d\nprint("Ket luan: " + ("SPAM" if diem["spam"] > diem["ham"] else "KHONG PHAI SPAM"))`,
    },
    homework:
      'Thu 20 tin nhắn thật trong máy bạn, tự dán nhãn rác/không rác, bỏ dấu tiếng Việt rồi thay vào HUAN_LUYEN. Sau đó thử ĐÁNH LỪA chính mô hình của mình: viết một tin nhắn rác mà nó phân loại nhầm thành thư thường (mẹo: pha thật nhiều từ công việc vào giữa). Bạn vừa tự tay làm một cuộc tấn công đối kháng (adversarial attack) — đúng thứ mà kẻ gửi rác làm hằng ngày với bộ lọc của Google.',
    srsCards: [
      {
        hoi: 'Bag-of-words biểu diễn văn bản thế nào và mất gì?',
        dap: 'Biểu diễn bằng tập các từ xuất hiện, VỨT BỎ thứ tự — "meo duoi chuot" và "chuot duoi meo" thành như nhau. Đủ tốt để lọc thư rác vì tín hiệu nằm ở từ nào, không ở trật tự.',
      },
      {
        hoi: 'Vì sao Naive Bayes bắt buộc phải làm trơn Laplace?',
        dap: 'Vì một từ chưa từng gặp trong lớp cho P = 0, mà 0 nhân với bất cứ gì cũng bằng 0 — một từ lạ giết cả tích số. Sửa bằng (đếm + 1) / (tổng + |V|).',
      },
      {
        hoi: 'Vì sao cộng LOG thay vì nhân xác suất?',
        dap: 'Nhân nhiều xác suất nhỏ gây underflow (máy làm tròn thành 0). Log là hàm tăng nên giữ nguyên thứ tự so sánh, và biến tích thành tổng.',
      },
      {
        hoi: 'Chữ "naive" trong Naive Bayes nghĩa là gì?',
        dap: 'Giả định các từ ĐỘC LẬP với nhau — rõ ràng sai trong ngôn ngữ ("trúng" và "thưởng" luôn đi đôi), nhưng mô hình vẫn chạy tốt trong thực tế.',
      },
    ],
  },
]
