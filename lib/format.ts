const currencyFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

const currencyFormatterPrecise = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("en-PK", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatPKR(amount: number, precise = false): string {
  return (precise ? currencyFormatterPrecise : currencyFormatter).format(amount);
}

export function formatCompact(amount: number): string {
  return compactFormatter.format(amount);
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : Infinity;
  return ((current - previous) / Math.abs(previous)) * 100;
}
