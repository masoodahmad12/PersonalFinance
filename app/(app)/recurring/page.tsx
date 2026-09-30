import type { Metadata } from "next";
import { getRecurring } from "@/lib/data";
import { processDueRecurring } from "@/lib/recurring";
import { RecurringView } from "./recurring-view";

export const metadata: Metadata = { title: "Recurring" };

export default async function RecurringPage() {
  await processDueRecurring().catch((e) => console.error("Recurring processing failed", e));
  const rules = await getRecurring();
  return <RecurringView rules={rules} />;
}
