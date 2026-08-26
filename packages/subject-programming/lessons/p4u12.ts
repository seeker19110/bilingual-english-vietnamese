// lessons/p4u12.ts — Bài MILESTONE chặng P4: ráp OOP + lỗi nghiệp vụ + API vào một việc.
//
// Theo đúng khuôn milestone của P1-U10 và P3-U12: đề ĐỘC LẬP với dự án trục (thư viện sách,
// không phải cửa hàng) — dự án trục đã có milestone riêng ở chặng của nó, nên bài này là phép
// thử "tự ráp được từ đầu" chứ không phải làm tiếp thứ đang dở.
// Làn B (apisim) — xem docs/research/dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P4U12_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p4-u12-l1',
    unitId: 'p4-u12',
    language: 'apisim',
    title: 'Milestone P4 — API thư viện: class, lỗi có mã, và dữ liệu không cho phép sai',
    hook: 'Thư viện của phường cho mượn sách bằng một cuốn sổ giấy. Bạn nhận làm phần mềm cho họ. Nghe thì nhỏ, nhưng đây là lần đầu bạn phải ráp cả bốn thứ vừa học vào một chỗ: mô hình hoá bằng class, lỗi nghiệp vụ có mã rõ ràng, kiểm dữ liệu ở server, và một API mà người khác gọi được.',
    theory:
      'Bài này không dạy khái niệm mới. Nó kiểm xem bốn thứ của bậc P4 đã thành phản xạ chưa:\n\n1. CLASS mô hình hoá thứ có thật. Cuốn sách không chỉ là ba cột trong bảng — nó có một câu hỏi luôn đi kèm: "còn cho mượn được không?". Đặt câu hỏi đó thành phương thức (sach.co_the_muon()) thì luật nằm ở MỘT chỗ; rải rác if con_lai > 0 khắp các endpoint là kiểu code sẽ lệch nhau sau ba lần sửa.\n\n2. LỖI NGHIỆP VỤ CÓ MÃ. Ba tình huống từ chối khác nhau phải cho ba mã khác nhau, vì người gọi cần phản ứng khác nhau:\n   - 422: dữ liệu bạn gửi vô nghĩa (mượn 0 cuốn, mượn -3 cuốn).\n   - 404: thứ bạn hỏi không tồn tại (không có cuốn sách mã đó).\n   - 409: dữ liệu hợp lệ, sách có thật, nhưng XUNG ĐỘT với trạng thái hiện tại (sách đã cho mượn hết).\n   Trả cả ba thành 400 thì giao diện chỉ hiện được một câu chung chung; trả cả ba thành 200 kèm {"loi": ...} thì giao diện phải đoán.\n\n3. THỨ TỰ KIỂM. Kiểm dữ liệu gửi lên TRƯỚC, rồi mới tra CSDL, rồi mới xét trạng thái. Đảo thứ tự là người dùng nhận mã lỗi sai — bước Dự đoán của bài cho bạn thấy đúng cảnh đó.\n\n4. KHÔNG TIN CLIENT. Số lượng còn lại lấy từ CSDL, không bao giờ lấy theo con số client gửi lên.\n\nRanh giới nhắc lại: đây vẫn là làn mô phỏng — định tuyến, JSON và SQLite chạy thật, nhưng không có tiến trình server nào. Phần việc về nhà mới là chỗ nó thành server thật.',
    workedExample: {
      code: `import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE sach (id INTEGER PRIMARY KEY, ten TEXT, con_lai INTEGER)")
db.execute("INSERT INTO sach (ten, con_lai) VALUES ('Dac nhan tam', 1)")
db.commit()

class Sach:                                   # class giữ dữ liệu VÀ luật của nó
    def __init__(self, ma, ten, con_lai):
        self.ma = ma
        self.ten = ten
        self.con_lai = con_lai

    def co_the_muon(self, so_luong=1):        # luật "còn mượn được không" chỉ nằm ở ĐÂY
        return self.con_lai >= so_luong

def lay_sach(ma):                             # một chỗ duy nhất đọc CSDL rồi dựng đồ vật
    d = db.execute("SELECT id, ten, con_lai FROM sach WHERE id = ?", (ma,)).fetchone()
    return None if d is None else Sach(d[0], d[1], d[2])

@app.post("/muon")
def muon(du_lieu):
    so_luong = du_lieu.get("so_luong")
    if not isinstance(so_luong, int) or so_luong <= 0:
        raise HTTPException(422, "so_luong phai la so nguyen duong")   # ① dữ liệu vào
    sach = lay_sach(du_lieu.get("sach_id"))
    if sach is None:
        raise HTTPException(404, "Khong co sach nay")                  # ② tồn tại
    if not sach.co_the_muon(so_luong):
        raise HTTPException(409, f"Chi con {sach.con_lai} cuon")       # ③ trạng thái
    return {"da_muon": so_luong, "con_lai": sach.con_lai - so_luong}

client = TestClient(app)
print("Muon 1 cuon:", client.post("/muon", json={"sach_id": 1, "so_luong": 1}).status_code)
print("Muon 5 cuon:", client.post("/muon", json={"sach_id": 1, "so_luong": 5}).status_code)
print("Muon 0 cuon:", client.post("/muon", json={"sach_id": 1, "so_luong": 0}).status_code)
print("Sach la:", client.post("/muon", json={"sach_id": 9, "so_luong": 1}).status_code)`,
      stdinLines: [],
    },
    predict: {
      code: `from fastapi import FastAPI, HTTPException\nfrom fastapi.testclient import TestClient\n\napp = FastAPI()\nCON_LAI = 0\n\n@app.post("/muon")\ndef muon(du_lieu):\n    if CON_LAI <= 0:\n        raise HTTPException(409, "Het sach")\n    if du_lieu["so_luong"] <= 0:\n        raise HTTPException(422, "So luong phai duong")\n    return {"ok": True}\n\nclient = TestClient(app)\nprint("Ma tra ve:", client.post("/muon", json={"so_luong": 0}).status_code)`,
      question:
        'Khách gửi lên số lượng 0 (dữ liệu vô nghĩa) trong khi sách cũng đã hết. Máy trả về mã nào?',
      choices: ['Ma tra ve: 409', 'Ma tra ve: 422', 'Ma tra ve: 404', 'Ma tra ve: 201'],
      answerIndex: 0,
      explain:
        'Hàm kiểm trạng thái kho TRƯỚC nên nó dừng ngay ở 409 "hết sách", dù vấn đề thật của yêu cầu này là dữ liệu vô nghĩa (mượn 0 cuốn). Người dùng nhận một lời giải thích SAI. Đây là lý do thứ tự kiểm phải là: dữ liệu gửi lên → tồn tại → trạng thái. Nhập nhằng kiểu này rất khó phát hiện vì chương trình không hề vỡ.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành phần kiểm của endpoint mượn sách — đúng thứ tự: dữ liệu vào, rồi tồn tại, rồi trạng thái.',
      lines: [
        'so_luong = du_lieu.get("so_luong")',
        'if not isinstance(so_luong, int) or so_luong <= 0:',
        '    raise HTTPException(422, "so_luong phai la so nguyen duong")',
        'sach = lay_sach(du_lieu.get("sach_id"))',
        'if sach is None:',
        '    raise HTTPException(404, "Khong co sach nay")',
        'if not sach.co_the_muon(so_luong):',
        '    raise HTTPException(409, f"Chi con {sach.con_lai} cuon")',
      ],
    },
    make: {
      prompt:
        'Làm phần mềm mượn sách cho thư viện. CSDL đã dựng sẵn (bảng sach: 1 "Dac nhan tam" còn 2 cuốn, 2 "Nha gia kim" còn 0 cuốn) và khối kiểm thử ở cuối. Bạn viết ba phần:\n\n1. class Sach — __init__(self, ma, ten, con_lai) và phương thức co_the_muon(self, so_luong=1) trả về True khi con_lai >= so_luong.\n2. GET /sach — danh sách mọi cuốn, mỗi cuốn là dict có id, ten, con_lai.\n   GET /sach/{ma}/co-the-muon — ma: int; không có sách đó thì 404; có thì trả {"duoc": <kết quả co_the_muon()>}.\n3. POST /muon — thân JSON {"sach_id": số, "so_luong": số}, kiểm THEO ĐÚNG THỨ TỰ:\n   · so_luong không phải số nguyên dương → HTTPException(422, ...)\n   · không có cuốn sách đó → HTTPException(404, ...)\n   · còn lại không đủ → HTTPException(409, ...)\n   · hợp lệ → TRỪ vào cột con_lai trong CSDL (nhớ db.commit()) rồi trả {"da_muon": so_luong, "con_lai": <số còn lại MỚI>}.\n\nSố còn lại phải lấy từ CSDL, không lấy theo thứ client gửi lên. Đừng sửa khối kiểm thử ở cuối.',
      starterCode: `import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE sach (id INTEGER PRIMARY KEY, ten TEXT, con_lai INTEGER)")
db.execute("INSERT INTO sach (ten, con_lai) VALUES ('Dac nhan tam', 2)")
db.execute("INSERT INTO sach (ten, con_lai) VALUES ('Nha gia kim', 0)")
db.commit()

# ---- ① class Sach ----


# ---- ② + ③ các endpoint ----


# ---- Khối kiểm thử: ĐỪNG SỬA ----
client = TestClient(app)
ds = client.get("/sach")
print("DS:", ds.status_code, len(ds.json()))
print("CO THE:", client.get("/sach/2/co-the-muon").json()["duoc"])
ok = client.post("/muon", json={"sach_id": 1, "so_luong": 2})
print("MUON:", ok.status_code, ok.json()["con_lai"])
print("HET:", client.post("/muon", json={"sach_id": 1, "so_luong": 1}).status_code)
print("KHONG CO:", client.post("/muon", json={"sach_id": 99, "so_luong": 1}).status_code)
print("SL SAI:", client.post("/muon", json={"sach_id": 1, "so_luong": 0}).status_code)
`,
      testCases: [
        {
          stdinLines: [],
          expected: 'DS: 200 2',
          match: 'contains',
          hidden: false,
          label: 'GET /sach trả 200 và đủ 2 đầu sách',
        },
        {
          stdinLines: [],
          expected: 'CO THE: False',
          match: 'contains',
          hidden: false,
          label: 'Sách đã hết → co_the_muon() của class trả False (luật nằm trong class)',
        },
        {
          stdinLines: [],
          expected: 'MUON: 201 0',
          match: 'contains',
          hidden: false,
          label: 'Mượn 2/2 cuốn thành công, còn lại 0 — đã TRỪ thật vào CSDL',
        },
        {
          stdinLines: [],
          expected: 'HET: 409',
          match: 'contains',
          hidden: false,
          label: 'Mượn tiếp khi đã hết → 409 xung đột trạng thái (không phải 404, không phải 422)',
        },
        {
          stdinLines: [],
          expected: 'SL SAI: 422',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — THỨ TỰ KIỂM: sách còn 0 cuốn mà gửi so_luong 0 vẫn phải ra 422',
        },
      ],
      hints: [
        'Ca ẩn của bài canh đúng thứ tự kiểm: khi vừa hết sách vừa gửi số lượng vô nghĩa, mã trả về phải là mã của LỖI DỮ LIỆU (422) vì nó được kiểm trước.',
        'Viết một hàm lay_sach(ma) đọc CSDL rồi dựng đối tượng Sach — hai endpoint đều cần, đừng chép câu SELECT ra hai chỗ.',
        'Sau khi mượn, con_lai MỚI = sach.con_lai - so_luong; nhớ UPDATE vào CSDL rồi db.commit(), nếu không ca "HET: 409" sẽ không xảy ra vì kho chưa hề bị trừ.',
        'Khung tham chiếu cho phần khó nhất:\n\n@app.post("/muon")\ndef muon(du_lieu):\n    so_luong = du_lieu.get("so_luong")\n    if not isinstance(so_luong, int) or so_luong <= 0:\n        raise HTTPException(422, "so_luong phai la so nguyen duong")\n    sach = lay_sach(du_lieu.get("sach_id"))\n    if sach is None:\n        raise HTTPException(404, "Khong co sach nay")\n    if not sach.co_the_muon(so_luong):\n        raise HTTPException(409, f"Chi con {sach.con_lai} cuon")',
      ],
      sampleSolution: `import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE sach (id INTEGER PRIMARY KEY, ten TEXT, con_lai INTEGER)")
db.execute("INSERT INTO sach (ten, con_lai) VALUES ('Dac nhan tam', 2)")
db.execute("INSERT INTO sach (ten, con_lai) VALUES ('Nha gia kim', 0)")
db.commit()

class Sach:
    def __init__(self, ma, ten, con_lai):
        self.ma = ma
        self.ten = ten
        self.con_lai = con_lai

    def co_the_muon(self, so_luong=1):
        return self.con_lai >= so_luong

def lay_sach(ma):
    d = db.execute("SELECT id, ten, con_lai FROM sach WHERE id = ?", (ma,)).fetchone()
    return None if d is None else Sach(d[0], d[1], d[2])

@app.get("/sach")
def danh_sach():
    dong = db.execute("SELECT id, ten, con_lai FROM sach").fetchall()
    return [{"id": d[0], "ten": d[1], "con_lai": d[2]} for d in dong]

@app.get("/sach/{ma}/co-the-muon")
def co_the_muon(ma: int):
    sach = lay_sach(ma)
    if sach is None:
        raise HTTPException(404, f"Khong co sach {ma}")
    return {"duoc": sach.co_the_muon()}

@app.post("/muon")
def muon(du_lieu):
    so_luong = du_lieu.get("so_luong")
    if not isinstance(so_luong, int) or so_luong <= 0:
        raise HTTPException(422, "so_luong phai la so nguyen duong")
    sach = lay_sach(du_lieu.get("sach_id"))
    if sach is None:
        raise HTTPException(404, "Khong co sach nay")
    if not sach.co_the_muon(so_luong):
        raise HTTPException(409, f"Chi con {sach.con_lai} cuon")

    con_lai = sach.con_lai - so_luong
    db.execute("UPDATE sach SET con_lai = ? WHERE id = ?", (con_lai, sach.ma))
    db.commit()
    return {"da_muon": so_luong, "con_lai": con_lai}

# ---- Khối kiểm thử: ĐỪNG SỬA ----
client = TestClient(app)
ds = client.get("/sach")
print("DS:", ds.status_code, len(ds.json()))
print("CO THE:", client.get("/sach/2/co-the-muon").json()["duoc"])
ok = client.post("/muon", json={"sach_id": 1, "so_luong": 2})
print("MUON:", ok.status_code, ok.json()["con_lai"])
print("HET:", client.post("/muon", json={"sach_id": 1, "so_luong": 1}).status_code)
print("KHONG CO:", client.post("/muon", json={"sach_id": 99, "so_luong": 1}).status_code)
print("SL SAI:", client.post("/muon", json={"sach_id": 1, "so_luong": 0}).status_code)`,
    },
    homework:
      'Đây là mốc đóng bậc P4 — làm cho trọn cả bốn mảnh trên máy thật: (1) chép API thư viện sang máy, chạy bằng uvicorn; (2) viết vài test pytest thật cho luật "hết sách thì 409"; (3) đưa cả thư mục lên GitHub với README nói rõ cách chạy và bảng hợp đồng API; (4) tự soát lại git log xem lịch sử có đọc được không. Bốn thứ đó — code có cấu trúc, test, API chạy được, lịch sử sạch — chính là thứ người ta nhìn khi xem hồ sơ của bạn.',
    srsCards: [
      {
        hoi: 'Thứ tự kiểm đúng trong một endpoint là gì?',
        dap: 'Dữ liệu gửi lên (422) → thứ được hỏi có tồn tại không (404) → trạng thái hiện tại có cho phép không (409). Đảo thứ tự thì người dùng nhận lời giải thích sai cho lỗi của mình.',
      },
      {
        hoi: 'Mã 409 nói lên điều gì mà 404 và 422 không nói được?',
        dap: 'Rằng yêu cầu hợp lệ và thứ được hỏi có thật, nhưng xung đột với trạng thái hiện tại — ví dụ sách có trong thư viện nhưng đã cho mượn hết.',
      },
      {
        hoi: 'Vì sao nên đặt luật "còn mượn được không" thành phương thức của class?',
        dap: 'Để luật chỉ tồn tại ở MỘT chỗ. Rải if con_lai > 0 ra nhiều endpoint thì sau vài lần sửa chúng sẽ lệch nhau, và không ai biết chỗ nào mới đúng.',
      },
    ],
  },
]
