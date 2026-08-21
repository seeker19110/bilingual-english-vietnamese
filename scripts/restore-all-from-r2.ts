// scripts/restore-all-from-r2.ts — Gộp cả 3 lệnh khôi phục (Postgres, .env, cấu hình hệ thống)
// thành 1 lệnh duy nhất khi cần dựng lại VPS từ đầu. KHÔNG viết lại logic — chỉ gọi tuần tự 3
// script đã có (restore-pg-from-r2.ts, restore-env-from-r2.ts, restore-system-from-r2.ts) bằng
// child_process, để mỗi script vẫn chạy độc lập được như cũ (không phá cách dùng hiện tại).
//
// AN TOÀN: mặc định CHỈ TẢI VỀ (Postgres ở chế độ --download, không đụng database nào). Phần
// PHÁ HUỶ DỮ LIỆU (DROP + tạo lại database Postgres) chỉ chạy khi truyền RÕ RÀNG cả
// --restore-into <ten_database> LẪN --yes — giống hệt điều kiện của restore-pg-from-r2.ts gốc.
//
// Cách dùng:
//   ENV_BACKUP_PASSPHRASE="..." npm run restore:all
//     Tải về: .env.restored, system-restored.tar.gz, và bản Postgres mới nhất (file .sql.gz vào
//     thư mục hiện tại) — KHÔNG ghi đè gì, tự kiểm tra rồi khôi phục từng phần theo nhu cầu thật.
//
//   ENV_BACKUP_PASSPHRASE="..." npm run restore:all -- --restore-into dhcb --yes
//     Giống trên, NHƯNG THÊM bước DROP + TẠO LẠI + khôi phục thật database Postgres đích (cần
//     RESTORE_PSQL_URL trong .env — xem restore-pg-from-r2.ts). Dùng khi chắc chắn muốn ghi đè.
//
// Biến môi trường: giống 3 script gốc cộng lại (R2_*, ENV_BACKUP_PASSPHRASE, RESTORE_PSQL_URL
// nếu dùng --restore-into).

import { execFileSync } from 'node:child_process'

function fail(message: string): never {
  console.error(`[restore:all] ❌ ${message}`)
  process.exit(1)
}

function getArg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i !== -1 ? process.argv[i + 1] : undefined
}
function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`)
}

function runScript(label: string, scriptPath: string, args: string[]): void {
  console.log(`\n[restore:all] ── ${label} ──────────────────────────────`)
  execFileSync('npx', ['tsx', scriptPath, ...args], { stdio: 'inherit', env: process.env })
}

function main(): void {
  if (!process.env.ENV_BACKUP_PASSPHRASE) {
    fail(
      'Thiếu ENV_BACKUP_PASSPHRASE — cần cho cả restore:env lẫn restore:system, truyền qua biến ' +
        'môi trường lúc chạy lệnh (không đặt trong .env).',
    )
  }

  const restoreInto = getArg('restore-into')
  const yes = hasFlag('yes')
  if (restoreInto && !yes) {
    fail('Có --restore-into nhưng thiếu --yes — xem cảnh báo trong restore-pg-from-r2.ts.')
  }

  runScript('1/3 · .env', 'scripts/restore-env-from-r2.ts', [])
  runScript('2/3 · Cấu hình hệ thống (Nginx+crontab+PM2)', 'scripts/restore-system-from-r2.ts', [])

  if (restoreInto) {
    runScript(
      '3/3 · Postgres — KHÔI PHỤC THẬT vào database đích',
      'scripts/restore-pg-from-r2.ts',
      ['--restore-into', restoreInto, '--yes'],
    )
  } else {
    runScript(
      '3/3 · Postgres (chỉ tải về, không đụng database nào)',
      'scripts/restore-pg-from-r2.ts',
      ['--download'],
    )
  }

  console.log(
    '\n[restore:all] ✅ Hoàn tất. Đã tải về: .env.restored, system-restored.tar.gz' +
      (restoreInto
        ? `, và khôi phục THẬT vào database "${restoreInto}".`
        : ', và 1 bản .sql.gz Postgres mới nhất.') +
      '\n[restore:all] Các bước còn lại (KHÔNG tự động — tự kiểm tra trước khi làm):\n' +
      '  - So sánh .env.restored với .env hiện tại rồi mới đổi tên đè lên .env\n' +
      '  - Giải nén system-restored.tar.gz ra thư mục tạm, cp từng phần cần thiết (nginx/crontab/pm2)\n' +
      (restoreInto
        ? ''
        : '  - Nếu cần khôi phục thật Postgres: chạy lại kèm --restore-into <ten_database> --yes\n'),
  )
}

main()
