import { promises as fs } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "settings.json");

export type SmtpSettings = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: "tls" | "ssl" | "none";
};

export type AppSettings = {
  smtp?: SmtpSettings;
};

const DEFAULTS: AppSettings = {
  smtp: { host: "", port: 587, user: "", pass: "", from: "", secure: "tls" },
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    const parsed = JSON.parse(raw) as AppSettings;
    return { ...DEFAULTS, ...parsed, smtp: { ...DEFAULTS.smtp!, ...(parsed.smtp ?? {}) } };
  } catch {
    return DEFAULTS;
  }
}

export async function saveSettings(next: AppSettings): Promise<AppSettings> {
  const merged = { ...(await loadSettings()), ...next };
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(merged, null, 2), "utf-8");
  return merged;
}

export async function loadSmtp(): Promise<SmtpSettings> {
  const s = await loadSettings();
  // Settings file wins over env vars; env vars are a fallback for ops setups.
  const fromFile = s.smtp;
  if (fromFile && fromFile.host) return fromFile;
  return {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.SMTP_FROM ?? "",
    secure: (process.env.SMTP_SECURE as SmtpSettings["secure"]) ?? "tls",
  };
}

export async function smtpReady(): Promise<boolean> {
  const s = await loadSmtp();
  return !!(s.host && s.user && s.pass);
}
