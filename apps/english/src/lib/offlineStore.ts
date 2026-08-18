// apps/english/src/lib/offlineStore.ts — PWA Offline Store & Auto-Sync Engine.

export interface OfflineAction {
  id: string
  kind: 'srs_review' | 'habit_checkin'
  payload: Record<string, unknown>
  createdAt: string
  retryCount: number
}

const STORAGE_KEY = 'donghanh_offline_queue'

/**
 * Reads pending offline actions from localStorage.
 */
export function getPendingOfflineActions(): OfflineAction[] {
  if (typeof window === 'undefined' || !window.localStorage) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Enqueues a new action for background offline sync.
 */
export function enqueueOfflineAction(
  action: Omit<OfflineAction, 'id' | 'createdAt' | 'retryCount'>,
): OfflineAction {
  const fullAction: OfflineAction = {
    ...action,
    id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    const queue = getPendingOfflineActions()
    queue.push(fullAction)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
  }

  return fullAction
}

/**
 * Clears an action from queue by id.
 */
export function removeOfflineAction(id: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  const queue = getPendingOfflineActions().filter((a) => a.id !== id)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
}

/**
 * Flushes all pending actions when connection is restored.
 */
export async function flushOfflineQueue(
  syncHandler: (action: OfflineAction) => Promise<boolean>,
): Promise<{ flushed: number; remaining: number }> {
  const queue = getPendingOfflineActions()
  let flushed = 0

  for (const action of queue) {
    try {
      const ok = await syncHandler(action)
      if (ok) {
        removeOfflineAction(action.id)
        flushed++
      }
    } catch {
      // Keep in queue for next flush attempt
    }
  }

  return { flushed, remaining: getPendingOfflineActions().length }
}
