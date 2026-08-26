// pytestPrelude — LÀN "test tự động" của bậc P4 (PR-L13).
//
// VẤN ĐỀ: unit P4-U5/U6 dạy viết test bằng pytest, nhưng pytest thật là gói ngoài (phải
// micropip cài trong Pyodide, ~vài MB, và cần cả cơ chế thu thập file conftest) — quá nặng
// cho một sandbox học tập chạy trong tab trình duyệt.
//
// LỜI GIẢI (làn A của hiến chương dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md — chạy THẬT,
// nhưng bằng bộ chạy rút gọn tự khai): hai module Python nhỏ được ghi vào workspace trước khi
// chạy code học viên:
//   - pytest.py      → để `import pytest` chạy được, có raises/approx/mark.parametrize
//   - dhcb_pytest.py → bộ thu thập hàm test_* và in báo cáo
// Cú pháp học viên gõ là cú pháp pytest THẬT; thứ rút gọn là bộ chạy, và nó TỰ KHAI ngay
// dòng đầu báo cáo. Học viên chạy pytest thật trên máy ở bước ⑦ (làn C).
//
// GIỚI HẠN đã biết, có chủ đích: không có fixture, không có conftest, không có assertion
// rewriting của pytest (nên khi assert trần thất bại, bộ chạy in DÒNG CODE gây lỗi thay cho
// bảng so sánh giá trị). Ba thứ đó thuộc phần "chạy thật trên máy" của bậc P5.

/** `import pytest` — bản rút gọn: raises · approx · mark.parametrize · fail. */
export const PYTEST_MODULE_PY = `# pytest (ban RUT GON cua DHCB) — xem pytestPrelude.ts
import math


class _Approx:
    """So sanh so thuc co dung sai — tranh bay 0.1 + 0.2 != 0.3."""

    def __init__(self, value, rel=1e-6, abs_tol=1e-12):
        self.value = value
        self.rel = rel
        self.abs_tol = abs_tol

    def __eq__(self, other):
        try:
            return math.isclose(other, self.value, rel_tol=self.rel, abs_tol=self.abs_tol)
        except TypeError:
            return NotImplemented

    def __repr__(self):
        return f"approx({self.value})"


def approx(value, rel=1e-6, abs=1e-12):
    return _Approx(value, rel, abs)


class _Raises:
    def __init__(self, expected):
        self.expected = expected
        self.value = None

    def __enter__(self):
        return self

    def __exit__(self, kind, value, tb):
        if kind is None:
            raise AssertionError(f"DID NOT RAISE {self.expected.__name__}")
        if issubclass(kind, self.expected):
            self.value = value
            return True
        return False


def raises(expected):
    """with pytest.raises(LoiNaoDo): ... — dat khi khoi lenh KHONG nem loi do."""
    return _Raises(expected)


def fail(msg="failed"):
    raise AssertionError(msg)


class _Mark:
    def parametrize(self, argnames, argvalues):
        names = (
            [n.strip() for n in argnames.split(",")]
            if isinstance(argnames, str)
            else [str(n) for n in argnames]
        )

        def deco(fn):
            fn._dhcb_params = (names, list(argvalues))
            return fn

        return deco

    def __getattr__(self, name):
        # Cac mark khac (skip, xfail...) chua ho tro: khong im lang bo qua.
        raise AttributeError(
            f"pytest.mark.{name} chua co trong ban rut gon cua bai hoc "
            "— chay pytest that tren may de dung."
        )


mark = _Mark()
`

/** Bộ thu thập + báo cáo. Gọi ở cuối lượt chạy: `import dhcb_pytest; dhcb_pytest.chay(globals())`. */
export const PYTEST_RUNNER_PY = `# Bo chay test rut gon cua DHCB — xem pytestPrelude.ts
import traceback


def _dong_gay_loi(exc):
    """Khong co assertion rewriting nhu pytest that -> in DONG CODE gay loi cho de sua."""
    frames = traceback.extract_tb(exc.__traceback__)
    for frame in reversed(frames):
        if frame.line:
            return frame.line.strip()
    return ""


def _mo_ta_loi(exc):
    ten = type(exc).__name__
    thong_diep = str(exc)
    return f"{ten}: {thong_diep}" if thong_diep else ten


def _chay_mot(ten, goi):
    try:
        goi()
        return (ten, True, "")
    except Exception as exc:  # ke ca AssertionError
        chi_tiet = _mo_ta_loi(exc)
        dong = _dong_gay_loi(exc)
        if dong:
            chi_tiet = f"{chi_tiet}\\n        dong loi: {dong}"
        return (ten, False, chi_tiet)


def _nhan(gia_tri):
    return "-".join(str(v) for v in gia_tri)


def chay(khong_gian):
    print("[GIA LAP] Bo chay pytest RUT GON cua bai hoc (assert - raises - approx - parametrize).")
    ket_qua = []
    for ten, ham in list(khong_gian.items()):
        if not ten.startswith("test_") or not callable(ham):
            continue
        bo_tham_so = getattr(ham, "_dhcb_params", None)
        if bo_tham_so is None:
            ket_qua.append(_chay_mot(ten, ham))
            continue
        names, values = bo_tham_so
        for gia_tri in values:
            bo = gia_tri if isinstance(gia_tri, (tuple, list)) else (gia_tri,)
            nhan = f"{ten}[{_nhan(bo)}]"
            ket_qua.append(_chay_mot(nhan, lambda h=ham, b=bo: h(*b)))

    if not ket_qua:
        print("KHONG TIM THAY ham test_ nao — ten ham kiem thu phai bat dau bang test_")
        print("=== 0 passed, 0 failed ===")
        return

    dat = 0
    for ten, ok, chi_tiet in ket_qua:
        if ok:
            dat += 1
            print(f"{ten} PASSED")
        else:
            print(f"{ten} FAILED")
            for dong in chi_tiet.split("\\n"):
                print(f"        {dong}" if not dong.startswith("        ") else dong)
    print(f"=== {dat} passed, {len(ket_qua) - dat} failed ===")
`
