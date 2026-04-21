'use client';

import { useAuth } from '@clerk/nextjs';
import UpChunk from '@mux/upchunk';
import { TRADES, type Trade } from '@toolbox/shared';
import { Button } from '@toolbox/ui-web';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { api } from '@/lib/api';

export function UploadForm() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [hashtagsInput, setHashtagsInput] = useState('');
  const [trade, setTrade] = useState<Trade | ''>('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setError('Pick a file first');
    setError(null);
    setUploading(true);

    const hashtags = hashtagsInput
      .split(/[\s,]+/)
      .map((h) => h.replace(/^#/, '').trim())
      .filter(Boolean);

    const token = await getToken();
    const res = await api<{ uploadUrl: string; videoId: string }>('/v1/videos/upload', {
      method: 'POST',
      token,
      body: {
        caption: caption || undefined,
        hashtags,
        trade: trade || undefined,
      },
    });
    if (!res.ok) {
      setUploading(false);
      return setError(res.error.message);
    }

    const upload = UpChunk.createUpload({ endpoint: res.data.uploadUrl, file, chunkSize: 5120 });
    upload.on('progress', (ev: { detail: number }) => setProgress(Math.round(ev.detail)));
    upload.on('error', (ev: { detail: string }) => {
      setUploading(false);
      setError(ev.detail);
    });
    upload.on('success', () => {
      setUploading(false);
      router.push(`/v/${res.data.videoId}`);
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-text-secondary">Video file (mp4 / mov)</span>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="rounded-md border border-border-default bg-surface-1 p-3 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-text-secondary">Caption</span>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={500}
          className="min-h-24 rounded-md border border-border-default bg-surface-1 px-3 py-2 text-base focus:border-accent-primary focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-text-secondary">Hashtags</span>
        <input
          value={hashtagsInput}
          onChange={(e) => setHashtagsInput(e.target.value)}
          placeholder="#plumbing #athens"
          className="h-12 rounded-md border border-border-default bg-surface-1 px-3 focus:border-accent-primary focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-text-secondary">Trade (optional)</span>
        <select
          value={trade}
          onChange={(e) => setTrade(e.target.value as Trade)}
          className="h-12 rounded-md border border-border-default bg-surface-1 px-3"
        >
          <option value="">—</option>
          {TRADES.map((t) => (
            <option key={t} value={t}>
              {t.toLowerCase().replace('_', ' ')}
            </option>
          ))}
        </select>
      </label>

      {uploading && (
        <div className="flex flex-col gap-1">
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full bg-accent-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-xs text-text-tertiary">{progress}% uploaded</span>
        </div>
      )}

      {error && <p className="text-sm text-semantic-danger">{error}</p>}

      <Button type="submit" loading={uploading} disabled={!file}>
        Post
      </Button>
    </form>
  );
}
