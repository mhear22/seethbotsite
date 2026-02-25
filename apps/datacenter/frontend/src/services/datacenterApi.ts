import type {
  DataCenterRunRecord,
  DataCenterRunSnapshot,
  LocationId,
  RunPersistenceStatus
} from '../types/game'

const API_BASE = '/api/datacenter/runs'
const TOKEN_KEY = 'auth_token'

interface CreateRunPayload {
  name: string
  location: LocationId
  state_json: DataCenterRunSnapshot
  status: RunPersistenceStatus
}

interface SaveRunPayload {
  name?: string
  location?: LocationId
  state_json?: DataCenterRunSnapshot
  status?: RunPersistenceStatus
  last_played_at?: string
}

async function request<T>(
  path: string,
  token: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(init.headers || {})
    }
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const payload = await response.json()
      message = payload?.message || payload?.error || message
    } catch {
      // no-op
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export async function validateSessionToken(token: string): Promise<boolean> {
  const response = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  return response.ok
}

export async function listRuns(token: string): Promise<DataCenterRunRecord[]> {
  const data = await request<{ runs: DataCenterRunRecord[] }>('', token)
  return data.runs
}

export async function createRun(token: string, payload: CreateRunPayload): Promise<DataCenterRunRecord> {
  const data = await request<{ run: DataCenterRunRecord }>('', token, {
    method: 'POST',
    body: JSON.stringify(payload)
  })

  return data.run
}

export async function loadRun(token: string, id: number): Promise<DataCenterRunRecord> {
  const data = await request<{ run: DataCenterRunRecord }>(`/${id}`, token)
  return data.run
}

export async function saveRun(token: string, id: number, payload: SaveRunPayload): Promise<DataCenterRunRecord> {
  const data = await request<{ run: DataCenterRunRecord }>(`/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })

  return data.run
}

export async function deleteRun(token: string, id: number): Promise<void> {
  await request<void>(`/${id}`, token, { method: 'DELETE' })
}
