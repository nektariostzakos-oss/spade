import { NextResponse } from "next/server";
import {
  dueForReminder,
  dueForReviewRequest,
  markReminded,
  markReviewRequested,
} from "../../../../lib/bookings";
import { sendBookingReminder, sendReviewRequest } from "../../../../lib/email";

/**
 * Reminder / review cron endpoint.
 *
 * Hits this every ~5 minutes (Vercel Cron, an external scheduler, or the
 * built-in dev-mode interval below). Each tick:
 *  1. Sends an 8h-ahead booking reminder for each booking in the 7h55m–8h05m
 *     window that hasn't been reminded yet.
 *  2. Sends a "how did we do?" review email 2–24h after each completed
 *     booking (once per booking).
 */
export async function GET() {
  const [reminders, reviews] = await Promise.all([
    dueForReminder(),
    dueForReviewRequest(),
  ]);

  let remindersSent = 0;
  for (const b of reminders) {
    const ok = await sendBookingReminder(b);
    await markReminded(b.id);
    if (ok) remindersSent++;
  }

  let reviewsSent = 0;
  for (const b of reviews) {
    const ok = await sendReviewRequest(b);
    await markReviewRequested(b.id);
    if (ok) reviewsSent++;
  }

  return NextResponse.json({
    reminders: { checked: reminders.length, sent: remindersSent },
    reviews: { checked: reviews.length, sent: reviewsSent },
  });
}

export async function POST() {
  return GET();
}
