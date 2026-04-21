'use client';

import { useAuth } from '@clerk/nextjs';
import { TRADES, proOnboardingInput, type Trade } from '@toolbox/shared';
import { Button } from '@toolbox/ui-web';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';

export function OnboardingForm() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleTrade = (t: Trade) =>
    setTrades((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const form = new FormData(e.currentTarget);
    const parsed = proOnboardingInput.safeParse({
      businessName: form.get('businessName'),
      trades,
      serviceRadiusKm: Number(form.get('serviceRadiusKm') ?? 25),
      locationLat: Number(form.get('locationLat')),
      locationLng: Number(form.get('locationLng')),
      city: form.get('city'),
      country: form.get('country') ?? 'US',
      bio: form.get('bio') || undefined,
      licenseNumber: form.get('licenseNumber') || undefined,
      licenseState: form.get('licenseState') || undefined,
    });
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message ?? 'Invalid form');
      return;
    }
    setSubmitting(true);
    const token = await getToken();
    const res = await api('/v1/pros/onboard', {
      method: 'POST',
      body: parsed.data,
      token,
    });
    setSubmitting(false);
    if (!res.ok) {
      setErrorMsg(res.error.message);
      return;
    }
    router.push('/onboarding/pending');
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Field label="Business name" name="businessName" required maxLength={120} />
      <div>
        <label className="mb-2 block text-sm text-text-secondary">Trades (pick at least one)</label>
        <div className="flex flex-wrap gap-2">
          {TRADES.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => toggleTrade(t)}
              className={`rounded-md border px-3 py-2 text-sm transition ${
                trades.includes(t)
                  ? 'border-accent-primary bg-accent-primary text-text-inverse'
                  : 'border-border-default text-text-secondary hover:border-border-strong'
              }`}
            >
              {t.toLowerCase().replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
      <Field label="City" name="city" required maxLength={120} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Lat" name="locationLat" type="number" step="any" required />
        <Field label="Lng" name="locationLng" type="number" step="any" required />
      </div>
      <Field
        label="Service radius (km)"
        name="serviceRadiusKm"
        type="number"
        min={1}
        max={200}
        defaultValue={25}
      />
      <Field label="Country" name="country" defaultValue="US" maxLength={2} />
      <Field label="License #" name="licenseNumber" />
      <Field label="License state" name="licenseState" />
      <Field label="Short bio" name="bio" as="textarea" maxLength={500} />

      {errorMsg && <p className="text-sm text-semantic-danger">{errorMsg}</p>}
      <Button type="submit" loading={submitting} className="mt-2">
        Submit for verification
      </Button>
    </form>
  );
}

function Field({
  label,
  as = 'input',
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; as?: 'input' | 'textarea' }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-text-secondary">{label}</span>
      {as === 'textarea' ? (
        <textarea
          {...(rest as unknown as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          className="min-h-24 rounded-md border border-border-default bg-surface-1 px-3 py-2 text-base text-text-primary outline-none focus:border-accent-primary"
        />
      ) : (
        <input
          {...rest}
          className="h-12 rounded-md border border-border-default bg-surface-1 px-3 text-base text-text-primary outline-none focus:border-accent-primary"
        />
      )}
    </label>
  );
}
