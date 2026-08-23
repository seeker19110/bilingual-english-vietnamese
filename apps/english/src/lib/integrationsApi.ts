// apps/english/src/lib/integrationsApi.ts — Client API for Google Calendar & Notion Integrations.
import type {
  IntegrationSyncRequest,
  IntegrationSyncResponse,
} from '@dhcb/core-contracts/integrations'

export async function fetchIntegrations(): Promise<{
  integrations: Array<{ provider: string; name: string; status: string }>
}> {
  const resp = await fetch('/api/integrations')
  if (!resp.ok) {
    throw new Error('Lỗi tải danh sách tích hợp ngoài')
  }
  return resp.json()
}

export async function executeIntegrationSync(
  request: IntegrationSyncRequest,
): Promise<IntegrationSyncResponse> {
  const resp = await fetch('/api/integrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}))
    throw new Error(data.error || `Lỗi đồng bộ ứng dụng (${resp.status})`)
  }

  return resp.json()
}
