export function formatCurrency(n: number): string {
  return 'Rs.' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export function formatDateTime(d: string): string {
  return new Date(d).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
