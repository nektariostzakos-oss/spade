import { NextResponse, type NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Cached for the lifetime of this process. Flipped to `true` after the first
// read that finds onboarded:true; we never touch the file again after that.
let onboardedCached = false;

async function isOnboarded(): Promise<boolean> {
  if (onboardedCached) return true;
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "data", "settings.json"),
      "utf-8"
    );
    const parsed = JSON.parse(raw) as { onboarded?: boolean };
    if (parsed.onboarded) {
      onboardedCached = true;
      return true;
    }
  } catch {
    /* settings file doesn't exist yet — treat as not onboarded */
  }
  return false;
}

const PREVIEW_COOKIE = "spade_preview";

export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // ?preview=1 turns on preview mode and sticks via cookie so internal nav
  // (services, shop, blog, etc.) keeps working without re-adding the query.
  if (searchParams.get("preview") === "1") {
    const res = NextResponse.next();
    res.cookies.set(PREVIEW_COOKIE, "1", {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });
    return res;
  }
  if (req.cookies.get(PREVIEW_COOKIE)?.value === "1") {
    return NextResponse.next();
  }

  // Never interfere with setup, the setup API, Next internals, or static files.
  if (
    pathname.startsWith("/setup") ||
    pathname.startsWith("/api/setup") ||
    pathname.startsWith("/api/install") ||
    pathname.startsWith("/api/install-stats") ||
    pathname.startsWith("/api/import-site") ||
    pathname.startsWith("/api/templates") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/brand") ||
    pathname.startsWith("/demos") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/blog/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/llms.txt" ||
    pathname === "/manifest.webmanifest"
  ) {
    return NextResponse.next();
  }

  if (await isOnboarded()) return NextResponse.next();

  // Redirect everything else to the setup page.
  const url = req.nextUrl.clone();
  url.pathname = "/setup";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
