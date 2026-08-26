// apiSimPrelude — LÀN "dựng backend nhỏ" của bậc P4 (PR-L15), làn **B** của hiến chương
// docs/research/dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md.
//
// ĐÂY LÀ CHỖ DỄ NÓI DỐI NHẤT CỦA CẢ MÔN, nên nói thẳng ranh giới:
//   - Cái CÓ THẬT ở đây: bảng định tuyến, tham số đường dẫn, mã trạng thái, thân JSON, lỗi
//     nghiệp vụ qua HTTPException, và CSDL SQLite THẬT (module sqlite3 của Python).
//   - Cái KHÔNG có: một tiến trình server, một cổng mạng, uvicorn, đồng thời nhiều kết nối.
//     Handler được gọi THẲNG trong cùng tiến trình — đúng như cách `TestClient` của FastAPI
//     thật làm khi chạy test (đó là lý do chọn khuôn TestClient chứ không bịa ra khuôn khác).
// Vì vậy module tự in dòng [GIA LAP] khi import, và mọi bài dùng nó phải nói rõ: muốn thấy
// server thật thì chạy `uvicorn` trên máy ở phần việc về nhà (làn C).
//
// Cú pháp học viên gõ là cú pháp FastAPI thật: @app.get("/mon/{mon_id}"), HTTPException,
// from fastapi.testclient import TestClient. Nên code viết ở đây bê sang máy thật chạy được
// (chỉ cần `pip install fastapi uvicorn`).

/** `fastapi/__init__.py` — FastAPI + HTTPException (bản rút gọn). */
export const FASTAPI_MODULE_PY = `# fastapi (GIA LAP cua DHCB) — xem apiSimPrelude.ts
"""Dinh tuyen that, JSON that, SQLite that — nhung KHONG co tien trinh server nao."""

import inspect


class HTTPException(Exception):
    """Loi nghiep vu tra ve cho nguoi goi API, kem dung ma trang thai."""

    def __init__(self, status_code, detail=""):
        super().__init__(f"{status_code}: {detail}")
        self.status_code = status_code
        self.detail = detail


class _Tuyen:
    def __init__(self, method, path, ham, status_code):
        self.method = method
        self.path = path
        self.ham = ham
        self.status_code = status_code
        self.doan = [d for d in path.strip("/").split("/") if d != ""]

    def khop(self, doan_that):
        """Tra ve dict tham so duong dan neu khop, None neu khong."""
        if len(doan_that) != len(self.doan):
            return None
        tham_so = {}
        for mau, that in zip(self.doan, doan_that):
            if mau.startswith("{") and mau.endswith("}"):
                tham_so[mau[1:-1]] = that
            elif mau != that:
                return None
        return tham_so


class FastAPI:
    def __init__(self, title="API"):
        self.title = title
        self._tuyen = []

    def _dang_ky(self, method, path, status_code):
        def deco(ham):
            self._tuyen.append(_Tuyen(method, path, ham, status_code))
            return ham

        return deco

    def get(self, path, status_code=200):
        return self._dang_ky("GET", path, status_code)

    def post(self, path, status_code=201):
        return self._dang_ky("POST", path, status_code)

    def put(self, path, status_code=200):
        return self._dang_ky("PUT", path, status_code)

    def delete(self, path, status_code=200):
        return self._dang_ky("DELETE", path, status_code)

    def _goi(self, method, path, du_lieu):
        doan = [d for d in path.strip("/").split("/") if d != ""]
        co_duong_dan = False
        for tuyen in self._tuyen:
            tham_so = tuyen.khop(doan)
            if tham_so is None:
                continue
            co_duong_dan = True
            if tuyen.method != method:
                continue
            return self._chay(tuyen, tham_so, du_lieu)
        if co_duong_dan:
            return (405, {"detail": f"Method Not Allowed: {method} {path}"})
        return (404, {"detail": f"Not Found: {path}"})

    def _chay(self, tuyen, tham_so, du_lieu):
        chu_ky = inspect.signature(tuyen.ham)
        doi_so = {}
        for ten, tham in chu_ky.parameters.items():
            if ten in tham_so:
                gia_tri = tham_so[ten]
                if tham.annotation is int:
                    if not str(gia_tri).lstrip("-").isdigit():
                        return (422, {"detail": f"Tham so {ten} phai la so nguyen"})
                    gia_tri = int(gia_tri)
                doi_so[ten] = gia_tri
            elif ten == "du_lieu":
                doi_so[ten] = du_lieu if du_lieu is not None else {}
            elif tham.default is not inspect.Parameter.empty:
                continue
            else:
                return (500, {"detail": f"Handler thieu du lieu cho tham so: {ten}"})
        try:
            ket_qua = tuyen.ham(**doi_so)
        except HTTPException as loi:
            return (loi.status_code, {"detail": loi.detail})
        return (tuyen.status_code, ket_qua)


print("[GIA LAP] fastapi: dinh tuyen chay that, nhung KHONG co server/uvicorn nao dang chay.")
`

/** `fastapi/testclient.py` — gọi thẳng handler trong cùng tiến trình, y như TestClient thật. */
export const TESTCLIENT_MODULE_PY = `# fastapi.testclient (GIA LAP cua DHCB) — xem apiSimPrelude.ts


class Response:
    def __init__(self, status_code, payload):
        self.status_code = status_code
        self._payload = payload

    @property
    def ok(self):
        return self.status_code < 400

    def json(self):
        return self._payload

    def __repr__(self):
        return f"<Response [{self.status_code}]>"


class TestClient:
    """Goi handler THANG trong cung tien trinh — khong qua mang, khong co cong."""

    def __init__(self, app):
        self.app = app

    def get(self, path):
        return Response(*self.app._goi("GET", path, None))

    def post(self, path, json=None):
        return Response(*self.app._goi("POST", path, json))

    def put(self, path, json=None):
        return Response(*self.app._goi("PUT", path, json))

    def delete(self, path):
        return Response(*self.app._goi("DELETE", path, None))
`
