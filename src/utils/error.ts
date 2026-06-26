import axios from 'axios'

type LaravelErrorResponse = {
  message?: string
  errors?: Record<string, string[] | string>
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as LaravelErrorResponse | undefined

    if (payload?.errors) {
      const firstError = Object.values(payload.errors)
        .flatMap((item) => (Array.isArray(item) ? item : [item]))
        .find(Boolean)

      if (firstError) {
        return String(firstError)
      }
    }

    if (payload?.message) {
      return payload.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
