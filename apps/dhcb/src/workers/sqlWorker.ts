// sqlWorker — Web Worker chạy SQL trên SQLite biên dịch WASM (sql.js) cho môn Lập trình
// (PR-L7b2). Cùng lý do chọn Worker như jsWorker: truy vấn nặng/lặp vô hạn không được phép
// treo giao diện, và terminate() là cách duy nhất ngắt code đang chạy trong WASM.
//
// CSDL nằm HOÀN TOÀN trong bộ nhớ và được dựng LẠI TỪ ĐẦU mỗi lượt chạy: học viên có thể
// DELETE/DROP thoải mái để học, lượt sau vẫn có dữ liệu sạch. Không đụng gì tới CSDL thật
// của ứng dụng — đây là hai thế giới tách biệt.
//
// File .wasm tự host tại /sqljs/sql-wasm.wasm (copy trong vite.config.ts), KHÔNG dùng CDN.
//
// Giao thức message — cố ý giống pyodideWorker/jsWorker để ba bộ chạy dùng chung hình dạng:
//  vào : { type: 'run', id, code }
//  ra  : { type: 'loading', id } | { type: 'ready', id }
//        { type: 'stdout', id, text } | { type: 'done', id, durationMs }
//        { type: 'error', id, message }
import initSqlJs from 'sql.js'
import { SQL_SEED } from '@dhcb/subject-programming/sqlDataset'
import { formatSqlResults, type SqlResultTable } from '@dhcb/subject-programming/sqlPrelude'

interface RunRequest {
  type: 'run'
  id: number
  code: string
}

const scope = self as unknown as {
  postMessage(msg: unknown): void
  onmessage: ((e: MessageEvent<RunRequest>) => void) | null
  location: { origin: string }
}

type SqlModule = Awaited<ReturnType<typeof initSqlJs>>
let sqlPromise: Promise<SqlModule> | null = null

function getSql(id: number): Promise<SqlModule> {
  if (!sqlPromise) {
    scope.postMessage({ type: 'loading', id })
    sqlPromise = initSqlJs({ locateFile: () => `${scope.location.origin}/sqljs/sql-wasm.wasm` })
  }
  return sqlPromise
}

scope.onmessage = async (e: MessageEvent<RunRequest>) => {
  const { id, code } = e.data
  let SQL: SqlModule
  try {
    SQL = await getSql(id)
  } catch (err) {
    // Nạp hỏng thì cho phép thử lại lượt sau (đừng giữ lời hứa lỗi trong bộ nhớ).
    sqlPromise = null
    scope.postMessage({
      type: 'error',
      id,
      message: `Không tải được SQLite: ${(err as Error).message}`,
    })
    return
  }

  scope.postMessage({ type: 'ready', id })
  const startedAt = Date.now()
  const db = new SQL.Database()
  try {
    db.run(SQL_SEED)
    const tables = db.exec(code) as SqlResultTable[]
    scope.postMessage({ type: 'stdout', id, text: formatSqlResults(tables) })
    scope.postMessage({ type: 'done', id, durationMs: Date.now() - startedAt })
  } catch (err) {
    scope.postMessage({ type: 'error', id, message: (err as Error).message })
  } finally {
    db.close()
  }
}
