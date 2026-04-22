import { NextRequest, NextResponse } from "next/server";
import { activateLicense, getStatus } from "../../../lib/license";
import { currentUser } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getStatus();
  return NextResponse.json(status, { headers: { "cache-control": "no-store" } });
}

export async function POST(req: NextRequest) {
  // Only a signed-in admin can activate — prevents anonymous drive-by
  // activations and keeps the audit trail meaningful.
  const me = await currentUser();
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { code?: string };
  if (!body.code || typeof body.code !== "string") {
    return NextResponse.json({ error: "Missing code." }, { status: 400 });
  }

  const result = await activateLicense(body.code.trim());
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, payload: result.payload });
}
