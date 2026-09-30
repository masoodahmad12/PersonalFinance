import { addDays, addMonths, addWeeks, addYears, format, parseISO } from "date-fns";
import { TIMEZONE, TZ_OFFSET, type Frequency } from "./constants";

const ymdFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Calendar date (YYYY-MM-DD) of an instant, as seen in Pakistan time. */
export function toYmd(date: Date): string {
  return ymdFormatter.format(date);
}

export function todayYmd(): string {
  return toYmd(new Date());
}

export function currentMonthKey(): string {
  return todayYmd().slice(0, 7);
}

/** Midnight Pakistan time for a YYYY-MM-DD calendar date. */
export function fromYmd(ymd: string): Date {
  return new Date(`${ymd}T00:00:00${TZ_OFFSET}`);
}

export function isValidYmd(value: string | undefined | null): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(fromYmd(value).getTime());
}

export function isValidMonthKey(value: string | undefined | null): value is string {
  return !!value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  return format(addMonths(parseISO(`${monthKey}-01`), delta), "yyyy-MM");
}

/** [start, end) instants covering a calendar month in Pakistan time. */
export function monthRange(monthKey: string): { start: Date; end: Date } {
  return {
    start: fromYmd(`${monthKey}-01`),
    end: fromYmd(`${shiftMonthKey(monthKey, 1)}-01`),
  };
}

export function monthLabel(monthKey: string, pattern = "MMMM yyyy"): string {
  return format(parseISO(`${monthKey}-01`), pattern);
}

export function daysInMonth(monthKey: string): string[] {
  const first = parseISO(`${monthKey}-01`);
  const next = addMonths(first, 1);
  const days: string[] = [];
  for (let d = first; d < next; d = addDays(d, 1)) days.push(format(d, "yyyy-MM-dd"));
  return days;
}

export function shiftYmd(ymd: string, days: number): string {
  return format(addDays(parseISO(ymd), days), "yyyy-MM-dd");
}

export function formatYmd(ymd: string, pattern = "d MMM yyyy"): string {
  return format(parseISO(ymd), pattern);
}

/** The Nth occurrence (0-based) of a recurring schedule, as YYYY-MM-DD. */
export function occurrenceYmd(
  startYmd: string,
  frequency: Frequency,
  interval: number,
  n: number,
): string {
  const start = parseISO(startYmd);
  const steps = n * interval;
  const next =
    frequency === "daily"
      ? addDays(start, steps)
      : frequency === "weekly"
        ? addWeeks(start, steps)
        : frequency === "monthly"
          ? addMonths(start, steps)
          : addYears(start, steps);
  return format(next, "yyyy-MM-dd");
}
