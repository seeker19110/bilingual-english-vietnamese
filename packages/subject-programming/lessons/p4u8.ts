// lessons/p4u8.ts — Bài học P4-U8: DỰNG BACKEND NHỎ 1 (4 endpoint CRUD + SQLite).
// Làn B của hiến chương docs/research/dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md: định
// tuyến/JSON/SQLite là THẬT, nhưng KHÔNG có tiến trình server nào — handler được gọi thẳng
// bằng TestClient, đúng cách FastAPI thật chạy test (apiSimPrelude.ts).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P4U8_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p4-u8-l1',
    unitId: 'p4-u8',
    language: 'apisim',
    title: 'Backend đầu tiên — bốn cửa vào dữ liệu của bạn',
    hook: 'Tới giờ mọi thứ bạn viết chỉ chạy được trên máy bạn, cho một người dùng là bạn. Backend là lúc dữ liệu của quán rời khỏi máy cá nhân: điện thoại của nhân viên, trang web của khách, phần mềm kế toán — ai cũng hỏi cùng một kho dữ liệu qua cùng bốn cái cửa.',
    theory:
      'API kiểu REST đặt một quy ước cực gọn: ĐƯỜNG DẪN nói tới THỨ GÌ, PHƯƠNG THỨC nói LÀM GÌ với nó.\n\nGET    /mon        → lấy danh sách món\nGET    /mon/2      → lấy món số 2\nPOST   /mon        → tạo món mới (dữ liệu nằm trong thân JSON)\nDELETE /mon/2      → xoá món số 2\n\nBốn việc đó gọi là CRUD (tạo · đọc · sửa · xoá). Gần như mọi phần mềm quản lý bạn từng dùng đều chỉ là bốn việc này lặp lại trên nhiều loại dữ liệu.\n\nTrong FastAPI, mỗi cửa là một hàm thường có dán nhãn:\n\n@app.get("/mon/{mon_id}")\ndef mot_mon(mon_id: int):\n    ...\n\n- Phần trong ngoặc nhọn là THAM SỐ ĐƯỜNG DẪN; nó được truyền vào hàm theo TÊN.\n- Ghi chú kiểu (: int) rất quan trọng: đường dẫn vốn là chuỗi, có ghi int thì khung chuyển sang số giúp bạn và tự trả lỗi 422 khi ai đó gọi /mon/abc. Không ghi thì mon_id là chuỗi "2", so với số trong CSDL sẽ không khớp — lỗi lặng lẽ điển hình.\n- Muốn trả lỗi nghiệp vụ, ném HTTPException(404, "..."): đây chính là exception tự định nghĩa của U4, chỉ khác là nó mang theo mã trạng thái cho người gọi.\n- Hàm trả về dict/list; khung tự đổi sang JSON. Đừng print() để "trả dữ liệu" — print chỉ hiện trên máy chủ, người gọi không thấy gì.\n\nDỮ LIỆU: dùng SQLite thật qua module sqlite3 có sẵn của Python — đúng thứ bạn đã học ở P3-U8/U9, giờ nằm sau một API.\n\nRANH GIỚI PHẢI BIẾT (bài này thuộc làn mô phỏng): định tuyến, mã trạng thái, JSON và CSDL ở đây đều chạy thật, nhưng KHÔNG có tiến trình server nào cả — không cổng mạng, không uvicorn. Handler được gọi thẳng trong cùng chương trình bằng TestClient, đúng như cách người ta chạy test cho FastAPI thật. Muốn thấy server thật khởi động và mở cổng, làm phần việc về nhà.',
    workedExample: {
      code: `import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()

# CSDL SQLite THẬT, nằm trong bộ nhớ — mất khi chương trình kết thúc
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE mon (id INTEGER PRIMARY KEY, ten TEXT, gia INTEGER)")
db.execute("INSERT INTO mon (ten, gia) VALUES ('Tra da', 5000)")
db.commit()

@app.get("/mon")                       # cửa 1: đọc cả danh sách
def danh_sach():
    dong = db.execute("SELECT id, ten, gia FROM mon").fetchall()
    return [{"id": d[0], "ten": d[1], "gia": d[2]} for d in dong]

@app.get("/mon/{mon_id}")              # cửa 2: đọc MỘT món
def mot_mon(mon_id: int):              # : int -> khung tự đổi "1" thành 1
    d = db.execute("SELECT id, ten, gia FROM mon WHERE id = ?", (mon_id,)).fetchone()
    if d is None:
        raise HTTPException(404, f"Khong tim thay mon {mon_id}")   # lỗi có mã
    return {"id": d[0], "ten": d[1], "gia": d[2]}

client = TestClient(app)               # gọi thẳng handler, không qua mạng
print("Danh sach:", client.get("/mon").json())
print("Mot mon:", client.get("/mon/1").json()["ten"])
print("Khong co:", client.get("/mon/99").status_code)`,
      stdinLines: [],
    },
    predict: {
      code: `from fastapi import FastAPI\nfrom fastapi.testclient import TestClient\n\napp = FastAPI()\n\n@app.get("/mon/{mon_id}")\ndef mot_mon(mon_id):\n    return {"kieu": type(mon_id).__name__}\n\nclient = TestClient(app)\nprint("Kieu du lieu:", client.get("/mon/7").json()["kieu"])`,
      question: 'Handler nhận mon_id với KIỂU gì (chú ý: không có ghi chú : int)?',
      choices: ['Kieu du lieu: str', 'Kieu du lieu: int', 'Kieu du lieu: float', 'Bao loi 422'],
      answerIndex: 0,
      explain:
        'Đường dẫn URL vốn chỉ là chuỗi ký tự. Không ghi chú kiểu thì handler nhận đúng chuỗi "7". Đây là lỗi lặng lẽ kinh điển: đem chuỗi "7" đi so với số 7 trong CSDL là không khớp, mà chẳng có thông báo nào. Ghi mon_id: int thì khung tự đổi sang số — và tự trả 422 nếu ai gọi /mon/abc.',
    },
    parsons: {
      prompt: 'Xếp các dòng sau thành một endpoint đọc MỘT món, trả lỗi 404 khi không tìm thấy.',
      lines: [
        '@app.get("/mon/{mon_id}")',
        'def mot_mon(mon_id: int):',
        '    d = db.execute("SELECT id, ten, gia FROM mon WHERE id = ?", (mon_id,)).fetchone()',
        '    if d is None:',
        '        raise HTTPException(404, f"Khong tim thay mon {mon_id}")',
        '    return {"id": d[0], "ten": d[1], "gia": d[2]}',
      ],
    },
    make: {
      prompt:
        'Code khởi đầu đã dựng sẵn CSDL (bảng mon có 2 dòng: 1 Tra da 5000, 2 Ca phe sua 25000) và khối kiểm thử ở cuối. Việc của bạn là viết ĐÚNG 4 endpoint vào chỗ trống:\n\n1. GET /mon — trả về DANH SÁCH mọi món, mỗi món là dict có id, ten, gia.\n2. GET /mon/{mon_id} — trả về một món (mon_id: int). Không có thì raise HTTPException(404, ...).\n3. POST /mon — nhận thân JSON qua tham số tên du_lieu (dict có "ten" và "gia"), thêm vào CSDL, trả về dict có id mới cùng ten và gia. Mã trạng thái 201 là mặc định của @app.post, bạn không phải làm gì thêm.\n4. DELETE /mon/{mon_id} — xoá món, trả về {"da_xoa": mon_id}.\n\nNhớ db.commit() sau mỗi lần INSERT/DELETE, và lấy id vừa tạo bằng cur.lastrowid.\n\nĐỪNG sửa khối kiểm thử ở cuối — nó chính là bài chấm.',
      starterCode: `import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE mon (id INTEGER PRIMARY KEY, ten TEXT, gia INTEGER)")
db.execute("INSERT INTO mon (ten, gia) VALUES ('Tra da', 5000)")
db.execute("INSERT INTO mon (ten, gia) VALUES ('Ca phe sua', 25000)")
db.commit()

# ---- Viết 4 endpoint của bạn ở đây ----


# ---- Khối kiểm thử: ĐỪNG SỬA ----
client = TestClient(app)
ds = client.get("/mon")
print("DS:", ds.status_code, len(ds.json()))
mot = client.get("/mon/2")
print("MOT:", mot.status_code, mot.json()["ten"])
print("THIEU:", client.get("/mon/99").status_code)
tao = client.post("/mon", json={"ten": "Nuoc cam", "gia": 15000})
print("TAO:", tao.status_code, tao.json()["id"])
print("XOA:", client.delete("/mon/1").status_code)
print("CON LAI:", len(client.get("/mon").json()))
`,
      testCases: [
        {
          stdinLines: [],
          expected: 'DS: 200 2',
          match: 'contains',
          hidden: false,
          label: 'GET /mon trả 200 và đủ 2 món ban đầu',
        },
        {
          stdinLines: [],
          expected: 'MOT: 200 Ca phe sua',
          match: 'contains',
          hidden: false,
          label: 'GET /mon/2 lấy đúng món số 2 (tham số đường dẫn đổi sang số)',
        },
        {
          stdinLines: [],
          expected: 'THIEU: 404',
          match: 'contains',
          hidden: false,
          label: 'Món không tồn tại phải trả 404, không phải 200 kèm dữ liệu rỗng',
        },
        {
          stdinLines: [],
          expected: 'TAO: 201 3',
          match: 'contains',
          hidden: false,
          label: 'POST /mon tạo món mới, trả 201 và id vừa sinh',
        },
        {
          stdinLines: [],
          expected: 'CON LAI: 2',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: sau khi thêm 1 và xoá 1 thì còn đúng 2 món (DELETE có commit thật)',
        },
      ],
      hints: [
        'Bốn cái nhãn @app.get/@app.post/@app.delete phải nằm NGAY TRÊN hàm tương ứng, không cách dòng trống ở giữa.',
        'Ghi chú kiểu mon_id: int là bắt buộc ở bài này — thiếu nó, mon_id là chuỗi "2" và câu WHERE id = ? sẽ không tìm thấy dòng nào, bạn nhận 404 ở ca lẽ ra 200.',
        'POST: id mới không tự có trong du_lieu — lấy bằng cur = db.execute(...) rồi cur.lastrowid, và nhớ db.commit() nếu không dữ liệu không được ghi thật.',
        'Khung tham chiếu cho hai cửa khó:\n\n@app.post("/mon")\ndef them(du_lieu):\n    cur = db.execute(\n        "INSERT INTO mon (ten, gia) VALUES (?, ?)", (du_lieu["ten"], du_lieu["gia"])\n    )\n    db.commit()\n    return {"id": cur.lastrowid, "ten": du_lieu["ten"], "gia": du_lieu["gia"]}\n\n@app.delete("/mon/{mon_id}")\ndef xoa(mon_id: int):\n    db.execute("DELETE FROM mon WHERE id = ?", (mon_id,))\n    db.commit()\n    return {"da_xoa": mon_id}',
      ],
      sampleSolution: `import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE mon (id INTEGER PRIMARY KEY, ten TEXT, gia INTEGER)")
db.execute("INSERT INTO mon (ten, gia) VALUES ('Tra da', 5000)")
db.execute("INSERT INTO mon (ten, gia) VALUES ('Ca phe sua', 25000)")
db.commit()

@app.get("/mon")
def danh_sach():
    dong = db.execute("SELECT id, ten, gia FROM mon").fetchall()
    return [{"id": d[0], "ten": d[1], "gia": d[2]} for d in dong]

@app.get("/mon/{mon_id}")
def mot_mon(mon_id: int):
    d = db.execute("SELECT id, ten, gia FROM mon WHERE id = ?", (mon_id,)).fetchone()
    if d is None:
        raise HTTPException(404, f"Khong tim thay mon {mon_id}")
    return {"id": d[0], "ten": d[1], "gia": d[2]}

@app.post("/mon")
def them(du_lieu):
    cur = db.execute(
        "INSERT INTO mon (ten, gia) VALUES (?, ?)", (du_lieu["ten"], du_lieu["gia"])
    )
    db.commit()
    return {"id": cur.lastrowid, "ten": du_lieu["ten"], "gia": du_lieu["gia"]}

@app.delete("/mon/{mon_id}")
def xoa(mon_id: int):
    db.execute("DELETE FROM mon WHERE id = ?", (mon_id,))
    db.commit()
    return {"da_xoa": mon_id}

# ---- Khối kiểm thử: ĐỪNG SỬA ----
client = TestClient(app)
ds = client.get("/mon")
print("DS:", ds.status_code, len(ds.json()))
mot = client.get("/mon/2")
print("MOT:", mot.status_code, mot.json()["ten"])
print("THIEU:", client.get("/mon/99").status_code)
tao = client.post("/mon", json={"ten": "Nuoc cam", "gia": 15000})
print("TAO:", tao.status_code, tao.json()["id"])
print("XOA:", client.delete("/mon/1").status_code)
print("CON LAI:", len(client.get("/mon").json()))`,
    },
    homework:
      'Đây là lúc chạm vào server THẬT. Trên máy bạn: `pip install fastapi uvicorn`, chép đúng 4 endpoint vừa viết vào file main.py (bỏ khối TestClient đi), rồi chạy `uvicorn main:app --reload`. Mở trình duyệt vào http://127.0.0.1:8000/mon — bạn đang xem API của chính mình. Vào tiếp http://127.0.0.1:8000/docs: FastAPI tự sinh trang tài liệu bấm thử được, thử luôn POST ở đó. Ghi lại ba điều mà bản chạy thật có mà bản trong bài học không có.',
    srsCards: [
      {
        hoi: 'Trong REST, đường dẫn và phương thức chia nhau việc gì?',
        dap: 'Đường dẫn nói tới THỨ GÌ (/mon/2 là món số 2), phương thức nói LÀM GÌ với nó (GET đọc, POST tạo, PUT sửa, DELETE xoá). Nhờ vậy không cần đặt tên kiểu /lay-mon-so-2.',
      },
      {
        hoi: 'Vì sao phải ghi chú kiểu cho tham số đường dẫn (mon_id: int)?',
        dap: 'URL vốn là chuỗi. Có ghi int thì khung tự đổi sang số và tự trả 422 khi nhận /mon/abc; không ghi thì handler nhận chuỗi "2", so với số trong CSDL không khớp và lỗi diễn ra lặng lẽ.',
      },
      {
        hoi: 'Trả lỗi cho người gọi API bằng cách nào?',
        dap: 'raise HTTPException(404, "thông điệp") — nó là exception nghiệp vụ có mang theo mã trạng thái, nên người gọi biết chuyện gì xảy ra thay vì nhận 200 kèm dữ liệu rỗng.',
      },
    ],
  },
]
