import { NextResponse } from "next/server";
import { dueForReminder, markReminded } from "../../../../lib/bookings";
import { sendBookingReminder } from "../../../../lib/email";

/**
 * Reminder cron endpoint.
 *
 * Hits this every ~5 minutes (Vercel Cron, an external scheduler, or the
 * built-in dev-mode interval below). Sends a 30-min-ahead reminder for
 * each booking starting in 15-45 minutes that hasn't been reminded yet.
 */
export async function GET() {
  const due = await dueForReminder();
  let sent = 0;
  for (const b of due) {
    const ok = await sendBookingReminder(b);
    await markReminded(b.id);
    if (ok) sent++;
  }
  return NextResponse.json({ checked: due.length, sent });
}

export async function POST() {
  return GET();
}
