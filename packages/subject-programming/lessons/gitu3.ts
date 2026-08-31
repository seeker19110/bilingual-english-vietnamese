// lessons/gitu3.ts — Chương C3 "Hoàn tác" của khoá Git & GitHub thực hành (PR 4/4 khoá Git).
// unitId 'git-u3' — quy ước "unit ảo" của tầng khoá ngắn, xem ghi chú đầu gitu2.ts.
//
// Ba bài: hoàn tác AN TOÀN (restore/restore --staged/revert) tách hẳn khỏi hoàn tác NGUY HIỂM
// (reset ba mức) — ranh giới này CHÍNH LÀ nội dung sư phạm quan trọng nhất chương, không phải
// chi tiết phụ. reflog là "lưới cứu hộ" đóng bài cuối.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const GIT_U3_LESSONS: ProgrammingLesson[] = [
  {
    id: 'git-u3-l1',
    unitId: 'git-u3',
    language: 'git',
    title: 'Hoàn tác AN TOÀN — git restore',
    hook: 'Bạn thử sửa một đoạn code, chạy hỏng, muốn quay về bản trước — nhưng chưa hề git add gì cả. Xoá tay từng dòng vừa gõ là cách chậm và dễ sai; git restore làm việc đó trong một lệnh.',
    theory:
      'git restore lấy lại nội dung CŨ, ghi đè lên bản đang sửa dở. Hai dạng, dùng cho hai tình huống KHÁC NHAU:\n\n    git restore <file>            # bỏ thay đổi CHƯA ADD — về lại bản đã add (hoặc commit gần nhất)\n    git restore --staged <file>   # bỏ file KHỎI VÙNG CHỜ — nội dung trong thư mục làm việc GIỮ NGUYÊN\n\nPhân biệt hai lệnh này là điều quan trọng nhất bài: `restore` không --staged MẤT nội dung bạn vừa sửa (ghi đè bằng bản cũ); `restore --staged` chỉ RÚT file khỏi vùng chờ, chữ bạn gõ vẫn còn nguyên trong file — bạn chỉ đang nói "khoan, tôi chưa muốn add cái này".\n\nAN TOÀN nghĩa là gì ở đây? git restore (không --staged) tuy MẤT thay đổi chưa add, nhưng nó chỉ mất đúng phần CHƯA TỪNG ĐƯỢC ADD — thứ chưa hề "chốt" vào đâu cả nên về bản chất giống Ctrl+Z tới điểm gần nhất bạn đã lưu. Nó không đụng tới LỊCH SỬ COMMIT — khác hẳn với reset (bài sau), vốn có thể xoá cả commit đã tạo.\n\nQUY TẮC: sửa hỏng, CHƯA add → git restore <file>. Add nhầm, chưa commit → git restore --staged <file>.',
    workedExample: {
      code: `git init
echo "goc" > f.txt
git add .
git commit -m "c1"
echo "linh tinh" > f.txt
git restore f.txt
cat f.txt`,
      stdinLines: [],
    },
    predict: {
      code: `git init
echo "ban ok" > gia.txt
git add .
git commit -m "Bang gia dung"
echo "go nham lung tung" > gia.txt
git restore gia.txt
cat gia.txt`,
      question: 'Sau git restore gia.txt, lệnh cat gia.txt in ra gì?',
      choices: ['ban ok', 'go nham lung tung', 'gia.txt', 'da khoi phuc'],
      answerIndex: 0,
      explain:
        'git restore ghi đè thư mục làm việc bằng nội dung đã commit gần nhất (vì file này chưa được add lần thứ hai) — "go nham lung tung" bị xoá mất, gia.txt về đúng "ban ok". Đây chính là công dụng của restore: hoàn tác thay đổi CHƯA ADD.',
    },
    parsons: {
      prompt:
        'Xếp thứ tự: sửa hỏng một file ĐÃ CÓ SẴN (chưa add), rồi hoàn tác lại đúng bản gần nhất.',
      lines: [
        'echo "sua hong roi" > co_san.txt',
        'git status',
        'git restore co_san.txt',
        'cat co_san.txt',
      ],
    },
    make: {
      prompt:
        'Kho của bạn đã có sẵn một commit (file gia.txt = "tra sua 15000").\n\nGõ các lệnh để:\n1. Sửa NHẦM gia.txt thành: xxx go nham xxx\n2. Nhận ra sai, hoàn tác lại (CHƯA add nên dùng git restore, không phải reset).\n3. In nội dung file ra để chứng minh đã về đúng bản cũ.',
      starterCode: `# Kho da co san gia.txt = "tra sua 15000"\n# 1. sua nham file\n\n# 2. hoan tac\n\n# 3. kiem tra lai\n`,
      testCases: [
        {
          stdinLines: [
            'git init',
            'echo "tra sua 15000" > gia.txt',
            'git add .',
            'git commit -m "Bang gia goc"',
          ],
          expected: 'tra sua 15000',
          match: 'contains',
          hidden: false,
          label: 'Sau khi hoàn tác, gia.txt về đúng nội dung cũ',
        },
        {
          stdinLines: [
            'git init',
            'echo "tra sua 15000" > gia.txt',
            'git add .',
            'git commit -m "Bang gia goc"',
          ],
          expected: 'thu muc lam viec sach',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: git status cuối cùng xác nhận thư mục đã sạch (restore thành công hoàn toàn)',
        },
      ],
      hints: [
        'Ghi nhầm bằng: echo "xxx go nham xxx" > gia.txt.',
        'Vì CHƯA git add nội dung nhầm, dùng git restore gia.txt (không phải --staged, không phải reset).',
        'Kiểm tra lại bằng: cat gia.txt, rồi git status để chắc thư mục đã sạch.',
      ],
      sampleSolution: `echo "xxx go nham xxx" > gia.txt
git restore gia.txt
cat gia.txt
git status`,
    },
    homework:
      'Về nhà: thử một lần "sửa hỏng có chủ đích" trên repo thật của bạn — sửa một file, KHÔNG add, rồi git restore để hoàn tác. Quan sát: nội dung có về đúng như trước không?',
    srsCards: [
      {
        hoi: 'git restore <file> (không --staged) dùng khi nào?',
        dap: 'Khi vừa sửa hỏng một file mà CHƯA git add — nó ghi đè thư mục làm việc bằng bản đã add (hoặc commit gần nhất), MẤT nội dung vừa sửa.',
      },
      {
        hoi: 'git restore <file> khác git restore --staged <file> ở chỗ nào?',
        dap: 'restore (không --staged): mất nội dung chưa add, ghi đè bằng bản cũ. restore --staged: chỉ RÚT file khỏi vùng chờ, chữ vừa gõ vẫn còn nguyên trong file.',
      },
    ],
  },
  {
    id: 'git-u3-l2',
    unitId: 'git-u3',
    language: 'git',
    title: 'Hoàn tác AN TOÀN tiếp — restore --staged và git revert',
    hook: 'Hai tình huống khác nhau: (1) bạn git add nhầm một file chưa sẵn sàng commit — chưa hề mất công viết gì. (2) một commit ĐÃ ĐẨY LÊN GitHub hoá ra sai — không thể coi như chưa từng có, phải SỬA CÔNG KHAI.',
    theory:
      'GIT RESTORE --STAGED — rút khỏi vùng chờ, KHÔNG mất nội dung:\n    git add file_chua_xong.txt        # add nhầm, còn dở dang\n    git restore --staged file_chua_xong.txt   # rút ra — chữ vẫn còn trong file\n\nKhác biệt với restore thường: --staged CHỈ tác động vùng chờ, không đụng thư mục làm việc.\n\nGIT REVERT — hoàn tác một COMMIT ĐÃ CHỐT (khác hẳn restore, vốn chỉ xử lý thứ CHƯA commit):\n    git revert <ma_commit>\n\nrevert KHÔNG xoá commit cũ, KHÔNG viết lại lịch sử — nó tạo một COMMIT MỚI làm ngược lại đúng những gì commit kia đã làm. Lịch sử vẫn còn nguyên "đã từng có sai sót này, và đây là commit đã sửa nó" — điều này CỰC KỲ quan trọng khi commit đã đẩy lên GitHub và người khác có thể đã tải về: xoá lịch sử ở đó (như reset --hard rồi ép đẩy lại) làm hỏng bản của người khác, còn revert thì an toàn vì chỉ THÊM một commit mới.\n\nQUY TẮC: commit CHƯA lên GitHub, muốn xoá dấu vết → có thể cân nhắc reset (bài sau, và phải cẩn trọng). Commit ĐÃ lên GitHub, có người khác dùng chung → LUÔN revert, không bao giờ reset --hard rồi ép đẩy lại.',
    workedExample: {
      code: `git init
echo "a" > a.txt
git add .
git commit -m "them a"
echo "b" > b.txt
git add .
git commit -m "them b"
git revert c2
ls`,
      stdinLines: [],
    },
    predict: {
      code: `git init
echo "a" > a.txt
git add .
git commit -m "them a"
echo "b" > b.txt
git add .
git commit -m "them b: co loi"
git revert c2
git log --oneline`,
      question: 'Dòng ĐẦU TIÊN (mới nhất) trong git log --oneline sau git revert c2 là gì?',
      choices: [
        'c3 Revert "them b: co loi"',
        'c2 them b: co loi',
        'c1 them a',
        'Khong co commit nao',
      ],
      answerIndex: 0,
      explain:
        'revert không bao giờ xoá gì — nó THÊM một commit mới (c3, lời nhắn "Revert ..." nhắc thẳng tới commit gốc) làm ngược lại việc c2 đã làm. Lịch sử có đủ cả ba: c1 (nền), c2 (commit có lỗi, vẫn còn đó để tra cứu), c3 (commit sửa lỗi bằng cách revert).',
    },
    parsons: {
      prompt: 'Xếp thứ tự: add nhầm một file rồi rút khỏi vùng chờ mà KHÔNG mất nội dung.',
      lines: [
        'echo "dang viet do" > nhap.txt',
        'git add nhap.txt',
        'git restore --staged nhap.txt',
        'git status',
      ],
    },
    make: {
      prompt:
        'Kho của bạn TRẮNG. Gõ lệnh để:\n1. Khởi tạo kho, tạo mota.txt = "ban dau", commit lời nhắn: c1\n2. Tạo tiếp gia.txt = "gia sai roi", commit lời nhắn: gia sai\n3. Nhận ra commit "gia sai" là sai — dùng git revert để hoàn tác nó AN TOÀN (không xoá lịch sử).\n4. Xem lại lịch sử dạng gọn để thấy đủ ba commit.',
      starterCode: `# 1. init + mota.txt + commit c1\n\n# 2. gia.txt + commit "gia sai"\n\n# 3. revert commit sai\n\n# 4. xem lai lich su\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Revert "gia sai"',
          match: 'contains',
          hidden: false,
          label: 'Có commit revert với lời nhắn nhắc đúng commit gốc',
        },
        {
          stdinLines: [],
          expected: 'Da tao COMMIT MOI de hoan lai',
          match: 'contains',
          hidden: false,
          label: 'Output xác nhận revert TẠO commit mới, không xoá lịch sử',
        },
        {
          stdinLines: [],
          expected: 'c3',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: có đủ commit thứ ba (revert), không phải chỉ 2 commit',
        },
      ],
      hints: [
        'Hai commit đầu bình thường: echo … > file rồi git add . && git commit -m "…".',
        'Muốn revert commit thứ hai thì dùng đúng mã của nó: git revert c2 (mã commit tăng dần c1, c2…).',
        'Xong thì git log --oneline để thấy đủ ba commit, không phải hai.',
      ],
      sampleSolution: `git init
echo "ban dau" > mota.txt
git add mota.txt
git commit -m "c1"
echo "gia sai roi" > gia.txt
git add gia.txt
git commit -m "gia sai"
git revert c2
git log --oneline`,
    },
    homework:
      'Về nhà: tìm một dự án mã nguồn mở lớn trên GitHub (ví dụ một thư viện bạn hay dùng), tìm trong lịch sử commit của nó một commit có chữ "Revert" trong lời nhắn. Đọc xem họ hoàn tác cái gì và vì sao — đây là cách revert được dùng thật ngoài đời.',
    srsCards: [
      {
        hoi: 'git restore --staged khác git restore (không --staged) ở điểm nào?',
        dap: '--staged chỉ RÚT file khỏi vùng chờ, nội dung file GIỮ NGUYÊN. Không --staged thì ghi đè nội dung, MẤT thay đổi chưa add.',
      },
      {
        hoi: 'git revert làm gì với commit cũ — xoá nó đi hay giữ lại?',
        dap: 'GIỮ LẠI. revert không xoá gì cả — nó tạo một COMMIT MỚI làm ngược lại đúng việc commit cũ đã làm, nên lịch sử vẫn còn đầy đủ.',
      },
      {
        hoi: 'Vì sao commit đã lên GitHub thì nên revert thay vì xoá lịch sử?',
        dap: 'Người khác có thể đã tải commit đó về. Xoá lịch sử (kiểu reset rồi ép đẩy lại) làm hỏng bản của họ; revert chỉ THÊM commit mới nên an toàn cho mọi người đang dùng chung.',
      },
    ],
  },
  {
    id: 'git-u3-l3',
    unitId: 'git-u3',
    language: 'git',
    title: 'Hoàn tác NGUY HIỂM — git reset ba mức, và reflog cứu hộ',
    hook: 'Hai bài trước là hoàn tác AN TOÀN — không mất gì ngoài ý muốn. Bài này khác: git reset có thể XOÁ VĨNH VIỄN công sức chưa lưu ở đâu khác. Đọc kỹ trước khi gõ theo.',
    theory:
      'git reset dời con trỏ nhánh về một commit CŨ hơn — ba mức, càng về sau càng "sâu tay":\n\n    git reset --soft <commit>    # dời nhánh, GIỮ NGUYÊN vùng chờ (như thể mọi thứ đã add lại)\n    git reset --mixed <commit>   # dời nhánh, XOÁ vùng chờ (mặc định nếu không ghi cờ nào)\n    git reset --hard <commit>    # dời nhánh, XOÁ CẢ thư mục làm việc — MẤT VĨNH VIỄN thứ chưa add\n\nCẢ BA đều KHÔNG xoá file đã COMMIT — chúng chỉ dời con trỏ nhánh, các commit "phía sau" tạm thời không nhánh nào trỏ tới nữa (coi như "mồ côi"), nhưng dữ liệu vẫn còn trong Git một thời gian.\n\n--hard NGUY HIỂM Ở ĐÂU: nó ghi đè thư mục làm việc — bất cứ thứ gì bạn gõ mà CHƯA TỪNG git add thì KHÔNG có bản sao nào ở đâu cả, mất là mất thật. Trước khi gõ reset --hard, luôn tự hỏi: "có gì trong thư mục làm việc mà tôi chưa từng add không?"\n\nLƯỚI CỨU HỘ — git reflog: dù reset --hard làm nhánh "quên" mất một commit, commit đó thường VẪN CÒN trong Git một thời gian. git reflog ghi lại MỌI NƠI HEAD từng đứng — kể cả commit đã "biến mất" khỏi git log thường. Đây là lệnh CỨU MẠNG: lỡ reset --hard nhầm, git reflog cho bạn thấy lại mã commit cũ để quay về.\n\nQUY TẮC AN TOÀN: reset --hard CHỈ dùng khi bạn CHẮC CHẮN 100% mọi thứ cần giữ đã được commit ở đâu đó. Không chắc → dùng --soft hoặc --mixed (an toàn hơn nhiều, không đụng thư mục làm việc).',
    workedExample: {
      code: `git init
echo "a" > a.txt
git add .
git commit -m "c1"
echo "b" > b.txt
git add .
git commit -m "c2"
git reset --hard c1
ls
git reflog`,
      stdinLines: [],
    },
    predict: {
      code: `git init
echo "a" > a.txt
git add .
git commit -m "c1"
echo "b" > b.txt
git add .
git commit -m "c2"
git reset --soft c1
git status`,
      question: 'Sau git reset --soft c1, git status hiện gì về b.txt?',
      choices: [
        'Thay doi da chuan bi de commit:\n  moi/sua: b.txt',
        'File chua duoc theo doi (can git add):\n  b.txt',
        'Thay doi chua chuan bi (can git add):\n  sua: b.txt',
        'Khong co gi de commit, thu muc lam viec sach',
      ],
      answerIndex: 0,
      explain:
        '--soft CHỈ dời con trỏ nhánh, KHÔNG đụng vùng chờ. Vùng chờ vẫn giữ đúng ảnh chụp của HEAD cũ (trước khi reset) — nên b.txt hiện ra là "đã chuẩn bị để commit", sẵn sàng chốt lại ngay bằng một lời nhắn khác nếu muốn. Đây là mức reset AN TOÀN NHẤT trong ba mức.',
    },
    parsons: {
      prompt: 'Xếp thứ tự: thêm một commit, gõ nhầm reset --hard mất nó, rồi DÙNG REFLOG cứu lại.',
      lines: [
        'echo "them" > moi.txt',
        'git add moi.txt',
        'git commit -m "them file moi"',
        'git reset --hard c1',
        'git reflog',
        'git reset --hard c2',
      ],
    },
    make: {
      prompt:
        'Kho của bạn đã có sẵn hai commit: c1 "Bang gia goc" (file gia.txt), c2 "Them mon moi" (thêm file mon_moi.txt).\n\nBạn LỠ TAY reset --hard về c1, mất luôn c2 khỏi nhánh. Gõ lệnh để:\n1. Gõ reset --hard về c1 (mô phỏng cú lỡ tay).\n2. Dùng git reflog để tìm lại mã của commit c2 đã "biến mất".\n3. reset --hard một lần nữa, lần này VỀ ĐÚNG c2 để khôi phục.\n4. Kiểm tra bằng ls — phải thấy lại đủ cả hai file.',
      starterCode: `# Kho da co c1 "Bang gia goc" va c2 "Them mon moi"\n# 1. lo tay reset --hard ve c1\n\n# 2. dung reflog tim lai c2\n\n# 3. reset --hard ve dung c2\n\n# 4. kiem tra\n`,
      testCases: [
        {
          stdinLines: [
            'git init',
            'echo "tra da 5000" > gia.txt',
            'git add .',
            'git commit -m "Bang gia goc"',
            'echo "banh mi 15000" > mon_moi.txt',
            'git add .',
            'git commit -m "Them mon moi"',
          ],
          expected: 'c2 HEAD@{0}: commit: Them mon moi',
          match: 'contains',
          hidden: false,
          label: 'reflog tìm thấy lại mã commit c2 đã "biến mất"',
        },
        {
          stdinLines: [
            'git init',
            'echo "tra da 5000" > gia.txt',
            'git add .',
            'git commit -m "Bang gia goc"',
            'echo "banh mi 15000" > mon_moi.txt',
            'git add .',
            'git commit -m "Them mon moi"',
          ],
          expected: 'gia.txt\nmon_moi.txt',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: ls cuối cùng thấy lại ĐỦ cả hai file, khôi phục thành công',
        },
      ],
      hints: [
        'Lỡ tay trước: git reset --hard c1.',
        'Tìm lại mã đã mất: git reflog — tìm dòng "commit: Them mon moi" để biết đúng mã (c2).',
        'Khôi phục: git reset --hard c2, rồi ls để kiểm chứng thấy lại đủ hai file.',
      ],
      sampleSolution: `git reset --hard c1
git reflog
git reset --hard c2
ls`,
    },
    homework:
      'Về nhà: KHÔNG thử reset --hard trên repo thật có việc quan trọng. Nếu muốn tập tay thật, tạo một thư mục thử nghiệm riêng (git init một chỗ trống), tự tạo vài commit rồi thử ba mức reset để cảm nhận sự khác biệt — làm ở "sân tập" chứ không phải dự án đang chạy.',
    srsCards: [
      {
        hoi: 'Ba mức git reset khác nhau ở đâu — soft, mixed, hard?',
        dap: 'soft: dời nhánh, GIỮ vùng chờ. mixed: dời nhánh, XOÁ vùng chờ nhưng file trong thư mục còn nguyên. hard: dời nhánh, XOÁ CẢ thư mục làm việc — mất vĩnh viễn thứ chưa add.',
      },
      {
        hoi: 'reset --hard nguy hiểm ở điểm nào cụ thể?',
        dap: 'Nó ghi đè thư mục làm việc — bất cứ thứ gì CHƯA TỪNG git add thì không có bản sao ở đâu cả, mất là mất thật, không cứu được.',
      },
      {
        hoi: 'Lỡ reset --hard mất một commit, làm sao tìm lại?',
        dap: 'git reflog — ghi lại mọi nơi HEAD từng đứng, kể cả commit đã "biến mất" khỏi git log thường. Tìm đúng mã commit ở đó rồi reset --hard về lại mã đó.',
      },
    ],
  },
]
