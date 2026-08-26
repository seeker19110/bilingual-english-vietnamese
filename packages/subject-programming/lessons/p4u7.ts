// lessons/p4u7.ts — Bài học P4-U7: HTTP & REST (request/response, mã trạng thái, JSON API).
// Làn B của hiến chương docs/research/dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md: mô phỏng
// KHAI BÁO MINH BẠCH. Bài chạy trên module `requests` giả lập (httpSimPrelude.ts) — dữ liệu
// mẫu cố định, KHÔNG có mạng thật. Việc gọi API THẬT (có key) nằm ở phần về nhà (làn C).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P4U7_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p4-u7-l1',
    unitId: 'p4-u7',
    language: 'httpsim',
    title: 'HTTP & REST: gọi một API và đọc đúng câu trả lời',
    hook: 'App thời tiết trên điện thoại không "biết" thời tiết — nó HỎI một server ở xa qua mạng và đọc câu trả lời. Hôm nay bạn tự tay làm việc đó: gửi một yêu cầu HTTP, và quan trọng hơn, học cách đọc câu trả lời cho ĐÚNG — kể cả khi câu trả lời là một lời từ chối.',
    theory:
      'Lưu ý trước: bài này chạy trên một API MẪU giả lập, nằm sẵn trong máy, KHÔNG phải mạng thật — không có Internet nào bị gọi ở đây cả. Module `requests` bạn `import` là bản mô phỏng của DHCB (nó tự in ra dòng "[GIA LAP]" ngay khi bạn import, để bạn luôn biết mình đang ở đâu). Nhưng những gì bạn học ở đây — mã trạng thái, tham số truy vấn, đọc JSON — giống HỆT khi gọi API thật, vì đó mới là kiến thức cần học, không phải chuyện có nối mạng hay không.\n\nMột lần gọi HTTP gồm: PHƯƠNG THỨC (GET để lấy dữ liệu, POST để gửi/tạo dữ liệu mới), ĐƯỜNG DẪN (vd /thoi-tiet), THAM SỐ TRUY VẤN đi kèm trên URL (?tinh=Ha Noi), và với POST còn có THÂN JSON (dữ liệu bạn gửi kèm, vd {"mon_id": 1, "so_luong": 2}).\n\nServer trả về HAI THỨ: MÃ TRẠNG THÁI (một con số 3 chữ số) và THÂN (thường là JSON). Ba nhóm mã cần nhớ:\n- 2xx: yêu cầu thành công (200 = lấy được, 201 = tạo mới thành công).\n- 4xx: BẠN gọi sai — 404 nghĩa là đường dẫn hoặc dữ liệu không tồn tại (vd hỏi thời tiết một tỉnh không có trong hệ thống), 422 nghĩa là thiếu/sai tham số bắt buộc.\n- 5xx: SERVER hỏng — 500 nghĩa là server gặp sự cố, KHÔNG liên quan gì tới việc bạn gọi đúng hay sai.\n\nCòn một kiểu hỏng thứ ba, khác hẳn hai nhóm trên: KHÔNG NỐI ĐƯỢC TỚI HOST — mạng đứt, sai địa chỉ server, hoặc (như trong sandbox này) gọi tới một địa chỉ ngoài API mẫu. Trường hợp này không có mã trạng thái nào cả, vì chưa từng "nói chuyện" được với server — Python ném thẳng lỗi `ConnectionError`.\n\nĐiều DỄ NHẦM nhất: thuộc tính `response.ok` (đúng khi mã trạng thái dưới 400) CHỈ có nghĩa là "server hiểu và xử lý được yêu cầu" — nó KHÔNG có nghĩa là "dữ liệu đúng như bạn mong". Một GET /thoi-tiet với tỉnh không tồn tại vẫn là một lần gọi thành công về mặt kỹ thuật (server trả lời tử tế), nhưng trả về 404 vì không có dữ liệu đó. Vì vậy, nếp làm việc BẮT BUỘC là: LUÔN kiểm `status_code` (hoặc `.ok`) TRƯỚC khi gọi `.json()` để đọc dữ liệu — gọi `.json()` khi mã là lỗi vẫn có thể chạy được (thân vẫn là JSON, chỉ là JSON báo lỗi), nhưng đọc nhầm nó như dữ liệu thật là lỗi logic sẽ âm thầm lan xuống bên dưới.',
    workedExample: {
      code: `import requests  # module GIA LAP — in dong [GIA LAP] khi import, khong co mang that

# GET: lay du lieu, tham so truy van di kem tren URL
res = requests.get(requests.BASE + "/thoi-tiet?tinh=Ha Noi")
print("Ma trang thai:", res.status_code)   # 200 = thanh cong

if res.ok:                                  # ok tuc la duoi 400 — server xu ly duoc
    du_lieu = res.json()                    # CHI doc .json() sau khi da biet la ok
    print(f"{du_lieu['tinh']}: {du_lieu['nhiet_do']} do, {du_lieu['mo_ta']}")
else:
    print("Loi:", res.json()["loi"])

# Goi mot tinh KHONG co trong du lieu mau -> 404, khong phai loi chuong trinh
res2 = requests.get(requests.BASE + "/thoi-tiet?tinh=Tokyo")
print("Ma trang thai tinh la:", res2.status_code)
print("Noi dung loi:", res2.json()["loi"])`,
      stdinLines: [],
    },
    predict: {
      code: `import requests

res = requests.get(requests.BASE + "/thoi-tiet?tinh=Da Lat")
if res.status_code == 200:
    print("Thanh cong")
elif res.status_code == 404:
    print("Khong tim thay")
else:
    print("Loi khac")`,
      question:
        '"Da Lat" không có trong dữ liệu mẫu (chỉ có Ha Noi, Hue, Da Nang, TP HCM, Can Tho). Code này in ra gì?',
      choices: ['Thanh cong', 'Khong tim thay', 'Loi khac', 'Chương trình dừng vì lỗi'],
      answerIndex: 1,
      explain:
        'Tỉnh "Da Lat" không có trong dữ liệu mẫu THOI_TIET, nên module giả lập trả về mã 404 (không phải lỗi chương trình — server vẫn trả lời tử tế, chỉ là "không có dữ liệu này"). Nhánh `elif res.status_code == 404` khớp, nên in "Khong tim thay".',
    },
    parsons: {
      prompt: 'Xếp lại đúng thứ tự: gọi API, kiểm mã trạng thái TRƯỚC, rồi mới đọc dữ liệu JSON.',
      lines: [
        'import requests',
        'res = requests.get(requests.BASE + "/mon/2")',
        'if res.status_code == 200:',
        '    mon = res.json()',
        '    print(mon["ten"], mon["gia"])',
        'else:',
        '    print("Loi:", res.status_code)',
      ],
    },
    make: {
      prompt:
        'Viết chương trình: đọc MỘT dòng input() là tên tỉnh, rồi gọi GET requests.BASE + "/thoi-tiet?tinh=<tên tỉnh>". Sau đó in đúng MỘT trong ba dòng sau, tuỳ mã trạng thái trả về:\n\n- Mã 200: in "OK <tên tỉnh>: <nhiệt độ> do" (vd "OK Ha Noi: 33 do").\n- Mã 404: in "KHONG CO: <tên tỉnh>".\n- Mã khác (bất kỳ mã nào không phải 200/404, vd 500): in "LOI SERVER: <mã trạng thái>".\n\nRiêng phần "mã khác": để tự kiểm chương trình xử lý được nhánh 5xx, nếu học viên nhập đúng chuỗi đặc biệt "__loi_server__" thay vì tên tỉnh, chương trình phải gọi GET requests.BASE + "/loi-server" (bỏ qua việc tra thời tiết) rồi in theo đúng nhánh "mã khác" ở trên với mã trả về thật (500).\n\nGợi ý cấu trúc: đọc tên tỉnh trước, nếu tên tỉnh đúng bằng "__loi_server__" thì gọi /loi-server, ngược lại gọi /thoi-tiet như bình thường; sau đó rẽ nhánh theo status_code.',
      starterCode: `import requests

ten_tinh = input("Nhap ten tinh: ")

# Goi API tuong ung roi in dung 1 trong 3 dang: OK ... / KHONG CO: ... / LOI SERVER: ...
`,
      testCases: [
        {
          stdinLines: ['Ha Noi'],
          expected: 'OK Ha Noi: 33 do',
          match: 'contains',
          hidden: false,
          label: 'Tỉnh có thật (Ha Noi, 33 độ) -> nhánh 200',
        },
        {
          stdinLines: ['Tokyo'],
          expected: 'KHONG CO: Tokyo',
          match: 'contains',
          hidden: false,
          label: 'Tỉnh không có trong dữ liệu mẫu -> nhánh 404',
        },
        {
          stdinLines: ['__loi_server__'],
          expected: 'LOI SERVER: 500',
          match: 'contains',
          hidden: false,
          label: 'Đường dẫn /loi-server -> nhánh mã khác (500)',
        },
        {
          stdinLines: ['Hue'],
          expected: 'OK Hue: 31 do',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: một tỉnh có thật khác (Hue, 31 độ) cũng phải ra đúng nhánh 200',
        },
      ],
      hints: [
        'Nhớ lý thuyết: kiểm status_code TRƯỚC, chỉ gọi .json() sau khi đã biết mã là gì bạn cần.',
        'Ba nhánh if/elif/else theo đúng thứ tự: == 200, == 404, else (bắt hết phần còn lại, kể cả 500).',
        'Chuỗi input đặc biệt "__loi_server__" không phải tên tỉnh thật — nó chỉ là tín hiệu để chương trình đổi sang gọi /loi-server thay vì /thoi-tiet, giúp bài test được nhánh lỗi server mà không cần một tỉnh nào thật sự bị hỏng trong dữ liệu mẫu.',
        'Khung tham chiếu:\n\nif ten_tinh == "__loi_server__":\n    res = requests.get(requests.BASE + "/loi-server")\nelse:\n    res = requests.get(requests.BASE + "/thoi-tiet?tinh=" + ten_tinh)\n\nif res.status_code == 200:\n    d = res.json()\n    print(f"OK {d[\'tinh\']}: {d[\'nhiet_do\']} do")\nelif res.status_code == 404:\n    print(f"KHONG CO: {ten_tinh}")\nelse:\n    print(f"LOI SERVER: {res.status_code}")',
      ],
      sampleSolution: `import requests

ten_tinh = input("Nhap ten tinh: ")

if ten_tinh == "__loi_server__":
    res = requests.get(requests.BASE + "/loi-server")
else:
    res = requests.get(requests.BASE + "/thoi-tiet?tinh=" + ten_tinh)

if res.status_code == 200:
    du_lieu = res.json()
    print(f"OK {du_lieu['tinh']}: {du_lieu['nhiet_do']} do")
elif res.status_code == 404:
    print(f"KHONG CO: {ten_tinh}")
else:
    print(f"LOI SERVER: {res.status_code}")`,
    },
    homework:
      'Bài này chạy trên API MẪU giả lập, offline. Giờ hãy chạm vào một API THẬT: tự đăng ký tài khoản free tier ở một dịch vụ công khai (vd API thời tiết OpenWeatherMap, hoặc API tỉ giá exchangerate-api.com — đều có gói miễn phí cần lấy API key). Trên MÁY BẠN (ngoài sandbox), dùng thư viện `requests` thật gọi GET tới API đó, in mã trạng thái và vài trường dữ liệu.\n\nBẢO MẬT: TUYỆT ĐỐI đừng gõ thẳng API key vào code rồi lỡ đẩy lên GitHub. Lưu key vào biến môi trường (file `.env` không commit), đọc bằng `os.environ.get("API_KEY")` — đúng nguyên tắc "không bí mật trong code" mà dự án DHCB cũng theo.',
    srsCards: [
      {
        hoi: 'response.ok (mã dưới 400) có nghĩa là dữ liệu trả về đúng như mình mong không?',
        dap: 'Không. `.ok` chỉ nghĩa là server hiểu và xử lý được yêu cầu, không phải dữ liệu đúng ý. Vd 404 vẫn là một câu trả lời "tử tế" của server (không có dữ liệu này), khác hẳn với dữ liệu sai.',
      },
      {
        hoi: 'Nên gọi .json() lúc nào — trước hay sau khi kiểm status_code, vì sao?',
        dap: 'Sau khi kiểm status_code. Vì thân trả về vẫn có thể là JSON hợp lệ ngay cả khi là lỗi (vd {"loi": "..."}), nên đọc nó như dữ liệu thật trước khi biết mã trạng thái là lỗi logic dễ lan xuống bên dưới mà không báo gì.',
      },
      {
        hoi: '4xx và 5xx khác nhau ở chỗ nào — ai là người "gây ra" lỗi?',
        dap: '4xx là do BẠN gọi sai (đường dẫn/tham số/dữ liệu không hợp lệ, vd 404 không tìm thấy). 5xx là do SERVER hỏng, không liên quan gì tới việc bạn gọi đúng hay sai.',
      },
      {
        hoi: 'Lỗi "không nối được host" (ConnectionError) khác gì so với việc nhận mã 404 hay 500?',
        dap: 'ConnectionError xảy ra khi chưa từng "nói chuyện" được với server (mạng đứt, sai địa chỉ) nên KHÔNG có mã trạng thái nào cả — khác 404/500 là những trường hợp server đã trả lời, chỉ là trả lời bằng một mã lỗi.',
      },
    ],
  },
]
