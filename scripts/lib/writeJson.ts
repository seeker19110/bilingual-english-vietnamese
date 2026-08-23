// scripts/lib/writeJson.ts — Ghi file JSON SINH TỰ ĐỘNG đúng định dạng Prettier của dự án.
//
// VÌ SAO CẦN (audit luồng dữ liệu 2026-08-12): các script sinh dữ liệu trước đây ghi bằng
// `JSON.stringify(out)` — tức JSON nén một dòng. Nhưng file đích nằm trong `apps/dhcb/src/data/`
// nên Prettier (qua lint-staged lúc commit) format lại thành nhiều dòng. Hệ quả: chạy lại script
// làm `git diff` hiện ~44.000 dòng thay đổi THUẦN ĐỊNH DẠNG, và một thay đổi DỮ LIỆU thật sẽ lẫn
// mất trong đó — không ai soát nổi. Ghi thẳng ra đúng định dạng Prettier thì chạy lại script mà
// dữ liệu không đổi sẽ cho diff RỖNG, còn diff khác rỗng nghĩa là dữ liệu nguồn đã thật sự đổi.
//
// LƯU Ý: chỉ dùng cho file Prettier có quản. Các file trong `public/data/` bị `.prettierignore`
// loại trừ CÓ CHỦ Ý (tài sản client tải về lúc chạy — nén cho nhẹ), những script ghi vào đó phải
// tiếp tục dùng `JSON.stringify()` nén như cũ.
import * as fs from 'node:fs'
import { format, resolveConfig } from 'prettier'

export async function writeJsonPretty(filePath: string, data: unknown): Promise<void> {
  const config = await resolveConfig(filePath)
  const formatted = await format(JSON.stringify(data), { ...config, filepath: filePath })
  fs.writeFileSync(filePath, formatted)
}
