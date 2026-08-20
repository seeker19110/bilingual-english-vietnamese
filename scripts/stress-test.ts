// scripts/stress-test.ts — Bộ công cụ Stress Test & Đánh giá Tải Hiệu Năng Tối Đa
// Sử dụng worker / concurrent fetch để đo lường p50, p95, p99 latency, req/s và tỷ lệ lỗi.
//
// Cách chạy:
//   npx tsx scripts/stress-test.ts [baseUrl]
// Mặc định: http://localhost:3000 (hoặc PORT trong .env)

interface ScenarioResult {
  name: string
  totalRequests: number
  successCount: number
  errorCount: number
  durationMs: number
  reqPerSec: number
  p50Ms: number
  p95Ms: number
  p99Ms: number
  minMs: number
  maxMs: number
}

async function runScenario(
  name: string,
  url: string,
  options: {
    method: 'GET' | 'POST'
    body?: string
    headers?: Record<string, string>
    concurrency: number
    durationSeconds: number
  },
): Promise<ScenarioResult> {
  console.log(`\n🚀 [Stress Test] Bắt đầu kịch bản: ${name}`)
  console.log(
    `   URL: ${url} | Concurrency: ${options.concurrency} | Thời lượng: ${options.durationSeconds}s`,
  )

  const latencies: number[] = []
  let successCount = 0
  let errorCount = 0
  const startTime = Date.now()
  const endTime = startTime + options.durationSeconds * 1000

  async function worker() {
    while (Date.now() < endTime) {
      const reqStart = performance.now()
      try {
        const res = await fetch(url, {
          method: options.method,
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
          },
          body: options.body,
        })
        const reqEnd = performance.now()
        latencies.push(reqEnd - reqStart)
        if (res.status < 500) {
          successCount++
        } else {
          errorCount++
        }
      } catch {
        const reqEnd = performance.now()
        latencies.push(reqEnd - reqStart)
        errorCount++
      }
    }
  }

  // Chạy đồng thời N workers
  const workers = Array.from({ length: options.concurrency }, () => worker())
  await Promise.all(workers)

  const actualDuration = (Date.now() - startTime) / 1000
  latencies.sort((a, b) => a - b)

  const totalRequests = latencies.length
  const p50 = latencies[Math.floor(totalRequests * 0.5)] || 0
  const p95 = latencies[Math.floor(totalRequests * 0.95)] || 0
  const p99 = latencies[Math.floor(totalRequests * 0.99)] || 0
  const min = latencies[0] || 0
  const max = latencies[totalRequests - 1] || 0
  const reqPerSec = totalRequests / actualDuration

  return {
    name,
    totalRequests,
    successCount,
    errorCount,
    durationMs: actualDuration * 1000,
    reqPerSec: Math.round(reqPerSec * 10) / 10,
    p50Ms: Math.round(p50 * 10) / 10,
    p95Ms: Math.round(p95 * 10) / 10,
    p99Ms: Math.round(p99 * 10) / 10,
    minMs: Math.round(min * 10) / 10,
    maxMs: Math.round(max * 10) / 10,
  }
}

export async function runAllStressTests(
  baseUrl = 'http://localhost:3000',
): Promise<ScenarioResult[]> {
  console.log(`\n===============================================================`)
  console.log(`🎯 ĐỒNG HÀNH PLATFORM STRESS TEST SUITE`)
  console.log(`   Target Base URL: ${baseUrl}`)
  console.log(`===============================================================`)

  const results: ScenarioResult[] = []

  // Kịch bản 1: STEM Question Bank Filter (Read Heavy)
  const sc1 = await runScenario(
    '1. STEM Question Bank Query',
    `${baseUrl}/api/stem-scratchpad?action=get_questions&subject=math&grade=12`,
    {
      method: 'GET',
      concurrency: 50,
      durationSeconds: 5,
    },
  )
  results.push(sc1)

  // Kịch bản 2: STEM Scratchpad Step Validation (Logic Compute)
  const sc2 = await runScenario(
    '2. STEM Step Validator Logic',
    `${baseUrl}/api/stem-scratchpad?action=validate_step`,
    {
      method: 'POST',
      body: JSON.stringify({
        latexInput: '2x = 10',
        explanation: 'Chia cả hai vế cho 2',
      }),
      concurrency: 40,
      durationSeconds: 5,
    },
  )
  results.push(sc2)

  // Kịch bản 3: Active Audio Co-learning Rooms Query
  const sc3 = await runScenario(
    '3. Audio Co-learning List Rooms',
    `${baseUrl}/api/co-learning-audio`,
    {
      method: 'GET',
      concurrency: 50,
      durationSeconds: 5,
    },
  )
  results.push(sc3)

  // Kịch bản 4: PvP Arena Leaderboard & Stats
  const sc4 = await runScenario(
    '4. PvP Arena Matchmaking Query',
    `${baseUrl}/api/pvp-arena?action=lobby_state`,
    {
      method: 'GET',
      concurrency: 50,
      durationSeconds: 5,
    },
  )
  results.push(sc4)

  // In bảng tổng kết
  console.log(`\n===============================================================`)
  console.log(`📊 BÁO CÁO KẾT QUẢ STRESS TEST`)
  console.log(`===============================================================`)
  console.table(
    results.map((r) => ({
      'Kịch bản': r.name,
      'Tổng Requests': r.totalRequests,
      'Req/sec': r.reqPerSec,
      'p50 (ms)': r.p50Ms,
      'p95 (ms)': r.p95Ms,
      'p99 (ms)': r.p99Ms,
      'Tỷ lệ lỗi': `${((r.errorCount / (r.totalRequests || 1)) * 100).toFixed(1)}%`,
    })),
  )

  return results
}

// Chạy trực tiếp nếu execute từ CLI
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('stress-test.ts')
) {
  const target = process.argv[2] || process.env.STRESS_TARGET_URL || 'http://localhost:3000'
  runAllStressTests(target).catch(console.error)
}
