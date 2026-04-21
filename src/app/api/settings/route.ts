import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "../../../lib/auth";
import { loadSettings, saveSettings } from "../../../lib/settings";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await loadSettings();
  // Hide the password from the API response (still saved on disk).
  if (settings.smtp) {
    settings.smtp = { ...settings.smtp, pass: settings.smtp.pass ? "********" : "" };
  }
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const current = await loadSettings();

  // Don't overwrite the saved password if the client sent the masked stub back.
  if (body.smtp?.pass === "********") {
    body.smtp.pass = current.smtp?.pass ?? "";
  }

  await saveSettings(body);
  return NextResponse.json({ ok: true });
}
