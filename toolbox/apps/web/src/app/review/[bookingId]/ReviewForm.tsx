'use client';

import { useAuth } from '@clerk/nextjs';
import { Button } from '@toolbox/ui-web';
import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [stars, setStars] = useState(5);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = await getToken();
    const res = await api('/v1/reviews', {
      method: 'POST',
      token,
      body: { bookingId, stars, text: text || undefined },
    });
    setSubmitting(false);
    if (!res.ok) return setErr(res.error.message);
    router.push('/');
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => setStars(n)}
            className="min-h-tap min-w-tap"
          >
            <Star
              size={40}
              strokeWidth={1.5}
              color="#FFC107"
              fill={n <= stars ? '#FFC107' : 'transparent'}
            />
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={2000}
        placeholder="What went well?"
        className="min-h-32 rounded-md border border-border-default bg-surface-1 px-3 py-2 text-base focus:border-accent-primary focus:outline-none"
      />
      {err && <p className="text-sm text-semantic-danger">{err}</p>}
      <Button type="submit" loading={submitting}>
        Submit review
      </Button>
    </form>
  );
}
