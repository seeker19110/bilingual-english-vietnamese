// src/components/FirstTaskCard.tsx — Việc đầu tiên người dùng chọn ở luồng người mới.
//
// Vì sao thẻ này tồn tại: chỉ số quan trọng nhất của cả luồng /bat-dau là "có bao nhiêu người LÀM
// XONG việc đầu tiên trong 7 ngày" (đặc tả mục 10). Không có chỗ để đánh dấu xong thì chỉ số đó
// vĩnh viễn bằng 0 — tức là đo được đúng con số 0 và tưởng gợi ý dở.
//
// Thẻ tự ẩn khi: chưa qua luồng người mới · chưa chọn việc nào · hoặc đã đánh dấu xong. Nó KHÔNG
// nhắc lại, không đếm ngày còn lại, không hiện tiến độ — đúng tinh thần "mời, không ép" (Luật 8
// của tư thế đồng hành: không lấy thời gian của người dùng làm chỉ số thành công).

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { fetchIntake, markTaskDone, type Suggestion } from '../lib/intakeApi'
import { Button } from '@core/Button'

export default function FirstTaskCard() {
  const [task, setTask] = useState<Suggestion | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    void fetchIntake().then((r) => {
      if (cancelled || !r.ok) return
      const { done, chosenTaskId, taskDone, result } = r.data
      if (!done || !chosenTaskId || taskDone || !result) return
      const all = [result.primary, ...result.alternatives]
      setTask(all.find((s) => s.id === chosenTaskId) ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!task) return null

  async function handleDone() {
    setSaving(true)
    await markTaskDone()
    setTask(null)
  }

  return (
    <section className="rounded-2xl border border-accent-500/30 bg-accent-500/10 p-4 animate-fade-in">
      <h2 className="text-xs text-zinc-300 mb-1">Việc bạn chọn để bắt đầu</h2>
      <p className="text-sm font-semibold text-white">{task.title}</p>
      <Button
        onClick={() => void handleDone()}
        loading={saving}
        loadingLabel="Đang lưu"
        fullWidth
        className="mt-3"
      >
        {!saving && <Check className="w-4 h-4" />}
        Mình làm xong rồi
      </Button>
    </section>
  )
}
