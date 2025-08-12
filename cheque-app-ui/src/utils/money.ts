// src/utils/money.ts
export function money(
  value: number | string,
  currency: 'DOP' | 'USD' = 'DOP',
  locale = 'es-DO'
) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(n);
}
