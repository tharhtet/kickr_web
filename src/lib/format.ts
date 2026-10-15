/** Display formatting shared by the public website screens. */

/** "Thu, 24 Sep 2026" */
export function formatDate(iso: string) {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString('en-GB', { weekday: 'short' });
  const rest = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${weekday}, ${rest}`;
}

/** "6:00 PM" */
export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/** "฿120" — falls back to "120 XYZ" for unknown currency codes. */
export function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

/** "Nay Paing" → "NP" */
export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
