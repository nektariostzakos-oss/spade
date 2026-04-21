"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { INDUSTRY_PRESETS } from "../../lib/industryPresets";

export default function SetupForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");

  const [industry, setIndustry] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("GR");
  const [phone, setPhone] = useState("");
  const [brandDescription, setBrandDescription] = useState("");
  const [tone, setTone] = useState("warm, professional");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [unsplashKey, setUnsplashKey] = useState("");

  const industryLabel =
    INDUSTRY_PRESETS.find((p) => p.id === industry)?.label || "";

  const canNext1 = !!industry;
  const canNext2 =
    businessName.trim().length > 0 && city.trim().length > 0;
  const canNext3 = brandDescription.trim().length > 20;
  const canSubmit =
    adminEmail.includes("@") &&
    adminPassword.length >= 8 &&
    anthropicKey.trim().startsWith("sk-ant-");

  async function submit() {
    setSubmitting(true);
    setError(null);
    setProgress("Calling Claude — this takes 30-90 seconds…");
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          businessName,
          industry,
          industryLabel,
          city,
          country,
          phone,
          brandDescription,
          tone,
          adminEmail,
          adminPassword,
          anthropicKey,
          unsplashKey: unsplashKey.trim() || undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Setup failed");
      setProgress("Done. Redirecting to your site…");
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Setup failed");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen px-4 py-12"
      style={{ background: "#0a0806", color: "#f5efe6" }}
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.3em]" style={{ color: "#c9a961" }}>
            Welcome · Set up your site
          </p>
          <h1 className="font-serif text-4xl">Tell us about your business</h1>
          <p className="mt-2 text-sm text-white/50">
            We&apos;ll build your site in about a minute — copy, colors, and
            photos, all tailored to you.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className="h-1.5 w-10 rounded-full transition-colors"
              style={{
                background: n <= step ? "#c9a961" : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
          {step === 1 && (
            <>
              <h2 className="mb-1 font-serif text-2xl">What kind of business?</h2>
              <p className="mb-6 text-sm text-white/55">
                This shapes the colors, the copy style, and what services we seed.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {INDUSTRY_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setIndustry(p.id)}
                    className="rounded-xl border p-4 text-left transition-colors"
                    style={{
                      borderColor:
                        industry === p.id ? "#c9a961" : "rgba(255,255,255,0.1)",
                      background:
                        industry === p.id ? "rgba(201,169,97,0.1)" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <p className="text-sm font-semibold">{p.label}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="mb-1 font-serif text-2xl">The basics</h2>
              <p className="mb-6 text-sm text-white/55">
                Used on the footer, contact page, and Google structured data.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <L label="Business name *">
                  <I value={businessName} onChange={setBusinessName} placeholder="e.g. Athena Studio" />
                </L>
                <L label="Phone">
                  <I value={phone} onChange={setPhone} placeholder="+30 …" />
                </L>
                <L label="City *">
                  <I value={city} onChange={setCity} placeholder="Loutraki" />
                </L>
                <L label="Country (ISO)">
                  <I value={country} onChange={setCountry} placeholder="GR" />
                </L>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="mb-1 font-serif text-2xl">Your brand, in your words</h2>
              <p className="mb-6 text-sm text-white/55">
                The more specific, the better — 2-3 sentences. Who you are, how
                you work, what makes you different.
              </p>
              <L label="Brand description *">
                <textarea
                  value={brandDescription}
                  onChange={(e) => setBrandDescription(e.target.value)}
                  rows={5}
                  placeholder="e.g. We're a third-generation barbershop in Loutraki. Old-school haircuts, fresh fades, strong coffee. No rush, no upsell."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder-white/30 outline-none focus:border-white/40"
                  style={{ color: "#f5efe6" }}
                />
              </L>
              <div className="mt-4">
                <L label="Tone">
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    style={{ colorScheme: "dark" }}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-[#14110d] px-4 py-3 text-sm text-white"
                  >
                    <option>warm, professional</option>
                    <option>casual, friendly</option>
                    <option>premium, understated</option>
                    <option>energetic, bold</option>
                    <option>traditional, respectful</option>
                    <option>modern, minimal</option>
                    <option>playful, fun</option>
                  </select>
                </L>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="mb-1 font-serif text-2xl">Admin account & AI keys</h2>
              <p className="mb-6 text-sm text-white/55">
                Your login for editing the site later. And the keys we&apos;ll
                use to generate content + fetch photos.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <L label="Your email *">
                  <I
                    type="email"
                    value={adminEmail}
                    onChange={setAdminEmail}
                    placeholder="you@yourdomain.com"
                  />
                </L>
                <L label="Choose a password * (8+ chars)">
                  <I
                    type="password"
                    value={adminPassword}
                    onChange={setAdminPassword}
                    placeholder="at least 8 characters"
                  />
                </L>
              </div>

              <div className="mt-4">
                <L label="Anthropic API key * (sk-ant-…)">
                  <I
                    type="password"
                    value={anthropicKey}
                    onChange={setAnthropicKey}
                    placeholder="sk-ant-api03-..."
                  />
                </L>
                <p className="mt-2 text-xs text-white/40">
                  Get yours at console.anthropic.com. One generation costs
                  about $0.05-0.15.
                </p>
              </div>

              <div className="mt-4">
                <L label="Unsplash Access Key (optional)">
                  <I
                    type="password"
                    value={unsplashKey}
                    onChange={setUnsplashKey}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </L>
                <p className="mt-2 text-xs text-white/40">
                  Free at unsplash.com/developers. With it we fetch 11 real
                  photos tailored to your business. Without it the site still
                  generates, but uses color placeholders.
                </p>
              </div>
            </>
          )}

          {error && (
            <p className="mt-6 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </p>
          )}
          {submitting && progress && (
            <p className="mt-6 rounded-lg border border-[#c9a961]/40 bg-[#c9a961]/10 p-3 text-sm" style={{ color: "#c9a961" }}>
              {progress}
            </p>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep((step - 1) as 1 | 2 | 3 | 4)}
              disabled={step === 1 || submitting}
              className="text-xs uppercase tracking-widest text-white/50 hover:text-white disabled:opacity-30"
            >
              Back
            </button>
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as 1 | 2 | 3 | 4)}
                disabled={
                  (step === 1 && !canNext1) ||
                  (step === 2 && !canNext2) ||
                  (step === 3 && !canNext3)
                }
                className="rounded-full px-7 py-3 text-xs font-semibold uppercase tracking-widest text-black transition-opacity disabled:opacity-40"
                style={{ background: "#c9a961" }}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit || submitting}
                className="rounded-full px-7 py-3 text-xs font-semibold uppercase tracking-widest text-black transition-opacity disabled:opacity-40"
                style={{ background: "#c9a961" }}
              >
                {submitting ? "Building your site…" : "Generate my site"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-widest text-white/40">
        {label}
      </span>
      {children}
    </label>
  );
}

function I({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder-white/30 outline-none focus:border-white/40"
      style={{ color: "#f5efe6" }}
    />
  );
}
