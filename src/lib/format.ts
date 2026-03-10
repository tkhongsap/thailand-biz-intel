/**
 * Format a number with Thai Baht suffix (M/B)
 */
export function formatBaht(value: number): string {
  if (value >= 1_000_000_000) {
    return `฿${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `฿${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `฿${(value / 1_000).toFixed(0)}K`;
  }
  return `฿${value.toFixed(0)}`;
}

/**
 * Format a number with commas
 */
export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

/**
 * Format a percentage
 */
export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

/**
 * Format month string (202501) to display (Jan 2025)
 */
export function formatMonth(ym: string): string {
  const year = ym.slice(0, 4);
  const month = parseInt(ym.slice(4, 6), 10);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[month - 1]} ${year}`;
}
