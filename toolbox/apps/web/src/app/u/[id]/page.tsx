import { api } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

interface ProfileResponse {
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    bio: string | null;
    city: string | null;
    role: string;
    proProfile: {
      businessName: string;
      trades: string[];
      ratingAvg: number;
      ratingCount: number;
      licenseStatus: string;
      insuranceStatus: string;
    } | null;
  };
  videos: Array<{ id: string; thumbnailUrl: string | null; caption: string | null }>;
  reviews: Array<{ id: string; stars: number; text: string | null; createdAt: string }>;
  followerCount: number;
}

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const res = await api<ProfileResponse>(`/v1/users/${id}`);
  if (!res.ok) notFound();
  const { user, videos, reviews, followerCount } = res.data;
  const verified =
    user.proProfile?.licenseStatus === 'VERIFIED' &&
    user.proProfile?.insuranceStatus === 'VERIFIED';

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex items-center gap-4">
        {user.avatarUrl && (
          <Image
            src={user.avatarUrl}
            alt={user.displayName}
            width={80}
            height={80}
            className="h-20 w-20 rounded-full"
          />
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              {user.proProfile?.businessName ?? user.displayName}
            </h1>
            {verified && (
              <span className="rounded-full bg-semantic-verified px-2 py-0.5 text-xs font-bold uppercase text-text-inverse">
                Verified Pro
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary">
            {user.city ?? ''} · {followerCount} followers
            {user.proProfile ? ` · ★ ${user.proProfile.ratingAvg.toFixed(1)} (${user.proProfile.ratingCount})` : ''}
          </p>
          {user.bio && <p className="mt-1 text-sm text-text-primary">{user.bio}</p>}
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-text-secondary">
          Videos
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {videos.map((v) => (
            <Link
              key={v.id}
              href={`/v/${v.id}`}
              className="relative aspect-[9/16] overflow-hidden rounded-md bg-black"
            >
              {v.thumbnailUrl && (
                <Image src={v.thumbnailUrl} alt="" fill className="object-cover" sizes="33vw" />
              )}
            </Link>
          ))}
        </div>
      </section>

      {reviews.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-text-secondary">
            Reviews
          </h2>
          <div className="flex flex-col gap-2">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-md border border-border-subtle bg-surface-1 p-4">
                <p className="text-accent-primary">{'★'.repeat(r.stars)}</p>
                {r.text && <p className="mt-1 text-sm text-text-primary">{r.text}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
