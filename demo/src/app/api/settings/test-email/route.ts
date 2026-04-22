import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { isAdmin } from "../../../../lib/auth";
import { loadSmtp } from "../../../../lib/settings";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { to } = await req.json();
  if (!to) {
    return NextResponse.json({ error: "Recipient required" }, { status: 400 });
  }

  const s = await loadSmtp();
  if (!s.host) {
    return NextResponse.json(
      { error: "Fill in SMTP details first." },
      { status: 400 }
    );
  }

  try {
    const transport = nodemailer.createTransport({
      host: s.host,
      port: s.port,
      secure: s.secure === "ssl",
      requireTLS: s.secure === "tls",
      auth: s.user ? { user: s.user, pass: s.pass } : undefined,
    });
    await transport.sendMail({
      from: s.from || `Your Salon <${s.user}>`,
      to,
      subject: "Your Salon SMTP test",
      text: "If you can read this, your SMTP settings work.\n\n— Your Salon",
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Send failed" },
      { status: 500 }
    );
  }
}
