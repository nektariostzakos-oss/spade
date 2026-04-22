"use client";

import { useEffect, useState } from "react";

type Status =
  | { state: "licensed"; payload: { id: string; tier: string; domain: string; email: string; issuedAt: string; expiresAt: string | null }; installedAt: string }
  | { state: "unlicensed"; reason: string; graceDaysLeft?: number; installedAt?: string };

export default function LicensePanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    const r = await fetch("/api/license", { cache: "no-store" });
    if (r.ok) setStatus(await r.json());
  }

  useEffect(() => { refresh(); }, []);

  async function activate() {
    setMsg(null);
    setBusy(true);
    try {
      const r = await fetch("/api/license", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) setMsg(d.error || "Activation failed.");
      else {
        setMsg("Activated.");
        setCode("");
        await refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  if (!status) return <p className="text-white/40">Loading…</p>;

  return (
    <div className="space-y-6">
      {status.state === "licensed" ? (
        <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/5 p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-300">Licensed</p>
          <h3 className="mt-2 font-serif text-2xl text-white">
            Activated ·{" "}
            <span className="text-emerald-300">{status.payload.tier.toUpperCase()}</span>
          </h3>
          <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
            <Row k="Licensed to" v={status.payload.email} />
            <Row k="Domain" v={status.payload.domain === "*" ? "Any" : status.payload.domain} />
            <Row k="Issued" v={new Date(status.payload.issuedAt).toLocaleDateString()} />
            <Row k="Expires" v={status.payload.expiresAt ? new Date(status.payload.expiresAt).toLocaleDateString() : "Never (perpetual)"} />
            <Row k="Licence ID" v={status.payload.id} mono />
            <Row k="Installed" v={new Date(status.installedAt).toLocaleDateString()} />
          </dl>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-500/5 p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300">Unlicensed</p>
          <h3 className="mt-2 font-serif text-2xl text-white">No activation code installed.</h3>
          <p className="mt-2 text-sm text-white/65">
            Atelier still runs fully. Activating removes the admin nag and records
            your purchase against this install.
            {typeof status.graceDaysLeft === "number" && status.graceDaysLeft > 0 && (
              <> You have <strong className="text-white">{status.graceDaysLeft} day{status.graceDaysLeft === 1 ? "" : "s"}</strong> left in your grace window.</>
            )}
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a961]">
          {status.state === "licensed" ? "Replace code" : "Activate"}
        </p>
        <p className="mt-2 text-xs text-white/55">
          Paste the code you received by email after purchase. The code is
          verified offline using an embedded public key — no network call,
          works on isolated networks.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="atl_xxxxxxxx.yyyyyyyy"
            className="flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 font-mono text-sm text-white placeholder-white/30 outline-none focus:border-[#c9a961]/60"
          />
          <button
            onClick={activate}
            disabled={!code.trim() || busy}
            className="rounded-full bg-[#c9a961] px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-black disabled:opacity-40"
          >
            {busy ? "Verifying…" : "Activate"}
          </button>
        </div>
        {msg && <p className="mt-3 text-xs text-white/70">{msg}</p>}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-xs text-white/55">
        <p className="mb-2 font-semibold text-white/75">Don&rsquo;t have a code?</p>
        <p>
          Buy Atelier once, own it forever. The activation code is perpetual
          and works offline. You can move it to a new host anytime — just paste
          the same code in the new install.
        </p>
      </div>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-white/45">{k}</dt>
      <dd className={`text-right ${mono ? "font-mono text-[11px]" : ""} text-white/80`}>{v}</dd>
    </div>
  );
}
