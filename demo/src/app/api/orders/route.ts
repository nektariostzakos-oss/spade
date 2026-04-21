import { NextRequest, NextResponse } from "next/server";
import { createOrder, listOrders } from "../../../lib/orders";
import { isStaff } from "../../../lib/auth";
import { reserveStock } from "../../../lib/products";
import { allowAction, clientIp } from "../../../lib/rateLimit";

export async function GET() {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ orders: await listOrders() });
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    if (!allowAction(`order:hour:${ip}`, 5, 60 * 60_000)) {
      return NextResponse.json(
        { error: "Too many orders. Try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Honeypot
    if (typeof body.website === "string" && body.website.trim()) {
      return NextResponse.json({ error: "Spam detected" }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const required = ["name", "phone", "email", "address", "city", "postal"];
    for (const k of required) {
      if (!body[k]) {
        return NextResponse.json(
          { error: `Missing ${k}` },
          { status: 400 }
        );
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email))) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }
    if (!/^\+?[0-9 ()\-]{6,20}$/.test(String(body.phone))) {
      return NextResponse.json({ error: "Invalid phone." }, { status: 400 });
    }

    // Reserve stock atomically.
    const reserve = await reserveStock(
      body.items.map((it: { id: string; qty: number }) => ({
        id: it.id,
        qty: Number(it.qty) || 1,
      }))
    );
    if (!reserve.ok) {
      return NextResponse.json({ error: reserve.error }, { status: 409 });
    }

    const subtotal = body.items.reduce(
      (s: number, it: { price: number; qty: number }) =>
        s + Number(it.price) * Number(it.qty),
      0
    );

    const order = await createOrder({
      items: body.items,
      subtotal,
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address,
      city: body.city,
      postal: body.postal,
      notes: body.notes ?? "",
      lang: body.lang === "el" ? "el" : "en",
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Order failed" },
      { status: 500 }
    );
  }
}
