/**
 * Lightweight in-process reminder ticker.
 * Runs on the server boot (dev + prod) every 5 minutes.
 * In production behind serverless you'd disable this and use Vercel Cron
 * pointing at /api/cron/reminders instead.
 */
import { dueForReminder, markReminded } from "./bookings";
import { sendBookingReminder } from "./email";

declare global {
  // eslint-disable-next-line no-var
  var __spadeReminderInterval: NodeJS.Timeout | undefined;
}

const FIVE_MIN = 5 * 60 * 1000;

async function tick() {
  try {
    const due = await dueForReminder();
    for (const b of due) {
      await sendBookingReminder(b);
      await markReminded(b.id);
    }
  } catch {
    // swallow — never crash the boot loop
  }
}

export function startReminderScheduler() {
  if (process.env.SPADE_DISABLE_REMINDERS === "1") return;
  if (global.__spadeReminderInterval) return;
  global.__spadeReminderInterval = setInterval(tick, FIVE_MIN);
  // Fire once 30s after boot so a freshly-scheduled appointment can be picked up.
  setTimeout(tick, 30_000);
}
