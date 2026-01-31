import { API_BASE } from '@/shared/constants/api'
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
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      if (!response.ok) {
        return err(new Error(`API Error: ${response.status}`))
      }

      const data = await response.json()
      return ok(data)
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}
