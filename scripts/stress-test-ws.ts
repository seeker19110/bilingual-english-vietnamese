// scripts/stress-test-ws.ts — Bộ kiểm thử tải đồng thời WebSocket Connections Storm
// Kiểm tra khả năng mở đồng thời nhiều kết nối WebSocket, gửi nhận audio chunks và đo độ trễ relay.
import { WebSocket } from 'ws'

export async function runWebSocketStressTest(
  wsBaseUrl = 'ws://localhost:3000',
  concurrentClients = 30,
  testDurationSeconds = 5,
) {
  console.log(`\n===============================================================`)
  console.log(`⚡ WEBSOCKET STRESS TEST — CO-LEARNING & VOICE RELAY`)
  console.log(`   Target: ${wsBaseUrl}/ws/co-learning-room`)
  console.log(`   Concurrent Clients: ${concurrentClients} | Duration: ${testDurationSeconds}s`)
  console.log(`===============================================================`)

  const latencies: number[] = []
  let connectedCount = 0
  let failedCount = 0
  let messagesSent = 0
  let messagesReceived = 0

  const clients: WebSocket[] = []

  const testEndTime = Date.now() + testDurationSeconds * 1000

  const clientPromises = Array.from({ length: concurrentClients }, (_, i) => {
    return new Promise<void>((resolve) => {
      try {
        const ws = new WebSocket(`${wsBaseUrl}/ws/co-learning-room`, {
          headers: {
            cookie: `gsa_session_v1=stress-test-user-${i}`,
          },
        })
        clients.push(ws)

        ws.on('open', () => {
          connectedCount++
          // Gửi join_room
          ws.send(
            JSON.stringify({
              type: 'join_room',
              roomId: 'stress-test-room-1',
              displayName: `Client_${i}`,
            }),
          )

          // Vòng lặp gửi audio chunks
          const interval = setInterval(() => {
            if (Date.now() >= testEndTime || ws.readyState !== WebSocket.OPEN) {
              clearInterval(interval)
              resolve()
              return
            }

            const sendTime = performance.now()
            ws.send(
              JSON.stringify({
                type: 'audio_chunk',
                roomId: 'stress-test-room-1',
                audioBase64: 'AAAAAAAAAAAAAAAA',
                audioLevel: 0.1,
              }),
            )
            messagesSent++
            latencies.push(performance.now() - sendTime)
          }, 100) // 10 chunks/sec/client
        })

        ws.on('message', () => {
          messagesReceived++
        })

        ws.on('error', () => {
          failedCount++
          resolve()
        })

        ws.on('close', () => {
          resolve()
        })
      } catch {
        failedCount++
        resolve()
      }
    })
  })

  await Promise.all(clientPromises)

  // Cleanup all sockets
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close()
    }
  }

  latencies.sort((a, b) => a - b)
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0

  console.log(`\n📊 KẾT QUẢ WEBSOCKET STRESS TEST:`)
  console.log(`   - Kết nối thành công : ${connectedCount}/${concurrentClients}`)
  console.log(`   - Kết nối thất bại    : ${failedCount}`)
  console.log(`   - Tin nhắn đã gửi    : ${messagesSent}`)
  console.log(`   - Tin nhắn đã nhận   : ${messagesReceived}`)
  console.log(`   - Client Latency p50 : ${p50.toFixed(2)} ms`)
  console.log(`   - Client Latency p95 : ${p95.toFixed(2)} ms`)
  console.log(`===============================================================\n`)
}

// Chạy trực tiếp nếu execute từ CLI
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('stress-test-ws.ts')
) {
  const target = process.argv[2] || 'ws://localhost:3000'
  runWebSocketStressTest(target).catch(console.error)
}
