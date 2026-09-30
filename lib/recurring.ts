import "server-only";
import { connectDB } from "./db";
import { fromYmd, occurrenceYmd, toYmd, todayYmd } from "./dates";
import type { Frequency } from "./constants";
import { Recurring } from "@/models/Recurring";
import { Transaction } from "@/models/Transaction";

const MAX_CATCH_UP = 500;

/**
 * Posts every occurrence that is due (up to today, Pakistan time) for all active
 * recurring rules. Safe to run concurrently: the unique (recurringId, date) index
 * makes each occurrence idempotent.
 */
export async function processDueRecurring(): Promise<{ created: number; rules: number }> {
  await connectDB();
  const today = todayYmd();
  const due = await Recurring.find({ isActive: true, nextRunDate: { $lte: fromYmd(today) } });

  let created = 0;
  for (const rule of due) {
    const startYmd = toYmd(rule.startDate);
    const endYmd = rule.endDate ? toYmd(rule.endDate) : null;
    const frequency = rule.frequency as Frequency;
    let runCount = rule.runCount;
    let next = occurrenceYmd(startYmd, frequency, rule.interval, runCount);

    for (let i = 0; i < MAX_CATCH_UP && next <= today && (!endYmd || next <= endYmd); i++) {
      const res = await Transaction.updateOne(
        { recurringId: rule._id, date: fromYmd(next) },
        {
          $setOnInsert: {
            type: rule.type,
            amount: rule.amount,
            categoryId: rule.categoryId,
            note: rule.note,
            recurringId: rule._id,
            date: fromYmd(next),
          },
        },
        { upsert: true },
      );
      created += res.upsertedCount;
      runCount += 1;
      next = occurrenceYmd(startYmd, frequency, rule.interval, runCount);
    }

    rule.runCount = runCount;
    rule.nextRunDate = fromYmd(next);
    if (endYmd && next > endYmd) rule.isActive = false;
    await rule.save();
  }

  return { created, rules: due.length };
}

/** First occurrence on or after `fromYmdValue`, used when (re)scheduling a rule. */
export function scheduleFrom(
  startYmd: string,
  frequency: Frequency,
  interval: number,
  fromYmdValue: string,
): { runCount: number; nextRunDate: string } {
  let runCount = 0;
  let next = occurrenceYmd(startYmd, frequency, interval, 0);
  while (next < fromYmdValue && runCount < 100_000) {
    runCount += 1;
    next = occurrenceYmd(startYmd, frequency, interval, runCount);
  }
  return { runCount, nextRunDate: next };
}
