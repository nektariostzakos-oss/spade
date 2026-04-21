import nodemailer from "nodemailer";
import { promises as fs } from "fs";
import path from "path";
import type { Booking } from "./bookings";
import { loadSmtp, smtpReady } from "./settings";

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
  return s.from || `Spade Barber <${s.user || "hello@spade.gr"}>`;
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

export async function sendBookingConfirmation(b: Booking) {
  const lang = b.lang === "el" ? "el" : "en";
  const subject =
    lang === "el"
      ? "Spade Barber — το ραντεβού σας επιβεβαιώθηκε"
      : "Spade Barber — your booking is confirmed";
  const body =
    lang === "el"
      ? `Γεια σου ${b.name},\n\nΤο ραντεβού σου επιβεβαιώθηκε:\n\n· ${b.serviceName} (€${b.price})\n· Με τον/την ${b.barberName}\n· Στις ${b.date} και ώρα ${b.time}\n\nΘα σου στείλουμε υπενθύμιση 8 ώρες πριν. Αν χρειαστεί να αλλάξεις ή να ακυρώσεις, απάντησε σε αυτό το email ή πάρε μας τηλέφωνο.\n\nΘα σε δούμε σύντομα,\nSpade Barber, Λουτράκι`
      : `Hi ${b.name},\n\nYour booking is confirmed:\n\n· ${b.serviceName} (€${b.price})\n· With ${b.barberName}\n· On ${b.date} at ${b.time}\n\nWe'll send a reminder 8 hours before. Need to reschedule or cancel? Reply to this email or give us a call.\n\nSee you soon,\nSpade Barber, Loutraki`;
  return sendOne(b.email, subject, body);
}

export async function sendBookingReminder(b: Booking) {
  const lang = b.lang === "el" ? "el" : "en";
  const subject =
    lang === "el"
      ? "Υπενθύμιση · Το ραντεβού σου στο Spade σε 8 ώρες"
      : "Reminder · Your Spade appointment in 8 hours";
  const body =
    lang === "el"
      ? `Γεια σου ${b.name},\n\nΥπενθύμιση: το ραντεβού σου στο Spade Barber είναι σε περίπου 8 ώρες.\n\n· ${b.serviceName}\n· Με τον/την ${b.barberName}\n· ${b.date} στις ${b.time}\n\nΑν χρειαστεί να αλλάξεις ή να ακυρώσεις, απάντησε σε αυτό το email ή πάρε μας τηλέφωνο στο +30 27440 00000.\n\nΤα λέμε σύντομα,\nSpade Barber · Λουτράκι`
      : `Hi ${b.name},\n\nA quick reminder — your Spade Barber appointment is in about 8 hours.\n\n· ${b.serviceName}\n· With ${b.barberName}\n· ${b.date} at ${b.time}\n\nNeed to reschedule or cancel? Just reply to this email or call us at +30 27440 00000.\n\nSee you soon,\nSpade Barber · Loutraki`;
  return sendOne(b.email, subject, body);
}
