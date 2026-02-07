export const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''
const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN || ''

export function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  }
  if (HF_TOKEN) {
    headers['Authorization'] = `Bearer ${HF_TOKEN}`
  }
  return fetch(url, { ...options, headers })
}
