import { Button } from '@toolbox/ui-web';
import Link from 'next/link';

export default function LivePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-6 py-12">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-semantic-danger">Live</p>
        <h1 className="mt-1 text-3xl font-bold">Go live from the job site</h1>
        <p className="mt-2 text-text-secondary">
          Start a stream from the native app. Viewers join from /live/[id]. Subscription gated.
        </p>
      </header>
      <Link href="/dashboard">
        <Button variant="secondary">Back to dashboard</Button>
      </Link>
    </main>
  );
}
