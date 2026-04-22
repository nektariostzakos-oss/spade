import { NextRequest, NextResponse } from "next/server";
import { createOrder, listOrders } from "../../../lib/orders";
import { isStaff } from "../../../lib/auth";
import { listProducts, releaseStock, reserveStock } from "../../../lib/products";
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

    // SERVER-SIDE PRICE AUTHORITY — never trust client-supplied prices.
    // Look up each line against the catalog, build an authoritative
    // items[] with canonical price + name + slug, then compute subtotal.
    // Rejects any unknown product id.
    const catalog = await listProducts();
    type IncomingLine = { id: string; qty: number };
    const incoming = body.items as IncomingLine[];
    const normalized: Array<{
      id: string;
      slug: string;
      name: string;
      price: number;
      qty: number;
    }> = [];
    for (const raw of incoming) {
      const qty = Math.max(1, Math.floor(Number(raw.qty) || 1));
      const product = catalog.find((p) => p.id === raw.id);
      if (!product) {
        return NextResponse.json(
          { error: `Unknown product: ${String(raw.id)}` },
          { status: 400 }
        );
      }
      const nameLocalised = body.lang === "el"
        ? product.name_el || product.name_en
        : product.name_en;
      normalized.push({
        id: product.id,
        slug: product.slug,
        name: nameLocalised,
        price: Number(product.price) || 0,
        qty,
      });
    }

    // Reserve stock atomically.
    const reserve = await reserveStock(normalized.map((it) => ({ id: it.id, qty: it.qty })));
    if (!reserve.ok) {
      return NextResponse.json({ error: reserve.error }, { status: 409 });
    }

    const subtotal = normalized.reduce((s, it) => s + it.price * it.qty, 0);

    let order;
    try {
      order = await createOrder({
        items: normalized,
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
    } catch (err) {
      // Roll stock back so we don't oversell because of a downstream failure.
      await releaseStock(normalized.map((it) => ({ id: it.id, qty: it.qty })));
      throw err;
    }

    // Auto-issue a gift card for each voucher line. Voucher detection is
    // now authoritative — uses the catalog slug, not client-sent name.
    const gifts: Array<{ code: string; amount: number }> = [];
    for (const it of normalized) {
      const isVoucher = it.slug.toLowerCase().startsWith("gift-voucher");
      if (!isVoucher) continue;
      for (let i = 0; i < it.qty; i++) {
        const gc = await createGiftCard({
          amount: it.price, // canonical, from products.json
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
