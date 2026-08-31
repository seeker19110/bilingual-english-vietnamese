// lessons/p6u98.ts — Unit p6-u98 "ADR & build-vs-buy" của chặng principal-s3 "Quyết định
// kiến trúc AI bằng ADR" (P5 "Tầm trưởng", docs/specs/2026-08-31-dot-4-p5-tam-truong.md mục ③).
//
// unitId 'p6-u98' thuộc bậc P6 chuẩn (curriculum.ts phải khai unit này — việc của phiên chính,
// không phải file này).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6_U98_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u98-l1',
    unitId: 'p6-u98',
    language: 'python',
    title: 'ADR là gì — ghi lại quyết định trước khi ai đó quên vì sao',
    hook: 'Sáu tháng sau, đồng nghiệp hỏi: "Sao hồi đó mình chọn RAG mà không fine-tune?" — và không ai nhớ nổi, kể cả người đã quyết định. Lý do lúc đó rất hợp lý, nhưng nó chỉ tồn tại trong đầu một người, đúng một buổi họp. ADR là cách khoá lại lý do đó vào một file, để sáu tháng sau ai đọc cũng hiểu.',
    theory:
      'ADR (Architecture Decision Record) = một file NGẮN ghi lại MỘT quyết định kiến trúc, theo khuôn 5 phần cố định:\n1. BOI_CANH (context) — vấn đề gì đang cần giải quyết, ràng buộc nào đang có (ngân sách, thời gian, đội ngũ).\n2. LUA_CHON (options) — các phương án đã cân nhắc, không chỉ phương án được chọn.\n3. QUYET_DINH (decision) — chọn phương án nào, nói thẳng một câu.\n4. DANH_DOI (tradeoffs) — cái được và cái mất khi chọn phương án đó, so với các phương án còn lại.\n5. HE_QUA (consequences) — ảnh hưởng về sau: phải làm gì tiếp, rủi ro nào phải theo dõi, khi nào nên xét lại.\n\nVì sao phải ghi ĐỦ 5 phần, không chỉ ghi "đã chọn X": nếu chỉ ghi quyết định mà bỏ bối cảnh và lựa chọn đã cân nhắc, người đọc sau không biết đã có phương án nào bị loại và vì sao — dễ lặp lại đúng cuộc tranh luận cũ, hoặc tệ hơn, âm thầm đảo ngược một quyết định từng có lý do vững mà không ai biết lý do đó là gì.\n\nADR không cần dài — một quyết định quan trọng viết trong nửa trang là đủ. Cái cần là ĐỦ 5 PHẦN, không phải nhiều chữ.',
    workedExample: {
      code: `# Kiem tra mot ADR (dang danh sach cac phan da co) co du 5 phan chuan khong
chuan = ["boi_canh", "lua_chon", "quyet_dinh", "danh_doi", "he_qua"]
da_co = ["boi_canh", "quyet_dinh"]   # ADR nay moi viet 2 trong 5 phan

for phan in chuan:              # duyet theo DUNG THU TU chuan
    if phan not in da_co:       # phan nay chua co trong ADR
        print(f"Thieu: {phan}")`,
      stdinLines: [],
    },
    predict: {
      code: `chuan = ["boi_canh", "lua_chon", "quyet_dinh", "danh_doi", "he_qua"]\nda_co = ["lua_chon", "he_qua", "quyet_dinh"]\nfor phan in chuan:\n    if phan not in da_co:\n        print(f"Thieu: {phan}")`,
      question: 'ADR đã có "lua_chon", "he_qua", "quyet_dinh". Chương trình in ra gì?',
      choices: [
        'Thieu: boi_canh\nThieu: danh_doi',
        'Thieu: danh_doi\nThieu: boi_canh',
        'Du 5 phan',
        'Thieu: lua_chon',
      ],
      answerIndex: 0,
      explain:
        'Duyệt "chuan" theo đúng thứ tự cố định của nó: boi_canh (thiếu, vì không có trong da_co) → lua_chon (có, bỏ qua) → quyet_dinh (có, bỏ qua) → danh_doi (thiếu) → he_qua (có, bỏ qua). Kết quả in đúng thứ tự chuẩn: "Thieu: boi_canh" rồi "Thieu: danh_doi" — không phải thứ tự trong da_co.',
    },
    parsons: {
      prompt:
        'Xếp đúng vòng lặp kiểm ADR: duyệt 5 phần chuẩn theo thứ tự → phần nào chưa có thì báo thiếu.',
      lines: [
        'chuan = ["boi_canh", "lua_chon", "quyet_dinh", "danh_doi", "he_qua"]',
        'for phan in chuan:',
        '    if phan not in da_co:',
        '        print(f"Thieu: {phan}")',
      ],
    },
    make: {
      prompt:
        'Viết máy kiểm ADR đủ 5 phần chuẩn chưa.\n\nChương trình đọc 1 dòng input(): danh sách các phần ĐÃ CÓ trong ADR, cách nhau dấu phẩy (vd "boi_canh,quyet_dinh,he_qua").\n\nSo với 5 phần chuẩn theo ĐÚNG thứ tự: "boi_canh", "lua_chon", "quyet_dinh", "danh_doi", "he_qua".\n\nDuyệt theo thứ tự chuẩn, phần nào KHÔNG có trong input thì in "Thieu: <ten phan>" (mỗi phần thiếu một dòng, đúng thứ tự chuẩn). Nếu input đã có đủ cả 5 phần thì in đúng 1 dòng "Du 5 phan".',
      starterCode: `da_co = input("Cac phan da co: ").split(",")\nchuan = ["boi_canh", "lua_chon", "quyet_dinh", "danh_doi", "he_qua"]\n# Duyet chuan theo dung thu tu, phan nao khong trong da_co thi in Thieu: <ten>\n# Neu khong thieu phan nao thi in Du 5 phan\n`,
      testCases: [
        {
          stdinLines: ['boi_canh,quyet_dinh,he_qua'],
          expected: 'Thieu: lua_chon\nThieu: danh_doi',
          match: 'contains',
          hidden: false,
          label: 'Thiếu lua_chon và danh_doi, đúng thứ tự chuẩn',
        },
        {
          stdinLines: ['boi_canh,lua_chon,quyet_dinh,danh_doi,he_qua'],
          expected: 'Du 5 phan',
          match: 'contains',
          hidden: false,
          label: 'Đủ cả 5 phần → báo đủ',
        },
        {
          stdinLines: ['danh_doi'],
          expected: 'Thieu: boi_canh\nThieu: lua_chon\nThieu: quyet_dinh\nThieu: he_qua',
          match: 'contains',
          hidden: false,
          label: 'Chỉ có 1 phần → thiếu 4 phần còn lại, đúng thứ tự chuẩn',
        },
        {
          stdinLines: ['he_qua,boi_canh,quyet_dinh,lua_chon,danh_doi'],
          expected: 'Du 5 phan',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: input đủ 5 phần nhưng ĐẢO thứ tự — vẫn phải nhận là đủ',
        },
      ],
      hints: [
        'Tách input bằng .split(",") ra list các phần đã có; danh sách 5 phần chuẩn ghi cố định theo đúng thứ tự đề bài.',
        'Duyệt for phan in chuan (không phải duyệt da_co) để phần thiếu luôn in ra đúng thứ tự chuẩn, không phụ thuộc thứ tự input.',
        'Dùng một biến đếm (hoặc list) số phần thiếu: nếu sau vòng lặp không có gì bị in "Thieu:" thì in "Du 5 phan" — cách gọn là đếm len(chuan) - len(da_co đã lọc trùng) hoặc dùng cờ boolean.',
      ],
      sampleSolution: `da_co = input("Cac phan da co: ").split(",")\nchuan = ["boi_canh", "lua_chon", "quyet_dinh", "danh_doi", "he_qua"]\nthieu_gi = False\nfor phan in chuan:\n    if phan not in da_co:\n        print(f"Thieu: {phan}")\n        thieu_gi = True\nif not thieu_gi:\n    print("Du 5 phan")`,
    },
    homework:
      'Tìm một quyết định kỹ thuật thật bạn (hoặc nhóm bạn) đã làm gần đây mà KHÔNG hề ghi lại lý do (đổi thư viện, đổi cách lưu dữ liệu, đổi model AI...). Thử viết lại nó thành ADR đủ 5 phần. Phần nào khó viết nhất — có phải vì lúc quyết định bạn thực ra chưa cân nhắc kỹ phương án khác?',
    srsCards: [
      {
        hoi: 'ADR gồm đủ 5 phần nào, theo đúng thứ tự?',
        dap: 'Bối cảnh (vấn đề, ràng buộc) → lựa chọn (các phương án đã cân nhắc) → quyết định (chọn gì) → đánh đổi (được/mất so với phương án khác) → hệ quả (ảnh hưởng về sau, khi nào xét lại).',
      },
      {
        hoi: 'Vì sao ADR phải ghi cả phương án KHÔNG được chọn, không chỉ ghi quyết định cuối?',
        dap: 'Nếu chỉ ghi kết quả, người đọc sau không biết đã có phương án nào bị loại và vì sao — dễ lặp lại tranh luận cũ hoặc âm thầm đảo ngược một quyết định từng có lý do vững.',
      },
      {
        hoi: 'ADR cần dài bao nhiêu?',
        dap: 'Không cần dài — nửa trang là đủ cho một quyết định quan trọng. Điều bắt buộc là ĐỦ 5 phần chuẩn, không phải số chữ nhiều.',
      },
    ],
  },
  {
    id: 'p6-u98-l2',
    unitId: 'p6-u98',
    language: 'python',
    title: 'Build vs buy bằng số — điểm hoà vốn',
    hook: 'Tự host một model AI tốn tiền server cố định hàng tháng, gần như không tốn thêm khi có thêm lượt gọi. Thuê API thì không tốn phí cố định, nhưng mỗi lượt gọi đều mất tiền. Ai rẻ hơn? Câu trả lời không phải "cái này luôn rẻ hơn cái kia" — nó phụ thuộc bạn gọi BAO NHIÊU LƯỢT một tháng, và có một con số chính xác nơi hai đường chi phí cắt nhau.',
    theory:
      'BUILD VS BUY là một trong những quyết định kiến trúc lặp lại nhiều nhất khi làm hệ AI: tự vận hành hạ tầng (build) hay thuê dịch vụ theo lượt (buy)?\n\nMô hình chi phí đơn giản hoá hai bên:\n- TỰ VẬN HÀNH: chi phí CỐ ĐỊNH hàng tháng (server, vận hành) cộng chi phí BIẾN ĐỔI rất nhỏ mỗi lượt gọi. Tổng = co_dinh + bien_doi * so_luot.\n- THUÊ API: không có phí cố định, chỉ trả theo lượt. Tổng = gia_thue * so_luot.\n\nHai đường chi phí đều là hàm bậc nhất theo số lượt — chúng CẮT NHAU tại đúng một điểm, gọi là ĐIỂM HOÀ VỐN (break-even point): số lượt/tháng mà tại đó chi phí hai bên bằng nhau. Dưới điểm đó, buy rẻ hơn (chưa đủ lượt để bù phí cố định); trên điểm đó, build rẻ hơn (phí cố định đã được san đều ra nhiều lượt).\n\nGiải phương trình co_dinh + bien_doi * n = gia_thue * n để tìm n:\nn = co_dinh / (gia_thue − bien_doi)\n\nVì số lượt phải là số nguyên và ta cần điểm mà tại đó build KHÔNG CÒN LỖ (bằng hoặc rẻ hơn buy), làm tròn LÊN (`math.ceil`) — làm tròn xuống có thể cho ra điểm mà build vẫn còn đắt hơn buy một chút.\n\nĐây chỉ là mô hình khởi điểm: thực tế còn phải tính thời gian đội ngũ vận hành, rủi ro downtime, tốc độ scale — nhưng có con số hoà vốn là bước đầu tiên để tranh luận không còn dựa trên cảm tính.',
    workedExample: {
      code: `import math

# Tu van hanh: 2,000,000 dong/thang co dinh + 50 dong/luot
co_dinh = 2_000_000
bien_doi = 50
# Thue API: 150 dong/luot, khong phi co dinh
gia_thue = 150

hoa_von = math.ceil(co_dinh / (gia_thue - bien_doi))
print(f"Hoa von: {hoa_von} luot/thang")

# Kiem tra tai diem hoa von: hai chi phi phai xap xi bang nhau
chi_phi_tu_van_hanh = co_dinh + bien_doi * hoa_von
chi_phi_thue = gia_thue * hoa_von
print(f"Tu van hanh: {chi_phi_tu_van_hanh}, Thue: {chi_phi_thue}")`,
      stdinLines: [],
    },
    predict: {
      code: `import math\nco_dinh = 1_000_000\nbien_doi = 0\ngia_thue = 100\nhoa_von = math.ceil(co_dinh / (gia_thue - bien_doi))\nprint(hoa_von)`,
      question:
        'Chi phí cố định 1 triệu/tháng, chi phí biến đổi 0, giá thuê 100đ/lượt. Điểm hoà vốn in ra bao nhiêu?',
      choices: ['10000', '100000', '5000', '20000'],
      answerIndex: 0,
      explain:
        '1_000_000 / (100 - 0) = 10000.0 chẵn, math.ceil(10000.0) = 10000. Từ lượt 10.000/tháng trở lên, tự vận hành rẻ hơn hoặc bằng thuê API.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự tính điểm hoà vốn: import math → tính hoà vốn bằng công thức → in kết quả.',
      lines: [
        'import math',
        'co_dinh = 2_000_000',
        'bien_doi = 50',
        'gia_thue = 150',
        'hoa_von = math.ceil(co_dinh / (gia_thue - bien_doi))',
        'print(f"Hoa von: {hoa_von} luot/thang")',
      ],
    },
    make: {
      prompt:
        'Viết máy tính điểm hoà vốn build-vs-buy.\n\nChương trình đọc 3 dòng input():\n- Dòng 1: chi phí cố định tự vận hành (VNĐ/tháng, số nguyên).\n- Dòng 2: chi phí biến đổi tự vận hành mỗi lượt (VNĐ, số thực — có thể là 0).\n- Dòng 3: giá thuê API mỗi lượt (VNĐ, số thực).\n\nTính điểm hoà vốn = chi_phi_co_dinh / (gia_thue − chi_phi_bien_doi), làm tròn LÊN bằng math.ceil. In đúng 1 dòng:\nHoa von: <so nguyen> luot/thang\n\n(Đề luôn cho gia_thue > chi_phi_bien_doi, không cần xử lý chia cho 0/âm.)',
      starterCode: `import math\n\nco_dinh = int(input("Chi phi co dinh: "))\nbien_doi = float(input("Chi phi bien doi moi luot: "))\ngia_thue = float(input("Gia thue moi luot: "))\n# Tinh hoa_von = co_dinh / (gia_thue - bien_doi), lam tron LEN bang math.ceil, roi in ket qua\n`,
      testCases: [
        {
          stdinLines: ['2000000', '50', '150'],
          expected: 'Hoa von: 20000 luot/thang',
          match: 'contains',
          hidden: false,
          label: 'Cố định 2 triệu, biến đổi 50đ, thuê 150đ → hoà vốn 20.000 lượt',
        },
        {
          stdinLines: ['1000000', '0', '100'],
          expected: 'Hoa von: 10000 luot/thang',
          match: 'contains',
          hidden: false,
          label: 'Chi phí biến đổi bằng 0 → hoà vốn 10.000 lượt',
        },
        {
          stdinLines: ['500000', '10', '35'],
          expected: 'Hoa von: 20000 luot/thang',
          match: 'contains',
          hidden: false,
          label: '500000 / 25 = 20000.0 tròn chẵn',
        },
        {
          stdinLines: ['300000', '10', '40'],
          expected: 'Hoa von: 10000 luot/thang',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 300000 / 30 = 10000.0 tròn chẵn, kiểm math.ceil không cộng dư thừa',
        },
      ],
      hints: [
        'Đọc đúng kiểu: co_dinh là int(), bien_doi và gia_thue là float() vì đề nói "số thực".',
        'Công thức: hoa_von = co_dinh / (gia_thue - bien_doi) — kết quả là số thực, cần math.ceil(...) để làm tròn lên thành số nguyên.',
        'Nhớ import math ở đầu file. In: print(f"Hoa von: {hoa_von} luot/thang") với hoa_von đã là int sau math.ceil.',
      ],
      sampleSolution: `import math\n\nco_dinh = int(input("Chi phi co dinh: "))\nbien_doi = float(input("Chi phi bien doi moi luot: "))\ngia_thue = float(input("Gia thue moi luot: "))\nhoa_von = math.ceil(co_dinh / (gia_thue - bien_doi))\nprint(f"Hoa von: {hoa_von} luot/thang")`,
    },
    homework:
      'Lấy một hệ AI thật bạn đang làm (hoặc dự định làm): ước lượng chi phí cố định nếu tự host model, chi phí biến đổi mỗi lượt, và giá thuê API tương đương. Tính điểm hoà vốn. Lượng dùng THỰC TẾ của bạn hiện đang ở dưới hay trên điểm đó? Viết 1 ADR ngắn (theo khuôn bài l1) cho quyết định build hay buy của chính dự án bạn.',
    srsCards: [
      {
        hoi: 'Công thức tính điểm hoà vốn build-vs-buy là gì?',
        dap: 'hoa_von = chi_phi_co_dinh / (gia_thue − chi_phi_bien_doi), làm tròn LÊN. Dưới điểm này thuê API rẻ hơn, trên điểm này tự vận hành rẻ hơn.',
      },
      {
        hoi: 'Vì sao điểm hoà vốn phải làm tròn LÊN (math.ceil) chứ không làm tròn xuống?',
        dap: 'Làm tròn xuống có thể cho ra một số lượt mà tại đó chi phí tự vận hành vẫn còn CAO HƠN thuê API một chút — làm tròn lên đảm bảo từ điểm đó trở đi build chắc chắn đã rẻ bằng hoặc rẻ hơn buy.',
      },
      {
        hoi: 'Mô hình chi phí đơn giản của "tự vận hành" và "thuê API" khác nhau ở đâu?',
        dap: 'Tự vận hành: có phí CỐ ĐỊNH hàng tháng + phí biến đổi nhỏ mỗi lượt. Thuê API: không phí cố định, chỉ trả theo lượt — phí biến đổi cao hơn hẳn để bù việc không đầu tư hạ tầng.',
      },
    ],
  },
]
