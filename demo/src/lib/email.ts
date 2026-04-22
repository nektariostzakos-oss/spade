import nodemailer from "nodemailer";
import { promises as fs } from "fs";
import path from "path";
import type { Booking } from "./bookings";
import { signBookingId } from "./bookingToken";
import {
  loadSmtp,
  smtpReady,
  loadTemplates,
  loadBusiness,
  type EmailTemplate,
} from "./settings";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://oakline.studio";

const LOG_FILE = path.join(process.cwd(), "data", "emails.log.json");

export type SentEmail = {
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  delivered: boolean;
  error?: string;
};

async function buildTransport() {
  const s = await loadSmtp();
  return nodemailer.createTransport({
    host: s.host,
    port: s.port,
    secure: s.secure === "ssl",
    requireTLS: s.secure === "tls",
    auth: s.user ? { user: s.user, pass: s.pass } : undefined,
  });
}

async function fromAddress() {
  const s = await loadSmtp();
  return s.from || `Oakline Scissors <${s.user || "hello@oakline.studio"}>`;
}

async function appendLog(entry: SentEmail) {
  let arr: SentEmail[] = [];
  try {
    const raw = await fs.readFile(LOG_FILE, "utf-8");
    arr = JSON.parse(raw);
  } catch {}
  arr.unshift(entry);
  await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });
  await fs.writeFile(LOG_FILE, JSON.stringify(arr.slice(0, 500), null, 2));
}

export async function sendBulk(
  recipients: string[],
  subject: string,
  body: string
): Promise<{ sent: number; failed: number; mode: "smtp" | "preview"; results: SentEmail[] }> {
  const cleaned = Array.from(
    new Set(
      recipients
        .map((r) => r.trim().toLowerCase())
        .filter((r) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r))
    )
  );

  const from = await fromAddress();
  const results: SentEmail[] = [];
  let sent = 0;
  let failed = 0;

  if (!(await smtpReady())) {
    for (const to of cleaned) {
      const entry: SentEmail = {
        to,
        subject,
        body,
        sentAt: new Date().toISOString(),
        delivered: false,
        error: "SMTP not configured (preview mode)",
      };
      results.push(entry);
      await appendLog(entry);
    }
    return { sent: 0, failed: 0, mode: "preview", results };
  }

  const transport = await buildTransport();
  for (const to of cleaned) {
    try {
      await transport.sendMail({
        from,
        to,
        subject,
        text: body,
        html: body
          .split("\n")
          .map((l) => `<p>${escape(l)}</p>`)
          .join(""),
      });
      const entry: SentEmail = {
        to,
        subject,
        body,
        sentAt: new Date().toISOString(),
        delivered: true,
      };
      results.push(entry);
      await appendLog(entry);
      sent++;
    } catch (e) {
      const entry: SentEmail = {
        to,
        subject,
        body,
        sentAt: new Date().toISOString(),
        delivered: false,
        error: e instanceof Error ? e.message : "Send failed",
      };
      results.push(entry);
      await appendLog(entry);
      failed++;
    }
  }
  return { sent, failed, mode: "smtp", results };
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function readEmailLog(): Promise<SentEmail[]> {
  try {
    const raw = await fs.readFile(LOG_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function isSmtpConfigured() {
  return smtpReady();
}

/**
 * Single-recipient send (used for confirmations / reminders).
 * Falls back to preview-mode log when SMTP isn't configured.
 */
async function sendOne(to: string, subject: string, body: string) {
  const from = await fromAddress();
  if (!(await smtpReady())) {
    const entry: SentEmail = {
      to,
      subject,
      body,
      sentAt: new Date().toISOString(),
      delivered: false,
      error: "SMTP not configured (preview mode)",
    };
    await appendLog(entry);
    return false;
  }
  try {
    const transport = await buildTransport();
    await transport.sendMail({
      from,
      to,
      subject,
      text: body,
      html: body
        .split("\n")
        .map((l) => `<p>${escape(l)}</p>`)
        .join(""),
    });
    await appendLog({
      to,
      subject,
      body,
      sentAt: new Date().toISOString(),
      delivered: true,
    });
    return true;
  } catch (e) {
    await appendLog({
      to,
      subject,
      body,
      sentAt: new Date().toISOString(),
      delivered: false,
      error: e instanceof Error ? e.message : "Send failed",
    });
    return false;
  }
}

export const EMAIL_PLACEHOLDERS = [
  "{name}",
  "{service}",
  "{price}",
  "{barber}",
  "{date}",
  "{time}",
  "{phone}",
  "{email}",
  "{business}",
  "{address}",
  "{city}",
  "{manage_url}",
] as const;

async function renderTemplate(
  tpl: EmailTemplate,
  lang: "en" | "el",
  b: Booking
): Promise<{ subject: string; body: string }> {
  const biz = await loadBusiness();
  const subject = lang === "el" ? tpl.subject_el : tpl.subject_en;
  let body = lang === "el" ? tpl.body_el : tpl.body_en;
  const token = await signBookingId(b.id);
  const manageUrl = `${SITE_URL}/b/${encodeURIComponent(b.id)}?t=${token}`;

  // Auto-append the manage-booking line when the template doesn't include
  // {manage_url} (so older installs with stored templates still benefit).
  if (!body.includes("{manage_url}")) {
    const trailer = lang === "el"
      ? `\n\nΑκύρωση ή αλλαγή: {manage_url}`
      : `\n\nCancel or reschedule: {manage_url}`;
    body = body + trailer;
  }

  const vars: Record<string, string> = {
    "{name}": b.name,
    "{service}": b.serviceName,
    "{price}": String(b.price),
    "{barber}": b.barberName,
    "{date}": b.date,
    "{time}": b.time,
    "{phone}": biz.phone,
    "{email}": biz.email,
    "{business}": biz.name,
    "{address}": biz.streetAddress,
    "{city}": biz.city,
    "{manage_url}": manageUrl,
  };
  const apply = (s: string) =>
    Object.entries(vars).reduce(
      (acc, [k, v]) => acc.split(k).join(v),
      s
    );
  return { subject: apply(subject), body: apply(body) };
}

/**
 * Public helper — used by the booking flow success screen when it wants to
 * show the client the "your self-service link" URL without opening the email.
 */
export async function manageBookingUrl(id: string): Promise<string> {
  const token = await signBookingId(id);
  return `${SITE_URL}/b/${encodeURIComponent(id)}?t=${token}`;
}

export async function sendBookingConfirmation(b: Booking) {
  const lang = b.lang === "el" ? "el" : "en";
  const { confirmation } = await loadTemplates();
  const { subject, body } = await renderTemplate(confirmation, lang, b);
  return sendOne(b.email, subject, body);
}

export async function sendBookingReminder(b: Booking) {
  const lang = b.lang === "el" ? "el" : "en";
  const { reminder } = await loadTemplates();
  const { subject, body } = await renderTemplate(reminder, lang, b);
  return sendOne(b.email, subject, body);
}

/**
 * Post-visit review request. Asks the client to leave a Google review
 * (or any link the business sets via NEXT_PUBLIC_REVIEW_URL / Settings in
 * future). Sent 2–24h after a completed booking.
 */
function safeUrl(u: string | undefined | null): string | null {
  if (!u) return null;
  const trimmed = u.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export async function sendReviewRequest(b: Booking) {
  const biz = await loadBusiness();
  const lang = b.lang === "el" ? "el" : "en";
  const brand = biz.name || "Oakline";
  const reviewUrl =
    safeUrl((biz as { reviewUrl?: string }).reviewUrl) ||
    safeUrl(process.env.NEXT_PUBLIC_REVIEW_URL) ||
    `https://www.google.com/search?q=${encodeURIComponent(brand + " " + (biz.city || "") + " reviews")}`;

  const subject = lang === "el"
    ? `${brand} — πώς σου φάνηκε;`
    : `${brand} — how did we do?`;

  const body = lang === "el"
    ? `Γεια σου ${b.name},\n\nΕυχαριστούμε που μας εμπιστεύτηκες. Αν σου άρεσε η εμπειρία, μια σύντομη κριτική μας βοηθά πολύ:\n\n${reviewUrl}\n\nΤα λέμε σύντομα,\n${brand}`
    : `Hi ${b.name},\n\nThanks for sitting in the chair with us. If you enjoyed it, a quick review means a lot:\n\n${reviewUrl}\n\nSee you soon,\n${brand}`;

  return sendOne(b.email, subject, body);
}
