import { FREQUENCY_LABELS, type Frequency } from "./constants";

export function describeSchedule(frequency: Frequency, interval: number): string {
  const unit = FREQUENCY_LABELS[frequency];
  if (interval === 1) {
    return { daily: "Every day", weekly: "Every week", monthly: "Every month", yearly: "Every year" }[
      frequency
    ];
  }
  return `Every ${interval} ${unit.many}`;
}
