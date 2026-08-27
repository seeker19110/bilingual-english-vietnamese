// lessons/p3u11.ts — Bài học P3-U11: CÔNG CỤ DEV (PR-L9).
// Đặc tả docs/research/dac-ta-mon-lap-trinh-2026-08-24.md §4 ("Công cụ — dòng lệnh cơ bản,
// môi trường ảo, cấu trúc dự án · dự án mini: chuẩn hoá repo dự án theo khuôn").
//
// Chạy trên cùng bộ mô phỏng với U10 (gitSim.ts) — xem ghi chú luật soạn bài ở p3u10.ts.
// Phần "môi trường ảo" (venv) KHÔNG mô phỏng được (không có Python thật, không có hệ điều
// hành thật) nên bài dạy nó bằng lý thuyết + việc về nhà, và nói thẳng điều đó.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P3U11_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p3-u11-l1',
    unitId: 'p3-u11',
    language: 'git',
    title: 'Dòng lệnh và cấu trúc dự án — dọn nhà cho code của bạn',
    hook: 'Mở một thư mục dự án của người làm nghề, bạn thấy README.md, .gitignore, src/, tests/ — luôn luôn cùng một bộ khung. Không phải vì họ thích ngăn nắp, mà vì người lạ (và chính họ sáu tháng sau) tìm được thứ cần trong ba giây.',
    theory:
      'DÒNG LỆNH: cửa sổ chỉ có chữ, gõ lệnh thì máy làm. Chậm hơn bấm chuột lúc đầu, nhưng mọi công cụ của nghề đều điều khiển bằng nó, và nó GHI LẠI ĐƯỢC — một dòng lệnh gửi cho đồng nghiệp là họ làm lại y hệt, còn "bấm vào nút thứ ba từ trên xuống" thì không.\n\nNăm lệnh dùng hằng ngày:\n    pwd                        # tôi đang đứng ở thư mục nào\n    ls                         # thư mục này có gì\n    cat ten_file               # xem nội dung file\n    echo "chu" > file          # ghi chữ vào file (> ghi đè, >> nối thêm vào cuối)\n    rm ten_file                # xoá file — KHÔNG có thùng rác, xoá là mất\n\nCẤU TRÚC DỰ ÁN CHUẨN — bốn thứ mọi kho tử tế đều có:\n\n1. README.md — dự án làm gì, chạy thế nào, ai làm. File đầu tiên người ta đọc.\n2. .gitignore — danh sách thứ KHÔNG đưa vào Git.\n3. Thư mục mã nguồn (src/ hoặc theo quy ước ngôn ngữ) — code thật nằm gọn một chỗ.\n4. File khai báo thư viện cần cài (requirements.txt cho Python, package.json cho JavaScript) — để người khác dựng lại đúng môi trường của bạn.\n\n.GITIGNORE QUAN TRỌNG HƠN BẠN TƯỞNG. Ba nhóm phải bỏ vào đó:\n- File bí mật: .env, khoá API. Lỡ commit khoá lên GitHub công khai thì coi như đã lộ — có bot quét liên tục, xoá đi cũng muộn vì lịch sử Git còn giữ. Đây là tai nạn kinh điển, mỗi năm hàng nghìn người dính.\n- File máy tự sinh: __pycache__/, node_modules/, dist/. Chúng dựng lại được từ mã nguồn, đưa vào kho chỉ làm nặng.\n- File riêng của máy bạn: cấu hình trình soạn thảo, file rác hệ điều hành.\n\nMÔI TRƯỜNG ẢO (venv) — phần này bạn phải làm trên máy thật, sandbox không chạy được nên đây là lý thuyết cho việc về nhà. Vấn đề: dự án A cần thư viện phiên bản 1, dự án B cần phiên bản 2, cài chung một chỗ thì đá nhau. Môi trường ảo cho mỗi dự án một "tủ thuốc" riêng:\n    python3 -m venv .venv            # tạo môi trường ảo trong thư mục .venv\n    source .venv/bin/activate        # bật nó lên (Windows: .venv\\Scripts\\activate)\n    pip install -r requirements.txt  # cài đúng bộ thư viện của dự án\nVà .venv/ luôn nằm trong .gitignore — nó là thứ dựng lại được, không phải mã nguồn.',
    workedExample: {
      code: `git init
echo "# Quan cua toi" > README.md
echo ".env" > .gitignore
echo "__pycache__/" >> .gitignore
cat .gitignore
git add .
git commit -m "Chuan hoa cau truc du an"
ls
git log --oneline`,
      stdinLines: [],
    },
    predict: {
      code: `echo "dong mot" > ghi_chu.txt
echo "dong hai" > ghi_chu.txt
cat ghi_chu.txt`,
      question: 'File ghi_chu.txt cuối cùng chứa gì?',
      choices: ['dong hai', 'dong mot\ndong hai', 'dong mot', 'Báo lỗi vì file đã tồn tại'],
      answerIndex: 0,
      explain:
        'Dấu > GHI ĐÈ: lần thứ hai xoá sạch nội dung cũ rồi viết lại. Muốn NỐI THÊM vào cuối thì dùng >> (hai dấu). Nhầm hai dấu này là cách nhanh nhất để tự xoá mất công sức của mình — nên nhớ: một dấu = thay thế, hai dấu = thêm vào.',
    },
    parsons: {
      prompt: 'Xếp các lệnh: dựng bộ khung chuẩn cho một dự án mới rồi chốt commit đầu tiên.',
      lines: [
        'git init',
        'echo "# Du an cua toi" > README.md',
        'echo ".env" > .gitignore',
        'echo "node_modules/" >> .gitignore',
        'git add .',
        'git commit -m "Khoi tao cau truc du an"',
      ],
    },
    make: {
      prompt:
        'Chuẩn hoá kho dự án cửa hàng theo khuôn nghề. Gõ các lệnh để:\n\n1. Khởi tạo kho git.\n2. Tạo README.md nội dung: # Quan cua toi\n3. Tạo .gitignore chứa ĐÚNG HAI DÒNG, theo thứ tự:\n.env\n__pycache__/\n(dòng đầu dùng >, dòng thứ hai dùng >> để nối thêm — dùng > hai lần là bạn xoá mất dòng đầu)\n4. Xem lại nội dung .gitignore bằng cat.\n5. Đưa tất cả vào Git và chốt commit với lời nhắn: Chuan hoa cau truc\n6. Liệt kê file trong thư mục.',
      starterCode: `git init\n# tao README.md\n\n# tao .gitignore hai dong (chu y > va >>)\n\n# kiem lai bang cat, roi add + commit, cuoi cung ls\n`,
      testCases: [
        {
          stdinLines: [],
          expected: '.env\n__pycache__/',
          match: 'contains',
          hidden: false,
          label: 'cat .gitignore hiện đủ hai dòng đúng thứ tự (dùng đúng > rồi >>)',
        },
        {
          stdinLines: [],
          expected: 'Chuan hoa cau truc',
          match: 'contains',
          hidden: false,
          label: 'Commit đúng lời nhắn',
        },
        {
          stdinLines: [],
          expected: '.gitignore\nREADME.md',
          match: 'contains',
          hidden: false,
          label: 'ls hiện đủ cả hai file của bộ khung',
        },
        {
          stdinLines: [],
          expected: '[main c1] Chuan hoa cau truc\n 2 file trong ban chup',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: commit chụp ĐỦ 2 file (git add . lấy cả file ẩn .gitignore)',
        },
      ],
      hints: [
        'Bộ khung tối thiểu chỉ gồm hai file: README.md và .gitignore. Tạo bằng echo "…" > ten_file.',
        'Hai dòng trong .gitignore: dòng đầu echo ".env" > .gitignore, dòng sau echo "__pycache__/" >> .gitignore. Dùng > cả hai lần là dòng đầu bị xoá mất.',
        'Xong phần file thì: cat .gitignore để kiểm, rồi git add . (dấu chấm = tất cả), git commit -m "Chuan hoa cau truc", cuối cùng ls.',
      ],
      sampleSolution: `git init
echo "# Quan cua toi" > README.md
echo ".env" > .gitignore
echo "__pycache__/" >> .gitignore
cat .gitignore
git add .
git commit -m "Chuan hoa cau truc"
ls`,
    },
    homework:
      'Về nhà (trên máy thật): mở terminal ở thư mục dự án của bạn, tạo môi trường ảo bằng python3 -m venv .venv rồi bật lên, cài thư viện và ghi lại danh sách bằng pip freeze > requirements.txt. Nhớ thêm .venv/ vào .gitignore trước khi commit. Sau bước này, bất kỳ ai clone kho của bạn cũng dựng lại được đúng môi trường chỉ bằng hai lệnh — đó là ranh giới giữa "code chạy trên máy tôi" và "dự án người khác dùng được".',
    srsCards: [
      {
        hoi: 'Dấu > và >> khi ghi vào file khác nhau thế nào?',
        dap: 'Một dấu > GHI ĐÈ: xoá sạch nội dung cũ rồi viết lại. Hai dấu >> NỐI THÊM vào cuối. Nhầm hai dấu này là cách nhanh nhất để tự xoá mất công sức của mình.',
      },
      {
        hoi: 'Ba nhóm thứ phải bỏ vào .gitignore là gì?',
        dap: '(1) File bí mật: .env, khoá API — lỡ commit lên GitHub công khai là coi như đã lộ. (2) File máy tự sinh: __pycache__/, node_modules/, dist/ — dựng lại được. (3) File riêng của máy bạn: cấu hình trình soạn thảo, rác hệ điều hành.',
      },
      {
        hoi: 'Môi trường ảo (venv) giải quyết vấn đề gì?',
        dap: 'Dự án A cần thư viện phiên bản 1, dự án B cần phiên bản 2 — cài chung một chỗ thì đá nhau. venv cho mỗi dự án một "tủ thuốc" riêng: python3 -m venv .venv rồi source .venv/bin/activate. Nhớ để .venv/ trong .gitignore.',
      },
    ],
  },
  // ─────────────────────────── PR-M2: ba bài DÒNG LỆNH (language 'bash') ───────────────────────────
  // Chạy trên BỘ CHẠY BASH RÚT GỌN (bashSim.ts, PR-M1) — KHÔNG phải bash thật. Mỗi bài có mục
  // "BỘ CHẠY NÀY KHÔNG LÀM GÌ" trong phần khái niệm, đúng luật tự khai của hiến chương M §3.3
  // (luật 2), và bước ⑦ về nhà luôn là LÀN C: gõ đúng những lệnh đó trên terminal máy thật.
  {
    id: 'p3-u11-l2',
    unitId: 'p3-u11',
    language: 'bash',
    title: 'Đi trong cây thư mục — pwd, cd, ls, mkdir, cp, mv, rm',
    hook: 'Bạn tải một dự án về, mở ra thấy chín thư mục lồng nhau và không biết file mình cần nằm đâu. Người làm nghề không mở từng cái để dò: họ gõ một dòng find và có ngay câu trả lời. Bài này dạy bạn đi lại trong cây thư mục bằng chữ, nhanh hơn hẳn bấm chuột.',
    theory:
      'MÁY TÍNH XẾP FILE THEO CÂY. Mỗi thư mục chứa file và thư mục con, cứ thế xuống sâu. Lúc nào bạn cũng đang ĐỨNG ở một thư mục — gọi là thư mục hiện tại — và mọi lệnh bạn gõ hiểu đường dẫn theo chỗ đang đứng đó.\n\nBỐN LỆNH ĐỂ ĐI LẠI:\n    pwd              # tôi đang đứng ở đâu\n    ls               # chỗ này có gì\n    ls -l            # có gì, kèm quyền và kích thước\n    cd ten_thu_muc   # đi vào\n    cd ..            # lùi ra một cấp (hai dấu chấm = "thư mục cha")\n    cd ~             # về thẳng thư mục nhà\n\nBA LỆNH ĐỂ SẮP XẾP:\n    mkdir bai_tap            # tạo một thư mục\n    mkdir -p a/b/c           # tạo cả đường dẫn nhiều cấp một lượt\n    cp nguon.txt dich.txt    # CHÉP (bản gốc còn nguyên)\n    mv nguon.txt dich.txt    # CHUYỂN hoặc ĐỔI TÊN (bản gốc mất)\n    rm file.txt              # xoá file\n    rm -r thu_muc            # xoá thư mục và mọi thứ bên trong\n\nHAI CÁI BẪY PHẢI NHỚ:\n\n1. rm KHÔNG có thùng rác. Không hỏi lại, không hoàn tác. Câu "rm -rf /" xoá sạch cả máy — bộ chạy này chặn nó lại và giải thích, nhưng ngoài đời thật thì không ai chặn bạn. Trước khi rm -r, hãy ls một lần để nhìn xem mình sắp xoá cái gì.\n2. rm một THƯ MỤC mà quên -r thì máy từ chối. Đó là hàng rào an toàn cố ý: xoá một file là mất một thứ, xoá một thư mục là mất tất cả những gì bên trong.\n\nTÌM FILE KHÔNG CẦN MỞ TỪNG THƯ MỤC:\n    find quan -type f              # mọi FILE nằm dưới thư mục quan\n    find quan -type d              # mọi THƯ MỤC\n    find quan -name "*.py"         # mọi thứ có tên kết thúc bằng .py\nDấu * nghĩa là "gì cũng được". Nó cũng dùng được với các lệnh khác: ls *.txt liệt kê mọi file .txt.\n\nBỘ CHẠY NÀY KHÔNG LÀM GÌ (nói thẳng để bạn không hiểu nhầm): đây là bộ mô phỏng của DHCB viết bằng TypeScript, KHÔNG phải bash thật — mỗi lượt chạy nó in một dòng [GIA LAP] để tự khai. Nó không có mạng (không curl, không ssh), không có sudo và người dùng thật, không có tiến trình nền, không có sed/awk, và không có đồng hồ (không date) — cố ý, để bài học luôn cho cùng kết quả và chấm được. Máy ảo dựng lại từ đầu mỗi lượt chạy, nên bạn cứ rm -r thoải mái mà học.',
    workedExample: {
      code: `mkdir -p quan/src
mkdir -p quan/du-lieu
echo "# Quan cua toi" > quan/README.md
echo "print(1)" > quan/main.py
mv quan/main.py quan/src/main.py
cp quan/README.md quan/du-lieu/ghi_chu.md
find quan -type f
find quan -type d`,
      stdinLines: [],
    },
    predict: {
      code: `mkdir bao_cao
rm bao_cao`,
      question: 'Dòng rm bao_cao cho kết quả gì?',
      choices: [
        'Báo lỗi: bao_cao là thư mục, cần thêm -r',
        'Xoá thư mục bao_cao bình thường',
        'Xoá thư mục và hỏi lại "bạn có chắc không?"',
        'Không làm gì, cũng không báo gì',
      ],
      answerIndex: 0,
      explain:
        'rm mặc định chỉ xoá FILE. Muốn xoá thư mục phải nói rõ rm -r (r = recursive, tức là xuống hết mọi cấp bên trong). Đây là hàng rào an toàn cố ý: xoá nhầm một file là mất một thứ, xoá nhầm một thư mục là mất tất cả những gì nằm trong nó.',
    },
    parsons: {
      prompt: 'Xếp các lệnh: dựng thư mục anh/ rồi chuyển file bia.png vào đó và kiểm lại.',
      lines: ['pwd', 'mkdir anh', 'mv bia.png anh/bia.png', 'ls anh', 'find anh -type f'],
    },
    make: {
      prompt:
        'Dựng bộ khung thư mục cho dự án "quan-cua-toi" rồi kiểm lại bằng find.\n\n1. Tạo một lượt cả đường dẫn quan-cua-toi/src (dùng mkdir -p).\n2. Tạo tiếp thư mục quan-cua-toi/du-lieu.\n3. Tạo file quan-cua-toi/README.md với nội dung: # Quan cua toi\n4. Tạo file thuc_don.csv ở thư mục hiện tại với nội dung: pho,45000\n5. CHUYỂN thuc_don.csv vào quan-cua-toi/du-lieu (bản ở ngoài không còn nữa).\n6. Liệt kê mọi FILE nằm dưới quan-cua-toi (find … -type f).\n7. Liệt kê mọi THƯ MỤC nằm dưới quan-cua-toi (find … -type d).',
      starterCode: `# 1-2: tao thu muc (nho -p cho duong dan nhieu cap)\n\n# 3-4: tao hai file bang echo "..." > duong_dan\n\n# 5: chuyen file vao du-lieu\n\n# 6-7: kiem lai bang find (mot lan -type f, mot lan -type d)\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'quan-cua-toi/README.md\nquan-cua-toi/du-lieu/thuc_don.csv',
          match: 'contains',
          hidden: false,
          label: 'find liệt kê đủ hai file, thuc_don.csv đã nằm trong du-lieu',
        },
        {
          stdinLines: [],
          expected: '[GIA LAP]',
          match: 'contains',
          hidden: false,
          label: 'Script chạy được tới cuối, không có lệnh nào lỗi',
        },
        {
          stdinLines: [],
          expected: 'quan-cua-toi/du-lieu\nquan-cua-toi/src',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: find -type d liệt kê cả src lẫn du-lieu (thư mục dựng đúng bằng mkdir -p)',
        },
      ],
      hints: [
        'mkdir -p quan-cua-toi/src tạo luôn cả thư mục cha lẫn con trong một lệnh. Thiếu -p thì máy báo không có thư mục cha.',
        'Tạo file bằng echo "noi dung" > duong_dan/ten_file — thư mục cha phải có trước thì mới ghi được.',
        'Chuyển file: mv thuc_don.csv quan-cua-toi/du-lieu. Đích là một thư mục đã có thì file giữ nguyên tên. Kiểm lại bằng find quan-cua-toi -type f rồi find quan-cua-toi -type d — cùng một lệnh find, chỉ khác cờ -type.',
      ],
      sampleSolution: `mkdir -p quan-cua-toi/src
mkdir quan-cua-toi/du-lieu
echo "# Quan cua toi" > quan-cua-toi/README.md
echo "pho,45000" > thuc_don.csv
mv thuc_don.csv quan-cua-toi/du-lieu
find quan-cua-toi -type f
find quan-cua-toi -type d`,
    },
    homework:
      'Về nhà (trên MÁY THẬT, không phải bộ mô phỏng): mở terminal — macOS/Linux dùng Terminal, Windows dùng PowerShell hoặc WSL — rồi gõ đúng chuỗi lệnh trên bằng thư mục dự án của chính bạn. Bạn sẽ thấy hai khác biệt so với bộ chạy ở đây: máy thật có sẵn hàng trăm lệnh khác (date, ps, curl…), và rm thật sự xoá vĩnh viễn. Làm quen bằng cách ls trước mỗi lần rm — thói quen này cứu bạn ít nhất một lần trong đời.',
    srsCards: [
      {
        hoi: 'Vì sao rm một thư mục lại báo lỗi nếu không có -r?',
        dap: 'Vì rm mặc định chỉ xoá FILE. Cần -r (recursive) để nói rõ "xoá cả mọi thứ bên trong". Đây là hàng rào an toàn cố ý: xoá nhầm một file mất một thứ, xoá nhầm một thư mục mất tất cả.',
      },
      {
        hoi: 'cp và mv khác nhau ở chỗ nào?',
        dap: 'cp CHÉP — bản gốc còn nguyên, sau lệnh có hai bản. mv CHUYỂN hoặc ĐỔI TÊN — bản gốc không còn, chỉ còn một bản ở chỗ mới.',
      },
      {
        hoi: 'mkdir -p làm được gì mà mkdir thường không làm được?',
        dap: 'Tạo cả đường dẫn nhiều cấp trong một lệnh (mkdir -p a/b/c), và không báo lỗi khi thư mục đã tồn tại. mkdir thường đòi thư mục cha phải có sẵn.',
      },
    ],
  },
  {
    id: 'p3-u11-l3',
    unitId: 'p3-u11',
    language: 'bash',
    title: 'Ống | — nối lệnh thành dây chuyền lọc dữ liệu',
    hook: 'Sếp đưa bạn file nhật ký 200.000 dòng và hỏi: lỗi nào xảy ra nhiều nhất? Mở bằng Excel thì treo máy. Người làm nghề gõ một dòng, nối bốn lệnh nhỏ lại với nhau, và có câu trả lời trong một giây. Bài này dạy đúng cái dòng đó.',
    theory:
      'TRIẾT LÝ CỦA DÒNG LỆNH: mỗi lệnh làm MỘT việc thật giỏi, rồi nối chúng lại. Dấu nối là ỐNG — ký hiệu | — nghĩa là "lấy kết quả của lệnh bên trái đổ vào lệnh bên phải".\n\n    cat nhat_ky.txt | grep LOI | sort | uniq -c\n    └─ đọc file ─┘   └─lọc─┘  └─xếp─┘ └─đếm trùng─┘\n\nSÁU LỆNH LỌC DÙNG NHIỀU NHẤT:\n    grep chu file      # giữ lại những DÒNG có chứa "chu"\n    grep -v chu file   # ngược lại: bỏ những dòng có "chu"\n    grep -c chu file   # chỉ đếm xem có bao nhiêu dòng khớp\n    sort               # xếp theo thứ tự chữ cái\n    sort -n            # xếp theo SỐ (10 sau 9, chứ không phải trước)\n    sort -r            # xếp ngược\n    uniq               # gộp các dòng trùng nhau\n    uniq -c            # gộp và đếm mỗi loại bao nhiêu lần\n    wc -l file         # đếm số dòng\n    head -n 3          # lấy 3 dòng đầu\n    tail -n 3          # lấy 3 dòng cuối\n    cut -d, -f2 file   # lấy CỘT thứ 2, các cột ngăn nhau bởi dấu phẩy\n\nCÁI BẪY LỚN NHẤT: uniq chỉ gộp các dòng TRÙNG NHAU VÀ NẰM CẠNH NHAU. Danh sách chưa xếp thì nó không gộp được gì cả. Nên hầu như lúc nào bạn cũng thấy hai lệnh này đi cặp: sort | uniq. Nhớ được điều này là bạn tránh được câu hỏi "sao đếm ra sai?" mà rất nhiều người mới mắc.\n\nCÔNG THỨC "CÁI GÌ NHIỀU NHẤT" — học thuộc, dùng cả đời:\n    grep LOI nhat_ky.txt | sort | uniq -c | sort -rn | head -n 1\n    lọc lấy dòng cần → xếp → đếm mỗi loại → xếp theo SỐ giảm dần → lấy dòng đầu\n\nVÌ SAO PHẢI HỌC CÁI NÀY khi đã biết viết Python? Vì nó nhanh hơn nhiều lần khi chỉ cần trả lời một câu hỏi: viết một script Python mất năm phút, gõ một dòng ống mất mười giây. Và vì mọi máy chủ đều có sẵn nó, không cần cài gì.\n\nBỘ CHẠY NÀY KHÔNG LÀM GÌ: đây là bộ mô phỏng của DHCB (dòng [GIA LAP] ở đầu mỗi lượt chạy nhắc bạn điều đó), KHÔNG phải bash thật. Nó không có sed và awk — hai lệnh xử lý văn bản mạnh mà bạn sẽ gặp ngoài đời; ở đây mọi bài đều làm được bằng grep/cut/sort/uniq. Hai khác biệt nhỏ đã biết: grep ở đây hiểu mẫu tìm theo kiểu JavaScript chứ không phải kiểu GNU grep, và wc in các số cách nhau một dấu cách chứ không căn thẳng cột như wc thật. Không có mạng, không có sudo, không có đồng hồ.',
    workedExample: {
      code: `cat thuc_don.csv
wc -l thuc_don.csv
cut -d, -f1 thuc_don.csv | sort
cut -d, -f2 thuc_don.csv | sort -n | tail -n 1`,
      stdinLines: [
        'echo "pho,45000" > thuc_don.csv',
        'echo "bun cha,50000" >> thuc_don.csv',
        'echo "ca phe,25000" >> thuc_don.csv',
        'echo "tra da,5000" >> thuc_don.csv',
      ],
    },
    predict: {
      code: `echo "cam
tao
cam" > gio.txt
uniq gio.txt`,
      question: 'Lệnh uniq in ra gì?',
      choices: ['cam\ntao\ncam', 'cam\ntao', 'cam', 'tao\ncam'],
      answerIndex: 0,
      explain:
        'uniq chỉ gộp các dòng trùng nhau NẰM CẠNH NHAU. Ở đây hai dòng "cam" bị "tao" chen giữa nên không dòng nào bị gộp — output y hệt đầu vào. Muốn gộp thật thì phải xếp trước: sort gio.txt | uniq. Đây là lý do hai lệnh này gần như luôn đi cặp.',
    },
    parsons: {
      prompt:
        'Xếp thành một dây chuyền trả lời câu "loại lỗi nào nhiều nhất trong nhat_ky.txt?" (mỗi dòng là một mắt xích, xếp từ trái sang phải).',
      lines: ['grep LOI nhat_ky.txt', '| sort', '| uniq -c', '| sort -rn', '| head -n 1'],
    },
    make: {
      prompt:
        'File nhat_ky.txt đã có sẵn trong thư mục (mỗi dòng bắt đầu bằng OK hoặc LOI). Trả lời ba câu hỏi, mỗi câu MỘT dòng lệnh, in ra theo đúng thứ tự:\n\n1. Có bao nhiêu dòng LOI? (dùng grep -c)\n2. Loại lỗi nào xuất hiện nhiều nhất, kèm số lần? (dùng công thức: grep → sort → uniq -c → sort -rn → head -n 1)\n3. Mỗi trạng thái (OK và LOI) có bao nhiêu dòng? (lấy CỘT ĐẦU bằng cut -d" " -f1, rồi sort | uniq -c)',
      starterCode: `# 1. dem so dong LOI\n\n# 2. loai loi nhieu nhat (noi 5 mat xich bang dau |)\n\n# 3. dem theo tung trang thai\n`,
      testCases: [
        {
          stdinLines: [
            'echo "OK tai trang chu" > nhat_ky.txt',
            'echo "LOI het bo nho" >> nhat_ky.txt',
            'echo "OK tai anh" >> nhat_ky.txt',
            'echo "LOI mat ket noi" >> nhat_ky.txt',
            'echo "LOI mat ket noi" >> nhat_ky.txt',
            'echo "OK tai trang chu" >> nhat_ky.txt',
          ],
          expected: '3\n2 LOI mat ket noi\n3 LOI\n3 OK',
          match: 'contains',
          hidden: false,
          label: '3 dòng LOI · lỗi nhiều nhất là "mat ket noi" (2 lần) · đếm theo trạng thái',
        },
        {
          stdinLines: [
            'echo "LOI o dia day" > nhat_ky.txt',
            'echo "OK khoi dong" >> nhat_ky.txt',
            'echo "LOI o dia day" >> nhat_ky.txt',
            'echo "LOI o dia day" >> nhat_ky.txt',
          ],
          expected: '3\n3 LOI o dia day\n3 LOI\n1 OK',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: file khác, dây chuyền vẫn phải đúng (không viết cứng đáp án)',
        },
      ],
      hints: [
        'Câu 1 chỉ cần một lệnh: grep -c LOI nhat_ky.txt — cờ -c nghĩa là "đếm dòng khớp" chứ không in ra.',
        'Câu 2 nối năm mắt xích bằng dấu |: grep LOI nhat_ky.txt rồi sort rồi uniq -c rồi sort -rn rồi head -n 1. Thiếu sort trước uniq là đếm sai.',
        'Câu 3: cut -d" " -f1 nhat_ky.txt lấy chữ đầu mỗi dòng (dấu ngăn cách là khoảng trắng), rồi | sort | uniq -c để đếm mỗi loại.',
      ],
      sampleSolution: `grep -c LOI nhat_ky.txt
grep LOI nhat_ky.txt | sort | uniq -c | sort -rn | head -n 1
cut -d" " -f1 nhat_ky.txt | sort | uniq -c`,
    },
    homework:
      'Về nhà (trên MÁY THẬT): tìm một file văn bản dài trong máy bạn — nhật ký của một chương trình, một file CSV tải về, hay chính lịch sử lệnh của bạn (history > lich_su.txt) — rồi dùng đúng công thức "cái gì nhiều nhất" để hỏi nó một câu. Ví dụ: lệnh nào bạn gõ nhiều nhất? Trên máy thật bạn còn có sed và awk để cắt gọt tinh hơn; đó là bước tiếp theo tự nhiên sau bài này.',
    srsCards: [
      {
        hoi: 'Dấu | (ống) giữa hai lệnh làm gì?',
        dap: 'Lấy KẾT QUẢ của lệnh bên trái đổ thẳng vào lệnh bên phải làm đầu vào. Nhờ nó, mỗi lệnh chỉ cần làm giỏi một việc và ta nối chúng thành dây chuyền xử lý.',
      },
      {
        hoi: 'Vì sao gần như lúc nào cũng phải sort trước khi uniq?',
        dap: 'Vì uniq chỉ gộp những dòng trùng nhau NẰM CẠNH NHAU. Danh sách chưa xếp thì các dòng giống nhau nằm rải rác và không bị gộp, cho ra số đếm sai.',
      },
      {
        hoi: 'Công thức dòng lệnh trả lời "cái gì xuất hiện nhiều nhất" gồm những mắt xích nào?',
        dap: 'grep (lọc dòng cần) | sort (xếp) | uniq -c (đếm mỗi loại) | sort -rn (xếp theo số giảm dần) | head -n 1 (lấy quán quân).',
      },
    ],
  },
  {
    id: 'p3-u11-l4',
    unitId: 'p3-u11',
    language: 'bash',
    title: 'Dự án nhỏ: viết script tự động báo cáo nhật ký',
    hook: 'Mỗi sáng bạn làm đúng bốn thao tác: mở file nhật ký, đếm lỗi, xem lỗi nào nhiều nhất, ghi lại. Ngày thứ ba bạn sẽ chán. Việc lặp lại là việc của MÁY — bạn gói bốn thao tác đó vào một file .sh, và từ hôm sau chỉ gõ một dòng.',
    theory:
      'SCRIPT là một file văn bản chứa các lệnh, chạy từ trên xuống. Ba thứ biến một chuỗi lệnh thành công cụ dùng được:\n\n1. BIẾN — đặt tên cho một giá trị để khỏi gõ lại:\n    TEN=nhat_ky.txt          # gán (KHÔNG có khoảng trắng quanh dấu =)\n    echo "File: $TEN"        # dùng, nhớ dấu $\n    SO=$(grep -c LOI $TEN)   # gán bằng KẾT QUẢ của một lệnh — đây là chỗ mạnh nhất\n\n2. MÃ THOÁT — mỗi lệnh chạy xong để lại một con số: 0 = thành công, khác 0 = thất bại. Xem bằng $?. Đây là cách máy biết việc trước có trôi chảy không:\n    grep LOI nhat_ky.txt     # tìm thấy → 0, không thấy → 1\n    echo $?\n    lenh_a && lenh_b         # chỉ chạy b NẾU a thành công\n    lenh_a || lenh_b         # chỉ chạy b NẾU a thất bại\n\n3. RẼ NHÁNH VÀ LẶP:\n    if [ $SO -gt 2 ]; then\n        echo "Nhieu loi qua"\n    else\n        echo "Binh thuong"\n    fi\n\n    for F in *.txt; do\n        echo "Dang xu ly $F"\n    done\n\nPhép so sánh trong [ ]: -eq bằng · -ne khác · -lt bé hơn · -gt lớn hơn · -le bé hoặc bằng · -ge lớn hoặc bằng (dùng cho SỐ); với chữ thì dùng = và !=; -f file kiểm tra file có tồn tại không, -d cho thư mục. Nhớ chừa khoảng trắng hai bên dấu ngoặc vuông — thiếu là lỗi ngay.\n\nCHẠY MỘT SCRIPT: file .sh mặc định KHÔNG có quyền chạy, phải cấp:\n    chmod +x bao_cao.sh      # cấp quyền chạy\n    ./bao_cao.sh nhat_ky.txt # chạy, kèm tham số\nTrong script, tham số thứ nhất đọc bằng $1, thứ hai $2. Dấu ./ ở đầu nghĩa là "file nằm ngay thư mục này".\n\nBỘ CHẠY NÀY KHÔNG LÀM GÌ: bộ mô phỏng của DHCB (xem dòng [GIA LAP]), KHÔNG phải bash thật. Nó không có while, không có case, không có hàm, không có mảng và không có phép tính $(( )) — script ngoài đời dùng cả những thứ đó. Quyền ở đây chỉ là con số: chmod +x quyết định ./script.sh chạy được hay không, nhưng không có người dùng và nhóm thật. Một khác biệt cố ý nữa: script .sh ở đây dùng chung biến với shell gọi nó, còn bash thật tạo một tiến trình con riêng.',
    workedExample: {
      code: `TEN=nhat_ky.txt
SO=$(grep -c LOI $TEN)
echo "File $TEN co $SO dong LOI"
if [ $SO -gt 2 ]; then
echo "CANH BAO: nhieu loi"
else
echo "Binh thuong"
fi`,
      stdinLines: [
        'echo "OK khoi dong" > nhat_ky.txt',
        'echo "LOI het bo nho" >> nhat_ky.txt',
        'echo "LOI mat ket noi" >> nhat_ky.txt',
        'echo "LOI mat ket noi" >> nhat_ky.txt',
      ],
    },
    predict: {
      code: `echo "OK" > a.txt
grep LOI a.txt && echo "co loi"
grep LOI a.txt || echo "sach se"`,
      question: 'Hai dòng cuối in ra gì?',
      choices: ['sach se', 'co loi', 'co loi\nsach se', 'Không in gì cả'],
      answerIndex: 0,
      explain:
        'grep không tìm thấy "LOI" nên để lại mã thoát 1 (thất bại). Dấu && chỉ chạy vế sau khi vế trước THÀNH CÔNG nên "co loi" không được in; dấu || chỉ chạy vế sau khi vế trước THẤT BẠI nên "sach se" được in. Đây chính là cách người ta viết "nếu có lỗi thì báo" chỉ bằng một dòng.',
    },
    parsons: {
      prompt: 'Xếp các dòng: tạo script đếm lỗi, cấp quyền chạy, rồi chạy nó với file nhật ký.',
      lines: [
        "echo 'SO=$(grep -c LOI $1)' > dem.sh",
        'echo \'echo "Co $SO dong LOI"\' >> dem.sh',
        'chmod +x dem.sh',
        './dem.sh nhat_ky.txt',
      ],
    },
    make: {
      prompt:
        'DỰ ÁN NHỎ CỦA UNIT: viết script bao_cao.sh nhận tên file nhật ký làm tham số và in ra báo cáo.\n\nScript phải làm ĐÚNG ba việc, theo thứ tự:\n1. Đếm số dòng LOI trong file $1, in: Co <số> dong LOI\n2. In loại lỗi nhiều nhất bằng công thức dây chuyền đã học (grep | sort | uniq -c | sort -rn | head -n 1).\n3. Nếu số dòng LOI lớn hơn 2 thì in: CANH BAO\n   ngược lại in: BINH THUONG\n\nSau khi tạo file, nhớ CẤP QUYỀN CHẠY rồi gọi nó với tham số nhat_ky.txt (file đã có sẵn).\n\nMẹo viết script bằng echo: dùng NHÁY ĐƠN để giữ nguyên $1 và $SO trong file — nháy kép sẽ khiến chúng bị thay giá trị ngay lúc ghi, và script của bạn thành file rỗng nghĩa.',
      starterCode: `# tao tung dong cua script bang echo '...' >> bao_cao.sh (nho nhay DON)\n\n# cap quyen chay\n\n# goi script voi tham so nhat_ky.txt\n`,
      testCases: [
        {
          stdinLines: [
            'echo "OK khoi dong" > nhat_ky.txt',
            'echo "LOI mat ket noi" >> nhat_ky.txt',
            'echo "OK tai anh" >> nhat_ky.txt',
            'echo "LOI mat ket noi" >> nhat_ky.txt',
            'echo "LOI het bo nho" >> nhat_ky.txt',
          ],
          expected: 'Co 3 dong LOI\n2 LOI mat ket noi\nCANH BAO',
          match: 'contains',
          hidden: false,
          label: '3 lỗi → báo cáo đủ ba phần và kết luận CANH BAO',
        },
        {
          stdinLines: [
            'echo "OK khoi dong" > nhat_ky.txt',
            'echo "LOI o dia day" >> nhat_ky.txt',
            'echo "OK tai anh" >> nhat_ky.txt',
          ],
          expected: 'Co 1 dong LOI\n1 LOI o dia day\nBINH THUONG',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: file ít lỗi → nhánh else phải chạy (BINH THUONG)',
        },
      ],
      hints: [
        "Ghi từng dòng script bằng nháy ĐƠN: echo 'SO=$(grep -c LOI $1)' > bao_cao.sh — nháy đơn giữ nguyên $1, nháy kép thì không.",
        'Dòng in báo cáo: echo \'echo "Co $SO dong LOI"\' >> bao_cao.sh. Từ dòng thứ hai trở đi luôn dùng >> để nối thêm, dùng > là xoá mất phần đã ghi.',
        'Khối if trong script gồm bốn dòng riêng: if [ $SO -gt 2 ]; then · echo "CANH BAO" · else · echo "BINH THUONG" · fi. Xong thì chmod +x bao_cao.sh rồi ./bao_cao.sh nhat_ky.txt.',
      ],
      sampleSolution: `echo 'SO=$(grep -c LOI $1)' > bao_cao.sh
echo 'echo "Co $SO dong LOI"' >> bao_cao.sh
echo 'grep LOI $1 | sort | uniq -c | sort -rn | head -n 1' >> bao_cao.sh
echo 'if [ $SO -gt 2 ]; then' >> bao_cao.sh
echo 'echo "CANH BAO"' >> bao_cao.sh
echo 'else' >> bao_cao.sh
echo 'echo "BINH THUONG"' >> bao_cao.sh
echo 'fi' >> bao_cao.sh
chmod +x bao_cao.sh
./bao_cao.sh nhat_ky.txt`,
    },
    homework:
      'Về nhà (trên MÁY THẬT): chép script này ra máy bạn, chạy thử trên một file nhật ký thật, rồi mở rộng nó theo nhu cầu của chính bạn — thêm vòng for để chạy qua mọi file .log trong thư mục, hoặc ghi kết quả ra file bằng >> bao_cao_thang.txt. Trên máy thật bạn còn hẹn được lịch chạy tự động (cron trên Linux/macOS, Task Scheduler trên Windows) — đó là lúc script thành thứ làm việc thay bạn cả khi bạn đang ngủ.',
    srsCards: [
      {
        hoi: 'Vì sao phải chmod +x trước khi chạy ./script.sh?',
        dap: 'Vì file văn bản mới tạo không có quyền chạy; hệ thống từ chối với thông báo permission denied. chmod +x bật cờ "được phép chạy" cho file đó.',
      },
      {
        hoi: 'Khi ghi script bằng echo, vì sao phải dùng nháy đơn thay vì nháy kép?',
        dap: 'Nháy kép khiến $1, $SO bị thay bằng giá trị NGAY LÚC GHI (thường là rỗng), nên file lưu ra mất hết biến. Nháy đơn giữ nguyên chữ $1, $SO để script tự thay khi chạy.',
      },
      {
        hoi: 'Mã thoát của một lệnh nói lên điều gì, và ai dùng nó?',
        dap: '0 nghĩa là thành công, khác 0 là thất bại; xem bằng $?. Chính nó quyết định && (chỉ chạy tiếp khi thành công), || (chỉ chạy khi thất bại) và điều kiện của if.',
      },
    ],
  },
]
