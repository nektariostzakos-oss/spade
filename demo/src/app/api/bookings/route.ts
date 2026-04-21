import { NextRequest, NextResponse } from "next/server";
import {
  createBooking,
  getTakenSlots,
  listBookings,
  type NewBooking,
} from "../../../lib/bookings";
import { isStaff } from "../../../lib/auth";
import { sendBookingConfirmation } from "../../../lib/email";
import { allowAction, clientIp } from "../../../lib/rateLimit";

const MAX_FIELD = 200;
const MAX_NOTES = 1000;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const barber = url.searchParams.get("barber");

  if (date && barber) {
    const taken = await getTakenSlots(date, barber);
    return NextResponse.json({ taken });
  }

  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const all = await listBookings();
  return NextResponse.json({ bookings: all });
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);

    // Rate limit: 5 bookings per hour per IP, 30 per day per IP.
    if (!allowAction(`book:hour:${ip}`, 5, 60 * 60_000)) {
      return NextResponse.json(
        { error: "Too many booking attempts. Try again later." },
        { status: 429 }
      );
    }
    if (!allowAction(`book:day:${ip}`, 30, 24 * 60 * 60_000)) {
      return NextResponse.json(
        { error: "Daily booking limit reached." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as NewBooking & {
      website?: string; // honeypot
    };

    // Honeypot — real users never fill this hidden field.
    if (typeof body.website === "string" && body.website.trim().length > 0) {
      return NextResponse.json({ error: "Spam detected" }, { status: 400 });
    }

    const required: (keyof NewBooking)[] = [
      "serviceId",
      "serviceName",
      "price",
      "duration",
      "barberId",
      "barberName",
      "date",
      "time",
      "name",
      "phone",
    ];
    for (const k of required) {
      if (body[k] === undefined || body[k] === "")
        return NextResponse.json(
          { error: `Missing field: ${String(k)}` },
          { status: 400 }
        );
    }

    // Length limits — protect storage + emails from absurd inputs.
    const stringFields: (keyof NewBooking)[] = [
      "serviceId",
      "serviceName",
      "barberId",
      "barberName",
      "date",
      "time",
      "name",
      "phone",
      "email",
    ];
    for (const k of stringFields) {
      const v = body[k];
      if (typeof v === "string" && v.length > MAX_FIELD) {
        return NextResponse.json(
          { error: `Field "${String(k)}" is too long.` },
          { status: 400 }
        );
      }
    }
    if (body.notes && String(body.notes).length > MAX_NOTES) {
      return NextResponse.json(
        { error: "Notes too long." },
        { status: 400 }
      );
    }

    // Format checks.
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email))) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }
    if (!/^\+?[0-9 ()\-]{6,20}$/.test(String(body.phone))) {
      return NextResponse.json(
        { error: "Invalid phone number." },
        { status: 400 }
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.date))) {
      return NextResponse.json({ error: "Invalid date." }, { status: 400 });
    }
    if (!/^\d{2}:\d{2}$/.test(String(body.time))) {
      return NextResponse.json({ error: "Invalid time." }, { status: 400 });
    }
    // Reject past dates.
    const slotTs = new Date(`${body.date}T${body.time}:00`).getTime();
    if (Number.isFinite(slotTs) && slotTs < Date.now() - 5 * 60_000) {
      return NextResponse.json(
        { error: "That time is in the past." },
        { status: 400 }
      );
    }

    const booking = await createBooking(body);
    if (booking.email) {
      sendBookingConfirmation(booking).catch((err) => {
        console.error("[bookings] confirmation email failed", {
          bookingId: booking.id,
          error: err instanceof Error ? err.message : String(err),
        });
      });
    }
    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Booking failed";
    return NextResponse.json({ error: msg }, { status: 409 });
  }
}
