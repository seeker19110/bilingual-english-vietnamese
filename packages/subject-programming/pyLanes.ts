// pyLanes — Ba LÀN PYTHON MỞ RỘNG của bậc P4 (PR-L13…L15), khai báo ở MỘT chỗ duy nhất.
//
// Vì sao gộp vào một file: cả ba làn (pytest · http · api) đều chạy trên CÙNG một engine
// Python đã có (Pyodide ở trình duyệt, python3 ở cổng CI). Thứ duy nhất khác nhau là mấy
// module Python được ghi sẵn vào thư mục làm việc trước khi code học viên chạy. Nếu để mỗi
// nơi tự ghép prelude thì cổng CI và trình duyệt sẽ trôi khỏi nhau — đúng thứ đã được cảnh
// báo ở lessonsPython.test.ts. Nên: một hàm, hai nơi cùng gọi.
//
// KHÔNG chèn prelude vào ĐẦU code học viên (cách jsPrelude làm) — làm vậy số dòng traceback
// lệch đi và người mới sẽ đọc lỗi ở dòng không tồn tại. Prelude ở đây là FILE riêng; code
// học viên giữ nguyên dòng 1, chỉ được nối thêm ở CUỐI (không ảnh hưởng số dòng phía trước).
import { PYTEST_MODULE_PY, PYTEST_RUNNER_PY } from './pytestPrelude.js'
import { REQUESTS_MODULE_PY } from './httpSimPrelude.js'
import { FASTAPI_MODULE_PY, TESTCLIENT_MODULE_PY } from './apiSimPrelude.js'

/** Ngôn ngữ bài học chạy bằng engine Python (làn A/B của hiến chương P4). */
export type PythonLane = 'python' | 'pytest' | 'httpsim' | 'apisim'

const LANE_FILES: Record<PythonLane, Record<string, string>> = {
  python: {},
  pytest: {
    'pytest.py': PYTEST_MODULE_PY,
    'dhcb_pytest.py': PYTEST_RUNNER_PY,
  },
  // Làn B: `import requests` chạy được nhờ file cùng tên — code học viên gõ y như gọi API
  // thật, thứ duy nhất khác là dữ liệu nằm sẵn trong máy (và module tự khai điều đó).
  httpsim: { 'requests.py': REQUESTS_MODULE_PY },
  // Làn B: `fastapi` là một GÓI (thư mục có __init__.py) để `from fastapi.testclient import
  // TestClient` gõ đúng như FastAPI thật — code bê sang máy thật chạy được ngay.
  apisim: {
    'fastapi/__init__.py': FASTAPI_MODULE_PY,
    'fastapi/testclient.py': TESTCLIENT_MODULE_PY,
  },
}

// Nối ở CUỐI code học viên. Với làn pytest: học viên chỉ viết các hàm test_*, việc thu thập
// và in báo cáo là của bộ chạy — y như pytest thật (không ai tự gọi hàm test trong file test).
const LANE_SUFFIX: Record<PythonLane, string> = {
  python: '',
  pytest: '\n\nimport dhcb_pytest\ndhcb_pytest.chay(dict(globals()))\n',
  httpsim: '',
  apisim: '',
}

export function laLanPython(language: string): language is PythonLane {
  return (
    language === 'python' ||
    language === 'pytest' ||
    language === 'httpsim' ||
    language === 'apisim'
  )
}

/** File module cần ghi vào thư mục làm việc cho làn này (rỗng với Python thuần). */
export function fileCuaLan(lane: PythonLane): Record<string, string> {
  return LANE_FILES[lane]
}

/** Code cuối cùng đem chạy = code học viên + phần nối của làn. Dòng 1 vẫn là dòng 1. */
export function noiCodeTheoLan(lane: PythonLane, code: string): string {
  return code + LANE_SUFFIX[lane]
}
