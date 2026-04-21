import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { deleteBooking, updateStatus, type Booking } from "../../../../lib/bookings";
import { currentUser, isAdmin } from "../../../../lib/auth";

async function readBooking(id: string): Promise<Booking | null> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "data", "bookings.json"),
      "utf-8"
    );
    const all = JSON.parse(raw) as Booking[];
    return all.find((b) => b.id === id) ?? null;
  } catch {
    return null;
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await currentUser();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await readBooking(id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Barbers can only touch their own bookings.
  if (me.role !== "admin" && existing.barberId !== me.barberId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { status } = await req.json();
  const allowed = ["pending", "confirmed", "completed", "cancelled"];
  if (!allowed.includes(status))
    return NextResponse.json({ error: "Bad status" }, { status: 400 });
  const updated = await updateStatus(id, status);
  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ booking: updated });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const ok = await deleteBooking(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
