const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatCurrency(value: number | string | null | undefined): string {
  return currencyFormatter.format(Number(value ?? 0))
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return 'N/A'
  }

  return dateFormatter.format(new Date(value))
}

export function formatRating(value: number | null | undefined): string {
  return (value ?? 0).toFixed(1)
}

export function ratingStars(value: number | null | undefined): number[] {
  const count = Math.round(value ?? 0)
  return Array.from({ length: 5 }, (_, index) => index < count ? 1 : 0)
}
