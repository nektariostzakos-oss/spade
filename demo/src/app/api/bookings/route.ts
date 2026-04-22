import { NextRequest, NextResponse } from "next/server";
import {
  createBooking,
  getTakenSlots,
  getOccupiedSlots,
  listBookings,
  type NewBooking,
} from "../../../lib/bookings";
import { getSlotsForDay } from "../../../lib/services";
import { currentUser, isStaff } from "../../../lib/auth";
import { sendBookingConfirmation } from "../../../lib/email";
import { allowAction, clientIp } from "../../../lib/rateLimit";
import { loadBusiness } from "../../../lib/settings";
import { wallClockInTzToUtc } from "../../../lib/tz";
import { listAdminServices } from "../../../lib/customServices";
import { listAdminStaff, slotFilterForStaff } from "../../../lib/customStaff";
import { signBookingId } from "../../../lib/bookingToken";
import { redeemCoupon, validateCoupon } from "../../../lib/coupons";
import { findClientByContact } from "../../../lib/clients";

const MAX_FIELD = 200;
const MAX_NOTES = 1000;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const barber = url.searchParams.get("barber");

  if (date && barber) {
    // `taken` = slots blocked by existing bookings (buffer-aware) plus slots
    // outside the chosen stylist's working hours / lunch break for that day.
    const services = await listAdminServices();
    const bufferById = new Map(
      services.map((s) => [s.id, Math.max(0, Number(s.bufferMinutes) || 0)])
    );
    const occupied = await getOccupiedSlots(
      date,
      barber,
      (sid) => bufferById.get(sid) ?? 0
    );

    const blocked = new Set<string>(occupied);

    // If a specific stylist is chosen and they don't work that day (or the
    // requested slot is during their break), mark the whole daily grid as
    // blocked so the UI shows "no times available". We derive the daily
    // grid from getSlotsForDay against business hours.
    if (barber !== "any") {
      const staff = (await listAdminStaff()).find((s) => s.id === barber);
      if (staff) {
        const [y, m, d] = date.split("-").map(Number);
        const dow = new Date(Date.UTC(y, (m || 1) - 1, d || 1)).getUTCDay();
        const filter = slotFilterForStaff(staff, dow);
        const business = await loadBusiness();
        const grid = getSlotsForDay(dow, business.hours);
        if (filter === null) {
          for (const s of grid) blocked.add(s);
        } else {
          for (const s of grid) if (!filter(s)) blocked.add(s);
        }
      }
    }

    return NextResponse.json({ taken: Array.from(blocked) });
  }

  const me = await currentUser();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const all = await listBookings();
  const bookings =
    me.role === "admin"
      ? all
      : all.filter((b) => b.barberId === me.barberId || b.barberId === "any");
  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const actor = await isStaff();

    // Admin/staff create bookings through the walk-in modal — skip the
    // anti-abuse gates (rate limit + honeypot). Public form still gets them.
    if (!actor) {
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
    }

    const body = (await req.json()) as NewBooking & {
      website?: string; // honeypot
      couponCode?: string;
    };

    // Honeypot — real users never fill this hidden field. Skip for staff.
    if (!actor && typeof body.website === "string" && body.website.trim().length > 0) {
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
    // Reject past dates. Booking date+time are wall-clock in the business
    // timezone — convert to UTC ms before comparing to Date.now() to avoid
    // a UTC-host false-positive that rejects valid near-term slots.
    const business = await loadBusiness();
    const tz = business.timezone || "Europe/Athens";
    const slotTs = wallClockInTzToUtc(String(body.date), String(body.time), tz);
    if (Number.isFinite(slotTs) && slotTs < Date.now() - 5 * 60_000) {
      return NextResponse.json(
        { error: "That time is in the past." },
        { status: 400 }
      );
    }

    // SERVER-SIDE AVAILABILITY ENFORCEMENT — don't trust the client slot.
    // 1. Reject bookings outside business opening hours / closed days
    // 2. Reject bookings that overlap an existing booking (buffer-aware)
    // 3. Reject bookings outside the chosen stylist's working hours / break
    // Admin walk-ins (staff callers) are exempt — front desk may need to
    // override for in-person edge cases (regular who insists on 09:30 etc).
    if (!actor) {
      const [y, mm, dd] = String(body.date).split("-").map(Number);
      const dow = new Date(Date.UTC(y, (mm || 1) - 1, dd || 1)).getUTCDay();
      const validSlots = getSlotsForDay(dow, business.hours);
      if (validSlots.length === 0) {
        return NextResponse.json({ error: "We're closed on that day." }, { status: 400 });
      }
      if (!validSlots.includes(String(body.time))) {
        return NextResponse.json(
          { error: "That time is outside our opening hours." },
          { status: 400 }
        );
      }

      // Staff availability
      if (String(body.barberId) !== "any") {
        const staff = (await listAdminStaff()).find((s) => s.id === String(body.barberId));
        if (staff) {
          const filter = slotFilterForStaff(staff, dow);
          if (filter === null) {
            return NextResponse.json(
              { error: "That stylist isn't working on that day." },
              { status: 400 }
            );
          }
          if (!filter(String(body.time))) {
            return NextResponse.json(
              { error: "That stylist isn't available at that time." },
              { status: 400 }
            );
          }
        }
      }

      // Buffer-aware overlap check against existing bookings
      const services = await listAdminServices();
      const bufferById = new Map(
        services.map((s) => [s.id, Math.max(0, Number(s.bufferMinutes) || 0)])
      );
      const occupied = await getOccupiedSlots(
        String(body.date),
        String(body.barberId),
        (sid) => bufferById.get(sid) ?? 0
      );
      if (occupied.includes(String(body.time))) {
        return NextResponse.json(
          { error: "That slot was just taken. Pick another time." },
          { status: 409 }
        );
      }

      // Force walkIn=false for public callers — staff-only flag
      body.walkIn = false;

      // Patch-test gate for chemical services. If the service is flagged
      // requiresPatchTest and we can find no record of a completed test
      // on this client (matched by email or phone), reject with a clear
      // message so the UI can redirect them to book a patch test first.
      const svc = services.find((s) => s.id === String(body.serviceId));
      if (svc?.requiresPatchTest) {
        const client = await findClientByContact(String(body.email || ""), String(body.phone || ""));
        if (!client?.patchTestAt) {
          return NextResponse.json(
            {
              error:
                "This service requires a 48h patch test before your first visit. Please contact us to arrange one — we'll do it free of charge.",
            },
            { status: 400 }
          );
        }
      }
    }

    // Coupon handling for bookings. Server-side; same semantics as orders.
    let appliedCoupon: { code: string; discount: number } | null = null;
    if (typeof body.couponCode === "string" && body.couponCode.trim().length > 0) {
      const gross = Number(body.price) || 0;
      const res = await validateCoupon(body.couponCode.trim(), gross, "bookings");
      if (!res.ok) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      appliedCoupon = { code: res.coupon!.code, discount: res.discount ?? 0 };
      body.price = Math.max(0, Number((gross - (res.discount ?? 0)).toFixed(2)));
      body.notes = [body.notes, `Coupon: ${res.coupon!.code} (-£${(res.discount ?? 0).toFixed(2)})`]
        .filter(Boolean)
        .join(" · ");
      await redeemCoupon(res.coupon!.id);
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
    const manageToken = await signBookingId(booking.id);
    return NextResponse.json({ booking, manageToken, appliedCoupon }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Booking failed";
    return NextResponse.json({ error: msg }, { status: 409 });
  }
}
