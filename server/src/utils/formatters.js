/**
 * India-First formatting utilities
 */

export function formatINR(value) {
  const num = Number(value);
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

export function formatPercentage(value) {
  const num = Number(value);
  if (isNaN(num)) return '0.0%';
  return `${(num * 100).toFixed(1)}%`;
}

export function formatIndianDenomination(amount) {
  const num = Math.abs(Number(amount));
  if (isNaN(num)) return '₹0';

  const sign = Number(amount) < 0 ? '-' : '';

  if (num >= 10000000) {
    // 1 Crore = 10,000,000
    return `${sign}₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    // 1 Lakh = 100,000
    return `${sign}₹${(num / 100000).toFixed(2)} Lakh`;
  } else if (num >= 1000) {
    // Thousands
    return `${sign}₹${(num / 1000).toFixed(1)}k`;
  }
  return formatINR(amount);
}

export function formatTimestampIST(timestamp = new Date()) {
  const date = new Date(timestamp);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'medium'
  });
}
