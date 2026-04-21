'use client';

import { useAuth } from '@clerk/nextjs';
import { TRADES, URGENCY, type Trade, type Urgency } from '@toolbox/shared';
import { Button } from '@toolbox/ui-web';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';

export function QuoteForm() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [description, setDescription] = useState('');
  const [trade, setTrade] = useState<Trade | ''>('');
  const [urgency, setUrgency] = useState<Urgency>('MED');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    const token = await getToken();
    const res = await api<{ id: string; leadsCreated: number }>('/v1/jobs', {
      method: 'POST',
      token,
      body: {
        description,
        photos: [],
        trade: trade || null,
        urgency,
        locationLat: Number(lat),
        locationLng: Number(lng),
        address: address || null,
      },
    });
    setSubmitting(false);
    if (!res.ok) return setErr(res.error.message);
    router.push(`/jobs/${res.data.id}`);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-text-secondary">Describe the job</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minLength={10}
          maxLength={2000}
          required
          className="min-h-40 rounded-md border border-border-default bg-surface-1 px-3 py-2 text-base focus:border-accent-primary focus:outline-none"
          placeholder="Kitchen sink is leaking under the cabinet, started yesterday, getting worse."
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-text-secondary">Trade (optional)</span>
        <select
          value={trade}
          onChange={(e) => setTrade(e.target.value as Trade)}
          className="h-12 rounded-md border border-border-default bg-surface-1 px-3"
        >
          <option value="">Let us decide</option>
          {TRADES.map((t) => (
            <option key={t} value={t}>
              {t.toLowerCase().replace('_', ' ')}
            </option>
          ))}
        </select>
      </label>
      <div>
        <span className="mb-2 block text-sm text-text-secondary">How urgent?</span>
        <div className="flex gap-2">
          {URGENCY.map((u) => (
            <button
              type="button"
              key={u}
              onClick={() => setUrgency(u)}
              className={`min-h-tap flex-1 rounded-md border text-sm font-bold uppercase ${
                urgency === u
                  ? 'border-accent-primary bg-accent-primary text-text-inverse'
                  : 'border-border-default text-text-secondary'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-text-secondary">Address (optional)</span>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="h-12 rounded-md border border-border-default bg-surface-1 px-3"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Lat" value={lat} onChange={setLat} />
        <Field label="Lng" value={lng} onChange={setLng} />
      </div>
      {err && <p className="text-sm text-semantic-danger">{err}</p>}
      <Button type="submit" loading={submitting}>
        Find pros
      </Button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-text-secondary">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type="number"
        step="any"
        required
        className="h-12 rounded-md border border-border-default bg-surface-1 px-3"
      />
    </label>
  );
}
