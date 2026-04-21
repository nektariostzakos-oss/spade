import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/auth";
import { updateOrderStatus, type OrderStatus } from "../../../../lib/orders";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { status } = await req.json();
  const allowed = ["new", "paid", "shipped", "completed", "cancelled"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Bad status" }, { status: 400 });
  }
  const o = await updateOrderStatus(id, status as OrderStatus);
  if (!o) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order: o });
}
