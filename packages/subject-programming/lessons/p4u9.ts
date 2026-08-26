// lessons/p4u9.ts — Bài học P4-U9: BACKEND NHỎ 2 (hợp đồng JSON + kiểm dữ liệu ở SERVER).
// Làn B — tiếp nối U8. Trọng tâm không còn là cú pháp định tuyến nữa mà là thứ quyết định
// một API dùng được hay không: hợp đồng dữ liệu ổn định và KHÔNG TIN CLIENT.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P4U9_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p4-u9-l1',
    unitId: 'p4-u9',
    language: 'apisim',
    title: 'Nối frontend với backend — hợp đồng dữ liệu và luật không tin client',
    hook: 'Trang đặt hàng của bạn gửi lên {"mon_id": 2, "so_luong": -5} — vì khách bấm nhầm, hoặc vì ai đó cố tình sửa dữ liệu trước khi gửi. Nếu server ngoan ngoãn ghi vào CSDL, quán bạn vừa có một đơn hàng âm tiền. Chặn ở giao diện là chưa đủ: giao diện nằm trên máy người khác.',
    theory:
      'Khi frontend và backend là hai chương trình riêng, thứ nối chúng lại chỉ có một: HỢP ĐỒNG DỮ LIỆU — tên các trường JSON, kiểu của chúng, và mã trạng thái ứng với từng tình huống.\n\nHợp đồng của một endpoint đặt hàng có thể viết ra như sau:\n  Gửi lên : {"mon_id": số, "so_luong": số}\n  201 → {"id": số, "thanh_tien": số, "trang_thai": "da_nhan"}\n  404 → không có món đó\n  422 → dữ liệu gửi lên không hợp lệ (số lượng ≤ 0)\n\nHợp đồng là thứ ĐỔI ĐƯỢC NHƯNG PHẢI CỐ Ý. Đổi tên trường thanh_tien thành tong_tien nghe vô hại, nhưng mọi trang web đang đọc trường cũ sẽ hiện trống — mà backend không hề báo lỗi. Đó là lý do người ta viết hợp đồng ra giấy trước khi code, và không đổi lặng lẽ.\n\nLUẬT LỚN NHẤT của phần này: KHÔNG TIN CLIENT. Mọi thứ chạy trên máy người dùng đều sửa được — nút bị vô hiệu hoá vẫn bấm được, ô nhập chỉ cho nhập số vẫn gửi được chữ, và người ta gọi thẳng API của bạn không cần trang web nào. Nên mọi quy tắc quan trọng phải được kiểm LẠI ở server: số lượng phải dương, món phải tồn tại, giá phải lấy TỪ CSDL chứ không lấy theo giá client gửi lên. Kiểm ở giao diện chỉ để báo sớm cho người dùng dễ chịu, không phải để bảo vệ dữ liệu.\n\nBa mã trạng thái hay dùng khi từ chối: 400/422 "dữ liệu bạn gửi sai", 404 "thứ bạn hỏi không có", 409 "xung đột với trạng thái hiện tại" (ví dụ đặt món đã hết hàng). Trả đúng mã giúp frontend biết nên hiện thông báo gì — trả 200 kèm {"loi": ...} thì frontend phải đoán, và thường đoán sai.',
    workedExample: {
      code: `import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE mon (id INTEGER PRIMARY KEY, ten TEXT, gia INTEGER)")
db.execute("INSERT INTO mon (ten, gia) VALUES ('Ca phe sua', 25000)")
db.commit()

@app.post("/don")
def dat_hang(du_lieu):
    so_luong = du_lieu.get("so_luong", 0)
    # ① Kiểm dữ liệu gửi lên TRƯỚC — đây là việc của server, không phải của giao diện
    if not isinstance(so_luong, int) or so_luong <= 0:
        raise HTTPException(422, "so_luong phai la so nguyen duong")

    # ② Thứ khách hỏi có tồn tại không
    mon = db.execute(
        "SELECT ten, gia FROM mon WHERE id = ?", (du_lieu.get("mon_id"),)
    ).fetchone()
    if mon is None:
        raise HTTPException(404, "Khong co mon nay")

    # ③ GIÁ LẤY TỪ CSDL, không lấy theo giá client gửi lên — nếu tin client thì ai cũng
    #    tự đặt giá 0 đồng cho mình được.
    return {"id": 1, "thanh_tien": mon[1] * so_luong, "trang_thai": "da_nhan"}

client = TestClient(app)
print("Hop le:", client.post("/don", json={"mon_id": 1, "so_luong": 2}).json())
print("So luong am:", client.post("/don", json={"mon_id": 1, "so_luong": -5}).status_code)
print("Mon la:", client.post("/don", json={"mon_id": 9, "so_luong": 1}).status_code)
# Client gui kem gia rieng cua no — server bo qua, van tinh theo gia that
print("Gia gia mao:", client.post("/don", json={"mon_id": 1, "so_luong": 1, "gia": 1}).json())`,
      stdinLines: [],
    },
    predict: {
      code: `from fastapi import FastAPI\nfrom fastapi.testclient import TestClient\n\napp = FastAPI()\n\n@app.get("/don")\ndef xem_don():\n    return {"so_don": 0}\n\nclient = TestClient(app)\nprint("Ma tra ve:", client.post("/don", json={"mon_id": 1}).status_code)`,
      question: 'Frontend gửi POST /don, nhưng backend mới chỉ đăng ký GET /don. Nhận được mã gì?',
      choices: ['Ma tra ve: 405', 'Ma tra ve: 404', 'Ma tra ve: 200', 'Ma tra ve: 500'],
      answerIndex: 0,
      explain:
        'Đường dẫn /don CÓ tồn tại, chỉ là nó không nhận phương thức POST — đó đúng là ý nghĩa của 405 Method Not Allowed. Phân biệt được 405 với 404 giúp bạn tìm ra lỗi nhanh: 404 nghĩa là gõ sai đường dẫn, 405 nghĩa là đường dẫn đúng mà dùng sai động từ (rất hay gặp khi frontend gửi POST tới endpoint mới viết một nửa).',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành phần đầu của endpoint đặt hàng: kiểm số lượng hợp lệ rồi kiểm món có tồn tại.',
      lines: [
        '@app.post("/don")',
        'def dat_hang(du_lieu):',
        '    so_luong = du_lieu.get("so_luong", 0)',
        '    if not isinstance(so_luong, int) or so_luong <= 0:',
        '        raise HTTPException(422, "so_luong phai la so nguyen duong")',
        '    mon = db.execute("SELECT gia FROM mon WHERE id = ?", (du_lieu.get("mon_id"),)).fetchone()',
        '    if mon is None:',
        '        raise HTTPException(404, "Khong co mon nay")',
      ],
    },
    make: {
      prompt:
        'CSDL đã có sẵn bảng mon (1 Tra da 5000, 2 Ca phe sua 25000) và bảng don rỗng. Viết 2 endpoint theo ĐÚNG hợp đồng sau:\n\nPOST /don — thân JSON {"mon_id": số, "so_luong": số}\n  · so_luong không phải số nguyên dương → HTTPException(422, ...)\n  · không có món đó → HTTPException(404, ...)\n  · hợp lệ → ghi vào bảng don rồi trả {"id": <id vừa tạo>, "thanh_tien": <giá LẤY TỪ CSDL × số lượng>, "trang_thai": "da_nhan"}\n\nGET /don/{don_id} — don_id: int\n  · không có đơn đó → HTTPException(404, ...)\n  · có → trả {"id":.., "mon_id":.., "so_luong":.., "thanh_tien":.., "trang_thai": "da_nhan"}\n\nQuan trọng: thanh_tien phải tính theo giá trong CSDL. Nếu client gửi kèm trường "gia" của riêng nó, bạn PHẢI bỏ qua.\n\nBảng don có cột: id, mon_id, so_luong, thanh_tien. Đừng sửa khối kiểm thử ở cuối.',
      starterCode: `import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE mon (id INTEGER PRIMARY KEY, ten TEXT, gia INTEGER)")
db.execute("INSERT INTO mon (ten, gia) VALUES ('Tra da', 5000)")
db.execute("INSERT INTO mon (ten, gia) VALUES ('Ca phe sua', 25000)")
db.execute(
    "CREATE TABLE don (id INTEGER PRIMARY KEY, mon_id INTEGER, so_luong INTEGER, thanh_tien INTEGER)"
)
db.commit()

# ---- Viết 2 endpoint của bạn ở đây ----


# ---- Khối kiểm thử: ĐỪNG SỬA ----
client = TestClient(app)
dat = client.post("/don", json={"mon_id": 2, "so_luong": 3})
print("DAT:", dat.status_code, dat.json()["thanh_tien"])
xem = client.get("/don/1")
print("XEM:", xem.status_code, xem.json()["trang_thai"])
print("MON LA:", client.post("/don", json={"mon_id": 99, "so_luong": 1}).status_code)
print("SL SAI:", client.post("/don", json={"mon_id": 1, "so_luong": 0}).status_code)
print("DON LA:", client.get("/don/999").status_code)
gia_mao = client.post("/don", json={"mon_id": 1, "so_luong": 2, "gia": 1})
print("GIA MAO:", gia_mao.json()["thanh_tien"])
`,
      testCases: [
        {
          stdinLines: [],
          expected: 'DAT: 201 75000',
          match: 'contains',
          hidden: false,
          label: 'Đặt 3 ly cà phê sữa 25.000đ → 201 và thành tiền 75.000đ',
        },
        {
          stdinLines: [],
          expected: 'XEM: 200 da_nhan',
          match: 'contains',
          hidden: false,
          label: 'Xem lại đơn vừa tạo — đơn đã thật sự được ghi vào CSDL',
        },
        {
          stdinLines: [],
          expected: 'SL SAI: 422',
          match: 'contains',
          hidden: false,
          label: 'Số lượng 0 bị từ chối bằng 422, không được lặng lẽ ghi vào CSDL',
        },
        {
          stdinLines: [],
          expected: 'MON LA: 404',
          match: 'contains',
          hidden: false,
          label: 'Món không tồn tại → 404 (phân biệt với 422 "bạn gửi sai")',
        },
        {
          stdinLines: [],
          expected: 'GIA MAO: 10000',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — KHÔNG TIN CLIENT: client gửi kèm gia=1 vẫn bị tính theo giá thật',
        },
      ],
      hints: [
        'Thứ tự kiểm quan trọng: kiểm so_luong TRƯỚC khi tra CSDL. Ca "mon_id 1, so_luong 0" phải ra 422 chứ không phải 404 hay 201.',
        'so_luong <= 0 chưa đủ chặt: khách gửi chuỗi "3" thì so sánh với 0 sẽ ném TypeError và bạn trả về 500. Dùng isinstance(so_luong, int) trước.',
        'Đừng lấy giá từ du_lieu. Câu SELECT gia FROM mon WHERE id = ? mới là nguồn giá đúng — đó chính là ca ẩn của bài.',
        'Khung tham chiếu cho phần ghi đơn:\n\ncur = db.execute(\n    "INSERT INTO don (mon_id, so_luong, thanh_tien) VALUES (?, ?, ?)",\n    (mon_id, so_luong, thanh_tien),\n)\ndb.commit()\nreturn {"id": cur.lastrowid, "thanh_tien": thanh_tien, "trang_thai": "da_nhan"}',
      ],
      sampleSolution: `import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE mon (id INTEGER PRIMARY KEY, ten TEXT, gia INTEGER)")
db.execute("INSERT INTO mon (ten, gia) VALUES ('Tra da', 5000)")
db.execute("INSERT INTO mon (ten, gia) VALUES ('Ca phe sua', 25000)")
db.execute(
    "CREATE TABLE don (id INTEGER PRIMARY KEY, mon_id INTEGER, so_luong INTEGER, thanh_tien INTEGER)"
)
db.commit()

@app.post("/don")
def dat_hang(du_lieu):
    so_luong = du_lieu.get("so_luong")
    if not isinstance(so_luong, int) or so_luong <= 0:
        raise HTTPException(422, "so_luong phai la so nguyen duong")

    mon_id = du_lieu.get("mon_id")
    mon = db.execute("SELECT gia FROM mon WHERE id = ?", (mon_id,)).fetchone()
    if mon is None:
        raise HTTPException(404, f"Khong co mon {mon_id}")

    thanh_tien = mon[0] * so_luong          # giá LẤY TỪ CSDL, không tin client
    cur = db.execute(
        "INSERT INTO don (mon_id, so_luong, thanh_tien) VALUES (?, ?, ?)",
        (mon_id, so_luong, thanh_tien),
    )
    db.commit()
    return {"id": cur.lastrowid, "thanh_tien": thanh_tien, "trang_thai": "da_nhan"}

@app.get("/don/{don_id}")
def xem_don(don_id: int):
    d = db.execute(
        "SELECT id, mon_id, so_luong, thanh_tien FROM don WHERE id = ?", (don_id,)
    ).fetchone()
    if d is None:
        raise HTTPException(404, f"Khong co don {don_id}")
    return {
        "id": d[0],
        "mon_id": d[1],
        "so_luong": d[2],
        "thanh_tien": d[3],
        "trang_thai": "da_nhan",
    }

# ---- Khối kiểm thử: ĐỪNG SỬA ----
client = TestClient(app)
dat = client.post("/don", json={"mon_id": 2, "so_luong": 3})
print("DAT:", dat.status_code, dat.json()["thanh_tien"])
xem = client.get("/don/1")
print("XEM:", xem.status_code, xem.json()["trang_thai"])
print("MON LA:", client.post("/don", json={"mon_id": 99, "so_luong": 1}).status_code)
print("SL SAI:", client.post("/don", json={"mon_id": 1, "so_luong": 0}).status_code)
print("DON LA:", client.get("/don/999").status_code)
gia_mao = client.post("/don", json={"mon_id": 1, "so_luong": 2, "gia": 1})
print("GIA MAO:", gia_mao.json()["thanh_tien"])`,
    },
    homework:
      'Chạy API của bạn bằng uvicorn như ở U8, rồi tự đóng vai "client xấu": mở dòng lệnh và gửi thẳng một đơn hàng số lượng âm bằng curl —\n  curl -X POST http://127.0.0.1:8000/don -H "Content-Type: application/json" -d \'{"mon_id":1,"so_luong":-5}\'\nKhông có trang web nào ở đây cả, và server của bạn vẫn phải từ chối. Sau đó thử gửi kèm "gia": 1 xem thành tiền có bị đổi không. Ghi lại: nếu bạn chỉ chặn ở giao diện thì hai lần thử này sẽ ra sao?',
    srsCards: [
      {
        hoi: '"Hợp đồng dữ liệu" giữa frontend và backend gồm những gì?',
        dap: 'Tên và kiểu các trường JSON gửi lên/trả về, cùng mã trạng thái ứng với từng tình huống. Đổi tên một trường là phá frontend đang chạy, dù backend không báo lỗi gì.',
      },
      {
        hoi: 'Vì sao kiểm dữ liệu ở giao diện là chưa đủ?',
        dap: 'Vì giao diện chạy trên máy người dùng nên sửa được, và người ta gọi thẳng API không cần trang web nào. Mọi quy tắc quan trọng phải kiểm lại ở server.',
      },
      {
        hoi: 'Giá của món nên lấy từ đâu khi xử lý đơn hàng?',
        dap: 'Từ CSDL của server, không bao giờ lấy theo giá client gửi lên — nếu tin client thì ai cũng tự đặt giá 0 đồng cho mình được.',
      },
      {
        hoi: 'Khác nhau giữa mã 404 và 405?',
        dap: '404 là đường dẫn không tồn tại (gõ sai địa chỉ); 405 là đường dẫn có nhưng không nhận phương thức đó (gửi POST tới endpoint mới chỉ có GET).',
      },
    ],
  },
]
