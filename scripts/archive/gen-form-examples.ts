// scripts/gen-form-examples.ts
// Sinh public/data/form-examples.json từ NGUỒN src/data/form-examples.ts.
// Đồng thời KIỂM TRA hợp lệ: mỗi khoá `word|formKey` phải trỏ tới một TỪ GỐC có
// thật trong từ điển VÀ có sẵn dạng đó (forms[formKey]) — nếu không, chip dạng từ sẽ
// không hiển thị nên ví dụ cũng vô ích. Script cảnh báo (không tự sửa) để soát tay.
//
// Chạy: npm run gen:form-examples   (an toàn để chạy lại — ghi đè)

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FORM_EXAMPLES } from '../../apps/dhcb/src/data/form-examples.ts'
import type { DictEntry, WordForms } from '../../apps/dhcb/src/types.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DICT_DIR = path.join(ROOT, 'apps/dhcb/public/data/dictionary')
const OUT = path.join(ROOT, 'apps/dhcb/public/data/form-examples.json')

const FORM_KEYS: (keyof WordForms)[] = [
  'plural',
  'v3s',
  'ving',
  'past',
  'pastPart',
  'comparative',
  'superlative',
]

// Nạp toàn bộ từ điển → gom mọi entry theo từ (một từ có thể có nhiều loại từ).
const byWord = new Map<string, DictEntry[]>()
for (let i = 0; i < 10; i++) {
  const f = path.join(DICT_DIR, `chunk-${String(i).padStart(3, '0')}.json`)
  const chunk = JSON.parse(fs.readFileSync(f, 'utf8')) as DictEntry[]
  for (const e of chunk) {
    const k = e.word.trim().toLowerCase()
    const arr = byWord.get(k)
    if (arr) arr.push(e)
    else byWord.set(k, [e])
  }
}

// Kiểm tra từng khoá + đếm ví dụ.
const warnings: string[] = []
let slots = 0
let examples = 0
for (const [key, pair] of Object.entries(FORM_EXAMPLES)) {
  slots++
  examples += pair.length
  const [word, formKey] = key.split('|')
  if (!word || !formKey) {
    warnings.push(`Khoá sai định dạng "word|formKey": "${key}"`)
    continue
  }
  if (!FORM_KEYS.includes(formKey as keyof WordForms)) {
    warnings.push(
      `formKey không hợp lệ trong khoá "${key}" (phải là một trong ${FORM_KEYS.join(', ')})`,
    )
    continue
  }
  for (const ex of pair) {
    if (!ex.en.trim() || !ex.vi.trim()) warnings.push(`Ví dụ rỗng ở khoá "${key}"`)
  }
  const entries = byWord.get(word.toLowerCase())
  if (!entries) {
    warnings.push(`Không tìm thấy từ gốc "${word}" trong từ điển (khoá "${key}")`)
    continue
  }
  // Có ít nhất một entry của từ này chứa dạng formKey?
  const hasForm = entries.some((e) => {
    const v = e.forms?.[formKey as keyof WordForms]
    return typeof v === 'string' && v.length > 0
  })
  if (!hasForm) {
    warnings.push(
      `Từ "${word}" không có dạng "${formKey}" trong từ điển → chip sẽ không hiện (khoá "${key}")`,
    )
  }
}

if (warnings.length) {
  console.warn(`\n⚠️  ${warnings.length} cảnh báo:`)
  for (const w of warnings) console.warn('   - ' + w)
  console.warn('')
}

fs.writeFileSync(OUT, JSON.stringify(FORM_EXAMPLES))
console.log(
  `[gen-form-examples] ${slots} ô dạng từ, ${examples} ví dụ → ${path.relative(ROOT, OUT)}`,
)
