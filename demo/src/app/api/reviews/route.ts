import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "../../../lib/auth";
import { createReview, deleteReview, listReviews, updateReview } from "../../../lib/reviews";
import { allowAction, clientIp } from "../../../lib/rateLimit";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") as "pending" | "approved" | "rejected" | null;
  if (status === "approved") {
    return NextResponse.json({ reviews: await listReviews("approved") });
  }
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ reviews: await listReviews(status ?? undefined) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const staff = await isAdmin();
  if (!staff) {
    const ip = clientIp(req);
    if (!allowAction(`review:${ip}`, 3, 60 * 60_000)) {
      return NextResponse.json({ error: "Too many submissions." }, { status: 429 });
    }
  }
  if (!body.name || !body.body || !body.rating) {
    return NextResponse.json({ error: "name, rating, body required" }, { status: 400 });
  }
  const r = await createReview({
    name: String(body.name).slice(0, 80),
    rating: Math.max(1, Math.min(5, Number(body.rating) || 5)),
    title: String(body.title || "").slice(0, 120),
    body: String(body.body).slice(0, 2000),
    source: staff ? "manual" : "booking",
    bookingId: body.bookingId,
    status: staff ? "approved" : "pending",
  });
  return NextResponse.json({ review: r }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...patch } = await req.json();
  const r = await updateReview(id, patch);
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ review: r });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await deleteReview(id);
  return NextResponse.json({ ok: true });
}
