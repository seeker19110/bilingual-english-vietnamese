// lessons/gitu4.ts — Chương C4 "Cộng tác GitHub" của khoá Git & GitHub thực hành
// (PR 4/4 khoá Git). unitId 'git-u4' — quy ước "unit ảo", xem ghi chú đầu gitu2.ts.
//
// Dùng tầng KHO TỪ XA GIẢ LẬP thêm ở PR 1 (gitSim.ts): remote/push/fetch/pull/clone chạy
// THẬT trong bộ nhớ, không có mạng thật. Lệnh nội bộ `remote-seed` (chỉ dùng trong bối cảnh
// ẩn `stdinLines`/context của bài, KHÔNG phải lệnh git thật) dựng cảnh "người khác đã push
// trước" — đây là thứ khiến bài pull và bài GIẢI XUNG ĐỘT chấm được.
//
// "Pull Request & review" (l3) không có lệnh git tương ứng — GitHub là giao diện web, không
// nằm trong mô phỏng dòng lệnh. Bài đó dạy lý thuyết + Predict về quy trình, còn phần Make
// (chạy được) là bước CHUẨN BỊ trước PR thật: đẩy một NHÁNH TÍNH NĂNG (không phải main) lên
// GitHub — đúng việc thật sự làm trước khi mở Pull Request.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const GIT_U4_LESSONS: ProgrammingLesson[] = [
  {
    id: 'git-u4-l1',
    unitId: 'git-u4',
    language: 'git',
    title: 'Đưa code lên GitHub lần đầu — remote và push',
    hook: 'Git ghi lịch sử trên MÁY BẠN. Máy hỏng, mất laptop — mất luôn công sức, trừ khi có một bản sao ở nơi khác. GitHub là nơi đó, và git push là cách đưa lịch sử lên.',
    theory:
      'Tới giờ mọi lệnh bạn học đều chạy trên MỘT máy — Git chưa hề "nói chuyện" với đâu khác. GitHub là dịch vụ lưu KHO TỪ XA (remote repository) trên Internet. Ba bước nối kho trên máy bạn với GitHub:\n\n1. TẠO REPO TRỐNG trên GitHub (làm trên trang web GitHub, ngoài phạm vi dòng lệnh) — bạn có một URL, dạng https://github.com/ten-ban/ten-du-an.git\n\n2. KHAI BÁO REMOTE — nói cho Git cục bộ biết "kho từ xa của tôi ở đây, gọi tên nó là origin" (origin là tên quy ước, gần như ai cũng dùng đúng chữ này):\n    git remote add origin <url>\n    git remote -v              # kiểm tra lại đã khai đúng chưa\n\n3. ĐẨY LÊN (push) — gửi commit từ máy bạn lên origin:\n    git push -u origin main\n\nCờ -u (--set-upstream) chỉ cần gõ MỘT LẦN cho mỗi nhánh — nó nói "từ nay nhánh main của tôi THEO DÕI origin/main". Sau lần đầu đó, các lần push/pull sau chỉ cần gõ trơn git push, git pull, không cần lặp lại origin main nữa.\n\nSANDBOX HỌC TẬP KHÔNG CÓ MẠNG THẬT — mô phỏng của bài học dựng một "kho từ xa" giả trong bộ nhớ để bạn tập đúng CÂU LỆNH và hiểu đúng KHÁI NIỆM; các lệnh remote/push/fetch/pull ở đây chạy thật trong mô phỏng, nhưng không nối ra Internet. Việc tạo repo thật trên GitHub và làm lại các bước này với URL thật là phần "về nhà".',
    workedExample: {
      code: `git init
echo "quan cua toi" > README.md
git add .
git commit -m "Them README"
git remote add origin https://github.com/ban/du-an.git
git remote -v
git push -u origin main`,
      stdinLines: [],
    },
    predict: {
      code: `git init
echo "a" > a.txt
git add .
git commit -m "c1"
git push -u origin main`,
      question: 'Chuyện gì xảy ra khi gõ git push mà CHƯA từng git remote add?',
      choices: [
        'Khong co gi day duoc — bao loi vi chua khai remote, phai git remote add truoc',
        'Tự tạo remote mới với tên "origin" rồi đẩy lên',
        'Đẩy thành công lên một kho tạm không tên',
        'Không có gì xảy ra, lệnh bị bỏ qua im lặng',
      ],
      answerIndex: 0,
      explain:
        'push cần biết ĐẨY ĐI ĐÂU. Chưa khai remote thì Git (và mô phỏng) không có địa chỉ nào để gửi tới — báo lỗi rõ ràng thay vì đoán bừa. Phải git remote add origin <url> trước, đúng thứ tự ba bước trong bài.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự lần đầu đưa một dự án lên GitHub.',
      lines: [
        'echo "gioi thieu du an" > README.md',
        'git add README.md',
        'git commit -m "Them README"',
        'git remote add origin https://mo-phong.local/kho.git',
        'git push -u origin main',
      ],
    },
    make: {
      prompt:
        'Kho của bạn TRẮNG. Gõ lệnh để:\n1. Khởi tạo kho.\n2. Tạo README.md nội dung: Cua hang cua toi, commit lời nhắn: Them README\n3. Khai báo remote tên origin, URL: https://mo-phong.local/cua-hang.git\n4. Đẩy nhánh main lên origin, dùng cờ -u (thiết lập theo dõi).',
      starterCode: `# 1. init\n\n# 2. README.md + commit\n\n# 3. khai bao remote\n\n# 4. push -u\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Nhanh "main" duoc thiet lap de theo doi "origin/main"',
          match: 'contains',
          hidden: false,
          label: 'Push có -u thiết lập đúng theo dõi',
        },
        {
          stdinLines: [],
          expected: 'Da day len origin/main',
          match: 'contains',
          hidden: false,
          label: 'Push thành công lên origin/main',
        },
        {
          stdinLines: [],
          expected: 'https://mo-phong.local/cua-hang.git (push)',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: remote -v (nếu học viên tự kiểm) khai đúng URL — kiểm bằng cách chạy lại kèm remote -v',
        },
      ],
      hints: [
        'Ba bước đúng thứ tự: commit trước → remote add → push. Push khi chưa có commit nào thì không có gì để đẩy.',
        'Khai remote: git remote add origin https://mo-phong.local/cua-hang.git.',
        'Đẩy lần đầu, nhớ -u: git push -u origin main.',
      ],
      sampleSolution: `git init
echo "Cua hang cua toi" > README.md
git add README.md
git commit -m "Them README"
git remote add origin https://mo-phong.local/cua-hang.git
git push -u origin main
git remote -v`,
    },
    homework:
      'Về nhà (máy thật, có mạng): tạo tài khoản GitHub nếu chưa có, tạo một repo TRỐNG (không tick "Initialize with README"), rồi làm lại ĐÚNG các bước trong bài này với URL thật GitHub cho bạn. Đây là lần đầu code của bạn có mặt công khai trên Internet.',
    srsCards: [
      {
        hoi: 'Ba bước nối kho trên máy với GitHub lần đầu là gì?',
        dap: 'Tạo repo trống trên GitHub (web) → git remote add origin <url> (khai địa chỉ) → git push -u origin main (đẩy lên, -u thiết lập theo dõi).',
      },
      {
        hoi: 'Cờ -u trong git push -u origin main dùng để làm gì, và có cần gõ lại mỗi lần không?',
        dap: 'Thiết lập nhánh main THEO DÕI origin/main. Chỉ cần gõ MỘT LẦN cho mỗi nhánh — sau đó các lần sau chỉ cần git push trơn.',
      },
    ],
  },
  {
    id: 'git-u4-l2',
    unitId: 'git-u4',
    language: 'git',
    title: 'Kéo về mới nhất — git fetch, git pull, và origin/main',
    hook: 'Bạn và đồng nghiệp cùng làm một dự án. Họ vừa push xong, máy bạn chưa hề biết chuyện đó — cho tới khi bạn gõ đúng lệnh để hỏi GitHub "có gì mới không?"',
    theory:
      'origin/main là "bản ghi nhớ" của máy bạn về nhánh main TRÊN GITHUB, tại lần cuối bạn hỏi thăm nó — KHÔNG tự động cập nhật, bạn phải chủ động hỏi.\n\n    git fetch     # TẢI VỀ thông tin mới nhất từ origin, nhưng KHÔNG động vào nhánh main của bạn\n    git pull      # fetch + GỘP LUÔN vào nhánh hiện tại (fetch rồi merge một bước)\n\nfetch AN TOÀN hơn: nó chỉ cập nhật "bản ghi nhớ" origin/main, cho bạn xem thử người khác đã làm gì trước khi quyết định gộp. pull làm cả hai việc liền — tiện hơn, nhưng gộp luôn nên có thể gây xung đột ngay lúc đó (bài sau).\n\nQUY TẮC AN TOÀN khi làm việc chung: TRƯỚC KHI bắt đầu sửa gì mới trong ngày, luôn git pull trước — để chắc bạn đang làm trên bản MỚI NHẤT, không phải bản cũ từ hôm qua.',
    workedExample: {
      code: `git remote -v
git fetch
git pull`,
      stdinLines: [
        'git init',
        'echo "gia goc" > gia.txt',
        'git add .',
        'git commit -m "Bang gia goc"',
        'git remote add origin https://mo-phong.local/kho.git',
        'git push -u origin main',
        'remote-seed main "Them khuyen mai" khuyen_mai.txt "giam 10 phan tram"',
      ],
    },
    predict: {
      code: `git init
echo "a" > a.txt
git add .
git commit -m "c1"
git remote add origin https://mo-phong.local/kho.git
git push -u origin main
git pull`,
      question:
        'Ngữ cảnh: bạn vừa push xong, chưa ai sửa gì thêm trên origin sau đó. Gõ git pull ngay tiếp theo thì kết quả là gì?',
      choices: [
        'Da cap nhat, khong co gi moi tu origin/main.',
        'TU DONG GOP THAT BAI',
        'Tua nhanh (fast-forward) tu origin/main.',
        'Bi tu choi',
      ],
      answerIndex: 0,
      explain:
        'Khi commit trên máy bạn và trên origin đang TRÙNG NHAU (bạn vừa push xong, chưa ai đẩy thêm gì), pull nhận ra không có gì mới để gộp — báo "đã cập nhật", không tạo thay đổi nào. Đây là ca bình thường, không phải lỗi.',
    },
    parsons: {
      prompt:
        'Xếp thứ tự: khai remote, kiểm tra lại, xem trước có gì mới bằng fetch, rồi mới gộp bằng pull.',
      lines: [
        'git remote add origin https://mo-phong.local/kho.git',
        'git remote -v',
        'git fetch',
        'git pull',
      ],
    },
    make: {
      prompt:
        'Bối cảnh: kho của bạn đã push lên origin trước đó, và ĐỒNG NGHIỆP vừa push thêm một commit mới lên nhánh main (bạn chưa biết chuyện đó).\n\nGõ lệnh để:\n1. Chạy git fetch để xem tin mới từ origin (chưa gộp).\n2. Chạy git pull để lấy commit của đồng nghiệp về máy bạn.\n3. Kiểm tra file họ vừa thêm đã có mặt: ls',
      starterCode: `# 1. fetch de xem tin moi\n\n# 2. pull de gop ve\n\n# 3. kiem tra file moi\n`,
      testCases: [
        {
          stdinLines: [
            'git init',
            'echo "gia goc" > gia.txt',
            'git add .',
            'git commit -m "Bang gia goc"',
            'git remote add origin https://mo-phong.local/kho.git',
            'git push -u origin main',
            'remote-seed main "Them khuyen mai" khuyen_mai.txt "giam 10 phan tram"',
          ],
          expected: 'origin/main -> r2',
          match: 'contains',
          hidden: false,
          label: 'fetch thấy đúng commit mới trên origin/main',
        },
        {
          stdinLines: [
            'git init',
            'echo "gia goc" > gia.txt',
            'git add .',
            'git commit -m "Bang gia goc"',
            'git remote add origin https://mo-phong.local/kho.git',
            'git push -u origin main',
            'remote-seed main "Them khuyen mai" khuyen_mai.txt "giam 10 phan tram"',
          ],
          expected: 'gia.txt\nkhuyen_mai.txt',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: sau pull, ls thấy đủ cả file cũ lẫn file đồng nghiệp vừa thêm',
        },
      ],
      hints: [
        'Xem trước bằng git fetch — nó chỉ tải thông tin, chưa gộp gì vào nhánh của bạn.',
        'Gộp thật bằng git pull — lấy commit mới của đồng nghiệp về.',
        'Kiểm tra bằng ls, phải thấy file khuyen_mai.txt xuất hiện.',
      ],
      sampleSolution: `git fetch
git pull
ls`,
    },
    homework:
      'Về nhà: nếu có bạn cùng làm chung một repo GitHub, thử luồng thật — một người push, người kia git pull. Nếu làm một mình, tự tạo thay đổi trên GitHub qua giao diện web (sửa trực tiếp một file), rồi về máy git pull để thấy thay đổi đó về máy.',
    srsCards: [
      {
        hoi: 'origin/main là gì — có tự cập nhật không?',
        dap: 'Là "bản ghi nhớ" của máy bạn về nhánh main trên GitHub, tại lần cuối bạn hỏi thăm. KHÔNG tự cập nhật — phải chủ động git fetch hoặc git pull.',
      },
      {
        hoi: 'git fetch khác git pull ở chỗ nào?',
        dap: 'fetch chỉ TẢI thông tin mới, không đụng nhánh hiện tại (an toàn hơn, xem trước). pull = fetch + GỘP LUÔN vào nhánh hiện tại (tiện hơn nhưng có thể gây xung đột ngay lúc đó).',
      },
    ],
  },
  {
    id: 'git-u4-l3',
    unitId: 'git-u4',
    language: 'git',
    title: 'Pull Request và review — quy trình cộng tác thật của nghề',
    hook: 'Ở công ty, không ai push thẳng vào main. Mọi thay đổi đi qua một bước trung gian: Pull Request — nơi đồng nghiệp ĐỌC code của bạn TRƯỚC khi nó vào bản chính.',
    theory:
      'PULL REQUEST (viết tắt PR) là một TÍNH NĂNG CỦA GITHUB (không phải lệnh git) — nó là lời đề nghị "hãy gộp nhánh này của tôi vào main". Quy trình chuẩn của nghề:\n\n1. Tạo NHÁNH TÍNH NĂNG (không làm trực tiếp trên main): git switch -c ten-tinh-nang\n2. Làm việc, commit như bình thường trên nhánh đó.\n3. Đẩy NHÁNH ĐÓ lên GitHub (không phải main): git push -u origin ten-tinh-nang\n4. Trên giao diện web GitHub, bấm "New Pull Request" — chọn gộp nhánh của bạn vào main.\n5. ĐỒNG NGHIỆP REVIEW: họ đọc diff, để lại bình luận, có thể yêu cầu bạn sửa thêm.\n6. Sửa xong, push tiếp lên CÙNG NHÁNH — PR tự cập nhật, không cần tạo PR mới.\n7. Được duyệt ("approve") → bấm "Merge" trên GitHub — nhánh tính năng được gộp vào main.\n\nTẠI SAO KHÔNG PUSH THẲNG VÀO MAIN: main luôn phải là bản CHẠY ĐƯỢC. Pull Request là lưới an toàn — một cặp mắt khác nhìn code trước khi nó vào bản chính, bắt được lỗi và cả những cách làm tốt hơn mà một mình bạn không nghĩ ra.\n\nQUAN TRỌNG VỀ MÔ PHỎNG: giao diện Pull Request/Review là TRANG WEB của GitHub — nằm ngoài phạm vi terminal, mô phỏng của bài học KHÔNG dựng được nó. Phần CHẠY ĐƯỢC trong bài là bước 1–3 (chuẩn bị nhánh và đẩy lên) — đúng việc thật bạn làm TRƯỚC khi mở Pull Request. Bước mở PR/review/merge làm trên GitHub thật, ở phần về nhà.',
    workedExample: {
      code: `git switch -c them-mon-moi
echo "ca phe 20000" > mon_moi.txt
git add .
git commit -m "Them mon ca phe"
git push -u origin them-mon-moi`,
      stdinLines: [
        'git init',
        'echo "gia goc" > gia.txt',
        'git add .',
        'git commit -m "Bang gia goc"',
        'git remote add origin https://mo-phong.local/kho.git',
        'git push -u origin main',
      ],
    },
    predict: {
      code: `git init
echo "a" > a.txt
git add .
git commit -m "c1"
git remote add origin https://mo-phong.local/kho.git
git push -u origin main
git switch -c sua-loi-nho
echo "fix" > fix.txt
git add .
git commit -m "Sua loi nho"
git push -u origin sua-loi-nho`,
      question: 'Lệnh push cuối cùng đẩy commit lên NHÁNH NÀO trên origin?',
      choices: ['origin/sua-loi-nho', 'origin/main', 'origin/master', 'origin/fix'],
      answerIndex: 0,
      explain:
        'Trước khi mở Pull Request, bạn đẩy đúng NHÁNH TÍNH NĂNG (sua-loi-nho) lên GitHub, không phải main — main phải luôn là bản chạy được, và PR cho một cặp mắt khác đọc/review code trước khi nó vào bản chính.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự chuẩn bị cho một Pull Request: khai remote, tách nhánh, làm việc, rồi đẩy đúng nhánh đó (không phải main).',
      lines: [
        'git remote add origin https://mo-phong.local/kho.git',
        'git switch -c them-tinh-nang',
        'echo "tinh nang moi" > tinh_nang.txt',
        'git add tinh_nang.txt',
        'git commit -m "Them tinh nang moi"',
        'git push -u origin them-tinh-nang',
      ],
    },
    make: {
      prompt:
        'Bối cảnh: kho của bạn đã có main, đã push lên origin trước đó.\n\nGõ lệnh chuẩn bị một Pull Request: \n1. Tạo và chuyển sang nhánh tinh-chinh-gia.\n2. Sửa gia.txt thành: tra da 6000 (thay giá cũ).\n3. Commit lời nhắn: Dieu chinh gia tra da\n4. Đẩy ĐÚNG NHÁNH NÀY (không phải main) lên origin.',
      starterCode: `# Kho da co main, da push len origin\n# 1. tao nhanh moi\n\n# 2. sua gia\n\n# 3. commit\n\n# 4. push dung nhanh (khong phai main)\n`,
      testCases: [
        {
          stdinLines: [
            'git init',
            'echo "tra da 5000" > gia.txt',
            'git add .',
            'git commit -m "Bang gia goc"',
            'git remote add origin https://mo-phong.local/kho.git',
            'git push -u origin main',
          ],
          expected: 'Da chuyen sang nhanh moi "tinh-chinh-gia"',
          match: 'contains',
          hidden: false,
          label: 'Tạo đúng nhánh tính năng, không làm thẳng trên main',
        },
        {
          stdinLines: [
            'git init',
            'echo "tra da 5000" > gia.txt',
            'git add .',
            'git commit -m "Bang gia goc"',
            'git remote add origin https://mo-phong.local/kho.git',
            'git push -u origin main',
          ],
          expected: 'Da day len origin/tinh-chinh-gia',
          match: 'contains',
          hidden: false,
          label: 'Đẩy ĐÚNG nhánh tính năng lên origin, không phải main',
        },
      ],
      hints: [
        'Tạo nhánh riêng, KHÔNG sửa trực tiếp trên main: git switch -c tinh-chinh-gia.',
        'Sửa file, add, commit như bình thường trên nhánh mới.',
        'Đẩy lên đúng tên nhánh vừa tạo: git push -u origin tinh-chinh-gia (không phải origin main).',
      ],
      sampleSolution: `git switch -c tinh-chinh-gia
echo "tra da 6000" > gia.txt
git add gia.txt
git commit -m "Dieu chinh gia tra da"
git push -u origin tinh-chinh-gia`,
    },
    homework:
      'Về nhà (GitHub thật): đẩy một nhánh tính năng lên repo của bạn (giống bài này), rồi vào GitHub bấm "Compare & pull request". Đọc kỹ giao diện diff mà GitHub hiện — đây chính là thứ đồng nghiệp bạn sẽ nhìn thấy khi review code của bạn. Nếu có thể, tự mở PR rồi tự merge để thấy trọn quy trình.',
    srsCards: [
      {
        hoi: 'Pull Request là lệnh git hay tính năng của GitHub?',
        dap: 'Tính năng của GIAO DIỆN WEB GitHub — không phải lệnh git. Nó là lời đề nghị gộp một nhánh vào main, kèm chỗ để đồng nghiệp review trước khi merge.',
      },
      {
        hoi: 'Vì sao không push thẳng vào main mà nên qua Pull Request?',
        dap: 'main phải luôn là bản chạy được. PR cho một cặp mắt khác đọc/review code trước khi nó vào bản chính — bắt lỗi và góp ý mà một mình khó thấy.',
      },
      {
        hoi: 'Bước "chạy được trong terminal" trước khi mở Pull Request là gì?',
        dap: 'Tạo nhánh tính năng (git switch -c), làm việc và commit trên đó, rồi đẩy ĐÚNG NHÁNH ĐÓ lên GitHub (git push -u origin ten-nhanh) — không phải main.',
      },
    ],
  },
  {
    id: 'git-u4-l4',
    unitId: 'git-u4',
    language: 'git',
    title: 'Giải xung đột thật — khi hai người cùng sửa một chỗ',
    hook: 'Bạn và đồng nghiệp CÙNG sửa một dòng trong cùng một file, không hay biết nhau. Ai push trước thì được; người push sau sẽ thấy Git dừng lại, bắt phải TỰ QUYẾT ĐỊNH giữ bản nào.',
    theory:
      'XUNG ĐỘT (conflict) xảy ra khi git pull cố gộp về mà HAI BÊN cùng sửa CÙNG một chỗ trong CÙNG một file — Git không tự đoán được ai đúng, nó DỪNG LẠI và chèn dấu đánh dấu ngay trong file:\n\n    <<<<<<< HEAD\n    (nội dung của BẠN)\n    =======\n    (nội dung của origin — người kia)\n    >>>>>>> origin/main\n\nQUY TRÌNH GIẢI XUNG ĐỘT, đúng bốn bước:\n1. git pull → thấy dòng "TU DONG GOP THAT BAI" kèm tên file bị xung đột.\n2. MỞ FILE, đọc cả hai bản giữa các dấu — QUYẾT ĐỊNH giữ bản nào (hoặc viết lại kết hợp cả hai).\n3. XOÁ HẾT ba dòng dấu (<<<<<<<, =======, >>>>>>>) — chỉ để lại đúng nội dung bạn chọn.\n4. git add <file> rồi git commit -m "..." để HOÀN TẤT cuộc gộp (một commit thường, không cần cờ gì đặc biệt).\n\nCon trỏ đang "gộp dở": TRƯỚC khi hoàn tất bước 4, mọi lệnh git khác vẫn dùng được bình thường (xem status, diff…), nhưng bạn KHÔNG pull tiếp cho tới khi giải quyết xong xung đột hiện tại.\n\nXUNG ĐỘT KHÔNG PHẢI LỖI CỦA AI — hai người cùng làm việc trên một dự án sớm muộn cũng gặp, càng làm nhóm đông càng thường xuyên. Bình tĩnh đọc kỹ hai bản, chọn đúng, là xong.',
    workedExample: {
      code: `git pull
echo "ban da chon" > f.txt
git add f.txt
git commit -m "Giai xung dot: chon ban cuoi cung"
cat f.txt`,
      stdinLines: [
        'git init',
        'echo "goc" > f.txt',
        'git add .',
        'git commit -m "c1"',
        'git remote add origin https://mo-phong.local/kho.git',
        'git push -u origin main',
        'echo "ban cua toi" > f.txt',
        'git add .',
        'git commit -m "sua o may toi"',
        'remote-seed main "sua o remote" f.txt "ban tren github"',
      ],
    },
    predict: {
      code: `git init
echo "goc" > f.txt
git add .
git commit -m "c1"
git remote add origin https://mo-phong.local/kho.git
git push -u origin main
echo "ban toi" > f.txt
git add .
git commit -m "sua o may toi"
remote-seed main "sua o remote" f.txt "ban tren github"
git pull`,
      question: 'Dòng nào xuất hiện trong output khi git pull cuối cùng phát hiện xung đột?',
      choices: [
        'TU DONG GOP THAT BAI',
        'Da cap nhat, khong co gi moi',
        'Tua nhanh (fast-forward)',
        'Da hoan tat gop',
      ],
      answerIndex: 0,
      explain:
        'Hai bên cùng sửa CÙNG một chỗ trong f.txt — Git không tự đoán được ai đúng, nó dừng lại và báo "TU DONG GOP THAT BAI", chèn dấu đánh dấu vào file. Phần còn lại là CON NGƯỜI quyết định giữ nội dung nào, xoá sạch dấu đánh dấu, rồi git add + git commit để hoàn tất cuộc gộp.',
    },
    parsons: {
      prompt:
        'Bối cảnh: git pull VỪA báo xung đột ở file co_san.txt (dấu <<<<<<< đã được chèn vào file). Xếp đúng thứ tự PHẦN CÒN LẠI: sửa file cho đúng, add, rồi commit hoàn tất.',
      lines: [
        'echo "noi dung da chon" > co_san.txt',
        'git add co_san.txt',
        'git commit -m "Giai quyet xung dot o co_san.txt"',
      ],
    },
    make: {
      prompt:
        'Bối cảnh: bạn và "người khác" đã CÙNG SỬA file gia.txt — bạn sửa thành "tra da 6000" và commit trên máy, còn họ đã sửa thành "tra da 5500" và push lên trước bạn.\n\nGõ lệnh để:\n1. git pull — sẽ báo xung đột ở gia.txt.\n2. Chọn giải pháp: ghi đè gia.txt thành nội dung bạn quyết định: tra da 5800 (giá dung hoà).\n3. git add gia.txt\n4. Commit hoàn tất cuộc gộp với lời nhắn: Thong nhat gia sau khi ban bac',
      starterCode: `# Nguoi khac da push truoc, ban cung sua chung file\n# 1. pull - se bao xung dot\n\n# 2. sua lai file theo quyet dinh cuoi\n\n# 3. add\n\n# 4. commit hoan tat gop\n`,
      testCases: [
        {
          stdinLines: [
            'git init',
            'echo "tra da 5000" > gia.txt',
            'git add .',
            'git commit -m "c1"',
            'git remote add origin https://mo-phong.local/kho.git',
            'git push -u origin main',
            'echo "tra da 6000" > gia.txt',
            'git add .',
            'git commit -m "toi tang gia"',
            'remote-seed main "ho tang gia truoc" gia.txt "tra da 5500"',
          ],
          expected: 'TU DONG GOP THAT BAI',
          match: 'contains',
          hidden: false,
          label: 'git pull báo đúng xung đột (không im lặng giả vờ ổn)',
        },
        {
          stdinLines: [
            'git init',
            'echo "tra da 5000" > gia.txt',
            'git add .',
            'git commit -m "c1"',
            'git remote add origin https://mo-phong.local/kho.git',
            'git push -u origin main',
            'echo "tra da 6000" > gia.txt',
            'git add .',
            'git commit -m "toi tang gia"',
            'remote-seed main "ho tang gia truoc" gia.txt "tra da 5500"',
          ],
          expected: 'Da hoan tat gop',
          match: 'contains',
          hidden: false,
          label: 'Commit cuối hoàn tất cuộc gộp thành công',
        },
        {
          stdinLines: [
            'git init',
            'echo "tra da 5000" > gia.txt',
            'git add .',
            'git commit -m "c1"',
            'git remote add origin https://mo-phong.local/kho.git',
            'git push -u origin main',
            'echo "tra da 6000" > gia.txt',
            'git add .',
            'git commit -m "toi tang gia"',
            'remote-seed main "ho tang gia truoc" gia.txt "tra da 5500"',
          ],
          expected: 'tra da 5800',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: cat gia.txt cuối cùng đúng nội dung đã thống nhất (không sót dấu xung đột)',
        },
      ],
      hints: [
        'git pull trước — nó sẽ báo TU DONG GOP THAT BAI ở gia.txt, đây là điều đúng, không phải lỗi cần sợ.',
        'Ghi đè lại file bằng quyết định cuối cùng: echo "tra da 5800" > gia.txt (xoá sạch nội dung cũ, không giữ dấu <<<<<<< nào).',
        'Hoàn tất: git add gia.txt rồi git commit -m "Thong nhat gia sau khi ban bac" — commit này KHÔNG cần -m đặc biệt, viết bình thường.',
      ],
      sampleSolution: `git pull
echo "tra da 5800" > gia.txt
git add gia.txt
git commit -m "Thong nhat gia sau khi ban bac"
cat gia.txt`,
    },
    homework:
      'Về nhà: dựng một cuộc xung đột thật với chính mình — clone cùng một repo GitHub vào HAI thư mục khác nhau trên máy, sửa cùng một dòng ở cả hai, push một bên trước, rồi bên còn lại pull để tự tay giải xung đột thật (không phải mô phỏng).',
    srsCards: [
      {
        hoi: 'Khi git pull báo xung đột, Git chèn gì vào ngay trong file để đánh dấu hai bản?',
        dap: 'Chèn dấu <<<<<<< HEAD (bản của bạn) rồi ======= (ranh giới) rồi >>>>>>> origin/main (bản của người kia) — bạn phải tự đọc, chọn nội dung đúng, rồi xoá sạch cả ba dòng dấu đó.',
      },
      {
        hoi: 'Bốn bước giải xung đột đúng thứ tự là gì?',
        dap: '① git pull thấy báo xung đột → ② mở file, đọc và quyết định giữ nội dung nào → ③ xoá hết dấu <<<<<<< / ======= / >>>>>>> → ④ git add <file> rồi git commit để hoàn tất cuộc gộp.',
      },
    ],
  },
  {
    id: 'git-u4-l5',
    unitId: 'git-u4',
    language: 'git',
    title: '--force vs --force-with-lease — khi push bị từ chối',
    hook: 'Bạn gõ git push, Git từ chối: "origin có commit bạn chưa có". Có một lệnh "ép buộc" bỏ qua cảnh báo này — và nó nguy hiểm đủ để bạn phải hiểu rõ trước khi bao giờ dùng tới.',
    theory:
      'Git TỪ CHỐI push khi origin có commit mà máy bạn CHƯA CÓ — đây là lưới an toàn mặc định, ngăn bạn vô tình GHI ĐÈ mất công sức của người khác.\n\nCách đúng thường gặp nhất: git pull trước, giải xung đột nếu có, rồi push lại — máy bạn giờ đã có đủ mọi commit nên push sẽ qua bình thường.\n\nNHƯNG có tình huống bạn THỰC SỰ muốn ghi đè (ví dụ: bạn vừa rebase, lịch sử "đổi hình dạng" một cách có chủ đích, và bạn CHẮC CHẮN muốn origin theo đúng bản mới). Hai lựa chọn:\n\n    git push --force              # ép buộc TUYỆT ĐỐI, KHÔNG kiểm tra gì cả — ghi đè mọi thứ trên origin\n    git push --force-with-lease   # ép buộc CÓ KIỂM TRA: chỉ ghi đè nếu origin ĐÚNG như bạn nhớ lần cuối kiểm tra\n\nKHÁC BIỆT QUAN TRỌNG: --force là "cứ ghi đè, tôi không cần biết ai vừa làm gì thêm" — nếu đúng lúc đó có người khác vừa push, công sức của họ MẤT SẠCH mà không ai hay. --force-with-lease AN TOÀN HƠN: nó kiểm tra origin có đúng như bạn nhớ hay không TRƯỚC KHI ghi đè — nếu có ai vừa push thêm mà bạn chưa biết, nó TỪ CHỐI, buộc bạn phải fetch/pull rồi xem lại.\n\nQUY TẮC NGHỀ: KHÔNG BAO GIỜ dùng --force trên nhánh dùng chung (như main). Cần ép buộc → luôn --force-with-lease. --force chỉ chấp nhận được trên nhánh CỦA RIÊNG BẠN, chưa ai khác đụng vào.',
    workedExample: {
      // Lưu ý cho người soạn bài tiếp theo: chayLenh() DỪNG NGAY ở lệnh lỗi đầu tiên, nên
      // không thể "thử push thường (lỗi) rồi push --force-with-lease (thành công)" trong CÙNG
      // một script — ví dụ mẫu/code chạy được của mọi bài BẮT BUỘC không lỗi. Ca "bị từ chối"
      // đã có ở phần Predict (nơi lỗi là đáp án đúng); ở đây chỉ demo NHÁNH THÀNH CÔNG.
      code: `git push --force-with-lease origin main`,
      stdinLines: [
        'git init',
        'echo "goc" > f.txt',
        'git add .',
        'git commit -m "c1"',
        'git remote add origin https://mo-phong.local/kho.git',
        'git push -u origin main',
        'remote-seed main "nguoi khac da sua" f.txt "ban cua nguoi khac"',
        'echo "ban cua toi" > f.txt',
        'git add .',
        'git commit -m "sua o may toi khong pull"',
      ],
    },
    predict: {
      code: `git init
echo "goc" > f.txt
git add .
git commit -m "c1"
git remote add origin https://mo-phong.local/kho.git
git push -u origin main
remote-seed main "nguoi khac da sua" f.txt "ban cua nguoi khac"
echo "ban toi" > f.txt
git add .
git commit -m "sua khong pull"
git push origin main`,
      question: 'Lệnh push cuối cùng (KHÔNG có cờ ép buộc, và bạn chưa pull) làm gì?',
      choices: [
        'Khong day duoc gi ca — bi tu choi vi origin co commit ban chua co o may',
        'Đẩy thành công lên origin/main',
        'Tự động chuyển sang --force-with-lease',
        'Xoá sạch lịch sử trên origin',
      ],
      answerIndex: 0,
      explain:
        'Git từ chối push vì origin có commit (của "người khác") mà máy bạn chưa có — lưới an toàn mặc định. Muốn ép buộc phải dùng --force-with-lease (kiểm tra trước khi ghi đè) chứ không phải --force (ghi đè bất chấp).',
    },
    parsons: {
      prompt:
        'Xếp thứ tự: khai remote, đẩy lần đầu, rồi dùng đúng cờ ép buộc AN TOÀN nếu cần ghi đè về sau.',
      lines: [
        'git remote add origin https://mo-phong.local/kho.git',
        'git push -u origin main',
        'git push --force-with-lease origin main',
      ],
    },
    make: {
      prompt:
        'Bối cảnh: bạn vừa sửa file f.txt và commit, nhưng KHÔNG pull trước — trong lúc đó, người khác đã push một thay đổi khác lên f.txt rồi (bạn đã thấy ca push bị từ chối ở phần Predict phía trên).\n\nGõ đúng MỘT lệnh: dùng git push --force-with-lease để ép buộc AN TOÀN (không dùng --force trần, không dùng push thường — push thường sẽ bị từ chối và DỪNG cả bài ở đó).',
      starterCode: `# Nguoi khac da push truoc ma ban chua biet\n# push force-with-lease (khong dung push thuong o day)\n`,
      testCases: [
        {
          stdinLines: [
            'git init',
            'echo "goc" > f.txt',
            'git add .',
            'git commit -m "c1"',
            'git remote add origin https://mo-phong.local/kho.git',
            'git push -u origin main',
            'remote-seed main "nguoi khac da sua" f.txt "ban cua nguoi khac"',
            'echo "ban cua toi" > f.txt',
            'git add .',
            'git commit -m "sua o may toi khong pull"',
          ],
          expected: 'Da day len origin/main',
          match: 'contains',
          hidden: false,
          label: 'Push force-with-lease thành công dù origin đã có commit khác',
        },
        {
          stdinLines: [
            'git init',
            'echo "goc" > f.txt',
            'git add .',
            'git commit -m "c1"',
            'git remote add origin https://mo-phong.local/kho.git',
            'git push -u origin main',
            'remote-seed main "nguoi khac da sua" f.txt "ban cua nguoi khac"',
            'echo "ban cua toi" > f.txt',
            'git add .',
            'git commit -m "sua o may toi khong pull"',
          ],
          expected: 'Da day len origin/main (c2)',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đúng commit CỦA BẠN (c2) được đẩy lên, không phải commit của người khác',
        },
      ],
      hints: [
        'KHÔNG gõ git push thường ở bài này — nó sẽ bị từ chối và dừng cả bài (đã học ca đó ở phần Predict rồi).',
        'Gõ thẳng: git push --force-with-lease origin main.',
        'force-with-lease vẫn kiểm tra trước khi ghi đè, nhưng ở đây bạn đã CHỦ ĐỘNG chọn ghi đè vì biết rõ mình đang làm gì.',
      ],
      sampleSolution: `git push --force-with-lease origin main`,
    },
    homework:
      'Về nhà: đọc tài liệu chính thức của Git về --force-with-lease (gõ "git force with lease" trên công cụ tìm kiếm bạn quen dùng) — tìm hiểu thêm ca nó vẫn có thể thất bại (ví dụ ai đó fetch gần đây làm "lease" của bạn không còn khớp). Không cần thử --force thật trên repo có người khác dùng chung.',
    srsCards: [
      {
        hoi: 'Vì sao Git mặc định TỪ CHỐI push khi origin có commit bạn chưa có?',
        dap: 'Đây là lưới an toàn mặc định — ngăn bạn vô tình GHI ĐÈ mất công sức của người khác mà không hay biết.',
      },
      {
        hoi: '--force khác --force-with-lease ở điểm nào?',
        dap: '--force ghi đè TUYỆT ĐỐI, không kiểm tra gì. --force-with-lease kiểm tra origin có đúng như bạn nhớ lần cuối hay không TRƯỚC KHI ghi đè — an toàn hơn nhiều.',
      },
      {
        hoi: 'Quy tắc nghề về dùng --force là gì?',
        dap: 'KHÔNG BAO GIỜ dùng --force trên nhánh dùng chung (như main). Cần ép buộc thì luôn dùng --force-with-lease; --force chỉ chấp nhận được trên nhánh riêng của bạn.',
      },
    ],
  },
]
