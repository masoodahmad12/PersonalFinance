import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { processDueRecurring } from "@/lib/recurring";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processDueRecurring();
    if (result.created > 0) revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Recurring cron failed", error);
    return NextResponse.json({ ok: false, error: "Processing failed" }, { status: 500 });
  }
}
