import { getPgPool } from '../packages/core-db/pgPool.js'
import { backfillCurrentLearningGoal } from '../packages/core-learner/learningGoalAdapter.js'

async function run() {
  const pool = getPgPool()
  console.log('Bắt đầu backfill Life Goals từ Learning Goals (public.profiles)...')

  try {
    const { rows } = await pool.query<{ id: string }>(
      `SELECT id FROM public.profiles 
       WHERE onboarded = true 
         AND goal IS NOT NULL 
         AND daily_minutes IS NOT NULL 
         AND daily_minutes > 0`,
    )

    console.log(`Tìm thấy ${rows.length} users đủ điều kiện backfill.`)

    let successCount = 0
    let errorCount = 0

    // Batching to avoid overwhelming the DB
    const batchSize = 50
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize)
      console.log(
        `Đang xử lý batch ${Math.floor(i / batchSize) + 1} / ${Math.ceil(rows.length / batchSize)}...`,
      )

      await Promise.all(
        batch.map(async (row) => {
          try {
            await backfillCurrentLearningGoal(pool, row.id)
            successCount++
          } catch (err) {
            console.error(`Lỗi backfill cho user ${row.id}:`, err)
            errorCount++
          }
        }),
      )
    }

    console.log(`\nHoàn tất backfill!`)
    console.log(`- Thành công: ${successCount}`)
    console.log(`- Thất bại: ${errorCount}`)
  } catch (error) {
    console.error('Lỗi khi truy vấn DB:', error)
  } finally {
    // Đóng pool sau khi script chạy xong để process exit được
    await pool.end()
  }
}

run().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
