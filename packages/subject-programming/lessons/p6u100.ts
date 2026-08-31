// lessons/p6u100.ts — Unit p6-u100 "Review code AI sinh" của chặng principal-s4
// "Dẫn dắt & trách nhiệm" (giai đoạn P5 "Tầm trưởng", docs/specs/2026-08-31-dot-4-p5-tam-truong.md
// mục ③). Dạy KỸ NĂNG NGƯỜI: soát lại code do AI viết trước khi nhận, và đọc diff có kỷ luật
// theo thứ tự rủi ro thay vì đọc lan man từ trên xuống dưới.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6_U100_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u100-l1',
    unitId: 'p6-u100',
    language: 'python',
    title: 'Review code AI sinh — checklist 5 điểm',
    hook: 'AI viết xong một hàm trong 8 giây, nhìn "sạch sẽ" và chạy được ngay — nhưng chạy được không có nghĩa là ĐÚNG. Càng viết nhanh, người review càng phải có một checklist cố định trong đầu, thay vì tin vào cảm giác "nhìn ổn đấy".',
    theory:
      'Review code do AI sinh khác review code người viết ở một điểm: AI KHÔNG BAO GIỜ ngại viết — nó tự tin trình bày cả những đoạn sai hoàn toàn với giọng điệu y hệt đoạn đúng. Vì vậy người review cần một CHECKLIST CỐ ĐỊNH, không dựa cảm tính, đi qua đủ 5 điểm theo đúng thứ tự:\n\n1. ĐÚNG YÊU CẦU (dung_yeu_cau) — code có làm đúng cái đề bài hỏi, không lệch phạm vi, không tự thêm tính năng thừa?\n2. CA BIÊN (ca_bien) — rỗng, số 0, số âm, danh sách 1 phần tử, trùng lặp… có được xử lý không, hay chỉ chạy đúng với ví dụ "đẹp"?\n3. KHÔNG BỊA API (khong_bia_api) — mọi hàm/thư viện được gọi có THẬT SỰ tồn tại đúng chữ ký (tên hàm, tham số), hay AI "đoán" ra một API nghe hợp lý nhưng không có?\n4. BẢO MẬT (bao_mat) — có lộ secret/API key, có tin dữ liệu từ client mà không kiểm tra, có lỗi tiêm (injection)?\n5. CÓ TEST (co_test) — thay đổi này có được phủ bởi ít nhất một test, hay chỉ "chạy thử bằng mắt" một lần rồi thôi?\n\nBỎ SÓT một điểm không có nghĩa mục đó "chắc đúng" — nó chỉ đơn giản là CHƯA ĐƯỢC KIỂM. Kỷ luật của người dẫn dắt là luôn nói rõ mục nào đã kiểm, mục nào chưa, thay vì duyệt cho qua vì "trông ổn".',
    workedExample: {
      code: `# Checklist 5 diem, kiem theo dung thu tu
CHUAN = ["dung_yeu_cau", "ca_bien", "khong_bia_api", "bao_mat", "co_test"]

da_kiem = ["dung_yeu_cau", "bao_mat"]   # nguoi review moi tich duoc 2 muc

con_thieu = [m for m in CHUAN if m not in da_kiem]
for m in con_thieu:
    print(f"Chua kiem: {m}")           # con thieu -> in tung muc con thieu`,
      stdinLines: [],
    },
    predict: {
      code: `CHUAN = ["a", "b", "c"]\nda_kiem = ["a", "b", "c"]\ncon_thieu = [m for m in CHUAN if m not in da_kiem]\nprint("du" if not con_thieu else "thieu")`,
      question: 'Đã kiểm đủ cả 3 mục chuẩn ["a","b","c"] — máy in ra gì?',
      choices: ['du', 'thieu', 'Báo lỗi', 'Không in gì'],
      answerIndex: 0,
      explain:
        'con_thieu lọc ra các mục trong CHUAN mà KHÔNG có trong da_kiem — vì da_kiem đã chứa đủ "a","b","c" nên con_thieu là danh sách rỗng, `not []` là True nên in "du". Danh sách rỗng chính là tín hiệu "đã đủ".',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự: khai báo checklist chuẩn → lọc ra mục còn thiếu → in từng mục thiếu theo đúng thứ tự chuẩn.',
      lines: [
        'CHUAN = ["dung_yeu_cau", "ca_bien", "khong_bia_api", "bao_mat", "co_test"]',
        'da_kiem = input("Da kiem: ").split(",")',
        'con_thieu = [m for m in CHUAN if m not in da_kiem]',
        'for m in con_thieu:',
        '    print(f"Chua kiem: {m}")',
      ],
    },
    make: {
      prompt:
        'Viết máy chấm review đủ 5 mục checklist.\n\nChương trình đọc 1 dòng input(): danh sách mục ĐÃ KIỂM, cách nhau dấu phẩy, ví dụ "dung_yeu_cau,bao_mat".\n\nCó đúng 5 mục chuẩn theo THỨ TỰ: dung_yeu_cau, ca_bien, khong_bia_api, bao_mat, co_test.\n\nVới mỗi mục chuẩn CÒN THIẾU (không có trong dòng input), in một dòng "Chua kiem: <ten muc>" theo đúng thứ tự chuẩn ở trên. Nếu đủ cả 5 mục, in đúng 1 dòng "Review du 5 muc".',
      starterCode: `CHUAN = ["dung_yeu_cau", "ca_bien", "khong_bia_api", "bao_mat", "co_test"]\nda_kiem = input("Da kiem: ").split(",")\n# Loc CHUAN theo m khong nam trong da_kiem, in tung dong "Chua kiem: <m>"\n# Neu khong con thieu muc nao, in "Review du 5 muc"\n`,
      testCases: [
        {
          stdinLines: ['dung_yeu_cau,bao_mat'],
          expected: 'Chua kiem: ca_bien\nChua kiem: khong_bia_api\nChua kiem: co_test',
          match: 'contains',
          hidden: false,
          label: 'Kiểm 2/5 → in 3 mục còn thiếu theo đúng thứ tự chuẩn',
        },
        {
          stdinLines: ['dung_yeu_cau,ca_bien,khong_bia_api,bao_mat,co_test'],
          expected: 'Review du 5 muc',
          match: 'contains',
          hidden: false,
          label: 'Đủ cả 5 mục → in đúng câu chốt',
        },
        {
          stdinLines: ['co_test'],
          expected:
            'Chua kiem: dung_yeu_cau\nChua kiem: ca_bien\nChua kiem: khong_bia_api\nChua kiem: bao_mat',
          match: 'contains',
          hidden: false,
          label: 'Chỉ kiểm mục cuối → 4 mục đầu đều thiếu, đúng thứ tự chuẩn',
        },
        {
          stdinLines: ['bao_mat,co_test,ca_bien,dung_yeu_cau,khong_bia_api'],
          expected: 'Review du 5 muc',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đủ 5 mục nhưng liệt kê LỘN thứ tự trong input — vẫn tính là đủ',
        },
      ],
      hints: [
        'Tách chuỗi input bằng .split(","); mỗi phần tử là một mục đã kiểm — không quan tâm thứ tự trong dòng input.',
        'Dùng list comprehension: con_thieu = [m for m in CHUAN if m not in da_kiem] — CHUAN quyết định thứ tự in ra, không phải da_kiem.',
        'Nếu con_thieu rỗng thì in "Review du 5 muc"; ngược lại for m in con_thieu: print(f"Chua kiem: {m}").',
      ],
      sampleSolution: `CHUAN = ["dung_yeu_cau", "ca_bien", "khong_bia_api", "bao_mat", "co_test"]\nda_kiem = input("Da kiem: ").split(",")\ncon_thieu = [m for m in CHUAN if m not in da_kiem]\nif con_thieu:\n    for m in con_thieu:\n        print(f"Chua kiem: {m}")\nelse:\n    print("Review du 5 muc")`,
    },
    homework:
      'Lấy một đoạn code bất kỳ do AI sinh ra gần đây (của bạn hoặc đồng nghiệp) — có thể là một PR thật, một hàm trong bài tập trước. Tự chấm nó qua đủ 5 mục checklist, ghi lại kết quả từng mục kèm 1 câu lý do. Mục nào bạn thấy khó chấm nhất, vì sao?',
    srsCards: [
      {
        hoi: 'Checklist review code AI sinh có đúng 5 mục nào?',
        dap: 'Đúng yêu cầu · ca biên · không bịa API · bảo mật · có test — kiểm theo thứ tự cố định, không dựa cảm tính.',
      },
      {
        hoi: 'Vì sao review code AI cần checklist cố định hơn review code người?',
        dap: 'AI không ngại viết — nó trình bày cả đoạn sai hoàn toàn với giọng tự tin y hệt đoạn đúng, nên "nhìn ổn" không đủ làm căn cứ tin cậy.',
      },
      {
        hoi: '"Bịa API" trong checklist nghĩa là gì?',
        dap: 'AI gọi một hàm/thư viện KHÔNG THẬT SỰ TỒN TẠI đúng chữ ký (tên, tham số) — nghe hợp lý nhưng là tưởng tượng, chỉ lộ ra khi chạy hoặc tra tài liệu thật.',
      },
    ],
  },
  {
    id: 'p6-u100-l2',
    unitId: 'p6-u100',
    language: 'python',
    title: 'Đọc diff theo thứ tự rủi ro',
    hook: 'Một diff 200 dòng, bạn chỉ có 5 phút. Đọc từ trên xuống dưới là cách chắc chắn bỏ sót thứ quan trọng nhất — vì file được sắp theo alphabet, không theo mức nguy hiểm. Người dẫn dắt đọc diff theo MỘT thứ tự cố định: rủi ro cao nhất trước.',
    theory:
      'Khi thời gian review có hạn, thứ tự ĐỌC quan trọng ngang thứ tự SỬA. Bốn loại phát hiện trong một diff, xếp theo mức rủi ro giảm dần:\n\n1. BẢO MẬT (bao_mat) — lộ secret, tiêm SQL, không kiểm quyền. Rủi ro: dữ liệu người dùng thật bị lộ hoặc mất, không thể "sửa sau".\n2. ĐÚNG ĐẮN (dung_dan) — logic sai, thiếu kiểm tra null, off-by-one. Rủi ro: tính năng chạy sai, có thể âm thầm sai trong thời gian dài trước khi bị phát hiện.\n3. HIỆU NĂNG (hieu_nang) — vòng lặp thừa, truy vấn N+1. Rủi ro: chậm dần theo tải, thường có thời gian xử lý (không cấp bách bằng hai loại trên).\n4. PHONG CÁCH (phong_cach) — tên biến không rõ, thiếu comment. Rủi ro: khó đọc, khó bảo trì — thật nhưng không gây sự cố ngay.\n\nLuật xếp: bảo mật trước đúng đắn trước hiệu năng trước phong cách. Nếu không nói trước thứ tự này, người review dễ sa vào sửa lỗi phong cách (dễ thấy, dễ chỉ ra) trong khi một lỗ hổng bảo mật nằm im ở dòng thứ 150. Kỷ luật đọc diff là quét bảo mật và đúng đắn TRƯỚC, rồi mới tới hai loại còn lại nếu còn thời gian.',
    workedExample: {
      code: `# Sap phat hien theo thu tu rui ro: bao_mat > dung_dan > hieu_nang > phong_cach
UU_TIEN = {"bao_mat": 0, "dung_dan": 1, "hieu_nang": 2, "phong_cach": 3}

phat_hien = [
    ("phong_cach", "ten bien khong ro"),
    ("bao_mat", "lo API key"),
    ("dung_dan", "thieu kiem tra null"),
]

sap_xep = sorted(phat_hien, key=lambda x: UU_TIEN[x[0]])
for loai, mota in sap_xep:
    print(f"{loai}: {mota}")           # bao_mat in truoc, phong_cach in cuoi`,
      stdinLines: [],
    },
    predict: {
      code: `UU_TIEN = {"bao_mat": 0, "dung_dan": 1, "hieu_nang": 2, "phong_cach": 3}\nphat_hien = [("hieu_nang", "cham"), ("bao_mat", "lo key")]\nsap_xep = sorted(phat_hien, key=lambda x: UU_TIEN[x[0]])\nprint(sap_xep[0][0])`,
      question:
        'Danh sách có "hieu_nang" đứng trước "bao_mat". Sau khi sắp theo rủi ro, phần tử ĐẦU TIÊN thuộc loại gì?',
      choices: ['bao_mat', 'hieu_nang', 'dung_dan', 'phong_cach'],
      answerIndex: 0,
      explain:
        'sorted() theo key UU_TIEN sắp lại toàn bộ danh sách bất kể thứ tự gốc — bao_mat có ưu tiên 0 (thấp nhất), nên luôn lên đầu dù trong dữ liệu gốc nó đứng sau hieu_nang.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự: khai báo bảng ưu tiên → tách từng phát hiện thành (loại, mô tả) → sắp theo ưu tiên → in kết quả.',
      lines: [
        'UU_TIEN = {"bao_mat": 0, "dung_dan": 1, "hieu_nang": 2, "phong_cach": 3}',
        'loai, mota = m.split(":", 1)',
        'danh_sach.append((loai, mota))',
        'sap_xep = sorted(danh_sach, key=lambda x: UU_TIEN[x[0]])',
        'print(f"{loai}: {mota}")',
      ],
    },
    make: {
      prompt:
        'Viết máy sắp danh sách phát hiện trong diff theo thứ tự rủi ro.\n\nChương trình đọc 1 dòng input(): danh sách phát hiện dạng "loai:mota", các phát hiện cách nhau dấu chấm phẩy — loai là một trong 4 giá trị "bao_mat", "dung_dan", "hieu_nang", "phong_cach". Ví dụ: "phong_cach:ten bien khong ro;bao_mat:lo API key;dung_dan:thieu kiem tra null".\n\nIn lại các phát hiện đã SẮP XẾP theo thứ tự ưu tiên rủi ro: bao_mat trước, rồi dung_dan, rồi hieu_nang, rồi phong_cach. Trong CÙNG một loại, giữ nguyên thứ tự xuất hiện gốc (sắp xếp ổn định). Mỗi dòng in "<loai>: <mota>".',
      starterCode: `UU_TIEN = {"bao_mat": 0, "dung_dan": 1, "hieu_nang": 2, "phong_cach": 3}\ndong = input("Phat hien: ")\n# Tach dong theo dau cham phay, roi tach tung phan theo dau ":" (chi lan dau)\n# thanh (loai, mota); sap theo UU_TIEN[loai], in tung dong "<loai>: <mota>"\n`,
      testCases: [
        {
          stdinLines: [
            'phong_cach:ten bien khong ro;bao_mat:lo API key;dung_dan:thieu kiem tra null',
          ],
          expected:
            'bao_mat: lo API key\ndung_dan: thieu kiem tra null\nphong_cach: ten bien khong ro',
          match: 'contains',
          hidden: false,
          label: '3 phát hiện xáo trộn → sắp lại đúng thứ tự rủi ro',
        },
        {
          stdinLines: ['hieu_nang:vong lap thua;bao_mat:tiem SQL'],
          expected: 'bao_mat: tiem SQL\nhieu_nang: vong lap thua',
          match: 'contains',
          hidden: false,
          label: 'bao_mat luôn lên trước hieu_nang dù đứng sau trong input',
        },
        {
          stdinLines: ['dung_dan:thieu ca bien'],
          expected: 'dung_dan: thieu ca bien',
          match: 'contains',
          hidden: false,
          label: 'Chỉ 1 phát hiện → giữ nguyên, không lỗi',
        },
        {
          stdinLines: ['phong_cach:thieu comment;phong_cach:ten bien x;bao_mat:lo secret'],
          expected: 'bao_mat: lo secret\nphong_cach: thieu comment\nphong_cach: ten bien x',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: 2 phát hiện cùng loại phong_cach — GIỮ NGUYÊN thứ tự gốc giữa chúng (sort ổn định)',
        },
      ],
      hints: [
        'Tách theo dấu chấm phẩy trước: dong.split(";") ra danh sách các mục "loai:mota".',
        'Với mỗi mục, tách theo dấu hai chấm CHỈ LẦN ĐẦU: loai, mota = m.split(":", 1) — mota có thể còn dấu ":" bên trong.',
        'sorted(danh_sach, key=lambda x: UU_TIEN[x[0]]) — sorted() của Python vốn ỔN ĐỊNH, hai phần tử cùng loại giữ nguyên thứ tự tương đối gốc.',
      ],
      sampleSolution: `UU_TIEN = {"bao_mat": 0, "dung_dan": 1, "hieu_nang": 2, "phong_cach": 3}\ndong = input("Phat hien: ")\nmuc = dong.split(";")\ndanh_sach = []\nfor m in muc:\n    loai, mota = m.split(":", 1)\n    danh_sach.append((loai, mota))\nsap_xep = sorted(danh_sach, key=lambda x: UU_TIEN[x[0]])\nfor loai, mota in sap_xep:\n    print(f"{loai}: {mota}")`,
    },
    homework:
      'Mở một PR/diff thật (của bạn, hoặc bất kỳ PR mở nào trên GitHub bạn có quyền xem). Liệt kê mọi thay đổi bạn thấy đáng chú ý, phân vào 4 loại (bảo mật/đúng đắn/hiệu năng/phong cách), rồi sắp theo đúng thứ tự rủi ro. Bạn có đọc khác thứ tự này trước khi học bài không — nếu có, mục nào đáng lẽ phải lên trước?',
    srsCards: [
      {
        hoi: 'Thứ tự ưu tiên đọc diff theo rủi ro là gì?',
        dap: 'Bảo mật > đúng đắn > hiệu năng > phong cách — quét hai loại đầu trước vì hậu quả nặng và khó hoàn tác nhất, phong cách xếp cuối vì không gây sự cố ngay.',
      },
      {
        hoi: 'Vì sao không nên đọc diff tuần tự từ trên xuống dưới khi thời gian có hạn?',
        dap: 'File thường sắp theo alphabet/vị trí, không theo mức nguy hiểm — đọc tuần tự dễ dừng lại ở lỗi phong cách dễ thấy trong khi lỗ hổng bảo mật nằm im ở dòng sau chưa kịp đọc tới.',
      },
      {
        hoi: 'Vì sao lỗi bảo mật xếp rủi ro cao hơn lỗi đúng đắn?',
        dap: 'Lỗi đúng đắn thường sửa được khi phát hiện; lỗi bảo mật (lộ secret, tiêm SQL) có thể gây thiệt hại KHÔNG HOÀN TÁC được ngay khi khai thác — dữ liệu đã lộ thì không "sửa lại" được.',
      },
    ],
  },
]
