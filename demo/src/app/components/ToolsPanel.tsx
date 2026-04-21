"use client";

import { useEffect, useRef, useState } from "react";

type AuditEntry = {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  target: string;
  createdAt: string;
};

type Holiday = { id: string; date: string; label: string; recurring: boolean };

export default function ToolsPanel() {
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holForm, setHolForm] = useState({ date: "", label: "", recurring: false });
  const [gdprId, setGdprId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const [a, h] = await Promise.all([
      fetch("/api/audit").then((r) => r.ok ? r.json() : { entries: [] }),
      fetch("/api/holidays").then((r) => r.ok ? r.json() : { holidays: [] }),
    ]);
    setAudit(a.entries ?? []);
    setHolidays(h.holidays ?? []);
  }
  useEffect(() => { load(); }, []);

  async function addHoliday() {
    if (!holForm.date) return;
    await fetch("/api/holidays", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(holForm) });
    setHolForm({ date: "", label: "", recurring: false });
    load();
  }
  async function removeHoliday(id: string) {
    await fetch(`/api/holidays?id=${id}`, { method: "DELETE" });
    load();
  }

  async function downloadBackup() {
    window.location.href = "/api/backup";
  }
  async function restoreBackup(file: File) {
    setMsg("Restoring…");
    const text = await file.text();
    const r = await fetch("/api/backup", { method: "POST", headers: { "content-type": "application/json" }, body: text });
    const d = await r.json();
    setMsg(r.ok ? `Restored ${d.restored} files.` : d.error || "Restore failed.");
  }

  async function exportGdpr() {
    if (!gdprId) return;
    window.location.href = `/api/gdpr?id=${encodeURIComponent(gdprId)}`;
  }
  async function deleteGdpr() {
    if (!gdprId) return;
    if (!confirm(`Redact all personal data matching "${gdprId}"? This is irreversible.`)) return;
    const r = await fetch(`/api/gdpr?id=${encodeURIComponent(gdprId)}`, { method: "DELETE" });
    const d = await r.json();
    setMsg(r.ok ? `Redacted: ${d.redacted.bookings}b / ${d.redacted.orders}o / ${d.redacted.clients}c.` : d.error || "Failed.");
  }

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl">Tools</h2>

      {msg && <div className="rounded-xl border border-white/15 bg-white/[0.04] p-3 text-sm text-white/80">{msg}</div>}

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/70">Backup & restore</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={downloadBackup} className="rounded-full bg-[#c9a961] px-5 py-2 text-xs font-semibold uppercase tracking-widest text-black">Download backup</button>
          <input ref={fileRef} type="file" accept=".json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) restoreBackup(f); e.target.value = ""; }} />
          <button onClick={() => fileRef.current?.click()} className="rounded-full border border-white/15 px-5 py-2 text-xs uppercase tracking-widest text-white/70">Restore from file</button>
        </div>
        <p className="mt-2 text-xs text-white/40">Snapshot includes bookings, orders, products, users, settings, content, clients, coupons, reviews, pages, waitlist, services, staff, holidays.</p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/70">Holidays & closures</h3>
        <div className="mb-3 grid gap-2 sm:grid-cols-[160px_1fr_auto_auto]">
          <input type="date" value={holForm.date} onChange={(e) => setHolForm({ ...holForm, date: e.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm" style={{ colorScheme: "dark" }} />
          <input placeholder="Label (e.g. Christmas)" value={holForm.label} onChange={(e) => setHolForm({ ...holForm, label: e.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 px-2 text-sm">
            <input type="checkbox" checked={holForm.recurring} onChange={(e) => setHolForm({ ...holForm, recurring: e.target.checked })} />
            Yearly
          </label>
          <button onClick={addHoliday} className="rounded-full bg-[#c9a961] px-4 py-1 text-xs font-semibold uppercase tracking-widest text-black">Add</button>
        </div>
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {holidays.length === 0 ? <li className="py-3 text-white/40">No holidays set.</li> : holidays.map((h) => (
            <li key={h.id} className="flex items-center justify-between py-2 text-sm">
              <span>{h.date} · {h.label} {h.recurring && <span className="text-xs text-white/40">· yearly</span>}</span>
              <button onClick={() => removeHoliday(h.id)} className="rounded-full border border-red-400/40 px-3 py-1 text-[10px] uppercase tracking-widest text-red-300">Delete</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/70">GDPR · personal data</h3>
        <div className="flex flex-wrap gap-2">
          <input placeholder="email or phone" value={gdprId} onChange={(e) => setGdprId(e.target.value)} className="min-w-[260px] flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm" />
          <button onClick={exportGdpr} className="rounded-full border border-white/15 px-5 py-2 text-xs uppercase tracking-widest text-white/80">Export JSON</button>
          <button onClick={deleteGdpr} className="rounded-full border border-red-400/40 px-5 py-2 text-xs uppercase tracking-widest text-red-300">Redact</button>
        </div>
        <p className="mt-2 text-xs text-white/40">Redacts name, email, phone, address, notes across bookings, orders, clients.</p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/70">Audit log</h3>
        {audit.length === 0 ? <p className="text-white/40">No audit entries yet.</p> : (
          <ul className="max-h-96 divide-y divide-white/10 overflow-y-auto border-y border-white/10 text-sm">
            {audit.map((a) => (
              <li key={a.id} className="py-2">
                <div className="flex justify-between">
                  <span><span className="text-white/80">{a.userEmail}</span> <span className="text-[#c9a961]">{a.action}</span> <span className="text-white/60">{a.target}</span></span>
                  <span className="text-xs text-white/40">{new Date(a.createdAt).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
