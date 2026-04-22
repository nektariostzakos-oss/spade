import { NextResponse } from "next/server";
import { getActiveServices } from "../../../lib/customServices";

/**
 * Public read-only endpoint for the service catalog, used by the admin
 * walk-in modal and any client-side UI that needs a simple service list.
 */
export async function GET() {
  const services = await getActiveServices();
  return NextResponse.json(
    { services },
    { headers: { "cache-control": "public, max-age=60, stale-while-revalidate=300" } }
  );
}
