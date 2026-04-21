"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Smtp = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: "tls" | "ssl" | "none";
};

const EMPTY: Smtp = {
  host: "",
  port: 587,
  user: "",
  pass: "",
  from: "",
  secure: "tls",
};

const PRESETS: { label: string; smtp: Partial<Smtp>; help: string }[] = [
  {
    label: "Gmail / Google Workspace",
    smtp: { host: "smtp.gmail.com", port: 587, secure: "tls" },
    help: "Use a 16-character App Password as the password (not your real Google password). Create one at myaccount.google.com → Security → App passwords.",
  },
  {
    label: "Brevo (Sendinblue)",
    smtp: { host: "smtp-relay.brevo.com", port: 587, secure: "tls" },
    help: "Username = your Brevo login email. Password = your SMTP key from app.brevo.com → SMTP & API.",
  },
  {
    label: "Mailgun",
    smtp: { host: "smtp.mailgun.org", port: 587, secure: "tls" },
    help: "Username + password from your domain's SMTP credentials in app.mailgun.com.",
  },
  {
    label: "SendGrid",
    smtp: { host: "smtp.sendgrid.net", port: 587, secure: "tls" },
    help: "Username is the literal word 'apikey'. Password is the API key you generate in SendGrid.",
  },
  {
    label: "Office 365 / Outlook",
    smtp: { host: "smtp.office365.com", port: 587, secure: "tls" },
    help: "Use your Microsoft 365 account email + password. SMTP AUTH must be enabled for the user in the Microsoft admin center.",
  },
];

export default function SettingsPanel() {
  const [smtp, setSmtp] = useState<Smtp>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [help, setHelp] = useState<string>("");
  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings?.smtp) setSmtp({ ...EMPTY, ...d.settings.smtp });
        setLoading(false);
      });
  }, []);

  function applyPreset(label: string) {
    const p = PRESETS.find((x) => x.label === label);
    if (!p) return;
    setSmtp((s) => ({ ...s, ...p.smtp }));
    setHelp(p.help);
  }

  async function save() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ smtp }),
    });
    setSaving(false);
    setSavedAt(new Date().toLocaleTimeString());
    setTimeout(() => setSavedAt(null), 4000);
  }

  async function sendTest() {
    if (!testTo) return;
    setTesting(true);
    setTestResult(null);
    // Save first so the test uses what's in the form right now.
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ smtp }),
    });
    const res = await fetch("/api/settings/test-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ to: testTo }),
    });
    const d = await res.json();
    setTestResult({
      ok: res.ok,
      msg: res.ok ? "Test email sent. Check your inbox." : d.error || "Failed",
    });
    setTesting(false);
  }

  if (loading) {
    return (
      <p className="text-white/40">Loading…</p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
        <h2 className="mb-1 font-serif text-2xl">Email delivery (SMTP)</h2>
        <p className="mb-6 text-sm text-white/55">
          Pick your provider, paste the credentials, save. Confirmation +
          8-hour reminder emails will start going out from your account.
        </p>

        <label className="mb-2 block text-xs uppercase tracking-widest text-white/40">
          Provider preset
        </label>
        <select
          onChange={(e) => applyPreset(e.target.value)}
          defaultValue=""
          style={{ colorScheme: "dark" }}
          className="appearance-none rounded-xl border border-white/10 bg-[#14110d] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22 viewBox=%220 0 10 6%22><path fill=%22%23c9a961%22 d=%22M0 0l5 6 5-6z%22/></svg>')] bg-[length:10px_6px] bg-[position:right_14px_center] bg-no-repeat px-4 py-3 pr-9 text-sm text-white outline-none focus:border-white/40"
        >
          <option value="" disabled>
            Pick a provider…
          </option>
          {PRESETS.map((p) => (
            <option key={p.label} value={p.label}>
              {p.label}
            </option>
          ))}
        </select>

        <AnimatePresence>
          {help && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden rounded-lg border border-[#c9a961]/30 bg-[#c9a961]/5 p-3 text-sm text-[#c9a961]"
            >
              {help}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field
            label="Host"
            value={smtp.host}
            onChange={(v) => setSmtp({ ...smtp, host: v })}
            placeholder="smtp.gmail.com"
          />
          <Field
            label="Port"
            type="number"
            value={String(smtp.port)}
            onChange={(v) => setSmtp({ ...smtp, port: Number(v) || 587 })}
          />
          <Field
            label="Username"
            value={smtp.user}
            onChange={(v) => setSmtp({ ...smtp, user: v })}
            placeholder="hello@spade.gr"
          />
          <Field
            label="Password / API key"
            type="password"
            value={smtp.pass}
            onChange={(v) => setSmtp({ ...smtp, pass: v })}
          />
          <Field
            label="From address"
            value={smtp.from}
            onChange={(v) => setSmtp({ ...smtp, from: v })}
            placeholder='Spade Barber <hello@spade.gr>'
          />
          <div>
            <label className="mb-2 block text-xs uppercase tracking-widest text-white/40">
              Encryption
            </label>
            <select
              value={smtp.secure}
              onChange={(e) =>
                setSmtp({ ...smtp, secure: e.target.value as Smtp["secure"] })
              }
              style={{ colorScheme: "dark" }}
              className="w-full appearance-none rounded-xl border border-white/10 bg-[#14110d] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22 viewBox=%220 0 10 6%22><path fill=%22%23c9a961%22 d=%22M0 0l5 6 5-6z%22/></svg>')] bg-[length:10px_6px] bg-[position:right_14px_center] bg-no-repeat px-4 py-3 pr-9 text-sm text-white outline-none focus:border-white/40"
            >
              <option value="tls">TLS / STARTTLS (port 587)</option>
              <option value="ssl">SSL (port 465)</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-full bg-[#c9a961] px-7 py-3 text-xs font-semibold uppercase tracking-widest text-black disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
          {savedAt && (
            <span className="text-xs text-emerald-300">
              Saved at {savedAt}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
        <h2 className="mb-1 font-serif text-2xl">Send a test email</h2>
        <p className="mb-6 text-sm text-white/55">
          Saves your settings first, then sends a tiny "it works" message.
        </p>
        <Field
          label="Send to"
          value={testTo}
          onChange={setTestTo}
          placeholder="you@example.com"
        />
        <button
          onClick={sendTest}
          disabled={testing || !testTo}
          className="mt-4 rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white disabled:opacity-40"
        >
          {testing ? "Sending…" : "Send test"}
        </button>

        {testResult && (
          <p
            className={`mt-4 rounded-lg border p-3 text-sm ${
              testResult.ok
                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                : "border-red-400/40 bg-red-500/10 text-red-200"
            }`}
          >
            {testResult.msg}
          </p>
        )}

        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-white/55">
          <p className="mb-2 uppercase tracking-widest text-white/40">
            What gets sent automatically
          </p>
          <ul className="space-y-1.5">
            <li>· Booking confirmation when a customer completes the form</li>
            <li>· Reminder email 8 hours before each appointment</li>
            <li>· Bulk emails you trigger from the "Bulk email" tab</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-widest text-white/40">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/40"
      />
    </div>
  );
}
