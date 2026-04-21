import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "../../../lib/auth";
import { loadSettings, saveSettings } from "../../../lib/settings";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await loadSettings();
  // Hide secrets from the API response (still saved on disk).
  if (settings.smtp) {
    settings.smtp = { ...settings.smtp, pass: settings.smtp.pass ? "********" : "" };
  }
  if (settings.ai) {
    settings.ai = { ...settings.ai, apiKey: settings.ai.apiKey ? "********" : "" };
  }
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const current = await loadSettings();

  // Don't overwrite saved secrets if the client sent the masked stub back.
  if (body.smtp?.pass === "********") {
    body.smtp.pass = current.smtp?.pass ?? "";
  }
  if (body.ai?.apiKey === "********") {
    body.ai.apiKey = current.ai?.apiKey ?? "";
  }

  await saveSettings(body);
  return NextResponse.json({ ok: true });
}
