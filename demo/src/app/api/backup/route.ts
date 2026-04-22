import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAdmin } from "../../../lib/auth";

const DATA_DIR = path.join(process.cwd(), "data");
const ALLOWED = new Set([
  "bookings.json", "orders.json", "products.json", "users.json", "content.json",
  "settings.json", "clients.json", "coupons.json", "reviews.json", "pages.json",
  "waitlist.json", "views.json", "services.json", "staff.json", "holidays.json",
  "audit.json", "gift-cards.json", "blog-categories.json", "transformations.json",
  "install-stats.json", "emails.log.json", "barber-knowledge.json",
]);

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const files = await fs.readdir(DATA_DIR).catch(() => []);
  const out: Record<string, unknown> = {};
  for (const f of files) {
    if (!ALLOWED.has(f)) continue;
    try {
      out[f] = JSON.parse(await fs.readFile(path.join(DATA_DIR, f), "utf-8"));
    } catch {}
  }
  const body = JSON.stringify({ backedUpAt: new Date().toISOString(), files: out }, null, 2);
  return new NextResponse(body, {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const files = body.files;
  if (!files || typeof files !== "object") {
    return NextResponse.json({ error: "Invalid backup" }, { status: 400 });
  }
  let restored = 0;
  for (const [name, content] of Object.entries(files)) {
    if (!ALLOWED.has(name)) continue;
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(DATA_DIR, name), JSON.stringify(content, null, 2), "utf-8");
    restored++;
  }
  return NextResponse.json({ ok: true, restored });
}
