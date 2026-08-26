// httpSimPrelude — LÀN "HTTP & REST" của bậc P4 (PR-L14), làn **B** của hiến chương
// docs/research/dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md: mô phỏng KHAI BÁO MINH BẠCH.
//
// VÌ SAO KHÔNG GỌI MẠNG THẬT: sandbox học tập không có mạng (CSP của app chặn, runner CI cũng
// không được phép gọi API bên ngoài — và không nên: hạn mức free tier của bên thứ ba sẽ cạn
// vì mỗi lần chấm bài). Nên `requests` ở đây là module CÙNG TÊN, CÙNG HÌNH DẠNG, phục vụ một
// bộ dữ liệu cố định nằm sẵn trong máy.
//
// LUẬT TỰ KHAI (bắt buộc theo hiến chương): module in một dòng `[GIA LAP]` ngay khi được
// import, và mọi bài dùng nó phải nói rõ đây không phải mạng thật. Học viên gọi API THẬT có
// key ở phần việc về nhà (làn C) — đó là chỗ duy nhất trong bậc này chạm vào Internet thật.
//
// Điều được giữ ĐÚNG NHƯ THẬT (vì đây mới là thứ cần học): mã trạng thái, tham số truy vấn,
// phân giải JSON, và ba kiểu hỏng khác nhau của một lần gọi mạng — 404 (đường dẫn/dữ liệu
// không có), 500 (server hỏng), và không nối được host (ConnectionError).

/** Module `requests` giả lập — `import requests` trong bài học chạy được nhờ file này. */
export const REQUESTS_MODULE_PY = `# requests (GIA LAP cua DHCB) — xem httpSimPrelude.ts
"""Thay cho thu vien requests that: phuc vu du lieu mau co dinh, KHONG co mang."""

import json as _json

HOST = "api.dhcb.test"
BASE = f"https://{HOST}"

# ---- Du lieu mau (dong vai "co so du lieu" cua server gia) ----
THOI_TIET = {
    "Ha Noi": {"nhiet_do": 33, "do_am": 74, "mo_ta": "Nang nong"},
    "Hue": {"nhiet_do": 31, "do_am": 82, "mo_ta": "Mua rao"},
    "Da Nang": {"nhiet_do": 30, "do_am": 78, "mo_ta": "Nhieu may"},
    "TP HCM": {"nhiet_do": 34, "do_am": 70, "mo_ta": "Nang"},
    "Can Tho": {"nhiet_do": 32, "do_am": 80, "mo_ta": "Mua dong"},
}

MENU = [
    {"id": 1, "ten": "Tra da", "gia": 5000},
    {"id": 2, "ten": "Ca phe sua", "gia": 25000},
    {"id": 3, "ten": "Nuoc cam", "gia": 15000},
]


class RequestException(Exception):
    pass


class ConnectionError(RequestException):
    """Khong noi duoc toi host — dung nhu khi mat mang that."""


class HTTPError(RequestException):
    pass


class Response:
    def __init__(self, status_code, payload):
        self.status_code = status_code
        self._payload = payload
        self.text = _json.dumps(payload, ensure_ascii=False)

    @property
    def ok(self):
        return self.status_code < 400

    def json(self):
        return self._payload

    def raise_for_status(self):
        if self.status_code >= 400:
            raise HTTPError(f"{self.status_code} loi khi goi API")

    def __repr__(self):
        return f"<Response [{self.status_code}]>"


def _tach(url):
    if not url.startswith("https://") and not url.startswith("http://"):
        raise ConnectionError(f"URL phai bat dau bang http:// hoac https:// — nhan duoc: {url}")
    khong_giao_thuc = url.split("://", 1)[1]
    host, _, duong_dan = khong_giao_thuc.partition("/")
    if host != HOST:
        raise ConnectionError(
            f"Khong noi duoc toi {host}. Sandbox bai hoc KHONG co mang that; "
            f"chi co API mau tai {BASE}."
        )
    duong_dan, _, chuoi_truy_van = duong_dan.partition("?")
    tham_so = {}
    for cap in chuoi_truy_van.split("&"):
        if "=" in cap:
            k, v = cap.split("=", 1)
            tham_so[k] = v.replace("%20", " ").replace("+", " ")
    return "/" + duong_dan.strip("/"), tham_so


def get(url, params=None, timeout=None):
    duong_dan, tu_url = _tach(url)
    tham_so = {**tu_url, **(params or {})}

    if duong_dan == "/thoi-tiet":
        tinh = tham_so.get("tinh")
        if tinh is None:
            return Response(422, {"loi": "Thieu tham so bat buoc: tinh"})
        if tinh not in THOI_TIET:
            return Response(404, {"loi": f"Khong co du lieu cho tinh: {tinh}"})
        return Response(200, {"tinh": tinh, **THOI_TIET[tinh]})

    if duong_dan == "/mon":
        return Response(200, {"so_luong": len(MENU), "danh_sach": MENU})

    if duong_dan.startswith("/mon/"):
        ma = duong_dan.split("/")[-1]
        if not ma.isdigit():
            return Response(422, {"loi": f"Ma mon phai la so — nhan duoc: {ma}"})
        for mon in MENU:
            if mon["id"] == int(ma):
                return Response(200, mon)
        return Response(404, {"loi": f"Khong tim thay mon co id {ma}"})

    if duong_dan == "/loi-server":
        return Response(500, {"loi": "Server dang gap su co"})

    return Response(404, {"loi": f"Khong co duong dan {duong_dan}"})


def post(url, json=None, timeout=None):
    duong_dan, _ = _tach(url)
    du_lieu = json or {}

    if duong_dan == "/don":
        if "mon_id" not in du_lieu or "so_luong" not in du_lieu:
            return Response(422, {"loi": "Don hang phai co mon_id va so_luong"})
        for mon in MENU:
            if mon["id"] == du_lieu["mon_id"]:
                tong = mon["gia"] * du_lieu["so_luong"]
                return Response(
                    201, {"id": 101, "trang_thai": "da_nhan", "thanh_tien": tong}
                )
        return Response(404, {"loi": f"Khong tim thay mon co id {du_lieu['mon_id']}"})

    return Response(404, {"loi": f"Khong co duong dan {duong_dan}"})


print(
    "[GIA LAP] requests: phuc vu du lieu mau offline tai "
    + BASE
    + " — KHONG co mang that."
)
`
