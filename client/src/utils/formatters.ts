/**
 * Format a number as a currency string
 */
export function formatCurrency(value: number): string {
  if (isNaN(value)) return "$0.00";
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Format a number as a percentage
 */
export function formatPercent(value: number): string {
  if (isNaN(value)) return "0.00%";
  
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format a large number with appropriate suffixes (K, M, B, T)
 */
export function formatNumber(value: number): string {
  if (isNaN(value)) return "0";
  
  if (value >= 1000000000000) {
    return `${(value / 1000000000000).toFixed(2)}T`;
  }
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(2)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  return value.toFixed(0);
}

/**
 * Format a date as a localized string
 */
export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format a value based on its type (number or special value like percentage)
 */
export function formatValue(value: number): string {
  if (isNaN(value)) return "0";
  
  // Assume values below 100 with decimal points might be percentages
  if (value < 100 && value % 1 !== 0) {
    return `${value.toFixed(2)}%`;
  }
  
  // If it seems like a stock price, format as currency
  if (value > 0 && value < 100000) {
    return formatCurrency(value);
  }
  
  // Otherwise format as a number
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}
