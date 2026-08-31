// lessons/mlu2.ts — Chương C2 "Học không giám sát" của khoá "Học máy — từ hồi quy
// đến AI tạo sinh" (docs/specs/2026-08-31-khoa-hoc-may.md).
//
// unitId 'ml-u2' KHÔNG nằm trong curriculum.ts — là "unit ảo" của tầng khoá ngắn, được
// lessons.test.ts công nhận qua SHORT_COURSES (courses/registry.ts), đúng cơ chế 'git-u*'.
//
// Luật soạn riêng của khoá (giữ nguyên từ mlu1.ts): mọi thuật toán LÕI đều tự cài bằng Python
// THUẦN (không numpy/sklearn) để Pyodide trình duyệt và python3 CI chấm y hệt nhau; nhánh
// chuyên sâu của bản đồ (t-SNE/UMAP/SVD/LDA) dạy ở mức nhận-đường trong theory, không bịa code.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const ML_U2_LESSONS: ProgrammingLesson[] = [
  {
    id: 'ml-u2-l1',
    unitId: 'ml-u2',
    language: 'python',
    title: 'K-means — tự cài một vòng gán-cụm',
    hook: 'Cửa hàng có 10.000 khách mà chỉ có MỘT nội dung khuyến mãi cho tất cả — chắc chắn không hợp ai cả. Muốn gửi đúng nhóm ("khách chi nhiều, mua thường xuyên" khác "khách mới ghé lần đầu") nhưng KHÔNG có nhãn nhóm nào sẵn trong dữ liệu. Đây đúng lúc học không giám sát vào cuộc: để MÁY TỰ TÌM cụm.',
    theory:
      'HỌC KHÔNG GIÁM SÁT (unsupervised) khác học có giám sát ở đúng một điểm: dữ liệu KHÔNG có nhãn đáp án — máy chỉ có các điểm dữ liệu thô, phải TỰ TÌM cấu trúc ẩn bên trong. Chương này đi 3 dạng cấu trúc chính: GOM CỤM (bài 1, 5), GIẢM CHIỀU (bài 3), LUẬT KẾT HỢP (bài 4) — bài 2 là bước chuẩn bị dữ liệu bắt buộc cho cả gom cụm lẫn k-NN đã học ở chương 1.\n\nK-MEANS là thuật toán gom cụm phổ biến nhất. Ý tưởng: chọn trước k TÂM CỤM (centroid), rồi lặp đi lặp lại 2 bước tới khi ổn định:\n1. GÁN — mỗi điểm dữ liệu thuộc về tâm cụm GẦN NÓ NHẤT (đo bằng khoảng cách Euclid, đã học ở bài k-NN chương 1: sqrt((x1-x2)² + (y1-y2)²)).\n2. CẬP NHẬT — tính lại mỗi tâm cụm = TRUNG BÌNH của các điểm vừa được gán vào nó.\n\nLặp hai bước này tới khi tâm cụm không đổi nữa là xong. Bài hôm nay chỉ cài ĐÚNG MỘT VÒNG (gán + cập nhật một lần) — hiểu rõ một vòng là hiểu rõ cả thuật toán, vòng lặp ngoài chỉ là lặp lại đúng logic đó nhiều lần.\n\nĐiểm cần nhớ: k-means cần biết TRƯỚC số cụm k và tâm ban đầu ảnh hưởng tới kết quả cuối (chọn tâm khác nhau có thể ra cụm khác nhau) — bài 5 học DBSCAN, thuật toán gom cụm KHÔNG cần biết trước số cụm, để so sánh.',
    workedExample: {
      code: `# K-means MOT VONG: gan diem vao tam gan nhat, roi tinh lai tam moi
diem = [(1, 1), (1, 2), (9, 8), (9, 9)]   # (tan_suat_mua, chi_tieu_trieu)
tam1 = (0, 0)
tam2 = (10, 10)

cum1 = []
cum2 = []
for (x, y) in diem:
    # khoang cach Euclid toi tung tam (da hoc o bai k-NN chuong 1)
    d1 = ((x - tam1[0]) ** 2 + (y - tam1[1]) ** 2) ** 0.5
    d2 = ((x - tam2[0]) ** 2 + (y - tam2[1]) ** 2) ** 0.5
    if d1 <= d2:
        cum1.append((x, y))
        print(f"Diem ({x},{y}): gan cum 1")
    else:
        cum2.append((x, y))
        print(f"Diem ({x},{y}): gan cum 2")

# CAP NHAT: tam cum moi = trung binh cac diem vua duoc gan
tam1_moi = (sum(p[0] for p in cum1) / len(cum1), sum(p[1] for p in cum1) / len(cum1))
tam2_moi = (sum(p[0] for p in cum2) / len(cum2), sum(p[1] for p in cum2) / len(cum2))
print(f"Tam 1 moi: {tam1_moi}")
print(f"Tam 2 moi: {tam2_moi}")`,
      stdinLines: [],
    },
    predict: {
      code: `p = (4, 0)\ntam1 = (0, 0)\ntam2 = (10, 0)\nd1 = ((p[0] - tam1[0]) ** 2 + (p[1] - tam1[1]) ** 2) ** 0.5\nd2 = ((p[0] - tam2[0]) ** 2 + (p[1] - tam2[1]) ** 2) ** 0.5\nprint("cum 1" if d1 <= d2 else "cum 2")`,
      question: 'Điểm (4,0) gần tâm nào hơn trong hai tâm (0,0) và (10,0)?',
      choices: ['cum 1', 'cum 2', 'Cả hai bằng nhau', 'Báo lỗi'],
      answerIndex: 0,
      explain:
        'd1 = |4-0| = 4, d2 = |4-10| = 6. 4 < 6 nên điểm gần tâm 1 hơn, gán "cum 1" — bước GÁN của k-means chỉ đơn giản là so sánh khoảng cách Euclid tới từng tâm, y hệt logic k-NN đã học.',
    },
    parsons: {
      prompt:
        'Xếp đúng một vòng k-means: gán từng điểm vào tâm gần nhất → cập nhật tâm mới bằng trung bình.',
      lines: [
        'for (x, y) in diem:',
        '    d1 = ((x - tam1[0]) ** 2 + (y - tam1[1]) ** 2) ** 0.5',
        '    d2 = ((x - tam2[0]) ** 2 + (y - tam2[1]) ** 2) ** 0.5',
        '    if d1 <= d2:',
        '        cum1.append((x, y))',
        '    else:',
        '        cum2.append((x, y))',
        'tam1_moi = (sum(p[0] for p in cum1) / len(cum1), sum(p[1] for p in cum1) / len(cum1))',
      ],
    },
    make: {
      prompt:
        'Tự cài MỘT VÒNG k-means (gán + cập nhật) với 2 tâm cụm cho sẵn.\n\nChương trình đọc 3 dòng input():\n- Dòng 1: các điểm dữ liệu, dạng "x,y" cách nhau bởi dấu ";", vd "1,1;1,2;9,8".\n- Dòng 2: tâm cụm 1, dạng "x,y".\n- Dòng 3: tâm cụm 2, dạng "x,y".\n\nVới MỖI điểm (theo đúng thứ tự trong dữ liệu), in một dòng "Diem (x,y) -> cum 1" hoặc "Diem (x,y) -> cum 2" (điểm cách đều hai tâm thì tính vào cụm 1). Sau khi duyệt hết, in 2 dòng tâm cụm MỚI:\nTam cum 1 moi: (x,y)\nTam cum 2 moi: (x,y)',
      starterCode: `diem_str = input("Cac diem: ")\ntam1_str = input("Tam cum 1: ")\ntam2_str = input("Tam cum 2: ")\ndiem = [tuple(map(float, p.split(","))) for p in diem_str.split(";")]\ntam1 = tuple(map(float, tam1_str.split(",")))\ntam2 = tuple(map(float, tam2_str.split(",")))\n# Gan tung diem vao tam gan hon (d1 <= d2 thi cum 1), roi tinh lai tam moi\n`,
      testCases: [
        {
          stdinLines: ['1,1;1,2;9,8;9,9', '0,0', '10,10'],
          expected: 'Diem (1.0,1.0) -> cum 1',
          match: 'contains',
          hidden: false,
          label: '(1,1) gần tâm (0,0) hơn → cụm 1',
        },
        {
          stdinLines: ['1,1;1,2;9,8;9,9', '0,0', '10,10'],
          expected: 'Tam cum 1 moi: (1.0,1.5)',
          match: 'contains',
          hidden: false,
          label: 'Tâm cụm 1 mới = trung bình (1,1) và (1,2)',
        },
        {
          stdinLines: ['2,2;2,3;8,2;8,3', '0,0', '10,0'],
          expected: 'Tam cum 2 moi: (8.0,2.5)',
          match: 'contains',
          hidden: false,
          label: 'Bộ dữ liệu khác vẫn ra đúng tâm cụm 2 mới',
        },
        {
          stdinLines: ['5,0;1,0;9,0', '0,0', '10,0'],
          expected: 'Diem (5.0,0.0) -> cum 1',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: điểm (5,0) CÁCH ĐỀU hai tâm (đều cách 5) — quy ước gán vào cụm 1',
        },
      ],
      hints: [
        'Đổi chuỗi "x,y" sang tuple số: tuple(map(float, chuoi.split(","))) — dùng cho cả điểm lẫn tâm.',
        'Bước GÁN: với mỗi (x,y), tính d1, d2 như ví dụ mẫu; if d1 <= d2 (chú ý <=, không phải <) thì thuộc cụm 1.',
        'Bước CẬP NHẬT: tâm mới = (trung bình x, trung bình y) của các điểm ĐÃ ĐƯỢC GÁN vào cụm đó — dùng sum(...)/len(...) riêng cho từng toạ độ.',
      ],
      sampleSolution: `diem_str = input("Cac diem: ")\ntam1_str = input("Tam cum 1: ")\ntam2_str = input("Tam cum 2: ")\ndiem = [tuple(map(float, p.split(","))) for p in diem_str.split(";")]\ntam1 = tuple(map(float, tam1_str.split(",")))\ntam2 = tuple(map(float, tam2_str.split(",")))\ncum1 = []\ncum2 = []\nfor (x, y) in diem:\n    d1 = ((x - tam1[0]) ** 2 + (y - tam1[1]) ** 2) ** 0.5\n    d2 = ((x - tam2[0]) ** 2 + (y - tam2[1]) ** 2) ** 0.5\n    if d1 <= d2:\n        cum1.append((x, y))\n        print(f"Diem ({x},{y}) -> cum 1")\n    else:\n        cum2.append((x, y))\n        print(f"Diem ({x},{y}) -> cum 2")\ntam1_x = sum(p[0] for p in cum1) / len(cum1)\ntam1_y = sum(p[1] for p in cum1) / len(cum1)\ntam2_x = sum(p[0] for p in cum2) / len(cum2)\ntam2_y = sum(p[1] for p in cum2) / len(cum2)\nprint(f"Tam cum 1 moi: ({tam1_x},{tam1_y})")\nprint(f"Tam cum 2 moi: ({tam2_x},{tam2_y})")`,
    },
    homework:
      'Chạy code bài Make với 3 bộ tâm ban đầu KHÁC nhau trên cùng một bộ điểm (giữ nguyên "Cac diem", chỉ đổi hai dòng tâm). Tâm cụm MỚI sau một vòng có giống nhau giữa 3 lần chạy không? Từ đó giải thích bằng lời: vì sao nói "kết quả k-means phụ thuộc vào tâm ban đầu", và vì sao trong thực tế người ta hay chạy k-means NHIỀU LẦN với tâm khởi tạo ngẫu nhiên khác nhau rồi chọn lần cho kết quả tốt nhất.',
    srsCards: [
      {
        hoi: 'Một vòng k-means gồm đúng hai bước nào?',
        dap: 'GÁN — mỗi điểm dữ liệu thuộc về tâm cụm gần nó nhất theo khoảng cách Euclid. CẬP NHẬT — tính lại mỗi tâm cụm bằng trung bình các điểm vừa được gán vào nó. Lặp hai bước tới khi tâm không đổi.',
      },
      {
        hoi: 'K-means cần biết trước điều gì mà DBSCAN (bài 5) không cần?',
        dap: 'K-means cần biết trước SỐ CỤM k và chọn tâm ban đầu (ảnh hưởng tới kết quả cuối). DBSCAN không cần biết trước số cụm, tự tìm cụm dựa trên mật độ điểm.',
      },
      {
        hoi: 'Học không giám sát khác học có giám sát ở dữ liệu đầu vào như thế nào?',
        dap: 'Học có giám sát: mỗi ví dụ có sẵn nhãn/đáp án đúng để học ánh xạ vào→ra. Học không giám sát: dữ liệu KHÔNG có nhãn, máy tự tìm cấu trúc ẩn (cụm, chiều quan trọng, luật đi kèm) mà không ai bảo trước đáp án.',
      },
    ],
  },
  {
    id: 'ml-u2-l2',
    unitId: 'ml-u2',
    language: 'python',
    title: 'Chuẩn hoá dữ liệu — vì sao thang đo khác nhau làm khoảng cách nói dối',
    hook: 'So hai khách hàng: người A 25 tuổi thu nhập 10 triệu, người B 30 tuổi thu nhập 50 triệu. Tính khoảng cách kiểu k-NN/k-means, con số 40 (chênh thu nhập) NUỐT TRỌN con số 5 (chênh tuổi) — dù tuổi cũng quan trọng không kém. Máy không biết "40 triệu" và "5 tuổi" là hai loại đơn vị khác hẳn nhau — nó chỉ thấy hai con số.',
    theory:
      'Mọi thuật toán dựa trên KHOẢNG CÁCH (k-NN chương 1, k-means bài 1, DBSCAN bài 5) đều cộng bình phương chênh lệch của TỪNG đặc trưng lại với nhau. Nếu một đặc trưng có thang đo lớn (thu nhập: 0–100 triệu) và một đặc trưng có thang đo nhỏ (tuổi: 0–100 nhưng thực tế dao động vài chục), đặc trưng thang đo lớn sẽ ÁP ĐẢO khoảng cách tổng — mô hình coi như "quên" mất đặc trưng còn lại, dù nó có thể quan trọng hơn.\n\nCHUẨN HOÁ MIN-MAX (min-max scaling) đưa mọi đặc trưng về CÙNG một đoạn [0, 1] để công bằng:\n\nx_chuan = (x - min) / (max - min)\n\ntrong đó min, max lấy trên TOÀN BỘ giá trị của đặc trưng đó. Sau khi chuẩn hoá, giá trị nhỏ nhất của đặc trưng luôn thành 0.0, lớn nhất luôn thành 1.0, và mọi đặc trưng đều "cân sức" như nhau khi tính khoảng cách.\n\nCa biên phải xử lý: nếu MỌI giá trị của đặc trưng bằng nhau (max = min), công thức chia cho 0 — quy ước trả về 0.0 cho tất cả (đặc trưng không đổi thì không mang thông tin phân biệt gì).\n\nLuật thực hành quan trọng (nối sang bài "train/test split" chương 1): min/max PHẢI tính trên tập TRAIN rồi áp dụng số đó cho cả tập test — tính min/max trên toàn bộ dữ liệu trước khi chia chính là một dạng RÒ RỈ DỮ LIỆU đã học.',
    workedExample: {
      code: `# So sanh khoang cach THO va khoang cach da CHUAN HOA
tuoi = [25, 30, 45, 60]
thu_nhap = [10, 50, 20, 90]   # trieu dong/thang

def chuan_hoa(danh_sach):
    lo = min(danh_sach)
    hi = max(danh_sach)
    if hi == lo:
        return [0.0 for _ in danh_sach]
    return [(x - lo) / (hi - lo) for x in danh_sach]

tuoi_chuan = chuan_hoa(tuoi)
thu_nhap_chuan = chuan_hoa(thu_nhap)

# Khoang cach giua nguoi 0 va nguoi 1, KHI CHUA chuan hoa
kc_tho = ((tuoi[0] - tuoi[1]) ** 2 + (thu_nhap[0] - thu_nhap[1]) ** 2) ** 0.5
# Khoang cach giua nguoi 0 va nguoi 1, SAU KHI chuan hoa ve [0,1]
kc_chuan = ((tuoi_chuan[0] - tuoi_chuan[1]) ** 2 + (thu_nhap_chuan[0] - thu_nhap_chuan[1]) ** 2) ** 0.5

print(f"Khoang cach tho: {kc_tho}")
print(f"Khoang cach da chuan hoa: {kc_chuan}")`,
      stdinLines: [],
    },
    predict: {
      code: `so_lieu = [4, 8, 12]\nlo = min(so_lieu)\nhi = max(so_lieu)\nchuan = [(x - lo) / (hi - lo) for x in so_lieu]\nprint(chuan[1])`,
      question:
        'Sau khi chuẩn hoá [4, 8, 12] về [0,1], giá trị chuẩn hoá của phần tử thứ hai (8) là bao nhiêu?',
      choices: ['0.5', '8.0', '1.0', '0.0'],
      answerIndex: 0,
      explain:
        'lo=4, hi=12. (8-4)/(12-4) = 4/8 = 0.5 — giá trị 8 nằm ĐÚNG GIỮA 4 và 12 nên chuẩn hoá ra đúng giữa đoạn [0,1] là 0.5.',
    },
    parsons: {
      prompt:
        'Xếp đúng hàm chuẩn hoá min-max: lấy min/max → xử lý ca max=min → công thức chuẩn hoá.',
      lines: [
        'lo = min(so_lieu)',
        'hi = max(so_lieu)',
        'if hi == lo:',
        '    chuan = [0.0 for _ in so_lieu]',
        'else:',
        '    chuan = [(x - lo) / (hi - lo) for x in so_lieu]',
      ],
    },
    make: {
      prompt:
        'Viết hàm chuẩn hoá min-max dùng chung cho mọi đặc trưng.\n\nChương trình đọc 1 dòng input(): các số cách nhau dấu phẩy, vd "10,20,30".\n\nChuẩn hoá về đoạn [0,1] theo công thức (x-min)/(max-min); nếu mọi giá trị bằng nhau thì tất cả kết quả là 0.0. In đúng 1 dòng, các giá trị chuẩn hoá cách nhau dấu phẩy (không có dấu cách), theo đúng thứ tự vào:\nKet qua: <v1>,<v2>,...',
      starterCode: `so_lieu = [float(v) for v in input("So lieu: ").split(",")]\n# Tinh lo, hi; xu ly ca max == min; roi tinh danh sach da chuan hoa\n`,
      testCases: [
        {
          stdinLines: ['10,20,30'],
          expected: 'Ket qua: 0.0,0.5,1.0',
          match: 'contains',
          hidden: false,
          label: '10,20,30 → 0.0,0.5,1.0',
        },
        {
          stdinLines: ['0,50,100'],
          expected: 'Ket qua: 0.0,0.5,1.0',
          match: 'contains',
          hidden: false,
          label: '0,50,100 → cùng tỉ lệ 0.0,0.5,1.0',
        },
        {
          stdinLines: ['5,5,5'],
          expected: 'Ket qua: 0.0,0.0,0.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: mọi giá trị bằng nhau (max=min) → tất cả 0.0, không chia cho 0',
        },
      ],
      hints: [
        'lo = min(so_lieu), hi = max(so_lieu) — làm trước, chỉ tính một lần rồi dùng lại cho mọi phần tử.',
        'Kiểm ca biên TRƯỚC: if hi == lo thì trả list toàn 0.0, tránh phép chia cho 0.',
        'Còn lại dùng list comprehension: [(x - lo) / (hi - lo) for x in so_lieu], rồi nối chuỗi bằng ",".join(str(v) for v in ket_qua).',
      ],
      sampleSolution: `so_lieu = [float(v) for v in input("So lieu: ").split(",")]\nlo = min(so_lieu)\nhi = max(so_lieu)\nif hi == lo:\n    ket_qua = [0.0 for _ in so_lieu]\nelse:\n    ket_qua = [(x - lo) / (hi - lo) for x in so_lieu]\nprint("Ket qua: " + ",".join(str(v) for v in ket_qua))`,
    },
    homework:
      'Lấy lại code bài "1-NN" ở chương 1 (đoán lớp beginner/advanced từ tháng-đã-học và điểm-test). Thử đổi thang đo: nhân MỌI giá trị "tháng đã học" lên 100 lần (giữ nguyên điểm test). Kết quả 1-NN có đổi không, dù ý nghĩa dữ liệu không hề thay đổi? Viết 3-4 câu giải thích vì sao chuẩn hoá lại là bước KHÔNG ĐƯỢC BỎ QUA trước khi dùng bất cứ thuật toán nào dựa trên khoảng cách.',
    srsCards: [
      {
        hoi: 'Vì sao đặc trưng có thang đo lớn làm sai lệch khoảng cách trong k-NN/k-means?',
        dap: 'Khoảng cách Euclid cộng bình phương chênh lệch của từng đặc trưng — đặc trưng thang đo lớn (vd thu nhập triệu đồng) tạo ra chênh lệch tuyệt đối lớn hơn hẳn, áp đảo tổng, khiến đặc trưng thang đo nhỏ (vd tuổi) gần như bị "quên" dù có thể quan trọng hơn.',
      },
      {
        hoi: 'Công thức chuẩn hoá min-max và ca biên phải xử lý là gì?',
        dap: 'x_chuan = (x - min) / (max - min), đưa mọi giá trị về đoạn [0,1]. Ca biên: nếu max = min (mọi giá trị bằng nhau) thì chia cho 0 — quy ước trả về 0.0 cho tất cả.',
      },
      {
        hoi: 'Vì sao tính min/max trên toàn bộ dữ liệu trước khi chia train/test là rò rỉ dữ liệu?',
        dap: 'Vì lúc đó thống kê (min/max) của tập TEST đã lọt vào bước chuẩn bị dữ liệu huấn luyện — đúng định nghĩa rò rỉ dữ liệu đã học ở chương 1: phải tính min/max trên train rồi áp dụng số đó cho test, không tính ngược lại.',
      },
    ],
  },
  {
    id: 'ml-u2-l3',
    unitId: 'ml-u2',
    language: 'python',
    title: 'Giảm chiều — giữ trục nào, bỏ trục nào',
    hook: 'Khảo sát khách hàng có 50 câu hỏi (50 "chiều" dữ liệu) nhưng nhiều câu gần như hỏi CÙNG một điều — vẽ biểu đồ 50 chiều là bất khả thi cho mắt người, và mô hình học trên 50 chiều nhiễu dễ overfit (đã học chương 1). GIẢM CHIỀU đi tìm vài "trục tổng hợp" giữ lại được PHẦN LỚN thông tin, bỏ bớt phần dư thừa.',
    theory:
      'GIẢM CHIỀU (dimensionality reduction) = nén dữ liệu nhiều đặc trưng xuống ít đặc trưng hơn mà vẫn giữ được phần lớn "thông tin" quan trọng. Câu hỏi cốt lõi: TRỤC nào đáng giữ, trục nào nên bỏ?\n\nThước đo trực giác nhất: PHƯƠNG SAI (variance) — trục nào các điểm dữ liệu dàn trải RỘNG (phương sai lớn) thì trục đó đang MANG NHIỀU THÔNG TIN để phân biệt các điểm với nhau; trục nào mọi điểm gần như giống hệt nhau (phương sai ~0) thì gần như không giúp phân biệt gì, có thể bỏ mà không mất bao nhiêu.\n\nPhương sai của một danh sách số: lấy TRUNG BÌNH, rồi tính trung bình BÌNH PHƯƠNG độ lệch của từng giá trị so với trung bình đó:\n\nphuong_sai = trung_binh[(x - trung_binh_x)²]\n\nPCA (Principal Component Analysis) — thuật toán giảm chiều kinh điển — làm đúng ý tưởng này nhưng tổng quát hơn: nó không chỉ nhìn các trục GỐC (như tuổi, thu nhập) mà tìm ra các trục MỚI (tổ hợp tuyến tính của các trục gốc) theo thứ tự phương sai giảm dần, rồi giữ lại vài trục đầu có phương sai lớn nhất. Bài hôm nay chỉ cài phần trực giác — so phương sai giữa các trục GỐC có sẵn — không tự cài PCA đầy đủ (cần đại số tuyến tính vượt phạm vi khoá này).\n\nHọ hàng đáng biết tên trên bản đồ (chỉ cần biết DÙNG ĐỂ LÀM GÌ, không tự cài): t-SNE và UMAP — giảm chiều để TRỰC QUAN HOÁ (vẽ dữ liệu nhiều chiều thành 2D/3D đẹp mắt, giữ cấu trúc cụm gần đúng chứ không giữ khoảng cách tuyệt đối); SVD (Singular Value Decomposition) — nền tảng toán học đứng sau PCA, cũng dùng trong hệ gợi ý sản phẩm; LDA (Linear Discriminant Analysis) — giống PCA nhưng CÓ dùng nhãn lớp, chọn trục giúp PHÂN BIỆT các lớp tốt nhất thay vì chỉ giữ phương sai lớn nhất.',
    workedExample: {
      code: `# So phuong sai hai truc de quyet dinh giu truc nao
def phuong_sai(danh_sach):
    tb = sum(danh_sach) / len(danh_sach)
    return sum((x - tb) ** 2 for x in danh_sach) / len(danh_sach)

truc_a = [1, 2, 3, 4, 5]        # diem dan trai rong
truc_b = [10, 10, 10, 10, 10]   # diem gan nhu giong het nhau

va = phuong_sai(truc_a)
vb = phuong_sai(truc_b)
print(f"Phuong sai truc A: {va}")
print(f"Phuong sai truc B: {vb}")
print("Giu lai:", "A" if va >= vb else "B")`,
      stdinLines: [],
    },
    predict: {
      code: `lst = [2, 4, 6]\ntb = sum(lst) / len(lst)\nv = sum((x - tb) ** 2 for x in lst) / len(lst)\nprint(v)`,
      question: 'Phương sai của [2, 4, 6] in ra là bao nhiêu?',
      choices: ['2.6666666666666665', '4.0', '2.0', '0.0'],
      answerIndex: 0,
      explain:
        'Trung bình = 4. Độ lệch: -2, 0, 2 → bình phương: 4, 0, 4 → tổng 8, chia 3 phần tử = 2.6666666666666665. Số càng dàn trải xa trung bình thì phương sai càng lớn.',
    },
    parsons: {
      prompt:
        'Xếp đúng hàm tính phương sai: trung bình → tổng bình phương độ lệch → chia số phần tử.',
      lines: [
        'def phuong_sai(danh_sach):',
        '    tb = sum(danh_sach) / len(danh_sach)',
        '    tong_binh_phuong = sum((x - tb) ** 2 for x in danh_sach)',
        '    return tong_binh_phuong / len(danh_sach)',
      ],
    },
    make: {
      prompt:
        'Viết chương trình so phương sai hai trục dữ liệu để quyết định giữ trục nào khi giảm chiều.\n\nChương trình đọc 2 dòng input(): giá trị trục A và trục B (số cách nhau dấu phẩy, CÙNG độ dài).\n\nTính phương sai từng trục theo công thức trong bài, in đúng 3 dòng:\nPhuong sai truc A: <va>\nPhuong sai truc B: <vb>\nGiu lai: A (nếu va >= vb) hoặc Giu lai: B (nếu vb > va)',
      starterCode: `truc_a = [float(v) for v in input("Truc A: ").split(",")]\ntruc_b = [float(v) for v in input("Truc B: ").split(",")]\n# Viet ham phuong_sai roi tinh cho ca hai truc, in ket qua va quyet dinh giu truc nao\n`,
      testCases: [
        {
          stdinLines: ['1,2,3,4,5', '10,10,10,10,10'],
          expected: 'Phuong sai truc A: 2.0\nPhuong sai truc B: 0.0\nGiu lai: A',
          match: 'contains',
          hidden: false,
          label: 'Trục A dàn trải, trục B đứng yên → giữ A',
        },
        {
          stdinLines: ['5,5,5', '1,2,3'],
          expected: 'Giu lai: B',
          match: 'contains',
          hidden: false,
          label: 'Trục A đứng yên, trục B dàn trải → giữ B',
        },
        {
          stdinLines: ['1,2,3', '10,11,12'],
          expected: 'Giu lai: A',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: hai trục có PHƯƠNG SAI BẰNG NHAU hệt nhau (0.6666...) — quy ước hoà thì giữ A',
        },
      ],
      hints: [
        'Viết một hàm phuong_sai(danh_sach) dùng lại được cho cả hai trục — tránh chép code hai lần (DRY).',
        'Công thức: trung bình trước, rồi sum((x - tb) ** 2 for x in danh_sach) / len(danh_sach).',
        'So sánh: if va >= vb thì "Giu lai: A" (dùng >= để xử lý ca hoà — bằng nhau thì ưu tiên A), ngược lại "Giu lai: B".',
      ],
      sampleSolution: `def phuong_sai(danh_sach):\n    tb = sum(danh_sach) / len(danh_sach)\n    return sum((x - tb) ** 2 for x in danh_sach) / len(danh_sach)\n\ntruc_a = [float(v) for v in input("Truc A: ").split(",")]\ntruc_b = [float(v) for v in input("Truc B: ").split(",")]\nva = phuong_sai(truc_a)\nvb = phuong_sai(truc_b)\nprint(f"Phuong sai truc A: {va}")\nprint(f"Phuong sai truc B: {vb}")\nprint("Giu lai:", "A" if va >= vb else "B")`,
    },
    homework:
      'Nghĩ về một bảng khảo sát/dữ liệu có nhiều cột quanh bạn (vd điểm các môn học, hoặc các câu hỏi trong một bài khảo sát mức độ hài lòng). Đoán xem cột nào có khả năng phương sai THẤP (mọi người trả lời gần giống nhau, ít mang thông tin phân biệt) và cột nào phương sai CAO (câu trả lời rất khác nhau giữa mọi người). Nếu phải bỏ bớt 1/3 số cột để "nén" dữ liệu, bạn sẽ bỏ nhóm nào trước, vì sao?',
    srsCards: [
      {
        hoi: 'Vì sao phương sai là thước đo trực giác để quyết định giữ hay bỏ một trục khi giảm chiều?',
        dap: 'Trục có phương sai lớn (các điểm dàn trải rộng) mang nhiều thông tin phân biệt các điểm với nhau; trục phương sai gần 0 (mọi điểm gần giống hệt nhau) gần như không giúp phân biệt gì nên có thể bỏ mà ít mất thông tin.',
      },
      {
        hoi: 'PCA làm gì khác so với việc chỉ so phương sai giữa các trục GỐC?',
        dap: 'PCA không chỉ nhìn các trục gốc có sẵn — nó tìm ra các trục MỚI (tổ hợp tuyến tính của trục gốc) theo thứ tự phương sai giảm dần, rồi giữ lại vài trục đầu có phương sai lớn nhất, thay vì chỉ chọn trong số trục đã có.',
      },
      {
        hoi: 't-SNE/UMAP dùng để làm gì, và LDA khác PCA ở điểm nào?',
        dap: 't-SNE/UMAP: giảm chiều để TRỰC QUAN HOÁ (vẽ dữ liệu nhiều chiều thành 2D/3D, giữ cấu trúc cụm gần đúng). LDA khác PCA ở chỗ CÓ dùng nhãn lớp — chọn trục giúp PHÂN BIỆT các lớp tốt nhất, thay vì chỉ giữ phương sai lớn nhất như PCA.',
      },
    ],
  },
  {
    id: 'ml-u2-l4',
    unitId: 'ml-u2',
    language: 'python',
    title: 'Luật kết hợp — "mua bia thì hay mua thêm gì?"',
    hook: 'Siêu thị nhận ra: khách mua bia thì rất hay mua kèm bỉm — nghe vô lý nhưng có thật (câu chuyện kinh điển ngành bán lẻ). Không ai LẬP TRÌNH luật đó — nó được TÌM RA từ hàng ngàn giỏ hàng thật. Đó là LUẬT KẾT HỢP (association rules): tìm "mua A thì hay mua thêm B" thuần từ dữ liệu giao dịch, không cần nhãn.',
    theory:
      'LUẬT KẾT HỢP đi tìm các cặp mặt hàng hay xuất hiện CÙNG NHAU trong giỏ hàng, đo bằng hai con số:\n\nSUPPORT(X) = tỉ lệ giao dịch có chứa tập mặt hàng X trong TỔNG số giao dịch. Support cao nghĩa là tập mặt hàng đó PHỔ BIẾN.\n\nCONFIDENCE(A → B) = trong số giao dịch ĐÃ MUA A, có bao nhiêu phần trăm cũng mua B:\n\nconfidence(A → B) = support(A và B) / support(A)\n\nNói cách khác: confidence chính là "xác suất mua B, với điều kiện đã mua A" — ước lượng bằng cách đếm tần suất trên dữ liệu thật, không phải công thức xác suất lý thuyết.\n\nThuật toán APRIORI (thuật ngữ đứng sau kỹ thuật này) về bản chất duyệt qua các TẬP mặt hàng, tính support cho từng tập, giữ lại các tập có support đủ cao, rồi từ đó suy ra các luật có confidence đủ cao. Bài hôm nay cài đúng phần lõi — tính support và confidence cho MỘT cặp mặt hàng cho trước — phần "duyệt tự động mọi tập con" là mở rộng kỹ thuật, không thuộc phạm vi bài nhập môn này.\n\nLưu ý phải nhớ: confidence(A→B) CAO không có nghĩa A GÂY RA việc mua B — có thể cả hai cùng phổ biến độc lập (vd khách mua nhiều đồ cuối tuần hay mua cả bia lẫn đồ nướng, không phải bia "gây ra" mua đồ nướng). Tương quan không phải nhân quả — bài học lặp lại xuyên suốt học máy.',
    workedExample: {
      code: `# Tim luat ket hop tu danh sach gio hang
gio_hang = [
    {"bia", "banh"},
    {"bia", "trung"},
    {"banh", "bia", "sua"},
    {"trung", "sua"},
]

def support(mat_hang, gio_hang):
    dem = sum(1 for g in gio_hang if mat_hang.issubset(g))
    return dem / len(gio_hang)

sp_bia = support({"bia"}, gio_hang)
sp_banh = support({"banh"}, gio_hang)
sp_ca_hai = support({"bia", "banh"}, gio_hang)

print(f"Support(bia): {sp_bia}")
print(f"Support(banh): {sp_banh}")
print(f"Confidence(bia->banh): {sp_ca_hai / sp_bia}")`,
      stdinLines: [],
    },
    predict: {
      code: `gio_hang = [{"a", "b"}, {"a"}, {"a", "b", "c"}]\nsp = sum(1 for g in gio_hang if {"a", "b"}.issubset(g)) / len(gio_hang)\nprint(sp)`,
      question: 'Support({"a","b"}) trên 3 giỏ hàng này (2 giỏ có cả a và b) in ra bao nhiêu?',
      choices: ['0.6666666666666666', '1.0', '0.5', '2.0'],
      answerIndex: 0,
      explain:
        'Giỏ 1 {a,b} chứa cả a lẫn b, giỏ 2 {a} thiếu b, giỏ 3 {a,b,c} chứa cả a lẫn b — 2/3 giỏ thoả, support = 2/3 = 0.6666666666666666.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự: hàm support → support(A) và support(A,B) → tính confidence(A→B).',
      lines: [
        'def support(mat_hang, gio_hang):',
        '    dem = sum(1 for g in gio_hang if mat_hang.issubset(g))',
        '    return dem / len(gio_hang)',
        'sp_a = support({"bia"}, gio_hang)',
        'sp_ca_hai = support({"bia", "banh"}, gio_hang)',
        'confidence = sp_ca_hai / sp_a',
      ],
    },
    make: {
      prompt:
        'Tính support và confidence(A→B) từ danh sách giỏ hàng.\n\nChương trình đọc 3 dòng input():\n- Dòng 1: các giỏ hàng, mỗi giỏ là các mặt hàng cách nhau dấu phẩy, các giỏ cách nhau dấu chấm phẩy — vd "bia,banh;bia,trung".\n- Dòng 2: tên mặt hàng A.\n- Dòng 3: tên mặt hàng B.\n\nIn đúng 3 dòng:\nSupport(<A>): <giá trị>\nSupport(<B>): <giá trị>\nConfidence(<A>-><B>): <giá trị>',
      starterCode: `dong_gio_hang = input("Gio hang: ")\nmat_a = input("Mat hang A: ")\nmat_b = input("Mat hang B: ")\ngio_hang = [set(g.split(",")) for g in dong_gio_hang.split(";")]\n# Viet ham support(tap_mat_hang, gio_hang) roi tinh support A, support B, confidence A->B\n`,
      testCases: [
        {
          stdinLines: [
            'bia,banh;bia,trung;banh,bia,sua;trung,sua,ga;bia,banh,trung',
            'bia',
            'banh',
          ],
          expected:
            'Support(bia): 0.8\nSupport(banh): 0.6\nConfidence(bia->banh): 0.7499999999999999',
          match: 'contains',
          hidden: false,
          label: 'bia phổ biến (0.8), confidence bia->banh xấp xỉ 0.75',
        },
        {
          stdinLines: [
            'bia,banh;bia,trung;banh,bia,sua;trung,sua,ga;bia,banh,trung',
            'trung',
            'sua',
          ],
          expected: 'Confidence(trung->sua): 0.33333333333333337',
          match: 'contains',
          hidden: false,
          label: 'trung và sua ít đi cùng nhau hơn — confidence thấp hơn hẳn',
        },
        {
          stdinLines: ['bia,banh;bia,trung;banh,bia,sua;trung,sua,ga;bia,banh,trung', 'bia', 'ga'],
          expected: 'Confidence(bia->ga): 0.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: bia và ga KHÔNG BAO GIỜ đi cùng nhau — confidence 0.0',
        },
      ],
      hints: [
        'Chuyển mỗi giỏ hàng (chuỗi con cách nhau dấu phẩy) thành một set(...) — set.issubset(g) kiểm "tập mặt hàng này có nằm trong giỏ g không".',
        'support({mat_a}, gio_hang) đếm số giỏ chứa mat_a rồi chia tổng số giỏ; support({mat_a, mat_b}, gio_hang) đếm giỏ chứa CẢ HAI.',
        'confidence(A->B) = support(A và B) / support(A) — chia hai con số vừa tính, không phải đếm lại từ đầu.',
      ],
      sampleSolution: `dong_gio_hang = input("Gio hang: ")\nmat_a = input("Mat hang A: ")\nmat_b = input("Mat hang B: ")\ngio_hang = [set(g.split(",")) for g in dong_gio_hang.split(";")]\n\ndef support(mat_hang, gio_hang):\n    dem = sum(1 for g in gio_hang if mat_hang.issubset(g))\n    return dem / len(gio_hang)\n\nsp_a = support({mat_a}, gio_hang)\nsp_b = support({mat_b}, gio_hang)\nsp_ca_hai = support({mat_a, mat_b}, gio_hang)\nprint(f"Support({mat_a}): {sp_a}")\nprint(f"Support({mat_b}): {sp_b}")\nprint(f"Confidence({mat_a}->{mat_b}): {sp_ca_hai / sp_a}")`,
    },
    homework:
      'Ghi lại (hoặc tưởng tượng dựa trên thói quen thật) 8-10 "giỏ hàng" của chính bạn hoặc gia đình trong một tháng — mỗi lần đi chợ/siêu thị mua những gì. Chạy code bài Make trên dữ liệu đó với 2-3 cặp mặt hàng bạn nghi hay đi cùng nhau. Confidence có cao như bạn nghĩ không? Nêu 1 ví dụ confidence cao nhưng bạn không tin là quan hệ NHÂN QUẢ thật (chỉ là trùng hợp/cùng phổ biến).',
    srsCards: [
      {
        hoi: 'Support(X) và confidence(A→B) là gì?',
        dap: 'Support(X) = tỉ lệ giao dịch chứa tập mặt hàng X trong tổng số giao dịch (đo độ phổ biến). Confidence(A→B) = support(A và B) / support(A) — trong số giao dịch đã mua A, tỉ lệ cũng mua B.',
      },
      {
        hoi: 'Vì sao confidence(A→B) cao KHÔNG có nghĩa A gây ra việc mua B?',
        dap: 'Tương quan không phải nhân quả: A và B có thể cùng phổ biến vì một nguyên nhân chung khác (vd cùng hay được mua vào cuối tuần) chứ không phải mua A khiến người ta mua B — bài học lặp lại xuyên suốt học máy.',
      },
      {
        hoi: 'Thuật toán Apriori làm gì ở mức tổng quát?',
        dap: 'Duyệt qua các tập mặt hàng, tính support cho từng tập, giữ lại các tập có support đủ cao (đủ phổ biến), rồi từ đó suy ra các luật kết hợp có confidence đủ cao — bài hôm nay cài đúng phần lõi (support/confidence cho một cặp), không duyệt tự động mọi tập con.',
      },
    ],
  },
  {
    id: 'ml-u2-l5',
    unitId: 'ml-u2',
    language: 'python',
    title: 'DBSCAN — gom cụm theo mật độ, không cần biết trước số cụm',
    hook: 'K-means (bài 1) bắt bạn khai TRƯỚC số cụm k — nhưng nhiều bài toán thật (phát hiện ổ dịch trên bản đồ, phát hiện gian lận) bạn KHÔNG hề biết có bao nhiêu cụm, và cụm có thể hình dạng ngoằn ngoèo chứ không tròn đều. DBSCAN giải đúng bài toán đó: gom cụm theo MẬT ĐỘ, tự tìm ra số cụm.',
    theory:
      'DBSCAN (Density-Based Spatial Clustering) gom cụm dựa trên ý tưởng: một cụm là một VÙNG ĐÔNG ĐÚC các điểm, ngăn cách bởi vùng THƯA điểm. Hai tham số cần khai trước:\n- eps: bán kính "lân cận" quanh mỗi điểm.\n- min_pts: số điểm tối thiểu trong bán kính đó để coi là "đông đúc".\n\nMột điểm là ĐIỂM LÕI (core point) nếu trong bán kính eps quanh nó (TÍNH CẢ CHÍNH NÓ) có ÍT NHẤT min_pts điểm. Điểm lõi là "trung tâm" của một cụm — nhiều điểm lõi liền kề nhau (bán kính eps của điểm này chạm bán kính eps của điểm kia) được nối lại thành CÙNG một cụm, bất kể cụm đó cong hay thẳng, tròn hay dài. Điểm không phải điểm lõi và không nằm trong bán kính của điểm lõi nào bị coi là NHIỄU (noise) — không thuộc cụm nào cả.\n\nBài hôm nay chỉ cài bước nền tảng nhất: đếm hàng xóm trong bán kính eps của MỘT điểm, rồi kết luận điểm đó có phải điểm lõi hay không (bước tiếp theo — nối các điểm lõi liền kề thành cụm hoàn chỉnh — là mở rộng kỹ thuật, hiểu đúng "điểm lõi là gì" đã là phần khó nhất).\n\nCHỌN THUẬT TOÁN GOM CỤM NÀO — tổng kết chương:\n- Biết trước số cụm mong muốn, dữ liệu có xu hướng thành khối gần tròn đều, không nhiều nhiễu → K-MEANS (bài 1): nhanh, đơn giản, dễ diễn giải.\n- KHÔNG biết trước số cụm, dữ liệu có nhiễu hoặc cụm hình dạng bất kỳ (ngoằn ngoèo, lồng nhau) → DBSCAN: tự tìm số cụm, tự động gạt nhiễu ra ngoài, nhưng nhạy với cách chọn eps/min_pts.\nKhông có thuật toán nào "luôn tốt hơn" — chọn theo ĐẶC ĐIỂM dữ liệu và bài toán, đúng tinh thần "chống lỗi logic" của cả khoá: đọc kỹ dữ liệu trước khi chọn công cụ.',
    workedExample: {
      code: `# Dem hang xom trong ban kinh eps, xac dinh diem loi
diem = [(0, 0), (0, 1), (1, 0), (1, 1), (8, 8)]
eps = 1.5
min_pts = 4

for i, p in enumerate(diem):
    dem = 0
    for q in diem:
        kc = ((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2) ** 0.5   # tinh ca chinh no
        if kc <= eps:
            dem += 1
    ket_luan = "diem loi" if dem >= min_pts else "khong phai diem loi (co the la nhieu)"
    print(f"Diem {i} {p}: {dem} hang xom -> {ket_luan}")`,
      stdinLines: [],
    },
    predict: {
      code: `diem = (0, 0)\nhang_xom = [(0, 0), (0, 2), (3, 0)]\neps = 2.0\ndem = sum(1 for q in hang_xom if ((diem[0] - q[0]) ** 2 + (diem[1] - q[1]) ** 2) ** 0.5 <= eps)\nprint(dem)`,
      question:
        'Với eps=2.0, điểm (0,0) có bao nhiêu hàng xóm trong danh sách [(0,0), (0,2), (3,0)] (tính cả chính nó)?',
      choices: ['2', '3', '1', '0'],
      answerIndex: 0,
      explain:
        'Khoảng cách tới (0,0)=0 (chính nó, tính), tới (0,2)=2.0 (bằng eps, tính vì dùng <=), tới (3,0)=3.0 (lớn hơn eps, không tính) → đúng 2 hàng xóm.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự: duyệt từng điểm khác → tính khoảng cách → đếm nếu trong bán kính eps → kết luận điểm lõi.',
      lines: [
        'dem = 0',
        'for q in diem:',
        '    kc = ((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2) ** 0.5',
        '    if kc <= eps:',
        '        dem += 1',
        'ket_luan = "diem loi" if dem >= min_pts else "nhieu"',
      ],
    },
    make: {
      prompt:
        'Kiểm tra một điểm cho trước có phải điểm lõi DBSCAN hay không.\n\nChương trình đọc 4 dòng input():\n- Dòng 1: các điểm, dạng "x,y" cách nhau dấu ";", vd "0,0;0,1;1,0".\n- Dòng 2: eps (số thực, bán kính).\n- Dòng 3: min_pts (số nguyên).\n- Dòng 4: chỉ số (0-based) của điểm cần kiểm tra.\n\nĐếm số hàng xóm trong bán kính eps (TÍNH CẢ chính điểm đó, dùng <=). In đúng 2 dòng:\nSo hang xom: <số đếm được>\nLa diem loi (nếu số đếm >= min_pts) hoặc Khong la diem loi (nếu không)',
      starterCode: `diem_str = input("Cac diem: ")\neps = float(input("eps: "))\nmin_pts = int(input("min_pts: "))\nidx = int(input("Chi so diem kiem tra: "))\ndiem = [tuple(map(float, p.split(","))) for p in diem_str.split(";")]\np = diem[idx]\n# Dem hang xom trong ban kinh eps (tinh ca chinh no), roi ket luan diem loi hay khong\n`,
      testCases: [
        {
          stdinLines: ['0,0;0,1;1,0;1,1;8,8', '1.5', '4', '0'],
          expected: 'So hang xom: 4\nLa diem loi',
          match: 'contains',
          hidden: false,
          label: 'Điểm (0,0) nằm trong cụm 4 điểm gần nhau → là điểm lõi',
        },
        {
          stdinLines: ['0,0;0,1;1,0;1,1;8,8', '1.5', '4', '4'],
          expected: 'So hang xom: 1\nKhong la diem loi',
          match: 'contains',
          hidden: false,
          label: 'Điểm (8,8) tách biệt, chỉ có chính nó → nhiễu, không phải điểm lõi',
        },
        {
          stdinLines: ['0,0;0,1;1,0', '1.0', '3', '0'],
          expected: 'So hang xom: 3\nLa diem loi',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: khoảng cách ĐÚNG BẰNG eps (biên) vẫn tính là hàng xóm vì dùng <=',
        },
      ],
      hints: [
        'Điểm cần kiểm tra là diem[idx] — lấy trước khỏi vòng lặp cho gọn.',
        'Duyệt for q in diem (bao gồm cả chính p) tính khoảng cách Euclid, đếm những q có kc <= eps (chú ý <=, không phải <).',
        'So sánh cuối: if dem >= min_pts thì "La diem loi", ngược lại "Khong la diem loi".',
      ],
      sampleSolution: `diem_str = input("Cac diem: ")\neps = float(input("eps: "))\nmin_pts = int(input("min_pts: "))\nidx = int(input("Chi so diem kiem tra: "))\ndiem = [tuple(map(float, p.split(","))) for p in diem_str.split(";")]\np = diem[idx]\ndem = 0\nfor q in diem:\n    kc = ((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2) ** 0.5\n    if kc <= eps:\n        dem += 1\nprint(f"So hang xom: {dem}")\nprint("La diem loi" if dem >= min_pts else "Khong la diem loi")`,
    },
    homework:
      'So sánh k-means (bài 1) và DBSCAN (bài này) trên CÙNG một tình huống thật bạn nghĩ ra (vd: định vị GPS của xe giao hàng trong thành phố để tìm "điểm nóng" giao nhiều đơn). Trả lời: bạn có biết trước số "điểm nóng" không? Dữ liệu có khả năng có nhiễu (đơn giao lẻ tẻ, rải rác) không? Từ hai câu trả lời đó, thuật toán nào hợp hơn — dùng đúng bảng tổng kết cuối bài để lập luận, không đoán bừa.',
    srsCards: [
      {
        hoi: 'Điểm LÕI trong DBSCAN được định nghĩa thế nào?',
        dap: 'Một điểm là điểm lõi nếu trong bán kính eps quanh nó (tính cả chính nó) có ÍT NHẤT min_pts điểm khác. Điểm lõi là "trung tâm" của cụm; điểm không phải điểm lõi và không nằm trong bán kính của điểm lõi nào bị coi là nhiễu.',
      },
      {
        hoi: 'DBSCAN khác k-means ở hai điểm quan trọng nào?',
        dap: 'DBSCAN KHÔNG cần biết trước số cụm (tự tìm dựa trên mật độ) và tìm được cụm HÌNH DẠNG BẤT KỲ (không chỉ khối tròn đều như k-means); đổi lại nhạy với cách chọn tham số eps/min_pts.',
      },
      {
        hoi: 'Khi nào nên chọn k-means, khi nào nên chọn DBSCAN?',
        dap: 'K-means: biết trước số cụm mong muốn, dữ liệu có xu hướng thành khối gần tròn đều, ít nhiễu. DBSCAN: không biết trước số cụm, dữ liệu có nhiễu hoặc cụm hình dạng bất kỳ. Chọn theo đặc điểm dữ liệu, không có thuật toán nào luôn tốt hơn.',
      },
    ],
  },
]
