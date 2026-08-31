// lessons/vibeu3.ts — Chương C3 "Từ bản nháp đến sản phẩm" của khoá "Vibe Code — từ số 0
// đến chuyên gia" (đặc tả docs/specs/2026-08-31-khoa-vibe-code.md §③b).
//
// unitId 'vibe-u3' là unit ảo (xem lessons/vibeu1.ts đầu file cho lời giải thích đầy đủ).
// Bốn bài bám đúng bảng C3 của đề cương §③b.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const VIBE_U3_LESSONS: ProgrammingLesson[] = [
  {
    id: 'vibe-u3-l1',
    unitId: 'vibe-u3',
    language: 'vibe',
    title: 'trienkhai — cổng chỉ mở khi test xanh',
    hook: 'Bấm "chia sẻ" một bản nháp và bấm "đưa lên cho người thật dùng" là hai việc khác nhau hoàn toàn — dù chỉ cách nhau một cú click. Bài này dựng cánh cổng ngăn hai việc đó lẫn vào nhau.',
    theory:
      'Lệnh trienkhai đưa dự án lên "sản phẩm sống" — người khác dùng được, không chỉ mình bạn xem. Đây là hành động RỦI RO CAO NHẤT trong toàn bộ vòng đời vibe code: mọi tính năng chưa kiểm chứng giờ chạm tới người dùng thật.\n\nLuật cứng: trienkhai đòi test phải "xanh" — nghĩa là kiemtra đã chạy SAU LẦN nhan cuối cùng và không còn tính năng nào đỏ. Test "chua-chay" (chưa kiểm lần nào) hoặc "do" (còn lỗi) đều bị chặn, không thương lượng.\n\nĐiểm dễ quên: nhận THÊM một tính năng sau khi đã kiemtra xanh sẽ đưa test về "chua-chay" lại (đã học ở bài kiemtra) — nghĩa là PHẢI kiểm lại trước khi triển khai lần nữa. "Lúc nãy mới kiểm mà" không phải lý do hợp lệ nếu giữa hai lần đó bạn đã nhan thêm gì.\n\nTư duy đúng: deploy không phải là "khoe cho xong việc" — đó là trách nhiệm. Cổng kiểm tra tồn tại để bảo vệ người dùng của bạn, không phải để làm khó bạn.',
    workedExample: {
      code: `mota "them may tinh chia tien an trua: nhap tong tien va so nguoi, ra tien moi nguoi, bao loi khi so nguoi bang 0"
xemdiff v1
nhan v1
kiemtra
trienkhai`,
      stdinLines: [],
    },
    predict: {
      code: `nhan v1
trienkhai`,
      question: 'Bạn vừa nhan v1 xong (chưa kiemtra lần nào) — trienkhai ngay cho kết quả gì?',
      choices: [
        'Tu choi vi test dang "chua-chay"',
        'Trien khai thanh cong, tu dong kiem truoc',
        'Bao loi khong co gi de trien khai',
        'Trien khai nhung canh bao rui ro',
      ],
      answerIndex: 0,
      explain:
        'trienkhai không tự chạy kiemtra hộ bạn — nó chỉ ĐÒI test đã xanh. Vừa nhan xong mà chưa kiểm thì test đang "chua-chay", bị chặn thẳng. Đây là cổng cứng, không phải gợi ý.',
    },
    parsons: {
      prompt: 'Xếp đúng chuỗi trước khi đưa sản phẩm lên: nhận → kiểm tra xanh → triển khai.',
      lines: ['nhan v1', 'kiemtra', 'trienkhai'],
    },
    make: {
      prompt:
        'Tính năng "máy tính chia tiền" đã nhận vào dự án (đề dựng sẵn cảnh, chưa kiểm).\n\n1. Kiểm tra cho xanh.\n2. Đưa dự án lên sản phẩm sống.',
      starterCode: `# 1. kiem tra truoc\n\n# 2. trien khai\n`,
      testCases: [
        {
          stdinLines: [
            'mota "them may tinh chia tien an trua: nhap tong tien va so nguoi, ra tien moi nguoi, bao loi khi so nguoi bang 0"',
            'xemdiff v1',
            'nhan v1',
          ],
          expected: 'Da trien khai',
          match: 'contains',
          hidden: false,
          label: 'Triển khai thành công sau khi kiểm tra xanh',
        },
      ],
      hints: [
        'Hai lệnh, đúng thứ tự: kiemtra rồi trienkhai. Đảo thứ tự sẽ bị chặn.',
        'kiemtra không cần tham số; trienkhai cũng vậy.',
        'Gõ: kiemtra rồi dòng sau trienkhai.',
      ],
      sampleSolution: `kiemtra
trienkhai`,
    },
    homework:
      'Làm thật (không chấm): trước khi deploy dự án thật lên bất kỳ đâu (Vercel, Netlify, VPS…), tự đặt câu hỏi này: "mình đã chạy test chưa, và có xanh hết không?" Nếu công cụ của bạn không có bước kiểm tự động, tự tay thử qua ba tình huống chính của tính năng trước khi bấm nút deploy — coi đó là cổng bạn tự dựng.',
    srsCards: [
      {
        hoi: 'trienkhai đòi điều kiện gì trước khi cho phép đưa dự án lên sản phẩm sống?',
        dap: 'Test phải đang "xanh" — nghĩa là kiemtra đã chạy SAU lần nhan cuối cùng và không còn tính năng nào đỏ. "chua-chay" hay "do" đều bị chặn.',
      },
      {
        hoi: 'Vì sao nhận thêm một tính năng sau khi đã kiểm tra xanh lại khiến deploy bị chặn lần nữa?',
        dap: 'nhan đưa test về "chua-chay" — tính năng mới chưa được kiểm chứng, nên "lúc nãy mới kiểm" không còn là bằng chứng hợp lệ cho lần deploy tiếp theo.',
      },
    ],
  },
  {
    id: 'vibe-u3-l2',
    unitId: 'vibe-u3',
    language: 'vibe',
    title: 'Chuỗi đầy đủ — một tính năng trọn vòng đời',
    hook: 'Bạn đã học từng mảnh: mô tả, xem, nhận, kiểm, lưu, triển khai. Bài này ghép chúng lại thành MỘT nhịp tay — thứ bạn sẽ lặp lại hàng chục, hàng trăm lần trong đời làm vibe code.',
    theory:
      'Đây là bài TỔNG HỢP — không khái niệm mới, chỉ ghép đúng thứ tự sáu bước đã học rời rạc từ chương 1–2 thành MỘT VÒNG ĐỜI hoàn chỉnh của một tính năng, từ ý tưởng tới người dùng thật:\n\n    mota "<mô tả đủ ba vế>"\n    xemdiff <id>\n    nhan <id>\n    kiemtra\n    luu "<tên mốc>"\n    trienkhai\n\nSáu bước này là "nhịp thở" của vibe code có kỷ luật. Người mới thường bỏ bớt bước (thường là xemdiff hoặc kiemtra) khi vội — bài học ở đây: KHÔNG có bước nào là thừa, mỗi bước chặn một loại lỗi cụ thể mà các bước khác không chặn được (mô tả mơ hồ ↔ hỏi lại; code chưa đọc ↔ xemdiff; ca biên ↔ kiemtra; không có đường lui ↔ luu; chưa kiểm chứng ra người dùng thật ↔ trienkhai).\n\nTốc độ không đến từ BỎ bước — nó đến từ MÔ TẢ tốt ngay từ đầu (chương C1), khiến vòng "sua" ở giữa ngắn lại hoặc biến mất hẳn.',
    workedExample: {
      code: `mota "them so dem so lan da chia tien trong thang, ra tong so lan cuoi thang, bao 0 lan khi khong co lan nao"
xemdiff v1
nhan v1
kiemtra
luu "them bo dem so lan chia tien"
trienkhai`,
      stdinLines: [],
    },
    predict: {
      code: `mota "them nhac nho hang tuan gui tin nhan nhac ca nhom dong tien, bao khi danh sach thanh vien rong"
xemdiff v1
nhan v1
kiemtra
luu "them nhac nho hang tuan"
trienkhai
vibe`,
      question: 'Chạy trọn sáu bước này xong, bảng trạng thái cuối cùng cho "trien khai" là gì?',
      choices: ['da len song', 'chua', 'dang cho', 'khong xac dinh'],
      answerIndex: 0,
      explain:
        'Trọn sáu bước đúng thứ tự — mô tả có nhắc ca biên (danh sách rỗng) nên kiemtra xanh ngay lần đầu, trienkhai thành công — bảng trạng thái sau đó ghi "da len song".',
    },
    parsons: {
      prompt: 'Xếp đúng chuỗi trọn vòng đời của MỘT tính năng, từ ý tưởng tới người dùng thật.',
      lines: [
        'mota "them nhac nho hang tuan gui tin nhan nhac ca nhom dong tien, bao khi danh sach thanh vien rong"',
        'xemdiff v1',
        'nhan v1',
        'kiemtra',
        'luu "them nhac nho hang tuan"',
        'trienkhai',
      ],
    },
    make: {
      prompt:
        'Từ một dự án TRỐNG (không có gì dựng sẵn), tự tay đi trọn vòng đời cho MỘT tính năng của riêng bạn:\n\n1. Mô tả đủ ba vế (ai dùng, vào/ra, ca đặc biệt) — tự nghĩ nội dung.\n2. Xem diff.\n3. Nhận.\n4. Kiểm tra.\n5. Lưu mốc.\n6. Triển khai.',
      starterCode: `# 1. mo ta\n\n# 2. xem diff\n\n# 3. nhan\n\n# 4. kiem tra\n\n# 5. luu moc\n\n# 6. trien khai\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'xanh het',
          match: 'contains',
          hidden: false,
          label: 'Kiểm tra ra xanh hết trước khi triển khai',
        },
        {
          stdinLines: [],
          expected: 'Da trien khai',
          match: 'contains',
          hidden: false,
          label: 'Triển khai thành công cuối chuỗi',
        },
      ],
      hints: [
        'Đúng sáu bước, đúng thứ tự: mota → xemdiff → nhan → kiemtra → luu → trienkhai.',
        'Mô tả phải đủ dài và nhắc CA ĐẶC BIỆT nếu muốn kiemtra xanh ngay lần đầu (không thì phải thêm vòng sua).',
        'Mẫu chạy được: mota "them so dem so lan da chia tien trong thang, ra tong so lan cuoi thang, bao 0 lan khi khong co lan nao" → xemdiff v1 → nhan v1 → kiemtra → luu "them bo dem so lan chia tien" → trienkhai.',
      ],
      sampleSolution: `mota "them so dem so lan da chia tien trong thang, ra tong so lan cuoi thang, bao 0 lan khi khong co lan nao"
xemdiff v1
nhan v1
kiemtra
luu "them bo dem so lan chia tien"
trienkhai`,
    },
    homework:
      'Làm thật (không chấm): chọn MỘT tính năng nhỏ, có thật, bạn muốn thêm vào một dự án của mình. Tự tay đi trọn sáu bước trên công cụ thật (mô tả → xem diff → nhận → viết/chạy test → commit → deploy). Ghi lại thời gian bạn mất và bước nào chiếm nhiều thời gian nhất — đó là dấu hiệu bạn cần luyện thêm phần nào.',
    srsCards: [
      {
        hoi: 'Sáu bước của một vòng đời tính năng vibe code có kỷ luật là gì?',
        dap: 'mota → xemdiff → nhan → kiemtra → luu → trienkhai — mỗi bước chặn một loại lỗi riêng mà các bước khác không chặn được.',
      },
      {
        hoi: 'Tốc độ vibe code đến từ đâu, nếu không phải từ việc bỏ bớt bước?',
        dap: 'Từ MÔ TẢ tốt ngay từ đầu (đủ ba vế, có ca biên) — khiến vòng sửa (sua) ở giữa ngắn lại hoặc biến mất hẳn, không phải từ việc cắt bước xemdiff/kiemtra.',
      },
    ],
  },
  {
    id: 'vibe-u3-l3',
    unitId: 'vibe-u3',
    language: 'vibe',
    title: 'Sửa lỗi trên sản phẩm đang chạy',
    hook: 'Sản phẩm đã lên sóng, người dùng thật báo lỗi. Đây là lúc dễ hoảng nhất — và cũng là lúc quy trình bạn đã học trả giá trị lớn nhất: bạn KHÔNG phải đoán, bạn có một chuỗi các bước rõ ràng để đi qua.',
    theory:
      'Người dùng báo "app tính sai" — việc đầu tiên KHÔNG phải sửa ngay, mà là TÁI HIỆN LỖI: dùng kiemtra để xác nhận đúng là có ca đỏ, và đọc dòng "DO <id> (...)" để biết chính xác lỗi ở đâu. Sửa mà không tái hiện được là sửa mù — có khi sửa nhầm chỗ, lỗi thật vẫn còn nguyên.\n\nQuy trình sửa lỗi sản phẩm đang chạy = đúng vòng "đỏ → sửa → xanh" đã học ở chương C2, chỉ khác một điều: MÔ TẢ LỖI trong góp ý phải cụ thể như người dùng thật đã báo, không phải đoán chung chung. "Bị sai khi danh sách rỗng, cần báo rõ chưa có dữ liệu" tốt hơn "sửa lỗi đi".\n\nSau khi sửa: sua → xemdiff → nhan lại → kiemtra lại cho xanh → rồi mới trienkhai LẠI. Không có đường tắt "sửa xong là coi như xong" — sản phẩm đang chạy có người dùng thật, bỏ qua bước kiểm chứng ở đây rủi ro cao hơn lúc làm bản nháp đầu tiên rất nhiều.',
    workedExample: {
      code: `mota "them o nhap ten thanh vien de them vao nhom chia tien"
xemdiff v1
nhan v1
kiemtra
sua v1 "khi ten rong thi bao chua nhap ten"
xemdiff v1
nhan v1
kiemtra
trienkhai`,
      stdinLines: [],
    },
    predict: {
      code: `trienkhai`,
      question:
        'Người dùng vừa báo lỗi, bạn CHƯA kiemtra để xác nhận — bấm trienkhai lại ngay có ổn không?',
      choices: [
        'Bi chan vi test chua duoc kiem lai sau bao loi',
        'Duoc, vi truoc do da tung trien khai roi',
        'Duoc, vi loi nguoi dung bao khong lien quan test',
        'He thong tu dong sua loi truoc khi trien khai',
      ],
      answerIndex: 0,
      explain:
        'trienkhai chỉ nhìn trạng thái test HIỆN TẠI, không nhớ "đã từng deploy trước đó". Nếu bạn chưa kiemtra lại sau khi biết có lỗi (và nhất là nếu đã sua/nhan lại), test không ở trạng thái xanh chắc chắn — cổng vẫn chặn đúng như thiết kế.',
    },
    parsons: {
      prompt: 'Xếp đúng quy trình xử lý lỗi người dùng báo trên sản phẩm đang chạy.',
      lines: [
        'kiemtra',
        'sua v1 "khi danh sach rong thi bao chua co du lieu, dung de trong"',
        'xemdiff v1',
        'nhan v1',
        'kiemtra',
        'trienkhai',
      ],
    },
    make: {
      prompt:
        'Dự án đã triển khai, tính năng v1 đang chạy nhưng quên ca biên (đề dựng sẵn cảnh, chưa kiểm lại từ lúc nhận). Người dùng vừa báo "bị lỗi khi để trống".\n\n1. Kiểm tra để TÁI HIỆN lỗi (thấy đỏ).\n2. Sửa v1 kèm mô tả lỗi cụ thể người dùng đã báo.\n3. Xem lại, nhận lại.\n4. Kiểm lại cho xanh, rồi triển khai lại.',
      starterCode: `# 1. tai hien loi\n\n# 2. sua kem mo ta loi cu the\n\n# 3. xem lai, nhan lai\n\n# 4. kiem lai, trien khai lai\n`,
      testCases: [
        {
          stdinLines: [
            'mota "them o nhap ten thanh vien de them vao nhom chia tien"',
            'xemdiff v1',
            'nhan v1',
          ],
          expected: 'Da trien khai',
          match: 'contains',
          hidden: false,
          label: 'Triển khai lại thành công sau khi sửa lỗi và kiểm tra xanh',
        },
      ],
      hints: [
        'Bốn bước đúng thứ tự: kiemtra → sua v1 "<mô tả lỗi cụ thể>" → xemdiff v1 → nhan v1 → kiemtra → trienkhai.',
        'Góp ý sửa phải nhắc rõ ca lỗi người dùng gặp: "khi ... rong/trong thi bao chua co du lieu".',
        'Mẫu: kiemtra rồi sua v1 "khi ten rong thi bao chua nhap ten" rồi xemdiff v1 rồi nhan v1 rồi kiemtra rồi trienkhai.',
      ],
      sampleSolution: `kiemtra
sua v1 "khi ten rong thi bao chua nhap ten"
xemdiff v1
nhan v1
kiemtra
trienkhai`,
    },
    homework:
      'Làm thật (không chấm): nếu bạn có sản phẩm đang chạy thật (dù nhỏ), tìm MỘT lỗi thật (tự thử hoặc hỏi bạn bè dùng thử). Đi đúng quy trình: tái hiện → mô tả lỗi cụ thể cho AI → xem sửa → kiểm chứng → deploy lại. Nếu chưa có sản phẩm nào, giả lập: tự "báo lỗi" cho chính mình trên một tính năng bạn từng làm và đi lại quy trình.',
    srsCards: [
      {
        hoi: 'Việc đầu tiên khi người dùng báo lỗi trên sản phẩm đang chạy là gì?',
        dap: 'TÁI HIỆN LỖI bằng kiemtra, đọc dòng "DO <id>" để biết chính xác lỗi ở đâu — sửa mà không tái hiện được là sửa mù, có thể sửa nhầm chỗ.',
      },
      {
        hoi: 'Vì sao không có đường tắt "sửa xong coi như xong" khi vá lỗi sản phẩm đang chạy?',
        dap: 'Sản phẩm đang chạy có người dùng thật — phải sua → xemdiff → nhan lại → kiemtra lại cho xanh → mới trienkhai lại; bỏ bước kiểm chứng ở đây rủi ro cao hơn lúc làm bản nháp đầu.',
      },
    ],
  },
  {
    id: 'vibe-u3-l4',
    unitId: 'vibe-u3',
    language: 'vibe',
    title: 'Tính năng lớn = nhiều mô tả nhỏ',
    hook: '"Làm cho tôi cả một cái app quản lý chi tiêu" trong MỘT câu là công thức chắc chắn dẫn tới diff dài không đọc nổi và một buổi kiểm tra hỗn loạn. Chia nhỏ không phải để AI dễ làm hơn — mà để BẠN còn kiểm soát được.',
    theory:
      'Nguyên tắc: MỖI MÔ TẢ MỘT VIỆC KIỂM ĐƯỢC. "Làm cả app quản lý chi tiêu" là một MỤC TIÊU, không phải một mô tả — nó phải được cắt thành nhiều tính năng nhỏ, mỗi cái tự đứng được, tự kiểm được, tự nhận được riêng: "thêm khoản thu/chi", rồi "thêm bảng tổng theo tháng", rồi "thêm biểu đồ", v.v.\n\nVì sao cắt nhỏ tốt hơn giao một câu to:\n1. Diff của một việc nhỏ ĐỌC ĐƯỢC trong một phút; diff của "cả app" thì không ai đọc hết, và không đọc hết nghĩa là quay về mức ngây thơ.\n2. kiemtra chỉ ra chính xác tính năng NÀO hỏng — việc to gộp chung thì một lỗi nhỏ làm mù luôn cả khối.\n3. Mỗi việc nhỏ nhận xong LƯU được một mốc — nếu việc sau sai, chỉ mất việc sau, không mất cả khối.\n\nCách cắt: nghĩ theo "người dùng làm được gì SAU MỘT LẦN NHẬN" — nếu câu trả lời gồm hai việc trở lên ("thêm và xoá và sửa"), tách thành nhiều mô tả. Chương C4 sẽ học cách viết ĐẶC TẢ cho việc lớn TRƯỚC khi cắt — bài này là bước cắt thực hành.',
    workedExample: {
      code: `mota "them khoan thu chi: nhap so tien va loai (thu/chi), bao loi khi so tien bang 0"
xemdiff v1
nhan v1
mota "them bang tong ket theo thang: cong tat ca khoan thu chi trong thang, bao 0 dong khi thang khong co khoan nao"
xemdiff v2
nhan v2
kiemtra`,
      stdinLines: [],
    },
    predict: {
      code: `mota "them khoan thu chi: nhap so tien va loai (thu/chi), bao loi khi so tien bang 0"
xemdiff v1
nhan v1
mota "them bang tong ket theo thang: cong tat ca khoan thu chi trong thang, bao 0 dong khi thang khong co khoan nao"
xemdiff v2
nhan v2
vibe`,
      question:
        'Sau khi nhận đủ hai tính năng nhỏ, "tinh nang da nhan" trong bảng trạng thái là bao nhiêu?',
      choices: ['2', '1', '0', 'Khong xac dinh vi chua kiem tra'],
      answerIndex: 0,
      explain:
        'Hai tính năng, mỗi cái là một mota riêng và đều đã nhan — "tinh nang da nhan" đếm đúng theo số lần nhan thành công, không phụ thuộc đã kiemtra hay chưa.',
    },
    parsons: {
      prompt: 'Xếp đúng cách chia một việc lớn thành hai mô tả nhỏ, mỗi cái nhận riêng.',
      lines: [
        'mota "them khoan thu chi: nhap so tien va loai (thu/chi), bao loi khi so tien bang 0"',
        'xemdiff v1',
        'nhan v1',
        'mota "them bang tong ket theo thang: cong tat ca khoan thu chi trong thang, bao 0 dong khi thang khong co khoan nao"',
        'xemdiff v2',
        'nhan v2',
      ],
    },
    make: {
      prompt:
        'Bạn muốn xây "app quản lý chi tiêu" nhưng biết không thể giao trong một câu.\n\n1. Mô tả tính năng nhỏ ĐẦU TIÊN (một việc kiểm được) — tự nghĩ nội dung, đủ ba vế.\n2. Xem diff, nhận.\n3. Mô tả tính năng nhỏ THỨ HAI (khác việc thứ nhất).\n4. Xem diff, nhận.\n5. Kiểm tra cả hai.',
      starterCode: `# 1. mo ta tinh nang nho thu nhat\n\n# 2. xem, nhan\n\n# 3. mo ta tinh nang nho thu hai\n\n# 4. xem, nhan\n\n# 5. kiem tra\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'xanh het',
          match: 'contains',
          hidden: false,
          label: 'Cả hai tính năng nhỏ đều xanh khi kiểm chung',
        },
      ],
      hints: [
        'Hai vòng mota → xemdiff → nhan riêng biệt, mỗi vòng MỘT việc kiểm được — đừng nhét hai việc vào một mota.',
        'Cả hai mô tả phải đủ ba vế (đặc biệt là ca biên) để kiemtra xanh ngay lần đầu.',
        'Mẫu: mota "them khoan thu chi: nhap so tien va loai (thu/chi), bao loi khi so tien bang 0" → xemdiff v1 → nhan v1 → mota "them bang tong ket theo thang: cong tat ca khoan thu chi, bao 0 dong khi thang khong co khoan nao" → xemdiff v2 → nhan v2 → kiemtra.',
      ],
      sampleSolution: `mota "them khoan thu chi: nhap so tien va loai (thu/chi), bao loi khi so tien bang 0"
xemdiff v1
nhan v1
mota "them bang tong ket theo thang: cong tat ca khoan thu chi trong thang, bao 0 dong khi thang khong co khoan nao"
xemdiff v2
nhan v2
kiemtra`,
    },
    homework:
      'Làm thật (không chấm): viết ra một ý tưởng ứng dụng của riêng bạn trong MỘT câu to (như "app quản lý chi tiêu"). Tự cắt nó thành 4–6 tính năng nhỏ, mỗi cái là một câu "người dùng làm được gì sau một lần nhận". Đây là bản kế hoạch bạn sẽ dùng thật nếu quyết định làm ứng dụng đó bằng vibe code.',
    srsCards: [
      {
        hoi: 'Nguyên tắc cắt một tính năng lớn thành nhiều mô tả nhỏ là gì?',
        dap: 'Mỗi mô tả là MỘT VIỆC KIỂM ĐƯỢC — nghĩ theo "người dùng làm được gì SAU MỘT LẦN NHẬN"; nếu câu trả lời gồm hai việc trở lên thì tách thành nhiều mô tả.',
      },
      {
        hoi: 'Ba lý do cắt nhỏ tốt hơn giao một câu to cho AI là gì?',
        dap: 'Diff nhỏ đọc được trong một phút (diff to thì bỏ đọc, quay về mức ngây thơ); kiemtra chỉ đúng tính năng nào hỏng thay vì làm mù cả khối; và mỗi việc nhỏ lưu được một mốc riêng, sai chỉ mất phần đó.',
      },
    ],
  },
]
