// apps/english/src/lib/chatFormatters.ts — Các hàm tiện ích định dạng ngày giờ và màu sắc cho Chat UI.

export function formatChatPreviewTime(isoString: string | undefined): string {
  if (!isoString) return ''
  try {
    const msgDate = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - msgDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins}p`

    const isToday =
      msgDate.getDate() === now.getDate() &&
      msgDate.getMonth() === now.getMonth() &&
      msgDate.getFullYear() === now.getFullYear()

    if (isToday) {
      const h = msgDate.getHours().toString().padStart(2, '0')
      const m = msgDate.getMinutes().toString().padStart(2, '0')
      return `${h}:${m}`
    }

    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday =
      msgDate.getDate() === yesterday.getDate() &&
      msgDate.getMonth() === yesterday.getMonth() &&
      msgDate.getFullYear() === yesterday.getFullYear()

    if (isYesterday) return 'Hôm qua'

    const d = msgDate.getDate().toString().padStart(2, '0')
    const mo = (msgDate.getMonth() + 1).toString().padStart(2, '0')
    return `${d}/${mo}`
  } catch {
    return ''
  }
}

export function formatMessageTime(isoString: string): string {
  try {
    const d = new Date(isoString)
    const hours = d.getHours().toString().padStart(2, '0')
    const mins = d.getMinutes().toString().padStart(2, '0')
    return `${hours}:${mins}`
  } catch {
    return ''
  }
}

export function getAvatarColor(name = 'User'): string {
  const colors = [
    'bg-blue-600',
    'bg-emerald-600',
    'bg-purple-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-indigo-600',
    'bg-cyan-600',
    'bg-teal-600',
  ]
  const safeName = name || 'User'
  let hash = 0
  for (let i = 0; i < safeName.length; i++) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length] ?? 'bg-blue-600'
}
