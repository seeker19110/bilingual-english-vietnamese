// lessons/mlu3.ts — Chương C3 "Ensemble, RL & các kiểu học lai" của khoá "Học máy — từ hồi quy
// đến AI tạo sinh" (docs/specs/2026-08-31-khoa-hoc-may.md).
//
// unitId 'ml-u3' KHÔNG nằm trong curriculum.ts — là "unit ảo" của tầng khoá ngắn, được
// lessons.test.ts công nhận qua SHORT_COURSES (courses/registry.ts), đúng cơ chế 'git-u*'.
//
// Luật soạn riêng của khoá: mọi thuật toán LÕI đều tự cài bằng Python THUẦN (không numpy/
// sklearn) để Pyodide trình duyệt và python3 CI chấm y hệt nhau; nhánh chuyên sâu (XGBoost,
// DQN, contrastive learning…) dạy ở mức nhận-đường trong theory, không bịa code.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const ML_U3_LESSONS: ProgrammingLesson[] = [
  {
    id: 'ml-u3-l1',
    unitId: 'ml-u3',
    language: 'python',
    title: 'Bagging & random forest — nhiều cây yếu, bỏ phiếu ra cây mạnh',
    hook: 'Hỏi 1 người "quán này ngon không" có thể trúng ý kiến lệch lạc của riêng họ. Hỏi 100 người rồi lấy số đông thì đáng tin hơn hẳn. Random forest làm đúng vậy với các "cây quyết định": để nhiều cây ĐỘC LẬP tự đoán, rồi BỎ PHIẾU ĐA SỐ — nhiều mô hình yếu gộp thành một mô hình mạnh.',
    theory:
      'BAGGING (Bootstrap AGGregatING) = huấn luyện nhiều mô hình con ĐỘC LẬP, mỗi con học trên một mẫu dữ liệu lấy ngẫu nhiên (có hoàn lại) từ tập gốc, rồi GỘP dự đoán: bỏ phiếu đa số cho phân loại, trung bình cho hồi quy.\n\nRANDOM FOREST là bagging áp cho CÂY QUYẾT ĐỊNH, cộng thêm một lớp ngẫu nhiên nữa: mỗi cây, tại mỗi lần chia nhánh, chỉ được chọn từ một TẬP CON ngẫu nhiên các đặc trưng (không phải toàn bộ). Hai lớp ngẫu nhiên — mẫu dữ liệu khác nhau VÀ đặc trưng khác nhau — khiến các cây "ít giống nhau" hơn. Đó là điều kiện sống còn: nếu mọi cây học y hệt nhau thì bỏ phiếu chẳng khác gì hỏi một người 100 lần.\n\nVì sao bỏ phiếu đa số giúp ích: nếu các cây sai theo NHỮNG HƯỚNG KHÁC NHAU (độc lập), sai số ngẫu nhiên của từng cây có xu hướng triệt tiêu lẫn nhau khi gộp lại — phương sai (variance) giảm, dù mỗi cây riêng lẻ vẫn là mô hình yếu, dễ overfitting một mình (nhắc lại chương 1).\n\nHôm nay ta không tự cài cây quyết định (khoá chuyên sâu dạy riêng) — giả định N cây đã đưa ra dự đoán, và ta tự cài đúng bước GỘP: đếm phiếu, chọn nhãn thắng.',
    workedExample: {
      code: `# Bagging: nhieu "cay" du doan doc lap, gop lai bang bo phieu da so
du_doan_cac_cay = ["spam", "spam", "khong_spam", "spam", "khong_spam"]

dem = {}
for nhan in du_doan_cac_cay:
    dem[nhan] = dem.get(nhan, 0) + 1               # dem so phieu tung nhan
    print(f"Cay vua vote: {nhan}, tong {nhan}: {dem[nhan]}")

nhan_thang = max(dem, key=dem.get)                  # nhan co nhieu phieu nhat
print(f"Bo phieu da so: {nhan_thang}")`,
      stdinLines: [],
    },
    predict: {
      code: `phieu = ["a", "b", "a", "a", "b"]\ndem = {}\nfor p in phieu:\n    dem[p] = dem.get(p, 0) + 1\nprint(max(dem, key=dem.get))`,
      question: 'Bỏ phiếu đa số từ 5 lá phiếu này in ra nhãn nào?',
      choices: ['a', 'b', 'Hoà, không xác định được', 'Báo lỗi'],
      answerIndex: 0,
      explain:
        '"a" xuất hiện 3/5 lần, "b" chỉ 2/5 — dem = {"a": 3, "b": 2}, max(dem, key=dem.get) trả về khoá có giá trị lớn nhất là "a". Đây chính là toàn bộ "phép gộp" của bagging: đếm phiếu, lấy đa số.',
    },
    parsons: {
      prompt:
        'Xếp đúng cách gộp phiếu bằng bỏ phiếu đa số: đếm từng phiếu vào dict → lấy nhãn có số phiếu cao nhất.',
      lines: [
        'dem = {}',
        'for nhan in du_doan_cac_cay:',
        '    dem[nhan] = dem.get(nhan, 0) + 1',
        'nhan_thang = max(dem, key=dem.get)',
      ],
    },
    make: {
      prompt:
        'Tự cài bước GỘP của bagging: bỏ phiếu đa số từ dự đoán của N cây quyết định.\n\nChương trình đọc 1 dòng input(): dự đoán của từng cây, cách nhau bởi dấu phẩy, vd "meo,cho,meo,cho,meo".\n\nĐếm phiếu cho từng nhãn rồi in đúng 1 dòng:\nKet qua bo phieu: <nhãn thắng đa số>\n\nNếu hoà phiếu, lấy nhãn xuất hiện TRƯỚC trong danh sách làm kết quả (đúng cách max() xử lý khi có nhiều giá trị bằng nhau).',
      starterCode: `du_doan = input("Du doan cac cay: ").split(",")\n# Dem phieu tung nhan bang dict, roi tim nhan co nhieu phieu nhat\n`,
      testCases: [
        {
          stdinLines: ['spam,spam,khong_spam,spam,khong_spam'],
          expected: 'Ket qua bo phieu: spam',
          match: 'contains',
          hidden: false,
          label: '3 phiếu spam, 2 phiếu khong_spam → spam thắng',
        },
        {
          stdinLines: ['meo,cho,meo,cho,meo'],
          expected: 'Ket qua bo phieu: meo',
          match: 'contains',
          hidden: false,
          label: '3 phiếu meo, 2 phiếu cho → meo thắng',
        },
        {
          stdinLines: ['meo,cho'],
          expected: 'Ket qua bo phieu: meo',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: hoà phiếu (1-1) — nhãn xuất hiện TRƯỚC ("meo") thắng theo cách max() xử lý hoà',
        },
      ],
      hints: [
        'Tách chuỗi bằng .split(",") để có list dự đoán từng cây.',
        'Đếm phiếu y hệt ví dụ mẫu: dem = {}, rồi dem[nhan] = dem.get(nhan, 0) + 1 trong vòng lặp.',
        'Nhãn thắng: max(dem, key=dem.get) — in bằng print(f"Ket qua bo phieu: {nhan_thang}").',
      ],
      sampleSolution: `du_doan = input("Du doan cac cay: ").split(",")\ndem = {}\nfor nhan in du_doan:\n    dem[nhan] = dem.get(nhan, 0) + 1\nnhan_thang = max(dem, key=dem.get)\nprint(f"Ket qua bo phieu: {nhan_thang}")`,
    },
    homework:
      'Random forest thêm ngẫu nhiên hai lớp: mẫu dữ liệu khác nhau (bootstrap) và đặc trưng khác nhau tại mỗi lần chia nhánh. Nếu bỏ hẳn hai lớp ngẫu nhiên này — tức mọi cây học trên CÙNG một dữ liệu, CÙNG mọi đặc trưng — thì các cây sẽ giống hệt nhau. Bỏ phiếu đa số của N cây giống hệt nhau có còn tác dụng gì không? Viết 3-4 câu giải thích vì sao "đa dạng giữa các mô hình con" mới là thứ làm bagging hoạt động, không phải chỉ số lượng mô hình.',
    srsCards: [
      {
        hoi: 'Bagging kết hợp nhiều mô hình yếu thành mô hình mạnh bằng cách nào?',
        dap: 'Huấn luyện nhiều mô hình con ĐỘC LẬP song song, mỗi con trên một mẫu bootstrap khác nhau của dữ liệu, rồi gộp dự đoán bằng bỏ phiếu đa số (phân loại) hoặc trung bình (hồi quy) — các mô hình yếu nhưng đa dạng gộp lại giảm phương sai, ổn định hơn từng mô hình riêng lẻ.',
      },
      {
        hoi: 'Random forest khác "nhiều cây quyết định huấn luyện y hệt nhau" ở điểm nào?',
        dap: 'Mỗi cây học trên một mẫu bootstrap ngẫu nhiên của dữ liệu VÀ tại mỗi lần chia nhánh chỉ được chọn từ một tập con ngẫu nhiên các đặc trưng — hai lớp ngẫu nhiên này làm các cây ít giống nhau hơn, nên bỏ phiếu đa số của chúng mới có tác dụng.',
      },
      {
        hoi: 'Vì sao bỏ phiếu đa số làm giảm sai số so với một mô hình đơn lẻ?',
        dap: 'Nếu các mô hình con sai theo những HƯỚNG KHÁC NHAU (độc lập, đa dạng), sai số ngẫu nhiên của từng mô hình có xu hướng triệt tiêu lẫn nhau khi gộp — phương sai (variance) giảm dù mỗi mô hình riêng lẻ vẫn yếu và dễ overfit một mình.',
      },
    ],
  },
  {
    id: 'ml-u3-l2',
    unitId: 'ml-u3',
    language: 'python',
    title: 'Boosting — sửa lỗi vòng trước bằng cách tăng trọng số ca sai',
    hook: 'Ôn thi kiểu hiệu quả: làm đề, khoanh riêng câu SAI, vòng sau dồn thời gian vào đúng những câu đó thay vì ôn đều tất cả. Boosting huấn luyện y hệt cách này: sau mỗi vòng, TĂNG TRỌNG SỐ các ca dự đoán sai để mô hình vòng sau buộc phải chú ý hơn tới chúng.',
    theory:
      'BOOSTING khác bagging (bài trước) ở chỗ các mô hình con được huấn luyện TUẦN TỰ, không độc lập: mô hình sau được huấn luyện để SỬA LỖI của mô hình trước, bằng cách tăng "tầm quan trọng" (trọng số) của những ca bị đoán sai.\n\nMột vòng boosting đơn giản hoá gồm: mỗi điểm dữ liệu có một TRỌNG SỐ (ban đầu chia đều). Sau khi mô hình yếu vòng này đưa ra dự đoán đúng/sai cho từng điểm: điểm ĐOÁN ĐÚNG giữ nguyên trọng số, điểm ĐOÁN SAI bị NHÂN LÊN một hệ số (>1). Rồi CHUẨN HOÁ lại toàn bộ trọng số sao cho tổng bằng 1 — vì trọng số phải luôn là một phân bố hợp lệ để vòng sau biết "chú ý bao nhiêu phần trăm" vào mỗi điểm.\n\nBoosting thật (AdaBoost, gradient boosting) còn tính thêm "độ tin cậy" của từng mô hình yếu để gộp dự đoán cuối cùng có trọng số — phần đó học sâu hơn ở khoá chuyên sâu. Ở đây ta tự cài đúng lõi: cập nhật và chuẩn hoá trọng số một vòng.\n\nBoosting công nghiệp hoá thành các thư viện quen thuộc: XGBoost, LightGBM, CatBoost — tối ưu tốc độ và độ chính xác của đúng ý tưởng này cho dữ liệu lớn, thường thắng các cuộc thi Kaggle trên dữ liệu dạng bảng.',
    workedExample: {
      code: `# Boosting: tang trong so cac ca DOAN SAI de vong sau chu y hon
diem = ["A", "B", "C", "D"]
dung_sai = [True, False, True, False]   # du doan yeu vong 1: dung/sai
trong_so = [0.25, 0.25, 0.25, 0.25]     # trong so ban dau bang nhau
he_so_tang = 2.0                        # sai thi nhan trong so len 2 lan

trong_so_moi = []
for i in range(len(diem)):
    if dung_sai[i]:
        trong_so_moi.append(trong_so[i])               # dung: giu nguyen
    else:
        trong_so_moi.append(trong_so[i] * he_so_tang)   # sai: tang len
    print(f"{diem[i]}: dung_sai={dung_sai[i]}, trong so moi (chua chuan hoa)={trong_so_moi[i]}")

tong = sum(trong_so_moi)
trong_so_chuan_hoa = [w / tong for w in trong_so_moi]
for i in range(len(diem)):
    print(f"{diem[i]}: trong so vong sau = {round(trong_so_chuan_hoa[i], 4)}")`,
      stdinLines: [],
    },
    predict: {
      code: `trong_so = [0.5, 0.5]\ndung_sai = [True, False]\nhe_so = 2.0\nmoi = [trong_so[i] if dung_sai[i] else trong_so[i] * he_so for i in range(2)]\ntong = sum(moi)\nprint(round(moi[1] / tong, 4))`,
      question: 'Điểm thứ 2 (dự đoán SAI) có trọng số vòng sau là bao nhiêu sau chuẩn hoá?',
      choices: ['0.6667', '0.5', '0.3333', '1.0'],
      answerIndex: 0,
      explain:
        'Trọng số chưa chuẩn hoá là [0.5, 1.0] (điểm sai bị nhân hệ số 2), tổng = 1.5. Điểm 2 chiếm 1.0/1.5 ≈ 0.6667 — trọng số của nó bị TĂNG so với ban đầu (0.5) chính vì nó bị đoán SAI vòng trước.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự cập nhật trọng số boosting: tăng trọng số ca sai/giữ nguyên ca đúng → tính tổng → chuẩn hoá.',
      lines: [
        'trong_so_moi = []',
        'for i in range(len(diem)):',
        '    if dung_sai[i]:',
        '        trong_so_moi.append(trong_so[i])',
        '    else:',
        '        trong_so_moi.append(trong_so[i] * he_so_tang)',
        'tong = sum(trong_so_moi)',
        'trong_so_chuan_hoa = [w / tong for w in trong_so_moi]',
      ],
    },
    make: {
      prompt:
        'Tự cài một vòng cập nhật trọng số boosting.\n\nChương trình đọc 2 dòng input():\n- Dòng 1: kết quả dự đoán mỗi ca, cách nhau dấu phẩy, mỗi giá trị là "dung" hoặc "sai" (vd "dung,sai").\n- Dòng 2: hệ số tăng cho ca sai (số thực).\n\nTrọng số ban đầu CHIA ĐỀU: 1/n cho mỗi ca (n = số ca). Ca "sai" bị nhân hệ số, ca "dung" giữ nguyên; rồi CHUẨN HOÁ tổng về 1.\n\nIn mỗi ca một dòng theo thứ tự, dạng:\nVi tri <chỉ số bắt đầu từ 0>: <trọng số sau chuẩn hoá, làm tròn 4 chữ số>',
      starterCode: `dung_sai = input("Dung/sai tung ca (cach nhau dau phay): ").split(",")\nhe_so = float(input("He so tang: "))\n# Trong so ban dau = 1/n moi ca; sai thi nhan he_so, dung thi giu nguyen\n# Chuan hoa tong ve 1 roi in tung dong "Vi tri <i>: <trong so lam tron 4>"\n`,
      testCases: [
        {
          stdinLines: ['dung,sai', '2.0'],
          expected: 'Vi tri 0: 0.3333\nVi tri 1: 0.6667',
          match: 'contains',
          hidden: false,
          label: '2 ca, ca 2 sai → trọng số 0.3333 / 0.6667 sau chuẩn hoá',
        },
        {
          stdinLines: ['dung,dung,dung', '3.0'],
          expected: 'Vi tri 0: 0.3333',
          match: 'contains',
          hidden: false,
          label: 'Không ca nào sai → mọi trọng số vẫn chia đều 1/3',
        },
        {
          stdinLines: ['sai,sai', '2.0'],
          expected: 'Vi tri 0: 0.5\nVi tri 1: 0.5',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: mọi ca đều sai và cùng hệ số → chuẩn hoá lại kéo về đúng như ban đầu (0.5/0.5)',
        },
      ],
      hints: [
        'Trọng số ban đầu: n = len(dung_sai), trong_so_ban_dau = [1 / n] * n.',
        'Nếu dung_sai[i] == "sai": nhân với he_so; nếu "dung": giữ nguyên — làm y hệt ví dụ mẫu.',
        'Chuẩn hoá: chia từng trọng số mới cho TỔNG của chúng, rồi in bằng round(gia_tri, 4).',
      ],
      sampleSolution: `dung_sai = input("Dung/sai tung ca (cach nhau dau phay): ").split(",")\nhe_so = float(input("He so tang: "))\nn = len(dung_sai)\ntrong_so_ban_dau = [1 / n] * n\ntrong_so_moi = []\nfor i in range(n):\n    if dung_sai[i] == "dung":\n        trong_so_moi.append(trong_so_ban_dau[i])\n    else:\n        trong_so_moi.append(trong_so_ban_dau[i] * he_so)\ntong = sum(trong_so_moi)\nfor i in range(n):\n    trong_so_chuan_hoa = trong_so_moi[i] / tong\n    print(f"Vi tri {i}: {round(trong_so_chuan_hoa, 4)}")`,
    },
    homework:
      'Boosting công nghiệp hoá thành XGBoost, LightGBM, CatBoost — tìm 1 bài viết hoặc tài liệu ngắn (tiếng Việt hoặc Anh) so sánh boosting với random forest (bài trước) trên cùng một bộ dữ liệu bảng (tabular). Trả lời: cái nào thường CHÍNH XÁC hơn, cái nào DỄ HUẤN LUYỆN/khó bị overfit hơn khi thiếu kinh nghiệm chỉnh tham số? Viết 3-4 câu.',
    srsCards: [
      {
        hoi: 'Ý tưởng cốt lõi của boosting sau mỗi vòng là gì?',
        dap: 'Tăng trọng số các ca dự đoán SAI ở vòng trước để mô hình yếu vòng sau CHÚ Ý hơn tới đúng những ca đó, rồi chuẩn hoá lại tổng trọng số về 1 — các mô hình yếu được huấn luyện TUẦN TỰ, mỗi vòng sửa lỗi vòng trước.',
      },
      {
        hoi: 'Boosting khác bagging ở điểm nào?',
        dap: 'Bagging huấn luyện nhiều mô hình ĐỘC LẬP song song rồi gộp bằng bỏ phiếu/trung bình. Boosting huấn luyện TUẦN TỰ, mỗi mô hình sau tập trung sửa lỗi mô hình trước bằng cách tăng trọng số các ca bị đoán sai.',
      },
      {
        hoi: 'Kể tên các cài đặt boosting công nghiệp phổ biến.',
        dap: 'XGBoost, LightGBM, CatBoost — các thư viện tối ưu tốc độ và độ chính xác của ý tưởng boosting cho dữ liệu lớn, thường mạnh nhất trên dữ liệu dạng bảng (tabular).',
      },
    ],
  },
  {
    id: 'ml-u3-l3',
    unitId: 'ml-u3',
    language: 'python',
    title: 'Voting — hard voting vs soft voting, khi nào chúng bất đồng',
    hook: 'Một hội đồng 3 giám khảo chấm "đạt/rớt": 2 người chấm SÁT NÚT đạt, 1 người chấm RỚT nhưng cực kỳ chắc chắn. Đếm đầu người thì "đạt" thắng (2-1). Nhưng nếu tính luôn ĐỘ CHẮC CHẮN của từng người thì kết quả có thể lật ngược. Đó là khoảng cách giữa hard voting và soft voting.',
    theory:
      'VOTING là cách gộp dự đoán đơn giản nhất của ensemble, có hai kiểu:\n\nHARD VOTING: mỗi mô hình chỉ đưa ra MỘT nhãn (nhãn nó tự tin nhất), rồi đếm phiếu và lấy đa số — đúng cơ chế bỏ phiếu đã cài ở bài 1.\n\nSOFT VOTING: mỗi mô hình đưa ra XÁC SUẤT cho TỪNG nhãn (không chỉ một nhãn cứng). Các xác suất được CỘNG (hoặc trung bình) qua tất cả mô hình cho từng nhãn, rồi chọn nhãn có tổng cao nhất.\n\nHai cách này CÓ THỂ cho kết quả khác nhau: hard voting chỉ đếm số phiếu, bỏ qua mức độ tự tin; soft voting cộng cả độ tự tin. Một mô hình RẤT tự tin vào một nhãn (xác suất gần 1) có thể kéo tổng xác suất nghiêng về nhãn đó, dù bị 2 mô hình khác vote thiểu số cho nhãn kia — đúng ví dụ hội đồng giám khảo ở trên.\n\nSoft voting cần MỖI mô hình xuất ra được xác suất, không chỉ nhãn cứng — mô hình nào chỉ trả về nhãn (không có xác suất) thì buộc phải dùng hard voting. Trong thực hành, soft voting thường được ưa chuộng hơn khi có đủ thông tin xác suất, vì nó tận dụng nhiều thông tin hơn hard voting.',
    workedExample: {
      code: `# So sanh hard voting va soft voting tren cung 3 "mo hinh yeu"
xac_suat = [
    {"cho": 0.45, "meo": 0.55},
    {"cho": 0.45, "meo": 0.55},
    {"cho": 0.95, "meo": 0.05},
]

# Hard voting: MOI mo hinh chi vote nhan co xac suat cao nhat cua no
vote_hard = []
for xs in xac_suat:
    nhan_vote = max(xs, key=xs.get)
    vote_hard.append(nhan_vote)
    print(f"Mo hinh vote: {nhan_vote} (xac suat {xs[nhan_vote]})")

dem = {}
for v in vote_hard:
    dem[v] = dem.get(v, 0) + 1
ket_qua_hard = max(dem, key=dem.get)
print(f"Hard voting thang: {ket_qua_hard}")

# Soft voting: CONG xac suat cua tung nhan qua tat ca mo hinh
tong_xs = {"cho": 0.0, "meo": 0.0}
for xs in xac_suat:
    for nhan in xs:
        tong_xs[nhan] += xs[nhan]
ket_qua_soft = max(tong_xs, key=tong_xs.get)
print(f"Soft voting thang: {ket_qua_soft} (tong xac suat cho={round(tong_xs['cho'], 2)}, meo={round(tong_xs['meo'], 2)})")`,
      stdinLines: [],
    },
    predict: {
      code: `xs_list = [{"a": 0.6, "b": 0.4}, {"a": 0.6, "b": 0.4}, {"a": 0.1, "b": 0.9}]\ntong = {"a": 0.0, "b": 0.0}\nfor xs in xs_list:\n    for nhan in xs:\n        tong[nhan] += xs[nhan]\nprint(max(tong, key=tong.get))`,
      question: 'Soft voting (cộng xác suất) thắng nhãn nào?',
      choices: ['b', 'a', 'Hoà, không xác định được', 'Báo lỗi'],
      answerIndex: 0,
      explain:
        'Tổng xác suất a = 0.6+0.6+0.1 = 1.3, tổng b = 0.4+0.4+0.9 = 1.7 → soft voting chọn "b" dù 2/3 mô hình có xác suất "a" cao hơn 0.5. Mô hình thứ ba rất tự tin vào "b" (0.9) kéo tổng lên — đúng lý do soft và hard voting có thể bất đồng.',
    },
    parsons: {
      prompt:
        'Xếp đúng cách gộp soft voting: cộng dồn xác suất từng nhãn qua mọi mô hình → chọn nhãn tổng cao nhất.',
      lines: [
        'tong_xs = {"cho": 0.0, "meo": 0.0}',
        'for xs in xac_suat:',
        '    for nhan in xs:',
        '        tong_xs[nhan] += xs[nhan]',
        'ket_qua_soft = max(tong_xs, key=tong_xs.get)',
      ],
    },
    make: {
      prompt:
        'Tự cài CẢ hard voting lẫn soft voting cho bài toán 2 nhãn "a"/"b" và so sánh.\n\nChương trình đọc 1 dòng input(): xác suất nhãn "a" của từng mô hình, cách nhau dấu phẩy, vd "0.45,0.45,0.95" (mỗi mô hình: p(a) = giá trị đó, p(b) = 1 - giá trị đó).\n\nHard voting: mỗi mô hình vote "a" nếu p(a) > 0.5, ngược lại vote "b" (kể cả khi bằng 0.5). Đếm phiếu, lấy đa số.\nSoft voting: cộng tổng p(a) và tổng p(b) qua mọi mô hình, lấy nhãn có tổng cao hơn.\n\nIn đúng 2 dòng:\nHard voting: <nhãn>\nSoft voting: <nhãn>',
      starterCode: `xs_a = [float(v) for v in input("Xac suat a tung mo hinh: ").split(",")]\n# Hard voting: p > 0.5 vote "a", nguoc lai vote "b"; dem phieu, lay da so\n# Soft voting: cong tong p(a) va p(b) = 1 - p(a) qua moi mo hinh, lay nhan tong cao hon\n`,
      testCases: [
        {
          stdinLines: ['0.45,0.45,0.95'],
          expected: 'Hard voting: b\nSoft voting: a',
          match: 'contains',
          hidden: false,
          label: '2 mô hình nghiêng nhẹ "b", 1 mô hình rất tự tin "a" → hard=b nhưng soft=a',
        },
        {
          stdinLines: ['0.7,0.8,0.9'],
          expected: 'Hard voting: a\nSoft voting: a',
          match: 'contains',
          hidden: false,
          label: 'Cả 3 mô hình đều nghiêng rõ về "a" → hard và soft đồng thuận',
        },
        {
          stdinLines: ['0.5,0.5,0.5'],
          expected: 'Hard voting: b\nSoft voting: a',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: p(a)=0.5 đúng ranh giới — hard vote "b" (không > 0.5), soft hoà (1.5=1.5) và nghiêng về nhãn liệt kê trước ("a")',
        },
      ],
      hints: [
        'Hard voting: với mỗi p trong xs_a, gán "a" nếu p > 0.5 else "b", rồi đếm bằng dict và max(dem, key=dem.get) như bài 1.',
        'Soft voting: cộng dồn TRỰC TIẾP p(a) và p(b) = 1 - p(a) của từng mô hình vào hai biến tổng (khởi tạo dict {"a": 0.0, "b": 0.0}), rồi so hai tổng bằng max(tong, key=tong.get).',
        'In đúng 2 dòng theo mẫu "Hard voting: <nhan>" và "Soft voting: <nhan>".',
      ],
      sampleSolution: `xs_a = [float(v) for v in input("Xac suat a tung mo hinh: ").split(",")]\n\nvote_hard = []\nfor p in xs_a:\n    vote_hard.append("a" if p > 0.5 else "b")\ndem = {}\nfor v in vote_hard:\n    dem[v] = dem.get(v, 0) + 1\nhard_thang = max(dem, key=dem.get)\n\ntong = {"a": 0.0, "b": 0.0}\nfor p in xs_a:\n    tong["a"] += p\n    tong["b"] += 1 - p\nsoft_thang = max(tong, key=tong.get)\n\nprint(f"Hard voting: {hard_thang}")\nprint(f"Soft voting: {soft_thang}")`,
    },
    homework:
      'Nghĩ một ví dụ đời thật khác cho hard voting (chỉ đếm đầu người, vd bầu cử phổ thông) và một ví dụ cho soft voting (cộng độ mạnh yếu, vd hội đồng phản biện cho điểm số thay vì chỉ đạt/rớt). Với hệ thống của DHCB (chấm điểm bài luyện nói/viết), nếu có nhiều mô hình AI cùng chấm một câu trả lời, bạn nghĩ nên dùng hard hay soft voting để gộp điểm — vì sao?',
    srsCards: [
      {
        hoi: 'Hard voting và soft voting khác nhau ở chỗ nào?',
        dap: 'Hard voting: mỗi mô hình chỉ vote MỘT nhãn (nhãn có xác suất cao nhất của nó), đếm phiếu và lấy đa số. Soft voting: mỗi mô hình đưa ra XÁC SUẤT cho từng nhãn, các xác suất được CỘNG (hoặc trung bình) qua các mô hình rồi chọn nhãn có tổng cao nhất.',
      },
      {
        hoi: 'Vì sao hard voting và soft voting có thể cho kết quả KHÁC nhau trên cùng dữ liệu?',
        dap: 'Hard voting chỉ đếm số phiếu, bỏ qua mức độ tự tin; soft voting cộng cả độ tự tin. Một mô hình RẤT tự tin vào một nhãn (xác suất gần 1) có thể kéo tổng xác suất nghiêng về nhãn đó dù bị đa số mô hình khác vote thiểu số cho nhãn kia.',
      },
      {
        hoi: 'Soft voting cần điều kiện gì mà hard voting không cần?',
        dap: 'Soft voting cần MỖI mô hình xuất ra được XÁC SUẤT (không chỉ nhãn cứng) cho từng lớp — mô hình nào chỉ trả về nhãn, không có xác suất, thì không dùng được cho soft voting và buộc phải gộp bằng hard voting.',
      },
    ],
  },
  {
    id: 'ml-u3-l4',
    unitId: 'ml-u3',
    language: 'python',
    title: 'Học tăng cường — Q-learning, học qua thử-sai bằng thưởng/phạt',
    hook: 'Robot dọn nhà không có ai dạy nó "đường nào tốt nhất". Nó cứ đi thử, va vào tường thì bị phạt, dọn sạch một góc thì được thưởng — dần dần nó tự đúc kết được đường đi khôn ngoan. Đó là HỌC TĂNG CƯỜNG (reinforcement learning): học qua THỬ-SAI dưới thưởng/phạt của môi trường, không có ai đưa "đáp án đúng" sẵn.',
    theory:
      "HỌC TĂNG CƯỜNG (reinforcement learning, RL) khác hẳn học có/không giám sát (chương 1-2): không có tập dữ liệu gán nhãn sẵn. Thay vào đó có một TÁC TỬ (agent) hành động trong một MÔI TRƯỜNG (environment), mỗi hành động ở một TRẠNG THÁI (state) nhận về một PHẦN THƯỞNG (reward, có thể âm = phạt) và đưa tới trạng thái kế tiếp. Mục tiêu: học một CHÍNH SÁCH (policy) chọn hành động để tổng phần thưởng dài hạn lớn nhất.\n\nQ-LEARNING là thuật toán RL cổ điển nhất: giữ một BẢNG Q, với Q(s, a) ước lượng \"giá trị dài hạn\" của việc thực hiện hành động a tại trạng thái s. Sau mỗi bước thật (hoặc mô phỏng), cập nhật:\n\nQ(s, a) ← Q(s, a) + alpha × [thưởng + gamma × max_a' Q(s', a') − Q(s, a)]\n\nTrong đó: alpha (tốc độ học, 0-1) quyết định cập nhật mạnh hay nhẹ; gamma (hệ số chiết khấu, 0-1) quyết định coi trọng tương lai bao nhiêu; max_a' Q(s', a') là giá trị TỐT NHẤT có thể đạt được từ trạng thái kế tiếp s' — phần trong ngoặc vuông gọi là \"sai số thời gian\" (TD error): chênh lệch giữa ước lượng cũ và ước lượng mới tốt hơn (thưởng thật + giá trị tương lai).\n\nBa hướng mở rộng, chỉ nhận diện tên, không tự cài: DQN (Deep Q-Network) thay bảng Q hữu hạn bằng một MẠNG NƠ-RON, cần thiết khi không gian trạng thái quá lớn/liên tục (ảnh, cảm biến) để liệt kê hết vào bảng. SARSA cập nhật theo Q(s', a') của hành động THỰC SỰ được thực hiện ở bước sau, thay vì max — bám sát chính sách đang chạy hơn Q-learning. Policy gradient và actor-critic học TRỰC TIẾP một chính sách (ánh xạ trạng thái → xác suất hành động) thay vì đi qua bước ước lượng giá trị trung gian như Q-learning.",
    workedExample: {
      code: `# Q-learning: cap nhat MOT buoc bang cong thuc
# Q(s,a) = Q(s,a) + alpha * (thuong + gamma * max(Q(s', .)) - Q(s,a))
Q = {
    ("phong_khach", "don"): 2.0,
    ("phong_khach", "sac_pin"): 0.5,
    ("phong_ngu", "don"): 3.0,
    ("phong_ngu", "sac_pin"): 1.0,
}
alpha = 0.5   # toc do hoc
gamma = 0.9   # trong so tuong lai

s = "phong_khach"       # trang thai hien tai
a = "don"                # hanh dong vua lam
thuong = 1.0              # phan thuong nhan duoc (vd don sach mot vung)
s_ke = "phong_ngu"       # trang thai ke tiep sau hanh dong

# tim gia tri lon nhat co the dat duoc tu trang thai ke tiep
q_ke_tiep = [Q[(trang_thai, hanh_dong)] for (trang_thai, hanh_dong) in Q if trang_thai == s_ke]
max_q_ke = max(q_ke_tiep)
print(f"Max Q tu trang thai ke: {max_q_ke}")

q_cu = Q[(s, a)]
q_moi = q_cu + alpha * (thuong + gamma * max_q_ke - q_cu)
print(f"Q cu: {q_cu}")
print(f"Q moi: {round(q_moi, 4)}")`,
      stdinLines: [],
    },
    predict: {
      code: `Q_sa = 1.0\nalpha = 0.5\ngamma = 0.5\nthuong = 2.0\nmax_q_ke = 4.0\nq_moi = Q_sa + alpha * (thuong + gamma * max_q_ke - Q_sa)\nprint(q_moi)`,
      question: 'Q mới sau một bước cập nhật là bao nhiêu?',
      choices: ['2.5', '3.0', '1.5', '4.0'],
      answerIndex: 0,
      explain:
        'thưởng + gamma×max_Q_kế − Q_cũ = 2.0 + 0.5×4.0 − 1.0 = 3.0; nhân alpha=0.5 được 1.5; cộng Q_cũ=1.0 ra 2.5. Đúng công thức Q-learning: Q_cũ được kéo dần về phía "thưởng + giá trị tương lai chiết khấu".',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự cập nhật Q-learning: tìm max Q từ trạng thái kế → lấy Q cũ → áp công thức cập nhật.',
      lines: [
        'q_ke_tiep = [Q[(trang_thai, hanh_dong)] for (trang_thai, hanh_dong) in Q if trang_thai == s_ke]',
        'max_q_ke = max(q_ke_tiep)',
        'q_cu = Q[(s, a)]',
        'q_moi = q_cu + alpha * (thuong + gamma * max_q_ke - q_cu)',
      ],
    },
    make: {
      prompt:
        'Tự cài một bước cập nhật Q-learning cho robot dọn nhà (bảng Q, alpha, gamma đã cho sẵn trong code khởi đầu).\n\nChương trình đọc 4 dòng input(): trạng thái hiện tại, hành động, trạng thái kế tiếp, và phần thưởng (số thực).\n\nTìm max Q trong số các hành động có thể từ TRẠNG THÁI KẾ TIẾP, lấy Q cũ của (trạng thái hiện tại, hành động), rồi áp đúng công thức Q-learning trong bài. In đúng 2 dòng:\nQ cu: <giá trị Q cũ, không làm tròn>\nQ moi: <giá trị Q mới, làm tròn 4 chữ số>',
      starterCode: `Q = {\n    ("phong_khach", "don"): 2.0,\n    ("phong_khach", "sac_pin"): 0.5,\n    ("phong_ngu", "don"): 3.0,\n    ("phong_ngu", "sac_pin"): 1.0,\n}\nalpha = 0.5\ngamma = 0.9\n\ns = input("Trang thai hien tai: ")\na = input("Hanh dong: ")\ns_ke = input("Trang thai ke tiep: ")\nthuong = float(input("Phan thuong: "))\n# Tim max Q tu s_ke, tinh Q moi theo cong thuc Q-learning, in Q cu va Q moi\n`,
      testCases: [
        {
          stdinLines: ['phong_khach', 'don', 'phong_ngu', '1.0'],
          expected: 'Q cu: 2.0\nQ moi: 2.85',
          match: 'contains',
          hidden: false,
          label: 'Q cũ 2.0, thưởng 1.0, max Q kế 3.0 → Q mới 2.85 (tăng)',
        },
        {
          stdinLines: ['phong_khach', 'sac_pin', 'phong_ngu', '0.0'],
          expected: 'Q cu: 0.5\nQ moi: 1.6',
          match: 'contains',
          hidden: false,
          label: 'Q cũ thấp 0.5, không có thưởng tức thời nhưng tương lai tốt → Q mới 1.6',
        },
        {
          stdinLines: ['phong_ngu', 'don', 'phong_khach', '0.5'],
          expected: 'Q cu: 3.0\nQ moi: 2.65',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: Q cũ CAO (3.0) nhưng thưởng nhỏ + tương lai kém hơn → Q mới GIẢM, không chỉ tăng',
        },
      ],
      hints: [
        'Lấy giá trị Q lớn nhất từ TRẠNG THÁI KẾ TIẾP bằng list comprehension lọc theo trang_thai == s_ke rồi max(...), đúng như ví dụ mẫu.',
        'Công thức: q_moi = q_cu + alpha * (thuong + gamma * max_q_ke - q_cu) — giữ đúng thứ tự phép toán.',
        'In q_cu nguyên (không làm tròn) và q_moi làm tròn 4 chữ số bằng round(q_moi, 4).',
      ],
      sampleSolution: `Q = {\n    ("phong_khach", "don"): 2.0,\n    ("phong_khach", "sac_pin"): 0.5,\n    ("phong_ngu", "don"): 3.0,\n    ("phong_ngu", "sac_pin"): 1.0,\n}\nalpha = 0.5\ngamma = 0.9\n\ns = input("Trang thai hien tai: ")\na = input("Hanh dong: ")\ns_ke = input("Trang thai ke tiep: ")\nthuong = float(input("Phan thuong: "))\n\nq_ke_tiep = [Q[(trang_thai, hanh_dong)] for (trang_thai, hanh_dong) in Q if trang_thai == s_ke]\nmax_q_ke = max(q_ke_tiep)\nq_cu = Q[(s, a)]\nq_moi = q_cu + alpha * (thuong + gamma * max_q_ke - q_cu)\nprint(f"Q cu: {q_cu}")\nprint(f"Q moi: {round(q_moi, 4)}")`,
    },
    homework:
      'Q-learning là RL "học giá trị". Tìm hiểu ngắn gọn (đọc 1 đoạn tóm tắt, không cần cài đặt): DQN thay bảng Q bằng gì và tại sao cần; SARSA khác Q-learning ở bước cập nhật nào; policy gradient học trực tiếp cái gì thay vì học giá trị. Viết 3-4 câu so sánh 3 cái tên này với Q-learning bảng bạn vừa cài.',
    srsCards: [
      {
        hoi: 'Viết công thức cập nhật Q-learning một bước.',
        dap: "Q(s,a) ← Q(s,a) + alpha × (thưởng + gamma × max_a' Q(s', a') − Q(s,a)). alpha là tốc độ học, gamma là trọng số tương lai (chiết khấu), max_a' Q(s',a') là giá trị tốt nhất có thể đạt từ trạng thái kế tiếp.",
      },
      {
        hoi: 'SARSA khác Q-learning ở điểm cập nhật nào?',
        dap: "Q-learning dùng max Q(s', .) — giá trị của hành động TỐT NHẤT có thể ở trạng thái kế tiếp (dù chưa chắc sẽ chọn nó). SARSA dùng Q(s', a') của hành động THỰC SỰ được thực hiện ở bước sau — bám sát chính sách đang chạy hơn.",
      },
      {
        hoi: 'DQN là gì so với Q-learning bảng (Q-table)?',
        dap: 'DQN (Deep Q-Network) = Q-learning nhưng thay bảng Q hữu hạn bằng một MẠNG NƠ-RON xấp xỉ hàm Q — cần thiết khi không gian trạng thái quá lớn hoặc liên tục (ảnh, cảm biến robot...) để liệt kê hết vào một bảng.',
      },
      {
        hoi: 'Policy gradient khác cách tiếp cận dựa trên giá trị (Q-learning) như thế nào?',
        dap: 'Q-learning học GIÁ TRỊ của từng cặp (trạng thái, hành động) rồi suy ra hành động tốt nhất. Policy gradient học TRỰC TIẾP một chính sách (hàm ánh xạ trạng thái → xác suất hành động) mà không cần đi qua bước ước lượng giá trị trung gian.',
      },
    ],
  },
  {
    id: 'ml-u3-l5',
    unitId: 'ml-u3',
    language: 'python',
    title: 'Semi-/self-supervised & transfer learning — học khi nhãn khan hiếm',
    hook: 'Gán nhãn 10.000 câu hỏi "khó/dễ" tốn cả tháng công người. Nhưng nếu chỉ có 50 câu đã chấm sẵn, ta có thể dùng CHÍNH 50 câu đó dạy một mô hình nhỏ, rồi để nó GÁN NHÃN GIẢ cho 9.950 câu còn lại — sai vài chỗ vẫn còn hơn không có gì. Đây là ý tưởng lõi của các kiểu học "lai" khi nhãn thật khan hiếm.',
    theory:
      'Học có giám sát (chương 1) cần MỌI ví dụ có nhãn thật. Đời thực nhãn luôn khan hiếm và đắt. Ba kiểu học lai xử lý đúng vấn đề này:\n\nSEMI-SUPERVISED (bán giám sát): có MỘT ÍT dữ liệu có nhãn thật, NHIỀU dữ liệu không nhãn. Kỹ thuật PSEUDO-LABELING (nhãn giả): (1) học một mô hình nhỏ trên phần có nhãn; (2) dùng nó GÁN NHÃN cho dữ liệu chưa có nhãn; (3) gộp nhãn thật + nhãn giả thành tập huấn luyện LỚN HƠN cho vòng học tiếp theo. Nhãn giả không hoàn hảo, nhưng "dữ liệu nhiều hơn dù hơi nhiễu" thường vẫn giúp mô hình học tốt hơn "dữ liệu ít nhưng sạch".\n\nSELF-SUPERVISED (tự giám sát): KHÔNG cần người gán nhãn nào cả — mô hình tự tạo "bài tập" từ chính cấu trúc dữ liệu. Ví dụ: che một từ trong câu rồi bắt mô hình đoán từ đó (masked language modeling — nền tảng huấn luyện các mô hình ngôn ngữ lớn); hoặc contrastive learning — dạy mô hình nhận ra hai bản biến đổi (xoay, cắt) của CÙNG một ảnh là "giống nhau", còn ảnh khác là "khác nhau".\n\nTRANSFER LEARNING (học chuyển giao): tận dụng một mô hình ĐÃ HỌC SẴN trên bài toán khác (thường trên tập dữ liệu khổng lồ) cho bài toán mới, ít dữ liệu hơn. Hai cách dùng: FINE-TUNING — huấn luyện TIẾP mô hình có sẵn trên dữ liệu mới (cập nhật trọng số của nó); FEATURE EXTRACTION — chỉ dùng mô hình có sẵn để RÚT ĐẶC TRƯNG, không huấn luyện lại trọng số của nó, rồi huấn luyện một bộ phân loại nhỏ phía sau.\n\nTổng kết chương: ensemble (bài 1-3) GỘP NHIỀU MÔ HÌNH để mạnh hơn một mô hình đơn; học tăng cường (bài 4) học qua THỬ-SAI bằng thưởng/phạt, không cần tập dữ liệu gán nhãn sẵn; các kiểu học lai (bài này) tận dụng dữ liệu KHÔNG NHÃN khi nhãn khan hiếm. Ba hướng này BỔ SUNG, không thay thế, cho học có/không giám sát đã học ở chương 1-2.',
    workedExample: {
      code: `# Pseudo-labeling: dung it du lieu CO NHAN de gan nhan cho du lieu CHUA CO NHAN
co_nhan = [(2, "de"), (3, "de"), (8, "kho"), (9, "kho")]   # (do kho, nhan)
chua_co_nhan = [4, 7, 1]   # cac cau hoi moi CHUA cham diem do kho

def gan_nhan_gan_nhat(x, du_lieu_co_nhan):
    # 1-NN tren 1 chieu: tim diem CO NHAN gan x nhat
    diem_gan_nhat, nhan_gan_nhat = du_lieu_co_nhan[0]
    kc_min = abs(x - diem_gan_nhat)
    for (diem, nhan) in du_lieu_co_nhan[1:]:
        kc = abs(x - diem)
        if kc < kc_min:
            kc_min = kc
            nhan_gan_nhat = nhan
    return nhan_gan_nhat

pseudo = []
for x in chua_co_nhan:
    nhan = gan_nhan_gan_nhat(x, co_nhan)
    pseudo.append((x, nhan))
    print(f"Gan nhan gia cho x={x}: {nhan}")

tap_huan_luyen_moi = co_nhan + pseudo   # gop nhan that + nhan gia
print(f"Tap huan luyen ban dau: {len(co_nhan)} ca, sau pseudo-label: {len(tap_huan_luyen_moi)} ca")`,
      stdinLines: [],
    },
    predict: {
      code: `co_nhan = [(1, "a"), (10, "b")]\nx = 6\nkc_min = abs(x - co_nhan[0][0])\nnhan = co_nhan[0][1]\nfor (diem, n) in co_nhan[1:]:\n    kc = abs(x - diem)\n    if kc < kc_min:\n        kc_min = kc\n        nhan = n\nprint(nhan)`,
      question: 'Điểm x=6 (nằm giữa 1 và 10) được gán nhãn giả nào?',
      choices: ['b', 'a', 'Cả hai', 'Báo lỗi'],
      answerIndex: 0,
      explain:
        '|6−1| = 5, |6−10| = 4 → điểm 10 gần hơn nên nhãn giả là "b" của điểm 10. Đây đúng là bước GÁN NHÃN GIẢ (pseudo-label): dùng khoảng cách tới dữ liệu có nhãn (1-NN, đã học ở chương 1) để đoán nhãn cho điểm chưa nhãn.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự pseudo-labeling: gán nhãn giả cho từng điểm chưa nhãn → gộp nhãn thật và nhãn giả thành tập lớn hơn.',
      lines: [
        'pseudo = []',
        'for x in chua_co_nhan:',
        '    nhan = gan_nhan_gan_nhat(x, co_nhan)',
        '    pseudo.append((x, nhan))',
        'tap_huan_luyen_moi = co_nhan + pseudo',
      ],
    },
    make: {
      prompt:
        'Tự cài pseudo-labeling: gán nhãn giả cho dữ liệu chưa có nhãn bằng 1-NN trên dữ liệu đã có nhãn.\n\nChương trình đọc 2 dòng input():\n- Dòng 1: dữ liệu ĐÃ có nhãn, dạng "diem:nhan" cách nhau dấu phẩy, vd "2:de,3:de,8:kho,9:kho".\n- Dòng 2: các điểm CHƯA có nhãn, cách nhau dấu phẩy, vd "4,7,1".\n\nVới mỗi điểm chưa nhãn, tìm điểm CÓ NHÃN gần nhất theo khoảng cách tuyệt đối (nếu hoà, giữ điểm CÓ NHÃN xuất hiện trước) rồi in:\nGan nhan gia <x>: <nhãn>\n(mỗi điểm chưa nhãn một dòng, theo đúng thứ tự trong dòng 2). Dòng cuối cùng in:\nTong tap huan luyen: <tổng số ca sau khi gộp nhãn thật + nhãn giả>',
      starterCode: `du_lieu_str = input("Du lieu co nhan (diem:nhan,...): ")\nchua_nhan_str = input("Cac diem chua co nhan: ")\n# Parse "diem:nhan" thanh list (float, nhan); voi moi diem chua nhan, tim 1-NN\n# roi in "Gan nhan gia <x>: <nhan>"; cuoi cung in tong so ca sau khi gop\n`,
      testCases: [
        {
          stdinLines: ['2:de,3:de,8:kho,9:kho', '4,7,1'],
          expected:
            'Gan nhan gia 4: de\nGan nhan gia 7: kho\nGan nhan gia 1: de\nTong tap huan luyen: 7',
          match: 'contains',
          hidden: false,
          label: '4 ca có nhãn + 3 ca gán nhãn giả (de, kho, de) → tổng 7',
        },
        {
          stdinLines: ['0:thap,100:cao', '40'],
          expected: 'Gan nhan gia 40: thap',
          match: 'contains',
          hidden: false,
          label: '40 gần 0 (khoảng cách 40) hơn 100 (khoảng cách 60) → nhãn giả "thap"',
        },
        {
          stdinLines: ['0:thap,100:cao', '50'],
          expected: 'Gan nhan gia 50: thap',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: 50 CÁCH ĐỀU 0 và 100 (hoà 50-50) — giữ điểm có nhãn xuất hiện TRƯỚC ("thap")',
        },
      ],
      hints: [
        'Parse "diem:nhan" bằng phan.split(":") cho từng phần tử của chuỗi đã split(",").',
        'Với mỗi điểm chưa có nhãn, tìm điểm CÓ NHÃN gần nhất bằng khoảng cách tuyệt đối abs(x - diem) — y hệt 1-NN đã học ở chương 1.',
        'Gộp bằng phép + của list (co_nhan + pseudo), rồi in tổng độ dài bằng len(...).',
      ],
      sampleSolution: `du_lieu_str = input("Du lieu co nhan (diem:nhan,...): ")\nchua_nhan_str = input("Cac diem chua co nhan: ")\n\nco_nhan = []\nfor phan in du_lieu_str.split(","):\n    diem_str, nhan = phan.split(":")\n    co_nhan.append((float(diem_str), nhan))\n\nchua_co_nhan = [float(x) for x in chua_nhan_str.split(",")]\n\npseudo = []\nfor x in chua_co_nhan:\n    diem_gan_nhat, nhan_gan_nhat = co_nhan[0]\n    kc_min = abs(x - diem_gan_nhat)\n    for (diem, nhan) in co_nhan[1:]:\n        kc = abs(x - diem)\n        if kc < kc_min:\n            kc_min = kc\n            nhan_gan_nhat = nhan\n    pseudo.append((x, nhan_gan_nhat))\n    x_in = int(x) if x == int(x) else x\n    print(f"Gan nhan gia {x_in}: {nhan_gan_nhat}")\n\ntap_huan_luyen_moi = co_nhan + pseudo\nprint(f"Tong tap huan luyen: {len(tap_huan_luyen_moi)}")`,
    },
    homework:
      'Tìm 1 ví dụ có thể áp semi-supervised (ít dữ liệu có nhãn, nhiều dữ liệu chưa nhãn), 1 ví dụ self-supervised (mô hình tự tạo bài tập từ chính dữ liệu, không cần người gán nhãn — vd đoán từ bị che trong câu), và 1 ví dụ transfer learning (dùng lại mô hình đã học sẵn cho bài toán khác) — có thể lấy ngay từ DHCB hoặc ứng dụng bạn dùng hằng ngày. Viết 3-4 câu tổng kết chương: ensemble gộp nhiều mô hình để mạnh hơn, học tăng cường học qua thử-sai bằng thưởng/phạt, còn các kiểu học lai tận dụng dữ liệu KHÔNG NHÃN khi nhãn khan hiếm.',
    srsCards: [
      {
        hoi: 'Pseudo-labeling hoạt động qua mấy bước, là những bước nào?',
        dap: '(1) Học một mô hình nhỏ trên vài ca ĐÃ CÓ NHÃN; (2) dùng mô hình đó GÁN NHÃN cho dữ liệu CHƯA có nhãn (nhãn "giả" — pseudo-label); (3) gộp cả nhãn thật lẫn nhãn giả thành tập huấn luyện LỚN HƠN cho vòng học tiếp theo.',
      },
      {
        hoi: 'Self-supervised learning khác semi-supervised ở chỗ nào?',
        dap: 'Semi-supervised vẫn cần một ÍT dữ liệu có nhãn THẬT do người gán. Self-supervised KHÔNG cần người gán nhãn nào cả — mô hình tự tạo "bài tập" từ chính cấu trúc dữ liệu (vd đoán từ bị che trong câu — masked language modeling, hoặc contrastive learning).',
      },
      {
        hoi: 'Transfer learning có hai cách dùng chính nào?',
        dap: 'Fine-tuning — huấn luyện TIẾP mô hình đã học sẵn trên bài toán mới, cập nhật trọng số của nó. Feature extraction — chỉ dùng mô hình có sẵn để RÚT ĐẶC TRƯNG, không huấn luyện lại trọng số, rồi huấn luyện một bộ phân loại nhỏ phía sau.',
      },
    ],
  },
]
