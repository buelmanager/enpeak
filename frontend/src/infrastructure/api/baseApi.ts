import { API_BASE, apiFetch } from '@/shared/constants/api'
import { Result, ok, err } from '@/shared/types/Result'

export class BaseApi {
  protected baseUrl: string

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl
  }

  protected async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<Result<T>> {
    try {
      const response = await apiFetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`
        try {
          const errorBody = await response.json()
          if (errorBody.detail) errorMessage += ` - ${errorBody.detail}`
          else if (errorBody.message) errorMessage += ` - ${errorBody.message}`
        } catch {
          // Response body not parseable
        }
        return err(new Error(errorMessage))
      }

      const data = await response.json()
      return ok(data)
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}
