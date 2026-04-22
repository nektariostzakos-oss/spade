import { NextRequest, NextResponse } from "next/server";
import { createOrder, listOrders } from "../../../lib/orders";
import { isStaff } from "../../../lib/auth";
import { reserveStock } from "../../../lib/products";
import { allowAction, clientIp } from "../../../lib/rateLimit";
import { createGiftCard } from "../../../lib/giftCards";

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

    // Auto-issue a gift card for each voucher line. We detect vouchers
    // by slug prefix (gift-voucher-*) which is how the demo products
    // are seeded. One card per quantity; each card carries the line price
    // as its full balance (matches the customer's intent — a £100 voucher
    // should let them redeem £100).
    const gifts: Array<{ code: string; amount: number }> = [];
    for (const it of body.items as Array<{ id: string; slug?: string; name?: string; price: number; qty: number }>) {
      const slug = (it.slug || "").toLowerCase();
      const isVoucher =
        slug.startsWith("gift-voucher") ||
        (it.name || "").toLowerCase().includes("gift voucher") ||
        (it.name || "").toLowerCase().includes("δωροεπιταγ");
      if (!isVoucher) continue;
      const qty = Math.max(1, Number(it.qty) || 1);
      for (let i = 0; i < qty; i++) {
        const gc = await createGiftCard({
          amount: Number(it.price) || 0,
          buyerName: body.name,
          buyerEmail: body.email,
          recipient: body.notes || undefined,
          orderId: order.id,
        });
        gifts.push({ code: gc.code, amount: gc.amount });
      }
    }

    return NextResponse.json({ order, gifts }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Order failed" },
      { status: 500 }
    );
  }
}
