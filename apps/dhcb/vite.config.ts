import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import compress from 'vite-plugin-compression'
import { cp, mkdir } from 'node:fs/promises'
import { createReadStream, existsSync } from 'node:fs'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'

// Alias CHỈ áp dụng cho src/ (frontend, do Vite bundle) — KHÔNG áp dụng cho api/.
// api/ được `tsc -p tsconfig.server.json` biên dịch thành JS thật rồi chạy trực tiếp bằng
// `node dist-server/server.js`, không qua bundler nào cả — tsc không tự đổi alias thành đường
// dẫn thật lúc build, nên alias trong api/ sẽ crash production khi Node không tìm thấy module.
// Xem docs/research/dac-ta-gd1-tach-loi-monorepo-2026-07-31.md PR-1 để biết lý do đầy đủ.
//
// @core/* trỏ THẬT vào packages/core-ui/ (từ PR-6) — theme, ToastProvider, authHeader dùng
// chung cho mọi môn sau này (Toán/GĐ2). Các phần còn lại chưa tách được do phụ thuộc chặt
// vào auth/onboarding/i18n riêng của app tiếng Anh — xem PROGRESS.md mục PR-6.
// File này nằm ở apps/dhcb/ (dời từ gốc repo, PR-S2) — mọi đường dẫn tính từ đây.
// repoRoot: gốc repo (nơi có .env, api/, packages/, dist/ output giữ nguyên cho VPS/nginx).
const appDir = fileURLToPath(new URL('.', import.meta.url))
const repoRoot = fileURLToPath(new URL('../..', import.meta.url))
const coreUiDir = fileURLToPath(new URL('../../packages/core-ui', import.meta.url))

// Các file lõi của Pyodide cần cho loadPyodide() — đủ chạy Python thuần + stdlib.
// (KHÔNG copy cả gói: console.html, *.d.ts… không cần cho runtime.)
const PYODIDE_FILES = [
  'pyodide.js',
  'pyodide.js.map',
  'pyodide.mjs',
  'pyodide.mjs.map',
  'pyodide.asm.mjs',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
]
const pyodideSrcDir = fileURLToPath(new URL('../../node_modules/pyodide', import.meta.url))

function pyodideSelfHostPlugin(): Plugin {
  return {
    name: 'dhcb-pyodide-self-host',
    // Build production: copy phẳng vào dist/pyodide/ (outDir của app là dist/ ở gốc repo).
    async closeBundle() {
      const outDir = path.join(repoRoot, 'dist', 'pyodide')
      await mkdir(outDir, { recursive: true })
      for (const f of PYODIDE_FILES) {
        await cp(path.join(pyodideSrcDir, f), path.join(outDir, f))
      }
    },
    // Dev/preview: phục vụ /pyodide/* thẳng từ node_modules (không cần build trước).
    configureServer(server) {
      server.middlewares.use('/pyodide', (req, res, next) => {
        const name = (req.url || '').split('?')[0]?.replace(/^\//, '') || ''
        if (!PYODIDE_FILES.includes(name)) return next()
        const file = path.join(pyodideSrcDir, name)
        if (!existsSync(file)) return next()
        const types: Record<string, string> = {
          '.js': 'text/javascript',
          '.mjs': 'text/javascript',
          '.wasm': 'application/wasm',
          '.zip': 'application/zip',
          '.json': 'application/json',
          '.map': 'application/json',
        }
        res.setHeader('Content-Type', types[path.extname(name)] ?? 'application/octet-stream')
        createReadStream(file).pipe(res)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Đọc các biến môi trường server-only trực tiếp từ file .env (Node) —
  // các biến này KHÔNG có tiền tố VITE_ nên sẽ không bị Vite đóng gói vào file JS gửi cho browser.
  const env = loadEnv(mode, repoRoot, '')

  // api/*.ts đọc key bằng process.env.X (giống lúc chạy thật trên Vercel, nơi Vercel tự inject
  // Environment Variables vào process.env). Lúc "npm run dev", .env KHÔNG tự nạp vào process.env
  // nên ta gán tay các biến server-only cần dùng.
  for (const key of [
    'DATABASE_URL',
    'GOOGLE_TTS_API_KEY',
    'GOOGLE_TTS_API_KEYS',
    'TTS_ENCRYPTION_MASTER_KEY',
    'GEMINI_API_KEY',
    'GEMINI_MODEL',
    'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY',
    'GROQ_API_KEY',
    'GROQ_CHAT_MODEL',
    'STT_MODEL',
    'OPENAI_STT_MODEL',
  ]) {
    if (env[key] && !process.env[key]) process.env[key] = env[key]
  }

  // /api/agent giờ do dev middleware gọi thẳng handler api/ai.ts (xem API_ROUTES bên dưới)
  // — không proxy thẳng tới Anthropic nữa, để handler tự chọn nhà cung cấp (Gemini/Groq/Anthropic).
  return {
    // root = thư mục app (chứa index.html) — KHÔNG phụ thuộc cwd, để chạy được từ gốc repo
    // qua `vite --config apps/dhcb/vite.config.ts` (npm script gốc giữ nguyên tên lệnh).
    root: appDir,
    // envDir = gốc repo (nơi có .env thật) — Vite mặc định tìm .env ngay tại `root`
    // (apps/dhcb/), nhưng file .env thật luôn ở gốc repo. THIẾU dòng này thì mọi biến
    // VITE_* (VITE_GOOGLE_CLIENT_ID, VITE_SENTRY_DSN...) đều rỗng lúc build production —
    // đây là nguyên nhân lỗi "Không kết nối được Google" sau đợt dời apps/english → apps/dhcb
    // (PR-S2, 2026-08-23): nút Google ném lỗi "Thiếu VITE_GOOGLE_CLIENT_ID" ngay khi bấm.
    envDir: repoRoot,
    resolve: {
      alias: [
        // @dhcb/<gói>/<file> -> packages/<gói>/<file> (source) — workspace thật, xem tsconfig paths
        {
          find: /^@dhcb\/(.*)$/,
          replacement: fileURLToPath(new URL('../../packages', import.meta.url)) + '/$1',
        },
        { find: '@core', replacement: coreUiDir },
      ],
    },
    server: {
      fs: {
        // Cho dev server đọc file ngoài root app: packages/ (source @dhcb) + api/ (dev middleware)
        allow: [repoRoot],
      },
    },
    plugins: [
      react(),
      apiEdgeDevMiddleware(),
      // Tự host Pyodide (Python chạy trong trình duyệt cho môn Lập trình — PR-L2):
      // copy asset từ node_modules vào dist/pyodide/ để nginx phục vụ như file tĩnh,
      // KHÔNG dùng CDN ngoài. Worker nạp qua importScripts('/pyodide/pyodide.js') và chỉ
      // tải khi học viên bấm "Chạy" lần đầu — không ảnh hưởng bundle chính.
      pyodideSelfHostPlugin(),
      // Gzip + Brotli compression cho production
      compress({
        gzip: {
          threshold: 1024, // chỉ compress file > 1KB
          deleteOriginFile: false,
        },
        brotli: {
          threshold: 1024,
          deleteOriginFile: false,
        },
      }),
      // Bundle size analyzer
      visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html',
      }),
    ],
    build: {
      // Output GIỮ NGUYÊN ở dist/ gốc repo — nginx/deploy.sh/.size-limit.json không phải đổi
      // (bất biến hạ tầng của đợt cải tổ cấu trúc, xem đặc tả S2).
      outDir: '../../dist',
      emptyOutDir: true,
      chunkSizeWarningLimit: 500,
      minify: 'esbuild',
      // Tối ưu source maps cho production (mapping lỗi)
      sourcemap: 'hidden',
      // Tree-shaking: loại bỏ code không dùng
      rollupOptions: {
        output: {
          // Chiến lược chunk thông minh: nhóm vendor theo tính năng, tránh duplicate code
          manualChunks(id) {
            // Nhóm riêng: Sentry (error tracking) — CHỈ tải khi thực sự cần (dynamic import
            // trong lib/errorTracking.ts, chỉ chạy khi có VITE_SENTRY_DSN). Tách chunk riêng
            // để KHÔNG bị gộp vào vendor-misc (đang tải eager lúc khởi động) — nếu gộp chung,
            // Sentry sẽ luôn nằm trong bundle đầu tiên dù không dùng, vượt ngân sách size-limit
            // (.size-limit.json chỉ đo index/vendor-core/vendor-supabase/vendor-ui/vendor-misc).
            if (id.includes('node_modules/@sentry')) {
              return 'vendor-sentry'
            }
            // Nhóm riêng: CodeMirror (editor môn Lập trình) — chỉ trang /lap-trinh/* dùng
            // (lazy). Nếu rơi vào vendor-misc (tải eager lúc khởi động) thì +~130KB brotli
            // vào bundle đầu → vỡ ngân sách size-limit (bài học CI 2026-08-24, PR #659).
            if (
              id.includes('node_modules/@codemirror') ||
              id.includes('node_modules/codemirror') ||
              id.includes('node_modules/@lezer') ||
              id.includes('node_modules/crelt') ||
              id.includes('node_modules/style-mod') ||
              id.includes('node_modules/w3c-keyname')
            ) {
              return 'vendor-codemirror'
            }
            // Nhóm 1: React + Router (core framework)
            if (
              id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router')
            ) {
              return 'vendor-core'
            }
            // Nhóm 2: Supabase
            if (id.includes('node_modules/@supabase')) {
              return 'vendor-supabase'
            }
            // Nhóm 3: UI library
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-ui'
            }
            // Nhóm 4: Mọi thư viện còn lại gộp chung vào 1 file "vendor-misc".
            // Trước đây tách MỖI package 1 file (vendor-libs-<tên>) → sinh ra nhiều
            // chunk tí hon (scheduler 3.8KB, remix 8KB...) = nhiều request nhỏ, hại
            // điểm Lighthouse. Các lib còn lại ở đây đều nhỏ nên gộp 1 file là tối ưu.
            if (id.includes('node_modules/')) {
              return 'vendor-misc'
            }
          },
          // Tên file chunk: [name]-[hash:8].js (hash 8 ký tự để track thay đổi).
          // Với các chunk DỮ LIỆU lazy (mỗi file JSON 1 chunk), thêm tiền tố theo
          // thư mục nguồn để 3 nguồn dictionary/patterns/lessons (đều có file tên
          // chunk-NNN.json) không sinh ra các file dist trùng tên khó debug.
          entryFileNames: 'js/[name]-[hash:8].js',
          chunkFileNames(chunkInfo) {
            const id = chunkInfo.facadeModuleId ?? ''
            if (id.includes('/data/dictionary/')) return 'js/dict-[name]-[hash:8].js'
            if (id.includes('/data/patterns/')) return 'js/pattern-[name]-[hash:8].js'
            if (id.includes('/data/lessons/')) return 'js/lesson-[name]-[hash:8].js'
            return 'js/[name]-[hash:8].js'
          },
          assetFileNames: 'assets/[name]-[hash:8][extname]',
        },
      },
    },
  }
})

// ── Dev middleware cho các Edge Function trong api/ ─────────────────────────
// api/pronunciation.ts và api/tts.ts là Vercel Edge Function thật (chỉ tự chạy khi deploy).
// Lúc "npm run dev", Vite không biết gì về thư mục api/ — plugin này gọi thẳng handler đó
// mỗi khi có request tới các route tương ứng, để test được ngay ở máy mình mà không cần
// deploy hoặc cài "vercel dev". Cùng 1 file logic dùng cho cả dev và production.
//
// Bảng ánh xạ route → file handler. Thêm endpoint mới chỉ cần thêm 1 dòng ở đây.
const API_ROUTES: { prefix: string; module: string }[] = [
  {
    prefix: '/api/pronunciation',
    module: '/apps/server/src/api/subjects/english/pronunciation.ts',
  },
  { prefix: '/api/tts', module: '/packages/core-ai/tts.ts' },
  { prefix: '/api/stt', module: '/packages/core-ai/stt.ts' },
  { prefix: '/api/agent', module: '/packages/core-ai/ai.ts' },
  { prefix: '/api/dictionary', module: '/apps/server/src/api/subjects/english/dictionary.ts' },
  { prefix: '/api/leaderboard', module: '/apps/server/src/api/platform/leaderboard.ts' },
  {
    prefix: '/api/pronounce-assess',
    module: '/apps/server/src/api/subjects/english/pronounce-assess.ts',
  },
  { prefix: '/api/auth', module: '/packages/core-auth/auth.ts' },
  { prefix: '/api/profile', module: '/apps/server/src/api/core/profile.ts' },
  { prefix: '/api/progress', module: '/apps/server/src/api/core/progress.ts' },
  { prefix: '/api/history', module: '/apps/server/src/api/core/history.ts' },
  { prefix: '/api/challenge', module: '/apps/server/src/api/subjects/english/challenge.ts' },
  {
    prefix: '/api/tutor-feedback',
    module: '/apps/server/src/api/subjects/english/tutor-feedback.ts',
  },
  { prefix: '/api/admin-settings', module: '/apps/server/src/api/admin/admin-settings.ts' },
  { prefix: '/api/app-settings', module: '/apps/server/src/api/platform/app-settings.ts' },
  {
    prefix: '/api/avatar-visemes',
    module: '/apps/server/src/api/subjects/english/avatar-visemes.ts',
  },
  { prefix: '/api/companion', module: '/apps/server/src/api/personal/companion.ts' },
]

function apiEdgeDevMiddleware(): Plugin {
  return {
    name: 'api-edge-dev-middleware',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(
        async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          const route = req.url ? API_ROUTES.find((r) => req.url!.startsWith(r.prefix)) : undefined
          if (!route) {
            next()
            return
          }

          try {
            // Đọc body cho các method có payload (POST) — /api/tts nhận JSON body.
            const body = await readRequestBody(req)

            // ssrLoadModule: để Vite tự biên dịch TypeScript + import nội bộ (./_lib/...)
            // bằng đúng pipeline thật, không phải viết/duy trì 2 bản logic khác nhau.
            // Handler nằm NGOÀI root Vite (api/, packages/ ở gốc repo) — nạp qua /@fs/<đường tuyệt đối>
            const mod = (await server.ssrLoadModule(
              '/@fs' + repoRoot.replace(/\/$/, '') + route.module,
            )) as {
              default: (request: Request) => Promise<Response>
            }
            const request = new Request(new URL(req.url!, 'http://localhost'), {
              method: req.method,
              headers: {
                'content-type': req.headers['content-type'] ?? 'application/json',
                // /api/tts cần header này để biết user đã đăng nhập chưa (trả khoá giải mã hay không)
                ...(req.headers['authorization']
                  ? { authorization: req.headers['authorization'] as string }
                  : {}),
              },
              // GET/HEAD không được có body trong Fetch API
              body: req.method && req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined,
            })
            const response = await mod.default(request)

            res.statusCode = response.status
            response.headers.forEach((value, key) => res.setHeader(key, value))
            res.end(await response.text())
          } catch (err) {
            res.statusCode = 500
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify({ error: (err as Error).message }))
          }
        },
      )
    },
  }
}

// Gom toàn bộ body của request thành chuỗi (dùng cho POST /api/tts khi chạy dev).
function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk: Buffer) => {
      data += chunk.toString()
    })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}
