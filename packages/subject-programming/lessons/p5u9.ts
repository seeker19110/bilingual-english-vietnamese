// lessons/p5u9.ts — BÀI MILESTONE bậc P5 (làn B, `apisim`) — bài cuối cùng của môn.
//
// Theo khuôn milestone của P1-U10, P3-U12 và P4-U12: đề ĐỘC LẬP với dự án trục (lớp học nhà
// văn hoá, không phải cửa hàng) — dự án trục đã có milestone riêng ở chặng của nó, nên bài
// này là phép thử "tự ráp được từ đầu".
//
// Ráp đúng thứ bậc P5 dạy mà bậc P4 chưa: ràng buộc ở tầng CSDL (khoá chính ghép, khoá ngoại,
// CHECK) · giao dịch cho thao tác nhiều bước · tham số ? chống injection · trạng thái lấy từ
// CSDL chứ không tin client. Phần deploy thật nằm ở bước ⑦ (làn C) — không mô phỏng, không
// chấm hộ (hiến chương P5 §3).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P5U9_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p5-u9-l1',
    unitId: 'p5-u9',
    language: 'apisim',
    title: 'Milestone P5 — API đăng ký lớp: chỗ có hạn, dữ liệu không được lệch',
    hook: 'Nhà văn hoá phường mở lớp yoga sáng, đúng 2 chỗ. Bạn nhận làm phần đăng ký. Nghe thì nhỏ hơn cả bài API thư viện ở bậc trước — cho tới khi bạn nhận ra: hai người bấm đăng ký cùng lúc cho chỗ cuối cùng thì chuyện gì xảy ra, và ai là người phải đảm bảo nó không xảy ra.',
    theory:
      'Bài này không có khái niệm mới. Nó kiểm xem bốn thứ của bậc P5 đã thành phản xạ chưa.\n\n1. RÀNG BUỘC ĐẶT Ở TẦNG CSDL, KHÔNG CHỈ Ở CODE. "Một học viên không đăng ký hai lần cùng một lớp" là một luật. Bạn có thể kiểm nó bằng if trong handler — và nên làm, để trả về mã lỗi tử tế. Nhưng luật đó cũng phải nằm trong bảng, dưới dạng khoá chính ghép (lop_id, hoc_vien). Lý do: handler là một đường vào; CSDL là chỗ mọi đường vào đều phải đi qua. Ngày bạn viết thêm một script nhập liệu hàng loạt, cái if kia không bảo vệ được gì.\n\n2. GIAO DỊCH CHO THAO TÁC NHIỀU BƯỚC. Đăng ký là HAI việc ghi: thêm dòng vào bảng đăng ký, và tăng sĩ số của lớp. Làm được một nửa nghĩa là sĩ số lệch — và sĩ số lệch thì lớp nhận thừa người hoặc từ chối oan. Hai việc đó phải cùng vào hoặc cùng không. Lưu ý riêng của sqlite3 trong Python: nó mở giao dịch NGẦM cho bạn, nên chưa gọi commit() thì chưa có gì chắc chắn — bước Dự đoán cho bạn thấy điều đó.\n\n3. THAM SỐ ?, KHÔNG NGOẠI LỆ. Tên học viên là chuỗi do người ngoài gõ vào. Có người tên thật chứa dấu nháy. Có người gõ vào đó một câu SQL. Với tham số ?, hai trường hợp này giống hệt nhau: cả hai đều chỉ là dữ liệu. Đó chính là điều bạn muốn.\n\n4. TRẠNG THÁI LẤY TỪ CSDL. Số chỗ còn lại đọc từ bảng, không bao giờ lấy theo con số client gửi lên — kể cả khi client là chính trang web bạn viết. Trang web của bạn có thể mở trong hai tab, có thể đang xem dữ liệu cũ từ 5 phút trước.\n\nVÀ THỨ TỰ KIỂM, như bậc trước: dữ liệu vào (422) → thứ được hỏi có tồn tại không (404) → trạng thái có cho phép không (409). Ở bài này 409 có hai lý do khác nhau — lớp đã đầy, và học viên đã đăng ký rồi — nên thông điệp phải nói rõ là cái nào, vì hai tình huống đó người dùng phản ứng khác hẳn nhau.\n\nMột lời cuối, vì đây là bài cuối của môn: cái bạn ráp được ở đây chính là khuôn của mọi hệ thống "chỗ có hạn" — đặt vé, giữ bàn, mượn sách, đăng ký khám. Ranh giới quen thuộc vẫn giữ: định tuyến, JSON và SQLite ở đây chạy thật, nhưng KHÔNG có tiến trình server nào. Phần đưa nó ra Internet nằm ở việc về nhà, trên máy thật của bạn.',
    workedExample: {
      code: `import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()
db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys = ON")          # SQLite chỉ canh khoá ngoại khi bật dòng này
db.execute("""CREATE TABLE ban (
    id INTEGER PRIMARY KEY,
    ten TEXT NOT NULL,
    so_ghe INTEGER NOT NULL CHECK (so_ghe > 0),
    da_dat INTEGER NOT NULL DEFAULT 0)""")
db.execute("""CREATE TABLE dat_ban (
    ban_id INTEGER NOT NULL REFERENCES ban(id),
    khach TEXT NOT NULL,
    PRIMARY KEY (ban_id, khach))""")            # luật "một khách một bàn" nằm ở TẦNG CSDL
db.execute("INSERT INTO ban (id, ten, so_ghe) VALUES (1, 'Ban goc cua so', 1)")
db.commit()

@app.post("/dat-ban")
def dat_ban(du_lieu):
    khach = du_lieu.get("khach")
    if not isinstance(khach, str) or khach.strip() == "":
        raise HTTPException(422, "khach phai la chuoi khong rong")     # ① dữ liệu vào
    khach = khach.strip()
    ban = db.execute(
        "SELECT id, ten, so_ghe, da_dat FROM ban WHERE id = ?", (du_lieu.get("ban_id"),)
    ).fetchone()                                                       # tham số ?, luôn luôn
    if ban is None:
        raise HTTPException(404, "Khong co ban nay")                   # ② tồn tại
    if ban[3] >= ban[2]:
        raise HTTPException(409, "Ban da het cho")                     # ③ trạng thái, đọc từ CSDL
    try:
        db.execute("INSERT INTO dat_ban (ban_id, khach) VALUES (?, ?)", (ban[0], khach))
        db.execute("UPDATE ban SET da_dat = da_dat + 1 WHERE id = ?", (ban[0],))
        db.commit()                              # HAI việc ghi, một lần chốt
    except sqlite3.IntegrityError:
        db.rollback()                            # khoá chính ghép chặn -> hoàn tác sạch
        raise HTTPException(409, "Khach nay da dat ban roi")
    return {"ban": ban[1], "con_lai": ban[2] - ban[3] - 1}

client = TestClient(app)
print("Dat lan 1:", client.post("/dat-ban", json={"ban_id": 1, "khach": "An"}).status_code)
print("Dat lan 2:", client.post("/dat-ban", json={"ban_id": 1, "khach": "An"}).status_code)
print("Ten co nhay:", client.post("/dat-ban", json={"ban_id": 1, "khach": "Le' --"}).status_code)
print("Con lai:", db.execute("SELECT so_ghe - da_dat FROM ban WHERE id = 1").fetchone()[0])`,
      stdinLines: [],
    },
    predict: {
      code: `import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE dang_ky (ten TEXT)")
db.execute("INSERT INTO dang_ky VALUES ('An')")     # da chay INSERT roi
db.rollback()                                        # nhung chua he commit
print(db.execute("SELECT COUNT(*) FROM dang_ky").fetchone()[0])`,
      question: 'Câu INSERT đã chạy xong và không báo lỗi gì. Bảng có mấy dòng?',
      choices: ['0', '1', '2', 'Bao loi OperationalError'],
      answerIndex: 0,
      explain:
        'Không dòng nào cả. Module sqlite3 của Python tự MỞ MỘT GIAO DỊCH NGẦM trước câu lệnh ghi đầu tiên, nên mọi thứ bạn ghi chỉ là tạm cho tới khi gọi commit(). rollback() xoá sạch phần tạm đó. Đây là điều tốt — nó chính là cái cho phép bạn hoàn tác khi việc thứ hai thất bại. Nhưng nó cũng là cái bẫy: quên commit() thì chương trình chạy êm, không lỗi, và dữ liệu biến mất khi kết nối đóng. Trong bài milestone, hai việc ghi (thêm dòng đăng ký + tăng sĩ số) phải nằm giữa một lần commit duy nhất, và nếu việc nào hỏng thì rollback cả hai.',
    },
    parsons: {
      prompt:
        'Xếp lại phần ghi của handler đăng ký — hai việc ghi, một lần chốt, hỏng thì hoàn tác cả hai.',
      lines: [
        'try:',
        '    db.execute("INSERT INTO dang_ky (lop_id, hoc_vien) VALUES (?, ?)", (lop_id, hoc_vien))',
        '    db.execute("UPDATE lop SET da_dang_ky = da_dang_ky + 1 WHERE id = ?", (lop_id,))',
        '    db.commit()',
        'except sqlite3.IntegrityError:',
        '    db.rollback()',
        '    raise HTTPException(409, "Hoc vien da dang ky lop nay")',
      ],
    },
    make: {
      prompt:
        'Dựng API đăng ký lớp của nhà văn hoá. SQLite bộ nhớ, bật PRAGMA foreign_keys = ON.\n\nBảng lop: id INTEGER PRIMARY KEY, ten TEXT NOT NULL, suc_chua INTEGER NOT NULL CHECK (suc_chua > 0), da_dang_ky INTEGER NOT NULL DEFAULT 0. Bảng dang_ky: lop_id trỏ tới lop(id), hoc_vien TEXT NOT NULL, KHOÁ CHÍNH GHÉP (lop_id, hoc_vien). Nạp 2 lớp: (1, "Yoga sang", suc_chua 2) và (2, "Ve co ban", suc_chua 10).\n\n① POST /dang-ky nhận {"lop_id", "hoc_vien"} — kiểm ĐÚNG thứ tự này:\n- hoc_vien không phải chuỗi hoặc rỗng sau .strip() → 422 "hoc_vien phai la chuoi khong rong".\n- Không có lớp đó → 404 "Khong co lop nay".\n- da_dang_ky >= suc_chua → 409 "Lop da du <suc chua> cho".\n- Đã đăng ký rồi → 409 "Hoc vien da dang ky lop nay".\n- Hợp lệ → 201, trả {"lop": <ten>, "con_lai": <so cho con lai>}. Ghi là HAI việc trong MỘT giao dịch: thêm dòng dang_ky + tăng da_dang_ky, commit một lần; hỏng thì rollback.\n\n② GET /lop/{lop_id} (khai lop_id: int) → 200 {"ten", "da_dang_ky", "con_lai"}; không có lớp → 404.\n\nMọi truy vấn dùng tham số ?, không ghép chuỗi.\n\nCuối file dựng client = TestClient(app) và in 8 dòng dạng "<nhan>: <status_code>" theo thứ tự: Dang ky An · Dang ky An lan 2 · Ten rong · Lop la · Dang ky Binh · Lop day · Ten co nhay · Con lai lop 1.\nCác lượt gọi tương ứng: An vào lớp 1 · An vào lớp 1 lần nữa · lớp 1 với hoc_vien "  " · lớp 9 với "Binh" · Binh vào lớp 1 · Cuc vào lớp 1 · "Le\' --" vào lớp 2 · rồi GET /lop/1 lấy con_lai.',
      starterCode: `import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()
db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys = ON")
# Tạo hai bảng (nhớ khoá chính ghép và khoá ngoại) rồi nạp 2 lớp


def lay_lop(lop_id):
    # Một chỗ duy nhất đọc lớp từ CSDL — tham số ?
    ...


@app.post("/dang-ky")
def dang_ky(du_lieu):
    # Thứ tự kiểm: 422 -> 404 -> 409 (day) -> 409 (trung) -> ghi trong giao dich
    ...


@app.get("/lop/{lop_id}")
def xem_lop(lop_id: int):
    ...


client = TestClient(app)
# In 8 dòng theo đúng khuôn của đề
`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Dang ky An: 201',
          match: 'contains',
          hidden: false,
          label: 'Đăng ký hợp lệ đầu tiên → 201',
        },
        {
          stdinLines: [],
          expected: 'Dang ky An lan 2: 409',
          match: 'contains',
          hidden: false,
          label: 'Đăng ký trùng → 409 (khoá chính ghép + kiểm trong handler)',
        },
        {
          stdinLines: [],
          expected: 'Ten rong: 422',
          match: 'contains',
          hidden: false,
          label: 'Tên toàn khoảng trắng → 422, kiểm TRƯỚC khi đụng CSDL',
        },
        {
          stdinLines: [],
          expected: 'Lop la: 404',
          match: 'contains',
          hidden: false,
          label: 'Lớp không tồn tại → 404, không phải 409',
        },
        {
          stdinLines: [],
          expected: 'Lop day: 409',
          match: 'contains',
          hidden: false,
          label: 'Chỗ thứ ba của lớp 2 chỗ → 409, sĩ số lấy từ CSDL',
        },
        {
          stdinLines: [],
          expected: 'Ten co nhay: 201',
          match: 'contains',
          hidden: false,
          label: 'Tên chứa dấu nháy và -- chỉ là DỮ LIỆU: đăng ký bình thường, CSDL nguyên vẹn',
        },
        {
          stdinLines: [],
          expected: 'Con lai lop 1: 0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: sĩ số không lệch — hai lượt đăng ký thành công, hai lượt hỏng không đếm',
        },
        {
          stdinLines: [],
          expected: 'Dang ky Binh: 201',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: chỗ thứ hai vẫn nhận được (không chặn oan)',
        },
      ],
      hints: [
        'Kiểm "lớp đã đầy" bằng con số ĐỌC TỪ CSDL (cột da_dang_ky), không bằng bất cứ thứ gì có trong du_lieu. Client gửi lên gì cũng không được tin.',
        'Thứ tự kiểm quyết định mã lỗi người dùng nhận được: 422 (dữ liệu vào) → 404 (tồn tại) → 409 (trạng thái). Tra CSDL trước khi kiểm dữ liệu vào là lớp 9 với tên rỗng sẽ trả 404 thay vì 422.',
        'Hai câu ghi phải nằm giữa MỘT lần commit(). Gọi commit sau mỗi câu là bạn vừa mở cửa cho trạng thái nửa vời: dòng đăng ký đã vào mà sĩ số chưa tăng.',
        'Bắt sqlite3.IntegrityError quanh phần ghi rồi rollback() — đó là lúc khoá chính ghép chặn một lượt trùng mà cái if của bạn lọt qua. Nhớ import sqlite3 để bắt được đúng loại lỗi này.',
        'GET /lop/{lop_id} phải khai tham số là lop_id: int — nhờ chú thích kiểu đó, đường dẫn /lop/abc tự trả 422 thay vì nổ ở giữa handler.',
      ],
      sampleSolution: `import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()
db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys = ON")
db.execute("""CREATE TABLE lop (
    id INTEGER PRIMARY KEY,
    ten TEXT NOT NULL,
    suc_chua INTEGER NOT NULL CHECK (suc_chua > 0),
    da_dang_ky INTEGER NOT NULL DEFAULT 0)""")
db.execute("""CREATE TABLE dang_ky (
    lop_id INTEGER NOT NULL REFERENCES lop(id),
    hoc_vien TEXT NOT NULL,
    PRIMARY KEY (lop_id, hoc_vien))""")     # luật "một người một lớp" nằm ở tầng CSDL
db.execute("INSERT INTO lop (id, ten, suc_chua) VALUES (1, 'Yoga sang', 2)")
db.execute("INSERT INTO lop (id, ten, suc_chua) VALUES (2, 'Ve co ban', 10)")
db.commit()


def lay_lop(lop_id):
    return db.execute(
        "SELECT id, ten, suc_chua, da_dang_ky FROM lop WHERE id = ?", (lop_id,)
    ).fetchone()


@app.post("/dang-ky")
def dang_ky(du_lieu):
    hoc_vien = du_lieu.get("hoc_vien")
    if not isinstance(hoc_vien, str) or hoc_vien.strip() == "":
        raise HTTPException(422, "hoc_vien phai la chuoi khong rong")   # ① dữ liệu vào
    hoc_vien = hoc_vien.strip()

    lop = lay_lop(du_lieu.get("lop_id"))
    if lop is None:
        raise HTTPException(404, "Khong co lop nay")                    # ② tồn tại

    if lop[3] >= lop[2]:                                                # ③ trạng thái, từ CSDL
        raise HTTPException(409, f"Lop da du {lop[2]} cho")

    da_co = db.execute(
        "SELECT 1 FROM dang_ky WHERE lop_id = ? AND hoc_vien = ?", (lop[0], hoc_vien)
    ).fetchone()
    if da_co is not None:
        raise HTTPException(409, "Hoc vien da dang ky lop nay")

    try:
        db.execute("INSERT INTO dang_ky (lop_id, hoc_vien) VALUES (?, ?)", (lop[0], hoc_vien))
        db.execute("UPDATE lop SET da_dang_ky = da_dang_ky + 1 WHERE id = ?", (lop[0],))
        db.commit()                        # HAI việc ghi, một lần chốt
    except sqlite3.IntegrityError:
        db.rollback()                      # khoá chính ghép chặn -> hoàn tác sạch
        raise HTTPException(409, "Hoc vien da dang ky lop nay")

    return {"lop": lop[1], "con_lai": lop[2] - lop[3] - 1}


@app.get("/lop/{lop_id}")
def xem_lop(lop_id: int):
    lop = lay_lop(lop_id)
    if lop is None:
        raise HTTPException(404, "Khong co lop nay")
    return {"ten": lop[1], "da_dang_ky": lop[3], "con_lai": lop[2] - lop[3]}


client = TestClient(app)
print("Dang ky An:", client.post("/dang-ky", json={"lop_id": 1, "hoc_vien": "An"}).status_code)
print("Dang ky An lan 2:", client.post("/dang-ky", json={"lop_id": 1, "hoc_vien": "An"}).status_code)
print("Ten rong:", client.post("/dang-ky", json={"lop_id": 1, "hoc_vien": "  "}).status_code)
print("Lop la:", client.post("/dang-ky", json={"lop_id": 9, "hoc_vien": "Binh"}).status_code)
print("Dang ky Binh:", client.post("/dang-ky", json={"lop_id": 1, "hoc_vien": "Binh"}).status_code)
print("Lop day:", client.post("/dang-ky", json={"lop_id": 1, "hoc_vien": "Cuc"}).status_code)
print("Ten co nhay:", client.post("/dang-ky", json={"lop_id": 2, "hoc_vien": "Le' --"}).status_code)
print("Con lai lop 1:", client.get("/lop/1").json()["con_lai"])`,
    },
    homework:
      'Việc về nhà cuối cùng của môn, và nó nằm hoàn toàn TRÊN MÁY THẬT — sandbox không chạy được server, và môn học không giả vờ ngược lại.\n\n1. Chép code bài này ra máy, cài fastapi và uvicorn thật, thay TestClient bằng uvicorn rồi gọi bằng curl. Bạn sẽ phải sửa vài chỗ — đó chính là phần bộ giả lập của môn không nói được.\n\n2. Đổi SQLite bộ nhớ sang file thật, tắt rồi mở lại xem dữ liệu còn không. Kiểm luôn sĩ số có khớp số dòng bảng đăng ký không — bài kiểm sức khoẻ nên có ở mọi hệ thống dùng cột đếm.\n\n3. Chuyển cấu hình sang biến môi trường theo bài U8 rồi deploy. Chụp lại: URL https chạy thật, bảng biến môi trường (che giá trị), log khởi động. Không có URL sống thì không có dấu hoàn thành — hệ thống không đánh dấu "đạt" thay bạn.',
    srsCards: [
      {
        hoi: 'Vì sao luật nghiệp vụ nên được đặt ở tầng CSDL chứ không chỉ trong handler?',
        dap: 'Vì handler chỉ là MỘT đường vào, còn CSDL là chỗ mọi đường vào đều phải đi qua. Ngày bạn viết thêm script nhập liệu hàng loạt hay một endpoint khác, cái if trong handler cũ không bảo vệ được gì.',
      },
      {
        hoi: 'Module sqlite3 của Python có tự chốt dữ liệu sau mỗi câu INSERT không?',
        dap: 'Không. Nó mở một giao dịch ngầm trước câu ghi đầu tiên, nên mọi thay đổi chỉ là tạm cho tới khi gọi commit(). Quên commit thì chương trình chạy êm, không báo lỗi, và dữ liệu biến mất khi đóng kết nối.',
      },
      {
        hoi: 'Khi một thao tác nghiệp vụ cần hai câu ghi thì phải commit thế nào?',
        dap: 'Một lần commit duy nhất sau CẢ HAI câu, và rollback nếu câu nào hỏng. Commit sau từng câu là mở cửa cho trạng thái nửa vời — dòng đăng ký đã vào mà sĩ số chưa tăng.',
      },
      {
        hoi: 'Một người tên thật có chứa dấu nháy đăng ký thì chuyện gì xảy ra?',
        dap: 'Không có gì cả — tên được lưu nguyên vẹn, nếu bạn dùng tham số ?. Với tham số, tên có dấu nháy và một câu SQL cố tình phá hoại là hoàn toàn giống nhau: cả hai đều chỉ là dữ liệu.',
      },
    ],
  },
]
