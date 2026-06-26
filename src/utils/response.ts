import type { ApiListResult, PaginationMeta } from '@/types'

function normalizeMeta(meta: unknown): PaginationMeta | undefined {
  if (!meta || typeof meta !== 'object') {
    return undefined
  }

  const source = meta as Record<string, unknown>

  if (
    typeof source.current_page !== 'number' ||
    typeof source.last_page !== 'number' ||
    typeof source.total !== 'number'
  ) {
    return undefined
  }

  return {
    current_page: source.current_page,
    last_page: source.last_page,
    per_page: typeof source.per_page === 'number' ? source.per_page : undefined,
    total: source.total,
  }
}

export function extractItem<T>(payload: unknown): T {
  const source = payload as Record<string, unknown> | null

  if (source && typeof source === 'object') {
    if (source.data && typeof source.data === 'object' && !Array.isArray(source.data)) {
      return source.data as T
    }

    if (source.user && typeof source.user === 'object') {
      return source.user as T
    }
  }

  return payload as T
}

export function extractList<T>(payload: unknown): ApiListResult<T> {
  if (Array.isArray(payload)) {
    return { items: payload as T[] }
  }

  const source = payload as Record<string, unknown> | null

  if (!source || typeof source !== 'object') {
    return { items: [] }
  }

  if (Array.isArray(source.data)) {
    return {
      items: source.data as T[],
      meta: normalizeMeta(source.meta),
    }
  }

  if (source.data && typeof source.data === 'object') {
    const nested = source.data as Record<string, unknown>

    if (Array.isArray(nested.data)) {
      return {
        items: nested.data as T[],
        meta: normalizeMeta(nested.meta) ?? normalizeMeta(source.meta),
      }
    }

    if (Array.isArray(nested.items)) {
      return {
        items: nested.items as T[],
        meta: normalizeMeta(nested.meta) ?? normalizeMeta(source.meta),
      }
    }
  }

  if (Array.isArray(source.items)) {
    return {
      items: source.items as T[],
      meta: normalizeMeta(source.meta),
    }
  }

  return { items: [] }
}
